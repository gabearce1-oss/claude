"""
phase3_feature_engineering.py — Build all analytic feature flags
TruthEngine360 | AUMER Foundation | USC Sol Price School

Input:  data_processed/dcas_bifsg.parquet  (from phase2)
Output: data_processed/dcas_analysis_ready.parquet
        outputs/feature_summary.csv
        outputs/phase3_report.json
        logs/phase3.log

Usage:
    python phase3_feature_engineering.py
    python phase3_feature_engineering.py --input path/to/bifsg.parquet
    python phase3_feature_engineering.py --tau 0.50
"""
import argparse
import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

from config import DCAS_BIFSG, DCAS_FEATURES, LOGS, OUTPUTS, TAU_PRIMARY
from io_dcas import read_dcas_parquet
from features import engineer_all_features, feature_summary
from reporting import save_parquet

# ── LOGGING ───────────────────────────────────────────────────────────────────
LOG_FILE = LOGS / "phase3.log"
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


def main(input_path=None, output_path=None, tau=TAU_PRIMARY):
    log.info("═══ PHASE 3: FEATURE ENGINEERING ═══")
    log.info("Start time: %s", datetime.now(timezone.utc).isoformat())
    log.info("Primary tau: %.2f", tau)

    # ── 1. Load scored parquet ────────────────────────────────────────────────
    try:
        df = read_dcas_parquet(input_path if input_path else DCAS_BIFSG)
    except FileNotFoundError as e:
        log.error(str(e))
        sys.exit(1)

    log.info("Input: %d rows × %d cols.", *df.shape)

    # ── 2. Engineer features ──────────────────────────────────────────────────
    df = engineer_all_features(df, tau=tau)

    # ── 3. Feature summary ────────────────────────────────────────────────────
    summary = feature_summary(df)
    log.info("Feature summary:")
    for col, stats in sorted(summary.items()):
        log.info("  %-50s  %6d  (%.1f%%)", col, stats["n"], stats["pct"])

    feat_csv = OUTPUTS / "feature_summary.csv"
    pd.DataFrame([
        {"flag": col, "n": v["n"], "pct": v["pct"]}
        for col, v in sorted(summary.items())
    ]).to_csv(feat_csv, index=False)
    log.info("Feature summary CSV: %s", feat_csv)

    # ── 4. Cross-tab: suppressed × tier1 MOS ─────────────────────────────────
    if {"suppressed_hispanic_proxy_flag", "tier1_mos_flag"}.issubset(df.columns):
        ct = pd.crosstab(
            df["suppressed_hispanic_proxy_flag"].fillna(False),
            df["tier1_mos_flag"].fillna(False),
            margins=True,
        )
        log.info("Suppressed × Tier1 MOS:\n%s", ct.to_string())

    # ── 5. Save analysis-ready parquet ───────────────────────────────────────
    out_path = Path(output_path) if output_path else DCAS_FEATURES
    save_parquet(df, out_path, label="dcas_analysis_ready")

    # ── 6. Save report ────────────────────────────────────────────────────────
    report = {
        "phase":          "phase3",
        "timestamp":      datetime.now(timezone.utc).isoformat(),
        "tau":            tau,
        "n_rows":         len(df),
        "n_flags":        len(summary),
        "feature_summary":summary,
        "output_file":    str(out_path),
    }
    report_out = OUTPUTS / "phase3_report.json"
    with open(report_out, "w", encoding="utf-8") as fh:
        json.dump(report, fh, indent=2, default=str)
    log.info("Phase 3 report saved: %s", report_out)

    # ── 7. Summary ────────────────────────────────────────────────────────────
    n_supp = summary.get("suppressed_hispanic_proxy_flag", {}).get("n", 0)
    pct_supp = summary.get("suppressed_hispanic_proxy_flag", {}).get("pct", 0)
    print("\n" + "═"*60)
    print("  PHASE 3 COMPLETE")
    print(f"  Rows             : {len(df):,}")
    print(f"  Flag columns     : {len(summary)}")
    print(f"  Suppressed proxy : {n_supp:,}  ({pct_supp:.1f}%)")
    print(f"  Output           : {out_path}")
    print("═"*60 + "\n")

    return df


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Phase 3: Feature engineering")
    parser.add_argument("--input",  type=Path, default=None)
    parser.add_argument("--output", type=Path, default=None)
    parser.add_argument("--tau",    type=float, default=TAU_PRIMARY)
    args = parser.parse_args()
    main(args.input, args.output, args.tau)
