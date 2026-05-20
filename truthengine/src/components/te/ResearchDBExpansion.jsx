import { useState } from "react";
import { P } from "../../lib/teData";

const PRIORITY_APIS = [
  { source: "Data.gov CKAN", country: "U.S.", connector: "Catalog metadata API", why: "Discovery spine for federal datasets", priority: "High" },
  { source: "NARA Catalog API", country: "U.S.", connector: "Official API", why: "Archival metadata, authorities, digitized records", priority: "High" },
  { source: "Library of Congress JSON API", country: "U.S.", connector: "Official API", why: "Collections, items, searches, media metadata", priority: "High" },
  { source: "Congress.gov API", country: "U.S.", connector: "Official API", why: "Bills, hearings, committee reports", priority: "High" },
  { source: "Census API", country: "U.S.", connector: "Official API", why: "Demographics and geography baselines", priority: "High" },
  { source: "OpenAlex API", country: "Global", connector: "REST API", why: "Open scholarly works, authors, institutions", priority: "High" },
  { source: "DPLA API", country: "U.S.", connector: "Official API", why: "Aggregated digital library collections", priority: "Medium" },
  { source: "Europeana REST API", country: "EU", connector: "Official API", why: "European cultural heritage cross-reference", priority: "Medium" },
  { source: "INEGI API", country: "Mexico", connector: "Official API", why: "Mexican census, mortality, vital statistics", priority: "High" },
  { source: "Mexico Datos Abiertos", country: "Mexico", connector: "CKAN catalog", why: "Federal open data portal for Mexico", priority: "Medium" },
];

const MORTALITY_OBITUARIES = [
  { region: "Los Angeles", sourceClass: "Medical examiner + county death records + library obituary guides", note: "Use LA County Medical Examiner case search and library obituary/vital-record guides." },
  { region: "El Paso", sourceClass: "Medical examiner + county clerk death indexes", note: "Pair county ME resources with clerk index/search workflows." },
  { region: "Nogales / Santa Cruz-Pima corridor", sourceClass: "Medical examiner coverage + Arizona obituary/library sources + Sonora civil registry", note: "Use Pima County coverage for Santa Cruz County plus Sonora defunción workflows." },
  { region: "Mexicali / Tijuana", sourceClass: "SEMEFO + Registro Civil + hemeroteca/newspaper archives", note: "Use Baja California forensic/civil registry plus archive layers." },
  { region: "National / research", sourceClass: "Military obituaries + genealogy indexes + library obituary guides", note: "Use for triangulation, never as sole proof." },
];

const RISK_GOVERNANCE = [
  { area: "PTSD / symptom detection", rule: "Do not infer diagnosis or symptoms from social media or public traces." },
  { area: "Social media", rule: "Aggregate discourse only; no private groups, DMs, or person-level trauma profiling." },
  { area: "Shelters / refugee centers", rule: "Track organization/program data, not residents." },
  { area: "Restraining orders", rule: "Treat as fragmented jurisdictional data; manual review or metadata-only." },
  { area: "Sex-offender registries", rule: "Narrow public-reference use only; no stigmatizing bulk joins." },
];

const SOUTHWEST_GEOGRAPHY = [
  { geography: "Los Angeles County", phase1: true, rationale: "Large Hispanic population, strong ME and library obituary infrastructure." },
  { geography: "El Paso County", phase1: true, rationale: "Border county with county-level ME and death-index pathways." },
  { geography: "Nogales / Santa Cruz County AZ", phase1: true, rationale: "Cross-border relevance; pair with Sonora civil-registry workflows." },
  { geography: "Tijuana", phase1: true, rationale: "Border-region forensic and shelter-organization relevance." },
  { geography: "Mexicali", phase1: true, rationale: "SEMEFO and Baja California state-system relevance." },
];

const TRAUMA_EVIDENCE = [
  { field: "Combat exposure evidence", use: true, note: "Document from service records, awards, unit histories, sworn statements." },
  { field: "Clinician-authored PTSD diagnosis", use: true, note: "Only if lawfully obtained and permissioned." },
  { field: "VA disability / service-connected reference", use: true, note: "Track as documented evidence, not inference." },
  { field: "Social-media behavior or code-switching", use: false, note: "Not valid for diagnosis or symptom detection." },
  { field: "Housing instability / job loss", use: false, note: "Too nonspecific for diagnosis; use only as social-context metadata." },
];

const DASHBOARD_METRICS = [
  { metric: "Target source families", value: "10+" },
  { metric: "Priority machine-readable sources", value: "10 APIs" },
  { metric: "Mortality / obituary target families", value: "5 regions" },
  { metric: "Southwest Phase 1 geographies", value: "5 jurisdictions" },
  { metric: "Risk governance rules", value: "5 active rules" },
  { metric: "Trauma evidence fields", value: "5 (3 allowed, 2 prohibited)" },
];

const TABS = [
  { id: "dashboard", label: "📊 Dashboard", icon: "📊" },
  { id: "apis", label: "🔌 Priority APIs", icon: "🔌" },
  { id: "mortality", label: "⚰️ Mortality/Obituaries", icon: "⚰️" },
  { id: "governance", label: "⚖️ Risk Governance", icon: "⚖️" },
  { id: "geography", label: "🗺️ SW Geography", icon: "🗺️" },
  { id: "trauma", label: "🧠 Trauma Evidence", icon: "🧠" },
];

const priorityColor = (p) => p === "High" ? P.red : p === "Medium" ? P.amber : P.teal;

export default function ResearchDBExpansion() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1, height: "100%" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${P.violet}15,${P.blue}10)`, border: `1px solid ${P.violet}30`, borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P.violet, marginBottom: 2 }}>📂 Research Database Expansion Dashboard</div>
        <div style={{ fontSize: 8, color: P.t4 }}>Planning workbook: source growth, mortality/obituary coverage, and governance · Imported from Excel</div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14, background: "#050810", padding: "8px 10px", borderRadius: 8, border: `1px solid ${P.b}` }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              padding: "6px 12px", fontSize: 9, fontWeight: activeTab === t.id ? 800 : 600,
              background: activeTab === t.id ? `${P.violet}20` : "transparent",
              border: `1px solid ${activeTab === t.id ? P.violet : P.b}`,
              color: activeTab === t.id ? P.violet : P.t4,
              borderRadius: 20, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace",
              transition: "all .12s", whiteSpace: "nowrap",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD TAB ── */}
      {activeTab === "dashboard" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10, marginBottom: 16 }}>
            {DASHBOARD_METRICS.map((m, i) => (
              <div key={i} style={{ background: P.card, border: `1px solid ${P.violet}25`, borderLeft: `4px solid ${P.violet}`, borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 7, color: P.t4, marginBottom: 6, letterSpacing: 1 }}>{m.metric.toUpperCase()}</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 800, color: P.violet }}>{m.value}</div>
              </div>
            ))}
          </div>
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 10 }}>📋 Workbook Summary</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "10 Priority APIs", desc: "Federal + Mexico open data endpoints indexed for machine-readable access", color: P.blue },
                { label: "5-Region Mortality Coverage", desc: "LA, El Paso, Nogales, Tijuana/Mexicali, and national military obituary workflows", color: P.red },
                { label: "5 Governance Rules", desc: "Ethics guardrails for PTSD detection, social media, shelters, and registries", color: P.amber },
                { label: "5 Phase 1 Geographies", desc: "Southwest focus zone — all with border-region forensic and ME infrastructure", color: P.teal },
                { label: "Trauma Evidence Framework", desc: "3 permissible fields (service records, clinician diagnosis, VA ref) · 2 prohibited", color: P.violet },
                { label: "Source Growth Planning", desc: "Phased expansion from federal APIs → state/county ME → cross-border civil registry", color: P.gold },
              ].map((item, i) => (
                <div key={i} style={{ background: "#080D18", border: `1px solid ${item.color}20`, borderLeft: `3px solid ${item.color}`, borderRadius: 7, padding: "10px 12px" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: item.color, marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontSize: 7, color: P.t3, lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PRIORITY APIs TAB ── */}
      {activeTab === "apis" && (
        <div>
          <div style={{ marginBottom: 10 }}>
            <input
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search APIs..."
              style={{ width: "100%", padding: "7px 12px", background: "#080D18", border: `1px solid ${P.b}`, borderRadius: 6, color: P.t1, fontSize: 9, fontFamily: "'IBM Plex Mono',monospace", outline: "none" }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 8 }}>
            {PRIORITY_APIS.filter(a =>
              !searchTerm || a.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
              a.why.toLowerCase().includes(searchTerm.toLowerCase()) ||
              a.country.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((api, i) => (
              <div key={i} style={{ background: P.card, border: `1px solid ${priorityColor(api.priority)}25`, borderLeft: `4px solid ${priorityColor(api.priority)}`, borderRadius: 8, padding: "11px 13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: P.t1 }}>{api.source}</div>
                  <span style={{ fontSize: 7, background: `${priorityColor(api.priority)}18`, color: priorityColor(api.priority), border: `1px solid ${priorityColor(api.priority)}30`, borderRadius: 20, padding: "2px 8px", fontWeight: 700, flexShrink: 0 }}>{api.priority}</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 7, background: `${P.blue}12`, color: P.blue, borderRadius: 4, padding: "1px 6px" }}>🌍 {api.country}</span>
                  <span style={{ fontSize: 7, background: `${P.teal}12`, color: P.teal, borderRadius: 4, padding: "1px 6px" }}>🔌 {api.connector}</span>
                </div>
                <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.5 }}>{api.why}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, padding: "8px 12px", background: `${P.blue}08`, border: `1px solid ${P.blue}20`, borderRadius: 7, fontSize: 7, color: P.t4 }}>
            Total: {PRIORITY_APIS.length} APIs · High Priority: {PRIORITY_APIS.filter(a => a.priority === "High").length} · Medium: {PRIORITY_APIS.filter(a => a.priority === "Medium").length}
          </div>
        </div>
      )}

      {/* ── MORTALITY / OBITUARIES TAB ── */}
      {activeTab === "mortality" && (
        <div>
          <div style={{ background: `${P.red}08`, border: `1px solid ${P.red}25`, borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 7, color: P.t3 }}>
            ⚠️ All mortality/obituary sources are used for triangulation only — never as sole proof of identity or casualty status.
          </div>
          {MORTALITY_OBITUARIES.map((m, i) => (
            <div key={i} style={{ background: P.card, border: `1px solid ${P.b}`, borderLeft: `4px solid ${P.red}`, borderRadius: 8, padding: "12px 14px", marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: P.red, marginBottom: 5 }}>📍 {m.region}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                {m.sourceClass.split(" + ").map((s, j) => (
                  <span key={j} style={{ fontSize: 7, background: `${P.violet}12`, color: P.violet, border: `1px solid ${P.violet}25`, borderRadius: 4, padding: "2px 6px" }}>{s.trim()}</span>
                ))}
              </div>
              <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.5, borderTop: `1px solid ${P.b}`, paddingTop: 6 }}>📝 {m.note}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── RISK GOVERNANCE TAB ── */}
      {activeTab === "governance" && (
        <div>
          <div style={{ background: `${P.amber}08`, border: `1px solid ${P.amber}25`, borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 7, color: P.t3 }}>
            ⚖️ These governance rules are mandatory and non-negotiable for all data operations. Violations constitute ethical breaches.
          </div>
          {RISK_GOVERNANCE.map((r, i) => (
            <div key={i} style={{ background: P.card, border: `1px solid ${P.amber}25`, borderLeft: `4px solid ${P.amber}`, borderRadius: 8, padding: "12px 14px", marginBottom: 8, display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ background: `${P.amber}18`, border: `1px solid ${P.amber}30`, borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: P.amber, flexShrink: 0 }}>{i + 1}</div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: P.amber, marginBottom: 4 }}>{r.area}</div>
                <div style={{ fontSize: 9, color: P.t2, lineHeight: 1.6 }}>🚫 {r.rule}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── SOUTHWEST GEOGRAPHY TAB ── */}
      {activeTab === "geography" && (
        <div>
          <div style={{ background: `${P.teal}08`, border: `1px solid ${P.teal}25`, borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 7, color: P.t3 }}>
            🗺️ Phase 1 Southwest geographic focus — all 5 jurisdictions selected for border-region forensic and civil registry infrastructure.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 10 }}>
            {SOUTHWEST_GEOGRAPHY.map((g, i) => (
              <div key={i} style={{ background: P.card, border: `1px solid ${g.phase1 ? P.teal : P.b}30`, borderTop: `3px solid ${g.phase1 ? P.teal : P.b}`, borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: P.t1 }}>📍 {g.geography}</div>
                  {g.phase1 && <span style={{ fontSize: 7, background: `${P.teal}15`, color: P.teal, border: `1px solid ${P.teal}30`, borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>Phase 1 ✓</span>}
                </div>
                <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.5 }}>{g.rationale}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TRAUMA EVIDENCE TAB ── */}
      {activeTab === "trauma" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            <div style={{ background: `${P.teal}08`, border: `1px solid ${P.teal}25`, borderRadius: 8, padding: "8px 12px", fontSize: 7, color: P.teal, fontWeight: 700 }}>
              ✅ PERMISSIBLE — {TRAUMA_EVIDENCE.filter(f => f.use).length} fields allowed (lawful, documented, permissioned only)
            </div>
            <div style={{ background: `${P.red}08`, border: `1px solid ${P.red}25`, borderRadius: 8, padding: "8px 12px", fontSize: 7, color: P.red, fontWeight: 700 }}>
              🚫 PROHIBITED — {TRAUMA_EVIDENCE.filter(f => !f.use).length} fields excluded (too nonspecific or ethically prohibited)
            </div>
          </div>
          {TRAUMA_EVIDENCE.map((f, i) => (
            <div key={i} style={{ background: P.card, border: `1px solid ${f.use ? P.teal : P.red}25`, borderLeft: `4px solid ${f.use ? P.teal : P.red}`, borderRadius: 8, padding: "12px 14px", marginBottom: 8, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ fontSize: 18, flexShrink: 0 }}>{f.use ? "✅" : "🚫"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: f.use ? P.teal : P.red, marginBottom: 4 }}>{f.field}</div>
                <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.5 }}>{f.note}</div>
              </div>
              <span style={{ fontSize: 7, background: `${f.use ? P.teal : P.red}12`, color: f.use ? P.teal : P.red, border: `1px solid ${f.use ? P.teal : P.red}25`, borderRadius: 20, padding: "2px 8px", fontWeight: 700, flexShrink: 0 }}>
                {f.use ? "ALLOWED" : "BLOCKED"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}