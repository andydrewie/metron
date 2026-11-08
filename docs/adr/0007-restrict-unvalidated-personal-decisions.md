# ADR-0007: Restrict unvalidated personal decision claims

## At a glance

**Status:** Accepted
**Date:** 2026-11-09
**Decision confidence:** medium, qualitative judgment
**Software verification:** tests-passed for deterministic boundaries; hosted UI verification recorded in H7
**Empirical validation:** none for readiness, individual calibration or comprehension

Keep the current numerical model and inspectable alternatives. Present readiness as entered-signal reflection, move set-band arithmetic into an illustrative disclosure, and distinguish equation disagreement from personal uncertainty. Refuse stale exports and inferred body-fat measurements.

## Context

H2 found no direct validation of the exact readiness rules. H3 exposed missing provenance and measurement incompatibilities. H4 replicates resting equations in a selected cohort, without validating the combined daily model. Existing “full session” language and stale results could invite unsupported decisions even when a disclaimer existed elsewhere.

## Decision

Ship package 0.2.0-alpha.4 with clear boundaries and input/privacy fixes. Numerical coefficients, legacy output shape and model version 0.1.0 remain unchanged. No allowance, Bayesian calibration, personal error interval or safe/optimal training claim is added. Original G0–G4 files remain untouched and replay against their pinned historical core.

Retaining strong action wording with a disclaimer was considered; the inference remains too easy to make. Removing all legacy SDK fields would break existing consumers without adding empirical evidence. Instead document their restricted interpretation and remove prescriptive prominence from the browser.

## Consequences

Users can inspect the heuristic without being told it clears a session. Validation errors become less revealing of private inputs. Some callers relying on malformed inputs now receive errors; examples and valid calculations retain their values. Direct-export units and validation are documented in API.md.

H6 still requires real-user comprehension and prospective value evidence. H8 still requires a fresh-agent recovery exercise. Reopen this decision after appropriately separated prospective validation and demonstrated decision benefit, or if comprehension testing finds the restricted interface misleading. Passing software checks cannot lift these limits.
