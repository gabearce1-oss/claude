import { useState } from "react";
import { P, MANUSCRIPT, SEARCH_INDEX } from "../../lib/teData";

export default function LitcentralTab() {
  const [query, setQuery] = useState("");
  const [selChapter, setSelChapter] = useState(null);

  const results = query.trim()
    ? MANUSCRIPT.keyChapters.filter(c =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.dcasRefs.some(r => r.toLowerCase().includes(query.toLowerCase()))
      )
    : MANUSCRIPT.keyChapters;

  const MS_DAYS = Math.ceil((new Date("2026-05-31") - new Date()) / 86400000);

  return (
    <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 110px)" }}>

      {/* Manuscript header */}
      <div style={{ background:"linear-gradient(135deg,"+P.gold+"12,"+P.orange+"08)", border:"1px solid "+P.gold+"30",
        borderRadius:12, padding:"14px 18px", marginBottom:14 }}>
        <div style={{ fontSize:8, color:P.gold, letterSpacing:4, fontWeight:700, marginBottom:4 }}>
          LITCENTRAL — MANUSCRIPT INTEGRATION
        </div>
        <div style={{ fontSize:16, fontWeight:800, marginBottom:6 }}>
          📖 {MANUSCRIPT.title}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:8 }}>
          {[
            { l:"Chapters", v:MANUSCRIPT.chapters, c:P.blue },
            { l:"Words", v:MANUSCRIPT.words.toLocaleString(), c:P.teal },
            { l:"Avg Omega", v:MANUSCRIPT.avgOmega, c:P.gold },
            { l:"Omega Elite", v:MANUSCRIPT.omegaElite, c:P.gold },
            { l:"Revision", v:MANUSCRIPT.revision, c:P.violet },
            { l:"Days to Deadline", v:MS_DAYS, c:P.red },
          ].map((s,i) => (
            <div key={i} style={{ background:"#080D18", border:"1px solid "+s.c+"20", borderRadius:6, padding:"7px 10px", textAlign:"center" }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:15, fontWeight:800, color:s.c }}>{s.v}</div>
              <div style={{ fontSize:7, color:P.t4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chapter search */}
      <div style={{ marginBottom:12 }}>
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search chapters: 'BISG' · 'Sae Joon Park' · 'NERO' · 'Ch14'..."
          style={{ width:"100%", padding:"9px 12px", background:P.card, border:"1px solid "+P.b,
            borderRadius:8, color:P.t1, fontSize:10, fontFamily:"'IBM Plex Mono',monospace",
            outline:"none", boxSizing:"border-box" }} />
      </div>

      {/* Chapter list */}
      <div style={{ background:P.card, border:"1px solid "+P.b, borderRadius:12, overflow:"hidden", marginBottom:12 }}>
        <div style={{ background:"linear-gradient(90deg,"+P.orange+"12,transparent)", borderBottom:"1px solid "+P.b, padding:"9px 14px" }}>
          <span style={{ fontSize:11, fontWeight:700, color:P.t1 }}>📑 Chapter Citation Index — {results.length} chapters</span>
        </div>
        <div style={{ padding:"10px 14px" }}>
          {results.map((ch, i) => {
            const isOpen = selChapter === ch.n;
            const neroC = ch.nero >= 0.9 ? P.red : ch.nero >= 0.85 ? P.amber : P.teal;
            return (
              <div key={i} onClick={() => setSelChapter(isOpen ? null : ch.n)}
                style={{ background: isOpen ? "#080D18" : "transparent",
                  border:"1px solid "+(isOpen ? P.orange+"50" : P.b+"30"),
                  borderLeft:"4px solid "+P.orange, borderRadius:8, padding:"9px 12px",
                  marginBottom:6, cursor:"pointer", transition:"all .12s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:P.t4, marginRight:8 }}>Ch.{ch.n}</span>
                    <span style={{ fontSize:10, fontWeight:700, color:P.t1 }}>{ch.title}</span>
                  </div>
                  <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                    <span style={{ fontSize:7, background:neroC+"18", border:"1px solid "+neroC+"30", color:neroC, borderRadius:3, padding:"1px 5px" }}>
                      NERO {(ch.nero*100).toFixed(0)}
                    </span>
                  </div>
                </div>
                {isOpen && (
                  <div style={{ marginTop:8, paddingTop:7, borderTop:"1px solid "+P.b+"30" }}>
                    <div style={{ fontSize:8, color:P.t4, marginBottom:4 }}>DCAS CROSS-REFERENCES</div>
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                      {ch.dcasRefs.map(ref => {
                        const record = SEARCH_INDEX.find(r => r.id === ref);
                        return (
                          <div key={ref} style={{ background:"#080D18", border:"1px solid "+P.blue+"25",
                            borderRadius:6, padding:"5px 8px" }}>
                            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, color:P.blue, marginBottom:1 }}>{ref}</div>
                            {record && <div style={{ fontSize:7, color:P.t3 }}>{record.title.slice(0,40)}...</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* NERO per-chapter */}
      <div style={{ background:P.card, border:"1px solid "+P.b, borderRadius:12, overflow:"hidden" }}>
        <div style={{ background:"linear-gradient(90deg,"+P.red+"12,transparent)", borderBottom:"1px solid "+P.b, padding:"9px 14px" }}>
          <span style={{ fontSize:11, fontWeight:700, color:P.t1 }}>🔍 NERO Scores by Chapter</span>
        </div>
        <div style={{ padding:"10px 14px" }}>
          {MANUSCRIPT.keyChapters.map((ch,i) => {
            const c = ch.nero >= 0.9 ? P.red : ch.nero >= 0.85 ? P.amber : P.teal;
            return (
              <div key={i} style={{ marginBottom:7 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                  <span style={{ fontSize:9, color:P.t2 }}>Ch.{ch.n} — {ch.title.slice(0,35)}...</span>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, fontWeight:800, color:c }}>{(ch.nero*100).toFixed(0)}</span>
                </div>
                <div style={{ background:"#080D18", borderRadius:3, height:5, overflow:"hidden" }}>
                  <div style={{ width:(ch.nero*100)+"%", height:"100%", background:c, borderRadius:3 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}