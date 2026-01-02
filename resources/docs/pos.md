# Point of Sale (POS)

Modul **Point of Sale (POS)** adalah jantung dari operasional toko Anda. Halaman ini didesain untuk kecepatan dan kemudahan kasir dalam memproses pesanan.

<div class="my-6 w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500 font-medium">
    [IMAGE: Tampilan Halaman Utama POS]
</div>

## 1. Membuka Shift Kasir (Open Shift)

Sistem KasPOS mewajibkan setiap kasir untuk membuka shift sebelum bisa bertransaksi. Ini penting untuk pelaporan dan pertanggungjawaban uang kas.

1.  Klik menu **POS** di sidebar.
2.  Jika belum ada shift aktif, popup **"Buka Shift"** akan muncul.
3.  **Kas Awal**: Masukkan jumlah uang tunai yang ada di laci kasir (Modal).
    *   *Contoh*: Jika Anda diberikan modal Rp 200.000 untuk kembalian, masukkan `200000`.
4.  Klik tombol **Buka Shift**.

<div class="my-4 w-full h-48 bg-gray-50 flex items-center justify-center rounded border border-dashed border-gray-300 text-sm text-gray-400">
    [IMAGE: Popup Buka Shift Kasir]
</div>

## 2. Proses Transaksi Penjualan

### Tahap 1: Memilih Jenis Pesanan
Di bagian atas daftar produk, pilih salah satu tab:
*   **Dine In**: Untuk makan di tempat. (Wajib pilih meja).
*   **Take Away**: Untuk pesanan bungkus.
*   **Delivery/Online**: Untuk pesanan via ojek online.

### Tahap 2: Menambahkan Produk
Ada 3 cara untuk memasukkan produk ke keranjang:

1.  **Klik Gambar**: Klik langsung pada kartu produk di layar.
2.  **Pencarian**: Ketik nama produk di kolom *Search* (contoh: "Kopi").
3.  **Scan Barcode**:
    *   Pastikan kursor aktif di kolom pencarian atau gunakan Scanner USB.
    *   Atau klik ikon **Kamera** untuk menggunakan kamera device sebagai scanner.

<div class="my-4 w-full h-48 bg-gray-50 flex items-center justify-center rounded border border-dashed border-gray-300 text-sm text-gray-400">
    [IMAGE: Proses Menambahkan Produk & Search Bar]
</div>

### Tahap 3: Mengelola Keranjang Belanja
Produk yang dipilih akan muncul di **Panel Kanan (Cart)**.

*   **Mengubah Jumlah**: Klik tombol `+` atau `-` pada item.
*   **Edit Detail Item**: Klik pada nama item di keranjang untuk membuka opsi lanjutan:
    *   **Catatan/Notes**: Masukkan request khusus (contoh: "Tanpa Es", "Pedas Pisah").
    *   **Diskon Item**: Berikan diskon khusus hanya untuk item ini (Nominal atau %).
*   **Hapus Item**: Klik ikon Sampah 🗑️.

<div class="my-4 w-full h-48 bg-gray-50 flex items-center justify-center rounded border border-dashed border-gray-300 text-sm text-gray-400">
    [IMAGE: Tampilan Keranjang Belanja & Form Edit Item]
</div>

### Tahap 4: Pelanggan & Meja (Opsional)
*   **Pelanggan**: Klik ikon 👤 untuk memilih member/pelanggan. Ini berguna jika ingin memberikan poin loyalitas.
*   **Meja**: Jika *Dine In*, klik tombol **"Pilih Meja"** dan pilih nomor meja dari denah.

## 3. Pembayaran (Checkout)

Setelah pesanan lengkap, klik tombol besar **Bayar** di bawah keranjang.

<div class="my-6 w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500 font-medium">
    [IMAGE: Popup Metode Pembayaran]
</div>

### Bayar Tunai (Cash)
1.  Pilih tab **Tunai**.
2.  Klik tombol pecahan uang cepat (Rp 50.000, Rp 100.000) atau ketik manual jumlah uang yang diterima.
3.  Sistem akan otomatis menghitung **Kembalian**.

### Bayar Non-Tunai (Transfer/QRIS/Card)
1.  Pilih tab **Non-Tunai**.
2.  Pilih Akun Bank/E-Wallet tujuan (misal: BCA, GoPay).
3.  Sistem mencatat ini sebagai uang masuk bank, bukan laci kasir.

### Split Payment (Bayar Terpisah)
Fitur ini digunakan jika pelanggan ingin membayar sebagian tunai dan sebagian transfer, atau patungan.
1.  Pilih tab **Split Payment**.
2.  Masukkan nominal untuk metode pertama (misal: Tunai 50.000).
3.  Sisa tagihan akan dihitung otomatis.
4.  Pilih metode kedua untuk melunasi sisa tagihan.

## 4. Cetak Struk & Dapur

Setelah pembayaran sukses, popup **Transaksi Berhasil** akan muncul.

<div class="my-4 w-full h-48 bg-gray-50 flex items-center justify-center rounded border border-dashed border-gray-300 text-sm text-gray-400">
    [IMAGE: Popup Transaksi Berhasil]
</div>

*   **Cetak Struk**: Mencetak struk untuk pelanggan via printer kasir (USB/LAN).
*   **Cetak Bluetooth**: Opsi khusus jika Anda menggunakan printer portable bluetooth.
*   **Cetak Dapur**: Mencetak salinan struk untuk staff dapur (biasanya berisi daftar menu saja tanpa harga).

## 5. Menutup Shift (Close Shift)

Lakukan ini hanya ketika pergantian kasir atau toko tutup.

1.  Klik tombol **Tutup Shift** (biasanya di menu profil atau dashboard POS).
2.  Sistem akan menampilkan **Laporan Shift**:
    *   **Uang Tunai Seharusnya**: (Modal Awal + Penjualan Tunai).
    *   **Uang Fisik**: Masukkan jumlah uang yang Anda hitung manual di laci.
3.  Jika ada selisih, sistem akan mencatatnya sebagai **Selisih Kas (Cash Minus/Plus)**.
