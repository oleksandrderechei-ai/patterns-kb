---
name: kb-design-levels
description: Write or review the levels block ("What's expected at each level") of a patterns-kb design page — one section per seniority level, each a short list of demonstrable behaviours drawn from the page itself. Use when someone asks to "write the levels block", "what's expected at each level", "split the levels into sections", "turn the level bullets into a list", "add a staff-level bar", or says a design's levels block reads as a paragraph instead of a rubric. Also use to review, evaluate, critique, audit or grade an existing levels block, including when the ask names it by file path or URL fragment (`…/<page>.html#levels`).
---

# Writing the What's expected at each level block

**The block is a rubric, not a paragraph.** A reader who has just worked the problem must be
able to run down it and check themselves off, line by line, and land on a level. A single
sentence of semicolon-joined clauses cannot be checked off — it can only be read and agreed
with, which is not the same thing. One section per level, each a short list of behaviours
that are visibly present or visibly absent.

## The markup

```html
<section class="doc-section" id="levels" aria-labelledby="h-levels" data-kb-block="levels">
  <h2 class="doc-h" id="h-levels">What's expected at each level</h2>
  <div class="prose">
    <h3>Mid-level</h3>
    <ul>
      <li><details class="claim"><summary>One demonstrable behaviour</summary><p>The answer that backs it.</p></details></li>
      …
    </ul>

    <h3>Senior</h3>
    <ul>…</ul>

    <h3>Staff+</h3>
    <ul>…</ul>
  </div>
</section>
```

The heading is fixed at **"What's expected at each level"**. One `<div class="prose">` wraps
all three levels — `<h3>` + `<ul>` is the same shape the `deepdives` block already uses, so
nothing new is styled: the level names take heading rank 3 (see the five ranks in
[kb-styles](../kb-styles/SKILL.md)) and read at the same weight as a dive title. A level
name needs no `<span class="subline">` — it is one word, and there is no qualifier to
carry. The block is hand-edited HTML; no `kb.mjs` writer exists for it, and
`make check` validates only that the section is present and in block order
([`scripts/lib/validate.mjs`](../../scripts/lib/validate.mjs)) — never its internal
structure. The discipline below is this skill's job, not the build's.

`levels` is optional (`OPTIONAL_BLOCKS` in [`scripts/lib/model.mjs`](../../scripts/lib/model.mjs)).
Omit it rather than fill it with generic advice.

## The stem and the answer

A bullet is two things at once, and only one of them is the rubric. The **behaviour** is
what the reader ticks themselves off against; the **answer** is what this page says a person
demonstrating it would actually produce. Both are worth having — an unanswered rubric grades
nothing, because "names every duplicate entry point" is a bar the reader cannot mark
themselves against without knowing there were four. So the answer stays, and it goes behind
a disclosure:

```html
<li><details class="claim"><summary>Prices the per-flow lane rather than presenting it as free</summary>
<p>One lane per flow buys ordering with head-of-line blocking, so a failing endpoint delays
that flow's later verdicts. …</p></details></li>
```

- **The summary is the whole behaviour, and nothing else.** One line, verb-first, third
  person, no trailing clause the disclosure is about to repeat. Front-load the words the
  reader is scanning for — "Separates deduplication from ordering", not "Understands why the
  two concerns that both look like duplicate handling need different mechanisms".
- **The summary never gives the answer away.** "Names every place a duplicate can enter",
  not "Names all four" — the count is the thing behind the triangle.
- **The answer is one `<p>`**, and it opens with the answer itself. The old shape ran a
  `<strong>The answer</strong>` label inline; the disclosure IS that label now, so the
  run-in comes off.
- **Nothing is hidden from search.** A closed `<details>` keeps its content in the DOM, so
  Ctrl+F, the crawler and `kb.mjs get` all still see the answer. Only the first paint is
  short.
- **The disclosure ships closed.** A rubric you can run down in fourteen lines is the
  deliverable; opening one is the reader deciding they missed that bar.
- **`data-kb-level` stays on the `<li>`**, never on the `details` or the `summary` — the
  lens moves the whole bullet or none of it, and the build mints the `levels-li-N` id on
  the `li`.

`details.claim` shares its row rules with `details.req` in
[`site/assets/pattern.css`](../../../site/assets/pattern.css) — same ▸/▾ affordance, same
suppressed bullet, same indented body — so a case study carries one collapse idiom rather
than a new one per block. The `tradeoffs` ledger uses the same class for the same reason
([kb-design-tradeoffs](../kb-design-tradeoffs/SKILL.md)); it differs only in where the
triangle sits, because its rows already own their marker slot. A bullet with no answer to
give is a plain `<li>`; do not wrap an empty disclosure round it.

## The two level triples

Pick by the page's own tag, not by taste:

| page tag | levels |
|---|---|
| `system-design` | **Mid-level** → **Senior** → **Staff+** |
| `low-level-design` | **Junior** → **Mid-level** → **Senior** |

An LLD kata has no staff-level bar to describe — the design is one class diagram deep — so
it starts a rung lower. Three levels always; never two, never four.

## Bullet rules

Third person binds the **rubric bullets only** — they describe a candidate's behaviour,
which is why they read "Separates operation state…" rather than "you separate…". Every
other block on the page addresses the reader directly, and so does this skill's own
advisory prose; do not carry third person out of the `<li>`s.

- **Verb-first, third person, one line.** "Separates operation state from business state
  unprompted" — not "should be able to separate…". The reader is matching against a
  behaviour, so lead with the behaviour.
- **No italics.** `<strong>` for a level label, `<code>` for an identifier, nothing else —
  the corpus carries no `<em>`/`<i>` and renders no italic. A behaviour worth stressing is
  one to state more plainly, not to slant.
- **One demonstrable thing per bullet.** If a bullet contains a semicolon, it is two bullets.
  This is the single edit that turns the legacy shape into this one.
- **3-5 bullets per level.** Past five you are transcribing the page; below three you have
  not said enough to separate the level from the one under it.
- **Cumulative-delta.** A level lists only what is *new* at that level. Never restate a lower
  level's bullets — the reader is assumed to have read upward.
- **Every bullet must trace to something already on the page** — a deep dive, an NFR, a
  tradeoff, a sizing verdict. A bullet that could appear on any design page is noise: "asks
  clarifying questions", "considers scalability", "thinks about edge cases". Cut them.
- **Unprompted is the currency.** The difference between levels is usually *who raises it*,
  not *who can discuss it*. Say "unprompted" and "when prompted" where they discriminate.

## What the top level owes

The highest level on the page (Staff+, or Senior on an LLD kata) must include both of:

1. **Naming the design's biggest flaw as a chosen trade** — the same flaw the `tradeoffs`
   block leads with. Recognising the cost and defending the choice is the bar.
2. **Pricing the deferred exits against their triggers** — the ones `sizing` deferred, by
   name and by threshold, not "would scale it later".

If the page has no named flaw and no deferred exits, the fault is upstream in `tradeoffs` or
`sizing` — fix it there, don't invent one here.

## Worked example

❌ The legacy shape — one `<li>`, five clauses, nothing checkable:

> **Staff+** — answers the duplicate-that-arrives-first trap (sender-keyed inbox, same
> transaction as the effect); names where breaker state lives and what updates the fallback
> weights, mechanisms included; states the CAP position and where the one eventually-consistent
> surface is; prices the broker and engine exits against real thresholds — and defends the
> single-writer Postgres as the biggest flaw, chosen.

✅ The same content as a rubric:

> **Staff+**
> - Answers the duplicate-that-arrives-first trap: a sender-keyed inbox row in the same transaction as the effect.
> - Names where breaker state lives and what moves the fallback weights — the mechanism, not just the intent.
> - States the CAP position and points at the one eventually-consistent surface.
> - Prices the broker and workflow-engine exits against the triggers set in Right-sizing.
> - Defends the single-writer Postgres as the design's biggest flaw, chosen deliberately.

Nothing was added and nothing was cut — the semicolons became line breaks. That is the whole
migration, and it is why it never needs a rewrite of the argument.

## Consistency with the rest of the page

Levels is the **last block that makes a claim**, and it claims about the rest of the page.
Every bullet should be answerable by pointing at a block above it: the sequencing bullet at
`requirements`, the exits bullet at [kb-design-sizing](../kb-design-sizing/SKILL.md), the
flaw bullet at `tradeoffs`, the mechanism bullets at `deepdives`. If a bullet has nowhere to
point, either the page is missing an argument or the bullet is filler — decide which, and fix
the right one.

## What this block is not

- **Not an interview rubric in general.** It grades *this* problem. Generic competency
  language belongs nowhere in the KB.
- **Not a summary.** It names what a person does, not what the system does.
- **Not a scoring scheme.** No points, no percentages, no "must hit 4 of 5".

**Legacy note**: the corpus shape for this block is a single `<ul>` of three
`<li><strong>Level</strong> — one long sentence</li>`. That shape stays valid; this format,
and the `details.claim` disclosure with it, is currently applied only to
`persona-identification`. Migrate another page when its levels block is being reworked on
purpose — not as a side effect of a small edit. A page whose bullets are behaviours with no
answers under them needs no disclosure at all: it is already a rubric that scans.

## Self-check

1. Can a reader run down the block and check themselves off? If they have to parse a
   semicolon chain to know whether they did the thing, it is still a paragraph.
2. Does every bullet name one behaviour, verb-first, in one line — 3-5 per level? Does the
   summary carry the behaviour alone, with the answer behind the triangle and no part of it
   leaking into the stem?
3. Does each level list only what is new at that level, with no restatement from below?
4. Can you point at the block that backs every bullet? Does the top level name the biggest
   flaw and price the deferred exits?
5. `make all && make check`, then `node scripts/kb.mjs get <id> --block levels` — the reader
   output should render as three headed lists, each line standing on its own.
