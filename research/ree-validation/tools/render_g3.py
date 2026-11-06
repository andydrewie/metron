#!/usr/bin/env python3
"""Render public aggregate figures; optional Matplotlib, never participant input."""
import json
from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

BASE = Path(__file__).resolve().parents[1]
RESULT = json.loads((BASE / "results/g3-enable-v1.json").read_text())
OUT = BASE / "figures"
OUT.mkdir(exist_ok=True)
plt.rcParams.update({
    "font.family": "DejaVu Sans", "font.size": 11, "axes.labelcolor": "#252A30",
    "text.color": "#252A30", "axes.edgecolor": "#C9CED3",
    "svg.fonttype": "none", "svg.hashsalt": "metron-g3-v1",
})


def save(fig, name):
    fig.savefig(OUT / (name + ".svg"), metadata={"Date": None}, facecolor="white")
    fig.savefig(OUT / (name + ".png"), dpi=180, facecolor="white")
    plt.close(fig)


p = RESULT["paired"]
fig, ax = plt.subplots(figsize=(10.6, 5.5))
fig.subplots_adjust(left=.22, right=.93, top=.76, bottom=.33)
labels = ["Mifflin–St Jeor", "Cunningham"]
values = [p["mifflin"]["mae"], p["cunningham"]["mae"]]
ax.barh([1, 0], values, color=["#0072B2", "#B45309"], height=.48)
ax.set_yticks([1, 0], labels)
ax.set_xlim(0, 220)
ax.set_xlabel("Mean absolute RMR error · kcal/day · lower is better", labelpad=10)
ax.set_axisbelow(True)
ax.grid(axis="x", color="#E6E9EC")
ax.spines[["top", "right", "left"]].set_visible(False)
ax.tick_params(axis="y", length=0, pad=12)
for y, value in zip([1, 0], values):
    ax.text(value + 4, y, f"{value:.1f}", va="center", weight="bold", fontsize=13)
fig.text(.06, .93, "Resting-energy error in the enable cohort", size=20, weight="bold")
fig.text(.06, .86, "Same 454 participants under both fixed equations · no refitting", size=12)
ci = p["ci95"]["pairedMaeDelta"]
fig.text(.06, .18, f"Paired difference (Cunningham − Mifflin): {p['cunninghamMinusMifflinMae']:.1f} kcal/day",
         size=12, weight="bold")
fig.text(.06, .12, f"95% bootstrap CI: {ci['lower']:.1f} to {ci['upper']:.1f} kcal/day. Bars show point estimates.", size=11)
fig.text(.06, .04, "Single-cohort result; BIA-estimated FFM. Does not validate TDEE or individual calorie targets.", size=10)
save(fig, "g3-equations")

fig, ax = plt.subplots(figsize=(10.6, 8.2))
fig.subplots_adjust(left=.30, right=.94, top=.80, bottom=.18)
labels, positions, y = [], [], 0
title = {"Site": "Site", "equationSex": "Equation sex", "ageYears": "Age", "BMI": "BMI"}
for dim, groups in RESULT["subgroups"].items():
    for label, g in groups.items():
        labels.append(f"{title[dim]}: {label}  (n={g['n']})")
        positions.append(y)
        if g["metrics"] is not None:
            value, bounds = g["metrics"]["mae"], g["ci95"]["mae"]
            ax.errorbar(value, y, xerr=[[value-bounds["lower"]], [bounds["upper"]-value]],
                        fmt="o", color="#0072B2", capsize=4, markersize=6, lw=1.6)
            ax.text(295, y, f"{value:.1f}", va="center", ha="right", size=10)
        else:
            ax.text(10, y, "Suppressed: n < 30", va="center", size=10)
        y += 1
    y += .55
ax.set_yticks(positions, labels)
ax.invert_yaxis()
ax.set_xlim(0, 305)
ax.set_xlabel("Mifflin mean absolute RMR error · kcal/day", labelpad=12)
ax.axvline(RESULT["primary"]["summary"]["mae"], color="#586674", ls="--", lw=1)
ax.grid(axis="x", color="#E6E9EC")
ax.set_axisbelow(True)
ax.spines[["top", "right", "left"]].set_visible(False)
ax.tick_params(axis="y", length=0, pad=12)
fig.text(.06, .94, "Error varies across this cohort", size=21, weight="bold")
fig.text(.06, .885, "Prespecified descriptive subgroups · dots are MAE; lines are 95% bootstrap intervals", size=11)
fig.text(.06, .075, "Dashed line: overall MAE 165.7 kcal/day. Groups overlap across dimensions; no causal claims.", size=10)
fig.text(.06, .035, "Fixed site shares; 5,000 participant resamples. Intervals are for cohort metrics, not individuals.", size=10)
save(fig, "g3-subgroups")
