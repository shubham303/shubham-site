---
title: "I automated my cold-outreach pipeline with Claude, a prompt, and a $0 email stack"
date: 2026-07-18
description: "How an AI agent did the research, writing, sending, and bounce-recovery for a batch of personalized cold emails — using only Claude, Resend, and a domain I already owned."
---

*How I went from "I should email some prospects" to a batch of personalized, delivered cold
emails — with an AI agent doing the research, writing, sending, and bounce-recovery — using
nothing but Claude, Resend, and a domain I already owned.*

## The problem every solo consultant knows

I'm a data scientist trying to win data-analysis clients. The advice everyone gives is the
same: *do cold outreach*. And the advice is right. But the actual work of cold outreach is a
slow, soul-draining grind:

1. Find businesses worth contacting.
2. Research each one so the email isn't obviously a template.
3. Write something personal for every single one.
4. Find the right email address.
5. Send them, one by one.
6. Notice which ones bounced.
7. Hunt down the correct address and try again.

Do that for ten prospects and you've burned an afternoon. Do it every week and you'll quietly
stop doing it — which is exactly what happens to most people's outreach.

So I automated the whole thing. Not with a $99/month "AI SDR" SaaS, but with tools I already
had: **Claude** as the operator, **Resend** as the mail engine, and **my own domain** as the
sender identity. Total added cost: **zero**.

## The stack (and why each piece matters)

### 1. Claude — the operator, not just the writer

The key mental shift: Claude isn't a text generator I copy-paste from. It's an **agent with
hands**. Through the Model Context Protocol (MCP), Claude can call real tools — search the
web, read my local files, and send email through Resend — inside a single conversation. That
means it can research a company, write the email, send it, check whether it was delivered, and
fix its own mistakes without me touching a keyboard between steps.

### 2. Resend — email as an API (that also *receives*)

[Resend](https://resend.com) is a developer-first email service. Two things made it perfect
here:

- **Sending is one API call.** No SMTP servers, no Mailchimp UI. Claude just calls a
  `send-email` tool with `from`, `to`, `subject`, and `text`.
- **It also receives.** Once you point your domain's MX records at Resend, replies land back
  in an inbox that Claude can read. So the loop closes: I send from my domain, prospects reply
  to the same address, and those replies are available programmatically.

Resend has an official **MCP server**, which is the crucial part — it exposes all of that to
Claude as callable tools.

### 3. A personal domain — the difference between "spam" and "a real person"

Sending from an address on my own domain instead of some `@gmail.com` address does two things:

- **Deliverability.** With SPF and DKIM records verified on the domain, mailbox providers
  trust the mail. In my batch, nearly every recipient accepted the mail on the first try — the
  one failure was a wrong address I'd guessed, not a spam block.
- **Credibility.** The email itself points to my portfolio site. Sender, signature, and
  portfolio all match. To the person reading it, this is obviously one real human reaching out
  — because it is.

## The workflow, end to end

Every step below was performed by Claude calling a tool — I just supervised.

### Step 0: One-time setup (15 minutes, once)

- Add my domain to Resend and drop the **SPF + DKIM** DNS records in.
- Enable **receiving** and add the **MX record** so replies come back.
- Authorize the Resend MCP server so Claude can drive it.

That's it. This never has to be done again.

### Step 1: The prospect list already existed

I keep prospect research in plain Markdown files — one file per company, with what they do,
who the decision-maker is, and their likely email. The point: **the source of truth is just
text files Claude can read.**

### Step 2: Write the email — from a principle, not a template

This is where most automation gets it wrong. It's tempting to have the AI cram every research
finding into the email to "prove" relevance. That reads as creepy and salesy.

Instead I gave Claude a single principle:

> *Keep it a simple, capability-led pitch: "I'm a data scientist; if you're drowning in data,
> I can help." Use the research only to write one natural, personal opening line — never to
> show off what you dug up.*

So for a coffee roaster, the opening became *"You run a roastery with an espresso bar and a
training centre — which means you generate a lot of sales and customer data across those
channels."* One personal line, then the same honest, low-pressure pitch. Claude generated all
of these in one pass, each one different, none of them template-shaped.

### Step 3: Send — in parallel, in seconds

Claude called Resend's `send-email` tool once per prospect. The whole batch went out in the
time it takes to read this sentence. Each returned a confirmation ID.

### Step 4: Check delivery — and catch the bounce

This is the step humans skip and automation should never skip. Claude fetched the delivery
status of every message. Almost all came back **delivered**. One came back **bounced**.

### Step 5: Self-heal — research, fix, resend

Here's the part I find genuinely impressive. Faced with the bounce, Claude:

1. Recognized the failed address was one I'd *guessed*, not verified.
2. **Searched the web** for the company's real contact address.
3. Found the published general contact address on their site.
4. **Resent** the email to the correct address.
5. **Re-checked** — delivered.

No human intervention. The agent noticed its own failure, diagnosed the cause, did fresh
research, and fixed it. That's the difference between a script and an agent.

## Why this matters

Strip away the specifics and here's the shape of what happened: **a language model
orchestrated a real-world business process from research to delivery to error-recovery, using
cheap commodity tools, with a human only setting the strategy.**

- **The cost is basically zero.** Resend's free tier and a domain I already owned. No per-seat
  SaaS.
- **The bottleneck moved.** The slow part is no longer *doing* outreach — it's *deciding who
  to reach and what to say*. That's exactly the part a human should keep.
- **Quality went up, not down.** Because checking delivery and recovering bounces is tedious,
  humans skip it. The agent doesn't get bored, so it does the boring, correct thing every time.
- **The loop closes.** Replies come back to the same inbox the agent can read — so the next
  natural step is having it triage responses, too.

## The honest caveats

- **Send to real, relevant people.** This is a precision tool, not a spam cannon. The moment
  you point it at a scraped list of 10,000 strangers, you've become the thing everyone hates —
  and you'll torch your domain's reputation doing it.
- **Verify addresses when you can.** My one bounce was a guessed address. Guessing is fine if
  you also check delivery and recover — but a verified address is better.
- **Keep the human in the loop on strategy.** The agent wrote and sent, but *I* decided the
  pitch philosophy, the target list, and the tone. That judgment is the actual work.

## The takeaway

I didn't build a product. I didn't write a line of application code. I connected three things
I already had — an AI agent, an email API, and my own domain — and described the outcome I
wanted. The agent did the research, the writing, the sending, the checking, and the fixing.

The interesting future of AI at work isn't a chatbot that answers questions. It's an agent
that *acts* — that can take a fuzzy goal like "reach out to these prospects" and carry it all
the way to "delivered, and here's the one I had to fix."

That future is already here. It costs nothing. And it's sitting inside tools you probably
already use.
