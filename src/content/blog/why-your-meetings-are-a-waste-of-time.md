---
title: "Why Your Meetings Are a Waste of Time (and How to Fix It)"
date: 2026-06-06
description: "A room full of people thinking out loud, all at once, is the worst environment for thinking. Write first. Read first. Then meet."
---

Someone on your team has a decision to make. How to fix a nasty bug. Which way to structure a service. Whether to build the thing at all. And almost on reflex, the same sentence comes out:

*"Let's just hop on a call."*

On paper, it's the obvious move. You have a decision. You get the relevant people in a room. You talk it through. You walk out with a consensus and a path forward. Clean.

In practice, most of those meetings are a waste of everyone's time. Not because the people are dumb or the topic isn't important — but because of *what we're asking the meeting to do.* We're asking a room full of people to think, in real time, out loud, all at once. And that is just about the worst possible environment for thinking.

## The meeting doesn't reward the best idea. It rewards the loudest, fastest, most senior one.

Watch what actually happens in a decision meeting.

The person with the most authority states their view early, and from that moment the gravity of the room bends toward it. The engineer who has been knee-deep in the actual problem — the one person who knows where the bodies are buried — rarely gets to win an argument against a senior who's operating two levels of abstraction up. Seniority gets mistaken for correctness.

And even when there *is* real discussion, nobody is actually analyzing the problem. Everyone is listening just enough to find their opening, while privately rehearsing the next thing they want to say. You start making a point and before you can land it, someone interjects, the topic drifts, and your half-formed argument dies on the table. Nobody gets the silence they need to think through the downsides of the thing being proposed — including the person proposing it.

So most of the time the senior person walks out with the exact decision they walked in with. The meeting wasn't where the decision got made. It was theater performed *around* a decision that was already made.

Here's the part that should bother you most. How many times have you sat in a meeting, failed to find the right words, gone along with something — and then an hour later, free and quiet at your desk, assembled the clear, sharp argument you wish you'd had? That argument was *real.* It existed. The meeting just gave you no room to produce it. Multiply that by every person who stayed quiet, and you start to see how much intelligence these meetings leave on the floor.

## The meeting should be the last step, not the first.

The fix isn't to abolish meetings. It's to stop using them as the place where thinking *happens* and start using them as the place where thinking gets *tested.*

This is the idea Amazon is famous for. Before a meeting where something is being proposed or decided, the person driving it writes a document. Not bullet points — a real, structured argument. What they're proposing. Why. The trade-offs. The corner cases. The ways it could fail. An honest comparison against the alternatives, including the ones they're rejecting and why. They refine it until it actually holds up.

Then they share it *before* the meeting, so everyone gets to do the one thing the meeting never allows: read it slowly, sit with it, poke at it, and arrive with considered objections instead of reflexive ones.

The meeting itself becomes almost boring — in the best way. It's no longer for downloading context or generating ideas on the fly. It's a focused session to resolve the specific doubts the document surfaced.

## "But writing a whole document takes too much time."

This used to be the killer objection, and it was a fair one. Writing well is slow. It punishes people who think clearly but write awkwardly — which is a lot of very good engineers. Telling someone to produce a polished six-pager before every decision was a real tax.

That tax is mostly gone now.

With an LLM, you no longer have to spend more time hunting for the right phrasing than you spend on the actual thinking. You gather your thoughts, reason through the corner cases and the failure modes, lay out your points, and hand it the raw material — and you get a clean, structured draft back. *Typing is free now.* Wording is free. Structure is free.

But — and this is the whole game — **the model writes the words, not the argument.** It cannot do your thinking for you, and the moment you let it try, you've quietly recreated the exact problem we're trying to kill: a confident-looking proposal with no real reasoning behind it, except now it's dressed in a structure that *lies* about how much thought went in. The author still has to think about every edge case, every alternative, every way it breaks. That part stays hard, because that part was always the point. The LLM just removes the part that was never valuable in the first place.

## What this looks like in practice

Picture a team whose checkout service is timing out under load. Two people have a view.

Priya has spent the last week buried in the traces. She's convinced the real problem is that checkout does too much synchronously — payment, inventory, email, analytics, all in the request path — and the fix is to push the non-critical work onto a queue. Marcus, the staff engineer, hasn't looked closely, but his gut says scale the database with read replicas.

**The meeting version.** The EM frames the problem. Marcus, comfortable and senior, lays out the read-replica plan first. Priya tries to explain that the database isn't the bottleneck — the synchronous fan-out is — but two sentences in, someone asks a clarifying question, Marcus answers it *his* way, and the thread is gone. She never gets to show the trace. Replicas win because the most confident voice in the room wanted replicas. Three weeks and a migration later, checkout still times out, because the database was never the problem. Priya knew that on day one.

**The document version.** Priya writes it up first. The trace data, plainly: most of the latency is downstream calls, not queries. The proposal: move inventory sync, email, and analytics to a queue. A section on the corner cases — what happens if the queue backs up, how to handle a payment that succeeds while a queued step fails, how to keep the user's confirmation honest. And an explicit comparison: *here's why read replicas won't fix this, given that reads aren't the bottleneck.*

Marcus reads it the night before. His replica instinct gets answered by the data before he ever says it out loud — so instead of defending it, he shows up with something genuinely useful: a hard question about that payment-succeeds-but-queue-fails case Priya flagged. That's real staff-engineer value, and it only surfaced because the meeting wasn't a contest over who talks first. The decision is better, and Marcus made it better.

Same people. Same seniority gap. Completely different outcome — because the thinking happened *before* the room, not in it.

## Why it works

- **No half-baked ideas.** If a proposal can't survive being written down honestly, it dies quietly at the author's desk instead of loudly wasting eight people's afternoon.
- **Informed objections, not reflexive ones.** Everyone arrives having actually processed the idea. Their pushback is nuanced because they've had time to make it nuanced.
- **No fifteen-minute context dump.** The document already told everyone what the meeting is about. People show up having *thought about it*, not hearing it for the first time.
- **The quiet, correct person gets heard.** The engineer who needs an hour to assemble the killer argument now has that hour — in writing, where confidence and volume don't decide who's right.

## The one caveat

Not every decision earns a document. "Which of these two variable names" does not need a six-pager, and writing one would be its own kind of waste. The rule scales with the stakes: a quick Slack thread for the small stuff, a real document for anything you'd regret getting wrong — architecture, a meaningful trade-off, a decision that's expensive to reverse.

But for those decisions — the ones that actually matter, the ones we instinctively call a meeting for — flip the order. Write first. Read first. Think first.

Then meet. You'll be amazed how short the meeting gets.
