# shubhamrandive.com — personal site and blog

A static Astro site. No server, no database, no auth. Two things live here: a home page about
Shubham Randive, and the blog.

## Layout

- `src/consts.ts` — canonical host, author identity, profile links. The `PERSON` object here is
  the single `Person` node every page's JSON-LD points at (`@id: <SITE>/#person`).
- `src/layouts/Layout.astro` — the only layout. Owns `<head>`: title, description, Open Graph,
  the canonical link, JSON-LD (via the `schema` prop), the theme toggle and all global CSS.
- `src/components/Nav.astro` — Home · Blog · Books.
- `src/content/blog/*.md` — posts. Frontmatter schema in `src/content.config.ts`.
- `src/pages/` — `index.astro` (home), `blog/index.astro`, `blog/[...slug].astro`, `books.astro`.
- `public/robots.txt`, `vercel.json` — crawler and redirect config.

## Conventions

- **One canonical URL shape:** apex host, no trailing slash. `astro.config.mjs` sets
  `trailingSlash: 'never'` and `build.format: 'file'`; `vercel.json` redirects `www.` and the
  slashed form; `Layout.astro` strips `.html`/`/index` before emitting the canonical.
- **Every page passes `title` and `description`.** Titles 40–60 characters, descriptions 70–160 —
  outside that range search results either truncate or say nothing.
- **Every page passes `schema`.** Home: `WebSite` + `Person` + `ProfilePage`. Blog index: `Blog`.
  Post: `BlogPosting` + `BreadcrumbList`. All reference `PERSON` by `@id` rather than repeating it.
- **Posts cite their sources.** Outbound links to the research, data or docs a claim rests on are
  the point, not decoration. Verify a URL resolves before publishing it.
- **Posts open with the answer.** Each `##` section starts with a sentence that stands on its own;
  enumerations get lists or tables rather than prose.
- **Never change a published slug.** It costs a redirect and splits the page's history.
