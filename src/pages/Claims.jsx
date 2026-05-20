import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus } from 'lucide-react';
import { CLAIM_STATUS } from '../components/forensic/statusConfig';
import ClaimRow from '../components/claims/ClaimRow';
import ClaimModal from '../components/claims/ClaimModal';
import EvidenceLinkModal from '../components/claims/EvidenceLinkModal';
import SemanticSearchBox from '../components/ml/SemanticSearchBox';

export default function ClaimsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [linkingClaim, setLinkingClaim] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: claims = [] } = useQuery({
    queryKey: ['claims'],
    queryFn: () => base44.entities.Claim.list('-created_date'),
  });
  const { data: evidence = [] } = useQuery({
    queryKey: ['evidence'],
    queryFn: () => base44.entities.Evidence.list(),
  });
  const { data: links = [] } = useQuery({
    queryKey: ['evidenceClaimLinks'],
    queryFn: () => base44.entities.EvidenceClaimLink.list(),
  });

  const createClaim = useMutation({
    mutationFn: (data) => base44.entities.Claim.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['claims'] }); setShowModal(false); setEditing(null); },
  });
  const updateClaim = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Claim.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['claims'] }); setShowModal(false); setEditing(null); },
  });
  const deleteClaim = useMutation({
    mutationFn: (id) => base44.entities.Claim.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['claims'] }),
  });
  const togglePin = useMutation({
    mutationFn: (claim) =>
      base44.entities.Claim.update(claim.id, { is_foundational: !claim.is_foundational }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['claims'] }),
  });
  const createLink = useMutation({
    mutationFn: (data) => base44.entities.EvidenceClaimLink.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['evidenceClaimLinks'] }),
  });
  const deleteLink = useMutation({
    mutationFn: (id) => base44.entities.EvidenceClaimLink.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['evidenceClaimLinks'] }),
  });

  const linksByClaim = useMemo(() => {
    const m = {};
    links.forEach((l) => { (m[l.claim_id] ||= []).push(l); });
    return m;
  }, [links]);

  const filtered = filterStatus === 'all' ? claims : claims.filter((c) => c.status === filterStatus);

  const matrix = useMemo(() => {
    const counts = {};
    Object.keys(CLAIM_STATUS).forEach((k) => { counts[k] = 0; });
    claims.forEach((c) => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return counts;
  }, [claims]);

  const handleSubmit = (data) => {
    if (editing) updateClaim.mutate({ id: editing.id, data });
    else createClaim.mutate(data);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4ede0' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="border-b" style={{ borderColor: '#d4cdb8' }}>
        <div className="max-w-7xl mx-auto px-8 py-8">
          <Link to="/" className="text-xs inline-flex items-center gap-2 mb-4 hover:opacity-70" style={{ color: '#6b6559' }}>
            <ArrowLeft className="w-3 h-3" /> Back to Case File
          </Link>
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl font-light" style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}>Claim Engine</h1>
              <p className="text-sm mt-1" style={{ color: '#6b6559' }}>
                Every formal assertion · evidence-linked · status-tracked
              </p>
            </div>
            <button
              onClick={() => { setEditing(null); setShowModal(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm"
              style={{ backgroundColor: '#1a1815', color: '#f4ede0' }}
            >
              <Plus className="w-4 h-4" /> New Claim
            </button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
        {/* Status matrix */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className="p-3 rounded text-left"
            style={{
              backgroundColor: filterStatus === 'all' ? '#1a1815' : '#ffffff',
              color: filterStatus === 'all' ? '#f4ede0' : '#1a1815',
              border: '1px solid #d4cdb8',
            }}
          >
            <p className="text-xs uppercase tracking-wider" style={{ opacity: 0.7 }}>All</p>
            <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond' }}>{claims.length}</p>
          </button>
          {Object.entries(CLAIM_STATUS).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setFilterStatus(k)}
              className="p-3 rounded text-left"
              style={{
                backgroundColor: filterStatus === k ? v.color : '#ffffff',
                color: filterStatus === k ? '#f4ede0' : '#1a1815',
                border: `1px solid ${v.color}`,
              }}
            >
              <p className="text-xs uppercase tracking-wider" style={{ opacity: 0.7 }}>{v.label}</p>
              <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond' }}>{matrix[k] || 0}</p>
            </button>
          ))}
        </div>

        {/* Semantic search */}
        <div
          className="p-5 rounded mb-6"
          style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
        >
          <SemanticSearchBox
            rows={(claims || []).map((c) => ({
              id: c.id,
              text: [c.claim_text, c.subject, c.predicate, c.rationale, (c.needed_proof || []).join(' ')]
                .filter(Boolean).join(' · '),
              subject: c.subject,
              status: c.status,
              claim_text: c.claim_text,
            }))}
            placeholder='Search claims by meaning… e.g. "concubine no property rights"'
            renderResult={({ row, score }) => (
              <div
                className="px-3 py-2 rounded cursor-pointer hover:opacity-90"
                style={{ backgroundColor: '#f9f5ed', border: '1px solid #d4cdb8' }}
                onClick={() => {
                  const claim = (claims || []).find((c) => c.id === row.id);
                  if (claim) { setEditing(claim); setShowModal(true); }
                }}
              >
                <div className="flex items-baseline justify-between gap-3 flex-wrap mb-0.5">
                  <span
                    className="text-xs"
                    style={{ color: '#1a1815', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}
                  >
                    {row.subject || row.id.slice(0, 8)} · {row.status || 'unset'}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: '#6b6559', fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    sim {(score * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-sm" style={{ color: '#1a1815', lineHeight: 1.45 }}>
                  {(row.claim_text || '').slice(0, 200)}
                  {(row.claim_text || '').length > 200 ? '…' : ''}
                </p>
              </div>
            )}
          />
        </div>

        {/* Claim list */}
        {filtered.length === 0 ? (
          <div className="p-10 rounded text-center" style={{ backgroundColor: '#ffffff', border: '1px dashed #d4cdb8' }}>
            <p style={{ color: '#6b6559' }}>
              No claims {filterStatus !== 'all' ? `with status "${CLAIM_STATUS[filterStatus]?.label}"` : 'yet'}.
              Click <strong>New Claim</strong> to start formalizing assertions.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => (
              <ClaimRow
                key={c.id}
                claim={c}
                linkCount={(linksByClaim[c.id] || []).length}
                onEdit={(claim) => { setEditing(claim); setShowModal(true); }}
                onDelete={(claim) => { if (window.confirm('Delete this claim?')) deleteClaim.mutate(claim.id); }}
                onLink={(claim) => setLinkingClaim(claim)}
                onTogglePin={(claim) => togglePin.mutate(claim)}
              />
            ))}
          </div>
        )}
      </div>

      <ClaimModal
        open={showModal}
        initial={editing}
        onClose={() => { setShowModal(false); setEditing(null); }}
        onSubmit={handleSubmit}
      />
      <EvidenceLinkModal
        open={!!linkingClaim}
        claim={linkingClaim}
        allEvidence={evidence}
        existingLinks={linkingClaim ? (linksByClaim[linkingClaim.id] || []) : []}
        onClose={() => setLinkingClaim(null)}
        onCreate={(d) => createLink.mutate(d)}
        onDelete={(l) => deleteLink.mutate(l.id)}
      />
    </div>
  );
}