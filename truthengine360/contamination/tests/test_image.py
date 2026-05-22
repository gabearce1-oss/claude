from datetime import date

from truthengine360.contamination import Document
from truthengine360.contamination.rules.image import (
    rule_ocr_too_clean,
    rule_pdf_authored_not_scanned,
)


def test_high_ocr_confidence_on_historic_record_flags():
    doc = Document(
        title="t",
        ocr_text="x" * 2_500,
        record_date_start=date(1910, 1, 1),
        ocr_confidence=99.5,
    )
    findings = rule_ocr_too_clean(doc)
    assert findings
    assert findings[0].rule_id == "I001_ocr_too_clean"


def test_normal_ocr_confidence_does_not_flag():
    doc = Document(
        title="t",
        ocr_text="x" * 2_500,
        record_date_start=date(1910, 1, 1),
        ocr_confidence=82.0,
    )
    assert rule_ocr_too_clean(doc) == []


def test_short_text_does_not_flag():
    doc = Document(
        title="t",
        ocr_text="short",
        record_date_start=date(1910, 1, 1),
        ocr_confidence=99.5,
    )
    assert rule_ocr_too_clean(doc) == []


def test_pdf_authored_not_scanned():
    doc = Document(
        title="t",
        record_date_start=date(1907, 1, 1),
        pdf_metadata={"producer": "Microsoft Word for Mac"},
    )
    findings = rule_pdf_authored_not_scanned(doc)
    assert findings
    assert findings[0].rule_id == "I002_pdf_authored_not_scanned"


def test_pdf_from_scanner_does_not_flag():
    doc = Document(
        title="t",
        record_date_start=date(1907, 1, 1),
        pdf_metadata={"producer": "Adobe Acrobat Capture", "creator": "Epson Scan"},
    )
    assert rule_pdf_authored_not_scanned(doc) == []
