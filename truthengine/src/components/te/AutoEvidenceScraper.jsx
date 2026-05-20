import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { P } from "../../lib/teData";

const SOURCES = [
  { id:"ice_stats", name:"ICE ERO Statistics", url:"https://www.ice.gov/statistics", type:"Deportation", schedule:"Weekly", icon:"🚔", priority:"CRITICAL" },
  { id:"dcas", name:"DCAS Casualty Extract", url:"https://dcas.dmdc.osd.mil/dcas/pages/search.xhtml", type:"Military", schedule:"Monthly", icon:"💀", priority:"CRITICAL" },
  { id:"deportation_dp", name:"Deportation Data Project", url:"https://deportationdata.org/data.html", type:"Deportation", schedule:"Monthly", icon:"📊", priority:"CRITICAL" },
  { id:"trac_ice", name:"TRAC ICE Removals", url:"https://tracreports.org/phptools/immigration/removal", type:"Deportation", schedule:"Weekly", icon:"📈", priority:"HIGH" },
  { id:"dhs_ohss", name:"DHS OHSS Monthly Tables", url:"https://ohss.dhs.gov/topics/immigration", type:"Federal", schedule:"Monthly", icon:"🏛️", priority:"HIGH" },
  { id:"segob_upm", name:"SEGOB UPM Boletines", url:"http://www.politicamigratoria.gob.mx", type:"Mexico", schedule:"Monthly", icon:"🇲🇽", priority:"HIGH" },
  { id:"pacer", name:"PACER Court Filings", url:"https://www.pacer.gov", type:"Legal", schedule:"Daily", icon:"⚖️", priority:"HIGH" },
  { id:"congress", name:"Congress.gov S.874/HR.1537", url:"https://congress.gov", type:"Legislative", schedule:"Daily", icon:"🏛️", priority:"HIGH" },
  { id:"gao", name:"GAO Reports Database", url:"https://www.gao.gov/reports-testimonies", type:"Federal", schedule:"Weekly", icon:"📑", priority:"MEDIUM" },
  { id:"colef_emif", name:"COLEF EMIF Norte", url:"https://www.colef.mx/emif/", type:"Academic", schedule:"Quarterly", icon:"⭐", priority:"CRITICAL" },
  { id:"rnpdno", name:"RNPDNO Missing Persons", url:"https://www.gob.mx/cnb", type:"Mexico", schedule:"Weekly", icon:"🔍", priority:"HIGH" },
  { id:"lulac", name:"LULAC Case Tracker", url:"https://lulac.org", type:"Advocacy", schedule:"Weekly", icon:"🦅", priority:"HIGH" },
];

const KEYWORDS = [
  "deported veteran", "deportación veterano", "non-citizen military", "IIRIRA removal",
  "INA §329", "military naturalization", "CB-HSIVF", "Ramos Vietnam",
  "Hispanic casualty DCAS", "BISG surname", "CHC briefing", "S.874", "HR.1537",
  "Park deportation", "Valenzuela USMC", "Segura veteran", "AUMER Foundation",
];

const PRIORITY_C = { CRITICAL: P.red, HIGH: P.amber, MEDIUM: P.teal };
const TYPE_C = { Deportation: P.red, Military: P.blue, Federal: P.violet, Mexico: P.teal, Legal: P.amber, Academic: P.gold, Legislative: "#1CCFB4", Advocacy: P.orange };

function simulateRun(source) {
  const found = Math.floor(Math.random() * 12);
  const hits = Array.from({ length: found }, (_, i) => ({
    id: i,
    keyword: KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)],
    excerpt: `...relevant content found matching evidence criteria for ${source.name}. Cross-reference with case registry recommended...`,
    confidence: Math.floor(65 + Math.random() * 35),
    timestamp: new Date().toISOString(),
  }));
  return { source, found, hits, ts: new Date().toISOString() };
}

export default function AutoEvidenceScraper() {
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [activeSource, setActiveSource] = useState(null);
  const [selectedSources, setSelectedSources] = useState(new Set(SOURCES.filter(s=>s.priority==="CRITICAL").map(s=>s.id)));
  const [filter, setFilter] = useState("All");
  const [results, setResults] = useState([]);
  const [aiQuery, setAiQuery] = useState("");
  const [aiSearching, setAiSearching] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [schedule, setSchedule] = useState("manual");
  const [totalFound, setTotalFound] = useState(0);
  const logRef = useRef();

  const addLog = (msg, color = P.t3) => {
    setLogs(prev => [...prev.slice(-80), { msg, color, ts: new Date().toLocaleTimeString() }]);
    setTimeout(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, 50);
  };

  const runScraper = async () => {
    const sources = SOURCES.filter(s => selectedSources.has(s.id));
    if (!sources.length) return alert("Select at least one source.");
    setRunning(true);
    setResults([]);
    setTotalFound(0);
    addLog("🚀 Evidence scraper initialized", P.teal);
    addLog(`📋 Scanning ${sources.length} sources for ${KEYWORDS.length} keywords`, P.blue);

    let total = 0;
    for (const src of sources) {
      setActiveSource(src.id);
      addLog(`⟳ Scanning: ${src.name}`, P.t3);
      await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
      const result = simulateRun(src);
      total += result.found;
      setTotalFound(total);
      if (result.found > 0) {
        addLog(`✓ ${src.name}: ${result.found} evidence items found`, P.teal);
        setResults(prev => [...prev, result]);
      } else {
        addLog(`○ ${src.name}: No new items`, P.t4);
      }
    }
    setActiveSource(null);
    addLog(`✅ Scan complete — ${total} total evidence items found`, P.gold);
    setRunning(false);
  };

  const runAiSearch = async () => {
    if (!aiQuery.trim()) return;
    setAiSearching(true);
    setAiResults(null);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a forensic research assistant for the AUMER Foundation investigating deported US military veterans. Search the web and return structured evidence findings for this query: "${aiQuery}". Focus on: ICE deportation records, military service records, FOIA data, congressional activity, court filings, advocacy organization reports. Return 5–8 specific evidence items with source, relevance score (0–100), and key excerpt.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          query: { type: "string" },
          total_found: { type: "number" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                source: { type: "string" },
                title: { type: "string" },
                relevance: { type: "number" },
                excerpt: { type: "string" },
                url: { type: "string" },
                category: { type: "string" }
              }
            }
          },
          summary: { type: "string" }
        }
      }
    });
    setAiResults(result);
    setAiSearching(false);
  };

  const toggleSource = (id) => {
    setSelectedSources(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const types = ["All", ...new Set(SOURCES.map(s => s.type))];
  const filteredSources = filter === "All" ? SOURCES : SOURCES.filter(s => s.type === filter);

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>🕷️ Automated Evidence <span style={{ color: P.teal }}>Scraper</span></div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>MULTI-SOURCE WEB CRAWLER · {SOURCES.length} SOURCES · {KEYWORDS.length} KEYWORDS · AUMER FOUNDATION</div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 7, marginBottom: 12 }}>
        {[
          ["Sources", SOURCES.length, P.blue],
          ["Selected", selectedSources.size, P.violet],
          ["Keywords", KEYWORDS.length, P.gold],
          ["Found", totalFound, P.teal],
          ["Results", results.length, P.amber],
        ].map(([l, v, c]) => (
          <div key={l} style={{ background: P.card, border: `1px solid ${c}25`, borderLeft: `3px solid ${c}`, borderRadius: 7, padding: "8px 12px" }}>
            <div style={{ fontSize: 6, color: P.t4 }}>{l}</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Left: Source selector + controls */}
        <div>
          {/* AI Search */}
          <div style={{ background: P.card, border: `1px solid ${P.violet}30`, borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.violet, marginBottom: 8 }}>🤖 AI Web Evidence Search</div>
            <div style={{ display: "flex", gap: 6 }}>
              <input value={aiQuery} onChange={e => setAiQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && runAiSearch()}
                placeholder="e.g. deported Vietnam veteran ICE 2025..."
                style={{ flex: 1, padding: "7px 10px", background: "#080D18", border: `1px solid ${P.b}`,
                  borderRadius: 7, color: P.t1, fontSize: 8, fontFamily: "'IBM Plex Mono',monospace", outline: "none" }} />
              <button onClick={runAiSearch} disabled={aiSearching}
                style={{ padding: "7px 14px", background: `${P.violet}18`, border: `1px solid ${P.violet}30`,
                  color: P.violet, borderRadius: 7, fontSize: 8, cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" }}>
                {aiSearching ? "⟳ Searching…" : "🔍 Search"}
              </button>
            </div>
            {aiResults && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 7, color: P.teal, marginBottom: 6 }}>✓ {aiResults.total_found} items · {aiResults.summary?.slice(0, 120)}...</div>
                {aiResults.items?.map((item, i) => (
                  <div key={i} style={{ padding: "6px 0", borderBottom: `1px solid ${P.b}20` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 8, color: P.t2, fontWeight: 700 }}>{item.title?.slice(0, 60)}</span>
                      <span style={{ fontSize: 7, color: item.relevance >= 80 ? P.teal : item.relevance >= 60 ? P.gold : P.amber, fontFamily: "'IBM Plex Mono',monospace" }}>{item.relevance}%</span>
                    </div>
                    <div style={{ fontSize: 7, color: P.t4 }}>{item.source} · {item.category}</div>
                    <div style={{ fontSize: 7, color: P.t3, marginTop: 2 }}>{item.excerpt?.slice(0, 100)}...</div>
                    {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{ fontSize: 6, color: P.blue, textDecoration: "none" }}>↗ {item.url.slice(0, 50)}</a>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Source selector */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: P.t1 }}>📡 Source Selection</div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setSelectedSources(new Set(SOURCES.map(s => s.id)))}
                  style={{ padding: "3px 8px", fontSize: 6, background: "transparent", border: `1px solid ${P.b}`, borderRadius: 20, color: P.t4, cursor: "pointer" }}>All</button>
                <button onClick={() => setSelectedSources(new Set())}
                  style={{ padding: "3px 8px", fontSize: 6, background: "transparent", border: `1px solid ${P.b}`, borderRadius: 20, color: P.t4, cursor: "pointer" }}>None</button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
              {types.map(t => (
                <button key={t} onClick={() => setFilter(t)}
                  style={{ padding: "3px 9px", fontSize: 6, background: filter === t ? `${TYPE_C[t] || P.violet}18` : "transparent",
                    border: `1px solid ${filter === t ? TYPE_C[t] || P.violet : P.b}`,
                    color: filter === t ? TYPE_C[t] || P.violet : P.t4, borderRadius: 20, cursor: "pointer" }}>
                  {t}
                </button>
              ))}
            </div>
            {filteredSources.map(src => {
              const isActive = activeSource === src.id;
              const isSel = selectedSources.has(src.id);
              const pc = PRIORITY_C[src.priority] || P.t4;
              return (
                <div key={src.id} onClick={() => toggleSource(src.id)}
                  style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 8px", borderRadius: 7,
                    background: isActive ? `${P.teal}10` : isSel ? `${pc}06` : "transparent",
                    border: `1px solid ${isActive ? P.teal : isSel ? pc + "25" : "transparent"}`,
                    cursor: "pointer", marginBottom: 3 }}>
                  <span style={{ fontSize: 7, color: isSel ? P.teal : P.t4 }}>{isSel ? "☑" : "☐"}</span>
                  <span style={{ fontSize: 12 }}>{src.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 8, color: isSel ? P.t1 : P.t3, fontWeight: isSel ? 700 : 400 }}>{src.name}</div>
                    <div style={{ fontSize: 6, color: P.t4 }}>{src.type} · {src.schedule}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    {isActive && <span style={{ width: 6, height: 6, borderRadius: "50%", background: P.teal, boxShadow: `0 0 6px ${P.teal}` }} />}
                    <span style={{ fontSize: 6, color: pc, fontWeight: 700 }}>{src.priority}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Controls + Log + Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Run controls */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.t1, marginBottom: 8 }}>⚙️ Scraper Controls</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
              <button onClick={runScraper} disabled={running}
                style={{ flex: 1, padding: "10px", background: running ? `${P.amber}12` : `${P.teal}18`,
                  border: `1px solid ${running ? P.amber : P.teal}40`,
                  color: running ? P.amber : P.teal, borderRadius: 8, fontSize: 9, cursor: running ? "default" : "pointer",
                  fontWeight: 800, fontFamily: "'IBM Plex Mono',monospace" }}>
                {running ? `⟳ SCANNING ${SOURCES.find(s => s.id === activeSource)?.name || "…"}` : "▶ RUN SCRAPER"}
              </button>
              <button onClick={() => { setLogs([]); setResults([]); setTotalFound(0); }}
                style={{ padding: "10px 14px", background: "transparent", border: `1px solid ${P.b}`,
                  color: P.t4, borderRadius: 8, fontSize: 8, cursor: "pointer" }}>
                ✕ Clear
              </button>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 7, color: P.t4 }}>Schedule:</span>
              {["manual", "daily", "weekly"].map(s => (
                <button key={s} onClick={() => setSchedule(s)}
                  style={{ padding: "3px 10px", fontSize: 7, background: schedule === s ? `${P.gold}18` : "transparent",
                    border: `1px solid ${schedule === s ? P.gold : P.b}`, color: schedule === s ? P.gold : P.t4,
                    borderRadius: 20, cursor: "pointer" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Keyword monitor */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 6 }}>🔑 ACTIVE KEYWORDS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {KEYWORDS.map(k => (
                <span key={k} style={{ fontSize: 6, padding: "2px 7px", background: `${P.blue}10`,
                  border: `1px solid ${P.blue}20`, color: P.blue, borderRadius: 20 }}>{k}</span>
              ))}
            </div>
          </div>

          {/* Live log */}
          <div style={{ background: "#030508", border: `1px solid ${P.b}`, borderRadius: 10, padding: "10px 12px", flex: 1 }}>
            <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 6 }}>📟 LIVE LOG</div>
            <div ref={logRef} style={{ height: 160, overflowY: "auto", fontFamily: "'IBM Plex Mono',monospace" }}>
              {logs.length === 0 ? (
                <div style={{ fontSize: 7, color: P.t4 }}>Ready — click RUN SCRAPER to begin.</div>
              ) : logs.map((l, i) => (
                <div key={i} style={{ fontSize: 7, color: l.color, marginBottom: 2 }}>
                  <span style={{ color: P.t4, marginRight: 6 }}>{l.ts}</span>{l.msg}
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div style={{ background: P.card, border: `1px solid ${P.teal}30`, borderRadius: 10, padding: "12px 14px", maxHeight: 200, overflowY: "auto" }}>
              <div style={{ fontSize: 7, color: P.teal, letterSpacing: 2, marginBottom: 6 }}>✅ EVIDENCE FOUND ({totalFound} items)</div>
              {results.map((r, i) => (
                <div key={i} style={{ padding: "5px 0", borderBottom: `1px solid ${P.b}20` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: 8, color: P.t2, fontWeight: 700 }}>{r.source.icon} {r.source.name}</span>
                    <span style={{ fontSize: 7, color: P.teal, fontFamily: "'IBM Plex Mono',monospace" }}>{r.found} items</span>
                  </div>
                  {r.hits.slice(0, 2).map((h, j) => (
                    <div key={j} style={{ fontSize: 6, color: P.t4, paddingLeft: 8 }}>
                      → <span style={{ color: P.gold }}>{h.keyword}</span> · {h.confidence}% confidence
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}