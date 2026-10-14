# Deployment

This document covers the manual steps required to take Chat App live. The app
code and CI are ready; the steps below need a Supabase account, a GitHub push
(with credentials), and a Vercel account.

## 1. Purge leaked secrets from git history

The original repository committed a `.env` containing a `REACT_APP_CHAT_ENGINE_KEY`
and a hardcoded Firebase config. The local `main` branch has been rebuilt as a
single fresh commit that removes them, but **the remote still contains the old
history** until you force-push.

From a machine with push access:

```bash
git push --force origin main
```

> This rewrites `origin/main`. Any open pull requests or dependabot branches
> based on the old history will need to be rebased or recreated.

### Revoke the old credentials

Purging history is not enough — the old values were public, so rotate them:

- ChatEngine: revoke/regenerate the project's private key.
- Firebase: rotate the web API key and any other exposed config in the Firebase
  console.

## 2. Apply database migrations

Run the SQL in `supabase/migrations` against your Supabase project, in order,
using the **SQL editor** (Dashboard → SQL Editor) or the Supabase CLI:

1. `supabase/migrations/20260101000000_init.sql`
   - Tables, enums, indexes, row level security policies, triggers, and helper
     functions (`get_my_conversations`, `start_direct_conversation`,
     `create_group_conversation`).
2. `supabase/migrations/20260101000001_realtime.sql`
   - Adds the tables to the `supabase_realtime` publication.

With the Supabase CLI linked, you can alternatively run `supabase db push`.

## 3. Configure authentication

In Dashboard → Authentication:

- **URL configuration**
  - Site URL: your production URL (e.g. `https://your-app.vercel.app`).
  - Redirect URLs: add `http://localhost:5173/**` and your production URL.
- **Email** — magic-link sign-in is enabled by default; no extra setup.
- **Google** — enable the provider and paste a Google OAuth Client ID/Secret.
  See the Supabase Google login guide for the authorized redirect URI to add in
  Google Cloud Console.

## 4. Deploy to Vercel

1. Import the GitHub repository into Vercel (framework auto-detected as Vite).
2. Add environment variables (Project → Settings → Environment Variables) for
   all environments:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy. `vercel.json` already configures the SPA rewrite so client-side
   routes resolve to `index.html`.

The anon key is safe to expose in the browser; all data access is protected by
the row level security policies in the migrations.

## 5. Verify

- Sign in with a magic link and with Google.
- Open two browser profiles and confirm realtime messages, presence, and typing
  indicators.
- Confirm unread badges, reactions, edit/delete/reply, and search.

## Continuous integration

`.github/workflows/ci.yml` runs lint, type-check, tests, and a build on every
push and pull request. No secrets are required for CI.
