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
print("METODE 1 - TRAIN KAGGLE, TEST EMAIL PRIBADI (FIXED - NO DATA LEAKAGE)")
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

# Balancing 500 ham vs 500 spam
df_ham  = df_test_raw[df_test_raw['Spam/Ham'] == 0].sample(n=500, random_state=42)
df_spam = df_test_raw[df_test_raw['Spam/Ham'] == 1].sample(n=500, random_state=42)
df_test = pd.concat([df_ham, df_spam]).sample(frac=1, random_state=42).reset_index(drop=True)

print(f"Data Kaggle  : {len(df_train)} email")
print(f"  Ham  (0)   : {(df_train['Spam/Ham']==0).sum()}")
print(f"  Spam (1)   : {(df_train['Spam/Ham']==1).sum()}")
print(f"\nData Pribadi (BALANCED): {len(df_test)} email")
print(f"  Ham  (0)   : {(df_test['Spam/Ham']==0).sum()}")
print(f"  Spam (1)   : {(df_test['Spam/Ham']==1).sum()}")

# ==========================================
# 2. PREPROCESSING
# ==========================================
print("\n[2/6] Preprocessing...")

def preprocess(text):
    text = str(text).lower()
    text = re.sub(r'http\S+|www\S+',  ' urltoken ',   text)
    text = re.sub(r'\S+@\S+',         ' emailtoken ', text)
    text = re.sub(r'\$[\d,]+',        ' pricetoken ', text)
    text = re.sub(r'\b\d{5,}\b',      ' longnum ',    text)
    text = re.sub(r'\b\d+\b',         ' numtoken ',   text)
    text = re.sub(r'[^a-zA-Z\s]',     ' ',            text)
    return ' '.join(w for w in text.split() if len(w) > 1)

X_train = df_train['Text'].apply(preprocess)
y_train = df_train['Spam/Ham'].values.astype(np.int32)

X_test  = df_test['Text'].apply(preprocess)
y_test  = df_test['Spam/Ham'].values.astype(np.int32)

print("Preprocessing selesai.")

# ==========================================
# 3. FEATURE ENGINEERING
# ==========================================
print("\n[3/6] Feature Engineering...")

HAM_PLATFORMS = [
    'facebook','google','mozilla','firefox','instagram',
    'twitter','linkedin','microsoft','apple','amazon',
    'youtube','github','whatsapp','telegram','zoom',
    'netflix','spotify','dropbox','slack','notion',
]

SPAM_KW = [
    'free','click','unsubscribe','offer','winner','won',
    'urgent','immediately','guarantee','bonus','prize','cash',
    'congratulations','selected','limited','exclusive','deal',
    'discount','save','earn','income','money','profit',
    'investment','million','percent','verify','account',
    'password','security','bank','credit','loan',
    'pharmacy','pills','medication','weight','diet',
    'buy now','order now','act now','click here',
    'this is not spam','you have been selected',
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
    # FIX: Hitung URL dan email dari teks mentah pakai regex
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

X_train_extra = np.array([extra_features(t) for t in df_train['Text']], dtype=np.float32)
X_test_extra  = np.array([extra_features(t) for t in df_test['Text']],  dtype=np.float32)

print(f"Jumlah extra features: {X_train_extra.shape[1]}")

# ==========================================
# 4. TF-IDF: WORD + CHAR N-GRAM
# ==========================================
print("\n[4/6] TF-IDF Word + Char N-grams...")

tfidf_word = TfidfVectorizer(
    max_features=20000,
    ngram_range=(1, 2),
    min_df=2,
    max_df=0.85,
    stop_words='english',
    sublinear_tf=True,
)
X_train_word = tfidf_word.fit_transform(X_train)
X_test_word  = tfidf_word.transform(X_test)

tfidf_char = TfidfVectorizer(
    max_features=10000,
    analyzer='char_wb',
    ngram_range=(3, 5),
    min_df=2,
    max_df=0.90,
    sublinear_tf=True,
)
X_train_char = tfidf_char.fit_transform(X_train)
X_test_char  = tfidf_char.transform(X_test)

# Gabungkan semua fitur
X_train_final_sp = hstack([X_train_word, X_train_char, csr_matrix(X_train_extra)])
X_test_final_sp  = hstack([X_test_word,  X_test_char,  csr_matrix(X_test_extra)])

X_train_final = X_train_final_sp.astype(np.float32).tocsr()
X_test_final  = X_test_final_sp.astype(np.float32).tocsr()

n_word_feats = X_train_word.shape[1]

print(f"  Total fitur XGBoost: {X_train_final.shape[1]:,}  |  dtype: {X_train_final.dtype}")

# ==========================================
# 5. TRAINING MODEL
# ==========================================
print("\n[5/6] Training Model...")

ratio = float((y_train == 0).sum()) / float((y_train == 1).sum())

# FIX: Validation split untuk threshold tuning (BUKAN test set)
X_tr, X_val, y_tr, y_val = train_test_split(
    X_train_final, y_train,
    test_size=0.15, random_state=42, stratify=y_train
)
X_tr_word  = X_tr[:,  :n_word_feats]
X_val_word = X_val[:, :n_word_feats]

# ---- NAIVE BAYES ----
print("  [NB] Training...")
selector      = SelectKBest(chi2, k=12000)
X_tr_nb_sel   = selector.fit_transform(X_tr_word, y_tr)
X_val_nb_sel  = selector.transform(X_val_word)
X_test_nb_sel = selector.transform(X_test_word.astype(np.float32))

class_ratio   = (y_tr == 0).sum() / (y_tr == 1).sum()
nb_sw         = np.where(y_tr == 1, class_ratio, 1.0).astype(np.float32)

nb_model = ComplementNB(alpha=0.05)
nb_model.fit(X_tr_nb_sel, y_tr, sample_weight=nb_sw)
print("  NB selesai")

# ---- XGBOOST (GPU) ----
print(f"  [XGB] Training ({'CUDA / RTX 3050' if USE_GPU else 'CPU'})...")

xgb_model = XGBClassifier(
    n_estimators          = 2000,
    learning_rate         = 0.03,
    max_depth             = 7,
    scale_pos_weight      = ratio,
    subsample             = 0.8,
    colsample_bytree      = 0.7,
    gamma                 = 0.3,
    reg_alpha             = 0.05,
    reg_lambda            = 1.0,
    min_child_weight      = 3,
    random_state          = 42,
    eval_metric           = 'logloss',
    tree_method           = 'hist',
    device                = XGB_DEVICE,
    early_stopping_rounds = 60,
    n_jobs                = 1,
)
xgb_model.fit(
    X_tr, y_tr,
    eval_set  = [(X_val, y_val)],
    verbose   = False,
)
print(f"  XGBoost selesai  |  Best iteration: {xgb_model.best_iteration}")

# ==========================================
# 6. THRESHOLD TUNING (dari VALIDATION SET, bukan test)
# ==========================================
print("\n[6/6] Threshold Tuning pada VALIDATION SET...")

def find_best_threshold(proba, y_true):
    best_thresh, best_score = 0.5, 0.0
    for t in np.arange(0.10, 0.95, 0.01):
        pred  = (proba >= t).astype(int)
        score = f1_score(y_true, pred, average='weighted', zero_division=0)
        if score > best_score:
            best_score, best_thresh = score, t
    return best_thresh, best_score

# FIX: Threshold dicari dari VALIDATION set
nb_proba_val  = nb_model.predict_proba(X_val_nb_sel)[:, 1]
xgb_proba_val = xgb_model.predict_proba(X_val)[:, 1]

best_thresh_nb,  f1_nb_val  = find_best_threshold(nb_proba_val,  y_val)
best_thresh_xgb, f1_xgb_val = find_best_threshold(xgb_proba_val, y_val)

print(f"  NB  threshold (dari val): {best_thresh_nb:.2f}  |  Val F1: {f1_nb_val*100:.2f}%")
print(f"  XGB threshold (dari val): {best_thresh_xgb:.2f}  |  Val F1: {f1_xgb_val*100:.2f}%")

# Aplikasikan threshold ke TEST SET (tanpa tuning ulang)
nb_proba_test  = nb_model.predict_proba(X_test_nb_sel)[:, 1]
xgb_proba_test = xgb_model.predict_proba(X_test_final)[:, 1]

nb_pred  = (nb_proba_test  >= best_thresh_nb).astype(int)
xgb_pred = (xgb_proba_test >= best_thresh_xgb).astype(int)

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
    print(f"    Aktual Non-Spam         {cm[0][0]:>5}              {cm[0][1]:>5}")
    print(f"    Aktual Spam             {cm[1][0]:>5}              {cm[1][1]:>5}")
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
comparison.to_csv("eval_results/NB_XGB_PURE.csv", index=False)
print("\n  Hasil disimpan ke: eval_results/NB_XGB_PURE.csv")

# ==========================================
# VISUALISASI: Top 20 Fitur Chi-Square
# ==========================================
# chi2_scores = selector.scores_

# df_features = pd.DataFrame({
#     'Fitur': feature_names,
#     'Skor_Chi2': chi2_scores
# })

# top_20 = df_features.sort_values(by='Skor_Chi2', ascending=False).head(20)

# plt.figure(figsize=(10, 8))
# plt.barh(top_20['Fitur'][::-1], top_20['Skor_Chi2'][::-1], color='steelblue')
# plt.title('Top 20 Fitur Teks dengan Skor Chi-Square Tertinggi (Metode 1)', 
#           fontsize=14, fontweight='bold')
# plt.xlabel('Skor Chi-Square', fontsize=12, fontweight='bold')
# plt.ylabel('Fitur / Token', fontsize=12, fontweight='bold')
# plt.tight_layout()

# nama_file_grafik = 'grafik_skripsi/Gambar_IV_Top20_ChiSquare_Metode1.png'
# plt.savefig(nama_file_grafik, dpi=300, bbox_inches='tight')
# print(f"  Grafik Chi-Square disimpan: {nama_file_grafik}")
# plt.show()

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
plt.title(f'Confusion Matrix - Naive Bayes (Metode 1)\nThreshold: {best_thresh_nb:.2f}', 
          fontsize=14, fontweight='bold')
plt.xlabel('Prediksi', fontsize=12, fontweight='bold')
plt.ylabel('Aktual', fontsize=12, fontweight='bold')
plt.tight_layout()
nama_cm_nb = 'grafik_skripsi/Gambar_IV_ConfusionMatrix_NB_Metode1.png'
plt.savefig(nama_cm_nb, dpi=300, bbox_inches='tight')
print(f"  [1/4] Confusion Matrix NB disimpan: {nama_cm_nb}")
plt.close()

# 2. Confusion Matrix untuk XGBoost
cm_xgb = confusion_matrix(y_test, xgb_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(cm_xgb, annot=True, fmt='d', cmap='Greens', cbar=True,
            xticklabels=['Non-Spam', 'Spam'], yticklabels=['Non-Spam', 'Spam'],
            annot_kws={'size': 16, 'weight': 'bold'})
plt.title(f'Confusion Matrix - XGBoost (Metode 1)\nThreshold: {best_thresh_xgb:.2f}', 
          fontsize=14, fontweight='bold')
plt.xlabel('Prediksi', fontsize=12, fontweight='bold')
plt.ylabel('Aktual', fontsize=12, fontweight='bold')
plt.tight_layout()
nama_cm_xgb = 'grafik_skripsi/Gambar_IV_ConfusionMatrix_XGB_Metode1.png'
plt.savefig(nama_cm_xgb, dpi=300, bbox_inches='tight')
print(f"  [2/4] Confusion Matrix XGB disimpan: {nama_cm_xgb}")
plt.close()

# 3. Top 20 Fitur Chi-Square
print("  [3/4] Membuat Grafik Top 20 Fitur Chi-Square...")
feature_names = tfidf_word.get_feature_names_out()
chi2_scores = selector.scores_

df_features = pd.DataFrame({
    'Fitur': feature_names,
    'Skor_Chi2': chi2_scores
})

top_20 = df_features.sort_values(by='Skor_Chi2', ascending=False).head(20)

plt.figure(figsize=(10, 8))
plt.barh(top_20['Fitur'][::-1], top_20['Skor_Chi2'][::-1], color='steelblue')
plt.title('Top 20 Fitur Teks dengan Skor Chi-Square Tertinggi (Metode 1)', 
          fontsize=14, fontweight='bold')
plt.xlabel('Skor Chi-Square', fontsize=12, fontweight='bold')
plt.ylabel('Fitur / Token', fontsize=12, fontweight='bold')
plt.tight_layout()

nama_file_grafik = 'grafik_skripsi/Gambar_IV_Top20_ChiSquare_Metode1.png'
plt.savefig(nama_file_grafik, dpi=300, bbox_inches='tight')
print(f"       Grafik Chi-Square disimpan: {nama_file_grafik}")
plt.close()

# 4. Perbandingan Metrik Model (Metode 1)
print("  [4/4] Membuat Grafik Perbandingan Metrik Model...")

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
ax.set_title('Perbandingan Performa Model (Metode 1)', fontsize=14, fontweight='bold')
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
nama_comparison = 'grafik_skripsi/Gambar_IV_Perbandingan_Metrik_Metode1.png'
plt.savefig(nama_comparison, dpi=300, bbox_inches='tight')
print(f"       Grafik Perbandingan disimpan: {nama_comparison}")
plt.close()

print("\n" + "="*80)
print("SEMUA VISUALISASI BERHASIL DISIMPAN")
print("="*80)
print(f"1. {nama_cm_nb}")
print(f"2. {nama_cm_xgb}")
print(f"3. {nama_file_grafik}")
print(f"4. {nama_comparison}")
print("\nDONE")

