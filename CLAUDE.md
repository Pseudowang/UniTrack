# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Unitrack is a UNIQLO product tracking app that monitors price and stock changes. It crawls product data, stores snapshots, computes diffs, and creates notifications when meaningful changes occur.

**Tech Stack:** Next.js 15 (App Router), React 19, Prisma ORM (PostgreSQL/SQLite), NextAuth (Credentials), Tailwind CSS, Zod, Vitest

## Development Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Production build with Turbopack
npm run start            # Start production server

# Database
npm run db:push          # Sync Prisma schema to database
npm run db:seed          # Seed database with test data
npm run db:studio        # Open Prisma Studio

# Testing
npm run test             # Run Vitest tests once
```

## Environment Setup

Required environment variables (see `.env.example`):
- `DATABASE_URL` - Database connection (SQLite: `file:./dev.db`, PostgreSQL supported)
- `NEXTAUTH_SECRET` - Secure random string for NextAuth
- `NEXTAUTH_URL` - Public app URL (production only)

## Architecture

### Core Data Flow

1. **Crawl Pipeline** (`lib/crawl.ts`):
   - Fetches product data via `fetchProduct()` from scraper
   - Compares etag with latest snapshot to skip unchanged products
   - Creates new snapshot if etag differs
   - Runs diff comparison against previous snapshot
   - Creates ChangeEvent and Notification if meaningful changes detected

2. **Scraper** (`lib/scraper.ts`):
   - Fetches from UNIQLO API: `https://www.uniqlo.cn/data/products/prodInfo/zh_CN/{productCode}.json`
   - Falls back to mock data for testing/development
   - Generates etag hash from raw JSON for change detection
   - Returns normalized Product with price (in cents), stock status, SKUs

3. **Diff Engine** (`lib/diff.ts`):
   - Compares snapshots on: `title`, `priceCent`, `listPriceCent`, `inStock`
   - Returns change type: `created`, `updated`, or `none`
   - Produces structured diff payload with previous/current values

4. **Notification** (`lib/notify.ts`):
   - Currently a no-op placeholder
   - Logs to console in non-production
   - Replace with email/SMS provider before production use

### Database Schema

**Key Models:**
- `User` - Authentication (email + bcrypt password hash)
- `TrackedItem` - User's tracked products (unique per user+productCode)
- `ProductSnapshot` - Historical product data (unique per trackedItem+etag)
- `ChangeEvent` - Detected changes with diff payload
- `Notification` - Queued notifications (status: pending/sent/failed)

**Important Constraints:**
- `TrackedItem`: unique index on `[userId, productCode]`
- `ProductSnapshot`: unique index on `[trackedItemId, etag]` prevents duplicate snapshots

### API Routes

**Crawl Endpoints (privileged - add auth before production):**
- `POST /api/crawl/[productCode]` - Crawl all tracked items for one product code
- `POST /api/crawl/all` - Crawl all tracked items for all users

**Item Management:**
- `GET /api/items` - List user's tracked items
- `POST /api/items` - Create new tracked item
- `DELETE /api/items/[id]` - Remove tracked item

**Authentication:**
- NextAuth routes at `/api/auth/*`
- Credentials provider with bcrypt password hashing
- JWT session strategy

## Key Patterns

### Product Code Handling
- Product codes can be extracted from UNIQLO URLs or used directly
- Helper: `extractProductCode(url)` in `lib/product-code.ts`
- API product codes (e.g., "u0000000000123") are normalized

### Price Storage
- All prices stored as cents (integer) to avoid floating-point issues
- Convert: `yuanToCent()` in scraper, display with `/100`

### Etag-Based Change Detection
- Etag is MD5 hash of raw product JSON
- Prevents redundant snapshots when product data unchanged
- Crawl skips if latest snapshot etag matches fetched etag

### Diff-Based Notifications
- Snapshots stored even if etag changes
- ChangeEvent only created if diff detects meaningful field changes
- Avoids notification spam from irrelevant API response variations

## Testing

Tests focus on diff behavior (`lib/__tests__/diff.test.ts`). Run with `npm run test`.

When adding features:
- Add tests for new diff fields or comparison logic
- Test crawl pipeline edge cases (missing data, API failures)
- Validate Zod schemas in `lib/validators.ts`

## Security Notes

- `/api/crawl/*` endpoints are currently unprotected - add authentication before production
- Never commit `.env` files
- `lib/notify.ts` is a placeholder - implement proper notification delivery before production use
