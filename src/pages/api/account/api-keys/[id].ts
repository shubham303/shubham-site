import type { APIRoute } from 'astro';
import { json, withUser } from '@server/features/identity/service';
import { revokeApiKey } from '@server/features/identity/apiKeyService';

export const prerender = false;

export const DELETE: APIRoute = (ctx) =>
  withUser(ctx, async () => json(await revokeApiKey(ctx.request, String(ctx.params.id))));
