import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { P } from "../../lib/teData";

export default function EvidencePipelineUploader({ caseId, onExtractComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleUploadAndExtract = async () => {
    if (!file || !caseId) {
      setError("Please select a file and case ID");
      return;
    }

    try {
      setUploading(true);

      // Upload file
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = uploadRes.file_url;

      setUploading(false);
      setExtracting(true);

      // Extract data and map to case
      const extractRes = await base44.functions.invoke("evidenceExtractorPipeline", {
        file_url: fileUrl,
        case_id: caseId,
      });

      setResult(extractRes.data);
      setError(null);

      if (onExtractComplete) {
        onExtractComplete(extractRes.data);
      }
    } catch (err) {
      setError(err.message || "Extraction failed");
      setResult(null);
    } finally {
      setUploading(false);
      setExtracting(false);
      setFile(null);
    }
  };

  return (
    <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 10 }}>
        📄 Evidence PDF <span style={{ color: P.gold }}>Pipeline</span>
      </div>
      <div style={{ fontSize: 7, color: P.t4, letterSpacing: 1, marginBottom: 12 }}>
        UPLOAD • EXTRACT • MAP TO CASE & TIMELINE
      </div>

      {/* Upload area */}
      <div
        style={{
          background: P.bg,
          border: `2px dashed ${file ? P.gold : P.b}`,
          borderRadius: 10,
          padding: 20,
          textAlign: "center",
          marginBottom: 12,
          cursor: "pointer",
          transition: "all .2s",
        }}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="pdf-input"
        />
        <label htmlFor="pdf-input" style={{ cursor: "pointer", display: "block" }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>📥</div>
          <div style={{ fontSize: 8, color: P.t3, fontWeight: 700 }}>
            {file ? file.name : "Drop PDF or click to upload"}
          </div>
          <div style={{ fontSize: 7, color: P.t4, marginTop: 4 }}>
            Extracts: dates, names, agencies, document type
          </div>
        </label>
      </div>

      {/* Extract button */}
      <button
        onClick={handleUploadAndExtract}
        disabled={!file || uploading || extracting}
        style={{
          width: "100%",
          padding: "10px",
          background: uploading || extracting ? `${P.gold}30` : `${P.gold}20`,
          border: `2px solid ${P.gold}`,
          color: P.gold,
          fontSize: 9,
          fontWeight: 800,
          borderRadius: 8,
          cursor: uploading || extracting ? "not-allowed" : "pointer",
          marginBottom: 12,
          opacity: uploading || extracting ? 0.6 : 1,
        }}
      >
        {uploading ? "⏳ Uploading..." : extracting ? "🔬 Extracting..." : "→ Upload & Extract"}
      </button>

      {/* Error */}
      {error && (
        <div
          style={{
            background: `${P.red}15`,
            border: `1px solid ${P.red}40`,
            color: P.red,
            padding: 10,
            borderRadius: 8,
            fontSize: 8,
            marginBottom: 10,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={{ background: `${P.teal}08`, border: `1px solid ${P.teal}25`, borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: P.teal, marginBottom: 8 }}>✓ Extraction Complete</div>

          {result.extracted.dates.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 7, color: P.t4, fontWeight: 700, marginBottom: 3 }}>📅 Dates Found</div>
              <div style={{ fontSize: 7, color: P.t3, lineHeight: 1.5 }}>
                {result.extracted.dates.join(", ")}
              </div>
            </div>
          )}

          {result.extracted.names.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 7, color: P.t4, fontWeight: 700, marginBottom: 3 }}>👤 Names Found</div>
              <div style={{ fontSize: 7, color: P.t3, lineHeight: 1.5 }}>
                {result.extracted.names.join(", ")}
              </div>
            </div>
          )}

          {result.extracted.agencies.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 7, color: P.t4, fontWeight: 700, marginBottom: 3 }}>🏛️ Agencies</div>
              <div style={{ fontSize: 7, color: P.t3, lineHeight: 1.5 }}>
                {result.extracted.agencies.join(", ")}
              </div>
            </div>
          )}

          <div style={{ borderTop: `1px solid ${P.teal}20`, paddingTop: 8, marginTop: 8 }}>
            <div style={{ fontSize: 7, color: P.teal }}>
              Document: <strong>{result.extracted.document_type}</strong> | Timeline ID: {result.timeline_entry_id}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}