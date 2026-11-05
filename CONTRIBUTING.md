# Contributing to Metron

**Fork the homework. Challenge the assumptions. Keep it reproducible.** Metron welcomes both practical UX improvements and rigorous criticism of its physiology estimates. Please avoid sharing personal health information or raw wearable exports in issues and PRs; use synthetic fixtures or data you have permission to publish.

## Pick a track

- **New fitness user:** what was confusing, what required too many taps, what would help you interpret the number?
- **Strength athlete / wearable user:** what training decisions are missing context? Are device scores semantically or temporally mismatched?
- **Developer / coding agent:** can you reproduce the calculation from JSON, add deterministic tests, or improve type/schema compatibility?
- **Researcher:** which assumptions fail under independently measured data? Provide testable hypotheses, protocols, negative results, or benchmark designs.

## Development

```bash
npm run ci
node bin/metron.mjs --file examples/beginner.json
npm run dev
```

No package install is required. Keep the headless engine independent of UI and third-party vendor SDKs. Follow [AGENTS.md](./AGENTS.md), [API](./docs/API.md) and [science notes](./docs/SCIENCE.md).

## Submit good changes

A PR should cover **motivation → affected contract → reproducible test → result → remaining limitations**. New physiological claims require a primary source, target population, units, methodology, and appropriate caveats. Update implementation, tests, types, schemas and science documentation together if the public API or coefficients change.

Please do not replace exploratory labels with unverified accuracy percentages, or market planned wearable/OAuth/MCP features as shipped. Discussions are welcome even when the result is "this extra variable was not predictive."
