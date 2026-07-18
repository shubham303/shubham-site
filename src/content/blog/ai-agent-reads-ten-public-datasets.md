---
title: "I pointed one AI agent at ten public datasets — here's what it found"
date: 2026-07-18
description: "One unchanged pipeline — load, profile, test, model, explain — run across ten different open datasets. Each section is the plain-language report the agent produced."
---

> Worked examples on **public, open datasets** — no client or private data. This is the
> shareable version of the kind of analysis I run privately on real business data.

I've been building a data agent that does the boring-but-hard part of analysis on its own:
it loads a table, profiles every column, tests which relationships are real, models the
outcome you care about, and then — the part that actually matters — translates all of that
into a few sentences a decision-maker can use. No dashboards, no notebook full of charts to
interpret. One question in, one clear answer out.

To show what that looks like, I ran the *same pipeline, unchanged* across ten well-known
public datasets — restaurants, real estate, cars, wine, biology, the economy. Each section
below is the report the agent handed back, formatted exactly as it produces them. The point
isn't any single finding; it's that the same machine gets to a usable answer on wildly
different data.

## 1. Restaurant tipping — what actually decides the tip

<div class="tir">
  <style>
    .tir{--tir-bg:#ffffff;--tir-ink:#1a1c22;--tir-mut:#5c626e;--tir-line:#e7e9ee;--tir-accent:#2f6df6;--tir-soft:#f5f7fb;--tir-good:#12805c;
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
      color:var(--tir-ink);background:var(--tir-bg);border:1px solid var(--tir-line);border-radius:14px;
      padding:26px 26px 22px;margin:28px 0;line-height:1.55;box-shadow:0 1px 3px rgba(20,25,40,.05);}
    @media (prefers-color-scheme:dark){.tir{--tir-bg:#15171c;--tir-ink:#e8eaf0;--tir-mut:#9aa1b0;--tir-line:#2a2e38;--tir-accent:#5b8bff;--tir-soft:#1b1e26;--tir-good:#3ecf9a;box-shadow:none;}}
    .tir *{box-sizing:border-box;}
    .tir-tag{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--tir-accent);margin:0 0 6px;}
    .tir h3{font-size:22px;margin:0 0 4px;font-weight:700;letter-spacing:-.01em;}
    .tir-sub{color:var(--tir-mut);font-size:14px;margin:0 0 18px;}
    .tir-callout{background:var(--tir-soft);border-left:3px solid var(--tir-accent);border-radius:8px;padding:14px 16px;margin:0 0 22px;font-size:15px;}
    .tir-callout b{color:var(--tir-ink);}
    .tir-h{font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--tir-mut);margin:22px 0 12px;}
    .tir-bar{display:grid;grid-template-columns:120px 1fr 48px;align-items:center;gap:12px;margin:9px 0;font-size:14px;}
    .tir-bar .lab{color:var(--tir-ink);font-weight:600;}
    .tir-track{background:var(--tir-soft);border-radius:6px;height:16px;overflow:hidden;}
    .tir-fill{height:100%;background:var(--tir-accent);border-radius:6px;}
    .tir-bar .pct{text-align:right;color:var(--tir-mut);font-variant-numeric:tabular-nums;font-size:13px;}
    .tir-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin:6px 0 4px;}
    .tir-stat{background:var(--tir-soft);border-radius:10px;padding:14px;}
    .tir-stat .n{font-size:24px;font-weight:700;letter-spacing:-.02em;}
    .tir-stat .l{font-size:12.5px;color:var(--tir-mut);margin-top:2px;}
    .tir ul.tir-rec{margin:6px 0 0;padding-left:18px;}
    .tir ul.tir-rec li{margin:8px 0;font-size:15px;}
    .tir-foot{margin-top:22px;padding-top:14px;border-top:1px solid var(--tir-line);font-size:12.5px;color:var(--tir-mut);}
  </style>

  <div class="tir-tag">Automated analysis · restaurant tipping</div>
  <h3>What actually decides how much a table tips</h3>
  <p class="tir-sub">244 dinner &amp; lunch checks · one table · analysed end-to-end by the agent</p>

  <div class="tir-callout">
    <b>Bottom line:</b> The size of the check explains the tip almost entirely.
    Party size nudges it a little; the day of week, the shift, whether guests smoked,
    and the diner's gender make almost no practical difference. If you want tips to
    grow, grow the check — not the schedule.
  </div>

  <div class="tir-h">What moves the tip</div>
  <div class="tir-bar"><span class="lab">Check size</span><span class="tir-track"><span class="tir-fill" style="width:100%"></span></span><span class="pct">86%</span></div>
  <div class="tir-bar"><span class="lab">Party size</span><span class="tir-track"><span class="tir-fill" style="width:7.5%"></span></span><span class="pct">6%</span></div>
  <div class="tir-bar"><span class="lab">Day of week</span><span class="tir-track"><span class="tir-fill" style="width:6%"></span></span><span class="pct">5%</span></div>
  <div class="tir-bar"><span class="lab">Smoker at table</span><span class="tir-track"><span class="tir-fill" style="width:2%"></span></span><span class="pct">2%</span></div>
  <div class="tir-bar"><span class="lab">Guest gender</span><span class="tir-track"><span class="tir-fill" style="width:1%"></span></span><span class="pct">&lt;1%</span></div>
  <div class="tir-bar"><span class="lab">Lunch vs dinner</span><span class="tir-track"><span class="tir-fill" style="width:0.5%"></span></span><span class="pct">~0%</span></div>

  <div class="tir-h">The numbers behind it</div>
  <div class="tir-grid">
    <div class="tir-stat"><div class="n">$19.79</div><div class="l">Average check</div></div>
    <div class="tir-stat"><div class="n">$3.00</div><div class="l">Average tip</div></div>
    <div class="tir-stat"><div class="n">~15%</div><div class="l">Effective tip rate</div></div>
    <div class="tir-stat"><div class="n">±$0.73</div><div class="l">Tip predictable from the bill within this</div></div>
  </div>

  <div class="tir-h">What this means for the floor</div>
  <ul class="tir-rec">
    <li><b>Sell the check, not the shift.</b> Tables above ~$34 tip about $5; tables under
      ~$11 tip under $2. A single upsell — a starter, a second round, dessert — is worth
      more to tip income than any night of the week.</li>
    <li><b>Don't chase "good tables."</b> The instinct that certain guests tip better
      (by gender, by shift, by smoker status) doesn't hold up in the data — those signals
      are real but tiny. Coaching servers on them wastes attention.</li>
    <li><b>Bigger parties help mostly because they spend more.</b> Party size matters, but
      largely as a proxy for check size — it isn't a separate lever.</li>
  </ul>

  <div class="tir-foot">
    Produced automatically by an AI data agent: the table was loaded, profiled, tested for
    associations, and modelled, then the drivers were ranked and translated into plain
    language — the same pipeline, unchanged, run on every dataset. Public open dataset;
    no private data.
  </div>
</div>

The whole folklore of the "good table" mostly evaporates. If tip income is what you care
about, the lever is check size — one starter, one more round — not the night or the shift.
Party size looks like it matters, but mostly because bigger parties spend more.

---

*More sections coming — real estate, diamonds, cars, wine, and more. I'm a data scientist:
if you've got a pile of data and a decision hiding in it, [get in touch](mailto:randiveshubham3@gmail.com).*
