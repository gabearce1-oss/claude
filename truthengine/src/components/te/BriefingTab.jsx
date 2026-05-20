import { P, KEY_STATS, CASES, CONVERGENCE_STREAMS } from "../../lib/teData";

const CHC_DATE = new Date("2026-05-18");
const CHC_DAYS = Math.ceil((CHC_DATE - new Date()) / 86400000);

const NERO_SCORES = [
  { label:"N — Notification", score:94, desc:"Citizenship promise never formalized — veterans never informed of deportation risk post-service" },
  { label:"E — Erasure", score:97, desc:"Perpetual foreignness: service doesn't confer membership → DCAS 349 reflects institutional ambiguity" },
  { label:"R — Restriction", score:91, desc:"Perceived illegality post-service → restricts VA access, naturalization, and due process" },
  { label:"O — Obscurity", score:96, desc:"Ambiguous membership → deportation statistically invisible → BI-2 Estimation Vacuum both agencies" },
];

export default function BriefingTab() {
  return (
    <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 110px)" }}>

      {/* Briefing header */}
      <div style={{ background:"linear-gradient(135deg,"+P.gold+"15,"+P.red+"08)", border:"2px solid "+P.gold+"40",
        borderRadius:12, padding:"16px 20px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:8, color:P.gold, letterSpacing:4, fontWeight:700, marginBottom:4 }}>🏛️ CONGRESSIONAL HISPANIC CAUCUS BRIEFING PACKAGE</div>
          <div style={{ fontSize:16, fontWeight:800 }}>CB-HSIVF Certified · 6 Verified Cases · DCAS 349 Anomaly</div>
          <div style={{ fontSize:9, color:P.t3, marginTop:3 }}>May 18, 2026 · All materials SHA-256 certified · BISG forensic methodology documented</div>
        </div>
        <div style={{ textAlign:"center", flexShrink:0 }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:36, fontWeight:800, color:CHC_DAYS <= 30 ? P.red : P.gold }}>{CHC_DAYS}</div>
          <div style={{ fontSize:8, color:P.t4 }}>days to CHC</div>
        </div>
      </div>

      {/* Key statistics */}
      <div style={{ background:P.card, border:"1px solid "+P.b, borderRadius:12, marginBottom:12, overflow:"hidden" }}>
        <div style={{ background:"linear-gradient(90deg,"+P.gold+"12,transparent)", borderBottom:"1px solid "+P.b, padding:"9px 14px" }}>
          <span style={{ fontSize:11, fontWeight:700, color:P.t1 }}>📊 Key Statistics — Presentation Ready</span>
        </div>
        <div style={{ padding:"12px 16px", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:8 }}>
          {[
            { l:"DCAS Total Records", v:"58,220", src:"DCAS audit", c:P.blue },
            { l:"Official Hispanic Coded", v:"349 (0.60%)", src:"DCAS audit", c:P.red },
            { l:"BISG Corrected Estimate", v:"2,309+ (3.97%)", src:"BISG methodology", c:P.violet },
            { l:"Classification Failure Rate", v:"84.9%", src:"5-stream convergence", c:P.amber },
            { l:"Estimated Erased Veterans", v:"~1,960", src:"Bernoulli Sum Variance", c:P.pink },
            { l:"Deported Jan–Jun 2025", v:"10,000+", src:"Rep. Ansari letter", c:P.red },
            { l:"GAO 2019 Confirmed", v:"92", src:"GAO report", c:P.orange },
            { l:"At-Risk Non-Citizen Vets", v:"115,000", src:"CRS 2024", c:P.amber },
            { l:"LULAC Tracking (6 countries)", v:"400+", src:"LULAC March 2026", c:P.violet },
            { l:"Verified CB-HSIVF Cases", v:"6", src:"SHA-256 certified", c:P.gold },
          ].map((s,i) => (
            <div key={i} style={{ background:"#080D18", border:"1px solid "+s.c+"20", borderRadius:7, padding:"8px 10px" }}>
              <div style={{ fontSize:7, color:P.t4, marginBottom:3 }}>{s.l}</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:15, fontWeight:800, color:s.c, marginBottom:2 }}>{s.v}</div>
              <div style={{ fontSize:6, color:P.t4 }}>Source: {s.src}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Case summaries */}
      <div style={{ background:P.card, border:"1px solid "+P.b, borderRadius:12, marginBottom:12, overflow:"hidden" }}>
        <div style={{ background:"linear-gradient(90deg,"+P.amber+"12,transparent)", borderBottom:"1px solid "+P.b, padding:"9px 14px" }}>
          <span style={{ fontSize:11, fontWeight:700, color:P.t1 }}>🎖️ 6 Verified Case Summaries — CB-HSIVF Certified</span>
        </div>
        <div style={{ padding:"10px 14px", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:8 }}>
          {CASES.map((c,i) => {
            const tc = c.tier==="Gold" ? P.gold : P.t3;
            return (
              <div key={i} style={{ background:"#080D18", border:"1px solid "+tc+"25", borderLeft:"3px solid "+tc, borderRadius:7, padding:"9px 11px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:P.t4 }}>{c.id}</span>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:800, color:tc }}>{c.confidence}%</span>
                </div>
                <div style={{ fontSize:10, fontWeight:800, color:c.id==="C004"?P.red:P.t1, marginBottom:2 }}>
                  {c.name} {c.id==="C004"?"⚡":""}
                </div>
                <div style={{ fontSize:8, color:P.t3, marginBottom:4 }}>{c.branch} · {c.status}</div>
                <div style={{ fontSize:7, color:P.t4 }}>{c.location}</div>
                <div style={{ marginTop:5, fontSize:6, fontFamily:"'IBM Plex Mono',monospace", color:P.t4, wordBreak:"break-all" }}>
                  SHA: {c.hash.slice(0,16)}...
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* NERO scores */}
      <div style={{ background:P.card, border:"1px solid "+P.b, borderRadius:12, marginBottom:12, overflow:"hidden" }}>
        <div style={{ background:"linear-gradient(90deg,"+P.red+"12,transparent)", borderBottom:"1px solid "+P.b, padding:"9px 14px" }}>
          <span style={{ fontSize:11, fontWeight:700, color:P.t1 }}>🔍 NERO Institutional Erasure Scores</span>
        </div>
        <div style={{ padding:"12px 14px", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:8 }}>
          {NERO_SCORES.map((n,i) => {
            const c = n.score >= 95 ? P.red : n.score >= 90 ? P.amber : P.gold;
            return (
              <div key={i} style={{ background:"#080D18", border:"1px solid "+c+"20", borderLeft:"3px solid "+c, borderRadius:7, padding:"9px 11px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:9, fontWeight:800, color:c }}>{n.label}</span>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14, fontWeight:800, color:c }}>{n.score}</span>
                </div>
                <div style={{ background:P.card, borderRadius:3, height:4, overflow:"hidden", marginBottom:6 }}>
                  <div style={{ width:n.score+"%", height:"100%", background:c, borderRadius:3 }} />
                </div>
                <div style={{ fontSize:8, color:P.t3, lineHeight:1.5 }}>{n.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export */}
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
        <button style={{ padding:"9px 18px", background:"#080D18", border:"1px solid "+P.teal+"30",
          color:P.teal, borderRadius:7, fontSize:9, fontWeight:700, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace" }}>
          🔗 SHA-256 Evidence Chain
        </button>
        <button style={{ padding:"9px 20px", background:"linear-gradient(135deg,"+P.gold+","+P.amber+")",
          color:"#000", border:"none", borderRadius:7, fontSize:9, fontWeight:800, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace" }}>
          📄 Export Congressional Brief PDF
        </button>
      </div>
    </div>
  );
}