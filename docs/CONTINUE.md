# Continue Metron in a new chat

**Read current main before relying on a shared conversation.** This is the stable recovery route; [plan.json](../research/robustness/plan.json) owns gate status and the next task. The checkpoint below is dated **9 November 2026** and may be superseded.

Copy this into a new chat, optionally alongside the shared conversation link:

> Continue Metron from https://github.com/andydrewie/metron/blob/main/docs/CONTINUE.md. Read current main, AGENTS.md, the robustness plan and linked evidence. Verify the checkpoint and execute the next authorized task. Preserve the distinction between completed research reviews and unvalidated clinical or decision claims. If the chat link cannot be read, recover from the repository and identify missing private context.

## Verified checkpoint

G0–G4 remain complete for one external resting-equation study. G3 analyzed 454 paired participants; G4 retained Mifflin as default with Cunningham optional. These findings do not validate combined TDEE, readiness or individual targets.

H0 and [H1](../research/robustness/H1_INVENTORY.md) are complete for their finite inventories: 35 claim families, 48 primary snapshot surfaces, 23 contexts and 805 cells. **[H2-A](../research/robustness/h2a/README.md) is complete as a targeted readiness evidence review**, with 13 source records and 30 queries. It found no direct validation for the exact readiness algorithm in its bounded search. Clinical applicability remains unreviewed. Proposed H5 wording changes have not shipped.

**[H2-B](../research/robustness/h2b/README.md) is complete for nine claim families**, with 14 published source records and 32 queries. Equation variants and unresolved Weijs/Kfir discrepancies are explicit. G0–G4, the provisional default and production behavior remain unchanged. Broad clinical applicability is still unreviewed.

**Next: H2-C, measurement and source semantics**, as specified in [the review queue](../research/robustness/h2-review-queue.json). Whole H2 remains in progress. H3 and H7 are separately unblocked; H5 still follows its H2/H3 prerequisites. Athlete data admission remains deferred to H4 and a separate frozen protocol.

## Recover and act

1. Check latest `main`, open [tracker #22](https://github.com/andydrewie/metron/issues/22) and existing PRs before creating work.
2. Read [AGENTS](../AGENTS.md), [collaboration rules](./COLLABORATION.md), [manifest](../metron.manifest.json), [navigation](./navigation.json) and [decisions](./adr/index.json).
3. Read the plan, relevant claim/context entries and actual review sources. A bounded review overlay is not clinical clearance.
4. Run the audit using today's date. H2-A's next operational review is 5 February 2027; H2-B's is 7 February 2027. Review earlier upon consequential reuse, source corrections or contrary evidence.
5. Use a scoped PR, run required checks and inspect review findings. Update the plan, checkpoint and tracker after completion.

```bash
node research/robustness/audit.mjs --as-of YYYY-MM-DD
node research/robustness/inspect.mjs --claim C15 --context general-adult
npm run ci
npm run release:check
```

Research reuse through at least 7 November 2027 is independently valuable, including if the app is rebuilt. It is a maintenance objective, not guaranteed currency; no background monitor is installed. Keep disease, life stage, function, treatment, measurement and model failure distinct. Preserve contrary evidence and unknowns. Do not reopen G0–G4 or change production formulas through a status update.

Private email/account history stays in the private handoff. Independent reconstruction remains H8 work; perfect chat memory or shared-link accessibility is not assumed.
