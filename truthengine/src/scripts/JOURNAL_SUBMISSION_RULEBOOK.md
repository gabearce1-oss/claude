# Journal Submission Rulebook
## TruthEngine360 / AUMER Foundation / USC Sol Price School
## Target Venue: Journal of Veterans Studies (JVS) — University of Calgary Press

---

## Part I — File Integrity and Format

### 1.1 Accepted Formats
- **Manuscripts**: `.docx` (Word) — one file for entire manuscript including tables
- **Figures**: `.tif` or `.pdf` ONLY — never `.png`, `.docx`, `.pptx`, `.eps`
- **Supplementary**: `.docx`, `.xlsx`, or `.pdf`

### 1.2 One File Per Figure
- Name sequentially: `Figure 1.tif`, `Figure 2.tif`, `Figure 3.pdf`, `Figure 4.tif`
- Never embed figures inside the manuscript Word file for final submission
- Maximum 50 MB per figure file

### 1.3 No Prohibited Elements
- No layers in raster files — flatten all layers before export
- No transparent objects
- No excess white space (crop tightly to image bounds)
- No screen captures / screenshots
- No embedded ICC profiles that conflict with RGB

---

## Part II — Resolution (DPI) Requirements

| Figure Type | Minimum DPI |
|---|---|
| Color photograph | 300 dpi |
| Grayscale photograph | 600 dpi |
| Line art / monochrome / flowchart | 1200 dpi |
| Combination (photo + text/line) | 600 dpi |
| Forest plot / bar chart (vector saved as raster) | 600 dpi minimum; use PDF vector where possible |

**Rule**: When in doubt, export at 600 dpi. Use PDF (vector) for any figure that contains only lines and text (flowcharts, forest plots, bar charts).

---

## Part III — Typography Inside Figures

### 3.1 Font
- **Allowed**: Arial or Helvetica ONLY
- **Prohibited**: Times New Roman, Calibri, Cambria, decorative fonts, serif fonts for axis labels
- **Exception**: equation labels may use serif math fonts if embedded via LaTeX/MathJax

### 3.2 Size
- All text inside figure borders: **8 pt minimum, 14 pt maximum**
- Axis labels, tick labels, panel labels, legend text: **8–12 pt**
- Titles inside figures (if used): **12–14 pt**
- Maintain consistent size across ALL panels and ALL figures in the manuscript

### 3.3 Style
- No bold, shadow, or outline effects on axis labels or data labels
- Bold is permitted ONLY for panel letters (A, B, C) and figure-level labels
- Italics permitted for p-values and statistical notation inside figures

---

## Part IV — APA 7th Edition Figure Structure

### 4.1 Number Line
- Bold `Figure N` — flush left, above the figure image
- Use Arabic numerals: Figure 1, Figure 2, Figure 3, Figure 4
- No period after the figure number

### 4.2 Title Line
- One double-spaced line below the number line
- Italic, Title Case
- One concise descriptive phrase — not a full sentence ending in a period
- Example: *Proportion of Hispanic-Probable Casualties by Year, 1956–1975*

### 4.3 Legend
- Placed **inside figure borders** — not in the caption below
- Colorblind-safe symbols or patterns if figure is grayscale-compatible

### 4.4 Note Line
- Flush left, below figure image
- Format: `Note.` (italic, flush left) followed by non-italic explanatory text
- **Define every abbreviation** that appears in the figure
- Cite data source in the Note if not in the title
- Example: `Note. BIFSG = Bayesian Improved Surname Geocoding with First-Name Extension. τ = 0.40. Data: NARA ID 2240992.`

---

## Part V — Multi-Panel Figures

### 5.1 Panel Labels
- Bold capital letters: **A**, **B**, **C**, **D** in upper-left corner of each panel
- NO box, circle, period, or parentheses around panel letters
- Sub-panels use: Ai, Aii, Bi, Bii (NOT Aa, Ab, A1, A2)

### 5.2 Consistency Across Panels
- Same font family and size in every panel
- Same color palette in every panel
- Same line weight (minimum 0.3 pt) in every panel
- Equal whitespace/spacing between panels

### 5.3 Axis Alignment
- Align x-axes across panels in the same column
- Align y-axes across panels in the same row

---

## Part VI — Color

### 6.1 Color Mode
- Submit in **RGB** (not CMYK) for online-first journals
- Journal will convert to CMYK for print — do not pre-convert

### 6.2 Colorblind Safety (Required)
- Use palette from ColorBrewer (colorbrewer2.org), Viridis, or Cividis
- Test with Coblis or Viz Palette before submission
- Approved TruthEngine360 colors that are colorblind-safe:
  - Navy `#002147` (safe)
  - Gold `#B8860B` (safe with white text)
  - Teal `#008080` (safe)
  - Use red `#C0392B` sparingly — avoid pairing with green

### 6.3 Background
- White (`#FFFFFF`) background only — no gray plot backgrounds inside figure

---

## Part VII — Recommended Software and Export Settings

| Purpose | Tool | Export Command |
|---|---|---|
| Statistical line/bar charts | Python + Matplotlib | `plt.savefig("Figure N.tif", dpi=600, bbox_inches="tight", format="tiff")` |
| Forest plots | R + ggplot2 + ggforestplot | `ggsave("Figure N.tif", dpi=600, units="in", width=7)` |
| Time-series | R + ggplot2 | `ggsave("Figure N.tif", dpi=600, units="in")` |
| Flowchart / DAG | Inkscape or Adobe Illustrator | Export → PDF (vector); or Export PNG at 1200 dpi then save as TIFF |
| Multi-panel assembly | Inkscape | File → Export PNG at 600+ dpi; or Save as PDF |
| Tables | Word | Embedded in manuscript .docx; NOT as image files |

---

## Part VIII — Figure Assignments for "Counting the Uncounted"

| Figure | Content | Format | Tool | DPI |
|---|---|---|---|---|
| Figure 1 | BISG/BIFSG methodological flowchart | PDF (vector) | Inkscape or PowerPoint→PDF | vector |
| Figure 2 | Forest plot — logistic regression odds ratios (mine_death_flag, covariates) | TIFF or PDF | R + ggplot2 + ggforestplot | 600 |
| Figure 3 | Time-series — Hispanic KIA proportion by year 1956–1975 | TIFF or PDF | Python + Matplotlib or R + ggplot2 | 600 |
| Figure 4 | Six-stream convergence bar chart — estimated Hispanic count by method/τ | TIFF or PDF | Python + Matplotlib or R + ggplot2 | 600 |

---

## Part IX — Manuscript Structure (APA 7 / JVS)

### 9.1 Document Order
1. Cover letter (separate file, NOT part of manuscript)
2. Title page
3. Abstract + Keywords
4. Body text (Introduction through Conclusion)
5. References
6. Tables (embedded in Word document, after References)
7. Figure captions page
8. Figures (separate files)

### 9.2 Title Page
- Centered, bold manuscript title
- Italic subtitle (if applicable)
- Author name(s)
- Institutional affiliation
- Author Note (includes ORCID, conflicts of interest, funding acknowledgment, correspondence email)

### 9.3 Abstract
- Centered heading: `Abstract` (not bold, not italic)
- Single paragraph, no indentation
- 200–250 words
- No citations
- No abbreviations unless defined

### 9.4 Keywords
- Flush left, below abstract
- Format: `Keywords:` (italic) followed by 8–10 comma-separated terms in sentence case
- Example: `Keywords: Hispanic veterans, Vietnam War, casualty records, BISG, ethnic misclassification`

### 9.5 Heading Levels (APA 7)
| Level | Format | Example |
|---|---|---|
| 1 | Centered, Bold, Title Case | **Introduction** |
| 2 | Flush Left, Bold, Title Case | **Data and Sources** |
| 3 | Flush Left, Bold Italic, Title Case | ***BISG/BIFSG Surname Scoring*** |
| 4 | Indented, Bold, Title Case, period. | &nbsp;&nbsp;&nbsp;&nbsp;**Tau Threshold Selection.** |
| 5 | Indented, Bold Italic, Title Case, period. | &nbsp;&nbsp;&nbsp;&nbsp;***Primary Threshold.*** |

### 9.6 Body Section Order (this manuscript)
1. Introduction
2. Historical Background
   - Suppression of Hispanic Identity in Military Records
3. Data and Sources
4. Method
   - Overview
   - BISG/BIFSG Surname and First-Name Scoring
   - The Impossibility Score (Anchor Metric)
   - MOS Risk Tier Classification
   - Province Risk Stratification
   - Pre-Specified Seven-Test Battery
5. Results
   - Descriptive Statistics
   - Seven-Test Battery Results
   - Logistic Regression
   - Six-Stream Convergence
6. Discussion
7. Limitations
8. Conclusion
9. References
10. Tables
11. Figure Captions
12. Appendices (if applicable)

---

## Part X — Statistical Reporting (APA 7)

### 10.1 Chi-Square
```
χ²(df) = X.XX, p = .XXX
χ²(1) = 47.23, p < .001
```
- Use Greek letter χ² (not "chi-square" in parenthetical reports)
- Always report degrees of freedom
- Use `< .001` not `= .000` when p is below .001

### 10.2 Odds Ratios (Logistic Regression)
```
OR = X.XX, 95% CI [X.XX, X.XX], p = .XXX
OR = 1.43, 95% CI [1.21, 1.69], p < .001
```
- Always report 95% CI in square brackets
- Report McFadden's pseudo-R² = .XXX for model fit

### 10.3 Z-Scores and Impossibility Metric
```
z = −41.6, p < 10⁻³⁷⁸
```
- Use minus sign (−) not hyphen (-) for negative z
- Report p using scientific notation when below 10⁻¹⁰

### 10.4 Proportions and Percentages
- Report percentages with one decimal place: 84.9%, not 85%
- Report proportions with three decimal places: 0.397
- In text: "approximately 3.97 percent" (spell out "percent" in body text)
- In tables/parenthetical: "3.97%"

### 10.5 p-values General Rules
- Drop leading zero: `.05`, not `0.05`
- Use `< .001` for anything below .001
- Report exact p to three decimal places when above .001: `p = .023`
- Always use italic *p*

### 10.6 Confidence Intervals
- Always in square brackets: [1.21, 1.69]
- Separate values with comma + space
- Consistent decimal places (2 or 3) within a table

### 10.7 Sensitivity Analysis Reporting
```
τ ∈ {0.30, 0.40, 0.50, 0.60, 0.70} with estimated cohort sizes of
2,876; 2,309; 3,070; 3,500; and 3,741, respectively (Cronbach's α = .938,
R² = .947 across estimation streams).
```

---

## Part XI — Table Structure (APA 7)

### 11.1 Table Components
- `Table N` — bold, flush left, above table
- Italic title in Title Case, flush left, one line below number
- Column spanners (merged headers) separated by horizontal rules
- Body rows — no vertical lines
- `Note.` (italic) flush left below table — define all abbreviations

### 11.2 Horizontal Rules
- Above column headers
- Below column headers
- Below last data row (above Note)
- No other horizontal rules in the body

### 11.3 No Vertical Lines
- Never use vertical lines in APA 7 tables

### 11.4 Table Placement
- Tables embedded in manuscript Word file, after the References section
- Do NOT submit tables as image files

---

## Part XII — References (APA 7)

### 12.1 Hanging Indent Format
```
Author, A. A., & Author, B. B. (Year). Title of article. Journal Name, Volume(Issue), pages–pages. https://doi.org/XXXXX
```

### 12.2 Government / Archive Sources
```
National Archives and Records Administration. (2024). Defense Casualty Analysis System Vietnam Conflict Extract File [Data set]. NARA Accession No. 2240992. https://...
```

### 12.3 DOI Format
- Always format as: `https://doi.org/XXXXXXX`
- Never use `doi:` prefix or bare numbers

### 12.4 Key References for This Study
- Elliott, M. N., et al. (2008) — BISG original
- Elliott, M. N., et al. (2009) — BISG extension
- Fiscella, K., & Fremont, A. M. (2006) — Use of geocoding and surname analysis
- Voicu, I. (2018) — BIFSG first-name extension
- U.S. Census Bureau (2012) — Names_2010Census.csv

---

## Part XIII — Cover Letter (Separate File)

### Required Elements
1. Date (ISO format: Month DD, YYYY)
2. Editor's name and journal name
3. Manuscript title
4. One-paragraph description of contribution and significance
5. Word count (excluding abstract, references, tables, figure captions)
6. Statement: no portion under review elsewhere, no duplicate publication
7. Conflict of interest disclosure (or "The authors declare no conflicts of interest")
8. Suggested reviewers (3–5 names with institutional affiliations and email)
9. Author correspondence: name, institution, email, ORCID

---

## Part XIV — Anchor Metrics (IMMUTABLE — Must Never Be Changed)

These values are fixed. Any template or script using these values must use them exactly as listed. Changes require documented primary-source justification with NARA ID 2240992 as the controlling source.

| Metric | Value |
|---|---|
| Total DCAS records | 58,220 |
| Official Hispanic (ETHNIC_SHORT_NAME) | 349 |
| Official Hispanic rate | 0.60% |
| BISG estimated prevalence (1970 base rate) | 3.97% |
| BISG estimated count | 2,309 |
| Failure rate (84.9%) | 1,960 suppressed / 2,309 estimated |
| Impossibility z-score | −41.6 |
| Impossibility p-value | < 10⁻³⁷⁸ |
| Cronbach's α (six-stream convergence) | 0.938 |
| R² (six-stream convergence) | 0.947 |
| TAU_PRIMARY | 0.40 |
| TAU_SENSITIVITY | {0.30, 0.40, 0.50, 0.60, 0.70} |
| Estimated counts at τ | 2,876; 2,309; 3,070; 3,500; 3,741 |
| Bonferroni-corrected α | 0.05 / 7 ≈ 0.0071 |

**CRITICAL**: `classification_anomaly_flag = True` is a FORENSIC SIGNAL, not contamination. BISG ≥ τ AND DCAS coded non-Hispanic → fast-track to analyst review of DD Form 1300 and service records. It does NOT reclassify any record.

---

## Part XV — Pre-Submission Checklist

### Manuscript
- [ ] Word count verified (target: 8,000–10,000 words for JVS)
- [ ] Abstract: single paragraph, 200–250 words, no citations
- [ ] Keywords: 8–10 terms, italicized "Keywords:" label
- [ ] All headings follow APA 7 level hierarchy
- [ ] All p-values use italic *p*, drop leading zero, `< .001` where appropriate
- [ ] All statistical reports include df, test statistic, exact p-value
- [ ] All abbreviations defined at first use in body text
- [ ] Author Note includes ORCID, funding, conflicts of interest
- [ ] Running head removed (APA 7 no longer requires it for manuscripts)

### Figures
- [ ] Figure 1: BIFSG flowchart → PDF vector
- [ ] Figure 2: Forest plot → TIFF 600 dpi or PDF
- [ ] Figure 3: Time-series → TIFF 600 dpi
- [ ] Figure 4: Six-stream convergence → TIFF 600 dpi or PDF
- [ ] All figures: Arial/Helvetica font, 8–14 pt, consistent size
- [ ] All figures: white background, no excess whitespace
- [ ] All figures: colorblind-safe palette verified
- [ ] All figures: panel labels bold A, B, C (no box/parentheses)
- [ ] All figure files named: `Figure 1.tif`, `Figure 2.tif`, etc.
- [ ] Figure captions page: APA 7 format with Note. defining abbreviations

### Tables
- [ ] Tables embedded in manuscript Word file, after References
- [ ] Each table: bold `Table N`, italic title, horizontal rules only, no vertical lines
- [ ] Each table `Note.` defines all abbreviations
- [ ] No table submitted as image file

### References
- [ ] All DOIs formatted as `https://doi.org/...`
- [ ] Hanging indent applied
- [ ] All in-text citations have corresponding reference entries
- [ ] NARA source cited with accession number

### Anchor Metrics
- [ ] Total records: 58,220
- [ ] Official Hispanic: 349 (0.60%)
- [ ] BISG estimate: 2,309 (3.97%)
- [ ] Failure rate: 84.9%
- [ ] Impossibility σ: −41.6
- [ ] classification_anomaly_flag = forensic signal only (not reclassification)
