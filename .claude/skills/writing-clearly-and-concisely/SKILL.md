---
name: writing-clearly-and-concisely
description: Apply Strunk's Elements of Style and AI-pattern avoidance to prose written for humans. Use when writing or editing documentation, READMEs, commit messages, PR descriptions, error messages, UI copy, code comments, docstrings, status updates, or summaries — and whenever asked to "edit for clarity", "make this concise", "tighten this up", or "review this wording".
---

# Writing Clearly and Concisely

Write prose humans want to read. Cut fluff, prefer the active voice, name things
concretely, and avoid the puffed-up register LLMs drift into.

## Core rules

Apply these to every draft. They cover most of what goes wrong.

1. **Use the active voice.** "The application reads the config file at startup,"
   not "The config file is read by the application at startup." Passive is fine
   when the actor is unknown or irrelevant ("The record was deleted in 2019").
2. **Put statements in positive form.** Say what is, not what is not.
   "He forgot" beats "He did not remember." "Ignores" beats "does not take into
   account."
3. **Use definite, specific, concrete language.** "The server crashed after the
   third retry," not "An issue occurred." Name the file, the flag, the error.
4. **Omit needless words.** Every word must do work. Cut until meaning suffers,
   then add back only what is needed.
5. **Keep related words together.** Put the subject next to its verb and the
   modifier next to what it modifies.
6. **Place emphatic words at the end of the sentence.** The final position lands
   hardest; the beginning is second.

## Standard cuts

| Cut this | Write this |
|---|---|
| the question as to whether | whether |
| there is no doubt but that | doubtless |
| used for fuel purposes | used for fuel |
| he is a man who | he |
| in a hasty manner | hastily |
| this is a subject that | this subject |
| the reason why is that | because |
| owing to the fact that | since / because |
| in spite of the fact that | though / although |
| call your attention to the fact that | remind you |
| it is important to note that | *(delete)* |
| in order to | to |
| at this point in time | now |
| has the ability to | can |
| a number of | several / (give the number) |

Prefer one word to three: "hastily" over "in a hasty manner". Replace
"the fact that" wherever it appears.

## AI patterns to avoid

**Puffery** — pivotal, crucial, vital, essential, testament to, enduring legacy,
rich tapestry, stands as, plays a significant role, underscores.

**Empty "-ing" tails** — "…, ensuring reliability", "…, showcasing its
flexibility", "…, highlighting the importance of". These clauses assert
significance instead of adding information. Delete them or replace with a fact.

**Promotional adjectives** — groundbreaking, seamless, robust, cutting-edge,
powerful, comprehensive, innovative, state-of-the-art, world-class.

**Overused vocabulary** — delve, leverage (as a verb), foster, realm, landscape,
navigate (figuratively), multifaceted, holistic, meticulous, harness, elevate,
unlock, embark, testament.

**Hedging stacks** — "may potentially", "might possibly", "it is worth noting
that", "generally tends to". Pick one qualifier or none.

**Negative parallelism** — "It's not just X, it's Y." "This isn't merely a
feature — it's a revolution." Say what it is.

**Formatting overuse** — bullets where sentences work, bold on every other
phrase, emoji as section decoration, a heading per paragraph, a closing summary
that restates the text just read.

**Correlative rule-of-three** — "fast, reliable, and scalable" strung through
every sentence. Vary the shape.

## Method

1. Draft it.
2. Read each sentence and ask: what does this tell the reader that they did not
   already know? Delete sentences that only assert importance.
3. Flip passives where an actor exists.
4. Replace abstract nouns with the specific thing.
5. Cut the standard phrases in the table above.
6. Reread aloud. If you would not say it to a colleague, rewrite it.

## Reference files

Load one only when the task needs it. Most editing needs
`elements-of-style/03-elementary-principles-of-composition.md` and nothing else.

| File | Use for |
|---|---|
| `elements-of-style/02-elementary-rules-of-usage.md` | Commas, possessives, participial phrases, sentence joining |
| `elements-of-style/03-elementary-principles-of-composition.md` | Active voice, concision, paragraph and sentence structure |
| `elements-of-style/04-a-few-matters-of-form.md` | Headings, quotations, titles, layout conventions |
| `elements-of-style/05-words-and-expressions-commonly-misused.md` | Word choice and common errors |
| `signs-of-ai-writing.md` | Full field guide to AI writing tells |

Under tight context, hand a subagent the draft plus the single relevant file.

## Examples

**Commit message**

- Before: "This commit implements the functionality for ensuring that user
  authentication is properly handled, showcasing robust error handling
  capabilities."
- After: "Add user authentication with error handling"

**Documentation**

- Before: "This groundbreaking feature leverages cutting-edge technology to
  deliver a seamless experience, fostering better engagement."
- After: "This feature uses WebSocket connections to update the dashboard in
  real time."

**Passive voice**

- Before: "The configuration file is read by the application at startup."
- After: "The application reads the configuration file at startup."

**Hedging**

- Before: "It is important to note that the API might potentially return an
  error in certain situations."
- After: "The API returns an error when the token expires."
