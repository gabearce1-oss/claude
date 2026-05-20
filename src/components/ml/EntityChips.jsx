import React, { useMemo } from 'react';
import { Tag } from 'lucide-react';
import { extractEntities } from '@/lib/ml';

const TYPE_COLOR = {
  person:       { bg: '#e8efe2', fg: '#4a5d3a' },
  organization: { bg: '#e8eef2', fg: '#5a6b7a' },
  place:        { bg: '#f3ead8', fg: '#8a6e3c' },
  tribe:        { bg: '#f2dcdc', fg: '#6b1f1f' },
  archive:      { bg: '#ebe1ce', fg: '#1a1815' },
  case:         { bg: '#1a1815', fg: '#f4ede0' },
  candidate:    { bg: '#ffffff', fg: '#6b6559' },
};

export default function EntityChips({ text, limit = 20 }) {
  const entities = useMemo(() => extractEntities(text, { limit }), [text, limit]);

  if (!entities || entities.length === 0) return null;

  return (
    <div
      className="p-3 rounded"
      style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Tag className="w-3 h-3" style={{ color: '#8a6e3c' }} />
        <span
          className="text-xs uppercase tracking-wider"
          style={{
            color: '#6b6559',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.15em',
          }}
        >
          Extracted entities · {entities.filter((e) => e.source === 'canonical').length} canonical · {entities.filter((e) => e.source === 'capitalized').length} candidate
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {entities.map((e) => {
          const c = TYPE_COLOR[e.type] || TYPE_COLOR.candidate;
          const isCandidate = e.source === 'capitalized';
          return (
            <span
              key={e.name}
              className="text-xs px-2 py-0.5 rounded inline-flex items-center gap-1"
              style={{
                backgroundColor: c.bg,
                color: c.fg,
                border: isCandidate ? '1px dashed #d4cdb8' : '1px solid transparent',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.7rem',
              }}
              title={`${e.type} · ${e.source} · hits ${e.hits}`}
            >
              {e.name}
              {e.hits > 1 && (
                <span style={{ opacity: 0.6 }}>×{e.hits}</span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
