# Metron documentation index

Choose a route according to what you are trying to do. **All readers share the same headless engine and model definitions.**

| I want to… | Open |
| --- | --- |
| Resume in a new chat | [Continuation entrypoint](./CONTINUE.md) · [H1 inventory](../research/robustness/H1_INVENTORY.md) |
| Understand Metron in under a minute | [README](../README.md) |
| Run it from an agent or a terminal | [AGENTS](../AGENTS.md) · [API](./API.md) |
| Inspect the current implementation | [Architecture](./ARCHITECTURE.md) · [Core](../core/model.js) |
| Inspect the assumptions or limitations | [Science](./SCIENCE.md) |
| Find current research gates, weaknesses and clinical applicability coverage | [Durable evidence program](../research/robustness/README.md) · [Gate state](../research/robustness/plan.json) · [Claim corpus](../research/robustness/corpus.json) |
| Inspect the readiness evidence review | [H2-A report](../research/robustness/h2a/README.md) · [Sources](../research/robustness/h2a/sources.json) · [Review records](../research/robustness/h2a/review.json) |
| Challenge the models or design an experiment | [Research Lab](../research/README.md) · [Research agenda](./RESEARCH.md) · [Research protocol](./RESEARCH_PROTOCOL.md) |
| Understand future wearable/agent architecture | [Future architecture](./FUTURE_ARCHITECTURE.md) |
| Improve the visual design | [Design](./DESIGN.md) · [Canonical tokens](../design/tokens.json) |
| See priorities and release criteria | [Roadmap](./ROADMAP.md) · [QA](./QA.md) |
| Distribute or present the project | [Distribution](./DISTRIBUTION.md) |
| Propose a change | [Contributing](../CONTRIBUTING.md) |

## Two levels of truth

**Implemented now:** the functions in `core/model.js`, the schemas, the tests, the static browser and the JSON CLI.

**Proposed future work:** activity-overlap ledger, wearables, personal calibration, true intake allowance, MCP adapter, prospective readiness validation. Proposals live separately from implemented API documentation, and machine-readable status flags in `metron.manifest.json` must agree.

## Design doctrine

*Complexity in the engine. Clarity in the cockpit.* A newcomer should get a useful, honestly labeled result; an expert or coding agent should be able to inspect, compare, reproduce and challenge it.
