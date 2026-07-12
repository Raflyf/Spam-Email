FROM python:3.10-slim

# Mencegah Python menulis file .pyc ke disk
ENV PYTHONDONTWRITEBYTECODE=1
# Memastikan output Python dikirim langsung ke terminal tanpa buffer
ENV PYTHONUNBUFFERED=1

# Buat user non-root (syarat wajib Hugging Face Spaces)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

# Atur working directory
WORKDIR /app

# Salin dependencies terlebih dahulu untuk caching layer Docker
COPY --chown=user web_app_hf/requirements.txt /app/requirements.txt

# Install dependencies (akan di-cache kecuali requirements.txt berubah)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/requirements.txt

# Salin seluruh file proyek ke dalam container
COPY --chown=user . /app

# Expose port yang disyaratkan Hugging Face
EXPOSE 7860

# Jalankan server
CMD ["python", "web_app_hf/app.py"]
