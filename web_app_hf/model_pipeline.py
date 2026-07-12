"""
Model Pipeline untuk Web App
Melatih & menyimpan model NB + XGBoost dari NB_XGB_MIX_IMPROVED.py
"""

import os
import re
import numpy as np
import pandas as pd
import joblib
import warnings
warnings.filterwarnings('ignore')

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import ComplementNB
from sklearn.feature_selection import SelectKBest, chi2
from sklearn.metrics import f1_score
from sklearn.model_selection import train_test_split
from scipy.sparse import hstack, csr_matrix
from xgboost import XGBClassifier

# Path ke direktori root proyek (satu level di atas web_app/)
ROOT_DIR   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR  = os.path.join(ROOT_DIR, 'models', 'webapp_models')
DATA_DIR   = os.path.join(ROOT_DIR, 'data')

# File model yang disimpan
NB_MODEL_PATH       = os.path.join(MODEL_DIR, 'nb_model.joblib')
XGB_MODEL_PATH      = os.path.join(MODEL_DIR, 'xgb_model.joblib')
TFIDF_WORD_PATH     = os.path.join(MODEL_DIR, 'tfidf_word.joblib')
TFIDF_CHAR_PATH     = os.path.join(MODEL_DIR, 'tfidf_char.joblib')
SELECTOR_PATH       = os.path.join(MODEL_DIR, 'selector.joblib')
THRESHOLD_PATH      = os.path.join(MODEL_DIR, 'thresholds.joblib')


from _shared import (
    SPAM_KW_M2, UI_SPAM_KW, HAM_PLATFORMS,
    preprocess, extra_features_m2, find_best_threshold
)

def check_gpu():
    try:
        import xgboost as xgb
        dtrain = xgb.DMatrix(
            np.random.rand(10, 5).astype(np.float32),
            label=np.random.randint(0, 2, 10)
        )
        params = {'tree_method': 'hist', 'device': 'cuda', 'verbosity': 0}
        xgb.train(params, dtrain, num_boost_round=1)
        print("  GPU terdeteksi - XGBoost berjalan di CUDA")
        return True
    except Exception:
        print("  GPU tidak tersedia, menggunakan CPU")
        return False


# ==========================================
# MAIN PIPELINE CLASS
# ==========================================

class SpamPipeline:
    def __init__(self):
        self.nb_model       = None
        self.xgb_model      = None
        self.tfidf_word     = None
        self.tfidf_char     = None
        self.selector       = None
        self.best_thresh_nb  = 0.5
        self.best_thresh_xgb = 0.5
        self.is_ready       = False

    def load_or_train(self):
        """Load model dari disk jika ada, atau latih ulang."""
        os.makedirs(MODEL_DIR, exist_ok=True)

        if self._models_exist():
            print("  [[OK]] Model ditemukan, memuat dari disk...")
            self._load_models()
            print("  [[OK]] Model berhasil dimuat!")
        else:
            print("  [!] Model belum ada, melatih model baru...")
            print("      (Proses ini hanya terjadi sekali)")
            self._train()
            self._save_models()
            print("  [[OK]] Model berhasil dilatih dan disimpan!")

        self.is_ready = True

    def _models_exist(self):
        files = [NB_MODEL_PATH, XGB_MODEL_PATH, TFIDF_WORD_PATH,
                 TFIDF_CHAR_PATH, SELECTOR_PATH, THRESHOLD_PATH]
        return all(os.path.exists(f) for f in files)

    def _load_models(self):
        self.nb_model   = joblib.load(NB_MODEL_PATH, mmap_mode='r')
        self.xgb_model  = joblib.load(XGB_MODEL_PATH) # XGBoost tak stabil di mmap_mode
        self.tfidf_word = joblib.load(TFIDF_WORD_PATH, mmap_mode='r')
        self.tfidf_char = joblib.load(TFIDF_CHAR_PATH, mmap_mode='r')
        self.selector   = joblib.load(SELECTOR_PATH, mmap_mode='r')
        thresholds      = joblib.load(THRESHOLD_PATH)
        self.best_thresh_nb  = thresholds['nb']
        self.best_thresh_xgb = thresholds['xgb']

        # Paksa XGBoost ke CPU untuk prediksi single email
        # (model mungkin disimpan saat training di CUDA, input predict selalu CPU)
        try:
            self.xgb_model.set_params(device='cpu')
        except Exception:
            pass

    def _save_models(self):
        joblib.dump(self.nb_model,   NB_MODEL_PATH)
        joblib.dump(self.xgb_model,  XGB_MODEL_PATH)
        joblib.dump(self.tfidf_word, TFIDF_WORD_PATH)
        joblib.dump(self.tfidf_char, TFIDF_CHAR_PATH)
        joblib.dump(self.selector,   SELECTOR_PATH)
        joblib.dump({'nb': self.best_thresh_nb, 'xgb': self.best_thresh_xgb}, THRESHOLD_PATH)
        print(f"  [[OK]] Model disimpan di: {MODEL_DIR}")

    def _train(self):
        """Latih model - pipeline identik dengan NB_XGB_MIX_IMPROVED.py"""
        USE_GPU    = check_gpu()
        XGB_DEVICE = 'cuda' if USE_GPU else 'cpu'

        # --- Load Data ---
        print("  [1/5] Loading data...")
        train_csv = os.path.join(DATA_DIR, 'emails.csv')
        test_csv  = os.path.join(DATA_DIR, 'data_test_berlabel_awal.csv')

        if not os.path.exists(train_csv):
            raise FileNotFoundError(f"File tidak ditemukan: {train_csv}")
        if not os.path.exists(test_csv):
            raise FileNotFoundError(f"File tidak ditemukan: {test_csv}")

        df_train = pd.read_csv(train_csv)
        df_train = df_train.rename(columns={'spam': 'Spam/Ham', 'text': 'Text'})
        df_train = df_train.dropna(subset=['Text', 'Spam/Ham'])

        df_test_raw = pd.read_csv(test_csv, sep=';')
        if 'Label' in df_test_raw.columns:
            df_test_raw = df_test_raw.rename(columns={'Label': 'Spam/Ham'})
        df_test_raw['Text'] = df_test_raw['Text'].fillna('')

        df_ham_  = df_test_raw[df_test_raw['Spam/Ham'] == 0].sample(n=500, random_state=42)
        df_spam_ = df_test_raw[df_test_raw['Spam/Ham'] == 1].sample(n=500, random_state=42)
        df_test  = pd.concat([df_ham_, df_spam_]).sample(frac=1, random_state=42).reset_index(drop=True)

        print(f"       Data train: {len(df_train):,} | Data test: {len(df_test):,}")

        # --- Domain Adaptation ---
        print("  [2/5] Domain Adaptation...")
        ADAPT_FRAC   = 0.3
        ADAPT_WEIGHT = 8.0

        df_adapt, _ = train_test_split(
            df_test, train_size=ADAPT_FRAC, random_state=42, stratify=df_test['Spam/Ham']
        )
        df_adapt = df_adapt.reset_index(drop=True)

        df_train_combined = pd.concat(
            [df_train, df_adapt[['Text', 'Spam/Ham']]], ignore_index=True
        )

        n_source       = len(df_train)
        sample_weights = np.ones(len(df_train_combined), dtype=np.float32)
        sample_weights[n_source:] = ADAPT_WEIGHT

        # --- Preprocessing ---
        print("  [3/5] Preprocessing & Feature Engineering...")
        X_train_text  = df_train_combined['Text'].apply(preprocess)
        y_train        = df_train_combined['Spam/Ham'].values.astype(np.int32)

        X_train_extra = np.array([extra_features_m2(t) for t in df_train_combined['Text']], dtype=np.float32)

        # --- TF-IDF ---
        print("  [4/5] TF-IDF Vectorization...")
        self.tfidf_word = TfidfVectorizer(
            max_features=20000, ngram_range=(1, 2),
            min_df=2, max_df=0.85,
            stop_words='english', sublinear_tf=True,
        )
        X_train_word = self.tfidf_word.fit_transform(X_train_text)

        self.tfidf_char = TfidfVectorizer(
            max_features=8000, analyzer='char_wb',
            ngram_range=(3, 5), min_df=3, max_df=0.90, sublinear_tf=True,
        )
        X_train_char = self.tfidf_char.fit_transform(X_train_text)

        X_train_full = hstack([X_train_word, X_train_char, csr_matrix(X_train_extra)])
        X_train_full = X_train_full.astype(np.float32).tocsr()

        # --- Training ---
        print("  [5/5] Training NB + XGBoost...")
        ratio = float((y_train == 0).sum()) / float((y_train == 1).sum())

        X_tr_full, X_val_full, y_tr, y_val, sw_tr, _ = train_test_split(
            X_train_full, y_train, sample_weights,
            test_size=0.15, random_state=42, stratify=y_train
        )

        n_word = X_train_word.shape[1]
        X_tr_word_only  = X_tr_full[:,  :n_word]
        X_val_word_only = X_val_full[:, :n_word]

        # Naive Bayes
        self.selector = SelectKBest(chi2, k=12000)
        X_tr_nb  = self.selector.fit_transform(X_tr_word_only, y_tr)
        X_val_nb = self.selector.transform(X_val_word_only)

        self.nb_model = ComplementNB(alpha=0.1)
        self.nb_model.fit(X_tr_nb, y_tr, sample_weight=sw_tr)

        nb_val_proba          = self.nb_model.predict_proba(X_val_nb)[:, 1]
        self.best_thresh_nb, f1_nb = find_best_threshold(nb_val_proba, y_val)
        print(f"       [NB]  threshold={self.best_thresh_nb:.2f}, val_f1={f1_nb*100:.1f}%")

        # XGBoost
        self.xgb_model = XGBClassifier(
            n_estimators          = 3000,
            learning_rate         = 0.02,
            max_depth             = 6,
            scale_pos_weight      = ratio,
            subsample             = 0.75,
            colsample_bytree      = 0.6,
            gamma                 = 0.5,
            reg_alpha             = 0.1,
            reg_lambda            = 2.0,
            min_child_weight      = 5,
            random_state          = 42,
            eval_metric           = 'logloss',
            tree_method           = 'hist',
            device                = XGB_DEVICE,
            early_stopping_rounds = 80,
            n_jobs                = 1,
        )
        self.xgb_model.fit(
            X_tr_full, y_tr,
            sample_weight = sw_tr,
            eval_set      = [(X_val_full, y_val)],
            verbose       = False,
        )

        xgb_val_proba          = self.xgb_model.predict_proba(X_val_full)[:, 1]
        self.best_thresh_xgb, f1_xgb = find_best_threshold(xgb_val_proba, y_val)
        print(f"       [XGB] threshold={self.best_thresh_xgb:.2f}, val_f1={f1_xgb*100:.1f}%")

    def predict(self, email_text: str) -> dict:
        """Prediksi satu email dan kembalikan hasil dari kedua model."""
        if not self.is_ready:
            raise RuntimeError("Model belum siap. Panggil load_or_train() terlebih dahulu.")

        # Preprocessing
        clean_text   = preprocess(email_text)
        extra_feat   = np.array([extra_features_m2(email_text)], dtype=np.float32)

        # TF-IDF
        word_vec = self.tfidf_word.transform([clean_text])
        char_vec = self.tfidf_char.transform([clean_text])

        full_vec = hstack([word_vec, char_vec, csr_matrix(extra_feat)])
        full_vec = full_vec.astype(np.float32).tocsr()

        # Naive Bayes
        word_nb   = self.selector.transform(word_vec)
        nb_proba  = float(self.nb_model.predict_proba(word_nb)[0, 1])
        nb_pred   = int(nb_proba >= self.best_thresh_nb)

        # XGBoost
        xgb_proba = float(self.xgb_model.predict_proba(full_vec)[0, 1])
        xgb_pred  = int(xgb_proba >= self.best_thresh_xgb)

        # ── Analisis alasan ──
        lower = email_text.lower()

        found_spam_kw = [kw for kw in UI_SPAM_KW if re.search(r'\b' + re.escape(kw) + r'\b', lower)]
        found_ham_plt = [p  for p  in HAM_PLATFORMS if re.search(r'\b' + re.escape(p) + r'\b', lower)]

        url_count   = len(re.findall(r'http\S+|www\S+', lower))
        excl_count  = email_text.count('!')
        upper_ratio = sum(1 for c in email_text if c.isupper()) / max(len(email_text), 1)
        html_tags   = len(re.findall(r'<[^>]+>', email_text))

        reasons_spam = []
        reasons_ham  = []

        if found_spam_kw:
            reasons_spam.append(f"Kata kunci spam: {', '.join(found_spam_kw)}")
        if excl_count > 3:
            reasons_spam.append(f"Terlalu banyak tanda seru ({excl_count}×)")
        if upper_ratio > 0.3:
            reasons_spam.append("Banyak huruf kapital berlebihan")
        if url_count > 2:
            reasons_spam.append(f"Banyak URL ({url_count} link)")
        if html_tags > 5:
            reasons_spam.append(f"Mengandung banyak HTML tag ({html_tags})")

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

        # ── Rekomendasi final ──
        # XGBoost lebih dipercaya (akurasi 93% vs NB 77%)
        # Jika dua model sepakat → ikuti keduanya
        # Jika beda → ikuti XGBoost (lebih akurat) tapi tampilkan peringatan
        agreement = nb_pred == xgb_pred
        if agreement:
            rekomendasi = 'SPAM' if xgb_pred == 1 else 'NON-SPAM'
            rek_alasan  = 'Kedua model sepakat.'
            rek_level   = 'tinggi'
        else:
            # XGB dan NB beda — percayai XGBoost
            rekomendasi = 'SPAM' if xgb_pred == 1 else 'NON-SPAM'
            rek_alasan  = (
                f'NB dan XGB berbeda pendapat. '
                f'Rekomendasi mengikuti XGBoost (akurasi 93%) '
                f'karena lebih handal pada email modern.'
            )
            rek_level = 'sedang'

        # Label helper
        def label(pred):
            return 'SPAM' if pred == 1 else 'NON-SPAM'

        def confidence_level(proba, threshold):
            diff = abs(proba - threshold)
            if diff < 0.05:   return 'Rendah'
            elif diff < 0.15: return 'Sedang'
            else:              return 'Tinggi'

        return {
            'naive_bayes': {
                'label'      : label(nb_pred),
                'is_spam'    : bool(nb_pred),
                'probability': round(float(nb_proba) * 100, 1),
                'threshold'  : round(float(self.best_thresh_nb) * 100, 1),
                'confidence' : confidence_level(nb_proba, self.best_thresh_nb),
            },
            'xgboost': {
                'label'      : label(xgb_pred),
                'is_spam'    : bool(xgb_pred),
                'probability': round(float(xgb_proba) * 100, 1),
                'threshold'  : round(float(self.best_thresh_xgb) * 100, 1),
                'confidence' : confidence_level(xgb_proba, self.best_thresh_xgb),
            },
            'consensus': {
                'label'     : label(1 if (nb_pred + xgb_pred) >= 1 else 0),
                'is_spam'   : bool((nb_pred + xgb_pred) >= 1),
                'nb_vote'   : label(nb_pred),
                'xgb_vote'  : label(xgb_pred),
                'agreement' : agreement,
            },
            'rekomendasi': {
                'label'       : rekomendasi,
                'is_spam'     : rekomendasi == 'SPAM',
                'alasan'      : rek_alasan,
                'level'       : rek_level,          # 'tinggi' | 'sedang'
                'indikator_spam': reasons_spam,
                'indikator_ham' : reasons_ham,
            }
        }
