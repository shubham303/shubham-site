// BetterAuth client for the browser. Thin wrapper so login/signup/account
// pages have typed auth calls instead of hand-rolled fetch.
//
// Endpoints (all under /api/auth/*, served by the BetterAuth catch-all):
//   POST /sign-in/email    { email, password }
//   POST /sign-up/email    { email, password, name }
//   POST /sign-out
//   GET  /get-session

import { createAuthClient } from 'better-auth/client';
import { apiKeyClient } from '@better-auth/api-key/client';

export const authClient = createAuthClient({
  // base URL defaults to the current origin, which is what we want in prod.
  plugins: [apiKeyClient()],
});

export const { signIn, signUp, signOut, getSession, useSession } = authClient;
