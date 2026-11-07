# G4 · Resting-model decision

**Current execution route:** [METRON-ROBUST-001](../robustness/README.md) and [ADR-0006](../../docs/adr/0006-durable-evidence-before-expansion.md) now place scope, evidence and measurement review before the next cohort. The G4 decision and evidence below remain the historical record.

## In 20 seconds

**Keep Mifflin–St Jeor as Metron's default and Cunningham as an explicit option.** G3 favors Cunningham in one cohort; independent studies show that performance depends on population and measurement method. Body-composition error can materially move its output. This is a provisional product decision, not proof that Mifflin is more accurate. Publish population and input-quality guidance, retain the frozen results, and require a separate replication protocol before reconsidering adoption.

---

Decision date **7 November 2026 (Asia/Taipei)** · Study **RMR-EXT-001**  
[ADR-0005](../../docs/adr/0005-retain-resting-default-pending-replication.md) · [G3 report](./G3_RESULTS.md) · [Dashboard #9](https://github.com/andydrewie/metron/issues/9) · [Issue #13](https://github.com/andydrewie/metron/issues/13)

## The decision and its cost

Retain the current `mifflin` default and user-selected `cunningham` option in model **0.1.0**. Add guidance in the science documentation explaining the evidence and body-composition limitations. The application checks whether body-fat input is numeric and in range; **it does not verify the device, measurement conditions, or accuracy of that input**. There is no new automatic selector or quality gate.

The strongest alternative is to make Cunningham the default whenever a body-fat value is present. That would favor the better-performing equation in G3 and some athlete studies. We decline it because a supplied number does not establish suitable measurement quality, and the available evidence does not establish a generalizable selection rule. The cost of retaining Mifflin is real: some users resembling populations where it underpredicts may receive a poorer estimate. Explicit Cunningham selection remains available; neither choice guarantees individual accuracy.

**The evidence does not establish that Mifflin is universally preferable.** Retention is a conservative deployment judgment under incomplete transportability evidence. It is not a statistical conclusion that the two models are equivalent.

## What G3 establishes

On the same **454 eligible adults**, Mifflin MAE was **165.7 kcal/day** and Cunningham MAE **129.5**, with paired Cunningham-minus-Mifflin difference **−36.2** (95% bootstrap interval **−49.5 to −22.6**). Cunningham also had lower RMSE and a higher fraction within ±10%. Those findings are preserved, including Mifflin's **−134.7 kcal/day** mean bias. Keeping the default must not conceal this counterevidence.

The uncertainty interval concerns the cohort's paired mean absolute-error difference. It does not cover individual errors or transport to another population. The source's FFM was estimated by SECA 515 bioimpedance. Its two sites are part of one source, not two independent replications of the product decision.

The frozen subgroup outputs describe **Mifflin**, not paired Cunningham-versus-Mifflin effects in every subgroup. They cannot establish that Cunningham wins in each sex, age or BMI group. We did not reopen the participant data or run post-result subgroup selection in G4. Mifflin MAE varied from **148.0** at Freising to **225.8** at Nuremberg; the latter population is much older. These descriptions cannot isolate age, site or measurement effects. See the G3 report for counts and intervals.

## Independent evidence and counterevidence

This is a **targeted evidence review**, not a systematic review or a new meta-analysis. Searches through 7 November 2026 sought primary RMR validation studies, contrary findings, and body-composition measurement validation. The table separates published observations from our interpretation. Only G3 was reanalysed by Metron; the external study results below are author-reported. Different methods, populations and error metrics prevent a pooled ranking.

| Primary source and population | Relevant observation | Implication and limit |
| --- | --- | --- |
| [ten Haaf & Weijs, 2014](https://doi.org/10.1371/journal.pone.0108460): 90 Dutch recreational athletes, 18–35; calorimetry and air-displacement body composition | Cunningham predictions were within ±10% for 84.9% of men and 78.4% of women; Mifflin was below 50%. | Strong reason to retain Cunningham as an option. Young athletes and laboratory body composition do not represent all users. Minimum fasting was four hours; preparation limits matter. |
| [Weijs, 2008](https://pubmed.ncbi.nlm.nih.gov/18842782/): 338 US and 208 Dutch adults, ages 18–65, BMI 25–40 | Mifflin performed best in the US sample among the tested equations: 79% within ±10%, bias −1.0%, RMSE 136 kcal/day. Different equations led in Dutch subgroups. | Supports Mifflin as a defensible baseline, while demonstrating population dependence. These are author-reported results from the abstract, not our head-to-head reanalysis or a universal ranking. |
| [Tinsley et al., 2019](https://doi.org/10.1139/apnm-2018-0412): 27 muscular physique athletes; DXA and reference indirect calorimetry | Most existing equations tended to underpredict. The authors considered Cunningham (1980) and ten Haaf potentially acceptable; their new equations required further external validation. | Supports an option for muscular populations, with small-sample and individual-error limits. Findings are abstract-level; we did not reconstruct unreported subgroup metrics. |
| [Sordi et al., 2024](https://doi.org/10.3390/ijerph21070891): 65 cross-training participants; InBody 570 composition and FitMate PRO calorimetry | Cunningham was among the most discrepant equations. Table 1 gives `500 + 22 × FFM`, matching Metron, although the paper labels it 1991. | Counterevidence to universal Cunningham superiority, not proof Mifflin is better: Mifflin was not tested. FitMate assumes respiratory quotient 0.85 and FFM is BIA-derived, so reference/input differences limit comparison. |
| [Siedler et al., 2023; online 2022](https://doi.org/10.1017/S0007114522003749): 73 adults, 15 BIA devices against a four-compartment reference; 37 longitudinal returnees | Device-level body-fat constant errors ranged from −3.5 to +11.7 percentage points; cross-sectional SEE ranged 3.1–7.5 points. Repeatability could be high despite disagreement. | Input quality is device- and population-specific. This study does not quantify the error of enable's SECA measurements or every consumer device. Repeated readings alone do not establish accuracy. |

**Interpretation:** evidence favoring Cunningham is meaningful, but heterogeneous. Evidence supporting Mifflin in other adults is also meaningful. A device-validation result cannot be transplanted as a probability distribution for G3's FFM error. This review supports conditional guidance and replication, not a universal winner or a cohort-derived correction factor.

## How body-fat input changes Cunningham

For fixed body weight `W` in kg and body-fat percentage `b`:

```text
FFM = W × (1 − b/100)
RMR = 500 + 22 × FFM
ΔRMR = 22 × ΔFFM = −0.22 × W × Δb
```

`Δb` is in **percentage points**, not relative percent. Overestimating body fat lowers the estimate; underestimating it raises the estimate. The following are exact synthetic output sensitivities, holding weight fixed. They are not observations, prediction intervals or estimates of anyone's device error.

| Synthetic weight | Output shift magnitude for 1 point | For 3 points | For 5 points |
| --- | ---: | ---: | ---: |
| 60 kg | 13.2 kcal/day | 39.6 | 66.0 |
| 80 kg | 17.6 kcal/day | 52.8 | 88.0 |
| 100 kg | 22.0 kcal/day | 66.0 | 110.0 |
| 120 kg | 26.4 kcal/day | 79.2 | 132.0 |

These shifts are comparable to, or larger than, G3's **36.2 kcal/day cohort MAE advantage**, but that comparison is only a scale illustration. **An output shift is not a change in MAE.** Depending on its direction and correlation with the existing residual, measurement error can offset or worsen equation error. We have not established a body-fat-error cutoff that cancels Cunningham's advantage. Weight error and correlated measurement errors are also outside this fixed-weight illustration.

Reproduce the table without participant data or dependencies:

```bash
node --input-type=module <<'JS'
import {cunninghamRmr, fatFreeMassKg} from './core/model.js';
for (const weightKg of [60, 80, 100, 120]) {
  const base = cunninghamRmr(fatFreeMassKg({weightKg, bodyFatPercent: 25}));
  console.log(weightKg, [1, 3, 5].map(points => {
    const shifted = cunninghamRmr(fatFreeMassKg({weightKg, bodyFatPercent: 25 + points}));
    const delta = shifted - base;
    if (Math.abs(delta + 0.22 * weightKg * points) > 1e-9) throw Error('Mismatch');
    return Number(Math.abs(delta).toFixed(1));
  }));
}
JS
```

## Guidance supported now

- **Unknown or poorly characterized body composition:** Mifflin avoids adding that input requirement. This is a practical reason, not a guarantee it is more accurate.
- **Documented body-composition measurement and a relevant population:** Cunningham is a reasonable explicit comparison, with its own limitations. A body-fat value alone does not make it a correction to Mifflin.
- **Older adults, unusual body composition, or populations unlike those studied:** retain visible uncertainty; do not assign a subgroup-specific winner from the G3 overall average.
- **All users:** RMR/REE is a resting component. This work does not validate Metron's TDEE, workout estimates, readiness rules, calorie allowance, or individual nutrition targets.

The evidence does not justify adding the G3 mean bias to every Mifflin prediction, averaging the equations to appear more precise, tuning coefficients on the benchmark, or choosing an equation by whichever result looks preferable.

## Reversal conditions and the next executable investigation

Reconsider the default or a population-specific selector when a separately frozen evaluation on a relevant independent cohort shows a useful paired advantage, with uncertainty and subgroup harms examined, using body-composition methods realistically available to the intended users. Specify practical decision margins and harm criteria **before** that new evaluation; do not derive a success threshold from G3's observed difference. New coefficients would additionally require training/validation separation and an untouched test horizon. Review the evidence and migration effects before a versioned change.

**Next: qualify ten Haaf & Weijs Dataset S1 for independent cohort reanalysis.** Its publisher describes an SPSS `.sav` supplement with measured REE and equation inputs ([dataset DOI](https://doi.org/10.1371/journal.pone.0108460.s001)). File-level rights, bytes, codebook, equation-sex mapping and independence must be verified before admission. It is a candidate, not a completed replication. Its published findings are already known; any protocol must disclose that fact. The new ten Haaf equations were developed in that cohort and cannot be independently validated there.

No new participant file was downloaded or analysed for G4. The original protocol, source pins, G3 aggregates, production equations, schemas, package/model versions and V4.1 UI are preserved. This report closes the **decision gate**, not the scientific question of universal or individual accuracy.
