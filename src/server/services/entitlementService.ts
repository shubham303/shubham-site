import { getProvider } from '../db/factory';
import { hashApiKey } from '../lib/apiKey';

export type Tier = 'free' | 'trial' | 'paid' | 'expired';

export async function userIdForKeyHash(keyHash: string): Promise<string | null> {
  const k = await getProvider().apiKeys.getByHash(keyHash);
  return k?.user_id ?? null;
}

export async function userIdForKey(apiKey: string): Promise<string | null> {
  return userIdForKeyHash(hashApiKey(apiKey));
}

export async function tierForUser(userId: string): Promise<Tier> {
  const sub = await getProvider().subscriptions.getByUser(userId);
  if (!sub) return 'free';
  if (sub.status === 'active') return 'paid';
  if (sub.status === 'trialing') {
    const live = sub.trial_ends_at && new Date(sub.trial_ends_at).getTime() > Date.now();
    return live ? 'trial' : 'expired';
  }
  return 'free';
}

export async function tierForKey(apiKey: string): Promise<{ tier: Tier; userId: string | null }> {
  const userId = await userIdForKey(apiKey);
  if (!userId) return { tier: 'free', userId: null };
  return { tier: await tierForUser(userId), userId };
}
