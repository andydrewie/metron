# Metron's working vocabulary

## In brief

**Use established terms precisely.** These words help people and coding agents share a model of our reasoning. They are not brand jargon. The same term should keep the same meaning across docs, issues, code and research notes.

| Term | Meaning in Metron | Not the same as |
| --- | --- | --- |
| **Question** | An uncertainty worth asking about | A commitment to build something |
| **Hypothesis** | A proposition with a conceivable test that could disconfirm it | A preference or unsupported declaration |
| **Observation** | A recorded value with definition, units, source and time context | A modeled estimate or interpretation |
| **Assumption** | An explicitly adopted simplification or premise | An observed fact |
| **Inference** | A conclusion derived from evidence and a model | A direct measurement |
| **Estimate** | Model-produced quantity with method, units and limitations | Ground truth |
| **Experiment** | A defined comparison or reproducible test | A screenshot or informal hunch |
| **Evidence** | Material supporting or challenging a claim, with provenance | Authority or popularity alone |
| **Decision** | A selected course among alternatives under constraints | Proof of correctness |
| **ADR** | *Architecture Decision Record*: a compact, durable explanation of one consequential choice | A full design specification or brainstorm archive |
| **Issue** | A scoped public investigation, problem or improvement opportunity | Every transient idea |
| **PR** | *Pull Request*: a reviewable proposal to change the repository | Evidence that a choice was validated |
| **Provenance** | Where information came from, how it was defined/transformed and when | A hyperlink without context |
| **Calibration** | Agreement between predictions/uncertainty and observed outcomes under a specified evaluation | A model's ability to emit precise-looking numbers |
| **Decision confidence** | A qualitative, revisable judgment about a choice's rationale | A calibrated statistical probability |
| **Superseded** | Historical decision replaced by another cited decision | Erased, hidden or retroactively declared never to have happened |
| **Headless** | Calculation works without the website, browser, UI framework or external service | Having no human-friendly UI |

## Semantic hygiene

- Use **`measured`** only for actual observations, **`estimated`** for model outputs, and **`proposed`** for unimplemented work.
- Separate **software-tested** from **empirically validated**.
- Preserve distinct HRV measurement types, provider definitions and time windows. No generic `hrv` merge from incompatible metrics.
- Treat **evidence of absence** differently from **absence of evidence**.
- Link any new term in its first public use to a definition or established primary technical reference when ambiguity matters.
- Introduce a new coined label only when existing technical vocabulary fails to express a real distinction. Explain the gain in clarity.

**Purpose:** make collaboration easier, not make contributors memorize a dialect.
