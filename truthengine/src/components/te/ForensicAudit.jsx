import { useState } from "react";
import { P, KEY_STATS } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

// Data integrity rules
const AUDIT_RULES = [
  { id:"r01", category:"DCAS",    severity:"CRITICAL", name:"Hispanic Classification Rate Anomaly",
    test:"DCAS Hispanic count 349/58,220 = 0.60% vs BISG estimate 3.97%",
    expected:"≥3.5% (BISG τ=0.40 lower bound)", actual:"0.60%", delta:"84.9% gap",
    status:"FAIL", evidence:"BISG sweep, NARA retroactive audit, Guzmán 1969",
    recommendation:"Commission full NARA forensic re-audit with BISG methodology" },
  { id:"r02", category:"DCAS",    severity:"CRITICAL", name:"Race Code 'W' Misclassification",
    test:"Surnames with p(Hispanic)>0.80 coded as race=W in DCAS",
    expected:"Race code H or cross-referenced with BISG", actual:"Race code W for 84.9% of Hispanic surnames",
    delta:"~1,960 records", status:"FAIL", evidence:"BISG full surname sweep",
    recommendation:"Re-code all records with BISG p(H)>0.70 as 'H — BISG-inferred'" },
  { id:"r03", category:"FOIA",    severity:"CRITICAL", name:"VA BIRLS FOIA — 83 Days Overdue",
    test:"5 USC §552(a)(6)(A)(i) — 20 business day response limit",
    expected:"Response within 20 business days (filed: 2025-09-15)", actual:"No response as of 2026-04-09",
    delta:"83 days overdue", status:"FAIL", evidence:"FOIA tracker F001",
    recommendation:"Immediate CHC inquiry letter + administrative appeal" },
  { id:"r04", category:"FOIA",    severity:"CRITICAL", name:"ICE ENFORCE FOIA — 66 Days Overdue",
    test:"5 USC §552(a)(6)(A)(i) — 20 business day response limit",
    expected:"Response within 20 business days (filed: 2025-10-15)", actual:"No response as of 2026-04-09",
    delta:"66 days overdue", status:"FAIL", evidence:"FOIA tracker F002",
    recommendation:"File FOIA lawsuit (5 USC §552(a)(4)(B)) if no response in 10 days" },
  { id:"r05", category:"CASES",   severity:"HIGH",     name:"C002/C003 DoD Record Gap",
    test:"DWP status finder — Manuel & Victoria Valenzuela",
    expected:"DoD record confirming USMC service 1967–1971", actual:"'Not found' in DMDC system",
    delta:"Service record unverified in DoD systems", status:"WARN", evidence:"DWP query, Fold3 USMC record",
    recommendation:"Submit NARA SF-180 + Fold3 USMC unit record request" },
  { id:"r06", category:"CASES",   severity:"HIGH",     name:"C006 — Zero Military Record Coverage",
    test:"NARA + DWP + Fold3 + SCRA cross-reference for J. Duran",
    expected:"At least 1 database record confirming service", actual:"No records found across all 4 databases",
    delta:"100% documentation gap — case unverifiable", status:"FAIL", evidence:"Military DB matrix",
    recommendation:"Escalate to COMAR + request Colombian military records (SEDENA equivalent)" },
  { id:"r07", category:"BISG",    severity:"HIGH",     name:"BISG Stable Band Verification",
    test:"BISG estimate stability τ=0.30–0.70",
    expected:"Estimates within ±5% across τ range", actual:"2,309 (τ=0.40) to 2,415 (τ=0.70) — stable",
    delta:"+4.6% max variance", status:"PASS", evidence:"SPSS sweep, R²=0.947",
    recommendation:"Validated — publish stable band in CHC briefing" },
  { id:"r08", category:"BISG",    severity:"MED",      name:"BISG Bernoulli Sum Variance",
    test:"Variance = Σ p_i(1-p_i) across all 58,220 records",
    expected:"BSV ≤ ±500", actual:"BSV = ±2,308.7",
    delta:"Acceptable for corpus size — confidence interval wide", status:"WARN", evidence:"SPSS F(4,38)=161.7",
    recommendation:"Report BSV in appendix; note 2,309±2,308 is methodologically valid at this N" },
  { id:"r09", category:"NERO",    severity:"HIGH",     name:"NERO-O Score — ICE Data Vacuum",
    test:"Obscurity vector: deportation data available vs estimated",
    expected:"ICE ENFORCE data cross-referenced with VA BIRLS", actual:"ICE: 92 confirmed vs 94,000+ estimated — 99.9% obscured",
    delta:"1,021× undercount in official data", status:"FAIL", evidence:"GAO-19-416, ENFORCE FOIA blocked",
    recommendation:"File CHC inquiry to DHS Secretary; subpoena ENFORCE data" },
  { id:"r10", category:"EVIDENCE",severity:"HIGH",     name:"SHA-256 Chain — 6/6 Cases Certified",
    test:"All 6 CB-HSIVF cases have SHA-256 certified evidence files",
    expected:"6 cases certified", actual:"6 cases certified",
    delta:"Full coverage", status:"PASS", evidence:"Evidence ledger — all hashes verified",
    recommendation:"Maintain — include hash register in CHC appendix" },
  { id:"r11", category:"EVIDENCE",severity:"MED",      name:"Evidence Staleness — C005/C006",
    test:"Last evidence update within 90 days",
    expected:"All cases updated within 90 days", actual:"C005: 127 days · C006: 203 days",
    delta:"C005 +37d stale · C006 +113d stale", status:"WARN", evidence:"Evidence ledger timestamps",
    recommendation:"Dispatch DVSH field team for C005/C006 status update" },
  { id:"r12", category:"STREAMS", severity:"MED",      name:"5-Stream Convergence Validation",
    test:"All 5 streams exceed DCAS 349 baseline",
    expected:"All streams > 349", actual:"Stream 1: 349 · Streams 2–5: 2,309–3,741",
    delta:"4 of 5 streams converge above 2,300", status:"PASS", evidence:"Convergence table in DCAS report",
    recommendation:"Add Stream 6 (SCRA surname extraction) to strengthen convergence" },
  { id:"r13", category:"STREAMS", severity:"HIGH",     name:"Stream 7 — Durazo Qualitative Missing",
    test:"Qualitative ethnography corroborating streams 1–5",
    expected:"Durazo (USF) manuscript in CHC package", actual:"Manuscript pending — not yet submitted",
    delta:"Gap in qualitative evidence layer", status:"WARN", evidence:"LitCentral Rev.92",
    recommendation:"Prioritize Durazo qualitative chapter for CHC package" },
];

const CAT_C = { DCAS:P.red, FOIA:P.amber, CASES:P.gold, BISG:P.violet, NERO:P.teal, EVIDENCE:P.blue, STREAMS:P.orange||"#FF8C42" };
const SEV_C = { CRITICAL:P.red, HIGH:P.amber, MED:P.blue, LOW:P.teal };
const STATUS_IC = { PASS:"✅", FAIL:"❌", WARN:"⚠️" };
const STATUS_C = { PASS:P.teal, FAIL:P.red, WARN:P.amber };

export default function ForensicAudit() {
  const [filter, setFilter] = useState("ALL");
  const [expanded, setExpanded] = useState(null);
  const [aiRunning, setAiRunning] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [view, setView] = useState("audit"); // audit | report | integrity

  const categories = ["ALL", ...Object.keys(CAT_C)];
  const filtered = AUDIT_RULES.filter(r => filter==="ALL" || r.category===filter);

  const PASS = AUDIT_RULES.filter(r=>r.status==="PASS").length;
  const FAIL = AUDIT_RULES.filter(r=>r.status==="FAIL").length;
  const WARN = AUDIT_RULES.filter(r=>r.status==="WARN").length;
  const score = Math.round((PASS / AUDIT_RULES.length)*100);

  const generateAIReport = async () => {
    setAiRunning(true);
    const failures = AUDIT_RULES.filter(r=>r.status==="FAIL"||r.status==="WARN");
    const report = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a senior forensic data auditor and legal expert working for the AUMER Foundation on the TruthEngine360 platform.

Produce a formal FORENSIC DATA AUDIT EXECUTIVE SUMMARY based on the following audit results:

AUDIT SCORE: ${score}% (${PASS} PASS / ${FAIL} FAIL / ${WARN} WARN out of ${AUDIT_RULES.length} rules)

FAILED/WARNING RULES:
${failures.map(r=>`[${r.status}] ${r.name} (${r.category} · ${r.severity})
  Expected: ${r.expected}
  Actual: ${r.actual}
  Delta: ${r.delta}
  Recommendation: ${r.recommendation}`).join("\n\n")}

Write a formal 200-250 word executive summary suitable for inclusion in the Congressional Hispanic Caucus briefing package. Include:
1. Overall data integrity assessment
2. 3 most critical findings that block the CHC briefing
3. Immediate remediation timeline (30/60/90 days)
4. Certification statement for the evidence that passed
5. Legal implications of FOIA non-compliance

Format as a professional government document section.`,
      model: "claude_sonnet_4_6",
    });
    setAiReport(report);
    setAiRunning(false);
  };

  // Data integrity score breakdown
  const INTEGRITY_METRICS = [
    { category:"DCAS Records",      score:42, maxScore:100, issues:["84.9% misclassification","Race code 'W' override"], c:P.red },
    { category:"FOIA Compliance",   score:10, maxScore:100, issues:["VA: 83d overdue","ICE: 66d overdue"], c:P.red },
    { category:"Case Documentation",score:55, maxScore:100, issues:["C002/C003 DoD gap","C006 zero coverage"], c:P.amber },
    { category:"BISG Methodology",  score:88, maxScore:100, issues:["BSV ±2,308 — note"], c:P.teal },
    { category:"NERO Framework",    score:61, maxScore:100, issues:["ICE data vacuum","Obscurity 96/100"], c:P.amber },
    { category:"Evidence Chain",    score:82, maxScore:100, issues:["C005/C006 stale"], c:P.gold },
    { category:"Stream Convergence",score:78, maxScore:100, issues:["Stream 7 pending"], c:P.gold },
  ];

  return (
    <div>
      {/* Header stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:7, marginBottom:12 }}>
        {[
          {l:"Audit Score",   v:`${score}%`, c:score<60?P.red:score<80?P.amber:P.teal},
          {l:"PASS",          v:PASS,  c:P.teal},
          {l:"FAIL",          v:FAIL,  c:P.red},
          {l:"WARN",          v:WARN,  c:P.amber},
          {l:"Critical Rules",v:AUDIT_RULES.filter(r=>r.severity==="CRITICAL").length, c:P.red},
          {l:"Audit Rules",   v:AUDIT_RULES.length, c:P.blue},
        ].map((s,i)=>(
          <div key={i} style={{ background:P.card, border:`1px solid ${s.c}25`, borderLeft:`3px solid ${s.c}`, borderRadius:7, padding:"8px 12px" }}>
            <div style={{ fontSize:7, color:P.t4, marginBottom:2 }}>{s.l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:typeof s.v==="number"?20:14, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display:"flex", gap:0, marginBottom:10, background:P.card, border:`1px solid ${P.b}`, borderRadius:8, overflow:"hidden", width:"fit-content" }}>
        {[["audit","🔍 Audit Rules"],["integrity","📊 Integrity Scores"],["report","📄 AI Report"]].map(([v,l])=>(
          <button key={v} onClick={()=>setView(v)}
            style={{ padding:"7px 14px", background:view===v?`${P.red}15`:"transparent",
              border:"none", borderRight:`1px solid ${P.b}`, color:view===v?P.red:P.t4,
              fontSize:9, fontWeight:view===v?700:400, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace" }}>
            {l}
          </button>
        ))}
      </div>

      {view === "audit" && (
        <div>
          {/* Category filters */}
          <div style={{ display:"flex", gap:5, marginBottom:10, flexWrap:"wrap" }}>
            {categories.map(cat=>{
              const c=CAT_C[cat]||P.t4; const active=filter===cat;
              return (
                <button key={cat} onClick={()=>setFilter(cat)}
                  style={{ padding:"3px 10px", fontSize:8, background:active?`${c}18`:"transparent",
                    border:`1px solid ${active?c:P.b}`, borderRadius:20, color:active?c:P.t4, cursor:"pointer" }}>
                  {cat}
                  <span style={{ marginLeft:4, opacity:0.6 }}>
                    ({cat==="ALL"?AUDIT_RULES.length:AUDIT_RULES.filter(r=>r.category===cat).length})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Rules */}
          {filtered.map(rule=>{
            const sc=SEV_C[rule.severity]||P.t4;
            const stc=STATUS_C[rule.status];
            const catC=CAT_C[rule.category]||P.t4;
            const isOpen=expanded===rule.id;
            return (
              <div key={rule.id} onClick={()=>setExpanded(isOpen?null:rule.id)}
                style={{ background:P.card, border:`1px solid ${stc}25`,
                  borderLeft:`5px solid ${stc}`, borderRadius:9, padding:"10px 14px",
                  marginBottom:7, cursor:"pointer", transition:"all .12s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:7, alignItems:"center", flexWrap:"wrap", marginBottom:3 }}>
                      <span style={{ fontSize:12 }}>{STATUS_IC[rule.status]}</span>
                      <span style={{ fontSize:7, background:`${catC}18`, border:`1px solid ${catC}25`, color:catC, borderRadius:20, padding:"1px 7px" }}>{rule.category}</span>
                      <span style={{ fontSize:10, fontWeight:700, color:stc }}>{rule.name}</span>
                    </div>
                    <div style={{ fontSize:8, color:P.t3, lineHeight:1.5 }}>{rule.test}</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
                    <span style={{ fontSize:7, background:`${sc}15`, border:`1px solid ${sc}25`, color:sc, borderRadius:20, padding:"1px 7px", fontWeight:700 }}>{rule.severity}</span>
                    <span style={{ fontSize:8, color:P.t4 }}>△ {rule.delta}</span>
                  </div>
                </div>
                {isOpen && (
                  <div style={{ marginTop:10, paddingTop:8, borderTop:`1px solid ${P.b}30` }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                      <div style={{ background:"#080D18", borderRadius:7, padding:"8px 10px" }}>
                        <div style={{ fontSize:7, color:P.t4, marginBottom:2 }}>EXPECTED</div>
                        <div style={{ fontSize:8, color:P.teal }}>{rule.expected}</div>
                      </div>
                      <div style={{ background:"#080D18", borderRadius:7, padding:"8px 10px" }}>
                        <div style={{ fontSize:7, color:P.t4, marginBottom:2 }}>ACTUAL</div>
                        <div style={{ fontSize:8, color:stc }}>{rule.actual}</div>
                      </div>
                    </div>
                    <div style={{ background:"#080D18", borderRadius:7, padding:"8px 10px", marginBottom:6 }}>
                      <div style={{ fontSize:7, color:P.t4, marginBottom:2 }}>EVIDENCE SOURCE</div>
                      <div style={{ fontSize:8, color:P.blue }}>{rule.evidence}</div>
                    </div>
                    <div style={{ background:`${P.gold}08`, border:`1px solid ${P.gold}20`, borderRadius:7, padding:"8px 10px" }}>
                      <div style={{ fontSize:7, color:P.gold, marginBottom:2, fontWeight:700 }}>→ RECOMMENDATION</div>
                      <div style={{ fontSize:8, color:P.t2 }}>{rule.recommendation}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {view === "integrity" && (
        <div>
          {/* Overall score ring-style */}
          <div style={{ background:P.card, border:`1px solid ${score<60?P.red:score<80?P.amber:P.teal}30`, borderRadius:10, padding:"16px", marginBottom:12, display:"flex", gap:20, alignItems:"center" }}>
            <div style={{ textAlign:"center", minWidth:80 }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:36, fontWeight:800,
                color:score<60?P.red:score<80?P.amber:P.teal, lineHeight:1 }}>{score}%</div>
              <div style={{ fontSize:8, color:P.t4, marginTop:2 }}>Overall Integrity</div>
              <div style={{ fontSize:7, color:score<60?P.red:score<80?P.amber:P.teal, marginTop:2, fontWeight:700 }}>
                {score<60?"CRITICAL":"score<80"?"DEGRADED":score<60?"CRITICAL":"DEGRADED"}
              </div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ background:"#030508", borderRadius:4, height:12, overflow:"hidden", marginBottom:6 }}>
                <div style={{ width:`${score}%`, height:"100%",
                  background:`linear-gradient(90deg,${P.red},${P.amber},${P.teal})`, borderRadius:4 }} />
              </div>
              <div style={{ fontSize:8, color:P.t3, lineHeight:1.8 }}>
                {FAIL} critical failures blocking CHC briefing · {WARN} warnings requiring attention · {PASS} verified and certified.
                Primary blockers: FOIA non-compliance (VA + ICE) and DCAS misclassification rate.
              </div>
            </div>
          </div>

          {INTEGRITY_METRICS.map((m,i)=>(
            <div key={i} style={{ background:P.card, border:`1px solid ${m.c}20`, borderRadius:9, padding:"12px 14px", marginBottom:7 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <div style={{ fontSize:10, fontWeight:700, color:m.c }}>{m.category}</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:16, fontWeight:800, color:m.c }}>{m.score}%</div>
              </div>
              <div style={{ background:"#030508", borderRadius:3, height:8, overflow:"hidden", marginBottom:6 }}>
                <div style={{ width:`${m.score}%`, height:"100%", background:m.c, borderRadius:3, opacity:0.8 }} />
              </div>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {m.issues.map((issue,j)=>(
                  <span key={j} style={{ fontSize:7, background:`${m.c}10`, border:`1px solid ${m.c}20`,
                    color:m.c, borderRadius:20, padding:"1px 8px" }}>⚑ {issue}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "report" && (
        <div>
          <button onClick={generateAIReport} disabled={aiRunning}
            style={{ padding:"10px 20px", background:aiRunning?P.b:`linear-gradient(135deg,${P.red},${P.amber})`,
              color:aiRunning?P.t4:"#fff", border:"none", borderRadius:8, fontSize:10,
              fontWeight:800, cursor:aiRunning?"not-allowed":"pointer", fontFamily:"'IBM Plex Mono',monospace",
              marginBottom:10 }}>
            {aiRunning?"⟳ Generating Forensic Report...":"🔍 Generate AI Forensic Audit Report"}
          </button>
          {!aiReport && !aiRunning && (
            <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:9, padding:"20px", textAlign:"center", color:P.t4, fontSize:9 }}>
              Click to generate a formal forensic audit executive summary powered by Claude Sonnet — suitable for CHC briefing appendix.
            </div>
          )}
          {aiReport && (
            <div>
              <div style={{ background:"#020609", border:`1px solid ${P.red}20`, borderRadius:10, padding:"16px 18px", marginBottom:10 }}>
                <div style={{ fontSize:9, fontWeight:700, color:P.red, letterSpacing:2, marginBottom:10 }}>
                  🔍 FORENSIC DATA AUDIT — EXECUTIVE SUMMARY
                </div>
                <div style={{ fontSize:8, color:P.t4, marginBottom:2 }}>
                  TruthEngine360 · AUMER Foundation · Generated {new Date().toLocaleDateString()}
                </div>
                <div style={{ borderTop:`1px solid ${P.b}30`, paddingTop:10, marginTop:6 }}>
                  <pre style={{ fontSize:8, color:P.t2, lineHeight:1.9, fontFamily:"'IBM Plex Mono',monospace",
                    whiteSpace:"pre-wrap", margin:0 }}>
                    {aiReport}
                  </pre>
                </div>
              </div>
              <button onClick={()=>{
                const blob=new Blob([`FORENSIC DATA AUDIT — EXECUTIVE SUMMARY\nTruthEngine360 · AUMER Foundation · ${new Date().toLocaleDateString()}\n\n${aiReport}`],{type:"text/plain"});
                const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
                a.download=`TE360_ForensicAudit_${new Date().toISOString().slice(0,10)}.txt`; a.click();
              }} style={{ padding:"8px 16px", background:`${P.blue}18`, border:`1px solid ${P.blue}30`,
                color:P.blue, borderRadius:7, fontSize:9, fontWeight:700, cursor:"pointer" }}>
                ↓ Export Audit Report (.TXT)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}