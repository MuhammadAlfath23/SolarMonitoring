# Integrasi Tabel `users` Database untuk Autentikasi Login

Rencana ini bertujuan untuk memodifikasi sistem *login* backend agar membaca kredensial pengguna langsung dari tabel `users` di PostgreSQL, menggantikan sistem yang membaca dari file `.env`.

## User Review Required

> [!WARNING]
> Karena kita akan menggunakan tabel `users`, password yang ada di dalam database **harus berupa hash** (menggunakan `bcrypt`). 
> Jika baris data pengguna (1 baris) yang saat ini ada di database Anda masih menggunakan *password plain text* (teks biasa tanpa di-hash), maka Anda **tidak akan bisa login** karena fungsi `bcrypt.compare` akan menolaknya.
> **Apakah password di database Anda sudah di-hash menggunakan bcrypt?** Jika belum, tolong beritahu saya agar saya bisa membuatkan *script* otomatis untuk meng-hash password Anda saat ini.

## Proposed Changes

### Backend Route (`routes/auth.js`)

#### [MODIFY] [auth.js](file:///c:/SolarMonitoring/SolarMonitoringBackend/routes/auth.js)
1. Menghapus logika lama yang membaca `process.env.ADMIN_USERNAME` dan `process.env.ADMIN_PASSWORD`.
2. Menggunakan Prisma untuk mencari pengguna: `await prisma.users.findUnique({ where: { username } })`.
3. Menggunakan `bcryptjs` untuk membandingkan password yang dikirim dari HP dengan `password_hash` di database.
4. Jika login berhasil:
   - Membuat JWT token.
   - Meng-update kolom `last_login_at` pada tabel `users`.
   - Mencatat aktivitas sukses ke tabel `login_logs`.
5. Jika login gagal:
   - Mencatat aktivitas gagal ke tabel `login_logs`.
   - Mengembalikan response error 401.

## Verification Plan

### Manual Verification
1. Menjalankan ulang server backend (`node index.js`).
2. Melakukan percobaan login dari aplikasi HP.
3. Mengecek database (khususnya tabel `login_logs` dan `last_login_at` di tabel `users`) apakah aktivitas login sudah terekam dengan benar.
