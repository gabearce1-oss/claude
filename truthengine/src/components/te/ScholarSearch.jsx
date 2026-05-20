import { useState } from "react";
import { P } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

const PRESET_QUERIES = [
  { label:"Hispanic Vietnam Veterans", q:"Hispanic Latino Vietnam War veterans casualties DCAS classification undercount" },
  { label:"Deported Veterans", q:"deported veterans immigration deportation military service non-citizen" },
  { label:"BISG Methodology", q:"Bayesian Improved Surname Geocoding BISG race ethnicity classification accuracy" },
  { label:"IIRIRA 1996 Veterans", q:"IIRIRA 1996 immigration reform retroactive veterans deportation criminal grounds" },
  { label:"ICE Veterans Policy", q:"ICE ERO veteran status deportation prosecutorial discretion military service" },
  { label:"Vietnam Casualty Race", q:"Vietnam War casualty race ethnicity misclassification DCAS DoD records" },
  { label:"Non-Citizen Military", q:"non-citizen veterans naturalization military service INA 329 wartime" },
  { label:"NERO Erasure Framework", q:"institutional erasure minority veterans racial project citizenship military" },
];

const FIELD_SCHEMA = {
  type: "object",
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title:                { type:"string" },
          authors:              { type:"string" },
          year:                 { type:"string" },
          journal:              { type:"string" },
          abstract:             { type:"string" },
          tldr:                 { type:"string" },
          findings:             { type:"string" },
          methods_used:         { type:"string" },
          relevance_score:      { type:"number" },
          relevance_note:       { type:"string" },
          scholar_url:          { type:"string" },
          citation_count:       { type:"string" },
          dataset:              { type:"string" },
          limitations:          { type:"string" },
          practical_implications:{ type:"string" },
          cluster_tags:         { type:"string" },
        }
      }
    },
    search_summary: { type:"string" },
    total_found:    { type:"number" },
  }
};

const SEV_C = (score) => score >= 8 ? P.red : score >= 6 ? P.amber : score >= 4 ? P.gold : P.teal;

export default function ScholarSearch() {
  const [query, setQuery] = useState("");
  const [yearFrom, setYearFrom] = useState("1990");
  const [yearTo, setYearTo] = useState("2026");
  const [maxResults, setMaxResults] = useState(8);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState(new Set());
  const [error, setError] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(null);

  const runSearch = async (q) => {
    const searchQ = q || query;
    if (!searchQ.trim()) return;
    setLoading(true); setError(null); setResults(null); setExpandedIdx(null);

    const prompt = `You are a forensic academic research assistant for the AUMER Foundation, researching deported veterans, Hispanic military casualties, and institutional erasure.

Search Google Scholar and academic databases for the query: "${searchQ}"
Year range: ${yearFrom}–${yearTo}
Return up to ${maxResults} highly relevant academic papers, books, or government reports.

For each result provide:
- Full title
- Authors (comma separated)
- Publication year
- Journal or publisher name
- Detailed abstract (3-5 sentences)
- TL;DR (1 sentence)
- Key findings relevant to veteran deportation or Hispanic military history
- Research methods used
- Relevance score 1-10 to AUMER's research on deported veterans and Hispanic casualty undercounting
- Why it's relevant (relevance_note)
- Google Scholar URL if you know it (scholar.google.com/scholar?q=...)
- Approximate citation count if known
- Dataset used in the study
- Study limitations
- Practical implications for policy or advocacy
- Cluster tags (comma-separated keywords): e.g. "BISG,deportation,Vietnam,IIRIRA,NERO"

Focus on: veteran deportation, Hispanic/Latino military service, BISG methodology, DCAS casualty data, IIRIRA 1996 impact, ICE enforcement, naturalization barriers, institutional racism in military records.

Return results sorted by relevance score descending.`;

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: FIELD_SCHEMA,
        model: "gemini_3_1_pro",
      });
      setResults(res);
    } catch(e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const saveToDb = async (item, idx) => {
    setSaving(p => ({...p, [idx]: true}));
    try {
      await base44.entities.ResearchDoc.create({
        title: item.title,
        tldr: item.tldr,
        findings: item.findings,
        methods_used: item.methods_used,
        summarized_abstract: item.abstract,
        results: `Authors: ${item.authors} (${item.year}) · Journal: ${item.journal} · Citations: ${item.citation_count||"unknown"}`,
        dataset: item.dataset,
        limitations: item.limitations,
        practical_implications: item.practical_implications,
        relevance_score: item.relevance_score,
        cluster_tags: item.cluster_tags,
        source_url: item.scholar_url || `https://scholar.google.com/scholar?q=${encodeURIComponent(item.title)}`,
        conclusions: item.relevance_note,
      });
      setSaved(p => new Set([...p, idx]));
    } catch(e) { console.error(e); }
    setSaving(p => ({...p, [idx]: false}));
  };

  const saveAll = async () => {
    if (!results?.results) return;
    for (let i=0; i<results.results.length; i++) {
      if (!saved.has(i)) await saveToDb(results.results[i], i);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ background:P.card, border:`1px solid ${P.violet}30`, borderRadius:10, padding:"12px 16px", marginBottom:12 }}>
        <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
          <div style={{ background:`linear-gradient(135deg,${P.violet},${P.blue})`, borderRadius:6, padding:"4px 8px", fontSize:10, fontWeight:800, color:"#fff" }}>
            SCHOLAR
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:800, color:P.t1 }}>Google Scholar <span style={{ color:P.violet }}>Live Search</span></div>
            <div style={{ fontSize:7, color:P.t4 }}>AI-POWERED ACADEMIC SEARCH · SAVES TO RESEARCHDOC DATABASE · POWERED BY GEMINI + INTERNET</div>
          </div>
        </div>

        {/* Preset buttons */}
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
          {PRESET_QUERIES.map((p,i) => (
            <button key={i} onClick={() => { setQuery(p.q); runSearch(p.q); }}
              style={{ padding:"3px 10px", background:`${P.violet}12`, border:`1px solid ${P.violet}25`,
                color:P.violet, borderRadius:20, fontSize:7, cursor:"pointer" }}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <input value={query} onChange={e=>setQuery(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&runSearch()}
            placeholder='e.g. "deported veterans IIRIRA Hispanic military" — press Enter or click Search'
            style={{ flex:1, minWidth:300, padding:"9px 14px", background:"#080D18",
              border:`1px solid ${P.violet}50`, borderRadius:8, color:P.t1,
              fontSize:10, fontFamily:"'IBM Plex Mono',monospace", outline:"none" }} />
          <div style={{ display:"flex", gap:5, alignItems:"center" }}>
            <span style={{ fontSize:7, color:P.t4 }}>Year:</span>
            <input value={yearFrom} onChange={e=>setYearFrom(e.target.value)} style={{ width:50, padding:"5px 6px", background:"#080D18", border:`1px solid ${P.b}`, borderRadius:6, color:P.t1, fontSize:8, fontFamily:"'IBM Plex Mono',monospace", outline:"none", textAlign:"center" }} />
            <span style={{ fontSize:7, color:P.t4 }}>–</span>
            <input value={yearTo} onChange={e=>setYearTo(e.target.value)} style={{ width:50, padding:"5px 6px", background:"#080D18", border:`1px solid ${P.b}`, borderRadius:6, color:P.t1, fontSize:8, fontFamily:"'IBM Plex Mono',monospace", outline:"none", textAlign:"center" }} />
            <select value={maxResults} onChange={e=>setMaxResults(Number(e.target.value))}
              style={{ padding:"5px 8px", background:"#080D18", border:`1px solid ${P.b}`, borderRadius:6, color:P.t1, fontSize:8, fontFamily:"'IBM Plex Mono',monospace", outline:"none" }}>
              {[4,6,8,10,12].map(n=><option key={n} value={n}>{n} results</option>)}
            </select>
          </div>
          <button onClick={() => runSearch()} disabled={loading||!query.trim()}
            style={{ padding:"9px 18px", background: loading?P.b:`linear-gradient(135deg,${P.violet},${P.blue})`,
              color: loading?P.t4:"#fff", border:"none", borderRadius:8, fontSize:11,
              fontWeight:800, cursor: loading?"not-allowed":"pointer", fontFamily:"'IBM Plex Mono',monospace" }}>
            {loading ? "⟳ Searching..." : "🔍 Search Scholar"}
          </button>
        </div>
      </div>

      {/* Note about model */}
      {!loading && !results && (
        <div style={{ background:`${P.blue}08`, border:`1px solid ${P.blue}20`, borderRadius:8, padding:"10px 14px", marginBottom:10, fontSize:8, color:P.t3 }}>
          ℹ Uses <strong style={{ color:P.violet }}>Gemini Pro + Live Internet</strong> to query academic literature. Results are AI-synthesized from real scholarly sources and saved to your ResearchDoc database. Each search uses additional integration credits.
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ background:P.card, border:`1px solid ${P.violet}30`, borderRadius:10, padding:"30px", textAlign:"center" }}>
          <div style={{ fontSize:24, marginBottom:10 }}>🔬</div>
          <div style={{ fontSize:11, color:P.violet, fontWeight:700, marginBottom:4 }}>Searching Google Scholar...</div>
          <div style={{ fontSize:8, color:P.t4 }}>Querying live academic sources · Extracting forensic-relevant findings · Scoring relevance to AUMER research</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background:`${P.red}08`, border:`1px solid ${P.red}30`, borderRadius:8, padding:"10px 14px", fontSize:9, color:P.red }}>
          ⚠ {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div>
          {/* Summary bar */}
          <div style={{ background:P.card, border:`1px solid ${P.teal}30`, borderRadius:10, padding:"10px 14px", marginBottom:10,
            display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, flexWrap:"wrap" }}>
            <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
              <span style={{ fontSize:10, fontWeight:700, color:P.teal }}>✓ {results.results?.length || 0} Papers Found</span>
              <span style={{ fontSize:8, color:P.t4 }}>{results.search_summary}</span>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <span style={{ fontSize:8, color:P.t4 }}>{saved.size} saved</span>
              <button onClick={saveAll}
                style={{ padding:"5px 12px", background:`${P.violet}18`, border:`1px solid ${P.violet}30`,
                  color:P.violet, borderRadius:6, fontSize:8, fontWeight:700, cursor:"pointer" }}>
                💾 Save All to DB
              </button>
            </div>
          </div>

          {/* Paper cards */}
          {results.results?.map((item, idx) => {
            const sc = SEV_C(item.relevance_score || 0);
            const isOpen = expandedIdx === idx;
            const isSaved = saved.has(idx);
            return (
              <div key={idx} style={{ background:P.card, border:`1px solid ${sc}25`,
                borderLeft:`5px solid ${sc}`, borderRadius:10, padding:"12px 14px",
                marginBottom:8, transition:"all .12s" }}>
                {/* Top row */}
                <div style={{ display:"flex", justifyContent:"space-between", gap:10, marginBottom:6 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"flex-start", flexWrap:"wrap" }}>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:P.t4, flexShrink:0, marginTop:2 }}>#{idx+1}</span>
                      <span style={{ fontSize:10, fontWeight:800, color:P.t1, lineHeight:1.4 }}>{item.title}</span>
                    </div>
                    <div style={{ fontSize:8, color:P.t3, marginTop:3 }}>
                      {item.authors} · {item.year} · <em style={{ color:P.blue }}>{item.journal}</em>
                      {item.citation_count && <span style={{ color:P.t4, marginLeft:8 }}>🗣 {item.citation_count} citations</span>}
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5, flexShrink:0 }}>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:800, color:sc, lineHeight:1 }}>
                      {item.relevance_score}<span style={{ fontSize:9, color:P.t4 }}>/10</span>
                    </div>
                    <div style={{ display:"flex", gap:5 }}>
                      <button onClick={() => setExpandedIdx(isOpen ? null : idx)}
                        style={{ padding:"3px 8px", background:"transparent", border:`1px solid ${P.b}`,
                          borderRadius:5, color:P.t4, fontSize:7, cursor:"pointer" }}>
                        {isOpen ? "Collapse ▲" : "Details ▼"}
                      </button>
                      <button onClick={() => saveToDb(item, idx)} disabled={saving[idx] || isSaved}
                        style={{ padding:"3px 8px",
                          background: isSaved?`${P.teal}18`:`${P.violet}12`,
                          border:`1px solid ${isSaved?P.teal:P.violet}30`,
                          color: isSaved?P.teal:P.violet, borderRadius:5, fontSize:7, cursor: isSaved?"default":"pointer" }}>
                        {saving[idx] ? "⟳" : isSaved ? "✓ Saved" : "💾 Save"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* TL;DR */}
                <div style={{ fontSize:8, color:P.gold, fontWeight:600, marginBottom:4 }}>
                  💡 {item.tldr}
                </div>

                {/* Tags */}
                {item.cluster_tags && (
                  <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:6 }}>
                    {item.cluster_tags.split(",").map(t=>t.trim()).filter(Boolean).map((tag,i)=>(
                      <span key={i} style={{ fontSize:6, background:`${P.violet}10`, border:`1px solid ${P.violet}20`,
                        color:P.violet, borderRadius:20, padding:"1px 6px" }}>{tag}</span>
                    ))}
                  </div>
                )}

                {/* Expanded */}
                {isOpen && (
                  <div style={{ marginTop:8, paddingTop:8, borderTop:`1px solid ${P.b}30` }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      {[
                        ["Abstract", item.abstract, P.t2],
                        ["Key Findings", item.findings, P.teal],
                        ["Methods", item.methods_used, P.blue],
                        ["Relevance to AUMER", item.relevance_note, sc],
                        ["Dataset", item.dataset, P.violet],
                        ["Limitations", item.limitations, P.amber],
                        ["Policy Implications", item.practical_implications, P.gold],
                      ].filter(([,v])=>v).map(([label,text,c])=>(
                        <div key={label} style={{ background:"#080D18", borderRadius:7, padding:"8px 10px" }}>
                          <div style={{ fontSize:7, color:P.t4, letterSpacing:1, marginBottom:3 }}>{label.toUpperCase()}</div>
                          <div style={{ fontSize:8, color:c, lineHeight:1.7 }}>{text}</div>
                        </div>
                      ))}
                    </div>
                    {item.scholar_url && (
                      <div style={{ marginTop:8, fontSize:7 }}>
                        <a href={item.scholar_url} target="_blank" rel="noreferrer"
                          style={{ color:P.blue, textDecoration:"none" }}>
                          🔗 {item.scholar_url}
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
    </div>
  );
}