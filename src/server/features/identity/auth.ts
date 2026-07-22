// BetterAuth instance — the single source of truth for authentication and
// billing lifecycle.
//
// What's wired:
//   - email/password (no social/OAuth — see the migration plan)
//   - JWT plugin: the browser session cookie carries a signed JWT
//   - apiKey plugin: long-lived `ti_…` keys for the MCP server, read from the
//     `x-api-key` header (the plugin default). `auth.api.getSession({ headers })`
//     resolves both the cookie session and an `x-api-key` in one call.
//   - razorpay plugin (better-auth-razorpay): OWNS the entire subscription
//     lifecycle — its own `subscription` table, trials, webhook, plan-based
//     billing. We do NOT store a role on the user; "is this user pro?" is
//     derived from whether they have an active/trialing `pro` subscription.
//
// Auth + subscription tables are created by the programmatic migration in
// ./migrate.ts (run from ensureInit()).
//
// The razorpay plugin is registered ONLY when the three Razorpay env vars are
// present. When they're absent the app runs in DEMO MODE: no plugin, no
// `subscription` table, no webhook, and roleForUser() short-circuits to `pro`
// so every signed-in user has full access. Drop the keys into .env / Vercel to
// turn real billing back on — no code change needed. Construction is deferred
// (lazy) so `astro build` (which prerenders static pages and imports this
// module via the middleware) doesn't need keys — the check runs from
// ensureInit() on the first real request.

import { betterAuth } from 'better-auth';
import { jwt } from 'better-auth/plugins';
import { apiKey } from '@better-auth/api-key';
import { razorpay } from 'better-auth-razorpay';
import Razorpay from 'razorpay';
import { getKysely } from '../../db';

export const PRO_PLAN = 'pro';
export const TRIAL_DAYS = 3;

/**
 * True iff all three Razorpay keys are set. When false the app runs in demo
 * mode: the plugin is skipped, no `subscription` table is created, and
 * roleForUser() returns `pro` for everyone. Flip to true by setting the keys.
 */
export function isBillingEnabled(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_WEBHOOK_SECRET,
  );
}

/**
 * Called from ensureInit(). Throws only if SOME (but not all) Razorpay keys
 * are set — a half-configured state is almost certainly a mistake. When none
 * are set the app silently runs in demo mode (logged once).
 */
export function ensureRazorpayConfigured(): void {
  const present = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET'].filter(
    (k) => process.env[k],
  );
  if (present.length === 0) {
    console.warn(
      '[billing] RAZORPAY_* keys not set — running in DEMO MODE. ' +
        'Every signed-in user gets Pro access. Set the keys to enable billing.',
    );
    return;
  }
  if (present.length < 3) {
    const missing = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET'].filter(
      (k) => !process.env[k],
    );
    throw new Error(
      `${missing.join(', ')} not set. Either set ALL Razorpay keys (RAZORPAY_KEY_ID, ` +
        'RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET) or leave ALL empty for demo mode.',
    );
  }
}

// Lazily-constructed auth instance. We can't construct at module load because
// the Razorpay SDK throws on empty key_id, and `astro build` imports this
// module during prerender without env. First access triggers construction;
// ensureInit() guarantees env is present by then.
let _auth: ReturnType<typeof betterAuth> | null = null;

function buildAuth(): ReturnType<typeof betterAuth> {
  const plugins: any[] = [
    jwt({}),
    apiKey({
      defaultPrefix: 'ti_',
      requireName: false,
      startingCharactersConfig: { shouldStore: true, charactersLength: 11 },
    }),
  ];

  // Only register the razorpay plugin when billing is enabled. In demo mode
  // (no keys) it's omitted entirely, so no `subscription` table is created
  // and no Razorpay client is constructed.
  if (isBillingEnabled()) {
    const razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
    plugins.push(
      razorpay({
        razorpayClient,
        razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET!,
        createCustomerOnSignUp: true,
        subscription: {
          enabled: true,
          plans: [
            {
              planId: process.env.RAZORPAY_PRO_PLAN_ID ?? '',
              name: PRO_PLAN,
              freeTrial: { days: TRIAL_DAYS },
            },
          ],
        },
      }),
    );
  }

  return betterAuth({
    database: {
      // BetterAuth uses its own Kysely instance against the same Neon pool.
      db: getKysely(),
      type: 'postgres',
    },
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:4321',
    trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS
      ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(',').map((o) => o.trim())
      : undefined,
    emailAndPassword: { enabled: true },
    plugins,
  });
}

/** The BetterAuth instance. Lazily constructed on first access. */
export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
  get(_target, prop) {
    if (!_auth) _auth = buildAuth();
    return Reflect.get(_auth, prop);
  },
});

export type Session = ReturnType<typeof betterAuth>['$Infer']['Session'];
