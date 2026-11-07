# ADR-0006: Prioritize durable evidence and applicability before expansion

**Status:** Accepted

**Date:** 2026-11-07

**Domain:** scientific-method

**Decision confidence:** medium *(qualitative judgment, not a probability)*

**Evidence:** owner direction and the [documented gap inventory](../../research/robustness/plan.json); no new physiological evaluation

## At a glance

**Decision:** Treat the research corpus as a first-class deliverable, designed for reuse through at least 7 November 2027. Establish an applicability ontology, freshness policy and broader robustness gates before the next independent-cohort analysis.

**Why:** The existing G0–G4 study is reproducible but does not cover whole-product validity, clinical applicability, evidence maintenance or reconstruction by future agents.

**Revisit when:** the gate structure obstructs independent work, duplicates records, or fails a real reconstruction or evidence-update exercise.

## Context

The owner clarified that near-term product changes are not the only measure of value. Current evidence, ontological analysis across relevant clinical contexts, and agent navigation can remain useful even if the implementation is rebuilt. Earlier prioritization over-weighted immediate feature utility. The current research front door also contained stale pre-G3 statements, demonstrating a concrete continuity weakness.

## Alternatives considered

- **Proceed directly to the athlete cohort:** faster additional RMR evidence, but leaves scope, provenance freshness and other outputs insufficiently mapped.
- **Require exhaustive medical coverage before any progress:** appears comprehensive but creates an unfinishable prerequisite and invites false claims of completeness.
- **Maintain a bounded, extensible corpus with scoped gates:** preserves independent work while exposing unreviewed areas, counterevidence and limitations. Selected.

## Decision

Adopt [METRON-ROBUST-001](../../research/robustness/README.md). Keep G0–G4 and ADR-0005 complete and historically unchanged. Defer the next cohort to H4 after applicable ontology, evidence and measurement gates. Require source-specific freshness, coverage denominators, explicit scope boundaries, and a clean reconstruction exercise. Clinical conditions, life stages, functional contexts and software failure modes remain separate dimensions.

Reusable research, negative findings and exclusions are valuable outputs. Prefer extending canonical records over producing duplicates. Unknown or unsupported claims stay visible. A twelve-month horizon requires review and preservation; it does not confer a guarantee of currentness or eliminate irreducible uncertainty.

## Consequences

- Enables reuse of evidence and reasoning independently of the present UI or implementation.
- Adds maintenance cost, source-review obligations and an initial delay to cohort replication. Gates must permit independent domain-specific work.
- Does not expand clinical intended use, validate readiness, alter coefficients, authorize private health-data collection, or install a background monitor.
- A passing structural audit establishes record integrity only. Scientific review and future-agent reconstruction remain open work.

## Confidence and evidence note

- `decisionConfidence`: medium; the architecture fits the stated objective but needs actual navigation and reconstruction evaluation.
- `softwareVerification`: tests-passed for program integrity checks, not whole-program scientific adequacy.
- `empiricalValidation`: not-applicable to this planning decision; no new measured outcomes.
- **Revisit when:** a concrete missing definition, missed update, cross-agent ambiguity or gate bottleneck demonstrates that the design needs revision.

## References

- [FAIR guiding principles](https://doi.org/10.1038/sdata.2016.18): machine discovery and reuse.
- [W3C PROV-O](https://www.w3.org/TR/prov-o/): provenance representation.
- [WHO classifications](https://www.who.int/standards/classifications): distinguish disease, functioning and intervention domains; no unverified code mapping is adopted here.
