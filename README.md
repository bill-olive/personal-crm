# personal-crm

A Personal CRM for managing your contacts — built with Next.js, TypeScript, Prisma, and Tailwind CSS.

## Getting Started

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

Optionally seed sample data:

```bash
npm run db:seed
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest tests |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed sample contacts |

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: SQLite via Prisma ORM
- **Styling**: Tailwind CSS v4
