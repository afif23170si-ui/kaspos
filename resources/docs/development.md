# Development Guide

## Local Setup

```bash
# Backend Dependencies
composer install

# Frontend Dependencies
npm install

# Run Development Server
npm run dev
php artisan serve
```

## Production Build

```bash
npm run build
```

## Bug Log & Issues

### Fixed Issues
- **[BUG-000] Halaman Blank**: Fixed by running `npm install && npm run build`.
- **[BUG-001] Browser Print Blur**: Reverted to standard font for printing.
- **[BUG-002] Kitchen Auto-Print**: Separated print trigger from "Selesai" button.

### Known Limitations
- Bluetooth printing requires HTTPS context or localhost.
- Kitchen Display auto-refresh depends on client-side polling (30s).
