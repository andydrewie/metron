# Science, provenance & limitations

> **Status: exploratory modeling, not empirical validation.** METRON's core combines published resting-expenditure equations with simplifying assumptions and a separate, nonvalidated training-readiness heuristic. Neither numerical correctness nor test coverage proves accuracy for real humans.

## 1. Resting energy (RMR / REE)

**Mifflin–St Jeor (default)**, simplified published form (kcal/day):

- Male equation parameter: `10 × weightKg + 6.25 × heightCm − 5 × ageYears + 5`
- Female equation parameter: `10 × weightKg + 6.25 × heightCm − 5 × ageYears − 161`

Originally derived from indirect calorimetry data (n=498, ages 19–78); a population estimate with notable unexplained variation, not a measurement of the user's metabolism. Paper: Mifflin et al., *American Journal of Clinical Nutrition* (1990). DOI: [10.1093/ajcn/51.2.241](https://doi.org/10.1093/ajcn/51.2.241).

**Cunningham (optional, requires body fat percentage):** `RMR = 500 + 22 × FFMkg`, with `FFMkg = weightKg × (1−bodyFatPercent/100)`. Original Cunningham equation: *AJCN* (1980), DOI: [10.1093/ajcn/33.11.2372](https://doi.org/10.1093/ajcn/33.11.2372). Body composition readings introduce their own measurement error. The app permits an explicit model choice instead of silently treating one as an accurate correction to the other.

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

## 4. Training readiness (independent of TDEE)

METRON takes sleep hours, present energy, musculoskeletal comfort, and past-week fatigue, then uses a transparent 3×3 heuristic to suggest an *illustrative fraction of the user's usual session sets*. A warning is triggered by sleep below five hours, pain, or combined low daily and fatigued weekly recovery. Step count adds contextual notes but is **not an automatic penalty**.

**Important: These thresholds and set ranges are not validated clinical cutoffs, and do not quantify injury risk.** They are coaching-style prompts for self-reflection. Circumstances such as extreme sleepiness, dizziness, acute pain, medications, illness, or other health risks call for appropriate professional assessment, not an automated training recommendation.

## 5. Appropriate use and out-of-scope use

Designed as an **educational adult fitness estimator** for generally healthy adults. It is not validated for children, pregnancy, clinical nutrition, critical illness, or prescribing eating/weight-loss treatment. Do not use it to diagnose metabolic disease, decide medical treatment, or guarantee fat-loss outcomes. People with a history of disordered eating should avoid treating estimates as rigid eating targets.

## 6. Validation ladder

1. **Mathematical tests — implemented:** Known-formula examples, boundary checks, invariants, and deterministic output.
2. **Usability checks — initial prototype only:** Manual desktop/mobile rendering and interaction inspection. Formal accessibility testing is pending.
3. **Measurement calibration — not done:** Measured indirect calorimetry vs predicted RMR with a clearly defined external dataset.
4. **External outcomes — not done:** Compare multiweek weight/intake data with model predictions, accounting for water fluctuations and intake misreporting.
5. **Recovery validation — not done:** The readiness heuristic requires prospective evaluation; claims about injury prediction or optimal sets are explicitly prohibited pending such evidence.

We welcome preregistered test protocols, confidence intervals, subgroup analysis, and documented negative results. See [RESEARCH.md](./RESEARCH.md).

## Additional background

- Cunningham, J. J. (1980). *A reanalysis of the factors influencing basal metabolic rate in normal adults*. [DOI](https://doi.org/10.1093/ajcn/33.11.2372).
- Mifflin, M. D. et al. (1990). *A new predictive equation for resting energy expenditure in healthy individuals*. [DOI](https://doi.org/10.1093/ajcn/51.2.241).
- 2024 Adult Compendium of Physical Activities. [Activity classifications and MET codes](https://pacompendium.com/).

*Every coefficient used in this project's default model can be found in [`core/model.js`](../core/model.js). Where evidence is not sufficient for a universal coefficient, we label the choice an assumption.*
