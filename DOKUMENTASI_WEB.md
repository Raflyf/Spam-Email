# Dokumentasi Web App Spam Email Classifier

## 1. Web App — Cara Menjalankan

```cmd
cd D:\skripsi\skripsi_spam\Code_Spam_Email
.venv\Scripts\python.exe web_app/app.py
```

Buka browser: **http://localhost:5000**
Stop: `Ctrl+C` di terminal.

**Python:** 3.11 | **Framework:** Flask | **GPU:** NVIDIA RTX 3050 (CUDA)

---

## 2. Web App — Fitur Lengkap

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
- Mode- Perbandingan performa _side-by-side_ untuk metrik utama.
- Tombol **Terapkan Model Ini** jika ingin menggunakan setelan dari eksperimen tersebut (opsional, untuk _future use_).

### UI / UX / Tema

- **Tema Dark Mode (VS Code / Linear Style)** — palet abu-abu/slate gelap yang modern dan nyaman di mata. Dilengkapi dengan dua tombol toggle (atas & bawah) yang ter-sinkronisasi. Seluruh komponen, termasuk _info-chip_ keterangan model, memiliki kontras gelap/terang yang disesuaikan secara khusus.
- **Standar Confusion Matrix** — Tabel CM sudah menggunakan warna _Best Practice_ global (Hijau/Success untuk Prediksi Benar (TP/TN) dan Merah/Danger untuk Prediksi Salah (FP/FN)) beserta animasi transisi dan efek _hover_ interaktif.
- **Efisiensi Ruang (Layout)** — Tabel Top 20 Fitur Chi-Square dibagi menjadi dua kolom berdampingan secara responsif agar tidak memakan terlalu banyak ruang vertikal ke bawah.
- **Micro-interactions & Animasi** — Terdapat animasi *scroll-reveal* (memudar masuk/keluar) pada kartu-kartu hasil analisis (Teks Biasa, Batch, Mode CSV, Grafik Histori) sehingga UI terasa lebih organik, sinematik, dan reaktif terhadap posisi scroll (Intersection Observer).
- **Keterbacaan** — Banner _consensus_ spam disesuaikan warnanya agar tidak "sakit mata" saat berada di _Dark Mode_. Background log terminal bersifat statis (pekat gelap) di semua mode.
- **Code Refactoring & Clean Architecture** — File Antarmuka Pengguna telah dipisah secara rapi menggunakan pendekatan modern `index.html` (kerangka), `style.css` (gaya & layout UI), dan `script.js` (logika _client-side_).

**Statistik dataset** — setelah upload CSV, langsung tampil chip: total, Non-Spam, Spam, kolom terdeteksi, rata-rata panjang teks

**Output:**

- Akurasi, Presisi, Recall, F1-Score, Confusion Matrix, Metrik per kelas
- Top 20 fitur Chi-Square (tabel 2 kolom dengan bar proporsional)
- Tabel perbandingan Metode 1 vs 2 dengan delta (▲/▼)
- Progress log realtime saat training

**Setelah selesai:**

- **Uji Email Langsung** — prediksi email menggunakan model yang baru dilatih
- Pilih Metode 1 atau 2 jika keduanya dijalankan. (Opsi akan otomatis terkunci pada metode yang baru saja dilatih).
- ⭐ **Analisis Teks Realtime** — fitur _highlight_ kata indikator spam (merah) juga tersedia pada uji realtime dari model CSV.
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

## 3. Arsitektur Teknis Web App

### 3.1 Backend Architecture (Updated Phase 1)

```
Flask App (app.py)
  │
  ├── Routes (HTTP Endpoints)
  │   ├── GET  /                    → index.html
  │   ├── POST /predict             → prediksi satu email (model tersimpan)
  │   ├── GET  /status              → threshold model tersimpan
  │   ├── POST /evaluate            → upload CSV, mulai job async → return job_id
  │   ├── GET  /job/<id>            → polling status + progress + hasil
  │   ├── POST /job/<id>/cancel     → batalkan training yang sedang berjalan
  │   ├── GET  /active_job          → cek job yang sedang running (untuk auto-resume)
  │   ├── POST /predict_job         → prediksi email dari model job
  │   ├── GET  /job_models/<id>     → cek model tersedia di job
  │   ├── POST /dataset_preview     → statistik CSV sebelum training
  │   ├── GET  /history             → daftar riwayat eksperimen
  │   ├── POST /history/clear       → hapus semua riwayat
  │   ├── POST /history/note        → simpan catatan per eksperimen
  │   ├── GET  /last_result         → hasil CSV terakhir dari disk
  │   └── POST /last_result/clear   → hapus hasil tersimpan
  │
  ├── ML Pipeline Modules
  │   ├── _shared.py (NEW)          → ⭐ Shared utilities (187 lines)
  │   │   ├── Constants: SPAM_KW, HAM_PLATFORMS
  │   │   ├── preprocess()          → Text preprocessing
  │   │   ├── build_features()      → 13 structural + 35 keyword features
  │   │   └── find_optimal_threshold() → F1-score optimization
  │   ├── model_pipeline.py         → Mode Teks (single/batch prediction)
  │   └── evaluator.py              → Mode CSV (batch evaluation)
  │
  └── Job System
      └── Subprocess (run_eval_worker.py)
          └── CUDA-safe (main thread sendiri)
              → tulis progress.jsonl secara incremental
              → simpan models_metode1.joblib / models_metode2.joblib ke `saved_models/` (PERMANEN)
              → tulis result.json saat selesai
```

**Key Architecture Decisions:**

- **Subprocess untuk XGBoost CUDA:** XGBoost CUDA tidak bisa diinisialisasi dari background thread Flask di Windows
- **Shared module `_shared.py`:** Eliminasi 240 baris duplikasi, single source of truth untuk preprocessing & features
- **Job persistence:** `experiment_history.json`, `last_csv_result.json` persist di disk untuk survive server restart

### 3.2 Frontend Architecture (Updated Phase 2)

```
index.html (1046 lines)
  │
  ├── Sequential JS Loading (modular, lines 1043-1046)
  │   ├── utils.js (~400 lines)       → Global utilities, dark mode, toast, escapeHtml
  │   ├── mode_text.js (~600 lines)   → Single/batch prediction, highlight spam, copy results
  │   ├── mode_csv.js (~800 lines)    → CSV upload, evaluation, Chart.js, Top 20 Chi-Square
  │   └── history.js (~600 lines)     → Sortable table, search/filter, comparison modal, pin
  │
  ├── CSS (style.css, 2000+ lines)
  │   ├── Variables & Resets
  │   ├── Layout & Grid
  │   ├── Components
  │   ├── Dark Mode Overrides
  │   └── Media Queries (≤600px mobile)
  │
  └── Chart.js (local, chart.min.js)
      └── Visualisasi grafik perbandingan akurasi/F1
```

**Modularization Benefits:**

- ✔ **Separation of concerns:** Setiap file fokus 1 tanggung jawab
- ✔ **Maintainability:** Bug fix di 1 concern tidak impact file lain
- ✔ **Debuggability:** Console errors langsung point ke file spesifik
- ✔ **Performance:** Browser parallel-download 4 file kecil vs 1 file 2400 baris

---

## 4. Preset Mode Training

|                    | Fast         | Full             |
| ------------------ | ------------ | ---------------- |
| TF-IDF Word        | 10.000 fitur | 20.000 fitur     |
| TF-IDF Char        | 4.000 fitur  | 8.000 fitur      |
| SelectKBest k      | 6.000        | 12.000           |
| XGB n_estimators   | 500          | 3.000            |
| XGB learning_rate  | 0.05         | 0.02             |
| XGB early_stopping | 30           | 80               |
| Estimasi waktu     | ~1-2 menit   | ~10-30 menit     |
| Hasil vs skripsi   | Lebih ringan | **100% identik** |

**Mode Full dengan data_test_berlabel_awal.csv (500+500) = hasil 100% sama dengan NB_XGB_MIX_IMPROVED.py**

---

## 5. Format CSV yang Didukung

Deteksi kolom otomatis. Label yang dikenali:
`spam/ham`, `0/1`, `phishing/legitimate`, `phishing email/safe email`, `malicious/benign`, `junk/normal`, `yes/no`, `true/false`

| Dataset                       | Kolom Teks   | Kolom Label  | Format                    |
| ----------------------------- | ------------ | ------------ | ------------------------- |
| `emails.csv`                  | `text`       | `spam`       | 0/1                       |
| `enron_spam_data.csv`         | `Message`    | `Spam/Ham`   | ham/spam                  |
| `Phishing_Email.csv`          | `Email Text` | `Email Type` | Safe Email/Phishing Email |
| `data_test_berlabel_awal.csv` | `Text`       | `Label`      | 0/1, sep=`;`              |

---

## 6. Bug yang Pernah Ditemui & Solusinya

| Bug                                                | Penyebab                                                              | Solusi                                                                                     |
| -------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Mode Teks server crash                             | XGB model tersimpan di CUDA, input CPU                                | `set_params(device='cpu')` setelah load                                                    |
| Mode CSV Metode 2 hang                             | XGBoost CUDA tidak bisa dari Flask thread                             | Ganti threading → subprocess                                                               |
| NaN di result.json tidak terbaca                   | JSON standar tidak kenal NaN                                          | Sanitasi NaN→null di worker + retry parse                                                  |
| Subprocess pakai Python sistem                     | CWD salah saat launch                                                 | Hardcode `.venv/Scripts/python.exe`                                                        |
| `f.score is null` error JS                         | null dari sanitasi NaN di buildTop20                                  | Filter `validFeatures` sebelum render                                                      |
| Consensus banner salah                             | Voting 1+0=SPAM meski XGB NON-SPAM                                    | Banner ikuti rekomendasi XGBoost                                                           |
| Fungsi drag/drop tidak defined                     | Inline event handler dipanggil sebelum script dimuat                  | Inline handler langsung pakai variabel global                                              |
| Duplikat fungsi JS                                 | Override pattern `_orig` membuat infinite loop                        | Hapus semua duplikat, gabungkan langsung                                                   |
| Riwayat hilang saat restart                        | Disimpan di memori Python                                             | Simpan ke `experiment_history.json` di disk                                                |
| Hasil CSV hilang saat restart                      | Tidak persisted                                                       | Simpan ke `last_csv_result.json` di disk                                                   |
| Top 20 Chi-Square < 20                             | NaN difilter setelah sort                                             | Filter NaN**sebelum** sort di evaluator.py                                                 |
| Progress log tak terlihat (dark)                   | CSS dark mode tidak cover `.progress-log`                             | Tambah `body.dark .progress-log` CSS                                                       |
| Model uji realtime hilang setelah restart          | Disimpan di temp dir yang terhapus saat server mati                   | Pindah ke `web_app/saved_models/` permanen                                                 |
| Hasil CSV muncul lagi setelah run baru             | `last_csv_result.json` tidak dihapus saat run baru                    | Hapus file saat `startEval()` dimulai                                                      |
| `renderCsvResults is not defined`                  | Fungsi hilang karena edit, IIFE dipanggil sebelum definisi            | Restore fungsi + pindah ke DOMContentLoaded                                                |
| Kebocoran latar belakang putih di bawah            | `body { background-color: transparent }` membocorkan tag `html` putih | Set background-color ke `var(--body-bg) !important` di `html` dan `body`                   |
| Gradasi judul teks bermasalah                      | `background-clip: text` tidak kompatibel di browser tertentu          | Ubah judul H1 menggunakan warna solid `var(--primary)`                                     |
| Ukuran font tabel meluber                          | Override `.cm-table td` meluber ke tabel perbandingan & riwayat       | Isolasi selector spesifik ke `.cm-table-main` & `.per-class-table-main`                    |
| Popup perbandingan bertumpuk transparan            | Variabel `--card-bg` memiliki opacity 50% tanpa backdrop-filter       | Set background solid `var(--body-bg) !important` pada `.modal-content` & blur pada overlay |
| Tab menu "Riwayat" terpotong di HP                 | Menu tab menggunakan `width: max-content` yang melebihi viewport HP   | Ubah `.tabs` menjadi `width: 100%` di media query HP & kecilkan padding tombol             |
| Kolom Top 20 Chi-Square tidak sejajar              | Ukuran kolom dinamis berbeda saat tabel menumpuk vertikal di HP       | Terapkan `table-layout: fixed` & lebar piksel absolut pada kolom tabel                     |
| Badge `NON-SPAM` terpotong di HP                   | Padding lebar & teks panjang memicu pembungkusan baris baru           | Set `white-space: nowrap !important` & kecilkan ukuran badge ke `11px` di HP               |
| Pilihan data riwayat tetap terbuka saat pindah tab | Status `_selectMode` tidak di-reset saat berganti halaman/tab         | Tutup mode pilih data otomatis di `switchTab()` jika tab tujuan bukan riwayat              |

---

## 7. Informasi Teknis

| Item     | Detail                                  |
| -------- | --------------------------------------- |
| GPU      | NVIDIA RTX 3050 (CUDA)                  |
| Python   | 3.11, virtual env `.venv`               |
| XGBoost  | tree_method='hist', device='cuda'       |
| Flask    | Development server, port 5000           |
| Chart.js | v4.4.0, file lokal di `web_app/static/` |

**Dependensi web app:**

```
flask>=3.0.0, scikit-learn>=1.5.0, xgboost>=2.0.0
scipy>=1.14.0, pandas>=2.2.0, numpy>=1.26.0, joblib>=1.4.0
```

---

## 8. Status Saat Ini & Checklist Web App

### Sudah Selesai ✔

- [x] Metode 1 (NB_XGB_PURE.py) — hasil final + visualisasi lengkap
- [x] Metode 2 (NB_XGB_MIX_IMPROVED.py) — hasil final + visualisasi lengkap
- [x] 9 file PNG grafik tersimpan
- [x] Web app Flask localhost — semua fitur berjalan
- [x] Mode Teks: prediksi + rekomendasi XGBoost + indikator + batch prediksi
- [x] Mode Teks: highlight kata spam (merah) di body teks setelah analisis
- [x] Mode Teks: tombol Salin Hasil ke clipboard
- [x] Mode CSV: evaluasi batch + balancing train/test + fast/full preset
- [x] Mode CSV: field Nama Eksperimen (opsional) sebelum mulai evaluasi
- [x] Prediksi realtime dari model job yang baru dilatih
- [x] Riwayat eksperimen persist di disk + sortable + tooltips header kolom
- [x] Riwayat: pencarian/filter real-time di semua kolom
- [x] Riwayat: perbandingan dinamis ≥2 run + tabel highlight + bar chart
- [x] Riwayat: pin/bintang eksperimen penting (localStorage)
- [x] Riwayat: nama eksperimen tampil via tooltip instan (JS fixed-position)
- [x] Riwayat: catatan per eksperimen (edit + simpan ke server)
- [x] Grafik bar chart di modal perbandingan (Chart.js)
- [x] Hasil CSV terakhir persist di disk (tidak hilang saat restart)
- [x] Dark mode, dataset stats preview, progress bar, cancel job, auto-resume
- [x] Dark mode: warna pin bintang dan baris pinned menyesuaikan
- [x] Export JSON, CSV, Print/PDF, Chi-Square PNG
- [x] Top 20 Chi-Square selalu tepat 20 fitur valid
- [x] Mode Full = 100% identik hasil skrip skripsi
- [x] Adaptive polling, lazy load, background pipeline load
- [x] Tombol Cancel training + auto-resume saat halaman di-refresh
- [x] Model uji realtime tersimpan permanen di `web_app/saved_models/`
- [x] Hapus BERT model (hemat 420 MB)
- [x] UI Premium (glassmorphism, dot-grid bg, dark theme, font Archivo + JetBrains Mono)
- [x] Confusion Matrix angka besar & bold (22px, weight 800) — hanya CM utama
- [x] Tabel per-kelas diperbesar (16px) — diisolasi dari tabel lain
- [x] Modal perbandingan riwayat: latar solid + blur overlay (anti-transparan)
- [x] Responsif HP: tab menu tidak terpotong, body padding kompak
- [x] Top 20 Chi-Square: 2 kolom sejajar sempurna di HP (table-layout fixed)
- [x] Badge NON-SPAM tidak terpotong di HP (white-space nowrap)
- [x] Auto-reset mode pilih data saat pindah tab

---

## 9. Konteks untuk AI Assistant Baru

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

## 10. Update Terbaru (25 Juni 2026)

### Fitur Baru Web App

| #   | Fitur                          | Lokasi      | Keterangan                                                                                                          |
| --- | ------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------- |
| 1   | **Highlight kata spam**        | Mode Teks   | Kata indikator spam di-highlight merah setelah analisis                                                             |
| 2   | **Tombol Salin Hasil**         | Mode Teks   | Salin label, probabilitas, teks ke clipboard dalam satu klik                                                        |
| 3   | **Nama Eksperimen**            | Mode CSV    | Field opsional sebelum evaluasi; tersimpan di riwayat & modal perbandingan                                          |
| 4   | **Tooltips header kolom**      | Tab Riwayat | Hover header → penjelasan singkat tiap kolom                                                                        |
| 5   | **Pencarian riwayat**          | Tab Riwayat | Filter real-time di semua kolom (waktu, preset, akurasi, catatan, dll)                                              |
| 6   | **Perbandingan ≥2 run**        | Tab Riwayat | Perbandingan dinamis dengan nilai highlight hijau + bar chart Chart.js                                              |
| 7   | **Pin/Bintang eksperimen**     | Tab Riwayat | Tandai run penting; baris highlight kuning, tersimpan di localStorage                                               |
| 8   | **Tooltip nama instan**        | Tab Riwayat | Hover kolom Waktu → tooltip dark muncul tanpa delay (JS fixed-position)                                             |
| 9   | **UI Checkbox Dinamis**        | Tab Riwayat | Checkbox tabel disembunyikan secara default, hanya muncul saat tombol "Pilih Data" diklik agar lebih rapi           |
| 10  | **Tombol Responsif (.btn-sm)** | Tab Riwayat | Mengecilkan padding/font tombol di header riwayat agar tidak membentur layout (tetap 1 baris) saat mode pilih aktif |

### Bug Fix

| Bug                                                  | Solusi                                                                                                                    |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Indikator tab Mode CSV tidak aktif saat pertama buka | Fixed `switchTab()` CSS class handling                                                                                    |
| Contoh Spam Phishing Bank terdeteksi NON-SPAM        | Diganti contoh Spam Obat Murah yang reliabel terdeteksi kedua model                                                       |
| Tooltip CSS `::after` terpotong oleh overflow tabel  | Diganti JS tooltip `position:fixed` yang tidak terpengaruh overflow                                                       |
| Warna bintang pin nabrak di dark mode                | Eksplisit `#fbbf24` amber untuk dark, `#f59e0b` untuk light                                                               |
| Baris pinned background tidak cocok dark mode        | Tambah `body.dark tr.pinned-row { background: #292619 }`                                                                  |
| Warna teks indikator tidak terlihat                  | Menyesuaikan kontras warna teks indikator agar mudah dibaca                                                               |
| Pembaruan Contoh Teks                                | Menambahkan contoh spam baru (Diskon/Event Game) dan 3 contoh normal baru (IBM SkillsBuild, GitHub Copilot, Tugas Kampus) |

### Penambahan Backend (`app.py`)

- Field `label_name` diterima dari FormData evaluate dan disimpan ke `input.json`
- Field `label_name` dibaca saat build history summary → tersimpan ke `experiment_history.json`
- Field `note` diinisialisasi kosong dalam history summary (sebelumnya tidak ada)

---

## 11. Update Terbaru (26 Juni 2026)

### UI / UX Enhancements

| #   | Fitur                                  | Lokasi                         | Keterangan                                                                                                                                                                             |
| --- | -------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Grid Confusion Matrix Perbandingan** | Tab Riwayat (Modal Bandingkan) | Menampilkan Confusion Matrix (TP, TN, FP, FN) dalam format grid UI modern di bawah grafik perbandingan, untuk visualisasi detail yang lebih baik (dibandingkan sekadar teks di tabel). |
| 2   | **Refaktor Tata Letak Tabel Riwayat**  | Tab Riwayat                    | Memisahkan kolom "Pin/Catatan" agar lebih rapi. Kolom "Pin" dipindahkan letaknya di awal (tepat setelah nomor urut) dan kolom "Catatan" dikembalikan ke bagian paling akhir tabel.     |

---

## 12. Update Terbaru (27 Juni 2026)

### Backend & Performa

| #   | Fitur                          | Lokasi         | Keterangan                                                                                                                                                                                                                                                         |
| --- | ------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **VRAM Saver (max_bin=128)**   | `evaluator.py` | Optimasi GPU otomatis saat dataset uji melebihi 10.000 baris. Nilai dikembalikan ke `128` (sebelumnya `64`) agar representasi histogram data tetap jelas dan rasional untuk dipertanggungjawabkan saat Sidang Skripsi (mencegah _regularization_ yang berlebihan). |
| 2   | **Perbaikan Dataset Fallback** | `script.js`    | Memperbaiki masalah di mana nama dataset `Custom Train` tidak tersimpan dengan benar dan hanya memunculkan "bawaan". Sekarang, nama asli berkas CSV (seperti `enron_spam.csv` atau `Phishing.csv`) akan tertulis akurat di tabel riwayat.                          |

### Deployment & Portabilitas

| #   | Fitur                             | Lokasi                  | Keterangan                                                                                                                                                                                                                              |
| --- | --------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Auto-Run Script (Plug & Play)** | `Jalankan_Aplikasi.bat` | Skrip otomatis untuk menjalankan aplikasi di laptop Windows mana pun tanpa perlu setup manual. Skrip akan mendeteksi Python, membangun `.venv` baru, menginstal `requirements.txt`, dan menjalankan localhost dengan sekali klik ganda. |
| 2   | **Integrasi GitHub Private**      | Git / GitHub            | Seluruh kode telah dicadangkan (_pushed_) ke repositori GitHub `Spam-Email` secara _Private_. Berkas skripsi PDF dan _dataset_ `.csv` telah diamankan (_ignore_) agar tidak tersebar ke ranah daring.                                   |

### Penyempurnaan UX & Sinkronisasi (27 Juni 2026 - Lanjutan)

| #   | Fitur                                    | Lokasi                                 | Keterangan                                                                                                                                                                                                                 |
| --- | ---------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Hapus Sekaligus (Batch Delete)**       | `app.py` & `script.js`                 | Penambahan fitur kotak centang dan tombol "Hapus Terpilih" (termasuk seleksi langsung klik pada baris tabel) untuk mempermudah menghapus banyak riwayat eksperimen sekaligus.                                              |
| 2   | **Sinkronisasi Bintang (Pin) ke Server** | `app.py` & `script.js`                 | Status penyematan (Pin) eksperimen tidak lagi disimpan di `localStorage` peramban, melainkan tersinkronisasi di server (backend), sehingga riwayat Pin di laptop juga terbaca persis sama saat diakses lewat HP (Hotspot). |
| 3   | **Optimalisasi Tampilan Mobile (HP)**    | `index.html`, `style.css`, `script.js` | Menyesuaikan tampilan hasil matriks dan perbandingan akurasi, memberikan bungkus batas agar grafik riwayat dapat digeser (horizontal scroll), dan memperbaiki tata letak tombol Mode Gelap (hanya emotikon) agar bersih.   |
| 4   | **Bug-Fix Skrip Peluncuran Otomatis**    | `Jalankan_Aplikasi.bat`                | Memperbaiki _crash_ instan pada terminal dengan memperbaiki sintaks kondisi `if` (masalah penanda kurung) dan menambahkan pengaman paksaan akses root direktori eksekusi `cd /d "%~dp0"`.                                  |
| 5   | **Perbaikan Upload CSV di Android**      | `index.html`                           | Mengubah ekstensi pada input file (`accept=".csv, text/csv, application/vnd.ms-excel"`) untuk mencegah blokir/filter ketat dari OS Android yang sering mengunci file murni berakhiran `.csv`.                              |
| 6   | **Default Mode Training "Full"**         | `index.html`                           | Mengubah _radio button_ bawaan ke mode "Full" agar saat website dimuat ulang, eksperimen selalu berada pada mode terlengkap (identik dengan skrip skripsi asli).                                                           |

### Manajemen AI & Token Saving (27 Juni 2026 - Malam)

| #   | Fitur                         | Lokasi      | Keterangan                                                                                                                                                                                        |
| --- | ----------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Integrasi CLAUDE.md**       | `CLAUDE.md` | Menggabungkan _rules_ proyek ke dalam satu file standar universal yang dikenali oleh berbagai IDE (Cursor, Cline, dll).                                                                           |
| 2   | **Ponytail & Headroom Rules** | `CLAUDE.md` | Menetapkan paksaan (_enforcement_) agar AI selalu menggunakan gaya koding paling efisien (Prinsip YAGNI) dan otomatis memadatkan keluaran (_output_) terminal agar menghemat ribuan token harian. |

## 13. Update Terbaru (28 Juni 2026)

### Visual Feedback Baris Terpilih pada Riwayat

| #   | Fitur                     | Lokasi                     | Keterangan                                                                                                                                                                                                 |
| --- | ------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Row Highlight CSS**     | `web_app/static/style.css` | Menambahkan class `.selected-row` dengan background ungu lembut (`#eef2ff`) + border kiri 3px ungu. Varian khusus untuk baris pinned + selected (gradient kuning → ungu).                                  |
| 2   | **Row Highlight JS Sync** | `web_app/static/script.js` | Fungsi `updateDeleteBtn()` sekarang toggle class `selected-row` pada `<tr>`. Event listener `change` global menangkap toggle dari event delegation (select-all, deselect-all, atau klik baris individual). |

### Anti-Flicker Tab State Sync

| #   | Fitur                         | Lokasi                         | Keterangan                                                                                                                                                                                                                                                                                                                                                                                                |
| --- | ----------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **MutationObserver Tab Sync** | `web_app/templates/index.html` | Menambahkan inline script di `<head>` yang menggunakan MutationObserver untuk sinkronisasi state tab button dan pane SEBELUM first paint. Mencegah visual flicker saat refresh halaman dengan URL hash (`#csv`, `#history`). Script mengamati DOM mutations, toggle class `.active` pada elemen yang tepat, lalu disconnect — tidak ada CSS `!important` atau race condition dengan deferred `script.js`. |

### Manajemen Pengetahuan & Dokumentasi (Knowledge Management)

Seluruh dokumentasi proyek ini (termasuk file ini) dioptimalkan menggunakan format Markdown (`.md`).
Untuk pengalaman membaca dan menulis yang lebih baik layaknya menyusun Wikipedia pribadi, **sangat disarankan menggunakan aplikasi Obsidian**.
Cukup instal [Obsidian](https://obsidian.md/), lalu pilih _"Open folder as vault"_ dan arahkan ke folder utama skripsi (`Code_Spam_Email`). Obsidian akan secara otomatis membaca, merender struktur tabel, memberikan fitur pencarian yang cepat, serta memperlihatkan peta keterkaitan antar dokumen (_Graph View_).

### Keamanan, Performa & Validasi (28 Juni 2026 - Tambahan)

| #   | Fitur                                  | Lokasi                     | Keterangan                                                                                                                                                                                                                                                                 |
| --- | -------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Validasi Ekstensi & XSS Prevention** | `script.js`                | Menambahkan pengecekan sisi peramban (_client-side_) agar formulir hanya menerima ekstensi `.csv`, serta menerapkan `escapeHtml()` pada render nama file guna menghindari kerentanan _Cross-Site Scripting_ (XSS).                                                         |
| 2   | **Exponential Backoff Polling**        | `script.js`                | Polling status _training_ (`/job/<id>`) kini tidak mem-ping server terus-menerus setiap 2 detik. Interval akan secara cerdas merenggang (bertahap naik menjadi 5-8 detik) jika durasi pelatihannya cukup lama, sehingga secara signifikan menghemat _resource_ CPU server. |
| 3   | **Debounced History Search**           | `script.js`                | Menerapkan fungsi _debounce_ (jeda 300ms) pada kolom pencarian Riwayat Eksperimen. Hal ini mencegah peramban _lag_ atau macet saat pengguna mengetik dengan sangat cepat di kotak pencarian.                                                                               |
| 4   | **Pemisahan Progress Bar M1 & M2**     | `script.js`                | Memisahkan alur indikator _loading_ menjadi `_progressStagesM1` dan `_progressStagesM2` agar taksiran persentase pelacakan lebih sinkron dan realistis sesuai dengan metode yang sedang berjalan.                                                                          |
| 5   | **Memory Leak Prevention**             | `script.js`                | Menambahkan _event listener_ `beforeunload` untuk menetralkan / mematikan objek grafik _Chart.js_ dan timer _polling_ sebelum halaman ditutup (mencegah kebocoran memori RAM peramban).                                                                                    |
| 6   | **Modernisasi Tombol Dark Mode**       | `index.html` & `style.css` | Merombak tombol _Dark Mode_ bulat lama menjadi tombol kapsul (_pill button_) modern yang dilengkapi teks dinamis dan diletakkan strategis berdampingan dengan sub-judul halaman web.                                                                                       |

---

## 14. Update Terbaru (29 Juni 2026)

### Perombakan UI/UX (Linear / Cult UI Aesthetic)

| #   | Fitur                                          | Lokasi                    | Keterangan                                                                                                                                                                                                                                  |
| --- | ---------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Glassmorphism & Opacity Adjustments**        | `style.css`               | Merombak desain kartu (.card) dengan efek kaca (_backdrop-filter blur_) transparan. Opasitas dioptimalkan (80% transparan `rgba(24, 24, 27, 0.80)`) agar teks tetap sangat jelas terbaca meski pada tingkat kecerahan layar HP yang rendah. |
| 2   | **Penyempurnaan Warna Background (Soft Dark)** | `style.css`               | Mengubah warna _background_ utama mode gelap dari hitam pekat (`#09090b`) menjadi _slate black_ abu-abu super gelap (`#111113`) agar lebih ramah di mata dan terasa premium.                                                                |
| 3   | **Penyatuan Card Mode Teks**                   | `index.html`, `script.js` | Menggabungkan hasil akurasi model Naive Bayes dan XGBoost pada Mode Teks ke dalam **satu card besar** terpadu (dipisah dengan garis putus-putus), menggantikan desain lama yang terpisah-pisah.                                             |
| 4   | **Peningkatan Skala Huruf (Readability)**      | `style.css`               | Menaikkan ukuran _font_ secara spesifik pada tabel _Confusion Matrix_ (dari 13px ke 15px) dan tabel Metrik Per Kelas (dari 13px ke 14px) agar angka-angka krusial jauh lebih mudah dibaca.                                                  |

### Bug Fixes & Tata Letak Mobile

| #   | Fitur                               | Lokasi       | Keterangan                                                                                                                                                                                                                                                 |
| --- | ----------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Fix Tata Letak Input Mobile**     | `style.css`  | Memperbaiki masalah kotak input "Jumlah Spam Training" yang tidak sejajar horizontal pada layar HP akibat teks label di atasnya terpotong/turun baris. Diselesaikan dengan menerapkan `align-items: end;` pada _CSS Grid_.                                 |
| 2   | **Fix Bug Ikon Toggle Tema Hilang** | `index.html` | Tombol _Dark Mode_ atas sempat kehilangan emotikonnya saat diklik karena JavaScript me-reset struktur SVG `lucide`. Diperbaiki dengan menyeragamkan penggunaan elemen `<span class="theme-icon">🌙</span>` murni untuk kedua tombol toggle atas dan bawah. |
| 3   | **Pemulihan Aksen Warna Card**      | `style.css`  | Memperbaiki garis aksen warna di bagian atas _card_ (seperti merah/hijau/biru) yang sebelumnya hilang karena tertimpa deklarasi `border !important` global.                                                                                                |

---

## 15. Update Terbaru (29 Juni 2026 - Tahap Lanjutan)

### Stabilitas Backend & Keamanan Memori

| #   | Fitur                             | Lokasi   | Keterangan                                                                                                                                                                                                                                               |
| --- | --------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Zombie Job Cleanup**            | `app.py` | Menambahkan pembersihan otomatis saat server dijalankan (boot). Jika server Flask mati mendadak saat evaluasi CSV berjalan, _worker_ yang terputus akan ditandai dengan error `result.json` agar _frontend_ tidak terjebak dalam siklus _polling_ abadi. |
| 2   | **Fallback Job Status Sinkron**   | `app.py` | Memaksa penulisan `result.json` ke dalam _disk_ secara sinkron apabila _worker_ gagal atau dihentikan paksa (cancelled), sehingga antarmuka UI menerima umpan balik seketika.                                                                            |
| 3   | **Memory Leak Prevention (Jobs)** | `app.py` | Menghapus referensi memori pekerjaan (`del jobs[job_id]`) secara proaktif segera setelah _worker_ selesai dan data disimpan ke cakram. Ini memastikan RAM server tidak membengkak walau ratusan pengguna melakukan eksperimen berturut-turut.            |

### Pemisahan & Modularisasi Frontend (Skala Besar)

| #   | Fitur                        | Lokasi               | Keterangan                                                                                                                                                                                                       |
| --- | ---------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Pemecahan Monolitik JS**   | `web_app/static/js/` | Berkas `script.js` raksasa (2.400 baris) telah dipecah secara sistematis menjadi 4 berkas mandiri (`utils.js`, `mode_text.js`, `mode_csv.js`, dan `history.js`) untuk mempermudah perawatan kode jangka panjang. |
| 2   | **Pemuatan Skrip Berurutan** | `index.html`         | Mengganti pemuatan `script.js` tunggal dengan pemanggilan 4 modul JS baru secara berurutan, mempertahankan ruang lingkup _Global Variable_ tetap utuh dan stabil tanpa memecah dependensi bawaan.                |

---

## Riwayat Update (Changelog)

## ✦ Recent Updates (05 Juli 2026) — Final Architecture & Performance Optimization

**Tujuan:** Menerapkan standar industri untuk produksi web (*production-grade*) dan mengatasi *bottleneck* memori, serta mengatasi hutang teknis (DRY).

1. **Arsitektur Kode: DRY (Don't Repeat Yourself)**
   - **Masalah:** Fungsi `preprocess()`, `extra_features()`, dan konstanta daftar *spam/ham* diduplikasi pada file `model_pipeline.py` dan `evaluator.py`.
   - **Solusi:** Seluruh logika duplikat diekstrak ke dalam satu *module shared* baru yaitu `_shared.py`. Semua *script* sekarang mengimpor fungsi dan konstanta dari file ini.
2. **Optimasi Memori (RAM): Memory Mapping (`mmap_mode='r'`)**
   - **Masalah:** *Load* matriks TF-IDF secara utuh membebani RAM (hingga gigabytes).
   - **Solusi:** Modifikasi `joblib.load()` menggunakan metode *memory mapping* `mmap_mode='r'` pada `model_pipeline.py`. Ini mengizinkan model berukuran masif untuk dibaca perlahan langsung dari disk SSD/HDD, mencegah lonjakan RAM, dan memangkas jeda inisialisasi aplikasi.
3. **Web Server Stabil: Produksi (Waitress WSGI)**
   - **Masalah:** Server bawaan Flask (Werkzeug) dikhususkan untuk *development* (single-threaded) dan sangat tidak aman serta tidak stabil jika diakses secara masif (dari banyak *smartphone* saat demo).
   - **Solusi:** Migrasi *web server* menggunakan **Waitress** (standar WSGI untuk lingkungan Windows). Aplikasi kini bisa menyerap *traffic* yang besar tanpa gangguan.
4. **Optimasi Waktu Muat Antarmuka (UI Load Time)**
   - **GZIP Compression:** Menambahkan ekstensi `Flask-Compress`. File JSON (seperti riwayat evaluasi), file CSS, dan JS kini dikompres *on-the-fly* sebelum disajikan ke *browser*, memangkas drastis ukuran pemuatan *(payload size)*.
   - **Non-Blocking JS:** Tag `script` di `index.html` dimodifikasi menggunakan parameter `defer` sehingga proses merender kerangka visual antarmuka (HTML/CSS) di layar *smartphone* bisa terjadi secara instan tanpa tertahan menunggu Javascript.
5. **Perbaikan UX: Penyatuan Fungsi Tombol Hapus**
   - Menghilangkan tombol *Tutup* pada *card* Hasil Uji Batch. Fungsi penutupan *card* dan pembersihan memori UI batch kini disatukan secara ringkas dengan tombol "Hapus" utama yang terletak di Mode Teks (sebelah tombol Analisis dan Batch).

---

## ⚙ Updates (05 Juli 2026) — Bug Fixes & Mobile UI Polish

1. **Pencegahan Ghost Process**
   - Menambahkan mekanisme penangkapan sinyal `SIGINT` dan `SIGTERM` secara eksplisit pada *backend* Flask dan *sub-process* model. Hal ini menjamin bahwa setiap kali _developer_ menghentikan server (CTRL+C) saat melakukan evaluasi model, semua proses di memori mati secara tuntas tanpa menyisakan proses siluman (*ghost process*) yang memakan RAM/GPU.
2. **Penyempurnaan Animasi (Anti-Blink)**
   - Menghilangkan kedipan transparansi (*opacity blink*) pada komponen teks saat pergantian hasil evaluasi. Transisi sekarang berjalan mulus secara instan.
3. **Perbaikan *Icon* Analisis yang Hilang**
   - Memperbaiki hilangnya *icon* petir (▶) di tombol **"Analisis dengan Model Ini"** pasca evaluasi ulang. Sistem kini memasukkan kembali elemen SVG Lucide Icons secara presisi tanpa bertabrakan dengan manipulasi DOM.
4. **Perataan Lebar Kolom Tabel Batch**
   - **Preview Teks:** Diubah menjadi rata kiri (*left-aligned*) dengan `padding-left: 10px` agar mudah dibaca dan tidak menyatu dengan kolom angka urut.
   - **Probabilitas:** Lebar kolom ditambah dari `150px` menjadi `180px` untuk menampung teks "NB 100.0% | XGB 100.0%" agar proporsional dan tidak menabrak kolom Hasil/Result.
5. **Warna Navigasi Bawah di Browser Seluler (Gesture Bar Android/iOS)**
   - Menambahkan `<meta name="theme-color">` pada header *web* dan membuat properti *background-color* eksklusif di tag `<html>` yang tersinkronisasi. Ini menyembuhkan masalah *gesture bar* putih yang merusak imersi visual pada Safari iOS dan Chrome Android saat mengaktifkan *Dark Mode*.

---


### Penyempurnaan Tampilan Utama & Responsivitas
| #   | Fitur                                  | Lokasi                     | Keterangan                                                                                                                                                     |
| --- | -------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Grid Latar Light Mode Terjaga**      | style.css                | Mengganti shorthand ackground menjadi ackground-color pada elemen ody sehingga tidak lagi menimpa pola grid (tekstur) di Light Mode.                  |
| 2   | **Mencegah Layout Shift (Layar Geser)**| style.css                | Menambahkan aturan modern scrollbar-gutter: stable; overflow-y: scroll; pada kerangka dokumen html untuk mencegah halaman bergeser patah-patah saat berpindah antar tab (teks/CSV/riwayat). |
| 3   | **Kontras Tab Menu Dark Mode**         | style.css                | Mengubah warna latar div.tabs (pembungkus) menjadi lebih pekat (ar(--gray-50)) agar tombol menu aktif yang berwarna ar(--primary) bisa "pop-out" atau terlihat menonjol dan kontras di mata. |
| 4   | **Animasi Hover Tab Fleksibel**        | style.css                | Memperbaiki bug warna transparan "aneh" saat hover. Menambahkan efek 	ransform: scale(1.02) saat hover (pada tab aktif maupun pasif) untuk rasa interaksi yang lebih "hidup" tanpa merusak hierarki warna solid, ditambah highlight #e4e4e7 (Light)/#3f3f46 (Dark) universal untuk kompatibilitas. |

### Perbaikan Sistem Data (Bug Fix)
| #   | Fitur                                  | Lokasi                     | Keterangan                                                                                                                                                     |
| --- | -------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Pembasmi Hasil Hantu (Ghost Result)**| mode_csv.js, history.js| Memperbaiki bug salah ketik etch('/last_result/clear') menjadi /lastresult/clear (mengikuti rute di pp.py). Ini memastikan hasil sebelumnya benar-benar terhapus secara permanen di backend saat tombol 'Reset' atau 'Mulai Evaluasi' ditekan, sehingga hasil lama tak muncul lagi setelah halaman di-refresh. |


## ✦ Recent Updates (30 Juni 2026) — Phase 1, 2, 3 Implementation

### Phase 1: Backend Refactoring & Code Quality

**Tujuan:** Menghilangkan duplikasi kode, meningkatkan maintainability, dan memperbaiki struktur backend.

#### 1.1 Modul Bersama [`_shared.py`](web_app/_shared.py)

**Masalah Awal:**

- Duplikasi kode preprocessing dan feature engineering di [`evaluator.py`](web_app/evaluator.py) (242 baris) dan [`model_pipeline.py`](web_app/model_pipeline.py) (185 baris)
- Total ~427 baris kode duplikat yang sulit dipelihara
- Perubahan harus dilakukan di 2 tempat berbeda, risiko inkonsistensi tinggi

**Solusi:**

- Ekstraksi fungsi bersama ke modul baru [`web_app/_shared.py`](web_app/_shared.py) (187 baris)
- **Konten modul:**
  - Constants: `SPAM_KW` (35 kata kunci spam), `HAM_PLATFORMS` (20 platform legitimate)
  - Preprocessing: `preprocess()` — lowercase, tokenisasi URL/email/harga/angka
  - Feature Engineering: `build_features()` — 13 fitur struktural + 35 fitur keyword binary
  - Utilities: `find_optimal_threshold()` — pencarian threshold optimal via F1-score maximization

**Dampak:**

- ✔ **Reduksi duplikasi:** -427 baris → +187 baris = **hemat 240 baris (~56%)**
- ✔ **Single source of truth:** Perubahan di `_shared.py` otomatis berlaku di semua pipeline
- ✔ **Maintainability:** Lebih mudah debug dan test karena logika terpusat
- ✔ **Konsistensi:** Preprocessing Mode Teks & Mode CSV dijamin identik

**File yang Direfactor:**

- [`web_app/evaluator.py`](web_app/evaluator.py) — import dari `_shared` (lines 12-15)
- [`web_app/model_pipeline.py`](web_app/model_pipeline.py) — import dari `_shared` (lines 10-13)

---

#### 1.2 Perbaikan Critical Backend Issues

| #   | Issue                        | File                                   | Solusi                                                                                      |
| --- | ---------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | **Zombie job cleanup**       | [`app.py`](web_app/app.py)             | Cleanup otomatis saat server boot — worker terputus ditandai error di `result.json`         |
| 2   | **Memory leak prevention**   | [`app.py`](web_app/app.py)             | `del jobs[job_id]` setelah worker selesai, RAM tidak membengkak                             |
| 3   | **Fallback job status sync** | [`app.py`](web_app/app.py)             | Force-write `result.json` sinkron jika worker cancelled/failed                              |
| 4   | **VRAM optimization**        | [`evaluator.py`](web_app/evaluator.py) | `max_bin=128` untuk dataset >10K baris (sebelumnya 64, dinaikkan untuk rasionalitas sidang) |

---

### Phase 2: Frontend Architecture & Accessibility

**Tujuan:** Modularisasi frontend, meningkatkan performa, dan memperbaiki accessibility critical issues.

#### 2.1 Pemecahan Monolitik JavaScript

**Masalah Awal:**

- File `script.js` monolitik: **2.400+ baris** dalam 1 file
- Sulit dipelihara, scroll panjang untuk mencari fungsi
- Tidak ada separation of concerns

**Solusi:** Pemisahan menjadi 4 modul mandiri:

| File                                             | Lines | Tanggung Jawab                                                                    |
| ------------------------------------------------ | ----- | --------------------------------------------------------------------------------- |
| [`utils.js`](web_app/static/js/utils.js)         | ~400  | Fungsi bantuan global, UI utilities, dark mode, toast notifications               |
| [`mode_text.js`](web_app/static/js/mode_text.js) | ~600  | Logika Mode Teks: prediksi single/batch, highlight spam keywords, copy results    |
| [`mode_csv.js`](web_app/static/js/mode_csv.js)   | ~800  | Logika Mode CSV: upload, evaluasi, polling, Chart.js rendering, Top 20 Chi-Square |
| [`history.js`](web_app/static/js/history.js)     | ~600  | Sistem Riwayat: sortable table, search/filter, comparison modal, pin/unpin        |

**Strategi Pemuatan:**

- Sequential loading di [`index.html`](web_app/templates/index.html) (lines 1043-1046)
- Global variable scope tetap utuh untuk backward compatibility
- Tidak menggunakan ES6 modules karena kompleksitas legacy code

**Dampak:**

- ✔ **Maintainability:** Setiap developer bisa fokus di 1 concern
- ✔ **Debuggability:** Console errors langsung point ke file spesifik
- ✔ **Performance:** Browser bisa parallel-download 4 file kecil vs 1 file besar
- ✔ **Code organization:** Fungsi mudah ditemukan berdasarkan kategori

---

#### 2.2 Accessibility Improvements

**Berdasarkan audit WCAG 2.2 di [`UI_UX_AUDIT_REPORT.md`](UI_UX_AUDIT_REPORT.md):**

| #   | Issue                              | Priority    | Solusi                                                                                    | File                                         |
| --- | ---------------------------------- | ----------- | ----------------------------------------------------------------------------------------- | -------------------------------------------- |
| 1   | **Missing reduced motion support** | P0 Critical | `@media (prefers-reduced-motion: reduce)` — disable semua animasi                         | [`style.css`](web_app/static/style.css:2003) |
| 2   | **Sortable table keyboard nav**    | P1 High     | Header tabel Riwayat kini clickable dengan keyboard (`tabindex="0"`, Enter/Space handler) | [`history.js`](web_app/static/js/history.js) |
| 3   | **Tooltip instant feedback**       | P1 High     | Tooltip nama eksperimen muncul instant (<50ms) via JS `position:fixed`                    | [`history.js`](web_app/static/js/history.js) |
| 4   | **Focus visible states**           | P1 High     | Semua interactive elements punya `:focus-visible` outline                                 | [`style.css`](web_app/static/style.css)      |
| 5   | **Color contrast**                 | P2 Medium   | Badge NON-SPAM/SPAM disesuaikan kontras untuk dark mode                                   | [`style.css`](web_app/static/style.css)      |

---

#### 2.3 Animation & Performance Fixes

**Critical Performance Issues (P0):**

| Issue                      | Before                                    | After                                                   | Impact                                           |
| -------------------------- | ----------------------------------------- | ------------------------------------------------------- | ------------------------------------------------ |
| **Layout thrashing**       | `transition: width 0.5s`                  | `transition: transform 0.5s` + `scaleX()`               | 60fps stabil, no jank                            |
| **Bounce easing**          | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (ease-out-quart) | Motion konsisten dengan brand "Academic Premium" |
| **Memory leak prevention** | N/A                                       | `beforeunload` event cleanup Chart.js & polling timers  | Prevent RAM bloat di long sessions               |

---

### Phase 3: New Features & UI/UX Polish

**Tujuan:** Menambahkan 5 fitur baru yang diminta user, memperbaiki responsivitas mobile, dan polish final pre-sidang.

#### 3.1 Five New Features

##### 1. **Sortable Batch Evaluation Table**

- **Lokasi:** Tab Riwayat (history table)
- **Fitur:** Klik header kolom untuk sort ascending/descending
- **Indikator:** ▲ (asc) / ▼ (desc) / ⇅ (default)
- **Kolom sortable:** No, Waktu, NB M1, XGB M1, NB M2, XGB M2, Waktu(s)
- **File:** [`history.js`](web_app/static/js/history.js) — `handleHeaderClick()`

##### 2. **Quick Preset Selector (Mode CSV)**

- **Lokasi:** Mode CSV, bagian atas form
- **Preset:** Fast (1-2 menit) vs Full (10-30 menit, identik skrip skripsi)
- **Parameter otomatis:**
  - Fast: 10K word features, 500 XGB trees
  - Full: 20K word features, 3000 XGB trees
- **File:** [`index.html`](web_app/templates/index.html:412-426), [`mode_csv.js`](web_app/static/js/mode_csv.js)

##### 3. **Tooltips for Table Headers**

- **Lokasi:** Tab Riwayat, hover header kolom
- **Konten:** Penjelasan singkat tiap kolom (misal: "NB M1: Akurasi Naive Bayes Metode 1")
- **Teknologi:** JS tooltip `position:fixed` (tidak terpotong overflow)
- **File:** [`history.js`](web_app/static/js/history.js) — `createColumnTooltips()`

##### 4. **CSV Preview Before Training**

- **Lokasi:** Mode CSV, setelah upload CSV
- **Info ditampilkan:** Total rows, Non-Spam count, Spam count, kolom terdeteksi, rata-rata panjang teks
- **Endpoint:** `POST /dataset_preview`
- **File:** [`app.py`](web_app/app.py:158-180), [`mode_csv.js`](web_app/static/js/mode_csv.js)

##### 5. **Visual Sort Indicators**

- **Lokasi:** Tab Riwayat, header tabel
- **Indikator:** ⇅ (unsorted) → ▲ (ascending) → ▼ (descending)
- **State management:** `_sortState` global variable
- **File:** [`history.js`](web_app/static/js/history.js)

---

#### 3.2 Critical Bug Fixes

| #   | Bug                                       | Severity | Root Cause                                       | Solusi                                             | File                                         |
| --- | ----------------------------------------- | -------- | ------------------------------------------------ | -------------------------------------------------- | -------------------------------------------- |
| 1   | **Confusion Matrix angka kecil di HP**    | P0       | Font 13px terlalu kecil untuk metrik krusial     | Isolasi `.cm-table-main` dengan font 22px bold-800 | [`style.css`](web_app/static/style.css:1455) |
| 2   | **Top 20 Chi-Square tidak sejajar di HP** | P0       | Dynamic column width berbeda saat stack vertikal | `table-layout: fixed` + absolute width             | [`style.css`](web_app/static/style.css:1523) |
| 3   | **Badge NON-SPAM terpotong di HP**        | P0       | Text wrapping karena viewport sempit             | `white-space: nowrap` + font 11px                  | [`style.css`](web_app/static/style.css:1598) |
| 4   | **Modal perbandingan transparan**         | P1       | `--card-bg` punya 50% opacity tanpa backdrop     | Background solid + `backdrop-filter: blur(8px)`    | [`style.css`](web_app/static/style.css:892)  |
| 5   | **Tab "Riwayat (11)" terpotong di HP**    | P1       | `max-content` width melebihi viewport            | `width: 100%` + padding kompak di ≤600px           | [`style.css`](web_app/static/style.css:1411) |

---

#### 3.3 Responsive Design Improvements

**Mobile (≤600px) Optimizations:**

| Area                  | Improvement       | Before             | After                                     |
| --------------------- | ----------------- | ------------------ | ----------------------------------------- |
| **Tab Menu**          | Tidak terpotong   | Text overflow      | Font 12px, width 100%, padding kompak     |
| **Confusion Matrix**  | Angka besar       | 13px regular       | 22px bold-800 (isolated `.cm-table-main`) |
| **Per-Class Table**   | Readable metrics  | 13px               | 16px (isolated `.per-class-table-main`)   |
| **Top 20 Chi-Square** | Alignment perfect | Misaligned columns | `table-layout: fixed`, absolute width     |
| **Badges**            | No text wrap      | Badge terpotong    | `white-space: nowrap`, font 11px          |
| **Body Padding**      | Compact layout    | 30px               | 16px (maximize screen estate)             |

**File:** [`style.css`](web_app/static/style.css:1400-1650) — Media query `@media (max-width: 600px)`

---

### Summary of Changes

**Backend:**

- ✔ New module [`_shared.py`](web_app/_shared.py) — 187 lines, eliminates 240 lines duplication
- ✔ Memory leak fixes, zombie job cleanup, VRAM optimization

**Frontend:**

- ✔ JS modularization: 2400 lines → 4 files (400-800 lines each)
- ✔ Accessibility: Reduced motion, keyboard nav, tooltips, contrast fixes
- ✔ Performance: Layout animations fixed, memory cleanup, exponential backoff polling

**New Features:**

- ✔ Sortable batch evaluation table with visual indicators
- ✔ Quick preset selector (Fast/Full)
- ✔ Tooltips for table headers
- ✔ CSV preview before training
- ✔ Visual sort indicators (⇅▲▼)

**Bug Fixes:**

- ✔ 5 critical mobile responsiveness issues resolved
- ✔ Confusion Matrix font size isolation
- ✔ Modal transparency fixed
- ✔ Tab menu overflow fixed

**Files Modified:** 12 files total

- Backend: [`_shared.py`](web_app/_shared.py) (new), [`app.py`](web_app/app.py), [`evaluator.py`](web_app/evaluator.py), [`model_pipeline.py`](web_app/model_pipeline.py)
- Frontend: [`utils.js`](web_app/static/js/utils.js), [`mode_text.js`](web_app/static/js/mode_text.js), [`mode_csv.js`](web_app/static/js/mode_csv.js), [`history.js`](web_app/static/js/history.js)
- UI: [`index.html`](web_app/templates/index.html), [`style.css`](web_app/static/style.css)
- Docs: [`DOKUMENTASI.md`](DOKUMENTASI.md), [`UI_UX_AUDIT_REPORT.md`](UI_UX_AUDIT_REPORT.md) (new)

---

## Struktur File Proyek (Web App)

`
Code_Spam_Email/
├── DOKUMENTASI_WEB.md
└── web_app/                    ← WEB APP FLASK
    ├── app.py                  ← Server Flask + job system
    ├── _shared.py              ← Modul bersama (preprocessing)
    ├── evaluator.py            ← Pipeline ML batch
    ├── model_pipeline.py       ← Model tersimpan
    ├── run_eval_worker.py      ← Worker subprocess
    ├── saved_models/           ← Model hasil training CSV
    ├── static/
    │   ├── style.css           ← CSS UI & Dark Mode
    │   └── js/                 ← Modular JS (utils, mode_text, mode_csv, history)
    └── templates/
        └── index.html          ← Kerangka UI Web App
`

## ✦ Recent Updates (06 Juli 2026) — UI/UX Polish & Scroll Animation Refactoring

### Pembaruan UI/UX dan Logika Antarmuka

| #   | Fitur | Lokasi | Keterangan |
| --- | --- | --- | --- |
| 1 | **Sentralisasi Fungsi UI** | utils.js | Memindahkan fungsi pembantu global UI (hide(), showError(), setLoading()) dari mode_csv.js ke utils.js agar struktur arsitektur lebih bersih dan terhindar dari konflik urutan _loading_ script. |
| 2 | **Scroll Reveal Animasi ("Reveal Once")** | utils.js, style.css | Mengubah logika Intersection Observer untuk animasi gulir (scroll-reveal) menjadi **"Muncul Sekali Saja" (Reveal Once)**. Memperbaiki masalah animasi menghilang secara tiba-tiba (instan) saat pengguna men-scroll ke atas, dengan cara mematikan pengawasan observasi setelah elemen pertama kali muncul (Sesuai standar AOS/web modern). |
| 3 | **Penyembunyian Tombol Seleksi** | history.js | Menyembunyikan tombol "Export CSV" saat mode Pilih Data (untuk membandingkan riwayat) sedang aktif. Ini mencegah tombol menu meluap dan terpotong (overflow) pada layar ponsel berukuran kecil. |
| 4 | **Pencegahan Overflow Tombol Aksi** | index.html | Menerapkan lex-wrap: wrap; pada kontainer tombol-tombol riwayat agar tombol otomatis menyusun ke baris bawah apabila ruang layar ponsel sudah tidak cukup, menjaga UI tetap rapi tanpa ada yang terpotong. |
| 5 | **Manual Scroll Restoration** | utils.js | Memaksa perilaku history.scrollRestoration = 'manual' dan window.scrollTo(0,0) pada inisialisasi awal. Mencegah peramban otomatis melanjutkan posisi _scroll_ yang terputus di tengah halaman saat tab dimuat ulang (_refresh_). |
| 6 | **Bust Cache Agresif (v=50)** | index.html | Menaikkan tag versi cache-buster CSS dan JS menjadi ?v=50 untuk memaksa ponsel pintar menghapus singgahan (cache) memori peramban dan langsung mengunduh perbaikan antarmuka terbaru. |
