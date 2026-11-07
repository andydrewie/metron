# H2-A: readiness evidence and action boundaries

**This targeted review did not identify direct validation for Metron's exact readiness algorithm, sleep cutoffs, set ratios or step trigger.** Sleep and subjective recovery are relevant signals, but study outcomes, populations and measurement windows differ. Thirteen primary-study or original guidance records and 30 logged queries now support seven explicit claim dispositions. **H2-A is complete at this bounded scope; clinical applicability and the rest of H2 remain open.** The next research slice is H2-B. Proposed action-wording corrections are recorded for H5; they have not shipped.

---

## What was reviewed

The question was whether the existing implementation's specific inferences are justified, including their transfer across contexts. This is a **targeted rapid review**, not a registered systematic review, meta-analysis or independent clinical assessment. Initial orientation searches preceded the consolidated log. Search results informed subsequent queries and source selection. No participant-level data were collected, downloaded or reanalyzed.

The cutoff and inspection date are **7 November 2026**. [search-log.json](./search-log.json) preserves all 30 exact queries, recent-year filters, selection limits, unsuccessful access and excluded examples. [sources.json](./sources.json) records publication versions, study designs, inspected portions, limitations and observed reuse terms. Some records are abstract-only or indexed excerpts; they are not described as full-paper reviews. DOI/title update searches found no correction or retraction notice for the included sources in the inspected results, but this is **not a complete update-registry audit**. A linked Achilles-study commentary was located but its substantive text was not retrieved.

The issuing body's 2026 ACSM position stand is included as original authoritative guidance, distinguished from a primary experiment. Its underlying literature search ended in October 2024. A current publication date must not be mistaken for an equally current evidence cutoff. Secondary reviews served discovery only; duplicate preprints were not counted as independent studies. Source articles and figures remain subject to their own licenses; repository MIT does not relicense them.

## Findings that change interpretation

| Question | Finding and boundary |
| --- | --- |
| Do 5 and 7 hours define validated readiness states? | The [AASM consensus](https://doi.org/10.5664/jcsm.4758) addresses regular sleep and health. It does not establish a single-night lifting cutoff or prescribe a set reduction. |
| Does sleep loss have one predictable effect on training? | [Del Val-Manzano 2026](https://doi.org/10.3390/jfmk11010083) reports outcome-dependent acute effects. In the small [Knowles 2022 trial](https://doi.org/10.1249/MSS.0000000000003000), lifting velocity changed more than total volume-load. Neither supplies Metron's ratios. |
| Does contrary evidence mean short sleep is harmless? | No. [Borba 2024](https://doi.org/10.1055/s-0044-1787297) retained habitual sleep groups rather than randomizing sleep. [Edwards 2025](https://doi.org/10.1002/brb3.70741) had no normal-sleep control in its secondary analysis. Their selected findings cannot establish equivalence, universal tolerance or safe training. |
| Can weekly hypertrophy guidance determine today's sets? | [ACSM 2026](https://doi.org/10.1249/MSS.0000000000003897) and the [Schoenfeld volume trial](https://doi.org/10.1249/MSS.0000000000001764) concern chronic adaptations. Weekly sets, per-exercise sets, intensity and a fraction of usual per-muscle session sets are different quantities. |
| Do subjective recovery studies validate our three categories? | [Laurent](https://doi.org/10.1519/JSC.0b013e3181c69ec6) and [Sikorski](https://doi.org/10.1519/JSC.0b013e31827e8e78) examine different scales and endpoints. [Shattock and Tee](https://doi.org/10.1519/JSC.0000000000003530) compare intensity-regulation methods with volume matched. These do not validate Metron's combined classifier. |
| Does any pain mean a universal zero-set prescription? | The [Achilles rehabilitation trial](https://doi.org/10.1177/0363546506298279) is diagnosis- and protocol-specific. It neither clears acute or unexplained pain nor justifies treating all pain as the same condition. Metron cannot distinguish these contexts. |
| Does the cited wearable paper prove better lifting predictions? | [Rothschild 2024](https://doi.org/10.1007/s00421-024-05530-2) predicts perceived morning recovery and HRV change in endurance athletes, compared with an intercept-only model. It does not test next-session lifting, Metron B versus A, or the benefit of following advice. |

These are **transfer limits**, not a finding that sleep, subjective measures or autoregulation are useless. A relevant component can still fail to validate the full algorithm. Likewise, a nonsignificant result is not proof of no effect, and a predictive association is not evidence that acting on it improves outcomes.

## Exact software behavior makes the gap concrete

[rule-audit.json](./rule-audit.json) records synthetic outputs from the unchanged core at baseline `455534b573b5b025228cf42a95f6b8d729717669`. The following cases hold good subjective energy, a fresh week, no pain and a usual count of 14 sets constant:

| Supplied sleep | Current output |
| --- | --- |
| 4.99 hours | 0 sets, rest flag |
| 5.00 hours | 9–12 sets |
| 6.99 hours | 9–12 sets |
| 7.00 hours | 13–14 sets, full-session status |

These jumps are exact **software rules**, not demonstrated biological discontinuities. The current input does not preserve actual sleep versus time in bed, cumulative sleep loss, timing, method or clinical sleep disorders. The usual set count is user-supplied and is itself not validated as an appropriate baseline. At 1.5 times usual steps the core adds a leg-fatigue note, with no corresponding set or calorie deduction. The bounded search found no direct validation for that exact trigger.

## Claim dispositions and clinical scope

| Claim | Disposition |
| --- | --- |
| C08, combined readiness heuristic | No direct algorithm validation identified |
| C14, daily/weekly classification | Indirect component evidence; exact categories and cutoffs unvalidated |
| C15, set ratios, rest override and action wording | No direct validation identified; quantitative and wording limits remain |
| C16, 1.5-times step trigger | Project-chosen contextual trigger; no direct threshold validation identified |
| C31, wearable A/B/C proposal | Unrun hypothesis; cited recovery study has different outcomes and comparison |
| C34, adult educational scope | A documentation boundary, not clinical screening or validation |
| C35, endpoint and causal distinctions | Injury, hypertrophy and decision benefit are not established by the reviewed prediction designs |

[review.json](./review.json) ties every disposition to source IDs or explicit negative-search limits, named context slices, downstream gates and reversal criteria. The applicability matrix keeps its H1 base cells and adds **bounded review overlays**. Those overlays expose what was considered without marking a whole disease group as reviewed or safe. Severity, treatments, multimorbidity, life stages and the six named intersections remain unreviewed at full clinical scope. One diagnosis-specific pain trial does not change that.

The [REFORMS recommendations](https://doi.org/10.1126/sciadv.adk3452) support explicit claims, leakage checks and evaluation reporting. They are methodological guidance, not empirical support for Metron. The wearable protocol still needs prespecified lifting outcomes, past-only features, suitable human-context comparators, participant/time separation and separate evaluation of benefit from following advice.

## Concrete downstream work

H5 receives three proposed wording changes: replace “Ready for your full session / GREEN DAY” with “Review your training plan / SELF-CHECK”; identify the displayed number as an illustrative per-muscle, per-session range; and replace the generic rest-screen movement instruction with a statement that the tool cannot determine a safe session. These are **review candidates, not shipped copy or validated alternatives**. H5 must decide whether to retain, restrict or remove unsupported recommendations; H6 must assess comprehension and decision benefit. Current production wording therefore remains an open weakness, W03.

H2-B is the next executable research slice: resting-equation applicability and contradictions, preserving G0–G4. H3 measurement work is separately unblocked, including sleep input semantics, time windows, missingness and step provenance. No new athlete dataset is admitted by this review.

Review these readiness conclusions by **5 February 2027**, or earlier before consequential reuse, a relevant new study, changed guidance, correction/retraction or a new population/method. This is an operational review date, not an expiry of scientific truth or an installed monitor. The twelve-month reuse objective depends on this maintenance and explicit uncertainty.

## Verify and resume

```bash
node research/robustness/audit.mjs --as-of 2026-11-07
node research/robustness/inspect.mjs --claim C15 --context general-adult
npm run ci
npm run release:check
```

Use the actual current date when auditing later. Structural checks validate references, coverage, dates and preservation of uncertainty; they do not establish physiological accuracy. [CONTINUE.md](../../../docs/CONTINUE.md) and [the plan](../plan.json) own the recovery route and current execution state. H2-A closure does not close H2, H5 or clinical applicability.
