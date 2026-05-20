import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, ArrowLeftRight } from 'lucide-react';
import EvidencePane from '../components/verify/EvidencePane';
import ChecklistPane from '../components/verify/ChecklistPane';

export default function VerifyPage() {
  const { evidenceId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: evidence, isLoading } = useQuery({
    queryKey: ['evidence', evidenceId],
    queryFn: async () => {
      // Fallback: list and find — keeps it simple without assuming a single-get method.
      const all = await base44.entities.Evidence.list();
      return all.find((e) => e.id === evidenceId);
    },
  });

  const { data: links = [] } = useQuery({
    queryKey: ['evidenceClaimLinks', evidenceId],
    queryFn: () => base44.entities.EvidenceClaimLink.filter({ evidence_id: evidenceId }),
  });

  const { data: claims = [] } = useQuery({
    queryKey: ['claims'],
    queryFn: () => base44.entities.Claim.list(),
  });

  const updateStatus = useMutation({
    mutationFn: (newStatus) => base44.entities.Evidence.update(evidenceId, { status: newStatus }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['evidence'] });
      qc.invalidateQueries({ queryKey: ['evidence', evidenceId] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f4ede0' }}>
        <p style={{ color: '#6b6559' }}>Loading evidence…</p>
      </div>
    );
  }

  if (!evidence) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ backgroundColor: '#f4ede0' }}>
        <p style={{ color: '#1a1815' }}>Evidence record not found.</p>
        <Link to="/" className="text-xs underline" style={{ color: '#6b6559' }}>Back to Case File</Link>
      </div>
    );
  }

  const linkedClaims = links.map((l) => ({
    link: l,
    claim: claims.find((c) => c.id === l.claim_id),
  }));

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#f4ede0' }}>
      {/* Top bar */}
      <div className="px-6 py-3 border-b flex items-center gap-3 flex-shrink-0" style={{ borderColor: '#d4cdb8' }}>
        <button onClick={() => navigate(-1)} className="text-xs inline-flex items-center gap-2 hover:opacity-70" style={{ color: '#6b6559' }}>
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
        <ArrowLeftRight className="w-4 h-4" style={{ color: '#1a1815' }} />
        <p className="text-sm" style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontSize: '1.1rem' }}>
          Side-by-Side Verification
        </p>
        <span className="ml-auto text-xs" style={{ color: '#6b6559', fontFamily: 'JetBrains Mono, monospace' }}>
          {evidence.evidence_number}
        </span>
      </div>

      {/* Split panes */}
      <div className="flex-1 grid lg:grid-cols-2 grid-cols-1 overflow-hidden">
        <div className="border-r overflow-hidden" style={{ borderColor: '#d4cdb8' }}>
          <EvidencePane evidence={evidence} />
        </div>
        <div className="overflow-hidden">
          <ChecklistPane
            evidence={evidence}
            linkedClaims={linkedClaims}
            onUpdateStatus={(newStatus) => updateStatus.mutate(newStatus)}
          />
        </div>
      </div>
    </div>
  );
}