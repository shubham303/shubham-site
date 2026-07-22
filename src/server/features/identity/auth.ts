// BetterAuth instance — the single source of truth for authentication.
//
// What's wired:
//   - email/password (no social/OAuth — see the migration plan)
//   - JWT plugin: the browser session cookie carries a signed JWT
//   - apiKey plugin: long-lived `ti_…` keys for the MCP server, read from the
//     `x-api-key` header (the plugin default). `auth.api.getSession({ headers })`
//     resolves both the cookie session and an `x-api-key` in one call.
//   - custom `user.role` column: 'free' | 'pro' (default 'free'), set by the
//     billing/identity service, never accepted from the client.
//   - databaseHooks.user.create.after: grant the 3-day pro trial on signup.
//
// Auth tables (user/session/account/verification + the apiKey plugin's apikey
// table) are created by the programmatic migration in ./migrate.ts.

import { betterAuth } from 'better-auth';
import { jwt } from 'better-auth/plugins';
import { apiKey } from '@better-auth/api-key';
import { getKysely } from '../../db';
import { grantTrial } from '../billing/service';

export type Role = 'free' | 'pro';

export const TRIAL_DAYS = 3;

export const auth = betterAuth({
  database: {
    // BetterAuth uses its own Kysely instance against the same Neon pool.
    // We share a single pooled postgres.js connection with the repositories.
    db: getKysely(),
    type: 'postgres',
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:4321',
  trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS
    ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(',').map((o) => o.trim())
    : undefined,
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        input: false, // never settable by the client on signup/update
        defaultValue: 'free' as Role,
      },
    },
  },
  plugins: [
    jwt({}),
    apiKey({
      defaultPrefix: 'ti_',
      requireName: false,
      startingCharactersConfig: { shouldStore: true, charactersLength: 11 },
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        async after(user) {
          // New users get a 3-day pro trial. grantTrial() flips role to 'pro'
          // and writes the subscriptions row that roleForUser() checks later.
          try {
            await grantTrial(user.id, TRIAL_DAYS);
          } catch (e) {
            // Don't fail signup if the trial grant blows up; the user can
            // still authenticate and will just be 'free'.
            console.error('grantTrial failed for', user.id, e);
          }
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
