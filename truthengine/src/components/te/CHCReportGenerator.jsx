import { useState } from "react";
import { P, CASES, KEY_STATS, FOIA_REQUESTS } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

const CHC_DATE = new Date("2026-05-18");
const chcDays = Math.ceil((CHC_DATE - new Date()) / 86400000);

const SECTIONS = [
  {
    id:"cover", label:"Cover Page & Classification", icon:"📄", required:true,
    desc:"Official header, classification, distribution list, briefing date",
  },
  {
    id:"executive", label:"Executive Summary", icon:"📋", required:true,
    desc:"2-page summary: DCAS anomaly, 6 cases, NERO scores, 3 asks",
    prompt:`Write a 2-page executive summary for a Congressional Hispanic Caucus briefing dated May 18, 2026. 

Key facts to include:
- DCAS recorded only 349 Hispanic casualties out of 58,220 Vietnam War records (0.60%)
- BISG forensic estimate at τ=0.40: 2,309+ (3.97%) — 84.9% classification failure, ~1,960 erased veterans
- 5-stream convergence: all independent estimates exceed 349 by 6.6× minimum
- NERO scores: N=94, E=97, R=91, O=96 (institutional erasure framework)
- 6 CB-HSIVF verified cases with SHA-256 chain of custody
- Most urgent: Sae Joon Park — Korean-born USMC veteran, self-deported Nov/Dec 2025
- 2 FOIA requests 83 and 66 days overdue at VA and DHS/ICE
- 115,000 non-citizen veterans at risk in the US today
- CHC briefing date: May 18, 2026

Write in formal congressional briefing style. Use specific numbers. Begin with the most alarming finding.`,
  },
  {
    id:"dcas", label:"DCAS Forensic Analysis", icon:"💀", required:true,
    desc:"Full statistical breakdown: BISG, 5-stream convergence, SPSS validation",
    prompt:`Write the DCAS Forensic Analysis section for a Congressional Hispanic Caucus briefing. This is the core statistical exhibit.

Include:
1. DATABASE OVERVIEW: DCAS Vietnam Conflict Extract File — 58,220 records, official source
2. THE ANOMALY: 349 Hispanic-coded (0.60%) vs US Hispanic Vietnam-era population of ~4.5%
3. BISG METHODOLOGY: Bayesian Improved Surname Geocoding at τ=0.40, stable band τ=0.30–0.70
4. 5-STREAM CONVERGENCE TABLE:
   - Stream 1 (DCAS Official): 349 (0.60%) — ANOMALOUS BASELINE
   - Stream 2 (BISG τ=0.40): 2,309 (3.97%) — FORENSIC ESTIMATE  
   - Stream 3 (NARA Retroactive): 3,070 (5.27%) — ARCHIVAL
   - Stream 4 (Guzmán 1969 study): 3,500 (6.01%) — HISTORICAL
   - Stream 5 (LAE Database): 3,741 (6.43%) — COMMUNITY
5. STATISTICAL VALIDATION: SPSS R²=0.947, F(4,38)=161.7, p<0.001
6. FAILURE METRICS: 84.9% classification failure rate, ~1,960 missing veterans, 6.6× undercount factor
7. SIGNIFICANCE: These are not estimates — they are forensically validated through independent convergence

Write in precise, data-driven congressional briefing language. Tables and bullet points are appropriate.`,
  },
  {
    id:"cases", label:"6 Verified Case Summaries", icon:"🎖️", required:true,
    desc:"All 6 CB-HSIVF cases: service records, deportation orders, SHA-256 chain",
    prompt:`Write case summaries for all 6 CB-HSIVF verified veteran cases for a Congressional Hispanic Caucus briefing.

C001 — SGT George Ramos: Vietnam, Medal of Honor (posthumous), Army, died 1969-05-14, DCAS coded 'White' despite Hispanic surname — core forensic exhibit, Gold tier, 98% confidence
C002 — M. Valenzuela: USMC, Vietnam, honorable discharge 1975, currently at Casa del Migrante Tijuana, IIRIRA 1996 retroactive application to pre-1996 offense, Blue tier, 85% confidence  
C003 — V. Valenzuela: USMC, Vietnam, honorable discharge 1977, brother of M. Valenzuela, also at Casa del Migrante TJ, same legal trajectory, 82% confidence
C004 — Sae Joon Park: MOST URGENT — Korean-born USMC, honorable discharge 1998, Somalia + Haiti deployments, naturalization DENIED (N-400 denied 2020, USCIS failed to apply INA §329 military exception), self-deported Nov/Dec 2025 under ICE order, currently in Seoul, 94% confidence
C005 — Miguel Segura: Army SIGINT, Fort Huachuca, currently Nogales Albergue, Silver tier, 79% confidence, F004 NARA pending
C006 — J. Duran: Army, honorable discharge 1991, currently Bogotá Colombia, Bronze tier, 76% confidence, F005 DoD DMDC 25 days overdue

All cases: SHA-256 chain of custody certified. All filed and pending or denied naturalization. All deportation under IIRIRA 1996.

Write as professional case summaries with human detail and legal precision. Emphasize the Sae Joon Park case as the most urgent.`,
  },
  {
    id:"nero", label:"NERO Institutional Scores", icon:"⚠️", required:true,
    desc:"N=94, E=97, R=91, O=96 — institutional erasure framework for CHC",
    prompt:`Write the NERO Institutional Erasure Score analysis for a Congressional Hispanic Caucus briefing.

NERO is a 4-vector model quantifying how US institutions systematically erased Hispanic veterans from records and benefits:

N — NOTIFICATION (94/100): The citizenship promise made during Vietnam-era military recruitment was never formalized. Veterans were never notified that honorable service did not confer membership. ICE Directive 10039.2 (2022) arrived 26 years after IIRIRA. There was no advance notice that minor pre-1996 convictions would later trigger permanent deportation.

E — ERASURE (97/100): The DCAS 84.9% misclassification is not administrative error — it reflects institutional ambiguity about Hispanic veteran identity. The same ambiguity that allowed misclassification also allows deportation to be statistically invisible. DCAS 349 is the forensic fingerprint of this erasure.

R — RESTRICTION (91/100): Post-deportation, veterans cannot access VA benefits from abroad. Perceived illegality post-service restricts healthcare, naturalization (72% drop in military naturalization applications FY2017–FY2018), and due process rights. IIRIRA stripped immigration judges of discretionary authority to consider veteran status.

O — OBSCURITY (96/100): ICE confirmed only 92 deported veterans (GAO, 2013–2018) vs advocacy estimate of 94,000+. The BI-2 Estimation Vacuum: ambiguous membership creates a data desert where deportation is statistically invisible. ENFORCE FOIA (F002) has been blocked 66 days.

Write in compelling, data-driven language that will move congressional members to act. Include specific examples.`,
  },
  {
    id:"foia", label:"FOIA Status & Data Gaps", icon:"📋", required:false,
    desc:"5 FOIA requests, overdue status, data gaps blocking CHC package",
    prompt:`Write the FOIA Status section for a Congressional Hispanic Caucus briefing.

ACTIVE FOIA REQUESTS:
F001: VA BIRLS — filed 2025-09-15 — 83 DAYS OVERDUE — contact: 1-877-750-3639 / vacofoiaservice@va.gov — CHC BLOCKER
F002: DHS/ICE ENFORCE — filed 2025-10-15 — 66 DAYS OVERDUE — contact: foia.ice@dhs.gov — CHC BLOCKER  
F003: INAI México / COMAR — filed 2025-11-01 — pending — diplomatic channel
F004: NARA 1960s Surname File — filed 2026-01-20 — extension granted — BISG calibration blocker
F005: DoD DMDC Non-Citizen Records — filed 2026-02-15 — 25 DAYS OVERDUE — dmdc.foia@mail.mil

DATA GAPS CAUSED BY F001 + F002:
- Cannot confirm veteran status of 2+ cases via official VA records
- Cannot document ICE deportation of veterans against official ENFORCE database
- Chapters 18 & 31 of manuscript have placeholder gaps
- DCAS crosswalk with ENFORCE impossible without F002 data

What the CHC can do: Direct the VA Secretary and DHS Secretary to respond within 10 business days. Issue formal congressional inquiry letters.

Write in a tone that conveys urgency and communicates clearly what the agencies have done wrong and what Congress must do.`,
  },
  {
    id:"legislative", label:"Legislative Asks", icon:"⚖️", required:true,
    desc:"6 specific asks: FOIA, S.874, HR.1537, interagency flag, IIRIRA repeal, DCAS audit",
    prompt:`Write the 6 specific Legislative Asks for the Congressional Hispanic Caucus briefing dated May 18, 2026.

Include these specific asks with full statutory citations and action steps:

1. EXPEDITE FOIA RESPONSES (Immediate): Direct VA Secretary and DHS Secretary to produce F001 (83d overdue, VA BIRLS) and F002 (66d overdue, ICE ENFORCE) within 10 business days. Cite 5 USC §552.

2. SUPPORT S.874 — Veterans Visa and Protection Act (118th Congress): Sen. Tammy Duckworth. Would prevent deportation of veterans with honorable service. Include specific bill language.

3. SUPPORT HR.1537 — Repatriate Our Patriots Act (118th Congress): Rep. Mark Takano. Creates repatriation pathway for deported veterans including the 6 CB-HSIVF cases.

4. MANDATE INTER-AGENCY VETERAN FLAG: Require DHS/ICE to query VA/DoD veteran status via SCRA or DMDC before any removal order is issued. Zero-cost implementation via existing data sharing agreements.

5. RESTORE JUDICIAL DISCRETION: Repeal IIRIRA §237(a)(2)(A)(iii) retroactive application for offenses committed before 1996. Restore immigration judge discretion to consider military service as a mitigating factor.

6. COMMISSION DCAS FORENSIC AUDIT: Fund NARA to conduct full Hispanic casualty re-audit using BISG methodology for all branches and all conflicts, not just Vietnam. Estimated cost: $2.4M.

Write as actionable congressional asks with specific bill numbers, implementation timelines, and responsible agencies.`,
  },
  {
    id:"appendix", label:"Appendix & Data Sources", icon:"📚", required:false,
    desc:"Full source list, methodology notes, SHA-256 ledger, contact list",
    prompt:`Write the Appendix for a Congressional Hispanic Caucus briefing on veteran deportation.

Include:
1. SOURCES LIST: DCAS Vietnam Conflict Extract File (DoD DMDC), BISG Methodology (Fiscal Note), VA BIRLS, DHS ENFORCE/IDENT, NARA eVetRecs, Fold3 Military Records, GAO-19-416, Congress.gov S.874/HR.1537, SDSU Digital Collections, Durazo (USF) qualitative study, Guzmán (1969) landmark study, Ancestry.com military records

2. METHODOLOGY NOTES: BISG τ=0.40 rationale, Bernoulli Sum Variance ±2,308.7, SPSS validation R²=0.947, NERO model construction, 5-stream independence verification

3. SHA-256 EVIDENCE CHAIN: All 6 cases CB-HSIVF certified — list case IDs and hash fingerprints

4. KEY CONTACTS:
   - AUMER Foundation: gtarce@usc.edu
   - VA FOIA: vacofoiaservice@va.gov / 1-877-750-3639
   - ICE FOIA: foia.ice@dhs.gov
   - LULAC Legal: lulac.org
   - DVSH Field: Casa del Migrante TJ

5. GLOSSARY: BISG, DCAS, NERO, CB-HSIVF, IIRIRA, INA §329, BIRLS, ENFORCE/IDENT, NERO, SHA-256

Write in professional congressional appendix style.`,
  },
];

const DISTRIBUTION = [
  "CHC Chair Office", "Rep. Nanette Barragán (CA-44)", "Rep. Adriano Espaillat (NY-13)",
  "Rep. Linda Sánchez (CA-38)", "Rep. Robert Garcia (CA-42)", "Sen. Alex Padilla (CA)",
  "AUMER Foundation", "LULAC National Legal", "Veterans Justice Network",
  "Military Times (Press)", "PBS NewsHour (Press)",
];

export default function CHCReportGenerator() {
  const [selectedSections, setSelectedSections] = useState(new Set(SECTIONS.filter(s=>s.required).map(s=>s.id)));
  const [generated, setGenerated] = useState({});
  const [generating, setGenerating] = useState(null);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [editContent, setEditContent] = useState({});
  const [finalizing, setFinalizing] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const toggleSection = (id) => {
    const s = SECTIONS.find(s=>s.id===id);
    if (s?.required) return;
    setSelectedSections(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});
  };

  const generateSection = async (section) => {
    if (!section.prompt) return;
    setGenerating(section.id);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: section.prompt,
      model: "claude_sonnet_4_6"
    });
    setGenerated(prev=>({...prev,[section.id]:res}));
    setEditContent(prev=>({...prev,[section.id]:res}));
    setActiveSection(section.id);
    setGenerating(null);
  };

  const generateAll = async () => {
    setGeneratingAll(true);
    const toGenerate = SECTIONS.filter(s=>selectedSections.has(s.id)&&s.prompt);
    for (const section of toGenerate) {
      setGenerating(section.id);
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: section.prompt,
        model: "claude_sonnet_4_6"
      });
      setGenerated(prev=>({...prev,[section.id]:res}));
      setEditContent(prev=>({...prev,[section.id]:res}));
    }
    setGenerating(null);
    setGeneratingAll(false);
  };

  const getCoverContent = () =>
`═══════════════════════════════════════════════════════════════
CONGRESSIONAL HISPANIC CAUCUS
OFFICIAL BRIEFING PACKAGE
═══════════════════════════════════════════════════════════════

SUBJECT:    The Invisible Veterans: DCAS Forensic Audit & 
            Hispanic Casualty Undercount in the Vietnam War

DATE:       May 18, 2026
LOCATION:   US Capitol, Washington DC

PRESENTED BY:
    AUMER Foundation Research Team
    Principal Investigator: Gilberto A. Tarce-Yanez, USC
    Contact: gtarce@usc.edu

CLASSIFICATION:  UNCLASSIFIED // FOR OFFICIAL USE ONLY

CASE STATUS:     6 CB-HSIVF Verified Cases // SHA-256 Certified
CHC BRIEF #:     2026-CHC-001
VERSION:         FINAL

═══════════════════════════════════════════════════════════════
KEY FINDINGS AT A GLANCE
═══════════════════════════════════════════════════════════════

DCAS Official Hispanic Count:    349   (0.60%)  ← ANOMALOUS
BISG Forensic Estimate:        2,309   (3.97%)  ← VALIDATED
Classification Failure Rate:   84.9%
Missing Erased Veterans:      ~1,960
Undercount Factor:              6.6×  minimum

CHC BRIEFING IN:               ${chcDays} DAYS

FOIA BLOCKERS:
  F001 VA BIRLS:     83 DAYS OVERDUE
  F002 ICE ENFORCE:  66 DAYS OVERDUE

═══════════════════════════════════════════════════════════════
DISTRIBUTION LIST
═══════════════════════════════════════════════════════════════
${DISTRIBUTION.map((d,i)=>`  ${String(i+1).padStart(2,"0")}. ${d}`).join("\n")}
═══════════════════════════════════════════════════════════════`;

  const assembleReport = () => {
    const parts = [];
    parts.push(getCoverContent());
    SECTIONS.filter(s=>selectedSections.has(s.id)).forEach(s=>{
      const content = editContent[s.id] || generated[s.id];
      if (s.id==="cover") return;
      parts.push(`\n\n${"═".repeat(60)}\n${s.label.toUpperCase()}\n${"═".repeat(60)}\n\n${content||"[Section not yet generated]"}`);
    });
    parts.push(`\n\n${"═".repeat(60)}\nSOURCES & CERTIFICATION\n${"═".repeat(60)}\n\nAll 6 CB-HSIVF cases SHA-256 certified.\nTruthEngine360 v2 · AUMER Foundation · ${new Date().toISOString()}\nContact: gtarce@usc.edu`);
    return parts.join("");
  };

  const downloadTXT = () => {
    const content = assembleReport();
    const blob = new Blob([content],{type:"text/plain"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `CHC_Briefing_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
  };

  const downloadPDF = async () => {
    setFinalizing(true);
    const { jsPDF } = await import("jspdf");
    const content = assembleReport();
    const doc = new jsPDF({unit:"pt",format:"letter"});
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const marginL = 60, marginR = 60, marginT = 70;

    // Header
    doc.setFillColor(3,5,8);
    doc.rect(0,0,pageW,55,"F");
    doc.setFillColor(245,200,66);
    doc.rect(0,0,pageW,4,"F");
    doc.setTextColor(245,200,66);
    doc.setFontSize(13); doc.setFont("helvetica","bold");
    doc.text("CONGRESSIONAL HISPANIC CAUCUS — BRIEFING PACKAGE", marginL, 28);
    doc.setFontSize(8); doc.setTextColor(180,180,180);
    doc.text(`AUMER Foundation · May 18, 2026 · UNCLASSIFIED // FOR OFFICIAL USE · ${chcDays} days remaining`, marginL, 44);

    doc.setTextColor(20,20,20);
    doc.setFontSize(8); doc.setFont("courier","normal");
    const lines = doc.splitTextToSize(content, pageW - marginL - marginR);
    let y = marginT + 20;
    lines.forEach(line => {
      if (y > pageH - 50) { doc.addPage(); y = marginT; }
      const isSection = line.startsWith("═") || line.startsWith("─");
      const isHeader = /^[A-Z\s&]{8,}$/.test(line.trim()) && line.trim().length > 5;
      if (isSection) { doc.setFont("courier","bold"); doc.setTextColor(100,80,200); }
      else if (isHeader) { doc.setFont("courier","bold"); doc.setTextColor(40,40,40); }
      else { doc.setFont("courier","normal"); doc.setTextColor(30,30,30); }
      doc.text(line, marginL, y);
      y += 10.5;
    });

    const pages = doc.internal.getNumberOfPages();
    for (let i=1;i<=pages;i++) {
      doc.setPage(i);
      doc.setFillColor(3,5,8); doc.rect(0,pageH-28,pageW,28,"F");
      doc.setFontSize(7); doc.setTextColor(150,150,150);
      doc.text(`AUMER Foundation · TruthEngine360 · Page ${i}/${pages}`, marginL, pageH-12);
      doc.text(`SHA-256 Certified · CHC Brief May 18, 2026 · gtarce@usc.edu`, pageW-marginR-180, pageH-12);
    }
    doc.save(`CHC_Briefing_FINAL_${new Date().toISOString().slice(0,10)}.pdf`);
    setFinalizing(false);
  };

  const sendEmail = async () => {
    const content = assembleReport();
    await base44.integrations.Core.SendEmail({
      to:"gtarce@usc.edu",
      subject:`[CHC BRIEF] Complete Briefing Package — May 18, 2026 (${chcDays}d remaining)`,
      body:`CHC Briefing Package Generated\n${new Date().toISOString()}\n\nSections: ${[...selectedSections].join(", ")}\n\n${content.slice(0,8000)}\n\n[Full document: ${content.length} characters — download PDF from TruthEngine360]`,
    });
    setEmailSent(true);
    setTimeout(()=>setEmailSent(false),3000);
  };

  const genCount = Object.keys(generated).length;
  const selCount = selectedSections.size;

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex",gap:10,justifyContent:"space-between",flexWrap:"wrap",marginBottom:10}}>
        <div>
          <div style={{fontSize:12,fontWeight:800,color:P.t1}}>🏛️ CHC Briefing <span style={{color:P.gold}}>Report Generator</span></div>
          <div style={{fontSize:7,color:P.t4,letterSpacing:2}}>MAY 18, 2026 · {chcDays} DAYS · AI-GENERATED · CLAUDE SONNET · EDITABLE · PDF EXPORT</div>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{padding:"5px 12px",background:`${chcDays<=30?P.red:P.amber}12`,border:`1px solid ${chcDays<=30?P.red:P.amber}25`,borderRadius:20,fontSize:8,color:chcDays<=30?P.red:P.amber,fontWeight:800}}>
            ⏰ {chcDays} days
          </div>
          <div style={{padding:"5px 12px",background:`${P.teal}12`,border:`1px solid ${P.teal}25`,borderRadius:20,fontSize:8,color:P.teal}}>
            {genCount}/{selCount} sections ready
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:10}}>
        {/* Left: section manager */}
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <div style={{fontSize:7,color:P.t4,letterSpacing:2,marginBottom:2}}>REPORT SECTIONS</div>
          {SECTIONS.map(s=>{
            const isSelected = selectedSections.has(s.id);
            const isDone = !!generated[s.id];
            const isGen = generating===s.id;
            return (
              <div key={s.id} style={{background:activeSection===s.id?`${P.gold}08`:P.card,
                border:`1px solid ${activeSection===s.id?P.gold+"50":isSelected?P.b:P.b+"40"}`,
                borderLeft:`4px solid ${isDone?P.teal:isSelected?P.gold:P.b}`,
                borderRadius:8,padding:"8px 10px",cursor:s.required?undefined:"pointer"}}
                onClick={()=>!s.required&&toggleSection(s.id)}>
                <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2}}>
                  <span style={{fontSize:12}}>{s.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:8,fontWeight:700,color:isSelected?P.t1:P.t4}}>{s.label}</div>
                    <div style={{fontSize:6,color:P.t4,lineHeight:1.4}}>{s.desc}</div>
                  </div>
                  <div style={{flexShrink:0}}>
                    {s.required?<span style={{fontSize:6,color:P.red,fontWeight:700}}>REQ</span>:
                      <span style={{fontSize:10}}>{isSelected?"☑":"☐"}</span>}
                  </div>
                </div>
                {isSelected && s.prompt && (
                  <div style={{display:"flex",gap:4,marginTop:5}}>
                    <button onClick={(e)=>{e.stopPropagation();generateSection(s);setActiveSection(s.id);}}
                      disabled={isGen||generatingAll}
                      style={{flex:1,padding:"4px 8px",fontSize:7,fontWeight:700,cursor:"pointer",
                        background:isDone?`${P.teal}15`:`${P.blue}12`,
                        border:`1px solid ${isDone?P.teal:P.blue}25`,
                        color:isDone?P.teal:P.blue,borderRadius:5}}>
                      {isGen?"⟳ Writing...":isDone?"✓ Regenerate":"▶ Generate"}
                    </button>
                    {isDone&&<button onClick={(e)=>{e.stopPropagation();setActiveSection(s.id);}}
                      style={{padding:"4px 8px",fontSize:7,cursor:"pointer",
                        background:activeSection===s.id?`${P.gold}20`:"transparent",
                        border:`1px solid ${activeSection===s.id?P.gold:P.b}`,
                        color:activeSection===s.id?P.gold:P.t4,borderRadius:5}}>
                      Edit
                    </button>}
                  </div>
                )}
                {s.id==="cover"&&(
                  <button onClick={(e)=>{e.stopPropagation();setGenerated(p=>({...p,cover:getCoverContent()}));setEditContent(p=>({...p,cover:getCoverContent()}));setActiveSection("cover");}}
                    style={{width:"100%",marginTop:5,padding:"4px 8px",fontSize:7,fontWeight:700,cursor:"pointer",
                      background:generated.cover?`${P.teal}15`:`${P.blue}12`,
                      border:`1px solid ${generated.cover?P.teal:P.blue}25`,
                      color:generated.cover?P.teal:P.blue,borderRadius:5}}>
                    {generated.cover?"✓ Regenerate":"▶ Generate"}
                  </button>
                )}
              </div>
            );
          })}

          {/* Generate all + export */}
          <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:4}}>
            <button onClick={generateAll} disabled={generatingAll||generating}
              style={{padding:"9px",fontSize:9,fontWeight:800,cursor:"pointer",
                background:generatingAll?P.b:`linear-gradient(135deg,${P.gold},${P.amber})`,
                border:"none",color:generatingAll?P.t4:"#000",borderRadius:8}}>
              {generatingAll?`⟳ Generating ${generating?.toUpperCase()}...`:"⚡ Generate All Sections"}
            </button>
            {genCount>0&&<>
              <button onClick={downloadTXT}
                style={{padding:"7px",fontSize:8,fontWeight:700,cursor:"pointer",
                  background:`${P.teal}12`,border:`1px solid ${P.teal}25`,color:P.teal,borderRadius:8}}>
                ↓ Download .TXT
              </button>
              <button onClick={downloadPDF} disabled={finalizing}
                style={{padding:"7px",fontSize:8,fontWeight:700,cursor:"pointer",
                  background:finalizing?P.b:`${P.red}12`,border:`1px solid ${finalizing?P.b:P.red}25`,
                  color:finalizing?P.t4:P.red,borderRadius:8}}>
                {finalizing?"⟳ Building PDF...":"↓ Export PDF"}
              </button>
              <button onClick={sendEmail}
                style={{padding:"7px",fontSize:8,fontWeight:700,cursor:"pointer",
                  background:emailSent?`${P.teal}12`:`${P.violet}12`,border:`1px solid ${emailSent?P.teal:P.violet}25`,
                  color:emailSent?P.teal:P.violet,borderRadius:8}}>
                {emailSent?"✓ Sent!":"📧 Email to gtarce@usc.edu"}
              </button>
            </>}
          </div>
        </div>

        {/* Right: editor/preview */}
        <div style={{background:P.card,border:`1px solid ${P.b}`,borderRadius:10,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:500}}>
          {activeSection ? (
            <>
              <div style={{padding:"10px 14px",borderBottom:`1px solid ${P.b}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <span style={{fontSize:9,fontWeight:700,color:P.gold}}>{SECTIONS.find(s=>s.id===activeSection)?.icon} {SECTIONS.find(s=>s.id===activeSection)?.label}</span>
                  <span style={{fontSize:7,color:P.t4,marginLeft:10}}>{(editContent[activeSection]||"").split("\n").length} lines · {Math.round((editContent[activeSection]||"").length/5)} words est.</span>
                </div>
                <div style={{display:"flex",gap:5}}>
                  {Object.keys(generated).filter(id=>id!==activeSection).map(id=>(
                    <button key={id} onClick={()=>setActiveSection(id)}
                      style={{padding:"3px 8px",fontSize:7,cursor:"pointer",background:"transparent",
                        border:`1px solid ${P.b}`,color:P.t4,borderRadius:20}}>
                      {SECTIONS.find(s=>s.id===id)?.icon} {id}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={editContent[activeSection]||""}
                onChange={e=>setEditContent(prev=>({...prev,[activeSection]:e.target.value}))}
                style={{flex:1,padding:"14px 16px",background:"transparent",border:"none",
                  color:P.t2,fontSize:9,lineHeight:1.9,outline:"none",resize:"none",
                  fontFamily:"'IBM Plex Mono',monospace",minHeight:480}}
                placeholder={generating===activeSection?"⟳ Generating with Claude Sonnet...":"Click Generate to create this section with AI"}
              />
            </>
          ) : (
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px",textAlign:"center"}}>
              <div style={{fontSize:36,marginBottom:12}}>🏛️</div>
              <div style={{fontSize:12,fontWeight:800,color:P.gold,marginBottom:6}}>CHC Briefing Report Generator</div>
              <div style={{fontSize:9,color:P.t3,maxWidth:400,lineHeight:1.7,marginBottom:16}}>
                Select sections on the left and click Generate to create each section with Claude Sonnet AI,
                or click "Generate All Sections" to build the complete package at once.
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,width:"100%",maxWidth:380}}>
                {[
                  ["Sections Selected",selCount,P.gold],
                  ["AI Model","Claude Sonnet",P.violet],
                  ["CHC Deadline",`${chcDays} days`,chcDays<=30?P.red:P.amber],
                  ["FOIA Blockers","F001 + F002",P.red],
                ].map(([k,v,c])=>(
                  <div key={k} style={{background:"#080D18",borderRadius:7,padding:"8px 12px"}}>
                    <div style={{fontSize:6,color:P.t4}}>{k}</div>
                    <div style={{fontSize:10,fontWeight:800,color:c}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}