"""
Flask Web App - Spam Email Classifier
Mode 1: Prediksi teks tunggal (NB + XGB via model pipeline)
Mode 2: Evaluasi batch CSV (Metode 1 PURE vs Metode 2 Domain Adaptation)
        Evaluasi dijalankan via subprocess agar CUDA bisa diinisialisasi
        di main thread subprocess (bukan Flask thread).
"""

import os
import sys
import io
import uuid
import json
import shutil
import tempfile
import subprocess
import threading
import pandas as pd
from flask import Flask, render_template, request, jsonify

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__, static_folder='static')
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024   # 100 MB

PYTHON_EXE = sys.executable
WORKER     = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'run_eval_worker.py')
ROOT_DIR   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORKER_CWD = ROOT_DIR

# Folder permanen untuk model hasil training (bukan temp)
SAVED_MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'saved_models')
os.makedirs(SAVED_MODELS_DIR, exist_ok=True)

# Verifikasi python exe adalah venv (bukan sistem)
_venv_python = os.path.join(ROOT_DIR, '.venv', 'Scripts', 'python.exe')
if os.path.exists(_venv_python):
    PYTHON_EXE = _venv_python

# ──────────────────────────────────────────
# HISTORY STORE (riwayat eksperimen)
# ──────────────────────────────────────────
import time as _time_mod
HISTORY_FILE       = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'experiment_history.json')
LAST_RESULT_FILE   = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'last_csv_result.json')
experiment_history : list = []
history_lock       = threading.Lock()

def _load_history():
    global experiment_history
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
                experiment_history = json.load(f)
            print(f"  [OK] Riwayat dimuat: {len(experiment_history)} entri")
            
            # Migration/enrichment for top10_chi2 if missing
            import tempfile
            jobs_temp_dir = os.path.join(tempfile.gettempdir(), 'spam_eval_jobs')
            updated = False
            for h in experiment_history:
                job_id = h.get('job_id')
                if not job_id: continue
                for mk in ['metode1', 'metode2']:
                    if h.get(mk) and 'top10_chi2' not in h[mk]:
                        result_path = os.path.join(jobs_temp_dir, job_id, 'result.json')
                        if os.path.exists(result_path):
                            try:
                                with open(result_path, 'r', encoding='utf-8') as rf:
                                    import re as _re
                                    raw = rf.read()
                                    raw = _re.sub(r':\s*NaN', ': null', raw)
                                    raw = _re.sub(r':\s*Infinity', ': null', raw)
                                    res_data = json.loads(raw)
                                    r_mk = res_data.get('result', {}).get(mk, {})
                                    if r_mk:
                                        h[mk]['top10_chi2'] = r_mk.get('top20_chi2', [])[:10]
                                        updated = True
                            except Exception:
                                pass
            if updated:
                _save_history()
        except Exception as e:
            print(f"  [ERROR] Gagal load history: {e}")
            experiment_history = []

def _save_history():
    try:
        with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(experiment_history, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"  [ERROR] Gagal simpan history: {e}")

_load_history()

# ──────────────────────────────────────────
# SINGLE-TEXT PIPELINE (Mode Teks) — lazy load di background
# ──────────────────────────────────────────
pipeline       = None
pipeline_ready = False
pipeline_error = None
pipeline_lock  = threading.Lock()

def _load_pipeline_bg():
    """Load model di background thread saat server start."""
    global pipeline, pipeline_ready, pipeline_error
    try:
        from model_pipeline import SpamPipeline
        pl = SpamPipeline()
        pl.load_or_train()
        with pipeline_lock:
            pipeline       = pl
            pipeline_ready = True
        print("  [OK] Model pipeline siap (background load selesai)")
    except Exception as e:
        with pipeline_lock:
            pipeline_error = str(e)
        print(f"  [ERROR] Gagal load pipeline: {e}")

# Mulai load di background segera saat server start
threading.Thread(target=_load_pipeline_bg, daemon=True).start()

def get_pipeline():
    with pipeline_lock:
        if pipeline_ready:
            return pipeline
        if pipeline_error:
            raise RuntimeError(f"Gagal memuat model: {pipeline_error}")
    # Belum siap — tunggu maks 60 detik
    for _ in range(120):
        _time_mod.sleep(0.5)
        with pipeline_lock:
            if pipeline_ready: return pipeline
            if pipeline_error: raise RuntimeError(f"Gagal memuat model: {pipeline_error}")
    raise RuntimeError("Model timeout saat loading.")


# ──────────────────────────────────────────
# JOB STORE  (subprocess-based, CUDA-safe)
# ──────────────────────────────────────────
jobs: dict      = {}        # job_id → {status, progress_lines_read, job_dir, proc}
jobs_lock       = threading.Lock()
JOBS_TEMP_DIR   = os.path.join(tempfile.gettempdir(), 'spam_eval_jobs')
os.makedirs(JOBS_TEMP_DIR, exist_ok=True)


def _monitor_job(job_id: str):
    """
    Thread ringan — poll setiap 0.5 detik.
    Baca progress.jsonl secara incremental.
    Setelah subprocess exit, baca result.json.
    """
    with jobs_lock:
        job_dir = jobs[job_id]['job_dir']
        proc    = jobs[job_id]['proc']

    progress_path = os.path.join(job_dir, 'progress.jsonl')
    result_path   = os.path.join(job_dir, 'result.json')
    lines_seen    = 0

    while True:
        import time as _time

        # ── Baca baris progress baru ──
        try:
            if os.path.exists(progress_path):
                with open(progress_path, 'r', encoding='utf-8') as f:
                    all_lines = f.readlines()
                new_lines = all_lines[lines_seen:]
                if new_lines:
                    msgs = []
                    for ln in new_lines:
                        ln = ln.strip()
                        if ln:
                            try:
                                msgs.append(json.loads(ln)['msg'])
                            except Exception:
                                pass
                    if msgs:
                        with jobs_lock:
                            jobs[job_id]['progress'].extend(msgs)
                    lines_seen = len(all_lines)
        except Exception:
            pass

        # ── Cek apakah subprocess sudah selesai ──
        ret = proc.poll()
        if ret is not None:
            # Tunggu sebentar agar result.json sempat ditulis
            _time.sleep(0.5)

            # Baca sisa progress terakhir
            try:
                if os.path.exists(progress_path):
                    with open(progress_path, 'r', encoding='utf-8') as f:
                        all_lines = f.readlines()
                    msgs = []
                    for ln in all_lines[lines_seen:]:
                        ln = ln.strip()
                        if ln:
                            try:
                                msgs.append(json.loads(ln)['msg'])
                            except Exception:
                                pass
                    if msgs:
                        with jobs_lock:
                            jobs[job_id]['progress'].extend(msgs)
            except Exception:
                pass

            # Baca result.json
            if os.path.exists(result_path):
                # Retry beberapa kali — file mungkin masih ditulis
                result_data = None
                for attempt in range(5):
                    try:
                        with open(result_path, 'r', encoding='utf-8') as f:
                            result_data = json.load(f)
                        break
                    except Exception:
                        import time as _t2; _t2.sleep(0.3)

                if result_data:
                    with jobs_lock:
                        jobs[job_id]['status'] = result_data.get('status', 'error')
                        jobs[job_id]['result'] = result_data.get('result')
                        jobs[job_id]['error']  = result_data.get('error')

                    # Simpan hasil terakhir ke disk agar tidak hilang saat server restart
                    if result_data.get('status') == 'done' and result_data.get('result'):
                        try:
                            import re as _re2, math as _math
                            def _sanitize(obj):
                                if isinstance(obj, float):
                                    return None if (_math.isnan(obj) or _math.isinf(obj)) else obj
                                if isinstance(obj, dict): return {k: _sanitize(v) for k,v in obj.items()}
                                if isinstance(obj, list): return [_sanitize(i) for i in obj]
                                return obj
                            with open(LAST_RESULT_FILE, 'w', encoding='utf-8') as _f:
                                json.dump(_sanitize(result_data.get('result')), _f,
                                          ensure_ascii=False, indent=2)
                        except Exception:
                            pass
                else:
                    # Baca raw dan coba strip NaN
                    try:
                        import re as _re
                        raw = open(result_path, 'r', encoding='utf-8').read()
                        raw = _re.sub(r':\s*NaN', ': null', raw)
                        raw = _re.sub(r':\s*Infinity', ': null', raw)
                        result_data = json.loads(raw)
                        with jobs_lock:
                            jobs[job_id]['status'] = result_data.get('status', 'error')
                            jobs[job_id]['result'] = result_data.get('result')
                            jobs[job_id]['error']  = result_data.get('error')
                    except Exception as e:
                        with jobs_lock:
                            jobs[job_id]['status'] = 'error'
                            jobs[job_id]['error']  = f'Gagal parse result: {e}'
            else:
                # result.json belum ada — coba baca stderr
                stderr_out = ''
                try:
                    stderr_bytes = proc.stderr.read()
                    stderr_out   = stderr_bytes.decode('utf-8', errors='replace')[:500] if stderr_bytes else ''
                except Exception:
                    pass

                # Cek apakah memang sengaja di-cancel
                with jobs_lock:
                    was_cancelled = jobs[job_id].get('cancelled', False)

                if was_cancelled:
                    with jobs_lock:
                        jobs[job_id]['status'] = 'cancelled'
                        jobs[job_id]['error']  = 'Training dibatalkan oleh pengguna.'
                else:
                    with jobs_lock:
                        jobs[job_id]['status'] = 'error'
                        jobs[job_id]['error']  = (
                            f'Worker berhenti (exit={ret}) tanpa hasil. '
                            + (stderr_out or 'Tidak ada output error.')
                        )

            # Cleanup temp dir — TIDAK DIHAPUS, semua file disimpan permanen untuk audit/riwayat
            # (result.json, progress.jsonl, models_*.joblib semuanya disimpan)

            # ── Simpan ke history ──
            with jobs_lock:
                j = jobs.get(job_id, {})
                result_data = j.get('result', {}) or {}
                elapsed = round(_time_mod.time() - j.get('start_time', _time_mod.time()), 1)
                inp_path = os.path.join(job_dir, 'input.json')
                inp_data = {}
                try:
                    with open(inp_path, 'r') as f:
                        inp_data = json.load(f)
                except Exception:
                    pass

            summary = {
                'job_id'       : job_id,
                'timestamp'    : _time_mod.strftime('%Y-%m-%d %H:%M:%S'),
                'elapsed_s'    : elapsed,
                'preset'       : inp_data.get('preset', '-'),
                'test_dataset_name' : inp_data.get('test_dataset_name', ''),
                'train_dataset_name': inp_data.get('train_dataset_name', ''),
                'n_nonspam'    : inp_data.get('n_nonspam', 0),
                'n_spam'       : inp_data.get('n_spam', 0),
                'n_train_nonspam': inp_data.get('n_train_nonspam', 0),
                'n_train_spam' : inp_data.get('n_train_spam', 0),
                'adapt_frac'   : inp_data.get('adapt_frac', 0.3),
                'adapt_weight' : inp_data.get('adapt_weight', 8.0),
                'custom_train' : inp_data.get('train_csv_path') is not None,
                'metode1'      : None,
                'metode2'      : None,
                'status'       : j.get('status', 'unknown'),
                'note'         : '',
                'label_name'   : inp_data.get('label_name', ''),
            }
            for mk in ['metode1', 'metode2']:
                r = result_data.get(mk)
                if r:
                    summary[mk] = {
                        'nb_acc' : r.get('naive_bayes', {}).get('accuracy'),
                        'xgb_acc': r.get('xgboost',     {}).get('accuracy'),
                        'nb_f1'  : r.get('naive_bayes', {}).get('f1'),
                        'xgb_f1' : r.get('xgboost',     {}).get('f1'),
                        'nb_cm'  : r.get('naive_bayes', {}).get('cm'),
                        'xgb_cm' : r.get('xgboost',     {}).get('cm'),
                        'top10_chi2': r.get('top20_chi2', [])[:10],
                    }
            with history_lock:
                experiment_history.append(summary)
                if len(experiment_history) > 50:
                    experiment_history.pop(0)
                _save_history()

            break

        _time.sleep(0.5)


# ──────────────────────────────────────────
# ROUTES
# ──────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')


# ---- Mode Teks: prediksi satu email ----
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'Teks email tidak ditemukan.'}), 400
    email_text = data['text'].strip()
    if not email_text:
        return jsonify({'error': 'Teks email tidak boleh kosong.'}), 400
    try:
        pl     = get_pipeline()
        result = pl.predict(email_text)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/status')
def status():
    with pipeline_lock:
        ready = pipeline_ready
        err   = pipeline_error
    if not ready and not err:
        return jsonify({'status': 'loading', 'message': 'Model sedang dimuat...'})
    if err:
        return jsonify({'status': 'error', 'message': err}), 500
    try:
        pl = get_pipeline()
        return jsonify({
            'status'        : 'ready',
            'nb_threshold'  : round(float(pl.best_thresh_nb),  2),
            'xgb_threshold' : round(float(pl.best_thresh_xgb), 2),
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ---- Mode CSV: upload & mulai evaluasi (subprocess) ----
@app.route('/evaluate', methods=['POST'])
def evaluate():
    f_test  = request.files.get('file_test') or request.files.get('file')
    f_train = request.files.get('file_train')

    if not f_test:
        return jsonify({'error': 'File CSV test tidak ditemukan.'}), 400
    if not f_test.filename.lower().endswith('.csv'):
        return jsonify({'error': 'Hanya file CSV yang didukung.'}), 400
    if f_train and not f_train.filename.lower().endswith('.csv'):
        return jsonify({'error': 'File training harus berformat CSV.'}), 400

    run_m1       = request.form.get('run_m1',       'true').lower() == 'true'
    run_m2       = request.form.get('run_m2',       'true').lower() == 'true'
    adapt_frac   = float(request.form.get('adapt_frac',   0.3))
    adapt_weight = float(request.form.get('adapt_weight', 8.0))
    n_nonspam    = int(request.form.get('n_nonspam', 0))
    n_spam_val   = int(request.form.get('n_spam',    0))
    preset       = request.form.get('preset', 'fast')
    # Balance data training (0 = pakai semua)
    n_train_nonspam = int(request.form.get('n_train_nonspam', 0))
    n_train_spam    = int(request.form.get('n_train_spam',    0))

    if not run_m1 and not run_m2:
        return jsonify({'error': 'Pilih minimal satu metode.'}), 400

    # Buat direktori temporer untuk job ini
    job_id  = str(uuid.uuid4())
    job_dir = os.path.join(JOBS_TEMP_DIR, job_id)
    os.makedirs(job_dir, exist_ok=True)

    # Simpan file CSV ke disk (worker membacanya langsung)
    test_path  = os.path.join(job_dir, 'test.csv')
    train_path = None

    def save_csv(file_obj, path):
        content = file_obj.read()
        # Deteksi separator
        import io as _io
        for sep in [',', ';', '\t']:
            try:
                tmp = pd.read_csv(_io.BytesIO(content), sep=sep, on_bad_lines='skip')
                if len(tmp.columns) >= 2:
                    tmp.to_csv(path, index=False)
                    return len(tmp)
            except Exception:
                continue
        return 0

    n_test = save_csv(f_test, test_path)
    if n_test < 10:
        shutil.rmtree(job_dir, ignore_errors=True)
        return jsonify({'error': 'File CSV test tidak valid atau terlalu sedikit baris.'}), 400

    if f_train and f_train.filename:
        train_path = os.path.join(job_dir, 'train.csv')
        n_train = save_csv(f_train, train_path)
        if n_train < 10:
            shutil.rmtree(job_dir, ignore_errors=True)
            return jsonify({'error': 'File CSV training tidak valid.'}), 400

    train_dataset_name = f_train.filename if f_train and f_train.filename else "emails.csv (bawaan)"
    test_dataset_name  = f_test.filename if f_test and f_test.filename else ""

    # Tulis input.json untuk worker
    inp = {
        'test_csv_path'  : test_path,
        'train_csv_path' : train_path,
        'test_dataset_name' : test_dataset_name,
        'train_dataset_name': train_dataset_name,
        'run_m1'         : run_m1,
        'run_m2'         : run_m2,
        'adapt_frac'     : adapt_frac,
        'adapt_weight'   : adapt_weight,
        'n_nonspam'      : n_nonspam,
        'n_spam'         : n_spam_val,
        'preset'         : preset,
        'n_train_nonspam': n_train_nonspam,
        'n_train_spam'   : n_train_spam,
        'label_name'     : request.form.get('label_name', '').strip()[:100],
    }
    with open(os.path.join(job_dir, 'input.json'), 'w') as f:
        json.dump(inp, f)

    # Jalankan worker sebagai subprocess (berjalan di main thread-nya sendiri)
    proc = subprocess.Popen(
        [PYTHON_EXE, WORKER, job_dir],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
        cwd=WORKER_CWD,
    )

    with jobs_lock:
        jobs[job_id] = {
            'status'    : 'running',
            'progress'  : [],
            'result'    : None,
            'error'     : None,
            'job_dir'   : job_dir,
            'proc'      : proc,
            'start_time': _time_mod.time(),
        }

    # Thread ringan — hanya baca file progress & hasil
    threading.Thread(target=_monitor_job, args=(job_id,), daemon=True).start()

    return jsonify({'job_id': job_id}), 202


# ---- Prediksi realtime dari model job ----
@app.route('/predict_job', methods=['POST'])
def predict_job():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request tidak valid.'}), 400

    job_id     = data.get('job_id', '').strip()
    email_text = data.get('text', '').strip()
    metode     = data.get('metode', 'metode2')   # 'metode1' | 'metode2'

    if not job_id:
        return jsonify({'error': 'job_id tidak ditemukan.'}), 400
    if not email_text:
        return jsonify({'error': 'Teks email tidak boleh kosong.'}), 400

    job_dir    = os.path.join(JOBS_TEMP_DIR, job_id)
    model_path = os.path.join(job_dir, f'models_{metode}.joblib')

    # Fallback ke saved_models jika job_dir sudah dihapus
    if not os.path.exists(model_path):
        model_path = os.path.join(SAVED_MODELS_DIR, f'models_{metode}.joblib')

    if not os.path.exists(model_path):
        return jsonify({'error': f'Model {metode} belum tersedia. Jalankan evaluasi terlebih dahulu.'}), 404

    try:
        from evaluator import predict_single_from_job
        import joblib
        job_models = joblib.load(model_path)
        # Pastikan XGB di CPU untuk prediksi
        try:
            job_models['xgb_model'].set_params(device='cpu')
        except Exception:
            pass
        result = predict_single_from_job(email_text, job_models)
        return jsonify(result)
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'detail': traceback.format_exc()[-300:]}), 500


# ---- Cek model apa saja yang tersedia untuk job ----
@app.route('/job_models/<job_id>')
def job_models_status(job_id):
    job_dir = os.path.join(JOBS_TEMP_DIR, job_id)
    # Cek di job_dir dulu, lalu fallback ke saved_models
    def model_exists(name):
        return (os.path.exists(os.path.join(job_dir, name)) or
                os.path.exists(os.path.join(SAVED_MODELS_DIR, name)))
    return jsonify({
        'metode1': model_exists('models_metode1.joblib'),
        'metode2': model_exists('models_metode2.joblib'),
    })


# ---- Riwayat eksperimen ----
@app.route('/history')
def get_history():
    with history_lock:
        return jsonify(list(reversed(experiment_history)))   # terbaru di atas

@app.route('/history/clear', methods=['POST'])
def clear_history():
    with history_lock:
        experiment_history.clear()
        _save_history()
    return jsonify({'ok': True})

@app.route('/history/delete', methods=['POST'])
def delete_history_items():
    """Hapus entri riwayat berdasarkan job_id yang dipilih."""
    data = request.get_json()
    ids  = set(data.get('job_ids', []))
    if not ids:
        return jsonify({'error': 'Tidak ada job_id yang dipilih.'}), 400
    with history_lock:
        before = len(experiment_history)
        experiment_history[:] = [h for h in experiment_history if h.get('job_id') not in ids]
        deleted = before - len(experiment_history)
        _save_history()
    return jsonify({'ok': True, 'deleted': deleted})

@app.route('/history/note', methods=['POST'])
def update_history_note():
    """Simpan catatan untuk satu entri riwayat."""
    data   = request.get_json()
    job_id = data.get('job_id', '')
    note   = data.get('note', '')[:300]   # max 300 karakter
    with history_lock:
        for h in experiment_history:
            if h.get('job_id') == job_id:
                h['note'] = note
                break
        _save_history()
    return jsonify({'ok': True})

@app.route('/history/pin', methods=['POST'])
def update_history_pin():
    """Toggle status pin eksperimen."""
    data = request.get_json()
    job_id = data.get('job_id', '')
    is_pinned = bool(data.get('is_pinned', False))
    with history_lock:
        for h in experiment_history:
            if h.get('job_id') == job_id:
                h['is_pinned'] = is_pinned
                break
        _save_history()
    return jsonify({'ok': True})

# ---- Hasil CSV terakhir (persist) ----
@app.route('/last_result')
def last_result():
    if os.path.exists(LAST_RESULT_FILE):
        try:
            import re as _re
            raw = open(LAST_RESULT_FILE, 'r', encoding='utf-8').read()
            raw = _re.sub(r':\s*NaN', ': null', raw)
            return jsonify({'result': json.loads(raw)})
        except Exception as e:
            return jsonify({'result': None, 'error': str(e)})
    return jsonify({'result': None})

@app.route('/last_result/clear', methods=['POST'])
def clear_last_result():
    try:
        if os.path.exists(LAST_RESULT_FILE):
            os.remove(LAST_RESULT_FILE)
    except Exception:
        pass
    return jsonify({'ok': True})


# ---- Preview statistik dataset sebelum training ----
@app.route('/dataset_preview', methods=['POST'])
def dataset_preview():
    f = request.files.get('file')
    if not f:
        return jsonify({'error': 'File tidak ditemukan.'}), 400
    try:
        from evaluator import detect_columns, normalize_labels
        content = f.read()
        df = None
        for sep in [',', ';', '\t']:
            try:
                tmp = pd.read_csv(io.BytesIO(content), sep=sep, on_bad_lines='skip')
                if len(tmp.columns) >= 2:
                    df = tmp; break
            except Exception:
                continue
        if df is None:
            return jsonify({'error': 'CSV tidak valid.'}), 400

        tc, lc = detect_columns(df)
        df2 = df.rename(columns={tc: 'Text', lc: 'Label'})
        df2['Text']  = df2['Text'].fillna('').astype(str)
        df2['Label'] = normalize_labels(df2['Label'])

        lengths = df2['Text'].str.len()
        return jsonify({
            'total'    : int(len(df2)),
            'n_nonspam': int((df2['Label'] == 0).sum()),
            'n_spam'   : int((df2['Label'] == 1).sum()),
            'text_col' : tc,
            'label_col': lc,
            'avg_len'  : round(float(lengths.mean()), 0),
            'max_len'  : int(lengths.max()),
            'min_len'  : int(lengths.min()),
            'columns'  : list(df.columns[:6]),
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/active_job')
def active_job():
    """Kembalikan job_id yang sedang running (untuk auto-resume saat refresh)."""
    with jobs_lock:
        for job_id, job in jobs.items():
            if job.get('status') == 'running':
                return jsonify({'job_id': job_id})
    return jsonify({'job_id': None})


@app.route('/job/<job_id>/cancel', methods=['POST'])
def cancel_job(job_id):
    with jobs_lock:
        job = jobs.get(job_id)
        if job:
            jobs[job_id]['cancelled'] = True   # tandai dulu sebelum kill
    if not job:
        return jsonify({'error': 'Job tidak ditemukan.'}), 404
    try:
        proc = job.get('proc')
        if proc and proc.poll() is None:
            proc.kill()
        with jobs_lock:
            jobs[job_id]['status'] = 'cancelled'
            jobs[job_id]['error']  = 'Training dibatalkan oleh pengguna.'
        return jsonify({'ok': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/job/<job_id>')
def job_status(job_id):
    with jobs_lock:
        job = jobs.get(job_id)

    if job is None:
        # Fallback: cari di disk (terjadi jika server restart saat job berjalan)
        job_dir     = os.path.join(JOBS_TEMP_DIR, job_id)
        result_path = os.path.join(job_dir, 'result.json')
        prog_path   = os.path.join(job_dir, 'progress.jsonl')

        if not os.path.exists(job_dir):
            return jsonify({'error': 'Job tidak ditemukan.'}), 404

        progress = []
        if os.path.exists(prog_path):
            import re as _re
            for ln in open(prog_path, 'r', encoding='utf-8'):
                ln = ln.strip()
                if ln:
                    try:
                        progress.append(json.loads(ln)['msg'])
                    except Exception:
                        pass

        if os.path.exists(result_path):
            try:
                raw = open(result_path, 'r', encoding='utf-8').read()
                raw = _re.sub(r':\s*NaN', ': null', raw)
                raw = _re.sub(r':\s*Infinity', ': null', raw)
                result_data = json.loads(raw)
                return jsonify({
                    'status'  : result_data.get('status', 'done'),
                    'progress': progress,
                    'result'  : result_data.get('result'),
                    'error'   : result_data.get('error'),
                })
            except Exception as e:
                return jsonify({'status':'error','progress':progress,'result':None,'error':str(e)})

        # result.json belum ada — job masih running (tapi server restart, tidak bisa monitor)
        return jsonify({'status': 'running', 'progress': progress, 'result': None, 'error': None})

    return jsonify({
        'status'  : job['status'],
        'progress': job['progress'],
        'result'  : job['result'],
        'error'   : job['error'],
    })


if __name__ == '__main__':
    print("=" * 60)
    print("  Spam Email Classifier - Web App")
    print("  Mode Teks  : prediksi satu email")
    print("  Mode CSV   : evaluasi batch (subprocess, CUDA-safe)")
    print("=" * 60)
    print("\n  Akses di: http://localhost:5000")
    print("  Model dimuat di background — halaman langsung bisa diakses\n")
    app.run(debug=False, host='0.0.0.0', port=5000)
