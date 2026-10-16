# LinkSpace research log — 2026-10-16

Research uses only publicly accessible content. LinkSpace is a clean-room implementation with original branding, styling, and source code.

## Linklee public feature inventory

Sources: https://linklee.in/ (marketing website, inspected 2026-10-16).

| Feature | Public evidence | Confidence | LinkSpace stage | Acceptance test |
|---|---|---|---|---|
| Handle claim | Landing page claim field and handle URL examples | Observed | Implemented; path-based URL | Reject reserved, duplicate and concurrent claims |
| Editable links | Site advertises link management, reorder and visibility | Observed/advertised | Implemented | Persist add/edit/hide/delete/reorder, refresh |
| Block editor | Advertised blocks incl. links, headings, images, embeds, bookings, newsletter | Observed/advertised | Implemented independently | Each supported block renders safely |
| Themes | Site advertises profile design/themes | Observed/advertised | 6 original themes | Theme persists and publishes |
| Short URLs | Advertised click-tracked redirects | Observed/advertised | Implemented `/r/[slug]` | Valid redirect, invalid slug 404 |
| Analytics | Advertised click counts | Observed/advertised | Last-30-day counts | Owner-only access and bot filtering |
| QR | Public site mentions QR codes (historical landing content) | Observed/advertised | Browser PNG export | Download decodable QR |
| Newsletter | Newsletter block advertised | Observed/advertised | Native form, Turnstile required in production | Valid email, honeypot, unauthorized posting |
| Contact forms | Public site contact section | Observed | Native contact block | Validate, submit, owner reads |
| Booking | Site advertises scheduling | Advertised, not verified as active | External booking URL block only | Valid provider link redirects |
| Tips / support | Site advertises external support destinations | Advertised | External support URL | No card data stored |
| Subdomains | Site examples use `name.linklee.in` | Observed | **Not implemented**: path URLs until DNS/domain infrastructure added | Routing and certificate issuance |
| Auth + editor details | Sign-in advertised but private pages not accessed | Inferred | Independently implemented | Live account smoke test |

This list does not claim access to another product's protected dashboard, implementation code, or private user data.

## Open-source reference comparison

Repository metadata and `package.json` reviewed from GitHub on 2026-10-16. None of the reference code was copied.

| Repo | Verified license metadata | Approach | Reuse decision |
|---|---|---|---|
| [heristop/linkfolio](https://github.com/heristop/linkfolio) | MIT | Next.js/Tailwind self-hosted link page; pushed 2026-10-05 | Useful public design reference; no code copied |
| [vanxh/openbio](https://github.com/vanxh/openbio) | AGPL-3.0 | Next.js, Drizzle; pushed 2026-04-06 | Do not copy due copyleft/license obligations |
| [Webisso/link-in-bio](https://github.com/Webisso/link-in-bio) | No license metadata returned | Next.js, Prisma, MySQL; pushed 2026-08-06 | Treat as all rights reserved unless separately licensed |
| [heyncth/linkforge](https://github.com/heyncth/linkforge) | No license metadata returned | Next.js, Supabase, block editor; pushed 2026-07-21 | Architecture reference only; no code copied |

Choice: independent TypeScript-first Next.js App Router codebase, Supabase Postgres/Auth/Storage, Zod validation, dnd-kit, Next.js route handlers, Vercel deployment.

## Deferred from Phase A research

The signed-in Linklee editor was not inspected. CSS implementation, internal API contracts, proprietary source, exact database fields, and feature availability cannot be verified from the marketing site. All corresponding LinkSpace features are independent designs, not reverse-engineered copies.
