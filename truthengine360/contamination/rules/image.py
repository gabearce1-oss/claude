"""Image / document anomalies — OCR quality and PDF metadata signals."""

from typing import List

from ..document import Document
from ..findings import Category, Finding


# Authoring applications that produce PDFs from scratch, as opposed to
# scanner / OCR pipelines that produce PDFs from physical documents.
_AUTHORING_APPS = (
    "microsoft word",
    "word for mac",
    "pages",
    "libreoffice",
    "openoffice",
    "google docs",
    "google drive",
    "openai",
    "chatgpt",
    "claude",
    "anthropic",
    "gemini",
)


def rule_ocr_too_clean(doc: Document) -> List[Finding]:
    """Pre-1980 physical scans rarely OCR cleanly. >98% confidence on a
    substantial body of pre-1980 text suggests the text was typed in,
    not transcribed from an image."""
    if doc.ocr_confidence is None or not doc.ocr_text:
        return []
    if len(doc.ocr_text) < 2_000:
        return []
    year = doc.record_year
    if year is None or year >= 1980:
        return []
    if doc.ocr_confidence < 98:
        return []
    return [
        Finding(
            rule_id="I001_ocr_too_clean",
            category=Category.IMAGE,
            severity=60,
            message=(
                f"OCR confidence {doc.ocr_confidence:.1f}% on a {year} record "
                f"with {len(doc.ocr_text):,} characters of text"
            ),
        )
    ]


def rule_pdf_authored_not_scanned(doc: Document) -> List[Finding]:
    """A pre-1980 record whose PDF Producer is an authoring application
    (Word, Pages, LibreOffice, an LLM client) is not a scan of a historical
    document. It's a synthesized document presented as one."""
    if not doc.pdf_metadata:
        return []
    year = doc.record_year
    if year is None or year >= 1980:
        return []
    producer = (doc.pdf_metadata.get("producer") or "").lower()
    creator = (doc.pdf_metadata.get("creator") or "").lower()
    haystack = f"{producer} {creator}".strip()
    if not haystack:
        return []
    hit = next((app for app in _AUTHORING_APPS if app in haystack), None)
    if not hit:
        return []
    return [
        Finding(
            rule_id="I002_pdf_authored_not_scanned",
            category=Category.IMAGE,
            severity=70,
            message=(
                f"PDF produced by authoring software ({hit!r}) for a record "
                f"dated {year}"
            ),
            evidence=haystack,
        )
    ]


image_rules = [
    rule_ocr_too_clean,
    rule_pdf_authored_not_scanned,
]
