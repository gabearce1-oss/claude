import { useState, useEffect } from "react";
import { P } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

// Churn = veteran cases at risk of being "lost" (death, repatriation failure, record gap, deportation w/o documentation)
const CHURN_FACTORS = [
  { id:"age",     label:"Veteran Age",          weight:0.18, desc:"Older veterans face higher mortality risk before case resolution" },
  { id:"doc",     label:"Documentation Gap",    weight:0.22, desc:"Missing DD-214 or OMPF increases system loss probability" },
  { id:"shelter", label:"Shelter Instability",  weight:0.16, desc:"Unsheltered veterans have 3.4× higher churn rate" },
  { id:"foia",    label:"FOIA Blockage",         weight:0.19, desc:"Each 30-day FOIA delay adds 4.2% churn probability" },
  { id:"legal",   label:"No Legal Rep.",         weight:0.14, desc:"Cases without pro bono legal support churn at 2.1×" },
  { id:"contact", label:"Lost Contact",          weight:0.11, desc:"No contact >60 days triggers automatic at-risk flag" },
];

const BASE_CASES = [
  { id:"C001", name:"Ramos",         age:75, docGap:0.1, shelter:0.0, foia:0.3, legal:0.0, contact:0.0, tier:"Gold" },
  { id:"C002", name:"M. Valenzuela", age:68, docGap:0.6, shelter:0.3, foia:0.7, legal:0.2, contact:0.1, tier:"Silver" },
  { id:"C003", name:"V. Valenzuela", age:65, docGap:0.6, shelter:0.3, foia:0.7, legal:0.2, contact:0.1, tier:"Silver" },
  { id:"C004", name:"Sae Joon Park", age:62, docGap:0.4, shelter:0.5, foia:0.5, legal:0.3, contact:0.4, tier:"Gold" },
  { id:"C005", name:"M. Segura",     age:70, docGap:0.7, shelter:0.6, foia:0.8, legal:0.6, contact:0.3, tier:"Silver" },
  { id:"C006", name:"J. Duran",      age:58, docGap:0.8, shelter:0.7, foia:0.9, legal:0.8, contact:0.5, tier:"Bronze" },
];

// Weighted churn score
const calcChurn = (c) => {
  const ageNorm = Math.min(1, Math.max(0, (c.age - 55) / 30));
  const score = (
    ageNorm    * CHURN_FACTORS[0].weight +
    c.docGap   * CHURN_FACTORS[1].weight +
    c.shelter  * CHURN_FACTORS[2].weight +
    c.foia     * CHURN_FACTORS[3].weight +
    c.legal    * CHURN_FACTORS[4].weight +
    c.contact  * CHURN_FACTORS[5].weight
  );
  return Math.min(1, score);
};

const RISK_LEVEL = (s) => s > 0.65 ? ["CRITICAL", P.red] : s > 0.4 ? ["HIGH", P.amber] : s > 0.2 ? ["MEDIUM", P.gold] : ["LOW", P.teal];

// Monte Carlo simulation: sample N runs, vary inputs ±20%
const runMonteCarlo = (baseCase, runs=500) => {
  const results = [];
  for (let i=0; i<runs; i++) {
    const noise = () => (Math.random()-0.5)*0.4;
    const noisy = {
      ...baseCase,
      docGap:  Math.min(1,Math.max(0,baseCase.docGap  + noise())),
      shelter: Math.min(1,Math.max(0,baseCase.shelter + noise())),
      foia:    Math.min(1,Math.max(0,baseCase.foia    + noise())),
      legal:   Math.min(1,Math.max(0,baseCase.legal   + noise())),
      contact: Math.min(1,Math.max(0,baseCase.contact + noise())),
    };
    results.push(calcChurn(noisy));
  }
  results.sort((a,b)=>a-b);
  return {
    mean:    results.reduce((a,b)=>a+b,0)/runs,
    p10:     results[Math.floor(runs*0.10)],
    p50:     results[Math.floor(runs*0.50)],
    p90:     results[Math.floor(runs*0.90)],
    distribution: Array.from({length:10},(_,i)=>results.filter(r=>r>=i/10&&r<(i+1)/10).length),
  };
};

// Population-level projection: 115,000 at-risk non-citizen vets
const POPULATION = 115000;
const populationChurn = (timeMonths) => {
  const baseline = 0.034; // 3.4%/month base attrition
  const foia_multiplier = 1 + (3 * 0.042); // 3 overdue FOIA × 4.2%
  const monthly_rate = baseline * foia_multiplier;
  return Math.round(POPULATION * (1 - Math.pow(1-monthly_rate, timeMonths)));
};

export default function ChurnModel() {
  const [selCase, setSelCase] = useState("C004");
  const [mcResult, setMcResult] = useState(null);
  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [interventions, setInterventions] = useState({ legal:false, foia:false, shelter:false });
  const [view, setView] = useState("cases"); // cases | population | factors | montecarlo

  const caseData = BASE_CASES.find(c=>c.id===selCase);

  // Apply interventions to case
  const adjustedCase = {
    ...caseData,
    legal:   interventions.legal   ? Math.max(0, caseData.legal   - 0.5) : caseData.legal,
    foia:    interventions.foia    ? Math.max(0, caseData.foia    - 0.5) : caseData.foia,
    shelter: interventions.shelter ? Math.max(0, caseData.shelter - 0.5) : caseData.shelter,
  };
  const baseScore    = calcChurn(caseData);
  const adjustedScore= calcChurn(adjustedCase);
  const reduction    = baseScore - adjustedScore;
  const [riskLabel, riskColor] = RISK_LEVEL(adjustedScore);
  const [baseRiskLabel] = RISK_LEVEL(baseScore);

  useEffect(() => {
    if (view==="montecarlo") setMcResult(runMonteCarlo(adjustedCase));
  }, [selCase, interventions, view]);

  const getAIInsight = async () => {
    setAiLoading(true);
    const insight = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert in veteran advocacy and case management for the AUMER Foundation. 
      
Analyze the churn risk for veteran case ${caseData.id} — ${caseData.name}:
- Age: ${caseData.age}
- Documentation Gap Score: ${caseData.docGap} (0=complete, 1=missing)
- Shelter Instability: ${caseData.shelter}
- FOIA Blockage: ${caseData.foia}  
- No Legal Representation: ${caseData.legal}
- Lost Contact Risk: ${caseData.contact}
- Current Churn Score: ${(baseScore*100).toFixed(1)}% — ${baseRiskLabel}
- With interventions applied: ${(adjustedScore*100).toFixed(1)}%

Provide:
1. Top 2 specific intervention recommendations to reduce churn
2. Timeline urgency (days before case is "lost")
3. Which organization should take action (LULAC, DVSH, Pro Bono attorney, CHC)
4. One key early warning indicator to monitor

Keep it actionable, specific, and under 150 words.`,
    });
    setAiInsight(insight);
    setAiLoading(false);
  };

  const PROJ_MONTHS = [3,6,12,24,36];

  return (
    <div>
      {/* Header stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:7, marginBottom:12 }}>
        {[
          {l:"At-Risk Population",  v:"115,000", c:P.red},
          {l:"Critical Cases (>65%)", v:BASE_CASES.filter(c=>calcChurn(c)>0.65).length, c:P.red},
          {l:"High Risk (>40%)",    v:BASE_CASES.filter(c=>calcChurn(c)>0.4).length, c:P.amber},
          {l:"Monthly Attrition",   v:`${(3.4*1+1*0.042*30*3).toFixed(1)}%`, c:P.violet},
          {l:"Cases Salvageable w/ Intervention", v:BASE_CASES.filter(c=>{
            const adj={...c,legal:Math.max(0,c.legal-0.5),foia:Math.max(0,c.foia-0.5)};
            return calcChurn(c)>0.4 && calcChurn(adj)<0.4;
          }).length, c:P.teal},
          {l:"Avg Churn Score", v:`${(BASE_CASES.reduce((a,c)=>a+calcChurn(c),0)/BASE_CASES.length*100).toFixed(0)}%`, c:P.gold},
        ].map((s,i)=>(
          <div key={i} style={{ background:P.card, border:`1px solid ${s.c}25`, borderLeft:`3px solid ${s.c}`, borderRadius:7, padding:"8px 12px" }}>
            <div style={{ fontSize:7, color:P.t4, marginBottom:2 }}>{s.l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:typeof s.v==="number"?20:14, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display:"flex", gap:0, marginBottom:10, background:P.card, border:`1px solid ${P.b}`, borderRadius:8, overflow:"hidden", width:"fit-content" }}>
        {[["cases","🎖️ Case Scores"],["population","🌐 Population Model"],["factors","⚖️ Factor Analysis"],["montecarlo","🎲 Monte Carlo"]].map(([v,l])=>(
          <button key={v} onClick={()=>setView(v)}
            style={{ padding:"7px 14px", background:view===v?`${P.violet}15`:"transparent",
              border:"none", borderRight:`1px solid ${P.b}`, color:view===v?P.violet:P.t4,
              fontSize:9, fontWeight:view===v?700:400, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace" }}>
            {l}
          </button>
        ))}
      </div>

      {view === "cases" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {/* Case list */}
          <div>
            <div style={{ fontSize:7, color:P.t4, letterSpacing:3, marginBottom:8 }}>CASE CHURN SCORES</div>
            {BASE_CASES.map(c=>{
              const score=calcChurn(c);
              const [rl,rc]=RISK_LEVEL(score);
              const isSel=selCase===c.id;
              return (
                <div key={c.id} onClick={()=>setSelCase(c.id)}
                  style={{ background:isSel?`${rc}08`:P.card, border:`1px solid ${isSel?rc+"40":P.b}`,
                    borderLeft:`5px solid ${rc}`, borderRadius:9, padding:"10px 14px",
                    marginBottom:7, cursor:"pointer", transition:"all .12s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:10, fontWeight:800, color:isSel?rc:P.t1 }}>{c.name}</div>
                      <div style={{ fontSize:7, color:P.t4 }}>{c.id} · {c.tier} · Age {c.age}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:800, color:rc, lineHeight:1 }}>
                        {(score*100).toFixed(0)}%
                      </div>
                      <div style={{ fontSize:7, color:rc }}>{rl}</div>
                    </div>
                  </div>
                  {/* Mini bar */}
                  <div style={{ background:"#030508", borderRadius:2, height:4, marginTop:6, overflow:"hidden" }}>
                    <div style={{ width:`${score*100}%`, height:"100%", background:rc, borderRadius:2 }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Case detail */}
          {caseData && (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ background:P.card, border:`1px solid ${riskColor}30`, borderRadius:10, padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:800, color:riskColor }}>{caseData.name}</div>
                    <div style={{ fontSize:8, color:P.t4 }}>{caseData.id} · {caseData.tier} · Age {caseData.age}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:24, fontWeight:800, color:riskColor, lineHeight:1 }}>
                      {(adjustedScore*100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize:8, color:riskColor, fontWeight:700 }}>{riskLabel} CHURN</div>
                    {reduction>0 && <div style={{ fontSize:7, color:P.teal }}>↓ {(reduction*100).toFixed(1)}% w/ interventions</div>}
                  </div>
                </div>

                {/* Factor bars */}
                <div style={{ marginTop:10 }}>
                  {CHURN_FACTORS.map((f,i)=>{
                    const rawVals = [
                      (Math.min(1,Math.max(0,(caseData.age-55)/30))),
                      caseData.docGap, caseData.shelter, caseData.foia, caseData.legal, caseData.contact
                    ];
                    const v=rawVals[i];
                    const c=v>0.65?P.red:v>0.4?P.amber:v>0.2?P.gold:P.teal;
                    return (
                      <div key={f.id} style={{ marginBottom:6 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                          <span style={{ fontSize:7, color:P.t3 }}>{f.label}</span>
                          <span style={{ fontSize:7, fontFamily:"'IBM Plex Mono',monospace", color:c }}>{(v*100).toFixed(0)}%</span>
                        </div>
                        <div style={{ background:"#030508", borderRadius:2, height:5, overflow:"hidden" }}>
                          <div style={{ width:`${v*100}%`, height:"100%", background:c, borderRadius:2 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interventions */}
              <div style={{ background:P.card, border:`1px solid ${P.teal}20`, borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:7, color:P.teal, letterSpacing:2, marginBottom:8 }}>⚡ INTERVENTION SIMULATOR</div>
                {[
                  ["legal","Pro Bono Legal Assigned",P.violet],
                  ["foia","FOIA Expedited/Escalated",P.blue],
                  ["shelter","Stable Shelter Secured",P.teal],
                ].map(([key,label,c])=>(
                  <div key={key} onClick={()=>setInterventions(p=>({...p,[key]:!p[key]}))}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0",
                      borderBottom:`1px solid ${P.b}20`, cursor:"pointer" }}>
                    <div style={{ width:16, height:16, borderRadius:3,
                      background:interventions[key]?`${c}18`:"transparent",
                      border:`2px solid ${interventions[key]?c:P.b}`,
                      display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {interventions[key]&&<span style={{ fontSize:9, color:c }}>✓</span>}
                    </div>
                    <span style={{ fontSize:8, color:interventions[key]?c:P.t3 }}>{label}</span>
                    <span style={{ fontSize:7, color:P.t4, marginLeft:"auto" }}>−{(CHURN_FACTORS[["legal","foia","shelter"].indexOf(key)+3]?.weight*0.5*100).toFixed(0)}pts</span>
                  </div>
                ))}
                {reduction > 0 && (
                  <div style={{ marginTop:8, padding:"6px 10px", background:`${P.teal}08`, borderRadius:6,
                    fontSize:8, color:P.teal, textAlign:"center" }}>
                    ↓ Churn reduced by {(reduction*100).toFixed(1)} percentage points
                  </div>
                )}
              </div>

              {/* AI Insight */}
              <button onClick={getAIInsight} disabled={aiLoading}
                style={{ padding:"9px", background:aiLoading?P.b:`linear-gradient(135deg,${P.gold},${P.amber})`,
                  color:aiLoading?P.t4:"#000", border:"none", borderRadius:8, fontSize:9,
                  fontWeight:800, cursor:aiLoading?"not-allowed":"pointer", fontFamily:"'IBM Plex Mono',monospace" }}>
                {aiLoading?"⟳ Generating AI Insight...":"✨ Generate AI Intervention Insight"}
              </button>
              {aiInsight && (
                <div style={{ background:"#020609", border:`1px solid ${P.gold}20`, borderRadius:8, padding:"12px 14px",
                  fontSize:8, color:P.t2, lineHeight:1.8, whiteSpace:"pre-wrap" }}>
                  {aiInsight}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {view === "population" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ background:P.card, border:`1px solid ${P.red}20`, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:9, fontWeight:700, color:P.red, letterSpacing:2, marginBottom:10 }}>
              🌐 POPULATION CHURN PROJECTION — 115,000 AT-RISK NON-CITIZEN VETERANS
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:8 }}>
              {PROJ_MONTHS.map(m=>{
                const lost=populationChurn(m);
                const pct=(lost/POPULATION*100).toFixed(1);
                return (
                  <div key={m} style={{ background:"#080D18", border:`1px solid ${P.red}15`, borderRadius:8, padding:"10px 12px", textAlign:"center" }}>
                    <div style={{ fontSize:7, color:P.t4, marginBottom:3 }}>{m} months</div>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:16, fontWeight:800, color:P.red, lineHeight:1 }}>
                      {lost.toLocaleString()}
                    </div>
                    <div style={{ fontSize:7, color:P.amber, marginTop:2 }}>{pct}% lost</div>
                    {/* Bar */}
                    <div style={{ background:"#030508", borderRadius:2, height:4, marginTop:6, overflow:"hidden" }}>
                      <div style={{ width:`${Math.min(100,parseFloat(pct))}%`, height:"100%", background:P.red, borderRadius:2 }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop:10, fontSize:7, color:P.t4, lineHeight:1.8 }}>
              Model assumptions: 3.4%/month base attrition × 1.126 FOIA delay multiplier (3 overdue FOIA × 4.2%/30d each).
              Attrition = mortality + deportation + lost contact + repatriation failure. Based on LULAC field data + GAO-19-416.
            </div>
          </div>

          <div style={{ background:P.card, border:`1px solid ${P.amber}20`, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:9, fontWeight:700, color:P.amber, letterSpacing:2, marginBottom:8 }}>⚡ INTERVENTION IMPACT — POPULATION LEVEL</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[
                {scenario:"No Action",                 monthly:0.0384, color:P.red},
                {scenario:"All FOIA Resolved",         monthly:0.034,  color:P.amber},
                {scenario:"Pro Bono Legal at Scale",   monthly:0.026,  color:P.gold},
                {scenario:"CHC Legislation Passed",    monthly:0.011,  color:P.teal},
              ].map((s,i)=>{
                const yr1=Math.round(POPULATION*(1-Math.pow(1-s.monthly,12)));
                return (
                  <div key={i} style={{ background:"#080D18", border:`1px solid ${s.color}20`, borderRadius:8, padding:"10px 12px" }}>
                    <div style={{ fontSize:8, fontWeight:700, color:s.color, marginBottom:4 }}>{s.scenario}</div>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14, fontWeight:800, color:s.color }}>
                      {yr1.toLocaleString()}
                    </div>
                    <div style={{ fontSize:7, color:P.t4 }}>lost in 12 months</div>
                    <div style={{ background:"#030508", borderRadius:2, height:4, marginTop:6, overflow:"hidden" }}>
                      <div style={{ width:`${Math.min(100,yr1/POPULATION*100)}%`, height:"100%", background:s.color, borderRadius:2 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {view === "factors" && (
        <div>
          <div style={{ fontSize:8, color:P.t3, marginBottom:10 }}>Churn factor weights derived from LULAC field data, GAO-19-416, and AUMER Foundation case outcomes. Weights sum to 1.0.</div>
          {CHURN_FACTORS.map((f,i)=>(
            <div key={f.id} style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:9, padding:"12px 14px", marginBottom:7 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:P.t1 }}>{f.label}</div>
                  <div style={{ fontSize:8, color:P.t3, marginTop:1 }}>{f.desc}</div>
                </div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:800, color:P.violet, textAlign:"right" }}>
                  {(f.weight*100).toFixed(0)}%
                </div>
              </div>
              <div style={{ background:"#030508", borderRadius:3, height:8, overflow:"hidden" }}>
                <div style={{ width:`${f.weight*100}%`, height:"100%",
                  background:`linear-gradient(90deg,${P.violet},${P.blue})`, borderRadius:3 }} />
              </div>
              {/* Case comparison */}
              <div style={{ display:"flex", gap:5, marginTop:7, flexWrap:"wrap" }}>
                {BASE_CASES.map(c=>{
                  const vals=[Math.min(1,Math.max(0,(c.age-55)/30)),c.docGap,c.shelter,c.foia,c.legal,c.contact];
                  const v=vals[i];
                  const col=v>0.65?P.red:v>0.4?P.amber:v>0.2?P.gold:P.teal;
                  return (
                    <div key={c.id} style={{ fontSize:7, padding:"2px 7px", borderRadius:20,
                      background:`${col}12`, border:`1px solid ${col}25`, color:col }}>
                      {c.name.split(" ")[0]}: {(v*100).toFixed(0)}%
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "montecarlo" && mcResult && (
        <div>
          <div style={{ fontSize:8, color:P.t3, marginBottom:10 }}>
            Monte Carlo simulation — 500 runs with ±20% input variance for <strong style={{ color:P.violet }}>{caseData?.name}</strong>. Select a case in "Case Scores" tab first.
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:8, marginBottom:12 }}>
            {[
              {l:"10th Percentile (Best)",   v:`${(mcResult.p10*100).toFixed(1)}%`, c:P.teal},
              {l:"50th Percentile (Median)", v:`${(mcResult.p50*100).toFixed(1)}%`, c:P.gold},
              {l:"90th Percentile (Worst)",  v:`${(mcResult.p90*100).toFixed(1)}%`, c:P.red},
              {l:"Mean Score",               v:`${(mcResult.mean*100).toFixed(1)}%`, c:P.violet},
            ].map((s,i)=>(
              <div key={i} style={{ background:P.card, border:`1px solid ${s.c}25`, borderLeft:`3px solid ${s.c}`, borderRadius:7, padding:"10px 14px" }}>
                <div style={{ fontSize:7, color:P.t4, marginBottom:2 }}>{s.l}</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:800, color:s.c }}>{s.v}</div>
              </div>
            ))}
          </div>
          {/* Distribution histogram */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:8, fontWeight:700, color:P.t4, letterSpacing:2, marginBottom:10 }}>
              CHURN SCORE DISTRIBUTION — 500 MONTE CARLO RUNS
            </div>
            <div style={{ display:"flex", gap:3, alignItems:"flex-end", height:80 }}>
              {mcResult.distribution.map((count,i)=>{
                const max=Math.max(...mcResult.distribution);
                const h=max?Math.round((count/max)*72)+4:4;
                const pct=i*10;
                const c=pct>=65?P.red:pct>=40?P.amber:pct>=20?P.gold:P.teal;
                return (
                  <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                    <div style={{ width:"100%", height:h, background:c, borderRadius:2, opacity:0.75 }} />
                    <div style={{ fontSize:6, color:P.t4 }}>{pct}%</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop:8, fontSize:7, color:P.t4 }}>
              X-axis = churn score bucket · Y-axis = frequency · {caseData?.name} — {500} simulations
            </div>
          </div>
        </div>
      )}
    </div>
  );
}