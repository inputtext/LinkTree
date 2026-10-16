# Validation results — 2026-10-16

Environment: Node v22.16.0, npm 10.9.2. Network-isolated package registry: `getaddrinfo EAI_AGAIN registry.npmjs.org`.

| Check | Result | Evidence |
|---|---|---|
| `npm run test` | PASS (8 / 8) | Node test runner; handle normalization/reserved words and URL validation including local-IP blocking |
| TypeScript parser (global tsc library) | PASS (41 .ts/.tsx files with zero parse diagnostics) | AST created successfully for each module |
| `npm install` | BLOCKED | npm registry DNS unavailable; no node_modules / package-lock.json |
| `npm run typecheck` | BLOCKED | Missing Next.js/React/Supabase dependencies and their type declarations; no meaningful full typecheck completed |
| `npm run lint` | NOT RUN | eslint-config-next not installed |
| `npm run build` | NOT RUN | Next.js not installed |
| Live database migrations / SQL advisors | NOT RUN | No dedicated LinkSpace project; existing unrelated databases left untouched |
| Auth/email / storage / public forms / redirect analytics E2E | NOT RUN | Requires project credentials and accessible backend |
| GitHub publish and Vercel deployment | NOT RUN | New repo creation/deployment actions not available in this session |

## Next verification

In a network-enabled environment, after provisioning a new dedicated Supabase project and setting `.env.local`:

```bash
npm install
npm run check
```

Commit the generated `package-lock.json`, switch CI to `npm ci`, run staging end-to-end tests with **two different user accounts**, inspect Supabase RLS security advisors and check real redirect/forms/QR and mobile layout. Do not declare production readiness until this passes.
