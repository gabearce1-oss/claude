"""Linguistic anomalies — modern business or legal phrasing in records
claiming a pre-1960 date, and the discourse markers that pile up when an
LLM is producing the text rather than transcribing it."""

from typing import List

from ..document import Document
from ..findings import Category, Finding


# Vocabulary that did not exist as common business idiom before ~1960.
# All matched case-insensitively as whole substrings.
_MODERN_BUSINESS_PHRASES = [
    "stakeholder",
    "best practices",
    "due diligence",
    "compliance review",
    "leverage synergies",
    "core competencies",
    "going forward",
    "key takeaways",
    "value-add",
    "pain points",
    "low-hanging fruit",
    "circle back",
    "deep dive",
    "actionable insights",
    "move the needle",
    "deliverable",
]

# Discourse phrases that LLMs over-produce. One occurrence is noise.
# Two or more in the same document is a meaningful signal.
_LLM_DISCOURSE_MARKERS = [
    "it's important to note",
    "it is important to note",
    "in summary,",
    "in conclusion,",
    "comprehensive overview",
    "let's explore",
    "let us explore",
    "furthermore,",
    "moreover,",
    "additionally,",
    "key takeaway",
    "delve into",
    "navigate the complexities",
    "rich tapestry",
]


def rule_modern_phrasing_in_old_record(doc: Document) -> List[Finding]:
    year = doc.record_year
    if year is None or year >= 1960:
        return []
    text = (doc.ocr_text or "").lower()
    if not text:
        return []
    hits = [p for p in _MODERN_BUSINESS_PHRASES if p in text]
    if not hits:
        return []
    severity = min(80, 25 + 15 * len(hits))
    return [
        Finding(
            rule_id="L001_modern_phrasing",
            category=Category.LINGUISTIC,
            severity=severity,
            message=f"Modern business phrasing in record dated {year}",
            evidence="; ".join(hits[:5]),
        )
    ]


def rule_llm_discourse_markers(doc: Document) -> List[Finding]:
    text = (doc.ocr_text or "").lower()
    if not text:
        return []
    hits = [m for m in _LLM_DISCOURSE_MARKERS if m in text]
    if len(hits) < 2:
        return []
    severity = min(80, 20 + 15 * len(hits))
    return [
        Finding(
            rule_id="L002_llm_discourse_markers",
            category=Category.LINGUISTIC,
            severity=severity,
            message=f"{len(hits)} LLM-style discourse markers in same document",
            evidence="; ".join(hits[:5]),
        )
    ]


linguistic_rules = [
    rule_modern_phrasing_in_old_record,
    rule_llm_discourse_markers,
]
