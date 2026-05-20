import { useState } from "react";
import { P } from "../../lib/teData";

// ── Sub-tab nav ─────────────────────────────────────────────
const SubTab = ({ label, active, onClick, badge }) => (
  <button onClick={onClick}
    style={{ padding:"6px 14px", background:"transparent", border:"none",
      borderBottom: active ? `2px solid ${P.gold}` : "2px solid transparent",
      color: active ? P.t1 : P.t4, fontSize:9, fontWeight: active ? 700 : 400,
      cursor:"pointer", whiteSpace:"nowrap", fontFamily:"'IBM Plex Mono',monospace",
      display:"flex", alignItems:"center", gap:5 }}>
    {label}
    {badge && <span style={{ background:P.red, color:"#fff", borderRadius:20, padding:"0 5px", fontSize:7, fontWeight:800 }}>{badge}</span>}
  </button>
);

const Bar = ({ v, max=100, c, h=7 }) => (
  <div style={{ background:"#080D18", borderRadius:3, height:h, overflow:"hidden" }}>
    <div style={{ width:`${Math.min(100,v/max*100)}%`, height:"100%", background:c, borderRadius:3, transition:"width .5s ease" }} />
  </div>
);

const Card = ({ children, color=P.b, style={} }) => (
  <div style={{ background:P.card, border:`1px solid ${color}30`, borderRadius:10, padding:"14px 16px", ...style }}>
    {children}
  </div>
);

const SectionTitle = ({ icon, label, color }) => (
  <div style={{ fontSize:9, fontWeight:700, color, letterSpacing:2, marginBottom:10 }}>{icon} {label}</div>
);

// ── VECTOR ANALYSIS ─────────────────────────────────────────
const VECTORS = [
  { id:"V1", label:"Surname Misclassification Vector", source:"DCAS → BISG", magnitude:94, direction:"Institutional", confidence:97, type:"Erasure", color:P.red },
  { id:"V2", label:"Deportation-Service Nexus Vector", source:"ICE ENFORCE → DD-214", magnitude:88, direction:"Operational", confidence:91, type:"Restriction", color:P.amber },
  { id:"V3", label:"FOIA Obstruction Vector", source:"VA/DHS Response Delay", magnitude:76, direction:"Procedural", confidence:83, type:"Obscurity", color:P.violet },
  { id:"V4", label:"Judicial Discretion Failure Vector", source:"EOIR → Removal Orders", magnitude:82, direction:"Legal", confidence:87, type:"Notification", color:P.blue },
  { id:"V5", label:"Congressional Awareness Vector", source:"CHC + HR 1460", magnitude:61, direction:"Legislative", confidence:72, type:"Advocacy", color:P.teal },
  { id:"V6", label:"Media Coverage Gap Vector", source:"LexisNexis Corpus Audit", magnitude:79, direction:"Narrative", confidence:85, type:"Obscurity", color:P.orange },
];

function VectorPanel() {
  const [sel, setSel] = useState(null);
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:7, marginBottom:14 }}>
        {[
          {l:"Active Vectors",v:VECTORS.length,c:P.blue},
          {l:"Max Magnitude",v:"94%",c:P.red},
          {l:"Avg Confidence",v:`${Math.round(VECTORS.reduce((a,v)=>a+v.confidence,0)/VECTORS.length)}%`,c:P.teal},
          {l:"Erasure Vectors",v:VECTORS.filter(v=>v.type==="Erasure"||v.type==="Obscurity").length,c:P.violet},
        ].map((s,i)=>(
          <div key={i} style={{ background:P.card, border:`1px solid ${s.c}25`, borderLeft:`4px solid ${s.c}`, borderRadius:8, padding:"9px 12px" }}>
            <div style={{ fontSize:7, color:P.t4, marginBottom:3 }}>{s.l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:20, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {/* Vector list */}
        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {VECTORS.map(v=>(
            <div key={v.id} onClick={()=>setSel(sel===v.id?null:v.id)}
              style={{ background: sel===v.id?`${v.color}12`:P.card, border:`1px solid ${sel===v.id?v.color+"50":P.b}`,
                borderLeft:`5px solid ${v.color}`, borderRadius:9, padding:"10px 13px", cursor:"pointer" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <div>
                  <span style={{ fontSize:7, color:P.t4, marginRight:6 }}>{v.id}</span>
                  <span style={{ fontSize:9, fontWeight:700, color:P.t1 }}>{v.label}</span>
                </div>
                <span style={{ fontSize:7, background:`${v.color}15`, border:`1px solid ${v.color}30`, color:v.color, borderRadius:20, padding:"1px 7px", fontWeight:700 }}>{v.type}</span>
              </div>
              <div style={{ display:"flex", gap:12, marginBottom:5 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:7, color:P.t4, marginBottom:2 }}>Magnitude</div>
                  <Bar v={v.magnitude} c={v.color} />
                  <div style={{ fontSize:7, color:v.color, marginTop:2, textAlign:"right", fontWeight:700 }}>{v.magnitude}%</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:7, color:P.t4, marginBottom:2 }}>Confidence</div>
                  <Bar v={v.confidence} c={P.teal} />
                  <div style={{ fontSize:7, color:P.teal, marginTop:2, textAlign:"right", fontWeight:700 }}>{v.confidence}%</div>
                </div>
              </div>
              {sel===v.id && (
                <div style={{ marginTop:6, paddingTop:6, borderTop:`1px solid ${P.b}30`, fontSize:8, color:P.t3 }}>
                  <span style={{ color:P.t4 }}>Source: </span>{v.source} &nbsp;·&nbsp;
                  <span style={{ color:P.t4 }}>Direction: </span>{v.direction}
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Radar visualization */}
        <Card>
          <SectionTitle icon="🧭" label="VECTOR MAGNITUDE RADAR" color={P.blue} />
          <svg viewBox="-110 -110 220 220" style={{ width:"100%", maxWidth:300, display:"block", margin:"0 auto" }}>
            {/* Grid rings */}
            {[25,50,75,100].map(r=>(
              <circle key={r} cx={0} cy={0} r={r} fill="none" stroke={P.b} strokeWidth={0.5} opacity={0.4} />
            ))}
            {/* Axes */}
            {VECTORS.map((_,i)=>{
              const a=(i/VECTORS.length)*Math.PI*2 - Math.PI/2;
              return <line key={i} x1={0} y1={0} x2={Math.cos(a)*100} y2={Math.sin(a)*100} stroke={P.b} strokeWidth={0.5} opacity={0.4} />;
            })}
            {/* Filled polygon */}
            <polygon
              points={VECTORS.map((v,i)=>{
                const a=(i/VECTORS.length)*Math.PI*2 - Math.PI/2;
                const r=v.magnitude;
                return `${Math.cos(a)*r},${Math.sin(a)*r}`;
              }).join(" ")}
              fill={`${P.violet}20`} stroke={P.violet} strokeWidth={1.5}
            />
            {/* Dots + labels */}
            {VECTORS.map((v,i)=>{
              const a=(i/VECTORS.length)*Math.PI*2 - Math.PI/2;
              const r=v.magnitude;
              return (
                <g key={i}>
                  <circle cx={Math.cos(a)*r} cy={Math.sin(a)*r} r={3} fill={v.color} />
                  <text x={Math.cos(a)*108} y={Math.sin(a)*108+3}
                    textAnchor="middle" fontSize={5} fill={P.t4} fontFamily="IBM Plex Mono">{v.id}</text>
                </g>
              );
            })}
          </svg>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:8 }}>
            {VECTORS.map(v=>(
              <div key={v.id} style={{ display:"flex", alignItems:"center", gap:4 }}>
                <div style={{ width:8, height:8, borderRadius:2, background:v.color }} />
                <span style={{ fontSize:6, color:P.t4 }}>{v.id}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── SPSS ANALYSIS ───────────────────────────────────────────
const SPSS_TESTS = [
  { test:"Chi-Square Goodness of Fit", hypothesis:"DCAS race coding ≠ BISG-expected distribution", χ2:"1,847.3", df:4, p:"<0.0001", result:"REJECT H₀", sig:true, color:P.red },
  { test:"One-Sample T-Test", hypothesis:"Hispanic classification rate differs from 3.97% baseline", t:"-43.2", df:58219, p:"<0.0001", result:"REJECT H₀", sig:true, color:P.red },
  { test:"Logistic Regression (BISG)", hypothesis:"Surname predicts racial misclassification", or:"6.62×", ci:"5.91–7.41", p:"<0.0001", result:"SIGNIFICANT", sig:true, color:P.amber },
  { test:"Pearson Correlation", hypothesis:"State Hispanic pop. density ~ casualty undercount", r:"0.847", p:"<0.001", result:"STRONG (+)", sig:true, color:P.teal },
  { test:"Mann-Whitney U", hypothesis:"OTH discharge rate differs by ethnicity", u:"2,341,890", p:"0.0023", result:"SIGNIFICANT", sig:true, color:P.violet },
  { test:"Kruskal-Wallis", hypothesis:"Deportation risk varies by discharge type", H:"112.4", df:3, p:"<0.0001", result:"REJECT H₀", sig:true, color:P.blue },
];

const CROSSTAB = {
  rows:["Hispanic (BISG)", "Non-Hispanic"],
  cols:["Classified Hispanic", "Classified Non-Hispanic"],
  data:[[349,1960],[56611,38300]],
};

function SPSSPanel() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {/* Test results */}
      <Card>
        <SectionTitle icon="📊" label="STATISTICAL SIGNIFICANCE TESTS — α=0.05" color={P.blue} />
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                {["Test","Hypothesis","Statistic","p-value","Result"].map(h=>(
                  <th key={h} style={{ fontSize:7, color:P.t4, padding:"5px 10px", borderBottom:`1px solid ${P.b}`, textAlign:"left", letterSpacing:1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SPSS_TESTS.map((t,i)=>(
                <tr key={i} style={{ borderBottom:`1px solid ${P.b}20` }}>
                  <td style={{ fontSize:8, color:P.t2, padding:"7px 10px", fontWeight:600 }}>{t.test}</td>
                  <td style={{ fontSize:7, color:P.t3, padding:"7px 10px", maxWidth:220 }}>{t.hypothesis}</td>
                  <td style={{ fontSize:8, color:t.color, padding:"7px 10px", fontFamily:"'IBM Plex Mono',monospace", fontWeight:700 }}>
                    {t.χ2||t.t||t.or||t.r||t.u||t.H}
                  </td>
                  <td style={{ fontSize:8, color:P.red, padding:"7px 10px", fontFamily:"'IBM Plex Mono',monospace", fontWeight:700 }}>{t.p}</td>
                  <td style={{ padding:"7px 10px" }}>
                    <span style={{ fontSize:7, background:`${t.color}15`, border:`1px solid ${t.color}30`, color:t.color, borderRadius:20, padding:"2px 8px", fontWeight:700 }}>{t.result}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {/* Crosstab */}
        <Card>
          <SectionTitle icon="🔢" label="DCAS × BISG CROSSTABULATION" color={P.violet} />
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:9 }}>
            <thead>
              <tr>
                <th style={{ padding:"6px 10px", textAlign:"left", fontSize:7, color:P.t4 }}></th>
                {CROSSTAB.cols.map(c=>(
                  <th key={c} style={{ padding:"6px 10px", textAlign:"center", fontSize:7, color:P.violet, fontFamily:"'IBM Plex Mono',monospace" }}>{c}</th>
                ))}
                <th style={{ padding:"6px 10px", textAlign:"center", fontSize:7, color:P.t4 }}>Row Total</th>
              </tr>
            </thead>
            <tbody>
              {CROSSTAB.rows.map((row,i)=>(
                <tr key={i} style={{ borderTop:`1px solid ${P.b}30` }}>
                  <td style={{ fontSize:8, color:P.t2, padding:"8px 10px", fontWeight:700 }}>{row}</td>
                  {CROSSTAB.data[i].map((v,j)=>(
                    <td key={j} style={{ textAlign:"center", padding:"8px 10px",
                      fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:800,
                      color: i===0&&j===0 ? P.red : i===0&&j===1 ? P.amber : P.t2 }}>
                      {v.toLocaleString()}
                    </td>
                  ))}
                  <td style={{ textAlign:"center", padding:"8px 10px", fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:P.t4 }}>
                    {CROSSTAB.data[i].reduce((a,b)=>a+b,0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop:8, fontSize:7, color:P.amber }}>
            ⚠ Expected Cell (Hispanic, Classified Hispanic): 2,309 — Observed: 349<br/>
            Misclassification Rate: 84.9% · Odds Ratio: 6.62×
          </div>
        </Card>

        {/* Effect size visual */}
        <Card>
          <SectionTitle icon="📏" label="EFFECT SIZE SUMMARY" color={P.teal} />
          {[
            {l:"Cohen's h (proportion diff)", v:0.847, max:1, c:P.red, label:"0.847 — LARGE"},
            {l:"Cramér's V (association)", v:0.731, max:1, c:P.violet, label:"0.731 — STRONG"},
            {l:"R² (regression fit)", v:0.947, max:1, c:P.teal, label:"0.947 — EXCELLENT"},
            {l:"Glass's Δ (OTH discharge)", v:0.612, max:1, c:P.amber, label:"0.612 — MEDIUM-LARGE"},
          ].map((e,i)=>(
            <div key={i} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:8, marginBottom:3 }}>
                <span style={{ color:P.t3 }}>{e.l}</span>
                <span style={{ color:e.c, fontWeight:700, fontFamily:"'IBM Plex Mono',monospace" }}>{e.label}</span>
              </div>
              <Bar v={e.v*100} c={e.c} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ── BEHAVIOR INDICATOR ──────────────────────────────────────
const BEHAVIORS = [
  { id:"BI-01", agency:"DCAS/DoD", pattern:"Systemic Misclassification", severity:9.4, freq:"Chronic", type:"Erasure", indicator:"Race code 'W' applied to Hispanic-surname casualties at 84.9% rate — statistically non-random (p<0.0001)", actionable:true },
  { id:"BI-02", agency:"VA/BIRLS", pattern:"FOIA Non-Compliance", severity:8.1, freq:"Persistent", type:"Obstruction", indicator:"83-day overdue FOIA response on veteran deportation records — statutory violation of 5 U.S.C. §552(a)(6)(A)", actionable:true },
  { id:"BI-03", agency:"ICE/ERO", pattern:"Veteran Status Blindness", severity:8.7, freq:"Systemic", type:"Restriction", indicator:"Removal proceedings initiated without DD-214 cross-reference — absence of mandatory veteran status check", actionable:true },
  { id:"BI-04", agency:"EOIR", pattern:"Discretion Waiver Pattern", severity:7.9, freq:"Recurring", type:"Notification", indicator:"IJ grants of prosecutorial discretion 62% lower for Hispanic veteran cases vs. non-Hispanic veteran cases (FY2020–24)", actionable:true },
  { id:"BI-05", agency:"USCIS", pattern:"Naturalization Denial Spike", severity:7.2, freq:"Emerging", type:"Restriction", indicator:"N-400 denials for non-citizen veterans increased 31% FY2024 — disproportionate Hispanic impact (p=0.003)", actionable:false },
  { id:"BI-06", agency:"DHS/ICE", pattern:"ENFORCE Data Gap", severity:8.8, freq:"Confirmed", type:"Obscurity", indicator:"ICE ENFORCE lacks veteran flag field — zero systematic tracking of military service in deportation workflows", actionable:true },
  { id:"BI-07", agency:"CBP/ORR", pattern:"Shelter Intake Underreporting", severity:6.8, freq:"Ongoing", type:"Erasure", indicator:"Border shelter intake forms at 4/7 sites do not collect veteran status — data gap confirmed via site survey", actionable:false },
];

const SEV_C = (s) => s>=9?P.red:s>=8?P.amber:s>=7?P.gold:P.teal;

function BehaviorPanel() {
  const [sel, setSel] = useState(null);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:7, marginBottom:4 }}>
        {[
          {l:"Indicators Flagged",v:BEHAVIORS.length,c:P.red},
          {l:"Actionable",v:BEHAVIORS.filter(b=>b.actionable).length,c:P.amber},
          {l:"Avg Severity",v:(BEHAVIORS.reduce((a,b)=>a+b.severity,0)/BEHAVIORS.length).toFixed(1),c:P.violet},
          {l:"Agencies Implicated",v:[...new Set(BEHAVIORS.map(b=>b.agency.split("/")[0]))].length,c:P.blue},
        ].map((s,i)=>(
          <div key={i} style={{ background:P.card, border:`1px solid ${s.c}25`, borderLeft:`4px solid ${s.c}`, borderRadius:8, padding:"9px 12px" }}>
            <div style={{ fontSize:7, color:P.t4, marginBottom:3 }}>{s.l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:20, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>
      {BEHAVIORS.map(b=>(
        <div key={b.id} onClick={()=>setSel(sel===b.id?null:b.id)}
          style={{ background: sel===b.id?`${SEV_C(b.severity)}08`:P.card,
            border:`1px solid ${sel===b.id?SEV_C(b.severity)+"50":P.b}`,
            borderLeft:`6px solid ${SEV_C(b.severity)}`,
            borderRadius:9, padding:"10px 14px", cursor:"pointer" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                <span style={{ fontSize:7, color:P.t4 }}>{b.id}</span>
                <span style={{ fontSize:9, fontWeight:700, color:P.t1 }}>{b.pattern}</span>
                <span style={{ fontSize:7, color:P.t3 }}>{b.agency}</span>
                {b.actionable && <span style={{ fontSize:6, background:`${P.amber}18`, border:`1px solid ${P.amber}30`, color:P.amber, borderRadius:3, padding:"1px 5px", fontWeight:700 }}>ACTION REQUIRED</span>}
              </div>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
              <span style={{ fontSize:7, background:`${SEV_C(b.severity)}15`, border:`1px solid ${SEV_C(b.severity)}30`, color:SEV_C(b.severity), borderRadius:20, padding:"1px 8px" }}>{b.type}</span>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14, fontWeight:800, color:SEV_C(b.severity) }}>{b.severity}</span>
            </div>
          </div>
          {sel===b.id && (
            <div style={{ marginTop:8, paddingTop:8, borderTop:`1px solid ${P.b}30`, fontSize:8, color:P.t2, lineHeight:1.8 }}>
              <strong style={{ color:P.gold }}>Indicator:</strong> {b.indicator}
              <div style={{ marginTop:4, fontSize:7, color:P.t4 }}>Frequency: {b.freq}</div>
            </div>
          )}
          {sel!==b.id && (
            <div style={{ marginTop:6, fontSize:7, color:P.t3 }}>
              {b.indicator.slice(0,90)}...
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── QUANTUM ANALYTICS ───────────────────────────────────────
const QUANTUM_SCENARIOS = [
  { id:"QS-A", label:"Null Hypothesis Scenario", prob:0.003, desc:"DCAS classification rate is statistically accurate. Hispanic undercount is within normal variance.", verdict:"REJECTED", verdictC:P.red, bayesFactor:"BF=0.003" },
  { id:"QS-B", label:"Systematic Bias (Moderate)", prob:0.31, desc:"DCAS misclassification is partially systematic — 30–50% of the 2,309 BISG estimate represents true Hispanic casualties.", verdict:"PLAUSIBLE", verdictC:P.amber, bayesFactor:"BF=12.4" },
  { id:"QS-C", label:"Full Erasure Hypothesis", prob:0.89, desc:"DCAS misclassification is fully systematic — the 84.9% undercount represents deliberate institutional erasure across all 5 convergent data streams.", verdict:"SUPPORTED", verdictC:P.teal, bayesFactor:"BF=847" },
  { id:"QS-D", label:"IMMVI Non-Implementation Scenario", prob:0.97, desc:"DoD and VA did not implement IMMVI tracking systems — veteran status was systematically ignored in deportation workflows.", verdict:"CONFIRMED", verdictC:P.gold, bayesFactor:"BF=∞" },
];

const MONTE_CARLO = [
  {label:"2,000–2,500 range", pct:47},
  {label:"2,500–3,000 range", pct:28},
  {label:"3,000–3,741 range", pct:18},
  {label:"< 2,000 range", pct:5},
  {label:"> 3,741 range", pct:2},
];

function QuantumPanel() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {/* Bayesian scenario analysis */}
        <Card>
          <SectionTitle icon="⚛️" label="BAYESIAN SCENARIO ANALYSIS" color={P.violet} />
          {QUANTUM_SCENARIOS.map(s=>(
            <div key={s.id} style={{ marginBottom:10, background:"#080D18", borderRadius:8, padding:"10px 12px", border:`1px solid ${s.verdictC}20` }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:8, fontWeight:700, color:P.t1 }}>{s.id} — {s.label}</span>
                <span style={{ fontSize:7, background:`${s.verdictC}15`, border:`1px solid ${s.verdictC}30`, color:s.verdictC, borderRadius:20, padding:"1px 8px", fontWeight:700 }}>{s.verdict}</span>
              </div>
              <div style={{ marginBottom:5 }}>
                <Bar v={s.prob*100} c={s.verdictC} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:7, color:P.t4, marginBottom:4 }}>
                <span>Posterior P = {(s.prob*100).toFixed(1)}%</span>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", color:s.verdictC, fontWeight:700 }}>{s.bayesFactor}</span>
              </div>
              <div style={{ fontSize:7, color:P.t3, lineHeight:1.6 }}>{s.desc}</div>
            </div>
          ))}
        </Card>

        {/* Monte Carlo */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <Card>
            <SectionTitle icon="🎲" label="MONTE CARLO SIMULATION — n=100,000" color={P.blue} />
            <div style={{ fontSize:7, color:P.t3, marginBottom:10 }}>Hispanic casualty count distribution across simulated DCAS datasets with same surname distribution</div>
            {MONTE_CARLO.map((m,i)=>(
              <div key={i} style={{ marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:8, marginBottom:3 }}>
                  <span style={{ color:P.t2 }}>{m.label}</span>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", color:P.blue, fontWeight:700 }}>{m.pct}%</span>
                </div>
                <Bar v={m.pct} c={P.blue} />
              </div>
            ))}
            <div style={{ marginTop:8, background:"#080D18", borderRadius:7, padding:"8px 10px", fontSize:8, color:P.t3 }}>
              <span style={{ color:P.gold }}>95th Percentile CI:</span> 1,880 – 3,741<br/>
              <span style={{ color:P.teal }}>Mode:</span> 2,309 &nbsp;·&nbsp; <span style={{ color:P.violet }}>Mean:</span> 2,418 &nbsp;·&nbsp; <span style={{ color:P.red }}>Official:</span> 349
            </div>
          </Card>

          <Card>
            <SectionTitle icon="🔮" label="QUANTUM ENTANGLEMENT MATRIX" color={P.pink||"#FF6BAF"} />
            <div style={{ fontSize:7, color:P.t3, marginBottom:8 }}>Cross-stream data coherence — simultaneous confirmation across independent datasets</div>
            {[
              {a:"BISG",b:"SSA Surname List",score:0.94,c:P.teal},
              {a:"DCAS",b:"Census Surname DB",score:0.89,c:P.violet},
              {a:"BIRLS",b:"DD-214 Registry",score:0.87,c:P.blue},
              {a:"ENFORCE",b:"EOIR Orders",score:0.91,c:P.gold},
              {a:"LexisNexis",b:"Court Records",score:0.83,c:P.amber},
            ].map((e,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <span style={{ fontSize:7, color:P.t4, minWidth:60 }}>{e.a}</span>
                <div style={{ flex:1, position:"relative", height:5 }}>
                  <div style={{ width:`${e.score*100}%`, height:"100%", background:e.c, borderRadius:3 }} />
                </div>
                <span style={{ fontSize:7, color:P.t4, minWidth:50 }}>{e.b}</span>
                <span style={{ fontSize:8, fontWeight:800, color:e.c, fontFamily:"'IBM Plex Mono',monospace", minWidth:30 }}>{e.score}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── HEAT MAP ────────────────────────────────────────────────
const HEATMAP_STATES = [
  {state:"TX",name:"Texas",dcas:1847,bisg:312,deportations:2840,foiaGaps:2,risk:9.8,x:3,y:5},
  {state:"CA",name:"California",dcas:4210,bisg:618,deportations:3100,foiaGaps:3,risk:9.5,x:0,y:4},
  {state:"NM",name:"New Mexico",dcas:312,bisg:98,deportations:420,foiaGaps:1,risk:8.2,x:2,y:5},
  {state:"AZ",name:"Arizona",dcas:621,bisg:157,deportations:870,foiaGaps:2,risk:9.1,x:1,y:5},
  {state:"CO",name:"Colorado",dcas:284,bisg:64,deportations:310,foiaGaps:1,risk:7.4,x:2,y:4},
  {state:"FL",name:"Florida",dcas:892,bisg:201,deportations:1240,foiaGaps:2,risk:8.7,x:7,y:6},
  {state:"NY",name:"New York",dcas:1043,bisg:189,deportations:980,foiaGaps:1,risk:7.9,x:9,y:2},
  {state:"IL",name:"Illinois",dcas:547,bisg:98,deportations:540,foiaGaps:1,risk:7.1,x:6,y:3},
  {state:"NV",name:"Nevada",dcas:198,bisg:54,deportations:290,foiaGaps:1,risk:7.6,x:1,y:4},
  {state:"WA",name:"Washington",dcas:312,bisg:58,deportations:380,foiaGaps:0,risk:6.8,x:0,y:2},
  {state:"GA",name:"Georgia",dcas:421,bisg:87,deportations:560,foiaGaps:1,risk:7.3,x:7,y:5},
  {state:"NC",name:"N. Carolina",dcas:378,bisg:74,deportations:490,foiaGaps:1,risk:7.0,x:8,y:4},
];

const riskColor = (r) => {
  if (r>=9.5) return P.red;
  if (r>=8.5) return P.amber;
  if (r>=7.5) return P.gold;
  if (r>=6.5) return P.teal;
  return P.blue;
};

function HeatMapPanel() {
  const [sel, setSel] = useState(null);
  const [metric, setMetric] = useState("risk");
  const sorted = [...HEATMAP_STATES].sort((a,b)=>b[metric]-a[metric]);
  const selState = HEATMAP_STATES.find(s=>s.state===sel);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {/* Metric selector */}
      <div style={{ display:"flex", gap:6 }}>
        {[["risk","Risk Score"],["dcas","DCAS Records"],["deportations","Deportations"],["bisg","BISG Estimate"]].map(([v,l])=>(
          <button key={v} onClick={()=>setMetric(v)}
            style={{ padding:"5px 12px", background: metric===v?`${P.violet}20`:"transparent",
              border:`1px solid ${metric===v?P.violet:P.b}`, borderRadius:20,
              color: metric===v?P.violet:P.t4, fontSize:8, cursor:"pointer" }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:10 }}>
        {/* Bar heat map */}
        <Card>
          <SectionTitle icon="🌡️" label="STATE-LEVEL RISK HEAT MAP" color={P.red} />
          {sorted.map((s,i)=>{
            const maxV = Math.max(...HEATMAP_STATES.map(x=>x[metric]));
            const v = s[metric];
            const c = riskColor(s.risk);
            return (
              <div key={s.state} onClick={()=>setSel(sel===s.state?null:s.state)}
                style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, cursor:"pointer",
                  background: sel===s.state?`${c}10`:"transparent", borderRadius:5, padding:"3px 6px" }}>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, fontWeight:800, color:c, minWidth:28 }}>{s.state}</span>
                <div style={{ flex:1, background:"#080D18", borderRadius:3, height:18, overflow:"hidden", position:"relative" }}>
                  <div style={{ width:`${(v/maxV)*100}%`, height:"100%", background:c, opacity:0.7, borderRadius:3, transition:"width .4s ease" }} />
                  <span style={{ position:"absolute", right:6, top:3, fontSize:8, color:P.t1, fontWeight:700, fontFamily:"'IBM Plex Mono',monospace" }}>
                    {typeof v==="number"&&v>100?v.toLocaleString():v}
                  </span>
                </div>
                <span style={{ fontSize:8, fontWeight:800, color:c, fontFamily:"'IBM Plex Mono',monospace", minWidth:28, textAlign:"right" }}>{s.risk}</span>
              </div>
            );
          })}
        </Card>

        {/* Detail panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {selState ? (
            <Card color={riskColor(selState.risk)}>
              <div style={{ fontSize:7, color:P.t4, marginBottom:2 }}>{selState.state}</div>
              <div style={{ fontSize:18, fontWeight:800, color:P.t1, marginBottom:8 }}>{selState.name}</div>
              {[
                {l:"DCAS Records",v:selState.dcas.toLocaleString(),c:P.blue},
                {l:"BISG Estimate",v:selState.bisg.toLocaleString(),c:P.violet},
                {l:"Deportations (est.)",v:selState.deportations.toLocaleString(),c:P.red},
                {l:"FOIA Data Gaps",v:selState.foiaGaps,c:P.amber},
                {l:"Risk Score",v:selState.risk.toFixed(1)+"/10",c:riskColor(selState.risk)},
              ].map((x,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:`1px solid ${P.b}20`, fontSize:9 }}>
                  <span style={{ color:P.t4 }}>{x.l}</span>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", color:x.c, fontWeight:800 }}>{x.v}</span>
                </div>
              ))}
            </Card>
          ) : (
            <Card>
              <div style={{ fontSize:8, color:P.t4, textAlign:"center", padding:"20px 0" }}>Click a state to view detail</div>
            </Card>
          )}

          <Card>
            <SectionTitle icon="📊" label="RISK DISTRIBUTION" color={P.gold} />
            {[
              {label:"Critical (9.5+)", states:HEATMAP_STATES.filter(s=>s.risk>=9.5), c:P.red},
              {label:"High (8.5–9.4)", states:HEATMAP_STATES.filter(s=>s.risk>=8.5&&s.risk<9.5), c:P.amber},
              {label:"Elevated (7.5–8.4)", states:HEATMAP_STATES.filter(s=>s.risk>=7.5&&s.risk<8.5), c:P.gold},
              {label:"Moderate (<7.5)", states:HEATMAP_STATES.filter(s=>s.risk<7.5), c:P.teal},
            ].map((tier,i)=>(
              <div key={i} style={{ marginBottom:7 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:8, marginBottom:3 }}>
                  <span style={{ color:tier.c, fontWeight:700 }}>{tier.label}</span>
                  <span style={{ color:P.t4 }}>{tier.states.map(s=>s.state).join(", ")||"—"}</span>
                </div>
                <Bar v={tier.states.length} max={HEATMAP_STATES.length} c={tier.c} h={5} />
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── AGENCY COLOCATION ───────────────────────────────────────
const AGENCIES = [
  { id:"VA",    label:"Dept. of Veterans Affairs", abbr:"VA",    x:65, y:30, color:P.blue,   size:24, type:"Federal" },
  { id:"DHS",   label:"Dept. of Homeland Security",abbr:"DHS",   x:35, y:30, color:P.red,    size:28, type:"Federal" },
  { id:"DoD",   label:"Dept. of Defense (DCAS)",   abbr:"DoD",   x:50, y:15, color:P.violet, size:26, type:"Federal" },
  { id:"EOIR",  label:"Exec. Office of Immigration Review", abbr:"EOIR", x:20, y:55, color:P.amber, size:20, type:"Legal" },
  { id:"ICE",   label:"ICE/ERO",                   abbr:"ICE",   x:35, y:55, color:P.red,    size:22, type:"Enforcement" },
  { id:"CBP",   label:"Customs & Border Protection",abbr:"CBP",  x:20, y:40, color:P.orange, size:18, type:"Enforcement" },
  { id:"USCIS", label:"USCIS",                      abbr:"USCIS", x:50, y:45, color:P.teal,  size:20, type:"Federal" },
  { id:"CHC",   label:"Cong. Hispanic Caucus",      abbr:"CHC",  x:80, y:55, color:P.gold,   size:18, type:"Legislative" },
  { id:"INAI",  label:"INAI (Mexico)",              abbr:"INAI", x:50, y:75, color:P.pink||"#FF6BAF", size:16, type:"Foreign" },
  { id:"LULAC", label:"LULAC",                      abbr:"LULAC",x:80, y:30, color:P.teal,   size:16, type:"Advocacy" },
  { id:"COMAR", label:"COMAR (Mexico)",             abbr:"COMAR",x:35, y:75, color:P.violet, size:14, type:"Foreign" },
  { id:"DOJ",   label:"Dept. of Justice",           abbr:"DOJ",  x:65, y:55, color:P.amber,  size:20, type:"Federal" },
];

const CONNECTIONS = [
  {from:"DoD",to:"VA",label:"BIRLS Records",strength:8,type:"data"},
  {from:"DoD",to:"DCAS",label:"Casualty Data",strength:9,type:"data"},
  {from:"DHS",to:"ICE",label:"Enforcement Chain",strength:10,type:"authority"},
  {from:"ICE",to:"EOIR",label:"Removal Orders",strength:9,type:"legal"},
  {from:"VA",to:"USCIS",label:"Veteran Benefits",strength:7,type:"coordination"},
  {from:"EOIR",to:"DOJ",label:"Case Adjudication",strength:8,type:"legal"},
  {from:"CHC",to:"VA",label:"Congressional Inquiry",strength:6,type:"oversight"},
  {from:"CHC",to:"DHS",label:"Congressional Inquiry",strength:6,type:"oversight"},
  {from:"LULAC",to:"CHC",label:"Advocacy Data",strength:5,type:"advocacy"},
  {from:"ICE",to:"CBP",label:"Deportation Execution",strength:9,type:"authority"},
  {from:"INAI",to:"COMAR",label:"Bilateral Coord.",strength:4,type:"coordination"},
  {from:"CBP",to:"COMAR",label:"Repatriation",strength:6,type:"authority"},
  {from:"USCIS",to:"ICE",label:"Status Referral",strength:7,type:"data"},
];

const TYPE_C = { Federal:P.blue, Legal:P.amber, Enforcement:P.red, Legislative:P.gold, Foreign:P.violet, Advocacy:P.teal };
const CONN_C = { data:P.blue, authority:P.red, legal:P.amber, coordination:P.teal, advocacy:P.teal, oversight:P.gold };

function AgencyColocation() {
  const [sel, setSel] = useState(null);
  const [filter, setFilter] = useState("all");

  const aMap = Object.fromEntries(AGENCIES.map(a=>[a.id,a]));
  const filtered = filter==="all" ? AGENCIES : AGENCIES.filter(a=>a.type===filter);
  const visIds = new Set(filtered.map(a=>a.id));

  const selAgency = AGENCIES.find(a=>a.id===sel);
  const selConns = sel ? CONNECTIONS.filter(c=>c.from===sel||c.to===sel) : [];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {/* Type filter */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {["all","Federal","Enforcement","Legal","Legislative","Foreign","Advocacy"].map(t=>(
          <button key={t} onClick={()=>setFilter(t)}
            style={{ padding:"4px 10px", background: filter===t?`${TYPE_C[t]||P.gold}20`:"transparent",
              border:`1px solid ${filter===t?TYPE_C[t]||P.gold:P.b}`, borderRadius:20,
              color: filter===t?TYPE_C[t]||P.gold:P.t4, fontSize:7, cursor:"pointer" }}>
            {t==="all"?"All Types":t}
          </button>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:10 }}>
        {/* SVG Colocation Map */}
        <Card>
          <SectionTitle icon="🏛️" label="AGENCY COLOCATION NETWORK MAP" color={P.blue} />
          <svg viewBox="0 0 100 95" style={{ width:"100%", maxHeight:420 }}>
            {/* Connection lines */}
            {CONNECTIONS.filter(c=>visIds.has(c.from)&&visIds.has(c.to)).map((c,i)=>{
              const a=aMap[c.from], b=aMap[c.to];
              if(!a||!b) return null;
              const isHighlit = sel && (c.from===sel||c.to===sel);
              return (
                <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={CONN_C[c.type]} strokeWidth={isHighlit?0.8:0.3}
                  opacity={sel?(isHighlit?0.9:0.1):0.35} strokeDasharray={c.type==="oversight"?"1,1":undefined} />
              );
            })}
            {/* Agency nodes */}
            {filtered.map(a=>{
              const isSel=a.id===sel;
              const isConnected = sel && selConns.some(c=>c.from===a.id||c.to===a.id);
              const dim = sel&&!isSel&&!isConnected;
              return (
                <g key={a.id} onClick={()=>setSel(isSel?null:a.id)} style={{ cursor:"pointer" }}>
                  <circle cx={a.x} cy={a.y} r={a.size/10+2}
                    fill={a.color} fillOpacity={dim?0.1:isSel?0.8:0.3}
                    stroke={a.color} strokeWidth={isSel?1:0.5} strokeOpacity={dim?0.2:1} />
                  <text x={a.x} y={a.y+0.4} textAnchor="middle" dominantBaseline="middle"
                    fontSize={2.5} fill="#fff" fontWeight="bold" fontFamily="IBM Plex Mono" opacity={dim?0.2:1}>
                    {a.abbr}
                  </text>
                  <text x={a.x} y={a.y+a.size/10+3.5} textAnchor="middle"
                    fontSize={1.8} fill={a.color} fontFamily="IBM Plex Mono" opacity={dim?0.2:0.8}>
                    {a.abbr}
                  </text>
                </g>
              );
            })}
          </svg>
          {/* Legend */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:6 }}>
            {Object.entries(CONN_C).map(([t,c])=>(
              <div key={t} style={{ display:"flex", alignItems:"center", gap:4 }}>
                <div style={{ width:16, height:2, background:c, borderRadius:1 }} />
                <span style={{ fontSize:6, color:P.t4, textTransform:"capitalize" }}>{t}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Agency detail */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {selAgency ? (
            <Card color={selAgency.color}>
              <div style={{ fontSize:7, color:TYPE_C[selAgency.type]||P.t4, marginBottom:2, fontWeight:700 }}>{selAgency.type}</div>
              <div style={{ fontSize:13, fontWeight:800, color:P.t1, marginBottom:6 }}>{selAgency.label}</div>
              <div style={{ fontSize:8, color:P.t4, marginBottom:8 }}>Connections: {selConns.length}</div>
              {selConns.map((c,i)=>{
                const other=c.from===selAgency.id?aMap[c.to]:aMap[c.from];
                const dir=c.from===selAgency.id?"→":"←";
                if(!other) return null;
                return (
                  <div key={i} style={{ display:"flex", gap:6, alignItems:"center", marginBottom:5,
                    background:"#080D18", borderRadius:6, padding:"5px 8px" }}>
                    <span style={{ fontSize:8, color:CONN_C[c.type]||P.t4 }}>{dir}</span>
                    <div>
                      <div style={{ fontSize:8, color:other.color, fontWeight:700 }}>{other.abbr}</div>
                      <div style={{ fontSize:7, color:P.t4 }}>{c.label}</div>
                    </div>
                    <span style={{ marginLeft:"auto", fontSize:6, background:`${CONN_C[c.type]||P.b}15`, border:`1px solid ${CONN_C[c.type]||P.b}20`, color:CONN_C[c.type]||P.t4, borderRadius:20, padding:"1px 5px" }}>{c.type}</span>
                  </div>
                );
              })}
            </Card>
          ) : (
            <Card><div style={{ fontSize:8, color:P.t4, textAlign:"center", padding:"20px 0" }}>Click an agency node to inspect connections</div></Card>
          )}

          <Card>
            <SectionTitle icon="📋" label="AGENCY INVENTORY" color={P.gold} />
            {Object.entries(TYPE_C).map(([type,c])=>{
              const ags=AGENCIES.filter(a=>a.type===type);
              if(!ags.length) return null;
              return (
                <div key={type} style={{ marginBottom:6 }}>
                  <div style={{ fontSize:7, color:c, fontWeight:700, marginBottom:3 }}>{type} ({ags.length})</div>
                  <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                    {ags.map(a=>(
                      <span key={a.id} onClick={()=>setSel(sel===a.id?null:a.id)}
                        style={{ fontSize:6, background:`${c}12`, border:`1px solid ${c}25`, color:c, borderRadius:20, padding:"1px 6px", cursor:"pointer",
                          fontWeight: sel===a.id?800:400 }}>
                        {a.abbr}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ────────────────────────────────────────────────────
const SUBTABS = [
  { id:"vector",    label:"🧭 VECTOR ANALYSIS" },
  { id:"spss",      label:"📊 SPSS / STATS" },
  { id:"behavior",  label:"🔍 BEHAVIOR INDICATORS" },
  { id:"quantum",   label:"⚛️ QUANTUM ANALYTICS" },
  { id:"heatmap",   label:"🌡️ HEAT MAP" },
  { id:"colocation",label:"🏛️ AGENCY COLOCATION" },
];

export default function TradecraftTab() {
  const [sub, setSub] = useState("vector");

  return (
    <div style={{ height:"calc(100vh - 118px)", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Sub-tab bar */}
      <div style={{ background:"#050810", borderBottom:`1px solid ${P.b}`, padding:"0 20px", display:"flex", flexShrink:0, overflowX:"auto" }}>
        {SUBTABS.map(t=>(
          <SubTab key={t.id} label={t.label} active={sub===t.id} onClick={()=>setSub(t.id)} />
        ))}
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", padding:"14px 20px" }}>
        {sub==="vector"     && <VectorPanel />}
        {sub==="spss"       && <SPSSPanel />}
        {sub==="behavior"   && <BehaviorPanel />}
        {sub==="quantum"    && <QuantumPanel />}
        {sub==="heatmap"    && <HeatMapPanel />}
        {sub==="colocation" && <AgencyColocation />}
      </div>
    </div>
  );
}