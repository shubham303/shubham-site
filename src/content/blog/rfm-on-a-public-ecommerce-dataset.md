---
title: "What RFM segmentation reveals on a public ecommerce dataset"
date: 2026-07-12
description: "Running a Recency-Frequency-Monetary breakdown on an open orders dataset — and what it says about where revenue really sits."
---

> Worked example on a **public, open dataset** — no client or private data. This is the
> shareable version of the kind of analysis I run privately on real store data.

One of the fastest ways to understand an ecommerce business is to stop looking at totals
and start looking at *who* is buying. RFM — Recency, Frequency, Monetary — scores every
customer on three axes and buckets them into segments like **Champions**, **At Risk**, and
**Hibernating**.

Run on a typical open orders dataset, the pattern is almost always the same and almost
always surprising to the owner:

- A small **Champions** segment (often <15% of customers) drives a wildly outsized share
  of revenue.
- A large **At Risk** segment — customers who used to buy often but have gone quiet —
  represents revenue that is *already earned and quietly leaking away*.
- The **Hibernating** tail is big but low-value; discounting to win it back usually costs
  more than it returns.

The actionable read isn't "get more customers." It's: **protect the Champions, and win
back the At Risk group before they're gone** — two moves that need no new acquisition spend.

That's the shape of it from public data. The interesting part is how little math RFM
actually needs — it's three `groupby` operations and a quintile split — yet it reframes a
business more usefully than most dashboards. A recurring theme in this kind of work: the
method that *changes the decision* is often much simpler than the method that looks
impressive.
