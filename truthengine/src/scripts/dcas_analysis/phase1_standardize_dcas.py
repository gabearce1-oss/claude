"""
phase1_standardize_dcas.py — Clean and normalize the DCAS extract
TruthEngine360 | AUMER Foundation | USC Sol Price School

Input:  data_raw/dcas_vietnam.csv
Output: data_processed/dcas_clean.parquet
        outputs/phase1_report.json
        logs/phase1.log

Usage:
    python phase1_standardize_dcas.py
    python phase1_standardize_dcas.py --dcas path/to/dcas.csv
    python phase1_standardize_dcas.py --dcas path/to/dcas.csv --output path/to/out.parquet
"""
import argparse
import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

from config import ANCHOR, DCAS_CLEAN, LOGS, OUTPUTS
from io_dcas import read_dcas_csv, resolve_columns
from cleaning import clean_dcas
from reporting import save_parquet

# ── LOGGING ───────────────────────────────────────────────────────────────────
LOG_FILE = LOGS / "phase1.log"
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


def _profile_clean(df: pd.DataFrame) -> dict:
    """Quick profile of the cleaned DataFrame for the phase report."""
    profile = {
        "n_rows":     len(df),
        "n_cols":     len(df.columns),
        "columns":    list(df.columns),
    }

    for col in ["incident_year", "race_label", "branch_label", "mos_code", "hor_state"]:
        if col in df.columns:
            profile[f"{col}_counts"] = (
                df[col].fillna("(null)").value_counts().head(15).to_dict()
            )

    if "ethnic_hispanic" in df.columns:
        n_hisp = int(df["ethnic_hispanic"].sum())
        profile["n_ethnic_hispanic"] = n_hisp
        pct = 100 * n_hisp / len(df) if len(df) else 0
        profile["pct_ethnic_hispanic"] = round(pct, 4)
        if abs(n_hisp - ANCHOR["official_hispanic"]) <= 10:
            profile["anchor_hispanic_ok"] = True
        else:
            profile["anchor_hispanic_warning"] = (
                f"Got {n_hisp}, expected {ANCHOR['official_hispanic']}"
            )

    return profile


def main(dcas_path=None, output_path=None):
    log.info("═══ PHASE 1: STANDARDIZE DCAS ═══")
    log.info("Start time: %s", datetime.now(timezone.utc).isoformat())

    # ── 1. Load raw ───────────────────────────────────────────────────────────
    try:
        raw = read_dcas_csv(dcas_path)
    except FileNotFoundError as e:
        log.error(str(e))
        sys.exit(1)

    raw = resolve_columns(raw)
    log.info("Raw: %d rows × %d cols.", *raw.shape)

    # ── 2. Clean ──────────────────────────────────────────────────────────────
    clean = clean_dcas(raw)

    # ── 3. Profile ────────────────────────────────────────────────────────────
    profile = _profile_clean(clean)
    log.info("Clean shape: %d rows × %d cols.", profile["n_rows"], profile["n_cols"])

    if profile.get("anchor_hispanic_ok"):
        log.info("✓  Official Hispanic count: %d", profile["n_ethnic_hispanic"])
    elif "anchor_hispanic_warning" in profile:
        log.warning("⚠  %s", profile["anchor_hispanic_warning"])

    if "incident_year_counts" in profile:
        log.info("Year distribution: %s", profile["incident_year_counts"])

    # ── 4. Save parquet ───────────────────────────────────────────────────────
    out_path = Path(output_path) if output_path else DCAS_CLEAN
    save_parquet(clean, out_path, label="dcas_clean")

    # ── 5. Save report ────────────────────────────────────────────────────────
    report_out = OUTPUTS / "phase1_report.json"
    report = {
        "phase":        "phase1",
        "timestamp":    datetime.now(timezone.utc).isoformat(),
        "output_file":  str(out_path),
        "profile":      profile,
    }
    with open(report_out, "w", encoding="utf-8") as fh:
        json.dump(report, fh, indent=2, default=str)
    log.info("Phase 1 report saved: %s", report_out)

    # ── 6. Summary ────────────────────────────────────────────────────────────
    n_hisp = profile.get("n_ethnic_hispanic", "?")
    print("\n" + "═"*60)
    print("  PHASE 1 COMPLETE")
    print(f"  Clean rows       : {profile['n_rows']:,}")
    print(f"  Columns          : {profile['n_cols']}")
    print(f"  Official Hispanic: {n_hisp}")
    print(f"  Output           : {out_path}")
    print("═"*60 + "\n")

    return clean


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Phase 1: DCAS standardize")
    parser.add_argument("--dcas",   type=Path, default=None)
    parser.add_argument("--output", type=Path, default=None,
                        help=f"Output parquet path (default: {DCAS_CLEAN})")
    args = parser.parse_args()
    main(args.dcas, args.output)
