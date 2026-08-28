---
title: "What RFM segmentation reveals on a public ecommerce dataset"
date: 2026-07-12
description: "Running a Recency-Frequency-Monetary breakdown on an open orders dataset, and what it says about where revenue really sits."
---

> Worked example on a **public, open dataset**. No client or private data. This is the
> shareable version of the kind of analysis I run privately on real store data.

The fastest way to understand an ecommerce business is to stop looking at totals and start
looking at *who* is buying. RFM scores every customer on three axes, Recency, Frequency and
Monetary value, then buckets them into segments like **Champions**, **At Risk** and
**Hibernating**.

Run it on a typical open orders dataset and the same pattern shows up, one that usually
surprises the owner:

- A small **Champions** segment, often under 15% of customers, drives an outsized share of
  revenue.
- A large **At Risk** segment, customers who used to buy often and have gone quiet, holds
  revenue that is already earned and quietly leaking away.
- The **Hibernating** tail is big but low-value. Discounting to win it back costs more than
  it returns.

The actionable read is not "get more customers." It is **protect the Champions and win back
the At Risk group before they are gone**, two moves that need no new acquisition spend.

That is the shape of it from public data. The interesting part is how little math RFM needs.
Three `groupby` operations and a quintile split reframe a business more usefully than most
dashboards. It is a recurring theme in this work: the method that *changes the decision* is
often much simpler than the method that looks impressive.
