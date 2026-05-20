"""
cleaning.py — DCAS normalization, type casting, and derived field construction
TruthEngine360 | AUMER Foundation | USC Sol Price School
"""
from __future__ import annotations

import logging
import re
import unicodedata
from typing import Optional

import pandas as pd

from config import (
    BRANCH_DECODE,
    ETHNIC_HISPANIC_VALUES,
    RACE_DECODE,
)

log = logging.getLogger(__name__)

# ── STRING HELPERS ────────────────────────────────────────────────────────────

_WS = re.compile(r"\s+")


def _clean_str(s) -> Optional[str]:
    """Strip, collapse whitespace, upper-case, return None if empty."""
    if pd.isna(s):
        return None
    s = unicodedata.normalize("NFKC", str(s))
    s = _WS.sub(" ", s).strip().upper()
    return s or None


def _to_int(val) -> Optional[int]:
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return None


# ── COLUMN TRANSFORMERS ───────────────────────────────────────────────────────

def normalize_strings(df: pd.DataFrame) -> pd.DataFrame:
    """Apply _clean_str to all object columns in-place."""
    for col in df.select_dtypes(include="object").columns:
        df[col] = df[col].map(_clean_str)
    return df


def parse_name_fields(df: pd.DataFrame) -> pd.DataFrame:
    """
    Split MEMBER_NAME (LAST, FIRST MI format common in DCAS) into
    name_last, name_first, name_middle_initial.
    Leaves MEMBER_NAME intact.
    """
    if "MEMBER_NAME" not in df.columns:
        return df

    def _split(raw: Optional[str]):
        if not raw:
            return None, None, None
        parts = [p.strip() for p in raw.split(",", 1)]
        last = parts[0] or None
        if len(parts) < 2 or not parts[1]:
            return last, None, None
        rest = parts[1].split()
        first = rest[0] if rest else None
        mi = rest[1][:1] if len(rest) > 1 else None
        return last, first, mi

    splits = df["MEMBER_NAME"].map(_split)
    df["name_last"]           = splits.map(lambda x: x[0])
    df["name_first"]          = splits.map(lambda x: x[1])
    df["name_middle_initial"] = splits.map(lambda x: x[2])
    return df


def parse_dates(df: pd.DataFrame) -> pd.DataFrame:
    """Parse DEATH_DATE to datetime; extract incident_year from it as fallback."""
    if "DEATH_DATE" in df.columns:
        df["death_date_parsed"] = pd.to_datetime(
            df["DEATH_DATE"], errors="coerce", infer_datetime_format=True
        )
        if "INCIDENT_YEAR" not in df.columns or df["INCIDENT_YEAR"].isna().all():
            df["INCIDENT_YEAR"] = df["death_date_parsed"].dt.year.astype("Int64")
    if "INCIDENT_YEAR" in df.columns:
        df["incident_year"] = pd.to_numeric(df["INCIDENT_YEAR"], errors="coerce").astype("Int64")
    return df


def decode_race_ethnicity(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add standardized race_label and ethnic_hispanic columns.
    ETHNIC_SHORT_NAME supersedes RACE_OMB_NAME for Hispanic classification
    (per DCAS field documentation — PUERTO RICAN is an ETHNIC_SHORT_NAME value).
    """
    if "RACE_OMB_NAME" in df.columns:
        df["race_label"] = (
            df["RACE_OMB_NAME"]
            .map(lambda x: RACE_DECODE.get(x, "OTHER") if x else "UNKNOWN")
        )
    else:
        df["race_label"] = "UNKNOWN"

    if "ETHNIC_SHORT_NAME" in df.columns:
        df["ethnic_hispanic"] = (
            df["ETHNIC_SHORT_NAME"].isin(ETHNIC_HISPANIC_VALUES)
        )
    else:
        df["ethnic_hispanic"] = False

    # Composite: if ETHNIC_SHORT_NAME says Hispanic, override race_label
    df.loc[df["ethnic_hispanic"], "race_label"] = "HISPANIC"

    return df


def decode_branch(df: pd.DataFrame) -> pd.DataFrame:
    """Standardize SERVICE_CODE to branch_label (ARMY, NAVY, USMC, etc.)."""
    if "SERVICE_CODE" not in df.columns:
        return df
    df["branch_label"] = (
        df["SERVICE_CODE"]
        .map(lambda x: BRANCH_DECODE.get(x, x) if x else None)
    )
    return df


def normalize_mos(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normalize MEMBER_OCC_CODE to mos_code (upper, strip spaces/leading zeros
    preserved for 4-digit Marine codes like 0311).
    """
    if "MEMBER_OCC_CODE" not in df.columns:
        return df
    df["mos_code"] = df["MEMBER_OCC_CODE"].map(
        lambda x: x.strip() if x else None
    )
    return df


def normalize_province(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize CASUALTY_STATE_PROVINCE to province_code (e.g. M1, M3)."""
    if "CASUALTY_STATE_PROVINCE" not in df.columns:
        return df
    df["province_code"] = df["CASUALTY_STATE_PROVINCE"].map(
        lambda x: x.strip().upper() if x else None
    )
    return df


def normalize_cause(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normalize INCIDENT_CASUALTY_REASON to cause_of_death.
    Also normalizes HOSTILE_DEATH_INDICATOR to bool hostile_flag.
    """
    if "INCIDENT_CASUALTY_REASON" in df.columns:
        df["cause_of_death"] = df["INCIDENT_CASUALTY_REASON"].map(
            lambda x: x.strip().upper() if x else None
        )
    if "HOSTILE_DEATH_INDICATOR" in df.columns:
        # DCAS values are typically "Y"/"N" or "HOSTILE"/"NON-HOSTILE"
        df["hostile_flag"] = df["HOSTILE_DEATH_INDICATOR"].map(
            lambda x: x.upper().startswith("Y") or x.upper() == "HOSTILE"
            if x else False
        )
    return df


def normalize_hor(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normalize HOME_OF_RECORD_STATE and HOME_OF_RECORD_COUNTY.
    Adds hor_state (2-char) and hor_county columns.
    """
    if "HOME_OF_RECORD_STATE" in df.columns:
        df["hor_state"] = df["HOME_OF_RECORD_STATE"].map(
            lambda x: x.strip().upper()[:2] if x else None
        )
    if "HOME_OF_RECORD_COUNTY" in df.columns:
        df["hor_county"] = df["HOME_OF_RECORD_COUNTY"].map(
            lambda x: x.strip().upper() if x else None
        )
    return df


# ── PIPELINE ──────────────────────────────────────────────────────────────────

def clean_dcas(df: pd.DataFrame) -> pd.DataFrame:
    """
    Full cleaning pipeline.  Applies all transformers in order and
    drops duplicate records (same MEMBER_NAME + DEATH_DATE).
    Returns a copy with snake_case derived columns added.
    """
    log.info("Cleaning DCAS (%d rows)…", len(df))
    df = df.copy()
    df = normalize_strings(df)
    df = parse_name_fields(df)
    df = parse_dates(df)
    df = decode_race_ethnicity(df)
    df = decode_branch(df)
    df = normalize_mos(df)
    df = normalize_province(df)
    df = normalize_cause(df)
    df = normalize_hor(df)

    # Deduplicate on name + death date (keeps first occurrence)
    n_before = len(df)
    key_cols = [c for c in ["MEMBER_NAME", "DEATH_DATE"] if c in df.columns]
    if key_cols:
        df = df.drop_duplicates(subset=key_cols, keep="first")
        n_dup = n_before - len(df)
        if n_dup:
            log.warning("Dropped %d duplicate records (same MEMBER_NAME + DEATH_DATE).", n_dup)

    log.info("Cleaning complete: %d rows retained.", len(df))
    return df


# ── CLI ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys, logging
    from io_dcas import read_dcas_csv, resolve_columns

    logging.basicConfig(level=logging.INFO,
                        format="%(asctime)s [%(levelname)s] %(message)s",
                        datefmt="%H:%M:%S")

    path_arg = None if len(sys.argv) < 2 else sys.argv[1]
    raw = read_dcas_csv(path_arg)
    raw = resolve_columns(raw)
    clean = clean_dcas(raw)
    print(clean.dtypes)
    print(clean[["MEMBER_NAME", "name_last", "name_first", "race_label",
                 "ethnic_hispanic", "branch_label", "mos_code"]].head(10))
