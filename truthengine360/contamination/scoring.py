"""Composite scoring engine.

`score(doc)` runs all registered rules, aggregates findings per category
(capped at 100 each), then applies the category weights to produce a
0-100 composite score and verdict.
"""

from dataclasses import dataclass, field
from typing import Callable, Iterable, List, Optional

from .document import Document
from .findings import CATEGORY_WEIGHTS, Category, Finding, verdict


Rule = Callable[[Document], List[Finding]]


@dataclass
class ContaminationReport:
    composite_score: float
    verdict: str
    category_scores: dict  # Category -> float in [0, 100]
    findings: List[Finding] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "composite_score": round(self.composite_score, 1),
            "verdict": self.verdict,
            "category_scores": {
                c.value: round(s, 1) for c, s in self.category_scores.items()
            },
            "findings": [
                {
                    "rule_id": f.rule_id,
                    "category": f.category.value,
                    "severity": f.severity,
                    "message": f.message,
                    "evidence": f.evidence,
                }
                for f in self.findings
            ],
        }


def score(doc: Document, rules: Optional[Iterable[Rule]] = None) -> ContaminationReport:
    if rules is None:
        # Late import to keep this module free of rule-import side effects.
        from .rules import ALL_RULES

        rules = ALL_RULES

    findings: List[Finding] = []
    for rule in rules:
        findings.extend(rule(doc))

    category_scores = {c: 0.0 for c in Category}
    for f in findings:
        # Cap each category at 100 — additional findings of the same kind
        # don't push the subscore higher than its maximum contribution.
        category_scores[f.category] = min(100.0, category_scores[f.category] + f.severity)

    composite = sum(category_scores[c] * w for c, w in CATEGORY_WEIGHTS.items())
    composite = max(0.0, min(100.0, composite))

    findings_sorted = sorted(findings, key=lambda f: -f.severity)
    return ContaminationReport(
        composite_score=composite,
        verdict=verdict(composite),
        category_scores=category_scores,
        findings=findings_sorted,
    )
