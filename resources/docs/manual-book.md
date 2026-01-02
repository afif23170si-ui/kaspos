# 📘 Manual Book - KasPOS

> **Sistem Point of Sale & Manajemen Restoran**  
> Versi 1.0 | Tanggal: 22 Desember 2025

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Persyaratan Sistem](#2-persyaratan-sistem)
3. [Login & Akses Sistem](#3-login--akses-sistem)
4. [Dashboard](#4-dashboard)
5. [Point of Sale (POS)](#5-point-of-sale-pos)
6. [Kitchen Display System](#6-kitchen-display-system)
7. [Manajemen Produk](#7-manajemen-produk)
8. [Manajemen Pelanggan](#8-manajemen-pelanggan)
9. [Manajemen Transaksi](#9-manajemen-transaksi)
10. [Laporan](#10-laporan)
11. [Pengaturan Toko](#11-pengaturan-toko)
12. [Manajemen Pengguna](#12-manajemen-pengguna)
13. [Troubleshooting & FAQ](#13-troubleshooting--faq)

---

## 1. Pendahuluan

### 1.1 Tentang KasPOS

**KasPOS** adalah aplikasi Point of Sale (POS) berbasis web yang dirancang khusus untuk bisnis F&B (Food & Beverage) seperti restoran, kafe, dan warung makan. Sistem ini membantu Anda dalam:

- ✅ Memproses transaksi penjualan dengan cepat
- ✅ Mengelola menu dan produk
- ✅ Mengirim pesanan langsung ke dapur (Kitchen Display)
- ✅ Mencetak struk kasir dan dapur
- ✅ Mengelola stok dan inventori
- ✅ Melihat laporan penjualan dan keuangan
- ✅ Mengelola pelanggan dan program loyalitas

### 1.2 Jenis Pengguna

| Role | Akses |
|------|-------|
| **Super Admin** | Akses penuh ke seluruh sistem |
| **Admin** | Mengelola produk, laporan, dan pengaturan |
| **Kasir** | Melakukan transaksi POS |
| **Waiter** | Menginput pesanan dari meja pelanggan |
| **Staff Dapur** | Melihat dan mengelola kitchen display |

---

## 2. Persyaratan Sistem

### 2.1 Perangkat & Browser

| Komponen | Minimum | Rekomendasi |
|----------|---------|-------------|
| **Browser** | Chrome 80+ / Firefox 75+ / Safari 13+ | Chrome terbaru |
| **Layar** | 1024 x 768 px | 1920 x 1080 px |
| **Koneksi** | 1 Mbps | 5 Mbps |
| **Printer** | Thermal printer 58mm/80mm | Support ESC/POS atau Bluetooth |

### 2.2 Printer yang Didukung

1. **Thermal Printer USB/Network** - Terhubung langsung ke komputer/jaringan
2. **Bluetooth Printer** - Untuk perangkat mobile/tablet via Web Bluetooth API

---

## 3. Login & Akses Sistem

### 3.1 Cara Login

1. Buka browser dan akses URL sistem KasPOS
2. Masukkan **Email** dan **Password** Anda
3. Klik tombol **Login**
4. Jika berhasil, Anda akan diarahkan ke Dashboard

### 3.2 Lupa Password

1. Klik link **"Lupa Password?"** pada halaman login
2. Masukkan email yang terdaftar
3. Cek inbox email untuk link reset password
4. Buat password baru dan login kembali

### 3.3 Logout

1. Klik ikon profil di pojok kanan atas
2. Pilih **"Logout"**
3. Anda akan keluar dari sistem

---

## 4. Dashboard

Dashboard menampilkan ringkasan informasi penting bisnis Anda.

### 4.1 Informasi yang Ditampilkan

- **Total Penjualan Hari Ini** - Jumlah pendapatan hari ini
- **Total Transaksi** - Jumlah transaksi yang telah dilakukan
- **Produk Terlaris** - Produk yang paling banyak terjual
- **Grafik Penjualan** - Trend penjualan dalam periode tertentu

### 4.2 Navigasi Menu

Menu utama tersedia di sidebar kiri:

| Menu | Fungsi |
|------|--------|
| 📊 Dashboard | Ringkasan bisnis |
| 🛒 POS | Halaman kasir/transaksi |
| 🍳 Kitchen Display | Tampilan dapur |
| 📦 Produk | Kelola produk |
| 👥 Pelanggan | Data pelanggan |
| 📋 Transaksi | Riwayat penjualan |
| 📈 Laporan | Laporan keuangan |
| ⚙️ Pengaturan | Konfigurasi sistem |

---

## 5. Point of Sale (POS)

Halaman POS adalah pusat operasional kasir untuk memproses transaksi penjualan.

### 5.1 Membuka Shift Kasir

Sebelum melakukan transaksi, kasir harus membuka shift terlebih dahulu.

**Langkah-langkah:**
1. Buka menu **POS**
2. Sistem akan menampilkan popup **"Buka Shift"**
3. Pilih **Shift** yang sesuai (Pagi/Siang/Malam)
4. Masukkan **Modal Awal** (uang kas di laci)
5. Klik **"Buka Shift"**

### 5.2 Memilih Tipe Pesanan

Klik salah satu tipe pesanan sebelum menambahkan item:

| Tipe | Deskripsi |
|------|-----------|
| **Dine In** | Makan di tempat - pilih nomor meja |
| **Take Away** | Dibungkus/bawa pulang |
| **Online** | Pesanan dari platform online (GoFood, GrabFood, dll.) |

### 5.3 Menambahkan Produk ke Keranjang

**Cara 1: Klik Produk**
1. Pilih **Kategori** produk (opsional)
2. Klik produk yang ingin ditambahkan
3. Produk otomatis masuk ke keranjang

**Cara 2: Cari Produk**
1. Ketik nama produk di kolom pencarian
2. Klik produk dari hasil pencarian

**Cara 3: Scan Barcode**
1. Klik ikon **Barcode Scanner** 📷
2. Arahkan kamera ke barcode produk
3. Produk otomatis ditambahkan

### 5.4 Mengedit Item di Keranjang

1. Klik item yang ingin diedit di daftar keranjang
2. Popup detail item akan muncul
3. Anda dapat mengubah:
   - **Jumlah/Quantity**
   - **Harga** (jika diizinkan)
   - **Diskon** (per item)
   - **Catatan** (misal: "Tidak pedas", "Extra sambal")
4. Klik **"Simpan"** untuk menyimpan perubahan

### 5.5 Menghapus Item dari Keranjang

1. Klik item yang ingin dihapus
2. Klik tombol **"Hapus"** 🗑️
3. Item akan dihilangkan dari keranjang

### 5.6 Menambahkan Pelanggan

1. Klik ikon **Pelanggan** 👤 di area keranjang
2. Cari nama pelanggan yang sudah terdaftar, atau
3. Klik **"Tambah Pelanggan Baru"** untuk mendaftarkan pelanggan baru
4. Pelanggan yang dipilih akan ditampilkan di keranjang

### 5.7 Menggunakan Kupon Diskon

1. Klik ikon **Diskon** 🏷️
2. Masukkan **Kode Kupon**
3. Klik **"Terapkan"**
4. Diskon akan dihitung otomatis pada total

### 5.8 Memproses Pembayaran

1. Pastikan semua item sudah benar
2. Klik tombol **"Bayar"** atau **Grand Total**
3. Popup pembayaran akan muncul
4. Pilih **Metode Pembayaran**:
   - **Tunai** - Masukkan jumlah uang yang diterima
   - **Transfer/QRIS** - Pilih bank/e-wallet
   - **Split Payment** - Kombinasi beberapa metode
5. Klik **"Proses Pembayaran"**

### 5.9 Mencetak Struk

Setelah pembayaran berhasil, akan muncul popup dengan opsi:

| Tombol | Fungsi |
|--------|--------|
| **Cetak Struk** | Cetak struk kasir (thermal/Bluetooth) |
| **Cetak Struk Bluetooth** | Cetak via printer Bluetooth |
| **Cetak Ulang Dapur** | Cetak ulang struk untuk dapur |
| **Selesai** | Tutup popup dan mulai transaksi baru |

### 5.10 Kirim Pesanan ke Dapur

Untuk pesanan **Dine In**, Anda dapat mengirim pesanan ke dapur sebelum pembayaran:

1. Setelah menambahkan item ke keranjang
2. Klik tombol **"Kirim ke Dapur"** 🍳
3. Pesanan akan muncul di **Kitchen Display**
4. Lakukan pembayaran setelah pelanggan selesai makan

### 5.11 Menyimpan Transaksi Pending

Jika pelanggan belum siap bayar:

1. Klik tombol **"Simpan"** 💾
2. Transaksi disimpan sebagai **Pending**
3. Untuk melanjutkan, klik **"Transaksi Pending"**
4. Pilih transaksi yang ingin dilanjutkan

### 5.12 Menutup Shift Kasir

Di akhir shift:

1. Klik tombol **"Tutup Shift"**
2. Masukkan **Kas Akhir** (uang di laci)
3. Sistem akan menampilkan perhitungan:
   - Total penjualan
   - Selisih kas
4. Klik **"Tutup Shift"** untuk mengonfirmasi

---

## 6. Kitchen Display System

Kitchen Display adalah tampilan khusus untuk staff dapur melihat dan mengelola pesanan masuk.

### 6.1 Mengakses Kitchen Display

1. Buka menu **Kitchen Display** dari sidebar
2. Atau akses langsung via URL: `/kitchen`

### 6.2 Tampilan Pesanan

Setiap pesanan ditampilkan dalam bentuk **Card** dengan informasi:

- **Tipe Pesanan** (Dine In + Nomor Meja / Take Away / Online)
- **Nomor Invoice**
- **Nama Pelanggan**
- **Waktu Pesanan**
- **Status** (Menunggu / Proses / Selesai)
- **Daftar Item** (dikelompokkan per kategori)

### 6.3 Status Pesanan

| Status | Badge | Aksi |
|--------|-------|------|
| **Menunggu** | 🔴 Merah | Klik **"Mulai"** untuk memproses |
| **Proses** | 🟡 Kuning | Klik **"Selesai"** setelah semua item siap |
| **Selesai** | 🟢 Hijau | Pesanan sudah dikirim ke pelanggan |

### 6.4 Menandai Item Ready

1. Checklist item yang sudah selesai dimasak
2. Semua item harus di-checklist sebelum bisa klik **"Selesai"**

### 6.5 Memilih Pelayan

1. Pilih nama **Pelayan/Waiter** dari dropdown
2. Pelayan yang dipilih akan bertanggung jawab mengantar pesanan

### 6.6 Cetak Struk Dapur

1. Klik tombol **"Cetak Struk"** 🖨️ pada card pesanan
2. Struk dapur akan dicetak via printer Bluetooth

### 6.7 Auto-Refresh

Kitchen Display akan **refresh otomatis setiap 30 detik** untuk menampilkan pesanan baru. Anda juga dapat klik tombol **"Refresh"** untuk update manual.

---

## 7. Manajemen Produk

### 7.1 Melihat Daftar Produk

1. Buka menu **Produk** → **Produk**
2. Daftar produk akan ditampilkan dalam tabel

### 7.2 Menambah Produk Baru

1. Klik tombol **"Tambah Produk"**
2. Isi form:
   - **Nama Produk** - Nama yang akan ditampilkan
   - **Kode/SKU** - Kode unik produk (opsional)
   - **Kategori** - Pilih kategori
   - **Harga Jual** - Harga untuk pelanggan
   - **Harga Modal** - Harga beli/produksi
   - **Stok** - Jumlah stok awal
   - **Gambar** - Upload foto produk
3. Klik **"Simpan"**

### 7.3 Mengedit Produk

1. Klik ikon **Edit** ✏️ pada baris produk
2. Ubah data yang diperlukan
3. Klik **"Simpan"**

### 7.4 Menghapus Produk

1. Klik ikon **Hapus** 🗑️ pada baris produk
2. Konfirmasi penghapusan
3. Produk akan dihapus dari sistem

### 7.5 Mengelola Kategori

1. Buka menu **Produk** → **Kategori**
2. Klik **"Tambah Kategori"** untuk menambah baru
3. Isi nama kategori dan simpan

### 7.6 Mengelola Satuan

1. Buka menu **Produk** → **Satuan**
2. Contoh satuan: Pcs, Porsi, Gelas, Botol, dll.

### 7.7 Varian Produk

Untuk produk dengan varian (ukuran, level, topping):

1. Edit produk yang memiliki varian
2. Tambahkan **Varian** dengan nama dan harga masing-masing
3. Contoh:
   - Ukuran: Small (+0), Medium (+5000), Large (+10000)
   - Level: Mild, Medium, Hot

---

## 8. Manajemen Pelanggan

### 8.1 Melihat Daftar Pelanggan

1. Buka menu **Pelanggan**
2. Daftar pelanggan akan ditampilkan

### 8.2 Menambah Pelanggan Baru

1. Klik **"Tambah Pelanggan"**
2. Isi data:
   - **Nama**
   - **No. HP**
   - **Email** (opsional)
   - **Alamat** (opsional)
3. Klik **"Simpan"**

### 8.3 Melihat Riwayat Transaksi Pelanggan

1. Klik nama pelanggan untuk melihat detail
2. Tab **"Riwayat Transaksi"** menampilkan semua pembelian

### 8.4 Program Loyalitas (Poin)

Jika program poin aktif:

- Pelanggan mendapat poin dari setiap pembelian
- Poin dapat ditukar dengan diskon/reward
- Lihat saldo poin di detail pelanggan

---

## 9. Manajemen Transaksi

### 9.1 Melihat Daftar Transaksi

1. Buka menu **Transaksi** → **Penjualan**
2. Filter berdasarkan:
   - Tanggal
   - Status pembayaran
   - Kasir
   - Pelanggan

### 9.2 Melihat Detail Transaksi

1. Klik nomor invoice untuk melihat detail
2. Informasi yang ditampilkan:
   - Tanggal & waktu
   - Kasir
   - Pelanggan
   - Daftar item
   - Total & pembayaran

### 9.3 Mencetak Ulang Struk

1. Buka detail transaksi
2. Klik tombol **"Cetak Struk"**
3. Pilih jenis struk (kasir/dapur)

### 9.4 Retur Transaksi

1. Buka menu **Transaksi** → **Retur**
2. Klik **"Buat Retur Baru"**
3. Pilih transaksi yang akan diretur
4. Pilih item dan jumlah yang diretur
5. Masukkan alasan retur
6. Klik **"Proses Retur"**

### 9.5 Export Data Transaksi

1. Buka menu **Transaksi** → **Penjualan**
2. Klik tombol **"Export"**
3. Pilih format (CSV/Excel)
4. File akan di-download

### 9.6 Reset Data Transaksi

> ⚠️ **PERINGATAN**: Fitur ini hanya untuk Super Admin!

1. Buka menu **Transaksi** → **Penjualan**
2. Klik **"Reset Data"**
3. Masukkan password untuk konfirmasi
4. Data akan di-backup otomatis sebelum dihapus
5. Klik **"Konfirmasi Reset"**

---

## 10. Laporan

### 10.1 Jenis Laporan

| Laporan | Deskripsi |
|---------|-----------|
| **Penjualan** | Ringkasan penjualan per periode |
| **Arus Kas** | Cash flow masuk dan keluar |
| **Pembelian** | Laporan pembelian dari supplier |
| **Stok** | Saldo stok saat ini |
| **Kartu Stok** | Riwayat pergerakan stok |
| **Laba Rugi** | Profit & loss statement |

### 10.2 Melihat Laporan Penjualan

1. Buka menu **Laporan** → **Penjualan**
2. Pilih **Rentang Tanggal**
3. Klik **"Tampilkan"**
4. Laporan akan ditampilkan dengan grafik

### 10.3 Export Laporan

1. Buka laporan yang diinginkan
2. Klik tombol **"Export"**
3. Pilih format (PDF/Excel)
4. File akan di-download

### 10.4 Laporan Arus Kas

1. Buka menu **Laporan** → **Arus Kas**
2. Pilih periode
3. Tampilan:
   - **Kas Masuk** - Pendapatan penjualan
   - **Kas Keluar** - Pengeluaran operasional
   - **Saldo** - Selisih kas

### 10.5 Laporan Laba Rugi

1. Buka menu **Laporan** → **Laba Rugi**
2. Pilih periode
3. Tampilan:
   - **Pendapatan** - Total penjualan
   - **Beban** - HPP + Pengeluaran
   - **Laba/Rugi Bersih**

---

## 11. Pengaturan Toko

### 11.1 Mengakses Pengaturan

1. Buka menu **Pengaturan** → **Pengaturan Toko**
2. Tersedia 4 tab pengaturan

### 11.2 Tab Akun Bank

Kelola rekening bank untuk pembayaran transfer.

| Field | Contoh |
|-------|--------|
| Nama Bank | BCA |
| Nomor Rekening | 1234567890 |
| Nama Pemilik | PT Restoran ABC |

**Langkah:**
1. Pilih tab **"Akun Bank"**
2. Klik **"Add Column"** untuk tambah bank baru
3. Isi data bank
4. Klik **"Simpan Data"**

### 11.3 Tab Jam Operasional (Shift)

Atur jadwal shift karyawan.

| Field | Contoh |
|-------|--------|
| Kode | S1 |
| Nama | Shift Pagi |
| Jam Awal | 08:00 |
| Jam Akhir | 16:00 |

### 11.4 Tab Operasional Toko

Pengaturan umum toko:

| Kode | Fungsi | Contoh |
|------|--------|--------|
| **NAME** | Nama Toko | RESTORAN WIOOS |
| **ADDRESS** | Alamat | Jl. Merdeka No. 10, Jakarta |
| **PHONE** | Kontak | 0812-3456-7890 |
| **LOGO** | Logo Toko | Upload gambar (max 1MB) |
| **PJK** | Pajak | 10% |
| **OPR** | Biaya Layanan | 2000 atau 5% |
| **PRNT** | Nama Printer Kasir | POS-58 |
| **PRNT_KITCHEN** | Nama Printer Dapur | Kitchen-58 |

### 11.5 Tab Program Loyalitas

Atur program poin pelanggan:

| Field | Contoh |
|-------|--------|
| Minimal Pembelian | 100000 |
| Poin Yang Diberikan | 1 |
| Masa Berlaku (Hari) | 30 |
| Status | Aktif |

---

## 12. Manajemen Pengguna

### 12.1 Melihat Daftar Pengguna

1. Buka menu **Pengguna** → **Pengguna**
2. Daftar user akan ditampilkan

### 12.2 Menambah Pengguna Baru

1. Klik **"Tambah Pengguna"**
2. Isi data:
   - **Nama**
   - **Email**
   - **Password**
   - **Role** (Super Admin/Admin/Kasir/Waiter)
3. Klik **"Simpan"**

### 12.3 Mengelola Role & Permission

1. Buka menu **Pengguna** → **Role**
2. Klik role untuk melihat/edit permission
3. Checklist permission yang diizinkan
4. Klik **"Simpan"**

### 12.4 Menonaktifkan Pengguna

1. Klik **Edit** pada pengguna
2. Ubah status menjadi **"Tidak Aktif"**
3. User tidak bisa login lagi

---

## 13. Troubleshooting & FAQ

### 13.1 Masalah Umum & Solusi

#### ❌ Tidak bisa login

**Penyebab:**
- Email/password salah
- Akun dinonaktifkan
- Koneksi internet bermasalah

**Solusi:**
1. Periksa kembali email dan password
2. Gunakan fitur "Lupa Password"
3. Hubungi admin jika akun dinonaktifkan
4. Periksa koneksi internet

---

#### ❌ Printer tidak terdeteksi

**Penyebab:**
- Printer belum dinyalakan
- Driver tidak terinstall
- Nama printer salah di pengaturan

**Solusi:**
1. Pastikan printer menyala dan terhubung
2. Install driver printer
3. Periksa nama printer di **Pengaturan → Operasional Toko**

---

#### ❌ Printer Bluetooth tidak bisa connect

**Penyebab:**
- Bluetooth perangkat mati
- Browser tidak support Web Bluetooth
- Printer belum di-pair

**Solusi:**
1. Nyalakan Bluetooth di perangkat
2. Gunakan browser Chrome terbaru
3. Pair printer Bluetooth dari pengaturan perangkat

---

#### ❌ Struk tidak tercetak lengkap / terpotong

**Penyebab:**
- Kertas habis
- Lebar kertas tidak sesuai
- Pengaturan printer salah

**Solusi:**
1. Ganti kertas printer
2. Pastikan menggunakan kertas sesuai (58mm/80mm)
3. Sesuaikan pengaturan lebar print

---

#### ❌ Kitchen Display tidak refresh

**Penyebab:**
- Koneksi internet terputus
- Browser tertutup/minimize

**Solusi:**
1. Periksa koneksi internet
2. Klik tombol **"Refresh"** manual
3. Biarkan tab browser tetap terbuka

---

#### ❌ Stok tidak berkurang setelah transaksi

**Penyebab:**
- Produk tidak diatur "Has Stock"
- Bug sistem

**Solusi:**
1. Edit produk dan aktifkan opsi stok
2. Refresh halaman dan coba lagi
3. Hubungi tim teknis jika masih bermasalah

---

### 13.2 FAQ (Frequently Asked Questions)

#### 📌 Bagaimana cara melihat penjualan hari ini?
> Buka **Dashboard** - informasi penjualan hari ini tampil di bagian atas.

#### 📌 Bisakah saya membatalkan transaksi yang sudah selesai?
> Transaksi yang sudah selesai tidak bisa dibatalkan, namun Anda dapat melakukan **Retur** jika diperlukan.

#### 📌 Bagaimana cara menambahkan diskon untuk semua produk?
> Buat **Kupon Diskon** di menu Promosi, kemudian gunakan kode kupon saat transaksi.

#### 📌 Apakah bisa menggunakan 2 metode pembayaran sekaligus?
> Ya, Anda bisa menggunakan **Split Payment** saat proses pembayaran.

#### 📌 Bagaimana cara mencetak laporan bulanan?
> Buka menu **Laporan → Penjualan**, pilih rentang tanggal 1 bulan, lalu klik **Export**.

#### 📌 Siapa yang bisa melakukan reset data penjualan?
> Hanya **Super Admin** yang memiliki akses untuk reset data.

#### 📌 Apakah data saya aman?
> Ya, sistem dilengkapi dengan:
> - Enkripsi password
> - Audit log aktivitas
> - Backup otomatis sebelum reset data

---

## Kontak Support

Jika Anda memerlukan bantuan lebih lanjut:

- 📧 Email: support@kaspos.com
- 📱 WhatsApp: 0812-XXXX-XXXX
- 🌐 Website: www.kaspos.com

---

> **Dokumen ini adalah panduan penggunaan KasPOS untuk end-user.**  
> Untuk dokumentasi teknis, silakan lihat: **Technical Documentation - KasPOS**
