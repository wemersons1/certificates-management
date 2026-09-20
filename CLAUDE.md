# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Full-stack certificate management platform built with Laravel 12 (PHP 8.3) backend, React 18 + TypeScript frontend, and a Node.js PDF renderer microservice using Playwright.

## Development Commands

### Full Dev Stack
```bash
composer dev        # Starts PHP server, queue worker, logs, and Vite concurrently
composer dev:ssr    # Same with SSR support
```

### Frontend
```bash
npm run dev          # Vite dev server only
npm run build        # Production build
npm run lint         # ESLint with auto-fix
npm run format       # Prettier formatting
npm run format:check # Check formatting (no changes)
npm run types        # TypeScript type check
```

### Backend
```bash
php artisan test                  # Run PHPUnit tests
composer test                     # Clear config cache then run tests
php artisan migrate               # Run migrations
php artisan horizon               # Start queue dashboard
```

### Docker
```bash
docker-compose up -d   # Start all services (Laravel, MySQL, Redis, PDF renderer)
docker-compose down    # Stop services
```

## Initial Setup

```bash
cp .env.example .env
composer install
npm install
php artisan key:generate
touch database/database.sqlite   # SQLite for local dev
php artisan migrate
composer dev
```

Key env vars to configure: `VITE_API_URL`, `VITE_MERCADOPAGO_PUBLIC_KEY`, `AWS_*` (S3/SES), `DB_*`.

## Architecture

### Backend (`app/`)
Laravel REST API exposing 100+ endpoints in `routes/api.php`. Business logic is split into 22+ service classes under `app/Services/`. Controllers are thin and delegate to services. Async work is handled via jobs in `app/Jobs/` with a database-backed queue monitored by Laravel Horizon.

Notable: `app/Helpers/`, `app/Traits/`, `app/Observers/`, and `app/Enums/` for shared utilities. Model observers handle side-effects on CRUD events.

### Frontend (`resources/js/src/`)
SPA mounted in `resources/js/src/main.tsx`. Routing via React Router DOM. Global state split between `AppContext` (context API) and Redux (`redux/` store). i18n via `react-i18next`. Components are in `components/`, pages in `pages/` (27+).

Code style: Prettier with `tabWidth: 4`, `printWidth: 150`.

### PDF Renderer (`pdf-renderer/`)
Standalone Express + Playwright Node.js service running on port 3000. Converts HTML templates to PDFs. Has its own `package.json` and Dockerfile.

### Deployment
GitHub Actions workflow at `.github/workflows/main.yml` deploys to AWS EC2 via SSH. Post-deploy runs migrations and `artisan optimize`. Nginx reverse-proxies to Laravel Sail.

## Key Integrations
- **Payments**: MercadoPago SDK
- **Storage**: AWS S3
- **Email**: AWS SES
- **Auth**: Laravel Sanctum + social auth (Google, LinkedIn)
- **Cache/Sessions**: Redis
- **PDF generation**: Playwright (via pdf-renderer service)
