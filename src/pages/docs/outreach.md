---
layout: ../../layouts/Docs.astro
title: Outreach connector
---

# Outreach connector

Turn Table Intelligence into an AI outreach assistant: your agent researches prospects, drafts
personalised emails, and stores them on your account so you can review and edit before anything
goes out. The dashboard is where you see and edit everything; the AI does the work.

> Outreach is a **premium connector**. Start a trial or upgrade on [pricing](/pricing).

## What this connector does — and doesn't

Table Intelligence **stores and organises** your outreach: prospects, the research on each one,
the drafted email (to, subject, body), and a status. It gives your agent tools to create, read,
update and delete that data, and gives you a dashboard to review and edit it.

It **does not send email.** Sending is done inside your AI agent through your *own* email tool
(for example a Gmail or SMTP MCP). After your agent sends, it records the outcome back here — the
status becomes `sent`, and later `replied` — so your dashboard stays the single view of every
conversation.

## 1. Create an outreach prompt

An outreach prompt is your editable playbook — the tone, structure, and rules the agent follows
when drafting. Keep several for different campaigns:

> "Create an outreach prompt called 'Agencies — warm intro' that opens with one specific line
> about the prospect and keeps the pitch to three sentences."

You can view and edit any prompt on the [outreach dashboard](/dashboard/outreach) — click a prompt
card to open its editor.

## 2. Research & draft

Point your agent at a list or a description, and let it work:

> "Find 20 SaaS founders in Singapore, research each, and draft outreach using the
> 'Agencies — warm intro' prompt. Save them for me to review."

Each prospect — name, email, company, research, and the drafted email — appears on your
[dashboard](/dashboard/outreach), marked **drafted**.

## 3. Review & edit

Click any prospect to open it in a side panel. Read the full email (to / subject / body), edit it
by hand, or ask your agent to revise it. Change the status as things progress.

## 4. Send from your agent, track here

When you're happy, ask your agent to send using your email tool:

> "Send the email to Maya using my Gmail, then mark her as sent."

Your agent sends through your own email account and updates the status here. To capture replies,
ask it to check your inbox and record them:

> "Check for replies and save them against the prospects who responded."

## What's stored where

Prospects and prompts live on your Table Intelligence account so the dashboard can show them. Your
raw analytics data stays on your machine (see [Privacy](/docs/privacy)). Table Intelligence never
sends email and never touches your inbox — that stays entirely inside your agent and your own
tools.
