# Metron · Apple Health sample-attribution pilot

**Dated source follow-up, 9 November 2026:** [H2-C](../robustness/h2c/README.md) verifies that raw daily samples use `strictStartDate`, while the statistics predicate uses options `[]`. The calendar anchor is the workout start day. [H3 follow-up](../robustness/h2c/measurement-crosswalk.json) retains query caps, day boundaries, authorization/history limits and changing sample representation. This does not establish that stepCount was condensed or that an actual device supplied any data. No new on-device run occurred.


## In 20 seconds

**A working research app is prepared:** a small, read-only SwiftUI iPhone pilot that compares **exact sample UUIDs** between the latest visible workout's associated step records and the step records returned by a calendar-day query.

**What it does NOT establish:** whether those raw samples contributed to a HealthKit *merged* daily statistic, how many calories were double-counted, or whether the user's training is recovered. No Metron production calculator change.

**Privacy:** you explicitly grant HealthKit access on your own iPhone. The pilot does not upload, log, persist, export, or modify Health data. It displays aggregate diagnostic values in memory and offers a Clear button.

This is **research-only code**, not a distributed iOS app or a feature in [Metron's website](https://andydrewie.github.io/metron/). Its native code **compiled successfully in a macOS GitHub Actions iOS Simulator build** ([verification run](https://github.com/andydrewie/metron/actions/runs/42156958864)). Real-device operation with authorized personal Health records is **not yet verified**. **This test is optional and not a dependency for Metron research.** If a Mac, compatible iPhone, or permissions are unavailable, there is nothing to install or recover: use the [device-free sensitivity experiment](../assumption-sensitivity/README.md) instead.

## See the experience

```text
METRON · PILOT

A small question, carefully measured.

[ Request Health access & inspect ]

Latest workout: [local date]
Associated step records       N
Day-query step records        N
Exact sample IDs in both      N

HealthKit daily statistic:    N / unavailable
Per-source statistics:        optional breakdown

Interpretation:
A UUID match establishes record identity across
two queries—not inclusion in the merged daily total.

[ Clear results from memory ]
```

This is a structural illustration, **not a screenshot or an observed result**. The actual iPhone app uses Metron's Soft Slate, Scientific Blue and Copper vocabulary with a compact, accessible interface.

## Install and run on your own iPhone

You'll need **a Mac with Xcode**, your iPhone, and Apple-compatible app signing with HealthKit capability. GitHub and ChatGPT **cannot install it on your iPhone or grant Health permissions remotely**.

1. Clone the repository or download the GitHub source ZIP. Open `research/apple-healthkit-pilot/HealthPilot.xcodeproj` in Xcode.
2. Select the `HealthPilot` target. Under **Signing & Capabilities**, select your development team, choose a unique bundle identifier if necessary, and verify that **HealthKit** is present. Xcode may need suitable provisioning to enable HealthKit.
3. Select your **connected iPhone** as the run destination and press **Run**. The simulator is suitable for compile checks, **not** a substitute for your personal on-device Health records.
4. Open **Metron Pilot** on the iPhone. Tap **Request Health access & inspect**. On the system permission sheet, grant **read** access only to **Workouts** and **Steps** if you're comfortable.
5. Inspect the summary. The pilot examines the latest visible workout from the last seven days and the **calendar day containing its start**. Tap **Clear results from memory** when finished. Manage/revoke access later in your iPhone's Health/Privacy settings.

**No account, API key, remote health synchronization, third-party dependency or upload is necessary.** There is no TestFlight/App Store distribution in this repository.

## What exactly is read?

- `HKWorkout`: the **most recent visible workout** overlapping the previous seven days (limited to one).
- `HKQuantitySample` of `stepCount` **associated with that workout** via `HKQuery.predicateForObjects(from:)`.
- `HKQuantitySample` of `stepCount` in the **start-date-based local calendar day** containing the workout's start. The app compares exact `HKObject.uuid` values across these two queries.
- `HKStatisticsQuery`: that day’s step statistic with `.cumulativeSum` and `.separateBySource`, plus contributing source-level quantities when available.

Only **step counts and workout records** are requested. No heart rate, GPS, routes, sleep, weight, dietary data, HealthKit writes or background monitoring.

### Interpretation contract

| Observation | What it proves | What it does NOT prove |
| --- | --- | --- |
| Exact UUID in both sample queries | The same visible HealthKit sample record matched two query predicates | That HealthKit counted all its steps into the merged daily statistic |
| Workout-associated step samples missing | No linked samples visible to this query | That the user took zero steps, that read access was definitely denied, or that a workout has no steps |
| Separate per-source statistics | HealthKit returned distinct aggregate values for the matching source(s) | That adding them is necessarily the correct user-visible daily total |
| Workout crosses midnight | The latest workout extends beyond the queried calendar day | Its step allocation across dates |
| Query reaches 4,000 samples | The diagnostic may be truncated | A complete absence/presence or precise source reconciliation |
| HealthKit summary differs from raw sample sums | Different aggregation/sample predicates produced different numbers | Which count is physiologically "correct" |

**Apple's read-authorization privacy rule:** an app can't reliably distinguish denied or limited read permission from no accessible matching samples. The pilot communicates this limitation. A successfully processed authorization callback is **not proof** that read permission was granted.

Daily sample selection uses **strict sample start dates**. Statistics use HealthKit’s own aggregate query semantics. These are deliberately **not assumed identical**; series and multi-source deduplication can affect results. No automatic subtraction is performed.

## Verify the build

A dedicated, no-signing **macOS GitHub Actions** workflow builds the native iOS simulator target when the pilot changes. This checks Swift/Xcode compilation, not HealthKit authorization or device behavior.

```bash
xcodebuild \
  -project research/apple-healthkit-pilot/HealthPilot.xcodeproj \
  -scheme HealthPilot \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' \
  CODE_SIGNING_ALLOWED=NO build
```

Repo-wide Linux tests also check the project/capability declarations, read-only flow and absence of network or persistence APIs. Those tests are **structural safeguards**, not proof of zero system-level privacy risk.

## Prior decisions and stopping point

[Issue #1](https://github.com/andydrewie/metron/issues/1) · [ADR-0003](../../docs/adr/0003-explicit-overlap-assumptions.md) · [ADR-0004](../../docs/adr/0004-provenance-before-automatic-reconciliation.md) · [Provider evidence review](../provider-step-semantics/README.md).

No new ADR is warranted: this is a bounded, opt-in **experiment implementing existing accepted decisions**, not a change in their rationale.

**Exit condition for this branch:** a buildable local-only app, explicit on-device permission, interpretable sample-ID diagnostics, and public documentation of limitations. **It does not require collecting, publishing, or discussing anyone's actual Health data.**

**Later evaluation, only with permission:** compare real source-specific sample/query provenance on device; if query semantics do not identify inclusion, retain "unknown" rather than treating an exploratory pilot as evidence that Metron's daily TDEE is wrong.

### Primary references

- [Apple: Requesting HealthKit authorization](https://developer.apple.com/documentation/healthkit/authorizing-access-to-health-data)
- [Apple: Workout-associated object predicate](https://developer.apple.com/documentation/healthkit/hkquery/predicateforobjects%28from%3A%29-5irg9)
- [Apple: Sample query](https://developer.apple.com/documentation/healthkit/executing-sample-queries)
- [Apple: HKStatistics and source separation](https://developer.apple.com/documentation/healthkit/hkstatistics)
- [Apple: `sumQuantity(for:)`](https://developer.apple.com/documentation/healthkit/hkstatistics/sumquantity%28for%3A%29)
- [Apple: Configuring HealthKit capability](https://developer.apple.com/documentation/xcode/configuring-healthkit-access)
