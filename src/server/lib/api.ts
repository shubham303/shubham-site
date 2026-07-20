import type { APIContext } from 'astro';
import { ensureInit } from '../db/factory';
import { userFromRequest, json } from './http';
import { tierForUser } from '../services/entitlementService';

/** Run `fn(userId)` for an authenticated user (session cookie or Bearer key). */
export async function withUser(ctx: APIContext, fn: (userId: string) => Promise<Response> | Response): Promise<Response> {
  await ensureInit();
  const userId = await userFromRequest(ctx.request, ctx.cookies);
  if (!userId) return json({ error: 'not_authenticated' }, 401);
  return fn(userId);
}

/** Like withUser, but requires an active trial/premium (paid connector gate). */
export async function withPaidUser(ctx: APIContext, fn: (userId: string) => Promise<Response> | Response): Promise<Response> {
  return withUser(ctx, async (userId) => {
    const tier = await tierForUser(userId);
    if (tier !== 'paid' && tier !== 'trial') {
      return json({ error: 'paid_feature', message: 'Outreach is a premium connector — start a trial or upgrade.' }, 402);
    }
    return fn(userId);
  });
}

export async function readBody(ctx: APIContext): Promise<any> {
  return ctx.request.json().catch(() => ({}));
}

export const fail = (e: unknown, status = 400) =>
  json({ error: e instanceof Error ? e.message : 'error' }, status);
