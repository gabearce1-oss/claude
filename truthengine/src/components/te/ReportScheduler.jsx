import { useState } from "react";
import { P } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

const REPORT_TEMPLATES = [
  { id: "dcas_daily", name: "Daily DCAS Reconciliation", type: "forensic", frequency: "daily", time: "09:00", description: "Daily DCAS casualty audit with BISG convergence validation" },
  { id: "ice_weekly", name: "Weekly ICE ERO Statistics", type: "operational", frequency: "weekly", time: "Monday 08:00", description: "Weekly enforcement removal operations data and statistics" },
  { id: "foia_weekly", name: "Weekly FOIA Status Report", type: "tracking", frequency: "weekly", time: "Friday 17:00", description: "FOIA request status, overdue tracking, escalation needed" },
  { id: "chc_monthly", name: "Monthly CHC Briefing", type: "legislative", frequency: "monthly", day: "1st", time: "06:00", description: "Monthly Congressional Hispanic Caucus briefing package" },
  { id: "case_weekly", name: "Weekly Case Summary", type: "case", frequency: "weekly", time: "Wednesday 10:00", description: "6 CB-HSIVF verified cases status and confidence updates" },
  { id: "nero_biweekly", name: "Bi-weekly NERO Score", type: "analysis", frequency: "bi-weekly", time: "Every 2 weeks Tuesday", description: "Institutional erasure (NERO) vector scoring and trend analysis" },
];

const DELIVERY_OPTIONS = [
  { id: "email", icon: "📧", label: "Email", desc: "Send to specified recipients" },
  { id: "repository", icon: "💾", label: "Repository", desc: "Save to document repository" },
  { id: "both", icon: "📤", label: "Email + Repository", desc: "Both email and save" },
];

export default function ReportScheduler({ setTab }) {
  const [schedules, setSchedules] = useState([
    { id: 1, template: "dcas_daily", enabled: true, delivery: "email", recipients: ["analyst@aumer.org"], nextRun: "Tomorrow 09:00" },
    { id: 2, template: "ice_weekly", enabled: true, delivery: "repository", nextRun: "Monday 08:00" },
  ]);
  const [newSchedule, setNewSchedule] = useState({ template: "dcas_daily", delivery: "email", recipients: "" });
  const [creatingSchedule, setCreatingSchedule] = useState(false);

  const handleCreateSchedule = async () => {
    if (!newSchedule.template || !newSchedule.delivery) return;
    
    setCreatingSchedule(true);
    try {
      const recipients = newSchedule.recipients.split(",").map(r => r.trim()).filter(Boolean);
      const template = REPORT_TEMPLATES.find(t => t.id === newSchedule.template);
      
      // In production, this would call a backend function to set up the automation
      console.log("Creating schedule:", { template: template.id, delivery: newSchedule.delivery, recipients });
      
      // Add to local state
      const schedule = {
        id: schedules.length + 1,
        template: newSchedule.template,
        delivery: newSchedule.delivery,
        recipients: recipients,
        enabled: true,
        nextRun: template.time,
      };
      setSchedules([...schedules, schedule]);
      setNewSchedule({ template: "dcas_daily", delivery: "email", recipients: "" });
    } finally {
      setCreatingSchedule(false);
    }
  };

  const toggleSchedule = (id) => {
    setSchedules(schedules.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const deleteSchedule = (id) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1, padding: "14px 20px", overflowY: "auto", height: "calc(100vh - 118px)" }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P.t1 }}>
          ⏰ Report <span style={{ color: P.gold }}>Scheduler</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          AUTOMATED WORKFLOWS · SCHEDULED DELIVERY · EMAIL + REPOSITORY
        </div>
      </div>

      {/* Active Schedules */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 10 }}>
          📋 Active Schedules ({schedules.filter(s => s.enabled).length})
        </div>
        
        <div style={{ display: "grid", gap: 8 }}>
          {schedules.map(schedule => {
            const template = REPORT_TEMPLATES.find(t => t.id === schedule.template);
            const delivery = DELIVERY_OPTIONS.find(d => d.id === schedule.delivery);
            return (
              <div key={schedule.id} style={{
                background: schedule.enabled ? `${P.blue}08` : `${P.t4}05`,
                border: `1px solid ${schedule.enabled ? P.blue : P.b}25`,
                borderLeft: `4px solid ${schedule.enabled ? P.blue : P.b}`,
                borderRadius: 8,
                padding: 12,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 3 }}>{template?.name}</div>
                    <div style={{ fontSize: 7, color: P.t4, marginBottom: 4 }}>{template?.description}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: 7, background: `${P.gold}15`, border: `1px solid ${P.gold}25`, color: P.gold, borderRadius: 4, padding: "2px 6px", fontWeight: 700 }}>
                        🔄 {template?.frequency}
                      </span>
                      <span style={{ fontSize: 7, background: `${delivery.id === "email" ? P.blue : P.violet}15`, border: `1px solid ${delivery.id === "email" ? P.blue : P.violet}25`, color: delivery.id === "email" ? P.blue : P.violet, borderRadius: 4, padding: "2px 6px", fontWeight: 700 }}>
                        {delivery?.icon} {delivery?.label}
                      </span>
                      <span style={{ fontSize: 7, color: P.t4 }}>Next: {schedule.nextRun}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      onClick={() => toggleSchedule(schedule.id)}
                      style={{
                        padding: "4px 8px",
                        background: schedule.enabled ? `${P.teal}15` : `${P.t4}10`,
                        border: `1px solid ${schedule.enabled ? P.teal : P.b}`,
                        color: schedule.enabled ? P.teal : P.t4,
                        fontSize: 7,
                        fontWeight: 700,
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      {schedule.enabled ? "✓ Active" : "○ Paused"}
                    </button>
                    <button
                      onClick={() => deleteSchedule(schedule.id)}
                      style={{
                        padding: "4px 8px",
                        background: `${P.red}10`,
                        border: `1px solid ${P.red}25`,
                        color: P.red,
                        fontSize: 7,
                        fontWeight: 700,
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {schedule.recipients?.length > 0 && (
                  <div style={{ fontSize: 6, color: P.t4, paddingTop: 6, borderTop: `1px solid ${P.b}20` }}>
                    Recipients: {schedule.recipients.join(", ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* New Schedule Form */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 10 }}>➕ Create New Schedule</div>
        
        <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
          {/* Template selector */}
          <div>
            <label style={{ fontSize: 7, color: P.t4, fontWeight: 700, marginBottom: 4, display: "block" }}>Report Template</label>
            <select
              value={newSchedule.template}
              onChange={(e) => setNewSchedule({ ...newSchedule, template: e.target.value })}
              style={{
                width: "100%",
                padding: "8px",
                background: "#080D18",
                border: `1px solid ${P.b}`,
                color: P.t1,
                fontSize: 8,
                borderRadius: 6,
                outline: "none",
              }}
            >
              {REPORT_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {newSchedule.template && (
              <div style={{ fontSize: 6, color: P.t4, marginTop: 4 }}>
                {REPORT_TEMPLATES.find(t => t.id === newSchedule.template)?.description}
              </div>
            )}
          </div>

          {/* Delivery method */}
          <div>
            <label style={{ fontSize: 7, color: P.t4, fontWeight: 700, marginBottom: 4, display: "block" }}>Delivery Method</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 6 }}>
              {DELIVERY_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setNewSchedule({ ...newSchedule, delivery: opt.id })}
                  style={{
                    padding: "8px 10px",
                    background: newSchedule.delivery === opt.id ? `${P.gold}20` : "#080D18",
                    border: `1px solid ${newSchedule.delivery === opt.id ? P.gold : P.b}`,
                    color: newSchedule.delivery === opt.id ? P.gold : P.t4,
                    fontSize: 7,
                    fontWeight: newSchedule.delivery === opt.id ? 700 : 400,
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Email recipients */}
          {(newSchedule.delivery === "email" || newSchedule.delivery === "both") && (
            <div>
              <label style={{ fontSize: 7, color: P.t4, fontWeight: 700, marginBottom: 4, display: "block" }}>Email Recipients (comma-separated)</label>
              <input
                type="text"
                value={newSchedule.recipients}
                onChange={(e) => setNewSchedule({ ...newSchedule, recipients: e.target.value })}
                placeholder="analyst@aumer.org, researcher@institute.org"
                style={{
                  width: "100%",
                  padding: "8px",
                  background: "#080D18",
                  border: `1px solid ${P.b}`,
                  color: P.t1,
                  fontSize: 8,
                  borderRadius: 6,
                  outline: "none",
                }}
              />
            </div>
          )}
        </div>

        <button
          onClick={handleCreateSchedule}
          disabled={creatingSchedule}
          style={{
            width: "100%",
            padding: "10px",
            background: creatingSchedule ? `${P.gold}15` : `${P.gold}20`,
            border: `1px solid ${P.gold}40`,
            color: P.gold,
            fontSize: 9,
            fontWeight: 800,
            borderRadius: 8,
            cursor: creatingSchedule ? "not-allowed" : "pointer",
            opacity: creatingSchedule ? 0.6 : 1,
          }}
        >
          {creatingSchedule ? "⟳ Creating..." : "✓ Create Schedule"}
        </button>
      </div>

      {/* Quick Templates */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 10 }}>🎯 Quick Templates</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          {REPORT_TEMPLATES.map(template => (
            <div
              key={template.id}
              style={{
                background: P.card,
                border: `1px solid ${P.b}`,
                borderRadius: 8,
                padding: 10,
              }}
            >
              <div style={{ fontSize: 8, fontWeight: 700, color: P.gold, marginBottom: 4 }}>{template.name}</div>
              <div style={{ fontSize: 6, color: P.t4, marginBottom: 6, lineHeight: 1.4 }}>{template.description}</div>
              <div style={{ fontSize: 7, color: P.t4, marginBottom: 6 }}>🔄 {template.frequency}</div>
              <button
                onClick={() => setNewSchedule({ template: template.id, delivery: "email", recipients: "" })}
                style={{
                  width: "100%",
                  padding: "6px",
                  background: `${P.blue}12`,
                  border: `1px solid ${P.blue}25`,
                  color: P.blue,
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