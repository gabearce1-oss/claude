import { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Tooltip, Rectangle } from "react-leaflet";
import { P } from "../../lib/teData";
import "leaflet/dist/leaflet.css";

// Geospatial Evidence Map — documents by geographic origin, FOIA agencies, data flows

const EVIDENCE_NODES = [
  // Primary document sources
  { id:"DCAS",    lat:38.889, lng:-77.009, type:"database", label:"DCAS Database",       sub:"DoD DMDC · 58,220 records",     weight:5, color:"#4A9EFF", icon:"💾" },
  { id:"NARA",    lat:38.982, lng:-76.946, type:"archive",  label:"NARA College Park",   sub:"Vietnam service records",       weight:4, color:"#9D7BFF", icon:"🗃️" },
  { id:"VA_DC",   lat:38.901, lng:-77.040, type:"agency",   label:"VA SAOF",             sub:"F001 83d OVERDUE",              weight:5, color:"#FF5C5C", icon:"🏛️" },
  { id:"ICE_DC",  lat:38.869, lng:-77.009, type:"agency",   label:"ICE FOIA Office",     sub:"F002 66d OVERDUE",              weight:5, color:"#FF5C5C", icon:"🏛️" },
  { id:"EOIR",    lat:38.895, lng:-77.026, type:"agency",   label:"EOIR Courts",         sub:"Immigration proceedings",       weight:3, color:"#FF8C42", icon:"⚖️" },
  { id:"CBP_HQ",  lat:38.895, lng:-77.023, type:"agency",   label:"CBP HQ",              sub:"Border operations",             weight:3, color:"#FF8C42", icon:"⚖️" },
  // California / SW
  { id:"ICE_LA",  lat:34.052, lng:-118.243, type:"agency",  label:"ICE ERO Los Angeles", sub:"Primary SoCal enforcement",     weight:4, color:"#FF5C5C", icon:"🚔" },
  { id:"VA_LA",   lat:34.073, lng:-118.399, type:"agency",  label:"VA Regional LA",      sub:"BIRLS lookup node",             weight:3, color:"#4A9EFF", icon:"🏥" },
  { id:"SDSU",    lat:32.776, lng:-117.071, type:"archive",  label:"SDSU Special Coll.", sub:"Vietnam · Chicano · Oral Hist.",weight:3, color:"#FF8C42", icon:"🎓" },
  { id:"DMDC",    lat:36.636, lng:-121.844, type:"database", label:"DMDC Seaside CA",    sub:"Service record DB",             weight:4, color:"#4A9EFF", icon:"💾" },
  { id:"CBP_SD",  lat:32.540, lng:-117.049, type:"agency",  label:"CBP San Diego",       sub:"C002/C003 deportation point",   weight:4, color:"#FF8C42", icon:"🚔" },
  // Mexico
  { id:"INAI",    lat:19.361, lng:-99.197,  type:"agency",  label:"INAI México",         sub:"F003 filed",                    weight:2, color:"#F5C842", icon:"🏛️" },
  { id:"COMAR",   lat:19.429, lng:-99.132,  type:"agency",  label:"COMAR Mexico City",   sub:"Repatriated veteran registry",  weight:3, color:"#F5C842", icon:"📋" },
  { id:"TJ",      lat:32.514, lng:-117.038, type:"shelter", label:"Casa del Migrante TJ",sub:"C002/C003 · 200 cap",           weight:3, color:"#9D7BFF", icon:"🏠" },
  { id:"NOG",     lat:31.301, lng:-110.933, type:"shelter", label:"Albergue Nogales",    sub:"C005 Miguel Segura",            weight:2, color:"#9D7BFF", icon:"🏠" },
  { id:"JUZ",     lat:31.738, lng:-106.489, type:"shelter", label:"El Refugio Juárez",   sub:"5 veterans tracked",            weight:2, color:"#9D7BFF", icon:"🏠" },
  // Korea / Colombia
  { id:"SEOUL",   lat:37.566, lng:126.978,  type:"case",    label:"Seoul — C004 Park",   sub:"⚡ CRITICAL — USMC deported",   weight:5, color:"#FF5C5C", icon:"🎖️" },
  { id:"BOGOTA",  lat:4.711,  lng:-74.073,  type:"case",    label:"Bogotá — C006 Duran", sub:"Army vet deported Colombia",    weight:3, color:"#F5C842", icon:"🎖️" },
  // Research / Academic
  { id:"USC",     lat:34.022, lng:-118.285, type:"research", label:"USC — AUMER HQ",     sub:"gtarce@usc.edu · Research lead",weight:5, color:"#1CCFB4", icon:"🔬" },
  { id:"USF",     lat:37.776, lng:-122.451, type:"research", label:"USF — Durazo Study",  sub:"Qualitative Stream 7",          weight:3, color:"#1CCFB4", icon:"🔬" },
  // Congress
  { id:"CONGRESS",lat:38.890, lng:-77.009,  type:"milestone",label:"US Capitol",         sub:"CHC Brief May 18 2026",         weight:5, color:"#F5C842", icon:"🏛️" },
];

// Evidence flows — data/document connections
const FLOWS = [
  { from:"DCAS",   to:"USC",      label:"BISG Forensic Audit",  type:"data",   color:"#4A9EFF", w:2 },
  { from:"NARA",   to:"USC",      label:"Service Records",       type:"data",   color:"#9D7BFF", w:1.5 },
  { from:"USC",    to:"CONGRESS", label:"CHC Briefing Package",  type:"report", color:"#F5C842", w:2.5 },
  { from:"VA_DC",  to:"USC",      label:"F001 FOIA — OVERDUE",   type:"foia",   color:"#FF5C5C", w:1.5 },
  { from:"ICE_DC", to:"USC",      label:"F002 FOIA — OVERDUE",   type:"foia",   color:"#FF5C5C", w:1.5 },
  { from:"ICE_LA", to:"TJ",       label:"C002/C003 Removal",     type:"removal",color:"#FF5C5C", w:2 },
  { from:"ICE_LA", to:"NOG",      label:"C005 Removal",          type:"removal",color:"#FF8C42", w:1.5 },
  { from:"ICE_LA", to:"SEOUL",    label:"C004 Self-Deportation", type:"removal",color:"#FF5C5C", w:2 },
  { from:"ICE_LA", to:"BOGOTA",   label:"C006 Removal",          type:"removal",color:"#F5C842", w:1.5 },
  { from:"SDSU",   to:"USC",      label:"Archival Sources",      type:"data",   color:"#FF8C42", w:1 },
  { from:"USF",    to:"USC",      label:"Durazo Qualitative",    type:"data",   color:"#1CCFB4", w:1 },
  { from:"CBP_SD", to:"TJ",       label:"Border Processing",     type:"removal",color:"#FF5C5C", w:1.5 },
  { from:"COMAR",  to:"TJ",       label:"Repatriation Data",     type:"data",   color:"#F5C842", w:1 },
  { from:"DMDC",   to:"USC",      label:"Non-Citizen Vet DB",    type:"data",   color:"#4A9EFF", w:1.5 },
  { from:"USC",    to:"SDSU",     label:"Archival Partnership",  type:"partner",color:"#FF8C42", w:1 },
];

const TYPE_CONFIG = {
  database: { color:"#4A9EFF", label:"Database" },
  archive:  { color:"#9D7BFF", label:"Archive" },
  agency:   { color:"#FF5C5C", label:"Agency" },
  shelter:  { color:"#9D7BFF", label:"Shelter" },
  case:     { color:"#F5C842", label:"Case" },
  research: { color:"#1CCFB4", label:"Research" },
  milestone:{ color:"#F5C842", label:"Milestone" },
};

const FLOW_STYLES = {
  data:    { dash:"none",  label:"Data Flow" },
  foia:    { dash:"8,5",  label:"FOIA Request" },
  removal: { dash:"4,4",  label:"Deportation/Removal" },
  report:  { dash:"none", label:"Report/Briefing" },
  partner: { dash:"12,6", label:"Partnership" },
};

const LAYERS = ["database","archive","agency","shelter","case","research","milestone","flows"];

export default function GeoEvidenceMap() {
  const [activeLayers, setActiveLayers] = useState(new Set(LAYERS));
  const [selected, setSelected] = useState(null);
  const [flowFilter, setFlowFilter] = useState("all");
  const [search, setSearch] = useState("");

  const toggleLayer = (l) => setActiveLayers(prev=>{const n=new Set(prev);n.has(l)?n.delete(l):n.add(l);return n;});

  const visibleNodes = EVIDENCE_NODES.filter(n=>
    activeLayers.has(n.type) &&
    (!search || n.label.toLowerCase().includes(search.toLowerCase()) || n.sub.toLowerCase().includes(search.toLowerCase()))
  );
  const visibleIds = new Set(visibleNodes.map(n=>n.id));

  const visibleFlows = FLOWS.filter(f=>
    visibleIds.has(f.from) && visibleIds.has(f.to) &&
    activeLayers.has("flows") &&
    (flowFilter==="all" || f.type===flowFilter)
  );

  const getPos = (id) => {
    const n = EVIDENCE_NODES.find(n=>n.id===id);
    return n ? [n.lat, n.lng] : null;
  };

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex",gap:10,justifyContent:"space-between",flexWrap:"wrap",marginBottom:10}}>
        <div>
          <div style={{fontSize:12,fontWeight:800,color:P.t1}}>🗃️ Geospatial Evidence <span style={{color:P.gold}}>Map</span></div>
          <div style={{fontSize:7,color:P.t4,letterSpacing:2}}>{visibleNodes.length} NODES · {visibleFlows.length} FLOWS · DOCUMENT ORIGIN · AGENCY NETWORK · DATA PIPELINES</div>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search nodes..."
          style={{padding:"5px 12px",background:"#080D18",border:`1px solid ${search?P.gold:P.b}`,
            borderRadius:20,color:P.t1,fontSize:8,outline:"none",width:150}}/>
      </div>

      {/* Flow filter */}
      <div style={{display:"flex",gap:5,marginBottom:8,flexWrap:"wrap"}}>
        {[["all","All Flows"],["data","Data"],["foia","FOIA"],["removal","Removals"],["report","Reports"],["partner","Partners"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFlowFilter(v)}
            style={{padding:"3px 9px",fontSize:7,cursor:"pointer",
              background:flowFilter===v?`${P.gold}15`:"transparent",
              border:`1px solid ${flowFilter===v?P.gold:P.b}`,color:flowFilter===v?P.gold:P.t4,borderRadius:20}}>
            {l}
          </button>
        ))}
      </div>

      <div style={{display:"flex",gap:10}}>
        {/* Map */}
        <div style={{flex:1,borderRadius:10,overflow:"hidden",border:`1px solid ${P.b}`,height:520}}>
          <MapContainer center={[25, -95]} zoom={3} style={{height:"100%",width:"100%"}}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; CARTO'
            />

            {/* Flows */}
            {visibleFlows.map((f,i)=>{
              const from = getPos(f.from); const to = getPos(f.to);
              if (!from || !to) return null;
              const style = FLOW_STYLES[f.type];
              return (
                <Polyline key={i} positions={[from,to]}
                  pathOptions={{color:f.color,weight:f.w,opacity:0.55,dashArray:style.dash==="none"?null:style.dash}}>
                  <Tooltip>{f.label}</Tooltip>
                </Polyline>
              );
            })}

            {/* Nodes */}
            {visibleNodes.map(n=>{
              const r = 5 + n.weight * 2.5;
              const isSel = selected===n.id;
              return (
                <CircleMarker key={n.id} center={[n.lat,n.lng]} radius={r}
                  pathOptions={{fillColor:n.color,color:isSel?"#fff":n.color,weight:isSel?2:1.5,fillOpacity:0.85}}
                  eventHandlers={{click:()=>setSelected(n.id===selected?null:n.id)}}>
                  <Popup>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,minWidth:180}}>
                      <div style={{fontWeight:800,marginBottom:2}}>{n.icon} {n.label}</div>
                      <div style={{color:n.color,fontSize:8,marginBottom:4}}>{TYPE_CONFIG[n.type]?.label}</div>
                      <div style={{fontSize:8}}>{n.sub}</div>
                      <div style={{marginTop:6,fontSize:7,color:"#888"}}>
                        Connections: {FLOWS.filter(f=>f.from===n.id||f.to===n.id).length}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        {/* Sidebar */}
        <div style={{width:200,flexShrink:0,display:"flex",flexDirection:"column",gap:8,overflowY:"auto"}}>
          {/* Layer toggles */}
          <div style={{background:P.card,border:`1px solid ${P.b}`,borderRadius:10,padding:"10px 12px"}}>
            <div style={{fontSize:7,color:P.t4,letterSpacing:2,marginBottom:7}}>LAYERS</div>
            {Object.entries(TYPE_CONFIG).map(([k,v])=>(
              <button key={k} onClick={()=>toggleLayer(k)}
                style={{width:"100%",display:"flex",alignItems:"center",gap:6,padding:"4px 7px",marginBottom:3,
                  background:activeLayers.has(k)?`${v.color}12`:"transparent",
                  border:`1px solid ${activeLayers.has(k)?v.color+"40":P.b}`,
                  borderRadius:6,color:activeLayers.has(k)?v.color:P.t4,fontSize:7,cursor:"pointer"}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:activeLayers.has(k)?v.color:P.b,flexShrink:0}}/>
                {v.label} <span style={{marginLeft:"auto",fontSize:6,color:P.t4}}>{EVIDENCE_NODES.filter(n=>n.type===k).length}</span>
              </button>
            ))}
            <button onClick={()=>toggleLayer("flows")}
              style={{width:"100%",display:"flex",alignItems:"center",gap:6,padding:"4px 7px",marginTop:3,
                background:activeLayers.has("flows")?`${P.gold}12`:"transparent",
                border:`1px solid ${activeLayers.has("flows")?P.gold+"40":P.b}`,
                borderRadius:6,color:activeLayers.has("flows")?P.gold:P.t4,fontSize:7,cursor:"pointer"}}>
              <div style={{width:7,height:7,borderRadius:1,background:activeLayers.has("flows")?P.gold:P.b,flexShrink:0}}/>
              Flow Lines <span style={{marginLeft:"auto",fontSize:6,color:P.t4}}>{FLOWS.length}</span>
            </button>
          </div>

          {/* Flow legend */}
          <div style={{background:P.card,border:`1px solid ${P.b}`,borderRadius:10,padding:"10px 12px"}}>
            <div style={{fontSize:7,color:P.t4,letterSpacing:2,marginBottom:6}}>FLOW TYPES</div>
            {Object.entries(FLOW_STYLES).map(([k,v])=>(
              <div key={k} style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                <div style={{width:20,height:2,background:k==="foia"?P.red:k==="removal"?P.amber:k==="report"?P.gold:P.blue,
                  borderRadius:1,borderBottom:v.dash!=="none"?"2px dashed":undefined}}/>
                <span style={{fontSize:7,color:P.t3}}>{v.label}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{background:P.card,border:`1px solid ${P.b}`,borderRadius:10,padding:"10px 12px"}}>
            <div style={{fontSize:7,color:P.t4,letterSpacing:2,marginBottom:6}}>NETWORK STATS</div>
            {[
              ["Total Nodes",EVIDENCE_NODES.length,P.blue],
              ["Total Flows",FLOWS.length,P.violet],
              ["Overdue FOIA",FLOWS.filter(f=>f.type==="foia").length,P.red],
              ["Removal Routes",FLOWS.filter(f=>f.type==="removal").length,P.amber],
              ["Countries",4,P.teal],
            ].map(([k,v,c])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:7,padding:"3px 0",borderBottom:`1px solid ${P.b}20`}}>
                <span style={{color:P.t4}}>{k}</span>
                <span style={{color:c,fontWeight:700}}>{v}</span>
              </div>
            ))}
          </div>

          {/* Selected node detail */}
          {selected && (() => {
            const n = EVIDENCE_NODES.find(x=>x.id===selected);
            const nodeFlows = FLOWS.filter(f=>f.from===selected||f.to===selected);
            if (!n) return null;
            return (
              <div style={{background:P.card,border:`1px solid ${n.color}30`,borderRadius:10,padding:"10px 12px"}}>
                <div style={{fontSize:8,color:n.color,fontWeight:800,marginBottom:2}}>{n.icon} {n.label}</div>
                <div style={{fontSize:7,color:P.t3,marginBottom:6}}>{n.sub}</div>
                <div style={{fontSize:7,color:P.t4,letterSpacing:2,marginBottom:4}}>CONNECTIONS</div>
                {nodeFlows.map((f,i)=>{
                  const other = f.from===selected?f.to:f.from;
                  const dir = f.from===selected?"→":"←";
                  return (
                    <div key={i} style={{fontSize:7,padding:"3px 0",borderBottom:`1px solid ${P.b}20`,color:P.t3}}>
                      <span style={{color:f.color}}>{dir}</span> {other} — {f.label}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}