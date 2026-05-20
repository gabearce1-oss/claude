"""
features.py — Analytic feature engineering for DCAS BIFSG analysis
TruthEngine360 | AUMER Foundation | USC Sol Price School

All flag columns are boolean (True/False).  suppressed_hispanic_proxy_flag
is the primary composite outcome variable for Phase 4–5 modelling.
"""
from __future__ import annotations

import logging
from typing import Optional

import pandas as pd

from config import (
    ARTILLERY_CODES,
    HIGH_INTENSITY_YEARS,
    ICORP_PROVINCES,
    MINE_CODES,
    PEAK_YEAR,
    SMALL_ARMS_CODES,
    SW_STATES,
    TIER1_MOS,
    TIER2_MOS,
    TAU_PRIMARY,
)

log = logging.getLogger(__name__)


# ── MOS / BRANCH FLAGS ────────────────────────────────────────────────────────

def add_mos_flags(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add MOS-based risk flags.
    Requires mos_code column (from cleaning.normalize_mos).
    """
    if "mos_code" not in df.columns:
        log.warning("mos_code column missing — MOS flags set to False.")
        df["tier1_mos_flag"] = False
        df["tier2_mos_flag"] = False
        return df

    df["tier1_mos_flag"] = df["mos_code"].isin(TIER1_MOS)
    df["tier2_mos_flag"] = df["mos_code"].isin(TIER2_MOS) & ~df["tier1_mos_flag"]
    return df


def add_branch_flags(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add branch-specific indicator flags.
    Requires branch_label column (from cleaning.decode_branch).
    """
    if "branch_label" not in df.columns:
        log.warning("branch_label column missing — branch flags set to False.")
        df["army_flag"]   = False
        df["marines_flag"] = False
        return df

    df["army_flag"]    = df["branch_label"] == "ARMY"
    df["marines_flag"] = df["branch_label"] == "USMC"
    df["navy_flag"]    = df["branch_label"] == "NAVY"
    df["af_flag"]      = df["branch_label"] == "AIR_FORCE"
    return df


# ── CAUSE-OF-DEATH FLAGS ──────────────────────────────────────────────────────

def add_cause_flags(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add cause-of-death risk flags.
    Requires cause_of_death column (from cleaning.normalize_cause).
    """
    if "cause_of_death" not in df.columns:
        log.warning("cause_of_death column missing — cause flags set to False.")
        df["mine_death_flag"]      = False
        df["small_arms_flag"]      = False
        df["artillery_flag"]       = False
        df["hostile_cause_flag"]   = False
        return df

    cause = df["cause_of_death"].fillna("")
    df["mine_death_flag"]    = cause.isin(MINE_CODES)
    df["small_arms_flag"]    = cause.isin(SMALL_ARMS_CODES)
    df["artillery_flag"]     = cause.isin(ARTILLERY_CODES)
    df["hostile_cause_flag"] = (
        df["mine_death_flag"] | df["small_arms_flag"] | df["artillery_flag"]
    )
    return df


# ── GEOGRAPHY FLAGS ───────────────────────────────────────────────────────────

def add_province_flags(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add I Corps province flag (highest-casualty concentration zone).
    Requires province_code column (from cleaning.normalize_province).
    """
    if "province_code" not in df.columns:
        log.warning("province_code column missing — province flags set to False.")
        df["icorp_flag"] = False
        return df

    df["icorp_flag"] = df["province_code"].isin(ICORP_PROVINCES)
    return df


def add_hor_flags(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add southwest home-of-record flag (Latino service concentration states).
    Requires hor_state column (from cleaning.normalize_hor).
    """
    if "hor_state" not in df.columns:
        log.warning("hor_state column missing — HOR flags set to False.")
        df["sw_hor_flag"] = False
        return df

    df["sw_hor_flag"] = df["hor_state"].isin(SW_STATES)
    return df


# ── TEMPORAL FLAGS ────────────────────────────────────────────────────────────

def add_year_flags(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add temporal risk-intensity flags.
    Requires incident_year column (from cleaning.parse_dates).
    """
    if "incident_year" not in df.columns:
        log.warning("incident_year column missing — year flags set to False.")
        df["year_1968_flag"]        = False
        df["high_intensity_flag"]   = False
        return df

    df["year_1968_flag"]       = df["incident_year"] == PEAK_YEAR
    df["high_intensity_flag"]  = df["incident_year"].isin(HIGH_INTENSITY_YEARS)
    return df


# ── BISG CLASSIFICATION FLAGS ─────────────────────────────────────────────────

def add_bisg_flags(df: pd.DataFrame,
                   tau: float = TAU_PRIMARY) -> pd.DataFrame:
    """
    Add BISG/BIFSG threshold and tau-band flags.
    Requires p_hispanic_bifsg (or p_hispanic_bisg) column from bifsg.score_dataframe.

    classification_anomaly_flag is set here if not already present
    (score_dataframe also sets it; this handles post-merge re-scoring).
    """
    p_col = "p_hispanic_bifsg" if "p_hispanic_bifsg" in df.columns else "p_hispanic_bisg"

    if p_col not in df.columns:
        log.warning("%s column missing — BISG flags set to False.", p_col)
        df["bisg_above_tau_flag"]          = False
        df["bisg_high_confidence_flag"]    = False
        return df

    p = df[p_col].fillna(0.0)
    df["bisg_above_tau_flag"]          = p >= tau
    df["bisg_high_confidence_flag"]    = p >= 0.70

    if "classification_anomaly_flag" not in df.columns:
        eth_col = "ethnic_hispanic"
        eth = df[eth_col].fillna(False) if eth_col in df.columns else pd.Series(False, index=df.index)
        df["classification_anomaly_flag"] = df["bisg_above_tau_flag"] & ~eth

    return df


# ── COMPOSITE OUTCOME ─────────────────────────────────────────────────────────

def add_suppressed_hispanic_proxy(df: pd.DataFrame,
                                  tau: float = TAU_PRIMARY) -> pd.DataFrame:
    """
    suppressed_hispanic_proxy_flag — PRIMARY OUTCOME VARIABLE.

    Definition: A record is in the "suppressed Hispanic cohort" if:
      1. BISG/BIFSG p_hispanic >= tau (probable Hispanic by surname), AND
      2. DCAS official ethnic coding = non-Hispanic (ethnic_hispanic == False)

    This is the operationalisation of the 84.9% failure rate finding.
    The flag identifies the 2,309 − 349 = 1,960 records at tau=0.40
    whose Hispanic identity was likely not captured by official DCAS coding.

    CRITICAL: This flag is a FORENSIC SIGNAL, not a contamination marker.
    Records flagged TRUE must be reviewed by a qualified analyst using
    primary source documents (DD Form 1300, NARA service records).
    """
    required = {"ethnic_hispanic"}
    p_col    = "p_hispanic_bifsg" if "p_hispanic_bifsg" in df.columns else "p_hispanic_bisg"
    required.add(p_col)

    missing = required - set(df.columns)
    if missing:
        log.warning(
            "suppressed_hispanic_proxy_flag requires %s — flag set to False.",
            missing,
        )
        df["suppressed_hispanic_proxy_flag"] = False
        return df

    p   = df[p_col].fillna(0.0)
    eth = df["ethnic_hispanic"].fillna(False)
    df["suppressed_hispanic_proxy_flag"] = p.ge(tau) & ~eth
    n = df["suppressed_hispanic_proxy_flag"].sum()
    log.info(
        "suppressed_hispanic_proxy_flag: %d records at tau=%.2f (expected ~1,960 at tau=0.40)",
        n, tau,
    )
    return df


# ── PIPELINE ──────────────────────────────────────────────────────────────────

def engineer_all_features(df: pd.DataFrame,
                           tau: float = TAU_PRIMARY) -> pd.DataFrame:
    """
    Apply all feature engineering steps in the correct order.
    Assumes clean DataFrame (output of cleaning.clean_dcas + bifsg.score_dataframe).
    """
    log.info("Engineering features (%d rows)…", len(df))
    df = add_mos_flags(df)
    df = add_branch_flags(df)
    df = add_cause_flags(df)
    df = add_province_flags(df)
    df = add_hor_flags(df)
    df = add_year_flags(df)
    df = add_bisg_flags(df, tau=tau)
    df = add_suppressed_hispanic_proxy(df, tau=tau)
    log.info("Feature engineering complete.")
    return df


def feature_summary(df: pd.DataFrame) -> dict:
    """Return counts and prevalence rates for all boolean flag columns."""
    flag_cols = [c for c in df.columns if c.endswith("_flag")]
    n = len(df)
    summary = {}
    for col in sorted(flag_cols):
        count = int(df[col].fillna(False).sum())
        summary[col] = {"n": count, "pct": round(100 * count / n, 2) if n else 0}
    return summary


# ── CLI ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import json, sys, logging
    logging.basicConfig(level=logging.INFO,
                        format="%(asctime)s [%(levelname)s] %(message)s",
                        datefmt="%H:%M:%S")
    print("features.py: import OK — use via phase3_feature_engineering.py")
    print("Flag columns produced:", sorted([
        "tier1_mos_flag","tier2_mos_flag","army_flag","marines_flag",
        "mine_death_flag","small_arms_flag","artillery_flag","hostile_cause_flag",
        "icorp_flag","sw_hor_flag","year_1968_flag","high_intensity_flag",
        "bisg_above_tau_flag","bisg_high_confidence_flag",
        "classification_anomaly_flag","suppressed_hispanic_proxy_flag",
    ]))
