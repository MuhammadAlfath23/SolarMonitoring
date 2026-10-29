# Solar Monitoring PLTS

Sistem monitoring Pembangkit Listrik Tenaga Surya (PLTS) yang terdiri dari aplikasi mobile, REST API, database PostgreSQL, penerima telemetri MQTT, dan utilitas administrasi database. ESP32 mengirimkan data melalui broker MQTT; backend menyimpan pembacaan dan menyediakannya ke aplikasi.

> **Catatan:** README ini adalah panduan setup dan operasional untuk pengembang. Bagian troubleshooting bukan berarti aplikasi tidak berjalan; bagian tersebut membantu jika aplikasi dijalankan di lingkungan atau konfigurasi yang berbeda.

## Daftar Isi

- [Gambaran Sistem](#gambaran-sistem)
- [Fitur](#fitur)
- [Struktur Repositori](#struktur-repositori)
- [Persyaratan](#persyaratan)
- [Menjalankan Backend](#menjalankan-backend)
- [Menjalankan Aplikasi Mobile](#menjalankan-aplikasi-mobile)
- [Menggunakan Database Tool](#menggunakan-database-tool)
- [Kontrak API](#kontrak-api)
- [Format Telemetri MQTT](#format-telemetri-mqtt)
- [Model Data](#model-data)
- [Jika Mengalami Kendala](#jika-mengalami-kendala)

## Gambaran Sistem

```text
ESP32
  │ telemetri MQTT
  ▼
Broker MQTT ──► Backend Express ──► PostgreSQL
                    ▲                  │
                    │ REST/JSON         │ Prisma
                    ▼                  │
             Aplikasi Expo ◄───────────┘

Database Tool (Python) ──► PostgreSQL
```

Komponen:

1. **Aplikasi mobile** — React Native dan Expo untuk login, dashboard, grafik riwayat, serta notifikasi kondisi PLTS.
2. **Backend API** — Express.js menyediakan endpoint autentikasi dan data. Backend juga berlangganan topic MQTT.
3. **Database** — PostgreSQL dengan Prisma ORM. Pembacaan terbaru disimpan terpisah dari tabel riwayat.
4. **Database Tool** — CLI Python untuk mengecek koneksi, membaca skema, menjalankan query, mengekspor data, dan membuat backup SQL.

## Fitur

- Login menggunakan token JWT.
- Dashboard berisi tegangan, arus, daya, status normal, dan waktu pembaruan.
- Riwayat pembacaan dengan rentang harian, 7 hari, atau 30 hari.
- Notifikasi di aplikasi berdasarkan nilai tegangan dan daya.
- Penerimaan data MQTT dalam format JSON; backend juga memiliki jalur parsing CSV.
- Eksplorasi, query, ekspor CSV/JSON, dan backup database melalui CLI.

## Struktur Repositori

```text
SolarMonitoring/
├── SolarMonitoringApp/       # React Native + Expo
│   ├── src/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── contexts/
│   │   ├── navigation/
│   │   ├── screens/
│   │   ├── services/
│   │   └── utils/
│   ├── app.js
│   └── package.json
├── SolarMonitoringBackend/   # Express + Prisma + MQTT
│   ├── config/
│   ├── prisma/
│   ├── routes/
│   ├── services/
│   ├── index.js
│   └── package.json
└── PltsDatabaseTool/         # Utilitas database berbasis Python
    ├── db_tool.py
    ├── exports/
    └── requirements.txt
```

Setiap komponen memiliki dependensi dan konfigurasi sendiri. Jalankan perintah dari direktori komponen yang disebutkan, bukan dari root repositori.

## Persyaratan

- Node.js 18 atau lebih baru dan npm.
- PostgreSQL yang dapat diakses dari backend dan/atau database tool.
- Python 3.6 atau lebih baru untuk database tool.
- `pg_dump` yang cocok dengan instalasi PostgreSQL untuk fitur backup.
- Broker MQTT dan kredensialnya jika menggunakan data langsung dari perangkat.
- Expo Go untuk menjalankan aplikasi di perangkat; Android Studio untuk build Android lokal. Build iOS lokal membutuhkan macOS dan Xcode.

## Menjalankan Backend

### 1. Instal dependensi

```powershell
cd SolarMonitoringBackend
npm install
```

### 2. Buat konfigurasi `.env`

Backend belum menyediakan `.env.example`. Buat file `.env` di direktori `SolarMonitoringBackend` dan isi dengan konfigurasi lingkungan Anda:

```env
PORT=5000
DATABASE_URL="postgresql://DB_USER:DB_PASSWORD@localhost:5432/plts?schema=public"
JWT_SECRET="GANTI_DENGAN_SECRET_RANDOM_YANG_PANJANG"

# Opsional: konfigurasi broker MQTT
MQTT_BROKER_URL="mqtts://BROKER_HOST:8883"
MQTT_USERNAME="MQTT_USER"
MQTT_PASSWORD="MQTT_PASSWORD"
MQTT_TOPIC="solar/telemetry/#"
```

Sesuaikan host, port, nama database, dan kredensial. Jika broker tidak dikonfigurasi, kode memakai broker publik `mqtt://broker.hivemq.com` dan topic default `solar/telemetry/#`; untuk penggunaan nyata, gunakan broker yang Anda kelola dan konfigurasi kredensialnya.

**Catatan konfigurasi MQTT:** saat ini `index.js` memuat modul MQTT sebelum memanggil `dotenv.config()`, sedangkan URL dan topic dibaca saat modul MQTT dimuat. Akibatnya, nilai MQTT yang hanya disimpan di `.env` mungkin tidak dipakai. Untuk sementara, sediakan variabel MQTT di environment proses sebelum menjalankan backend atau perbaiki urutan pemuatan konfigurasi.

### 3. Siapkan PostgreSQL dan skema

Buat database PostgreSQL yang sesuai dengan `DATABASE_URL`, lalu dari direktori backend jalankan:

```powershell
npx prisma generate
npx prisma db push
```

`prisma db push` menyelaraskan database dengan model di `prisma/schema.prisma`. Tinjau perubahan skema sebelum menjalankannya pada database yang sudah berisi data penting.

### 4. Buat akun pengguna

Backend tidak membuat akun admin otomatis dan route registrasi belum tersedia di API. Endpoint login mencari pengguna pada tabel `users`, sehingga akun aktif dengan `password_hash` bcrypt harus sudah tersedia di database sebelum login dapat digunakan. Jangan menyimpan password biasa di kolom hash.

### 5. Jalankan API

```powershell
node index.js
```

Server berjalan pada port `5000` secara default (atau nilai `PORT`) dan menginisialisasi subscriber MQTT ketika server mulai. Cek server melalui `GET http://localhost:5000/`.

> `package.json` backend belum mendefinisikan script `start`, meskipun Dockerfile menjalankan `npm start`. Jalankan `node index.js` secara lokal. Konfigurasi Docker yang ada perlu diselaraskan sebelum digunakan untuk deployment.

## Menjalankan Aplikasi Mobile

### 1. Instal dependensi

```powershell
cd SolarMonitoringApp
npm install
```

### 2. Konfigurasikan alamat API

Salin `.env.example` menjadi `.env`, lalu atur alamat backend yang dapat dijangkau dari perangkat:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:5000
EXPO_PUBLIC_REFRESH_INTERVAL=5000
EXPO_PUBLIC_CRITICAL_VOLTAGE_THRESHOLD=10
EXPO_PUBLIC_WARNING_VOLTAGE_THRESHOLD=12
EXPO_PUBLIC_NO_POWER_HOURS=24
EXPO_PUBLIC_DEBUG=false
```

Ganti alamat contoh dengan IP komputer di jaringan lokal atau domain server Anda. Ponsel dan komputer harus dapat saling menjangkau; `localhost` pada ponsel menunjuk ke ponsel itu sendiri, bukan komputer yang menjalankan backend.

**Penting:** `EXPO_PUBLIC_API_URL` digunakan oleh sebagian besar request aplikasi, tetapi request login di `src/services/api.js` saat ini menggunakan alamat backend yang ditulis langsung di kode. Jika alamat tersebut berbeda dari backend Anda, ubah URL login agar menggunakan konfigurasi API yang sama. Selain itu, file `.env.example` saat ini memakai nama threshold yang tidak seluruhnya sama dengan nama yang dibaca aplikasi; gunakan nama `CRITICAL_VOLTAGE_THRESHOLD` dan `WARNING_VOLTAGE_THRESHOLD` seperti contoh di atas.

Variabel yang dibaca konfigurasi aplikasi:

| Variabel | Fungsi | Default |
|---|---|---:|
| `EXPO_PUBLIC_API_URL` | Base URL untuk request API yang memakai konfigurasi | Nilai bawaan pada konfigurasi aplikasi |
| `EXPO_PUBLIC_REFRESH_INTERVAL` | Interval refresh (milidetik) | `5000` |
| `EXPO_PUBLIC_CRITICAL_VOLTAGE_THRESHOLD` | Batas tegangan kritis untuk notifikasi | `10` V |
| `EXPO_PUBLIC_WARNING_VOLTAGE_THRESHOLD` | Batas tegangan peringatan | `12` V |
| `EXPO_PUBLIC_NO_POWER_HOURS` | Durasi tanpa daya sebelum peringatan | `24` jam |
| `EXPO_PUBLIC_DEBUG` | Aktifkan elemen debug jika bernilai `true` | `false` |

Nilai dengan awalan `EXPO_PUBLIC_` dimasukkan ke aplikasi client dan bukan tempat untuk menyimpan secret.

### 3. Mulai Expo

```powershell
npm start
```

Pindai QR code dengan Expo Go. Untuk menjalankan target tertentu:

```powershell
npm run android
npm run ios
npm run web
```

Perintah Android/iOS dapat memerlukan SDK dan toolchain native yang sesuai.

## Menggunakan Database Tool

Tool ini berinteraksi langsung dengan PostgreSQL dan tidak harus dijalankan dari folder backend.

### 1. Siapkan Python environment

```powershell
cd PltsDatabaseTool
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Jika PowerShell menolak aktivasi virtual environment, gunakan interpreter langsung:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 2. Buat `.env`

Salin `.env.example` ke `.env`, lalu sesuaikan nilainya:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=plts
DB_USER=postgres
DB_PASSWORD=GANTI_DENGAN_PASSWORD_DATABASE
PG_DUMP_PATH=C:\Program Files\PostgreSQL\17\bin\pg_dump.exe
```

Ubah `PG_DUMP_PATH` sesuai versi dan lokasi PostgreSQL pada komputer Anda. File ini berbeda dari `.env` backend; konfigurasi koneksi kedua komponen harus diatur secara terpisah.

### 3. Jalankan tool

```powershell
python db_tool.py
```

Menu interaktif menyediakan:

1. Tes koneksi dan informasi server.
2. Eksplorasi tabel, kolom, dan primary key.
3. Menjalankan query SQL; hasil query dapat diekspor sebagai CSV atau JSON.
4. Mengekspor seluruh isi sebuah tabel ke CSV atau JSON.
5. Membuat backup plain SQL menggunakan `pg_dump`.
6. Keluar.

Hasil ekspor dan backup ditulis ke `PltsDatabaseTool/exports/`. Karena menu query menerima SQL dan dapat melakukan perubahan data, jalankan hanya query yang dipahami dan batasi akses tool ke operator yang berwenang.

## Kontrak API

Semua endpoint data di bawah ini membutuhkan header:

```http
Authorization: Bearer <JWT>
```

Token dikeluarkan saat login dan berlaku selama 7 hari.

| Method | Endpoint | Autentikasi | Keterangan |
|---|---|---|---|
| `GET` | `/` | Tidak | Health check sederhana. |
| `POST` | `/api/auth/login` | Tidak | Login; menerima `username` dan `password`, mengembalikan token. |
| `GET` | `/api/dashboard` | Ya | Data pembacaan terbaru. |
| `GET` | `/api/history?period=daily` | Ya | Riwayat sejak awal hari. |
| `GET` | `/api/history?period=weekly` | Ya | Riwayat 7 hari terakhir. |
| `GET` | `/api/history?period=monthly` | Ya | Riwayat 30 hari terakhir. |

Alias nilai `period` yang diterima: `today` untuk harian, `7d` untuk mingguan, dan `30d` untuk bulanan. Nilai yang tidak dikenali kembali menggunakan rentang harian.

Contoh login:

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "nama-pengguna",
  "password": "password"
}
```

Respons sukses berisi `status: "success"` dan `token`. Dashboard mengembalikan objek `data` yang memuat `voltage`, `current`, `power`, `battery`, `source`, `isNormal`, dan `lastUpdated`. Riwayat mengembalikan array `data` yang setiap item-nya memakai field `time`, `voltage`, `current`, `power`, `battery`, dan `isNormal`, serta metadata `count`, `period`, dan `startDate`.

> Route `/api/auth/register` dan `/api/auth/me` belum tersedia di backend saat ini walaupun fungsi request terkait masih ada di sisi aplikasi.

## Format Telemetri MQTT

Backend berlangganan topic dari `MQTT_TOPIC`. Untuk payload JSON, field yang dipakai adalah:

```json
{
  "voltage": 13.2,
  "current": 1.45,
  "power": 19.14,
  "battery": 85
}
```

`power` dapat dihilangkan; backend akan menghitungnya dari tegangan dikali arus. Nilai tegangan, arus, dan daya diproses sebagai nilai absolut. `battery` dibatasi ke rentang 0–100. Backend menetapkan `isNormal` berdasarkan tegangan **lebih dari 12 V**, lalu menyimpan pesan ke `plts_history` dan memperbarui `plts_current`.

Format CSV juga dicoba oleh parser jika JSON tidak valid, tetapi skema CSV perangkat harus mengikuti implementasi parser di `SolarMonitoringBackend/services/mqttHandler.js`.

## Model Data

Skema utama berada di `SolarMonitoringBackend/prisma/schema.prisma`.

- `plts_current` — nilai terkini; backend melakukan upsert pada record dengan `id = 1`.
- `plts_history` — pembacaan historis dan timestamp.
- `users` — akun dan hash password.
- `login_logs` — catatan percobaan login.
- `plts_notifications` — struktur penyimpanan notifikasi.
- `notification_type` — enum `normal`, `warning`, `danger`, dan `info`.

## Jika Mengalami Kendala

Bagian ini hanya referensi jika suatu saat aplikasi dijalankan di lingkungan baru atau muncul masalah. Jika setup yang Anda gunakan sekarang sudah berjalan, Anda tidak perlu mengubah konfigurasi hanya karena membaca daftar ini.

- **Aplikasi tidak dapat tersambung ke API:** pastikan backend hidup, port dapat diakses, firewall mengizinkan koneksi, dan ponsel memakai IP komputer yang benar. Periksa juga URL login yang saat ini ditulis langsung pada kode aplikasi.
- **Login gagal:** pastikan record pengguna aktif tersedia dan password diverifikasi terhadap hash bcrypt. Backend tidak menyediakan akun demo atau proses registrasi otomatis.
- **Dashboard menampilkan nol atau data uji:** jika tidak ada record terkini, backend mengembalikan nilai kosong; jika query database melempar error, route dashboard dapat mengembalikan data dummy. Lihat log backend untuk membedakan kondisi tersebut.
- **Riwayat kosong:** periksa apakah pesan MQTT berhasil disimpan dan apakah waktu data masuk dalam rentang yang dipilih.
- **Tidak menerima MQTT:** periksa `MQTT_BROKER_URL`, kredensial, topic, konektivitas jaringan, dan format payload. Lihat log dengan awalan `[MQTT]`.
- **Backup gagal:** pastikan PostgreSQL client tools terpasang dan `PG_DUMP_PATH` menunjuk ke `pg_dump.exe` yang valid.
- **Perintah Docker gagal menjalankan backend:** Dockerfile menjalankan `npm start`, sedangkan package backend belum memiliki script tersebut. Gunakan `node index.js` atau sesuaikan konfigurasi Docker secara terpisah.
