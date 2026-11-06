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
SAFE_HEADER = re.compile(r"^[\w .%()+:/,\-—§°²³\[\]]{1,100}$", re.UNICODE)

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
    value = header.strip().replace("\x00", "")
    # Headers alone are useful; reject accidental free text, contact details,
    # unexpected Unicode controls and long values rather than printing data rows.
    if "@" in value or not SAFE_HEADER.fullmatch(value): return None
    return value

def summarize_tsv(blob: bytes) -> dict:
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
    headers = [scrub(v) for v in first]
    rows = sum(1 for row in reader if row and any(x.strip() for x in row))
    return {
        "format": "delimited-text",
        "delimiter": {"\t":"tab",";":"semicolon",",":"comma","|":"pipe"}[sep],
        "firstLineLength": len(first_line),
        "delimiterCountsInFirstLine": {"tab":delimiters["\t"],"semicolon":delimiters[";"],"comma":delimiters[","],"pipe":delimiters["|"]},
        "recordCountExcludingFirstRow": rows,
        "fieldCount": len(first),
        "firstRowHeaderCandidates": headers,
        "firstRowMayBeData": False,
        "containsSampleValues": False,
    }

def strings_from_excel(root: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in root.namelist(): return []
    raw = root.read("xl/sharedStrings.xml")
    if len(raw) > 8_000_000: raise ValueError("excessively large sharedStrings")
    element = ET.fromstring(raw)
    return ["".join((t.text or "") for t in si.iter(M + "t")) for si in element.findall(M + "si")]

def extract_excel_header(blob: bytes) -> dict:
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
                    labels.append(scrub(actual) if actual is not None else None)
            # The enable workbook uses a category/group row above the
            # real field labels. Inspect the next row ONLY if the first row
            # is demonstrably a category heading, never for ordinary sheets
            # where the second row may contain participant observations.
            second_labels = None
            categories = {"General information", "Anthropometric and body composition", "Parameters of the indirect calorimetry"}
            if len(rows) > 1 and any(x in categories for x in labels if x):
                second_labels = []
                for cell in rows[1].findall(M + "c"):
                    t, value, inline = cell.get("t"), cell.find(M + "v"), cell.find(M + "is")
                    actual = None
                    if t == "s" and value is not None:
                        try: actual = shared[int(value.text)]
                        except (IndexError, ValueError, TypeError): pass
                    elif t == "inlineStr" and inline is not None:
                        actual = "".join(x.text or "" for x in inline.iter(M + "t"))
                    second_labels.append(scrub(actual) if actual is not None else None)
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
        computed = "md5:" + hashlib.md5(data).hexdigest()
        if computed != file.get("checksum"):
            raise ValueError("Zenodo checksum mismatch for: " + name)
        detail = summarize_tsv(data) if name.endswith(".tsv") else extract_excel_header(data)
        found.append({
            "name": name,
            "bytes": len(data),
            "md5MatchesZenodo": True,
            "reportedFileSizeMatches": len(data) == file.get("size"),
            "structure": detail,
        })
        # data remains in ephemeral job memory and is not written to the repo.
    return {
        "schemaVersion":"1.0.0",
        "classification":"public-release-schema-inspection-only",
        "recordId": meta["id"],
        "doi":meta.get("doi"),
        "rightsReportedByZenodo":rights,
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
            "reason":str(exc)[:160],
            "participantRowsPublished":False
        }))
        return 2

if __name__ == "__main__":
    sys.exit(main())
