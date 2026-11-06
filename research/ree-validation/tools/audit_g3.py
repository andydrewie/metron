#!/usr/bin/env python3
"""Independent stdlib arithmetic audit of the frozen G3 report.

No model code is imported. Source bytes are pinned before CSV parsing.
Only fixed aggregate verification metadata is printed; never records or IDs.
Usage: python3 tools/audit_g3.py --file PATH --report AGGREGATE_JSON
"""
import argparse
import csv
import hashlib
import io
import json
import math
import statistics
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SOURCE_SHA = "d91d7c609de5b90b7282afc36071c67cdbf8f7362f8d6fae82126f93c8d8ba61"
PROTOCOL_BLOB = "2a40beada8abfec0c778e1c64da256836ed735db"
MODEL_BLOB = "228a8032b503f37d7b90b421f425b2225143226d"
KEYS = ("mae", "bias", "rmse", "medianAbsError", "within10Percent")
TOLERANCE = 1e-8
REPLICATES = 5000
SEED = 20261106


def require(condition):
    if not condition:
        raise ValueError("aggregate audit mismatch")


def blob_hash(path):
    data = path.read_bytes()
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()


def quantile(values, q):
    values = sorted(values)
    x = (len(values) - 1) * q
    low, high = math.floor(x), math.ceil(x)
    return values[low] + (values[high] - values[low]) * (x - low)


def summarize(rows, model=0):
    errors = [r["errors"][model] for r in rows]
    absolute = [abs(x) for x in errors]
    n = len(rows)
    return {
        "n": n,
        "mae": sum(absolute) / n,
        "bias": sum(errors) / n,
        "rmse": math.sqrt(sum(x * x for x in errors) / n),
        "medianAbsError": statistics.median(absolute),
        "within10Percent": sum(abs(e) / r["reference"] <= .10
                               for e, r in zip(errors, rows)) * 100 / n,
    }


def random_values(seed):
    mask = 0xFFFFFFFF
    state = seed
    while True:
        state = (state + 0x6D2B79F5) & mask
        x = ((state ^ (state >> 15)) * (state | 1)) & mask
        x ^= (x + (((x ^ (x >> 7)) * (x | 61)) & mask)) & mask
        yield ((x ^ (x >> 14)) & mask) / 4294967296


def intervals(rows, paired=False):
    strata = [[r for r in rows if r["site"] == site]
              for site in sorted({r["site"] for r in rows})]
    rng = random_values(SEED)
    samples = {k: [] for k in KEYS}
    if paired:
        samples["pairedMaeDelta"] = []
    for _ in range(REPLICATES):
        draw = [group[math.floor(next(rng) * len(group))]
                for group in strata for _ in group]
        stats = summarize(draw)
        for k in KEYS:
            samples[k].append(stats[k])
        if paired:
            samples["pairedMaeDelta"].append(summarize(draw, 1)["mae"] - stats["mae"])
    return {k: {"lower": quantile(v, .025), "upper": quantile(v, .975)}
            for k, v in samples.items()}


def compare(actual, expected):
    if isinstance(expected, dict):
        require(actual.keys() == expected.keys())
        for key in expected:
            compare(actual[key], expected[key])
    elif isinstance(expected, (int, float)):
        require(math.isfinite(actual) and abs(actual - expected) <= TOLERANCE)
    else:
        require(actual == expected)


def number(value):
    # The pinned file uses finite decimal-dot fields. Refuse ambiguous grammar.
    text = value.strip()
    if text.lower() in ("", "na", "n/a", "null", "nan", "missing", "none", "-"):
        return None
    try:
        x = float(text)
        return x if math.isfinite(x) else None
    except ValueError:
        return None


def main():
    args = argparse.ArgumentParser()
    args.add_argument("--file", required=True)
    args.add_argument("--report", required=True)
    options = args.parse_args()
    require(blob_hash(ROOT / "research/ree-validation/protocol.v1.json") == PROTOCOL_BLOB)
    require(blob_hash(ROOT / "core/model.js") == MODEL_BLOB)
    data = Path(options.file).read_bytes()
    require(len(data) <= 1_000_000 and hashlib.sha256(data).hexdigest() == SOURCE_SHA)
    report = json.loads(Path(options.report).read_text())
    require(report["sourceSha256"] == SOURCE_SHA)
    raw = list(csv.DictReader(io.StringIO(data.decode("utf-8-sig")), strict=True))
    ids = [r["Probanden-ID"].strip() for r in raw]
    require(all(ids) and len(set(ids)) == len(ids))
    counts = {k: 0 for k in ("sex", "age", "height", "weight", "reference")}
    multi = dict(counts)
    accepted, paired = [], []
    quality = {k: {"available": 0, "invalidOrMissing": 0} for k in
               ("SEX", "Alter, Jahre", "GROESSE, cm", "GEWICHt_SECA, kg", "RMR.KJ", "FFM_SECA,kg")}
    fields = dict(zip(counts, quality))
    for row in raw:
        sex = {"männlich": "male", "weiblich": "female"}.get(row["SEX"].strip())
        age, height, weight, ref, ffm = [number(row[k]) for k in
            ("Alter, Jahre", "GROESSE, cm", "GEWICHt_SECA, kg", "RMR.KJ", "FFM_SECA,kg")]
        good = {
            "sex": sex is not None, "age": age is not None and 18 <= age <= 105,
            "height": height is not None and 100 <= height <= 250,
            "weight": weight is not None and 25 <= weight <= 350,
            "reference": ref is not None and ref > 0,
        }
        valid_ffm = ffm is not None and weight is not None and 5 <= ffm <= 150 and ffm <= weight
        for k, valid in good.items():
            multi[k] += not valid
            quality[fields[k]]["available" if valid else "invalidOrMissing"] += 1
        quality["FFM_SECA,kg"]["available" if valid_ffm else "invalidOrMissing"] += 1
        failed = next((k for k, valid in good.items() if not valid), None)
        if failed:
            counts[failed] += 1
            continue
        reference = ref / 4.184
        predicted = 10 * weight + 6.25 * height - 5 * age + (5 if sex == "male" else -161)
        item = {"site": row["Site"].strip(), "sex": sex, "age": age,
                "bmi": weight / (height / 100) ** 2, "reference": reference,
                "errors": [predicted - reference, 500 + 22 * ffm - reference if valid_ffm else None]}
        require(item["site"] in ("freising", "nuernber"))
        accepted.append(item)
        if valid_ffm:
            paired.append(item)
    flow = {"rawRows": len(raw), "excludedByFirstReason": counts, "invalidByReason": multi,
            "eligible": len(accepted), "pairedEligible": len(paired),
            "pairedExcludedForFfm": len(accepted) - len(paired), "unknownSiteParticipants": 0}
    compare(flow, report["cohortFlow"])
    compare(quality, report["fieldQuality"])
    compare(summarize(accepted), report["primary"]["summary"])
    compare(intervals(accepted), report["primary"]["ci95"])
    compare(summarize(paired), report["paired"]["mifflin"])
    compare(summarize(paired, 1), report["paired"]["cunningham"])
    compare(summarize(paired, 1)["mae"] - summarize(paired)["mae"],
            report["paired"]["cunninghamMinusMifflinMae"])
    compare(intervals(paired, paired=True), report["paired"]["ci95"])
    groups = 0
    for dim, entries in report["subgroups"].items():
        for label, result in entries.items():
            def belongs(r):
                if dim == "Site": return r["site"] == label
                if dim == "equationSex": return r["sex"] == label
                if dim == "ageYears":
                    return ("18-39" if r["age"] < 40 else "40-59" if r["age"] < 60 else "60-105") == label
                return ("<25" if r["bmi"] < 25 else "25-<30" if r["bmi"] < 30 else ">=30") == label
            subset = [r for r in accepted if belongs(r)]
            require(len(subset) == result["n"])
            if len(subset) < 30:
                require(result["metrics"] is None and result["ci95"] is None)
            else:
                compare(summarize(subset), result["metrics"])
                compare(intervals(subset), result["ci95"])
            groups += 1
    age_subset = [r for r in accepted if 19 <= r["age"] <= 78]
    compare(summarize(age_subset), report["age19To78Sensitivity"]["metrics"])
    compare(intervals(age_subset), report["age19To78Sensitivity"]["ci95"])
    print(json.dumps({
        "status": "passed", "audit": "independent-python-stdlib-implementation",
        "sourceSha256": SOURCE_SHA, "reportSha256": hashlib.sha256(Path(options.report).read_bytes()).hexdigest(),
        "eligible": len(accepted), "pairedEligible": len(paired),
        "subgroupsAudited": groups, "pointMetricsAndAllReportedIntervals": "matched",
        "absoluteTolerance": TOLERANCE, "replicates": REPLICATES, "seed": SEED,
        "methodChanged": False, "participantRecordsExported": False,
        "scope": "Independent calculation, not independent-person review or new-cohort replication."
    }, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception:
        print('{"status":"failed","error":"aggregate-audit-verification-failure","noRowsExported":true}',
              file=sys.stderr)
        sys.exit(2)
