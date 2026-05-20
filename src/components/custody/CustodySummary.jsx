import React, { useMemo } from 'react';
import { CUSTODY_STAGES } from './custodyConfig';

export default function CustodySummary({ evidence }) {
  const counts = useMemo(() => {
    const base = Object.fromEntries(CUSTODY_STAGES.map((s) => [s.key, 0]));
    evidence.forEach((e) => {
      const key = e.chain_of_custody_status || 'draft';
      base[key] = (base[key] || 0) + 1;
    });
    return base;
  }, [evidence]);

  const total = evidence.length || 1;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {CUSTODY_STAGES.map((s) => {
        const Icon = s.icon;
        const count = counts[s.key] || 0;
        const pct = Math.round((count / total) * 100);
        return (
          <div
            key={s.key}
            className="p-4 rounded"
            style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8', borderTop: `3px solid ${s.color}` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color: s.color }} />
              <span
                className="text-xs"
                style={{
                  color: s.color,
                  fontFamily: 'JetBrains Mono, monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                {s.label}
              </span>
            </div>
            <p className="text-3xl font-light" style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}>
              {count}
            </p>
            <p className="text-xs mt-1" style={{ color: '#6b6559' }}>
              {pct}% of records
            </p>
          </div>
        );
      })}
    </div>
  );
}