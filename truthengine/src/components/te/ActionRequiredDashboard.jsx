import { useState } from "react";
import { P, CASES } from "../../lib/teData";

const PENDING_TASKS = [
  {
    id: "T001",
    caseId: "C004",
    caseName: "Sae Joon Park",
    taskType: "forensic_verification",
    title: "Verify military service records from NARA",
    description: "Cross-reference Park's service dates with DD-214 documentation",
    priority: "CRITICAL",
    dueDate: "2026-04-15",
    assignee: "Forensic Team",
    status: "pending",
    docsLinked: 3,
  },
  {
    id: "T002",
    caseId: "C001",
    caseName: "George Ramos",
    taskType: "evidence_validation",
    title: "Validate death certificate authenticity",
    description: "Verify consular death certificate through INAI",
    priority: "HIGH",
    dueDate: "2026-04-20",
    assignee: "Legal Team",
    status: "in_progress",
    docsLinked: 2,
  },
  {
    id: "T003",
    caseId: "C002",
    caseName: "Manuel Valenzuela",
    taskType: "foia_response",
    title: "Process FOIA response from VA",
    description: "Review VA FOIA response for medical records and determine strategy",
    priority: "HIGH",
    dueDate: "2026-04-18",
    assignee: "FOIA Team",
    status: "pending",
    docsLinked: 5,
  },
  {
    id: "T004",
    caseId: "C003",
    caseName: "Victor Valenzuela",
    taskType: "witness_interview",
    title: "Schedule witness interview",
    description: "Contact family member for testimony regarding military service",
    priority: "MEDIUM",
    dueDate: "2026-04-25",
    assignee: "Research Team",
    status: "pending",
    docsLinked: 1,
  },
  {
    id: "T005",
    caseId: "C005",
    caseName: "Miguel Segura",
    taskType: "forensic_verification",
    title: "DCAS record matching verification",
    description: "Confirm DCAS casualty record matches biographical data",
    priority: "CRITICAL",
    dueDate: "2026-04-12",
    assignee: "Forensic Team",
    status: "pending",
    docsLinked: 4,
  },
  {
    id: "T006",
    caseId: "C006",
    caseName: "Jose Duran",
    taskType: "legal_review",
    title: "Legal analysis for deportation appeal",
    description: "Assess INA §329 military naturalization claim applicability",
    priority: "HIGH",
    dueDate: "2026-04-22",
    assignee: "Legal Team",
    status: "pending",
    docsLinked: 6,
  },
];

const TASK_TYPE_LABELS = {
  forensic_verification: "🔍 Forensic Verification",
  evidence_validation: "✓ Evidence Validation",
  foia_response: "📋 FOIA Response",
  witness_interview: "🎤 Witness Interview",
  legal_review: "⚖️ Legal Review",
};

const STATUS_COLOR = {
  pending: P.amber,
  in_progress: P.blue,
  completed: P.teal,
};

const PRIORITY_COLOR = {
  CRITICAL: P.red,
  HIGH: P.amber,
  MEDIUM: P.gold,
};

export default function ActionRequiredDashboard({ setTab }) {
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedTask, setSelectedTask] = useState(null);
  const [sortBy, setSortBy] = useState("dueDate");

  const filtered = PENDING_TASKS.filter((t) =>
    (filterPriority === "All" || t.priority === filterPriority) &&
    (filterStatus === "All" || t.status === filterStatus)
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "dueDate") return new Date(a.dueDate) - new Date(b.dueDate);
    if (sortBy === "priority") {
      const pMap = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
      return pMap[a.priority] - pMap[b.priority];
    }
    return 0;
  });

  const stats = {
    total: PENDING_TASKS.length,
    critical: PENDING_TASKS.filter((t) => t.priority === "CRITICAL").length,
    overdue: PENDING_TASKS.filter((t) => new Date(t.dueDate) < new Date()).length,
    inProgress: PENDING_TASKS.filter((t) => t.status === "in_progress").length,
  };

  const tasksByType = Object.entries(TASK_TYPE_LABELS).map(([key, label]) => ({
    key,
    label,
    count: PENDING_TASKS.filter((t) => t.taskType === key).length,
  }));

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P.t1 }}>
          ⚡ Action <span style={{ color: P.gold }}>Required</span> Dashboard
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          {stats.total} PENDING TASKS · {stats.critical} CRITICAL · {stats.overdue} OVERDUE
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Total Tasks", value: stats.total, color: P.blue },
          { label: "Critical", value: stats.critical, color: P.red },
          { label: "Overdue", value: stats.overdue, color: P.red },
          { label: "In Progress", value: stats.inProgress, color: P.blue },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              background: P.card,
              border: `1px solid ${stat.color}25`,
              borderLeft: `4px solid ${stat.color}`,
              borderRadius: 8,
              padding: "8px 12px",
            }}
          >
            <div style={{ fontSize: 6, color: P.t4, marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 800, color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Task Types */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8, marginBottom: 14 }}>
        {tasksByType.map((tt) => (
          <div
            key={tt.key}
            style={{
              background: P.card,
              border: `1px solid ${P.b}`,
              borderRadius: 8,
              padding: "8px 10px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 7, color: P.t3, marginBottom: 4 }}>{tt.label}</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 800, color: P.gold }}>
              {tt.count}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {["All", "CRITICAL", "HIGH", "MEDIUM"].map((pri) => (
            <button
              key={pri}
              onClick={() => setFilterPriority(pri)}
              style={{
                padding: "5px 10px",
                background: filterPriority === pri ? `${PRIORITY_COLOR[pri] || P.blue}20` : P.card,
                border: `1px solid ${filterPriority === pri ? PRIORITY_COLOR[pri] || P.blue : P.b}`,
                color: filterPriority === pri ? PRIORITY_COLOR[pri] || P.blue : P.t4,
                fontSize: 7,
                fontWeight: filterPriority === pri ? 700 : 400,
                cursor: "pointer",
                borderRadius: 6,
              }}
            >
              {pri}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["All", "pending", "in_progress"].map((sta) => (
            <button
              key={sta}
              onClick={() => setFilterStatus(sta)}
              style={{
                padding: "5px 10px",
                background: filterStatus === sta ? `${STATUS_COLOR[sta] || P.blue}20` : P.card,
                border: `1px solid ${filterStatus === sta ? STATUS_COLOR[sta] || P.blue : P.b}`,
                color: filterStatus === sta ? STATUS_COLOR[sta] || P.blue : P.t4,
                fontSize: 7,
                fontWeight: filterStatus === sta ? 700 : 400,
                cursor: "pointer",
                borderRadius: 6,
              }}
            >
              {sta === "All" ? "All" : sta === "pending" ? "Pending" : "In Progress"}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
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
          <option value="dueDate">Sort by Due Date</option>
          <option value="priority">Sort by Priority</option>
        </select>
      </div>

      {/* Task list */}
      <div style={{ display: "grid", gap: 8 }}>
        {sorted.map((task) => {
          const caseData = CASES.find((c) => c.id === task.caseId);
          const isSelected = selectedTask?.id === task.id;
          const daysUntilDue = Math.ceil((new Date(task.dueDate) - new Date()) / 86400000);
          const isOverdue = daysUntilDue < 0;

          return (
            <div
              key={task.id}
              onClick={() => setSelectedTask(isSelected ? null : task)}
              style={{
                background: isSelected ? `${PRIORITY_COLOR[task.priority]}15` : P.card,
                border: `1px solid ${isSelected ? PRIORITY_COLOR[task.priority] : P.b}`,
                borderLeft: `4px solid ${PRIORITY_COLOR[task.priority]}`,
                borderRadius: 8,
                padding: 12,
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, fontWeight: 800, color: P.gold }}>
                      {task.id}
                    </span>
                    <span
                      style={{
                        fontSize: 7,
                        background: `${PRIORITY_COLOR[task.priority]}15`,
                        border: `1px solid ${PRIORITY_COLOR[task.priority]}25`,
                        color: PRIORITY_COLOR[task.priority],
                        borderRadius: 4,
                        padding: "2px 6px",
                        fontWeight: 700,
                      }}
                    >
                      {task.priority}
                    </span>
                    <span
                      style={{
                        fontSize: 7,
                        background: `${STATUS_COLOR[task.status] || P.blue}15`,
                        border: `1px solid ${STATUS_COLOR[task.status] || P.blue}25`,
                        color: STATUS_COLOR[task.status] || P.blue,
                        borderRadius: 4,
                        padding: "2px 6px",
                        fontWeight: 700,
                      }}
                    >
                      {task.status === "pending" ? "Pending" : "In Progress"}
                    </span>
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 2 }}>{task.title}</div>
                  <div style={{ fontSize: 7, color: P.t4, marginBottom: 4 }}>
                    Case: {task.caseName} ({task.caseId})
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 6, color: isOverdue ? P.red : P.t4, fontWeight: 700, marginBottom: 4 }}>
                    {isOverdue ? `${Math.abs(daysUntilDue)}d OVERDUE` : `${daysUntilDue}d left`}
                  </div>
                  <div
                    style={{
                      fontSize: 6,
                      background: `${P.blue}15`,
                      border: `1px solid ${P.blue}25`,
                      color: P.blue,
                      borderRadius: 4,
                      padding: "2px 5px",
                      fontWeight: 700,
                    }}
                  >
                    {task.docsLinked} docs
                  </div>
                </div>
              </div>

              {isSelected && (
                <div style={{ paddingTop: 10, borderTop: `1px solid ${P.b}`, marginTop: 10 }}>
                  <div style={{ fontSize: 7, color: P.t2, lineHeight: 1.6, marginBottom: 8 }}>
                    <strong>Description:</strong> {task.description}
                  </div>
                  <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 6, color: P.t4, marginBottom: 3 }}>Type</div>
                      <div style={{ fontSize: 7, color: P.t1 }}>{TASK_TYPE_LABELS[task.taskType]}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 6, color: P.t4, marginBottom: 3 }}>Assignee</div>
                      <div style={{ fontSize: 7, color: P.t1 }}>{task.assignee}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 6, color: P.t4, marginBottom: 3 }}>Due Date</div>
                      <div style={{ fontSize: 7, color: P.t1 }}>{task.dueDate}</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTab("evidence");
                    }}
                    style={{
                      padding: "6px 12px",
                      fontSize: 7,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: `${P.blue}15`,
                      border: `1px solid ${P.blue}25`,
                      color: P.blue,
                      borderRadius: 6,
                    }}
                  >
                    → View Evidence
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}