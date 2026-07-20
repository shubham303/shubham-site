import type { APIRoute } from 'astro';
import { ensureInit } from '@server/db/factory';
import { grantPremium, razorpayConfigured } from '@server/services/billingService';
import { json, userFromRequest } from '@server/lib/http';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  await ensureInit();
  const userId = await userFromRequest(request, cookies);
  if (!userId) return json({ error: 'not_authenticated' }, 401);

  if (razorpayConfigured()) {
    // Razorpay keys present but checkout is wired only once you provide the plan
    // ID + test keys (steps_for_shubham.md). Until then use the dev path below.
    return json(
      { error: 'razorpay_not_wired', message: 'Razorpay keys detected; wire the plan/checkout per steps_for_shubham.md.' },
      501,
    );
  }
  // Local/dev: simulate a successful premium purchase so the loop runs e2e.
  await grantPremium(userId);
  return json({ ok: true, granted: true, dev: true });
};
