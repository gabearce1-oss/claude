import { useState, useMemo } from "react";
import { P, SEARCH_INDEX } from "../../lib/teData";
import HomeOverview from "./HomeOverview";

const TIER_COLORS = { Gold:"#F5C842", Silver:"#B8CCE8", Bronze:"#FF8C42", Critical:"#FF5C5C" };
const TYPE_COLORS = {
  "DCAS Record":"#4A9EFF", "Verified Case":"#F5C842", "FOIA Status":"#FF5C5C",
  "Legislation":"#9D7BFF", "BISG Analysis":"#1CCFB4", "Registry Stat":"#FF8C42"
};

export default function SearchTab({ setTab }) {
  const [query, setQuery] = useState("");
  const [selResult, setSelResult] = useState(null);
  const [filterType, setFilterType] = useState("All");

  const types = ["All", ...Array.from(new Set(SEARCH_INDEX.map(r => r.type)))];

  const results = useMemo(() => {
    if (!query.trim()) return SEARCH_INDEX;
    const q = query.toLowerCase();
    return SEARCH_INDEX.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.snippet.toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q)) ||
      r.id.toLowerCase().includes(q)
    ).filter(r => filterType === "All" || r.type === filterType);
  }, [query, filterType]);

  const handleSearch = (q) => { setQuery(q); setSelResult(null); };
  const isHome = !query.trim();

  return (
    <div style={{ display:"flex", gap:0, height:"calc(100vh - 118px)", overflow:"hidden" }}>

      {/* Main area */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* Search bar */}
        <div style={{ padding:"12px 16px", borderBottom:`1px solid ${P.b}`, background:P.card }}>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
              color:P.t3, fontSize:16, pointerEvents:"none" }}>🔍</span>
            <input
              value={query}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search the intelligence corpus: 'DCAS 349' · 'deported veteran Mexico' · 'CASE-C001' · 'FOIA VA BIRLS'..."
              style={{ width:"100%", padding:"11px 14px 11px 42px", background:"#080D18",
                border:`1px solid ${P.b}`, borderRadius:9, color:P.t1, fontSize:11,
                fontFamily:"'IBM Plex Mono',monospace", outline:"none", boxSizing:"border-box",
                transition:"border-color .2s, box-shadow .2s" }}
              onFocus={e => { e.target.style.borderColor = P.blue; e.target.style.boxShadow = `0 0 0 3px ${P.blue}18`; }}
              onBlur={e => { e.target.style.borderColor = P.b; e.target.style.boxShadow = "none"; }}
            />
            {query && (
              <button onClick={() => handleSearch("")}
                style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                  background:"transparent", border:"none", color:P.t4, fontSize:16, cursor:"pointer", lineHeight:1 }}>
                ×
              </button>
            )}
          </div>

          {/* Filter bar — only show when searching */}
          {!isHome && (
            <div style={{ display:"flex", gap:5, marginTop:8, flexWrap:"wrap", alignItems:"center" }}>
              {types.map(t => (
                <button key={t} onClick={() => setFilterType(t)}
                  style={{ padding:"2px 9px", fontSize:8, background: filterType===t ? `${P.blue}22` : "transparent",
                    border:`1px solid ${filterType===t ? P.blue : P.b}`, borderRadius:20,
                    color: filterType===t ? P.blue : P.t4, cursor:"pointer" }}>
                  {t}
                </button>
              ))}
              <span style={{ marginLeft:"auto", fontSize:8, color:P.t4 }}>{results.length} result{results.length !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        {/* Content area */}
        <div style={{ flex:1, overflowY:"auto", padding:"0 16px" }}>
          {isHome ? (
            <HomeOverview onSearch={handleSearch} setTab={setTab} />
          ) : (
            <div style={{ paddingTop:10, paddingBottom:16 }}>
              {results.length === 0 ? (
                <div style={{ background:"#080D18", borderRadius:10, padding:"24px", textAlign:"center", marginTop:8 }}>
                  <div style={{ fontSize:24, marginBottom:8 }}>🔍</div>
                  <div style={{ fontSize:11, color:P.t3, marginBottom:4 }}>No results for "{query}"</div>
                  <div style={{ fontSize:9, color:P.t4 }}>Try: "DCAS" · "veteran" · "FOIA" · "BISG" · "C001"</div>
                </div>
              ) : results.map((r) => {
                const isOpen = selResult === r.id;
                const tc = TIER_COLORS[r.confidence] || P.t4;
                const vc = TYPE_COLORS[r.type] || P.blue;
                return (
                  <div key={r.id} onClick={() => setSelResult(isOpen ? null : r.id)}
                    style={{ background: isOpen ? P.card : "transparent",
                      border:`1px solid ${isOpen ? vc+"50" : P.b+"40"}`,
                      borderLeft:`4px solid ${vc}`, borderRadius:9, padding:"10px 14px",
                      marginBottom:7, cursor:"pointer", transition:"all .12s" }}
                    onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = "#0D152590"; }}
                    onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = "transparent"; }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", gap:6, marginBottom:3, flexWrap:"wrap", alignItems:"center" }}>
                          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7,
                            background:"#080D18", border:`1px solid ${P.b}`, color:P.t4,
                            borderRadius:3, padding:"1px 5px" }}>{r.id}</span>
                          <span style={{ fontSize:7, background:`${vc}18`, border:`1px solid ${vc}30`,
                            color:vc, borderRadius:3, padding:"1px 5px" }}>{r.type}</span>
                          <span style={{ fontSize:7, color:P.t4 }}>{r.date}</span>
                        </div>
                        <div style={{ fontSize:11, fontWeight:700, color:P.t1, marginBottom:2 }}>{r.title}</div>
                        {!isOpen && <div style={{ fontSize:8, color:P.t3, lineHeight:1.5 }}>{r.snippet.slice(0, 100)}...</div>}
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:4, flexShrink:0, alignItems:"flex-end" }}>
                        <span style={{ background:`${tc}18`, border:`1px solid ${tc}40`, color:tc,
                          borderRadius:20, padding:"2px 8px", fontSize:7, fontWeight:700 }}>{r.confidence}</span>
                        {r.bisg !== null && (
                          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:P.violet,
                            background:P.violet+"10", borderRadius:3, padding:"1px 5px" }}>
                            p(H)={r.bisg.toFixed(2)}
                          </span>
                        )}
                        <span style={{ fontSize:7, color:P.t4 }}>{r.sources} src</span>
                      </div>
                    </div>

                    {isOpen && (
                      <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${P.b}30` }}>
                        <div style={{ fontSize:9, color:P.t2, lineHeight:1.8, marginBottom:8 }}>{r.snippet}</div>
                        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                          {r.tags.map(t => (
                            <span key={t} onClick={e => { e.stopPropagation(); handleSearch(t); }}
                              style={{ fontSize:8, background:`${vc}12`, border:`1px solid ${vc}20`,
                                color:vc, borderRadius:4, padding:"2px 7px", cursor:"pointer" }}>
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: Live Feed */}
      <div style={{ width:230, borderLeft:`1px solid ${P.b}`, display:"flex", flexDirection:"column",
        background:"#050810", flexShrink:0 }}>
        <div style={{ padding:"12px 14px", borderBottom:`1px solid ${P.b}` }}>
          <div style={{ fontSize:8, color:P.teal, letterSpacing:3, fontWeight:700, marginBottom:2 }}>📡 LIVE FEED</div>
          <div style={{ fontSize:7, color:P.t4 }}>n8n · 30 crawlers · 6hr cycle</div>
        </div>

        {/* Status pills */}
        <div style={{ padding:"8px 14px", borderBottom:`1px solid ${P.b}`, display:"flex", gap:5 }}>
          {[["30", "Active", P.teal], ["3", "Overdue", P.red], ["1", "Gap", P.amber]].map(([n,l,c]) => (
            <div key={l} style={{ flex:1, background:`${c}10`, border:`1px solid ${c}25`,
              borderRadius:6, padding:"4px 0", textAlign:"center" }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:800, color:c }}>{n}</div>
              <div style={{ fontSize:6, color:P.t4 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"8px 14px" }}>
          {[
            { type:"MATCH", msg:"DCAS record corroborated — BISG 0.84", t:"2m", c:P.teal },
            { type:"CRAWL", msg:"Military Times — 2 new articles", t:"5m", c:P.blue },
            { type:"ALERT", msg:"Reddit — Sae Joon Park update", t:"12m", c:P.amber },
            { type:"HASH", msg:"C004 SHA-256 certified", t:"18m", c:P.gold },
            { type:"FOIA", msg:"VA BIRLS — no response (Day 83)", t:"1h", c:P.red },
            { type:"SHELTER", msg:"Casa del Migrante — new intake", t:"2h", c:P.orange },
            { type:"MATCH", msg:"Congress.gov S.874 — update", t:"3h", c:P.teal },
            { type:"MEDIA", msg:"AP News — deported veteran story", t:"4h", c:P.violet },
            { type:"CRAWL", msg:"UNHCR — new report indexed", t:"5h", c:P.blue },
            { type:"ALERT", msg:"DHS ENFORCE FOIA — Day 66", t:"6h", c:P.red },
          ].map((e,i) => (
            <div key={i} style={{ marginBottom:8, paddingBottom:7, borderBottom:`1px solid ${P.b}20` }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                <span style={{ fontSize:7, background:`${e.c}18`, border:`1px solid ${e.c}30`,
                  color:e.c, borderRadius:3, padding:"1px 5px", fontWeight:700 }}>{e.type}</span>
                <span style={{ fontSize:7, color:P.t4 }}>{e.t} ago</span>
              </div>
              <div style={{ fontSize:8, color:P.t3, lineHeight:1.4 }}>{e.msg}</div>
            </div>
          ))}
        </div>

        {/* Quick nav */}
        <div style={{ padding:"10px 14px", borderTop:`1px solid ${P.b}` }}>
          <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:6 }}>QUICK NAV</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
            {[["DCAS","dcas",P.blue],["Veterans","veterans",P.gold],["FOIA","foia",P.red],["CHC Brief","briefing",P.amber]].map(([l,t,c]) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding:"5px 4px", background:`${c}10`, border:`1px solid ${c}25`,
                  borderRadius:5, color:c, fontSize:7, fontWeight:700, cursor:"pointer", textAlign:"center" }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}