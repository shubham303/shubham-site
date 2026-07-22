import type { APIRoute } from 'astro';
import { withUser, json } from '@server/features/identity/service';
import { getCampaign } from '@server/features/outreach/service';

export const prerender = false;

export const GET: APIRoute = (ctx) =>
  withUser(ctx, async (u) => {
    const c = await getCampaign(u.id, String(ctx.params.id));
    return c ? json({ campaign: c }) : json({ error: 'not_found' }, 404);
  });
