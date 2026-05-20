import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Link2, CheckCircle2, Clock } from 'lucide-react';

const STATUS_STYLE = {
  not_started: { label: 'Not Started', bg: '#ebe1ce', fg: '#6b6559', Icon: Clock },
  in_progress: { label: 'Browsing',    bg: '#e8dcc0', fg: '#7a5c3a', Icon: FileText },
  linked:      { label: 'Linked',      bg: '#d4e4d4', fg: '#3a5c3a', Icon: Link2 },
  verified:    { label: 'Verified',    bg: '#c8d9c8', fg: '#1a4a1a', Icon: CheckCircle2 },
};

export default function CatalogItemRow({ item, evidence, claimLinks }) {
  const [expanded, setExpanded] = useState(false);

  // Compute status from linked evidence
  let status = 'not_started';
  if (evidence.length > 0) {
    status = evidence.some((e) => e.status === 'verified') ? 'verified' : 'linked';
  } else if (claimLinks.length > 0) {
    status = 'in_progress';
  }

  const linkedClaimCount = new Set(claimLinks.map((l) => l.claim_id)).size;
  const cfg = STATUS_STYLE[status];
  const Icon = cfg.Icon;

  return (
    <div className="rounded" style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full p-4 flex items-start gap-3 text-left hover:opacity-90"
      >
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs"
          style={{ backgroundColor: '#1a1815', color: '#f4ede0', fontFamily: 'JetBrains Mono, monospace' }}
        >
          {item.priority}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span
              className="text-xs"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.15em',
                color: '#6b6559',
                textTransform: 'uppercase',
              }}
            >
              Film {item.film}
            </span>
            <span style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond', fontSize: '1.25rem' }}>
              {item.record_type} {item.date_range}
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: '#3a3530' }}>
            {item.rationale}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs"
            style={{ backgroundColor: cfg.bg, color: cfg.fg }}
          >
            <Icon className="w-3 h-3" />
            {cfg.label}
          </div>
          {expanded ? <ChevronDown className="w-4 h-4" style={{ color: '#6b6559' }} /> : <ChevronRight className="w-4 h-4" style={{ color: '#6b6559' }} />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: '#ebe1ce' }}>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <Stat label="Evidence" value={evidence.length} />
            <Stat label="Verified" value={evidence.filter((e) => e.status === 'verified').length} />
            <Stat label="Linked Claims" value={linkedClaimCount} />
          </div>

          {evidence.length === 0 ? (
            <p className="text-xs" style={{ color: '#6b6559', fontStyle: 'italic' }}>
              No evidence linked yet. Browse this film and create Evidence records tagged
              with film <code>{item.film}</code> or the record type to populate this view.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {evidence.map((e) => (
                <li key={e.id} className="text-sm flex items-baseline gap-2">
                  <span
                    className="px-1.5 py-0.5 rounded text-xs"
                    style={{
                      backgroundColor: e.status === 'verified' ? '#c8d9c8' : '#ebe1ce',
                      color: e.status === 'verified' ? '#1a4a1a' : '#6b6559',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    {e.status}
                  </span>
                  <span style={{ color: '#3a3530' }}>
                    <strong>{e.evidence_number || '—'}</strong> · {e.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="p-2 rounded" style={{ backgroundColor: '#f4ede0' }}>
      <p
        className="text-xs"
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.1em',
          color: '#6b6559',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </p>
      <p className="text-2xl font-light" style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}>
        {value}
      </p>
    </div>
  );
}