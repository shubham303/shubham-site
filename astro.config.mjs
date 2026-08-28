import { defineConfig } from 'astro/config';

// A static personal site: an about/home page and a blog. No server, no database.
// `trailingSlash: 'never'` is the one canonical URL shape: Vercel 308s the
// slashed form to it (see vercel.json), and src/pages/sitemap.xml.ts emits the same shape.
export default defineConfig({
  site: 'https://www.shubhamrandive.com',
  trailingSlash: 'never',
  build: { format: 'file' },
});
