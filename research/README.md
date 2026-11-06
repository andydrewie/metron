# Metron Research Lab — proposals, not results

This folder exists to make **falsifiable research a first-class contributor surface** rather than an ornamental "science" section in a commercial landing page.

**No published validation benchmarks or collected wearable research dataset currently exist in this repo.** The implemented source is deterministic software; unit tests establish software correctness under selected fixtures, not accuracy against human metabolic or training outcomes.

## Current investigation: Energy accounting

[Issue #1 synthetic experiment](./energy-accounting/README.md) shows that daily steps and workout duration cannot identify overlapping activity. The runner prints structured JSON without accessing any personal health data:

```bash
node research/energy-accounting/run.mjs
```

This research diagnostic is **not** integrated into the consumer calculation. It is not a metabolic validation result.

**Next:** [Experimental activity-event contract](./activity-events/README.md) tests whether record intervals and provenance can prevent unwarranted assumptions about overlapping daily steps. No production energy correction is implemented.

**Official-source review:** [WHOOP, Garmin and Apple HealthKit step semantics](./provider-step-semantics/README.md), including Garmin's documented Personal API. Evidence is source-linked, synthetic-only and does not change production estimates.

**Read-only pilot:** [Apple HealthKit local experiment](./apple-healthkit-pilot/README.md) includes source and Xcode project for comparing workout-associated and day-query step sample IDs. No personal data is uploaded; real-device operation is not yet verified.

**No-device path:** [Coefficient sensitivity audit](./assumption-sensitivity/README.md) uses fabricated profiles to quantify how the *mathematical model* responds to changed parameters; it does not measure physiological accuracy.

**Measured resting-metabolism validation program:** [G0 source admitted and G1 methodology frozen](./ree-validation/G1_FROZEN_PROTOCOL.md) · [GitHub research dashboard](https://github.com/andydrewie/metron/issues/9). The data source is verified, the statistical protocol is locked, but **no model error results have been calculated**. This is separate from wearable-performance research below.

## The central experiment

**Does adding longitudinal wearable data improve held-out next-session resistance training performance predictions beyond a simple model using previous performance, sleep and subjective recovery?**

- Narrative: [Research agenda](../docs/RESEARCH.md)
- Methodological detail: [Research protocol](../docs/RESEARCH_PROTOCOL.md)
- Machine-readable plan: [`protocol.json`](./protocol.json)
- Design for future data schema: [Future architecture](../docs/FUTURE_ARCHITECTURE.md)

## Contributing safely

Publish a synthetic fixture, external data license, measurement definition and method version before introducing model complexity. Pre-specify the primary outcome and comparator; split evaluation forward in time; test for subject-level and temporal leakage. If a wearable metric fails to add predictive value, that is a useful result.

Do not upload personal WHOOP, Garmin or Apple Health exports, API tokens, identifiable health logs, or unsecured clinical records. Any real-data study requires an appropriate consent and data-governance plan.
