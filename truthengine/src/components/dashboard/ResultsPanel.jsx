const fmtTime = (iso) => (iso ? new Date(iso).toLocaleTimeString() : "—");

export default function ResultsPanel({
  source,
  results,
  sourceStatus,
  updatedAt,
  selResult,
  setSelResult,
  onRefresh,
}) {
  return (
    <div className="te-results-panel">
      {/* Source detail header */}
      <div className="te-results-header">
        <div className="te-results-header-left">
          <div className="te-results-title" style={{ color: source.color }}>
            {source.icon} {source.label}
          </div>
          <div className="te-results-desc">{source.desc}</div>
          <div className="te-results-badges">
            <span
              className="te-badge"
              style={{
                background: `${source.color}18`,
                borderColor: `${source.color}30`,
                color: source.color,
              }}
            >
              {source.access}
            </span>
            <span
              className="te-badge te-badge-irb"
              style={{
                color: source.irb.includes("ZERO")
                  ? "#2DD4BF"
                  : source.irb.includes("LOW")
                    ? "#F5B942"
                    : "#FF5C5C",
              }}
            >
              IRB: {source.irb}
            </span>
            <span className="te-badge-time">Last: {fmtTime(updatedAt)}</span>
          </div>
        </div>
        <button
          className="te-refresh-btn"
          onClick={onRefresh}
          style={{
            background: `${source.color}18`,
            borderColor: `${source.color}30`,
            color: source.color,
          }}
        >
          Refresh
        </button>
      </div>

      {/* Running state */}
      {sourceStatus === "running" && (
        <div
          className="te-running-box"
          style={{ borderColor: `${source.color}30` }}
        >
          <div className="te-pulse" style={{ color: source.color }}>
            ⟳ Crawling {source.label}...
          </div>
        </div>
      )}

      {/* Empty state */}
      {results.length === 0 && sourceStatus !== "running" && (
        <div className="te-empty-box">
          No results yet — click Refresh or SWEEP NOW
        </div>
      )}

      {/* Results list */}
      {results.map((item, i) => {
        const isSelected = selResult === i;
        return (
          <div
            key={i}
            className="te-result-item"
            onClick={() => setSelResult(isSelected ? null : i)}
            style={{
              background: isSelected ? "#0D1525" : "transparent",
              borderColor: isSelected ? `${source.color}50` : "#1A264040",
              borderLeftColor: isSelected ? source.color : "#1A2640",
            }}
          >
            <div className="te-result-top">
              <div className="te-result-content">
                <div className="te-result-title">
                  {item.title?.slice(0, 100)}
                </div>
                <div className="te-result-meta">{item.meta}</div>
              </div>
              <div className="te-result-tags">
                <span
                  className="te-result-badge"
                  style={{
                    background: `${source.color}18`,
                    borderColor: `${source.color}30`,
                    color: source.color,
                  }}
                >
                  {item.badge}
                </span>
                {item.tag && <span className="te-result-tag">{item.tag}</span>}
              </div>
            </div>
            {isSelected && (
              <div className="te-result-expanded">
                <div className="te-result-snippet">{item.snippet}</div>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="te-result-link"
                    style={{
                      color: source.color,
                      borderColor: `${source.color}30`,
                    }}
                  >
                    → Open Source
                  </a>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}