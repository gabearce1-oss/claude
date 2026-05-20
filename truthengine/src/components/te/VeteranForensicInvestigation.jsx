import { useState } from "react";
import { P } from "../../lib/teData";
import InternationalRecordsMatcher from "./InternationalRecordsMatcher";
import AgencyChainOfCustody from "./AgencyChainOfCustody";
import InvestigationQueryBuilder from "./InvestigationQueryBuilder";

const INVESTIGATION_PATHWAYS = [
  {
    id: "sss",
    name: "Selective Service System (RG 147)",
    icon: "📋",
    source: "NARA St. Louis",
    dataset: "Draft Registration Cards 1959-1975",
    value: "8,000–15,000",
    status: "Available",
    methodology: "Query for: country_of_birth = 'MEXICO' OR alien_registration_number IS NOT NULL",
    records: ["Name", "DOB", "Place of Birth", "A-Number", "Draft Board", "Classification"],
    foia: "FOIA-RG147-001",
    timeline: "30-60 days",
    yield: "Est. 500–800 matching cards",
  },
  {
    id: "dcas",
    name: "Defense Casualty Analysis System",
    icon: "⚰️",
    source: "NARA / DMDC",
    dataset: "Vietnam Conflict KIA Extract (58,220 records)",
    value: "150–500",
    status: "Pending FOIA",
    methodology: "Supplement FOIA-2026-003: home_of_record_country = 'MEXICO'",
    records: ["Name", "DOB", "Home of Record", "Branch", "Unit", "KIA Date"],
    foia: "FOIA-2026-003 (Supplement)",
    timeline: "45-90 days",
    yield: "Direct count of Mexico-born KIA",
  },
  {
    id: "uscis",
    name: "USCIS N-644 Posthumous Citizenship",
    icon: "📜",
    source: "USCIS Records Center",
    dataset: "Form N-644 Applications (1990–present)",
    value: "200–400",
    status: "FOIA Request",
    methodology: "Query: country_of_origin = 'MEXICO' AND service_period = '1961-1978'",
    records: ["Deceased Name", "Country of Origin", "Service Branch", "Date of Death", "Family Applicant"],
    foia: "FOIA-USCIS-N644",
    timeline: "60-120 days",
    yield: "Families who pursued citizenship post-mortem",
  },
  {
    id: "va-dic",
    name: "VA Dependency & Indemnity Compensation",
    icon: "💰",
    source: "VA BIRLS Database",
    dataset: "DIC Payments 1965–present",
    value: "100–300",
    status: "FOIA Request",
    methodology: "Query: recipient_address CONTAINS 'MEXICO' AND service_date_end = 'KIA' AND era = 'Vietnam'",
    records: ["Servicemember Name", "Recipient Address", "Payment Amount", "Effective Date"],
    foia: "FOIA-VA-BIRLS-DIC",
    timeline: "60-90 days",
    yield: "Non-citizen families receiving benefits to Mexico addresses",
  },
  {
    id: "sre",
    name: "Mexico SRE Consular Records",
    icon: "🇲🇽",
    source: "Secretaría de Relaciones Exteriores",
    dataset: "Actas de Defunción (Death Certificates) 1964–1975",
    value: "200–800",
    status: "INAI Request",
    methodology: "Request: 'Actas de defunción para ciudadanos mexicanos fallecidos en servicio militar estadounidense'",
    records: ["Name", "Birth Date", "Death Date", "Place of Death", "Consulate", "Repatriation Status"],
    foia: "INAI-SRE-ACTAS",
    timeline: "30-45 days (Mexico)",
    yield: "Direct Mexican govt records of U.S. military deaths",
  },
  {
    id: "cbp",
    name: "CBP Customs Manifests",
    icon: "📦",
    source: "Customs and Border Protection (TECS)",
    dataset: "Human Remains Shipments 1965–1975",
    value: "50–200",
    status: "FOIA Request",
    methodology: "Query: cargo_type = 'HUMAN_REMAINS' AND origin = ['DOVER_AFB', 'TRAVIS_AFB', 'NORTON_AFB'] AND destination = 'MEXICO'",
    records: ["Manifest Date", "Deceased Name", "Origin Facility", "Consulate", "Border Port"],
    foia: "FOIA-CBP-MANIFESTS",
    timeline: "60-120 days",
    yield: "Physical repatriation records to Mexico",
  },
];

const CROSS_REFERENCE_MATRIX = [
  { step: 1, source: "SSS Cards", extract: "A-Number + Mexico birthplace", count: "500–800" },
  { step: 2, source: "DCAS KIA", match: "Name + DOB against DCAS Vietnam extract", count: "150–500" },
  { step: 3, source: "USCIS N-644", validate: "Posthumous citizenship filings by family", count: "50–150" },
  { step: 4, source: "VA BIRLS", confirm: "DIC payments to Mexico addresses", count: "80–200" },
  { step: 5, source: "SRE Actas", corroborate: "Mexican death certificates from consulates", count: "100–300" },
  { step: 6, source: "CBP Manifests", verify: "Physical remains repatriation records", count: "25–100" },
];

const FOIA_REQUESTS = [
  {
    id: "FOIA-RG147-001",
    agency: "National Archives (NARA St. Louis)",
    target: "Selective Service System RG 147",
    query: "Draft Registration Cards: country_of_birth = 'MEXICO' (1959-1975)",
    status: "DRAFT",
    priority: "CRITICAL",
    estimated_yield: "500–800 records",
    timeline: "30–60 days",
  },
  {
    id: "FOIA-2026-003-SUP",
    agency: "National Archives (DMDC)",
    target: "DCAS Vietnam Conflict Extract",
    query: "SUPPLEMENT: home_of_record_country = 'MEXICO' with full record extract",
    status: "PENDING",
    priority: "CRITICAL",
    estimated_yield: "150–500 records",
    timeline: "45–90 days",
  },
  {
    id: "FOIA-USCIS-N644",
    agency: "USCIS Records Center",
    target: "Form N-644 Applications",
    query: "country_of_origin = 'MEXICO' AND service_period = '02/28/1961–10/15/1978'",
    status: "DRAFT",
    priority: "HIGH",
    estimated_yield: "200–400 records",
    timeline: "60–120 days",
  },
  {
    id: "FOIA-VA-BIRLS-DIC",
    agency: "VA Benefits Administration",
    target: "BIRLS Database (DIC Payments)",
    query: "recipient_address contains 'MEXICO' AND service_death_type = 'KIA' AND era = 'Vietnam'",
    status: "DRAFT",
    priority: "HIGH",
    estimated_yield: "100–300 records",
    timeline: "60–90 days",
  },
  {
    id: "INAI-SRE-ACTAS",
    agency: "Secretaría de Relaciones Exteriores (Mexico)",
    target: "Consular Death Certificates (Actas de Defunción)",
    query: "Mexican citizens killed in U.S. military service (1964–1975)",
    status: "DRAFT",
    priority: "CRITICAL",
    estimated_yield: "200–800 records",
    timeline: "30–45 days (Mexico INAI)",
  },
  {
    id: "FOIA-CBP-MANIFESTS",
    agency: "Customs and Border Protection (TECS)",
    target: "Historical Cargo Manifests",
    query: "human remains shipments from military mortuaries (Dover, Travis, Norton AFB) to Mexico (1965–1975)",
    status: "DRAFT",
    priority: "MEDIUM",
    estimated_yield: "50–200 records",
    timeline: "60–120 days",
  },
];

export default function VeteranForensicInvestigation() {
  const [tab, setTab] = useState("protocols"); // protocols | international | chain
  const [expandedPathway, setExpandedPathway] = useState(null);
  const [expandedFoia, setExpandedFoia] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);

  const forensicEstimate = {
    floor: 346,
    ceiling: 741,
    median: 500,
    erasureRate: 99.2,
  };

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1, paddingBottom: 40 }}>
      {/* Tab Navigation */}
      <div style={{ position: "sticky", top: 0, background: P.bg, borderBottom: `2px solid ${P.b}`, padding: "8px 20px", zIndex: 100, display: "flex", gap: 6 }}>
        {[
          { id: "protocols", label: "📋 Investigation Protocols" },
          { id: "querybuilder", label: "⚙️ Query Builder" },
          { id: "international", label: "🇲🇽 International Records" },
          { id: "chain", label: "🔗 Agency Chain of Custody" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "6px 14px",
              background: tab === t.id ? `${P.gold}18` : "transparent",
              border: tab === t.id ? `1px solid ${P.gold}` : `1px solid ${P.b}`,
              color: tab === t.id ? P.gold : P.t4,
              borderRadius: 20,
              fontSize: 8,
              fontWeight: tab === t.id ? 800 : 600,
              cursor: "pointer",
              fontFamily: "'IBM Plex Mono',monospace",
              transition: "all .12s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "protocols" && (
        <div style={{ padding: "14px 20px", overflowY: "auto", height: "calc(100vh - 160px)" }}>
          {/* Header */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: P.t1, marginBottom: 4 }}>
              🔬 Multi-Database Forensic Investigation Protocol
            </div>
            <div style={{ fontSize: 8, color: P.t4, letterSpacing: 2 }}>
              CROSS-REFERENCING SIX FEDERAL AND INTERNATIONAL DATABASES · ESTIMATED YIELD: 346–741 MEXICAN NATIONAL VIETNAM KIA
            </div>
          </div>

        {/* Forensic Estimate Box */}
        <div style={{ background: P.card, border: `2px solid ${P.gold}`, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[
            { label: "FLOOR ESTIMATE", value: forensicEstimate.floor, color: P.amber },
            { label: "CEILING ESTIMATE", value: forensicEstimate.ceiling, color: P.red },
            { label: "MEDIAN ESTIMATE", value: forensicEstimate.median, color: P.gold },
            { label: "ERASURE RATE", value: `${forensicEstimate.erasureRate}%`, color: P.red },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 6, color: P.t4, letterSpacing: 1, marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 800, color: stat.color }}>
                {stat.value}
              </div>
              {i === 3 && <div style={{ fontSize: 6, color: P.t4, marginTop: 2 }}>DCAS invisible rate</div>}
            </div>
          ))}
        </div>
      </div>

        {/* Six Investigation Pathways */}
        <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 10, borderBottom: `2px solid ${P.b}`, paddingBottom: 6 }}>
          📊 Six Investigation Pathways
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          {INVESTIGATION_PATHWAYS.map(pathway => (
            <div
              key={pathway.id}
              onClick={() => setExpandedPathway(expandedPathway === pathway.id ? null : pathway.id)}
              style={{
                background: expandedPathway === pathway.id ? `${P.gold}10` : P.card,
                border: `1px solid ${expandedPathway === pathway.id ? P.gold : P.b}`,
                borderRadius: 10,
                padding: "12px 14px",
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              <div style={{ fontSize: 12, marginBottom: 6 }}>{pathway.icon}</div>
              <div style={{ fontSize: 8, fontWeight: 800, color: P.t1, marginBottom: 4 }}>{pathway.name}</div>
              <div style={{ fontSize: 6, color: P.t4, marginBottom: 6 }}>{pathway.source}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 7, color: P.gold, fontWeight: 700 }}>Est. {pathway.value}</span>
                <span style={{ fontSize: 6, background: `${P.gold}15`, color: P.gold, borderRadius: 3, padding: "2px 5px" }}>
                  {pathway.status}
                </span>
              </div>

              {expandedPathway === pathway.id && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${P.b}`, fontSize: 7, color: P.t2, lineHeight: 1.6 }}>
                  <div style={{ marginBottom: 6 }}>
                    <strong>FOIA:</strong> {pathway.foia}
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <strong>Query:</strong> {pathway.methodology}
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <strong>Timeline:</strong> {pathway.timeline}
                  </div>
                  <div>
                    <strong>Yield:</strong> {pathway.yield}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

        {/* Cross-Reference Matrix */}
        <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 10, borderBottom: `2px solid ${P.b}`, paddingBottom: 6 }}>
          🔗 Cross-Reference Investigation Protocol
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {CROSS_REFERENCE_MATRIX.map((step, i) => (
            <div
              key={i}
              onClick={() => setSelectedStep(selectedStep === i ? null : i)}
              style={{
                padding: "12px 14px",
                background: selectedStep === i ? `${P.cyan}10` : P.card,
                border: `1px solid ${selectedStep === i ? P.cyan : P.b}`,
                borderLeft: `4px solid ${P.cyan}`,
                borderRadius: 8,
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: selectedStep === i ? 8 : 0 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: 1 }}>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 800, color: P.cyan, minWidth: 20 }}>
                    {step.step}.
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: P.t1, marginBottom: 2 }}>{step.source}</div>
                    <div style={{ fontSize: 7, color: P.t3 }}>{step.match || step.extract}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 6, color: P.t4, marginBottom: 2 }}>Est. Yield</div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 800, color: P.cyan }}>
                    {step.count}
                  </div>
                </div>
              </div>
              {selectedStep === i && (
                <div style={{ padding: "8px", background: "#080D18", borderRadius: 6, fontSize: 6, color: P.t2, lineHeight: 1.5 }}>
                  {step.validate || step.confirm || "Cross-validate records across multiple federal databases."}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

        {/* FOIA Request Master List */}
        <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 10, borderBottom: `2px solid ${P.b}`, paddingBottom: 6 }}>
          📮 FOIA Request Master List
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FOIA_REQUESTS.map(foia => (
            <div
              key={foia.id}
              onClick={() => setExpandedFoia(expandedFoia === foia.id ? null : foia.id)}
              style={{
                padding: "10px 12px",
                background: expandedFoia === foia.id ? `${foia.priority === "CRITICAL" ? P.red : P.gold}10` : P.card,
                border: `1px solid ${expandedFoia === foia.id ? (foia.priority === "CRITICAL" ? P.red : P.gold) : P.b}`,
                borderLeft: `4px solid ${foia.priority === "CRITICAL" ? P.red : foia.priority === "HIGH" ? P.amber : P.blue}`,
                borderRadius: 8,
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 8, fontWeight: 800, color: P.t1 }}>{foia.id}</div>
                  <div style={{ fontSize: 7, color: P.t4 }}>{foia.agency}</div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 6, background: `${foia.priority === "CRITICAL" ? P.red : foia.priority === "HIGH" ? P.amber : P.blue}15`, color: foia.priority === "CRITICAL" ? P.red : foia.priority === "HIGH" ? P.amber : P.blue, borderRadius: 20, padding: "2px 7px", fontWeight: 700 }}>
                    {foia.priority}
                  </span>
                  <span style={{ fontSize: 6, color: P.t4 }}>{foia.timeline}</span>
                </div>
              </div>

              {expandedFoia === foia.id && (
                <div style={{ paddingTop: 8, borderTop: `1px solid ${P.b}` }}>
                  <div style={{ fontSize: 7, color: P.t2, marginBottom: 6, lineHeight: 1.5 }}>
                    <strong>Target:</strong> {foia.target}
                  </div>
                  <div style={{ fontSize: 7, color: P.t2, marginBottom: 6, lineHeight: 1.5 }}>
                    <strong>Query:</strong> {foia.query}
                  </div>
                  <div style={{ fontSize: 7, color: P.gold, fontWeight: 700 }}>
                    Estimated Yield: {foia.estimated_yield}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

        {/* Action Items */}
        <div style={{ background: `${P.red}08`, border: `1px solid ${P.red}30`, borderRadius: 10, padding: "12px 14px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.red, marginBottom: 8 }}>⚡ IMMEDIATE ACTION ITEMS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 7, color: P.t2, lineHeight: 1.6 }}>
          <div>
            <strong>1. Query NARA AAD immediately:</strong> https://aad.archives.gov/aad/ — Search DCAS for Home of Record = "FOREIGN" (verify the 4 confirmed records)
          </div>
          <div>
            <strong>2. File INAI Request to SRE:</strong> plataformadetransparencia.org.mx — Request consular death certificates 1964–1975
          </div>
          <div>
            <strong>3. Supplement FOIA-2026-003:</strong> Add DMDC query for home_of_record_country = "MEXICO" to pending FOIA
          </div>
          <div>
            <strong>4. Search Mexican newspaper archives:</strong> HNDM (https://hndm.iib.unam.mx) — Search "muerto en Vietnam" 1965–1975
          </div>
          <div>
            <strong>5. File FOIA-RG147-001:</strong> NARA St. Louis for Selective Service Draft Registration Cards with Mexico birthplace
          </div>
        </div>
        </div>

        </div>
      )}

      {tab === "querybuilder" && <div style={{ padding: "14px 20px", overflowY: "auto", height: "calc(100vh - 160px)" }}><InvestigationQueryBuilder /></div>}

      {tab === "international" && <InternationalRecordsMatcher />}

      {tab === "chain" && <AgencyChainOfCustody />}
    </div>
  );
}