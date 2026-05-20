# SciELO Source Registry — Ingestion Plan
## Two-lane separation: document lane vs. metrics lane

This registry defines how SciELO assets enter the TE360 vault. The rule is simple and non-negotiable: **document content and source analytics live in separate tables**. You should be able to ask either "What does the literature say?" or "How is this journal performing?" without the answer to one polluting the answer to the other.

## Assets and recommended record types

| # | Asset | URL | Record type | Confidence | Lane | Status |
|---|---|---|---|---|---|---|
| 1 | SciELO article landing page (Gerber & Passananti 2015) | `https://www.scielo.org.mx/scielo.php?script=sci_arttext&pid=S1405-22532015000100002` | `KnowledgeDocument` | High | Document | ✅ Harvested |
| 2 | SciELO article PDF (same paper) | `https://www.scielo.org.mx/scielo.php?script=sci_pdf&pid=S1405-22532015000100002&lng=en&nrm=iso` | `KnowledgeDocument` + raw file asset | High | Document | ✅ Confirmed in upstream run |
| 3 | SciELO article XML structured export (same paper) | `https://www.scielo.org.mx/scielo.php?script=sci_arttext&pid=S1405-22532015000100002&lng=en&nrm=iso&tlng=en` (or the journal-meta XML at the per-article endpoint) | `PendingStructuredSource` | Medium-low | Document | ⚠️ Failed (cache miss) — needs re-pull |
| 4 | SciELO Analytics journal shell | `https://analytics.scielo.org/` (journal context page) | `SourceRegistry` + `JournalMetricSource` | Medium | Metrics | ✅ Shell confirmed (Beta) |
| 5 | SciELO Analytics — Citation Data | `https://analytics.scielo.org/w/bibliometrics/journal/citation_data` | `JournalMetricEndpoint` | Medium | Metrics | Linked, polling not yet implemented |
| 6 | SciELO Analytics — Usage Data | (URL pending — supply when available) | `JournalMetricEndpoint` | Medium | Metrics | Not yet linked |

## Lane semantics

### Document Lane

- **Stores:** article landing pages, PDFs, XML structured exports.
- **Tables:** `KnowledgeDocument` (metadata), raw file assets (storage), chunks + embeddings (retrieval layer), source registry.
- **Used for:** semantic retrieval, clustering with adjacent banking-history sources, citation in reports.
- **NOT used for:** verifying case-specific transactions or claims. Tagged as secondary scholarly context with provenance score reflecting that.

### Metrics Lane

- **Stores:** access counts, bibliometric totals, citation counts, journal-level indicators.
- **Tables:** `JournalMetricEndpoint` (config), time-series metrics store (`fetch_timestamp`, `journal_id`, `period`, `metric_family`, `raw_payload`, `normalized_summary`).
- **Used for:** reporting on discovery, usage, and scholarly footprint of journals that contain TE360 sources.
- **NOT used for:** verifying case facts. SciELO Analytics is explicitly in Beta and its own page advises that "data are gradually being loaded" — treat all metrics as advisory.

## Classification of the Gerber & Passananti 2015 article

- **Lane:** Document
- **Confidence:** High
- **Role:** Secondary scholarly context for the 1890–1910 Mexican banking regime under which Aviana's 1907 asserted deeds and Francisco's mining operations operated.
- **Tags:** `banking-history`, `mexico`, `brazil`, `financial-regulation`, `1890-1910`, `porfiriato`, `limantour`, `banamex`, `peer-reviewed`.
- **Does NOT verify:** any case-specific WF Express transaction, any Aviana deed, any Banco Agrícola Sonorense claim.
- **Harvest status:** PARTIAL — landing page + PDF confirmed, XML structured export pending re-pull.

## Implementation note

This registry describes the target schema. The Base44 entity definitions for `KnowledgeDocument`, `JournalMetricEndpoint`, `JournalMetricSource`, and `PendingStructuredSource` are not yet built — they're a bigger architectural change that should be confirmed before commit. The two-lane separation, however, is the rule that any future implementation must respect.

## Operational summary

| Question | Answer source |
|---|---|
| "What does the literature say about Mexican banking 1890–1910?" | Document lane → Gerber & Passananti 2015 + adjacent sources |
| "How well-cited is this journal? How often is the article viewed?" | Metrics lane → SciELO Analytics endpoints |
| "Was Aviana's asset held at Banco de Londres or Banco Nacional?" | NEITHER — this requires primary archival evidence from AHES / Banamex Archivo Histórico / etc. The Gerber-Passananti paper is context, not proof. |

Old rule, still gold: never confuse source content with source analytics.
