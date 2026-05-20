# TruthEngine360 — Platform Assessment & Migration Proposal

**Document**: `docs/truth-engine-platform-research-report.md`  
**Status**: Draft for internal review  
**Date**: April 2026  
**Scope**: Architecture audit, connector reconnaissance, 3-round migration plan

---

## Architecture Research

A consolidated platform assessment and migration proposal is available at:

- [`docs/truth-engine-platform-research-report.md`](docs/truth-engine-platform-research-report.md)

---

## 1. Bottom Line

Truth Engine should become an **evidence-grade workflow platform**, not a dashboard with aspirational automation. The repositories already point in this direction. The core requirement is disciplined architecture convergence: one runtime truth model, durable workflows, evidence lineage, and controlled strangler migration.

**Do not pursue a big-bang rewrite.** Stabilize, extract, and migrate in controlled phases.

---

## 2. Repository Audit

| Repo | Architecture | Verdict |
|------|-------------|---------|
| `truthengine360` | Mixed (Base44 React + functions + nested Python + drifting deploy artifacts) | Promising but unstable |
| `Case-Vault` | Bootstrap-only | Define before coding |
| `Autocraft` | Concept-stage | Do not depend on it |
| `claude` | Concept-stage | Do not depend on it |

### What Is Working

- React + Base44 shell exists and runs
- Route, auth, query, and client wiring is coherent
- Workflow-oriented product surfaces exist
- Evidence/FOIA/DCAS-oriented serverless function intent
- Nested Python research-db contains reusable architectural signal

### What Is Not Working Yet

- Workflow source-of-truth is fragmented — hard-coded in UI components
- Runtime model is split across 3+ overlapping directions
- Deployment narrative drift — docs don't match live shape
- Evidence fidelity gaps — partially simulated behaviors
- Potential auth defect in `syncToGitHub` authorization check

---

## 3. Connector Reconnaissance

| Connector | Tier | Role |
|-----------|------|------|
| GitHub | Tier 1 | Primary source of implementation truth |
| Google Drive | Tier 1 | Strategic and go-to-market context |
| Google Calendar | Tier 2 | Time-sensitive briefing milestones |

Additional external research catalog used for topic discovery: **EBSCO Research Starters**: https://www.ebsco.com/research-starters

---

## 4. Canonical Domain Model

Ten canonical entities underpin the target architecture:

`CASE` · `DOCUMENT` · `EVIDENCE_ITEM` · `WORKFLOW_RUN` · `OCR_CHUNK` · `APPROVAL` · `TASK_EVENT` · `CONNECTOR` · `REPORT` · `REPORT_ARTIFACT`

---

## 5. Recommended Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Front End | React + TypeScript + TanStack Query | Fits current reality |
| API | FastAPI | Strong OpenAPI-first velocity |
| Durable Workflows | Temporal | Never-lose case-critical processing |
| Connector Automation | n8n | Fast integration iteration |
| Research / Data Jobs | Prefect | Python-native orchestration |
| System of Record | PostgreSQL + pgvector | Transactional truth + vectors |
| Search | OpenSearch | Hybrid/semantic retrieval |
| Graph | Neo4j | Relationship-intensive evidence modeling |
| Event Bus | NATS JetStream | Replay + persistence without Kafka ceremony |
| Observability | OTel + Prometheus/Grafana | Correlated telemetry |
| CI | GitHub Actions | Native repo ecosystem |
| CD | Argo CD | GitOps delivery at scale |

---

## 6. Workflow Engine Split

### n8n
Connector-heavy, SaaS-heavy, operator-visible automations. Node-based workflows, draft/publish, execution visibility.

### Temporal
Case-critical, durable, long-running approval workflows that must survive crashes. Crash-proof durable execution, retries/compensation, long waits.

### Prefect
Python-first OCR/NLP/research/data jobs and backfills. Python-native orchestration, state/recovery, event-driven operation.

---

## 7. Evidence Processing Path

```
Intake event
→ Create case/document records
→ Store source artifact
→ Emit document.received
→ Prefect OCR/extraction
→ Temporal verification/approval
→ Index to Postgres/OpenSearch/Neo4j
→ Generate report package
→ Publish export & audit trail
```

---

## 8. Three-Round Migration Plan

### Round 1 — Estate Stabilization & Truth Mapping
**Duration**: 2–3 weeks | **Dates**: Apr 28 – May 12, 2026

**Objective**: Freeze architecture drift; inventory workflows; define canonical domain model; classify functions as keep/replace/prototype/delete.

**Deliverables**:
- Repository map
- Connector inventory
- Data glossary
- Event catalog
- ADR set
- Security backlog
- Migration inventory
- Workflow source-of-truth document

**Success Metrics**:
- 100% critical workflow mapping
- 100% secrets ownership identified
- 90%+ function classification
- First end-to-end trace

---

### Round 2 — Platform Skeleton & Service Extraction
**Duration**: 4–6 weeks | **Dates**: May 13 – Jun 3, 2026

**Objective**: Build platform skeleton; extract first durable workflows; establish API/event contracts.

**Deliverables**:
- API gateway + auth
- Evidence service
- Workflow runtime integration
- Event bus
- Postgres+pgvector schema
- Object layout
- Initial search index
- CI baseline

**Success Metrics**:
- One workflow rerouted end-to-end
- 95% persisted workflow state
- p95 API latency < 400ms
- Deterministic replay on ≥1 evidence flow

---

### Round 3 — Hardening, Migration & Operating Model
**Duration**: 6–8 weeks | **Dates**: Jun 5 – Jun 27, 2026

**Objective**: Production hardening; staged migration; runbooks and KPI operations.

**Deliverables**:
- GitOps/CD
- SLOs + alerting
- SBOM
- Security gates
- Audit logs
- DR plan
- Rollout playbooks
- KPI dashboard
- Operator training

**Success Metrics**:
- 99.5% workflow success on migrated flows
- MTTR < 30 min
- 60% manual touch-time reduction
- >95% trace coverage

---

## 9. Infrastructure Cost Ranges

| Environment | Monthly Range | Profile |
|-------------|--------------|---------|
| Prototype | $700–$1,500 | API + single worker lane + small DB |
| Pilot | $2,500–$6,000 | HA API + 2–3 lanes + search + monitoring |
| Production | $8,000–$20,000+ | HA multi-lane + graph + DR/observability |

Team estimate: 5–7 contributors over 16–24 weeks.

---

## 10. Migration Strategy — Strangler Pattern

Keep the existing React shell for operator continuity. Move system truth into new APIs, services, and events. Dual-run and retire flows incrementally.

Migration order:
1. Document intake
2. Evidence extraction
3. Approvals
4. Reporting/export
5. External syncs

---

## 11. Open Questions

1. How much operational state currently lives inside Base44 versus exportable in-repo systems?
2. Which visible workflows are production-critical versus narrative prototypes?
3. Given deadlines around May 18, 2026, should a temporary stabilize-and-export phase precede deeper extraction?
4. Should `helpful-command-flow-core.zip` become formal scope once repository boundaries are confirmed?

---

## 12. CHC Briefing Deadline

**May 18, 2026 — Congressional Hispanic Caucus Briefing**

Round 1 stabilization must complete before this date. The CHC briefing package depends on:
- Verified case file evidence (Evidence Linker)
- Tier 4 A-File validation results (USCIS Genealogy tracker)
- NERO institutional erasure scores
- DCAS forensic audit outputs

---

## 13. Forensic Audit Companion Documents

The following companion documents operationalize the research vectors supporting the CHC briefing:

- [`forensic-audit/tradecraft-reframe.md`](forensic-audit/tradecraft-reframe.md) — Reframes the 349 Rule as institutional tradecraft; maps seven research vectors as evidence; proposes Conditional Citizenship as research vector #6.
- [`forensic-audit/form-102-pipeline.md`](forensic-audit/form-102-pipeline.md) — Operationalizes Selective Service Form 102 retrieval at NARA-St. Louis; integrates IV-C statutory mechanism, parallel test case protocol, and A-File Phase II expansion.

---

## Sources and References

- EBSCO Research Starters — Military History and Science: https://www.ebsco.com/research-starters/military-history-and-science
- EBSCO Research Starters — Law: https://www.ebsco.com/research-starters/law
- RAND Corporation BISG Methodology
- NARA DCAS Public Extract (58,220 records)
- ACLU National — Deported Veterans case registry
- INA § 329, IIRIRA § 321/§ 237
- OMB Statistical Policy Directive 15 (1977, revised 1997)

---

*TruthEngine360 — AUMER Foundation · Forensic Civic Intelligence*