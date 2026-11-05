# Metron roadmap — honest capabilities before broad distribution

**Project:** Metron: Daily Energy, Readiness, & Caloric Allowance. **Repository package:** 0.2.0-alpha.3 (local pre-publication package). **Model:** 0.1.0 (current deterministic engine). **Public repo and Pages:** not yet verified live.

## North star

*A personal exercise in applied physiology: collect what is observed, calculate what can be estimated, explain what is uncertain, and let people decide.*

The product interface follows **Energy / Readiness / Allowance**, with Body as a shared settings layer. Current implemented UI is **Energy / Readiness / Body**; **Allowance is planned** and should not be presented as available.

## Priorities and release gates

| Priority | Work | Acceptance criterion | Current status |
| --- | --- | --- | --- |
| P0 | Retire old identity, align brand, clean docs | No legacy branding, code/tests/links consistent | Completed locally; publication pending |
| P0 | Headless core and JSON CLI | Runs without UI/network; same calculations across clients | Implemented |
| P0 | Honest Energy + Readiness UI | Mobile-first, accessible, caveats visible | Implemented preview; external accessibility audit pending |
| P0 | External scientific transparency | Equations, assumptions, warnings, evidence levels | Documented; not empirically validated |
| P0 | Public publishing | GitHub repo/CI/Pages verified live | Pending manual creation/deployment |
| P1 | Energy accounting ledger | No silent overlapping walking/workout intervals | Proposed |
| P1 | Caloric Allowance | Smoothed TDEE, goals, constraints, nonpunitive safety rails | Proposed |
| P1 | Provenance-aware wearable imports | Synthetic fixture coverage; no raw personal data in repo | Proposed |
| P1 | Longitudinal evaluation | Leakage-safe prospective protocol + held-out metrics | Research proposal |
| P2 | Bayesian calibration / uncertainty | Clear priors, measurement error, coverage evaluation | Research proposal |
| P2 | Optional agent adapters / MCP | Validated contract over existing core; no duplicated physiology | Proposed |

## Data and science architecture

**Observe → Infer → Decide → Learn.** Time alignment and provenance belong to observations; equations and uncertainty to inference; user goals to decisions; longitudinal outcomes to learning. The same architecture should work without wearables or an LLM.

A wearable adapter must preserve definition, unit, time interval, source, processing status, and measurement method. Example: WHOOP RMSSD and Apple Health SDNN HRV are distinct metrics. Daily intake targets should use smoothed expenditure, not simply chase every day's step count.

## Release checklist

- [x] Single reusable pure JavaScript core and JSON CLI
- [x] Current API schemas, types, three synthetic examples and automated unit tests
- [x] Mobile-first static interactive reference app
- [x] Evidence/limitation documentation and research invitation
- [x] Human README and agent-specific documentation routes
- [ ] Independent browser and screen-reader verification of the **Metron-branded** build
- [ ] Overlapping activity resolution (or more explicit UI caveat)
- [ ] Caloric Allowance feature and validation of behavioral safeguards
- [ ] Public repository, CI runs, Pages live URL, social preview and metadata confirmed
- [ ] Research measurement study / independent benchmark

**Public release choice:** we can publish a clearly marked *exploratory Energy + Readiness preview* before Allowance is ready, but we must not call it a complete three-pillar release.

## Ownership and publish steps

The intended remote is `andydrewie/metron`; this is a **target**, not a verified public repository. Review the bundle and run `bash scripts/publish.sh` manually after authenticating GitHub CLI. The script must refuse an existing repo. Configure Pages to deploy via Actions and verify it from a phone. Check project-name confusion/trademark risks before broad distribution. Attach `og.png` as GitHub's social preview via repository settings and set About topics explicitly.

Candidate topics: `tdee`, `fitness`, `body-composition`, `strength-training`, `recovery`, `wearables`, `headless`, `javascript`, `open-source`, `research-software`.
