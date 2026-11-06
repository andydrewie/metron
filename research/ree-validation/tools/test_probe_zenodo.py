import io
import unittest
import zipfile
import json
import xml.etree.ElementTree as ET
from probe_zenodo import summarize_tsv, extract_excel_header, record_rights, inspect_record, safe_field_profile, PINNED_SHA256

class ProbeTests(unittest.TestCase):
    def test_tsv_only_emits_header_candidates_not_row_values(self):
        payload = b"weight_kg\tmeasured_rmr\n80\t2222\n90\t3333\n"
        out = summarize_tsv(payload)
        self.assertEqual(out["fieldCount"], 2)
        self.assertEqual(out["recordCountExcludingFirstRow"], 2)
        self.assertEqual(out["firstRowHeaderCandidates"], [None, None])
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
        self.assertEqual(result["firstRowHeaderCandidates"],[None,None,None,None])
        self.assertIsNone(result["eligibilityMetadata"])
        profile = safe_field_profile(["SEX","Alter, Jahre","RMR.KJ","Probanden-ID"], [
          ["m","31","8600","secret_004"],["w","26","7100","secret_005"]
        ])
        result["eligibilityMetadata"] = profile
        self.assertEqual(profile["requiredFieldAvailability"]["RMR.KJ"]["numericParseable"],2)
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
        self.assertEqual(out["sheets"][0]["firstRowTextHeaderCandidates"], [None,None])
        self.assertNotIn("2555",json.dumps(out))


    def test_unknown_header_and_xlsx_participant_string_never_leak(self):
        self.assertEqual(summarize_tsv(b"Participant-123,secret@example.com\\nP-1,9999\\n")["firstRowHeaderCandidates"],[None,None])
        ss = '<?xml version="1.0"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><si><t>Participant-123</t></si><si><t>2555</t></si><si><t>secret@example.com</t></si></sst>'
        sheet = '<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row><row r="2"><c r="A2"><v>45</v></c></row></sheetData></worksheet>'
        target=io.BytesIO()
        with zipfile.ZipFile(target,"w") as z:
            z.writestr("xl/sharedStrings.xml",ss)
            z.writestr("xl/worksheets/sheet1.xml",sheet)
        result=extract_excel_header(target.getvalue())
        out=json.dumps(result)
        for forbidden in ["Participant-123","2555","secret@example.com"]:
            self.assertNotIn(forbidden,out)
        self.assertEqual(result["sheets"][0]["firstRowTextHeaderCandidates"],[None,None,None])

    def test_mutable_manifest_md5_cannot_substitute_unreviewed_source_bytes(self):
        import hashlib
        fake=b"Patient-999,secret@example.com\\n"
        self.assertNotEqual(hashlib.sha256(fake).hexdigest(),PINNED_SHA256["enable_column_groups.tsv"])
        meta={"id":17735477,"metadata":{"rights":[{"id":"cc-by-4.0"}]},
              "files":[{"key":"enable_column_groups.tsv","size":len(fake),
                        "checksum":"md5:"+hashlib.md5(fake).hexdigest(),
                        "links":{"content":"https://zenodo.org/api/records/17735477/files/test/content"}}]}
        called=[]
        def loader(*args):
            called.append(args)
            return fake
        with self.assertRaisesRegex(ValueError,"Unreviewed source bytes"):
            inspect_record(meta,loader)
        self.assertEqual(len(called),1)
        with self.assertRaisesRegex(ValueError,"Unreviewed source bytes"):
            summarize_tsv(fake,"enable_column_groups.tsv")
        self.assertNotIn("Patient-999",json.dumps({"status":"blocked","reason":"Unreviewed source bytes"}))

    def test_unrecognized_source_codes_are_not_echoed_from_field_quality(self):
        report=safe_field_profile(["SEX","Site","Alter, Jahre","RMR.KJ","Probanden-ID"], [
            ["Patient-999","private-email@example.com","20","5000","secret-42"]
        ])
        output=json.dumps(report)
        self.assertNotIn("Patient-999",output)
        self.assertNotIn("private-email@example.com",output)
        self.assertNotIn("secret-42",output)
        self.assertIsNone(report["requiredFieldAvailability"]["SEX"]["codeVocabulary"])
        self.assertIsNone(report["requiredFieldAvailability"]["Site"]["codeVocabulary"])

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
