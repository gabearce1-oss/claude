import { useState } from "react";
import { P, CASES, KEY_STATS, CONVERGENCE_STREAMS, FOIA_REQUESTS } from "../../lib/teData";
import { base44 } from "../../api/base44Client";
import { jsPDF } from "jspdf";

const CHC_DATE = new Date("2026-05-18");
const chcDays = Math.ceil((CHC_DATE - new Date()) / 86400000);

const REPORT_TEMPLATES = [
  {
    id:"chc-brief",
    name:"CHC Congressional Briefing",
    icon:"🏛️",
    desc:"Full briefing package for May 18, 2026 — DCAS anomaly, 6 verified cases, NERO scores, legislative asks",
    sections:["executive_summary","dcas_analysis","cases","nero","foia_status","legislative_asks","appendix"],
    audience:"Congressional Hispanic Caucus",
    classification:"UNCLASSIFIED // FOR OFFICIAL USE",
  },
  {
    id:"academic",
    name:"Academic Publication Draft",
    icon:"📚",
    desc:"Journal-ready manuscript sections — methodology, findings, statistical analysis, future research",
    sections:["abstract","introduction","methodology","results","discussion","conclusion","references"],
    audience:"Journal of Veterans Studies",
    classification:"PUBLIC",
  },
  {
    id:"media-brief",
    name:"Press Briefing Package",
    icon:"📰",
    desc:"Journalist-ready fact sheet — key statistics, case summaries, timeline, contact information",
    sections:["headline_facts","key_statistics","case_spotlights","timeline","source_list"],
    audience:"AP News, Military Times, PBS NewsHour",
    classification:"PUBLIC",
  },
  {
    id:"foia-status",
    name:"FOIA Status Report",
    icon:"📋",
    desc:"Internal operational report — all FOIA requests, overdue status, escalation paths, data gaps",
    sections:["foia_tracker","risk_matrix","escalation_options","data_gaps"],
    audience:"Internal — AUMER Research Team",
    classification:"INTERNAL",
  },
  {
    id:"evidence-chain",
    name:"Evidence Chain Summary",
    icon:"🔐",
    desc:"SHA-256 certified evidence ledger — all 6 cases, source streams, chain of custody",
    sections:["chain_overview","case_evidence","source_streams","certification"],
    audience:"Legal / Congressional Record",
    classification:"CERTIFIED EVIDENCE",
  },
];

const SECTION_LABELS = {
  executive_summary:"Executive Summary",
  dcas_analysis:"DCAS Forensic Analysis",
  cases:"Verified Case Summaries",
  nero:"NERO Institutional Scores",
  foia_status:"FOIA Status",
  legislative_asks:"Legislative Asks",
  appendix:"Appendix & Data Sources",
  abstract:"Abstract",
  introduction:"Introduction",
  methodology:"Methodology",
  results:"Results",
  discussion:"Discussion",
  conclusion:"Conclusion",
  references:"References",
  headline_facts:"Headline Facts",
  key_statistics:"Key Statistics",
  case_spotlights:"Case Spotlights",
  timeline:"Timeline",
  source_list:"Source List",
  foia_tracker:"FOIA Tracker",
  risk_matrix:"Risk Matrix",
  escalation_options:"Escalation Options",
  data_gaps:"Data Gaps",
  chain_overview:"Chain Overview",
  case_evidence:"Case Evidence",
  source_streams:"Source Streams",
  certification:"SHA-256 Certification",
};

const buildSectionContent = (sectionId) => {
  switch(sectionId) {
    case "executive_summary": return `EXECUTIVE SUMMARY

The AUMER Foundation presents forensic evidence that the Defense Casualty Analysis System (DCAS) classified only 349 of 58,220 Vietnam War casualties as Hispanic (0.60%). Bayesian Improved Surname Geocoding (BISG) methodology estimates the true figure at 2,309+ (3.97%) — an 84.9% classification failure rate representing approximately 1,960 erased veterans.

Six cases are CB-HSIVF certified (SHA-256 chain of custody). Three FOIA requests are overdue. The Congressional Hispanic Caucus briefing is scheduled for May 18, 2026 (${chcDays} days).

KEY FINDINGS:
• DCAS 349 anomaly confirmed: 6.6× undercount minimum
• 5-stream convergence: all streams exceed official count by 2,309–3,741
• IIRIRA 1996 retroactively criminalized honorable service
• Active case: Sae Joon Park — self-deported Nov/Dec 2025 under ICE order`;

    case "dcas_analysis": return `DCAS FORENSIC ANALYSIS

DATABASE: Defense Casualty Analysis System (DCAS) Vietnam Conflict Extract File
TOTAL RECORDS: 58,220
OFFICIAL HISPANIC CODED: 349 (0.60%)

5-STREAM CONVERGENCE TABLE:
Stream 1 — DCAS Official: 349 (0.60%) [BASELINE — ANOMALOUS]
Stream 2 — BISG τ=0.40: 2,309 (3.97%) [FORENSIC ESTIMATE]
Stream 3 — NARA Retroactive: 3,070 (5.27%) [ARCHIVAL]
Stream 4 — Guzmán 1969: 3,500 (6.01%) [HISTORICAL]
Stream 5 — LAE Database: 3,741 (6.43%) [COMMUNITY]

BISG METHODOLOGY: Bayesian Improved Surname Geocoding applied to full 58,220 records.
Stable band: τ=0.30–0.70 → estimate range 2,309–2,415.
Bernoulli Sum Variance: ±2,308.7
SPSS Validation: R²=0.947, F(4,38)=161.7, p<0.001

CLASSIFICATION FAILURE RATE: 84.9%
UNDERCOUNT FACTOR: 6.6× minimum
MISSING VETERANS: ~1,960 (Bernoulli Sum Variance model)`;

    case "cases": return CASES.map(c =>
      `CASE ${c.id}: ${c.name}\n  Branch: ${c.branch}\n  Status: ${c.status}\n  Location: ${c.location}\n  Confidence: ${c.confidence}%\n  Tier: ${c.tier}\n  SHA-256: ${c.hash}`
    ).join("\n\n");

    case "nero": return `NERO INSTITUTIONAL ERASURE SCORES

N — NOTIFICATION (94/100)
Citizenship promise never formalized. Veterans never informed of deportation risk post-service. ICE Directive 10039.2 (2022) arrived 26 years too late.

E — ERASURE (97/100)
Perpetual foreignness mechanism: service doesn't confer membership. DCAS 349 reflects institutional ambiguity — 84.9% misclassification.

R — RESTRICTION (91/100)
Perceived illegality post-service restricts VA access, naturalization, and due process. 72% decline in military naturalization applications FY2017–FY2018.

O — OBSCURITY (96/100)
Ambiguous membership → deportation statistically invisible → BI-2 Estimation Vacuum. ICE confirmed only 92 deported veterans (2013–2018) vs. advocacy estimate of 94,000+.`;

    case "foia_status": return FOIA_REQUESTS.map(r =>
      `${r.id}: ${r.agency}\n  Filed: ${r.filed} | Due: ${r.due}\n  Status: ${r.status}\n  Overdue: ${r.daysOverdue > 0 ? r.daysOverdue + " DAYS" : "Not yet overdue"}`
    ).join("\n\n");

    case "legislative_asks": return `LEGISLATIVE ASKS — CHC BRIEFING MAY 18, 2026

1. EXPEDITE FOIA RESPONSES (Immediate)
   Direct VA Secretary and DHS Secretary to produce overdue FOIA records within 10 business days.

2. SUPPORT S.874 — Veterans Visa and Protection Act (118th Congress)
   Sen. Tammy Duckworth. Would prevent deportation of veterans with honorable service.

3. SUPPORT HR.1537 — Repatriate Our Patriots Act (118th Congress)
   Rep. Mark Takano. Creates repatriation pathway for deported veterans.

4. MANDATE INTER-AGENCY VETERAN FLAG
   Require DHS/ICE to query VA/DoD veteran status before any removal order.

5. RESTORE JUDICIAL DISCRETION
   Repeal IIRIRA §237(a)(2)(A)(iii) retroactive application for pre-1996 offenses.

6. FUND DCAS FORENSIC AUDIT
   Commission NARA to conduct full Hispanic casualty re-audit using BISG methodology.`;

    case "key_statistics": return `KEY STATISTICS FOR MEDIA

• 58,220 — Total Vietnam War casualties in DCAS
• 349 (0.60%) — Official Hispanic count
• 2,309+ (3.97%) — BISG forensic estimate
• 84.9% — Classification failure rate
• 1,960 — Estimated missing/erased veterans
• 6.6× — Undercount factor
• 92 — GAO confirmed veteran deportations (2013–2018)
• 94,000+ — Advocacy estimate of total deported veterans
• 115,000 — Foreign national veterans at risk in U.S. today
• 10,000+ — Deported January–June 2025 (Rep. Ansari letter)`;

    default: return `[Section: ${SECTION_LABELS[sectionId] || sectionId}]\n\nContent generated from AUMER Foundation TruthEngine360 database.\nTimestamp: ${new Date().toISOString()}`;
  }
};

export default function ReportBuilder() {
  const [template, setTemplate] = useState("chc-brief");
  const [selectedSections, setSelectedSections] = useState(new Set(REPORT_TEMPLATES[0].sections));
  const [preview, setPreview] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [reportContent, setReportContent] = useState("");

  const selTemplate = REPORT_TEMPLATES.find(t => t.id === template);

  const changeTemplate = (id) => {
    setTemplate(id);
    const t = REPORT_TEMPLATES.find(t => t.id === id);
    setSelectedSections(new Set(t.sections));
    setPreview(null);
    setReportContent("");
  };

  const toggleSection = (s) => setSelectedSections(prev => {
    const n = new Set(prev);
    n.has(s) ? n.delete(s) : n.add(s);
    return n;
  });

  const buildReport = () => {
    const header = [
      "═".repeat(60),
      `TRUTHENGINE360 — AUMER FOUNDATION`,
      selTemplate.name.toUpperCase(),
      `Audience: ${selTemplate.audience}`,
      `Classification: ${selTemplate.classification}`,
      `Generated: ${new Date().toLocaleString()}`,
      `CHC Briefing: May 18, 2026 (${chcDays} days)`,
      "═".repeat(60),
      "",
    ].join("\n");

    const sections = selTemplate.sections
      .filter(s => selectedSections.has(s))
      .map(s => `\n${"─".repeat(50)}\n${SECTION_LABELS[s]?.toUpperCase() || s.toUpperCase()}\n${"─".repeat(50)}\n\n${buildSectionContent(s)}\n`)
      .join("\n");

    const footer = `\n\n${"═".repeat(60)}\nSOURCES: DCAS Vietnam Conflict Extract File · BISG Forensic Audit · VA BIRLS · DHS ENFORCE · NARA · Congress.gov · GAO-19-416 · AUMER Foundation Field Research\nSHA-256 CHAIN: All 6 cases CB-HSIVF certified · TruthEngine360 v2 · ${new Date().toISOString()}\n${"═".repeat(60)}`;

    return header + sections + footer;
  };

  const generatePreview = () => {
    const content = buildReport();
    setReportContent(content);
    setPreview("text");
  };

  const enhanceWithAI = async () => {
    setAiEnhancing(true);
    try {
      const baseContent = buildReport();
      const enhanced = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert congressional briefing writer for the AUMER Foundation. Enhance and polish this report for a Congressional Hispanic Caucus audience. Keep all data exactly as is, but improve the prose, add appropriate legal/policy context, and ensure it reads as a professional congressional briefing document. Add transitional language, section headers, and a concluding call to action.\n\nREPORT:\n${baseContent.slice(0,4000)}`,
        model: "claude_sonnet_4_6"
      });
      setReportContent(enhanced);
      setPreview("text");
    } catch(e) { console.error(e); }
    setAiEnhancing(false);
  };

  const downloadReport = () => {
    const content = reportContent || buildReport();
    const blob = new Blob([content], { type:"text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `AUMER_${selTemplate.id}_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
  };

  const downloadPDF = () => {
    const content = reportContent || buildReport();
    const doc = new jsPDF({ unit:"pt", format:"letter" });
    const marginL = 60, marginR = 60, marginT = 70;
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const usableW = pageW - marginL - marginR;

    // Header bar
    doc.setFillColor(3,5,8);
    doc.rect(0,0,pageW,50,"F");
    doc.setTextColor(245,200,66);
    doc.setFontSize(14); doc.setFont("helvetica","bold");
    doc.text("TRUTHENGINE360 — AUMER FOUNDATION",marginL,30);
    doc.setFontSize(8); doc.setTextColor(180,180,180);
    doc.text(`${selTemplate.name.toUpperCase()} · ${selTemplate.classification} · ${new Date().toLocaleDateString()}`, marginL, 43);

    // Body text
    doc.setTextColor(30,30,30);
    doc.setFontSize(8); doc.setFont("courier","normal");
    const lines = doc.splitTextToSize(content, usableW);
    let y = marginT + 20;
    lines.forEach(line => {
      if (y > pageH - 50) { doc.addPage(); y = marginT; }
      const isHeader = line.startsWith("═") || line.startsWith("─");
      if (isHeader) { doc.setFont("courier","bold"); doc.setTextColor(100,100,200); }
      else { doc.setFont("courier","normal"); doc.setTextColor(30,30,30); }
      doc.text(line, marginL, y);
      y += 11;
    });

    // Footer
    const pages = doc.internal.getNumberOfPages();
    for (let i=1;i<=pages;i++) {
      doc.setPage(i);
      doc.setFontSize(7); doc.setTextColor(150,150,150);
      doc.text(`AUMER Foundation · TruthEngine360 · Page ${i}/${pages}`, marginL, pageH-20);
      doc.text(`SHA-256 Certified · CHC Brief May 18 2026`, pageW-marginR-130, pageH-20);
    }
    doc.save(`AUMER_${selTemplate.id}_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:12, height:"calc(100vh - 180px)" }}>

      {/* Left panel */}
      <div style={{ display:"flex", flexDirection:"column", gap:8, overflowY:"auto" }}>
        <div style={{ fontSize:7, color:P.t4, letterSpacing:3, marginBottom:2 }}>REPORT TEMPLATE</div>
        {REPORT_TEMPLATES.map(t => (
          <div key={t.id} onClick={() => changeTemplate(t.id)}
            style={{ background: template===t.id ? `${P.gold}12` : P.card,
              border:`1px solid ${template===t.id ? P.gold+"50" : P.b}`,
              borderLeft:`3px solid ${template===t.id ? P.gold : P.b}`,
              borderRadius:8, padding:"9px 11px", cursor:"pointer", transition:"all .12s" }}>
            <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:3 }}>
              <span style={{ fontSize:14 }}>{t.icon}</span>
              <span style={{ fontSize:9, fontWeight:700, color:template===t.id?P.gold:P.t1 }}>{t.name}</span>
            </div>
            <div style={{ fontSize:7, color:P.t4, lineHeight:1.4, marginBottom:3 }}>{t.desc}</div>
            <div style={{ fontSize:6, color:template===t.id?P.gold:P.t4 }}>For: {t.audience}</div>
          </div>
        ))}
      </div>

      {/* Right panel */}
      <div style={{ display:"flex", flexDirection:"column", gap:8, overflowY:"auto" }}>

        {/* Section picker */}
        <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"12px 14px" }}>
          <div style={{ fontSize:8, fontWeight:700, color:P.t4, letterSpacing:2, marginBottom:8 }}>
            SECTIONS — {selectedSections.size}/{selTemplate.sections.length} SELECTED
          </div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {selTemplate.sections.map(s => {
              const active = selectedSections.has(s);
              return (
                <button key={s} onClick={() => toggleSection(s)}
                  style={{ padding:"4px 10px", fontSize:8, background: active ? `${P.violet}18` : "transparent",
                    border:`1px solid ${active ? P.violet+"50" : P.b}`, borderRadius:20,
                    color: active ? P.violet : P.t4, cursor:"pointer" }}>
                  {active?"✓ ":""}{SECTION_LABELS[s]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Report meta */}
        <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"12px 14px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            {[
              ["Audience", selTemplate.audience, P.blue],
              ["Classification", selTemplate.classification, P.gold],
              ["CHC Days", chcDays+"d remaining", P.red],
            ].map(([k,v,c]) => (
              <div key={k} style={{ background:"#080D18", borderRadius:7, padding:"7px 10px" }}>
                <div style={{ fontSize:7, color:P.t4, marginBottom:2 }}>{k}</div>
                <div style={{ fontSize:9, color:c, fontWeight:700 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribution list */}
        <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"10px 14px" }}>
          <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:6 }}>CHC DISTRIBUTION LIST</div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {["CHC Chair Office","Rep. Nanette Barragán","Rep. Adriano Espaillat","Rep. Linda Sánchez","AUMER Foundation","LULAC Legal","Veterans Justice Network"].map(r=>(
              <span key={r} style={{ fontSize:7, background:`${P.blue}12`, border:`1px solid ${P.blue}25`, color:P.blue, borderRadius:20, padding:"2px 8px" }}>{r}</span>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={generatePreview}
            style={{ flex:1, padding:"10px", background:`linear-gradient(135deg,${P.blue},${P.violet})`,
              color:"#fff", border:"none", borderRadius:8, fontSize:10, fontWeight:800,
              cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace" }}>
            ▶ Build Report
          </button>
          <button onClick={enhanceWithAI} disabled={aiEnhancing}
            style={{ flex:1, padding:"10px", background: aiEnhancing ? P.b : `linear-gradient(135deg,${P.gold},${P.amber})`,
              color: aiEnhancing ? P.t4 : "#000", border:"none", borderRadius:8, fontSize:10, fontWeight:800,
              cursor: aiEnhancing ? "not-allowed" : "pointer", fontFamily:"'IBM Plex Mono',monospace" }}>
            {aiEnhancing ? "⟳ Enhancing..." : "✨ AI Enhance"}
          </button>
          {reportContent && (
            <button onClick={downloadReport}
              style={{ padding:"10px 12px", background:`${P.teal}18`, border:`1px solid ${P.teal}30`,
                color:P.teal, borderRadius:8, fontSize:10, fontWeight:800,
                cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace" }}>
              ↓ .TXT
            </button>
          )}
          {reportContent && (
            <button onClick={downloadPDF}
              style={{ padding:"10px 12px", background:`${P.red}18`, border:`1px solid ${P.red}30`,
                color:P.red, borderRadius:8, fontSize:10, fontWeight:800,
                cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace" }}>
              ↓ PDF
            </button>
          )}
        </div>

        {/* Preview */}
        {reportContent && (
          <div style={{ background:"#020609", border:`1px solid ${P.gold}30`, borderRadius:10, flex:1, overflow:"hidden" }}>
            <div style={{ background:`linear-gradient(90deg,${P.gold}12,transparent)`, borderBottom:`1px solid ${P.b}`,
              padding:"8px 14px", display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:9, fontWeight:700, color:P.gold }}>📄 {selTemplate.name} — Preview</span>
              <span style={{ fontSize:7, color:P.t4 }}>{reportContent.split("\n").length} lines · {Math.round(reportContent.length/5)} words est.</span>
            </div>
            <pre style={{ padding:"14px 16px", fontSize:8, color:P.t2, lineHeight:1.8,
              fontFamily:"'IBM Plex Mono',monospace", whiteSpace:"pre-wrap", overflowY:"auto",
              maxHeight:"400px", margin:0 }}>
              {reportContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}