# Walkthrough: Pembuatan Backend & Integrasi Frontend

Saya telah selesai mengimplementasikan backend Node.js dan mengintegrasikannya dengan React Native serta database PostgreSQL Anda sesuai dengan rencana.

## 🛠️ Apa Saja yang Telah Dilakukan?

1. **Membuat Struktur Backend (`SolarMonitoringBackend`)**
   - Menginisialisasi proyek Node.js dengan framework **Express.js**.
   - Mengintegrasikan **Prisma ORM** dan menarik skema langsung dari PostgreSQL Anda (tabel `plts_current`, `plts_history`, dan `plts_notifications`).
   - Membuat *middleware* autentikasi menggunakan **JWT**.

2. **Membuat REST API Endpoints**
   - `POST /api/auth/login`: Endpoint *hardcoded* (admin/admin123) sementara untuk menghasilkan *Bearer token*.
   - `GET /api/dashboard`: Menarik data paling terbaru dari tabel `plts_current`.
   - `GET /api/history?period=daily`: Menarik data seri dari `plts_history` untuk keperluan *charting* di React Native.

3. **Membuat MQTT Subscriber (HiveMQ)**
   - Saya telah membuat berkas `services/mqttHandler.js` yang akan melakukan *subscribe* ke topik `solar/telemetry/#` di `broker.hivemq.com`.
   - Saat backend menyala, ia akan menangkap data LoRa dari ESP32 (dalam format JSON sesuai kesepakatan) dan menyimpannya secara otomatis ke database (tabel `plts_history` & meng-*update* `plts_current`).

4. **Menyiapkan Deployment (VPS BiznetGio)**
   - Membuat `Dockerfile` dan `docker-compose.yml` di dalam folder backend. Ini akan sangat memudahkan Anda untuk mendeploy keseluruhan backend ke VPS BiznetGio hanya dengan 1 baris perintah (`docker-compose up -d`).

5. **Mengintegrasikan Frontend (`SolarMonitoringApp`)**
   - Memodifikasi file `src/services/api.js` pada aplikasi React Native.
   - Menambahkan mekanisme **auto-login** sehingga aplikasi otomatis mendapatkan `JWT Token` sebelum menarik data dari `/api/dashboard` dan `/api/history`.

## 🚀 Cara Menjalankan untuk Testing (Lokal)

### Menjalankan Backend
Buka terminal baru, dan jalankan perintah berikut:
```bash
cd SolarMonitoringBackend
node index.js
```
*(Pastikan PostgreSQL Anda menyala dan kredensial di file `.env` dalam folder backend sudah tepat).*

### Menjalankan Frontend
Jalankan aplikasi React Native Anda seperti biasa:
```bash
cd SolarMonitoringApp
npm start
```
Sekarang, grafik dan angka di aplikasi React Native akan menampilkan data yang ditarik langsung dari tabel `plts_current` dan `plts_history` di database Anda!

> [!TIP]
> **Selanjutnya (Next Steps)**
> Anda sekarang sudah bisa mengunggah folder `SolarMonitoringBackend` ke VPS BiznetGio Anda dan menjalankan `docker-compose up -d --build`. 
> Jangan lupa pada `.env` di aplikasi React Native (`SolarMonitoringApp`), sesuaikan `EXPO_PUBLIC_API_URL` dengan alamat IP/domain dari VPS BiznetGio Anda.
