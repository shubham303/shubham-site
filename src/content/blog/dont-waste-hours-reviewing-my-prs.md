---
title: "Don't waste hours reviewing my PRs: make review async"
date: 2026-07-05
description: "Synchronous, blocking code review is the biggest tax on shipping. Make review asynchronous, and trust the tests."
---

**Blocking code review costs more than it catches.** Make the tests the gate and let the author merge. Move human review to an asynchronous pass over merged commits, where a reviewer sees patterns across a body of work instead of squinting at one frozen diff.

## The problem was never the comments. It's the waiting.

Here is my day. I build a feature. I raise a PR. Then I wait.

Two hours later, sometimes six, a reviewer comes back. Rename this variable. This method is doing too much, can you break it up? Maybe extract this into a helper. None of it would have broken anything. None of it changes whether the feature works. Every one of those comments is something I could have fixed myself in thirty seconds, in a follow-up PR, without a human sitting in the critical path of my afternoon.

So I make the changes. I push again. I wait again. A few more comments trickle in. Finally it merges.

That loop is the single biggest tax on how fast I ship, and it no longer pays for itself.

Be honest about what synchronous, blocking review actually costs. The cost is not the two minutes it takes to rename `data` to `userRecords`. The cost is that my work sits frozen while I context-switch to something else, lose the thread, and then swap the whole feature back into my head an hour later to address a comment about a minor problem I could have solved myself.

Take a concrete case. The feature works, the tests pass, it is ready to merge, and the reviewer notices the empty-state message says "No results found" when it should say "No orders yet." That is a real improvement and it should happen. It is not a reason to hold a working, tested feature hostage for another review round. Merge it. Then either raise a two-line follow-up PR yourself or drop a note: "hey, can you fix that copy in a quick PR?" The fix still gets made without blocking the thing that was already done. A minor issue that would not break anything needs a ticket or a follow-up commit, not a place in the merge path. Blocking a finished feature to fix a typo is like refusing to let a train leave the station because one seat cushion is crooked.

The typical cycle looks like this:

1. Build the feature.
2. Send it for review.
3. Wait a few hours.
4. Get the review.
5. Make the fixes.
6. Get a few more comments.
7. Repeat.
8. Merge.

Steps 3 through 7 are almost pure latency, and the cost is measured rather than merely felt.
[DORA's research on change approval](https://dora.dev/capabilities/streamlining-change-approval/)
finds that heavyweight approval processes correlate with *worse* delivery performance. They
recommend peer review during development, backed by automation. Their write-up on
[trunk-based development](https://dora.dev/capabilities/trunk-based-development/) names the
failure mode. Laborious review pushes developers to batch up changes. Bigger batches make bigger
reviews. Bigger reviews make reviewers procrastinate. The spiral goes one way. The value
delivered, a working feature, was done at step 1. Everything after it is a queue.

## One stuck PR stalls the whole stack

It is worse than a single stalled feature, because features are not independent. They stack. Feature B builds on Feature A. Feature C builds on B. That is how real systems get built, incrementally, each change standing on the one before it.

So when Feature A sits in review for six hours it does not cost six hours. It blocks B, which blocks C. Either I branch off unmerged code and pray the review does not force changes that ripple down my whole stack, or I sit idle waiting for the base to land before I can safely build on it. One reviewer's afternoon nap on my PR quietly freezes a chain of work behind it.

Multiply that across a team and blocking review stops being a per-PR tax and becomes a traffic jam. Every car waits because the one at the front is waiting. The latency compounds, and it compounds fastest for the people shipping the most, because they have the most stacked on top.

## Something actually changed, and our process didn't notice

The LLM writes the code now. That is not a hot take anymore, it is just Tuesday.

My job as a developer has quietly shifted with it. I am not hand-crafting every line so a senior can bless my craftsmanship. My job is to **review the code the LLM produced**, decide whether it is right, and either ask the model to fix it or fix it myself. Then, the part that matters, **I write the tests that prove the feature works.**

The tests are the contract, in a way a naming-convention comment never will be. If the tests pass and they genuinely cover the behavior, the feature works. If a senior reviewer's comment would not have caused a test to fail, ask yourself honestly what that comment protected the system from.

Most of the time the answer is nothing. It solved a minor problem. It was taste dressed up as risk.

## What blocking review optimizes for is mostly dead weight

Even Google runs a lighter process than the teams citing Google think.
[Sadowski et al. studied 9 million reviewed changes](https://research.google/pubs/modern-code-review-a-case-study-at-google/)
and describe a system built on small changes, one reviewer by default, and heavy tooling. No
committee reads every line.

Naming conventions. Cyclomatic complexity limits. "This function is doing too much." "Can we extract this?" These are the greatest hits of the six-hour review, and a linter and a static analyzer already catch the ones that matter, automatically, in CI, in seconds. I do not need a human being to be the linter. I *have* a linter.

The rest is preference, and preferences do not deserve to block a merge.

## The model I actually want

Here is the loop I would run instead:

* **Build the feature.**
* **Write the tests.** Real ones, that verify the feature works.
* **Verify it works.** Run it. Watch it pass.
* **Review the LLM-generated code yourself.** You are the first reviewer. Own that.
* **Raise the PR, and if you are confident you did a good job, merge it.**

That is it. If you are sure, you ship.

I am not an anarchist about this. There is a clear escape hatch: **if you are skeptical, if you want a second pair of eyes, or if the change is genuinely dangerous, meaning it touches the database, handles sensitive data or migrates something that cannot be un-migrated, go get a review.** On purpose, because *you* judged it needed one.

Review then becomes a tool the author reaches for when the work calls for it, rather than a tollbooth every change crawls through regardless of risk. Trivial change? Ship it. Scary change? Get the review. You know which is which, because you wrote it.

Own your work. Finish the task. Move to the next one.

## Make review asynchronous, not absent

Oversight does not disappear here. It stops being a blocker and becomes review-in-depth.

The team lead, the stakeholder and the senior engineer go through the merged commits **asynchronously.** On their schedule, in a batch, with actual context, looking at real shipped behavior instead of a diff frozen in amber. If they spot something off, they ask the developer who wrote it to improve it, or they revert it. The system keeps its safety net. The net simply moves *after* the merge instead of becoming a gate before it.

This flips the incentive. Instead of hunting for something to comment on so their review "counts," a reviewer looks for things that matter across a body of work. Patterns. Real risks. Not a rename.

Here is the kind of thing it catches. Imagine five PRs merged over two days, each one reasonable on its own. In the first, a developer adds a direct database query inside a request handler to hit a deadline. In the second, someone copies that pattern because it was already there. By the fifth, three different endpoints query the same table slightly differently, and a slow query starts showing up in production. A blocking per-PR review would have waved every one of them through, because each diff looked fine in isolation. The reviewer staring at PR #2 has no idea PR #5 is coming. A lead reading the last two days of commits *as a body of work* sees the pattern immediately: "we're leaking data access into the handlers, let's pull this into a repository layer before it spreads further." That is a real architectural correction, made once, with full context. It is the exact thing the frozen-diff, one-PR-at-a-time model is structurally blind to.

That is the trade. You give up the illusion that every line was blessed before it merged, and in return you get oversight that can see across the work instead of squinting at one diff at a time.

## Trust the developers, and hold them accountable

The whole thing rests on one idea: **trust the people who have been doing the work.** If someone has shipped reliably for months, why treat every one of their PRs like it is their first day?

Trust without accountability is just hope, so pair it with a mechanism. Call it **three strikes.**

You merge on your own judgment. If the async review comes back and your work has to be improved, a real correction rather than a nitpick, that is a strike. Get asked to improve your work **three times** and you lose the privilege: **you can no longer merge a PR without review until the team lead explicitly gives your merge rights back.**

It is self-correcting. Ship good work and you keep your speed. Ship sloppy work and the system tightens around you automatically, with no drama and no permanent punishment. Earn your way back by demonstrating you have recalibrated. Careful developers get to move fast. The rest get guardrails until they no longer need them. That is fair, and it is honest.

## The objections, and why they don't hold

**"But bugs will slip through."** Some will. They slip through blocking review too, since six-hour reviews are theater as often as they are a safety net. The tests are your real defense, and async review plus three strikes catches the rest. The question is not whether anything will ever slip. It is whether the current process catches enough to justify its cost. I do not think it does.

**"Juniors need mentorship."** They do, and mentorship is a deliberate, opt-in review, exactly the escape hatch above. Pair on the scary stuff. Review the learning moments. That is different from gating every senior's trivial PR behind a queue.

**"Compliance requires review."** Then those repos require review, and you scope it there. DORA
makes the same point from the compliance side: peer review plus automated checks satisfies
separation of duties more reliably than an external approval board. Sensitive systems, regulated
code and database migrations get the second look *by design*. Everything else does not have to
inherit that ceremony.

## Ship it

The old model assumed the bottleneck was writing code and the safeguard was a human reading every line before it merged. It also assumed that keeping a function's complexity under 15 was a gift to the future, that all that refactoring bought you an avoided rewrite later, or spared the next developer the mental tax of understanding what the code does.

That justification rested on a human being the one who had to read it, hold it in their head and untangle it. That is no longer the only option. The LLM writes the code, reads the code, debugs the code and explains it back in plain language on demand. The next engineer can ask instead of reverse-engineering a dense function line by line, and get an answer in seconds. The mental tax the complexity rule was designed to prevent got a lot cheaper to pay.

So no, you do not need to religiously keep every function under 15. Keep it readable enough to be correct and safe to change, and stop treating an arbitrary complexity number as a merge-blocking crisis. These assumptions are aging out. The LLM writes the code. The tests prove it works. You are the first and most accountable reviewer of your own work.

Stop waiting six hours for someone to tell you to rename a variable. Build the feature. Write the tests. Verify it. Review it. If you are sure, merge it. If you are not, go get the eyes you need.

Own your work, and go build the next thing.
