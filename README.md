# 🌸 Bloom

A habit tracker where your habits grow a garden. Complete habits to earn XP and coins, level up, unlock achievements, shop for plants and decorations, and watch your statistics grow.

**Live demo:** https://bloom-project-dun.vercel.app/

## Features

- Habit management with streaks, XP and levels
- A living garden with plants, decorations and seasons
- Achievements, coin shop and inventory
- Statistics: heatmap, completion trends and insights
- Email/password sign-up, with optional Google and GitHub login

## Tech stack

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion, Auth.js v5, Drizzle ORM, PostgreSQL (Neon).

## Run locally

```bash
git clone https://github.com/ayonitis/bloom-project.git
cd bloom-project
npm install
```

Copy `.env.example` to `.env.local` and fill in your values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` | Random secret (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Optional |

Set up the database, then start the app:

```bash
npm run db:migrate
npm run db:seed-achievements
npm run db:seed-inventory
npm run dev
```

Open http://localhost:3000.

## Demo login (local development only)

Running `npm run db:seed` creates a test account with sample habits and history:

| Email | Password |
|---|---|
| `dev@bloom.local` | `bloom-dev-password` |

> ⚠️ This account exists only in a local database where you ran `db:seed`. It is **not** available on the live site. On the live demo, create your own account via sign-up. Never run `db:seed` against a production database.

## Deploy

Deployed on Vercel. Set `DATABASE_URL` and `AUTH_SECRET` in the project's Environment Variables, run the migration and seed commands once against the production database, and every push to `main` redeploys automatically.

## Security

Secrets are never committed. `.env*` files are git-ignored, and only `.env.example` is tracked.
