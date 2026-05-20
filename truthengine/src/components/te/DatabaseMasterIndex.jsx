import { useState, useMemo } from "react";
import { InvokeLLM } from "@base44/sdk/modules/ai.js";
import { P } from "../../lib/teData";
import { SECTIONS, CONNECTOR_QUEUE, SOURCES } from "../../lib/masterDBIndex.js";

const PRIORITY_COLOR = { CRITICAL: P.red, HIGH: P.gold, MEDIUM: P.teal, LOW: P.t3 };
const ACCESS_COLOR   = { open: P.teal, key: P.gold, foia: P.red, manual: P.blue, sub: "#a78bfa" };
const COUNTRY_FLAG   = { US: "🇺🇸", MX: "🇲🇽", INT: "🌐" };

const Pill = ({ label, color }) => (
  <span style={{
    background: color + "20", border: `1px solid ${color}50`, color, borderRadius: 3,
    fontSize: 9, padding: "1px 6px", fontWeight: 700, whiteSpace: "nowrap",
  }}>{label}</span>
);

export default function DatabaseMasterIndex() {
  const [tab, setTab] = useState("sections");
  const [sectionFilter, setSectionFilter] = useState(0);
  const [accessFilter, setAccessFilter] = useState("ALL");
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const filtered = useMemo(() => {
    return SOURCES.filter(s => {
      if (sectionFilter && s.section !== sectionFilter) return false;
      if (accessFilter !== "ALL" && s.access !== accessFilter) return false;
      if (countryFilter !== "ALL" && s.country !== countryFilter) return false;
      if (priorityFilter !== "ALL") {
        const sec = SECTIONS.find(x => x.id === s.section);
        if (sec?.priority !== priorityFilter) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (![s.name, s.url, s.data, s.use].join(" ").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [sectionFilter, accessFilter, countryFilter, priorityFilter, search]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const stats = useMemo(() => ({
    total: SOURCES.length,
    critical: SOURCES.filter(s => SECTIONS.find(x => x.id === s.section)?.priority === "CRITICAL").length,
    open: SOURCES.filter(s => s.access === "open").length,
    foia: SOURCES.filter(s => s.access === "foia").length,
    us: SOURCES.filter(s => s.country === "US").length,
    mx: SOURCES.filter(s => s.country === "MX").length,
  }), []);

  const runAI = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponse("");
    const sectionNames = SECTIONS.map(s => `${s.id}. ${s.name} (${s.count})`).join("; ");
    try {
      const res = await InvokeLLM({
        prompt: `TruthEngine360 has ${SOURCES.length} research sources across 22 sections: ${sectionNames}. Top 25 connector queue: ${CONNECTOR_QUEUE.map(c => c.name).join(", ")}. Researcher query: ${aiQuery}. Provide specific actionable guidance: database names, API strategies, cross-referencing paths, FOIA priority. Connect advice to DCAS anomaly, BISG methodology, or CHC briefing where applicable.`,
        system_prompt: "You are the TruthEngine360 database integration strategist for AUMER Foundation. Never fabricate data. Be precise and cite specific database names. DCAS anchor: 349 official Hispanic KIA vs 2,309 BISG estimate = 84.9% classification failure.",
        response_type: "text",
      });
      setAiResponse(typeof res === "string" ? res : res?.text || JSON.stringify(res));
    } catch (e) {
      setAiResponse("Query failed: " + e?.message);
    }
    setAiLoading(false);
  };

  const TABS = [
    { key: "sections", label: "22 SECTIONS" },
    { key: "sources",  label: `ALL ${SOURCES.length} SOURCES` },
    { key: "connectors", label: "CONNECTOR QUEUE" },
    { key: "ai",       label: "AI STRATEGY" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: P.bg, color: P.t1, fontFamily: "monospace" }}>
      {/* Header */}
      <div style={{ background: P.navy, borderBottom: `1px solid ${P.blue}33`, padding: "10px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: P.gold, letterSpacing: 1 }}>MASTER RESEARCH DATABASE INDEX</span>
          <span style={{ fontSize: 11, color: P.teal }}>565 Sources · 22 Sections</span>
          <span style={{ marginLeft: "auto", fontSize: 10, color: P.t3 }}>TruthEngine360 · AUMER Foundation</span>
        </div>
        {/* Stats */}
        <div style={{ display: "flex", gap: 20, marginBottom: 8, fontSize: 11 }}>
          {[
            { label: "TOTAL", val: stats.total, color: P.gold },
            { label: "CRITICAL", val: stats.critical, color: P.red },
            { label: "OPEN ACCESS", val: stats.open, color: P.teal },
            { label: "FOIA REQUIRED", val: stats.foia, color: P.red },
            { label: "US SOURCES", val: stats.us, color: P.blue },
            { label: "MEXICO SOURCES", val: stats.mx, color: P.gold },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <span style={{ fontSize: 9, color: P.t3 }}>{s.label}</span>
              <span style={{ fontWeight: 700, color: s.color }}>{s.val}</span>
            </div>
          ))}
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 2 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              background: tab === t.key ? P.blue + "22" : "transparent",
              border: "none", borderBottom: tab === t.key ? `2px solid ${P.gold}` : "2px solid transparent",
              color: tab === t.key ? P.gold : P.t3, fontSize: 11, fontFamily: "monospace",
              padding: "6px 14px", cursor: "pointer", letterSpacing: 0.5,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>

        {/* SECTIONS TAB */}
        {tab === "sections" && (
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
              {SECTIONS.map(s => (
                <div key={s.id} onClick={() => { setSectionFilter(s.id); setTab("sources"); setPage(0); }}
                  style={{
                    background: P.navy, border: `1px solid ${(PRIORITY_COLOR[s.priority] || P.blue)}33`,
                    borderRadius: 6, padding: "10px 14px", cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 9, color: P.t3, marginRight: 6 }}>§{s.id}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: P.t1 }}>{s.name}</span>
                    </div>
                    <Pill label={s.priority} color={PRIORITY_COLOR[s.priority] || P.blue} />
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: P.t3 }}>{COUNTRY_FLAG[s.country]} {s.country}</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: PRIORITY_COLOR[s.priority] || P.blue }}>{s.count}</span>
                    <span style={{ fontSize: 10, color: P.t3 }}>sources</span>
                    <span style={{ marginLeft: "auto", fontSize: 10, color: P.blue }}>Browse →</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Section priority breakdown */}
            <div style={{ background: P.navy, border: `1px solid ${P.blue}22`, borderRadius: 6, padding: "12px 14px", marginTop: 14 }}>
              <div style={{ fontSize: 11, color: P.gold, fontWeight: 700, marginBottom: 10 }}>SECTION PRIORITY DISTRIBUTION</div>
              {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map(p => {
                const secs = SECTIONS.filter(s => s.priority === p);
                const total = secs.reduce((a, s) => a + s.count, 0);
                if (!secs.length) return null;
                return (
                  <div key={p} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <Pill label={p} color={PRIORITY_COLOR[p]} />
                    <div style={{ flex: 1, background: P.b, borderRadius: 2, height: 6 }}>
                      <div style={{ width: `${(total / SOURCES.length) * 100}%`, background: PRIORITY_COLOR[p], height: 6, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 10, color: P.t2, width: 60, textAlign: "right" }}>{total} sources</span>
                    <span style={{ fontSize: 10, color: P.t3, width: 40, textAlign: "right" }}>{secs.length} sec</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SOURCES TAB */}
        {tab === "sources" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Filter bar */}
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${P.blue}22`, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", flexShrink: 0 }}>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
                placeholder="Search 565 sources…" style={{
                  background: P.bg, border: `1px solid ${P.blue}44`, borderRadius: 3,
                  color: P.t1, fontSize: 10, padding: "4px 10px", fontFamily: "monospace", width: 200,
                }} />
              <select value={sectionFilter} onChange={e => { setSectionFilter(+e.target.value); setPage(0); }} style={{
                background: P.bg, border: `1px solid ${P.blue}44`, borderRadius: 3, color: P.t2,
                fontSize: 10, padding: "4px 6px", fontFamily: "monospace",
              }}>
                <option value={0}>ALL SECTIONS</option>
                {SECTIONS.map(s => <option key={s.id} value={s.id}>§{s.id} {s.name}</option>)}
              </select>
              <select value={accessFilter} onChange={e => { setAccessFilter(e.target.value); setPage(0); }} style={{
                background: P.bg, border: `1px solid ${P.blue}44`, borderRadius: 3, color: P.t2,
                fontSize: 10, padding: "4px 6px", fontFamily: "monospace",
              }}>
                <option value="ALL">ALL ACCESS</option>
                {["open","key","foia","manual","sub"].map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
              </select>
              <select value={countryFilter} onChange={e => { setCountryFilter(e.target.value); setPage(0); }} style={{
                background: P.bg, border: `1px solid ${P.blue}44`, borderRadius: 3, color: P.t2,
                fontSize: 10, padding: "4px 6px", fontFamily: "monospace",
              }}>
                <option value="ALL">ALL COUNTRIES</option>
                <option value="US">US</option>
                <option value="MX">MX</option>
                <option value="INT">INT</option>
              </select>
              <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(0); }} style={{
                background: P.bg, border: `1px solid ${P.blue}44`, borderRadius: 3, color: P.t2,
                fontSize: 10, padding: "4px 6px", fontFamily: "monospace",
              }}>
                <option value="ALL">ALL PRIORITIES</option>
                {["CRITICAL","HIGH","MEDIUM","LOW"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <span style={{ marginLeft: "auto", fontSize: 10, color: P.t3 }}>
                {filtered.length} of {SOURCES.length} · Page {page + 1}/{totalPages || 1}
              </span>
            </div>

            {/* Table */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                <thead style={{ position: "sticky", top: 0, background: P.navy, zIndex: 2 }}>
                  <tr>
                    {["#", "SECTION", "SOURCE", "ACCESS", "COUNTRY", "DATA TYPE", "TE360 USE"].map(h => (
                      <th key={h} style={{ padding: "6px 10px", textAlign: "left", fontSize: 9, color: P.t3, fontWeight: 700, letterSpacing: 0.5, borderBottom: `1px solid ${P.blue}33` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((s, i) => {
                    const sec = SECTIONS.find(x => x.id === s.section);
                    return (
                      <tr key={s.n} style={{ borderBottom: `1px solid ${P.blue}15`, background: i % 2 === 0 ? "transparent" : P.navy + "80" }}>
                        <td style={{ padding: "5px 10px", color: P.t3, fontSize: 9 }}>{s.n}</td>
                        <td style={{ padding: "5px 10px", fontSize: 9 }}>
                          <Pill label={sec?.priority || "?"} color={PRIORITY_COLOR[sec?.priority] || P.t3} />
                          <div style={{ color: P.t3, fontSize: 8, marginTop: 2 }}>§{s.section}</div>
                        </td>
                        <td style={{ padding: "5px 10px", maxWidth: 240 }}>
                          <div style={{ color: P.t1, fontWeight: 600 }}>{s.name}</div>
                          <div style={{ fontSize: 9, color: P.blue, marginTop: 1 }}>{s.url}</div>
                        </td>
                        <td style={{ padding: "5px 10px" }}>
                          <Pill label={s.access.toUpperCase()} color={ACCESS_COLOR[s.access] || P.t3} />
                        </td>
                        <td style={{ padding: "5px 10px", fontSize: 10, color: P.t2 }}>
                          {COUNTRY_FLAG[s.country]} {s.country}
                        </td>
                        <td style={{ padding: "5px 10px", fontSize: 9, color: P.t2, maxWidth: 160 }}>{s.data}</td>
                        <td style={{ padding: "5px 10px", fontSize: 9, color: P.t3, maxWidth: 180 }}>{s.use}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: "8px 14px", borderTop: `1px solid ${P.blue}22`, display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                <button onClick={() => setPage(0)} disabled={page === 0} style={{ background: "transparent", border: `1px solid ${P.blue}44`, color: page === 0 ? P.t3 : P.blue, borderRadius: 3, padding: "3px 8px", cursor: page === 0 ? "default" : "pointer", fontSize: 10, fontFamily: "monospace" }}>«</button>
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ background: "transparent", border: `1px solid ${P.blue}44`, color: page === 0 ? P.t3 : P.blue, borderRadius: 3, padding: "3px 8px", cursor: page === 0 ? "default" : "pointer", fontSize: 10, fontFamily: "monospace" }}>‹</button>
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  const p = Math.max(0, Math.min(page - 3, totalPages - 7)) + i;
                  return (
                    <button key={p} onClick={() => setPage(p)} style={{
                      background: p === page ? P.blue + "33" : "transparent",
                      border: `1px solid ${p === page ? P.blue : P.blue + "33"}`,
                      color: p === page ? P.gold : P.t3, borderRadius: 3, padding: "3px 8px", cursor: "pointer", fontSize: 10, fontFamily: "monospace",
                    }}>{p + 1}</button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ background: "transparent", border: `1px solid ${P.blue}44`, color: page >= totalPages - 1 ? P.t3 : P.blue, borderRadius: 3, padding: "3px 8px", cursor: page >= totalPages - 1 ? "default" : "pointer", fontSize: 10, fontFamily: "monospace" }}>›</button>
                <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} style={{ background: "transparent", border: `1px solid ${P.blue}44`, color: page >= totalPages - 1 ? P.t3 : P.blue, borderRadius: 3, padding: "3px 8px", cursor: page >= totalPages - 1 ? "default" : "pointer", fontSize: 10, fontFamily: "monospace" }}>»</button>
                <span style={{ fontSize: 9, color: P.t3, marginLeft: 8 }}>
                  Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
              </div>
            )}
          </div>
        )}

        {/* CONNECTOR QUEUE TAB */}
        {tab === "connectors" && (
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            <div style={{ background: P.gold + "11", border: `1px solid ${P.gold}33`, borderRadius: 4, padding: "8px 14px", marginBottom: 14, fontSize: 11 }}>
              <span style={{ color: P.gold, fontWeight: 700 }}>Top 25 Priority Connectors</span>
              <span style={{ color: P.t2, marginLeft: 8 }}>APIs to build first for automated ingestion into TruthEngine360</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {CONNECTOR_QUEUE.map(c => (
                <div key={c.id} style={{ background: P.navy, border: `1px solid ${P.blue}33`, borderRadius: 6, padding: "10px 14px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: c.rank <= 5 ? P.red : c.rank <= 10 ? P.gold : P.teal, width: 28, flexShrink: 0 }}>{c.rank}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: P.t1 }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: P.blue, marginTop: 2, fontFamily: "monospace" }}>{c.api}</div>
                    <div style={{ marginTop: 6 }}>
                      <Pill label={c.auth === "None" ? "NO AUTH" : c.auth.toUpperCase()} color={c.auth === "None" ? P.teal : P.gold} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Access type breakdown of all 565 */}
            <div style={{ background: P.navy, border: `1px solid ${P.blue}22`, borderRadius: 6, padding: "12px 14px", marginTop: 14 }}>
              <div style={{ fontSize: 11, color: P.gold, fontWeight: 700, marginBottom: 10 }}>ACCESS TYPE DISTRIBUTION (All {SOURCES.length} Sources)</div>
              {["open","key","foia","manual","sub"].map(a => {
                const count = SOURCES.filter(s => s.access === a).length;
                return (
                  <div key={a} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <Pill label={a.toUpperCase()} color={ACCESS_COLOR[a] || P.t3} />
                    <div style={{ flex: 1, background: P.b, borderRadius: 2, height: 6 }}>
                      <div style={{ width: `${(count / SOURCES.length) * 100}%`, background: ACCESS_COLOR[a] || P.t3, height: 6, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 10, color: P.t2, width: 50, textAlign: "right" }}>{count}</span>
                    <span style={{ fontSize: 10, color: P.t3, width: 40, textAlign: "right" }}>{((count / SOURCES.length) * 100).toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI STRATEGY TAB */}
        {tab === "ai" && (
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            <div style={{ background: P.navy, border: `1px solid ${P.gold}33`, borderRadius: 6, padding: "12px 14px", marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: P.gold, fontWeight: 700, marginBottom: 6 }}>AI DATABASE INTEGRATION STRATEGIST</div>
              <div style={{ fontSize: 10, color: P.t3, marginBottom: 10 }}>
                Ask about cross-referencing paths, API ingestion priorities, FOIA targeting, or connector sequencing across all 565 sources.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={aiQuery} onChange={e => setAiQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && runAI()}
                  placeholder="e.g. How do I cross-reference NARA draft records with INEGI to identify Mexican-national Vietnam KIA?"
                  style={{
                    flex: 1, background: P.bg, border: `1px solid ${P.blue}44`, borderRadius: 3,
                    color: P.t1, fontSize: 10, padding: "6px 10px", fontFamily: "monospace", outline: "none",
                  }} />
                <button onClick={runAI} disabled={!aiQuery.trim() || aiLoading} style={{
                  background: P.gold + "22", border: `1px solid ${P.gold}`, color: P.gold,
                  fontSize: 10, padding: "6px 14px", borderRadius: 3, cursor: "pointer", fontFamily: "monospace",
                  opacity: aiLoading ? 0.5 : 1,
                }}>
                  {aiLoading ? "ANALYZING..." : "ASK →"}
                </button>
              </div>
            </div>

            {aiResponse && (
              <div style={{ background: P.navy, border: `1px solid ${P.blue}33`, borderRadius: 6, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, color: P.t3, marginBottom: 8 }}>AI RESPONSE</div>
                <div style={{ fontSize: 11, color: P.t2, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{aiResponse}</div>
              </div>
            )}

            {/* Quick prompts */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, color: P.t3, marginBottom: 8 }}>QUICK QUERY TEMPLATES</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  "Which 5 FOIA requests should be filed immediately for DCAS forensic support?",
                  "How do I cross-reference NARA DCAS records with INEGI surname data for BISG scoring?",
                  "Which Mexico federal databases have API access for automated ingestion?",
                  "Build a connector priority order for the Vietnam-era KIA misclassification audit",
                  "Which academic repositories have the best Chicano Vietnam-era coverage?",
                  "How do I use OpenAlex to identify researchers working on deported veteran cases?",
                ].map(q => (
                  <div key={q} onClick={() => setAiQuery(q)} style={{
                    background: P.navy, border: `1px solid ${P.blue}33`, borderRadius: 4,
                    padding: "8px 12px", cursor: "pointer", fontSize: 10, color: P.t2,
                    lineHeight: 1.4,
                  }}>
                    {q}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
