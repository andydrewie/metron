# Research protocol — does wearable data add predictive value?

**Status: PRE-REGISTRATION DRAFT ONLY.** No human-subject data collected, model trained, or results published. This is a methodological starting point, not a completed study.

## Research question

For adults who resistance-train, does longitudinal wearable information predict **next-session performance** better than recent self-reported sleep, energy, soreness, and prior gym performance alone? If yes, does any improvement translate into **better decisions**, not merely more accurate predictions?

## Comparator models

- **A / Simple baseline:** previous session performance and program, self-reported energy, prior-night sleep, recent subjective fatigue.
- **B / Wearable:** A + within-person HRV (with metric method), resting HR, sleep time and regularity, device-specific scores recorded as separate variables.
- **C / Personalized:** B + individual history, tuned only using observations from earlier dates.

Additional predictors add complexity and privacy obligations. The primary claim is the *incremental value* of B over A; C over B is a second-stage hypothesis.

## Outcomes (to preregister before analyzing data)

Candidate primary endpoint: normalized change in performance on a repeated reference lift or matched training session (preselected load and rep/RIR protocol, standardized rest times, exercise ordering). Secondary outcomes: self-reported exertion, session completion, technique disruption, persistent fatigue over the next week. Strength/repetition outcomes are not the same as hypertrophy, injury likelihood, or sleep quality.

## Evaluation

1. Split by person **and time** where possible. For personal predictions, use rolling-origin forward validation. Do not randomly shuffle days within the same individual for the headline result.
2. Report simple baselines, MAE and calibration/coverage where relevant, uncertainty intervals, missingness, sample sizes and subgroup/individual variation. Avoid per-subgroup claims with tiny N.
3. Record model version, observed-at timestamps, device/algorithm provenance, and changes to normalization over time.
4. Separately evaluate predictive improvement and **decision improvement** under an explicitly chosen loss/utility function. It is possible to predict a metric better without improving a workout choice.
5. A model cannot claim that sleeping more *causes* a performance gain based on observational correlations; interventions require a separate experimental design, ethics, and preregistration.
6. Consent, local-only processing where possible, anonymization, data-minimizing exports, and no public upload of individual physiological histories without permission.

## Negative-result policy

A finding that HRV or proprietary wearable scores **do not** add useful predictive value is informative, publishable within the project, and never grounds for adjusting the endpoint after looking at results.

## Potential N-of-1 exploration

With voluntary self-tracking and standardized training sessions, use each athlete's prior data to make prospective next-session predictions. Timestamp and freeze each prediction *before* training. Compare predictions against the observed pre-specified performance measure; annotate illness, travel, deviations from the protocol and missing data. Do **not** infer safety from an individual readiness score.

## Evidence boundary after H2-A

The [H2-A review](../research/robustness/h2a/README.md) inspected the cited endurance prediction study: its targets were perceived morning recovery and HRV change, with an intercept-only baseline. That is not evidence that wearable features improve next-session lifting performance over our human-context baseline. Its described validation also does not establish this proposal's prospective forward-time decision benefit. The A/B/C study remains proposed and unrun; preserve distinct performance, hypertrophy, injury and causal endpoints.

## Important sources

- HRV in strength and conditioning (narrative review): https://pmc.ncbi.nlm.nih.gov/articles/PMC11204851/
- Predicting daily recovery in endurance athletes (2024): https://link.springer.com/article/10.1007/s00421-024-05530-2
- REFORMS scientific ML reproducibility checklist: https://pmc.ncbi.nlm.nih.gov/articles/PMC11092361/
- Leakage and reproducibility: https://pmc.ncbi.nlm.nih.gov/articles/PMC10499856/
- WHOOP Recovery definitions: https://developer.whoop.com/docs/developing/user-data/recovery/
