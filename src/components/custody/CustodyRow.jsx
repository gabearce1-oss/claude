import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight } from 'lucide-react';
import CustodyChain from './CustodyChain';
import { stageByKey } from './custodyConfig';

export default function CustodyRow({ evidence, onAdvance }) {
  const stage = stageByKey(evidence.chain_of_custody_status || 'draft');
  const nextOptions = ['draft', 'tracked', 'sealed', 'quarantined'].filter(
    (s) => s !== (evidence.chain_of_custody_status || 'draft')
  );

  return (
    <div
      className="p-4 rounded grid gap-3"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #d4cdb8',
        borderLeft: `4px solid ${stage.color}`,
      }}
    >
      <div className="flex justify-between items-start gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs px-2 py-0.5 rounded"
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
              {evidence.evidence_number}
            </span>
          </div>
          <p className="text-sm" style={{ color: '#1a1815', fontWeight: 500 }}>
            {evidence.title}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#6b6559' }}>
            {evidence.source || 'No source recorded'}
            {evidence.archive_name ? ` · ${evidence.archive_name}` : ''}
          </p>
        </div>

        <Link
          to={`/verify/${evidence.id}`}
          className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded flex-shrink-0"
          style={{ backgroundColor: '#1a1815', color: '#f4ede0' }}
        >
          <ArrowLeftRight className="w-3 h-3" /> Verify
        </Link>
      </div>

      <CustodyChain current={evidence.chain_of_custody_status || 'draft'} size="sm" />

      <div className="flex gap-1.5 flex-wrap">
        <span className="text-xs self-center" style={{ color: '#6b6559' }}>Advance to:</span>
        {nextOptions.map((opt) => {
          const optStage = stageByKey(opt);
          return (
            <button
              key={opt}
              onClick={() => onAdvance(evidence.id, opt)}
              className="text-xs px-2.5 py-1 rounded"
              style={{
                backgroundColor: '#ffffff',
                color: optStage.color,
                border: `1px solid ${optStage.color}`,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {optStage.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}