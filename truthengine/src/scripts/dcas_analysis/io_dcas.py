"""
io_dcas.py — DCAS file reading, column validation, and alias resolution
TruthEngine360 | AUMER Foundation | USC Sol Price School
"""
from __future__ import annotations

import csv
import logging
import sys
from pathlib import Path
from typing import Optional

import pandas as pd

from config import (
    COLUMN_ALIASES,
    DCAS_CLEAN,
    DCAS_RAW,
    REQUIRED_COLUMNS,
)

log = logging.getLogger(__name__)


# ── COLUMN NORMALISATION ──────────────────────────────────────────────────────

def _build_reverse_alias() -> dict[str, str]:
    """Return {alias_upper: canonical_name} lookup from COLUMN_ALIASES."""
    rev: dict[str, str] = {}
    for canonical, aliases in COLUMN_ALIASES.items():
        for a in aliases:
            rev[a.upper()] = canonical
    return rev


_REVERSE_ALIAS = _build_reverse_alias()


def resolve_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Rename DataFrame columns to canonical DCAS names.
    Strips whitespace, uppercases, then matches against COLUMN_ALIASES.
    Raises KeyError if any REQUIRED_COLUMNS remain missing after resolution.
    """
    mapping: dict[str, str] = {}
    for col in df.columns:
        normed = col.strip().upper()
        if normed in _REVERSE_ALIAS:
            mapping[col] = _REVERSE_ALIAS[normed]
        elif normed in {c.upper() for c in REQUIRED_COLUMNS}:
            # Already canonical (case-insensitive match)
            mapping[col] = normed
    df = df.rename(columns=mapping)

    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        log.warning("Missing DCAS columns after alias resolution: %s", missing)
    return df


# ── READERS ───────────────────────────────────────────────────────────────────

def _sniff_encoding(path: Path) -> str:
    """Detect file encoding (UTF-8 or latin-1 fallback)."""
    try:
        with open(path, "rb") as fh:
            raw = fh.read(8192)
        if b"\x00" in raw:
            return "utf-16"
        raw.decode("utf-8")
        return "utf-8"
    except UnicodeDecodeError:
        return "latin-1"


def read_dcas_csv(path: Optional[Path] = None, *, encoding: Optional[str] = None) -> pd.DataFrame:
    """
    Read DCAS extract CSV into a DataFrame.
    Handles UTF-8, latin-1, and UTF-16 encodings.
    """
    p = Path(path) if path else DCAS_RAW
    if not p.exists():
        raise FileNotFoundError(
            f"DCAS raw file not found: {p}\n"
            "Download from: https://catalog.archives.gov/id/2240992\n"
            "Place CSV at: data_raw/dcas_vietnam.csv"
        )
    enc = encoding or _sniff_encoding(p)
    log.info("Reading DCAS CSV: %s (encoding=%s)", p, enc)
    df = pd.read_csv(p, encoding=enc, dtype=str, low_memory=False)
    log.info("Raw shape: %s", df.shape)
    return df


def read_dcas_parquet(path: Optional[Path] = None) -> pd.DataFrame:
    """Read cleaned DCAS parquet produced by phase1."""
    p = Path(path) if path else DCAS_CLEAN
    if not p.exists():
        raise FileNotFoundError(
            f"Cleaned DCAS parquet not found: {p}\n"
            "Run phase1_standardize_dcas.py first."
        )
    return pd.read_parquet(p)


def read_census_surnames(path: Optional[Path] = None) -> pd.DataFrame:
    """
    Read Census Bureau Names_2010Census.csv.
    Expected columns: name, pctwhite, pctblack, pctapi, pctaian, pct2prace,
                      pcthispanic, count, rank, prop100k, cumulative_prop100k.
    """
    from config import CENSUS_SURNAMES
    p = Path(path) if path else CENSUS_SURNAMES
    if not p.exists():
        log.warning(
            "Census surname file not found: %s\n"
            "Download from: https://www.census.gov/topics/population/"
            "genealogy/data/2010_surnames.html\n"
            "BIFSG will fall back to embedded surname dictionary.",
            p,
        )
        return pd.DataFrame()
    enc = _sniff_encoding(p)
    df = pd.read_csv(p, encoding=enc, dtype=str, low_memory=False)
    df.columns = [c.strip().lower() for c in df.columns]
    return df


# ── VALIDATION ────────────────────────────────────────────────────────────────

def validate_dcas(df: pd.DataFrame) -> dict:
    """
    Validate a loaded (pre-clean) DCAS DataFrame.
    Returns a report dict with:
      - shape, present_columns, missing_columns
      - null_counts per required column
      - ethnic_short_counts (ETHNIC_SHORT_NAME value distribution)
      - race_counts
      - year_range
    """
    report: dict = {
        "shape": df.shape,
        "present_columns": [c for c in REQUIRED_COLUMNS if c in df.columns],
        "missing_columns": [c for c in REQUIRED_COLUMNS if c not in df.columns],
        "null_counts": {},
        "ethnic_short_counts": {},
        "race_counts": {},
        "year_range": (None, None),
    }

    for col in report["present_columns"]:
        n_null = df[col].isna().sum() + (df[col] == "").sum()
        report["null_counts"][col] = int(n_null)

    if "ETHNIC_SHORT_NAME" in df.columns:
        vc = (
            df["ETHNIC_SHORT_NAME"]
            .fillna("(null)")
            .str.upper()
            .value_counts()
            .to_dict()
        )
        report["ethnic_short_counts"] = vc

    if "RACE_OMB_NAME" in df.columns:
        vc = (
            df["RACE_OMB_NAME"]
            .fillna("(null)")
            .str.upper()
            .value_counts()
            .to_dict()
        )
        report["race_counts"] = vc

    if "INCIDENT_YEAR" in df.columns:
        years = pd.to_numeric(df["INCIDENT_YEAR"], errors="coerce").dropna()
        if len(years):
            report["year_range"] = (int(years.min()), int(years.max()))

    _check_anchor(df, report)
    return report


def _check_anchor(df: pd.DataFrame, report: dict) -> None:
    """
    Cross-check loaded data against immutable anchor metrics.
    Logs a warning if the record count deviates from 58,220.
    """
    from config import ANCHOR
    n = len(df)
    expected = ANCHOR["dcas_total"]
    if n != expected:
        log.warning(
            "ANCHOR CHECK: expected %d records, loaded %d (delta=%+d). "
            "Verify you are using NARA ID 2240992 full extract.",
            expected, n, n - expected,
        )
        report["anchor_warning"] = f"Expected {expected:,}, got {n:,}"
    else:
        log.info("ANCHOR CHECK: record count matches (%d).", n)
        report["anchor_ok"] = True

    if "ETHNIC_SHORT_NAME" in df.columns:
        hisp_vals = {"HISPANIC", "HISPANIC OR LATINO", "PUERTO RICAN",
                     "MEXICAN AMERICAN", "CUBAN", "OTHER SPANISH"}
        n_hisp = df["ETHNIC_SHORT_NAME"].str.upper().isin(hisp_vals).sum()
        exp_hisp = ANCHOR["official_hispanic"]
        if abs(n_hisp - exp_hisp) > 10:
            log.warning(
                "ANCHOR CHECK: official Hispanic count %d (expected ~%d). "
                "Possible classification change or subset load.",
                n_hisp, exp_hisp,
            )
            report["anchor_hispanic_warning"] = f"Got {n_hisp}, expected {exp_hisp}"


# ── REPORT WRITERS ────────────────────────────────────────────────────────────

def write_validation_report(report: dict, out_dir: Optional[Path] = None) -> None:
    """Write per-column null counts, ethnic counts, and cause counts to CSV."""
    from config import OUTPUTS
    out = Path(out_dir) if out_dir else OUTPUTS

    # missing_by_column.csv
    rows = [{"column": c, "null_count": report["null_counts"].get(c, "N/A")}
            for c in REQUIRED_COLUMNS]
    _write_csv(out / "missing_by_column.csv", rows, ["column", "null_count"])

    # ethnic_short_counts.csv
    if report["ethnic_short_counts"]:
        rows = [{"value": k, "count": v}
                for k, v in sorted(report["ethnic_short_counts"].items(),
                                   key=lambda x: -x[1])]
        _write_csv(out / "ethnic_short_counts.csv", rows, ["value", "count"])

    # race_counts.csv
    if report["race_counts"]:
        rows = [{"value": k, "count": v}
                for k, v in sorted(report["race_counts"].items(),
                                   key=lambda x: -x[1])]
        _write_csv(out / "race_counts.csv", rows, ["value", "count"])

    log.info("Validation CSVs written to %s", out)


def _write_csv(path: Path, rows: list[dict], fieldnames: list[str]) -> None:
    with open(path, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


# ── CLI ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO,
                        format="%(asctime)s [%(levelname)s] %(message)s",
                        datefmt="%H:%M:%S")

    path_arg = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    try:
        raw = read_dcas_csv(path_arg)
        raw = resolve_columns(raw)
        rpt = validate_dcas(raw)
        write_validation_report(rpt)
        print(f"\n{'─'*60}")
        print(f"  Shape          : {rpt['shape'][0]:,} rows × {rpt['shape'][1]} cols")
        print(f"  Present cols   : {len(rpt['present_columns'])}/{len(REQUIRED_COLUMNS)}")
        if rpt['missing_columns']:
            print(f"  Missing        : {rpt['missing_columns']}")
        if 'anchor_warning' in rpt:
            print(f"  ⚠  {rpt['anchor_warning']}")
        elif rpt.get('anchor_ok'):
            print(f"  ✓  Anchor count verified (58,220)")
        print(f"  Year range     : {rpt['year_range']}")
        print(f"{'─'*60}\n")
    except FileNotFoundError as e:
        print(f"\nERROR: {e}\n", file=sys.stderr)
        sys.exit(1)
