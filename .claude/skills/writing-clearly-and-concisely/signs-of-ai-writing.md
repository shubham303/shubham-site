# Signs of AI Writing

A field guide to the tells of LLM-generated prose. Adapted from Wikipedia
editors' guidance on detecting AI-generated content. Use it to edit your own
drafts, not to accuse anyone: any single item here appears in human writing too.
It is the density that gives a text away.

## 1. Puffery and undue significance

The model asserts importance instead of demonstrating it.

- "stands as a testament to"
- "plays a vital / crucial / pivotal / significant role"
- "a rich tapestry of"
- "an enduring legacy"
- "continues to captivate"
- "serves as a reminder"
- "underscores the importance of"
- "highlights the significance of"
- "is a cornerstone of"
- "has left an indelible mark"

**Fix:** delete the claim of importance and state the fact that would justify it.
If no such fact exists, delete the sentence.

## 2. Empty participial tails

A trailing "-ing" clause that adds evaluation rather than information.

- "..., ensuring reliability and scalability"
- "..., showcasing its versatility"
- "..., reflecting the growing interest in"
- "..., highlighting the need for"
- "..., further solidifying its position as"
- "..., making it a valuable tool for"
- "..., allowing for greater flexibility"

**Fix:** cut the clause, or replace it with the mechanism ("..., so a failed
node is retried on the next healthy replica").

## 3. Promotional vocabulary

groundbreaking, revolutionary, cutting-edge, state-of-the-art, seamless,
robust, powerful, comprehensive, innovative, world-class, best-in-class,
game-changing, unparalleled, unlock, supercharge, elevate, transform,
next-generation, industry-leading, effortless, intuitive.

**Fix:** replace with a measurable property or drop it. "Robust error handling"
-> "retries three times, then logs and exits non-zero."

## 4. Overused AI vocabulary

delve, leverage (verb), foster, realm, landscape, navigate (figurative),
multifaceted, holistic, meticulous, nuanced, myriad, harness, embark,
testament, intricate, vibrant, bustling, pivotal, crucial, essential,
paramount, notably, moreover, furthermore, additionally, in the realm of,
it is worth noting that, when it comes to, in today's fast-paced world.

## 5. Hedging and filler

- "It is important to note that"
- "It should be mentioned that"
- "may potentially" / "might possibly" / "could potentially"
- "generally tends to"
- "in certain situations" / "in some cases" (with no case named)
- "arguably one of the most"
- "there are a number of factors"

**Fix:** state the condition. "In certain situations the request fails" ->
"The request fails when the token has expired."

## 6. Negative parallelisms and false contrast

- "It's not just X, it's Y."
- "This isn't merely a tool - it's a philosophy."
- "Rather than simply X, it Y."
- "More than just X."

The construction manufactures drama with no added content. Say what the thing is.

## 7. Rule of three, everywhere

"fast, reliable, and scalable"; "clear, concise, and correct"; "plan, build, and
ship". Triads are fine occasionally; a triad in every paragraph is a tell. Vary
list lengths and sentence shapes.

## 8. Structural tells

- **Section symmetry.** Every section the same length, each with the same
  intro-body-takeaway shape.
- **Bulleting prose.** Ideas connected by argument forced into bullets, each
  bullet a full sentence beginning with a bolded phrase followed by a colon.
- **Bold saturation.** Bold on a phrase in nearly every bullet or sentence.
- **Emoji headings.** Section titles decorated with icons.
- **Restating conclusion.** A final "In summary" / "Overall" / "In conclusion"
  paragraph that repeats what was just said.
- **Title-cased headers everywhere** in a document that is otherwise informal.
- **Curly quotes and em dashes** mixed inconsistently with straight ones in a
  codebase that uses ASCII.

## 9. Content tells

- **Vague attribution.** "Experts say", "studies show", "it is widely regarded"
  with no source.
- **Symmetric both-sides framing** on questions that have a clear answer.
- **Present-tense timelessness.** "As of [year], the project continues to grow."
- **Invented specificity.** Precise-sounding numbers, versions, or citations that
  do not check out. Verify anything quantitative before shipping it.
- **Knowledge-cutoff hedges.** "As of my last update", "recent developments".

## 10. Register mismatch

A commit message written like a press release. An error message written like
marketing copy. A code comment that explains the language rather than the
decision. Match the register to the artifact: commit messages are imperative and
terse; error messages name the problem and the fix; comments explain *why*.

## Editing checklist

Run a draft through these questions:

1. Which sentences only assert importance? Delete them.
2. Which adjectives could not be checked by a reader? Delete or replace.
3. Which "-ing" tails add no fact? Cut.
4. Which passives have a known actor? Flip.
5. Which abstractions name no specific thing? Replace with the thing.
6. Which bullets are really sentences in a paragraph? Unbullet.
7. Does the ending repeat the middle? Cut the ending.
8. Read it aloud. Would you say this to a colleague?
