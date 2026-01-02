# Manajemen Produk

Halaman ini digunakan untuk mengelola database menu makanan, minuman, atau barang yang Anda jual. Kelengkapan data di sini sangat berpengaruh pada kemudahan saat transaksi kasir.

<div class="my-6 w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500 font-medium">
    [IMAGE: Daftar Produk (Table View)]
</div>

## 1. Menambah Produk Baru

Klik tombol **+ Tambah Produk** di pojok kanan atas. Form akan muncul dengan detail sebagai berikut:

<div class="my-4 w-full h-64 bg-gray-50 flex items-center justify-center rounded border border-dashed border-gray-300 text-sm text-gray-400">
    [IMAGE: Form Tambah Produk]
</div>

### Informasi Dasar
*   **Nama Produk**: (Wajib) Nama menu, misal "Nasi Goreng Spesial".
*   **Kategori**: Kelompokkan produk (Makanan, Minuman, Snack). Buat kategori dulu jika belum ada.
*   **Satuan**: Unit jual (Porsi, Pcs, Gelas).
*   **Kode Produk/SKU**: (Opsional) Kode unik untuk barcode scanner. Jika dikosongkan, sistem bisa generate otomatis.

### Harga & Modal
*   **Harga Modal (HPP)**: Biaya produksi per porsi. Penting untuk laporan Laba Rugi.
*   **Harga Jual**: Harga yang dibayar pelanggan.

### Inventori (Stok)
*   **Kelola Stok?**:
    *   ✅ **Aktifkan** jika ini adalah barang fisik (misal: Minuman Kaleng) yang stoknya berkurang 1 per penjualan.
    *   ❌ **Matikan** jika ini adalah menu olahan (misal: Nasi Goreng) yang stoknya tidak dihitung per porsi (atau gunakan fitur Resep/Bahan Baku).
*   **Stok Awal**: Jumlah stok saat ini.
*   **Stok Minimum**: Batas peringatan saat stok menipis (Alert).

### Gambar Produk
Upload foto produk yang menarik. Rasio 1:1 (Persegi) direkomendasikan. Foto ini akan tampil di layar POS kasir.

## 2. Produk dengan Varian

Gunakan fitur ini jika satu produk memiliki beberapa opsi harga atau ukuran.
*Contoh: Kopi Susu (Regular, Large) atau Mie Goreng (Biasa, Spesial).*

<div class="my-4 w-full h-48 bg-gray-50 flex items-center justify-center rounded border border-dashed border-gray-300 text-sm text-gray-400">
    [IMAGE: Setting Varian Produk]
</div>

1.  Simpan produk dasar terlebih dahulu.
2.  Edit kembali produk tersebut, scroll ke bagian **Varian**.
3.  Klik **Tambah Varian**.
4.  Masukkan Nama Varian (misal: "Large") dan Harga Tambahan (misal: "+5000").
    *   Jika harga dasar 15.000 dan varian Large +5.000, maka saat kasir memilih Large, harga menjadi 20.000.

## 3. Manajemen Kategori

Kategori membantu merapikan tampilan POS.

1.  Masuk menu **Produk -> Kategori**.
2.  Buat kategori seperti: *Makanan Berat, Minuman Coffee, Minuman Non-Coffee, Snack*.
3.  Urutan kategori bisa memengaruhi tampilan tab di POS.

## 4. Import & Export

Jika Anda memiliki ratusan produk, gunakan fitur Import Excel.

1.  Klik menu **Import**.
2.  Download **Template Excel** yang disediakan.
3.  Isi data produk di Excel sesuai format.
4.  Upload kembali file Excel tersebut.
