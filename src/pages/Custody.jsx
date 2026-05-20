import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock } from 'lucide-react';
import CustodySummary from '../components/custody/CustodySummary';
import CustodyRow from '../components/custody/CustodyRow';
import CustodyChain from '../components/custody/CustodyChain';
import { CUSTODY_STAGES } from '../components/custody/custodyConfig';

export default function CustodyPage() {
  const [filter, setFilter] = useState('all');
  const qc = useQueryClient();

  const { data: evidence = [], isLoading } = useQuery({
    queryKey: ['evidence'],
    queryFn: () => base44.entities.Evidence.list(),
  });

  const advance = useMutation({
    mutationFn: ({ id, stage }) =>
      base44.entities.Evidence.update(id, { chain_of_custody_status: stage }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['evidence'] }),
  });

  const filtered = useMemo(() => {
    if (filter === 'all') return evidence;
    return evidence.filter((e) => (e.chain_of_custody_status || 'draft') === filter);
  }, [evidence, filter]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4ede0' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b"
        style={{ borderColor: '#d4cdb8' }}
      >
        <div className="max-w-7xl mx-auto px-8 py-10">
          <Link
            to="/"
            className="text-xs inline-flex items-center gap-2 mb-4 hover:opacity-70"
            style={{ color: '#6b6559' }}
          >
            <ArrowLeft className="w-3 h-3" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-5 h-5" style={{ color: '#1a1815' }} />
            <h1
              className="text-4xl font-light"
              style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}
            >
              Chain of Custody
            </h1>
          </div>
          <p className="text-sm max-w-2xl" style={{ color: '#6b6559', lineHeight: 1.55 }}>
            Track each evidence record from initial draft through verification and sealing.
            Quarantined items are excluded from forensic conclusions until reviewed.
          </p>

          <div className="mt-6">
            <CustodyChain current="sealed" />
          </div>
        </div>
      </motion.div>

      {/* Summary */}
      <div className="max-w-7xl mx-auto px-8 pt-8">
        <CustodySummary evidence={evidence} />
      </div>

      {/* Filter */}
      <div className="max-w-7xl mx-auto px-8 pt-6 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className="text-xs px-3 py-1.5 rounded"
          style={{
            backgroundColor: filter === 'all' ? '#1a1815' : '#ffffff',
            color: filter === 'all' ? '#f4ede0' : '#1a1815',
            border: '1px solid #1a1815',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          All ({evidence.length})
        </button>
        {CUSTODY_STAGES.map((s) => {
          const count = evidence.filter(
            (e) => (e.chain_of_custody_status || 'draft') === s.key
          ).length;
          const active = filter === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className="text-xs px-3 py-1.5 rounded"
              style={{
                backgroundColor: active ? s.color : '#ffffff',
                color: active ? '#ffffff' : s.color,
                border: `1px solid ${s.color}`,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Rows */}
      <div className="max-w-7xl mx-auto px-8 py-6 pb-16 space-y-3">
        {isLoading ? (
          <p style={{ color: '#6b6559' }}>Loading custody records…</p>
        ) : filtered.length === 0 ? (
          <div
            className="p-8 text-center rounded"
            style={{ backgroundColor: '#ffffff', border: '1px dashed #d4cdb8', color: '#6b6559' }}
          >
            No evidence in this stage.
          </div>
        ) : (
          filtered.map((e) => (
            <CustodyRow
              key={e.id}
              evidence={e}
              onAdvance={(id, stage) => advance.mutate({ id, stage })}
            />
          ))
        )}
      </div>
    </div>
  );
}