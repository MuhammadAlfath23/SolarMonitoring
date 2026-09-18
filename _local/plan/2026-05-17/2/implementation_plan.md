# Rencana Implementasi: Sistem Monitoring Panel Surya (Terbaru)

Dokumen ini adalah revisi dari rencana arsitektur dan langkah-langkah implementasi untuk membangun backend (`SolarMonitoringBackend`), berdasarkan jawaban wawancara Anda.

## 📌 Ringkasan Kebutuhan Berdasarkan Wawancara
- **Backend:** Node.js (Kita akan menggunakan **Express.js** agar ringan dan cepat).
- **LoRa Architecture:** LoRa Gateway -> HiveMQ (MQTT) -> Backend Node.js.
- **Sensor Metrics:** Tegangan (V), Arus (A), Daya (W), Energi (kWh/Wh), dan Sisa Baterai (%).
- **Autentikasi:** Diperlukan sistem login untuk pengguna alat.
- **Frontend App:** UI/UX, Chart riwayat, dan notifikasi sudah ada. Perlu diintegrasikan ke API sungguhan.
- **Deployment:** Database sudah ada di PostgreSQL, backend akan di-*dockerize* dan di-deploy ke VPS BiznetGio menggunakan Nginx (HTTPS).

---

## 🔌 API Specification (Spesifikasi API) - HARAP VERIFIKASI

> [!WARNING]
> **User Review Required:** Mohon tinjau skema pengiriman data di bawah ini. Apakah format JSON ini sudah sesuai dengan yang dikirimkan oleh payload ESP32/LoRa Gateway Anda, dan sudah sesuai dengan yang diharapkan UI Frontend? 

### 1. HiveMQ (MQTT) ke Backend
Backend akan bertindak sebagai MQTT Client yang melakukan *subscribe* ke HiveMQ untuk menerima data secara *real-time*.

- **Topic yang akan di-subscribe:** `solar/telemetry/#` (Mohon konfirmasi topic apa yang Anda gunakan di HiveMQ?)
- **Format Payload (JSON) dari LoRa Gateway:**
  ```json
  {
    "device_id": "plts-esp32-01",
    "voltage": 13.5,     // float: Tegangan dalam Volt
    "current": 2.1,      // float: Arus dalam Ampere
    "power": 28.35,      // float: Daya dalam Watt
    "energy": 120.5,     // float: Energi (Wh/kWh)
    "battery": 85,       // integer: Persentase baterai 0-100
    "timestamp": "2026-05-17T12:00:00Z" // (Opsional, jika gateway mengirimkan waktu)
  }
  ```
  *(Jika format yang dikirimkan dari LoRa berbeda dengan ini, tolong beri tahu saya agar parser di backend disesuaikan).*

### 2. Frontend (`SolarMonitoringApp`) ke Backend (REST API)
Aplikasi React Native akan menembak REST API ini. Semua request butuh token JWT dari login (kecuali endpoint login).

**A. Authentication (Login)**
- **Endpoint:** `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
  ```

**B. Get Real-time Data Dashboard**
- **Endpoint:** `GET /api/dashboard`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "voltage": "13.5",
      "current": "2.10",
      "power": "28.35",
      "battery": 85,
      "energy": "120.5",
      "source": "Panel Surya",
      "isNormal": true,
      "lastUpdated": "2026-05-17T12:05:00Z"
    }
  }
  ```

**C. Get History (Untuk Grafik)**
- **Endpoint:** `GET /api/history?period=daily`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": [
      { "time": "08:00", "voltage": 12.1, "power": 25.0, "battery": 80 },
      { "time": "09:00", "voltage": 13.5, "power": 30.0, "battery": 85 }
    ]
  }
  ```

---

## 🏗️ Rencana Pengerjaan (Next Steps)

1. **Inisiasi Backend Node.js:** 
   - Saya akan membuat folder `SolarMonitoringBackend` dan menginisialisasi Express.js dengan Prisma/pg.
   - Menulis kode integrasi MQTT Client (menggunakan `mqtt` package) untuk membaca data dari HiveMQ dan men-insert ke database PostgreSQL Anda.
2. **Pengecekan Skema DB:** 
   - Anda menyebutkan tabel sudah dibuat di PostgreSQL. Nanti saya akan membutuhkan struktur kolom tabel Anda agar query backend bisa disesuaikan.
3. **Membangun REST API:** Membuat endpoint-endpoint di atas.
4. **Integrasi Frontend:** Memodifikasi `c:\SolarMonitoring\SolarMonitoringApp\src\services\api.js` untuk mengkonsumsi API yang baru kita buat.
5. **Dockerization:** Membuat `Dockerfile` dan `docker-compose.yml` di dalam backend untuk persiapan deployment.

## 💬 Pertanyaan Tambahan untuk Anda:
1. Apakah struktur JSON API Specification (untuk MQTT dan Frontend) di atas **sudah sesuai**? (Silakan direvisi jika ada penamaan *key* yang berbeda).
> ya untuk saat ini 
2. Apa nama topik (topic) MQTT yang Anda gunakan di HiveMQ?
> untuk saat ini belum ada.
3. Apakah saya boleh meminta struktur (nama kolom) dari tabel PostgreSQL yang sudah Anda buat, agar kodenya bisa langsung selaras? (Atau apakah kita akan menggunakan Prisma Introspection `npx prisma db pull` nantinya?)
> baca pake db_tool.py di folder PltsDatabaseTool 
