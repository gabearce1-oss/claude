import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

export default function ScoreSummary({ statuses, onReset }) {
  const counts = useMemo(() => {
    const vals = Object.values(statuses);
    return {
      clear: vals.filter((v) => v === 'clear').length,
      suspect: vals.filter((v) => v === 'suspect').length,
      triggered: vals.filter((v) => v === 'triggered').length,
      unmarked: 5 - vals.filter((v) => v && v !== 'unmarked').length,
    };
  }, [statuses]);

  const verdict = useMemo(() => {
    if (counts.triggered >= 3) {
      return {
        label: 'Do not retain',
        sub: 'Three or more triggered signals — this document actively contaminates the file.',
        color: '#c97761',
      };
    }
    if (counts.triggered >= 2) {
      return {
        label: 'Quarantine',
        sub: 'Two triggered signals — quarantine pending verification.',
        color: '#c97761',
      };
    }
    if (counts.suspect >= 1 || counts.triggered === 1) {
      return {
        label: 'Flag in inventory',
        sub: 'Document may stay in active inventory with a provenance flag.',
        color: '#b8a685',
      };
    }
    if (counts.unmarked === 5) {
      return {
        label: 'Walk the checklist',
        sub: 'Mark each pattern as clear, suspect, or triggered.',
        color: '#8a7b6f',
      };
    }
    return {
      label: 'Passes checklist',
      sub: 'Necessary but not sufficient — sources still need independent verification.',
      color: '#6b8e6f',
    };
  }, [counts]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 rounded"
      style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
    >
      <div className="flex justify-between items-start mb-4">
        <p className="text-xs uppercase tracking-wider" style={{ color: '#6b6559' }}>Audit verdict</p>
        <button
          onClick={onReset}
          className="text-xs flex items-center gap-1 hover:opacity-70"
          style={{ color: '#6b6559' }}
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      <h2
        className="text-3xl font-light mb-1"
        style={{ color: verdict.color, fontFamily: 'Cormorant Garamond' }}
      >
        {verdict.label}
      </h2>
      <p className="text-sm mb-5" style={{ color: '#6b6559' }}>{verdict.sub}</p>

      <div className="grid grid-cols-4 gap-3">
        {[
          { key: 'clear', label: 'Clear', color: '#6b8e6f' },
          { key: 'suspect', label: 'Suspect', color: '#b8a685' },
          { key: 'triggered', label: 'Triggered', color: '#c97761' },
          { key: 'unmarked', label: 'Unmarked', color: '#d4cdb8' },
        ].map((s) => (
          <div key={s.key} className="text-center p-3 rounded" style={{ backgroundColor: '#f9f5ed' }}>
            <p className="text-2xl font-light" style={{ color: s.color, fontFamily: 'Cormorant Garamond' }}>
              {counts[s.key]}
            </p>
            <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: '#6b6559' }}>{s.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}