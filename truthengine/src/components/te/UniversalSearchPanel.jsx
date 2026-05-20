import { useState, useMemo } from "react";
import { P } from "../../lib/teData";

const SEARCHABLE_DATA = {
  cases: [
    { id: "C001", name: "SGT George Ramos", branch: "Army", era: "Vietnam", status: "VERIFIED", confidence: 99 },
    { id: "C002", name: "CPL M. Valenzuela", branch: "USMC", era: "Vietnam", status: "VERIFIED", confidence: 88 },
    { id: "C003", name: "LCpl V. Valenzuela", branch: "USMC", era: "Vietnam", status: "VERIFIED", confidence: 82 },
    { id: "C004", name: "CPL Sae Joon Park", branch: "USMC", era: "Post-Vietnam", status: "DEPORTED 2025", confidence: 96 },
    { id: "C005", name: "SPC Miguel Segura", branch: "Army", era: "Vietnam", status: "VERIFIED", confidence: 79 },
    { id: "C006", name: "PFC J. Duran", branch: "Army", era: "Vietnam", status: "VERIFIED", confidence: 76 },
  ],
  documents: [
    { id: "D001", title: "DCAS Forensic Audit Report", type: "Research", tags: ["dcas", "audit", "forensic"] },
    { id: "D002", title: "GAO-19-416 Deported Veterans", type: "Government", tags: ["gao", "veterans", "deportation"] },
    { id: "D003", title: "INA §329 Naturalization Framework", type: "Legal", tags: ["ina", "law", "naturalization"] },
    { id: "D004", title: "NERO Institutional Erasure Analysis", type: "Analysis", tags: ["nero", "framework", "erasure"] },
    { id: "D005", title: "PTSD-Crime Correlation Study", type: "Research", tags: ["ptsd", "crime", "analysis"] },
  ],
  agencies: [
    { id: "A001", name: "ICE", type: "Enforcement", records: 713464, focus: "Deportations" },
    { id: "A002", name: "USCIS", type: "Immigration", records: 52500, focus: "Naturalization" },
    { id: "A003", name: "VA", type: "Veterans", records: 18000, focus: "Benefits" },
    { id: "A004", name: "DoD", type: "Military", records: 12000, focus: "Service Records" },
  ],
  policies: [
    { id: "POL001", name: "Biden Inauguration", date: "2021-01-20", impact: "Prosecutorial discretion" },
    { id: "POL002", name: "Biden Border EO", date: "2024-06-21", impact: "Asylum restriction" },
    { id: "POL003", name: "INA §329 Reversal", date: "2025-04-08", impact: "Wartime protection revoked" },
  ],
};

export default function UniversalSearchPanel() {
  const [query, setQuery] = useState("");
  const [resultType, setResultType] = useState("all");

  const results = useMemo(() => {
    if (!query.trim()) return { cases: [], documents: [], agencies: [], policies: [] };

    const q = query.toLowerCase();
    return {
      cases: SEARCHABLE_DATA.cases.filter(c => c.name.toLowerCase().includes(q) || c.id.includes(q)),
      documents: SEARCHABLE_DATA.documents.filter(d => d.title.toLowerCase().includes(q) || d.tags.some(t => t.includes(q))),
      agencies: SEARCHABLE_DATA.agencies.filter(a => a.name.toLowerCase().includes(q)),
      policies: SEARCHABLE_DATA.policies.filter(p => p.name.toLowerCase().includes(q)),
    };
  }, [query]);

  const allResults = [...results.cases, ...results.documents, ...results.agencies, ...results.policies];
  const filteredResults = resultType === "all" ? allResults : results[resultType] || [];

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          🔍 Universal <span style={{ color: P.gold }}>Search Panel</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          CROSS-CASE LOOKUP · DOCUMENT SEARCH · AGENCY QUERY · POLICY TIMELINE
        </div>
      </div>

      {/* Search bar */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12, marginBottom: 12 }}>
        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search cases, documents, agencies, policies..."
          style={{ width: "100%", padding: "10px 12px", background: P.bg, border: `1px solid ${query ? P.gold : P.b}`,
            borderRadius: 8, color: P.t1, fontSize: 9, fontFamily: "inherit", outline: "none" }}/>
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          {[["all", "📋 All"], ["cases", "🎖️ Cases"], ["documents", "📄 Documents"], ["agencies", "🏛️ Agencies"], ["policies", "📋 Policies"]].map(([type, label]) => (
            <button key={type} onClick={() => setResultType(type)}
              style={{ padding: "5px 10px", fontSize: 7, fontWeight: resultType === type ? 700 : 400,
                background: resultType === type ? `${P.gold}20` : "transparent",
                border: `1px solid ${resultType === type ? P.gold : P.b}30`,
                color: resultType === type ? P.gold : P.t4, borderRadius: 6, cursor: "pointer" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {query && (
        <div>
          <div style={{ fontSize: 8, color: P.t4, marginBottom: 10, fontWeight: 700 }}>
            {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""} found
          </div>

          {results.cases.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: P.gold, marginBottom: 6 }}>🎖️ Cases ({results.cases.length})</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {results.cases.map(c => (
                  <div key={c.id} style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 8, padding: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: P.t1 }}>{c.name}</div>
                        <div style={{ fontSize: 7, color: P.t4, marginTop: 2 }}>{c.branch} · {c.era}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 800, color: c.confidence >= 95 ? P.gold : P.amber }}>
                          {c.confidence}%
                        </div>
                        <div style={{ fontSize: 6, color: P.t4 }}>{c.status}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.documents.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: P.blue, marginBottom: 6 }}>📄 Documents ({results.documents.length})</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {results.documents.map(d => (
                  <div key={d.id} style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 8, padding: 10 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 4 }}>{d.title}</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 6, background: `${P.violet}12`, border: `1px solid ${P.violet}20`, color: P.violet, borderRadius: 20, padding: "1px 6px" }}>
                        {d.type}
                      </span>
                      {d.tags.map(t => (
                        <span key={t} style={{ fontSize: 6, background: `${P.t4}08`, padding: "1px 6px", borderRadius: 20 }}>#{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.agencies.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: P.red, marginBottom: 6 }}>🏛️ Agencies ({results.agencies.length})</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 8 }}>
                {results.agencies.map(a => (
                  <div key={a.id} style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 8, padding: 10 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 4 }}>{a.name}</div>
                    <div style={{ fontSize: 7, color: P.t4, marginBottom: 6 }}>{a.type}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7 }}>
                      <span style={{ color: P.t4 }}>Records:</span>
                      <span style={{ fontWeight: 700, color: P.gold }}>{a.records.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.policies.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: P.amber, marginBottom: 6 }}>📋 Policies ({results.policies.length})</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {results.policies.map(p => (
                  <div key={p.id} style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 8, padding: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: P.t1 }}>{p.name}</div>
                        <div style={{ fontSize: 7, color: P.t4, marginTop: 2 }}>{p.impact}</div>
                      </div>
                      <div style={{ fontSize: 7, color: P.t4 }}>{p.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!query && (
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
          <div style={{ fontSize: 9, color: P.t4 }}>Start typing to search across cases, documents, agencies, and policies</div>
          <div style={{ marginTop: 12, fontSize: 8, color: P.t4 }}>Indexed: {SEARCHABLE_DATA.cases.length} cases · {SEARCHABLE_DATA.documents.length} documents · {SEARCHABLE_DATA.agencies.length} agencies · {SEARCHABLE_DATA.policies.length} policies</div>
        </div>
      )}
    </div>
  );
}