# H2-C: measurement and source semantics

**H2-C is complete for its 12 assigned claim families.** Seventeen source records and 40 logged queries clarify what the inputs and provider fields mean, where they differ, and which metadata remain missing. The current baseline, walking and workout assumptions are not directly validated as a combined estimator. The result is a concrete measurement handoff for H3. Production behavior and frozen G0–G4 remain unchanged; H2-D is next.

---

**Reviewed:** 9 November 2026, Asia/Taipei. **Baseline:** `420614e9fbdb0ceaeed5b0f4c3be01a99ce43bc2`. This is a targeted, single-reviewer evidence assessment, not an exhaustive systematic review or independent clinical adjudication.

## Findings that affect interpretation

| Claims | Finding | Consequence for H3 |
| --- | --- | --- |
| C04 | Metron's baseline is `1.2 × predicted RMR`, with 2,000 steps already allocated. [FAO PAL](https://www.fao.org/4/y5686e/y5686e07.htm) instead compares whole-day expenditure with BMR. | Preserve both numerator and denominator. The published PAL category does not justify replacing the app's factor. |
| C05 | `strideMeters` is operationally **distance per step**. Height and a fixed net coefficient produce a proxy chain. | Retain gait, pace, terrain and step provenance; review terminology without silently breaking the API. |
| C06 | [Compendium](https://pacompendium.com/conditioning-exercise/) task values do not establish the exact whole-session presets. [Byrne](https://doi.org/10.1152/japplphysiol.00023.2004) shows why standard MET and personal rest differ. | Name the gross estimate, elapsed duration and subtracted baseline separately. |
| C11/C13/C28 | Matching kilograms do not establish matching body compartments. Method and device identity affect interpretation. | Preserve FFM/SMM distinctions, unknown muscle mass and the chart's arithmetic residual. |
| C12 | SDNN and RMSSD remain different metrics. [2026 HRV guidance](https://doi.org/10.1152/ajpheart.00041.2026) also requires recording and processing context. | Carry metric, signal, epoch, processing and behavioral state rather than a generic HRV number. |
| C17/C23 | Defaults are not observations; a fixed-input perturbation is not an error distribution. | Preserve input origin and distinguish sensitivity from individual uncertainty. |
| C07/C29/C30 | Overlap, workout association and raw UUID identity do not establish contribution to a merged aggregate. | Keep membership unknown until contribution evidence exists. |

The baseline floor does not decrease expenditure below 2,000 supplied steps. Workout energy subtracts `1.2 × RMR / 24` over the session, then floors the increment at zero. This is neither subtraction of bare RMR nor subtraction of a conventional one-MET rate. The walking term uses another net-cost assumption. Their reference meanings must be reconciled before interpreting the total as measured expenditure.

The walking search found **related supporting evidence**, not just an absence. [Scherrenberg et al.](https://doi.org/10.3390/s22114277) evaluated sex-specific, rounded height formulas in cardiac rehabilitation. That does not establish Metron's universal unrounded coefficient or its energy conversion. [Han's 2026 model](https://doi.org/10.1080/1091367X.2026.2634091) adds pace and other predictors but has internal validation only. [Ludlow and Weyand](https://doi.org/10.1152/japplphysiol.00864.2015) analyze published aggregate walking data; those values are not a new participant cohort. No replacement formula is selected here.

[Wang's framework](https://doi.org/10.1093/ajcn/56.1.19) separates body-composition levels. [Kyle's historical guidance](https://doi.org/10.1016/j.clnu.2004.09.012) identifies hydration and equation-transfer constraints. [Siedler's device study](https://doi.org/10.1017/S0007114522003749) distinguishes repeatability from cross-sectional and longitudinal validity. None supplies a universal personal BIA error budget. The chart's `FFM − SMM` residual is not an independent anatomical measurement. Null SMM remains unknown even when rendering uses zero width.

## Provider and pilot findings

The [measurement crosswalk](./measurement-crosswalk.json) is the canonical H3 handoff. It specifies required metadata and a next test for each mapping. It is a research contract, not a shipped adapter.

| Surface | Established in inspected documentation | Still unknown |
| --- | --- | --- |
| [WHOOP cycle/workout](https://developer.whoop.com/docs/developing/user-data/cycle/) | V2 cycle steps appear in the September 2026 changelog; cycle and workout are distinct resources. | Workout contribution to a cycle total; gross/net meaning of scored energy. |
| [WHOOP recovery](https://developer.whoop.com/docs/developing/user-data/recovery/) | Named RMSSD field and separate vendor score/scoring state. | Equivalence to another provider's epoch or Metron readiness. |
| [Garmin](https://developer.garmin.com/gc-developer-program/enterprise/health-api/) | Separate Health, Activity and Personal surfaces. | Field-level membership; public Swagger retrieval exposed only navigation. |
| [Apple HRV](https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifier/heartratevariabilityrmssd) | Official pages now expose separate SDNN and RMSSD identifiers. | RMSSD OS availability and automatic device generation were not verified. |
| [Apple queries](https://developer.apple.com/documentation/healthkit/hkstatistics) | Raw selection, association and statistics are different operations. | Sample-level contribution to a particular merged total. |

The existing pilot's raw day query uses **strictStartDate**, anchored to the workout's start day in `Calendar.current`. Its statistical predicate uses options `[]`, with cumulative sum and source separation. These selections can differ at boundaries. A capped query, overnight workout or changed timezone can also limit interpretation. No real-device run took place in H2-C.

[Authorization documentation](https://developer.apple.com/documentation/healthkit/authorizing-access-to-health-data) adds history-access constraints; an empty result is not proof of no data or read authorization. [Condensed workout documentation](https://developer.apple.com/documentation/healthkit/accessing-condensed-workout-samples) explains why raw object granularity can change. Its examples do not prove that the pilot's stepCount records were condensed. Those limits are retained without inferring device behavior from a symbol or example.

## Reproduce and continue

```bash
node research/robustness/audit.mjs --as-of 2026-11-09
node research/robustness/inspect.mjs --claim C05 --context cardiopulmonary
node --test tests/h2c-review.test.js
npm run ci
npm run release:check
```

The tests exercise record integrity and synthetic counterexamples, including equal SDNN with unequal RMSSD and fixed-mass versus joint-input sensitivity. They do not establish physiological accuracy. Sixteen bounded overlays leave the **805 H1 base cells unchanged**. Clinical severity, treatments and intersections remain unreviewed. No participant data or authenticated wearable records were acquired.

Read [review.json](./review.json) for each disposition, [sources.json](./sources.json) for inspected portions and rights, and [search-log.json](./search-log.json) for exact queries and access limits. Q29–Q32 checked update notices for four DOIs; the other sources have narrower metadata/version checks. Missing full text and the incomplete correction-registry audit are explicit. Retained source-inspection history lets a later review advance without rewriting or refreshing the dated H2-A/B/C evidence.

**Next is H2-D: combined energy and uncertainty.** H3 can separately execute the crosswalk's measurement tasks. Provider definitions are due for review **9 December 2026**, or earlier before integration; the remaining H2-C claim reviews are due 7 February 2027. These dates are operational review limits, not a promise of scientific currency. No background monitor is installed.
