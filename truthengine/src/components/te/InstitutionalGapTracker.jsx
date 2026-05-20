import { useState } from "react";
import { P } from "../../lib/teData";

const GAPS = [
  {
    id: "G001",
    agency: "VA",
    division: "Benefits Administration (VBA)",
    nero: "R",
    severity: "CRITICAL",
    title: "BIRLS does not flag veteran status across ICE/ENFORCE database",
    description: "Veterans proceed through removal without VA notifying ICE of service record",
    foiaRef: "F001",
    fOIADaysOverdue: 83,
    resolution: "Mandate VA-ICE data integration; automatic veteran flag in ENFORCE"
  },
  {
    id: "G002",
    agency: "VA",
    division: "Foreign Medical Program (FMP)",
    nero: "R",
    severity: "HIGH",
    title: "Deported veterans cannot access VA healthcare from abroad",
    description: "Veterans lose healthcare access the moment they cross the border — even with service-connected disabilities",
    foiaRef: null,
    fOIADaysOverdue: 0,
    resolution: "Extend VA healthcare to deported veterans; waive border restrictions"
  },
  {
    id: "G003",
    agency: "VA",
    division: "National Cemetery Administration",
    nero: "E",
    severity: "MEDIUM",
    title: "Deported veterans denied burial honors if death occurs abroad",
    description: "Veterans who die post-deportation may not receive military honors or burial in national cemeteries",
    foiaRef: null,
    fOIADaysOverdue: 0,
    resolution: "Allow posthumous burial honors regardless of deportation status"
  },
  {
    id: "G004",
    agency: "ICE/DHS",
    division: "Enforcement and Removal Operations",
    nero: "O",
    severity: "CRITICAL",
    title: "ENFORCE database does not include veteran status field",
    description: "ICE officers have no automated flag to check veteran status before issuing removal orders",
    foiaRef: "F002",
    fOIADaysOverdue: 66,
    resolution: "Add veteran status field to ENFORCE; require check before deportation processing"
  },
  {
    id: "G005",
    agency: "ICE/DHS",
    division: "Office of Principal Legal Advisor (OPLA)",
    nero: "N",
    severity: "CRITICAL",
    title: "ICE attorneys not required to consider military service as mitigating factor",
    description: "IIRIRA stripped immigration judges of discretion — ICE attorneys follow mandatory prosecution",
    foiaRef: null,
    fOIADaysOverdue: 0,
    resolution: "Restore judicial discretion for veteran cases; mandate mitigation consideration"
  },
  {
    id: "G006",
    agency: "ICE/DHS",
    division: "Detainee Locator System",
    nero: "O",
    severity: "HIGH",
    title: "Locator only shows currently detained — no historical deportation records",
    description: "Cannot verify deportation of veterans through public channel. ENFORCE FOIA blocked.",
    foiaRef: "F002",
    fOIADaysOverdue: 66,
    resolution: "Make deportation records public; allow FOIA access to ENFORCE historical data"
  },
  {
    id: "G007",
    agency: "USCIS",
    division: "Naturalization Division",
    nero: "N",
    severity: "CRITICAL",
    title: "INA §329 military service naturalization path not applied to C004 Park",
    description: "72% drop in military naturalization applications FY2017-FY2018. Park denied despite wartime service eligibility.",
    foiaRef: null,
    fOIADaysOverdue: 0,
    resolution: "Mandate INA §329 review for all denied military naturalization cases"
  },
  {
    id: "G008",
    agency: "USCIS",
    division: "CLAIMS4 Database",
    nero: "O",
    severity: "HIGH",
    title: "No flag in CLAIMS4 for veterans who were later deported",
    description: "Cannot track how many veterans had naturalization denied and were subsequently removed",
    foiaRef: null,
    fOIADaysOverdue: 0,
    resolution: "Add veteran flag to CLAIMS4; conduct retroactive audit of denied cases"
  },
  {
    id: "G009",
    agency: "DoD / DCAS",
    division: "Casualty Analysis System",
    nero: "E",
    severity: "CRITICAL",
    title: "DCAS Hispanic casualty miscoding persists (1969–present)",
    description: "349 official vs 2,309 BISG estimate. Systematic 84.9% classification failure in historical records.",
    foiaRef: null,
    fOIADaysOverdue: 0,
    resolution: "Conduct full DCAS reclassification audit; correct all Hispanic casualty records"
  },
  {
    id: "G010",
    agency: "NARA",
    division: "Estvecs Records Division",
    nero: "O",
    severity: "HIGH",
    title: "Vietnam-era service records difficult to access for non-authorized researchers",
    description: "FOIA requests for historical casualty data take 6+ months; archive digitization incomplete.",
    foiaRef: null,
    fOIADaysOverdue: 0,
    resolution: "Digitize all Vietnam casualty records; establish expedited FOIA lane for researcher access"
  },
  {
    id: "G011",
    agency: "DOJ / EOIR",
    division: "Immigration Court System",
    nero: "R",
    severity: "HIGH",
    title: "Immigration judges lack veteran mitigation training",
    description: "Judges unfamiliar with military naturalization law, SCRA protections, service-connected disability",
    foiaRef: null,
    fOIADaysOverdue: 0,
    resolution: "Mandate veteran mitigation training for all immigration judges; update practice guidance"
  },
  {
    id: "G012",
    agency: "VA",
    division: "Veteran Records & Eligibility",
    nero: "O",
    severity: "MEDIUM",
    title: "No systematic tracking of deported veteran outcomes post-removal",
    description: "Cannot determine how many deported veterans attempt repatriation, family status, mortality",
    foiaRef: null,
    fOIADaysOverdue: 0,
    resolution: "Establish deported veteran tracking system; conduct retrospective cohort study"
  }
];

const NERO_INFO = {
  N: { label: "Notification", desc: "Failure to identify veteran status in enforcement process", color: P.blue },
  E: { label: "Erasure", desc: "Systematic removal/denial of veteran records or benefits", color: P.red },
  R: { label: "Restriction", desc: "Legal or policy barriers preventing veteran protections", color: P.amber },
  O: { label: "Obscurity", desc: "Lack of transparency/data accessibility for verification", color: P.violet },
};

const SEVERITY_COLOR = {
  CRITICAL: P.red,
  HIGH: P.amber,
  MEDIUM: P.gold,
};

export default function InstitutionalGapTracker({ setTab }) {
  const [filterAgency, setFilterAgency] = useState("All");
  const [filterNERO, setFilterNERO] = useState("All NERO");
  const [selectedGap, setSelectedGap] = useState(null);

  const agencies = ["All", ...new Set(GAPS.map(g => g.agency))];
  const neroFilters = ["All NERO", "N — Notification", "E — Erasure", "R — Restriction", "O — Obscurity"];

  const filtered = GAPS.filter(g =>
    (filterAgency === "All" || g.agency === filterAgency) &&
    (filterNERO === "All NERO" || filterNERO.includes(g.nero))
  );

  const stats = {
    total: GAPS.length,
    critical: GAPS.filter(g => g.severity === "CRITICAL").length,
    high: GAPS.filter(g => g.severity === "HIGH").length,
    foiaDependent: GAPS.filter(g => g.foiaRef).length,
    agencies: new Set(GAPS.map(g => g.agency)).size,
    overdueDAYS: GAPS.reduce((sum, g) => sum + g.fOIADaysOverdue, 0),
  };

  const neroStats = {
    N: GAPS.filter(g => g.nero === "N").length,
    E: GAPS.filter(g => g.nero === "E").length,
    R: GAPS.filter(g => g.nero === "R").length,
    O: GAPS.filter(g => g.nero === "O").length,
  };

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1, padding: "14px 20px", overflowY: "auto", height: "calc(100vh - 118px)" }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P.t1 }}>
          🏗️ Institutional Gap <span style={{ color: P.gold }}>Tracker</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          {stats.total} DOCUMENTED DATA GAPS · {stats.agencies} AGENCIES · NERO VECTORS · CHC RESOLUTION PATHS
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Total Gaps", value: stats.total, color: P.blue },
          { label: "Critical", value: stats.critical, color: P.red },
          { label: "High Priority", value: stats.high, color: P.amber },
          { label: "FOIA Dependent", value: stats.foiaDependent, color: P.gold },
          { label: "Agencies", value: stats.agencies, color: P.violet },
          { label: "Overdue FOIA Days", value: stats.overdueDAYS, color: P.red },
        ].map((stat, i) => (
          <div key={i} style={{
            background: P.card,
            border: `1px solid ${stat.color}25`,
            borderLeft: `4px solid ${stat.color}`,
            borderRadius: 8,
            padding: "8px 12px",
          }}>
            <div style={{ fontSize: 6, color: P.t4, marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 800, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* NERO Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
        {["N", "E", "R", "O"].map(nero => (
          <div key={nero} style={{
            background: P.card,
            border: `1px solid ${NERO_INFO[nero].color}25`,
            borderRadius: 8,
            padding: 10,
            textAlign: "center",
          }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 20, fontWeight: 800, color: NERO_INFO[nero].color, marginBottom: 4 }}>{nero}</div>
            <div style={{ fontSize: 7, color: P.t4, marginBottom: 6 }}>{NERO_INFO[nero].label}</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 800, color: NERO_INFO[nero].color }}>{neroStats[nero]} gaps</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {agencies.map(agency => (
            <button
              key={agency}
              onClick={() => setFilterAgency(agency)}
              style={{
                padding: "5px 10px",
                background: filterAgency === agency ? `${P.gold}20` : P.card,
                border: `1px solid ${filterAgency === agency ? P.gold : P.b}`,
                color: filterAgency === agency ? P.gold : P.t4,
                fontSize: 7,
                fontWeight: filterAgency === agency ? 700 : 400,
                cursor: "pointer",
                borderRadius: 6,
              }}
            >
              {agency}
            </button>
          ))}
        </div>
        <select
          value={filterNERO}
          onChange={(e) => setFilterNERO(e.target.value)}
          style={{
            padding: "5px 8px",
            background: P.card,
            border: `1px solid ${P.b}`,
            color: P.t1,
            fontSize: 7,
            borderRadius: 6,
            outline: "none",
            marginLeft: "auto",
          }}
        >
          {neroFilters.map(filter => <option key={filter} value={filter}>{filter}</option>)}
        </select>
      </div>

      {/* Gap list */}
      <div style={{ display: "grid", gap: 8 }}>
        {filtered.map(gap => (
          <div
            key={gap.id}
            onClick={() => setSelectedGap(selectedGap?.id === gap.id ? null : gap)}
            style={{
              background: selectedGap?.id === gap.id ? `${SEVERITY_COLOR[gap.severity]}15` : P.card,
              border: `1px solid ${selectedGap?.id === gap.id ? SEVERITY_COLOR[gap.severity] : P.b}`,
              borderLeft: `4px solid ${SEVERITY_COLOR[gap.severity]}`,
              borderRadius: 8,
              padding: 12,
              cursor: "pointer",
              transition: "all .15s",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, fontWeight: 800, color: P.gold }}>{gap.id}</span>
                  <span style={{ fontSize: 7, background: `${P.gold}15`, border: `1px solid ${P.gold}25`, color: P.gold, borderRadius: 4, padding: "2px 6px", fontWeight: 700 }}>{gap.agency}</span>
                  <span style={{ fontSize: 7, background: `${NERO_INFO[gap.nero].color}15`, border: `1px solid ${NERO_INFO[gap.nero].color}25`, color: NERO_INFO[gap.nero].color, borderRadius: 4, padding: "2px 6px", fontWeight: 700 }}>NERO-{gap.nero}</span>
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 3 }}>{gap.title}</div>
                <div style={{ fontSize: 7, color: P.t4 }}>{gap.division}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 8, fontWeight: 800, color: SEVERITY_COLOR[gap.severity], marginBottom: 4 }}>{gap.severity}</div>
                {gap.foiaRef && (
                  <div style={{ fontSize: 6, background: `${P.amber}15`, border: `1px solid ${P.amber}25`, color: P.amber, borderRadius: 4, padding: "2px 5px", fontWeight: 700, marginBottom: 3 }}>
                    📋 {gap.foiaRef}
                  </div>
                )}
                {gap.fOIADaysOverdue > 0 && (
                  <div style={{ fontSize: 6, background: `${P.red}15`, border: `1px solid ${P.red}25`, color: P.red, borderRadius: 4, padding: "2px 5px", fontWeight: 700 }}>
                    {gap.fOIADaysOverdue}d OVERDUE
                  </div>
                )}
              </div>
            </div>

            {selectedGap?.id === gap.id && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${P.b}` }}>
                <div style={{ fontSize: 8, color: P.t2, lineHeight: 1.6, marginBottom: 8 }}>{gap.description}</div>
                <div style={{ padding: 8, background: "#080D18", borderRadius: 6 }}>
                  <div style={{ fontSize: 6, color: P.t4, marginBottom: 3, fontWeight: 700 }}>🎯 CHC Resolution Path</div>
                  <div style={{ fontSize: 8, color: P.t1 }}>{gap.resolution}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Vietnam Casualty Timeline Summary */}
      <div style={{ marginTop: 16, padding: 12, background: P.card, border: `1px solid ${P.b}`, borderRadius: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 10 }}>📊 Vietnam Casualty Timeline · DCAS vs BISG</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
          {[
            { icon: "💀", label: "DCAS Official", value: "349", sub: "0.60% Hispanic" },
            { icon: "🧮", label: "BISG Estimate", value: "2,309", sub: "3.97% τ=0.40" },
            { icon: "⚠️", label: "NERO Score", value: "94.5", sub: "Institutional erasure" },
            { icon: "🎖️", label: "Avg Case Conf.", value: "86%", sub: "6 verified cases" },
            { icon: "📋", label: "FOIA Overdue", value: "149d", sub: "Total overdue days" },
            { icon: "🏛️", label: "CHC Briefing", value: "39d", sub: "May 18, 2026" },
          ].map((item, i) => (
            <div key={i} style={{
              background: "#080D18",
              border: `1px solid ${P.b}`,
              borderRadius: 6,
              padding: 10,
              textAlign: "center",
            }}>
              <div style={{ fontSize: 16, marginBottom: 4 }}>{item.icon}</div>
              <div style={{ fontSize: 7, color: P.t4, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 800, color: P.gold, marginBottom: 3 }}>{item.value}</div>
              <div style={{ fontSize: 6, color: P.t4 }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}