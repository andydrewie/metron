# H2-B: resting equations and population transfer

**H2-B is complete for its nine claim families as of 9 November 2026.** The review preserves meaningful evidence both for and against Cunningham, identifies equation-label and sample-count discrepancies, and retains Mifflin as the provisional default under ADR-0005. It does not establish a universal winner or clinical suitability. G0–G4 and production behavior are unchanged. Whole H2 remains open; **H2-C measurement and source semantics is next**.

---

## What changed our understanding

A paper's equation name is insufficient to identify its implementation. The [equation crosswalk](./equation-crosswalk.json) records inspected coefficients, unknown variants and unresolved source discrepancies. The [claim review](./review.json) connects those findings to C01/C02/C18/C19/C20/C24/C25/C26/C27, bounded context overlays and reversal triggers. These records strengthen reuse without rewriting the completed study.

| Source or implementation | Inspected formula, kcal/day | Consequence for reuse |
| --- | --- | --- |
| Metron / Mifflin simplified | `10W + 6.25H − 5A + sex constant` | Published simplified form; W kg, H cm, A years; constants +5/−161 |
| Mifflin original; ten Haaf comparison | `9.99W + 6.25H − 4.92A + sex constant` | Different coefficients; ten Haaf did not directly test Metron's rounded implementation |
| Cunningham 1980 | `500 + 22 × LBM` | Historical estimated lean body mass and BMR; Metron uses FFM and compares with RMR |
| Cunningham 1991 | `370 + 21.6 × FFM` | A different formula with the same author name |
| Sordi 2024, labelled 1991 | `500 + 22 × FFM` | Arithmetic matches Metron, despite the year label |
| Cai 2026, labelled 1980 | `501.6 + 21.6 × FFM` | Its reported Cunningham performance cannot be assigned to Metron's formula |
| Kfir 2023 | Coefficients unresolved | Citation and aggregate arithmetic do not reconcile; quarantine exact-formula attribution |
| Tinsley, Dong, Del Biondo | Coefficients not directly inspected | Keep abstract-level findings qualified |
| Xu 2026 | `500 + 22 × FFM`; rounded Mifflin | Matching arithmetic still requires population and method qualification |

The lineage comes from [Mifflin 1990](https://doi.org/10.1093/ajcn/51.2.241), [Cunningham 1980](https://doi.org/10.1093/ajcn/33.11.2372) and [Cunningham 1991](https://doi.org/10.1093/ajcn/54.6.963). An equation fingerprint is necessary for transfer, but it cannot resolve differences in population, body composition, preparation or reference calorimetry by itself.

**A second source issue remains unresolved:** [Weijs 2008](https://pubmed.ncbi.nlm.nih.gov/18842782/) reports 338 US participants in its abstract but 239 in indexed publisher results and tables. The Dutch count is consistently 208. G4's dated abstract-level account is preserved. Future quantitative reuse must carry both US counts and cannot choose a denominator for pooling or sample weighting until the discrepancy is resolved. No correction notice was identified in the targeted results; that does not prove none exists.

## Evidence across populations

These are source-specific observations, not a pooled ranking. Full methods, exclusions, inspected portions, rights and access limits are in the [source registry](./sources.json).

| Evidence | Observation | Transfer limit |
| --- | --- | --- |
| [ten Haaf 2014](https://doi.org/10.1371/journal.pone.0108460), 90 recreational athletes | Cunningham within ±10% for 84.9% of men and 78.4% of women; original Mifflin below 50% | Vmax hood calorimetry, Bod Pod, selected ages 18–35; new equations fitted in the same sample |
| [Tinsley 2019](https://doi.org/10.1139/apnm-2018-0412), 27 physique athletes | Abstract supports possible use of named Cunningham 1980 | TrueOne reference and DXA; small sample; equation table not inspected; leave-one-out validation is internal |
| [Sordi 2024](https://doi.org/10.3390/ijerph21070891), 65 cross-training participants | Counterevidence to universal Cunningham superiority | FitMate fixed RQ 0.85 and BIA composition; Mifflin was not compared |
| [Kfir 2023](https://doi.org/10.3390/nu15040805), 3,001 clinic patients | Authors report equation underprediction | DXA/Quark; random split within one source; unresolved Cunningham identity and thyroid/bariatric count discrepancies |
| [Cai 2026](https://doi.org/10.3390/nu18020344), healthy older adults | Mifflin 49.1% within ±10% in 57-person internal validation split | Excludes several diseases and RMR-altering exposures; Cunningham variant differs; new model is not externally replicated |
| [Dong 2026](https://pubmed.ncbi.nlm.nih.gov/42095278/), 43 adults with sarcopenia | Every tested equation has reported accuracy below 40%, even though Mifflin_W performs best relatively | Abstract-only accuracy definition, coefficients and instrument details remain unverified |
| [Del Biondo 2026](https://pubmed.ncbi.nlm.nih.gov/42012364/), 45 perimenopausal women | Abstract mean differences favor Mifflin over named Cunningham | Mean agreement is not individual accuracy; DXA lean soft tissue is not automatically FFM; variant unresolved |
| [Xu 2026](https://doi.org/10.3389/fnut.2026.1860294), 156 selected nursing-home residents | Cunningham 45.5%, Mifflin 17.3% within ±10% | Single facility and important exclusions; Cunningham individual limits of agreement span −419.7 to 473.9 kcal/day, measured minus predicted |

Selected healthy older adults, adults with sarcopenia and institutional residents are different populations. Frailty and sarcopenia are not synonyms. Perimenopause is recorded as a source-specific life-stage qualifier, not silently treated as pregnancy or lactation. Disease severity, treatment exposure and coexisting conditions cannot be assumed absent when the inspected portion does not report them. **All broad clinical cells remain unreviewed**, including the pathological intersections in H1.

Body-composition provenance remains a dependency. [Siedler 2023](https://doi.org/10.1017/S0007114522003749) distinguishes repeatability from agreement across 15 BIA devices. It does not validate G3's SECA 515 or supply a universal personal body-fat error distribution. FFM, skeletal muscle, historical LBM and DXA lean soft tissue must retain separate meanings until a justified mapping is available.

## What the completed study still establishes

[G3](../../ree-validation/G3_RESULTS.md) remains one fixed-equation comparison: 459 raw rows, 454 eligible paired participants, 351 Freising and 103 Nuremberg. Mifflin MAE was 165.7 kcal/day versus Cunningham 129.5; paired Cunningham-minus-Mifflin MAE difference was −36.2, bootstrap 95% CI −49.5 to −22.6. Bias used prediction minus calorimetry. Within ±10% agreement was 54.8% and 65.9%, respectively.

The subgroup table describes **Mifflin only**. It cannot rank both equations within each subgroup. The prespecified age 19–78 sensitivity included 390 people, with Mifflin MAE 159.2 and 57.4% within ±10%; it does not replace the primary sample.

[Brandl 2026](https://doi.org/10.1152/ajpendo.00375.2025) supplies publication provenance for the same enable cohort, not another independent Metron replication. Its machine-learning development and authors' external evaluation answer different questions. This review neither admits Kiel data nor reopens participant-level enable records. The crosswalk retains SHA-256 checks for every tracked file in the frozen study directory.

## Decision and remaining work

[ADR-0005](../../../docs/adr/0005-retain-resting-default-pending-replication.md) remains a provisional deployment decision. Cunningham is a credible alternative with advantages in several inspected samples, including G3. Current evidence does not establish a universal replacement, a demographic switching algorithm, or an individually calibrated error interval. Neither resting equation validates TDEE or an intake prescription. No coefficients, thresholds, UI, schemas or production behavior changed.

**H2-C is the next executable slice:** measurement and source semantics for C04/C05/C06/C07/C11/C12/C13/C17/C23/C28/C29/C30. H3 must operationalize measurement provenance. H4 remains a separate source-admission and independent-replication task with its own frozen protocol, exact formula variants, paired error measures and prespecified subgroup harm criteria. The ten Haaf dataset remains only a candidate, with published findings already known. No new dataset was downloaded.

## How to audit and refresh this review

The [search log](./search-log.json) contains 32 exact queries and 14 included source records, with publication cutoff **9 November 2026**. This is a single-reviewer targeted rapid review, not a systematic or exhaustive search. Some full texts were inaccessible; indexed primary abstracts and publisher portions are labelled explicitly. Correction queries returned unrelated notices and cannot certify clean correction histories. Source article dates, online dates and dataset observation dates are kept distinct.

Recheck by **7 February 2027**, or sooner before consequential reuse, a source correction, new contradictory evidence, a resolved discrepancy or any model/scope change. The twelve-month research-reuse objective depends on those reviews; it is not a promise that today's conclusions remain current.

```bash
node research/robustness/inspect.mjs --claim C02 --context older-frailty
node research/robustness/audit.mjs --as-of 2026-11-09
npm run ci && npm run release:check
```

Use the actual current date for operational audits. Software checks validate record integrity and preserved artifacts, not scientific completeness or clinical accuracy. [CONTINUE.md](../../../docs/CONTINUE.md) is the stable recovery route for a new chat.
