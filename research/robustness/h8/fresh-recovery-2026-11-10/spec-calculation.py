"""Bounded, synthetic arithmetic from docs/SCIENCE.md, checked against the CLI.

This fresh-context investigator had inspected the repository's existing H8 rebuild
and core while navigating. This is a new direct transcription of the documented
equations, not a blinded replication or independent physiological validation.
"""
import copy
import hashlib
import json
import pathlib
import subprocess
from decimal import Decimal as D

ROOT = pathlib.Path(__file__).resolve().parents[4]
SPECIFICATION_SOURCE_COMMIT = "16ceef3fb8e8a3bbcca9938d0d8331d7ba9c416f"
REFERENCE_CORE_GIT_BLOB = "d36da7246aabbad91b92debb2a52011468a39ebb"


def verify_reference_core():
    source = (ROOT / "core/model.js").read_bytes()
    identity = hashlib.sha1(b"blob " + str(len(source)).encode() + b"\0" + source).hexdigest()
    if identity != REFERENCE_CORE_GIT_BLOB:
        raise SystemExit("Refusing replay: core/model.js differs from the pinned reference core.")
    return identity


def documented_energy(profile, activity):
    weight = D(str(profile["weightKg"]))
    height = D(str(profile["heightCm"]))
    age = D(str(profile["ageYears"]))
    if activity["restingModel"] == "mifflin":
        offset = D(5) if profile["equationSex"] == "male" else D(-161)
        resting = D(10) * weight + D("6.25") * height - D(5) * age + offset
    else:
        fat_free_mass = weight * (D(1) - D(str(profile["bodyFatPercent"])) / D(100))
        resting = D(500) + D(22) * fat_free_mass
    baseline = D("1.2") * resting
    extra_steps = max(D(0), D(str(activity["steps"])) - D(2000))
    distance = extra_steps * D("0.415") * height / D(100) / D(1000)
    walking = D("0.5") * weight * distance
    hours = D(str(activity["workoutMinutes"])) / D(60)
    met = {"light": D("2.5"), "typical": D("3.5"), "hard": D(5)}[activity["intensity"]]
    gross = met * weight * hours
    baseline_in_session = baseline / D(24) * hours
    workout = max(D(0), gross - baseline_in_session)
    return {"restingKcal": resting, "baselineKcal": baseline,
            "incrementalWalkingKm": distance, "walkingKcal": walking,
            "gymGrossKcal": gross, "gymBaselineKcal": baseline_in_session,
            "workoutKcal": workout, "estimatedTdeeKcal": baseline + walking + workout}


verified_core_identity = verify_reference_core()
profile = {"weightKg": 80, "heightCm": 175, "ageYears": 30,
           "equationSex": "male", "bodyFatPercent": None}
activity = {"steps": 10000, "workoutMinutes": 60, "intensity": "typical", "restingModel": "mifflin"}
cases = [
    {"id": "documented-example", "profile": profile, "activity": activity},
    {"id": "zero-step-no-workout", "profile": profile,
     "activity": {**activity, "steps": 0, "workoutMinutes": 0}},
    {"id": "baseline-step-no-workout", "profile": profile,
     "activity": {**activity, "steps": 2000, "workoutMinutes": 0}},
    {"id": "explicit-cunningham", "profile": {**profile, "bodyFatPercent": 20},
     "activity": {**activity, "restingModel": "cunningham"}},
]
records = []
maximum_difference = 0.0
for case in cases:
    expected = documented_energy(case["profile"], case["activity"])
    input_record = {"profile": copy.deepcopy(case["profile"]), "activity": copy.deepcopy(case["activity"])}
    process = subprocess.run(["node", "bin/metron.mjs"], input=json.dumps(input_record),
                             text=True, capture_output=True, cwd=ROOT, check=True)
    actual = json.loads(process.stdout)["energy"]
    compared = {**actual["components"], "estimatedTdeeKcal": actual["estimatedTdeeKcal"],
                "restingKcal": actual["derived"]["restingKcal"],
                "incrementalWalkingKm": actual["derived"]["incrementalWalkingKm"]}
    deltas = {key: abs(float(expected[key]) - value) for key, value in compared.items()}
    maximum_difference = max(maximum_difference, *deltas.values())
    assert max(deltas.values()) < 1e-9, deltas
    records.append({"id": case["id"], "input": input_record,
                    "specificationDecimal": {key: str(value) for key, value in expected.items()},
                    "reference": compared, "absoluteDifferences": deltas,
                    "referenceWarnings": actual["warnings"]})
assert records[1]["reference"]["estimatedTdeeKcal"] == records[2]["reference"]["estimatedTdeeKcal"]
print(json.dumps({"status": "passed", "specificationSourceCommit": SPECIFICATION_SOURCE_COMMIT,
                  "referenceCoreGitBlob": verified_core_identity,
                  "referenceIdentityVerified": True,
                  "specifications": ["docs/SCIENCE.md", "docs/API.md"],
                  "scope": "Four valid synthetic energy cases; no empirical accuracy, uncertainty or readiness validation.",
                  "priorCodeExposure": "Existing H8 rebuild and core inspected during repository navigation; not blinded.",
                  "maximumDifferenceKcal": maximum_difference, "cases": records}, indent=2))
