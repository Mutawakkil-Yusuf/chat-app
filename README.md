# Ripple

**Conversations that flow.** A modern realtime chat application — direct messages
and group conversations with presence, typing indicators, reactions, read receipts,
message editing, replies, search, and dark mode.

Built with **Vite + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui**, backed by
**Supabase** (Postgres + Realtime + Auth), and deployable to **Vercel**.

## Features

- Public marketing site (landing, features, about) with light/dark theme
- Email magic-link and Google sign-in (Supabase Auth)
- Direct and group conversations
- Realtime message delivery (Postgres changes)
- Online presence indicators
- Typing indicators
- Emoji reactions
- Read receipts and unread badges
- Edit, delete, and reply to messages
- Conversation and message search
- Light / dark / system theme
- Responsive, installable web app (PWA manifest) with safe-area and mobile polish
- Accessible components

## Routes

| Path         | Description                                  |
| ------------ | -------------------------------------------- |
| `/`          | Landing page (public)                        |
| `/features`  | Feature overview (public)                    |
| `/about`     | About the project (public)                   |
| `/login`     | Sign-in (Google or email magic link)         |
| `/chats`     | The chat app (requires authentication)       |


## Tech stack

| Layer      | Choice                                   |
| ---------- | ---------------------------------------- |
| Build      | Vite 7                                   |
| UI         | React 19, Tailwind CSS v4, shadcn/ui     |
| Routing    | React Router 7                           |
| Data       | TanStack Query, Supabase JS              |
| Backend    | Supabase (Postgres, Realtime, Auth)      |
| Forms      | React Hook Form + Zod                    |
| Testing    | Vitest + Testing Library                 |

## Getting started

### 1. Prerequisites

- Node.js 22+
- A Supabase project

### 2. Install

```bash
npm install
```

### 3. Configure environment

Copy the example file and fill in your project's values from the Supabase
dashboard (`Project Settings → API`):

```bash
cp .env.example .env.local
```

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key
```

### 4. Apply database migrations

Run the SQL in `supabase/migrations` against your project, in order, using the
Supabase SQL editor (or the Supabase CLI):

- `supabase/migrations/20260101000000_init.sql` — tables, row level security,
  triggers, and helper functions
- `supabase/migrations/20260101000001_realtime.sql` — Realtime publication
- `supabase/migrations/20260101000002_hardening.sql` — owner-only membership and
  conversation updates, retry-safe profile bootstrap

### 5. Enable auth providers

In `Authentication → Providers`:

- **Email** — enable magic links (default).
- **Google** — enable and supply a Client ID / Secret. Add your site URL and
  `http://localhost:5173` to the allowed redirect URLs.

> **Email confirmation.** By default Supabase requires users to confirm their
> email before a magic link signs them in. For quick local testing you can turn
> this off under `Authentication → Sign In / Providers → Email → Confirm email`.
> Leave it enabled in production.

### 6. Run

```bash
npm run dev
```

## Scripts

| Script                 | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start the dev server                 |
| `npm run build`        | Type-check and build for production  |
| `npm run preview`      | Preview the production build         |
| `npm run lint`         | Lint with ESLint                     |
| `npm run typecheck`    | Type-check only                      |
| `npm run test`         | Run unit tests                       |
| `npm run format`       | Format with Prettier                 |

## Deployment

The project includes a `vercel.json` with an SPA rewrite. Import the repository
into Vercel, set the two `VITE_SUPABASE_*` environment variables, and deploy. The
included GitHub Actions workflow (`.github/workflows/ci.yml`) runs lint,
type-check, tests, and a build on every push and pull request.

See [`docs/DEPLOY.md`](docs/DEPLOY.md) for the full manual walkthrough (history
purge, migrations, auth providers, Vercel, and key rotation).

## Project structure

```
src/
  components/    UI components (brand, chat, landing, profile, theme, ui)
  hooks/         Data and realtime hooks
  lib/           Supabase client, helpers, query keys
  providers/     Auth and app providers
  routes/        Page-level components
  types/         Database and domain types
public/          Brand icons and PWA manifest
supabase/
  migrations/    SQL migrations
```
