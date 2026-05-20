import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { P } from "../../lib/teData";

// ─── DATA ────────────────────────────────────────────────────────────────────

const ROUNDS = [
  {
    id: "r1", label: "Round 1", title: "Estate Stabilization & Truth Mapping",
    duration: "2–3 weeks", dates: "Apr 28 – May 12, 2026", color: P.red,
    objective: "Freeze architecture drift; inventory workflows; define canonical domain model; classify functions as keep/replace/prototype/delete.",
    deliverables: ["Repository map", "Connector inventory", "Data glossary", "Event catalog", "ADR set", "Security backlog", "Migration inventory", "Workflow source-of-truth document"],
    risks: ["Hidden Base44 dependencies", "Undocumented credentials", "Logic trapped in UI literals", "Inability to export operational state"],
    metrics: ["100% critical workflow mapping", "100% secrets ownership identified", "90%+ function classification", "First end-to-end trace"],
    milestones: ["Repo inventory", "Workflow mapping", "Data model", "Secrets/security audit", "Tracing baseline", "ADR closure"],
  },
  {
    id: "r2", label: "Round 2", title: "Platform Skeleton & Service Extraction",
    duration: "4–6 weeks", dates: "May 13 – Jun 3, 2026", color: P.amber,
    objective: "Build platform skeleton; extract first durable workflows; establish API/event contracts.",
    deliverables: ["API gateway + auth", "Evidence service", "Workflow runtime integration", "Event bus", "Postgres+pgvector schema", "Object layout", "Initial search index", "CI baseline"],
    risks: ["Dual-write inconsistencies", "Early indexing complexity", "Connector throttling", "Under-specified approval semantics"],
    metrics: ["One workflow rerouted end-to-end", "95% persisted workflow state", "p95 API latency < 400ms", "Deterministic replay on ≥1 evidence flow"],
    milestones: ["API/auth", "Data/storage bootstrap", "n8n lane", "Temporal worker", "Prefect lane", "First extracted workflow"],
  },
  {
    id: "r3", label: "Round 3", title: "Hardening, Migration & Operating Model",
    duration: "6–8 weeks", dates: "Jun 5 – Jun 27, 2026", color: P.teal,
    objective: "Production hardening; staged migration; runbooks and KPI operations.",
    deliverables: ["GitOps/CD", "SLOs + alerting", "SBOM", "Security gates", "Audit logs", "DR plan", "Rollout playbooks", "KPI dashboard", "Operator training"],
    risks: ["Dual-mode user confusion", "Observability blind spots", "Relevance complaints", "Cost creep from parallel infra"],
    metrics: ["99.5% workflow success on migrated flows", "MTTR < 30 min", "60% manual touch-time reduction", ">95% trace coverage"],
    milestones: ["SLO/alerts", "SBOM/security gates", "Migration batches", "Runbooks/training", "KPI optimization"],
  },
];

const REPO_AUDIT = [
  { repo: "truthengine360", arch: "Mixed (Base44 React + functions + nested Python + drifting deploy artifacts)", verdict: "Promising but unstable", color: P.amber, keep: true, modules: "TruthEngine UI, report automation, FOIA/DCAS/evidence workflows, research-db docs", gaps: "No single runtime model, deployment drift, workflow source-of-truth weakness, auth/evidence concerns" },
  { repo: "Case-Vault", arch: "Bootstrap-only", verdict: "Define before coding", color: P.blue, keep: false, modules: "Minimal", gaps: "No schema/service contracts" },
  { repo: "Autocraft", arch: "Concept-stage", verdict: "Do not depend on it", color: P.red, keep: false, modules: "Minimal", gaps: "No runtime substance" },
  { repo: "claude", arch: "Concept-stage", verdict: "Do not depend on it", color: P.red, keep: false, modules: "Minimal", gaps: "No runtime substance" },
];

const STACK = [
  { layer: "Front End", choice: "React + TypeScript + TanStack Query", why: "Fits current reality and operator use cases", color: P.blue },
  { layer: "API", choice: "FastAPI", why: "Strong OpenAPI-first velocity", color: P.teal },
  { layer: "Durable Workflows", choice: "Temporal", why: "Never-lose case-critical processing", color: P.gold },
  { layer: "Connector Automation", choice: "n8n", why: "Fast integration iteration", color: P.violet },
  { layer: "Research / Data Jobs", choice: "Prefect", why: "Python-native orchestration", color: P.amber },
  { layer: "System of Record", choice: "PostgreSQL + pgvector", why: "Transactional truth + vectors", color: P.teal },
  { layer: "Search", choice: "OpenSearch", why: "Hybrid/semantic retrieval", color: P.blue },
  { layer: "Graph", choice: "Neo4j", why: "Relationship-intensive evidence modeling", color: P.red },
  { layer: "Event Bus", choice: "NATS JetStream", why: "Replay + persistence without Kafka ceremony", color: P.amber },
  { layer: "Observability", choice: "OTel + Prometheus/Grafana", why: "Correlated telemetry", color: P.violet },
  { layer: "CI", choice: "GitHub Actions", why: "Native repo ecosystem fit", color: P.blue },
  { layer: "CD", choice: "Argo CD (at scale)", why: "GitOps delivery at scale", color: P.teal },
];

const MILESTONES_OUTCOMES = [
  { milestone: "Platform truth map complete", outcome: "Workflows, schemas, connectors, secrets ownership documented", kpi: "100% critical workflow coverage", color: P.red },
  { milestone: "First intake workflow migrated", outcome: "New API/event bus production path for one flow family", kpi: "95% success on new path", color: P.amber },
  { milestone: "Evidence pipeline durable", outcome: "OCR/extraction/approval is replayable and auditable", kpi: "0 unrecoverable workflow losses", color: P.gold },
  { milestone: "Search and graph online", outcome: "Evidence searchable by keyword + semantic + relationships", kpi: "Retrieval relevance improves release-over-release", color: P.teal },
  { milestone: "Reporting/export hardened", outcome: "Evidence-driven briefing packages and audit bundles", kpi: "60% reduction in manual reporting time", color: P.blue },
  { milestone: "Legacy retirement", outcome: "Old runtime high-value flows disabled", kpi: "70%+ workload on new platform", color: P.violet },
];

const INFRA_COSTS = [
  { env: "Prototype", summary: "API + single worker lane + small DB/storage/logging", range: "$700–$1,500/mo", color: P.teal },
  { env: "Pilot", summary: "HA API + 2–3 lanes + larger DB + search + monitoring", range: "$2,500–$6,000/mo", color: P.amber },
  { env: "Production", summary: "HA multi-lane + larger search + graph + DR/observability", range: "$8,000–$20,000+/mo", color: P.red },
];

const CANONICAL_ENTITIES = [
  "CASE", "DOCUMENT", "EVIDENCE_ITEM", "WORKFLOW_RUN", "OCR_CHUNK", "APPROVAL", "TASK_EVENT", "CONNECTOR", "REPORT", "REPORT_ARTIFACT"
];

const OPEN_QUESTIONS = [
  "How much operational state currently lives inside Base44 versus exportable in-repo systems?",
  "Which visible workflows are production-critical versus narrative prototypes?",
  "Given deadlines around May 18, 2026, should a temporary stabilize-and-export phase precede deeper extraction?",
  "Should helpful-command-flow-core.zip become formal scope once repository boundaries are confirmed?",
];

const WORKFLOW_PATH = [
  "Intake event", "Create case/document records", "Store source artifact",
  "Emit document.received", "Prefect OCR/extraction", "Temporal verification/approval",
  "Index to Postgres/OpenSearch/Neo4j", "Generate report package", "Publish export & audit trail"
];

const TABS = ["Overview", "Repo Audit", "3-Round Plan", "Architecture", "Roadmap", "Open Questions", "Docs & GitHub"];

// ─── HELPERS ────────────────────────────────────────────────────────────────

const S = { fontFamily: "'IBM Plex Mono', monospace" };

function Tag({ color, children }) {
  return (
    <span style={{ fontSize: 8, padding: "2px 7px", borderRadius: 4, fontWeight: 800, letterSpacing: "0.08em",
      background: `${color}18`, border: `1px solid ${color}40`, color }}>
      {children}
    </span>
  );
}

function SectionLabel({ children, color }) {
  return (
    <div style={{ fontSize: 8, fontWeight: 800, color: color || P.gold, letterSpacing: "0.2em",
      textTransform: "uppercase", marginBottom: 10 }}>{children}</div>
  );
}

// ─── TABS ────────────────────────────────────────────────────────────────────

function OverviewTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Verdict banner */}
      <div style={{ padding: "18px 22px", border: `1px solid ${P.gold}50`, borderLeft: `5px solid ${P.gold}`,
        background: `${P.gold}08`, borderRadius: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: P.gold, marginBottom: 8 }}>⚡ BOTTOM LINE</div>
        <p style={{ fontSize: 11, color: P.t1, lineHeight: 1.7, margin: 0 }}>
          Truth Engine should become an <strong style={{ color: P.gold }}>evidence-grade workflow platform</strong>, not a dashboard with aspirational automation.
          The repositories already point in this direction. The core requirement is disciplined architecture convergence:
          one runtime truth model, durable workflows, evidence lineage, and controlled strangler migration.
          <strong style={{ color: P.red }}> Do not pursue a big-bang rewrite.</strong> Stabilize, extract, and migrate in controlled phases.
        </p>
      </div>

      {/* What works / what doesn't */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ border: `1px solid ${P.teal}35`, borderTop: `3px solid ${P.teal}`, background: P.card, borderRadius: 10, padding: "16px 18px" }}>
          <SectionLabel color={P.teal}>✓ What Is Working</SectionLabel>
          <ul style={{ fontSize: 10, color: P.t2, lineHeight: 2, paddingLeft: 16, margin: 0 }}>
            {["React + Base44 shell exists and runs", "Route, auth, query, and client wiring is coherent", "Workflow-oriented product surfaces exist", "Evidence/FOIA/DCAS-oriented serverless function intent", "Nested Python research-db contains reusable architectural signal"].map(i => <li key={i}>{i}</li>)}
          </ul>
        </div>
        <div style={{ border: `1px solid ${P.red}35`, borderTop: `3px solid ${P.red}`, background: P.card, borderRadius: 10, padding: "16px 18px" }}>
          <SectionLabel color={P.red}>✗ What Is Not Working Yet</SectionLabel>
          <ul style={{ fontSize: 10, color: P.t2, lineHeight: 2, paddingLeft: 16, margin: 0 }}>
            {["Workflow source-of-truth is fragmented — hard-coded in UI components", "Runtime model is split across 3+ overlapping directions", "Deployment narrative drift — docs don't match live shape", "Evidence fidelity gaps — partially simulated behaviors", "Potential auth defect in syncToGitHub authorization"].map(i => <li key={i}>{i}</li>)}
          </ul>
        </div>
      </div>

      {/* Connector scan */}
      <div style={{ border: `1px solid ${P.b}`, borderRadius: 10, background: P.card, padding: "16px 18px" }}>
        <SectionLabel color={P.blue}>Connector Reconnaissance Results</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[
            { name: "GitHub", tier: "Tier 1", role: "Primary source of implementation truth", color: P.teal },
            { name: "Google Drive", tier: "Tier 1", role: "Strategic and go-to-market context", color: P.blue },
            { name: "Google Calendar", tier: "Tier 2", role: "Time-sensitive briefing milestones", color: P.violet },
          ].map(c => (
            <div key={c.name} style={{ padding: "12px 14px", border: `1px solid ${c.color}35`, borderRadius: 8, background: `${c.color}08` }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.name}</div>
              <Tag color={c.color}>{c.tier}</Tag>
              <div style={{ fontSize: 9, color: P.t3, marginTop: 6, lineHeight: 1.5 }}>{c.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Canonical entities */}
      <div style={{ border: `1px solid ${P.b}`, borderRadius: 10, background: P.card, padding: "16px 18px" }}>
        <SectionLabel>Canonical Domain Entities</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {CANONICAL_ENTITIES.map((e, i) => (
            <span key={e} style={{ fontSize: 9, fontWeight: 800, padding: "4px 10px",
              background: `${[P.teal,P.blue,P.violet,P.amber,P.gold,P.red][i%6]}18`,
              border: `1px solid ${[P.teal,P.blue,P.violet,P.amber,P.gold,P.red][i%6]}40`,
              borderRadius: 6, color: [P.teal,P.blue,P.violet,P.amber,P.gold,P.red][i%6] }}>
              {e}
            </span>
          ))}
        </div>
      </div>

      {/* Evidence flow */}
      <div style={{ border: `1px solid ${P.b}`, borderRadius: 10, background: P.card, padding: "16px 18px" }}>
        <SectionLabel>Optimized Evidence Processing Path</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          {WORKFLOW_PATH.map((step, i) => (
            <div key={step} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ fontSize: 9, padding: "5px 10px", background: `${P.teal}12`, border: `1px solid ${P.teal}30`, borderRadius: 6, color: P.teal }}>
                <span style={{ color: P.gold, fontWeight: 800, marginRight: 5 }}>{i+1}.</span>{step}
              </div>
              {i < WORKFLOW_PATH.length - 1 && <span style={{ color: P.t4, fontSize: 10 }}>→</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RepoAuditTab() {
  const [sel, setSel] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {REPO_AUDIT.map(r => (
        <div key={r.repo} onClick={() => setSel(sel === r.repo ? null : r.repo)}
          style={{ border: `1px solid ${r.color}40`, borderLeft: `5px solid ${r.color}`, background: P.card,
            borderRadius: 10, padding: "14px 18px", cursor: "pointer", transition: "all .15s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>{r.repo}</span>
              <Tag color={r.color}>{r.verdict}</Tag>
              {r.keep && <Tag color={P.teal}>Extraction Source</Tag>}
            </div>
            <span style={{ color: P.t4, fontSize: 12 }}>{sel === r.repo ? "▲" : "▼"}</span>
          </div>
          <div style={{ fontSize: 10, color: P.t3 }}>{r.arch}</div>
          {sel === r.repo && (
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <div style={{ fontSize: 8, color: P.t4, marginBottom: 4, fontWeight: 800, textTransform: "uppercase" }}>Modules</div>
                <div style={{ fontSize: 10, color: P.t2, lineHeight: 1.6 }}>{r.modules}</div>
              </div>
              <div>
                <div style={{ fontSize: 8, color: P.red, marginBottom: 4, fontWeight: 800, textTransform: "uppercase" }}>Gaps</div>
                <div style={{ fontSize: 10, color: P.t2, lineHeight: 1.6 }}>{r.gaps}</div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Migration strategy */}
      <div style={{ border: `1px solid ${P.gold}35`, borderRadius: 10, background: P.card, padding: "16px 18px" }}>
        <SectionLabel>Migration Strategy — Strangler Pattern</SectionLabel>
        <p style={{ fontSize: 10, color: P.t2, lineHeight: 1.7, marginBottom: 12 }}>
          Keep the existing React shell for operator continuity. Move system truth into new APIs, services, and events. Dual-run and retire flows incrementally.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["Document intake", "Evidence extraction", "Approvals", "Reporting/export", "External syncs"].map((step, i) => (
            <div key={step} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ fontSize: 9, padding: "4px 10px", background: `${P.amber}12`, border: `1px solid ${P.amber}30`, borderRadius: 6, color: P.amber }}>
                <span style={{ fontWeight: 800, marginRight: 5 }}>{i+1}.</span>{step}
              </div>
              {i < 4 && <span style={{ color: P.t4 }}>→</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThreeRoundTab() {
  const [open, setOpen] = useState("r1");
  const CHC_DAYS = Math.ceil((new Date("2026-05-18") - new Date()) / 86400000);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {CHC_DAYS > 0 && (
        <div style={{ padding: "10px 16px", background: `${P.red}12`, border: `1px solid ${P.red}40`, borderRadius: 8, display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 20 }}>🏛️</span>
          <div style={{ fontSize: 10, color: P.t1 }}>
            <strong style={{ color: P.red }}>CHC Briefing: {CHC_DAYS} days</strong> — May 18, 2026.
            Round 1 stabilization must complete before that date.
          </div>
        </div>
      )}
      {ROUNDS.map(r => (
        <div key={r.id} style={{ border: `1px solid ${r.color}40`, borderRadius: 10, background: P.card, overflow: "hidden" }}>
          <div onClick={() => setOpen(open === r.id ? null : r.id)}
            style={{ padding: "14px 18px", borderLeft: `5px solid ${r.color}`, cursor: "pointer",
              background: open === r.id ? `${r.color}08` : "transparent",
              display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Tag color={r.color}>{r.label}</Tag>
              <span style={{ fontSize: 12, fontWeight: 800, color: P.t1 }}>{r.title}</span>
              <span style={{ fontSize: 9, color: P.t4 }}>{r.dates}</span>
              <Tag color={r.color}>{r.duration}</Tag>
            </div>
            <span style={{ color: r.color, fontSize: 12 }}>{open === r.id ? "▲" : "▼"}</span>
          </div>

          {open === r.id && (
            <div style={{ padding: "18px 22px 18px 26px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 10, color: P.t2, lineHeight: 1.7 }}><strong style={{ color: r.color }}>Objective:</strong> {r.objective}</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <SectionLabel color={r.color}>Deliverables</SectionLabel>
                  <ul style={{ paddingLeft: 14, margin: 0, fontSize: 10, color: P.t3, lineHeight: 1.9 }}>
                    {r.deliverables.map(d => <li key={d}>{d}</li>)}
                  </ul>
                </div>
                <div>
                  <SectionLabel color={P.red}>Risks</SectionLabel>
                  <ul style={{ paddingLeft: 14, margin: 0, fontSize: 10, color: P.t3, lineHeight: 1.9 }}>
                    {r.risks.map(d => <li key={d}>{d}</li>)}
                  </ul>
                </div>
                <div>
                  <SectionLabel color={P.teal}>Success Metrics</SectionLabel>
                  <ul style={{ paddingLeft: 14, margin: 0, fontSize: 10, color: P.t3, lineHeight: 1.9 }}>
                    {r.metrics.map(d => <li key={d}>{d}</li>)}
                  </ul>
                </div>
              </div>

              <div>
                <SectionLabel>Timeline Milestones</SectionLabel>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {r.milestones.map((m, i) => (
                    <div key={m} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 9, padding: "4px 10px", background: `${r.color}12`, border: `1px solid ${r.color}30`, borderRadius: 6, color: r.color }}>{m}</span>
                      {i < r.milestones.length - 1 && <span style={{ color: P.t4 }}>→</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ArchTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Four planes */}
      <div style={{ border: `1px solid ${P.b}`, borderRadius: 10, background: P.card, padding: "16px 18px" }}>
        <SectionLabel>Evidence-Centric Platform — 4 Planes</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[
            { name: "Experience Plane", detail: "React operator console", color: P.blue, icon: "🖥️" },
            { name: "Orchestration Plane", detail: "n8n + Temporal + Prefect hybrid", color: P.gold, icon: "⚙️" },
            { name: "Evidence / Data Plane", detail: "Transaction + retrieval + graph + artifacts", color: P.teal, icon: "🗃️" },
            { name: "Observability / Security", detail: "Traceability, security controls, supply-chain visibility", color: P.violet, icon: "🔍" },
          ].map(p => (
            <div key={p.name} style={{ padding: "14px 16px", border: `1px solid ${p.color}40`, borderTop: `3px solid ${p.color}`, borderRadius: 8, background: `${p.color}08` }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>{p.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: p.color, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 9, color: P.t4, lineHeight: 1.5 }}>{p.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow split */}
      <div style={{ border: `1px solid ${P.b}`, borderRadius: 10, background: P.card, padding: "16px 18px" }}>
        <SectionLabel>Workflow Engine Split</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[
            { engine: "n8n", use: "Connector-heavy, SaaS-heavy, operator-visible automations", strength: "Node-based workflows, draft/publish, execution visibility", color: P.amber },
            { engine: "Temporal", use: "Case-critical, durable, long-running approval workflows that must survive crashes", strength: "Crash-proof durable execution, retries/compensation, long waits", color: P.blue },
            { engine: "Prefect", use: "Python-first OCR/NLP/research/data jobs and backfills", strength: "Python-native orchestration, state/recovery, event-driven operation", color: P.teal },
          ].map(e => (
            <div key={e.engine} style={{ padding: "14px 16px", border: `1px solid ${e.color}35`, borderRadius: 8, background: `${e.color}08` }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: e.color, marginBottom: 6 }}>{e.engine}</div>
              <div style={{ fontSize: 9, color: P.t3, lineHeight: 1.6, marginBottom: 6 }}><strong style={{ color: P.t2 }}>Use:</strong> {e.use}</div>
              <div style={{ fontSize: 9, color: P.t4, lineHeight: 1.5 }}><strong style={{ color: P.t3 }}>Strength:</strong> {e.strength}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stack table */}
      <div style={{ border: `1px solid ${P.b}`, borderRadius: 10, background: P.card, padding: "16px 18px" }}>
        <SectionLabel>Recommended Stack Snapshot</SectionLabel>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${P.gold}` }}>
                {["Layer", "Choice", "Why"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 8, fontWeight: 800, color: P.gold, textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STACK.map((s, i) => (
                <tr key={s.layer} style={{ borderBottom: `1px solid ${P.b}30`, background: i % 2 === 0 ? P.card : "transparent" }}>
                  <td style={{ padding: "8px 12px" }}><Tag color={s.color}>{s.layer}</Tag></td>
                  <td style={{ padding: "8px 12px", fontWeight: 700, color: s.color, fontSize: 10 }}>{s.choice}</td>
                  <td style={{ padding: "8px 12px", color: P.t3, fontSize: 9 }}>{s.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Infra costs */}
      <div style={{ border: `1px solid ${P.b}`, borderRadius: 10, background: P.card, padding: "16px 18px" }}>
        <SectionLabel>Modeled Monthly Infrastructure Ranges (non-quote estimates)</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {INFRA_COSTS.map(c => (
            <div key={c.env} style={{ padding: "14px 16px", border: `1px solid ${c.color}40`, borderTop: `3px solid ${c.color}`, borderRadius: 8, background: `${c.color}08` }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.env}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: P.t1, marginBottom: 6 }}>{c.range}</div>
              <div style={{ fontSize: 9, color: P.t4, lineHeight: 1.5 }}>{c.summary}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, padding: "8px 12px", background: `${P.b}40`, borderRadius: 6, fontSize: 9, color: P.t4 }}>
          Team estimate: 5–7 contributors over 16–24 weeks covering platform lead, backend (×2), frontend, automation/data, platform/SRE, and part-time security/QA.
        </div>
      </div>
    </div>
  );
}

function RoadmapTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SectionLabel color={P.t2}>Prioritized Roadmap Outcomes</SectionLabel>
      {MILESTONES_OUTCOMES.map((m, i) => (
        <div key={m.milestone} style={{ display: "flex", gap: 16, border: `1px solid ${m.color}35`, borderLeft: `5px solid ${m.color}`, background: P.card, borderRadius: 8, padding: "14px 18px", alignItems: "flex-start" }}>
          <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", background: `${m.color}20`, border: `1px solid ${m.color}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: m.color }}>{i+1}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: P.t1, marginBottom: 4 }}>{m.milestone}</div>
            <div style={{ fontSize: 10, color: P.t3, marginBottom: 6, lineHeight: 1.5 }}>{m.outcome}</div>
            <Tag color={m.color}>KPI: {m.kpi}</Tag>
          </div>
        </div>
      ))}

      {/* Security */}
      <div style={{ border: `1px solid ${P.violet}35`, borderRadius: 10, background: P.card, padding: "16px 18px", marginTop: 8 }}>
        <SectionLabel color={P.violet}>Security & Compliance Posture</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["Align SDLC with NIST SSDF", "AI-focused controls where model/AI paths included", "Generate SBOM artifacts continuously", "OWASP API risks as first-order design constraints", "Aggressive API/object/function authorization testing", "OpenTelemetry for correlated trace/metric/log telemetry"].map(item => (
            <div key={item} style={{ fontSize: 9, padding: "5px 10px", background: `${P.violet}10`, border: `1px solid ${P.violet}30`, borderRadius: 6, color: P.violet }}>
              → {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OpenQuestionsTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ padding: "12px 16px", background: `${P.amber}10`, border: `1px solid ${P.amber}35`, borderRadius: 8, fontSize: 10, color: P.t2, lineHeight: 1.6 }}>
        These questions must be resolved to finalize Round 1 scope and prevent planning drift.
      </div>
      {OPEN_QUESTIONS.map((q, i) => (
        <div key={i} style={{ display: "flex", gap: 14, border: `1px solid ${P.b}`, background: P.card, borderRadius: 8, padding: "14px 18px", alignItems: "flex-start" }}>
          <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", background: `${P.amber}15`, border: `1px solid ${P.amber}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: P.amber }}>?</div>
          <div style={{ fontSize: 11, color: P.t1, lineHeight: 1.6 }}>{q}</div>
        </div>
      ))}

      {/* ADR note */}
      <div style={{ padding: "14px 18px", border: `1px solid ${P.teal}35`, borderRadius: 8, background: `${P.teal}08`, marginTop: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: P.teal, marginBottom: 6 }}>Required Roles — Round 1</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["Platform lead", "Full-stack engineer", "Data/automation engineer", "Security analyst", "Analyst/PM"].map(role => (
            <Tag key={role} color={P.teal}>{role}</Tag>
          ))}
        </div>
      </div>
      <div style={{ padding: "14px 18px", border: `1px solid ${P.blue}35`, borderRadius: 8, background: `${P.blue}08` }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: P.blue, marginBottom: 6 }}>Decision Points</div>
        <ul style={{ paddingLeft: 16, margin: 0, fontSize: 10, color: P.t3, lineHeight: 2 }}>
          {["Keep or retire Base44 shell", "Workflow split finalization", "Canonical evidence object and approvals model"].map(d => <li key={d}>{d}</li>)}
        </ul>
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function ArchitectureAudit() {
  const [tab, setTab] = useState("Overview");

  return (
    <div style={{ ...S, padding: "24px 28px", minHeight: "100vh", color: P.t1 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 4 }}>
          PLATFORM INTELLIGENCE · ARCHITECTURE AUDIT REPORT
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: P.t1, margin: 0 }}>TruthEngine360 — Architecture Audit & Roadmap</h1>
        <p style={{ fontSize: 10, color: P.t3, marginTop: 5, lineHeight: 1.5 }}>
          Connector reconnaissance · Repo audit · 3-round migration plan · Evidence-grade target architecture
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 22, borderBottom: `1px solid ${P.b}`, paddingBottom: 12, flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "7px 16px", fontSize: 10, fontWeight: 800, letterSpacing: "0.05em",
              background: tab === t ? `${P.gold}22` : "transparent",
              border: `1px solid ${tab === t ? P.gold : P.b}`,
              color: tab === t ? P.gold : P.t3, borderRadius: 6, cursor: "pointer",
              fontFamily: "'IBM Plex Mono', monospace" }}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && <OverviewTab />}
      {tab === "Repo Audit" && <RepoAuditTab />}
      {tab === "3-Round Plan" && <ThreeRoundTab />}
      {tab === "Architecture" && <ArchTab />}
      {tab === "Roadmap" && <RoadmapTab />}
      {tab === "Open Questions" && <OpenQuestionsTab />}
      {tab === "Docs & GitHub" && <DocsGitHubTab />}
    </div>
  );
}

function DocsGitHubTab() {
  const [pushStatus, setPushStatus] = useState(null);
  const [pushing, setPushing] = useState(false);

  const DOCS = [
    {
      path: "docs/truth-engine-platform-research-report.md",
      label: "Platform Research Report",
      desc: "Consolidated architecture audit, connector reconnaissance, 3-round migration plan",
      color: P.gold,
    },
    {
      path: "docs/forensic-audit/tradecraft-reframe.md",
      label: "Tradecraft Reframe",
      desc: "Reframe 349 Rule as institutional tradecraft; seven research vectors; Conditional Citizenship as vector #6",
      color: P.red,
    },
    {
      path: "docs/forensic-audit/form-102-pipeline.md",
      label: "Form 102 Pipeline",
      desc: "Selective Service Form 102 retrieval at NARA-St. Louis; IV-C mechanism; A-File Phase II expansion",
      color: P.blue,
    },
  ];

  async function pushToGitHub() {
    setPushing(true);
    setPushStatus(null);
    const res = await base44.functions.invoke("pushDocsToGitHub", {});
    setPushStatus(res.data);
    setPushing(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Docs manifest */}
      <div style={{ border: `1px solid ${P.b}`, borderRadius: 10, background: P.card, padding: "16px 18px" }}>
        <SectionLabel>Forensic Research Documents</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {DOCS.map(doc => (
            <div key={doc.path} style={{ display: "flex", gap: 14, alignItems: "flex-start",
              padding: "12px 14px", border: `1px solid ${doc.color}30`, borderLeft: `4px solid ${doc.color}`,
              borderRadius: 8, background: `${doc.color}06` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: doc.color, marginBottom: 2 }}>{doc.label}</div>
                <div style={{ fontSize: 9, color: P.t4, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>{doc.path}</div>
                <div style={{ fontSize: 9, color: P.t3, lineHeight: 1.5 }}>{doc.desc}</div>
              </div>
              <Tag color={doc.color}>Ready</Tag>
            </div>
          ))}
        </div>
      </div>

      {/* README fix note */}
      <div style={{ padding: "14px 18px", border: `1px solid ${P.amber}35`, borderLeft: `4px solid ${P.amber}`,
        background: `${P.amber}08`, borderRadius: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: P.amber, marginBottom: 6 }}>README Fix Required</div>
        <div style={{ fontSize: 9, color: P.t2, lineHeight: 1.8 }}>
          The bare duplicate path references below the bullet in the README Architecture Research section should be removed.
          Correct form:
        </div>
        <pre style={{ fontSize: 8, color: P.teal, background: "#080D18", borderRadius: 6, padding: "10px 12px",
          marginTop: 8, whiteSpace: "pre-wrap", fontFamily: "'IBM Plex Mono', monospace" }}>
{`## Architecture Research

A consolidated platform assessment and migration proposal is available at:

- [\`docs/truth-engine-platform-research-report.md\`](docs/truth-engine-platform-research-report.md)`}
        </pre>
        <div style={{ fontSize: 8, color: P.t4, marginTop: 6 }}>One bullet, one relative link — remove the two bare duplicate path lines below it.</div>
      </div>

      {/* Commit plan */}
      <div style={{ padding: "14px 18px", border: `1px solid ${P.teal}35`, borderRadius: 8, background: `${P.teal}08` }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: P.teal, marginBottom: 10 }}>Commit Plan — forensic audit research baseline</div>
        <div style={{ fontSize: 9, color: P.t3, lineHeight: 1.8, fontFamily: "'IBM Plex Mono', monospace" }}>
          <div style={{ color: P.t2 }}>Files in this commit:</div>
          <div style={{ marginTop: 6, paddingLeft: 12 }}>
            {[
              "docs/truth-engine-platform-research-report.md",
              "docs/forensic-audit/tradecraft-reframe.md",
              "docs/forensic-audit/form-102-pipeline.md",
            ].map(f => <div key={f} style={{ color: P.teal, marginBottom: 2 }}>+ {f}</div>)}
          </div>
          <div style={{ marginTop: 10, color: P.t2 }}>Commit message:</div>
          <pre style={{ fontSize: 8, color: P.gold, background: "#080D18", borderRadius: 6, padding: "8px 12px",
            marginTop: 6, whiteSpace: "pre-wrap" }}>
{`Add forensic audit research baseline

- forensic-audit/tradecraft-reframe.md: Reframe 349 Rule as institutional
  tradecraft; map seven research vectors as evidence; propose Conditional
  Citizenship as signature #6.
- forensic-audit/form-102-pipeline.md: Operationalize Selective Service
  Form 102 retrieval at NARA-St. Louis; integrate IV-C statutory
  mechanism, parallel test case, and A-File Phase II expansion.`}
          </pre>
        </div>
      </div>

      {/* Push button */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={pushToGitHub} disabled={pushing}
          style={{ padding: "10px 24px", background: pushing ? P.b : `linear-gradient(135deg,${P.teal},${P.blue})`,
            color: pushing ? P.t4 : "#fff", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 800,
            cursor: pushing ? "not-allowed" : "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>
          {pushing ? "⟳ Pushing to GitHub..." : "🚀 Push Docs to GitHub (Truthengine360)"}
        </button>
        <div style={{ fontSize: 8, color: P.t4 }}>Uses GitHub connector · "Truthengine360" account · branch: main</div>
      </div>

      {/* Push result */}
      {pushStatus && (
        <div style={{ padding: "14px 18px", border: `1px solid ${pushStatus.success ? P.teal : P.red}35`,
          background: `${pushStatus.success ? P.teal : P.red}08`, borderRadius: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: pushStatus.success ? P.teal : P.red, marginBottom: 8 }}>
            {pushStatus.success ? "✓ Push Complete" : "✗ Push Failed"}
          </div>
          {pushStatus.results?.map((r, i) => (
            <div key={i} style={{ fontSize: 9, color: P.t3, marginBottom: 4, display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: r.githubStatus === 201 || r.githubStatus === 200 ? P.teal : P.red }}>
                {r.githubStatus === 201 ? "✓ created" : r.githubStatus === 200 ? "✓ updated" : `✗ ${r.status}`}
              </span>
              <span style={{ color: P.t2, fontFamily: "'IBM Plex Mono', monospace" }}>{r.path}</span>
              {r.commitSha && <span style={{ color: P.t4 }}>{r.commitSha.slice(0, 8)}</span>}
            </div>
          ))}
          {pushStatus.error && <div style={{ fontSize: 9, color: P.red }}>{pushStatus.error}</div>}
        </div>
      )}
    </div>
  );
}