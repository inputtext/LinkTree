# Architecture and trust boundaries

Browser -> Next.js App Router (React/SSR and route handlers) -> Supabase Auth/Postgres/Storage.

Anonymous users read ONLY the `published_pages` snapshot via a public read policy. Signed-in users edit a separate `profiles.draft_blocks` array under RLS. The server checks an auth token (`getUser`), validates the document with Zod, and applies a revision guard (`update ... where revision = ...`). Publishing reads the saved draft, validates it again and creates a public JSON snapshot. Unpublishing deletes that snapshot and deactivates tracked links. All public forms are validated on the server, checked against the current published page, and written with a server-only Supabase secret/service key.

## Route map

- `/`, `/login`, `/signup`, `/auth/callback`, `/onboarding/handle`, `/onboarding/profile`
- `/dashboard`, `/dashboard/editor`, `/dashboard/analytics`, `/dashboard/settings`
- `/[handle]` public pages (path-based: no wildcard DNS at this stage)
- `/r/[slug]` tracked redirect; `/api/profile`, `/api/publish`, `/api/unpublish`, `/api/handle`, `/api/avatar`, `/api/public-form`, `/api/export`, `/api/health`
- `/privacy`, `/terms`, `/robots.txt`, `/sitemap.xml`

## Schema

`profiles(user_id PK, handle UNIQUE, display_name, bio, avatar_url, theme, draft_blocks jsonb, revision, timestamps)`

`published_pages(owner_id PK, handle UNIQUE, page jsonb, published_at)`

`short_links(id PK, owner_id FK, block_id UNIQUE per owner, slug UNIQUE, destination, active, timestamps)`

`click_events(id PK, owner_id FK, short_link_id FK, visitor_hash nullable, referrer_host, clicked_at)`

`newsletter_subscribers(id PK, owner_id FK, email UNIQUE per owner, created_at)`

`contact_messages(id PK, owner_id FK, name, email, message, created_at)`

Avatar objects are stored in a public-read/private-write `avatars` bucket, partitioned by user UID. Sensitive tables have ownership-based RLS. Public pages cannot expose drafts. The service key is never prefixed `NEXT_PUBLIC_`.

## Important known limitations

1. Publication and link activation use sequential PostgREST statements, **not one database transaction**. A partial failure can leave a temporarily inconsistent publication state. Production hardening should move this to a single atomic DB function/transaction under audited server privileges.
2. Redirect analytics inserts are synchronous and can add latency. Production should use a durable queue and per-client rate controls. Hashing requires `ANALYTICS_HASH_KEY`. Cap of 10,000 event rows in the current analytics UI.
3. Production newsletter/contact forms are unavailable until Cloudflare Turnstile is configured. Add independent WAF/edge rate limits, abuse reporting and double opt-in before public exposure.
4. Bookings are external provider links, **not** native calendar availability or invitation scheduling. No payment processing; support links point to external providers.
5. Images are external URLs or owner-uploaded avatars. A separate verified media storage/gallery system is not yet present.
6. No wildcard domains, account deletion workflow, subscriptions, custom domains, multi-profile accounts, scheduled links, AI writing or full bento drag grid yet.
7. Do not treat the present code as security-certified or launch-ready without live cross-account RLS integration tests, dependency audit, WCAG checks, legal policy review and deployment smoke tests.
