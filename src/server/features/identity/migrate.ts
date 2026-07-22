// Programmatic BetterAuth schema migration.
//
// BetterAuth's CLI (`@better-auth/cli migrate`) is the normal path, but on
// serverless (Vercel) we can't run a CLI step as part of deploy. Instead we
// invoke `getMigrations()` + `runMigrations()` from `ensureInit()` — it diffs
// the live DB against the schema BetterAuth derives from our config (including
// plugins + the custom `user.role` field) and applies the DDL. Idempotent:
// safe to run on every cold start.

import { getMigrations } from 'better-auth/db';
import { auth } from './auth';

let ran = false;

export async function initAuthSchema(): Promise<void> {
  if (ran) return;
  // `auth.options` is the resolved config — pass it to getMigrations so the
  // plugin tables (the apiKey plugin's `apikey` table) are included.
  const { runMigrations, toBeCreated, toBeAdded } = await getMigrations(auth.options);
  if (toBeCreated.length || toBeAdded.length) {
    await runMigrations();
  }
  ran = true;
}
