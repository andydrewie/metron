# Information design — human care, machine clarity

## In brief

**Human attention is precious.** Start with the answer, show one meaningful visual when it helps, and invite people into detail rather than demanding it.

**Agent attention needs structure.** Publish stable names, explicit navigation, typed contracts, evidence levels, and honest capability flags so agents don't have to infer what exists.

**Writing standard:** precise, direct, nurturing. Treat readers as capable adults with limited time. Offer clear explanations without alarmism, condescension, pressure, or invented certainty.

> **Reduce the cost of understanding, not the amount of truth available.**

## First-glance contract for reader-facing pages

1. **An executive orientation at the top:** what this page answers, why it matters, what is working versus hypothetical, and the natural next action. Aim for 2–4 sentences, not a wall of text.

**Do not promise a reading duration.** Use `At a glance` or `Executive summary` instead of `In 20 seconds`. Clarity is a communication obligation, not a stopwatch imposed on the reader.
2. **Visual explanation when earned:** make sequence, comparison, uncertainty, or dependency easier to grasp than prose alone. Give the visual a short takeaway above and a text equivalent below.
3. **Optional depth:** detailed methods, assumptions, equations, citations, source code, counterexamples, and experiment protocols are linked or progressively disclosed. Do not hide crucial warnings, eligibility limits, or what is unvalidated.
4. **Respect mobile attention:** one readable column, large meaningful values, accessible labels, restrained color, no horizontal labyrinth or gratuitous decorative diagrams.
5. **Make entrypoints explicit:** visitors may arrive through a search result, GitHub link, screenshot, agent, or wearable-related query. Each page must be understandable without reading previous pages.

### Copywriting: precise, direct, nurturing

| Avoid | Prefer |
| --- | --- |
| "Your true TDEE is 3,142 kcal." | "Estimated daily expenditure: about 3,150 kcal. Here's what the model assumes." |
| "You must rest because your recovery is low." | "A lighter session or rest may be worth considering. Here's why the model flags today." |
| "Complete every setup field for accurate results." | "Try it with the sample profile. Add your own measurements whenever you're ready." |
| "This is scientifically optimized." | "This combines published equations with assumptions we're still testing." |

Nurturing means **making learning feel safe and voluntary**, not removing scientific caveats or softening criticism. Explain limitations alongside the relevant claim; avoid a large mandatory disclaimer before the user sees any value.

## Visualization decision rule

Use a **diagram** for flow, causality hypotheses, architecture, or branching decisions. Use a **chart** for real quantitative comparisons, measured trends, or uncertainty after validation. Use **tables** for compact reference data and explicit tradeoffs. Use **plain text** for a single conclusion or number. Do not include a graphic only because it looks technical.

All graphics must have descriptive labels, a text equivalent or meaningful alternative, and no meaning dependent on color alone. Metron's white-first Soft Slate / Scientific Blue / Copper palette is a data vocabulary, not decoration. Test for grayscale and common color-vision deficiencies before calling a visual accessible.

No fake measurements, synthetic "research results" presented as real, arbitrary confidence percentages, or status colors masquerading as evidence.

## Machine-readable attention and navigation

- **Capability truth:** `metron.manifest.json`, especially `implemented`. The roadmap is not an implementation guarantee.
- **Task routing:** `docs/navigation.json` is a machine-readable index of intent → first file → optional next file. File paths are repository-relative.
- **Executable truth:** `core/model.js`, `schemas/`, `examples/`, `bin/metron.mjs`, and `tests/`.
- **Scientific truth:** `docs/SCIENCE.md`, `docs/RESEARCH.md`, and explicitly unrun protocols.
- **Agent behavior:** `AGENTS.md` defines repository invariants and safe changes.
- **Forward compatibility:** add new route IDs, never silently redefine an existing one; mark experimental proposals as proposals; version breaking schema semantics; distinguish optional fields from required fields; keep units, timestamps, provider metric definitions, and data provenance explicit.

Agents must be able to **skip the presentation and find the right contract immediately**. Humans must be able to **skip the contracts and still understand the important answer**.

## Public reasoning policy

Read [Open collaboration](./COLLABORATION.md) for our publication threshold, [working vocabulary](./VOCABULARY.md) for precise labels, and [ADRs](./adr/README.md) for durable architectural decisions. Human-facing documents summarize what changed and why before linking the full trail; agents use stable IDs and explicit versioned navigation.

## Change review checklist

- Does the first screen answer why a person should care, without compulsory reading?
- Does the selected visualization explain something that prose alone handles worse?
- Are the caveats beside the claim they qualify, rather than hidden or overemphasized?
- Is wording direct, welcoming, accurate, and free of false certainty?
- Can an agent follow a stable, exact path from task intent to inputs, outputs, source and tests?
- Do docs separate current capabilities from proposed research?
- Are small screens, keyboard navigation and color-vision differences respected?

This document governs information presentation and discoverability. It **does not change** numerical physiology models or authorize new predictions.
