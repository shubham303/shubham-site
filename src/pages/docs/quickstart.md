---
layout: ../../layouts/Docs.astro
title: Quickstart
---

# Quickstart

Once the [server is installed](/docs/install), everything happens in plain language inside your
agent.

## 1. Load data

Point the agent at a CSV (orders, transactions, donations, usage — anything tabular):

> "Analyze `orders.csv` with Table Intelligence."

The server loads it locally into DuckDB for analysis. Nothing is uploaded.

## 2. Ask real questions

> - "Run an RFM segmentation on customer_id, order_date, amount."
> - "What's the month‑over‑month revenue change, and is it significant?"
> - "Which customers are likely to churn?"
> - "Did the price change cause the drop in orders?"

Each answer includes a **trust level** and caveats. If the data can't support the question (too
few rows, no variation, a failed robustness check), the tool **declines** and says why — take
that seriously; it's the honest result.

## 3. Save a report

> "Generate a report of these findings and save it to a folder called Q3."

The agent composes a markdown report (findings **plus** their trust and caveats) and saves it to
your account. Saving needs an active trial or premium.

## 4. Read it on the web

Open your [dashboard](/dashboard) to browse folders and reports, and share any report as a public
link. See [Reports & dashboard](/docs/reports).
