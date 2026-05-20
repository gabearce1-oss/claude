import { useState, useEffect, useRef } from "react";
import { P } from "../../lib/teData";

// ── MOCK LIVE FEED ──────────────────────────────────────────────
const LIVE_SIGNALS = [
  { id:1, source:"Reddit",   icon:"🔴", handle:"r/veterans",      text:"Deported vet from Tijuana shelter — 3rd Purple Heart, no VA access. Anyone have contacts?", score:91, tags:["shelter","va-denied","tijuana"], time:"2m ago",  risk:"HIGH"   },
  { id:2, source:"Bluesky",  icon:"🔵", handle:"@immigrantlaw",   text:"ICE memo leaked — new classification codes for non-citizen service members. This is a policy shift.", score:87, tags:["ice","policy","classification"], time:"7m ago",  risk:"HIGH"   },
  { id:3, source:"YouTube",  icon:"🟥", handle:"MilitaryTimes",   text:"Segment on deported veterans in Mexico. Comments flooding with case reports — at least 4 names mentioned.", score:78, tags:["media","names","cases"], time:"12m ago", risk:"MED"    },
  { id:4, source:"Reddit",   icon:"🔴", handle:"r/immigration",   text:"PTSD + drug charge → deportation pipeline confirmed again. 12 years after discharge.", score:95, tags:["ptsd","crime-lag","pipeline"], time:"18m ago", risk:"HIGH"   },
  { id:5, source:"Bluesky",  icon:"🔵", handle:"@lulac_official", text:"LULAC tracking 400+ deported vet cases now. Congressional inquiry filed this morning.", score:82, tags:["lulac","congress","advocacy"], time:"24m ago", risk:"MED"    },
  { id:6, source:"News",     icon:"📰", handle:"AP Wire",         text:"Arizona: ICE arrests 3 Vietnam-era veterans. Two served in combat. No deportation hearing scheduled.", score:99, tags:["arizona","vietnam","no-hearing"], time:"31m ago", risk:"CRIT"   },
  { id:7, source:"Reddit",   icon:"🔴", handle:"r/MexicoCity",    text:"Shelter in Nogales reporting 12 new intakes this week — highest in 18 months. All U.S. military service history.", score:74, tags:["nogales","intake-spike","shelter"], time:"45m ago", risk:"MED"    },
  { id:8, source:"TikTok",   icon:"⬛", handle:"@veteranvoices",  text:"Gone viral: deported vet holds Purple Heart outside Tijuana shelter. 2.1M views.", score:69, tags:["viral","tijuana","purple-heart"], time:"1h ago",  risk:"LOW"    },
  { id:9, source:"YouTube",  icon:"🟥", handle:"PBS NewsHour",    text:"New documentary segment: The Mathematics of Vietnam — citing BISG methodology and 346–741 estimate.", score:88, tags:["bisg","media","documentary"], time:"2h ago",  risk:"MED"    },
  { id:10,source:"News",     icon:"📰", handle:"Military Times",  text:"PTSD and criminal behavior: DoD report surfaces showing 14-year average lag. Matches TruthEngine360 model.", score:93, tags:["ptsd-lag","dod","match"], time:"3h ago",  risk:"HIGH"   },
];

const CLUSTERS = [
  { id:"C1", label:"Tijuana Shelter Spike",     count:47, delta:"+12 today",  color:P.red,    tags:["tijuana","shelter","intake"] },
  { id:"C2", label:"ICE Policy Shift Signals",  count:31, delta:"+8 today",   color:P.amber,  tags:["ice","policy","classification"] },
  { id:"C3", label:"PTSD → Crime → Deportation",count:89, delta:"+3 today",   color:P.violet, tags:["ptsd","crime-lag","pipeline"] },
  { id:"C4", label:"Congressional Mentions",    count:22, delta:"+5 today",   color:P.blue,   tags:["congress","advocacy","lulac"] },
  { id:"C5", label:"Media Amplification",       count:156,delta:"+34 today",  color:P.gold,   tags:["media","viral","documentary"] },
];

const SOURCE_STATUS = [
  { name:"Reddit",   icon:"🔴", status:"LIVE",    rate:"~40/hr",  trust:72 },
  { name:"Bluesky",  icon:"🔵", status:"LIVE",    rate:"~65/hr",  trust:84 },
  { name:"YouTube",  icon:"🟥", status:"LIVE",    rate:"~12/hr",  trust:89 },
  { name:"News APIs",icon:"📰", status:"LIVE",    rate:"~18/hr",  trust:95 },
  { name:"TikTok",   icon:"⬛", status:"LIMITED", rate:"manual",  trust:61 },
  { name:"Twitter/X",icon:"🐦", status:"PENDING", rate:"—",       trust:55 },
];

const HEATMAP_STATES = [
  { state:"California", score:92, count:2340, color:P.red    },
  { state:"Texas",      score:87, count:1890, color:P.red    },
  { state:"Arizona",    score:81, count:1120, color:P.amber  },
  { state:"New Mexico", score:67, count:540,  color:P.amber  },
  { state:"Florida",    score:58, count:430,  color:P.gold   },
  { state:"Illinois",   score:44, count:210,  color:P.teal   },
  { state:"New York",   score:38, count:180,  color:P.blue   },
];

const RISK_COLORS = { CRIT:P.red, HIGH:P.amber, MED:P.gold, LOW:P.teal };

const TABS = [
  { id:"feed",    label:"🔴 Live Feed"       },
  { id:"clusters",label:"🔗 Signal Clusters" },
  { id:"heatmap", label:"🌡️ Heat Map"        },
  { id:"sources", label:"⚙️ Sources"         },
  { id:"alerts",  label:"🚨 Early Warnings"  },
];

function LiveTicker({ signals }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(p => (p + 1) % signals.length), 4000);
    return () => clearInterval(t);
  }, []);
  const s = signals[idx];
  return (
    <div style={{ background:"#060d1a", borderBottom:`1px solid ${P.b}`, padding:"6px 16px", display:"flex", gap:10, alignItems:"center", fontSize:8, overflow:"hidden" }}>
      <span style={{ color:P.red, fontWeight:800, flexShrink:0, animation:"pulse 2s infinite" }}>● LIVE</span>
      <span style={{ color:RISK_COLORS[s.risk], fontWeight:700, flexShrink:0 }}>[{s.risk}]</span>
      <span style={{ color:P.t3, flexShrink:0 }}>{s.source} · {s.time}</span>
      <span style={{ color:P.t1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.text}</span>
      <span style={{ color:P.gold, fontWeight:800, flexShrink:0, marginLeft:"auto" }}>Score: {s.score}</span>
    </div>
  );
}

export default function SocialListeningPlatform() {
  const [tab, setTab] = useState("feed");
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [paused, setPaused] = useState(false);

  const filtered = LIVE_SIGNALS.filter(s => {
    if (filter !== "ALL" && s.risk !== filter) return false;
    if (search && !s.text.toLowerCase().includes(search.toLowerCase()) && !s.tags.join(" ").includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ fontFamily:"'IBM Plex Mono',monospace", color:P.t1, height:"100%", display:"flex", flexDirection:"column" }}>

      {/* Header */}
      <div style={{ background:`linear-gradient(90deg,${P.card},#060d1a)`, borderBottom:`2px solid ${P.red}40`, padding:"12px 16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
          <div>
            <div style={{ fontSize:9, color:P.red, letterSpacing:3, fontWeight:800, marginBottom:3 }}>
              <span style={{ display:"inline-block", width:7, height:7, borderRadius:"50%", background:P.red, marginRight:6, animation:"pulse 1.5s infinite", verticalAlign:"middle" }}/>
              FORENSIC SOCIAL LISTENING PLATFORM
            </div>
            <div style={{ fontSize:14, fontWeight:800, color:P.t1 }}>
              Social Intelligence <span style={{ color:P.gold }}>War Room</span>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {[
              { v:"1,247", l:"Signals Today",   c:P.gold  },
              { v:"89%",   l:"Pipeline Match",  c:P.teal  },
              { v:"6",     l:"CRIT Alerts",     c:P.red   },
              { v:"156",   l:"Media Mentions",  c:P.blue  },
            ].map(s => (
              <div key={s.l} style={{ background:P.card2||"#080D18", border:`1px solid ${s.c}25`, borderTop:`2px solid ${s.c}`, borderRadius:6, padding:"5px 10px", textAlign:"center", minWidth:70 }}>
                <div style={{ fontSize:14, fontWeight:800, color:s.c }}>{s.v}</div>
                <div style={{ fontSize:6, color:P.t4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live ticker */}
      <LiveTicker signals={LIVE_SIGNALS} />

      {/* Tab bar */}
      <div style={{ display:"flex", gap:3, padding:"8px 16px", background:"#050810", borderBottom:`1px solid ${P.b}`, overflowX:"auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding:"6px 14px", background: tab===t.id ? `${P.red}15`:"transparent",
              border:`1px solid ${tab===t.id ? P.red : P.b}`,
              color: tab===t.id ? P.red : P.t4, borderRadius:20, fontSize:8, fontWeight:700,
              cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
            {t.label}
          </button>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", gap:6, alignItems:"center" }}>
          <button onClick={() => setPaused(p=>!p)}
            style={{ padding:"4px 10px", background: paused?`${P.amber}15`:`${P.teal}15`,
              border:`1px solid ${paused?P.amber:P.teal}`,
              color: paused?P.amber:P.teal, borderRadius:20, fontSize:7, fontWeight:800,
              cursor:"pointer", fontFamily:"inherit" }}>
            {paused ? "▶ RESUME" : "⏸ PAUSE"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", padding:"12px 16px" }}>

        {/* ── LIVE FEED ── */}
        {tab === "feed" && (
          <div>
            {/* Filters */}
            <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap", alignItems:"center" }}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search signals…"
                style={{ fontFamily:"inherit", fontSize:9, background:"#080D18", border:`1px solid ${P.b}`,
                  borderRadius:6, padding:"5px 10px", color:P.t1, outline:"none", flex:1, minWidth:150 }}/>
              {["ALL","CRIT","HIGH","MED","LOW"].map(r => (
                <button key={r} onClick={() => setFilter(r)}
                  style={{ padding:"4px 10px", background: filter===r ? `${RISK_COLORS[r]||P.gold}18`:"transparent",
                    border:`1px solid ${filter===r ? RISK_COLORS[r]||P.gold : P.b}`,
                    color: filter===r ? RISK_COLORS[r]||P.gold : P.t4,
                    borderRadius:20, fontSize:7, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
                  {r}
                </button>
              ))}
              <span style={{ fontSize:7, color:P.t4 }}>{filtered.length} signals</span>
            </div>

            {/* Signal cards */}
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {filtered.map(s => (
                <div key={s.id}
                  onClick={() => setSelected(selected?.id===s.id ? null : s)}
                  style={{ background:selected?.id===s.id?`${RISK_COLORS[s.risk]}08`:P.card||"#0D1525",
                    border:`1px solid ${selected?.id===s.id?RISK_COLORS[s.risk]:P.b}`,
                    borderLeft:`4px solid ${RISK_COLORS[s.risk]}`,
                    borderRadius:8, padding:"10px 14px", cursor:"pointer", transition:"all .15s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, marginBottom:4 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                      <span style={{ fontSize:12 }}>{s.icon}</span>
                      <span style={{ fontSize:8, fontWeight:800, color:P.t2 }}>{s.source}</span>
                      <span style={{ fontSize:7, color:P.t4 }}>{s.handle}</span>
                      <span style={{ fontSize:6, background:`${RISK_COLORS[s.risk]}15`, color:RISK_COLORS[s.risk],
                        borderRadius:3, padding:"1px 6px", fontWeight:800 }}>{s.risk}</span>
                    </div>
                    <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:800, color:RISK_COLORS[s.risk] }}>{s.score}</span>
                      <span style={{ fontSize:7, color:P.t4 }}>{s.time}</span>
                    </div>
                  </div>
                  <div style={{ fontSize:9, color:P.t1, lineHeight:1.6, marginBottom:6 }}>{s.text}</div>
                  <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                    {s.tags.map(t => (
                      <span key={t} style={{ fontSize:6, background:`${P.blue}15`, color:P.blue, borderRadius:3, padding:"1px 6px" }}>#{t}</span>
                    ))}
                  </div>
                  {selected?.id===s.id && (
                    <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${P.b}` }}>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                        {[
                          { l:"Forensic Score",  v:`${s.score}/100`, c:RISK_COLORS[s.risk] },
                          { l:"Risk Level",      v:s.risk,           c:RISK_COLORS[s.risk] },
                          { l:"Source Trust",    v:"72%",            c:P.teal },
                          { l:"Pipeline Match",  v:"Check →",        c:P.gold },
                          { l:"Evidence Hash",   v:"SHA-256",        c:P.violet },
                          { l:"Status",          v:"INGESTED",       c:P.teal },
                        ].map(m => (
                          <div key={m.l} style={{ background:"#080D18", borderRadius:5, padding:"6px 8px" }}>
                            <div style={{ fontSize:6, color:P.t4, marginBottom:2 }}>{m.l}</div>
                            <div style={{ fontSize:9, fontWeight:800, color:m.c }}>{m.v}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop:8, display:"flex", gap:6 }}>
                        <button style={{ flex:1, padding:"5px", background:`${P.gold}12`, border:`1px solid ${P.gold}25`, color:P.gold, fontSize:7, fontWeight:700, borderRadius:5, cursor:"pointer", fontFamily:"inherit" }}>
                          → Add to Evidence Ledger
                        </button>
                        <button style={{ flex:1, padding:"5px", background:`${P.violet}12`, border:`1px solid ${P.violet}25`, color:P.violet, fontSize:7, fontWeight:700, borderRadius:5, cursor:"pointer", fontFamily:"inherit" }}>
                          → Match to Case Registry
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SIGNAL CLUSTERS ── */}
        {tab === "clusters" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:12 }}>
            {CLUSTERS.map(cl => (
              <div key={cl.id} style={{ background:P.card||"#0D1525", border:`1px solid ${cl.color}30`, borderTop:`4px solid ${cl.color}`, borderRadius:10, padding:"16px 18px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div style={{ fontSize:10, fontWeight:800, color:cl.color, lineHeight:1.3 }}>{cl.label}</div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:20, fontWeight:800, color:cl.color }}>{cl.count}</div>
                    <div style={{ fontSize:6, color:P.t4 }}>signals</div>
                  </div>
                </div>
                <div style={{ background:"#080D18", borderRadius:4, height:6, overflow:"hidden", marginBottom:8 }}>
                  <div style={{ width:`${Math.min((cl.count/200)*100,100)}%`, height:"100%", background:cl.color, borderRadius:4 }}/>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", gap:3, flexWrap:"wrap" }}>
                    {cl.tags.map(t => (
                      <span key={t} style={{ fontSize:6, background:`${cl.color}12`, color:cl.color, borderRadius:3, padding:"1px 5px" }}>#{t}</span>
                    ))}
                  </div>
                  <span style={{ fontSize:8, color:P.teal, fontWeight:700 }}>{cl.delta}</span>
                </div>
              </div>
            ))}

            {/* Pipeline integration note */}
            <div style={{ gridColumn:"1 / -1", background:`${P.teal}08`, border:`1px solid ${P.teal}25`, borderRadius:10, padding:"14px 18px" }}>
              <div style={{ fontSize:9, fontWeight:800, color:P.teal, marginBottom:6 }}>⚙️ Pipeline Processing</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:8 }}>
                {["Intake → Normalize","Normalize → Score","Score → Match","Match → Evidence","Evidence → Archive","Archive → Dashboard"].map((step,i) => (
                  <div key={i} style={{ display:"flex", gap:6, alignItems:"center", fontSize:7, color:P.t3 }}>
                    <span style={{ color:P.teal, flexShrink:0 }}>✓</span>{step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── HEAT MAP ── */}
        {tab === "heatmap" && (
          <div>
            <div style={{ background:P.card||"#0D1525", border:`1px solid ${P.b}`, borderRadius:10, padding:"16px 18px", marginBottom:12 }}>
              <div style={{ fontSize:10, fontWeight:800, color:P.t1, marginBottom:14 }}>🌡️ Signal Density by State</div>
              {HEATMAP_STATES.map((s,i) => (
                <div key={s.state} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:8, marginBottom:4 }}>
                    <span style={{ color:P.t2, fontWeight:600 }}>{s.state}</span>
                    <div style={{ display:"flex", gap:10 }}>
                      <span style={{ color:P.t4 }}>{s.count.toLocaleString()} signals</span>
                      <span style={{ color:s.color, fontWeight:800 }}>{s.score}</span>
                    </div>
                  </div>
                  <div style={{ background:"#030508", borderRadius:4, height:8, overflow:"hidden" }}>
                    <div style={{ width:`${s.score}%`, height:"100%", background:`linear-gradient(90deg,${s.color},${s.color}80)`, borderRadius:4, transition:"width 1s ease" }}/>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              {[
                { label:"GREEN — Verified", color:"#4ADE80", desc:"Cross-referenced and confirmed" },
                { label:"AMBER — Inferred", color:P.amber,  desc:"High probability, needs review" },
                { label:"RED — Missing",    color:P.red,    desc:"Data gaps and null fields" },
              ].map(l => (
                <div key={l.label} style={{ background:P.card||"#0D1525", border:`1px solid ${l.color}25`, borderRadius:8, padding:"10px 12px" }}>
                  <div style={{ fontSize:9, fontWeight:800, color:l.color, marginBottom:4 }}>{l.label}</div>
                  <div style={{ fontSize:7, color:P.t4 }}>{l.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SOURCES ── */}
        {tab === "sources" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:10 }}>
            {SOURCE_STATUS.map(s => {
              const sc = s.status==="LIVE"?P.teal:s.status==="LIMITED"?P.amber:P.b;
              return (
                <div key={s.name} style={{ background:P.card||"#0D1525", border:`1px solid ${sc}25`, borderRadius:10, padding:"14px 16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <span style={{ fontSize:20 }}>{s.icon}</span>
                      <span style={{ fontSize:11, fontWeight:800, color:P.t1 }}>{s.name}</span>
                    </div>
                    <span style={{ fontSize:7, background:`${sc}15`, color:sc, borderRadius:20, padding:"2px 8px", fontWeight:800 }}>{s.status}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:7, color:P.t4, marginBottom:8 }}>
                    <span>Rate: <strong style={{ color:P.t2 }}>{s.rate}</strong></span>
                    <span>Trust: <strong style={{ color:sc }}>{s.trust}%</strong></span>
                  </div>
                  <div style={{ background:"#030508", borderRadius:3, height:5, overflow:"hidden" }}>
                    <div style={{ width:`${s.trust}%`, height:"100%", background:sc, borderRadius:3 }}/>
                  </div>
                </div>
              );
            })}

            <div style={{ gridColumn:"1/-1", background:`${P.gold}08`, border:`1px solid ${P.gold}25`, borderRadius:10, padding:"14px 16px" }}>
              <div style={{ fontSize:9, fontWeight:800, color:P.gold, marginBottom:8 }}>📥 Ingest Architecture</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:6 }}>
                {["Source Connectors","Event Bus (Queue)","Normalization","NLP + Entity Extract","Forensic Scoring","Evidence Ledger"].map((step,i) => (
                  <div key={i} style={{ display:"flex", gap:6, alignItems:"center", fontSize:7, color:P.t3, background:"#080D18", borderRadius:5, padding:"6px 8px" }}>
                    <span style={{ color:P.gold, fontWeight:800, minWidth:16 }}>{i+1}.</span>{step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── EARLY WARNINGS ── */}
        {tab === "alerts" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { id:"EW-001", trigger:"3+ posts mention same name", location:"Tijuana", time:"4m ago", score:96, action:"Match to Case Registry", c:P.red  },
              { id:"EW-002", trigger:"New shelter intake cluster detected", location:"Nogales", time:"12m ago", score:88, action:"Open Shelter Map", c:P.red  },
              { id:"EW-003", trigger:"ICE policy language shift detected", location:"National", time:"28m ago", score:91, action:"Flag for CHC Brief", c:P.amber },
              { id:"EW-004", trigger:"Media spike: 2.1M TikTok views", location:"Tijuana", time:"1h ago", score:79, action:"Track Media Thread", c:P.amber },
              { id:"EW-005", trigger:"PTSD-crime-deportation sequence confirmed", location:"Arizona", time:"2h ago", score:94, action:"Add to Evidence Ledger", c:P.red  },
            ].map(w => (
              <div key={w.id} style={{ background:P.card||"#0D1525", border:`1px solid ${w.c}30`, borderLeft:`4px solid ${w.c}`, borderRadius:8, padding:"12px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, marginBottom:6 }}>
                  <div>
                    <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:3 }}>
                      <span style={{ fontSize:7, color:P.t4, fontFamily:"'IBM Plex Mono',monospace" }}>{w.id}</span>
                      <span style={{ fontSize:7, color:P.t4 }}>{w.time}</span>
                    </div>
                    <div style={{ fontSize:10, fontWeight:800, color:w.c, marginBottom:2 }}>⚡ {w.trigger}</div>
                    <div style={{ fontSize:8, color:P.t3 }}>Location: {w.location}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:18, fontWeight:800, color:w.c }}>{w.score}</div>
                    <div style={{ fontSize:6, color:P.t4 }}>alert score</div>
                  </div>
                </div>
                <button style={{ padding:"5px 14px", background:`${w.c}12`, border:`1px solid ${w.c}30`, color:w.c, fontSize:7, fontWeight:700, borderRadius:5, cursor:"pointer", fontFamily:"inherit" }}>
                  → {w.action}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}