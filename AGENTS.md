# Repository Guidelines

## Project Structure & Module Organization
- `app/` hosts the Next.js routes, layouts, and server components. Dashboard logic lives in `app/dashboard/`, while API handlers sit under `app/api/` (e.g., `app/api/crawl/[productCode]`).
- `components/` provides reusable client components such as action buttons and navigation; `components/ui/` mirrors ShadCN-style building blocks.
- Data access and domain helpers are in `lib/` (`lib/crawl.ts`, `lib/scraper.ts`, `lib/product-code.ts`). Prisma models reside in `prisma/schema.prisma`, and seeds live at `prisma/seed.ts`.
- Static assets go in `public/`; global styles and Tailwind layers are defined in `app/globals.css` and `tailwind.config.ts`.

## Build, Test, and Development Commands
- `npm run dev` – launches the Next.js dev server with Turbopack.
- `npm run build` / `npm run start` – produce and serve the production bundle.
- `npm run test` – executes the Vitest suite once; add `--watch` locally when iterating.
- Database helpers: `npm run db:push` syncs the Prisma schema, `npm run db:seed` populates fixtures, and `npm run db:studio` opens Prisma Studio for manual inspection.

## Coding Style & Naming Conventions
- TypeScript + React with functional components. Use ES modules and named exports unless a default export is idiomatic for Next.js routes/pages.
- Indent TypeScript/TSX with two spaces and prefer descriptive camelCase identifiers (`buildProductImageUrl`).
- Tailwind classes convey styling; reach for semantic tokens (`text-muted-foreground`) and shared helpers like `cn()`.
- When forcing backgrounds (e.g., white cards), add `card-on-white` to keep CSS variables in sync.

## Testing Guidelines
- Vitest is configured in `vitest.config.ts`. Place unit tests alongside their source as `*.test.ts` or `*.test.tsx`.
- Mock external calls (e.g., `fetchProduct`) to avoid hitting Uniqlo endpoints. Aim to cover data mapping, diffing, and crawl flows before UI behavior.

## Commit & Pull Request Guidelines
- Write imperative, present-tense commits under ~72 characters, e.g., `Add crawler diff logging`.
- Each PR should describe the motivation, summarize functional impact, list testing evidence (`npm run test`, manual steps), and attach screenshots or GIFs for UI-facing work.
- Link related issues or tasks and call out migrations or env changes explicitly.

## Security & Configuration Tips
- Required env vars include `DATABASE_URL`, auth secrets, and any third-party keys; do not commit `.env` files.
- Treat the `/api/crawl/*` routes as privileged: ensure only authenticated sessions trigger them and never log raw credentials or cookies.
