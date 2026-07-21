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

- `src/server/db` — Postgres facade (Supabase via `DATABASE_URL`; `?` placeholders → `$n`).
- `src/server/repositories` — one per table (raw SQL, per-user scoped).
- `src/server/services` — auth, entitlement, reports, outreach, api-keys.
- `src/server/lib` — session, apiKey, http/api helpers.
- `src/pages/api/*` — the REST APIs (Bearer key or session; paid features gated by subscription).
- `src/pages/dashboard/*` — the dashboard UI (sidebar: Data Analysis · Outreach).
- `src/layouts/DashboardLayout.astro` — multi-product dashboard shell.

## Database

One **Supabase Postgres** database for both local and prod, via `DATABASE_URL` (no local DuckDB).
See `SUPABASE.md`. Missing `DATABASE_URL` throws a clear error. Per-user isolation is enforced in
the query layer (every query filters by the `user_id` resolved from the API key / session).

## Conventions

- Persisted data flows through `ensureInit()` → `getProvider()` → repositories → services → API
  routes. Endpoints authenticate via `withUser` / `withPaidUser` (`src/server/lib/api.ts`).
- The site is also Shubham's personal site; the platform homepage is behind the `PLATFORM_HOME`
  feature flag (default off shows the personal homepage; the platform is always at
  `/table-intelligence`).
