import { useState } from "react";
import { P } from "../../lib/teData";
import { base44 } from "@/api/base44Client";

// ── TruthEngine360 Database Master Index ────────────────────────────────────
// Derived from TruthEngine360_Database_Master_Index.xlsx
// Category | Database | Country | Type | Access | API | Primary Use | Strategic Value | URL | Notes

const DATABASE_MASTER = [
  // US Federal & Military
  { id:"nara",     category:"Federal Archive",  db:"National Archives (NARA)",              country:"USA",    type:"Government Archive",      access:"Public",    api:true,    use:"Military/Veteran Records",        value:"Critical",  url:"https://www.archives.gov",                          notes:"Vietnam, casualty, immigration, draft" },
  { id:"loc",      category:"Federal Archive",  db:"Library of Congress",                   country:"USA",    type:"Historical Archive",      access:"Public",    api:true,    use:"Oral histories/newspapers",        value:"Critical",  url:"https://www.loc.gov",                               notes:"Veterans History Project, Chicano archives" },
  { id:"dtic",     category:"Military",         db:"Defense Technical Information Center",  country:"USA",    type:"Military Research",       access:"Public",    api:false,   use:"Defense studies / PTSD",          value:"High",      url:"https://discover.dtic.mil",                         notes:"PTSD, logistics, Vietnam operational reports" },
  { id:"cia",      category:"Intelligence",     db:"CIA Reading Room",                      country:"USA",    type:"Declassified Intelligence",access:"Public",   api:false,   use:"Cold War/Mexico/Vietnam",         value:"High",      url:"https://www.cia.gov/readingroom/",                  notes:"Psychological operations, Latin America" },
  { id:"fbi",      category:"Law Enforcement",  db:"FBI Vault",                             country:"USA",    type:"FOIA Archive",            access:"Public",    api:false,   use:"Civil rights/surveillance",       value:"High",      url:"https://vault.fbi.gov",                             notes:"Chicano movement monitoring" },
  { id:"va",       category:"Veterans",         db:"VA Open Data",                          country:"USA",    type:"Veterans Data",           access:"Public",    api:true,    use:"Claims/disabilities",             value:"Critical",  url:"https://www.data.va.gov",                           notes:"PTSD/service-connected patterns" },
  { id:"dpaa",     category:"Military",         db:"Defense POW/MIA Accounting Agency",    country:"USA",    type:"Personnel Recovery",      access:"Public",    api:false,   use:"Missing personnel/DNA recovery",  value:"High",      url:"https://www.dpaa.mil",                              notes:"Service verification, casualty reconciliation" },
  { id:"mcua",     category:"Military",         db:"Marine Corps University Archives",      country:"USA",    type:"Unit History",            access:"Public",    api:false,   use:"Unit histories/oral histories",   value:"Medium",    url:"https://www.usmcu.edu",                             notes:"After-action reports, Vietnam collections" },
  { id:"ahec",     category:"Military",         db:"Army Heritage and Education Center",    country:"USA",    type:"Soldier Collections",     access:"Public",    api:false,   use:"Vietnam soldier records",         value:"Medium",    url:"https://ahec.armywarcollege.edu",                   notes:"Unit records, personal papers" },
  { id:"sss",      category:"Federal Archive",  db:"Selective Service System",              country:"USA",    type:"Draft Records",           access:"Public",    api:false,   use:"Draft-era reconstruction",        value:"High",      url:"https://www.sss.gov",                               notes:"Hispanic service probability, enlistment" },
  { id:"spend",    category:"Federal Archive",  db:"USAspending.gov",                       country:"USA",    type:"Federal Spending",        access:"Public",    api:true,    use:"Defense/NGO funding trails",      value:"Medium",    url:"https://www.usaspending.gov",                       notes:"Research funding, veteran programs" },
  { id:"datagov",  category:"Federal Archive",  db:"Data.gov",                              country:"USA",    type:"Open Data Portal",        access:"Public",    api:true,    use:"Veterans/census/immigration",     value:"Medium",    url:"https://www.data.gov",                              notes:"Central US federal open-data portal" },
  { id:"census",   category:"Demographics",     db:"US Census Bureau API",                  country:"USA",    type:"Demographic Database",    access:"Public",    api:true,    use:"Hispanic demographic modeling",   value:"Critical",  url:"https://www.census.gov",                            notes:"Veteran population, migration flows" },
  { id:"bls",      category:"Demographics",     db:"Bureau of Labor Statistics",            country:"USA",    type:"Labor Statistics",        access:"Public",    api:true,    use:"Veteran unemployment/labor",      value:"Medium",    url:"https://www.bls.gov",                               notes:"Economic stress modeling, Chicano labor shifts" },
  { id:"pacer",    category:"Legal",            db:"PACER + RECAP",                         country:"USA",    type:"Federal Court Records",   access:"Paid+Free", api:false,   use:"Immigration/veteran litigation",  value:"Critical",  url:"https://pacer.uscourts.gov",                        notes:"Use RECAP for free mirrors: free.law/recap" },
  { id:"natsec",   category:"Intelligence",     db:"National Security Archive (GWU)",      country:"USA",    type:"FOIA / Declassified",    access:"Public",    api:false,   use:"CIA/Pentagon/State/Mexico intel", value:"High",      url:"https://nsarchive.gwu.edu",                         notes:"Latin America operations, Vietnam" },

  // Mexico Government & Transparency
  { id:"pnt",      category:"Transparency",     db:"Plataforma Nacional de Transparencia",  country:"Mexico", type:"FOIA System",            access:"Public",    api:false,   use:"Government requests",             value:"Critical",  url:"https://www.plataformadetransparencia.org.mx",      notes:"Military, police, migration — primary Mexico portal" },
  { id:"inegi",    category:"Statistics",       db:"INEGI",                                 country:"Mexico", type:"Demographic Database",   access:"Public",    api:true,    use:"Population/migration",            value:"Critical",  url:"https://www.inegi.org.mx",                          notes:"Municipal analytics, migration flows" },
  { id:"inai",     category:"Transparency",     db:"INAI México",                           country:"Mexico", type:"Transparency Authority", access:"Public",    api:false,   use:"Mexico FOIA appeals",             value:"High",      url:"https://home.inai.org.mx",                          notes:"Denials, litigation, transparency enforcement" },
  { id:"agn",      category:"Federal Archive",  db:"Archivo General de la Nación",          country:"Mexico", type:"National Archive",       access:"Public",    api:false,   use:"Historical military/migration",   value:"High",      url:"https://www.gob.mx/agn",                            notes:"SRE consular death records, DFS intelligence" },
  { id:"inm",      category:"Migration",        db:"Instituto Nacional de Migración",       country:"Mexico", type:"Immigration",            access:"Public",    api:false,   use:"Migration/deportation records",   value:"High",      url:"https://www.gob.mx/inm",                            notes:"Border movement, removal entry records" },
  { id:"sedena",   category:"Military",         db:"SEDENA (Mexico Army)",                  country:"Mexico", type:"Military",               access:"Restricted", api:false,  use:"Regional military files",         value:"High",      url:"https://www.gob.mx/sedena",                         notes:"Use PNT for transparency requests" },
  { id:"semar",    category:"Military",         db:"SEMAR (Mexico Navy)",                   country:"Mexico", type:"Military",               access:"Restricted", api:false,  use:"Coastal operations/intelligence", value:"Medium",    url:"https://www.gob.mx/semar",                          notes:"Security operations overlap" },
  { id:"ran",      category:"Land Records",     db:"Registro Agrario Nacional",             country:"Mexico", type:"Land Registry",          access:"Public",    api:false,   use:"Indigenous land/ejido records",   value:"Medium",    url:"https://www.gob.mx/ran",                            notes:"Historical land disputes, family mapping" },
  { id:"dof",      category:"Government",       db:"Diario Oficial de la Federación",       country:"Mexico", type:"Federal Register",       access:"Public",    api:false,   use:"Policy tracing/decrees",          value:"Medium",    url:"https://www.dof.gob.mx",                            notes:"Military decrees, regulatory timelines" },
  { id:"rnpdno",   category:"Missing Persons",  db:"Registro Nacional de Personas Desaparecidas", country:"Mexico", type:"Missing Persons",  access:"Public",    api:false,  use:"Family mapping/identity",         value:"High",      url:"https://versionpublicarnpdno.segob.gob.mx",         notes:"Cross-border identity reconstruction" },

  // Scholarly & Academic
  { id:"scholar",  category:"Scholarly",        db:"Google Scholar",                        country:"Global", type:"Academic Search",        access:"Public",    api:false,   use:"Research discovery",              value:"Critical",  url:"https://scholar.google.com",                        notes:"Continuous monitoring for new dissertations" },
  { id:"openalex", category:"Scholarly",        db:"OpenAlex",                              country:"Global", type:"Citation Graph",         access:"Public",    api:true,    use:"Research clustering",             value:"Critical",  url:"https://openalex.org",                              notes:"Author/institution graphs, API: docs.openalex.org" },
  { id:"core",     category:"Scholarly",        db:"CORE",                                  country:"Global", type:"Open Access",            access:"Public",    api:true,    use:"Research papers",                 value:"High",      url:"https://core.ac.uk",                                notes:"250M+ open-access papers, API available" },
  { id:"semscho",  category:"Scholarly",        db:"Semantic Scholar",                      country:"Global", type:"NLP Research Graph",     access:"Public",    api:true,    use:"Citation mapping/NLP ingestion",  value:"High",      url:"https://www.semanticscholar.org",                   notes:"API: api.semanticscholar.org" },
  { id:"jstor",    category:"Scholarly",        db:"JSTOR",                                 country:"Global", type:"Academic Journals",      access:"Mixed",     api:false,   use:"Chicano/Vietnam studies",         value:"High",      url:"https://www.jstor.org",                             notes:"PTSD literature, historical sociology" },
  { id:"ssrn",     category:"Scholarly",        db:"SSRN",                                  country:"Global", type:"Working Papers",         access:"Public",    api:false,   use:"Immigration law/policy research", value:"High",      url:"https://www.ssrn.com",                              notes:"Criminal justice, pre-publication research" },
  { id:"hathi",    category:"Scholarly",        db:"HathiTrust",                            country:"Global", type:"Digitized Books",        access:"Public",    api:false,   use:"Military histories/government",   value:"Medium",    url:"https://www.hathitrust.org",                        notes:"Chicano literature, government reports" },
  { id:"archive",  category:"Scholarly",        db:"Internet Archive",                      country:"Global", type:"Digital Archive",        access:"Public",    api:false,   use:"Newspapers/VHS/oral histories",   value:"High",      url:"https://archive.org",                               notes:"Community archives, rare oral histories" },
  { id:"proquest", category:"Scholarly",        db:"ProQuest Dissertations",                country:"Global", type:"Dissertations",          access:"Paid",      api:false,   use:"Hidden interviews/original data", value:"High",      url:"https://www.proquest.com/products-services/dissertations/", notes:"Gold mine: regional archives, bibliographies" },

  // Historical Newspapers & Media
  { id:"chron",    category:"Newspapers",       db:"Chronicling America",                   country:"USA",    type:"Historical Newspapers",  access:"Public",    api:true,    use:"Vietnam-era press reporting",     value:"High",      url:"https://chroniclingamerica.loc.gov",                notes:"API available, OCR searchable, 20M+ pages" },
  { id:"cdnc",     category:"Newspapers",       db:"CA Digital Newspaper Collection",       country:"USA",    type:"California Newspapers",  access:"Public",    api:false,   use:"Barrio-level Chicano reporting",  value:"High",      url:"https://cdnc.ucr.edu",                              notes:"Vietnam-era SoCal, East LA, Central Valley" },
  { id:"newsp",    category:"Newspapers",       db:"Newspapers.com",                        country:"USA",    type:"Historical Newspapers",  access:"Paid",      api:false,   use:"Regional obituary research",      value:"Medium",    url:"https://www.newspapers.com",                        notes:"Powerful paid database" },
  { id:"miltimes", category:"Newspapers",       db:"Military Times",                        country:"USA",    type:"Military Media",         access:"Public",    api:false,   use:"Veteran affairs coverage",        value:"Medium",    url:"https://www.militarytimes.com",                     notes:"Contemporary veteran policy tracking" },
  { id:"pbs",      category:"Media",            db:"PBS Archives",                          country:"USA",    type:"Broadcast Archive",      access:"Public",    api:false,   use:"Vietnam/civil rights footage",    value:"Medium",    url:"https://www.pbs.org",                               notes:"Documentary and news archive" },

  // OSINT / Entity Resolution / Graph Intelligence
  { id:"maltego",  category:"OSINT",            db:"Maltego",                               country:"Global", type:"Entity Resolution",     access:"Commercial", api:true,   use:"Relationship/social mapping",     value:"Critical",  url:"https://www.maltego.com",                           notes:"Graph intelligence, entity linkage" },
  { id:"opensanct",category:"OSINT",            db:"OpenSanctions",                         country:"Global", type:"Watchlists",            access:"Public",    api:true,    use:"Corruption/sanctions tracking",   value:"High",      url:"https://www.opensanctions.org",                     notes:"International investigations, due diligence" },
  { id:"opencorp", category:"OSINT",            db:"OpenCorporates",                        country:"Global", type:"Corporate Records",     access:"Public",    api:true,    use:"Ownership/shell company tracing", value:"High",      url:"https://opencorporates.com",                        notes:"Funding trail analysis, API: api.opencorporates.com" },
  { id:"wikidata", category:"OSINT",            db:"Wikidata SPARQL",                       country:"Global", type:"Knowledge Graph",       access:"Public",    api:true,    use:"Structured relationship extraction",value:"High",    url:"https://query.wikidata.org",                        notes:"SPARQL endpoint for entity relationships" },
  { id:"osm",      category:"Geospatial",       db:"OpenStreetMap",                         country:"Global", type:"Geospatial",            access:"Public",    api:true,    use:"Geographic/border mapping",       value:"Medium",    url:"https://www.openstreetmap.org",                     notes:"Border region, shelter locations" },
];

const CATEGORIES = [...new Set(DATABASE_MASTER.map(d => d.category))];
const VALUES = ["Critical", "High", "Medium"];
const COUNTRIES = ["All", "USA", "Mexico", "Global"];
const VALUE_COLORS = { Critical: P.red || "#EF4444", High: P.gold, Medium: P.teal };
const ACCESS_COLOR = { Public: P.teal, Paid: P.amber || "#F59E0B", "Paid+Free": "#F59E0B", Mixed: "#F59E0B", Commercial: P.violet, Restricted: P.red || "#EF4444" };

export default function DatabaseMasterIndex() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");
  const [valueFilter, setValueFilter] = useState("All");
  const [apiOnly, setApiOnly] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [sortBy, setSortBy] = useState("value");

  const filtered = DATABASE_MASTER
    .filter(d => catFilter === "All" || d.category === catFilter)
    .filter(d => countryFilter === "All" || d.country === countryFilter)
    .filter(d => valueFilter === "All" || d.value === valueFilter)
    .filter(d => !apiOnly || d.api)
    .filter(d => !search || [d.db, d.use, d.notes, d.category, d.country].join(" ").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "value") return VALUES.indexOf(a.value) - VALUES.indexOf(b.value);
      if (sortBy === "category") return a.category.localeCompare(b.category);
      if (sortBy === "country") return a.country.localeCompare(b.country);
      return a.db.localeCompare(b.db);
    });

  const stats = {
    total: DATABASE_MASTER.length,
    critical: DATABASE_MASTER.filter(d => d.value === "Critical").length,
    withApi: DATABASE_MASTER.filter(d => d.api).length,
    countries: [...new Set(DATABASE_MASTER.map(d => d.country))].length,
  };

  const runAI = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponse("");
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the TruthEngine360 database integration strategist. A researcher asks about the database ecosystem for the DCAS/veteran deportation forensic investigation:

QUERY: ${aiQuery}

Available databases include: ${filtered.slice(0, 10).map(d => d.db).join(", ")} (and ${DATABASE_MASTER.length}+ total).

Provide specific, actionable guidance referencing database names, API strategies, cross-referencing opportunities, and ingestion priorities. Tie advice to the DCAS anomaly, BISG methodology, or CHC briefing where relevant.`,
      });
      const text = typeof res === "string" ? res : res?.text || res?.content || JSON.stringify(res);
      setAiResponse(text);
    } catch (err) {
      setAiResponse(`Error: ${err?.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1, padding: "14px 20px", overflowY: "auto", height: "calc(100vh - 118px)" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${P.card}, #0D1525)`, border: `2px solid ${P.orange || "#FF6B35"}30`, borderRadius: 12, padding: "14px 18px", marginBottom: 14 }}>
        <div style={{ fontSize: 7, color: P.orange || "#FF6B35", letterSpacing: 3, fontWeight: 800, marginBottom: 4 }}>
          📊 TRUTHENGINE360 DATABASE MASTER INDEX · FEDERATED INTELLIGENCE ECOSYSTEM
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1, marginBottom: 4 }}>
          Database Master Index — {stats.total} Sources
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
          {[
            [stats.total + " Total", "Curated databases", P.blue],
            [stats.critical + " Critical", "Highest priority", VALUE_COLORS.Critical],
            [stats.withApi + " with API", "Programmatic access", P.teal],
            [stats.countries + " Countries", "US · Mexico · Global", P.gold],
          ].map(([v, l, c]) => (
            <div key={l} style={{ background: `${c}12`, border: `1px solid ${c}30`, borderRadius: 7, padding: "5px 12px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: c }}>{v}</div>
              <div style={{ fontSize: 6, color: P.t4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search databases…"
          style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, background: "#080D18", border: `1px solid ${P.b}`, borderRadius: 6, padding: "5px 10px", color: P.t1, outline: "none", width: 200 }}
        />
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 7, background: "#080D18", border: `1px solid ${P.b}`, borderRadius: 5, padding: "4px 8px", color: P.t4 }}
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={countryFilter}
          onChange={e => setCountryFilter(e.target.value)}
          style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 7, background: "#080D18", border: `1px solid ${P.b}`, borderRadius: 5, padding: "4px 8px", color: P.t4 }}
        >
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={valueFilter}
          onChange={e => setValueFilter(e.target.value)}
          style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 7, background: "#080D18", border: `1px solid ${P.b}`, borderRadius: 5, padding: "4px 8px", color: P.t4 }}
        >
          <option value="All">All Values</option>
          {VALUES.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <button
          onClick={() => setApiOnly(!apiOnly)}
          style={{ padding: "4px 10px", fontSize: 7, cursor: "pointer", background: apiOnly ? `${P.teal}20` : "transparent", border: `1px solid ${apiOnly ? P.teal : P.b}`, color: apiOnly ? P.teal : P.t4, borderRadius: 5, fontFamily: "inherit" }}
        >
          {apiOnly ? "✓ " : ""}API only
        </button>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 7, background: "#080D18", border: `1px solid ${P.b}`, borderRadius: 5, padding: "4px 8px", color: P.t4, marginLeft: "auto" }}
        >
          <option value="value">Sort: Strategic Value</option>
          <option value="category">Sort: Category</option>
          <option value="country">Sort: Country</option>
          <option value="name">Sort: Name</option>
        </select>
        <span style={{ fontSize: 7, color: P.t4 }}>{filtered.length} shown</span>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", marginBottom: 14 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 7 }}>
          <thead>
            <tr style={{ background: "#080D18", borderBottom: `2px solid ${P.b}` }}>
              {["Category", "Database", "Country", "Access", "API", "Primary Use", "Value", "Notes", ""].map(h => (
                <th key={h} style={{ padding: "7px 10px", textAlign: "left", color: P.t4, fontWeight: 800, letterSpacing: 1, fontSize: 6, whiteSpace: "nowrap" }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((db, i) => (
              <tr key={db.id} style={{ borderBottom: `1px solid ${P.b}15`, background: i % 2 === 0 ? "transparent" : "#080D1820" }}>
                <td style={{ padding: "7px 10px", color: P.t4, whiteSpace: "nowrap" }}>{db.category}</td>
                <td style={{ padding: "7px 10px", color: P.t1, fontWeight: 700, maxWidth: 220 }}>
                  {db.db}
                  <div style={{ fontSize: 6, color: P.t4, fontWeight: 400, marginTop: 1 }}>{db.type}</div>
                </td>
                <td style={{ padding: "7px 10px", color: P.t4, whiteSpace: "nowrap" }}>
                  {db.country === "USA" ? "🇺🇸" : db.country === "Mexico" ? "🇲🇽" : "🌐"} {db.country}
                </td>
                <td style={{ padding: "7px 10px" }}>
                  <span style={{ fontSize: 6, background: `${ACCESS_COLOR[db.access] || P.t4}15`, color: ACCESS_COLOR[db.access] || P.t4, border: `1px solid ${ACCESS_COLOR[db.access] || P.t4}30`, borderRadius: 3, padding: "1px 5px", fontWeight: 700, whiteSpace: "nowrap" }}>
                    {db.access}
                  </span>
                </td>
                <td style={{ padding: "7px 10px", textAlign: "center" }}>
                  <span style={{ fontSize: 8, color: db.api ? P.teal : P.t4 }}>{db.api ? "✓" : "–"}</span>
                </td>
                <td style={{ padding: "7px 10px", color: P.t2, maxWidth: 200 }}>{db.use}</td>
                <td style={{ padding: "7px 10px" }}>
                  <span style={{ fontSize: 6, background: `${VALUE_COLORS[db.value]}15`, color: VALUE_COLORS[db.value], border: `1px solid ${VALUE_COLORS[db.value]}30`, borderRadius: 3, padding: "1px 5px", fontWeight: 800 }}>
                    {db.value}
                  </span>
                </td>
                <td style={{ padding: "7px 10px", color: P.t4, maxWidth: 160, fontSize: 6 }}>{db.notes}</td>
                <td style={{ padding: "7px 10px" }}>
                  <a href={db.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 6, color: P.blue, textDecoration: "none", padding: "2px 6px", border: `1px solid ${P.blue}30`, borderRadius: 4, whiteSpace: "nowrap" }}>
                    Open →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Strategy */}
      <div style={{ background: P.card, border: `1px solid ${P.gold}30`, borderRadius: 10, padding: "14px 16px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, marginBottom: 4 }}>🤖 AI Integration Strategist</div>
        <div style={{ fontSize: 7, color: P.t4, marginBottom: 8 }}>
          Ask Claude AI for integration strategy, cross-reference paths, API ingestion recommendations, or FOIA targeting advice.
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            value={aiQuery}
            onChange={e => setAiQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && runAI()}
            placeholder="e.g. How do I cross-reference NARA draft records with INEGI data to identify Mexican-national Vietnam veterans?"
            style={{ flex: 1, fontFamily: "'IBM Plex Mono',monospace", fontSize: 7, background: "#080D18", border: `1px solid ${P.b}`, borderRadius: 6, padding: "6px 10px", color: P.t1, outline: "none" }}
          />
          <button onClick={runAI} disabled={!aiQuery.trim() || aiLoading}
            style={{ padding: "6px 14px", fontSize: 7, fontWeight: 800, cursor: "pointer", background: `${P.gold}20`, border: `1px solid ${P.gold}`, color: P.gold, borderRadius: 6, fontFamily: "inherit", opacity: aiLoading ? 0.5 : 1 }}>
            {aiLoading ? "…" : "Ask →"}
          </button>
        </div>
        {aiResponse && (
          <div style={{ marginTop: 10, fontSize: 7, color: P.t2, lineHeight: 1.8, whiteSpace: "pre-wrap", maxHeight: 240, overflowY: "auto", background: "#080D18", borderRadius: 7, padding: "10px 12px", border: `1px solid ${P.b}` }}>
            {aiResponse}
          </div>
        )}
      </div>
    </div>
  );
}
