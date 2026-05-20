import { useState } from "react";
import { P, CASES } from "../../lib/teData";
import EvidenceTimelineMap from "./EvidenceTimelineMap";

const TIMELINE_EVENTS = [
  // Historical
  { id:"e1",  date:"1965-01-01", year:1965, type:"historical", severity:"high",
    title:"Vietnam Escalation — Non-Citizens Drafted",
    body:"Tens of thousands of non-citizen residents drafted under Military Selective Service Act. No citizenship guarantee made explicit.",
    tags:["Vietnam","Draft","Non-Citizen"], source:"Selective Service Act §1630" },
  { id:"e2",  date:"1969-01-01", year:1969, type:"research", severity:"med",
    title:"Guzmán Study: 6.01% Hispanic Casualties",
    body:"Ralph Guzmán documents 6.01% Hispanic casualty rate — 10× DCAS official figure. First academic challenge to military data.",
    tags:["Guzmán","Research","DCAS","Stream 4"], source:"Guzmán 1969 — Ethnicity & War" },
  { id:"e3",  date:"1975-04-30", year:1975, type:"historical", severity:"high",
    title:"Vietnam War Ends — DCAS Closed",
    body:"DCAS data frozen at 58,220 casualties. Hispanic ethnic identifier field left inconsistently coded. 84.9% gap embedded.",
    tags:["DCAS","Vietnam","Historical"], source:"DoD DCAS Vietnam Extract" },
  // Legal
  { id:"e4",  date:"1996-09-30", year:1996, type:"legal", severity:"critical",
    title:"IIRIRA Enacted — Retroactive Deportation",
    body:"Illegal Immigration Reform and Immigrant Responsibility Act strips immigration judges of discretion. Retroactively criminalizes honorable service. Veterans with pre-1996 offenses made immediately deportable.",
    tags:["IIRIRA","Legal","Retroactive","Critical"], source:"Pub.L. 104-208 §321" },
  { id:"e5",  date:"2003-01-01", year:2003, type:"legal", severity:"high",
    title:"INA §329 — Wartime Naturalization Clarified",
    body:"Immigration and Nationality Act §329 reaffirms wartime service naturalization — but IIRIRA loophole remains. Thousands already deported.",
    tags:["INA","Legal","Naturalization"], source:"INA §329" },
  // AUMER Research
  { id:"e6",  date:"2019-07-01", year:2019, type:"research", severity:"high",
    title:"GAO-19-416: 92 Confirmed Deported Veterans",
    body:"GAO confirms only 92 ICE-acknowledged deportations 2013–2018. Advocacy estimates exceed 94,000. BI-2 Estimation Vacuum documented.",
    tags:["GAO","ICE","NERO-O"], source:"GAO-19-416" },
  { id:"e7",  date:"2021-02-02", year:2021, type:"legal", severity:"med",
    title:"EO-14012 — IMMVI Task Force",
    body:"Biden Executive Order 14012 creates Interagency Task Force on New Americans. Military naturalization pathway re-examined.",
    tags:["EO-14012","Biden","IMMVI"], source:"Federal Register 86 FR 8277" },
  { id:"e8",  date:"2022-01-01", year:2022, type:"research", severity:"high",
    title:"BISG Forensic Audit — τ=0.40 Selected",
    body:"AUMER applies BISG to all 58,220 DCAS records. τ=0.40 yields 2,309 Hispanic casualties. 84.9% classification failure confirmed. R²=0.947.",
    tags:["BISG","DCAS","Forensic","AUMER"], source:"AUMER Foundation Internal Audit" },
  { id:"e9",  date:"2023-06-01", year:2023, type:"case", severity:"high",
    title:"C001 Ramos — SHA-256 Certified Gold",
    body:"SGT George Ramos case achieves CB-HSIVF Gold certification. Vietnam MOH recipient. 96% confidence. Manuscript core narrative.",
    tags:["C001","Ramos","Gold","SHA-256"], source:"CB-HSIVF Case File C001" },
  { id:"e10", date:"2024-01-15", year:2024, type:"foia", severity:"high",
    title:"NERO Framework Published",
    body:"AUMER publishes NERO (Notification/Erasure/Restriction/Obscurity) institutional scoring. Composite: 94.5/100. ICE Directive 10039.2 cited.",
    tags:["NERO","Framework","Institutional"], source:"AUMER NERO v1.0" },
  { id:"e11", date:"2025-09-15", year:2025, type:"foia", severity:"critical",
    title:"F001 FOIA Filed — VA BIRLS Records",
    body:"AUMER files FOIA with VA SAOF for BIRLS veteran identification records. Statutory response window: 20 days.",
    tags:["FOIA","VA","F001","BIRLS"], source:"FOIA Request F001" },
  { id:"e12", date:"2025-10-15", year:2025, type:"foia", severity:"critical",
    title:"F002 FOIA Filed — ICE ENFORCE Database",
    body:"AUMER files FOIA with ICE for ENFORCE deportation crosswalk data critical to DHS/veteran intersection analysis.",
    tags:["FOIA","ICE","F002","ENFORCE"], source:"FOIA Request F002" },
  { id:"e13", date:"2025-11-14", year:2025, type:"foia", severity:"critical",
    title:"F001 VA FOIA — OVERDUE (Day 1)",
    body:"VA SAOF misses 20-day statutory deadline. AUMER begins escalation protocol. CHC blocking identified.",
    tags:["FOIA","VA","Overdue","Critical"], source:"FOIA Tracking System" },
  { id:"e14", date:"2025-11-20", year:2025, type:"case", severity:"critical",
    title:"C004 Sae Joon Park — Self-Deports Under ICE Order",
    body:"Korean-born USMC veteran Sae Joon Park self-deports Nov/Dec 2025 under ICE removal order. IIRIRA §237(a)(2)(A)(iii) applied retroactively. ⚡ URGENT.",
    tags:["C004","Park","URGENT","ICE","IIRIRA"], source:"CB-HSIVF Case File C004" },
  { id:"e15", date:"2025-12-14", year:2025, type:"foia", severity:"critical",
    title:"F002 ICE FOIA — OVERDUE (Day 1)",
    body:"ICE misses statutory FOIA deadline. Both VA and ICE requests now overdue. CHC brief data package incomplete.",
    tags:["FOIA","ICE","Overdue","Critical"], source:"FOIA Tracking System" },
  { id:"e16", date:"2026-01-01", year:2026, type:"research", severity:"high",
    title:"BISG Sweep — 2,309 Stable Band Confirmed",
    body:"AUMER re-runs BISG across τ=0.10–0.90. Estimate stable 2,309–2,891 across full band. Bernoulli sum variance ±2,308.7.",
    tags:["BISG","Statistics","Convergence"], source:"AUMER Analytics v2" },
  { id:"e17", date:"2026-04-09", year:2026, type:"milestone", severity:"high",
    title:"TODAY — TruthEngine360 Active",
    body:"39 days to CHC briefing. 2 FOIA requests overdue (83d + 66d). 6 cases certified. Evidence chain complete pending FOIA data.",
    tags:["Milestone","CHC","Active"], source:"TruthEngine360" },
  { id:"e18", date:"2026-05-18", year:2026, type:"milestone", severity:"critical",
    title:"CHC BRIEFING — May 18, 2026",
    body:"Congressional Hispanic Caucus briefing. DCAS anomaly, 6 CB-HSIVF cases, NERO scores, legislative asks. Full evidence package required.",
    tags:["CHC","Congressional","Briefing"], source:"CHC Calendar" },
];

const TYPE_CONFIG = {
  historical:  { color:P.blue,   icon:"📜", label:"Historical" },
  legal:       { color:P.red,    icon:"⚖️", label:"Legal" },
  research:    { color:P.violet, icon:"🔬", label:"Research" },
  foia:        { color:P.amber,  icon:"📋", label:"FOIA" },
  case:        { color:P.gold,   icon:"🎖️", label:"Case" },
  milestone:   { color:P.teal,   icon:"🏛️", label:"Milestone" },
};

const SEV_C = { critical:P.red, high:P.amber, med:P.blue, low:P.t4 };

export default function EvidenceTimeline() {
  const [filter, setFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [search, setSearch] = useState("");
  const [yearRange, setYearRange] = useState([1965, 2026]);
  const [viewMode, setViewMode] = useState("timeline"); // timeline | list | map
  const [selectedLocation, setSelectedLocation] = useState(null);

  const filtered = TIMELINE_EVENTS.filter(e =>
    (filter === "all" || e.type === filter) &&
    (e.year >= yearRange[0] && e.year <= yearRange[1]) &&
    (!search || e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
  );

  // If location is selected, further filter to events at that location
  const locationEventMap = {
    washington_dc: ["e2", "e4", "e5", "e6", "e7", "e8", "e10", "e11", "e12", "e13", "e15", "e16", "e17", "e18"],
    arlington_va: ["e1", "e9"],
    vietnam: ["e3"],
    south_korea: ["e14"],
  };
  const displayEvents = selectedLocation
    ? filtered.filter(e => locationEventMap[selectedLocation]?.includes(e.id))
    : filtered;

  const years = [...new Set(TIMELINE_EVENTS.map(e => e.year))].sort();
  const eventsByYear = {};
  filtered.forEach(e => {
    if (!eventsByYear[e.year]) eventsByYear[e.year] = [];
    eventsByYear[e.year].push(e);
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:10, flexWrap:"wrap" }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:12, fontWeight:800, color:P.t1, marginBottom:2 }}>
            📅 Evidence <span style={{ color:P.gold }}>Timeline</span>
          </div>
          <div style={{ fontSize:7, color:P.t4, letterSpacing:2 }}>
            {filtered.length} EVENTS · {yearRange[0]}–{yearRange[1]} · FORENSIC CHRONOLOGY
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {["timeline","list","map"].map(v=>(
            <button key={v} onClick={()=>setViewMode(v)}
              style={{ padding:"5px 12px", fontSize:8, fontWeight:700, cursor:"pointer",
                background:viewMode===v?`${P.gold}18`:"transparent",
                border:`1px solid ${viewMode===v?P.gold:P.b}`,
                color:viewMode===v?P.gold:P.t4, borderRadius:7 }}>
              {v==="timeline"?"⏱ Timeline":v==="list"?"☰ List":"🗺️ Map"}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap", alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search events..."
          style={{ padding:"5px 12px", background:"#080D18", border:`1px solid ${search?P.gold:P.b}`,
            borderRadius:20, color:P.t1, fontSize:8, outline:"none", width:140 }} />
        <button onClick={()=>setFilter("all")}
          style={{ padding:"3px 10px", fontSize:7, background:filter==="all"?`${P.t4}15`:"transparent",
            border:`1px solid ${filter==="all"?P.t3:P.b}`, color:filter==="all"?P.t2:P.t4, borderRadius:20, cursor:"pointer" }}>
          All ({TIMELINE_EVENTS.length})
        </button>
        {Object.entries(TYPE_CONFIG).map(([k,v])=>(
          <button key={k} onClick={()=>setFilter(filter===k?"all":k)}
            style={{ padding:"3px 10px", fontSize:7, cursor:"pointer",
              background:filter===k?`${v.color}18`:"transparent",
              border:`1px solid ${filter===k?v.color:P.b}`,
              color:filter===k?v.color:P.t4, borderRadius:20 }}>
            {v.icon} {v.label}
          </button>
        ))}
        {/* Year range */}
        <div style={{ marginLeft:"auto", display:"flex", gap:6, alignItems:"center" }}>
          <span style={{ fontSize:7, color:P.t4 }}>From:</span>
          <select value={yearRange[0]} onChange={e=>setYearRange([+e.target.value,yearRange[1]])}
            style={{ padding:"3px 6px", background:"#080D18", border:`1px solid ${P.b}`, color:P.t2, fontSize:7, borderRadius:5, outline:"none" }}>
            {years.map(y=><option key={y}>{y}</option>)}
          </select>
          <span style={{ fontSize:7, color:P.t4 }}>To:</span>
          <select value={yearRange[1]} onChange={e=>setYearRange([yearRange[0],+e.target.value])}
            style={{ padding:"3px 6px", background:"#080D18", border:`1px solid ${P.b}`, color:P.t2, fontSize:7, borderRadius:5, outline:"none" }}>
            {years.map(y=><option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display:"flex", gap:12, height:"calc(100vh - 260px)" }}>
        {/* Timeline / List / Map */}
        <div style={{ flex:1, overflowY:viewMode==="map"?"hidden":"auto", maxHeight:viewMode==="map"?"100%":"calc(100vh - 280px)" }}>
          {viewMode === "map" ? (
            <EvidenceTimelineMap
              events={filtered}
              selectedEvent={selectedEvent}
              onEventSelect={setSelectedEvent}
              selectedLocation={selectedLocation}
              onLocationSelect={setSelectedLocation}
            />
          ) : viewMode === "timeline" ? (
            <div style={{ position:"relative" }}>
              {/* Vertical spine */}
              <div style={{ position:"absolute", left:60, top:0, bottom:0, width:2,
                background:`linear-gradient(180deg,${P.blue},${P.violet},${P.red})`, opacity:0.3 }} />

              {Object.entries(eventsByYear).sort(([a],[b])=>+a-+b).map(([year, events])=>(
                <div key={year} style={{ marginBottom:6 }}>
                  {/* Year marker */}
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                    <div style={{ width:60, textAlign:"right", fontFamily:"'IBM Plex Mono',monospace",
                      fontSize:11, fontWeight:800, color:+year===2026?P.gold:+year<=1996?P.blue:P.t3 }}>
                      {year}
                    </div>
                    <div style={{ width:10, height:10, borderRadius:"50%", flexShrink:0,
                      background:+year===2026?P.gold:+year===1996?P.red:P.b,
                      boxShadow:+year===2026?`0 0 8px ${P.gold}`:+year===1996?`0 0 8px ${P.red}`:"none",
                      border:`2px solid ${+year===2026?P.gold:P.t4}`, zIndex:1 }} />
                  </div>
                  {/* Events under year */}
                  {events.map(ev=>{
                    const tc = TYPE_CONFIG[ev.type];
                    const sc = SEV_C[ev.severity];
                    const isSel = selectedEvent?.id === ev.id;
                    return (
                      <div key={ev.id} onClick={()=>setSelectedEvent(isSel?null:ev)}
                        style={{ marginLeft:80, marginBottom:6, cursor:"pointer",
                          background:isSel?`${tc.color}10`:P.card,
                          border:`1px solid ${isSel?tc.color+"50":P.b+"40"}`,
                          borderLeft:`4px solid ${ev.severity==="critical"?P.red:tc.color}`,
                          borderRadius:8, padding:"8px 12px", transition:"all .12s",
                          position:"relative" }}>
                        {/* Connector */}
                        <div style={{ position:"absolute", left:-22, top:"50%", width:20, height:1,
                          background:tc.color, opacity:0.3 }} />
                        <div style={{ display:"flex", gap:6, alignItems:"flex-start" }}>
                          <span style={{ fontSize:13, flexShrink:0 }}>{tc.icon}</span>
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap", marginBottom:2 }}>
                              <span style={{ fontSize:9, fontWeight:800,
                                color:ev.severity==="critical"?P.red:P.t1 }}>{ev.title}</span>
                              {ev.severity==="critical"&&<span style={{ fontSize:6, background:`${P.red}20`,
                                border:`1px solid ${P.red}30`, color:P.red, borderRadius:20, padding:"1px 6px", fontWeight:700 }}>⚡ CRITICAL</span>}
                              <span style={{ fontSize:6, background:`${tc.color}12`, border:`1px solid ${tc.color}20`,
                                color:tc.color, borderRadius:20, padding:"1px 6px" }}>{tc.label}</span>
                            </div>
                            <div style={{ fontSize:8, color:P.t3, lineHeight:1.5 }}>{ev.body}</div>
                            {isSel && (
                              <div style={{ marginTop:6, paddingTop:6, borderTop:`1px solid ${P.b}20` }}>
                                <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:4 }}>
                                  {ev.tags.map(t=>(
                                    <span key={t} style={{ fontSize:6, background:`${tc.color}10`, border:`1px solid ${tc.color}20`,
                                      color:tc.color, borderRadius:20, padding:"1px 6px" }}>{t}</span>
                                  ))}
                                </div>
                                <div style={{ fontSize:7, color:P.t4 }}>Source: {ev.source} · {ev.date}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            // List view
            displayEvents.map(ev=>{
              const tc = TYPE_CONFIG[ev.type];
              const isSel = selectedEvent?.id === ev.id;
              return (
                <div key={ev.id} onClick={()=>setSelectedEvent(isSel?null:ev)}
                  style={{ background:isSel?`${tc.color}10`:P.card,
                    border:`1px solid ${isSel?tc.color+"50":P.b+"40"}`,
                    borderLeft:`4px solid ${ev.severity==="critical"?P.red:tc.color}`,
                    borderRadius:8, padding:"8px 12px", marginBottom:5, cursor:"pointer" }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:P.t4, width:36, flexShrink:0 }}>{ev.year}</span>
                    <span style={{ fontSize:12 }}>{tc.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:9, fontWeight:700, color:ev.severity==="critical"?P.red:P.t1 }}>{ev.title}</div>
                      {isSel && <div style={{ fontSize:8, color:P.t3, marginTop:3, lineHeight:1.5 }}>{ev.body}</div>}
                    </div>
                    <span style={{ fontSize:6, background:`${tc.color}10`, color:tc.color, borderRadius:20, padding:"1px 7px", border:`1px solid ${tc.color}20` }}>{tc.label}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Stats sidebar */}
        <div style={{ width:180, flexShrink:0 }}>
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"10px 12px", marginBottom:8 }}>
            <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:6 }}>TIMELINE STATS</div>
            {[
              ["Total Events", TIMELINE_EVENTS.length, P.blue],
              ["Critical", TIMELINE_EVENTS.filter(e=>e.severity==="critical").length, P.red],
              ["Legal Events", TIMELINE_EVENTS.filter(e=>e.type==="legal").length, P.red],
              ["FOIA Events",  TIMELINE_EVENTS.filter(e=>e.type==="foia").length, P.amber],
              ["Cases", TIMELINE_EVENTS.filter(e=>e.type==="case").length, P.gold],
              ["Years Covered", `${years[0]}–${years[years.length-1]}`, P.teal],
            ].map(([k,v,c])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:7,
                padding:"3px 0", borderBottom:`1px solid ${P.b}20` }}>
                <span style={{ color:P.t4 }}>{k}</span>
                <span style={{ color:c, fontWeight:700 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Key milestones */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"10px 12px" }}>
            <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:6 }}>KEY DATES</div>
            {[
              ["IIRIRA", "Sept 30, 1996", P.red],
              ["F001 Due", "Nov 14, 2025", P.amber],
              ["F002 Due", "Dec 14, 2025", P.amber],
              ["Park Deport", "Nov/Dec 2025", P.red],
              ["TODAY", "Apr 9, 2026", P.gold],
              ["CHC Brief", "May 18, 2026", P.teal],
            ].map(([k,v,c])=>(
              <div key={k} style={{ marginBottom:6, padding:"4px 8px", background:"#080D18", borderLeft:`3px solid ${c}`, borderRadius:4 }}>
                <div style={{ fontSize:7, color:c, fontWeight:700 }}>{k}</div>
                <div style={{ fontSize:6, color:P.t4 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}