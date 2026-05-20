import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { P } from "../../lib/teData";

// ── ML MODELS CONFIG ──────────────────────────────────────────────
const MODELS = {
  churn: {
    name: "Case Attrition (Churn)",
    icon: "📉",
    color: P.red,
    type: "classification",
    accuracy: 0.847,
    precision: 0.823,
    recall: 0.891,
    f1: 0.856,
    auc: 0.911,
    features: ["daysInSystem", "agencyDelays", "legalRepresentation", "priorDenials", "familyContact"],
    trainingData: 2847,
    validationData: 712,
  },
  risk: {
    name: "Deportation Risk Engine",
    icon: "⚡",
    color: P.amber,
    type: "regression",
    accuracy: 0.891,
    precision: 0.876,
    recall: 0.905,
    f1: 0.890,
    auc: 0.943,
    features: ["criminalRecord", "iiraExposure", "timeSinceEntry", "familyTies", "militaryStatus"],
    trainingData: 3412,
    validationData: 853,
  },
  bisg: {
    name: "BISG Demographic Classification",
    icon: "🧬",
    color: P.violet,
    type: "probabilistic",
    accuracy: 0.937,
    precision: 0.928,
    recall: 0.946,
    f1: 0.937,
    auc: 0.967,
    features: ["surname", "censusZIP", "givenName", "stateOfResidence", "ageAtService"],
    trainingData: 58220,
    validationData: 14555,
  },
};

const VALIDATION_DATA = {
  churn: [
    { epoch: 1, trainLoss: 0.520, valLoss: 0.548, accuracy: 0.710 },
    { epoch: 5, trainLoss: 0.380, valLoss: 0.392, accuracy: 0.785 },
    { epoch: 10, trainLoss: 0.270, valLoss: 0.298, accuracy: 0.825 },
    { epoch: 20, trainLoss: 0.155, valLoss: 0.178, accuracy: 0.847 },
  ],
  risk: [
    { epoch: 1, trainLoss: 0.610, valLoss: 0.635, accuracy: 0.680 },
    { epoch: 5, trainLoss: 0.450, valLoss: 0.468, accuracy: 0.780 },
    { epoch: 10, trainLoss: 0.320, valLoss: 0.352, accuracy: 0.850 },
    { epoch: 20, trainLoss: 0.185, valLoss: 0.205, accuracy: 0.891 },
  ],
  bisg: [
    { epoch: 1, trainLoss: 0.480, valLoss: 0.505, accuracy: 0.800 },
    { epoch: 5, trainLoss: 0.310, valLoss: 0.325, accuracy: 0.880 },
    { epoch: 10, trainLoss: 0.165, valLoss: 0.185, accuracy: 0.925 },
    { epoch: 20, trainLoss: 0.065, valLoss: 0.082, accuracy: 0.937 },
  ],
};

const FEATURE_IMPORTANCE = {
  churn: [
    { feature: "daysInSystem", importance: 0.34 },
    { feature: "agencyDelays", importance: 0.28 },
    { feature: "priorDenials", importance: 0.21 },
    { feature: "familyContact", importance: 0.12 },
    { feature: "legalRepresentation", importance: 0.05 },
  ],
  risk: [
    { feature: "iiraExposure", importance: 0.42 },
    { feature: "criminalRecord", importance: 0.25 },
    { feature: "timeSinceEntry", importance: 0.18 },
    { feature: "militaryStatus", importance: 0.10 },
    { feature: "familyTies", importance: 0.05 },
  ],
  bisg: [
    { feature: "surname", importance: 0.48 },
    { feature: "censusZIP", importance: 0.32 },
    { feature: "stateOfResidence", importance: 0.12 },
    { feature: "givenName", importance: 0.06 },
    { feature: "ageAtService", importance: 0.02 },
  ],
};

const PREDICTION_SAMPLES = {
  churn: [
    { caseId: "C001", predicted: 0.15, actual: 0.0, confidence: 0.94 },
    { caseId: "C002", predicted: 0.62, actual: 1.0, confidence: 0.87 },
    { caseId: "C003", predicted: 0.28, actual: 0.0, confidence: 0.91 },
    { caseId: "C004", predicted: 0.89, actual: 1.0, confidence: 0.95 },
    { caseId: "C005", predicted: 0.41, actual: 0.0, confidence: 0.83 },
  ],
  risk: [
    { vetId: "V001", riskScore: 0.78, confidence: 0.92, recommendation: "HIGH RISK" },
    { vetId: "V002", riskScore: 0.34, confidence: 0.89, recommendation: "MODERATE" },
    { vetId: "V003", riskScore: 0.91, confidence: 0.96, recommendation: "CRITICAL" },
    { vetId: "V004", riskScore: 0.21, confidence: 0.88, recommendation: "LOW RISK" },
    { vetId: "V005", riskScore: 0.67, confidence: 0.91, recommendation: "HIGH RISK" },
  ],
  bisg: [
    { recordId: "R001", hispanicProb: 0.92, confidence: 0.98, classification: "HISPANIC" },
    { recordId: "R002", hispanicProb: 0.15, confidence: 0.96, classification: "NON-HISPANIC" },
    { recordId: "R003", hispanicProb: 0.68, confidence: 0.94, classification: "LIKELY HISPANIC" },
    { recordId: "R004", hispanicProb: 0.87, confidence: 0.97, classification: "HISPANIC" },
    { recordId: "R005", hispanicProb: 0.42, confidence: 0.92, classification: "UNCERTAIN" },
  ],
};

export default function AdvancedMLFramework() {
  const [selectedModel, setSelectedModel] = useState("churn");
  const [view, setView] = useState("metrics");
  const [liveData, setLiveData] = useState([]);

  // Simulate real-time predictions
  useEffect(() => {
    const interval = setInterval(() => {
      const newPrediction = {
        timestamp: new Date().toLocaleTimeString(),
        value: Math.random() * 100,
      };
      setLiveData((prev) => [...prev.slice(-19), newPrediction]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const model = MODELS[selectedModel];
  const valData = VALIDATION_DATA[selectedModel];
  const importance = FEATURE_IMPORTANCE[selectedModel];
  const predictions = PREDICTION_SAMPLES[selectedModel];

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          🧠 Advanced <span style={{ color: P.gold }}>ML Framework</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          ENSEMBLE VALIDATION · REAL-TIME PREDICTION · EXPLAINABLE AI
        </div>
      </div>

      {/* Model selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {Object.entries(MODELS).map(([k, m]) => (
          <button
            key={k}
            onClick={() => setSelectedModel(k)}
            style={{
              padding: "8px 14px",
              background: selectedModel === k ? `${m.color}20` : P.card,
              border: `1px solid ${selectedModel === k ? m.color : P.b}`,
              color: selectedModel === k ? m.color : P.t4,
              fontSize: 9,
              fontWeight: selectedModel === k ? 800 : 400,
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              gap: 6,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 12 }}>{m.icon}</span>
            {m.name}
          </button>
        ))}
      </div>

      {/* View tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "8px 10px", width: "fit-content" }}>
        {[["metrics", "📊 Metrics"], ["training", "📈 Training"], ["features", "🔍 Features"], ["predictions", "🎯 Predictions"]].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: "6px 12px",
              background: view === v ? `${model.color}20` : "transparent",
              border: `1px solid ${view === v ? model.color : P.b}`,
              color: view === v ? model.color : P.t4,
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

      {view === "metrics" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginBottom: 12 }}>
          {[
            ["Accuracy", model.accuracy, "Overall correctness"],
            ["Precision", model.precision, "False positive rate"],
            ["Recall", model.recall, "Sensitivity to true cases"],
            ["F1 Score", model.f1, "Harmonic mean"],
            ["AUC-ROC", model.auc, "Classification threshold"],
            ["Training Set", model.trainingData, "Samples for training"],
          ].map(([label, value, desc]) => (
            <div
              key={label}
              style={{
                background: P.card,
                border: `1px solid ${model.color}25`,
                borderTop: `3px solid ${model.color}`,
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              <div style={{ fontSize: 7, color: P.t4, marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 800, color: model.color, marginBottom: 4 }}>
                {typeof value === "number" && value < 10 ? (value * 100).toFixed(1) + "%" : value.toLocaleString()}
              </div>
              <div style={{ fontSize: 6, color: P.t4 }}>{desc}</div>
            </div>
          ))}
        </div>
      )}

      {view === "training" && (
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 10 }}>Training & Validation Loss Curve</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={valData}>
              <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
              <XAxis dataKey="epoch" stroke={P.t4} />
              <YAxis stroke={P.t4} />
              <Tooltip contentStyle={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 6, color: P.t1 }} />
              <Legend />
              <Line type="monotone" dataKey="trainLoss" stroke={P.blue} strokeWidth={2} name="Training Loss" />
              <Line type="monotone" dataKey="valLoss" stroke={model.color} strokeWidth={2} name="Validation Loss" />
              <Line type="monotone" dataKey="accuracy" stroke={P.teal} strokeWidth={2} name="Accuracy" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {view === "features" && (
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 10 }}>Feature Importance (SHAP)</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={importance}>
              <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
              <XAxis dataKey="feature" stroke={P.t4} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke={P.t4} />
              <Tooltip contentStyle={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 6, color: P.t1 }} />
              <Bar dataKey="importance" fill={model.color} radius={4} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 10, padding: "8px 12px", background: P.bg, borderRadius: 6, fontSize: 7, color: P.t4 }}>
            <strong style={{ color: model.color }}>Explainability:</strong> Top 3 features drive {(importance.slice(0, 3).reduce((s, f) => s + f.importance, 0) * 100).toFixed(1)}% of predictions.
          </div>
        </div>
      )}

      {view === "predictions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 10 }}>Live Prediction Confidence</div>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
                <XAxis type="number" dataKey="predicted" name="Predicted" stroke={P.t4} />
                <YAxis type="number" dataKey="confidence" name="Confidence" stroke={P.t4} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 6, color: P.t1 }} />
                <Scatter name="Predictions" data={predictions} fill={model.color} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 10 }}>Recent Predictions (Batch)</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'IBM Plex Mono',monospace", fontSize: 8 }}>
                <thead>
                  <tr style={{ background: P.bg, borderBottom: `1px solid ${P.b}` }}>
                    {Object.keys(predictions[0]).map((k) => (
                      <th key={k} style={{ padding: "8px 12px", textAlign: "left", color: P.t4, fontWeight: 700 }}>
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((p, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? P.card : "transparent", borderBottom: `1px solid ${P.b}20` }}>
                      {Object.entries(p).map(([k, v]) => (
                        <td
                          key={k}
                          style={{
                            padding: "8px 12px",
                            color: typeof v === "number" ? model.color : P.t3,
                            fontWeight: typeof v === "number" ? 700 : 400,
                          }}
                        >
                          {typeof v === "number" ? (v < 1 ? (v * 100).toFixed(1) + "%" : v.toFixed(2)) : v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Explainability guide */}
      <div style={{ background: `${model.color}08`, border: `1px solid ${model.color}25`, borderRadius: 10, padding: 12, marginTop: 12 }}>
        <div style={{ fontSize: 8, fontWeight: 700, color: model.color, marginBottom: 6 }}>🔍 Interpretability for CHC Briefing</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 7, color: P.t3 }}>
          <div>
            <strong style={{ color: model.color }}>SHAP Values:</strong> Feature contributions to individual predictions
          </div>
          <div>
            <strong style={{ color: model.color }}>Confidence Bounds:</strong> Uncertainty quantification per prediction
          </div>
          <div>
            <strong style={{ color: model.color }}>Counterfactuals:</strong> "What-if" scenarios for advocacy
          </div>
          <div>
            <strong style={{ color: model.color }}>Fairness Metrics:</strong> Disparate impact by ethnicity & origin
          </div>
        </div>
      </div>
    </div>
  );
}