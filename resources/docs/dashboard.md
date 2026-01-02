# Dashboard

Halaman Dashboard adalah pusat informasi utama yang pertama kali Anda lihat setelah login. Halaman ini dirancang untuk memberikan ringkasan cepat mengenai performa bisnis Anda secara real-time.

<div class="my-6 w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500 font-medium">
    [IMAGE: Tampilan Halaman Dashboard Lengkap]
</div>

## Ringkasan Performa (Business Summary)

Di bagian paling atas, terdapat 4 kartu statistik utama yang diperbarui secara langsung:

1.  **Total Transaksi Hari Ini**
    *   Menampilkan jumlah struk/invoice yang berhasil dicetak hari ini.
    *   *Berguna untuk:* Mengetahui seberapa ramai toko Anda saat ini.
    *   <div class="my-4 w-full h-32 bg-gray-50 flex items-center justify-center rounded border border-dashed border-gray-300 text-xs text-gray-400">[IMAGE: Kartu Statistik Total Transaksi]</div>

2.  **Total Penjualan Hari Ini**
    *   Total omset kotor yang diterima hari ini (termasuk pajak & servis).
    *   Angka ini adalah indikator pendapatan harian Anda.
    *   <div class="my-4 w-full h-32 bg-gray-50 flex items-center justify-center rounded border border-dashed border-gray-300 text-xs text-gray-400">[IMAGE: Kartu Statistik Total Penjualan]</div>

3.  **Total Produk Terjual**
    *   Jumlah item (qty) yang keluar dari stok hari ini.
    *   *Berguna untuk:* Estimasi penggunaan bahan baku.

4.  **Produk Terlaris (Bulan Ini)**
    *   Menampilkan 1 produk dengan penjualan tertinggi bulan ini.
    *   Klik untuk melihat daftar lengkap produk terlaris di menu Laporan.

## Grafik Penjualan (Sales Chart)

Di bawah kartu ringkasan, terdapat grafik batang (bar chart) yang menampilkan tren penjualan dalam 7 hari terakhir.

<div class="my-6 w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500 font-medium">
    [IMAGE: Grafik Penjualan 7 Hari Terakhir]
</div>

*   **Sumbu X (Horizontal)**: Tanggal.
*   **Sumbu Y (Vertikal)**: Nominal Pendapatan (Rp).
*   **Tooltip**: Arahkan mouse ke salah satu batang untuk melihat detail angka penjualan pada tanggal tersebut.
*   **Analisis**: Gunakan grafik ini untuk melihat pola hari ramai (misal: apakah Weekend selalu lebih tinggi dari Weekday?).

## Produk Terlaris (Top Selling Products)

Tabel ini menampilkan daftar 5 produk dengan performa terbaik bulan ini.

<div class="my-6 w-full h-48 bg-gray-100 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500 font-medium">
    [IMAGE: Tabel Top 5 Produk Terlaris]
</div>

*   **Nama Produk**: Item menu.
*   **Terjual**: Total quantity yang terjual.
*   **Total Pendapatan**: Kontribusi pendapatan dari produk tersebut.

> **Tips Manajemen**: Pastikan stok untuk produk-produk di daftar ini selalu tersedia karena ini adalah sumber pendapatan utama Anda.

## Aktivitas Terbaru (Recent Activities)

Sidebar sebelah kanan (pada desktop) menampilkan log aktivitas pengguna terkini. Anda bisa memantau siapa yang baru saja login, melakukan transaksi, atau mengubah data produk.
