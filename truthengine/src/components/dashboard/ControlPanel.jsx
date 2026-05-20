import { SOURCE_GROUPS, CAT_COLORS, MISSION_QUERIES } from "../../lib/sources";

const statusColor = (s) =>
  s === "done"
    ? "#2DD4BF"
    : s === "running"
      ? "#F5B942"
      : s === "error"
        ? "#FF5C5C"
        : "#3D5570";

export default function ControlPanel({
  status,
  results,
  qIdx,
  logs,
  onSelectSource,
}) {
  return (
    <div className="te-control-panel">
      {/* Source health */}
      <div className="te-control-section te-control-health">
        <div className="te-control-title" style={{ color: "#F5C842" }}>
          SOURCE HEALTH — 14 SOURCES
        </div>
        {SOURCE_GROUPS.map((grp) => {
          const catKey =
            grp.label === "Research" ? "Academic" : grp.label;
          return (
            <div key={grp.label} className="te-health-group">
              <div
                className="te-health-group-label"
                style={{ color: CAT_COLORS[catKey] || "#3D5570" }}
              >
                {grp.label}
              </div>
              {grp.sources.map((src) => {
                const s = status[src.id] || "idle";
                const cnt = (results[src.id] || []).length;
                const sc = statusColor(s);
                return (
                  <div
                    key={src.id}
                    className="te-health-row"
                    onClick={() => onSelectSource(src.id)}
                  >
                    <div className="te-health-info">
                      <span style={{ color: src.color }}>
                        {src.icon} {src.label.slice(0, 20)}
                      </span>
                      <span style={{ color: sc }}>
                        {cnt}r · {s}
                      </span>
                    </div>
                    <div className="te-health-bar">
                      <div
                        className="te-health-fill"
                        style={{
                          width: `${(Math.min(cnt, 5) / 5) * 100}%`,
                          background: src.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Query rotation */}
      <div className="te-control-section te-control-queries">
        <div className="te-control-title" style={{ color: "#2DD4BF" }}>
          QUERY ROTATION
        </div>
        {MISSION_QUERIES.map((q, i) => {
          const isActive = i === qIdx % MISSION_QUERIES.length;
          return (
            <div
              key={i}
              className="te-query-row"
              style={{ color: isActive ? "#F5C842" : "#3D5570" }}
            >
              <span
                style={{
                  color: isActive ? "#F5C842" : "#1A2640",
                  flexShrink: 0,
                }}
              >
                {isActive ? "▶" : "○"}
              </span>
              <span>{q.slice(0, 42)}</span>
            </div>
          );
        })}
      </div>

      {/* Live log */}
      <div className="te-control-section te-control-log">
        <div className="te-control-title" style={{ color: "#9D7BFF" }}>
          LIVE LOG
        </div>
        {logs.map((log, i) => (
          <div
            key={i}
            className="te-log-row"
            style={{ opacity: i === 0 ? 1 : Math.max(0.3, 1 - i * 0.04) }}
          >
            <span className="te-log-time">{log.ts}</span>
            <span
              style={{
                color:
                  log.type === "error"
                    ? "#FF5C5C"
                    : log.type === "success"
                      ? "#2DD4BF"
                      : log.type === "sweep"
                        ? "#F5C842"
                        : "#6B8BAA",
              }}
            >
              {log.msg}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}