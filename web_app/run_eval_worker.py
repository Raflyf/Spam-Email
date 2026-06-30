"""
Worker script — dijalankan sebagai subprocess terpisah oleh app.py.
Menerima argumen via file JSON, menulis progress + hasil ke file JSON juga.
Selalu jalan di main thread sehingga CUDA bisa diinisialisasi dengan benar.
"""
import sys
import os
import json
import traceback

# Tambahkan path — worker dijalankan dari root proyek
_here = os.path.dirname(os.path.abspath(__file__))   # = web_app/
_root = os.path.dirname(_here)                        # = Code_Spam_Email/
sys.path.insert(0, _here)
sys.path.insert(0, _root)

def main():
    if len(sys.argv) < 2:
        print("Usage: run_eval_worker.py <job_dir>", file=sys.stderr)
        sys.exit(1)

    job_dir = sys.argv[1]
    input_path   = os.path.join(job_dir, 'input.json')
    progress_path = os.path.join(job_dir, 'progress.jsonl')
    result_path  = os.path.join(job_dir, 'result.json')

    # Baca input
    with open(input_path, 'r', encoding='utf-8') as f:
        inp = json.load(f)

    import pandas as pd
    from evaluator import (run_metode1, run_metode2,
                            detect_columns, normalize_labels, balance_dataset)
    from _shared import sanitize

    # Progress writer — append satu baris JSON per pesan
    prog_file = open(progress_path, 'a', encoding='utf-8', buffering=1)

    def cb(msg: str):
        prog_file.write(json.dumps({'msg': msg}) + '\n')
        prog_file.flush()

    try:
        # ── LOAD DATA TRAINING ──
        if inp.get('train_csv_path'):
            cb('Memvalidasi CSV training yang di-upload...')
            df_train = pd.read_csv(inp['train_csv_path'])
            tc, lc = detect_columns(df_train)
            df_train = df_train.rename(columns={tc: 'Text', lc: 'Label'})
            df_train['Text']  = df_train['Text'].fillna('').astype(str)
            df_train['Label'] = normalize_labels(df_train['Label'])
        else:
            root_dir  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            train_csv = os.path.join(root_dir, 'data', 'emails.csv')
            if not os.path.exists(train_csv):
                raise FileNotFoundError("File emails.csv tidak ditemukan.")
            cb('Memuat data training default (data/emails.csv)...')
            df_train = pd.read_csv(train_csv)
            df_train = df_train.rename(columns={'spam': 'Label', 'text': 'Text'})
            df_train = df_train.dropna(subset=['Text', 'Label'])
            df_train['Text']  = df_train['Text'].fillna('').astype(str)
            df_train['Label'] = df_train['Label'].astype(int)

        cb(f'Data training: {len(df_train):,} email '
           f'(Non-Spam={int((df_train["Label"]==0).sum())}, '
           f'Spam={int((df_train["Label"]==1).sum())})')

        # ── BALANCE DATA TRAINING (opsional) ──
        n_tr_ns = inp.get('n_train_nonspam', 0)
        n_tr_sp = inp.get('n_train_spam',    0)
        if n_tr_ns > 0 or n_tr_sp > 0:
            df_train, used_tr_ns, used_tr_sp = balance_dataset(df_train, n_tr_ns, n_tr_sp)
            cb(f'Setelah balancing training: {len(df_train):,} email '
               f'(Non-Spam={used_tr_ns}, Spam={used_tr_sp})')

        # ── LOAD DATA TEST ──
        cb('Memvalidasi CSV test...')
        df_test = pd.read_csv(inp['test_csv_path'])
        tc, lc  = detect_columns(df_test)
        df_test = df_test.rename(columns={tc: 'Text', lc: 'Label'})
        df_test['Text']  = df_test['Text'].fillna('').astype(str)
        df_test['Label'] = normalize_labels(df_test['Label'])

        raw_ns = int((df_test['Label'] == 0).sum())
        raw_sp = int((df_test['Label'] == 1).sum())
        cb(f'Data test (mentah): {len(df_test):,} email (Non-Spam={raw_ns}, Spam={raw_sp})')

        # ── BALANCING ──
        df_test, used_ns, used_sp = balance_dataset(
            df_test, inp.get('n_nonspam', 0), inp.get('n_spam', 0))
        cb(f'Setelah balancing: {len(df_test):,} email (Non-Spam={used_ns}, Spam={used_sp})')

        results = {}
        preset  = inp.get('preset', 'fast')

        if inp.get('run_m1', True):
            cb('--- Mulai Metode 1 (Tanpa Domain Adaptation) ---')
            res1 = run_metode1(
                df_train, df_test, preset=preset,
                return_models=True, progress_cb=cb)
            cb(f'Model M1 ready: {res1.get("_models") is not None}')
            results['metode1'] = {k: v for k, v in res1.items() if k != '_models'}
            # Simpan model metode1 ke folder PERMANEN
            if res1.get('_models'):
                try:
                    import joblib as _jl
                    saved_dir = os.path.join(_here, 'saved_models')
                    os.makedirs(saved_dir, exist_ok=True)
                    model_path = os.path.join(saved_dir, 'models_metode1.joblib')
                    # Simpan juga di job_dir untuk kompatibilitas endpoint lama
                    job_model_path = os.path.join(job_dir, 'models_metode1.joblib')
                    _jl.dump(res1['_models'], model_path)
                    _jl.dump(res1['_models'], job_model_path)
                    cb(f'[OK] Model Metode 1 disimpan permanen')
                except Exception as e:
                    cb(f'✗ Gagal simpan model M1: {e}')

        if inp.get('run_m2', True):
            cb('--- Mulai Metode 2 (Domain Adaptation) ---')
            res2 = run_metode2(
                df_train, df_test,
                adapt_frac=inp.get('adapt_frac', 0.3),
                adapt_weight=inp.get('adapt_weight', 8.0),
                preset=preset, return_models=True, progress_cb=cb)
            cb(f'Model M2 ready: {res2.get("_models") is not None}')
            results['metode2'] = {k: v for k, v in res2.items() if k != '_models'}
            # Simpan model metode2 ke folder PERMANEN
            if res2.get('_models'):
                try:
                    import joblib as _jl
                    saved_dir = os.path.join(_here, 'saved_models')
                    os.makedirs(saved_dir, exist_ok=True)
                    model_path = os.path.join(saved_dir, 'models_metode2.joblib')
                    job_model_path = os.path.join(job_dir, 'models_metode2.joblib')
                    _jl.dump(res2['_models'], model_path)
                    _jl.dump(res2['_models'], job_model_path)
                    cb(f'[OK] Model Metode 2 disimpan permanen')
                except Exception as e:
                    cb(f'✗ Gagal simpan model M2: {e}')

        # Tulis hasil
        # Sanitize NaN/Inf sebelum dump — JSON standar tidak mengenal NaN
        with open(result_path, 'w', encoding='utf-8') as f:
            json.dump(sanitize({'status': 'done', 'result': results,
                       'dataset_info': {
                           'raw_nonspam': raw_ns, 'raw_spam': raw_sp,
                           'used_nonspam': used_ns, 'used_spam': used_sp,
                       }}), f)

    except Exception as e:
        tb = traceback.format_exc()
        cb(f'ERROR: {e}')
        with open(result_path, 'w', encoding='utf-8') as f:
            json.dump({'status': 'error', 'error': str(e), 'traceback': tb}, f)
    finally:
        prog_file.close()


if __name__ == '__main__':
    main()
