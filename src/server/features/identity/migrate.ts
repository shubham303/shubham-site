// Programmatic BetterAuth schema migration.
//
// BetterAuth's CLI (`@better-auth/cli migrate`) is the normal path, but on
// serverless (Vercel) we can't run a CLI step as part of deploy. Instead we
// invoke `getMigrations()` + `runMigrations()` from `ensureInit()` — it diffs
// the live DB against the schema BetterAuth derives from our config (including
// plugins) and applies the DDL. Idempotent: safe to run on every cold start.
// Note: in better-auth >= 1.6, getMigrations moved from `better-auth/db` to
// `better-auth/db/migration` (the public subpath).

import { getMigrations } from 'better-auth/db/migration';
import { auth } from './auth';

// Re-exported so db/index.ts can call it from ensureInit() without importing
// auth.ts directly (which would pull the Razorpay client into the build graph
// eagerly). The check itself lives next to the client it validates.
export { ensureRazorpayConfigured } from './auth';

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
