import { P, KEY_STATS } from "../../lib/teData";

// Organized by category for better scannability
const TAB_GROUPS = {
  "core": {
    label: "Core Intelligence",
    icon: "🎯",
    color: "#60A5FA",
    tabs: [
      { id:"home",            icon:"🏠", label:"Dashboard"          },
      { id:"insights-overview",icon:"📊",label:"Analytics Overview" },
      { id:"assistant",       icon:"🔍", label:"AI Research"         },
      { id:"knowledgebase",   icon:"📚", label:"Knowledge Base"      },
      { id:"dcas-analytics",  icon:"🧮", label:"DCAS Analytics"      },
    ]
  },
  "case-management": {
    label: "Case Management",
    icon: "📋",
    color: "#34D399",
    tabs: [
      { id:"caseboard",    icon:"🃏", label:"Case Board"       },
      { id:"caseexplorer", icon:"🎖️", label:"Case Explorer"   },
      { id:"casetimeline", icon:"📅", label:"Case Timeline"   },
      { id:"evidence",     icon:"🔗", label:"Evidence Viewer" },
      { id:"casedetail",   icon:"📄", label:"Case Detail"     },
      { id:"gaptracker",   icon:"⚠️", label:"Gap Tracker"    },
      { id:"actionrequired",icon:"⚡",label:"Action Required" },
    ]
  },
  "geospatial-analysis": {
    label: "Geospatial Analysis",
    icon: "🗺️",
    color: "#F59E0B",
    tabs: [
      { id:"datamap", icon:"🗺️", label:"Unified Data Map" },
      { id:"advocacygis", icon:"📍", label:"Advocacy GIS" },
      { id:"deportmap", icon:"🗺️", label:"Deportation Map" },
      { id:"horheatmap", icon:"🌡️", label:"HOR Density Heatmap" },
      { id:"geomapping", icon:"🗺️", label:"Geospatial Dashboard" },
      { id:"intakemap", icon:"🗺️", label:"Intake Map" },
      { id:"sheltermap", icon:"🗺️", label:"Border Shelter Map" },
      { id:"sheltermap2", icon:"🗺️", label:"Shelter Map View" },
      { id:"sheltercluster", icon:"🎖️", label:"Shelter Clusters" },
      { id:"veteranmap", icon:"🗺️", label:"Veteran Map" },
    ]
  },
  "data-operations": {
    label: "Data Operations",
    icon: "📊",
    color: "#8B5CF6",
    tabs: [
      { id:"bulkupload", icon:"📥", label:"Bulk Upload Cases" },
      { id:"detentionhub", icon:"🔍", label:"Detention Hub" },
      { id:"autoscraper", icon:"🕷️", label:"Auto Scraper" },
      { id:"icelookup", icon:"🔴", label:"ICE Lookup" },
      { id:"foiamanager", icon:"📋", label:"FOIA Manager" },
      { id:"social", icon:"📡", label:"Social Listening" },
      { id:"deportproceedings", icon:"⚖️", label:"Deportation Proceedings" },
      { id:"mexicoshelters", icon:"🏠", label:"Mexico Shelters" },
    ]
  },
  "reporting": {
    label: "Reporting & Export",
    icon: "📊",
    color: "#EC4899",
    tabs: [
      { id:"veteranreporting", icon:"📊", label:"Veteran Report Builder" },
      { id:"intelreport", icon:"🧠", label:"Intel Report Generator" },
      { id:"comprehensive", icon:"📊", label:"Full Report" },
      { id:"legislative", icon:"🏛️", label:"Legislative Brief" },
      { id:"reportgen", icon:"🧾", label:"Report Generator" },
      { id:"briefing", icon:"🏛️", label:"CHC Brief" },
      { id:"chcreport", icon:"🏛️", label:"CHC Report" },
      { id:"chcbriefing", icon:"📊", label:"CHC Brief 2026" },
      { id:"exporthub", icon:"📤", label:"Export Hub" },
      { id:"caseexport", icon:"📦", label:"Case Export" },
      { id:"scheduler", icon:"⏰", label:"Report Scheduler" },
    ]
  },
  "statistical-analysis": {
    label: "Statistical Analysis",
    icon: "⚗️",
    color: "#F59E0B",
    tabs: [
      { id:"ptsd-analysis", icon:"📈", label:"PTSD Cohort Analysis" },
      { id:"template-generator", icon:"📜", label:"Report Template Builder" },
      { id:"publication-calendar", icon:"📅", label:"Publication Calendar" },
    ]
  },
  "forensic-research": {
    label: "Forensic Research",
    icon: "🔬",
    color: "#06B6D4",
    tabs: [
      { id:"forensichub", icon:"🔬", label:"Forensic Research Hub" },
      { id:"forensicaudit", icon:"🔍", label:"Forensic Audit" },
      { id:"forensic", icon:"🔎", label:"Forensic Protocol" },
      { id:"forensicseries", icon:"📈", label:"Forensic Leads" },
      { id:"forensicaudit", icon:"🧾", label:"Forensic Audit" },
      { id:"forensicexp", icon:"📤", label:"Forensic Export" },
      { id:"mexreport", icon:"🇲🇽", label:"Mexico KIA Report" },
      { id:"mxkia", icon:"⚰️", label:"MX KIA Forensic" },
      { id:"chicano", icon:"🎖️", label:"Chicano Casualties" },
      { id:"veteran-timeline", icon:"📅", label:"Veteran Life Events" },
    ]
  },
  "ml-predictive": {
    label: "ML & Predictive",
    icon: "🤖",
    color: "#10B981",
    tabs: [
      { id:"mlrisk", icon:"🤖", label:"ML Risk Engine" },
      { id:"riskengine2", icon:"⚡", label:"Interactive Risk Engine" },
      { id:"mlmodels", icon:"🤖", label:"ML Models Comparison" },
      { id:"mlexplorer", icon:"📄", label:"ML Algorithm Explorer" },
      { id:"riskscore", icon:"⚡", label:"Risk Score Dashboard" },
      { id:"churn", icon:"📉", label:"Churn Model" },
    ]
  },
  "academic-archives": {
    label: "Academic & Archives",
    icon: "🎓",
    color: "#F97316",
    tabs: [
      { id:"scholar", icon:"🎓", label:"Scholar Search" },
      { id:"ebsco", icon:"📖", label:"EBSCO Research" },
      { id:"blueprint", icon:"📄", label:"Blueprint (37-pg)" },
      { id:"tier4", icon:"🗄️", label:"TIER 4 Archives" },
      { id:"sourceregistry", icon:"🗂️", label:"Source Registry" },
      { id:"archaudit", icon:"🏗️", label:"Architecture Audit" },
      { id:"research-compare", icon:"⚖️", label:"Research Comparison" },
      { id:"sdsu", icon:"📚", label:"SDSU Collections" },
    ]
  },
  "database-management": {
    label: "Database Management",
    icon: "🗄️",
    color: "#6366F1",
    tabs: [
      { id:"databases", icon:"🗄️", label:"Databases Panel" },
      { id:"researchdb", icon:"🔬", label:"Research DB Platform" },
      { id:"dbexpansion", icon:"📂", label:"DB Expansion Plan" },
      { id:"dcas", icon:"📊", label:"DCAS Audit" },
      { id:"census", icon:"📊", label:"Census Data" },
      { id:"evidencelinker", icon:"🔗", label:"Evidence Linker" },
      { id:"capturecapture", icon:"📊", label:"Capture-Recapture" },
    ]
  },
  "policy-engagement": {
    label: "Policy & Engagement",
    icon: "🏛️",
    color: "#DC2626",
    tabs: [
      { id:"congressional",  icon:"🏛️", label:"Congressional Action" },
      { id:"insights",       icon:"📈", label:"Insights Dashboard"   },
      { id:"policy",         icon:"🗣️", label:"Policy Impact"        },
      { id:"outreach",       icon:"📣", label:"Outreach Dashboard"   },
      { id:"policymap",      icon:"🗣️", label:"Policy Map"           },
      { id:"researchsearch", icon:"🔬", label:"Research Search"      },
      { id:"legislative",    icon:"🏛️", label:"Legislative Briefing" },
      { id:"canton",         icon:"🚨", label:"CANTON URGENT"        },
      { id:"exile",          icon:"🇺🇸", label:"Exile Patriot"       },
    ]
  },
};

const FOIA_OVERDUE = 2;
const CHC_DAYS = Math.ceil((new Date("2026-05-18") - new Date()) / 86400000);

export default function TENav({ tab, setTab }) {
  return (
    <div style={{ background:"#0B0E14", borderBottom:`1px solid #374151`, position:"sticky", top:0, zIndex:200, boxShadow:"0 4px 24px rgba(0,0,0,0.4)" }}>
      {/* Brand + stats header */}
      <div style={{ padding:"16px 24px", borderBottom:"1px solid #374151" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:20, flexWrap:"wrap" }}>
          {/* Brand */}
          <a href="https://albavoice.org" target="_blank" rel="noreferrer" style={{ textDecoration:"none", color:"inherit" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ background:"linear-gradient(135deg,#3B82F6,#60A5FA)", borderRadius:6, padding:"8px 12px",
                fontSize:16, fontWeight:800, color:"#fff", boxShadow:"0 0 12px rgba(59,130,246,0.3)" }}>
                TE360
              </div>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:"#fff", lineHeight:1 }}>
                  TruthEngine<span style={{ color:"#60A5FA" }}>360</span>
                </div>
                <div style={{ fontSize:7, color:"#9CA3AF", letterSpacing:"0.1em", marginTop:2, fontWeight:600 }}>FORENSIC INTELLIGENCE PLATFORM</div>
              </div>
            </div>
          </a>

          {/* KPI Cards */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {[
              { v:KEY_STATS.verifiedCases, l:"Verified", c:"#3B82F6" },
              { v:"58.2K", l:"DCAS", c:"#10B981" },
              { v:"2,309", l:"Est. Cases", c:"#F59E0B" },
              { v:"713K", l:"ICE", c:"#EF4444" },
            ].map((s,i) => (
              <div key={i} style={{ background:"#1F2937", border:`1px solid ${s.c}30`, borderRadius:6, padding:"6px 12px" }}>
                <div style={{ fontSize:11, fontWeight:700, color:s.c }}>{s.v}</div>
                <div style={{ fontSize:6, color:"#9CA3AF", marginTop:1 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ padding:"0", overflowX:"auto", overflowY:"hidden", borderBottom:"1px solid #374151" }}>
        <div style={{ display:"flex", gap:0 }}>
          {Object.entries(TAB_GROUPS).map(([groupKey, group]) => {
            const hasActive = group.tabs.some(t => tab === t.id);
            return (
              <div
                key={groupKey}
                style={{
                  flex: 0,
                  minWidth: "fit-content",
                  paddingLeft: "24px",
                  paddingRight: "24px",
                  paddingTop: "12px",
                  paddingBottom: "12px",
                  borderBottom: hasActive ? `3px solid ${group.color}` : "3px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: hasActive ? `${group.color}08` : "transparent",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = `${group.color}12`}
                onMouseLeave={(e) => e.currentTarget.style.background = hasActive ? `${group.color}08` : "transparent"}
              >
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:14 }}>{group.icon}</span>
                  <span style={{ fontSize:9, fontWeight:700, color:hasActive ? group.color : "#D1D5DB", whiteSpace:"nowrap", letterSpacing:"0.05em" }}>
                    {group.label.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab buttons for active category */}
      <div style={{ padding:"12px 24px", borderBottom:"1px solid #1F2937", overflowX:"auto" }}>
        <div style={{ display:"flex", gap:6 }}>
          {Object.entries(TAB_GROUPS)
            .find(([_, group]) => group.tabs.some(t => tab === t.id))?.[1]?.tabs.map(t => {
              const isActive = tab === t.id;
              const categoryColor = Object.values(TAB_GROUPS).find(g => g.tabs.some(x => x.id === t.id))?.color || "#6366F1";
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{
                    padding:"7px 14px",
                    background: isActive ? `${categoryColor}20` : "transparent",
                    border: `1px solid ${isActive ? categoryColor : "#374151"}`,
                    color: isActive ? categoryColor : "#9CA3AF",
                    borderRadius: 6,
                    fontSize: 8,
                    fontWeight: isActive ? 700 : 500,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontFamily: "'IBM Plex Mono',monospace",
                    transition: "all 0.15s",
                    boxShadow: isActive ? `0 0 8px ${categoryColor}30` : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}>
                  <span style={{ fontSize:12 }}>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}