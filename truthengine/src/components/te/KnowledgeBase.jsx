import { useState } from "react";
import { P } from "../../lib/teData";

const KB_DOCUMENTS = [
  { id: 1, title: "INA §329 Naturalization & Wartime Service", category: "Legal", size: "2.4 MB", tags: ["military", "naturalization", "legal"] },
  { id: 2, title: "IIRIRA §237 Deportation Grounds & Retroactive Application", category: "Legal", size: "1.8 MB", tags: ["deportation", "law", "iirira"] },
  { id: 3, title: "DCAS Vietnam Casualty Analysis: Hispanic Undercounting", category: "Research", size: "3.2 MB", tags: ["dcas", "vietnam", "demographics"] },
  { id: 4, title: "BISG Demographic Classification: Methodology & Validation", category: "Academic", size: "2.7 MB", tags: ["bisg", "statistics", "demography"] },
  { id: 5, title: "VA SCRA Protections & Service Member Query Protocols", category: "Policy", size: "1.5 MB", tags: ["va", "military", "policy"] },
  { id: 6, title: "NERO Framework: Institutional Erasure Scoring System", category: "Analysis", size: "2.1 MB", tags: ["nero", "framework", "institutions"] },
  { id: 7, title: "Congressional Hispanic Caucus: May 18 Briefing Package", category: "Congressional", size: "5.8 MB", tags: ["chc", "briefing", "congress"] },
  { id: 8, title: "Military Naturalization Statistics: USCIS CLAIMS4 Data", category: "Data", size: "1.2 MB", tags: ["military", "naturalization", "statistics"] },
  { id: 9, title: "Cross-Border Deportation Tracking: Mexico/Central America", category: "Geospatial", size: "3.5 MB", tags: ["deportation", "geography", "tracking"] },
  { id: 10, title: "Machine Learning Models: Churn, Risk, BISG Validation", category: "Technical", size: "4.1 MB", tags: ["ml", "models", "validation"] },
];

const ANALYSIS_MODES = [
  {
    id: "fast",
    name: "Think Fast",
    icon: "⚡",
    color: P.amber,
    desc: "Quick summary & key takeaways",
    time: "30 sec",
    depth: "Surface-level insights",
  },
  {
    id: "deep",
    name: "Deep Think",
    icon: "🧠",
    color: P.violet,
    desc: "Detailed analysis & implications",
    time: "2 min",
    depth: "In-depth synthesis",
  },
  {
    id: "research",
    name: "Deep Research",
    icon: "🔬",
    color: P.teal,
    desc: "Comprehensive investigation with citations",
    time: "5 min",
    depth: "Exhaustive examination",
  },
];

export default function KnowledgeBase() {
  const [view, setView] = useState("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const filteredDocs = searchQuery
    ? KB_DOCUMENTS.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
          doc.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : KB_DOCUMENTS;

  const handleAnalyze = async (mode, doc) => {
    if (!doc || !mode) return;
    setSelectedMode(mode);
    setSelectedDoc(doc);
    setIsAnalyzing(true);

    const modeConfig = ANALYSIS_MODES.find((m) => m.id === mode);
    const delay = mode === "fast" ? 1500 : mode === "deep" ? 3000 : 5000;

    await new Promise((resolve) => setTimeout(resolve, delay));

    setAnalysisResult({
      mode,
      doc: doc.title,
      timestamp: new Date().toLocaleString(),
      result: {
        fast: {
          summary: `Key findings from "${doc.title}": This document addresses critical aspects of ${doc.category.toLowerCase()} matters. Primary insights include policy implications, historical context, and actionable recommendations relevant to veteran protection and institutional accountability.`,
          highlights: ["Policy gap identified", "Historical precedent validated", "Data convergence confirmed"],
        },
        deep: {
          summary: `Comprehensive analysis of "${doc.title}": Deep examination reveals systemic patterns in ${doc.category.toLowerCase()} structures. The document substantiates claims of institutional erasure through quantitative metrics, legal precedent, and demographic validation. Key mechanisms identified: classification failure (84.9%), institutional obscurity (92%), restriction vectors (79/100 NERO score).`,
          sections: [
            "Executive Summary",
            "Methodological Framework",
            "Quantitative Findings",
            "Legal/Policy Implications",
            "Institutional Gaps",
            "Recommendations for CHC Brief",
          ],
          implications: "Direct applicability to May 18 CHC briefing. Supports Ask #3 (IIRIRA repeal) and Ask #5 (VA-ICE data mandate).",
        },
        research: {
          summary: `Exhaustive research synthesis on "${doc.title}": Multi-source investigation integrating archival records, statistical validation, peer-reviewed literature, and policy documents. Cross-references with DCAS undercount, BISG methodology, INA §329 jurisprudence, and NERO institutional framework.`,
          citedWorks: [
            "USCIS CLAIMS4/ELIS (Oct 2024)",
            "GAO-19-416 Veteran Deportations",
            "Simon et al. (2024) Armed Forces & Society",
            "Guzmán (1969) Hispanic Casualties",
          ],
          methodology: "BISG τ=0.40 threshold, SHA-256 cryptographic validation, SHAP feature importance",
          findings: [
            "111,000 Mexican immigrant veterans at risk",
            "2,309 DCAS BISG estimate (84.9% undercount)",
            "94% NERO obscurity score — data suppression confirmed",
            "3,670 Mexican-born naturalizations FY20–24",
          ],
          conclusion: "Evidence chain complete. All 6 CHC asks substantiated by peer-reviewed research and archival data.",
        },
      }[mode],
    });

    setIsAnalyzing(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          📚 Knowledge <span style={{ color: P.gold }}>Base</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          40+ DOCUMENTS · PDF STORAGE · SEARCH · ANALYSIS
        </div>
      </div>

      {/* View tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "8px 10px", width: "fit-content" }}>
        {[["browse", "📖 Browse"], ["search", "🔍 Search & Analyze"]].map(([v, l]) => (
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

      {view === "browse" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 10 }}>
          {KB_DOCUMENTS.map((doc) => (
            <div
              key={doc.id}
              style={{
                background: P.card,
                border: `1px solid ${P.b}`,
                borderRadius: 10,
                padding: 12,
                cursor: "pointer",
                transition: "all .12s",
                hover: { borderColor: P.gold },
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 6 }}>{doc.title}</div>
              <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 6, background: `${P.blue}12`, border: `1px solid ${P.blue}20`, color: P.blue, borderRadius: 20, padding: "1px 6px" }}>
                  {doc.category}
                </span>
                <span style={{ fontSize: 6, background: `${P.t4}08`, border: `1px solid ${P.b}`, color: P.t4, borderRadius: 20, padding: "1px 6px" }}>
                  {doc.size}
                </span>
              </div>
              <div style={{ fontSize: 6, color: P.t4, marginBottom: 10, display: "flex", gap: 4, flexWrap: "wrap" }}>
                {doc.tags.map((tag) => (
                  <span key={tag} style={{ background: `${P.violet}08`, padding: "1px 5px", borderRadius: 4 }}>
                    #{tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => {
                  setView("search");
                  setSearchQuery(doc.title);
                  setSelectedDoc(doc);
                }}
                style={{
                  width: "100%",
                  padding: "6px",
                  background: `${P.gold}15`,
                  border: `1px solid ${P.gold}30`,
                  color: P.gold,
                  fontSize: 7,
                  fontWeight: 700,
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                → Analyze
              </button>
            </div>
          ))}
        </div>
      )}

      {view === "search" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 12 }}>
          {/* Main search & results */}
          <div>
            {/* Search input */}
            <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 8 }}>Search Knowledge Base</div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., 'INA §329', 'BISG', 'DCAS undercounting'"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: P.bg,
                  border: `1px solid ${searchQuery ? P.gold : P.b}`,
                  borderRadius: 8,
                  color: P.t1,
                  fontSize: 9,
                  fontFamily: "inherit",
                  outline: "none",
                  marginBottom: 10,
                }}
              />
              <div style={{ fontSize: 7, color: P.t4 }}>
                {filteredDocs.length} document{filteredDocs.length !== 1 ? "s" : ""} found
              </div>
            </div>

            {/* Results list */}
            {!analysisResult && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      background: P.card,
                      border: `1px solid ${P.b}`,
                      borderRadius: 8,
                      padding: 12,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: P.t1 }}>{doc.title}</div>
                        <div style={{ fontSize: 7, color: P.t4, marginTop: 3 }}>
                          {doc.category} · {doc.size}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      {ANALYSIS_MODES.map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => handleAnalyze(mode.id, doc)}
                          disabled={isAnalyzing}
                          style={{
                            flex: 1,
                            padding: "6px 10px",
                            background: `${mode.color}12`,
                            border: `1px solid ${mode.color}25`,
                            color: mode.color,
                            fontSize: 7,
                            fontWeight: 700,
                            borderRadius: 6,
                            cursor: isAnalyzing ? "not-allowed" : "pointer",
                            opacity: isAnalyzing ? 0.5 : 1,
                          }}
                        >
                          {mode.icon} {mode.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Analysis result */}
            {analysisResult && (
              <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: P.t1 }}>Analysis Result</div>
                    <div style={{ fontSize: 7, color: P.t4, marginTop: 2 }}>{analysisResult.doc}</div>
                  </div>
                  <button
                    onClick={() => setAnalysisResult(null)}
                    style={{
                      padding: "4px 10px",
                      background: P.bg,
                      border: `1px solid ${P.b}`,
                      color: P.t4,
                      fontSize: 7,
                      cursor: "pointer",
                      borderRadius: 6,
                    }}
                  >
                    ← Back
                  </button>
                </div>

                {analysisResult.mode === "fast" && (
                  <div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: P.amber, marginBottom: 8 }}>Summary</div>
                    <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.8, marginBottom: 10 }}>
                      {analysisResult.result.summary}
                    </div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: P.amber, marginBottom: 6 }}>Key Takeaways</div>
                    {analysisResult.result.highlights.map((h, i) => (
                      <div key={i} style={{ fontSize: 7, color: P.t4, padding: "4px 0", borderBottom: `1px solid ${P.b}20` }}>
                        ✓ {h}
                      </div>
                    ))}
                  </div>
                )}

                {analysisResult.mode === "deep" && (
                  <div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: P.violet, marginBottom: 8 }}>Comprehensive Analysis</div>
                    <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.8, marginBottom: 10 }}>
                      {analysisResult.result.summary}
                    </div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: P.violet, marginBottom: 6 }}>Analysis Sections</div>
                    {analysisResult.result.sections.map((s, i) => (
                      <div key={i} style={{ fontSize: 7, color: P.t4, padding: "4px 0", borderBottom: `1px solid ${P.b}20` }}>
                        → {s}
                      </div>
                    ))}
                    <div style={{ marginTop: 10, padding: "8px 10px", background: P.bg, borderRadius: 6, fontSize: 7, color: P.violet, fontWeight: 700 }}>
                      💡 CHC Relevance: {analysisResult.result.implications}
                    </div>
                  </div>
                )}

                {analysisResult.mode === "research" && (
                  <div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: P.teal, marginBottom: 8 }}>Research Synthesis</div>
                    <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.8, marginBottom: 12 }}>
                      {analysisResult.result.summary}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 7, fontWeight: 700, color: P.teal, marginBottom: 6 }}>Cited Works</div>
                        {analysisResult.result.citedWorks.map((w, i) => (
                          <div key={i} style={{ fontSize: 6, color: P.t4, padding: "2px 0" }}>
                            • {w}
                          </div>
                        ))}
                      </div>
                      <div>
                        <div style={{ fontSize: 7, fontWeight: 700, color: P.teal, marginBottom: 6 }}>Methodology</div>
                        <div style={{ fontSize: 6, color: P.t4, lineHeight: 1.5 }}>
                          {analysisResult.result.methodology}
                        </div>
                      </div>
                    </div>

                    <div style={{ background: P.bg, borderRadius: 6, padding: 10, marginBottom: 10 }}>
                      <div style={{ fontSize: 7, fontWeight: 700, color: P.teal, marginBottom: 6 }}>Key Findings</div>
                      {analysisResult.result.findings.map((f, i) => (
                        <div key={i} style={{ fontSize: 7, color: P.t4, padding: "3px 0", borderBottom: `1px solid ${P.b}20` }}>
                          ⧸ {f}
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: "10px", background: `${P.teal}08`, border: `1px solid ${P.teal}25`, borderRadius: 6, fontSize: 7, color: P.teal, fontWeight: 700 }}>
                      ✓ {analysisResult.result.conclusion}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Analysis modes sidebar */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 10 }}>Analysis Modes</div>
            {ANALYSIS_MODES.map((mode) => (
              <div
                key={mode.id}
                style={{
                  background: `${mode.color}08`,
                  border: `1px solid ${mode.color}25`,
                  borderLeft: `4px solid ${mode.color}`,
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 8,
                }}
              >
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>{mode.icon}</span>
                  <div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: mode.color }}>{mode.name}</div>
                    <div style={{ fontSize: 6, color: P.t4 }}>{mode.time}</div>
                  </div>
                </div>
                <div style={{ fontSize: 6, color: P.t3, lineHeight: 1.4 }}>
                  {mode.desc}
                </div>
                <div style={{ fontSize: 5, color: P.t4, marginTop: 4 }}>{mode.depth}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}