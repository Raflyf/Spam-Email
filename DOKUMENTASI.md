# Dokumentasi Lengkap — Skripsi & Web App Spam Email Classifier

**Mahasiswa:** Rafly Firmansyah
**Program Studi:** Informatika, Universitas Bina Sarana Informatika
**Tanggal terakhir update:** 30 Juni 2026
**Direktori proyek:** `D:\skripsi\skripsi_spam\Code_Spam_Email`

---

## 1. Judul Skripsi

> **"Analisis Performa Complement Naive Bayes dan XGBoost dalam Mengatasi Concept Drift pada Klasifikasi Spam Email Menggunakan Pendekatan Domain Adaptation"**

**Catatan terminologi:** Concept Drift yang dimaksud adalah **Covariate Shift** — pergeseran distribusi statistik data akibat perbedaan era antara data training (email Kaggle 2000-an) dan data uji (email pribadi modern). Ini diterima secara akademis dalam literatur spam filtering.

---

## 2. Konteks & Tujuan Skripsi

Skripsi membandingkan **2 metode** klasifikasi spam email menggunakan **Naive Bayes (ComplementNB)** dan **XGBoost**:

| Metode             | Deskripsi                                                                                           | File Skrip                 |
| ------------------ | --------------------------------------------------------------------------------------------------- | -------------------------- |
| **Metode 1** | Train murni di `emails.csv` (Kaggle, era 2000-an), test di email pribadi modern — tanpa adaptasi | `NB_XGB_PURE.py`         |
| **Metode 2** | Sama + domain adaptation: 30% data test dimasukkan ke training dengan instance weighting 8×        | `NB_XGB_MIX_IMPROVED.py` |

**Hipotesis:** H1 — Domain Adaptation meningkatkan performa secara signifikan karena mengatasi domain gap antara data historis dan email modern.

---

## 3. Hasil Evaluasi Final (Mode Full, identik skrip skripsi)

### Metode 1 — Tanpa Domain Adaptation

| Model       | Akurasi | Presisi | Recall | F1-Score | Threshold |
| ----------- | ------- | ------- | ------ | -------- | --------- |
| Naive Bayes | ~51.5%  | 53.58%  | 51.5%  | 43.26%   | ~0.66     |
| XGBoost     | ~48%    | 47.87%  | 48%    | 47.19%   | ~0.59     |

### Metode 2 — Domain Adaptation 30% (Final)

| Model       | Akurasi       | Presisi | Recall | F1-Score      | Threshold |
| ----------- | ------------- | ------- | ------ | ------------- | --------- |
| Naive Bayes | **77%** | 81.4%   | 77%    | 76.17%        | 0.51      |
| XGBoost     | **93%** | 93.08%  | 93%    | **93%** | 0.64      |

**Confusion Matrix XGBoost (Metode 2):** TN=333, FP=17, FN=32, TP=318
**Config:** Train=5.728 email | Adapt=300 (30%) | Test=700 | GPU CUDA RTX 3050

**Eksperimen Rasio Adaptasi (dari riwayat web app):**

- 20% → XGB M2: 91.38%
- 30% → XGB M2: **93%** (dipakai di skripsi)
- 40% → XGB M2: 93.5%
- 50% → XGB M2: 93%

---

## 4. Dataset

| File                            | Keterangan                                    | Jumlah       |
| ------------------------------- | --------------------------------------------- | ------------ |
| `emails.csv`                  | Dataset training utama (Kaggle, era 2000-an)  | 5.728 email  |
| `data_test_berlabel_awal.csv` | Dataset test email pribadi modern (sep=`;`) | 2.500 email  |
| `data/enron_spam_data.csv`    | Dataset tambahan (tidak dipakai di final)     | 33.716 email |
| `data/Phishing_Email.csv`     | Dataset tambahan (untuk uji web app)          | 18.650 email |

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

## 6. Struktur File Proyek

```
Code_Spam_Email/
├── NB_XGB_PURE.py              ← Metode 1 FINAL (tidak diubah)
├── NB_XGB_MIX_IMPROVED.py      ← Metode 2 FINAL
├── NB_XGB_ADAPT_RATIO_EXPERIMENT.py ← Skrip uji rasio adaptasi
├── DOKUMENTASI.md              ← File ini
│
├── data/                       ← Folder seluruh dataset
│   ├── emails.csv              ← Dataset training utama (5.728 email)
│   ├── data_test_berlabel_awal.csv ← Dataset test email pribadi (2.500 email)
│   ├── full_data_test_berlabel_awal.csv
│   ├── enron_spam_data.csv     ← Dataset tambahan
│   └── Phishing_Email.csv      ← Dataset tambahan
│
├── eval_results/               ← Hasil eksekusi model (CSV logs)
│   ├── NB_XGB_PURE.csv
│   ├── NB_XGB_MIX_IMPROVED.csv
│   └── NB_XGB_ADAPT_RATIO_EXPERIMENT.csv
│
├── grafik_skripsi/             ← Kumpulan file output visual / grafik (.png)
│   └── Gambar_IV_*.png
├── models/
│   └── webapp_models/          ← Model tersimpan untuk web app Mode Teks
│       ├── nb_model.joblib
│       ├── xgb_model.joblib
│       ├── tfidf_word.joblib
│       ├── tfidf_char.joblib
│       ├── selector.joblib
│       └── thresholds.joblib
│
├── web_app/                    ← WEB APP FLASK (SUDAH SELESAI)
│   ├── app.py                  ← Server Flask + job system + semua endpoint
│   ├── evaluator.py            ← Pipeline ML batch + predict single
│   ├── model_pipeline.py       ← Model tersimpan untuk Mode Teks
│   ├── run_eval_worker.py      ← Worker subprocess (CUDA-safe)
│   ├── experiment_history.json ← Riwayat eksperimen (persist di disk)
│   ├── last_csv_result.json    ← Hasil CSV terakhir (persist di disk)
│   ├── saved_models/           ← ⭐ FOLDER BARU — model hasil training CSV (PERMANEN)
│   │   ├── models_metode1.joblib  ← Model Metode 1 dari run terakhir
│   │   └── models_metode2.joblib  ← Model Metode 2 dari run terakhir
│   ├── static/
│   │   ├── chart.min.js        ← Chart.js lokal (tidak butuh internet)
│   │   ├── style.css           ← File CSS UI, Dark Mode, & Styling (Refactored)
│   │   ├── script.js.backup    ← Backup JS monolitik lama
│   │   └── js/
│   │       ├── utils.js        ← Fungsi bantuan & UI global
│   │       ├── mode_text.js    ← Logika UI Mode Teks tunggal & batch
│   │       ├── mode_csv.js     ← Logika UI Evaluasi CSV & Rendering Chart
│   │       └── history.js      ← Sistem Riwayat & Side-by-side Comparison
│   └── templates/
│       └── index.html          ← Kerangka UI Web App (Sangat Rapi)
│
└── Gambar_IV_*.png             ← 9 grafik hasil evaluasi untuk skripsi
```

---

## 7. Web App — Cara Menjalankan

```cmd
cd D:\skripsi\skripsi_spam\Code_Spam_Email
.venv\Scripts\python.exe web_app/app.py
```

Buka browser: **http://localhost:5000**
Stop: `Ctrl+C` di terminal.

**Python:** 3.11 | **Framework:** Flask | **GPU:** NVIDIA RTX 3050 (CUDA)

---

## 8. Web App — Fitur Lengkap

### Tab 1 — Mode Teks

- Prediksi satu email menggunakan **model tersimpan** di disk
- Hasil: NB + XGBoost, probabilitas, threshold, confidence
- **Rekomendasi Final** — ikuti XGBoost (akurasi 93%) jika berbeda dengan NB (77%)
- **Indikator** — kata kunci spam/ham, pola struktural
- **Mode Batch** — pisahkan email dengan baris kosong, prediksi banyak email sekaligus
- Export hasil batch sebagai CSV
- ⭐ **Highlight Kata Spam** — setelah analisis, kata-kata indikator spam (free, win, urgent, dll) di-highlight merah di bawah hasil
- ⭐ **Tombol Salin Hasil** — tombol 📋 di banner hasil, salin seluruh hasil (label, probabilitas, teks) ke clipboard

### Tab 2 — Mode CSV

**Sub-mode upload:**

| Mode                        | Training            | Test              |
| --------------------------- | ------------------- | ----------------- |
| Hanya Upload Test (default) | emails.csv bawaan   | CSV diupload      |
| Upload Train + Test         | CSV training custom | CSV test terpisah |

**Parameter yang bisa diatur:**

- Metode 1 / Metode 2 (checkbox, bisa keduanya)
- Rasio Adaptasi (10-50%, default 30%)
- Bobot Instance (2-20×, default 8×)
- **Balancing Training:** Jumlah Non-Spam dan Spam training (0=semua)
- **Balancing Test:** Jumlah Non-Spam dan Spam test (0=semua)
- Mode- Perbandingan performa *side-by-side* untuk metrik utama.
- Tombol **Terapkan Model Ini** jika ingin menggunakan setelan dari eksperimen tersebut (opsional, untuk *future use*).

### UI / UX / Tema
- **Tema Dark Mode (VS Code / Linear Style)** — palet abu-abu/slate gelap yang modern dan nyaman di mata. Dilengkapi dengan dua tombol toggle (atas & bawah) yang ter-sinkronisasi. Seluruh komponen, termasuk *info-chip* keterangan model, memiliki kontras gelap/terang yang disesuaikan secara khusus.
- **Standar Confusion Matrix** — Tabel CM sudah menggunakan warna *Best Practice* global (Hijau/Success untuk Prediksi Benar (TP/TN) dan Merah/Danger untuk Prediksi Salah (FP/FN)) beserta animasi transisi dan efek *hover* interaktif.
- **Efisiensi Ruang (Layout)** — Tabel Top 20 Fitur Chi-Square dibagi menjadi dua kolom berdampingan secara responsif agar tidak memakan terlalu banyak ruang vertikal ke bawah.
- **Micro-interactions** — Hover tooltip instan untuk nama eksperimen, transisi halus pada *progress bar*, dan kotak dialog/notifikasi tanpa mem-blok layar.
- **Keterbacaan** — Banner *consensus* spam disesuaikan warnanya agar tidak "sakit mata" saat berada di *Dark Mode*. Background log terminal bersifat statis (pekat gelap) di semua mode.
- **Code Refactoring & Clean Architecture** — File Antarmuka Pengguna telah dipisah secara rapi menggunakan pendekatan modern `index.html` (kerangka), `style.css` (gaya & layout UI), dan `script.js` (logika *client-side*).

**Statistik dataset** — setelah upload CSV, langsung tampil chip: total, Non-Spam, Spam, kolom terdeteksi, rata-rata panjang teks

**Output:**

- Akurasi, Presisi, Recall, F1-Score, Confusion Matrix, Metrik per kelas
- Top 20 fitur Chi-Square (tabel 2 kolom dengan bar proporsional)
- Tabel perbandingan Metode 1 vs 2 dengan delta (▲/▼)
- Progress log realtime saat training

**Setelah selesai:**

- **Uji Email Langsung** — prediksi email menggunakan model yang baru dilatih
- Pilih Metode 1 atau 2 jika keduanya dijalankan. (Opsi akan otomatis terkunci pada metode yang baru saja dilatih).
- ⭐ **Analisis Teks Realtime** — fitur *highlight* kata indikator spam (merah) juga tersedia pada uji realtime dari model CSV.
- Model hasil training disimpan **PERMANEN** di `web_app/saved_models/` (tidak hilang saat restart localhost)
- Uji realtime tetap tersedia setelah server dimatikan dan dinyalakan ulang
- **Simpan JSON** — download hasil lengkap
- **Simpan CSV** — download ringkasan (kompatibel Excel)
- **Print/PDF** — buka window print-ready

**Persist hasil:**

- Hasil CSV terakhir tersimpan di `last_csv_result.json`
- Tidak hilang saat server dimatikan
- Saat klik **Mulai Evaluasi** baru, `last_csv_result.json` otomatis dihapus agar hasil lama tidak muncul saat refresh
- Reset hanya saat klik tombol Reset atau run ulang

### Tab 3 — Riwayat Eksperimen

- Tabel semua eksperimen dengan kolom: No, Waktu, Preset, Train, Test, Adapt%, Weight, NB M1, XGB M1, NB M2, XGB M2, Waktu(s), Status, Pin/Catatan
- **Sortable** — klik header kolom untuk sort ascending/descending, indikator ▲/▼/⇅
- **Tooltips kolom** — hover header tabel untuk melihat penjelasan tiap kolom
- Default urutan: No terlama (No.1) di atas
- **Grafik bar chart** — perbandingan akurasi/F1 antar eksperimen (kelompok 4 bar per run)
- ⭐ **Pencarian/Filter** — kotak pencarian real-time, mencari di semua kolom (waktu, preset, akurasi, status, catatan, nama eksperimen, dll)
- ⭐ **Perbandingan dinamis** — centang 2 atau lebih run, klik Bandingkan; modal menampilkan:
  - Info card tiap run (nama, waktu, parameter) dengan warna berbeda
  - Tabel metrik lengkap dengan nilai tertinggi di-highlight hijau tebal
  - Bar chart perbandingan Akurasi & F1 semua run (menggunakan Chart.js)
- ⭐ **Pin/Bintang eksperimen** — klik ☆ untuk menandai run penting (★ kuning); baris di-highlight kuning, tersimpan di localStorage
- ⭐ **Nama eksperimen di tabel** — kolom Waktu punya garis bawah titik-titik biru jika ada nama; hover → tooltip dark muncul instan (tanpa delay browser)
- **Catatan per eksperimen** — klik ✎ untuk edit catatan singkat, tersimpan ke server
- Export CSV riwayat
- Hapus semua riwayat
- **Persist di disk** — `experiment_history.json`, tidak hilang saat server restart

### Fitur Global

- **Dark Mode** — toggle di footer, disimpan ke localStorage; warna pin bintang menyesuaikan (kuning amber di dark mode)
- **Refresh aman** — hasil CSV, job ID, dan dark mode preference tersimpan

---

## 9. Arsitektur Teknis Web App

```
Browser
  │
  ├── GET  /                    → index.html
  ├── POST /predict             → prediksi satu email (model tersimpan)
  ├── GET  /status              → threshold model tersimpan
  ├── POST /evaluate            → upload CSV, mulai job async → return job_id
  ├── GET  /job/<id>            → polling status + progress + hasil
  ├── POST /job/<id>/cancel     → batalkan training yang sedang berjalan
  ├── GET  /active_job          → cek job yang sedang running (untuk auto-resume)
  ├── POST /predict_job         → prediksi email dari model job
  ├── GET  /job_models/<id>     → cek model tersedia di job
  ├── POST /dataset_preview     → statistik CSV sebelum training
  ├── GET  /history             → daftar riwayat eksperimen
  ├── POST /history/clear       → hapus semua riwayat
  ├── POST /history/note        → simpan catatan per eksperimen
  ├── GET  /last_result         → hasil CSV terakhir dari disk
  └── POST /last_result/clear   → hapus hasil tersimpan

Subprocess (run_eval_worker.py)
  └── CUDA-safe (main thread sendiri)
      → tulis progress.jsonl secara incremental
      → simpan models_metode1.joblib / models_metode2.joblib ke `saved_models/` (PERMANEN)
      → tulis result.json saat selesai
```

**Subprocess** dipakai karena XGBoost CUDA tidak bisa diinisialisasi dari background thread Flask di Windows.

---

## 10. Preset Mode Training

|                    | Fast         | Full                   |
| ------------------ | ------------ | ---------------------- |
| TF-IDF Word        | 10.000 fitur | 20.000 fitur           |
| TF-IDF Char        | 4.000 fitur  | 8.000 fitur            |
| SelectKBest k      | 6.000        | 12.000                 |
| XGB n_estimators   | 500          | 3.000                  |
| XGB learning_rate  | 0.05         | 0.02                   |
| XGB early_stopping | 30           | 80                     |
| Estimasi waktu     | ~1-2 menit   | ~10-30 menit           |
| Hasil vs skripsi   | Lebih ringan | **100% identik** |

**Mode Full dengan data_test_berlabel_awal.csv (500+500) = hasil 100% sama dengan NB_XGB_MIX_IMPROVED.py**

---

## 11. Format CSV yang Didukung

Deteksi kolom otomatis. Label yang dikenali:
`spam/ham`, `0/1`, `phishing/legitimate`, `phishing email/safe email`, `malicious/benign`, `junk/normal`, `yes/no`, `true/false`

| Dataset                         | Kolom Teks     | Kolom Label    | Format                    |
| ------------------------------- | -------------- | -------------- | ------------------------- |
| `emails.csv`                  | `text`       | `spam`       | 0/1                       |
| `enron_spam_data.csv`         | `Message`    | `Spam/Ham`   | ham/spam                  |
| `Phishing_Email.csv`          | `Email Text` | `Email Type` | Safe Email/Phishing Email |
| `data_test_berlabel_awal.csv` | `Text`       | `Label`      | 0/1, sep=`;`            |

---

## 12. Bug yang Pernah Ditemui & Solusinya

| Bug                              | Penyebab                                             | Solusi                                           |
| -------------------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| Mode Teks server crash           | XGB model tersimpan di CUDA, input CPU               | `set_params(device='cpu')` setelah load        |
| Mode CSV Metode 2 hang           | XGBoost CUDA tidak bisa dari Flask thread            | Ganti threading → subprocess                    |
| NaN di result.json tidak terbaca | JSON standar tidak kenal NaN                         | Sanitasi NaN→null di worker + retry parse       |
| Subprocess pakai Python sistem   | CWD salah saat launch                                | Hardcode `.venv/Scripts/python.exe`            |
| `f.score is null` error JS     | null dari sanitasi NaN di buildTop20                 | Filter `validFeatures` sebelum render          |
| Consensus banner salah           | Voting 1+0=SPAM meski XGB NON-SPAM                   | Banner ikuti rekomendasi XGBoost                 |
| Fungsi drag/drop tidak defined   | Inline event handler dipanggil sebelum script dimuat | Inline handler langsung pakai variabel global    |
| Duplikat fungsi JS               | Override pattern `_orig` membuat infinite loop     | Hapus semua duplikat, gabungkan langsung         |
| Riwayat hilang saat restart      | Disimpan di memori Python                            | Simpan ke `experiment_history.json` di disk    |
| Hasil CSV hilang saat restart    | Tidak persisted                                      | Simpan ke `last_csv_result.json` di disk       |
| Top 20 Chi-Square < 20           | NaN difilter setelah sort                            | Filter NaN**sebelum** sort di evaluator.py |
| Progress log tak terlihat (dark) | CSS dark mode tidak cover `.progress-log`          | Tambah `body.dark .progress-log` CSS           |
| Model uji realtime hilang setelah restart | Disimpan di temp dir yang terhapus saat server mati | Pindah ke `web_app/saved_models/` permanen |
| Hasil CSV muncul lagi setelah run baru | `last_csv_result.json` tidak dihapus saat run baru | Hapus file saat `startEval()` dimulai |
| `renderCsvResults is not defined` | Fungsi hilang karena edit, IIFE dipanggil sebelum definisi | Restore fungsi + pindah ke DOMContentLoaded |
| Kebocoran latar belakang putih di bawah | `body { background-color: transparent }` membocorkan tag `html` putih | Set background-color ke `var(--body-bg) !important` di `html` dan `body` |
| Gradasi judul teks bermasalah | `background-clip: text` tidak kompatibel di browser tertentu | Ubah judul H1 menggunakan warna solid `var(--primary)` |
| Ukuran font tabel meluber | Override `.cm-table td` meluber ke tabel perbandingan & riwayat | Isolasi selector spesifik ke `.cm-table-main` & `.per-class-table-main` |
| Popup perbandingan bertumpuk transparan | Variabel `--card-bg` memiliki opacity 50% tanpa backdrop-filter | Set background solid `var(--body-bg) !important` pada `.modal-content` & blur pada overlay |
| Tab menu "Riwayat" terpotong di HP | Menu tab menggunakan `width: max-content` yang melebihi viewport HP | Ubah `.tabs` menjadi `width: 100%` di media query HP & kecilkan padding tombol |
| Kolom Top 20 Chi-Square tidak sejajar | Ukuran kolom dinamis berbeda saat tabel menumpuk vertikal di HP | Terapkan `table-layout: fixed` & lebar piksel absolut pada kolom tabel |
| Badge `NON-SPAM` terpotong di HP | Padding lebar & teks panjang memicu pembungkusan baris baru | Set `white-space: nowrap !important` & kecilkan ukuran badge ke `11px` di HP |

---

## 13. Visualisasi yang Dihasilkan Skrip Skripsi

### Metode 1 (NB_XGB_PURE.py) — 4 Gambar

1. `Gambar_IV_ConfusionMatrix_NB_Metode1.png` — heatmap biru, DPI 300
2. `Gambar_IV_ConfusionMatrix_XGB_Metode1.png` — heatmap hijau
3. `Gambar_IV_Top20_ChiSquare_Metode1.png` — bar chart horizontal
4. `Gambar_IV_Perbandingan_Metrik_Metode1.png` — NB vs XGB

### Metode 2 (NB_XGB_MIX_IMPROVED.py) — 5 Gambar

1. `Gambar_IV_ConfusionMatrix_NB_Metode2.png`
2. `Gambar_IV_ConfusionMatrix_XGB_Metode2.png`
3. `Gambar_IV_Top20_ChiSquare_Metode2.png`
4. `Gambar_IV_Perbandingan_Metrik_Metode2.png`
5. `Gambar_IV_Perbandingan_Metode1_vs_Metode2.png` ← TERPENTING untuk skripsi

---

## 14. Narasi Siap Pakai untuk BAB 4

**Metode 1 (rendah):**

> "Hasil pengujian Metode 1 menunjukkan akurasi Naive Bayes sebesar 51,50% dan XGBoost sebesar 48,00%. Rendahnya akurasi ini disebabkan oleh domain gap yang signifikan antara dataset pelatihan (email Kaggle era 2000-an) dan data uji (email pribadi modern). Hal ini membuktikan bahwa model yang dilatih pada data historis tidak dapat langsung diterapkan pada email kontemporer tanpa adaptasi."

**Metode 2 (tinggi):**

> "Dengan menerapkan domain adaptation menggunakan 30% data uji sebagai data adaptasi dengan instance weighting 8×, akurasi meningkat drastis: Naive Bayes menjadi 77% dan XGBoost mencapai 93%. Peningkatan sebesar +44,00% pada XGBoost membuktikan efektivitas domain adaptation dalam mengatasi domain gap."

**Perbandingan:**

> "XGBoost dengan domain adaptation berhasil mendeteksi 318 dari 350 email spam (recall 90,86%) dengan hanya 17 false positive, menjadikannya model yang handal untuk implementasi nyata."

**Confusion Matrix XGBoost Metode 2:**

- TN=333 (Non-Spam benar terdeteksi)
- FP=17 (Non-Spam salah dianggap Spam — merugikan user)
- FN=32 (Spam lolos — bahaya keamanan)
- TP=318 (Spam benar terdeteksi)

---

## 15. Cara Menjalankan Skrip Skripsi (bukan web app)

```cmd
cd D:\skripsi\skripsi_spam\Code_Spam_Email

# Metode 1
.venv\Scripts\python.exe NB_XGB_PURE.py

# Metode 2
.venv\Scripts\python.exe NB_XGB_MIX_IMPROVED.py
```

Output: file CSV hasil + 4/5 file PNG grafik.

---

## 16. Informasi Teknis

| Item     | Detail                                    |
| -------- | ----------------------------------------- |
| GPU      | NVIDIA RTX 3050 (CUDA)                    |
| Python   | 3.11, virtual env `.venv`               |
| XGBoost  | tree_method='hist', device='cuda'         |
| Flask    | Development server, port 5000             |
| Chart.js | v4.4.0, file lokal di `web_app/static/` |

**Dependensi web app:**

```
flask>=3.0.0, scikit-learn>=1.5.0, xgboost>=2.0.0
scipy>=1.14.0, pandas>=2.2.0, numpy>=1.26.0, joblib>=1.4.0
```

---

## 17. Status Saat Ini & Checklist Web App

### Sudah Selesai ✅

- [X] Metode 1 (NB_XGB_PURE.py) — hasil final + visualisasi lengkap
- [X] Metode 2 (NB_XGB_MIX_IMPROVED.py) — hasil final + visualisasi lengkap
- [X] 9 file PNG grafik tersimpan
- [X] Web app Flask localhost — semua fitur berjalan
- [X] Mode Teks: prediksi + rekomendasi XGBoost + indikator + batch prediksi
- [X] Mode Teks: highlight kata spam (merah) di body teks setelah analisis
- [X] Mode Teks: tombol Salin Hasil ke clipboard
- [X] Mode CSV: evaluasi batch + balancing train/test + fast/full preset
- [X] Mode CSV: field Nama Eksperimen (opsional) sebelum mulai evaluasi
- [X] Prediksi realtime dari model job yang baru dilatih
- [X] Riwayat eksperimen persist di disk + sortable + tooltips header kolom
- [X] Riwayat: pencarian/filter real-time di semua kolom
- [X] Riwayat: perbandingan dinamis ≥2 run + tabel highlight + bar chart
- [X] Riwayat: pin/bintang eksperimen penting (localStorage)
- [X] Riwayat: nama eksperimen tampil via tooltip instan (JS fixed-position)
- [X] Riwayat: catatan per eksperimen (edit + simpan ke server)
- [X] Grafik bar chart di modal perbandingan (Chart.js)
- [X] Hasil CSV terakhir persist di disk (tidak hilang saat restart)
- [X] Dark mode, dataset stats preview, progress bar, cancel job, auto-resume
- [X] Dark mode: warna pin bintang dan baris pinned menyesuaikan
- [X] Export JSON, CSV, Print/PDF, Chi-Square PNG
- [X] Top 20 Chi-Square selalu tepat 20 fitur valid
- [X] Mode Full = 100% identik hasil skrip skripsi
- [X] Adaptive polling, lazy load, background pipeline load
- [X] Tombol Cancel training + auto-resume saat halaman di-refresh
- [X] Model uji realtime tersimpan permanen di `web_app/saved_models/`
- [X] Hapus BERT model (hemat 420 MB)

---

## 18. Konteks untuk AI Assistant Baru

Jika kamu adalah AI assistant baru yang membaca dokumen ini, berikut hal penting:

1. **Proyek ini adalah skripsi sarjana**, bukan proyek komersial — prioritaskan akurasi akademis
2. **Semua kode sudah berjalan** — jangan ubah pipeline ML inti (`NB_XGB_PURE.py` dan `NB_XGB_MIX_IMPROVED.py`)
3. **Web app ada di `web_app/`** — Flask localhost, bukan production
4. **Virtual environment** ada di `.venv/` — selalu gunakan `.venv\Scripts\python.exe`
5. **GPU CUDA tersedia** tapi hanya bisa diinisialisasi dari main thread — web app menggunakan subprocess untuk menghindari hang
6. **Bahasa skripsi:** Indonesia (kode tetap dalam bahasa Inggris/campuran)
7. **File persist penting:**
   - `web_app/experiment_history.json` — riwayat semua eksperimen
   - `web_app/last_csv_result.json` — hasil CSV terakhir
   - `web_app/saved_models/` — model hasil training CSV permanen (`models_metode1.joblib`, `models_metode2.joblib`), dipakai untuk uji realtime setelah restart
   - `models/webapp_models/` — model tersimpan untuk Mode Teks
8. **Balancing menggunakan `random_state=42`** (seed tetap) untuk reprodusibilitas — ini disengaja agar hasil identik tiap run dengan data yang sama
9. **Alur balancing test set:**
   - Data test di-sample acak dengan seed 42
   - Untuk domain adaptation: **30% pertama dipakai adaptasi** (stratified), **70% sisanya untuk evaluasi**
10. **Untuk menjalankan web app:** `cd D:\skripsi\skripsi_spam\Code_Spam_Email && .venv\Scripts\python.exe web_app/app.py` lalu buka http://localhost:5000


## 19. Update Terbaru (25 Juni 2026)

### Fitur Baru Web App

| # | Fitur | Lokasi | Keterangan |
|---|-------|--------|------------|
| 1 | **Highlight kata spam** | Mode Teks | Kata indikator spam di-highlight merah setelah analisis |
| 2 | **Tombol Salin Hasil** | Mode Teks | Salin label, probabilitas, teks ke clipboard dalam satu klik |
| 3 | **Nama Eksperimen** | Mode CSV | Field opsional sebelum evaluasi; tersimpan di riwayat & modal perbandingan |
| 4 | **Tooltips header kolom** | Tab Riwayat | Hover header → penjelasan singkat tiap kolom |
| 5 | **Pencarian riwayat** | Tab Riwayat | Filter real-time di semua kolom (waktu, preset, akurasi, catatan, dll) |
| 6 | **Perbandingan ≥2 run** | Tab Riwayat | Perbandingan dinamis dengan nilai highlight hijau + bar chart Chart.js |
| 7 | **Pin/Bintang eksperimen** | Tab Riwayat | Tandai run penting; baris highlight kuning, tersimpan di localStorage |
| 8 | **Tooltip nama instan** | Tab Riwayat | Hover kolom Waktu → tooltip dark muncul tanpa delay (JS fixed-position) |
| 9 | **UI Checkbox Dinamis** | Tab Riwayat | Checkbox tabel disembunyikan secara default, hanya muncul saat tombol "Pilih Data" diklik agar lebih rapi |
| 10 | **Tombol Responsif (.btn-sm)** | Tab Riwayat | Mengecilkan padding/font tombol di header riwayat agar tidak membentur layout (tetap 1 baris) saat mode pilih aktif |

### Bug Fix

| Bug | Solusi |
|-----|--------|
| Indikator tab Mode CSV tidak aktif saat pertama buka | Fixed `switchTab()` CSS class handling |
| Contoh Spam Phishing Bank terdeteksi NON-SPAM | Diganti contoh Spam Obat Murah yang reliabel terdeteksi kedua model |
| Tooltip CSS `::after` terpotong oleh overflow tabel | Diganti JS tooltip `position:fixed` yang tidak terpengaruh overflow |
| Warna bintang pin nabrak di dark mode | Eksplisit `#fbbf24` amber untuk dark, `#f59e0b` untuk light |
| Baris pinned background tidak cocok dark mode | Tambah `body.dark tr.pinned-row { background: #292619 }` |
| Warna teks indikator tidak terlihat | Menyesuaikan kontras warna teks indikator agar mudah dibaca |
| Pembaruan Contoh Teks | Menambahkan contoh spam baru (Diskon/Event Game) dan 3 contoh normal baru (IBM SkillsBuild, GitHub Copilot, Tugas Kampus) |

### Penambahan Backend (`app.py`)

- Field `label_name` diterima dari FormData evaluate dan disimpan ke `input.json`
- Field `label_name` dibaca saat build history summary → tersimpan ke `experiment_history.json`
- Field `note` diinisialisasi kosong dalam history summary (sebelumnya tidak ada)

---

## 20. Update Terbaru (26 Juni 2026)

### UI / UX Enhancements

| # | Fitur | Lokasi | Keterangan |
|---|-------|--------|------------|
| 1 | **Grid Confusion Matrix Perbandingan** | Tab Riwayat (Modal Bandingkan) | Menampilkan Confusion Matrix (TP, TN, FP, FN) dalam format grid UI modern di bawah grafik perbandingan, untuk visualisasi detail yang lebih baik (dibandingkan sekadar teks di tabel). |
| 2 | **Refaktor Tata Letak Tabel Riwayat** | Tab Riwayat | Memisahkan kolom "Pin/Catatan" agar lebih rapi. Kolom "Pin" dipindahkan letaknya di awal (tepat setelah nomor urut) dan kolom "Catatan" dikembalikan ke bagian paling akhir tabel. |

---

## 21. Update Terbaru (27 Juni 2026)

### Backend & Performa

| # | Fitur | Lokasi | Keterangan |
|---|-------|--------|------------|
| 1 | **VRAM Saver (max_bin=128)** | `evaluator.py` | Optimasi GPU otomatis saat dataset uji melebihi 10.000 baris. Nilai dikembalikan ke `128` (sebelumnya `64`) agar representasi histogram data tetap jelas dan rasional untuk dipertanggungjawabkan saat Sidang Skripsi (mencegah *regularization* yang berlebihan). |
| 2 | **Perbaikan Dataset Fallback** | `script.js` | Memperbaiki masalah di mana nama dataset `Custom Train` tidak tersimpan dengan benar dan hanya memunculkan "bawaan". Sekarang, nama asli berkas CSV (seperti `enron_spam.csv` atau `Phishing.csv`) akan tertulis akurat di tabel riwayat. |

### Deployment & Portabilitas

| # | Fitur | Lokasi | Keterangan |
|---|-------|--------|------------|
| 1 | **Auto-Run Script (Plug & Play)** | `Jalankan_Aplikasi.bat` | Skrip otomatis untuk menjalankan aplikasi di laptop Windows mana pun tanpa perlu setup manual. Skrip akan mendeteksi Python, membangun `.venv` baru, menginstal `requirements.txt`, dan menjalankan localhost dengan sekali klik ganda. |
| 2 | **Integrasi GitHub Private** | Git / GitHub | Seluruh kode telah dicadangkan (*pushed*) ke repositori GitHub `Spam-Email` secara *Private*. Berkas skripsi PDF dan *dataset* `.csv` telah diamankan (*ignore*) agar tidak tersebar ke ranah daring. |

### Penyempurnaan UX & Sinkronisasi (27 Juni 2026 - Lanjutan)

| # | Fitur | Lokasi | Keterangan |
|---|-------|--------|------------|
| 1 | **Hapus Sekaligus (Batch Delete)** | `app.py` & `script.js` | Penambahan fitur kotak centang dan tombol "Hapus Terpilih" (termasuk seleksi langsung klik pada baris tabel) untuk mempermudah menghapus banyak riwayat eksperimen sekaligus. |
| 2 | **Sinkronisasi Bintang (Pin) ke Server** | `app.py` & `script.js` | Status penyematan (Pin) eksperimen tidak lagi disimpan di `localStorage` peramban, melainkan tersinkronisasi di server (backend), sehingga riwayat Pin di laptop juga terbaca persis sama saat diakses lewat HP (Hotspot). |
| 3 | **Optimalisasi Tampilan Mobile (HP)** | `index.html`, `style.css`, `script.js` | Menyesuaikan tampilan hasil matriks dan perbandingan akurasi, memberikan bungkus batas agar grafik riwayat dapat digeser (horizontal scroll), dan memperbaiki tata letak tombol Mode Gelap (hanya emotikon) agar bersih. |
| 4 | **Bug-Fix Skrip Peluncuran Otomatis** | `Jalankan_Aplikasi.bat` | Memperbaiki *crash* instan pada terminal dengan memperbaiki sintaks kondisi `if` (masalah penanda kurung) dan menambahkan pengaman paksaan akses root direktori eksekusi `cd /d "%~dp0"`. |
| 5 | **Perbaikan Upload CSV di Android** | `index.html` | Mengubah ekstensi pada input file (`accept=".csv, text/csv, application/vnd.ms-excel"`) untuk mencegah blokir/filter ketat dari OS Android yang sering mengunci file murni berakhiran `.csv`. |
| 6 | **Default Mode Training "Full"** | `index.html` | Mengubah *radio button* bawaan ke mode "Full" agar saat website dimuat ulang, eksperimen selalu berada pada mode terlengkap (identik dengan skrip skripsi asli). |

### Manajemen AI & Token Saving (27 Juni 2026 - Malam)

| # | Fitur | Lokasi | Keterangan |
|---|-------|--------|------------|
| 1 | **Integrasi CLAUDE.md** | `CLAUDE.md` | Menggabungkan *rules* proyek ke dalam satu file standar universal yang dikenali oleh berbagai IDE (Cursor, Cline, dll). |
| 2 | **Ponytail & Headroom Rules** | `CLAUDE.md` | Menetapkan paksaan (*enforcement*) agar AI selalu menggunakan gaya koding paling efisien (Prinsip YAGNI) dan otomatis memadatkan keluaran (*output*) terminal agar menghemat ribuan token harian. |

## 22. Update Terbaru (28 Juni 2026)

### Visual Feedback Baris Terpilih pada Riwayat

| # | Fitur | Lokasi | Keterangan |
|---|-------|--------|------------|
| 1 | **Row Highlight CSS** | `web_app/static/style.css` | Menambahkan class `.selected-row` dengan background ungu lembut (`#eef2ff`) + border kiri 3px ungu. Varian khusus untuk baris pinned + selected (gradient kuning → ungu). |
| 2 | **Row Highlight JS Sync** | `web_app/static/script.js` | Fungsi `updateDeleteBtn()` sekarang toggle class `selected-row` pada `<tr>`. Event listener `change` global menangkap toggle dari event delegation (select-all, deselect-all, atau klik baris individual). |

### Anti-Flicker Tab State Sync

| # | Fitur | Lokasi | Keterangan |
|---|-------|--------|------------|
| 1 | **MutationObserver Tab Sync** | `web_app/templates/index.html` | Menambahkan inline script di `<head>` yang menggunakan MutationObserver untuk sinkronisasi state tab button dan pane SEBELUM first paint. Mencegah visual flicker saat refresh halaman dengan URL hash (`#csv`, `#history`). Script mengamati DOM mutations, toggle class `.active` pada elemen yang tepat, lalu disconnect — tidak ada CSS `!important` atau race condition dengan deferred `script.js`. |

### Manajemen Pengetahuan & Dokumentasi (Knowledge Management)

Seluruh dokumentasi proyek ini (termasuk file ini) dioptimalkan menggunakan format Markdown (`.md`).
Untuk pengalaman membaca dan menulis yang lebih baik layaknya menyusun Wikipedia pribadi, **sangat disarankan menggunakan aplikasi Obsidian**. 
Cukup instal [Obsidian](https://obsidian.md/), lalu pilih *"Open folder as vault"* dan arahkan ke folder utama skripsi (`Code_Spam_Email`). Obsidian akan secara otomatis membaca, merender struktur tabel, memberikan fitur pencarian yang cepat, serta memperlihatkan peta keterkaitan antar dokumen (*Graph View*).

### Keamanan, Performa & Validasi (28 Juni 2026 - Tambahan)

| # | Fitur | Lokasi | Keterangan |
|---|-------|--------|------------|
| 1 | **Validasi Ekstensi & XSS Prevention** | `script.js` | Menambahkan pengecekan sisi peramban (*client-side*) agar formulir hanya menerima ekstensi `.csv`, serta menerapkan `escapeHtml()` pada render nama file guna menghindari kerentanan *Cross-Site Scripting* (XSS). |
| 2 | **Exponential Backoff Polling** | `script.js` | Polling status *training* (`/job/<id>`) kini tidak mem-ping server terus-menerus setiap 2 detik. Interval akan secara cerdas merenggang (bertahap naik menjadi 5-8 detik) jika durasi pelatihannya cukup lama, sehingga secara signifikan menghemat *resource* CPU server. |
| 3 | **Debounced History Search** | `script.js` | Menerapkan fungsi *debounce* (jeda 300ms) pada kolom pencarian Riwayat Eksperimen. Hal ini mencegah peramban *lag* atau macet saat pengguna mengetik dengan sangat cepat di kotak pencarian. |
| 4 | **Pemisahan Progress Bar M1 & M2** | `script.js` | Memisahkan alur indikator *loading* menjadi `_progressStagesM1` dan `_progressStagesM2` agar taksiran persentase pelacakan lebih sinkron dan realistis sesuai dengan metode yang sedang berjalan. |
| 5 | **Memory Leak Prevention** | `script.js` | Menambahkan *event listener* `beforeunload` untuk menetralkan / mematikan objek grafik *Chart.js* dan timer *polling* sebelum halaman ditutup (mencegah kebocoran memori RAM peramban). |
| 6 | **Modernisasi Tombol Dark Mode** | `index.html` & `style.css` | Merombak tombol *Dark Mode* bulat lama menjadi tombol kapsul (*pill button*) modern yang dilengkapi teks dinamis dan diletakkan strategis berdampingan dengan sub-judul halaman web. |

---

## 23. Update Terbaru (29 Juni 2026)

### Perombakan UI/UX (Linear / Cult UI Aesthetic)

| # | Fitur | Lokasi | Keterangan |
|---|-------|--------|------------|
| 1 | **Glassmorphism & Opacity Adjustments** | `style.css` | Merombak desain kartu (.card) dengan efek kaca (*backdrop-filter blur*) transparan. Opasitas dioptimalkan (80% transparan `rgba(24, 24, 27, 0.80)`) agar teks tetap sangat jelas terbaca meski pada tingkat kecerahan layar HP yang rendah. |
| 2 | **Penyempurnaan Warna Background (Soft Dark)** | `style.css` | Mengubah warna *background* utama mode gelap dari hitam pekat (`#09090b`) menjadi *slate black* abu-abu super gelap (`#111113`) agar lebih ramah di mata dan terasa premium. |
| 3 | **Penyatuan Card Mode Teks** | `index.html`, `script.js` | Menggabungkan hasil akurasi model Naive Bayes dan XGBoost pada Mode Teks ke dalam **satu card besar** terpadu (dipisah dengan garis putus-putus), menggantikan desain lama yang terpisah-pisah. |
| 4 | **Peningkatan Skala Huruf (Readability)** | `style.css` | Menaikkan ukuran *font* secara spesifik pada tabel *Confusion Matrix* (dari 13px ke 15px) dan tabel Metrik Per Kelas (dari 13px ke 14px) agar angka-angka krusial jauh lebih mudah dibaca. |

### Bug Fixes & Tata Letak Mobile

| # | Fitur | Lokasi | Keterangan |
|---|-------|--------|------------|
| 1 | **Fix Tata Letak Input Mobile** | `style.css` | Memperbaiki masalah kotak input "Jumlah Spam Training" yang tidak sejajar horizontal pada layar HP akibat teks label di atasnya terpotong/turun baris. Diselesaikan dengan menerapkan `align-items: end;` pada *CSS Grid*. |
| 2 | **Fix Bug Ikon Toggle Tema Hilang** | `index.html` | Tombol *Dark Mode* atas sempat kehilangan emotikonnya saat diklik karena JavaScript me-reset struktur SVG `lucide`. Diperbaiki dengan menyeragamkan penggunaan elemen `<span class="theme-icon">🌙</span>` murni untuk kedua tombol toggle atas dan bawah. |
| 3 | **Pemulihan Aksen Warna Card** | `style.css` | Memperbaiki garis aksen warna di bagian atas *card* (seperti merah/hijau/biru) yang sebelumnya hilang karena tertimpa deklarasi `border !important` global. |

---

## 24. Update Terbaru (29 Juni 2026 - Tahap Lanjutan)

### Stabilitas Backend & Keamanan Memori

| # | Fitur | Lokasi | Keterangan |
|---|-------|--------|------------|
| 1 | **Zombie Job Cleanup** | `app.py` | Menambahkan pembersihan otomatis saat server dijalankan (boot). Jika server Flask mati mendadak saat evaluasi CSV berjalan, *worker* yang terputus akan ditandai dengan error `result.json` agar *frontend* tidak terjebak dalam siklus *polling* abadi. |
| 2 | **Fallback Job Status Sinkron** | `app.py` | Memaksa penulisan `result.json` ke dalam *disk* secara sinkron apabila *worker* gagal atau dihentikan paksa (cancelled), sehingga antarmuka UI menerima umpan balik seketika. |
| 3 | **Memory Leak Prevention (Jobs)** | `app.py` | Menghapus referensi memori pekerjaan (`del jobs[job_id]`) secara proaktif segera setelah *worker* selesai dan data disimpan ke cakram. Ini memastikan RAM server tidak membengkak walau ratusan pengguna melakukan eksperimen berturut-turut. |

### Pemisahan & Modularisasi Frontend (Skala Besar)

| # | Fitur | Lokasi | Keterangan |
|---|-------|--------|------------|
| 1 | **Pemecahan Monolitik JS** | `web_app/static/js/` | Berkas `script.js` raksasa (2.400 baris) telah dipecah secara sistematis menjadi 4 berkas mandiri (`utils.js`, `mode_text.js`, `mode_csv.js`, dan `history.js`) untuk mempermudah perawatan kode jangka panjang. |
| 2 | **Pemuatan Skrip Berurutan** | `index.html` | Mengganti pemuatan `script.js` tunggal dengan pemanggilan 4 modul JS baru secara berurutan, mempertahankan ruang lingkup *Global Variable* tetap utuh dan stabil tanpa memecah dependensi bawaan. |
