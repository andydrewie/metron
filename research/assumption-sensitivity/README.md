# Assumption sensitivity · Device-free experiment

## In 20 seconds

**Question:** If we change one coefficient in Metron's existing model by the **same 10% proportion**, how much does its estimated expenditure change?

**Answer:** The response depends on which coefficient and which activity profile we're considering. The arithmetic is reproducible **without a Mac, iPhone, WHOOP, Garmin or personal health data**.

**Important:** These changes are *stress tests*, **not** measured coefficient uncertainty, confidence intervals, or evidence that the estimate is accurate.

**Reproduce:** `node research/assumption-sensitivity/run.mjs`. [Machine-readable synthetic fixtures](./fixtures.json) · [Existing science](../../docs/SCIENCE.md) · [Issue #1](https://github.com/andydrewie/metron/issues/1).

## One visualizable example

For a fabricated 80 kg, 175 cm, 30-year-old profile with 10,000 steps and an illustrative 60-minute, 3.5-MET session, the current source model outputs **2,523.46 kcal/day**.

| One coefficient shifted | −10%: estimated kcal change | +10%: estimated kcal change |
| --- | ---: | ---: |
| Sedentary baseline multiplier | −201.11 | +201.11 |
| Net walking cost per kg/km | −23.24 | +23.24 |
| Height-to-stride ratio | −23.24 | +23.24 |
| Whole-session MET | −28.00 | +28.00 |

*Illustrative, one-factor-at-a-time model responses. Each stress factor is arbitrarily chosen for comparison, not a credible biological uncertainty range. Rounding is for readability.*

**Interpretation:** In this particular fixed scenario, a 10% change in the sedentary baseline multiplier changes the modeled number more than an equal proportional change in walking or workout coefficients. **This does not establish which assumption is actually most inaccurate**; its true uncertainty would require empirical observations and literature.

## The experiment

Three synthetic cases use the exact same deterministic Metron core model at the reference point:

- 10,000 steps + a 60-minute illustrative session;
- Zero steps and no workout;
- 20,000 steps + a 90-minute illustrative session.

The research-only function takes components returned by `core/model.js` and perturbs one modeled coefficient at a time. It does not silently replace the production model, reinterpret resting metabolism as measured, or claim a personal probability distribution.

The **0–2,000-step baseline plateau**, already documented in [the earlier energy-accounting experiment](../energy-accounting/README.md), remains a separate issue. So does ambiguity when daily steps overlap workouts.

## What we'd examine next

An independent, permission-cleared measured resting-energy dataset could help evaluate Mifflin–St Jeor vs Cunningham. That is a **separate empirical calibration investigation**, requiring population, measurement method, licensing and transparent error reporting.

There is no need to buy devices or distribute the Apple Health pilot. [The pilot](../apple-healthkit-pilot/README.md) remains available for an optional, future on-device test.

**Software verification:** deterministic arithmetic and JSON output tests. **Empirical validation:** none.

**Why no new ADR?** This experiment tests existing documented coefficients without changing public contracts, decisions, or behavior. Our collaboration policy discourages unnecessary paperwork.
