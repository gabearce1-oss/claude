import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function QuarantinePanel({ evidence = [], claims = [] }) {
  const items = useMemo(() => {
    const ev = evidence
      .filter((e) => e.chain_of_custody_status === 'quarantined' || (e.contamination_score || 0) >= 60)
      .map((e) => ({
        kind: 'Evidence',
        title: e.title,
        ref: e.evidence_number,
        reason:
          e.chain_of_custody_status === 'quarantined'
            ? 'Custody: quarantined'
            : `Contamination score ${e.contamination_score}`,
      }));
    const cl = claims
      .filter((c) => c.status === 'fabricated_risk')
      .map((c) => ({
        kind: 'Claim',
        title: c.claim_text,
        ref: c.claim_type,
        reason: 'Status: fabricated_risk',
      }));
    return [...ev, ...cl];
  }, [evidence, claims]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded"
      style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" style={{ color: '#6b1f1f' }} />
          <p className="text-xs uppercase tracking-wider" style={{ color: '#6b6559' }}>
            Quarantine Zone
          </p>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded"
          style={{
            backgroundColor: items.length > 0 ? '#f3dede' : '#e8efe2',
            color: items.length > 0 ? '#6b1f1f' : '#4a5d3a',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm" style={{ color: '#6b6559' }}>
          Nothing in quarantine. All records pass contamination thresholds.
        </p>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-auto">
          {items.map((it, i) => (
            <li
              key={i}
              className="text-xs p-2 rounded"
              style={{ backgroundColor: '#f9f5ed', border: '1px solid #ebe1ce' }}
            >
              <div className="flex justify-between gap-2 mb-1">
                <span style={{ color: '#6b1f1f', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {it.kind} · {it.ref}
                </span>
              </div>
              <p style={{ color: '#1a1815', lineHeight: 1.4 }}>{it.title}</p>
              <p className="mt-1" style={{ color: '#6b6559', fontStyle: 'italic' }}>{it.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}