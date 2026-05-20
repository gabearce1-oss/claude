import { P, KEY_STATS, FOIA_REQUESTS, CASES } from "../../lib/teData";

const CHC_DAYS = Math.ceil((new Date("2026-05-18") - new Date()) / 86400000);
const MS_DAYS  = Math.ceil((new Date("2026-05-31") - new Date()) / 86400000);

const StatCard = ({ label, value, sub, color, onClick, urgent }) => (
  <div onClick={onClick}
    style={{ background: urgent ? color+"10" : P.card, border:`1px solid ${color}30`,
      borderLeft:`4px solid ${color}`, borderRadius:10, padding:"12px 14px",
      cursor: onClick ? "pointer" : "default", transition:"all .15s",
      boxShadow: urgent ? `0 0 12px ${color}20` : "none" }}>
    <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:5, textTransform:"uppercase" }}>{label}</div>
    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:22, fontWeight:800, color, lineHeight:1 }}>{value}</div>
    {sub && <div style={{ fontSize:8, color:P.t3, marginTop:4 }}>{sub}</div>}
  </div>
);

const AlertRow = ({ label, value, color, action }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"7px 0", borderBottom:`1px solid ${P.b}30` }}>
    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
      <span style={{ width:7, height:7, borderRadius:"50%", background:color, display:"inline-block", flexShrink:0 }} />
      <span style={{ fontSize:9, color:P.t2 }}>{label}</span>
    </div>
    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color, fontWeight:700 }}>{value}</span>
      {action && <span style={{ fontSize:7, color:P.t4 }}>{action}</span>}
    </div>
  </div>
);

export default function HomeOverview({ onSearch, setTab }) {
  const overdueCount = FOIA_REQUESTS.filter(r => r.status.includes("OVERDUE")).length;

  return (
    <div style={{ padding:"16px 0" }}>

      {/* Mission statement */}
      <div style={{ background:`linear-gradient(135deg,${P.gold}10,${P.blue}08)`,
        border:`1px solid ${P.gold}30`, borderRadius:12, padding:"16px 20px", marginBottom:16 }}>
        <div style={{ fontSize:7, color:P.gold, letterSpacing:5, fontWeight:700, marginBottom:6 }}>
          MISSION · SGT GEORGE RAMOS RESEARCH PLATFORM
        </div>
        <div style={{ fontSize:13, fontWeight:700, color:P.t1, lineHeight:1.6, marginBottom:8 }}>
          Forensic civic intelligence revealing the systematic erasure of Hispanic Vietnam veterans.{" "}
          <span style={{ color:P.gold }}>349 officially coded. BISG estimates 2,309.</span>{" "}
          The gap is <span style={{ color:P.red }}>84.9% misclassification</span> — 1,960 erased.
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {["DCAS 58,220 Records", "6 Verified CB-HSIVF Cases", "46 Data Sources", "30 Active Crawlers"].map(t => (
            <span key={t} style={{ fontSize:8, background:P.card, border:`1px solid ${P.b}`,
              color:P.t3, borderRadius:20, padding:"3px 10px" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Key stats grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:8, marginBottom:16 }}>
        <StatCard label="DCAS Official Hispanic" value="349" sub="0.60% of 58,220 records" color={P.red} onClick={() => onSearch("DCAS 349 hispanic")} />
        <StatCard label="BISG Corrected Estimate" value="2,309" sub="3.97% — 6.6× undercount" color={P.violet} onClick={() => onSearch("BISG methodology")} />
        <StatCard label="Failure Rate" value="84.9%" sub="Classification miscount" color={P.amber} />
        <StatCard label="Deported Jan–Jun 2025" value="10,000+" sub="Rep. Ansari letter to DHS" color={P.red} urgent onClick={() => setTab("veterans")} />
        <StatCard label="CHC Briefing" value={`${CHC_DAYS}d`} sub="May 18, 2026" color={CHC_DAYS <= 30 ? P.red : P.gold} onClick={() => setTab("briefing")} />
        <StatCard label="Manuscript Deadline" value={`${MS_DAYS}d`} sub="May 31, 2026" color={P.orange} onClick={() => setTab("litcentral")} />
      </div>

      {/* Two-column panel */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>

        {/* FOIA Alerts */}
        <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:12, overflow:"hidden" }}>
          <div style={{ background:`linear-gradient(90deg,${P.red}15,transparent)`,
            borderBottom:`1px solid ${P.b}`, padding:"9px 14px",
            display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:10, fontWeight:700, color:P.t1 }}>📋 FOIA Tracker</span>
            <button onClick={() => setTab("foia")}
              style={{ fontSize:7, color:P.red, background:"transparent", border:`1px solid ${P.red}30`,
                borderRadius:4, padding:"2px 7px", cursor:"pointer" }}>
              {overdueCount} OVERDUE →
            </button>
          </div>
          <div style={{ padding:"10px 14px" }}>
            {FOIA_REQUESTS.map((r,i) => (
              <AlertRow key={i} label={r.agency} value={r.status}
                color={r.color} action={r.daysOverdue > 0 ? `${r.daysOverdue}d over` : `Due ${r.due}`} />
            ))}
          </div>
        </div>

        {/* Active Cases */}
        <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:12, overflow:"hidden" }}>
          <div style={{ background:`linear-gradient(90deg,${P.gold}15,transparent)`,
            borderBottom:`1px solid ${P.b}`, padding:"9px 14px",
            display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:10, fontWeight:700, color:P.t1 }}>🎖️ Verified Cases</span>
            <button onClick={() => setTab("veterans")}
              style={{ fontSize:7, color:P.gold, background:"transparent", border:`1px solid ${P.gold}30`,
                borderRadius:4, padding:"2px 7px", cursor:"pointer" }}>
              View all →
            </button>
          </div>
          <div style={{ padding:"10px 14px" }}>
            {CASES.map((c,i) => {
              const tc = c.tier === "Gold" ? P.gold : P.t3;
              const isUrgent = c.id === "C004";
              return (
                <div key={i} onClick={() => { onSearch(c.id); }}
                  style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                    padding:"6px 0", borderBottom:`1px solid ${P.b}30`, cursor:"pointer" }}>
                  <div style={{ display:"flex", gap:7, alignItems:"center" }}>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, color:P.t4 }}>{c.id}</span>
                    <span style={{ fontSize:9, color: isUrgent ? P.red : P.t1, fontWeight: isUrgent ? 700 : 400 }}>
                      {c.name} {isUrgent ? "⚡" : ""}
                    </span>
                  </div>
                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:tc, fontWeight:700 }}>{c.confidence}%</span>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:tc, display:"inline-block" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick queries */}
      <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:12, padding:"12px 14px" }}>
        <div style={{ fontSize:7, color:P.t4, letterSpacing:3, marginBottom:8 }}>⚡ QUICK INTEL — Click to search</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:6 }}>
          {[
            { q:"DCAS 349 hispanic", label:"🔴 DCAS 349 Anomaly", desc:"Core forensic gap — 84.9% failure rate" },
            { q:"deported veteran Mexico 2025", label:"⚡ Deported Vets 2025", desc:"Sae Joon Park + 10,000+ Jan–Jun" },
            { q:"FOIA VA BIRLS", label:"📋 FOIA Overdue", desc:"83 days overdue — call 1-877-750-3639" },
            { q:"BISG methodology", label:"🔬 BISG Analysis", desc:"7-stream convergence · τ=0.30–0.70 stable" },
            { q:"Vietnam Mexican national", label:"🌎 Non-Citizen Draft", desc:"50 USC §3802 · Legal trap mechanism" },
            { q:"CASE-C001", label:"🎖️ Jesus S. Duran", desc:"MOH 2014 · Gold tier · C001" },
          ].map(({ q, label, desc }) => (
            <button key={q} onClick={() => onSearch(q)}
              style={{ background:"#080D18", border:`1px solid ${P.b}`, borderRadius:8,
                padding:"8px 12px", textAlign:"left", cursor:"pointer",
                transition:"border-color .15s, background .15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = P.blue; e.currentTarget.style.background = P.card; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = P.b; e.currentTarget.style.background = "#080D18"; }}>
              <div style={{ fontSize:9, fontWeight:700, color:P.t1, marginBottom:2 }}>{label}</div>
              <div style={{ fontSize:8, color:P.t4 }}>{desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}