import type { APIRoute } from 'astro';
import { withUser } from '@server/lib/api';
import { json } from '@server/lib/http';
import { revokeApiKey } from '@server/services/apiKeyService';

export const prerender = false;

export const DELETE: APIRoute = (ctx) =>
  withUser(ctx, async (uid) => json(await revokeApiKey(uid, String(ctx.params.id))));
