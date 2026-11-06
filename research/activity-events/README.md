# Activity-event evidence contract · Research preview

## In 20 seconds

**Finding:** Sharing a time window doesn't prove that workout steps were counted inside a daily step total.

**Decision:** Test a small, versioned contract that keeps **activity timing**, **step-summary membership**, and **record provenance** distinct. Leave the public calculator and its calorie estimates unchanged.

**Reproduce:** `node research/activity-events/run.mjs` using six synthetic examples. [Research Issue #1](https://github.com/andydrewie/metron/issues/1) · [JSON Schema](./contract.schema.json) · [ADR-0004](../../docs/adr/0004-provenance-before-automatic-reconciliation.md).

## The key distinction

```text
Step summary (10k)       Workout (60 minutes)
  ├─ start/end             ├─ start/end
  ├─ source & record ID    ├─ source & record ID
  └─ period basis          └─ optional workout steps
           \                /
              membership?
       included / excluded / unknown
```

**Text equivalent:** Each observation retains who recorded it, what was recorded, and which time interval it covers. A *separate*, explicitly sourced statement tells us whether some workout steps contribute to the summary. Mere clock coincidence, equal providers, and workout duration cannot prove membership.

## What the six synthetic examples show

| Scenario | Temporal relationship | Step membership |
| --- | --- | --- |
| Hypothetically included 6k | Workout inside daily period | Included (assumed) |
| Same times, relationship missing | Workout inside daily period | **Unknown** |
| Explicitly excluded from summary | Workout inside daily period | Excluded |
| Different provider's physiological cycle | Workout outside period | Unknown; *not the same calendar-day total* |
| Workout crosses midnight | Partially inside summary | Unknown; cannot allocate by duration |
| Workout step count absent | Workout inside summary | Unknown, **not zero** |

This is **logical interpretation of fabricated fixtures**, not observed fitness data. Even a stated inclusion based on a synthetic hypothesis is not a device measurement or validated calorie adjustment.

## Contract boundaries

- `stepSummary`: an aggregate count of steps, source metadata, and whether its time window is a calendar day, physiological cycle, or custom interval.
- `workout`: activity type, time window, provenance and optional workout-step count.
- `membership`: `included` / `excluded` / `unknown`. Known assignments require a count and declared evidence basis; unknown assignments **must not include** a fabricated step count.
- Timestamps: RFC 3339 with explicit UTC offsets; source `timeZone` preserves local interpretation. The time-zone label is recorded but not independently verified against the offset in this research-only interpreter.
- Research runner: pure JavaScript, no network, wearable credentials, browser, personal data, or runtime dependencies.

The inspector checks field names, intervals, invalid calendar dates, impossible step counts and contradictory membership. The JSON Schema documents the external shape; it is **not** a production ingest parser, nor a full validation of real vendor protocols.

**Crucial:** `membership.status = "included"` expresses evidence or a **declared hypothesis** about record inclusion, not proof of an accurate TDEE. The preexisting 2,000-step baseline assumption and gross-versus-net MET accounting still require separate research.

## Why keep the scope this small?

A full activity ledger, vendor integrations, heart-rate streams, confidence scores, and clinical prediction are not prerequisites to investigating whether two records refer to the same motion. Introducing them now would turn an inspectable hypothesis into an unnecessarily complicated software platform.

The next useful test would involve *permission-cleared, real source records with documented inclusion semantics*. Only then should we consider a versioned optional input to the main engine.

**Status:** research prototype only. **Software verification:** deterministic fixture tests. **Empirical validation:** none.

### Method references

[Open mHealth data provenance & timing principles](https://www.openmhealth.org/documentation/schema-docs/schema-design-principles/) · [RFC 3339](https://www.rfc-editor.org/info/rfc3339/) · [JSON Schema 2020-12](https://json-schema.org/draft/2020-12)
