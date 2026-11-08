# H4 · Independent resting-equation replication

**Cunningham has lower error in this selected cohort; retain the general default and explicit alternative.** The frozen practical-margin criterion passed for 89 eligible participants. One record was excluded under the pre-existing body-fat input bound through a transparent amendment before aggregate errors were inspected. This does not validate TDEE, clinical use, personal intervals or dietary targets.

| Group | N | Mifflin MAE | Cunningham MAE | Paired difference, 95% sampling interval |
| --- | ---: | ---: | ---: | --- |
| all | 89 | 213.9 | 109.3 | -104.5 [-127.5, -80.1] |
| female | 37 | 191.1 | 107.6 | -83.6 [-116.7, -48.0] |
| male | 52 | 230.0 | 110.6 | -119.5 [-149.9, -86.7] |

All error values are kcal/day. Difference is Cunningham minus Mifflin; negative favors Cunningham. These are 20,000 paired row-bootstrap percentile intervals for cohort statistics, not personal prediction ranges. Both prespecified equation-sex groups meet the frozen no-harm margin. No coefficients were fitted or selected after analysis.

The [machine results](results.json) include signed bias, RMSE, within-10% fractions and paired intervals, descriptive agreement limits, all-90-record equation-only sensitivity and an explicit reproduction check. Supplied FFM and BF-derived FFM differ by at most 0.004583 kg. Separate Python and JavaScript calculations agree within 1e-9 kcal for every prediction and aggregate. Both were written by the same analyst, not independently reviewed personnel.

Read [admission](admission.json), [original protocol](protocol.v1.json), [amendment](AMENDMENT.md), and [active frozen protocol](protocol.v1.1.json). The first run stopped without results. The original freeze is `da1669b1cb813fb68ebd843654023f597336d14b`; the amendment freeze is `d5250bec8bfa29157c7e6eb0dd0a0a271750b561`. Published outcomes were already known: this is retrospective replication, not unseen confirmation. The source's reference-unit label conflict and preparation limitations remain in admission.

Reproduction requires a lawful local copy of [ten Haaf and Weijs Dataset S1](https://doi.org/10.1371/journal.pone.0108460.s001), matching the pinned SHA-256. Install the isolated parser versions from `requirements.txt`, then run:

```bash
python research/robustness/h4/analyze.py --source /private/path/source.sav --output /tmp/h4-results.json
```

The supplied file, intermediate rows and per-person predictions are not committed. The JS subprocess exchanges numeric records privately with Python; terminal and repository results are aggregates only. Source data remain attributed to ten Haaf and Weijs under the publisher's terms, separate from Metron's MIT code.

**Decision v1:** retain Mifflin as the general default and Cunningham as an inspectable option, consistent with ADR-0005. This selected athletic sample strengthens the case for the alternative under comparable body-composition conditions but does not establish universal superiority. A broader default change needs relevant independent populations, measurement-quality analysis and prespecified benefit/harm criteria. The original G0–G4 artifacts remain byte-identical; their historical next-task wording is not current program state.

**TDEE track: no-go for an accuracy claim.** Neither this source nor the earlier cohort measures the implemented daily total. Reviewed DLW literature does not supply the matching activity/membership inputs required to validate Metron's complete calculation, and governed data are not automatically licensed for reuse. Define and admit a matching reference before any such claim. Clinical applicability remains unreviewed.
