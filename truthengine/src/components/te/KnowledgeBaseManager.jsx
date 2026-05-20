import { useState } from "react";
import { P } from "../../lib/teData";

const KNOWLEDGE_ITEMS = [
  { id: "KB001", title: "DCAS Forensic Audit", size: "2.4MB", uploaded: "2026-04-05", status: "INDEXED", analyzed: true },
  { id: "KB002", title: "GAO-19-416 Report", size: "1.8MB", uploaded: "2026-04-03", status: "INDEXED", analyzed: true },
  { id: "KB003", title: "INA §329 Analysis", size: "3.2MB", uploaded: "2026-04-01", status: "INDEXED", analyzed: false },
];

export default function KnowledgeBaseManager() {
  const [view, setView] = useState("browse");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedKB, setSelectedKB] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    // Simulate upload
    await new Promise(r => setTimeout(r, 1500));
    setUploading(false);
  };

  const handleAnalyze = async (item) => {
    setAnalyzing(true);
    setSelectedKB(item);
    // Simulate AI analysis
    await new Promise(r => setTimeout(r, 2000));
    setAnalyzing(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          📚 Knowledge Base <span style={{ color: P.gold }}>Manager</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          DOCUMENT STORAGE · FULL-TEXT INDEXING · AI ANALYSIS · CITATION TRACKING
        </div>
      </div>

      {/* View tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "8px 10px", width: "fit-content" }}>
        {[["browse", "📖 Browse"], ["upload", "📤 Upload"], ["analyze", "🤖 Analyze"]].map(([v, l]) => (
          <button key={v} onClick={() => setView(v)}
            style={{ padding: "6px 12px", fontSize: 8, fontWeight: view === v ? 700 : 400,
              background: view === v ? `${P.gold}20` : "transparent",
              border: `1px solid ${view === v ? P.gold : P.b}`,
              color: view === v ? P.gold : P.t4, borderRadius: 6, cursor: "pointer" }}>
            {l}
          </button>
        ))}
      </div>

      {view === "browse" && (
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 10 }}>
            Knowledge Base Items ({KNOWLEDGE_ITEMS.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {KNOWLEDGE_ITEMS.map((item, i) => (
              <div key={i} style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: P.t1 }}>{item.title}</div>
                    <div style={{ fontSize: 7, color: P.t4, marginTop: 3 }}>
                      {item.size} · Uploaded {item.uploaded}
                    </div>
                  </div>
                  <span style={{ fontSize: 7, background: `${P.teal}15`, border: `1px solid ${P.teal}25`, color: P.teal, borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>
                    {item.status}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => { setView("analyze"); setSelectedKB(item); }}
                    style={{ flex: 1, padding: "6px", fontSize: 7, fontWeight: 700, cursor: "pointer",
                      background: item.analyzed ? `${P.teal}15` : `${P.blue}15`,
                      border: `1px solid ${item.analyzed ? P.teal : P.blue}30`,
                      color: item.analyzed ? P.teal : P.blue, borderRadius: 6 }}>
                    {item.analyzed ? "✓ Analyzed" : "🤖 Analyze"}
                  </button>
                  <button style={{ flex: 1, padding: "6px", fontSize: 7, fontWeight: 700, cursor: "pointer",
                    background: `${P.amber}15`, border: `1px solid ${P.amber}30`,
                    color: P.amber, borderRadius: 6 }}>
                    📥 Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "upload" && (
        <div style={{ background: P.card, border: `2px dashed ${P.gold}30`, borderRadius: 10, padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📄</div>
          <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 4 }}>Upload Document</div>
          <div style={{ fontSize: 8, color: P.t4, marginBottom: 12 }}>Drag & drop or click to select a PDF or document</div>
          <input type="file" onChange={handleUpload} disabled={uploading}
            style={{ padding: "10px", background: P.bg, border: `1px solid ${P.b}`, borderRadius: 8, width: "100%", cursor: uploading ? "not-allowed" : "pointer" }}/>
          {uploading && (
            <div style={{ marginTop: 12, fontSize: 8, color: P.gold, fontWeight: 700 }}>⟳ Uploading and indexing...</div>
          )}
        </div>
      )}

      {view === "analyze" && selectedKB && (
        <div>
          <button onClick={() => setSelectedKB(null)} style={{ padding: "4px 10px", fontSize: 7, background: P.bg, border: `1px solid ${P.b}`, color: P.t4, borderRadius: 6, cursor: "pointer", marginBottom: 10 }}>
            ← Back
          </button>
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 12 }}>
              Analysis: {selectedKB.title}
            </div>
            {!analyzing ? (
              <div style={{ background: P.bg, borderRadius: 8, padding: 12, marginBottom: 10 }}>
                <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.8, marginBottom: 10 }}>
                  <strong>Document Summary:</strong> This forensic audit examines {selectedKB.title.toLowerCase()} using quantitative methodologies validated against multiple data sources. Key findings substantiate institutional policy gaps and recommend Congressional action items.
                </div>
                <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.8 }}>
                  <strong>Key Themes:</strong> Institutional erasure, data gaps, policy failure, legislative accountability, veteran protection mechanisms
                </div>
              </div>
            ) : (
              <div style={{ padding: 12, textAlign: "center", fontSize: 8, color: P.gold, fontWeight: 700 }}>⟳ Analyzing document with AI...</div>
            )}
            <button onClick={() => handleAnalyze(selectedKB)} disabled={analyzing}
              style={{ width: "100%", padding: "8px", fontSize: 8, fontWeight: 700, cursor: analyzing ? "not-allowed" : "pointer",
                background: `${P.gold}20`, border: `1px solid ${P.gold}`, color: P.gold, borderRadius: 6 }}>
              {analyzing ? "⟳ Analyzing..." : "🤖 Run Full Analysis"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}