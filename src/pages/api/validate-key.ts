import type { APIRoute } from 'astro';
import { ensureInit } from '@server/db/factory';
import { tierForKey } from '@server/services/entitlementService';
import { json } from '@server/lib/http';

export const prerender = false;

// Called by the local MCP server to check entitlement. Fails open to 'free'.
export const POST: APIRoute = async ({ request }) => {
  await ensureInit();
  const body = await request.json().catch(() => ({}));
  const apiKey = String(body.api_key || '');
  if (!apiKey) return json({ tier: 'free' });
  try {
    const { tier } = await tierForKey(apiKey);
    return json({ tier });
  } catch {
    return json({ tier: 'free' });
  }
};
