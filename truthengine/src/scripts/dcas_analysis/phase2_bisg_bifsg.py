"""
phase2_bisg_bifsg.py — Compute BISG/BIFSG Hispanic probability scores
TruthEngine360 | AUMER Foundation | USC Sol Price School

Input:  data_processed/dcas_clean.parquet  (from phase1)
        data_raw/Names_2010Census.csv       (optional)
Output: data_processed/dcas_bifsg.parquet
        outputs/bisg_distribution.csv
        outputs/tau_sensitivity_table.csv
        outputs/phase2_report.json
        logs/phase2.log

Usage:
    python phase2_bisg_bifsg.py
    python phase2_bisg_bifsg.py --tau 0.40
    python phase2_bisg_bifsg.py --input path/to/clean.parquet --census path/to/surnames.csv
"""
import argparse
import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

from config import ANCHOR, DCAS_BIFSG, DCAS_CLEAN, LOGS, OUTPUTS, TAU_PRIMARY, TAU_SENSITIVITY
from io_dcas import read_census_surnames, read_dcas_parquet
from bifsg import build_scorer, score_dataframe
from reporting import save_parquet

# ── LOGGING ───────────────────────────────────────────────────────────────────
LOG_FILE = LOGS / "phase2.log"
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


def _tau_table(df: pd.DataFrame, p_col: str) -> pd.DataFrame:
    """
    For each tau in TAU_SENSITIVITY, compute n_flagged, pct_flagged,
    and failure_rate (FP / predicted_positive).
    """
    eth_col = "ethnic_hispanic"
    rows = []
    n_total   = len(df)
    n_official = int(df[eth_col].fillna(False).sum()) if eth_col in df.columns else ANCHOR["official_hispanic"]

    for tau in TAU_SENSITIVITY:
        above = df[p_col].fillna(0.0) >= tau
        n_above = int(above.sum())
        if eth_col in df.columns:
            eth = df[eth_col].fillna(False)
            n_tp = int((above & eth).sum())
            n_fp = int((above & ~eth).sum())
            fail_rate = n_fp / n_above if n_above > 0 else None
        else:
            n_tp, n_fp, fail_rate = None, None, None

        rows.append({
            "tau":           tau,
            "n_above_tau":   n_above,
            "pct_above_tau": round(100 * n_above / n_total, 3) if n_total else 0,
            "n_official":    n_official,
            "n_tp":          n_tp,
            "n_fp":          n_fp,
            "failure_rate":  round(fail_rate, 4) if fail_rate is not None else None,
        })
    return pd.DataFrame(rows)


def _band_distribution(df: pd.DataFrame) -> dict:
    """Count records in each bisg_tau_band."""
    if "bisg_tau_band" not in df.columns:
        return {}
    return df["bisg_tau_band"].fillna("unknown").value_counts().to_dict()


def main(input_path=None, census_path=None, output_path=None, tau=TAU_PRIMARY):
    log.info("═══ PHASE 2: BISG / BIFSG SCORING ═══")
    log.info("Start time: %s", datetime.now(timezone.utc).isoformat())
    log.info("Primary tau: %.2f", tau)

    # ── 1. Load clean parquet ────────────────────────────────────────────────
    try:
        df = read_dcas_parquet(input_path)
    except FileNotFoundError as e:
        log.error(str(e))
        sys.exit(1)

    log.info("Input: %d rows × %d cols.", *df.shape)

    # ── 2. Load Census surnames ───────────────────────────────────────────────
    census = read_census_surnames(census_path)
    if census.empty:
        log.warning("Census surnames unavailable — using embedded 200-surname fallback.")
    else:
        log.info("Census surnames loaded: %d rows.", len(census))

    # ── 3. Build scorer and score ─────────────────────────────────────────────
    scorer = build_scorer(census)
    log.info("SurnameTable source: %s", scorer._st.source)

    df = score_dataframe(df, scorer, tau=tau, method="bifsg")

    p_col = "p_hispanic_bifsg" if "p_hispanic_bifsg" in df.columns else "p_hispanic_bisg"
    n_scored  = int(df[p_col].notna().sum())
    n_unknown = len(df) - n_scored
    log.info("Scored: %d records | Unknown surname: %d", n_scored, n_unknown)

    # ── 4. Anchor cross-check ─────────────────────────────────────────────────
    n_flag = int(df["classification_anomaly_flag"].sum())
    log.info(
        "classification_anomaly_flag: %d (tau=%.2f)  |  ANCHOR BISG est: %d",
        n_flag, tau, ANCHOR["bisg_estimate"],
    )
    if abs(n_flag - ANCHOR["bisg_estimate"]) / ANCHOR["bisg_estimate"] > 0.20:
        log.warning(
            "⚠  Flagged count %d differs >20%% from anchor estimate %d. "
            "Check surname table source (embedded vs Census file).",
            n_flag, ANCHOR["bisg_estimate"],
        )

    # ── 5. Tau sensitivity table ──────────────────────────────────────────────
    tau_table = _tau_table(df, p_col)
    tau_csv = OUTPUTS / "tau_sensitivity_table.csv"
    tau_table.to_csv(tau_csv, index=False)
    log.info("Tau sensitivity table: %s", tau_csv)
    log.info("\n%s", tau_table.to_string(index=False))

    # ── 6. Band distribution ──────────────────────────────────────────────────
    band_dist = _band_distribution(df)
    log.info("Tau-band distribution: %s", band_dist)

    bisg_csv = OUTPUTS / "bisg_distribution.csv"
    if "bisg_tau_band" in df.columns:
        df["bisg_tau_band"].value_counts().reset_index(name="count") \
          .rename(columns={"index":"band"}) \
          .to_csv(bisg_csv, index=False)

    # ── 7. Save scored parquet ────────────────────────────────────────────────
    out_path = Path(output_path) if output_path else DCAS_BIFSG
    save_parquet(df, out_path, label="dcas_bifsg")

    # ── 8. Save report ────────────────────────────────────────────────────────
    report_out = OUTPUTS / "phase2_report.json"
    report = {
        "phase":             "phase2",
        "timestamp":         datetime.now(timezone.utc).isoformat(),
        "tau_primary":       tau,
        "n_records":         len(df),
        "n_scored":          n_scored,
        "n_surname_unknown": n_unknown,
        "surname_source":    scorer._st.source,
        "n_anomaly_flagged": n_flag,
        "anchor_bisg_est":   ANCHOR["bisg_estimate"],
        "band_distribution": band_dist,
        "tau_sensitivity":   tau_table.to_dict(orient="records"),
        "output_file":       str(out_path),
    }
    with open(report_out, "w", encoding="utf-8") as fh:
        json.dump(report, fh, indent=2, default=str)
    log.info("Phase 2 report saved: %s", report_out)

    # ── 9. Summary ────────────────────────────────────────────────────────────
    print("\n" + "═"*60)
    print("  PHASE 2 COMPLETE")
    print(f"  Records scored       : {n_scored:,} / {len(df):,}")
    print(f"  Surname source       : {scorer._st.source}")
    print(f"  Anomaly flagged (τ={tau:.2f}): {n_flag:,}")
    print(f"  Anchor BISG estimate : {ANCHOR['bisg_estimate']:,}")
    print(f"  Output               : {out_path}")
    print("  TAU SENSITIVITY:")
    for _, row in tau_table.iterrows():
        fr_str = f"{row['failure_rate']:.3f}" if row['failure_rate'] is not None else "N/A"
        print(f"    τ={row['tau']:.2f}  n_above={row['n_above_tau']:>5,}  "
              f"pct={row['pct_above_tau']:.2f}%  failure_rate={fr_str}")
    print("═"*60 + "\n")

    return df


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Phase 2: BISG/BIFSG scoring")
    parser.add_argument("--input",  type=Path, default=None,
                        help=f"Input parquet (default: {DCAS_CLEAN})")
    parser.add_argument("--census", type=Path, default=None)
    parser.add_argument("--output", type=Path, default=None,
                        help=f"Output parquet (default: {DCAS_BIFSG})")
    parser.add_argument("--tau",    type=float, default=TAU_PRIMARY)
    args = parser.parse_args()
    main(args.input, args.census, args.output, args.tau)
