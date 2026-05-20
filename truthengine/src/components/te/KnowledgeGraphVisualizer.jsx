import { useState, useEffect, useRef, useCallback } from "react";
import { P } from "../../lib/teData";

// ── Seed graph data representing known entities and relationships ──────────
const SEED_NODES = [
  // People
  { id:"EPP-001", label:"Roy Benavidez", type:"person",  subtype:"veteran",   detail:"MOH · Army SF · Deported Est." },
  { id:"EPP-002", label:"Alfred Rascon",  type:"person",  subtype:"veteran",   detail:"MOH · Army · Naturalized" },
  { id:"EPP-003", label:"Nicolas Duran",  type:"person",  subtype:"veteran",   detail:"Army · Deported 2018" },
  { id:"EPP-004", label:"C. Segura",      type:"person",  subtype:"veteran",   detail:"Army · ICE Custody" },
  { id:"EPP-005", label:"Hyun Park",      type:"person",  subtype:"veteran",   detail:"Purple Heart · Self-deported Nov 2025" },
  { id:"EPP-006", label:"M. Castaño",     type:"person",  subtype:"veteran",   detail:"Army · Border Case" },
  { id:"P-007",   label:"~500 MX KIA",   type:"person",  subtype:"collective",detail:"Forensic estimate · Vietnam KIA" },

  // Military units
  { id:"UNIT-001", label:"U.S. Army SF",   type:"unit", subtype:"military", detail:"Special Forces — Vietnam era" },
  { id:"UNIT-002", label:"1st Cavalry Div",type:"unit", subtype:"military", detail:"Vietnam — Ia Drang Valley" },
  { id:"UNIT-003", label:"Vietnam Theater", type:"unit", subtype:"military", detail:"1961–1978 · 58,220 KIA total" },
  { id:"UNIT-004", label:"Selective Service",type:"unit",subtype:"agency",  detail:"RG 147 · Draft records · 500–800 MX-born" },

  // Agencies
  { id:"AG-001", label:"ICE ERO",      type:"agency", subtype:"enforcement", detail:"713,464 removal records · 0 veteran flags" },
  { id:"AG-002", label:"VA BIRLS",     type:"agency", subtype:"benefits",    detail:"DIC payments · FOIA F001 overdue" },
  { id:"AG-003", label:"DCAS",         type:"agency", subtype:"records",     detail:"58,220 KIA · 84.9% misclassification" },
  { id:"AG-004", label:"USCIS",        type:"agency", subtype:"immigration", detail:"N-644 posthumous · 200–400 MX cases" },
  { id:"AG-005", label:"NARA",         type:"agency", subtype:"archive",     detail:"RG 147 · OMPF · 62-yr rule" },
  { id:"AG-006", label:"SRE México",   type:"agency", subtype:"consular",    detail:"Actas de defunción · INAI request" },

  // Events / locations
  { id:"EV-001", label:"Vietnam War",    type:"event", subtype:"conflict",   detail:"1961–1975 · 346–741 MX nationals KIA est." },
  { id:"EV-002", label:"DCAS Erasure",   type:"event", subtype:"policy",     detail:"E=97 NERO · 84.9% failure rate" },
  { id:"EV-003", label:"ICE Surge 2025", type:"event", subtype:"enforcement",detail:"105,573 MX deported · +499% vs FY22" },
  { id:"EV-004", label:"GAO-19-416",     type:"event", subtype:"legal",      detail:"2019 · ICE no veteran tracking · 92 confirmed" },
  { id:"EV-005", label:"CHC Briefing",   type:"event", subtype:"policy",     detail:"May 18 2026 · Washington D.C." },
  { id:"EV-006", label:"Tijuana Border", type:"event", subtype:"location",   detail:"Primary deportee reintegration corridor" },
  { id:"EV-007", label:"Self-Deportation",type:"event",subtype:"enforcement",detail:"Nov/Dec 2025 · Park case · EPP-005" },

  // Documents / FOIA
  { id:"DOC-001", label:"FOIA F001",    type:"document", subtype:"foia",    detail:"VA BIRLS · 83d overdue · Statutory violation" },
  { id:"DOC-002", label:"FOIA F002",    type:"document", subtype:"foia",    detail:"ICE ERO · 66d overdue · Vet field history" },
  { id:"DOC-003", label:"BISG Study",   type:"document", subtype:"research",detail:"τ=0.40 · 2,309 est · R²=0.947" },
  { id:"DOC-004", label:"5-Stream Analysis",type:"document",subtype:"research",detail:"SSS+DCAS+N644+VA+SRE · p<0.001" },
];

const SEED_EDGES = [
  // People → Units
  { source:"EPP-001", target:"UNIT-001", label:"served in" },
  { source:"EPP-001", target:"EV-001",   label:"KIA theater" },
  { source:"EPP-002", target:"UNIT-001", label:"served in" },
  { source:"EPP-003", target:"UNIT-003", label:"served in" },
  { source:"EPP-004", target:"UNIT-003", label:"served in" },
  { source:"EPP-005", target:"UNIT-003", label:"served in" },
  { source:"EPP-006", target:"UNIT-003", label:"served in" },
  { source:"P-007",   target:"EV-001",   label:"KIA est." },
  { source:"P-007",   target:"UNIT-003", label:"served in" },

  // People → Agencies (enforcement)
  { source:"EPP-003", target:"AG-001", label:"removed by" },
  { source:"EPP-004", target:"AG-001", label:"detained by" },
  { source:"EPP-005", target:"EV-007", label:"triggered" },
  { source:"EPP-006", target:"AG-001", label:"removed by" },

  // People → Benefits
  { source:"EPP-001", target:"AG-002", label:"VA eligible" },
  { source:"EPP-002", target:"AG-002", label:"VA eligible" },
  { source:"P-007",   target:"AG-002", label:"DIC unclaimed" },

  // Agencies → Records
  { source:"AG-003", target:"P-007",   label:"erased" },
  { source:"AG-003", target:"EV-002",  label:"caused" },
  { source:"AG-003", target:"DOC-003", label:"audited by" },
  { source:"AG-003", target:"DOC-004", label:"audited by" },
  { source:"UNIT-004",target:"P-007",  label:"draft records" },
  { source:"AG-005", target:"UNIT-004",label:"holds" },
  { source:"AG-004", target:"P-007",   label:"N-644 eligible" },
  { source:"AG-006", target:"P-007",   label:"actas defunción" },

  // FOIA
  { source:"DOC-001", target:"AG-002", label:"requested from" },
  { source:"DOC-002", target:"AG-001", label:"requested from" },
  { source:"DOC-003", target:"AG-003", label:"analyzes" },
  { source:"DOC-004", target:"AG-003", label:"analyzes" },
  { source:"DOC-004", target:"AG-006", label:"analyzes" },

  // Events
  { source:"EV-001", target:"UNIT-003",label:"occurred in" },
  { source:"EV-002", target:"AG-003",  label:"perpetrated by" },
  { source:"EV-003", target:"AG-001",  label:"executed by" },
  { source:"EV-003", target:"EV-006",  label:"location" },
  { source:"EV-004", target:"AG-001",  label:"cited" },
  { source:"EV-004", target:"EV-002",  label:"documented" },
  { source:"EV-005", target:"DOC-003", label:"uses" },
  { source:"EV-005", target:"DOC-004", label:"uses" },
  { source:"EV-007", target:"EV-006",  label:"near" },
];

// ── Type config ───────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  person:   { color:"#F5B942", radius:20, icon:"👤" },
  unit:     { color:"#4A9EFF", radius:16, icon:"🪖" },
  agency:   { color:"#2DD4BF", radius:17, icon:"🏛️" },
  event:    { color:"#9D7BFF", radius:15, icon:"⚡" },
  document: { color:"#ff7700", radius:14, icon:"📄" },
};

// ── Force-directed layout helpers ─────────────────────────────────────────
function initPositions(nodes, w, h) {
  return nodes.map((n, i) => ({
    ...n,
    x: w / 2 + Math.cos((i / nodes.length) * Math.PI * 2) * (Math.min(w, h) * 0.32),
    y: h / 2 + Math.sin((i / nodes.length) * Math.PI * 2) * (Math.min(w, h) * 0.32),
    vx: 0, vy: 0,
  }));
}

function runForce(nodes, edges, w, h) {
  const REPEL = 3200, ATTRACT = 0.04, DAMP = 0.82, CENTER = 0.008;
  const next = nodes.map(n => ({ ...n }));

  // Repulsion
  for (let i = 0; i < next.length; i++) {
    for (let j = i + 1; j < next.length; j++) {
      const dx = next[j].x - next[i].x;
      const dy = next[j].y - next[i].y;
      const dist2 = Math.max(dx * dx + dy * dy, 1);
      const f = REPEL / dist2;
      next[i].vx -= f * dx; next[i].vy -= f * dy;
      next[j].vx += f * dx; next[j].vy += f * dy;
    }
  }

  // Attraction along edges
  const idxMap = Object.fromEntries(next.map((n, i) => [n.id, i]));
  edges.forEach(e => {
    const si = idxMap[e.source], ti = idxMap[e.target];
    if (si === undefined || ti === undefined) return;
    const dx = next[ti].x - next[si].x;
    const dy = next[ti].y - next[si].y;
    next[si].vx += ATTRACT * dx; next[si].vy += ATTRACT * dy;
    next[ti].vx -= ATTRACT * dx; next[ti].vy -= ATTRACT * dy;
  });

  // Center gravity
  next.forEach(n => {
    n.vx += (w / 2 - n.x) * CENTER;
    n.vy += (h / 2 - n.y) * CENTER;
    n.vx *= DAMP; n.vy *= DAMP;
    n.x += n.vx; n.y += n.vy;
    n.x = Math.max(30, Math.min(w - 30, n.x));
    n.y = Math.max(30, Math.min(h - 30, n.y));
  });
  return next;
}

// ── Main component ────────────────────────────────────────────────────────
export default function KnowledgeGraphVisualizer({ evidenceRecords = [] }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const nodesRef  = useRef([]);
  const edgesRef  = useRef([]);
  const dragRef   = useRef(null);
  const panRef    = useRef({ x: 0, y: 0, dragging: false, startX: 0, startY: 0 });
  const scaleRef  = useRef(1);

  const [selected, setSelected]   = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [running, setRunning]     = useState(true);
  const [nodeCount, setNodeCount] = useState(0);
  const [edgeCount, setEdgeCount] = useState(0);
  const [showLabels, setShowLabels] = useState(true);
  const [showEdgeLabels, setShowEdgeLabels] = useState(false);
  const [searchQ, setSearchQ]     = useState("");
  const [highlighted, setHighlighted] = useState(null);

  // Build graph from seed + evidence log entities
  const buildGraph = useCallback(() => {
    const allNodes = [...SEED_NODES];
    const allEdges = [...SEED_EDGES];

    evidenceRecords.forEach(rec => {
      if (!rec.linked_entities) return;
      const entities = rec.linked_entities.split(",").map(e => e.trim()).filter(Boolean);
      entities.forEach(ent => {
        const id = "EV-LOG-" + ent.replace(/\s+/g, "-").slice(0, 20);
        if (!allNodes.find(n => n.id === id)) {
          allNodes.push({ id, label: ent.slice(0, 24), type: "person", subtype: "evidence-log", detail: `From evidence log: ${rec.doc_title || rec.evidence_id}` });
        }
        // Link to case IDs
        if (rec.case_ids) {
          rec.case_ids.split(",").map(c => c.trim()).forEach(caseId => {
            const caseNode = allNodes.find(n => n.id === caseId);
            if (caseNode) allEdges.push({ source: id, target: caseId, label: "linked in" });
          });
        }
      });
    });

    return { nodes: allNodes, edges: allEdges };
  }, [evidenceRecords]);

  // Initialize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { nodes, edges } = buildGraph();
    const w = canvas.width, h = canvas.height;
    nodesRef.current = initPositions(nodes, w, h);
    edgesRef.current = edges;
    setNodeCount(nodes.length);
    setEdgeCount(edges.length);
  }, [buildGraph]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let tick = 0;

    const draw = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = "#030810";
      ctx.fillRect(0, 0, w, h);

      // Grid dots
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      for (let x = 0; x < w; x += 30) for (let y = 0; y < h; y += 30) {
        ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
      }

      // Transform
      ctx.save();
      ctx.translate(panRef.current.x, panRef.current.y);
      ctx.scale(scaleRef.current, scaleRef.current);

      // Apply type filter
      const filterFn = n => (typeFilter === "all" || n.type === typeFilter) &&
        (!searchQ || n.label.toLowerCase().includes(searchQ.toLowerCase()));
      const visibleIds = new Set(nodesRef.current.filter(filterFn).map(n => n.id));

      // Edges
      edgesRef.current.forEach(e => {
        const s = nodesRef.current.find(n => n.id === e.source);
        const t = nodesRef.current.find(n => n.id === e.target);
        if (!s || !t) return;
        const isVisible = visibleIds.has(e.source) && visibleIds.has(e.target);
        const isHighlighted = highlighted === e.source || highlighted === e.target;
        if (!isVisible && !isHighlighted) return;

        const alpha = isHighlighted ? 0.9 : isVisible ? 0.35 : 0.08;
        const sColor = TYPE_CONFIG[s.type]?.color || "#fff";
        const grad = ctx.createLinearGradient(s.x, s.y, t.x, t.y);
        grad.addColorStop(0, sColor + Math.round(alpha * 255).toString(16).padStart(2,"0"));
        grad.addColorStop(1, (TYPE_CONFIG[t.type]?.color || "#fff") + Math.round(alpha * 255).toString(16).padStart(2,"0"));

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.stroke();

        // Arrow
        if (isHighlighted || isVisible) {
          const angle = Math.atan2(t.y - s.y, t.x - s.x);
          const tr = TYPE_CONFIG[t.type]?.radius || 15;
          const ax = t.x - Math.cos(angle) * (tr + 4);
          const ay = t.y - Math.sin(angle) * (tr + 4);
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(ax - 7 * Math.cos(angle - 0.35), ay - 7 * Math.sin(angle - 0.35));
          ctx.lineTo(ax - 7 * Math.cos(angle + 0.35), ay - 7 * Math.sin(angle + 0.35));
          ctx.closePath();
          ctx.fillStyle = TYPE_CONFIG[t.type]?.color || "#fff";
          ctx.globalAlpha = alpha;
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        // Edge label
        if (showEdgeLabels && isHighlighted && e.label) {
          const mx = (s.x + t.x) / 2, my = (s.y + t.y) / 2;
          ctx.font = "9px 'IBM Plex Mono'";
          ctx.fillStyle = "#ffffff80";
          ctx.textAlign = "center";
          ctx.fillText(e.label, mx, my - 4);
        }
      });

      // Nodes
      nodesRef.current.forEach(n => {
        const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.event;
        const isVis = visibleIds.has(n.id);
        const isSel = selected?.id === n.id;
        const isHi = highlighted === n.id;
        const alpha = isVis || isHi || isSel ? 1 : 0.12;

        ctx.globalAlpha = alpha;

        // Glow
        if (isSel || isHi) {
          const glow = ctx.createRadialGradient(n.x, n.y, cfg.radius, n.x, n.y, cfg.radius * 2.5);
          glow.addColorStop(0, cfg.color + "55");
          glow.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(n.x, n.y, cfg.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = glow; ctx.fill();
        }

        // Node circle
        ctx.beginPath(); ctx.arc(n.x, n.y, cfg.radius, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(n.x - cfg.radius * 0.3, n.y - cfg.radius * 0.3, 1, n.x, n.y, cfg.radius);
        grad.addColorStop(0, cfg.color + "ff");
        grad.addColorStop(1, cfg.color + "99");
        ctx.fillStyle = grad;
        ctx.fill();

        // Border
        ctx.strokeStyle = isSel ? "#ffffff" : isHi ? cfg.color : cfg.color + "60";
        ctx.lineWidth = isSel ? 2.5 : 1.5;
        ctx.stroke();

        // Label
        if (showLabels && (isVis || isSel)) {
          ctx.font = `bold ${isSel ? 10 : 8}px 'IBM Plex Mono'`;
          ctx.fillStyle = isSel ? "#ffffff" : "#ffffffcc";
          ctx.textAlign = "center";
          ctx.fillText(n.label.length > 18 ? n.label.slice(0, 17) + "…" : n.label, n.x, n.y + cfg.radius + 12);
        }

        ctx.globalAlpha = 1;
      });

      ctx.restore();

      // Force step
      if (running && tick % 2 === 0 && !dragRef.current) {
        const w = canvas.width, h = canvas.height;
        nodesRef.current = runForce(nodesRef.current, edgesRef.current, w, h);
      }
      tick++;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [running, typeFilter, selected, showLabels, showEdgeLabels, highlighted, searchQ]);

  // Mouse interaction
  const getNodeAt = (cx, cy) => {
    const px = (cx - panRef.current.x) / scaleRef.current;
    const py = (cy - panRef.current.y) / scaleRef.current;
    return nodesRef.current.find(n => {
      const r = TYPE_CONFIG[n.type]?.radius || 15;
      return Math.hypot(n.x - px, n.y - py) < r + 4;
    });
  };

  const onMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    const hit = getNodeAt(cx, cy);
    if (hit) {
      dragRef.current = { nodeId: hit.id, ox: cx - hit.x * scaleRef.current - panRef.current.x, oy: cy - hit.y * scaleRef.current - panRef.current.y };
      setSelected(hit);
      setHighlighted(hit.id);
    } else {
      panRef.current = { ...panRef.current, dragging: true, startX: cx - panRef.current.x, startY: cy - panRef.current.y };
      setSelected(null); setHighlighted(null);
    }
  };

  const onMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    if (dragRef.current) {
      const px = (cx - dragRef.current.ox - panRef.current.x) / scaleRef.current;
      const py = (cy - dragRef.current.oy - panRef.current.y + panRef.current.y) / scaleRef.current;
      // Simpler: direct canvas coords
      const node = nodesRef.current.find(n => n.id === dragRef.current.nodeId);
      if (node) {
        node.x = (cx - panRef.current.x) / scaleRef.current;
        node.y = (cy - panRef.current.y) / scaleRef.current;
        node.vx = 0; node.vy = 0;
      }
    } else if (panRef.current.dragging) {
      panRef.current.x = cx - panRef.current.startX;
      panRef.current.y = cy - panRef.current.startY;
    } else {
      const hit = getNodeAt(cx, cy);
      canvasRef.current.style.cursor = hit ? "pointer" : "grab";
    }
  };

  const onMouseUp = () => {
    dragRef.current = null;
    panRef.current.dragging = false;
  };

  const onWheel = (e) => {
    e.preventDefault();
    scaleRef.current = Math.max(0.3, Math.min(2.5, scaleRef.current - e.deltaY * 0.001));
  };

  const resetView = () => {
    panRef.current = { x: 0, y: 0, dragging: false, startX: 0, startY: 0 };
    scaleRef.current = 1;
  };

  // Neighbors of selected
  const neighbors = selected
    ? edgesRef.current
        .filter(e => e.source === selected.id || e.target === selected.id)
        .map(e => {
          const otherId = e.source === selected.id ? e.target : e.source;
          const node = nodesRef.current.find(n => n.id === otherId);
          return node ? { ...node, edge: e } : null;
        }).filter(Boolean)
    : [];

  return (
    <div style={{ fontFamily:"'IBM Plex Mono',monospace", color:P.t1 }}>

      {/* Header */}
      <div style={{ background:`linear-gradient(90deg,${P.card},#0D1525)`, border:`2px solid ${P.violet}30`,
        borderRadius:10, padding:"10px 16px", marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
        <div>
          <div style={{ fontSize:7, color:P.violet, letterSpacing:3, fontWeight:800, marginBottom:2 }}>
            🕸️ KNOWLEDGE GRAPH · ENTITY RELATIONSHIP VISUALIZER · TRUTHENGINE360
          </div>
          <div style={{ fontSize:11, fontWeight:800, color:P.t1 }}>
            People · Military Units · Agencies · Events · Documents
          </div>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {[["Nodes", nodeCount, P.violet], ["Edges", edgeCount, P.blue], ["EL Entities", evidenceRecords.filter(r=>r.linked_entities).length, P.gold]].map(([l,v,c]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:16, fontWeight:800, color:c }}>{v}</div>
              <div style={{ fontSize:6, color:P.t4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap", alignItems:"center" }}>
        {/* Type filters */}
        {["all","person","unit","agency","event","document"].map(t => {
          const cfg = TYPE_CONFIG[t];
          return (
            <button key={t} onClick={() => setTypeFilter(t)}
              style={{ padding:"3px 9px", fontSize:7, fontWeight: typeFilter===t?800:600, cursor:"pointer",
                background: typeFilter===t ? `${cfg?.color||P.gold}20` : "transparent",
                border:`1px solid ${typeFilter===t?(cfg?.color||P.gold):P.b}`,
                color: typeFilter===t?(cfg?.color||P.gold):P.t4, borderRadius:20, fontFamily:"inherit" }}>
              {cfg?.icon||"🔵"} {t === "all" ? "All Types" : t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          );
        })}

        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Find node…"
          style={{ fontFamily:"inherit", fontSize:8, background:"#080D18", border:`1px solid ${P.b}`,
            borderRadius:5, padding:"4px 9px", color:P.t1, outline:"none", width:120 }} />

        <div style={{ display:"flex", gap:4, marginLeft:"auto" }}>
          <button onClick={() => setRunning(r => !r)}
            style={{ padding:"4px 10px", fontSize:7, fontWeight:700, cursor:"pointer",
              background: running?`${P.teal}18`:`${P.amber}18`, border:`1px solid ${running?P.teal:P.amber}`,
              color: running?P.teal:P.amber, borderRadius:5, fontFamily:"inherit" }}>
            {running ? "⏸ Pause" : "▶ Resume"}
          </button>
          <button onClick={() => setShowLabels(l => !l)}
            style={{ padding:"4px 10px", fontSize:7, fontWeight:700, cursor:"pointer",
              background: showLabels?`${P.blue}18`:"transparent", border:`1px solid ${showLabels?P.blue:P.b}`,
              color: showLabels?P.blue:P.t4, borderRadius:5, fontFamily:"inherit" }}>
            Labels
          </button>
          <button onClick={() => setShowEdgeLabels(l => !l)}
            style={{ padding:"4px 10px", fontSize:7, fontWeight:700, cursor:"pointer",
              background: showEdgeLabels?`${P.violet}18`:"transparent", border:`1px solid ${showEdgeLabels?P.violet:P.b}`,
              color: showEdgeLabels?P.violet:P.t4, borderRadius:5, fontFamily:"inherit" }}>
            Edge Labels
          </button>
          <button onClick={resetView}
            style={{ padding:"4px 10px", fontSize:7, fontWeight:700, cursor:"pointer",
              background:"transparent", border:`1px solid ${P.b}`, color:P.t4, borderRadius:5, fontFamily:"inherit" }}>
            Reset View
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:10 }}>
        {/* Canvas */}
        <div style={{ position:"relative" }}>
          <canvas
            ref={canvasRef}
            width={820} height={520}
            style={{ width:"100%", height:520, borderRadius:10, border:`1px solid ${P.b}`, cursor:"grab", display:"block" }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onWheel={onWheel}
          />
          {/* Zoom hint */}
          <div style={{ position:"absolute", bottom:10, left:12, fontSize:6, color:P.t4 }}>
            Scroll to zoom · Drag to pan · Click node to select · Drag node to reposition
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {/* Legend */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:8, padding:"10px 12px" }}>
            <div style={{ fontSize:7, fontWeight:800, color:P.t4, letterSpacing:1, marginBottom:6 }}>NODE TYPES</div>
            {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
              <div key={type} style={{ display:"flex", gap:6, alignItems:"center", padding:"3px 0" }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:cfg.color, flexShrink:0 }}/>
                <span style={{ fontSize:7, color:P.t3 }}>{cfg.icon} {type.charAt(0).toUpperCase()+type.slice(1)}</span>
              </div>
            ))}
          </div>

          {/* Selected node detail */}
          {selected ? (
            <div style={{ background:P.card, border:`2px solid ${TYPE_CONFIG[selected.type]?.color||P.gold}40`,
              borderTop:`3px solid ${TYPE_CONFIG[selected.type]?.color||P.gold}`, borderRadius:8, padding:"10px 12px", flex:1 }}>
              <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:6 }}>
                <span style={{ fontSize:18 }}>{TYPE_CONFIG[selected.type]?.icon}</span>
                <div>
                  <div style={{ fontSize:9, fontWeight:800, color:TYPE_CONFIG[selected.type]?.color||P.gold }}>{selected.label}</div>
                  <div style={{ fontSize:6, color:P.t4 }}>{selected.type} · {selected.subtype}</div>
                </div>
              </div>
              <div style={{ fontSize:7, color:P.t3, marginBottom:8, lineHeight:1.6 }}>{selected.detail}</div>
              <div style={{ fontSize:7, color:P.t4, fontFamily:"'IBM Plex Mono',monospace", marginBottom:6 }}>ID: {selected.id}</div>

              {neighbors.length > 0 && (
                <>
                  <div style={{ fontSize:6, fontWeight:800, color:P.t4, letterSpacing:1, marginBottom:5 }}>
                    CONNECTIONS ({neighbors.length})
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:4, maxHeight:220, overflowY:"auto" }}>
                    {neighbors.map((nb, i) => {
                      const isOut = nb.edge.source === selected.id;
                      const cfg = TYPE_CONFIG[nb.type];
                      return (
                        <div key={i} onClick={() => { setSelected(nb); setHighlighted(nb.id); }}
                          style={{ display:"flex", gap:5, alignItems:"flex-start", padding:"4px 6px",
                            background:"#080D18", borderRadius:5, cursor:"pointer",
                            border:`1px solid ${cfg?.color||P.b}20` }}>
                          <div style={{ width:7, height:7, borderRadius:"50%", background:cfg?.color||P.t4, flexShrink:0, marginTop:2 }}/>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:7, fontWeight:700, color:P.t2, lineHeight:1.3 }}>{nb.label}</div>
                            <div style={{ fontSize:6, color:cfg?.color||P.t4 }}>{isOut?"→":"←"} {nb.edge.label}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:8, padding:"10px 12px",
              fontSize:7, color:P.t4, textAlign:"center", lineHeight:1.8 }}>
              Click any node to<br/>see its connections<br/>and details
            </div>
          )}

          {/* Evidence log notice */}
          {evidenceRecords.length > 0 && (
            <div style={{ background:`${P.gold}08`, border:`1px solid ${P.gold}20`, borderRadius:7, padding:"7px 10px" }}>
              <div style={{ fontSize:6, fontWeight:800, color:P.gold, letterSpacing:1, marginBottom:3 }}>EVIDENCE LOG ENTITIES</div>
              <div style={{ fontSize:6, color:P.t4, lineHeight:1.6 }}>
                {evidenceRecords.filter(r=>r.linked_entities).length} records with linked entities imported into graph.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}