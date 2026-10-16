# Delivery roadmap

## Implemented source modules (not yet live-deployment verified)
- Original responsive landing page, 6 themes, auth/onboarding pages, server-enforced handle claim
- Protected dashboard, profile/avatar editor, QR, JSON backup, publication workflow
- Links, heading, text, image, video, divider, socials, external booking/support, newsletter, contact blocks
- DnD/keyboard reorder, half/full width, visibility toggles, mobile/desktop previews
- Public pages, metadata, sitemap, tracked short-link redirects, 30-day click analytics
- SQL migration with ownership RLS and storage policies; basic unit tests and CI scaffold

## Next engineering increments, in order
1. Run `npm ci`, build/typecheck/lint/security audits in network-enabled CI. Generate and commit `package-lock.json`.
2. Provision a **new separate database**; configure Auth, storage, secrets; apply migration. Do not use an unrelated production project.
3. Real-user E2E tests (Playwright): signup, email confirmation, claim collision, save/publish/unpublish, cross-user isolation, mobile interactions, forms and redirects.
4. Atomic publish transaction, durable analytics ingestion, cross-region caching and rate limiting.
5. Subscriber double opt-in, unsubscribe flow, CSV exports, spam abuse dashboards, messaging notifications.
6. Calendars with verified availability, webhook reconciliation, timezone-aware bookings and reschedule/cancel flows.
7. Custom domain DNS verification, HTTPS provisioning, wildcard routing, per-block vanity slugs.
8. Profile media library, advanced bento grid, scheduled/expiring links, additional animations, accessibility audit.
9. Final privacy/legal review, retention & account deletion, backup restore drill, Sentry-like observability and load tests.
