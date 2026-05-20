import { useState } from "react";
import { P, CASES, KEY_STATS } from "../../lib/teData";

const CASE_META = {
  "EPP-001": { tier: "Gold", color: P.gold, urgency: 0, flag: "🥇" },
  "EPP-002": { tier: "Gold", color: P.blue, urgency: 0, flag: "🔵" },
  "EPP-003": { tier: "Gold", color: P.red, urgency: 1, flag: "⚡" },
  "EPP-004": { tier: "Silver", color: P.amber, urgency: 0, flag: "🟡" },
  "EPP-005": { tier: "Gold", color: P.gold, urgency: 0, flag: "🥇" },
  "EPP-006": { tier: "Bronze", color: P.violet, urgency: 0, flag: "🟣" },
};

export default function CaseExplorer() {
  const [selectedCase, setSelectedCase] = useState(null);
  const [timelineView, setTimelineView] = useState("chronological"); // chronological | status

  const sortedCases = timelineView === "chronological"
    ? [...CASES].sort((a, b) => a.serviceStart - b.serviceStart)
    : [...CASES].sort((a, b) => (b.urgency || 0) - (a.urgency || 0));

  const minYear = Math.min(...CASES.map(c => c.serviceStart));
  const maxYear = Math.max(...CASES.map(c => c.serviceEnd || 2026));
  const yearRange = maxYear - minYear;

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1, padding: "14px 20px", overflowY: "auto", height: "calc(100vh - 118px)" }}>
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .case-card { animation: slideIn 0.3s ease both; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          🎖️ EPP Case <span style={{ color: P.gold }}>Explorer</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginTop: 2 }}>
          VERIFIED CASES · INTERACTIVE TIMELINE · SERVICE & DEPORTATION DATES
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { id: "chronological", label: "📅 Chronological", icon: "📅" },
            { id: "status", label: "🎯 By Status", icon: "🎯" },
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setTimelineView(v.id)}
              style={{
                padding: "5px 12px",
                background: timelineView === v.id ? `${P.gold}20` : P.card,
                border: `1px solid ${timelineView === v.id ? P.gold : P.b}`,
                color: timelineView === v.id ? P.gold : P.t4,
                fontSize: 7,
                fontWeight: timelineView === v.id ? 700 : 400,
                cursor: "pointer",
                borderRadius: 6,
              }}
            >
              {v.icon} {v.label}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 7, color: P.t4, marginLeft: "auto" }}>
          {CASES.length} Cases · {CASES.filter(c => c.deported).length} Deported · {CASES.filter(c => !c.deported).length} Active
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 12 }}>
        {/* Main timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sortedCases.map((caseItem, idx) => {
            const meta = CASE_META[caseItem.id];
            const isSelected = selectedCase?.id === caseItem.id;
            const serviceYears = caseItem.serviceEnd - caseItem.serviceStart;
            const yearsSinceService = 2026 - caseItem.serviceEnd;

            return (
              <div
                key={caseItem.id}
                onClick={() => setSelectedCase(isSelected ? null : caseItem)}
                className="case-card"
                style={{
                  background: isSelected ? `${meta.color}10` : P.card,
                  border: `2px solid ${isSelected ? meta.color + "80" : P.b + "40"}`,
                  borderLeft: `4px solid ${meta.color}`,
                  borderRadius: 10,
                  padding: "14px 16px",
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                {/* Case header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, fontWeight: 800, color: P.gold }}>
                        {caseItem.id}
                      </span>
                      <span style={{ fontSize: 8, fontWeight: 700, color: meta.color }}>{meta.flag}</span>
                      <span style={{ fontSize: 7, background: `${meta.color}15`, border: `1px solid ${meta.color}25`, color: meta.color, borderRadius: 4, padding: "2px 6px", fontWeight: 700 }}>
                        {meta.tier}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 3 }}>
                      {caseItem.name}
                    </div>
                    <div style={{ fontSize: 7, color: P.t4 }}>
                      {caseItem.branch} · {caseItem.country || caseItem.location}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: 8,
                        fontWeight: 800,
                        color: caseItem.deported ? P.red : P.teal,
                        marginBottom: 4,
                      }}
                    >
                      {caseItem.deported ? "🔴 DEPORTED" : "🟢 ACTIVE"}
                    </div>
                    <div style={{ fontSize: 7, color: P.t4, fontFamily: "'IBM Plex Mono',monospace" }}>
                      {caseItem.confidence}% confidence
                    </div>
                  </div>
                </div>

                {/* Timeline bar */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 6, color: P.t4, marginBottom: 4, fontWeight: 700 }}>SERVICE TIMELINE</div>
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    {/* Year labels */}
                    <span style={{ fontSize: 6, color: P.t4, minWidth: 26 }}>{caseItem.serviceStart}</span>

                    {/* Service bar */}
                    <div style={{ background: "#080D18", borderRadius: 3, height: 8, flex: 1, overflow: "hidden", position: "relative" }}>
                      <div
                        style={{
                          background: meta.color,
                          height: "100%",
                          borderRadius: 3,
                          width: `${(serviceYears / yearRange) * 100}%`,
                          minWidth: "2px",
                        }}
                      />
                      {caseItem.deported && (
                        <div
                          style={{
                            position: "absolute",
                            right: 0,
                            top: -6,
                            width: 2,
                            height: 20,
                            background: P.red,
                            boxShadow: `0 0 4px ${P.red}`,
                          }}
                        />
                      )}
                    </div>

                    <span style={{ fontSize: 6, color: P.t4, minWidth: 26 }}>{caseItem.serviceEnd}</span>
                  </div>
                  <div style={{ fontSize: 6, color: P.t4, marginTop: 4, display: "flex", justifyContent: "space-between" }}>
                    <span>{serviceYears} years service</span>
                    {caseItem.deported && <span style={{ color: P.red, fontWeight: 700 }}>Deported {caseItem.deportationYear}</span>}
                  </div>
                </div>

                {/* Expanded details */}
                {isSelected && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${P.b}30` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                      <div style={{ background: "#080D18", borderRadius: 6, padding: "8px 10px" }}>
                        <div style={{ fontSize: 6, color: P.t4, marginBottom: 2 }}>BRANCH</div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: meta.color }}>{caseItem.branch}</div>
                      </div>
                      <div style={{ background: "#080D18", borderRadius: 6, padding: "8px 10px" }}>
                        <div style={{ fontSize: 6, color: P.t4, marginBottom: 2 }}>RANK</div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: meta.color }}>{caseItem.rank}</div>
                      </div>
                      <div style={{ background: "#080D18", borderRadius: 6, padding: "8px 10px" }}>
                        <div style={{ fontSize: 6, color: P.t4, marginBottom: 2 }}>BIRTHPLACE</div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: meta.color }}>{caseItem.country}</div>
                      </div>
                      <div style={{ background: "#080D18", borderRadius: 6, padding: "8px 10px" }}>
                        <div style={{ fontSize: 6, color: P.t4, marginBottom: 2 }}>DEPLOYMENTS</div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: meta.color }}>{caseItem.deployments}</div>
                      </div>
                    </div>
                    {caseItem.deported && (
                      <div style={{ background: `${P.red}10`, border: `1px solid ${P.red}20`, borderRadius: 6, padding: "8px 10px" }}>
                        <div style={{ fontSize: 6, color: P.red, fontWeight: 700, marginBottom: 2 }}>DEPORTATION STATUS</div>
                        <div style={{ fontSize: 8, color: P.t2 }}>
                          Deported {caseItem.deportationYear} · Current: {caseItem.location || "Unknown"}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Summary */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 8, color: P.t4, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>CASE SUMMARY</div>
            {[
              { label: "Total Cases", value: CASES.length, color: P.blue },
              { label: "Deported", value: CASES.filter(c => c.deported).length, color: P.red },
              { label: "Active", value: CASES.filter(c => !c.deported).length, color: P.teal },
              { label: "Avg Confidence", value: Math.round(CASES.reduce((sum, c) => sum + c.confidence, 0) / CASES.length) + "%", color: P.gold },
            ].map((stat, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: i < 3 ? `1px solid ${P.b}20` : "none" }}>
                <span style={{ fontSize: 7, color: P.t4 }}>{stat.label}</span>
                <span style={{ fontSize: 8, fontWeight: 800, color: stat.color, fontFamily: "'IBM Plex Mono',monospace" }}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* Service date range */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 8, color: P.t4, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>SERVICE RANGE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div>
                <div style={{ fontSize: 6, color: P.t4, marginBottom: 2 }}>Earliest Service</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: P.gold }}>{minYear}</div>
              </div>
              <div>
                <div style={{ fontSize: 6, color: P.t4, marginBottom: 2 }}>Latest Service End</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: P.blue }}>{maxYear}</div>
              </div>
              <div style={{ background: "#080D18", borderRadius: 6, padding: "6px 8px", marginTop: 4 }}>
                <div style={{ fontSize: 6, color: P.t4 }}>Total span</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: P.teal }}>{yearRange} years</div>
              </div>
            </div>
          </div>

          {/* Tier distribution */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 8, color: P.t4, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>TIER DISTRIBUTION</div>
            {["Gold", "Silver", "Bronze"].map((tier, i) => {
              const count = CASES.filter(c => CASE_META[c.id]?.tier === tier).length;
              const color = tier === "Gold" ? P.gold : tier === "Silver" ? P.amber : P.violet;
              return (
                <div key={i} style={{ marginBottom: i < 2 ? 6 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: 7, color: P.t3 }}>{tier}</span>
                    <span style={{ fontSize: 7, fontWeight: 700, color: color }}>{count}</span>
                  </div>
                  <div style={{ background: "#030508", borderRadius: 2, height: 4, overflow: "hidden" }}>
                    <div style={{ width: `${(count / CASES.length) * 100}%`, height: "100%", background: color, borderRadius: 2 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}