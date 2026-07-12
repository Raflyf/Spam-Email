import pandas as pd
import numpy as np
import re
import warnings
warnings.filterwarnings('ignore')

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import ComplementNB
from sklearn.feature_selection import SelectKBest, chi2
from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix, precision_recall_fscore_support
)
from scipy.sparse import hstack, csr_matrix
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import seaborn as sns

print("=" * 80)
print("EKSPERIMEN RASIO ADAPTASI DOMAIN")
print("Menguji variasi: 10%, 20%, 30%, 40% dari data target sebagai data adaptasi")
print("Config tetap: Weight 8.0, XGB Tuned, NB Word-Only, No Data Leakage")
print("=" * 80)

# ==========================================
# CEK GPU
# ==========================================
def check_gpu():
    try:
        import xgboost as xgb
        dtrain = xgb.DMatrix(
            np.random.rand(10, 5).astype(np.float32),
            label=np.random.randint(0, 2, 10)
        )
        params = {'tree_method': 'hist', 'device': 'cuda', 'verbosity': 0}
        xgb.train(params, dtrain, num_boost_round=1)
        print("  GPU terdeteksi - XGBoost berjalan di CUDA (RTX 3050)")
        return True
    except Exception as e:
        print(f"  GPU tidak tersedia, fallback ke CPU: {e}")
        return False

USE_GPU    = check_gpu()
XGB_DEVICE = 'cuda' if USE_GPU else 'cpu'

# ==========================================
# 1. LOAD DATA (sekali, dipakai semua eksperimen)
# ==========================================
print("\n[1] Loading Dataset...")

# 1. Dataset training (Emails.csv)
df_train = pd.read_csv('data/emails.csv')
df_train = df_train.rename(columns={'spam': 'Spam/Ham', 'text': 'Text'})
df_train = df_train.dropna(subset=['Text', 'Spam/Ham'])

# 2. Dataset uji email pribadi
df_test_raw = pd.read_csv('data/data_test_berlabel_awal.csv', sep=';')
if 'Label' in df_test_raw.columns:
    df_test_raw = df_test_raw.rename(columns={'Label': 'Spam/Ham'})
df_test_raw['Text'] = df_test_raw['Text'].fillna('')

df_ham_  = df_test_raw[df_test_raw['Spam/Ham'] == 0].sample(n=500, random_state=42)
df_spam_ = df_test_raw[df_test_raw['Spam/Ham'] == 1].sample(n=500, random_state=42)
df_test  = pd.concat([df_ham_, df_spam_]).sample(frac=1, random_state=42).reset_index(drop=True)

print(f"  Data Kaggle (train) : {len(df_train)} email")
print(f"  Data Pribadi (total): {len(df_test)} email (balanced 500 Non-Spam + 500 Spam)")

# ==========================================
# 2. PREPROCESSING
# ==========================================
def preprocess(text):
    text = str(text).lower()
    text = re.sub(r'http\S+|www\S+',  ' urltoken ',   text)
    text = re.sub(r'\S+@\S+',         ' emailtoken ', text)
    text = re.sub(r'\$[\d,]+',        ' pricetoken ', text)
    text = re.sub(r'\b\d{5,}\b',      ' longnum ',    text)
    text = re.sub(r'\b\d+\b',         ' numtoken ',   text)
    text = re.sub(r'[^a-zA-Z\s]',     ' ',            text)
    return ' '.join(w for w in text.split() if len(w) > 1)

SPAM_KW = [
    'free','click','unsubscribe','offer','winner','won',
    'urgent','immediately','guarantee','bonus','prize','cash',
    'congratulations','selected','limited','exclusive','deal',
    'discount','save','earn','income','money','profit',
    'investment','million','percent','risk','verify',
    'account','password','bank','credit','loan',
    'pharmacy','pills','medication','weight','diet',
]
HAM_PLATFORMS = [
    'facebook','google','mozilla','firefox','instagram',
    'twitter','linkedin','microsoft','apple','amazon',
    'youtube','github','whatsapp','telegram','zoom',
    'netflix','spotify','dropbox','slack','notion',
]

def extra_features(raw_text):
    text    = str(raw_text)
    lower   = text.lower()
    length  = max(len(text), 1)
    words   = text.split()
    n_words = max(len(words), 1)
    upper_count    = sum(1 for c in text if c.isupper())
    all_caps_words = sum(1 for w in words if w.isupper() and len(w) > 1)
    html_tags      = len(re.findall(r'<[^>]+>', text))
    excl_count     = text.count('!')
    url_count      = len(re.findall(r'http\S+|www\S+', lower))
    email_count    = len(re.findall(r'\S+@\S+', lower))
    feats = [
        min(length / 3000, 1.0),
        excl_count / length,
        text.count('$') / length,
        text.count('?') / length,
        upper_count / length,
        all_caps_words / n_words,
        min(url_count / 5, 1.0),
        email_count / n_words,
        min(html_tags / 20, 1.0),
        int(excl_count > 3),
        int(upper_count / length > 0.3),
        min(n_words / 500, 1.0),
        int(any(p in lower for p in HAM_PLATFORMS)),
    ]
    for kw in SPAM_KW:
        feats.append(int(kw in lower))
    return feats

def find_best_threshold(proba, y_true):
    best_thresh, best_score = 0.5, 0.0
    for t in np.arange(0.15, 0.85, 0.01):
        pred  = (proba >= t).astype(int)
        score = f1_score(y_true, pred, average='weighted', zero_division=0)
        if score > best_score:
            best_score, best_thresh = score, t
    return best_thresh, best_score

def pct(x):
    return f"{x * 100:.2f}%"

# ==========================================
# 3. LOOP EKSPERIMEN TIAP RASIO ADAPTASI
# ==========================================
ADAPT_WEIGHT  = 8.0
ADAPT_RATIOS  = [0.10, 0.20, 0.30, 0.40]

all_results = []

for ADAPT_FRAC in ADAPT_RATIOS:
    n_adapt = int(len(df_test) * ADAPT_FRAC)
    n_test  = len(df_test) - n_adapt
    label   = f"{int(ADAPT_FRAC * 100)}%"

    print(f"\n{'='*80}")
    print(f"  EKSPERIMEN RASIO ADAPTASI: {label}  ({n_adapt} adaptasi | {n_test} test)")
    print(f"{'='*80}")

    # --- Pembagian data ---
    df_adapt, df_test_final = train_test_split(
        df_test, train_size=ADAPT_FRAC, random_state=42, stratify=df_test['Spam/Ham']
    )
    df_adapt      = df_adapt.reset_index(drop=True)
    df_test_final = df_test_final.reset_index(drop=True)

    df_train_combined = pd.concat(
        [df_train, df_adapt[['Text', 'Spam/Ham']]], ignore_index=True
    )
    n_source       = len(df_train)
    sample_weights = np.ones(len(df_train_combined), dtype=np.float32)
    sample_weights[n_source:] = ADAPT_WEIGHT

    # --- Preprocessing ---
    X_train_text = df_train_combined['Text'].apply(preprocess)
    y_train      = df_train_combined['Spam/Ham'].values.astype(np.int32)
    X_test_text  = df_test_final['Text'].apply(preprocess)
    y_test       = df_test_final['Spam/Ham'].values.astype(np.int32)

    # --- Extra features ---
    X_train_extra = np.array([extra_features(t) for t in df_train_combined['Text']], dtype=np.float32)
    X_test_extra  = np.array([extra_features(t) for t in df_test_final['Text']],    dtype=np.float32)

    # --- TF-IDF ---
    tfidf_word = TfidfVectorizer(
        max_features=20000, ngram_range=(1, 2),
        min_df=2, max_df=0.85, stop_words='english', sublinear_tf=True,
    )
    X_train_word = tfidf_word.fit_transform(X_train_text)
    X_test_word  = tfidf_word.transform(X_test_text)

    tfidf_char = TfidfVectorizer(
        max_features=8000, analyzer='char_wb',
        ngram_range=(3, 5), min_df=3, max_df=0.90, sublinear_tf=True,
    )
    X_train_char = tfidf_char.fit_transform(X_train_text)
    X_test_char  = tfidf_char.transform(X_test_text)

    X_train_full = hstack([X_train_word, X_train_char, csr_matrix(X_train_extra)]).astype(np.float32).tocsr()
    X_test_full  = hstack([X_test_word,  X_test_char,  csr_matrix(X_test_extra)]).astype(np.float32).tocsr()

    n_word = X_train_word.shape[1]
    ratio  = float((y_train == 0).sum()) / float((y_train == 1).sum())

    # --- Validation split ---
    X_tr, X_val, y_tr, y_val, sw_tr, sw_val = train_test_split(
        X_train_full, y_train, sample_weights,
        test_size=0.15, random_state=42, stratify=y_train
    )
    X_tr_word  = X_tr[:, :n_word]
    X_val_word = X_val[:, :n_word]

    # --- Naive Bayes ---
    selector  = SelectKBest(chi2, k=12000)
    X_tr_nb   = selector.fit_transform(X_tr_word, y_tr)
    X_val_nb  = selector.transform(X_val_word)
    X_test_nb = selector.transform(X_test_word)

    nb_model = ComplementNB(alpha=0.1)
    nb_model.fit(X_tr_nb, y_tr, sample_weight=sw_tr)

    nb_val_proba         = nb_model.predict_proba(X_val_nb)[:, 1]
    best_thresh_nb, _    = find_best_threshold(nb_val_proba, y_val)
    nb_proba             = nb_model.predict_proba(X_test_nb)[:, 1]
    nb_pred              = (nb_proba >= best_thresh_nb).astype(int)

    # --- XGBoost ---
    xgb_model = XGBClassifier(
        n_estimators=3000, learning_rate=0.02, max_depth=6,
        scale_pos_weight=ratio, subsample=0.75, colsample_bytree=0.6,
        gamma=0.5, reg_alpha=0.1, reg_lambda=2.0, min_child_weight=5,
        random_state=42, eval_metric='logloss',
        tree_method='hist', device=XGB_DEVICE,
        early_stopping_rounds=80, n_jobs=1,
    )
    xgb_model.fit(
        X_tr, y_tr, sample_weight=sw_tr,
        eval_set=[(X_val, y_val)], verbose=False,
    )

    xgb_val_proba         = xgb_model.predict_proba(X_val)[:, 1]
    best_thresh_xgb, _    = find_best_threshold(xgb_val_proba, y_val)
    xgb_proba             = xgb_model.predict_proba(X_test_full)[:, 1]
    xgb_pred              = (xgb_proba >= best_thresh_xgb).astype(int)

    # --- Hitung metrik ---
    cm_nb  = confusion_matrix(y_test, nb_pred)
    cm_xgb = confusion_matrix(y_test, xgb_pred)

    p_nb,  r_nb,  f1_nb,  _ = precision_recall_fscore_support(y_test, nb_pred,  labels=[0,1], zero_division=0)
    p_xgb, r_xgb, f1_xgb, _ = precision_recall_fscore_support(y_test, xgb_pred, labels=[0,1], zero_division=0)

    nb_acc  = accuracy_score(y_test, nb_pred)  * 100
    xgb_acc = accuracy_score(y_test, xgb_pred) * 100
    nb_f1w  = f1_score(y_test, nb_pred,  average='weighted') * 100
    xgb_f1w = f1_score(y_test, xgb_pred, average='weighted') * 100

    print(f"  NB  | Akurasi: {nb_acc:.2f}%  | F1-W: {nb_f1w:.2f}%  | Threshold: {best_thresh_nb:.2f}"
          f"  | FP: {cm_nb[0][1]}  | FN: {cm_nb[1][0]}")
    print(f"  XGB | Akurasi: {xgb_acc:.2f}%  | F1-W: {xgb_f1w:.2f}%  | Threshold: {best_thresh_xgb:.2f}"
          f"  | FP: {cm_xgb[0][1]}  | FN: {cm_xgb[1][0]}"
          f"  | Best iter: {xgb_model.best_iteration}")

    all_results.append({
        'Rasio Adaptasi'          : label,
        'Jumlah Data Adaptasi'    : n_adapt,
        'Jumlah Data Test'        : n_test,
        # NB
        'NB - Akurasi (%)'        : round(nb_acc, 2),
        'NB - Presisi W (%)'      : round(precision_score(y_test, nb_pred, average='weighted') * 100, 2),
        'NB - Recall W (%)'       : round(recall_score(y_test, nb_pred, average='weighted') * 100, 2),
        'NB - F1 W (%)'           : round(nb_f1w, 2),
        'NB - Recall Spam (%)'    : round(r_nb[1] * 100, 2),
        'NB - FP'                 : int(cm_nb[0][1]),
        'NB - FN'                 : int(cm_nb[1][0]),
        'NB - Threshold'          : best_thresh_nb,
        # XGB
        'XGB - Akurasi (%)'       : round(xgb_acc, 2),
        'XGB - Presisi W (%)'     : round(precision_score(y_test, xgb_pred, average='weighted') * 100, 2),
        'XGB - Recall W (%)'      : round(recall_score(y_test, xgb_pred, average='weighted') * 100, 2),
        'XGB - F1 W (%)'          : round(xgb_f1w, 2),
        'XGB - Recall Spam (%)'   : round(r_xgb[1] * 100, 2),
        'XGB - FP'                : int(cm_xgb[0][1]),
        'XGB - FN'                : int(cm_xgb[1][0]),
        'XGB - Threshold'         : best_thresh_xgb,
        'XGB - Best Iteration'    : xgb_model.best_iteration,
    })

# ==========================================
# 4. EXPORT HASIL KE CSV
# ==========================================
df_results = pd.DataFrame(all_results)
df_results.to_csv('eval_results/NB_XGB_ADAPT_RATIO_EXPERIMENT.csv', index=False)
print(f"\n  Hasil disimpan ke: eval_results/NB_XGB_ADAPT_RATIO_EXPERIMENT.csv")

print("\n" + "="*80)
print("RINGKASAN HASIL SEMUA RASIO ADAPTASI")
print("="*80)
print(df_results[[
    'Rasio Adaptasi', 'Jumlah Data Adaptasi', 'Jumlah Data Test',
    'NB - Akurasi (%)', 'NB - F1 W (%)',
    'XGB - Akurasi (%)', 'XGB - F1 W (%)'
]].to_string(index=False))

# ==========================================
# 5. VISUALISASI PERBANDINGAN
# ==========================================
print("\n[+] Membuat Visualisasi Perbandingan Rasio Adaptasi...")

labels     = [r['Rasio Adaptasi'] for r in all_results]
nb_accs    = [r['NB - Akurasi (%)']  for r in all_results]
xgb_accs   = [r['XGB - Akurasi (%)'] for r in all_results]
nb_f1s     = [r['NB - F1 W (%)']     for r in all_results]
xgb_f1s    = [r['XGB - F1 W (%)']    for r in all_results]
nb_fps     = [r['NB - FP']           for r in all_results]
xgb_fps    = [r['XGB - FP']          for r in all_results]
nb_fns     = [r['NB - FN']           for r in all_results]
xgb_fns    = [r['XGB - FN']          for r in all_results]

x     = np.arange(len(labels))
width = 0.35

# --- Grafik 1: Akurasi ---
fig, ax = plt.subplots(figsize=(10, 6))
bars1 = ax.bar(x - width/2, nb_accs,  width, label='Naive Bayes', color='skyblue',    edgecolor='black')
bars2 = ax.bar(x + width/2, xgb_accs, width, label='XGBoost',     color='lightgreen', edgecolor='black')
ax.set_xlabel('Rasio Data Adaptasi', fontsize=12, fontweight='bold')
ax.set_ylabel('Akurasi (%)', fontsize=12, fontweight='bold')
ax.set_title('Pengaruh Rasio Data Adaptasi terhadap Akurasi Model', fontsize=14, fontweight='bold')
ax.set_xticks(x)
ax.set_xticklabels(labels)
ax.legend(fontsize=11)
ax.set_ylim([0, 100])
ax.grid(axis='y', alpha=0.3, linestyle='--')
for bars in [bars1, bars2]:
    for bar in bars:
        h = bar.get_height()
        ax.annotate(f'{h:.1f}%',
                    xy=(bar.get_x() + bar.get_width() / 2, h),
                    xytext=(0, 3), textcoords='offset points',
                    ha='center', va='bottom', fontsize=9, fontweight='bold')
plt.tight_layout()
f_acc = 'grafik_skripsi/Gambar_IV_Eksperimen_Rasio_Akurasi.png'
plt.savefig(f_acc, dpi=300, bbox_inches='tight')
print("  [1/4] Grafik Akurasi disimpan: Gambar_IV_Eksperimen_Rasio_Akurasi.png")
plt.close()

# --- Grafik 2: F1-Score ---
fig, ax = plt.subplots(figsize=(10, 6))
bars1 = ax.bar(x - width/2, nb_f1s,  width, label='Naive Bayes', color='skyblue',    edgecolor='black')
bars2 = ax.bar(x + width/2, xgb_f1s, width, label='XGBoost',     color='lightgreen', edgecolor='black')
ax.set_xlabel('Rasio Data Adaptasi', fontsize=12, fontweight='bold')
ax.set_ylabel('F1-Score Weighted (%)', fontsize=12, fontweight='bold')
ax.set_title('Pengaruh Rasio Data Adaptasi terhadap F1-Score Model', fontsize=14, fontweight='bold')
ax.set_xticks(x)
ax.set_xticklabels(labels)
ax.legend(fontsize=11)
ax.set_ylim([0, 100])
ax.grid(axis='y', alpha=0.3, linestyle='--')
for bars in [bars1, bars2]:
    for bar in bars:
        h = bar.get_height()
        ax.annotate(f'{h:.1f}%',
                    xy=(bar.get_x() + bar.get_width() / 2, h),
                    xytext=(0, 3), textcoords='offset points',
                    ha='center', va='bottom', fontsize=9, fontweight='bold')
plt.tight_layout()
f_f1 = 'grafik_skripsi/Gambar_IV_Eksperimen_Rasio_F1Score.png'
plt.savefig(f_f1, dpi=300, bbox_inches='tight')
print("  [2/4] Grafik F1-Score disimpan: Gambar_IV_Eksperimen_Rasio_F1Score.png")
plt.close()

# --- Grafik 3: False Positive ---
fig, ax = plt.subplots(figsize=(10, 6))
bars1 = ax.bar(x - width/2, nb_fps,  width, label='Naive Bayes', color='salmon',      edgecolor='black')
bars2 = ax.bar(x + width/2, xgb_fps, width, label='XGBoost',     color='lightsalmon', edgecolor='black')
ax.set_xlabel('Rasio Data Adaptasi', fontsize=12, fontweight='bold')
ax.set_ylabel('Jumlah False Positive', fontsize=12, fontweight='bold')
ax.set_title('Pengaruh Rasio Data Adaptasi terhadap False Positive\n(Non-Spam yang salah diprediksi Spam)',
             fontsize=13, fontweight='bold')
ax.set_xticks(x)
ax.set_xticklabels(labels)
ax.legend(fontsize=11)
ax.grid(axis='y', alpha=0.3, linestyle='--')
for bars in [bars1, bars2]:
    for bar in bars:
        h = bar.get_height()
        ax.annotate(f'{int(h)}',
                    xy=(bar.get_x() + bar.get_width() / 2, h),
                    xytext=(0, 3), textcoords='offset points',
                    ha='center', va='bottom', fontsize=9, fontweight='bold')
plt.tight_layout()
f_fp = 'grafik_skripsi/Gambar_IV_Eksperimen_Rasio_FalsePositive.png'
plt.savefig(f_fp, dpi=300, bbox_inches='tight')
print("  [3/4] Grafik FP disimpan: Gambar_IV_Eksperimen_Rasio_FalsePositive.png")
plt.close()

# --- Grafik 4: False Negative ---
fig, ax = plt.subplots(figsize=(10, 6))
bars1 = ax.bar(x - width/2, nb_fns,  width, label='Naive Bayes', color='mediumpurple', edgecolor='black')
bars2 = ax.bar(x + width/2, xgb_fns, width, label='XGBoost',     color='plum',         edgecolor='black')
ax.set_xlabel('Rasio Data Adaptasi', fontsize=12, fontweight='bold')
ax.set_ylabel('Jumlah False Negative', fontsize=12, fontweight='bold')
ax.set_title('Pengaruh Rasio Data Adaptasi terhadap False Negative\n(Spam yang lolos ke inbox)',
             fontsize=13, fontweight='bold')
ax.set_xticks(x)
ax.set_xticklabels(labels)
ax.legend(fontsize=11)
ax.grid(axis='y', alpha=0.3, linestyle='--')
for bars in [bars1, bars2]:
    for bar in bars:
        h = bar.get_height()
        ax.annotate(f'{int(h)}',
                    xy=(bar.get_x() + bar.get_width() / 2, h),
                    xytext=(0, 3), textcoords='offset points',
                    ha='center', va='bottom', fontsize=9, fontweight='bold')
plt.tight_layout()
f_fn = 'grafik_skripsi/Gambar_IV_Eksperimen_Rasio_FalseNegative.png'
plt.savefig(f_fn, dpi=300, bbox_inches='tight')
print("  [4/4] Grafik FN disimpan: Gambar_IV_Eksperimen_Rasio_FalseNegative.png")
plt.close()

# --- Grafik 5: Akurasi Line Chart (untuk melihat tren) ---
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

axes[0].plot(labels, nb_accs,  marker='o', linewidth=2, markersize=8,
             color='steelblue', label='NB Akurasi')
axes[0].plot(labels, nb_f1s,   marker='s', linewidth=2, markersize=8,
             color='skyblue',   label='NB F1-Score', linestyle='--')
for i, (a, f) in enumerate(zip(nb_accs, nb_f1s)):
    axes[0].annotate(f'{a:.1f}%', (labels[i], a), textcoords='offset points',
                     xytext=(0, 8), ha='center', fontsize=9, fontweight='bold', color='steelblue')
axes[0].set_title('Tren Performa Naive Bayes', fontsize=13, fontweight='bold')
axes[0].set_xlabel('Rasio Adaptasi', fontsize=11)
axes[0].set_ylabel('Persentase (%)', fontsize=11)
axes[0].set_ylim([40, 100])
axes[0].legend()
axes[0].grid(alpha=0.3)

axes[1].plot(labels, xgb_accs, marker='o', linewidth=2, markersize=8,
             color='seagreen',  label='XGB Akurasi')
axes[1].plot(labels, xgb_f1s,  marker='s', linewidth=2, markersize=8,
             color='lightgreen', label='XGB F1-Score', linestyle='--')
for i, (a, f) in enumerate(zip(xgb_accs, xgb_f1s)):
    axes[1].annotate(f'{a:.1f}%', (labels[i], a), textcoords='offset points',
                     xytext=(0, 8), ha='center', fontsize=9, fontweight='bold', color='seagreen')
axes[1].set_title('Tren Performa XGBoost', fontsize=13, fontweight='bold')
axes[1].set_xlabel('Rasio Adaptasi', fontsize=11)
axes[1].set_ylabel('Persentase (%)', fontsize=11)
axes[1].set_ylim([40, 100])
axes[1].legend()
axes[1].grid(alpha=0.3)

plt.suptitle('Tren Performa Model terhadap Variasi Rasio Data Adaptasi',
             fontsize=14, fontweight='bold')
plt.tight_layout()
f_tren = 'grafik_skripsi/Gambar_IV_Eksperimen_Rasio_TrenPerforma.png'
plt.savefig(f_tren, dpi=300, bbox_inches='tight')
print("  [+] Grafik Tren disimpan: Gambar_IV_Eksperimen_Rasio_TrenPerforma.png")
plt.close()

print("\n" + "="*80)
print("EKSPERIMEN SELESAI")
print("="*80)
print("File output:")
print("  - eval_results/NB_XGB_ADAPT_RATIO_EXPERIMENT.csv")
print("  - Gambar_IV_Eksperimen_Rasio_Akurasi.png")
print("  - Gambar_IV_Eksperimen_Rasio_F1Score.png")
print("  - Gambar_IV_Eksperimen_Rasio_FalsePositive.png")
print("  - Gambar_IV_Eksperimen_Rasio_FalseNegative.png")
print("  - Gambar_IV_Eksperimen_Rasio_TrenPerforma.png")
print("\nDONE")
