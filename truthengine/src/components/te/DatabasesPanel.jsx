import { useState } from "react";
import { P, DATABASES_REGISTRY } from "../../lib/teData";

const DEFAULT_URLS = {
  "ICE-001": "https://www.ice.gov/open-government",
  "ICE-003": "https://www.ice.gov/detain/detention-management",
  "EOIR-001": "https://www.justice.gov/eoir",
  "VA-001": "https://department.va.gov/foia/",
  "USCIS-001": "https://www.uscis.gov/records/genealogy",
  "MEX-001": "https://www.gob.mx/segob",
  "ACAD-001": "https://scholar.google.com/",
  "NEWS-001": "https://www.ap.org/",
  "LEG-001": "https://www.congress.gov/",
};

const normalizeDatabase = (db) => {
  const status = db.status || (db.access === "FOIA" ? "FOIA_BLOCKED" : "CONNECTED");
  return {
    ...db,
    fullName: db.fullName || db.name || "",
    org: db.org || db.agency || "Unknown agency",
    dataType: db.dataType || `${db.category} records`,
    useCase: db.useCase || "Case verification and evidence triangulation",
    notes: db.notes || "Source is available for indexed extraction and cross-reference checks.",
    fields: db.fields || ["id", "name", "date", "location"],
    status,
    foiaPending: db.foiaPending ?? db.access === "FOIA",
    foiaRef: db.foiaRef || (db.access === "FOIA" ? "FOIA REQUEST REQUIRED" : ""),
    foiaDays: db.foiaDays || 0,
    lastSync: db.lastSync || (status === "CONNECTED" ? "Live" : status === "FOIA_BLOCKED" ? "BLOCKED" : "Queued"),
    priority: db.priority || (status === "FOIA_BLOCKED" ? "CRITICAL" : "HIGH"),
    color: db.color || (status === "CONNECTED" ? P.teal : status === "FOIA_BLOCKED" ? P.red : P.gold),
    url: db.url || DEFAULT_URLS[db.id] || "",
    access: db.accessMethod || db.access || "Public",
  };
};

const DATABASES = DATABASES_REGISTRY.map(normalizeDatabase);
const CATEGORIES = ["All", ...new Set(DATABASES.map((d) => d.category))];
const STATUS_C = { CONNECTED: P.teal, FOIA_BLOCKED: P.red, PARTIAL: P.amber, CONNECTING: P.violet, DISCONNECTED: P.t4 };
const STATUS_LABEL = { CONNECTED: "● LIVE", FOIA_BLOCKED: "⚠ FOIA BLOCKED", PARTIAL: "◑ PARTIAL", CONNECTING: "⟳ CONNECTING", DISCONNECTED: "○ OFFLINE" };
const STATUS_BG = { CONNECTED: `${P.teal}12`, FOIA_BLOCKED: `${P.red}12`, PARTIAL: `#F5C84212`, CONNECTING: `#9D7BFF12`, DISCONNECTED: "transparent" };

export default function DatabasesPanel() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  const filtered = DATABASES.filter(d =>
    (category === "All" || d.category === category) &&
    (!search ||
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      d.dataType?.toLowerCase().includes(search.toLowerCase()) ||
      d.org?.toLowerCase().includes(search.toLowerCase()))
  );

  const statusCounts = {
    CONNECTED:    DATABASES.filter(d => d.status === "CONNECTED").length,
    PARTIAL:      DATABASES.filter(d => d.status === "PARTIAL").length,
    FOIA_BLOCKED: DATABASES.filter(d => d.status === "FOIA_BLOCKED").length,
    CONNECTING:   DATABASES.filter(d => d.status === "CONNECTING").length,
  };

  const foiaBlocked = DATABASES.filter(d => d.foiaPending);
  const selDB = DATABASES.find(d => d.id === selected);
  const extractionReadiness = Math.round((statusCounts.CONNECTED / Math.max(DATABASES.length, 1)) * 100);

  return (
    <div>
      {/* Header stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:7, marginBottom:12 }}>
        {[
          { l:"Total Sources",     v:DATABASES.length,          c:P.blue },
          { l:"Live / Connected",  v:statusCounts.CONNECTED,    c:P.teal },
          { l:"Partial Access",    v:statusCounts.PARTIAL,      c:P.amber },
          { l:"FOIA Blocked",      v:statusCounts.FOIA_BLOCKED, c:P.red },
          { l:"Connecting",        v:statusCounts.CONNECTING,   c:P.violet },
          { l:"Extraction Ready",  v:`${extractionReadiness}%`, c:P.teal },
          { l:"Records (est.)",    v:"~600M+",                  c:P.gold },
          { l:"FOIA Overdue Days", v:"83+66",                   c:P.red },
        ].map((s, i) => (
          <div key={i} style={{ background:P.card, border:`1px solid ${s.c}25`, borderLeft:`3px solid ${s.c}`, borderRadius:7, padding:"8px 12px" }}>
            <div style={{ fontSize:6, color:P.t4, marginBottom:2, letterSpacing:1 }}>{s.l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:typeof s.v==="number"?20:12, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* FOIA alert */}
      {foiaBlocked.length > 0 && (
        <div style={{ background:`${P.red}08`, border:`1px solid ${P.red}30`, borderRadius:9, padding:"10px 16px", marginBottom:10 }}>
          <div style={{ fontSize:8, fontWeight:800, color:P.red, marginBottom:6, letterSpacing:1 }}>
            ⚠ FOIA-BLOCKED DATABASES — CONGRESSIONAL ESCALATION REQUIRED
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {foiaBlocked.map(d => (
              <div key={d.id} style={{ background:`${P.red}10`, border:`1px solid ${P.red}20`, borderRadius:7, padding:"5px 12px",
                display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ fontSize:14 }}>{d.icon}</span>
                <div>
                  <div style={{ fontSize:8, color:P.red, fontWeight:700 }}>{d.name}</div>
                  <div style={{ fontSize:7, color:P.t4 }}>{d.foiaRef}{d.foiaDays > 0 ? ` · ${d.foiaDays}d OVERDUE` : " · Pending"}</div>
                </div>
              </div>
            ))}
            <div style={{ fontSize:7, color:P.t4, marginLeft:"auto", alignSelf:"center" }}>
              CHC inquiry letters → block access resolution
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap", alignItems:"center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search databases..."
          style={{ padding:"6px 12px", background:"#080D18", border:`1px solid ${search ? P.gold : P.b}`,
            borderRadius:20, color:P.t1, fontSize:8, fontFamily:"'IBM Plex Mono',monospace", outline:"none", width:180 }} />
        <div style={{ display:"flex", gap:0, background:P.card, border:`1px solid ${P.b}`, borderRadius:20, overflow:"hidden" }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              style={{ padding:"5px 11px", background:category===c?`${P.violet}20`:"transparent", border:"none",
                borderRight:`1px solid ${P.b}`, color:category===c?P.violet:P.t4,
                fontSize:7, fontWeight:category===c?700:400, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace",
                whiteSpace:"nowrap" }}>
              {c}{c!=="All" ? ` (${DATABASES.filter(d=>d.category===c).length})` : ""}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:0, background:P.card, border:`1px solid ${P.b}`, borderRadius:20, overflow:"hidden", marginLeft:"auto" }}>
          {[["grid","⊞"],["list","≡"]].map(([v,l]) => (
            <button key={v} onClick={() => setViewMode(v)}
              style={{ padding:"5px 10px", background:viewMode===v?`${P.gold}18`:"transparent", border:"none",
                color:viewMode===v?P.gold:P.t4, fontSize:11, cursor:"pointer" }}>{l}</button>
          ))}
        </div>
        <span style={{ fontSize:7, color:P.t4 }}>{filtered.length} sources</span>
      </div>

      <div style={{ display:"flex", gap:10 }}>
        {/* Main content */}
        <div style={{ flex:1 }}>
          {/* Status tabs */}
          <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
            {Object.entries(STATUS_LABEL).map(([k,v]) => {
              const cnt = filtered.filter(d=>d.status===k).length;
              if (!cnt) return null;
              return (
                <div key={k} style={{ padding:"3px 10px", background:STATUS_BG[k], border:`1px solid ${STATUS_C[k]}30`,
                  borderRadius:20, display:"flex", gap:5, alignItems:"center" }}>
                  <span style={{ fontSize:7, color:STATUS_C[k], fontWeight:700 }}>{v}</span>
                  <span style={{ fontSize:7, color:STATUS_C[k], fontFamily:"'IBM Plex Mono',monospace" }}>{cnt}</span>
                </div>
              );
            })}
          </div>

          {viewMode === "grid" ? (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:8 }}>
              {filtered.map(db => {
                const sc = STATUS_C[db.status] || P.t4;
                const isSel = selected === db.id;
                return (
                  <div key={db.id} onClick={() => setSelected(isSel ? null : db.id)}
                    style={{ background:isSel ? `${db.color}08` : P.card,
                      border:`2px solid ${isSel ? db.color+"80" : P.b+"40"}`,
                      borderTop:`3px solid ${db.color}`,
                      borderRadius:10, padding:"12px 14px", cursor:"pointer",
                      transition:"all .12s", position:"relative" }}>
                    <div style={{ position:"absolute", top:10, right:12, display:"flex", gap:4, alignItems:"center" }}>
                      <span style={{ width:7, height:7, borderRadius:"50%", background:sc, display:"inline-block",
                        boxShadow:db.status==="CONNECTED"?`0 0 6px ${sc}`:undefined }} />
                      <span style={{ fontSize:6, color:sc, fontWeight:700 }}>{STATUS_LABEL[db.status]}</span>
                    </div>

                    <div style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:6 }}>
                      <span style={{ fontSize:22, lineHeight:1 }}>{db.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:11, fontWeight:800, color:db.color, lineHeight:1.2 }}>{db.name}</div>
                        <div style={{ fontSize:6, color:P.t4, lineHeight:1.3, marginTop:2 }}>{db.org}</div>
                      </div>
                    </div>

                    <div style={{ marginBottom:5 }}>
                      <span style={{ fontSize:6, background:`${db.color}12`, border:`1px solid ${db.color}20`,
                        color:db.color, borderRadius:20, padding:"1px 8px" }}>{db.category}</span>
                      {db.priority === "CRITICAL" && (
                        <span style={{ fontSize:6, background:`${P.red}12`, border:`1px solid ${P.red}20`,
                          color:P.red, borderRadius:20, padding:"1px 8px", marginLeft:4 }}>CRITICAL</span>
                      )}
                    </div>

                    <div style={{ fontSize:8, color:P.t3, marginBottom:6 }}>{db.dataType}</div>

                    <div style={{ display:"flex", gap:6, marginBottom:6 }}>
                      <div style={{ background:"#080D18", borderRadius:5, padding:"3px 8px", flex:1 }}>
                        <div style={{ fontSize:6, color:P.t4 }}>RECORDS</div>
                        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700, color:db.color }}>{db.records}</div>
                      </div>
                      <div style={{ background:"#080D18", borderRadius:5, padding:"3px 8px", flex:1 }}>
                        <div style={{ fontSize:6, color:P.t4 }}>LAST SYNC</div>
                        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:700,
                          color:db.lastSync==="Live"?P.teal:db.lastSync==="BLOCKED"?P.red:P.t3 }}>{db.lastSync}</div>
                      </div>
                    </div>

                    <div style={{ fontSize:7, color:P.gold, marginBottom:5 }}>→ {db.useCase}</div>

                    {db.foiaPending && (
                      <div style={{ background:`${P.red}10`, border:`1px solid ${P.red}25`, borderRadius:5,
                        padding:"3px 9px", marginBottom:5, fontSize:7, color:P.red, fontWeight:700 }}>
                        📋 {db.foiaRef}{db.foiaDays > 0 ? ` — ${db.foiaDays}d OVERDUE` : " — Pending"}
                      </div>
                    )}

                    {isSel && (
                      <div style={{ marginTop:10, paddingTop:8, borderTop:`1px solid ${P.b}30` }}>
                        <div style={{ fontSize:8, color:P.t2, lineHeight:1.6, marginBottom:8 }}>{db.notes}</div>
                        <div style={{ fontSize:7, color:P.t4, letterSpacing:1, marginBottom:4 }}>KEY FIELDS</div>
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:8 }}>
                          {db.fields.map(f => (
                            <span key={f} style={{ fontSize:6, background:`${db.color}10`, border:`1px solid ${db.color}20`,
                              color:db.color, borderRadius:20, padding:"1px 7px" }}>{f}</span>
                          ))}
                        </div>
                        <div style={{ fontSize:7, color:P.t4, marginBottom:3 }}>ACCESS METHOD</div>
                        <div style={{ fontSize:8, color:P.t2, marginBottom:8 }}>{db.access}</div>
                        {db.url && (
                          <a href={db.url} target="_blank" rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{ fontSize:7, color:db.color, textDecoration:"none",
                              padding:"4px 10px", background:`${db.color}10`, border:`1px solid ${db.color}25`,
                              borderRadius:6, display:"inline-block" }}>
                            🔗 Open {db.name} ↗
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"40px 1fr 100px 90px 80px 80px 60px",
                gap:8, padding:"6px 12px", background:"#080D18", borderRadius:"8px 8px 0 0",
                border:`1px solid ${P.b}`, borderBottom:"none" }}>
                {["","NAME / ORG","CATEGORY","RECORDS","SYNC","STATUS",""].map((h,i)=>(
                  <div key={i} style={{ fontSize:6, color:P.t4, letterSpacing:1, fontWeight:700 }}>{h}</div>
                ))}
              </div>
              {filtered.map((db, idx) => {
                const sc = STATUS_C[db.status] || P.t4;
                const isSel = selected === db.id;
                return (
                  <div key={db.id} onClick={() => setSelected(isSel ? null : db.id)}
                    style={{ display:"grid", gridTemplateColumns:"40px 1fr 100px 90px 80px 80px 60px",
                      gap:8, padding:"9px 12px", cursor:"pointer",
                      background:isSel ? `${db.color}08` : idx%2===0 ? P.card : "#080D18",
                      border:`1px solid ${P.b}`, borderTop:"none",
                      borderLeft:`3px solid ${db.color}`,
                      borderRadius:idx===filtered.length-1?"0 0 8px 8px":0 }}>
                    <div style={{ fontSize:18, lineHeight:1 }}>{db.icon}</div>
                    <div>
                      <div style={{ fontSize:9, fontWeight:800, color:db.color }}>{db.name}</div>
                      <div style={{ fontSize:7, color:P.t4 }}>{db.dataType}</div>
                      {isSel && <div style={{ fontSize:7, color:P.t2, marginTop:4, lineHeight:1.6 }}>{db.notes}</div>}
                    </div>
                    <div style={{ fontSize:7, color:P.t3, display:"flex", alignItems:"center" }}>
                      <span style={{ background:`${db.color}12`, border:`1px solid ${db.color}20`, color:db.color,
                        borderRadius:20, padding:"1px 8px", fontSize:6 }}>{db.category}</span>
                    </div>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, fontWeight:700, color:db.color, display:"flex", alignItems:"center" }}>
                      {db.records}
                    </div>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, fontWeight:700,
                      color:db.lastSync==="Live"?P.teal:db.lastSync==="BLOCKED"?P.red:P.t3,
                      display:"flex", alignItems:"center" }}>
                      {db.lastSync}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <span style={{ width:7, height:7, borderRadius:"50%", background:sc, flexShrink:0 }} />
                      <span style={{ fontSize:6, color:sc, fontWeight:700 }}>
                        {STATUS_LABEL[db.status]?.replace("● ","").replace("⚠ ","").replace("◑ ","").replace("⟳ ","").replace("○ ","")}
                      </span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center" }}>
                      {db.url && (
                        <a href={db.url} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
                          style={{ fontSize:7, color:db.color, textDecoration:"none", padding:"2px 6px",
                            background:`${db.color}10`, border:`1px solid ${db.color}20`, borderRadius:4 }}>↗</a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ width:190, flexShrink:0, display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:8 }}>COVERAGE</div>
            {CATEGORIES.filter(c=>c!=="All").map(cat => {
              const catDBs = DATABASES.filter(d => d.category === cat);
              if (!catDBs.length) return null;
              const live = catDBs.filter(d => d.status === "CONNECTED").length;
              const pct = Math.round((live/catDBs.length)*100);
              return (
                <div key={cat} style={{ marginBottom:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                    <span style={{ fontSize:7, color:P.t3 }}>{cat}</span>
                    <span style={{ fontSize:7, color:P.teal, fontFamily:"'IBM Plex Mono',monospace" }}>{live}/{catDBs.length}</span>
                  </div>
                  <div style={{ background:"#030508", borderRadius:2, height:5, overflow:"hidden" }}>
                    <div style={{ width:`${pct}%`, height:"100%",
                      background:pct===100?P.teal:pct>=60?P.gold:P.amber, borderRadius:2 }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:8 }}>STATUS</div>
            {Object.entries(STATUS_LABEL).map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                fontSize:7, padding:"4px 0", borderBottom:`1px solid ${P.b}20` }}>
                <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:STATUS_C[k],
                    boxShadow:k==="CONNECTED"?`0 0 5px ${STATUS_C[k]}`:undefined }} />
                  <span style={{ color:STATUS_C[k], fontWeight:700, fontSize:6 }}>{v}</span>
                </div>
                <span style={{ color:P.t4, fontFamily:"'IBM Plex Mono',monospace" }}>
                  {DATABASES.filter(d=>d.status===k).length}
                </span>
              </div>
            ))}
          </div>

          <div style={{ background:P.card, border:`1px solid ${P.violet}30`, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ fontSize:7, color:P.violet, fontWeight:700, letterSpacing:2, marginBottom:6 }}>⚙️ N8N</div>
            <div style={{ fontSize:7, color:P.amber, marginBottom:4 }}>⟳ API Key Pending</div>
            <div style={{ fontSize:7, color:P.t4, lineHeight:1.7, marginBottom:8 }}>
              Add <span style={{ color:P.violet, fontFamily:"'IBM Plex Mono',monospace", fontSize:6 }}>N8N_API_KEY</span> in<br/>
              Dashboard → Settings → Env Vars
            </div>
            <a href="https://qt360.app.n8n.cloud/home/workflows" target="_blank" rel="noreferrer"
              style={{ display:"block", padding:"6px", background:`${P.violet}10`,
                border:`1px solid ${P.violet}25`, color:P.violet, borderRadius:7,
                fontSize:7, textDecoration:"none", textAlign:"center", fontWeight:700 }}>
              🔗 Open n8n ↗
            </a>
          </div>

          <div style={{ background:P.card, border:`1px solid ${P.teal}30`, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ fontSize:7, color:P.teal, fontWeight:700, letterSpacing:2, marginBottom:6 }}>🔗 ACCESS HUB</div>
            <div style={{ fontSize:7, color:P.t4, lineHeight:1.7, marginBottom:8 }}>
              Improve extraction throughput by adding official source links and partner databases.
            </div>
            <a href="mailto:partnerships@truthengine360.org?subject=Database%20Partnership%20-%20TruthEngine360"
              style={{ display:"block", marginBottom:6, padding:"6px", background:`${P.teal}10`,
                border:`1px solid ${P.teal}25`, color:P.teal, borderRadius:7, fontSize:7,
                textDecoration:"none", textAlign:"center", fontWeight:700 }}>
              📬 Submit a database
            </a>
            <a href="https://github.com/truthengine360" target="_blank" rel="noreferrer"
              style={{ display:"block", padding:"6px", background:`${P.blue}10`,
                border:`1px solid ${P.blue}25`, color:P.blue, borderRadius:7, fontSize:7,
                textDecoration:"none", textAlign:"center", fontWeight:700 }}>
              🧩 Connector docs ↗
            </a>
          </div>

          <div style={{ background:P.card, border:`1px solid ${P.red}20`, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ fontSize:7, color:P.red, fontWeight:700, letterSpacing:2, marginBottom:6 }}>🔴 CRITICAL</div>
            {DATABASES.filter(d=>d.priority==="CRITICAL").map(d=>(
              <div key={d.id} style={{ display:"flex", gap:5, alignItems:"center", padding:"3px 0",
                borderBottom:`1px solid ${P.b}20`, cursor:"pointer" }}
                onClick={()=>setSelected(d.id)}>
                <span style={{ fontSize:12 }}>{d.icon}</span>
                <div>
                  <div style={{ fontSize:7, fontWeight:700, color:STATUS_C[d.status] }}>{d.name}</div>
                  <div style={{ fontSize:6, color:P.t4 }}>{STATUS_LABEL[d.status]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}