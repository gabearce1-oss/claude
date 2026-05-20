import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { P } from "../../lib/teData";

const VERIFIED_CASES = [
  { id: "C001", name: "SGT George Ramos", branch: "Army", era: "Vietnam", award: "Medal of Honor", confidence: 99, tier: "Gold", status: "VERIFIED" },
  { id: "C002", name: "CPL M. Valenzuela", branch: "USMC", era: "Vietnam", award: "Service Cross", confidence: 88, tier: "Silver", status: "VERIFIED" },
  { id: "C003", name: "LCpl V. Valenzuela", branch: "USMC", era: "Vietnam", award: "Service Cross", confidence: 82, tier: "Silver", status: "VERIFIED" },
  { id: "C004", name: "CPL Sae Joon Park", branch: "USMC", era: "Post-Vietnam", award: "Purple Heart", confidence: 96, tier: "Gold", status: "DEPORTED 2025" },
  { id: "C005", name: "SPC Miguel Segura", branch: "Army", era: "Vietnam", award: "Service Cross", confidence: 79, tier: "Silver", status: "VERIFIED" },
  { id: "C006", name: "PFC J. Duran", branch: "Army", era: "Vietnam", award: "Service Record", confidence: 76, tier: "Bronze", status: "VERIFIED" },
];

const LEGISLATIVE_ASKS = [
  { num: 1, title: "IIRIRA Retroactivity Repeal", desc: "Restore judicial discretion in veteran cases; eliminate retroactive application to pre-1996 offenses" },
  { num: 2, title: "DCAS Classification Audit", desc: "Federal audit of 58,220 DCAS records; correct 84.9% Hispanic misclassification; update veteran casualty estimates" },
  { num: 3, title: "BISG Demographic Validation", desc: "Adopt Bayesian Improved Surname Geocoding (BISG) as standard federal methodology for demographic estimation" },
  { num: 4, title: "VA-ICE Data Mandate", desc: "Require automatic VA-ICE database query at arrest; mandate veteran status screening in all deportation proceedings" },
  { num: 5, title: "FOIA Escalation Protocol", desc: "Establish DHS-DoD-VA inter-agency response SLA for FOIA requests on veteran deportations; public quarterly reporting" },
  { num: 6, title: "Research Funding (NIH/NSF)", desc: "Grant $5M for peer-reviewed studies on non-citizen veteran deportation, PTSD-crime nexus, and repatriation outcomes" },
];

const FORENSIC_FINDINGS = [
  { metric: "Total Mexico nationals deported (FY2022-2026)", value: "202,864", source: "TruthEngine360 ICE Parquet" },
  { metric: "Vietnam-era cohort in system", value: "970", source: "TruthEngine360 ICE Parquet" },
  { metric: "Vietnam-era deported", value: "769", source: "TruthEngine360 ICE Parquet" },
  { metric: "DCAS classification failure rate", value: "84.9%", source: "AUMER BISG Audit" },
  { metric: "Hispanic Vietnam casualties (official)", value: "349 (0.60%)", source: "DCAS / NARA" },
  { metric: "Hispanic Vietnam casualties (BISG estimate)", value: "2,309 (3.97%)", source: "AUMER Forensic Audit" },
  { metric: "NERO institutional erasure index", value: "94.5/100 (CRITICAL)", source: "AUMER Framework" },
  { metric: "Pentagon MOH corrections (Hispanic bias)", value: "17 of 24 (70.8%)", source: "Pentagon Valor Review 2014" },
  { metric: "GAO-confirmed deported veterans (2013-2018)", value: "92+", source: "GAO-19-416 (2019)" },
  { metric: "Non-citizen veterans at risk", value: "94,000", source: "CRS Report R48163 (2024)" },
  { metric: "PTSD-probable deportations (all cohorts)", value: "69,881–81,090", source: "AUMER Clinical Analysis" },
  { metric: "Deaths in ICE custody (veteran-era)", value: "49", source: "TruthEngine360 ICE Parquet" },
];

export default function CHCAutomatedReportBuilder() {
  const [reportState, setReportState] = useState("preview"); // preview | generating | complete
  const [includeOptions, setIncludeOptions] = useState({
    cases: true,
    forensic: true,
    nero: true,
    ptsd: true,
    legislative: true,
    appendix: true,
  });
  const reportRef = useRef(null);

  const toggleOption = (key) => {
    setIncludeOptions(p => ({ ...p, [key]: !p[key] }));
  };

  const generatePDF = async () => {
    setReportState("generating");
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#1A2E5C",
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("CHC_Briefing_Package_May18_2026.pdf");
      setReportState("complete");
      setTimeout(() => setReportState("preview"), 3000);
    } catch (err) {
      console.error("PDF generation error:", err);
      setReportState("preview");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          📋 CHC <span style={{ color: P.gold }}>Automated Report Generator</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          AGGREGATE EVIDENCE · FORENSIC FINDINGS · LEGISLATIVE ASKS · PDF EXPORT · MAY 18, 2026
        </div>
      </div>

      {/* Control panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 12, marginBottom: 14 }}>
        {/* Report options */}
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 10 }}>
            Report Sections
          </div>
          {[
            { key: "cases", label: "Verified Cases (6 CB-HSIVF)" },
            { key: "forensic", label: "Forensic Audit Findings (12 metrics)" },
            { key: "nero", label: "NERO Framework Analysis" },
            { key: "ptsd", label: "PTSD-Crime Correlation Analysis" },
            { key: "legislative", label: "6 Legislative Asks" },
            { key: "appendix", label: "Data Sources & Citations" },
          ].map(opt => (
            <button key={opt.key} onClick={() => toggleOption(opt.key)}
              style={{ width: "100%", padding: "7px 10px", marginBottom: 5, fontSize: 8, fontWeight: 700, cursor: "pointer",
                background: includeOptions[opt.key] ? `${P.gold}15` : "transparent",
                border: `1px solid ${includeOptions[opt.key] ? P.gold : P.b}30`,
                color: includeOptions[opt.key] ? P.gold : P.t4, borderRadius: 6, textAlign: "left" }}>
              {includeOptions[opt.key] ? "✓" : "○"} {opt.label}
            </button>
          ))}
        </div>

        {/* Export controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={generatePDF} disabled={reportState !== "preview"}
            style={{ width: "100%", padding: "12px", fontSize: 9, fontWeight: 800, cursor: reportState === "preview" ? "pointer" : "not-allowed",
              background: reportState === "complete" ? `${P.teal}20` : `${P.gold}20`,
              border: `1px solid ${reportState === "complete" ? P.teal : P.gold}`,
              color: reportState === "complete" ? P.teal : P.gold, borderRadius: 8,
              opacity: reportState !== "preview" ? 0.6 : 1, transition: "all .3s" }}>
            {reportState === "generating" ? "⟳ Generating..." : reportState === "complete" ? "✓ Downloaded!" : "📥 Download PDF"}
          </button>

          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: P.t4, marginBottom: 6, letterSpacing: 1 }}>REPORT META</div>
            {[
              ["Date", "April 9, 2026"],
              ["Recipient", "Congressional Hispanic Caucus"],
              ["Event", "May 18 Briefing"],
              ["Status", "CHC Ready"],
              ["Format", "PDF (Multi-page)"],
              ["Cases", "6 Verified"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 6, color: P.t4, padding: "2px 0", borderBottom: `1px solid ${P.b}20` }}>
                <span>{k}</span>
                <span style={{ fontWeight: 700, color: P.gold }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report preview */}
      <div ref={reportRef} style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 20, fontFamily: "'IBM Plex Mono',monospace", color: P.t1, fontSize: 8, lineHeight: 1.6, maxHeight: "70vh", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20, paddingBottom: 12, borderBottom: `2px solid ${P.gold}` }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: P.gold, marginBottom: 4 }}>AUMER FOUNDATION</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: P.t1, marginBottom: 2 }}>TruthEngine360 Forensic Intelligence</div>
          <div style={{ fontSize: 9, color: P.t4, letterSpacing: 1, marginBottom: 8 }}>CONGRESSIONAL HISPANIC CAUCUS BRIEFING PACKAGE</div>
          <div style={{ fontSize: 8, color: P.t4 }}>May 18, 2026 | Gabriel T. Arce Jr., Executive Director | albavoice.org</div>
        </div>

        {/* Executive Summary */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: P.gold, marginBottom: 8 }}>EXECUTIVE SUMMARY</div>
          <div style={{ background: `${P.red}12`, border: `1px solid ${P.red}30`, padding: 8, borderRadius: 6, marginBottom: 8 }}>
            <div style={{ fontWeight: 700, color: P.red, marginBottom: 4 }}>CORE FINDING:</div>
            <div>202,864 Mexican nationals deported FY2022-2026. Zero contain veteran screening flags. 970 Vietnam-era eligible individuals. 52 died in ICE custody. The data gap itself is the evidence of systematic institutional erasure.</div>
          </div>
        </div>

        {/* Verified Cases */}
        {includeOptions.cases && (
          <div style={{ marginBottom: 16, pageBreakInside: "avoid" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: P.gold, marginBottom: 8 }}>I. CB-HSIVF VERIFIED CASES (6 CASES)</div>
            {VERIFIED_CASES.map((c, i) => (
              <div key={i} style={{ background: `${c.confidence >= 95 ? P.gold : P.amber}08`, border: `1px solid ${c.confidence >= 95 ? P.gold : P.amber}20`, padding: 6, marginBottom: 6, borderRadius: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, color: P.t1 }}>{c.name}</span>
                  <span style={{ color: c.confidence >= 95 ? P.gold : P.amber, fontWeight: 700 }}>{c.tier} · {c.confidence}%</span>
                </div>
                <div style={{ fontSize: 7, color: P.t4 }}>{c.branch} · {c.era} · {c.award} · {c.status}</div>
              </div>
            ))}
          </div>
        )}

        {/* Forensic Findings */}
        {includeOptions.forensic && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: P.gold, marginBottom: 8 }}>II. FORENSIC AUDIT FINDINGS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {FORENSIC_FINDINGS.map((f, i) => (
                <div key={i} style={{ background: P.bg, border: `1px solid ${P.b}25`, padding: 6, borderRadius: 4, fontSize: 7 }}>
                  <div style={{ fontWeight: 700, color: P.t2, marginBottom: 2 }}>{f.value}</div>
                  <div style={{ color: P.t4, fontSize: 6, marginBottom: 1 }}>{f.metric}</div>
                  <div style={{ color: P.t4, fontSize: 5.5, fontStyle: "italic" }}>Source: {f.source}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NERO Framework */}
        {includeOptions.nero && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: P.gold, marginBottom: 8 }}>III. NERO INSTITUTIONAL ERASURE FRAMEWORK</div>
            <div style={{ background: `${P.red}12`, border: `1px solid ${P.red}30`, padding: 8, borderRadius: 6, marginBottom: 6 }}>
              <div style={{ fontWeight: 700, color: P.red, marginBottom: 4 }}>Composite Index: 94.5/100 (CRITICAL)</div>
              <div style={{ fontSize: 7 }}>Notification (88) | Erasure (96) | Restriction (85) | Obscurity (96) — All vectors exceed 90-point critical threshold.</div>
            </div>
          </div>
        )}

        {/* Legislative Asks */}
        {includeOptions.legislative && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: P.gold, marginBottom: 8 }}>IV. SIX LEGISLATIVE ASKS</div>
            {LEGISLATIVE_ASKS.map((ask, i) => (
              <div key={i} style={{ marginBottom: 6, paddingBottom: 6, borderBottom: i < LEGISLATIVE_ASKS.length - 1 ? `1px solid ${P.b}20` : "none" }}>
                <div style={{ fontWeight: 700, color: P.t1, marginBottom: 2 }}>{ask.num}. {ask.title}</div>
                <div style={{ fontSize: 7, color: P.t4 }}>{ask.desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* Appendix */}
        {includeOptions.appendix && (
          <div style={{ fontSize: 7, color: P.t4, borderTop: `1px solid ${P.b}30`, paddingTop: 10 }}>
            <div style={{ fontWeight: 700, color: P.t3, marginBottom: 4 }}>DATA SOURCES & CITATIONS</div>
            <div>TruthEngine360 ICE Parquet Database (713,464 records FY2022-2026) | DCAS Vietnam Casualty Extract (58,220 records) | GAO-19-416 (2019) | Pentagon Valor Review 2014 | CRS R48163 (2024) | Senator Warren DHS Data (March 2026) | AUMER Forensic Audit Framework | CB-HSIVF 5-Tier Certification Standard</div>
          </div>
        )}
      </div>
    </div>
  );
}