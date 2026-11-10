# H6 comprehension pilot · protocol 1.0

**The next study can now be prepared without inventing its design during recruitment.** Forty adults will interpret three matched wording cards and complete two common diagnostics. The pilot tests interpretation errors and hypothetical choices, not calorie accuracy, actual training behavior or health outcomes. The sample, rubric, margins, missing-data rules and stop conditions are specified before observations. **No participant has been recruited or evaluated.** Independent human review and a named operator remain prerequisites to running sessions.

---

## Question and scope

Does selected restricted wording reduce high-consequence interpretations compared with selected historical wording, while helping people choose a sensible next step? The target is the English-reading adult fitness audience, including people with lower confidence using numbers and users of assistive technology. No wearable or personal health measurement is required.

This is a parallel, individually randomized pilot. Each person sees either H (historical) or R (restricted) for all three primary cards. The previous draft suggested randomized crossover order. We changed that because the second wording could teach the first one's answer. The cards have the same neutral format and numerical facts; only the listed wording differs. They are **selected-text comparisons, not full reconstructions of two app releases**. T5 exposes the set-band text in both arms, so it cannot estimate the benefit of hiding that text in the current disclosure.

The canonical specification is [evaluation-plan.json](evaluation-plan.json); [tasks.json](tasks.json) contains exact stimuli, prompts and the task-specific answer key. Source pins distinguish literal historical/current UI text from the protocol-authored common diagnostics. Core equations, clinical scope and H0–H8 acceptance criteria are unchanged. Calibration retains its separate no-go without longitudinal reference data.

## Sample and allocation

Randomize **40 consenting adults, 20 per arm**, stopping at that number, eight weeks after the recorded start, or the interpretation stop below. Do not replace randomized withdrawals or add people because an effect looks nearly convincing. People excluded before randomization are counted by reason, without health details. If recruitment cannot fill the sample, report an incomplete pilot; do not silently change the denominator.

Eligibility: at least 18, interested in this kind of calculator, able to consent and use English materials with their usual support, and no Metron development/review role or prior exposure to these questions or answers. Do not screen on diagnoses or body composition. Before allocation ask: “How confident do you feel interpreting numbers and percentages?” (1–5), and “Do you use an assistive technology or accessibility setting for this session?” No diagnosis is requested.

| Recruitment stratum | Total | H | R |
| --- | ---: | ---: | ---: |
| Number confidence 1–2; assistive technology | 4 | 2 | 2 |
| Number confidence 3–5; assistive technology | 4 | 2 | 2 |
| Number confidence 1–2; standard setup | 16 | 8 | 8 |
| Number confidence 3–5; standard setup | 16 | 8 | 8 |

These are deliberate coverage quotas, not population proportions. “Assistive technology” includes a person's usual screen reader, magnification, speech input or alternative input setup. Keep their setup; record functional accommodations, not diagnoses. The small strata cannot support subgroup effectiveness claims. Translation requires separately versioned materials and a new scope statement.

A coordinator creates private shuffled blocks of four (two H, two R) within each stratum using `packet.mjs --allocation`. Keep the sequence concealed from recruiters until eligibility and consent are complete. Save its hash and the actual sequence privately. Assign the next unused entry in the applicable stratum. Do not regenerate allocations after inspecting outcomes. The coordinator may facilitate, but must not score the responses they elicited.

### Why forty, and what it cannot resolve

This is a bounded resource/precision choice: about 23 hours of participant sessions plus preparation and coding. It is not a claim of 80% power. With 20 independent observations per arm, a 10/20 event rate has a Wilson 95% interval of approximately 30%–70%. Even 0/20 leaves an upper bound near 16%. At a hypothetical independent 10% error prevalence, 20 observations give about an 88% chance of seeing at least one error. These are **planning calculations, not observed rates**, and do not establish generalizability from a purposive sample.

The 20-percentage-point error-reduction margin represents four fewer people per 20; the 10-point decision-success margin represents two more. These are prespecified project judgments about useful pilot signals, not literature-derived clinical thresholds. Wide intervals may make the study inconclusive. Sample-size reasoning follows the goal/precision distinction in [Lakens](https://doi.org/10.1525/collabra.33267); numerical calculations are executable in `analysis.mjs`.

## Session and consent

Budget about 35 minutes: introduction/consent and setup 7; three primary cards 15; common diagnostics 8; rating/debrief 5. Permit breaks and accessibility-related extra time; record it without scoring speed as failure. Provide information before the session in an accessible format. The operator fills the contact, retention, dates and incentive disclosure in a private copy of [run-template.json](run-template.json) before recruiting.

Participant information must say: who is running the study and how to reach them; that participation is voluntary; that tasks use fictional profiles and request no diet or exercise action; that text answers, observed task completion, setup needs and ratings will be recorded; who can see those records; that only de-identified aggregates will be published; the withdrawal route/deadline; and the deletion dates. Record affirmative consent separately from coded answers. If a participant declines, do not enroll them. Compensation, if any, is fixed before recruitment and not dependent on completion or a preferred answer.

Default recording is typed notes and short verbatim task answers only. No audio/video, diagnoses, body measurements, wearable exports, account data or external transcription services are part of this protocol. If a participant volunteers private health information, omit it from research notes. Use a study code, keep consent/contact records separately, and keep all participant-level material outside GitHub and ChatGPT uploads. Do not collect real observations in the synthetic test fixtures.

Allow withdrawal of identifiable task records for 14 days after the person's session, before aggregate publication. Explain that published non-identifying aggregates cannot subsequently be traced back for removal. Delete identifiable answers within 90 days of the final session and consent/contact records within 180 days, unless a governing institutional requirement needs a disclosed amendment before enrollment. The operator records exact dates and any required institutional review; this protocol does not assert regulatory approval or determine applicable law. The consent structure is informed by [GOV.UK guidance](https://www.gov.uk/service-manual/user-research/getting-users-consent-for-research).

Use this opening after consent: “We are testing the communication, not you. Please explain what the example means to you and what you would do next. There is no exercise or diet task. You may skip any question or stop.” Use the generated participant packet; never show the answer key or announce the preferred wording. Before primary answers, do not teach uncertainty terminology or correct interpretations. One neutral probe is allowed per task: “What makes you say that?” Record initial and probed answers separately; score the initial answer for endpoints. Neutral repetition/access support is recorded and does not count as semantic help. An explanation of the intended answer does.

## Fixed task order and scoring

| Order | Task | Evidence collected |
| --- | --- | --- |
| 1 | T1: 2,500 kcal/day | Estimate versus measurement/intake target; hypothetical next step |
| 2 | T2: 1,749 versus 1,750 | Model agreement versus personal accuracy/range |
| 3 | T5: readiness label and new discomfort | Signal reflection versus clearance or set prescription |
| 4 | T3: H4 cohort interval | Cohort sampling interval versus personal error; identical in both arms |
| 5 | T4: current form interaction | Defaults, missing inputs, invalid export suppression and recovery |

The primary cards precede diagnostics to avoid the latter teaching their answers. T3 is a protocol-authored card with the preserved H4 aggregate, not a new scientific result. T4 uses the pinned alpha.5 build and fictional values only. It tests current behavior in both arms and is not evidence of a historical/current UI improvement.

For each primary task, two human scorers independently assign comprehension **0/1/2**, decision **0/1/2** and a separate critical-interpretation flag using `tasks.json`. A 2 requires the complete listed boundary/action; a 1 is partial; a 0 is wrong or uninterpretable. No answer/timeout/semantic help is **missing**, not a known zero-risk response. Mere hesitation is not a critical interpretation. An explicit critical claim overrides contradictory reassurance: comprehension and decision cannot receive 2 on that task. Code ambiguous but noncritical statements as partial and document the ambiguity.

Primary event: at least one critical interpretation across T1/T2/T5. Decision success: decision score 2 on all three, with no critical interpretation. Full boundary explanation is recorded per task and across all three. T3 has its own comprehension score; T4 has comprehension plus four separate completion observations. Time, assistance, refusals and confidence are descriptive, not replacements for accuracy. Ask perceived usefulness on 1–5 only after all tasks; report it as a rating, not demonstrated benefit.

Strip arm labels, recruitment details and card text from the coding packet. Verbatim responses can still reveal wording; each scorer records suspected condition and why. A third human resolves disagreements before the coordinator releases the arm key. Report raw pre-adjudication agreement and disagreement categories. Agents can check arithmetic and formatting; they do not stand in for participants or the independent human assessment required here.

## Analysis and decision rules

Keep the unit of analysis the person. Forty people answering five questions is not 200 independent participants. Report allocation, completion, withdrawal, missingness and assistance denominators. An observed critical response makes the participant a known event even if another answer is missing. With no observed critical response but a missing primary task, the critical endpoint is unknown. A decision-success label requires a known noncritical primary endpoint. Decision success is unknown only if missing tasks could still change a pass/fail classification; an observed failure is already a failure. Do not erase interpretable pre-interruption answers unless consent is withdrawn.

Use two-sided 95% [Wilson intervals](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm) for rates and [Agresti–Caffo intervals](https://www.itl.nist.gov/div898/software/dataplot/refman1/auxillar/diffprop.htm) for independent differences. Label raw point differences separately from the adjusted centers used for those intervals. Report complete-case and all-randomized missingness bounds. For the scenario least favorable to R: unknown R critical outcomes count as critical, unknown H critical outcomes as noncritical; unknown R decision outcomes count as failure, unknown H decision outcomes as success. The aggregate helper implements that scenario. These are descriptive, model-based intervals, not representative population claims or multiplicity-adjusted confirmatory tests.

A **promising pilot signal** requires full planned enrollment, fulfilled quotas, completed adjudication, no more than 10% unknown on either endpoint in either arm, at least 80% full boundary explanations on each R primary task (unknown counts as not correct), and no recurring R critical interpretation. In addition, the least-favorable analysis must show both: critical reduction H−R at least 20 points with interval lower bound above zero; decision improvement R−H at least 10 points with lower bound above zero. These criteria justify further investigation only.

One explicit critical R interpretation triggers review of that wording. A critical interpretation on the same primary task in **two distinct R participants** pauses enrollment and blocks that wording pending repair; record all observations and restart only under a new version, never pool silently. If a participant starts applying a scenario as personal health guidance, interrupt and clarify immediately; mark subsequent affected answers as assisted/missing for unassisted endpoints. An actual distress or access problem also permits stopping. A stop overrides a numerical positive signal. No efficacy stopping or repeated looks to chase a favorable margin are allowed.

Insufficient enrollment/coverage/completeness or unresolved coding is **inconclusive**. Otherwise, missing a practical margin means **improvement not demonstrated**; report it even if users liked the wording. Neither result authorizes restoring historical prescriptive claims. No subgroup-benefit claims or physiological promotion are permitted. A later scoped review may assess H6 criterion 4 using actual results, including negative findings and consequent restrictions; no script or count automatically closes it.

## Freeze, review and run

The [lock](protocol-lock.json) pins this protocol's material bytes and source revisions. `check.mjs` verifies integrity and reports readiness separately from observations. Before recruitment, assign a study lead, facilitator/coordinator, two scorers and an adjudicator (roles may overlap except the separation rules above). Obtain an independent human review covering methods, task/rubric clarity, recruitment feasibility, accessible delivery and consent/retention. One suitably qualified reviewer may cover methods and accessibility; a code review is not that review. Record its date, scope, findings and acceptance in the private run manifest. Do not invent a reviewer or approval.

Record the merged protocol commit, lock hash, pinned runtime and allocation hash before enrollment. Any material change after the freeze gets a new protocol version, reason and timing relative to observations; preserve this version. No threshold may be tuned using observed results. The study lead resolves reviewer findings and records actual run readiness, rather than treating this document as evidence that a study has run.

```bash
node research/robustness/h6/check.mjs
node research/robustness/h6/packet.mjs --condition H
node research/robustness/h6/packet.mjs --condition R
# After review, only in private operator storage:
node research/robustness/h6/packet.mjs --allocation
```

For T4, use an isolated checkout of `3b82901a5350f3d966d98a0d8e2ea9837ee4b89b`, run `npm run build`, and serve its `dist/` locally. Record browser/device and any necessary accessible formatting. Never substitute moving live Pages without amending the pin. The neutral-task and consistent-facilitation choices draw on [moderated testing guidance](https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing); the study-specific sequence and thresholds are our judgments.

Publish only permission-cleared aggregates and non-identifying issue descriptions after withdrawal windows close. Suppress subgroup cells below five and do not publish verbatim quotes by default. Report what happened, deviations, missingness, limitations and non-improvement; retain the private trace needed to audit coding until its deletion date. **No health upload, recruitment message, session, calibration fit or human-review approval has occurred in preparing this package.**
