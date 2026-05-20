"""
phase6_exports_for_spss.py — Final exports for SPSS, web API, and archive
TruthEngine360 | AUMER Foundation | USC Sol Price School

Input:  data_processed/dcas_analysis_ready.parquet  (from phase3)
        outputs/test_battery_t1_t5.json             (from phase4, optional)
        outputs/test_battery_t6_t7.json             (from phase5, optional)
        outputs/logit_mine_death.json               (from phase5, optional)
Output: outputs/dcas_spss_<timestamp>.csv      — SPSS import file
        outputs/variable_dictionary_<timestamp>.csv — codebook
        outputs/dcas_full_export_<timestamp>.csv    — unrestricted export
        outputs/analysis_manifest_<timestamp>.json  — full run manifest
        outputs/analysis_summary.txt               — human-readable QA summary
        logs/phase6.log

Usage:
    python phase6_exports_for_spss.py
    python phase6_exports_for_spss.py --input path/to/ready.parquet
    python phase6_exports_for_spss.py --full-export   # include all columns
"""
import argparse
import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

from config import ANCHOR, DCAS_FEATURES, LOGS, OUTPUTS, TAU_PRIMARY
from io_dcas import read_dcas_parquet
from reporting import (
    save_parquet,
    save_spss_csv,
    save_variable_dict,
    text_summary,
)

# ── LOGGING ───────────────────────────────────────────────────────────────────
LOG_FILE = LOGS / "phase6.log"
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

_TS = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def _load_json_results(path: Path) -> list:
    """Load test results from JSON; return empty list if file absent."""
    if not path.exists():
        log.warning("Test results file not found: %s", path)
        return []
    with open(path, encoding="utf-8") as fh:
        doc = json.load(fh)
    return doc.get("tests", [])


def _build_manifest(df: pd.DataFrame, files: dict, meta: dict) -> dict:
    """Construct the full run manifest for archival."""
    flag_cols = [c for c in df.columns if c.endswith("_flag")]
    flag_summary = {}
    for col in flag_cols:
        n   = int(df[col].fillna(False).sum())
        pct = round(100 * n / len(df), 3) if len(df) else 0
        flag_summary[col] = {"n": n, "pct": pct}

    n_official = int(df["ethnic_hispanic"].fillna(False).sum()) if "ethnic_hispanic" in df.columns else None
    n_bisg     = int(df.get("suppressed_hispanic_proxy_flag", pd.Series(False, index=df.index))
                     .fillna(False).sum())

    return {
        "schema_version":   "1.0",
        "generated_at":     datetime.now(timezone.utc).isoformat(),
        "data_source":      "NARA ID 2240992 — DCAS Vietnam Conflict Extract File",
        "anchor_metrics":   ANCHOR,
        "tau_primary":      TAU_PRIMARY,
        "n_records":        len(df),
        "n_columns":        len(df.columns),
        "n_official_hispanic": n_official,
        "n_bifsg_suppressed":  n_bisg,
        "flag_summary":     flag_summary,
        "output_files":     {k: str(v) for k, v in files.items()},
        **meta,
    }


def main(input_path=None, full_export=False):
    log.info("═══ PHASE 6: EXPORTS FOR SPSS ═══")
    log.info("Start: %s", datetime.now(timezone.utc).isoformat())

    # ── 1. Load analysis-ready parquet ───────────────────────────────────────
    try:
        df = read_dcas_parquet(input_path if input_path else DCAS_FEATURES)
    except FileNotFoundError as e:
        log.error(str(e))
        sys.exit(1)

    log.info("Input: %d rows × %d cols.", *df.shape)

    # ── 2. SPSS CSV (restricted columns) ─────────────────────────────────────
    spss_path = save_spss_csv(df, OUTPUTS / f"dcas_spss_{_TS}.csv")
    log.info("SPSS CSV: %s", spss_path)

    # ── 3. Full export (all columns) ──────────────────────────────────────────
    full_path = None
    if full_export:
        full_path = OUTPUTS / f"dcas_full_export_{_TS}.csv"
        bool_cols = df.select_dtypes(include="bool").columns
        df_exp = df.copy()
        for col in bool_cols:
            df_exp[col] = df_exp[col].astype(int)
        df_exp.to_csv(full_path, index=False, encoding="utf-8")
        log.info("Full export CSV: %s", full_path)

    # ── 4. Variable dictionary (codebook) ────────────────────────────────────
    dict_path = save_variable_dict(OUTPUTS / f"variable_dictionary_{_TS}.csv")

    # ── 5. Plain-text summary ─────────────────────────────────────────────────
    t1_t5 = _load_json_results(OUTPUTS / "test_battery_t1_t5.json")
    t6_t7 = _load_json_results(OUTPUTS / "test_battery_t6_t7.json")

    # Reconstruct minimal TestResult-like objects for text_summary
    class _Tr:
        def __init__(self, d):
            self.test_id   = d.get("test_id","?")
            self.name      = d.get("name","?")
            self.p_value   = d.get("p_value", float("nan"))
            self.reject_h0 = d.get("reject_h0", False)
            self.statistic = d.get("statistic")

    results_obj = [_Tr(d) for d in (t1_t5 + t6_t7)]
    summary_txt = text_summary(df, results_obj if results_obj else None)

    summary_path = OUTPUTS / "analysis_summary.txt"
    with open(summary_path, "w", encoding="utf-8") as fh:
        fh.write(summary_txt)
    log.info("Summary text: %s", summary_path)
    print(summary_txt)

    # ── 6. Manifest ───────────────────────────────────────────────────────────
    meta = {}
    logit_path = OUTPUTS / "logit_mine_death.json"
    if logit_path.exists():
        with open(logit_path, encoding="utf-8") as fh:
            meta["logit_results"] = json.load(fh)

    files = {
        "spss_csv":          spss_path,
        "variable_dict":     dict_path,
        "analysis_summary":  summary_path,
    }
    if full_path:
        files["full_export"] = full_path

    manifest = _build_manifest(df, files, meta)
    manifest_path = OUTPUTS / f"analysis_manifest_{_TS}.json"
    with open(manifest_path, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=2, default=str)
    log.info("Manifest: %s", manifest_path)

    # ── 7. Final summary ──────────────────────────────────────────────────────
    n_official = manifest.get("n_official_hispanic", "?")
    n_bisg     = manifest.get("n_bifsg_suppressed", "?")

    print("\n" + "═"*60)
    print("  PHASE 6 COMPLETE — ALL EXPORTS WRITTEN")
    print(f"  SPSS CSV        : {spss_path.name}")
    print(f"  Variable dict   : {dict_path.name}")
    print(f"  Manifest        : {manifest_path.name}")
    print(f"  Official Hispanic in DCAS : {n_official}")
    print(f"  BIFSG suppressed cohort   : {n_bisg}")
    print(f"  Anchor failure rate       : {ANCHOR['failure_rate']:.1%}")
    print(f"  Impossibility z           : {ANCHOR['impossibility_sigma']:.1f}σ")
    print("═"*60 + "\n")

    return manifest


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Phase 6: SPSS exports and archive")
    parser.add_argument("--input",       type=Path, default=None)
    parser.add_argument("--full-export", action="store_true",
                        help="Also write CSV with all columns (not just SPSS subset).")
    args = parser.parse_args()
    main(args.input, args.full_export)
