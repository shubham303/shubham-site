import { getProvider } from '../db/factory';
import { hashPassword, verifyPassword } from '../lib/password';
import { newId, nowIso, isoInDays } from '../lib/ids';

export const TRIAL_DAYS = 3;

export type SignupResult = { userId: string } | { error: string };

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
  // Free 3-day trial on signup. No API key is minted here — the user
  // generates one deliberately from their account/profile page.
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
  return { userId };
}

export async function login(email: string, password: string): Promise<string | null> {
  const u = await getProvider().users.getByEmail(email);
  if (!u || !verifyPassword(password, u.password_hash)) return null;
  return u.id;
}
