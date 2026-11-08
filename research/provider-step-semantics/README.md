# Provider step accounting — public documentation review

**Dated follow-up, 9 November 2026:** [H2-C](../robustness/h2c/README.md) rechecked public definitions and records provider-version, metric, window, missingness and contribution limits in its [crosswalk](../robustness/h2c/measurement-crosswalk.json). The 6 November comparison remains historical evidence. Public Garmin Swagger retrieval exposed navigation only; no authenticated payload or automatic membership proof was added.


## In 20 seconds

**Finding:** WHOOP, Garmin and Apple HealthKit expose useful step and workout information, but the documentation examined does **not establish a universal rule for subtracting workout steps from daily or cycle steps**.

**Decision:** Keep aggregate-step membership **unknown** unless explicit source evidence exists. Research Apple HealthKit sample-level attribution first; do **not** change Metron's public calorie estimate or add a wearable API now.

**Explore:** [Evidence matrix](./matrix.json) · [Synthetic JSON demonstration](./run.mjs) · [Issue #1](https://github.com/andydrewie/metron/issues/1) · [Existing ADR-0004](../../docs/adr/0004-provenance-before-automatic-reconciliation.md).

Reviewed November 6, 2026. **Official public documentation and fabricated fixtures only**; no vendor accounts, health data or measured physiological outcomes.

## Provider comparison

| Provider | Verified public documentation | Critical missing link | Implication |
| --- | --- | --- | --- |
| **WHOOP** | Since September 23, 2026, `step_count` can appear on a physiological **cycle**; workouts separately report timestamps and scoring | Reviewed workout model doesn't document which workout steps belong in the cycle's step count | Respect cycle windows; `null` is missing, not zero |
| **Garmin** | Health API all-day steps, Activity API JSON and detailed FIT activity files; a **Personal API** is now described for individuals | Public overview does not specify exactly how all-day and individual activity steps reconcile | Inspect detailed field definitions if authorized; access is not membership evidence |
| **Apple HealthKit** | Workouts can associate step samples; workout predicates retrieve associated samples; statistics can be separated by source | Association with a workout alone doesn't prove that those samples contributed to a particular merged daily statistic | Most promising **sample-identity experiment**, not proven automatic correction |

**A shared time interval proves temporal coexistence—not inclusion in the same aggregate.**

## What's new or easy to misunderstand

WHOOP's September 23, 2026 [API changelog](https://developer.whoop.com/docs/api-changelog/) explicitly added optional cycle `step_count`. Therefore, claiming WHOOP's developer API has no step totals would be outdated. Its [cycle documentation](https://developer.whoop.com/docs/developing/user-data/cycle/) defines physiological cycles rather than midnight calendar days, and the [workout model](https://developer.whoop.com/docs/developing/user-data/workout/) does not document included workout-step counts.

Garmin currently documents a [Personal API](https://developer.garmin.com/gc-developer-program/personal/personal-faq) for individual access, alongside [Health](https://developer.garmin.com/gc-developer-program/enterprise/health-api/) and [Activity APIs](https://developer.garmin.com/gc-developer-program/enterprise/activity-api/). This changes the possible experimental access route; it does not prove the semantics of a merged step total, and we did not request credentials.

Apple documents [HKWorkout sample association](https://developer.apple.com/documentation/healthkit/hkworkout), [workout-associated sample predicates](https://developer.apple.com/documentation/healthkit/hkquery/predicateforobjects%28from%3A%29-5irg9), and [source-aware HKStatistics](https://developer.apple.com/documentation/healthkit/hkstatistics). Statistics can merge sources by default; a particular daily sum requires examining its query and sample provenance, not naive subtraction.

## Reproducible synthetic compatibility check

```bash
node research/provider-step-semantics/run.mjs
npm run ci && npm run release:check
```

Three **fabricated** provider-inspired records are interpreted by our existing [experimental activity-event contract](../activity-events/README.md). For all three, workout-to-aggregate membership remains unknown. Even recording 6,000 steps within a workout doesn't prove those steps were included in a specific daily total.

A null WHOOP cycle step count cannot be coerced to zero: our current experimental step-summary contract requires a nonnegative integer, so missing data must be represented separately before any future import. These fixtures **are not real API response examples** and establish no device compatibility.

**Experimental implementation:** [Local Apple HealthKit pilot](../apple-healthkit-pilot/README.md) now includes a read-only iPhone app to inspect actual sample identities **after the user grants device permission**. It does not establish inclusion in merged statistics or modify TDEE.

## Next calibrated decision

1. **Complete this official-source review and reproducible synthetic demonstration**—done in this research branch.
2. If research continues, **evaluate Apple HealthKit sample IDs, source attribution, workout association, and daily-statistic query population** in an opt-in, privacy-safe, local experiment. Native code and explicit participant consent would be required; neither is part of this release.
3. Revisit Garmin's Personal API and detailed FIT definitions, then WHOOP's cycle-specific data, only if the evidence warrants additional effort.

**Stop condition:** if precise inclusion cannot be established, report unknown. Even a proved step membership would not validate the calorie model's MET, stride or baseline approximations.

## Epistemic status

- **Software:** synthetic deterministic fixtures and tests; no API calls.
- **Scientific:** no real physiological validation.
- **Evidence scope:** official documentation, not authenticated field-level payload testing. Lack of proof in the documents reviewed is not proof that a capability could never exist.
- **Confidence:** prioritization is a reversible engineering judgment, not a numerical probability.
- **Governance:** no new ADR necessary: [ADR-0003](../../docs/adr/0003-explicit-overlap-assumptions.md) and [ADR-0004](../../docs/adr/0004-provenance-before-automatic-reconciliation.md) already govern this decision.

### Official sources

WHOOP: [Cycle](https://developer.whoop.com/docs/developing/user-data/cycle/) · [Workout](https://developer.whoop.com/docs/developing/user-data/workout/) · [API changelog](https://developer.whoop.com/docs/api-changelog/).

Garmin: [Health API](https://developer.garmin.com/gc-developer-program/enterprise/health-api/) · [Activity API](https://developer.garmin.com/gc-developer-program/enterprise/activity-api/) · [Personal API FAQ](https://developer.garmin.com/gc-developer-program/personal/personal-faq) · [Program overview](https://developer.garmin.com/gc-developer-program/overview/).

Apple: [HKWorkout](https://developer.apple.com/documentation/healthkit/hkworkout) · [Workout-associated objects](https://developer.apple.com/documentation/healthkit/hkquery/predicateforobjects%28from%3A%29-5irg9) · [HKStatistics](https://developer.apple.com/documentation/healthkit/hkstatistics) · [Statistics collection queries](https://developer.apple.com/documentation/healthkit/executing-statistics-collection-queries).
