import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

const COMPONENTS = [
  { name: 'Geographic Anchor',  score: 98, status: 'complete' },
  { name: 'Legal Framework',    score: 96, status: 'complete' },
  { name: 'Political Record',   score: 92, status: 'complete' },
  { name: 'WF Operations',      score: 85, status: 'complete' },
  { name: 'Archive Paths',      score: 85, status: 'mapped',  note: 'pending execute' },
  { name: 'Tradecraft Model',   score: 78, status: 'complete' },
  { name: 'Oral History',       score: 72, status: 'warning', note: 'Carmelita = urgent' },
  { name: 'Indigenous Context', score: 70, status: 'warning', note: 'FamilySearch pending' },
  { name: 'Document Custody',   score: 35, status: 'critical', note: 'SHA-256 pending' },
];

const tone = (s) => {
  if (s === 'complete') return { color: '#4a5d3a', glyph: '✓', label: 'COMPLETE' };
  if (s === 'mapped')   return { color: '#4a5d3a', glyph: '✓', label: 'MAPPED' };
  if (s === 'warning')  return { color: '#8a6e3c', glyph: '!', label: 'ACTION' };
  if (s === 'critical') return { color: '#6b1f1f', glyph: '●', label: 'CRITICAL' };
  return { color: '#6b6559', glyph: '·', label: '' };
};

export default function ComponentStatusGrid() {
  const avg = Math.round(COMPONENTS.reduce((a, c) => a + c.score, 0) / COMPONENTS.length);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded"
      style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
    >
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4" style={{ color: '#1a1815' }} />
          <p
            className="text-xs uppercase tracking-wider"
            style={{
              color: '#6b6559',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.2em',
            }}
          >
            Component Status · FINAL Intel Report §X
          </p>
        </div>
        <div className="text-xs" style={{ color: '#6b6559' }}>
          Avg <strong style={{ color: '#1a1815' }}>{avg}/100</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {COMPONENTS.map((c) => {
          const t = tone(c.status);
          return (
            <div
              key={c.name}
              className="p-3 rounded"
              style={{ backgroundColor: '#f9f5ed', border: `1px solid ${t.color}` }}
            >
              <div className="flex justify-between items-baseline mb-1">
                <span
                  style={{
                    color: '#1a1815',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.7rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  {c.name}
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: t.color,
                    color: '#f4ede0',
                    fontSize: '0.65rem',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {t.glyph} {t.label}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span
                  className="text-2xl font-light"
                  style={{
                    color: '#1a1815',
                    fontFamily: 'Cormorant Garamond',
                    lineHeight: 1,
                  }}
                >
                  {c.score}
                  <span className="text-sm" style={{ color: '#6b6559' }}>
                    /100
                  </span>
                </span>
                {c.note ? (
                  <span className="text-xs italic" style={{ color: t.color }}>
                    {c.note}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
