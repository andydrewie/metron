# Future architecture — Metron research and product thesis

> **Metron: Daily Energy, Readiness, & Caloric Allowance**  
> An open, headless instrument for observing physiology, estimating energy and recovery, and testing training and nutrition decisions.

**Status:** Architecture proposal; **not implemented** in the Metron v0.1 model. Existing software tests do not establish biological prediction accuracy. This document is written as a release-design record, not marketing copy.

## Premise

> I wanted to understand how sleep, body composition, physical activity, and training volume interact. So I built a calculator, documented my assumptions, and open-sourced the homework.

The deepest architectural separation is not the three UI tabs; it is **observe → infer → decide → evaluate**. Energy, readiness, and allowance are three outcomes supported by the same evidence graph. A wearable score is one vendor's derived measurement, not ground truth. A recommendation is a decision conditional on a goal, constraints, and uncertainty, not a directly measured fact.

## Architecture

```text
[Manual input]   [WHOOP]   [Garmin]   [Apple Health / exports]
          \          |         |           /
           [Adapters + typed provenance / time alignment]
                            |
               [Observation/event store schema]
                            |
                 [Pure, deterministic models]
       [Energy ledger] [Recovery inference] [Goal policy]
                \              |               /
              [Explainable outputs + audit trail]
                    /          |          \
              [Web/PWA]     [CLI/SDK]    [Agent tools]
                            |
                [Optional personal calibration]
                            |
                  [Evaluation and feedback]
```

**One package per responsibility, not one framework for everything.** Proposed directories for later refactoring:

```text
packages/core/           # pure computation: equations, ledger, readiness, allowance, policy
packages/schema/         # JSON Schema + TypeScript definitions and fixtures
packages/adapters/       # file/WHOOP/Garmin/Apple Health parsers; no imports into core
apps/web/                # proposed future location; not yet implemented
apps/cli/                # JSON stdin / stdout; same core and schemas
integrations/mcp/        # optional future adapter; no separate physiology logic
research/evaluation/     # scripts, synthetic fixtures, data-use notices, scorecards
research/protocols/      # preregistered hypotheses, endpoints and leakage safeguards
docs/                    # science, ADRs, API, evidence map, design, privacy
```

Do not introduce a monorepo build system until it buys us something; v0.2 may implement these logical boundaries inside existing directories with no new dependencies.

## Data contract — every value must be interpretable

**Observation** minimum fields: `metric`, `value`, `unit`, `observedAt` *or* `interval`, `source.provider`, `source.recordType`, `definition`, `quality`, `schemaVersion`. Optional: `deviceModel`, `algorithmVersion`, `timezone`, `rawRecordId`, `provenance`, `ingestedAt`. Distinguish timestamp when sampled, timestamp when ingested, and interval to which it belongs.

- An Apple Health **HRV SDNN** value and a WHOOP **HRV RMSSD** value must retain distinct metric definitions; never aggregate as generic `hrv`.
- A WHOOP physiological-cycle step count is not necessarily a local-calendar-day total.
- WHOOP's public API exposes sleep, recovery, workouts, cycles, and measurements; **continuous heart-rate streams are not available through that API**. Do not promise raw continuous HR access.
- Strength Trainer activities may be present through WHOOP workout endpoints; do not promise per-set weights/reps data through the public API unless verified.
- Missing, stale, unscorable and contradictory observations must not be converted to zero or silently merged. Merging requires explicit conflict policy and traceable source preference.

**Estimate** output: `quantity`, `value` or `range`, `units`, `modelId`, `modelVersion`, `derivedFrom`, `assumptions`, `limitations`, `evidenceTier`, `generatedAt` (supplied at orchestration boundary), and `calibrationStatus`.

**Decision** output: `suggestion`, `goal`, `context`, `tradeoffs`, `safetyFlags`, `rationale`, `dataNeeded`, `decisionPolicyVersion`, `nonClinicalDisclaimer`. This is not an injury prediction, medical clearance, or deterministic training order.

## Four invariants to enforce in code

1. **No double accounting:** workouts, walking, standing, and baseline energy must be represented as disjoint intervals or explicitly reconciled. When coarse daily steps and workout duration overlap ambiguously, return a warning and a conservative range rather than silently summing.
2. **No epistemic laundering:** source scores, direct observations, physiological estimates, validated predictors, and user choices have separate semantic types and labels. Confidence language cannot exceed empirical validation.
3. **No temporal leakage:** personalized models must use only information available *before* the decision. Evaluate on future sessions, not random shuffle splits of a single person's history.
4. **No vendor lock-in:** all estimates can run on fully manual inputs; vendor adapters are optional. The headless core must remain usable offline without credentials, an LLM, a web server, or private health data.

## Pillars and timescales

| Pillar | Inputs | Output | Timescale | Key caution |
| --- | --- | --- | --- | --- |
| **Energy** | mass/composition, steps, activity intervals | Estimated TDEE + component ledger | hours/day | avoid overlapping activity + unsupported precision |
| **Readiness** | sleep, subjective energy, soreness/pain, recent performance, optional trends | Explainable training options | day and rolling weeks | one biomarker ≠ demonstrated training capacity |
| **Allowance** | smoothed TDEE, objective, constraints, rate targets | Intake planning estimate | rolling weeks | dynamic compensation and water-weight confounding |
| **Calibration** (internal) | logged intake, body-weight trajectory, training outcomes | updated individual parameters / evidence | weeks/months | adherence and measurement bias; held-out validation |

**Objective is explicit:** maintain / fat loss / muscle gain. Activity-derived expenditure and calorie allowance must remain semantically distinct. Do not equate daily TDEE movement with an automatic daily intake order. Avoid encouraging aggressive calorie restriction or compensatory eating/exercise patterns.

## Model hierarchy: earn complexity

- **M0 — Simple transparent baseline:** published resting equation + explicit activity approximations; manual recovery description; no manufactured uncertainty intervals.
- **M1 — Correct accounting:** source-aware overlap resolution, individualized baseline steps, interval-aligned activity, explicit uncertainty due to missing data.
- **M2 — Personal calibration:** estimate bias from longitudinal weight/intake records, with measurement-error assumptions and independent forward testing.
- **M3 — Predictive recovery:** only if prespecified outcomes and held-out evidence show an improvement over simple sleep + subjective energy + last-session performance.

The user can always inspect, substitute, disable, and compare models. No model becomes default merely because it has more predictors. Cross-device predictions must demonstrate value rather than assume vendor scores are interchangeable.

## UX architecture: one instrument, progressive precision

**Top-level:** Energy · Readiness · Allowance. **Body** is a shared, optional profile sheet/panel, not a competing scientific pillar. Maintain the popular V4 interaction rule: immediate meaningful answer, obvious primary controls, contextual help, expandable assumptions. No mandatory onboarding or account. Profiles are private by default; use a sample profile for public screenshots, not an individual's real measurements.

**Every result can answer three questions:** What is this? What evidence went into it? What would change the recommendation? No noisy 0–100 certainty meters, fake recovery precision, sponsored wearable rankings, or scientific theater.

**Advanced/research view:** versioned inputs, effect of each assumption, alternative model comparisons, counterfactuals, exportable JSON and reproducibility command. Keep this behind an explicit "Inspect model" disclosure, not an exclusive expert mode.

## Agent-native contract

CLI and SDK should expose `normalizeObservations`, `estimateEnergy`, `evaluateReadiness`, `estimateAllowance`, `compareScenarios`, `explainEstimate` with machine-readable errors. These names are **proposed**, not currently implemented.

Successful response includes data lineage and versioned `method`. No native MCP or arbitrary action/decision autonomy is needed for v0.2. A future MCP tool is read-only by default and returns calculations, not instructions to self-modify workout schedules or health records.

## Trust, research, and distribution

- The GitHub landing page opens with an 8-second screen demo, transparent statement of purpose, `Try the instrument`, `Use from code`, and `What we have not validated`.
- Documentation foregrounds negative results, evidence tiers, licenses and reproducible evaluations; fancy badges come only from actual CI/release state.
- Original raw WHOOP/Apple/Garmin exports are not bundled. Publish synthetic or permission-cleared examples. Vendor integrations are opt-in; a static Pages build never embeds OAuth secrets.
- For scientists, the contribution surface is labeled **Open questions**: Does HRV add predictive value? Do activity-aware energy estimates outperform a simple mass-based baseline? Does any personalized method generalize to later weeks?

## What not to do yet

Do not claim an AI model, a validated WHOOP-based training-readiness metric, a causal sleep effect from observational traces, universal MET accuracy, a precise individual daily allowance, or direct Apple HealthKit access from a GitHub Pages website. Do not build an LLM chatbot as the primary UI. Do not require a backend for calculations that can run offline. Do not call an untested heuristic an optimized training dose.

## Proposed release gates

1. Resting and activity calculations independently tested, with units and caveats; no silent overlapping expenditure.
2. Schemas encode metric method, provenance and temporal semantics; synthetic device adapters demonstrate round-trip conversion.
3. Readiness displays qualitative, explicit limitations rather than unvalidated precise recommended sets by default.
4. Allowance feature exists and is clearly separated from expenditure; goal/deficit input guards are reviewed.
5. Three-pillars UI works on a phone and by keyboard/screen reader; automated CI, no secrets, no login required.
6. `npm test`, `npm run build`, CLI sample and GitHub Pages deployed demo independently verified.
7. README/CHANGELOG/CITATION/AGENTS/evidence map accurately reflect implementation, not plans.

## Official source notes (accessed 2026-11-05)

- WHOOP V2 API docs: https://developer.whoop.com/api/
- WHOOP cycle semantics, including step counts: https://developer.whoop.com/docs/developing/user-data/cycle/
- WHOOP API continuous HR limitation: https://developer.whoop.com/docs/developing/support/
- Apple HealthKit HRV SDNN definition: https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifier/heartratevariabilitysdnn
- Garmin Personal API scope and terms: https://developer.garmin.com/gc-developer-program/personal/personal-faq
- REFORMS (reporting ML-based science): https://pmc.ncbi.nlm.nih.gov/articles/PMC11092361/
