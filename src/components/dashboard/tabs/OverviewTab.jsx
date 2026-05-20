import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DashboardStats from '../DashboardStats';
import AuditProgress from '../AuditProgress';
import KeyDocumentsPanel from '../KeyDocumentsPanel';
import PipesSummary from '../PipesSummary';
import ComponentStatusGrid from '../ComponentStatusGrid';
import ReadinessScore from '../../forensic/ReadinessScore';
import QuarantinePanel from '../../forensic/QuarantinePanel';
import CustodySummary from '../../custody/CustodySummary';
import CustodyChain from '../../custody/CustodyChain';
import AuditDriftBanner from '../../ml/AuditDriftBanner';
import { listAll } from '@/lib/base44/pagination';

export default function OverviewTab({ allEvidence, allClaims, verifiedOnly, setVerifiedOnly }) {
  const qc = useQueryClient();
  const { data: links = [] } = useQuery({
    queryKey: ['evidenceClaimLinks'],
    queryFn: () => listAll(base44.entities.EvidenceClaimLink),
  });
  const unpin = useMutation({
    mutationFn: (claim) =>
      base44.entities.Claim.update(claim.id, { is_foundational: false }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['claims'] }),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <AuditDriftBanner />

      <KeyDocumentsPanel claims={allClaims} links={links} onUnpin={(c) => unpin.mutate(c)} />

      <PipesSummary claims={allClaims} />

      <ComponentStatusGrid />

      <AuditProgress
        allEvidence={allEvidence}
        allClaims={allClaims}
        verifiedOnly={verifiedOnly}
        setVerifiedOnly={setVerifiedOnly}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <ReadinessScore evidence={allEvidence} claims={allClaims} />
        <QuarantinePanel evidence={allEvidence} claims={allClaims} />
      </div>

      <div
        className="p-5 rounded"
        style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
      >
        <div className="flex items-baseline justify-between mb-4 flex-wrap gap-3">
          <h3
            className="text-lg"
            style={{
              color: '#1a1815',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.72rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            Custody Pipeline
          </h3>
          <CustodyChain current="sealed" size="sm" />
        </div>
        <CustodySummary evidence={allEvidence} />
      </div>

      <DashboardStats evidence={allEvidence} allEvidence={allEvidence} />
    </motion.div>
  );
}