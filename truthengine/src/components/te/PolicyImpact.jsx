import { useState } from "react";
import { P } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

const POLICIES = [
  {
    id:"iirira96",
    name:"IIRIRA 1996",
    icon:"⚖️",
    type:"ENACTED",
    color:P.red,
    description:"Illegal Immigration Reform and Immigrant Responsibility Act — retroactively expanded deportable offenses, eliminated judicial discretion",
    keyProvisions:["§237(a)(2) — aggravated felony expansion","Retroactive application pre-1996","Eliminated §212(c) relief","1-year bars, permanent bars"],
    affectedPopulation:115000,
    dcasImpact:"Direct cause of veteran deportation pipeline — criminalizes honorable service retroactively",
    nestedLaws:["AEDPA 1996","INA §101(a)(43)"],
  },
  {
    id:"s874",
    name:"S.874 — Veterans Visa Act",
    icon:"🛡️",
    type:"PROPOSED",
    color:P.teal,
    description:"Sen. Duckworth — Veterans Visa and Protection Act. Prevents deportation of veterans with honorable discharge.",
    keyProvisions:["Exempts honorable discharge from deportation grounds","Creates immigration relief pathway","Retroactive application","DoD/DHS coordination mandate"],
    affectedPopulation:94000,
    dcasImpact:"Would immediately halt all pending deportations of honorably discharged veterans",
    nestedLaws:["INA §237 amendment","INA §212 amendment"],
  },
  {
    id:"hr1537",
    name:"HR.1537 — Repatriate Act",
    icon:"🏠",
    type:"PROPOSED",
    color:P.blue,
    description:"Rep. Takano — Repatriate Our Patriots Act. Creates formal repatriation pathway for deported veterans.",
    keyProvisions:["30-day emergency repatriation process","VA benefit restoration","Legal status regularization","Family reunification provisions"],
    affectedPopulation:52000,
    dcasImpact:"Addresses veterans already deported — ~52,000 estimated cases",
    nestedLaws:["INA §245","38 USC veteran benefits"],
  },
  {
    id:"ina329",
    name:"INA §329 — Wartime Nat.",
    icon:"🎖️",
    type:"ENACTED",
    color:P.gold,
    description:"Statutory naturalization for non-citizen service members during wartime. Underutilized — 72% drop in applications FY17–18.",
    keyProvisions:["Expedited naturalization during wartime","Active duty service requirement","No continuous residence req.","Fee waiver eligible"],
    affectedPopulation:28000,
    dcasImpact:"Should have protected Vietnam-era non-citizen veterans — administrative failure prevented uptake",
    nestedLaws:["8 CFR §328","USCIS Form N-400"],
  },
  {
    id:"eo14012",
    name:"EO-14012 — IMMVI",
    icon:"📋",
    type:"ENACTED",
    color:P.violet,
    description:"Executive Order 14012 — Restoring Faith in Our Legal Immigration Systems. Includes military parole-in-place provisions.",
    keyProvisions:["Military parole-in-place guidance","Inter-agency task force","DHS/VA/DoD coordination","30-day review mandate"],
    affectedPopulation:21000,
    dcasImpact:"ICE Directive 10039.2 (2022) issued under this — limited prosecutorial discretion for veterans",
    nestedLaws:["ICE Directive 10039.2","DHS Policy Manual"],
  },
  {
    id:"custom",
    name:"Custom Policy Scenario",
    icon:"🔬",
    type:"CUSTOM",
    color:P.amber,
    description:"Model any proposed policy, law, or executive action against the AUMER dataset.",
    keyProvisions:[],
    affectedPopulation:0,
    dcasImpact:"",
    nestedLaws:[],
  },
];

const IMPACT_SCHEMA = {
  type:"object",
  properties:{
    immediate_impact:{type:"object",properties:{
      veterans_protected:{type:"number"},
      deportations_halted:{type:"number"},
      cases_resolved:{type:"number"},
      dcas_records_affected:{type:"number"},
    }},
    timeline_projections:{type:"array",items:{type:"object",properties:{
      months:{type:"number"},label:{type:"string"},outcome:{type:"string"},veterans_affected:{type:"number"}
    }}},
    legislative_score:{type:"number"},
    passage_probability:{type:"string"},
    key_barriers:{type:"array",items:{type:"string"}},
    key_enablers:{type:"array",items:{type:"string"}},
    chc_talking_points:{type:"array",items:{type:"string"}},
    nero_impact:{type:"object",properties:{
      N:{type:"string"},E:{type:"string"},R:{type:"string"},O:{type:"string"}
    }},
    implementation_risks:{type:"array",items:{type:"string"}},
    summary:{type:"string"},
  }
};

const TYPE_C = { ENACTED:P.teal, PROPOSED:P.blue, CUSTOM:P.amber };

export default function PolicyImpact() {
  const [selPolicy, setSelPolicy] = useState("iirira96");
  const [customText, setCustomText] = useState("");
  const [loading, setLoading] = useState(false);
  const [impact, setImpact] = useState(null);
  const [comparing, setComparing] = useState(new Set());
  const [compareResults, setCompareResults] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [view, setView] = useState("model"); // model | compare | timeline

  const policy = POLICIES.find(p => p.id === selPolicy);

  const runModel = async () => {
    setLoading(true); setImpact(null);
    const policyDesc = selPolicy === "custom" ? customText : `${policy.name}: ${policy.description}. Key provisions: ${policy.keyProvisions.join("; ")}`;
    const res = await base44.integrations.Core.InvokeLLM({
      prompt:`You are a senior policy analyst for the AUMER Foundation modeling the impact of immigration legislation on deported veterans.

POLICY: ${policyDesc}
TYPE: ${policy.type}
AFFECTED POPULATION ESTIMATE: ${policy.affectedPopulation.toLocaleString()} veterans
DCAS CONTEXT: ${policy.dcasImpact}

AUMER RESEARCH CONTEXT:
- 115,000 non-citizen veterans at risk in US today
- 94,000+ estimated deported veterans (advocacy estimate)
- DCAS: 349 Hispanic Vietnam casualties officially coded (BISG estimate: 2,309+)
- 6 CB-HSIVF verified cases — C004 (Sae Joon Park) self-deported Nov/Dec 2025
- CHC Briefing: May 18, 2026

Model the full policy impact including:
1. Immediate impact (veterans protected/released, deportations halted, DCAS records affected)
2. 5-point timeline projection (3/6/12/24/36 months) with outcomes and veterans affected
3. Legislative viability score 1-100
4. Passage probability (e.g. "35% — bipartisan support needed but lacks Senate majority")
5. Key barriers to passage/implementation (3-5 points)
6. Key enablers / coalition opportunities (3-5 points)
7. 3 CHC talking points specific to May 18 briefing
8. NERO score impact (how does this policy affect N/E/R/O vectors — 1 sentence each)
9. Implementation risks (3 points)
10. Executive summary (2-3 sentences)`,
      response_json_schema: IMPACT_SCHEMA,
      model: "claude_sonnet_4_6",
    });
    setImpact(res);
    setLoading(false);
  };

  const runComparison = async () => {
    if (comparing.size < 2) return;
    setCompareLoading(true); setCompareResults(null);
    const selected = POLICIES.filter(p => comparing.has(p.id));
    const res = await base44.integrations.Core.InvokeLLM({
      prompt:`Compare these ${selected.length} policies/laws for their impact on deported veterans. AUMER Foundation context: 115,000 at-risk non-citizen veterans, CHC briefing May 18 2026, DCAS 349 anomaly.

POLICIES TO COMPARE:
${selected.map(p=>`${p.name}: ${p.description}`).join("\n\n")}

For each policy provide a brief 2-sentence impact summary, a 1-100 effectiveness score, and the single most important provision. Then provide a combined strategy if all proposed legislation passed simultaneously.`,
      response_json_schema:{type:"object",properties:{
        comparisons:{type:"array",items:{type:"object",properties:{
          policy_name:{type:"string"},effectiveness_score:{type:"number"},
          impact_summary:{type:"string"},key_provision:{type:"string"}
        }}},
        combined_strategy:{type:"string"},
        recommended_priority:{type:"string"},
      }},
      model: "claude_sonnet_4_6",
    });
    setCompareResults(res);
    setCompareLoading(false);
  };

  const toggleCompare = (id) => setComparing(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:7, marginBottom:12 }}>
        {[
          {l:"Policies Modeled",  v:POLICIES.length-1, c:P.blue},
          {l:"Enacted Laws",      v:POLICIES.filter(p=>p.type==="ENACTED").length, c:P.teal},
          {l:"Proposed Bills",    v:POLICIES.filter(p=>p.type==="PROPOSED").length, c:P.violet},
          {l:"At-Risk Population",v:"115,000", c:P.red},
          {l:"CHC Brief",         v:"39 days", c:P.amber},
        ].map((s,i)=>(
          <div key={i} style={{ background:P.card, border:`1px solid ${s.c}25`, borderLeft:`3px solid ${s.c}`, borderRadius:7, padding:"8px 12px" }}>
            <div style={{ fontSize:7, color:P.t4, marginBottom:2 }}>{s.l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:typeof s.v==="number"?20:14, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display:"flex", gap:0, marginBottom:10, background:P.card, border:`1px solid ${P.b}`, borderRadius:8, overflow:"hidden", width:"fit-content" }}>
        {[["model","📊 Impact Model"],["compare","⚖️ Compare Policies"],["timeline","📅 Timeline"]].map(([v,l])=>(
          <button key={v} onClick={()=>setView(v)}
            style={{ padding:"7px 14px", background:view===v?`${P.violet}15`:"transparent",
              border:"none", borderRight:`1px solid ${P.b}`, color:view===v?P.violet:P.t4,
              fontSize:9, fontWeight:view===v?700:400, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace" }}>
            {l}
          </button>
        ))}
      </div>

      {view === "model" && (
        <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:12 }}>
          {/* Policy list */}
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {POLICIES.map(p=>{
              const tc=TYPE_C[p.type]||P.t4;
              const isSel=selPolicy===p.id;
              return (
                <div key={p.id} onClick={()=>{setSelPolicy(p.id);setImpact(null);}}
                  style={{ background:isSel?`${p.color}10`:P.card,
                    border:`1px solid ${isSel?p.color+"50":P.b}`,
                    borderLeft:`4px solid ${isSel?p.color:P.b}`,
                    borderRadius:8, padding:"9px 11px", cursor:"pointer" }}>
                  <div style={{ display:"flex", gap:5, alignItems:"center", marginBottom:2 }}>
                    <span style={{ fontSize:14 }}>{p.icon}</span>
                    <span style={{ fontSize:9, fontWeight:700, color:isSel?p.color:P.t1 }}>{p.name}</span>
                  </div>
                  <div style={{ display:"flex", gap:5 }}>
                    <span style={{ fontSize:6, background:`${tc}15`, border:`1px solid ${tc}20`, color:tc, borderRadius:20, padding:"1px 6px" }}>{p.type}</span>
                    {p.affectedPopulation>0 && <span style={{ fontSize:6, color:P.t4 }}>{p.affectedPopulation.toLocaleString()}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Model panel */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {selPolicy==="custom" ? (
              <div style={{ background:P.card, border:`1px solid ${P.amber}30`, borderRadius:10, padding:"14px" }}>
                <div style={{ fontSize:8, color:P.amber, fontWeight:700, marginBottom:6 }}>📋 CUSTOM POLICY SCENARIO</div>
                <textarea value={customText} onChange={e=>setCustomText(e.target.value)}
                  placeholder="Describe any policy, executive order, or legislative proposal to model its impact on deported veterans..."
                  style={{ width:"100%", height:80, padding:"9px 12px", background:"#080D18",
                    border:`1px solid ${P.amber}30`, borderRadius:8, color:P.t1,
                    fontSize:9, fontFamily:"'IBM Plex Mono',monospace", outline:"none",
                    resize:"vertical", boxSizing:"border-box" }} />
              </div>
            ) : (
              <div style={{ background:P.card, border:`1px solid ${policy.color}30`, borderRadius:10, padding:"14px" }}>
                <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontSize:20 }}>{policy.icon}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:800, color:policy.color }}>{policy.name}</div>
                    <div style={{ fontSize:7, color:P.t4 }}>{policy.description}</div>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <div style={{ background:"#080D18", borderRadius:7, padding:"8px 10px" }}>
                    <div style={{ fontSize:7, color:P.t4, marginBottom:4 }}>KEY PROVISIONS</div>
                    {policy.keyProvisions.map((pv,i)=><div key={i} style={{ fontSize:8, color:P.t2, padding:"1px 0" }}>• {pv}</div>)}
                  </div>
                  <div style={{ background:"#080D18", borderRadius:7, padding:"8px 10px" }}>
                    <div style={{ fontSize:7, color:P.t4, marginBottom:4 }}>DCAS IMPACT</div>
                    <div style={{ fontSize:8, color:policy.color, lineHeight:1.6 }}>{policy.dcasImpact}</div>
                    <div style={{ marginTop:6, fontSize:7, color:P.t4 }}>Affected: {policy.affectedPopulation.toLocaleString()} vets</div>
                  </div>
                </div>
              </div>
            )}

            <button onClick={runModel} disabled={loading||(selPolicy==="custom"&&!customText.trim())}
              style={{ padding:"10px", background:loading?P.b:`linear-gradient(135deg,${P.violet},${P.blue})`,
                color:loading?P.t4:"#fff", border:"none", borderRadius:8, fontSize:11,
                fontWeight:800, cursor:loading?"not-allowed":"pointer", fontFamily:"'IBM Plex Mono',monospace" }}>
              {loading?"⟳ Modeling Impact...":"📊 Run Policy Impact Model"}
            </button>

            {impact && (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {/* Immediate impact */}
                <div style={{ background:P.card, border:`1px solid ${P.teal}30`, borderRadius:10, padding:"12px 14px" }}>
                  <div style={{ fontSize:8, fontWeight:700, color:P.teal, letterSpacing:2, marginBottom:8 }}>⚡ IMMEDIATE IMPACT</div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:7 }}>
                    {[
                      {l:"Veterans Protected",   v:impact.immediate_impact?.veterans_protected?.toLocaleString(),  c:P.teal},
                      {l:"Deportations Halted",  v:impact.immediate_impact?.deportations_halted?.toLocaleString(), c:P.blue},
                      {l:"Cases Resolved",       v:impact.immediate_impact?.cases_resolved?.toLocaleString(),      c:P.gold},
                      {l:"DCAS Records Affected",v:impact.immediate_impact?.dcas_records_affected?.toLocaleString(),c:P.violet},
                    ].map((s,i)=>(
                      <div key={i} style={{ background:"#080D18", borderRadius:7, padding:"8px 10px" }}>
                        <div style={{ fontSize:7, color:P.t4, marginBottom:2 }}>{s.l}</div>
                        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14, fontWeight:800, color:s.c }}>{s.v||"—"}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Viability */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:9, padding:"10px 14px" }}>
                    <div style={{ fontSize:7, color:P.t4, marginBottom:4 }}>LEGISLATIVE SCORE</div>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:24, fontWeight:800,
                      color:impact.legislative_score>=70?P.teal:impact.legislative_score>=40?P.amber:P.red }}>
                      {impact.legislative_score}/100
                    </div>
                    <div style={{ background:"#030508", borderRadius:2, height:5, marginTop:5, overflow:"hidden" }}>
                      <div style={{ width:`${impact.legislative_score||0}%`, height:"100%",
                        background:impact.legislative_score>=70?P.teal:impact.legislative_score>=40?P.amber:P.red }} />
                    </div>
                    <div style={{ fontSize:7, color:P.t3, marginTop:4 }}>{impact.passage_probability}</div>
                  </div>
                  <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:9, padding:"10px 14px" }}>
                    <div style={{ fontSize:7, color:P.t4, marginBottom:4 }}>NERO VECTOR IMPACT</div>
                    {["N","E","R","O"].map(v=>(
                      <div key={v} style={{ fontSize:7, color:P.t2, padding:"1px 0" }}>
                        <span style={{ color:P.violet, fontWeight:700 }}>{v}:</span> {impact.nero_impact?.[v]||"—"}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Barriers / Enablers */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <div style={{ background:P.card, border:`1px solid ${P.red}20`, borderRadius:9, padding:"10px 14px" }}>
                    <div style={{ fontSize:7, color:P.red, fontWeight:700, marginBottom:5 }}>BARRIERS</div>
                    {impact.key_barriers?.map((b,i)=><div key={i} style={{ fontSize:8, color:P.t3, padding:"2px 0" }}>✕ {b}</div>)}
                  </div>
                  <div style={{ background:P.card, border:`1px solid ${P.teal}20`, borderRadius:9, padding:"10px 14px" }}>
                    <div style={{ fontSize:7, color:P.teal, fontWeight:700, marginBottom:5 }}>ENABLERS</div>
                    {impact.key_enablers?.map((e,i)=><div key={i} style={{ fontSize:8, color:P.t3, padding:"2px 0" }}>✓ {e}</div>)}
                  </div>
                </div>

                {/* CHC Talking Points */}
                <div style={{ background:P.card, border:`1px solid ${P.gold}30`, borderRadius:9, padding:"10px 14px" }}>
                  <div style={{ fontSize:7, color:P.gold, fontWeight:700, letterSpacing:2, marginBottom:6 }}>🏛️ CHC TALKING POINTS — MAY 18 BRIEFING</div>
                  {impact.chc_talking_points?.map((tp,i)=>(
                    <div key={i} style={{ fontSize:8, color:P.t2, padding:"4px 0", borderBottom:`1px solid ${P.b}20`, lineHeight:1.6 }}>
                      <span style={{ color:P.gold, fontWeight:700 }}>{i+1}. </span>{tp}
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div style={{ background:"#020609", border:`1px solid ${P.violet}20`, borderRadius:8, padding:"10px 14px",
                  fontSize:8, color:P.t2, lineHeight:1.8 }}>
                  {impact.summary}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {view === "compare" && (
        <div>
          <div style={{ fontSize:8, color:P.t3, marginBottom:8 }}>Select 2+ policies to compare side-by-side.</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
            {POLICIES.filter(p=>p.id!=="custom").map(p=>{
              const active=comparing.has(p.id);
              return (
                <button key={p.id} onClick={()=>toggleCompare(p.id)}
                  style={{ padding:"5px 12px", background:active?`${p.color}15`:"transparent",
                    border:`1px solid ${active?p.color:P.b}`, borderRadius:20,
                    color:active?p.color:P.t4, fontSize:8, cursor:"pointer" }}>
                  {p.icon} {p.name}
                </button>
              );
            })}
          </div>
          <button onClick={runComparison} disabled={comparing.size<2||compareLoading}
            style={{ padding:"9px 18px", background:comparing.size<2||compareLoading?P.b:`linear-gradient(135deg,${P.violet},${P.blue})`,
              color:comparing.size<2||compareLoading?P.t4:"#fff", border:"none", borderRadius:8, fontSize:10,
              fontWeight:800, cursor:comparing.size<2||compareLoading?"not-allowed":"pointer",
              fontFamily:"'IBM Plex Mono',monospace", marginBottom:10 }}>
            {compareLoading?"⟳ Comparing...":comparing.size<2?"Select 2+ policies":"⚖️ Compare Selected"}
          </button>
          {compareResults && (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ display:"grid", gridTemplateColumns:`repeat(${compareResults.comparisons?.length||2},1fr)`, gap:8 }}>
                {compareResults.comparisons?.map((c,i)=>{
                  const pol=POLICIES.find(p=>p.name===c.policy_name||c.policy_name?.includes(p.name.split("—")[0].trim()));
                  const col=pol?.color||P.blue;
                  return (
                    <div key={i} style={{ background:P.card, border:`1px solid ${col}30`, borderRadius:10, padding:"12px 14px" }}>
                      <div style={{ fontSize:9, fontWeight:700, color:col, marginBottom:4 }}>{c.policy_name}</div>
                      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:22, fontWeight:800, color:col, lineHeight:1, marginBottom:4 }}>
                        {c.effectiveness_score}<span style={{ fontSize:9, color:P.t4 }}>/100</span>
                      </div>
                      <div style={{ background:"#030508", borderRadius:2, height:5, marginBottom:6, overflow:"hidden" }}>
                        <div style={{ width:`${c.effectiveness_score}%`, height:"100%", background:col }} />
                      </div>
                      <div style={{ fontSize:8, color:P.t2, lineHeight:1.6, marginBottom:4 }}>{c.impact_summary}</div>
                      <div style={{ fontSize:7, color:col, fontStyle:"italic" }}>Key: {c.key_provision}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ background:P.card, border:`1px solid ${P.gold}30`, borderRadius:9, padding:"12px 14px" }}>
                <div style={{ fontSize:7, color:P.gold, fontWeight:700, marginBottom:4 }}>COMBINED STRATEGY</div>
                <div style={{ fontSize:8, color:P.t2, lineHeight:1.8 }}>{compareResults.combined_strategy}</div>
                <div style={{ marginTop:6, fontSize:8, color:P.teal, fontWeight:700 }}>→ Priority: {compareResults.recommended_priority}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {view === "timeline" && (
        <div>
          <div style={{ fontSize:8, color:P.t3, marginBottom:10 }}>Run the Impact Model first, then view the projected timeline here.</div>
          {impact?.timeline_projections ? (
            <div style={{ position:"relative" }}>
              <div style={{ position:"absolute", left:24, top:0, bottom:0, width:2, background:`${P.b}30` }} />
              {impact.timeline_projections.map((pt,i)=>{
                const c=pt.veterans_affected>10000?P.red:pt.veterans_affected>5000?P.amber:pt.veterans_affected>1000?P.gold:P.teal;
                return (
                  <div key={i} style={{ display:"flex", gap:14, marginBottom:16, position:"relative" }}>
                    <div style={{ width:50, flexShrink:0, textAlign:"center" }}>
                      <div style={{ width:16, height:16, borderRadius:"50%", background:c, border:`2px solid ${P.bg}`,
                        margin:"0 auto", position:"relative", zIndex:1 }} />
                      <div style={{ fontSize:7, color:P.t4, marginTop:4 }}>{pt.months}mo</div>
                    </div>
                    <div style={{ flex:1, background:P.card, border:`1px solid ${c}20`, borderRadius:9, padding:"10px 12px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:9, fontWeight:700, color:c }}>{pt.label}</span>
                        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:800, color:c }}>
                          {pt.veterans_affected?.toLocaleString()} vets
                        </span>
                      </div>
                      <div style={{ fontSize:8, color:P.t2, lineHeight:1.6 }}>{pt.outcome}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:9, padding:"20px", textAlign:"center", color:P.t4, fontSize:9 }}>
              Run "📊 Run Policy Impact Model" first to generate the timeline.
            </div>
          )}
        </div>
      )}
    </div>
  );
}