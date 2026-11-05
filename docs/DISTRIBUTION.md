# Distribution — earn human attention and machine reuse

Metron is **open homework**, not a commercial fitness brand. Attention is valuable, but credibility is the constraint. A beautiful instrument earns the first minute; a reproducible, falsifiable engine earns continued attention.

## Human attention: first five seconds

1. **Identity:** Metron · Daily Energy, Readiness, & Caloric Allowance.
2. **Meaning:** estimated energy and readiness today; allowance is an upcoming pillar.
3. **Proof:** real responsive screenshot and an immediately working slider-based instrument.
4. **Invitation:** “I wanted to understand how sleep, body composition, physical activity, and training volume interact. So I built a calculator, documented my assumptions, and open-sourced the homework.”
5. **Honesty:** the estimates are exploratory; review science before relying on individualized predictions.

Avoid fake testimonials, excessive badges, claims of clinical precision, or mixing unimplemented roadmaps into current feature lists. A README visitor should find **what it is**, **try**, **copy**, and **challenge the assumptions** without scrolling through architecture diagrams first.

## Agent attention: first five tool calls

1. Read `AGENTS.md` for task and safety context.
2. Parse `metron.manifest.json` to see capabilities and maturity, **including false feature flags**.
3. Read `docs/API.md`, types and JSON Schemas.
4. Execute `node bin/metron.mjs --file examples/beginner.json`.
5. Run `npm run ci`; change core logic only with accompanying tests.

An agent must not need to load a website, authenticate, infer units from prose, or silently scrape screenshots to calculate TDEE. This is a reproducible local computational artifact.

## Research attention: first reproducible question

**Does longitudinal wearable data improve held-out performance predictions over sleep, subjective energy and past training performance?** This can yield a null result. It is a better invitation than a fake leaderboard. The [research protocol](./RESEARCH_PROTOCOL.md) distinguishes competing baselines, outcome labels, missingness and time leakage.

## Presentation kit

- **GitHub full title:** Metron: Daily Energy, Readiness, & Caloric Allowance
- **About description (<160 chars):** Open fitness homework: TDEE, sleep and training readiness. Headless JS + JSON CLI, inspectable assumptions, beautiful static app.
- **Hero:** white `og.png` (editable source `og.svg`), upload as social preview through GitHub settings.
- **Screenshots:** `docs/assets/mobile.png`, `docs/assets/desktop.png`; real local browser captures, updated in the release gate.
- **Diagrams:** `docs/assets/architecture.svg` (present topology) and `docs/assets/evidence-loop.svg` (proposed research loop), legible, editable, no invented results.
- **Recommended topics:** `tdee`, `fitness`, `body-composition`, `strength-training`, `recovery`, `wearables`, `headless`, `javascript`, `open-source`, `research-software`.
- **Repo tree:** top-level README and AGENTS, `llms.txt` pointer map, project-specific manifest, pure engine, schemas, CLI, examples and tests.

## Launch channels

| Audience | Opening | Authentic proof |
| --- | --- | --- |
| Beginning fitness user | “Change your steps and see the estimate.” | Simple interactive site, contextual explanation |
| WHOOP / Garmin / Apple Watch enthusiast | “What can sleep and HRV actually tell us about tomorrow's training?” | Clear differentiation of vendor metric semantics; future integration roadmap |
| Bodybuilder | “Your volume target is adjustable, not a law.” | Transparent, unvalidated recovery logic; edit-your-assumptions |
| Vibe coder | “Clone it, change the cockpit.” | Pure core/SDK, no installs, MIT |
| AI researcher | “Prove the added variables help.” | Baseline comparison plan, reproducibility, negative results welcome |

Never represent proposed wearable connections as working or claim we can natively read Apple Health on a static webpage.

## Release verification

Before the first promotional post, independently confirm: public repository exists, Pages resolves on mobile, CI passes on remote, screenshot matches the deployed version, all README links resolve, topic metadata and social preview are set, and examples do not contain personal health records.

Meaningful outcomes: external forks that actually run, informed reproducibility issues, repeat usage without deceptive tracking, independent model critiques, and accepted corrections. Stars are a discovery signal, not a biological-accuracy metric.
