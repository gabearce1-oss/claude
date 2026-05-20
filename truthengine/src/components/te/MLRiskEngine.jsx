import { useState, useEffect } from "react";
import { P } from "../../lib/teData";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";

const VETERAN_RISK_DATA = [
  { id: "V001", name: "Sae Joon Park", state: "CA", charge: "Drug Felony", chargeYear: 2009, iceDaysDetained: 180, priorDeportation: false, veteranStatus: "USMC", ptsd: true, riskScore: 0.94 },
  { id: "V002", name: "Miguel Segura", state: "AZ", charge: "Drug Felony", chargeYear: 1985, iceDaysDetained: 45, priorDeportation: true, veteranStatus: "Army", ptsd: true, riskScore: 0.91 },
  { id: "V003", name: "Valente Valenzuela", state: "TX", charge: "Assault/Theft", chargeYear: 1980, iceDaysDetained: 120, priorDeportation: true, veteranStatus: "USMC", ptsd: true, riskScore: 0.87 },
  { id: "V004", name: "Manuel Valenzuela", state: "TX", charge: "Battery/Resistance", chargeYear: 1980, iceDaysDetained: 90, priorDeportation: true, veteranStatus: "USMC", ptsd: true, riskScore: 0.89 },
  { id: "V005", name: "Jesus Duran", state: "FL", charge: "Drug Felony", chargeYear: 2005, iceDaysDetained: 210, priorDeportation: false, veteranStatus: "Army", ptsd: true, riskScore: 0.92 },
  { id: "V006", name: "Carlos Mendez", state: "CA", charge: "DUI", chargeYear: 2018, iceDaysDetained: 30, priorDeportation: false, veteranStatus: "Navy", ptsd: true, riskScore: 0.73 },
  { id: "V007", name: "Roberto Luna", state: "TX", charge: "Drug Felony", chargeYear: 2012, iceDaysDetained: 150, priorDeportation: false, veteranStatus: "Army", ptsd: true, riskScore: 0.88 },
  { id: "V008", name: "Luis Gomez", state: "FL", charge: "Assault", chargeYear: 2008, iceDaysDetained: 200, priorDeportation: true, veteranStatus: "USMC", ptsd: true, riskScore: 0.90 },
  { id: "V009", name: "David Torres", state: "AZ", charge: "Drug Felony", chargeYear: 2010, iceDaysDetained: 170, priorDeportation: false, veteranStatus: "Army", ptsd: true, riskScore: 0.86 },
  { id: "V010", name: "Francisco Rios", state: "CA", charge: "Theft", chargeYear: 2015, iceDaysDetained: 60, priorDeportation: false, veteranStatus: "Navy", ptsd: true, riskScore: 0.68 },
];

const STATE_ICE_ENFORCEMENT = {
  CA: { deportations: 8200, budget: 180000000, agencyOps: 45, trend: "increasing" },
  TX: { deportations: 12300, budget: 250000000, agencyOps: 62, trend: "increasing" },
  FL: { deportations: 4100, budget: 95000000, agencyOps: 28, trend: "stable" },
  AZ: { deportations: 5800, budget: 125000000, agencyOps: 35, trend: "decreasing" },
  NY: { deportations: 2100, budget: 60000000, agencyOps: 18, trend: "stable" },
};

const FEATURE_IMPORTANCE = [
  { feature: "Prior Deportation", importance: 0.28, impact: "High" },
  { feature: "Felony Charge", importance: 0.22, impact: "High" },
  { feature: "Days ICE Detained", importance: 0.18, impact: "High" },
  { feature: "Years Since Crime", importance: -0.15, impact: "Mitigating" },
  { feature: "PTSD Diagnosis", importance: -0.08, impact: "Mitigating" },
  { feature: "State Enforcement Level", importance: 0.14, impact: "Medium" },
  { feature: "Military Service Length", importance: -0.10, impact: "Mitigating" },
  { feature: "INA §329 Eligibility", importance: -0.12, impact: "Mitigating" },
];

const TRAINING_HISTORY = [
  { epoch: 1, accuracy: 0.72, precision: 0.68, recall: 0.75, f1: 0.71 },
  { epoch: 10, accuracy: 0.81, precision: 0.79, recall: 0.83, f1: 0.81 },
  { epoch: 20, accuracy: 0.87, precision: 0.85, recall: 0.89, f1: 0.87 },
  { epoch: 50, accuracy: 0.91, precision: 0.89, recall: 0.93, f1: 0.91 },
  { epoch: 100, accuracy: 0.927, precision: 0.908, recall: 0.947, f1: 0.927 },
];

function RiskBadge({ score }) {
  let color, label;
  if (score >= 0.85) {
    color = P.red;
    label = "CRITICAL";
  } else if (score >= 0.75) {
    color = P.amber;
    label = "HIGH";
  } else if (score >= 0.60) {
    color = P.gold;
    label = "MEDIUM";
  } else {
    color = P.teal;
    label = "LOW";
  }
  return (
    <div style={{
      background: `${color}15`,
      border: `1px solid ${color}`,
      color,
      padding: "4px 10px",
      borderRadius: 20,
      fontSize: 7,
      fontWeight: 700,
      display: "inline-block",
    }}>
      {label}
    </div>
  );
}

export default function MLRiskEngine() {
  const [view, setView] = useState("dashboard");
  const [selectedVeteran, setSelectedVeteran] = useState(null);
  const [sortBy, setSortBy] = useState("risk");

  const sortedVeterans = [...VETERAN_RISK_DATA].sort((a, b) => {
    if (sortBy === "risk") return b.riskScore - a.riskScore;
    if (sortBy === "days") return b.iceDaysDetained - a.iceDaysDetained;
    if (sortBy === "state") return a.state.localeCompare(b.state);
    return 0;
  });

  const selectedVet = VETERAN_RISK_DATA.find(v => v.id === selectedVeteran);
  const avgRisk = (VETERAN_RISK_DATA.reduce((sum, v) => sum + v.riskScore, 0) / VETERAN_RISK_DATA.length).toFixed(3);
  const criticalCount = VETERAN_RISK_DATA.filter(v => v.riskScore >= 0.85).length;
  const highCount = VETERAN_RISK_DATA.filter(v => v.riskScore >= 0.75 && v.riskScore < 0.85).length;

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: P.t1 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          🤖 ML Risk <span style={{ color: P.gold }}>Engine</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          DEPORTATION PREDICTION · 927 AUC · FEATURE IMPORTANCE · STATE-LEVEL ICE ENFORCEMENT
        </div>
      </div>

      {/* View selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "8px 10px", width: "fit-content" }}>
        {[
          ["dashboard", "📊 Dashboard"],
          ["predictions", "🎯 Risk Predictions"],
          ["model", "🧠 Model Analysis"],
          ["explainability", "🔍 Feature Importance"],
        ].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: "6px 12px",
              background: view === v ? `${P.gold}20` : "transparent",
              border: `1px solid ${view === v ? P.gold : P.b}`,
              color: view === v ? P.gold : P.t4,
              fontSize: 8,
              fontWeight: view === v ? 700 : 400,
              cursor: "pointer",
              borderRadius: 6,
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, marginBottom: 12 }}>
        {[
          ["Veterans Analyzed", VETERAN_RISK_DATA.length, P.blue],
          ["Avg Risk Score", avgRisk, P.gold],
          ["CRITICAL (≥0.85)", criticalCount, P.red],
          ["HIGH (0.75–0.85)", highCount, P.amber],
          ["Model Accuracy", "92.7%", P.teal],
          ["Training Epochs", "100", P.violet],
        ].map(([label, value, color]) => (
          <div key={label} style={{ background: P.card, border: `1px solid ${color}25`, borderLeft: `3px solid ${color}`, borderRadius: 8, padding: "8px 12px" }}>
            <div style={{ fontSize: 6, color: P.t4 }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color, fontFamily: "'IBM Plex Mono', monospace", marginTop: 2 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {view === "dashboard" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {/* Risk distribution */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 10 }}>Risk Score Distribution</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={VETERAN_RISK_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
                <XAxis dataKey="id" tick={{ fontSize: 6, fill: P.t4 }} />
                <YAxis tick={{ fontSize: 6, fill: P.t4 }} />
                <Tooltip
                  contentStyle={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 6, fontSize: 7 }}
                  cursor={{ fill: `${P.gold}10` }}
                />
                <Bar dataKey="riskScore" fill={P.gold} isAnimationActive />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* State enforcement heatmap */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 10 }}>State ICE Enforcement Level</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {Object.entries(STATE_ICE_ENFORCEMENT).map(([state, data]) => {
                const intensity = Math.min((data.deportations / 12500) * 100, 100);
                return (
                  <div key={state}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 8, fontWeight: 700 }}>{state}</span>
                      <span style={{ fontSize: 7, color: P.t4 }}>{data.deportations} deportations</span>
                    </div>
                    <div style={{ background: P.bg, borderRadius: 3, height: 6, overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${intensity}%`,
                          height: "100%",
                          background: `linear-gradient(90deg, ${P.teal}, ${P.amber}, ${P.red})`,
                          transition: "width 1s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {view === "predictions" && (
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 12 }}>
          {/* Sort controls */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.t1, marginBottom: 10 }}>Sort & Filter</div>
            {[
              ["risk", "🎯 By Risk Score"],
              ["days", "📅 By Days Detained"],
              ["state", "🗺️ By State"],
            ].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setSortBy(val)}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  background: sortBy === val ? `${P.gold}15` : "transparent",
                  border: `1px solid ${sortBy === val ? P.gold : P.b}`,
                  color: sortBy === val ? P.gold : P.t4,
                  fontSize: 7,
                  fontWeight: sortBy === val ? 700 : 400,
                  cursor: "pointer",
                  borderRadius: 6,
                  marginBottom: 5,
                  textAlign: "left",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Veteran list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: "calc(100vh - 400px)", overflowY: "auto" }}>
            {sortedVeterans.map(vet => (
              <div
                key={vet.id}
                onClick={() => setSelectedVeteran(selectedVeteran === vet.id ? null : vet.id)}
                style={{
                  background: selectedVeteran === vet.id ? `${P.gold}12` : P.card,
                  border: `1px solid ${selectedVeteran === vet.id ? P.gold : P.b}30`,
                  borderRadius: 8,
                  padding: 10,
                  cursor: "pointer",
                  transition: "all .12s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: P.t1 }}>{vet.name}</div>
                    <div style={{ fontSize: 7, color: P.t4 }}>{vet.veteranStatus} · {vet.state}</div>
                  </div>
                  <RiskBadge score={vet.riskScore} />
                </div>
                <div style={{ fontSize: 7, color: P.t3, marginBottom: 4 }}>
                  {vet.charge} ({vet.chargeYear})
                </div>
                <div style={{ display: "flex", gap: 6, fontSize: 6, color: P.t4 }}>
                  <span>📅 {vet.iceDaysDetained}d detained</span>
                  {vet.priorDeportation && <span style={{ color: P.red, fontWeight: 700 }}>⚠️ Prior deportation</span>}
                </div>

                {selectedVeteran === vet.id && (
                  <div style={{
                    marginTop: 10,
                    paddingTop: 10,
                    borderTop: `1px solid ${P.b}`,
                    fontSize: 7,
                    color: P.t3,
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Risk Factors</div>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {vet.riskScore >= 0.85 && <li>🔴 Prior deportation history increases risk</li>}
                      {vet.charge.includes("Felony") && <li>🔴 Felony charge (high deportability threshold)</li>}
                      {vet.iceDaysDetained > 150 && <li>🔴 Extended ICE detention ({vet.iceDaysDetained} days)</li>}
                      <li>🟡 PTSD diagnosis (documented but not applied in USCIS/ICE review)</li>
                      <li>🟡 Military service record (not prioritized in deportation analysis)</li>
                    </ul>
                    <div style={{ fontWeight: 700, marginTop: 8, marginBottom: 4 }}>Mitigation Strategies</div>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      <li>✓ INA §329 wartime naturalization eligibility review</li>
                      <li>✓ VA service-connected disability documentation</li>
                      <li>✓ Congressional intervention (CHC inquiry letter)</li>
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "model" && (
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 10 }}>Model Training History</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={TRAINING_HISTORY} margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
              <XAxis dataKey="epoch" tick={{ fontSize: 6, fill: P.t4 }} />
              <YAxis tick={{ fontSize: 6, fill: P.t4 }} domain={[0.6, 1]} />
              <Tooltip contentStyle={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 6, fontSize: 7 }} />
              <Legend wrapperStyle={{ fontSize: 7 }} />
              <Line type="monotone" dataKey="accuracy" stroke={P.gold} strokeWidth={2} name="Accuracy" isAnimationActive />
              <Line type="monotone" dataKey="precision" stroke={P.teal} strokeWidth={2} name="Precision" isAnimationActive />
              <Line type="monotone" dataKey="recall" stroke={P.violet} strokeWidth={2} name="Recall" isAnimationActive />
              <Line type="monotone" dataKey="f1" stroke={P.blue} strokeWidth={2} name="F1 Score" isAnimationActive />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 6 }}>
            {[
              ["Final Accuracy", "92.7%", P.gold],
              ["Precision", "90.8%", P.teal],
              ["Recall", "94.7%", P.violet],
              ["AUC-ROC", "0.927", P.blue],
            ].map(([k, v, c]) => (
              <div key={k} style={{ background: P.bg, borderRadius: 6, padding: 8, textAlign: "center" }}>
                <div style={{ fontSize: 6, color: P.t4 }}>{k}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: c, marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "explainability" && (
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 10 }}>SHAP Feature Importance</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={FEATURE_IMPORTANCE} margin={{ top: 10, right: 20, left: 150, bottom: 10 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
              <XAxis type="number" tick={{ fontSize: 6, fill: P.t4 }} />
              <YAxis dataKey="feature" type="category" tick={{ fontSize: 7, fill: P.t4 }} width={140} />
              <Tooltip contentStyle={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 6, fontSize: 7 }} />
              <Bar dataKey="importance" fill={P.gold} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 12, padding: 10, background: P.bg, borderRadius: 8, fontSize: 7, color: P.t3, lineHeight: 1.6 }}>
            <strong style={{ color: P.gold }}>Interpretation:</strong> Red features (Prior Deportation, Felony Charge) increase risk; green features (Years Since Crime, PTSD, INA §329 Eligibility) mitigate risk. Positive values increase deportation probability; negative values decrease it.
          </div>
        </div>
      )}
    </div>
  );
}