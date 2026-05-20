import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, ChevronRight } from 'lucide-react';
import { cluster } from '@/lib/ml';

// `rows` = [{ id, text, title, ...meta }]
// `renderRow` optional — default renders title or text snippet
export default function EvidenceClusters({ rows, k = 4, renderRow }) {
  const [openCluster, setOpenCluster] = useState(null);

  const grouped = useMemo(() => {
    if (!rows || rows.length === 0) return [];
    const assignments = cluster(
      rows.filter((r) => r.id && r.text).map((r) => ({ id: r.id, text: r.text })),
      { k, iters: 12 }
    );
    const byCluster = new Map();
    for (const a of assignments) {
      if (!byCluster.has(a.cluster)) byCluster.set(a.cluster, { label: a.label, members: [] });
      const row = rows.find((r) => r.id === a.docId);
      if (row) byCluster.get(a.cluster).members.push(row);
    }
    return Array.from(byCluster.entries())
      .map(([id, c]) => ({ id, ...c }))
      .sort((a, b) => b.members.length - a.members.length);
  }, [rows, k]);

  if (grouped.length === 0) return null;

  return (
    <div
      className="p-5 rounded"
      style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-4 h-4" style={{ color: '#1a1815' }} />
        <p
          className="text-xs uppercase tracking-wider"
          style={{
            color: '#6b6559',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.18em',
          }}
        >
          Topic clusters · k-means over TF-IDF · k={k}
        </p>
      </div>

      <div className="space-y-2">
        {grouped.map((g) => {
          const isOpen = openCluster === g.id;
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded"
              style={{ border: '1px solid #d4cdb8', backgroundColor: '#f9f5ed' }}
            >
              <button
                onClick={() => setOpenCluster(isOpen ? null : g.id)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left"
              >
                <span
                  className="text-xs"
                  style={{
                    color: '#1a1815',
                    fontFamily: 'JetBrains Mono, monospace',
                    letterSpacing: '0.08em',
                  }}
                >
                  <ChevronRight
                    className="inline w-3 h-3 mr-1 transition-transform"
                    style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }}
                  />
                  {g.label || `cluster ${g.id}`}
                </span>
                <span
                  className="text-xs"
                  style={{
                    color: '#6b6559',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {g.members.length} item{g.members.length === 1 ? '' : 's'}
                </span>
              </button>
              {isOpen && (
                <div className="px-3 pb-3 space-y-1.5">
                  {g.members.slice(0, 20).map((r) => (
                    <div key={r.id} className="text-xs" style={{ color: '#1a1815', lineHeight: 1.5 }}>
                      {renderRow ? renderRow(r) : (r.title || r.text.slice(0, 140) + (r.text.length > 140 ? '…' : ''))}
                    </div>
                  ))}
                  {g.members.length > 20 && (
                    <p className="text-xs italic" style={{ color: '#6b6559' }}>
                      …and {g.members.length - 20} more
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
