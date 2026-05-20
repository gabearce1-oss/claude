import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Lock } from 'lucide-react';
import CustodySummary from '../../custody/CustodySummary';
import CustodyChain from '../../custody/CustodyChain';
import { stageByKey } from '../../custody/custodyConfig';

export default function CustodyTab({ allEvidence }) {
  // Top 5 most-recently moved into a non-draft stage (or just most recent)
  const recent = [...allEvidence]
    .sort((a, b) => new Date(b.updated_date || 0) - new Date(a.updated_date || 0))
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div
        className="p-6 rounded"
        style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
      >
        <div className="flex items-baseline justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" style={{ color: '#1a1815' }} />
            <h3
              style={{
                color: '#1a1815',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.72rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              Chain-of-Custody Distribution
            </h3>
          </div>
          <Link
            to="/custody"
            className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded"
            style={{ backgroundColor: '#1a1815', color: '#f4ede0' }}
          >
            Full custody log <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="mb-5">
          <CustodyChain current="sealed" />
        </div>

        <CustodySummary evidence={allEvidence} />
      </div>

      <div
        className="p-5 rounded"
        style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
      >
        <h3
          className="mb-3"
          style={{
            color: '#1a1815',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.72rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          Recent Activity
        </h3>
        {recent.length === 0 ? (
          <p className="text-sm" style={{ color: '#6b6559' }}>No evidence records yet.</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: '#ebe1ce' }}>
            {recent.map((e) => {
              const stage = stageByKey(e.chain_of_custody_status || 'draft');
              return (
                <li key={e.id} className="py-3 flex items-center gap-3 flex-wrap">
                  <span
                    className="text-xs px-2 py-0.5 rounded flex-shrink-0"
                    style={{
                      backgroundColor: stage.bg,
                      color: stage.color,
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {stage.label}
                  </span>
                  <span className="text-xs" style={{ color: '#6b6559', fontFamily: 'JetBrains Mono, monospace' }}>
                    {e.evidence_number}
                  </span>
                  <span className="text-sm flex-1 min-w-0 truncate" style={{ color: '#1a1815' }}>
                    {e.title}
                  </span>
                  <Link
                    to={`/verify/${e.id}`}
                    className="text-xs hover:opacity-70"
                    style={{ color: '#3a3530' }}
                  >
                    Verify →
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </motion.div>
  );
}