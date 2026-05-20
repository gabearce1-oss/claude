import { P } from "../../../lib/teData";

const PRIORITY_COLORS = { Critical: P.red, High: P.amber, Medium: P.blue, Low: P.t4 };
const STATUS_COLORS = { "Active": P.teal, "Under Review": P.amber, "Closed – Confirmed": P.gold, "Closed – Unverified": P.t4, "Archived": P.t4 };
const BRANCHES = { Army: "🪖", Navy: "⚓", "Marine Corps": "🦅", "Air Force": "✈️", "Coast Guard": "⚓", "National Guard": "🛡️", Unknown: "❓" };

export default function CaseFileCard({ cf, linkCount, isSelected, onClick }) {
  const pc = PRIORITY_COLORS[cf.priority] || P.t4;
  const sc = STATUS_COLORS[cf.status] || P.t4;

  return (
    <div onClick={onClick}
      style={{ border: `1px solid ${isSelected ? P.gold : P.b}`, borderLeft: `4px solid ${isSelected ? P.gold : pc}`,
        background: isSelected ? `${P.gold}08` : P.card, borderRadius: 10, padding: "14px 16px", cursor: "pointer",
        transition: "all 0.15s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: P.t1 }}>{cf.subject_name}</div>
          <div style={{ fontSize: 9, color: P.t4, marginTop: 2 }}>{cf.case_id}{cf.service_branch ? ` · ${BRANCHES[cf.service_branch] || ""} ${cf.service_branch}` : ""}{cf.service_years ? ` · ${cf.service_years}` : ""}</div>
        </div>
        <span style={{ fontSize: 8, fontWeight: 800, padding: "3px 8px", background: `${pc}18`, border: `1px solid ${pc}40`, borderRadius: 5, color: pc, flexShrink: 0 }}>{cf.priority}</span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        <span style={{ fontSize: 8, padding: "2px 7px", background: `${sc}15`, border: `1px solid ${sc}35`, borderRadius: 4, color: sc }}>{cf.status}</span>
        {cf.dcas_match && <span style={{ fontSize: 8, padding: "2px 7px", background: `${P.blue}15`, border: `1px solid ${P.blue}35`, borderRadius: 4, color: P.blue }}>DCAS ✓</span>}
        {cf.deportation_confirmed && <span style={{ fontSize: 8, padding: "2px 7px", background: `${P.red}15`, border: `1px solid ${P.red}35`, borderRadius: 4, color: P.red }}>Deported ✓</span>}
        {cf.uscis_afile && <span style={{ fontSize: 8, padding: "2px 7px", background: `${P.teal}10`, border: `1px solid ${P.teal}30`, borderRadius: 4, color: P.teal }}>A-File</span>}
      </div>
      {cf.summary && <div style={{ fontSize: 9, color: P.t3, lineHeight: 1.5, marginBottom: 8 }}>{cf.summary.slice(0, 120)}{cf.summary.length > 120 ? "…" : ""}</div>}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: P.t4 }}>
        <span>{linkCount} evidence link{linkCount !== 1 ? "s" : ""}</span>
        {cf.analyst_owner && <span>Analyst: {cf.analyst_owner}</span>}
      </div>
    </div>
  );
}