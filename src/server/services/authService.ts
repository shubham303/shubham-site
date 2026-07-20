import { getProvider } from '../db/factory';
import { hashPassword, verifyPassword } from '../lib/password';
import { generateApiKey, hashApiKey, keyPrefix } from '../lib/apiKey';
import { newId, nowIso, isoInDays } from '../lib/ids';

export const TRIAL_DAYS = 3;

export type SignupResult = { userId: string; apiKey: string } | { error: string };

export async function signup(email: string, password: string): Promise<SignupResult> {
  const p = getProvider();
  if (await p.users.getByEmail(email)) return { error: 'email_taken' };

  const userId = newId();
  await p.users.insert({
    id: userId,
    email,
    password_hash: hashPassword(password),
    created_at: nowIso(),
  });
  // Free 3-day trial on signup.
  await p.subscriptions.insert({
    id: newId(),
    user_id: userId,
    status: 'trialing',
    plan: null,
    trial_ends_at: isoInDays(TRIAL_DAYS),
    current_period_end: null,
    razorpay_subscription_id: null,
    created_at: nowIso(),
    updated_at: nowIso(),
  });
  const apiKey = await mintApiKey(userId);
  return { userId, apiKey };
}

export async function login(email: string, password: string): Promise<string | null> {
  const u = await getProvider().users.getByEmail(email);
  if (!u || !verifyPassword(password, u.password_hash)) return null;
  return u.id;
}

export async function mintApiKey(userId: string): Promise<string> {
  const apiKey = generateApiKey();
  await getProvider().apiKeys.insert({
    id: newId(),
    user_id: userId,
    key_hash: hashApiKey(apiKey),
    key_prefix: keyPrefix(apiKey),
    created_at: nowIso(),
  });
  return apiKey;
}
