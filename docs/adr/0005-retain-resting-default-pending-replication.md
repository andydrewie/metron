# ADR-0005: Retain the resting-model default pending relevant replication

**Status:** Accepted  
**Date:** 2026-11-07  
**Domain:** Scientific method  
**Decision confidence:** Medium (deployment judgment, not an individual-accuracy probability)  
**Evidence:** [G3 measured results](../../research/ree-validation/G3_RESULTS.md) and [G4 evidence review](../../research/ree-validation/G4_DECISION.md)  
**Linked issue:** [#13](https://github.com/andydrewie/metron/issues/13)

## At a glance

**Decision:** Retain Mifflin–St Jeor as the default and Cunningham as an explicit option; publish population and input-quality guidance.

**Why:** G3 favors Cunningham in one cohort, but does not establish a universal selection rule. Body-composition measurement and external-population performance matter.

**Reconsider when:** A separately frozen evaluation demonstrates useful paired improvement in a relevant independent population under realistic input conditions, with subgroup harms assessed.

## Context and alternatives

The frozen benchmark on 454 adults found lower average absolute error for Cunningham. Retaining Mifflin is therefore a deployment choice under incomplete generalizability evidence, not a claim of Mifflin's statistical superiority. The [G4 review](../../research/ree-validation/G4_DECISION.md) records supportive studies, contrary findings, exact input sensitivities and review limits.

- **Automatically use Cunningham whenever body fat is entered:** may help populations resembling favorable studies, but numerical availability does not verify measurement quality. Rejected for now.
- **Retain both choices with an unchanged default and better guidance:** preserves the simple input contract and makes the trade-off inspectable. Chosen.
- **Refit or bias-correct from G3:** risks overfitting a known benchmark and lacks an independent test horizon. Rejected for this study.

## Decision

The model remains **0.1.0**. Its input validation establishes permitted values, not body-composition accuracy. This decision introduces no automatic model selector, quality classifier, physiology coefficient, schema change, individual uncertainty interval or UI redesign.

## Consequences

**Cost:** a retained default can perform worse for users resembling cohorts where Mifflin underpredicts. Keep that finding visible and Cunningham selectable. No equation is advertised as a measurement or as a validated daily calorie target.

**Follow-up:** qualify an independent cohort, then freeze the comparison and decision criteria before further analysis. Any default change needs a new reviewed decision and appropriate versioning. Do not quietly revise the existing G1 protocol or G3 results to support a preferred conclusion.

## Confidence and evidence note

- `decisionConfidence`: medium, because retaining a reversible baseline avoids an unsupported universal rule but has a documented potential accuracy cost.
- `softwareVerification`: tests-passed; required repository CI and release preflight verify software/document integrity, not the scientific conclusion.
- `empiricalValidation`: external-retrospective, limited to G3's fixed-equation single-source RMR reanalysis; no prospective replication or whole-product validation.
- **Revisit when:** prespecified paired benefit persists in a relevant independent cohort under realistic FFM acquisition, without important subgroup deterioration. Fix practical benefit/harm criteria before evaluating that cohort.
