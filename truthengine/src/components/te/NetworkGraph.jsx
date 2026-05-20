import { useState, useEffect, useRef, useCallback } from "react";
import { P, CASES } from "../../lib/teData";

const NODE_TYPES = {
  case:    { color:P.gold,   icon:"🎖️", label:"Case" },
  agency:  { color:P.red,    icon:"🏛️", label:"Agency" },
  doc:     { color:P.blue,   icon:"📄", label:"Document" },
  method:  { color:P.violet, icon:"🔬", label:"Method" },
  law:     { color:P.amber,  icon:"⚖️", label:"Law" },
  shelter: { color:P.teal,   icon:"🏠", label:"Shelter" },
  person:  { color:P.pink||"#FF6BAF", icon:"👤", label:"Person" },
  stream:  { color:P.orange, icon:"🌊", label:"Stream" },
  data:    { color:"#4A9EFF", icon:"💾", label:"Database" },
  event:   { color:"#1CCFB4", icon:"📅", label:"Event" },
};

const NODES = [
  // Cases
  { id:"C001", type:"case",   label:"Ramos",        sub:"Vietnam MOH · Gold", weight:5 },
  { id:"C002", type:"case",   label:"M. Valenzuela", sub:"USMC · TJ Shelter", weight:4 },
  { id:"C003", type:"case",   label:"V. Valenzuela", sub:"USMC · TJ Shelter", weight:4 },
  { id:"C004", type:"case",   label:"Sae Joon Park", sub:"⚡ URGENT 2025",    weight:5 },
  { id:"C005", type:"case",   label:"M. Segura",     sub:"Nogales · Silver",  weight:3 },
  { id:"C006", type:"case",   label:"J. Duran",      sub:"Colombia · Bronze", weight:3 },
  // Agencies
  { id:"DCAS",  type:"agency", label:"DCAS",    sub:"58,220 records",    weight:5 },
  { id:"ICE",   type:"agency", label:"ICE/ERO", sub:"ENFORCE DB",        weight:5 },
  { id:"VA",    type:"agency", label:"VA BIRLS", sub:"83d FOIA overdue",  weight:4 },
  { id:"NARA",  type:"agency", label:"NARA",    sub:"Service records",   weight:4 },
  { id:"USCIS", type:"agency", label:"USCIS",   sub:"Naturalization",    weight:3 },
  { id:"DOD",   type:"agency", label:"DoD DMDC", sub:"Service data",     weight:3 },
  { id:"EOIR",  type:"agency", label:"EOIR",    sub:"Immigration courts",weight:3 },
  { id:"CBP",   type:"agency", label:"CBP",     sub:"Border enforcement",weight:3 },
  // Methods
  { id:"BISG",  type:"method", label:"BISG",    sub:"τ=0.40 → 2,309",   weight:5 },
  { id:"NERO",  type:"method", label:"NERO",    sub:"Erasure model",     weight:4 },
  { id:"SPSS",  type:"method", label:"SPSS",    sub:"R²=0.947",          weight:3 },
  { id:"SHA",   type:"method", label:"SHA-256", sub:"Evidence chain",    weight:4 },
  { id:"ML",    type:"method", label:"ML/MCMC", sub:"Deportation forecast",weight:3 },
  // Laws
  { id:"IIRIRA",  type:"law", label:"IIRIRA 1996", sub:"Retroactive removal",weight:5 },
  { id:"INA329",  type:"law", label:"INA §329",    sub:"Wartime nat.",   weight:3 },
  { id:"EO14012", type:"law", label:"EO-14012",    sub:"IMMVI 2021",     weight:3 },
  { id:"S874",    type:"law", label:"S.874",        sub:"Vet. Visa Act",  weight:3 },
  { id:"HR1537",  type:"law", label:"HR.1537",      sub:"Repatriate Act", weight:3 },
  // Shelters
  { id:"S01", type:"shelter", label:"Casa Migrante", sub:"Tijuana · 200+",  weight:4 },
  { id:"S03", type:"shelter", label:"El Refugio",    sub:"Juárez · 80+",    weight:3 },
  { id:"S04", type:"shelter", label:"Albergue Naz.", sub:"Nogales · 35+",   weight:3 },
  { id:"S06", type:"shelter", label:"Shelter TJ-2",  sub:"Tijuana outreach", weight:2 },
  // Documents
  { id:"D1",  type:"doc", label:"Invisible Valor", sub:"D1 · 99/100",   weight:5 },
  { id:"D8",  type:"doc", label:"DCAS Report",     sub:"D8 · 97/100",   weight:5 },
  { id:"D9",  type:"doc", label:"Marines DB",      sub:"D9 · 99/100",   weight:5 },
  { id:"D10", type:"doc", label:"Durazo (USF)",    sub:"D10 · 98/100",  weight:4 },
  { id:"D12", type:"doc", label:"GAO-19-416",      sub:"Deported vets", weight:4 },
  // People
  { id:"GUZMAN",  type:"person", label:"R. Guzmán",   sub:"1969 study",     weight:4 },
  { id:"DURAZO",  type:"person", label:"M. Durazo",   sub:"USF qualitative", weight:4 },
  { id:"ANSARI",  type:"person", label:"Rep. Ansari", sub:"CHC letter",      weight:3 },
  { id:"AMADOR",  type:"person", label:"B. Amador",   sub:"LULAC advocate",  weight:3 },
  // Streams
  { id:"ST1", type:"stream", label:"Stream 1", sub:"DCAS 349",      weight:3 },
  { id:"ST2", type:"stream", label:"Stream 2", sub:"BISG 2,309",    weight:4 },
  { id:"ST3", type:"stream", label:"Stream 3", sub:"NARA 3,070",    weight:3 },
  { id:"ST5", type:"stream", label:"Stream 5", sub:"Catholic proxy",weight:3 },
  { id:"ST7", type:"stream", label:"Stream 7", sub:"Durazo qual.",  weight:4 },
  // Databases
  { id:"DB_ENFORCE",type:"data", label:"ENFORCE DB",  sub:"ICE deportation DB", weight:4 },
  { id:"DB_BISG",   type:"data", label:"SSA Surname", sub:"Bayesian surname list",weight:4 },
  { id:"DB_BIRLS",  type:"data", label:"VA BIRLS DB", sub:"Veteran identification",weight:4 },
  // Events
  { id:"EV_CHC",   type:"event", label:"CHC Brief",   sub:"May 18, 2026", weight:5 },
  { id:"EV_IIRIRA",type:"event", label:"IIRIRA Pass", sub:"Sept 30, 1996",weight:4 },
  { id:"EV_PARK",  type:"event", label:"Park Deport", sub:"Nov/Dec 2025", weight:4 },
];

const EDGES = [
  // Cases ↔ Shelters
  {s:"C002",t:"S01",label:"Located at",w:3},{s:"C003",t:"S01",label:"Located at",w:3},
  {s:"C005",t:"S04",label:"Located at",w:2},
  // Cases ↔ Agencies
  {s:"C001",t:"NARA",label:"Service record",w:3},{s:"C001",t:"VA",label:"Pending BIRLS",w:3},
  {s:"C002",t:"ICE",label:"Removal order",w:4},{s:"C003",t:"ICE",label:"Removal order",w:4},
  {s:"C004",t:"ICE",label:"Self-deported 2025",w:5},{s:"C004",t:"USCIS",label:"Nat. denied",w:4},
  {s:"C005",t:"NARA",label:"FOIA pending",w:2},{s:"C006",t:"DOD",label:"Service pending",w:2},
  {s:"C004",t:"EV_PARK",label:"Subject",w:5},
  // DCAS chain
  {s:"DCAS",t:"BISG",label:"Applied to 58,220",w:5},{s:"DCAS",t:"SPSS",label:"R²=0.947",w:4},
  {s:"DCAS",t:"ST1",label:"Baseline source",w:4},{s:"DCAS",t:"NERO",label:"E — Erasure",w:4},
  {s:"DCAS",t:"DB_BISG",label:"Surname match",w:4},
  // BISG
  {s:"BISG",t:"D1",label:"Documented in",w:4},{s:"BISG",t:"D8",label:"Full audit",w:5},
  {s:"BISG",t:"GUZMAN",label:"Validates",w:3},{s:"BISG",t:"ST2",label:"Produces",w:5},
  {s:"BISG",t:"DB_BISG",label:"Uses",w:4},
  // Laws ↔ Cases
  {s:"IIRIRA",t:"C002",label:"Retroactive",w:4},{s:"IIRIRA",t:"C003",label:"Retroactive",w:4},
  {s:"IIRIRA",t:"C004",label:"Retroactive",w:5},{s:"IIRIRA",t:"C005",label:"Retroactive",w:3},
  {s:"IIRIRA",t:"EV_IIRIRA",label:"Passed",w:5},{s:"EO14012",t:"ICE",label:"IMMVI directive",w:3},
  {s:"S874",t:"ANSARI",label:"Supported by",w:3},{s:"HR1537",t:"ANSARI",label:"Supported by",w:3},
  // Documents ↔ Methods
  {s:"D1",t:"NERO",label:"Introduces",w:4},{s:"D10",t:"NERO",label:"Qualitative base",w:3},
  {s:"D8",t:"SHA",label:"Certified",w:4},{s:"D9",t:"SHA",label:"6 cases cert.",w:4},
  {s:"D12",t:"ICE",label:"Documents",w:3},{s:"D12",t:"EOIR",label:"Documents",w:3},
  // People
  {s:"GUZMAN",t:"ST1",label:"1969 stream",w:3},{s:"DURAZO",t:"ST7",label:"7th stream",w:4},
  {s:"DURAZO",t:"NERO",label:"Racial project",w:4},{s:"AMADOR",t:"S01",label:"Advocates",w:3},
  {s:"ANSARI",t:"EV_CHC",label:"Presenting",w:4},
  // NERO
  {s:"NERO",t:"ICE",label:"O — Obscurity",w:4},{s:"NERO",t:"VA",label:"R — Restriction",w:3},
  // SHA
  {s:"SHA",t:"C001",label:"Certified",w:4},{s:"SHA",t:"C002",label:"Certified",w:4},
  {s:"SHA",t:"C003",label:"Certified",w:3},{s:"SHA",t:"C004",label:"Certified",w:4},
  // Agency chains
  {s:"ICE",t:"DB_ENFORCE",label:"Maintains",w:4},{s:"ICE",t:"CBP",label:"Coordinates",w:3},
  {s:"ICE",t:"EOIR",label:"Refers cases",w:4},{s:"VA",t:"DB_BIRLS",label:"Maintains",w:4},
  {s:"DOD",t:"DCAS",label:"Owns",w:5},
  // Streams
  {s:"ST7",t:"D10",label:"Source",w:3},{s:"ST5",t:"D1",label:"Documented",w:3},
  {s:"ST2",t:"ST3",label:"Corroborates",w:3},{s:"ST3",t:"ST5",label:"Corroborates",w:3},
  // Events
  {s:"EV_CHC",t:"VA",label:"Inquiry target",w:4},{s:"EV_CHC",t:"ICE",label:"Inquiry target",w:4},
  {s:"ML",t:"EV_CHC",label:"Forecast for",w:3},
];

const W = 900, H = 560;

const initPositions = (nodes) => {
  const typeGroups = {};
  nodes.forEach(n => { if (!typeGroups[n.type]) typeGroups[n.type] = []; typeGroups[n.type].push(n); });
  const types = Object.keys(typeGroups);
  const result = [];
  types.forEach((type, ti) => {
    const gx = W/2 + Math.cos((ti/types.length)*Math.PI*2)*260;
    const gy = H/2 + Math.sin((ti/types.length)*Math.PI*2)*200;
    typeGroups[type].forEach((n, i) => {
      const a = (i/typeGroups[type].length)*Math.PI*2;
      const r = 50 + n.weight*5;
      result.push({ ...n, x:gx+Math.cos(a)*r, y:gy+Math.sin(a)*r, vx:0, vy:0 });
    });
  });
  return result;
};

const FILTER_TYPES = Object.keys(NODE_TYPES);

// BFS shortest path
const findPath = (fromId, toId, edges) => {
  if (!fromId || !toId || fromId === toId) return new Set();
  const visited = new Map([[fromId, null]]);
  const queue = [fromId];
  while (queue.length) {
    const cur = queue.shift();
    if (cur === toId) {
      const path = new Set();
      let node = toId;
      while (node) { path.add(node); node = visited.get(node); }
      return path;
    }
    edges.forEach(e => {
      const nb = e.s===cur ? e.t : e.t===cur ? e.s : null;
      if (nb && !visited.has(nb)) { visited.set(nb, cur); queue.push(nb); }
    });
  }
  return new Set();
};

export default function NetworkGraph() {
  const [positions, setPositions] = useState(() => initPositions(NODES));
  const [sel, setSel] = useState(null);
  const [filterTypes, setFilterTypes] = useState(new Set(FILTER_TYPES));
  const [dragging, setDragging] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const [highlight, setHighlight] = useState(null);
  const [search, setSearch] = useState("");
  const [pathFrom, setPathFrom] = useState(null);
  const [pathTo, setPathTo] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({x:0,y:0});
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const [clusterMode, setClusterMode] = useState(false);
  const svgRef = useRef();
  const animRef = useRef();

  const pathNodes = findPath(pathFrom, pathTo, EDGES);

  // Force simulation
  useEffect(() => {
    let pts = [...positions];
    const step = () => {
      pts = pts.map((n, i) => {
        if (dragging === n.id) return n;
        let fx=0, fy=0;
        pts.forEach((m, j) => {
          if (i===j) return;
          const dx=n.x-m.x, dy=n.y-m.y;
          const d=Math.max(1, Math.sqrt(dx*dx+dy*dy));
          const f=900/(d*d);
          fx+=f*dx/d; fy+=f*dy/d;
        });
        EDGES.forEach(e => {
          const other = e.s===n.id ? pts.find(p=>p.id===e.t) : e.t===n.id ? pts.find(p=>p.id===e.s) : null;
          if (other) {
            const dx=other.x-n.x, dy=other.y-n.y;
            const d=Math.max(1,Math.sqrt(dx*dx+dy*dy));
            const targetDist = clusterMode ? 80 : 130;
            const f=0.004*(d-targetDist);
            fx+=f*dx/d; fy+=f*dy/d;
          }
        });
        // Cluster gravity
        if (clusterMode) {
          const typeGroups = {};
          pts.forEach(p => { if (!typeGroups[p.type]) typeGroups[p.type] = []; typeGroups[p.type].push(p); });
          const types = Object.keys(typeGroups);
          const ti = types.indexOf(n.type);
          const cgx = W/2 + Math.cos((ti/types.length)*Math.PI*2)*240;
          const cgy = H/2 + Math.sin((ti/types.length)*Math.PI*2)*185;
          fx += (cgx - n.x)*0.015;
          fy += (cgy - n.y)*0.015;
        } else {
          fx += (W/2 - n.x)*0.003;
          fy += (H/2 - n.y)*0.003;
        }
        const vx=(n.vx+fx)*0.80, vy=(n.vy+fy)*0.80;
        return { ...n, x:Math.max(30,Math.min(W-30,n.x+vx)), y:Math.max(30,Math.min(H-30,n.y+vy)), vx, vy };
      });
      setPositions([...pts]);
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [dragging, clusterMode]);

  const toggleType = (t) => setFilterTypes(prev => {
    const n=new Set(prev); n.has(t)?n.delete(t):n.add(t); return n;
  });

  const searchLower = search.trim().toLowerCase();
  const visibleIds = new Set(positions.filter(n =>
    filterTypes.has(n.type) &&
    (!searchLower || n.label.toLowerCase().includes(searchLower) || n.sub?.toLowerCase().includes(searchLower) || n.id.toLowerCase().includes(searchLower))
  ).map(n=>n.id));
  const visibleEdges = EDGES.filter(e=>visibleIds.has(e.s)&&visibleIds.has(e.t));
  const neighborIds = highlight ? new Set([highlight, ...EDGES.filter(e=>e.s===highlight||e.t===highlight).flatMap(e=>[e.s,e.t])]) : null;
  const selNode = positions.find(n=>n.id===sel);
  const selEdges = sel ? EDGES.filter(e=>e.s===sel||e.t===sel) : [];

  // Drag node
  const onNodeMouseDown = (e, id) => {
    e.stopPropagation();
    setDragging(id);
    setSel(id);
    setHighlight(id);
  };

  // Pan background
  const onSvgMouseDown = (e) => {
    if (e.target === svgRef.current || e.target.tagName === "rect") {
      setPanning(true);
      setPanStart({x:e.clientX-pan.x, y:e.clientY-pan.y});
    }
  };

  const onMouseMove = useCallback((e) => {
    if (dragging) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = ((e.clientX - rect.left) / zoom - pan.x/zoom);
      const y = ((e.clientY - rect.top)  / zoom - pan.y/zoom);
      setPositions(prev => prev.map(n => n.id===dragging ? {...n,x,y,vx:0,vy:0} : n));
    } else if (panning && panStart) {
      setPan({x:e.clientX-panStart.x, y:e.clientY-panStart.y});
    }
  }, [dragging, panning, panStart, zoom, pan]);

  const onMouseUp = () => { setDragging(null); setPanning(false); };

  const onWheel = (e) => {
    e.preventDefault();
    setZoom(z => Math.max(0.3, Math.min(3, z - e.deltaY*0.001)));
  };

  const exportSVG = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], {type:"image/svg+xml"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `TE360_network_${Date.now()}.svg`; a.click();
  };

  // Type cluster hull (convex bounding box per type for cluster mode)
  const typeBoxes = clusterMode ? (() => {
    const boxes = {};
    positions.filter(n=>visibleIds.has(n.id)).forEach(n => {
      if (!boxes[n.type]) boxes[n.type]={minX:n.x,minY:n.y,maxX:n.x,maxY:n.y};
      const b=boxes[n.type];
      b.minX=Math.min(b.minX,n.x-20); b.minY=Math.min(b.minY,n.y-20);
      b.maxX=Math.max(b.maxX,n.x+20); b.maxY=Math.max(b.maxY,n.y+20);
    });
    return boxes;
  })() : {};

  return (
    <div>
      {/* Top toolbar */}
      <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap", alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search nodes..."
          style={{ padding:"5px 10px", background:"#080D18", border:`1px solid ${search?P.gold:P.b}`,
            borderRadius:20, color:P.t1, fontSize:8, fontFamily:"'IBM Plex Mono',monospace", outline:"none", width:140 }} />
        <select value={pathFrom||""} onChange={e=>setPathFrom(e.target.value||null)}
          style={{ padding:"4px 8px", background:"#080D18", border:`1px solid ${pathFrom?P.teal:P.b}`, borderRadius:20, color:P.t1, fontSize:7, outline:"none" }}>
          <option value="">Path from...</option>
          {NODES.map(n=><option key={n.id} value={n.id}>{n.label}</option>)}
        </select>
        <select value={pathTo||""} onChange={e=>setPathTo(e.target.value||null)}
          style={{ padding:"4px 8px", background:"#080D18", border:`1px solid ${pathTo?P.violet:P.b}`, borderRadius:20, color:P.t1, fontSize:7, outline:"none" }}>
          <option value="">Path to...</option>
          {NODES.map(n=><option key={n.id} value={n.id}>{n.label}</option>)}
        </select>
        {(pathFrom||pathTo)&&<button onClick={()=>{setPathFrom(null);setPathTo(null);}} style={{ padding:"4px 10px",fontSize:7,background:"transparent",border:`1px solid ${P.b}`,borderRadius:20,color:P.t4,cursor:"pointer" }}>✕ Clear Path</button>}
        {pathNodes.size>0&&<span style={{ fontSize:7,color:P.teal,padding:"4px 10px",background:`${P.teal}12`,border:`1px solid ${P.teal}30`,borderRadius:20 }}>Path: {pathNodes.size} nodes</span>}
        <button onClick={()=>setShowLabels(p=>!p)} style={{ padding:"4px 10px",fontSize:7,background:"transparent",border:`1px solid ${P.b}`,borderRadius:20,color:P.t4,cursor:"pointer" }}>{showLabels?"Hide":"Show"} Labels</button>
        <button onClick={()=>setClusterMode(p=>!p)} style={{ padding:"4px 10px",fontSize:7,background:clusterMode?`${P.violet}18`:"transparent",border:`1px solid ${clusterMode?P.violet:P.b}`,borderRadius:20,color:clusterMode?P.violet:P.t4,cursor:"pointer" }}>⬡ Cluster Mode</button>
        <button onClick={()=>{setSel(null);setHighlight(null);setSearch("");}} style={{ padding:"4px 10px",fontSize:7,background:"transparent",border:`1px solid ${P.b}`,borderRadius:20,color:P.t4,cursor:"pointer" }}>Clear</button>
        <button onClick={()=>setPositions(initPositions(NODES))} style={{ padding:"4px 10px",fontSize:7,background:"transparent",border:`1px solid ${P.b}`,borderRadius:20,color:P.t4,cursor:"pointer" }}>⟳ Reset</button>
        <button onClick={()=>{setZoom(1);setPan({x:0,y:0});}} style={{ padding:"4px 10px",fontSize:7,background:"transparent",border:`1px solid ${P.b}`,borderRadius:20,color:P.t4,cursor:"pointer" }}>Fit</button>
        <button onClick={exportSVG} style={{ padding:"4px 10px",fontSize:7,background:`${P.blue}12`,border:`1px solid ${P.blue}25`,borderRadius:20,color:P.blue,cursor:"pointer" }}>↓ SVG</button>
        <div style={{ marginLeft:"auto",fontSize:7,color:P.t4 }}>Scroll=Zoom · Drag bg=Pan · Drag node=Move</div>
      </div>

      {/* Type filters */}
      <div style={{ display:"flex", gap:5, marginBottom:8, flexWrap:"wrap" }}>
        <button onClick={()=>setFilterTypes(new Set(FILTER_TYPES))} style={{ padding:"3px 8px",fontSize:6,background:`${P.t4}10`,border:`1px solid ${P.b}`,borderRadius:20,color:P.t4,cursor:"pointer" }}>All</button>
        {FILTER_TYPES.map(t => {
          const tc=NODE_TYPES[t].color; const active=filterTypes.has(t);
          return (
            <button key={t} onClick={()=>toggleType(t)}
              style={{ padding:"3px 9px",fontSize:7,background:active?`${tc}15`:"transparent",
                border:`1px solid ${active?tc:P.b}`,borderRadius:20,color:active?tc:P.t4,cursor:"pointer" }}>
              {NODE_TYPES[t].icon} {NODE_TYPES[t].label} <span style={{ opacity:0.6 }}>({NODES.filter(n=>n.type===t).length})</span>
            </button>
          );
        })}
        <span style={{ marginLeft:"auto",fontSize:7,color:P.t4,padding:"3px 0" }}>
          {visibleIds.size} nodes · {visibleEdges.length} edges
        </span>
      </div>

      <div style={{ display:"flex", gap:10 }}>
        {/* Graph canvas */}
        <div style={{ flex:1, background:"#020609", border:`1px solid ${P.b}`, borderRadius:10, overflow:"hidden", position:"relative" }}>
          {/* Zoom controls */}
          <div style={{ position:"absolute",top:8,right:8,zIndex:10,display:"flex",flexDirection:"column",gap:3 }}>
            {[["＋",0.2],["−",-0.2]].map(([l,d])=>(
              <button key={l} onClick={()=>setZoom(z=>Math.max(0.3,Math.min(3,z+d)))}
                style={{ width:22,height:22,background:"#080D18",border:`1px solid ${P.b}`,borderRadius:4,
                  color:P.t2,fontSize:14,cursor:"pointer",lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center" }}>{l}</button>
            ))}
            <div style={{ fontSize:7,color:P.t4,textAlign:"center" }}>{Math.round(zoom*100)}%</div>
          </div>

          <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
            onMouseDown={onSvgMouseDown}
            onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
            onWheel={onWheel}
            style={{ display:"block", cursor:dragging?"grabbing":panning?"grabbing":"default", userSelect:"none" }}>
            <rect width={W} height={H} fill="#020609"/>

            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
              {/* Cluster backgrounds */}
              {clusterMode && Object.entries(typeBoxes).map(([type,b])=>{
                const c=NODE_TYPES[type]?.color||P.t4;
                const pad=18;
                return (
                  <g key={type}>
                    <rect x={b.minX-pad} y={b.minY-pad} width={b.maxX-b.minX+pad*2} height={b.maxY-b.minY+pad*2}
                      rx={14} fill={c} fillOpacity={0.05} stroke={c} strokeOpacity={0.15} strokeWidth={1} />
                    <text x={(b.minX+b.maxX)/2} y={b.minY-pad+10} textAnchor="middle"
                      fontSize={8} fill={c} fillOpacity={0.5} fontFamily="IBM Plex Mono" fontWeight="bold">
                      {NODE_TYPES[type]?.label?.toUpperCase()}
                    </text>
                  </g>
                );
              })}

              {/* Edges */}
              {visibleEdges.map((e,i) => {
                const sn=positions.find(p=>p.id===e.s), tn=positions.find(p=>p.id===e.t);
                if(!sn||!tn) return null;
                const isHl = neighborIds ? neighborIds.has(e.s)&&neighborIds.has(e.t) : true;
                const isSel = sel&&(e.s===sel||e.t===sel);
                const isPath = pathNodes.size>0 && pathNodes.has(e.s)&&pathNodes.has(e.t);
                const isHovered = hoveredEdge===i;
                const color = isPath?P.teal:isSel?P.gold:P.b;
                const opacity = neighborIds?(isHl?0.7:0.05):0.28;
                const sw = isPath?2:isSel?1.8:isHovered?1.5:(e.w||1)*0.3+0.3;
                const mx=(sn.x+tn.x)/2, my=(sn.y+tn.y)/2;
                return (
                  <g key={i}>
                    <line x1={sn.x} y1={sn.y} x2={tn.x} y2={tn.y}
                      stroke={color} strokeWidth={sw} opacity={opacity} />
                    {/* Hover target */}
                    <line x1={sn.x} y1={sn.y} x2={tn.x} y2={tn.y}
                      stroke="transparent" strokeWidth={8} style={{ cursor:"pointer" }}
                      onMouseEnter={()=>setHoveredEdge(i)} onMouseLeave={()=>setHoveredEdge(null)} />
                    {/* Edge label on hover or selected */}
                    {(isHovered||isSel||isPath) && (
                      <g>
                        <rect x={mx-e.label.length*2.8} y={my-7} width={e.label.length*5.6} height={11} rx={3} fill="#030508" opacity={0.85} />
                        <text x={mx} y={my+1} fill={color} fontSize={6} textAnchor="middle" fontFamily="IBM Plex Mono" opacity={0.95}>{e.label}</text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {positions.filter(n=>visibleIds.has(n.id)).map(n => {
                const tc=NODE_TYPES[n.type]?.color||P.t4;
                const isSel=sel===n.id;
                const isNeighbor=neighborIds?neighborIds.has(n.id):true;
                const isPath=pathNodes.size>0&&pathNodes.has(n.id);
                const isSearchHit=searchLower&&(n.label.toLowerCase().includes(searchLower)||n.id.toLowerCase().includes(searchLower));
                const r=6+n.weight*2;
                const dim=neighborIds&&!isNeighbor;
                return (
                  <g key={n.id} onMouseDown={e=>onNodeMouseDown(e,n.id)}
                    onMouseEnter={()=>setHighlight(n.id)} onMouseLeave={()=>{ if(!sel) setHighlight(null); }}
                    style={{ cursor:"grab" }}>
                    {(isSel||isPath||isSearchHit) && <circle cx={n.x} cy={n.y} r={r+7} fill={isPath?P.teal:isSearchHit?P.gold:tc} opacity={0.12}/>}
                    <circle cx={n.x} cy={n.y} r={r}
                      fill={`${tc}${isSel?"cc":"50"}`}
                      stroke={isPath?P.teal:isSearchHit?P.gold:tc}
                      strokeWidth={isSel?2.5:isPath||isSearchHit?2:1}
                      opacity={dim?0.12:0.9}/>
                    {showLabels && (
                      <text x={n.x} y={n.y+r+9} fill={isSel?tc:isPath?P.teal:P.t3} fontSize={isSel?7.5:6.5}
                        textAnchor="middle" fontWeight={isSel||isPath?"bold":"normal"}
                        fontFamily="IBM Plex Mono" opacity={dim?0.15:0.9}>
                        {n.label}
                      </text>
                    )}
                    {isSel && (
                      <text x={n.x} y={n.y+0.4} textAnchor="middle" dominantBaseline="middle"
                        fontSize={r*0.65} fill="#fff" fontFamily="IBM Plex Mono" opacity={0.9}>
                        {NODE_TYPES[n.type]?.icon}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Detail sidebar */}
        <div style={{ width:220, flexShrink:0, display:"flex", flexDirection:"column", gap:8, overflowY:"auto" }}>
          {selNode ? (
            <div style={{ background:P.card, border:`1px solid ${NODE_TYPES[selNode.type]?.color}50`, borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontSize:18, marginBottom:2 }}>{NODE_TYPES[selNode.type]?.icon}</div>
              <div style={{ fontSize:7, color:NODE_TYPES[selNode.type]?.color, fontWeight:700, letterSpacing:2, marginBottom:2 }}>
                {NODE_TYPES[selNode.type]?.label?.toUpperCase()} · {selNode.id}
              </div>
              <div style={{ fontSize:13, fontWeight:800, color:NODE_TYPES[selNode.type]?.color, marginBottom:2 }}>{selNode.label}</div>
              <div style={{ fontSize:8, color:P.t3, marginBottom:8 }}>{selNode.sub}</div>
              <div style={{ fontSize:7, color:P.t4, marginBottom:6, letterSpacing:2 }}>CONNECTIONS ({selEdges.length})</div>
              <div style={{ maxHeight:260, overflowY:"auto" }}>
                {selEdges.map((e,i) => {
                  const other=e.s===sel?e.t:e.s;
                  const dir=e.s===sel?"→":"←";
                  const oNode=positions.find(n=>n.id===other);
                  if(!oNode) return null;
                  const tc=NODE_TYPES[oNode.type]?.color||P.t4;
                  return (
                    <div key={i} onClick={()=>{setSel(other);setHighlight(other);}}
                      style={{ display:"flex", gap:6, alignItems:"center", padding:"4px 0",
                        borderBottom:`1px solid ${P.b}20`, cursor:"pointer" }}>
                      <span style={{ fontSize:8, color:tc, fontWeight:700 }}>{dir}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:8, color:tc, fontWeight:700 }}>{oNode.label}</div>
                        <div style={{ fontSize:6, color:P.t4 }}>{e.label}</div>
                      </div>
                      <span style={{ fontSize:8 }}>{NODE_TYPES[oNode.type]?.icon}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontSize:8, color:P.t4, marginBottom:8 }}>Click a node to inspect. Drag to reposition. Scroll to zoom.</div>
              <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:6 }}>NETWORK STATS</div>
              {[
                ["Total Nodes", NODES.length, P.blue],
                ["Total Edges", EDGES.length, P.violet],
                ["Visible Nodes", visibleIds.size, P.teal],
                ["Visible Edges", visibleEdges.length, P.gold],
                ["Max Hub (DCAS)", EDGES.filter(e=>e.s==="DCAS"||e.t==="DCAS").length+" conns", P.red],
                ["Max Hub (BISG)", EDGES.filter(e=>e.s==="BISG"||e.t==="BISG").length+" conns", P.violet],
                ["Max Hub (ICE)",  EDGES.filter(e=>e.s==="ICE"||e.t==="ICE").length+" conns",  P.amber],
              ].map(([k,v,c])=>(
                <div key={k} style={{ display:"flex",justifyContent:"space-between",fontSize:8,padding:"3px 0",borderBottom:`1px solid ${P.b}20` }}>
                  <span style={{ color:P.t4 }}>{k}</span>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace",color:c,fontWeight:700 }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Legend */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"10px 12px" }}>
            <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:6 }}>LEGEND</div>
            {Object.entries(NODE_TYPES).filter(([t])=>filterTypes.has(t)).map(([t,info])=>(
              <div key={t} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4 }}>
                <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <div style={{ width:10,height:10,borderRadius:"50%",background:info.color,opacity:0.7 }}/>
                  <span style={{ fontSize:7,color:info.color }}>{info.icon} {info.label}</span>
                </div>
                <span style={{ fontSize:6,color:P.t4 }}>{NODES.filter(n=>n.type===t).length}</span>
              </div>
            ))}
            <div style={{ marginTop:6,fontSize:7,color:P.t4 }}>Node size = evidence weight · Hover edge = label</div>
          </div>

          {/* Path info */}
          {pathNodes.size>0 && (
            <div style={{ background:P.card, border:`1px solid ${P.teal}30`, borderRadius:10, padding:"10px 12px" }}>
              <div style={{ fontSize:7,color:P.teal,letterSpacing:2,marginBottom:6 }}>SHORTEST PATH</div>
              {[...pathNodes].map(id=>{
                const n=positions.find(p=>p.id===id);
                if(!n) return null;
                const tc=NODE_TYPES[n.type]?.color||P.t4;
                return (
                  <div key={id} style={{ fontSize:8,color:tc,padding:"2px 0",borderBottom:`1px solid ${P.b}20` }}>
                    {NODE_TYPES[n.type]?.icon} {n.label}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}