from datetime import date

from truthengine360.contamination import Document
from truthengine360.contamination.rules.linguistic import (
    rule_llm_discourse_markers,
    rule_modern_phrasing_in_old_record,
)


def test_modern_phrase_in_pre_1960_record_flags():
    doc = Document(
        title="t",
        ocr_text="The stakeholder review concluded with best practices for due diligence.",
        record_date_start=date(1910, 1, 1),
    )
    findings = rule_modern_phrasing_in_old_record(doc)
    assert findings
    assert findings[0].rule_id == "L001_modern_phrasing"


def test_modern_phrase_in_recent_record_does_not_flag():
    doc = Document(
        title="t",
        ocr_text="The stakeholder review concluded with best practices.",
        record_date_start=date(2010, 1, 1),
    )
    assert rule_modern_phrasing_in_old_record(doc) == []


def test_undated_record_does_not_flag_modern_phrasing():
    doc = Document(title="t", ocr_text="Best practices for due diligence.")
    assert rule_modern_phrasing_in_old_record(doc) == []


def test_one_discourse_marker_is_noise():
    doc = Document(title="t", ocr_text="In summary, the report was filed.")
    assert rule_llm_discourse_markers(doc) == []


def test_multiple_discourse_markers_flag():
    doc = Document(
        title="t",
        ocr_text=(
            "It's important to note the comprehensive overview. "
            "Furthermore, key takeaway is significant. "
            "In summary, additionally, all evidence aligns."
        ),
    )
    findings = rule_llm_discourse_markers(doc)
    assert findings
    assert findings[0].rule_id == "L002_llm_discourse_markers"
    assert findings[0].severity >= 50
