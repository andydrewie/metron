# G0 · Source admission evidence

## In 20 seconds

**G0 passed for one source:** the public [enable Zenodo dataset](https://zenodo.org/records/17735477), specifically `enable_data.tsv`. We downloaded the actual release through an ephemeral GitHub Actions runner, verified its CC BY 4.0 **record-level license**, checked file hashes, and inspected structure and missingness without publishing participant records.

**Key discovery:** although named `.tsv`, `enable_data.tsv` is **comma-delimited**. It has **459 data rows**, of which **454** have positive numeric calorimetry RMR and the basic fields needed for both published resting-energy equations. This exactly matches the paper's reported 454, but **is not yet the final analysis population**.

**Next:** freeze G1 inclusion and statistics protocol **before comparing predictions against measurements**. No accuracy results or model changes have been produced.

[Machine-readable evidence](./G0_FILE_VERIFICATION.json) · [Reproducible inspection code](./tools/probe_zenodo.py) · [Verified CI run](https://github.com/andydrewie/metron/actions/runs/42161770901) · [G0 issue #10](https://github.com/andydrewie/metron/issues/10) · [Research dashboard #9](https://github.com/andydrewie/metron/issues/9)

## What we actually verified

| Check | Result |
| --- | --- |
| Source | Brandl et al., enable research dataset; Zenodo v1, DOI [10.5281/zenodo.17735477](https://doi.org/10.5281/zenodo.17735477) |
| Reuse | Zenodo API explicitly returns `cc-by-4.0` at record level; attribution required. Separate per-file licenses were not reported by the endpoint; preserve this limitation |
| Files | **Four actual files retrieved**, exact bytes verified against deposited MD5; additionally recorded SHA-256 for each |
| Main source | `enable_data.tsv` — **comma-delimited**, 52 named fields, 459 nonblank participant rows |
| Measured outcome | `RMR.KJ` — 454 positive numeric entries, five missing; study reports indirect-calorimetry RMR |
| Mifflin inputs | `SEX`, `Alter, Jahre`, `GROESSE, cm`, `GEWICHt_SECA, kg` — compatible input fields recorded, 454 joint complete positive-numeric RMR/input rows |
| Cunningham inputs | `FFM_SECA,kg` available on all 454 candidate complete cases, **SECA bioimpedance-estimated FFM**, not direct reference FFM |
| Record grain | 459 distinct `Probanden-ID` codes among 459 raw rows, including two site codes: `freising`, `nuernber` |
| Coded sex field | `männlich`, `weiblich` present; the intended equation-parameter mapping must be specified and reviewed at G1 |
| Data protection | No participant record, identifier value, or individual RMR was uploaded to the repo or printed in public CI logs |
| Accuracy | **Not evaluated**. Zero model-prediction or prediction-error calculations run |

### Why the mismatch in counts matters

There are 459 rows in the released table, not 454. Five lack a usable numeric `RMR.KJ` observation. **Exactly 454** have an available positive RMR and all basic equation inputs. This is a *structural consistency finding*, not permission to tune inclusion criteria after seeing model errors.

G1 must freeze all remaining decisions—age/size validity, completeness, measurement units, whether to exclude implausible records, handling of apparently duplicated people, and subgroup definitions—**before any error metric is computed**.

### Evidence for reference quality

The [research article](https://doi.org/10.1152/ajpendo.00375.2025) describes measured RMR through indirect calorimetry after fasting. The enable cohort was assessed with a **COSMED Quark RMR canopy** and weight/body composition using a **seca medical Body Composition Analyzer 515**. `RMR.KJ` is interpreted as RMR in kJ/day, requiring **÷ 4.184** to express kcal/day; conversion and field provenance must be frozen before running the benchmark. *This interpretation follows published methods and recorded field labels, not independent recalibration of each measurement.*

The separate Kiel workbook includes `Geschlecht`, `Alter`, `Größe (m)`, `Gewicht (kg)` and `REE (kcal)` fields; its methods describe **Vmax Spectra** indirect calorimetry and **air-displacement plethysmography** for fat mass/FFM. This is a *different measurement protocol*, and the workbook has not been admitted or combined with enable data. Published IDs or rows may overlap other exports; avoid counting different files as independent studies.

### Reproduce without revealing participants

```bash
python3 -m unittest discover -s research/ree-validation/tools -p 'test_*.py' -v
python3 research/ree-validation/tools/probe_zenodo.py
```

The probe fetches Zenodo's public record, checks license **before downloading**, limits individual file size, verifies MD5, computes SHA-256 and prints **only schema/row-count and categorical-code summaries**. Participant observations are processed in the temporary runner memory and discarded; no raw dataset is checked into Git.

**G0 admission judgment:** `enable_data.tsv` is suitable **to plan** an external Mifflin benchmark and a *conditional* Cunningham benchmark that acknowledges FFM measurement limitations. This is **not** an accuracy claim. Other public candidates are still unadmitted.

## G1 handoff

- Freeze dataset DOI/version/hash, primary source file, field/sex coding, units, outcome definition and eligibility checks.
- Prespecify MAE, signed bias, RMSE, percentage within ±10%, and confidence intervals **before examining prediction errors**.
- Compare equations on *the same* participant rows; correctly distinguish bioimpedance-derived FFM from measured resting energy.
- Keep G0 artifacts accessible for humans and future agents; do not make analysts read the full CI log to recover provenance.
- If an assumption changes after first outcome inspection, label it exploratory and preserve the original plan.

**Provenance:** Brandl et al., *American Journal of Physiology-Endocrinology and Metabolism*, 2026, DOI [10.1152/ajpendo.00375.2025](https://doi.org/10.1152/ajpendo.00375.2025). Data: Zenodo DOI [10.5281/zenodo.17735477](https://doi.org/10.5281/zenodo.17735477), CC BY 4.0.
