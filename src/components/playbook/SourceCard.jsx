import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import QueryRow from './QueryRow';
import ChronAmIngestPanel from './ChronAmIngestPanel';

const PRIORITY_COLORS = {
  P1: { bg: '#e8efe2', fg: '#4a5d3a', label: 'Priority 1' },
  P2: { bg: '#e8eef2', fg: '#5a6b7a', label: 'Priority 2' },
  P3: { bg: '#f3ead8', fg: '#8a6e3c', label: 'Priority 3' },
};

export default function SourceCard({ source, filter, onCreateRequest }) {
  const [open, setOpen] = useState(true);
  const pr = PRIORITY_COLORS[source.priority] || PRIORITY_COLORS.P2;

  const filteredGroups = useMemo(() => {
    if (!filter) return source.groups;
    const f = filter.toLowerCase();
    return source.groups
      .map((g) => ({ ...g, queries: g.queries.filter((q) => q.toLowerCase().includes(f)) }))
      .filter((g) => g.queries.length > 0);
  }, [source.groups, filter]);

  if (filter && filteredGroups.length === 0) return null;

  return (
    <div className="rounded" style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full p-4 flex items-start gap-3 text-left"
      >
        {open ? (
          <ChevronDown className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#6b6559' }} />
        ) : (
          <ChevronRight className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#6b6559' }} />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{
                backgroundColor: pr.bg,
                color: pr.fg,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
              }}
            >
              {pr.label}
            </span>
            <h3 className="text-lg" style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}>
              {source.full_name}
            </h3>
            <span className="text-xs" style={{ color: '#6b6559', fontFamily: 'JetBrains Mono, monospace' }}>
              {source.language} · {source.auth}
            </span>
          </div>
          <p className="text-xs" style={{ color: '#6b6559', lineHeight: 1.5 }}>
            {source.description}
          </p>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {(source.id === 'loc' || source.id === 'chronicling_america') && <ChronAmIngestPanel />}
          {filteredGroups.map((g) => (
            <div key={g.label}>
              <p
                className="text-xs mb-2"
                style={{
                  color: '#3a3530',
                  fontFamily: 'JetBrains Mono, monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  fontSize: '0.65rem',
                }}
              >
                {g.label}
              </p>
              <div className="space-y-1.5">
                {g.queries.map((q) => (
                  <QueryRow
                    key={q}
                    query={q}
                    searchUrl={source.search_url ? source.search_url(q) : null}
                    onCreateRequest={(query) => onCreateRequest(source, query)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}