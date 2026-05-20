import React from 'react';
import { motion } from 'framer-motion';
import { Pin, PinOff, Link2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CLAIM_STATUS } from '../forensic/statusConfig';

export default function KeyDocumentsPanel({ claims = [], links = [], onUnpin }) {
  const pinned = claims
    .filter((c) => c.is_foundational)
    .sort((a, b) => (b.confidence_score || 0) - (a.confidence_score || 0));

  if (pinned.length === 0) return null;

  const linkCountFor = (claimId) => links.filter((l) => l.claim_id === claimId).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded p-6 mb-6"
      style={{
        backgroundColor: '#1a1815',
        color: '#f4ede0',
        border: '1px solid #1a1815',
        backgroundImage:
          'linear-gradient(180deg, #1a1815 0%, #2a2520 100%)',
      }}
    >
      <div className="flex items-baseline justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Pin className="w-4 h-4" style={{ color: '#c44536' }} />
          <h3
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.72rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#f4ede0',
            }}
          >
            Key Documents · Foundational Claims
          </h3>
        </div>
        <span className="text-xs" style={{ color: '#c4b896' }}>
          {pinned.length} pinned
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {pinned.map((c) => {
          const s = CLAIM_STATUS[c.status] || CLAIM_STATUS.unverified;
          return (
            <div
              key={c.id}
              className="p-4 rounded"
              style={{
                backgroundColor: '#f4ede0',
                color: '#1a1815',
                borderLeft: `4px solid ${s.color}`,
              }}
            >
              <div className="flex items-baseline justify-between gap-2 mb-2 flex-wrap">
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: s.bg,
                    color: s.color,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {s.label}
                </span>
                <button
                  onClick={() => onUnpin && onUnpin(c)}
                  className="text-xs inline-flex items-center gap-1 hover:opacity-70"
                  style={{ color: '#6b6559' }}
                  title="Unpin from Key Documents"
                >
                  <PinOff className="w-3 h-3" /> unpin
                </button>
              </div>

              {c.foundational_note && (
                <p
                  className="text-xs mb-2"
                  style={{
                    color: '#c44536',
                    fontFamily: 'JetBrains Mono, monospace',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {c.foundational_note}
                </p>
              )}

              <p
                style={{
                  fontFamily: 'Cormorant Garamond',
                  fontSize: '1.15rem',
                  lineHeight: 1.3,
                  color: '#1a1815',
                }}
              >
                {c.claim_text}
              </p>

              <div className="flex items-center gap-3 mt-3 text-xs" style={{ color: '#6b6559' }}>
                <span>{c.claim_type}</span>
                <span>· confidence {c.confidence_score || 0}</span>
                <Link
                  to="/claims"
                  className="inline-flex items-center gap-1 hover:opacity-70"
                  style={{ color: '#1a1815' }}
                >
                  <Link2 className="w-3 h-3" /> {linkCountFor(c.id)} linked
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}