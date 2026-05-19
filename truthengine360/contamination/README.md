# truthengine360.contamination

Forensic detector for AI-generated synthetic material that mimics historical evidence. First implemented slice of the TruthEngine360 MVP plan — the five-category contamination scoring engine described in the plan's "AI contamination detection" section.

## What it does

Takes a `Document` (subset of the evidence-table fields from the MVP schema) and returns a `ContaminationReport` with:

- a 0–100 composite score
- a verdict (`low` / `review_recommended` / `high_priority` / `quarantine`)
- per-category subscores (structural / statistical / linguistic / citation / image)
- a sorted list of `Finding`s naming exactly which rules fired, with severity and supporting evidence

The composite uses the weights from the MVP plan:

```
composite = 0.25*structural + 0.20*statistical + 0.20*linguistic + 0.20*citation + 0.15*image
```

## Library use

```python
from datetime import date
from truthengine360.contamination import Document, score

doc = Document(
    title="Restitution Award",
    ocr_text="Transaction ID: WF-1907-TX-00042  Amount: $639,000,000 ...",
    archive_name="Wells Fargo Internal",
    record_date_start=date(1907, 6, 1),
)

report = score(doc)
print(report.verdict)                  # 'quarantine'
print(report.composite_score)          # ~50+
for f in report.findings:
    print(f.rule_id, f.severity, f.message)
```

## CLI

```
python -m truthengine360.contamination sample.json
```

Input JSON shape matches the `Document` dataclass; dates are ISO strings. Output is the report on stdout. Exit code is `0` for `low` / `review_recommended` and `1` for `high_priority` / `quarantine` — designed to drop straight into a CI gate or a connector ingestion pipeline.

## Tests

```
pip install pytest
pytest truthengine360/contamination/tests
```

The `test_terminel_samples.py` suite is the end-to-end smoke test: it feeds stylized versions of the actual fabricated Wells Fargo material from the Terminel-Sagasta audit and asserts they land in `high_priority` or `quarantine`, then feeds stylized NARA and AHES records and asserts they land in `low`.

## Rule reference

| ID | Category | Signal |
|---|---|---|
| `S001_invalid_archive_locator` | structural | Known archive cited without expected locator (e.g. NARA without RG number) |
| `S002_invented_identifier` | structural | Synthetic-looking IDs (`WF-1907-TX-00042`, `MEMO-00042`) |
| `S003_missing_provenance` | structural | Substantive text with no archive locator at all |
| `T001_round_currency_concentration` | statistical | Currency figures are mostly exact multiples of 1K/10K/100K/1M |
| `T002_powers_of_ten_sequence` | statistical | Three or more currency figures are exact powers of ten |
| `L001_modern_phrasing` | linguistic | Modern business idiom in pre-1960 record |
| `L002_llm_discourse_markers` | linguistic | Multiple LLM-style discourse markers in same document |
| `C001_inaccessible_reference` | citation | "Internal memo" / "private correspondence" without retrievable locator |
| `C002_anachronistic_titles` | citation | Modern corporate titles in pre-1960 record |
| `I001_ocr_too_clean` | image | OCR confidence ≥98% on a long pre-1980 record |
| `I002_pdf_authored_not_scanned` | image | PDF Producer is an authoring app (Word, Pages, an LLM client) on a pre-1980 record |

## Adding a rule

1. Write a function `rule_<name>(doc: Document) -> list[Finding]` in the appropriate category module under `rules/`.
2. Append it to the category's `*_rules` list at the bottom of that module.
3. Add tests covering both the positive and negative case.

Severity is the rule's contribution to its category subscore. Categories cap at 100, so a single rule firing at `severity=100` saturates that category alone. Use lower severities (20–40) for soft signals, higher (60–80) for unambiguous ones.

## What this module is NOT

- Not a binary classifier. The output is a graduated score with a recommended verdict; final disposition is the reviewer's call.
- Not a substitute for forensic image analysis. The `image` category captures only OCR-confidence and PDF-metadata signals; full image forensics belongs in a separate module.
- Not a primary-source verifier. It can tell you a document looks synthetic; it cannot tell you a real document is real. Verification still requires an actual archive lookup.
