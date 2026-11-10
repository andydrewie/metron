# Metron Research Lab — evidence, limitations and open questions

This folder exists to make **falsifiable research a first-class contributor surface** rather than an ornamental "science" section in a commercial landing page.

**Measured resting-equation results are published:** [G3](./ree-validation/G3_RESULTS.md) evaluated 454 adults; [G4](./ree-validation/G4_DECISION.md) records the separate model decision. [H4](./robustness/h4/README.md) adds a separate cohort of 89 eligible recreational athletes. These are limited resting-energy results. Combined TDEE, individual predictions and readiness remain unvalidated; no collected wearable research dataset is published here.

**Current robustness program:** [checkpoint](./robustness/CHECKPOINT.md) · [canonical gate/weakness state](./robustness/plan.json) · [tracker #22](https://github.com/andydrewie/metron/issues/22). H0–H5, H7 and H8 are complete at declared scope: eight of nine gates. H6 remains blocked on actual-user comprehension and decision-usefulness evidence. Research reuse through 7 November 2027 is independently valuable; clinical applicability remains unreviewed.

## Open investigation: Energy accounting

[Issue #1 synthetic experiment](./energy-accounting/README.md) shows that daily steps and workout duration cannot identify overlapping activity. The runner prints structured JSON without accessing any personal health data:

```bash
node research/energy-accounting/run.mjs
```

This research diagnostic is **not** integrated into the consumer calculation. It is not a metabolic validation result.

**Next:** [Experimental activity-event contract](./activity-events/README.md) tests whether record intervals and provenance can prevent unwarranted assumptions about overlapping daily steps. No production energy correction is implemented.

**Official-source review:** [WHOOP, Garmin and Apple HealthKit step semantics](./provider-step-semantics/README.md), including Garmin's documented Personal API. Evidence is source-linked, synthetic-only and does not change production estimates.

**Read-only pilot:** [Apple HealthKit local experiment](./apple-healthkit-pilot/README.md) includes source and Xcode project for comparing workout-associated and day-query step sample IDs. No personal data is uploaded; real-device operation is not yet verified.

**No-device path:** [Coefficient sensitivity audit](./assumption-sensitivity/README.md) uses fabricated profiles to quantify how the *mathematical model* responds to changed parameters; it does not measure physiological accuracy.

**Measured resting-metabolism validation program:** [G0 verified source and G1 frozen protocol](./ree-validation/G1_FROZEN_PROTOCOL.md) · [G2 deterministic benchmark](./ree-validation/G2_BENCHMARK.md) · [Research dashboard](https://github.com/andydrewie/metron/issues/9). G0–G4 are complete, including actual measured-cohort errors. The frozen results and source pins remain unchanged. A second cohort has been evaluated under H4 of the robustness program; use its current checkpoint for status. Separate from the proposed wearable-performance project below.

## Proposed wearable-performance experiment

**Does adding longitudinal wearable data improve held-out next-session resistance training performance predictions beyond a simple model using previous performance, sleep and subjective recovery?**

- Narrative: [Research agenda](../docs/RESEARCH.md)
- Methodological detail: [Research protocol](../docs/RESEARCH_PROTOCOL.md)
- Machine-readable plan: [`protocol.json`](./protocol.json)
- Design for future data schema: [Future architecture](../docs/FUTURE_ARCHITECTURE.md)

## Contributing safely

Publish a synthetic fixture, external data license, measurement definition and method version before introducing model complexity. Pre-specify the primary outcome and comparator; split evaluation forward in time; test for subject-level and temporal leakage. If a wearable metric fails to add predictive value, that is a useful result.

Do not upload personal WHOOP, Garmin or Apple Health exports, API tokens, identifiable health logs, or unsecured clinical records. Any real-data study requires an appropriate consent and data-governance plan.
