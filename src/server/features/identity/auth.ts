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
// The razorpay plugin is ALWAYS registered and requires the three Razorpay
// env vars at runtime. Construction is deferred (lazy) so `astro build`
// (which prerenders static pages and imports this module via the middleware)
// doesn't need keys — `ensureRazorpayConfigured()` is called from ensureInit()
// on the first real request.

import { betterAuth } from 'better-auth';
import { jwt } from 'better-auth/plugins';
import { apiKey } from '@better-auth/api-key';
import { razorpay } from 'better-auth-razorpay';
import Razorpay from 'razorpay';
import { getKysely } from '../../db';

export const PRO_PLAN = 'pro';
export const TRIAL_DAYS = 3;

/**
 * Throw a clear error if Razorpay keys aren't configured. Called from
 * ensureInit() so it fires on the first real (non-prerendered) request, not
 * at build time. The Razorpay plugin is always enabled — local dev must
 * provide test-mode keys (they're free).
 */
export function ensureRazorpayConfigured(): void {
  const missing = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET'].filter(
    (k) => !process.env[k],
  );
  if (missing.length) {
    throw new Error(
      `${missing.join(', ')} not set. The Razorpay plugin is always enabled — provide ` +
      'Razorpay test-mode keys in .env for local dev and in Vercel for prod.',
    );
  }
}

// Lazily-constructed auth instance. We can't construct at module load because
// the Razorpay SDK throws on empty key_id, and `astro build` imports this
// module during prerender without env. First access triggers construction;
// ensureInit() guarantees env is present by then.
let _auth: ReturnType<typeof betterAuth> | null = null;

function buildAuth(): ReturnType<typeof betterAuth> {
  const razorpayClient = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
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
    plugins: [
      jwt({}),
      apiKey({
        defaultPrefix: 'ti_',
        requireName: false,
        startingCharactersConfig: { shouldStore: true, charactersLength: 11 },
      }),
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
    ],
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
