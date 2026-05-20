import { useState, useRef, useEffect, useCallback } from "react";
import { P } from "../../lib/teData";

// ── Seed events ────────────────────────────────────────────────────────────
const SEED_EVENTS = [
  // Military service
  { id:"T001", date:"1964-08-10", label:"Gulf of Tonkin Resolution", category:"military",    case:null,      detail:"U.S. enters Vietnam conflict — draft expansion begins" },
  { id:"T002", date:"1965-03-08", label:"First Combat Troops Land", category:"military",    case:null,      detail:"3,500 Marines land at Da Nang — escalation phase 1" },
  { id:"T003", date:"1965-11-14", label:"Ia Drang Valley Battle",   category:"military",    case:"P-007",   detail:"1st Cavalry Div. — est. 40+ MX nationals KIA" },
  { id:"T004", date:"1967-04-20", label:"Benavidez Deployment",     category:"military",    case:"EPP-001", detail:"Roy Benavidez — A-242 SF patrol, 8 May 1968 action" },
  { id:"T005", date:"1968-05-02", label:"Benavidez MOH Action",     category:"military",    case:"EPP-001", detail:"Mission Loc Ninh — 6hrs combat, 8 lives saved, 37 wounds" },
  { id:"T006", date:"1968-09-01", label:"Rascon Enlistment",        category:"military",    case:"EPP-002", detail:"Alfred Rascon — Army infantry service begins" },
  { id:"T007", date:"1969-01-01", label:"Peak MX Draft Cohort",     category:"military",    case:"P-007",   detail:"Selective Service RG 147 — est. 500–800 MX-born inductees" },
  { id:"T008", date:"1971-06-30", label:"Pentagon Papers Published", category:"legal",       case:null,      detail:"Vietnam casualty data inconsistencies first documented" },
  { id:"T009", date:"1973-01-27", label:"Paris Peace Accords",      category:"military",    case:null,      detail:"Vietnam War ends — repatriation of remains begins" },
  { id:"T010", date:"1975-04-30", label:"Fall of Saigon",           category:"military",    case:null,      detail:"Vietnam War concludes — 58,220 total U.S. KIA recorded" },

  // DCAS / Records
  { id:"T011", date:"1975-07-01", label:"DCAS Baseline Frozen",     category:"records",     case:"AG-003",  detail:"Defense Casualty Analysis System — 58,220 records locked. MX nationals coded FOREIGN." },
  { id:"T012", date:"1978-01-01", label:"62-Year OMPF Rule",        category:"records",     case:"AG-005",  detail:"NARA seals personnel files — limits cross-ref for living vets" },
  { id:"T013", date:"1981-02-24", label:"Benavidez MOH Ceremony",   category:"legal",       case:"EPP-001", detail:"President Reagan awards Medal of Honor — Army SF" },
  { id:"T014", date:"1996-02-08", label:"Rascon MOH Ceremony",      category:"legal",       case:"EPP-002", detail:"President Clinton awards Medal of Honor — retroactive upgrade" },

  // Policy / Legal
  { id:"T015", date:"1996-09-30", label:"IIRIRA Enacted",           category:"policy",      case:null,      detail:"Illegal Immigration Reform Act — retroactive deportation grounds for non-citizen vets" },
  { id:"T016", date:"2001-09-11", label:"Post-9/11 Nat. Policy",    category:"policy",      case:null,      detail:"Expedited naturalization for military — but not retroactive" },
  { id:"T017", date:"2004-01-01", label:"ICE ERO Established",      category:"enforcement", case:"AG-001",  detail:"ICE Enforcement & Removal Operations formed — no veteran screening protocol" },
  { id:"T018", date:"2009-06-01", label:"Duran Deportation",        category:"enforcement", case:"EPP-003", detail:"Nicolas Duran — deported post-service, non-citizen status" },
  { id:"T019", date:"2014-03-18", label:"Pentagon Valor Review",    category:"legal",       case:null,      detail:"17/24 MOH upgrades Hispanic — 70.8% — systemic bias admitted" },
  { id:"T020", date:"2016-11-01", label:"Castaño ICE Encounter",    category:"enforcement", case:"EPP-006", detail:"M. Castaño — ICE encounter, veteran status not flagged" },

  // GAO / FOIA
  { id:"T021", date:"2019-06-01", label:"GAO-19-416 Released",      category:"legal",       case:"EV-004",  detail:"ICE confirmed no veteran tracking — 92 verified deported — DHS agrees to fix" },
  { id:"T022", date:"2020-03-01", label:"COVID ICE Detention",      category:"enforcement", case:null,      detail:"ICE detentions surge — veteran screening still absent" },
  { id:"T023", date:"2021-09-01", label:"Segura Detention",         category:"enforcement", case:"EPP-004", detail:"C. Segura — Army veteran detained by ICE, no flag triggered" },
  { id:"T024", date:"2022-10-01", label:"BISG Study Published",     category:"records",     case:"DOC-003", detail:"τ=0.40 · 2,309 estimate · R²=0.947 · p<0.001" },
  { id:"T025", date:"2023-01-15", label:"5-Stream Analysis",        category:"records",     case:"DOC-004", detail:"SSS+DCAS+N-644+VA+SRE convergence — 346–741 MX KIA forensic range" },
  { id:"T026", date:"2023-06-01", label:"CRS Report R48163",        category:"legal",       case:null,      detail:"94,000 non-citizen vets at deportation risk — largest share MX nationals" },
  { id:"T027", date:"2024-01-10", label:"FOIA F001 Filed",          category:"foia",        case:"DOC-001", detail:"VA BIRLS FOIA — DIC payment history for MX KIA families" },
  { id:"T028", date:"2024-03-20", label:"FOIA F002 Filed",          category:"foia",        case:"DOC-002", detail:"ICE ERO FOIA — veteran status field history in removal database" },
  { id:"T029", date:"2024-08-01", label:"NERO Index Computed",      category:"records",     case:null,      detail:"N=94, E=97, R=91, O=96 — combined critical threshold" },
  { id:"T030", date:"2024-11-15", label:"TruthEngine360 Launched",  category:"records",     case:null,      detail:"TE360 forensic platform active — AUMER Foundation" },

  // 2025 Surge
  { id:"T031", date:"2025-01-20", label:"Trump Inauguration",       category:"policy",      case:null,      detail:"Mass deportation executive order — MX surge begins" },
  { id:"T032", date:"2025-04-01", label:"ICE Surge Q1 2025",        category:"enforcement", case:null,      detail:"27,622 deported with no criminal charge — PTSD-probable cohort begins" },
  { id:"T033", date:"2025-04-20", label:"Policy Reversal Inflection",category:"policy",     case:null,      detail:"April 2025 policy — +499% vs FY2022 deportation baseline confirmed" },
  { id:"T034", date:"2025-11-15", label:"Park Self-Deportation",    category:"enforcement", case:"EPP-005", detail:"Hyun Park — Purple Heart recipient self-deports Nov/Dec 2025 under duress" },
  { id:"T035", date:"2025-12-01", label:"FOIA F001 Overdue",        category:"foia",        case:"DOC-001", detail:"VA BIRLS FOIA — 83+ days overdue — statutory violation 5 U.S.C. §552" },
  { id:"T036", date:"2026-01-10", label:"FOIA F002 Overdue",        category:"foia",        case:"DOC-002", detail:"ICE ERO FOIA — 66+ days overdue" },
  { id:"T037", date:"2026-04-21", label:"TODAY — TE360 Active",     category:"records",     case:null,      detail:"713,464 ICE records · 0 veteran flags · 202,864 MX deported FY22–26" },
  { id:"T038", date:"2026-05-18", label:"CHC Briefing (Target)",    category:"policy",      case:"EV-005",  detail:"Congressional Hispanic Caucus briefing — Washington D.C." },
];

const CATEGORY_CONFIG = {
  military:    { color:"#4A9EFF", icon:"🪖", label:"Military Service" },
  records:     { color:"#2DD4BF", icon:"📊", label:"Records / Data" },
  legal:       { color:"#9D7BFF", icon:"⚖️", label:"Legal / Congressional" },
  policy:      { color:"#F5B942", icon:"🏛️", label:"Policy" },
  enforcement: { color:"#ff4444", icon:"🚨", label:"Enforcement" },
  foia:        { color:"#ff7700", icon:"📋", label:"FOIA" },
  evidence:    { color:"#00cc88", icon:"🔏", label:"Evidence Log" },
};

const CASE_COLORS = {
  "EPP-001":"#F5B942","EPP-002":"#4A9EFF","EPP-003":"#ff4444",
  "EPP-004":"#2DD4BF","EPP-005":"#9D7BFF","EPP-006":"#ff7700","P-007":"#ff4444",
};

function parseDate(str) { return new Date(str + "T00:00:00"); }

export default function ChronologicalTimeline({ evidenceRecords = [] }) {
  const containerRef  = useRef(null);
  const [zoom, setZoom]         = useState(1);       // px per day
  const [panX, setPanX]         = useState(0);       // scroll offset px
  const [selected, setSelected] = useState(null);
  const [catFilter, setCatFilter] = useState("all");
  const [caseFilter, setCaseFilter] = useState("all");
  const [searchQ, setSearchQ]   = useState("");
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartPan = useRef(0);

  // Merge seed + evidence log events
  const allEvents = (() => {
    const evts = [...SEED_EVENTS];
    evidenceRecords.forEach((rec, i) => {
      if (!rec.doc_date && !rec.created_date) return;
      const d = rec.doc_date || rec.created_date?.slice(0, 10);
      if (!d) return;
      evts.push({
        id: `EL-${i}`,
        date: d,
        label: rec.doc_title?.slice(0, 40) || `Evidence #${i + 1}`,
        category: "evidence",
        case: rec.case_ids?.split(",")[0]?.trim() || null,
        detail: `${rec.excerpt?.slice(0, 120) || "Evidence log entry"} — Analyst: ${rec.analyst_id || "unknown"}`,
      });
    });
    return evts.sort((a, b) => parseDate(a.date) - parseDate(b.date));
  })();

  const filtered = allEvents.filter(e => {
    if (catFilter !== "all" && e.category !== catFilter) return false;
    if (caseFilter !== "all" && e.case !== caseFilter) return false;
    if (searchQ && !e.label.toLowerCase().includes(searchQ.toLowerCase()) &&
        !e.detail.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  // Timeline bounds
  const minDate = parseDate("1964-01-01");
  const maxDate = parseDate("2027-01-01");
  const totalDays = (maxDate - minDate) / 86400000;
  const BASE_PX_PER_DAY = 0.9;
  const pxPerDay = BASE_PX_PER_DAY * zoom;
  const totalWidth = totalDays * pxPerDay;

  const dateToX = (dateStr) => (parseDate(dateStr) - minDate) / 86400000 * pxPerDay;

  // Years for axis
  const years = [];
  for (let y = 1964; y <= 2027; y++) years.push(y);

  // Group events into lanes to avoid overlap
  const lanes = [];
  const sorted = [...filtered].sort((a, b) => parseDate(a.date) - parseDate(b.date));
  sorted.forEach(evt => {
    const x = dateToX(evt.date);
    let placed = false;
    for (let li = 0; li < lanes.length; li++) {
      const last = lanes[li][lanes[li].length - 1];
      if (x - dateToX(last.date) > 80 / zoom * (BASE_PX_PER_DAY / pxPerDay * 80)) {
        lanes[li].push(evt);
        placed = true;
        break;
      }
    }
    if (!placed) lanes.push([evt]);
  });

  const LANE_H = 56;
  const AXIS_H = 40;
  const canvasH = Math.max(300, lanes.length * LANE_H + AXIS_H + 40);

  // Scroll to today on mount
  useEffect(() => {
    const todayX = dateToX("2026-04-21");
    const cw = containerRef.current?.clientWidth || 900;
    setPanX(Math.max(0, Math.min(todayX - cw / 2, totalWidth - cw)));
  }, []);

  const onWheel = useCallback((e) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left + panX;
      const oldPxPerDay = BASE_PX_PER_DAY * zoom;
      const factor = e.deltaY < 0 ? 1.15 : 0.87;
      const newZoom = Math.max(0.3, Math.min(12, zoom * factor));
      const newPxPerDay = BASE_PX_PER_DAY * newZoom;
      const newPanX = mouseX * (newPxPerDay / oldPxPerDay) - (e.clientX - rect.left);
      setZoom(newZoom);
      setPanX(Math.max(0, newPanX));
    } else {
      setPanX(p => Math.max(0, Math.min(p + e.deltaX + e.deltaY * 0.5, totalWidth)));
    }
  }, [zoom, panX, totalWidth]);

  const onMouseDown = (e) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartPan.current = panX;
  };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = dragStartX.current - e.clientX;
    setPanX(p => Math.max(0, Math.min(dragStartPan.current + dx, totalWidth)));
  };
  const onMouseUp = () => { isDragging.current = false; };

  const jumpTo = (dateStr) => {
    const x = dateToX(dateStr);
    const cw = containerRef.current?.clientWidth || 900;
    setPanX(Math.max(0, x - cw / 2));
  };

  const uniqueCases = [...new Set(allEvents.map(e => e.case).filter(Boolean))].sort();

  return (
    <div style={{ fontFamily:"'IBM Plex Mono',monospace", color:P.t1 }}>

      {/* Header */}
      <div style={{ background:`linear-gradient(90deg,${P.card},#0D1525)`, border:`2px solid ${P.blue}30`,
        borderRadius:10, padding:"10px 16px", marginBottom:10,
        display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
        <div>
          <div style={{ fontSize:7, color:P.blue, letterSpacing:3, fontWeight:800, marginBottom:2 }}>
            📅 CHRONOLOGICAL TIMELINE · 1964–2026 · TRUTHENGINE360
          </div>
          <div style={{ fontSize:11, fontWeight:800, color:P.t1 }}>
            Military Service · Deportations · Court Filings · FOIA · Evidence Log
          </div>
        </div>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          {[["Events", filtered.length, P.blue], ["Span", "62 yrs", P.gold], ["EL Records", evidenceRecords.length, P.teal]].map(([l,v,c]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:16, fontWeight:800, color:c, fontFamily:"'IBM Plex Mono',monospace" }}>{v}</div>
              <div style={{ fontSize:6, color:P.t4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap", alignItems:"center" }}>
        {/* Category filters */}
        {["all", ...Object.keys(CATEGORY_CONFIG)].map(cat => {
          const cfg = CATEGORY_CONFIG[cat];
          return (
            <button key={cat} onClick={() => setCatFilter(cat)}
              style={{ padding:"3px 8px", fontSize:7, fontWeight: catFilter===cat?800:600,
                background: catFilter===cat?(cfg?.color||P.gold)+"20":"transparent",
                border:`1px solid ${catFilter===cat?(cfg?.color||P.gold):P.b}`,
                color: catFilter===cat?(cfg?.color||P.gold):P.t4,
                borderRadius:20, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
              {cfg?.icon||"🔵"} {cat === "all" ? "All" : cfg?.label || cat}
            </button>
          );
        })}

        <select value={caseFilter} onChange={e => setCaseFilter(e.target.value)}
          style={{ fontFamily:"inherit", fontSize:8, background:"#080D18", border:`1px solid ${P.b}`,
            borderRadius:5, padding:"3px 7px", color:P.t2, outline:"none" }}>
          <option value="all">All Cases</option>
          {uniqueCases.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search events…"
          style={{ fontFamily:"inherit", fontSize:8, background:"#080D18", border:`1px solid ${P.b}`,
            borderRadius:5, padding:"4px 9px", color:P.t1, outline:"none", width:130 }} />

        {/* Zoom controls */}
        <div style={{ display:"flex", gap:4, marginLeft:"auto", alignItems:"center" }}>
          <span style={{ fontSize:7, color:P.t4 }}>Zoom:</span>
          {[["0.5×", 0.55], ["1×", 1], ["2×", 2.2], ["5×", 5], ["10×", 10]].map(([l, z]) => (
            <button key={l} onClick={() => setZoom(z)}
              style={{ padding:"3px 7px", fontSize:7, fontWeight: Math.abs(zoom - z) < 0.3 ? 800:600,
                background: Math.abs(zoom - z) < 0.3 ? `${P.blue}20`:"transparent",
                border:`1px solid ${Math.abs(zoom-z)<0.3?P.blue:P.b}`,
                color: Math.abs(zoom-z)<0.3?P.blue:P.t4, borderRadius:5, cursor:"pointer", fontFamily:"inherit" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Jump buttons */}
      <div style={{ display:"flex", gap:5, marginBottom:8, flexWrap:"wrap" }}>
        <span style={{ fontSize:7, color:P.t4, alignSelf:"center" }}>Jump to:</span>
        {[["Vietnam", "1965-01-01"], ["DCAS Freeze", "1975-07-01"], ["IIRIRA", "1996-09-30"],
          ["GAO 2019", "2019-06-01"], ["2025 Surge", "2025-01-20"], ["TODAY", "2026-04-21"], ["CHC Brief", "2026-05-18"]].map(([l, d]) => (
          <button key={l} onClick={() => jumpTo(d)}
            style={{ padding:"3px 8px", fontSize:7, fontWeight:700, cursor:"pointer",
              background:l==="TODAY"?`${P.gold}20`:`${P.b}20`, border:`1px solid ${l==="TODAY"?P.gold:P.b}`,
              color: l==="TODAY"?P.gold:P.t3, borderRadius:5, fontFamily:"inherit" }}>
            ⇥ {l}
          </button>
        ))}
      </div>

      {/* Main timeline */}
      <div
        ref={containerRef}
        style={{ background:"#030810", border:`1px solid ${P.b}`, borderRadius:10,
          overflowX:"hidden", overflowY:"hidden", position:"relative", cursor:"grab", userSelect:"none" }}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div style={{ width:totalWidth, height:canvasH, position:"relative", transform:`translateX(${-panX}px)` }}>

          {/* Year axis */}
          <div style={{ position:"absolute", top:0, left:0, right:0, height:AXIS_H,
            borderBottom:`2px solid ${P.b}`, background:"#080D18", zIndex:10 }}>
            {years.map(y => {
              const x = (new Date(y, 0, 1) - minDate) / 86400000 * pxPerDay;
              const isMajor = y % 5 === 0;
              return (
                <div key={y} style={{ position:"absolute", left:x, top:0, height:AXIS_H, display:"flex", flexDirection:"column", alignItems:"flex-start" }}>
                  <div style={{ width:1, height: isMajor ? 16 : 8, background: isMajor ? P.gold+"80" : P.b, marginTop:4 }} />
                  {isMajor && (
                    <div style={{ fontSize:8, fontWeight:800, color:P.gold, fontFamily:"'IBM Plex Mono',monospace",
                      marginTop:2, whiteSpace:"nowrap", transform:"translateX(-50%)" }}>
                      {y}
                    </div>
                  )}
                  {!isMajor && zoom >= 1.5 && (
                    <div style={{ fontSize:6, color:P.t4, marginTop:2, whiteSpace:"nowrap", transform:"translateX(-50%)" }}>{y}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Today line */}
          <div style={{ position:"absolute", left:dateToX("2026-04-21"), top:0, bottom:0,
            width:2, background:P.gold, opacity:0.7, zIndex:8 }}>
            <div style={{ position:"absolute", top:AXIS_H + 2, left:4, fontSize:6, color:P.gold,
              fontWeight:800, whiteSpace:"nowrap", background:"#030810cc", padding:"1px 4px", borderRadius:3 }}>
              TODAY
            </div>
          </div>

          {/* CHC target line */}
          <div style={{ position:"absolute", left:dateToX("2026-05-18"), top:0, bottom:0,
            width:1.5, background:P.amber, opacity:0.6, zIndex:8, borderStyle:"dashed" }}>
            <div style={{ position:"absolute", top:AXIS_H + 16, left:4, fontSize:6, color:P.amber,
              fontWeight:800, whiteSpace:"nowrap", background:"#030810cc", padding:"1px 4px", borderRadius:3 }}>
              CHC
            </div>
          </div>

          {/* Event nodes */}
          {lanes.map((lane, li) =>
            lane.map(evt => {
              const x = dateToX(evt.date);
              const y = AXIS_H + 16 + li * LANE_H;
              const cfg = CATEGORY_CONFIG[evt.category] || CATEGORY_CONFIG.evidence;
              const caseColor = evt.case ? (CASE_COLORS[evt.case] || P.t3) : null;
              const isSel = selected?.id === evt.id;
              const isDimmed = (catFilter !== "all" && evt.category !== catFilter) ||
                               (caseFilter !== "all" && evt.case !== caseFilter);

              return (
                <g key={evt.id}>
                  {/* Connector line to axis */}
                  <div style={{ position:"absolute", left:x, top:AXIS_H - 2, width:1.5,
                    height: y - AXIS_H + 10, background:cfg.color+"40", zIndex:2 }} />

                  {/* Event card */}
                  <div
                    onClick={() => setSelected(isSel ? null : evt)}
                    style={{
                      position:"absolute", left:x + 4, top:y,
                      maxWidth: zoom < 1 ? 80 : zoom > 4 ? 200 : 130,
                      background: isSel ? `${cfg.color}20` : "#080D18",
                      border:`1.5px solid ${isSel ? cfg.color : cfg.color + "50"}`,
                      borderLeft:`3px solid ${cfg.color}`,
                      borderRadius:6, padding:"4px 7px", cursor:"pointer",
                      zIndex: isSel ? 20 : 5,
                      boxShadow: isSel ? `0 0 12px ${cfg.color}40` : "none",
                      opacity: isDimmed ? 0.25 : 1,
                      transition:"all .12s",
                      minWidth:60,
                    }}
                  >
                    <div style={{ display:"flex", gap:4, alignItems:"center", marginBottom:2 }}>
                      <span style={{ fontSize:9 }}>{cfg.icon}</span>
                      {caseColor && <div style={{ width:5, height:5, borderRadius:"50%", background:caseColor, flexShrink:0 }} />}
                    </div>
                    <div style={{ fontSize:7, fontWeight:800, color:cfg.color, lineHeight:1.2, marginBottom:1 }}>
                      {zoom < 0.7 ? evt.label.slice(0, 10) + "…" : evt.label.slice(0, zoom > 3 ? 99 : 28)}
                    </div>
                    {zoom >= 1.2 && (
                      <div style={{ fontSize:6, color:P.t4, lineHeight:1.3 }}>
                        {evt.date.slice(0, 7)}
                      </div>
                    )}
                    {isSel && (
                      <div style={{ fontSize:6, color:P.t3, lineHeight:1.5, marginTop:3, borderTop:`1px solid ${cfg.color}30`, paddingTop:3 }}>
                        {evt.detail}
                      </div>
                    )}
                  </div>

                  {/* Dot on axis */}
                  <div style={{
                    position:"absolute", left:x - 4, top:AXIS_H - 5,
                    width:8, height:8, borderRadius:"50%",
                    background:cfg.color, zIndex:9,
                    boxShadow:`0 0 6px ${cfg.color}`,
                    border:`1.5px solid #030810`,
                  }} />
                </g>
              );
            })
          )}
        </div>

        {/* Ctrl+scroll hint */}
        <div style={{ position:"absolute", bottom:8, right:12, fontSize:6, color:P.t4 }}>
          Ctrl+scroll to zoom · Drag to pan
        </div>
      </div>

      {/* Legend + selected detail */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:10 }}>
        {/* Legend */}
        <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:8, padding:"10px 14px" }}>
          <div style={{ fontSize:7, fontWeight:800, color:P.t4, letterSpacing:1, marginBottom:7 }}>CATEGORY LEGEND</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
            {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => (
              <div key={cat} style={{ display:"flex", gap:5, alignItems:"center" }}>
                <div style={{ width:8, height:8, borderRadius:2, background:cfg.color, flexShrink:0 }}/>
                <span style={{ fontSize:7, color:P.t3 }}>{cfg.icon} {cfg.label}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop:8, borderTop:`1px solid ${P.b}`, paddingTop:7 }}>
            <div style={{ fontSize:6, color:P.t4, marginBottom:4 }}>CASE COLOR DOTS</div>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
              {Object.entries(CASE_COLORS).map(([caseId, color]) => (
                <div key={caseId} style={{ display:"flex", gap:4, alignItems:"center" }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:color }}/>
                  <span style={{ fontSize:6, color:P.t4 }}>{caseId}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected event detail */}
        {selected ? (
          <div style={{ background:P.card, border:`2px solid ${(CATEGORY_CONFIG[selected.category]?.color||P.gold)}40`,
            borderTop:`3px solid ${CATEGORY_CONFIG[selected.category]?.color||P.gold}`,
            borderRadius:8, padding:"10px 14px" }}>
            <div style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:7 }}>
              <span style={{ fontSize:22 }}>{CATEGORY_CONFIG[selected.category]?.icon}</span>
              <div>
                <div style={{ fontSize:9, fontWeight:800, color:CATEGORY_CONFIG[selected.category]?.color||P.gold, marginBottom:2 }}>
                  {selected.label}
                </div>
                <div style={{ fontSize:7, color:P.t4 }}>{selected.date} · {selected.category}</div>
                {selected.case && (
                  <div style={{ marginTop:2, fontSize:6, background:`${CASE_COLORS[selected.case]||P.t4}18`,
                    border:`1px solid ${CASE_COLORS[selected.case]||P.t4}30`,
                    color:CASE_COLORS[selected.case]||P.t4, borderRadius:4, padding:"1px 6px", display:"inline-block" }}>
                    CASE: {selected.case}
                  </div>
                )}
              </div>
            </div>
            <div style={{ fontSize:8, color:P.t2, lineHeight:1.7 }}>{selected.detail}</div>
            <button onClick={() => setSelected(null)}
              style={{ marginTop:8, padding:"3px 9px", fontSize:7, fontWeight:700, cursor:"pointer",
                background:"transparent", border:`1px solid ${P.b}`, color:P.t4, borderRadius:5, fontFamily:"inherit" }}>
              ✕ Close
            </button>
          </div>
        ) : (
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:8, padding:"10px 14px",
            fontSize:7, color:P.t4, textAlign:"center", lineHeight:2 }}>
            Click any event on the timeline<br/>to view full details and case links.<br/>
            <span style={{ color:P.gold }}>Ctrl+scroll</span> to zoom · <span style={{ color:P.blue }}>Drag</span> to pan
          </div>
        )}
      </div>
    </div>
  );
}