import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import FilterBar from '../FilterBar';
import EvidenceTable from '../EvidenceTable';
import SemanticSearchBox from '../../ml/SemanticSearchBox';
import EvidenceClusters from '../../ml/EvidenceClusters';

export default function EvidenceTab({
  filters,
  setFilters,
  filteredEvidence,
  isLoading,
  selectedEvidence,
  setSelectedEvidence,
}) {
  const rows = useMemo(
    () =>
      (filteredEvidence || []).map((e) => ({
        id: e.id,
        text: [e.title, e.description, e.notes, e.source, e.archive_name, e.collection_name, (e.tags || []).join(' ')]
          .filter(Boolean)
          .join(' · '),
        title: e.title || e.evidence_number || '(untitled)',
        evidence_number: e.evidence_number,
        status: e.status,
      })),
    [filteredEvidence]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <FilterBar filters={filters} setFilters={setFilters} />

      <div
        className="p-5 rounded"
        style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
      >
        <SemanticSearchBox
          rows={rows}
          placeholder='Search evidence by meaning… e.g. "1907 deed water rights"'
          renderResult={({ row, score }) => (
            <div
              className="px-3 py-2 rounded"
              style={{ backgroundColor: '#f9f5ed', border: '1px solid #d4cdb8' }}
            >
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <span className="text-sm" style={{ color: '#1a1815' }}>
                  <strong style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {row.evidence_number || row.id.slice(0, 8)}
                  </strong>{' '}
                  · {row.title}
                </span>
                <span
                  className="text-xs"
                  style={{ color: '#6b6559', fontFamily: 'JetBrains Mono, monospace' }}
                >
                  sim {(score * 100).toFixed(0)}% · {row.status || 'unset'}
                </span>
              </div>
            </div>
          )}
        />
      </div>

      <EvidenceClusters rows={rows} k={4} />

      <EvidenceTable
        evidence={filteredEvidence}
        isLoading={isLoading}
        selectedEvidence={selectedEvidence}
        setSelectedEvidence={setSelectedEvidence}
      />
    </motion.div>
  );
}
