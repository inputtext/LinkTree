# LinkSpace ✳

**A creator-focused, original link-in-bio platform.** Next.js App Router + TypeScript + Supabase + PostgreSQL + dnd-kit. Visual design is inspired by editorial minimalism. No source code or brand assets were copied from Linklee.

> **Release status: pre-production source / integration pending.** UI, APIs and schema are implemented, but this environment did not have registry access to install dependencies, and no dedicated Supabase project has been provisioned or production build verified. Do not consider it fully deployed or production-hardened yet.

## Running locally

Prerequisites: Node.js 22+, npm, a **new, separate** Supabase project, access to that project's SQL editor.

```bash
cp .env.example .env.local
npm install
npm run dev
```

1. Run `supabase/migrations/20261016000000_initial_linkspace.sql` on the new project's SQL editor, or via your reviewed Supabase migration workflow. Never apply this to an unrelated project.
2. Configure Auth email confirmation and redirect allowlist (for local development: `http://localhost:3000/auth/callback`).
3. Fill `.env.local` from project settings: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, server-only `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`). **Never commit this file or expose the service key to the browser.**
4. Optional analytics hashing: set a long random `ANALYTICS_HASH_KEY` for per-day visitor estimates.
5. Public forms require Cloudflare Turnstile in production: set `TURNSTILE_SECRET_KEY` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. Configure widget domains. Without the secret, forms intentionally return `503` in production.
6. Register, claim a handle, create blocks, save and publish. Public URLs are `/your-handle`, not wildcard subdomains yet.

## Quality checks

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

An `npm install` should generate `package-lock.json`; check it into version control, then use `npm ci` on subsequent clean builds. CI requires that committed lockfile. Next steps and missing features are described in [docs/ROADMAP.md](docs/ROADMAP.md).

## Deploy

Recommended: connect this repository to **Vercel**, framework Next.js, Node.js 22, build command `npm run build`. Set each environment variable for production; set `NEXT_PUBLIC_SITE_URL` to the actual HTTPS deployment domain. Add `https://YOUR_DOMAIN/auth/callback` to Supabase Auth's redirect allowlist. Configure Turnstile domain, run RLS and end-to-end tests before allowing real users.

GitHub Actions CI is provided at `.github/workflows/ci.yml`. Do not deploy until CI succeeds and the migrations/secret configuration are tested end-to-end. Vercel, Supabase and any provider may incur charges, so confirm plan details first.

## More documentation

- [Reference research and comparisons](docs/REFERENCE_RESEARCH.md)
- [Architecture, schema, trust boundaries and known limitations](docs/ARCHITECTURE.md)
- [Implementation and security backlog](docs/ROADMAP.md)
- [Actual validation results](docs/VALIDATION.md)

## Local source verification for this package

- Native Node test suite: 8 tests passing as checked on 2026-10-16.
- Global TypeScript parser: 41 source TS/TSX modules passed syntax transpilation.
- Full TypeScript type checking, linting, dependency audit, Next.js production build and browser E2E: **not run successfully** (npm registry DNS unavailable in environment).
- No real database migrations, auth sessions, forms, redirect analytics, or deployed URLs were tested in a live provider project.
