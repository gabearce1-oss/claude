"""
stats.py — Statistical test battery for DCAS BIFSG analysis
TruthEngine360 | AUMER Foundation | USC Sol Price School

Pre-specified 7-test framework.  All tests were defined before data
analysis began (registered hypothesis framework).

TEST REGISTER
─────────────────────────────────────────────────────────────────────────────
T1  Bernoulli Variance Test       — Is the 84.9% failure rate real?
T2  Calibration Test              — Are BISG probabilities calibrated?
T3  Impossibility Score           — How extreme is z = (349 − 2309)/47.1?
T4  χ² Branch × BIFSG            — Does suppression vary by branch?
T5  Jaccard Surname Overlap       — Do BISG ≥ τ surnames cluster together?
T6  Precision / Recall            — BISG classifier performance on known data
T7  Province × BIFSG × Cause crosstab — Spatial/cause interaction
─────────────────────────────────────────────────────────────────────────────
"""
from __future__ import annotations

import logging
import math
from typing import Optional

import numpy as np
import pandas as pd
from scipy import stats as scipy_stats

from config import (
    ALPHA_BONFERRONI,
    ANCHOR,
    TAU_PRIMARY,
    TAU_SENSITIVITY,
    BONFERRONI_K,
)

log = logging.getLogger(__name__)

# ── RESULT DATACLASS ─────────────────────────────────────────────────────────

class TestResult:
    """Lightweight container for a single test outcome."""
    __slots__ = ("test_id", "name", "statistic", "p_value", "reject_h0",
                 "effect_size", "ci_low", "ci_high", "notes", "raw")

    def __init__(self, test_id: str, name: str, *, statistic: float,
                 p_value: float, reject_h0: Optional[bool] = None,
                 effect_size: Optional[float] = None,
                 ci_low: Optional[float] = None,
                 ci_high: Optional[float] = None,
                 notes: str = "", raw: Optional[dict] = None):
        self.test_id    = test_id
        self.name       = name
        self.statistic  = statistic
        self.p_value    = p_value
        self.reject_h0  = reject_h0 if reject_h0 is not None else p_value < ALPHA_BONFERRONI
        self.effect_size = effect_size
        self.ci_low     = ci_low
        self.ci_high    = ci_high
        self.notes      = notes
        self.raw        = raw or {}

    def to_dict(self) -> dict:
        return {
            "test_id":    self.test_id,
            "name":       self.name,
            "statistic":  round(self.statistic, 4) if self.statistic is not None else None,
            "p_value":    self.p_value,
            "reject_h0":  self.reject_h0,
            "effect_size":self.effect_size,
            "ci_low":     self.ci_low,
            "ci_high":    self.ci_high,
            "notes":      self.notes,
        }

    def __repr__(self) -> str:
        sig = "REJECT H0" if self.reject_h0 else "retain H0"
        return f"<{self.test_id} {self.name!r}: stat={self.statistic:.3f} p={self.p_value:.3e} [{sig}]>"


# ── T1: BERNOULLI VARIANCE ────────────────────────────────────────────────────

def test_t1_bernoulli_variance(
    n_total: int = ANCHOR["dcas_total"],
    n_official: int = ANCHOR["official_hispanic"],
    p_bisg: float = ANCHOR["bisg_pct"],
) -> TestResult:
    """
    T1 — Bernoulli Variance Test
    H0: The official count is consistent with the BISG-estimated prevalence.
    H1: The official count is significantly lower than expected under BISG p̂.

    Under Bernoulli(n, p̂):
      μ = n * p̂
      σ = sqrt(n * p̂ * (1 − p̂))
      z = (observed − μ) / σ
    """
    mu    = n_total * p_bisg
    sigma = math.sqrt(n_total * p_bisg * (1.0 - p_bisg))
    z     = (n_official - mu) / sigma
    p_val = float(scipy_stats.norm.cdf(z))  # one-tailed (left)

    return TestResult(
        "T1", "Bernoulli Variance",
        statistic=z,
        p_value=p_val,
        notes=(
            f"μ={mu:.0f}, σ={sigma:.1f}, observed={n_official}, z={z:.2f}. "
            f"Anchor: z=-41.6, p<10⁻³⁷⁸."
        ),
        raw={"mu": mu, "sigma": sigma, "n_observed": n_official},
    )


# ── T2: BISG CALIBRATION ─────────────────────────────────────────────────────

def test_t2_calibration(
    df: pd.DataFrame,
    p_col: str = "p_hispanic_bifsg",
    truth_col: str = "ethnic_hispanic",
    n_bins: int = 10,
) -> TestResult:
    """
    T2 — Calibration Test (Hosmer-Lemeshow goodness-of-fit)
    H0: BISG probabilities are well-calibrated against official DCAS coding.
    H1: Systematic under- or over-estimation of Hispanic probability.

    Note: Rejection of H0 here supports (not contradicts) the main finding,
    because systematic under-classification is the documented phenomenon.
    """
    if p_col not in df.columns or truth_col not in df.columns:
        log.warning("T2: required columns missing (%s, %s).", p_col, truth_col)
        return TestResult("T2","Calibration (skipped)",statistic=float("nan"),p_value=1.0,
                          notes="Required columns absent.")

    sub = df[[p_col, truth_col]].dropna()
    if len(sub) < n_bins:
        return TestResult("T2","Calibration (insufficient data)",statistic=float("nan"),
                          p_value=1.0, notes=f"Only {len(sub)} rows with both columns.")

    sub = sub.copy()
    sub["bin"] = pd.qcut(sub[p_col], q=n_bins, labels=False, duplicates="drop")
    hl_stat = 0.0
    for _, grp in sub.groupby("bin"):
        n_g      = len(grp)
        obs_yes  = grp[truth_col].sum()
        exp_yes  = grp[p_col].sum()
        exp_no   = n_g - exp_yes
        obs_no   = n_g - obs_yes
        if exp_yes > 0:
            hl_stat += (obs_yes - exp_yes) ** 2 / exp_yes
        if exp_no > 0:
            hl_stat += (obs_no - exp_no) ** 2 / exp_no

    df_hl = max(n_bins - 2, 1)
    p_val = float(1 - scipy_stats.chi2.cdf(hl_stat, df=df_hl))

    return TestResult(
        "T2", "BISG Calibration (Hosmer-Lemeshow)",
        statistic=hl_stat, p_value=p_val,
        notes=(
            f"HL χ²({df_hl})={hl_stat:.2f}, p={p_val:.4f}. "
            f"Rejection indicates systematic mis-calibration — "
            f"consistent with under-classification finding."
        ),
    )


# ── T3: IMPOSSIBILITY SCORE ───────────────────────────────────────────────────

def test_t3_impossibility_score(
    n_total: int = ANCHOR["dcas_total"],
    n_official: int = ANCHOR["official_hispanic"],
    p_bisg: float = ANCHOR["bisg_pct"],
) -> TestResult:
    """
    T3 — Impossibility Score (primary anchor metric — IMMUTABLE)
    z = (observed − expected) / SE = (349 − 2,309) / 47.1 = −41.6σ
    p < 10⁻³⁷⁸

    This is the central statistical finding of the analysis.
    Compared to the Higgs boson discovery threshold (5σ), this result
    is 8.3× more extreme.  The probability of observing 349 or fewer
    Hispanic casualties if the true rate is 3.97% is effectively zero.

    ANCHOR METRIC — must not be altered.
    """
    mu    = n_total * p_bisg
    sigma = math.sqrt(n_total * p_bisg * (1.0 - p_bisg))
    z     = (n_official - mu) / sigma

    # scipy norm.logsf gives log(P[Z>z]) = log(1-CDF); for z≪0 use logsf(-|z|)
    log_p = float(scipy_stats.norm.logcdf(z))
    # Express as 10^x
    log10_p = log_p / math.log(10)

    return TestResult(
        "T3", "Impossibility Score",
        statistic=z,
        p_value=float(scipy_stats.norm.cdf(z)),
        notes=(
            f"ANCHOR: z={ANCHOR['impossibility_sigma']}, p<10⁻³⁷⁸. "
            f"Computed z={z:.1f} (should match anchor within floating-point error). "
            f"log₁₀(p)≈{log10_p:.0f}. "
            f"8.3× beyond Higgs discovery threshold (5σ)."
        ),
        raw={
            "n_total":    n_total,
            "n_official": n_official,
            "mu":         mu,
            "sigma":      sigma,
            "z":          z,
            "log10_p":    log10_p,
        },
    )


# ── T4: χ² BRANCH × BIFSG ────────────────────────────────────────────────────

def test_t4_chi2_branch(df: pd.DataFrame,
                        tau: float = TAU_PRIMARY) -> TestResult:
    """
    T4 — χ² Branch × BIFSG anomaly
    H0: The proportion of BISG-probable Hispanics coded non-Hispanic does not
        differ significantly across service branches.
    H1: Suppression is unevenly distributed across Army, USMC, Navy, etc.
    """
    required = {"branch_label", "suppressed_hispanic_proxy_flag"}
    if not required.issubset(df.columns):
        log.warning("T4: missing columns %s.", required - set(df.columns))
        return TestResult("T4","χ² Branch (skipped)",statistic=float("nan"),p_value=1.0,
                          notes="Required columns absent.")

    ct = pd.crosstab(
        df["branch_label"].fillna("UNKNOWN"),
        df["suppressed_hispanic_proxy_flag"].fillna(False),
    )
    chi2, p_val, dof, expected = scipy_stats.chi2_contingency(ct)
    n = ct.values.sum()
    cramers_v = math.sqrt(chi2 / (n * (min(ct.shape) - 1))) if n > 0 else None

    return TestResult(
        "T4", "χ² Branch × BIFSG Suppression",
        statistic=chi2, p_value=float(p_val),
        effect_size=cramers_v,
        notes=(
            f"χ²({dof})={chi2:.2f}, p={p_val:.4f}, Cramér's V={cramers_v:.3f}. "
            f"Table: {ct.to_dict()}."
        ),
        raw={"crosstab": ct.to_dict()},
    )


# ── T5: JACCARD SURNAME OVERLAP ───────────────────────────────────────────────

def test_t5_jaccard(df: pd.DataFrame,
                    tau: float = TAU_PRIMARY) -> TestResult:
    """
    T5 — Jaccard Surname Overlap
    Measures the overlap between the set of surnames flagged BISG ≥ τ
    and the set of surnames in the official Hispanic cohort.

    Jaccard(A, B) = |A ∩ B| / |A ∪ B|
    A = surnames where at least one record has BISG ≥ τ
    B = surnames where at least one record is officially coded Hispanic
    """
    required = {"name_last", "bisg_above_tau_flag", "ethnic_hispanic"}
    if not required.issubset(df.columns):
        log.warning("T5: missing columns %s.", required - set(df.columns))
        return TestResult("T5","Jaccard (skipped)",statistic=float("nan"),p_value=float("nan"),
                          notes="Required columns absent.")

    set_bisg = set(
        df.loc[df["bisg_above_tau_flag"].fillna(False), "name_last"].dropna()
    )
    set_official = set(
        df.loc[df["ethnic_hispanic"].fillna(False), "name_last"].dropna()
    )

    intersection = len(set_bisg & set_official)
    union        = len(set_bisg | set_official)
    jaccard      = intersection / union if union > 0 else 0.0

    # Permutation-based p-value (Monte Carlo, k=1000)
    all_surnames = list(df["name_last"].dropna())
    n_bisg_surns = len(set_bisg)
    rng = np.random.default_rng(seed=42)
    exceed = 0
    k = 1000
    for _ in range(k):
        sample_a = set(rng.choice(all_surnames, size=n_bisg_surns, replace=False))
        j_perm   = len(sample_a & set_official) / len(sample_a | set_official)
        if j_perm >= jaccard:
            exceed += 1
    p_val = (exceed + 1) / (k + 1)

    return TestResult(
        "T5", "Jaccard Surname Overlap",
        statistic=jaccard, p_value=p_val,
        notes=(
            f"J={jaccard:.4f} | |A|={len(set_bisg)}, |B|={len(set_official)}, "
            f"|A∩B|={intersection}. Monte Carlo p={p_val:.4f} (k={k})."
        ),
        raw={"set_bisg_n":len(set_bisg), "set_official_n":len(set_official),
             "intersection":intersection, "union":union},
    )


# ── T6: PRECISION / RECALL ────────────────────────────────────────────────────

def test_t6_precision_recall(df: pd.DataFrame,
                              tau: float = TAU_PRIMARY) -> TestResult:
    """
    T6 — BISG Classifier Precision / Recall
    Treats DCAS official ETHNIC_SHORT_NAME as the (imperfect) ground truth.
    Measures how well BISG ≥ τ recovers the officially coded Hispanic records.

    Precision = TP / (TP + FP)
    Recall    = TP / (TP + FN)
    F1        = 2 * P * R / (P + R)

    Note: Because official coding likely undercounts (the core finding),
    recall will appear low — this IS the signal.  Failure rate = 1 − Recall.
    """
    required = {"bisg_above_tau_flag", "ethnic_hispanic"}
    if not required.issubset(df.columns):
        log.warning("T6: missing columns %s.", required - set(df.columns))
        return TestResult("T6","Precision/Recall (skipped)",statistic=float("nan"),
                          p_value=float("nan"), notes="Required columns absent.")

    pred  = df["bisg_above_tau_flag"].fillna(False)
    truth = df["ethnic_hispanic"].fillna(False)

    tp = (pred  & truth).sum()
    fp = (pred  & ~truth).sum()
    fn = (~pred & truth).sum()
    tn = (~pred & ~truth).sum()

    prec   = tp / (tp + fp)  if (tp + fp)  > 0 else 0.0
    recall = tp / (tp + fn)  if (tp + fn)  > 0 else 0.0
    f1     = 2 * prec * recall / (prec + recall) if (prec + recall) > 0 else 0.0

    failure_rate = fp / (tp + fp) if (tp + fp) > 0 else 0.0

    # Matthews Correlation Coefficient
    denom = math.sqrt((tp+fp)*(tp+fn)*(tn+fp)*(tn+fn))
    mcc   = (tp*tn - fp*fn) / denom if denom > 0 else 0.0

    return TestResult(
        "T6", "Precision / Recall",
        statistic=f1,
        p_value=float("nan"),
        effect_size=mcc,
        notes=(
            f"Prec={prec:.3f}, Recall={recall:.3f}, F1={f1:.3f}, MCC={mcc:.3f}. "
            f"Failure rate (FP/predicted+)={failure_rate:.3f}. "
            f"Anchor failure rate=0.849. "
            f"TP={tp}, FP={fp}, FN={fn}, TN={tn}."
        ),
        raw={"tp":int(tp),"fp":int(fp),"fn":int(fn),"tn":int(tn),
             "precision":prec,"recall":recall,"f1":f1,"failure_rate":failure_rate},
    )


# ── T7: PROVINCE × BIFSG × CAUSE CROSSTAB ────────────────────────────────────

def test_t7_province_crosstab(df: pd.DataFrame) -> TestResult:
    """
    T7 — Province × BIFSG × Cause crosstab
    H0: The distribution of BISG-probable Hispanic casualties across provinces
        and causes of death matches the distribution for non-BISG-probable records.
    H1: BISG-probable Hispanic records are disproportionately concentrated in
        high-casualty provinces (I Corps) and high-lethality causes (mine/booby trap).

    Uses log-linear model chi-square on the 3-way table.
    """
    required = {"bisg_above_tau_flag", "icorp_flag", "mine_death_flag"}
    if not required.issubset(df.columns):
        log.warning("T7: missing columns %s.", required - set(df.columns))
        return TestResult("T7","Province×BIFSG×Cause (skipped)",statistic=float("nan"),
                          p_value=1.0, notes="Required columns absent.")

    ct = pd.crosstab(
        index  = [df["bisg_above_tau_flag"].fillna(False),
                  df["icorp_flag"].fillna(False)],
        columns = df["mine_death_flag"].fillna(False),
    )

    chi2, p_val, dof, _ = scipy_stats.chi2_contingency(ct)
    n = ct.values.sum()
    cramers_v = math.sqrt(chi2 / (n * (min(ct.shape) - 1))) if n > 0 else None

    return TestResult(
        "T7", "Province × BIFSG × Cause",
        statistic=chi2, p_value=float(p_val),
        effect_size=cramers_v,
        notes=(
            f"χ²({dof})={chi2:.2f}, p={p_val:.4f}, Cramér's V={cramers_v:.3f}. "
            f"Rows=BIFSG×I-Corps, Cols=mine_death."
        ),
        raw={"crosstab": ct.to_dict()},
    )


# ── SENSITIVITY ANALYSIS ──────────────────────────────────────────────────────

def sensitivity_analysis(df: pd.DataFrame) -> list[dict]:
    """
    Run T3 (Impossibility Score) and T6 (Precision/Recall) across all tau values
    in TAU_SENSITIVITY.  Returns list of dicts for CSV export.
    """
    from bifsg import score_dataframe, build_scorer
    from io_dcas import read_census_surnames

    rows = []
    base_scorer = build_scorer(read_census_surnames())

    for tau in TAU_SENSITIVITY:
        df_t = score_dataframe(df, base_scorer, tau=tau)
        t3   = test_t3_impossibility_score()
        t6   = test_t6_precision_recall(df_t, tau=tau)
        n_flag = int(df_t["suppressed_hispanic_proxy_flag"].sum()
                     if "suppressed_hispanic_proxy_flag" in df_t.columns else 0)
        rows.append({
            "tau":          tau,
            "n_flagged":    n_flag,
            "failure_rate": t6.raw.get("failure_rate"),
            "precision":    t6.raw.get("precision"),
            "recall":       t6.raw.get("recall"),
            "f1":           t6.statistic,
            "impossibility_z": t3.statistic,
        })
    return rows


# ── FULL BATTERY ──────────────────────────────────────────────────────────────

def run_7_test_battery(df: pd.DataFrame,
                       tau: float = TAU_PRIMARY) -> list[TestResult]:
    """
    Execute the full 7-test pre-specified battery on a scored DataFrame.
    Returns list of TestResult objects.
    """
    log.info("Running 7-test battery (tau=%.2f, Bonferroni α=%.5f)…",
             tau, ALPHA_BONFERRONI)
    results = [
        test_t1_bernoulli_variance(),
        test_t2_calibration(df),
        test_t3_impossibility_score(),
        test_t4_chi2_branch(df, tau=tau),
        test_t5_jaccard(df, tau=tau),
        test_t6_precision_recall(df, tau=tau),
        test_t7_province_crosstab(df),
    ]
    for r in results:
        log.info("  %s", r)
    n_reject = sum(1 for r in results if r.reject_h0)
    log.info("Battery complete: %d/%d H0 rejected at α_B=%.5f.",
             n_reject, len(results), ALPHA_BONFERRONI)
    return results
