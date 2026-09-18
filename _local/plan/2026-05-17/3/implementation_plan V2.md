# Implementasi Sistem Login Aplikasi Frontend (React Native)

Rencana ini bertujuan untuk membangun sistem autentikasi pada aplikasi frontend `SolarMonitoringApp`. Fitur ini akan memastikan pengguna harus melakukan *login* dengan kredensial yang valid sebelum bisa mengakses dashboard dan fitur lainnya.

## Jawaban untuk Pertanyaan Anda
> **Pertanyaan Anda:** "Mengubah navigasi agar menggunakan Stack Navigator di level teratas. ini maksudnya apa ya?"
> 
> **Jawaban:** Saat ini, kerangka utama navigasi aplikasi Anda adalah *Bottom Tab Navigator* (menu bawah). Namun, halaman Login **tidak boleh** memiliki menu bawah karena pengguna belum masuk. Oleh karena itu, kita perlu menggunakan *Stack Navigator* sebagai pengatur utama (level teratas). *Stack Navigator* ini akan bertugas menyeleksi: 
> - Jika ada token -> Tampilkan *Bottom Tab Navigator* (Dashboard, dkk).
> - Jika tidak ada token -> Tampilkan halaman *Login* (layar penuh, tanpa menu bawah).

## User Review Required

> [!IMPORTANT]
> Silakan periksa kembali revisi rencana di bawah ini. Jika sudah sesuai, tolong berikan persetujuan (*Approve*) agar saya bisa langsung menulis kodenya.

## Proposed Changes

---

### Navigation & State (Context)

#### [NEW] `src/contexts/AuthContext.js`
- Membuat `AuthProvider` yang membaca token dari `AsyncStorage` pada saat aplikasi pertama kali dimuat (*boot*).
- Menyediakan fungsi `login()` dan `logout()` yang dapat dipanggil dari mana saja.

#### [MODIFY] `src/navigation/AppNavigator.js`
- Mengimplementasikan **Stack Navigator** di level teratas untuk mengatur perpindahan antara *Login Screen* dan *Main Tab Navigator*.
- Menambahkan tab baru yaitu **Profile** ke dalam *Bottom Tab Navigator*.

#### [MODIFY] `App.js`
- Membungkus seluruh aplikasi dengan `<AuthProvider>`.

---

### Screens

#### [NEW] `src/screens/LoginScreen.js`
- Membuat antarmuka pengguna (UI) yang menarik dengan form input `Username` dan `Password`.
- Menyediakan tombol "Masuk" yang akan memanggil fungsi API.
- Menampilkan pesan error jika login gagal.

#### [NEW] `src/screens/ProfileScreen.js`
- Membuat layar Profil baru.
- Meletakkan **Tombol Keluar (Logout)** di layar ini sesuai instruksi Anda.
- Menampilkan info singkat pengguna (misalnya "Admin").

---

### API Services

#### [MODIFY] `src/services/api.js`
- Menghapus variabel global `ensureToken()`. Token kini akan ditarik dari `AuthContext` (atau diteruskan dari UI) saat melakukan *fetch* data.
- Menambahkan fungsi khusus `loginUser(username, password)` yang melakukan *hit* ke endpoint `/api/auth/login`.

## Verification Plan

### Manual Verification
1. Me-*restart* server Expo.
2. Membuka aplikasi di HP (seharusnya aplikasi langsung memunculkan halaman **Login** secara penuh tanpa ada menu di bawah).
3. Mencoba _login_ menggunakan kredensial salah (harus ditolak).
4. Mencoba _login_ menggunakan `admin` dan `admin123` (harus berhasil masuk ke Dashboard).
5. Beralih ke tab **Profile** dan mencoba tombol Logout (seharusnya langsung ditendang kembali ke halaman Login).
6. Masuk kembali, lalu tutup aplikasi secara paksa, kemudian buka lagi (seharusnya langsung masuk ke Dashboard karena *session* disave di AsyncStorage).
