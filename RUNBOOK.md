# Table Intelligence — website runbook

This site is now the **app + control plane**: user accounts, subscriptions, reports/folders,
dashboard, and the APIs the local MCP server calls. SSR via the Vercel adapter. DB:
**Neon Postgres** via `DATABASE_URL` — the `dev` branch locally, the `main` branch in
production (see `NEON.md`).

## Run locally (no accounts needed)
```bash
npm install
cp .env.example .env    # set DATABASE_URL to the Neon dev branch + a SESSION_SECRET
npm run dev            # http://localhost:4321  (schema auto-creates on first request)
```
Pages: `/product` (landing + install guide), `/pricing`, `/signup`, `/login`, `/dashboard`,
`/dashboard/reports/[id]`, `/r/[token]` (public shared report).

## The end-to-end loop (all working locally)
1. **Sign up** at `/signup` → free **3-day trial** + an MCP API key (shown once).
2. **Upgrade**: dashboard "Upgrade to premium" → `POST /api/billing/checkout` (dev-grants premium;
   real Razorpay wired when keys exist — see `../TableIntelligence/steps_for_shubham.md`).
3. **Install the MCP** (config on `/product`), setting `TABINT_API_KEY` + `TABINT_CONTROL_PLANE_URL`
   (= this site's URL).
4–7. In the AI agent: give a CSV, run analytics, ask it to **save a report** → the MCP calls
   `POST /api/reports` → it appears on your **dashboard** (folders + reports), viewable/shareable.

## APIs the MCP calls
- `POST /api/validate-key` `{api_key}` → `{tier}` (entitlement)
- `POST /api/reports` (Bearer key) — save (trial/paid only)
- `GET /api/reports`, `GET /api/reports/:id`, `POST /api/folders`, `GET /api/folders`

## Architecture (strict layering, TS)
`src/server/db` (Postgres facade + factory) → `src/server/repositories` (one per table,
access only) → `src/server/services` (auth, entitlement, report, billing) → `src/pages/api` +
dashboard pages (endpoints). Passwords: scrypt (`node:crypto`). Sessions: signed cookie.

## Production env vars (set in Vercel)
`DATABASE_URL` (Neon), `SESSION_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`,
`RAZORPAY_WEBHOOK_SECRET`. The app requires `DATABASE_URL` (Neon) and errors clearly if unset.
