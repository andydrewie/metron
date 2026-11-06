import io
import unittest
import zipfile
import json
import xml.etree.ElementTree as ET
from probe_zenodo import summarize_tsv, extract_excel_header, record_rights, inspect_record

class ProbeTests(unittest.TestCase):
    def test_tsv_only_emits_header_candidates_not_row_values(self):
        payload = b"weight_kg\tmeasured_rmr\n80\t2222\n90\t3333\n"
        out = summarize_tsv(payload)
        self.assertEqual(out["fieldCount"], 2)
        self.assertEqual(out["recordCountExcludingFirstRow"], 2)
        self.assertEqual(out["firstRowHeaderCandidates"], ["weight_kg","measured_rmr"])
        self.assertNotIn("2222", json.dumps(out))
        self.assertNotIn("3333", json.dumps(out))

    def test_comma_delimited_file_with_tsv_extension_and_safe_eligibility(self):
        from probe_zenodo import summarize_tsv
        payload = b"SEX,Alter, Jahre,RMR.KJ,Probanden-ID\nm,31,8600,secret_004\nw,26,7100,secret_005\n"
        # Dataset headers containing commas should be properly CSV-quoted.
        payload = b'SEX,"Alter, Jahre",RMR.KJ,Probanden-ID\nm,31,8600,secret_004\nw,26,7100,secret_005\n'
        result = summarize_tsv(payload)
        self.assertEqual(result["delimiter"],"comma")
        self.assertEqual(result["fieldCount"],4)
        self.assertEqual(result["eligibilityMetadata"]["requiredFieldAvailability"]["RMR.KJ"]["numericParseable"],2)
        self.assertNotIn("secret_004", json.dumps(result))
        self.assertNotIn("8600", json.dumps(result))
        self.assertEqual(result["eligibilityMetadata"]["requiredFieldAvailability"]["Probanden-ID"]["distinctNonmissingCount"],2)
        self.assertEqual(result["eligibilityMetadata"]["provisionalCompleteCaseCounts"]["measuredRmrAndMifflinInputPresent"],0)
        self.assertTrue(result["eligibilityMetadata"]["countsNotFinalEligibility"])

    def test_xlsx_only_returns_first_row_text_and_no_participant_values(self):
        ss = '<?xml version="1.0"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><si><t>Age</t></si><si><t>Measured_RMR</t></si></sst>'
        sheet = '<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row><row r="2"><c r="A2"><v>30</v></c><c r="B2"><v>2555</v></c></row></sheetData></worksheet>'
        target = io.BytesIO()
        with zipfile.ZipFile(target,"w") as z:
            z.writestr("xl/sharedStrings.xml",ss)
            z.writestr("xl/worksheets/sheet1.xml",sheet)
        out = extract_excel_header(target.getvalue())
        self.assertEqual(out["sheets"][0]["firstRowTextHeaderCandidates"], ["Age","Measured_RMR"])
        self.assertNotIn("2555",json.dumps(out))

    def test_refuse_missing_license_without_attempting_to_fetch_rows(self):
        called=[]
        meta={"id":17735477,"metadata":{"rights":[{"id":"restricted"}]},"files":[]}
        def loader(*a):
            called.append(a)
            return b""
        with self.assertRaises(PermissionError):
            inspect_record(meta,loader)
        self.assertEqual(called,[])

    def test_understand_record_level_license_only(self):
        rights=record_rights({"metadata":{"rights":[{"id":"cc-by-4.0"}]}})
        self.assertEqual(rights,["cc-by-4.0"])

if __name__=="__main__":
    unittest.main()
