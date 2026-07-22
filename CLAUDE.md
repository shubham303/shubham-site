# shubham-site — the Table Intelligence web platform

This repo is the **web platform half** of Table Intelligence. The other half is the **MCP server**
(sibling repo `../TableIntelligence`, Python package `tabint`).

## Architecture — two parts

1. **MCP server** (`../TableIntelligence`) — runs **locally on the user's machine**, exposes
   prompts/resources/tools to an AI agent. The **data-analysis tools run locally**, so the user's
   raw data never leaves their machine. It stores nothing itself; it **calls this platform's APIs**
   to CRUD any data that needs saving.

2. **This platform + APIs** (Astro SSR on Vercel + Supabase Postgres) — accounts, auth,
   subscriptions/billing, the dashboard, and the **REST APIs** the MCP server calls. It stores only
   **dashboard-relevant data and agent outputs** (saved reports; outreach templates, campaigns,
   prospects, drafted/sent emails, received emails) — never the user's raw dataset.

The **same APIs** are consumed by both the MCP server (auth: `TABINT_API_KEY` Bearer key) and this
site's **web frontend** (auth: login session cookie), so both read/write the same records.

## Layout

The backend is **feature-sliced** under `src/server/`:

- `src/server/db` — postgres.js pool over **Neon Postgres** (`DATABASE_URL`; `?` placeholders → `$n`).
  `ensureInit()` runs BetterAuth's programmatic migration for auth tables + `create table if not exists`
  for each feature's tables.
- `src/server/features/identity` — BetterAuth instance (`auth.ts`, lazily constructed), programmatic
  migration (`migrate.ts`), and the auth gates (`withUser` / `withPro` in `service.ts`). Plugins:
  `jwt` (signed session cookie), `apiKey` (`x-api-key` header, `ti_` prefix), and
  `razorpay` (better-auth-razorpay — owns the entire subscription lifecycle). No `role` column —
  roles are derived from the razorpay plugin's `subscription` table.
- `src/server/features/reports` — folders + reports tables, repository, service.
- `src/server/features/outreach` — templates/campaigns/prospects/emails/received tables,
  repository, service.
- `src/server/lib` — cross-cutting only: `ids`, `http` (json helper), `flags`.
- `src/pages/api/<feature>/*` — thin Astro routes that delegate to the feature service.
- `src/middleware.ts` — resolves `Astro.locals.user` once per request.
- `src/pages/dashboard/*` — the dashboard UI (sidebar: Data Analysis · Outreach).
- `src/layouts/DashboardLayout.astro` — multi-product dashboard shell.

## Database

One **Neon Postgres** database for both local and prod, via `DATABASE_URL` (no local DuckDB).
See `NEON.md`. Missing `DATABASE_URL` throws a clear error. Per-user isolation is enforced in
the query layer (every query filters by the `user_id` resolved from the session / API key).

BetterAuth owns the auth tables (`user`, `session`, `account`, `verification`, the apiKey
plugin's `apikey` table, and the razorpay plugin's `subscription` table + `razorpayCustomerId`
column on `user`); feature tables are code-defined in each `features/<feature>/model.ts`.

## Auth

- **Two roles:** `free` and `pro`. NOT stored on the user — derived from the razorpay plugin's
  `subscription` table by `roleForUser()` (`active` or within-trial → `pro`, else `free`).
- **Sessions:** BetterAuth cookie carrying a signed JWT (`jwt` plugin). Read via
  `auth.api.getSession({ headers })`.
- **API keys** (MCP server): `x-api-key: ti_…` header (apiKey plugin). Same `getSession` call
  resolves both credential types.
- **Trials + billing:** owned entirely by `better-auth-razorpay` (subscription table, webhook,
  plan-based billing, free trials as Razorpay-deferred first charge). No manual lifecycle code.
  The plugin is always registered; `ensureRazorpayConfigured()` throws on first request if
  `RAZORPAY_*` env vars are missing.
- No social/OAuth yet.

## Conventions

- Each feature follows model (table defs) → repository (table access) → service (business logic).
  Astro routes under `src/pages/api/<feature>/` are thin: parse request, call the service, return JSON.
- Auth gates: `withUser` (any authenticated caller) and `withPro` (requires the `pro` role) in
  `src/server/features/identity/service.ts`.
- The site is also Shubham's personal site; the platform homepage is behind the `PLATFORM_HOME`
  feature flag (default off shows the personal homepage; the platform is always at
  `/table-intelligence`).
