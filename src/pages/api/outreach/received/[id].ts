import type { APIRoute } from 'astro';
import { withUser } from '@server/lib/api';
import { json } from '@server/lib/http';
import { deleteReceived } from '@server/services/outreachService';

export const prerender = false;

export const DELETE: APIRoute = (ctx) =>
  withUser(ctx, async (uid) => json(await deleteReceived(uid, String(ctx.params.id))));
