import { P, KEY_STATS } from "../../lib/teData";

// Organized by category for better scannability
const TAB_GROUPS = {
  strategic: {
    label: "Strategic",
    color: P.gold,
    tabs: [
      { id:"home", icon:"🏠", label:"Dashboard" },
      { id:"insights", icon:"📈", label:"Insights" },
      { id:"briefing", icon:"🏛️", label:"CHC Brief" },
      { id:"knowledgebase", icon:"📚", label:"Knowledge Base" },
      { id:"exile", icon:"🇺🇸", label:"Exile Patriot" },
      { id:"piecharts", icon:"🥧", label:"Reports & Charts" },
      { id:"assistant", icon:"🔍", label:"AI Research" },
    ]
  },
  operations: {
    label: "Operations",
    color: P.blue,
    tabs: [
      { id:"social", icon:"📡", label:"Social Listening" },
      { id:"detentionhub", icon:"🔍", label:"Detention Hub" },
      { id:"autoscraper", icon:"🕷️", label:"Auto Scraper" },
      { id:"icelookup", icon:"🔴", label:"ICE Lookup" },
      { id:"foiamanager", icon:"📋", label:"FOIA Manager" },
    ]
  },
  analysis: {
    label: "Analysis",
    color: P.violet,
    tabs: [
      { id:"datamap", icon:"🗺️", label:"Data Map" },
      { id:"advocacygis", icon:"📍", label:"Advocacy GIS" },
      { id:"deportmap", icon:"🗺️", label:"Deportation Map" },
      { id:"horheatmap", icon:"🌡️", label:"HOR Heatmap" },
      { id:"veteran-timeline", icon:"📅", label:"Veteran Timeline" },
      { id:"mlrisk", icon:"🤖", label:"ML Risk Engine" },
      { id:"mlmodels", icon:"🤖", label:"ML Models" },
      { id:"mlexplorer", icon:"📄", label:"ML Explorer" },
      { id:"sheltermap", icon:"🗺️", label:"Shelter Map" },
      { id:"riskengine2", icon:"⚡", label:"Risk Engine" },
      { id:"casetimeline", icon:"📅", label:"Case Timeline" },
      { id:"caseexplorer", icon:"🎖️", label:"Case Explorer" },
      { id:"analytics", icon:"🧠", label:"Analytics" },
    ]
  },
  export: {
    label: "Export & Reports",
    color: P.amber,
    tabs: [
      { id:"intelreport", icon:"🧠", label:"Intel Report Generator" },
      { id:"comprehensive", icon:"📊", label:"Full Report" },
      { id:"reportgen", icon:"🧾", label:"Report Generator" },
      { id:"legislative", icon:"🏛️", label:"Legislative Brief" },
      { id:"caseexport", icon:"📦", label:"Case Export" },
      { id:"chcreport", icon:"🏛️", label:"CHC Report (Old)" },
      { id:"chcbriefing", icon:"📊", label:"CHC Brief 2026" },
      { id:"chcexport", icon:"📤", label:"CHC Export" },
      { id:"canton", icon:"🚨", label:"CANTON URGENT" },
      { id:"forensicexp", icon:"📤", label:"Forensic Export" },
      { id:"exporthub", icon:"📤", label:"Export Hub" },
      { id:"scheduler", icon:"⏰", label:"Report Scheduler" },
    ]
  },
  research: {
    label: "Research & Data",
    color: P.teal,
    tabs: [
      { id:"forensichub", icon:"🔬", label:"Forensic Research Hub" },
      { id:"bulkupload", icon:"📥", label:"Bulk Upload Cases" },
      { id:"deportproceedings", icon:"⚖️", label:"Deportation Proceedings" },
      { id:"mexicoshelters", icon:"🏠", label:"Mexico Shelters" },
      { id:"sheltermap2", icon:"🗺️", label:"Shelter Map View" },
      { id:"tier4", icon:"🗄️", label:"TIER 4 Archives" },
      { id:"evidencelinker", icon:"🔗", label:"Evidence Linker" },
      { id:"sourceregistry", icon:"🗂️", label:"Source Registry" },
      { id:"subjecttimeline", icon:"🕰️", label:"Subject Timeline" },
      { id:"chicano", icon:"🎖️", label:"Chicano Casualties" },
      { id:"actionrequired", icon:"⚡", label:"Action Required" },
      { id:"forensicseries", icon:"📈", label:"Forensic Leads" },
      { id:"forensic", icon:"🔎", label:"Forensic Protocol" },
      { id:"forensicaudit", icon:"🧾", label:"Forensic Audit" },
      { id:"mexreport", icon:"🇲🇽", label:"Mexico KIA Report" },
      { id:"mxkia", icon:"⚰️", label:"MX KIA Forensic" },
      { id:"policymap", icon:"🗣️", label:"Policy Map" },
      { id:"researchsearch", icon:"🔬", label:"Research Search" },
      { id:"scholar", icon:"🎓", label:"Scholar Search" },
      { id:"ebsco", icon:"📖", label:"EBSCO Research" },
      { id:"databases",  icon:"🗄️", label:"Databases"          },
      { id:"researchdb", icon:"🔬", label:"Research DB Platform" },
      { id:"dbexpansion", icon:"📂", label:"DB Expansion Plan" },
      { id:"blueprint",  icon:"📄", label:"Blueprint (37-pg)" },
      { id:"archaudit",  icon:"🏗️", label:"Architecture Audit" },
      { id:"dcas", icon:"📊", label:"DCAS Audit" },
      { id:"census", icon:"📊", label:"Census Data" },
      { id:"intakemap", icon:"🗺️", label:"Intake Map" },
      { id:"n8n", icon:"⚡", label:"n8n Workflows" },
    ]
  },
};

const FOIA_OVERDUE = 2;
const CHC_DAYS = Math.ceil((new Date("2026-05-18") - new Date()) / 86400000);

export default function TENav({ tab, setTab }) {
  return (
    <div style={{ background:P.card, borderBottom:`2px solid ${P.gold}`, position:"sticky", top:0, zIndex:200, boxShadow:"0 2px 12px rgba(0,0,0,0.3)" }}>
      {/* Top gradient stripe */}
      <div style={{ height:3, background:`linear-gradient(90deg,${P.blue},${P.gold})` }} />

      {/* Brand + stats row */}
      <div style={{ padding:"14px 20px 8px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:16, flexWrap:"wrap" }}>
        {/* Brand */}
        <a href="https://albavoice.org" target="_blank" rel="noreferrer" style={{ textDecoration:"none", color:"inherit" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, cursor:"pointer", transition:"all .2s" }}>
            <div style={{ background:`linear-gradient(135deg,${P.gold},${P.blue})`, borderRadius:8, padding:"8px 14px",
              fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:800, color:"#000", boxShadow:`0 0 16px ${P.gold}60` }}>
              TE360
            </div>
            <div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:800, color:P.gold, lineHeight:1 }}>
                TruthEngine<span style={{ color:P.gold }}>360</span>
              </div>
              <div style={{ fontSize:8, color:P.t3, letterSpacing:2, marginTop:2, fontWeight:600 }}>AUMER FOUNDATION · FORENSIC CIVIC INTELLIGENCE</div>
            </div>
          </div>
        </a>

        {/* Live status bar */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
          {FOIA_OVERDUE > 0 && (
            <button onClick={() => setTab("foia")}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px",
                background:`${P.blue}20`, border:`1px solid ${P.blue}`, borderRadius:7,
                color:P.t2, fontSize:8, fontWeight:700, cursor:"pointer" }}>
              ⚠ {FOIA_OVERDUE} FOIA OVERDUE
            </button>
          )}

          {[
            { v:KEY_STATS.verifiedCases, l:"Verified Cases", c:P.gold },
            { v:"58,220", l:"DCAS Records", c:P.blue },
            { v:"349", l:"Official Hisp.", c:P.gold },
            { v:"2,309", l:"BISG Estimate", c:P.blue },
            { v:"~500", l:"MX KIA Est.", c:P.red },
            { v:"202,864", l:"MX Deported", c:P.red },
            { v:"713,464", l:"ICE Records", c:P.amber },
            { v:`${CHC_DAYS}d`, l:"CHC Brief", c: CHC_DAYS <= 30 ? P.gold : P.blue },
          ].map((s,i) => (
            <div key={i} style={{ background:P.card2, border:`1px solid ${s.c}30`,
              borderTop:`3px solid ${s.c}`, borderRadius:7, padding:"6px 12px", textAlign:"center", minWidth:70 }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:800, color:s.c, lineHeight:1 }}>{s.v}</div>
              <div style={{ fontSize:6, color:P.t4, marginTop:1 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar with categories */}
      <div style={{ padding:"8px 20px 12px", overflowX:"auto", overflowY:"hidden" }}>
        {Object.entries(TAB_GROUPS).map(([groupKey, group]) => (
          <div key={groupKey} style={{ marginBottom:8 }}>
            <div style={{ fontSize:8, fontWeight:800, letterSpacing:2, color:group.color, marginBottom:8, opacity:1, textTransform:"uppercase", padding:"6px 10px", background:`${group.color}12`, borderLeft:`4px solid ${group.color}`, borderRadius:6, display:"flex", alignItems:"center", gap:6 }}>
              <span style={{fontSize:14,opacity:0.8}}>●</span> {group.label}
            </div>
            <div style={{ display:"flex", gap:3, overflowX:"auto" }}>
              {group.tabs.map(t => {
                const isActive = tab === t.id;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    style={{ padding:"10px 16px", background: isActive ? `${group.color}25` : `${group.color}05`,
                      border: `2px solid ${isActive ? group.color : group.color+'30'}`,
                      borderRadius:10, color: isActive ? group.color : P.t4,
                      fontSize:11, fontWeight: isActive ? 800 : 700, cursor:"pointer",
                      whiteSpace:"nowrap", fontFamily:"'IBM Plex Mono',monospace",
                      transition:"all .15s", display:"flex", alignItems:"center", gap:7, position:"relative",
                      boxShadow: isActive ? `0 0 12px ${group.color}40` : 'none' }}>
                    <span style={{ fontSize:18, lineHeight:1 }}>{t.icon}</span>
                    <span>{t.label}</span>
                    {["home","detentionhub","riskengine2","dcas","veterans","foia"].includes(t.id) &&
                      <span style={{ fontSize:7, color:P.gold, marginLeft:"auto", fontWeight:700, opacity:0.7 }}>⌘</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}