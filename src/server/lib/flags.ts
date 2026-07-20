// Env-driven feature flags. Defaults are chosen so production behaves like the
// original personal site until a flag is explicitly switched on.

const truthy = (v: string | undefined): boolean =>
  ['1', 'true', 'yes', 'on'].includes((v ?? '').trim().toLowerCase());

/**
 * When true, the site root (/) shows the Table Intelligence platform landing.
 * When false (the default), / shows the original personal homepage.
 *
 * Toggle with the `PLATFORM_HOME` env var (e.g. in Vercel). The platform page is
 * always reachable at /table-intelligence regardless of this flag.
 */
export const platformHomeEnabled = (): boolean => truthy(process.env.PLATFORM_HOME);
