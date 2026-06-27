@echo off
cd /d "%~dp0"
echo ========================================================
echo   Memulai Aplikasi Klasifikasi Spam Email (Skripsi)
echo ========================================================
echo.

:: Cek apakah Python sudah terinstall
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python tidak terdeteksi di laptop ini!
    echo Silakan install Python terlebih dahulu dari https://www.python.org/downloads/
    echo Pastikan Anda mencentang opsi "Add Python to PATH" saat proses instalasi.
    pause
    exit /b
)

echo [OK] Python terdeteksi.

:: Cek apakah virtual environment sudah ada
if not exist ".venv\Scripts\activate.bat" (
    echo [INFO] Membangun Virtual Environment baru untuk laptop ini...
    python -m venv .venv
    echo [INFO] Menginstal library pendukung - butuh koneksi internet...
    call .venv\Scripts\activate
    pip install -r web_app\requirements.txt
) else (
    echo [OK] Virtual Environment sudah tersedia.
    call .venv\Scripts\activate
)

:: Pindah ke folder web_app dan jalankan server
cd web_app

echo.
echo [INFO] Menjalankan Server Localhost...
echo Silakan buka http://127.0.0.1:5000 di browser Anda.
echo Biarkan jendela hitam ini tetap terbuka selama Anda menggunakan aplikasi.
echo ========================================================
echo.

python app.py
pause
