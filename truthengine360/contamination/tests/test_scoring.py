from datetime import date

from truthengine360.contamination import (
    CATEGORY_WEIGHTS,
    Category,
    ContaminationReport,
    Document,
    Finding,
    score,
    verdict,
)


def _const_rule(findings):
    def rule(_doc):
        return list(findings)
    return rule


def test_verdict_bands():
    assert verdict(0) == "low"
    assert verdict(19.9) == "low"
    assert verdict(20) == "review_recommended"
    assert verdict(39.9) == "review_recommended"
    assert verdict(40) == "high_priority"
    assert verdict(59.9) == "high_priority"
    assert verdict(60) == "quarantine"
    assert verdict(100) == "quarantine"


def test_empty_document_scores_low():
    report = score(Document(title="empty"))
    assert isinstance(report, ContaminationReport)
    assert report.composite_score == 0.0
    assert report.verdict == "low"


def test_category_subscore_caps_at_100():
    finding = Finding(
        rule_id="x", category=Category.STRUCTURAL, severity=200, message=""
    )
    report = score(Document(title="t"), rules=[_const_rule([finding])])
    assert report.category_scores[Category.STRUCTURAL] == 100.0
    # Structural weight is 0.25 → composite must be 25.0
    assert report.composite_score == 25.0


def test_weights_sum_to_one():
    assert abs(sum(CATEGORY_WEIGHTS.values()) - 1.0) < 1e-9


def test_findings_sorted_by_severity_desc():
    f1 = Finding(rule_id="a", category=Category.STRUCTURAL, severity=10, message="")
    f2 = Finding(rule_id="b", category=Category.LINGUISTIC, severity=80, message="")
    f3 = Finding(rule_id="c", category=Category.IMAGE, severity=40, message="")
    report = score(Document(title="t"), rules=[_const_rule([f1, f2, f3])])
    severities = [f.severity for f in report.findings]
    assert severities == sorted(severities, reverse=True)


def test_to_dict_round_trip_serializable():
    import json

    f = Finding(rule_id="r", category=Category.CITATION, severity=50, message="m")
    report = score(Document(title="t", record_date_start=date(1900, 1, 1)), rules=[_const_rule([f])])
    out = json.dumps(report.to_dict())
    parsed = json.loads(out)
    assert parsed["verdict"] in ("low", "review_recommended", "high_priority", "quarantine")
    assert parsed["category_scores"]["citation"] == 50.0
