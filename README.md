# shubham-site

**Live:** https://shubhamrandive.com

Personal-brand site — a single landing page (bio, photo, links) plus a Markdown blog.
Built with [Astro](https://astro.build), deployed on Vercel, styled to feel like a clean
GitHub README. No forms, no tracking, no CSS framework.

## Run locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

## Add a blog post

Drop a Markdown file in `src/content/blog/`, e.g. `my-post.md`:

```markdown
---
title: "My post title"
date: 2026-07-15
description: "One line for SEO / social previews."
---

Your content in Markdown.
```

Commit and push — Vercel rebuilds and deploys automatically. The post shows up in the
list on the home page, sorted newest-first.

(With Claude Code: "add a blog post about X" → it writes the file → commit + push.)

## Edit the essentials

- **Bio + links** (email, LinkedIn, Substack, GitHub): `src/pages/index.astro`.
- **Your photo**: replace `public/photo.svg` with a real `public/photo.jpg` and update the
  `src="/photo.svg"` reference in `src/pages/index.astro`.
- **Domain**: set `site` in `astro.config.mjs` to your real domain (used for the sitemap).

## Deploy to Vercel

1. Push this to its **own** GitHub repo (keep it separate from any product/private repo).
2. In Vercel: New Project → import the repo. Vercel auto-detects Astro — no config needed.
3. Add your custom domain in the project's Domains settings.

## Content rules

Only publish open-dataset or anonymized findings — never a named prospect's teardown or any
client/private data. See the content guide in the TableIntelligence repo
(`.claude/skills/data-teardown-outreach/references/content_creation_guide.md`).
