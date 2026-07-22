// Billing service. Grants and revokes the `pro` role.
//
// grantTrial() is called from the BetterAuth `user.create.after` hook on
// signup — new users get a 3-day pro trial. grantPro() is the real paid grant
// (will be called by the Razorpay webhook, issue #4). The identity service
// reads `getActiveSubscription()` to lazily demote `pro` → `free` when a
// trial lapses with no paid sub.

import { newId, nowIso, isoInDays } from '../../lib/ids';
import { subscriptionsRepository } from './repository';
import { identityRepository } from '../identity/repository';

export function razorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

/** The user's current subscription row, or null if none. */
export async function getActiveSubscription(userId: string) {
  return subscriptionsRepository.getByUser(userId);
}

/** Grant a 3-day pro trial. Idempotent on the user row. */
export async function grantTrial(userId: string, days: number): Promise<void> {
  const now = nowIso();
  await subscriptionsRepository.insert({
    id: newId(),
    user_id: userId,
    status: 'trialing',
    plan: null,
    trial_ends_at: isoInDays(days),
    current_period_end: null,
    razorpay_subscription_id: null,
    created_at: now,
    updated_at: now,
  });
  await identityRepository.setRole(userId, 'pro');
}

/** Mark a paid pro subscription active (Razorpay webhook will call this). */
export async function grantPro(userId: string): Promise<void> {
  await subscriptionsRepository.update(
    userId,
    { status: 'active', plan: 'pro', current_period_end: isoInDays(30) },
    nowIso(),
  );
  await identityRepository.setRole(userId, 'pro');
}

export async function cancelPro(userId: string): Promise<void> {
  await subscriptionsRepository.update(userId, { status: 'canceled' }, nowIso());
  await identityRepository.setRole(userId, 'free');
}
