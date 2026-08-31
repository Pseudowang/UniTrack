

# Unitrack

[中文文档 (Chinese README)](./zhREADME.md)

Unitrack is an open-source UNIQLO product tracking app built with Next.js App Router. It helps users track product prices and stock changes, stores snapshots, computes diffs, and creates notifications for meaningful updates.

## Features

- User authentication (sign up, sign in, sign out)
- Track items by product URL/code
- Crawl one product or all tracked products via API routes
- Snapshot storage and diff-based change detection
- Notification pipeline (currently a pluggable placeholder)
- Dashboard for tracked items and activity

## Tech Stack

- Next.js 15 (App Router, TypeScript)
- React 19
- Prisma ORM (`SQLite` by default, PostgreSQL-compatible)
- NextAuth (Credentials provider)
- Tailwind CSS + shadcn-style UI components
- Zod for validation
- Vitest for unit tests

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create your `.env` file (for example by copying from `.env.example` if present), then set at least:

- `DATABASE_URL` (SQLite example: `file:./dev.db`)
- `NEXTAUTH_SECRET` (a secure random string)

Optional but recommended in production:

- `NEXTAUTH_URL` (your public app URL)

### 3. Initialize database

```bash
npm run db:push
npm run db:seed
```

The seed creates a demo account (`demo@unitrack.local` / `password123`).

### 4. Run in development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - Start development server (Turbopack)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run Vitest once
- `npm run db:push` - Sync Prisma schema to DB
- `npm run db:seed` - Run `prisma/seed.ts`
- `npm run db:studio` - Open Prisma Studio

## API Overview

- `POST /api/crawl/[productCode]` - Crawl tracked items for one product code
- `POST /api/crawl/all` - Crawl all tracked items
- `GET/POST /api/items` - List or create tracked items
- `DELETE /api/items/[id]` - Remove tracked item

Authentication APIs are under `app/api/auth/*`.

## Project Structure

```text
app/
  api/                 # API routes
  auth/                # Sign in / sign up pages
  dashboard/           # Authenticated dashboard
  items/new/           # Create tracked item page
components/            # Reusable UI and forms
lib/                   # Domain logic (crawl, scraper, diff, notify, auth)
prisma/                # Prisma schema, migrations, seed
```

## Testing

Current test coverage focuses on diff behavior:

```bash
npm run test
```

You can add more tests as `*.test.ts` or `*.test.tsx` next to source files.

## Security Notes

- Treat `/api/crawl/*` as privileged endpoints.
- Never commit `.env` files or secrets.
- Replace the placeholder notify flow in `lib/notify.ts` before production usage.

## Contributing

1. Fork the repo and create a feature branch.
2. Keep changes focused and include tests when possible.
3. Run `npm run test` before opening a PR.
4. Describe motivation, impact, and verification steps in your PR.

## License

No license is declared yet. Add a `LICENSE` file before publishing broadly.
