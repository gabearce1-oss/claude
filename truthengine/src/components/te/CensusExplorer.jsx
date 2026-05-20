import { useState } from "react";
import { P } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

const CENSUS_SOURCES = [
  {
    id: "census_gov",
    name: "data.census.gov",
    icon: "🏛️",
    color: P.blue,
    url: "https://data.census.gov",
    desc: "US Census Bureau — ACS, Decennial, economic surveys",
    quickSearch: (q) => `https://data.census.gov/table?q=${encodeURIComponent(q)}`,
  },
  {
    id: "census_reporter",
    name: "censusreporter.org",
    icon: "📊",
    color: P.teal,
    url: "https://censusreporter.org",
    desc: "Journalist-friendly Census data explorer — profiles, maps, comparisons",
    quickSearch: (q) => `https://censusreporter.org/profiles/search/?q=${encodeURIComponent(q)}`,
  },
];

const PRESET_QUERIES = [
  { label: "Hispanic Veteran Status", q: "Hispanic Latino veteran status period of service", table: "B21002", focus: "veteran" },
  { label: "Non-Citizen Veterans", q: "non-citizen foreign born veteran military service", table: "B21001", focus: "veteran" },
  { label: "Vietnam-Era Veterans", q: "Vietnam era veterans by race ethnicity state", table: "B21002", focus: "veteran" },
  { label: "CA Hispanic Veterans", q: "California Hispanic Latino veteran population county", table: "B21001", focus: "state" },
  { label: "TX Border Counties", q: "Texas border county Hispanic veteran demographics El Paso Webb", table: "DP02", focus: "state" },
  { label: "Military Naturalization", q: "naturalization military service foreign born citizenship", table: "B05001", focus: "immigration" },
  { label: "San Diego–TJ Metro", q: "San Diego metropolitan Hispanic foreign born veteran", table: "B21001", focus: "metro" },
  { label: "Poverty — Deported Vets", q: "Hispanic veteran poverty income below federal poverty line", table: "B17001", focus: "economic" },
  { label: "Disability — Veterans", q: "Hispanic veteran disability status service-connected", table: "B18101", focus: "disability" },
  { label: "Housing — Veterans", q: "veteran housing insecurity homelessness Hispanic Latino", table: "B25003", focus: "housing" },
];

const RESULT_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    key_findings: { type: "array", items: { type: "object", properties: {
      stat: { type: "string" },
      value: { type: "string" },
      context: { type: "string" },
      aumer_relevance: { type: "string" },
    }}},
    data_tables: { type: "array", items: { type: "object", properties: {
      table_id: { type: "string" },
      table_name: { type: "string" },
      description: { type: "string" },
      census_gov_url: { type: "string" },
      censusreporter_url: { type: "string" },
      key_variables: { type: "array", items: { type: "string" } },
    }}},
    geographic_breakdown: { type: "object", properties: {
      national: { type: "string" },
      top_states: { type: "array", items: { type: "string" } },
      border_counties: { type: "string" },
    }},
    bisg_validation: { type: "string" },
    chc_talking_point: { type: "string" },
    census_reporter_profile: { type: "string" },
  },
};

const FOCUS_C = {
  veteran: P.gold,
  state: P.blue,
  metro: P.teal,
  immigration: P.violet,
  economic: P.amber,
  disability: P.red,
  housing: P.orange || "#FF8C42",
};

export default function CensusExplorer() {
  const [query, setQuery] = useState("");
  const [activePreset, setActivePreset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeSource, setActiveSource] = useState("both");
  const [iframeSource, setIframeSource] = useState(null);

  const runSearch = async (q, presetIdx = null) => {
    const searchQ = q || query;
    if (!searchQ.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setActivePreset(presetIdx);

    const preset = presetIdx !== null ? PRESET_QUERIES[presetIdx] : null;

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a senior Census data analyst for the AUMER Foundation researching Hispanic/Latino veteran demographics.

Query: "${searchQ}"
${preset ? `Primary Census Table: ${preset.table} — Focus: ${preset.focus}` : ""}

Using data from:
1. data.census.gov — American Community Survey (ACS 5-Year Estimates, 2022)
2. censusreporter.org — Simplified Census data explorer

Research this query thoroughly and return:

1. SUMMARY: 2-sentence summary of what the Census data shows
2. KEY FINDINGS: 4-6 specific statistics with:
   - stat: metric name
   - value: the actual data value (be specific with numbers/percentages)
   - context: what this means
   - aumer_relevance: how this connects to AUMER's deported veteran research (DCAS 349 anomaly, 115,000 at-risk veterans, CHC briefing May 18 2026)

3. DATA TABLES: 2-4 relevant Census tables with:
   - table_id (e.g., B21001)
   - table_name
   - description
   - census_gov_url: direct URL to data.census.gov table
   - censusreporter_url: direct URL to censusreporter.org
   - key_variables: 3-5 field names

4. GEOGRAPHIC BREAKDOWN:
   - national: national Hispanic veteran figure
   - top_states: top 5 states with highest Hispanic veteran populations
   - border_counties: border county data relevant to deported veterans

5. BISG VALIDATION: How this Census data validates or challenges the BISG τ=0.40 estimate of 2,309 Hispanic Vietnam casualties

6. CHC TALKING POINT: One sentence using this Census data for the May 18 CHC briefing

7. CENSUS REPORTER PROFILE: Best censusreporter.org profile URL for this data

Use real ACS table codes and real data values. Be specific and data-driven.`,
        add_context_from_internet: true,
        response_json_schema: RESULT_SCHEMA,
        model: "gemini_3_1_pro",
      });
      setResults(res);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const openIframe = (url, source) => {
    setIframeSource({ url, source });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ background: P.card, border: `1px solid ${P.blue}30`, borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 10, justifyContent: "space-between", flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ background: `linear-gradient(135deg,${P.blue},${P.teal})`, borderRadius: 6, padding: "4px 8px", fontSize: 10, fontWeight: 800, color: "#fff" }}>
              CENSUS
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: P.t1 }}>
                Census <span style={{ color: P.blue }}>Data Explorer</span>
              </div>
              <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
                DATA.CENSUS.GOV · CENSUSREPORTER.ORG · ACS 5-YEAR · VETERAN DEMOGRAPHICS
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {CENSUS_SOURCES.map(src => (
              <a key={src.id} href={src.url} target="_blank" rel="noreferrer"
                style={{ padding: "5px 12px", background: `${src.color}15`, border: `1px solid ${src.color}30`,
                  color: src.color, borderRadius: 7, fontSize: 8, fontWeight: 700, textDecoration: "none",
                  display: "flex", alignItems: "center", gap: 5 }}>
                {src.icon} {src.name} ↗
              </a>
            ))}
          </div>
        </div>

        {/* Source stats */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {[
            { l: "ACS 5-Year", v: "2022 Estimates", c: P.blue },
            { l: "Hispanic Veterans (US)", v: "~1.1M", c: P.gold },
            { l: "Non-Citizen Veterans", v: "~180,000", c: P.red },
            { l: "Vietnam Era (Hispanic)", v: "349 official / 2,309+ BISG", c: P.violet },
            { l: "CA Border Counties", v: "High concentration", c: P.teal },
          ].map((s, i) => (
            <div key={i} style={{ background: "#080D18", border: `1px solid ${s.c}20`, borderRadius: 6, padding: "4px 10px" }}>
              <span style={{ fontSize: 6, color: P.t4 }}>{s.l}: </span>
              <span style={{ fontSize: 7, fontWeight: 700, color: s.c }}>{s.v}</span>
            </div>
          ))}
        </div>

        {/* Preset queries */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
          {PRESET_QUERIES.map((p, i) => {
            const fc = FOCUS_C[p.focus] || P.blue;
            const isActive = activePreset === i;
            return (
              <button key={i} onClick={() => { setQuery(p.q); runSearch(p.q, i); }}
                style={{ padding: "3px 10px", fontSize: 7, cursor: "pointer",
                  background: isActive ? `${fc}20` : `${fc}08`,
                  border: `1px solid ${isActive ? fc : fc + "30"}`,
                  color: isActive ? fc : P.t3, borderRadius: 20 }}>
                {p.label}
                <span style={{ fontSize: 6, color: P.t4, marginLeft: 4 }}>({p.table})</span>
              </button>
            );
          })}
        </div>

        {/* Search bar */}
        <div style={{ display: "flex", gap: 8 }}>
          <input value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && runSearch()}
            placeholder='Search Census data — e.g. "Hispanic Vietnam veterans California" or "non-citizen military service deportation"'
            style={{ flex: 1, padding: "9px 14px", background: "#080D18",
              border: `1px solid ${P.blue}40`, borderRadius: 8, color: P.t1,
              fontSize: 10, fontFamily: "'IBM Plex Mono',monospace", outline: "none" }} />
          <button onClick={() => runSearch()} disabled={loading || !query.trim()}
            style={{ padding: "9px 18px", background: loading ? P.b : `linear-gradient(135deg,${P.blue},${P.teal})`,
              color: loading ? P.t4 : "#fff", border: "none", borderRadius: 8, fontSize: 11,
              fontWeight: 800, cursor: loading || !query.trim() ? "not-allowed" : "pointer",
              fontFamily: "'IBM Plex Mono',monospace", whiteSpace: "nowrap" }}>
            {loading ? "⟳ Searching..." : "📊 Search Census"}
          </button>
        </div>
      </div>

      {/* Info banner */}
      {!loading && !results && (
        <div style={{ background: `${P.blue}06`, border: `1px solid ${P.blue}15`, borderRadius: 8, padding: "10px 14px", marginBottom: 10, fontSize: 8, color: P.t3 }}>
          ℹ Uses <strong style={{ color: P.blue }}>Gemini Pro + Live Internet</strong> to query both data.census.gov and censusreporter.org in real time — returns ACS table IDs, direct links, specific statistics, and BISG validation data relevant to the AUMER Foundation's deported veteran research.
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ background: P.card, border: `1px solid ${P.blue}30`, borderRadius: 10, padding: "30px", textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>📊</div>
          <div style={{ fontSize: 11, color: P.blue, fontWeight: 700, marginBottom: 4 }}>Querying Census Data...</div>
          <div style={{ fontSize: 8, color: P.t4 }}>Searching ACS tables · Cross-referencing veteran demographics · Validating BISG estimates</div>
        </div>
      )}

      {error && (
        <div style={{ background: `${P.red}08`, border: `1px solid ${P.red}30`, borderRadius: 8, padding: "10px 14px", fontSize: 9, color: P.red }}>
          ⚠ {error}
        </div>
      )}

      {/* Iframe panel */}
      {iframeSource && (
        <div style={{ background: P.card, border: `1px solid ${P.blue}30`, borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ background: `${P.blue}12`, borderBottom: `1px solid ${P.b}`, padding: "8px 14px",
            display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: P.blue }}>🌐 {iframeSource.source}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <a href={iframeSource.url} target="_blank" rel="noreferrer"
                style={{ fontSize: 7, color: P.blue, textDecoration: "none", padding: "3px 8px",
                  background: `${P.blue}15`, border: `1px solid ${P.blue}20`, borderRadius: 5 }}>
                Open in new tab ↗
              </a>
              <button onClick={() => setIframeSource(null)}
                style={{ fontSize: 7, color: P.t4, padding: "3px 8px", background: "transparent",
                  border: `1px solid ${P.b}`, borderRadius: 5, cursor: "pointer" }}>✕ Close</button>
            </div>
          </div>
          <iframe src={iframeSource.url} style={{ width: "100%", height: 500, border: "none" }}
            title={iframeSource.source} />
        </div>
      )}

      {/* Results */}
      {results && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Summary + CHC point */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: P.card, border: `1px solid ${P.blue}25`, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 7, color: P.blue, fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>📊 CENSUS SUMMARY</div>
              <div style={{ fontSize: 9, color: P.t2, lineHeight: 1.8 }}>{results.summary}</div>
              {results.bisg_validation && (
                <div style={{ marginTop: 8, padding: "6px 10px", background: `${P.violet}10`, border: `1px solid ${P.violet}20`, borderRadius: 7 }}>
                  <div style={{ fontSize: 6, color: P.violet, fontWeight: 700, marginBottom: 3 }}>BISG VALIDATION</div>
                  <div style={{ fontSize: 8, color: P.t2 }}>{results.bisg_validation}</div>
                </div>
              )}
            </div>
            <div style={{ background: P.card, border: `1px solid ${P.gold}25`, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 7, color: P.gold, fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>🏛️ CHC TALKING POINT</div>
              <div style={{ fontSize: 9, color: P.t1, lineHeight: 1.8, fontStyle: "italic" }}>"{results.chc_talking_point}"</div>
              {results.geographic_breakdown && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 6, color: P.t4, letterSpacing: 1, marginBottom: 4 }}>TOP STATES</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {results.geographic_breakdown.top_states?.map((s, i) => (
                      <span key={i} style={{ fontSize: 6, background: `${P.blue}10`, border: `1px solid ${P.blue}20`,
                        color: P.blue, borderRadius: 20, padding: "1px 7px" }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Key findings */}
          {results.key_findings?.length > 0 && (
            <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 7, color: P.t4, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>📈 KEY STATISTICS</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 8 }}>
                {results.key_findings.map((f, i) => (
                  <div key={i} style={{ background: "#080D18", border: `1px solid ${P.b}20`, borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 800, color: P.gold, lineHeight: 1, marginBottom: 3 }}>
                      {f.value}
                    </div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: P.t1, marginBottom: 3 }}>{f.stat}</div>
                    <div style={{ fontSize: 7, color: P.t3, lineHeight: 1.5, marginBottom: 5 }}>{f.context}</div>
                    {f.aumer_relevance && (
                      <div style={{ fontSize: 7, color: P.violet, fontStyle: "italic" }}>→ {f.aumer_relevance}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data tables */}
          {results.data_tables?.length > 0 && (
            <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 7, color: P.t4, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>🗂 CENSUS TABLES</div>
              {results.data_tables.map((t, i) => (
                <div key={i} style={{ background: "#080D18", border: `1px solid ${P.b}20`, borderRadius: 9, padding: "10px 14px", marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap", marginBottom: 5 }}>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 800, color: P.blue,
                          background: `${P.blue}15`, border: `1px solid ${P.blue}25`, borderRadius: 5, padding: "1px 8px" }}>
                          {t.table_id}
                        </span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: P.t1 }}>{t.table_name}</span>
                      </div>
                      <div style={{ fontSize: 8, color: P.t3 }}>{t.description}</div>
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {t.census_gov_url && (
                        <button onClick={() => openIframe(t.census_gov_url, `data.census.gov — ${t.table_id}`)}
                          style={{ padding: "4px 10px", background: `${P.blue}15`, border: `1px solid ${P.blue}25`,
                            color: P.blue, borderRadius: 6, fontSize: 7, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace" }}>
                          🏛️ View in Census
                        </button>
                      )}
                      {t.censusreporter_url && (
                        <button onClick={() => openIframe(t.censusreporter_url, `censusreporter.org — ${t.table_id}`)}
                          style={{ padding: "4px 10px", background: `${P.teal}15`, border: `1px solid ${P.teal}25`,
                            color: P.teal, borderRadius: 6, fontSize: 7, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace" }}>
                          📊 CensusReporter
                        </button>
                      )}
                      {t.census_gov_url && (
                        <a href={t.census_gov_url} target="_blank" rel="noreferrer"
                          style={{ padding: "4px 8px", background: "transparent", border: `1px solid ${P.b}`,
                            color: P.t4, borderRadius: 6, fontSize: 7, textDecoration: "none" }}>↗</a>
                      )}
                    </div>
                  </div>
                  {t.key_variables?.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                      {t.key_variables.map((v, j) => (
                        <span key={j} style={{ fontSize: 6, background: `${P.blue}08`, border: `1px solid ${P.blue}15`,
                          color: P.blue, borderRadius: 20, padding: "1px 7px" }}>{v}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Geographic + CensusReporter */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {results.geographic_breakdown && (
              <div style={{ background: P.card, border: `1px solid ${P.teal}20`, borderRadius: 9, padding: "12px 14px" }}>
                <div style={{ fontSize: 7, color: P.teal, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>🗺 GEOGRAPHIC BREAKDOWN</div>
                {[
                  ["National", results.geographic_breakdown.national, P.blue],
                  ["Border Counties", results.geographic_breakdown.border_counties, P.red],
                ].map(([k, v, c]) => v ? (
                  <div key={k} style={{ marginBottom: 8, padding: "6px 10px", background: "#080D18", borderRadius: 7 }}>
                    <div style={{ fontSize: 6, color: P.t4, marginBottom: 2 }}>{k.toUpperCase()}</div>
                    <div style={{ fontSize: 8, color: c, lineHeight: 1.6 }}>{v}</div>
                  </div>
                ) : null)}
              </div>
            )}
            <div style={{ background: P.card, border: `1px solid ${P.teal}20`, borderRadius: 9, padding: "12px 14px" }}>
              <div style={{ fontSize: 7, color: P.teal, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>📊 OPEN IN EXPLORER</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {CENSUS_SOURCES.map(src => (
                  <div key={src.id}>
                    <button onClick={() => openIframe(src.quickSearch(query || "Hispanic veterans"), src.name)}
                      style={{ width: "100%", padding: "9px 12px", background: `${src.color}12`,
                        border: `1px solid ${src.color}25`, color: src.color, borderRadius: 8,
                        fontSize: 9, fontWeight: 700, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace",
                        textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{src.icon}</span>
                      <div>
                        <div>{src.name}</div>
                        <div style={{ fontSize: 7, color: P.t4, fontWeight: 400 }}>{src.desc}</div>
                      </div>
                    </button>
                  </div>
                ))}
                {results.census_reporter_profile && (
                  <a href={results.census_reporter_profile} target="_blank" rel="noreferrer"
                    style={{ padding: "6px 12px", background: `${P.gold}12`, border: `1px solid ${P.gold}25`,
                      color: P.gold, borderRadius: 7, fontSize: 8, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                    🔗 Best CensusReporter Profile ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Always-visible quick access when no results */}
      {!results && !loading && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
          {CENSUS_SOURCES.map(src => (
            <div key={src.id} style={{ background: P.card, border: `1px solid ${src.color}25`, borderTop: `3px solid ${src.color}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 24 }}>{src.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: src.color }}>{src.name}</div>
                  <div style={{ fontSize: 7, color: P.t4 }}>{src.desc}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => openIframe(src.url, src.name)}
                  style={{ flex: 1, padding: "7px", background: `${src.color}15`, border: `1px solid ${src.color}25`,
                    color: src.color, borderRadius: 7, fontSize: 8, fontWeight: 700, cursor: "pointer" }}>
                  Browse ↗
                </button>
                <button onClick={() => openIframe(src.quickSearch("Hispanic veteran Vietnam"), src.name)}
                  style={{ flex: 1, padding: "7px", background: "transparent", border: `1px solid ${P.b}`,
                    color: P.t4, borderRadius: 7, fontSize: 8, cursor: "pointer" }}>
                  Search Vets
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}