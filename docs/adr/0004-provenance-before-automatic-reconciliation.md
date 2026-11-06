# ADR-0004: Keep temporal overlap separate from step inclusion

**Status:** Accepted  
**Date:** 2026-11-06  
**Domain:** Scientific method / interoperability  
**Decision confidence:** Medium (qualitative engineering judgment, not a calibrated probability)  
**Evidence:** Synthetic contract and fixture tests; no physiological measurements  
**Related:** [Issue #1](https://github.com/andydrewie/metron/issues/1) · [ADR-0003](./0003-explicit-overlap-assumptions.md) · [Activity-event research](../../research/activity-events/README.md)

## At a glance

**Decision:** Prototype a source-aware, optional **research-only activity-event contract**, but don't infer step-summary inclusion from overlapping timestamps or change production TDEE.

**Why:** Two observations can describe the same hour without establishing whether one is included in the other's step count.

**Reconsider when:** We have documented real records establishing inclusion and validated temporal/accounting rules that improve predictions without breaking the simple manual-input workflow.

## Context

Our first experiment established that aggregate daily steps and workout duration admit different conditional interpretations. That is not yet a reason to build a full event ledger or silently correct calories.

## Alternatives

- **Infer inclusion from overlapping time windows:** less user input, but scientifically unjustified.
- **Build a complete vendor-aware event store now:** more general, but premature coupling and an avoidable maintenance burden.
- **Represent two records and one explicit membership relationship:** smallest testable distinction with provenance and no production change. **Chosen.**

## Decision

Define one schema and interpreter in `research/activity-events/`. Step totals have explicit reporting-period types, workouts have exact time windows, and source records remain distinct from membership assertions. Missing relationship data stays **unknown**. Any inclusion from a synthetic assumption is labeled as such.

The experimental module does not modify `core/model.js`, `schemas/input.schema.json`, CLI output, browser UI or production capability flags.

## Consequences

**Enables:** honest interval alignment, machine-readable provenance, reproducible counterexamples, future adapter design.

**Costs:** another research contract to maintain; the simple one-workout form doesn't handle multiple sessions, duplicated source records or contradictory providers.

**Follow-up:** source-level event identity, provenance quality, workout/summary reconciliation, gross-vs-net accounting and validation with licensed data remain open.

## Confidence and evidence note

- `decisionConfidence`: medium; design trade-off, not a probability.
- `softwareVerification`: tests-passed (after CI).
- `empiricalValidation`: none.
- **Revisit when:** actual vendor data indicates the relationship cannot be represented without a richer model.

## References

[Open mHealth schema design](https://www.openmhealth.org/documentation/schema-docs/schema-design-principles/) · [RFC 3339](https://www.rfc-editor.org/info/rfc3339/) · [JSON Schema 2020-12](https://json-schema.org/draft/2020-12)
