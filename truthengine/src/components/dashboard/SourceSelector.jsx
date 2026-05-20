import { CATEGORIES, CAT_COLORS, ALL_CRAWLERS } from "../../lib/sources";

const fmtTime = (iso) => (iso ? new Date(iso).toLocaleTimeString() : "—");
const statusColor = (s) =>
  s === "done"
    ? "#2DD4BF"
    : s === "running"
      ? "#F5B942"
      : s === "error"
        ? "#FF5C5C"
        : "#3D5570";

export default function SourceSelector({
  catFilter,
  setCatFilter,
  selSrc,
  setSelSrc,
  status,
  updated,
  active,
  visible,
}) {
  return (
    <div className="te-source-selector">
      {/* Category pills */}
      <div className="te-cat-row">
        {CATEGORIES.map((c) => {
          const isActive = catFilter === c;
          const color = CAT_COLORS[c] || "#4A9EFF";
          return (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className="te-cat-pill"
              style={{
                background: isActive ? `${color}22` : "transparent",
                borderColor: isActive ? color : "#1A2640",
                color: isActive ? color : "#6B8BAA",
                fontWeight: isActive ? 700 : 400,
              }}
            >
              {c}
              {c !== "All" && (
                <span style={{ marginLeft: 4, opacity: 0.7 }}>
                  ({ALL_CRAWLERS.filter((x) => x.cat === c).length})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Source buttons */}
      <div className="te-source-row">
        {visible.map((src) => {
          const s = status[src.id] || "idle";
          const isRunning = active === src.id;
          const sc = statusColor(s);
          const isSel = selSrc === src.id;
          return (
            <button
              key={src.id}
              className="te-source-btn"
              onClick={() => setSelSrc(src.id)}
              style={{
                background: isSel ? `${src.color}18` : "transparent",
                borderColor: isSel ? src.color : "#1A2640",
                color: isSel ? src.color : "#6B8BAA",
              }}
            >
              <span className={isRunning ? "te-spin" : ""}>{src.icon}</span>
              <span>{src.label.split(" ")[0]}</span>
              <span
                className={`te-status-dot ${isRunning ? "te-pulse" : ""}`}
                style={{ background: sc }}
              />
              {updated[src.id] && (
                <span className="te-source-time">
                  {fmtTime(updated[src.id])}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}