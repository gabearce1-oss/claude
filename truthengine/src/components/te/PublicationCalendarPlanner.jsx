import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { P } from "../../lib/teData";

export default function PublicationCalendarPlanner() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTier, setFilterTier] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    base44.entities.ArticleIdea.list("-priority_order", 100)
      .then(setArticles)
      .finally(() => setLoading(false));
  }, []);

  const filtered = articles.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.core_question?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTier = filterTier === "All" || a.tier === filterTier;
    const matchStatus = filterStatus === "All" || a.submission_status === filterStatus;
    return matchSearch && matchTier && matchStatus;
  });

  const statusColors = {
    "Draft": P.amber,
    "Ready for Submission": P.teal,
    "Submitted": P.blue,
    "In Review": P.violet,
    "Accepted": P.gold,
    "Published": P.teal,
  };

  const statusIcons = {
    "Draft": "📝",
    "Ready for Submission": "✅",
    "Submitted": "📤",
    "In Review": "⏳",
    "Accepted": "🎯",
    "Published": "📚",
  };

  const inp = {
    padding: "6px 10px", background: "#080D18", border: `1px solid ${P.b}`,
    borderRadius: 6, color: P.t1, fontSize: 9, fontFamily: "'IBM Plex Mono',monospace", outline: "none",
  };

  // Grouped by sequence phase
  const byPhase = {};
  filtered.forEach(a => {
    const phase = a.sequence_phase || "Draft in Parallel";
    if (!byPhase[phase]) byPhase[phase] = [];
    byPhase[phase].push(a);
  });

  // Timeline grouped by month
  const byMonth = {};
  filtered.forEach(a => {
    if (a.target_submission_date) {
      const month = a.target_submission_date.slice(0, 7);
      if (!byMonth[month]) byMonth[month] = [];
      byMonth[month].push(a);
    }
  });

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1, padding: "20px 40px", overflowY: "auto", height: "calc(100vh - 118px)" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 4 }}>
          Publication Planning
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: P.t1, margin: 0, marginBottom: 6 }}>
          Journal of Veterans Studies — Submission Calendar
        </h1>
        <p style={{ fontSize: 9, color: P.t3, margin: 0 }}>
          Track article ideas, target submission dates, and publication progress
        </p>
      </div>

      {/* Filter Bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <input type="text" placeholder="Search title, question..." value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)} style={{ ...inp, flex: 1, minWidth: "200px" }} />
        <select value={filterTier} onChange={e => setFilterTier(e.target.value)} style={inp}>
          {["All", "Tier 1 - Empirical", "Tier 2 - Policy/Methods", "Tier 3 - Narrative"].map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={inp}>
          {["All", "Draft", "Ready for Submission", "Submitted", "In Review", "Accepted", "Published"].map(s => <option key={s}>{s}</option>)}
        </select>
        <span style={{ fontSize: 8, color: P.t4 }}>{filtered.length} articles</span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, borderBottom: `1px solid ${P.b}`, paddingBottom: 10 }}>
        {["list", "timeline", "roadmap"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 14px", background: activeTab === tab ? `${P.gold}20` : "transparent",
              border: `1px solid ${activeTab === tab ? P.gold : P.b}`, color: activeTab === tab ? P.gold : P.t3,
              borderRadius: 6, fontSize: 9, fontWeight: 700, cursor: "pointer",
            }}>
            {tab === "list" && "📋 List"}{tab === "timeline" && "📅 Timeline"}{tab === "roadmap" && "🗺️ Roadmap"}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", color: P.t4, padding: "40px 0" }}>Loading articles...</div>
      ) : activeTab === "list" ? (
        /* List View */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 14 }}>
          {filtered.map(a => {
            const statusColor = statusColors[a.submission_status] || P.t4;
            const statusIcon = statusIcons[a.submission_status] || "📝";
            return (
              <div key={a.id} onClick={() => setSelectedArticle(a)}
                style={{
                  background: P.card, border: `1px solid ${a.tier.includes("1") ? P.red : a.tier.includes("2") ? P.blue : P.violet}30`,
                  borderLeft: `3px solid ${a.tier.includes("1") ? P.red : a.tier.includes("2") ? P.blue : P.violet}`,
                  borderRadius: 10, padding: 12, cursor: "pointer", transition: "all .2s",
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, lineHeight: 1.3, flex: 1 }}>
                    {a.title}
                  </div>
                  <span style={{ fontSize: 12, marginLeft: 8 }}>{statusIcon}</span>
                </div>
                <div style={{ fontSize: 7, color: P.t4, marginBottom: 8, textTransform: "uppercase" }}>
                  {a.tier}
                </div>
                <div style={{ fontSize: 8, color: P.t3, marginBottom: 8, lineHeight: 1.5 }}>
                  {a.core_question?.slice(0, 80)}...
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  <span style={{
                    fontSize: 7, padding: "2px 6px", background: `${statusColor}15`, border: `1px solid ${statusColor}30`,
                    borderRadius: 3, color: statusColor, fontWeight: 700
                  }}>
                    {a.submission_status}
                  </span>
                  {a.priority_order && (
                    <span style={{
                      fontSize: 7, padding: "2px 6px", background: `${P.gold}15`, border: `1px solid ${P.gold}30`,
                      borderRadius: 3, color: P.gold
                    }}>
                      #{a.priority_order}
                    </span>
                  )}
                </div>
                {a.target_submission_date && (
                  <div style={{ fontSize: 8, color: P.t4 }}>
                    📅 {new Date(a.target_submission_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : activeTab === "timeline" ? (
        /* Timeline View */
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {Object.entries(byMonth).sort().map(([month, items]) => (
            <div key={month}>
              <div style={{ fontSize: 10, fontWeight: 800, color: P.gold, marginBottom: 10 }}>
                📅 {new Date(month + "-01").toLocaleDateString("en-US", { year: "numeric", month: "long" })}
              </div>
              {items.map(a => (
                <div key={a.id} style={{
                  background: P.card2, border: `1px solid ${P.b}`, borderRadius: 7, padding: 10, marginBottom: 8,
                  paddingLeft: 14, borderLeft: `3px solid ${statusColors[a.submission_status] || P.t4}`,
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: P.t1 }}>
                    {statusIcons[a.submission_status]} {a.title}
                  </div>
                  <div style={{ fontSize: 8, color: P.t4, marginTop: 4 }}>
                    {a.submission_status} • {a.tier} • Due: {new Date(a.target_submission_date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        /* Roadmap View - Sequence Phases */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 14 }}>
          {["Submit Now", "Prepare Next", "Develop Later", "Draft in Parallel"].map(phase => (
            <div key={phase} style={{ background: P.card2, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: P.teal, marginBottom: 12 }}>
                {phase === "Submit Now" && "🚀"}{phase === "Prepare Next" && "🏗️"}{phase === "Develop Later" && "📚"}{phase === "Draft in Parallel" && "✍️"} {phase}
              </div>
              {(byPhase[phase] || []).map(a => (
                <div key={a.id} style={{
                  background: "#080D18", border: `1px solid ${P.b}30`, borderRadius: 6, padding: 8, marginBottom: 8,
                }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: P.t1, marginBottom: 4 }}>
                    {a.title}
                  </div>
                  <div style={{ fontSize: 7, color: P.t4 }}>
                    {a.submission_status} {a.priority_order && `• #${a.priority_order}`}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Detail Sidebar */}
      {selectedArticle && (
        <div style={{
          position: "fixed", top: 0, right: 0, width: "350px", height: "100vh",
          background: P.card, border: `1px solid ${P.b}`, overflowY: "auto",
          padding: 20, zIndex: 100, boxShadow: "-4px 0 12px rgba(0,0,0,0.3)",
        }}>
          <button onClick={() => setSelectedArticle(null)}
            style={{
              position: "absolute", top: 10, right: 10, background: "none", border: "none",
              color: P.t4, fontSize: 16, cursor: "pointer",
            }}>✕</button>
          
          <div style={{ fontSize: 11, fontWeight: 800, color: P.t1, marginBottom: 12, lineHeight: 1.4 }}>
            {selectedArticle.title}
          </div>
          <div style={{ fontSize: 8, color: P.t4, marginBottom: 16 }}>
            {selectedArticle.tier} • {statusIcons[selectedArticle.submission_status]} {selectedArticle.submission_status}
          </div>

          {[
            { label: "Core Question", field: "core_question" },
            { label: "Thesis", field: "thesis" },
            { label: "Key Evidence", field: "key_evidence" },
            { label: "Contribution", field: "contribution" },
            { label: "Target Date", field: "target_submission_date", format: "date" },
            { label: "Notes", field: "notes" },
          ].map(({ label, field, format }) => (
            selectedArticle[field] && (
              <div key={field} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 7, fontWeight: 700, color: P.t4, textTransform: "uppercase", marginBottom: 4 }}>
                  {label}
                </div>
                <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.6 }}>
                  {format === "date" ? new Date(selectedArticle[field]).toLocaleDateString() : selectedArticle[field]}
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}