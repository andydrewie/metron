# Architecture Decision Records

## In brief

An **ADR** preserves the reason behind one consequential, reversible or historically important choice. It records context, alternatives, decision, trade-offs and what would make us reconsider. An ADR is **not** a ticket, an experiment transcript, or a requirement that every code change needs a new document.

Read [the collaboration policy](../COLLABORATION.md) before proposing new records.

| Record | Decision | Status |
| --- | --- | --- |
| [ADR-0001](./0001-lightweight-public-reasoning.md) | Adopt a lightweight, inspectable public reasoning protocol | Accepted |
| [ADR-0002](./0002-repository-based-continuity.md) | Keep collaboration rules durable across agents and sessions | Accepted |
| [ADR-0003](./0003-explicit-overlap-assumptions.md) | Preserve default TDEE; require explicit overlap evidence for research adjustments | Accepted |
| [ADR-0004](./0004-provenance-before-automatic-reconciliation.md) | Separate clock overlap from step-summary inclusion | Accepted |
| [ADR-0005](./0005-retain-resting-default-pending-replication.md) | Retain the resting-model default pending relevant replication | Accepted |
| [ADR-0006](./0006-durable-evidence-before-expansion.md) | Prioritize durable evidence and applicability before expansion | Accepted |

**Machine index:** [`index.json`](./index.json), with stable IDs, file paths, status, confidence type and decision domain. Do not treat the index as a substitute for reading an ADR's rationale.

### Lifecycle

`Proposed → Accepted` or `Rejected`; an accepted ADR may later become `Superseded` by a new ADR. Keep the original reasoning visible. Only correct formatting/links in historical records, not their substantive decisions.

### Creating an ADR

Copy [TEMPLATE.md](./TEMPLATE.md) to the next `NNNN-short-description.md` filename. Keep a readable summary at the top. Include a responsible alternative and its trade-offs, and link the motivating issue and implementing PR if they exist. Update this index and `index.json` together.

**Default size:** a few short paragraphs, generally one screen of summary and one optional deeper section. External research belongs in linked references rather than pasted walls of text.
