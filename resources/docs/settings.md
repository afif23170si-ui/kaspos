# Pengaturan Toko

Halaman ini mengatur identitas toko dan perangkat keras yang digunakan. Pengaturan yang benar di sini sangat vital agar struk tercetak dengan nama benar dan laporan valid.

<div class="my-6 w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500 font-medium">
    [IMAGE: Halaman Pengaturan Toko (Tab Umum)]
</div>

## 1. Identitas Toko (General)

Informasi ini akan muncul di **Header (Kepala) Struk** belanja pelanggan.

*   **Nama Toko**: Teks paling atas di struk.
*   **Alamat & Telepon**: Muncul di bawah nama toko.
*   **Logo Toko**:
    *   Upload file gambar (PNG/JPG).
    *   Logo akan otomatis dikonversi menjadi hitam-putih (monokrom) saat dicetak di printer thermal.
    *   *Tips:* Gunakan logo hitan-putih resolusi tinggi agar hasil cetak tajam.

## 2. Akun Bank

Daftarkan rekening yang Anda gunakan untuk menerima pembayaran non-tunai. Data ini akan muncul sebagai opsi saat kasir memilih pembayaran "Transfer".

*   Klik **Tambah Akun**.
*   Isi Nama Bank (BCA), No Rekening, Atas Nama.

<div class="my-4 w-full h-32 bg-gray-50 flex items-center justify-center rounded border border-dashed border-gray-300 text-sm text-gray-400">
    [IMAGE: Daftar Akun Bank]
</div>

## 3. Pengaturan Printer

Bagian paling teknis namun paling penting.

### Printer Kasir (Utama)
Printer ini mencetak struk pembayaran untuk pelanggan.
*   **Koneksi USB**: Pastikan driver printer terinstall di Windows/Mac. Isi **Nama Printer** persis seperti di Control Panel komputer Anda (misal: `POS-58`, `Epson TM-T82`).
*   **Network/LAN**: Isi IP Address printer (misal: `192.168.1.200`).

### Printer Dapur (Sekunder)
Printer ini diletakkan di dapur untuk mencetak pesanan masak.
*   Jika tidak ada printer dapur, kosongkan saja.
*   Jika ada, isi nama/IP printer dapur di sini.

> **Penting**: Penulisan Nama Printer adalah **Case Sensitive** (Huruf besar kecil berpengaruh). Pastikan sama persis dengan yang ada di *Devices & Printers*.

## 4. Pajak & Biaya Layanan

*   **Pajak (Tax)**: Persentase pajak pemerintah (PB1). Contoh: `10` untuk 10%.
*   **Service Charge**: Biaya layanan toko. Contoh: `5` untuk 5%.

Jika diisi `0`, maka tidak akan ada biaya tambahan pada struk.
