import type { APIRoute } from 'astro';
import { withUser, json } from '@server/features/identity/service';
import { grantPro, razorpayConfigured } from '@server/features/billing/service';

export const prerender = false;

export const POST: APIRoute = (ctx) =>
  withUser(ctx, async (u) => {
    if (razorpayConfigured()) {
      // Razorpay keys present but checkout is wired only once you provide the
      // plan ID + test keys. Until then use the dev path below.
      return json(
        { error: 'razorpay_not_wired', message: 'Razorpay keys detected; wire the plan/checkout per RUNBOOK.' },
        501,
      );
    }
    // Local/dev: simulate a successful pro purchase so the loop runs e2e.
    await grantPro(u.id);
    return json({ ok: true, granted: true, dev: true });
  });
