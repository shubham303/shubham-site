import type { APIRoute } from 'astro';
import { withUser, withPro, readBody, fail, json } from '@server/features/identity/service';
import { getPost, updatePost, deletePost } from '@server/features/social/service';

export const prerender = false;

export const GET: APIRoute = (ctx) =>
  withUser(ctx, async (u) => {
    const p = await getPost(u.id, String(ctx.params.id));
    return p ? json({ post: p }) : json({ error: 'not_found' }, 404);
  });

// PATCH — update a post (content, status -> posted, notes, rejection_reason)
export const PATCH: APIRoute = (ctx) =>
  withPro(ctx, async (u) => {
    const b = await readBody(ctx);
    try {
      return json({ ...(await updatePost(u.id, String(ctx.params.id), b)) });
    } catch (e) { return fail(e); }
  });

// DELETE — reject a post. ?reason=... or body.reason records a rejection-feedback
// entry (linked to the post) before removal, so the agent can learn.
export const DELETE: APIRoute = (ctx) =>
  withUser(ctx, async (u) => {
    const reason = ctx.url.searchParams.get('reason') ?? undefined;
    const b = reason ? undefined : await readBody(ctx);
    try {
      return json({ ...(await deletePost(u.id, String(ctx.params.id), reason ?? b?.reason)) });
    } catch (e) { return fail(e); }
  });
