import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';

// Pass 3.1 Nine Pipes — derived from claim.subject prefix (GEO-001, POL-005, etc.)
const PIPES = [
  { code: 'GEO',   label: 'GEO+MIN',     desc: 'Geography & mining',       expected: 6  },
  { code: 'POL',   label: 'POL',         desc: 'Political collapse',       expected: 12 },
  { code: 'LAND',  label: 'LAND',        desc: 'Land dispossession',       expected: 9  },
  { code: 'IND',   label: 'IND+DNA',     desc: 'Indigenous identity & DNA',    expected: 8   },
  { code: 'GEN',   label: 'GEN+FAM',     desc: 'Genealogy & family',       expected: 10  },
  { code: 'WF',    label: 'WF',          desc: 'Wells Fargo / banking',    expected: 18  },
  { code: 'LEGAL', label: 'LEGAL',       desc: 'Legal framework',          expected: 5   },
  { code: 'TRADE', label: 'TRADE',       desc: 'Tradecraft & proxies',     expected: 10  },
  { code: 'AUDIT', label: 'AUDIT+INST',  desc: 'Source integrity & audit', expected: 16  },
];

function bandFor(claims) {
  const v = claims.filter((c) => c.status === 'verified' || c.status === 'corroborated').length;
  const r = claims.filter((c) => c.status === 'fabricated_risk' || c.status === 'rejected').length;
  const total = claims.length;
  if (total === 0) return { color: '#d4cdb8', label: '—' };
  if (r > 0 && r >= v) return { color: '#6b1f1f', label: 'RED' };
  if (v === total) return { color: '#4a5d3a', label: 'GREEN' };
  if (v >= Math.ceil(total / 2)) return { color: '#8aa67c', label: 'MIXED' };
  return { color: '#b8a685', label: 'ORANGE' };
}

export default function PipesSummary({ claims = [] }) {
  const rows = useMemo(() => {
    return PIPES.map((p) => {
      const c = claims.filter((cl) => (cl.subject || '').toUpperCase().startsWith(p.code + '-'));
      const verified = c.filter((cl) => cl.status === 'verified' || cl.status === 'corroborated').length;
      const orange = c.filter((cl) => cl.status === 'plausible' || cl.status === 'weak_lead' || cl.status === 'unverified').length;
      const red = c.filter((cl) => cl.status === 'fabricated_risk' || cl.status === 'rejected').length;
      return { ...p, count: c.length, verified, orange, red, band: bandFor(c) };
    });
  }, [claims]);

  const totals = useMemo(() => {
    const verified = claims.filter((c) => c.status === 'verified' || c.status === 'corroborated').length;
    const orange = claims.filter((c) => c.status === 'plausible' || c.status === 'weak_lead' || c.status === 'unverified').length;
    const red = claims.filter((c) => c.status === 'fabricated_risk' || c.status === 'rejected').length;
    return { total: claims.length, verified, orange, red };
  }, [claims]);

  // TE360 Pass 3.1 audit score formula: (verified * 1.0 + orange * 0.4 - red * 1.0) / total * 100
  const audit =
    totals.total > 0
      ? Math.max(
          0,
          Math.round(
            ((totals.verified * 1.0 + totals.orange * 0.4 - totals.red * 1.0) / totals.total) * 100
          )
        )
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded"
      style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
    >
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4" style={{ color: '#1a1815' }} />
          <p
            className="text-xs uppercase tracking-wider"
            style={{ color: '#6b6559', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.2em' }}
          >
            Nine Pipes · Pass 3.1
          </p>
        </div>
        <div className="flex items-baseline gap-4 text-xs" style={{ color: '#6b6559' }}>
          <span>✅ <strong style={{ color: '#4a5d3a' }}>{totals.verified}</strong> verified</span>
          <span>🟠 <strong style={{ color: '#8a6e3c' }}>{totals.orange}</strong> leads</span>
          <span>🔴 <strong style={{ color: '#6b1f1f' }}>{totals.red}</strong> quarantined</span>
          <span>📋 <strong style={{ color: '#1a1815' }}>{totals.total}</strong> total</span>
          <span>📊 Audit <strong style={{ color: '#1a1815' }}>{audit}/100</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {rows.map((p) => (
          <div
            key={p.code}
            className="p-3 rounded"
            style={{ backgroundColor: '#f9f5ed', border: `1px solid ${p.band.color}` }}
          >
            <div className="flex justify-between items-baseline mb-1">
              <span
                style={{
                  color: '#1a1815',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                }}
              >
                {p.label}
              </span>
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ backgroundColor: p.band.color, color: '#f4ede0', fontSize: '0.65rem' }}
              >
                {p.band.label}
              </span>
            </div>
            <p className="text-xs mb-2" style={{ color: '#6b6559' }}>{p.desc}</p>
            <div className="flex justify-between items-baseline">
              <span
                className="text-2xl font-light"
                style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond', lineHeight: 1 }}
              >
                {p.count}
              </span>
              <span className="text-xs" style={{ color: '#6b6559' }}>
                <span style={{ color: '#4a5d3a' }}>{p.verified}</span> · {' '}
                <span style={{ color: '#8a6e3c' }}>{p.orange}</span> · {' '}
                <span style={{ color: '#6b1f1f' }}>{p.red}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs mt-3 italic" style={{ color: '#6b6559' }}>
        Audit Score {audit}/100 ·{' '}
        {audit < 40
          ? 'Primary archival research phase'
          : audit < 70
          ? 'Corroboration phase'
          : 'Litigation-ready'}
        . Gap analysis: focus on ORANGE pipes with highest claim count.
      </p>
    </motion.div>
  );
}