# H1: claims, contexts and operational meaning

**H1 is complete for the declared repository snapshot: 35 scientific claim families, 48 primary surfaces, 23 contexts and 805 explicit claim/context cells.** The map distinguishes implemented calculations, observations reported by a study, synthetic demonstrations, author-reported findings, decisions and proposals. All 17 input fields and 31 output fields have units and an epistemic role. **Clinical applicability is still unreviewed.** The matrix does not certify safety or accuracy, and the software does not detect most clinical exclusions. H2 starts with the readiness/action claims because the interface already suggests actions; H3 measurement work is separately unblocked. The corpus is a reusable deliverable even before either produces a feature change.

**Follow-up:** [H2-A](./h2a/README.md) records a bounded readiness review; [H2-B](./h2b/README.md) records resting-equation provenance and transfer evidence. This H1 inventory remains the dated baseline; consult [plan.json](./plan.json) for current execution.

---

## Coverage and reconstruction

The immutable input snapshot is `8fb3728e453493fc99c7a43bbbdaf3e45a43f75e`. [inventory.json](./inventory.json) names 48 primary surfaces and their Git blob IDs at that commit. It maps all identified scientific statements in those surfaces into 35 **claim families**, not 35 independent hypotheses or individual sentences. For example, every G3 cohort metric and interval remains in its canonical frozen JSON under C19/C20; repeated formula explanations share a claim ID. Parent/child links retain the difference between an overall readiness claim and its classification and action rules.

Generated displays, implementation wrappers, tests, synthetic examples, governance records and historical summaries are accounted for by explicit exclusion categories. They are not silently counted as independently reviewed scientific sources. External papers, every possible disease, private conversations and participant-level data are outside this inventory denominator. The result is a finite repository reconciliation, not an exhaustive medical ontology. A future scientific change must update the inventory; the snapshot is not a claim that future commits have already been reviewed.

Use [corpus.json](./corpus.json) for stable claims, concepts, contexts and source pointers; [semantics.json](./semantics.json) for field units and observation/model/decision boundaries; and [applicability.json](./applicability.json) for every declared pair. The files use a working local vocabulary. No ICD, ICF, LOINC, OWL or other external equivalence mapping has been adopted. WHO/ICF and PROV-O remain references rather than formal conformance claims. Any future mapping requires the exact identifier, relationship, version, inspected terms and review record.

## What the map makes visible

| Finding | Consequence and next gate |
| --- | --- |
| C15: the UI can say “Ready for your full session” and show a green day, while the source disclaimer calls set counts unvalidated | Review action wording and evidence first in H2-A; H5 decides the decision boundary. H1 does not validate or change the UI. |
| C17: default inputs, including the UI's 20% body-fat initialization, are assumptions | H3/H7 must distinguish defaults from observations and assess input provenance. Numeric bounds do not establish eligibility. |
| C33: headline rounding and differences between equations may look like uncertainty information | Neither establishes an individual prediction interval. H6 must assess calibration and comprehension. |
| C34: adult educational intent and clinical exclusions are documented | The API has no disease, severity or treatment fields. Do not describe these boundaries as automatic screening. H2/H5/H7 own the remaining questions. |
| C19/C20: measured G3 evidence exists, but only at the frozen cohort and endpoint scope | Preserve the paired overall comparison, Mifflin-only subgroup analysis and all qualifications. No TDEE/readiness validation follows. |
| C21/C22/C23: synthetic changes and analytic sensitivities are reproducible | They identify arithmetic consequences, not empirical error magnitudes or calibrated bounds. |
| C29/C30: provider documentation and sample identity are different from aggregate membership | Preserve measurement/reporting windows and unknown merge rules. No automatic step subtraction is justified by H1. |

The output root's `kcal/day` label must not be applied to every nested value: FFM is kg, stride is m/step, incremental walking is km/day, and a MET factor is dimensionless. Recovery fields use their actual nested API paths, including `recovery.classification` and `recovery.recommendation`. Automated tests compare the contract with both schemas and runtime output, including null composition fields.

## Reading the applicability matrix

The 17 base contexts and six named intersections keep clinical conditions, life stages, function and treatment separate. Athletic muscularity, aging, pregnancy and disability are not automatically diagnoses. Each context explicitly retains unreviewed severity, duration, treatment, coexisting conditions, measurement protocol and time horizon. Null means unknown, not normal or absent. The named intersections are a bounded starting set, not an exhaustive cross-product of human states.

| Code | Meaning |
| --- | --- |
| E | Documented educational adult use; evidence for the context remains unreviewed |
| U | Context-specific applicability is not established; evidence remains unreviewed |
| X | Documented outside validated scope; no runtime clinical detection or enforcement |
| N | Method, arithmetic, report boundary or proposal; not a population-performance claim |

An N cell does not establish that a method is safe to use for that population. An E cell does not establish accuracy. No cell is marked clinically supported. Known G3 evidence is preserved at claim/source level while transfer to these broad contexts remains unreviewed. Support cannot be inferred from a neighboring context or an intersection's individual members.

## H2 priorities and acceptance review

[h2-review-queue.json](./h2-review-queue.json) assigns every claim family to a review slice. The order is readiness/action boundaries, resting-equation applicability, measurement/provenance, combined-energy uncertainty and proposed allowance/calibration. This is a consequence-based ordering, not an estimate of research effect sizes. H2 must inspect primary content, contrary evidence, versions/corrections, source rights and applicability; an old citation or a new inventory date does not establish currency.

| H1 acceptance criterion | Evidence and disposition |
| --- | --- |
| Reconcile public scientific outputs and declare denominator | 35 families mapped across 48 snapshot surfaces; explicit exclusions; no unresolved identified family |
| Define quantities, units and observation/model/decision/time distinctions | Working concepts and semantics for all 17 inputs and 31 outputs; unknown measurement metadata retained |
| Explicit claim/context coverage, dimensions and intersections | 805 cells across 23 contexts, including six intersections; every biological applicability cell unreviewed |
| Verify any external mapping and retain limits | No external mapping adopted; exact verification requirements recorded; no conformance or clinical coverage claim |

Reviewed on 7 November 2026 by the maintaining agent at the scope above. This is not an independent clinical or reconstruction review. W02 is **constrained** by explicit mapping and boundaries; clinical evidence remains for H2. W08 remains open until H8's separate reconstruction exercise is actually performed.

```bash
node research/robustness/audit.mjs --as-of 2026-11-07
node research/robustness/inspect.mjs
node research/robustness/inspect.mjs --claim C15 --context renal-fluid
npm run ci
npm run release:check
```

The date argument is deliberate: future reviewers must use their actual review date. Integrity checks reject missing cells, missing units, unaccounted schema fields and unsupported evidence promotion. They do not read new literature or establish scientific validity. Resume through [CONTINUE.md](../../docs/CONTINUE.md); preserve the completed G0–G4 study and its exact source pins.
