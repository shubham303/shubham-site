import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE, AUTHOR, EMAIL, PROFILES } from '../consts';

// A short markdown summary of the site at /llms.txt, for models that fetch the
// domain rather than crawl it. Generated from the same content collection the
// sitemap reads, so a new post shows up here without a second edit.
export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  const body = `# ${AUTHOR}

> Machine learning engineer. I build AI agents and write about data science,
> agents and shipping software. This site is a home page and a blog: no product,
> no docs, no marketing pages.

## Pages

- [Home](${SITE}): who I am, what I work on, and how to reach me.
- [Blog](${SITE}/blog): every post, newest first.
- [Books](${SITE}/books): what I have been reading.

## Posts

${posts
  .map(
    (post) =>
      `- [${post.data.title}](${SITE}/blog/${post.id})${
        post.data.description ? `: ${post.data.description}` : ''
      }`,
  )
  .join('\n')}

## Contact

- Email: ${EMAIL}
${PROFILES.map((p) => `- ${p.label}: ${p.href}`).join('\n')}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
