import { useState } from "react";
import { P } from "../../lib/teData";

const TIMELINE_EVENTS = [
  // Vietnam Era
  { year: 1965, admin: "Johnson", event: "Vietnam War escalation begins", type: "military", color: P.blue },
  { year: 1968, admin: "Johnson", event: "Tet Offensive; peak casualty numbers", type: "military", color: P.blue },
  { year: 1969, admin: "Nixon", event: "DCAS established; Hispanic surnames miscoded as 'White'", type: "policy", color: P.red },
  { year: 1973, admin: "Nixon", event: "Vietnam War officially ends", type: "military", color: P.blue },
  
  // Post-Vietnam Era
  { year: 1975, admin: "Ford", event: "DCAS reclassification protocol introduces bias", type: "policy", color: P.red },
  { year: 1980, admin: "Reagan", event: "Mariel Boatlift; deportation enforcement increases", type: "policy", color: P.amber },
  
  // 1990s Changes
  { year: 1996, admin: "Clinton", event: "IIRIRA §237 enacted; retroactive deportation grounds established", type: "policy", color: P.red },
  { year: 1996, admin: "Clinton", event: "First confirmed deported veterans from post-1996 criminalization", type: "deportation", color: P.red },
  
  // 2000s Expansion
  { year: 2001, admin: "G.W. Bush", event: "Post-9/11 enforcement surge; veteran deportations increase", type: "policy", color: P.amber },
  { year: 2003, admin: "G.W. Bush", event: "Enhanced ICE cooperation with VA records (BIRLS access)", type: "policy", color: P.amber },
  
  // 2008-2017 Obama Era
  { year: 2008, admin: "Obama", event: "Economic crisis; deportation backlog rises to 500K+", type: "policy", color: P.blue },
  { year: 2010, admin: "Obama", event: "GAO flags first data on deported veterans (GAO-10-626)", type: "research", color: P.teal },
  { year: 2013, admin: "Obama", event: "Deportation of first confirmed Vietnam-era Marine (C-level)", type: "deportation", color: P.red },
  { year: 2015, admin: "Obama", event: "92 confirmed deported veterans documented (GAO-19-416 baseline)", type: "research", color: P.teal },
  
  // Trump Era
  { year: 2017, admin: "Trump", event: "Immigration enforcement orders; prioritize all deportations", type: "policy", color: P.red },
  { year: 2018, admin: "Trump", event: "MAVNI cancellation; retroactively denies naturalization to 2K+ military recruits", type: "policy", color: P.red },
  { year: 2019, admin: "Trump", event: "GAO Report 19-416 confirms 92 deported veterans (2013–2018)", type: "research", color: P.teal },
  { year: 2020, admin: "Trump", event: "Deportation rate accelerates; 130K+ in 2020 alone", type: "deportation", color: P.red },
  { year: 2021, admin: "Trump", event: "Final year: 65K+ deportations; veteran cases compound", type: "deportation", color: P.red },
  
  // Biden Era
  { year: 2021, admin: "Biden", event: "Executive orders on immigrant protection; MAVNI review initiated", type: "policy", color: P.blue },
  { year: 2022, admin: "Biden", event: "VA-ICE data sharing protocols reviewed but not formalized", type: "policy", color: P.amber },
  { year: 2023, admin: "Biden", event: "Deportations continue at historical rates; veteran cases ongoing", type: "deportation", color: P.amber },
  
  // Recent/Current
  { year: 2024, admin: "Biden", event: "CB-HSIVF verification identifies 6 cases; CHC awareness grows", type: "research", color: P.violet },
  { year: 2025, admin: "Biden", event: "Park case self-deportation (Nov/Dec); urgent advocacy begins", type: "deportation", color: P.red },
  { year: 2026, admin: "Biden", event: "CHC briefing May 18; legislative push for INA §329 policy", type: "policy", color: P.gold },
];

const ADMINISTRATIONS = [
  { name: "Johnson", start: 1965, end: 1969, color: "#4A90E2" },
  { name: "Nixon", start: 1969, end: 1974, color: "#D32F2F" },
  { name: "Ford", start: 1974, end: 1977, color: "#D32F2F" },
  { name: "Carter", start: 1977, end: 1981, color: "#4A90E2" },
  { name: "Reagan", start: 1981, end: 1989, color: "#D32F2F" },
  { name: "Bush Sr", start: 1989, end: 1993, color: "#D32F2F" },
  { name: "Clinton", start: 1993, end: 2001, color: "#4A90E2" },
  { name: "G.W. Bush", start: 2001, end: 2009, color: "#D32F2F" },
  { name: "Obama", start: 2009, end: 2017, color: "#4A90E2" },
  { name: "Trump", start: 2017, end: 2021, color: "#D32F2F" },
  { name: "Biden", start: 2021, end: 2026, color: "#4A90E2" },
];

const EVENT_TYPES = {
  military: { icon: "🎖️", label: "Military", color: P.blue },
  policy: { icon: "📋", label: "Policy", color: P.red },
  deportation: { icon: "✈️", label: "Deportation", color: P.red },
  research: { icon: "📊", label: "Research", color: P.teal },
};

export default function TimelineHistorical({ setTab }) {
  const [selectedYear, setSelectedYear] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [filterAdmin, setFilterAdmin] = useState("all");

  const filtered = TIMELINE_EVENTS.filter(e => 
    (filterType === "all" || e.type === filterType) &&
    (filterAdmin === "all" || e.admin === filterAdmin)
  );

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1, padding: "14px 20px" }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          📅 Vietnam to Present <span style={{ color: P.gold }}>Policy Timeline</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          ADMINISTRATIONS · POLICY CHANGES · DEPORTATION HISTORY
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {["all", "military", "policy", "deportation", "research"].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: "5px 10px",
                background: filterType === type ? `${P.gold}20` : P.card,
                border: `1px solid ${filterType === type ? P.gold : P.b}`,
                color: filterType === type ? P.gold : P.t4,
                fontSize: 7,
                fontWeight: filterType === type ? 700 : 400,
                cursor: "pointer",
                borderRadius: 6,
              }}
            >
              {type === "all" ? "📌 All" : EVENT_TYPES[type]?.icon + " " + type}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          <select
            value={filterAdmin}
            onChange={(e) => setFilterAdmin(e.target.value)}
            style={{
              padding: "5px 8px",
              background: P.card,
              border: `1px solid ${P.b}`,
              color: P.t1,
              fontSize: 7,
              borderRadius: 6,
              outline: "none",
            }}
          >
            <option value="all">All Administrations</option>
            {ADMINISTRATIONS.map(a => <option key={a.name} value={a.name}>{a.name} ({a.start}–{a.end})</option>)}
          </select>
        </div>
      </div>

      {/* Administration bars */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 8, fontWeight: 700, color: P.t4, marginBottom: 6 }}>Presidential Administrations</div>
        <div style={{ display: "flex", gap: 2, height: 20, background: P.bg, borderRadius: 8, overflow: "hidden", border: `1px solid ${P.b}` }}>
          {ADMINISTRATIONS.map(admin => {
            const yearSpan = admin.end - admin.start;
            const startPercent = ((admin.start - 1965) / (2026 - 1965)) * 100;
            const widthPercent = (yearSpan / (2026 - 1965)) * 100;
            return (
              <div
                key={admin.name}
                title={`${admin.name} (${admin.start}–${admin.end})`}
                style={{
                  flex: `0 0 ${widthPercent}%`,
                  background: admin.color,
                  opacity: 0.7,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 6,
                  fontWeight: 700,
                  color: "white",
                  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                  cursor: "pointer",
                }}
              >
                {widthPercent > 8 && admin.name}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 6, color: P.t4 }}>
          <span>1965 (Vietnam)</span>
          <span>2026 (Present)</span>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ position: "relative" }}>
        {/* Timeline line */}
        <div style={{
          position: "absolute",
          left: 30,
          top: 0,
          bottom: 0,
          width: 2,
          background: `linear-gradient(180deg, ${P.red}, ${P.gold}, ${P.blue})`,
        }} />

        {/* Events */}
        <div>
          {filtered.map((event, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedYear(selectedYear === event.year ? null : event.year)}
              style={{
                marginBottom: 12,
                position: "relative",
                cursor: "pointer",
                paddingLeft: 70,
              }}
            >
              {/* Timeline dot */}
              <div style={{
                position: "absolute",
                left: 16,
                top: 4,
                width: 28,
                height: 28,
                background: event.color,
                borderRadius: "50%",
                border: `2px solid ${P.bg}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                boxShadow: `0 0 8px ${event.color}40`,
              }}>
                {EVENT_TYPES[event.type]?.icon}
              </div>

              {/* Event card */}
              <div style={{
                background: selectedYear === event.year ? `${event.color}15` : P.card,
                border: `1px solid ${selectedYear === event.year ? event.color : P.b}`,
                borderRadius: 8,
                padding: 10,
                transition: "all .15s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, fontWeight: 800, color: event.color }}>{event.year}</div>
                    <div style={{ fontSize: 6, color: P.t4 }}>{event.admin} administration</div>
                  </div>
                  <span style={{
                    fontSize: 6,
                    background: `${event.color}20`,
                    border: `1px solid ${event.color}40`,
                    color: event.color,
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontWeight: 700,
                  }}>
                    {EVENT_TYPES[event.type]?.label}
                  </span>
                </div>
                <div style={{ fontSize: 9, color: P.t2, lineHeight: 1.4 }}>{event.event}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats summary */}
      <div style={{ marginTop: 20, padding: 12, background: P.card, border: `1px solid ${P.b}`, borderRadius: 10 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 8 }}>📊 Timeline Statistics</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
          {[
            { label: "Years Covered", value: "61" },
            { label: "Administrations", value: "11" },
            { label: "Policy Changes", value: TIMELINE_EVENTS.filter(e => e.type === "policy").length },
            { label: "Deportations Tracked", value: TIMELINE_EVENTS.filter(e => e.type === "deportation").length },
            { label: "Research Milestones", value: TIMELINE_EVENTS.filter(e => e.type === "research").length },
          ].map((stat, i) => (
            <div key={i} style={{
              background: "#080D18",
              border: `1px solid ${P.b}`,
              borderRadius: 6,
              padding: 8,
              textAlign: "center",
            }}>
              <div style={{ fontSize: 6, color: P.t4, marginBottom: 3 }}>{stat.label}</div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 800, color: P.gold }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
        <button
          onClick={() => setTab && setTab("pdfbrief")}
          style={{
            flex: 1,
            padding: "10px",
            background: `${P.gold}20`,
            border: `1px solid ${P.gold}40`,
            color: P.gold,
            fontSize: 9,
            fontWeight: 700,
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          📄 Export as PDF
        </button>
        <button
          style={{
            flex: 1,
            padding: "10px",
            background: `${P.blue}12`,
            border: `1px solid ${P.blue}25`,
            color: P.blue,
            fontSize: 9,
            fontWeight: 700,
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          📊 Compare Eras
        </button>
      </div>
    </div>
  );
}