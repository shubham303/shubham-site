import type { APIRoute } from 'astro';
import { withUser, json } from '@server/features/identity/service';
import { deleteFeedback } from '@server/features/social/service';

export const prerender = false;

export const DELETE: APIRoute = (ctx) =>
  withUser(ctx, async (u) => json({ ...(await deleteFeedback(u.id, String(ctx.params.id))) }));
