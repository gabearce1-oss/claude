"""
phase4_test1_test2.py — Chi-square tests: MOS × BIFSG, Cause × BIFSG
TruthEngine360 | AUMER Foundation | USC Sol Price School

Runs Tests T1–T5 from the pre-specified 7-test battery.
T4 and T7 require the analysis-ready DataFrame; T1–T3 and T5 use anchor values.

Input:  data_processed/dcas_analysis_ready.parquet  (from phase3)
Output: outputs/test_battery_partial.json
        outputs/crosstab_mos_bifsg.csv
        outputs/crosstab_cause_bifsg.csv
        logs/phase4.log

Usage:
    python phase4_test1_test2.py
    python phase4_test1_test2.py --tau 0.40
"""
import argparse
import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
from scipy import stats as scipy_stats

from config import DCAS_FEATURES, LOGS, OUTPUTS, TAU_PRIMARY
from io_dcas import read_dcas_parquet
from stats import (
    run_7_test_battery,
    test_t1_bernoulli_variance,
    test_t2_calibration,
    test_t3_impossibility_score,
    test_t4_chi2_branch,
    test_t5_jaccard,
)
from reporting import save_test_results_json

# ── LOGGING ───────────────────────────────────────────────────────────────────
LOG_FILE = LOGS / "phase4.log"
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


def chi2_mos_x_bifsg(df: pd.DataFrame, tau: float) -> pd.DataFrame:
    """
    Chi-square: MOS tier × BIFSG suppression flag.
    Returns crosstab DataFrame for export.
    """
    if not {"tier1_mos_flag", "suppressed_hispanic_proxy_flag"}.issubset(df.columns):
        log.warning("MOS × BIFSG crosstab skipped — missing columns.")
        return pd.DataFrame()

    df["mos_tier"] = "Other"
    if "tier1_mos_flag" in df.columns:
        df.loc[df["tier1_mos_flag"].fillna(False), "mos_tier"] = "Tier1"
    if "tier2_mos_flag" in df.columns:
        df.loc[df["tier2_mos_flag"].fillna(False), "mos_tier"] = "Tier2"

    ct = pd.crosstab(
        df["mos_tier"],
        df["suppressed_hispanic_proxy_flag"].fillna(False).map({True:"Suppressed",False:"Not Suppressed"}),
        margins=True,
    )
    chi2, p, dof, expected = scipy_stats.chi2_contingency(
        ct.iloc[:-1, :-1].values  # exclude margins
    )
    log.info(
        "MOS × BIFSG: χ²(%d)=%.2f, p=%.4f",
        dof, chi2, p,
    )
    return ct


def chi2_cause_x_bifsg(df: pd.DataFrame) -> pd.DataFrame:
    """
    Chi-square: cause of death category × BIFSG suppression flag.
    """
    if not {"mine_death_flag", "small_arms_flag", "artillery_flag",
            "suppressed_hispanic_proxy_flag"}.issubset(df.columns):
        log.warning("Cause × BIFSG crosstab skipped — missing columns.")
        return pd.DataFrame()

    def _cause_cat(row):
        if row.get("mine_death_flag", False):
            return "Mine/Booby Trap"
        if row.get("small_arms_flag", False):
            return "Small Arms"
        if row.get("artillery_flag", False):
            return "Artillery/Mortar"
        return "Other/Unknown"

    df["cause_cat"] = df.apply(_cause_cat, axis=1)

    ct = pd.crosstab(
        df["cause_cat"],
        df["suppressed_hispanic_proxy_flag"].fillna(False).map({True:"Suppressed",False:"Not Suppressed"}),
        margins=True,
    )
    chi2, p, dof, _ = scipy_stats.chi2_contingency(ct.iloc[:-1, :-1].values)
    log.info("Cause × BIFSG: χ²(%d)=%.2f, p=%.4f", dof, chi2, p)
    return ct


def main(input_path=None, tau=TAU_PRIMARY):
    log.info("═══ PHASE 4: T1–T5 TESTS ═══")
    log.info("Start: %s", datetime.now(timezone.utc).isoformat())

    # ── 1. Load ───────────────────────────────────────────────────────────────
    try:
        df = read_dcas_parquet(input_path if input_path else DCAS_FEATURES)
    except FileNotFoundError as e:
        log.error(str(e))
        sys.exit(1)

    log.info("Input: %d rows × %d cols.", *df.shape)

    # ── 2. Run T1–T5 ─────────────────────────────────────────────────────────
    results = [
        test_t1_bernoulli_variance(),
        test_t2_calibration(df),
        test_t3_impossibility_score(),
        test_t4_chi2_branch(df, tau=tau),
        test_t5_jaccard(df, tau=tau),
    ]

    for r in results:
        status = "✓ REJECT H0" if r.reject_h0 else "  retain H0"
        log.info("[%s] %s %s  p=%.2e", r.test_id, status, r.name, r.p_value)

    # ── 3. MOS × BIFSG crosstab ───────────────────────────────────────────────
    ct_mos = chi2_mos_x_bifsg(df.copy(), tau)
    if not ct_mos.empty:
        mos_csv = OUTPUTS / "crosstab_mos_bifsg.csv"
        ct_mos.to_csv(mos_csv)
        log.info("MOS × BIFSG crosstab: %s", mos_csv)

    # ── 4. Cause × BIFSG crosstab ─────────────────────────────────────────────
    ct_cause = chi2_cause_x_bifsg(df.copy())
    if not ct_cause.empty:
        cause_csv = OUTPUTS / "crosstab_cause_bifsg.csv"
        ct_cause.to_csv(cause_csv)
        log.info("Cause × BIFSG crosstab: %s", cause_csv)

    # ── 5. Save results ───────────────────────────────────────────────────────
    out_json = save_test_results_json(
        results,
        OUTPUTS / "test_battery_t1_t5.json",
        meta={"phase": "phase4", "tau": tau},
    )

    # ── 6. Summary ────────────────────────────────────────────────────────────
    n_reject = sum(1 for r in results if r.reject_h0)
    print("\n" + "═"*60)
    print("  PHASE 4 COMPLETE — T1–T5")
    for r in results:
        sym = "✓" if r.reject_h0 else "·"
        print(f"  {sym} [{r.test_id}] {r.name:<40}  p={r.p_value:.2e}")
    print(f"  H0 rejected: {n_reject}/{len(results)}")
    print(f"  Results: {out_json}")
    print("═"*60 + "\n")

    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Phase 4: T1–T5 test battery")
    parser.add_argument("--input", type=Path, default=None)
    parser.add_argument("--tau",   type=float, default=TAU_PRIMARY)
    args = parser.parse_args()
    main(args.input, args.tau)
