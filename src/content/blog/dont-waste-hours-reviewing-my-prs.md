---
title: "Don't waste hours reviewing my PR's"
date: 2026-07-05
description: "Synchronous, blocking code review is the biggest tax on shipping. Make review asynchronous — and trust the tests."
---

## The problem was never the comments. It's the waiting.

Here's my day. I build a feature. I raise a PR. Then I wait.

Two hours later — sometimes six — a reviewer comes back. Rename this variable. This method is doing too much, can you break it up? Maybe extract this into a helper. None of it would have broken anything. None of it changes whether the feature works. And every single one of these comments is something I could have fixed myself in thirty seconds, in a follow-up PR, without a human sitting in the critical path of my afternoon.

So I make the changes. I push again. I wait again. A few more comments trickle in. Finally — *finally* — it merges.

That whole loop is the single biggest tax on how fast I ship. And I don't think it's paying for itself anymore.

Let's be honest about what synchronous, blocking code review actually costs. It's not the two minutes it takes to rename `data` to `userRecords`. It's that my work sits frozen while I context-switch to something else, lose the thread, and then have to swap the whole feature back into my head an hour later to address a comment that solved a minor problem I could have solved myself.

Take a concrete case. The feature works, the tests pass, it's ready to merge — and the reviewer notices the empty-state message says "No results found" when it should say "No orders yet." That's a real improvement. It should happen. But it is not a reason to hold a working, tested feature hostage for another review round. Merge it. Then either raise a two-line follow-up PR yourself, or drop a note: "hey, can you fix that copy in a quick PR?" The fix still gets made — it just doesn't block the thing that was already done. A minor issue that wouldn't break anything doesn't need to sit in the merge path; it needs a ticket or a follow-up commit. Blocking a finished feature to fix a typo is like refusing to let a train leave the station because one seat cushion is crooked.

The typical cycle looks like this:

1. Build the feature.
2. Send it for review.
3. Wait a few hours.
4. Get the review.
5. Make the fixes.
6. Get a few more comments.
7. Repeat.
8. Merge.

Steps 3 through 7 are almost pure latency. The value delivered — a working feature — was done at step 1. Everything after is a queue.

## One stuck PR stalls the whole stack

And it's worse than a single stalled feature, because features aren't independent. They stack. Feature B builds on Feature A. Feature C builds on B. That's how real systems get built — incrementally, each change standing on the one before it.

So when Feature A sits in review for six hours, it doesn't cost six hours. It blocks B, which blocks C. Either I'm branching off unmerged code and praying the review doesn't force changes that ripple down my whole stack, or I'm just sitting there, idle, waiting for the base to land before I can safely build on it. One reviewer's afternoon nap on my PR quietly freezes a chain of work behind it.

Multiply that across a team and the blocking review isn't a per-PR tax anymore — it's a traffic jam. Every car waits because the one at the front is waiting. The latency compounds, and it compounds fastest for exactly the people shipping the most, because they have the most stacked on top.

## Something actually changed, and our process didn't notice

The LLM writes the code now. That's not a hot take anymore, it's just Tuesday.

Which means my job as a developer has quietly shifted. I'm not hand-crafting every line so a senior can bless my craftsmanship. My job is to **review the code the LLM produced**, decide whether it's right, and either ask the model to fix it or fix it myself. And then — this is the part that matters — **I write the tests that prove the feature actually works.**

The tests are the contract. The tests are the thing a naming-convention comment will never be. If the tests pass and they genuinely cover the behavior, the feature works. If a senior reviewer's comment wouldn't have caused a test to fail, ask yourself honestly: what did that comment protect the system from?

Most of the time, the answer is: nothing. It solved a minor problem. It was taste dressed up as risk.

## What blocking review optimizes for is mostly dead weight

Naming conventions. Cyclomatic complexity limits. "This function is doing too much." "Can we extract this?" These are the greatest hits of the six-hour review, and here's the thing — a linter and a static analyzer already catch the ones that matter, automatically, in CI, in seconds. I don't need a human being to be the linter. I *have* a linter.

The rest is preference. And preferences don't deserve to block a merge.

## The model I actually want

Here's the loop I'd run instead:

* **Build the feature.**
* **Write the tests.** Real ones, that verify the feature works.
* **Verify it works.** Run it. Watch it pass.
* **Review the LLM-generated code yourself.** You're the first reviewer. Own that.
* **Raise the PR — and if you're confident you did a good job, merge it.**

That's it. If you're sure, you ship.

Now, I'm not an anarchist. There's a clear escape hatch: **if you're skeptical, if you want a second pair of eyes, or if the change is genuinely dangerous — touches the database, handles sensitive data, migrates something that can't be un-migrated — you go get a review.** On purpose. Because *you* judged it needed one.

The difference is that review becomes a tool the author reaches for when the work calls for it, not a tollbooth every change has to crawl through regardless of risk. Trivial change? Ship it. Scary change? Get the review. You know which is which — you wrote it.

Own your work. Finish the task. Move to the next one.

## Make review asynchronous, not absent

I'm not saying oversight disappears. I'm saying it stops being a blocker and becomes a review-in-depth.

The team lead, the stakeholder, the senior engineer — they go through the merged commits **asynchronously.** On their schedule, in a batch, with actual context, looking at real shipped behavior instead of a diff frozen in amber. If they spot something off, they ask the developer who wrote it to improve it, or they revert it. The system keeps its safety net. It just moves the net *after* the merge instead of turning it into a gate before.

This flips the incentive. Instead of a reviewer looking for something to comment on so their review "counts," they're looking for things that actually matter across a body of work. Patterns. Real risks. Not a rename.

Here's the kind of thing this actually catches. Imagine five PRs merged over two days, each one perfectly reasonable on its own. In the first, a developer adds a direct database query inside a request handler to hit a deadline. In the second, someone copies that pattern because it was already there. By the fifth, three different endpoints are all querying the same table slightly differently, and a slow query is starting to show up in production. A blocking per-PR review would have waved every single one of those through — each diff looked fine in isolation. The reviewer staring at PR #2 has no idea PR #5 is coming. But a lead reading the last two days of commits *as a body of work* sees the pattern immediately: "we're leaking data access into the handlers, let's pull this into a repository layer before it spreads further." That's a real architectural correction, made once, with full context — the exact thing the frozen-diff, one-PR-at-a-time model is structurally blind to.

That's the trade. You give up the illusion that every line was blessed before it merged, and in return you get oversight that can actually see across the work instead of squinting at one diff at a time.

## Trust the developers — and hold them accountable

The whole thing rests on one idea: **trust the people who have been doing the work.** If someone has shipped reliably for months, why are we treating every one of their PRs like it's their first day?

But trust without accountability is just hope, so here's the mechanism I'd pair it with — call it **three strikes.**

You merge on your own judgment. If the async review comes back and your work has to be improved — a real correction, not a nitpick — that's a strike. Get asked to improve your work **three times**, and you lose the privilege: **you can no longer merge a PR without review until the team lead explicitly gives your merge rights back.**

It's self-correcting. Ship good work and you keep your speed. Ship sloppy work and the system tightens around you automatically, no drama, no permanent punishment. Earn your way back by demonstrating you've recalibrated. The developers who are careful get to move fast. The ones who aren't get guardrails until they don't need them anymore. That's fair, and it's honest.

## The objections, and why they don't hold

**"But bugs will slip through."** Some will. They slip through blocking review too — six-hour reviews are theater as often as they're a safety net. The tests are your real defense, and async review plus three strikes catches the rest. The question isn't "will anything ever slip," it's "does the current process catch enough to justify its cost." I don't think it does.

**"Juniors need mentorship."** Yes — and mentorship is a deliberate, opt-in review, exactly the escape hatch above. Pair on the scary stuff. Review the learning moments. That's not the same as gating every senior's trivial PR behind a queue.

**"Compliance requires review."** Then those repos require review, and you scope it there. Sensitive systems, regulated code, the database migrations — those get the second look *by design*. Everything else doesn't have to inherit that ceremony.

## Ship it

The old model assumed the bottleneck was writing code and the safeguard was a human reading every line before it merged. It also assumed that keeping a function's complexity down to 15 was a gift to the future — that the real payoff of all that refactoring was avoiding a costly rewrite later, or sparing the next developer the mental tax of understanding what the code does.

But that whole justification rested on a human being the one who had to read it, hold it in their head, and untangle it. That's no longer the only option. The LLM writes the code, reads the code, debugs the code, and explains the code back to the developer in plain language on demand. The next engineer doesn't have to reverse-engineer a dense function line by line — they can ask, and get an answer in seconds. The mental tax the complexity rule was designed to prevent got a lot cheaper to pay.

So no, you don't need to religiously keep every function under 15. Keep it readable enough to be correct and safe to change — but stop treating an arbitrary complexity number as a merge-blocking crisis. All of these assumptions are aging out. The LLM writes the code. The tests prove it works. You are the first and most accountable reviewer of your own work.

So stop waiting six hours for someone to tell you to rename a variable. Build the feature. Write the tests. Verify it. Review it. If you're sure, merge it. If you're not, go get the eyes you need.

Own your work — and go build the next thing.
