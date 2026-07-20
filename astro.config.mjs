import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// SSR: the site is now the app + control plane (auth, dashboard, reports, payments)
// plus the APIs the local MCP server calls. Static marketing/blog pages still
// prerender; only server routes run on demand.
export default defineConfig({
  site: 'https://shubhamrandive.com',
  output: 'server',
  adapter: vercel(),
  integrations: [sitemap()],
});
