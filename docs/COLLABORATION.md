# Open collaboration — intellectual provenance without paperwork

## In 20 seconds

**Our culture:** Questions → Experiments → Decisions → Code. Publish the reasoning that helps other people inspect, reproduce, challenge, or improve consequential choices—not every unfinished thought.

**Our evidence ethic:** Measure what we can. Question what we infer. Improve what we can demonstrate. Negative results and superseded decisions are contributions, not embarrassing history.

**Our attention ethic:** Human readers get the answer first and depth by choice; agents get stable paths, statuses, schemas, provenance, and reproducible commands.

> Make the reasoning inspectable, not the reader obligated to inspect it.

## Continuity without reminders — operational contract

An agent starting a new Metron task must **inspect the repository**, not ask a human to recite our conventions. [`AGENTS.md`](../AGENTS.md) provides the kickoff; [`docs/navigation.json`](./navigation.json) routes task intent; [`metron.manifest.json`](../metron.manifest.json) declares shipped capabilities; [ADR index](./adr/index.json) identifies prior decisions. The most recent Issue/PR provides investigation context.

**We enforce different things at different layers:**

- **Machine-checkable integrity:** CI verifies valid decision-index entries, matching ADR files/statuses, documented navigation destinations, and discoverable agent entrypoints. Reproducible code behavior still uses ordinary software tests.
- **Human-and-agent judgment:** whether a new ADR is warranted, whether an evidence claim is supported, and whether writing is nurturing cannot be proven by a green CI badge. A reviewer must assess material decisions.
- **Review trail:** consequential work should normally happen through a branch + PR with a concise rationale and links. A PR is a proposed change; it isn't accepted until merged.
- **No compulsory paperwork:** small wording fixes, exploratory discussions and experiments that don't change behavior don't require a fresh Issue, ADR or PR narrative.

The current GitHub Actions jobs **run** on pull requests, but **will not prevent direct pushes unless branch protection/rulesets are enabled**. Treat a successful check as verification of what was tested, not a guarantee that every collaborator obeyed policy. Optional branch protection can require PRs and the `test` check before merge; it is a repository-owner configuration, not an agent promise.

Cross-agent instruction adapters are minimal references to the same `AGENTS.md`; avoid maintaining competing copies of the policy. Add new checks only for an objective failure that is worth protecting against. **Don't make conscientious human judgment into a brittle form field.**

## The public trail

| Purpose | Home | Record minimally |
| --- | --- | --- |
| Open-ended curiosity | An informal conversation; GitHub Discussions **only if enabled** | The question and useful context; no mandatory artifact |
| Reproducible question or defect | GitHub Issue | Problem, falsifiable proposition or reproduction, relevant evidence, and what might change our mind |
| Experiment or implementation | Pull Request (PR) | Linked question, approach, commands, observations, failure cases, limitations |
| Consequential choice | Architecture Decision Record (ADR) in `docs/adr/` | Context, options, decision, consequences, confidence rationale, reversal trigger |
| Changed behavior | Versioned code, tests, schemas, docs | What shipped and why, linked to previous records |

**The sequence is a thinking aid, not a compulsory four-document workflow.** A typo or straightforward bug fix can be a PR without a new issue or ADR. A research experiment may legitimately end with no code. Existing issues should be reused before creating duplicates.

## Provisional publication gate — v0.1

Create a **durable public reasoning artifact** when at least one is true:

1. **Testable:** someone can state an observable contradiction, a reproducible defect, or a falsifiable question worth revisiting.
2. **Consequential:** the choice changes a public API, scientific assumption, privacy posture, data meaning, accessibility invariant, or a significant architectural trade-off.
3. **Reusable:** future contributors would otherwise need to reconstruct the why, limitations, or rejected alternatives.

Otherwise: **do not create a document by default.** Leave it as conversational exploration, a working note, or no artifact. Prefer extending an existing issue/ADR rather than multiplying near-duplicates.

**Always document material safety, privacy, and scientific-method changes**, even if they appear small. Disagreement with this gate is welcome: it is a provisional workflow judgment, not empirical science.

An artifact should have an executive summary of **up to about 80 words**, with deeper explanation and citations below or linked. This is a reading aid, not a rigid CI-enforced word limit. One question per issue and one consequential decision per ADR are useful defaults, not bureaucracy.

## Intellectual provenance: preserve what changed our minds

1. **State the prior position** (or what was unknown).
2. **Link the evidence** with definition, sample or denominator, units, time window, source, method, and uncertainty *when relevant and available*.
3. **Separate observation, assumption, inference, policy choice, and implementation.** They are not interchangeable.
4. **Name the best alternative**, including why a reasonable person could prefer it.
5. **Record what would reverse the decision**, and whether it has ever been tested.
6. **Preserve negative results and superseded ADRs**; link the replacement instead of silently rewriting historical rationale.

Do not publish private wearable exports, identifiers, tokens, or sensitive participant data to establish provenance. Synthetic examples and permission-cleared aggregate evidence are welcome.

## Meaningfully quantitative, not numerically theatrical

- For an **empirical claim**, report numbers only if accompanied by interpretable units, measurement method, context/population, observation window, appropriate comparison and uncertainty; say what is missing.
- For a **software claim**, distinguish deterministic tests and reproducibility from evidence of physiological accuracy.
- For an **engineering judgment**, `decisionConfidence` may be `low`, `medium`, `high`, or `not-assessed`. It means *how firmly we currently favor a choice*, not an estimated probability of truth. Include a brief rationale and a concrete reversal trigger.
- For **probability forecasts**, numerical confidence (such as 70%) needs a defined future event and, ideally, later outcome-based calibration. Otherwise omit the percentage.
- For **physiological estimates**, never turn a decision-confidence label or test pass rate into a claim of individual accuracy. External validation and uncertainty calibration are separate research tasks.

Use two independent evidence fields when appropriate:

| Field | Allowed values | Interpretation |
| --- | --- | --- |
| `softwareVerification` | `not-tested`, `tests-passed`, `not-applicable` | Have relevant software properties been checked? |
| `empiricalValidation` | `none`, `external-retrospective`, `prospective-held-out`, `not-applicable` | Has the actual scientific claim been checked against independent observations? |

These are **descriptive statuses**, not an ordinal quality score. Cite source literature separately; a published coefficient is not itself validation of our combined Metron estimator.

## How to write for humans and agents

**Humans:** lead with a precise, direct, nurturing answer; offer one explanatory diagram when it reduces cognitive effort; make methods and history optional. A reader should understand the decision without opening every link. Never hide safety-critical qualification behind disclosure controls.

**Agents:** use `docs/navigation.json` for intent routing, `metron.manifest.json` for feature truth, `docs/adr/index.json` for decision discovery, and `AGENTS.md` for implementation invariants. Stable IDs and explicit statuses support forward-compatible tooling. Do not infer a shipped feature from an accepted policy or a roadmap proposal.

## Decisions and reversibility

ADRs use [our short template](./adr/TEMPLATE.md), one per consequential choice, numbered in sequence. Recommended statuses: **Proposed**, **Accepted**, **Rejected**, **Superseded**. An accepted ADR remains as a historical snapshot; a new ADR records substantive reversal and links the old one. A correction of a broken link or typo is not a new decision.

**Don't confuse a popular proposal with evidence.** A decision can be accepted with low confidence if it is reversible and its assumptions are explicit.

## Durable research is a deliverable

The corpus should remain reusable through at least **7 November 2027** even if the implementation is rebuilt. Evidence, ontological distinctions, negative results, limitations and reconstruction instructions can justify research without an immediate feature change. The [durable evidence program](../research/robustness/README.md) defines scoped gates, freshness review and clinical applicability coverage. Keep records canonical and navigable; document count is not an objective.

**Correction rule:** when prioritizing investigations, do not assume near-term product utility is the sole value criterion. That assumption can distort the roadmap, next-task pointers and evidence retention. Check all current entrypoints against the program, while preserving historical protocols/results and accepted decisions. The exception is disposable exploration with no reusable or consequential finding. This change is recorded in [ADR-0006](./adr/0006-durable-evidence-before-expansion.md).

A twelve-month reuse objective is not a delivery deadline or promise of complete medical knowledge. Record actual source-review dates, scope and unresolved gaps; do not equate an exclusion or software pass with physiological validity.

## No forced engagement

No quotas for GitHub Issues, ADRs, PRs, citations, stars, discussions, commits, contributors, or scheduled deliverables. Participation may be exploratory, quiet, episodic, or critical. Reusable research and practical usefulness, rather than document count, are our criteria.

Further detail: [Vocabulary](./VOCABULARY.md) · [ADR index](./adr/README.md) · [Research agenda](./RESEARCH.md) · [Information design](./INFORMATION_DESIGN.md).

### References

- [Michael Nygard-style ADR structure](https://adr.github.io/adr-templates/) — context, decision and consequences, with lightweight variants.
- [UK Government Digital Service: architecture decisions](https://gds-way.digital.cabinet-office.gov.uk/standards/architecture-decisions.html) — record important choices with traceability.
- [GitHub engineering communication guidance](https://github.com/github/how-engineering-communicates) — seek feedback, preserve context and trade-offs.
