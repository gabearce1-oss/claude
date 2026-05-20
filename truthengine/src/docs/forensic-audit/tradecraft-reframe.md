# The 349 Rule as Institutional Tradecraft

**Document**: `docs/forensic-audit/tradecraft-reframe.md`  
**Series**: TruthEngine360 Forensic Research Baseline  
**Companion to**: `forensic-audit/form-102-pipeline.md` · *Seven Forensic Searches: Leads for the 349 Audit* · *Beyond the First Critique*  
**Date**: April 2026

---

## The Core Argument

The official DCAS count of 349 Hispanic Vietnam-era casualties is not merely an error. It is the downstream product of a classification **mechanism** embedded in DoD records management practice across four distinct administrative epochs.

The forensic argument is not that individual record-keepers acted with prejudice. It is that the *system architecture* — from induction forms to OMB SPD-15 retroactive coding — was structurally incapable of capturing Hispanic identity, and that this incapacity was known, institutionalized, and left uncorrected for decades.

This reframe transforms the evidentiary standard: instead of proving intentional suppression in individual cases, we demonstrate a **pattern of mechanism** that any independent auditor can verify against the primary record.

---

## The Four Epochs of the Mechanism

### Epoch 1 — Induction (1964–1973)

DoD induction forms used binary race schemes: White / Non-White, or White / Negro / Other. No Hispanic or Latino category existed. Mexican-American registrants were assigned to the White category by default — not because anyone decided they were White, but because the form offered no other option.

This is the origin of White Folding. It is a structural artifact, not a decision.

### Epoch 2 — Service and Casualty Recording (1964–1975)

DCAS (Defense Casualty Analysis System) inherited the race coding from induction records. Casualty records reproduced whatever race code appeared on the service record. A soldier inducted as White was casualty-recorded as White, regardless of his actual ethnicity.

No mechanism existed at this stage to correct the coding. The war was ongoing. Administrative capacity was consumed by the conflict itself. The error propagated forward.

### Epoch 3 — OMB Classification Reform (1977)

OMB Statistical Policy Directive 15 created the first federal Hispanic origin category in 1977 — four years after the last Vietnam-era draft cohort was processed, and two years after the fall of Saigon. The category was prospective. It was not retroactively applied to existing military records at this time.

The gap is structural: the counting system that would have been capable of identifying Hispanic casualties was created after the casualties were already recorded, using a system that could not record them.

### Epoch 4 — Retroactive Coding (1997)

NARA applied a retroactive algorithm to DCAS records to produce the 349 figure. The algorithm coded records as "Hispanic One Race" based on criteria applied to records that never contained a Hispanic identifier.

This is the methodological flaw. A retroactive algorithm applied to records that systematically excluded Hispanic identity during creation cannot recover that identity accurately. The 349 is a count of what the algorithm found — not a count of what the records originally contained.

The algorithm is circular: it assumes the presence of Hispanic identity in a record set where Hispanic identity was structurally excluded at the point of creation.

---

## The Seven Research Vectors as Evidence

Each research vector developed in this project maps onto a phase of the institutional mechanism. Together they constitute a chain of evidentiary inference that does not depend on any single methodology.

### Vector 1 — DCAS Anomaly Quantification

**Claim**: The 349 figure represents a 9–13× undercount relative to independent estimates.

**Mechanism map**: Epoch 4 (retroactive coding failure).

**Evidence**: RAND BISG applied to the DCAS surname field produces a modeled estimate of 2,300–3,800. The Guzmán (1970) hand-counted baseline of 3,070 predates DCAS publication and cannot be influenced by the official figure. Convergence of two independent methods on a range more than nine times the official count is the primary forensic indicator.

**Tradecraft reading**: A counting system that produces a result nine times below two independent baselines is not measuring the same population. The 349 is a count of a *coded* category, not of a *demographic* reality.

---

### Vector 2 — OMB Classification Timeline

**Claim**: The "Hispanic" category did not exist in DoD records during the Vietnam War draft period (1964–1973).

**Mechanism map**: Epochs 1–3 (structural absence, then reform gap).

**Evidence**:
- Pre-1977: Binary race schemes, no Hispanic box.
- 1977: OMB SPD-15 creates Hispanic category — four years post-draft.
- 1997: NARA retroactive algorithm produces 349.

**Tradecraft reading**: The 349 is not a count of soldiers who identified as Hispanic. It is a count of records that survived retroactive algorithmic coding under a category that did not exist when the records were created.

---

### Vector 3 — White Folding Documentation

**Claim**: Mexican-American and other Latino soldiers were administratively absorbed into the White category across all service branches during the Vietnam era.

**Mechanism map**: Epoch 1 (induction form structure).

**Evidence**: NARA OMPF records, A-File cross-references, and Selective Service Form 102 records show consistent "W" (White) race coding for subjects whose naturalization files, birth records, and next-of-kin documentation establish Mexican or Latin American origin. This is the White Folding pattern — a structural consequence of the absence of a Hispanic category combined with a default-to-White coding convention.

**Tradecraft reading**: White Folding is the mechanism. The 349 rule is its output. Proving White Folding in a statistically significant sample of A-Files and Form 102 records makes the 349 figure forensically untenable as a demographic count.

---

### Vector 4 — Selective Service Form 102 Pipeline

**Claim**: Selective Service Form 102 (Classification History) records held at NARA-St. Louis contain individual-level IV-C classification data that can be directly compared against surname-based demographic inference and A-File naturalization documentation.

**Mechanism map**: Epoch 1 (induction; the IV-C field is the system's own record of non-citizen status).

**Evidence**: See `forensic-audit/form-102-pipeline.md` for full operationalization. Form 102 is public information under SSS policy. A IV-C → I-A trajectory on Form 102 is documentary proof of a non-citizen inducted into U.S. military service — individual-level, primary-source, not inferential.

**Tradecraft reading**: The Form 102 pipeline bypasses the mechanism at the source. It does not depend on DCAS race coding. It reads the government's own non-citizen classification flag, which was not subject to the same White Folding pressure as race coding.

---

### Vector 5 — BISG Surname Validation

**Claim**: The RAND BISG methodology, applied to the full DCAS surname field, produces a Hispanic estimate of 2,300–3,800 — consistent with the Guzmán baseline and inconsistent with the 349 official count.

**Mechanism map**: Epoch 4 validation (independent check against retroactive coding).

**Evidence**: BISG is a peer-reviewed, court-accepted methodology used in Fair Housing Act enforcement and Voting Rights Act litigation. Its application to DCAS is standard demographic inference applied to a known dataset. The result is reproducible by any independent researcher with access to the DCAS public extract.

**Tradecraft reading**: BISG and Guzmán converge on a range. The 349 diverges from both. The three-point structure — BISG, Guzmán, 349 — is the core forensic triangle. No single method is individually conclusive; the convergence is.

---

### Vector 6 — Conditional Citizenship as Signature Pattern

**Claim**: The deportation of non-citizen veterans who served during the Vietnam era represents a second institutional mechanism operating on the same population: the state extracted military service from non-citizens during a national security emergency, then retroactively denied the citizenship that service was understood to earn.

**Mechanism map**: Epoch 4 analog in the immigration system (retroactive legal reclassification under IIRIRA 1996).

**Evidence**:
- INA § 329 created a wartime naturalization pathway for non-citizen servicemembers. Its purpose was to incentivize military service by promising citizenship.
- IIRIRA (1996) retroactively reclassified certain offenses as deportable grounds, without grandfather provisions for veterans who served before the law's enactment.
- The result: veterans who fulfilled the service condition of the citizenship promise were denied the benefit by a law enacted decades after their service.

**Tradecraft reading**: Conditional Citizenship is the sixth vector and the strongest *narrative* vector. It reframes the deportation question from immigration enforcement to contract breach: the state made an offer (serve and become a citizen), the veteran accepted (served), and the state withdrew the consideration (deported). This framing is legally precise and accessible to a non-specialist Congressional audience.

This is a distinctive contribution of the AUMER Foundation's research program. No other advocacy or research organization has formalized this as a named research vector.

---

### Vector 7 — Institutional Erasure Scoring (NERO Framework)

**Claim**: The systematic failure of DoD, NARA, DHS, VA, and EOIR to maintain accurate records of non-citizen veteran status is quantifiable and comparable across institutions.

**Mechanism map**: All four epochs (aggregate institutional failure measure).

**Evidence**: The NERO (National Erasure of Record Operations) scoring framework assigns each institution a score based on record completeness, cross-agency data sharing, proactive disclosure, and correction of known errors.

**Tradecraft reading**: NERO scores transform a political argument into an auditable institutional assessment. Each score is defensible against primary sources and can be updated as new FOIA responses arrive.

---

## The Evidentiary Chain

The seven vectors form a logical chain. Each link is independently verifiable. The chain does not depend on any single data source or methodology.

```
DCAS 349 (output)
    ↑
Retroactive OMB coding algorithm (Epoch 4 mechanism)
    ↑
Absence of Hispanic category 1964–1973 (Epochs 1–3 structural cause)
    ↑
White Folding in induction and service records (Epoch 1 source pattern)
    ↑
Selective Service Form 102 IV-C records (Epoch 1 bypass verification)
    ↑
BISG + Guzmán convergence (independent quantification — Epoch 4 validation)
    ↑
Conditional Citizenship + IIRIRA retroactivity (policy consequence — immigration system analog)
    ↑
NERO Institutional Erasure Scores (aggregate accountability measure)
```

This is the forensic standard for a Congressional-grade evidentiary record: a chain where each link can be independently verified, and where the chain's conclusion — that the 349 figure is a mechanism artifact, not a demographic count — follows from the structure rather than from any single inference.

---

## Why "Tradecraft"

The term is chosen deliberately. Tradecraft refers to the techniques and procedures of an intelligence practice — the systematic, reproducible methods by which an operation achieves its effect.

The institutional mechanism that produced the 349 has the properties of tradecraft:
- It is **reproducible**: any record processed through the same four-epoch system produces the same output.
- It is **deniable**: no individual actor made a decision to undercount Hispanic casualties; the system did.
- It is **legible in retrospect**: the mechanism is visible in the archival record for anyone who knows to look for it.
- It has **downstream effects**: the 349 figure was cited in Congressional testimony, academic literature, and policy documents as the authoritative count for decades.

The argument is not that this was an intelligence operation. It is that the mechanism has the structural properties of one — and that understanding it as a mechanism, rather than as an error, changes both the research strategy and the advocacy strategy.

---

## Immediate Research Actions

| Action | Owner | Timeline | Output |
|--------|-------|----------|--------|
| Mail test Form 102 request — Sgt. Alfredo Gonzalez (Edinburg TX, b. 05/23/1946) | FOIA team | Week 1 | Template validation |
| Apply BISG to full DCAS surname extract | Data team | Weeks 1–2 | BISG estimate with confidence interval |
| Cross-reference 5 ACLU 59 cases against White Folding pattern | Analyst | Weeks 2–3 | Case-level White Folding evidence |
| Draft Conditional Citizenship policy memo for CHC | Legal team | Week 2 | CHC submission-ready document |
| Compute NERO scores for DoD, NARA, DHS, VA, EOIR | Research team | Weeks 3–4 | NERO scorecard v1.0 |
| Submit Form 102 batch Q1 (25–50 requests) | FOIA team | Weeks 2–4 | Batch in transit |

---

## Sources

- RAND Corporation BISG Methodology (Fiscella & Fremont 2006; Adjaye-Gbewonyo et al. 2023)
- Guzmán, R. (1970). *The Mexican American People*. Free Press.
- OMB Statistical Policy Directive 15 (1977); Revised 1997
- INA § 329, 8 U.S.C. § 1440
- IIRIRA § 321, § 237
- NARA DCAS Public Extract (58,220 records)
- ACLU National — Deported Veterans case registry (59 cases)
- Selective Service System — Classification Records access policy: https://www.sss.gov/records/
- EBSCO Research Starters — Military History and Science: https://www.ebsco.com/research-starters/military-history-and-science
- EBSCO Research Starters — Law: https://www.ebsco.com/research-starters/law

---

*This document is part of the TruthEngine360 forensic research baseline. Companion to `forensic-audit/form-102-pipeline.md` and `docs/truth-engine-platform-research-report.md`.*