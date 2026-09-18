# Implementasi Sistem Login Aplikasi Frontend (React Native)

Rencana ini bertujuan untuk membangun sistem autentikasi pada aplikasi frontend `SolarMonitoringApp`. Fitur ini akan memastikan pengguna harus melakukan *login* dengan kredensial yang valid sebelum bisa mengakses dashboard dan fitur lainnya.

## User Review Required

> [!IMPORTANT]
> - Saya akan menginstal dua package baru: `@react-native-async-storage/async-storage` (untuk menyimpan token login agar tetap awet ketika aplikasi ditutup) dan `@react-navigation/native-stack` (untuk membuat navigasi perpindahan layar dari Login ke Dashboard).
> - Untuk saat ini, kredensial yang akan digunakan tetap sama dengan _backend_ yaitu: **Username:** `admin` | **Password:** `admin123`.

## Open Questions

> [!NOTE]
> Dimanakah Anda ingin meletakkan **tombol Logout**? Untuk sementara, saya akan menempatkannya di layar **Debug**, namun jika Anda ingin dibuatkan layar "Profil" khusus atau ditaruh di layar "Dashboard", tolong beritahu saya.
> buat screen baru profile dan settings dan letakkan button log out di screen profile.

## Proposed Changes

---

### Navigation & State (Context)

Saya akan membuat sistem *Global State* menggunakan React Context untuk melacak apakah pengguna sedang *login* atau tidak, dan mengatur navigasi secara dinamis.

#### [NEW] `src/contexts/AuthContext.js`
- Membuat `AuthProvider` yang membaca token dari `AsyncStorage` pada saat aplikasi pertama kali dimuat (*boot*).
- Menyediakan fungsi `login()` dan `logout()` yang dapat dipanggil dari mana saja.

#### [MODIFY] `src/navigation/AppNavigator.js`
- Mengubah navigasi agar menggunakan **Stack Navigator** di level teratas.
> ini maksudnya apa ya?
- Mengimplementasikan logika kondisional: Jika token ada, tampilkan *Bottom Tab Navigator* (Dashboard, dkk). Jika tidak ada, tampilkan layar *Login*.
> iya
#### [MODIFY] `App.js`
- Membungkus seluruh aplikasi dengan `<AuthProvider>`.

---

### Screens

#### [NEW] `src/screens/LoginScreen.js`
- Membuat antarmuka pengguna (UI) yang menarik dengan logo/judul aplikasi.
- Menyediakan form input `Username` dan `Password`.
- Menyediakan tombol "Masuk" yang akan memanggil fungsi API.
- Menampilkan pesan error jika login gagal.

#### [MODIFY] `src/screens/DebugScreen.js`
- Menambahkan **Tombol Keluar (Logout)** di dalam menu Debug.
> bukan menu debug, tapi di menu profile. menu debug hanya sementara buat test aja. 
---

### API Services

#### [MODIFY] `src/services/api.js`
- Menghapus `ensureToken()` statis dari memori. Token kini akan di-*inject* secara langsung dari `AuthContext` setiap kali melakukan *fetch* data.
- Menambahkan fungsi khusus `loginUser(username, password)` yang hanya melakukan *hit* ke endpoint `/api/auth/login` untuk mendapatkan token.

## Verification Plan

### Manual Verification
1. Me-*restart* server Expo.
2. Membuka aplikasi di HP (seharusnya aplikasi langsung memunculkan halaman **Login**).
3. Mencoba _login_ menggunakan kredensial salah (harus ditolak).
4. Mencoba _login_ menggunakan `admin` dan `admin123` (harus berhasil masuk ke Dashboard).
5. Keluar dari aplikasi (di HP), lalu masuk kembali (seharusnya langsung masuk ke Dashboard tanpa login ulang).
6. Menekan tombol Logout di layar Debug (seharusnya langsung ditendang kembali ke halaman Login).
