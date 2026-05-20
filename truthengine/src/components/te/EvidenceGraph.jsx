import { useState, useEffect, useRef } from "react";
import { P, CASES } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

// Evidence nodes — each is a verified document/data point
const EVIDENCE_NODES = [
  // Primary sources
  { id:"E001", type:"document", label:"DCAS Extract",      sub:"58,220 records · DoD",      weight:5, x:400, y:160, color:P.red },
  { id:"E002", type:"document", label:"BISG Analysis",     sub:"τ=0.40 · 2,309 estimated", weight:5, x:300, y:260, color:P.violet },
  { id:"E003", type:"document", label:"NARA OMPF C001",    sub:"George Ramos · SHA cert",   weight:4, x:520, y:260, color:P.gold },
  { id:"E004", type:"document", label:"VA BIRLS (FOIA)",   sub:"F001 · 83d overdue",        weight:3, x:650, y:180, color:P.amber },
  { id:"E005", type:"document", label:"ICE ENFORCE (FOIA)",sub:"F002 · 66d overdue",        weight:3, x:700, y:320, color:P.amber },
  { id:"E006", type:"legal",    label:"IIRIRA 1996",       sub:"§237(a)(2)(A)(iii)",        weight:5, x:180, y:340, color:P.red },
  { id:"E007", type:"legal",    label:"INA §329",          sub:"Wartime naturalization",     weight:3, x:100, y:220, color:P.violet },
  { id:"E008", type:"legal",    label:"EO-14012",          sub:"IMMVI 2021",                 weight:3, x:100, y:420, color:P.teal },
  { id:"E009", type:"academic", label:"Invisible Valor",   sub:"D1 · Relevance 99",         weight:5, x:300, y:400, color:P.blue },
  { id:"E010", type:"academic", label:"Durazo USF",        sub:"Qualitative stream 7",       weight:4, x:430, y:460, color:P.blue },
  { id:"E011", type:"academic", label:"Guzmán 1969",       sub:"Chicano draft records",      weight:4, x:180, y:160, color:P.blue },
  { id:"E012", type:"academic", label:"GAO-19-416",        sub:"Deported veterans",          weight:4, x:590, y:420, color:P.teal },
  { id:"E013", type:"data",     label:"COLEF EMIF Norte",  sub:"Deportee microdata",         weight:4, x:550, y:350, color:P.gold },
  { id:"E014", type:"data",     label:"ICE ERO Statistics",sub:"Annual removal data",        weight:3, x:680, y:420, color:P.red },
  { id:"E015", type:"data",     label:"SUDIMER 33-DB",     sub:"UNAM · 2000–2024",           weight:4, x:420, y:340, color:P.gold },
  // Cases
  { id:"C001", type:"case",     label:"Ramos",             sub:"Vietnam MOH · Gold",         weight:5, x:240, y:520, color:P.gold },
  { id:"C002", type:"case",     label:"M. Valenzuela",     sub:"USMC · TJ Shelter",          weight:4, x:360, y:540, color:P.gold },
  { id:"C003", type:"case",     label:"V. Valenzuela",     sub:"USMC · TJ Shelter",          weight:4, x:480, y:540, color:P.gold },
  { id:"C004", type:"case",     label:"Sae Joon Park",     sub:"⚡ URGENT 2025",             weight:5, x:590, y:540, color:P.red },
  { id:"C005", type:"case",     label:"Segura",            sub:"Nogales · Silver",           weight:3, x:700, y:520, color:"#B8CCE8" },
  { id:"C006", type:"case",     label:"Duran",             sub:"Colombia · Bronze",          weight:3, x:800, y:500, color:P.amber },
  // Agencies
  { id:"A001", type:"agency",   label:"ICE/ERO",           sub:"Enforcement arm",            weight:4, x:800, y:280, color:P.red },
  { id:"A002", type:"agency",   label:"VA",                sub:"Benefits + BIRLS",           weight:4, x:800, y:160, color:P.blue },
  { id:"A003", type:"agency",   label:"DoD DCAS",          sub:"Casualty records",           weight:5, x:400, y:80,  color:P.amber },
  { id:"A004", type:"agency",   label:"USCIS",             sub:"Naturalization",             weight:3, x:650, y:80,  color:P.violet },
];

const EVIDENCE_EDGES = [
  {s:"E001",t:"E002",label:"BISG applied to",w:5},{s:"E001",t:"A003",label:"Owned by",w:4},
  {s:"E002",t:"E009",label:"Documented in",w:4},{s:"E002",t:"E011",label:"Validates",w:3},
  {s:"E003",t:"C001",label:"Service record for",w:5},{s:"E004",t:"A002",label:"Requested from",w:3},
  {s:"E005",t:"A001",label:"Requested from",w:3},{s:"E006",t:"C002",label:"Applied retroactively",w:5},
  {s:"E006",t:"C003",label:"Applied retroactively",w:5},{s:"E006",t:"C004",label:"Applied retroactively",w:5},
  {s:"E007",t:"C004",label:"Denied to",w:4},{s:"E008",t:"A001",label:"Directs",w:3},
  {s:"E009",t:"E002",label:"Uses",w:4},{s:"E010",t:"C001",label:"Documents",w:4},
  {s:"E012",t:"A001",label:"Documents gaps",w:4},{s:"E012",t:"A002",label:"Documents gaps",w:4},
  {s:"E013",t:"E002",label:"Corroborates",w:4},{s:"E014",t:"A001",label:"Published by",w:3},
  {s:"E015",t:"E002",label:"Cross-references",w:4},{s:"E015",t:"E013",label:"Complements",w:3},
  {s:"A003",t:"E001",label:"Maintains",w:5},{s:"A002",t:"E004",label:"Holds",w:3},
  {s:"A001",t:"E005",label:"Holds",w:3},{s:"A004",t:"C004",label:"Denied naturalization",w:5},
  {s:"C001",t:"E006",label:"Affected by",w:4},{s:"C002",t:"E006",label:"Affected by",w:4},
];

const TYPE_INFO = {
  document: { color:P.gold,   icon:"📄", label:"Document" },
  legal:    { color:P.red,    icon:"⚖️", label:"Legal" },
  academic: { color:P.blue,   icon:"🎓", label:"Academic" },
  data:     { color:P.violet, icon:"💾", label:"Dataset" },
  case:     { color:P.gold,   icon:"🎖️", label:"Case" },
  agency:   { color:P.amber,  icon:"🏛️", label:"Agency" },
};

const W = 900, H = 580;

export default function EvidenceGraph() {
  const [positions, setPositions] = useState(() => EVIDENCE_NODES.map(n => ({...n, vx:0, vy:0})));
  const [sel, setSel] = useState(null);
  const [highlight, setHighlight] = useState(null);
  const [filterTypes, setFilterTypes] = useState(new Set(Object.keys(TYPE_INFO)));
  const [dragging, setDragging] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({x:0,y:0});
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const animRef = useRef();
  const svgRef = useRef();

  useEffect(() => {
    let pts = [...positions];
    const step = () => {
      pts = pts.map((n, i) => {
        if (dragging === n.id) return n;
        let fx = 0, fy = 0;
        pts.forEach((m, j) => {
          if (i === j) return;
          const dx = n.x - m.x, dy = n.y - m.y;
          const d = Math.max(1, Math.sqrt(dx*dx+dy*dy));
          const f = 700/(d*d);
          fx += f*dx/d; fy += f*dy/d;
        });
        EVIDENCE_EDGES.forEach(e => {
          const other = e.s===n.id ? pts.find(p=>p.id===e.t) : e.t===n.id ? pts.find(p=>p.id===e.s) : null;
          if (other) {
            const dx=other.x-n.x, dy=other.y-n.y;
            const d=Math.max(1,Math.sqrt(dx*dx+dy*dy));
            const f=0.003*(d-120);
            fx+=f*dx/d; fy+=f*dy/d;
          }
        });
        fx += (W/2-n.x)*0.002; fy += (H/2-n.y)*0.002;
        const vx=(n.vx+fx)*0.82, vy=(n.vy+fy)*0.82;
        return {...n, x:Math.max(30,Math.min(W-30,n.x+vx)), y:Math.max(30,Math.min(H-30,n.y+vy)), vx, vy};
      });
      setPositions([...pts]);
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [dragging]);

  const visibleIds = new Set(positions.filter(n => filterTypes.has(n.type)).map(n => n.id));
  const visibleEdges = EVIDENCE_EDGES.filter(e => visibleIds.has(e.s) && visibleIds.has(e.t));
  const neighborIds = highlight ? new Set([highlight, ...EVIDENCE_EDGES.filter(e=>e.s===highlight||e.t===highlight).flatMap(e=>[e.s,e.t])]) : null;
  const selNode = positions.find(n => n.id === sel);
  const selEdges = sel ? EVIDENCE_EDGES.filter(e => e.s===sel || e.t===sel) : [];

  const onNodeMouseDown = (e, id) => { e.stopPropagation(); setDragging(id); setSel(id); setHighlight(id); };
  const onSvgMouseDown = (e) => {
    if (e.target === svgRef.current || e.target.tagName === "rect") {
      setPanning(true); setPanStart({x:e.clientX-pan.x,y:e.clientY-pan.y});
    }
  };
  const onMouseMove = (e) => {
    if (dragging) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x=(e.clientX-rect.left)/zoom-pan.x/zoom;
      const y=(e.clientY-rect.top)/zoom-pan.y/zoom;
      setPositions(prev => prev.map(n => n.id===dragging ? {...n,x,y,vx:0,vy:0} : n));
    } else if (panning && panStart) {
      setPan({x:e.clientX-panStart.x,y:e.clientY-panStart.y});
    }
  };
  const onMouseUp = () => { setDragging(null); setPanning(false); };
  const onWheel = (e) => { e.preventDefault(); setZoom(z=>Math.max(0.3,Math.min(3,z-e.deltaY*0.001))); };

  const generateSummary = async () => {
    if (!selNode) return;
    setGenerating(true);
    const connectedEdges = EVIDENCE_EDGES.filter(e=>e.s===selNode.id||e.t===selNode.id);
    const connectedNodes = connectedEdges.map(e=>{
      const otherId = e.s===selNode.id?e.t:e.s;
      return EVIDENCE_NODES.find(n=>n.id===otherId)?.label || otherId;
    });
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a forensic evidence analyst for the AUMER Foundation. Analyze this evidence node in the context of the Hispanic veteran deportation case:\n\nNode: ${selNode.label} (${selNode.sub})\nType: ${selNode.type}\nConnections: ${connectedNodes.join(", ")}\nEdge labels: ${connectedEdges.map(e=>e.label).join(", ")}\n\nProvide a 3-paragraph forensic analysis: 1) What this evidence proves, 2) How it connects to the other evidence nodes, 3) Its evidentiary strength for congressional briefing. Be specific and cite statutory references where applicable.`,
    });
    setAiSummary(res);
    setGenerating(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P.t1 }}>🔬 Evidence <span style={{ color: P.blue }}>Graph</span></div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>INTERACTIVE EVIDENCE NETWORK · 21 NODES · FORENSIC CHAIN OF CUSTODY</div>
      </div>

      {/* Toolbar */}
      <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap", alignItems:"center" }}>
        {Object.entries(TYPE_INFO).map(([k,v]) => {
          const active = filterTypes.has(k);
          return (
            <button key={k} onClick={() => setFilterTypes(prev => { const n=new Set(prev); n.has(k)?n.delete(k):n.add(k); return n; })}
              style={{ padding:"3px 10px", fontSize:7, cursor:"pointer",
                background:active?`${v.color}15`:"transparent",
                border:`1px solid ${active?v.color:P.b}`, borderRadius:20,
                color:active?v.color:P.t4 }}>
              {v.icon} {v.label} ({EVIDENCE_NODES.filter(n=>n.type===k).length})
            </button>
          );
        })}
        <button onClick={()=>setShowLabels(p=>!p)} style={{ padding:"3px 10px",fontSize:7,cursor:"pointer",background:"transparent",border:`1px solid ${P.b}`,borderRadius:20,color:P.t4 }}>{showLabels?"Hide":"Show"} Labels</button>
        <button onClick={()=>{setSel(null);setHighlight(null);setAiSummary("");}} style={{ padding:"3px 10px",fontSize:7,cursor:"pointer",background:"transparent",border:`1px solid ${P.b}`,borderRadius:20,color:P.t4 }}>Clear</button>
        <button onClick={()=>{setZoom(0.85);setPan({x:0,y:0});}} style={{ padding:"3px 10px",fontSize:7,cursor:"pointer",background:"transparent",border:`1px solid ${P.b}`,borderRadius:20,color:P.t4 }}>Fit</button>
        <div style={{ marginLeft:"auto",display:"flex",gap:4 }}>
          {[["＋",0.15],["−",-0.15]].map(([l,d])=>(
            <button key={l} onClick={()=>setZoom(z=>Math.max(0.3,Math.min(3,z+d)))}
              style={{ width:24,height:24,background:"#080D18",border:`1px solid ${P.b}`,borderRadius:4,color:P.t2,fontSize:14,cursor:"pointer" }}>{l}</button>
          ))}
          <span style={{ fontSize:7,color:P.t4,padding:"0 4px",alignSelf:"center" }}>{Math.round(zoom*100)}%</span>
        </div>
      </div>

      <div style={{ display:"flex", gap:10 }}>
        {/* Graph */}
        <div style={{ flex:1, background:"#020609", border:`1px solid ${P.b}`, borderRadius:10, overflow:"hidden" }}>
          <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
            onMouseDown={onSvgMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
            onWheel={onWheel} style={{ display:"block", cursor:dragging?"grabbing":panning?"grabbing":"default", userSelect:"none" }}>
            <rect width={W} height={H} fill="#020609"/>
            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
              {/* Edges */}
              {visibleEdges.map((e,i)=>{
                const sn=positions.find(p=>p.id===e.s),tn=positions.find(p=>p.id===e.t);
                if(!sn||!tn) return null;
                const isHl=neighborIds?neighborIds.has(e.s)&&neighborIds.has(e.t):true;
                const isSel=sel&&(e.s===sel||e.t===sel);
                return (
                  <g key={i}>
                    <line x1={sn.x} y1={sn.y} x2={tn.x} y2={tn.y}
                      stroke={isSel?P.gold:P.b} strokeWidth={isSel?2:0.8} opacity={neighborIds?isHl?0.7:0.05:0.3}/>
                    {isSel && (
                      <text x={(sn.x+tn.x)/2} y={(sn.y+tn.y)/2} fill={P.gold} fontSize={6}
                        textAnchor="middle" fontFamily="IBM Plex Mono" opacity={0.8}>{e.label}</text>
                    )}
                  </g>
                );
              })}
              {/* Nodes */}
              {positions.filter(n=>visibleIds.has(n.id)).map(n=>{
                const isSel=sel===n.id;
                const isNeighbor=neighborIds?neighborIds.has(n.id):true;
                const dim=neighborIds&&!isNeighbor;
                const r=6+n.weight*2.5;
                const ti=TYPE_INFO[n.type];
                return (
                  <g key={n.id} onMouseDown={e=>onNodeMouseDown(e,n.id)}
                    onMouseEnter={()=>setHighlight(n.id)} onMouseLeave={()=>{if(!sel)setHighlight(null)}}
                    style={{ cursor:"grab" }}>
                    {isSel && <circle cx={n.x} cy={n.y} r={r+8} fill={n.color} opacity={0.1}/>}
                    <circle cx={n.x} cy={n.y} r={r}
                      fill={`${n.color}${isSel?"cc":"50"}`}
                      stroke={n.color} strokeWidth={isSel?2.5:1} opacity={dim?0.12:0.9}/>
                    {showLabels && (
                      <text x={n.x} y={n.y+r+9} fill={isSel?n.color:P.t3} fontSize={isSel?7.5:6}
                        textAnchor="middle" fontWeight={isSel?"bold":"normal"} fontFamily="IBM Plex Mono" opacity={dim?0.1:0.9}>
                        {n.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Sidebar */}
        <div style={{ width:210, flexShrink:0, display:"flex", flexDirection:"column", gap:8 }}>
          {selNode ? (
            <div style={{ background:P.card, border:`1px solid ${selNode.color}40`, borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontSize:7, color:selNode.color, fontWeight:700, letterSpacing:2, marginBottom:2 }}>
                {TYPE_INFO[selNode.type]?.icon} {TYPE_INFO[selNode.type]?.label?.toUpperCase()} · {selNode.id}
              </div>
              <div style={{ fontSize:12, fontWeight:800, color:selNode.color, marginBottom:2 }}>{selNode.label}</div>
              <div style={{ fontSize:8, color:P.t3, marginBottom:8 }}>{selNode.sub}</div>
              <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:5 }}>CONNECTIONS ({selEdges.length})</div>
              <div style={{ maxHeight:200, overflowY:"auto", marginBottom:8 }}>
                {selEdges.map((e,i)=>{
                  const otherId=e.s===sel?e.t:e.s;
                  const dir=e.s===sel?"→":"←";
                  const on=positions.find(n=>n.id===otherId);
                  if(!on) return null;
                  return (
                    <div key={i} onClick={()=>{setSel(otherId);setHighlight(otherId);}}
                      style={{ display:"flex",gap:5,alignItems:"center",padding:"3px 0",
                        borderBottom:`1px solid ${P.b}20`,cursor:"pointer" }}>
                      <span style={{ fontSize:8,color:on.color,fontWeight:700 }}>{dir}</span>
                      <div>
                        <div style={{ fontSize:7,color:on.color,fontWeight:700 }}>{on.label}</div>
                        <div style={{ fontSize:6,color:P.t4 }}>{e.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={generateSummary} disabled={generating}
                style={{ width:"100%",padding:"6px",fontSize:7,fontWeight:800,cursor:"pointer",
                  background:generating?P.b:`${P.violet}15`,border:`1px solid ${generating?P.b:P.violet}25`,
                  color:generating?P.t4:P.violet,borderRadius:7 }}>
                {generating?"⟳ Analyzing...":"🤖 AI Forensic Analysis"}
              </button>
            </div>
          ) : (
            <div style={{ background:P.card,border:`1px solid ${P.b}`,borderRadius:10,padding:"12px 14px" }}>
              <div style={{ fontSize:7,color:P.t4,letterSpacing:2,marginBottom:6 }}>GRAPH STATS</div>
              {[
                ["Nodes",EVIDENCE_NODES.length,P.blue],
                ["Edges",EVIDENCE_EDGES.length,P.violet],
                ["Cases",EVIDENCE_NODES.filter(n=>n.type==="case").length,P.gold],
                ["Agencies",EVIDENCE_NODES.filter(n=>n.type==="agency").length,P.red],
                ["Documents",EVIDENCE_NODES.filter(n=>n.type==="document").length,P.amber],
              ].map(([k,v,c])=>(
                <div key={k} style={{ display:"flex",justifyContent:"space-between",fontSize:8,padding:"3px 0",borderBottom:`1px solid ${P.b}20` }}>
                  <span style={{ color:P.t4 }}>{k}</span>
                  <span style={{ color:c,fontWeight:700 }}>{v}</span>
                </div>
              ))}
              <div style={{ fontSize:7,color:P.t4,marginTop:8 }}>Click a node to inspect · Drag to reposition · Scroll to zoom</div>
            </div>
          )}

          {aiSummary && (
            <div style={{ background:P.card,border:`1px solid ${P.violet}25`,borderRadius:10,padding:"12px 14px",overflowY:"auto",maxHeight:300 }}>
              <div style={{ fontSize:7,color:P.violet,letterSpacing:2,fontWeight:700,marginBottom:6 }}>🤖 FORENSIC ANALYSIS</div>
              <div style={{ fontSize:7,color:P.t2,lineHeight:1.8,whiteSpace:"pre-wrap" }}>{aiSummary}</div>
            </div>
          )}

          {/* Legend */}
          <div style={{ background:P.card,border:`1px solid ${P.b}`,borderRadius:10,padding:"10px 12px" }}>
            <div style={{ fontSize:7,color:P.t4,letterSpacing:2,marginBottom:6 }}>LEGEND</div>
            {Object.entries(TYPE_INFO).map(([k,v])=>(
              <div key={k} style={{ display:"flex",alignItems:"center",gap:6,marginBottom:4 }}>
                <div style={{ width:10,height:10,borderRadius:"50%",background:v.color,opacity:0.7 }}/>
                <span style={{ fontSize:7,color:v.color }}>{v.icon} {v.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}