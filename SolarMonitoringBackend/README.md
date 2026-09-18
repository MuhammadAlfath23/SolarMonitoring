# Solar Monitoring API (Backend)

Server backend Node.js (Express) untuk Solar Monitoring System. Sistem ini bertugas menerima data telemetri dari ESP32 menggunakan protokol MQTT (HiveMQ) dan menyediakannya ke aplikasi frontend (React Native) lewat REST API.

## Fitur Utama
- **REST API Endpoint**: Menyediakan data telemetri real-time dan data histori terpilah (hari ini, mingguan, bulanan).
- **Autentikasi JWT**: Endpoint terproteksi penuh menggunakan JWT (*Json Web Token*). Kredensial dibaca aman lewat `.env`.
- **HiveMQ MQTT Subscriber**: Terintegrasi langsung dengan broker HiveMQ di topic `solar/telemetry/#` untuk memproses payload sensor ESP32 secara real-time.
- **Prisma ORM & PostgreSQL**: Interaksi database tangguh dengan Prisma v5.22.
- **Logika Seeder (Database Fallback)**: Jika database PostgreSQL Anda sedang mati/kosong, backend akan otomatis menggunakan data Seeder tiruan agar aplikasi frontend tidak macet/crash.

## Persyaratan (Prerequisites)
- [Node.js](https://nodejs.org/) (versi 18.x atau lebih baru)
- [PostgreSQL](https://www.postgresql.org/) (jika ingin menyimpan data asli)
- Broker MQTT [HiveMQ](https://www.hivemq.com/) (jika ingin menerima sinyal ESP32)

## Panduan Instalasi (Getting Started)

Bagi pengembang baru yang baru saja mengkloning repositori ini, ikuti langkah-langkah di bawah untuk menjalankannya:

1. **Install Dependensi**
   Jalankan perintah berikut:
   ```bash
   npm install
   ```

2. **Konfigurasi Environment Variables**
   Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   Buka file `.env` baru tersebut, lalu sesuaikan isinya:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://user:password@localhost:5432/plts?schema=public"
   JWT_SECRET="masukkan_secret_jwt_anda"
   
   # Kredensial Login Utama untuk HP
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ```

3. **Inisialisasi Prisma Client**
   Jana Prisma Client lokal Anda:
   ```bash
   npx prisma generate
   ```

4. **Jalankan Server**
   Mulai backend dalam mode pengembangan:
   ```bash
   node index.js
   ```

## Endpoint API Utama
Semua endpoint berawalan `/api` dan membutuhkan header: `Authorization: Bearer <TOKEN>` (kecuali Login).

| Method | Endpoint | Fungsi |
| :--- | :--- | :--- |
| **POST** | `/api/auth/login` | Melakukan autentikasi dan mendapatkan JWT Token |
| **GET** | `/api/dashboard` | Mengambil status PLTS saat ini (Tegangan, Arus, Baterai, Status) |
| **GET** | `/api/history` | Mengambil data riwayat berdasarkan parameter `?period=daily/weekly/monthly` |

## Deployment dengan Docker
Untuk memudahkan deployment, Anda bisa menggunakan Docker-compose yang sudah terlampir:
```bash
docker-compose up -d --build
```
