# Continue Metron in a new chat

**Read the current repository before relying on a shared conversation.** This page provides a stable recovery route; [the execution plan](../research/robustness/plan.json) owns current gate and next-task status. A chat is supporting context, not the only copy of the project's decisions or evidence.

Copy this into a new chat, optionally alongside the shared conversation link:

> Continue Metron from https://github.com/andydrewie/metron/blob/main/docs/CONTINUE.md. Read current main, AGENTS.md, the robustness plan and the linked evidence. Tell me the verified checkpoint and execute the next authorized task. Preserve the distinction between completed mapping and unreviewed clinical evidence. If the chat link cannot be read, use the repository and identify any private context you still lack.

## Checkpoint: 7 November 2026

G0–G4 are complete for the limited external resting-equation study. G3 analyzed 454 paired participants; G4 retained Mifflin as default with Cunningham optional. That does not validate combined TDEE, readiness, clinical use or individual predictions.

H0 and **H1 are complete at their documented scope**. [H1](../research/robustness/H1_INVENTORY.md) reconciles 35 claim families, 48 primary surfaces, 23 contexts and 805 cells. Clinical evidence is unreviewed. The next task is **H2-A, readiness/action evidence and boundaries**, defined in [the queue](../research/robustness/h2-review-queue.json). H3 measurement work and H7 software work are also unblocked by H1; the plan governs dependencies. The athlete candidate is deferred to H4 after applicable prerequisites and a separate frozen protocol.

## Recover in this order

1. Check the latest `main` commit and open [tracker #22](https://github.com/andydrewie/metron/issues/22), issues and PRs. This dated checkpoint may be superseded.
2. Read [AGENTS.md](../AGENTS.md), [collaboration rules](./COLLABORATION.md), [manifest](../metron.manifest.json), [navigation](./navigation.json) and [decision index](./adr/index.json).
3. Read `research/robustness/plan.json` for status, dependencies, weakness owners and `nextTask`; then the H1 report and the relevant claim/context/source records.
4. Run the offline audit with today's date and the lookup command below. Read warnings as pending review work, not automatic evidence invalidation or proof of freshness.
5. Use a scoped branch and PR for consequential work. Run required checks, inspect the automated review, and update this checkpoint and tracker when the work is actually complete.

```bash
node research/robustness/audit.mjs --as-of YYYY-MM-DD
node research/robustness/inspect.mjs
node research/robustness/inspect.mjs --claim C15 --context general-adult
npm run ci
npm run release:check
```

## Preserve these decisions

Research is a primary deliverable. Its relevance and navigability through at least 7 November 2027 matter even if the application is rebuilt. That is a maintenance objective, not guaranteed future currency. No background literature monitor is installed.

Keep disease, life stage, function, treatment, measurement and model failure separate. Preserve uncertainty, contrary evidence, source rights and unreviewed cells. Do not reopen or tune G0–G4, change production formulas, introduce a clinical selector or analyze a new dataset merely because a mapping gate passed. Current package/model versions remain `0.2.0-alpha.3` / `0.1.0`.

Private email/account history is intentionally absent from this public repository. A private handoff can supplement it. This entrypoint makes recovery practical; independent reconstruction is still an open H8 test, and no chat service's perfect memory or link accessibility is assumed.
