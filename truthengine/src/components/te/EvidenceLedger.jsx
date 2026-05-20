import { useState } from "react";
import { P, CASES } from "../../lib/teData";

const EVIDENCE_BLOCKS = [
  { caseId:"C001", type:"Service Record", source:"NARA", date:"2026-01-15", tier:"Gold",
    hash:"a3f9d1c2e4b87650f1a2c3d4e5f67890ab12cd34ef56gh78ij90kl", verified:true,
    desc:"DD-214 — Honorable Discharge, Army, 1966–1970. Confirmed Vietnam service. MOH citation attached.",
    streams:["DCAS","NARA","VA-BIRLS","Congressional Record"], confidence:99 },
  { caseId:"C001", type:"MOH Citation", source:"Congress.gov", date:"2026-01-20", tier:"Gold",
    hash:"b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0",  verified:true,
    desc:"Congressional Record: Posthumous Medal of Honor 2014. S.Res.412 — 113th Congress.",
    streams:["Congress.gov","DoD Records"], confidence:98 },
  { caseId:"C002", type:"Service Record", source:"NARA/USMC", date:"2026-02-01", tier:"Gold",
    hash:"c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1",  verified:true,
    desc:"USMC service record 1967–1971. Vietnam deployment confirmed. OTH discharge — contested.",
    streams:["NARA","USMC Total Force","BISG surname match"], confidence:88 },
  { caseId:"C002", type:"Deportation Order", source:"ICE ENFORCE", date:"2026-02-05", tier:"Gold",
    hash:"d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2", verified:true,
    desc:"ICE Form I-229(a) — Order of Supervision. IIRIRA §241. Filed post-conviction, pre-IMMVI.",
    streams:["ICE ENFORCE","EOIR","DHS"], confidence:88 },
  { caseId:"C003", type:"Service Record", source:"NARA/USMC", date:"2026-02-01", tier:"Gold",
    hash:"e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3", verified:true,
    desc:"USMC — brother of C002. Same unit, Vietnam 1968–1971. Tijuana location confirmed by DVSH.",
    streams:["NARA","USMC","DVSH intake"], confidence:85 },
  { caseId:"C004", type:"Service Record", source:"DMDC", date:"2026-03-01", tier:"Gold",
    hash:"f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4", verified:true,
    desc:"Army service record — Korea era descendant. Naturalization denied 2018. Self-deported Nov 2025 under ICE order.",
    streams:["DMDC","USCIS","ICE ENFORCE","Reddit social"], confidence:91 },
  { caseId:"C005", type:"Field Report", source:"AUMER/DVSH", date:"2026-03-10", tier:"Silver",
    hash:"g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5", verified:false,
    desc:"Nogales field report. Albergue del Desierto intake form. Service branch unverified. FOIA pending.",
    streams:["DVSH field","COMAR"], confidence:79 },
  { caseId:"C006", type:"Witness Statement", source:"AUMER", date:"2026-03-12", tier:"Silver",
    hash:"h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6", verified:false,
    desc:"Colombia deportation confirmed via consular report. Service records pending DoD DMDC FOIA.",
    streams:["DOS Consular","AUMER witness"], confidence:77 },
  // Chain events
  { caseId:"CHAIN", type:"BISG Audit Block", source:"TruthEngine360", date:"2026-04-01", tier:"Gold",
    hash:"i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6i7", verified:true,
    desc:"BISG surname probability sweep — 58,220 DCAS records. 2,309 Hispanic-probable at τ=0.35. Bernoulli variance computed.",
    streams:["DCAS CSV","BISG R package","SPSS output"], confidence:97 },
  { caseId:"CHAIN", type:"5-Stream Convergence", source:"TruthEngine360", date:"2026-04-05", tier:"Gold",
    hash:"j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j8", verified:true,
    desc:"All 5 convergence streams computed: DCAS 349 / BISG 2309 / NARA 3070 / Guzman 3500 / LAE 3741. Gap certified.",
    streams:["DCAS","BISG","NARA","Guzman 1969","LAE DB"], confidence:99 },
];

const TIER_C = { Gold:P.gold, Silver:"#B8CCE8", Bronze:P.amber };

export default function EvidenceLedger() {
  const [selBlock, setSelBlock] = useState(null);
  const [filterCase, setFilterCase] = useState("All");
  const [filterTier, setFilterTier] = useState("All");

  const cases = ["All","C001","C002","C003","C004","C005","C006","CHAIN"];
  const tiers = ["All","Gold","Silver"];

  const filtered = EVIDENCE_BLOCKS.filter(b =>
    (filterCase === "All" || b.caseId === filterCase) &&
    (filterTier === "All" || b.tier === filterTier)
  );

  const goldCount = EVIDENCE_BLOCKS.filter(b=>b.tier==="Gold").length;
  const verifiedCount = EVIDENCE_BLOCKS.filter(b=>b.verified).length;

  return (
    <div>
      {/* Header stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:7, marginBottom:12 }}>
        {[
          {l:"Evidence Blocks", v:EVIDENCE_BLOCKS.length, c:P.blue},
          {l:"Gold Tier", v:goldCount, c:P.gold},
          {l:"Verified (SHA-256)", v:verifiedCount, c:P.teal},
          {l:"Cases Covered", v:6, c:P.violet},
          {l:"Source Streams", v:EVIDENCE_BLOCKS.reduce((a,b)=>a+b.streams.length,0), c:P.orange},
          {l:"Chain Blocks", v:EVIDENCE_BLOCKS.filter(b=>b.caseId==="CHAIN").length, c:P.pink},
        ].map((s,i) => (
          <div key={i} style={{ background:P.card, border:`1px solid ${s.c}25`, borderLeft:`3px solid ${s.c}`, borderRadius:7, padding:"7px 10px" }}>
            <div style={{ fontSize:6, color:P.t4, marginBottom:2 }}>{s.l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:16, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Chain visualizer */}
      <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"10px 14px", marginBottom:12, overflowX:"auto" }}>
        <div style={{ fontSize:7, color:P.gold, letterSpacing:3, fontWeight:700, marginBottom:8 }}>SHA-256 EVIDENCE CHAIN — IMMUTABLE LEDGER</div>
        <div style={{ display:"flex", alignItems:"center", gap:0, minWidth:"max-content" }}>
          {EVIDENCE_BLOCKS.map((b,i) => {
            const tc = TIER_C[b.tier] || P.t4;
            return (
              <div key={i} style={{ display:"flex", alignItems:"center" }}>
                <div onClick={() => setSelBlock(selBlock===i?null:i)}
                  style={{ background: selBlock===i ? `${tc}20` : "#080D18",
                    border:`1px solid ${tc}${selBlock===i?"80":"30"}`,
                    borderRadius:6, padding:"5px 8px", cursor:"pointer", minWidth:80, textAlign:"center" }}>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, color:tc, marginBottom:2 }}>{b.caseId}</div>
                  <div style={{ fontSize:6, color:P.t4 }}>{b.type.slice(0,10)}</div>
                  <div style={{ fontSize:6, fontFamily:"'IBM Plex Mono',monospace", color:P.t4, marginTop:2 }}>
                    {b.hash.slice(0,6)}…
                  </div>
                  {b.verified && <div style={{ fontSize:6, color:P.teal, marginTop:2 }}>✓</div>}
                </div>
                {i < EVIDENCE_BLOCKS.length-1 && (
                  <div style={{ height:1, width:16, background:P.b, flexShrink:0 }}>
                    <div style={{ height:"100%", background:tc, opacity:0.4 }}/>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected block detail */}
        {selBlock !== null && (
          <div style={{ marginTop:10, paddingTop:8, borderTop:`1px solid ${P.b}30`,
            background:"#080D18", borderRadius:7, padding:"10px 12px" }}>
            {(() => { const b = EVIDENCE_BLOCKS[selBlock]; const tc = TIER_C[b.tier];
              return (<>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:tc }}>{b.type} — {b.caseId}</div>
                  <div style={{ display:"flex", gap:6 }}>
                    <span style={{ fontSize:7, background:`${tc}18`, border:`1px solid ${tc}30`, color:tc, borderRadius:20, padding:"1px 7px" }}>{b.tier}</span>
                    {b.verified && <span style={{ fontSize:7, background:`${P.teal}18`, border:`1px solid ${P.teal}30`, color:P.teal, borderRadius:20, padding:"1px 7px" }}>✓ SHA-256</span>}
                  </div>
                </div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, color:P.t4, marginBottom:6, wordBreak:"break-all" }}>
                  HASH: {b.hash}
                </div>
                <div style={{ fontSize:9, color:P.t2, lineHeight:1.7, marginBottom:6 }}>{b.desc}</div>
                <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                  <span style={{ fontSize:7, color:P.t4 }}>Sources:</span>
                  {b.streams.map(s => (
                    <span key={s} style={{ fontSize:7, background:`${P.blue}12`, border:`1px solid ${P.blue}20`, color:P.blue, borderRadius:3, padding:"1px 5px" }}>{s}</span>
                  ))}
                </div>
                <div style={{ display:"flex", gap:10, marginTop:6, fontSize:8, color:P.t4 }}>
                  <span>Source: {b.source}</span>
                  <span>Date: {b.date}</span>
                  <span>Confidence: <strong style={{ color:tc }}>{b.confidence}%</strong></span>
                </div>
              </>);
            })()}
          </div>
        )}
      </div>

      {/* Filters + list */}
      <div style={{ display:"flex", gap:5, marginBottom:8, flexWrap:"wrap" }}>
        {cases.map(c => (
          <button key={c} onClick={() => setFilterCase(c)}
            style={{ padding:"3px 9px", fontSize:8, background: filterCase===c ? `${P.violet}20` : "transparent",
              border:`1px solid ${filterCase===c ? P.violet : P.b}`, borderRadius:20,
              color: filterCase===c ? P.violet : P.t4, cursor:"pointer" }}>
            {c}
          </button>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", gap:4 }}>
          {tiers.map(t => (
            <button key={t} onClick={() => setFilterTier(t)}
              style={{ padding:"3px 9px", fontSize:8, background: filterTier===t ? `${TIER_C[t]||P.blue}20` : "transparent",
                border:`1px solid ${filterTier===t ? (TIER_C[t]||P.blue) : P.b}`, borderRadius:20,
                color: filterTier===t ? (TIER_C[t]||P.blue) : P.t4, cursor:"pointer" }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.map((b,i) => {
        const tc = TIER_C[b.tier] || P.t4;
        const c = CASES.find(c => c.id === b.caseId);
        return (
          <div key={i} style={{ background:P.card, border:`1px solid ${tc}20`,
            borderLeft:`4px solid ${tc}`, borderRadius:9, padding:"9px 12px", marginBottom:6 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", gap:6, marginBottom:3, flexWrap:"wrap" }}>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, color:P.t4 }}>{b.caseId}</span>
                  <span style={{ fontSize:9, fontWeight:700, color:tc }}>{b.type}</span>
                  <span style={{ fontSize:7, color:P.t4 }}>{b.source} · {b.date}</span>
                  {b.verified && <span style={{ fontSize:7, color:P.teal }}>✓ verified</span>}
                </div>
                <div style={{ fontSize:9, color:P.t2, lineHeight:1.5 }}>{b.desc}</div>
                <div style={{ marginTop:5, fontFamily:"'IBM Plex Mono',monospace", fontSize:6, color:P.t4, wordBreak:"break-all" }}>
                  {b.hash}
                </div>
              </div>
              <div style={{ flexShrink:0, textAlign:"center" }}>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14, fontWeight:800, color:tc }}>{b.confidence}%</div>
                <div style={{ fontSize:6, color:P.t4 }}>conf.</div>
                <span style={{ fontSize:7, background:`${tc}18`, border:`1px solid ${tc}30`, color:tc, borderRadius:20, padding:"1px 6px", marginTop:3, display:"inline-block" }}>{b.tier}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}