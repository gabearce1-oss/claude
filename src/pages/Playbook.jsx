import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Search, BookOpen } from 'lucide-react';

import { playbookSources } from '../components/playbook/playbookData';
import SourceCard from '../components/playbook/SourceCard';
import TE360Overview from '../components/playbook/TE360Overview';
import EntityRegistry from '../components/playbook/EntityRegistry';

const ARCHIVE_REQUEST_SOURCES = new Set([
  'AGN', 'AHES', 'HNDM', 'Chronicling America', 'Library of Congress',
  'FamilySearch', 'UNISON', 'COLSON', 'Bancroft',
  'U Arizona Special Collections', 'NARA', 'Wells Fargo Archives',
]);

export default function PlaybookPage() {
  const [filter, setFilter] = useState('');
  const [priority, setPriority] = useState('all');
  const navigate = useNavigate();
  const qc = useQueryClient();

  const createRequest = useMutation({
    mutationFn: (data) => base44.entities.ArchiveRequest.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['archiveRequests'] }),
  });

  const handleCreateRequest = async (source, query) => {
    const sourceName = ARCHIVE_REQUEST_SOURCES.has(source.name) ? source.name : 'Other';
    await createRequest.mutateAsync({
      case_id: 'Terminel-Sagasta',
      source: sourceName,
      record_target: source.full_name,
      query_used: query,
      status: 'planned',
      notes: `Auto-created from playbook. Source: ${source.full_name}.`,
    });
    navigate('/archive-requests');
  };

  const visibleSources = useMemo(() => {
    return playbookSources.filter((s) => priority === 'all' || s.priority === priority);
  }, [priority]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4ede0' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b"
        style={{
          borderColor: '#d4cdb8',
          background: 'linear-gradient(180deg, #f4ede0 0%, #ebe1ce 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-8 py-10">
          <Link to="/" className="text-xs inline-flex items-center gap-2 mb-4 hover:opacity-70" style={{ color: '#6b6559' }}>
            <ArrowLeft className="w-3 h-3" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-5 h-5" style={{ color: '#1a1815' }} />
            <h1 className="text-4xl font-light" style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}>
              Research Playbook
            </h1>
          </div>
          <p className="text-sm max-w-3xl" style={{ color: '#6b6559', lineHeight: 1.55 }}>
            TruthEngine360 source program for the Terminel–Sagasta case. Copy queries, jump directly into each
            archive's search interface, or turn any query into a tracked Archive Request in one click.
          </p>
        </div>
      </motion.div>

      {/* TE360 architecture overview */}
      <div className="max-w-7xl mx-auto px-8 pt-8">
        <h2
          className="mb-3"
          style={{
            color: '#1a1815',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.72rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          TE360 Integration Layers
        </h2>
        <TE360Overview />
      </div>

      {/* Entity registry */}
      <div className="max-w-7xl mx-auto px-8 pt-8">
        <EntityRegistry />
      </div>

      {/* Source filter + search */}
      <div className="max-w-7xl mx-auto px-8 pt-10">
        <h2
          className="mb-3"
          style={{
            color: '#1a1815',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.72rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          Source Program & Query Playbook
        </h2>

        <div className="flex flex-wrap gap-2 items-center mb-4">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded flex-1 min-w-[240px]"
            style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
          >
            <Search className="w-4 h-4" style={{ color: '#6b6559' }} />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter queries… e.g. San Javier"
              className="flex-1 text-sm bg-transparent outline-none"
              style={{ color: '#1a1815' }}
            />
          </div>
          {['all', 'P1', 'P2', 'P3'].map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className="text-xs px-3 py-1.5 rounded"
              style={{
                backgroundColor: priority === p ? '#1a1815' : '#ffffff',
                color: priority === p ? '#f4ede0' : '#1a1815',
                border: '1px solid #1a1815',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.05em',
              }}
            >
              {p === 'all' ? 'All Sources' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Source cards */}
      <div className="max-w-7xl mx-auto px-8 pb-16 space-y-3">
        {visibleSources.map((s) => (
          <SourceCard
            key={s.id}
            source={s}
            filter={filter}
            onCreateRequest={handleCreateRequest}
          />
        ))}
      </div>
    </div>
  );
}