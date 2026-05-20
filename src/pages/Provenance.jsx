import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowLeft, Search } from 'lucide-react';
import ProvenanceGraph from '../components/provenance/ProvenanceGraph';
import ProvenanceLegend from '../components/provenance/ProvenanceLegend';
import ProvenanceDetailPanel from '../components/provenance/ProvenanceDetailPanel';

export default function ProvenancePage() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterText, setFilterText] = useState('');

  const { data: evidence = [], isLoading: loadingE } = useQuery({
    queryKey: ['evidence'],
    queryFn: () => base44.entities.Evidence.list(),
  });
  const { data: documents = [], isLoading: loadingD } = useQuery({
    queryKey: ['knowledgeDocuments'],
    queryFn: () => base44.entities.KnowledgeDocument.list(),
  });

  const isLoading = loadingE || loadingD;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4ede0' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b"
        style={{ borderColor: '#d4cdb8' }}
      >
        <div className="max-w-7xl mx-auto px-8 py-8">
          <Link to="/" className="text-xs inline-flex items-center gap-2 mb-4 hover:opacity-70" style={{ color: '#6b6559' }}>
            <ArrowLeft className="w-3 h-3" /> Back to Case File
          </Link>
          <h1 className="text-4xl font-light mb-2" style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}>
            Provenance Map
          </h1>
          <p className="text-sm" style={{ color: '#6b6559' }}>
            Visual lineage of evidence, sources, and intelligence documents
          </p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-3 w-4 h-4" style={{ color: '#8a7b6f' }} />
          <input
            type="text"
            placeholder="Filter by title, tag, archive, or source…"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded border text-sm"
            style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
          />
        </div>

        <ProvenanceLegend />

        {isLoading ? (
          <p style={{ color: '#6b6559' }}>Loading provenance graph…</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            <ProvenanceGraph
              evidence={evidence}
              documents={documents}
              filterText={filterText}
              selectedNodeId={selectedNode?.id}
              onSelectNode={(n) => setSelectedNode(n)}
            />
            <div>
              {selectedNode ? (
                <ProvenanceDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
              ) : (
                <div className="p-6 rounded" style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}>
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#6b6559' }}>How to read this map</p>
                  <p className="text-sm" style={{ color: '#1a1815', lineHeight: 1.6 }}>
                    Intelligence documents (left) reference Evidence items (center), which in turn cite their Sources (right).
                    Solid green lines trace each evidence item to its declared source. Dashed brown lines show where a
                    knowledge document references an evidence item (by tag overlap or evidence number).
                  </p>
                  <p className="text-sm mt-3" style={{ color: '#1a1815', lineHeight: 1.6 }}>
                    Click any node to inspect its full provenance and isolate its connections.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}