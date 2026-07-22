// Identity service: auth resolution, role lookup, and route gates.
//
// The single source of truth for "who is this request from, and what can they
// do?" `userFromRequest` resolves BOTH credential types in one call via
// BetterAuth:
//   - browser session cookie (JWT-backed, via the jwt plugin)
//   - `x-api-key: ti_…` header (MCP server, via the apiKey plugin)
//
// Roles are NOT stored on the user. "Is this user pro?" is derived from the
// razorpay plugin's `subscription` table — a row with status `active` (paid)
// or `trialing` (within the free-trial window) for the `pro` plan. All grant
// / cancel / trial-expiry logic lives in the plugin + Razorpay webhooks; we
// only READ here. Any route gate (`withUser` / `withPro`) and the validate-key
// wire contract flow through here.

import type { APIContext } from 'astro';
import { auth, isBillingEnabled } from './auth';
import { getDb } from '../../db';

export type Role = 'free' | 'pro';

export interface AuthUser {
  id: string;
  email: string;
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
  return { id: session.user.id, email: session.user.email };
}

interface SubscriptionRow {
  status: string;
  plan: string;
  trialEnd: Date | null;
}

/**
 * The user's subscription row from the razorpay plugin's `subscription` table
 * (referenceId = userId), or null if none. Returns null without querying in
 * demo mode (billing disabled) — the table doesn't exist in that mode.
 */
async function getProSubscription(userId: string): Promise<SubscriptionRow | null> {
  if (!isBillingEnabled()) return null;
  const rows = await getDb().execute(
    `select status, plan, "trialEnd" as trial_end
       from subscription
      where "referenceId" = ? and plan = 'pro'
      order by "createdAt" desc
      limit 1`,
    [userId],
  );
  return (rows[0] as SubscriptionRow) ?? null;
}

/**
 * Effective role. In DEMO MODE (billing disabled) every signed-in user is
 * `pro`. Otherwise `pro` iff there's a `pro` subscription that is active
 * (paid) or trialing within its trial window; everything else (no
 * subscription, expired/cancelled/paused/halted) resolves to `free`. The
 * plugin + Razorpay webhooks own all status transitions; we only read.
 */
export async function roleForUser(userId: string): Promise<Role> {
  if (!isBillingEnabled()) return 'pro';
  const sub = await getProSubscription(userId);
  if (!sub) return 'free';
  if (sub.status === 'active') return 'pro';
  if (sub.status === 'trialing' || sub.status === 'created' || sub.status === 'authenticated') {
    // Pre-active states: treat as pro only while the trial window is open.
    const trialEnd = sub.trialEnd ? new Date(sub.trialEnd).getTime() : 0;
    return trialEnd > Date.now() ? 'pro' : 'free';
  }
  return 'free';
}

/** Trial end timestamp (ISO) if the user is in a pro trial, else null. */
export async function trialUntilForUser(userId: string): Promise<string | null> {
  const sub = await getProSubscription(userId);
  if (!sub || !sub.trialEnd) return null;
  if (['trialing', 'created', 'authenticated'].includes(sub.status)) {
    return new Date(sub.trialEnd).toISOString();
  }
  return null;
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
