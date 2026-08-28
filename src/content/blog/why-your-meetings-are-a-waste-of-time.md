---
title: "Why Your Meetings Are a Waste of Time (and How to Fix It)"
date: 2026-06-06
description: "A room full of people thinking out loud, all at once, is the worst environment for thinking. Write first. Read first. Then meet."
---

**Most decision meetings fail for a structural reason, not a human one: they ask a room to think out loud, in real time, all at once.** Move the thinking into a written document that circulates first, and the meeting stops being a debate and becomes a review.

## The short version

| | Meeting-first | Document-first |
| --- | --- | --- |
| Where thinking happens | In the room, under time pressure | At a desk, before the room |
| Who tends to win | Loudest, fastest, most senior | Whoever's argument survives being written down |
| Cost of a bad idea | Eight people's afternoon | The author's own hour |
| What the meeting is for | Generating and deciding | Resolving the doubts the document surfaced |
| Objections you get | Reflexive | Considered |

Someone on your team has a decision to make. How to fix a nasty bug. Which way to structure a service. Whether to build the thing at all. And almost on reflex, the same sentence comes out:

*"Let's just hop on a call."*

On paper it is the obvious move. You have a decision, you get the relevant people in a room, you talk it through, you walk out with a consensus and a path forward. Clean.

In practice most of those meetings waste everyone's time. The people are not dumb and the topic matters. The problem is *what we ask the meeting to do.* We ask a room full of people to think, in real time, out loud, all at once. That is about the worst possible environment for thinking.

## The meeting rewards the loudest, fastest, most senior idea

Watch what happens in a decision meeting.

The person with the most authority states their view early, and from that moment the gravity of the room bends toward it. The engineer who has been knee-deep in the actual problem, the one person who knows where the bodies are buried, rarely wins an argument against a senior operating two levels of abstraction up. Seniority gets mistaken for correctness.

Even when there *is* real discussion, nobody is analyzing the problem. Everyone listens just enough to find their opening while privately rehearsing the next thing they want to say. You start making a point, someone interjects before you can land it, the topic drifts, and your half-formed argument dies on the table. Nobody gets the silence they need to think through the downsides of the proposal, including the person proposing it.

So most of the time the senior person walks out with the exact decision they walked in with. The decision was never made in the meeting. The meeting was theater performed *around* a decision that was already made.

Here is the part that should bother you most. How many times have you sat in a meeting, failed to find the right words, gone along with something, and then an hour later, free and quiet at your desk, assembled the clear, sharp argument you wish you had had? That argument was *real.* It existed. The meeting gave you no room to produce it. Multiply that by every person who stayed quiet and you start to see how much intelligence these meetings leave on the floor.

## The meeting should be the last step, not the first

The fix is to stop using meetings as the place where thinking *happens* and start using them as the place where thinking gets *tested.*

Amazon is famous for this idea. Jeff Bezos put it plainly in the [2017 letter to shareholders](https://www.aboutamazon.com/news/company-news/2017-letter-to-shareholders): "We don't do PowerPoint (or any other slide-oriented) presentations at Amazon. Instead, we write narratively structured six-page memos." The room reads them in silence at the start of the meeting, which he called study hall. He is blunt about the cost too. A good memo takes a week, because you write it, share it, set it aside and rewrite it.

37signals reaches the same conclusion from the other direction. Their [communication guide](https://37signals.com/how-we-communicate) makes it a rule: "Meetings are the last resort, not the first option." The reason sits one line below. "Writing solidifies, chat dissolves."

Before a meeting where something is proposed or decided, the person driving it writes a document. Not bullet points, a real structured argument. What they are proposing. Why. The trade-offs. The corner cases. The ways it could fail. An honest comparison against the alternatives, including the ones they reject and why. They refine it until it holds up.

Then they share it *before* the meeting, so everyone gets to do the one thing the meeting never allows: read it slowly, sit with it, poke at it, and arrive with considered objections instead of reflexive ones.

The meeting itself becomes almost boring, in the best way. It is no longer for downloading context or generating ideas on the fly. It is a focused session to resolve the specific doubts the document surfaced.

## "But writing a whole document takes too much time"

This used to be the killer objection, and it was fair. Writing well is slow. It punishes people who think clearly but write awkwardly, which describes a lot of very good engineers. Demanding a polished six-pager before every decision was a real tax.

That tax is mostly gone.

With an LLM you no longer spend more time hunting for the right phrasing than you spend on the actual thinking. You gather your thoughts, reason through the corner cases and the failure modes, lay out your points, hand over the raw material, and get a clean structured draft back. *Typing is free now.* Wording is free. Structure is free.

But here is the whole game: **the model writes the words, not the argument.** It cannot do your thinking for you, and the moment you let it try you have quietly recreated the exact problem we are trying to kill. A confident-looking proposal with no real reasoning behind it, now dressed in a structure that *lies* about how much thought went in. The author still has to think about every edge case, every alternative, every way it breaks. That part stays hard, because that part was always the point. The LLM removes the part that was never valuable.

## What this looks like in practice

Picture a team whose checkout service is timing out under load. Two people have a view.

Priya has spent the last week buried in the traces. She is convinced the real problem is that checkout does too much synchronously, with payment, inventory, email and analytics all in the request path, and the fix is to push the non-critical work onto a queue. Marcus, the staff engineer, has not looked closely, but his gut says scale the database with read replicas.

**The meeting version.** The EM frames the problem. Marcus, comfortable and senior, lays out the read-replica plan first. Priya tries to explain that the bottleneck is the synchronous fan-out rather than the database, but two sentences in someone asks a clarifying question, Marcus answers it *his* way, and the thread is gone. She never gets to show the trace. Replicas win because the most confident voice in the room wanted replicas. Three weeks and a migration later, checkout still times out, because the database was never the problem. Priya knew that on day one.

**The document version.** Priya writes it up first. The trace data, plainly: most of the latency is downstream calls, not queries. The proposal: move inventory sync, email and analytics to a queue. A section on the corner cases, covering what happens if the queue backs up, how to handle a payment that succeeds while a queued step fails, and how to keep the user's confirmation honest. Then an explicit comparison: *here's why read replicas won't fix this, given that reads aren't the bottleneck.*

Marcus reads it the night before. The data answers his replica instinct before he says it out loud, so instead of defending it he shows up with something genuinely useful: a hard question about that payment-succeeds-but-queue-fails case Priya flagged. That is real staff-engineer value, and it surfaced only because the meeting was not a contest over who talks first. The decision is better, and Marcus made it better.

Same people. Same seniority gap. Completely different outcome, because the thinking happened *before* the room rather than in it.

## Why it works

- **No half-baked ideas.** A proposal that cannot survive being written down honestly dies quietly at the author's desk instead of loudly wasting eight people's afternoon.
- **Informed objections, not reflexive ones.** Everyone arrives having processed the idea. Their pushback is nuanced because they had time to make it nuanced.
- **No fifteen-minute context dump.** The document already told everyone what the meeting is about. People show up having *thought about it* rather than hearing it for the first time.
- **It removes production blocking.** One person talks; everyone else queues instead of thinks. [Diehl and Stroebe named this in 1987](https://doi.org/10.1037/0022-3514.53.3.497) as the main reason brainstorming groups underperform the same people working alone. A document lets everyone speak at once.
- **The quiet, correct person gets heard.** The engineer who needs an hour to assemble the killer argument now has that hour, in writing, where confidence and volume do not decide who is right.

## The one caveat

Not every decision earns a document. "Which of these two variable names" does not need a six-pager, and writing one would be its own kind of waste. The rule scales with the stakes: a quick Slack thread for the small stuff, a real document for anything you would regret getting wrong, such as architecture, a meaningful trade-off, or a decision that is expensive to reverse.

For the decisions that matter, the ones we instinctively call a meeting for, flip the order. Write first. Read first. Think first.

Then meet. You will be amazed how short the meeting gets.
