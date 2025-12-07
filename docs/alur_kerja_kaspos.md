# Alur Kerja Sistem KasPOS - Dokumentasi Lengkap

Dokumentasi ini menjelaskan alur kerja sistem **KasPOS** secara komprehensif, mencakup seluruh role dan modul dari **Front Office** hingga **Back Office**.

---

## 📊 Overview Sistem

KasPOS adalah sistem Point of Sale (POS) berbasis Laravel + React/Inertia dengan fitur:

```mermaid
graph TB
    subgraph "FRONT OFFICE"
        PELANGGAN[👤 Pelanggan]
        KASIR[💵 Kasir]
        WAITER[🍽️ Waiter]
        KITCHEN[👨‍🍳 Kitchen]
    end
    
    subgraph "BACK OFFICE"
        ADMIN[👑 Super Admin]
        MANAGER[📊 Manager]
        INVENTORY[📦 Inventory Staff]
        FINANCE[💰 Finance]
    end
    
    subgraph "SISTEM"
        POS[🖥️ POS System]
        KDS[📺 Kitchen Display]
        DASHBOARD[📈 Dashboard]
        REPORTS[📄 Reports]
    end
    
    PELANGGAN --> POS
    KASIR --> POS
    WAITER --> POS
    POS --> KDS
    KDS --> KITCHEN
    ADMIN --> DASHBOARD
    MANAGER --> REPORTS
    INVENTORY --> DASHBOARD
    FINANCE --> REPORTS
```

---

## 🎯 FRONT OFFICE

### 1. 👤 Pelanggan (Customer)

#### Alur Kerja Self-Order (via QR Code Meja)

```mermaid
sequenceDiagram
    participant P as Pelanggan
    participant QR as QR Code Meja
    participant S as Sistem
    participant K as Kitchen
    
    P->>QR: Scan QR Code di meja
    QR->>S: Redirect ke /table/{table_id}
    S->>P: Tampilkan menu katalog
    P->>S: Pilih menu & tambah ke cart
    P->>S: Submit pesanan
    S->>S: Buat TransactionKitchen record
    S->>K: Kirim ke Kitchen Display
    Note over P,K: Pelanggan menunggu pesanan
```

**Akses Fitur:**
| Fitur | Lokasi | Deskripsi |
|-------|--------|-----------|
| Lihat Menu | `/` atau `/table/{id}` | Browse kategori & produk |
| Tambah ke Cart | Frontend | Pilih item, qty, varian |
| Submit Order | `HomeController@store` | Buat transaksi pending |
| Lihat Status | - | Update dari Kitchen |

---

### 2. 💵 Kasir (Cashier)

#### Alur Kerja Shift Kasir

```mermaid
sequenceDiagram
    participant K as Kasir
    participant POS as POS System
    participant S as Shift System
    
    K->>POS: Login ke sistem
    POS->>K: Cek status shift
    alt Belum buka shift
        K->>S: Buka Shift Kasir
        K->>S: Input modal awal
        S->>POS: Shift aktif
    end
    Note over K,POS: Mulai melayani transaksi
    K->>S: Tutup Shift
    S->>S: Hitung total penjualan
    S->>K: Laporan shift (modal + penjualan - pengeluaran)
```

**Alur Transaksi Penjualan:**

```mermaid
flowchart TD
    A[Buka POS] --> B{Ada transaksi pending?}
    B -->|Ya| C[Ambil dari Pending List]
    B -->|Tidak| D[Buat transaksi baru]
    
    C --> E[Tampilkan cart]
    D --> E
    
    E --> F[Tambah item ke cart]
    F --> G{Semua item?}
    G -->|Belum| F
    G -->|Sudah| H[Apply Discount/Coupon]
    
    H --> I[Pilih metode bayar]
    I --> J{Metode?}
    J -->|Cash| K[Input nominal bayar]
    J -->|Transfer/QRIS| L[Pilih bank account]
    
    K --> M[Proses pembayaran]
    L --> M
    
    M --> N[Simpan transaksi]
    N --> O[Cetak struk]
    O --> P{Kirim ke Kitchen?}
    P -->|Ya| Q[Send to Kitchen Display]
    P -->|Tidak| R[Selesai]
    Q --> R
```

**Akses Fitur Kasir:**
| Fitur | Route | Controller Method |
|-------|-------|-------------------|
| Buka POS | `/pos` | `PosController@index` |
| Buka Shift | `/pos/open-cashier-shift` | `PosController@openCashierShift` |
| Tutup Shift | `/pos/close-cashiers` | `PosController@closeCashierShift` |
| Proses Transaksi | `/pos` (POST) | `PosController@store` |
| Cari produk barcode | `/pos/products/search-barcode` | `PosController@searchByBarcode` |
| Pending Transactions | `/pos/pending-transactions` | `PosController@pendingTransaction` |
| History Transactions | `/pos/history-transactions` | `PosController@historyTransaction` |
| Cetak Struk | `/pos/print-receipt` | `PosController@receipt` |
| Kirim ke Kitchen | `/pos/send-kitchen` | `PosController@sendKitchen` |
| Buka Meja | `/pos/update-table` | `PosController@openTable` |
| Discount per Item | `/pos/discount-per-item` | `PosController@discountPerItem` |

---

### 3. 🍽️ Waiter

Waiter berinteraksi dengan sistem melalui POS untuk:

```mermaid
flowchart LR
    W[Waiter] --> A[Buka/Assign Meja]
    W --> B[Input Pesanan Customer]
    W --> C[Kirim ke Kitchen]
    W --> D[Update Status Meja]
    
    A --> E[tables.open-tables]
    B --> F[POS Transaction]
    C --> G[Kitchen Display]
    D --> H[Table Management]
```

**Fitur Khusus Waiter:**
- Assign meja ke transaksi
- Input pesanan pelanggan
- Kirim pesanan ke Kitchen Display
- Monitor status pesanan

---

### 4. 👨‍🍳 Kitchen (Dapur)

#### Alur Kerja Kitchen Display System (KDS)

```mermaid
sequenceDiagram
    participant POS as POS/Kasir
    participant KDS as Kitchen Display
    participant COOK as Koki
    
    POS->>KDS: Pesanan baru masuk
    KDS->>KDS: Tampilkan dengan status "pending"
    COOK->>KDS: Mulai masak - Update "cooking"
    COOK->>KDS: Selesai - Update "done"
    KDS->>POS: Notifikasi pesanan siap
```

**Kitchen Display Interface:**

| Status | Warna | Aksi |
|--------|-------|------|
| `pending` | 🟡 Kuning | Menunggu diproses |
| `cooking` | 🔵 Biru | Sedang dimasak |
| `done` | 🟢 Hijau | Siap disajikan |
| `cancelled` | 🔴 Merah | Dibatalkan |

**Akses Fitur Kitchen:**
| Fitur | Route | Controller Method |
|-------|-------|-------------------|
| Kitchen Display | `/kitchen` | `TransactionKitchenController@index` |
| List Orders | `/kitchen/list-orders` | `TransactionKitchenController@listOrders` |
| Update Status | `/kitchen/{id}/update` | `TransactionKitchenController@update` |

---

## 🏢 BACK OFFICE

### 5. 👑 Super Admin

Super Admin memiliki akses penuh ke seluruh sistem.

#### Alur Kerja Harian Super Admin

```mermaid
graph TD
    A[Login] --> B[Dashboard]
    B --> C{Pilih Aktivitas}
    
    C --> D[Kelola Users & Roles]
    C --> E[Kelola Produk & Stok]
    C --> F[Kelola Keuangan]
    C --> G[Lihat Reports]
    C --> H[Settings Toko]
    
    D --> D1[CRUD Users]
    D --> D2[CRUD Roles]
    D --> D3[CRUD Permissions]
    
    E --> E1[Products]
    E --> E2[Categories]
    E --> E3[Materials/Bahan]
    E --> E4[Stock Opname]
    
    F --> F1[Transactions]
    F --> F2[Expenses]
    F --> F3[Orders/Pembelian]
    
    G --> G1[Sales Report]
    G --> G2[Stock Report]
    G --> G3[Cash Flow]
    G --> G4[Profit/Loss]
    
    H --> H1[Store Info]
    H --> H2[Bank Accounts]
    H --> H3[Shift Settings]
    H --> H4[Customer Loyalty]
```

**Akses Lengkap Super Admin:**

| Modul | Routes | Deskripsi |
|-------|--------|-----------|
| Dashboard | `/dashboard` | Analytics & overview |
| Users | `/users/*` | Kelola akun pengguna |
| Roles | `/roles/*` | Kelola role & hak akses |
| Permissions | `/permissions/*` | Kelola permission |
| Products | `/products/*` | Kelola produk |
| Categories | `/categories/*` | Kelola kategori |
| Suppliers | `/suppliers/*` | Kelola supplier |
| Materials | `/materials/*` | Kelola bahan baku |
| Checking Stocks | `/checking-stocks/*` | Stock opname |
| Orders | `/orders/*` | Purchase orders ke supplier |
| Transactions | `/transactions/*` | Transaksi penjualan |
| Expenses | `/expenses/*` | Kelola pengeluaran |
| Reports | `/reports/*` | Berbagai laporan |
| Settings | `/setting-stores/*` | Pengaturan toko |
| Audit Logs | `/audit-logs/*` | Log aktivitas sistem |

---

### 6. 📊 Manager / Supervisor

#### Fokus Utama: Monitoring & Reporting

```mermaid
flowchart TD
    M[Manager Login] --> D[Dashboard]
    
    D --> A[📈 Lihat Statistik Penjualan]
    D --> B[📉 Monitor Stok Rendah]
    D --> C[💰 Review Expenses]
    D --> E[📊 Generate Reports]
    
    A --> A1[Daily Sales]
    A --> A2[Monthly Trends]
    A --> A3[Top Products]
    
    B --> B1[Low Stock Alert]
    B --> B2[Request Purchase Order]
    
    E --> E1[Sales Report]
    E --> E2[Stock Report]
    E --> E3[Cash Flow Report]
    E --> E4[Profit/Loss Report]
```

**Dashboard Analytics:**
- Total penjualan (harian/bulanan)
- Top 10 produk terlaris
- Stok rendah (low stock alerts)
- Grafik penjualan per kategori
- Perbandingan month-over-month

**Reports Available:**
| Report | Route | Deskripsi |
|--------|-------|-----------|
| Cash Flow | `/reports/cash-flow` | Arus kas masuk/keluar |
| Purchase | `/reports/purchase` | Laporan pembelian |
| Sales | `/reports/sale` | Laporan penjualan |
| Stock | `/reports/stock` | Laporan stok |
| Card Stock | `/reports/card-stock` | Kartu stok per item |
| Profit/Loss | `/reports/profit-loss` | Laporan laba rugi |

---

### 7. 📦 Inventory / Gudang

#### Alur Kerja Inventory Staff

```mermaid
flowchart TD
    I[Inventory Staff] --> A[Kelola Stok]
    
    A --> B[Stock Opname]
    A --> C[Purchase Orders]
    A --> D[Purchase Returns]
    A --> E[Material Management]
    
    B --> B1[Buat Checking Stock]
    B1 --> B2[Hitung Fisik]
    B2 --> B3[Input Selisih]
    B3 --> B4[Adjustment Stok]
    
    C --> C1[Buat PO ke Supplier]
    C1 --> C2[Terima Barang]
    C2 --> C3[Update Stok]
    
    D --> D1[Return Barang Rusak]
    D1 --> D2[Kurangi Stok]
    
    E --> E1[Track Bahan Baku]
    E1 --> E2[Recipe Management]
```

**Akses Fitur Inventory:**
| Fitur | Route | Deskripsi |
|-------|-------|-----------|
| Products | `/products` | Lihat & kelola produk |
| Materials | `/materials` | Bahan baku & stok |
| Checking Stocks | `/checking-stocks` | Stock opname |
| Purchase Orders | `/orders` | Pembelian ke supplier |
| Purchase Returns | `/purchase-returns` | Retur pembelian |
| Suppliers | `/suppliers` | Data supplier |

---

### 8. 💰 Finance / Keuangan

#### Alur Kerja Finance Staff

```mermaid
flowchart TD
    F[Finance Staff] --> A[Input Transaksi]
    F --> B[Kelola Expenses]
    F --> C[Generate Reports]
    
    A --> A1[Review Transactions]
    A --> A2[Process Payments]
    A --> A3[Handle Returns]
    
    B --> B1[Create Expense Categories]
    B --> B2[Input Daily Expenses]
    B --> B3[Approve Expenses]
    
    C --> C1[Cash Flow Report]
    C --> C2[Profit/Loss Statement]
    C --> C3[Sales Summary]
    C --> C4[Export to Excel]
```

**Struktur Expense Management:**
```
📁 Expense Categories
├── 📂 Operasional
│   ├── Listrik
│   ├── Air
│   └── Internet
├── 📂 Gaji
│   ├── Karyawan Tetap
│   └── Part-time
├── 📂 Supplies
│   ├── Bahan Baku
│   └── Packaging
└── 📂 Marketing
    ├── Ads
    └── Promo
```

**Akses Fitur Finance:**
| Fitur | Route | Deskripsi |
|-------|-------|-----------|
| Transactions | `/transactions` | Review transaksi |
| Transaction Returns | `/transaction-returns` | Proses retur |
| Expenses | `/expenses` | Input pengeluaran |
| Expense Categories | `/expense-categories` | Kategori pengeluaran |
| Expense Subcategories | `/expense-subcategories` | Sub-kategori |
| Cash Flow Report | `/reports/cash-flow` | Arus kas |
| Profit/Loss | `/reports/profit-loss` | Laba rugi |

---

## 🔄 Alur Transaksi End-to-End

### Complete Transaction Flow

```mermaid
flowchart TB
    subgraph "1. ORDER PHASE"
        A[Customer/Kasir] --> B[Pilih Produk]
        B --> C[Add to Cart]
        C --> D{Discount?}
        D -->|Ya| E[Apply Coupon/Discount]
        D -->|Tidak| F[Review Cart]
        E --> F
    end
    
    subgraph "2. PAYMENT PHASE"
        F --> G[Pilih Payment Method]
        G --> H{Method Type}
        H -->|Cash| I[Input Cash Amount]
        H -->|Transfer| J[Select Bank]
        H -->|QRIS| J
        I --> K[Calculate Change]
        J --> K
        K --> L[Submit Payment]
    end
    
    subgraph "3. KITCHEN PHASE"
        L --> M{Food Item?}
        M -->|Ya| N[Send to Kitchen]
        N --> O[Kitchen Display]
        O --> P[Cook Prepares]
        P --> Q[Mark as Done]
        M -->|Tidak| R[Ready for Pickup]
        Q --> R
    end
    
    subgraph "4. COMPLETION PHASE"
        R --> S[Print Receipt]
        S --> T[Update Stock]
        T --> U[Add Customer Points]
        U --> V[Transaction Complete]
    end
```

---

## 📱 Fitur Tambahan

### Discount & Promo System

```mermaid
graph LR
    D[Discount Types] --> A[Coupon]
    D --> B[Discount Package]
    D --> C[Discount Product]
    
    A --> A1[Code-based discount]
    B --> B1[Bundle deals]
    C --> C1[Per-product discount]
    C --> C2[Customer-specific discount]
```

| Tipe | Route | Deskripsi |
|------|-------|-----------|
| Coupon | `/coupons` | Kode promo |
| Discount Package | `/discount-packages` | Paket bundling |
| Discount Product | `/discount-products` | Diskon per produk |

---

### Customer Loyalty Program

```mermaid
flowchart LR
    T[Transaction] --> P[Calculate Points]
    P --> C[Add to Customer]
    C --> R[Redeem Points]
    R --> D[Get Discount]
```

---

### Table Management (Resto/Cafe)

```mermaid
graph TD
    T[Tables] --> S{Status}
    S -->|Available| A[🟢 Kosong]
    S -->|Occupied| B[🔴 Terisi]
    S -->|Reserved| C[🟡 Dipesan]
    
    A --> QR[Generate QR Code]
    QR --> SCAN[Customer Scan]
    SCAN --> ORDER[Self Order]
    ORDER --> B
```

---

## 🔐 Role & Permission Matrix

| Role | Dashboard | POS | Kitchen | Products | Orders | Transactions | Reports | Settings | Users |
|------|:---------:|:---:|:-------:|:--------:|:------:|:------------:|:-------:|:--------:|:-----:|
| Super Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manager | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Kasir | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Kitchen | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Inventory | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Finance | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |

---

## 📁 Struktur Data Utama

### Entity Relationship Overview

```mermaid
erDiagram
    USER ||--o{ TRANSACTION : creates
    USER ||--o{ CASHIER_SHIFT : opens
    CASHIER_SHIFT ||--o{ TRANSACTION : contains
    TRANSACTION ||--o{ TRANSACTION_DETAIL : has
    TRANSACTION_DETAIL }o--|| PRODUCT : references
    TRANSACTION ||--o{ TRANSACTION_KITCHEN : sends
    TRANSACTION_KITCHEN ||--o{ TRANSACTION_KITCHEN_ITEM : contains
    TRANSACTION ||--o| TABLE : uses
    TRANSACTION ||--o| CUSTOMER : belongs_to
    CUSTOMER ||--o{ CUSTOMER_POINT : earns
    PRODUCT }o--|| CATEGORY : belongs_to
    PRODUCT ||--o{ PRODUCT_VARIANT : has
    PRODUCT }o--|| UNIT : uses
    ORDER ||--o{ ORDER_DETAIL : has
    ORDER }o--|| SUPPLIER : from
    ORDER_DETAIL }o--|| MATERIAL : references
    EXPENSE }o--|| EXPENSE_SUBCATEGORY : categorized
    EXPENSE_SUBCATEGORY }o--|| EXPENSE_CATEGORY : belongs_to
```

---

## 📝 Kesimpulan

Sistem KasPOS mengintegrasikan:

1. **Front Office**: Operasional harian dengan POS, Kitchen Display, dan self-ordering
2. **Back Office**: Manajemen inventory, keuangan, dan reporting
3. **Role-based Access**: Kontrol akses berdasarkan role pengguna
4. **Real-time Updates**: Kitchen Display System untuk koordinasi dapur
5. **Comprehensive Reporting**: Laporan lengkap untuk analisis bisnis

Setiap role memiliki workflow yang terintegrasi untuk memastikan operasional bisnis berjalan lancar dari pesanan hingga pelaporan keuangan.
