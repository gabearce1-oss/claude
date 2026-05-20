import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { detectDrift } from '@/lib/ml';
import { listAll } from '@/lib/base44/pagination';

// Spark sparkline (inline SVG, no dep)
function Spark({ points, width = 160, height = 32 }) {
  if (!points || points.length < 2) return null;
  const ys = points.map((p) => p.audit_score);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const range = max - min || 1;
  const dx = width / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * dx} ${height - ((p.audit_score - min) / range) * height}`)
    .join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <path d={path} fill="none" stroke="#1a1815" strokeWidth="1.5" />
    </svg>
  );
}

export default function AuditDriftBanner() {
  const { data: logs = [] } = useQuery({
    queryKey: ['sessionLogs'],
    queryFn: () => listAll(base44.entities.SessionLog).catch(() => []),
  });

  const drift = useMemo(() => detectDrift(logs, { windowSize: 7, threshold: 1.5 }), [logs]);

  if (!drift.latest) return null;

  const isDrift = drift.hasDrift;
  const goingUp = drift.direction === 'up';
  const Icon = isDrift ? (goingUp ? TrendingUp : TrendingDown) : Activity;
  const accent = !isDrift ? '#6b6559' : goingUp ? '#4a5d3a' : '#6b1f1f';
  const tag = !isDrift
    ? 'STEADY'
    : goingUp
    ? 'DRIFT · IMPROVING'
    : 'DRIFT · REGRESSING';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded flex items-center gap-4"
      style={{
        backgroundColor: '#ffffff',
        border: `1px solid ${accent}`,
      }}
    >
      <Icon className="w-5 h-5 flex-shrink-0" style={{ color: accent }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <span
            className="text-xs uppercase tracking-wider"
            style={{
              color: accent,
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.18em',
            }}
          >
            Audit-score drift detector · {tag}
          </span>
          <span className="text-xs" style={{ color: '#6b6559' }}>
            latest <strong style={{ color: '#1a1815' }}>{drift.latest.audit_score}/100</strong> ·
            7-day mean <strong style={{ color: '#1a1815' }}>{drift.mean}</strong> ·
            z = <strong style={{ color: '#1a1815' }}>{drift.z}</strong>
          </span>
        </div>
        <p className="text-xs mt-1" style={{ color: '#6b6559', lineHeight: 1.55 }}>
          {isDrift
            ? `Latest score is ${Math.abs(drift.z)}σ ${goingUp ? 'above' : 'below'} the 7-day rolling mean. ${
                goingUp ? 'New verified evidence has landed.' : 'Quarantines or rejections have outpaced verifications.'
              }`
            : 'No anomaly. Daily audit score is tracking within ±1.5σ of the 7-day rolling baseline.'}
        </p>
      </div>
      <div className="flex-shrink-0" style={{ color: accent }}>
        <Spark points={drift.points.slice(-30)} />
      </div>
    </motion.div>
  );
}
