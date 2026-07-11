import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static output — Vercel auto-detects Astro and deploys the built site for free.
// Update `site` to your real domain once it's connected (used for sitemap/SEO).
export default defineConfig({
  site: 'https://shubhamrandive.com',
  integrations: [sitemap()],
  // Prefer the apex domain; www redirects to it via Vercel.
});
