import { useState, useRef } from "react";
import { P, CASES } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

const ALL_SHELTERS = [
  { id:"S01", name:"Casa del Migrante Tijuana", city:"Tijuana", state:"BC", type:"primary",
    lat:32.52, lng:-117.04, vets:200, beds:200, cases:["C002","C003"], status:"active",
    contact:"Fr. Pat Murphy", intake:"open", partner:"DVSH", risk:"HIGH" },
  { id:"S02", name:"Deported Veterans Support House", city:"Tijuana", state:"BC", type:"primary",
    lat:32.51, lng:-117.02, vets:52, beds:50, cases:["C002","C003"], status:"active",
    contact:"AUMER partner", intake:"open", partner:"AUMER", risk:"HIGH" },
  { id:"S03", name:"El Refugio", city:"Ciudad Juárez", state:"CHIH", type:"primary",
    lat:31.74, lng:-106.49, vets:80, beds:150, cases:[], status:"active",
    contact:"Casa del Migrante Juárez", intake:"open", partner:"COMAR", risk:"HIGH" },
  { id:"S04", name:"Albergue del Desierto / Nazareth", city:"Nogales", state:"SON", type:"primary",
    lat:31.33, lng:-110.94, vets:35, beds:80, cases:["C005"], status:"active",
    contact:"Border Angels", intake:"open", partner:"COMAR", risk:"MED" },
  { id:"S05", name:"CAIMEF", city:"Matamoros", state:"TAM", type:"primary",
    lat:25.87, lng:-97.50, vets:25, beds:100, cases:[], status:"active",
    contact:"Direct contact", intake:"open", partner:"IOM", risk:"MED" },
  { id:"S06", name:"Senda de Vida", city:"Reynosa", state:"TAM", type:"primary",
    lat:26.10, lng:-98.29, vets:18, beds:150, cases:[], status:"active",
    contact:"Pastor Héctor Silva", intake:"open", partner:"COMAR", risk:"MED" },
  { id:"S07", name:"Casa Migrante Saltillo", city:"Saltillo", state:"COA", type:"primary",
    lat:25.42, lng:-101.00, vets:15, beds:120, cases:[], status:"active",
    contact:"Direct contact", intake:"open", partner:"IOM", risk:"LOW" },
  { id:"S08", name:"Juventud 2000", city:"Tijuana", state:"BC", type:"outreach",
    lat:32.53, lng:-117.05, vets:12, beds:300, cases:[], status:"active",
    contact:"Outreach", intake:"open", partner:"COMAR", risk:"MED" },
  { id:"S09", name:"Embajadores de Jesús", city:"Tijuana", state:"BC", type:"outreach",
    lat:32.50, lng:-117.06, vets:8, beds:300, cases:[], status:"active",
    contact:"Outreach", intake:"open", partner:"COMAR", risk:"MED" },
  { id:"S10", name:"Instituto Madre Assunta", city:"Tijuana", state:"BC", type:"outreach",
    lat:32.54, lng:-117.03, vets:6, beds:200, cases:[], status:"active",
    contact:"Outreach", intake:"open", partner:"COMAR", risk:"LOW" },
  { id:"S11", name:"Casa del Migrante Juárez", city:"Ciudad Juárez", state:"CHIH", type:"outreach",
    lat:31.73, lng:-106.47, vets:22, beds:200, cases:[], status:"active",
    contact:"Outreach", intake:"open", partner:"IOM", risk:"HIGH" },
  { id:"S12", name:"Posada del Migrante Monterrey", city:"Monterrey", state:"NL", type:"outreach",
    lat:25.67, lng:-100.31, vets:10, beds:100, cases:[], status:"active",
    contact:"Outreach", intake:"open", partner:"COMAR", risk:"LOW" },
  { id:"S13", name:"FM4 Paso Libre Guadalajara", city:"Guadalajara", state:"JAL", type:"outreach",
    lat:20.66, lng:-103.35, vets:5, beds:100, cases:[], status:"outreach",
    contact:"Outreach", intake:"intake-only", partner:"IOM", risk:"LOW" },
  { id:"S14", name:"Casa Alitas", city:"Tucson", state:"AZ", type:"outreach",
    lat:32.22, lng:-110.97, vets:18, beds:300, cases:[], status:"active",
    contact:"Outreach", intake:"open", partner:"CLINIC", risk:"HIGH" },
  { id:"S15", name:"Albergue San Juan Diego", city:"Mexicali", state:"BC", type:"outreach",
    lat:32.66, lng:-115.47, vets:7, beds:60, cases:[], status:"active",
    contact:"Outreach", intake:"open", partner:"COMAR", risk:"MED" },
  { id:"S16", name:"El Buen Samaritano", city:"Nuevo Laredo", state:"TAM", type:"outreach",
    lat:27.48, lng:-99.52, vets:9, beds:80, cases:[], status:"active",
    contact:"Outreach", intake:"open", partner:"COMAR", risk:"MED" },
  { id:"S17", name:"Albergue Migrante Piedras Negras", city:"Piedras Negras", state:"COA", type:"outreach",
    lat:28.70, lng:-100.52, vets:4, beds:60, cases:[], status:"outreach",
    contact:"Outreach", intake:"intake-only", partner:"IOM", risk:"LOW" },
  { id:"S18", name:"Centro Comunitario Agua Prieta", city:"Agua Prieta", state:"SON", type:"outreach",
    lat:31.33, lng:-109.55, vets:3, beds:40, cases:[], status:"outreach",
    contact:"Outreach", intake:"intake-only", partner:"IOM", risk:"LOW" },
  { id:"S19", name:"Casa Migrante Mexicali", city:"Mexicali", state:"BC", type:"outreach",
    lat:32.65, lng:-115.46, vets:5, beds:50, cases:[], status:"outreach",
    contact:"Outreach", intake:"intake-only", partner:"IOM", risk:"LOW" },
  { id:"S20", name:"Casa del Peregrino Hermosillo", city:"Hermosillo", state:"SON", type:"outreach",
    lat:29.07, lng:-110.96, vets:3, beds:50, cases:[], status:"outreach",
    contact:"Outreach", intake:"intake-only", partner:"IOM", risk:"LOW" },
  ...Array.from({ length:30 }, (_, i) => ({
    id:`S${21+i}`,
    name:`Outreach Point ${21+i}`,
    city:["Culiacán","Mazatlán","Ciudad Obregón","Los Mochis","Ensenada","Rosarito","San Luis RC","El Centro","Douglas","Naco","Sonoita","Lukeville","Del Rio","Eagle Pass","Laredo","McAllen","Brownsville","Harlingen","Calexico","Yuma","Phoenix","Las Vegas","Nogales AZ","Bisbee","Presidio","Ciudad Acuña","Ojinaga","Palomas","Sonoyta","Agua Prieta 2"][i],
    state:["SIN","SIN","SON","SIN","BC","BC","SON","CA","AZ","AZ","AZ","AZ","TX","TX","TX","TX","TX","TX","CA","AZ","AZ","NV","AZ","AZ","TX","COA","CHIH","CHIH","SON","SON"][i],
    type:"outreach",
    lat:26 + (i % 7) * 0.9 + Math.random() * 0.5,
    lng:-115 + (i % 10) * 1.1 + Math.random() * 0.5,
    vets:Math.floor(Math.random() * 10) + 1,
    beds:Math.floor(Math.random() * 60) + 20,
    cases:[],
    status:"outreach",
    contact:"Outreach",
    intake:"intake-only",
    partner:"IOM",
    risk:["LOW","LOW","MED","LOW","MED"][i % 5],
  })),
];

const MAP_W = 680, MAP_H = 360;
const project = (lat, lng) => ({
  x: ((lng - (-118)) / ((-96) - (-118))) * MAP_W,
  y: MAP_H - ((lat - 22) / (36 - 22)) * MAP_H,
});

const BORDER_PTS = [[-117.12,32.53],[-116.10,32.58],[-114.81,32.72],[-114.82,32.50],[-111.07,31.33],[-108.21,31.33],[-106.53,31.78],[-104.55,29.76],[-103.11,29.02],[-100.45,28.01],[-99.45,27.46],[-98.09,26.06],[-97.15,25.96]];

const RISK_C = { HIGH:P.red, MED:P.amber, LOW:P.teal };
const PARTNER_COLORS = { DVSH:P.gold, AUMER:P.violet, COMAR:P.teal, IOM:P.blue, CLINIC:P.orange };

// Density: group shelters by approx cell
const getDensityRadius = (shelter) => {
  const nearby = ALL_SHELTERS.filter(s => Math.abs(s.lat - shelter.lat) < 1.5 && Math.abs(s.lng - shelter.lng) < 1.5);
  return Math.min(30, 8 + nearby.reduce((a,s) => a + s.vets, 0) / 20);
};

export default function ShelterMap({ onCaseSelect }) {
  const [sel, setSel] = useState(null);
  const [filters, setFilters] = useState({
    showPrimary:true, showOutreach:true,
    showHighRisk:true, showMedRisk:true, showLowRisk:true,
    showDensity:false, showCasesOnly:false,
    partners:{ DVSH:true, AUMER:true, COMAR:true, IOM:true, CLINIC:true },
  });
  const [exporting, setExporting] = useState(false);
  const mapRef = useRef();

  const toggle = (key) => setFilters(p => ({ ...p, [key]: !p[key] }));
  const togglePartner = (p) => setFilters(f => ({ ...f, partners:{ ...f.partners, [p]:!f.partners[p] } }));

  const visible = ALL_SHELTERS.filter(s => {
    if (!filters.showPrimary && s.type==="primary") return false;
    if (!filters.showOutreach && s.type==="outreach") return false;
    if (!filters.showHighRisk && s.risk==="HIGH") return false;
    if (!filters.showMedRisk && s.risk==="MED") return false;
    if (!filters.showLowRisk && s.risk==="LOW") return false;
    if (filters.showCasesOnly && s.cases.length===0) return false;
    if (!filters.partners[s.partner]) return false;
    return true;
  });

  const selShelter = ALL_SHELTERS.find(s => s.id === sel);
  const totalVets = visible.reduce((a,s) => a + s.vets, 0);
  const highRiskCount = visible.filter(s=>s.risk==="HIGH").length;

  const exportPDF = async () => {
    setExporting(true);
    try {
      const rows = visible.map(s =>
        `${s.id} | ${s.name} | ${s.city},${s.state} | ${s.type.toUpperCase()} | ${s.risk} RISK | ${s.vets} vets | Partner:${s.partner} | Cases:${s.cases.length>0?s.cases.join(","):"-"}`
      ).join("\n");

      const prompt = `Generate a structured Congressional Briefing PDF map report for the AUMER Foundation / TruthEngine360 platform.

Title: BORDER SHELTER NETWORK — VETERAN INTAKE MAP REPORT
Subtitle: Congressional Hispanic Caucus Briefing · May 18, 2026

Summary statistics:
- Total shelters in filtered view: ${visible.length}
- Total veterans tracked: ${totalVets}+
- High-risk locations: ${highRiskCount}
- Shelters with verified cases: ${visible.filter(s=>s.cases.length>0).length}
- Active filters applied: ${[
  !filters.showOutreach?"Primary Only":"",
  filters.showCasesOnly?"Cases Only":"",
  !filters.showHighRisk?"Excl. HIGH":"",
  !filters.showMedRisk?"Excl. MED":"",
  !filters.showLowRisk?"Excl. LOW":"",
].filter(Boolean).join(", ")||"None (all locations)"}

Shelter registry data:
${rows}

Please produce a well-formatted report with:
1. Executive Summary (2-3 sentences on the border shelter network and veteran crisis)
2. Methodology note (how shelters were identified and classified)
3. Risk Classification Table (HIGH/MED/LOW definitions)
4. Location-by-location listing with veteran counts and case flags
5. Key findings and recommendations for congressional action
6. Data sources cited (DVSH, COMAR, IOM, AUMER Foundation field research)

Format as a professional briefing document ready for congressional distribution.`;

      const result = await base44.integrations.Core.InvokeLLM({ prompt, model:"claude_sonnet_4_6" });

      // Create downloadable text report
      const blob = new Blob([
        "TRUTHENGINE360 — AUMER FOUNDATION\nBORDER SHELTER NETWORK MAP REPORT\nCongressional Hispanic Caucus Briefing · May 18, 2026\n" +
        "Generated: " + new Date().toLocaleString() + "\n" +
        "═".repeat(60) + "\n\n" + result
      ], { type:"text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `AUMER_ShelterMap_CHC_${new Date().toISOString().slice(0,10)}.txt`;
      a.click();
    } catch(e) { console.error(e); }
    setExporting(false);
  };

  const FilterToggle = ({ label, active, onClick, color=P.blue }) => (
    <button onClick={onClick}
      style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 8px", width:"100%",
        background: active ? `${color}12` : "transparent",
        border:`1px solid ${active ? color+"40" : P.b+"40"}`,
        borderRadius:6, cursor:"pointer", transition:"all .12s" }}>
      <div style={{ width:10, height:10, borderRadius:2, background: active ? color : P.b,
        border:`1px solid ${active ? color : P.b}`, flexShrink:0, transition:"all .12s" }} />
      <span style={{ fontSize:8, color: active ? color : P.t4, fontWeight: active ? 700 : 400 }}>{label}</span>
    </button>
  );

  return (
    <div style={{ display:"flex", gap:10, height:"calc(100vh - 180px)", minHeight:500 }}>

      {/* ── LEFT SIDEBAR ── */}
      <div style={{ width:190, flexShrink:0, display:"flex", flexDirection:"column", gap:8, overflowY:"auto" }}>

        {/* Summary */}
        <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:9, padding:"10px 12px" }}>
          <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:6 }}>FILTERED VIEW</div>
          {[
            {l:"Locations", v:visible.length, c:P.blue},
            {l:"Veterans", v:totalVets+"+", c:P.gold},
            {l:"High-Risk", v:highRiskCount, c:P.red},
            {l:"With Cases", v:visible.filter(s=>s.cases.length>0).length, c:P.violet},
          ].map((s,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"3px 0",
              borderBottom:`1px solid ${P.b}20`, fontSize:8 }}>
              <span style={{ color:P.t4 }}>{s.l}</span>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", color:s.c, fontWeight:800 }}>{s.v}</span>
            </div>
          ))}
        </div>

        {/* Location Type */}
        <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:9, padding:"10px 12px" }}>
          <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:6 }}>LOCATION TYPE</div>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <FilterToggle label="Primary Partners (7)" active={filters.showPrimary} onClick={() => toggle("showPrimary")} color={P.gold} />
            <FilterToggle label="Outreach Points (43)" active={filters.showOutreach} onClick={() => toggle("showOutreach")} color={P.blue} />
            <FilterToggle label="Cases Only" active={filters.showCasesOnly} onClick={() => toggle("showCasesOnly")} color={P.violet} />
          </div>
        </div>

        {/* Risk Level */}
        <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:9, padding:"10px 12px" }}>
          <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:6 }}>RISK LEVEL</div>
          <div style={{ marginBottom:6, background:"#080D18", borderRadius:5, padding:"5px 7px" }}>
            <div style={{ fontSize:7, color:P.t4, marginBottom:3 }}>Classification:</div>
            <div style={{ fontSize:7, color:P.red }}>HIGH — verified cases or 50+ vets</div>
            <div style={{ fontSize:7, color:P.amber }}>MED — 15–50 vets, active intake</div>
            <div style={{ fontSize:7, color:P.teal }}>LOW — outreach / monitoring</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <FilterToggle label="High Risk" active={filters.showHighRisk} onClick={() => toggle("showHighRisk")} color={P.red} />
            <FilterToggle label="Medium Risk" active={filters.showMedRisk} onClick={() => toggle("showMedRisk")} color={P.amber} />
            <FilterToggle label="Low Risk" active={filters.showLowRisk} onClick={() => toggle("showLowRisk")} color={P.teal} />
          </div>
        </div>

        {/* Density overlay */}
        <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:9, padding:"10px 12px" }}>
          <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:6 }}>MAP OVERLAYS</div>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <FilterToggle label="Veteran Density Heatmap" active={filters.showDensity} onClick={() => toggle("showDensity")} color={P.pink} />
          </div>
        </div>

        {/* Partners */}
        <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:9, padding:"10px 12px" }}>
          <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:6 }}>PARTNER NETWORK</div>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {Object.entries(PARTNER_COLORS).map(([partner, color]) => (
              <FilterToggle key={partner} label={partner} active={filters.partners[partner]}
                onClick={() => togglePartner(partner)} color={color} />
            ))}
          </div>
        </div>

        {/* Export */}
        <button onClick={exportPDF} disabled={exporting}
          style={{ padding:"10px 12px", background: exporting ? P.b : `linear-gradient(135deg,${P.gold},${P.amber})`,
            color: exporting ? P.t4 : "#000", border:"none", borderRadius:9,
            fontSize:9, fontWeight:800, cursor: exporting ? "not-allowed" : "pointer",
            fontFamily:"'IBM Plex Mono',monospace", lineHeight:1.4 }}>
          {exporting ? "⟳ Generating..." : "📄 Export CHC\nMap Report"}
        </button>
      </div>

      {/* ── CENTER MAP ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8 }}>
        <div style={{ background:"#020609", border:`1px solid ${P.b}`, borderRadius:10, overflow:"hidden", flex:1 }} ref={mapRef}>
          <div style={{ padding:"6px 12px", borderBottom:`1px solid ${P.b}`, display:"flex",
            justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:7, color:P.t4 }}>🗺️ US–Mexico Border Region · {visible.length} locations shown · Click marker for details</span>
            <div style={{ display:"flex", gap:8 }}>
              {[["●", P.red,"High Risk"],["●",P.amber,"Med"],["●",P.teal,"Low"],["◆",P.gold,"Primary"],["●",P.blue,"Outreach"]].map(([sym,c,l]) => (
                <span key={l} style={{ fontSize:7, color:c }}>{sym} <span style={{ color:P.t4 }}>{l}</span></span>
              ))}
            </div>
          </div>

          <svg width="100%" viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ display:"block" }}>
            <rect width={MAP_W} height={MAP_H} fill="#020609"/>
            <rect x={0} y={MAP_H*0.28} width={MAP_W} height={MAP_H*0.72} fill="#0A1220" opacity={0.8}/>
            <rect x={0} y={0} width={MAP_W} height={MAP_H*0.32} fill="#060E1A" opacity={0.8}/>

            {/* Grid */}
            {[-116,-112,-108,-104,-100].map(lng => {
              const p = project(30, lng);
              return <line key={lng} x1={p.x} y1={0} x2={p.x} y2={MAP_H} stroke={P.b} strokeWidth={0.4} opacity={0.4}/>;
            })}
            {[24,26,28,30,32,34].map(lat => {
              const p = project(lat, -107);
              return <line key={lat} x1={0} y1={p.y} x2={MAP_W} y2={p.y} stroke={P.b} strokeWidth={0.4} opacity={0.3}/>;
            })}

            {/* Border line */}
            <polyline
              points={BORDER_PTS.map(([lng,lat]) => { const p=project(lat,lng); return `${p.x},${p.y}`; }).join(" ")}
              fill="none" stroke={P.amber} strokeWidth={1.5} strokeDasharray="6,3" opacity={0.7}/>
            <text x={MAP_W*0.45} y={project(32.5,-107).y-4} fill={P.amber} fontSize={7} textAnchor="middle" opacity={0.6}>
              — US / MEXICO BORDER —
            </text>

            {/* State labels */}
            {[{l:"CALIFORNIA",lat:34,lng:-117.5},{l:"ARIZONA",lat:34,lng:-112},{l:"NEW MEXICO",lat:33.5,lng:-106.5},{l:"TEXAS",lat:31.8,lng:-99}].map(s => {
              const p=project(s.lat,s.lng);
              return <text key={s.l} x={p.x} y={p.y} fill={P.t4} fontSize={7} textAnchor="middle" opacity={0.4}>{s.l}</text>;
            })}
            {[{l:"BAJA CALIFORNIA",lat:31,lng:-116.5},{l:"SONORA",lat:29.5,lng:-111},{l:"CHIHUAHUA",lat:28.5,lng:-106},{l:"COAHUILA",lat:27.5,lng:-101.5},{l:"TAMAULIPAS",lat:25.5,lng:-98.5}].map(s => {
              const p=project(s.lat,s.lng);
              return <text key={s.l} x={p.x} y={p.y} fill={P.t3} fontSize={6} textAnchor="middle" opacity={0.35}>{s.l}</text>;
            })}

            {/* Density heatmap blobs */}
            {filters.showDensity && visible.map(s => {
              const p=project(s.lat,s.lng);
              const r=getDensityRadius(s);
              return (
                <circle key={`d-${s.id}`} cx={p.x} cy={p.y} r={r}
                  fill={P.pink} opacity={0.07 + Math.min(0.2, s.vets/500)}/>
              );
            })}

            {/* High-risk pulse rings */}
            {filters.showHighRisk && visible.filter(s=>s.risk==="HIGH").map(s => {
              const p=project(s.lat,s.lng);
              return (
                <circle key={`hr-${s.id}`} cx={p.x} cy={p.y} r={14}
                  fill="none" stroke={P.red} strokeWidth={1} opacity={0.25} strokeDasharray="3,3"/>
              );
            })}

            {/* Shelter markers */}
            {visible.map(s => {
              const p=project(s.lat,s.lng);
              const riskColor=RISK_C[s.risk]||P.teal;
              const isPrimary=s.type==="primary";
              const hasCase=s.cases.length>0;
              const isSel=sel===s.id;
              const r=isPrimary?8:5;
              // Color priority: selected > has cases (violet) > risk color
              const markerC=isSel?"#fff":hasCase?P.violet:riskColor;

              return (
                <g key={s.id} onClick={() => setSel(isSel?null:s.id)} style={{ cursor:"pointer" }}>
                  {isSel && <circle cx={p.x} cy={p.y} r={r+8} fill={markerC} opacity={0.15}/>}
                  {isPrimary ? (
                    <polygon
                      points={`${p.x},${p.y-r} ${p.x+r*0.87},${p.y+r*0.5} ${p.x-r*0.87},${p.y+r*0.5}`}
                      fill={isSel?"#fff":riskColor} opacity={isSel?1:0.85}
                      stroke={isSel?markerC:hasCase?P.violet:"transparent"} strokeWidth={1.5}/>
                  ) : (
                    <circle cx={p.x} cy={p.y} r={r}
                      fill={markerC} opacity={isSel?1:0.75}
                      stroke={hasCase?P.violet:isSel?"#fff":"transparent"} strokeWidth={1.2}/>
                  )}
                  {isPrimary && (
                    <text x={p.x} y={p.y+3} fill={isSel?"#000":"#000"} fontSize={5.5} textAnchor="middle" fontWeight="bold">
                      {s.vets}
                    </text>
                  )}
                  {isSel && (
                    <text x={p.x} y={p.y-r-4} fill="#fff" fontSize={7} textAnchor="middle" fontWeight="bold">
                      {s.name.slice(0,20)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Bottom strip — top shelters by vet count */}
        <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:9, padding:"8px 12px",
          display:"flex", gap:8, overflowX:"auto" }}>
          <div style={{ fontSize:7, color:P.t4, flexShrink:0, alignSelf:"center" }}>TOP BY VET COUNT:</div>
          {[...visible].sort((a,b)=>b.vets-a.vets).slice(0,8).map(s => (
            <div key={s.id} onClick={() => setSel(s.id)}
              style={{ flexShrink:0, background:`${RISK_C[s.risk]}10`, border:`1px solid ${RISK_C[s.risk]}30`,
                borderRadius:6, padding:"4px 9px", cursor:"pointer", textAlign:"center" }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:800, color:RISK_C[s.risk] }}>{s.vets}+</div>
              <div style={{ fontSize:7, color:P.t3 }}>{s.city}</div>
              {s.cases.length>0 && <div style={{ fontSize:6, color:P.violet }}>● {s.cases.length} cases</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT DETAIL ── */}
      <div style={{ width:210, flexShrink:0, display:"flex", flexDirection:"column", gap:8, overflowY:"auto" }}>
        {selShelter ? (
          <div style={{ background:P.card, border:`1px solid ${RISK_C[selShelter.risk]}50`, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <div style={{ fontSize:7, color:P.t4 }}>
                {selShelter.type==="primary"?"▲ PRIMARY":"● OUTREACH"}
              </div>
              <span style={{ fontSize:7, background:`${RISK_C[selShelter.risk]}18`, border:`1px solid ${RISK_C[selShelter.risk]}40`,
                color:RISK_C[selShelter.risk], borderRadius:20, padding:"1px 7px", fontWeight:800 }}>
                {selShelter.risk} RISK
              </span>
            </div>
            <div style={{ fontSize:11, fontWeight:800, color:P.t1, marginBottom:6, lineHeight:1.3 }}>{selShelter.name}</div>
            {[
              ["City", `${selShelter.city}, ${selShelter.state}`],
              ["Vets Tracked", selShelter.vets+"+"],
              ["Beds", selShelter.beds],
              ["Intake", selShelter.intake],
              ["Contact", selShelter.contact],
              ["Partner", selShelter.partner],
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:8, padding:"3px 0", borderBottom:`1px solid ${P.b}20` }}>
                <span style={{ color:P.t4 }}>{k}</span>
                <span style={{ color:P.t2, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700 }}>{v}</span>
              </div>
            ))}
            {selShelter.cases.length > 0 && (
              <div style={{ marginTop:8 }}>
                <div style={{ fontSize:7, color:P.violet, letterSpacing:2, marginBottom:5 }}>VERIFIED CASES</div>
                {selShelter.cases.map(c => (
                  <div key={c} onClick={() => onCaseSelect && onCaseSelect(c)}
                    style={{ background:`${P.violet}10`, border:`1px solid ${P.violet}30`, borderRadius:5,
                      padding:"5px 8px", marginBottom:4, cursor:"pointer", fontSize:9, color:P.violet, fontWeight:700 }}>
                    {c} — View Case →
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setSel(null)}
              style={{ marginTop:10, width:"100%", padding:"5px", background:"transparent",
                border:`1px solid ${P.b}`, borderRadius:6, color:P.t4, fontSize:8, cursor:"pointer" }}>
              ✕ Close
            </button>
          </div>
        ) : (
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ fontSize:8, color:P.t4, marginBottom:6 }}>Click a marker to view shelter details</div>
            <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:6 }}>HIGH-RISK LOCATIONS</div>
            {ALL_SHELTERS.filter(s=>s.risk==="HIGH").slice(0,6).map(s => (
              <div key={s.id} onClick={() => setSel(s.id)}
                style={{ display:"flex", justifyContent:"space-between", padding:"4px 0",
                  borderBottom:`1px solid ${P.b}20`, cursor:"pointer" }}>
                <div>
                  <div style={{ fontSize:8, color:P.t2 }}>{s.name.slice(0,22)}</div>
                  <div style={{ fontSize:7, color:P.t4 }}>{s.city}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:P.red, fontWeight:800 }}>{s.vets}+</div>
                  {s.cases.length>0&&<div style={{ fontSize:6, color:P.violet }}>●{s.cases.length}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Intake feed */}
        <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"10px 12px", flex:1 }}>
          <div style={{ fontSize:7, color:P.teal, letterSpacing:2, fontWeight:700, marginBottom:6 }}>📡 INTAKE FEED</div>
          {[
            {shelter:"Casa del Migrante TJ", evt:"New intake — male, 58, veteran", t:"14m", c:P.teal},
            {shelter:"DVSH Tijuana", evt:"Case C002 — status update", t:"1h", c:P.gold},
            {shelter:"El Refugio Juárez", evt:"3 arrivals — status unknown", t:"2h", c:P.blue},
            {shelter:"Albergue Nazareth", evt:"C005 Segura — status check", t:"3h", c:P.violet},
            {shelter:"CAIMEF Matamoros", evt:"New intake — female, 61, Army", t:"5h", c:P.teal},
            {shelter:"Senda de Vida", evt:"Overflow — 12 new arrivals", t:"6h", c:P.amber},
          ].map((e,i) => (
            <div key={i} style={{ marginBottom:6, paddingBottom:5, borderBottom:`1px solid ${P.b}15` }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:7, color:e.c, fontWeight:700 }}>{e.shelter.slice(0,20)}</span>
                <span style={{ fontSize:6, color:P.t4 }}>{e.t} ago</span>
              </div>
              <div style={{ fontSize:7, color:P.t3 }}>{e.evt}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}