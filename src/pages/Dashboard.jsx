import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardTabs from '../components/dashboard/DashboardTabs';
import OverviewTab from '../components/dashboard/tabs/OverviewTab';
import EvidenceTab from '../components/dashboard/tabs/EvidenceTab';
import IntelligenceTab from '../components/dashboard/tabs/IntelligenceTab';
import CustodyTab from '../components/dashboard/tabs/CustodyTab';
import { listAll } from '@/lib/base44/pagination';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    dateFrom: null,
    dateTo: null,
    tags: [],
  });
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const { data: allEvidence = [], isLoading } = useQuery({
    queryKey: ['evidence'],
    queryFn: () => listAll(base44.entities.Evidence),
  });
  const { data: allClaims = [] } = useQuery({
    queryKey: ['claims'],
    queryFn: () => listAll(base44.entities.Claim),
  });

  const filteredEvidence = useMemo(() => {
    return allEvidence.filter((item) => {
      if (verifiedOnly && item.status !== 'verified') return false;

      if (filters.search) {
        const q = filters.search.toLowerCase();
        const match =
          item.title?.toLowerCase().includes(q) ||
          item.evidence_number?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.tags?.some((t) => t.toLowerCase().includes(q));
        if (!match) return false;
      }

      if (filters.type !== 'all' && item.type !== filters.type) return false;
      if (filters.status !== 'all' && item.status !== filters.status) return false;
      if (filters.dateFrom && new Date(item.date_created) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(item.date_created) > new Date(filters.dateTo)) return false;
      if (filters.tags.length > 0) {
        const ok = filters.tags.every((tag) => item.tags?.includes(tag));
        if (!ok) return false;
      }
      return true;
    });
  }, [allEvidence, filters, verifiedOnly]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4ede0' }}>
      <DashboardHeader />
      <DashboardTabs active={activeTab} onChange={setActiveTab} />

      <div className="max-w-7xl mx-auto px-8 py-8 pb-20">
        {activeTab === 'overview' && (
          <OverviewTab
            allEvidence={allEvidence}
            allClaims={allClaims}
            verifiedOnly={verifiedOnly}
            setVerifiedOnly={setVerifiedOnly}
          />
        )}
        {activeTab === 'evidence' && (
          <EvidenceTab
            filters={filters}
            setFilters={setFilters}
            filteredEvidence={filteredEvidence}
            isLoading={isLoading}
            selectedEvidence={selectedEvidence}
            setSelectedEvidence={setSelectedEvidence}
          />
        )}
        {activeTab === 'intelligence' && (
          <IntelligenceTab allEvidence={allEvidence} allClaims={allClaims} />
        )}
        {activeTab === 'custody' && <CustodyTab allEvidence={allEvidence} />}
      </div>
    </div>
  );
}