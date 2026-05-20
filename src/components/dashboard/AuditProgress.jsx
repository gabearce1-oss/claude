import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AuditProgress({ allEvidence, allClaims = [], verifiedOnly, setVerifiedOnly }) {
  const stats = useMemo(() => {
    // Evidence breakdown
    const evTotal = allEvidence.length;
    const evByStatus = { unreviewed: 0, reviewed: 0, verified: 0, disputed: 0, archived: 0 };
    allEvidence.forEach((e) => {
      if (evByStatus[e.status] !== undefined) evByStatus[e.status] += 1;
    });
    const evVerified = evByStatus.verified;
    const evAudited = evVerified + evByStatus.reviewed + evByStatus.disputed;
    const evPct = evTotal > 0 ? Math.round((evVerified / evTotal) * 100) : 0;
    const evAuditedPct = evTotal > 0 ? Math.round((evAudited / evTotal) * 100) : 0;

    // Claims breakdown (status enum: verified, corroborated, plausible, weak_lead, fabricated_risk, rejected, unverified)
    const clTotal = allClaims.length;
    const clByStatus = {
      verified: 0,
      corroborated: 0,
      plausible: 0,
      weak_lead: 0,
      fabricated_risk: 0,
      rejected: 0,
      unverified: 0,
    };
    allClaims.forEach((c) => {
      if (clByStatus[c.status] !== undefined) clByStatus[c.status] += 1;
    });
    const clVerified = clByStatus.verified;
    const clPct = clTotal > 0 ? Math.round((clVerified / clTotal) * 100) : 0;

    // Combined overall
    const combinedTotal = evTotal + clTotal;
    const combinedVerified = evVerified + clVerified;
    const combinedPct = combinedTotal > 0 ? Math.round((combinedVerified / combinedTotal) * 100) : 0;

    return {
      evTotal,
      evVerified,
      evReviewed: evByStatus.reviewed,
      evDisputed: evByStatus.disputed,
      evUnreviewed: evByStatus.unreviewed,
      evPct,
      evAuditedPct,
      clTotal,
      clVerified,
      clByStatus,
      clPct,
      combinedTotal,
      combinedVerified,
      combinedPct,
    };
  }, [allEvidence, allClaims]);

  const evidenceSegments = [
    { key: 'verified', count: stats.evVerified, color: '#6b8e6f', label: 'Verified' },
    { key: 'reviewed', count: stats.evReviewed, color: '#b8a685', label: 'Reviewed' },
    { key: 'disputed', count: stats.evDisputed, color: '#c97761', label: 'Disputed' },
    { key: 'unreviewed', count: stats.evUnreviewed, color: '#d4cdb8', label: 'Unreviewed' },
  ];

  const claimsSegments = [
    { key: 'verified', count: stats.clByStatus.verified, color: '#6b8e6f', label: 'Verified' },
    { key: 'corroborated', count: stats.clByStatus.corroborated, color: '#8aa687', label: 'Corroborated' },
    { key: 'plausible', count: stats.clByStatus.plausible, color: '#b8a685', label: 'Plausible' },
    { key: 'weak_lead', count: stats.clByStatus.weak_lead, color: '#d4cdb8', label: 'Weak lead' },
    { key: 'fabricated_risk', count: stats.clByStatus.fabricated_risk, color: '#c97761', label: 'Fabrication risk' },
    { key: 'rejected', count: stats.clByStatus.rejected, color: '#6b6559', label: 'Rejected' },
    { key: 'unverified', count: stats.clByStatus.unverified, color: '#e8e0cd', label: 'Unverified' },
  ];

  const renderTrack = (label, segments, total, verified, pct, accentNote) => (
    <div className="mb-5">
      <div className="flex items-baseline justify-between mb-2 gap-2 flex-wrap">
        <p
          className="text-xs"
          style={{
            color: '#1a1815',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </p>
        <p className="text-xs" style={{ color: '#6b6559' }}>
          <strong style={{ color: '#1a1815' }}>{pct}%</strong> verified · {verified} of {total}
          {accentNote ? ` · ${accentNote}` : ''}
        </p>
      </div>
      <div
        className="w-full h-2.5 rounded-full overflow-hidden flex"
        style={{ backgroundColor: '#f9f5ed' }}
      >
        {total > 0 &&
          segments.map((s) => {
            const width = (s.count / total) * 100;
            if (width === 0) return null;
            return (
              <motion.div
                key={s.key}
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ backgroundColor: s.color, height: '100%' }}
                title={`${s.label}: ${s.count}`}
              />
            );
          })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
        {segments
          .filter((s) => s.count > 0)
          .map((s) => (
            <div key={s.key} className="flex items-center gap-1.5 text-xs">
              <span
                className="inline-block rounded-full"
                style={{ width: 8, height: 8, backgroundColor: s.color }}
              />
              <span style={{ color: '#1a1815' }}>
                {s.label} <span style={{ color: '#6b6559' }}>· {s.count}</span>
              </span>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded mb-8"
      style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
    >
      <div className="flex justify-between items-start mb-5 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#1a1815' }}
          >
            <ShieldCheck className="w-5 h-5" style={{ color: '#f4ede0' }} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider" style={{ color: '#6b6559' }}>
              Case file audit progress
            </p>
            <p className="text-sm" style={{ color: '#1a1815' }}>
              Combined Evidence + Claims · {stats.combinedVerified} of {stats.combinedTotal} verified
            </p>
          </div>
        </div>

        <button
          onClick={() => setVerifiedOnly(!verifiedOnly)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-opacity"
          style={{
            backgroundColor: verifiedOnly ? '#6b8e6f' : '#ffffff',
            color: verifiedOnly ? '#ffffff' : '#1a1815',
            border: `1px solid ${verifiedOnly ? '#6b8e6f' : '#1a1815'}`,
          }}
        >
          {verifiedOnly ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {verifiedOnly ? 'Showing verified only' : 'Show verified only'}
        </button>
      </div>

      {/* Big combined percentage */}
      <div className="flex items-baseline gap-3 mb-6">
        <p
          className="text-6xl font-light"
          style={{ color: '#6b8e6f', fontFamily: 'Cormorant Garamond', lineHeight: 1 }}
        >
          {stats.combinedPct}%
        </p>
        <p className="text-sm" style={{ color: '#6b6559' }}>
          overall verified across the case file
        </p>
      </div>

      {/* Per-track bars */}
      {renderTrack(
        'Evidence',
        evidenceSegments,
        stats.evTotal,
        stats.evVerified,
        stats.evPct,
        `${stats.evAuditedPct}% reviewed`,
      )}
      {renderTrack('Claims', claimsSegments, stats.clTotal, stats.clVerified, stats.clPct, null)}

      {/* Caveat when filtering active */}
      {verifiedOnly && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 p-3 rounded flex gap-2 text-xs"
          style={{ backgroundColor: '#f0f5f2', border: '1px solid #6b8e6f' }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#6b8e6f' }} />
          <p style={{ color: '#1a1815', lineHeight: 1.5 }}>
            Evidence dashboard is filtered to <strong>verified</strong> records only. Unreviewed, reviewed, disputed, and archived
            items are hidden from the table and statistics below. {stats.evTotal - stats.evVerified} item
            {stats.evTotal - stats.evVerified === 1 ? '' : 's'} hidden.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}