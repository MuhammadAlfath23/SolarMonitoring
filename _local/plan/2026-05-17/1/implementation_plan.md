# Rencana Implementasi: Sistem Monitoring Panel Surya

Dokumen ini merangkum rencana arsitektur dan langkah-langkah implementasi untuk membangun backend, mengintegrasikannya dengan aplikasi React Native (`SolarMonitoringApp`), dan mendeploy keseluruhannya ke VPS BiznetGio menggunakan database PostgreSQL.

## 💬 Wawancara & Pertanyaan Terbuka (Open Questions)

> [!IMPORTANT]
> **Mohon luangkan waktu untuk menjawab pertanyaan-pertanyaan ini agar saya dapat menyesuaikan kode backend dengan kebutuhan spesifik Anda:**

1. **Bahasa Pemrograman & Framework Backend:** Anda lebih nyaman atau ingin menggunakan bahasa/framework apa untuk backend API ini? *(Contoh: Node.js dengan Express/NestJS, Python dengan FastAPI/Flask, Golang, atau PHP/Laravel?)*
> Node.js
2. **Arsitektur Pengiriman LoRaWAN:** Bagaimana skema pasti pengiriman data dari ESP32 (Node) ke Backend? 
   - Apakah Anda menggunakan **LoRa Gateway** (bersama Network Server seperti ChirpStack / The Things Network) yang meneruskan data ke Backend via HTTP Webhook/MQTT? 
   - Atau ESP32 mengirim ke ESP32 lain (Receiver) yang terhubung ke PC/Server melalui serial/WiFi?
>saya menggunakan lora gateway. yang menereuskan data ke backend via hivemq
3. **Parameter Data Sensor:** Metrik apa saja persisnya yang dikirimkan oleh sensor di panel surya? *(Misal: Tegangan (V), Arus (A), Daya (W), Energi (kWh), Suhu Panel, dll).*
> tegangan, arus, daya, energi, dan sisa baterai
4. **Autentikasi (Sistem Login):** Apakah aplikasi React Native ini membutuhkan sistem Login (untuk banyak user yang memiliki alat masing-masing), atau aplikasi ini terbuka/hanya dipakai untuk Anda sendiri sebagai Admin tunggal?
> untuk orang yang akan menggunakan alat ini.
5. **Fitur Frontend (`SolarMonitoringApp`):** Selain melihat data real-time secara langsung, apakah Anda butuh fitur seperti:
   - Grafik riwayat harian/mingguan/bulanan?
> sudah ada
   - Push Notification jika tegangan baterai/panel drop?
> sudah ada
   - Export data ke Excel/CSV?
> sepertinya bisa.

---

## 🏗️ Proposed Changes (Rencana Arsitektur & Task)

Jika secara umum konsepnya disetujui, kita akan membagi pekerjaan ke dalam 3 area utama.

### 1. Pembuatan Backend (Folder Baru: `solar-backend`)
> nama backendnya SolarMonitoringBackend.
- **Setup Project:** Menginisialisasi proyek backend di root workspace (sejajar dengan folder `SolarMonitoringApp`).
- **Skema Database (PostgreSQL):**
  - Membuat skema/tabel untuk menampung riwayat data sensor berbasis waktu (Time-Series).
  - Membuat tabel perangkat/node untuk mendukung lebih dari 1 ESP32 di masa depan.
> tabelnya sudah saya buat di postgresql.
- **REST API / Webhook:**
  - Membuat endpoint (`POST /api/sensor-data`) yang siap menerima kiriman dari LoRaWAN.
  - Membuat endpoint (`GET /api/dashboard`) untuk ditarik (fetch) oleh React Native.
> sepertinya sudah, apa bisa tolong di cek.
### 2. Penyesuaian Frontend (`SolarMonitoringApp`)
- **Integrasi API:** Membuat service untuk memanggil data dari backend (menggantikan data *dummy* jika ada).
> iya tolong buatkan.
- **Desain UI/UX (Aesthetics):** Membangun UI Dashboard yang modern, responsif, dan memberikan *wow factor* (misalnya animasi transisi, *glassmorphism*, atau *dark mode* elegan).
> UInya sudah ada. tolong baca C:\SolarMonitoring\SolarMonitoringApp\src\screens
- **Grafik:** Menambahkan library charting (misal: `react-native-gifted-charts`) untuk memvisualisasikan data riwayat panel surya.

### 3. Persiapan Deployment (VPS BiznetGio)
- **Database:** Setup PostgreSQL di VPS dan konfigurasi *security*.
> database postgresql sudah ada tapi belum dimasukan ke vps biznetgo.
- **Backend:** Menjalankan backend menggunakan `pm2` (jika Node.js) atau Gunicorn (jika Python) atau menggunakan `Docker`.
> mau menggunakan docker.
- **Domain & SSL:** Konfigurasi Nginx sebagai Reverse Proxy agar backend API berjalan di HTTPS, sehingga aplikasi React Native dapat terhubung dengan aman.
> iyaa bisa. nanti tolong bantu implementasikan.

### 4. User request
buatkan API spesification untuk menstadarisasi request dan respons untuk frontend ke backend dan hivemq ke backend. Tanyakan secera spesific dan minta saya untuk melakukan verifikasi.

## 🧪 Verification Plan

- **Tes Backend Lokal:** Mengirimkan *mock payload* (data palsu menyerupai data dari LoRa) melalui Postman/cURL untuk memastikan data masuk ke PostgreSQL lokal.
> bisa. tolong bantu implementasikan.
- **Tes Frontend Lokal:** Menjalankan React Native Expo dan memastikan data dari backend lokal tampil di layar dan grafik.
> iya bisa. tolong bantu implementasikan.
- **Tes Production:** Setelah dideploy ke VPS BiznetGio, kita akan mencoba menembak API VPS dari aplikasi Expo Go Anda.
> iyaa bisa.
