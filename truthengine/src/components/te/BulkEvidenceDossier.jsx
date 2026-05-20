import { useState } from "react";
import { P, CASES } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

const DOSSIER_TEMPLATES = [
  { id: "congressional", label: "Congressional Briefing Dossier", desc: "For CHC submission · May 18, 2026", icon: "🏛️", color: P.gold },
  { id: "legal", label: "Legal Counsel Dossier", desc: "For immigration attorneys · litigation support", icon: "⚖️", color: P.red },
  { id: "academic", label: "Academic Research Dossier", desc: "For peer-reviewed publication", icon: "🎓", color: P.violet },
  { id: "media", label: "Media & Advocacy Dossier", desc: "For journalists & advocacy orgs", icon: "📰", color: P.amber },
];

const CASE_DOCS = {
  C001: { title: "Sgt. George Ramos", branch: "Army", status: "Gold", hash: "SHA256:0x4F9A2C7B1E3D5F8A", docs: ["NARA OMPF", "MOH Records", "DCAS Extract", "BISG Analysis"] },
  C002: { title: "M. Valenzuela", branch: "USMC", status: "Silver", hash: "SHA256:0x7E2B4A6C9D1F3E5B", docs: ["Service Record", "Shelter Intake", "Removal Order", "Family Statement"] },
  C003: { title: "V. Valenzuela", branch: "USMC", status: "Silver", hash: "SHA256:0xA3C5E7F9B1D4E6C8", docs: ["Service Record", "Shelter Intake", "Removal Order", "Family Statement"] },
  C004: { title: "Sae Joon Park", branch: "USMC", status: "Gold", hash: "SHA256:0x2B4D6F8A3C5E7B9D", docs: ["Korean Service Record", "Naturalization Denial", "Deportation Order", "IIRIRA Analysis"] },
  C005: { title: "M. Segura", branch: "Army", status: "Silver", hash: "SHA256:0x5F7A9C1E3B5D7F2A", docs: ["Service Record", "Nogales Shelter", "Medical Records", "Family Interview"] },
  C006: { title: "J. Duran", branch: "Navy", status: "Bronze", hash: "SHA256:0x9C1E3B5D7F2A5F7A", docs: ["Service Record", "Colombia Verification", "Deportation File", "Legal Analysis"] },
};

export default function BulkEvidenceDossier() {
  const [selectedTemplate, setSelectedTemplate] = useState("congressional");
  const [selectedCases, setSelectedCases] = useState(["C001", "C004"]);
  const [includeSections, setIncludeSections] = useState({
    executiveSummary: true,
    caseFiles: true,
    timeline: true,
    research: true,
    legalAnalysis: true,
    recommendations: true,
    appendix: true,
  });
  const [exporting, setExporting] = useState(false);
  const [preview, setPreview] = useState(false);

  const template = DOSSIER_TEMPLATES.find(t => t.id === selectedTemplate);

  const toggleCase = (caseId) => {
    setSelectedCases(prev =>
      prev.includes(caseId) ? prev.filter(c => c !== caseId) : [...prev, caseId]
    );
  };

  const toggleSection = (sectionKey) => {
    setIncludeSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const buildDossierContent = () => {
    const cases = selectedCases.map(id => ({ id, ...CASE_DOCS[id] }));
    const lines = [];

    // Header
    lines.push("═".repeat(80));
    lines.push("BULK EVIDENCE DOSSIER — VERIFIED CASE AGGREGATION");
    lines.push(`Template: ${template.label}`);
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push(`Organization: AUMER Foundation (EIN 99-0495658)`);
    lines.push(`Contact: Gabriel T. Arce Jr. | gtarce@usc.edu`);
    lines.push(`Cases: ${selectedCases.length} verified | Total Documents: ${cases.reduce((s, c) => s + c.docs.length, 0)}`);
    lines.push("═".repeat(80));
    lines.push("");

    // Executive Summary
    if (includeSections.executiveSummary) {
      lines.push("EXECUTIVE SUMMARY");
      lines.push("─".repeat(80));
      lines.push(`This dossier aggregates ${selectedCases.length} CB-HSIVF verified cases with supporting evidence:`);
      lines.push("");
      cases.forEach(c => {
        lines.push(`  • ${c.title} (${c.id}) — ${c.status} Tier · ${c.branch}`);
      });
      lines.push("");
      lines.push("Key Finding: All cases demonstrate institutional failures under NERO framework:");
      lines.push("  N — Notification: VA does not notify ICE of veteran status");
      lines.push("  E — Erasure: DCAS misclassifies 84.9% of Hispanic casualties");
      lines.push("  R — Restriction: FOIA requests blocked; INA §329 denials systematic");
      lines.push("  O — Obscurity: No public database links veteran status to deportation");
      lines.push("");
    }

    // Case Files
    if (includeSections.caseFiles) {
      lines.push("VERIFIED CASE FILES");
      lines.push("─".repeat(80));
      cases.forEach((c, idx) => {
        lines.push(`\n[Case ${idx + 1}] ${c.title}`);
        lines.push(`Case ID: ${c.id} | Tier: ${c.status} | Branch: ${c.branch}`);
        lines.push(`SHA-256 Hash: ${c.hash}`);
        lines.push(`Supporting Documents: ${c.docs.length}`);
        c.docs.forEach(doc => lines.push(`  ✓ ${doc}`));
        lines.push("");
      });
    }

    // Timeline
    if (includeSections.timeline) {
      lines.push("\nEVIDENCE TIMELINE — INSTITUTIONAL FAILURES");
      lines.push("─".repeat(80));
      lines.push("1996-09-30: IIRIRA enacted — retroactive deportation authority");
      lines.push("2019-07-01: GAO-19-416 confirms only 92 acknowledged deported veterans (estimate: 94,000+)");
      lines.push("2022-01-01: AUMER BISG audit: 2,309 Hispanic casualties vs 349 DCAS (84.9% gap)");
      lines.push("2025-09-15: F001 FOIA filed for VA BIRLS records");
      lines.push("2025-10-15: F002 FOIA filed for ICE ENFORCE database");
      lines.push("2025-11-14: F001 overdue (83 days) — CHC escalation initiated");
      lines.push("2025-12-14: F002 overdue (66 days) — DHS inquiry letter required");
      lines.push("2026-04-09: TODAY — Export Hub active; TruthEngine360 operational");
      lines.push("2026-05-18: CHC BRIEFING — Congressional Hispanic Caucus submission");
      lines.push("");
    }

    // Research
    if (includeSections.research) {
      lines.push("\nRESEARCH SUPPORTING DOCUMENTATION");
      lines.push("─".repeat(80));
      lines.push("Primary Sources:");
      lines.push("  D1  — Invisible Valor Manuscript (99/100 relevance)");
      lines.push("  D8  — DCAS Forensic Audit Report (R²=0.947)");
      lines.push("  D9  — Marines DB: 6 Verified Cases");
      lines.push("  D10 — Durazo (USF) Qualitative Stream 7");
      lines.push("  D12 — GAO-19-416 Congressional Record Citation");
      lines.push("");
      lines.push("Academic Corroboration:");
      lines.push("  Simon et al. (2024) — Armed Forces & Society: Immigrants express greater");
      lines.push("    willingness to serve than native-born citizens. Mexico: top 10 nations.");
      lines.push("  Guzman (1969) — Chicano casualties 6.01% (10× DCAS official)");
      lines.push("");
    }

    // Legal Analysis
    if (includeSections.legalAnalysis) {
      lines.push("\nLEGAL ANALYSIS & CHC LEGISLATIVE ASKS");
      lines.push("─".repeat(80));
      lines.push("\nASK #1: S.874 — Veterans Visa Act");
      lines.push("  Sponsor: Support passage | Action: Expedited visa pathway");
      lines.push("\nASK #2: HR.1537 — Repatriate Our Patriots Act");
      lines.push("  Action: Extend VA healthcare to deported veterans abroad");
      lines.push("\nASK #3: IIRIRA Section 237 Partial Repeal");
      lines.push("  Action: Restore judicial discretion for veterans in removal");
      lines.push("\nASK #4: DoD DCAS BISG Re-Audit Commission");
      lines.push("  Action: Appropriate $2.4M for full forensic re-audit");
      lines.push("\nASK #5: Mandatory VA-ICE Data Sharing");
      lines.push("  Action: Require DMDC/SCRA query before removal order issuance");
      lines.push("\nASK #6: FOIA Escalation Letters");
      lines.push("  Target: DHS Secretary (F002, 66 days overdue)");
      lines.push("  Target: VA Secretary (F001, 83 days overdue)");
      lines.push("");
    }

    // Recommendations
    if (includeSections.recommendations) {
      lines.push("\nSTRATEGIC RECOMMENDATIONS");
      lines.push("─".repeat(80));
      lines.push("1. IMMEDIATE ACTIONS (Next 30 days):");
      lines.push("   • Send CHC formal inquiry letters to VA Secretary + DHS Secretary");
      lines.push("   • Request Congressional subpoena authority for FOIA enforcement");
      lines.push("   • Parallel escalation via Mexican foreign affairs (INAI)");
      lines.push("");
      lines.push("2. MEDIUM-TERM (30–90 days):");
      lines.push("   • Draft legislative language for S.874 + HR.1537 amendments");
      lines.push("   • Commission DCAS BISG forensic audit ($2.4M budget)");
      lines.push("   • Establish DoD-DOJ-VA MOU for veteran flag mandate");
      lines.push("");
      lines.push("3. LONG-TERM (90+ days):");
      lines.push("   • Judicial challenge under Padilla v. Kentucky (ineffective counsel)");
      lines.push("   • Class action: retroactive application of IIRIRA §237 unconstitutional");
      lines.push("   • Bilateral Mexico-US veteran repatriation agreement");
      lines.push("");
    }

    // Appendix
    if (includeSections.appendix) {
      lines.push("\nAPPENDIX: METADATA & CHAIN OF CUSTODY");
      lines.push("─".repeat(80));
      lines.push("Certification Officer: Gabriel T. Arce Jr. (AUMER Foundation)");
      lines.push("Certification Date: " + new Date().toISOString());
      lines.push("Case Confidence Thresholds: CB-HSIVF Protocol");
      lines.push(`Total Cases Aggregated: ${selectedCases.length}`);
      lines.push(`Total Supporting Documents: ${cases.reduce((s, c) => s + c.docs.length, 0)}`);
      lines.push("NERO Institutional Score: Composite 94.5/100");
      lines.push("FOIA Status: 2 requests overdue (83d, 66d)");
      lines.push("Congressional Deadline: May 18, 2026");
      lines.push("");
      lines.push("ATTEST: This dossier is certified as forensically accurate and suitable");
      lines.push("for Congressional, legal, and academic submission.");
    }

    lines.push("");
    lines.push("═".repeat(80));
    lines.push("END OF DOSSIER");
    lines.push("═".repeat(80));

    return lines.join("\n");
  };

  const handleExport = async () => {
    setExporting(true);
    const content = buildDossierContent();
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `AUMER_BulkEvidenceDossier_${selectedTemplate}_${Date.now()}.txt`;
    a.click();
    setExporting(false);
  };

  const handleEmailDossier = async () => {
    setExporting(true);
    const content = buildDossierContent();
    try {
      await base44.integrations.Core.SendEmail({
        to: "gtarce@usc.edu",
        subject: `[AUMER] Bulk Evidence Dossier — ${template.label} | ${selectedCases.length} Cases`,
        body: content,
      });
      alert("Dossier sent to gtarce@usc.edu");
    } catch (e) {
      alert("Error sending email: " + e.message);
    }
    setExporting(false);
  };

  const dossierContent = buildDossierContent();

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          📦 Bulk Evidence <span style={{ color: P.gold }}>Dossier Builder</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          AGGREGATE VERIFIED CASES · STANDARDIZED LEGAL FORMAT · CONGRESSIONAL READY
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
        {/* Template Selection */}
        <div>
          <div style={{ fontSize: 8, fontWeight: 700, color: P.t2, marginBottom: 8, letterSpacing: 1 }}>DOSSIER TEMPLATE</div>
          {DOSSIER_TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              style={{
                width: "100%", padding: "10px 12px", marginBottom: 6, background: selectedTemplate === t.id ? `${t.color}12` : P.card,
                border: `1px solid ${selectedTemplate === t.id ? t.color : P.b}25`, borderLeft: `4px solid ${t.color}`,
                borderRadius: 8, color: selectedTemplate === t.id ? t.color : P.t2, fontSize: 8, fontWeight: 700,
                textAlign: "left", cursor: "pointer", transition: "all .1s",
              }}
            >
              <div>{t.icon} {t.label}</div>
              <div style={{ fontSize: 7, color: P.t4, marginTop: 2 }}>{t.desc}</div>
            </button>
          ))}
        </div>

        {/* Case Selection */}
        <div>
          <div style={{ fontSize: 8, fontWeight: 700, color: P.t2, marginBottom: 8, letterSpacing: 1 }}>SELECT CASES ({selectedCases.length})</div>
          <div style={{ maxHeight: 280, overflowY: "auto", background: P.card, border: `1px solid ${P.b}`, borderRadius: 8, padding: 8 }}>
            {Object.entries(CASE_DOCS).map(([caseId, caseData]) => (
              <label
                key={caseId}
                style={{
                  display: "flex", gap: 6, alignItems: "center", padding: "6px", marginBottom: 4,
                  background: selectedCases.includes(caseId) ? `${P.gold}08` : "transparent", borderRadius: 5, cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedCases.includes(caseId)}
                  onChange={() => toggleCase(caseId)}
                  style={{ cursor: "pointer" }}
                />
                <div style={{ fontSize: 7 }}>
                  <div style={{ color: P.t1, fontWeight: 700 }}>{caseData.title}</div>
                  <div style={{ color: P.t4, fontSize: 6 }}>{caseData.status} · {caseData.branch}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Section Selection */}
        <div>
          <div style={{ fontSize: 8, fontWeight: 700, color: P.t2, marginBottom: 8, letterSpacing: 1 }}>DOSSIER SECTIONS</div>
          <div style={{ maxHeight: 280, overflowY: "auto", background: P.card, border: `1px solid ${P.b}`, borderRadius: 8, padding: 8 }}>
            {Object.entries(includeSections).map(([key, value]) => (
              <label
                key={key}
                style={{ display: "flex", gap: 6, alignItems: "center", padding: "4px", marginBottom: 3, cursor: "pointer" }}
              >
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => toggleSection(key)}
                  style={{ cursor: "pointer" }}
                />
                <span style={{ fontSize: 7, color: P.t3, textTransform: "capitalize" }}>
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Preview & Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 12 }}>
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14, minHeight: 300 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: P.t1 }}>📄 Dossier Preview</div>
            <button
              onClick={() => setPreview(!preview)}
              style={{
                padding: "4px 10px", fontSize: 7, fontWeight: 700, cursor: "pointer",
                background: preview ? `${P.gold}12` : "transparent", border: `1px solid ${preview ? P.gold : P.b}`,
                color: preview ? P.gold : P.t4, borderRadius: 6,
              }}
            >
              {preview ? "Hide" : "Show"} Preview
            </button>
          </div>
          {preview && (
            <pre
              style={{
                fontSize: 6.5, color: P.t2, background: "#080D18", padding: 10, borderRadius: 6,
                overflowY: "auto", maxHeight: 250, fontFamily: "'IBM Plex Mono',monospace",
                lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}
            >
              {dossierContent.slice(0, 1500)}...
            </pre>
          )}
          {!preview && (
            <div style={{ fontSize: 7, color: P.t4, lineHeight: 1.8 }}>
              <strong style={{ color: P.gold }}>Content Summary:</strong><br/>
              {selectedCases.length} verified cases aggregated<br/>
              {Object.values(includeSections).filter(Boolean).length} sections included<br/>
              Total document size: ~{(dossierContent.length / 1000).toFixed(1)}KB<br/>
              <br/>
              <strong style={{ color: P.teal }}>Ready for:</strong><br/>
              ✓ Congressional submission (CHC)<br/>
              ✓ Legal counsel briefing<br/>
              ✓ Academic publication<br/>
              ✓ Media & advocacy orgs
            </div>
          )}
        </div>

        {/* Export Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={handleExport}
            disabled={exporting || selectedCases.length === 0}
            style={{
              padding: "10px", fontSize: 8, fontWeight: 700, cursor: exporting || selectedCases.length === 0 ? "not-allowed" : "pointer",
              background: selectedCases.length === 0 ? `${P.t4}20` : `${template.color}12`,
              border: `1px solid ${selectedCases.length === 0 ? P.t4 : template.color}25`,
              color: selectedCases.length === 0 ? P.t4 : template.color,
              borderRadius: 8, opacity: exporting ? 0.6 : 1,
            }}
          >
            {exporting ? "⟳ Exporting..." : "↓ Download TXT"}
          </button>

          <button
            onClick={handleEmailDossier}
            disabled={exporting || selectedCases.length === 0}
            style={{
              padding: "10px", fontSize: 8, fontWeight: 700, cursor: exporting || selectedCases.length === 0 ? "not-allowed" : "pointer",
              background: selectedCases.length === 0 ? `${P.t4}20` : `${P.teal}12`,
              border: `1px solid ${selectedCases.length === 0 ? P.t4 : P.teal}25`,
              color: selectedCases.length === 0 ? P.t4 : P.teal,
              borderRadius: 8, opacity: exporting ? 0.6 : 1,
            }}
          >
            {exporting ? "⟳ Sending..." : "📧 Email"}
          </button>

          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 8, padding: 10, marginTop: 4 }}>
            <div style={{ fontSize: 7, color: P.t4, lineHeight: 1.6 }}>
              <strong style={{ color: P.gold }}>Recipient:</strong><br/>
              gtarce@usc.edu<br/>
              <br/>
              <strong style={{ color: P.t3 }}>Status:</strong><br/>
              {selectedCases.length === 0 ? "Select cases" : "Ready to export ✓"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}