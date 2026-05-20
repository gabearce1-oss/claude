import { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Polygon, Tooltip, LayerGroup, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { P } from "../../lib/teData";

// ── ICE Deportation Hot Zones (aggregated FY2022–2025) ──────────
const ICE_HOT_ZONES = [
  { id:"HZ-01", city:"Los Angeles, CA",      lat:34.052,  lng:-118.243, deported:41820, vetRisk:3100, color:"#ff0055", radius:38, surge:"FY2024 +312%" },
  { id:"HZ-02", city:"Chicago, IL",           lat:41.878,  lng:-87.629,  deported:18340, vetRisk:1240, color:"#ff0055", radius:28, surge:"FY2024 +198%" },
  { id:"HZ-03", city:"Houston, TX",           lat:29.760,  lng:-95.369,  deported:22410, vetRisk:1860, color:"#ff2200", radius:31, surge:"FY2024 +441%" },
  { id:"HZ-04", city:"Dallas, TX",            lat:32.776,  lng:-96.796,  deported:15680, vetRisk:1020, color:"#ff0055", radius:25, surge:"FY2024 +287%" },
  { id:"HZ-05", city:"Phoenix, AZ",           lat:33.448,  lng:-112.073, deported:19250, vetRisk:2100, color:"#ff2200", radius:29, surge:"FY2024 +398%" },
  { id:"HZ-06", city:"San Antonio, TX",       lat:29.424,  lng:-98.493,  deported:12440, vetRisk:1480, color:"#ff5500", radius:22, surge:"FY2024 +221%" },
  { id:"HZ-07", city:"San Diego, CA",         lat:32.715,  lng:-117.156, deported:9870,  vetRisk:870,  color:"#ff5500", radius:20, surge:"FY2024 +165%" },
  { id:"HZ-08", city:"New York, NY",          lat:40.712,  lng:-74.005,  deported:8920,  vetRisk:640,  color:"#ff7700", radius:19, surge:"FY2024 +112%" },
  { id:"HZ-09", city:"Miami, FL",             lat:25.774,  lng:-80.193,  deported:6840,  vetRisk:520,  color:"#ff7700", radius:17, surge:"FY2024 +89%"  },
  { id:"HZ-10", city:"El Paso, TX",           lat:31.761,  lng:-106.485, deported:14200, vetRisk:1950, color:"#ff2200", radius:26, surge:"FY2024 +512%" },
  { id:"HZ-11", city:"Atlanta, GA",           lat:33.748,  lng:-84.387,  deported:7120,  vetRisk:430,  color:"#ff7700", radius:17, surge:"FY2024 +142%" },
  { id:"HZ-12", city:"Denver, CO",            lat:39.739,  lng:-104.984, deported:4980,  vetRisk:310,  color:"#ffaa00", radius:14, surge:"FY2024 +76%"  },
];

// ── Known Veteran Population Clusters ───────────────────────────
const VETERAN_CLUSTERS = [
  { id:"VC-01", label:"Tijuana — DVSH Hub",        lat:32.513, lng:-117.018, count:220, active:true,  cases:["EPP-005"], color:"#2DD4BF" },
  { id:"VC-02", label:"Nogales — Albergue Cluster", lat:31.336, lng:-110.934, count:85,  active:true,  cases:["EPP-004"], color:"#2DD4BF" },
  { id:"VC-03", label:"Ciudad Juárez Corridor",     lat:31.738, lng:-106.487, count:140, active:true,  cases:[],          color:"#4A9EFF" },
  { id:"VC-04", label:"Mexicali Border Zone",       lat:32.663, lng:-115.467, count:62,  active:false, cases:[],          color:"#4A9EFF" },
  { id:"VC-05", label:"Matamoros — Gulf Cluster",   lat:25.869, lng:-97.503,  count:47,  active:false, cases:[],          color:"#9D7BFF" },
  { id:"VC-06", label:"Monterrey — Interior Hub",   lat:25.686, lng:-100.316, count:38,  active:false, cases:[],          color:"#9D7BFF" },
  { id:"VC-07", label:"Guadalajara Network",        lat:20.659, lng:-103.349, count:29,  active:false, cases:[],          color:"#9D7BFF" },
  { id:"VC-08", label:"Mexico City — SRE Nexus",    lat:19.432, lng:-99.133,  count:55,  active:false, cases:[],          color:"#F5B942" },
];

// ── Border Enforcement Corridor Polygons ────────────────────────
const ENFORCEMENT_CORRIDORS = [
  {
    id:"EC-01", label:"San Diego Sector",
    positions:[[33.0,-117.5],[33.0,-116.8],[32.5,-116.8],[32.5,-117.5]],
    color:"#ff0055", intensity:"CRITICAL", apprehensions:92814,
  },
  {
    id:"EC-02", label:"Tucson Sector",
    positions:[[32.2,-112.0],[32.2,-109.5],[31.3,-109.5],[31.3,-112.0]],
    color:"#ff2200", intensity:"HIGH", apprehensions:64104,
  },
  {
    id:"EC-03", label:"El Paso Sector",
    positions:[[32.0,-107.5],[32.0,-105.8],[31.5,-105.8],[31.5,-107.5]],
    color:"#ff5500", intensity:"HIGH", apprehensions:41986,
  },
  {
    id:"EC-04", label:"Rio Grande Valley",
    positions:[[26.5,-99.0],[26.5,-97.3],[25.8,-97.3],[25.8,-99.0]],
    color:"#ff2200", intensity:"CRITICAL", apprehensions:118913,
  },
];

// ── KPI bar ─────────────────────────────────────────────────────
const KPIS = [
  { label:"Total Deported (FY22–25)", value:"202,864", color:"#ff0055" },
  { label:"Est. Veterans in Zones",   value:"~15,000",  color:"#F5B942" },
  { label:"Known Vet. Clusters (MX)", value:"8 sites",  color:"#2DD4BF" },
  { label:"Border Corridors Active",  value:"4",        color:"#ff5500" },
  { label:"Veteran Flags in ICE DB",  value:"ZERO",     color:"#ff0055" },
  { label:"ICE Records Analyzed",     value:"713,464",  color:"#4A9EFF" },
];

const LAYERS = [
  { id:"hotzone",   label:"🔴 ICE Hot Zones",           default:true  },
  { id:"veterans",  label:"🔵 Veteran Clusters",         default:true  },
  { id:"corridors", label:"🟠 Enforcement Corridors",    default:true  },
  { id:"overlap",   label:"⚡ High-Risk Overlap Zones",  default:false },
];

// ── Overlap calculation (hot zone near vet cluster) ─────────────
function calcOverlap(hz, vc) {
  const R = 6371;
  const dLat = ((vc.lat - hz.lat) * Math.PI) / 180;
  const dLng = ((vc.lng - hz.lng) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(hz.lat*Math.PI/180)*Math.cos(vc.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

const OVERLAP_ZONES = ICE_HOT_ZONES.flatMap(hz =>
  VETERAN_CLUSTERS
    .filter(vc => calcOverlap(hz, vc) < 500)
    .map(vc => ({ hz, vc, dist: Math.round(calcOverlap(hz, vc)) }))
);

export default function DeportationVeteranMapLayer() {
  const [activeLayers, setActiveLayers] = useState(
    Object.fromEntries(LAYERS.map(l => [l.id, l.default]))
  );
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [filterSurge, setFilterSurge] = useState(0); // minimum % surge filter

  const toggleLayer = (id) => setActiveLayers(p => ({ ...p, [id]: !p[id] }));

  const filteredHotZones = ICE_HOT_ZONES.filter(hz => {
    const pct = parseInt(hz.surge.match(/\d+/)?.[0] || "0");
    return pct >= filterSurge;
  });

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1, height: "calc(100vh - 140px)", display: "flex", flexDirection: "column" }}>
      <style>{`
        .leaflet-container { background: #04060C !important; }
        .leaflet-tile { filter: brightness(0.35) saturate(0.4) hue-rotate(180deg); }
        .leaflet-control-zoom a { background:#0D1525!important; color:#F5B942!important; border-color:#1A2640!important; }
        .leaflet-popup-content-wrapper { background:#0D1525; color:#F0F6FF; border:1px solid #1A2640; border-radius:8px; }
        .leaflet-popup-tip { background:#0D1525; }
      `}</style>

      {/* KPI strip */}
      <div style={{ display:"flex", gap:8, padding:"10px 0 8px", flexWrap:"wrap", flexShrink:0 }}>
        {KPIS.map((k,i) => (
          <div key={i} style={{ background:P.card, border:`1px solid ${k.color}30`, borderTop:`3px solid ${k.color}`,
            borderRadius:8, padding:"6px 12px", minWidth:110, textAlign:"center" }}>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:800, color:k.color }}>{k.value}</div>
            <div style={{ fontSize:6, color:P.t4, marginTop:2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Map + controls row */}
      <div style={{ flex:1, display:"flex", gap:12, minHeight:0 }}>

        {/* Map */}
        <div style={{ flex:1, borderRadius:12, overflow:"hidden", border:`2px solid ${P.b}`, position:"relative" }}>
          <MapContainer
            center={[31.5, -100]}
            zoom={5}
            style={{ width:"100%", height:"100%" }}
            zoomControl={false}
          >
            <ZoomControl position="topright" />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap &copy; CARTO"
            />

            {/* Enforcement Corridors */}
            {activeLayers.corridors && (
              <LayerGroup>
                {ENFORCEMENT_CORRIDORS.map(c => (
                  <Polygon key={c.id} positions={c.positions}
                    pathOptions={{ color: c.color, fillColor: c.color, fillOpacity: 0.12, weight: 1.5, dashArray:"4 4" }}
                    eventHandlers={{ click: () => setSelectedFeature({ type:"corridor", data:c }) }}>
                    <Tooltip sticky>
                      <div style={{ fontFamily:"monospace", fontSize:10 }}>
                        <strong style={{ color:c.color }}>{c.label}</strong><br/>
                        Apprehensions: {c.apprehensions.toLocaleString()}<br/>
                        Intensity: <span style={{ color:c.color }}>{c.intensity}</span>
                      </div>
                    </Tooltip>
                  </Polygon>
                ))}
              </LayerGroup>
            )}

            {/* ICE Hot Zones */}
            {activeLayers.hotzone && (
              <LayerGroup>
                {filteredHotZones.map(hz => (
                  <CircleMarker key={hz.id} center={[hz.lat, hz.lng]}
                    radius={hz.radius / 3.5}
                    pathOptions={{ color: hz.color, fillColor: hz.color, fillOpacity: 0.25, weight: 1.5 }}
                    eventHandlers={{ click: () => setSelectedFeature({ type:"hotzone", data:hz }) }}>
                    <Tooltip>
                      <div style={{ fontFamily:"monospace", fontSize:10 }}>
                        <strong style={{ color:hz.color }}>{hz.city}</strong><br/>
                        Deported: {hz.deported.toLocaleString()}<br/>
                        Vet. At-Risk: {hz.vetRisk.toLocaleString()}<br/>
                        Surge: <span style={{ color:"#ff0055" }}>{hz.surge}</span>
                      </div>
                    </Tooltip>
                  </CircleMarker>
                ))}
              </LayerGroup>
            )}

            {/* Veteran Clusters */}
            {activeLayers.veterans && (
              <LayerGroup>
                {VETERAN_CLUSTERS.map(vc => (
                  <CircleMarker key={vc.id} center={[vc.lat, vc.lng]}
                    radius={Math.max(6, vc.count / 18)}
                    pathOptions={{ color: vc.color, fillColor: vc.color, fillOpacity: 0.5, weight: 2 }}
                    eventHandlers={{ click: () => setSelectedFeature({ type:"veteran", data:vc }) }}>
                    <Tooltip>
                      <div style={{ fontFamily:"monospace", fontSize:10 }}>
                        <strong style={{ color:vc.color }}>{vc.label}</strong><br/>
                        Est. Veterans: {vc.count}<br/>
                        Status: {vc.active ? "✓ Active" : "Unconfirmed"}<br/>
                        {vc.cases.length > 0 && <>Cases: {vc.cases.join(", ")}</>}
                      </div>
                    </Tooltip>
                  </CircleMarker>
                ))}
              </LayerGroup>
            )}

            {/* Overlap zones — pulsing rings */}
            {activeLayers.overlap && (
              <LayerGroup>
                {OVERLAP_ZONES.map((o, i) => (
                  <CircleMarker key={i}
                    center={[(o.hz.lat + o.vc.lat)/2, (o.hz.lng + o.vc.lng)/2]}
                    radius={14}
                    pathOptions={{ color:"#F5B942", fillColor:"#F5B942", fillOpacity:0.08, weight:2, dashArray:"6 4" }}
                    eventHandlers={{ click: () => setSelectedFeature({ type:"overlap", data:o }) }}>
                    <Tooltip>
                      <div style={{ fontFamily:"monospace", fontSize:10 }}>
                        <strong style={{ color:"#F5B942" }}>HIGH-RISK OVERLAP</strong><br/>
                        {o.hz.city} ↔ {o.vc.label}<br/>
                        Distance: ~{o.dist} km
                      </div>
                    </Tooltip>
                  </CircleMarker>
                ))}
              </LayerGroup>
            )}
          </MapContainer>

          {/* Map legend */}
          <div style={{ position:"absolute", bottom:12, left:12, background:"rgba(4,6,12,0.92)", border:`1px solid ${P.b}`,
            borderRadius:8, padding:"8px 12px", zIndex:1000, fontSize:7 }}>
            <div style={{ color:P.gold, fontWeight:800, marginBottom:5, letterSpacing:2 }}>LEGEND</div>
            {[["#ff0055","ICE Hot Zone (high)"],["#ffaa00","ICE Hot Zone (moderate)"],
              ["#2DD4BF","Veteran Cluster (confirmed)"],["#4A9EFF","Veteran Cluster (probable)"],
              ["#9D7BFF","Veteran Cluster (remote)"],["#F5B942","High-Risk Overlap Zone"],
              ["#ff5500","Enforcement Corridor"]].map(([c,l]) => (
              <div key={l} style={{ display:"flex", alignItems:"center", gap:5, marginBottom:3 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:c, flexShrink:0 }} />
                <span style={{ color:P.t3 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ width:260, display:"flex", flexDirection:"column", gap:10, overflowY:"auto" }}>

          {/* Layer toggles */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, overflow:"hidden", flexShrink:0 }}>
            <div style={{ padding:"8px 12px", borderBottom:`1px solid ${P.b}`, background:`${P.gold}10` }}>
              <span style={{ fontSize:8, fontWeight:800, color:P.gold }}>🗂 Map Layers</span>
            </div>
            <div style={{ padding:"8px 10px" }}>
              {LAYERS.map(l => (
                <button key={l.id} onClick={() => toggleLayer(l.id)}
                  style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"6px 8px", marginBottom:4,
                    background: activeLayers[l.id] ? `${P.teal}12` : "transparent",
                    border:`1px solid ${activeLayers[l.id] ? P.teal+"50" : P.b}`,
                    borderRadius:6, cursor:"pointer", fontFamily:"inherit" }}>
                  <div style={{ width:28, height:14, borderRadius:7, background: activeLayers[l.id] ? P.teal : "#1A2640",
                    position:"relative", transition:"all .2s", flexShrink:0 }}>
                    <div style={{ width:10, height:10, borderRadius:"50%", background:"#fff",
                      position:"absolute", top:2, left: activeLayers[l.id] ? 15 : 2, transition:"left .2s" }} />
                  </div>
                  <span style={{ fontSize:8, fontWeight:700, color: activeLayers[l.id] ? P.teal : P.t4, textAlign:"left" }}>{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Surge filter */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"10px 12px", flexShrink:0 }}>
            <div style={{ fontSize:8, fontWeight:800, color:P.red, marginBottom:8 }}>🎚 Min. Surge Filter</div>
            <div style={{ fontSize:7, color:P.t4, marginBottom:6 }}>Show zones with &gt; {filterSurge}% FY2024 surge</div>
            <input type="range" min="0" max="500" step="25" value={filterSurge}
              onChange={e => setFilterSurge(Number(e.target.value))}
              style={{ width:"100%", accentColor:P.red }} />
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:6, color:P.t4, marginTop:2 }}>
              <span>0%</span><span style={{ color:P.red, fontWeight:800 }}>{filterSurge}%</span><span>500%</span>
            </div>
            <div style={{ marginTop:6, fontSize:7, color:P.gold }}>
              Showing {filteredHotZones.length} / {ICE_HOT_ZONES.length} hot zones
            </div>
          </div>

          {/* Selected feature detail */}
          {selectedFeature && (
            <div style={{ background:P.card, border:`2px solid ${P.gold}40`, borderRadius:10, overflow:"hidden", flexShrink:0 }}>
              <div style={{ padding:"8px 12px", borderBottom:`1px solid ${P.b}`, background:`${P.gold}10`,
                display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:8, fontWeight:800, color:P.gold }}>📍 Selected Feature</span>
                <button onClick={() => setSelectedFeature(null)}
                  style={{ background:"transparent", border:"none", color:P.t4, cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>✕</button>
              </div>
              <div style={{ padding:"10px 12px" }}>
                {selectedFeature.type === "hotzone" && (() => {
                  const d = selectedFeature.data;
                  return (
                    <>
                      <div style={{ fontSize:10, fontWeight:800, color:"#ff0055", marginBottom:6 }}>{d.city}</div>
                      {[["Zone ID",d.id],["Deported (FY22–25)",d.deported.toLocaleString()],
                        ["Est. Vet. At-Risk",d.vetRisk.toLocaleString()],["FY2024 Surge",d.surge]].map(([k,v]) => (
                        <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:8, padding:"3px 0", borderBottom:`1px solid ${P.b}20` }}>
                          <span style={{ color:P.t4 }}>{k}</span>
                          <span style={{ color:"#ff0055", fontWeight:700 }}>{v}</span>
                        </div>
                      ))}
                      <div style={{ marginTop:8, padding:"6px 8px", background:"#ff005510", borderRadius:6, border:"1px solid #ff005520", fontSize:7, color:P.t3, lineHeight:1.6 }}>
                        ⚠ Zero veteran screening flags in ICE database for this zone. Congressional escalation recommended.
                      </div>
                    </>
                  );
                })()}
                {selectedFeature.type === "veteran" && (() => {
                  const d = selectedFeature.data;
                  return (
                    <>
                      <div style={{ fontSize:10, fontWeight:800, color:d.color, marginBottom:6 }}>{d.label}</div>
                      {[["Cluster ID",d.id],["Est. Veterans",d.count],
                        ["Status",d.active?"✓ Active Tracking":"Unconfirmed"],
                        ["Linked Cases",d.cases.length ? d.cases.join(", ") : "None"]].map(([k,v]) => (
                        <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:8, padding:"3px 0", borderBottom:`1px solid ${P.b}20` }}>
                          <span style={{ color:P.t4 }}>{k}</span>
                          <span style={{ color:d.color, fontWeight:700 }}>{v}</span>
                        </div>
                      ))}
                    </>
                  );
                })()}
                {selectedFeature.type === "corridor" && (() => {
                  const d = selectedFeature.data;
                  return (
                    <>
                      <div style={{ fontSize:10, fontWeight:800, color:d.color, marginBottom:6 }}>{d.label}</div>
                      {[["Corridor ID",d.id],["Apprehensions",d.apprehensions.toLocaleString()],["Intensity",d.intensity]].map(([k,v]) => (
                        <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:8, padding:"3px 0", borderBottom:`1px solid ${P.b}20` }}>
                          <span style={{ color:P.t4 }}>{k}</span>
                          <span style={{ color:d.color, fontWeight:700 }}>{v}</span>
                        </div>
                      ))}
                    </>
                  );
                })()}
                {selectedFeature.type === "overlap" && (() => {
                  const { hz, vc, dist } = selectedFeature.data;
                  return (
                    <>
                      <div style={{ fontSize:9, fontWeight:800, color:"#F5B942", marginBottom:6 }}>⚡ HIGH-RISK OVERLAP</div>
                      <div style={{ fontSize:8, color:P.t2, marginBottom:6 }}>ICE zone and veteran cluster within {dist} km</div>
                      {[["Hot Zone",hz.city],["Deported",hz.deported.toLocaleString()],
                        ["Vet Cluster",vc.label],["Est. Veterans",vc.count],
                        ["Distance",`~${dist} km`]].map(([k,v]) => (
                        <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:8, padding:"3px 0", borderBottom:`1px solid ${P.b}20` }}>
                          <span style={{ color:P.t4 }}>{k}</span>
                          <span style={{ color:"#F5B942", fontWeight:700 }}>{v}</span>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Hot zone table */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, overflow:"hidden" }}>
            <div style={{ padding:"8px 12px", borderBottom:`1px solid ${P.b}`, background:`${P.red}10` }}>
              <span style={{ fontSize:8, fontWeight:800, color:"#ff0055" }}>🔴 Top Hot Zones by Surge</span>
            </div>
            <div style={{ padding:"6px 10px", maxHeight:220, overflowY:"auto" }}>
              {[...ICE_HOT_ZONES]
                .sort((a,b) => parseInt(b.surge) - parseInt(a.surge))
                .map((hz,i) => (
                <div key={hz.id} onClick={() => setSelectedFeature({ type:"hotzone", data:hz })}
                  style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                    padding:"5px 6px", marginBottom:3, borderRadius:5, cursor:"pointer",
                    background: selectedFeature?.data?.id === hz.id ? "#ff005512" : "transparent",
                    border:`1px solid ${selectedFeature?.data?.id === hz.id ? "#ff005530" : "transparent"}` }}>
                  <div>
                    <div style={{ fontSize:7, fontWeight:800, color:P.t2 }}>{hz.city}</div>
                    <div style={{ fontSize:6, color:P.t4 }}>{hz.deported.toLocaleString()} dep. · {hz.vetRisk.toLocaleString()} vet risk</div>
                  </div>
                  <span style={{ fontSize:7, fontWeight:800, color:"#ff0055", whiteSpace:"nowrap" }}>{hz.surge.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Veteran cluster summary */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, overflow:"hidden" }}>
            <div style={{ padding:"8px 12px", borderBottom:`1px solid ${P.b}`, background:`${P.teal}10` }}>
              <span style={{ fontSize:8, fontWeight:800, color:P.teal }}>🎖 Veteran Clusters (MX)</span>
            </div>
            <div style={{ padding:"6px 10px" }}>
              {VETERAN_CLUSTERS.map(vc => (
                <div key={vc.id} onClick={() => setSelectedFeature({ type:"veteran", data:vc })}
                  style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                    padding:"4px 6px", marginBottom:3, borderRadius:5, cursor:"pointer",
                    background: selectedFeature?.data?.id === vc.id ? `${vc.color}12` : "transparent" }}>
                  <div>
                    <div style={{ fontSize:7, fontWeight:700, color:vc.color }}>{vc.label}</div>
                    <div style={{ fontSize:6, color:P.t4 }}>{vc.count} est. veterans</div>
                  </div>
                  <span style={{ fontSize:6, background: vc.active ? `${P.teal}15` : `${P.b}`, color: vc.active ? P.teal : P.t4,
                    borderRadius:3, padding:"1px 5px", fontWeight:700 }}>
                    {vc.active ? "ACTIVE" : "UNCONF"}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}