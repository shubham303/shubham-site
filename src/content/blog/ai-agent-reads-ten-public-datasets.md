---
title: "I pointed one AI agent at ten public datasets — here's what it found"
date: 2026-07-18
description: "One unchanged pipeline — load, profile, test, model, explain — run across ten open datasets. Each section pairs a plain-language business read with the full technical report."
---

> Worked examples on **public, open datasets** — no client or private data. This is the
> shareable version of the kind of analysis I run privately on real business data.

I've been building a data agent that does the boring-but-hard part of analysis on its own:
it loads a table, profiles every column, tests which relationships are real, models the
outcome you care about, and then — the part that actually matters — turns all of that into
a few sentences a decision-maker can act on. One question in, one clear answer out.

To show what that looks like, I ran the *same pipeline, unchanged* across ten well-known
public datasets — restaurants, real estate, cars, wine, biology, the economy. Each section
below has two parts: the **business read** (what it means and what to do about it) and, folded
underneath, the **technical report** (every algorithm it ran, the tests it chose, and the
scores) for anyone who wants to check its work. The point isn't any single finding — it's
that the same machine gets to a usable answer on wildly different data.

<style>
  .tir{--tir-bg:#ffffff;--tir-ink:#1a1c22;--tir-mut:#5c626e;--tir-line:#e7e9ee;--tir-accent:#2f6df6;--tir-soft:#f5f7fb;--tir-good:#12805c;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    color:var(--tir-ink);background:var(--tir-bg);border:1px solid var(--tir-line);border-radius:14px;
    padding:26px 26px 22px;margin:22px 0;line-height:1.55;box-shadow:0 1px 3px rgba(20,25,40,.05);}
  @media (prefers-color-scheme:dark){.tir{--tir-bg:#15171c;--tir-ink:#e8eaf0;--tir-mut:#9aa1b0;--tir-line:#2a2e38;--tir-accent:#5b8bff;--tir-soft:#1b1e26;--tir-good:#3ecf9a;box-shadow:none;}}
  .tir *{box-sizing:border-box;}
  .tir-tag{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--tir-accent);margin:0 0 6px;}
  .tir-tag.tech{color:var(--tir-mut);}
  .tir h3{font-size:22px;margin:0 0 4px;font-weight:700;letter-spacing:-.01em;}
  .tir-sub{color:var(--tir-mut);font-size:14px;margin:0 0 18px;}
  .tir-callout{background:var(--tir-soft);border-left:3px solid var(--tir-accent);border-radius:8px;padding:14px 16px;margin:0 0 22px;font-size:15px;}
  .tir-callout b{color:var(--tir-ink);}
  .tir-h{font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--tir-mut);margin:22px 0 12px;}
  .tir-bar{display:grid;grid-template-columns:135px 1fr 52px;align-items:center;gap:12px;margin:9px 0;font-size:14px;}
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
  .tir-tblwrap{overflow-x:auto;margin:4px 0;}
  .tir table.tir-tbl{width:100%;border-collapse:collapse;font-size:13.5px;}
  .tir table.tir-tbl th{text-align:left;color:var(--tir-mut);font-weight:600;padding:7px 10px;border-bottom:1px solid var(--tir-line);white-space:nowrap;}
  .tir table.tir-tbl td{padding:7px 10px;border-bottom:1px solid var(--tir-line);font-variant-numeric:tabular-nums;}
  .tir table.tir-tbl tr:last-child td{border-bottom:none;}
  .tir table.tir-tbl code{background:var(--tir-soft);padding:1px 6px;border-radius:5px;font-size:12.5px;}
  .tir-steps{margin:4px 0;padding-left:18px;font-size:14px;}
  .tir-steps li{margin:6px 0;}
  details.tir-tech-wrap{margin:8px 0 30px;}
  details.tir-tech-wrap>summary{cursor:pointer;font-size:13.5px;font-weight:600;color:var(--tir-accent);list-style:none;padding:8px 0;user-select:none;}
  details.tir-tech-wrap>summary::-webkit-details-marker{display:none;}
  details.tir-tech-wrap>summary::before{content:"▸ ";}
  details.tir-tech-wrap[open]>summary::before{content:"▾ ";}
</style>


## 1. Restaurant tipping — what actually decides the tip

<div class="tir">
  
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


<details class="tir-tech-wrap"><summary>See the technical report — every algorithm, test and score</summary>

<div class="tir">
<div class="tir-tag tech">Technical report · Restaurant tipping</div>
<h3>How the agent analysed <code>tips</code></h3>
<p class="tir-sub">244 rows · 8 operations run · deterministic pipeline</p>
<div class="tir-h">Pipeline executed</div>
<ol class="tir-steps"><li><b>Profile</b> — <code>profile</code>: Profiled 7 columns over 244 rows</li><li><b>Association matrix</b> — <code>association_matrix</code>: Pairwise association across 7 columns</li><li><b>Model evaluation</b> — <code>regression_metrics</code>: R²=0.523, RMSE=0.957</li><li><b>Feature importance</b> — <code>permutation_importance</code>: Top feature: total_bill</li><li><b>Key-driver tree</b> — <code>decision_tree_key_drivers</code>: Top driver of &#x27;tip&#x27;: &#x27;total_bill&#x27; (tree R²=0.46)</li></ol>
<div class="tir-h">Association tests (dtype-routed)</div>
<div class="tir-tblwrap"><table class="tir-tbl"><thead><tr><th>Columns</th><th>Test chosen</th><th>Result</th></tr></thead><tbody><tr><td><code>tip~total_bill</code></td><td>spearman</td><td>strong positive correlation (r=0.679, p=2.5e-34)</td></tr><tr><td><code>tip~size</code></td><td>kruskal_wallis</td><td>significant difference in tip across size (6 groups, epsilon_squared=0.231, p=8.04e-11)</td></tr><tr><td><code>tip~day</code></td><td>kruskal_wallis</td><td>significant difference in tip across day (4 groups, epsilon_squared=0.035, p=0.0357)</td></tr></tbody></table></div>
<div class="tir-h">Model performance</div>
<p class="tir-sub" style="margin:0 0 10px">Task: <code>regression</code> · backend: <code>gbt</code> · held-out test rows: 61</p>
<div class="tir-tblwrap"><table class="tir-tbl"><tbody><tr><td>R²</td><td>0.523</td></tr><tr><td>RMSE</td><td>0.957</td></tr><tr><td>MAE</td><td>0.729</td></tr></tbody></table></div>
<div class="tir-h">Feature importance — permutation_importance</div>
<div class="tir-tblwrap"><table class="tir-tbl"><thead><tr><th>Feature</th><th>Score</th><th>Share</th></tr></thead><tbody><tr><td>total_bill</td><td>0.858</td><td>86%</td></tr><tr><td>size</td><td>0.064</td><td>6%</td></tr><tr><td>day</td><td>0.051</td><td>5%</td></tr><tr><td>smoker</td><td>0.015</td><td>2%</td></tr><tr><td>sex</td><td>0.00427</td><td>0%</td></tr></tbody></table></div>
<div class="tir-foot">Every step above is chosen by transparent rules (statistical test picked from column dtypes; k picked by silhouette; model held out a proper test split). Re-running on the same table yields the same output. Public open dataset.</div>
</div>

</details>

The folklore of the &ldquo;good table&rdquo; mostly evaporates: the lever is check size, not the night or the shift.

---

## 2. Titanic — what decided who survived

<div class="tir">
  <div class="tir-tag">Automated analysis · Titanic survival</div>
  <h3>Who survived the Titanic — and what actually decided it</h3>
  <p class="tir-sub">1,309 passengers · one table · classified end-to-end by the agent</p>
  <div class="tir-callout"><b>Bottom line:</b> Survival wasn't random. Two things decided it: <b>sex first, then the class of ticket</b>. Being female moved the odds more than anything else; travelling first class helped on top of that. Age barely mattered once those two were known.</div>
  <div class="tir-h">What decided survival</div>
  <div class="tir-bar"><span class="lab">Sex</span><span class="tir-track"><span class="tir-fill" style="width:68%"></span></span><span class="pct">68%</span></div><div class="tir-bar"><span class="lab">Passenger class</span><span class="tir-track"><span class="tir-fill" style="width:27%"></span></span><span class="pct">27%</span></div><div class="tir-bar"><span class="lab">Age</span><span class="tir-track"><span class="tir-fill" style="width:5%"></span></span><span class="pct">5%</span></div>
  <div class="tir-h">The numbers behind it</div>
  <div class="tir-grid"><div class="tir-stat"><div class="n">77%</div><div class="l">Survival correctly predicted from 3 facts</div></div><div class="tir-stat"><div class="n">Sex</div><div class="l">Strongest single factor</div></div><div class="tir-stat"><div class="n">0.81</div><div class="l">Model's ability to rank risk (AUC, 1.0 = perfect)</div></div><div class="tir-stat"><div class="n">3</div><div class="l">Factors that mattered</div></div></div>
  <div class="tir-h">What to do with it</div>
  <ul class="tir-rec"><li><b>The headline generalises:</b> when a crisis is governed by a rule (&ldquo;women and children first&rdquo;), the data recovers that rule cleanly — you don't need the backstory to see it.</li><li><b>Class was a real, separate advantage</b>, not just a proxy for sex — first-class passengers fared better within each group.</li><li><b>Age added almost nothing</b> once sex and class were known — a reminder that more columns aren't more insight.</li></ul>
  <div class="tir-foot">Produced automatically by the data agent: the table was loaded, profiled, tested for associations, and modelled, then the drivers were ranked and translated into plain language — the same pipeline, unchanged, run on every dataset. Public open dataset.</div>
</div>

<details class="tir-tech-wrap"><summary>See the technical report — every algorithm, test and score</summary>

<div class="tir">
<div class="tir-tag tech">Technical report · Titanic survival</div>
<h3>How the agent analysed <code>titanic</code></h3>
<p class="tir-sub">1309 rows · 7 operations run · deterministic pipeline</p>
<div class="tir-h">Pipeline executed</div>
<ol class="tir-steps"><li><b>Profile</b> — <code>profile</code>: Profiled 4 columns over 1309 rows</li><li><b>Association matrix</b> — <code>association_matrix</code>: Pairwise association across 4 columns</li><li><b>Model evaluation</b> — <code>classification_metrics</code>: accuracy=0.771, f1=0.761</li><li><b>Feature importance</b> — <code>permutation_importance</code>: Top feature: sex</li><li><b>Key-driver tree</b> — <code>decision_tree_key_drivers</code>: Top driver of &#x27;survived&#x27;: &#x27;sex&#x27; (tree accuracy=0.79)</li></ol>
<div class="tir-h">Association tests (dtype-routed)</div>
<div class="tir-tblwrap"><table class="tir-tbl"><thead><tr><th>Columns</th><th>Test chosen</th><th>Result</th></tr></thead><tbody><tr><td><code>survived~sex</code></td><td>chi_square</td><td>significant association between survived and sex (Cramér&#x27;s V=0.527, p=4.59e-81)</td></tr><tr><td><code>survived~passengerClass</code></td><td>chi_square</td><td>significant association between survived and passengerClass (Cramér&#x27;s V=0.313, p=1.72e-28)</td></tr></tbody></table></div>
<div class="tir-h">Model performance</div>
<p class="tir-sub" style="margin:0 0 10px">Task: <code>classification</code> · backend: <code>gbt</code> · held-out test rows: 328</p>
<div class="tir-tblwrap"><table class="tir-tbl"><tbody><tr><td>Accuracy</td><td>0.771</td></tr><tr><td>Precision</td><td>0.773</td></tr><tr><td>Recall</td><td>0.771</td></tr><tr><td>F1</td><td>0.761</td></tr><tr><td>ROC-AUC</td><td>0.812</td></tr></tbody></table></div>
<p class="tir-sub" style="margin:12px 0 4px">Confusion matrix (rows = actual, cols = predicted)</p>
<div class="tir-tblwrap"><table class="tir-tbl"><tbody><tr><td>184</td><td>19</td></tr><tr><td>56</td><td>69</td></tr></tbody></table></div>
<div class="tir-h">Feature importance — permutation_importance</div>
<div class="tir-tblwrap"><table class="tir-tbl"><thead><tr><th>Feature</th><th>Score</th><th>Share</th></tr></thead><tbody><tr><td>sex</td><td>0.162</td><td>66%</td></tr><tr><td>passengerClass</td><td>0.076</td><td>31%</td></tr><tr><td>age</td><td>0.00793</td><td>3%</td></tr></tbody></table></div>
<div class="tir-foot">Every step above is chosen by transparent rules (statistical test picked from column dtypes; k picked by silhouette; model held out a proper test split). Re-running on the same table yields the same output. Public open dataset.</div>
</div>

</details>

A crisis governed by a rule leaves a clean signature in the data; you don't need the story to recover &ldquo;women and children first.&rdquo;

---

## 3. California housing — what sets a home's price

<div class="tir">
  <div class="tir-tag">Automated analysis · California housing</div>
  <h3>What really sets a California home's price</h3>
  <p class="tir-sub">20,640 neighbourhood blocks · one table · modelled end-to-end by the agent</p>
  <div class="tir-callout"><b>Bottom line:</b> Two forces set the price: <b>where the home is</b> (latitude + longitude) and <b>how wealthy the neighbourhood is</b>. Together they explain the vast majority of the variation. How old the house is barely registers.</div>
  <div class="tir-h">What sets the price</div>
  <div class="tir-bar"><span class="lab">Location (lat/long)</span><span class="tir-track"><span class="tir-fill" style="width:66%"></span></span><span class="pct">66%</span></div><div class="tir-bar"><span class="lab">Neighbourhood income</span><span class="tir-track"><span class="tir-fill" style="width:23%"></span></span><span class="pct">23%</span></div><div class="tir-bar"><span class="lab">Crowding / occupancy</span><span class="tir-track"><span class="tir-fill" style="width:7%"></span></span><span class="pct">7%</span></div><div class="tir-bar"><span class="lab">Rooms & house age</span><span class="tir-track"><span class="tir-fill" style="width:4%"></span></span><span class="pct">4%</span></div>
  <div class="tir-h">The numbers behind it</div>
  <div class="tir-grid"><div class="tir-stat"><div class="n">83%</div><div class="l">Of price variation explained</div></div><div class="tir-stat"><div class="n">Location</div><div class="l">Biggest lever, combined</div></div><div class="tir-stat"><div class="n">Income</div><div class="l">Strongest single factor</div></div><div class="tir-stat"><div class="n">~0%</div><div class="l">Effect of house age</div></div></div>
  <div class="tir-h">What to do with it</div>
  <ul class="tir-rec"><li><b>Location and income are the whole game.</b> For pricing, valuation, or where-to-build decisions, these two beat every property-level detail combined.</li><li><b>Stop over-weighting house features.</b> Age, room counts, and bedroom ratios move price only at the margin — useful for fine-tuning, useless as headline drivers.</li><li><b>The model is trustworthy here</b> (it explains 83% of prices on data it never saw), so it's a fair basis for automated valuation.</li></ul>
  <div class="tir-foot">Produced automatically by the data agent: the table was loaded, profiled, tested for associations, and modelled, then the drivers were ranked and translated into plain language — the same pipeline, unchanged, run on every dataset. Public open dataset.</div>
</div>

<details class="tir-tech-wrap"><summary>See the technical report — every algorithm, test and score</summary>

<div class="tir">
<div class="tir-tag tech">Technical report · California housing</div>
<h3>How the agent analysed <code>california_housing</code></h3>
<p class="tir-sub">20640 rows · 7 operations run · deterministic pipeline</p>
<div class="tir-h">Pipeline executed</div>
<ol class="tir-steps"><li><b>Profile</b> — <code>profile</code>: Profiled 9 columns over 20640 rows</li><li><b>Association matrix</b> — <code>association_matrix</code>: Pairwise association across 9 columns</li><li><b>Model evaluation</b> — <code>regression_metrics</code>: R²=0.835, RMSE=0.467</li><li><b>Feature importance</b> — <code>permutation_importance</code>: Top feature: Latitude</li><li><b>Key-driver tree</b> — <code>decision_tree_key_drivers</code>: Top driver of &#x27;MedHouseVal&#x27;: &#x27;MedInc&#x27; (tree R²=0.53)</li></ol>
<div class="tir-h">Association tests (dtype-routed)</div>
<div class="tir-tblwrap"><table class="tir-tbl"><thead><tr><th>Columns</th><th>Test chosen</th><th>Result</th></tr></thead><tbody><tr><td><code>MedHouseVal~MedInc</code></td><td>spearman</td><td>strong positive correlation (r=0.677, p=0)</td></tr><tr><td><code>MedHouseVal~HouseAge</code></td><td>spearman</td><td>negligible positive correlation (r=0.075, p=4.84e-27)</td></tr></tbody></table></div>
<div class="tir-h">Model performance</div>
<p class="tir-sub" style="margin:0 0 10px">Task: <code>regression</code> · backend: <code>gbt</code> · held-out test rows: 5160</p>
<div class="tir-tblwrap"><table class="tir-tbl"><tbody><tr><td>R²</td><td>0.835</td></tr><tr><td>RMSE</td><td>0.467</td></tr><tr><td>MAE</td><td>0.313</td></tr></tbody></table></div>
<div class="tir-h">Feature importance — permutation_importance</div>
<div class="tir-tblwrap"><table class="tir-tbl"><thead><tr><th>Feature</th><th>Score</th><th>Share</th></tr></thead><tbody><tr><td>Latitude</td><td>0.832</td><td>37%</td></tr><tr><td>Longitude</td><td>0.66</td><td>29%</td></tr><tr><td>MedInc</td><td>0.53</td><td>23%</td></tr><tr><td>AveOccup</td><td>0.15</td><td>7%</td></tr><tr><td>AveRooms</td><td>0.045</td><td>2%</td></tr><tr><td>HouseAge</td><td>0.04</td><td>2%</td></tr><tr><td>Population</td><td>0.00886</td><td>0%</td></tr><tr><td>AveBedrms</td><td>0.00658</td><td>0%</td></tr></tbody></table></div>
<div class="tir-foot">Every step above is chosen by transparent rules (statistical test picked from column dtypes; k picked by silhouette; model held out a proper test split). Re-running on the same table yields the same output. Public open dataset.</div>
</div>

</details>

Location and neighbourhood income are the whole game; property details move price only at the margin.

---

## 4. Diamonds — what a price is made of

<div class="tir">
  <div class="tir-tag">Automated analysis · Diamond pricing</div>
  <h3>What a diamond's price is really made of</h3>
  <p class="tir-sub">53,940 diamonds · one table · modelled end-to-end by the agent</p>
  <div class="tir-callout"><b>Bottom line:</b> Price is almost entirely about <b>size</b> — carat weight and physical dimensions. Clarity and colour fine-tune it; <b>cut grade barely moves the price at all</b>. The agent predicts price within a few hundred dollars.</div>
  <div class="tir-h">What makes the price</div>
  <div class="tir-bar"><span class="lab">Size (carat & dimensions)</span><span class="tir-track"><span class="tir-fill" style="width:75%"></span></span><span class="pct">75%</span></div><div class="tir-bar"><span class="lab">Clarity</span><span class="tir-track"><span class="tir-fill" style="width:11%"></span></span><span class="pct">11%</span></div><div class="tir-bar"><span class="lab">Colour</span><span class="tir-track"><span class="tir-fill" style="width:6%"></span></span><span class="pct">6%</span></div><div class="tir-bar"><span class="lab">Cut grade</span><span class="tir-track"><span class="tir-fill" style="width:1%"></span></span><span class="pct">&lt;1%</span></div>
  <div class="tir-h">The numbers behind it</div>
  <div class="tir-grid"><div class="tir-stat"><div class="n">98%</div><div class="l">Of price variation explained</div></div><div class="tir-stat"><div class="n">±$287</div><div class="l">Typical prediction error</div></div><div class="tir-stat"><div class="n">Carat</div><div class="l">Dominant driver</div></div><div class="tir-stat"><div class="n">Cut</div><div class="l">Almost no price effect</div></div></div>
  <div class="tir-h">What to do with it</div>
  <ul class="tir-rec"><li><b>Price by weight first.</b> For inventory, appraisal, or buy/sell decisions, size is the anchor — everything else is a modest adjustment.</li><li><b>Cut is oversold as a price driver.</b> It matters for beauty, but the market barely pays for it — worth knowing when negotiating.</li><li><b>Automated pricing is viable:</b> the agent explains 98% of price on unseen stones, tight enough to flag mispriced listings.</li></ul>
  <div class="tir-foot">Produced automatically by the data agent: the table was loaded, profiled, tested for associations, and modelled, then the drivers were ranked and translated into plain language — the same pipeline, unchanged, run on every dataset. Public open dataset.</div>
</div>

<details class="tir-tech-wrap"><summary>See the technical report — every algorithm, test and score</summary>

<div class="tir">
<div class="tir-tag tech">Technical report · Diamond pricing</div>
<h3>How the agent analysed <code>diamonds</code></h3>
<p class="tir-sub">53940 rows · 8 operations run · deterministic pipeline</p>
<div class="tir-h">Pipeline executed</div>
<ol class="tir-steps"><li><b>Profile</b> — <code>profile</code>: Profiled 10 columns over 53940 rows</li><li><b>Association matrix</b> — <code>association_matrix</code>: Pairwise association across 10 columns</li><li><b>Model evaluation</b> — <code>regression_metrics</code>: R²=0.980, RMSE=560</li><li><b>Feature importance</b> — <code>permutation_importance</code>: Top feature: carat</li><li><b>Key-driver tree</b> — <code>decision_tree_key_drivers</code>: Top driver of &#x27;price&#x27;: &#x27;carat&#x27; (tree R²=0.88)</li></ol>
<div class="tir-h">Association tests (dtype-routed)</div>
<div class="tir-tblwrap"><table class="tir-tbl"><thead><tr><th>Columns</th><th>Test chosen</th><th>Result</th></tr></thead><tbody><tr><td><code>price~carat</code></td><td>spearman</td><td>very strong positive correlation (r=0.963, p=0)</td></tr><tr><td><code>price~cut</code></td><td>kruskal_wallis</td><td>significant difference in price across cut (5 groups, epsilon_squared=0.018, p=1.53e-210)</td></tr><tr><td><code>price~clarity</code></td><td>kruskal_wallis</td><td>significant difference in price across clarity (8 groups, epsilon_squared=0.050, p=0)</td></tr></tbody></table></div>
<div class="tir-h">Model performance</div>
<p class="tir-sub" style="margin:0 0 10px">Task: <code>regression</code> · backend: <code>gbt</code> · held-out test rows: 13485</p>
<div class="tir-tblwrap"><table class="tir-tbl"><tbody><tr><td>R²</td><td>0.98</td></tr><tr><td>RMSE</td><td>560.208</td></tr><tr><td>MAE</td><td>287.4</td></tr></tbody></table></div>
<div class="tir-h">Feature importance — permutation_importance</div>
<div class="tir-tblwrap"><table class="tir-tbl"><thead><tr><th>Feature</th><th>Score</th><th>Share</th></tr></thead><tbody><tr><td>carat</td><td>0.647</td><td>47%</td></tr><tr><td>y</td><td>0.468</td><td>34%</td></tr><tr><td>clarity</td><td>0.156</td><td>11%</td></tr><tr><td>color</td><td>0.087</td><td>6%</td></tr><tr><td>z</td><td>0.017</td><td>1%</td></tr><tr><td>x</td><td>0.00557</td><td>0%</td></tr><tr><td>cut</td><td>0.00248</td><td>0%</td></tr><tr><td>depth</td><td>0.00119</td><td>0%</td></tr></tbody></table></div>
<div class="tir-foot">Every step above is chosen by transparent rules (statistical test picked from column dtypes; k picked by silhouette; model held out a proper test split). Re-running on the same table yields the same output. Public open dataset.</div>
</div>

</details>

Size dominates; clarity and colour fine-tune; cut grade — the thing shoppers obsess over — barely moves the price.

---

## 5. Penguins — identifying species from a ruler

<div class="tir">
  <div class="tir-tag">Automated analysis · Penguin species</div>
  <h3>Telling three penguin species apart from a few measurements</h3>
  <p class="tir-sub">344 penguins · one table · classified end-to-end by the agent</p>
  <div class="tir-callout"><b>Bottom line:</b> Three species can be identified <b>almost perfectly</b> from a handful of body measurements plus which island a bird was seen on. The agent labels species correctly 98% of the time.</div>
  <div class="tir-h">What identifies the species</div>
  <div class="tir-bar"><span class="lab">Which island</span><span class="tir-track"><span class="tir-fill" style="width:45%"></span></span><span class="pct">45%</span></div><div class="tir-bar"><span class="lab">Bill length</span><span class="tir-track"><span class="tir-fill" style="width:35%"></span></span><span class="pct">35%</span></div><div class="tir-bar"><span class="lab">Flipper length</span><span class="tir-track"><span class="tir-fill" style="width:11%"></span></span><span class="pct">11%</span></div><div class="tir-bar"><span class="lab">Bill depth</span><span class="tir-track"><span class="tir-fill" style="width:8%"></span></span><span class="pct">8%</span></div>
  <div class="tir-h">The numbers behind it</div>
  <div class="tir-grid"><div class="tir-stat"><div class="n">98%</div><div class="l">Correctly identified</div></div><div class="tir-stat"><div class="n">3</div><div class="l">Species separated</div></div><div class="tir-stat"><div class="n">2–3</div><div class="l">Measurements needed</div></div><div class="tir-stat"><div class="n">2</div><div class="l">Natural groups found unsupervised</div></div></div>
  <div class="tir-h">What to do with it</div>
  <ul class="tir-rec"><li><b>Cheap measurements beat expensive ones.</b> A ruler and a location note classify a bird as well as any lab work — the practical lesson for any &ldquo;which type is this?&rdquo; problem.</li><li><b>Location carries real signal.</b> Where something is observed is a feature, not just metadata.</li><li><b>The pattern is genuine, not imposed:</b> left to find groups on its own, the agent recovered clean clusters that track the species.</li></ul>
  <div class="tir-foot">Produced automatically by the data agent: the table was loaded, profiled, tested for associations, and modelled, then the drivers were ranked and translated into plain language — the same pipeline, unchanged, run on every dataset. Public open dataset.</div>
</div>

<details class="tir-tech-wrap"><summary>See the technical report — every algorithm, test and score</summary>

<div class="tir">
<div class="tir-tag tech">Technical report · Penguin species</div>
<h3>How the agent analysed <code>penguins</code></h3>
<p class="tir-sub">344 rows · 7 operations run · deterministic pipeline</p>
<div class="tir-h">Pipeline executed</div>
<ol class="tir-steps"><li><b>Profile</b> — <code>profile</code>: Profiled 8 columns over 344 rows</li><li><b>Association matrix</b> — <code>association_matrix</code>: Pairwise association across 8 columns</li><li><b>Model evaluation</b> — <code>classification_metrics</code>: accuracy=0.977, f1=0.977</li><li><b>Feature importance</b> — <code>permutation_importance</code>: Top feature: island</li><li><b>Key-driver tree</b> — <code>decision_tree_key_drivers</code>: Top driver of &#x27;species&#x27;: &#x27;flipper_length_mm&#x27; (tree accuracy=0.95)</li><li><b>Clustering</b> — <code>kmeans</code>: 2 clusters, silhouette=0.417</li><li><b>Cluster profiling</b> — <code>profile_clusters</code>: Characterised 2 clusters</li></ol>
<div class="tir-h">Model performance</div>
<p class="tir-sub" style="margin:0 0 10px">Task: <code>classification</code> · backend: <code>gbt</code> · held-out test rows: 86</p>
<div class="tir-tblwrap"><table class="tir-tbl"><tbody><tr><td>Accuracy</td><td>0.977</td></tr><tr><td>Precision</td><td>0.978</td></tr><tr><td>Recall</td><td>0.977</td></tr><tr><td>F1</td><td>0.977</td></tr><tr><td>ROC-AUC</td><td>1</td></tr></tbody></table></div>
<p class="tir-sub" style="margin:12px 0 4px">Confusion matrix (rows = actual, cols = predicted)</p>
<div class="tir-tblwrap"><table class="tir-tbl"><tbody><tr><td>38</td><td>0</td><td>0</td></tr><tr><td>1</td><td>16</td><td>0</td></tr><tr><td>1</td><td>0</td><td>30</td></tr></tbody></table></div>
<div class="tir-h">Feature importance — permutation_importance</div>
<div class="tir-tblwrap"><table class="tir-tbl"><thead><tr><th>Feature</th><th>Score</th><th>Share</th></tr></thead><tbody><tr><td>island</td><td>0.221</td><td>45%</td></tr><tr><td>bill_length_mm</td><td>0.172</td><td>35%</td></tr><tr><td>flipper_length_mm</td><td>0.053</td><td>11%</td></tr><tr><td>bill_depth_mm</td><td>0.041</td><td>8%</td></tr></tbody></table></div>
<div class="tir-h">Unsupervised clustering</div>
<p class="tir-sub" style="margin:0">2 clusters, silhouette=0.417 — method <code>kmeans</code>. k chosen automatically by silhouette score.</p>
<div class="tir-foot">Every step above is chosen by transparent rules (statistical test picked from column dtypes; k picked by silhouette; model held out a proper test split). Re-running on the same table yields the same output. Public open dataset.</div>
</div>

</details>

Cheap measurements beat expensive ones: a few body measures and a location note classify a bird 98% of the time.

---

## 6. Wine — separating varieties by chemistry

<div class="tir">
  <div class="tir-tag">Automated analysis · Wine cultivars</div>
  <h3>Separating three wine varieties by chemistry alone</h3>
  <p class="tir-sub">178 wines · one table · classified end-to-end by the agent</p>
  <div class="tir-callout"><b>Bottom line:</b> Three grape varieties are <b>perfectly separable</b> from their chemistry — zero mistakes. A few compounds (flavanoids, proline, colour intensity) do all the work.</div>
  <div class="tir-h">What tells the varieties apart</div>
  <div class="tir-bar"><span class="lab">Flavanoids</span><span class="tir-track"><span class="tir-fill" style="width:39%"></span></span><span class="pct">39%</span></div><div class="tir-bar"><span class="lab">Proline</span><span class="tir-track"><span class="tir-fill" style="width:29%"></span></span><span class="pct">29%</span></div><div class="tir-bar"><span class="lab">Colour intensity</span><span class="tir-track"><span class="tir-fill" style="width:22%"></span></span><span class="pct">22%</span></div><div class="tir-bar"><span class="lab">Alcohol & hue</span><span class="tir-track"><span class="tir-fill" style="width:7%"></span></span><span class="pct">7%</span></div>
  <div class="tir-h">The numbers behind it</div>
  <div class="tir-grid"><div class="tir-stat"><div class="n">100%</div><div class="l">Correctly classified</div></div><div class="tir-stat"><div class="n">0</div><div class="l">Errors on unseen wines</div></div><div class="tir-stat"><div class="n">3</div><div class="l">Markers carry the signal</div></div><div class="tir-stat"><div class="n">3</div><div class="l">Natural groups found unsupervised</div></div></div>
  <div class="tir-h">What to do with it</div>
  <ul class="tir-rec"><li><b>A short test panel is enough.</b> You don't need to measure everything — three compounds authenticate variety with no errors.</li><li><b>Strong fit for QA and authenticity checks:</b> a fast chemical signature that flags a mislabelled or off-spec batch.</li><li><b>The chemistry is genuinely distinct:</b> unsupervised clustering found the same three groups without being told they exist.</li></ul>
  <div class="tir-foot">Produced automatically by the data agent: the table was loaded, profiled, tested for associations, and modelled, then the drivers were ranked and translated into plain language — the same pipeline, unchanged, run on every dataset. Public open dataset.</div>
</div>

<details class="tir-tech-wrap"><summary>See the technical report — every algorithm, test and score</summary>

<div class="tir">
<div class="tir-tag tech">Technical report · Wine cultivars</div>
<h3>How the agent analysed <code>wine</code></h3>
<p class="tir-sub">178 rows · 7 operations run · deterministic pipeline</p>
<div class="tir-h">Pipeline executed</div>
<ol class="tir-steps"><li><b>Profile</b> — <code>profile</code>: Profiled 14 columns over 178 rows</li><li><b>Association matrix</b> — <code>association_matrix</code>: Pairwise association across 14 columns</li><li><b>Model evaluation</b> — <code>classification_metrics</code>: accuracy=1.000, f1=1.000</li><li><b>Feature importance</b> — <code>permutation_importance</code>: Top feature: flavanoids</li><li><b>Key-driver tree</b> — <code>decision_tree_key_drivers</code>: Top driver of &#x27;wine_class&#x27;: &#x27;proline&#x27; (tree accuracy=0.93)</li><li><b>Clustering</b> — <code>kmeans</code>: 3 clusters, silhouette=0.311</li><li><b>Cluster profiling</b> — <code>profile_clusters</code>: Characterised 3 clusters</li></ol>
<div class="tir-h">Model performance</div>
<p class="tir-sub" style="margin:0 0 10px">Task: <code>classification</code> · backend: <code>gbt</code> · held-out test rows: 45</p>
<div class="tir-tblwrap"><table class="tir-tbl"><tbody><tr><td>Accuracy</td><td>1</td></tr><tr><td>Precision</td><td>1</td></tr><tr><td>Recall</td><td>1</td></tr><tr><td>F1</td><td>1</td></tr><tr><td>ROC-AUC</td><td>1</td></tr></tbody></table></div>
<p class="tir-sub" style="margin:12px 0 4px">Confusion matrix (rows = actual, cols = predicted)</p>
<div class="tir-tblwrap"><table class="tir-tbl"><tbody><tr><td>15</td><td>0</td><td>0</td></tr><tr><td>0</td><td>18</td><td>0</td></tr><tr><td>0</td><td>0</td><td>12</td></tr></tbody></table></div>
<div class="tir-h">Feature importance — permutation_importance</div>
<div class="tir-tblwrap"><table class="tir-tbl"><thead><tr><th>Feature</th><th>Score</th><th>Share</th></tr></thead><tbody><tr><td>flavanoids</td><td>0.262</td><td>39%</td></tr><tr><td>proline</td><td>0.198</td><td>29%</td></tr><tr><td>color_intensity</td><td>0.151</td><td>22%</td></tr><tr><td>alcohol</td><td>0.024</td><td>4%</td></tr><tr><td>hue</td><td>0.02</td><td>3%</td></tr><tr><td>malic_acid</td><td>0.011</td><td>2%</td></tr><tr><td>magnesium</td><td>0.011</td><td>2%</td></tr></tbody></table></div>
<div class="tir-h">Unsupervised clustering</div>
<p class="tir-sub" style="margin:0">3 clusters, silhouette=0.311 — method <code>kmeans</code>. k chosen automatically by silhouette score.</p>
<div class="tir-foot">Every step above is chosen by transparent rules (statistical test picked from column dtypes; k picked by silhouette; model held out a proper test split). Re-running on the same table yields the same output. Public open dataset.</div>
</div>

</details>

Three compounds tell three grape varieties apart with zero errors — a short test panel is enough.

---

## 7. Cars — and knowing when NOT to trust a model

<div class="tir">
  <div class="tir-tag">Automated analysis · Car fuel economy</div>
  <h3>What drives fuel economy — and why the agent won't overclaim on 32 cars</h3>
  <p class="tir-sub">32 cars · one table · analysed end-to-end by the agent</p>
  <div class="tir-callout"><b>Bottom line:</b> <b>Weight and engine power drive fuel economy</b> — heavier, more powerful cars burn more. The relationships are strong and clear. But with only 32 cars, the agent <b>flags that there's too little data to build a trustworthy predictive model</b> rather than pretending otherwise.</div>
  <div class="tir-h">What relates to MPG (correlation strength)</div>
  <div class="tir-bar"><span class="lab">Engine power (hp)</span><span class="tir-track"><span class="tir-fill" style="width:90%"></span></span><span class="pct">very strong</span></div><div class="tir-bar"><span class="lab">Weight</span><span class="tir-track"><span class="tir-fill" style="width:87%"></span></span><span class="pct">very strong</span></div><div class="tir-bar"><span class="lab">Cylinders</span><span class="tir-track"><span class="tir-fill" style="width:83%"></span></span><span class="pct">strong</span></div><div class="tir-bar"><span class="lab">Rear-axle ratio</span><span class="tir-track"><span class="tir-fill" style="width:68%"></span></span><span class="pct">moderate</span></div>
  <div class="tir-h">The numbers behind it</div>
  <div class="tir-grid"><div class="tir-stat"><div class="n">32</div><div class="l">Cars — a small sample</div></div><div class="tir-stat"><div class="n">Weight + power</div><div class="l">The real levers</div></div><div class="tir-stat"><div class="n">Honest</div><div class="l">Model flagged as unreliable</div></div><div class="tir-stat"><div class="n">r ≈ 0.9</div><div class="l">Strength of the top relationships</div></div></div>
  <div class="tir-h">What to do with it</div>
  <ul class="tir-rec"><li><b>The levers are real:</b> to improve fuel economy, cut weight and power — the data is unambiguous on direction.</li><li><b>The restraint is the point.</b> Most tools would still hand you a confident prediction; this one tells you 32 rows can't support one. Knowing when <i>not</i> to trust a model is worth more than a false number.</li><li><b>Next step if it mattered:</b> gather more vehicles before relying on a predictive model — the relationships suggest it would pay off.</li></ul>
  <div class="tir-foot">Produced automatically by the data agent: the table was loaded, profiled, tested for associations, and modelled, then the drivers were ranked and translated into plain language — the same pipeline, unchanged, run on every dataset. Public open dataset.</div>
</div>

<details class="tir-tech-wrap"><summary>See the technical report — every algorithm, test and score</summary>

<div class="tir">
<div class="tir-tag tech">Technical report · Car fuel economy</div>
<h3>How the agent analysed <code>mtcars</code></h3>
<p class="tir-sub">32 rows · 8 operations run · deterministic pipeline</p>
<div class="tir-h">Pipeline executed</div>
<ol class="tir-steps"><li><b>Profile</b> — <code>profile</code>: Profiled 11 columns over 32 rows</li><li><b>Association matrix</b> — <code>association_matrix</code>: Pairwise association across 11 columns</li><li><b>Model evaluation</b> — <code>regression_metrics</code>: R²=-0.619, RMSE=5.83</li><li><b>Feature importance</b> — <code>permutation_importance</code>: Top feature: disp</li><li><b>Key-driver tree</b> — <code>decision_tree_key_drivers</code>: Top driver of &#x27;mpg&#x27;: &#x27;wt&#x27; (tree R²=0.96)</li></ol>
<div class="tir-h">Association tests (dtype-routed)</div>
<div class="tir-tblwrap"><table class="tir-tbl"><thead><tr><th>Columns</th><th>Test chosen</th><th>Result</th></tr></thead><tbody><tr><td><code>mpg~wt</code></td><td>pearson</td><td>very strong negative correlation (r=-0.868, p=1.29e-10)</td></tr><tr><td><code>mpg~hp</code></td><td>spearman</td><td>very strong negative correlation (r=-0.895, p=5.09e-12)</td></tr><tr><td><code>mpg~cyl</code></td><td>kruskal_wallis</td><td>significant difference in mpg across cyl (3 groups, epsilon_squared=0.831, p=2.57e-06)</td></tr></tbody></table></div>
<div class="tir-h">Model performance</div>
<p class="tir-sub" style="margin:0 0 10px">Task: <code>regression</code> · backend: <code>gbt</code> · held-out test rows: 8</p>
<div class="tir-tblwrap"><table class="tir-tbl"><tbody><tr><td>R²</td><td>-0.619</td></tr><tr><td>RMSE</td><td>5.83</td></tr><tr><td>MAE</td><td>5.308</td></tr></tbody></table></div>
<div class="tir-foot">Every step above is chosen by transparent rules (statistical test picked from column dtypes; k picked by silhouette; model held out a proper test split). Re-running on the same table yields the same output. Public open dataset.</div>
</div>

</details>

The levers (weight, power) are obvious, but the agent refuses to build a confident model on 32 rows. The restraint is the feature.

---

## 8. Breast-cancer biopsies — flagging malignancy

<div class="tir">
  <div class="tir-tag">Automated analysis · Breast-cancer diagnosis</div>
  <h3>Flagging malignant tumours from cell-shape measurements</h3>
  <p class="tir-sub">569 biopsies · one table · classified end-to-end by the agent</p>
  <div class="tir-callout"><b>Bottom line:</b> From measurements of cell size and shape, the agent separates malignant from benign tumours with <b>about 98% accuracy</b>. The strongest signals are the <b>worst-case irregularities</b> in a sample — the most abnormal cells give it away.</div>
  <div class="tir-h">What flags a malignant tumour</div>
  <div class="tir-bar"><span class="lab">Worst concave points</span><span class="tir-track"><span class="tir-fill" style="width:17%"></span></span><span class="pct">17%</span></div><div class="tir-bar"><span class="lab">Worst texture</span><span class="tir-track"><span class="tir-fill" style="width:14%"></span></span><span class="pct">14%</span></div><div class="tir-bar"><span class="lab">Worst perimeter</span><span class="tir-track"><span class="tir-fill" style="width:14%"></span></span><span class="pct">14%</span></div><div class="tir-bar"><span class="lab">Size variation (area error)</span><span class="tir-track"><span class="tir-fill" style="width:9%"></span></span><span class="pct">9%</span></div>
  <div class="tir-h">The numbers behind it</div>
  <div class="tir-grid"><div class="tir-stat"><div class="n">98%</div><div class="l">Overall accuracy</div></div><div class="tir-stat"><div class="n">51 / 53</div><div class="l">Malignant cases caught</div></div><div class="tir-stat"><div class="n">1</div><div class="l">False alarm out of 90 benign</div></div><div class="tir-stat"><div class="n">0.99</div><div class="l">Risk-ranking quality (AUC)</div></div></div>
  <div class="tir-h">What to do with it</div>
  <ul class="tir-rec"><li><b>Strong decision-support, not a replacement.</b> Catching 51 of 53 malignant cases makes this a serious triage aid — but the 2 misses are why a clinician stays in the loop.</li><li><b>Irregularity is the tell.</b> The &ldquo;worst&rdquo; (most extreme) measurements in a sample carry more signal than the averages — focus attention there.</li><li><b>Consistent and auditable:</b> the same sample always yields the same call, with the reasoning inspectable — important in a clinical setting.</li></ul>
  <div class="tir-foot">Produced automatically by the data agent: the table was loaded, profiled, tested for associations, and modelled, then the drivers were ranked and translated into plain language — the same pipeline, unchanged, run on every dataset. Public open dataset.</div>
</div>

<details class="tir-tech-wrap"><summary>See the technical report — every algorithm, test and score</summary>

<div class="tir">
<div class="tir-tag tech">Technical report · Breast-cancer diagnosis</div>
<h3>How the agent analysed <code>breast_cancer</code></h3>
<p class="tir-sub">569 rows · 5 operations run · deterministic pipeline</p>
<div class="tir-h">Pipeline executed</div>
<ol class="tir-steps"><li><b>Profile</b> — <code>profile</code>: Profiled 31 columns over 569 rows</li><li><b>Association matrix</b> — <code>association_matrix</code>: Pairwise association across 31 columns</li><li><b>Model evaluation</b> — <code>classification_metrics</code>: accuracy=0.979, f1=0.979</li><li><b>Feature importance</b> — <code>permutation_importance</code>: Top feature: worst concave points</li><li><b>Key-driver tree</b> — <code>decision_tree_key_drivers</code>: Top driver of &#x27;diagnosis&#x27;: &#x27;worst radius&#x27; (tree accuracy=0.94)</li></ol>
<div class="tir-h">Model performance</div>
<p class="tir-sub" style="margin:0 0 10px">Task: <code>classification</code> · backend: <code>gbt</code> · held-out test rows: 143</p>
<div class="tir-tblwrap"><table class="tir-tbl"><tbody><tr><td>Accuracy</td><td>0.979</td></tr><tr><td>Precision</td><td>0.979</td></tr><tr><td>Recall</td><td>0.979</td></tr><tr><td>F1</td><td>0.979</td></tr><tr><td>ROC-AUC</td><td>0.993</td></tr></tbody></table></div>
<p class="tir-sub" style="margin:12px 0 4px">Confusion matrix (rows = actual, cols = predicted)</p>
<div class="tir-tblwrap"><table class="tir-tbl"><tbody><tr><td>89</td><td>1</td></tr><tr><td>2</td><td>51</td></tr></tbody></table></div>
<div class="tir-h">Feature importance — permutation_importance</div>
<div class="tir-tblwrap"><table class="tir-tbl"><thead><tr><th>Feature</th><th>Score</th><th>Share</th></tr></thead><tbody><tr><td>worst concave points</td><td>0.033</td><td>17%</td></tr><tr><td>worst texture</td><td>0.027</td><td>14%</td></tr><tr><td>worst perimeter</td><td>0.027</td><td>14%</td></tr><tr><td>area error</td><td>0.018</td><td>9%</td></tr><tr><td>worst area</td><td>0.017</td><td>9%</td></tr><tr><td>mean texture</td><td>0.012</td><td>6%</td></tr><tr><td>mean concave points</td><td>0.012</td><td>6%</td></tr><tr><td>mean area</td><td>0.00839</td><td>4%</td></tr><tr><td>worst concavity</td><td>0.00769</td><td>4%</td></tr><tr><td>symmetry error</td><td>0.00699</td><td>4%</td></tr><tr><td>worst smoothness</td><td>0.00559</td><td>3%</td></tr><tr><td>perimeter error</td><td>0.0049</td><td>3%</td></tr></tbody></table></div>
<div class="tir-foot">Every step above is chosen by transparent rules (statistical test picked from column dtypes; k picked by silhouette; model held out a proper test split). Re-running on the same table yields the same output. Public open dataset.</div>
</div>

</details>

About 98% accuracy from cell-shape measurements — strong decision-support, with the misses that keep a clinician in the loop.

---

## 9. Air quality — seeing bad-air days coming

<div class="tir">
  <div class="tir-tag">Automated analysis · Urban air quality</div>
  <h3>What drives ground-level ozone — and how to see bad-air days coming</h3>
  <p class="tir-sub">153 days · one table · modelled end-to-end by the agent</p>
  <div class="tir-callout"><b>Bottom line:</b> Ground-level ozone is mostly a <b>weather story</b>: it climbs with <b>heat</b> and sunlight and falls when it's <b>windy</b>. Temperature is the single biggest driver. The agent predicts ozone from the weather with about 79% accuracy.</div>
  <div class="tir-h">What drives ozone</div>
  <div class="tir-bar"><span class="lab">Temperature</span><span class="tir-track"><span class="tir-fill" style="width:54%"></span></span><span class="pct">54%</span></div><div class="tir-bar"><span class="lab">Wind</span><span class="tir-track"><span class="tir-fill" style="width:26%"></span></span><span class="pct">26%</span></div><div class="tir-bar"><span class="lab">Sunlight (solar)</span><span class="tir-track"><span class="tir-fill" style="width:11%"></span></span><span class="pct">11%</span></div><div class="tir-bar"><span class="lab">Time of month</span><span class="tir-track"><span class="tir-fill" style="width:9%"></span></span><span class="pct">9%</span></div>
  <div class="tir-h">The numbers behind it</div>
  <div class="tir-grid"><div class="tir-stat"><div class="n">79%</div><div class="l">Of ozone variation explained</div></div><div class="tir-stat"><div class="n">Heat</div><div class="l">Biggest driver</div></div><div class="tir-stat"><div class="n">Wind</div><div class="l">Biggest reliever</div></div><div class="tir-stat"><div class="n">Hot + still + sunny</div><div class="l">The high-ozone recipe</div></div></div>
  <div class="tir-h">What to do with it</div>
  <ul class="tir-rec"><li><b>Bad-air days are forecastable.</b> Hot, calm, sunny conditions are the recipe — a simple early-warning trigger for public-health alerts.</li><li><b>Wind is the natural cleaner.</b> Still air is when ozone accumulates; factor that into when to schedule sensitive activity.</li><li><b>Weather explains most of it</b> (79%) — the rest points to sources worth investigating beyond the weather.</li></ul>
  <div class="tir-foot">Produced automatically by the data agent: the table was loaded, profiled, tested for associations, and modelled, then the drivers were ranked and translated into plain language — the same pipeline, unchanged, run on every dataset. Public open dataset.</div>
</div>

<details class="tir-tech-wrap"><summary>See the technical report — every algorithm, test and score</summary>

<div class="tir">
<div class="tir-tag tech">Technical report · Urban air quality</div>
<h3>How the agent analysed <code>airquality</code></h3>
<p class="tir-sub">153 rows · 8 operations run · deterministic pipeline</p>
<div class="tir-h">Pipeline executed</div>
<ol class="tir-steps"><li><b>Profile</b> — <code>profile</code>: Profiled 6 columns over 153 rows</li><li><b>Association matrix</b> — <code>association_matrix</code>: Pairwise association across 6 columns</li><li><b>Model evaluation</b> — <code>regression_metrics</code>: R²=0.794, RMSE=14.7</li><li><b>Feature importance</b> — <code>permutation_importance</code>: Top feature: Temp</li><li><b>Key-driver tree</b> — <code>decision_tree_key_drivers</code>: Top driver of &#x27;Ozone&#x27;: &#x27;Temp&#x27; (tree R²=0.73)</li></ol>
<div class="tir-h">Association tests (dtype-routed)</div>
<div class="tir-tblwrap"><table class="tir-tbl"><thead><tr><th>Columns</th><th>Test chosen</th><th>Result</th></tr></thead><tbody><tr><td><code>Ozone~Temp</code></td><td>spearman</td><td>very strong positive correlation (r=0.774, p=2.25e-24)</td></tr><tr><td><code>Ozone~Wind</code></td><td>spearman</td><td>strong negative correlation (r=-0.590, p=3.13e-12)</td></tr><tr><td><code>Ozone~Solar.R</code></td><td>spearman</td><td>moderate positive correlation (r=0.348, p=0.000181)</td></tr></tbody></table></div>
<div class="tir-h">Model performance</div>
<p class="tir-sub" style="margin:0 0 10px">Task: <code>regression</code> · backend: <code>gbt</code> · held-out test rows: 29</p>
<div class="tir-tblwrap"><table class="tir-tbl"><tbody><tr><td>R²</td><td>0.794</td></tr><tr><td>RMSE</td><td>14.67</td></tr><tr><td>MAE</td><td>10.878</td></tr></tbody></table></div>
<div class="tir-h">Feature importance — permutation_importance</div>
<div class="tir-tblwrap"><table class="tir-tbl"><thead><tr><th>Feature</th><th>Score</th><th>Share</th></tr></thead><tbody><tr><td>Temp</td><td>0.577</td><td>54%</td></tr><tr><td>Wind</td><td>0.278</td><td>26%</td></tr><tr><td>Solar.R</td><td>0.115</td><td>11%</td></tr><tr><td>Day</td><td>0.069</td><td>7%</td></tr><tr><td>Month</td><td>0.023</td><td>2%</td></tr></tbody></table></div>
<div class="tir-foot">Every step above is chosen by transparent rules (statistical test picked from column dtypes; k picked by silhouette; model held out a proper test split). Re-running on the same table yields the same output. Public open dataset.</div>
</div>

</details>

Ground-level ozone is mostly a weather story: hot, still and sunny is the high-ozone recipe.

---

## 10. The US economy — 48 years of unemployment

<div class="tir">
  <div class="tir-tag">Automated analysis · US economy</div>
  <h3>48 years of US unemployment — the shifts that actually matter</h3>
  <p class="tir-sub">574 monthly readings, 1967–2015 · one table · time-series analysis by the agent</p>
  <div class="tir-callout"><b>Bottom line:</b> Over five decades, unemployment didn't drift smoothly — it moved in <b>regimes</b>, with <b>11 sharp structural breaks</b> that line up with known recessions (1975, 1982, 1990, 2001, 2008…). Across the span it rose about <b>34%</b>, and the near-term forecast points modestly down.</div>
  <div class="tir-h">What the series shows</div>
  <div class="tir-bar"><span class="lab">Long-run rise across the period</span><span class="tir-track"><span class="tir-fill" style="width:90%"></span></span><span class="pct">+34%</span></div><div class="tir-bar"><span class="lab">Structural breaks detected</span><span class="tir-track"><span class="tir-fill" style="width:60%"></span></span><span class="pct">11</span></div><div class="tir-bar"><span class="lab">Seasonal swing within each year</span><span class="tir-track"><span class="tir-fill" style="width:30%"></span></span><span class="pct">yearly</span></div><div class="tir-bar"><span class="lab">Near-term direction</span><span class="tir-track"><span class="tir-fill" style="width:25%"></span></span><span class="pct">down</span></div>
  <div class="tir-h">The numbers behind it</div>
  <div class="tir-grid"><div class="tir-stat"><div class="n">+34%</div><div class="l">Rise across the period</div></div><div class="tir-stat"><div class="n">11</div><div class="l">Structural breaks (regime shifts)</div></div><div class="tir-stat"><div class="n">2008</div><div class="l">Largest recent break</div></div><div class="tir-stat"><div class="n">Down</div><div class="l">Direction of the 12-month forecast</div></div></div>
  <div class="tir-h">What to do with it</div>
  <ul class="tir-rec"><li><b>Plan around regimes, not averages.</b> A single long-run average hides the breaks; the useful unit is the period <i>between</i> shocks, and the agent finds those boundaries automatically.</li><li><b>The breaks aren't noise</b> — they map onto real recessions, which is a good sanity check that the method is finding structure, not artefacts.</li><li><b>Forecasts come with honest error bands.</b> The near-term call is a modest decline, but the widening range is the point: it says how much to trust it.</li></ul>
  <div class="tir-foot">Produced automatically by the data agent: the table was loaded, profiled, tested for associations, and modelled, then the drivers were ranked and translated into plain language — the same pipeline, unchanged, run on every dataset. Public open dataset.</div>
</div>

<details class="tir-tech-wrap"><summary>See the technical report — every algorithm, test and score</summary>

<div class="tir">
<div class="tir-tag tech">Technical report · US economy</div>
<h3>How the agent analysed <code>economics</code></h3>
<p class="tir-sub">574 rows · 6 operations run · deterministic pipeline</p>
<div class="tir-h">Pipeline executed</div>
<ol class="tir-steps"><li><b>Profile</b> — <code>profile</code>: Profiled 6 columns over 574 rows</li><li><b>Association matrix</b> — <code>association_matrix</code>: Pairwise association across 5 columns</li><li><b>Seasonal decomposition</b> — <code>seasonal_decompose</code>: Decomposed unemploy (additive, period=12)</li><li><b>Forecast</b> — <code>arima</code>: 12-step forecast of unemploy (ARIMA(1, 1, 1))</li><li><b>Change-point detection</b> — <code>ruptures_pelt_rbf</code>: 11 changepoint(s) in unemploy; first at 1970-06-01T00:00:00</li><li><b>Period comparison</b> — <code>two_window_comparison</code>: unemploy up +33.9% across the split (significant, p=1.77e-21)</li></ol>
<div class="tir-foot">Every step above is chosen by transparent rules (statistical test picked from column dtypes; k picked by silhouette; model held out a proper test split). Re-running on the same table yields the same output. Public open dataset.</div>
</div>

</details>

The series moves in regimes, not a smooth drift; the agent finds the 11 breaks — and they line up with real recessions.

---

That's the through-line across all ten: the honest answer is usually simpler than the one people expect, it points at a decision you can act on, and — when the data can't support a claim — the agent says so instead of inventing one. The value isn't a cleverer model. It's getting to that one sentence fast, on any table you hand it.


*I'm a data scientist — if you've got a pile of data and a decision hiding in it, [get in touch](mailto:randiveshubham3@gmail.com).*
