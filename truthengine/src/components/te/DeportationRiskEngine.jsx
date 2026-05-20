import { useState, useEffect } from "react";
import { P, CASES } from "../../lib/teData";
import { base44 } from "../../api/base44Client";
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
         XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

// ── RISK MODEL ────────────────────────────────────────────────────────────────
// Weighted multi-factor deportation risk scoring model
// Each factor: weight (sum to 1.0), value (0–100), direction (higher = more/less risk)

const RISK_FACTORS = [
  { id:"iirira",    label:"IIRIRA Retroactive Exposure",  weight:0.22, base:85, desc:"Pre-1996 offense in record — retroactive criminalization" },
  { id:"foia_gap",  label:"FOIA Data Gap",                weight:0.15, base:78, desc:"Missing VA/ICE records prevent defense documentation" },
  { id:"service",   label:"Service Documentation",        weight:0.18, base:60, desc:"DD-214 availability — inversely drives risk" },
  { id:"criminal",  label:"Criminal History",             weight:0.20, base:45, desc:"Any post-service conviction under INA §237" },
  { id:"ice_order", label:"Active ICE Order",             weight:0.15, base:55, desc:"Pending or active removal proceedings" },
  { id:"shelter",   label:"Border Shelter Proximity",     weight:0.05, base:70, desc:"Located at or near Mexico border shelter" },
  { id:"counsel",   label:"Legal Counsel Access",         weight:0.05, base:40, desc:"Pro bono/paid attorney engaged — inversely drives risk" },
];

// Simulated veteran population risk distribution
const POPULATION_BINS = [
  { range:"0–10",  count:2100, label:"Minimal" },
  { range:"10–20", count:8400, label:"Low" },
  { range:"20–35", count:22000, label:"Low-Mod" },
  { range:"35–50", count:31500, label:"Moderate" },
  { range:"50–65", count:27000, label:"High" },
  { range:"65–80", count:16800, label:"Very High" },
  { range:"80–100",count:7200,  label:"Critical" },
];

const MONTHLY_TREND = [
  { month:"Oct 25", deported:820,  atRisk:113000 },
  { month:"Nov 25", deported:1240, atRisk:113500 },
  { month:"Dec 25", deported:1650, atRisk:114200 },
  { month:"Jan 26", deported:2100, atRisk:114800 },
  { month:"Feb 26", deported:1980, atRisk:115000 },
  { month:"Mar 26", deported:2230, atRisk:115200 },
  { month:"Apr 26", deported:1980, atRisk:115000 },
];

const CASE_RISK = [
  { id:"C001", name:"Ramos",       risk:18, tier:"Gold",   conf:96, status:"In US",   color:P.teal },
  { id:"C002", name:"Valenzuela M",risk:71, tier:"Gold",   conf:89, status:"Deported",color:P.amber },
  { id:"C003", name:"Valenzuela V",risk:68, tier:"Silver", conf:87, status:"Deported",color:P.amber },
  { id:"C004", name:"Park",        risk:94, tier:"Gold",   conf:94, status:"Deported",color:P.red },
  { id:"C005", name:"Segura",      risk:62, tier:"Silver", conf:78, status:"Deported",color:P.amber },
  { id:"C006", name:"Duran",       risk:57, tier:"Bronze", conf:72, status:"Deported",color:P.blue },
];

const RISK_C = (r) => r >= 80 ? P.red : r >= 60 ? P.amber : r >= 40 ? P.blue : P.teal;
const RISK_L = (r) => r >= 80 ? "CRITICAL" : r >= 60 ? "HIGH" : r >= 40 ? "MODERATE" : "LOW";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#0D1520", border:`1px solid ${P.b}`, borderRadius:7, padding:"8px 12px" }}>
      <div style={{ fontSize:8, color:P.t4, marginBottom:3 }}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{ fontSize:9, color:p.color||P.t2, fontWeight:700 }}>{p.name}: {typeof p.value==="number"?p.value.toLocaleString():p.value}</div>
      ))}
    </div>
  );
};

export default function DeportationRiskEngine() {
  const [factors, setFactors] = useState(CASE_RISK.map(c => ({
    caseId: c.id,
    factors: RISK_FACTORS.reduce((acc, f) => ({ ...acc, [f.id]: f.base }), {}),
  })));
  const [selectedCase, setSelectedCase] = useState("C004");
  const [customFactors, setCustomFactors] = useState(
    RISK_FACTORS.reduce((acc, f) => ({ ...acc, [f.id]: f.base }), {})
  );
  const [aiForecast, setAiForecast] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [reconResult, setReconResult] = useState(null);
  const [reconLoading, setReconLoading] = useState(false);
  const [chcExporting, setChcExporting] = useState(false);
  const [chcResult, setChcResult] = useState(null);
  const [view, setView] = useState("risk"); // risk | population | trend | recon

  // Compute weighted risk score from custom factors
  const computeRisk = (factorValues) => {
    return Math.round(
      RISK_FACTORS.reduce((sum, f) => {
        const raw = factorValues[f.id] || 0;
        // Invert "protection" factors
        const val = (f.id === "service" || f.id === "counsel") ? (100 - raw) : raw;
        return sum + (val * f.weight);
      }, 0)
    );
  };

  const customRisk = computeRisk(customFactors);
  const selCase = CASE_RISK.find(c => c.id === selectedCase);

  const runAIForecast = async () => {
    setAiLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a deportation risk analyst for the AUMER Foundation. Generate a 90-day predictive risk forecast.

CURRENT DATA (April 9, 2026):
- 115,000 non-citizen veterans at risk in the US
- 10,000+ deported Jan–Jun 2025 (Rep. Ansari letter)
- Monthly deportation trend: escalating (Oct 25: 820/mo → Mar 26: 2,230/mo)
- CHC Briefing: May 18, 2026 (39 days)
- Active IIRIRA enforcement: accelerating
- Case C004 (Sae Joon Park): self-deported Nov/Dec 2025 under ICE pressure
- 2 critical FOIA blockers (VA: 83d, ICE: 66d overdue)
- Custom Risk Assessment: ${customRisk}/100 (factors: ${JSON.stringify(customFactors)})

Provide a structured 90-day risk forecast (under 200 words):
1. Estimated deportations of veterans (April–July 2026) with specific numbers
2. Top 3 risk escalation triggers to watch
3. CHC briefing impact — will May 18 create a protective effect?
4. Recommended AUMER immediate intervention (most impactful single action)
5. Risk trajectory: INCREASING / STABLE / DECREASING with confidence %

Be specific, use numbers, reference IIRIRA and the active enforcement climate.`,
      model: "claude_sonnet_4_6",
    });
    setAiForecast(res);
    setAiLoading(false);
  };

  const runReconciliation = async () => {
    setReconLoading(true);
    try {
      const res = await base44.functions.invoke("dcasReconciliation", {});
      setReconResult(res.data);
    } catch (e) {
      setReconResult({ error: e.message });
    }
    setReconLoading(false);
  };

  const runCHCExport = async (sendEmail = false) => {
    setChcExporting(true);
    try {
      const res = await base44.functions.invoke("chcBriefingExport", { sendEmail, recipient: "gtarce@usc.edu" });
      setChcResult(res.data);
      if (res.data?.textBrief) {
        const blob = new Blob([res.data.textBrief], { type:"text/plain" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `CHC_Briefing_Package_${new Date().toISOString().slice(0,10)}.txt`;
        a.click();
      }
    } catch (e) {
      setChcResult({ error: e.message });
    }
    setChcExporting(false);
  };

  const totalAtRisk = POPULATION_BINS.reduce((a,b)=>a+b.count,0);

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", gap:10, justifyContent:"space-between", flexWrap:"wrap", marginBottom:10 }}>
        <div>
          <div style={{ fontSize:12, fontWeight:800, color:P.t1 }}>
            ⚡ Predictive Deportation <span style={{ color:P.red }}>Risk Engine</span>
          </div>
          <div style={{ fontSize:7, color:P.t4, letterSpacing:2 }}>
            MULTI-FACTOR SCORING · ML FORECAST · DCAS RECONCILIATION · CHC EXPORT
          </div>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          <button onClick={runReconciliation} disabled={reconLoading}
            style={{ padding:"7px 14px", fontSize:8, fontWeight:800, cursor:reconLoading?"not-allowed":"pointer",
              background:reconLoading?P.b:`${P.blue}18`, border:`1px solid ${P.blue}30`,
              color:reconLoading?P.t4:P.blue, borderRadius:8 }}>
            {reconLoading?"⟳ Reconciling...":"🔁 Run DCAS Reconciliation"}
          </button>
          <button onClick={()=>runCHCExport(false)} disabled={chcExporting}
            style={{ padding:"7px 14px", fontSize:8, fontWeight:800, cursor:chcExporting?"not-allowed":"pointer",
              background:chcExporting?P.b:`${P.gold}18`, border:`1px solid ${P.gold}30`,
              color:chcExporting?P.t4:P.gold, borderRadius:8 }}>
            {chcExporting?"⟳ Exporting...":"↓ CHC Data Export"}
          </button>
          <button onClick={()=>runCHCExport(true)} disabled={chcExporting}
            style={{ padding:"7px 14px", fontSize:8, fontWeight:800, cursor:"pointer",
              background:`${P.amber}12`, border:`1px solid ${P.amber}30`, color:P.amber, borderRadius:8 }}>
            📧 Email CHC Package
          </button>
        </div>
      </div>

      {/* Stat strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))", gap:7, marginBottom:10 }}>
        {[
          { l:"At-Risk Veterans",  v:"115,000", c:P.red },
          { l:"Deported (2025+)",  v:"10,000+", c:P.red },
          { l:"Monthly Rate (Mar)","v":"2,230",  c:P.amber },
          { l:"Critical Risk (80+)","v":"7,200", c:P.red },
          { l:"LULAC Tracking",    v:"400+",     c:P.violet },
          { l:"CHC in Days",       v:"39",        c:P.gold },
        ].map((s,i)=>(
          <div key={i} style={{ background:P.card, border:`1px solid ${s.c}25`, borderLeft:`3px solid ${s.c}`, borderRadius:7, padding:"7px 10px" }}>
            <div style={{ fontSize:6, color:P.t4, marginBottom:1 }}>{s.l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:16, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* View tabs */}
      <div style={{ display:"flex", gap:0, marginBottom:10, background:P.card, border:`1px solid ${P.b}`, borderRadius:8, overflow:"hidden", width:"fit-content" }}>
        {[["risk","⚡ Risk Scorer"],["population","📊 Population"],["trend","📈 Trend"],["recon","🔁 Reconciliation"]].map(([v,l])=>(
          <button key={v} onClick={()=>setView(v)}
            style={{ padding:"7px 16px", background:view===v?`${P.gold}15`:"transparent",
              border:"none", borderRight:`1px solid ${P.b}`,
              color:view===v?P.gold:P.t4, fontSize:9, fontWeight:view===v?700:400,
              cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace" }}>
            {l}
          </button>
        ))}
      </div>

      {/* ── RISK SCORER ── */}
      {view === "risk" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {/* Left: Case risk matrix */}
          <div>
            <div style={{ fontSize:8, color:P.t4, letterSpacing:2, marginBottom:8 }}>CASE RISK MATRIX</div>
            {CASE_RISK.map(c=>(
              <div key={c.id} onClick={()=>setSelectedCase(c.id)}
                style={{ background:selectedCase===c.id?`${RISK_C(c.risk)}10`:P.card,
                  border:`1px solid ${selectedCase===c.id?RISK_C(c.risk)+"40":P.b+"40"}`,
                  borderLeft:`5px solid ${RISK_C(c.risk)}`,
                  borderRadius:8, padding:"9px 12px", marginBottom:6, cursor:"pointer" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                  <div>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:P.t4 }}>{c.id} · </span>
                    <span style={{ fontSize:9, fontWeight:800, color:RISK_C(c.risk) }}>{c.name}</span>
                    <span style={{ fontSize:7, color:P.t4, marginLeft:6 }}>{c.status}</span>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:16, fontWeight:800, color:RISK_C(c.risk), lineHeight:1 }}>{c.risk}</div>
                    <div style={{ fontSize:6, background:`${RISK_C(c.risk)}15`, border:`1px solid ${RISK_C(c.risk)}20`, color:RISK_C(c.risk), borderRadius:20, padding:"1px 6px" }}>{RISK_L(c.risk)}</div>
                  </div>
                </div>
                {/* Risk bar */}
                <div style={{ background:"#030508", borderRadius:3, height:6, overflow:"hidden" }}>
                  <div style={{ width:`${c.risk}%`, height:"100%", background:RISK_C(c.risk),
                    borderRadius:3, boxShadow:`0 0 8px ${RISK_C(c.risk)}60` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Right: Custom factor scorer */}
          <div>
            <div style={{ fontSize:8, color:P.t4, letterSpacing:2, marginBottom:8 }}>CUSTOM RISK ASSESSMENT</div>
            <div style={{ background:P.card, border:`2px solid ${RISK_C(customRisk)}40`, borderRadius:12, padding:"14px 16px", marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div style={{ fontSize:10, fontWeight:800, color:P.t1 }}>Risk Score</div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:28, fontWeight:800, color:RISK_C(customRisk), lineHeight:1 }}>{customRisk}</div>
                  <div style={{ fontSize:8, background:`${RISK_C(customRisk)}15`, border:`1px solid ${RISK_C(customRisk)}20`, color:RISK_C(customRisk), borderRadius:20, padding:"1px 8px", fontWeight:700 }}>{RISK_L(customRisk)}</div>
                </div>
              </div>
              {/* Risk bar */}
              <div style={{ background:"#030508", borderRadius:4, height:10, overflow:"hidden", marginBottom:14 }}>
                <div style={{ width:`${customRisk}%`, height:"100%", background:`linear-gradient(90deg,${P.teal},${P.amber},${P.red})`,
                  borderRadius:4, transition:"width .3s" }} />
              </div>
              {/* Factor sliders */}
              {RISK_FACTORS.map(f => (
                <div key={f.id} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                    <span style={{ fontSize:7, color:P.t2 }}>{f.label}</span>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, fontWeight:700, color:RISK_C(customFactors[f.id]) }}>{customFactors[f.id]}</span>
                  </div>
                  <input type="range" min={0} max={100} value={customFactors[f.id]}
                    onChange={e => setCustomFactors(p => ({ ...p, [f.id]: +e.target.value }))}
                    style={{ width:"100%", accentColor:RISK_C(customFactors[f.id]), cursor:"pointer" }} />
                  <div style={{ fontSize:6, color:P.t4 }}>{f.desc} (weight: {(f.weight*100).toFixed(0)}%)</div>
                </div>
              ))}
              <button onClick={()=>setCustomFactors(RISK_FACTORS.reduce((acc,f)=>({...acc,[f.id]:f.base}),{}))}
                style={{ width:"100%", padding:"5px", background:"transparent", border:`1px solid ${P.b}`,
                  color:P.t4, borderRadius:6, fontSize:7, cursor:"pointer", marginTop:4 }}>
                ⟳ Reset to Baseline
              </button>
            </div>

            {/* AI forecast */}
            <button onClick={runAIForecast} disabled={aiLoading}
              style={{ width:"100%", padding:"9px", background:aiLoading?P.b:`linear-gradient(135deg,${P.red},${P.amber})`,
                color:aiLoading?P.t4:"#000", border:"none", borderRadius:8, fontSize:10, fontWeight:800,
                cursor:aiLoading?"not-allowed":"pointer", marginBottom:8 }}>
              {aiLoading?"⟳ Forecasting...":"🤖 AI 90-Day Risk Forecast"}
            </button>
            {aiForecast && (
              <div style={{ background:P.card, border:`1px solid ${P.red}20`, borderRadius:9, padding:"10px 14px",
                fontSize:8, color:P.t2, lineHeight:1.9, whiteSpace:"pre-wrap", maxHeight:250, overflowY:"auto" }}>
                {aiForecast}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── POPULATION ── */}
      {view === "population" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ fontSize:8, fontWeight:700, color:P.t4, letterSpacing:2, marginBottom:8 }}>
              RISK DISTRIBUTION — {totalAtRisk.toLocaleString()} VETERANS
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={POPULATION_BINS} margin={{top:5,right:10,left:5,bottom:5}}>
                <XAxis dataKey="range" tick={{fill:P.t4,fontSize:8}} label={{value:"Risk Score",position:"insideBottom",offset:-3,fill:P.t4,fontSize:8}} />
                <YAxis tick={{fill:P.t4,fontSize:7}} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine x="65–80" stroke={P.red} strokeDasharray="4,4" label={{value:"High Risk",fill:P.red,fontSize:7}} />
                <Bar dataKey="count" radius={[3,3,0,0]} name="Veterans">
                  {POPULATION_BINS.map((b,i)=>(
                    <Cell key={i} fill={i>=5?P.red:i>=4?P.amber:i>=3?P.blue:P.teal} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ fontSize:8, fontWeight:700, color:P.t4, letterSpacing:2, marginBottom:8 }}>RISK SEGMENT BREAKDOWN</div>
            {POPULATION_BINS.map((b,i)=>{
              const c = i>=5?P.red:i>=4?P.amber:i>=3?P.blue:P.teal;
              const pct = ((b.count/totalAtRisk)*100).toFixed(1);
              return (
                <div key={b.range} style={{ marginBottom:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ fontSize:8, color:c, fontWeight:700 }}>{b.label} ({b.range})</span>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:c }}>{b.count.toLocaleString()} · {pct}%</span>
                  </div>
                  <div style={{ background:"#030508", borderRadius:3, height:6, overflow:"hidden" }}>
                    <div style={{ width:`${pct}%`, height:"100%", background:c, borderRadius:3 }} />
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop:8, padding:"6px 10px", background:`${P.red}10`, border:`1px solid ${P.red}15`, borderRadius:6 }}>
              <span style={{ fontSize:7, color:P.red, fontWeight:700 }}>
                Critical + Very High: {(POPULATION_BINS[5].count+POPULATION_BINS[6].count).toLocaleString()} veterans ({(((POPULATION_BINS[5].count+POPULATION_BINS[6].count)/totalAtRisk)*100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── TREND ── */}
      {view === "trend" && (
        <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"14px 16px" }}>
          <div style={{ fontSize:9, fontWeight:700, color:P.t4, letterSpacing:2, marginBottom:10 }}>MONTHLY DEPORTATION TREND — VETERAN POPULATION</div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={MONTHLY_TREND} margin={{top:5,right:30,left:10,bottom:5}}>
              <XAxis dataKey="month" tick={{fill:P.t4,fontSize:8}} />
              <YAxis yAxisId="l" tick={{fill:P.t4,fontSize:7}} />
              <YAxis yAxisId="r" orientation="right" tick={{fill:P.t4,fontSize:7}} domain={[112000,116000]} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine yAxisId="l" x="Apr 26" stroke={P.gold} strokeDasharray="4,4" label={{value:"TODAY",fill:P.gold,fontSize:7}} />
              <Line yAxisId="l" type="monotone" dataKey="deported" stroke={P.red} strokeWidth={2.5} dot={{fill:P.red,r:4}} name="Monthly Deported" />
              <Line yAxisId="r" type="monotone" dataKey="atRisk" stroke={P.amber} strokeWidth={1.5} dot={false} strokeDasharray="5,3" name="At-Risk Population" />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:10 }}>
            {[
              ["Oct 25 Rate", "820/mo", P.blue, "Baseline"],
              ["Mar 26 Rate", "2,230/mo", P.red, "+172% increase"],
              ["6-Mo Trajectory", "ESCALATING", P.red, "No reversal signal"],
            ].map(([k,v,c,sub])=>(
              <div key={k} style={{ background:"#080D18", border:`1px solid ${c}20`, borderRadius:8, padding:"8px 12px" }}>
                <div style={{ fontSize:7, color:P.t4, marginBottom:2 }}>{k}</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14, fontWeight:800, color:c }}>{v}</div>
                <div style={{ fontSize:6, color:P.t4 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RECONCILIATION ── */}
      {view === "recon" && (
        <div>
          {!reconResult ? (
            <div style={{ background:P.card, border:`1px solid ${P.blue}20`, borderRadius:10, padding:"30px", textAlign:"center" }}>
              <div style={{ fontSize:24, marginBottom:8 }}>🔁</div>
              <div style={{ fontSize:11, color:P.blue, fontWeight:700, marginBottom:4 }}>DCAS Evidence Reconciliation Engine</div>
              <div style={{ fontSize:8, color:P.t4, marginBottom:14 }}>
                Runs BISG sweep · Refreshes NERO scores · Updates case confidence · Generates gap analysis
              </div>
              <button onClick={runReconciliation} disabled={reconLoading}
                style={{ padding:"10px 24px", background:`linear-gradient(135deg,${P.blue},${P.violet})`,
                  color:"#fff", border:"none", borderRadius:8, fontSize:11, fontWeight:800, cursor:"pointer" }}>
                {reconLoading?"⟳ Running...":"▶ Run Reconciliation Now"}
              </button>
            </div>
          ) : reconResult.error ? (
            <div style={{ background:`${P.red}08`, border:`1px solid ${P.red}30`, borderRadius:8, padding:"12px", color:P.red, fontSize:9 }}>
              ⚠ {reconResult.error}
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {/* Run summary */}
              <div style={{ background:P.card, border:`1px solid ${P.teal}30`, borderTop:`3px solid ${P.teal}`, borderRadius:10, padding:"12px 16px" }}>
                <div style={{ display:"flex", gap:8, justifyContent:"space-between", flexWrap:"wrap", marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:7, color:P.teal, fontWeight:700, letterSpacing:2, marginBottom:2 }}>RECONCILIATION COMPLETE</div>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:P.t3 }}>{reconResult.runId}</div>
                  </div>
                  <span style={{ fontSize:7, color:P.teal, background:`${P.teal}12`, border:`1px solid ${P.teal}25`, borderRadius:20, padding:"3px 12px", fontWeight:700 }}>✓ SUCCESS</span>
                </div>
                <div style={{ fontSize:9, color:P.t2, lineHeight:1.8 }}>{reconResult.summary}</div>
              </div>

              {/* DCAS + NERO grid */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:9, padding:"10px 14px" }}>
                  <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:7 }}>DCAS METRICS</div>
                  {reconResult.dcas && Object.entries(reconResult.dcas).map(([k,v])=>(
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:7, padding:"3px 0", borderBottom:`1px solid ${P.b}20` }}>
                      <span style={{ color:P.t4 }}>{k.replace(/([A-Z])/g," $1").trim()}</span>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", color:P.blue, fontWeight:700 }}>{String(v)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:9, padding:"10px 14px" }}>
                  <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:7 }}>NERO SCORES</div>
                  {reconResult.nero && [
                    ["N — Notification", reconResult.nero.N, P.red],
                    ["E — Erasure",      reconResult.nero.E, P.amber],
                    ["R — Restriction",  reconResult.nero.R, P.blue],
                    ["O — Obscurity",    reconResult.nero.O, P.violet],
                    ["Composite",        reconResult.nero.composite, P.gold],
                    ["Trend",            reconResult.nero.trend, reconResult.nero.trend==="INCREASING"?P.red:P.teal],
                  ].map(([k,v,c])=>(
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:7, padding:"3px 0", borderBottom:`1px solid ${P.b}20` }}>
                      <span style={{ color:P.t4 }}>{k}</span>
                      <span style={{ color:c, fontWeight:700 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gaps */}
              {reconResult.gaps && (
                <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:9, padding:"10px 14px" }}>
                  <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:7 }}>GAP ANALYSIS</div>
                  {reconResult.gaps.map((g,i)=>{
                    const c = g.severity==="CRITICAL"?P.red:g.severity==="HIGH"?P.amber:P.blue;
                    return (
                      <div key={i} style={{ background:"#080D18", border:`1px solid ${c}20`, borderLeft:`3px solid ${c}`,
                        borderRadius:7, padding:"6px 10px", marginBottom:5 }}>
                        <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:2 }}>
                          <span style={{ fontSize:6, background:`${c}15`, border:`1px solid ${c}20`, color:c, borderRadius:20, padding:"1px 6px", fontWeight:700 }}>{g.severity}</span>
                          <span style={{ fontSize:7, fontWeight:700, color:c }}>{g.type.replace(/_/g," ")}</span>
                        </div>
                        <div style={{ fontSize:7, color:P.t3 }}>{g.detail}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CHC Export result */}
      {chcResult && !chcResult.error && (
        <div style={{ marginTop:10, background:P.card, border:`1px solid ${P.gold}30`, borderRadius:9, padding:"10px 14px" }}>
          <div style={{ fontSize:8, color:P.gold, fontWeight:700, marginBottom:4 }}>✓ CHC Briefing Package Generated</div>
          <div style={{ fontSize:7, color:P.t3 }}>
            {chcResult.package?.metadata?.title} · {chcResult.package?.chcReadiness?.overall}% ready ·
            {chcResult.emailSent ? ` Email sent to ${chcResult.recipient}` : " Downloaded locally"}
          </div>
        </div>
      )}
    </div>
  );
}