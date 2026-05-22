"""Citation anomalies — references to sources nobody else can retrieve, and
anachronistic corporate titles attributed to named individuals."""

import itertools
import re
from typing import List

from ..document import Document
from ..findings import Category, Finding


_INACCESSIBLE_REF_PATTERNS = [
    re.compile(r"\binternal\s+memo(?:randum)?\b", re.I),
    re.compile(r"\bprivate\s+correspondence\b", re.I),
    re.compile(r"\bconfidential\s+report\b", re.I),
    re.compile(r"\bunpublished\s+(?:source|report|paper|notes?)\b", re.I),
    re.compile(r"\bproprietary\s+(?:database|records?)\b", re.I),
]

# Modern corporate / managerial titles. Pre-1960 archival records reference
# clerks, agents, managers, directors — not "Vice President of Foreign
# Operations" or "Chief Compliance Officer".
_MODERN_CORPORATE_TITLES = re.compile(
    r"\b("
    r"Vice\s+President|VP|"
    r"Chief\s+\w+\s+Officer|C[A-Z]O|"
    r"Director\s+of\s+\w+|"
    r"Head\s+of\s+\w+|"
    r"Senior\s+Manager|"
    r"Compliance\s+Officer"
    r")\b",
    re.I,
)


def rule_inaccessible_reference(doc: Document) -> List[Finding]:
    """References to 'internal memo' / 'private correspondence' without any
    retrievable archive locator. Real historical records cite themselves
    with locators; AI-generated summaries gesture at sources they can't name."""
    if doc.has_archive_locator:
        return []
    text = doc.ocr_text or ""
    if not text:
        return []
    hits = []
    for pattern in _INACCESSIBLE_REF_PATTERNS:
        match = pattern.search(text)
        if match:
            hits.append(match.group(0))
    if not hits:
        return []
    severity = min(70, 25 + 15 * len(hits))
    return [
        Finding(
            rule_id="C001_inaccessible_reference",
            category=Category.CITATION,
            severity=severity,
            message='References "internal" or "private" sources without a retrievable archive locator',
            evidence="; ".join(hits[:3]),
        )
    ]


def rule_anachronistic_corporate_titles(doc: Document) -> List[Finding]:
    year = doc.record_year
    if year is None or year >= 1960:
        return []
    text = doc.ocr_text or ""
    if not text:
        return []
    matches = list(itertools.islice(_MODERN_CORPORATE_TITLES.finditer(text), 3))
    if not matches:
        return []
    severity = min(75, 30 + 15 * len(matches))
    return [
        Finding(
            rule_id="C002_anachronistic_titles",
            category=Category.CITATION,
            severity=severity,
            message=f"Modern corporate titles named in document dated {year}",
            evidence="; ".join(m.group(0) for m in matches),
        )
    ]


citation_rules = [
    rule_inaccessible_reference,
    rule_anachronistic_corporate_titles,
]
