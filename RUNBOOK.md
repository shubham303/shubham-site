# Table Intelligence — website runbook

This site is now the **app + control plane**: user accounts, subscriptions, reports/folders,
dashboard, and the APIs the local MCP server calls. SSR via the Vercel adapter. DB:
**Neon Postgres** via `DATABASE_URL` — the `dev` branch locally, the `main` branch in
production (see `NEON.md`).

**Auth: [BetterAuth](https://www.better-auth.com).** Email/password only (no social/OAuth yet).
Session cookies carry a signed JWT (via the `jwt` plugin). The MCP server authenticates with a
long-lived `ti_…` API key sent in the `x-api-key` header (via the apiKey plugin). Two roles
exist: `free` and `pro`.

**Billing: [better-auth-razorpay](https://github.com/iamjasonkendrick/better-auth-razorpay).** The
plugin OWNS the entire subscription lifecycle — its own `subscription` table, free trials
(Razorpay-deferred first charge), the `/api/auth/razorpay/webhook` endpoint, and plan-based
billing. We do NOT store a role on the user; "is this user pro?" is derived from whether they
have an active/trialing `pro` subscription in the plugin's table. The plugin is always registered
and requires `RAZORPAY_KEY_ID`/`_SECRET`/`_WEBHOOK_SECRET` at runtime (throws on first request if
missing — local dev uses free test-mode keys).

## Run locally
```bash
npm install
cp .env.example .env    # DATABASE_URL (Neon dev) + BETTER_AUTH_* + RAZORPAY_* (test-mode keys)
npm run dev            # http://localhost:4321  (auth schema + tables auto-create on first request)
```
Pages: `/product` (landing + install guide), `/pricing`, `/signup`, `/login`, `/dashboard`,
`/dashboard/reports/[id]`, `/r/[token]` (public shared report).

## The end-to-end loop
1. **Sign up** at `/signup` → a Razorpay customer is created (plugin hook). No trial yet —
   trials start when the user subscribes to the pro plan (see next step).
2. **Subscribe to pro**: the frontend calls the plugin's
   `POST /api/auth/subscription/create` (or `razorpayClient.subscription.create` flow) to start
   a pro subscription with a 3-day free trial. The webhook flips the subscription to `active`
   on first payment.
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
- Roles: derived from the razorpay plugin's `subscription` table — no `role` column on `user`.

## Architecture (feature-sliced backend)
`src/server/` is organized by feature, not by technical role:

```
src/server/
  db/                 # postgres.js pool + ensureInit() (runs BetterAuth migrations + feature tables)
  features/
    identity/         # BetterAuth instance (jwt + apiKey + razorpay plugins), programmatic
                       # migration, auth gates (withUser/withPro), roleForUser (reads subscription)
    reports/          # folders + reports tables, repository, service
    outreach/         # templates/campaigns/prospects/emails/received tables, repository, service
  lib/                # cross-cutting only: ids, http (json), flags
src/pages/api/<feature>/  # Astro routes (thin) — delegate to the feature service
src/middleware.ts     # resolves Astro.locals.user once per request
```

Each feature owns its model (table defs) → repository (table access) → service (business logic).
BetterAuth owns the auth tables (`user`, `session`, `account`, `verification`, the apiKey
plugin's `apikey` table, and the razorpay plugin's `subscription` table + `razorpayCustomerId`
column on `user`) via its programmatic migration in `features/identity/migrate.ts`.

## Production env vars (set in Vercel)
`DATABASE_URL` (Neon), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RAZORPAY_KEY_ID`,
`RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RAZORPAY_PRO_PLAN_ID`. The app requires
`DATABASE_URL` (Neon) and the three Razorpay keys at runtime — it errors clearly if either is
unset.
