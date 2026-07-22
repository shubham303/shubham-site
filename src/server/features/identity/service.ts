// Identity service: auth resolution, role lookup, and route gates.
//
// The single source of truth for "who is this request from, and what can they
// do?" `userFromRequest` resolves BOTH credential types in one call via
// BetterAuth:
//   - browser session cookie (JWT-backed, via the jwt plugin)
//   - `x-api-key: ti_…` header (MCP server, via the apiKey plugin)
// Any route gate (`withUser` / `withPro`) and the validate-key wire contract
// flow through here.

import type { APIContext } from 'astro';
import { auth } from './auth';
import { identityRepository } from './repository';
import { getActiveSubscription } from '../billing/service';

export type Role = 'free' | 'pro';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });

/**
 * Resolve the authenticated user from a request. Accepts:
 *   - a BetterAuth session cookie (browser), OR
 *   - an `x-api-key: ti_…` header (MCP server).
 * Returns null if no credential is present or it's invalid.
 */
export async function userFromRequest(request: Request): Promise<AuthUser | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    role: (session.user as { role?: string }).role === 'pro' ? 'pro' : 'free',
  };
}

/**
 * Effective role for a user. `role` on the user row is the source of truth,
 * but we lazily demote `pro` → `free` when a pro trial has expired with no
 * active paid subscription. (Razorpay webhook will be the real pro grant.)
 */
export async function roleForUser(userId: string): Promise<Role> {
  const user = await identityRepository.getById(userId);
  if (!user || user.role !== 'pro') return 'free';

  const sub = await getActiveSubscription(userId);
  if (!sub) return 'free';

  // Active paid sub stays pro forever (until canceled). A trialing sub only
  // stays pro while the trial window is open.
  if (sub.status === 'active') return 'pro';
  if (sub.status === 'trialing') {
    const live = sub.trial_ends_at && new Date(sub.trial_ends_at).getTime() > Date.now();
    if (live) return 'pro';
    // Trial lapsed — demote the user row so future calls skip this check.
    await identityRepository.setRole(userId, 'free');
    return 'free';
  }
  return 'free';
}

export async function currentUser(ctx: APIContext): Promise<AuthUser | null> {
  return userFromRequest(ctx.request);
}

/** Run `fn(user)` for any authenticated user; 401 otherwise. */
export async function withUser(
  ctx: APIContext,
  fn: (user: AuthUser) => Promise<Response> | Response,
): Promise<Response> {
  const user = await userFromRequest(ctx.request);
  if (!user) return json({ error: 'not_authenticated' }, 401);
  return fn(user);
}

/** Like withUser, but also requires the `pro` role; 402 otherwise. */
export async function withPro(
  ctx: APIContext,
  fn: (user: AuthUser) => Promise<Response> | Response,
): Promise<Response> {
  return withUser(ctx, async (user) => {
    const role = await roleForUser(user.id);
    if (role !== 'pro') {
      return json(
        { error: 'paid_feature', message: 'This is a Pro feature — start a trial or upgrade at /pricing.' },
        402,
      );
    }
    return fn(user);
  });
}

export const readBody = (ctx: APIContext): Promise<any> =>
  ctx.request.json().catch(() => ({}));

export const fail = (e: unknown, status = 400): Response =>
  json({ error: e instanceof Error ? e.message : 'error' }, status);

export { json };
