import { REFRESH_INTERVAL } from "../../lib/sources";

const fmtCountdown = (s) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function DashboardHeader({
  countdown,
  pulls,
  liveCount,
  totalResults,
  totalSources,
  onSweep,
}) {
  const stats = [
    { n: pulls, l: "Pulls", c: "#2DD4BF" },
    { n: liveCount, l: "Live", c: "#4A9EFF" },
    { n: totalResults, l: "Results", c: "#F5C842" },
    { n: totalSources, l: "Sources", c: "#9D7BFF" },
  ];

  return (
    <div className="te-header">
      <div className="te-header-rainbow" />
      <div className="te-header-inner">
        <div className="te-header-left">
          <div className="te-header-label">
            TRUTHENGINE360 · AUMER FOUNDATION · EXPANDED INTELLIGENCE NETWORK v2
          </div>
          <div className="te-header-title">
            📡 <span style={{ color: "#2DD4BF" }}>24/7</span> Intelligence
            Crawler —{" "}
            <span style={{ color: "#FF8C42" }}>Mexico + US Federal</span> +
            Academic
          </div>
          <div className="te-header-subtitle">
            14 sources · Selective Service · Census · ICE · SEDENA · RENAPO ·
            Casa del Migrante · Social Media · Congress.gov
          </div>
        </div>
        <div className="te-header-right">
          <div className="te-countdown-box">
            <div className="te-countdown-label">NEXT SWEEP</div>
            <div
              className={`te-countdown-value ${countdown < 30 ? "te-blink" : ""}`}
              style={{ color: countdown < 60 ? "#FF5C5C" : "#F5B942" }}
            >
              {fmtCountdown(countdown)}
            </div>
            <div className="te-countdown-bar">
              <div
                className="te-countdown-fill"
                style={{
                  width: `${((REFRESH_INTERVAL - countdown) / REFRESH_INTERVAL) * 100}%`,
                }}
              />
            </div>
          </div>
          {stats.map((s, i) => (
            <div
              key={i}
              className="te-stat-box"
              style={{
                borderColor: `${s.c}30`,
                borderTopColor: s.c,
              }}
            >
              <div className="te-stat-value" style={{ color: s.c }}>
                {s.n}
              </div>
              <div className="te-stat-label">{s.l}</div>
            </div>
          ))}
          <button className="te-sweep-btn" onClick={onSweep}>
            ▶ SWEEP NOW
          </button>
        </div>
      </div>
    </div>
  );
}