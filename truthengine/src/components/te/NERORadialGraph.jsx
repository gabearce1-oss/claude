import { useState, useMemo } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { P } from "../../lib/teData";

const NERO_VECTORS = {
  N: { label: "Notification", desc: "VA-ICE automatic query mandate", baseline: 88, current: 88, color: P.blue },
  E: { label: "Erasure", desc: "DCAS Hispanic misclassification", baseline: 96, current: 96, color: P.red },
  R: { label: "Restriction", desc: "IIRIRA §237 & MAVNI block", baseline: 79, current: 85, color: P.amber },
  O: { label: "Obscurity", desc: "92 confirmed vs 94,000+ est.", baseline: 94, current: 96, color: P.violet },
};

const THRESHOLDS = [
  { name: "Safe", value: 60, color: P.teal, label: "Acceptable Risk" },
  { name: "Concern", value: 75, color: P.amber, label: "Policy Gap" },
  { name: "Crisis", value: 90, color: P.red, label: "Critical" },
];

const HISTORICAL_PERIODS = [
  { period: "Biden (2021-2024)", N: 85, E: 96, R: 76, O: 88, composite: 86.25 },
  { period: "Trump 1 (2017-2020)", N: 92, E: 96, R: 82, O: 91, composite: 90.25 },
  { period: "Trump 2 (2025-2026)", N: 88, E: 96, R: 85, O: 96, composite: 91.25 },
];

export default function NERORadialGraph() {
  const [toggles, setToggles] = useState({ N: true, E: true, R: true, O: true });
  const [viewMode, setViewMode] = useState("current"); // current | historical | comparison
  const [selectedPeriod, setSelectedPeriod] = useState("Trump 2 (2025-2026)");

  const currentData = [
    { vector: "Notification", value: toggles.N ? NERO_VECTORS.N.current : 0, baseline: NERO_VECTORS.N.baseline },
    { vector: "Erasure", value: toggles.E ? NERO_VECTORS.E.current : 0, baseline: NERO_VECTORS.E.baseline },
    { vector: "Restriction", value: toggles.R ? NERO_VECTORS.R.current : 0, baseline: NERO_VECTORS.R.baseline },
    { vector: "Obscurity", value: toggles.O ? NERO_VECTORS.O.current : 0, baseline: NERO_VECTORS.O.baseline },
  ];

  const activeVectors = Object.values(toggles).filter(Boolean).length;
  
  const compositeIndex = useMemo(() => {
    const values = Object.entries(toggles)
      .filter(([, enabled]) => enabled)
      .map(([key]) => NERO_VECTORS[key].current);
    return values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 0;
  }, [toggles]);

  const riskLevel = compositeIndex >= 90 ? "CRITICAL" : compositeIndex >= 75 ? "POLICY GAP" : "ACCEPTABLE";
  const riskColor = compositeIndex >= 90 ? P.red : compositeIndex >= 75 ? P.amber : P.teal;

  const toggleVector = (key) => {
    setToggles(p => ({ ...p, [key]: !p[key] }));
  };

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          ⚠️ NERO <span style={{ color: P.gold }}>Institutional Erasure Framework</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          4-VECTOR RADIAL ANALYSIS · THRESHOLD TRACKING · INTERACTIVE TOGGLE
        </div>
      </div>

      {/* View mode tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "8px 10px", width: "fit-content" }}>
        {[["current", "📊 Current"], ["historical", "📈 Historical"], ["comparison", "🔄 Compare"]].map(([m, l]) => (
          <button key={m} onClick={() => setViewMode(m)}
            style={{ padding: "6px 12px", fontSize: 8, fontWeight: viewMode === m ? 700 : 400,
              background: viewMode === m ? `${P.gold}20` : "transparent",
              border: `1px solid ${viewMode === m ? P.gold : P.b}`,
              color: viewMode === m ? P.gold : P.t4, borderRadius: 6, cursor: "pointer" }}>
            {l}
          </button>
        ))}
      </div>

      {viewMode === "current" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 12 }}>
          {/* Radial chart */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={currentData}>
                <PolarGrid stroke={`${P.b}40`} />
                <PolarAngleAxis dataKey="vector" tick={{ fontSize: 8, fill: P.t4 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 7, fill: P.t4 }} />
                <Radar name="Current Score" dataKey="value" stroke={P.gold} fill={P.gold} fillOpacity={0.4} />
                <Radar name="Baseline" dataKey="baseline" stroke={P.b} strokeDasharray="5 5" fillOpacity={0} />
                <Tooltip contentStyle={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 6, fontSize: 8 }} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Control panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Composite score */}
            <div style={{ background: `${riskColor}12`, border: `1px solid ${riskColor}25`, borderLeft: `4px solid ${riskColor}`,
              borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 7, color: P.t4, marginBottom: 4, letterSpacing: 1 }}>COMPOSITE INDEX</div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 28, fontWeight: 800, color: riskColor, lineHeight: 1 }}>
                {compositeIndex}
              </div>
              <div style={{ fontSize: 8, fontWeight: 700, color: riskColor, marginTop: 4 }}>{riskLevel}</div>
            </div>

            {/* Vector toggles */}
            <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 10 }}>
              <div style={{ fontSize: 7, fontWeight: 700, color: P.t4, marginBottom: 8, letterSpacing: 1 }}>TOGGLE VECTORS</div>
              {Object.entries(NERO_VECTORS).map(([key, v]) => (
                <button key={key} onClick={() => toggleVector(key)}
                  style={{ width: "100%", padding: "7px 8px", marginBottom: 5, fontSize: 7, fontWeight: toggles[key] ? 700 : 400,
                    background: toggles[key] ? `${v.color}15` : "transparent",
                    border: `1px solid ${toggles[key] ? v.color : P.b}30`,
                    color: toggles[key] ? v.color : P.t4, borderRadius: 6, cursor: "pointer", textAlign: "left" }}>
                  {toggles[key] ? "✓" : "○"} {key} — {toggles[key] ? v.current : "disabled"}/100
                </button>
              ))}
              <div style={{ fontSize: 6, color: P.t4, marginTop: 6, padding: "4px 0", borderTop: `1px solid ${P.b}20` }}>
                Active vectors: {activeVectors}/4
              </div>
            </div>

            {/* Threshold markers */}
            <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 10 }}>
              <div style={{ fontSize: 7, fontWeight: 700, color: P.t4, marginBottom: 8, letterSpacing: 1 }}>THRESHOLDS</div>
              {THRESHOLDS.map((t, i) => (
                <div key={i} style={{ marginBottom: 5, padding: "4px 6px", background: `${t.color}08`, border: `1px solid ${t.color}25`,
                  borderRadius: 4, fontSize: 6, display: "flex", justifyContent: "space-between", color: P.t4 }}>
                  <span style={{ fontWeight: 700, color: t.color }}>{t.name}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace" }}>{t.value}/100</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === "historical" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {HISTORICAL_PERIODS.map((period, i) => {
            const periodData = [
              { vector: "N", value: period.N },
              { vector: "E", value: period.E },
              { vector: "R", value: period.R },
              { vector: "O", value: period.O },
            ];
            const isSelected = selectedPeriod === period.period;
            const c = i === 2 ? P.red : i === 1 ? P.amber : P.blue;

            return (
              <div key={i} style={{ background: isSelected ? `${c}08` : P.card, border: `1px solid ${isSelected ? c + "30" : P.b}`,
                borderRadius: 10, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 800, color: c }}>{period.period}</div>
                    <div style={{ fontSize: 7, color: P.t4, marginTop: 2 }}>
                      Composite: <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 800, color: c }}>
                        {period.composite}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedPeriod(period.period)}
                    style={{ padding: "5px 10px", fontSize: 7, fontWeight: 700, background: `${c}15`, border: `1px solid ${c}30`,
                      color: c, borderRadius: 6, cursor: "pointer" }}>
                    View
                  </button>
                </div>

                {/* Mini radar */}
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={periodData}>
                    <PolarGrid stroke={`${P.b}20`} />
                    <PolarAngleAxis dataKey="vector" tick={{ fontSize: 7, fill: P.t4 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 6, fill: P.t4 }} />
                    <Radar dataKey="value" stroke={c} fill={c} fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>

                {/* Vector breakdown */}
                <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                  {[
                    { k: "N", v: period.N },
                    { k: "E", v: period.E },
                    { k: "R", v: period.R },
                    { k: "O", v: period.O },
                  ].map(item => (
                    <div key={item.k} style={{ fontSize: 6, color: P.t4, padding: "3px 5px", background: P.bg, borderRadius: 4 }}>
                      <span style={{ fontWeight: 700, color: c }}>{item.k}</span>: {item.v}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === "comparison" && (
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 12 }}>
            Vector Trajectory: Biden → Trump 1 → Trump 2
          </div>

          {["N", "E", "R", "O"].map((key, i) => {
            const v = NERO_VECTORS[key];
            const biden = HISTORICAL_PERIODS[0][key];
            const trump1 = HISTORICAL_PERIODS[1][key];
            const trump2 = HISTORICAL_PERIODS[2][key];
            const delta = trump2 - biden;
            const deltaColor = delta > 0 ? P.red : delta < 0 ? P.teal : P.t4;

            return (
              <div key={key} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${P.b}20` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 800, color: v.color }}>{key} — {v.label}</div>
                    <div style={{ fontSize: 7, color: P.t4 }}>{v.desc}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 800, color: deltaColor }}>
                      {delta > 0 ? "+" : ""}{delta}
                    </div>
                    <div style={{ fontSize: 6, color: P.t4 }}>Biden → Trump 2</div>
                  </div>
                </div>

                {/* Timeline bars */}
                <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 40 }}>
                  {[
                    { period: "Biden", value: biden, color: P.blue },
                    { period: "Trump 1", value: trump1, color: P.amber },
                    { period: "Trump 2", value: trump2, color: P.red },
                  ].map((period, j) => (
                    <div key={j} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ background: period.color, width: "100%", height: `${(period.value / 100) * 30}px`, borderRadius: 4 }} />
                      <div style={{ fontSize: 6, color: P.t4, marginTop: 3 }}>{period.value}</div>
                      <div style={{ fontSize: 5, color: P.t4 }}>{period.period.split(" ")[0]}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Composite comparison */}
          <div style={{ background: `${P.red}08`, border: `1px solid ${P.red}25`, borderRadius: 8, padding: 10, marginTop: 12 }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: P.red, marginBottom: 6 }}>COMPOSITE TRAJECTORY</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {HISTORICAL_PERIODS.map((p, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, fontWeight: 800, color: i === 2 ? P.red : i === 1 ? P.amber : P.blue }}>
                    {p.composite}
                  </div>
                  <div style={{ fontSize: 6, color: P.t4, marginTop: 2 }}>{p.period}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}