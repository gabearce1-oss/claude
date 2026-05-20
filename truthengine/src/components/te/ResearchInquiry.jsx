import { useState } from "react";
import { P } from "../../lib/teData";

const INQUIRY_TYPES = [
  { id: "legal", label: "Legal Precedent", icon: "⚖️", color: P.red, examples: ["INA §329 naturalization", "IIRIRA §237 deportation", "SCRA protections"] },
  { id: "policy", label: "Policy Analysis", icon: "📋", color: P.blue, examples: ["VA directive 10039.2", "DHS enforcement priorities", "USCIS N-400 policy"] },
  { id: "research", label: "Academic Research", icon: "🎓", color: P.violet, examples: ["Military naturalization trends", "Veteran deportation statistics", "Demographic erasure mechanisms"] },
  { id: "case", label: "Case Law", icon: "📑", color: P.amber, examples: ["Immigration court decisions", "Administrative appeals", "Habeas corpus findings"] },
  { id: "foia", label: "FOIA Strategy", icon: "📤", color: P.gold, examples: ["VA BIRLS records access", "ICE ENFORCE database queries", "Congressional correspondence"] },
  { id: "intel", label: "Agency Intel", icon: "🔍", color: P.teal, examples: ["DHS enforcement metrics", "USCIS processing times", "GAO audit findings"] },
];

const SEARCH_HISTORY = [
  { query: "INA §329 naturalization timelines for Korean-born veterans", type: "legal", results: 847, time: "Apr 8, 2026" },
  { query: "VA BIRLS data sharing protocol with ICE", type: "foia", results: 324, time: "Apr 7, 2026" },
  { query: "BISG demographic classification accuracy for Hispanic surnames", type: "research", results: 612, time: "Apr 6, 2026" },
  { query: "IIRIRA §237(a)(2) retroactive application to pre-1996 convictions", type: "legal", results: 189, time: "Apr 5, 2026" },
  { query: "DoD SCRA query mandate for ICE removal proceedings", type: "policy", results: 456, time: "Apr 4, 2026" },
];

export default function ResearchInquiry() {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [view, setView] = useState("search");
  const [savedInquiries, setSavedInquiries] = useState([]);

  const handleSearch = async () => {
    if (!query.trim() || !selectedType) return;
    
    setIsSearching(true);
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const resultCount = Math.floor(Math.random() * 2000) + 100;
    setResults({
      query,
      type: selectedType,
      count: resultCount,
      timestamp: new Date().toLocaleString(),
      sources: [
        { name: "Federal Register", relevance: 0.98, link: "#" },
        { name: "Congressional Records", relevance: 0.96, link: "#" },
        { name: "Academic Databases", relevance: 0.92, link: "#" },
        { name: "Agency Directives", relevance: 0.89, link: "#" },
        { name: "Case Law Archives", relevance: 0.85, link: "#" },
      ],
      snippets: [
        "INA §329 provides expedited naturalization for persons who serve honorably in the U.S. armed forces...",
        "IIRIRA §237(a)(2)(A)(iii) renders removable any alien convicted of an aggravated felony, with application to pre-1996 offenses...",
        "The BISG statistical method yields τ-threshold estimates ranging from 0.30–0.70, with Hispanic probability exceeding 90% at τ=0.40...",
      ],
    });
    setIsSearching(false);
  };

  const saveInquiry = () => {
    if (results) {
      setSavedInquiries([...savedInquiries, results]);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          🔎 Research <span style={{ color: P.gold }}>Inquiry</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          SEARCH LEGAL PRECEDENT · POLICY DOCUMENTS · ACADEMIC RESEARCH · CASE LAW · FOIA STRATEGY
        </div>
      </div>

      {/* View tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "8px 10px", width: "fit-content" }}>
        {[["search", "🔍 Search"], ["history", "📜 History"], ["saved", "💾 Saved"]].map(([v, l]) => (
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

      {view === "search" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 12, marginBottom: 12 }}>
          {/* Main search area */}
          <div>
            {/* Query input */}
            <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 10 }}>Enter Your Inquiry</div>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., 'INA §329 naturalization timelines for military veterans' or 'VA BIRLS data sharing with ICE protocols'"
                style={{
                  width: "100%",
                  minHeight: 80,
                  padding: 12,
                  background: P.bg,
                  border: `1px solid ${P.b}`,
                  borderRadius: 8,
                  color: P.t1,
                  fontSize: 9,
                  fontFamily: "inherit",
                  resize: "vertical",
                  marginBottom: 10,
                  outline: "none",
                }}
              />
              <button
                onClick={handleSearch}
                disabled={!query.trim() || !selectedType || isSearching}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: selectedType && !isSearching ? `${P.gold}20` : P.bg,
                  border: `1px solid ${selectedType && !isSearching ? P.gold : P.b}`,
                  color: selectedType && !isSearching ? P.gold : P.t4,
                  fontSize: 9,
                  fontWeight: 700,
                  borderRadius: 8,
                  cursor: selectedType && !isSearching ? "pointer" : "not-allowed",
                  opacity: selectedType && !isSearching ? 1 : 0.5,
                }}
              >
                {isSearching ? "⏳ Searching..." : "🔍 Search"}
              </button>
            </div>

            {/* Results */}
            {results && (
              <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 4 }}>Search Results</div>
                    <div style={{ fontSize: 7, color: P.t4 }}>
                      {results.count.toLocaleString()} results · {results.timestamp}
                    </div>
                  </div>
                  <button
                    onClick={saveInquiry}
                    style={{
                      padding: "5px 12px",
                      background: `${P.gold}15`,
                      border: `1px solid ${P.gold}30`,
                      color: P.gold,
                      fontSize: 7,
                      fontWeight: 700,
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    💾 Save
                  </button>
                </div>

                {/* Sources */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: P.t3, marginBottom: 8 }}>Top Sources</div>
                  {results.sources.map((s, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "8px 10px",
                        background: P.bg,
                        border: `1px solid ${P.b}20`,
                        borderRadius: 6,
                        marginBottom: 6,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 8, color: P.t2, fontWeight: 700 }}>{s.name}</div>
                        <div style={{ fontSize: 6, color: P.t4 }}>Relevance: {(s.relevance * 100).toFixed(0)}%</div>
                      </div>
                      <a
                        href={s.link}
                        style={{
                          fontSize: 7,
                          color: P.gold,
                          textDecoration: "none",
                          cursor: "pointer",
                          fontWeight: 700,
                        }}
                      >
                        → View
                      </a>
                    </div>
                  ))}
                </div>

                {/* Snippets */}
                <div>
                  <div style={{ fontSize: 8, fontWeight: 700, color: P.t3, marginBottom: 8 }}>Relevant Excerpts</div>
                  {results.snippets.map((snippet, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "10px 12px",
                        background: P.bg,
                        border: `1px solid ${P.b}20`,
                        borderLeft: `3px solid ${P.gold}`,
                        borderRadius: 6,
                        marginBottom: 6,
                        fontSize: 7,
                        color: P.t3,
                        lineHeight: 1.6,
                      }}
                    >
                      "{snippet}"
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Inquiry type selector */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 10 }}>Inquiry Type</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {INQUIRY_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(selectedType === type.id ? null : type.id)}
                  style={{
                    padding: "10px 12px",
                    background: selectedType === type.id ? `${type.color}15` : P.card,
                    border: `1px solid ${selectedType === type.id ? type.color : P.b}`,
                    borderLeft: `3px solid ${type.color}`,
                    borderRadius: 7,
                    color: selectedType === type.id ? type.color : P.t3,
                    fontSize: 8,
                    fontWeight: selectedType === type.id ? 700 : 400,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all .12s",
                  }}
                >
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12 }}>{type.icon}</span>
                    <span style={{ fontWeight: 700 }}>{type.label}</span>
                  </div>
                  {selectedType === type.id && (
                    <div style={{ fontSize: 6, color: P.t4, marginLeft: 18 }}>
                      {type.examples.join(" • ")}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === "history" && (
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 12 }}>Recent Searches</div>
          {SEARCH_HISTORY.map((h, i) => {
            const typeConfig = INQUIRY_TYPES.find((t) => t.id === h.type);
            return (
              <div
                key={i}
                onClick={() => {
                  setQuery(h.query);
                  setSelectedType(h.type);
                  setView("search");
                }}
                style={{
                  padding: "10px 12px",
                  background: i % 2 === 0 ? P.bg : "transparent",
                  border: `1px solid ${P.b}20`,
                  borderRadius: 6,
                  marginBottom: 6,
                  cursor: "pointer",
                  transition: "all .12s",
                }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4 }}>
                  <span style={{ fontSize: 10 }}>{typeConfig.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 8, color: P.t2, fontWeight: 600 }}>{h.query}</div>
                    <div style={{ fontSize: 6, color: P.t4, marginTop: 2 }}>
                      {h.results.toLocaleString()} results · {h.time}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "saved" && (
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 12 }}>Saved Inquiries</div>
          {savedInquiries.length === 0 ? (
            <div style={{ fontSize: 8, color: P.t4, padding: "20px", textAlign: "center" }}>
              No saved inquiries yet. Save results from your searches to view them here.
            </div>
          ) : (
            savedInquiries.map((s, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 12px",
                  background: i % 2 === 0 ? P.bg : "transparent",
                  border: `1px solid ${P.b}20`,
                  borderRadius: 6,
                  marginBottom: 6,
                }}
              >
                <div style={{ fontSize: 8, fontWeight: 600, color: P.t2, marginBottom: 2 }}>{s.query}</div>
                <div style={{ fontSize: 6, color: P.t4 }}>
                  {s.count.toLocaleString()} results · {s.timestamp}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}