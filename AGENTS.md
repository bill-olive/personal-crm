# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

This is a Next.js 16 (App Router) CRM application for 1stUp Health with Firebase backend (Auth, Firestore, Storage) and Cloud Functions. See `README.md` for full feature list and architecture.

### Running the app

- **Dev server**: `npm run dev` (port 3000)
- **Build**: `npm run build`
- **Lint**: `npm run lint` (ESLint; pre-existing warnings/errors exist in sidebar.tsx and functions/)
- **Functions build**: `cd functions && npm run build`

### Auth "open mode"

Without valid Firebase Admin credentials (private key), the middleware (`src/middleware.ts`) runs in **open mode** — all routes are accessible without authentication. The client SDK uses hardcoded demo fallback values. This means the full UI renders and is navigable, but Firestore data operations will fail without a real Firebase project.

### Environment variables

Copy `.env.local.example` to `.env.local`. For local dev without Firebase credentials, leave `FIREBASE_ADMIN*` vars empty — the app will run in open mode. Firebase client SDK has built-in demo fallbacks.

### Key gotchas

- The `functions/` directory has its own `package.json` and `node_modules`. Run `npm install` in both root and `functions/`.
- ESLint exits with code 1 due to pre-existing errors (React Compiler static-components warnings in `sidebar.tsx`, `prefer-const` in functions). This is expected.
- Next.js 16 shows a deprecation warning about "middleware" file convention — this is cosmetic and does not affect functionality.
- The project uses `npm` (not pnpm/yarn). Lockfile: `package-lock.json`.
