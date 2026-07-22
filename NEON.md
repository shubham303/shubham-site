# Neon (the database)

The app uses **Neon serverless Postgres for both local dev and production**,
configured entirely through environment variables (no local DuckDB). Neon's
branching gives us prod/dev isolation from a single project:

- **`main` branch** → production `DATABASE_URL` (Vercel)
- **`dev` branch** → local `.env` `DATABASE_URL`

The schema is created automatically on first boot by `ensureInit()` in
`src/server/db/index.ts` — no manual migration step:

- **Auth + billing tables** (`user`, `session`, `account`, `verification`, the apiKey plugin's
  `apikey` table, and the razorpay plugin's `subscription` table) are owned and migrated by
  BetterAuth + better-auth-razorpay via their programmatic migration
  (`src/server/features/identity/migrate.ts`).
- **Feature tables** (`folders`, `reports`, `outreach_templates`, `campaigns`, `prospects`,
  `sent_emails`, `received_emails`) are `create table if not exists` in each feature's `model.ts`.

- **Org:** Vercel-managed · `org-misty-pond-01719778`
- **Project:** `neon-amber-zebra` · id `fragrant-pine-71931464` · aws-us-east-1 · pg 17
- **Database:** `neondb` · owner `neondb_owner`
- **Branches:** `main` (prod), `dev` (local)

> Because the org is managed by Vercel, new Neon **projects** must be created
> via the Vercel Marketplace integration, not `neonctl`. Branches, roles,
> connection strings, and SQL are all still available through `neonctl`.

## Get a connection string

Pooled endpoint (recommended for serverless):

```
npx neonctl connection-string dev  --project-id fragrant-pine-71931464 --database-name neondb --pooled
npx neonctl connection-string main --project-id fragrant-pine-71931464 --database-name neondb --pooled
```

Append `?sslmode=require`. The driver (`postgres`) is configured with
`prepare: false` + `ssl: 'require'`, which is what Neon's pooled
(pgBouncer) endpoint needs on serverless.

## Local

Create `shubham-site/.env` (gitignored) from `.env.example`:

```
DATABASE_URL=postgresql://neondb_owner:...@ep-...-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require   # dev branch
BETTER_AUTH_SECRET=<long random string>
BETTER_AUTH_URL=http://localhost:4321
RAZORPAY_KEY_ID=<test-mode key id>
RAZORPAY_KEY_SECRET=<test-mode key secret>
RAZORPAY_WEBHOOK_SECRET=<webhook secret>
RAZORPAY_PRO_PLAN_ID=<plan_… id for the pro plan>
```

Then `npm run dev` — it reads/writes the Neon `dev` branch. Reset the dev
branch anytime without touching prod:

```
npx neonctl branches reset dev --project-id fragrant-pine-71931464 --parent
```

## Production (Vercel)

Set `DATABASE_URL` (the **`main`** branch pooled URI), `BETTER_AUTH_SECRET`,
`BETTER_AUTH_URL`, and the `RAZORPAY_*` keys in the shubham-site Vercel project's
Environment Variables, then redeploy.

> The DB facade throws a clear error if `DATABASE_URL` is missing.
