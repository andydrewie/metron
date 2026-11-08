# Metron — instructions for coding agents

This is a real source repository, not a design mockup. **README.md is the human front door; this file is your execution contract.** Metron is an exploratory, headless fitness-computation project with a static browser client. It is **not** a trained AI model or clinically validated physiology system.

## Before every repository task — reorient, then act

**Do not rely on the user remembering our workflow, prior chats, or even the previous agent's context.** This repository is the continuity record.

1. **Read the local rules:** this file, [collaboration policy](./docs/COLLABORATION.md), and [intent map](./docs/navigation.json).
2. **Identify current reality:** check `metron.manifest.json`, the relevant source/tests, and [existing decisions](./docs/adr/index.json). Look for an existing Issue or PR before creating one.
3. **Load current research scope when relevant:** [durable evidence program](./research/robustness/README.md), [gate/weakness state](./research/robustness/plan.json) and [claim corpus](./research/robustness/corpus.json). Research reuse is independently valuable; do not require an immediate feature benefit. Check applicability and evidence freshness before extending a scientific claim.
4. **Classify the change:** is this exploration, a reproducible question, a consequential decision, or straightforward implementation? Follow the *provisional publication gate* rather than documenting every thought.
5. **Choose the smallest reviewable step:** for consequential or nontrivial changes, prefer a branch + Pull Request; link the relevant Issue/ADR when there is one. For trivial fixes, avoid process theater.
6. **Preserve continuity:** start from [CONTINUE.md](./docs/CONTINUE.md). At a completed consequential checkpoint, reconcile the plan, this continuation page, navigation and tracker. Scientific claim changes also require the H1 inventory, semantics, matrix and H2 queue to stay aligned. Preserve dated historical evidence; do not convert unknowns into support.
7. **Prove and report:** run `npm run ci && npm run release:check`, distinguish software verification from empirical science, and report what changed, what's still uncertain, and the exact next investigation.

**Default communication:** one short answer up front, optional evidence and detail, precise/direct/nurturing copy. Do not invent physiological confidence scores or privately sourced data. **If the current repository contradicts a remembered discussion, surface the conflict and defer to explicit user instructions before changing the policy.**

## Start here — deterministic commands

```bash
npm run ci
node bin/metron.mjs --file examples/beginner.json
node bin/metron.mjs --example
```

Node >=20. **No `npm install` required.** Do not fetch private health data, install a dependency, or add network access merely to run this project. For CLI integrations, stdin accepts JSON; stdout contains JSON on success, stderr a JSON error on failure with nonzero status.

## Find the right path in one hop

For structured discovery, read `docs/navigation.json` (stable route IDs, exact relative paths, intended audience, and documentation status). For human-facing clarity, read `docs/INFORMATION_DESIGN.md`. The `implemented` flags in `metron.manifest.json` remain the authority for shipped capabilities, not the roadmap or navigation entries.

| Need | Go here first |
| --- | --- |
| Run a calculation | `schemas/input.schema.json` → `core/model.js` → `examples/` |
| Challenge physiology | `docs/SCIENCE.md` → `docs/ROADMAP.md` → `tests/` |
| Extend the interface | `docs/INFORMATION_DESIGN.md` → `docs/DESIGN.md` → `design/tokens.json` |
| Map evidence, clinical applicability, weaknesses and current gates | `research/robustness/README.md` → `plan.json` → `corpus.json` |
| Explore unimplemented research | `docs/RESEARCH.md` → `docs/RESEARCH_PROTOCOL.md` |

**Writing rule:** precise, direct, nurturing. Explain the answer first, make detailed evidence optional but easy to find, and place necessary limitations next to the relevant claim. Diagrams are for comprehension, not decoration. Do not imply a human must read everything or an agent must guess file semantics.

## Source map and capability truth

| Path | Truth it owns |
| --- | --- |
| `core/model.js` | Implemented deterministic calculations. Change equations here only. |
| `core/model.d.ts` | Static types for published JS exports. |
| `schemas/input.schema.json`, `schemas/output.schema.json` | Current JSON contracts. |
| `bin/metron.mjs` | Current agent/CLI I/O adapter. |
| `app.js`, `index.html`, `styles.css` | Browser presentation; no duplicate physiology formulas. |
| `metron.manifest.json` | Machine-readable features, maturity flags and paths; validate against reality. |
| `design/tokens.json` | Canonical visual design tokens; CSS generated through `scripts/build-tokens.mjs`. |
| `docs/SCIENCE.md` | Assumptions, citations, documented limits. |
| `docs/ARCHITECTURE.md` | Implemented layout; `docs/FUTURE_ARCHITECTURE.md` is explicitly a proposal. |
| `docs/RESEARCH_PROTOCOL.md` | Proposed research, **not** published results. |

### Currently implemented

- `normalizeInput`, `mifflinStJeor`, `fatFreeMassKg`, `cunninghamRmr`, `estimateEnergy`, `evaluateRecovery`, `evaluate`.
- Browser: Energy, Readiness (called `recovery` internally), Body; static Pages build.
- CLI/ESM/types/JSON Schema, synthetic examples, tests.

### Not currently implemented

- Caloric Allowance calculations; wearable ingestion/OAuth; WHOOP/Garmin/Apple Health parsers; Bayesian personalization; MCP server; empirical error bounds; validated individualized training prescriptions.

**Do not convert proposed functions, endpoints or data contracts into advertised features.** Model version (0.1.0) is intentionally distinct from repository package version (0.2.0-alpha.4).

## Invariants — protect these

1. **Pure headless core.** Deterministic with no DOM, global state, cookies, network, storage, randomness or timestamp side effects. Explicit units in all input fields.
2. **No double accounting.** Detect/flag potentially overlapping steps and gym activity. The current engine warns about this; actual overlap reconciliation is not yet implemented. Never claim otherwise.
3. **No epistemic laundering.** Direct observations, vendor scores, published formulas, unvalidated heuristics, proposed predictors and recommendations are different categories. Preserve their provenance and uncertainty.
4. **No physiology fictions.** SMM is contained in FFM; it is not an additive resting-calorie bonus and cannot alone determine body fat %. Sleep/readiness does not automatically change the BMR model.
5. **Keep consumers independent.** SDK, CLI, browser and future adapters call the same core, never copy coefficients into UI code.
6. **No false clinical confidence.** Unit test success != measured accuracy. Recovery set counts are illustrative coaching heuristics, not safe-dose thresholds. Avoid aggressive nutrition and medical prescriptions.
7. **Wearable semantics matter.** Do not merge HRV SDNN and RMSSD, midnight calendar steps and physiological-cycle steps, or vendor scores without explicit mapping, intervals and source identifiers.
8. **Private by default.** No health uploads, trackers, access tokens, logging of sensitive inputs, or real personal health datasets in commits.
9. **UX invariants.** V4.1 is a compact white-first instrument with limited, labeled slate/blue/copper data colors—not a marketing landing page. A centered text-only Metron wordmark, immediate energy estimate, three obvious controls, contextual explanations, optional depth, keyboard accessibility, and excellent 320px mobile rendering. Beginners aren't forced into an "expert mode". Avoid decorative color, color-only meaning, fake logo glyphs, and bundled proprietary fonts.

## Current questions, not future features

Read [docs/ROADMAP.md](./docs/ROADMAP.md) for the current investigation and open questions. It is deliberately non-binding; `metron.manifest.json` and working tests, not prose, define implementation truth. No feature timelines, growth targets, or synthetic research results.

## Public reasoning and terminology

Follow [docs/COLLABORATION.md](./docs/COLLABORATION.md), and use [docs/VOCABULARY.md](./docs/VOCABULARY.md) for stable semantics. For consequential choices, inspect [docs/adr/index.json](./docs/adr/index.json) and any superseding ADR **before** proposing conflicting behavior. Use [the ADR template](./docs/adr/TEMPLATE.md) sparingly. The provisional publication gate applies to agents too; don't open a new issue or ADR for every implementation detail.

Separate measured quantities, assumptions, deterministic test results, empirical validation and judgment-based decision confidence. Percent confidence without an evaluation protocol is misleading; don't invent it.

## Editing loop

1. Confirm whether a feature is implemented vs proposed; read relevant documentation.
2. Reproduce with synthetic input; change the smallest appropriate layer.
3. Update corresponding schema, types, source doc, tests, and examples when API behavior changes.
4. Run `npm run ci` and `npm run release:check`; when UI is touched, check keyboard behavior and narrow mobile layouts.
5. Report outputs, limits, commands run, and whether evidence is software-only or empirical.

For scientific work, provide a testable hypothesis, population and measurement method, provenance, leakage-safe evaluation, actual results (including negative), and an independent test horizon. Never invent benchmarks or citations.

## PR instructions

Briefly state **why**, affected contracts, test evidence, user-visible change, physiological assumptions, and remaining risk. If you introduce a model coefficient or decision threshold, cite primary evidence, note the intended population, and expose the choice in the output when practical.

A future MCP adapter, if built, must be an optional wrapper around existing functions with structured inputs/outputs—not a second model or an agent that autonomously changes someone's diet/training.

Historical G0–G4 reproduction uses `research/robustness/h8/frozen-study.mjs` and its pinned core. Do not update historical locks to match a new interface release. H8 requires a genuinely fresh agent record; same-agent scripted navigation is insufficient.

When changing observation completeness, test actual interval coverage alongside history/access/cap flags. Include partial, disjoint, DST and fully covering counterexamples; a positive access flag cannot certify a complete day. This rule applies to admission diagnostics, not physiological accuracy. See H3 measurement tests and review correction.
