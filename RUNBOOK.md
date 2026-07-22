# Table Intelligence — website runbook

This site is now the **app + control plane**: user accounts, subscriptions, reports/folders,
dashboard, and the APIs the local MCP server calls. SSR via the Vercel adapter. DB:
**Neon Postgres** via `DATABASE_URL` — the `dev` branch locally, the `main` branch in
production (see `NEON.md`).

**Auth: [BetterAuth](https://www.better-auth.com).** Email/password only (no social/OAuth yet).
Session cookies carry a signed JWT (via the `jwt` plugin). The MCP server authenticates with a
long-lived `ti_…` API key sent in the `x-api-key` header (via the apiKey plugin). Two roles
exist: `free` and `pro`. New signups get a 3-day `pro` trial.

## Run locally
```bash
npm install
cp .env.example .env    # set DATABASE_URL (Neon dev branch) + BETTER_AUTH_SECRET + BETTER_AUTH_URL
npm run dev            # http://localhost:4321  (auth schema + tables auto-create on first request)
```
Pages: `/product` (landing + install guide), `/pricing`, `/signup`, `/login`, `/dashboard`,
`/dashboard/reports/[id]`, `/r/[token]` (public shared report).

## The end-to-end loop (all working locally)
1. **Sign up** at `/signup` → 3-day **pro trial** starts automatically (server-side hook). Then
   generate an MCP API key from `/dashboard/account` (shown once).
2. **Upgrade**: dashboard "Upgrade to pro" → `POST /api/billing/checkout` (dev-grants `pro`;
   real Razorpay wired when keys exist — tracked separately in issue #4).
3. **Install the MCP** (config on `/product`), setting `TABINT_API_KEY` (the `ti_…` key) +
   `TABINT_CONTROL_PLANE_URL` (= this site's URL).
4–7. In the AI agent: give a CSV, run analytics, ask it to **save a report** → the MCP calls
   `POST /api/reports` → it appears on your **dashboard** (folders + reports), viewable/shareable.

## APIs the MCP calls
- `POST /api/validate-key` body `{ api_key }` (or header `x-api-key`) → `{ role, trial_until }`
- `POST /api/reports`, `GET /api/reports`, `GET /api/reports/:id` (header `x-api-key`)
- `POST /api/folders`, `GET /api/folders` (header `x-api-key`)
- Outreach CRUD under `/api/outreach/*` (header `x-api-key`)

**Auth conventions:**
- Browser session: BetterAuth cookie (JWT-backed), resolved by `auth.api.getSession`.
- MCP server: `x-api-key: ti_…` header, resolved by the apiKey plugin in the same call.

## Architecture (feature-sliced backend)
`src/server/` is organized by feature, not by technical role:

```
src/server/
  db/                 # postgres.js pool + ensureInit() (runs BetterAuth migrations + feature tables)
  features/
    identity/         # BetterAuth instance, auth tables, user/role repository, gates (withUser/withPro)
    billing/          # subscriptions table + grantTrial / grantPro / cancelPro
    reports/          # folders + reports tables, repository, service
    outreach/         # templates/campaigns/prospects/emails/received tables, repository, service
  lib/                # cross-cutting only: ids, http (json), flags
src/pages/api/<feature>/  # Astro routes (thin) — delegate to the feature service
src/middleware.ts     # resolves Astro.locals.user once per request
```

Each feature owns its model (table defs) → repository (table access) → service (business logic).
BetterAuth owns the auth tables (`user` with a custom `role` column, `session`, `account`,
`verification`, and the apiKey plugin's `apikey` table) via its programmatic migration in
`features/identity/migrate.ts`.

## Production env vars (set in Vercel)
`DATABASE_URL` (Neon), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RAZORPAY_KEY_ID`,
`RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`. The app requires `DATABASE_URL` (Neon) and
errors clearly if unset. `BETTER_AUTH_SECRET` must be set before serving real traffic.
