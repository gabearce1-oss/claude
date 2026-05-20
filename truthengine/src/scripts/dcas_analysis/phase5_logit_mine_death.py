"""
phase5_logit_mine_death.py — Logistic regression: mine_death_flag ~ BIFSG + covariates
TruthEngine360 | AUMER Foundation | USC Sol Price School

Primary model:
  DV:  mine_death_flag  (0/1)
  IV:  suppressed_hispanic_proxy_flag (primary)
       tier1_mos_flag, icorp_flag, year_1968_flag, sw_hor_flag  (covariates)

Secondary model adds branch dummies (army_flag, marines_flag).

Input:  data_processed/dcas_analysis_ready.parquet  (from phase3)
Output: outputs/logit_mine_death.json
        outputs/logit_odds_ratios.csv
        outputs/test_battery_t6_t7.json
        logs/phase5.log

Usage:
    python phase5_logit_mine_death.py
    python phase5_logit_mine_death.py --input path/to/ready.parquet
"""
import argparse
import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats as scipy_stats

from config import DCAS_FEATURES, LOGS, OUTPUTS, TAU_PRIMARY
from io_dcas import read_dcas_parquet
from stats import test_t6_precision_recall, test_t7_province_crosstab
from reporting import save_test_results_json

# ── LOGGING ───────────────────────────────────────────────────────────────────
LOG_FILE = LOGS / "phase5.log"
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


def _logit_model(df: pd.DataFrame, dv: str, ivs: list[str]) -> dict:
    """
    Run logistic regression via statsmodels.
    Returns dict with coefficients, OR, 95% CI, p-values, AIC, McFadden R².
    Falls back to scipy if statsmodels is not available.
    """
    # Prepare data
    cols = [dv] + ivs
    sub = df[cols].dropna()
    if len(sub) < 50:
        log.warning("Insufficient data for logistic regression (%d rows).", len(sub))
        return {"error": "insufficient_data", "n": len(sub)}

    y = sub[dv].astype(float).values
    X_df = sub[ivs].astype(float)

    try:
        import statsmodels.api as sm
        X = sm.add_constant(X_df.values)
        model = sm.Logit(y, X)
        result = model.fit(disp=False, maxiter=200)

        coefs = dict(zip(["const"] + ivs, result.params))
        pvals = dict(zip(["const"] + ivs, result.pvalues))
        cis   = result.conf_int(alpha=0.05)
        ci_dict = {}
        for i, name in enumerate(["const"] + ivs):
            ci_dict[name] = [float(cis[i, 0]), float(cis[i, 1])]

        ors = {k: float(np.exp(v)) for k, v in coefs.items() if k != "const"}
        or_ci = {k: [float(np.exp(ci_dict[k][0])), float(np.exp(ci_dict[k][1]))]
                 for k in ors}

        # McFadden R²
        llf    = result.llf
        llnull = result.llnull
        mcf_r2 = 1 - llf / llnull if llnull != 0 else None

        return {
            "n":           int(len(sub)),
            "dv":          dv,
            "ivs":         ivs,
            "coefficients": {k: round(v, 4) for k, v in coefs.items()},
            "pvalues":     {k: round(float(v), 6) for k, v in pvals.items()},
            "odds_ratios": {k: round(v, 4) for k, v in ors.items()},
            "or_95ci":     {k: [round(v, 4) for v in ci] for k, ci in or_ci.items()},
            "aic":         round(result.aic, 2),
            "mcfadden_r2": round(mcf_r2, 4) if mcf_r2 is not None else None,
            "converged":   bool(result.mle_retvals.get("converged", False)),
            "library":     "statsmodels",
        }

    except ImportError:
        log.warning("statsmodels not available — using sklearn fallback.")
        return _logit_sklearn_fallback(y, X_df, dv, ivs)


def _logit_sklearn_fallback(y, X_df, dv, ivs) -> dict:
    """
    Logistic regression via sklearn (no SE or CI, but provides OR point estimates).
    """
    try:
        from sklearn.linear_model import LogisticRegression
        from sklearn.preprocessing import StandardScaler

        sc = StandardScaler()
        Xs = sc.fit_transform(X_df.values)
        clf = LogisticRegression(max_iter=500, solver="lbfgs")
        clf.fit(Xs, y)

        coefs = dict(zip(ivs, clf.coef_[0]))
        ors   = {k: float(np.exp(v)) for k, v in coefs.items()}

        return {
            "n":           int(len(y)),
            "dv":          dv,
            "ivs":         ivs,
            "odds_ratios": {k: round(v, 4) for k, v in ors.items()},
            "note":        "Standardised coefficients (sklearn). No SE/CI.",
            "library":     "sklearn",
        }
    except ImportError:
        return {"error": "no_regression_library", "n": int(len(y))}


def _or_csv(result: dict, out: Path) -> None:
    """Write odds ratios + CI to CSV for SPSS import."""
    if "odds_ratios" not in result:
        return
    rows = []
    for var, or_val in result["odds_ratios"].items():
        ci = result.get("or_95ci", {}).get(var, [None, None])
        p  = result.get("pvalues", {}).get(var, None)
        rows.append({
            "variable": var,
            "odds_ratio": or_val,
            "ci_low":  round(ci[0], 4) if ci[0] is not None else None,
            "ci_high": round(ci[1], 4) if ci[1] is not None else None,
            "p_value": p,
        })
    pd.DataFrame(rows).to_csv(out, index=False)
    log.info("Odds ratio CSV: %s", out)


def main(input_path=None, tau=TAU_PRIMARY):
    log.info("═══ PHASE 5: LOGISTIC REGRESSION ═══")
    log.info("Start: %s", datetime.now(timezone.utc).isoformat())

    # ── 1. Load ───────────────────────────────────────────────────────────────
    try:
        df = read_dcas_parquet(input_path if input_path else DCAS_FEATURES)
    except FileNotFoundError as e:
        log.error(str(e))
        sys.exit(1)

    log.info("Input: %d rows × %d cols.", *df.shape)

    # ── 2. Model 1: primary ───────────────────────────────────────────────────
    ivs_primary = [
        v for v in [
            "suppressed_hispanic_proxy_flag",
            "tier1_mos_flag", "icorp_flag",
            "year_1968_flag", "sw_hor_flag",
        ] if v in df.columns
    ]

    log.info("Model 1 IVs: %s", ivs_primary)
    m1 = _logit_model(df, "mine_death_flag", ivs_primary)
    log.info("Model 1: %s", {k: v for k, v in m1.items() if k not in ("coefficients","pvalues","or_95ci")})

    # ── 3. Model 2: + branch dummies ─────────────────────────────────────────
    ivs_m2 = ivs_primary + [v for v in ["army_flag","marines_flag"] if v in df.columns]
    log.info("Model 2 IVs: %s", ivs_m2)
    m2 = _logit_model(df, "mine_death_flag", ivs_m2)

    # ── 4. Tests T6, T7 ───────────────────────────────────────────────────────
    t6 = test_t6_precision_recall(df, tau=tau)
    t7 = test_t7_province_crosstab(df)

    for r in [t6, t7]:
        status = "✓ REJECT H0" if r.reject_h0 else "  retain H0"
        log.info("[%s] %s %s  p=%.2e", r.test_id, status, r.name, r.p_value)

    # ── 5. Save outputs ───────────────────────────────────────────────────────
    logit_out = OUTPUTS / "logit_mine_death.json"
    with open(logit_out, "w", encoding="utf-8") as fh:
        json.dump({"model1": m1, "model2": m2}, fh, indent=2, default=str)
    log.info("Logit results: %s", logit_out)

    _or_csv(m1, OUTPUTS / "logit_odds_ratios.csv")

    save_test_results_json(
        [t6, t7],
        OUTPUTS / "test_battery_t6_t7.json",
        meta={"phase": "phase5", "tau": tau},
    )

    # ── 6. Summary ────────────────────────────────────────────────────────────
    print("\n" + "═"*60)
    print("  PHASE 5 COMPLETE — LOGIT + T6/T7")
    if "odds_ratios" in m1:
        print("  MODEL 1 ODDS RATIOS:")
        for var, or_val in m1["odds_ratios"].items():
            p = m1.get("pvalues", {}).get(var, float("nan"))
            ci = m1.get("or_95ci", {}).get(var, [None, None])
            ci_str = (f"[{ci[0]:.3f}–{ci[1]:.3f}]"
                      if ci[0] is not None else "[N/A]")
            print(f"    {var:<44}  OR={or_val:.3f}  {ci_str}  p={p:.4f}")
    for r in [t6, t7]:
        sym = "✓" if r.reject_h0 else "·"
        print(f"  {sym} [{r.test_id}] {r.name:<40}  p={r.p_value:.2e}")
    print("═"*60 + "\n")

    return m1, m2, [t6, t7]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Phase 5: Logistic regression + T6/T7")
    parser.add_argument("--input", type=Path, default=None)
    parser.add_argument("--tau",   type=float, default=TAU_PRIMARY)
    args = parser.parse_args()
    main(args.input, args.tau)
