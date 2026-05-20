import { useState } from "react";
import { P } from "../../lib/teData";
import { base44 } from "@/api/base44Client";

// ── Expansion Roadmap Database Registry ──────────────────────────────────────
// Derived from the TruthEngine Expansion Roadmap strategic document

const TIER1 = [
  { id:"nara",    label:"NARA",              url:"https://catalog.archives.gov",              api:"https://www.archives.gov/research/catalog/help/api.html", desc:"Vietnam personnel, draft records, immigration/naturalization, military casualty, intelligence declassification", category:"us-gov", access:"Open" },
  { id:"loc",     label:"Library of Congress",url:"https://www.loc.gov",                     api:"https://www.loc.gov/apis/", desc:"Chicano archives, Vietnam collections, oral histories, Spanish-language newspapers, Veterans History Project", category:"us-gov", access:"Open" },
  { id:"inegi",   label:"INEGI",             url:"https://www.inegi.org.mx",                  api:"https://www.inegi.org.mx/servicios/api_indicadores.html", desc:"Mexico demographics, migration, municipal data, economic reconstruction, regional violence mapping", category:"mx-gov", access:"Open API" },
  { id:"pnt",     label:"PNT México",         url:"https://www.plataformadetransparencia.org.mx", api:null, desc:"Mexico's FOIA system. Military, police, migration, municipal governments, corruption investigations. Most important Mexico portal.", category:"mx-gov", access:"Transparency" },
  { id:"chron",   label:"Chronicling America",url:"https://chroniclingamerica.loc.gov",       api:"https://chroniclingamerica.loc.gov/about/api/", desc:"Vietnam-era press reporting, Chicano protests, obituaries, local political reactions", category:"newspaper", access:"Open API" },
  { id:"openalex",label:"OpenAlex",           url:"https://openalex.org",                     api:"https://docs.openalex.org", desc:"Citation graphs, author networks, institutional mapping — modern Microsoft Academic replacement", category:"scholar", access:"Free API" },
  { id:"core",    label:"CORE",              url:"https://core.ac.uk",                        api:"https://core.ac.uk/services/api", desc:"Open-access scholarly aggregation across 250M+ papers", category:"scholar", access:"Free API" },
  { id:"census",  label:"Census API",         url:"https://www.census.gov",                   api:"https://www.census.gov/data/developers/data-sets.html", desc:"Hispanic demographic modeling, veteran population estimates, migration flows, county-level reconstruction", category:"us-gov", access:"Free API" },
  { id:"va-open", label:"VA Open Data",       url:"https://www.data.va.gov",                  api:"https://developer.va.gov", desc:"Veteran demographics, healthcare access, disability patterns, suicide indicators, claims statistics", category:"us-gov", access:"Open" },
  { id:"dtic",    label:"DTIC",              url:"https://discover.dtic.mil",                 api:null, desc:"Vietnam operational reports, PTSD research, counterinsurgency, military studies, behavioral research", category:"us-gov", access:"Open" },
];

const TIER2 = [
  { id:"pacer",   label:"PACER + RECAP",     url:"https://pacer.uscourts.gov",               api:"https://free.law/recap/", desc:"Immigration litigation, veteran cases, civil rights, FOIA litigation. Use RECAP extension for free mirrors.", category:"legal", access:"Paid+RECAP" },
  { id:"fbi",     label:"FBI Vault",          url:"https://vault.fbi.gov",                    api:null, desc:"Chicano movement surveillance, activist monitoring, anti-war records, intelligence files", category:"us-gov", access:"Open" },
  { id:"cia",     label:"CIA CREST",          url:"https://www.cia.gov/readingroom/",          api:null, desc:"Declassified intelligence: Mexico, Vietnam, counterinsurgency, Latin American operations, migration", category:"us-gov", access:"Open" },
  { id:"agn",     label:"AGN México",         url:"https://www.gob.mx/agn",                   api:null, desc:"Mexico National Archives: historical military records, land records, intelligence, colonial archives, migration files", category:"mx-gov", access:"Formal Request" },
  { id:"ssrn",    label:"SSRN",              url:"https://www.ssrn.com",                      api:null, desc:"Working papers, immigration law, policy research, criminal justice", category:"scholar", access:"Open" },
  { id:"semscho", label:"Semantic Scholar",   url:"https://www.semanticscholar.org",           api:"https://api.semanticscholar.org", desc:"Citation mapping, research clustering, NLP ingestion, author relationship graphs", category:"scholar", access:"Free API" },
  { id:"opencorp",label:"OpenCorporates",    url:"https://opencorporates.com",                api:"https://api.opencorporates.com", desc:"Shell companies, corporate networks, ownership structures — funding trail analysis", category:"osint", access:"API" },
  { id:"wikidata",label:"Wikidata SPARQL",    url:"https://query.wikidata.org",               api:"https://www.wikidata.org/wiki/Wikidata:SPARQL_query_service", desc:"Structured relationship extraction, entity resolution, cross-reference mapping", category:"osint", access:"Free SPARQL" },
  { id:"hathi",   label:"HathiTrust",         url:"https://www.hathitrust.org",               api:null, desc:"Massive digitized book archive — military histories, Chicano literature, government reports", category:"scholar", access:"Open" },
  { id:"archive", label:"Internet Archive",   url:"https://archive.org",                      api:null, desc:"Newspapers, VHS recordings, scanned military books, community archives, rare oral histories", category:"scholar", access:"Open" },
];

const TIER3 = [
  { id:"opensanct",label:"OpenSanctions",    url:"https://www.opensanctions.org",             api:null, desc:"Corruption watchlists, international investigations, entity due diligence", category:"osint", access:"Open" },
  { id:"inai",    label:"INAI México",        url:"https://home.inai.org.mx",                  api:null, desc:"Mexico transparency appeals, information denials, transparency litigation", category:"mx-gov", access:"Transparency" },
  { id:"sedena",  label:"SEDENA México",      url:"https://www.gob.mx/sedena",                api:null, desc:"Military transparency requests via PNT — regional SEDENA Zona Militar files", category:"mx-gov", access:"Transparency Request" },
  { id:"inmx",    label:"INM México",         url:"https://www.gob.mx/inm",                   api:null, desc:"Deportation data, migration flows, border crossing analytics, removal entry records", category:"mx-gov", access:"Transparency" },
  { id:"cdnc",    label:"CA Digital Newspapers",url:"https://cdnc.ucr.edu",                  api:null, desc:"Barrio-level Chicano reporting, Southern California Vietnam protests, obituaries", category:"newspaper", access:"Open" },
  { id:"bls",     label:"BLS",               url:"https://www.bls.gov",                       api:"https://www.bls.gov/developers/", desc:"Veteran unemployment, Chicano labor shifts, economic stress modeling, industrial decline", category:"us-gov", access:"Free API" },
  { id:"dpaa",    label:"DPAA",              url:"https://www.dpaa.mil",                      api:null, desc:"Missing personnel, DNA recovery, service verification, casualty reconciliation", category:"us-gov", access:"Open" },
  { id:"usaspend",label:"USAspending.gov",    url:"https://www.usaspending.gov",              api:"https://api.usaspending.gov", desc:"Defense contractors, research funding, NGO funding trails, veteran programs", category:"us-gov", access:"Free API" },
  { id:"dof",     label:"DOF México",         url:"https://www.dof.gob.mx",                   api:null, desc:"Mexico federal register: policy tracing, military decrees, administrative law, regulatory timelines", category:"mx-gov", access:"Open" },
  { id:"sss",     label:"Selective Service",  url:"https://www.sss.gov",                      api:null, desc:"Draft-era reconstruction, Hispanic service probability, regional enlistment analysis", category:"us-gov", access:"Open" },
];

const CATEGORIES = {
  "us-gov":   { label:"US Government",   color: P.blue },
  "mx-gov":   { label:"Mexico Gov",      color: "#FF6B35" },
  "scholar":  { label:"Scholarly",       color: P.violet },
  "newspaper":{ label:"Newspapers",      color: P.gold },
  "legal":    { label:"Legal",           color: P.teal },
  "osint":    { label:"OSINT",           color: P.red },
};

const ARCHITECTURE_STACK = [
  { layer:"Source Ingestion", tools:"NARA, LOC, INEGI, PNT, Census API, PACER+RECAP, Chronicling America, OpenAlex, CORE", color: P.blue },
  { layer:"OCR / Cleaning", tools:"Tesseract + PaddleOCR, LangChain document loaders, PDF parsers, Whisper (audio)", color: P.violet },
  { layer:"Entity Extraction", tools:"Claude AI via Base44, spaCy NER, regex patterns for legal/case IDs", color: P.gold },
  { layer:"Vector Embedding", tools:"pgvector (PostgreSQL), FAISS, OpenAI embeddings, Semantic Scholar vectors", color: P.teal },
  { layer:"Graph Mapping", tools:"Neo4j (person ↔ case ↔ agency ↔ document), Wikidata SPARQL, OpenCorporates", color: "#FF6B35" },
  { layer:"Cluster Analysis", tools:"k-means, HDBSCAN, BISG/BIFSG demographic classification, NERO scoring", color: P.pink },
  { layer:"Behavioral Modeling", tools:"PTSD risk models, deportation prediction, NERO trajectory, cohort analysis", color: P.amber },
  { layer:"Intelligence Reporting", tools:"Claude intelligenceReportEngine, CHC briefing packages, FOIA pathway analysis", color: P.green },
  { layer:"Dashboard Visualization", tools:"TruthEngine360 React/Vite UI, recharts, react-leaflet, 130+ tab interface", color: P.cyan },
];

export default function ExpansionRoadmap() {
  const [activeTab, setActiveTab] = useState("tier1");
  const [catFilter, setCatFilter] = useState("all");
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const allDbs = activeTab === "tier1" ? TIER1 : activeTab === "tier2" ? TIER2 : TIER3;
  const filtered = catFilter === "all" ? allDbs : allDbs.filter(d => d.category === catFilter);

  const runAI = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponse("");
    setAiError(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the TruthEngine360 database strategy advisor. Answer this query about database integration, FOIA strategy, or data ingestion architecture for the veteran deportation forensic investigation:

${aiQuery}

Be specific: cite database names, API endpoints, ingestion strategies, and prioritization. Reference the DCAS/BISG/NERO investigation context.`,
      });
      const text = typeof res === "string" ? res : res?.text || res?.content || JSON.stringify(res);
      setAiResponse(text);
    } catch (err) {
      setAiError(err?.message || "AI query failed.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1, padding: "14px 20px", overflowY: "auto", height: "calc(100vh - 118px)" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${P.card}, #0D1525)`, border: `2px solid ${P.orange || "#FF6B35"}30`, borderRadius: 12, padding: "14px 18px", marginBottom: 14 }}>
        <div style={{ fontSize: 7, color: P.orange || "#FF6B35", letterSpacing: 3, fontWeight: 800, marginBottom: 4 }}>
          🌐 TRUTHENGINE EXPANSION ROADMAP · FEDERATED INTELLIGENCE ECOSYSTEM
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          Cross-Border Database Integration &amp; Architecture Plan
        </div>
        <div style={{ fontSize: 7, color: P.t4, marginTop: 4, lineHeight: 1.7 }}>
          <em>"The archive is the battlefield. Build a machine that remembers what institutions forgot."</em>
          <br/>
          {TIER1.length + TIER2.length + TIER3.length}+ curated sources · US Government · Mexico Federal · Scholarly · OSINT · Newspapers · Legal
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {[
            [`${TIER1.length} Tier 1`, "Immediate Integration", P.blue],
            [`${TIER2.length} Tier 2`, "Investigative Expansion", P.violet],
            [`${TIER3.length} Tier 3`, "Behavioral Modeling", P.teal],
            [ARCHITECTURE_STACK.length + " Layers", "Architecture Stack", P.gold],
          ].map(([v, l, c]) => (
            <div key={l} style={{ background: `${c}12`, border: `1px solid ${c}30`, borderRadius: 7, padding: "5px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: c }}>{v}</div>
              <div style={{ fontSize: 6, color: P.t4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[
          { id:"tier1", label:"⭐ Tier 1 — Immediate Integration" },
          { id:"tier2", label:"🔭 Tier 2 — Investigative Expansion" },
          { id:"tier3", label:"🤖 Tier 3 — Behavioral Modeling" },
          { id:"arch",  label:"🏗️ Architecture Stack" },
        ].map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setCatFilter("all"); }}
            style={{ padding: "7px 12px", fontSize: 7, fontWeight: activeTab === tab.id ? 800 : 500, cursor: "pointer",
              background: activeTab === tab.id ? `${P.orange || "#FF6B35"}18` : P.card,
              border: `1px solid ${activeTab === tab.id ? (P.orange || "#FF6B35") : P.b}`,
              color: activeTab === tab.id ? (P.orange || "#FF6B35") : P.t4, borderRadius: 7, fontFamily: "inherit" }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Architecture tab */}
      {activeTab === "arch" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: P.t4, letterSpacing: 2, marginBottom: 4 }}>
            INGESTION PIPELINE · 9 LAYERS · SOURCE → VISUALIZATION
          </div>
          {ARCHITECTURE_STACK.map((layer, i) => (
            <div key={layer.layer} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: P.card, border: `1px solid ${layer.color}25`, borderRadius: 9, padding: "10px 14px" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${layer.color}20`, border: `2px solid ${layer.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 9, color: layer.color, flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: layer.color, marginBottom: 3 }}>↓ {layer.layer.toUpperCase()}</div>
                <div style={{ fontSize: 7, color: P.t4, lineHeight: 1.6 }}>{layer.tools}</div>
              </div>
            </div>
          ))}

          {/* Strategic mission */}
          <div style={{ background: "#080D18", border: `1px solid ${P.gold}20`, borderRadius: 10, padding: "14px 16px", marginTop: 8 }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: P.gold, marginBottom: 8 }}>STRATEGIC MISSION</div>
            {[
              "Cross-reference fragmented records across institutional silos",
              "Detect hidden relationships between entities using Neo4j graph mapping",
              "Map behavioral and institutional patterns through cohort analysis",
              "Conduct historical reconstruction from metadata, OCR, and OSINT",
              "Track deported veterans through US/Mexico cross-border data fusion",
              "Run continuous evidence ingestion pipelines via Apache Airflow",
              "Produce searchable institutional memory that persists beyond any individual investigation",
            ].map((item, i) => (
              <div key={i} style={{ fontSize: 7, color: P.t2, padding: "4px 0", borderBottom: i < 6 ? `1px solid ${P.b}15` : "none" }}>
                → {item}
              </div>
            ))}
            <div style={{ marginTop: 10, fontSize: 7, color: P.gold, fontStyle: "italic" }}>
              "Most people search databases. You are building a machine that remembers what institutions forgot."
            </div>
          </div>
        </div>
      )}

      {/* Database tiers */}
      {activeTab !== "arch" && (
        <>
          {/* Category filter */}
          <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={() => setCatFilter("all")}
              style={{ padding: "3px 10px", fontSize: 7, cursor: "pointer", background: catFilter === "all" ? `${P.t2}15` : "transparent", border: `1px solid ${catFilter === "all" ? P.t2 : P.b}`, color: catFilter === "all" ? P.t2 : P.t4, borderRadius: 20, fontFamily: "inherit" }}>
              All
            </button>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <button key={key} onClick={() => setCatFilter(key)}
                style={{ padding: "3px 10px", fontSize: 7, cursor: "pointer", background: catFilter === key ? `${cat.color}18` : "transparent", border: `1px solid ${catFilter === key ? cat.color : P.b}`, color: catFilter === key ? cat.color : P.t4, borderRadius: 20, fontFamily: "inherit" }}>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Database cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 8, marginBottom: 16 }}>
            {filtered.map((db) => {
              const cat = CATEGORIES[db.category];
              return (
                <div key={db.id} style={{ background: P.card, border: `1px solid ${cat.color}25`, borderRadius: 9, padding: "11px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 800, color: P.t1 }}>{db.label}</div>
                      <div style={{ fontSize: 6, color: cat.color, fontWeight: 700, marginTop: 1 }}>
                        {cat.label} · {db.access}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {db.api && (
                        <span style={{ fontSize: 5, background: `${P.teal}18`, color: P.teal, border: `1px solid ${P.teal}30`, borderRadius: 3, padding: "1px 4px", fontWeight: 700 }}>API</span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 7, color: P.t4, lineHeight: 1.6, marginBottom: 7 }}>{db.desc}</div>
                  <div style={{ display: "flex", gap: 5 }}>
                    <a href={db.url} target="_blank" rel="noopener noreferrer"
                      style={{ flex: 1, padding: "4px 8px", fontSize: 6, fontWeight: 700, textAlign: "center", cursor: "pointer", background: `${cat.color}12`, border: `1px solid ${cat.color}30`, color: cat.color, borderRadius: 5, textDecoration: "none" }}>
                      Open →
                    </a>
                    {db.api && (
                      <a href={db.api} target="_blank" rel="noopener noreferrer"
                        style={{ flex: 1, padding: "4px 8px", fontSize: 6, fontWeight: 700, textAlign: "center", cursor: "pointer", background: `${P.teal}10`, border: `1px solid ${P.teal}25`, color: P.teal, borderRadius: 5, textDecoration: "none" }}>
                        API Docs →
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* AI Strategy Query */}
      <div style={{ background: P.card, border: `1px solid ${P.gold}30`, borderRadius: 10, padding: "14px 16px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, marginBottom: 4 }}>
          🤖 AI Database Strategy Advisor
        </div>
        <div style={{ fontSize: 7, color: P.t4, marginBottom: 8 }}>
          Ask Claude AI about integration strategy, FOIA targets, ingestion architecture, or cross-database query design.
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          <input
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runAI()}
            placeholder="e.g. How do I cross-reference NARA draft records with INEGI census data for Mexican-national veteran identification?"
            style={{ flex: 1, fontFamily: "'IBM Plex Mono',monospace", fontSize: 7, background: "#080D18", border: `1px solid ${P.b}`, borderRadius: 6, padding: "6px 10px", color: P.t1, outline: "none" }}
          />
          <button onClick={runAI} disabled={!aiQuery.trim() || aiLoading}
            style={{ padding: "6px 14px", fontSize: 7, fontWeight: 800, cursor: "pointer", background: `${P.gold}20`, border: `1px solid ${P.gold}`, color: P.gold, borderRadius: 6, fontFamily: "inherit", opacity: !aiQuery.trim() || aiLoading ? 0.5 : 1 }}>
            {aiLoading ? "…" : "Ask →"}
          </button>
        </div>
        {aiError && <div style={{ fontSize: 7, color: P.red, padding: "6px 8px", background: `${P.red}10`, borderRadius: 5 }}>⚠ {aiError}</div>}
        {aiResponse && (
          <div style={{ fontSize: 7, color: P.t2, lineHeight: 1.8, whiteSpace: "pre-wrap", maxHeight: 280, overflowY: "auto", background: "#080D18", borderRadius: 7, padding: "10px 12px", border: `1px solid ${P.b}` }}>
            {aiResponse}
          </div>
        )}
      </div>
    </div>
  );
}
