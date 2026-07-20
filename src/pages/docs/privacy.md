---
layout: ../../layouts/Docs.astro
title: Privacy & data
---

# Privacy & data

Table Intelligence is **local‑first** by design.

## What stays on your machine

- **Your raw data.** CSVs are loaded into a local DuckDB and analyzed on your device. They are
  never uploaded to us.
- **All computation.** Every analytic runs locally in the MCP server.

## What leaves your machine

- **Your API key**, sent to our website to check your subscription (`/api/validate-key`).
- **Reports you explicitly save.** When you ask the agent to save a report, that report's
  content (which you control) is sent to your account so you can read it on the dashboard. If you
  never save a report, nothing but the key check is transmitted.

## What we never receive

- Your raw datasets, connection strings, or credentials for other systems.

## Good practice

- Strip personal data (names, emails) from a CSV before analysis if you don't need it — the
  analysis rarely does.
- Keep report content free of sensitive PII, since a shared report link is public to anyone who
  has it.

Questions about data handling? [Get in touch](/).
