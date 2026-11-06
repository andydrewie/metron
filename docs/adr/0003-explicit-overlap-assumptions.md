# ADR-0003: Don't silently infer overlapping activity

**Status:** Accepted  
**Date:** 2026-11-06  
**Domain:** Scientific method / activity-energy accounting  
**Decision confidence:** Medium *(qualitative methodological judgment, not calibrated probability)*  
**Evidence:** [Synthetic experiment](../../research/energy-accounting/README.md), [Issue #1](https://github.com/andydrewie/metron/issues/1), current model source; no empirical energy measurements  
**Related:** [Science](../SCIENCE.md), [Architecture](../ARCHITECTURE.md), [ADR-0001](./0001-lightweight-public-reasoning.md)

## At a glance

**Decision:** Preserve the shipped daily expenditure calculation; perform explicit research-only conditional analysis when step/workout overlap is known or hypothetically bounded. Never silently guess overlap or present conditional endpoints as a confidence interval.

**Why:** Daily steps and exercise duration do not identify whether the same activity is already represented twice.

**Revisit when:** An event-aware input contract and evidence show that real-world overlap can be reliably reconciled without adding more error.

## Context

Our current implementation combines RMR × 1.2, walking above 2,000 baseline steps, and workout MET above the baseline allowance. Some workout steps may also appear in the walking term. The source includes a warning but has no timestamps or per-session steps to resolve overlap.

## Alternatives considered

- **Ignore the issue:** avoids additional fields but leaves important ambiguity unexamined.
- **Automatically subtract a universal workout-step correction:** superficially simple but unsupported without activity intervals, baseline allocation, and measurement definitions.
- **Keep current output; explore only conditional differences with explicit assumptions:** reproducible, honest, backward-compatible. **Chosen.**

## Decision

Add a research-only, zero-dependency synthetic harness. It accepts `known` or `bounded-unknown` workout-step allocations **beyond** the assumed baseline. It reuses the existing energy result without copying physiological coefficients, and reports hypothetical differences.

It does **not** change `core/model.js`, output schemas, public UI, or the API model version. `activityOverlapReconciliation` remains `false`.

## Consequences

- **Enables:** transparent numerical examples, reproducibility, agent-readable diagnostics, a useful foundation for activity-event provenance discussions.
- **Costs:** conditional examples might be misread as measured accuracy; assumptions about baseline step allocation and whole-session MET remain fragile.
- **Follow-up:** retain Issue #1 until we evaluate an explicit event-aware contract, gross/net energy semantics, and low-step baseline behavior.

## Confidence and evidence note

- `decisionConfidence`: medium; mathematically identifiable ambiguity and transparent non-action, not a scientific proof of corrected calories.
- `softwareVerification`: tests-passed (synthetic deterministic arithmetic only).
- `empiricalValidation`: none.
- **Revisit when:** a justified data model and measured data support changing the shipped calculation.

## References

- [2024 Adult Compendium of Physical Activities](https://pacompendium.com/adult-compendium/)
- [Metron scientific assumptions](../SCIENCE.md)
- [Reproducible cases](../../research/energy-accounting/scenarios.json)
