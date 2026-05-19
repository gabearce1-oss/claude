"""Statistical anomalies — currency figures that are too clean to be real
period data: high concentration of round multiples, sequences of powers
of ten, suspiciously uniform spacing."""

import re
from typing import List, Optional

from ..document import Document
from ..findings import Category, Finding


# Match currency in both prefix and suffix forms.
#   prefix:  $639,000,000 / USD 1,000 / MX$ 50 / pesos 250
#   suffix:  100 pesos / 50 dollars / 2,500 USD
# Groups: (prefix_amount, suffix_amount). Exactly one is set per match.
_CURRENCY_RE = re.compile(
    r"(?:(?:\$|USD\s*|MXN\s*|MX\$\s*|pesos?\s*|dollars?\s*)([\d][\d,]*(?:\.\d+)?))"
    r"|(?:([\d][\d,]*(?:\.\d+)?)\s*(?:USD\b|MXN\b|pesos?\b|dollars?\b))",
    re.I,
)


def _parse_amount(s: str) -> Optional[float]:
    try:
        return float(s.replace(",", ""))
    except ValueError:
        return None


def _match_amount(m: "re.Match[str]") -> Optional[float]:
    raw = m.group(1) or m.group(2)
    return _parse_amount(raw) if raw else None


def _is_round(amount: float) -> bool:
    """True when the amount is an exact multiple of a large round magnitude
    (1K, 10K, 100K, 1M, 10M, 100M). Small amounts are not flagged."""
    if amount < 1_000:
        return False
    for magnitude in (100_000_000, 10_000_000, 1_000_000, 100_000, 10_000, 1_000):
        if amount >= magnitude and amount % magnitude == 0:
            return True
    return False


def _is_pure_power_of_ten(amount: float) -> bool:
    """True for 100, 1_000, 10_000, ..., 1_000_000_000."""
    if amount < 100 or amount != int(amount):
        return False
    v = int(amount)
    while v > 1:
        if v % 10 != 0:
            return False
        v //= 10
    return v == 1


def _extract_amounts(text: str) -> List[float]:
    return [
        amount
        for amount in (_match_amount(m) for m in _CURRENCY_RE.finditer(text))
        if amount is not None
    ]


def rule_round_currency_concentration(doc: Document) -> List[Finding]:
    text = doc.ocr_text or ""
    amounts = [a for a in _extract_amounts(text) if a >= 1_000]
    if len(amounts) < 3:
        return []
    round_count = sum(1 for a in amounts if _is_round(a))
    ratio = round_count / len(amounts)
    if ratio < 0.6:
        return []
    severity = int(min(80, 20 + 50 * ratio))
    sample = ", ".join(f"${a:,.0f}" for a in amounts[:5])
    return [
        Finding(
            rule_id="T001_round_currency_concentration",
            category=Category.STATISTICAL,
            severity=severity,
            message=(
                f"{round_count} of {len(amounts)} currency figures are exact multiples "
                f"of large round magnitudes ({ratio:.0%})"
            ),
            evidence=sample,
        )
    ]


def rule_powers_of_ten_sequence(doc: Document) -> List[Finding]:
    text = doc.ocr_text or ""
    amounts = _extract_amounts(text)
    pure = [a for a in amounts if _is_pure_power_of_ten(a)]
    if len(pure) < 3:
        return []
    return [
        Finding(
            rule_id="T002_powers_of_ten_sequence",
            category=Category.STATISTICAL,
            severity=70,
            message=f"{len(pure)} currency figures are exact powers of ten",
            evidence=", ".join(f"${a:,.0f}" for a in pure[:5]),
        )
    ]


statistical_rules = [
    rule_round_currency_concentration,
    rule_powers_of_ten_sequence,
]
