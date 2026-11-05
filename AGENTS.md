# Metron — instructions for coding agents

This is a real source repository, not a design mockup. **README.md is the human front door; this file is your execution contract.** Metron is an exploratory, headless fitness-computation project with a static browser client. It is **not** a trained AI model or clinically validated physiology system.

## Start here — deterministic commands

```bash
npm run ci
node bin/metron.mjs --file examples/beginner.json
node bin/metron.mjs --example
```

Node >=20. **No `npm install` required.** Do not fetch private health data, install a dependency, or add network access merely to run this project. For CLI integrations, stdin accepts JSON; stdout contains JSON on success, stderr a JSON error on failure with nonzero status.

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

**Do not convert proposed functions, endpoints or data contracts into advertised features.** Model version (0.1.0) is intentionally distinct from repository package version (0.2.0-alpha.3).

## Invariants — protect these

1. **Pure headless core.** Deterministic with no DOM, global state, cookies, network, storage, randomness or timestamp side effects. Explicit units in all input fields.
2. **No double accounting.** Detect/flag potentially overlapping steps and gym activity. The current engine warns about this; actual overlap reconciliation is not yet implemented. Never claim otherwise.
3. **No epistemic laundering.** Direct observations, vendor scores, published formulas, unvalidated heuristics, proposed predictors and recommendations are different categories. Preserve their provenance and uncertainty.
4. **No physiology fictions.** SMM is contained in FFM; it is not an additive resting-calorie bonus and cannot alone determine body fat %. Sleep/readiness does not automatically change the BMR model.
5. **Keep consumers independent.** SDK, CLI, browser and future adapters call the same core, never copy coefficients into UI code.
6. **No false clinical confidence.** Unit test success != measured accuracy. Recovery set counts are illustrative coaching heuristics, not safe-dose thresholds. Avoid aggressive nutrition and medical prescriptions.
7. **Wearable semantics matter.** Do not merge HRV SDNN and RMSSD, midnight calendar steps and physiological-cycle steps, or vendor scores without explicit mapping, intervals and source identifiers.
8. **Private by default.** No health uploads, trackers, access tokens, logging of sensitive inputs, or real personal health datasets in commits.
9. **UX invariants.** V4 is a single compact monochrome instrument—not a marketing landing page. A centered text-only Metron wordmark, immediate energy estimate, three obvious controls, contextual explanations, optional depth, keyboard accessibility, and excellent 320px mobile rendering. Beginners aren't forced into an "expert mode". Avoid decorative colors, fake logo glyphs, and bundled proprietary fonts.

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
