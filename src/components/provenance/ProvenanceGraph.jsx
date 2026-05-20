import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Deterministic force-free layout:
 * - KnowledgeDocuments (intelligence) on the LEFT column
 * - Evidence items in the MIDDLE column
 * - Sources (extracted unique strings) on the RIGHT column
 * Links drawn as curved SVG paths.
 */
export default function ProvenanceGraph({ evidence, documents, onSelectNode, selectedNodeId, filterText }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 1000, height: 700 });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width } = e.contentRect;
        setSize((s) => ({ ...s, width: Math.max(700, width) }));
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const { nodes, links } = useMemo(() => {
    const q = (filterText || '').toLowerCase().trim();

    const matchEv = (e) =>
      !q ||
      (e.title || '').toLowerCase().includes(q) ||
      (e.evidence_number || '').toLowerCase().includes(q) ||
      (e.source || '').toLowerCase().includes(q) ||
      (e.tags || []).some((t) => (t || '').toLowerCase().includes(q));

    const matchDoc = (d) =>
      !q ||
      (d.title || '').toLowerCase().includes(q) ||
      (d.summary || '').toLowerCase().includes(q) ||
      (d.tags || []).some((t) => (t || '').toLowerCase().includes(q)) ||
      (d.related_archives || []).some((a) => (a || '').toLowerCase().includes(q));

    const filteredEvidence = (evidence || []).filter(matchEv);
    const filteredDocs = (documents || []).filter(matchDoc);

    // Build unique sources from evidence.source field
    const sourceSet = new Map();
    filteredEvidence.forEach((e) => {
      const s = (e.source || '').trim();
      if (!s) return;
      if (!sourceSet.has(s)) sourceSet.set(s, { id: `src:${s}`, type: 'source', label: s, refs: [] });
      sourceSet.get(s).refs.push(e.id);
    });
    const sources = Array.from(sourceSet.values());

    // Layout columns
    const colX = { doc: 140, ev: size.width / 2, src: size.width - 140 };
    const topPad = 80;
    const bottomPad = 40;
    const usableH = Math.max(400, 80 * Math.max(filteredDocs.length, filteredEvidence.length, sources.length) + 100);
    const layH = usableH;

    const spread = (count, height) => {
      if (count <= 1) return [height / 2];
      const step = (height - topPad - bottomPad) / (count - 1);
      return Array.from({ length: count }, (_, i) => topPad + step * i);
    };

    const docYs = spread(filteredDocs.length, layH);
    const evYs = spread(filteredEvidence.length, layH);
    const srcYs = spread(sources.length, layH);

    const nodes = [];
    filteredDocs.forEach((d, i) => {
      nodes.push({
        id: `doc:${d.id}`,
        type: 'document',
        x: colX.doc,
        y: docYs[i],
        label: d.title,
        trust: d.trust_tier,
        raw: d,
      });
    });
    filteredEvidence.forEach((e, i) => {
      nodes.push({
        id: `ev:${e.id}`,
        type: 'evidence',
        x: colX.ev,
        y: evYs[i],
        label: e.title,
        status: e.status,
        raw: e,
      });
    });
    sources.forEach((s, i) => {
      nodes.push({
        id: s.id,
        type: 'source',
        x: colX.src,
        y: srcYs[i],
        label: s.label,
        raw: s,
      });
    });

    // Links
    const links = [];

    // Evidence -> Source
    filteredEvidence.forEach((e) => {
      const s = (e.source || '').trim();
      if (!s) return;
      links.push({
        id: `ev-src:${e.id}`,
        from: `ev:${e.id}`,
        to: `src:${s}`,
        kind: 'sourced-from',
      });
    });

    // Document -> Evidence (match by shared tags OR if doc references evidence_number in summary)
    filteredDocs.forEach((d) => {
      const docTags = new Set((d.tags || []).map((t) => (t || '').toLowerCase()));
      const summary = (d.summary || '').toLowerCase();
      filteredEvidence.forEach((e) => {
        let connected = false;
        // tag overlap
        (e.tags || []).forEach((t) => {
          if (docTags.has((t || '').toLowerCase())) connected = true;
        });
        // evidence_number mentioned in doc summary or key_findings
        if (!connected && e.evidence_number) {
          if (summary.includes(e.evidence_number.toLowerCase())) connected = true;
          if ((d.key_findings || []).some((k) => (k || '').toLowerCase().includes(e.evidence_number.toLowerCase()))) {
            connected = true;
          }
        }
        if (connected) {
          links.push({
            id: `doc-ev:${d.id}:${e.id}`,
            from: `doc:${d.id}`,
            to: `ev:${e.id}`,
            kind: 'references',
          });
        }
      });
    });

    return { nodes, links, height: layH };
  }, [evidence, documents, filterText, size.width]);

  const height = useMemo(() => {
    const maxCount = Math.max(
      (documents || []).length,
      (evidence || []).length,
      new Set((evidence || []).map((e) => e.source).filter(Boolean)).size
    );
    return Math.max(500, 80 * maxCount + 120);
  }, [evidence, documents]);

  const nodeById = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);

  // Highlight: if a node is selected, only highlight its links
  const isLinkActive = (l) => !selectedNodeId || l.from === selectedNodeId || l.to === selectedNodeId;
  const isNodeActive = (n) => {
    if (!selectedNodeId) return true;
    if (n.id === selectedNodeId) return true;
    return links.some(
      (l) => (l.from === selectedNodeId && l.to === n.id) || (l.to === selectedNodeId && l.from === n.id)
    );
  };

  const trustColor = {
    verified: '#6b8e6f',
    plausible: '#b8a685',
    fabricated_risk: '#c97761',
    mixed: '#8a7b6f',
    methodology: '#6b6559',
  };
  const statusColor = {
    unreviewed: '#d4cdb8',
    reviewed: '#b8a685',
    verified: '#6b8e6f',
    disputed: '#c97761',
    archived: '#8a7b6f',
  };

  return (
    <div ref={containerRef} className="w-full overflow-x-auto rounded" style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}>
      <svg width={size.width} height={height} style={{ display: 'block' }}>
        {/* Column headers */}
        <g>
          <text x={140} y={30} textAnchor="middle" style={{ fontSize: 12, fill: '#6b6559', letterSpacing: 1 }}>
            INTELLIGENCE DOCUMENTS
          </text>
          <text x={size.width / 2} y={30} textAnchor="middle" style={{ fontSize: 12, fill: '#6b6559', letterSpacing: 1 }}>
            EVIDENCE
          </text>
          <text x={size.width - 140} y={30} textAnchor="middle" style={{ fontSize: 12, fill: '#6b6559', letterSpacing: 1 }}>
            SOURCES
          </text>
          <line x1={40} y1={45} x2={size.width - 40} y2={45} stroke="#d4cdb8" />
        </g>

        {/* Links */}
        <g>
          {links.map((l) => {
            const a = nodeById[l.from];
            const b = nodeById[l.to];
            if (!a || !b) return null;
            const mx = (a.x + b.x) / 2;
            const path = `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
            const active = isLinkActive(l);
            return (
              <path
                key={l.id}
                d={path}
                fill="none"
                stroke={l.kind === 'references' ? '#8b7355' : '#6b8e6f'}
                strokeWidth={active ? 1.5 : 0.6}
                strokeOpacity={active ? 0.7 : 0.15}
                strokeDasharray={l.kind === 'references' ? '4 3' : ''}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {nodes.map((n) => {
            const active = isNodeActive(n);
            const isSelected = n.id === selectedNodeId;
            const fill =
              n.type === 'document'
                ? trustColor[n.trust] || '#8a7b6f'
                : n.type === 'evidence'
                ? statusColor[n.status] || '#d4cdb8'
                : '#3a3530';
            const r = n.type === 'evidence' ? 8 : 7;
            const labelMax = 38;
            const label = n.label && n.label.length > labelMax ? n.label.slice(0, labelMax) + '…' : n.label;
            const labelAnchor = n.type === 'document' ? 'end' : n.type === 'source' ? 'start' : 'middle';
            const labelDx = n.type === 'document' ? -14 : n.type === 'source' ? 14 : 0;
            const labelDy = n.type === 'evidence' ? -14 : 4;

            return (
              <motion.g
                key={n.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: active ? 1 : 0.25 }}
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectNode(n)}
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={isSelected ? r + 4 : r}
                  fill={fill}
                  stroke={isSelected ? '#1a1815' : '#ffffff'}
                  strokeWidth={isSelected ? 2 : 1.5}
                />
                <text
                  x={n.x + labelDx}
                  y={n.y + labelDy}
                  textAnchor={labelAnchor}
                  style={{
                    fontSize: 11,
                    fill: '#1a1815',
                    fontFamily: n.type === 'evidence' ? 'JetBrains Mono, monospace' : 'inherit',
                    pointerEvents: 'none',
                  }}
                >
                  {label}
                </text>
              </motion.g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}