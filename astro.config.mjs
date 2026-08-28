import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// A static personal site: an about/home page and a blog. No server, no database.
// `trailingSlash: 'never'` is the one canonical URL shape — Vercel 308s the
// slashed form to it (see vercel.json), and the sitemap emits the same shape.
export default defineConfig({
  site: 'https://shubhamrandive.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap()],
});
