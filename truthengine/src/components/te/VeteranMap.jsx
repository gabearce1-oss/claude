import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, Tooltip } from "react-leaflet";
import { P } from "../../lib/teData";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet default icon issue in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ── DATA ──────────────────────────────────────────────────────────────────────

const CASES = [
  { id:"C001", name:"SGT George Ramos",    lat:34.052,  lng:-118.243, country:"USA",    city:"Los Angeles, CA",   tier:"Gold",   conf:96, status:"In US",   urgency:"standard", branch:"Army",  era:"Vietnam" },
  { id:"C002", name:"Mario Valenzuela",    lat:32.514,  lng:-117.038, country:"MEX",    city:"Tijuana, MX",       tier:"Gold",   conf:89, status:"Deported",urgency:"high",     branch:"USMC",  era:"Vietnam" },
  { id:"C003", name:"Victor Valenzuela",   lat:32.514,  lng:-117.038, country:"MEX",    city:"Tijuana, MX",       tier:"Silver", conf:87, status:"Deported",urgency:"high",     branch:"USMC",  era:"Vietnam" },
  { id:"C004", name:"Sae Joon Park",       lat:37.566,  lng:126.978,  country:"KOR",    city:"Seoul, South Korea",tier:"Gold",   conf:94, status:"Deported",urgency:"critical", branch:"USMC",  era:"Post" },
  { id:"C005", name:"Miguel Segura",       lat:31.301,  lng:-110.933, country:"MEX",    city:"Nogales, MX",       tier:"Silver", conf:78, status:"Deported",urgency:"high",     branch:"Army",  era:"Vietnam" },
  { id:"C006", name:"Joaquin Duran",       lat:4.711,   lng:-74.073,  country:"COL",    city:"Bogotá, Colombia",  tier:"Bronze", conf:72, status:"Deported",urgency:"med",      branch:"Army",  era:"Vietnam" },
];

const SHELTERS = [
  { id:"S01", name:"Casa del Migrante",    lat:32.525, lng:-117.030, city:"Tijuana",   capacity:200, vet_count:12, contact:"casadelmigrante.org" },
  { id:"S03", name:"El Refugio",           lat:31.738, lng:-106.489, city:"Ciudad Juárez", capacity:80, vet_count:5, contact:"elrefugio.org.mx" },
  { id:"S04", name:"Albergue Nazaret",     lat:31.301, lng:-110.940, city:"Nogales",   capacity:35,  vet_count:3, contact:"N/A" },
  { id:"S06", name:"Casa Alitas",          lat:32.222, lng:-110.969, city:"Tucson AZ", capacity:100, vet_count:8, contact:"catholiccharitiesaz.org" },
];

const AGENCIES = [
  { id:"ICE_LA",  name:"ICE ERO Los Angeles",     lat:34.052, lng:-118.259, type:"ICE",  note:"Primary enforcement hub — SoCal" },
  { id:"ICE_SD",  name:"ICE ERO San Diego",        lat:32.715, lng:-117.157, type:"ICE",  note:"Border enforcement · C002/C003 cases" },
  { id:"VA_LA",   name:"VA Regional Office LA",   lat:34.073, lng:-118.399, type:"VA",   note:"F001 FOIA pending — BIRLS records" },
  { id:"EOIR_LA", name:"EOIR Immigration Court",   lat:34.048, lng:-118.258, type:"EOIR", note:"Active removal proceedings" },
  { id:"CBP_SD",  name:"CBP Port of Entry SD",     lat:32.540, lng:-117.049, type:"CBP",  note:"Primary border crossing point" },
];

const SDSU = { name:"SDSU Special Collections", lat:32.776, lng:-117.071, city:"San Diego, CA" };

const DEPORTATION_ROUTES = [
  { from:[34.052,-118.243], to:[32.514,-117.038], label:"LA → Tijuana (C002/C003)", color:"#FF5C5C" },
  { from:[34.052,-118.243], to:[31.301,-110.933], label:"LA → Nogales (C005)", color:"#F5C842" },
  { from:[34.052,-118.243], to:[37.566,126.978],  label:"LA → Seoul (C004)", color:"#FF5C5C" },
  { from:[34.052,-118.243], to:[4.711,-74.073],   label:"LA → Bogotá (C006)", color:"#4A9EFF" },
];

const TIER_C = { Gold:P.gold, Silver:"#B8CCE8", Bronze:P.amber };
const URGENCY_C = { critical:P.red, high:P.amber, med:P.blue, standard:P.teal };

const LAYERS = ["cases","shelters","agencies","routes","sdsu"];

export default function VeteranMap() {
  const [selectedCase, setSelectedCase] = useState(null);
  const [activeLayers, setActiveLayers] = useState(new Set(["cases","shelters","routes","sdsu"]));
  const [filterStatus, setFilterStatus] = useState("all");

  const toggleLayer = (l) => setActiveLayers(prev => {
    const n = new Set(prev); n.has(l) ? n.delete(l) : n.add(l); return n;
  });

  const visibleCases = CASES.filter(c =>
    filterStatus === "all" || c.status.toLowerCase().includes(filterStatus)
  );

  // Center on US/Mexico border region
  const CENTER = [28.0, -100.0];

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", gap:10, justifyContent:"space-between", flexWrap:"wrap", marginBottom:10 }}>
        <div>
          <div style={{ fontSize:12, fontWeight:800, color:P.t1 }}>
            🗺️ Geospatial Veteran <span style={{ color:P.gold }}>Mapping</span>
          </div>
          <div style={{ fontSize:7, color:P.t4, letterSpacing:2 }}>
            6 CASES · {SHELTERS.length} SHELTERS · DEPORTATION ROUTES · AGENCY NETWORK
          </div>
        </div>
        {/* Status filter */}
        <div style={{ display:"flex", gap:6 }}>
          {[["all","All Cases"],["in us","In US"],["deported","Deported"]].map(([v,l])=>(
            <button key={v} onClick={()=>setFilterStatus(v)}
              style={{ padding:"5px 12px", fontSize:8, fontWeight:700, cursor:"pointer",
                background:filterStatus===v?`${P.gold}18`:"transparent",
                border:`1px solid ${filterStatus===v?P.gold:P.b}`,
                color:filterStatus===v?P.gold:P.t4, borderRadius:7 }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))", gap:7, marginBottom:10 }}>
        {[
          ["Verified Cases",  "6",    P.gold],
          ["Deported",        "5",    P.red],
          ["In US",           "1",    P.teal],
          ["Countries",       "3",    P.blue],
          ["Active Shelters", "4",    P.violet],
          ["Total Shelter Vets", "28+", P.amber],
        ].map(([l,v,c])=>(
          <div key={l} style={{ background:P.card, border:`1px solid ${c}25`, borderLeft:`3px solid ${c}`, borderRadius:7, padding:"6px 10px" }}>
            <div style={{ fontSize:6, color:P.t4 }}>{l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:15, fontWeight:800, color:c }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:10 }}>
        {/* Map */}
        <div style={{ flex:1, borderRadius:10, overflow:"hidden", border:`1px solid ${P.b}`, height:500 }}>
          <MapContainer center={CENTER} zoom={4} style={{ height:"100%", width:"100%", background:"#080D18" }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />

            {/* Deportation routes */}
            {activeLayers.has("routes") && DEPORTATION_ROUTES.map((r,i)=>(
              <Polyline key={i} positions={[r.from, r.to]} pathOptions={{ color:r.color, weight:2, opacity:0.6, dashArray:"8,6" }}>
                <Tooltip>{r.label}</Tooltip>
              </Polyline>
            ))}

            {/* Cases */}
            {activeLayers.has("cases") && visibleCases.map(c=>{
              const tc = TIER_C[c.tier] || P.t4;
              const uc = URGENCY_C[c.urgency] || P.t4;
              return (
                <CircleMarker key={c.id} center={[c.lat, c.lng]} radius={c.urgency==="critical"?14:10}
                  pathOptions={{ fillColor:tc, color:uc, weight:2.5, fillOpacity:0.85 }}
                  eventHandlers={{ click: ()=>setSelectedCase(c.id===selectedCase?null:c.id) }}>
                  <Popup>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, minWidth:180 }}>
                      <div style={{ fontWeight:800, marginBottom:4 }}>{c.name}</div>
                      <div><b>ID:</b> {c.id} · <b>Tier:</b> {c.tier}</div>
                      <div><b>Branch:</b> {c.branch} · {c.era}</div>
                      <div><b>Status:</b> <span style={{ color:c.status==="Deported"?"#FF5C5C":"#1CCFB4" }}>{c.status}</span></div>
                      <div><b>Location:</b> {c.city}</div>
                      <div><b>Confidence:</b> {c.conf}%</div>
                      {c.urgency==="critical"&&<div style={{ color:"#FF5C5C", fontWeight:800 }}>⚡ CRITICAL — URGENT</div>}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {/* Shelters */}
            {activeLayers.has("shelters") && SHELTERS.map(s=>(
              <CircleMarker key={s.id} center={[s.lat, s.lng]} radius={7}
                pathOptions={{ fillColor:P.violet, color:P.violet, weight:2, fillOpacity:0.7 }}>
                <Popup>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, minWidth:160 }}>
                    <div style={{ fontWeight:800, marginBottom:4 }}>🏠 {s.name}</div>
                    <div><b>City:</b> {s.city}</div>
                    <div><b>Capacity:</b> {s.capacity}</div>
                    <div><b>Est. Veterans:</b> {s.vet_count}</div>
                    <div><b>Contact:</b> {s.contact}</div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {/* Agencies */}
            {activeLayers.has("agencies") && AGENCIES.map(a=>{
              const c = a.type==="ICE"?"#FF5C5C":a.type==="VA"?"#4A9EFF":"#9D7BFF";
              return (
                <CircleMarker key={a.id} center={[a.lat, a.lng]} radius={6}
                  pathOptions={{ fillColor:c, color:c, weight:1.5, fillOpacity:0.6 }}>
                  <Popup>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10 }}>
                      <div style={{ fontWeight:800 }}>{a.name}</div>
                      <div style={{ color:c }}>{a.type}</div>
                      <div>{a.note}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {/* SDSU */}
            {activeLayers.has("sdsu") && (
              <CircleMarker center={[SDSU.lat, SDSU.lng]} radius={8}
                pathOptions={{ fillColor:"#FF8C42", color:"#FF8C42", weight:2, fillOpacity:0.9 }}>
                <Popup>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10 }}>
                    <div style={{ fontWeight:800 }}>🎓 {SDSU.name}</div>
                    <div>{SDSU.city}</div>
                    <div>Vietnam Oral History · Chicano Studies</div>
                    <div>askscua@sdsu.edu · (619) 594-6791</div>
                  </div>
                </Popup>
              </CircleMarker>
            )}
          </MapContainer>
        </div>

        {/* Sidebar */}
        <div style={{ width:210, flexShrink:0, display:"flex", flexDirection:"column", gap:8, overflowY:"auto" }}>
          {/* Layer controls */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"10px 12px" }}>
            <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:8 }}>MAP LAYERS</div>
            {[
              ["cases",    "🎖️ Verified Cases",      P.gold],
              ["shelters", "🏠 Border Shelters",     P.violet],
              ["agencies", "🏛️ Agencies (ICE/VA)",   P.red],
              ["routes",   "✈ Deportation Routes",   P.amber],
              ["sdsu",     "🎓 SDSU Collections",    "#FF8C42"],
            ].map(([l,label,c])=>(
              <button key={l} onClick={()=>toggleLayer(l)}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:7, padding:"5px 8px", marginBottom:4,
                  background:activeLayers.has(l)?`${c}12`:"transparent",
                  border:`1px solid ${activeLayers.has(l)?c+"40":P.b}`,
                  borderRadius:6, color:activeLayers.has(l)?c:P.t4, fontSize:8, cursor:"pointer" }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:activeLayers.has(l)?c:P.b, flexShrink:0 }} />
                {label}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"10px 12px" }}>
            <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:6 }}>LEGEND</div>
            {[
              [P.gold,   "Gold Tier Case"],
              ["#B8CCE8","Silver Tier Case"],
              [P.amber,  "Bronze Tier Case"],
              [P.violet, "Border Shelter"],
              ["#FF5C5C","ICE Agency"],
              ["#4A9EFF","VA Agency"],
              ["#FF8C42","SDSU Archive"],
            ].map(([c,l])=>(
              <div key={l} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:c, flexShrink:0 }} />
                <span style={{ fontSize:7, color:P.t3 }}>{l}</span>
              </div>
            ))}
            <div style={{ marginTop:6, fontSize:6, color:P.t4 }}>Dashed line = deportation route · Larger circle = critical urgency</div>
          </div>

          {/* Case list */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"10px 12px" }}>
            <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:6 }}>CASE REGISTRY</div>
            {CASES.map(c=>{
              const tc = TIER_C[c.tier];
              const uc = URGENCY_C[c.urgency];
              return (
                <div key={c.id} style={{ padding:"5px 0", borderBottom:`1px solid ${P.b}20`, cursor:"pointer" }}
                  onClick={()=>setSelectedCase(c.id===selectedCase?null:c.id)}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:8, color:c.urgency==="critical"?P.red:P.t2, fontWeight:700 }}>{c.name}</span>
                    <span style={{ fontSize:7, color:tc, fontWeight:700 }}>{c.conf}%</span>
                  </div>
                  <div style={{ fontSize:6, color:P.t4 }}>{c.city} · {c.status}</div>
                </div>
              );
            })}
          </div>

          {/* Shelter summary */}
          <div style={{ background:P.card, border:`1px solid ${P.violet}20`, borderRadius:10, padding:"10px 12px" }}>
            <div style={{ fontSize:7, color:P.violet, letterSpacing:2, fontWeight:700, marginBottom:6 }}>🏠 SHELTER NETWORK</div>
            {SHELTERS.map(s=>(
              <div key={s.id} style={{ marginBottom:5, padding:"4px 0", borderBottom:`1px solid ${P.b}20` }}>
                <div style={{ fontSize:7, color:P.t2, fontWeight:700 }}>{s.name}</div>
                <div style={{ fontSize:6, color:P.t4 }}>{s.city} · {s.vet_count} vets · cap {s.capacity}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}