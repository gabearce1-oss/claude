import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { P, CASES } from "../../lib/teData";

const CASE_EVENTS = {
  C001: [
    { date: "1967-06-15", type: "service", label: "Enlists — US Army", detail: "Ramos enlists in US Army as a non-citizen from Mexico. Eligible under the Military Selective Service Act.", icon: "🎖️" },
    { date: "1968-02-01", type: "combat", label: "Deployed — Vietnam", detail: "Deployed to Vietnam War theater. Awarded Medal of Honor for heroic action under fire.", icon: "⭐" },
    { date: "1969-11-14", type: "award", label: "Medal of Honor Awarded", detail: "Posthumous Medal of Honor awarded. Family notified. Casualty recorded in DCAS as Race Code 5 (White).", icon: "🏅" },
    { date: "1969-12-01", type: "data", label: "DCAS Entry — Race Miscoded", detail: "DCAS records his racial classification as White (code 5). BISG analysis suggests Hispanic probability >0.87.", icon: "💀" },
    { date: "2019-01-15", type: "foia", label: "NARA Service Records Requested", detail: "AUMER Foundation files SF-180 for full OMPF. Records partially released.", icon: "📋" },
    { date: "2024-09-01", type: "research", label: "CB-HSIVF Case Certified", detail: "AUMER Foundation certifies as CB-HSIVF Case C001 — Gold Tier. SHA-256 hash generated.", icon: "🔐" },
    { date: "2026-05-18", type: "congress", label: "CHC Briefing — May 18", detail: "Congressional Hispanic Caucus briefing — C001 Ramos featured as primary Gold Star case.", icon: "🏛️", future: true },
  ],
  C002: [
    { date: "1966-03-01", type: "service", label: "Enlists — USMC", detail: "Manuel Valenzuela enlists as a non-citizen. Serves honorably as USMC infantryman.", icon: "🎖️" },
    { date: "1967-09-01", type: "combat", label: "Vietnam Tour", detail: "Deployed to Vietnam. Multiple combat engagements. Returns with service-connected PTSD.", icon: "⭐" },
    { date: "1982-04-12", type: "legal", label: "Minor Conviction — Pre-IIRIRA", detail: "Non-violent conviction that would not trigger removal under law at the time.", icon: "⚖️" },
    { date: "1996-09-30", type: "law", label: "IIRIRA Signed into Law", detail: "IIRIRA retroactively converts pre-IIRIRA convictions into grounds for removal. Immediate risk created.", icon: "📜" },
    { date: "2001-06-15", type: "enforcement", label: "ICE Detainer Issued", detail: "ICE issues detainer based on 1982 conviction now classified as 'aggravated felony' under IIRIRA.", icon: "🚔" },
    { date: "2003-02-01", type: "removal", label: "Deported to Tijuana", detail: "Removed to Mexico despite 37 years of US residency and honorable military service.", icon: "✈️" },
    { date: "2003-03-01", type: "shelter", label: "Casa del Migrante — TJ", detail: "Arrives at Casa del Migrante, Tijuana. Connected with LULAC and AUMER Foundation advocates.", icon: "🏠" },
    { date: "2024-11-01", type: "research", label: "CB-HSIVF Case Certified — Gold", detail: "Case C002 certified at Gold tier. Full evidence chain assembled.", icon: "🔐" },
  ],
  C003: [
    { date: "1968-01-15", type: "service", label: "Enlists — USMC (brother)", detail: "Vicente Valenzuela (brother) enlists alongside Manuel. Both serve in Vietnam.", icon: "🎖️" },
    { date: "1968-09-01", type: "combat", label: "Vietnam Deployment", detail: "USMC infantry, Vietnam theater. Combat veteran.", icon: "⭐" },
    { date: "1996-09-30", type: "law", label: "IIRIRA — Retroactive Risk", detail: "IIRIRA creates retroactive removal risk for prior conviction.", icon: "📜" },
    { date: "2004-08-15", type: "removal", label: "Deported to Tijuana", detail: "Removed to Mexico. Joins brother Manuel at Casa del Migrante.", icon: "✈️" },
    { date: "2024-11-01", type: "research", label: "CB-HSIVF C003 — Gold Tier", detail: "Case C003 certified alongside C002. Brothers documented as dual case.", icon: "🔐" },
  ],
  C004: [
    { date: "1988-07-01", type: "service", label: "Enlists — US Army (Korea)", detail: "Sae Joon Park enlists as South Korean-born non-citizen. Serves in US Army.", icon: "🎖️" },
    { date: "1991-03-01", type: "combat", label: "Gulf War Deployment", detail: "Deployed to Gulf War theater. Honorable service.", icon: "⭐" },
    { date: "1995-06-01", type: "legal", label: "INA §329 Application Filed", detail: "Files for military naturalization under INA §329. Application stalled post-IIRIRA environment.", icon: "📋" },
    { date: "1996-09-30", type: "law", label: "IIRIRA Enacted", detail: "IIRIRA increases naturalization barriers for veterans with any criminal record.", icon: "📜" },
    { date: "2017-10-01", type: "data", label: "Military Naturalizations Drop 72%", detail: "FY2017–18: military naturalizations drop 72% under new DHS policy. Park's application denied.", icon: "📉" },
    { date: "2025-08-01", type: "enforcement", label: "ICE Pressure — Self-Deportation", detail: "Increasing ICE pressure leads Park to self-deport to South Korea to avoid arrest.", icon: "🚔" },
    { date: "2025-11-01", type: "removal", label: "⚡ Self-Deported — Seoul, Korea", detail: "Park self-deports to avoid detention. Now in Seoul. Case escalated to URGENT status.", icon: "✈️" },
    { date: "2026-02-01", type: "legal", label: "Habeas Corpus Filed", detail: "Emergency habeas corpus filed. Congressional inquiry letter sent by Rep. Ansari.", icon: "⚖️" },
    { date: "2026-05-18", type: "congress", label: "CHC Briefing — Centerpiece Case", detail: "C004 Park featured as primary URGENT case at CHC May 18 briefing.", icon: "🏛️", future: true },
  ],
  C005: [
    { date: "1970-04-01", type: "service", label: "Enlists — US Army", detail: "Miguel Segura enlists as non-citizen. Vietnam-era service.", icon: "🎖️" },
    { date: "1972-08-01", type: "award", label: "Silver Star Awarded", detail: "Silver Star for gallantry in action. Service-connected injuries sustained.", icon: "🏅" },
    { date: "2002-05-01", type: "removal", label: "Deported — Nogales", detail: "Removed to Nogales, Mexico. Connected with Albergue Nazareno shelter.", icon: "✈️" },
    { date: "2024-10-01", type: "research", label: "CB-HSIVF C005 — Silver", detail: "Case certified at Silver tier. NARA FOIA for service records pending.", icon: "🔐" },
  ],
  C006: [
    { date: "1975-09-01", type: "service", label: "Enlists — US Army (Colombia)", detail: "Jose Duran enlists from Colombia as non-citizen. Post-Vietnam era service.", icon: "🎖️" },
    { date: "1980-01-01", type: "award", label: "Bronze Star — Meritorious Service", detail: "Bronze Star awarded for meritorious service.", icon: "🏅" },
    { date: "2010-03-01", type: "removal", label: "Deported — Colombia", detail: "Removed to Colombia after 30+ years in US. Only Bronze Star recipient in case registry.", icon: "✈️" },
    { date: "2024-12-01", type: "research", label: "CB-HSIVF C006 — Bronze", detail: "Case certified. Only case from South America in registry.", icon: "🔐" },
  ],
};

const GLOBAL_EVENTS = [
  { date: "1964-08-07", type: "law", label: "Gulf of Tonkin Resolution", detail: "Congress authorizes use of force in Vietnam — escalating draft and service of non-citizens.", icon: "📜" },
  { date: "1968-01-30", type: "combat", label: "Tet Offensive", detail: "Major turning point. Many CB-HSIVF subjects serving during this period.", icon: "⭐" },
  { date: "1973-01-27", type: "law", label: "Paris Peace Accords", detail: "Vietnam War ends. 58,220 US casualties recorded in DCAS — 349 officially coded Hispanic.", icon: "🕊️" },
  { date: "1996-09-30", type: "law", label: "IIRIRA Enacted", detail: "Illegal Immigration Reform and Immigrant Responsibility Act. Retroactive removal grounds created.", icon: "📜", critical: true },
  { date: "2001-09-11", type: "enforcement", label: "9/11 — Immigration Enforcement Surge", detail: "Post-9/11 enforcement surge. Non-citizen veterans increasingly targeted.", icon: "🚔" },
  { date: "2019-01-01", type: "data", label: "GAO-19-416 Published", detail: "GAO reports on deported veterans — confirms systemic failure to screen for veteran status.", icon: "📑" },
  { date: "2021-02-02", type: "law", label: "EO-14012 — IMMVI", detail: "Biden Executive Order directing review of military deportation cases. Limited implementation.", icon: "📜" },
  { date: "2025-01-20", type: "enforcement", label: "DHS Enforcement Escalation", detail: "New DHS enforcement priorities — non-citizen veterans at elevated risk.", icon: "🚔", critical: true },
  { date: "2026-05-18", type: "congress", label: "CHC Briefing — May 18, 2026", detail: "Target date: Congressional Hispanic Caucus briefing on CB-HSIVF framework.", icon: "🏛️", future: true },
];

const TYPE_C = {
  service: P.blue, combat: P.red, award: P.gold, law: P.amber,
  enforcement: "#FF5C5C", removal: P.red, shelter: P.teal, research: P.violet,
  foia: P.violet, congress: "#1CCFB4", data: P.blue, legal: P.amber,
};
const TYPE_ICON = {
  service: "🎖️", combat: "⭐", award: "🏅", law: "📜",
  enforcement: "🚔", removal: "✈️", shelter: "🏠", research: "🔐",
  foia: "📋", congress: "🏛️", data: "💾", legal: "⚖️",
};

export default function CaseTimelineVisualizer() {
  const [selectedCase, setSelectedCase] = useState("global");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [aiExpanding, setAiExpanding] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(null);
  const [zoom, setZoom] = useState(1);

  const caseOptions = [
    { id: "global", label: "🌐 Global Timeline", events: GLOBAL_EVENTS },
    ...CASES.map(c => ({ id: c.id, label: `${c.id} ${c.name}`, events: CASE_EVENTS[c.id] || [] })),
  ];
  const current = caseOptions.find(c => c.id === selectedCase);
  const events = current?.events || [];
  const types = ["all", ...new Set(events.map(e => e.type))];
  const filtered = typeFilter === "all" ? events : events.filter(e => e.type === typeFilter);
  const sorted = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));

  const now = new Date();
  const minDate = sorted.length ? new Date(sorted[0].date) : new Date("1960-01-01");
  const maxDate = new Date("2026-12-31");
  const totalMs = maxDate - minDate;

  const getX = (dateStr) => {
    const d = new Date(dateStr);
    return Math.max(2, Math.min(98, ((d - minDate) / totalMs) * 100));
  };

  const expandWithAI = async (event) => {
    setAiExpanding(true);
    setAiExpanded(null);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a forensic researcher for the AUMER Foundation. Provide a deep contextual analysis of this timeline event related to deported US military veterans:

Event: ${event.label}
Date: ${event.date}
Type: ${event.type}
Detail: ${event.detail}
Case: ${selectedCase}

Provide:
1. Historical/legal significance for non-citizen veterans
2. How this connects to the broader CB-HSIVF framework
3. Key data points or statistics related to this event
4. What evidence was generated or lost at this moment
5. Congressional implications`,
      response_json_schema: {
        type: "object",
        properties: {
          significance: { type: "string" },
          cbhsivf_connection: { type: "string" },
          data_points: { type: "array", items: { type: "string" } },
          evidence_impact: { type: "string" },
          congressional_note: { type: "string" }
        }
      }
    });
    setAiExpanded(result);
    setAiExpanding(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>📅 Case Timeline <span style={{ color: P.gold }}>Visualizer</span></div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>FORENSIC CHRONOLOGY · CB-HSIVF CASE REGISTRY · AI EVENT EXPANSION</div>
      </div>

      {/* Case selector */}
      <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
        {caseOptions.map(c => (
          <button key={c.id} onClick={() => { setSelectedCase(c.id); setSelectedEvent(null); setAiExpanded(null); setTypeFilter("all"); }}
            style={{ padding: "5px 12px", fontSize: 8, background: selectedCase === c.id ? `${P.gold}18` : P.card,
              border: `1px solid ${selectedCase === c.id ? P.gold : P.b}`,
              color: selectedCase === c.id ? P.gold : P.t4, borderRadius: 20, cursor: "pointer", fontWeight: selectedCase === c.id ? 700 : 400 }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
        {types.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            style={{ padding: "3px 9px", fontSize: 7, background: typeFilter === t ? `${TYPE_C[t] || P.violet}18` : "transparent",
              border: `1px solid ${typeFilter === t ? TYPE_C[t] || P.violet : P.b}`,
              color: typeFilter === t ? TYPE_C[t] || P.violet : P.t4, borderRadius: 20, cursor: "pointer" }}>
            {TYPE_ICON[t] || ""} {t}
          </button>
        ))}
      </div>

      {/* Horizontal timeline */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 12, padding: "20px 16px", marginBottom: 12, overflowX: "auto" }}>
        <div style={{ position: "relative", height: 120, minWidth: 700 * zoom }}>
          {/* Center line */}
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 2, background: `${P.b}80`, borderRadius: 2 }} />

          {/* Year markers */}
          {Array.from({ length: 7 }, (_, i) => {
            const year = 1964 + i * 9;
            const x = getX(`${year}-01-01`);
            return (
              <div key={year} style={{ position: "absolute", left: `${x}%`, top: "50%", transform: "translateX(-50%)" }}>
                <div style={{ width: 1, height: 14, background: P.b, margin: "0 auto" }} />
                <div style={{ fontSize: 6, color: P.t4, textAlign: "center", marginTop: 2, fontFamily: "'IBM Plex Mono',monospace" }}>{year}</div>
              </div>
            );
          })}

          {/* Events */}
          {sorted.map((e, i) => {
            const x = getX(e.date);
            const above = i % 2 === 0;
            const cc = TYPE_C[e.type] || P.t4;
            const isSel = selectedEvent?.date === e.date && selectedEvent?.label === e.label;
            return (
              <div key={i} onClick={() => { setSelectedEvent(isSel ? null : e); setAiExpanded(null); }}
                style={{ position: "absolute", left: `${x}%`, top: "50%", transform: "translateX(-50%)",
                  cursor: "pointer", zIndex: isSel ? 10 : 2 }}>
                {/* Stem */}
                <div style={{ width: 1, height: 28, background: cc, margin: "0 auto",
                  marginTop: above ? -30 : 2, marginBottom: above ? 2 : 0 }} />
                {/* Dot */}
                <div style={{ width: isSel ? 14 : 10, height: isSel ? 14 : 10, borderRadius: "50%",
                  background: cc, border: `2px solid ${isSel ? P.t1 : cc}`,
                  boxShadow: isSel ? `0 0 10px ${cc}` : e.critical ? `0 0 7px ${cc}` : "none",
                  marginTop: above ? 0 : -12, transition: "all .15s",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7 }}>
                </div>
                {/* Label */}
                <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)",
                  top: above ? -55 : 18, width: 90, textAlign: "center",
                  background: isSel ? `${cc}20` : "transparent", borderRadius: 5, padding: "2px 4px" }}>
                  <div style={{ fontSize: 6, color: cc, fontWeight: isSel ? 800 : 600, lineHeight: 1.3,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {e.icon} {e.label.slice(0, 20)}
                  </div>
                  <div style={{ fontSize: 5, color: P.t4, fontFamily: "'IBM Plex Mono',monospace" }}>{e.date.slice(0, 7)}</div>
                </div>
              </div>
            );
          })}

          {/* Today marker */}
          <div style={{ position: "absolute", left: `${getX(now.toISOString())}%`, top: 0, bottom: 0, width: 1, background: P.teal, opacity: 0.5 }}>
            <div style={{ position: "absolute", top: 0, left: 4, fontSize: 6, color: P.teal, whiteSpace: "nowrap", fontFamily: "'IBM Plex Mono',monospace" }}>TODAY</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedEvent ? "1fr 360px" : "1fr", gap: 12 }}>
        {/* Event list */}
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px", maxHeight: 400, overflowY: "auto" }}>
          <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 8 }}>📋 ALL EVENTS ({sorted.length})</div>
          {sorted.map((e, i) => {
            const cc = TYPE_C[e.type] || P.t4;
            const isSel = selectedEvent?.date === e.date && selectedEvent?.label === e.label;
            return (
              <div key={i} onClick={() => { setSelectedEvent(isSel ? null : e); setAiExpanded(null); }}
                style={{ display: "flex", gap: 10, padding: "7px 8px", borderRadius: 7,
                  background: isSel ? `${cc}10` : "transparent",
                  border: `1px solid ${isSel ? cc + "30" : "transparent"}`,
                  cursor: "pointer", marginBottom: 3, borderLeft: `3px solid ${cc}` }}>
                <div style={{ flexShrink: 0, textAlign: "center", minWidth: 52 }}>
                  <div style={{ fontSize: 6, color: P.t4, fontFamily: "'IBM Plex Mono',monospace" }}>{e.date.slice(0, 7)}</div>
                  <div style={{ fontSize: 14 }}>{e.icon}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: e.future ? cc + "aa" : cc, marginBottom: 2 }}>
                    {e.future ? "⏳ " : ""}{e.label}
                  </div>
                  <div style={{ fontSize: 7, color: P.t3, lineHeight: 1.4 }}>{e.detail.slice(0, 100)}{e.detail.length > 100 ? "…" : ""}</div>
                </div>
                <span style={{ fontSize: 6, color: cc, background: `${cc}10`, border: `1px solid ${cc}20`, borderRadius: 20, padding: "1px 6px", height: "fit-content", whiteSpace: "nowrap" }}>{e.type}</span>
              </div>
            );
          })}
        </div>

        {/* Event detail + AI expand */}
        {selectedEvent && (
          <div style={{ background: P.card, border: `1px solid ${TYPE_C[selectedEvent.type] || P.b}30`, borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{selectedEvent.icon}</div>
              <div style={{ fontSize: 7, color: TYPE_C[selectedEvent.type] || P.t4, fontWeight: 700, letterSpacing: 2, marginBottom: 2 }}>{selectedEvent.type?.toUpperCase()} · {selectedEvent.date}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: P.t1, marginBottom: 8 }}>{selectedEvent.label}</div>
              <div style={{ fontSize: 9, color: P.t2, lineHeight: 1.7 }}>{selectedEvent.detail}</div>
            </div>
            <button onClick={() => expandWithAI(selectedEvent)} disabled={aiExpanding}
              style={{ padding: "8px", background: `${P.violet}18`, border: `1px solid ${P.violet}30`,
                color: P.violet, borderRadius: 8, fontSize: 8, cursor: "pointer", fontWeight: 700 }}>
              {aiExpanding ? "⟳ AI Expanding…" : "🤖 Deep AI Analysis"}
            </button>
            {aiExpanded && (
              <div style={{ fontSize: 7, overflowY: "auto", maxHeight: 300 }}>
                <div style={{ color: P.t2, lineHeight: 1.7, marginBottom: 8 }}>{aiExpanded.significance}</div>
                {aiExpanded.data_points?.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 6, color: P.gold, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>📊 KEY DATA POINTS</div>
                    {aiExpanded.data_points.map((d, i) => (
                      <div key={i} style={{ color: P.t3, paddingLeft: 8, marginBottom: 2 }}>→ {d}</div>
                    ))}
                  </div>
                )}
                {aiExpanded.cbhsivf_connection && (
                  <div style={{ background: `${P.gold}08`, border: `1px solid ${P.gold}20`, borderRadius: 7, padding: "6px 8px", marginBottom: 6 }}>
                    <div style={{ fontSize: 6, color: P.gold, fontWeight: 700, marginBottom: 2 }}>🔗 CB-HSIVF CONNECTION</div>
                    <div style={{ color: P.t3 }}>{aiExpanded.cbhsivf_connection}</div>
                  </div>
                )}
                {aiExpanded.evidence_impact && (
                  <div style={{ fontSize: 7, color: P.amber }}>📂 {aiExpanded.evidence_impact}</div>
                )}
                {aiExpanded.congressional_note && (
                  <div style={{ fontSize: 7, color: "#1CCFB4", marginTop: 6 }}>🏛️ {aiExpanded.congressional_note}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}