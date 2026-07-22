import type { APIRoute } from 'astro';
import { withUser, json } from '@server/features/identity/service';
import { deleteReceived } from '@server/features/outreach/service';

export const prerender = false;

export const DELETE: APIRoute = (ctx) =>
  withUser(ctx, async (u) => json(await deleteReceived(u.id, String(ctx.params.id))));
