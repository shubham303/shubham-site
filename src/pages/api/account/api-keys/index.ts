import type { APIRoute } from 'astro';
import { withUser, readBody, fail } from '@server/lib/api';
import { json } from '@server/lib/http';
import { listApiKeys, mintApiKey } from '@server/services/apiKeyService';

export const prerender = false;

export const GET: APIRoute = (ctx) =>
  withUser(ctx, async (uid) => json({ keys: await listApiKeys(uid) }));

export const POST: APIRoute = (ctx) =>
  withUser(ctx, async (uid) => {
    const body = await readBody(ctx);
    try {
      return json({ ok: true, ...(await mintApiKey(uid, body.name)) });
    } catch (e) { return fail(e); }
  });
