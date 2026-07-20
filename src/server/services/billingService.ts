import { getProvider } from '../db/factory';
import { nowIso, isoInDays } from '../lib/ids';

// Razorpay is wired when keys exist (see steps_for_shubham.md). For local dev
// and until then, `grantPremium` simulates a completed purchase so the full
// loop runs end-to-end.

export function razorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export async function grantPremium(userId: string): Promise<void> {
  await getProvider().subscriptions.update(
    userId,
    { status: 'active', plan: 'premium', current_period_end: isoInDays(30) },
    nowIso(),
  );
}

export async function cancelPremium(userId: string): Promise<void> {
  await getProvider().subscriptions.update(userId, { status: 'canceled' }, nowIso());
}
