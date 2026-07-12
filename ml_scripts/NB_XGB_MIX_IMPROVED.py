from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import ComplementNB
from sklearn.feature_selection import SelectKBest, chi2
from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix, classification_report,
    precision_recall_fscore_support
)
from scipy.sparse import hstack, csr_matrix
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
import re
import warnings
warnings.filterwarnings('ignore')



print("=" * 80)
print("METODE 2 - DOMAIN ADAPTATION (FINAL)")
print("Config: Weight 8.0, XGB Tuned, NB Word-Only, No Data Leakage")
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
# 1. LOAD DATA
# ==========================================
print("\n[1/6] Loading Dataset...")

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

print(f"Data Kaggle  : {len(df_train)} email")
print(f"  Ham  (0)   : {(df_train['Spam/Ham']==0).sum()}")
print(f"  Spam (1)   : {(df_train['Spam/Ham']==1).sum()}")

# ==========================================
# 2. DOMAIN ADAPTATION + INSTANCE WEIGHTING
# ==========================================
print("\n[2/6] Domain Adaptation + Instance Weighting...")

ADAPT_FRAC   = 0.3
ADAPT_WEIGHT = 8.0

# Pembagian data adaptasi (30%) dan test final (70%) menggunakan train_test_split
df_adapt, df_test_final = train_test_split(
    df_test, train_size=ADAPT_FRAC, random_state=42, stratify=df_test['Spam/Ham']
)
df_adapt = df_adapt.reset_index(drop=True)
df_test_final = df_test_final.reset_index(drop=True)

# Gabungkan data Kaggle + data adaptasi
df_train_combined = pd.concat(
    [df_train, df_adapt[['Text', 'Spam/Ham']]], ignore_index=True
)

n_source = len(df_train)
sample_weights = np.ones(len(df_train_combined), dtype=np.float32)
sample_weights[n_source:] = ADAPT_WEIGHT

print(f"  Data adaptasi     : {len(df_adapt)} email")
print(f"    Ham  (0)        : {(df_adapt['Spam/Ham']==0).sum()}")
print(f"    Spam (1)        : {(df_adapt['Spam/Ham']==1).sum()}")
print(f"  Train + adaptasi  : {len(df_train_combined)}")
print(f"  Bobot sampel adapt: {ADAPT_WEIGHT}x")
print(f"  Test final (murni): {len(df_test_final)} email")
print(f"    Ham  (0)        : {(df_test_final['Spam/Ham']==0).sum()}")
print(f"    Spam (1)        : {(df_test_final['Spam/Ham']==1).sum()}")

# ==========================================
# 3. PREPROCESSING
# ==========================================
print("\n[3/6] Preprocessing...")

def preprocess(text):
    text = str(text).lower()
    text = re.sub(r'http\S+|www\S+',  ' urltoken ',   text)
    text = re.sub(r'\S+@\S+',         ' emailtoken ', text)
    text = re.sub(r'\$[\d,]+',        ' pricetoken ', text)
    text = re.sub(r'\b\d{5,}\b',      ' longnum ',    text)
    text = re.sub(r'\b\d+\b',         ' numtoken ',   text)
    text = re.sub(r'[^a-zA-Z\s]',     ' ',            text)
    return ' '.join(w for w in text.split() if len(w) > 1)

X_train_text = df_train_combined['Text'].apply(preprocess)
y_train      = df_train_combined['Spam/Ham'].values.astype(np.int32)
X_test_text  = df_test_final['Text'].apply(preprocess)
y_test       = df_test_final['Spam/Ham'].values.astype(np.int32)

print("Preprocessing selesai.")

# ==========================================
# 4. FEATURE ENGINEERING
# ==========================================
print("\n[4/6] Feature Engineering...")

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

X_train_extra = np.array([extra_features(t) for t in df_train_combined['Text']], dtype=np.float32)
X_test_extra  = np.array([extra_features(t) for t in df_test_final['Text']],    dtype=np.float32)

print(f"  Jumlah extra features: {X_train_extra.shape[1]}")

# ==========================================
# 5. TF-IDF
# ==========================================
print("\n[5/6] TF-IDF...")

tfidf_word = TfidfVectorizer(
    max_features=20000, ngram_range=(1, 2),
    min_df=2, max_df=0.85,
    stop_words='english', sublinear_tf=True,
)
X_train_word = tfidf_word.fit_transform(X_train_text)
X_test_word  = tfidf_word.transform(X_test_text)

tfidf_char = TfidfVectorizer(
    max_features=8000, analyzer='char_wb',
    ngram_range=(3, 5), min_df=3, max_df=0.90, sublinear_tf=True,
)
X_train_char = tfidf_char.fit_transform(X_train_text)
X_test_char  = tfidf_char.transform(X_test_text)

# Full hybrid untuk XGBoost
X_train_full = hstack([X_train_word, X_train_char, csr_matrix(X_train_extra)])
X_test_full  = hstack([X_test_word,  X_test_char,  csr_matrix(X_test_extra)])
X_train_full = X_train_full.astype(np.float32).tocsr()
X_test_full  = X_test_full.astype(np.float32).tocsr()

print(f"  Fitur XGB (hybrid): {X_train_full.shape[1]:,}")
print(f"  Fitur NB (word)   : {X_train_word.shape[1]:,}")

# ==========================================
# 6. TRAINING MODEL
# ==========================================
print("\n[6/6] Training Model...")

ratio = float((y_train == 0).sum()) / float((y_train == 1).sum())

# Validation split (15%) untuk threshold tuning
X_tr_full, X_val_full, y_tr, y_val, sw_tr, sw_val = train_test_split(
    X_train_full, y_train, sample_weights,
    test_size=0.15, random_state=42, stratify=y_train
)

# Slice word features untuk NB
n_word = X_train_word.shape[1]
X_tr_word_only  = X_tr_full[:,  :n_word]
X_val_word_only = X_val_full[:, :n_word]

def find_best_threshold(proba, y_true):
    best_thresh, best_score = 0.5, 0.0
    for t in np.arange(0.15, 0.85, 0.01):
        pred  = (proba >= t).astype(int)
        score = f1_score(y_true, pred, average='weighted', zero_division=0)
        if score > best_score:
            best_score, best_thresh = score, t
    return best_thresh, best_score

# ---- NAIVE BAYES ----
print("  [NB] Training (Word TF-IDF + SelectKBest + Instance Weighting)...")
selector = SelectKBest(chi2, k=12000)
X_tr_nb  = selector.fit_transform(X_tr_word_only, y_tr)
X_val_nb = selector.transform(X_val_word_only)
X_test_nb = selector.transform(X_test_word)

nb_model = ComplementNB(alpha=0.1)
nb_model.fit(X_tr_nb, y_tr, sample_weight=sw_tr)

# Threshold dari VALIDATION set
nb_val_proba = nb_model.predict_proba(X_val_nb)[:, 1]
best_thresh_nb, f1nb = find_best_threshold(nb_val_proba, y_val)
print(f"  [NB] Threshold (dari val): {best_thresh_nb:.2f}  |  Val F1: {f1nb*100:.2f}%")

# ---- XGBOOST (GPU, TUNED) ----
print(f"  [XGB] Training ({'CUDA / RTX 3050' if USE_GPU else 'CPU'})...")

xgb_model = XGBClassifier(
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

xgb_model.fit(
    X_tr_full, y_tr,
    sample_weight = sw_tr,
    eval_set      = [(X_val_full, y_val)],
    verbose       = False,
)

# Threshold dari VALIDATION set
xgb_val_proba = xgb_model.predict_proba(X_val_full)[:, 1]
best_thresh_xgb, f1xgb = find_best_threshold(xgb_val_proba, y_val)
print(f"  [XGB] Threshold (dari val): {best_thresh_xgb:.2f}  |  Val F1: {f1xgb*100:.2f}%")
print(f"  [XGB] Best iteration: {xgb_model.best_iteration}")

# ==========================================
# EVALUASI & EXPORT
# ==========================================
print("\n" + "=" * 80)
print("HASIL EVALUASI (Threshold dari Validation Set - No Data Leakage)")
print("=" * 80)

def pct(x):
    return f"{x * 100:.2f}%"

def evaluate(y_true, y_pred, name):
    acc  = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, average='weighted', zero_division=0)
    rec  = recall_score(y_true, y_pred, average='weighted', zero_division=0)
    f1   = f1_score(y_true, y_pred, average='weighted', zero_division=0)
    cm   = confusion_matrix(y_true, y_pred)
    p_cls, r_cls, f1_cls, _ = precision_recall_fscore_support(
        y_true, y_pred, labels=[0, 1], zero_division=0
    )
    print(f"\n{'='*60}")
    print(f"  MODEL: {name}")
    print(f"{'='*60}")
    print(f"  Akurasi   : {pct(acc)}")
    print(f"  Presisi   : {pct(prec)}")
    print(f"  Recall    : {pct(rec)}")
    print(f"  F1-Score  : {pct(f1)}")
    print("\n  Confusion Matrix:")
    print("                   Prediksi Non-Spam   Prediksi Spam")
    print("    Aktual Non-Spam         {cm[0][0]:>5}              {cm[0][1]:>5}")
    print("    Aktual Spam             {cm[1][0]:>5}              {cm[1][1]:>5}")
    print("\n  Classification Report:")
    print(classification_report(y_true, y_pred, target_names=['Non-Spam', 'Spam']))
    return {
        'Algoritma'                        : name,
        'Akurasi Total (%)'                : pct(acc),
        'Presisi Weighted (%)'             : pct(prec),
        'Recall Weighted (%)'              : pct(rec),
        'F1-Score Weighted (%)'            : pct(f1),
        'TN (Aktual Non-Spam - Prediksi Non-Spam)'   : cm[0][0],
        'FP (Aktual Non-Spam - Prediksi Spam)'  : cm[0][1],
        'FN (Aktual Spam - Prediksi Non-Spam)'  : cm[1][0],
        'TP (Aktual Spam - Prediksi Spam)' : cm[1][1],
        'Presisi Non-Spam (%)'                  : pct(p_cls[0]),
        'Recall Non-Spam (%)'                   : pct(r_cls[0]),
        'F1-Score Non-Spam (%)'                 : pct(f1_cls[0]),
        'Presisi Spam (%)'                 : pct(p_cls[1]),
        'Recall Spam (%)'                  : pct(r_cls[1]),
        'F1-Score Spam (%)'                : pct(f1_cls[1]),
    }

# Aplikasikan threshold dari validation ke test (TANPA tuning ulang)
nb_proba  = nb_model.predict_proba(X_test_nb)[:, 1]
nb_pred   = (nb_proba >= best_thresh_nb).astype(int)

xgb_proba = xgb_model.predict_proba(X_test_full)[:, 1]
xgb_pred  = (xgb_proba >= best_thresh_xgb).astype(int)

nb_results  = evaluate(y_test, nb_pred,  f"Naive Bayes (Threshold {best_thresh_nb:.2f})")
xgb_results = evaluate(y_test, xgb_pred, f"XGBoost (Threshold {best_thresh_xgb:.2f})")

print(f"\n{'='*60}")
print("  PERBANDINGAN MODEL")
print(f"{'='*60}")
comparison = pd.DataFrame([nb_results, xgb_results])
print(comparison[[
    'Algoritma', 'Akurasi Total (%)',
    'Presisi Weighted (%)', 'Recall Weighted (%)', 'F1-Score Weighted (%)'
]].to_string(index=False))

# 5. Simpan Hasil Perbandingan
comparison.to_csv("eval_results/NB_XGB_MIX_IMPROVED.csv", index=False)
print("\n  Hasil disimpan ke: eval_results/NB_XGB_MIX_IMPROVED.csv")

# ==========================================
# VISUALISASI: Top 20 Fitur Chi-Square
# ==========================================
# import matplotlib.pyplot as plt

# print("\n[+] Membuat Grafik Top 20 Fitur Chi-Square...")
# feature_names = tfidf_word.get_feature_names_out()
# chi2_scores = selector.scores_

# df_features = pd.DataFrame({
#     'Fitur': feature_names,
#     'Skor_Chi2': chi2_scores
# })

# top_20 = df_features.sort_values(by='Skor_Chi2', ascending=False).head(20)

# plt.figure(figsize=(10, 8))
# plt.barh(top_20['Fitur'][::-1], top_20['Skor_Chi2'][::-1], color='seagreen')
# plt.title('Top 20 Fitur Teks dengan Skor Chi-Square Tertinggi (Metode 2)')
# plt.xlabel('Skor Chi-Square')
# plt.ylabel('Fitur / Token')
# plt.tight_layout()

# nama_file_grafik = 'grafik_skripsi/Gambar_IV_3_Top20_ChiSquare_Metode2_Improved.png'
# plt.savefig(nama_file_grafik, dpi=300, bbox_inches='tight')
# print(f"  Grafik disimpan: {nama_file_grafik}")
# plt.show()

# print("\nDONE")

# ==========================================
# VISUALISASI TAMBAHAN: Confusion Matrix & Grafik Perbandingan
# ==========================================


print("\n[+] Membuat Visualisasi Tambahan untuk Skripsi...")

# 1. Confusion Matrix untuk Naive Bayes
cm_nb = confusion_matrix(y_test, nb_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(cm_nb, annot=True, fmt='d', cmap='Blues', cbar=True,
            xticklabels=['Non-Spam', 'Spam'], yticklabels=['Non-Spam', 'Spam'],
            annot_kws={'size': 16, 'weight': 'bold'})
plt.title(f'Confusion Matrix - Naive Bayes (Metode 2)\nThreshold: {best_thresh_nb:.2f}', 
          fontsize=14, fontweight='bold')
plt.xlabel('Prediksi', fontsize=12, fontweight='bold')
plt.ylabel('Aktual', fontsize=12, fontweight='bold')
plt.tight_layout()
nama_cm_nb = 'grafik_skripsi/Gambar_IV_ConfusionMatrix_NB_Metode2.png'
plt.savefig(nama_cm_nb, dpi=300, bbox_inches='tight')
print(f"  [1/5] Confusion Matrix NB disimpan: {nama_cm_nb}")
plt.close()

# 2. Confusion Matrix untuk XGBoost
cm_xgb = confusion_matrix(y_test, xgb_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(cm_xgb, annot=True, fmt='d', cmap='Greens', cbar=True,
            xticklabels=['Non-Spam', 'Spam'], yticklabels=['Non-Spam', 'Spam'],
            annot_kws={'size': 16, 'weight': 'bold'})
plt.title(f'Confusion Matrix - XGBoost (Metode 2)\nThreshold: {best_thresh_xgb:.2f}', 
          fontsize=14, fontweight='bold')
plt.xlabel('Prediksi', fontsize=12, fontweight='bold')
plt.ylabel('Aktual', fontsize=12, fontweight='bold')
plt.tight_layout()
nama_cm_xgb = 'grafik_skripsi/Gambar_IV_ConfusionMatrix_XGB_Metode2.png'
plt.savefig(nama_cm_xgb, dpi=300, bbox_inches='tight')
print(f"  [2/5] Confusion Matrix XGB disimpan: {nama_cm_xgb}")
plt.close()

# 3. Top 20 Fitur Chi-Square
print("  [3/5] Membuat Grafik Top 20 Fitur Chi-Square...")
feature_names = tfidf_word.get_feature_names_out()
chi2_scores = selector.scores_

df_features = pd.DataFrame({
    'Fitur': feature_names,
    'Skor_Chi2': chi2_scores
})

top_20 = df_features.sort_values(by='Skor_Chi2', ascending=False).head(20)

plt.figure(figsize=(10, 8))
plt.barh(top_20['Fitur'][::-1], top_20['Skor_Chi2'][::-1], color='seagreen')
plt.title('Top 20 Fitur Teks dengan Skor Chi-Square Tertinggi (Metode 2)', 
          fontsize=14, fontweight='bold')
plt.xlabel('Skor Chi-Square', fontsize=12, fontweight='bold')
plt.ylabel('Fitur / Token', fontsize=12, fontweight='bold')
plt.tight_layout()

nama_file_grafik = 'grafik_skripsi/Gambar_IV_Top20_ChiSquare_Metode2.png'
plt.savefig(nama_file_grafik, dpi=300, bbox_inches='tight')
print(f"       Grafik Chi-Square disimpan: {nama_file_grafik}")
plt.close()

# 4. Perbandingan Metrik Model (Metode 2)
print("  [4/5] Membuat Grafik Perbandingan Metrik Model...")

metrics = ['Akurasi', 'Presisi', 'Recall', 'F1-Score']
nb_scores = [
    accuracy_score(y_test, nb_pred) * 100,
    precision_score(y_test, nb_pred, average='weighted') * 100,
    recall_score(y_test, nb_pred, average='weighted') * 100,
    f1_score(y_test, nb_pred, average='weighted') * 100
]
xgb_scores = [
    accuracy_score(y_test, xgb_pred) * 100,
    precision_score(y_test, xgb_pred, average='weighted') * 100,
    recall_score(y_test, xgb_pred, average='weighted') * 100,
    f1_score(y_test, xgb_pred, average='weighted') * 100
]

x = np.arange(len(metrics))
width = 0.35

fig, ax = plt.subplots(figsize=(10, 6))
bars1 = ax.bar(x - width/2, nb_scores, width, label='Naive Bayes', color='skyblue', edgecolor='black')
bars2 = ax.bar(x + width/2, xgb_scores, width, label='XGBoost', color='lightgreen', edgecolor='black')

ax.set_xlabel('Metrik Evaluasi', fontsize=12, fontweight='bold')
ax.set_ylabel('Persentase (%)', fontsize=12, fontweight='bold')
ax.set_title('Perbandingan Performa Model (Metode 2 - Domain Adaptation)', 
             fontsize=14, fontweight='bold')
ax.set_xticks(x)
ax.set_xticklabels(metrics)
ax.legend(fontsize=11)
ax.set_ylim([0, 100])
ax.grid(axis='y', alpha=0.3, linestyle='--')

# Tambahkan nilai di atas bar
for bars in [bars1, bars2]:
    for bar in bars:
        height = bar.get_height()
        ax.annotate(f'{height:.1f}%',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 3),
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=9, fontweight='bold')

plt.tight_layout()
nama_comparison = 'grafik_skripsi/Gambar_IV_Perbandingan_Metrik_Metode2.png'
plt.savefig(nama_comparison, dpi=300, bbox_inches='tight')
print(f"       Grafik Perbandingan disimpan: {nama_comparison}")
plt.close()

# 5. Perbandingan Metode 1 vs Metode 2
print("  [5/5] Membuat Grafik Perbandingan Metode 1 vs Metode 2...")

# Data perbandingan (update sesuai hasil run terakhir)
metode1_nb_acc = 51.50   # Hasil Metode 1
metode1_xgb_acc = 48.20  # Hasil Metode 1
metode2_nb_acc = accuracy_score(y_test, nb_pred) * 100
metode2_xgb_acc = accuracy_score(y_test, xgb_pred) * 100

algorithms = ['Naive Bayes', 'XGBoost']
metode1_scores = [metode1_nb_acc, metode1_xgb_acc]
metode2_scores = [metode2_nb_acc, metode2_xgb_acc]

x = np.arange(len(algorithms))
width = 0.35

fig, ax = plt.subplots(figsize=(10, 6))
bars1 = ax.bar(x - width/2, metode1_scores, width, label='Metode 1 (Pure)', 
               color='lightcoral', edgecolor='black')
bars2 = ax.bar(x + width/2, metode2_scores, width, label='Metode 2 (Domain Adaptation)', 
               color='lightseagreen', edgecolor='black')

ax.set_xlabel('Algoritma', fontsize=12, fontweight='bold')
ax.set_ylabel('Akurasi (%)', fontsize=12, fontweight='bold')
ax.set_title('Perbandingan Akurasi: Metode 1 vs Metode 2', fontsize=14, fontweight='bold')
ax.set_xticks(x)
ax.set_xticklabels(algorithms)
ax.legend(fontsize=11)
ax.set_ylim([0, 100])
ax.grid(axis='y', alpha=0.3, linestyle='--')

# Tambahkan nilai di atas bar
for bars in [bars1, bars2]:
    for bar in bars:
        height = bar.get_height()
        ax.annotate(f'{height:.1f}%',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 3),
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=10, fontweight='bold')

plt.tight_layout()
nama_comparison_metode = 'grafik_skripsi/Gambar_IV_Perbandingan_Metode1_vs_Metode2.png'
plt.savefig(nama_comparison_metode, dpi=300, bbox_inches='tight')
print(f"       Grafik Perbandingan Metode disimpan: {nama_comparison_metode}")
plt.close()

print("\n" + "="*80)
print("SEMUA VISUALISASI BERHASIL DISIMPAN")
print("="*80)
print(f"1. {nama_cm_nb}")
print(f"2. {nama_cm_xgb}")
print(f"3. {nama_file_grafik}")
print(f"4. {nama_comparison}")
print(f"5. {nama_comparison_metode}")
print("\nDONE")
