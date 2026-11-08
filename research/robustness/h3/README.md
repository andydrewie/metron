# H3 · Measurement and accounting boundaries

**Complete as an audit with explicit restrictions.** The model's accounting is inspectable; its component accuracy and provider reconciliation remain unestablished. The research diagnostic is separate from production. No clinical eligibility or observed provenance is inferred from numeric inputs.

| Quantity | Bound or admission rule | Remaining limit |
| --- | --- | --- |
| Baseline | 1.2 × predicted resting energy; includes an assumed 2,000 steps | No measured allocation; 0–2,000 steps form a structural plateau |
| Walking | `strideMeters` means metres per single step; 0.5 kcal/kg/km above baseline steps | Pace, slope, load, gait and personal step length unknown |
| Workout | Whole-session gross MET estimate minus the baseline over that same duration, floored at zero | Generic MET and predicted resting references differ; no personalized error bound |
| Overlap | Daily totals and clock overlap cannot identify merged contribution | No automatic subtraction, including an identical returned sample UUID |
| Composition | Preserve method, algorithm, time, preparation and hydration; SMM is not FFM | Input schema accepts numbers without provenance; no compatibility claim |
| HRV | Separate metric, signal, epoch, processing and posture | Same milliseconds do not make SDNN and RMSSD interchangeable |
| Missing/default | Observed, self-reported, estimated, defaulted and unknown remain different states | API defaults are examples, not observations or clinical clearance |
| Uncertainty | Joint weight/BF errors can cancel or compound | A fixed-mass derivative supplies no joint error distribution |

The [H2-C crosswalk](../h2c/measurement-crosswalk.json) retains the exact WHOOP, Garmin and HealthKit definitions inspected on 9 November 2026. Recheck provider semantics by 9 December 2026 or before integration. Unknown history, query caps, access ambiguity, midnight boundaries, 23/25-hour days and open physiological cycles prohibit a complete-day claim. None establishes read permission or record membership.

`node --test tests/h3-measurement.test.js tests/activity-events.test.js tests/provider-semantics.test.js tests/energy-accounting.test.js` exercises method mismatch, defaults, DST, partial intervals, caps, gross/net references, plateau and joint-error arithmetic with synthetic inputs. Passing these tests does not measure a provider or person.

For H4 the intended endpoint is resting calorimetry, not TDEE. Admission records the instrument, calibration, fasting/exercise/rest preparation, steady-state selection, BODPOD lung-volume assumptions, units, missingness and exact equation-sex codebook. The ten Haaf supplementary file has a conflicting kJ field name and MJ label. Its reference-only admission audit yields a mean of 7,686.333 kJ/day, consistent with the paper's rounded 7.68 MJ/day. Freeze division by 4.184 before prediction; do not select units from which equation wins. This discrepancy remains visible in the admission record.

No-go rules: do not combine unknown gross/net references, coerce missing values to zero, treat vendor scores as observations, infer injury safety, or tune a correction from these synthetic cases. Suitable source-specific measurements and an independently frozen protocol are required to lift a restriction. Reviewer: maintaining agent, not an independent measurement laboratory.
