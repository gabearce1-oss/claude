"""Command-line entry point.

Usage:
    python -m truthengine360.contamination <document.json>

Input JSON shape matches the Document dataclass. Dates are ISO strings.
Output is a JSON contamination report on stdout. Exit code is 0 for
'low' / 'review_recommended' and 1 for 'high_priority' / 'quarantine',
so the CLI plays well with CI gates.
"""

import json
import sys
from datetime import date

from .document import Document
from .scoring import score


def _parse_date(v):
    if not v:
        return None
    if isinstance(v, date):
        return v
    return date.fromisoformat(str(v))


def main(argv=None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    if len(argv) != 1 or argv[0] in ("-h", "--help"):
        print("usage: python -m truthengine360.contamination <document.json>", file=sys.stderr)
        return 2

    with open(argv[0]) as fh:
        data = json.load(fh)

    data["record_date_start"] = _parse_date(data.get("record_date_start"))
    data["record_date_end"] = _parse_date(data.get("record_date_end"))

    # Drop unknown keys so additions to the JSON schema don't crash the loader.
    allowed = Document.__dataclass_fields__.keys()
    doc = Document(**{k: v for k, v in data.items() if k in allowed})

    report = score(doc)
    json.dump(report.to_dict(), sys.stdout, indent=2)
    sys.stdout.write("\n")
    return 0 if report.verdict in ("low", "review_recommended") else 1


if __name__ == "__main__":
    sys.exit(main())
