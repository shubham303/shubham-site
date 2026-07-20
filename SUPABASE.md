# Supabase (the database)

The app uses **one Supabase Postgres database for both local dev and production**,
configured entirely through environment variables (no local DuckDB). The schema
(users, api_keys, subscriptions, folders, reports + outreach: outreach_templates,
campaigns, prospects, sent_emails, received_emails) is already applied.

- **Project:** `table-intelligence` · ref `acjwlglurtqxkazdeehn` · ap-south-1 · Free
- **API URL:** https://acjwlglurtqxkazdeehn.supabase.co
- **Direct host:** db.acjwlglurtqxkazdeehn.supabase.co
- **Pooler host:** aws-0-ap-south-1.pooler.supabase.com

## Get the connection string (one-time, needs the DB password)

1. Supabase dashboard → **table-intelligence** project → **Connect** (top bar).
2. Choose **Session pooler** → copy the URI. It looks like:
   `postgresql://postgres.acjwlglurtqxkazdeehn:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`
3. If you don't know the password: **Settings → Database → Reset database password**,
   then use the new one. Append `?sslmode=require` to the URI.

## Local

Create `shubham-site/.env` (gitignored) from `.env.example`:

```
DATABASE_URL=postgresql://postgres.acjwlglurtqxkazdeehn:...@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require
SESSION_SECRET=<long random string>
```

Then `npm run dev` — it now reads/writes Supabase.

## Production (Vercel)

Set the same `DATABASE_URL` and `SESSION_SECRET` (and later the Razorpay keys) in
the shubham-site Vercel project's Environment Variables, then redeploy.

> The DB facade throws a clear error if `DATABASE_URL` is missing.
