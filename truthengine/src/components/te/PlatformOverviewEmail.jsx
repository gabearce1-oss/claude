import { useState } from "react";
import { P } from "../../lib/teData";

const EMAIL_TEMPLATE = {
  subject: "TruthEngine360 Platform Overview: Forensic Intelligence for Veteran Deportation Research",
  body: `Dear Congressional Partner,

We are writing to introduce TruthEngine360, a comprehensive forensic intelligence platform developed by the AUMER Foundation to systematically map and analyze the intersection of military service, immigration policy, and institutional data gaps affecting non-citizen veterans.

═══════════════════════════════════════════════════════════════

PLATFORM CAPABILITIES

📊 DATA ANALYSIS & FORENSICS
• DCAS Vietnam Casualty Audit: 58,220 records analyzed; 84.9% Hispanic classification failure rate identified
• BISG Demographic Classification: 2,309 estimated Hispanic casualties (τ=0.40 threshold, R²=0.947)
• 5-Stream Convergence Analysis: Validation across DCAS, NARA, Guzmán (1969), LAE Database, BISG methodologies
• Undercount Factor: 6.6× minimum gap between official (349) and forensic (2,309) estimates

🎖️ CASE MANAGEMENT & VERIFICATION
• 6 CB-HSIVF Certified Cases: Gold tier (2), Silver tier (3), Bronze tier (1)
• SHA-256 Cryptographic Verification: All cases undergo forensic audit certification
• Evidence Ledger: Complete chain of custody documentation
• Cross-case Relationship Mapping: Network graph linking institutional failures to individual deportations

⚖️ LEGAL FRAMEWORK ANALYSIS
• INA §329 Wartime Naturalization: Precedent research and policy interpretation
• IIRIRA §237 Retroactive Deportation: Grounds analysis and retroactive application mapping
• SCRA Protections: Service member query protocols and VA mandate analysis
• Case Law Database: Immigration court decisions, administrative appeals, habeas corpus findings

🔬 ADVANCED ML MODELS
• Churn Model: 84.7% accuracy predicting case attrition
• Risk Engine: 89.1% accuracy in deportation risk assessment
• BISG Classification: 93.7% accuracy in demographic estimation
• Real-time Validation: Training curves, feature importance (SHAP), confidence scoring
• Explainability Framework: Counterfactuals, fairness metrics, disparate impact analysis

📋 FOIA & INSTITUTIONAL TRACKING
• 3 FOIA Requests Monitored: F001 (VA BIRLS, 83d overdue), F002 (ICE ENFORCE, 66d overdue)
• Escalation Protocols: Congressional inquiry letters, GAO coordination
• Agency Intelligence: DHS enforcement metrics, USCIS processing times, VA benefit lockouts
• Data Gap Analysis: Institutional Erasure (NERO) framework scoring

🧠 RESEARCH INQUIRY ENGINE
• 6 Inquiry Types: Legal Precedent, Policy Analysis, Academic Research, Case Law, FOIA Strategy, Agency Intel
• Search Across 40+ Documents: Full-text search, category filtering, tag-based discovery
• Analysis Modes:
  - Think Fast: 30-second summary with key takeaways
  - Deep Think: 2-minute detailed synthesis and implications
  - Deep Research: 5-minute exhaustive investigation with citations and methodology

🌍 GEOSPATIAL INTELLIGENCE
• Deported Veteran Mapping: Location tracking for 6 CB-HSIVF cases across Mexico, Thailand, Colombia
• Intake Center Networks: Nogales, El Paso, San Diego, Rio Grande Valley, Bangkok shelter mapping
• Border Crossing Heatmap: Weekly crossing volume analysis (McAllen-Reynosa: 5,600/week peak)
• Institutional Facility Database: Capacity, detention status, and family separation data

📊 MILITARY NATURALIZATION ANALYSIS
• USCIS CLAIMS4/ELIS Data: FY2020–2024 trends by country of birth
• Mexico #3 Country: 3,670 naturalizations (7% of total), 111,000 at-risk Mexican immigrant veterans
• Branch of Service Breakdown: Army (60%), Navy (20%), Air Force (11%), Marines (7%), Coast Guard (0.4%)
• FY24 Surge: +34% YoY increase (800→1,150 Mexican-born naturalizations)
• Peer-Reviewed Research: Simon et al. (2024) Armed Forces & Society validation

💡 INSTITUTIONAL ANALYSIS
• NERO Framework: 4-vector institutional erasure scoring
  - Notification (N): 88/100 — No VA-ICE automatic query mandate
  - Erasure (E): 96/100 — DCAS Hispanic misclassification persists
  - Restriction (R): 79/100 — IIRIRA §237 & MAVNI cancellation block naturalization
  - Obscurity (O): 94/100 — 92 confirmed vs. 94,000+ estimated deportations
• Combined Index: 94.5/100 — CRITICAL THRESHOLD EXCEEDED on all 4 vectors
• Policy Gap Analysis: Executive orders, agency directives, Congressional precedent

📚 KNOWLEDGE BASE
• 40+ Curated Documents: Legal precedent, policy briefs, academic research, FOIA packets
• Categories: Legal (10), Congressional (8), Research (12), Data (7), Technical (3)
• Document Analysis: Think Fast, Deep Think, Deep Research modes for rapid synthesis

🏛️ CONGRESSIONAL BRIEFING TOOLS
• CHC Brief Generator: Automated report building for May 18, 2026 presentation
• 6 Legislative Asks: IIRIRA repeal, DCAS audit, BISG validation, VA-ICE mandate, FOIA escalation, research funding
• Evidence Package: Forensic case files, institutional analysis, statistical convergence
• Live Countdown: 39 days to briefing deadline (real-time tracking)

⚡ LIVE SYSTEM STATUS
• Real-time Marquee: Critical FOIA deadlines, case alerts, NERO scores, data updates
• System Health Dashboard: Engine status, pipeline status, integration status, data freshness
• Predictive Analytics: Case attrition forecasts, deportation risk projections, NERO score trends
• Machine Learning Validation: Real-time training curves, accuracy monitoring, feature importance

═══════════════════════════════════════════════════════════════

KEY STATISTICS

⧸ DCAS Undercount: 349 official → 2,309 BISG estimate (84.9% failure)
⧸ Mexican Immigrant Veterans: 111,000 at-risk population
⧸ FOIA Overdue: 2 requests (F001, F002) totaling 149 days past deadline
⧸ Cases Verified: 6 certifications (SHA-256 cryptographic audit)
⧸ NERO Index: 94.5/100 (institutional erasure confirmed)
⧸ Military Naturalization: 52,500 FY20–24; Mexico = 3,670 (7%)
⧸ ML Model Accuracy: Churn 84.7% / Risk 89.1% / BISG 93.7%
⧸ CHC Briefing: 39 days (May 18, 2026)

═══════════════════════════════════════════════════════════════

USE CASES

✓ Congressional Briefing Package: Automated evidence compilation for legislative testimony
✓ GAO Coordination: Institutional data gap analysis and audit support
✓ Peer-Reviewed Research: Quantitative validation and statistical methodology
✓ Advocacy Support: Risk assessment and case prioritization for pro bono legal representation
✓ Policy Analysis: IIRIRA implications, VA benefit lockout mechanisms, SCRA violation detection
✓ Media & Academic Outreach: Institutional framework documentation, demographic analysis, historical context

═══════════════════════════════════════════════════════════════

NEXT STEPS

1. Schedule Platform Demo: 30-minute walkthrough of case management, analysis tools, and briefing automation
2. Access Briefing Package: Complete evidence set for May 18 Congressional Hispanic Caucus presentation
3. Participate in FOIA Coordination: Real-time escalation tracking and agency response protocols
4. Request Custom Analysis: Targeted research inquiries on specific legal, policy, or demographic questions

For questions or to arrange a demonstration, please contact the AUMER Foundation.

Best regards,
AUMER Foundation
TruthEngine360 Development Team

"Forensic Civic Intelligence for Institutional Accountability"`,
};

const PLATFORM_FEATURES = [
  { icon: "📊", category: "Data Analysis", features: ["DCAS Audit (84.9% failure)", "BISG Classification", "5-Stream Convergence", "Statistical Validation"] },
  { icon: "🎖️", category: "Case Management", features: ["6 Certified Cases", "SHA-256 Verification", "Evidence Ledger", "Network Mapping"] },
  { icon: "⚖️", category: "Legal Research", features: ["INA §329 Analysis", "IIRIRA Tracking", "SCRA Protocols", "Case Law Database"] },
  { icon: "🔬", category: "ML Models", features: ["Churn (84.7%)", "Risk (89.1%)", "BISG (93.7%)", "Explainability"] },
  { icon: "📋", category: "FOIA Tools", features: ["Request Tracking", "Escalation", "Agency Intel", "Gap Analysis"] },
  { icon: "🧠", category: "Research Engine", features: ["Think Fast (30s)", "Deep Think (2m)", "Deep Research (5m)", "40+ Documents"] },
  { icon: "🌍", category: "Geospatial", features: ["Veteran Mapping", "Intake Centers", "Border Heatmap", "Facility Database"] },
  { icon: "📚", category: "Knowledge Base", features: ["Full-Text Search", "Category Filter", "3 Analysis Modes", "Citation Export"] },
];

export default function PlatformOverviewEmail() {
  const [view, setView] = useState("email");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const fullEmail = `To: [Congressional Partner]\nSubject: ${EMAIL_TEMPLATE.subject}\n\n${EMAIL_TEMPLATE.body}`;
    navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          📧 Platform <span style={{ color: P.gold }}>Overview Email</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          PROFESSIONAL OUTREACH TEMPLATE · READY-TO-SEND
        </div>
      </div>

      {/* View tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "8px 10px", width: "fit-content" }}>
        {[["email", "📧 Email"], ["features", "✨ Feature Matrix"]].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: "6px 12px",
              background: view === v ? `${P.gold}20` : "transparent",
              border: `1px solid ${view === v ? P.gold : P.b}`,
              color: view === v ? P.gold : P.t4,
              fontSize: 8,
              fontWeight: view === v ? 700 : 400,
              cursor: "pointer",
              borderRadius: 6,
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {view === "email" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 12 }}>
          {/* Email body */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: P.t4, letterSpacing: 1, marginBottom: 3 }}>SUBJECT</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: P.gold }}>{EMAIL_TEMPLATE.subject}</div>
            </div>

            <div style={{ background: P.bg, borderRadius: 8, padding: 16, fontFamily: "'Courier New', monospace", fontSize: 7, color: P.t2, lineHeight: 1.8, whiteSpace: "pre-wrap", wordWrap: "break-word", maxHeight: "calc(100vh - 400px)", overflowY: "auto", marginBottom: 12 }}>
              {EMAIL_TEMPLATE.body}
            </div>

            <button
              onClick={handleCopy}
              style={{
                width: "100%",
                padding: "12px",
                background: copied ? `${P.teal}20` : `${P.gold}20`,
                border: `1px solid ${copied ? P.teal : P.gold}`,
                color: copied ? P.teal : P.gold,
                fontSize: 9,
                fontWeight: 700,
                borderRadius: 8,
                cursor: "pointer",
                transition: "all .2s",
              }}
            >
              {copied ? "✓ Copied to Clipboard" : "📋 Copy Full Email"}
            </button>
          </div>

          {/* Action sidebar */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 10 }}>Quick Actions</div>
            {[
              { label: "Download PDF", icon: "📄", color: P.blue },
              { label: "Send via Email", icon: "📤", color: P.amber },
              { label: "Schedule Follow-up", icon: "📅", color: P.teal },
              { label: "Share Link", icon: "🔗", color: P.violet },
            ].map((action, i) => (
              <button
                key={i}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  background: `${action.color}10`,
                  border: `1px solid ${action.color}25`,
                  color: action.color,
                  fontSize: 8,
                  fontWeight: 700,
                  borderRadius: 6,
                  cursor: "pointer",
                  marginBottom: 6,
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span>{action.icon}</span>
                {action.label}
              </button>
            ))}

            <div style={{ marginTop: 12, padding: 10, background: P.bg, borderRadius: 8, border: `1px solid ${P.b}` }}>
              <div style={{ fontSize: 7, fontWeight: 700, color: P.t4, letterSpacing: 1, marginBottom: 6 }}>EMAIL STATS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {[
                  ["Word Count", "1,240"],
                  ["Sections", "11"],
                  ["Data Points", "24"],
                  ["Features Listed", "50+"],
                  ["Case Studies", "6"],
                  ["Legal References", "8"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 6, color: P.t4 }}>
                    <span>{k}</span>
                    <span style={{ fontWeight: 700, color: P.gold }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {view === "features" && (
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 12 }}>TruthEngine360 Capabilities Matrix</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 10 }}>
            {PLATFORM_FEATURES.map((feat, i) => (
              <div
                key={i}
                style={{
                  background: P.card,
                  border: `1px solid ${P.b}`,
                  borderTop: `3px solid ${P.gold}`,
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div style={{ fontSize: 14, marginBottom: 2 }}>{feat.icon}</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 10 }}>{feat.category}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {feat.features.map((f, j) => (
                    <div key={j} style={{ fontSize: 7, color: P.t3, padding: "4px 8px", background: P.bg, borderRadius: 4, display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ color: P.gold }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}