---
title: "I automated my cold outreach with an AI agent, and it fixed its own mistakes"
date: 2026-07-18
description: "Research, write, send, check, recover — an AI agent ran my whole cold-email pipeline using Claude, Resend, and a domain I already owned. Cost: zero."
---

Every solo consultant hears the same advice: **do cold outreach.** And it's good advice. The
trouble is that outreach done well is a grind — find the businesses, research each one, write
something that doesn't read like a template, dig up the right email, send, notice the bounces,
find the correct address, try again. Ten prospects eats an afternoon. Do it weekly and you'll
quietly stop, which is what happens to most people's outreach.

So I stopped doing it, and let an AI agent do it instead. Not a $99/month "AI SDR" — just
three things I already had: **Claude** as the operator, **Resend** as the mail engine, and my
**own domain** as the sender. Total added cost: zero.

## The shift: an agent with hands, not a text box

The trick isn't asking a chatbot to "write me a cold email." It's giving the model *hands*.
Through the Model Context Protocol, Claude can call real tools inside one conversation — search
the web, read my local files, send mail through Resend, check whether it landed. Once it can
act, the whole pipeline collapses into a single flow: research a company, write the email, send
it, verify delivery, fix what broke — with me never touching the keyboard between steps.

And the prospecting itself is Claude's job too, not mine. I taught it the playbook once — how I
like to find businesses worth contacting, qualify them, and note the right decision-maker — and
packaged that into a reusable skill it can follow. So the research is the agent working to my
standard, not me combing through websites by hand. It writes the results out as plain Markdown,
one file per company: what they do, who to contact, their likely email — the same files it later
reads back when it's time to write.

Resend is what makes the sending trivial. Email becomes one API call — `from`, `to`, `subject`,
`text` — no SMTP, no Mailchimp dashboard. And it *receives*: point your domain's MX records at
it and replies come back to an inbox the agent can read. The loop closes. It even ships an
official MCP server, so all of that shows up to Claude as callable tools.

The domain is the quiet hero. Sending from my own address instead of a `@gmail.com` does two
things at once. With SPF and DKIM verified, mailbox providers trust the mail — nearly every
recipient in my batch accepted it on the first try. And the sender, the signature, and the
portfolio link all match, so to the person reading it, this is obviously one real human. Because
it is.

## Writing from a principle, not a template

This is where most outreach automation goes wrong. It's tempting to have the AI stuff every
research finding into the email to *prove* it did its homework. That reads as creepy. So I gave
Claude one rule instead of a template:

> Keep it a simple, capability-led pitch — "I'm a data scientist; if you're drowning in data, I
> can help." Use the research for one natural opening line only. Never show off what you dug up.

For a coffee roaster that opening became *"You run a roastery with an espresso bar and a training
centre — which means you generate a lot of sales and customer data across those channels."* One
personal line, then the same honest, low-pressure ask. Every email came out different, none of
them template-shaped, all in a single pass.

## The part that impressed me

The agent sent the batch in seconds, one call per prospect. Then it did the step humans always
skip: it checked delivery status on every message. Almost all came back *delivered*. One came
back *bounced* — an address I'd guessed.

And then, without me saying anything, it fixed it. It recognized the failed address was a guess,
searched the web for the company's real contact, found the published address on their site,
resent, and re-checked: delivered. No intervention. It noticed its own failure, diagnosed it,
did fresh research, and recovered.

That's the whole difference between a script and an agent. A script runs and reports what
happened. An agent notices what went wrong and does something about it.

## What this actually means

Strip away the specifics and the shape is this: a language model ran a real business process —
research to delivery to error-recovery — using cheap, commodity tools, with a human only setting
the strategy.

The cost is basically nothing. The bottleneck moved from *doing* outreach to *deciding who to
reach and what to say* — which is exactly the part I should keep. And quality went *up*, because
the tedious steps humans skip out of boredom are the ones an agent does every single time.

A few honest caveats, because this is easy enough to abuse. Send to real, relevant people — this
is a precision tool, not a spam cannon, and pointing it at 10,000 scraped strangers just torches
your domain and makes you the thing everyone hates. Verify addresses when you can. And keep
yourself in the loop on strategy: the agent wrote and sent, but I chose the pitch, the list, and
the tone. That judgment is the actual work.

I didn't build a product or write a line of application code. I connected three things I already
had and described the outcome I wanted. The agent did the rest. The interesting future of AI at
work isn't a chatbot that answers questions — it's an agent that *acts*, one that can take
"reach out to these prospects" all the way to "delivered, and here's the one I had to fix."

That future is already here, it costs nothing, and it's sitting inside tools you probably already
use.

---

*This is the kind of thing I do: build AI tools and agents that turn messy business data into
decisions and automate the work that eats your team's time. If you're drowning in data and want
to get more out of it, [get in touch](mailto:randiveshubham3@gmail.com) — I'm always happy to
talk shop.*
