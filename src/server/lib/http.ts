// Cross-cutting HTTP helpers only. Auth resolution now lives in
// features/identity/service.ts (userFromRequest), and route gates
// (withUser/withPro) live there too.

export const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
