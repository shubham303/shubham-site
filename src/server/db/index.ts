// Database bootstrap. The app talks to a single Neon Postgres database via
// DATABASE_URL. The DB handle is shared by:
//   - the feature repositories (via getDb())
//   - BetterAuth (via getKysely())
//
// `ensureInit()` runs once per process to (a) run BetterAuth's programmatic
// migrations for the auth + razorpay plugin tables, and (b) `create table if
// not exists` the feature tables. It wipes the legacy auth + billing tables
// first so the move to BetterAuth + better-auth-razorpay starts from a clean
// schema.

import type { Database } from './database';
import { PostgresDatabase } from './database';
import { Kysely, PostgresDialect } from 'kysely';
import type { RawPostgresDialectConfig } from 'kysely';
import postgres from 'postgres';

let db: Database | null = null;
let pgForKysely: ReturnType<typeof postgres> | null = null;
let kysely: Kysely<any> | null = null;

function createDatabase(): Database {
  const url = process.env.DATABASE_URL?.trim();
  if (!url || !/^postgres/i.test(url)) {
    throw new Error(
      'DATABASE_URL is not set (or is not a postgres:// URL). Set it to your ' +
      'Neon connection string in .env (local, dev branch) and in the Vercel project ' +
      '(prod, main branch). See NEON.md.',
    );
  }
  return new PostgresDatabase(url);
}

/** The shared DB handle used by feature repositories. */
export function getDb(): Database {
  if (!db) db = createDatabase();
  return db;
}

/**
 * A Kysely instance bound to the same Neon pool. BetterAuth (and its plugins)
 * uses this to own its tables (user/session/account/verification/key +
 * razorpay's subscription + user.razorpayCustomerId). We keep one pooled
 * postgres.js connection shared with the repositories rather than opening a
 * second pool.
 */
export function getKysely(): Kysely<any> {
  if (!kysely) {
    const url = process.env.DATABASE_URL?.trim();
    if (!url || !/^postgres/i.test(url)) {
      throw new Error('DATABASE_URL is not set or is not a postgres:// URL.');
    }
    pgForKysely = postgres(url, { max: 5, prepare: false, ssl: 'require' });
    const dialect = new PostgresDialect({
      postgres: pgForKysely,
    } as unknown as RawPostgresDialectConfig);
    kysely = new Kysely({ dialect });
  }
  return kysely;
}

let initialized: Promise<void> | null = null;

/**
 * Create all tables once per process. Endpoints await this first.
 *
 * Auth + billing tables are owned and migrated by BetterAuth and the
 * razorpay plugin (see features/identity/migrate.ts). Feature tables
 * (folders, reports, outreach) are created here by each feature's
 * `createTables()` export.
 */
export function ensureInit(): Promise<void> {
  if (!initialized) {
    initialized = (async () => {
      // Legacy tables from the pre-BetterAuth / pre-razorpay-plugin era.
      // Drop them so the schema starts clean (existing users / API keys /
      // subscriptions are not migrated — they re-signup).
      const d = getDb();
      await d.execute('drop table if exists api_keys');
      await d.execute('drop table if exists users');
      await d.execute('drop table if exists subscriptions');

      // Auth + subscription tables: BetterAuth's programmatic migration owns
      // these (includes the razorpay plugin's `subscription` table and the
      // `razorpayCustomerId` column on `user`). ensureRazorpayConfigured()
      // throws a clear error if keys are missing — fires on first real
      // request, not at build time.
      const { initAuthSchema, ensureRazorpayConfigured } = await import('../features/identity/migrate');
      ensureRazorpayConfigured();
      await initAuthSchema();

      // Feature tables: each feature declares its own.
      const { createTables: reports } = await import('../features/reports/model');
      const { createTables: outreach } = await import('../features/outreach/model');
      await reports(d);
      await outreach(d);
    })();
  }
  return initialized;
}
