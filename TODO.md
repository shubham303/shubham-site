# Table Intelligence — platform TODO

Roadmap items deferred past MVP. See `RUNBOOK.md` for the current architecture.

## Auth

- [ ] **Role-based access control (RBAC).**
  - Users can hold **multiple roles**, granted by the **plan they purchased**
    (e.g. `free`, `premium`, plus add-on roles per connector/agent as pricing
    gets granular).
  - An **`admin` role has access to everything** (all agents, all data surfaces,
    plus platform admin views).
  - Enforcement mirrors the current entitlement design: check the role/capability
    **server-side** on every gated API route (the real boundary), with the local
    MCP decorator as UX. Extend `validate-key` to return the user's **roles /
    capabilities**, not just a tier, so tools can gate per-capability instead of
    the current binary free-vs-premium.
  - Schema: a `roles` table + `user_roles` (or a `roles` column on the
    subscription/plan) mapping plan → roles; keep it derivable from the active
    subscription so a plan change updates roles.

- [ ] **Better Auth integration.**
  - Replace the hand-rolled scrypt-password + signed-cookie auth with
    [Better Auth](https://www.better-auth.com) for a proper login experience:
    email/password with verification + reset, **social login** (Google/GitHub),
    optional **magic links**, and its **apiKey** plugin to consolidate the MCP
    Bearer-key/entitlement flow.
  - Control-plane storage is already on a Better-Auth-supported adapter
    (**Neon Postgres** via `DATABASE_URL`); analytics still runs on DuckDB
    locally in the separate MCP server and is unaffected.
  - Social providers need OAuth credentials (Google Cloud / GitHub) — a manual
    setup step.
  - Do this together with RBAC above (Better Auth has `admin` / `organization`
    plugins that can back the role model).

> MVP for now: keep the existing users-table + scrypt-hashed passwords, backed by
> Neon Postgres via `DATABASE_URL`. Better Auth + RBAC is the "one fine day"
> upgrade.
