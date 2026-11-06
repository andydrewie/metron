# Metron Research Lab — proposals, not results

This folder exists to make **falsifiable research a first-class contributor surface** rather than an ornamental "science" section in a commercial landing page.

**No published validation benchmarks or collected wearable research dataset currently exist in this repo.** The implemented source is deterministic software; unit tests establish software correctness under selected fixtures, not accuracy against human metabolic or training outcomes.

## Current investigation: Energy accounting

[Issue #1 synthetic experiment](./energy-accounting/README.md) shows that daily steps and workout duration cannot identify overlapping activity. The runner prints structured JSON without accessing any personal health data:

```bash
node research/energy-accounting/run.mjs
```

This research diagnostic is **not** integrated into the consumer calculation. It is not a metabolic validation result.

## The central experiment

**Does adding longitudinal wearable data improve held-out next-session resistance training performance predictions beyond a simple model using previous performance, sleep and subjective recovery?**

- Narrative: [Research agenda](../docs/RESEARCH.md)
- Methodological detail: [Research protocol](../docs/RESEARCH_PROTOCOL.md)
- Machine-readable plan: [`protocol.json`](./protocol.json)
- Design for future data schema: [Future architecture](../docs/FUTURE_ARCHITECTURE.md)

## Contributing safely

Publish a synthetic fixture, external data license, measurement definition and method version before introducing model complexity. Pre-specify the primary outcome and comparator; split evaluation forward in time; test for subject-level and temporal leakage. If a wearable metric fails to add predictive value, that is a useful result.

Do not upload personal WHOOP, Garmin or Apple Health exports, API tokens, identifiable health logs, or unsecured clinical records. Any real-data study requires an appropriate consent and data-governance plan.
