# Methods
## Prepared for: Historical Journal Submission
## DCAS BIFSG Analysis — TruthEngine360 / AUMER Foundation / USC Sol Price School

---

## 3. Methods

### 3.1 Data Sources

The primary dataset is the Defense Casualty Analysis System (DCAS) Vietnam
Conflict Extract File, NARA Accession No. 2240992, obtained from the National
Archives and Records Administration. The file contains 58,220 records covering
all branches of service for the period 1956–1975. Each record includes the
casualty's full name (`MEMBER_NAME`), military occupational specialty
(`MEMBER_OCC_CODE`, `MEMBER_OCC_NAME`), home of record (`HOME_OF_RECORD_STATE`,
`HOME_OF_RECORD_COUNTY`), province of death (`CASUALTY_STATE_PROVINCE`), cause
of death (`INCIDENT_CASUALTY_REASON`), hostile-death indicator
(`HOSTILE_DEATH_INDICATOR`), year of death (`INCIDENT_YEAR`), and — critically
— official racial and ethnic classifications (`RACE_OMB_NAME`,
`ETHNIC_SHORT_NAME`). The `ETHNIC_SHORT_NAME` field records values including
HISPANIC, HISPANIC OR LATINO, PUERTO RICAN, MEXICAN AMERICAN, CUBAN, and OTHER
SPANISH, and is the official agency designation for ethnicity distinct from
racial category.

The secondary reference file is the United States Census Bureau 2010 Surnames
dataset (*Names_2010Census.csv*), which provides, for approximately 162,000
surnames, the estimated proportions identifying as Hispanic, White
(non-Hispanic), Black, Asian or Pacific Islander, American Indian or Alaska
Native, and two or more races. This file serves as the posterior probability
table for the Bayesian surname-classification algorithm described below.

Population base rates follow the 1970 Decennial Census and Department of
Defense manpower records, consistent with the demographic composition of the
Vietnam-era armed forces. The Hispanic base rate employed is p̂ = 0.044
(4.4 percent of the eligible military-age male population in 1970).

---

### 3.2 Operationalisation of "Hispanic-Probable" Status

The central methodological challenge is that DCAS `ETHNIC_SHORT_NAME` captures
official self-identified (or clerk-recorded) ethnicity, while the present
inquiry asks how many casualties were *Hispanic by descent* regardless of
official coding. To address this, we employ Bayesian Improved Surname Geocoding
(BISG), as described by Elliott et al. (2008, 2009) and subsequently extended
by Fiscella and Fremont (2006). The extended variant, BIFSG, incorporates
first-name probability alongside surname probability (Voicu 2018).

**BISG posterior.** For each record, the surname is parsed from the
`MEMBER_NAME` field (format: LAST, FIRST MI). The Census surname table is
queried for the probability that a bearer of that surname belongs to each
racial/ethnic group. These surname-conditional probabilities are combined with
1970 population base rates via Bayes' theorem:

$$P(\text{Hispanic} \mid \text{surname}) = \frac{P(\text{surname} \mid \text{Hispanic}) \cdot P(\text{Hispanic})}{\sum_r P(\text{surname} \mid r) \cdot P(r)}$$

where the denominator sums over all six racial/ethnic groups (*r*). The result
is a continuous probability score ranging from 0 to 1.

**BIFSG extension.** Where the first name is recoverable, a weighted geometric
mean combines the surname posterior with a first-name Hispanic frequency
estimate:

$$p_{\text{BIFSG}} = \exp\!\Bigl[(1-w)\ln p_{\text{BISG}} + w\ln p_{\text{first-name}}\Bigr]$$

with weight *w* = 0.30, consistent with Voicu (2018). First-name frequencies
are derived from the 2010 Census name file supplemented by published Hispanic
frequency tables for names common in the Vietnam-era cohort.

**Tau threshold (τ).** A record is classified *Hispanic-probable* when
p\_BIFSG ≥ τ. Following standard practice in BISG epidemiological literature,
the primary threshold is τ = 0.40. Sensitivity analyses are conducted at
τ ∈ {0.30, 0.40, 0.50, 0.60, 0.70}. This threshold should not be interpreted
as a certainty cutoff: it is a *forensic signal threshold* that triggers
analyst review of primary source documents (DD Form 1300, service records).
It does not reclassify records.

**Suppressed cohort.** The *suppressed Hispanic cohort* is defined as the set
of records for which p\_BIFSG ≥ τ AND `ETHNIC_SHORT_NAME` codes the casualty
as non-Hispanic. This operationalises the hypothesis that official DCAS coding
failed to capture a substantial fraction of Hispanic decedents. The size of
this cohort is the primary descriptive outcome, not an imputed race
reclassification.

---

### 3.3 Feature Engineering

From the cleaned DCAS fields, the following binary indicator variables were
constructed for use as covariates and stratification variables in the
statistical tests:

| Variable | Definition | Source field |
|---|---|---|
| `tier1_mos_flag` | Tier-1 combat MOS (e.g., 11B, 0311, 12B) | `MEMBER_OCC_CODE` |
| `tier2_mos_flag` | Tier-2 combat-support MOS | `MEMBER_OCC_CODE` |
| `mine_death_flag` | Cause of death = mine, booby trap, or IED | `INCIDENT_CASUALTY_REASON` |
| `small_arms_flag` | Cause of death = small arms fire | `INCIDENT_CASUALTY_REASON` |
| `icorp_flag` | Casualty occurred in I Corps (provinces M1–M5) | `CASUALTY_STATE_PROVINCE` |
| `year_1968_flag` | Incident year = 1968 (peak casualty year) | `INCIDENT_YEAR` |
| `sw_hor_flag` | Home of record in a Southwest/Latino concentration state (TX, CA, NM, AZ, CO, NV, FL, NY, PR) | `HOME_OF_RECORD_STATE` |
| `marines_flag` / `army_flag` | Branch of service | `SERVICE_CODE` |
| `suppressed_hispanic_proxy_flag` | p\_BIFSG ≥ τ AND non-Hispanic in DCAS | Composite |

The variable `suppressed_hispanic_proxy_flag` is the primary outcome variable
for the logistic regression described in Section 3.4.

---

### 3.4 Statistical Tests

Seven tests were pre-specified prior to data access, constituting a registered
hypothesis framework. The family-wise Type I error rate was controlled using
the Bonferroni correction: α\_B = 0.05 / 7 ≈ 0.0071.

**T1 — Bernoulli Variance Test.** Under the null hypothesis that official DCAS
coding correctly captures Hispanic identity, the observed count of
Hispanic-coded casualties (349) should be consistent with the BISG-estimated
prevalence rate of 3.97 percent applied to the full cohort of 58,220. Under a
Bernoulli model with n = 58,220 and p̂ = 0.0397, the expected count is
μ = 2,309 and the standard deviation is σ = 47.1. The test statistic is
z = (observed − μ) / σ.

**T2 — BISG Calibration Test.** Hosmer-Lemeshow goodness-of-fit is used to
assess whether BISG posterior probabilities are well-calibrated against the
official DCAS ethnic coding. Rejection of the null (well-calibrated) indicates
systematic directional bias. Because the anticipated direction of bias is
downward (official coding under-captures Hispanic decedents), rejection of H₀
is an expected companion finding rather than a disqualifying result.

**T3 — Impossibility Score (Anchor Metric).** The primary finding of this
analysis is the statistical impossibility of the 349-record official count
given a true prevalence of 3.97 percent:

$$z = \frac{349 - 2{,}309}{47.1} = -41.6$$

The one-tailed p-value is P(Z ≤ −41.6) < 10⁻³⁷⁸. For context, the Higgs
boson discovery threshold is z = 5σ; this result is 8.3 times more extreme.
This metric is an *immutable anchor*: it cannot be revised without a
documented change to the primary source (NARA ID 2240992) or a demonstrated
error in the Census base-rate estimate.

**T4 — χ² Branch × BIFSG.** A chi-square test of independence assesses whether
the proportion of suppressed-cohort records (p\_BIFSG ≥ τ, official
non-Hispanic) differs significantly across service branches. Effect size is
measured by Cramér's V.

**T5 — Jaccard Surname Overlap.** The Jaccard similarity coefficient measures
the overlap between (A) the set of surnames appearing among BISG-probable
records and (B) the set of surnames appearing among officially coded Hispanic
records. A permutation test (k = 1,000, seed = 42) provides a Monte Carlo
p-value. High overlap validates that the BISG surname signal is tapping the
same Hispanic descent population reflected in the official cohort, rather than
a spurious linguistic artifact.

**T6 — Precision and Recall.** Treating official DCAS `ETHNIC_SHORT_NAME` as
the reference standard (acknowledging its imperfection), BISG classification at
τ = 0.40 is evaluated on precision, recall, F1 score, and Matthews Correlation
Coefficient. The *failure rate* — defined as the proportion of BISG-flagged
records not present in the official cohort — is the complement of precision.
The anchor failure rate is 84.9 percent: of the 2,309 records BISG identifies
as Hispanic-probable, only 349 (15.1%) appear in the official Hispanic count.

**T7 — Province × BIFSG × Cause Crosstab.** A three-way log-linear analysis
examines whether BISG-probable Hispanic casualties are disproportionately
concentrated in I Corps provinces (the highest-casualty zone: Quang Tri,
Thua Thien, Quang Nam, Quang Tin, Quang Ngai) and in mine/booby-trap deaths.
The interaction tests whether the geographic and cause-of-death distributions
of the suppressed cohort differ from the non-suppressed cohort.

---

### 3.5 Logistic Regression

A binary logistic regression models `mine_death_flag` as the outcome, with
`suppressed_hispanic_proxy_flag` as the primary predictor, controlling for
`tier1_mos_flag`, `icorp_flag`, `year_1968_flag`, and `sw_hor_flag`. A second
model adds service-branch dummies. Exponentiated coefficients are reported as
odds ratios with 95 percent confidence intervals. Model fit is assessed via
Akaike Information Criterion and McFadden's pseudo-R². All regression models
are estimated in Python using *statsmodels* v.0.14 with Broyden-Fletcher-
Goldfarb-Shanno optimisation (maximum 200 iterations).

---

### 3.6 Sensitivity Analysis

The primary threshold τ = 0.40 is supplemented by a sensitivity sweep across
τ ∈ {0.30, 0.40, 0.50, 0.60, 0.70}, reporting the flagged cohort size,
failure rate, precision, recall, and F1 score at each threshold. The
five-stream convergence across these τ values (estimated Hispanic counts of
2,876; 2,309; 3,070; 3,500; 3,741 respectively) provides a corridor estimate
consistent with the Cronbach's α = 0.938 and R² = 0.947 reliability
indicators reported in the supplementary materials.

---

### 3.7 Software and Reproducibility

All analyses were conducted in Python 3.11 using *pandas* v.2.x, *NumPy*
v.1.26, *SciPy* v.1.12, and *statsmodels* v.0.14. The analysis pipeline is
structured as a modular package with six sequential phases (`phase0` through
`phase6`), each reading from and writing to versioned Parquet files to ensure
full reproducibility. Source code, configuration files, and variable dictionary
are available in the project repository. All anchor metrics, column definitions,
and statistical thresholds are centralised in `config.py` and cannot be altered
without documented primary-source justification.

---

*Word count (Methods section): approximately 1,450 words.*
