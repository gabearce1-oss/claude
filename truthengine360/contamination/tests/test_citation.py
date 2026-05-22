from datetime import date

from truthengine360.contamination import Document
from truthengine360.contamination.rules.citation import (
    rule_anachronistic_corporate_titles,
    rule_inaccessible_reference,
)


def test_inaccessible_ref_with_no_locator_flags():
    doc = Document(
        title="t",
        ocr_text="See the internal memorandum filed under private correspondence.",
    )
    findings = rule_inaccessible_reference(doc)
    assert findings
    assert findings[0].rule_id == "C001_inaccessible_reference"


def test_inaccessible_ref_with_locator_does_not_flag():
    doc = Document(
        title="t",
        ocr_text="See the internal memorandum referenced therein.",
        archive_name="NARA",
        collection_name="RG 84",
    )
    assert rule_inaccessible_reference(doc) == []


def test_modern_title_in_old_record_flags():
    doc = Document(
        title="t",
        ocr_text="The Vice President of Foreign Operations confirmed the transfer.",
        record_date_start=date(1907, 1, 1),
    )
    findings = rule_anachronistic_corporate_titles(doc)
    assert findings
    assert findings[0].rule_id == "C002_anachronistic_titles"


def test_modern_title_in_modern_record_does_not_flag():
    doc = Document(
        title="t",
        ocr_text="The Vice President of Foreign Operations confirmed the transfer.",
        record_date_start=date(2010, 1, 1),
    )
    assert rule_anachronistic_corporate_titles(doc) == []
