# ADR-0002: Make the repository our durable collaboration memory

**Status:** Accepted  
**Date:** 2026-11-06  
**Domain:** Collaboration / agent interoperability  
**Decision confidence:** Medium *(engineering judgment, not a probability)*  
**Evidence:** Existing passing CI workflow, implemented collaboration policy and agent guidance; operational effectiveness has not been empirically studied  
**Related:** [ADR-0001](./0001-lightweight-public-reasoning.md), [Collaboration policy](../COLLABORATION.md), [Information design](../INFORMATION_DESIGN.md)

## At a glance

**Decision:** Keep our collaboration rules in one canonical `AGENTS.md`, route supported agents to it through minimal adapter files, and verify machine-checkable governance integrity in GitHub CI.

**Why:** People should be free to return after months away without reconstructing procedures. Agents should start with exact, current repo contracts rather than guessing or relying on private chat memory.

**Revisit when:** Different agents follow inconsistent rules, automatic checks create unnecessary friction, or our documentation requires more attention than it saves.

## Context

Metron already uses Issues, PRs and accepted ADRs to record intellectual provenance. But continuity was partly dependent on conversational recall. Our headless project is likely to be explored by independent coding agents (including those that look for different instruction filenames). A green CI result alone cannot establish scientific correctness or thoughtful collaboration.

## Alternatives

- **Rely on ChatGPT memory:** easy at first, but not repository-portable or guaranteed across sessions and tools.
- **Copy full instructions into every agent config:** discoverable, but duplication encourages contradictory updates.
- **One canonical policy plus tiny adapters and integrity checks:** discoverable, low duplication, and objectively testable. **Chosen.**

## Decision

Keep `AGENTS.md` canonical. Add concise `CLAUDE.md` and `.github/copilot-instructions.md` files that direct tools to the same source of truth. Extend existing governance tests to verify ADR coverage, status consistency, navigation links, and instruction discoverability. Require the five-step context check before significant repository work.

Prefer PRs for consequential changes and preserve evidence/decision links. Do **not** mandate a new Issue or ADR for every routine edit. Branch protection remains an optional owner-controlled gate.

## Consequences

- **Enables:** collaboration continuity without reminding agents, precise agent routing, externally auditable process, low cognitive load.
- **Costs / risks:** documentation can become stale; some assistants may not load instruction files; CI verifies structure, not truth or kindness.
- **Mitigation:** single canonical policy, objective tests, short summaries, transparent limitations, and the right to revise or supersede this decision.

## Confidence and evidence

- `decisionConfidence`: medium, supported by common agent-instruction conventions, not measured in a controlled evaluation.
- `softwareVerification`: tests-passed (checks structural file and navigation invariants; not agent behavior).
- `empiricalValidation`: not-applicable (process policy, not physiological model).
- **Revisit when:** contributors cannot find prior reasoning, an agent repeatedly skips the policy, or required documentation actively discourages contributions.

## References

- [Metron's living policy](../COLLABORATION.md)
- [Codex AGENTS.md guidance](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [GitHub Copilot repository instructions](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions)
- [Claude Code's CLAUDE.md guidance](https://support.claude.com/en/articles/14553240-give-claude-context-claude-md-and-better-prompts)
