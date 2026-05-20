"""
reporting.py — Output exporters for DCAS BIFSG analysis
TruthEngine360 | AUMER Foundation | USC Sol Price School

Exports:
  - Parquet files for inter-phase data transfer
  - CSV files for SPSS import
  - JSON reports for web/API consumption
  - Variable dictionary (codebook) for SPSS import
  - Plain-text summary for logs and QA review
"""
from __future__ import annotations

import csv
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import pandas as pd

from config import ANCHOR, OUTPUTS, TAU_PRIMARY

log = logging.getLogger(__name__)

_TS = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


# ── PARQUET ───────────────────────────────────────────────────────────────────

def save_parquet(df: pd.DataFrame, path: Path, label: str = "") -> None:
    """Save DataFrame to parquet with snappy compression."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(path, engine="pyarrow", compression="snappy", index=False)
    log.info("Saved %s parquet (%d rows × %d cols): %s",
             label, len(df), len(df.columns), path)


# ── CSV ───────────────────────────────────────────────────────────────────────

_SPSS_EXPORT_COLS = [
    # Identifiers
    "MEMBER_NAME", "name_last", "name_first",
    # Demographics
    "RACE_OMB_NAME", "ETHNIC_SHORT_NAME", "race_label", "ethnic_hispanic",
    # BIFSG scores
    "p_hispanic_bifsg", "p_hispanic_bisg", "bisg_tau_band",
    # Flags
    "tier1_mos_flag", "tier2_mos_flag", "army_flag", "marines_flag",
    "mine_death_flag", "small_arms_flag", "artillery_flag", "hostile_cause_flag",
    "icorp_flag", "sw_hor_flag", "year_1968_flag", "high_intensity_flag",
    "bisg_above_tau_flag", "bisg_high_confidence_flag",
    "classification_anomaly_flag", "suppressed_hispanic_proxy_flag",
    # Operational fields
    "incident_year", "mos_code", "branch_label",
    "province_code", "hor_state", "cause_of_death", "hostile_flag",
]


def save_spss_csv(df: pd.DataFrame,
                  path: Optional[Path] = None,
                  tau: float = TAU_PRIMARY) -> Path:
    """
    Export analysis-ready CSV optimised for SPSS import.
    Keeps only SPSS_EXPORT_COLS (present subset); converts booleans to 0/1.
    """
    out = Path(path) if path else OUTPUTS / f"dcas_spss_{_TS}.csv"
    out.parent.mkdir(parents=True, exist_ok=True)

    cols = [c for c in _SPSS_EXPORT_COLS if c in df.columns]
    export = df[cols].copy()

    # SPSS needs numeric 0/1, not Python bool
    bool_cols = export.select_dtypes(include="bool").columns
    for col in bool_cols:
        export[col] = export[col].astype(int)

    # Float precision
    float_cols = export.select_dtypes(include="float").columns
    for col in float_cols:
        export[col] = export[col].round(6)

    export.to_csv(out, index=False, encoding="utf-8")
    log.info("SPSS CSV exported (%d rows × %d cols): %s",
             len(export), len(export.columns), out)
    return out


def save_variable_dict(path: Optional[Path] = None) -> Path:
    """
    Write a variable dictionary (codebook) CSV for SPSS import.
    Covers all columns in SPSS_EXPORT_COLS.
    """
    out = Path(path) if path else OUTPUTS / f"variable_dictionary_{_TS}.csv"
    out.parent.mkdir(parents=True, exist_ok=True)

    entries = [
        # var_name, label, type, values
        ("MEMBER_NAME",                   "Full casualty name (LAST, FIRST MI)", "string", ""),
        ("name_last",                     "Surname (parsed)", "string", ""),
        ("name_first",                    "First name (parsed)", "string", ""),
        ("RACE_OMB_NAME",                 "Official race category (OMB)", "string", ""),
        ("ETHNIC_SHORT_NAME",             "Official ethnicity short name", "string",
         "Includes: HISPANIC, PUERTO RICAN, MEXICAN AMERICAN, etc."),
        ("race_label",                    "Standardised race label", "string",
         "WHITE_NON_HISPANIC | BLACK | HISPANIC | API | AIAN | OTHER | UNKNOWN"),
        ("ethnic_hispanic",               "Official DCAS Hispanic coding", "numeric",
         "1=Yes, 0=No"),
        ("p_hispanic_bifsg",              "BIFSG posterior P(Hispanic|surname,first_name)", "numeric",
         "Range 0–1; primary BISG probability column"),
        ("p_hispanic_bisg",               "BISG posterior P(Hispanic|surname)", "numeric",
         "Range 0–1; surname-only baseline"),
        ("bisg_tau_band",                 "Tau band for p_hispanic_bifsg", "string",
         "<0.30 | 0.30–0.40 | 0.40–0.50 | 0.50–0.70 | ≥0.70"),
        ("tier1_mos_flag",                "Tier-1 combat MOS (11B/0311 etc.)", "numeric", "1=Yes, 0=No"),
        ("tier2_mos_flag",                "Tier-2 combat-support MOS", "numeric", "1=Yes, 0=No"),
        ("army_flag",                     "Service branch = Army", "numeric", "1=Yes, 0=No"),
        ("marines_flag",                  "Service branch = USMC", "numeric", "1=Yes, 0=No"),
        ("mine_death_flag",               "Cause of death = mine/booby trap", "numeric", "1=Yes, 0=No"),
        ("small_arms_flag",               "Cause of death = small arms fire", "numeric", "1=Yes, 0=No"),
        ("artillery_flag",                "Cause of death = artillery/mortar/rocket", "numeric", "1=Yes, 0=No"),
        ("hostile_cause_flag",            "Any hostile cause (mine OR small arms OR artillery)", "numeric", "1=Yes, 0=No"),
        ("icorp_flag",                    "Casualty in I Corps province (M1–M5)", "numeric", "1=Yes, 0=No"),
        ("sw_hor_flag",                   "Home of record = Southwest/Latino concentration state", "numeric",
         "States: TX CA NM AZ CO NV FL NY PR"),
        ("year_1968_flag",                "Incident year = 1968 (peak casualty year)", "numeric", "1=Yes, 0=No"),
        ("high_intensity_flag",           "Incident year in 1967–1969 (high-intensity period)", "numeric", "1=Yes, 0=No"),
        ("bisg_above_tau_flag",           f"BISG p_hispanic >= tau ({TAU_PRIMARY})", "numeric", "1=Yes, 0=No"),
        ("bisg_high_confidence_flag",     "BISG p_hispanic >= 0.70 (high confidence)", "numeric", "1=Yes, 0=No"),
        ("classification_anomaly_flag",   "BISG ≥ τ AND officially coded non-Hispanic", "numeric",
         "1=FORENSIC SIGNAL (fast-track to analyst review) | 0=No anomaly"),
        ("suppressed_hispanic_proxy_flag","PRIMARY OUTCOME: suppressed Hispanic cohort", "numeric",
         "1=probable Hispanic by BISG but non-Hispanic in DCAS | Operationalises 84.9% failure rate"),
        ("incident_year",                 "Year of death/incident", "numeric", ""),
        ("mos_code",                      "Military occupational specialty code", "string", ""),
        ("branch_label",                  "Service branch (standardised)", "string",
         "ARMY | NAVY | USMC | AIR_FORCE | COAST_GUARD"),
        ("province_code",                 "Vietnam province code (CASUALTY_STATE_PROVINCE)", "string",
         "M1=Quang Tri, M2=Thua Thien, M3=Quang Nam, M4=Quang Tin, M5=Quang Ngai, etc."),
        ("hor_state",                     "Home of record state (2-char)", "string", ""),
        ("cause_of_death",                "Cause of death (normalised from INCIDENT_CASUALTY_REASON)", "string", ""),
        ("hostile_flag",                  "HOSTILE_DEATH_INDICATOR = hostile", "numeric", "1=Yes, 0=No"),
    ]

    with open(out, "w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerow(["variable", "label", "type", "values_or_notes"])
        writer.writerows(entries)

    log.info("Variable dictionary written: %s", out)
    return out


# ── JSON REPORT ───────────────────────────────────────────────────────────────

def save_test_results_json(
    results: list,
    path: Optional[Path] = None,
    meta: Optional[dict] = None,
) -> Path:
    """Serialize TestResult objects to JSON for web/API consumption."""
    out = Path(path) if path else OUTPUTS / f"test_battery_{_TS}.json"
    out.parent.mkdir(parents=True, exist_ok=True)

    doc = {
        "metadata": {
            "generated_at":  datetime.now(timezone.utc).isoformat(),
            "anchor_metrics": ANCHOR,
            "tau_primary":   TAU_PRIMARY,
            **(meta or {}),
        },
        "tests": [r.to_dict() for r in results],
        "summary": {
            "n_tests":         len(results),
            "n_reject_h0":     sum(1 for r in results if r.reject_h0),
            "bonferroni_alpha": 0.05 / 7,
        },
    }

    with open(out, "w", encoding="utf-8") as fh:
        json.dump(doc, fh, indent=2, default=str)

    log.info("Test battery JSON saved: %s", out)
    return out


def save_sensitivity_csv(rows: list[dict],
                          path: Optional[Path] = None) -> Path:
    """Write tau-sensitivity analysis results to CSV."""
    out = Path(path) if path else OUTPUTS / f"sensitivity_tau_{_TS}.csv"
    out.parent.mkdir(parents=True, exist_ok=True)

    if not rows:
        log.warning("save_sensitivity_csv: empty rows, nothing written.")
        return out

    fieldnames = list(rows[0].keys())
    with open(out, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    log.info("Sensitivity CSV saved: %s", out)
    return out


# ── PLAIN-TEXT SUMMARY ────────────────────────────────────────────────────────

def text_summary(df: pd.DataFrame, results: Optional[list] = None) -> str:
    """
    Generate a plain-text QA / log summary of the analysis run.
    Suitable for appending to log files.
    """
    lines = [
        "═" * 70,
        "  DCAS BIFSG ANALYSIS SUMMARY",
        f"  Generated: {datetime.now(timezone.utc).isoformat()}",
        "═" * 70,
        "",
        f"  Record count     : {len(df):,}  (anchor: {ANCHOR['dcas_total']:,})",
    ]

    flag_cols = [c for c in df.columns if c.endswith("_flag")]
    if flag_cols:
        lines.append("")
        lines.append("  FLAG PREVALENCES")
        lines.append("  " + "─" * 50)
        for col in sorted(flag_cols):
            n   = int(df[col].fillna(False).sum())
            pct = 100 * n / len(df) if len(df) else 0
            lines.append(f"  {col:<44}  {n:>6,}  ({pct:.1f}%)")

    if "suppressed_hispanic_proxy_flag" in df.columns:
        n_supp = int(df["suppressed_hispanic_proxy_flag"].fillna(False).sum())
        n_off  = int(df["ethnic_hispanic"].fillna(False).sum()) if "ethnic_hispanic" in df.columns else ANCHOR["official_hispanic"]
        lines += [
            "",
            "  SUPPRESSED COHORT",
            "  " + "─" * 50,
            f"  Official Hispanic (DCAS)        : {n_off:>6,}  ({100*n_off/len(df):.2f}%)",
            f"  Suppressed proxy (BISG ≥ τ=0.40): {n_supp:>6,}  ({100*n_supp/len(df):.2f}%)",
            f"  Anchor BISG estimate (τ=0.40)   :  2,309  ( 3.97%)",
            f"  Impossibility z                 : {ANCHOR['impossibility_sigma']:.1f}σ",
        ]

    if results:
        lines += ["", "  7-TEST BATTERY", "  " + "─" * 50]
        for r in results:
            sig = "** REJECT H0 **" if r.reject_h0 else "   retain H0   "
            lines.append(f"  [{r.test_id}] {r.name:<40}  {sig}  p={r.p_value:.2e}")

    lines += ["", "═" * 70]
    return "\n".join(lines)
