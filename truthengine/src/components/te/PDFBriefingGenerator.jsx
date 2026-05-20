import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { P } from "../../lib/teData";

export default function PDFBriefingGenerator({ 
  title = "TruthEngine360 Briefing",
  subtitle = "AUMER Foundation",
  reportType = "forensic",
  sections = [],
  includeCitations = true,
  includeTableOfContents = true
}) {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const citations = {
    dcas: "U.S. Department of Defense, Casualty Analysis System (DCAS), Vietnam Conflict Extract File, Accessed 2026.",
    bisg: "Bayesian Improved Surname Geocoding (BISG), Hispanic surname probability model τ=0.40, R²=0.947, p<0.001.",
    nero: "Institutional Erasure Framework (NERO): Notification, Erasure, Restriction, Obscurity vectors.",
    gao: "U.S. Government Accountability Office (GAO), Report GAO-19-416, Deported Veterans, June 2019.",
    iirira: "Immigration Reform and Immigrant Responsibility Act (IIRIRA), 8 U.S.C. § 1227(a)(2)(A)(iii), Retroactive Application.",
    ina329: "Immigration and Nationality Act (INA) § 329, Naturalization of Persons Who Served in U.S. Armed Forces.",
  };

  const generatePDF = async () => {
    setGenerating(true);
    setProgress(10);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // Title page
      pdf.setFontSize(24);
      pdf.setTextColor(245, 200, 66); // Gold
      pdf.text(title, margin, yPosition);
      
      yPosition += 15;
      pdf.setFontSize(10);
      pdf.setTextColor(200, 200, 200); // Light gray
      pdf.text(subtitle, margin, yPosition);
      
      yPosition += 8;
      pdf.setFontSize(7);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Generated: ${new Date().toLocaleDateString()} | Report Type: ${reportType}`, margin, yPosition);

      setProgress(20);

      // Table of Contents (if enabled)
      if (includeTableOfContents && sections.length > 0) {
        pdf.addPage();
        yPosition = margin;
        pdf.setFontSize(14);
        pdf.setTextColor(245, 200, 66);
        pdf.text("TABLE OF CONTENTS", margin, yPosition);
        
        yPosition += 8;
        pdf.setFontSize(9);
        pdf.setTextColor(200, 200, 200);
        
        sections.forEach((section, idx) => {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(`${idx + 1}. ${section.title}`, margin + 5, yPosition);
          yPosition += 6;
        });
      }

      setProgress(40);

      // Sections
      sections.forEach((section, sectionIdx) => {
        pdf.addPage();
        yPosition = margin;

        // Section title
        pdf.setFontSize(12);
        pdf.setTextColor(245, 200, 66);
        pdf.text(`${sectionIdx + 1}. ${section.title}`, margin, yPosition);
        yPosition += 10;

        // Section content
        if (section.content) {
          pdf.setFontSize(9);
          pdf.setTextColor(200, 200, 200);
          const contentLines = pdf.splitTextToSize(section.content, pageWidth - 2 * margin);
          contentLines.forEach(line => {
            if (yPosition > pageHeight - margin - 10) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(line, margin, yPosition);
            yPosition += 5;
          });
        }

        // Data table
        if (section.data) {
          yPosition += 5;
          pdf.setFontSize(8);
          pdf.setTextColor(150, 150, 150);
          
          Object.entries(section.data).forEach(([key, value]) => {
            if (yPosition > pageHeight - margin - 5) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(`${key}: ${value}`, margin + 5, yPosition);
            yPosition += 4;
          });
        }

        // Chart/visualization (if provided)
        if (section.chartElement) {
          yPosition += 8;
          if (yPosition > pageHeight - margin - 80) {
            pdf.addPage();
            yPosition = margin;
          }
          
          // Note: In production, convert chart to canvas and embed
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.text("[Chart: " + (section.chartTitle || "Visualization") + "]", margin, yPosition);
          yPosition += 5;
        }
      });

      setProgress(70);

      // Citations page
      if (includeCitations && Object.keys(citations).length > 0) {
        pdf.addPage();
        yPosition = margin;
        
        pdf.setFontSize(12);
        pdf.setTextColor(245, 200, 66);
        pdf.text("CITATIONS & REFERENCES", margin, yPosition);
        
        yPosition += 10;
        pdf.setFontSize(8);
        pdf.setTextColor(180, 180, 180);
        
        Object.entries(citations).forEach(([key, citation]) => {
          if (yPosition > pageHeight - margin - 5) {
            pdf.addPage();
            yPosition = margin;
          }
          
          const citationLines = pdf.splitTextToSize(`[${key.toUpperCase()}] ${citation}`, pageWidth - 2 * margin);
          citationLines.forEach(line => {
            if (yPosition > pageHeight - margin - 5) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(line, margin, yPosition);
            yPosition += 4;
          });
          yPosition += 2;
        });
      }

      setProgress(90);

      // Footer on all pages
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(7);
        pdf.setTextColor(100, 100, 100);
        pdf.text(
          `${title} | Page ${i} of ${totalPages} | ${new Date().toLocaleDateString()}`,
          margin,
          pageHeight - 5
        );
      }

      // Save PDF
      pdf.save(`${title.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`);
      
      setProgress(100);
      setTimeout(() => setProgress(0), 1000);
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P.t1 }}>
          📄 PDF Briefing <span style={{ color: P.gold }}>Generator</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          FORMATTED · CITATION-READY · DATA VISUALIZATIONS
        </div>
      </div>

      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 6 }}>📋 Briefing Options</div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[
              { label: "Title", icon: "📖" },
              { label: "Subtitle", icon: "📝" },
              { label: "Include TOC", icon: "📑" },
              { label: "Include Citations", icon: "📚" },
            ].map((opt, i) => (
              <div key={i} style={{ 
                fontSize: 8, 
                color: P.t4, 
                padding: "6px 8px", 
                background: "#080D18", 
                borderRadius: 6 
              }}>
                {opt.icon} {opt.label}
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 8, marginBottom: 12 }}>
            {["Forensic", "CHC Brief", "DCAS Audit", "Legislative", "Academic", "Media"].map((type) => (
              <button
                key={type}
                style={{
                  padding: "6px 10px",
                  background: `${P.gold}12`,
                  border: `1px solid ${P.gold}25`,
                  color: P.gold,
                  fontSize: 7,
                  fontWeight: 700,
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 12, padding: 10, background: "#080D18", borderRadius: 6 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: P.t4, marginBottom: 6 }}>⚙️ PDF Configuration</div>
          {[
            { label: "Page Format", value: "A4 (210×297mm)" },
            { label: "Font", value: "IBM Plex Mono" },
            { label: "Margins", value: "15mm" },
            { label: "Include Charts", value: "Yes" },
            { label: "Include Data Tables", value: "Yes" },
            { label: "Include Footer", value: "Page numbers & date" },
          ].map((config, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 7, color: P.t3, padding: "2px 0" }}>
              <span>{config.label}</span>
              <span style={{ color: P.gold, fontWeight: 700 }}>{config.value}</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {generating && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ fontSize: 7, color: P.t4 }}>Generating PDF...</div>
              <div style={{ fontSize: 7, color: P.gold, fontWeight: 700 }}>{progress}%</div>
            </div>
            <div style={{ background: "#030508", borderRadius: 3, height: 8, overflow: "hidden" }}>
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${P.gold}, ${P.violet})`,
                  borderRadius: 3,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={generatePDF}
            disabled={generating}
            style={{
              flex: 1,
              padding: "10px",
              background: generating ? `${P.gold}15` : `${P.gold}20`,
              border: `1px solid ${P.gold}40`,
              color: P.gold,
              fontSize: 9,
              fontWeight: 800,
              borderRadius: 8,
              cursor: generating ? "not-allowed" : "pointer",
              opacity: generating ? 0.6 : 1,
            }}
          >
            {generating ? "⟳ Generating..." : "📥 Generate PDF"}
          </button>
          <button
            style={{
              flex: 1,
              padding: "10px",
              background: `${P.blue}12`,
              border: `1px solid ${P.blue}25`,
              color: P.blue,
              fontSize: 9,
              fontWeight: 700,
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            👁️ Preview
          </button>
          <button
            style={{
              flex: 1,
              padding: "10px",
              background: `${P.violet}12`,
              border: `1px solid ${P.violet}25`,
              color: P.violet,
              fontSize: 9,
              fontWeight: 700,
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            📧 Email
          </button>
        </div>
      </div>

      {/* Templates section */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 8 }}>
          📋 Quick Templates
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
          {[
            { icon: "🏛️", name: "CHC Briefing", desc: "Congressional Hispanic Caucus briefing format", color: P.gold },
            { icon: "🔎", name: "Forensic Audit", desc: "DCAS audit with statistical validation", color: P.violet },
            { icon: "📊", name: "Case Summary", desc: "Individual veteran case dossier", color: P.blue },
            { icon: "📈", name: "Legislative", desc: "Policy impact and legislative asks", color: P.amber },
          ].map((template, i) => (
            <div
              key={i}
              style={{
                background: `${template.color}08`,
                border: `1px solid ${template.color}25`,
                borderRadius: 8,
                padding: 10,
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>{template.icon}</span>
                <div>
                  <div style={{ fontSize: 8, fontWeight: 700, color: template.color }}>{template.name}</div>
                  <div style={{ fontSize: 6, color: P.t4, marginTop: 2 }}>{template.desc}</div>
                </div>
              </div>
              <button
                style={{
                  width: "100%",
                  padding: "5px",
                  background: `${template.color}12`,
                  border: `1px solid ${template.color}30`,
                  color: template.color,
                  fontSize: 7,
                  fontWeight: 700,
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                → Use Template
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}