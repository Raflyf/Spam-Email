import pandas as pd
import numpy as np
import re
import warnings
warnings.filterwarnings('ignore')

# NLP
from sklearn.feature_extraction.text import TfidfVectorizer, ENGLISH_STOP_WORDS
from nltk.stem import PorterStemmer

# Models
from sklearn.naive_bayes import MultinomialNB
from xgboost import XGBClassifier

# Evaluation
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, confusion_matrix
from sklearn.model_selection import GridSearchCV, cross_val_score

# ==========================================
# HEADER
# ==========================================
print("="*80)
print("FINAL THESIS PIPELINE - SPAM EMAIL CLASSIFICATION")
print("="*80)

# ==========================================
# 1. LOAD DATA
# ==========================================
print("\n[1/6] Loading Dataset...")

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

print(f"Train: {len(df_train)} | Test: {len(df_test)}")

# ==========================================
# 2. PREPROCESSING
# ==========================================
print("\n[2/6] Preprocessing...")

stemmer = PorterStemmer()
stop_words = set(ENGLISH_STOP_WORDS)

def preprocess(text):
    text = str(text).lower()
    text = re.sub(r'http\S+|www\S+', ' URL ', text)
    text = re.sub(r'\S+@\S+', ' EMAIL ', text)
    text = re.sub(r'\d+', ' NUM ', text)
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)

    words = text.split()
    words = [stemmer.stem(w) for w in words if w not in stop_words]

    return ' '.join(words)

X_train = df_train['Text'].apply(preprocess)
y_train = df_train['Spam/Ham']

X_test = df_test['Text'].apply(preprocess)
y_test = df_test['Spam/Ham']

# ==========================================
# 3. TF-IDF
# ==========================================
print("\n[3/6] TF-IDF...")

tfidf = TfidfVectorizer(
    max_features=10000,
    ngram_range=(1,2),
    min_df=3,
    max_df=0.85,
    sublinear_tf=True
)

X_train_tfidf = tfidf.fit_transform(X_train)
X_test_tfidf = tfidf.transform(X_test)

print("Shape:", X_train_tfidf.shape)

# ==========================================
# 4. MODEL TRAINING
# ==========================================
print("\n[4/6] Training...")

# Naive Bayes
nb_grid = GridSearchCV(
    MultinomialNB(),
    {'alpha': [0.01, 0.1, 1]},
    cv=5,
    scoring='f1_weighted',
    n_jobs=-1
)
nb_grid.fit(X_train_tfidf, y_train)
nb_model = nb_grid.best_estimator_

print("Best NB alpha:", nb_grid.best_params_)

# Handle imbalance
ratio = (y_train == 0).sum() / (y_train == 1).sum()

# XGBoost
xgb_model = XGBClassifier(
    n_estimators=200,
    learning_rate=0.1,
    max_depth=6,
    scale_pos_weight=ratio,
    random_state=42,
    eval_metric='logloss',
    tree_method='hist',
    verbosity=0
)

xgb_model.fit(X_train_tfidf, y_train)

# ==========================================
# 5. VALIDATION
# ==========================================
print("\n[5/6] Cross Validation...")

nb_cv = cross_val_score(nb_model, X_train_tfidf, y_train, cv=5, scoring='f1_weighted')
xgb_cv = cross_val_score(xgb_model, X_train_tfidf, y_train, cv=5, scoring='f1_weighted')

print(f"NB CV F1:  {nb_cv.mean():.4f}")
print(f"XGB CV F1: {xgb_cv.mean():.4f}")

# ==========================================
# 6. FINAL EVALUATION (PERCENT FORMAT)
# ==========================================
print("\n[6/6] Final Evaluation...")

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

    return acc, prec, rec, f1

nb_pred = nb_model.predict(X_test_tfidf)
xgb_pred = xgb_model.predict(X_test_tfidf)

nb_acc, nb_prec, nb_rec, nb_f1 = evaluate(y_test, nb_pred, "Naive Bayes")
xgb_acc, xgb_prec, xgb_rec, xgb_f1 = evaluate(y_test, xgb_pred, "XGBoost")

# ==========================================
# COMPARISON TABLE
# ==========================================
comparison = pd.DataFrame({
    'Algoritma': ['Naive Bayes', 'XGBoost'],
    'Akurasi (%)': [pct(nb_acc), pct(xgb_acc)],
    'Presisi (%)': [pct(nb_prec), pct(xgb_prec)],
    'Recall (%)': [pct(nb_rec), pct(xgb_rec)],
    'F1 (%)': [pct(nb_f1), pct(xgb_f1)]
})

print("\n" + "="*50)
print("PERBANDINGAN MODEL")
print("="*50)
print(comparison.to_string(index=False))

comparison.to_csv("eval_results/hasil_model_final.csv", index=False)

# ==========================================
# CONCLUSION
# ==========================================
if nb_acc > xgb_acc:
    winner = "Naive Bayes"
    diff = (nb_acc - xgb_acc)*100
elif xgb_acc > nb_acc:
    winner = "XGBoost"
    diff = (xgb_acc - nb_acc)*100
else:
    winner = "Tie"
    diff = 0

print("\nKESIMPULAN:")
print(f"Model terbaik: {winner}")
print(f"Selisih akurasi: {diff:.2f}%")
print("\nDONE")