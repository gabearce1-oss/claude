import { useState } from "react";
import { P } from "../../lib/teData";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const NOEM_CONTRADICTION = {
  sept2_2025: {
    date: "Sept 2, 2025",
    from: "DHS Secretary Kristi Noem",
    to: "Rep. Seth Moulton (MA-06)",
    statement: "Regarding your question on the number of veterans that have been removed since January 20, 2025, ICE has removed eight veterans.",
    source: "Official DHS letter",
  },
  dec11_2025: {
    date: "Dec 11, 2025",
    hearing: "House Homeland Security Committee",
    statement: "DHS have NOT deported U.S. citizens or military veterans.",
    followup: "Same day, Rep. Moulton publicly released the Sept 2 letter, exposing direct contradiction.",
    source: "Congressional testimony + press release",
  },
};

const NEW_CASES = [
  { id: 12, name: "Paul 'Marc' Canton", branch: "USMC", origin: "New Zealand", deported: "PENDING 2026", status: "NO CRIMINAL RECORD — URGENT", confidence: 95, tier: 3, icon: "🚨" },
  { id: 7, name: "Roman Sabal", branch: "USMC", origin: "Belize", deported: 2008, status: "Returned 2020 (Federal Lawsuit)", confidence: 95, tier: 2, icon: "✓" },
  { id: 8, name: "Marco A. Chavez", branch: "USMC", origin: "Mexico", deported: 2002, status: "Returned Dec 2017 (CA Pardon - FIRST)", confidence: 95, tier: 2, icon: "✓" },
  { id: 9, name: "Erasmo Apodaca", branch: "USMC", origin: "Mexico", deported: 1996, status: "Deceased before pardon", confidence: 85, tier: 3, icon: "⚰️" },
  { id: 10, name: "Cesar Lopez", branch: "USMC", origin: "Mexico", deported: 2012, status: "Returned 2020 (NM Pardon)", confidence: 90, tier: 2, icon: "✓" },
  { id: 11, name: "Jose Segovia-Benitez", branch: "USMC", origin: "El Salvador", deported: 2019, status: "Hiding El Salvador (cartel threat)", confidence: 95, tier: 2, icon: "⚠️" },
  { id: 12, name: "Paul 'Marc' Canton", branch: "USMC", origin: "New Zealand", deported: "PENDING 2026", status: "No criminal record — URGENT", confidence: 95, tier: 3, icon: "🚨" },
  { id: 13, name: "Richard Avila", branch: "USMC", origin: "Mexico", deported: 2011, status: "15+ yrs Tijuana DVSH", confidence: 85, tier: 3, icon: "📍" },
  { id: 14, name: "Cuauhtemoc 'Temo' Juarez", branch: "USMC", origin: "Mexico", deported: "N/A (spouse 2018)", status: "Family targeting case", confidence: 85, tier: 3, icon: "👨‍👩‍👧" },
  { id: 15, name: "Marine Vet Ocegueda", branch: "USMC", origin: "Mexico", deported: 2012, status: "Returned 2021 (Naturalization)", confidence: 85, tier: 3, icon: "✓" },
  { id: 16, name: "Jose Francisco Lopez", branch: "Army (not USMC)", origin: "Mexico", deported: 2003, status: "DVSH-Juárez Founder (140 residents)", confidence: 90, tier: 2, icon: "🏛️" },
];

const PRECEDENT_CASES = [
  { case: "Marco Chavez", precedent: "First deported vet to regain LPR via gubernatorial pardon", state: "California", year: "Easter 2017", reusable: "Yes - template for similar cases" },
  { case: "Roman Sabal", precedent: "Federal lawsuit pathway for citizenship restoration", state: "Federal", year: "Oct 2020", reusable: "Yes - Helen Boyer/Inlender template" },
  { case: "Cesar Lopez", precedent: "NM gubernatorial pardon (faster than CA)", state: "New Mexico", year: "June 2020", reusable: "Yes - multi-state strategy" },
];

const EXPANSION_STATS = [
  { metric: "Baseline MASTER records", value: 6, branch: "Mixed" },
  { metric: "Confirmed USMC only", value: 2, branch: "Original" },
  { metric: "New verified cases", value: 10, branch: "April 2026" },
  { metric: "New USMC cases", value: 7, branch: "April 2026" },
  { metric: "Post-expansion total", value: 16, branch: "All" },
  { metric: "Expansion percentage", value: 167, branch: "Growth %" },
];

const ACCOUNTABILITY_TIMELINE = [
  { date: "Sept 2, 2025", event: "Noem letter: ICE removed 8 veterans", icon: "📄" },
  { date: "Dec 11, 2025", event: "Noem denies deporting any veterans (contradiction exposed)", icon: "❌" },
  { date: "Feb 2026", event: "Canton federal appeal denied (stateless)", icon: "⚖️" },
  { date: "Mar 2026", event: "AUMER report published; Canton case urgent", icon: "🚨" },
  { date: "Apr 2026", event: "This brief: 10-case expansion + Noem perjury anchor", icon: "📊" },
  { date: "May 18, 2026", event: "CHC Congressional Briefing (target)", icon: "🏛️" },
];

export default function CHCBriefingDashboard() {
  const [tab, setTab] = useState("contradiction");
  const [expandedCase, setExpandedCase] = useState(null);

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: P.t1, minHeight: "100vh", background: P.bg, padding: "20px" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(90deg,${P.card},#0D1525)`, border: `2px solid ${P.gold}40`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 7, color: P.gold, letterSpacing: 3, fontWeight: 800, marginBottom: 4 }}>
          🏛️ CONGRESSIONAL HISPANIC CAUCUS BRIEFING · MAY 18, 2026
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: P.t1, marginBottom: 8 }}>
          Deported U.S. Military Personnel: 10-Case Expansion + Institutional Accountability Evidence
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 8, color: P.t3 }}>
          {EXPANSION_STATS.map((s, i) => (
            <div key={i}>
              <span style={{ color: P.gold, fontWeight: 800 }}>{s.value}{s.metric.includes("%") ? "%" : ""}</span> {s.metric}
            </div>
          ))}
        </div>
      </div>

      {/* Tab navigation */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { id: "contradiction", label: "🚨 DHS Perjury (Noem)" },
          { id: "cases", label: "📋 10 New Cases" },
          { id: "precedents", label: "✓ Precedent Pathways" },
          { id: "timeline", label: "📅 Accountability Timeline" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "8px 16px",
              background: tab === t.id ? `${P.gold}18` : "transparent",
              border: `1px solid ${tab === t.id ? P.gold : P.b}`,
              color: tab === t.id ? P.gold : P.t4,
              borderRadius: 20,
              fontSize: 8,
              fontWeight: tab === t.id ? 800 : 600,
              cursor: "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Contradiction tab */}
      {tab === "contradiction" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Sept 2 letter */}
          <div style={{ background: `${P.gold}10`, border: `2px solid ${P.gold}40`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: P.gold, marginBottom: 12 }}>
              📄 {NOEM_CONTRADICTION.sept2_2025.date} — DHS Secretary Kristi Noem (LETTER)
            </div>
            <div style={{ background: P.card, borderRadius: 8, padding: 12, marginBottom: 12, borderLeft: `3px solid ${P.gold}` }}>
              <div style={{ fontSize: 7, color: P.t2, lineHeight: 1.8, fontStyle: "italic" }}>
                "{NOEM_CONTRADICTION.sept2_2025.statement}"
              </div>
            </div>
            <div style={{ fontSize: 8, color: P.t3 }}>
              <strong style={{ color: P.gold }}>To:</strong> Rep. Seth Moulton (MA-06)<br />
              <strong style={{ color: P.gold }}>Source:</strong> Official DHS letter<br />
              <strong style={{ color: P.gold }}>Specificity:</strong> "Eight veterans" — specific number provided
            </div>
          </div>

          {/* Dec 11 testimony */}
          <div style={{ background: `${P.red}10`, border: `2px solid ${P.red}40`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: P.red, marginBottom: 12 }}>
              ❌ {NOEM_CONTRADICTION.dec11_2025.date} — DHS Secretary Kristi Noem (TESTIMONY)
            </div>
            <div style={{ background: P.card, borderRadius: 8, padding: 12, marginBottom: 12, borderLeft: `3px solid ${P.red}` }}>
              <div style={{ fontSize: 7, color: P.t2, lineHeight: 1.8, fontStyle: "italic" }}>
                "{NOEM_CONTRADICTION.dec11_2025.statement}"
              </div>
            </div>
            <div style={{ fontSize: 8, color: P.t3 }}>
              <strong style={{ color: P.red }}>Before:</strong> House Homeland Security Committee<br />
              <strong style={{ color: P.red }}>Followup:</strong> {NOEM_CONTRADICTION.dec11_2025.followup}<br />
              <strong style={{ color: P.red }}>Implications:</strong> Courtroom-quality contradictory statements from Cabinet secretary
            </div>
          </div>

          {/* Impact */}
          <div style={{ gridColumn: "1 / -1", background: `${P.amber}10`, border: `1px solid ${P.amber}30`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: P.amber, marginBottom: 12 }}>⚖️ BRIEF RECOMMENDATION</div>
            <div style={{ fontSize: 8, color: P.t2, lineHeight: 1.8 }}>
              <strong>This contradiction is the strongest single institutional-accountability finding of the March-April 2026 cycle.</strong> The Noem letter-vs.-testimony contradiction should <strong>anchor the CHC briefing's "Accountability Void" section.</strong> Direct evidence of documented government dishonesty regarding veteran deportations. Recommend obtaining full letter and testimony transcript for CHC briefing exhibit.
            </div>
          </div>
        </div>
      )}

      {/* Cases tab */}
      {tab === "cases" && (
        <div>
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["#", "Name", "Branch", "Origin", "Deported", "Status", "Conf.", "Tier"].map(h => (
                      <th key={h} style={{ padding: "8px 10px", background: "#0A0F1E", fontSize: 7, fontWeight: 800, color: P.gold, textAlign: "left", borderBottom: `1px solid ${P.b}`, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {NEW_CASES.map((c, i) => (
                    <tr key={c.id} style={{ background: i % 2 === 0 ? "transparent" : "#0A0F1820", cursor: "pointer" }} onClick={() => setExpandedCase(expandedCase === c.id ? null : c.id)}>
                      <td style={{ padding: "6px 10px", fontSize: 8, color: P.t4, borderBottom: `1px solid ${P.b}15` }}>{c.id}</td>
                      <td style={{ padding: "6px 10px", fontSize: 8, color: P.t1, fontWeight: 700, borderBottom: `1px solid ${P.b}15` }}>{c.icon} {c.name}</td>
                      <td style={{ padding: "6px 10px", fontSize: 7, color: P.t3, borderBottom: `1px solid ${P.b}15` }}>{c.branch}</td>
                      <td style={{ padding: "6px 10px", fontSize: 7, color: P.t4, borderBottom: `1px solid ${P.b}15` }}>{c.origin}</td>
                      <td style={{ padding: "6px 10px", fontSize: 7, color: P.t4, borderBottom: `1px solid ${P.b}15` }}>{c.deported}</td>
                      <td style={{ padding: "6px 10px", fontSize: 7, color: P.teal, fontWeight: 700, borderBottom: `1px solid ${P.b}15` }}>{c.status}</td>
                      <td style={{ padding: "6px 10px", fontSize: 8, fontWeight: 800, color: c.confidence >= 90 ? P.gold : P.amber, borderBottom: `1px solid ${P.b}15` }}>{c.confidence}%</td>
                      <td style={{ padding: "6px 10px", fontSize: 8, fontWeight: 800, color: c.tier === 2 ? P.gold : P.amber, borderBottom: `1px solid ${P.b}15` }}>Tier {c.tier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Case detail */}
          {expandedCase && (
            <div style={{ marginTop: 16, background: `${P.blue}10`, border: `1px solid ${P.blue}30`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 8, color: P.blue, fontWeight: 800, marginBottom: 8 }}>
                CASE DETAIL: {NEW_CASES.find(c => c.id === expandedCase).name}
              </div>
              <div style={{ fontSize: 7, color: P.t3, lineHeight: 1.8 }}>
                Click a case row to expand. Full case dossiers available in ResearchDoc entity records.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Precedents tab */}
      {tab === "precedents" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
          {PRECEDENT_CASES.map((p, i) => (
            <div key={i} style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 12, padding: 14, borderLeft: `4px solid ${P.gold}` }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, marginBottom: 8 }}>{p.case}</div>
              <div style={{ fontSize: 8, color: P.t2, marginBottom: 6 }}><strong>Precedent:</strong> {p.precedent}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, color: P.t4, marginBottom: 8 }}>
                <span><strong>State:</strong> {p.state}</span>
                <span><strong>Year:</strong> {p.year}</span>
              </div>
              <div style={{ padding: "6px 8px", background: "#0A0F18", borderRadius: 6, fontSize: 7, color: p.reusable === "Yes - template for similar cases" ? P.teal : P.t4 }}>
                ✓ Reusable: {p.reusable}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline tab */}
      {tab === "timeline" && (
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 12, padding: 16 }}>
          <div style={{ position: "relative", paddingLeft: 32 }}>
            {ACCOUNTABILITY_TIMELINE.map((item, i) => (
              <div key={i} style={{ marginBottom: 16, position: "relative" }}>
                {i < ACCOUNTABILITY_TIMELINE.length - 1 && (
                  <div style={{ position: "absolute", left: 0, top: 28, bottom: -20, width: 2, background: `${P.gold}20` }} />
                )}
                <div style={{ position: "absolute", left: -12, top: 4, width: 20, height: 20, borderRadius: "50%", background: P.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#000", fontWeight: 800 }}>
                  {i + 1}
                </div>
                <div style={{ marginLeft: 24 }}>
                  <div style={{ fontSize: 8, fontWeight: 800, color: P.gold, marginBottom: 4 }}>{item.date}</div>
                  <div style={{ fontSize: 8, color: P.t2, display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 14 }}>{item.icon}</span>
                    {item.event}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom section: CHC Briefing Recommendations */}
      <div style={{ marginTop: 20, background: `${P.violet}10`, border: `1px solid ${P.violet}30`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.violet, marginBottom: 12 }}>📊 BRIEFING IMPACT SUMMARY (May 18, 2026)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          {[
            { icon: "✓", title: "Clean No-Criminal Case", desc: "Paul Canton — rebuts 'bad-hombres' framing entirely." },
            { icon: "⚖️", title: "Legal-Win Precedents", desc: "Sabal (federal) + Chavez (pardon) — remedy is achievable." },
            { icon: "⚰️", title: "Deceased-Before-Pardon", desc: "Apodaca — demonstrates human cost of institutional delay." },
            { icon: "❌", title: "Documented DHS Perjury", desc: "Noem Sept 2 letter vs. Dec 11 testimony — accountability anchor." },
            { icon: "👨‍👩‍👧", title: "Family-Targeting Pattern", desc: "Butnarciuc, Barranco, Juarez — shows escalation post-IMMVI." },
            { icon: "🏛️", title: "Independent Registry", desc: "DVSH 301 vets (2017) — third-party corroboration of GAO undercount." },
          ].map((item, i) => (
            <div key={i} style={{ background: P.card, borderRadius: 8, padding: 10, borderLeft: `3px solid ${P.violet}` }}>
              <div style={{ fontSize: 14, marginBottom: 4 }}>{item.icon}</div>
              <div style={{ fontSize: 8, fontWeight: 800, color: P.violet, marginBottom: 3 }}>{item.title}</div>
              <div style={{ fontSize: 7, color: P.t3, lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}