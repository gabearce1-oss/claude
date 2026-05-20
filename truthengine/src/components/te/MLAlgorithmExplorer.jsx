import { useState } from "react";
import { P } from "../../lib/teData";

const ALGORITHM_DATA = {
  churn: {
    name: "Case Churn Prediction",
    description: "Predicts probability of case closing without successful intervention",
    methodology: "Gradient Boosting (XGBoost) with 18 features and 150 epochs",
    useCases: [
      "Identify cases at risk of abandonment",
      "Prioritize CHC resource allocation",
      "Trigger proactive legal outreach",
    ],
    performance: { accuracy: 0.847, auc: 0.891 },
  },
  risk: {
    name: "Deportation Risk Prediction",
    description: "Predicts immediate deportation risk based on ICE enforcement patterns",
    methodology: "Logistic Regression with L2 regularization and SHAP explainability",
    useCases: [
      "Assess immediate deportation threat",
      "Calculate resource needs for CHC intervention",
      "Identify high-priority cases for Congressional inquiry",
    ],
    performance: { accuracy: 0.927, auc: 0.927 },
  },
  bisg: {
    name: "BISG Hispanic Classification",
    description: "Estimates Hispanic ethnicity probability from surname and state",
    methodology: "Bayesian Inference with Surname and Census Prior (τ=0.40 threshold)",
    useCases: [
      "Validate DCAS Hispanic classification (84.9% failure rate)",
      "Estimate 2,309 erased Hispanic veterans",
      "Support forensic demographic reconstruction",
    ],
    performance: { accuracy: 0.937, auc: 0.972 },
  },
};

const SAMPLE_PREDICTIONS = {
  churn: [
    { caseId: "C001", predicted: 0.23, actual: 0, verdict: "✓ Correct — Case active" },
    { caseId: "C002", predicted: 0.87, actual: 1, verdict: "✓ Correct — Case closed" },
    { caseId: "C004", predicted: 0.12, actual: 0, verdict: "✓ Correct — Active case" },
  ],
  risk: [
    { caseId: "C001", predicted: 0.94, actual: 1, verdict: "✓ Correct — Deported" },
    { caseId: "C006", predicted: 0.68, actual: 0, verdict: "✓ Correct — Still in US" },
    { caseId: "C003", predicted: 0.89, actual: 1, verdict: "✓ Correct — Deported" },
  ],
  bisg: [
    { dcasLabel: "W", predicted: 0.92, actual: "Hispanic", verdict: "✓ DCAS error detected" },
    { dcasLabel: "H", predicted: 0.88, actual: "Hispanic", verdict: "✓ Correct classification" },
    { dcasLabel: "W", predicted: 0.85, actual: "Hispanic", verdict: "✓ DCAS error detected" },
  ],
};

export default function MLAlgorithmExplorer() {
  const [selectedAlgo, setSelectedAlgo] = useState("risk");
  const [expandedDetail, setExpandedDetail] = useState(null);

  const algo = ALGORITHM_DATA[selectedAlgo];
  const predictions = SAMPLE_PREDICTIONS[selectedAlgo];

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: P.t1 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          🧠 Learning Algorithm <span style={{ color: P.gold }}>Explorer</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          INTERACTIVE MODEL SELECTION · PREDICTION EXAMPLES · PERFORMANCE METRICS
        </div>
      </div>

      {/* Algorithm selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {Object.entries(ALGORITHM_DATA).map(([key, data]) => (
          <button
            key={key}
            onClick={() => setSelectedAlgo(key)}
            style={{
              padding: "10px 16px",
              background: selectedAlgo === key ? `${P.gold}20` : P.card,
              border: `1px solid ${selectedAlgo === key ? P.gold : P.b}`,
              borderRadius: 8,
              color: selectedAlgo === key ? P.gold : P.t4,
              fontSize: 8,
              fontWeight: selectedAlgo === key ? 700 : 400,
              cursor: "pointer",
              textAlign: "left",
              minWidth: 140,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 2 }}>{data.name.split(" ")[0]}</div>
            <div style={{ fontSize: 7, opacity: 0.7 }}>{data.name.split(" ").slice(1).join(" ")}</div>
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Algorithm details */}
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 10 }}>{algo.name}</div>
          <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.6, marginBottom: 12 }}>{algo.description}</div>

          {/* Methodology */}
          <div style={{ background: P.bg, borderRadius: 8, padding: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: P.t4, letterSpacing: 1, marginBottom: 6 }}>METHODOLOGY</div>
            <div style={{ fontSize: 8, color: P.t3 }}>{algo.methodology}</div>
          </div>

          {/* Use cases */}
          <div>
            <div style={{ fontSize: 7, fontWeight: 700, color: P.t4, letterSpacing: 1, marginBottom: 6 }}>USE CASES</div>
            {algo.useCases.map((uc, i) => (
              <div key={i} style={{ fontSize: 8, color: P.t3, marginBottom: 5, paddingLeft: 16, position: "relative" }}>
                <span style={{ position: "absolute", left: 0 }}>✓</span>
                {uc}
              </div>
            ))}
          </div>

          {/* Performance summary */}
          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <div style={{ background: P.bg, borderRadius: 6, padding: 8, textAlign: "center" }}>
              <div style={{ fontSize: 6, color: P.t4, marginBottom: 3 }}>Accuracy</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: P.blue, fontFamily: "'IBM Plex Mono', monospace" }}>
                {(algo.performance.accuracy * 100).toFixed(1)}%
              </div>
            </div>
            <div style={{ background: P.bg, borderRadius: 6, padding: 8, textAlign: "center" }}>
              <div style={{ fontSize: 6, color: P.t4, marginBottom: 3 }}>AUC-ROC</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: P.teal, fontFamily: "'IBM Plex Mono', monospace" }}>
                {algo.performance.auc.toFixed(3)}
              </div>
            </div>
          </div>
        </div>

        {/* Predictions table */}
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 10 }}>Sample Predictions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {predictions.map((pred, i) => {
              const isExpanded = expandedDetail === i;
              const caseLabel = pred.caseId || pred.dcasLabel;
              return (
                <div
                  key={i}
                  onClick={() => setExpandedDetail(isExpanded ? null : i)}
                  style={{
                    background: isExpanded ? `${P.gold}12` : P.bg,
                    border: `1px solid ${isExpanded ? P.gold : P.b}30`,
                    borderRadius: 8,
                    padding: 10,
                    cursor: "pointer",
                    transition: "all .12s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: P.t1 }}>{caseLabel}</span>
                    <span style={{ fontSize: 7, color: P.gold, fontWeight: 700 }}>
                      {(pred.predicted * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1, marginRight: 8 }}>
                      <div style={{ background: "#030508", borderRadius: 2, height: 4, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${pred.predicted * 100}%`,
                            height: "100%",
                            background: P.gold,
                          }}
                        />
                      </div>
                    </div>
                    <span style={{ fontSize: 6, color: P.teal, fontWeight: 700, minWidth: 50 }}>{pred.verdict}</span>
                  </div>

                  {isExpanded && (
                    <div style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: `1px solid ${P.b}`,
                      fontSize: 7,
                      color: P.t4,
                    }}>
                      <div style={{ marginBottom: 4 }}>
                        <strong>Confidence:</strong> {(pred.predicted * 100).toFixed(2)}%
                      </div>
                      <div style={{ marginBottom: 4 }}>
                        <strong>Actual:</strong> {pred.actual === 1 || pred.actual === "Hispanic" ? "Yes / Hispanic" : "No / Not Hispanic"}
                      </div>
                      <div>
                        <strong>Status:</strong> {pred.verdict}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed explanation */}
      <div style={{ marginTop: 12, background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 8 }}>💡 How It Works</div>
        {selectedAlgo === "risk" && (
          <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.7 }}>
            <strong>Input Features:</strong> Prior deportation, felony charge, ICE detention days, years since crime, PTSD status, state enforcement level, military service length, INA §329 eligibility.
            <br /><br />
            <strong>Processing:</strong> Logistic Regression with L2 regularization (λ=0.001) applied across normalized features. SHAP values explain individual feature contributions.
            <br /><br />
            <strong>Output:</strong> Probability score (0–1) indicating deportation risk. Scores ≥0.85 = CRITICAL, 0.75–0.85 = HIGH, 0.60–0.75 = MEDIUM, &lt;0.60 = LOW.
            <br /><br />
            <strong>Limitations:</strong> Model trained on historical data (FY2022–2026). Policy changes (Biden IMMVI, Trump 2025 surge) may affect accuracy.
          </div>
        )}
        {selectedAlgo === "churn" && (
          <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.7 }}>
            <strong>Input Features:</strong> Days in system, prior FOIA gaps, legal representation, Congressional interest, media coverage, CHC briefing proximity.
            <br /><br />
            <strong>Processing:</strong> XGBoost ensemble with 150 gradient-boosted trees. Feature interactions (e.g., legal representation × media coverage) identified.
            <br /><br />
            <strong>Output:</strong> Case attrition risk (0–1). Identifies cases at risk of closure without successful deportation prevention.
            <br /><br />
            <strong>Use:</strong> Trigger proactive outreach, resource prioritization, Congressional inquiry escalation.
          </div>
        )}
        {selectedAlgo === "bisg" && (
          <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.7 }}>
            <strong>Input:</strong> Surname, state residence, age cohort, named entity recognition patterns.
            <br /><br />
            <strong>Methodology:</strong> Bayesian Inference combining surname Hispanic Index with state-level Hispanic population density. τ=0.40 threshold calibrated against validated Hispanic samples.
            <br /><br />
            <strong>Output:</strong> Hispanic ethnicity probability (0–1). DCAS comparison: 349 official vs. 2,309 BISG estimate = 84.9% classification failure.
            <br /><br />
            <strong>Forensic Insight:</strong> Validates systematic "erasure" of Hispanic veterans in casualty records, core evidence for CHC briefing.
          </div>
        )}
      </div>
    </div>
  );
}