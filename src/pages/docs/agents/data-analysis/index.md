---
layout: ../../../../layouts/Docs.astro
title: Data analysis agent
---

# Data analysis agent

The **Data analysis agent** brings real data science into your AI agent — cohorts, RFM,
retention, forecasting, classification, association mining and causal inference — and runs it on
**your machine**. You ask questions in plain language; it does the statistics and explains the
answer, including how much to trust it.

It's one of the agents in the Table Intelligence [suite](/docs). Everything here runs locally; your
data never leaves your computer (see [Privacy & data](/docs/privacy)).

## What you can ask

Once the [server is installed](/docs/install), just point your agent at a CSV — orders,
transactions, donations, usage, anything tabular — and ask. Some examples, by what you're trying
to do:

**Understand a table**

> "Analyze `orders.csv` with Table Intelligence."
> "Profile this file — what's in each column, what's missing, what's unusual?"

**Segment your customers**

> "Run an RFM segmentation on customer_id, order_date, amount."
> "Show me monthly retention cohorts. Where are we leaking customers?"

**Find what drives a number**

> "What's most associated with a high order value?"
> "Did the price change cause the drop in orders?"

**Predict**

> "Which customers are likely to churn?"
> "Forecast next quarter's revenue, and tell me how confident that is."

**Explain a result**

> "Why did the model flag this customer as high-risk?"

Each answer comes back with a plain-language summary and the numbers behind it.

## Every result is honest about its own limits

This is the bit that separates a real analysis from a confident-sounding guess. Every answer
carries a **trust level** and its caveats:

```json
"trust": { "level": "moderate",
           "caveats": ["Moderate sample (120 rows) — reasonable but not definitive.",
                       "This is a before/after comparison, not a causal test."] }
```

And when the data can't actually support the question — too few rows, no variation, a failed
robustness check — the agent **declines** instead of inventing a number:

```json
"method": "causal_effect", "declined": true,
"trust": { "level": "none",
           "decline_reason": "Only 18 rows — too few for a credible causal estimate." }
```

Take a decline seriously: it's the honest answer, and it's more useful than a confident number
that isn't real. Trust levels range from `high` → `moderate` → `low` → `none`.

## Where the output goes

By default the answers just appear in your chat. When you want to keep something, ask the agent to
[save it as a report](/docs/reports) — it lands on your [dashboard](/dashboard), where you can
organise it into folders and share a public link.

## Next

- [Install](/docs/install) the server, if you haven't.
- [Quickstart](/docs/quickstart) walks through a first analysis end to end.
- The full [tools reference](/docs/tools) lists every capability, if you want the complete map.
