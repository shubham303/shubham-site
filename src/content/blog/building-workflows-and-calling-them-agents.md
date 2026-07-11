---
title: "You Are Building Workflows and Calling Them Agents"
date: 2026-06-06
description: "Why 'one skill per use case' is going to collapse under its own weight — and the three-tier model to build instead."
---

## Why "one skill per use case" is going to collapse under its own weight — and what to build instead

If you've worked on an LLM-powered product for more than a few weeks, you've probably had this argument: *What actually is a "skill"? How is it different from a script, or a tool, or an "agent"?* Everyone nods along, and then the next pull request ships a "skill" that turns out to be a Python script wearing a markdown costume.

I want to make a case that this confusion isn't cosmetic. It points at a structural mistake in how a lot of teams (mine included) are building these systems. The short version: **we keep writing one self-contained workflow per use case, calling each one a skill, and telling ourselves we've built an agent.** We haven't. And the approach is going to scale badly.

Let me build the argument from the ground up, starting with vocabulary, because half the disagreements come from words meaning different things to different people.

## Setting the vocabulary straight

### Workflow

A **workflow** is a pre-defined sequence of steps. The *developer* decides the path ahead of time. Steps, branches, and loops are fixed — either in code, or in prose the model is told to follow line by line like a script.

If an LLM appears in a workflow at all, it's doing one of two narrow jobs:

* Filling in a blank inside a step the developer defined ("draft an email body given these variables").
* Lightly interpreting an expected input ("pull the city out of this free-text address").

The **control flow is fixed.** The model doesn't decide what happens next. The workflow does.

### Agent

An **agent** is the opposite. Given a goal, the model picks the next action, looks at the result, and decides what to do next. The control flow is **determined by the model**, not by your code.

The model has a set of tools available (APIs, MCP servers, scripts, `bash`, `curl`). It has a set of skills telling it how to use those tools correctly. But the *order* in which it composes them is decided at runtime, based on the goal.

### Skill

A **skill** is a piece of prose loaded into the model's context. It teaches the model something it wouldn't otherwise know — usually one of: which tool to use, what the fields in a response mean, how to handle a tricky case, or how to format an output.

Skills are **inputs to the model's decision-making**, not replacements for it. A good skill makes the model better at choosing the right action. It does not make the choice on the model's behalf.

There are exactly three ways a skill earns its keep:

**1. It disambiguates between plausible tools.** A user asks, *"find Maya Chen."* Without a skill, the model scans its tool catalog and sees half a dozen candidates — `search_users`, `get_user_by_id`, `list_team_members`, `getPublicProfile`, a generic `search` endpoint — and has to *reason* about which one is right. That reasoning burns tokens, adds latency, and still picks wrong often enough to matter (a wrong call fetches the wrong data and poisons the rest of the run).

A skill collapses all of that into: *"To find a user by name, call `search_users` with `{q: <name>, type: USER}`. The response is a paginated list under `results[]`; each entry has `id`, `firstName`, `lastName`, `email`, `status`. Use `id` for any follow-up lookups."* The model skips the exploration entirely.

**2. It tells the model how *we* want a specific task done.** Drafting an email is the classic case. Without guidance, the model produces *some* email — probably fine — but the voice is generic, the structure drifts run to run, and the sign-off doesn't match how your company actually talks. A skill nails it down: *"Emails use a warm, peer-to-peer tone. First line references something specific about the recipient. No marketing language. Sign off with the sender's first name, team, and contact line. Keep the body under 120 words."* Consistent, on-brand output, with zero email logic written in code.

**3. It supplies domain knowledge.** The model can read JSON; it can't infer your business semantics from key names. What does `status: "ACTIVE"` mean — hired? fully onboarded? still in their probation window? A skill encodes the meaning: *"`status` reflects employment state. `ACTIVE` means employed AND fully onboarded; `PENDING` means onboarding in progress; `INACTIVE` means offboarded. `manager` is who they report to (set at hire, immutable). For their current onboarding buddy, read `mentor`."* Now when the model has to decide "is this person onboarded?", it gets it right the first time.

All three share one property: the skill **shapes** the model's decision without **making** it. The model is still free to compose, branch, and adapt.

### Tool

A **tool** is something the model can call. Deterministic, well-defined, does one thing — an MCP tool you author (`get_user`), or an upstream API you point the model at (`GET /users/{id}/profile`).

A tool is a verb, not a workflow. `get_user` is a tool. `remind_all_my_reports_who_havent_finished_onboarding` is **not** a tool — it's a workflow disguised as one.

### Script

A **script** is plain code. No LLM. Deterministic. The right choice when the problem has one phrasing and one happy path, and an LLM in the loop adds nothing.

## The test that cuts through it

Here's the one heuristic worth memorizing:

> **If you can delete the LLM from your skill and replace it with a few `if`/`for` blocks, you didn't write a skill — you wrote a script with markdown decoration.**

That single test is the heart of what's going wrong.

## The core observation

By those definitions, **nearly every "skill" most teams ship is actually a workflow.** The control flow is baked into the markdown. Strip the LLM out, drop in some code, and the thing still runs end to end.

Two examples — generic, but they'll look familiar.

**The "onboarding reminder" skill.** It encodes a fixed sequence:

1. Get the current manager.
2. Get their team members.
3. For each member, fetch the onboarding checklist.
4. Filter to the ones with incomplete steps.
5. Render and send an email per person.

That's a script. An engineer could write it in Python in an afternoon, and the result would be cheaper and more reliable than the LLM version. The model here is, at best, filling in templates.

**The "customer milestone email" skill.** Same shape:

1. Get all customers.
2. For each, check whether a birthday / signup anniversary / renewal date falls in the relevant window.
3. Render and send a message per match.

Strip the LLM, write five lines of Python, identical outcome.

If a script can replace the agent, **it was never an agent.** It was a workflow with an LLM bolted on for templating.

## Why this is a problem

Workflows aren't bad. They're great when they fit. The problem is using workflows as the **default unit of work**. That choice carries three concrete costs.

### 1. Each skill solves exactly one phrasing of one task

The onboarding-reminder skill handles literally *"send reminders to my team."* It does **not** handle any of the things a real user will actually type:

* "Which of my team members haven't finished onboarding?"
* "Has Jordan completed onboarding? If not, nudge him."
* "List my incomplete reports and tell me which step each is stuck on."
* "Find my reports in the Berlin office who haven't onboarded and remind them."

The milestone skill is the same story — "happy birthday to my US customers", "anniversary email to one specific customer", "show me whose renewal is this month." Every variant needs a new skill, or a fatter skill with more branches. The combinatorial explosion is real, and it starts immediately. Your product surface stays narrow because the price of each new variant is *write another skill.*

### 2. You're doing work the model should be doing

Every conditional, every loop, every filter inside a workflow-shaped skill is logic the model could derive at runtime — *if you gave it the right primitives.* You're spending engineering cycles on the part the model is good at (composing steps) while under-investing in the part only you can do (handing the model the right tools and the right knowledge of how to use them).

### 3. You're building things you'll have to throw away

Whatever the destination platform looks like, the unit it will care about is **tools + instructions + the model deciding what to call.** That's where every agent framework is heading. Workflow-shaped skills don't map cleanly onto that shape — they're scripts in markdown. Every one you add is rewrite work you're queuing up for future-you.

## The alternative: three tiers

The fix is a strict three-tier layering, with one rule: **higher tiers compose from lower tiers, never the reverse.**

### Tier 1 — Tools (atomic, deterministic, no LLM)

One API call or one well-defined MCP tool. Either something you author (`get_user`, `get_onboarding_checklist`, `send_email`) or an upstream endpoint you point the model at directly. You don't have to wrap every existing API in a shim — if the endpoint is already shaped right, a Tier 2 skill can just point at it.

These are the only things that touch the outside world. Stable, testable, reusable everywhere, zero workflow logic.

### Tier 2 — Atomic skills (teach the model how to use one thing well)

Each atomic skill answers one of: *Which tool gets X? What does this response mean? How do I reliably extract Y? What gotchas exist?*

Some examples:

* **"User details"** — which API fetches a person's profile, what the response looks like, what every field means (name, contact, manager, mentor, status, team). From this *one* skill the model answers "what's their email?", "who's their manager?", "are they ACTIVE?" — no separate skill per field.
* **"Onboarding checklist"** — which API fetches a checklist, the response shape, what each step is, what the statuses (`complete`, `pending`, `blocked`) mean, and edge cases (someone with no checklist yet). Powers "is X onboarded?", "where are they stuck?", "what's their next step?"
* **"Customer details"** — the customer record and every field on it (birthday, signup date, country, plan tier, contact prefs), how to handle missing values, any normalization helpers (e.g. ISO country codes). One skill becomes the model's whole reference for a customer.
* **"How to draft an email in our voice"** — tone, signature, formatting. The cross-cutting style skill every email flow leans on.
* **"How to create a support ticket"** — which API opens a ticket, mandatory vs optional fields, valid enum values (priority, category, status), which IDs to resolve first (customer, assignee), common validation errors and fixes, and preconditions. Note this is **not** a workflow — it's not "first find the customer, then the assignee, then create." It's the model's reference manual for *one action*: when the model has decided it needs to open a ticket, this tells it exactly how. The decision to open one, and how the inputs were gathered, belongs to the model.

The pattern: **one skill per coherent entity or action, not one skill per question.** "How to find a customer's country" is too narrow — it recreates the combinatorial explosion at the skill level. "Customer details" is right, and from it the model can answer "customers in the US," "renewals this week," "customers in Berlin with a birthday this month," all from the same knowledge.

These skills carry **no workflow.** The moment a skill starts saying *"first do A, then B, then C,"* it has become a Tier 3 artifact and should be moved.

### Tier 3 — Prompt engineering

A Tier 3 artifact is **a pre-written, detailed prompt, shipped as a markdown file, that captures the goal and (when needed) the steps to reach it.** It's the prompt the user *would* have typed, frozen on your side so the model gets it every time the task runs.

Why bother? Some flows run again and again — the same person repeating "send my weekly onboarding reminders," many users on the same well-worn path, a scheduler firing a nightly job. For those, two things are wasteful: making the user re-type a careful prompt, and making the model re-plan the same flow from scratch. A Tier 3 prompt removes both. The invocation becomes a short trigger or a cron entry, and the model jumps straight to execution.

It can be short or long. For tasks the model already handles, a line or two suffices: *"Send a friendly reminder to every team member whose onboarding is incomplete. Skip anyone reminded in the last 7 days."* For harder tasks — non-obvious sequencing, easy-to-miss preconditions — spell out the steps as a safety rail. Write the **shortest** prompt that gets it right.

Crucially, a Tier 3 prompt is **composed from Tiers 1 and 2** — it never re-implements logic that lives below it:

1. Use the *user details* skill (T2) to fetch the manager and their reports.
2. For each report, use the *onboarding checklist* skill (T2) to find incomplete steps.
3. Use the *draft email* skill (T2) to write the reminder.
4. Call `send_email` (T1) to deliver it.

If a Tier 3 prompt is doing its own checklist parsing or its own email logic, the layering has been violated and the same logic now lives in two places.

**Promote to Tier 3 only when** the flow runs repeatedly, or users keep typing the same long prompt, or it's a background job with no human to phrase it, or it's complex enough that the model plans it wrong often, or it needs predictability (compliance, auditability). If none of those hold, you're freezing a phrasing nobody asked for and paying maintenance on it forever.

And Tier 3 is **not** code and **not** deterministic. The model still executes it and will deviate if the user's real ask doesn't fit. You're shaping the prompt, not replacing the agent.

## A walked-through example

> "Find my team members and send onboarding reminders to the ones who haven't finished."

**Today's approach:** write a new workflow-shaped skill that hard-codes the five steps. It works for this exact phrasing. It does **not** work for "where are my reports stuck?", "has Jordan finished?", or "only remind my Berlin reports." Each variant needs a new skill or a new fork. Your velocity gets eaten alive writing skills for variations the model could handle itself.

**Proposed approach:** invest in primitives.

*Tools:* `get_user`, `get_onboarding_checklist`, `send_email`. *Atomic skills:* *user details*, *onboarding checklist*, *how to draft an email.*

At runtime the model composes: fetch the manager and their reports → for each, read the checklist → decide who needs an email (exactly the kind of conditional the model is good at) → draft the copy → send. The **same four primitives** also answer "where are my reports stuck?", "has Jordan finished?", "only my Berlin reports," and "how many are at the final step?" — **with no new skills written.** They just work, because the primitives were good.

## The harder variant: a request you never anticipated

A week later, the user asks something new:

> "Send a congratulations email to all my team members who have **completed** onboarding."

This is the *opposite* intent — celebrating people who finished, not chasing people who are stuck. No overlap.

**Today:** you'd need a brand-new skill. New name, new prose, new review, new maintenance. The user gets nothing until you hear the request, prioritize it, and ship it. And next week they'll ask for "congrats to people who finished in the last 30 days," and you're writing *another* one.

**Proposed:** you write **nothing.** The *user details* skill already tells the model how to get the reports. The *onboarding checklist* skill already explains what `complete` means at the checklist level. The model composes: get reports → read each checklist → keep the ones where every step is complete → draft congrats → send. First try, no PR, no deploy.

This is the whole argument in one example. With workflow-shaped skills, you're in a perpetual race against the next phrasing. With atomic skills, the model handles variations you never anticipated **for free.** Each atomic skill expands what the model can do **multiplicatively**; each Tier 3 prompt expands it **additively**, by one phrasing.

Notice we didn't have to *predict* the congratulations request. The capability fell out of primitives built for an unrelated use case. The useful planning question stops being *"how fast can we ship the next skill?"* and becomes *"how much capability are we getting per skill we ship?"*

## The customer-milestone equivalent

*Tools:* `get_customers`, `send_email`. *Atomic skills:* *customer details* (dates, country, plan tier, contact prefs), *how to draft a milestone greeting.*

For free, you get "happy holidays to my US customers," "anniversary email to one customer," "renewals this month," "customers with a birthday this week." One skill becomes a vocabulary that covers ten variants. Today, those ten variants would be ten skills.

## What this gives you

1. **Long-tail coverage.** Every phrasing a user might try becomes reachable without new skills. The product surface grows much faster than the engineering cost.
2. **Compounding leverage.** Improve an atomic skill once — better extraction, a new edge case — and every use case benefits automatically. Workflows duplicate logic; atomic skills consolidate it.
3. **Portability.** When the platform changes (it will), tools stay tools, atomic skills become system-prompt fragments, Tier 3 prompts become orchestration. No business logic is rewritten — only the glue moves.
4. **"Skill" finally means something.** A skill exists to *disambiguate*, *interpret*, or *save tokens.* It does **not** exist to encode "the workflow for use case X." That's what Tier 3 is for.
5. **The dev confusion evaporates.** Calls an upstream system → **tool.** Teaches the model how to use a tool or read a response → **atomic skill.** End-to-end logic you'd rather not re-derive every run → **Tier 3 prompt, built on the layers below.** A pre-digestion helper → **a script the skill references**, not a standalone "skill."

## How you test it

An atomic-skill world is *more* testable, not less — three layers, three strategies.

**Deterministic helpers inside skills — unit tests.** Because Tier 2 skills are scoped to one entity, you can pull their deterministic parts into small Python helpers and test them directly: `extract_field(user_response, field_name)`, `format_address(user_response)`, `update_user(user_id, field_name, value)`. Each has a defined input and output. If a schema drifts, the tests catch it before the model ever sees it.

**Tier 1 tools — unit tests.** Already standard. Nothing changes except a cleaner boundary: a tool does one well-defined thing.

**The agentic layer — regression / integration tests.** This is the genuinely new part, and it answers the *"but the model might do the wrong thing"* worry head-on. For each representative query, run the model with the same skills and tools as production, **with all external tools mocked**, and assert on:

* **Tool-call shape** — which tools were called, in what order where order matters, with what arguments. ("`get_user` called once with the current user's ID; `get_onboarding_checklist` once per report; `send_email` only for the incomplete ones.")
* **Grounding** — no invented fields, no fabricated IDs; every argument traces back to a prior tool response.
* **Completeness** — every expected call actually happened.
* **Final output** — given the mocked responses, the user-facing reply matches the expected shape.

These pin down behavior without being brittle to harmless model variation — you assert on structure and output shape, not on the exact wording of intermediate reasoning.

## The ask

1. **Stop adding monolithic workflow-shaped skills by default.** First question for a new use case is *"which atomic skills and tools are missing?"* — not *"what do we name the skill?"*
2. **For each existing workflow skill, find the atomic skills and tools hiding inside it,** and extract them. The Tier 3 prompt, if still needed, becomes a thin composition over the atomic layer.
3. **Promote to Tier 3 only when usage data shows the same composition repeated** enough to justify freezing — and build it *on* Tiers 1 and 2, never in parallel.
4. **Treat the agentic layer as the product surface and the workflow layer as an optimization on top** — not the other way around.
5. **Invest in the supporting infrastructure** — evals on atomic skills, tracing of model decisions, dashboards on which compositions actually get used.

## TL;DR

We're building workflows and calling them agents. The cost: one phrasing per skill, logic the model could derive itself encoded by hand, and a pile of work we'll have to rewrite because it should have been composable from the start. The fix is a three-tier model — atomic tools, atomic teaching skills, and thin Tier 3 prompts composed from both. It happens to dissolve the endless "skill vs script vs tool" argument along the way. Adopt the layering as the default for all new work.
