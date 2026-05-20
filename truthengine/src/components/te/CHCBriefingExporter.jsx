import { useState } from "react";
import { P } from "../../lib/teData";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const EXPORT_SECTIONS = [
  { id: "cover", title: "Cover Page", icon: "📄" },
  { id: "executive", title: "Executive Summary", icon: "📋" },
  { id: "findings", title: "Top-Line Findings", icon: "🔍" },
  { id: "cases", title: "10 New Cases", icon: "📊" },
  { id: "precedents", title: "Legal Precedent Pathways", icon: "⚖️" },
  { id: "accountability", title: "Institutional Accountability Evidence", icon: "❌" },
  { id: "impact", title: "Briefing Impact + Recommendations", icon: "🎯" },
];

export default function CHCBriefingExporter() {
  const [selectedFormat, setSelectedFormat] = useState("html");
  const [selectedSections, setSelectedSections] = useState(EXPORT_SECTIONS.map(s => s.id));
  const [isExporting, setIsExporting] = useState(false);

  const toggleSection = (id) => {
    setSelectedSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const generateHTML = () => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CHC Briefing: Deported U.S. Military Personnel (May 18, 2026)</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'IBM Plex Mono', monospace; background: #0B1A2E; color: #F0F4FF; line-height: 1.8; }
    .page { page-break-after: always; padding: 48px; background: #0B1A2E; min-height: 100vh; border-bottom: 1px solid #F5C84260; }
    .page-break { page-break-after: always; }
    h1 { font-size: 42px; font-weight: 800; color: #F5C842; margin-bottom: 24px; text-align: center; }
    h2 { font-size: 28px; font-weight: 800; color: #F5C842; margin-bottom: 16px; margin-top: 32px; }
    h3 { font-size: 18px; font-weight: 700; color: #2DD4BF; margin-bottom: 12px; margin-top: 20px; }
    p { font-size: 12px; margin-bottom: 12px; line-height: 1.8; }
    .subtitle { font-size: 16px; color: #8BA8C8; text-align: center; margin-bottom: 8px; }
    .date { font-size: 11px; color: #8BA8C8; text-align: center; margin-bottom: 32px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 11px; }
    th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #2A4A6B; }
    th { background: #1E3A5F; color: #F5C842; font-weight: 800; }
    tr:nth-child(even) { background: #0D1525; }
    .stat-box { background: #1E3A5F; border-left: 4px solid #F5C842; padding: 12px; margin: 12px 0; border-radius: 6px; }
    .stat-value { font-size: 24px; font-weight: 800; color: #F5C842; }
    .stat-label { font-size: 10px; color: #8BA8C8; margin-top: 4px; }
    .highlight-red { background: #C0392B20; border-left: 4px solid #C0392B; padding: 12px; margin: 12px 0; border-radius: 6px; }
    .highlight-gold { background: #F5C84220; border-left: 4px solid #F5C842; padding: 12px; margin: 12px 0; border-radius: 6px; }
    .case-card { background: #1E3A5F; border-radius: 8px; padding: 12px; margin: 8px 0; font-size: 11px; }
    .case-name { font-weight: 800; color: #2DD4BF; margin-bottom: 4px; }
    .case-detail { font-size: 10px; color: #8BA8C8; }
    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #F5C84260; font-size: 10px; color: #8BA8C8; text-align: center; }
    @media print { body { background: white; } .page { background: white; color: #000; } }
  </style>
</head>
<body>

${selectedSections.includes('cover') ? `
<div class="page">
  <h1>DEPORTED U.S. MILITARY PERSONNEL</h1>
  <p class="subtitle">High-Level Evidence Search: April 2026</p>
  <p class="subtitle">10-Case Expansion + Institutional Accountability Evidence</p>
  <p class="date">Prepared for Congressional Hispanic Caucus Briefing</p>
  <p class="date">May 18, 2026</p>
  <hr style="border: none; border-top: 1px solid #F5C84260; margin: 48px 0;">
  <p style="text-align: center; margin-top: 48px;">
    Baseline: 6 records (MASTER_DEPORTED_MARINES_DATABASE.csv)<br>
    Expansion: 10 newly verified cases<br>
    <strong style="color: #F5C842; font-size: 18px;">Post-expansion total: 16 records (+167%)</strong>
  </p>
  <p style="text-align: center; margin-top: 48px; font-size: 11px; color: #8BA8C8;">
    AUMER Foundation · EIN 99-0495658<br>
    Gabriel T. Arce Jr., USC Dornsife<br>
    April 2026
  </p>
</div>
` : ''}

${selectedSections.includes('executive') ? `
<div class="page">
  <h2>Executive Summary</h2>
  
  <h3>Baseline Audit Flag</h3>
  <p>Current MASTER database of 6 records contains mislabeling. Only <strong>2 of 6 are confirmed Marine Corps</strong> (Valente + Manuel Valenzuela). Park, Segura, Duran are Army; Castano branch contested.</p>
  
  <h3>10-Case Expansion</h3>
  <p>This search adds 10 newly verified Marine and Marine-adjacent cases via post-March 2026 web research. <strong>7 are direct USMC veterans</strong>. Post-expansion count: <strong>9 confirmed USMC + 2 USMC-family collateral + 1 infrastructure node (Jose Francisco Lopez / DVSH-Juarez)</strong>.</p>
  
  <h3>Documented Government Perjury</h3>
  <div class="highlight-red">
    <strong style="color: #C0392B;">DHS Sec. Kristi Noem — Contradictory Statements:</strong>
    <p style="margin-top: 8px;">
      <strong>Sept 2, 2025 letter</strong> to Rep. Seth Moulton: "ICE has removed eight veterans since January 20, 2025."
    </p>
    <p>
      <strong>Dec 11, 2025 Congressional testimony:</strong> DHS "have NOT deported U.S. citizens or military veterans."
    </p>
    <p style="margin-top: 8px; color: #F0F4FF;">
      Same day, Moulton publicly released the Sept 2 letter. <strong>This is the strongest single institutional-accountability finding of the March-April 2026 cycle.</strong>
    </p>
  </div>
  
  <h3>Impact on CHC Briefing (May 18, 2026)</h3>
  <ul style="margin-left: 20px;">
    <li>Adds <strong>clean no-criminal case</strong> (Canton) — rebuts "bad-hombres" framing</li>
    <li>Adds <strong>legal-win precedents</strong> (Sabal, Chavez) — demonstrates remedy is achievable</li>
    <li>Adds <strong>deceased-before-pardon case</strong> (Apodaca) — demonstrates human cost of delay</li>
    <li>Adds <strong>documented DHS perjury</strong> (Noem) — strongest accountability anchor</li>
    <li>Adds <strong>family-targeting pattern</strong> (Butnarciuc, Barranco, Juarez) — demonstrates escalation vector</li>
    <li>Adds <strong>DVSH independent registry</strong> (301 in 2017) — third-party corroboration of GAO undercount</li>
  </ul>
</div>
` : ''}

${selectedSections.includes('findings') ? `
<div class="page">
  <h2>Top-Line Findings</h2>
  
  <div class="stat-box">
    <div class="stat-value">10</div>
    <div class="stat-label">Newly Verified Cases</div>
  </div>
  
  <div class="stat-box">
    <div class="stat-value">7</div>
    <div class="stat-label">Confirmed Direct USMC Veterans</div>
  </div>
  
  <div class="stat-box">
    <div class="stat-value">167%</div>
    <div class="stat-label">Database Expansion Rate</div>
  </div>
  
  <h3>Key Pattern: Family-Targeting Escalation</h3>
  <p>2025–2026 deportation wave expands beyond deported-Marine cases into deportation of Marine family members as proxy punishment/deterrence:</p>
  
  <ul style="margin-left: 20px; margin-bottom: 16px;">
    <li><strong>Diana Butnarciuc</strong> — Wife of Las Vegas USMC vet Patric Baja. ICE detained Feb 2026; deported April 2026 to Moldova. Two U.S.-citizen children left behind.</li>
    <li><strong>Narciso Barranco</strong> — Father of THREE USMC sons. Detained June 2025. Son testified before Senate subcommittee.</li>
    <li><strong>Alejandra Juarez</strong> — Wife of USMC Sgt. Juarez. Deported 2018 with 8-yr-old daughter; 16-yr-old remained with Marine father.</li>
  </ul>
  
  <div class="highlight-gold">
    <strong>Finding:</strong> The "deported-spouse-of-Marine" vector is a <strong>new enforcement pathway</strong> not addressed by any existing legislation (VVPA, HOPE Act, I-VETS Act). CHC brief should include Barco-style case study for family targeting.
  </div>
  
  <h3>Legal Precedent Pathways (Actionable Template Set)</h3>
  <ul style="margin-left: 20px;">
    <li><strong>California Gubernatorial Pardon (2017):</strong> Gov. Jerry Brown — Chavez, Apodaca, Barajas (3 vets)</li>
    <li><strong>Federal Lawsuit Pathway (2020):</strong> Helen Boyer + Talia Inlender — Roman Sabal citizenship restoration</li>
    <li><strong>New Mexico Gubernatorial Pardon (2020):</strong> Gov. Lujan Grisham — Cesar Lopez (first batch of 19)</li>
  </ul>
</div>
` : ''}

${selectedSections.includes('cases') ? `
<div class="page">
  <h2>10 Newly Verified Cases (April 2026)</h2>
  
  <div class="case-card">
    <div class="case-name">1. Roman Sabal (USMC, Belize)</div>
    <div class="case-detail">Deported 2008 → Federal lawsuit → Returned 2020 (Confidence: 95%)</div>
    <div class="case-detail">Status: <strong style="color: #2DD4BF;">✓ Successfully returned as U.S. citizen</strong></div>
  </div>
  
  <div class="case-card">
    <div class="case-name">2. Marco A. Chavez (USMC, Mexico)</div>
    <div class="case-detail">Deported 2002 → CA Pardon 2017 → Returned Dec 2017 (Confidence: 95%)</div>
    <div class="case-detail">Status: <strong style="color: #2DD4BF;">✓ FIRST deported veteran to regain LPR via gubernatorial pardon</strong></div>
  </div>
  
  <div class="case-card">
    <div class="case-name">3. Erasmo Apodaca Mendizabal (USMC, Mexico)</div>
    <div class="case-detail">Deported ~1996-2002 → Posthumously pardoned 2017 (Confidence: 85%)</div>
    <div class="case-detail">Status: <strong style="color: #C0392B;">⚰️ Deceased before pardon reviewed</strong></div>
  </div>
  
  <div class="case-card">
    <div class="case-name">4. Cesar Lopez (USMC, Mexico)</div>
    <div class="case-detail">Deported ~2012 → NM Pardon 2020 → Returned Las Vegas (Confidence: 90%)</div>
    <div class="case-detail">Status: <strong style="color: #2DD4BF;">✓ Successfully returned as U.S. citizen</strong></div>
  </div>
  
  <div class="case-card">
    <div class="case-name">5. Jose Segovia-Benitez (USMC, El Salvador)</div>
    <div class="case-detail">Deported Oct 2019 → Iraq combat vet with undiagnosed PTSD (Confidence: 95%)</div>
    <div class="case-detail">Status: <strong style="color: #C0392B;">⚠️ In hiding El Salvador (cartel kidnapping risk)</strong></div>
  </div>
  
  <div class="case-card">
    <div class="case-name">6. Paul 'Marc' Canton (USMC, New Zealand)</div>
    <div class="case-detail">No criminal record → Fed ruling Feb 2026 → Deportation PENDING (Confidence: 95%)</div>
    <div class="case-detail">Status: <strong style="color: #C0392B;">🚨 URGENT: Cleanest case on record, family selling home</strong></div>
  </div>
  
  <div class="case-card">
    <div class="case-name">7. Richard Avila (USMC, Mexico)</div>
    <div class="case-detail">Deported 2011 → 15+ years Tijuana DVSH (Confidence: 85%)</div>
    <div class="case-detail">Status: <strong style="color: #8BA8C8;">📍 Long-term deported-vet resident</strong></div>
  </div>
  
  <div class="case-card">
    <div class="case-name">8. Cuauhtemoc 'Temo' Juarez (USMC, Mexico)</div>
    <div class="case-detail">Wife Alejandra deported 2018 → Family targeting case (Confidence: 85%)</div>
    <div class="case-detail">Status: <strong style="color: #C0392B;">👨‍👩‍👧 Family separation ongoing (NEW PATTERN)</strong></div>
  </div>
  
  <div class="case-card">
    <div class="case-name">9. Marine Vet Ocegueda (USMC, Mexico)</div>
    <div class="case-detail">Deported ~2012 → 9 years Mexico → Returned 2021 (Confidence: 85%)</div>
    <div class="case-detail">Status: <strong style="color: #2DD4BF;">✓ Returned as U.S. citizen via federal naturalization</strong></div>
  </div>
  
  <div class="case-card">
    <div class="case-name">10. Jose Francisco Lopez (Army, Mexico)</div>
    <div class="case-detail">Deported 2003 → Founded DVSH-Juárez 2017 → 140 residents (Confidence: 90%)</div>
    <div class="case-detail">Status: <strong style="color: #2DD4BF;">🏛️ Infrastructure node: deported vet became support-network founder</strong></div>
  </div>
</div>
` : ''}

${selectedSections.includes('precedents') ? `
<div class="page">
  <h2>Legal Precedent Pathways</h2>
  
  <h3>California Gubernatorial Pardon (Easter 2017)</h3>
  <p>Gov. Jerry Brown granted pardons to Marco Chavez, Erasmo Apodaca, and Hector Barajas.</p>
  <p><strong>Marco Chavez Precedent:</strong> First deported veteran to regain LPR status after gubernatorial pardon. Case demonstrates that minor convictions with honorable discharge are eligible for pardon review.</p>
  
  <h3>Federal Lawsuit Pathway (Oct 2020)</h3>
  <p>Roman Sabal's federal lawsuit, led by attorneys Helen Boyer and Talia Inlender, successfully challenged deportation order on constitutional grounds.</p>
  <p><strong>Sabal Precedent:</strong> Establishes federal court pathway for citizenship restoration post-deportation. Case is reusable template for other fake-ID-entry/honorable-discharge cases with documented citizenship eligibility.</p>
  
  <h3>New Mexico Gubernatorial Pardon (June 26, 2020)</h3>
  <p>Gov. Lujan Grisham granted pardon to Cesar Lopez in first batch of 19 pardons.</p>
  <p><strong>Lopez Precedent:</strong> Demonstrates NM pardon pathway is more efficient than California. Drug/DUI conviction eligible for pardon; USMC service was decisive factor. Strategy is replicable for TX, CO, OR cases.</p>
  
  <h3>Recommended Multi-State Strategy</h3>
  <ul style="margin-left: 20px;">
    <li><strong>Priority 1: NM gubernatorial pathway</strong> — Fastest; lowest barrier for drug/DUI cases</li>
    <li><strong>Priority 2: Federal lawsuit</strong> — For fake-ID-entry/citizenship-eligible cases</li>
    <li><strong>Priority 3: CA gubernatorial pathway</strong> — Slower but established precedent</li>
    <li><strong>Priority 4: Congressional private bill</strong> — For no-criminal-record cases (Canton)</li>
  </ul>
</div>
` : ''}

${selectedSections.includes('accountability') ? `
<div class="page">
  <h2>Institutional Accountability Evidence</h2>
  
  <h3>DHS Secretary Kristi Noem — Contradictory Testimony</h3>
  
  <div class="highlight-gold">
    <strong>Sept 2, 2025 Letter (DHS Secretary to Rep. Seth Moulton):</strong>
    <p style="margin-top: 8px; font-style: italic;">
      "Regarding your question on the number of veterans that have been removed since January 20, 2025, ICE has removed eight veterans."
    </p>
  </div>
  
  <div class="highlight-red">
    <strong>Dec 11, 2025 Congressional Testimony (House Homeland Security Committee):</strong>
    <p style="margin-top: 8px; font-style: italic;">
      DHS "have NOT deported U.S. citizens or military veterans."
    </p>
    <p style="margin-top: 8px;">
      Same day, Rep. Moulton publicly released the Sept 2 letter, exposing direct contradiction.
    </p>
  </div>
  
  <h3>Implication for CHC Brief</h3>
  <p>This is <strong>courtroom-quality documented contradictory statements</strong> from a sitting Cabinet secretary regarding deported veterans. Should anchor the "Accountability Void" section of the CHC deck with primary-source exhibits.</p>
  
  <h3>Independent Registry Confirmation</h3>
  <p><strong>Deported Veterans Support House (Tijuana, founded 2013 by Hector Barajas):</strong> 2017 registry documented <strong>301 deported veterans across 30 countries</strong>, 60+ Mexican. This figure predates 2019 GAO count of 92 and provides independent evidence of GAO undercount.</p>
  
  <p><strong>DVSH-Juárez (founded April 22, 2017 by Jose Francisco Lopez):</strong> 24+ deported veterans as of 2021 Pulitzer Center reporting; 140 documented / 42 current residents per AUMER March 2026.</p>
  
  <p><strong>LULAC Subcommittee for Deported Veterans (Danitza James, Chair):</strong> 400+ cases across 6+ countries (Mexico, El Salvador, Haiti, Jamaica, Kenya, UK). 65 returned via IMMVI before Jan 20, 2025.</p>
</div>
` : ''}

${selectedSections.includes('impact') ? `
<div class="page">
  <h2>Briefing Impact + Recommendations</h2>
  
  <h3>What This 10-Case Expansion Adds to CHC Narrative</h3>
  
  <h4>1. Clean No-Criminal Case (Paul Canton)</h4>
  <p><strong>Impact:</strong> Rebuts the implicit "bad-hombres" framing of deportations. Canton is a 7-year USMC vet (1991–1998) with zero criminal record, honorable discharge, and a recruiter-documented promise of citizenship. Yet facing stateless deportation due to immigration documentation error.</p>
  <p><strong>Recommendation:</strong> Use Canton as the CHC brief's leading case study. Secure Congressional private bill sponsors; coordinate amicus letters from senior military officers.</p>
  
  <h4>2. Legal-Win Precedents (Sabal, Chavez)</h4>
  <p><strong>Impact:</strong> Demonstrates remedy is achievable. Two successful repatriation cases provide templates for different legal pathways (federal lawsuit vs. gubernatorial pardon).</p>
  <p><strong>Recommendation:</strong> Distribute Sabal and Chavez case dossiers to Congressional Immigration Subcommittee. Request Helen Boyer / Talia Inlender + Gov. Lujan Grisham testimony.</p>
  
  <h4>3. Deceased-Before-Pardon (Apodaca)</h4>
  <p><strong>Impact:</strong> Human cost of institutional delay. Apodaca was pardoned April 2017 but had already died while case was under review — exemplifying the cost of inaction.</p>
  <p><strong>Recommendation:</strong> Frame as urgency case for expedited administrative review process. Mobilize sister Norma Apodaca for family testimony.</p>
  
  <h4>4. Documented DHS Perjury (Noem)</h4>
  <p><strong>Impact:</strong> Strongest single institutional-accountability finding. Secretary Noem's documented contradiction (Sept 2 letter vs. Dec 11 testimony) is evidence of Cabinet-level dishonesty regarding veteran deportations.</p>
  <p><strong>Recommendation:</strong> Obtain full letter + testimony transcript from Moulton's office. Use as primary exhibit in "Accountability Void" section of CHC deck. Recommend contempt-of-Congress referral consideration.</p>
  
  <h4>5. Family-Targeting Pattern (Butnarciuc, Barranco, Juarez)</h4>
  <p><strong>Impact:</strong> Identifies new enforcement vector post-IMMVI rescission. Demonstrates ICE is targeting deported-vet spouses and family members as proxy punishment/deterrence mechanism.</p>
  <p><strong>Recommendation:</strong> Propose Barco-style case study for family targeting. Draft legislative amendment to VVPA/HOPE Act to address spousal-protection gap.</p>
  
  <h4>6. DVSH Independent Registry (301 vets in 2017)</h4>
  <p><strong>Impact:</strong> Third-party corroboration of GAO undercount. Hector Barajas' 2017 DVSH-Tijuana registry documented 301 deported veterans, significantly exceeding official government counts.</p>
  <p><strong>Recommendation:</strong> Highlight as evidence of systematic undercounting by federal agencies. Request Barajas testimony; coordinate with DVSH-Juárez for Jose Francisco Lopez testimony on institutional response to government failure.</p>
  
  <h3>Recommended CHC Briefing Structure (May 18, 2026)</h3>
  <ol style="margin-left: 20px;">
    <li>Cover + Executive Summary (5 min)</li>
    <li>Documented DHS Perjury — Accountability Anchor (5 min)</li>
    <li>Paul Canton Case Study — Clean No-Criminal Case (10 min)</li>
    <li>Legal-Win Precedents — Remedy is Achievable (5 min)</li>
    <li>Family-Targeting Pattern — New Escalation Vector (5 min)</li>
    <li>DVSH Independent Registry — Government Abdication Evidence (5 min)</li>
    <li>Q&amp;A + Recommendations (10 min)</li>
  </ol>
</div>
` : ''}

<div class="page" style="padding-top: 0;">
  <div class="footer">
    <p>AUMER Foundation | EIN 99-0495658</p>
    <p>qtruthengine360.org | albavoice.org</p>
    <p style="margin-top: 16px;">Prepared by Gabriel T. Arce Jr., USC Dornsife | April 2026</p>
  </div>
</div>

</body>
</html>
`;
    return html;
  };

  const exportHTML = () => {
    setIsExporting(true);
    const html = generateHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CHC_Briefing_Deported_Marines_May2026.html";
    a.click();
    URL.revokeObjectURL(url);
    setIsExporting(false);
  };

  const exportPDF = async () => {
    setIsExporting(true);
    try {
      const html = generateHTML();
      const element = document.createElement("div");
      element.innerHTML = html;
      document.body.appendChild(element);
      
      const canvas = await html2canvas(element, { backgroundColor: "#0B1A2E" });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }
      
      pdf.save("CHC_Briefing_Deported_Marines_May2026.pdf");
      document.body.removeChild(element);
    } catch (error) {
      console.error("PDF export failed:", error);
    }
    setIsExporting(false);
  };

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: P.t1, background: P.bg, minHeight: "100vh", padding: "20px" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(90deg,${P.card},#0D1525)`, border: `2px solid ${P.gold}40`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: P.gold, letterSpacing: 2, marginBottom: 8 }}>📤 CHC BRIEFING EXPORT</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>Generate HTML / PDF Briefing Deck</div>
      </div>

      {/* Format selection */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.blue, marginBottom: 12 }}>📋 Export Format</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {[
            { id: "html", label: "📄 HTML (printable, shareable)" },
            { id: "pdf", label: "📕 PDF (portable, presentation)" },
          ].map(fmt => (
            <button
              key={fmt.id}
              onClick={() => setSelectedFormat(fmt.id)}
              style={{
                padding: "8px 16px",
                background: selectedFormat === fmt.id ? `${P.blue}18` : "transparent",
                border: `1px solid ${selectedFormat === fmt.id ? P.blue : P.b}`,
                color: selectedFormat === fmt.id ? P.blue : P.t4,
                borderRadius: 8,
                fontSize: 8,
                fontWeight: selectedFormat === fmt.id ? 800 : 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}>
              {fmt.label}
            </button>
          ))}
        </div>

        {/* Section selection */}
        <div style={{ fontSize: 9, fontWeight: 800, color: P.teal, marginBottom: 12 }}>✓ Select Sections</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8 }}>
          {EXPORT_SECTIONS.map(section => (
            <label
              key={section.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                background: selectedSections.includes(section.id) ? `${P.teal}15` : "transparent",
                border: `1px solid ${selectedSections.includes(section.id) ? P.teal : P.b}`,
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 8,
              }}>
              <input
                type="checkbox"
                checked={selectedSections.includes(section.id)}
                onChange={() => toggleSection(section.id)}
                style={{ cursor: "pointer" }}
              />
              <span>{section.icon} {section.title}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Export buttons */}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={exportHTML}
          disabled={isExporting || selectedSections.length === 0}
          style={{
            padding: "12px 24px",
            background: `${P.blue}18`,
            border: `2px solid ${P.blue}`,
            color: P.blue,
            borderRadius: 10,
            fontSize: 10,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "inherit",
            opacity: isExporting || selectedSections.length === 0 ? 0.5 : 1,
          }}>
          {isExporting ? "Exporting..." : "📄 Export HTML"}
        </button>
        <button
          onClick={exportPDF}
          disabled={isExporting || selectedSections.length === 0}
          style={{
            padding: "12px 24px",
            background: `${P.gold}18`,
            border: `2px solid ${P.gold}`,
            color: P.gold,
            borderRadius: 10,
            fontSize: 10,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "inherit",
            opacity: isExporting || selectedSections.length === 0 ? 0.5 : 1,
          }}>
          {isExporting ? "Exporting..." : "📕 Export PDF"}
        </button>
      </div>

      {/* Preview section */}
      <div style={{ marginTop: 20, background: `${P.amber}10`, border: `1px solid ${P.amber}30`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.amber, marginBottom: 8 }}>⏱️ Export Preview</div>
        <div style={{ fontSize: 8, color: P.t3 }}>
          Selected {selectedSections.length} sections. Export will generate a polished, hierarchical briefing deck suitable for Congressional presentation. HTML version is printable and shareable via email; PDF version is presentation-ready.
        </div>
      </div>
    </div>
  );
}