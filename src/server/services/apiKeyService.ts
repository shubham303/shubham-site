import { getProvider } from '../db/factory';
import { generateApiKey, hashApiKey, keyPrefix } from '../lib/apiKey';
import { newId, nowIso } from '../lib/ids';

export const MAX_KEYS = 5;

export async function listApiKeys(userId: string) {
  return getProvider().apiKeys.listByUser(userId);
}

/** Mint a new key. Returns the raw key ONCE — only its hash is stored. */
export async function mintApiKey(userId: string, name?: string) {
  const p = getProvider();
  if ((await p.apiKeys.countByUser(userId)) >= MAX_KEYS) {
    throw new Error('key_limit_reached');
  }
  const apiKey = generateApiKey();
  await p.apiKeys.insert({
    id: newId(), user_id: userId, name: name?.trim() || 'default',
    key_hash: hashApiKey(apiKey), key_prefix: keyPrefix(apiKey), created_at: nowIso(),
  });
  return { apiKey, prefix: keyPrefix(apiKey) };
}

export async function revokeApiKey(userId: string, id: string) {
  await getProvider().apiKeys.remove(userId, id);
  return { ok: true };
}
