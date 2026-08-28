---
title: "AI agents make data science affordable for everyone"
date: 2026-07-18
description: "Serious data analysis stayed out of reach for small businesses because of cost, not need. AI agents change that arithmetic. Here is what it now costs."
---

**Data analysis was never too hard for small businesses. It was too expensive.** An AI agent does the mechanical nine-tenths of the job. That drops the cost of an answer by an order of magnitude and pulls millions of companies into a market that priced them out.

## The short version

- The expensive part of data science was never the statistics. It was the toil: loading, profiling, cleaning, slicing and translating.
- Agents do the toil end to end, on data they have not seen before.
- One analyst supervising agents can carry several companies at once, so cost per company collapses.
- What is left for the human is judgment. Is this leakage? Is 32 rows enough? Is this a cause or a proxy?

Data science has spent most of its history as a luxury good. Hiring a data scientist meant a six-figure salary, months of ramp-up, and the patience to let one expensive person work through one company's data one question at a time. That math works for a bank or a retailer with a billion rows and a team to match. It never worked for the coffee roaster with three years of Shopify exports, or the agency sitting on a spreadsheet of every campaign it ever ran. They *had* the data. They just could not justify the person.

So they guessed. They made real decisions about what to stock, who to keep and where to spend on gut and a pivot table. The answer was in the data. Getting it out cost more than the decision was worth.

That is what is changing, and the *why* is worth being precise about.

| | The old arithmetic | The new arithmetic |
| --- | --- | --- |
| Unit of capacity | One analyst, one company | One analyst, several companies |
| Who does the toil | The analyst, for weeks | An agent, in minutes |
| Cost driver | A [six-figure salary](https://www.bls.gov/ooh/math/data-scientists.htm) | Model tokens plus supervision |
| Who can afford it | Banks, big retail | Anyone with a table and a decision |
| What the human supplies | Everything | Judgment, framing, the veto |

## The toil was the expensive part

What eats a data scientist's time is not the clever bit. It is loading a messy CSV and figuring out which columns are garbage. Profiling every field. Deciding which statistical test is even valid for this kind of column. Writing the SQL to slice it three ways. Running a model and checking whether it held up. Then the step everyone underestimates: translating the whole thing into a sentence a founder can act on. Weeks of it, most of it mechanical.

An AI agent does that part. Note the word: an *agent*, not an assistant. Anthropic's [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) draws the line. A workflow "orchestrates [LLMs and tools] through predefined code paths"; an agent "dynamically directs its own processes and tool usage". Analysis needs both, a fixed spine so results reproduce and enough latitude to pick the right test for the column in front of it. The agent can read the raw table, run the SQL, pick and run the right algorithm, test whether a relationship is real or noise, and assemble the result into a plain-language report. The plumbing is standard now too: the [Model Context Protocol](https://modelcontextprotocol.io/) exists so you can hand a model tools and data sources without writing an integration each time. It does the work end to end, on data it has never seen. I have been building exactly this, and the surprising lesson is how much of the job was never the science. It was the labour around the science.

Automate the labour and the price of an answer collapses. When the price collapses, the set of businesses that can afford one explodes.

## One analyst, many companies

The old constraint was linear: one data scientist, one dataset, months of attention. The service was expensive because you were renting a scarce person's undivided time.

Break that link and the arithmetic inverts. **A single analyst running agents can carry the analysis of several companies at once.** The agent grinds through each one in parallel while the human moves between them doing the part that needs a human. Cost per company drops by an order of magnitude, and the coffee roaster and the agency end up inside the market instead of watching from the sidewalk.

Frame agents as a threat and you miss the story. Cheaper analysis grows the market for analysis by pulling in everyone who was priced out, which for data science is almost everyone. Small and mid-sized businesses have never had a fair shot at their own data. They are about to.

## What's left for the human is the part that was always the point

None of this deletes the data scientist. It deletes the toil and leaves the judgment.

An agent will happily run a model and report an R² of 0.98. It takes a person to ask whether that is real or [leakage](https://scikit-learn.org/stable/common_pitfalls.html#data-leakage). Scikit-learn documents leakage as a standard pitfall because it is the failure that most reliably produces a beautiful score and a worthless model. It takes a person to ask whether 32 rows can support the claim, and whether the "driver" it found is a cause or just a proxy. It takes a person to know which question was worth asking, to read the agent's report and say *this is wrong, run it again this way*, and to iterate until the output is something you would stake a decision on. The agent is fast and tireless and has no taste. The human supplies the taste.

The skill moves up a level rather than disappearing. Less time wrangling columns, more spent on what a column-wrangler never had time for: framing the right question, catching the model when it is confidently wrong, turning a result into a decision. That is a better job than the one it replaces.

We spent decades making data science *powerful*. The next few years are about making it *cheap*, and cheap is what finally makes it fair. Insight that used to belong only to companies big enough to hire for it is about to reach anyone with data and a decision to make.

*I'm a data scientist. If you've got a pile of data and a decision hiding in it, [get in touch](mailto:randiveshubham3@gmail.com).*
