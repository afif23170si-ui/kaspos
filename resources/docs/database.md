# Database Schema

## Overview

Total **48 Models** dan **69 Migrations**.

## Modul Utama

| Modul | Tabel Utama |
|-------|-------------|
| **Auth** | `users`, `roles`, `permissions` |
| **Products** | `products`, `categories`, `units`, `product_variants` |
| **Inventory** | `materials`, `stocks`, `stock_movements`, `checking_stocks` |
| **POS** | `transactions`, `transaction_details`, `transaction_payments` |
| **Kitchen** | `transaction_kitchens`, `transaction_kitchen_items` |
| **Settings** | `settings`, `bank_accounts`, `shifts` |

> **Note**: Untuk diagram ERD visual, silakan refer ke file `database_schema.dbml` atau generate menggunakan tool DBML.
