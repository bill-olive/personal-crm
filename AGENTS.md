# AGENTS.md

## Overview

Personal CRM — a full-stack contact management web app built with Next.js 15 (App Router), TypeScript, Prisma (SQLite), and Tailwind CSS v4.

## Cursor Cloud specific instructions

### Services

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| Next.js dev server | `npm run dev` | 3000 | Main app; hot-reloads on file changes |

No external services (databases, caches, etc.) are required — the app uses SQLite via Prisma, stored at `prisma/dev.db`.

### Common commands

See `package.json` scripts. Key ones:

- **Dev server**: `npm run dev`
- **Lint**: `npm run lint`
- **Test**: `npm test`
- **Build**: `npm run build`
- **DB generate**: `npm run db:generate` (after schema changes)
- **DB push**: `npm run db:push` (apply schema to SQLite)
- **DB seed**: `npm run db:seed` (populate sample data)

### Gotchas

- After changing `prisma/schema.prisma`, run `npx prisma generate && npx prisma db push` to sync the client and database.
- The SQLite database file (`prisma/dev.db`) is git-ignored. On a fresh clone, run `npx prisma db push` to create it, then optionally `npm run db:seed` for sample data.
- `next lint` shows a deprecation warning about being removed in Next.js 16. It still works correctly.
