# Issue #1 — Activity energy accounting

## In 20 seconds

**Finding:** Metron's daily step total and workout duration alone cannot reveal whether any walking steps took place within the workout. The existing model produces the **same estimate** for those different situations.

**Action:** Preserve the shipped V4.1 calculation. Experiment with explicit known overlap or bounded hypothetical scenarios; don't call the adjusted number a measured TDEE or a validated correction.

**Reproduce:** `node research/energy-accounting/run.mjs` — outputs structured JSON using synthetic data only. [Issue #1](https://github.com/andydrewie/metron/issues/1) · [ADR-0003](../../docs/adr/0003-explicit-overlap-assumptions.md).

## What the model computes

```text
estimated daily expenditure
  = 1.2 × RMR
  + walking above an assumed 2,000-step baseline
  + workout MET expenditure minus baseline expenditure during the workout
```

The research diagnostic removes **only the model's incremental walking component assigned to workout steps**. It does not change the whole-session MET term and assumes the first 2,000 baseline steps are outside the identified workout. This condition is not generally verifiable from a daily step count.

## Synthetic comparison — one 80 kg person

Assumptions: 175 cm, age 30, male equation parameter, 10,000 daily steps, 60-minute workout, 3.5 average-session MET; 2,000 baseline steps.

| Activity-context hypothesis | Conditional modeled daily kcal |
| --- | ---: |
| **Known-disjoint:** zero workout steps among 8,000 incremental walking steps | **2,523.46** (published calculation) |
| **Known-overlap:** 6,000 of those steps already represented by the workout MET term | **2,349.16** (arithmetic sensitivity) |
| **Unknown:** assumed 0–6,000 overlapping incremental steps | **2,349.16–2,523.46** (conditional endpoints; *not* an empirical interval) |

The arithmetic difference is **174.30 kcal** under these selected assumptions, not a measured overestimate or a guaranteed correction. Real error could be smaller or larger because stride, terrain, MET, rest, and baseline factors are estimated independently.

### Baseline edge case

At 0 and 2,000 steps without a workout, the current model returns the same **2,098.50 kcal/day**. This is a structural plateau from the 2,000-step baseline threshold, **not evidence that these days cost exactly the same energy**.

## The decision, and what remains unknown

**Decided for research:** represent overlap explicitly as **known**, or as an intentionally **bounded unknown** with stated hypothetical endpoints. Do not guess overlap from a workout label or silently change the consumer's TDEE.

**Still open:** How should future real activity events carry start/end time, distance/steps, source, timezone, gross-versus-net expenditure, and conflict rules? What baseline convention is best across very low and very high movement days? Does any proposed reconciliation improve measured accuracy?

The research runner is separate from `core/model.js`, the CLI API, and the web UI. A proposed correction must first earn evidence, preserve backward compatibility or version its contract, and work for people with no wearables.

## Evidence status

- **Software verification:** synthetic test cases and deterministic arithmetic; tests do **not** validate physiology.
- **Empirical validation:** none.
- **Decision confidence:** medium (qualitative engineering judgment about exposing uncertainty, not a statistical probability).
- **Interpretation:** a conditional scenario is *not* a calibrated confidence interval.

The [2024 Adult Compendium](https://pacompendium.com/adult-compendium/) differentiates activity types and METs and includes measured and estimated values. It does not validate Metron's combined model or supply a universal correction for double-counted steps.

This research stays deliberately small. We can stop with a clearer warning if event-level precision proves more costly than useful.
