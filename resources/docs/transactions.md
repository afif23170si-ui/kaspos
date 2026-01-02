# Manajemen Transaksi

Menu **Riwayat Transaksi** adalah tempat Anda melihat arsip semua penjualan yang pernah terjadi. Data di sini tidak bisa diubah sembarangan demi keamanan, namun bisa dikelola untuk kebutuhan reprint atau retur.

<div class="my-6 w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500 font-medium">
    [IMAGE: Tabel Riwayat Transaksi]
</div>

## 1. Mencari & Filter Transaksi

Anda bisa mencari transaksi spesifik menggunakan filter di bagian atas tabel:
*   **Rentang Tanggal**: Pilih tanggal mulai dan akhir (default: hari ini).
*   **Kasir**: Lihat performa kasir tertentu.
*   **Metode Pembayaran**: Cari khusus transaksi "Tunai" atau "Transfer".

## 2. Detail Transaksi & Reprint

Klik pada **Nomor Invoice** (contoh: `#INV-20231201-001`) untuk membuka detail transaksi.

<div class="my-4 w-full h-64 bg-gray-50 flex items-center justify-center rounded border border-dashed border-gray-300 text-sm text-gray-400">
    [IMAGE: Halaman Detail Transaksi]
</div>

Di halaman detail ini, Anda bisa:
*   Melihat jam tepat transaksi terjadi.
*   Melihat rincian item kembali.
*   **Cetak Ulang Struk (Reprint)**: Jika pelanggan meminta struk lagi, klik tombol **Print** di kanan atas.

## 3. Retur Penjualan (Refund/Void)

Jika pelanggan komplain atau salah input dan perlu membatalkan transaksi:

1.  Masuk ke menu **Transaksi -> Retur**.
2.  Klik **Buat Retur Baru**.
3.  Cari Nomor Invoice transaksi asli.
4.  Pilih item mana yang dikembalikan (bisa sebagian atau semua).
    *   *System Logic*: Stok produk akan otomatis bertambah kembali ke inventori.
    *   *Financial Logic*: Total pendapatan hari ini akan berkurang sesuai nilai retur.
5.  Masukkan **Alasan Retur** (misal: "Salah Menu", "Makanan Basi").
6.  Klik **Proses Retur**.

<div class="my-4 w-full h-48 bg-gray-50 flex items-center justify-center rounded border border-dashed border-gray-300 text-sm text-gray-400">
    [IMAGE: Form Retur Transaksi]
</div>

## 4. Reset Data (Bahaya ⚠️)

Menu ini biasanya tersembunyi atau hanya untuk **Super Admin**.
Digunakan untuk menghapus **SEMUA** riwayat penjualan (misal: setelah masa trial selesai dan ingin *Grand Opening*).

1.  Sistem akan meminta **Password Super Admin**.
2.  Sistem akan otomatis **Mendownload Backup** (Excel) data lama sebelum menghapus.
3.  Tindakan ini tidak bisa dibatalkan (Irreversible).
