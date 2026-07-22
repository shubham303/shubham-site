// MCP API key management (browser session only). The actual key records live
// in BetterAuth's apiKey-plugin table; these endpoints wrap the plugin API.

import type { APIRoute } from 'astro';
import { json, withUser, readBody, fail } from '@server/features/identity/service';
import { listApiKeys, mintApiKey } from '@server/features/identity/apiKeyService';

export const prerender = false;

export const GET: APIRoute = (ctx) =>
  withUser(ctx, async () => json({ keys: await listApiKeys(ctx.request) }));

export const POST: APIRoute = (ctx) =>
  withUser(ctx, async () => {
    const body = await readBody(ctx);
    try {
      return json({ ok: true, ...(await mintApiKey(ctx.request, body.name)) });
    } catch (e) { return fail(e); }
  });
