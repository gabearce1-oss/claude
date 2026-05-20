import { useState, useEffect, useRef } from "react";
import { P, CASES, KEY_STATS, FOIA_REQUESTS } from "../../lib/teData";
import PTSDAnalysisPanel from "./PTSDAnalysisPanel";

const CHC_DATE = new Date("2026-05-18");
const MS_DATE  = new Date("2026-05-31");

const NERO_SCORES = { N: 94, E: 97, R: 91, O: 96 };
const NERO_LABELS = { N:"Notification", E:"Erasure", R:"Restriction", O:"Obscurity" };
const NERO_DESC   = {
  N:"Citizenship promise never formalized",
  E:"84.9% DCAS misclassification rate",
  R:"Post-deportation VA benefit lockout",
  O:"92 confirmed vs 94,000+ estimated",
};

const STREAMS = [
  { id:"S1", label:"DCAS Official",     value:349,   pct:0.60, c:P.red,    note:"ANOMALOUS BASELINE" },
  { id:"S2", label:"BISG τ=0.40",       value:2309,  pct:3.97, c:P.violet, note:"FORENSIC ESTIMATE" },
  { id:"S3", label:"NARA Retroactive",  value:3070,  pct:5.27, c:P.blue,   note:"ARCHIVAL" },
  { id:"S4", label:"Guzmán 1969",       value:3500,  pct:6.01, c:P.teal,   note:"HISTORICAL" },
  { id:"S5", label:"LAE Database",      value:3741,  pct:6.43, c:P.gold,   note:"COMMUNITY" },
];

const CASE_META = {
  "EPP-001":{ tier:"Gold",   color:P.gold,   urgency:0, flag:"🥇" },
  "EPP-002":{ tier:"Gold",   color:P.blue,   urgency:0, flag:"🔵" },
  "EPP-003":{ tier:"Gold",   color:P.red,    urgency:1, flag:"⚡" },
  "EPP-004":{ tier:"Silver", color:P.amber,  urgency:0, flag:"🟡" },
  "EPP-005":{ tier:"Gold",   color:P.gold,   urgency:0, flag:"🥇" },
  "EPP-006":{ tier:"Bronze", color:P.violet, urgency:0, flag:"🟣" },
};

function Countdown({ target, label, color }) {
  const [time, setTime] = useState({});
  useEffect(() => {
    const calc = () => {
      const diff = target - new Date();
      if (diff <= 0) { setTime({d:0,h:0,m:0,s:0}); return; }
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
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:6,color:P.t4,letterSpacing:2,marginBottom:4}}>{label}</div>
      <div style={{display:"flex",gap:4,justifyContent:"center"}}>
        {[["d","DAYS"],["h","HRS"],["m","MIN"],["s","SEC"]].map(([k,u])=>(
          <div key={k} style={{background:"#080D18",border:`1px solid ${color}30`,borderRadius:5,padding:"4px 6px",minWidth:34,textAlign:"center"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,fontWeight:800,color,lineHeight:1}}>{String(time[k]??0).padStart(2,"0")}</div>
            <div style={{fontSize:5,color:P.t4}}>{u}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnimatedBar({ value, max, color, delay=0 }) {
  const [width, setWidth] = useState(0);
  useEffect(()=>{ const t=setTimeout(()=>setWidth((value/max)*100),delay+100); return()=>clearTimeout(t); },[value,max,delay]);
  return (
    <div style={{background:"#030508",borderRadius:3,height:7,overflow:"hidden",flex:1}}>
      <div style={{width:`${width}%`,height:"100%",background:color,borderRadius:3,transition:"width 1.2s cubic-bezier(.4,0,.2,1)"}}/>
    </div>
  );
}

function PulsingDot({ color, size=8 }) {
  return (
    <span style={{display:"inline-block",width:size,height:size,borderRadius:"50%",
      background:color,boxShadow:`0 0 6px ${color}`,
      animation:"pulse 2s ease-in-out infinite"}}/>
  );
}

export default function InteractiveDashboard({ setTab }) {
  const [hoveredCase, setHoveredCase] = useState(null);
  const [hoveredStream, setHoveredStream] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(()=>{
    const t = setInterval(()=>setTick(p=>p+1), 5000);
    return ()=>clearInterval(t);
  },[]);

  const chcDays = Math.ceil((CHC_DATE - new Date()) / 86400000);
  const msDays  = Math.ceil((MS_DATE  - new Date()) / 86400000);
  const foiaOverdue = FOIA_REQUESTS.filter(r=>r.daysOverdue>0).length;

  return (
    <div style={{fontFamily:"'IBM Plex Mono',monospace",color:P.t1}}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .dash-card { animation: fadeIn .4s ease both; }
        .dash-card:hover { border-color: rgba(245,200,66,.3) !important; }
      `}</style>

      {/* ── TOP ALERT STRIP ─────────────────────────────────────── */}
      {foiaOverdue > 0 && (
        <div style={{background:`${P.red}10`,border:`1px solid ${P.red}30`,borderRadius:8,padding:"8px 16px",marginBottom:12,
          display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <PulsingDot color={P.red} size={8}/>
          <span style={{fontSize:9,color:P.red,fontWeight:800}}>CRITICAL: {foiaOverdue} FOIA REQUESTS OVERDUE</span>
          {FOIA_REQUESTS.filter(r=>r.daysOverdue>0).map(r=>(
            <span key={r.id} style={{fontSize:7,background:`${P.red}15`,border:`1px solid ${P.red}25`,color:P.red,
              borderRadius:20,padding:"2px 9px"}}>{r.id} · {r.agency} · {r.daysOverdue}d overdue</span>
          ))}
          <button onClick={()=>setTab("foiatrack")}
            style={{marginLeft:"auto",padding:"4px 12px",fontSize:7,fontWeight:800,cursor:"pointer",
              background:`${P.red}20`,border:`1px solid ${P.red}40`,color:P.red,borderRadius:20}}>
            → VIEW FOIA TRACKER
          </button>
        </div>
      )}

      {/* ── ROW 1: COUNTDOWNS + HERO STAT ───────────────────────── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 2fr",gap:12,marginBottom:14}}>
        {/* CHC Countdown */}
        <div className="dash-card" style={{background:P.card,border:`2px solid ${chcDays<=30?P.red:P.amber}30`,
          borderTop:`3px solid ${chcDays<=30?P.red:P.amber}`,borderRadius:10,padding:"14px 16px"}}>
          <div style={{fontSize:7,color:chcDays<=30?P.red:P.amber,fontWeight:800,letterSpacing:2,marginBottom:10}}>🏛️ CHC BRIEFING</div>
          <Countdown target={CHC_DATE} label="MAY 18, 2026" color={chcDays<=30?P.red:P.amber}/>
          <button onClick={()=>setTab("chcreport")}
            style={{width:"100%",marginTop:10,padding:"5px",fontSize:7,fontWeight:800,cursor:"pointer",
              background:chcDays<=30?`${P.red}15`:`${P.amber}12`,border:`1px solid ${chcDays<=30?P.red:P.amber}30`,
              color:chcDays<=30?P.red:P.amber,borderRadius:6}}>→ Open Report Generator</button>
        </div>

        {/* Manuscript Countdown */}
        <div className="dash-card" style={{background:P.card,border:`1px solid ${P.gold}25`,borderTop:`3px solid ${P.gold}`,borderRadius:10,padding:"14px 16px"}}>
          <div style={{fontSize:7,color:P.gold,fontWeight:800,letterSpacing:2,marginBottom:10}}>📖 MANUSCRIPT</div>
          <Countdown target={MS_DATE} label="MAY 31, 2026" color={P.gold}/>
          <button onClick={()=>setTab("litcentral")}
            style={{width:"100%",marginTop:10,padding:"5px",fontSize:7,fontWeight:800,cursor:"pointer",
              background:`${P.gold}12`,border:`1px solid ${P.gold}25`,color:P.gold,borderRadius:6}}>→ Open LitCentral</button>
        </div>

        {/* System health */}
        <div className="dash-card" style={{background:P.card,border:`1px solid ${P.teal}25`,borderTop:`3px solid ${P.teal}`,borderRadius:10,padding:"14px 16px"}}>
          <div style={{fontSize:7,color:P.teal,fontWeight:800,letterSpacing:2,marginBottom:10}}>⚙️ SYSTEM STATUS</div>
          {[
            {l:"TE360 Engine",    ok:true},
            {l:"n8n Pipelines",   ok:false},
            {l:"HubSpot CRM",     ok:true},
            {l:"Scholar DB",      ok:true},
            {l:"Evidence Chain",  ok:true},
            {l:"FOIA Tracker",    ok:foiaOverdue===0},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"2px 0"}}>
              <span style={{fontSize:7,color:P.t3}}>{s.l}</span>
              <span style={{fontSize:7,fontWeight:800,color:s.ok?P.teal:P.amber}}>
                {s.ok?<PulsingDot color={P.teal} size={6}/>:<PulsingDot color={P.amber} size={6}/>}
              </span>
            </div>
          ))}
        </div>

        {/* Hero stat — Forensic Erasure */}
        <div className="dash-card" style={{background:"linear-gradient(135deg,#030508,#080D18)",
          border:`2px solid ${P.red}40`,borderRadius:10,padding:"16px 20px",
          position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,right:0,width:200,height:200,
            background:`radial-gradient(circle,${P.red}15 0%,transparent 70%)`,pointerEvents:"none"}}/>
          <div style={{fontSize:7,color:P.t4,letterSpacing:2,marginBottom:8}}>🔬 PRIMARY FORENSIC FINDING — MEXICAN NATIONALS KILLED IN VIETNAM</div>
          <div style={{display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:7,color:P.red,marginBottom:2}}>DCAS OFFICIAL (FOREIGN)</div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:40,fontWeight:800,color:P.red,lineHeight:1}}>4</div>
              <div style={{fontSize:7,color:P.t4}}>Zero visibility in system</div>
            </div>
            <div style={{fontSize:28,color:P.t4}}>→</div>
            <div>
              <div style={{fontSize:7,color:P.gold,marginBottom:2}}>FORENSIC ESTIMATE (BISG + 5-STREAM)</div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:40,fontWeight:800,color:P.gold,lineHeight:1}}>~500</div>
              <div style={{fontSize:7,color:P.t4}}>346–741 confidence band</div>
            </div>
            <div style={{marginLeft:"auto",textAlign:"right",background:`${P.red}08`,borderRadius:8,padding:"8px 12px",border:`1px solid ${P.red}30`}}>
              <div style={{fontSize:13,fontWeight:800,color:P.red,fontFamily:"'IBM Plex Mono',monospace"}}>99.2%</div>
              <div style={{fontSize:7,color:P.t4}}>institutional erasure</div>
              <div style={{marginTop:6,fontSize:16,fontWeight:800,color:P.red}}>~496</div>
              <div style={{fontSize:7,color:P.t4}}>invisible veterans</div>
            </div>
          </div>
          <div style={{marginTop:10,padding:"8px 10px",background:"#080D18",borderRadius:6,fontSize:7,color:P.t3,lineHeight:1.6,borderLeft:`3px solid ${P.red}`}}>
            BISG τ=0.40 validates 2,309 in broader cohort; 4 FOREIGN records = baseline floor. 346–741 represents forensic convergence across 5 data streams (SSS, DCAS, USCIS N-644, VA DIC, SRE consular records).
          </div>
          <div style={{marginTop:10,display:"flex",gap:6}}>
            <button onClick={()=>setTab("mxkia")} style={{flex:1,padding:"5px",fontSize:7,fontWeight:800,cursor:"pointer",
              background:`${P.red}12`,border:`1px solid ${P.red}25`,color:P.red,borderRadius:6}}>→ MX KIA Forensic</button>
            <button onClick={()=>setTab("dcas")} style={{flex:1,padding:"5px",fontSize:7,fontWeight:800,cursor:"pointer",
              background:`${P.violet}12`,border:`1px solid ${P.violet}25`,color:P.violet,borderRadius:6}}>→ DCAS Audit</button>
            <button onClick={()=>setTab("forensicseries")} style={{flex:1,padding:"5px",fontSize:7,fontWeight:800,cursor:"pointer",
              background:`${P.gold}12`,border:`1px solid ${P.gold}25`,color:P.gold,borderRadius:6}}>→ Forensic Leads</button>
          </div>
        </div>
      </div>

      {/* ── ROW 2: 5-STREAM CONVERGENCE + NERO ──────────────────── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>

        {/* 5-Stream Convergence */}
        <div className="dash-card" style={{background:P.card,border:`1px solid ${P.b}`,borderRadius:10,padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:10,fontWeight:800,color:P.t1}}>📊 5-Stream Convergence Analysis</div>
            <span style={{fontSize:7,background:`${P.teal}12`,border:`1px solid ${P.teal}20`,color:P.teal,borderRadius:20,padding:"2px 8px"}}>R²=0.947 · p&lt;0.001</span>
          </div>
          {STREAMS.map((s,i)=>(
            <div key={s.id}
              onMouseEnter={()=>setHoveredStream(s.id)} onMouseLeave={()=>setHoveredStream(null)}
              style={{padding:"6px 8px",borderRadius:6,marginBottom:4,cursor:"default",
                background:hoveredStream===s.id?`${s.c}08`:"transparent",
                border:`1px solid ${hoveredStream===s.id?s.c+"30":"transparent"}`,transition:"all .15s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{fontSize:8,fontFamily:"'IBM Plex Mono',monospace",color:s.c,fontWeight:800,minWidth:14}}>{s.id}</span>
                  <span style={{fontSize:8,color:P.t3}}>{s.label}</span>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:7,color:P.t4}}>{s.pct}%</span>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:800,color:s.c,minWidth:40,textAlign:"right"}}>{s.value.toLocaleString()}</span>
                </div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <AnimatedBar value={s.value} max={4000} color={s.c} delay={i*120}/>
                <span style={{fontSize:6,color:s.c,minWidth:90}}>{s.note}</span>
              </div>
            </div>
          ))}
          <div style={{marginTop:8,padding:"6px 8px",background:"#080D18",borderRadius:6}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:7}}>
              <span style={{color:P.t4}}>Undercount factor</span>
              <span style={{color:P.red,fontWeight:800,fontFamily:"'IBM Plex Mono',monospace"}}>6.6× minimum</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:7}}>
              <span style={{color:P.t4}}>BISG τ stability band</span>
              <span style={{color:P.teal,fontWeight:800,fontFamily:"'IBM Plex Mono',monospace"}}>τ=0.30–0.70</span>
            </div>
          </div>
        </div>

        {/* NERO Scores */}
        <div className="dash-card" style={{background:P.card,border:`1px solid ${P.b}`,borderRadius:10,padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:10,fontWeight:800,color:P.t1}}>⚠️ NERO Institutional Erasure Scores</div>
            <button onClick={()=>setTab("riskengine")} style={{padding:"2px 8px",fontSize:7,cursor:"pointer",
              background:`${P.red}12`,border:`1px solid ${P.red}25`,color:P.red,borderRadius:20}}>→ Risk Engine</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
            {Object.entries(NERO_SCORES).map(([k,v])=>{
              const c = v>=96?P.red:v>=93?P.amber:P.gold;
              return (
                <div key={k} style={{background:"#080D18",borderRadius:8,padding:"10px 12px",border:`1px solid ${c}20`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                    <div>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:800,color:c}}>{k}</div>
                      <div style={{fontSize:7,color:P.t4}}>{NERO_LABELS[k]}</div>
                    </div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:20,fontWeight:800,color:c}}>{v}</div>
                  </div>
                  <div style={{background:"#030508",borderRadius:3,height:5,overflow:"hidden",marginBottom:4}}>
                    <div style={{width:`${v}%`,height:"100%",background:c,borderRadius:3,transition:"width 1.5s ease"}}/>
                  </div>
                  <div style={{fontSize:6,color:P.t4,lineHeight:1.4}}>{NERO_DESC[k]}</div>
                </div>
              );
            })}
          </div>
          <div style={{padding:"6px 10px",background:`${P.red}08`,border:`1px solid ${P.red}20`,borderRadius:7}}>
            <div style={{fontSize:7,color:P.red,fontWeight:700}}>Combined NERO Index: {Math.round(Object.values(NERO_SCORES).reduce((a,b)=>a+b,0)/4)}/100 — CRITICAL THRESHOLD</div>
            <div style={{fontSize:6,color:P.t4,marginTop:2}}>All 4 vectors exceed 90 — systematic institutional erasure confirmed</div>
          </div>
        </div>
      </div>

      {/* ── ROW 3: CASES + FOIA + QUICK ACTIONS ─────────────────── */}
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:12,marginBottom:14}}>

        {/* 6 Cases grid */}
        <div className="dash-card" style={{background:P.card,border:`1px solid ${P.b}`,borderRadius:10,padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:10,fontWeight:800,color:P.t1}}>🎖️ CB-HSIVF Verified Cases</div>
            <button onClick={()=>setTab("veterans")} style={{padding:"2px 8px",fontSize:7,cursor:"pointer",
              background:`${P.gold}12`,border:`1px solid ${P.gold}25`,color:P.gold,borderRadius:20}}>→ Full Registry</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            {CASES.map(c=>{
              const meta = CASE_META[c.id];
              const isCritical = c.id==="C004";
              const isHovered = hoveredCase===c.id;
              return (
                <div key={c.id}
                  onMouseEnter={()=>setHoveredCase(c.id)} onMouseLeave={()=>setHoveredCase(null)}
                  onClick={()=>setTab("veterans")} style={{
                  background:isHovered?`${meta.color}10`:"#080D18",
                  border:`1px solid ${isCritical?P.red+(isHovered?"80":"30"):meta.color+(isHovered?"50":"20")}`,
                  borderLeft:`4px solid ${isCritical?P.red:meta.color}`,
                  borderRadius:8,padding:"8px 10px",cursor:"pointer",transition:"all .15s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
                    <span style={{fontSize:7,color:P.t4,fontFamily:"'IBM Plex Mono',monospace"}}>{c.id}</span>
                    <div style={{display:"flex",gap:3,alignItems:"center"}}>
                      {isCritical&&<PulsingDot color={P.red} size={6}/>}
                      <span style={{fontSize:8}}>{meta.flag}</span>
                    </div>
                  </div>
                  <div style={{fontSize:9,fontWeight:800,color:isCritical?P.red:meta.color,lineHeight:1.2,marginBottom:2}}>{c.name}</div>
                  <div style={{fontSize:6,color:P.t4,marginBottom:5}}>{c.branch} · {c.country||c.location}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{background:"#030508",borderRadius:2,height:4,flex:1,overflow:"hidden",marginRight:6}}>
                      <div style={{width:`${c.confidence}%`,height:"100%",background:meta.color,borderRadius:2}}/>
                    </div>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:800,color:meta.color}}>{c.confidence}%</span>
                  </div>
                  {isCritical&&<div style={{marginTop:4,fontSize:6,color:P.red,fontWeight:700}}>⚡ SELF-DEPORTED NOV/DEC 2025</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* FOIA Status */}
        <div className="dash-card" style={{background:P.card,border:`1px solid ${P.b}`,borderRadius:10,padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:10,fontWeight:800,color:P.t1}}>📋 FOIA Status</div>
            <button onClick={()=>setTab("foiatrack")} style={{padding:"2px 8px",fontSize:7,cursor:"pointer",
              background:`${P.amber}12`,border:`1px solid ${P.amber}25`,color:P.amber,borderRadius:20}}>→ Tracker</button>
          </div>
          {FOIA_REQUESTS.map((r,i)=>{
            const isOverdue = r.daysOverdue > 0;
            const c = isOverdue?(r.daysOverdue>60?P.red:P.amber):P.teal;
            return (
              <div key={r.id} style={{marginBottom:8,padding:"7px 9px",background:"#080D18",
                border:`1px solid ${c}20`,borderLeft:`3px solid ${c}`,borderRadius:7}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                  <span style={{fontSize:8,fontWeight:800,color:c,fontFamily:"'IBM Plex Mono',monospace"}}>{r.id}</span>
                  {isOverdue?<span style={{fontSize:6,background:`${P.red}15`,color:P.red,borderRadius:20,padding:"1px 5px",fontWeight:700}}>{r.daysOverdue}d LATE</span>
                    :<span style={{fontSize:6,color:P.teal,fontWeight:700}}>● ON TRACK</span>}
                </div>
                <div style={{fontSize:7,color:P.t3}}>{r.agency}</div>
                <div style={{fontSize:6,color:P.t4}}>{r.subject?.slice(0,40)||"Pending"}</div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="dash-card" style={{background:P.card,border:`1px solid ${P.b}`,borderRadius:10,padding:"14px 16px",display:"flex",flexDirection:"column",gap:6}}>
          <div style={{fontSize:10,fontWeight:800,color:P.t1,marginBottom:6}}>⚡ Quick Access</div>
          {[
            {icon:"🤖",label:"AI Research Assistant",tab:"assistant",color:P.violet},
            {icon:"🗃️",label:"Evidence Viewer",     tab:"evidence",  color:P.teal},
            {icon:"🏛️",label:"CHC Report Generator", tab:"chcreport", color:P.gold},
            {icon:"📊",label:"DCAS Forensic Audit",  tab:"dcas",      color:P.red},
            {icon:"🗄️",label:"All Databases",        tab:"databases", color:P.blue},
            {icon:"🕸️",label:"Network Graph",        tab:"network",   color:P.violet},
            {icon:"🌎",label:"Geospatial Map",       tab:"vetmap",    color:P.teal},
            {icon:"📋",label:"FOIA Tracker",         tab:"foiatrack", color:P.amber},
            {icon:"📈",label:"Predictive Analytics", tab:"predictive",color:P.violet},
            {icon:"📡",label:"Live Crawlers",        tab:"crawlers",  color:P.teal},
          ].map(a=>(
            <button key={a.tab} onClick={()=>setTab(a.tab)}
              style={{display:"flex",gap:8,alignItems:"center",padding:"7px 10px",cursor:"pointer",
                background:`${a.color}08`,border:`1px solid ${a.color}20`,borderRadius:7,
                color:a.color,fontSize:8,fontWeight:700,textAlign:"left",
                transition:"all .12s"}}>
              <span style={{fontSize:12}}>{a.icon}</span>{a.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── ROW 4: PTSD ANALYSIS ────────────────────────────────────── */}
      <div style={{marginBottom:14}}>
        <PTSDAnalysisPanel />
      </div>

      {/* ── ROW 5: KPI STRIP ────────────────────────────────────── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
        {[
          {l:"ICE Records Analyzed",  v:"713,464",    c:P.blue,   tab:"dcas"},
          {l:"Total MX Deported",    v:"202,864",    c:P.red,    tab:"dcas"},
          {l:"Trump Era Deported",    v:"130,656",    c:P.red,    tab:"dcas"},
          {l:"Veteran Flags in DB",   v:"ZERO",       c:P.red,    tab:"dcas"},
          {l:"Died in ICE Custody",   v:"52",         c:P.red,    tab:"veterans"},
          {l:"Vietnam-Era Deported",  v:"769",        c:P.amber,  tab:"dcas"},
          {l:"Vietnam-Era in System", v:"970",        c:P.amber,  tab:"dcas"},
          {l:"MX KIA Official DCAS",  v:"4 (FOREIGN)",c:P.red,    tab:"mxkia"},
          {l:"MX KIA Forensic Est.",  v:"~500 (346–741)",c:P.gold, tab:"mxkia"},
          {l:"MX KIA Erasure Rate",   v:"99.2%",      c:P.red,    tab:"mxkia"},
          {l:"PTSD-Probable Dep.",    v:"69,881+",    c:P.violet, tab:"ptsdanalyzer"},
          {l:"No Crime Deported",     v:"27,622",     c:P.amber,  tab:"ptsdanalyzer"},
          {l:"BISG Estimate",         v:"2,309",      c:P.violet, tab:"dcas"},
          {l:"DCAS Failure Rate",     v:"84.9%",      c:P.red,    tab:"dcas"},
          {l:"At-Risk Non-Citizen",   v:"94,000",     c:P.amber,  tab:"riskengine"},
          {l:"FOIA Overdue",          v:`${foiaOverdue} files`,c:foiaOverdue>0?P.red:P.teal,tab:"foiatrack"},
        ].map((s,i)=>(
          <div key={i} className="dash-card" onClick={()=>setTab(s.tab)}
            style={{background:P.card,border:`1px solid ${s.c}20`,borderLeft:`3px solid ${s.c}`,
              borderRadius:7,padding:"8px 12px",cursor:"pointer",animationDelay:`${i*30}ms`,
              transition:"all .12s"}}>
            <div style={{fontSize:7,color:P.t4,marginBottom:3,letterSpacing:1,fontWeight:600}}>{s.l}</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:800,color:s.c,lineHeight:1}}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}