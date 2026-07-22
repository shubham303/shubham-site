// One place that resolves the authenticated user into Astro.locals.user.
// Replaces the per-page verifySession() calls scattered across Nav.astro and
// the dashboard pages. Endpoints can still call userFromRequest() directly
// when they need to handle 401 differently; pages just read Astro.locals.user.

import { defineMiddleware } from 'astro:middleware';
import { userFromRequest } from './server/features/identity/service';

export const onRequest = defineMiddleware(async (ctx, next) => {
  try {
    ctx.locals.user = await userFromRequest(ctx.request);
  } catch {
    // Auth resolution must never break the response cycle.
    ctx.locals.user = null;
  }
  return next();
});
