import { useState, useMemo } from "react";
import { P } from "../../lib/teData";

const DOCUMENTS_INDEX = [
  { id: "DOC001", title: "DCAS Forensic Audit Report", content: "DCAS Vietnam Casualty Analysis: Hispanic Undercounting 84.9% classification failure rate BISG estimate", type: "Research", date: "2026-04-08", source: "AUMER Foundation", tags: ["dcas", "vietnam", "audit"] },
  { id: "DOC002", title: "GAO-19-416 Deported Veterans", content: "Government Accountability Office findings on ICE veteran handling 92 confirmed deported veterans between FY2013-2018", type: "Government", date: "2019-06-06", source: "GAO", tags: ["veterans", "deportation", "gao"] },
  { id: "DOC003", title: "Pentagon Valor Review 2014", content: "17 of 24 Medal of Honor upgrades for Hispanic service members systematic bias in military decorations", type: "Government", date: "2014-03-18", source: "Pentagon", tags: ["military", "honor", "hispanic"] },
  { id: "DOC004", title: "INA §329 Naturalization Framework", content: "Wartime service naturalization eligibility military exception to deportation grounds", type: "Legal", date: "2026-04-01", source: "Legal Analysis", tags: ["ina", "naturalization", "law"] },
  { id: "DOC005", title: "Ralph Guzman Mexican American Casualties in Vietnam", content: "Spanish surname analysis 19% of Vietnam casualties from Southwest states foundational scholarship", type: "Academic", date: "1969-01-01", source: "UCSC", tags: ["guzman", "vietnam", "scholarship"] },
  { id: "DOC006", title: "PTSD-Crime Correlation Study", content: "Combat PTSD manifestation as criminal behavior 70% comorbidity with substance use disorder untreated trauma", type: "Research", date: "2026-03-15", source: "AUMER", tags: ["ptsd", "crime", "trauma"] },
];

const CASES_INDEX = [
  { id: "C001", name: "SGT George Ramos", branch: "Army", era: "Vietnam", status: "VERIFIED", confidence: 99, relevance: ["Medal of Honor", "Casualty", "Hispanic service"] },
  { id: "C002", name: "CPL M. Valenzuela", branch: "USMC", era: "Vietnam", status: "VERIFIED", confidence: 88, relevance: ["Casa del Migrante", "IIRIRA retroactive", "Mexico"] },
  { id: "C003", name: "LCpl V. Valenzuela", branch: "USMC", era: "Vietnam", status: "VERIFIED", confidence: 82, relevance: ["Brother case", "Bronze Star", "Mexico"] },
  { id: "C004", name: "CPL Sae Joon Park", branch: "USMC", era: "Post-Vietnam", status: "DEPORTED 2025", confidence: 96, relevance: ["Self-deported", "INA §329 denial", "Critical case"] },
  { id: "C005", name: "SPC Miguel Segura", branch: "Army", era: "Vietnam", status: "VERIFIED", confidence: 79, relevance: ["Nogales", "FOIA pending", "Fort Huachuca"] },
  { id: "C006", name: "PFC J. Duran", branch: "Army", era: "Vietnam", status: "VERIFIED", confidence: 76, relevance: ["Colombia", "Overdue FOIA", "Bronze Star"] },
];

const POLICIES_INDEX = [
  { id: "POL001", name: "Biden Inauguration", date: "2021-01-20", impact: "Prosecutorial discretion", description: "Immigration enforcement prioritization changes" },
  { id: "POL002", name: "Biden Border EO", date: "2024-06-21", impact: "Asylum restriction", description: "Executive order on asylum eligibility" },
  { id: "POL003", name: "INA §329 Reversal", date: "2025-04-08", impact: "Wartime protection revoked", description: "Reversal of military naturalization exception" },
  { id: "POL004", name: "ICE Veteran Policy Rescission", date: "2025-04-15", impact: "Military service no longer mitigating factor", description: "Formal rescission of 2015 veteran consideration directive" },
  { id: "POL005", name: "IIRIRA §237 Enforcement", date: "1996-09-30", impact: "Retroactive deportation grounds", description: "Expanded aggravated felony definition, stripped judicial discretion" },
];

export default function ResearchSearch() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBranch, setFilterBranch] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState({ start: "1960", end: "2026" });
  const [selectedResult, setSelectedResult] = useState(null);

  const branches = ["all", "Army", "USMC", "Navy", "Air Force"];
  const statuses = ["all", "VERIFIED", "PENDING", "DEPORTED 2025"];

  const results = useMemo(() => {
    const q = query.toLowerCase();
    let docs = [], cases = [], policies = [];

    if (searchType === "all" || searchType === "documents") {
      docs = DOCUMENTS_INDEX.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q) ||
        d.tags.some(t => t.includes(q))
      );
    }

    if (searchType === "all" || searchType === "cases") {
      cases = CASES_INDEX.filter(c => {
        const matchQuery = c.name.toLowerCase().includes(q) || c.relevance.some(r => r.toLowerCase().includes(q));
        const matchStatus = filterStatus === "all" || c.status === filterStatus;
        const matchBranch = filterBranch === "all" || c.branch === filterBranch;
        return matchQuery && matchStatus && matchBranch;
      });
    }

    if (searchType === "all" || searchType === "policies") {
      const startYear = parseInt(filterDateRange.start);
      const endYear = parseInt(filterDateRange.end);
      policies = POLICIES_INDEX.filter(p => {
        const year = parseInt(p.date.split("-")[0]);
        const matchQuery = p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
        const matchDate = year >= startYear && year <= endYear;
        return matchQuery && matchDate;
      });
    }

    return { docs, cases, policies, total: docs.length + cases.length + policies.length };
  }, [query, searchType, filterStatus, filterBranch, filterDateRange]);

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          🔬 Research <span style={{ color: P.gold }}>Search Hub</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          CROSS-INDEX SEARCH · CASE LOOKUP · POLICY TIMELINE · CONGRESSIONAL BRIEFING PREP
        </div>
      </div>

      {/* Search bar */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12, marginBottom: 12 }}>
        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search cases, documents, policies by keyword..."
          style={{ width: "100%", padding: "10px 12px", background: P.bg, border: `1px solid ${query ? P.gold : P.b}`,
            borderRadius: 8, color: P.t1, fontSize: 9, fontFamily: "inherit", outline: "none", marginBottom: 10 }}/>
        
        {/* Search type tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          {[["all", "📋 All Results"], ["documents", "📄 Documents"], ["cases", "🎖️ Cases"], ["policies", "📋 Policies"]].map(([type, label]) => (
            <button key={type} onClick={() => setSearchType(type)}
              style={{ padding: "5px 10px", fontSize: 7, fontWeight: searchType === type ? 700 : 400,
                background: searchType === type ? `${P.gold}20` : "transparent",
                border: `1px solid ${searchType === type ? P.gold : P.b}30`,
                color: searchType === type ? P.gold : P.t4, borderRadius: 6, cursor: "pointer" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Advanced filters */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 8 }}>
          {/* Case Status Filter */}
          {(searchType === "all" || searchType === "cases") && (
            <div>
              <div style={{ fontSize: 7, color: P.t4, marginBottom: 4, fontWeight: 700 }}>Case Status</div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                style={{ width: "100%", padding: "6px 8px", background: P.bg, border: `1px solid ${P.b}`, borderRadius: 6,
                  color: P.t1, fontSize: 8, fontFamily: "inherit", cursor: "pointer" }}>
                {statuses.map(s => <option key={s} value={s}>{s === "all" ? "All Statuses" : s}</option>)}
              </select>
            </div>
          )}

          {/* Branch Filter */}
          {(searchType === "all" || searchType === "cases") && (
            <div>
              <div style={{ fontSize: 7, color: P.t4, marginBottom: 4, fontWeight: 700 }}>Branch of Service</div>
              <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)}
                style={{ width: "100%", padding: "6px 8px", background: P.bg, border: `1px solid ${P.b}`, borderRadius: 6,
                  color: P.t1, fontSize: 8, fontFamily: "inherit", cursor: "pointer" }}>
                {branches.map(b => <option key={b} value={b}>{b === "all" ? "All Branches" : b}</option>)}
              </select>
            </div>
          )}

          {/* Date Range Filter */}
          {(searchType === "all" || searchType === "policies") && (
            <div>
              <div style={{ fontSize: 7, color: P.t4, marginBottom: 4, fontWeight: 700 }}>Policy Date Range</div>
              <div style={{ display: "flex", gap: 4 }}>
                <input type="text" value={filterDateRange.start} onChange={e => setFilterDateRange({...filterDateRange, start: e.target.value})}
                  placeholder="1960" style={{ flex: 1, padding: "6px", background: P.bg, border: `1px solid ${P.b}`, borderRadius: 6,
                    color: P.t1, fontSize: 8, textAlign: "center" }}/>
                <span style={{ color: P.t4, fontSize: 7, padding: "6px 0" }}>—</span>
                <input type="text" value={filterDateRange.end} onChange={e => setFilterDateRange({...filterDateRange, end: e.target.value})}
                  placeholder="2026" style={{ flex: 1, padding: "6px", background: P.bg, border: `1px solid ${P.b}`, borderRadius: 6,
                    color: P.t1, fontSize: 8, textAlign: "center" }}/>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {query && (
        <div style={{ marginBottom: 12, fontSize: 8, color: P.t4, fontWeight: 700 }}>
          {results.total} result{results.total !== 1 ? "s" : ""} found
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Results list */}
        <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 400px)" }}>
          {results.docs.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: P.blue, marginBottom: 6 }}>📄 Documents ({results.docs.length})</div>
              {results.docs.map(doc => (
                <div key={doc.id} onClick={() => setSelectedResult({type: "document", data: doc})}
                  style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 8, padding: 10, marginBottom: 6, cursor: "pointer",
                    borderLeft: `4px solid ${P.blue}` }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: P.t1, marginBottom: 3 }}>{doc.title}</div>
                  <div style={{ fontSize: 7, color: P.t4, marginBottom: 4 }}>{doc.source} · {doc.date}</div>
                  <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    {doc.tags.map(t => (
                      <span key={t} style={{ fontSize: 6, background: `${P.blue}12`, color: P.blue, borderRadius: 20, padding: "1px 6px" }}>#{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.cases.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: P.gold, marginBottom: 6 }}>🎖️ Cases ({results.cases.length})</div>
              {results.cases.map(c => (
                <div key={c.id} onClick={() => setSelectedResult({type: "case", data: c})}
                  style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 8, padding: 10, marginBottom: 6, cursor: "pointer",
                    borderLeft: `4px solid ${P.gold}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: P.t1 }}>{c.name}</div>
                    <span style={{ fontSize: 7, fontWeight: 800, color: P.gold, fontFamily: "'IBM Plex Mono',monospace" }}>{c.confidence}%</span>
                  </div>
                  <div style={{ fontSize: 7, color: P.t4, marginBottom: 4 }}>{c.branch} · {c.era}</div>
                  <div style={{ fontSize: 7, color: P.t3 }}>{c.relevance.slice(0, 2).join(" • ")}</div>
                </div>
              ))}
            </div>
          )}

          {results.policies.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: P.amber, marginBottom: 6 }}>📋 Policies ({results.policies.length})</div>
              {results.policies.map(p => (
                <div key={p.id} onClick={() => setSelectedResult({type: "policy", data: p})}
                  style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 8, padding: 10, marginBottom: 6, cursor: "pointer",
                    borderLeft: `4px solid ${P.amber}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: P.t1 }}>{p.name}</div>
                    <span style={{ fontSize: 7, color: P.t4 }}>{p.date}</span>
                  </div>
                  <div style={{ fontSize: 7, color: P.amber, fontWeight: 700, marginBottom: 3 }}>{p.impact}</div>
                  <div style={{ fontSize: 7, color: P.t4 }}>{p.description}</div>
                </div>
              ))}
            </div>
          )}

          {!query && (
            <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔬</div>
              <div style={{ fontSize: 9, color: P.t4 }}>Start typing to search across all research documents, cases, and policies</div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 400px)" }}>
          {selectedResult ? (
            <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
              <button onClick={() => setSelectedResult(null)} style={{ padding: "4px 10px", fontSize: 7, background: P.bg, border: `1px solid ${P.b}`,
                color: P.t4, borderRadius: 6, cursor: "pointer", marginBottom: 10 }}>← Back</button>

              {selectedResult.type === "document" && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 8 }}>{selectedResult.data.title}</div>
                  <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 7, background: `${P.blue}15`, border: `1px solid ${P.blue}25`, color: P.blue, borderRadius: 20, padding: "2px 8px" }}>
                      {selectedResult.data.type}
                    </span>
                    <span style={{ fontSize: 7, background: `${P.t4}08`, color: P.t4, borderRadius: 20, padding: "2px 8px" }}>
                      {selectedResult.data.source}
                    </span>
                  </div>
                  <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.8, padding: "10px", background: P.bg, borderRadius: 8, marginBottom: 10 }}>
                    {selectedResult.data.content}
                  </div>
                  <button style={{ width: "100%", padding: "8px", fontSize: 8, fontWeight: 700, cursor: "pointer",
                    background: `${P.gold}20`, border: `1px solid ${P.gold}`, color: P.gold, borderRadius: 6 }}>
                    📥 View Full Document
                  </button>
                </div>
              )}

              {selectedResult.type === "case" && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 8 }}>{selectedResult.data.name}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                    {[["Branch", selectedResult.data.branch], ["Era", selectedResult.data.era], ["Status", selectedResult.data.status], ["Confidence", selectedResult.data.confidence + "%"]].map(([k, v]) => (
                      <div key={k} style={{ background: P.bg, borderRadius: 6, padding: 8 }}>
                        <div style={{ fontSize: 6, color: P.t4, marginBottom: 2 }}>{k}</div>
                        <div style={{ fontSize: 8, fontWeight: 700, color: P.gold }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 8, fontWeight: 700, color: P.t1, marginBottom: 6 }}>Related Topics</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                    {selectedResult.data.relevance.map((r, i) => (
                      <span key={i} style={{ fontSize: 7, background: `${P.gold}15`, border: `1px solid ${P.gold}25`, color: P.gold, borderRadius: 20, padding: "2px 8px" }}>
                        {r}
                      </span>
                    ))}
                  </div>
                  <button style={{ width: "100%", padding: "8px", fontSize: 8, fontWeight: 700, cursor: "pointer",
                    background: `${P.blue}20`, border: `1px solid ${P.blue}`, color: P.blue, borderRadius: 6 }}>
                    📋 View Case Details
                  </button>
                </div>
              )}

              {selectedResult.type === "policy" && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 8 }}>{selectedResult.data.name}</div>
                  <div style={{ background: P.bg, borderRadius: 8, padding: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 6, color: P.t4, marginBottom: 2 }}>DATE</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: P.amber }}>{selectedResult.data.date}</div>
                  </div>
                  <div style={{ fontSize: 8, fontWeight: 700, color: P.t1, marginBottom: 6 }}>IMPACT STATEMENT</div>
                  <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.8, padding: "10px", background: P.bg, borderRadius: 8, marginBottom: 10 }}>
                    {selectedResult.data.description}
                  </div>
                  <button style={{ width: "100%", padding: "8px", fontSize: 8, fontWeight: 700, cursor: "pointer",
                    background: `${P.amber}20`, border: `1px solid ${P.amber}`, color: P.amber, borderRadius: 6 }}>
                    📊 View Policy Analysis
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>📎</div>
              <div style={{ fontSize: 9, color: P.t4 }}>Select a result to view details and cross-references</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}