"""
phase0_acquire_and_verify.py — Acquire, validate, and verify the DCAS extract
TruthEngine360 | AUMER Foundation | USC Sol Price School

Input:  data_raw/dcas_vietnam.csv  (manual download from NARA ID 2240992)
        data_raw/Names_2010Census.csv  (Census 2010 Surnames)
Output: outputs/missing_by_column.csv
        outputs/ethnic_short_counts.csv
        outputs/race_counts.csv
        outputs/cause_counts.csv
        outputs/phase0_report.json
        logs/phase0.log

Usage:
    python phase0_acquire_and_verify.py
    python phase0_acquire_and_verify.py --dcas path/to/dcas.csv
    python phase0_acquire_and_verify.py --dcas path/to/dcas.csv --census path/to/surnames.csv
"""
import argparse
import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

from config import ANCHOR, LOGS, OUTPUTS, REQUIRED_COLUMNS
from io_dcas import (
    read_census_surnames,
    read_dcas_csv,
    resolve_columns,
    validate_dcas,
    write_validation_report,
)

# ── LOGGING ───────────────────────────────────────────────────────────────────
LOG_FILE = LOGS / "phase0.log"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
    ],
)
log = logging.getLogger(__name__)


def _cause_counts(df, out: Path) -> None:
    """Write top causes of death to CSV."""
    if "INCIDENT_CASUALTY_REASON" not in df.columns:
        log.warning("INCIDENT_CASUALTY_REASON not found — cause_counts.csv skipped.")
        return
    vc = (
        df["INCIDENT_CASUALTY_REASON"]
        .fillna("(null)")
        .str.upper()
        .value_counts()
    )
    vc.reset_index().rename(columns={"index":"value","INCIDENT_CASUALTY_REASON":"count"}) \
      .to_csv(out / "cause_counts.csv", index=False)
    log.info("cause_counts.csv: %d distinct values.", len(vc))


def main(dcas_path=None, census_path=None):
    log.info("═══ PHASE 0: ACQUIRE & VERIFY ═══")
    log.info("Start time: %s", datetime.now(timezone.utc).isoformat())

    # ── 1. Load DCAS ──────────────────────────────────────────────────────────
    try:
        raw = read_dcas_csv(dcas_path)
    except FileNotFoundError as e:
        log.error(str(e))
        log.error(
            "\n  To download: https://catalog.archives.gov/id/2240992\n"
            "  Place the CSV at: data_raw/dcas_vietnam.csv\n"
            "  Then re-run this script."
        )
        sys.exit(1)

    log.info("Raw file loaded: %d rows × %d columns.", *raw.shape)

    # ── 2. Resolve column aliases ────────────────────────────────────────────
    raw = resolve_columns(raw)
    log.info("Columns after alias resolution: %s", list(raw.columns))

    # ── 3. Validate ───────────────────────────────────────────────────────────
    report = validate_dcas(raw)
    log.info(
        "Present required columns: %d/%d  |  Missing: %s",
        len(report["present_columns"]),
        len(REQUIRED_COLUMNS),
        report["missing_columns"] or "None",
    )

    # ── 4. Anchor verification ────────────────────────────────────────────────
    log.info("─── ANCHOR CHECKS ───")
    n = report["shape"][0]
    if n == ANCHOR["dcas_total"]:
        log.info("✓  Record count: %d (matches anchor)", n)
    else:
        log.warning("⚠  Record count: %d (anchor expects %d, delta=%+d)",
                    n, ANCHOR["dcas_total"], n - ANCHOR["dcas_total"])

    if report["ethnic_short_counts"]:
        hisp_keys = {"HISPANIC","HISPANIC OR LATINO","PUERTO RICAN",
                     "MEXICAN AMERICAN","CUBAN","OTHER SPANISH"}
        n_hisp = sum(v for k, v in report["ethnic_short_counts"].items()
                     if k in hisp_keys)
        if abs(n_hisp - ANCHOR["official_hispanic"]) <= 10:
            log.info("✓  Official Hispanic count: %d (anchor: %d)",
                     n_hisp, ANCHOR["official_hispanic"])
        else:
            log.warning("⚠  Official Hispanic count: %d (anchor expects %d)",
                        n_hisp, ANCHOR["official_hispanic"])

    # ── 5. Write CSVs ─────────────────────────────────────────────────────────
    write_validation_report(report, OUTPUTS)
    _cause_counts(raw, OUTPUTS)

    # ── 6. Verify Census surnames file ────────────────────────────────────────
    census = read_census_surnames(census_path)
    if census.empty:
        log.warning(
            "Census surnames file unavailable. "
            "BIFSG will use embedded 200-surname fallback. "
            "For full coverage download: "
            "https://www.census.gov/topics/population/genealogy/data/2010_surnames.html"
        )
    else:
        log.info("✓  Census surnames: %d rows loaded.", len(census))

    # ── 7. Save phase0 JSON report ────────────────────────────────────────────
    report_out = OUTPUTS / "phase0_report.json"
    json_report = {
        "phase":             "phase0",
        "timestamp":         datetime.now(timezone.utc).isoformat(),
        "shape":             list(report["shape"]),
        "present_columns":   report["present_columns"],
        "missing_columns":   report["missing_columns"],
        "null_counts":       report["null_counts"],
        "ethnic_short_counts_top10": dict(
            sorted(report["ethnic_short_counts"].items(), key=lambda x: -x[1])[:10]
        ),
        "year_range":        list(report["year_range"]),
        "anchor_verified":   report.get("anchor_ok", False),
        "census_loaded":     not census.empty,
    }
    with open(report_out, "w", encoding="utf-8") as fh:
        json.dump(json_report, fh, indent=2)
    log.info("Phase 0 report saved: %s", report_out)

    # ── 8. Summary ────────────────────────────────────────────────────────────
    print("\n" + "═"*60)
    print("  PHASE 0 COMPLETE")
    print(f"  Records loaded   : {n:,}")
    print(f"  Required columns : {len(report['present_columns'])}/{len(REQUIRED_COLUMNS)} present")
    print(f"  Year range       : {report['year_range']}")
    print(f"  Census surnames  : {'loaded' if not census.empty else 'MISSING (fallback)'}")
    if report["missing_columns"]:
        print(f"  ⚠  Missing cols  : {report['missing_columns']}")
    print("═"*60 + "\n")

    return raw, census


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Phase 0: DCAS acquire & verify")
    parser.add_argument("--dcas",   type=Path, default=None,
                        help="Path to DCAS CSV (default: data_raw/dcas_vietnam.csv)")
    parser.add_argument("--census", type=Path, default=None,
                        help="Path to Census surnames CSV (default: data_raw/Names_2010Census.csv)")
    args = parser.parse_args()
    main(args.dcas, args.census)
