# Research agenda — attract scrutiny, not just stars

**METRON is not a trained AI model.** It's an open computational estimator and a separate recovery decision heuristic. We welcome researchers who can invalidate, refine, or replace its assumptions with stronger evidence.

## Current cross-project execution program

**Current robustness program:** [checkpoint](../research/robustness/CHECKPOINT.md) · [canonical gate/weakness state](../research/robustness/plan.json) · [tracker #22](https://github.com/andydrewie/metron/issues/22). H0–H5 are complete at declared scope; H7 is under verification. H6 human evidence and H8 fresh-agent recovery remain blocked. Research reuse through 7 November 2027 is independently valuable; clinical applicability remains unreviewed.

## Research questions

**R1 · REE equation performance**
[Validated release admission](../research/ree-validation/G0_SOURCE_AUDIT.md) · [Frozen G1 protocol](../research/ree-validation/G1_FROZEN_PROTOCOL.md) · [Human dashboard](https://github.com/andydrewie/metron/issues/9) · [Agent-readable gates](../research/ree-validation/plan.json). **G0–G4 complete:** [G3](../research/ree-validation/G3_RESULTS.md) reports fixed-equation RMR errors in 454 adults; [G4](../research/ree-validation/G4_DECISION.md) retains the default with scoped guidance. Independent cohort replication remains open.

Compare predicted resting metabolic rates (Mifflin–St Jeor and Cunningham) against indirect calorimetry measurements using an appropriately licensed, documented adult dataset. Report MAE, mean bias, 95% intervals, calibration plots, and subgroup performance. Report sample inclusion criteria; don't silently claim one equation wins for all users.

**R2 · Activity expenditure**
Evaluate fixed stride ratios and net walking kcal/kg/km across different walking speeds, incline, body sizes and gait patterns. Extend the API without double counting basal expenditure.

**R3 · Resistance training**
Test whether workout-duration × mean-MET performs acceptably against measured expenditure, accounting for rest ratios, exercise type and intensity. Only add set-count models if data support them.

**R4 · Recovery readiness**
Operationalize sleep, soreness and performance in prospective studies. The current sleep cutoffs and suggested set bands are **NOT validated**. First task: establish testable endpoints and observational limitations, not claim injury prediction.

**R5 · Uncertainty communication**
Compare numeric display formats (point estimate, rounded estimate, credible range) for calibration of user confidence and usability, without encouraging calorie fixation.

## Minimum standard for a scientific PR

1. State a falsifiable hypothesis and its applicability population.
2. Cite a published primary source or provide a licensed dataset and provenance.
3. Give executable code, seed if relevant, versions and reproducible commands.
4. Include a before/after comparison, error metrics and negative results.
5. Add tests, update `docs/SCIENCE.md`, expose assumptions in machine output.
6. Disclose limitations and avoid clinical advice or exaggerated predictive claims.

### Validation labels

- **Formula tested** — arithmetic and software behavior confirmed.
- **Externally validated** — empirical comparison on a documented measured dataset.
- **Research preview** — an exploratory mechanism or heuristic without such validation.

These labels are intentionally different. A project can be well engineered without its physiological estimates being accurate for every person.

## Current benchmark and proposed generic interface

The [implemented frozen-study CLI](../research/ree-validation/G2_BENCHMARK.md) has published [G3 results](../research/ree-validation/G3_RESULTS.md). The broader interface below remains a proposal, not supported CLI syntax.

`benchmark --dataset <licensed.csv> --target measuredRmrKcal --group sex` should produce machine-readable metrics and provenance. We won't publish fabricated benchmarks or use private health data without explicit consent.
