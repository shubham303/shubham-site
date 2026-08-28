# shubhamrandive.com

Shubham Randive's personal site: an about page and a blog. Static Astro, deployed on Vercel.

## Run it

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # -> dist/
```

## Layout

```
src/
  consts.ts              site host, author identity, profile links (also feeds the Person schema)
  layouts/Layout.astro   <head>, canonical URL, JSON-LD, theme toggle, global CSS
  components/Nav.astro   Home · Blog · Books
  content/blog/*.md      the posts
  content.config.ts      blog frontmatter schema (title, date, description)
  pages/
    index.astro          home — bio, writing list, projects
    blog/index.astro     post index
    blog/[...slug].astro one post (BlogPosting + BreadcrumbList JSON-LD)
    books.astro          books and resources
public/robots.txt        points crawlers at the sitemap
vercel.json              www -> apex, trailing-slash and legacy-path redirects
```

## Adding a post

Drop a Markdown file in `src/content/blog/`:

```md
---
title: "Something specific, 40–60 characters"
date: 2026-08-28
description: "One sentence, 70–160 characters, that gives someone a reason to click."
---
```

The slug is the filename. It appears in the index, the sitemap and the home page automatically.

## URL conventions

One canonical shape for every page: `https://shubhamrandive.com/path`, apex host, no trailing
slash. `vercel.json` 301s `www.` and 308s the slashed form; `Layout.astro` emits a matching
`<link rel="canonical">`; the sitemap uses the same shape. Changing a live post's slug costs a
redirect, so don't — pick the slug once.
