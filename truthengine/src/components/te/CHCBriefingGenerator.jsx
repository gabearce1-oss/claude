import { useState } from "react";
import { P, CASES, KEY_STATS, FOIA_REQUESTS } from "../../lib/teData";
import { base44 } from "../../api/base44Client";
import { jsPDF } from "jspdf";

const CHC_DATE = new Date("2026-05-18");
const TODAY = new Date("2026-04-09");
const DAYS_LEFT = Math.ceil((CHC_DATE - TODAY) / 86400000);

// Briefing section configs — each maps to an AI prompt
const SECTIONS = [
  {
    id:"exec",
    title:"Executive Summary",
    icon:"📋",
    prompt: (ctx) => `Write a crisp, powerful 150-word Executive Summary for a Congressional Hispanic Caucus briefing on deported non-citizen veterans.

Key data: ${ctx.dcasTotal} DCAS records · ${ctx.official} official Hispanic (${ctx.officialPct}%) · ${ctx.bisg} BISG forensic estimate (${ctx.bisgPct}%) · ${ctx.failure}% classification failure · ${ctx.undercount}× undercount · 6 SHA-256 certified cases · ${ctx.foiaOverdue} FOIA requests overdue · CHC briefing May 18 2026 (${DAYS_LEFT} days).

Tone: Formal congressional. Lead with the 84.9% number. End with a call for immediate legislative action. No bullet points — flowing paragraphs only.`,
  },
  {
    id:"dcas",
    title:"DCAS Forensic Analysis",
    icon:"🔬",
    prompt: (ctx) => `Write a 200-word technical section titled "DCAS Forensic Analysis" for a CHC congressional briefing.

Include:
- DCAS database background (58,220 Vietnam casualties, frozen 1975)
- The 349/0.60% anomaly and why it's statistically impossible
- BISG τ=0.40 methodology and the 2,309/3.97% estimate
- 5-stream convergence: DCAS 349 · BISG 2,309 · NARA 3,070 · Guzmán 1969 3,500 · LAE 3,741
- R²=0.947 SPSS validation, F(4,38)=161.7, p<0.001
- The Bernoulli Sum Variance ±2,308.7
- Conclusion: 84.9% classification failure, ~1,960 missing veterans

Style: Academic but accessible to Congress members. Use specific numbers throughout.`,
  },
  {
    id:"nero",
    title:"NERO Institutional Scores",
    icon:"⚠️",
    prompt: (ctx) => `Write a 200-word section on the NERO Institutional Erasure Framework for a CHC briefing.

NERO scores:
- N (Notification): 94/100 — citizenship promise never formalized, veterans never warned of deportation risk
- E (Erasure): 97/100 — DCAS 84.9% misclassification, perpetual foreignness mechanism  
- R (Restriction): 91/100 — IIRIRA restricts VA access, naturalization, due process; 72% decline in military naturalization FY2017-18
- O (Obscurity): 96/100 — ICE confirmed only 92 vs advocacy estimate 94,000+; BI-2 Estimation Vacuum
- Composite: 94.5/100

Frame this as evidence of systematic, multi-vector institutional erasure — not isolated incidents. Congressional ask: mandate inter-agency reporting to close the obscurity gap.`,
  },
  {
    id:"cases",
    title:"Verified Case Summaries",
    icon:"🎖️",
    prompt: (ctx) => `Write a 250-word section presenting 3 of the 6 CB-HSIVF verified cases for a CHC congressional briefing. Choose the 3 most compelling for congressional audiences.

The 6 cases:
C001: SGT George Ramos — Army Vietnam · Gold tier · 96% conf · In US · Medal of Honor connection
C002: Mario Valenzuela — USMC Vietnam · Gold tier · 89% · Deported to Tijuana, Casa del Migrante shelter
C003: Victor Valenzuela — USMC Vietnam · Silver · 87% · Deported to Tijuana  
C004: Sae Joon Park — USMC · Gold · 94% · CRITICAL: Korean-born, self-deported Nov/Dec 2025 under ICE order, IIRIRA §237 applied
C005: Miguel Segura — Army Vietnam · Silver · 78% · Deported to Nogales shelter
C006: Joaquin Duran — Army Vietnam · Bronze · 72% · Deported to Colombia

All SHA-256 chain of custody certified. Select and humanize 3 cases. Use names, be specific. End with: "Each represents thousands more erased by the 84.9% classification failure."`,
  },
  {
    id:"foia",
    title:"FOIA Accountability Report",
    icon:"📋",
    prompt: (ctx) => `Write a 150-word section on overdue FOIA requests for a CHC congressional briefing. This is an accountability section addressed directly to Congress.

F001: VA SAOF FOIA for BIRLS veteran ID records — filed Sept 15 2025, due Nov 14, NOW 83 DAYS OVERDUE. Contact: 1-877-750-3639
F002: ICE ENFORCE deportation crosswalk FOIA — filed Oct 15 2025, due Dec 14, NOW 66 DAYS OVERDUE. Contact: foia.ice@dhs.gov

Both are blocking the CHC evidence package. The statutory deadline under 5 USC §552 is 20 business days.

Tone: Direct accountability. Ask the CHC to direct formal inquiries to the VA Secretary and DHS Secretary requiring production within 10 business days. Congressional oversight is the only remaining escalation path.`,
  },
  {
    id:"asks",
    title:"Legislative Asks",
    icon:"🏛️",
    prompt: (ctx) => `Write a concise, actionable 200-word "Legislative Asks" section for a CHC congressional briefing. Format as numbered items (1–6).

The 6 asks:
1. Expedite FOIA F001 (VA) + F002 (ICE) within 10 business days — direct Secretary-level order
2. Co-sponsor S.874 (Veterans Visa and Protection Act, Sen. Duckworth) — prevents deportation of honorably-serving veterans  
3. Co-sponsor HR.1537 (Repatriate Our Patriots Act, Rep. Takano) — creates repatriation pathway
4. Mandate inter-agency veteran flag: require DHS/ICE to query VA/DoD before ANY removal order
5. Restore judicial discretion: repeal IIRIRA §237(a)(2)(A)(iii) retroactive application for pre-1996 offenses
6. Fund DCAS forensic audit: commission NARA to re-audit using BISG methodology across all Vietnam-era records

Style: Formal legislative language. Each ask should include the specific statute or bill number. End with urgency: CHC briefing May 18, 2026 — ${DAYS_LEFT} days.`,
  },
];

const CONTEXT = {
  dcasTotal: "58,220",
  official: "349",
  officialPct: "0.60",
  bisg: "2,309",
  bisgPct: "3.97",
  failure: "84.9",
  undercount: "6.6×",
  foiaOverdue: "2",
};

export default function CHCBriefingGenerator() {
  const [generated, setGenerated] = useState({});
  const [loading, setLoading] = useState({});
  const [customNotes, setCustomNotes] = useState("");
  const [generating_all, setGeneratingAll] = useState(false);
  const [activeSection, setActiveSection] = useState("exec");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const generateSection = async (sectionId) => {
    const sec = SECTIONS.find(s => s.id === sectionId);
    if (!sec) return;
    setLoading(prev => ({ ...prev, [sectionId]: true }));
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: sec.prompt(CONTEXT),
      model: "claude_sonnet_4_6",
    });
    setGenerated(prev => ({ ...prev, [sectionId]: res }));
    setLoading(prev => ({ ...prev, [sectionId]: false }));
  };

  const generateAll = async () => {
    setGeneratingAll(true);
    for (const sec of SECTIONS) {
      setLoading(prev => ({ ...prev, [sec.id]: true }));
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: sec.prompt(CONTEXT),
        model: "claude_sonnet_4_6",
      });
      setGenerated(prev => ({ ...prev, [sec.id]: res }));
      setLoading(prev => ({ ...prev, [sec.id]: false }));
    }
    setGeneratingAll(false);
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ unit:"pt", format:"letter" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const marginL = 60, marginR = 60, marginT = 80;

    // Cover header
    doc.setFillColor(3, 5, 8);
    doc.rect(0, 0, pageW, 60, "F");
    doc.setFillColor(245, 200, 66);
    doc.rect(0, 0, pageW, 4, "F");

    doc.setTextColor(245, 200, 66);
    doc.setFontSize(16); doc.setFont("helvetica","bold");
    doc.text("CONGRESSIONAL HISPANIC CAUCUS", marginL, 28);
    doc.setFontSize(11); doc.setTextColor(200, 200, 200);
    doc.text(`BRIEFING PACKAGE — MAY 18, 2026 (${DAYS_LEFT} DAYS)`, marginL, 44);
    doc.setFontSize(8); doc.setTextColor(150,150,150);
    doc.text(`AUMER Foundation · TruthEngine360 · Generated: ${new Date().toLocaleDateString()} · SHA-256 Certified`, marginL, 55);

    let y = marginT + 20;

    SECTIONS.forEach(sec => {
      const content = generated[sec.id];
      if (!content) return;

      if (y > pageH - 100) { doc.addPage(); y = marginT; }

      // Section header
      doc.setFillColor(20, 28, 45);
      doc.rect(marginL - 10, y - 14, pageW - marginL - marginR + 20, 20, "F");
      doc.setFontSize(11); doc.setFont("helvetica","bold"); doc.setTextColor(245, 200, 66);
      doc.text(`${sec.title.toUpperCase()}`, marginL, y);
      y += 16;

      doc.setFontSize(8.5); doc.setFont("helvetica","normal"); doc.setTextColor(40, 40, 40);
      const lines = doc.splitTextToSize(content, pageW - marginL - marginR);
      lines.forEach(line => {
        if (y > pageH - 50) { doc.addPage(); y = marginT; }
        doc.text(line, marginL, y); y += 12;
      });
      y += 14;
    });

    // Custom notes
    if (customNotes.trim()) {
      if (y > pageH - 100) { doc.addPage(); y = marginT; }
      doc.setFillColor(20, 28, 45);
      doc.rect(marginL - 10, y - 14, pageW - marginL - marginR + 20, 20, "F");
      doc.setFontSize(11); doc.setFont("helvetica","bold"); doc.setTextColor(245, 200, 66);
      doc.text("ADDITIONAL NOTES", marginL, y); y += 16;
      doc.setFontSize(8.5); doc.setFont("helvetica","normal"); doc.setTextColor(40,40,40);
      const lines = doc.splitTextToSize(customNotes, pageW - marginL - marginR);
      lines.forEach(line => { if (y > pageH - 50) { doc.addPage(); y = marginT; } doc.text(line, marginL, y); y += 12; });
    }

    // Footer
    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(7); doc.setTextColor(150,150,150);
      doc.text(`AUMER Foundation · TruthEngine360 · CHC May 18 2026 · Page ${i}/${pages}`, marginL, pageH - 20);
      doc.text("UNCLASSIFIED // FOR OFFICIAL USE", pageW - marginR - 140, pageH - 20);
    }

    doc.save(`CHC_Briefing_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const emailBriefing = async () => {
    const readySections = SECTIONS.filter(s => generated[s.id]);
    if (!readySections.length) return;
    setEmailSending(true);
    const body = readySections.map(s => `${s.title.toUpperCase()}\n${"─".repeat(40)}\n${generated[s.id]}`).join("\n\n") +
      (customNotes ? `\n\nADDITIONAL NOTES\n${"─".repeat(40)}\n${customNotes}` : "");
    await base44.integrations.Core.SendEmail({
      to: "gtarce@usc.edu",
      subject: `[TE360] CHC Briefing Package — ${readySections.length}/${SECTIONS.length} Sections — ${DAYS_LEFT} Days`,
      body: `TruthEngine360 — CHC Briefing Generator\nMay 18, 2026 · ${DAYS_LEFT} days\nGenerated: ${new Date().toISOString()}\n${"═".repeat(60)}\n\n${body}`,
    });
    setEmailSent(true);
    setEmailSending(false);
    setTimeout(() => setEmailSent(false), 4000);
  };

  const completedCount = SECTIONS.filter(s => generated[s.id]).length;
  const isAnyLoading = Object.values(loading).some(Boolean);

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", gap:10, justifyContent:"space-between", flexWrap:"wrap", marginBottom:10 }}>
        <div>
          <div style={{ fontSize:12, fontWeight:800, color:P.t1 }}>
            🏛️ CHC Briefing <span style={{ color:P.gold }}>Generator</span>
          </div>
          <div style={{ fontSize:7, color:P.t4, letterSpacing:2 }}>
            AI-POWERED · {completedCount}/{SECTIONS.length} SECTIONS READY · MAY 18 2026 · {DAYS_LEFT} DAYS
          </div>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          <button onClick={generateAll} disabled={generating_all || isAnyLoading}
            style={{ padding:"8px 16px", fontSize:9, fontWeight:800, cursor:generating_all?"not-allowed":"pointer",
              background:generating_all?P.b:`linear-gradient(135deg,${P.gold},${P.amber})`,
              border:"none", color:generating_all?P.t4:"#000", borderRadius:8 }}>
            {generating_all?"⟳ Generating All...":"✨ Generate All Sections"}
          </button>
          <button onClick={downloadPDF} disabled={!completedCount}
            style={{ padding:"8px 16px", fontSize:9, fontWeight:800, cursor:completedCount?"pointer":"not-allowed",
              background:`${P.red}18`, border:`1px solid ${P.red}30`, color:completedCount?P.red:P.t4, borderRadius:8 }}>
            ↓ PDF
          </button>
          <button onClick={emailBriefing} disabled={!completedCount || emailSending}
            style={{ padding:"8px 16px", fontSize:9, fontWeight:800, cursor:"pointer",
              background:`${P.teal}12`, border:`1px solid ${P.teal}30`,
              color:emailSent?P.teal:P.t3, borderRadius:8 }}>
            {emailSending?"⟳ Sending...":emailSent?"✓ Sent!":"📧 Email"}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:8, padding:"8px 14px", marginBottom:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
          <span style={{ fontSize:7, color:P.t4 }}>BRIEFING COMPLETENESS</span>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:P.gold, fontWeight:700 }}>
            {Math.round((completedCount / SECTIONS.length) * 100)}%
          </span>
        </div>
        <div style={{ background:"#030508", borderRadius:4, height:8, overflow:"hidden" }}>
          <div style={{ width:`${(completedCount/SECTIONS.length)*100}%`, height:"100%",
            background:`linear-gradient(90deg,${P.blue},${P.gold})`, borderRadius:4, transition:"width .4s" }} />
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:10 }}>
        {/* Section nav */}
        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
          {SECTIONS.map(sec=>{
            const isDone = !!generated[sec.id];
            const isLoading = loading[sec.id];
            return (
              <button key={sec.id} onClick={()=>setActiveSection(sec.id)}
                style={{ padding:"8px 10px", background:activeSection===sec.id?`${P.gold}12`:P.card,
                  border:`1px solid ${activeSection===sec.id?P.gold+"40":isDone?P.teal+"30":P.b}`,
                  borderLeft:`4px solid ${activeSection===sec.id?P.gold:isDone?P.teal:P.b}`,
                  borderRadius:7, cursor:"pointer", textAlign:"left" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:9, color:activeSection===sec.id?P.gold:isDone?P.teal:P.t3, fontWeight:700 }}>
                    {sec.icon} {sec.title}
                  </span>
                  <span style={{ fontSize:9 }}>
                    {isLoading?"⟳":isDone?"✓":"○"}
                  </span>
                </div>
              </button>
            );
          })}
          {/* Custom notes */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:7, padding:"8px 10px", marginTop:4 }}>
            <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:4 }}>CUSTOM NOTES</div>
            <textarea value={customNotes} onChange={e=>setCustomNotes(e.target.value)}
              placeholder="Add speaker notes, context, edits..."
              rows={5} style={{ width:"100%", padding:"5px", background:"#080D18", border:`1px solid ${P.b}`,
                borderRadius:5, color:P.t1, fontSize:7, outline:"none", resize:"vertical",
                fontFamily:"'IBM Plex Mono',monospace", boxSizing:"border-box" }} />
          </div>
        </div>

        {/* Active section editor */}
        <div>
          {SECTIONS.filter(s=>s.id===activeSection).map(sec=>(
            <div key={sec.id}>
              <div style={{ display:"flex", gap:8, justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div style={{ fontSize:11, fontWeight:800, color:P.t1 }}>{sec.icon} {sec.title}</div>
                <button onClick={()=>generateSection(sec.id)} disabled={loading[sec.id]}
                  style={{ padding:"7px 16px", fontSize:9, fontWeight:800, cursor:loading[sec.id]?"not-allowed":"pointer",
                    background:loading[sec.id]?P.b:`linear-gradient(135deg,${P.blue},${P.violet})`,
                    border:"none", color:loading[sec.id]?P.t4:"#fff", borderRadius:8 }}>
                  {loading[sec.id]?"⟳ Writing...":"✨ Generate with AI"}
                </button>
              </div>

              {/* Prompt preview (collapsed) */}
              <div style={{ background:"#080D18", border:`1px solid ${P.b}20`, borderRadius:7, padding:"7px 10px", marginBottom:8 }}>
                <div style={{ fontSize:6, color:P.t4, letterSpacing:2, marginBottom:3 }}>AI PROMPT CONTEXT</div>
                <div style={{ fontSize:7, color:P.t4, lineHeight:1.6 }}>
                  {sec.prompt(CONTEXT).slice(0,200)}...
                </div>
              </div>

              {/* Output */}
              <div style={{ background:P.card, border:`1px solid ${generated[sec.id]?P.teal+"30":P.b}`,
                borderRadius:10, minHeight:300, overflow:"hidden" }}>
                {loading[sec.id] ? (
                  <div style={{ padding:"40px", textAlign:"center" }}>
                    <div style={{ fontSize:24, marginBottom:8 }}>✨</div>
                    <div style={{ fontSize:10, color:P.blue, fontWeight:700 }}>Claude is writing your briefing section...</div>
                    <div style={{ fontSize:8, color:P.t4, marginTop:4 }}>Using Claude Sonnet for congressional-quality prose</div>
                  </div>
                ) : generated[sec.id] ? (
                  <div>
                    <div style={{ background:`${P.teal}08`, borderBottom:`1px solid ${P.teal}20`,
                      padding:"6px 14px", display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontSize:7, color:P.teal, fontWeight:700 }}>✓ GENERATED — Click to edit</span>
                      <span style={{ fontSize:7, color:P.t4 }}>{generated[sec.id].length} chars · {Math.round(generated[sec.id].split(" ").length)} words</span>
                    </div>
                    <textarea
                      value={generated[sec.id]}
                      onChange={e=>setGenerated(prev=>({...prev,[sec.id]:e.target.value}))}
                      style={{ width:"100%", padding:"14px 16px", background:"transparent", border:"none",
                        color:P.t2, fontSize:9, lineHeight:1.9, outline:"none", resize:"vertical",
                        fontFamily:"Georgia, serif", minHeight:280, boxSizing:"border-box" }} />
                  </div>
                ) : (
                  <div style={{ padding:"40px", textAlign:"center" }}>
                    <div style={{ fontSize:24, marginBottom:8 }}>🏛️</div>
                    <div style={{ fontSize:10, color:P.t4, fontWeight:700 }}>Section not yet generated</div>
                    <div style={{ fontSize:8, color:P.t4, marginTop:4 }}>Click "Generate with AI" to write this section using Claude Sonnet</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}