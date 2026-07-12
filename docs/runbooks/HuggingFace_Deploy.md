# Panduan 3-Klik: Deployment Hugging Face Spaces (via Docker)

Seluruh konfigurasi kode (`Dockerfile`, perbaikan *port*, dan *dependency*) telah disiapkan secara otomatis di repositori GitHub Anda. Anda hanya perlu menautkannya ke Hugging Face.

## Langkah-Langkah Deployment

1. Buka [Hugging Face Spaces](https://huggingface.co/spaces) dan klik tombol **Create new Space**.
2. Isi formulir pembuatan Space:
   - **Space Name:** (Bebas, misalnya: `Spam-Classifier-Skripsi`)
   - **License:** `MIT` (Opsional)
   - **Select the Space SDK:** Pilih **Docker** (Pilih *Blank* template).
   - **Space Hardware:** Pilih **CPU basic (16GB RAM) - Free**.
3. Di halaman kosong Space yang baru saja dibuat, klik tombol **Settings** (atau ikon gir di kanan atas).
4. Gulir ke bawah dan cari bagian **Repository settings**.
5. Temukan dan klik tombol **Connect with GitHub** (atau bisa juga menggunakan opsi *Import from GitHub* di saat awal pembuatan Space).
6. Berikan akses ke repositori `Spam-Email` milik Anda.

**Selesai!** 
Hugging Face akan otomatis menarik repositori Anda, membaca `Dockerfile`, dan membangun servernya. Proses *build* pertama kali membutuhkan waktu sekitar 2-5 menit. Setelah selesai, aplikasi Anda akan berstatus **Running** dan bisa diakses secara publik selamanya!
