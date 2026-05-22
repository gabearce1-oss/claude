"""Structural anomalies — locator syntax that doesn't match known archives,
synthetic-looking identifier patterns, missing provenance on substantive text."""

import itertools
import re
from typing import List

from ..document import Document
from ..findings import Category, Finding


# Each known archive has a locator pattern its records normally carry somewhere
# in collection / box / folder / call number. Absence of the pattern signals
# that the archive name is being invoked without the catalog scaffolding.
_ARCHIVE_LOCATOR_PATTERNS = {
    "NARA": re.compile(r"RG\s?\d+|Record Group\s?\d+|Entry\s?\d+", re.I),
    "AGN": re.compile(r"\bfondo\b", re.I),
    "AHES": re.compile(r"\bfondo\b|\bserie\b|\bmunic", re.I),
    "AGI": re.compile(r"\b(?:legajo|seccion|sección)\b", re.I),
    "Bancroft": re.compile(r"\b(?:MSS|BANC)\b", re.I),
}

# Identifier patterns that read as machine-generated rather than period-archival.
# These show up frequently in LLM-fabricated transaction logs.
_SYNTHETIC_ID_PATTERNS = [
    re.compile(r"\b[A-Z]{2,4}-\d{4}-[A-Z]{2,4}-\d{4,6}\b"),         # WF-1907-TX-00042
    re.compile(r"\b(?:MEMO|TXN|REF|DOC|CASE)-#?\d{4,8}\b", re.I),    # MEMO-00042
    re.compile(r"\bTransaction\s+(?:ID|#|No\.?)\s*[:#]?\s*[A-Z0-9-]{6,}", re.I),
    re.compile(r"\bWire\s+Reference\s*[:#]?\s*[A-Z0-9-]{6,}", re.I),
]


def rule_invalid_archive_locator(doc: Document) -> List[Finding]:
    if not doc.archive_name:
        return []
    haystack = " ".join(
        filter(None, [doc.collection_name, doc.box_number, doc.folder_number, doc.call_number])
    )
    name_lower = doc.archive_name.lower()
    for archive_key, pattern in _ARCHIVE_LOCATOR_PATTERNS.items():
        if archive_key.lower() in name_lower:
            if not pattern.search(haystack):
                return [
                    Finding(
                        rule_id="S001_invalid_archive_locator",
                        category=Category.STRUCTURAL,
                        severity=60,
                        message=(
                            f"{doc.archive_name} cited without the expected locator "
                            f"pattern for that repository"
                        ),
                        evidence=haystack or "(no collection/box/folder fields)",
                    )
                ]
    return []


def rule_invented_identifier(doc: Document) -> List[Finding]:
    if not doc.ocr_text:
        return []
    findings: List[Finding] = []
    for pattern in _SYNTHETIC_ID_PATTERNS:
        matches = list(itertools.islice(pattern.finditer(doc.ocr_text), 3))
        for match in matches:
            findings.append(
                Finding(
                    rule_id="S002_invented_identifier",
                    category=Category.STRUCTURAL,
                    severity=40,
                    message=(
                        "Synthetic-looking identifier pattern atypical of period record-keeping"
                    ),
                    evidence=match.group(0),
                )
            )
    return findings


def rule_missing_provenance(doc: Document) -> List[Finding]:
    """Substantive text with no archive locator at all — the cheapest, loudest
    structural signal of fabricated material."""
    if doc.has_archive_locator:
        return []
    if not doc.ocr_text or len(doc.ocr_text) < 200:
        return []
    return [
        Finding(
            rule_id="S003_missing_provenance",
            category=Category.STRUCTURAL,
            severity=30,
            message="Substantive text but no archive_name, collection_name, box_number, or call_number",
        )
    ]


structural_rules = [
    rule_invalid_archive_locator,
    rule_invented_identifier,
    rule_missing_provenance,
]
