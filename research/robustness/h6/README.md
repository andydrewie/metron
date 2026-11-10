# H6 · Uncertainty and individual value

**The comprehension pilot protocol is prepared; H6 remains blocked.** Calibration and individual prediction ranges stay unimplemented. H4 provides a bounded resting result and a TDEE no-go; H5 restricts readiness to reflection. The [protocol](PROTOCOL.md) specifies a 40-person, two-arm comprehension pilot with five tasks, exact wording, scoring, practical margins and missingness/stop rules. No participant study has occurred.

| Evidence | What it can mean | What it cannot mean |
| --- | --- | --- |
| Paired bootstrap | Sampling variation of a cohort statistic | A person's likely calorie error |
| Coefficient/BF perturbation | Conditional arithmetic sensitivity | A measured error distribution |
| Difference between equations | Disagreement between model outputs | Calibrated uncertainty or correctness when they agree |
| Reference-method error | Error under a named measurement protocol | Error-free ground truth |
| Residuals/limits of agreement | Description of observed errors in a cohort | Transportable personal coverage |
| Display rounding | Reduced visual precision | A confidence interval |

The browser identifies rounding, rejects a model-difference-as-range interpretation and preserves unknown input origins in exports. Synthetic UI checks exercise these safeguards and harmful interpretation examples. They cannot measure what a person understands or whether their decisions improve.

Acceptance criteria 1–3 are addressed through scoped results, distinctions and a calibration no-go. Criterion 4 requires actual intended-user evidence and remains unsatisfied. Enrollment, task rubric, sample-size rationale and analysis rules are now specified. Independent human methods/accessibility review and named study operation remain pending before data collection. Do not mark this gate complete merely because copy and software tests pass.

## Prepared kit and remaining work

| Artifact | Purpose |
| --- | --- |
| [Protocol](PROTOCOL.md) | Design, allocation, consent, scoring, interpretation and stops |
| [Machine-readable plan](evaluation-plan.json) | Sample, source pins, operational blockers and decision rules |
| [Tasks and rubrics](tasks.json) | Three wording comparisons followed by two common diagnostics |
| [Run template](run-template.json) | Copy privately; fill operator, review, consent/retention and freeze records |
| [Packet generator](packet.mjs) | Participant-facing material without the answer key; concealed allocation |
| [Aggregate arithmetic](analysis.mjs) | Intervals and missingness scenarios; synthetic labels remain synthetic |
| [Material lock](protocol-lock.json) | Hashes of the specified artifacts; no human approval implied |

```bash
node research/robustness/h6/check.mjs
node research/robustness/h6/packet.mjs --condition R
node --test tests/h6-protocol.test.js
```

**Next:** a named study lead obtains independent human methods/accessibility review, resolves findings and completes the private run manifest, then runs consenting-user sessions. No reviewer, operator, recruitment or observation is claimed here. Agents may verify the kit and arithmetic; they cannot supply human observations. Keep participant-level data outside this repository. The historical/current text comparison does not test the entire app, physiological accuracy or long-term benefit.
