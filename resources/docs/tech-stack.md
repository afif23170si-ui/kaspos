# Tech Stack & Architecture

## Backend

- **Framework**: Laravel 12.x (PHP 8.2)
- **Database**: MySQL
- **SPA Routing**: Inertia.js 2.0
- **Key Packages**:
  - `barryvdh/laravel-dompdf`: PDF generation
  - `mike42/escpos-php`: Thermal printing
  - `spatie/laravel-permission`: RBAC
  - `spatie/laravel-activitylog`: Audit logging

## Frontend

- **Library**: React 19.x
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 4.x
- **Build Tool**: Vite 6.x
- **UI Components**: Radix UI, Headless UI, Lucide React
- **Utils**: `date-fns`, `recharts`, `sonner`

## System Architecture

KasPOS menggunakan arsitektur Monolithic Modern dengan Inertia.js sebagai jembatan antara Laravel (Backend) dan React (Frontend).

- **Client**: React Components (Pages/Layouts)
- **Server**: Laravel Controllers & Models
- **Printing**: Direct connection (USB/Network) & Web Bluetooth API
