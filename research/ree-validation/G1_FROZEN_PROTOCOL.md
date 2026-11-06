# G1 · Frozen resting-energy validation protocol

## In 20 seconds

**G1 freezes the rules before calculating any model errors.** We will compare Metron's published resting-energy equations with enable cohort indirect-calorimetry measurements, using prespecified participant eligibility, units, MAE, statistical intervals and subgroup definitions. No model has been refitted, no prediction-versus-measurement error has been calculated, and the live Metron calculator remains unchanged.

**This is a prospectively frozen reanalysis within Metron**, not a clinical trial registration or a claim the original study did not analyze these formulas.

**Go next:** [Machine-readable locked v1 protocol](./protocol.v1.json) · [G0 source evidence](./G0_FILE_VERIFICATION.json) · [G1 Issue #11](https://github.com/andydrewie/metron/issues/11) · [Program Dashboard](https://github.com/andydrewie/metron/issues/9).

## 1. One reference cohort, one population

**Source:** [enable_data.tsv](https://zenodo.org/records/17735477), **comma-delimited despite its extension**, Zenodo 17735477 v1, license CC BY 4.0 at record level. Pin source SHA-256 `d91d7c609de5b90b7282afc36071c67cdbf8f7362f8d6fae82126f93c8d8ba61`. Never merge with the enable workbook or Kiel workbook: independence across files is not established.

**G0 facts:** 459 raw rows, 459 distinct pseudonymous participant codes, 454 positive-numeric measured RMR and jointly present core inputs. These do **not** force the final N; G1 filtering could exclude more.

**RMR reference:** `RMR.KJ` from published fasting indirect calorimetry, converted by **kJ/day ÷ 4.184 = kcal/day**. Do not compare to a model-derived basal rate or doubly labeled water total expenditure.

**Primary inclusion:** finite positive measured RMR, recorded equation-sex field `SEX` with exact code `männlich` or `weiblich`, finite age **18–105 years**, height **100–250 cm**, mass **25–350 kg**, and nonmissing unique `Probanden-ID`. These align with the Metron engine's supported input domain; they are not clinical normality cutoffs. Code mapping is **only for the historical binary equation parameter**, not a statement about gender identity.

**Fail closed:** wrong dataset hash, ambiguous headers, malformed rows or duplicate participant IDs abort the run. Missing/invalid fields are counted and excluded from primary eligibility. No value is imputed, clipped, winsorized, or excluded because it makes an equation appear inaccurate. Report every reason, with one first-failed reason for a reconciling flow diagram.

## 2. Comparators

| Question | Precommitted comparison |
| --- | --- |
| How accurate is Metron's default? | Mifflin–St Jeor on all primary-eligible records, using unchanged `mifflinStJeor()` from `core/model.js` |
| Does a lean-mass equation do better on identical people? | Conditional Cunningham with `cunninghamRmr()`, paired to Mifflin on *exactly the same FFM-eligible participants* |
| What qualifies the FFM comparison? | Finite `FFM_SECA,kg` between **5 and 150 kg** and no greater than body mass, on primary-eligible participants; this is **SECA 515 bioimpedance-estimated FFM**, not directly measured reference FFM |

Cunningham's historical basal-metabolism equation and BIA-based fat-free mass are methodologically different from indirect-calorimetry RMR. We will explain that rather than crown a universal winning formula.

## 3. Error metrics · fixed now

| Metric | Meaning |
| --- | --- |
| **MAE, primary** | Mean absolute error in kcal/day |
| **Mean signed bias** | Predicted − observed; positive means overprediction |
| **RMSE** | Root-mean-square error; larger misses matter more |
| **Median absolute error** | Median size of absolute error |
| **Within ±10%** | Share whose absolute error is ≤10% of measured RMR (descriptive, not pass threshold) |
| **Paired delta** | Cunningham MAE − Mifflin MAE on identical people; positive means smaller Mifflin MAE |

**Uncertainty:** 5,000 nonparametric participant bootstrap replicates with seed **20261106**, resampling within the **two recorded sites** to preserve the observed site mix. For paired comparisons, resample the *same participants* for both models. The 95% interval uses percentile endpoints with deterministic linear interpolation. These are **cohort-level sampling intervals**, not individualized prediction intervals or proof of transportability to new labs.

## 4. Subgroups and limits · fixed now

Report exploration by recorded **site**, **equation-sex code**, **age 18–39 / 40–59 / 60–105**, and **BMI <25 / 25–<30 / ≥30**. For a subgroup with fewer than **30** eligible participants, report N and suppress numeric accuracy claims. Age **19–78** can be reported as a *secondary sensitivity analysis* because it matches the original Mifflin publication's age range, but it must not replace the main result.

No tuned coefficients, optimistic threshold, undisclosed hypothesis switch, post-hoc merged subgroups, or automatic change to the public product. A negative/inconclusive comparison must be published as such.

## 5. Reproducibility and change control

This protocol is frozen **relative to Metron's future analysis**, not registered in an external study registry. [Issue #11](https://github.com/andydrewie/metron/issues/11) will record the immutable *merged commit* containing v1; G2 must use that pinned commit and source hash. Any later change needs a separate version and a public explanation, especially if outcome errors have already been inspected.

The benchmark (G2) will not publish participant rows or per-person errors. It will report source provenance, actual eligibility counts and missingness, aggregate error measures/intervals, caveats and negative results. Successful software tests alone cannot demonstrate scientific validity.

**Key references:** [Mifflin et al. 1990](https://doi.org/10.1093/ajcn/51.2.241) · [Cunningham 1980](https://doi.org/10.1093/ajcn/33.11.2372) · [enable source and methods](https://doi.org/10.1152/ajpendo.00375.2025) · [STROBE reporting checklist](https://www.strobe-statement.org/fileadmin/Strobe/uploads/checklists/STROBE_checklist_v4_combined.pdf).
