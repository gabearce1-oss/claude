import { useState, useMemo } from "react";
import { P } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

const DATABASES = [
  { id:"all",        label:"All Sources",         icon:"🌐" },
  { id:"dcas",       label:"DCAS (DoD)",           icon:"💀", url:"https://dcas.dmdc.osd.mil/dcas/pages/search.xhtml" },
  { id:"ice_stats",  label:"ICE ERO Statistics",   icon:"🚔", url:"https://www.ice.gov/statistics" },
  { id:"deportation_dp", label:"Deportation Data Project", icon:"📊", url:"https://deportationdata.org/data.html" },
  { id:"trac",       label:"TRAC ICE Removals",    icon:"📈", url:"https://tracreports.org/phptools/immigration/remove/about_data.html" },
  { id:"dhs_ohss",   label:"DHS OHSS Monthly",     icon:"🏛️", url:"https://ohss.dhs.gov/topics/immigration/immigration-enforcement/monthly-tables" },
  { id:"pacer",      label:"PACER / RECAP",         icon:"🏛️", url:"https://www.pacer.gov" },
  { id:"nara",       label:"NARA eVetRecs",         icon:"📜", url:"https://www.archives.gov/veterans/military-service-records" },
  { id:"va_birls",   label:"VA BIRLS",              icon:"🏥", url:"https://www.va.gov" },
  { id:"google_scholar", label:"Google Scholar",   icon:"🎓", url:"https://scholar.google.com" },
  { id:"jstor",      label:"JSTOR",                 icon:"📚", url:"https://www.jstor.org" },
  { id:"lexis",      label:"LexisNexis",            icon:"⚖️", url:"https://www.lexisnexis.com" },
  { id:"congress",   label:"Congress.gov",          icon:"🏛️", url:"https://congress.gov" },
  { id:"colef_emif", label:"COLEF EMIF Norte",      icon:"⭐", url:"https://www.colef.mx/emif/" },
  { id:"unam",       label:"UNAM Repositorio",      icon:"🎓", url:"https://repositorio.unam.mx/" },
  { id:"inegi",      label:"INEGI",                 icon:"🇲🇽", url:"https://www.inegi.org.mx" },
  { id:"gao",        label:"GAO Reports",           icon:"📑", url:"https://www.gao.gov/reports-testimonies" },
  { id:"segob",      label:"SEGOB UPM",             icon:"🇲🇽", url:"http://www.politicamigratoria.gob.mx/es/PoliticaMigratoria/Boletines_Estadisticos" },
  { id:"unhcr",      label:"UNHCR Mexico",          icon:"🏕️", url:"https://help.unhcr.org/mexico/en/where-to-seek-help/albergues/" },
  { id:"sdsu",       label:"SDSU Digital Collections", icon:"🌊", url:"https://digitalcollections.sdsu.edu" },
];

const PRESET_QUERIES = [
  { label:"Hispanic Vietnam casualties", q:"Hispanic Latino Vietnam War casualties undercount" },
  { label:"IIRIRA veteran deportation", q:"IIRIRA 1996 non-citizen veteran deportation retroactive" },
  { label:"BISG surname method", q:"BISG Bayesian Improved Surname Geocoding race ethnicity" },
  { label:"INA §329 military naturalization", q:"INA section 329 military naturalization non-citizen" },
  { label:"Deported veterans Mexico", q:"deported veterans Mexico shelter Tijuana humanitarian" },
  { label:"DCAS race coding", q:"DCAS Defense Casualty Analysis race ethnicity coding" },
  { label:"NERO erasure model", q:"NERO model institutional erasure racial data gap" },
  { label:"GAO-19-416", q:"GAO 19-416 deported veterans military service" },
  { label:"EO-14012 IMMVI", q:"Executive Order 14012 IMMVI immigrant veteran integration" },
  { label:"COLEF EMIF deportee survey", q:"COLEF EMIF Norte deportee survey Mexico border migration" },
];

const RESULT_TYPES = {
  academic:  { color:P.blue,   icon:"🎓", label:"Academic" },
  legal:     { color:P.violet, icon:"⚖️", label:"Legal" },
  gov:       { color:P.red,    icon:"🏛️", label:"Government" },
  ngo:       { color:P.teal,   icon:"🦅", label:"NGO/Advocacy" },
  news:      { color:P.amber,  icon:"📰", label:"News" },
  data:      { color:P.gold,   icon:"💾", label:"Dataset" },
};

export default function EnhancedSearch() {
  const [query, setQuery] = useState("");
  const [selectedDBs, setSelectedDBs] = useState(new Set(["all"]));
  const [keywords, setKeywords] = useState([]);
  const [kwInput, setKwInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [saved, setSaved] = useState(new Set());
  const [saving, setSaving] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");

  const toggleDB = (id) => {
    setSelectedDBs(prev => {
      const n = new Set(prev);
      if (id === "all") return new Set(["all"]);
      n.delete("all");
      n.has(id) ? n.delete(id) : n.add(id);
      if (n.size === 0) return new Set(["all"]);
      return n;
    });
  };

  const addKeyword = (kw) => {
    const k = kw.trim();
    if (k && !keywords.includes(k)) setKeywords(p => [...p, k]);
    setKwInput("");
  };

  const removeKeyword = (kw) => setKeywords(p => p.filter(k => k !== kw));

  const selectedDBList = selectedDBs.has("all")
    ? DATABASES.filter(d => d.id !== "all")
    : DATABASES.filter(d => selectedDBs.has(d.id));

  const fullQuery = [query, ...keywords].filter(Boolean).join(" AND ");

  const runSearch = async () => {
    if (!fullQuery.trim()) return;
    setSearching(true);
    setResults([]);

    const dbContext = selectedDBs.has("all")
      ? "all relevant databases including DCAS, ICE statistics, PACER, Google Scholar, NARA, JSTOR, GAO reports, Congress.gov, COLEF EMIF, UNAM, INEGI"
      : selectedDBList.map(d => d.label).join(", ");

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a forensic research assistant for the AUMER Foundation investigating Hispanic veteran deportation, DCAS data gaps, and immigration policy. Search the following databases: ${dbContext}.\n\nSearch query: "${fullQuery}"\n\nReturn 8-12 highly relevant results. For each result provide:\n- title: specific document/article/database entry title\n- source: source name and database\n- type: one of: academic, legal, gov, ngo, news, data\n- url: real URL if known, else most relevant direct link\n- snippet: 2-sentence summary of relevance to veteran deportation research\n- year: publication year if known\n- relevance: score 1-100 for relevance to this query\n- keywords: 3-5 tags\n\nFocus on real, verifiable sources. Prioritize primary sources over secondary.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          results: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title:     { type: "string" },
                source:    { type: "string" },
                type:      { type: "string" },
                url:       { type: "string" },
                snippet:   { type: "string" },
                year:      { type: "string" },
                relevance: { type: "number" },
                keywords:  { type: "array", items: { type: "string" } },
              }
            }
          }
        }
      }
    });

    setResults((res.results || []).sort((a, b) => b.relevance - a.relevance));
    setSearching(false);
  };

  const saveResult = async (r) => {
    setSaving(r.title);
    await base44.entities.ResearchDoc.create({
      title: r.title,
      tldr: r.snippet,
      source_url: r.url,
      cluster_tags: (r.keywords || []).join(", "),
      relevance_score: r.relevance,
      dataset: r.source,
    });
    setSaved(p => new Set([...p, r.title]));
    setSaving(null);
  };

  const filtered = typeFilter === "all" ? results : results.filter(r => r.type === typeFilter);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P.t1 }}>🔍 Research <span style={{ color: P.gold }}>Search Engine</span></div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>MULTI-DATABASE · KEYWORD FILTERS · AI-POWERED · LIVE WEB SEARCH</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 12 }}>
        {/* LEFT — Search controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Main query */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 6 }}>SEARCH QUERY</div>
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter search query..."
              onKeyDown={e => { if (e.key === "Enter" && e.metaKey) runSearch(); }}
              style={{ width: "100%", padding: "8px 10px", background: "#080D18", border: `1px solid ${query ? P.gold : P.b}`,
                borderRadius: 7, color: P.t1, fontSize: 9, outline: "none", resize: "none", height: 70,
                fontFamily: "'IBM Plex Mono',monospace", boxSizing: "border-box" }}
            />

            {/* Preset queries */}
            <div style={{ fontSize: 7, color: P.t4, letterSpacing: 1, marginTop: 8, marginBottom: 5 }}>PRESETS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {PRESET_QUERIES.map(p => (
                <button key={p.q} onClick={() => setQuery(p.q)}
                  style={{ padding: "2px 7px", fontSize: 6, cursor: "pointer",
                    background: `${P.violet}12`, border: `1px solid ${P.violet}20`,
                    color: P.violet, borderRadius: 20 }}>{p.label}</button>
              ))}
            </div>
          </div>

          {/* Keyword filters */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 6 }}>KEYWORD FILTERS (AND)</div>
            <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
              <input value={kwInput} onChange={e => setKwInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addKeyword(kwInput); }}
                placeholder="Add keyword... (Enter)"
                style={{ flex: 1, padding: "5px 8px", background: "#080D18", border: `1px solid ${P.b}`,
                  borderRadius: 6, color: P.t1, fontSize: 8, outline: "none", fontFamily: "'IBM Plex Mono',monospace" }} />
              <button onClick={() => addKeyword(kwInput)}
                style={{ padding: "5px 10px", fontSize: 9, cursor: "pointer",
                  background: `${P.gold}15`, border: `1px solid ${P.gold}30`, color: P.gold, borderRadius: 6 }}>+</button>
            </div>
            {keywords.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {keywords.map(k => (
                  <span key={k} onClick={() => removeKeyword(k)}
                    style={{ display: "flex", gap: 4, alignItems: "center", padding: "2px 8px",
                      background: `${P.amber}15`, border: `1px solid ${P.amber}25`, borderRadius: 20,
                      color: P.amber, fontSize: 7, cursor: "pointer" }}>
                    {k} <span style={{ color: P.red }}>✕</span>
                  </span>
                ))}
              </div>
            )}
            {fullQuery && (
              <div style={{ marginTop: 6, padding: "5px 8px", background: "#080D18", borderRadius: 5, fontSize: 7, color: P.t4 }}>
                Full: <span style={{ color: P.gold }}>{fullQuery}</span>
              </div>
            )}
          </div>

          {/* Database selector */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 6 }}>SELECT DATABASES</div>
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {DATABASES.map(db => {
                const isSel = selectedDBs.has(db.id);
                return (
                  <div key={db.id} onClick={() => toggleDB(db.id)}
                    style={{ display: "flex", gap: 8, alignItems: "center", padding: "5px 7px", marginBottom: 3,
                      background: isSel ? `${P.blue}12` : "transparent",
                      border: `1px solid ${isSel ? P.blue + "30" : P.b + "10"}`,
                      borderRadius: 6, cursor: "pointer" }}>
                    <span style={{ fontSize: 8 }}>{isSel ? "☑" : "☐"}</span>
                    <span style={{ fontSize: 11 }}>{db.icon}</span>
                    <span style={{ fontSize: 7, color: isSel ? P.blue : P.t3, flex: 1 }}>{db.label}</span>
                    {db.url && (
                      <a href={db.url} target="_blank" rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{ fontSize: 7, color: P.t4, textDecoration: "none" }}>↗</a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Search button */}
          <button onClick={runSearch} disabled={searching || !fullQuery.trim()}
            style={{ padding: "11px", fontSize: 10, fontWeight: 800, cursor: searching || !fullQuery.trim() ? "not-allowed" : "pointer",
              background: searching ? P.b : `linear-gradient(135deg,${P.gold},${P.amber})`,
              border: "none", color: searching ? P.t4 : "#000", borderRadius: 9 }}>
            {searching ? "⟳ Searching..." : "🔍 Run Search"}
          </button>
        </div>

        {/* RIGHT — Results */}
        <div>
          {/* Type filter + stats */}
          {results.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button onClick={() => setTypeFilter("all")}
                style={{ padding: "3px 10px", fontSize: 7, cursor: "pointer",
                  background: typeFilter === "all" ? `${P.t1}15` : "transparent",
                  border: `1px solid ${typeFilter === "all" ? P.t1 : P.b}`,
                  color: typeFilter === "all" ? P.t1 : P.t4, borderRadius: 20 }}>
                All ({results.length})
              </button>
              {Object.entries(RESULT_TYPES).map(([k, v]) => {
                const cnt = results.filter(r => r.type === k).length;
                if (!cnt) return null;
                return (
                  <button key={k} onClick={() => setTypeFilter(k)}
                    style={{ padding: "3px 10px", fontSize: 7, cursor: "pointer",
                      background: typeFilter === k ? `${v.color}20` : "transparent",
                      border: `1px solid ${typeFilter === k ? v.color : P.b}`,
                      color: typeFilter === k ? v.color : P.t4, borderRadius: 20 }}>
                    {v.icon} {v.label} ({cnt})
                  </button>
                );
              })}
              <span style={{ marginLeft: "auto", fontSize: 7, color: P.t4 }}>
                Searched: {selectedDBs.has("all") ? "All databases" : selectedDBList.map(d=>d.label).join(", ")}
              </span>
            </div>
          )}

          {/* Results list */}
          {filtered.map((r, i) => {
            const rt = RESULT_TYPES[r.type] || RESULT_TYPES.academic;
            const isSaved = saved.has(r.title);
            return (
              <div key={i} style={{ background: P.card, border: `1px solid ${rt.color}20`,
                borderLeft: `4px solid ${rt.color}`, borderRadius: 9, padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontSize: 7, background: `${rt.color}15`, border: `1px solid ${rt.color}25`,
                        color: rt.color, borderRadius: 20, padding: "1px 7px", fontWeight: 700 }}>
                        {rt.icon} {rt.label}
                      </span>
                      <span style={{ fontSize: 7, color: P.t4 }}>{r.source}</span>
                      {r.year && <span style={{ fontSize: 7, color: P.t4 }}>{r.year}</span>}
                      <span style={{ fontSize: 7, background: `${P.gold}12`, border: `1px solid ${P.gold}20`,
                        color: P.gold, borderRadius: 20, padding: "1px 6px" }}>
                        Rel: {r.relevance}%
                      </span>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: P.t1, marginBottom: 5, lineHeight: 1.3 }}>
                      {r.url ? (
                        <a href={r.url} target="_blank" rel="noreferrer"
                          style={{ color: P.t1, textDecoration: "none" }}>
                          {r.title} <span style={{ color: P.blue, fontSize: 8 }}>↗</span>
                        </a>
                      ) : r.title}
                    </div>
                    <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.7, marginBottom: 6 }}>{r.snippet}</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {(r.keywords || []).map(k => (
                        <span key={k} onClick={() => addKeyword(k)}
                          style={{ fontSize: 6, padding: "1px 7px", background: `${rt.color}10`,
                            border: `1px solid ${rt.color}20`, color: rt.color, borderRadius: 20, cursor: "pointer" }}>
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noreferrer"
                        style={{ padding: "4px 10px", fontSize: 7, fontWeight: 700, cursor: "pointer",
                          background: `${P.blue}12`, border: `1px solid ${P.blue}25`, color: P.blue,
                          borderRadius: 6, textDecoration: "none", textAlign: "center" }}>
                        🔗 Open
                      </a>
                    )}
                    <button onClick={() => saveResult(r)} disabled={isSaved || saving === r.title}
                      style={{ padding: "4px 10px", fontSize: 7, fontWeight: 700, cursor: "pointer",
                        background: isSaved ? `${P.teal}15` : `${P.violet}12`,
                        border: `1px solid ${isSaved ? P.teal : P.violet}25`,
                        color: isSaved ? P.teal : P.violet, borderRadius: 6 }}>
                      {saving === r.title ? "⟳" : isSaved ? "✓ Saved" : "💾 Save"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {!searching && results.length === 0 && (
            <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "40px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
              <div style={{ fontSize: 9, color: P.t4, lineHeight: 1.8 }}>
                Enter a query, add keyword filters, select target databases, then click Run Search.<br/>
                Results are AI-powered with live web search and linkable to primary sources.
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {DATABASES.filter(d => d.id !== "all" && d.url).slice(0, 8).map(db => (
                  <a key={db.id} href={db.url} target="_blank" rel="noreferrer"
                    style={{ display: "flex", gap: 5, alignItems: "center", padding: "5px 10px",
                      background: P.card, border: `1px solid ${P.b}`, borderRadius: 20,
                      color: P.t3, fontSize: 7, textDecoration: "none" }}>
                    {db.icon} {db.label} ↗
                  </a>
                ))}
              </div>
            </div>
          )}

          {searching && (
            <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "40px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: P.t4 }}>
                ⟳ Searching {selectedDBs.has("all") ? "all databases" : selectedDBList.length + " databases"} for "{fullQuery}"...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}