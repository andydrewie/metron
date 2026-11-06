<div align="center">

<img src="./og.svg" width="100%" alt="Metron — a white-first, color-vision-aware, open-source energy and recovery instrument" />

# Metron

**Daily Energy, Readiness, & Caloric Allowance**

An open-source fitness instrument with an independently usable, headless calculation engine.

[![MIT](https://img.shields.io/badge/license-MIT-18181b)](./LICENSE) ![Node ≥20](https://img.shields.io/badge/Node-%E2%89%A520-18181b) ![Zero runtime deps](https://img.shields.io/badge/runtime%20dependencies-0-171717) ![Status](https://img.shields.io/badge/status-exploratory-71717a)

**[Try it](#try-it-in-60-seconds)** · **[Use the engine](#for-agents--builders)** · **[Inspect the models](#what-is-and-isnt-established)** · **[Contribute](./CONTRIBUTING.md)**

</div>

> I wanted to understand how sleep, body composition, physical activity, and training volume interact. So I built a calculator, documented my assumptions, and open-sourced the homework.

**Use it. Fork it. Disagree with it. Improve it.** Metron is an exercise in applied physiology and software design—not a claim to know someone's true calorie burn or how recovered they are.

### Metron in 20 seconds

**Try it:** A free, interactive instrument for daily energy and training readiness. **Know its limits:** Estimates are not measurements; training-set guidance remains experimental. **Explore further when curious:** [See the research questions](./docs/ROADMAP.md) or [inspect the methodology](./docs/SCIENCE.md).

**[How we reason in public](./docs/COLLABORATION.md)** · [Working vocabulary](./docs/VOCABULARY.md) · [Decision records](./docs/adr/README.md) — questions, evidence, reversals, and code; detail by choice.

## One project. Two front doors.

**For people.** Explore the mobile-first instrument: adjust steps or workout time and see the estimate change immediately. Open the method only when you want more depth. [UI guide](./docs/DESIGN.md) · [Full-size screenshots](#the-instrument)

**For agents, builders & researchers.** Use a pure JavaScript module, deterministic CLI, typed interfaces, JSON Schemas, runnable examples, and research documentation. **No browser needed.** [AGENTS.md](./AGENTS.md) · [Machine manifest](./metron.manifest.json) · [API](./docs/API.md)

### The instrument

**[Open the live Metron instrument](https://andydrewie.github.io/metron/)** — V4.1 adds subtle, labeled data colors while preserving the white-first layout.

<p align="center"><img src="./docs/assets/v41-palette.svg" width="100%" alt="Metron V4.1 colors: soft slate baseline, blue walking and copper workout, each with text labels and numeric values" /></p>

<sub>UI screenshots below document the preceding monochrome V4 layout; the live site is authoritative for the updated V4.1 palette.</sub>


**Mobile-first preview.** This is the actual app at phone size—not a desktop screenshot shrunk into a mobile screen. Tap the image to open it at full resolution.

<p align="center"><a href="./docs/assets/mobile.png"><img src="./docs/assets/mobile.png" alt="Actual Metron mobile instrument with Energy, Readiness and Body tabs, steps slider and workout controls" width="400" /></a></p>

<details><summary><strong>See the full desktop experience</strong></summary>

The desktop image captures the entire browser viewport; open it full size to inspect the instrument.

<p align="center"><a href="./docs/assets/desktop.png"><img src="./docs/assets/desktop.png" alt="Actual Metron desktop experience" width="100%" /></a></p>

</details>

## What exists today

| Surface | What it does | Evidence status |
| --- | --- | --- |
| **Energy** | Estimates RMR and daily expenditure from body profile, steps and workouts. | Published equation components + explicit simplifying assumptions; **not individually validated**. |
| **Readiness** | Explores sleep, subjective energy and fatigue to help adjust training decisions. | **Unvalidated coaching heuristic**, not a physiological recovery measurement. |
| **Body** | Compares standard and optional fat-free-mass equations. Tracks SMM without treating it as an extra calorie bonus. | Population estimates; body-composition inputs may be imprecise. |
| **Caloric Allowance** | Goal-aware intake planning. | **Planned; not implemented.** TDEE does not equal an eating allowance. |

**WHOOP, Garmin, Apple Health, direct wearable synchronization, MCP, and Bayesian calibration are also planned—not shipped.** See the [research agenda](./docs/RESEARCH.md) and [future architecture](./docs/FUTURE_ARCHITECTURE.md).

**[What's next? Explore the living roadmap](./docs/ROADMAP.md)** — open questions, experiments, trade-offs and honest non-goals. No deadlines or growth targets.

**Current measured-science workstream:** [Resting energy validation program](./research/ree-validation/README.md) · [GitHub tracking dashboard](https://github.com/andydrewie/metron/issues/9). This is a proposal; **no measured accuracy results yet**.

**Research-only iPhone pilot:** [Read-only Apple HealthKit sample attribution](./research/apple-healthkit-pilot/README.md) (requires Xcode and your device's separate Health permission; not an existing web feature).

**[Why this is designed for humans and agents](./docs/INFORMATION_DESIGN.md)** · [Structured navigation map](./docs/navigation.json). Detail is always available, not a prerequisite.

## Try it in 60 seconds

Clone the public repository, then run these commands:

```bash
git clone https://github.com/andydrewie/metron.git
cd metron
npm run dev                  # http://127.0.0.1:4173
npm run ci                   # syntax, software tests, static Pages build
npm run release:check        # package/design/deployment preflight
```

Node 20+ is required for the development scripts. **No `npm install`, sign-in, API key or server-side calculation service is required.** The deployment artifact is a static website suitable for GitHub Pages.

## For agents & builders

```js
import { evaluate } from './core/model.js';

const input = {
  profile: { weightKg: 80, heightCm: 175, ageYears: 30, equationSex: 'male' },
  activity: { steps: 10000, workoutMinutes: 60, intensity: 'typical' },
  recovery: { sleepHours: 7.5, energy: 'good', weekly: 'mixed' }
};
const result = evaluate(input);
console.log(result.energy.estimatedTdeeKcal, result.recovery.status);
```

**Zero-install CLI:**

```bash
node bin/metron.mjs --file examples/beginner.json
cat examples/strength-athlete.json | node bin/metron.mjs
node bin/metron.mjs --example
```

The browser and CLI import the **same model**. Agents should read [`AGENTS.md`](./AGENTS.md) for invariants, [`metron.manifest.json`](./metron.manifest.json) for implemented-vs-planned capability flags, [`schemas/`](./schemas/) for input/output contracts, and [`core/model.d.ts`](./core/model.d.ts) for types. A lightweight resource index is provided in [`llms.txt`](./llms.txt); it is a convenience, not an official standard.

<p align="center"><img src="./docs/assets/architecture.svg" width="100%" alt="The human interface and agent/CLI consumers both call the same independent Metron core" /></p>

## What is and isn't established

Metron separates **observations**, **inferences**, **decisions**, and **future outcomes**. A vendor's recovery score is not ground truth. WHOOP RMSSD and Apple Health SDNN, for example, must not be silently treated as the same HRV measurement. Steps already counted during a workout can also be counted again in the walking estimate; the current engine **warns** about possible overlap but does **not** reconcile it. [Reproduce this ambiguity with synthetic cases](./research/energy-accounting/README.md).

<p align="center"><img src="./docs/assets/evidence-loop.svg" width="100%" alt="Observe, infer, decide, evaluate: Metron's openly testable research loop" /></p>

**The research question:** Does adding wearable and longitudinal data actually improve held-out training-performance predictions beyond knowing how someone slept, feels, and performed previously? A *negative* result would still be useful.

Read the [scientific assumptions](./docs/SCIENCE.md), [current architecture](./docs/ARCHITECTURE.md), [prospective research protocol](./docs/RESEARCH_PROTOCOL.md), and [unrun research protocol](./research/protocol.json). **Software tests are not physiological validation.** No measured individual accuracy or calibrated confidence intervals are claimed.

## Repo map

```text
metron/
├── README.md                 # Human story, real UI, honest status
├── AGENTS.md                 # Machine-readable engineering instructions
├── metron.manifest.json     # Capability truth: implemented vs proposed
├── core/                     # One deterministic, headless source of truth
├── schemas/ + examples/     # Typed JSON contracts and synthetic cases
├── bin/ + tests/            # CLI and software verification
├── index.html + app.js      # Static reference instrument
├── design/tokens.json       # Canonical design tokens → generated CSS
├── docs/assets/             # Real screenshots and editable SVG diagrams
├── research/                # Explicitly prospective, unrun evaluation
├── .github/                 # CI, GitHub Pages and contribution templates
└── docs/                    # Science, methods, design, research, deployment
```

The compact, restrained-color **V4.1 Research Instrument** visual language—guided by native ChatGPT interaction conventions, not OpenAI branding—is documented in [DESIGN.md](./docs/DESIGN.md). It uses semantic CSS tokens and standard browser controls without making React, shadcn/ui or Tailwind dependencies of the engine.

## Fork the homework

MIT-licensed and open to corrections. Share reproducible counterexamples, better equations with evidence, accessibility improvements, carefully controlled validation, and negative findings. Use synthetic or permission-cleared data only; don't publish private wearable exports in issues.

**[Contributing](./CONTRIBUTING.md)** · **[Research questions](./research/README.md)** · **[Design tokens](./design/tokens.json)** · **[Deployment instructions](./docs/DEPLOYMENT.md)** · **[Release QA](./docs/QA.md)**

**Publication status:** Public source repository. The live Pages URL is available only once deployment completes successfully. **Source package:** `0.2.0-alpha.3`; **underlying calculation model:** `0.1.0`.

<div align="center"><sub>Complexity in the engine. Clarity in the cockpit. · MIT</sub></div>
