# FOIA Requests & n8n Crawler Configurations
## AUMER Foundation · TruthEngine360 · Exile Patriot Project

**Source:** *TE360_FOIA_Crawlers_Package* (April 8 2026).
Prepared for the Congressional Hispanic Caucus Briefing, May 18 2026.
AUMER Foundation 501(c)(3), EIN 99-0495658.
Contact: Gabriel T. Arce Jr. · gtarce@usc.edu · (760) 453-8421.

**Scope:** this package belongs to the **Exile Patriot Project** layer (deported U.S.-military veterans). It overlaps TE360 infrastructure (the n8n crawler runtime, the Plataforma Nacional de Transparencia channel, the INAI legal-basis pattern) but the case-evidence here is a different domain from the Terminel-Sagasta historical investigation. Keep the corpora separate; share the crawler patterns.

The PDF itself is bundled at `/docs/TE360_FOIA_Crawlers_Package.pdf` and committed under `docs/te360/artifacts/`.

---

## Section 1 — Mexico Transparency Requests (INAI portal)

Filed via [Plataforma Nacional de Transparencia](https://www.plataformadetransparencia.org.mx/). Legal basis: Ley General de Transparencia y Acceso a la Información Pública (LGTAIP), Arts. 4, 6, 113. Deadline: **20 business days from filing (Art. 132 LGTAIP)**.

| ID | Agency | Focus | Period |
|---|---|---|---|
| **M-001** | Instituto Nacional de Migración (INM) — Secretaría de Gobernación | INM repatriation records · deported US-military veterans · aggregate stats; point of entry; canalización to migrant shelters; veteran-specific protocols | 2010–2026 |
| **M-002** | Comisión Mexicana de Ayuda a Refugiados (COMAR) | COMAR refugee applications by deported US residents · cases per year/office (Tapachula, CDMX, Tijuana, Monterrey, Palenque) · motivo de solicitud · resolución status | 2018–2026 |
| **M-003** | Comisión Nacional de Búsqueda (CNB) — SEGOB | Registro Nacional de Personas Desaparecidas y No Localizadas (RNPDNO) entries linked to deported persons · estatus de búsqueda · coordinación US authorities · IOM/ACNUR protocols | 2015–2026 |
| **M-004** | Secretaría de Salud — DGIS | CLUES units serving migrant deportees in border states (Baja California, Sonora, Chihuahua, Coahuila, Nuevo León, Tamaulipas) · attentions in public hospitals · mental-health programs · SEMEFO data on unidentified border remains | 2020–2026 |
| **M-005** | Secretaría de Relaciones Exteriores (SRE) | Consular assistance to deported US-veteran cases · DGPME actions · bilateral MOUs with US Dept of Veterans Affairs · UNAM Acción Migrante program data | 2015–2026 |

All five are aggregate-data requests, no personally identifiable information. Spanish-language request templates are in the source PDF.

---

## Section 2 — US FOIA Requests

Filed under 5 U.S.C. § 552. **Expedited processing** requested under 6 C.F.R. § 5.5(e)(1)(ii) (Congressional briefing scheduled May 18 2026). **Fee waiver** requested under 5 U.S.C. § 552(a)(4)(A)(iii) (AUMER is 501(c)(3) nonprofit research, EIN 99-0495658).

| ID | Agency | Focus |
|---|---|---|
| **US-001** | DHS / ICE via FOIA | Deportation Data Project cross-reference — supplement to existing DHS ENFORCE request (F002). ENFORCE/EARM records with US-military-veteran flag (1996–present); alien numbers, country of removal, AOR of arresting field office; internal memoranda re: veteran identification during removal; LESC ICE Detainer database entries flagged as veterans. |
| **US-002** | FBI CJIS Division | Aggregate stats from the NCIC Protection Order File (POF) — POF records concurrent with Immigration Violator File or flagged for removal, FY2020–present; POF records where subject was subsequently deported; policy guidance on POF handling under immigration enforcement. |
| **US-003** | DOJ Office of Sex Offender Sentencing, Monitoring, Apprehending, Registering & Tracking (SMART) | NSOPW cross-reference with deportation — aggregate stats by year/state/SORNA tier (I, II, III), FY2010–present; SMART–DHS/ICE inter-agency agreements re: notification protocols on deportation; tracking of deported SOs in NSOPW post-removal. |

---

## Section 3 — University & Research Institution Requests

| ID | Institution | Contact | Ask |
|---|---|---|---|
| **UNI-001** | **UNAM SUDIMER** — Instituto de Investigaciones Jurídicas, UNAM | sudimer@unam.mx · Dra. Luciana Gandini, Coordinadora | Access to the 33-database SUDIMER compilation (2000–2024) for cross-referencing against AUMER's DCAS forensic audit of Vietnam-War casualty classification (349 Hispanic-coded of 58,220 total, 84.9% failure rate). Datasets specific to veteran deportees / military-connected migrants. Possible collaboration with Prof. Marco Durazo (USF) on a co-authored paper. |
| **UNI-002** | **COLEF EMIF Norte** — El Colegio de la Frontera Norte, Tijuana | www.colef.mx/emif · emif@colef.mx | EMIF Norte microdata for the *Devueltos por autoridades migratorias de EE.UU.* flow, 2015–2023. Length of US residence · family separation · detention conditions · military-service proxy variable · deportation destination (Tijuana, Mexicali, Nogales). |
| **UNI-003** | **UABC Estudios Fronterizos** | ref@uabc.mx · Estudios Fronterizos editorial | Article-submission proposal: DCAS forensic audit methodology (84.9% Hispanic-classification failure) · cross-border veteran erasure: 6 verified deported veteran cases with CB-HSIVF evidence certification · TruthEngine360 forensic platform architecture. Plus dataset access from UABC Repositorio Institucional on transnational deportee populations in the Tijuana-San Diego corridor. |

---

## Section 4 — n8n Crawler Configurations

**Instance:** `qt360.app.n8n.cloud`
**Current crawlers:** 30 active across 6 categories.
The configurations below extend the existing crawler infrastructure with new Mexican government, university, and registry data sources.

### MX-GOV-01 · SEGOB Migration Bulletins Monitor — **HIGH**

| Field | Configuration |
|---|---|
| URL | `http://www.politicamigratoria.gob.mx/es/PoliticaMigratoria/Boletines_Estadisticos` |
| Schedule | Monthly (1st of each month) |
| Method | HTTP GET + PDF download detection |
| Trigger | New bulletin publication |
| Action | Download PDF, extract statistics via OCR/text, push to HubSpot + PostgreSQL |

### MX-GOV-02 · Deportation Data Project Monitor — **CRITICAL**

| Field | Configuration |
|---|---|
| URL | `https://deportationdata.org/data.html` |
| Schedule | Weekly (Monday 06:00 UTC) |
| Method | HTTP GET, check for new data release announcements |
| Trigger | New ICE data release (March 2026 was latest) |
| Action | Alert via Discord, download ZIP (2.6 GB), process arrests / detentions / removals tables |

### MX-GOV-03 · COLEF EMIF Publications Monitor — **HIGH**

| Field | Configuration |
|---|---|
| URL | `https://www.colef.mx/emif/` |
| Schedule | Bi-weekly |
| Method | HTTP GET, parse for new quarterly indicators or annual reports |
| Trigger | New EMIF publication or dataset update |
| Action | Download data, cross-reference with veteran case registry |

### MX-GOV-04 · Plataforma Nacional de Transparencia Response Tracker

(Referenced in PDF; configuration continues beyond the rendered page-5 sample. The package's intent is a tracker that polls the user's open INAI requests and triggers downstream actions on agency response.)

---

## TE360 vs. Exile Patriot — corpus separation

| Corpus | Scope | Crawler-shared infrastructure |
|---|---|---|
| **TE360 / Terminel-Sagasta** | Historical investigation 1850–1940 · Sonora · 95-claim matrix · 9 pipes | n8n runtime · `ingestChroniclingAmerica` · `ingestNARACatalog` · `ingestOpenAlex` · `ingestInternetArchive` · `ingestScholarlyEnrichment` |
| **Exile Patriot Project** | Deported US-military veterans 1996–2026 · Congressional briefing · DCAS forensic audit | Same n8n runtime · Plataforma Nacional de Transparencia channel · LGTAIP / FOIA legal-basis pattern · `fetchMexicanOpenData` (INM bulletins) |

**Discipline:** evidence rows belong to one corpus, never both. The n8n crawler implementations can be reused (HTTP-GET-and-process is the same code); the *targets* and *case_id* differ.

---

## Operational notes (for live wiring)

- **AUTOMATION_SECRET** + **SCHEDULER_SECRET** must be set on each crawler function in Base44 to match the n8n caller's `X-Automation-Secret` header (per the auth gates Codex already hardened on `ingestChroniclingAmerica` / `archiveDailySession` / `backupToGoogleDrive`).
- **FRED_API_KEY**, **BANXICO_TOKEN**, **INEGI_TOKEN**, optional **SEMANTIC_SCHOLAR_API_KEY** are required for the corresponding `fetchEconomicSeries`, `fetchMexicanOpenData`, `ingestScholarlyEnrichment` functions.
- Master registry (75+ sources, archive contact directory, pipe→database mapping, 21-task priority queue) is now extracted under `data/te360/extracted/master_sheet_v2_2/*.csv` for downstream tooling.
