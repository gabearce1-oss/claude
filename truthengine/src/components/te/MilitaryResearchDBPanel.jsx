import { useState } from "react";
import { InvokeLLM } from "@base44/sdk/modules/ai.js";
import { P } from "../../lib/teData";

// Architecture v3.0 Source Priority Tiers — customized for DCAS Vietnam-era forensic mission
const SOURCES = [
  // CRITICAL
  { id: "S-001", name: "NARA Catalog API", priority: "CRITICAL", sector: "Military Archives", country: "US",
    url: "https://catalog.archives.gov/api/v1", api: "REST — Free", depth: "DCAS VN08, RG319, RG407, Form 102 SSS",
    query_playbook: ["\"DCAS\" AND \"Vietnam\" AND Hispanic", "\"Selective Service\" AND \"Form 102\" AND \"non-citizen\"", "\"RG319\" AND \"Vietnam\" AND \"casualty\""],
    status: "Active", bisg_relevance: "High", foia_required: false,
    note: "Primary source for DCAS microfilm, Selective Service Form 102, RG319/RG407 combat records." },
  { id: "S-002", name: "Congress.gov API", priority: "CRITICAL", sector: "Congressional Records", country: "US",
    url: "https://api.congress.gov/v3/", api: "REST — API key required", depth: "CHC hearings, Noem testimony, veteran deportation bills",
    query_playbook: ["\"deported veteran\" AND \"military service\"", "\"Noem\" AND \"veteran removals\"", "\"Ralph Guzman\" AND casualty AND Vietnam"],
    status: "Active", bisg_relevance: "Medium", foia_required: false,
    note: "Noem contradiction anchor. CHC Exhibit A. Congressional oversight records." },
  { id: "S-003", name: "FOIA.gov API", priority: "CRITICAL", sector: "FOIA Tracking", country: "US",
    url: "https://www.foia.gov", api: "REST — Free", depth: "Agency FOIA status tracking, response queue",
    query_playbook: ["Agency: VA — BIRLS Hispanic Vietnam KIA", "Agency: DHS — ENFORCE non-citizen veteran removals"],
    status: "Active", bisg_relevance: "Low", foia_required: false,
    note: "Statutory deadline tracking. 3 FOIAs currently OVERDUE: VA BIRLS (+81d), DHS ENFORCE (+81d), INAI (+53d)." },
  { id: "S-004", name: "VA BIRLS (FOIA)", priority: "CRITICAL", sector: "Veteran Benefits", country: "US",
    url: "https://www.va.gov", api: "FOIA — 5 U.S.C. §552", depth: "Veteran benefit records, death file, race/ethnicity codes",
    query_playbook: ["BIRLS death file — Hispanic Vietnam KIA", "VA race code NH cross-ref Spanish surname"],
    status: "OVERDUE +81d", bisg_relevance: "High", foia_required: true,
    note: "FOIA overdue. VA BIRLS death file: racial coding cross-reference to DCAS anomalies." },
  { id: "S-005", name: "DHS ENFORCE (FOIA)", priority: "CRITICAL", sector: "Deportation Records", country: "US",
    url: "https://www.ice.gov", api: "FOIA — 5 U.S.C. §552", depth: "ICE removal database, ERO records, service-record flags",
    query_playbook: ["Non-citizen veteran removal records", "Vietnam-era military service flag in ENFORCE"],
    status: "OVERDUE +81d", bisg_relevance: "High", foia_required: true,
    note: "FOIA overdue. Primary source for Noem contradiction. MNV-02 deportation record confirmed partial." },

  // HIGH
  { id: "S-006", name: "Library of Congress / Chronicling America", priority: "HIGH", sector: "Historical Press", country: "US",
    url: "https://chroniclingamerica.loc.gov", api: "REST — Free, no key", depth: "Chicano Moratorium press, Spanish-language Vietnam-era news",
    query_playbook: ["\"baja por muerte\" AND Vietnam", "\"soldado mexicano\" AND Vietnam", "\"Moratorium\" AND \"bajas\""],
    status: "Active", bisg_relevance: "Medium", foia_required: false,
    note: "Spanish-language press 1965–1975. OCR clustering for obituary entity extraction. Moratorium coverage." },
  { id: "S-007", name: "ICE ERO Data", priority: "HIGH", sector: "Deportation Records", country: "US",
    url: "https://www.ice.gov/foia", api: "FOIA + public releases", depth: "Removal statistics, service flags, country of birth breakdowns",
    query_playbook: ["Veteran removal statistics by country of origin", "Mexico-born removal Vietnam service era"],
    status: "Pending", bisg_relevance: "High", foia_required: true,
    note: "Needed for Casa de Apoyo registry cross-reference. Supports MNV-02 and MNV-05 deportation claims." },
  { id: "S-008", name: "USCIS Genealogy API", priority: "HIGH", sector: "Naturalization Records", country: "US",
    url: "https://www.uscis.gov/genealogy", api: "Free — application approval", depth: "N-400, A-files, naturalization grants under INA §329",
    query_playbook: ["INA §329 military naturalization Vietnam era", "Non-citizen draftee naturalization records"],
    status: "Active", bisg_relevance: "High", foia_required: false,
    note: "INA §329 grants citizenship to non-citizens serving in wartime. Cross-reference denied applications." },
  { id: "S-009", name: "DMDC / DoD Personnel", priority: "HIGH", sector: "Military Personnel", country: "US",
    url: "https://www.dmdc.osd.mil", api: "Public query tool", depth: "Military service verification, discharge status",
    query_playbook: ["Vietnam-era service verification by SSN/name", "DD-214 equivalent discharge record query"],
    status: "Active", bisg_relevance: "Medium", foia_required: false,
    note: "Service verification for deported veteran claims. Needed to confirm Vietnam-era duty for MNV cases." },
  { id: "S-010", name: "SSA Death Master File", priority: "HIGH", sector: "Death Records", country: "US",
    url: "https://www.ssa.gov/dataexchange/", api: "Public subset", depth: "Death record cross-reference for KIA validation",
    query_playbook: ["Surname cluster death cross-reference 1966–1973", "Non-citizen SSN death record Vietnam"],
    status: "Active", bisg_relevance: "Medium", foia_required: false,
    note: "Supports casualty misclassification claims via independent death confirmation." },
  { id: "S-011", name: "Harvard Dataverse (APSR)", priority: "HIGH", sector: "Research Archive", country: "US",
    url: "https://doi.org/10.7910/DVN/O80SKQ", api: "Free — DOI", depth: "Cambridge APSR replication archive — Chicano Vietnam casualty study",
    query_playbook: ["APSR replication dataset Chicano Vietnam", "Capture-recapture casualty estimate Mexico-born"],
    status: "Active", bisg_relevance: "High", foia_required: false,
    note: "FSRDC microdata pending. Harvard Dataverse replication archive supports CLM-0005 ~500 estimate." },

  // MEDIUM
  { id: "S-012", name: "INAI Mexico (FOIA)", priority: "MEDIUM", sector: "Mexico Government", country: "MX",
    url: "https://home.inai.org.mx", api: "FOIA — Mexico transparency law", depth: "Mexican government veteran non-recognition, SRE bilateral",
    query_playbook: ["veteranos deportados reconocimiento gobierno Mexico", "servicio militar extranjeros Vietnam"],
    status: "OVERDUE +53d", bisg_relevance: "High", foia_required: true,
    note: "FOIA overdue. SRE bilateral negotiation anchor. Mexican-national KIA non-recognition documentation." },
  { id: "S-013", name: "Archivo General de la Nación", priority: "MEDIUM", sector: "Mexico Archives", country: "MX",
    url: "https://www.gob.mx/agn", api: "Manual / outreach", depth: "Mexican birth records, migration history, conscription records",
    query_playbook: ["actas de nacimiento veteranos Vietnam", "migrantes documentados 1950-1970"],
    status: "Pending", bisg_relevance: "High", foia_required: false,
    note: "Birth certificate cross-reference for home-of-record claims. Essential for Mexican-national KIA cases." },
  { id: "S-014", name: "INEGI", priority: "MEDIUM", sector: "Mexico Statistics", country: "MX",
    url: "https://www.inegi.org.mx", api: "REST — Free", depth: "Mexican demographic data, surname frequency, geographic distribution",
    query_playbook: ["frecuencia apellidos Mexico", "distribución demografica 1940-1970"],
    status: "Active", bisg_relevance: "High", foia_required: false,
    note: "BISG geographic adjustment data for Mexican-origin surnames. Supports geo scoring component." },
  { id: "S-015", name: "Casa de Apoyo Registry (Tijuana)", priority: "MEDIUM", sector: "NGO Registry", country: "MX",
    url: "https://casademigrante.org", api: "Manual / outreach", depth: "~200 deported veterans registered. Director: Héctor Barajas",
    query_playbook: ["deported veteran registry Tijuana", "Vietnam-era service confirmed registry"],
    status: "Active", bisg_relevance: "Medium", foia_required: false,
    note: "Primary NGO registry for deported veterans. ~200 registered. Key for deportation_event claims." },
  { id: "S-016", name: "COLEF Datasets", priority: "MEDIUM", sector: "Research", country: "MX",
    url: "https://www.colef.mx", api: "Open access", depth: "Border migration, demographic data — Mexico-US",
    query_playbook: ["veteranos deportados estadísticas", "migrantes militares datos frontera"],
    status: "Active", bisg_relevance: "Medium", foia_required: false,
    note: "Cross-border demographic data supporting capture-recapture estimates." },
  { id: "S-017", name: "UNAM SUDIMER", priority: "MEDIUM", sector: "Research", country: "MX",
    url: "https://www.unam.mx", api: "Open access", depth: "Mexican diaspora, migration scholarship",
    query_playbook: ["mexicanos fallecidos Vietnam servicio militar", "diáspora mexicana reclutamiento"],
    status: "Active", bisg_relevance: "Medium", foia_required: false,
    note: "Academic source for Mexican diaspora military service historical scholarship." },
  { id: "S-018", name: "Defense Technical Information Center", priority: "MEDIUM", sector: "Military Archives", country: "US",
    url: "https://discover.dtic.mil", api: "Public search", depth: "Defense research, casualty analysis systems",
    query_playbook: ["DCAS casualty analysis system documentation", "Vietnam era demographic coding military"],
    status: "Active", bisg_relevance: "Medium", foia_required: false,
    note: "Technical documentation for DCAS coding schema and demographic field definitions." },

  // LOW
  { id: "S-019", name: "OpenSanctions", priority: "LOW", sector: "OSINT", country: "INT",
    url: "https://www.opensanctions.org", api: "Free tier", depth: "Entity resolution, government officials, agency principals",
    query_playbook: ["DHS principals contradiction", "agency officials congressional testimony"],
    status: "Active", bisg_relevance: "Low", foia_required: false,
    note: "Entity resolution for agency officials. Noem contradiction accountability chain." },
  { id: "S-020", name: "Wikidata SPARQL", priority: "LOW", sector: "OSINT", country: "INT",
    url: "https://query.wikidata.org", api: "Free — SPARQL", depth: "Named entity lookup, disambiguation",
    query_playbook: ["Vietnam veteran Hispanic disambiguation", "Mexican-American military casualties named entity"],
    status: "Active", bisg_relevance: "Low", foia_required: false,
    note: "Named entity disambiguation for case subjects. Supplements surname-based BISG scoring." },
];

const PRIORITY_COLORS = { CRITICAL: P.red, HIGH: P.gold, MEDIUM: P.teal, LOW: P.t3 };
const COUNTRY_LABELS  = { US: "🇺🇸 US", MX: "🇲🇽 MX", INT: "🌐 INT" };

const STACK = [
  { tech: "PostgreSQL + pgvector", role: "Relational core", why: "GIN indexes for JSONB metadata, tsvector for OCR text, vector column for BISG embeddings", status: "Recommended" },
  { tech: "Neo4j",                 role: "Graph layer",     why: "Person ↔ Case ↔ Agency ↔ Record ↔ Event — investigation-native property graph", status: "Recommended" },
  { tech: "OpenSearch",            role: "Lexical search",  why: "Surname search, archive facets, FOIA queue dashboards with analytics", status: "Recommended" },
  { tech: "Qdrant",                role: "Semantic search", why: "BISG surname vector similarity, behavioral vector retrieval", status: "Recommended" },
  { tech: "Apache Airflow",        role: "Orchestration",   why: "DAGs for NARA, Congress.gov, FOIA.gov, PostgreSQL, Neo4j, n8n providers", status: "Recommended" },
  { tech: "FastAPI",               role: "API surface",     why: "Async, Pydantic data contracts, evidence + claim + FOIA endpoints", status: "Recommended" },
  { tech: "Tesseract OCR",         role: "Document OCR",    why: "Military microfilm scanning — DCAS-era records expect 60–75% confidence", status: "Phase 2" },
  { tech: "Whisper",               role: "Audio → text",    why: "Oral history transcription (Casa de Apoyo, veteran testimony recordings)", status: "Phase 2" },
  { tech: "LangChain",             role: "LLM pipelines",   why: "Ingestion pipelines for entity extraction and contamination screening", status: "Phase 2" },
  { tech: "FAISS / pgvector HNSW", role: "Vector index",    why: "BISG embedding HNSW index for fast semantic surname similarity queries", status: "Phase 2" },
  { tech: "Auth0",                 role: "Auth / RBAC",     why: "Roles: analyst, reviewer, admin, chc_partner, usc_doctoral, public_viewer", status: "Required" },
  { tech: "S3 / MinIO",            role: "Object storage",  why: "Immutable originals: DCAS PDFs, NARA scans, Form 102s, ICE records. Versioning required.", status: "Required" },
];

export default function MilitaryResearchDBPanel() {
  const [activeTab, setActiveTab] = useState("sources");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterSector, setFilterSector]     = useState("all");
  const [filterCountry, setFilterCountry]   = useState("all");
  const [selected, setSelected]             = useState(null);
  const [queryResult, setQueryResult]       = useState("");
  const [queryLoading, setQueryLoading]     = useState(false);
  const [activeQuery, setActiveQuery]       = useState("");

  const sectors   = ["all", ...new Set(SOURCES.map(s => s.sector))];
  const countries = ["all", "US", "MX", "INT"];

  const filtered = SOURCES.filter(s =>
    (filterPriority === "all" || s.priority === filterPriority) &&
    (filterSector   === "all" || s.sector   === filterSector) &&
    (filterCountry  === "all" || s.country  === filterCountry)
  );

  const runQuery = async (source, query) => {
    setActiveQuery(query); setQueryLoading(true); setQueryResult("");
    try {
      const res = await InvokeLLM({
        prompt: `Military research query for TruthEngine360:

Source: ${source.name}
API: ${source.api}
Research depth: ${source.depth}
Query: "${query}"

Context: Vietnam-era Hispanic casualty classification audit. DCAS official count: 349 Hispanic (0.60% of 58,220 total). BISG τ=0.40 estimate: 2,309 Hispanic. Classification failure: 84.9%.

Describe: (1) what this query would likely surface from ${source.name}, (2) how the results would link to DCAS anomaly cases or deported veteran claims, (3) specific record types or fields to extract, (4) BISG scoring applicability.`,
        system_prompt: "You are a forensic military research assistant for TruthEngine360. All research targets the DCAS Vietnam-era Hispanic casualty classification audit and deported veteran registry. Anchor: 349 official / 2,309 BISG / 84.9% failure. classification_anomaly_flag=true is a forensic signal, not contamination. Be specific about data fields and provenance. 150 words max.",
        add_context_from_previous_messages: false,
      });
      setQueryResult(res);
    } catch (e) {
      setQueryResult(`Query error: ${e.message}`);
    }
    setQueryLoading(false);
  };

  const tabs = ["sources", "stack", "playbook", "ingest"];
  const Chip = ({ label, active, onClick, color }) => (
    <button onClick={onClick} style={{
      padding: "3px 10px", borderRadius: 4, fontSize: 11, fontFamily: "'IBM Plex Mono',monospace",
      border: `1px solid ${active ? (color ?? P.gold) : P.b}`,
      background: active ? `${color ?? P.gold}22` : "transparent",
      color: active ? (color ?? P.gold) : P.t3, cursor: "pointer",
    }}>{label}</button>
  );

  return (
    <div style={{ background: P.bg, minHeight: "100%", color: P.t1 }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${P.b}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: P.gold, letterSpacing: 1 }}>MILITARY RESEARCH DATABASE</div>
          <div style={{ fontSize: 11, color: P.t3, marginTop: 2 }}>
            DCAS Forensic Mission · Vietnam-Era · Architecture v3.0 · {SOURCES.length} sources indexed
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { p: "CRITICAL", n: SOURCES.filter(s=>s.priority==="CRITICAL").length },
            { p: "HIGH",     n: SOURCES.filter(s=>s.priority==="HIGH").length },
            { p: "MEDIUM",   n: SOURCES.filter(s=>s.priority==="MEDIUM").length },
          ].map(({ p, n }) => (
            <div key={p} style={{ background: `${PRIORITY_COLORS[p]}22`, border: `1px solid ${PRIORITY_COLORS[p]}44`, borderRadius: 6, padding: "6px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: PRIORITY_COLORS[p] }}>{p}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: PRIORITY_COLORS[p] }}>{n}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, padding: "10px 20px", borderBottom: `1px solid ${P.b}22` }}>
        {[
          { id: "sources",  label: "Source Registry" },
          { id: "stack",    label: "Tech Stack" },
          { id: "playbook", label: "Query Playbook" },
          { id: "ingest",   label: "Ingest Flow" },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "5px 14px", fontSize: 12, fontFamily: "'IBM Plex Mono',monospace",
            borderRadius: 4, border: `1px solid ${activeTab === t.id ? P.gold : P.b}`,
            background: activeTab === t.id ? `${P.gold}22` : "transparent",
            color: activeTab === t.id ? P.gold : P.t3, cursor: "pointer",
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: "16px 20px" }}>

        {/* SOURCE REGISTRY TAB */}
        {activeTab === "sources" && (
          <div>
            {/* Filters */}
            <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: P.t3 }}>PRIORITY:</span>
                {["all", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map(p => (
                  <Chip key={p} label={p} active={filterPriority === p} color={PRIORITY_COLORS[p] ?? P.t2} onClick={() => setFilterPriority(p)} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: P.t3 }}>COUNTRY:</span>
                {countries.map(c => (
                  <Chip key={c} label={c.toUpperCase()} active={filterCountry === c} onClick={() => setFilterCountry(c)} />
                ))}
              </div>
            </div>

            {/* FOIA overdue alert */}
            <div style={{ background: `${P.red}11`, border: `1px solid ${P.red}44`, borderRadius: 8, padding: "10px 16px", marginBottom: 14, display: "flex", gap: 16, flexWrap: "wrap" }}>
              <span style={{ color: P.red, fontWeight: 700, fontSize: 12 }}>⚠ STATUTORY VIOLATION — OVERDUE FOIAs</span>
              {[
                { agency: "VA BIRLS", days: "+81d" },
                { agency: "DHS ENFORCE", days: "+81d" },
                { agency: "INAI Mexico", days: "+53d" },
              ].map(f => (
                <span key={f.agency} style={{ fontSize: 11, color: P.t2 }}>
                  <span style={{ color: P.red }}>{f.agency}</span> overdue {f.days}
                </span>
              ))}
              <span style={{ fontSize: 10, color: P.t3 }}>5 U.S.C. §552(a)(6)(A) — 20-day statutory limit</span>
            </div>

            {/* Source grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {filtered.map(src => (
                <div key={src.id} onClick={() => setSelected(selected?.id === src.id ? null : src)}
                  style={{
                    background: P.navy, border: `1px solid ${selected?.id === src.id ? P.gold : P.b}`,
                    borderRadius: 8, padding: 14, cursor: "pointer",
                    borderLeft: `4px solid ${PRIORITY_COLORS[src.priority] ?? P.t3}`,
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: P.t1 }}>{src.name}</div>
                      <div style={{ fontSize: 10, color: P.t3, marginTop: 2 }}>{src.sector} · {COUNTRY_LABELS[src.country] ?? src.country}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: PRIORITY_COLORS[src.priority], background: `${PRIORITY_COLORS[src.priority]}22`, padding: "1px 6px", borderRadius: 3 }}>
                        {src.priority}
                      </span>
                      <span style={{ fontSize: 9, color: src.status.includes("OVERDUE") ? P.red : src.status === "Active" ? P.teal : P.gold }}>
                        {src.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: P.t2, lineHeight: 1.5, marginBottom: 8 }}>{src.depth}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: P.t3 }}>API:</span>
                    <span style={{ fontSize: 10, color: src.foia_required ? P.gold : P.teal }}>{src.api}</span>
                    {src.bisg_relevance === "High" && (
                      <span style={{ fontSize: 9, color: P.gold, background: `${P.gold}22`, padding: "1px 5px", borderRadius: 3 }}>BISG</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Detail panel */}
            {selected && (
              <div style={{ background: P.navy, border: `1px solid ${P.gold}44`, borderRadius: 8, padding: 18, marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: P.gold }}>{selected.name}</div>
                    <div style={{ fontSize: 11, color: P.t3 }}>{selected.sector} · {selected.id}</div>
                  </div>
                  <span style={{ fontSize: 11, color: P.t3, fontFamily: "monospace" }}>{selected.url}</span>
                </div>
                <div style={{ fontSize: 12, color: P.t2, marginBottom: 14, lineHeight: 1.6 }}>{selected.note}</div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: P.t3, marginBottom: 6 }}>QUERY PLAYBOOK — click to run AI simulation</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {selected.query_playbook.map(q => (
                      <button key={q} onClick={() => runQuery(selected, q)} style={{
                        textAlign: "left", padding: "7px 12px", borderRadius: 5, fontSize: 12,
                        border: `1px solid ${activeQuery === q && !queryLoading ? P.teal : P.b}`,
                        background: activeQuery === q ? `${P.teal}11` : "transparent",
                        color: P.t2, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace",
                      }}>
                        {queryLoading && activeQuery === q ? "Simulating…" : `▶ ${q}`}
                      </button>
                    ))}
                  </div>
                </div>
                {queryResult && (
                  <div style={{ background: `${P.blue}11`, border: `1px solid ${P.blue}33`, borderRadius: 6, padding: 14, fontSize: 12, color: P.t2, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                    <div style={{ fontSize: 10, color: P.t3, marginBottom: 6 }}>QUERY SIMULATION — {activeQuery}</div>
                    {queryResult}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TECH STACK TAB */}
        {activeTab === "stack" && (
          <div>
            <div style={{ background: `${P.gold}11`, border: `1px solid ${P.gold}33`, borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 12, color: P.t2, lineHeight: 1.6 }}>
              <strong style={{ color: P.gold }}>Architecture v3.0 Recommendation:</strong>{" "}
              Hybrid stack: PostgreSQL + pgvector (relational core) · Neo4j (graph) · OpenSearch (surname facets) · Qdrant (BISG semantic) · Airflow (orchestration) · FastAPI (API surface) · Auth0 (RBAC) · S3 (immutable originals)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {STACK.map(s => (
                <div key={s.tech} style={{ background: P.navy, border: `1px solid ${P.b}`, borderRadius: 8, padding: 14,
                  borderLeft: `4px solid ${s.status === "Recommended" ? P.gold : s.status === "Required" ? P.red : P.teal}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: P.t1 }}>{s.tech}</div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: s.status === "Recommended" ? P.gold : s.status === "Required" ? P.red : P.teal }}>
                      {s.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: P.gold, marginBottom: 4 }}>{s.role}</div>
                  <div style={{ fontSize: 11, color: P.t3, lineHeight: 1.5 }}>{s.why}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QUERY PLAYBOOK TAB */}
        {activeTab === "playbook" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { title: "NARA Catalog API", color: P.red, queries: [
                  "\"DCAS\" AND \"Vietnam\" AND Hispanic",
                  "\"Selective Service\" AND \"Form 102\" AND \"non-citizen\"",
                  "\"RG319\" AND \"Vietnam\" AND \"casualty\"",
                  "\"Spanish surname\" AND \"Vietnam\" AND \"casualty\"",
                  "\"non-citizen\" AND \"drafted\" AND Vietnam",
                  "\"permanent resident\" AND \"inducted\" AND \"50 U.S.C.\"",
                ]},
                { title: "Congress.gov API", color: P.gold, queries: [
                  "\"deported veteran\" AND \"military service\"",
                  "\"non-citizen\" AND \"Vietnam\" AND \"veteran\"",
                  "\"Congressional Hispanic Caucus\" AND \"Vietnam\"",
                  "\"Noem\" AND \"veteran removals\"",
                  "\"Ralph Guzman\" AND \"casualty\" AND \"Vietnam\"",
                  "\"DCAS\" AND \"Hispanic\" AND \"undercount\"",
                ]},
                { title: "Chronicling America (LOC)", color: P.teal, queries: [
                  "\"baja por muerte\" AND Vietnam",
                  "\"soldado mexicano\" AND Vietnam",
                  "\"Chicano\" AND \"Vietnam\" AND \"muertes\"",
                  "\"Moratorium\" AND \"bajas\"",
                  "\"Raza\" AND \"Vietnam\" AND \"muertos\"",
                ]},
                { title: "COLEF / UNAM SUDIMER", color: P.blue, queries: [
                  "veteranos deportados Mexico",
                  "migrantes deportados militares",
                  "Vietnam mexicanos fallecidos",
                  "servicio militar no ciudadanos",
                  "Selective Service extranjeros",
                ]},
                { title: "FOIA.gov — Status Checks", color: "#a78bfa", queries: [
                  "Agency: VA → BIRLS Hispanic Vietnam KIA (OVERDUE +81d)",
                  "Agency: DHS → ENFORCE non-citizen veteran removals (OVERDUE +81d)",
                  "Agency: USCIS → A-file naturalization Vietnam-era",
                  "Agency: INAI Mexico → veteran recognition (OVERDUE +53d)",
                  "Agency: NARA St. Louis → SSS Form 102 (pending)",
                ]},
                { title: "Casa de Apoyo — Outreach", color: P.gold, queries: [
                  "Director: Héctor Barajas — Tijuana registry (~200 veterans)",
                  "Ciudad Juárez: Hector López Moreno",
                  "Vietnam-era service confirmed registry entries",
                  "MNV-01, MNV-02 cross-reference",
                  "Contact: casa-del-migrante.com inquiry workflow",
                ]},
              ].map(pg => (
                <div key={pg.title} style={{ background: P.navy, border: `1px solid ${P.b}`, borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: pg.color, marginBottom: 10, borderBottom: `1px solid ${pg.color}33`, paddingBottom: 6 }}>
                    {pg.title}
                  </div>
                  {pg.queries.map((q, i) => (
                    <div key={i} style={{ fontSize: 11, color: P.t2, padding: "4px 0", borderBottom: `1px solid ${P.b}11`, fontFamily: "monospace" }}>
                      {q}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INGEST FLOW TAB */}
        {activeTab === "ingest" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Ingest pipeline */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: P.gold, marginBottom: 12 }}>INGEST PIPELINE — DCAS MILITARY RECORDS</div>
                {[
                  { n: 1, step: "Discover source", detail: "DCAS, NARA, VA, DHS, ICE, Form 102 SSS, oral history, NGO registry", color: P.blue },
                  { n: 2, step: "Write immutable original to S3/MinIO", detail: "Versioning REQUIRED. Overwriting an original = chain-of-custody violation.", color: P.blue },
                  { n: 3, step: "Compute SHA-256 + MIME type", detail: "Duplicate prevention. Binary integrity verification.", color: P.blue },
                  { n: 4, step: "Create evidence row in PostgreSQL", detail: "With source_type, source_system, archive locators, access_level.", color: P.blue },
                  { n: 5, step: "Extract text OR run OCR", detail: "Military microfilm → 60–75% OCR confidence expected. Store with coordinates.", color: P.teal },
                  { n: 6, step: "Run BISG scoring", detail: "bisg_surname_score + bisg_geo_score → bisg_combined_score. Flag classification_anomaly if BISG ≥ τ=0.40 AND DCAS = non-Hispanic.", color: P.gold },
                  { n: 7, step: "Entity extraction", detail: "Names, service numbers, casualty dates, units, home-of-record.", color: P.teal },
                  { n: 8, step: "Claim candidate extraction", detail: "Misclassification, deportation, denial — queue for analyst review.", color: P.teal },
                  { n: 9, step: "Contamination screening", detail: "Anachronistic language, synthetic IDs, circular citations. DO NOT quarantine BISG anomaly records — those are the signal.", color: P.red },
                  { n: 10, step: "Index in OpenSearch", detail: "Surname, archive, form_type, date, tier facets.", color: P.blue },
                  { n: 11, step: "Embed into Qdrant", detail: "BISG surname vector + behavioral vector embeddings.", color: P.blue },
                  { n: 12, step: "Upsert Neo4j graph", detail: "KIA, Veteran, Agency, Claim, FOIA, Shelter nodes and typed relationships.", color: P.blue },
                  { n: 13, step: "Mark review_status = 'triaged'", detail: "Push to analyst review queue.", color: "#22c55e" },
                ].map(s => (
                  <div key={s.n} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: `${s.color}33`, border: `1px solid ${s.color}`, color: s.color, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      {s.n}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.step}</div>
                      <div style={{ fontSize: 11, color: P.t3, lineHeight: 1.5 }}>{s.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contamination + scoring */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: P.gold, marginBottom: 12 }}>CONTAMINATION SCORING — DCAS-SPECIFIC</div>
                <div style={{ background: `${P.red}11`, border: `1px solid ${P.red}33`, borderRadius: 8, padding: 14, marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: P.t3, marginBottom: 8 }}>FORMULA</div>
                  <div style={{ fontSize: 12, color: P.t2, lineHeight: 1.8, fontFamily: "monospace" }}>
                    contamination_score =<br />
                    {"  "}0.25 × identifier_anomaly<br />
                    {"  "}0.20 × numeric_anomaly<br />
                    {"  "}0.20 × language_anomaly<br />
                    {"  "}0.20 × citation_anomaly<br />
                    {"  "}0.15 × file_forensics_anomaly
                  </div>
                </div>
                <div style={{ background: `${P.gold}11`, border: `1px solid ${P.gold}33`, borderRadius: 8, padding: 14, marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: P.gold, marginBottom: 6 }}>⚑ BISG ANOMALY ≠ CONTAMINATION</div>
                  <div style={{ fontSize: 11, color: P.t2, lineHeight: 1.6 }}>
                    <code style={{ color: P.gold }}>classification_anomaly_flag = true</code> is a{" "}
                    <strong style={{ color: P.teal }}>forensic signal</strong> — BISG score ≥ τ=0.40 while DCAS coded the soldier as non-Hispanic.
                    These records must be <strong>fast-tracked to analyst review</strong>, not quarantined.
                    Contamination detects fabricated or laundered records — not the core finding.
                  </div>
                </div>
                {/* Score thresholds */}
                {[
                  { range: "0–19", label: "Low risk", action: "Normal review pipeline", color: P.teal },
                  { range: "20–39", label: "Review recommended", action: "Flag for analyst", color: P.gold },
                  { range: "40–59", label: "High concern", action: "Manual approval required", color: P.red },
                  { range: "60+", label: "Quarantine", action: "Excluded from verified outputs", color: "#ef4444" },
                ].map(t => (
                  <div key={t.range} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8, background: `${t.color}11`, border: `1px solid ${t.color}22`, borderRadius: 6, padding: "6px 12px" }}>
                    <div style={{ width: 40, fontSize: 11, fontWeight: 700, color: t.color, flexShrink: 0 }}>{t.range}</div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: t.color }}>{t.label}</div>
                      <div style={{ fontSize: 10, color: P.t3 }}>{t.action}</div>
                    </div>
                  </div>
                ))}

                {/* Confidence scoring */}
                <div style={{ fontSize: 13, fontWeight: 700, color: P.gold, marginTop: 16, marginBottom: 10 }}>CONFIDENCE SCORING</div>
                <div style={{ background: P.navy, border: `1px solid ${P.b}`, borderRadius: 8, padding: 12, fontSize: 11, color: P.t2, lineHeight: 1.8, fontFamily: "monospace" }}>
                  confidence =<br />
                  {"  "}0.35 × source_quality<br />
                  {"  "}0.20 × corroboration_depth<br />
                  {"  "}0.15 × temporal_proximity<br />
                  {"  "}0.10 × locator_specificity<br />
                  {"  "}0.10 × reviewer_agreement<br />
                  {"  "}0.10 × contradiction_penalty_inverse
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: P.t3 }}>
                  T5_CB_HSIVF Tier examples: confidence=91, provenance=94, contamination=3
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
