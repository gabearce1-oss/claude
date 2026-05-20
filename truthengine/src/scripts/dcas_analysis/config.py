"""
config.py — Central configuration for DCAS BIFSG Analysis Pipeline
TruthEngine360 | AUMER Foundation | USC Sol Price School
"""
from pathlib import Path

# ── PROJECT PATHS ────────────────────────────────────────────────────────────
ROOT          = Path(__file__).parent
DATA_RAW      = ROOT / "data_raw"
DATA_PROC     = ROOT / "data_processed"
OUTPUTS       = ROOT / "outputs"
LOGS          = ROOT / "logs"

for d in [DATA_RAW, DATA_PROC, OUTPUTS, LOGS]:
    d.mkdir(parents=True, exist_ok=True)

DCAS_RAW          = DATA_RAW  / "dcas_vietnam.csv"
CENSUS_SURNAMES   = DATA_RAW  / "Names_2010Census.csv"

DCAS_CLEAN        = DATA_PROC / "dcas_clean.parquet"
DCAS_BIFSG        = DATA_PROC / "dcas_bifsg.parquet"
DCAS_FEATURES     = DATA_PROC / "dcas_analysis_ready.parquet"

# ── ANCHOR METRICS (immutable — primary source NARA ID 2240992) ──────────────
ANCHOR = {
    "dcas_total":           58_220,
    "official_hispanic":    349,
    "official_pct":         0.0060,
    "bisg_estimate":        2_309,     # τ=0.40 estimate, Phase III
    "bisg_pct":             0.0397,
    "phase3_median":        3_272,     # BIFSG Phase III median
    "bisg_corridor_low":    2_876,
    "bisg_corridor_high":   3_372,
    "failure_rate":         0.849,
    "tau":                  0.40,
    "tau_low":              0.30,
    "tau_high":             0.70,
    "impossibility_sigma":  -41.6,
    "r_squared":            0.947,
    "alpha_cronbach":       0.938,
    "n_verified_t5":        6,
    "five_wall_names":      5,
}

# ── BISG THRESHOLDS ───────────────────────────────────────────────────────────
TAU_PRIMARY     = 0.40   # Main analysis threshold (anchor)
TAU_SENSITIVITY = [0.30, 0.40, 0.50, 0.60, 0.70]

# ── DCAS REQUIRED COLUMNS ────────────────────────────────────────────────────
# As they appear (or should appear) in the NARA extract
REQUIRED_COLUMNS = [
    "MEMBER_NAME",
    "MEMBER_OCC_CODE",
    "MEMBER_OCC_NAME",
    "HOME_OF_RECORD_STATE",
    "HOME_OF_RECORD_COUNTY",
    "CASUALTY_CITY",
    "CASUALTY_STATE_PROVINCE",
    "INCIDENT_CASUALTY_REASON",
    "HOSTILE_DEATH_INDICATOR",
    "INCIDENT_YEAR",
    "RACE_OMB_NAME",
    "ETHNIC_SHORT_NAME",
    "SERVICE_CODE",
    "MEMBER_UNIT",
    "DEATH_DATE",
]

# Acceptable synonyms for required columns (normalized automatically)
COLUMN_ALIASES = {
    "MEMBER_NAME":             ["NAME", "FULLNAME", "CASUALTY_NAME"],
    "MEMBER_OCC_CODE":         ["MOS", "MOS_CODE", "OCC_CODE", "OCCUPATIONAL_CODE"],
    "MEMBER_OCC_NAME":         ["MOS_NAME", "MOS_TITLE", "OCC_NAME"],
    "HOME_OF_RECORD_STATE":    ["HOR_STATE", "HOR_ST", "HOME_STATE"],
    "HOME_OF_RECORD_COUNTY":   ["HOR_COUNTY", "HOME_COUNTY"],
    "CASUALTY_CITY":           ["INCIDENT_CITY", "CITY"],
    "CASUALTY_STATE_PROVINCE": ["PROVINCE_CODE", "PROVINCE", "INCIDENT_PROVINCE"],
    "INCIDENT_CASUALTY_REASON":["CASUALTY_REASON", "CAUSE_OF_DEATH", "COD"],
    "HOSTILE_DEATH_INDICATOR": ["HOSTILE", "HOSTILE_FLAG", "HOSTILE_NONHOSTILE"],
    "INCIDENT_YEAR":           ["YEAR", "YEAR_OF_DEATH", "CASUALTY_YEAR"],
    "RACE_OMB_NAME":           ["RACE", "RACE_CODE", "RACE_LABEL"],
    "ETHNIC_SHORT_NAME":       ["ETHNICITY", "ETHNIC_CODE", "ETHNIC_LABEL"],
    "SERVICE_CODE":            ["BRANCH", "SERVICE_BRANCH", "BRANCH_CODE"],
    "MEMBER_UNIT":             ["UNIT", "UNIT_NAME", "REPORTING_UNIT"],
    "DEATH_DATE":              ["DATE_OF_DEATH", "KIA_DATE", "CASUALTY_DATE"],
}

# ── HIGH-RISK MOS CODES ───────────────────────────────────────────────────────
TIER1_MOS = {
    # Army
    "11B", "11C", "11H", "11D", "11F",  # Infantry, indirect fire, scouts
    "12B", "12C",                          # Combat engineers
    "13B", "13F",                          # Field artillery, FIST
    "91B",                                 # Medical (forward)
    # Marine Corps equivalents
    "0311", "0331", "0341", "0351",        # Rifleman, machine gunner, mortarman, anti-tank
    "0111", "0121",                        # Administrative → coded as infantry support
}

TIER2_MOS = {
    "11E", "12A",                          # Armor, general engineering
    "13C", "13D", "13E",                   # Artillery variants
    "71L", "71M",                          # Administrative (field deployed)
    "0211", "0231", "0311",               # Intel, signals, infantry variants
}

# ── VIETNAM PROVINCES (DCAS codes → region mapping) ──────────────────────────
ICORP_PROVINCES = {
    "M1",   # Quang Tri — highest casualty concentration
    "M2",   # Thua Thien (Hue)
    "M3",   # Quang Nam / Da Nang
    "M4",   # Quang Tin
    "M5",   # Quang Ngai
}

IICORP_PROVINCES  = {"M6","M7","M8","M9","M10","M11","M12"}
IIICORP_PROVINCES = {"M13","M14","M15","M16","M17","M18","M19","M20"}
IVCORP_PROVINCES  = {"M21","M22","M23","M24","M25","M26"}

# ── CAUSE-OF-DEATH CODES (mine / booby trap / small arms / artillery) ─────────
# Values derived from DCAS INCIDENT_CASUALTY_REASON field
MINE_CODES = {
    "MINE", "BOOBY TRAP", "EXPLOSIVE DEVICE", "IED", "LAND MINE",
    "ANTI-PERSONNEL MINE", "MINE/BOOBY TRAP", "BOOBY_TRAP",
    "MINE_OR_BOOBY_TRAP", "7",   # Numeric code variant
}
SMALL_ARMS_CODES = {
    "SMALL ARMS", "SMALL ARMS FIRE", "GROUND FIRE", "RIFLE FIRE",
    "HOSTILE SMALL ARMS", "1", "SA",
}
ARTILLERY_CODES = {
    "ARTILLERY", "MORTAR", "ROCKET", "INDIRECT FIRE", "RECOILLESS RIFLE",
    "GRENADE", "RPG", "2", "3",
}

# ── SOUTHWEST HOME-OF-RECORD STATES (Latino service concentration) ────────────
SW_STATES = {"TX","CA","NM","AZ","CO","NV","FL","NY","PR"}  # + Puerto Rico

# ── RACE / ETHNICITY DECODE MAP ───────────────────────────────────────────────
RACE_DECODE = {
    "WHITE NOT OF HISPANIC ORIGIN": "WHITE_NON_HISPANIC",
    "WHITE": "WHITE_NON_HISPANIC",
    "BLACK OR AFRICAN AMERICAN":    "BLACK",
    "BLACK":                        "BLACK",
    "HISPANIC":                     "HISPANIC",
    "HISPANIC OR LATINO":           "HISPANIC",
    "PUERTO RICAN":                 "HISPANIC",
    "MEXICAN AMERICAN":             "HISPANIC",
    "ASIAN OR PACIFIC ISLANDER":    "API",
    "AMERICAN INDIAN":              "AIAN",
    "UNKNOWN":                      "UNKNOWN",
    "OTHER":                        "OTHER",
}

ETHNIC_HISPANIC_VALUES = {
    "HISPANIC", "HISPANIC OR LATINO", "PUERTO RICAN",
    "MEXICAN AMERICAN", "CUBAN", "OTHER SPANISH",
}

# ── VIETNAM-ERA BASE RATES (1970 Census, DOD manpower) ───────────────────────
BASE_RATES_1970 = {
    "white_nh":  0.877,
    "black":     0.113,
    "hispanic":  0.044,
    "api":       0.009,
    "aian":      0.007,
    "other":     0.010,
}

# ── ANALYSIS YEARS ────────────────────────────────────────────────────────────
PEAK_YEAR           = 1968   # Maximum casualty year
ANALYSIS_YEARS      = list(range(1965, 1975))
HIGH_INTENSITY_YEARS = [1967, 1968, 1969]

# ── STATISTICAL THRESHOLDS ───────────────────────────────────────────────────
ALPHA              = 0.05    # Significance level
BONFERRONI_K       = 7       # Number of planned tests
ALPHA_BONFERRONI   = ALPHA / BONFERRONI_K

# ── SERVICE BRANCH DECODE ────────────────────────────────────────────────────
BRANCH_DECODE = {
    "A": "ARMY", "ARMY": "ARMY",
    "N": "NAVY", "NAVY": "NAVY",
    "M": "USMC", "MARINES": "USMC", "MARINE CORPS": "USMC",
    "F": "AIR_FORCE", "AF": "AIR_FORCE",
    "C": "COAST_GUARD",
}
