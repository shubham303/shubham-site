import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../consts';

// A single flat sitemap at /sitemap.xml. Twelve URLs do not need the index +
// child-file split that @astrojs/sitemap emits, and one well-known filename is
// easier to hand to a search console. Paths follow the site's one canonical
// shape: www host, no trailing slash, no `.html`.
const staticPaths = ['', '/blog', '/books'];

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog');

  const urls = [
    ...staticPaths.map((path) => ({ loc: `${SITE}${path}`, lastmod: undefined })),
    ...posts.map((post) => ({
      loc: `${SITE}/blog/${post.id}`,
      // Posts carry a publish date; static pages have nothing honest to claim.
      lastmod: post.data.date.toISOString().slice(0, 10),
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, lastmod }) =>
      `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`,
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
