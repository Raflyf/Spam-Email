---
name: Spam Email Classifier Design System
description: Premium, academic, and data-centric visual language for machine learning evaluation.
colors:
  primary: "#fafafa"
  neutral-bg: "oklch(14% 0.02 285)"
  card-bg: "oklch(18% 0.025 285 / 0.5)"
  border: "oklch(28% 0.04 285 / 0.5)"
  success: "#10b981"
  danger: "#ef4444"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.4rem, 4vw, 2.5rem)"
    fontWeight: 800
    lineHeight: 1.2
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "15px"
    lineHeight: 1.5
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "14px"
rounded:
  sm: "4px"
  md: "0.5rem"
  lg: "12px"
  full: "9999px"
---

# Design System: Spam Email Classifier

## 1. Overview

**Creative North Star: "The Academic Lab Notebook"**

Visual system ini dirancang untuk menghadirkan antarmuka akademis tingkat lanjut yang profesional, bersih, dan berorientasi pada data. Menghindari "AI slop" dekoratif yang berlebihan, sistem ini mengutamakan keterbacaan data evaluasi algoritma Naive Bayes dan XGBoost. Karakteristik utama berpusat pada kegunaan (utility), presisi tinggi, dan konsistensi status antarmuka.

**Key Characteristics:**
- **Zinc & Space-tinted Palette:** Menggunakan kombinasi warna gelap zinc dengan sedikit tint indigo hangat untuk mengurangi kelelahan mata dosen penguji.
- **Data-First Layout:** Hirarki visual yang menempatkan metrik performa (Akurasi, F1-Score) dan tabel Confusion Matrix di atas segalanya.
- **Glass & Depth Details:** Penggunaan taktil minimal (blurs, inset border glow) untuk menciptakan kesan kedalaman yang terstruktur tanpa ornamen dekoratif yang berlebihan.

## 2. Colors

Sistem ini didominasi oleh palet warna gelap netral dengan aksen semantik yang tegas untuk menandai kelas e-mail (Spam vs Non-Spam).

### Primary
- **Zinc White** (#fafafa / #09090b di Light Mode): Digunakan sebagai teks utama dan warna tombol primer.

### Neutral
- **Midnight Space** (oklch(14% 0.02 285)): Warna latar belakang utama aplikasi.
- **Dark Sapphire Card** (oklch(18% 0.025 285 / 0.5)): Latar belakang kartu/kontainer semi-transparan dengan efek blur.
- **Muted Steel** (oklch(28% 0.04 285 / 0.5)): Warna garis batas (border) antar komponen.

### Semantic Accents
- **Emerald Green** (#10b981): Melambangkan kelas Non-Spam (Ham), True Positive, dan metrik yang sukses.
- **Coral Red** (#ef4444): Melambangkan kelas Spam, False Positive, dan tanda bahaya/eror.

### Named Rules
**The Accent-Rarity Rule.** Warna aksen semantik hijau dan merah hanya boleh digunakan untuk data yang relevan dengan klasifikasi. Warna dekoratif lainnya harus dihindari agar tidak mendistraksi pembacaan data skripsi.

## 3. Typography

**Display Font:** Archivo
**Body Font:** Archivo
**Label/Mono Font:** JetBrains Mono

**Character:** Tipografi yang tegas, berat pada heading untuk memberikan kesan terstruktur dan akademis yang kuat, serta font monospace yang presisi untuk visualisasi data/metrik.

### Hierarchy
- **Display** (800, clamp(1.4rem, 4vw, 2.5rem), 1.2): Judul utama aplikasi.
- **Headline** (700, 18px, 1.3): Judul section utama pada kartu.
- **Title** (600, 15px, 1.4): Judul kolom tabel atau label input.
- **Body** (400, 15px, 1.5): Teks penjelasan, keterangan mode, dan detail prose.
- **Label / Mono** (400, 14px, 1): Kode program, data mentah e-mail, dan angka-angka metrik pada tabel.

## 4. Elevation

Aplikasi ini menggunakan kombinasi kedalaman flat dan layered dengan efek kaca (*glassmorphism*) minimalis untuk mempertegas tumpukan kontainer.

### Shadow Vocabulary
- **Card Premium Shadow** (`0 20px 40px -10px oklch(0% 0 0 / 0.5), inset 0 1px 0 0 oklch(100% 0 0 / 0.05)`): Digunakan khusus pada kontainer kartu aktif untuk memisahkannya secara visual dari latar belakang polkadot gelap.

### Named Rules
**The Flat-By-Default Rule.** Semua komponen bersifat flat dan sejajar secara visual saat diam. Ketinggian (elevation) dan bayangan hanya dipicu oleh status interaksi seperti melayang (*hover*) atau fokus.

## 5. Components

### Buttons
- **Shape:** Round-pill (`border-radius: 999px` untuk tombol aksi, `border-radius: 0.5rem` untuk tombol tab).
- **Primary:** Latar belakang Zinc White dengan teks gelap. Transisi 400ms pegas (`cubic-bezier(0.175, 0.885, 0.32, 1.275)`), membesar sedikit saat melayang dan mengecil saat ditekan (`active: scale(0.96)`).

### Cards
- **Shape:** Rounded-medium (`border-radius: 0.5rem`).
- **Style:** Latar belakang semi-transparan dengan efek blur `backdrop-filter: blur(20px)`, border tipis `Muted Steel`, dan bayangan bersusun.

## 6. Do's and Don'ts

### Do's
- Gunakan `JetBrains Mono` untuk semua visualisasi angka metrik akurasi agar mudah dibandingkan secara vertikal.
- Berikan efek transisi lembut pada setiap pergantian tab (Mode Teks <-> Mode CSV).
- Pastikan semua tombol aksi memiliki status disabled yang jelas saat proses evaluasi sedang berjalan.

### Don'ts
- Jangan menambahkan warna latar belakang yang terlalu mencolok pada tabel riwayat; biarkan transparan dengan border tipis.
- Jangan menggunakan ikon dekoratif yang tidak memiliki kaitan langsung dengan navigasi atau informasi data.
- Jangan menumpuk kartu di dalam kartu (*nested cards*).
