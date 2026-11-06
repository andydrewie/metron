#!/usr/bin/env python3
"""Ephemeral, public-source G0 field inspection.

Loads ONLY publicly released Zenodo record 17735477 into volatile runner memory.
Reports schema/header/count metadata, never row values or participant identities.
Does NOT calculate RMR error, fit any model, or create a human dataset artifact.
"""
from __future__ import annotations
import csv
import hashlib
import io
import json
import re
import sys
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
import zipfile

RECORD = "https://zenodo.org/api/records/17735477"
ALLOWED = (
    "enable_column_groups.tsv",
    "enable_data.tsv",
    "enable_Datensatz_RMR._Erwachsene 1.xlsx",
    "KIEL_REE Datenbank TUM_Januar 2025tf QM.xlsx",
)
MAX_BYTES = 1_000_000
M = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
SHEETS = re.compile(r"xl/worksheets/sheet[0-9]+\.xml$")
# Frozen, independently recorded in G0_FILE_VERIFICATION.json before this patch.
# A mutable Zenodo API manifest checksum is NOT sufficient to trust header rows.
PINNED_SHA256 = {
    "enable_column_groups.tsv": "0ec27fd3ef79b1d6bdbe5e8d6d33249026265bce31a9a58d7cc59d32f2557c80",
    "enable_data.tsv": "d91d7c609de5b90b7282afc36071c67cdbf8f7362f8d6fae82126f93c8d8ba61",
    "enable_Datensatz_RMR._Erwachsene 1.xlsx": "5e75b24f2732344c7b28a9cb463b4651bc5f532a0cc319bc10e401e378966e92",
    "KIEL_REE Datenbank TUM_Januar 2025tf QM.xlsx": "401cb44d78337c4b342b3a2829fea4fda4814cb147c7e94f6ded8fc0a4f9605c",
}

# Layout checks were audited from the exact pinned files. A new release
# requires a new review, independent hash and changed source-admission record.
EXPECTED_TEXT_HEADERS = {
    "enable_column_groups.tsv": {"column", "group"},
    "enable_data.tsv": {"Site", "SEX", "Alter, Jahre", "GROESSE, cm", "GEWICHt_SECA, kg", "FFM_SECA,kg", "RMR.KJ", "Probanden-ID"},
    "enable_Datensatz_RMR._Erwachsene 1.xlsx": {"General information", "Anthropometric and body composition", "Parameters of the indirect calorimetry", "Site", "Sex", "Age", "Height", "Weight,", "resting metabolic rate", "free fat mass"},
    "KIEL_REE Datenbank TUM_Januar 2025tf QM.xlsx": {"ID", "Geschlecht", "Alter", "Größe (m)", "Gewicht (kg)", "REE (kcal)", "date", "dailymean"},
}
EXPECTED_LAYOUT = {
    "enable_column_groups.tsv": {"column", "group"},
    "enable_data.tsv": {"Site", "SEX", "RMR.KJ", "Probanden-ID"},
    "enable_Datensatz_RMR._Erwachsene 1.xlsx": {"General information", "Anthropometric and body composition", "Parameters of the indirect calorimetry"},
    "KIEL_REE Datenbank TUM_Januar 2025tf QM.xlsx": {"ID", "Geschlecht", "Alter", "Gewicht (kg)", "REE (kcal)"},
}

def verify_pinned_file(name: str, blob: bytes) -> None:
    if name not in PINNED_SHA256 or hashlib.sha256(blob).hexdigest() != PINNED_SHA256[name]:
        raise ValueError("Unreviewed source bytes; refuse header inspection")

def safe_metadata_label(value: str | None, source_name: str | None) -> str | None:
    # Never echo arbitrary content from a possible participant row. This
    # whitelists exact, reviewed labels and requires verified source bytes.
    if value is None or source_name not in EXPECTED_TEXT_HEADERS:
        return None
    return value if value in EXPECTED_TEXT_HEADERS[source_name] else None


def fetch(url: str, limit: int = MAX_BYTES) -> bytes:
    last = None
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": "Metron-Research-G0-SchemaProbe/0.1 (+https://github.com/andydrewie/metron)",
                "Accept": "application/json,*/*",
            })
            with urllib.request.urlopen(req, timeout=28) as response:
                data = response.read(limit + 1)
            if len(data) > limit:
                raise ValueError("source exceeds bounded inspection size")
            return data
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as exc:
            last = exc
            if attempt < 2: time.sleep(attempt + 1)
    raise RuntimeError("public source fetch failed: " + str(last))

def scrub(header: str) -> str | None:
    # Legacy API retained for tests. Never publish arbitrary source strings.
    return safe_metadata_label(header.strip().replace("\x00", ""), None)

def safe_field_profile(header: list[str], records: list[list[str]]) -> dict:
    """Only eligibility metadata: no sample values, IDs or outcome distributions."""
    fields = [
        "Site", "SEX", "Alter, Jahre", "GROESSE, cm", "GEWICHt_SECA, kg",
        "FFM_SECA,kg", "RMR.KJ", "Label", "Probanden-ID"
    ]
    position = {name:i for i,name in enumerate(header)}
    normalized_missing = {"", "na", "n/a", "null", "nan", "missing", "none", "-"}
    numeric = {"Alter, Jahre", "GROESSE, cm", "GEWICHt_SECA, kg", "FFM_SECA,kg", "RMR.KJ"}
    output = {}
    for key in fields:
        if key not in position:
            output[key] = {"exists": False}
            continue
        idx = position[key]
        vals = [(row[idx] if idx < len(row) else "").strip() for row in records]
        known = [v for v in vals if v.lower() not in normalized_missing]
        stats = {"exists": True, "nonmissing": len(known), "missing": len(vals)-len(known)}
        if key in numeric:
            parseable = 0
            positive = 0
            for v in known:
                try:
                    import math
                    number = float(v.replace(",", "."))
                    if math.isfinite(number):
                        parseable += 1
                        if number > 0: positive += 1
                except ValueError:
                    pass
            stats.update({"numericParseable":parseable,"positiveNumeric":positive})
        elif key in {"Site", "SEX"}:
            distinct = sorted({v for v in known})
            # Only small categorical code vocabularies are safe to expose.
            allowed_codes = {"Site": {"freising", "nuernber"}, "SEX": {"männlich", "weiblich"}}
            stats["codeVocabulary"] = distinct if set(distinct).issubset(allowed_codes[key]) else None
            stats["distinctCodeCount"] = len(distinct)
        else:
            # Publication of raw participant codes is prohibited.
            stats["distinctNonmissingCount"] = len(set(known))
            stats["repeatedCodeCount"] = len(known)-len(set(known))
        output[key] = stats
    # Completeness of *inputs*, never outcome magnitudes or equation error.
    # These provisional counts aren't final study exclusions: G1 still needs
    # to freeze the cohort protocol and unit/coding interpretation.
    def positive_numeric(row: list[str], key: str) -> bool:
        index = position.get(key)
        if index is None or index >= len(row): return False
        value = row[index].strip()
        if value.lower() in normalized_missing: return False
        try:
            import math
            number = float(value.replace(",", "."))
            return math.isfinite(number) and number > 0
        except ValueError:
            return False
    def recognized_binary_equation_code(row: list[str]) -> bool:
        index = position.get("SEX")
        return index is not None and index < len(row) and row[index].strip().lower() in {"männlich", "weiblich"}
    keys_mifflin = ["Alter, Jahre", "GROESSE, cm", "GEWICHt_SECA, kg", "RMR.KJ"]
    counts = {
        "measuredRmrAndMifflinInputPresent": sum(
            1 for r in records if recognized_binary_equation_code(r) and all(positive_numeric(r,k) for k in keys_mifflin)
        ),
        "measuredRmrAndFfmPresent": sum(
            1 for r in records if all(positive_numeric(r,k) for k in ["RMR.KJ","FFM_SECA,kg"])
        ),
        "measuredRmrAndBothEquationInputsPresent": sum(
            1 for r in records if recognized_binary_equation_code(r) and all(positive_numeric(r,k) for k in keys_mifflin+["FFM_SECA,kg"])
        ),
    }
    return {"requiredFieldAvailability":output,"provisionalCompleteCaseCounts":counts,
            "countsNotFinalEligibility":True,"countsOnlyNoValues":True}

def summarize_tsv(blob: bytes, source_name: str | None = None) -> dict:
    if source_name is not None: verify_pinned_file(source_name, blob)
    text = blob.decode("utf-8-sig")
    first_line = text.splitlines()[0] if text.splitlines() else ""
    # A .tsv extension is not proof of an actual tab delimiter. Explicitly
    # identify separators before deciding which cells are candidate labels.
    delimiters = {name: first_line.count(name) for name in ["\t", ";", ",", "|"]}
    sep = max(delimiters, key=delimiters.get)
    if delimiters[sep] == 0: sep = "\t"
    try:
        sniffed = csv.Sniffer().sniff(text[:min(len(text), 8192)], delimiters="\t,;|")
        sep = sniffed.delimiter
    except csv.Error:
        pass
    reader = csv.reader(io.StringIO(text), delimiter=sep)
    first = next(reader, [])
    headers = [safe_metadata_label(v, source_name) for v in first]
    if source_name is not None and not EXPECTED_LAYOUT[source_name].issubset(set(first)):
        raise ValueError("Unrecognized delimited header layout; no rows emitted")
    records = [row for row in reader if row and any(x.strip() for x in row)]
    rows = len(records)
    eligibility = safe_field_profile(first, records) if source_name == "enable_data.tsv" else None
    return {
        "format": "delimited-text",
        "delimiter": {"\t":"tab",";":"semicolon",",":"comma","|":"pipe"}[sep],
        "firstLineLength": len(first_line),
        "delimiterCountsInFirstLine": {"tab":delimiters["\t"],"semicolon":delimiters[";"],"comma":delimiters[","],"pipe":delimiters["|"]},
        "recordCountExcludingFirstRow": rows,
        "fieldCount": len(first),
        "firstRowHeaderCandidates": headers,
        "eligibilityMetadata": eligibility,
        "firstRowMayBeData": source_name is None,
        "containsSampleValues": False,
    }

def strings_from_excel(root: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in root.namelist(): return []
    raw = root.read("xl/sharedStrings.xml")
    if len(raw) > 8_000_000: raise ValueError("excessively large sharedStrings")
    element = ET.fromstring(raw)
    return ["".join((t.text or "") for t in si.iter(M + "t")) for si in element.findall(M + "si")]

def extract_excel_header(blob: bytes, source_name: str | None = None) -> dict:
    if source_name is not None: verify_pinned_file(source_name, blob)
    summary = []
    with zipfile.ZipFile(io.BytesIO(blob)) as z:
        shared = strings_from_excel(z)
        for sheet in sorted(n for n in z.namelist() if SHEETS.match(n))[:8]:
            raw = z.read(sheet)
            if len(raw) > 12_000_000: raise ValueError("excessively large worksheet")
            root = ET.fromstring(raw)
            rows = root.findall(".//" + M + "sheetData/" + M + "row")
            first = rows[0] if rows else None
            labels = []
            if first is not None:
                for cell in first.findall(M + "c"):
                    t = cell.get("t")
                    value = cell.find(M + "v")
                    inline = cell.find(M + "is")
                    actual = None
                    if t == "s" and value is not None:
                        try: actual = shared[int(value.text)]
                        except (IndexError, TypeError, ValueError): pass
                    elif t == "inlineStr" and inline is not None:
                        actual = "".join(x.text or "" for x in inline.iter(M + "t"))
                    # Deliberately refuse numeric/date cells: only text *likely*
                    # headers are revealed. Never print subsequent row values.
                    labels.append(safe_metadata_label(actual, source_name))
            # The enable workbook uses a category/group row above the
            # real field labels. Inspect the next row ONLY if the first row
            # is demonstrably a category heading, never for ordinary sheets
            # where the second row may contain participant observations.
            second_labels = None
            categories = {"General information", "Anthropometric and body composition", "Parameters of the indirect calorimetry"}
            if source_name == "enable_Datensatz_RMR._Erwachsene 1.xlsx" and len(rows) > 1 and categories.issubset(set(labels)):
                second_labels = []
                for cell in rows[1].findall(M + "c"):
                    t, value, inline = cell.get("t"), cell.find(M + "v"), cell.find(M + "is")
                    actual = None
                    if t == "s" and value is not None:
                        try: actual = shared[int(value.text)]
                        except (IndexError, ValueError, TypeError): pass
                    elif t == "inlineStr" and inline is not None:
                        actual = "".join(x.text or "" for x in inline.iter(M + "t"))
                    second_labels.append(safe_metadata_label(actual, source_name))
            # The first sheet must match the exact audited header layout.
            if source_name is not None and sheet.endswith("sheet1.xml"):
                if not EXPECTED_LAYOUT[source_name].issubset(set(labels)):
                    raise ValueError("Unrecognized workbook header layout; no rows emitted")
            summary.append({
                "secondRowFieldHeaderCandidates": second_labels,
                "worksheet": sheet,
                "declaredRows": len(rows),
                "firstRowCellCount": len(labels),
                "firstRowTextHeaderCandidates": labels,
                "firstRowMayBeData": True,
                "containsSampleValues": False,
            })
    return {"format": "xlsx", "sheets": summary, "containsSampleValues": False}

def record_rights(meta: dict) -> list[str]:
    m = meta.get("metadata", {})
    values = []
    for entry in m.get("rights") or []:
        if isinstance(entry, dict): values.append(str(entry.get("id") or entry.get("title") or ""))
        elif isinstance(entry, str): values.append(entry)
    lic = m.get("license")
    if isinstance(lic, dict): values.append(str(lic.get("id") or lic.get("title") or ""))
    elif isinstance(lic, str): values.append(lic)
    return sorted(set(v for v in values if v))

def inspect_record(meta: dict, loader=fetch) -> dict:
    if str(meta.get("id")) != "17735477": raise ValueError("unexpected record ID")
    rights = record_rights(meta)
    normalized = " ".join(rights).lower().replace(" ", "-")
    if "cc-by-4.0" not in normalized and "creative-commons-attribution-4.0" not in normalized:
        raise PermissionError("Zenodo record rights cannot be verified as CC BY 4.0; refuse participant file download")
    names = {f["key"]: f for f in meta.get("files", [])}
    found = []
    for name in ALLOWED:
        if name not in names:
            raise ValueError("missing expected public file: " + name)
        file = names[name]
        if file.get("size", 0) > MAX_BYTES:
            raise ValueError("file exceeds 1MB inspection cap: " + name)
        link = file.get("links", {}).get("content") or file.get("links", {}).get("self")
        if not (isinstance(link,str) and link.startswith("https://zenodo.org/")):
            raise ValueError("unexpected download host or missing source URL")
        data = loader(link, MAX_BYTES)
        # Check our independently pinned G0 SHA-256 BEFORE examining any row
        # or creating a candidate header. Zenodo's mutable manifest alone
        # does not establish the reviewed schema or privacy classification.
        verify_pinned_file(name, data)
        computed = "md5:" + hashlib.md5(data).hexdigest()
        if computed != file.get("checksum"):
            raise ValueError("Zenodo checksum mismatch for: " + name)
        detail = summarize_tsv(data, name) if name.endswith(".tsv") else extract_excel_header(data, name)
        found.append({
            "name": name,
            "bytes": len(data),
            "md5MatchesZenodo": True,
            "sha256ComputedByMetron": hashlib.sha256(data).hexdigest(),
            "reportedFileSizeMatches": len(data) == file.get("size"),
            "structure": detail,
        })
        # data remains in ephemeral job memory and is not written to the repo.
    return {
        "schemaVersion":"1.0.0",
        "classification":"public-release-schema-inspection-only",
        "recordId": meta["id"],
        "doi":meta.get("doi"),
        "rightsReportedByZenodo":["cc-by-4.0"],
        "licenseReviewedAt":"record-level-only",
        "measurementOutcomesAnalyzed":False,
        "participantRowsPublished":False,
        "modelComparedToMeasurements":False,
        "allFilesChecksumVerified":True,
        "files": found,
    }

def main() -> int:
    try:
        metadata = json.loads(fetch(RECORD, 2_000_000))
        result = inspect_record(metadata)
        # stdout is the ONLY surviving artifact; no participant rows and no
        # extracted file. The output contains headers and row counts only.
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return 0
    except Exception as exc:
        # Avoid leaking response bodies, credentials, participant data or URLs.
        print(json.dumps({
            "status":"blocked",
            "stage":"source-file-inspection",
            "reasonType":type(exc).__name__,
            "reason":"A verified-source or schema check failed. See repository review notes.",
            "participantRowsPublished":False
        }))
        return 2

if __name__ == "__main__":
    sys.exit(main())
