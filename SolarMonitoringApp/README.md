# Solar Monitoring App (Frontend)

Aplikasi monitoring panel surya berbasis React Native dan Expo. Aplikasi ini memantau parameter kelistrikan PLTS secara real-time dari ESP32 melalui backend server.

## Fitur Utama
- **Autentikasi Aman**: Dilengkapi dengan layar Login dan penyimpanan sesi (*session persistence*) menggunakan `AsyncStorage`. Anda tidak perlu login ulang saat membuka aplikasi.
- **Dashboard Real-time**: Menampilkan grafik dan data pengukuran kelistrikan (Tegangan, Arus, Daya, Kapasitas Baterai, Status Normal/Abnormal).
- **Notifikasi Pintar**: Auto-alert jika terjadi tegangan rendah, kapasitas baterai kritis, atau tidak ada daya masuk.
- **Riwayat Pengukuran**: Melihat rekaman data pengukuran dalam filter Hari Ini, 7 Hari, dan 30 Hari.
- **Mode Debugging Fleksibel**: Halaman debug rahasia untuk tes koneksi langsung ke backend yang dapat diaktifkan/dimatikan melalui file `.env`.

## Persyaratan (Prerequisites)
- [Node.js](https://nodejs.org/) (versi 18.x atau lebih baru disarankan)
- [npm](https://www.npmjs.com/) atau [Yarn](https://yarnpkg.com/)
- Aplikasi [Expo Go](https://expo.dev/client) di HP Anda (iOS / Android).

## Panduan Instalasi (Getting Started)

Bagi pengembang baru yang baru saja mengkloning repositori ini, ikuti langkah-langkah di bawah untuk menjalankannya:

1. **Install Dependensi**
   Jalankan npm untuk menginstal semua pustaka pendukung:
   ```bash
   npm install
   ```

2. **Konfigurasi Environment Variables**
   Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   *(Untuk pengguna Windows PowerShell, Anda bisa menyalinnya secara manual).*

   Buka file `.env` baru tersebut, lalu sesuaikan isinya:
   ```env
   # Ganti dengan alamat IP laptop/VPS Anda saat ini
   EXPO_PUBLIC_API_URL=http://192.168.18.10:5000
   
   # Aktifkan tab Debug dan kotak error merah (true / false)
   EXPO_PUBLIC_DEBUG=false
   ```

3. **Jalankan Server Pengembang**
   Mulai Metro Bundler Expo dengan perintah:
   ```bash
   npm start
   ```

4. **Menghubungkan HP**
   Buka aplikasi **Expo Go** di HP Anda, lalu pindai (*scan*) QR Code yang tercetak di layar terminal Anda. Pastikan laptop Anda dan HP berada di jaringan **Wi-Fi yang sama**.

## Akun Demo Default
Kredensial login bawaan saat pertama kali masuk ke aplikasi:
- **Username:** `admin`
- **Password:** `admin123`
