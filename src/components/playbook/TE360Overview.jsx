import React from 'react';
import { Database, Network, Search, Zap, ShieldAlert, Layers } from 'lucide-react';

const LAYERS = [
  { Icon: Database,    title: 'PostgreSQL',     body: 'System of record. Evidence, Claim, Entity + link tables in this app map to that schema.' },
  { Icon: Network,     title: 'Neo4j',          title2: '(planned)', body: 'Property graph of people / places / orgs / archives. Use Entity registry below to seed nodes.' },
  { Icon: Search,      title: 'OpenSearch',     title2: '(planned)', body: 'Keyword + faceted dashboards over OCR text. Spanish + English indices.' },
  { Icon: Zap,         title: 'Qdrant',         title2: '(planned)', body: 'Semantic / fuzzy match — Terminel ↔ Terminal, Avina ↔ Aviana.' },
  { Icon: Layers,      title: 'S3 / MinIO',     title2: '(planned)', body: 'Immutable originals with versioning. SHA-256 stored on every Evidence row.' },
  { Icon: ShieldAlert, title: 'Quarantine',     body: 'Prior AI outputs ingested as Evidence with contamination_score ≥ 60 → excluded from claims.' },
];

export default function TE360Overview() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {LAYERS.map(({ Icon, title, title2, body }) => (
        <div
          key={title}
          className="p-4 rounded"
          style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Icon className="w-4 h-4" style={{ color: '#1a1815' }} />
            <p
              style={{
                color: '#1a1815',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.72rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              {title}{' '}
              {title2 && (
                <span style={{ color: '#6b6559', fontSize: '0.6rem', textTransform: 'none', letterSpacing: 0 }}>
                  {title2}
                </span>
              )}
            </p>
          </div>
          <p className="text-xs" style={{ color: '#3a3530', lineHeight: 1.5 }}>
            {body}
          </p>
        </div>
      ))}
    </div>
  );
}