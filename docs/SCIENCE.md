# Science, provenance & limitations

> **Status: exploratory whole-product modeling; limited external RMR evidence is published.** [G3](../research/ree-validation/G3_RESULTS.md) evaluated two fixed resting equations in one 454-person cohort. The combined daily-energy estimator and training-readiness heuristic remain unvalidated. Neither that cohort result nor software tests establish individual accuracy.

**Coverage and currency:** the [claim/context corpus](../research/robustness/corpus.json) and [robustness program](../research/robustness/README.md) make unreviewed clinical contexts and evidence-refresh obligations explicit. [H1](../research/robustness/H1_INVENTORY.md) reconciles the finite repository inventory; clinical evidence is still unreviewed and intended use is unchanged.

## 1. Resting energy (RMR / REE)

**Mifflin–St Jeor (default)**, simplified published form (kcal/day):

- Male equation parameter: `10 × weightKg + 6.25 × heightCm − 5 × ageYears + 5`
- Female equation parameter: `10 × weightKg + 6.25 × heightCm − 5 × ageYears − 161`

Originally derived from indirect calorimetry data (n=498, ages 19–78); a population estimate with notable unexplained variation, not a measurement of the user's metabolism. Paper: Mifflin et al., *American Journal of Clinical Nutrition* (1990). DOI: [10.1093/ajcn/51.2.241](https://doi.org/10.1093/ajcn/51.2.241).

**Cunningham (optional, requires body fat percentage):** `RMR = 500 + 22 × FFMkg`, with `FFMkg = weightKg × (1−bodyFatPercent/100)`. Original Cunningham equation: *AJCN* (1980), DOI: [10.1093/ajcn/33.11.2372](https://doi.org/10.1093/ajcn/33.11.2372). Body composition readings introduce their own measurement error. The app permits an explicit model choice instead of silently treating one as an accurate correction to the other.

**H2-B evidence review (9 November 2026):** the [targeted equation review](../research/robustness/h2b/README.md) records original versus rounded Mifflin, different Cunningham coefficient sets, and the difference between historical estimated LBM/BMR and modern FFM/RMR. A publication's equation label does not establish the exact formula. Newer population comparisons support neither a universal winner nor automatic individual selection. Weijs's US denominator and Kfir's formula identity remain unresolved; source-specific restrictions are recorded before quantitative reuse. The frozen G0–G4 study is unchanged, and Brandl 2026 is provenance for the same enable cohort, not independent replication.

**H2-C measurement review (9 November 2026):** the [bounded source review](../research/robustness/h2c/README.md) and [measurement crosswalk](../research/robustness/h2c/measurement-crosswalk.json) distinguish the app baseline from PAL, distance per step from the legacy stride name, standard MET from the subtracted baseline, and source-defined body composition/HRV metrics. Defaults and fixed-mass sensitivity are not measurements or prediction intervals. Provider association and raw sample identity do not establish merged contribution. These are H3 constraints; production equations remain unchanged.

### G4 decision and choosing a resting equation

**Keep Mifflin as the default and Cunningham as an explicit option.** [G4](../research/ree-validation/G4_DECISION.md) and [ADR-0005](./adr/0005-retain-resting-default-pending-replication.md) explain why Cunningham's better G3 result does not establish a universal replacement. Independent studies differ by population and measurement method. Retaining Mifflin is a provisional deployment decision, not evidence that it is always more accurate.

Cunningham depends on the quality of the body-fat estimate used to calculate FFM. The software checks numeric bounds, not device accuracy or measurement conditions. At fixed weight, each percentage-point change in body fat shifts Cunningham by `0.22 × weightKg` kcal/day in the opposite direction. This is arithmetic sensitivity, not an error interval. Unknown or poorly characterized body composition is a practical reason to use the default; a documented measurement can support explicitly comparing Cunningham, without promising individual accuracy.

The overall cohort result does not identify a winner for every age, body size, athletic background or equation-sex group. Do not convert it into a personalized calorie target or silently add the cohort bias to predictions.

**SMM is not FFM.** Skeletal muscle mass is a subset of fat-free mass; FFM also includes organs, bone, fluids, and other nonfat tissues. Thus SMM by itself cannot determine body-fat percentage. We never add SMM as a caloric multiplier.

## 2. Incremental movement and TDEE

`TDEE_est = (1.2 × RMR) + walkingKcal + workoutKcal`

The `1.2` sedentary factor is a **pragmatic convention**, not universally accurate, and includes approximate routine daily expenditure including digestion. The app counts only steps above an assumed `2,000` baseline. For these extra steps:

`estimatedDistanceKm = max(steps−2000,0) × (0.415 × heightMeters) / 1000`

`walkingKcal = 0.5 × weightKg × estimatedDistanceKm`

The `0.5 kcal/kg/km` coefficient approximates the **net energy cost** of level walking. Actual costs vary with speed, incline, biomechanics, terrain, fitness, and weight. Height-based stride length is a *rough proxy*; this is not a measurement of distance. **The baseline does not decrement below 2,000 steps**, so very low-step days can be overestimated.

## 3. Workout estimates

`gymGrossKcal = wholeSessionMET × weightKg × workoutHours`

`workoutKcal = max(0, gymGrossKcal − (baselineKcal / 24) × workoutHours)`

Default illustrative whole-session intensity presets: Light = 2.5 MET; Typical = 3.5 MET; Hard = 5 MET. They cover both work and rest intervals, not peak effort; they are **not** claims that every lifter performing a "hard" session expends 5 MET across the whole workout. The model treats 1 MET ≈ 1 kcal/kg/hour, which is itself approximate. Reference for activity classifications: [2024 Adult Compendium of Physical Activities](https://pacompendium.com/).

**Avoid double counting** when treadmill or walking steps are also included in a workout's duration. The formula does not automatically separate cardio steps from gym steps. Nor does it model post-exercise oxygen consumption, thermogenic adaptation, growth/reproductive status, environmental temperature, or disease.

**Sets count is a training-load variable, not a calorie-burning unit.** We intentionally use whole-session duration and intensity for the activity estimate instead of assigning fixed calories to 20/30/40 sets.

### Research-only sensitivity check: overlapping walking and workout steps

[Issue #1 experiment](../research/energy-accounting/README.md) reproduces the ambiguity with synthetic inputs. A known-workout-step assignment of 6,000 incremental steps changes a synthetic model calculation from 2,523.46 to 2,349.16 kcal/day **under explicitly chosen conditions**. The 174.30 kcal difference is an *arithmetic sensitivity*, not an empirically measured error or validated new TDEE.

Without interval-level activity provenance, the existing daily step and workout totals are insufficient to infer which activity calories overlap. Bounded hypothetical endpoints are **not calibrated prediction intervals**; the default public model remains untouched. Even with explicit intervals, uncertainty in baseline allocation, strides, gross-versus-net activity intensity and estimated MET can remain.

**Follow-up provenance research:** [Activity-event evidence contract](../research/activity-events/README.md) demonstrates that coincident time windows do not prove step-summary membership. The experimental parser preserves reporting periods (including physiological cycles), sources and explicit evidence for inclusion. No physiological accuracy has been validated, and the public calculator is unchanged.

**Local sample-identity experiment:** An optional [Apple HealthKit read-only pilot](../research/apple-healthkit-pilot/README.md) can compare UUIDs returned by workout-associated and calendar-day step-sample queries, once an individual grants permission on their device. Identical UUIDs do **not** establish contributions to a merged daily Health statistic or a validated energy adjustment. No real-device results have yet been recorded or published.

**Device-free arithmetic sensitivity:** A separate [synthetic research harness](../research/assumption-sensitivity/README.md) perturbs model coefficients by **arbitrarily selected ±10% factors**. Resulting kcal changes are exact within that artificial stress test, but are **not measured parameter error, a statistically calibrated interval, or an empirical validation of energy expenditure**.

## 4. Training readiness (independent of TDEE)

METRON takes sleep hours, present energy, musculoskeletal comfort, and past-week fatigue, then uses a transparent 3×3 heuristic to suggest an *illustrative fraction of the user's usual session sets*. A warning is triggered by sleep below five hours, pain, or combined low daily and fatigued weekly recovery. Step count adds contextual notes but is **not an automatic penalty**.

**Important: These thresholds and set ranges are not validated clinical cutoffs, and do not quantify injury risk.** They are coaching-style prompts for self-reflection. Circumstances such as extreme sleepiness, dizziness, acute pain, medications, illness, or other health risks call for appropriate professional assessment, not an automated training recommendation.

**H2-A evidence review (7 November 2026):** the [targeted review](../research/robustness/h2a/README.md) found indirect support for considering sleep and subjective state, but no direct validation of the exact 5/7-hour classifier, set-ratio table or 1.5-times step trigger in its bounded search. Habitual sleep guidance, chronic weekly training volume and different recovery endpoints cannot be converted directly into these rules. Clinical scope remains unreviewed. Proposed changes to the full-session and rest wording are recorded for H5 and have not shipped.

## 5. Appropriate use and out-of-scope use

Designed as an **educational adult fitness estimator** for generally healthy adults. It is not validated for children, pregnancy, clinical nutrition, critical illness, or prescribing eating/weight-loss treatment. Do not use it to diagnose metabolic disease, decide medical treatment, or guarantee fat-loss outcomes. People with a history of disordered eating should avoid treating estimates as rigid eating targets.

## 6. Validation ladder

1. **Mathematical tests — implemented:** Known-formula examples, boundary checks, invariants, and deterministic output.
2. **Usability checks — initial prototype only:** Manual desktop/mobile rendering and interaction inspection. Formal accessibility testing is pending.
3. **External resting-equation comparison — limited scope completed:** [G3](../research/ree-validation/G3_RESULTS.md) compares fixed equations with indirect-calorimetry RMR in one released cohort; [G4](../research/ree-validation/G4_DECISION.md) records the separate deployment decision. Independent cohort replication, prospective individual calibration and reference-instrument recalibration have not been performed by Metron.
4. **External outcomes — not done:** Compare multiweek weight/intake data with model predictions, accounting for water fluctuations and intake misreporting.
5. **Recovery validation — not done:** The readiness heuristic requires prospective evaluation; claims about injury prediction or optimal sets are explicitly prohibited pending such evidence.

We welcome preregistered test protocols, confidence intervals, subgroup analysis, and documented negative results. See [RESEARCH.md](./RESEARCH.md).

## Additional background

- Cunningham, J. J. (1980). *A reanalysis of the factors influencing basal metabolic rate in normal adults*. [DOI](https://doi.org/10.1093/ajcn/33.11.2372).
- Mifflin, M. D. et al. (1990). *A new predictive equation for resting energy expenditure in healthy individuals*. [DOI](https://doi.org/10.1093/ajcn/51.2.241).
- 2024 Adult Compendium of Physical Activities. [Activity classifications and MET codes](https://pacompendium.com/).

*Every coefficient used in this project's default model can be found in [`core/model.js`](../core/model.js). Where evidence is not sufficient for a universal coefficient, we label the choice an assumption.*
