import { P, KEY_STATS } from "../../lib/teData";

const TAB_GROUPS = {
  strategic: {
    label: "Strategic",
    color: P.gold,
    tabs: [
      { id:"home",         label:"Dashboard"         },
      { id:"insights",     label:"Insights"          },
      { id:"briefing",     label:"CHC Brief"         },
      { id:"knowledgebase",label:"Knowledge Base"    },
      { id:"exile",        label:"Exile Patriot"     },
      { id:"piecharts",    label:"Reports & Charts"  },
      { id:"assistant",    label:"AI Research"       },
    ]
  },
  operations: {
    label: "Operations",
    color: P.blue,
    tabs: [
      { id:"social",       label:"Social Listening"  },
      { id:"detentionhub", label:"Detention Hub"     },
      { id:"autoscraper",  label:"Auto Scraper"      },
      { id:"icelookup",    label:"ICE Lookup"        },
      { id:"foiamanager",  label:"FOIA Manager"      },
    ]
  },
  analysis: {
    label: "Analysis",
    color: "#a78bfa",
    tabs: [
      { id:"datamap",          label:"Data Map"          },
      { id:"advocacygis",      label:"Advocacy GIS"      },
      { id:"deportmap",        label:"Deportation Map"   },
      { id:"horheatmap",       label:"HOR Heatmap"       },
      { id:"veteran-timeline", label:"Veteran Timeline"  },
      { id:"mlrisk",           label:"ML Risk Engine"    },
      { id:"mlmodels",         label:"ML Models"         },
      { id:"mlexplorer",       label:"ML Explorer"       },
      { id:"sheltermap",       label:"Shelter Map"       },
      { id:"riskengine2",      label:"Risk Engine"       },
      { id:"casetimeline",     label:"Case Timeline"     },
      { id:"caseexplorer",     label:"Case Explorer"     },
      { id:"analytics",        label:"Analytics"         },
    ]
  },
  export: {
    label: "Export & Reports",
    color: P.amber,
    tabs: [
      { id:"intelreport",  label:"Intel Report"       },
      { id:"comprehensive",label:"Full Report"         },
      { id:"reportgen",    label:"Report Generator"   },
      { id:"legislative",  label:"Legislative Brief"  },
      { id:"caseexport",   label:"Case Export"        },
      { id:"chcreport",    label:"CHC Report (Old)"   },
      { id:"chcbriefing",  label:"CHC Brief 2026"     },
      { id:"chcexport",    label:"CHC Export"         },
      { id:"canton",       label:"CANTON URGENT"      },
      { id:"forensicexp",  label:"Forensic Export"    },
      { id:"exporthub",    label:"Export Hub"         },
      { id:"scheduler",    label:"Report Scheduler"   },
    ]
  },
  research: {
    label: "Research & Data",
    color: P.teal,
    tabs: [
      { id:"forensichub",       label:"Forensic Research Hub"    },
      { id:"bulkupload",        label:"Bulk Upload Cases"        },
      { id:"deportproceedings", label:"Deportation Proceedings"  },
      { id:"mexicoshelters",    label:"Mexico Shelters"          },
      { id:"sheltermap2",       label:"Shelter Map View"         },
      { id:"tier4",             label:"TIER 4 Archives"          },
      { id:"evidencelinker",    label:"Evidence Linker"          },
      { id:"sourceregistry",    label:"Source Registry"          },
      { id:"subjecttimeline",   label:"Subject Timeline"         },
      { id:"chicano",           label:"Chicano Casualties"       },
      { id:"actionrequired",    label:"Action Required"          },
      { id:"forensicseries",    label:"Forensic Leads"           },
      { id:"forensic",          label:"Forensic Protocol"        },
      { id:"forensicaudit",     label:"Forensic Audit"           },
      { id:"mexreport",         label:"Mexico KIA Report"        },
      { id:"mxkia",             label:"MX KIA Forensic"          },
      { id:"policymap",         label:"Policy Map"               },
      { id:"researchsearch",    label:"Research Search"          },
      { id:"scholar",           label:"Scholar Search"           },
      { id:"ebsco",             label:"EBSCO Research"           },
      { id:"databases",         label:"Databases"                },
      { id:"researchdb",        label:"Research DB Platform"     },
      { id:"dbexpansion",       label:"DB Expansion Plan"        },
      { id:"blueprint",         label:"Blueprint (37-pg)"        },
      { id:"archaudit",         label:"Architecture Audit"       },
      { id:"dcas",              label:"DCAS Audit"               },
      { id:"census",            label:"Census Data"              },
      { id:"intakemap",         label:"Intake Map"               },
      { id:"n8n",               label:"n8n Workflows"            },
    ]
  },
  forensic: {
    label: "Forensic Intelligence",
    color: P.red,
    tabs: [
      { id:"forensiccc",      label:"Forensic Command Center" },
      { id:"evidencevault",   label:"Evidence Vault"          },
      { id:"claimengine",     label:"Claim Engine"            },
      { id:"milresearchdb",   label:"Military Research DB"    },
      { id:"deportedmarines", label:"Deported Marines"        },
      { id:"dbmaster",        label:"Master DB Index (565)"   },
      { id:"behaviorvectors", label:"Behavior Vectors"        },
      { id:"foiaescalation",  label:"FOIA Escalation"         },
      { id:"capture",         label:"Capture-Recapture"       },
      { id:"crossborderp1",   label:"Cross-Border Phase 1"    },
      { id:"neroradial",      label:"NERO Radial"             },
    ]
  },
  cases: {
    label: "Case Management",
    color: P.blue,
    tabs: [
      { id:"chcbriefgen",    label:"CHC Briefing Generator"  },
      { id:"chcdasboard",    label:"CHC Brief Dashboard"      },
      { id:"chcinquiry",     label:"CHC Inquiry Letter"       },
      { id:"chcautoreport",  label:"CHC Auto Report"          },
      { id:"canton",         label:"CANTON URGENT"            },
      { id:"detailview",     label:"Case Detail View"         },
      { id:"gaptracker",     label:"Institutional Gap"        },
      { id:"outreach",       label:"Outreach Dashboard"       },
      { id:"univcrm",        label:"University CRM"           },
      { id:"knowledgemgr",   label:"Knowledge Base Mgr"      },
    ]
  },
};

const FOIA_OVERDUE = 2;
const CHC_DAYS = Math.ceil((new Date("2026-05-18") - new Date()) / 86400000);

export default function TENav({ tab, setTab }) {
  return (
    <div style={{
      background:"#0A1020",
      borderBottom:`1px solid rgba(255,255,255,0.08)`,
      position:"sticky", top:0, zIndex:200,
      boxShadow:"0 2px 20px rgba(0,0,0,0.6)",
    }}>
      {/* Gradient accent strip */}
      <div style={{ height:2, background:`linear-gradient(90deg,${P.blue},${P.gold},${P.teal})` }}/>

      {/* Brand + stats row */}
      <div style={{ padding:"12px 20px 10px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:16, flexWrap:"wrap" }}>
        {/* Brand */}
        <a href="https://albavoice.org" target="_blank" rel="noreferrer" style={{ textDecoration:"none", color:"inherit" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}>
            <div style={{
              background:`linear-gradient(135deg,${P.gold},${P.blue})`,
              borderRadius:7, padding:"7px 13px",
              fontFamily:"'IBM Plex Mono',monospace", fontSize:16, fontWeight:800, color:"#000",
              boxShadow:`0 0 14px ${P.gold}50`,
            }}>TE360</div>
            <div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:17, fontWeight:800, color:P.gold, lineHeight:1 }}>
                TruthEngine<span style={{ color:"#FCD34D" }}>360</span>
              </div>
              <div style={{ fontSize:9, color:P.t3, letterSpacing:2, marginTop:2, fontWeight:600 }}>
                AUMER FOUNDATION · FORENSIC CIVIC INTELLIGENCE
              </div>
            </div>
          </div>
        </a>

        {/* Live stats bar */}
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
          {FOIA_OVERDUE > 0 && (
            <button onClick={() => setTab("foia")} style={{
              display:"flex", alignItems:"center", gap:5, padding:"5px 12px",
              background:`${P.red}12`, border:`1px solid ${P.red}35`, borderRadius:7,
              color:P.red, fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
              letterSpacing:0.3,
            }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:P.red, animation:"pulse 1.5s infinite" }}/>
              {FOIA_OVERDUE} FOIA OVERDUE
            </button>
          )}
          {[
            { v:KEY_STATS.verifiedCases, l:"Verified Cases", c:P.gold },
            { v:"58,220",                l:"DCAS Records",   c:P.blue },
            { v:"349",                   l:"Official Hisp.", c:P.gold },
            { v:"2,309",                 l:"BISG Estimate",  c:P.blue },
            { v:"~500",                  l:"MX KIA Est.",    c:P.red  },
            { v:"202,864",               l:"MX Deported",    c:P.red  },
            { v:"713,464",               l:"ICE Records",    c:P.amber},
            { v:`${CHC_DAYS}d`,          l:"CHC Brief",      c:CHC_DAYS<=30?P.red:P.gold },
          ].map((s,i) => (
            <div key={i} style={{
              background:"#0D1525", border:`1px solid ${s.c}25`,
              borderTop:`2px solid ${s.c}`, borderRadius:7,
              padding:"6px 12px", textAlign:"center", minWidth:68,
            }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:800, color:s.c, lineHeight:1 }}>{s.v}</div>
              <div style={{ fontSize:9, color:P.t3, marginTop:2, letterSpacing:0.5 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab groups */}
      <div style={{ padding:"8px 20px 12px", overflowX:"auto", overflowY:"hidden" }}>
        {Object.entries(TAB_GROUPS).map(([groupKey, group]) => (
          <div key={groupKey} style={{ marginBottom:10 }}>
            {/* Group label */}
            <div style={{
              fontSize:9, fontWeight:700, letterSpacing:2, color:group.color,
              textTransform:"uppercase", marginBottom:6,
              paddingLeft:8, borderLeft:`3px solid ${group.color}`,
              opacity:0.9,
            }}>{group.label}</div>
            {/* Tab buttons */}
            <div style={{ display:"flex", gap:4, overflowX:"auto", paddingBottom:2 }}>
              {group.tabs.map(t => {
                const isActive = tab === t.id;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)} style={{
                    padding:"7px 13px",
                    background: isActive ? `${group.color}20` : "transparent",
                    border: `1px solid ${isActive ? group.color + "60" : group.color + "18"}`,
                    borderBottom: isActive ? `2px solid ${group.color}` : `2px solid transparent`,
                    borderRadius:6,
                    color: isActive ? group.color : P.t3,
                    fontSize:10, fontWeight: isActive ? 700 : 500, cursor:"pointer",
                    whiteSpace:"nowrap", fontFamily:"'IBM Plex Mono',monospace",
                    transition:"all .12s", letterSpacing:0.3,
                    boxShadow: isActive ? `0 0 10px ${group.color}30` : "none",
                  }}>{t.label}</button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
