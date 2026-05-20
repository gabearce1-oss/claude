import { useState, useEffect } from "react";
import { P } from "../../lib/teData";

const ALERT_DATA = [
  { id: "A001", severity: "critical", title: "FOIA F001 OVERDUE", desc: "VA BIRLS request 83 days past deadline", action: "Escalate to Congressional office", date: "2026-04-09", status: "UNREAD" },
  { id: "A002", severity: "critical", title: "Case C004 Status Change", desc: "CPL Park removal order flagged — self-deported", action: "Generate CHC emergency inquiry", date: "2026-04-08", status: "UNREAD" },
  { id: "A003", severity: "warning", title: "DCAS Data Gap Detected", desc: "12 records missing veteran flags", action: "Manual review required", date: "2026-04-07", status: "READ" },
  { id: "A004", severity: "info", title: "Report Generated", desc: "CHC briefing package ready for May 18", action: "Review & distribute", date: "2026-04-06", status: "READ" },
  { id: "A005", severity: "critical", title: "ICE Policy Alert", desc: "Arrest spike detected (+164% month-over-month)", action: "Update policy correlation analysis", date: "2026-04-05", status: "UNREAD" },
];

export default function SystemAlerts() {
  const [alerts, setAlerts] = useState(ALERT_DATA);
  const [filter, setFilter] = useState("all");

  const unreadCount = alerts.filter(a => a.status === "UNREAD").length;
  const criticalCount = alerts.filter(a => a.severity === "critical").length;

  const filtered = filter === "all" ? alerts : filter === "critical" ? alerts.filter(a => a.severity === "critical") : alerts.filter(a => a.status === "UNREAD");

  const markAsRead = (id) => {
    setAlerts(a => a.map(item => item.id === id ? { ...item, status: "READ" } : item));
  };

  const getSeverityColor = (severity) => {
    return severity === "critical" ? P.red : severity === "warning" ? P.amber : P.teal;
  };

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          🔔 System <span style={{ color: P.gold }}>Alerts Dashboard</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          REAL-TIME NOTIFICATIONS · FOIA TRACKING · CASE UPDATES · POLICY ALERTS
        </div>
      </div>

      {/* Status bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8, marginBottom: 12 }}>
        {[
          { label: "Total Alerts", value: alerts.length, color: P.t4 },
          { label: "Unread", value: unreadCount, color: unreadCount > 0 ? P.gold : P.teal },
          { label: "Critical", value: criticalCount, color: criticalCount > 0 ? P.red : P.teal },
        ].map((s, i) => (
          <div key={i} style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 8, padding: 10, textAlign: "center" }}>
            <div style={{ fontSize: 7, color: P.t4, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "8px 10px", width: "fit-content" }}>
        {[["all", "📋 All"], ["critical", "🔴 Critical"], ["unread", "⭐ Unread"]].map(([f, l]) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "6px 12px", fontSize: 8, fontWeight: filter === f ? 700 : 400,
              background: filter === f ? `${P.gold}20` : "transparent",
              border: `1px solid ${filter === f ? P.gold : P.b}`,
              color: filter === f ? P.gold : P.t4, borderRadius: 6, cursor: "pointer" }}>
            {l}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(alert => {
          const color = getSeverityColor(alert.severity);
          return (
            <div key={alert.id}
              style={{ background: alert.status === "UNREAD" ? `${color}12` : "transparent",
                border: `1px solid ${alert.status === "UNREAD" ? color : P.b}30`,
                borderLeft: `4px solid ${color}`,
                borderRadius: 10, padding: 12, cursor: "pointer" }}
              onClick={() => markAsRead(alert.id)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: P.t1 }}>{alert.title}</div>
                    {alert.status === "UNREAD" && <span style={{ fontSize: 6, background: `${color}15`, color: color, borderRadius: 20, padding: "1px 5px", marginLeft: 6, fontWeight: 700 }}>NEW</span>}
                  </div>
                </div>
                <div style={{ fontSize: 7, color: P.t4 }}>{alert.date}</div>
              </div>
              <div style={{ fontSize: 8, color: P.t3, marginBottom: 6 }}>{alert.desc}</div>
              <button style={{ padding: "5px 10px", fontSize: 7, fontWeight: 700, background: `${color}15`, border: `1px solid ${color}30`, color: color, borderRadius: 6, cursor: "pointer" }}>
                → {alert.action}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}