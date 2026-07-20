import type { APIRoute } from 'astro';
import { withUser } from '@server/lib/api';
import { json } from '@server/lib/http';
import { getCampaign } from '@server/services/outreachService';

export const prerender = false;

export const GET: APIRoute = (ctx) =>
  withUser(ctx, async (uid) => {
    const c = await getCampaign(uid, String(ctx.params.id));
    return c ? json({ campaign: c }) : json({ error: 'not_found' }, 404);
  });
