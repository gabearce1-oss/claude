# TruthEngine360 Research Database

Lawful public-interest research platform for documenting deported U.S. military personnel of Mexican nationality, Vietnam era to present.

## Quick Start

```bash
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your DB credentials, API keys, n8n webhook URLs
python -m pytest
make build
```

## Architecture

**Stack:** Postgres (relational) + pgvector (embeddings) + OpenSearch (search) + Neo4j (graphs) + GitHub (CI/CD) + n8n (events)

**Pipeline:** Discovery → Acquisition → Normalization → Entity/Language → Evidence Synthesis → Governance/Review

**Sources:** 100 priority families across US Federal, US State/Local, Mexico Federal, Mexico State/Municipal, Academic, NGO/Media

## Key Files

- `connectors/` — API clients and crawlers (NARA, LOC, Census, Congress, BLS, USAspending, INEGI, INE, etc.)
- `schemas/` — SQL migrations and search indexes
- `configs/` — Source registry YAML, crawl policies, sensitivity rules
- `orchestrator/` — Job scheduling, event routing, retry logic
- `analytics/` — Dedup, translation, entity resolution, claim extraction, scoring
- `.github/workflows/` — CI/CD for lint, tests, schema validation, connectors
- `integrations/n8n/` — Webhook contracts and event emission

## Governance

All ingestion is **evidence-first**: every record points to source, every claim to evidence, every publication to review state.

**Prohibited:** Person-level social listening, shelter-resident tracking, face recognition, mental-health inference, private-account scraping.

**Allowed:** Public APIs, bulk downloads, archival/repository metadata, aggregate discourse analysis (k-anonymity floors).

## Connector Status

| Source Family | Class | Status |
|---|---|---|
| NARA Catalog | OFFICIAL_API | Ready |
| LOC JSON | OFFICIAL_API | Ready |
| Congress.gov | OFFICIAL_API | Ready |
| Census Data | OFFICIAL_API | Ready |
| BLS Public Data | OFFICIAL_API | Ready |
| USAspending | OFFICIAL_API | Ready |
| Data.gov Catalog | CATALOG_METADATA | Ready |
| INEGI Indicators | OFFICIAL_API | Ready |
| INE Datos Abiertos | PUBLIC_SEARCH_PORTAL | Ready |
| FOIA.gov | OFFICIAL_API | In Progress |

## Deploy

GitHub Actions runs CI on push; successful builds emit signed webhooks to `https://qt360.app.n8n.cloud/` for event routing, analyst review ticketing, and report delivery.

See `docs/architecture.md` and `docs/governance.md` for full details.