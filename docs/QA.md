# QA · Metron Research Instrument

**Current alpha.4 checkpoint, 9 November 2026:** 129 Node tests, 8 Python privacy tests, release preflight and hosted Chromium checks passed. Keyboard navigation, accessible names/roles, invalid-state propagation, export provenance and 320px/1280px layouts were checked. Four current synthetic screenshots were visually inspected. Exact source/run, methods, failed attempts and limits are recorded in [H7 verification](../research/robustness/h7/verification.json).

Current captures: [mobile](assets/mobile.png), [readiness](assets/recovery.png), [body](assets/body.png), [desktop](assets/desktop.png). They use the checked source served over localhost in hosted CI, not a live Pages session. Actual screen-reader use, broad device coverage, human comprehension and whole-product physiological accuracy remain unestablished. The archived narrow/tablet captures belong to earlier releases.

## Historical alpha.3 pre-publication record

The dated record below preserves what was established before publication. Its pending-publication statements and test counts do not describe current main; use the current checkpoint and live deployment checks for that.

**Status:** local pre-publication release candidate, 2026-11-05. **Scientific model:** `0.1.0`; no new physiological coefficients introduced. The GitHub repository and Pages URL have **not** been verified live.

## Verified locally

| Check | Result | Scope |
| --- | --- | --- |
| `npm run ci` | **25/25 software tests passed** | Node syntax, model behavior, metadata contracts, theme + diagrams, static build |
| `npm run release:check` | **PASS** | Manifest pointers, token generation, source assets, Pages workflow, `dist/` |
| Browser — 320px | **PASS** | Rendering, no overflow, TDEE changes with steps, three views, JSON export, no JS errors |
| Browser — 390px | **PASS** | Same plus tab-keyboard navigation, native advanced disclosure |
| Browser — 768px | **PASS** | Same regression coverage, no overflow |
| Browser — 1440px | **PASS** | Same regression coverage, no overflow |

Screenshots: [`mobile.png`](./assets/mobile.png), [`narrow.png`](./assets/narrow.png), [`desktop.png`](./assets/desktop.png), [`recovery.png`](./assets/recovery.png), and [`body.png`](./assets/body.png).

Browser captures used headless Chromium with the **exact current HTML, CSS (including generated token CSS) and JavaScript sources inlined into an offline test page**. They were not taken from a live Pages URL. This avoids network dependency but does **not** establish that GitHub Pages deployment, external links, or remote module imports function; verify them after publication.

The default synthetic example produces approximately `2,500 kcal/day`. Raising daily steps from 10,000 to 20,000 changes the displayed rounded estimate to approximately `2,800 kcal/day`. Both are **model outputs**, not real-world measurements.

## Release blockers / future validation

- Public GitHub repo creation and remote CI results are pending.
- Pages Settings → Source must be **GitHub Actions**, and the deployment artifact URL must be opened and checked.
- Real-device iOS/Android, VoiceOver/NVDA, and full WCAG 2.2 AA review are pending; local keyboard smoke tests are not an accessibility certification.
- Browser testing did not establish an individual's energy expenditure accuracy or safety of the readiness set guidance.
- Activity-overlap reconciliation, Caloric Allowance, and wearable import remain proposed capabilities only.
- Research protocol is unrun: no longitudinal predictions, held-out validation, calibrated confidence, or clinical claims.

**Publication rule:** change manifest release flags only *after* actually verifying the public URL and deployed website. Do not substitute this local QA report for those checks.
