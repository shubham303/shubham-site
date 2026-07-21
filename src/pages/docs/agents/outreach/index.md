---
layout: ../../../../layouts/Docs.astro
title: Outreach agent
---

# Outreach agent

The **Outreach agent** researches prospects and drafts personalised cold emails for you, then
hands them to your own email tool to send. Your agent works from a **template**, runs a
**campaign** that researches each prospect and writes a draft, stores everything on your account,
and lets you review and edit before anything goes out. Table Intelligence stores and organises the
data — it does **not** send email. Sending happens in your agent through your own email tool
(Gmail, SMTP…).

> Outreach is a **premium connector**. Start a trial or upgrade on [pricing](/pricing).

## The model

- **Template** — a reusable playbook: a title + a prompt describing who to target and how to
  research and write. (`Templates` tab.)
- **Campaign** — a run of a template. On creation the template's prompt is **copied and frozen**,
  so editing the template later doesn't change past campaigns. (`Campaigns` tab.)
- **Prospect email** — for each prospect the agent finds, it adds a draft email (recipients,
  subject, body) plus the research it gathered. You review/edit these in the campaign.
- **Inbox** — replies your agent saves. Global, not campaign-specific in this version.

## The flow

1. **Create a template** — in the dashboard (`Templates → New template`) or ask your agent:
   > "Create an outreach template for seed-stage SaaS founders that opens with a data question."
2. **Start a campaign** from the template — `Start campaign`, or:
   > "Start a campaign from the SaaS founders template."
3. **Let the agent fill it** — it researches prospects on the web and adds a drafted email for each:
   > "Find 20 SaaS founders, research each, and add a drafted email to the campaign."
4. **Review & edit** — open the campaign, click any email to open the editor: fix the recipients,
   subject or body, or delete/disapprove a prospect so it won't be sent. You can also ask the agent
   to revise drafts in bulk.
5. **Send from your agent** — when you're happy:
   > "Send all the drafted emails in this campaign using my Gmail, and mark each as sent."
   The agent reads the campaign data, sends via your own email tool, and updates each email's
   status. Anything you deleted is simply not there to send.
6. **Save replies** — the agent can record incoming replies to your Inbox as they arrive.

## Your API key

The MCP server authenticates to your account with an API key. Get one on
[Account &amp; API key](/dashboard/account) — click **Generate new key** (shown once) and paste it
into your agent's config as `TABINT_API_KEY` (see the [install guide](/docs/install)).

## What's stored where

Templates, campaigns, prospects and emails live on your Table Intelligence account so the dashboard
can show them. Your raw analytics data stays on your machine (see [Privacy](/docs/privacy)). Table
Intelligence never sends email and never reads your inbox — that stays entirely in your agent and
your own tools.
