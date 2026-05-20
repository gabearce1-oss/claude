# Form 102 Pipeline — Selective Service Classification Records as Primary-Source Intake

**Document**: `docs/forensic-audit/form-102-pipeline.md`  
**Series**: TruthEngine360 Forensic Research Baseline  
**Companion to**: `forensic-audit/tradecraft-reframe.md` · *Seven Forensic Searches: Leads for the 349 Audit* · *Beyond the First Critique*  
**Date**: April 2026

---

## Why This Is the Highest-Yield Primary-Source Intake the Audit Can Build

Selective Service System Form 102 — the Classification History record — is the only documentary source that captures the individual-level draft-classification trajectory of every Vietnam-era American draftee, citizen and non-citizen alike. It records the registrant's name, local board number, every classification he received, and the date of each classification. Crucially, it captures the classification **IV-C ("Alien")**, which is the field that flagged non-citizen registrants — the population the audit needs to identify by name.

A Form 102 showing a classification trajectory that includes IV-C, particularly an **IV-C → I-A transition** (alien reclassified as available for service), is documentary, individual-level evidence of a non-citizen who was inducted into U.S. military service. This is the closest thing to a smoking gun the audit will find on the U.S. side. BISG cannot produce this. Surname analysis cannot produce this. Only Form 102 can.

The audit's prior memos circled this without naming it. This document operationalizes the pipeline.

---

## The Architecturally Decisive Fact: Form 102 Is Public Information

Per the Selective Service System's own published statement:

> *"The classification record is public information and is available to anyone who asks for it. Requesters must provide the registrant's full name, date of birth, and address at the time of registration (usually when the registrant was 18 years old)."*

This is more permissive than most researchers expect, and it is what makes the pipeline tractable. There is no Privacy Act bar. There is no next-of-kin requirement. There is no proof-of-death requirement. Any researcher can request any registrant's Form 102 with three pieces of information: full name, date of birth, and address at the time of registration.

The Privacy Act of 1974 does not apply to archival records held by NARA, and the SSS doctrine treats classification records as public regardless of archival status. The personal-privacy exemption under FOIA (5 U.S.C. § 552(b)(6)) could in principle still be invoked, but in practice NARA-St. Louis fulfills these requests as a matter of standard archival reference.

**The bottleneck is therefore not legal access. It is name discovery.** The pipeline must produce candidate names with sufficient biographical specificity to support retrieval, then route those names through the request infrastructure.

---

## Where the Records Are Held

**National Archives & Records Administration**  
National Archives — St. Louis  
ATTN: RRPOR  
P.O. Box 38757  
St. Louis, MO 63138-0757  
Phone: (314) 801-0800 (peak hours weekdays 10:00 a.m. – 3:00 p.m. CT)

Records cover men born **April 28, 1877 through March 28, 1957**. The Vietnam-eligible cohort (men born roughly 1944–1953) sits squarely inside this window. Records for men born on or after January 1, 1960 are held by the modern Selective Service System, not NARA, and are not relevant to this audit.

What survives in custody for this era:
- **SSS Form 1** — Draft Registration Card
- **SSS Form 102** — Classification History

> **Note on the 1973 NPRC fire**: The fire destroyed Army and Air Force Official Military Personnel Files (OMPF) but did **not** destroy SSS records. SSS records were stored separately. This is a critical distinction — the fire that impairs military-service verification does not impair the classification history pipeline.

---

## What to Request and How

The request requires three biographical anchors:

| Anchor | Notes |
|--------|-------|
| Full name as used at registration | Must match the registration-era name exactly |
| Date of birth | MM/DD/YYYY |
| Address at time of registration | The address from which the registrant was processed by his local draft board — usually the family home at age 18 |

With these three, NARA-St. Louis can locate the file.

**Do not use SF-180.** SF-180 (Request Pertaining to Military Records) routes requests to Official Military Personnel Files (OMPF) — a different record series entirely. Using SF-180 for SSS records will either delay or misdirect the request. Send a plain written letter addressed to RRPOR.

**Fees**: NARA invoices after the search. Standard archival reference fees run roughly **$20–50 per file**. Fees are waived or reduced for documented academic research in some cases; include institutional affiliation in the request letter.

**Processing time**: NARA-St. Louis backlogs run **three months to one year** for non-emergency requests. The pipeline must be designed for parallel batch submission and asynchronous response handling — not sequential one-at-a-time retrieval.

---

## Request Template — Letter Form

```text
[Your Letterhead or Return Address]
[Date]

National Archives & Records Administration
National Archives — St. Louis
ATTN: RRPOR
P.O. Box 38757
St. Louis, MO 63138-0757

Re: Selective Service Records Request

Dear NARA Reference Staff:

I am requesting copies of the Selective Service System records
(SSS Form 1 — Draft Registration Card, and SSS Form 102 —
Classification History) for the following registrant:

  Full name as used at registration:  [REGISTRANT FULL NAME]
  Date of birth:                      [REGISTRANT DOB, MM/DD/YYYY]
  Address at time of registration:    [STREET, CITY, STATE, ZIP]
                                      (registrant was approximately 18
                                       years old at registration)
  Local draft board (if known):       [BOARD NUMBER OR CITY]

This request is made for documented academic research on Vietnam-era
Selective Service classification history and its intersection with
U.S. military casualty data. The classification record is treated as
public information by the Selective Service System; this request is
consistent with that policy.

Please bill any applicable fees to the address above. If the fee is
expected to exceed $75, please provide an estimate before processing.

Please mail responsive records to:

  [Your name]
  [Your mailing address]

Thank you for your assistance.

Sincerely,

[Your name]
[Your institutional affiliation, if any]
[Phone]
[Email]
```

**One template, one registrant per letter.** Do not batch multiple registrants in a single letter — NARA processes each registrant as a separate archival search.

---

## Candidate Name Sources

The bottleneck is name discovery. Five intake channels produce high-quality candidates:

| Source | Yield | Key Metadata Available |
|--------|-------|----------------------|
| **Vietnam Veterans Memorial — Wall of Faces** | Spanish-surname extraction, hometown metadata, border-corridor prioritization | Name, hometown, KIA date, service branch |
| **Guzmán 1969–70 and El Grito-era surname compilations** | Explicit Spanish-surname casualty lists from peer-reviewed source | Name, some unit data |
| **Oral history corpora** (Voces, Soldados, Voces Veteranos) | Named individuals with biographical detail | Name, DOB in many cases, hometown |
| **NGO and civil-society registries** (deported veteran orgs, cross-border veteran organizations) | Living veterans with confirmed non-citizen status | Name, DOB, pre-induction address in some cases |
| **Exile Patriot intake** (family submissions) | Must capture full name, DOB, pre-induction U.S. address at intake | Potentially highest biographical quality |

Combined yield from these sources: on the order of **low thousands of high-quality candidate names**, within operational capacity if run in batches of 50–100 requests per quarter.

---

## Tracking Ledger Schema

A pipeline running at scale requires a lifecycle tracking ledger. This maps directly to the `USCISGenealogyRequest` entity pattern in the TruthEngine360 platform and can be extended or mirrored in a dedicated entity.

| Field | Type | Description |
|-------|------|-------------|
| `request_id` | string | Internal sequence number |
| `registrant_name` | string | Full name as submitted |
| `registrant_dob` | date | Date of birth |
| `registrant_address` | string | Address at registration |
| `candidate_source` | enum | Wall of Faces / Guzmán / Oral History / NGO / Exile Patriot / Other |
| `mailed_date` | date | Date request sent |
| `acknowledged_date` | date | Date NARA acknowledged receipt |
| `invoice_received_date` | date | Date NARA invoiced |
| `invoice_amount` | number | Fee charged |
| `invoice_paid_date` | date | Date payment sent |
| `records_received_date` | date | Date records returned |
| `outcome` | enum | Located / Not Located / Damaged / Multiple Records / Other |
| `iv_c_present` | boolean | Whether Form 102 shows IV-C classification |
| `classification_trajectory` | string | Full sequence (e.g., `IV-C → I-A → inducted 04/1968`) |
| `linked_dcas_record` | string | Cross-reference to DCAS casualty record |
| `linked_ice_removal` | string | Cross-reference to ICE/DHS deportation record |
| `evidence_graph_node_id` | string | Node ID in TruthEngine evidence graph |
| `notes` | string | Anomalies, multiple records, damaged records, etc. |

This ledger can sit in Postgres (preferred for TruthEngine360 integration), Notion, or Airtable. The key requirement is **lifecycle traceability from mailed request to evidentiary outcome**.

---

## What to Do With the Data

### Step 1 — Digitize and Extract
Scan returned records, OCR classification history, structure the classification trajectory sequence into the ledger.

### Step 2 — Cross-Link in Evidence Graph
Connect to:
- Candidate source (Wall of Faces entry, oral history transcript, family submission)
- Hometown and local board number (geographic clustering)
- DCAS casualty record (if KIA)
- ICE/DHS removal record (if deported)
- A-File (if USCIS Genealogy Phase II request was submitted in parallel)

### Step 3 — Tag for Downstream Use
Classify admissibility for: journalism (on-record attribution), scholarship (citation-grade), Congressional briefings (CHC submission), civil-claim support (chain-of-custody controlled).

### Aggregate Outputs

Form 102 data, processed at scale, supports defensible lower bounds for:

- **Confirmed Mexican-national draftees** (IV-C → I-A trajectory + Spanish surname + Mexico-origin biographical detail)
- **Confirmed Mexican-national draftees who became casualties** (above + DCAS match)
- **Confirmed Mexican-national draftees who entered deportation pathways post-service** (above + ICE/DHS removal record)

These are not estimates. They are confirmed, document-grounded individual-level counts. This is the distinction from BISG.

---

## Cost and Timeline Model

### Year One

| Quarter | Action | Expected Return |
|---------|--------|----------------|
| Q1 | Submit first batch of 25–50 requests; validate template, billing, return format | Template refinement; first test-case result (Gonzalez, see below) |
| Q2–Q3 | Submit second and third batches (50–100 each); process first responses | First IV-C evidence; evidence graph population begins |
| Q4 | Publish first defensible aggregate findings | Lower-bound counts for confirmed non-citizen draftees |

### Cost Model

At $25–50 per record:
- **200 requests**: ~$5,000–10,000 in NARA fees
- Plus postage, tracking, scanning, and administrative overhead

**Backlog model**: Q1 requests may not return until Q3–Q4. The pipeline must run in parallel with all other audit work; it cannot be treated as a sequential prerequisite.

---

## Scaling: When the Pipeline Outgrows Letter-by-Letter

At approximately 500 requests, two scaling paths become practical:

1. **NARA Research Room operations** in St. Louis — direct archival pull and copy workflows; requires a researcher on-site or an approved representative.
2. **Bulk research-access negotiation** — structured large-scale access through institutional channels (USC Price School, AUMER Foundation, or similar institutional sponsor).

**Recommended posture**: run letter-by-letter in Year 1 to build process discipline; add research-room workflows in Year 2; pursue bulk-access negotiation in parallel starting Q3/Q4 of Year 1.

---

## What to Do This Week

Start with **one mailed test request** to validate the template, routing, invoicing, and return format before committing to batch volume.

**Suggested test case from existing corpus:**

> **Sgt. Alfredo Gonzalez**  
> Edinburg, TX | Born: May 23, 1946  
> KIA: Hue, February 4, 1968  
> Posthumous Medal of Honor  
> DCAS record: present  

Gonzalez is an ideal test case: he is in the DCAS record, he is a confirmed KIA, his hometown (Edinburg, TX — Hidalgo County) places him in the highest-density Mexican-American draft cohort in the country, his biographical data is publicly documented at multiple sources, and his Medal of Honor status means his pre-induction address is likely recoverable from public records.

**One request. One week. Then scale.**

---

## Platform Integration Points

| Pipeline Stage | TruthEngine360 Entity | Action |
|---------------|----------------------|--------|
| Candidate identified | `CaseFile` | Create or link case file |
| Request mailed | `USCISGenealogyRequest` (extend for SSS) | Log request with mailed_date |
| Form 102 received — IV-C present | `EvidenceLink` | source_a_type: "NARA", link_type: "Service Corroboration" |
| Form 102 cross-linked to DCAS | `EvidenceLink` | link_type: "Identity Match", review_state: "Confirmed" |
| Form 102 cross-linked to ICE removal | `EvidenceLink` | link_type: "Deportation Confirmation" |
| Aggregate count published | `ResearchDoc` | cluster_tags: "Form102,IV-C,NARA,confirmed-noncitizen" |

---

## Sources

- Selective Service System — Classification Records public-access policy: https://www.sss.gov/records/
- NARA-St. Louis — National Personnel Records Center: https://www.archives.gov/st-louis
- Military Selective Service Act, 50 U.S.C. App. § 456 (alien classification and deferment)
- INA § 329, 8 U.S.C. § 1440 (naturalization through active-duty service)
- Privacy Act of 1974, 5 U.S.C. § 552a (inapplicable to archival NARA holdings)
- FOIA, 5 U.S.C. § 552(b)(6) (personal privacy exemption — not invoked in practice for SSS classification records)
- NARA Record Group 147 (Records of the Selective Service System)
- EBSCO Research Starters — Military History and Science: https://www.ebsco.com/research-starters/military-history-and-science

---

*Companion to `forensic-audit/tradecraft-reframe.md`, `docs/truth-engine-platform-research-report.md`, and the TruthEngine360 post-cluster methodology architecture. This document operationalizes the highest-yield primary-source intake identified in the prior methodology critique.*