"""
journal_template_generator.py — APA 7 / JVS journal submission template generator
TruthEngine360 | AUMER Foundation | USC Sol Price School

Encodes all formatting rules from the JVS figure submission guide and the
APA 7 manuscript structure requirements. Generates ready-to-fill templates
for manuscripts, figure captions, statistical tables, and cover letters.

Usage:
    python journal_template_generator.py --type jvs_article
    python journal_template_generator.py --type figure_captions --figures 4
    python journal_template_generator.py --type cover_letter --title "Counting the Uncounted"
    python journal_template_generator.py --type stat_table --test t1
    python journal_template_generator.py --type all --title "My Title" --figures 4
    python journal_template_generator.py --checklist
"""
import argparse
import sys
from datetime import date
from pathlib import Path
from textwrap import dedent

# ── ANCHOR METRICS (IMMUTABLE) ────────────────────────────────────────────────
ANCHOR = {
    "n_total":             58_220,
    "n_official_hispanic": 349,
    "rate_official":       "0.60%",
    "rate_bisg":           "3.97%",
    "n_bisg_estimate":     2_309,
    "failure_rate":        "84.9%",
    "n_suppressed":        1_960,
    "impossibility_z":     "-41.6",
    "impossibility_p":     "< 10⁻³⁷⁸",
    "cronbach_alpha":       ".938",
    "convergence_r2":      ".947",
    "tau_primary":         "0.40",
    "tau_sensitivity":     "{0.30, 0.40, 0.50, 0.60, 0.70}",
    "tau_counts":          "2,876; 2,309; 3,070; 3,500; and 3,741",
    "bonferroni_alpha":    "0.05 / 7 ≈ .007",
    "nara_id":             "NARA Accession No. 2240992",
    "data_source":         "Defense Casualty Analysis System Vietnam Conflict Extract File",
}

# ── FIGURE FORMATTING RULES (IMMUTABLE) ───────────────────────────────────────
DPI_REQUIREMENTS = {
    "color_photo":    300,
    "grayscale_photo": 600,
    "line_art":       1200,
    "combination":    600,
    "forest_plot":    600,
    "bar_chart":      600,
}

ACCEPTED_FORMATS = [".tif", ".tiff", ".pdf"]
ACCEPTED_FONTS   = ["Arial", "Helvetica"]
FONT_SIZE_MIN    = 8
FONT_SIZE_MAX    = 14

# ── APA 7 STATISTICAL FORMAT HELPERS ─────────────────────────────────────────

def fmt_chi2(chi2: float, df: int, p: float) -> str:
    p_str = "< .001" if p < 0.001 else f"= {p:.3f}".lstrip("0") or ".000"
    return f"χ²({df}) = {chi2:.2f}, p {p_str}"


def fmt_or(or_val: float, ci_low: float, ci_high: float, p: float) -> str:
    p_str = "< .001" if p < 0.001 else f"= {p:.3f}".lstrip("0") or ".000"
    return f"OR = {or_val:.2f}, 95% CI [{ci_low:.2f}, {ci_high:.2f}], p {p_str}"


def fmt_z(z: float, p_str: str) -> str:
    z_sign = "−" if z < 0 else ""
    return f"z = {z_sign}{abs(z):.1f}, p {p_str}"


def fmt_pct(value: float) -> str:
    return f"{value:.1f}%"


def fmt_p(p: float) -> str:
    if p < 0.001:
        return "< .001"
    return f"= {p:.3f}".replace("0.", ".")


# ── FIGURE CAPTION TEMPLATES ──────────────────────────────────────────────────

FIGURE_TEMPLATES = {
    1: {
        "title": "BISG/BIFSG Classification Flowchart for DCAS Hispanic Identity Analysis",
        "note": (
            "BISG = Bayesian Improved Surname Geocoding; BIFSG = Bayesian Improved Surname "
            "and First-Name Geocoding; τ = classification threshold (primary: τ = 0.40); "
            "DCAS = Defense Casualty Analysis System; NARA = National Archives and Records "
            "Administration. Classification anomaly flag denotes records where p_BIFSG ≥ τ "
            "and DCAS codes the casualty as non-Hispanic. This flag is a forensic signal "
            "for analyst review, not a reclassification of the official record. "
            f"Data: {ANCHOR['nara_id']}."
        ),
        "format":   "PDF (vector)",
        "tool":     "Inkscape or PowerPoint exported to PDF",
        "dpi":      "vector",
    },
    2: {
        "title": "Odds Ratios for Mine and Booby-Trap Death by Covariates, Vietnam Conflict 1956–1975",
        "note": (
            "OR = odds ratio; CI = confidence interval; MOS = military occupational specialty; "
            "BIFSG = Bayesian Improved Surname and First-Name Geocoding; I Corps = northernmost "
            "military region (Quảng Trị, Thừa Thiên, Quảng Nam, Quảng Tín, Quảng Ngãi); "
            "HoR = home of record; SW states = TX, CA, NM, AZ, CO, NV, FL, NY, PR. "
            "Reference category: non-suppressed cohort. Error bars represent 95% CI. "
            f"n = {ANCHOR['n_total']:,}. Data: {ANCHOR['nara_id']}."
        ),
        "format":   "TIFF 600 dpi or PDF (vector)",
        "tool":     "R + ggplot2 + ggforestplot, or Python + matplotlib",
        "dpi":      600,
    },
    3: {
        "title": "Estimated Proportion of Hispanic Casualties by Year, Vietnam Conflict 1956–1975",
        "note": (
            "Official DCAS rate (solid line) = ETHNIC_SHORT_NAME codes HISPANIC, HISPANIC OR LATINO, "
            "PUERTO RICAN, MEXICAN AMERICAN, CUBAN, OTHER SPANISH. BIFSG-estimated rate (dashed line) "
            f"= p_BIFSG ≥ {ANCHOR['tau_primary']}. Shaded band = sensitivity range across τ ∈ "
            f"{ANCHOR['tau_sensitivity']}. Official rate: {ANCHOR['rate_official']}; "
            f"BIFSG estimated rate: {ANCHOR['rate_bisg']}. "
            f"Data: {ANCHOR['nara_id']}."
        ),
        "format":   "TIFF 600 dpi",
        "tool":     "Python + Matplotlib or R + ggplot2",
        "dpi":      600,
    },
    4: {
        "title": "Six-Stream Convergence of Estimated Hispanic Casualty Count by Method and Threshold",
        "note": (
            f"Bars represent estimated Hispanic casualty counts across τ ∈ {ANCHOR['tau_sensitivity']} "
            f"(estimated counts: {ANCHOR['tau_counts']}). Red dashed line = official DCAS count "
            f"({ANCHOR['n_official_hispanic']}). Six-stream convergence: Cronbach's α = "
            f"{ANCHOR['cronbach_alpha']}, R² = {ANCHOR['convergence_r2']}. "
            "BISG = Bayesian Improved Surname Geocoding; BIFSG = Bayesian Improved Surname and "
            f"First-Name Geocoding. Data: {ANCHOR['nara_id']}."
        ),
        "format":   "TIFF 600 dpi or PDF (vector)",
        "tool":     "Python + Matplotlib or R + ggplot2",
        "dpi":      600,
    },
}


def generate_figure_captions(n_figures: int = 4) -> str:
    lines = [
        "Figure Captions",
        "=" * 70,
        "(APA 7: each caption on a separate page in the manuscript; figures submitted as separate files)",
        "",
    ]
    for i in range(1, n_figures + 1):
        tpl = FIGURE_TEMPLATES.get(i, {
            "title": f"[Insert descriptive title in Title Case]",
            "note":  f"[Define all abbreviations. Cite data source. {ANCHOR['nara_id']}.]",
            "format": "[TIFF or PDF]",
            "tool":  "[Matplotlib / ggplot2 / Inkscape]",
            "dpi":   600,
        })
        lines += [
            f"Figure {i}",
            f"  {tpl['title']}",
            "",
            f"  Note. {tpl['note']}",
            "",
            f"  --- Submission specs: {tpl['format']} | {tpl['dpi']} dpi | Tool: {tpl['tool']}",
            "",
        ]
    return "\n".join(lines)


# ── STATISTICAL TABLE TEMPLATES ───────────────────────────────────────────────

def generate_stat_table(test_id: str) -> str:
    test_id = test_id.lower().strip()

    if test_id in ("t1", "t3", "impossibility"):
        return dedent(f"""\
        Table X
        Bernoulli Variance and Impossibility Score for Official Hispanic Casualty Count

        ┌─────────────────────────────────┬───────────────┐
        │ Metric                          │ Value         │
        ├─────────────────────────────────┼───────────────┤
        │ DCAS total records              │ {ANCHOR['n_total']:,}        │
        │ Official Hispanic count (DCAS)  │ {ANCHOR['n_official_hispanic']:,}           │
        │ Official Hispanic rate          │ {ANCHOR['rate_official']}         │
        │ BISG estimated prevalence       │ {ANCHOR['rate_bisg']}         │
        │ BISG expected count (μ)         │ {ANCHOR['n_bisg_estimate']:,}         │
        │ Standard deviation (σ)          │ 47.1          │
        │ Impossibility z-score           │ {ANCHOR['impossibility_z']}       │
        │ One-tailed p-value              │ {ANCHOR['impossibility_p']}    │
        └─────────────────────────────────┴───────────────┘

        Note. Bernoulli model: n = {ANCHOR['n_total']:,}, p̂ = {ANCHOR['rate_bisg']}. Impossibility z-score
        computed as z = (observed − μ) / σ = (349 − 2,309) / 47.1 = −41.6. For context, the Higgs
        boson discovery threshold is z = 5σ; this result is 8.3× more extreme. This metric is an
        immutable anchor: it cannot be revised without a documented change to the primary source
        ({ANCHOR['nara_id']}) or a demonstrated error in the Census base-rate estimate.
        BISG = Bayesian Improved Surname Geocoding. DCAS = Defense Casualty Analysis System.
        """)

    if test_id in ("t4", "branch", "chi2"):
        return dedent(f"""\
        Table X
        Chi-Square Test of Independence: BIFSG Suppression by Service Branch

        ┌──────────────────┬─────────────┬──────────────────┬───────┐
        │ Branch           │ Suppressed  │ Not Suppressed   │ Total │
        ├──────────────────┼─────────────┼──────────────────┼───────┤
        │ Army             │ [n]         │ [n]              │ [n]   │
        │ Marine Corps     │ [n]         │ [n]              │ [n]   │
        │ Navy             │ [n]         │ [n]              │ [n]   │
        │ Air Force        │ [n]         │ [n]              │ [n]   │
        │ Coast Guard      │ [n]         │ [n]              │ [n]   │
        │ Total            │ [n]         │ [n]              │ {ANCHOR['n_total']:,} │
        └──────────────────┴─────────────┴──────────────────┴───────┘
        χ²([df]) = [X.XX], p [X.XXX], Cramér's V = [X.XX]

        Note. Suppressed = BIFSG p_Hispanic ≥ {ANCHOR['tau_primary']} AND DCAS ETHNIC_SHORT_NAME coded
        non-Hispanic. This classification anomaly flag is a forensic signal for analyst review,
        not a reclassification of the official record. Bonferroni-corrected α = {ANCHOR['bonferroni_alpha']}.
        BIFSG = Bayesian Improved Surname and First-Name Geocoding.
        DCAS = Defense Casualty Analysis System. Data: {ANCHOR['nara_id']}.
        """)

    if test_id in ("t6", "precision_recall", "pr"):
        return dedent(f"""\
        Table X
        BIFSG Classification Performance Against Official DCAS Hispanic Coding

        ┌─────────────────────────────┬───────────────────────────────────┐
        │ Metric                      │ τ = 0.30 │ τ = 0.40 │ τ = 0.50  │
        ├─────────────────────────────┼──────────┼──────────┼───────────┤
        │ BIFSG-flagged (n)           │ [n]      │ 2,309    │ [n]       │
        │ True positives (official)   │ [n]      │ 349      │ [n]       │
        │ False positives (suppressed)│ [n]      │ 1,960    │ [n]       │
        │ Precision                   │ [X.XX]   │ .151     │ [X.XX]    │
        │ Recall                      │ [X.XX]   │ [X.XX]   │ [X.XX]    │
        │ F1 score                    │ [X.XX]   │ [X.XX]   │ [X.XX]    │
        │ Failure rate                │ [X.XX]   │ {ANCHOR['failure_rate']}   │ [X.XX]    │
        │ MCC                         │ [X.XX]   │ [X.XX]   │ [X.XX]    │
        └─────────────────────────────┴──────────┴──────────┴───────────┘

        Note. Official DCAS ETHNIC_SHORT_NAME used as reference standard, acknowledging its
        known under-capture of Hispanic decedents. Failure rate = proportion of BIFSG-flagged
        records not appearing in the official Hispanic cohort; the anchor failure rate of
        {ANCHOR['failure_rate']} reflects the primary finding of systemic under-coding.
        MCC = Matthews Correlation Coefficient. BIFSG = Bayesian Improved Surname and
        First-Name Geocoding. DCAS = Defense Casualty Analysis System.
        Data: {ANCHOR['nara_id']}.
        """)

    if test_id in ("logit", "regression", "logistic"):
        return dedent(f"""\
        Table X
        Logistic Regression: Mine and Booby-Trap Death Predicted by BIFSG Suppression Status

        ┌──────────────────────────────────────┬────────┬───────────────────┬──────────┐
        │ Variable                             │ OR     │ 95% CI            │ p        │
        ├──────────────────────────────────────┼────────┼───────────────────┼──────────┤
        │ Suppressed Hispanic proxy (primary)  │ [X.XX] │ [[X.XX, X.XX]]    │ [.XXX]   │
        │ Tier-1 combat MOS                    │ [X.XX] │ [[X.XX, X.XX]]    │ [.XXX]   │
        │ I Corps province                     │ [X.XX] │ [[X.XX, X.XX]]    │ [.XXX]   │
        │ Year 1968                            │ [X.XX] │ [[X.XX, X.XX]]    │ [.XXX]   │
        │ SW home of record                    │ [X.XX] │ [[X.XX, X.XX]]    │ [.XXX]   │
        ├──────────────────────────────────────┼────────┼───────────────────┼──────────┤
        │ Model 2 (+ branch dummies)           │        │                   │          │
        │ Army                                 │ [X.XX] │ [[X.XX, X.XX]]    │ [.XXX]   │
        │ Marine Corps                         │ [X.XX] │ [[X.XX, X.XX]]    │ [.XXX]   │
        └──────────────────────────────────────┴────────┴───────────────────┴──────────┘
        Model 1: AIC = [XXXX.X], McFadden's pseudo-R² = [.XXX], n = {ANCHOR['n_total']:,}
        Model 2: AIC = [XXXX.X], McFadden's pseudo-R² = [.XXX]

        Note. DV = mine_death_flag (1 = cause of death coded as mine, booby trap, or IED).
        OR = odds ratio. CI = confidence interval. SW states = TX, CA, NM, AZ, CO, NV, FL, NY, PR.
        Suppressed Hispanic proxy = BIFSG p_Hispanic ≥ {ANCHOR['tau_primary']} AND DCAS coded non-Hispanic.
        MOS = military occupational specialty. All models estimated via maximum likelihood
        (statsmodels v.0.14, BFGS optimisation, maxiter = 200). Bonferroni-corrected
        α = {ANCHOR['bonferroni_alpha']}. Data: {ANCHOR['nara_id']}.
        """)

    if test_id in ("sensitivity", "tau_sweep"):
        return dedent(f"""\
        Table X
        Sensitivity Analysis: Estimated Hispanic Casualty Count Across Classification Thresholds

        ┌──────┬────────────┬─────────────────┬───────────┬────────┬────────┬──────────────┐
        │ τ    │ Flagged n  │ Precision        │ Recall    │ F1     │ MCC    │ Failure Rate │
        ├──────┼────────────┼─────────────────┼───────────┼────────┼────────┼──────────────┤
        │ 0.30 │ 2,876      │ [X.XX]          │ [X.XX]    │ [X.XX] │ [X.XX] │ [X.XX]       │
        │ 0.40 │ 2,309      │ .151            │ [X.XX]    │ [X.XX] │ [X.XX] │ {ANCHOR['failure_rate']}         │
        │ 0.50 │ 3,070      │ [X.XX]          │ [X.XX]    │ [X.XX] │ [X.XX] │ [X.XX]       │
        │ 0.60 │ 3,500      │ [X.XX]          │ [X.XX]    │ [X.XX] │ [X.XX] │ [X.XX]       │
        │ 0.70 │ 3,741      │ [X.XX]          │ [X.XX]    │ [X.XX] │ [X.XX] │ [X.XX]       │
        └──────┴────────────┴─────────────────┴───────────┴────────┴────────┴──────────────┘
        Six-stream convergence: Cronbach's α = {ANCHOR['cronbach_alpha']}, R² = {ANCHOR['convergence_r2']}

        Note. τ = BIFSG classification threshold. BIFSG = Bayesian Improved Surname and First-Name
        Geocoding. Reference standard = DCAS ETHNIC_SHORT_NAME (n = {ANCHOR['n_official_hispanic']} official Hispanic).
        Failure rate = FP / (TP + FP). MCC = Matthews Correlation Coefficient.
        Data: {ANCHOR['nara_id']}.
        """)

    return f"[No template defined for test_id='{test_id}'. Valid options: t1, t3, t4, t6, logit, sensitivity]"


# ── COVER LETTER TEMPLATE ─────────────────────────────────────────────────────

def generate_cover_letter(title: str = "Counting the Uncounted") -> str:
    today = date.today().strftime("%B %d, %Y")
    return dedent(f"""\
    {today}

    The Editors
    Journal of Veterans Studies
    University of Calgary Press

    Dear Editor,

    I am pleased to submit the manuscript titled "{title}" for consideration
    in the Journal of Veterans Studies. This manuscript has not been submitted
    to, accepted by, or published in any other journal, and no portion of the
    manuscript is under review elsewhere.

    [One paragraph: describe the contribution, significance, and why JVS is the
    appropriate venue. Reference the core finding: the impossibility z-score of
    −41.6 (p < 10⁻³⁷⁸), the 84.9% BIFSG failure rate, and the estimated 2,309
    Hispanic-probable casualties versus the official count of 349.]

    Word count: [XXXX] words (excluding abstract, references, tables, and figure captions)
    Number of tables: [X]
    Number of figures: [4]

    Conflict of Interest Statement:
    [The authors declare no conflicts of interest.] / [Disclose any relevant conflicts.]

    Data Availability Statement:
    Primary data: {ANCHOR['data_source']}, {ANCHOR['nara_id']}, National Archives and
    Records Administration. Census Names file: U.S. Census Bureau 2010 Surnames dataset.
    Analysis code and processed data are available at [repository URL].

    Suggested Reviewers:
    1. [Name], [Institution] — [email] (expertise: military history, Hispanic veterans)
    2. [Name], [Institution] — [email] (expertise: BISG methodology, racial classification)
    3. [Name], [Institution] — [email] (expertise: Vietnam War history)
    4. [Name], [Institution] — [email] (expertise: demographic statistics)
    5. [Name], [Institution] — [email] (expertise: military casualty records)

    Corresponding Author:
    [Name]
    [Title], [Institution]
    ORCID: [0000-0000-0000-0000]
    Email: [email]

    We look forward to your consideration.

    Respectfully submitted,

    [Author Name]
    [Institution]
    """)


# ── MANUSCRIPT SKELETON TEMPLATE ──────────────────────────────────────────────

def generate_manuscript_skeleton(title: str = "Counting the Uncounted") -> str:
    return dedent(f"""\
    {'=' * 70}
    MANUSCRIPT SKELETON — APA 7 / JVS FORMAT
    Title: {title}
    TruthEngine360 | AUMER Foundation | USC Sol Price School
    Data: {ANCHOR['nara_id']}
    {'=' * 70}

    [TITLE PAGE — separate page]
    ─────────────────────────────────────────────────────────────────────
    {title}
    [Italic subtitle here]

    [Author Name]
    [Department, Institution, City, State]

    Author Note
    [ORCID: 0000-0000-0000-0000]
    [Funding: This research was supported by ...]
    [Conflicts of interest: The author(s) declare no conflicts of interest.]
    [Correspondence: Name, email]

    ─────────────────────────────────────────────────────────────────────
    Abstract
    ─────────────────────────────────────────────────────────────────────

    [Single paragraph, 200–250 words. No citations. Define all abbreviations.
    Include: research question, data source, method (BIFSG), key finding
    (impossibility z = −41.6, p < 10⁻³⁷⁸; {ANCHOR['failure_rate']} failure rate;
    {ANCHOR['n_bisg_estimate']:,} estimated vs. {ANCHOR['n_official_hispanic']} official),
    and implications.]

    Keywords: Hispanic veterans, Vietnam War, casualty records, ethnic
    misclassification, BISG, BIFSG, Defense Casualty Analysis System, forensic
    demography, military history, suppressed identity

    ─────────────────────────────────────────────────────────────────────
                          Introduction
    ─────────────────────────────────────────────────────────────────────

    [Introduce the historical question. State the impossibility anchor metric
    immediately. Characterize the contribution as a forensic signal analysis,
    not a reclassification of official records.]

    ─────────────────────────────────────────────────────────────────────
                     Historical Background
    ─────────────────────────────────────────────────────────────────────

    Suppression of Hispanic Identity in Military Records

    [Discuss the historical mechanisms of identity suppression: OMB Directive 15
    not in effect until 1977; clerk-recorded vs. self-identified ethnicity;
    the structural factors leading to under-coding in the DCAS.]

    ─────────────────────────────────────────────────────────────────────
                       Data and Sources
    ─────────────────────────────────────────────────────────────────────

    Primary Dataset

    [Describe DCAS: {ANCHOR['n_total']:,} records, 1956–1975, fields used.
    Cite: {ANCHOR['nara_id']}.]

    Surname Reference File

    [Describe Census Names 2010 file: ~162,000 surnames, proportion Hispanic.]

    Population Base Rates

    [Describe 1970 Census base rate: p̂ = 0.044 (4.4 percent).]

    ─────────────────────────────────────────────────────────────────────
                           Method
    ─────────────────────────────────────────────────────────────────────

    Overview

    [One paragraph overview of the BISG/BIFSG pipeline and the
    7-test pre-specified battery.]

    BISG/BIFSG Surname and First-Name Scoring

    [Describe Bayes' theorem application. BIFSG weighted geometric mean,
    weight w = 0.30. Tau threshold τ = {ANCHOR['tau_primary']}.]

    The Impossibility Score (Anchor Metric)

    [Describe T3: z = (349 − 2,309) / 47.1 = {ANCHOR['impossibility_z']},
    p {ANCHOR['impossibility_p']}. Note: immutable anchor.]

    MOS Risk Tier Classification

    [Describe tier1/tier2 MOS flags. Cite specific MOS codes: 11B, 0311, 12B.]

    Province Risk Stratification

    [Describe I Corps provinces: Quảng Trị, Thừa Thiên, Quảng Nam,
    Quảng Tín, Quảng Ngãi. icorp_flag.]

    Pre-Specified Seven-Test Battery

    [List T1–T7 with H0 for each. State Bonferroni α = {ANCHOR['bonferroni_alpha']}.]

    T1 — Bernoulli Variance Test
    T2 — BISG Calibration Test (Hosmer-Lemeshow)
    T3 — Impossibility Score (Anchor Metric)
    T4 — χ² Branch × BIFSG
    T5 — Jaccard Surname Overlap (k = 1,000, seed = 42)
    T6 — Precision and Recall (failure rate = {ANCHOR['failure_rate']})
    T7 — Province × BIFSG × Cause (log-linear)

    ─────────────────────────────────────────────────────────────────────
                           Results
    ─────────────────────────────────────────────────────────────────────

    Descriptive Statistics

    [Table 1 reference. State n = {ANCHOR['n_total']:,}; official Hispanic =
    {ANCHOR['n_official_hispanic']} ({ANCHOR['rate_official']}); BIFSG estimate =
    {ANCHOR['n_bisg_estimate']:,} ({ANCHOR['rate_bisg']}).]

    Seven-Test Battery Results

    [Table 2 reference. Report each test result in the format:
    T1: z = XX, p [p_str] — [reject/retain] H0
    T3 (anchor): z = {ANCHOR['impossibility_z']}, p {ANCHOR['impossibility_p']}]

    Logistic Regression

    [Table 3 reference. Report Model 1 and Model 2 ORs with 95% CI and p-values.
    Format: OR = X.XX, 95% CI [X.XX, X.XX], p [p_str].]

    Six-Stream Convergence

    [Table 4 reference. τ ∈ {ANCHOR['tau_sensitivity']}; estimates:
    {ANCHOR['tau_counts']}. Cronbach's α = {ANCHOR['cronbach_alpha']},
    R² = {ANCHOR['convergence_r2']}.]

    ─────────────────────────────────────────────────────────────────────
                          Discussion
    ─────────────────────────────────────────────────────────────────────

    [Interpret findings in historical context. Emphasize that
    classification_anomaly_flag records are a forensic signal for
    analyst review, not a reclassification. Discuss implications
    for VA benefits, memorial recognition, and historical record.]

    ─────────────────────────────────────────────────────────────────────
                         Limitations
    ─────────────────────────────────────────────────────────────────────

    [Address: (1) BISG designed for living populations, applied to historical
    decedents; (2) 1970 base rate assumptions; (3) BIFSG w = 0.30 weight not
    validated on Vietnam-era cohort; (4) tau threshold subjectivity.]

    ─────────────────────────────────────────────────────────────────────
                          Conclusion
    ─────────────────────────────────────────────────────────────────────

    [Restate the core impossibility finding. Call for primary-source
    review of the {ANCHOR['n_suppressed']:,} suppressed-cohort records.
    Recommend DD Form 1300 and service record audit protocol.]

    ─────────────────────────────────────────────────────────────────────
                          References
    ─────────────────────────────────────────────────────────────────────

    [APA 7 hanging indent. All DOIs as https://doi.org/...]

    Elliott, M. N., Fremont, A., Morrison, P. A., Pantoja, P., & Lurie, N. (2008).
        A new method for estimating race/ethnicity and associated uncertainty among
        health plan members. Health Services Research, 43(5), 1722–1742.
        https://doi.org/10.1111/j.1475-6773.2008.00865.x

    Elliott, M. N., Morrison, P. A., Fremont, A., McCaffrey, D. F., Pantoja, P.,
        & Lurie, N. (2009). Using the Census Bureau's surname list to improve
        estimates of race/ethnicity and associated disparities. Health Services and
        Outcomes Research Methodology, 9(2), 69–83.
        https://doi.org/10.1007/s10742-009-0047-1

    Fiscella, K., & Fremont, A. M. (2006). Use of geocoding and surname analysis
        to estimate race and ethnicity. Health Services Research, 41(4p1), 1482–1500.
        https://doi.org/10.1111/j.1475-6773.2006.00551.x

    National Archives and Records Administration. (2024). Defense Casualty Analysis
        System Vietnam Conflict Extract File [Data set]. {ANCHOR['nara_id']}.
        [URL or retrieval statement]

    U.S. Census Bureau. (2012). Frequently occurring surnames from the 2010 Census
        [Data set]. Names_2010Census.csv.
        https://www.census.gov/topics/population/genealogy/data/2010_surnames.html

    Voicu, I. (2018). Using first name information to improve race and ethnicity
        classification. Statistics and Public Policy, 5(1), 1–13.
        https://doi.org/10.1080/2330443X.2018.1427012

    ─────────────────────────────────────────────────────────────────────
    TABLES — Insert after References in Word document
    ─────────────────────────────────────────────────────────────────────
    [Table 1: Descriptive Statistics]
    [Table 2: Seven-Test Battery Results]
    [Table 3: Logistic Regression Odds Ratios]
    [Table 4: Sensitivity Analysis / Six-Stream Convergence]

    ─────────────────────────────────────────────────────────────────────
    FIGURE CAPTIONS — Insert after Tables; figures as separate files
    ─────────────────────────────────────────────────────────────────────
    [See figure_captions.txt generated by this script]
    """)


# ── PRE-SUBMISSION CHECKLIST ──────────────────────────────────────────────────

def print_checklist() -> None:
    items = [
        ("MANUSCRIPT", [
            "Word count confirmed (JVS target: 8,000–10,000 words, excl. abstract/refs/tables/captions)",
            "Abstract: ≤250 words, single paragraph, no citations, all abbreviations defined",
            "Keywords: 8–10 terms, italic 'Keywords:' label, sentence case",
            "All headings follow APA 7 level hierarchy (Level 1 centered bold, Level 2 flush left bold)",
            "All p-values: italic p, drop leading zero, '< .001' for p below .001",
            "All chi-square reports: χ²(df) = X.XX, p X.XXX",
            "All OR reports: OR = X.XX, 95% CI [X.XX, X.XX], p X.XXX",
            "Impossibility z = −41.6, p < 10⁻³⁷⁸ — ANCHOR — do not change",
            "Failure rate = 84.9% — ANCHOR — do not change",
            "n total = 58,220; official Hispanic = 349 — ANCHOR — do not change",
            "classification_anomaly_flag described as forensic signal, not reclassification",
            "All abbreviations defined at first use in body text",
            "Author Note: ORCID, funding, conflicts of interest",
            "Cover letter: separate file, word count, no duplicate submission statement",
        ]),
        ("FIGURES", [
            "Figure 1: BIFSG flowchart → PDF vector | Arial 8–14pt | white bg",
            "Figure 2: Forest plot → TIFF 600dpi or PDF | Arial 8–14pt | colorblind-safe",
            "Figure 3: Time-series → TIFF 600dpi | Arial 8–14pt | colorblind-safe",
            "Figure 4: Six-stream bar chart → TIFF 600dpi or PDF | Arial 8–14pt | colorblind-safe",
            "All figure files named: 'Figure 1.tif', 'Figure 2.tif', etc.",
            "All figures: white background, no excess whitespace, no layers",
            "All figures: consistent font (Arial/Helvetica) and size (8–14pt) across panels",
            "Multi-panel: bold A, B, C labels (upper-left), no box/parentheses",
            "All figure notes define every abbreviation",
            "Figure notes cite: NARA Accession No. 2240992",
        ]),
        ("TABLES", [
            "Tables embedded in manuscript Word file, after References",
            "Each table: bold 'Table N', italic title, horizontal rules only (no vertical lines)",
            "Each table Note. defines all abbreviations",
            "No table submitted as image file",
            "Anchor table (Table 2) shows z = −41.6, p < 10⁻³⁷⁸",
        ]),
        ("REFERENCES", [
            "All DOIs formatted as https://doi.org/...",
            "Hanging indent applied to all entries",
            "NARA source cited with NARA Accession No. 2240992",
            "Elliott et al. 2008, 2009 (BISG) cited",
            "Fiscella & Fremont 2006 cited",
            "Voicu 2018 (BIFSG) cited",
        ]),
        ("FILE PACKAGE", [
            "manuscript.docx (includes tables, figure captions page)",
            "cover_letter.docx (separate file)",
            "Figure 1.pdf (flowchart, vector)",
            "Figure 2.tif (forest plot, 600 dpi)",
            "Figure 3.tif (time-series, 600 dpi)",
            "Figure 4.tif or .pdf (bar chart, 600 dpi or vector)",
            "supplementary.docx or .xlsx (if applicable)",
        ]),
    ]

    print("=" * 70)
    print("  PRE-SUBMISSION CHECKLIST — JVS / APA 7")
    print("=" * 70)
    for section, checks in items:
        print(f"\n  [{section}]")
        for c in checks:
            print(f"  ☐  {c}")
    print("\n" + "=" * 70)


# ── FIGURE EXPORT CODE SNIPPETS ───────────────────────────────────────────────

def generate_figure_export_snippets() -> str:
    return dedent(f"""\
    ── FIGURE EXPORT CODE SNIPPETS ──────────────────────────────────────────────

    # Python + Matplotlib (Figure 3 & 4)
    import matplotlib
    matplotlib.rcParams['font.family'] = 'Arial'
    matplotlib.rcParams['font.size']   = 10

    fig, ax = plt.subplots(figsize=(7, 5))
    # ... build your figure ...
    fig.savefig("Figure 3.tif", dpi=600, bbox_inches="tight", format="tiff")
    fig.savefig("Figure 4.tif", dpi=600, bbox_inches="tight", format="tiff")

    # ─────────────────────────────────────────────────────────────────────────

    # R + ggplot2 (Figure 2 Forest Plot)
    library(ggplot2)
    library(ggforestplot)
    # ... build forest_plot object ...
    ggsave("Figure 2.tif", plot=forest_plot, dpi=600, units="in", width=7, height=5)

    # R + ggplot2 (Figure 3 Time-Series)
    ggsave("Figure 3.tif", plot=ts_plot, dpi=600, units="in", width=7, height=4)

    # ─────────────────────────────────────────────────────────────────────────

    # Inkscape (Figure 1 Flowchart) — command line
    inkscape Figure1.svg --export-type=pdf --export-filename="Figure 1.pdf"
    # Or for raster at 1200 dpi:
    inkscape Figure1.svg --export-type=png --export-dpi=1200 --export-filename="Figure1_1200.png"
    # Then convert PNG to TIFF:
    # convert Figure1_1200.png Figure1.tif   (ImageMagick)

    # ─────────────────────────────────────────────────────────────────────────
    # COLORBLIND-SAFE PALETTE (TruthEngine360)
    PALETTE = {{
        "navy":     "#002147",
        "gold":     "#B8860B",
        "teal":     "#008080",
        "red":      "#C0392B",
        "gray":     "#7F8C8D",
        "offwhite": "#F8F8F8",
    }}
    # Viridis/Cividis alternatives for continuous scales:
    # plt.cm.viridis, plt.cm.cividis
    """)


# ── CLI ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="APA 7 / JVS journal submission template generator — TruthEngine360"
    )
    parser.add_argument(
        "--type",
        choices=["jvs_article", "figure_captions", "cover_letter",
                 "stat_table", "export_snippets", "all"],
        default="all",
        help="Template type to generate",
    )
    parser.add_argument("--title",   type=str,  default="Counting the Uncounted",
                        help="Manuscript title")
    parser.add_argument("--figures", type=int,  default=4,
                        help="Number of figures (default: 4)")
    parser.add_argument("--test",    type=str,  default="t3",
                        choices=["t1","t3","t4","t6","logit","sensitivity"],
                        help="Test ID for stat_table template")
    parser.add_argument("--checklist", action="store_true",
                        help="Print pre-submission checklist and exit")
    parser.add_argument("--out", type=Path, default=None,
                        help="Output directory (default: print to stdout)")

    args = parser.parse_args()

    if args.checklist:
        print_checklist()
        return

    outputs = {}

    if args.type in ("jvs_article", "all"):
        outputs["manuscript_skeleton.txt"] = generate_manuscript_skeleton(args.title)

    if args.type in ("figure_captions", "all"):
        outputs["figure_captions.txt"] = generate_figure_captions(args.figures)

    if args.type in ("cover_letter", "all"):
        outputs["cover_letter_template.txt"] = generate_cover_letter(args.title)

    if args.type in ("stat_table", "all"):
        test_ids = (
            ["t1", "t4", "t6", "logit", "sensitivity"]
            if args.type == "all"
            else [args.test]
        )
        for tid in test_ids:
            outputs[f"stat_table_{tid}.txt"] = generate_stat_table(tid)

    if args.type in ("export_snippets", "all"):
        outputs["figure_export_snippets.txt"] = generate_figure_export_snippets()

    if args.out:
        args.out.mkdir(parents=True, exist_ok=True)
        for fname, content in outputs.items():
            fpath = args.out / fname
            fpath.write_text(content, encoding="utf-8")
            print(f"Written: {fpath}")
        print("\nPre-submission checklist:")
        print_checklist()
    else:
        sep = "\n" + "─" * 70 + "\n"
        print(sep.join(outputs.values()))
        print("\n")
        print_checklist()


if __name__ == "__main__":
    main()
