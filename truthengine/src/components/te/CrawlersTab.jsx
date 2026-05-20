import { useState, useEffect } from "react";
import { P, CRAWLERS } from "../../lib/teData";

const KEYWORDS_PRIMARY = ["deported veteran","Vietnam casualty","DCAS","Hispanic military","foreign national service"];
const KEYWORDS_SECONDARY = ["349 anomaly","BISG","erasure","naturalization denial","ICE ENFORCE","VA benefits denied"];

const NEXT_RUN_SECS = 6 * 3600; // 6 hours in seconds

export default function CrawlersTab() {
  const [countdown, setCountdown] = useState(NEXT_RUN_SECS - (Math.floor(Date.now()/1000) % NEXT_RUN_SECS));

  useEffect(() => {
    const t = setInterval(() => setCountdown(p => p <= 1 ? NEXT_RUN_SECS : p - 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmtC = s => `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m ${s%60}s`;
  const totalActive = CRAWLERS.reduce((a,c) => a + c.items.filter(i=>i.status==="active").length, 0);
  const totalGap = CRAWLERS.reduce((a,c) => a + c.items.filter(i=>i.status==="GAP").length, 0);

  return (
    <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 110px)" }}>

      {/* Header stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:8, marginBottom:12 }}>
        {[
          { l:"Active Crawlers", v:totalActive, c:P.teal },
          { l:"Categories", v:CRAWLERS.length, c:P.blue },
          { l:"Schedule", v:"6hr", c:P.amber },
          { l:"Critical Gaps", v:totalGap, c:P.red },
        ].map((s,i) => (
          <div key={i} style={{ background:P.card, border:"1px solid "+s.c+"25", borderTop:"2px solid "+s.c, borderRadius:7, padding:"8px 12px", textAlign:"center" }}>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:800, color:s.c }}>{s.v}</div>
            <div style={{ fontSize:7, color:P.t4 }}>{s.l}</div>
          </div>
        ))}
        <div style={{ background:P.card, border:"1px solid "+P.violet+"25", borderTop:"2px solid "+P.violet, borderRadius:7, padding:"8px 12px", textAlign:"center" }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:800, color:P.violet }}>{fmtC(countdown)}</div>
          <div style={{ fontSize:7, color:P.t4 }}>Next Sweep</div>
          <div style={{ background:"#080D18", borderRadius:2, height:3, marginTop:3, overflow:"hidden" }}>
            <div style={{ width:((NEXT_RUN_SECS-countdown)/NEXT_RUN_SECS*100)+"%", height:"100%", background:P.violet, transition:"width 1s linear" }} />
          </div>
        </div>
      </div>

      {/* GAP alert */}
      <div style={{ background:"#FF5C5C08", border:"1px solid #FF5C5C30", borderLeft:"4px solid "+P.red,
        borderRadius:8, padding:"8px 12px", marginBottom:12, fontSize:8, color:P.red }}>
        ⚠ <strong>CRITICAL GAP:</strong> YouTube not connected. 10k units/day quota plan needed.
        Key content: Cronkite Archive, American Exile PBS, Life After Deportation series.
        <strong> Build n8n YouTube node — Sprint 4 priority.</strong>
      </div>

      {/* Crawler grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:10, marginBottom:12 }}>
        {CRAWLERS.map((cat, ci) => (
          <div key={ci} style={{ background:P.card, border:"1px solid "+P.b, borderRadius:10, overflow:"hidden" }}>
            <div style={{ background:"linear-gradient(90deg,"+cat.color+"12,transparent)", borderBottom:"1px solid "+P.b,
              padding:"7px 12px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:10, fontWeight:700, color:cat.color }}>{cat.cat}</span>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:cat.color }}>
                {cat.items.filter(i=>i.status==="active").length}/{cat.items.length} active
              </span>
            </div>
            <div style={{ padding:"8px 12px" }}>
              {cat.items.map((item, ii) => {
                const isGap = item.status === "GAP";
                const isPaused = item.status === "paused";
                const sc = isGap ? P.red : isPaused ? P.amber : P.teal;
                return (
                  <div key={ii} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                    padding:"4px 0", borderBottom:"1px solid "+P.b+"20" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ width:6, height:6, borderRadius:"50%", background:sc, display:"inline-block",
                        opacity: isGap ? 1 : isPaused ? 0.6 : 1 }} />
                      <span style={{ fontSize:8, color: isGap ? P.red : isPaused ? P.amber : P.t2, fontWeight: isGap ? 700 : 400 }}>
                        {item.name}
                      </span>
                    </div>
                    <span style={{ fontSize:7, color: isGap ? P.red : P.t4 }}>
                      {isGap ? "⚠ NOT CONNECTED" : item.last}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Keyword Lexicon */}
      <div style={{ background:P.card, border:"1px solid "+P.b, borderRadius:10, overflow:"hidden" }}>
        <div style={{ background:"linear-gradient(90deg,"+P.gold+"12,transparent)", borderBottom:"1px solid "+P.b, padding:"8px 14px" }}>
          <span style={{ fontSize:10, fontWeight:700, color:P.t1, fontFamily:"'IBM Plex Mono',monospace" }}>🔑 Keyword Lexicon — All 30 Crawlers</span>
        </div>
        <div style={{ padding:"10px 14px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <div>
            <div style={{ fontSize:7, color:P.gold, letterSpacing:2, fontWeight:700, marginBottom:5 }}>PRIMARY</div>
            <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
              {KEYWORDS_PRIMARY.map(k => (
                <span key={k} style={{ fontSize:8, background:P.gold+"12", border:"1px solid "+P.gold+"20", color:P.gold, borderRadius:4, padding:"2px 7px" }}>"{k}"</span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize:7, color:P.blue, letterSpacing:2, fontWeight:700, marginBottom:5 }}>SECONDARY</div>
            <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
              {KEYWORDS_SECONDARY.map(k => (
                <span key={k} style={{ fontSize:8, background:P.blue+"12", border:"1px solid "+P.blue+"20", color:P.blue, borderRadius:4, padding:"2px 7px" }}>"{k}"</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}