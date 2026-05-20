import { useState, useEffect } from "react";
import { P, CASES, KEY_STATS, FOIA_REQUESTS } from "../../lib/teData";
import PTSDAnalysisPanel from "./PTSDAnalysisPanel";

const CARD = "#0D1525";
const CARD2 = "#0A1020";
const BORDER = "rgba(255,255,255,0.06)";

const CHC_DATE = new Date("2026-05-18");
const MS_DATE  = new Date("2026-05-31");

const NERO_SCORES = { N: 94, E: 97, R: 91, O: 96 };
const NERO_LABELS = { N:"Nomenclature", E:"Ethnic Miscoding", R:"Record Suppression", O:"Oral History Absence" };
const NERO_DESC   = {
  N:"Citizenship promise never formalized",
  E:"84.9% DCAS misclassification rate",
  R:"Post-deportation VA benefit lockout",
  O:"92 confirmed vs 94,000+ estimated",
};

const STREAMS = [
  { id:"S1", label:"DCAS Official",    value:349,  pct:0.60, c:P.red,    note:"ANOMALOUS BASELINE" },
  { id:"S2", label:"BISG τ=0.40",      value:2309, pct:3.97, c:"#a78bfa", note:"FORENSIC ESTIMATE" },
  { id:"S3", label:"NARA Retroactive", value:3070, pct:5.27, c:P.blue,   note:"ARCHIVAL" },
  { id:"S4", label:"Guzmán 1969",      value:3500, pct:6.01, c:P.teal,   note:"HISTORICAL" },
  { id:"S5", label:"LAE Database",     value:3741, pct:6.43, c:P.gold,   note:"COMMUNITY" },
];

const CASE_META = {
  "EPP-001":{ tier:"Gold",   color:P.gold   },
  "EPP-002":{ tier:"Gold",   color:P.blue   },
  "EPP-003":{ tier:"Gold",   color:P.red    },
  "EPP-004":{ tier:"Silver", color:P.amber  },
  "EPP-005":{ tier:"Gold",   color:P.gold   },
  "EPP-006":{ tier:"Bronze", color:"#a78bfa"},
};

const QUICK_ACTIONS = [
  { label:"AI Research Assistant", tab:"assistant",    color:P.teal   },
  { label:"Evidence Viewer",       tab:"evidence",     color:P.blue   },
  { label:"CHC Report Generator",  tab:"chcreport",    color:P.gold   },
  { label:"DCAS Forensic Audit",   tab:"dcas",         color:P.red    },
  { label:"All Databases",         tab:"databases",    color:P.blue   },
  { label:"Network Graph",         tab:"network",      color:"#a78bfa"},
  { label:"Geospatial Map",        tab:"vetmap",       color:P.teal   },
  { label:"FOIA Tracker",          tab:"foiatrack",    color:P.amber  },
  { label:"Predictive Analytics",  tab:"predictive",   color:"#a78bfa"},
  { label:"Live Crawlers",         tab:"crawlers",     color:P.teal   },
];

function Countdown({ target, label, color }) {
  const [time, setTime] = useState({});
  useEffect(() => {
    const calc = () => {
      const diff = target - new Date();
      if (diff <= 0) { setTime({ d:0, h:0, m:0, s:0 }); return; }
      setTime({
        d: Math.floor(diff/86400000),
        h: Math.floor((diff%86400000)/3600000),
        m: Math.floor((diff%3600000)/60000),
        s: Math.floor((diff%60000)/1000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [target]);

  return (
    <div>
      <div style={{ fontSize:9, color:P.t3, letterSpacing:1.5, marginBottom:8 }}>{label}</div>
      <div style={{ display:"flex", gap:5 }}>
        {[["d","DAYS"],["h","HRS"],["m","MIN"],["s","SEC"]].map(([k,u])=>(
          <div key={k} style={{ background:CARD2, border:`1px solid ${color}30`, borderRadius:6, padding:"8px 10px", minWidth:42, textAlign:"center" }}>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:20, fontWeight:800, color, lineHeight:1 }}>{String(time[k]??0).padStart(2,"0")}</div>
            <div style={{ fontSize:9, color:P.t3, marginTop:3, letterSpacing:1 }}>{u}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnimatedBar({ value, max, color, delay=0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth((value/max)*100), delay+100);
    return () => clearTimeout(t);
  }, [value, max, delay]);
  return (
    <div style={{ background:CARD2, borderRadius:3, height:6, overflow:"hidden", flex:1 }}>
      <div style={{ width:`${width}%`, height:"100%", background:color, borderRadius:3, transition:"width 1.2s cubic-bezier(.4,0,.2,1)" }}/>
    </div>
  );
}

function PulsingDot({ color, size=8 }) {
  return (
    <span style={{
      display:"inline-block", width:size, height:size, borderRadius:"50%",
      background:color, boxShadow:`0 0 5px ${color}`,
      animation:"pulse 2s ease-in-out infinite",
    }}/>
  );
}

function SectionLabel({ text }) {
  return (
    <div style={{ fontSize:9, fontWeight:700, letterSpacing:2, color:P.t3, textTransform:"uppercase", marginBottom:10 }}>{text}</div>
  );
}

function Card({ children, style = {}, accent, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: CARD,
      border: `1px solid ${accent ? accent + "30" : BORDER}`,
      borderTop: accent ? `2px solid ${accent}` : `1px solid ${BORDER}`,
      borderRadius: 10,
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      padding: "16px 18px",
      ...style,
      cursor: onClick ? "pointer" : "default",
    }}>
      {children}
    </div>
  );
}

function CardHeader({ title, right, color }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
      <div style={{ fontSize:12, fontWeight:700, color: color || P.t1, letterSpacing:0.3 }}>{title}</div>
      {right}
    </div>
  );
}

function NavPill({ label, onClick, color = P.gold }) {
  return (
    <button onClick={onClick} style={{
      padding:"3px 10px", fontSize:10, cursor:"pointer", fontFamily:"inherit",
      background:`${color}15`, border:`1px solid ${color}30`, color, borderRadius:20,
      fontWeight:700, letterSpacing:0.3,
    }}>{label} →</button>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{
      fontSize:9, background:`${color}18`, border:`1px solid ${color}35`,
      color, borderRadius:20, padding:"2px 9px", fontWeight:700, letterSpacing:0.3,
    }}>{label}</span>
  );
}

export default function InteractiveDashboard({ setTab }) {
  const [hoveredCase, setHoveredCase] = useState(null);
  const [hoveredStream, setHoveredStream] = useState(null);

  const chcDays = Math.ceil((CHC_DATE - new Date()) / 86400000);
  const foiaOverdue = FOIA_REQUESTS.filter(r => r.daysOverdue > 0).length;

  return (
    <div style={{ fontFamily:"'IBM Plex Mono',monospace", color:P.t1 }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .dcard { animation: fadeIn .35s ease both; }
        .qbtn:hover { opacity:0.85 !important; }
        .ccase:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.5) !important; }
      `}</style>

      {/* ── FOIA ALERT ───────────────────────────────────────── */}
      {foiaOverdue > 0 && (
        <div style={{
          background:`${P.red}0D`, border:`1px solid ${P.red}35`,
          borderLeft:`3px solid ${P.red}`, borderRadius:8, padding:"10px 16px",
          marginBottom:14, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap",
        }}>
          <PulsingDot color={P.red} size={8}/>
          <span style={{ fontSize:11, color:P.red, fontWeight:800, letterSpacing:0.5 }}>
            CRITICAL — {foiaOverdue} FOIA REQUESTS OVERDUE
          </span>
          {FOIA_REQUESTS.filter(r => r.daysOverdue > 0).map(r => (
            <Badge key={r.id} label={`${r.id} · ${r.agency} · +${r.daysOverdue}d`} color={P.red}/>
          ))}
          <button onClick={() => setTab("foiatrack")} style={{
            marginLeft:"auto", padding:"5px 14px", fontSize:10, fontWeight:700, cursor:"pointer",
            background:`${P.red}18`, border:`1px solid ${P.red}40`, color:P.red,
            borderRadius:20, fontFamily:"inherit", letterSpacing:0.3,
          }}>VIEW FOIA TRACKER</button>
        </div>
      )}

      {/* ── ROW 1: COUNTDOWNS + HERO STAT ────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 2fr", gap:12, marginBottom:14 }}>

        {/* CHC Countdown */}
        <Card accent={chcDays <= 30 ? P.red : P.amber} style={{ animationDelay:"0ms" }} className="dcard">
          <SectionLabel text="CHC Briefing Deadline" />
          <Countdown target={CHC_DATE} label="MAY 18, 2026" color={chcDays <= 30 ? P.red : P.amber}/>
          <button onClick={() => setTab("chcreport")} style={{
            width:"100%", marginTop:12, padding:"7px", fontSize:10, fontWeight:700, cursor:"pointer",
            background:`${chcDays<=30?P.red:P.amber}15`, border:`1px solid ${chcDays<=30?P.red:P.amber}30`,
            color:chcDays<=30?P.red:P.amber, borderRadius:7, fontFamily:"inherit", letterSpacing:0.5,
          }}>OPEN REPORT GENERATOR</button>
        </Card>

        {/* Manuscript Countdown */}
        <Card accent={P.gold} className="dcard" style={{ animationDelay:"50ms" }}>
          <SectionLabel text="Manuscript Deadline" />
          <Countdown target={MS_DATE} label="MAY 31, 2026" color={P.gold}/>
          <button onClick={() => setTab("litcentral")} style={{
            width:"100%", marginTop:12, padding:"7px", fontSize:10, fontWeight:700, cursor:"pointer",
            background:`${P.gold}15`, border:`1px solid ${P.gold}30`, color:P.gold,
            borderRadius:7, fontFamily:"inherit", letterSpacing:0.5,
          }}>OPEN LITCENTRAL</button>
        </Card>

        {/* System Status */}
        <Card accent={P.teal} className="dcard" style={{ animationDelay:"100ms" }}>
          <SectionLabel text="System Status" />
          {[
            {l:"TE360 Engine",    ok:true},
            {l:"n8n Pipelines",   ok:false},
            {l:"HubSpot CRM",     ok:true},
            {l:"Scholar DB",      ok:true},
            {l:"Evidence Chain",  ok:true},
            {l:"FOIA Tracker",    ok:foiaOverdue===0},
          ].map((s,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", borderBottom:`1px solid ${BORDER}` }}>
              <span style={{ fontSize:11, color:P.t2 }}>{s.l}</span>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <PulsingDot color={s.ok ? P.teal : P.amber} size={7}/>
                <span style={{ fontSize:9, color:s.ok ? P.teal : P.amber, fontWeight:700 }}>{s.ok ? "ONLINE" : "WARN"}</span>
              </div>
            </div>
          ))}
        </Card>

        {/* Hero stat */}
        <div className="dcard" style={{
          background:`linear-gradient(135deg, #0D1525, #0A0F1E)`,
          border:`1px solid ${P.red}30`, borderTop:`2px solid ${P.red}`,
          borderRadius:10, padding:"16px 20px", position:"relative", overflow:"hidden",
          boxShadow:"0 4px 20px rgba(0,0,0,0.5)", animationDelay:"150ms",
        }}>
          <div style={{ position:"absolute", top:0, right:0, width:220, height:220,
            background:`radial-gradient(circle, ${P.red}12 0%, transparent 70%)`, pointerEvents:"none" }}/>
          <SectionLabel text="Primary Forensic Finding — Mexican Nationals Killed in Vietnam" />
          <div style={{ display:"flex", gap:24, alignItems:"center", flexWrap:"wrap", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:10, color:P.red, letterSpacing:1, marginBottom:4 }}>DCAS OFFICIAL (FOREIGN)</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:48, fontWeight:800, color:P.red, lineHeight:1 }}>4</div>
              <div style={{ fontSize:10, color:P.t3, marginTop:4 }}>Zero visibility in system</div>
            </div>
            <div style={{ fontSize:24, color:P.t3 }}>→</div>
            <div>
              <div style={{ fontSize:10, color:P.gold, letterSpacing:1, marginBottom:4 }}>FORENSIC ESTIMATE (BISG + 5-STREAM)</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:48, fontWeight:800, color:P.gold, lineHeight:1 }}>~500</div>
              <div style={{ fontSize:10, color:P.t3, marginTop:4 }}>346–741 confidence band</div>
            </div>
            <div style={{ marginLeft:"auto", textAlign:"right", background:`${P.red}0A`, borderRadius:10, padding:"12px 16px", border:`1px solid ${P.red}25` }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:22, fontWeight:800, color:P.red }}>99.2%</div>
              <div style={{ fontSize:10, color:P.t3, marginBottom:8 }}>institutional erasure</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:28, fontWeight:800, color:P.red }}>~496</div>
              <div style={{ fontSize:10, color:P.t3 }}>invisible veterans</div>
            </div>
          </div>
          <div style={{ padding:"10px 12px", background:CARD2, borderRadius:7, fontSize:10, color:P.t3, lineHeight:1.7, borderLeft:`3px solid ${P.red}` }}>
            BISG τ=0.40 validates 2,309 in broader cohort · 4 FOREIGN records = baseline floor · 346–741 represents forensic convergence across 5 data streams (SSS, DCAS, USCIS N-644, VA DIC, SRE consular records)
          </div>
          <div style={{ marginTop:12, display:"flex", gap:8 }}>
            <button onClick={() => setTab("mxkia")} style={{ flex:1, padding:"7px", fontSize:10, fontWeight:700, cursor:"pointer", background:`${P.red}12`, border:`1px solid ${P.red}30`, color:P.red, borderRadius:7, fontFamily:"inherit", letterSpacing:0.5 }}>MX KIA FORENSIC</button>
            <button onClick={() => setTab("dcas")} style={{ flex:1, padding:"7px", fontSize:10, fontWeight:700, cursor:"pointer", background:`${P.blue}12`, border:`1px solid ${P.blue}30`, color:P.blue, borderRadius:7, fontFamily:"inherit", letterSpacing:0.5 }}>DCAS AUDIT</button>
            <button onClick={() => setTab("forensicseries")} style={{ flex:1, padding:"7px", fontSize:10, fontWeight:700, cursor:"pointer", background:`${P.gold}12`, border:`1px solid ${P.gold}30`, color:P.gold, borderRadius:7, fontFamily:"inherit", letterSpacing:0.5 }}>FORENSIC LEADS</button>
          </div>
        </div>
      </div>

      {/* ── ROW 2: 5-STREAM CONVERGENCE + NERO ───────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>

        {/* 5-Stream */}
        <Card className="dcard" style={{ animationDelay:"200ms" }}>
          <CardHeader
            title="5-Stream Convergence Analysis"
            right={<Badge label="R²=0.947 · p<0.001" color={P.teal}/>}
          />
          {STREAMS.map((s, i) => (
            <div key={s.id}
              onMouseEnter={() => setHoveredStream(s.id)}
              onMouseLeave={() => setHoveredStream(null)}
              style={{
                padding:"8px 10px", borderRadius:7, marginBottom:5, cursor:"default",
                background: hoveredStream===s.id ? `${s.c}0A` : "transparent",
                border:`1px solid ${hoveredStream===s.id ? s.c+"25" : "transparent"}`,
                transition:"all .15s",
              }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ fontSize:10, color:s.c, fontWeight:800, minWidth:16 }}>{s.id}</span>
                  <span style={{ fontSize:11, color:P.t2 }}>{s.label}</span>
                </div>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <span style={{ fontSize:10, color:P.t3 }}>{s.pct}%</span>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:800, color:s.c, minWidth:44, textAlign:"right" }}>{s.value.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <AnimatedBar value={s.value} max={4000} color={s.c} delay={i*120}/>
                <span style={{ fontSize:9, color:s.c, minWidth:100, textAlign:"right" }}>{s.note}</span>
              </div>
            </div>
          ))}
          <div style={{ marginTop:10, padding:"8px 10px", background:CARD2, borderRadius:7, display:"flex", justifyContent:"space-between" }}>
            <div style={{ fontSize:10, color:P.t3 }}>Undercount factor: <span style={{ color:P.red, fontWeight:700 }}>6.6× minimum</span></div>
            <div style={{ fontSize:10, color:P.t3 }}>BISG τ stability: <span style={{ color:P.teal, fontWeight:700 }}>τ=0.30–0.70</span></div>
          </div>
        </Card>

        {/* NERO Scores */}
        <Card className="dcard" style={{ animationDelay:"250ms" }}>
          <CardHeader
            title="NERO Institutional Erasure Index"
            right={<NavPill label="Risk Engine" onClick={() => setTab("riskengine")} color={P.red}/>}
          />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
            {Object.entries(NERO_SCORES).map(([k, v]) => {
              const c = v >= 96 ? P.red : v >= 93 ? P.amber : P.gold;
              return (
                <div key={k} style={{ background:CARD2, borderRadius:8, padding:"12px 14px", border:`1px solid ${c}20` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                    <div>
                      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:800, color:c }}>{k}</div>
                      <div style={{ fontSize:9, color:P.t3, marginTop:1, lineHeight:1.3 }}>{NERO_LABELS[k]}</div>
                    </div>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:24, fontWeight:800, color:c }}>{v}</div>
                  </div>
                  <div style={{ background:"#030508", borderRadius:3, height:5, overflow:"hidden", marginBottom:5 }}>
                    <div style={{ width:`${v}%`, height:"100%", background:c, borderRadius:3, transition:"width 1.5s ease" }}/>
                  </div>
                  <div style={{ fontSize:9, color:P.t3, lineHeight:1.4 }}>{NERO_DESC[k]}</div>
                </div>
              );
            })}
          </div>
          <div style={{ padding:"10px 12px", background:`${P.red}0A`, border:`1px solid ${P.red}20`, borderRadius:8 }}>
            <div style={{ fontSize:11, color:P.red, fontWeight:700 }}>
              Combined NERO Index: {Math.round(Object.values(NERO_SCORES).reduce((a,b) => a+b, 0)/4)}/100
              <span style={{ fontWeight:400, marginLeft:8, fontSize:10 }}>— CRITICAL THRESHOLD</span>
            </div>
            <div style={{ fontSize:10, color:P.t3, marginTop:3 }}>All 4 vectors exceed 90 — systematic institutional erasure confirmed</div>
          </div>
        </Card>
      </div>

      {/* ── ROW 3: CASES + FOIA + QUICK ACTIONS ──────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:12, marginBottom:14 }}>

        {/* Cases */}
        <Card className="dcard" style={{ animationDelay:"300ms" }}>
          <CardHeader
            title="CB-HSIVF Verified Cases"
            right={<NavPill label="Full Registry" onClick={() => setTab("veterans")} color={P.gold}/>}
          />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {CASES.map(c => {
              const meta = CASE_META[c.id];
              const isCritical = c.id === "C004";
              const isHovered = hoveredCase === c.id;
              return (
                <div key={c.id} className="ccase"
                  onMouseEnter={() => setHoveredCase(c.id)}
                  onMouseLeave={() => setHoveredCase(null)}
                  onClick={() => setTab("veterans")}
                  style={{
                    background:isHovered ? `${meta.color}0D` : CARD2,
                    border:`1px solid ${isCritical ? P.red+(isHovered?"60":"25") : meta.color+(isHovered?"40":"18")}`,
                    borderLeft:`3px solid ${isCritical ? P.red : meta.color}`,
                    borderRadius:8, padding:"10px 12px", cursor:"pointer",
                    transition:"all .15s", boxShadow:"0 2px 8px rgba(0,0,0,0.3)",
                  }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                    <span style={{ fontSize:9, color:P.t3, fontFamily:"'IBM Plex Mono',monospace" }}>{c.id}</span>
                    {isCritical && <PulsingDot color={P.red} size={6}/>}
                  </div>
                  <div style={{ fontSize:11, fontWeight:700, color:isCritical ? P.red : meta.color, lineHeight:1.3, marginBottom:3 }}>{c.name}</div>
                  <div style={{ fontSize:10, color:P.t3, marginBottom:6 }}>{c.branch} · {c.country||c.location}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ background:"#030508", borderRadius:2, height:4, flex:1, overflow:"hidden", marginRight:8 }}>
                      <div style={{ width:`${c.confidence}%`, height:"100%", background:meta.color, borderRadius:2 }}/>
                    </div>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:800, color:meta.color }}>{c.confidence}%</span>
                  </div>
                  {isCritical && <div style={{ marginTop:5, fontSize:9, color:P.red, fontWeight:700, letterSpacing:0.3 }}>SELF-DEPORTED NOV/DEC 2025</div>}
                </div>
              );
            })}
          </div>
        </Card>

        {/* FOIA Status */}
        <Card className="dcard" style={{ animationDelay:"350ms" }}>
          <CardHeader
            title="FOIA Status"
            right={<NavPill label="Tracker" onClick={() => setTab("foiatrack")} color={P.amber}/>}
          />
          {FOIA_REQUESTS.map(r => {
            const isOverdue = r.daysOverdue > 0;
            const c = isOverdue ? (r.daysOverdue > 60 ? P.red : P.amber) : P.teal;
            return (
              <div key={r.id} style={{
                marginBottom:8, padding:"9px 11px", background:CARD2,
                border:`1px solid ${c}20`, borderLeft:`3px solid ${c}`, borderRadius:8,
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:c }}>{r.id}</span>
                  {isOverdue
                    ? <Badge label={`+${r.daysOverdue}d OVERDUE`} color={P.red}/>
                    : <Badge label="ON TRACK" color={P.teal}/>}
                </div>
                <div style={{ fontSize:11, color:P.t2 }}>{r.agency}</div>
                <div style={{ fontSize:10, color:P.t3, marginTop:1 }}>{r.subject?.slice(0,42)||"Pending"}</div>
              </div>
            );
          })}
        </Card>

        {/* Quick Access */}
        <Card className="dcard" style={{ animationDelay:"400ms", display:"flex", flexDirection:"column", gap:5 }}>
          <CardHeader title="Quick Access" />
          {QUICK_ACTIONS.map(a => (
            <button key={a.tab} className="qbtn" onClick={() => setTab(a.tab)} style={{
              display:"flex", alignItems:"center", gap:10, padding:"9px 12px", cursor:"pointer",
              background:`${a.color}0A`, border:`1px solid ${a.color}18`, borderRadius:8,
              color:a.color, fontSize:10, fontWeight:700, textAlign:"left",
              transition:"all .12s", fontFamily:"inherit", letterSpacing:0.3,
            }}>
              <span style={{ width:4, height:4, borderRadius:"50%", background:a.color, flexShrink:0 }}/>
              {a.label}
            </button>
          ))}
        </Card>
      </div>

      {/* ── ROW 4: PTSD ANALYSIS ─────────────────────────────── */}
      <div style={{ marginBottom:14 }}>
        <PTSDAnalysisPanel />
      </div>

      {/* ── ROW 5: KPI STRIP ─────────────────────────────────── */}
      <div style={{ marginBottom:6 }}>
        <SectionLabel text="Platform Intelligence — Key Metrics" />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(150px, 1fr))", gap:8 }}>
        {[
          {l:"ICE Records Analyzed",  v:"713,464",        c:P.blue,   tab:"dcas"},
          {l:"Total MX Deported",     v:"202,864",        c:P.red,    tab:"dcas"},
          {l:"Trump Era Deported",    v:"130,656",        c:P.red,    tab:"dcas"},
          {l:"Veteran Flags in DB",   v:"ZERO",           c:P.red,    tab:"dcas"},
          {l:"Died in ICE Custody",   v:"52",             c:P.red,    tab:"veterans"},
          {l:"Vietnam-Era Deported",  v:"769",            c:P.amber,  tab:"dcas"},
          {l:"Vietnam-Era in System", v:"970",            c:P.amber,  tab:"dcas"},
          {l:"MX KIA Official",       v:"4 (FOREIGN)",    c:P.red,    tab:"mxkia"},
          {l:"MX KIA Forensic Est.",  v:"~500",           c:P.gold,   tab:"mxkia"},
          {l:"MX KIA Erasure Rate",   v:"99.2%",          c:P.red,    tab:"mxkia"},
          {l:"PTSD-Probable Dep.",    v:"69,881+",        c:"#a78bfa",tab:"ptsdanalyzer"},
          {l:"No Crime Deported",     v:"27,622",         c:P.amber,  tab:"ptsdanalyzer"},
          {l:"BISG Estimate",         v:"2,309",          c:"#a78bfa",tab:"dcas"},
          {l:"DCAS Failure Rate",     v:"84.9%",          c:P.red,    tab:"dcas"},
          {l:"At-Risk Non-Citizen",   v:"94,000",         c:P.amber,  tab:"riskengine"},
          {l:"FOIA Overdue",          v:`${foiaOverdue} files`, c:foiaOverdue>0?P.red:P.teal, tab:"foiatrack"},
        ].map((s, i) => (
          <div key={i} className="dcard" onClick={() => setTab(s.tab)} style={{
            background:CARD, border:`1px solid ${BORDER}`,
            borderLeft:`3px solid ${s.c}`,
            borderRadius:8, padding:"12px 14px", cursor:"pointer",
            boxShadow:"0 2px 10px rgba(0,0,0,0.35)",
            animationDelay:`${i*20}ms`, transition:"all .12s",
          }}>
            <div style={{ fontSize:9, color:P.t3, marginBottom:5, letterSpacing:1, fontWeight:600, textTransform:"uppercase" }}>{s.l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:20, fontWeight:800, color:s.c, lineHeight:1 }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
