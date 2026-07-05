# Dokumentasi Model Klasifikasi Spam Email (Skripsi)

## 1. Judul Skripsi

> **"Analisis Performa Complement Naive Bayes dan XGBoost dalam Mengatasi Concept Drift pada Klasifikasi Spam Email Menggunakan Pendekatan Domain Adaptation"**

**Catatan terminologi:** Concept Drift yang dimaksud adalah **Covariate Shift** — pergeseran distribusi statistik data akibat perbedaan era antara data training (email Kaggle 2000-an) dan data uji (email pribadi modern). Ini diterima secara akademis dalam literatur spam filtering.

---

## 2. Konteks & Tujuan Skripsi

Skripsi membandingkan **2 metode** klasifikasi spam email menggunakan **Naive Bayes (ComplementNB)** dan **XGBoost**:

| Metode       | Deskripsi                                                                                        | File Skrip               |
| ------------ | ------------------------------------------------------------------------------------------------ | ------------------------ |
| **Metode 1** | Train murni di `emails.csv` (Kaggle, era 2000-an), test di email pribadi modern — tanpa adaptasi | `NB_XGB_PURE.py`         |
| **Metode 2** | Sama + domain adaptation: 30% data test dimasukkan ke training dengan instance weighting 8×      | `NB_XGB_MIX_IMPROVED.py` |

**Hipotesis:** H1 — Domain Adaptation meningkatkan performa secara signifikan karena mengatasi domain gap antara data historis dan email modern.

---

## 3. Hasil Evaluasi Final (Mode Full, identik skrip skripsi)

### Metode 1 — Tanpa Domain Adaptation

| Model       | Akurasi | Presisi | Recall | F1-Score | Threshold |
| ----------- | ------- | ------- | ------ | -------- | --------- |
| Naive Bayes | ~51.5%  | 53.58%  | 51.5%  | 43.26%   | ~0.66     |
| XGBoost     | ~48%    | 47.87%  | 48%    | 47.19%   | ~0.59     |

### Metode 2 — Domain Adaptation 30% (Final)

| Model       | Akurasi | Presisi | Recall | F1-Score | Threshold |
| ----------- | ------- | ------- | ------ | -------- | --------- |
| Naive Bayes | **77%** | 81.4%   | 77%    | 76.17%   | 0.51      |
| XGBoost     | **93%** | 93.08%  | 93%    | **93%**  | 0.64      |

**Confusion Matrix XGBoost (Metode 2):** TN=333, FP=17, FN=32, TP=318
**Config:** Train=5.728 email | Adapt=300 (30%) | Test=700 | GPU CUDA RTX 3050

**Eksperimen Rasio Adaptasi (dari riwayat web app):**

- 20% → XGB M2: 91.38%
- 30% → XGB M2: **93%** (dipakai di skripsi)
- 40% → XGB M2: 93.5%
- 50% → XGB M2: 93%

---

## 4. Dataset

| File                          | Keterangan                                   | Jumlah       |
| ----------------------------- | -------------------------------------------- | ------------ |
| `emails.csv`                  | Dataset training utama (Kaggle, era 2000-an) | 5.728 email  |
| `data_test_berlabel_awal.csv` | Dataset test email pribadi modern (sep=`;`)  | 2.500 email  |
| `data/enron_spam_data.csv`    | Dataset tambahan (tidak dipakai di final)    | 33.716 email |
| `data/Phishing_Email.csv`     | Dataset tambahan (untuk uji web app)         | 18.650 email |

**Balancing test set:** 500 Non-Spam + 500 Spam = 1.000 email
**Label kolom:** `emails.csv` → `text`, `spam` (0/1) | `data_test_berlabel_awal.csv` → `Text`, `Label` (0/1, sep=`;`)

---

## 5. Pipeline ML (Identik Kedua Skrip)

### Preprocessing

```
lowercase → urltoken → emailtoken → pricetoken → longnum → numtoken → bersihkan simbol
```

### Fitur Lengkap

**A. TF-IDF**

- Word: unigram+bigram, max_features=20.000, min_df=2, max_df=0.85, sublinear_tf=True
- Char: char_wb, ngram(3,5), max_features=8.000, min_df=3, max_df=0.90

**B. Fitur Struktural (13 fitur)**

1. Panjang email normalized (min(length/3000, 1.0))
2. Kepadatan tanda seru (excl/length)
3. Kepadatan simbol dollar ($/length)
4. Kepadatan tanda tanya (?/length)
5. Rasio huruf kapital (upper/length)
6. Rasio kata ALL-CAPS (all_caps/n_words)
7. URL density (min(url/5, 1.0))
8. Email address density (email_count/n_words)
9. HTML tag density (min(tags/20, 1.0))
10. Banyak tanda seru binary (>3)
11. Terlalu banyak kapital binary (>30%)
12. Panjang dalam kata normalized (min(n_words/500, 1.0))
13. Deteksi platform legitimate binary (Facebook, Google, GitHub, dll)

**C. Keyword Spam (35 fitur binary)**
urgent, immediately, free, offer, winner, won, guarantee, bonus, prize, cash,
congratulations, selected, limited, exclusive, deal, discount, save, earn, income,
money, profit, investment, million, percent, risk, verify, account, password, bank,
credit, loan, pharmacy, pills, medication, weight, diet, click, unsubscribe

**D. SelectKBest Chi-Square (untuk NB saja)**

- k=12.000 (pilih 12.000 fitur terbaik dari 20.000 word TF-IDF)

**Total fitur:**

- NB: 12.000 (setelah SelectKBest)
- XGB: ~28.051 (20k word + 8k char + 51 struktural/keyword)

### Hyperparameter XGBoost Metode 2

```python
n_estimators=3000, learning_rate=0.02, max_depth=6,
scale_pos_weight=ratio, subsample=0.75, colsample_bytree=0.6,
gamma=0.5, reg_alpha=0.1, reg_lambda=2.0, min_child_weight=5,
tree_method='hist', device='cuda', early_stopping_rounds=80
```

---

## 6. Struktur File Proyek (Model)

`
Code_Spam_Email/
├── NB_XGB_PURE.py              ← Metode 1 FINAL (tidak diubah)
├── NB_XGB_MIX_IMPROVED.py      ← Metode 2 FINAL
├── NB_XGB_ADAPT_RATIO_EXPERIMENT.py ← Skrip uji rasio adaptasi
├── DOKUMENTASI_MODEL.md        ← File ini
├── data/                       ← Folder seluruh dataset
├── eval_results/               ← Hasil eksekusi model (CSV logs)
└── grafik_skripsi/             ← Kumpulan file output visual / grafik (.png)
`

