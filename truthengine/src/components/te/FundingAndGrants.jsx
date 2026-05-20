import { useState } from "react";
import { P } from "../../lib/teData";

const FUNDING_SOURCES = [
  {
    id: "f001", org: "National Science Foundation (NSF)", program: "Law & Science",
    amount: "$500K–$2M", deadline: "2026-06-15", status: "ELIGIBLE",
    focus: "Forensic data analysis, BISG methodology validation, DCAS audit",
    contact: "program-director@nsf.gov", color: P.blue,
  },
  {
    id: "f002", org: "Spencer Foundation", program: "Research on Education Policy",
    amount: "$50K–$250K", deadline: "2026-05-01", status: "ELIGIBLE",
    focus: "Institutional gaps, university partnerships, policy research",
    contact: "grants@spencer.org", color: P.teal,
  },
  {
    id: "f003", org: "National Endowment for Humanities (NEH)", program: "Humanities in the Public Square",
    amount: "$100K–$350K", deadline: "2026-09-15", status: "ELIGIBLE",
    focus: "Veterans oral history, manuscript publication, public scholarship",
    contact: "public-scholar@neh.gov", color: P.violet,
  },
  {
    id: "f004", org: "Ford Foundation", program: "Democracy, Rights & Justice",
    amount: "$250K–$1M", deadline: "2026-04-30", status: "URGENT",
    focus: "Immigrant rights advocacy, legal research, Congressional support",
    contact: "justice@fordfound.org", color: P.red,
  },
  {
    id: "f005", org: "Mellon Foundation", program: "Higher Learning",
    amount: "$150K–$500K", deadline: "2026-07-20", status: "ELIGIBLE",
    focus: "University partnerships, student training, digital archive",
    contact: "highered@mellon.org", color: P.amber,
  },
  {
    id: "f006", org: "Open Society Foundations (OSF)", program: "Justice",
    amount: "$200K–$800K", deadline: "2026-05-15", status: "ELIGIBLE",
    focus: "Immigration policy, institutional accountability, advocacy",
    contact: "justice@opensocietyfoundations.org", color: P.gold,
  },
  {
    id: "f007", org: "Congressional Member Organizations", program: "CHC / CBC Appropriations",
    amount: "$500K–$5M", deadline: "2026-03-31", status: "ACTIVE",
    focus: "Congressional Hispanic Caucus briefing support, Legislative advocacy",
    contact: "grants@chc.gov", color: P.red,
  },
];

const GRANT_TEMPLATE = {
  project_title: "TruthEngine360: Forensic Civic Intelligence for Deported Veteran Justice",
  abstract: `This project combines DCAS forensic analysis, BISG demographic estimation, and institutional NERO scoring to document 
    the erasure of Hispanic military service and the retroactive deportation of non-citizen veterans under IIRIRA. We aim to: 
    (1) complete DCAS forensic re-audit validating 2,309 Hispanic Vietnam casualties; 
    (2) publish peer-reviewed research on institutional erasure mechanisms; 
    (3) support Congressional advocacy for INA §329 restoration and VA-ICE data sharing; 
    (4) train next-generation immigrant justice researchers.`,
  budget: "$250,000–$500,000 over 2 years",
  outcomes: [
    "6 verified CB-HSIVF cases with SHA-256 cryptographic certification",
    "DCAS forensic audit report (BISG R²=0.947 validation)",
    "3–4 peer-reviewed publications (Armed Forces & Society, Law & Society Review, etc.)",
    "Congressional testimony & CHC briefing materials",
    "University of Utah / WSU / Shippensburg partnerships established",
    "Institutional NERO scoring framework published",
    "Curriculum for immigration justice / veteran studies courses",
  ],
};

export default function FundingAndGrants() {
  const [selectedFunding, setSelectedFunding] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [daysToDeadline, setDaysToDeadline] = useState({});

  const calculateDays = (dateStr) => {
    const deadline = new Date(dateStr);
    const today = new Date("2026-04-09");
    return Math.ceil((deadline - today) / 86400000);
  };

  const filtered = FUNDING_SOURCES.filter(f =>
    filterStatus === "all" || f.status === filterStatus
  );

  const urgentCount = FUNDING_SOURCES.filter(f => calculateDays(f.deadline) <= 30).length;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          💰 Grants & <span style={{ color: P.gold }}>Funding</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          NSF · FORD · MELLON · NEH · OSF · CONGRESSIONAL APPROPRIATIONS
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 7, marginBottom: 10 }}>
        {[
          ["Total Opportunities", FUNDING_SOURCES.length, P.blue],
          ["⚠️ Urgent (≤30d)", urgentCount, P.red],
          ["Total Available", "$2.5M–$10M+", P.gold],
          ["Avg Grant Size", "$350K", P.teal],
        ].map(([label, value, color]) => (
          <div key={label} style={{ background: P.card, border: `1px solid ${color}25`, borderLeft: `3px solid ${color}`, borderRadius: 7, padding: "7px 10px" }}>
            <div style={{ fontSize: 6, color: P.t4 }}>{label}</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        {["all", "URGENT", "ACTIVE", "ELIGIBLE"].map(status => {
          const count = status === "all" ? FUNDING_SOURCES.length : FUNDING_SOURCES.filter(f => f.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: "5px 12px", fontSize: 7, fontWeight: 700, cursor: "pointer",
                background: filterStatus === status ? `${P.gold}20` : "transparent",
                border: `1px solid ${filterStatus === status ? P.gold : P.b}`,
                color: filterStatus === status ? P.gold : P.t4, borderRadius: 20,
              }}
            >
              {status === "all" ? "All" : status} ({count})
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Funding list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(f => {
            const isSelected = selectedFunding?.id === f.id;
            const daysLeft = calculateDays(f.deadline);
            const isUrgent = daysLeft <= 30;
            return (
              <div
                key={f.id}
                onClick={() => setSelectedFunding(isSelected ? null : f)}
                style={{
                  background: isSelected ? `${f.color}12` : "#080D18",
                  border: `1px solid ${isSelected ? f.color : isUrgent ? P.red : P.b}`,
                  borderLeft: `4px solid ${f.color}`,
                  borderRadius: 8,
                  padding: "10px 12px",
                  cursor: "pointer",
                  opacity: isUrgent ? 1 : 0.9,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: f.color }}>{f.org}</span>
                  {isUrgent && <span style={{ fontSize: 6, fontWeight: 700, color: P.red, background: `${P.red}20`, padding: "1px 7px", borderRadius: 20 }}>⚠️ {daysLeft}d</span>}
                </div>
                <div style={{ fontSize: 8, color: P.t2, marginBottom: 2 }}>{f.program}</div>
                <div style={{ fontSize: 7, color: P.t4 }}>{f.amount}</div>
              </div>
            );
          })}
        </div>

        {/* Details panel */}
        <div>
          {selectedFunding ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Header */}
              <div style={{
                background: P.card, border: `1px solid ${selectedFunding.color}30`,
                borderLeft: `4px solid ${selectedFunding.color}`, borderRadius: 10, padding: "12px 16px"
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: selectedFunding.color, marginBottom: 2 }}>
                  {selectedFunding.org}
                </div>
                <div style={{ fontSize: 8, color: P.t3, marginBottom: 6 }}>{selectedFunding.program}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 6, color: P.t4 }}>AWARD</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: P.gold }}>{selectedFunding.amount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 6, color: P.t4 }}>DEADLINE</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: calculateDays(selectedFunding.deadline) <= 30 ? P.red : P.teal }}>
                      {selectedFunding.deadline}
                    </div>
                  </div>
                </div>
              </div>

              {/* Focus */}
              <div style={{
                background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "10px 14px"
              }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: P.t2, marginBottom: 6, letterSpacing: 1 }}>FOCUS AREAS</div>
                <div style={{ fontSize: 7, color: P.t3, lineHeight: 1.6 }}>{selectedFunding.focus}</div>
              </div>

              {/* Contact */}
              <a href={`mailto:${selectedFunding.contact}`}
                style={{
                  padding: "8px 14px", textAlign: "center", fontSize: 7, fontWeight: 700,
                  background: `${selectedFunding.color}12`, border: `1px solid ${selectedFunding.color}25`,
                  color: selectedFunding.color, borderRadius: 8, textDecoration: "none", cursor: "pointer",
                }}
              >
                📧 {selectedFunding.contact} ↗
              </a>
            </div>
          ) : (
            <div style={{
              background: P.card, border: `1px solid ${P.b}`, borderRadius: 10,
              padding: 30, textAlign: "center", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", minHeight: 350
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>💡</div>
              <div style={{ fontSize: 8, color: P.t4, lineHeight: 1.6 }}>
                Select a funding source<br />to view details and<br />download grant template
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grant template */}
      <div style={{ marginTop: 16, background: P.card, border: `1px solid ${P.violet}30`, borderRadius: 10, padding: "16px 18px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.violet, marginBottom: 10 }}>
          📋 STANDARD GRANT PROPOSAL TEMPLATE
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ fontSize: 7, color: P.t4, fontWeight: 700, marginBottom: 4, letterSpacing: 1 }}>PROJECT TITLE</div>
            <div style={{ fontSize: 8, color: P.t2, lineHeight: 1.5, marginBottom: 8 }}>{GRANT_TEMPLATE.project_title}</div>

            <div style={{ fontSize: 7, color: P.t4, fontWeight: 700, marginBottom: 4, letterSpacing: 1 }}>BUDGET</div>
            <div style={{ fontSize: 8, color: P.gold, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700 }}>
              {GRANT_TEMPLATE.budget}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 7, color: P.t4, fontWeight: 700, marginBottom: 4, letterSpacing: 1 }}>EXPECTED OUTCOMES</div>
            {GRANT_TEMPLATE.outcomes.map((outcome, idx) => (
              <div key={idx} style={{ fontSize: 7, color: P.t3, marginBottom: 3, paddingLeft: 12, borderLeft: `2px solid ${P.violet}30` }}>
                • {outcome}
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${P.b}20` }}>
          <div style={{ fontSize: 7, color: P.t4, fontWeight: 700, marginBottom: 5, letterSpacing: 1 }}>ABSTRACT</div>
          <div style={{ fontSize: 7, color: P.t3, lineHeight: 1.8 }}>{GRANT_TEMPLATE.abstract}</div>
        </div>
      </div>
    </div>
  );
}