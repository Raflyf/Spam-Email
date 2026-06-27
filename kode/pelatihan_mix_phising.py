import pandas as pd
import numpy as np
import re
import warnings
warnings.filterwarnings('ignore')

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import ComplementNB
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from scipy.sparse import hstack

print("="*80)
print("FINAL PIPELINE - PHISHING + DOMAIN ADAPTATION")
print("="*80)

# ==========================================
# 1. LOAD DATA
# ==========================================
print("\n[1/7] Loading Dataset...")

# 1. Dataset training (Phishing Email)
df_train = pd.read_csv('data/Phishing_Email.csv')
df_train = df_train.rename(columns={'Email Type': 'Spam/Ham', 'Email Text': 'Text'})
df_train['Spam/Ham'] = df_train['Spam/Ham'].map({'Phishing Email': 1, 'Safe Email': 0})
df_train = df_train.dropna(subset=['Text', 'Spam/Ham'])
df_train['Text'] = df_train['Text'].astype(str)

# 2. Dataset uji email pribadi
df_test = pd.read_csv('data/data_test_berlabel_awal.csv', sep=';')
if 'Label' in df_test.columns:
    df_test = df_test.rename(columns={'Label': 'Spam/Ham'})
df_test['Text'] = df_test['Text'].fillna('')

print(f"Train awal: {len(df_train)}")
print(f"Test awal: {len(df_test)}")

# ==========================================
# 2. DOMAIN ADAPTATION
# ==========================================
print("\n[2/7] Domain Adaptation...")

df_test_sample = df_test.sample(frac=0.3, random_state=42)
df_train_combined = pd.concat([df_train, df_test_sample], ignore_index=True)

df_test_final = df_test.drop(df_test_sample.index)

print(f"Train setelah adaptasi: {len(df_train_combined)}")
print(f"Test final: {len(df_test_final)}")

# ==========================================
# 3. PREPROCESSING (NO STEMMING)
# ==========================================
print("\n[3/7] Preprocessing...")

def preprocess(text):
    text = str(text).lower()
    text = re.sub(r'http\S+|www\S+', ' URL ', text)
    text = re.sub(r'\S+@\S+', ' EMAIL ', text)
    text = re.sub(r'\d+', ' NUM ', text)
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)

    words = text.split()
    words = [w for w in words if len(w) > 2]

    return ' '.join(words)

X_train = df_train_combined['Text'].apply(preprocess)
y_train = df_train_combined['Spam/Ham']

X_test = df_test_final['Text'].apply(preprocess)
y_test = df_test_final['Spam/Ham']

# ==========================================
# 4. FEATURE ENGINEERING
# ==========================================
print("\n[4/7] Feature Engineering...")

def extra_features(text):
    return [
        len(text),
        text.count('!'),
        text.count('$'),
        text.count('http'),
        int('free' in text),
        int('win' in text),
        int('click' in text),
    ]

X_train_extra = np.array([extra_features(t) for t in X_train])
X_test_extra = np.array([extra_features(t) for t in X_test])

# ==========================================
# 5. TF-IDF
# ==========================================
print("\n[5/7] TF-IDF...")

tfidf = TfidfVectorizer(
    max_features=15000,
    ngram_range=(1,2),
    min_df=2,
    max_df=0.9,
    stop_words='english'
)

X_train_tfidf = tfidf.fit_transform(X_train)
X_test_tfidf = tfidf.transform(X_test)

X_train_final = hstack([X_train_tfidf, X_train_extra])
X_test_final = hstack([X_test_tfidf, X_test_extra])

print("Final shape:", X_train_final.shape)

# ==========================================
# 6. MODEL TRAINING
# ==========================================
print("\n[6/7] Training...")

ratio = (y_train == 0).sum() / (y_train == 1).sum()

nb_model = ComplementNB(alpha=0.1)
nb_model.fit(X_train_final, y_train)

xgb_model = XGBClassifier(
    n_estimators=300,
    learning_rate=0.05,
    max_depth=8,
    scale_pos_weight=ratio,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    eval_metric='logloss',
    tree_method='hist'
)

xgb_model.fit(X_train_final, y_train)

# ==========================================
# 7. EVALUATION
# ==========================================
print("\n[7/7] Evaluation...")

def pct(x):
    return f"{x*100:.2f}%"

def evaluate(y_true, y_pred, name):
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, average='weighted', zero_division=0)
    rec = recall_score(y_true, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_true, y_pred, average='weighted', zero_division=0)

    print("\n" + "="*50)
    print(f"MODEL: {name}")
    print("="*50)
    print(f"Akurasi   : {pct(acc)}")
    print(f"Presisi   : {pct(prec)}")
    print(f"Recall    : {pct(rec)}")
    print(f"F1-Score  : {pct(f1)}")
    print("\nConfusion Matrix:\n", confusion_matrix(y_true, y_pred))

    return acc

nb_pred = nb_model.predict(X_test_final)
xgb_pred = xgb_model.predict(X_test_final)

nb_acc = evaluate(y_test, nb_pred, "Naive Bayes")
xgb_acc = evaluate(y_test, xgb_pred, "XGBoost")

# ==========================================
# FINAL COMPARISON
# ==========================================
print("\n" + "="*50)
print("PERBANDINGAN MODEL")
print("="*50)

comparison = pd.DataFrame({
    'Algoritma': ['Naive Bayes', 'XGBoost'],
    'Akurasi (%)': [pct(nb_acc), pct(xgb_acc)]
})

print(comparison.to_string(index=False))

# ==========================================
# CONCLUSION
# ==========================================
winner = "Naive Bayes" if nb_acc > xgb_acc else "XGBoost"

print("\nKESIMPULAN:")
print(f"Model terbaik: {winner}")
print("\nDONE")