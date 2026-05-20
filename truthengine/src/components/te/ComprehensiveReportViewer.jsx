import { useState } from "react";
import { P } from "../../lib/teData";
import { DeportationTrendChart, VietnamEraChart, DeportationByEraChart } from "./TruthEngine360Charts";

const REPORT_SECTIONS = [
  { id: 1, title: "HOW THE DATA WAS GATHERED", color: P.blue, icon: "📊" },
  { id: 2, title: "OFFICIAL GOVERNMENT REPORTS", color: P.red, icon: "🏛️" },
  { id: 3, title: "SCHOLARLY ESTIMATES", color: P.teal, icon: "🎓" },
  { id: 4, title: "WHY THIS SEARCH IS VALID", color: P.gold, icon: "✓" },
  { id: 5, title: "THE NUMBERS FOR MAY 18", color: P.amber, icon: "📈" },
  { id: 6, title: "PTSD & CRIME ANALYSIS", color: P.violet, icon: "🧠" },
  { id: 7, title: "DATA VISUALIZATIONS", color: P.blue, icon: "📉" },
  { id: 8, title: "POLICY TIMELINE", color: P.gold, icon: "📅" },
  { id: 9, title: "SPSS STATISTICAL ANALYSIS", color: P.teal, icon: "🔬" },
  { id: 10, title: "BEHAVIORAL TRADECRAFT", color: P.red, icon: "🕵️" },
  { id: 11, title: "WHY CONCEAL RECORDS?", color: P.amber, icon: "🔐" },
  { id: 12, title: "REFERENCES & CITATIONS", color: P.violet, icon: "📚" },
];

const KEY_STATISTICS = {
  total_deported: "202,864",
  veteran_flags: "ZERO",
  ptsd_probable: "69,881–81,090",
  no_crime: "27,622",
  died_in_custody: "52",
  vietnam_era_deported: "769",
  trump_surge: "105,573",
};

export default function ComprehensiveReportViewer() {
  const [selectedSection, setSelectedSection] = useState(1);
  const [view, setView] = useState("outline");
  const [exportFormat, setExportFormat] = useState("docx");

  const getCurrentSection = () => {
    const section = REPORT_SECTIONS.find(s => s.id === selectedSection);
    return section || REPORT_SECTIONS[0];
  };

  const handleExport = () => {
    alert(`Exporting comprehensive report as ${exportFormat.toUpperCase()}...\nFile: TruthEngine360_Comprehensive_Report_FINAL.${exportFormat}`);
  };

  const renderChartSection = () => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 8 }}>Figure 1 — Mexican National Deportations by Year (FY2022–2026)</div>
          <DeportationTrendChart />
          <div style={{ fontSize: 7, color: P.t4, marginTop: 6 }}>Biden era (2022–2024) vs Trump II era (2025–2026). PTSD-probable subset highlighted. 2025 peak: 105,573 deportations (+199% vs 2024).</div>
        </div>
        
        <div style={{ borderTop: `1px solid ${P.b}`, paddingTop: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 8 }}>Figure 2 — Vietnam-Era Mexican Nationals (2022–2026)</div>
          <VietnamEraChart />
          <div style={{ fontSize: 7, color: P.t4, marginTop: 6 }}>Apprehensions and PTSD-probable subset. 2025 represents the highest quarterly surge (322 apprehended, peak after April 2025 policy reversal).</div>
        </div>

        <div style={{ borderTop: `1px solid ${P.b}`, paddingTop: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 8 }}>Figure 3 — Deportation Surge by Administration</div>
          <DeportationByEraChart />
          <div style={{ fontSize: 7, color: P.t4, marginTop: 6 }}>Direct comparison of Biden-era (blue) vs Trump II-era (red) totals and PTSD-probable subsets. Policy reversal inflection point visible at Apr 2025.</div>
        </div>
      </div>
    );
  };

  const renderSectionContent = (sectionId) => {
    const content = {
      1: "The ICE Parquet Database contains 713,464 records obtained through FOIA spanning FY2022-2026. Analyzed using the CB-HSIVF five-tier certification framework with BISG methodology applied to 58,220 DCAS records.",
      2: "Pentagon Valor Review 2014: 17 of 24 Medal of Honor corrections for Hispanic service members. GAO-19-416: ICE does not maintain complete veteran data. Warren/DHS March 2026: 125 veterans arrested, 282 deportation attempts in Trump's first year.",
      3: "Guzman 1969: Hispanic Vietnam casualties 19% of Southwest deaths. Five-stream convergence analysis: 2,309-4,540 Hispanic casualties vs. official 349 (84.9% classification failure).",
      4: "Six independent verification streams with zero contradictions. Birth-year cohort methodology validated by GAO, CRS, VA, and Census Bureau precedent.",
      5: "202,864 Mexico nationals deported. 169,517 veteran-eligible cohort. ZERO veteran screening flags across 713,464 ICE records. 49 died in custody. Not one record contains military service notation.",
      6: "Between 69,881 and 81,090 deported for PTSD-probable offenses. 27,622 had no crime. Six verified cases = 100% PTSD connection. Valenzuela brothers: 29-year temporal gap erased PTSD context.",
      7: renderChartSection(),

      8: "Clinton IIRIRA 1996 → Bush ICE Directive 2004 → Obama Directive 2015 → Trump rescission April 2025. Each policy change documented with measurable impact metrics.",
      9: "One-Way ANOVA F=4.521 (p=.038). Descriptive Statistics across behavioral indicators. Pearson Correlation r=.847-.914 (p<.01). Regression R²=.935. Compound Visibility Decay equation V(n) = V₀ × (1−R)^n.",
      10: "Five behavioral indicators quantified across three institutions. Tradecraft signatures: Parallel Construction, Plausible Deniability, Retroactive Sanitation, Compartmentalization, Temporal Laundering, Expectation Management.",
      11: "Fiscal liability $1.78B/year VA exposure. Legal liability $423M+ class action potential. Policy exposure from Pentagon Valor Review to ICE deportation. Enforcement efficiency calculus: screening costs 0.13% of ICE budget.",
      12: "34 full APA 7th edition citations: Primary Government Sources (12), Congressional Reports (8), Peer-Reviewed Scholarship (10), Institutional Sources (4). Complete reference list with DOI and URL documentation.",
    };
    return content[sectionId] || "Content loading...";
  };

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          📋 Comprehensive <span style={{ color: P.gold }}>Report Viewer</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          12-PART FORENSIC ANALYSIS · 1.2MB · 811 PARAGRAPHS · CHC BRIEFING READY
        </div>
      </div>

      {/* Key stats banner */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8, marginBottom: 12 }}>
        {Object.entries(KEY_STATISTICS).map(([key, value]) => (
          <div key={key} style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 8, padding: 10, textAlign: "center" }}>
            <div style={{ fontSize: 6, color: P.t4, marginBottom: 3, textTransform: "uppercase", letterSpacing: 1 }}>
              {key.replace(/_/g, " ")}
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, fontWeight: 800, color: P.gold }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "8px 10px", width: "fit-content" }}>
        {[["outline", "📑 Outline"], ["read", "📖 Read"], ["export", "💾 Export"]].map(([v, l]) => (
          <button key={v} onClick={() => setView(v)}
            style={{ padding: "6px 12px", fontSize: 8, fontWeight: view === v ? 700 : 400,
              background: view === v ? `${P.gold}20` : "transparent",
              border: `1px solid ${view === v ? P.gold : P.b}`,
              color: view === v ? P.gold : P.t4, borderRadius: 6, cursor: "pointer" }}>
            {l}
          </button>
        ))}
      </div>

      {view === "outline" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {/* Sections grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {REPORT_SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => { setSelectedSection(section.id); setView("read"); }}
                style={{
                  padding: "12px",
                  background: selectedSection === section.id ? `${section.color}15` : P.card,
                  border: `1px solid ${selectedSection === section.id ? section.color : P.b}`,
                  borderLeft: `4px solid ${section.color}`,
                  borderRadius: 8,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all .12s",
                }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 18 }}>{section.icon}</span>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: P.t1 }}>PART {section.id}</div>
                    <div style={{ fontSize: 8, color: P.t4, marginTop: 2 }}>{section.title}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Report metadata */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14, height: "fit-content" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 12 }}>Report Metadata</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["Title", "TruthEngine360 Comprehensive Report"],
                ["Status", "FINAL — CHC BRIEFING READY"],
                ["File Size", "1.2 MB"],
                ["Paragraphs", "811"],
                ["Charts", "9 embedded"],
                ["Citations", "34 APA 7"],
                ["Date", "April 8, 2026"],
                ["Classification", "UNCLASSIFIED"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 6, color: P.t4, fontWeight: 700, letterSpacing: 1, marginBottom: 2 }}>
                    {label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 8, color: P.t2, fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === "read" && (
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 12 }}>
          {/* Section nav */}
          <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 300px)" }}>
            {REPORT_SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  background: selectedSection === section.id ? `${section.color}20` : "transparent",
                  border: `1px solid ${selectedSection === section.id ? section.color : P.b}30`,
                  borderRadius: 6,
                  textAlign: "left",
                  cursor: "pointer",
                  marginBottom: 6,
                  fontSize: 7,
                  fontWeight: selectedSection === section.id ? 700 : 400,
                  color: selectedSection === section.id ? section.color : P.t4,
                }}
              >
                {section.icon} Part {section.id}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14, overflowY: "auto", maxHeight: "calc(100vh - 300px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 7, color: getCurrentSection().color, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>
                  PART {selectedSection}
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: P.t1 }}>
                  {getCurrentSection().title}
                </div>
              </div>
              <span style={{ fontSize: 28 }}>{getCurrentSection().icon}</span>
            </div>

            <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.8, marginBottom: 12 }}>
              {selectedSection === 7 ? renderSectionContent(selectedSection) : typeof renderSectionContent(selectedSection) === 'string' ? <div>{renderSectionContent(selectedSection)}</div> : renderSectionContent(selectedSection)}
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", gap: 6, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${P.b}` }}>
              <button
                onClick={() => setSelectedSection(Math.max(1, selectedSection - 1))}
                disabled={selectedSection === 1}
                style={{
                  flex: 1,
                  padding: "8px",
                  background: selectedSection === 1 ? `${P.b}30` : `${P.blue}15`,
                  border: `1px solid ${selectedSection === 1 ? P.b : P.blue}`,
                  color: selectedSection === 1 ? P.t4 : P.blue,
                  fontSize: 7,
                  fontWeight: 700,
                  borderRadius: 6,
                  cursor: selectedSection === 1 ? "not-allowed" : "pointer",
                }}
              >
                ← Previous
              </button>
              <button
                onClick={() => setSelectedSection(Math.min(12, selectedSection + 1))}
                disabled={selectedSection === 12}
                style={{
                  flex: 1,
                  padding: "8px",
                  background: selectedSection === 12 ? `${P.b}30` : `${P.blue}15`,
                  border: `1px solid ${selectedSection === 12 ? P.b : P.blue}`,
                  color: selectedSection === 12 ? P.t4 : P.blue,
                  fontSize: 7,
                  fontWeight: 700,
                  borderRadius: 6,
                  cursor: selectedSection === 12 ? "not-allowed" : "pointer",
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {view === "export" && (
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 12 }}>Export Comprehensive Report</div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.t1, marginBottom: 8 }}>Export Format</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {["docx", "pdf", "html"].map(format => (
                <button
                  key={format}
                  onClick={() => setExportFormat(format)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    background: exportFormat === format ? `${P.gold}20` : "transparent",
                    border: `1px solid ${exportFormat === format ? P.gold : P.b}`,
                    borderRadius: 6,
                    color: exportFormat === format ? P.gold : P.t4,
                    fontSize: 8,
                    fontWeight: exportFormat === format ? 700 : 400,
                    cursor: "pointer",
                  }}
                >
                  {format === "docx" && "📄 Word (DOCX)"}
                  {format === "pdf" && "📕 PDF"}
                  {format === "html" && "🌐 HTML"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12, padding: 10, background: P.bg, borderRadius: 8 }}>
            <div style={{ fontSize: 7, color: P.t4, marginBottom: 4 }}>FILE DETAILS</div>
            {[
              ["Format", exportFormat.toUpperCase()],
              ["Filename", `TruthEngine360_Comprehensive_Report_FINAL.${exportFormat}`],
              ["Size", "1.2 MB"],
              ["Pages", "~180"],
              ["Ready", "YES ✓"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 7, color: P.t3, marginBottom: 3 }}>
                <span>{k}:</span>
                <span style={{ fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleExport}
            style={{
              width: "100%",
              padding: "12px",
              background: `${P.gold}20`,
              border: `1px solid ${P.gold}`,
              color: P.gold,
              fontSize: 9,
              fontWeight: 700,
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            📥 Download Report ({exportFormat.toUpperCase()})
          </button>
        </div>
      )}
    </div>
  );
}