# Headless API — implemented surface

**Status:** executable today, zero runtime dependencies, Node >=20 for CLI scripts. This file describes `core/model.js`, not the proposed future Metron research APIs.

## Exported functions

| Function | Role | Status |
| --- | --- | --- |
| `normalizeInput(input)` | Apply defaults and validate numeric/enumerated fields | Implemented |
| `mifflinStJeor(profile)` | Compute a published population resting-expenditure equation | Implemented |
| `fatFreeMassKg(profile)` | Compute FFM when BF% supplied | Implemented |
| `cunninghamRmr(ffmKg)` | Calculate FFM-based resting estimate | Implemented |
| `estimateEnergy(input)` | Estimated TDEE with baseline/walking/workout components and warnings | Implemented, unvalidated combined model |
| `evaluateRecovery(input)` | Illustrative training-readiness coaching heuristic | Implemented, unvalidated heuristic |
| `evaluate(input)` | Return both energy and recovery outputs | Implemented |

## JavaScript usage

```js
import { evaluate } from './core/model.js';
const result = evaluate({
  profile: { weightKg: 80, heightCm: 175, ageYears: 30, equationSex: 'male' },
  activity: { steps: 10000, workoutMinutes: 60, intensity: 'typical' },
  recovery: { sleepHours: 7.5, energy: 'good', weekly: 'mixed' }
});
console.log(result.energy.estimatedTdeeKcal); // illustrative estimate
console.log(result.recovery.status); // heuristic classification
```

## CLI usage

```bash
node bin/metron.mjs --example
node bin/metron.mjs --file examples/beginner.json
cat examples/beginner.json | node bin/metron.mjs
```

Outputs are JSON to stdout. Invalid inputs emit a JSON `{ "error": "..." }` to stderr with nonzero exit status. A `--example` call prints default **input**, not evaluated output.

## Machine-readable contracts

- [Input JSON Schema](../schemas/input.schema.json)
- [Output JSON Schema](../schemas/output.schema.json)
- [ESM TypeScript declarations](../core/model.d.ts)
- [Machine capability manifest](../metron.manifest.json)

The schema reflects the current `evaluate` I/O, not a wearable-observation interchange schema. Input fields are explicit units (`weightKg`, `heightCm`, `sleepHours`). `modelVersion` in the output tracks calculation behavior, independently of this repository's release version.

## Semantics worth preserving

- `estimatedTdeeKcal` is **estimated expenditure**, not a diet prescription.
- `restingModel` chooses Mifflin or Cunningham; Cunningham requires BF%.
- `skeletalMuscleKg` is optional tracking information, not added into metabolic expenditure.
- Workout MET values are session averages including rest intervals.
- Current activity components can overlap; inspect `warnings` rather than treating the sum as measured truth.
- Readiness recommendations are **not** validated personalized safe-volume thresholds.

## Proposed extensions (not importable)

`normalizeObservations`, `estimateAllowance`, `compareScenarios`, `explainEstimate`, future vendor parsers and MCP are described in [future architecture](./FUTURE_ARCHITECTURE.md). Do not call them from integrations until tests and schema definitions ship.

## Interface boundary changes in 0.2.0-alpha.4

Plain data objects only; accessor and prototype-bearing class instances are rejected. Nested defaults are immutable. Direct `mifflinStJeor` requires weightKg, heightCm, ageYears and the historical male/female equation parameter within the input-schema ranges. `fatFreeMassKg` validates weight and optional/null BF; `cunninghamRmr` requires finite FFM greater than zero and at most 350 kg. These are computational bounds, not clinical eligibility.

CLI arguments are exact and errors use fixed messages without echoing inputs or file paths. Input is limited to 1 MiB. The browser disables stale results/exports on invalid entry and leaves optional BF blank. Its exported wrapper adds `inputOrigins` (example-default, user-entered, fallback-default, unknown); this is not a measurement/provenance adapter or a new core input field.

Legacy `recommendation`, `restRecommended` and status names remain for compatibility and numerical-model identity. Treat them as illustrative rule outputs, never training clearance or safe/optimal dose. See ADR-0007 and H5. Numerical model version 0.1.0 is unchanged; the package version records validation and presentation changes.
