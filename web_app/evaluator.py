"""
evaluator.py
Evaluasi batch CSV menggunakan pipeline Metode 1 (PURE) dan Metode 2 (Domain Adaptation).
Identik dengan NB_XGB_PURE.py dan NB_XGB_MIX_IMPROVED.py.
"""

import re
import numpy as np
import pandas as pd
import warnings
warnings.filterwarnings('ignore')

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import ComplementNB
from sklearn.feature_selection import SelectKBest, chi2
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix
)
from sklearn.model_selection import train_test_split
from scipy.sparse import hstack, csr_matrix
from xgboost import XGBClassifier


from _shared import (
    SPAM_KW_M1, SPAM_KW_M2, UI_SPAM_KW, HAM_PLATFORMS, preprocess, 
    extra_features_m1, extra_features_m2, find_best_threshold
)


def check_gpu():
    try:
        import xgboost as xgb
        dtrain = xgb.DMatrix(
            np.random.rand(10, 5).astype(np.float32),
            label=np.random.randint(0, 2, 10)
        )
        xgb.train({'tree_method': 'hist', 'device': 'cuda', 'verbosity': 0},
                  dtrain, num_boost_round=1)
        return True
    except Exception:
        return False


# ──────────────────────────────────────────
# PRESET KONFIGURASI
# ──────────────────────────────────────────
# 'fast'   : untuk web demo — selesai <2 menit, akurasi sedikit lebih rendah
# 'full'   : sama persis dengan skrip skripsi — bisa 10-30 menit
PRESET_CONFIGS = {
    'fast': {
        'tfidf_word_features' : 10000,
        'tfidf_char_features' : 4000,
        'nb_k'                : 6000,
        'xgb_n_estimators'    : 500,
        'xgb_learning_rate'   : 0.05,
        'xgb_max_depth'       : 5,
        'xgb_early_stopping'  : 30,
        'xgb_subsample'       : 0.8,
        'xgb_colsample'       : 0.7,
    },
    'full': {
        'tfidf_word_features' : 20000,
        'tfidf_char_features' : 8000,
        'nb_k'                : 12000,
        'xgb_n_estimators'    : 3000,
        'xgb_learning_rate'   : 0.02,
        'xgb_max_depth'       : 6,
        'xgb_early_stopping'  : 80,
        'xgb_subsample'       : 0.75,
        'xgb_colsample'       : 0.6,
    },
}

def _metrics_dict(y_true, y_pred, threshold: float, model_name: str) -> dict:
    """Hitung semua metrik dan kembalikan sebagai dict JSON-serializable."""
    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    tn, fp, fn, tp = int(cm[0,0]), int(cm[0,1]), int(cm[1,0]), int(cm[1,1])

    acc  = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, average='weighted', zero_division=0))
    rec  = float(recall_score(y_true, y_pred, average='weighted', zero_division=0))
    f1   = float(f1_score(y_true, y_pred, average='weighted', zero_division=0))

    prec0 = float(precision_score(y_true, y_pred, labels=[0], average='micro', zero_division=0))
    rec0  = float(recall_score(y_true, y_pred, labels=[0], average='micro', zero_division=0))
    f10   = float(f1_score(y_true, y_pred, labels=[0], average='micro', zero_division=0))

    prec1 = float(precision_score(y_true, y_pred, labels=[1], average='micro', zero_division=0))
    rec1  = float(recall_score(y_true, y_pred, labels=[1], average='micro', zero_division=0))
    f11   = float(f1_score(y_true, y_pred, labels=[1], average='micro', zero_division=0))

    return {
        'model'      : model_name,
        'threshold'  : round(threshold * 100, 1),
        'accuracy'   : round(acc  * 100, 2),
        'precision'  : round(prec * 100, 2),
        'recall'     : round(rec  * 100, 2),
        'f1'         : round(f1   * 100, 2),
        'cm'         : {'tn': tn, 'fp': fp, 'fn': fn, 'tp': tp},
        'per_class'  : {
            'non_spam': {'precision': round(prec0*100,2), 'recall': round(rec0*100,2), 'f1': round(f10*100,2)},
            'spam'    : {'precision': round(prec1*100,2), 'recall': round(rec1*100,2), 'f1': round(f11*100,2)},
        },
    }


# ──────────────────────────────────────────────────────────────
# DETEKSI KOLOM CSV
# ──────────────────────────────────────────────────────────────

def balance_dataset(df: pd.DataFrame, n_nonspam: int, n_spam: int):
    """
    Ambil n_nonspam sampel Non-Spam dan n_spam sampel Spam dari df.
    Jika n=0, pakai semua data yang tersedia.
    Kembalikan (df_balanced, used_nonspam, used_spam).
    """
    df_ns = df[df['Label'] == 0]
    df_sp = df[df['Label'] == 1]

    avail_ns = len(df_ns)
    avail_sp = len(df_sp)

    # Tentukan jumlah akhir per kelas
    take_ns = min(n_nonspam, avail_ns) if n_nonspam > 0 else avail_ns
    take_sp = min(n_spam,    avail_sp) if n_spam    > 0 else avail_sp

    if take_ns < 2:
        raise ValueError(
            f"Jumlah Non-Spam terlalu sedikit ({take_ns}). "
            f"Tersedia {avail_ns}, minta minimal 2."
        )
    if take_sp < 2:
        raise ValueError(
            f"Jumlah Spam terlalu sedikit ({take_sp}). "
            f"Tersedia {avail_sp}, minta minimal 2."
        )

    df_ns_s = df_ns.sample(n=take_ns, random_state=42)
    df_sp_s = df_sp.sample(n=take_sp, random_state=42)

    df_out = pd.concat([df_ns_s, df_sp_s]).sample(frac=1, random_state=42).reset_index(drop=True)
    return df_out, int(take_ns), int(take_sp)


def detect_columns(df: pd.DataFrame):
    """
    Deteksi otomatis kolom teks dan label dari berbagai format CSV Kaggle.
    Kembalikan (text_col, label_col) atau raise ValueError.
    """
    cols_lower = {c.lower(): c for c in df.columns}

    # Cari kolom teks — exact match dulu, lalu substring
    text_candidates = ['text', 'body', 'email', 'message', 'content',
                       'email_text', 'mail', 'subject']
    text_col = None
    for cand in text_candidates:
        if cand in cols_lower:
            text_col = cols_lower[cand]
            break
    if text_col is None:
        for key, orig in cols_lower.items():
            if any(c in key for c in ['text', 'body', 'message', 'email', 'content', 'mail']):
                text_col = orig
                break

    # Cari kolom label — exact match dulu, lalu substring
    label_candidates = ['label', 'spam', 'spam/ham', 'class', 'target',
                        'category', 'is_spam', 'spam_label', 'type', 'email type',
                        'email_type', 'spamham']
    label_col = None
    for cand in label_candidates:
        if cand in cols_lower:
            label_col = cols_lower[cand]
            break
    if label_col is None:
        for key, orig in cols_lower.items():
            if any(c in key for c in ['label', 'spam', 'type', 'class', 'target', 'category']):
                label_col = orig
                break

    if text_col is None or label_col is None:
        raise ValueError(
            f"Kolom tidak terdeteksi otomatis. Kolom yang ada: {list(df.columns)}. "
            f"Pastikan ada kolom teks (text/body/message) dan label (label/spam/class/type)."
        )
    return text_col, label_col


def normalize_labels(series: pd.Series) -> pd.Series:
    """
    Normalisasi label ke 0 (ham) dan 1 (spam).
    Support: 0/1, ham/spam, legitimate/phishing, benign/malicious, dsb.
    """
    s = series.copy()

    # Sudah numerik 0/1
    if pd.api.types.is_numeric_dtype(s):
        unique = set(s.dropna().unique())
        if unique <= {0, 1}:
            return s.astype(int)
        # Kalau ada nilai lain, coba mapping min=0 max=1
        mn, mx = s.min(), s.max()
        return ((s - mn) / (mx - mn)).round().astype(int)

    # String → lowercase → mapping
    s = s.astype(str).str.strip().str.lower()
    mapping = {
        'spam': 1, 'ham': 0,
        'phishing': 1, 'legitimate': 0,
        'phishing email': 1, 'safe email': 0,
        'malicious': 1, 'benign': 0,
        'junk': 1, 'normal': 0,
        '1': 1, '0': 0,
        'yes': 1, 'no': 0,
        'true': 1, 'false': 0,
    }
    mapped = s.map(mapping)
    if mapped.isna().any():
        unknown = s[mapped.isna()].unique().tolist()
        raise ValueError(f"Nilai label tidak dikenali: {unknown}. "
                         f"Gunakan: spam/ham, 0/1, phishing/legitimate, dsb.")
    return mapped.astype(int)


# ──────────────────────────────────────────────────────────────
# METODE 1 — PURE (Train Kaggle, Test CSV upload)
# ──────────────────────────────────────────────────────────────

def run_metode1(df_train_kaggle: pd.DataFrame,
                df_test_upload: pd.DataFrame,
                preset: str = 'fast',
                return_models: bool = False,
                progress_cb=None) -> dict:
    """
    Metode 1: train murni di data Kaggle (emails.csv),
    test di CSV yang di-upload user.
    Identik dengan NB_XGB_PURE.py.
    """
    USE_GPU    = check_gpu()
    XGB_DEVICE = 'cuda' if USE_GPU else 'cpu'
    cfg        = PRESET_CONFIGS.get(preset, PRESET_CONFIGS['fast'])

    def cb(msg):
        if progress_cb:
            progress_cb(msg)

    cb(f'Metode 1 — memulai preprocessing... [preset={preset}, GPU={USE_GPU}]')

    # ---- Preprocessing ----
    X_train_text = df_train_kaggle['Text'].apply(preprocess)
    y_train      = df_train_kaggle['Label'].values.astype(np.int32)

    X_test_text  = df_test_upload['Text'].apply(preprocess)
    y_test       = df_test_upload['Label'].values.astype(np.int32)

    # ---- Extra features ----
    X_train_extra = np.array([extra_features_m1(t) for t in df_train_kaggle['Text']], dtype=np.float32)
    X_test_extra  = np.array([extra_features_m1(t) for t in df_test_upload['Text']],  dtype=np.float32)

    # ---- TF-IDF ----
    cb('Metode 1 — TF-IDF vectorization...')
    tfidf_word = TfidfVectorizer(
        max_features=cfg['tfidf_word_features'], ngram_range=(1, 2),
        min_df=2, max_df=0.85, stop_words='english', sublinear_tf=True,
    )
    X_train_word = tfidf_word.fit_transform(X_train_text)
    X_test_word  = tfidf_word.transform(X_test_text)

    tfidf_char = TfidfVectorizer(
        max_features=10000 if preset == 'full' else cfg['tfidf_char_features'], analyzer='char_wb',
        ngram_range=(3, 5), min_df=2, max_df=0.90, sublinear_tf=True,
    )
    X_train_char = tfidf_char.fit_transform(X_train_text)
    X_test_char  = tfidf_char.transform(X_test_text)

    X_train_full = hstack([X_train_word, X_train_char, csr_matrix(X_train_extra)]).astype(np.float32).tocsr()
    X_test_full  = hstack([X_test_word,  X_test_char,  csr_matrix(X_test_extra)]).astype(np.float32).tocsr()
    n_word = X_train_word.shape[1]

    # ---- Validation split ----
    ratio = float((y_train == 0).sum()) / max(float((y_train == 1).sum()), 1)

    X_tr, X_val, y_tr, y_val = train_test_split(
        X_train_full, y_train, test_size=0.15, random_state=42, stratify=y_train
    )
    X_tr_word  = X_tr[:,  :n_word]
    X_val_word = X_val[:, :n_word]

    # ---- NB ----
    cb('Metode 1 — melatih Naive Bayes...')
    selector      = SelectKBest(chi2, k=min(cfg['nb_k'], X_tr_word.shape[1]))
    X_tr_nb_sel   = selector.fit_transform(X_tr_word, y_tr)
    X_val_nb_sel  = selector.transform(X_val_word)
    X_test_nb_sel = selector.transform(X_test_word.astype(np.float32))

    class_ratio = (y_tr == 0).sum() / max((y_tr == 1).sum(), 1)
    nb_sw = np.where(y_tr == 1, class_ratio, 1.0).astype(np.float32)

    nb_model = ComplementNB(alpha=0.05)
    nb_model.fit(X_tr_nb_sel, y_tr, sample_weight=nb_sw)

    nb_val_proba = nb_model.predict_proba(X_val_nb_sel)[:, 1]
    thresh_nb, _ = find_best_threshold(nb_val_proba, y_val)

    nb_proba_test = nb_model.predict_proba(X_test_nb_sel)[:, 1]
    nb_pred       = (nb_proba_test >= thresh_nb).astype(int)

    # ---- XGB ----
    cb(f'Metode 1 — melatih XGBoost ({XGB_DEVICE.upper()})...')
    xgb_model = XGBClassifier(
        n_estimators      = 2000 if preset == 'full' else cfg['xgb_n_estimators'],
        learning_rate     = 0.03 if preset == 'full' else cfg['xgb_learning_rate'],
        max_depth         = 7 if preset == 'full' else cfg['xgb_max_depth'],
        scale_pos_weight  = ratio,
        subsample         = 0.8 if preset == 'full' else cfg['xgb_subsample'],
        colsample_bytree  = 0.7 if preset == 'full' else cfg['xgb_colsample'],
        gamma=0.3, reg_alpha=0.05, reg_lambda=1.0, min_child_weight=3,
        random_state=42, eval_metric='logloss',
        tree_method='hist', device=XGB_DEVICE,
        deterministic_histogram=True,
        max_bin=128,
        early_stopping_rounds=60 if preset == 'full' else cfg['xgb_early_stopping'],
        n_jobs=-1 if XGB_DEVICE == 'cpu' else 1,
    )
    # Fallback bertingkat: GPU 128 -> GPU 64 -> CPU
    _m1_fitted = False
    try:
        xgb_model.fit(X_tr, y_tr, eval_set=[(X_val, y_val)], verbose=False)
        _m1_fitted = True
    except Exception as e:
        err_str = str(e).lower()
        if 'memory' in err_str or 'alloc' in err_str or 'cuda' in err_str:
            cb('VRAM penuh (max_bin=128), coba max_bin=64...')
            xgb_model.set_params(max_bin=64)
            try:
                xgb_model.fit(X_tr, y_tr, eval_set=[(X_val, y_val)], verbose=False)
                _m1_fitted = True
            except Exception:
                pass
        else:
            raise e
    if not _m1_fitted:
        cb('GPU tetap tidak cukup, XGBoost (M1) terpaksa beralih ke CPU...')
        xgb_model.set_params(device='cpu', n_jobs=-1, max_bin=128)
        xgb_model.fit(X_tr, y_tr, eval_set=[(X_val, y_val)], verbose=False)

    xgb_val_proba = xgb_model.predict_proba(X_val)[:, 1]
    thresh_xgb, _ = find_best_threshold(xgb_val_proba, y_val)

    xgb_proba_test = xgb_model.predict_proba(X_test_full)[:, 1]
    xgb_pred       = (xgb_proba_test >= thresh_xgb).astype(int)

    cb('Metode 1 — selesai.')

    # ---- Top 20 chi2 features ----
    feature_names  = np.array(tfidf_word.get_feature_names_out())
    # Filter fitur dengan skor valid (tidak NaN/Inf) sebelum ambil top 20
    valid_mask     = np.isfinite(selector.scores_)
    valid_scores   = selector.scores_[valid_mask]
    valid_names    = feature_names[valid_mask]
    top20_idx      = np.argsort(valid_scores)[::-1][:20]
    top20_features = [
        {'feature': str(valid_names[i]), 'score': round(float(valid_scores[i]), 2)}
        for i in top20_idx
    ]

    return {
        'metode': 'Metode 1 — Tanpa Domain Adaptation',
        'n_train': int(len(y_train)),
        'n_test' : int(len(y_test)),
        'gpu'    : USE_GPU,
        'preset' : preset,
        'naive_bayes': _metrics_dict(y_test, nb_pred,  thresh_nb,  'Naive Bayes'),
        'xgboost'    : _metrics_dict(y_test, xgb_pred, thresh_xgb, 'XGBoost'),
        'top20_chi2' : top20_features,
        'xgb_best_iter': int(xgb_model.best_iteration),
        '_models': {   # hanya dipakai internal, tidak di-JSON
            'nb_model': nb_model, 'xgb_model': xgb_model,
            'tfidf_word': tfidf_word, 'tfidf_char': tfidf_char,
            'selector': selector,
            'thresh_nb': thresh_nb, 'thresh_xgb': thresh_xgb,
            'metode': 'metode1',
        } if return_models else None,
    }


# ──────────────────────────────────────────────────────────────
# METODE 2 — DOMAIN ADAPTATION (NB_XGB_MIX_IMPROVED)
# ──────────────────────────────────────────────────────────────

def run_metode2(df_train_kaggle: pd.DataFrame,
                df_test_upload: pd.DataFrame,
                adapt_frac: float = 0.3,
                adapt_weight: float = 8.0,
                preset: str = 'fast',
                return_models: bool = False,
                progress_cb=None) -> dict:
    """
    Metode 2: train Kaggle + 30% data test sebagai adaptasi (instance weighting 8x),
    test di 70% sisanya.
    Identik dengan NB_XGB_MIX_IMPROVED.py.
    """
    USE_GPU    = check_gpu()
    XGB_DEVICE = 'cuda' if USE_GPU else 'cpu'
    cfg        = PRESET_CONFIGS.get(preset, PRESET_CONFIGS['fast'])

    def cb(msg):
        if progress_cb:
            progress_cb(msg)

    cb(f'Metode 2 — domain adaptation {int(adapt_frac*100)}%, weight {adapt_weight}x... [preset={preset}, GPU={USE_GPU}]')

    # ---- Pastikan ada cukup data per kelas untuk stratify ----
    label_counts = df_test_upload['Label'].value_counts()
    min_count    = label_counts.min()
    if min_count < 2:
        raise ValueError(
            f"Data upload terlalu sedikit untuk satu kelas (min={min_count}). "
            f"Perlu minimal 2 sampel per kelas."
        )

    df_adapt, df_test_final = train_test_split(
        df_test_upload, train_size=adapt_frac,
        random_state=42, stratify=df_test_upload['Label']
    )
    df_adapt      = df_adapt.reset_index(drop=True)
    df_test_final = df_test_final.reset_index(drop=True)

    df_combined = pd.concat(
        [df_train_kaggle[['Text','Label']], df_adapt[['Text','Label']]], ignore_index=True
    )

    n_src = len(df_train_kaggle)
    sw    = np.ones(len(df_combined), dtype=np.float32)
    sw[n_src:] = adapt_weight

    # ---- Preprocessing ----
    cb('Metode 2 — preprocessing...')
    X_train_text = df_combined['Text'].apply(preprocess)
    y_train      = df_combined['Label'].values.astype(np.int32)

    X_test_text  = df_test_final['Text'].apply(preprocess)
    y_test       = df_test_final['Label'].values.astype(np.int32)

    X_train_extra = np.array([extra_features_m2(t) for t in df_combined['Text']],   dtype=np.float32)
    X_test_extra  = np.array([extra_features_m2(t) for t in df_test_final['Text']], dtype=np.float32)

    # ---- TF-IDF ----
    cb('Metode 2 — TF-IDF vectorization...')
    tfidf_word = TfidfVectorizer(
        max_features=cfg['tfidf_word_features'], ngram_range=(1, 2),
        min_df=2, max_df=0.85, stop_words='english', sublinear_tf=True,
    )
    X_train_word = tfidf_word.fit_transform(X_train_text)
    X_test_word  = tfidf_word.transform(X_test_text)

    tfidf_char = TfidfVectorizer(
        max_features=cfg['tfidf_char_features'], analyzer='char_wb',
        ngram_range=(3, 5), min_df=3, max_df=0.90, sublinear_tf=True,
    )
    X_train_char = tfidf_char.fit_transform(X_train_text)
    X_test_char  = tfidf_char.transform(X_test_text)

    X_train_full = hstack([X_train_word, X_train_char, csr_matrix(X_train_extra)]).astype(np.float32).tocsr()
    X_test_full  = hstack([X_test_word,  X_test_char,  csr_matrix(X_test_extra)]).astype(np.float32).tocsr()
    n_word = X_train_word.shape[1]

    ratio = float((y_train == 0).sum()) / max(float((y_train == 1).sum()), 1)

    X_tr, X_val, y_tr, y_val, sw_tr, _ = train_test_split(
        X_train_full, y_train, sw,
        test_size=0.15, random_state=42, stratify=y_train
    )
    X_tr_word  = X_tr[:,  :n_word]
    X_val_word = X_val[:, :n_word]

    # ---- NB ----
    cb('Metode 2 — melatih Naive Bayes...')
    selector      = SelectKBest(chi2, k=min(cfg['nb_k'], X_tr_word.shape[1]))
    X_tr_nb       = selector.fit_transform(X_tr_word, y_tr)
    X_val_nb      = selector.transform(X_val_word)
    X_test_nb     = selector.transform(X_test_word)

    nb_model = ComplementNB(alpha=0.1)
    nb_model.fit(X_tr_nb, y_tr, sample_weight=sw_tr)

    nb_val_proba = nb_model.predict_proba(X_val_nb)[:, 1]
    thresh_nb, _ = find_best_threshold(nb_val_proba, y_val)

    nb_proba_test = nb_model.predict_proba(X_test_nb)[:, 1]
    nb_pred       = (nb_proba_test >= thresh_nb).astype(int)

    # ---- XGB ----
    cb(f'Metode 2 — melatih XGBoost ({XGB_DEVICE.upper()})...')
    xgb_model = XGBClassifier(
        n_estimators      = cfg['xgb_n_estimators'],
        learning_rate     = cfg['xgb_learning_rate'],
        max_depth         = cfg['xgb_max_depth'],
        scale_pos_weight  = ratio,
        subsample         = cfg['xgb_subsample'],
        colsample_bytree  = cfg['xgb_colsample'],
        gamma=0.5, reg_alpha=0.1, reg_lambda=2.0, min_child_weight=5,
        random_state=42, eval_metric='logloss',
        tree_method='hist', device=XGB_DEVICE,
        deterministic_histogram=True,
        max_bin=128,
        early_stopping_rounds=cfg['xgb_early_stopping'],
        n_jobs=-1 if XGB_DEVICE == 'cpu' else 1,
    )
    # Fallback bertingkat: GPU 128 -> GPU 64 -> CPU
    _m2_fitted = False
    try:
        xgb_model.fit(X_tr, y_tr, sample_weight=sw_tr,
                      eval_set=[(X_val, y_val)], verbose=False)
        _m2_fitted = True
    except Exception as e:
        err_str = str(e).lower()
        if 'memory' in err_str or 'alloc' in err_str or 'cuda' in err_str:
            cb('VRAM penuh (max_bin=128), coba max_bin=64...')
            xgb_model.set_params(max_bin=64)
            try:
                xgb_model.fit(X_tr, y_tr, sample_weight=sw_tr,
                              eval_set=[(X_val, y_val)], verbose=False)
                _m2_fitted = True
            except Exception:
                pass
        else:
            raise e
    if not _m2_fitted:
        cb('GPU tetap tidak cukup, XGBoost (M2) terpaksa beralih ke CPU...')
        xgb_model.set_params(device='cpu', n_jobs=-1, max_bin=256)
        xgb_model.fit(X_tr, y_tr, sample_weight=sw_tr,
                      eval_set=[(X_val, y_val)], verbose=False)

    xgb_val_proba = xgb_model.predict_proba(X_val)[:, 1]
    thresh_xgb, _ = find_best_threshold(xgb_val_proba, y_val)

    xgb_proba_test = xgb_model.predict_proba(X_test_full)[:, 1]
    xgb_pred       = (xgb_proba_test >= thresh_xgb).astype(int)

    cb('Metode 2 — selesai.')

    feature_names  = np.array(tfidf_word.get_feature_names_out())
    valid_mask     = np.isfinite(selector.scores_)
    valid_scores   = selector.scores_[valid_mask]
    valid_names    = feature_names[valid_mask]
    top20_idx      = np.argsort(valid_scores)[::-1][:20]
    top20_features = [
        {'feature': str(valid_names[i]), 'score': round(float(valid_scores[i]), 2)}
        for i in top20_idx
    ]

    return {
        'metode'      : f'Metode 2 — Domain Adaptation {int(adapt_frac*100)}%',
        'n_train'     : int(len(df_train_kaggle)),
        'n_adapt'     : int(len(df_adapt)),
        'n_test'      : int(len(y_test)),
        'adapt_frac'  : adapt_frac,
        'adapt_weight': adapt_weight,
        'gpu'         : USE_GPU,
        'preset'      : preset,
        'naive_bayes' : _metrics_dict(y_test, nb_pred,  thresh_nb,  'Naive Bayes'),
        'xgboost'     : _metrics_dict(y_test, xgb_pred, thresh_xgb, 'XGBoost'),
        'top20_chi2'  : top20_features,
        'xgb_best_iter': int(xgb_model.best_iteration),
        '_models': {
            'nb_model': nb_model, 'xgb_model': xgb_model,
            'tfidf_word': tfidf_word, 'tfidf_char': tfidf_char,
            'selector': selector,
            'thresh_nb': thresh_nb, 'thresh_xgb': thresh_xgb,
            'metode': 'metode2',
        } if return_models else None,
    }


# ──────────────────────────────────────────────────────────────
# PREDICT SINGLE EMAIL dari model job yang tersimpan
# ──────────────────────────────────────────────────────────────

def predict_single_from_job(email_text: str, job_models: dict) -> dict:
    """
    Prediksi satu email menggunakan model yang baru dilatih dari job CSV.
    job_models: dict berisi nb_model, xgb_model, tfidf_word, tfidf_char,
                selector, thresh_nb, thresh_xgb, metode ('metode1'|'metode2')
    """
    import math

    clean_text = preprocess(email_text)
    if job_models.get('metode') == 'metode2':
        extra_feat = np.array([extra_features_m2(email_text)], dtype=np.float32)
    else:
        extra_feat = np.array([extra_features_m1(email_text)], dtype=np.float32)

    word_vec = job_models['tfidf_word'].transform([clean_text])
    char_vec = job_models['tfidf_char'].transform([clean_text])
    full_vec = hstack([word_vec, char_vec, csr_matrix(extra_feat)]).astype(np.float32).tocsr()

    # NB
    word_nb  = job_models['selector'].transform(word_vec)
    nb_proba = float(job_models['nb_model'].predict_proba(word_nb)[0, 1])
    thresh_nb = job_models['thresh_nb']
    nb_pred  = int(nb_proba >= thresh_nb)

    # XGB — paksa CPU untuk prediksi single
    xgb_m = job_models['xgb_model']
    try:
        xgb_m.set_params(device='cpu')
    except Exception:
        pass
    xgb_proba = float(xgb_m.predict_proba(full_vec)[0, 1])
    thresh_xgb = job_models['thresh_xgb']
    xgb_pred  = int(xgb_proba >= thresh_xgb)

    # Indikator
    lower = email_text.lower()
    found_spam_kw = [kw for kw in UI_SPAM_KW if kw in lower]
    found_ham_plt = [p  for p  in HAM_PLATFORMS if p in lower]
    url_count   = len(re.findall(r'http\S+|www\S+', lower))
    excl_count  = email_text.count('!')
    upper_ratio = sum(1 for c in email_text if c.isupper()) / max(len(email_text), 1)

    reasons_spam, reasons_ham = [], []
    if found_spam_kw:
        reasons_spam.append(f"Kata kunci spam: {', '.join(found_spam_kw[:5])}")
    if excl_count > 3:
        reasons_spam.append(f"Terlalu banyak tanda seru ({excl_count}×)")
    if upper_ratio > 0.3:
        reasons_spam.append("Banyak huruf kapital berlebihan")
    if url_count > 2:
        reasons_spam.append(f"Banyak URL ({url_count} link)")
    if found_ham_plt:
        reasons_ham.append(f"Platform legitimate: {', '.join(found_ham_plt[:3])}")
    if not found_spam_kw:
        reasons_ham.append("Tidak ada kata kunci spam")
    if excl_count == 0:
        reasons_ham.append("Tidak ada tanda seru")
    if upper_ratio < 0.1:
        reasons_ham.append("Penggunaan huruf kapital normal")
    if url_count == 0:
        reasons_ham.append("Tidak ada URL mencurigakan")

    agreement = nb_pred == xgb_pred
    if agreement:
        rek_label  = 'SPAM' if xgb_pred == 1 else 'NON-SPAM'
        rek_alasan = 'Kedua model sepakat.'
        rek_level  = 'tinggi'
    else:
        rek_label  = 'SPAM' if xgb_pred == 1 else 'NON-SPAM'
        rek_alasan = ('NB dan XGB berbeda pendapat. '
                      'Rekomendasi mengikuti XGBoost (akurasi lebih tinggi).')
        rek_level  = 'sedang'

    def lbl(p): return 'SPAM' if p == 1 else 'NON-SPAM'
    def conf(proba, thr):
        d = abs(proba - thr)
        return 'Rendah' if d < 0.05 else ('Sedang' if d < 0.15 else 'Tinggi')

    return {
        'naive_bayes': {
            'label': lbl(nb_pred), 'is_spam': bool(nb_pred),
            'probability': round(nb_proba * 100, 1),
            'threshold'  : round(thresh_nb * 100, 1),
            'confidence' : conf(nb_proba, thresh_nb),
        },
        'xgboost': {
            'label': lbl(xgb_pred), 'is_spam': bool(xgb_pred),
            'probability': round(xgb_proba * 100, 1),
            'threshold'  : round(thresh_xgb * 100, 1),
            'confidence' : conf(xgb_proba, thresh_xgb),
        },
        'consensus': {
            'label': lbl(1 if (nb_pred + xgb_pred) >= 1 else 0),
            'is_spam': bool((nb_pred + xgb_pred) >= 1),
            'nb_vote': lbl(nb_pred), 'xgb_vote': lbl(xgb_pred),
            'agreement': agreement,
        },
        'rekomendasi': {
            'label'         : rek_label,
            'is_spam'       : rek_label == 'SPAM',
            'alasan'        : rek_alasan,
            'level'         : rek_level,
            'indikator_spam': reasons_spam[:4],
            'indikator_ham' : reasons_ham[:4],
        },
        'metode': job_models.get('metode', 'unknown'),
    }
