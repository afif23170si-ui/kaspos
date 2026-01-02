# Kitchen Display System (KDS)

Kitchen Display System (KDS) menggantikan printer dapur tradisional. Layar ini diletakkan di area dapur/bar untuk memberitahu koki/barista pesanan apa yang harus segera dibuat.

<div class="my-6 w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500 font-medium">
    [IMAGE: Tampilan Layar Kitchen Display]
</div>

## Cara Kerja

Halaman ini mengupdate secara **Real-time** (otomatis refresh setiap 30 detik, atau manual).

### 1. Pesanan Baru Masuk (Status: Menunggu)
Setiap kali kasir klik tombol **"Kirim ke Dapur"** atau menyelesaikan pembayaran, pesanan akan muncul di sini sebagai kartu baru.

*   Kartu berwarna **Putih**.
*   Berisi daftar menu yang harus dimasak.
*   Header kartu menunjukkan: Waktu Pemesanan (agar koki tahu mana yang prioritas) dan Nomor Meja.

<div class="my-4 w-full h-48 bg-gray-50 flex items-center justify-center rounded border border-dashed border-gray-300 text-sm text-gray-400">
    [IMAGE: Kartu Pesanan Status Menunggu]
</div>

### 2. Memproses Pesanan (Status: Dimasak)
Saat koki mulai memasak, koki menekan tombol **"Proses Masak"** (atau ikon Wajan/Api).

*   Status kartu berubah menjadi **Sedang Dimasak**.
*   Warna indikator berubah menjadi **Kuning**.
*   Ini memberitahu pelayan bahwa pesanan sedang dibuat.

### 3. Pesanan Selesai (Status: Siap Saji)
Setelah masakan matang dan diletakkan di meja serving:

1.  Koki melakukan **Checklist** (centang) per item menu yang selesai.
2.  Jika semua item dalam satu pesanan selesai, tombol **"Selesai"** akan aktif.
3.  Tekan tombol **"Selesai"**.
4.  Kartu pesanan akan hilang dari layar aktif (masuk ke arsip).

<div class="my-4 w-full h-48 bg-gray-50 flex items-center justify-center rounded border border-dashed border-gray-300 text-sm text-gray-400">
    [IMAGE: Proses Checklist Item Selesai]
</div>

## Fitur Tambahan

### Cetak Struk Dapur (Reprint)
Jika koki lebih nyaman memegang kertas fisik untuk order tertentu, klik ikon **Printer** pada kartu pesanan. Sistem akan mencetak struk kecil (checker) via printer thermal dapur yang terhubung.

### Memanggil Waiter
(Opsional) Di beberapa setup, tombol "Selesai" di dapur bisa memicu notifikasi di aplikasi Waiter untuk segera mengambil makanan.
