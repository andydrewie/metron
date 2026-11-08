# Durable evidence and robustness program

## In 20 seconds

**Make Metron's research reusable through at least 7 November 2027, with explicit freshness and applicability limits.** The corpus is a deliverable in its own right. Preserve definitions, evidence, counterevidence, methods and executable contracts so a future agent can reconstruct the reasoning and rebuild the software. The completed G0–G4 resting-equation study stays closed. New gates address gaps across the whole project; recording a gap does not resolve it.

---

**Program:** `METRON-ROBUST-001` · **Established:** 7 November 2026

**Current checkpoint:** [all-gate execution record](CHECKPOINT.md). H0–H5 and H7 are complete at declared scope, and H6/H8 retain explicit evidence blockers. Clinical applicability remains unreviewed.

**Tracker:** [issue #22](https://github.com/andydrewie/metron/issues/22)

**Canonical state:** [plan.json](./plan.json) · **Claim and context inventory:** [corpus.json](./corpus.json) · **Decision:** [ADR-0006](../../docs/adr/0006-durable-evidence-before-expansion.md)

## Objective and honest stopping conditions

Research value includes reusable explanations, well-supported exclusions, contradictions, negative findings and definitions that survive replacement of the current app. It need not produce an immediate feature. The twelve-month horizon is a design and maintenance objective, not a guarantee that present evidence will remain current or that every future publication will be found.

Aim for **no untracked material weakness**. Each known weakness must be resolved with appropriate evidence, constrained by an explicit scope boundary, or remain open with an owner role, blocker and next test. A documented exclusion reduces misuse risk but does not prove accuracy in that population. Unknown, unreviewed, unsupported and contradicted are different states. Do not erase uncertainty to obtain an all-green dashboard.

H0 inventories the current source, advertised capabilities, research entrypoints and known limitations. It is not an exhaustive independent code audit or a comprehensive medical review. H1 reconciles 35 claim families across 48 primary snapshot surfaces, 23 contexts and 805 explicit cells. This finite coverage denominator does not establish comprehensive clinical evidence.

## Execution order

| Gate | Question and required evidence | Current scoped state |
| --- | --- | --- |
| **H0 · Scope and weaknesses** | Inventory capability claims, inherited evidence, material gaps, owners and acceptance criteria; preserve completed G0–G4. | Complete for the defined baseline |
| **H1 · Ontology and applicability** | Define quantities, observations, models, decisions and outcomes; map population, clinical state, method and time context to each claim. Enumerate reviewed and unreviewed coverage. | Complete for the finite repository inventory; clinical evidence unreviewed |
| **H2 · Current evidence and contradictions** | Execute documented searches of primary studies and authoritative guidance; record dates, corrections/retractions, counterevidence, versions, rights and claim-level applicability. | All five slices complete at bounded scope |
| **H3 · Measurement and energy accounting** | Audit reference methods, input error, gross/net expenditure, baseline allocation, activity membership, missingness and incompatible wearable semantics. | Complete as an audit with explicit no-go boundaries |
| **H4 · External validity** | Admit relevant independent data; freeze endpoints, paired comparisons, subgroup harms and decision margins before analysis; reproduce results independently. | Complete for independent resting replication; TDEE accuracy no-go |
| **H5 · Readiness and decision boundaries** | Define readiness/performance endpoints, audit current set recommendations, evaluate prospective predictive value, or explicitly retain/restrict unsupported guidance. | Complete through explicit restriction/no-go; no prospective outcome claim |
| **H6 · Uncertainty and individual value** | Separate cohort intervals, input sensitivity and individual prediction uncertainty; evaluate calibration forward in time and whether users understand the decision limits. | Blocked on real-user comprehension and decision-value evidence |
| **H7 · Software, privacy and accessibility** | Exercise public API/CLI/browser contracts, malformed inputs, privacy failures, dependency/build assumptions, keyboard/mobile and color-independent comprehension. | Complete at bounded software/browser review scope |
| **H8 · Reconstruction and maintenance** | Complete a clean-checkout reproduction and a separately recorded agent navigation/rebuild exercise; verify evidence update and supersession procedures while preserving open gaps. | Blocked on genuinely fresh-agent recovery; scripted reproduction passed |

Dependencies in `plan.json` are authoritative. H2 and H3 follow H1; H4 and H5 can then proceed independently. H7 can start after H1. H8 tests reconstruction once H1 and H7 are complete and must preserve the actual state of the other gates. H6 has separate RMR/TDEE and readiness tracks: only the applicable H4 or H5 track is a prerequisite. An unsupported readiness branch must not indefinitely block independent RMR work.

Gate progress is claim- and domain-specific. Any partial passage must name its exact scope, evidence and outstanding criteria; it does not close the whole gate. `complete` means all declared acceptance criteria for that gate are reviewed, with evidence. Negative results and explicit no-go decisions can satisfy an investigation; they cannot be relabeled as successful physiological validation. The audit command never promotes a gate automatically.

**Immediate next task:** execute the [H8 cold-start task](h8/COLD_START_TASK.md) in a genuinely new context. H6 needs real-user and longitudinal evidence; implementation or paperwork cannot substitute for it.

## A multidimensional applicability map

“Pathological spectrum” covers clinical conditions relevant to a claim, not a single healthy-to-sick scale. Keep disease, functional status, life stage, treatment, measurement conditions and model failure modes separate. Athletic muscularity, pregnancy, aging and disability must not be classified as diseases merely because they differ from a study population.

The working context inventory includes general adult and athletic populations; older/frail and unusual-body-composition contexts; energy restriction and low energy availability; reproductive and pediatric contexts; endocrine/metabolic, renal/fluid, cardiopulmonary, acute/critical and cancer/cachexia contexts; medication, pain/sleep and mobility contexts. These are **questions to review**, not established mechanisms, exhaustive disease coverage or new clinical eligibility claims. Preserve intersections and multimorbidity; do not infer a diagnosis from BMI, age, sex, activity or a wearable signal.

For each claim, record: definition and units; target and comparator; population and exclusions; disease/state severity, duration and treatment where relevant; measurement method and conditions; temporal horizon; evidence supporting and challenging it; implementation and decision links; known uncertainty; and the disposition `supported-within-scope`, `uncertain`, `contradicted`, `unreviewed` or `out-of-scope`. The finite H1 matrix is complete as an inventory; its clinical base cells remain unreviewed. Bounded H2 overlays preserve source-specific findings without promoting those cells.

WHO's [classification family](https://www.who.int/standards/classifications) and [ICF](https://www.who.int/classifications/international-classification-of-functioning-disability-and-health) distinguish disease classification from functioning and context. Use verified, versioned external identifiers when warranted; do not invent mappings or copy entire terminologies without reviewing terms. A mapping is semantic alignment, not evidence for a Metron prediction.

## Corpus and provenance contract

Stable IDs connect concepts, contexts, claims, sources and open weaknesses. Each relationship has a meaning: a source can support arithmetic, provide empirical evidence in a specified cohort, challenge generalization, or document a policy. A citation attached to one relationship must not silently support all of them. RMR is not TDEE; a readiness heuristic is not measured recovery; a cohort confidence interval is not an individual's prediction interval.

Retain source title, canonical locator, version/date, access level, inspected portions, rights, retrieval/search date and review date separately. For datasets and executable evidence, retain file identity, hashes, codebook, units, transformations, exclusions, frozen protocol and code pins. Preserve aggregate results and lawful reproduction instructions; never commit private participant rows or restricted full texts. If bytes cannot be retained, keep the restriction and retrieval instructions explicit. A source URL resolving is not evidence that its scientific interpretation is current.

These choices follow the machine reuse emphasis of [FAIR](https://doi.org/10.1038/sdata.2016.18) and the entity/activity/agent distinctions in [W3C PROV-O](https://www.w3.org/TR/prov-o/). The current JSON is a project-specific working vocabulary, not an OWL ontology or a claim of formal standards conformance. H1 adopted no external code mapping; [semantics.json](./semantics.json) records version/terms verification requirements for any future adoption.

## Freshness from the first gate

The policy is active immediately. It is an operational review policy, not a scientifically validated expiry rule:

| Evidence class | Maximum age before reuse review is due |
| --- | --- |
| Provider/API behavior and external data-access terms | 30 days, and before an integration or download |
| Clinical applicability and action-guiding guidance | 90 days, and before a consequential recommendation or release |
| Active model-comparison and measurement literature | 180 days, and before changing a default or fitting a model |
| Foundational definitions, provenance standards and historical equations | 365 days, plus correction/version checks before consequential reuse |

An unknown review date is `unreviewed`, never “fresh.” The seed's imported literature is not marked current merely because this inventory was written today. H2 records actual source inspection and search coverage. New evidence, retraction/correction, changed methods, changed API semantics or a failed replication triggers an earlier review. Historical arithmetic/results remain preserved; their applicability interpretation may become stale or superseded.

Search records must include queries, sources searched, date range, inclusion rules, unavailable material and disagreements. “Current” means current to a stated search cutoff and scope, not all information in existence. Recheck high-consequence claims before reuse even within a nominal interval. During inactive periods, freshness expires visibly; there is **no background monitor or scheduled refresh installed by this program**. A later scheduled job must have explicit scope and report actual coverage rather than refresh timestamps without inspection.

## Reconstruct without the conversation

A future agent starts at `AGENTS.md` → `docs/navigation.json` → this program → the relevant claim/source/decision. The existing implementation remains a reference; frozen research is reproducible independently of its UI.

H8's recorded exercise must recover: (1) current and superseded decisions; (2) claim provenance and limits; (3) source rights and deterministic reproduction instructions; (4) implemented versus proposed contracts; (5) one energy result and one readiness result with preserved caveats; (6) the next unblocked gate. Use a clean checkout and no private chat history. Distinguish reproducing existing code from rebuilding an equivalent implementation from the preserved specification. Record environment, commit, commands, reference outputs, deviations and reviewer. Do not claim independent agent reconstruction until it has actually occurred.

## Inspect program integrity

```bash
node research/robustness/audit.mjs --as-of 2026-11-07
npm run ci
npm run release:check
```

The offline audit checks references, gate dependencies, closure evidence and source review dates. It reports pending/stale source reviews and open weaknesses separately from structural errors. It does not fetch publications, assess medical correctness, establish exhaustive coverage or decide that the program is complete. Tests include broken references, false closure, dependency cycles and stale/future review dates.

**Change control:** retain immutable source/protocol/result pins and old ADRs. Update current entrypoints when priorities change; link replacements instead of rewriting historical conclusions. The current package changes interface/privacy boundaries while preserving numerical coefficients. Follow the checkpoint and ADR-0007 for current behavior.
