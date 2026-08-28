# Writing Clearly and Concisely

A skill that applies William Strunk Jr.'s writing principles to produce clearer,
stronger prose while avoiding common AI writing patterns.

## Purpose

This skill helps you write prose for human readers. It draws from two sources:

1. **The Elements of Style** (Strunk, 1918) - rules for clear, forceful writing
2. **AI pattern avoidance** - guidance on avoiding the generic, puffy language
   LLMs tend to produce

Whether you are writing documentation, commit messages, or error messages, this
skill helps you cut fluff and say what you mean.

## When to use

- **Documentation** - READMEs, API docs, technical explanations
- **Git workflow** - commit messages, pull request descriptions
- **User-facing text** - error messages, UI copy, help text, tooltips
- **Code comments** - inline documentation, docstrings
- **Reports and summaries** - status updates, analysis
- **Editing** - improving clarity of existing text

Trigger phrases: "write documentation for...", "draft a README", "edit this for
clarity", "make this more concise", "review this commit message".

## How it works

`SKILL.md` loads first with the core rules. Reference files load only when
needed. Most tasks need only
`elements-of-style/03-elementary-principles-of-composition.md`.

Under tight context, dispatch a subagent with the draft and the one relevant
section file.

## Core rules

| Rule | Principle |
|------|-----------|
| 10 | Use the active voice |
| 11 | Put statements in positive form |
| 12 | Use definite, specific, concrete language |
| 13 | Omit needless words |
| 16 | Keep related words together |
| 18 | Place emphatic words at the end of the sentence |

## AI patterns detected

- **Puffery** - pivotal, crucial, vital, testament, enduring legacy
- **Empty "-ing" phrases** - ensuring reliability, showcasing features
- **Promotional adjectives** - groundbreaking, seamless, robust, cutting-edge
- **Overused vocabulary** - delve, leverage, multifaceted, foster, realm, tapestry
- **Formatting overuse** - excessive bullets, emoji headings, bold everywhere

## Reference files

| File | Content |
|------|---------|
| `elements-of-style/02-elementary-rules-of-usage.md` | Comma rules, possessives, sentence structure |
| `elements-of-style/03-elementary-principles-of-composition.md` | Active voice, concision, paragraph structure |
| `elements-of-style/04-a-few-matters-of-form.md` | Headings, quotations, formatting conventions |
| `elements-of-style/05-words-and-expressions-commonly-misused.md` | Common errors, word selection |
| `signs-of-ai-writing.md` | Field guide to AI writing tells |

## Examples

**Commit message**

Before: "This commit implements the functionality for ensuring that user
authentication is properly handled, showcasing robust error handling
capabilities."

After: "Add user authentication with error handling"

**Documentation**

Before: "This groundbreaking feature leverages cutting-edge technology to
deliver a seamless experience, fostering better engagement."

After: "This feature uses WebSocket connections to update the dashboard in real
time."

**Passive voice**

Before: "The configuration file is read by the application at startup."

After: "The application reads the configuration file at startup."

**Hedging**

Before: "It is important to note that the API might potentially return an error
in certain situations."

After: "The API returns an error when the token expires."

## Best practices

1. Be specific, not grandiose - say what it does, not how important it is
2. Cut first, add later - remove words until meaning suffers
3. Prefer the active voice
4. State positively - "he forgot" beats "he did not remember"
5. Use concrete language - "the server crashed" beats "an issue occurred"
6. Load reference files sparingly

## Directory structure

```
writing-clearly-and-concisely/
  SKILL.md
  README.md
  signs-of-ai-writing.md
  elements-of-style/
    01-introductory.md
    02-elementary-rules-of-usage.md
    03-elementary-principles-of-composition.md
    04-a-few-matters-of-form.md
    05-words-and-expressions-commonly-misused.md
```

## Attribution

- Original skill by @joshuadavidthomas, from
  [joshuadavidthomas/agent-skills](https://github.com/joshuadavidthomas/agent-skills) (MIT)
- Adapted from [obra/the-elements-of-style](https://github.com/obra/the-elements-of-style)
- Writing principles from *The Elements of Style* by William Strunk Jr. (1918)
- AI pattern research from Wikipedia's field guide to AI-generated content detection
