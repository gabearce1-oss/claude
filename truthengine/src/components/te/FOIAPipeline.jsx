import { useState } from "react";
import { P } from "../../lib/teData";

export default function FOIAPipeline() {
  const [pipelineStatus, setPipelineStatus] = useState("idle");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractionResults, setExtractionResults] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setPipelineStatus("uploaded");
  };

  const processDocument = async () => {
    if (!uploadedFile) return;

    setProcessing(true);
    setPipelineStatus("processing");

    try {
      const text = await uploadedFile.text();

      // Call FOIA processor function
      const extractionResp = await fetch("http://localhost:8000/api/foia/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_text: text,
          source_agency: uploadedFile.name,
          foia_request_id: "temp-" + Date.now(),
        }),
      });

      const extraction = await extractionResp.json();
      setExtractionResults(extraction);

      if (extraction.processed_veterans.length > 0) {
        // Validate extracted cases
        setPipelineStatus("validating");

        const validationResp = await fetch(
          "http://localhost:8000/api/convergence/validate",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              veteran_case_id: "temp-" + Date.now(),
              extracted_data: extraction.processed_veterans[0],
              source_agency: uploadedFile.name,
            }),
          }
        );

        const validation = await validationResp.json();
        setValidationResults(validation);
        setPipelineStatus("complete");
      }
    } catch (error) {
      console.error("Pipeline error:", error);
      setPipelineStatus("error");
    }

    setProcessing(false);
  };

  const dcasVectors = extractionResults?.dcas_vectors || {};

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: P.t1, minHeight: "100vh", background: P.bg, padding: "20px" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(90deg,${P.card},#0D1525)`, border: `2px solid ${P.gold}40`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 9, color: P.gold, letterSpacing: 2, fontWeight: 800, marginBottom: 4 }}>
          📄 FOIA PIPELINE
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: P.t1, marginBottom: 8 }}>
          Automated Document Processing
        </div>
        <div style={{ fontSize: 8, color: P.t4 }}>
          Extract entities → Measure 5 DCAS vectors → Validate convergence → Map to cases
        </div>
      </div>

      {/* Pipeline Steps */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { step: 1, label: "Upload", icon: "📤", status: uploadedFile ? "complete" : "pending" },
          { step: 2, label: "Extract Entities", icon: "🔍", status: extractionResults ? "complete" : processing ? "processing" : "pending" },
          { step: 3, label: "DCAS Vectors", icon: "📊", status: dcasVectors.classification_dissolution ? "complete" : "pending" },
          { step: 4, label: "Validate", icon: "✓", status: validationResults ? "complete" : "pending" },
        ].map((item) => (
          <div
            key={item.step}
            style={{
              background: P.card,
              border: `2px solid ${
                item.status === "complete"
                  ? P.gold
                  : item.status === "processing"
                  ? P.blue
                  : P.b
              }`,
              borderRadius: 10,
              padding: "12px 14px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
            <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 4 }}>
              {item.label}
            </div>
            <div
              style={{
                fontSize: 7,
                color: item.status === "complete" ? P.gold : item.status === "processing" ? P.blue : P.t4,
                fontWeight: 700,
              }}
            >
              {item.status === "complete" ? "✓ Done" : item.status === "processing" ? "⏳ Running" : "○ Waiting"}
            </div>
          </div>
        ))}
      </div>

      {/* File Upload */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.blue, marginBottom: 12 }}>📤 Upload FOIA Document</div>
        <input
          type="file"
          onChange={handleFileUpload}
          accept=".txt,.pdf,.doc"
          style={{
            padding: "8px 12px",
            background: "#080D18",
            border: `1px solid ${P.b}`,
            borderRadius: 8,
            color: P.t1,
            width: "100%",
            marginBottom: 12,
          }}
        />
        {uploadedFile && (
          <div style={{ fontSize: 8, color: P.t3, marginBottom: 12 }}>
            File: {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)}KB)
          </div>
        )}
        <button
          onClick={processDocument}
          disabled={!uploadedFile || processing}
          style={{
            padding: "10px 16px",
            background: uploadedFile ? `${P.gold}18` : P.b,
            border: `1px solid ${uploadedFile ? P.gold : P.b}`,
            color: uploadedFile ? P.gold : P.t4,
            borderRadius: 8,
            fontSize: 8,
            fontWeight: 800,
            cursor: uploadedFile ? "pointer" : "default",
            fontFamily: "inherit",
          }}
        >
          {processing ? "Processing..." : "Process Document"}
        </button>
      </div>

      {/* Extraction Results */}
      {extractionResults && (
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: P.teal, marginBottom: 12 }}>
            🔍 Extracted Entities
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 12 }}>
            <div style={{ background: "#080D18", padding: "8px 10px", borderRadius: 6, borderLeft: `3px solid ${P.gold}` }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: P.gold }}>
                {extractionResults.extraction_summary.veterans_found}
              </div>
              <div style={{ fontSize: 7, color: P.t4 }}>Veterans Found</div>
            </div>
            <div style={{ background: "#080D18", padding: "8px 10px", borderRadius: 6, borderLeft: `3px solid ${P.teal}` }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: P.teal }}>
                {extractionResults.extraction_summary.veterans_processed}
              </div>
              <div style={{ fontSize: 7, color: P.t4 }}>Processed</div>
            </div>
          </div>

          {/* Erasure Patterns */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: P.amber, marginBottom: 6 }}>⚠️ Erasure Patterns Detected</div>
            <div style={{ fontSize: 7, color: P.t3, lineHeight: 1.6 }}>
              {extractionResults.erasure_patterns.redactions_found && (
                <div>✓ Redactions found: {extractionResults.erasure_patterns.redactions_detail}</div>
              )}
              {extractionResults.erasure_patterns.deletions_found && (
                <div>✓ Deletions found: {extractionResults.erasure_patterns.deletions_detail}</div>
              )}
              {extractionResults.erasure_patterns.contradictions_found && (
                <div>✓ Contradictions found: {extractionResults.erasure_patterns.contradictions_detail}</div>
              )}
              Overall Risk: <strong>{extractionResults.erasure_patterns.overall_erasure_risk}</strong>
            </div>
          </div>
        </div>
      )}

      {/* DCAS Vector Analysis */}
      {dcasVectors.classification_dissolution && (
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: P.violet, marginBottom: 12 }}>
            📊 5-Vector DCAS Analysis
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
            {[
              { key: "classification_dissolution", label: "Classification Dissolution" },
              { key: "estimation_vacuum", label: "Estimation Vacuum" },
              { key: "archival_destruction", label: "Archival Destruction" },
              { key: "recognition_latency", label: "Recognition Latency" },
              { key: "compounding_invisibility", label: "Compounding Invisibility" },
            ].map((vector) => {
              const data = dcasVectors[vector.key];
              if (!data) return null;
              const color = data.severity === "high" ? P.red : data.severity === "medium" ? P.amber : P.teal;
              return (
                <div key={vector.key} style={{ background: "#080D18", padding: "10px 12px", borderRadius: 8, borderLeft: `3px solid ${color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 8, fontWeight: 800, color: P.t1 }}>{vector.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color }}>{data.score}</span>
                  </div>
                  <div style={{ height: 3, background: "#1E3A5F", borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
                    <div style={{ height: "100%", background: color, width: `${data.score}%` }} />
                  </div>
                  <div style={{ fontSize: 6, color: P.t4 }}>{data.evidence}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Validation Results */}
      {validationResults && (
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: P.green, marginBottom: 12 }}>
            ✓ Convergence Validation
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            <div style={{ background: "#080D18", padding: "8px 10px", borderRadius: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: P.gold }}>
                {validationResults.convergence_validation.agreement_percentage.toFixed(1)}%
              </div>
              <div style={{ fontSize: 7, color: P.t4 }}>Source Agreement</div>
            </div>
            <div style={{ background: "#080D18", padding: "8px 10px", borderRadius: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: P.teal }}>
                {validationResults.convergence_validation.validation_result}
              </div>
              <div style={{ fontSize: 7, color: P.t4 }}>Validation Result</div>
            </div>
            <div style={{ background: "#080D18", padding: "8px 10px", borderRadius: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: P.blue }}>
                {validationResults.ai_assessment.confidence_score}%
              </div>
              <div style={{ fontSize: 7, color: P.t4 }}>AI Confidence</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}