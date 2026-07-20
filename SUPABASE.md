# Supabase (production database)

A dedicated Supabase project has been provisioned and the full schema applied
(users, api_keys, subscriptions, folders, reports + outreach: outreach_templates,
campaigns, prospects, sent_emails, received_emails).

- **Project name:** `table-intelligence`
- **Project ref:** `acjwlglurtqxkazdeehn`
- **Region:** ap-south-1 (Mumbai)
- **API URL:** https://acjwlglurtqxkazdeehn.supabase.co
- **Plan:** Free ($0/mo)

## Wire it to the deployed site

The app's DB facade uses **DuckDB locally** (no setup) and **Postgres when
`DATABASE_URL` is set**. Supabase is Postgres, so going live is just an env var.

1. Supabase dashboard → this project → **Settings → Database → Connection string**.
   Copy the **Session pooler** string (recommended for Vercel serverless), and make
   sure it ends with `?sslmode=require`. You'll paste in the DB password from the
   same page (reset it there if you don't have it).
2. In Vercel (shubham-site project) → Settings → Environment Variables, set:
   - `DATABASE_URL` = the pooler connection string
   - `SESSION_SECRET` = a long random string
   - (later) `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
3. Redeploy. `ensureInit()` will no-op against the already-created tables; the app
   now reads/writes Supabase.

> Local dev keeps using DuckDB (`.data/control.duckdb`) — nothing to configure.
> If Supabase's pooler throws prepared-statement errors, add `prepare: false` to
> the postgres.js options in `src/server/db/database.ts`.
