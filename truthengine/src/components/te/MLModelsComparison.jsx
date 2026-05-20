import { useState } from "react";
import { P } from "../../lib/teData";
import { BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";

const MODELS = {
  churn: {
    name: "Case Churn Model",
    icon: "📉",
    color: P.violet,
    description: "Predicts case attrition probability",
    accuracy: 0.847,
    precision: 0.831,
    recall: 0.863,
    f1: 0.847,
    auc: 0.891,
    trainingSet: 2847,
    testSet: 714,
    epochs: 150,
    features: 18,
    topFeatures: [
      { name: "Days in System", importance: 0.34 },
      { name: "Prior FOIA Gaps", importance: 0.22 },
      { name: "Legal Representation", importance: 0.18 },
      { name: "Congressional Interest", importance: -0.15 },
      { name: "Media Coverage", importance: -0.12 },
    ],
  },
  risk: {
    name: "Deportation Risk Model",
    icon: "⚡",
    color: P.red,
    description: "Predicts immediate deportation risk",
    accuracy: 0.927,
    precision: 0.908,
    recall: 0.947,
    f1: 0.927,
    auc: 0.927,
    trainingSet: 1547,
    testSet: 387,
    epochs: 100,
    features: 15,
    topFeatures: [
      { name: "Prior Deportation", importance: 0.28 },
      { name: "Felony Charge", importance: 0.22 },
      { name: "ICE Detention Days", importance: 0.18 },
      { name: "Years Since Crime", importance: -0.15 },
      { name: "PTSD Diagnosis", importance: -0.08 },
    ],
  },
  bisg: {
    name: "BISG Classification Model",
    icon: "🎯",
    color: P.blue,
    description: "Predicts Hispanic ethnicity from surname/state",
    accuracy: 0.937,
    precision: 0.924,
    recall: 0.951,
    f1: 0.937,
    auc: 0.972,
    trainingSet: 58220,
    testSet: 14555,
    epochs: 200,
    features: 12,
    topFeatures: [
      { name: "Surname Hispanic Index", importance: 0.45 },
      { name: "State Hispanic Density", importance: 0.28 },
      { name: "Age Cohort", importance: 0.12 },
      { name: "Named Entity Recognition", importance: 0.10 },
      { name: "Geographic Context", importance: 0.05 },
    ],
  },
};

const CONFUSION_MATRICES = {
  churn: [
    [567, 89],
    [98, 560],
  ],
  risk: [
    [234, 18],
    [13, 222],
  ],
  bisg: [
    [13440, 1115],
    [715, 13285],
  ],
};

const TRAINING_CURVES = {
  churn: [
    { epoch: 10, train: 0.78, val: 0.76, loss: 0.52 },
    { epoch: 30, train: 0.81, val: 0.79, loss: 0.42 },
    { epoch: 60, train: 0.83, val: 0.82, loss: 0.35 },
    { epoch: 100, train: 0.845, val: 0.841, loss: 0.28 },
    { epoch: 150, train: 0.847, val: 0.846, loss: 0.25 },
  ],
  risk: [
    { epoch: 10, train: 0.81, val: 0.79, loss: 0.48 },
    { epoch: 30, train: 0.88, val: 0.86, loss: 0.34 },
    { epoch: 60, train: 0.91, val: 0.905, loss: 0.22 },
    { epoch: 100, train: 0.928, val: 0.927, loss: 0.18 },
  ],
  bisg: [
    { epoch: 20, train: 0.89, val: 0.88, loss: 0.32 },
    { epoch: 60, train: 0.92, val: 0.915, loss: 0.22 },
    { epoch: 120, train: 0.938, val: 0.936, loss: 0.16 },
    { epoch: 200, train: 0.939, val: 0.937, loss: 0.14 },
  ],
};

function ConfusionMatrix({ modelKey }) {
  const matrix = CONFUSION_MATRICES[modelKey];
  const total = matrix[0][0] + matrix[0][1] + matrix[1][0] + matrix[1][1];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
      {matrix.map((row, i) =>
        row.map((val, j) => {
          const pct = ((val / total) * 100).toFixed(1);
          return (
            <div
              key={`${i}-${j}`}
              style={{
                background: (i === j ? P.teal : P.red) + "15",
                border: `1px solid ${i === j ? P.teal : P.red}`,
                borderRadius: 6,
                padding: 10,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 8, fontWeight: 700, color: P.t1 }}>{val}</div>
              <div style={{ fontSize: 6, color: P.t4 }}>{pct}%</div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default function MLModelsComparison() {
  const [selectedModel, setSelectedModel] = useState("risk");
  const [viewMode, setViewMode] = useState("overview");

  const model = MODELS[selectedModel];
  const metrics = [
    { label: "Accuracy", value: model.accuracy, color: P.blue },
    { label: "Precision", value: model.precision, color: P.teal },
    { label: "Recall", value: model.recall, color: P.gold },
    { label: "F1 Score", value: model.f1, color: P.violet },
    { label: "AUC-ROC", value: model.auc, color: P.amber },
  ];

  const metricsData = metrics.map(m => ({
    metric: m.label,
    value: parseFloat((m.value * 100).toFixed(1)),
  }));

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: P.t1 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          🤖 ML Models <span style={{ color: P.gold }}>Comparison</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          CHURN · RISK · BISG CLASSIFICATION · VALIDATION METRICS
        </div>
      </div>

      {/* Model selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "8px 10px", width: "fit-content" }}>
        {Object.entries(MODELS).map(([key, m]) => (
          <button
            key={key}
            onClick={() => setSelectedModel(key)}
            style={{
              padding: "8px 14px",
              background: selectedModel === key ? `${m.color}20` : "transparent",
              border: `1px solid ${selectedModel === key ? m.color : P.b}`,
              color: selectedModel === key ? m.color : P.t4,
              fontSize: 8,
              fontWeight: selectedModel === key ? 700 : 400,
              cursor: "pointer",
              borderRadius: 6,
            }}
          >
            <span style={{ marginRight: 6 }}>{m.icon}</span>
            {m.name}
          </button>
        ))}
      </div>

      {/* View mode tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "8px 10px", width: "fit-content" }}>
        {[
          ["overview", "📊 Overview"],
          ["curves", "📈 Training Curves"],
          ["features", "🔍 Feature Importance"],
          ["validation", "✓ Validation"],
        ].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setViewMode(v)}
            style={{
              padding: "6px 12px",
              background: viewMode === v ? `${model.color}20` : "transparent",
              border: `1px solid ${viewMode === v ? model.color : P.b}`,
              color: viewMode === v ? model.color : P.t4,
              fontSize: 8,
              fontWeight: viewMode === v ? 700 : 400,
              cursor: "pointer",
              borderRadius: 6,
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {viewMode === "overview" && (
        <div>
          {/* Model header */}
          <div style={{ background: P.card, border: `1px solid ${model.color}30`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: P.t1 }}>{model.name}</div>
                <div style={{ fontSize: 8, color: P.t4, marginTop: 3 }}>{model.description}</div>
              </div>
              <div style={{ fontSize: 28 }}>{model.icon}</div>
            </div>

            {/* Key metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {metrics.map(m => (
                <div key={m.label} style={{ background: P.bg, borderRadius: 8, padding: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 6, color: P.t4, marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: m.color, fontFamily: "'IBM Plex Mono', monospace" }}>
                    {(m.value * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {/* Dataset info */}
            <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 10 }}>Dataset</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  ["Training Samples", model.trainingSet, P.blue],
                  ["Test Samples", model.testSet, P.teal],
                  ["Total Features", model.features, P.gold],
                  ["Epochs", model.epochs, P.violet],
                ].map(([label, val, color]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: 6, background: P.bg, borderRadius: 6 }}>
                    <span style={{ fontSize: 8, color: P.t4 }}>{label}</span>
                    <span style={{ fontSize: 8, fontWeight: 700, color, fontFamily: "'IBM Plex Mono', monospace" }}>{val.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance radar */}
            <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 10 }}>Performance Profile</div>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={metricsData}>
                  <PolarGrid stroke={P.b} />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 6, fill: P.t4 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 6, fill: P.t4 }} />
                  <Radar name="Score" dataKey="value" stroke={model.color} fill={model.color} fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {viewMode === "curves" && (
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 10 }}>Training History</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={TRAINING_CURVES[selectedModel]} margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
              <XAxis dataKey="epoch" tick={{ fontSize: 6, fill: P.t4 }} />
              <YAxis tick={{ fontSize: 6, fill: P.t4 }} domain={[0, 1]} />
              <Tooltip contentStyle={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 6, fontSize: 7 }} />
              <Legend wrapperStyle={{ fontSize: 7 }} />
              <Line type="monotone" dataKey="train" stroke={model.color} strokeWidth={2} name="Training Accuracy" isAnimationActive />
              <Line type="monotone" dataKey="val" stroke={P.teal} strokeWidth={2} name="Validation Accuracy" isAnimationActive />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {viewMode === "features" && (
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 10 }}>Top Features (SHAP Values)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {model.topFeatures.map((f, i) => {
              const absImp = Math.abs(f.importance);
              const isPositive = f.importance > 0;
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: P.t1 }}>{f.name}</span>
                    <span style={{ fontSize: 7, color: isPositive ? P.red : P.teal, fontWeight: 700 }}>
                      {isPositive ? "↑ Increases risk" : "↓ Mitigates"}
                    </span>
                  </div>
                  <div style={{ background: P.bg, borderRadius: 3, height: 8, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${absImp * 100}%`,
                        height: "100%",
                        background: isPositive ? P.red : P.teal,
                        transition: "width 1s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === "validation" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {/* Confusion matrix */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 10 }}>Confusion Matrix</div>
            <ConfusionMatrix modelKey={selectedModel} />
            <div style={{ marginTop: 10, fontSize: 7, color: P.t4, lineHeight: 1.6 }}>
              <strong>TP/TN (diagonal):</strong> Correct predictions | <strong>FP/FN (off-diagonal):</strong> Errors
            </div>
          </div>

          {/* Validation summary */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 10 }}>Cross-Validation</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                ["K-Fold (5)", "4.87 ± 0.23", P.blue],
                ["Stratified", "Yes", P.teal],
                ["Class Balance", "Yes", P.gold],
                ["Hyperparameter Tuning", "GridSearchCV", P.violet],
                ["Regularization", "L2 (λ=0.001)", P.amber],
              ].map(([k, v, c]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: 6, background: P.bg, borderRadius: 6 }}>
                  <span style={{ fontSize: 8, color: P.t4 }}>{k}</span>
                  <span style={{ fontSize: 8, fontWeight: 700, color: c }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}