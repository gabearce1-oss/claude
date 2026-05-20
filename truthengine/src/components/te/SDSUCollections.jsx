import { useState } from "react";
import { P } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

const BASE_URL = "https://digitalcollections.sdsu.edu";
const COLLECTION_URL = `${BASE_URL}/search_grid?search_api_fulltext=&f%5B0%5D=descriptive_metadata_subjects%3AVietnam%20War&f%5B1%5D=type_genre%3AText&page=1`;

const PRESET_QUERIES = [
  { label:"Hispanic Vietnam Veterans",  q:"Hispanic Latino Vietnam War veterans" },
  { label:"Chicano Anti-War Movement",  q:"Chicano Moratorium anti-war protest Vietnam" },
  { label:"Draft & Selective Service",  q:"draft selective service Vietnam War minority" },
  { label:"Medal of Honor Recipients",  q:"Medal of Honor Vietnam Hispanic Latino" },
  { label:"POW/MIA Records",            q:"POW MIA Vietnam War prisoners missing" },
  { label:"CA Veterans Oral History",   q:"California Vietnam veteran oral history testimony" },
  { label:"Border Region Soldiers",     q:"border San Diego Tijuana Vietnam military" },
  { label:"Congressional Records",      q:"Congress Vietnam War hearings legislation veterans" },
];

const RESULT_SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title:            { type: "string" },
          creator:          { type: "string" },
          date:             { type: "string" },
          description:      { type: "string" },
          subjects:         { type: "string" },
          type_genre:       { type: "string" },
          collection:       { type: "string" },
          sdsu_url:         { type: "string" },
          tldr:             { type: "string" },
          aumer_relevance:  { type: "string" },
          relevance_score:  { type: "number" },
          cluster_tags:     { type: "string" },
        }
      }
    },
    total_estimated: { type: "number" },
    search_note:     { type: "string" },
  }
};

const RC = (score) => score >= 8 ? P.red : score >= 6 ? P.amber : score >= 4 ? P.gold : P.teal;

export default function SDSUCollections() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState(new Set());

  const buildSDSUUrl = (q, pg = 1) => {
    const params = new URLSearchParams();
    if (q) params.set("search_api_fulltext", q);
    params.append("f[0]", "descriptive_metadata_subjects:Vietnam War");
    params.append("f[1]", "type_genre:Text");
    params.set("page", pg);
    return `${BASE_URL}/search_grid?${params.toString()}`;
  };

  const runSearch = async (q, pg = 1) => {
    const searchQ = q || query;
    setLoading(true); setError(null); setResults(null); setExpanded(null);

    const searchUrl = buildSDSUUrl(searchQ, pg);

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a digital archivist and forensic research assistant for the AUMER Foundation.

Search the SDSU Digital Collections — Vietnam War Text archive at:
${searchUrl}

The collection is at San Diego State University and contains digitized primary sources, manuscripts, oral histories, government documents, photographs, and ephemera related to the Vietnam War, with particular coverage of the US-Mexico border region, Chicano/Latino communities, California veterans, and anti-war movements.

Query: "${searchQ || "Vietnam War Hispanic Latino veterans"}"

Find and return up to 10 relevant items from this collection. For each item provide:
- Title of the document/item
- Creator/Author
- Date (year or range)
- Description (2-3 sentences)
- Subjects/tags from the collection
- Type/genre of material
- Collection name within SDSU
- Direct SDSU URL (e.g. https://digitalcollections.sdsu.edu/do/...)
- TL;DR — one sentence relevance summary
- Why it is relevant to AUMER's research on deported veterans / Hispanic casualty undercounting (aumer_relevance)
- Relevance score 1–10 to AUMER's mission
- Cluster tags (comma-separated): e.g. "Chicano,Vietnam,oral history,California,Border"

Focus especially on: Chicano/Latino veteran records, border region documents, anti-war movement materials, oral histories, congressional testimonies, casualty records, and civil rights–military intersections.

Return results sorted by relevance score descending. Include the estimated total items matching this query in the collection.`,
        add_context_from_internet: true,
        response_json_schema: RESULT_SCHEMA,
        model: "gemini_3_1_pro",
      });
      setResults(res);
      setPage(pg);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const saveToDb = async (item, idx) => {
    setSaving(p => ({ ...p, [idx]: true }));
    try {
      await base44.entities.ResearchDoc.create({
        title: item.title,
        tldr: item.tldr,
        summarized_abstract: item.description,
        results: `Creator: ${item.creator} · Date: ${item.date} · Genre: ${item.type_genre} · Collection: ${item.collection}`,
        findings: item.aumer_relevance,
        cluster_tags: item.cluster_tags,
        relevance_score: item.relevance_score,
        source_url: item.sdsu_url || buildSDSUUrl(query, page),
        dataset: `SDSU Digital Collections — ${item.collection}`,
        practical_implications: item.aumer_relevance,
        methods_used: `Archival — SDSU Digital Collections · Type: ${item.type_genre}`,
        population_sample: item.subjects,
      });
      setSaved(p => new Set([...p, idx]));
    } catch (e) { console.error(e); }
    setSaving(p => ({ ...p, [idx]: false }));
  };

  const saveAll = async () => {
    if (!results?.items) return;
    for (let i = 0; i < results.items.length; i++) {
      if (!saved.has(i)) await saveToDb(results.items[i], i);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ background: P.card, border: `1px solid ${P.amber}30`, borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ background: `linear-gradient(135deg,${P.amber},${P.gold})`, borderRadius: 6, padding: "4px 8px", fontSize: 10, fontWeight: 800, color: "#000" }}>
              SDSU
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: P.t1 }}>
                SDSU Digital Collections — <span style={{ color: P.amber }}>Vietnam War Texts</span>
              </div>
              <div style={{ fontSize: 7, color: P.t4 }}>
                SAN DIEGO STATE UNIVERSITY · PRIMARY SOURCES · ORAL HISTORIES · CHICANO MOVEMENT · BORDER REGION
              </div>
            </div>
          </div>
          <a href={COLLECTION_URL} target="_blank" rel="noreferrer"
            style={{ padding: "6px 12px", background: `${P.amber}18`, border: `1px solid ${P.amber}30`,
              color: P.amber, borderRadius: 7, fontSize: 8, fontWeight: 700, textDecoration: "none",
              display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            🔗 Browse Full Collection ↗
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {[
            { l: "Institution", v: "San Diego State Univ.", c: P.amber },
            { l: "Subject Filter", v: "Vietnam War", c: P.red },
            { l: "Genre Filter", v: "Text Documents", c: P.blue },
            { l: "Region Focus", v: "US-Mexico Border", c: P.teal },
          ].map((s, i) => (
            <div key={i} style={{ background: "#080D18", border: `1px solid ${s.c}20`, borderRadius: 6, padding: "4px 10px" }}>
              <span style={{ fontSize: 6, color: P.t4 }}>{s.l}: </span>
              <span style={{ fontSize: 7, fontWeight: 700, color: s.c }}>{s.v}</span>
            </div>
          ))}
        </div>

        {/* Preset queries */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
          {PRESET_QUERIES.map((p, i) => (
            <button key={i} onClick={() => { setQuery(p.q); runSearch(p.q); }}
              style={{ padding: "3px 10px", background: `${P.amber}10`, border: `1px solid ${P.amber}25`,
                color: P.amber, borderRadius: 20, fontSize: 7, cursor: "pointer" }}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div style={{ display: "flex", gap: 8 }}>
          <input value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && runSearch()}
            placeholder='Search SDSU Vietnam War collection — e.g. "Chicano Moratorium 1970" or "oral history veteran border"'
            style={{ flex: 1, padding: "9px 14px", background: "#080D18",
              border: `1px solid ${P.amber}50`, borderRadius: 8, color: P.t1,
              fontSize: 10, fontFamily: "'IBM Plex Mono',monospace", outline: "none" }} />
          <button onClick={() => runSearch()} disabled={loading}
            style={{ padding: "9px 18px", background: loading ? P.b : `linear-gradient(135deg,${P.amber},${P.gold})`,
              color: loading ? P.t4 : "#000", border: "none", borderRadius: 8, fontSize: 11,
              fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'IBM Plex Mono',monospace" }}>
            {loading ? "⟳ Searching..." : "🗂 Search SDSU"}
          </button>
        </div>
      </div>

      {/* Info banner */}
      {!loading && !results && (
        <div style={{ background: `${P.amber}08`, border: `1px solid ${P.amber}20`, borderRadius: 8, padding: "10px 14px", marginBottom: 10, fontSize: 8, color: P.t3 }}>
          ℹ Uses <strong style={{ color: P.amber }}>Gemini Pro + Live Internet</strong> to search the SDSU Digital Collections Vietnam War archive. Returns digitized primary sources, manuscripts, oral histories, and documents — saved directly to your ResearchDoc database.
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ background: P.card, border: `1px solid ${P.amber}30`, borderRadius: 10, padding: "30px", textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>🗂</div>
          <div style={{ fontSize: 11, color: P.amber, fontWeight: 700, marginBottom: 4 }}>Searching SDSU Digital Collections...</div>
          <div style={{ fontSize: 8, color: P.t4 }}>Querying Vietnam War text archive · Extracting Chicano/Latino records · Scoring AUMER relevance</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: `${P.red}08`, border: `1px solid ${P.red}30`, borderRadius: 8, padding: "10px 14px", fontSize: 9, color: P.red }}>
          ⚠ {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div>
          {/* Results bar */}
          <div style={{ background: P.card, border: `1px solid ${P.teal}30`, borderRadius: 10, padding: "10px 14px", marginBottom: 10,
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: P.teal }}>✓ {results.items?.length || 0} Items Found</span>
              {results.total_estimated > 0 && (
                <span style={{ fontSize: 8, color: P.t4 }}>~{results.total_estimated} total in collection</span>
              )}
              <span style={{ fontSize: 8, color: P.t3 }}>{results.search_note}</span>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 8, color: P.t4 }}>{saved.size} saved</span>
              <button onClick={saveAll}
                style={{ padding: "5px 12px", background: `${P.amber}18`, border: `1px solid ${P.amber}30`,
                  color: P.amber, borderRadius: 6, fontSize: 8, fontWeight: 700, cursor: "pointer" }}>
                💾 Save All to DB
              </button>
              <a href={buildSDSUUrl(query, page)} target="_blank" rel="noreferrer"
                style={{ padding: "5px 12px", background: `${P.blue}18`, border: `1px solid ${P.blue}30`,
                  color: P.blue, borderRadius: 6, fontSize: 8, fontWeight: 700, textDecoration: "none" }}>
                Open in SDSU ↗
              </a>
            </div>
          </div>

          {/* Item cards */}
          {results.items?.map((item, idx) => {
            const rc = RC(item.relevance_score || 0);
            const isOpen = expanded === idx;
            const isSaved = saved.has(idx);
            return (
              <div key={idx} style={{ background: P.card, border: `1px solid ${rc}20`,
                borderLeft: `5px solid ${rc}`, borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontSize: 8, color: P.t4, flexShrink: 0, marginTop: 2 }}>#{idx + 1}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, color: P.t1, lineHeight: 1.4 }}>{item.title}</span>
                    </div>
                    <div style={{ fontSize: 8, color: P.t3, marginBottom: 4 }}>
                      {item.creator && <span>{item.creator} · </span>}
                      {item.date && <span style={{ color: P.amber }}>{item.date}</span>}
                      {item.type_genre && <span style={{ color: P.t4 }}> · {item.type_genre}</span>}
                      {item.collection && <span style={{ color: P.blue }}> · {item.collection}</span>}
                    </div>

                    {/* TL;DR */}
                    <div style={{ fontSize: 8, color: P.gold, fontWeight: 600, marginBottom: 5 }}>
                      💡 {item.tldr}
                    </div>

                    {/* Tags */}
                    {item.cluster_tags && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {item.cluster_tags.split(",").map(t => t.trim()).filter(Boolean).map((tag, i) => (
                          <span key={i} style={{ fontSize: 6, background: `${P.amber}10`, border: `1px solid ${P.amber}20`,
                            color: P.amber, borderRadius: 20, padding: "1px 6px" }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 800, color: rc, lineHeight: 1 }}>
                      {item.relevance_score}<span style={{ fontSize: 9, color: P.t4 }}>/10</span>
                    </div>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button onClick={() => setExpanded(isOpen ? null : idx)}
                        style={{ padding: "3px 8px", background: "transparent", border: `1px solid ${P.b}`,
                          borderRadius: 5, color: P.t4, fontSize: 7, cursor: "pointer" }}>
                        {isOpen ? "▲" : "▼"}
                      </button>
                      <button onClick={() => saveToDb(item, idx)} disabled={saving[idx] || isSaved}
                        style={{ padding: "3px 8px",
                          background: isSaved ? `${P.teal}18` : `${P.amber}12`,
                          border: `1px solid ${isSaved ? P.teal : P.amber}30`,
                          color: isSaved ? P.teal : P.amber, borderRadius: 5, fontSize: 7,
                          cursor: isSaved ? "default" : "pointer" }}>
                        {saving[idx] ? "⟳" : isSaved ? "✓" : "💾"}
                      </button>
                      {item.sdsu_url && (
                        <a href={item.sdsu_url} target="_blank" rel="noreferrer"
                          style={{ padding: "3px 8px", background: `${P.blue}12`, border: `1px solid ${P.blue}25`,
                            color: P.blue, borderRadius: 5, fontSize: 7, textDecoration: "none" }}>↗</a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${P.b}30` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {[
                        ["Description", item.description, P.t2],
                        ["AUMER Relevance", item.aumer_relevance, rc],
                        ["Subjects", item.subjects, P.amber],
                        ["Genre / Type", item.type_genre, P.blue],
                        ["Collection", item.collection, P.violet],
                      ].filter(([, v]) => v).map(([label, text, c]) => (
                        <div key={label} style={{ background: "#080D18", borderRadius: 7, padding: "8px 10px" }}>
                          <div style={{ fontSize: 7, color: P.t4, letterSpacing: 1, marginBottom: 3 }}>{label.toUpperCase()}</div>
                          <div style={{ fontSize: 8, color: c, lineHeight: 1.7 }}>{text}</div>
                        </div>
                      ))}
                    </div>
                    {item.sdsu_url && (
                      <div style={{ marginTop: 8, fontSize: 7 }}>
                        <a href={item.sdsu_url} target="_blank" rel="noreferrer"
                          style={{ color: P.blue, textDecoration: "none" }}>
                          🔗 {item.sdsu_url}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10 }}>
            {page > 1 && (
              <button onClick={() => runSearch(query, page - 1)}
                style={{ padding: "6px 14px", background: `${P.amber}12`, border: `1px solid ${P.amber}25`,
                  color: P.amber, borderRadius: 7, fontSize: 9, fontWeight: 700, cursor: "pointer" }}>
                ← Prev
              </button>
            )}
            <span style={{ padding: "6px 12px", fontSize: 8, color: P.t4 }}>Page {page}</span>
            <button onClick={() => runSearch(query, page + 1)}
              style={{ padding: "6px 14px", background: `${P.amber}12`, border: `1px solid ${P.amber}25`,
                color: P.amber, borderRadius: 7, fontSize: 9, fontWeight: 700, cursor: "pointer" }}>
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}