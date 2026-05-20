import { useState } from "react";
import { P } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

// ── DECISION TREE ────────────────────────────────────────────────────────────
const NODES = {
  start: {
    q: "Veteran's service era?",
    choices: [
      { label:"Vietnam Era (1961–1975)", next:"vietnam_branch" },
      { label:"Post-Vietnam (1975–1995)", next:"post_vietnam_branch" },
      { label:"Post-IIRIRA (1996+)", next:"post_iirira_branch" },
    ],
  },
  vietnam_branch: {
    q: "Did veteran receive any criminal conviction after service?",
    choices: [
      { label:"No conviction", next:"vietnam_no_conviction" },
      { label:"Minor (pre-1996)", next:"vietnam_minor_conviction" },
      { label:"Aggravated felony (any era)", next:"aggravated_felony" },
    ],
  },
  vietnam_no_conviction: {
    q: "Is veteran currently in the US or deported?",
    choices: [
      { label:"In the US", next:"vietnam_in_us" },
      { label:"Deported — border shelter", next:"deported_shelter" },
      { label:"Deported — origin country", next:"deported_country" },
    ],
  },
  vietnam_in_us: {
    q: "Does veteran have documentation of military service?",
    choices: [
      { label:"Yes — DD-214 on file", next:"path_ina329_strong" },
      { label:"Partial — NARA records", next:"path_ina329_nara" },
      { label:"No records — lost or destroyed", next:"path_records_reconstruction" },
    ],
  },
  vietnam_minor_conviction: {
    q: "Was conviction before or after September 30, 1996?",
    choices: [
      { label:"Before IIRIRA (pre-1996)", next:"iirira_retroactive_risk" },
      { label:"After IIRIRA (post-1996)", next:"post_iirira_conviction" },
    ],
  },
  post_vietnam_branch: {
    q: "Did veteran complete naturalization during service?",
    choices: [
      { label:"Yes — naturalized", next:"outcome_naturalized" },
      { label:"No — never applied", next:"post_vietnam_no_nat" },
      { label:"Applied but denied", next:"naturalization_denied" },
    ],
  },
  post_vietnam_no_nat: {
    q: "Any criminal history or removal order?",
    choices: [
      { label:"No — clean record", next:"path_ina329_strong" },
      { label:"Minor offense (pre-IIRIRA)", next:"iirira_retroactive_risk" },
      { label:"Current removal order", next:"removal_defense" },
    ],
  },
  post_iirira_branch: {
    q: "Does veteran have a current removal order?",
    choices: [
      { label:"Yes — active order", next:"removal_defense" },
      { label:"No order — at risk", next:"at_risk_prevention" },
      { label:"Self-deported under pressure", next:"deported_country" },
    ],
  },
  iirira_retroactive_risk: {
    q: "Has ICE initiated removal proceedings?",
    choices: [
      { label:"No — not yet", next:"at_risk_prevention" },
      { label:"Yes — proceedings active", next:"removal_defense" },
      { label:"Order issued, not yet executed", next:"stay_of_removal" },
    ],
  },
  aggravated_felony: {
    q: "Was veteran informed of deportation consequences at time of plea?",
    choices: [
      { label:"No — Padilla v. Kentucky violation", next:"padilla_claim" },
      { label:"Yes — fully informed", next:"limited_remedies" },
    ],
  },
  deported_shelter: {
    q: "Which border shelter is veteran located at?",
    choices: [
      { label:"Casa del Migrante — Tijuana", next:"repatriation_path" },
      { label:"El Refugio — Juárez", next:"repatriation_path" },
      { label:"Albergue Nazareth — Nogales", next:"repatriation_path" },
    ],
  },
  deported_country: {
    q: "Which country is veteran currently in?",
    choices: [
      { label:"Mexico", next:"repatriation_path" },
      { label:"Philippines / Korea / Other", next:"consular_path" },
      { label:"Colombia / Latin America", next:"repatriation_path" },
    ],
  },
  // Outcomes / terminal nodes
  path_ina329_strong: {
    q:null, outcome:true,
    title:"✅ Strong INA §329 Path",
    color:P.teal,
    probability:88,
    description:"Veteran has clear wartime service and no disqualifying record. INA §329 provides direct naturalization pathway. File N-400 with military exemption.",
    steps:["Gather DD-214 and all service records","File N-400 (Military & Veteran exemption)","Request fee waiver under 8 CFR §103.7(c)","Submit to USCIS Naturalization office","Expect 6–18 month processing"],
    legislation:["INA §329","8 CFR §328","EO-14012 IMMVI"],
    risks:["Processing delays","Missing records gap","Consular backlog if abroad"],
    chcAsk:"Expedited USCIS processing for Vietnam-era veterans (pre-1996 service)",
  },
  path_ina329_nara: {
    q:null, outcome:true,
    title:"⚠️ INA §329 — Records Gap",
    color:P.amber,
    probability:67,
    description:"Partial records create evidentiary gap. NARA reconstruction required before naturalization application.",
    steps:["File NARA SF-180 (Standard Form 180)","Request AUMER DCAS cross-reference","Submit BISG surname analysis as corroborating evidence","File N-400 with supplemental affidavits","Congressional case file with CHC letter"],
    legislation:["INA §329","5 USC §552 (FOIA)","NA-14021 NARA access"],
    risks:["Records may not be reconstructable","Processing 24–36 months","Removal order may issue before resolution"],
    chcAsk:"Mandate DoD/NARA to expedite Vietnam-era service record reconstruction for veteran naturalization cases",
  },
  path_records_reconstruction: {
    q:null, outcome:true,
    title:"🔴 Records Reconstruction Required",
    color:P.red,
    probability:34,
    description:"No documentation. Requires multi-agency forensic reconstruction. DCAS cross-reference + BISG + witness affidavits.",
    steps:["File FOIA with VA BIRLS for veteran flag","File FOIA with NARA for service jacket","Collect sworn affidavits from commanding officers or unit members","Use DCAS + BISG forensic match as corroborating evidence","Emergency stay of removal while reconstruction underway"],
    legislation:["INA §329","8 CFR §1003.6 (Stay of Removal)","5 USC §552"],
    risks:["Very low probability without primary records","Removal may proceed","IIRIRA retroactive risk if any criminal history"],
    chcAsk:"Emergency legislation to accept DCAS/BISG forensic match as prima facie evidence of service for naturalization",
  },
  repatriation_path: {
    q:null, outcome:true,
    title:"🏛️ Repatriation — HR.1537 / S.874 Path",
    color:P.violet,
    probability:52,
    description:"Veteran deported but eligible under Repatriate Our Patriots Act (HR.1537) and Veterans Visa and Protection Act (S.874). Active advocacy required.",
    steps:["Register with Deported Veterans Support House (DVSH)","File for Consular immigrant visa at US Embassy","Request LULAC case assignment","CHC inquiry letter to DHS","Congressional parole-in-place petition","Apply for Humanitarian Parole (Form I-131)"],
    legislation:["HR.1537 — Repatriate Our Patriots Act","S.874 — Veterans Visa and Protection Act","8 USC §1182(d)(5) Parole"],
    risks:["Bills not yet enacted","Embassy consular backlog","Country-of-origin cooperation required"],
    chcAsk:"Pass HR.1537 and S.874 in current congressional session — mandate DHS consular expedite for deported veterans",
  },
  consular_path: {
    q:null, outcome:true,
    title:"🌐 Consular Repatriation — Complex",
    color:P.blue,
    probability:40,
    description:"Non-Mexico/Latin America deportation is significantly more complex. Requires US Embassy consular intervention and bilateral coordination.",
    steps:["Contact US Embassy in current country","File I-131 Humanitarian Parole","Congressional inquiry through House Armed Services Committee","Apply for Special Immigrant Visa if applicable","LULAC international liaison coordination"],
    legislation:["HR.1537","8 USC §1182(d)(5)","INA §101(a)(15)(G)"],
    risks:["Bilateral treaty complications","No direct repatriation mechanism","Long processing times (3–5 years typical)"],
    chcAsk:"Bilateral treaty framework for deported veteran repatriation with Philippines, Korea, and Colombia",
  },
  removal_defense: {
    q:null, outcome:true,
    title:"⚖️ Active Removal Defense",
    color:P.red,
    probability:45,
    description:"Removal proceedings active. Requires immediate immigration attorney intervention and motion for stay.",
    steps:["File Emergency Motion to Reopen (EOIR Form)","Request Stay of Removal under 8 CFR §1003.6","Raise INA §329 military naturalization claim","Invoke Padilla v. Kentucky if counsel failure","Contact CHC for congressional inquiry to delay removal","File T or U visa if applicable"],
    legislation:["INA §329","8 CFR §1003.6","Padilla v. Kentucky (2010)","INA §237(a)(2)"],
    risks:["Time-critical — may have days to weeks","Judge discretion eliminated by IIRIRA","Aggravated felony = near-automatic removal"],
    chcAsk:"Moratorium on removal of veterans with honorable service pending legislative fix to IIRIRA §237",
  },
  outcome_naturalized: {
    q:null, outcome:true,
    title:"✅ Already Naturalized",
    color:P.teal,
    probability:100,
    description:"Veteran completed naturalization during service. Full citizen — no removal risk under normal circumstances.",
    steps:["Verify N-550 certificate on file","Ensure no expatriation risk","Update VA records to reflect citizen status"],
    legislation:["INA §328","INA §329"],
    risks:["Rare denaturalization risk (8 USC §1451)","Passport may need renewal"],
    chcAsk:"N/A — Highlight as successful INA §329 model for policy advocacy",
  },
  at_risk_prevention: {
    q:null, outcome:true,
    title:"🛡️ At-Risk Prevention Protocol",
    color:P.amber,
    probability:71,
    description:"No active order but IIRIRA exposure. File proactively before ICE initiates proceedings.",
    steps:["File N-400 immediately under INA §329","Request USCIS military naturalization track","Ensure no outstanding criminal warrants","Document all military service extensively","Establish LULAC and CHC case file as protective measure"],
    legislation:["INA §329","8 CFR §328.2","EO-14012"],
    risks:["ICE may initiate proceedings before USCIS acts","Processing window vs. enforcement window race"],
    chcAsk:"Mandatory immigration hold for active USCIS military naturalization applications — prevent removal during processing",
  },
  stay_of_removal: {
    q:null, outcome:true,
    title:"⏸ Stay of Removal — Emergency Filing",
    color:P.amber,
    probability:55,
    description:"Order issued but not executed. Emergency stay provides window for naturalization claim.",
    steps:["File BIA Emergency Stay (Form EOIR-43)","Simultaneously file INA §329 naturalization claim with USCIS","Request Congressional constituent services intervention","File Padilla claim if criminal conviction involved","Document military service for EOIR judge"],
    legislation:["8 CFR §1003.6","INA §329","EOIR Practice Manual §6.3"],
    risks:["Stay may be denied","30-day window from stay to removal","Judge has no discretion under IIRIRA for agg. felonies"],
    chcAsk:"Statutory stay of removal for any non-citizen veteran who invokes INA §329 naturalization claim",
  },
  padilla_claim: {
    q:null, outcome:true,
    title:"⚖️ Padilla v. Kentucky Constitutional Claim",
    color:P.violet,
    probability:38,
    description:"Padilla v. Kentucky (2010) requires criminal defense counsel to advise on deportation consequences of guilty pleas. Failure = ineffective assistance of counsel.",
    steps:["File motion to vacate conviction under Padilla","Demonstrate counsel failed to advise on immigration consequences","File with state post-conviction court","If successful — reopen immigration case","Simultaneously pursue INA §329 path"],
    legislation:["Padilla v. Kentucky, 559 U.S. 356 (2010)","6th Amendment (Strickland standard)","INA §329"],
    risks:["State courts inconsistent on retroactive application","Statute of limitations issues","Requires finding original counsel was ineffective"],
    chcAsk:"Federal legislation mandating retroactive Padilla remedy for all deported veterans whose counsel failed immigration advisement",
  },
  naturalization_denied: {
    q:null, outcome:true,
    title:"🔁 Naturalization Denial — Appeal Path",
    color:P.amber,
    probability:48,
    description:"Prior denial does not permanently bar INA §329 pathway. Reapplication with new evidence possible.",
    steps:["Request denial reasoning under 8 CFR §336.2","Appeal to USCIS Administrative Appeals Office (AAO)","If AAO denies — petition federal district court","Gather new military service documentation","File with CHC for congressional case support"],
    legislation:["INA §329","8 CFR §336.1","INA §310(c)"],
    risks:["Prior denial may weigh against","Evidence gaps same as original application","Litigation expensive and slow"],
    chcAsk:"USCIS policy guidance directing benefit-of-the-doubt standard for INA §329 military naturalization re-applications",
  },
  limited_remedies: {
    q:null, outcome:true,
    title:"🔴 Limited Remedies — Aggravated Felony",
    color:P.red,
    probability:12,
    description:"Aggravated felony conviction with full advisement creates the most difficult removal defense scenario. Very limited legal options remain.",
    steps:["Review for any categorical approach exceptions","Check Circuit-specific definitions of 'aggravated felony'","Seek CAT (Convention Against Torture) protection if applicable","Congressional private bill of relief (extremely rare)","Seek presidential pardon (extraordinary circumstances)"],
    legislation:["INA §237(a)(2)(A)(iii)","Convention Against Torture","INA §245(i)"],
    risks:["INA §237 agg. felony = mandatory removal","No judicial discretion under IIRIRA","CAT only applies if specific country-specific torture risk"],
    chcAsk:"Restore judicial discretion for immigration judges in veteran cases regardless of conviction type — repeal IIRIRA §237(a)(2)(A)(iii) mandatory removal",
  },
  post_iirira_conviction: {
    q:null, outcome:true,
    title:"🔴 Post-IIRIRA Conviction — High Risk",
    color:P.red,
    probability:25,
    description:"Post-1996 conviction with removal proceedings likely. IIRIRA applies prospectively and retroactively for aggravated felonies.",
    steps:["Assess conviction type — is it 'aggravated felony' under INA §101(a)(43)?","If not agg. felony — pursue cancellation of removal under INA §240A","File INA §329 naturalization as parallel track","Request prosecutorial discretion memo from ICE ERO","CHC formal constituent services inquiry"],
    legislation:["INA §237(a)(2)","INA §240A","INA §329"],
    risks:["Aggravated felony = no cancellation","USCIS won't naturalize during pending removal","Very narrow window"],
    chcAsk:"ICE prosecutorial discretion guidance permanently excluding honorable-service veterans from removal priority",
  },
};

// ── COMPONENT ────────────────────────────────────────────────────────────────
export default function NaturalizationSim() {
  const [history, setHistory] = useState(["start"]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const currentNodeId = history[history.length - 1];
  const currentNode = NODES[currentNodeId];

  const choose = (nextId) => setHistory(h => [...h, nextId]);
  const back = () => setHistory(h => h.length > 1 ? h.slice(0,-1) : h);
  const reset = () => { setHistory(["start"]); setAiAnalysis(null); };

  const getAIAnalysis = async () => {
    if (!currentNode?.outcome) return;
    setAiLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an immigration attorney specializing in military naturalization for the AUMER Foundation.

Outcome reached: ${currentNode.title}
Probability: ${currentNode.probability}%
Path taken: ${history.join(" → ")}
Description: ${currentNode.description}

Provide a concise legal analysis (under 200 words):
1. Immediate 3-day action plan for this veteran
2. Most likely legal obstacle
3. Specific form numbers to file first
4. One AUMER-specific data point that strengthens this case
5. CHC talking point for May 18 briefing

Be specific, actionable, and legally precise.`,
      model:"claude_sonnet_4_6",
    });
    setAiAnalysis(res);
    setAiLoading(false);
  };

  const breadcrumb = history.map(id => {
    const n = NODES[id];
    return n?.title || id.replace(/_/g," ").toUpperCase();
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12, flexWrap:"wrap" }}>
        <div>
          <div style={{ fontSize:12, fontWeight:800, color:P.t1 }}>
            🗺️ Naturalization <span style={{ color:P.violet }}>Path Simulator</span>
          </div>
          <div style={{ fontSize:7, color:P.t4, letterSpacing:2 }}>
            INTERACTIVE DECISION TREE · INA §329 · IIRIRA · VETERAN IMMIGRATION LAW
          </div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
          <button onClick={back} disabled={history.length <= 1}
            style={{ padding:"5px 12px", fontSize:8, background:"transparent",
              border:`1px solid ${history.length>1?P.blue:P.b}`, color:history.length>1?P.blue:P.t4,
              borderRadius:7, cursor:history.length>1?"pointer":"not-allowed" }}>← Back</button>
          <button onClick={reset}
            style={{ padding:"5px 12px", fontSize:8, background:`${P.red}12`,
              border:`1px solid ${P.red}30`, color:P.red, borderRadius:7, cursor:"pointer" }}>⟳ Restart</button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:12, alignItems:"center" }}>
        {breadcrumb.map((b,i)=>(
          <span key={i} style={{ display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ fontSize:6, color:i===breadcrumb.length-1?P.gold:P.t4,
              background:i===breadcrumb.length-1?`${P.gold}12`:"transparent",
              border:`1px solid ${i===breadcrumb.length-1?P.gold+"30":"transparent"}`,
              borderRadius:20, padding:"1px 7px" }}>{b}</span>
            {i < breadcrumb.length-1 && <span style={{ fontSize:7, color:P.b }}>→</span>}
          </span>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:12 }}>
        {/* Main decision area */}
        <div>
          {currentNode?.outcome ? (
            // Outcome node
            <div style={{ background:P.card, border:`2px solid ${currentNode.color}40`,
              borderTop:`4px solid ${currentNode.color}`, borderRadius:12, padding:"16px 18px" }}>
              <div style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:10 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:800, color:currentNode.color, marginBottom:4 }}>
                    {currentNode.title}
                  </div>
                  <div style={{ fontSize:9, color:P.t2, lineHeight:1.8, marginBottom:10 }}>
                    {currentNode.description}
                  </div>
                </div>
                <div style={{ textAlign:"center", padding:"8px 14px", background:`${currentNode.color}12`,
                  border:`1px solid ${currentNode.color}25`, borderRadius:9, flexShrink:0 }}>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:24, fontWeight:800, color:currentNode.color, lineHeight:1 }}>
                    {currentNode.probability}%
                  </div>
                  <div style={{ fontSize:7, color:P.t4 }}>success probability</div>
                </div>
              </div>

              {/* Steps */}
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:6 }}>ACTION STEPS</div>
                {currentNode.steps.map((step,i)=>(
                  <div key={i} style={{ display:"flex", gap:8, marginBottom:5 }}>
                    <div style={{ width:18, height:18, borderRadius:"50%", background:`${currentNode.color}20`,
                      border:`1px solid ${currentNode.color}30`, color:currentNode.color,
                      fontSize:7, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      {i+1}
                    </div>
                    <span style={{ fontSize:8, color:P.t2, lineHeight:1.6 }}>{step}</span>
                  </div>
                ))}
              </div>

              {/* Legislation + Risks */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
                <div style={{ background:"#080D18", borderRadius:8, padding:"8px 10px" }}>
                  <div style={{ fontSize:6, color:P.t4, letterSpacing:2, marginBottom:5 }}>LEGAL BASIS</div>
                  {currentNode.legislation.map((l,i)=>(
                    <div key={i} style={{ fontSize:7, color:P.blue, marginBottom:3 }}>⚖️ {l}</div>
                  ))}
                </div>
                <div style={{ background:"#080D18", borderRadius:8, padding:"8px 10px" }}>
                  <div style={{ fontSize:6, color:P.t4, letterSpacing:2, marginBottom:5 }}>RISKS</div>
                  {currentNode.risks.map((r,i)=>(
                    <div key={i} style={{ fontSize:7, color:P.red, marginBottom:3 }}>⚠ {r}</div>
                  ))}
                </div>
              </div>

              {/* CHC Ask */}
              <div style={{ padding:"8px 12px", background:`${P.gold}10`, border:`1px solid ${P.gold}20`, borderRadius:8, marginBottom:10 }}>
                <div style={{ fontSize:6, color:P.gold, fontWeight:700, letterSpacing:2, marginBottom:3 }}>🏛️ CHC ASK (May 18 Brief)</div>
                <div style={{ fontSize:8, color:P.t2, fontStyle:"italic" }}>{currentNode.chcAsk}</div>
              </div>

              {/* AI Analysis */}
              <button onClick={getAIAnalysis} disabled={aiLoading}
                style={{ width:"100%", padding:"9px", background:aiLoading?P.b:`linear-gradient(135deg,${P.violet},${P.blue})`,
                  color:aiLoading?P.t4:"#fff", border:"none", borderRadius:8, fontSize:10, fontWeight:800,
                  cursor:aiLoading?"not-allowed":"pointer" }}>
                {aiLoading?"⟳ Analyzing...":"✨ Get AI Legal Analysis"}
              </button>
              {aiAnalysis && (
                <div style={{ marginTop:8, padding:"10px 12px", background:`${P.violet}08`,
                  border:`1px solid ${P.violet}20`, borderRadius:8, fontSize:8, color:P.t2,
                  lineHeight:1.9, whiteSpace:"pre-wrap", maxHeight:250, overflowY:"auto" }}>
                  {aiAnalysis}
                </div>
              )}
            </div>
          ) : (
            // Question node
            <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:12, padding:"16px 18px" }}>
              <div style={{ fontSize:13, fontWeight:800, color:P.t1, marginBottom:4 }}>
                {currentNode?.q}
              </div>
              <div style={{ fontSize:7, color:P.t4, marginBottom:14 }}>
                Select the option that best matches the veteran's situation
              </div>
              {currentNode?.choices.map((choice,i)=>(
                <button key={i} onClick={()=>choose(choice.next)}
                  style={{ display:"block", width:"100%", textAlign:"left", marginBottom:8,
                    padding:"12px 16px", background:"#080D18",
                    border:`1px solid ${P.b}40`, borderRadius:9,
                    color:P.t1, fontSize:10, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace",
                    transition:"all .12s" }}
                  onMouseEnter={e=>{ e.target.style.borderColor=P.gold+"60"; e.target.style.background=`${P.gold}08`; }}
                  onMouseLeave={e=>{ e.target.style.borderColor=P.b+"40"; e.target.style.background="#080D18"; }}>
                  <span style={{ color:P.gold, marginRight:8 }}>{["A","B","C"][i]}.</span>
                  {choice.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar — stats + case examples */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {/* Progress */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"10px 12px" }}>
            <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:6 }}>SIMULATION PROGRESS</div>
            {[
              ["Decisions Made", history.length-1, P.blue],
              ["Depth", history.length, P.violet],
              ["Node", currentNodeId.replace(/_/g," ").slice(0,18), P.t3],
              ["Outcome", currentNode?.outcome?"REACHED":"In Progress", currentNode?.outcome?P.teal:P.amber],
            ].map(([k,v,c])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:7,
                padding:"3px 0", borderBottom:`1px solid ${P.b}20` }}>
                <span style={{ color:P.t4 }}>{k}</span>
                <span style={{ color:c, fontWeight:700 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Law reference */}
          <div style={{ background:P.card, border:`1px solid ${P.blue}20`, borderRadius:10, padding:"10px 12px" }}>
            <div style={{ fontSize:7, color:P.blue, fontWeight:700, letterSpacing:2, marginBottom:6 }}>KEY LAWS</div>
            {[
              ["INA §329","Wartime naturalization — direct military path"],
              ["IIRIRA §237","1996 retroactive removal — AUMER core issue"],
              ["INA §240A","Cancellation of removal — 10yr + good moral"],
              ["Padilla (2010)","Counsel must advise deportation consequences"],
              ["HR.1537","Repatriate Our Patriots Act (pending)"],
              ["S.874","Veterans Visa and Protection Act (pending)"],
            ].map(([law,desc])=>(
              <div key={law} style={{ marginBottom:6, paddingBottom:5, borderBottom:`1px solid ${P.b}15` }}>
                <div style={{ fontSize:8, fontWeight:700, color:P.blue }}>{law}</div>
                <div style={{ fontSize:6, color:P.t4, lineHeight:1.4 }}>{desc}</div>
              </div>
            ))}
          </div>

          {/* Active cases */}
          <div style={{ background:P.card, border:`1px solid ${P.gold}20`, borderRadius:10, padding:"10px 12px" }}>
            <div style={{ fontSize:7, color:P.gold, fontWeight:700, letterSpacing:2, marginBottom:6 }}>ACTIVE CASES</div>
            {[
              ["C004 Park", "Self-deported 2025", P.red, "repatriation_path"],
              ["C001 Ramos", "Vietnam MOH", P.teal, "path_ina329_strong"],
              ["C002 Valenzuela M.", "TJ Shelter", P.amber, "repatriation_path"],
            ].map(([name, note, c, path])=>(
              <button key={name} onClick={()=>{ setHistory(["start",path]); setAiAnalysis(null); }}
                style={{ display:"block", width:"100%", textAlign:"left", padding:"5px 8px",
                  background:"#080D18", border:`1px solid ${c}20`, borderRadius:6,
                  cursor:"pointer", marginBottom:5 }}>
                <div style={{ fontSize:8, fontWeight:700, color:c }}>{name}</div>
                <div style={{ fontSize:6, color:P.t4 }}>{note} → jump to outcome</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}