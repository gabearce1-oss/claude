"""Findings, categories, weights, and verdict thresholds.

The five-category structure and weights come directly from the MVP plan's
scoring formula:

    contamination_score =
        0.25 * structural +
        0.20 * statistical +
        0.20 * linguistic +
        0.20 * citation +
        0.15 * image

Verdict bands map a 0-100 composite score to an operational disposition.
"""

from dataclasses import dataclass
from enum import Enum


class Category(str, Enum):
    STRUCTURAL = "structural"
    STATISTICAL = "statistical"
    LINGUISTIC = "linguistic"
    CITATION = "citation"
    IMAGE = "image"


CATEGORY_WEIGHTS = {
    Category.STRUCTURAL: 0.25,
    Category.STATISTICAL: 0.20,
    Category.LINGUISTIC: 0.20,
    Category.CITATION: 0.20,
    Category.IMAGE: 0.15,
}


@dataclass(frozen=True)
class Finding:
    rule_id: str
    category: Category
    severity: int  # 0-100, contribution toward the category subscore
    message: str
    evidence: str = ""  # snippet or value that triggered the rule


# (lower_inclusive, upper_exclusive, verdict_label)
_VERDICT_BANDS = (
    (0, 20, "low"),
    (20, 40, "review_recommended"),
    (40, 60, "high_priority"),
    (60, 101, "quarantine"),
)


def verdict(score: float) -> str:
    for lo, hi, name in _VERDICT_BANDS:
        if lo <= score < hi:
            return name
    return "quarantine"
