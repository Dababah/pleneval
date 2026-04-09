# 🚀 Tutorial Deployment PLEN. ke Server Produksi

Sesuai permintaan Anda, berikut adalah langkah-langkah komprehensif (*copy-paste ready*) untuk men-deploy **PLEN.** di server Anda. Karena Anda akan mengurus servernya sendiri, ikuti panduan ini secara berurutan.

> [!IMPORTANT]
> **Informasi Penting Deployment:**
> - **Aplikasi akan berjalan di lokal server pada Port:** `4049`
> - **Domain Akses Publik:** `https://plen.axcious.com/` (Pastikan Reverse Proxy / Nginx sudah diarahankan dari domain ini ke `localhost:4049`).

---

## 1. Persiapan Direktori & Clone Repositori

Pertama, kita siapkan folder `/DATA/AppData/Davin/` dan pastikan Anda memiliki akses (*ownership*) ke folder tersebut tanpa harus pakai `sudo` terus-terusan.

```bash
# Membuat direktori jika belum ada
sudo mkdir -p /DATA/AppData/Davin/

# Mengubah kepemilikan direktori ke user Anda saat ini
sudo chown -R $USER:$USER /DATA/AppData/Davin/

# Masuk ke direktori
cd /DATA/AppData/Davin/

# Clone repositori (Sesuaikan jika repositori private)
git clone https://github.com/Davinsry/plen.git plen

# Masuk ke folder proyek
cd plen

# (Opsional) Jika perubahan terakhir Anda ada di branch feat/rebrand-plen, pindah ke branch tersebut:
git checkout feat/rebrand-plen
```

---

## 2. Setup Database MariaDB

Kita akan membuat Database dan User khusus untuk PLEN demi alasan keamanan (jangan pakai user root di aplikasi).

Masuk ke terminal MariaDB/MySQL:
```bash
sudo mysql -u root -p
```

Setelah masuk, jalankan perintah SQL berikut satu per satu:

```sql
-- 1. Buat database
CREATE DATABASE plen_db;

-- 2. Buat user dan passwordnya
CREATE USER 'plen_admin'@'localhost' IDENTIFIED BY 'PlenSecurePass2026!';

-- 3. Berikan semua akses database plen_db ke user plen_admin
GRANT ALL PRIVILEGES ON plen_db.* TO 'plen_admin'@'localhost';

-- 4. Terapkan perubahan
FLUSH PRIVILEGES;

-- 5. Keluar dari terminal MariaDB
EXIT;
```

---

## 3. Konfigurasi Environment (`.env`)

Selanjutnya, kita perlu menyetel file konfigurasi environment agar sesuai dengan environment produksi dan database yang baru saja dibuat.

```bash
# Salin template environment
cp .env.example .env

# Edit file .env menggunakan editor teks pilihan Anda (misal: nano)
nano .env
```

**Sesuaikan isi `.env` menjadi seperti ini:**

```env
# Database Credentials (Sesuai dengan yang dibuat di Langkah 2)
DATABASE_URL="mysql://plen_admin:PlenSecurePass2026!@localhost:3306/plen_db"

# Domain & Ports
PORT=4049
NEXTAUTH_URL="https://plen.axcious.com"
AUTH_URL="https://plen.axcious.com"
AUTH_SECRET="masukkan_auth_secret_random_disini" # Ketik: npx auth secret di terminal lain untuk generate

# OAuth & Email & AI (Isi dengan kredensial asli Anda)
AUTH_GOOGLE_ID="id_google_anda"
AUTH_GOOGLE_SECRET="secret_google_anda"
AUTH_GITHUB_ID="id_github_anda"
AUTH_GITHUB_SECRET="secret_github_anda"
EMAIL_USER="email_smtp_anda"
EMAIL_PASS="password_app_smtp_anda"
GEMINI_API_KEY="api_key_gemini_anda"
```

---

## 4. Install Dependensi & Build Aplikasi

Karena proyek ini menggunakan `pnpm` (Sesuai aturan `AGENTS.md`), jalankan perintah berikut:

```bash
# 1. Install semua paket
pnpm install

# 2. Sinkronisasi Prisma dengan Database MariaDB dan buat tabel-tabelnya
npx prisma generate
npx prisma db push

# 3. Build aplikasi Next.js untuk produksi
pnpm build
```

---

## 5. Menjalankan Aplikasi Menggunakan PM2

File `ecosystem.config.js` sudah saya buatkan sebelumnya di dalam repositori. File ini sudah diset agar menjalankan aplikasi dengan nama **"plen"** dan pada **Port 4049**.

```bash
# Jalankan aplikasi menggunakan PM2
pm2 start ecosystem.config.js

# Agar PM2 jalan otomatis setiap server restart (Jika belum pernah diset)
pm2 save
pm2 startup
```

> [!WARNING]
> **Aturan Penting PM2:**
> 
> Jika Anda perlu merestart aplikasi PLEN, **SELALU GUNAKAN:**
> ```bash
> pm2 restart plen
> ```
> 
> ⛔ **JANGAN PERNAH MENGGUNAKAN `pm2 delete all`** karena itu akan mematikan semua layanan lain yang mungkin sedang berjalan di server Anda! Jika ingin menghentikan PLEN saja, gunakan `pm2 stop plen`.

---

## Selesai! 🎉
Aplikasi **PLEN.** sekarang sudah berjalan manis di server Anda di background pada Port `4049`. Pastikan SSL dan Reverse Proxy Nginx untuk `https://plen.axcious.com` mengarah ke `http://127.0.0.1:4049`.
