# Table Intelligence — platform TODO

Roadmap items deferred past MVP. See `RUNBOOK.md` for the current architecture.

## Auth

The platform now uses [BetterAuth](https://www.better-auth.com) (email/password,
JWT sessions, `x-api-key` API keys) with [better-auth-razorpay](https://github.com/iamjasonkendrick/better-auth-razorpay)
owning the entire subscription lifecycle (trials, webhooks, plan-based billing).
Two roles — `free` and `pro` — are derived from the razorpay plugin's
`subscription` table.

Still deferred:

- [ ] **Social login.** Add Google/GitHub OAuth providers to the BetterAuth
  instance (needs OAuth credentials — a manual Google/GitHub console step).
- [ ] **Granular RBAC.** If per-connector pricing arrives, move from a flat
  `free`/`pro` role to per-capability checks. BetterAuth's `admin` /
  `organization` plugins can back this.
- [ ] **Email verification + password reset.** Requires an email transport
  (e.g. Cloudflare Email Service / Resend) wired to the BetterAuth endpoints.
