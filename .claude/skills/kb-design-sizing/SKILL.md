---
name: kb-design-sizing
description: Write or review the sizing block ("Right-sizing") of a patterns-kb design page — pick the interaction shape, derive the core technology capabilities from the FRs/NFRs, run the numbers, and adopt, reject or defer each candidate with a reason. Use when someone asks to "write the sizing block", "right-size this design", "do the back-of-envelope", "estimate capacity", "which core technologies do we need", or "is one node enough". Also use to review, evaluate, critique, audit or grade an existing sizing block, including when the ask names it by file path or URL fragment (`…/<page>.html#sizing`).
---

# Writing the Right-sizing block

**The sizing block is an argument, not arithmetic — and it is read under time pressure.**
Its job is to get from the requirements to the *cheapest architecture that still meets
them*. It models the ~5-minute estimation slice of a one-hour interview, and that budget
decides the whole shape: **a summary you can say out loud, over folds you open only when
someone probes.** The reader who never opens a fold must still have the complete answer.

That is the standing failure of this block. Fourteen capabilities, eight numbers and
twenty-two verdicts are all worth writing, and all of them rendered flat is forty-four
headings the presenter has to talk past to reach the point. The fix is not to cut the
evidence — it is to put the verdict above it and fold the evidence underneath.

## The markup

```html
<section class="doc-section" id="sizing" aria-labelledby="h-sizing" data-kb-block="sizing">
  <h2 class="doc-h" id="h-sizing">Right-sizing</h2>

  <div class="prose">
    <p>Lead — the load, and the unit every figure below is measured in.</p>
    <ul>
      <li><strong>Shape: event-driven, on an append-only log.</strong> Why, in one clause.</li>
      <li><strong>Writes: ≈ 12 row-writes/s at peak</strong>, against a primary comfortable to ~100/s.</li>
      …
    </ul>
  </div>

  <details class="sizing-group" id="sizing-group-numbers" data-kb-level="advanced">
    <summary><h3 id="sizing-h-numbers">The numbers<span class="subline">per region</span></h3></summary>
    <div class="table-scroll">
      <table class="decision">
        <thead><tr><th>Axis</th><th>The math</th><th>What it means</th><th>Routes to</th></tr></thead>
        <tbody>
          <tr id="sizing-num-1"><td>Writes</td>
            <td><code>50 rows/flow × 10k flows/day ÷ 86 400 s × 2 peak =</code> <strong>≈ 12 row-writes/s</strong></td>
            <td>Eight times under a primary comfortable to ~100 writes/s.</td>
            <td>NFR: scale</td></tr>
        </tbody>
      </table>
    </div>
  </details>
</section>
```

The heading text is always **"Right-sizing"** (a suffix is allowed when it names the
block's verdict: "Right-sizing: how many nodes?"). The block is hand-edited HTML — no
`kb.mjs` writer exists for it; the PostToolUse hook checks structure, not content. It is
optional for `low-level-design` katas and expected on every `system-design` page.

**The summary lives in `.prose`; each part below it is a `details.sizing-group`.** The
class reuses the disclosure idiom `entities` and `interface` already ship — the `<h3>` IS
the `<summary>`, and `pattern.css` puts the ▸/▾ marker on the heading rather than on the
summary box. They ship **closed**, which is a summary rather than a hiding place only
because the bullet list above states every verdict the folds then evidence.

**Mint two ids per group**: `sizing-group-<part>` on the `<details>` (the address
`kb.mjs level` moves, and what a lens prunes as a unit) and `sizing-h-<part>` on the `<h3>`
(the citation anchor, and the `h3[id]` `section-nav.js` needs for its outline). Tag the
lens on the `<details>` — never on the `<h3>` alone, or a lens leaves the fold's title
standing over a pruned body.

**Each ITEM inside a group is a table row, not an `<h4>` and a paragraph.** A capability,
a numbers axis and a verdict all have the same three or four parts — a name, the argument,
and the requirement it answers — and a table separates them into columns without spending
a heading each. Every group is the same four columns wide, so the reader learns the shape
once. Hand-mint `sizing-cap-N`, `sizing-num-N`, `sizing-verdict-N` on the `<tr>`; the build
mints ids for `.prose > p` and `.prose` list items, so summary bullets and the closing list
renumber themselves and table rows do not.

## The shape

Summary first, then four folds:

### 1. Summary — the whole answer, in bullets

One short `<p>` carrying the load and the unit every figure is measured in (per region,
per shard, per tenant), then a `<ul>` of **6–8 bullets**. Each opens with a bold
`Label: verdict` and adds a clause of reasoning **only where the verdict does not explain
itself**. "Bought: append-only log, task table, inbox, shared rate limiters" needs no why;
"Shape: event-driven, on an append-only log" does.

This list is the block's description — it is what gets scanned, quoted and said out loud,
and it is the only part a basic-lens reader sees. Cover, in this order:

- **Shape** — **the interaction style, argued.** The largest lever in the design, decided
  before any capacity question: synchronous request/response, or event-driven (durable
  rows, appended events, workers). Reach for event-driven when any of these hold, and say
  which: waits outlive a request (humans, vendors, batch windows); a state change must be
  told to someone else exactly once; the history is itself a requirement (audit,
  compliance, reconstruction); load arrives in bursts the workers should absorb. When the
  answer is "append-only history plus materialised current state" rather than full event
  sourcing, say so — folding state from events on every read is a cost that needs its own
  justification.
- **Stores** — every persistent store the shape needs, **counted**. A design with a
  separate PII vault, an object store and a coordination cache has four stores, not "one
  database". Under-counting here is the most common way this block lies.
- **The two or three headline numbers**, each already landed on its figure. Writes and
  storage almost always; whichever third axis decides this design.
- **The binding constraint** — the thing that caps this system first, named. It is
  frequently not the one you measured (see part 3).
- **Bought** — the capabilities the design actually buys, as a flat list, no reasons.
- **Deferred** — each with its trigger in parentheses. One bullet, not one per candidate.

A reader who stops here has the estimation slice. Everything below is the proof they ask
for when they want to check it.

### 2. Required capabilities

`<details class="sizing-group" id="sizing-group-capabilities">` over a
`Capability | Tier | What forces it | Routes to` table. Draw from: durable transactional
store, work queue, object store, coordination cache, read cache, search index, stream
processor, scheduler, encrypted PII store with key custody, rate limiting, private
network. **No product or vendor names, ever.** A capability that traces to no requirement
is speculation — leave it out. When the FR list is tiered (see
[kb-design-requirements](../kb-design-requirements/SKILL.md)), the Tier column reads
`mandatory` or `additional`; put the count on the summary's subline
(`11 mandatory, 3 additional`) so the fold says how big it is before it opens.

**Distinguish capabilities that share a name.** A *coordination* cache (shared breaker
state, leases, rate-limit counters — correctness across replicas) and a *read* cache
(latency relief for hot data) are different decisions with different forcing reasons;
one can be adopted while the other is rejected. Same for a work queue vs a message
broker: the queue is the capability, the broker is one implementation of it.

### 3. The numbers

`Axis | The math | What it means | Routes to`, one row per axis. Standard axes: writes,
reads, storage — plus whichever of working set, fan-out, cardinality, connections, or
latency budget actually decides this design.

**The math column is a formula, not a paragraph about a formula.** One `<code>`
expression, every factor named in its own units, ending in `=` and the bolded result:

```html
<td><code>(12 appends + 12 projections + 14 task touches + 5 inbox + 5 singles
≈ 50 rows/flow) × 10k flows/day ÷ 86 400 s × 2 peak =</code> <strong>≈ 12 row-writes/s</strong></td>
```

The formula IS the reasoning, and that is the point of the column: a reader checks
arithmetic in seconds and prose in minutes. So **expand a composite factor inside the
expression** rather than sourcing it in a sentence beside — `50 rows/flow` is an
assertion, `(12 + 12 + 14 + 5 + 5 ≈ 50 rows/flow)` is a derivation. Where an axis needs
two figures (today and year three, per-year and steady-state), write two expressions in
the one cell rather than splitting the axis into two rows.

Nothing goes in the math column but math. The consequence — the headroom, the anchor it
is compared against, what happens to the quantity — is the next column over.

- **Show where each input came from.** A factor like "25–30 rows per flow" must name
  what it counts (which tables, inserts vs updates); a peak multiplier must name the
  concentration it assumes (business hours, campaign bursts). An unsourced factor is
  the number a reader cannot check, and the one that is usually wrong.
- **Name the unit — a rate is meaningless without its subject.** "0.5 calls/s" is not a
  number: calls to a vendor's API, row-writes into the primary, and requests hitting
  your own edge have different ceilings, different owners and different bills. Write
  "outbound vendor calls/s", "row-writes/s into Postgres", "reads/s at the edge".
- Compare the bolded figure against an auditable capacity anchor (a well-tuned relational
  node ≈ 10k writes/s, one machine's RAM) in the "What it means" column, where the
  comparison decides something.
- **Say what happens to the quantity, not just how big it is.** "~10k flows parked"
  invites "and then what?" — answer it in the same line (who resolves them, on what
  clock, at what cost).
- **Find the binding constraint — it is often not the one you measured.** A load that
  is trivial for your store can be capped long before it by something you do not own:
  a vendor's contracted rate limit and monthly quota, a partner's API ceiling, a
  per-call price. When that is the case, say so and give the second number: the
  quota that caps it and the annual invoice it implies. Mark cost arithmetic as
  illustrative unless you know the contract rate — the shape of the answer survives
  a wrong unit price, but a fabricated quote does not.
- **Watch for quantities that compound against a different clock than revenue.**
  Recurring obligations (re-checks, retention, re-indexing) grow with the accumulated
  book while income grows only with new business. That divergence is a finding, not a
  footnote — name it where it appears.

### 4. Verdict per candidate

`Candidate | Verdict | Why, and the trigger | Routes to`, one row per candidate —
including the ones a bigger system would reflexively claim, so each decision is on the
record. The Verdict column carries one bolded word and nothing else worth reading past
(`<strong>Adopted</strong>`, `<strong>Rejected</strong>`, `<strong>Deferred</strong>`; a
short qualifier is allowed where it changes the meaning — "**Adopted** for correctness,
not speed"). The Why column carries the reason:

- Adopted — what forces it.
- Rejected — the number or fact that removes the need.
- Deferred — the named trigger that buys it, written as `Trigger: …`.

Sorting the rows adopted-then-deferred lets a reader stop at the first Deferred and know
the rest are exits.

**The shape is a verdict, not just a claim in the summary.** Give the interaction style a
row decided both ways — the rejected alternative (synchronous request/response) with the
fact that kills it, then the adopted one. It is the largest decision on the page;
asserting it in the summary bullets and never deciding it on the record is the most common
omission in this block.

**Nothing named in part 2 may vanish here.** Walk the capability list and confirm each
one either has its own verdict line or is explicitly folded into one ("queue, outbox
and inbox" is three decisions, not one — split them unless they truly stand or fall
together). A capability that appears as required and then never reappears reads as
forgotten.

**Deferred is not rejected.** A candidate with a real future belongs in the deferred
group with its trigger stated ("sustained 100k flows/day", "when flow variants
multiply"), so the reader knows it was priced rather than dismissed. Never write a bare
verdict: "cache — rejected" is an assertion; "read cache — rejected: 18 GB working set,
no read pressure" is a decision. Resilience bought by protocol (idempotency, retries,
replay) is cheaper than resilience bought by infrastructure — prefer it and say so.

### 5. When this stops being right

The one fold that is a list rather than a table, because its three items are not the same
shape as each other. Wrap the `<ul>` in a `<div class="prose">` so it picks up the block's
list styling, and carry the routing tag on the heading's subline
(`<span class="subline">→ NFR: scale</span>`) — the heading does the framing on its own
(the verdicts hold for today's numbers; this is the tripwire that says they no longer do),
so no item needs a preamble. Three bold-led items, in this order:

1. **What wears out first, in plain language.** Name the component and the mechanism
   that degrades it — cause, then effect. Explain engine-level jargon in the sentence
   that uses it; a reader who does not run that database must still follow the argument.
   ("Postgres never overwrites a row in place: an update leaves the old version behind
   as garbage for a background cleanup to reclaim.")
2. **The signal to watch**, so the tripwire is observable rather than theoretical —
   a metric someone can put on a dashboard, not a vibe.
3. **The exits in adoption order**, each an upgrade that was priced, not a rewrite.

A bare threshold is not an invalidation — "breaks at ~2M" reads as arbitrary until the
item says *what* breaks and *why*.

## The routing tags

Every **item** carries exactly one routing tag, in its row's Routes-to column —
`FR: label`, `NFR: label`, or both joined with `;`. The column header supplies the arrow,
so the cell does not repeat it. Plain text, never wrapped in `<em>`. A tag that belongs to
a whole part rather than to one item goes on that part's heading instead, inside its
`<span class="subline">`, arrow and all — which is where "When this stops being right"
carries `→ NFR: scale`. The summary bullets carry **no** routing tags: they are the
verdict, and tagging six of them turns the one scannable list back into the wall the folds
exist to prevent. The same idiom the problem block uses
(see [kb-design-problem](../kb-design-problem/SKILL.md)). The label is informal
but must match an item the reader can find in the requirements block. Capabilities and
verdicts route to what forces them; numbers route to the constraint they price. No
orphan bullets: an item that routes nowhere is either speculation or a missing
requirement.

## The lenses

The fold structure and the lens are the same idea applied twice, so let them agree:

| | renders |
|---|---|
| lead + summary `<ul>` | untagged — the basic page IS the estimation slice |
| the four `details.sizing-group` | `data-kb-level="advanced"` on the `<details>` |
| individual rows inside a group | `expert` where the row is depth the advanced reader can skip |

A basic reader gets eight bullets and no folds; an advanced one gets the folds with their
long tail pruned; an expert gets everything. `make check` demands content at every lens,
and the untagged summary is what satisfies it — which is also why the summary can never be
tagged up a level.

## Style rules

- **One sentence per cell where one will do.** A second clause is allowed after a
  semicolon; a second argument means it is two rows.
- **Strike connector words** — "which is why", "that is", "so", "in other words". The
  column juxtaposition does the work a connector used to.
- **Results bold, assumptions in parentheses**, jargon only where it is the exact term —
  and then explained on first use.
- **Summary bullets and the closing list are prose, and the same rules bind them.** Each
  bullet stands alone and carries its reason, so the reader can stop after any one of
  them. In "When this stops being right", write cause then effect in that order, one
  mechanism per item — an item carrying two mechanisms hides which one wears out first.

## Worked example

From `persona-identification` — a broker is deferred rather than bought:

> ❌ *Flows are queued in Kafka and hot state lives in Redis, so the system scales to
> any load.* — two vendors, neither justified by a number; "any load" prices nothing.

> ✅ `Message broker | **Deferred** | It buys throughput this system does not need and pays
> with the shared transaction that makes the guarantee. Trigger: measured task-table churn,
> roughly sustained 100k flows/day. | NFR: scale`

The ❌ buys infrastructure first and justifies never; the ✅ decides it with a number,
keeps it as a triggered exit, and routes to the constraint it prices — in one row.

And the same page's writes axis, showing what the math column is for:

> ❌ *Count what one flow commits — ~12 appends, a projection update behind each, 7 task
> rows touched twice, ~5 inbox rows, and single rows for the idempotency key, the invite
> key, the document and two audit entries. Call it 50. At the 10k/day target, doubled for
> business-hours bunching, that is ≈ 6 row-writes/s, ~12/s peak.* — four sentences to reach
> a figure a formula states in one line, and the reader must trust the addition rather than
> see it.

> ✅ `(12 appends + 12 projections + 14 task touches + 5 inbox + 5 singles ≈ 50 rows/flow)
> × 10k flows/day ÷ 86 400 s × 2 peak =` **≈ 12 row-writes/s**

## Consistency with the rest of the page

The sizing verdicts and the `architecture` block's technology table are the same
decisions stated twice — they must agree. Before shipping, read them side by side: a
capability the architecture depends on (a shared cache holding breaker state, a vault
with its own credentials) cannot appear as "rejected" here. When they disagree, the
architecture block is usually right and the sizing block missed a capability whose
forcing reason was correctness, not scale.

## What this block is not

- **Not the architecture block.** It decides *which capabilities* and *how big*, not
  which boxes and arrows — no component diagrams, no data flow.
- **Not a tech-stack listing.** Vendor mapping happens outside the KB (the
  `pattern-tech-map` skill); this block stays at the capability level.
- **Not a restatement of the NFRs.** The scale NFR says what must hold; this block
  proves what it costs and what it rules out.

Upstream, the numbers come from [kb-design-requirements](../kb-design-requirements/SKILL.md)
(every constraint carries a number where one exists) and ultimately from the interview
in [kb-design-problem](../kb-design-problem/SKILL.md) — a sizing block that has to invent
its own volumes means the problem block didn't ask.

**Legacy note**: two older shapes are in the corpus. Most pages use 3–7 prose paragraphs
with bold lead-ins; `persona-identification` briefly used `<h3>` parts over `<h4>`-per-item
sections, which is what produced the forty-four-heading wall this shape replaces. Both are
valid until touched; migrate a page to summary-over-folds whenever its sizing block is
edited. Migrating is mostly mechanical — an `<h4>` plus its `<p>` becomes one `<tr>`, and
the reasoning you delete from a numbers paragraph is reasoning the formula now carries.

## Self-check

1. Scan test: after 15 seconds of the summary alone, can a reader state the shape, the
   store count, the headline numbers and what binds first? A fold that has to be opened
   to get the answer means the summary is incomplete, not that the fold is wrong.
2. Read the summary out loud. Under 90 seconds, and does every bullet whose verdict is not
   self-evident carry its one clause of why — with none of the self-evident ones padded?
3. Is the interaction shape named *and argued*, and is the store count exact — every
   vault, blob store and coordination cache counted?
4. Is every math cell a formula that ends in its result, with composite factors expanded
   inside the expression rather than sourced in a sentence next to it? Does anything but
   arithmetic appear in that column?
5. Does every candidate get adopted, rejected or deferred **with a reason** — deferred
   ones carrying a named trigger, nothing kept "to be safe"? This is the check that does
   the work.
6. Does every row carry a routing tag that resolves to a findable FR or NFR, and do the
   summary bullets carry none?
7. Do the verdicts agree with the `architecture` block's technology table?
8. Does the closing list name the mechanism in plain language and give an observable
   signal — not just a threshold?
9. Does each fold carry `sizing-group-*` on the `<details>`, `sizing-h-*` on the `<h3>`,
   and its `data-kb-level` on the `<details>` rather than on the heading?
10. `make all && make check`, then `node scripts/kb.mjs get <id> --block sizing --level basic`
    — basic should return the lead and the bullets and nothing else. Then read it at
    `--level advanced` and confirm the folds are there.
