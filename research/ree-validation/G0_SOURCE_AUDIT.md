# G0 · Dataset admission audit

## At a glance

**Status: in progress.** We verified useful **record-level metadata** for the first three RMR candidates, but we have **not inspected participant data files or admitted a cohort for benchmarking**.

**Most promising lead:** The enable Zenodo record lists three potential energy-metabolism files and publishes their MD5 checksums; NLM lists the record as CC BY 4.0. Its primary paper describes **indirect calorimetry** using different apparatus/protocols in the enable and Kiel cohorts.

**Do not proceed to measuring prediction errors until field definitions, usage rights and cohort overlap have been checked and the G1 protocol is frozen.** [Track G0 on GitHub #10](https://github.com/andydrewie/metron/issues/10).

## Source evidence and honest gaps

| Candidate | Metadata verified | Missing before admission | Interim assessment |
| --- | --- | --- | --- |
| [enable / Zenodo](https://zenodo.org/records/17735477) | Version v1; record files and MD5 metadata; [NLM catalog CC BY 4.0](https://datasetcatalog.nlm.nih.gov/dataset?q=0002212869); [published calorimetry methods](https://doi.org/10.1152/ajpendo.00375.2025) | Need inspect workbook/TSV headers, actual measured outcome, participant identifiers, FFM method, any duplicated Kiel/enable rows, per-file rights | **Metadata-reviewed, not admitted** |
| [Navalta / Harvard Dataverse](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/MIOESN) | [NLM catalog CC0](https://datasetcatalog.nlm.nih.gov/dataset?q=0000108113); listed Excel fields: age, height, mass, waist/hip, heart rate, RMR kcal/day | Exact workbook layout, measurement method and **valid Mifflin equation-sex parameter** not shown in dataset catalog; therefore Mifflin eligibility unproven | **Metadata-reviewed, not admitted** |
| [University of Bath](https://researchportal.bath.ac.uk/en/datasets/dataset-for-are-there-sex-differences-in-the-variability-of-fasti/) | 208 reported participants from **seven crossover studies**; fasting metabolism and RMR recorded | Dataset access requires contacting researchers; age/height/equation parameter and repeat-measure identifiers not verified | **Request-path candidate, not admitted** |

### Confirmed Zenodo file manifest (not file contents)

| File | Listed size | Listed MD5 |
| --- | ---: | --- |
| `enable_data.tsv` | 179.8 kB | `99d1cfa3b6d1620e4da113f0cc93bf22` |
| `enable_Datensatz_RMR._Erwachsene 1.xlsx` | 237.3 kB | `63be73c1d11e38b563abbdc87dc152b4` |
| `KIEL_REE Datenbank TUM_Januar 2025tf QM.xlsx` | 93.3 kB | `5470fd1af5970bef9c74f6df620a45f4` |

These **MD5 strings are deposited file-manifest metadata**. We have **not downloaded files** or computed our own checksums; a published checksum is not an integrity verification performed by Metron. The source also lists microbiota files, which are irrelevant until the RMR-specific tables are mapped.

### Measurement methods worth preserving

The primary paper describes enable cohort RMR measurement after overnight fasting, using a **COSMED Quark RMR canopy hood** for roughly **30 minutes**, and a separate Kiel protocol with a **Vmax Spectra** system for at least **45 minutes**, discarding the first 10 minutes. Reported energy units vary between kJ/day and calculated kcal/24h in the methods. This is a warning to audit raw variables and units rather than treating all tables as one homogeneous measured RMR source.

References: [Brandl et al., methods and data availability](https://doi.org/10.1152/ajpendo.00375.2025) · [Zenodo record](https://zenodo.org/records/17735477) · [NLM catalog](https://datasetcatalog.nlm.nih.gov/dataset?q=0002212869).

## What G0 still needs

1. **Actual file inspection and rights:** obtain and inspect the released data tables only under allowed terms; map header names, file version, actual available rows, types, units and missing values. The current research environment couldn't retrieve participant-level file contents. That is an **execution-access limitation**, not proof the source is unusable to other researchers.
2. **Reference measurement legitimacy:** isolate indirect-calorimetry measurements from algorithmic predictions or derived surrogates. If each file contains multiple reference outcomes, document exactly which is used.
3. **Independence and duplication:** determine whether enable and Kiel records overlap; whether multiple measurements per person exist; whether different releases represent the same people. Never sum the 454+94+208 reported participant counts as if they were unique observations.
4. **Model-input eligibility:** Mifflin requires mass, height, age and a valid parameter matching the binary published equation—not an inference from self-described gender. Cunningham requires legitimate FFM; SMM by itself does not suffice.
5. **No outcome peeking:** decide eligibility based on measurement and metadata quality, not how well Metron predictions appear to fit. Freeze the protocol before calculating comparative errors.

## Gate decision

**G0 remains open / in progress.** We have enough metadata to prioritize inspecting enable files, but **not enough to admit any cohort**, compute a benchmark, or claim empirical model accuracy. The next contribution should attach a *field-only, no-row-level-PHI* audit and a source hash checked against downloaded bytes. If access remains unavailable, record the exact blocker and pursue the next candidate.

**No new ADR:** this is source auditing under our already accepted evidence and collaboration policies. No change to the scientific model or public UI.
