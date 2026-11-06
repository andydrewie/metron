# G2 · Reproducible resting-energy benchmark

## In 20 seconds

**The benchmark is an independent research instrument—not a new product feature.** It calculates prescribed RMR prediction errors and cohort-level bootstrap uncertainty using Metron's *existing* core equations, with the G1 protocol and source hash locked before analysis.

**Only synthetic fixtures run in tests.** The CLI's real-data path rejects every invocation without an explicit G3 flag, the immutable G1 merge commit and the exact authorized source SHA-256. **No measured energy results are published by G2.**

[Start with the research dashboard](https://github.com/andydrewie/metron/issues/9) · [G1 frozen protocol](./G1_FROZEN_PROTOCOL.md) · [Machine lock](./protocol.lock.json) · [G2 tracking issue](https://github.com/andydrewie/metron/issues/12)

## What it computes

\`\`\`text
Frozen G1 protocol + pinned Metron core + checked source data
                           |
                      CSV parsing
                 (real CSV; quoted headers)
                           |
             unique participant identity
                           |
            prespecified eligibility flow
                  /                 \
       eligible Mifflin        FFM-eligible paired
          observations           participants
             |                        |
       MAE, bias, RMSE          Same people in BOTH
       median, within-10%       Mifflin and Cunningham
                 \                /
                  Site-stratified
                 participant bootstrap
                           |
             Aggregate-only JSON and
              optional executive text
\`\`\`

**Interpretation:** Frozen source metadata and deterministic software tests protect reproducibility. They do not guarantee physiological accuracy. Unlike product \`TDEE\`, this benchmark evaluates only measured **resting energy expenditure**.

## Reproduce entirely offline

No external NPM dependencies, health accounts, wearable devices or real individual records required:

\`\`\`bash
node research/ree-validation/run.mjs --synthetic
node research/ree-validation/run.mjs --synthetic --format markdown
npm run ci
npm run release:check
\`\`\`

The fixture \`fixtures/synthetic-rmr.csv\` deliberately contains **five fictional participants**, including an age-missing row, an RMR-missing row and one person without valid FFM. Its known arithmetic: **three** primary-eligible cases; primary MAE **210 kcal/day**, positive mean bias **143.33 kcal/day**, paired Cunningham-minus-Mifflin MAE **+20.5 kcal/day**. **These are not human evidence.**

## Prespecified statistics

| Method | Implementation |
| --- | --- |
| Primary MAE | Mean absolute deviation of *predicted minus calorimetry-measured* RMR (kcal/day) |
| Bias, RMSE, median error, ±10% | Respect exactly the G1 definitions and observed-RMR denominator |
| Cunningham comparison | Same FFM-eligible participants under both equations; SECA BIA-estimated FFM caveat |
| Bootstrap | **5,000** replicates, **seed 20261106**, *Mulberry32-v1* PRNG, within-site participant resampling and fixed site sizes |
| Confidence intervals | 2.5th/97.5th percentile with (B−1)×q interpolation; cohort-level sampling uncertainty only |
| Subgroups | Site, recorded equation code, age, BMI, with N **below 30 suppressed** for numeric error metrics |
| Source and core | Git blob identity verifies G1 protocol and frozen core; real dataset must match G0/G1 SHA-256 |
| Record flow | Raw total, all independent field-invalid counts and one first-failure reason per excluded record |

**PRNG detail:** Mulberry32-v1 updates an unsigned 32-bit seed by adding \`0x6D2B79F5\` each draw, applies two bitwise/32-bit integer-multiply mixing rounds, and divides the resulting unsigned 32-bit word by \`2^32\`. G2 tests identical seeded results. A later change to PRNG must version the engine rather than silently alter confidence intervals.

## Privacy and execution boundary

The engine processes rows in volatile memory, hashes the input bytes and returns **only aggregate statistics, exclusion counts and named source-level provenance**. It does not output participant IDs, raw measurements or per-person errors. Its CLI prints a fixed-format error category rather than untrusted file/row content.

A later investigator may deliberately execute G3 with a locally available, properly licensed source file:

\`\`\`bash
node research/ree-validation/run.mjs --file /path/to/enable_data.tsv \\
  --execute-g3 \\
  --g1-commit 6028a80fb7070b354dec68feeb7153ce0a4cbef9
\`\`\`

**Do not run this G3 command as part of G2.** G3 must separately approve empirical analysis, verify source-specific permissions and inspect potential tiny cells or confidential metadata before making any resulting aggregates public. No live-data CI workflow or vendor integration is created here.

A successful synthetic benchmark verifies the engineering only, not external validity or effectiveness of the existing public fitness calculator.

## What's next, when the engineering gate passes?

[G3 · Evaluate actual measured resting metabolism](https://github.com/andydrewie/metron/issues/13), run from the locked code/parameters against the exact source hash, with scientific caveats and a separate discussion of population generalizability. Any departure from G1 is disclosed and versioned, never hidden.

[Source methods](https://doi.org/10.1152/ajpendo.00375.2025) · [Mifflin original](https://doi.org/10.1093/ajcn/51.2.241) · [Cunningham original](https://doi.org/10.1093/ajcn/33.11.2372) · [Frozen study contract](./protocol.v1.json).
