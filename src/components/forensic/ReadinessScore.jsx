import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Gauge } from 'lucide-react';

// Composite readiness: verified-share of evidence + verified+corroborated share of claims, minus quarantine penalty.
export default function ReadinessScore({ evidence = [], claims = [] }) {
  const stats = useMemo(() => {
    const evTotal = evidence.length;
    const evVerified = evidence.filter((e) => e.status === 'verified').length;
    const evQuarantined = evidence.filter(
      (e) => e.chain_of_custody_status === 'quarantined' || (e.contamination_score || 0) >= 60
    ).length;

    const clTotal = claims.length;
    const clStrong = claims.filter((c) => c.status === 'verified' || c.status === 'corroborated').length;
    const clRisk = claims.filter((c) => c.status === 'fabricated_risk').length;

    const evidenceShare = evTotal > 0 ? evVerified / evTotal : 0;
    const claimShare = clTotal > 0 ? clStrong / clTotal : 0;
    const penalty = evTotal + clTotal > 0 ? (evQuarantined + clRisk) / (evTotal + clTotal) : 0;

    const raw = (evidenceShare * 0.55 + claimShare * 0.45) - penalty * 0.3;
    const score = Math.max(0, Math.min(100, Math.round(raw * 100)));

    return { score, evTotal, evVerified, evQuarantined, clTotal, clStrong, clRisk };
  }, [evidence, claims]);

  const band =
    stats.score >= 70 ? { label: 'Strong', color: '#4a5d3a' } :
    stats.score >= 40 ? { label: 'Developing', color: '#8a6e3c' } :
                        { label: 'Early', color: '#6b1f1f' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded"
      style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Gauge className="w-4 h-4" style={{ color: '#1a1815' }} />
        <p className="text-xs uppercase tracking-wider" style={{ color: '#6b6559' }}>
          Evidence Readiness
        </p>
      </div>
      <div className="flex items-baseline gap-2">
        <p
          className="text-5xl font-light"
          style={{ color: band.color, fontFamily: 'Cormorant Garamond', lineHeight: 1 }}
        >
          {stats.score}
        </p>
        <p className="text-xs" style={{ color: '#6b6559' }}>/ 100 · {band.label}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs" style={{ color: '#1a1815' }}>
        <div>
          <span style={{ color: '#6b6559' }}>Evidence verified</span><br />
          <strong>{stats.evVerified}</strong> / {stats.evTotal}
        </div>
        <div>
          <span style={{ color: '#6b6559' }}>Claims strong</span><br />
          <strong>{stats.clStrong}</strong> / {stats.clTotal}
        </div>
        <div>
          <span style={{ color: '#6b6559' }}>Quarantined</span><br />
          <strong style={{ color: stats.evQuarantined > 0 ? '#6b1f1f' : '#1a1815' }}>{stats.evQuarantined}</strong>
        </div>
        <div>
          <span style={{ color: '#6b6559' }}>Fabricated-risk claims</span><br />
          <strong style={{ color: stats.clRisk > 0 ? '#6b1f1f' : '#1a1815' }}>{stats.clRisk}</strong>
        </div>
      </div>
    </motion.div>
  );
}