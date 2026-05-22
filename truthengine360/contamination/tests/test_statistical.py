from truthengine360.contamination import Document
from truthengine360.contamination.rules.statistical import (
    _is_pure_power_of_ten,
    _is_round,
    rule_powers_of_ten_sequence,
    rule_round_currency_concentration,
)


def test_is_round_helpers():
    assert _is_round(1_000)
    assert _is_round(100_000)
    assert _is_round(639_000_000)
    assert not _is_round(123_456)
    assert not _is_round(999)
    assert not _is_round(1_001)


def test_is_pure_power_of_ten():
    assert _is_pure_power_of_ten(100)
    assert _is_pure_power_of_ten(1_000)
    assert _is_pure_power_of_ten(1_000_000)
    assert not _is_pure_power_of_ten(200)
    assert not _is_pure_power_of_ten(1_500)
    assert not _is_pure_power_of_ten(50)


def test_concentration_fires_on_many_round_amounts():
    text = "Transfers: $1,000,000, $10,000,000, $639,000,000, $250,000,000."
    doc = Document(title="t", ocr_text=text)
    findings = rule_round_currency_concentration(doc)
    assert findings
    assert findings[0].rule_id == "T001_round_currency_concentration"


def test_concentration_quiet_on_messy_amounts():
    text = "Payments: $12,374, $6,891, $44,209, $1,733, $99,012."
    doc = Document(title="t", ocr_text=text)
    assert rule_round_currency_concentration(doc) == []


def test_powers_of_ten_sequence():
    text = "Amounts of $100, $1,000, $10,000, $100,000 were recorded."
    doc = Document(title="t", ocr_text=text)
    findings = rule_powers_of_ten_sequence(doc)
    assert findings
    assert findings[0].rule_id == "T002_powers_of_ten_sequence"


def test_powers_of_ten_quiet_below_threshold():
    text = "An amount of $1,000 was paid."
    doc = Document(title="t", ocr_text=text)
    assert rule_powers_of_ten_sequence(doc) == []


def test_suffix_currency_forms_extracted():
    # Both "100 pesos" and "2,500 USD" should be captured alongside prefix forms.
    text = "Paid 100 pesos, 1,000 pesos, 10,000 pesos, and 100,000 pesos."
    doc = Document(title="t", ocr_text=text)
    findings = rule_powers_of_ten_sequence(doc)
    assert findings, "suffix-form currency should feed statistical rules"
    assert findings[0].rule_id == "T002_powers_of_ten_sequence"
