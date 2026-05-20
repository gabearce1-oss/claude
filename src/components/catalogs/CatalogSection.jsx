import React from 'react';
import CatalogItemRow from './CatalogItemRow';

export default function CatalogSection({ catalog, items, evidenceByItem, linksByItem }) {
  const totalEvidence = items.reduce((sum, it) => sum + (evidenceByItem[it.id]?.length || 0), 0);
  const totalVerified = items.reduce(
    (sum, it) => sum + (evidenceByItem[it.id]?.filter((e) => e.status === 'verified').length || 0),
    0
  );

  return (
    <section className="space-y-3">
      <div
        className="p-4 rounded flex items-baseline justify-between gap-4 flex-wrap"
        style={{ backgroundColor: catalog.color, color: '#f4ede0' }}
      >
        <div>
          <h2 className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond' }}>
            {catalog.label}
          </h2>
          <p className="text-xs mt-0.5" style={{ opacity: 0.85 }}>
            {catalog.description}
          </p>
        </div>
        <div
          className="text-xs"
          style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em' }}
        >
          {totalVerified} VERIFIED · {totalEvidence} LINKED · {items.length} FILMS
        </div>
      </div>

      <div className="space-y-2">
        {items.map((it) => (
          <CatalogItemRow
            key={it.id}
            item={it}
            evidence={evidenceByItem[it.id] || []}
            claimLinks={linksByItem[it.id] || []}
          />
        ))}
      </div>
    </section>
  );
}