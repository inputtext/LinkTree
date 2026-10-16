# LinkSpace v0.2 deployment checklist

Repository: https://github.com/inputtext/LinkTree

## Local sync (Windows / Antigravity)

Stop `npm run dev` with Ctrl+C, then from the folder containing `package.json`:

```powershell
git status
git pull --ff-only origin main
npm install
npm run test
npm run typecheck
npm run lint
npm run build
npm run dev
```

If `git status` shows uncommitted edits, commit or stash them before pulling. Keep your existing `.env.local`; do not commit it. Use Node.js 22+.

## Dedicated database

Create a NEW Supabase project for LinkSpace. Apply SQL migrations in order:

1. `supabase/migrations/20261016000000_initial_linkspace.sql`
2. `supabase/migrations/20261016193000_atomic_publication.sql`

Configure Supabase Auth URL and redirect allowlist (`http://localhost:3000/auth/callback` for local development). Add real values to `.env.local` for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY` (server only). Never share or commit the secret key.

The atomic publication functions require the second migration. Test with two accounts, verify cross-user RLS isolation, stale-draft handling, publishing, unpublishing and redirects.

## Staging

Import `inputtext/LinkTree` in Vercel as a Next.js project with repository root as the project root. Set project environment variables in Vercel; never commit secrets. Enable the correct Supabase callback URL for the deployed HTTPS domain. Use staging first. Production forms require Turnstile.

## Validation and limits

The source-only publication checks and avatar signature checks do NOT constitute a live database integration test. Do not launch publicly until a clean CI build, real authenticated E2E tests, database security review and dependency audit succeed.
