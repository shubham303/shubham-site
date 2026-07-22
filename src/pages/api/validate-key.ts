// POST /api/validate-key — called by the MCP server (TableIntelligence) to
// resolve an API key to a role. New wire contract:
//   request:  { "api_key": "ti_…" }   OR   header: x-api-key: ti_…
//   response: { "role": "free" | "pro", "trial_until": "<iso>" | null }
//
// Fails open to `free` on any error — the MCP server must never crash or
// block analytics because the control plane was unreachable. (Matches the
// fail-open contract the MCP's entitlement.py relies on.)

import type { APIRoute } from 'astro';
import { ensureInit } from '@server/db';
import { json } from '@server/lib/http';
import { userIdForApiKey } from '@server/features/identity/apiKeyService';
import { roleForUser } from '@server/features/identity/service';
import { getActiveSubscription } from '@server/features/billing/service';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  await ensureInit();
  const body = await request.json().catch(() => ({}));
  const apiKey =
    String(body.api_key || '').trim() ||
    request.headers.get('x-api-key')?.trim() ||
    '';
  if (!apiKey) return json({ role: 'free', trial_until: null });

  try {
    const userId = await userIdForApiKey(apiKey);
    if (!userId) return json({ role: 'free', trial_until: null });
    const role = await roleForUser(userId);
    const sub = await getActiveSubscription(userId);
    const trialUntil =
      sub?.status === 'trialing' && sub.trial_ends_at ? sub.trial_ends_at : null;
    return json({ role, trial_until: trialUntil });
  } catch {
    return json({ role: 'free', trial_until: null });
  }
};
