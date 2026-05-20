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

      {/* Working Notebook (external Perplexity Space) */}
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
          Working Notebook
        </h2>
        <a
          href="https://www.perplexity.ai/spaces/aviana-nela-terminel-sagasta-y-UGfhxZVBT4OogGKpHxmAbg"
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 rounded hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#ffffff', border: '1px solid #1a1815' }}
        >
          <div
            className="text-xs mb-2 inline-block px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: '#1a1815',
              color: '#f4ede0',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.1em',
              fontSize: '0.65rem',
            }}
          >
            Perplexity Space · External
          </div>
          <h3
            className="text-lg mb-1 font-light"
            style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}
          >
            Aviana &amp; Nela Terminel–Sagasta Workspace
          </h3>
          <p className="text-xs" style={{ color: '#6b6559', lineHeight: 1.55 }}>
            Live research notebook with the Deep Research threads behind the
            FINAL Intelligence Report, the master matrix, and the protocol
            iterations committed here. Auth-walled — opens in a new tab.
          </p>
        </a>
      </div>

      {/* Protocol Library */}
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
          Protocol Library
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              to: '/playbook/sha256',
              tag: 'TSK-006 · URGENT',
              title: 'SHA-256 Chain-of-Custody Protocol',
              desc: 'Photograph, name, hash, register. Execute before any other action.',
              band: '#6b1f1f',
            },
            {
              to: '/playbook/living-sources',
              tag: 'ORAL · URGENT',
              title: 'Living Oral-History Sources',
              desc: 'Carmelita Terango: oldest niece, first-generation testimony. Consent script + log. Living sources expire.',
              band: '#6b1f1f',
            },
            {
              to: '/playbook/familysearch',
              tag: 'TSK-001 / TSK-002',
              title: 'FamilySearch Browse Protocol',
              desc: 'Catalogs 704679 (civil) & 704681 (parish). Indigenous-notation hunt for IND-001.',
              band: '#4a5d3a',
            },
            {
              to: '/playbook/wells-fargo',
              tag: 'TSK-004',
              title: 'Wells Fargo Historical Services Letter',
              desc: 'Print-ready inquiry. MAC A0101-017, 420 Montgomery St, San Francisco.',
              band: '#8a6e3c',
            },
            {
              to: '/playbook/priority-actions',
              tag: 'Master Brief',
              title: 'Priority Action Execution Package',
              desc: 'TSK-001/002, TSK-004, TSK-005, TSK-006 + LAND-004/005. Model letters included.',
              band: '#1a1815',
            },
            {
              to: '/playbook/research-protocol',
              tag: 'DOCTRINE',
              title: 'Research Protocol — Omega Doctrine',
              desc: 'Five-gate admissibility · claim classification · adversarial verification · AI contamination firewall · reference-template integration.',
              band: '#1a1815',
            },
          ].map((p) => (
            <Link
              key={p.to}
              to={p.to}
              className="block p-4 rounded hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#ffffff', border: `1px solid ${p.band}` }}
            >
              <div
                className="text-xs mb-2 inline-block px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: p.band,
                  color: '#f4ede0',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.1em',
                  fontSize: '0.65rem',
                }}
              >
                {p.tag}
              </div>
              <h3
                className="text-lg mb-1 font-light"
                style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}
              >
                {p.title}
              </h3>
              <p className="text-xs" style={{ color: '#6b6559', lineHeight: 1.55 }}>
                {p.desc}
              </p>
            </Link>
          ))}
        </div>
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
          {['all', 'P0', 'P1', 'P2', 'P3'].map((p) => (
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