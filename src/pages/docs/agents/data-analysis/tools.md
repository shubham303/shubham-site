---
layout: ../../../../layouts/Docs.astro
title: Data analysis — Tools reference
---

# Data analysis — Tools reference

You don't call these directly — the [Data analysis agent](/docs/agents/data-analysis) picks the right
tool from your question. This is what's available to it.

## Every result is honest

Each tool returns a structured result: the **method** chosen, a plain‑language **summary**, the
**values**, and a **trust** block:

```json
"trust": { "level": "moderate",
           "caveats": ["Moderate sample (120 rows) — reasonable but not definitive.",
                       "This is a before/after comparison, not a causal test."] }
```

`level` is one of `high` / `moderate` / `low` / `none` / `unassessed`. When a tool **declines**,
`declined` is `true` and no misleading number is returned.

## Analytics (free, run locally)

| Area | Tools |
|------|-------|
| Explore | `profile`, `run_sql`, `detect_outliers`, `group_aggregate`, `compare_periods` |
| Customers | `rfm`, `retention_cohorts` |
| Association | `analyze_association`, `association_matrix`, `market_basket` |
| Prediction | `train_classifier`, `train_regressor`, `feature_importance`, `explain_prediction` |
| Time series | `forecast`, `decompose`, `detect_changepoints` |
| Causal | `causal_effect` (declines unless the data can support a credible estimate) |
| Clustering | `cluster`, `profile_clusters`, `reduce_dimensions` |

All analytics are **free forever** and run entirely on your machine.

## Account & reports (pro / trial)

| Tool | Purpose |
|------|---------|
| `account_status` | Show your role (`free` or `pro`). |
| `save_report` | Save a report to your account. |
| `list_reports`, `get_report` | Browse saved reports. |
| `create_folder`, `list_folders` | Organize reports. |

Saving reports needs an active trial or pro subscription — see [Pricing](/pricing). Saved reports
land on your [dashboard](/docs/agents/data-analysis/reports), where you can organise and share them.
