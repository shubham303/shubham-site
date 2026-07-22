---
layout: ../../../../layouts/Docs.astro
title: Outreach — Dashboard
---

# Outreach — Dashboard

The [Outreach agent](/docs/agents/outreach) works from **templates** and **campaigns**, researches
prospects, drafts emails for each, and records replies — all of which you review and organise on
the [dashboard](/dashboard/outreach/campaigns). (For how it all fits together, see the
[Outreach agent](/docs/agents/outreach) overview.)

## Templates

The **Templates** tab (`/dashboard/outreach/templates`) lists your reusable playbooks. Create one
with **New template** — a title and a prompt describing who to target and how to research and write.
Set a template `active` or `inactive`. You can also ask the agent to create one:

> "Create an outreach template for seed-stage SaaS founders that opens with a data question."

## Campaigns

The **Campaigns** tab (`/dashboard/outreach/campaigns`) lists runs of your templates, each showing
how many prospect emails it holds and how many have been sent. Start one from a template with
**Start campaign** — the template's prompt is copied and frozen into the campaign so later template
edits don't change it.

Open a campaign to reach the prospect-email editor.

## Prospect emails

Inside a campaign, the **Prospect emails** section lists every prospect the agent added, each with
its drafted email (recipients, subject, body) and the research behind it. Here you:

- click any email to open the editor — fix recipients, subject, or body,
- ask the agent to revise drafts in bulk,
- delete a prospect email to disapprove it — anything deleted simply isn't there to send.

When you're happy, your agent sends the drafted emails through **your own** email tool and updates
each email's status to `sent`. Table Intelligence stores the data; it does not send the email.

## Inbox

The **Inbox** tab (`/dashboard/outreach/inbox`) shows replies your agent has captured and recorded.
In this version the inbox is global — not tied to a specific campaign. Your agent can record
incoming replies as they arrive.

## Your API key

The MCP server authenticates to your account with an API key. Get one on
[Account &amp; API key](/dashboard/account) — click **Generate new key** (shown once) and paste it
into your agent's config as `TABINT_API_KEY` (see the [install guide](/docs/install)).
