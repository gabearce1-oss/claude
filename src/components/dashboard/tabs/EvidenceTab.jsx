import React from 'react';
import { motion } from 'framer-motion';
import FilterBar from '../FilterBar';
import EvidenceTable from '../EvidenceTable';

export default function EvidenceTab({
  filters,
  setFilters,
  filteredEvidence,
  isLoading,
  selectedEvidence,
  setSelectedEvidence,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <FilterBar filters={filters} setFilters={setFilters} />
      <EvidenceTable
        evidence={filteredEvidence}
        isLoading={isLoading}
        selectedEvidence={selectedEvidence}
        setSelectedEvidence={setSelectedEvidence}
      />
    </motion.div>
  );
}