import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { P } from "../../lib/teData";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const EBSCO_SUBJECTS = [
  {
    id: "military", label: "Military History & Science", url: "https://www.ebsco.com/research-starters/military-history-and-science",
    count: 994, color: P.red,
    presets: [
      { label: "Form 102 / IV-C Classification", q: "Selective Service Form 102 classification IV-C alien non-citizen draft induction Vietnam era" },
      { label: "Non-Citizen Veterans", q: "non-citizen military service veterans naturalization immigration" },
      { label: "Vietnam-Era Casualties", q: "Vietnam War casualty records race ethnicity classification DoD DCAS undercount" },
      { label: "Veteran Deportation", q: "veteran deportation military service immigration enforcement IIRIRA" },
      { label: "Military Naturalization INA 329", q: "military naturalization INA section 329 wartime citizenship non-citizen service" },
      { label: "PTSD & Criminal Justice", q: "PTSD veterans criminal justice deportation mental health" },
    ]
  },
  {
    id: "law", label: "Law", url: "https://www.ebsco.com/research-starters/law",
    count: 2653, color: P.blue,
    presets: [
      { label: "IIRIRA Retroactivity", q: "IIRIRA 1996 retroactive application criminal grounds deportation veterans" },
      { label: "INA § 329 Rights", q: "INA 329 military naturalization rights non-citizen veteran wartime" },
      { label: "Conditional Citizenship", q: "conditional citizenship military service contract breach deportation retroactivity" },
      { label: "Due Process Deportation", q: "due process deportation removal proceedings veterans constitutional" },
      { label: "Citizenship Stripping", q: "denaturalization citizenship revocation military service grounds" },
      { label: "Habeas Corpus Veterans", q: "habeas corpus immigration detention veteran military service" },
    ]
  },
  {
    id: "history", label: "History", url: "https://www.ebsco.com/research-starters/history",
    count: 18160, color: P.gold,
    presets: [
      { label: "Vietnam-Era Race Classification", q: "Vietnam War race classification OMB Hispanic Latino DoD records 1964 1973" },
      { label: "White Folding — Administrative History", q: "racial category administrative records military white classification Mexican American" },
      { label: "Mexican-American WWII & Vietnam", q: "Mexican American World War II Vietnam military history sacrifice recognition" },
      { label: "Selective Service History", q: "Selective Service System history non-citizen draft Vietnam Korea alien classification" },
      { label: "NARA Records Declassification", q: "NARA military records declassification casualty archive race ethnicity" },
    ]
  },
  {
    id: "ethnic", label: "Ethnic & Cultural Studies", url: "https://www.ebsco.com/research-starters/ethnic-and-cultural-studies",
    count: 219, color: P.amber,
    presets: [
      { label: "Chicano Military Service", q: "Chicano Latino military service sacrifice Vietnam Korea undercounting BISG" },
      { label: "Hispanic Casualty Erasure", q: "Hispanic casualty data erasure military records racial misclassification White Folding" },
      { label: "Institutional Erasure Pattern", q: "institutional erasure minority veterans racial record-keeping military administrative" },
      { label: "Mexican-American Veterans", q: "Mexican American veterans civil rights discrimination military history" },
    ]
  },
  {
    id: "politics", label: "Politics & Government", url: "https://www.ebsco.com/research-starters/politics-and-government",
    count: 925, color: P.violet,
    presets: [
      { label: "Congressional Veterans Policy", q: "Congressional Hispanic Caucus veterans immigration policy advocacy briefing" },
      { label: "DHS ICE Accountability", q: "DHS ICE oversight accountability veteran deportation enforcement policy" },
      { label: "OMB Statistical Policy", q: "OMB statistical policy directive 15 Hispanic race ethnicity classification federal" },
    ]
  },
  {
    id: "social", label: "Social Sciences & Humanities", url: "https://www.ebsco.com/research-starters/social-sciences-and-humanities",
    count: 2367, color: P.teal,
    presets: [
      { label: "BISG Methodology", q: "Bayesian Improved Surname Geocoding BISG race ethnicity inference methodology validation" },
      { label: "Deportation & Family Impact", q: "deportation social impact family separation veteran immigrant community" },
      { label: "Citizenship & Belonging", q: "citizenship belonging military service Latino immigrant identity conditional" },
    ]
  },
];

const RESULT_SCHEMA = {
  type: "object",
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          authors: { type: "string" },
          year: { type: "string" },
          journal_or_source: { type: "string" },
          abstract_summary: { type: "string" },
          tldr: { type: "string" },
          key_findings: { type: "string" },
          ebsco_subject_area: { type: "string" },
          relevance_score: { type: "number" },
          relevance_note: { type: "string" },
          case_file_matches: { type: "string" },
          legal_citations: { type: "string" },
          policy_implications: { type: "string" },
          cluster_tags: { type: "string" },
          url: { type: "string" },
        }
      }
    },
    search_summary: { type: "string" },
    ebsco_subject_used: { type: "string" },
    cross_reference_notes: { type: "string" },
  }
};

// ─── HELPERS ────────────────────────────────────────────────────────────────

const SC = s => s >= 8 ? P.red : s >= 6 ? P.amber : s >= 4 ? P.gold : P.teal;

function Tag({ color, children }) {
  return (
    <span style={{ fontSize: 7, padding: "2px 7px", borderRadius: 12, fontWeight: 700,
      background: `${color}15`, border: `1px solid ${color}30`, color }}>
      {children}
    </span>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function EBSCOResearchStarters() {
  const [activeSubject, setActiveSubject] = useState("military");
  const [query, setQuery] = useState("");
  const [maxResults, setMaxResults] = useState(6);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState(new Set());
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [cases, setCases] = useState([]);
  const [crossRefLoading, setCrossRefLoading] = useState(false);
  const [crossRefResult, setCrossRefResult] = useState(null);

  const subject = EBSCO_SUBJECTS.find(s => s.id === activeSubject);

  useEffect(() => {
    base44.entities.CaseFile.list("-created_date", 50).then(setCases).catch(() => {});
  }, []);

  async function runSearch(q) {
    const searchQ = q || query;
    if (!searchQ.trim()) return;
    setLoading(true); setResults(null); setExpandedIdx(null); setCrossRefResult(null);

    const caseContext = cases.slice(0, 10).map(c =>
      `Case ${c.case_id}: ${c.subject_name} | ${c.service_branch || "?"} | ${c.service_years || "?"} | Deportation: ${c.deportation_confirmed ? "Yes" : "No"} | DCAS: ${c.dcas_match ? "Yes" : "No"} | Summary: ${(c.summary || "").slice(0, 120)}`
    ).join("\n");

    const prompt = `You are a forensic research analyst for the AUMER Foundation. Search the EBSCO Research Starters database (${subject.label} subject area — ${subject.url}) and related academic sources for: "${searchQ}"

EBSCO Subject Area: ${subject.label}
Max results: ${maxResults}

Active Case Files for Cross-Reference:
${caseContext || "No case files available."}

For each result, provide:
- title (full academic title)
- authors (comma-separated)
- year of publication
- journal_or_source (EBSCO Research Starters, journal, or publisher name)
- abstract_summary (3–4 sentences summarizing the work)
- tldr (1 punchy sentence)
- key_findings (what the study proves, quotes if possible)
- ebsco_subject_area (exact EBSCO subject category from: ${subject.label})
- relevance_score (1–10 to AUMER's deported veteran / Hispanic casualty research)
- relevance_note (why this matters to the case files above)
- case_file_matches (list any case IDs from the context above that this research directly supports — e.g. "CF-001, CF-002" — or "None")
- legal_citations (relevant statutes, regulations, or case law referenced)
- policy_implications (what Congress or DHS should do based on this research)
- cluster_tags (comma-separated keywords)
- url (EBSCO or DOI link if known, otherwise Google Scholar URL)

Return results sorted by relevance_score descending.
Also provide a search_summary, ebsco_subject_used, and cross_reference_notes explaining how the findings connect to the active case files.`;

    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: RESULT_SCHEMA,
      model: "gemini_3_1_pro",
    });
    setResults(res);
    setLoading(false);
  }

  async function saveToDb(item, idx) {
    setSaving(p => ({ ...p, [idx]: true }));
    await base44.entities.ResearchDoc.create({
      title: item.title,
      tldr: item.tldr,
      findings: item.key_findings,
      summarized_abstract: item.abstract_summary,
      results: `Authors: ${item.authors || "—"} (${item.year || "—"}) · Source: ${item.journal_or_source || "—"}`,
      practical_implications: item.policy_implications,
      relevance_score: item.relevance_score,
      cluster_tags: `${item.cluster_tags},EBSCO,${subject.label}`,
      conclusions: item.relevance_note,
      source_url: item.url || `https://www.ebsco.com/research-starters/${activeSubject.replace("_", "-")}`,
    });
    setSaved(p => new Set([...p, idx]));
    setSaving(p => ({ ...p, [idx]: false }));
  }

  async function runCrossRef() {
    if (!results?.results?.length) return;
    setCrossRefLoading(true);
    const titles = results.results.map(r => r.title).join("; ");
    const caseList = cases.map(c => `${c.case_id}: ${c.subject_name}`).join(", ");
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Cross-reference these EBSCO research findings: [${titles}] with these active case files: [${caseList}].
For each case file that has a relevant academic match, explain precisely which findings apply and how they strengthen the evidentiary record or legal argument. Format as a structured analysis with case IDs as headings.`,
      add_context_from_internet: false,
    });
    setCrossRefResult(res);
    setCrossRefLoading(false);
  }

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: P.t1, padding: "24px 28px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 4 }}>
          ACADEMIC INTELLIGENCE · EBSCO RESEARCH STARTERS
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: P.t1, margin: 0 }}>
          EBSCO Research Starters <span style={{ color: subject.color }}>Integration</span>
        </h1>
        <p style={{ fontSize: 10, color: P.t3, marginTop: 5, lineHeight: 1.5 }}>
          Live academic synthesis from EBSCO's curated subject databases · Auto-cross-reference with active case files · Save to ResearchDoc vault
        </p>
      </div>

      {/* Subject selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {EBSCO_SUBJECTS.map(s => (
          <button key={s.id} onClick={() => { setActiveSubject(s.id); setResults(null); setQuery(""); }}
            style={{ padding: "8px 16px", fontSize: 10, fontWeight: 800, cursor: "pointer",
              background: activeSubject === s.id ? `${s.color}22` : "transparent",
              border: `1px solid ${activeSubject === s.id ? s.color : P.b}`,
              color: activeSubject === s.id ? s.color : P.t4, borderRadius: 8,
              fontFamily: "'IBM Plex Mono', monospace" }}>
            {s.label}
            <span style={{ fontSize: 8, marginLeft: 6, opacity: 0.6 }}>({s.count.toLocaleString()})</span>
          </button>
        ))}
        <a href={subject.url} target="_blank" rel="noreferrer"
          style={{ marginLeft: "auto", padding: "8px 14px", fontSize: 9, color: P.blue,
            border: `1px solid ${P.blue}35`, borderRadius: 8, textDecoration: "none",
            display: "flex", alignItems: "center", gap: 5 }}>
          🔗 Open EBSCO
        </a>
      </div>

      {/* Preset queries */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 8, color: P.t4, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>
          {subject.label} — Quick Searches
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {subject.presets.map((p, i) => (
            <button key={i} onClick={() => { setQuery(p.q); runSearch(p.q); }}
              style={{ padding: "4px 12px", fontSize: 8, background: `${subject.color}12`,
                border: `1px solid ${subject.color}30`, color: subject.color, borderRadius: 20,
                cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && runSearch()}
          placeholder={`Search EBSCO ${subject.label} — e.g. "veteran deportation INA 329 due process"`}
          style={{ flex: 1, minWidth: 300, padding: "9px 14px", background: "#080D18",
            border: `1px solid ${subject.color}50`, borderRadius: 8, color: P.t1,
            fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", outline: "none" }} />
        <select value={maxResults} onChange={e => setMaxResults(Number(e.target.value))}
          style={{ padding: "8px", background: "#080D18", border: `1px solid ${P.b}`, borderRadius: 6,
            color: P.t1, fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", outline: "none" }}>
          {[4, 6, 8, 10].map(n => <option key={n} value={n}>{n} results</option>)}
        </select>
        <button onClick={() => runSearch()} disabled={loading || !query.trim()}
          style={{ padding: "9px 20px", background: loading ? P.b : `linear-gradient(135deg,${subject.color},${P.blue})`,
            color: loading ? P.t4 : "#fff", border: "none", borderRadius: 8, fontSize: 11,
            fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'IBM Plex Mono', monospace" }}>
          {loading ? "⟳ Searching EBSCO..." : "🔍 Search EBSCO"}
        </button>
      </div>

      {/* Case file context indicator */}
      <div style={{ marginBottom: 14, padding: "8px 14px", background: `${P.teal}08`,
        border: `1px solid ${P.teal}25`, borderRadius: 8, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 9, color: P.teal, fontWeight: 800 }}>⚖ Cross-Reference Ready</span>
        <span style={{ fontSize: 9, color: P.t3 }}>
          {cases.length > 0
            ? `${cases.length} active case files loaded — results will auto-match to ${cases.slice(0, 5).map(c => c.case_id).join(", ")}${cases.length > 5 ? " +" : ""}`
            : "No case files found — create case files in Evidence Linker to enable cross-referencing"}
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ background: P.card, border: `1px solid ${subject.color}30`, borderRadius: 10, padding: 30, textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>📚</div>
          <div style={{ fontSize: 11, color: subject.color, fontWeight: 700, marginBottom: 4 }}>Querying EBSCO Research Starters…</div>
          <div style={{ fontSize: 8, color: P.t4 }}>Synthesizing {subject.label} literature · Cross-referencing {cases.length} case files · Extracting policy implications</div>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div>
          {/* Summary bar */}
          <div style={{ background: P.card, border: `1px solid ${subject.color}30`, borderRadius: 10,
            padding: "12px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: subject.color }}>✓ {results.results?.length || 0} Results</span>
              <span style={{ fontSize: 8, color: P.t4, marginLeft: 12 }}>{results.search_summary}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={runCrossRef} disabled={crossRefLoading}
                style={{ padding: "6px 14px", background: `${P.teal}18`, border: `1px solid ${P.teal}35`,
                  color: P.teal, borderRadius: 6, fontSize: 8, fontWeight: 800, cursor: "pointer",
                  fontFamily: "'IBM Plex Mono', monospace" }}>
                {crossRefLoading ? "⟳ Cross-Referencing..." : "⚖ Run Case Cross-Reference"}
              </button>
              <button onClick={async () => { for (let i = 0; i < results.results.length; i++) if (!saved.has(i)) await saveToDb(results.results[i], i); }}
                style={{ padding: "6px 14px", background: `${P.violet}18`, border: `1px solid ${P.violet}30`,
                  color: P.violet, borderRadius: 6, fontSize: 8, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'IBM Plex Mono', monospace" }}>
                💾 Save All
              </button>
            </div>
          </div>

          {/* Cross-reference result */}
          {crossRefResult && (
            <div style={{ background: `${P.teal}08`, border: `1px solid ${P.teal}35`, borderLeft: `4px solid ${P.teal}`,
              borderRadius: 10, padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: P.teal, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.15em" }}>
                ⚖ Case File Cross-Reference Analysis
              </div>
              <pre style={{ fontSize: 9, color: P.t2, lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "'IBM Plex Mono', monospace", margin: 0 }}>
                {crossRefResult}
              </pre>
            </div>
          )}

          {/* Cross-reference notes from search */}
          {results.cross_reference_notes && (
            <div style={{ background: `${P.gold}08`, border: `1px solid ${P.gold}30`, borderRadius: 8,
              padding: "10px 14px", marginBottom: 14, fontSize: 9, color: P.t2, lineHeight: 1.7 }}>
              <strong style={{ color: P.gold }}>Auto Cross-Ref: </strong>{results.cross_reference_notes}
            </div>
          )}

          {/* Paper cards */}
          {results.results?.map((item, idx) => {
            const sc = SC(item.relevance_score || 0);
            const isOpen = expandedIdx === idx;
            const isSaved = saved.has(idx);
            const hasMatches = item.case_file_matches && item.case_file_matches !== "None" && item.case_file_matches.trim();

            return (
              <div key={idx} style={{ background: P.card, border: `1px solid ${sc}25`,
                borderLeft: `5px solid ${sc}`, borderRadius: 10, padding: "12px 16px",
                marginBottom: 10 }}>
                {/* Top row */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontSize: 8, color: P.t4, flexShrink: 0, marginTop: 2 }}>#{idx + 1}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: P.t1, lineHeight: 1.4 }}>{item.title}</span>
                    </div>
                    <div style={{ fontSize: 8, color: P.t3 }}>
                      {item.authors} · {item.year}
                      {item.journal_or_source && <em style={{ color: P.blue, marginLeft: 6 }}>· {item.journal_or_source}</em>}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: sc, lineHeight: 1 }}>
                      {item.relevance_score}<span style={{ fontSize: 9, color: P.t4 }}>/10</span>
                    </div>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button onClick={() => setExpandedIdx(isOpen ? null : idx)}
                        style={{ padding: "3px 8px", background: "transparent", border: `1px solid ${P.b}`,
                          borderRadius: 5, color: P.t4, fontSize: 7, cursor: "pointer",
                          fontFamily: "'IBM Plex Mono', monospace" }}>
                        {isOpen ? "▲" : "▼"}
                      </button>
                      <button onClick={() => saveToDb(item, idx)} disabled={saving[idx] || isSaved}
                        style={{ padding: "3px 8px",
                          background: isSaved ? `${P.teal}18` : `${P.violet}12`,
                          border: `1px solid ${isSaved ? P.teal : P.violet}30`,
                          color: isSaved ? P.teal : P.violet, borderRadius: 5, fontSize: 7,
                          cursor: isSaved ? "default" : "pointer",
                          fontFamily: "'IBM Plex Mono', monospace" }}>
                        {saving[idx] ? "⟳" : isSaved ? "✓" : "💾"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* TL;DR */}
                {item.tldr && (
                  <div style={{ fontSize: 9, color: P.gold, marginBottom: 6 }}>💡 {item.tldr}</div>
                )}

                {/* Case match badge */}
                {hasMatches && (
                  <div style={{ marginBottom: 6 }}>
                    <Tag color={P.teal}>⚖ Case Match: {item.case_file_matches}</Tag>
                  </div>
                )}

                {/* Tags */}
                {item.cluster_tags && (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {item.cluster_tags.split(",").map(t => t.trim()).filter(Boolean).map((tag, i) => (
                      <Tag key={i} color={subject.color}>{tag}</Tag>
                    ))}
                  </div>
                )}

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${P.b}30` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {[
                        ["Abstract", item.abstract_summary, P.t2],
                        ["Key Findings", item.key_findings, P.teal],
                        ["Relevance to AUMER Cases", item.relevance_note, sc],
                        ["Legal Citations", item.legal_citations, P.blue],
                        ["Policy Implications", item.policy_implications, P.gold],
                        ["Case File Matches", item.case_file_matches, P.teal],
                      ].filter(([, v]) => v && v !== "None").map(([label, text, c]) => (
                        <div key={label} style={{ background: "#080D18", borderRadius: 7, padding: "8px 10px" }}>
                          <div style={{ fontSize: 7, color: P.t4, letterSpacing: 1, marginBottom: 3, textTransform: "uppercase" }}>{label}</div>
                          <div style={{ fontSize: 9, color: c, lineHeight: 1.7 }}>{text}</div>
                        </div>
                      ))}
                    </div>
                    {item.url && (
                      <div style={{ marginTop: 8 }}>
                        <a href={item.url} target="_blank" rel="noreferrer"
                          style={{ fontSize: 8, color: P.blue, textDecoration: "none" }}>
                          🔗 {item.url}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && !results && (
        <div style={{ textAlign: "center", padding: 40, border: `1px dashed ${P.b}`, borderRadius: 10, color: P.t4 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📖</div>
          <div style={{ fontSize: 11, marginBottom: 4 }}>Select a quick search above or enter a custom query</div>
          <div style={{ fontSize: 9 }}>Results will automatically cross-reference against your {cases.length} active case files</div>
        </div>
      )}
    </div>
  );
}