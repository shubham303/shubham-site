---
layout: ../../../../layouts/Docs.astro
title: Outreach — Tools reference
---

# Outreach — Tools reference

You don't call these directly — the [Outreach agent](/docs/agents/outreach) picks the right tool
from your request. This is what's available to it. Outreach is a **Pro connector**; these
operations need an active trial or pro subscription (see [Pricing](/pricing)).

The agent uses these tools to **store and organise** outreach work — templates, campaigns,
prospects, drafted emails and replies. Table Intelligence does **not** send email and does not read
your inbox. Sending happens in your agent through your own email tool (Gmail, SMTP…); these tools
just update the status afterwards.

## Templates

A template is a reusable playbook: a title + a prompt describing who to target and how to research
and write.

| Tool | Purpose |
|------|---------|
| `create_template` | Create a template (`title`, optional `prompt`, `status`). |
| `list_templates` | List templates (filter by `status`, date range). |
| `get_template` | Fetch one template. |
| `update_template` | Edit a template's `title`, `prompt`, or `status`. |
| `delete_template` | Remove a template. |

Template `status` is `active` or `inactive`.

## Campaigns

A campaign is a run of a template. On creation the template's prompt is **copied and frozen**, so
editing the template later doesn't change past campaigns.

| Tool | Purpose |
|------|---------|
| `setup_campaign` | Start a campaign from a template (`template_id`, optional `title`). |
| `list_campaigns` | List campaigns (filter by `status`, `template_id`, date range). Each row carries its `email_count` and `sent_count`. |
| `get_campaign` | Fetch a campaign together with its prospect emails. |

## Prospect emails

For each prospect the agent finds, it adds a drafted email (recipients, subject, body) plus the
research it gathered. You review and edit these in the campaign.

| Tool | Purpose |
|------|---------|
| `add_prospect_email` | Add a prospect and a drafted email to a campaign. |
| `list_emails` | List a campaign's prospect emails (filter by `status`, date range). |
| `get_email` | Fetch one email and its prospect. |
| `update_email` | Edit recipients, subject, body, or `status`. Setting `status` to `sent` records the send time. |
| `delete_email` | Remove a prospect email **and** its prospect — used to disapprove a prospect so it won't be sent. |

Email `status` is `draft` (newly added) or `sent` (once your agent has sent it). Deleting an email
is how you disapprove a prospect.

## Inbox (replies)

Replies your agent captures and records to your account. The inbox is global — not tied to a
specific campaign in this version.

| Tool | Purpose |
|------|---------|
| `save_reply` | Record an incoming reply (`sender`, `subject`, `body`, `received_at`). |
| `list_inbox` | List saved replies. |
| `delete_reply` | Remove a saved reply. |

Everything above lives on your Table Intelligence account so the [dashboard](/dashboard) can show
it; your raw analytics data stays on your machine (see [Privacy](/docs/privacy)).
