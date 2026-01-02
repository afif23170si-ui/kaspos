# 📗 Technical Documentation - KasPOS

> **Version**: 1.0  
> **Last Updated**: 22 Desember 2025  
> **System Type**: Point of Sale (POS) & Restaurant Management System

---

## 1. Pendahuluan

**KasPOS** adalah sistem Point of Sale (POS) dan manajemen restoran berbasis web yang dirancang untuk membantu bisnis F&B (Food & Beverage) dalam mengelola transaksi penjualan, manajemen produk, inventori, dapur, dan laporan keuangan.

### Tujuan Sistem
- Mempermudah proses transaksi penjualan
- Mengelola produk, stok, dan inventori
- Integrasi dengan kitchen display untuk pesanan dapur
- Menyediakan laporan keuangan dan analisis bisnis
- Manajemen pelanggan dan program loyalitas

---

## 2. Tech Stack

### 2.1 Backend

| Teknologi | Versi | Deskripsi |
|-----------|-------|-----------|
| **PHP** | ^8.2 | Bahasa pemrograman server-side |
| **Laravel** | 12.x | PHP Framework |
| **MySQL** | - | Database relasional |
| **Inertia.js** | 2.0 | Server-side routing for SPA |

#### Backend Packages
| Package | Fungsi |
|---------|--------|
| `barryvdh/laravel-dompdf` | Generate PDF (invoice, receipt) |
| `mike42/escpos-php` | Thermal printer integration (ESC/POS) |
| `simplesoftwareio/simple-qrcode` | QR Code generator |
| `spatie/laravel-permission` | Role & permission management |
| `spatie/laravel-activitylog` | Audit log / activity logging |
| `tightenco/ziggy` | Laravel routes in JavaScript |

---

### 2.2 Frontend

| Teknologi | Versi | Deskripsi |
|-----------|-------|-----------|
| **React** | 19.x | JavaScript library untuk UI |
| **TypeScript** | 5.7 | Type-safe JavaScript |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **Vite** | 6.x | Build tool & dev server |

#### Frontend Packages
| Package | Fungsi |
|---------|--------|
| `@inertiajs/react` | React adapter untuk Inertia.js |
| `@radix-ui/*` | Headless UI components (Dialog, Dropdown, Tabs, dll.) |
| `@headlessui/react` | Accessible UI components |
| `lucide-react` | Icon library |
| `recharts` | Charts & data visualization |
| `sonner` | Toast notifications |
| `date-fns` | Date utility library |
| `html5-qrcode` | QR Code scanner di browser |
| `cmdk` | Command palette (⌘K) |
| `next-themes` | Dark/light mode theming |

---

### 2.3 Development Tools

| Tool | Fungsi |
|------|--------|
| **ESLint** | JavaScript/TypeScript linting |
| **Prettier** | Code formatting |
| **PHPUnit** | PHP unit testing |
| **Laravel Pint** | PHP code styling |
| **Laravel Sail** | Docker development environment |

---

## 3. Arsitektur Sistem

### 3.1 Arsitektur Aplikasi

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            React 19 + TypeScript + Tailwind          │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │    │
│  │  │   Pages  │  │Components│  │   Radix UI       │   │    │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│                    Inertia.js                                │
│                          │                                   │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                        SERVER                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   Laravel 12                         │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │    │
│  │  │Controllers│ │  Models  │  │     Services     │   │    │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    MySQL Database                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           External Services                          │    │
│  │  ┌──────────────┐  ┌─────────────────────────────┐  │    │
│  │  │Thermal Printer│  │    Bluetooth Printer       │  │    │
│  │  │   (ESC/POS)   │  │    (Web Bluetooth API)     │  │    │
│  │  └──────────────┘  └─────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Struktur Direktori

```
kaspos/
├── app/
│   ├── Http/Controllers/
│   │   ├── Apps/           # 30 application controllers
│   │   ├── Auth/           # Authentication controllers
│   │   └── Settings/       # User settings controllers
│   └── Models/             # 48 Eloquent models
├── database/
│   ├── migrations/         # 69 database migrations
│   ├── factories/          # Model factories
│   └── seeders/            # Database seeders
├── resources/
│   └── js/
│       ├── pages/          # 31 page modules
│       │   └── apps/       # Application pages
│       └── components/     # 44+ React components
├── routes/
│   ├── web.php             # Main application routes
│   ├── auth.php            # Authentication routes
│   └── settings.php        # Settings routes
└── public/                 # Public assets
```

---

## 4. Modul & Fitur

### 4.1 Point of Sale (POS)

| Fitur | Deskripsi |
|-------|-----------|
| Transaksi Penjualan | Proses penjualan produk |
| Pencarian Barcode | Scan barcode produk |
| Open/Close Shift | Buka/tutup shift kasir |
| Pending Transaction | Simpan transaksi sementara |
| Multiple Payment | Pembayaran split (tunai, transfer, dll.) |
| Discount per Item | Diskon per produk |
| Cetak Struk | Print receipt (thermal/Bluetooth) |
| Kitchen Integration | Kirim pesanan ke dapur |

**Related Files:**
- Controller: `app/Http/Controllers/Apps/PosController.php`
- Page: `resources/js/pages/apps/pos/`
- Components: `PrintBluetoothButton.tsx`, `PrintKitchenBluetoothButton.tsx`

---

### 4.2 Kitchen Display System

| Fitur | Deskripsi |
|-------|-----------|
| List Orders | Daftar pesanan masuk |
| Order Status | Update status pesanan (pending/proses/selesai) |
| Cetak Ulang | Reprint kitchen receipt |
| Auto-reload | Refresh otomatis pesanan baru |

**Related Files:**
- Controller: `app/Http/Controllers/Apps/TransactionKitchenController.php`
- Page: `resources/js/pages/apps/kitchens/`
- Models: `TransactionKitchen.php`, `TransactionKitchenItem.php`

---

### 4.3 Manajemen Produk

| Fitur | Deskripsi |
|-------|-----------|
| Products | CRUD produk |
| Categories | Kategori produk |
| Units | Satuan produk |
| Product Variants | Varian produk (ukuran, warna, dll.) |
| Menus | Menu F&B dengan resep |
| Recipes | Resep bahan baku |

**Related Files:**
- Controllers: `ProductController.php`, `CategoryController.php`, `UnitController.php`, `MenuController.php`
- Models: `Product.php`, `ProductVariant.php`, `Category.php`, `Unit.php`, `Menu.php`, `Receipe.php`

---

### 4.4 Inventori & Stok

| Fitur | Deskripsi |
|-------|-----------|
| Materials | Bahan baku/material |
| Stock Management | Kelola stok produk |
| Stock Movement | Riwayat pergerakan stok |
| Checking Stock | Stok opname |
| Purchase Orders | Pembelian dari supplier |
| Purchase Returns | Retur pembelian |

**Related Files:**
- Controllers: `MaterialController.php`, `OrderController.php`, `CheckingStockController.php`, `PurchaseReturnController.php`
- Models: `Material.php`, `Stock.php`, `StockMovement.php`, `Order.php`, `OrderDetail.php`

---

### 4.5 Transaksi & Penjualan

| Fitur | Deskripsi |
|-------|-----------|
| Transactions | Riwayat transaksi |
| Transaction Details | Detail item transaksi |
| Transaction Payments | Pembayaran multi-method |
| Transaction Returns | Retur penjualan |
| Export Data | Export ke CSV/Excel |
| Reset Data | Reset data penjualan |

**Related Files:**
- Controllers: `TransactionController.php`, `TransactionReturnController.php`
- Models: `Transaction.php`, `TransactionDetail.php`, `TransactionPayment.php`, `TransactionReturn.php`

---

### 4.6 Promosi & Diskon

| Fitur | Deskripsi |
|-------|-----------|
| Coupons | Kupon diskon |
| Discount Packages | Paket diskon bundling |
| Discount Products | Diskon per produk |
| Customer Points | Program loyalitas poin |

**Related Files:**
- Controllers: `CouponController.php`, `DiscountPackageController.php`, `DiscountProductController.php`
- Models: `Coupon.php`, `DiscountPackage.php`, `DiscountProduct.php`, `CustomerPoint.php`

---

### 4.7 Pelanggan & Supplier

| Fitur | Deskripsi |
|-------|-----------|
| Customers | Data pelanggan |
| Customer Points | Poin loyalitas |
| Suppliers | Data supplier |
| Tables | Kelola meja restoran |
| Table QR Code | Generate QR untuk meja |

**Related Files:**
- Controllers: `CustomerController.php`, `SupplierController.php`, `TableController.php`
- Models: `Customer.php`, `CustomerPoint.php`, `Supplier.php`, `Table.php`

---

### 4.8 Pengeluaran (Expenses)

| Fitur | Deskripsi |
|-------|-----------|
| Expense Categories | Kategori pengeluaran |
| Expense Subcategories | Sub-kategori |
| Expenses | Catat pengeluaran |
| Expense Payments | Pembayaran pengeluaran |

**Related Files:**
- Controllers: `ExpenseCategoryController.php`, `ExpenseSubcategoryController.php`, `ExpenseController.php`
- Models: `ExpenseCategory.php`, `ExpenseSubcategory.php`, `Expense.php`, `ExpensePayment.php`

---

### 4.9 Laporan

| Jenis Laporan | Deskripsi |
|---------------|-----------|
| Cash Flow | Arus kas masuk/keluar |
| Sales Report | Laporan penjualan |
| Purchase Report | Laporan pembelian |
| Stock Report | Laporan stok |
| Card Stock | Kartu stok |
| Profit & Loss | Laporan laba rugi |

**Related Files:**
- Controller: `app/Http/Controllers/Apps/ReportController.php`
- Pages: `resources/js/pages/apps/reports/`

---

### 4.10 User Management

| Fitur | Deskripsi |
|-------|-----------|
| Users | Kelola pengguna |
| Roles | Role/jabatan |
| Permissions | Hak akses |
| Audit Log | Log aktivitas user |

**Related Files:**
- Controllers: `UserController.php`, `RoleController.php`, `PermissionController.php`, `AuditLogController.php`
- Models: `User.php` (with Spatie Permission)

---

### 4.11 Pengaturan

| Fitur | Deskripsi |
|-------|-----------|
| Store Settings | Profil toko (nama, alamat, logo) |
| Bank Accounts | Rekening bank |
| Shifts | Pengaturan shift |
| Customer Loyalty | Pengaturan program poin |

**Related Files:**
- Controller: `app/Http/Controllers/Apps/SettingStoreController.php`
- Page: `resources/js/pages/apps/setting-stores/`

---

## 5. Database Schema

### 5.1 Jumlah Tabel
Total **48 models** dengan **69 migrations**, mencakup:

### 5.2 Tabel Utama

| Kategori | Tabel |
|----------|-------|
| **User & Auth** | `users`, `roles`, `permissions`, `model_has_roles`, `model_has_permissions` |
| **Products** | `products`, `product_variants`, `product_variant_values`, `categories`, `units`, `menus`, `receipes` |
| **Inventory** | `materials`, `stocks`, `stock_movements`, `checking_stocks`, `checking_stock_details` |
| **Transactions** | `transactions`, `transaction_details`, `transaction_payments`, `transaction_taxes`, `transaction_returns`, `transaction_return_details` |
| **Kitchen** | `transaction_kitchens`, `transaction_kitchen_items` |
| **Orders** | `orders`, `order_details`, `order_payments`, `purchase_returns`, `purchase_return_details` |
| **Customers** | `customers`, `customer_points`, `customer_point_settings` |
| **Discounts** | `coupons`, `discount_packages`, `discount_package_items`, `discount_products`, `discount_product_items`, `discount_product_customers` |
| **Expenses** | `expense_categories`, `expense_subcategories`, `expenses`, `expense_payments` |
| **Settings** | `settings`, `bank_accounts`, `shifts`, `tables`, `cashier_shifts` |
| **Audit** | `activity_log` |

---

## 6. API Routes

### 6.1 POS Routes
```
GET    /pos                     → POS index page
POST   /pos                     → Create transaction
POST   /pos/open-cashier-shift  → Open shift
POST   /pos/close-cashiers      → Close shift
GET    /pos/products/search-barcode → Search by barcode
GET    /pos/pending-transactions → List pending transactions
GET    /pos/history-transactions → Transaction history
POST   /pos/print-receipt       → Print receipt
GET    /pos/print-receipt-bluetooth → Bluetooth receipt data
GET    /pos/print-kitchen-bluetooth → Kitchen receipt data
POST   /pos/update-table        → Update table
POST   /pos/send-kitchen        → Send to kitchen
POST   /pos/discount-per-item   → Apply item discount
```

### 6.2 Kitchen Routes
```
GET    /kitchen                 → Kitchen display
GET    /kitchen/list-orders     → List orders
PUT    /kitchen/{id}/update     → Update order status
```

### 6.3 Resource Routes
Menggunakan Laravel Resource Routing untuk CRUD:
- `/coupons`, `/discount-packages`, `/discount-products`
- `/customers`, `/units`, `/categories`, `/tables`
- `/suppliers`, `/materials`, `/products`, `/menus`
- `/orders`, `/purchase-returns`, `/transactions`
- `/transaction-returns`, `/checking-stocks`
- `/expense-categories`, `/expense-subcategories`, `/expenses`
- `/permissions`, `/roles`, `/users`

---

## 7. Fitur Cetak (Printing)

### 7.1 Thermal Printer (ESC/POS)
- Library: `mike42/escpos-php`
- Mendukung printer thermal via USB/Network
- Format receipt standar 58mm/80mm

### 7.2 Bluetooth Printer
- Menggunakan Web Bluetooth API
- Components: `PrintBluetoothButton.tsx`, `PrintKitchenBluetoothButton.tsx`
- Mendukung printer Bluetooth portable

### 7.3 Browser Print
- Print via browser dengan logo
- Generate PDF invoice

---

## 8. Development Workflow

### 8.1 Local Development
```bash
# Install dependencies
composer install
npm install

# Run development server
composer dev
# or
npm run dev & php artisan serve
```

### 8.2 Build Production
```bash
npm run build
# or for SSR
npm run build:ssr
```

### 8.3 Code Quality
```bash
# Format code
npm run format
./vendor/bin/pint

# Lint
npm run lint

# Type check
npm run types
```

---

## 9. Changelog Template

```markdown
## [Version] - YYYY-MM-DD

### Added
- Fitur baru yang ditambahkan

### Changed
- Perubahan yang dilakukan

### Fixed
- Bug yang diperbaiki

### Removed
- Fitur yang dihapus
```

---

## 10. Bug Log & Solusi

### [BUG-000] Halaman Blank (White Screen)

**Deskripsi**: Saat awal setup atau setelah deployment, aplikasi menampilkan halaman kosong (white screen) dengan error `ViteManifestNotFoundException`.

**Langkah Reproduksi**:
1. Lakukan fresh install atau deployment aplikasi.
2. Akses URL aplikasi di browser.

**Penyebab**: Asset frontend (JavaScript, CSS) yang dibutuhkan oleh Vite belum di-build atau tidak ditemukan.

**Solusi**: Jalankan perintah `npm install` untuk menginstal dependensi frontend, lalu `npm run build` untuk mengkompilasi asset frontend.

**Status**: ✅ Fixed

### [BUG-001] Browser Print Layout - Font Blur & Konten Terpotong

**Deskripsi**: Cetak struk via browser menghasilkan font blur dan layout terpotong

**Langkah Reproduksi**:
1. Buka halaman POS
2. Selesaikan transaksi
3. Klik "Cetak (dengan Logo)"
4. Preview print menunjukkan font blur dan konten terpotong

**Penyebab**: Perubahan CSS pada font monospace dan pengaturan layout print

**Solusi**: Revert CSS print ke versi sebelumnya, gunakan font standar untuk print

**Status**: ✅ Fixed

---

### [BUG-002] Kitchen Display - Auto Print Pada Tombol Selesai

**Deskripsi**: Tombol "Selesai" di popup sukses transaksi secara otomatis mencetak struk dapur

**Langkah Reproduksi**:
1. Selesaikan transaksi di POS
2. Klik tombol "Selesai" pada popup sukses
3. Struk dapur tercetak otomatis

**Penyebab**: Fungsi print dapur terikat pada event tombol Selesai

**Solusi**: Memisahkan fungsi cetak dapur dari tombol Selesai, menambahkan tombol terpisah untuk cetak ulang

**Status**: ✅ Fixed

---

### [BUG-003] Tombol Cetak Struk - Layout Tidak Seimbang

**Deskripsi**: Tombol "Cetak Struk Kasir" dan "Cetak Ulang Dapur" tidak memenuhi layar secara merata pada monitor besar

**Penyebab**: CSS grid/flex tidak responsif untuk layar lebih besar

**Solusi**: Mengubah layout grid agar tombol mengisi ruang secara proporsional

**Status**: ✅ Fixed

---

### [BUG-004] Reset Data Penjualan - Data Terekspose

**Deskripsi**: Reset data penjualan dapat diakses tanpa verifikasi keamanan

**Penyebab**: Tidak ada validasi password dan role check

**Solusi**: 
- Menambahkan verifikasi password sebelum reset
- Membatasi akses hanya untuk Super Admin
- Auto-export data sebelum delete

**Status**: ✅ Fixed

---

### Template Bug Baru

```markdown
### [BUG-XXX] Judul Bug

**Deskripsi**: Penjelasan singkat bug

**Langkah Reproduksi**:
1. Step 1
2. Step 2

**Penyebab**: Root cause

**Solusi**: Cara memperbaiki

**Status**: ✅ Fixed / 🔴 Open
```

---

## 11. Feature Request Log

### [REQ-001] Kitchen Display - Cetak Struk Button

**Deskripsi**: Menambahkan tombol "Cetak Struk" pada card di kitchen display untuk reprint struk dapur

**User Story**: Sebagai staff dapur, saya ingin mencetak ulang struk pesanan, agar bisa konfirmasi item jika struk hilang

**Status**: ✅ Done

---

### [REQ-002] Reset Sales Data dengan Backup

**Deskripsi**: Fitur reset semua data transaksi dengan auto-backup ke CSV/Excel

**User Story**: Sebagai admin, saya ingin reset data penjualan, agar bisa mulai periode baru dengan data bersih

**Acceptance Criteria**:
- [x] Auto export ke CSV sebelum delete
- [x] Password verification
- [x] Super Admin only
- [x] Tidak menghapus data retur & kitchen history

**Status**: ✅ Done

---

### [REQ-003] Kitchen Display - Auto Reload

**Deskripsi**: Refresh otomatis tampilan kitchen display saat ada pesanan baru

**User Story**: Sebagai staff dapur, saya ingin display refresh otomatis, agar tidak perlu manual refresh

**Status**: ✅ Done

---

### [REQ-004] Rename Tombol Cetak

**Deskripsi**: Mengubah label "Cetak Struk Kasir" menjadi "Cetak Struk"

**Alasan**: Menyederhanakan label untuk user experience lebih baik

**Status**: ✅ Done

---

### [REQ-005] Manual Book & Technical Documentation

**Deskripsi**: Membuat dokumentasi lengkap sistem KasPOS

**Scope**:
- Technical Documentation (untuk developer)
- Manual Book (untuk end-user)

**Status**: 🚧 In Progress

---

### [REQ-006] POS - Tombol Cetak Struk Dapur

**Deskripsi**: Menambahkan tombol fungsi khusus pada halaman POS untuk mencetak struk dapur tanpa harus membuka history transaksi.

**User Story**: Sebagai kasir, saya ingin tombol cepat cetak dapur, agar komunikasi ke dapur lebih efisien.

**Status**: ✅ Done

---

### [REQ-007] POS - Logo pada Struk Browser

**Deskripsi**: Menambahkan logo toko pada hasil cetakan struk yang menggunakan fitur browser print (window.print).

**User Story**: Sebagai pemilik, saya ingin logo toko tampil di struk, agar terlihat lebih profesional.

**Status**: ✅ Done

---

### [REQ-008] Optimasi UI Mobile & UX Halaman Utama

**Deskripsi**: Perbaikan antarmuka untuk pengguna mobile (pelanggan scan QR):
1. **Popup Nama Pelanggan**: Form input nama muncul otomatis saat scan QR Code meja pertama kali.
2. **Sticky Navbar**: Navbar tetap menempel diatas saat scroll.
3. **Catatan Item**: Menambahkan input text catatan (notes) pada setiap item di keranjang.
4. **Tombol "Tambah Pesanan Lain"**: Memudahkan user menambah menu lagi sebelum checkout.
5. **Rename Tombol**: Mengubah label "Kirim ke Dapur" menjadi "Pesan Sekarang".

**User Story**: Sebagai pelanggan, saya ingin pengalaman memesan lewat HP yang lancar, intuitif, dan informatif.

**Status**: ✅ Done

---

### Template Request Baru

```markdown
### [REQ-XXX] Nama Fitur

**Deskripsi**: Penjelasan fitur

**User Story**: Sebagai [role], saya ingin [fitur], agar [manfaat]

**Acceptance Criteria**:
- [ ] Kriteria 1
- [ ] Kriteria 2

**Prioritas**: 🔴 High / 🟡 Medium / 🟢 Low

**Status**: 📋 Backlog / 🚧 In Progress / ✅ Done
```

---

> **Dokumen ini dibuat berdasarkan eksplorasi codebase KasPOS.**  
> Untuk panduan penggunaan bagi end-user, silakan lihat: **Manual Book - KasPOS**
