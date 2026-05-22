from truthengine360.contamination import Document
from truthengine360.contamination.rules.structural import (
    rule_invalid_archive_locator,
    rule_invented_identifier,
    rule_missing_provenance,
)


def test_nara_with_record_group_passes():
    doc = Document(title="t", archive_name="NARA", collection_name="RG 84")
    assert rule_invalid_archive_locator(doc) == []


def test_nara_without_record_group_flags():
    doc = Document(title="t", archive_name="NARA", collection_name="Misc files")
    findings = rule_invalid_archive_locator(doc)
    assert len(findings) == 1
    assert findings[0].rule_id == "S001_invalid_archive_locator"


def test_agn_requires_fondo():
    bad = Document(title="t", archive_name="AGN", collection_name="(unknown)")
    good = Document(title="t", archive_name="AGN", collection_name="Fondo Gobernación")
    assert rule_invalid_archive_locator(bad)
    assert rule_invalid_archive_locator(good) == []


def test_archive_not_in_registry_is_not_flagged():
    # Unknown archives have no enforceable pattern; the rule abstains.
    doc = Document(title="t", archive_name="Local Parish")
    assert rule_invalid_archive_locator(doc) == []


def test_synthetic_transaction_id_detected():
    doc = Document(
        title="t",
        ocr_text="Transfer recorded: WF-1907-TX-00042 from Sonora branch",
    )
    findings = rule_invented_identifier(doc)
    assert findings
    assert findings[0].rule_id == "S002_invented_identifier"
    assert "WF-1907-TX-00042" in findings[0].evidence


def test_memo_pattern_detected():
    doc = Document(
        title="t",
        ocr_text="See MEMO-00042 attached. Also REF-7788.",
    )
    rules_fired = {f.rule_id for f in rule_invented_identifier(doc)}
    assert "S002_invented_identifier" in rules_fired


def test_missing_provenance_only_on_substantive_text():
    short = Document(title="t", ocr_text="short")
    assert rule_missing_provenance(short) == []

    substantive = Document(title="t", ocr_text="a" * 250)
    assert rule_missing_provenance(substantive)

    with_locator = Document(title="t", ocr_text="a" * 250, archive_name="NARA")
    assert rule_missing_provenance(with_locator) == []


def test_missing_provenance_quiet_when_only_folder_number_set():
    # has_archive_locator must consider folder_number too — a record cited
    # only by folder is not "missing provenance".
    doc = Document(title="t", ocr_text="a" * 250, folder_number="Folder 42")
    assert rule_missing_provenance(doc) == []
