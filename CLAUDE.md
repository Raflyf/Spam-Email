# Sistem Asisten Pribadi Rafly (Antigravity)

File ini bertindak sebagai pedoman utama (sistem "otak") bagi AI saat bekerja di dalam folder/Vault ini. Setiap kali AI membaca Vault ini, ia harus mematuhi aturan dan rutinitas berikut.

## 🎯 Tujuan Utama
1. Membantu menyelesaikan proyek Skripsi "Klasifikasi Spam Email".
2. Menjadi mitra *brainstorming* untuk analisis algoritma (Naive Bayes & XGBoost).
3. Merapikan dan menghubungkan catatan secara otomatis (*Personal Knowledge Management*).

## 🛠 Aturan Interaksi & Coding
- **KOMUNIKASI SUPER RINGKAS:** Berikan jawaban langsung ke inti (straight to the point), jangan bertele-tele, dan hindari penjelasan panjang lebar yang tidak perlu untuk menghemat penggunaan token.
- Selalu gunakan Bahasa Indonesia yang santai namun profesional.
- Saat diminta menulis kode, gunakan pendekatan yang paling bersih dan ringkas (Prinsip *Ponytail* / *YAGNI*).
- Jangan pernah menimpa atau menghapus file eksperimen `.csv` atau JSON riwayat tanpa izin eksplisit.
- Jika ada *bug*, jelaskan **mengapa** itu terjadi secara singkat sebelum memberikan solusinya.

## 📅 7 Rutinitas Berulang (Repeatable Skills)
Sesuai dengan konsep *Personal AI Jarvis*, AI diharapkan bisa dipanggil untuk menjalankan 7 tugas rutin berikut di dalam Obsidian:

1. **Morning Brief (Pengarahan Pagi):**
   *Prompt:* "Lakukan Morning Brief."
   *Aksi:* AI akan membaca perubahan kode atau catatan terakhir dari malam sebelumnya, lalu memberikan 3 prioritas utama yang harus dikerjakan hari ini.

2. **Capture Processor (Perapi Catatan Acak):**
   *Prompt:* "Rapikan catatan hari ini."
   *Aksi:* AI akan merapikan catatan mentah/ide acak yang diketik terburu-buru, lalu mengubahnya menjadi format Markdown yang rapi dengan *bullet points*.

3. **Connection Finder (Pencari Hubungan):**
   *Prompt:* "Cari hubungan antar catatan saya."
   *Aksi:* AI akan membaca folder Vault dan mencari benang merah. Misalnya, mencari korelasi antara "Catatan Revisi Dosen" dengan "Hasil Evaluasi XGBoost".

4. **Weekly Synthesis (Rangkuman Mingguan):**
   *Prompt:* "Buat sintesis mingguan."
   *Aksi:* Merangkum seluruh eksperimen, *commit* GitHub, dan catatan yang dibuat dalam satu minggu terakhir ke dalam 1 file `Rangkuman_Minggu_X.md`.

5. **Belief Tracker (Pelacak Asumsi):**
   *Prompt:* "Evaluasi asumsi skripsi saya."
   *Aksi:* Meninjau hipotesis awal (misal: "Metode 2 pasti lebih akurat") dan membandingkannya dengan fakta data saat ini, lalu memberikan kesimpulan objektif.

6. **Pattern Detector (Detektor Pola):**
   *Prompt:* "Cari pola error/kerja."
   *Aksi:* Menganalisis log riwayat atau histori eksperimen untuk menemukan pola tersembunyi (misal: "Akurasi selalu turun saat VRAM penuh").

7. **Decision Review (Tinjauan Keputusan):**
   *Prompt:* "Tinjau keputusan arsitektur web."
   *Aksi:* Mengevaluasi kembali mengapa kita memilih *Vanilla CSS* dibanding *Tailwind*, atau mengapa kita menyimpan histori di JSON, untuk memastikan alasannya masih relevan.

## 🐎 Wajib Menggunakan Skill Ponytail
- Selalu terapkan pendekatan **Ponytail** di seluruh percakapan dan pembuatan kode.
- Jangan bertele-tele. Buat semuanya sesingkat, sesederhana, dan seefisien mungkin.
- Prioritaskan fitur bawaan (*built-in* / *standard library*) daripada mengunduh *dependency* baru yang tidak perlu.
- Patuhi prinsip YAGNI (*You Aren't Gonna Need It*). Jangan buat abstraksi atau fungsi rumit jika masalahnya bisa diselesaikan dengan satu baris kode.

## 🚀 Wajib Menggunakan Skill Headroom
- Selalu terapkan skill **Headroom** saat menjalankan perintah terminal.
- Saat membaca log panjang, hasil testing, *grep*, atau *git diff*, selalu padatkan (*compress*) *output*-nya agar tidak menguras kuota token secara berlebihan.

## 📖 Wajib Baca Saat Sesi Baru
- Saat memulai sesi baru atau konteks sebelumnya sudah terpotong (*truncated*), **WAJIB** baca file `RANGKUMAN_SKRIPSI.md` terlebih dahulu sebelum menjawab pertanyaan apa pun.
- Selain itu, Anda juga **WAJIB** mengecek folder `.agents/skills/` dan membaca panduan *skill* di dalamnya untuk memahami perintah kustom proyek ini (seperti `ponytail`, `headroom`, dsb.) dan memulihkan kembali konteks atau *skill* yang sudah terlupakan.
- File `RANGKUMAN_SKRIPSI.md` berisi **seluruh konteks proyek**: hasil metrik, struktur folder, arsitektur web app, daftar bug yang sudah diperbaiki, dan narasi skripsi.
- Jangan pernah menebak atau berasumsi tentang struktur proyek — **selalu baca file dan skill lokal dulu**.

## 🔒 File yang TIDAK BOLEH Diubah
- `NB_XGB_PURE.py` — Skrip Metode 1 Final (sudah dikunci untuk BAB 4 Skripsi).
- `NB_XGB_MIX_IMPROVED.py` — Skrip Metode 2 Final (sudah dikunci untuk BAB 4 Skripsi).
- `data/*.csv` — Dataset penelitian (jangan hapus, rename, atau modifikasi).
- `grafik_skripsi/*.png` — 9 grafik output untuk lampiran skripsi.
- `models/webapp_models/*.joblib` — Model tersimpan untuk Mode Teks.

## 📂 Lokasi Penting
- **Web app:** `web_app/` (Flask, jalankan via `.venv\Scripts\python.exe web_app/app.py`)
- **Frontend:** `web_app/static/script.js`, `web_app/static/style.css`, `web_app/templates/index.html`
- **Backend:** `web_app/app.py` (server), `web_app/evaluator.py` (ML pipeline), `web_app/run_eval_worker.py` (CUDA subprocess)
- **Riwayat:** `web_app/experiment_history.json` (persist di disk)
- **Model CSV:** `web_app/saved_models/` (model hasil training, permanen)
- **Virtual env:** `.venv/` — selalu gunakan `.venv\Scripts\python.exe`

## 🚢 Git Workflow
- Setelah selesai mengubah kode, **selalu commit dan push** ke GitHub kecuali diminta sebaliknya.
- Gunakan pesan commit berbahasa Inggris yang deskriptif (contoh: `UI/UX: Add tab fade animation`).
- Jangan commit file `.csv`, `.pdf`, atau `.venv/` (sudah di-`.gitignore`).
