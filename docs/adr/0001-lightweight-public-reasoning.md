# ADR-0001: Preserve public reasoning without requiring paperwork

**Status:** Accepted  
**Date:** 2026-11-05  
**Domain:** Collaboration / information architecture  
**Decision confidence:** Medium *(qualitative engineering judgment, not a probability)*  
**Evidence:** Reasoned comparison of alternatives and established ADR practices; no empirical study of this process  
**Related:** [Collaboration policy](../COLLABORATION.md), [Information design](../INFORMATION_DESIGN.md), [Issue #1](https://github.com/andydrewie/metron/issues/1)

## At a glance

**Decision:** Use **Questions → Experiments → Decisions → Code** as a flexible public reasoning lifecycle, with issues for testable questions, PRs for reviewable experiments/changes, and short ADRs for consequential choices.

**Why:** Future collaborators should understand the reasons behind our code without being required to read our brainstorming history.

**Revisit when:** The process creates noticeable contributor friction, duplicated documentation, or leaves important decisions unexplained.

## Context

Metron is open-source homework, not a product chasing growth metrics. Human attention is precious; agents need stable semantics and precise entrypoints; scientists need honest distinctions between observations, assumptions, estimates and evidence.

## Alternatives

- **Record every idea:** maximal conversational history, but costly to navigate, noisy for newcomers, and easy to mistake for endorsed project direction.
- **Record only code:** low documentation effort, but later contributors lose rationale, rejected options and negative results.
- **Use a publication gate with short decision records:** preserve high-signal reasoning while allowing curiosity and minor changes to remain informal.

## Decision

Adopt the third approach under [the provisional publication gate](../COLLABORATION.md). An ADR is warranted for choices with durable architectural, scientific-method, privacy, contract or accessibility implications. A new ADR supersedes rather than rewrites a historically accepted decision. Minor fixes do not require the full lifecycle.

Use a top-of-page answer, optional details, reproducible links, and agent-readable routing. Never represent an engineering preference score as a calibrated scientific probability.

## Consequences

**Enables:** inspectable intellectual provenance; meaningful forks and criticism; reusable decision context for coding agents and researchers.

**Costs:** index upkeep, occasional disagreement about whether an ADR is worthwhile, and the risk of overproceduralizing curiosity.

**Mitigation:** no quotas, no deadlines, no mandatory four-step workflow, and explicit permission to publish a negative result or no code at all.

## Confidence and evidence

- `decisionConfidence`: medium; established practice and sensible trade-offs support it, but we have not evaluated collaborator experience.
- `softwareVerification`: not-applicable.
- `empiricalValidation`: none.
- **Disconfirmation signal:** contributors repeatedly cannot find important reasons, or avoid contributing because the records are too demanding.

## References

- [ADR templates: Nygard and MADR](https://adr.github.io/adr-templates/)
- [GitHub engineering communication](https://github.com/github/how-engineering-communicates)
- [Microsoft: architecture decision records](https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record)
