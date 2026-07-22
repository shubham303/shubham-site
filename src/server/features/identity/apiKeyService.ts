// API key management for the MCP server. Keys are BetterAuth apiKey-plugin
// records (`ti_…` prefix, hashed at rest, validated via `x-api-key`).
//
// These endpoints are session-scoped on the BetterAuth side (the browser user
// is acting on their own keys), so each call passes the incoming request's
// headers through — BetterAuth resolves the cookie session from there.

import { auth } from './auth';

export const MAX_KEYS = 5;

export async function listApiKeys(request: Request) {
  // @better-auth/api-key returns { apiKeys: [...], total, limit, offset }.
  // Items use `referenceId` (owner) and `lastRequest` (last-used); there is no
  // `userId`/`lastUsedAt` field on list items.
  const res = (await auth.api.listApiKeys({ headers: request.headers })) as {
    apiKeys: Array<{ id: string; name: string | null; start: string | null; createdAt: Date; lastRequest: Date | null }>;
  };
  return (res.apiKeys ?? []).map((k) => ({
    id: k.id,
    name: k.name,
    key_prefix: k.start ? `${k.start}…` : null,
    created_at: k.createdAt instanceof Date ? k.createdAt.toISOString() : String(k.createdAt),
    last_used_at: k.lastRequest instanceof Date ? k.lastRequest.toISOString() : (k.lastRequest ?? null),
  }));
}

/**
 * Mint a new key. Returns the raw key ONCE — only its hash is stored.
 * Throws `key_limit_reached` if the user already has MAX_KEYS keys.
 */
export async function mintApiKey(request: Request, name?: string) {
  const existing = await listApiKeys(request);
  if (existing.length >= MAX_KEYS) throw new Error('key_limit_reached');

  // @better-auth/api-key returns a FLAT object: { ...apiKey, key (raw), start, id, ... }
  const res = (await auth.api.createApiKey({
    headers: request.headers,
    body: { name: name?.trim() || 'default' },
  })) as { key: string; start: string | null; id: string };

  return { apiKey: res.key, prefix: res.start };
}

export async function revokeApiKey(request: Request, id: string) {
  await auth.api.deleteApiKey({
    headers: request.headers,
    body: { keyId: id },
  });
  return { ok: true };
}

/**
 * Validate an API key presented by the MCP server (no session required —
 * `verifyApiKey` is a public endpoint). Resolves the key to a user id, or
 * null if invalid/expired/revoked.
 */
export async function userIdForApiKey(rawKey: string): Promise<string | null> {
  try {
    // verifyApiKey returns { valid, key: { referenceId, ... } | null }. For
    // user-scoped keys `referenceId` IS the owning user id.
    const res = (await auth.api.verifyApiKey({
      body: { key: rawKey },
    })) as { valid: boolean; key?: { referenceId?: string } | null };
    if (!res?.valid) return null;
    return res.key?.referenceId ?? null;
  } catch {
    return null;
  }
}
