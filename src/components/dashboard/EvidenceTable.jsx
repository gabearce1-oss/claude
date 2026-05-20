import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Plus, ChevronDown, ArrowLeftRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import EvidenceModal from './EvidenceModal';

export default function EvidenceTable({ evidence, isLoading, selectedEvidence, setSelectedEvidence }) {
  const [sortKey, setSortKey] = useState('date_created');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Evidence.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['evidence'] })
  });

  const sorted = [...evidence].sort((a, b) => {
    const aVal = a[sortKey] || '';
    const bVal = b[sortKey] || '';
    
    if (typeof aVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const statusColors = {
    unreviewed: '#d4cdb8',
    reviewed: '#b8a685',
    verified: '#6b8e6f',
    disputed: '#c97761',
    archived: '#8a7b6f'
  };

  if (isLoading) {
    return <div style={{ color: '#6b6559' }}>Loading evidence...</div>;
  }

  return (
    <>
      {/* Add Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={() => {
          setEditingId(null);
          setShowModal(true);
        }}
        className="mb-6 px-4 py-2 rounded flex items-center gap-2 font-medium text-sm"
        style={{ backgroundColor: '#1a1815', color: '#f4ede0' }}
      >
        <Plus className="w-4 h-4" /> Add Evidence
      </motion.button>

      {/* Table */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="overflow-x-auto rounded"
        style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #d4cdb8', backgroundColor: '#f9f5ed' }}>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#1a1815' }}>
                <button onClick={() => handleSort('evidence_number')} className="flex items-center gap-2 hover:opacity-70">
                  Evidence #
                  {sortKey === 'evidence_number' && <ChevronDown className="w-3 h-3" />}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#1a1815' }}>
                <button onClick={() => handleSort('title')} className="flex items-center gap-2 hover:opacity-70">
                  Title
                  {sortKey === 'title' && <ChevronDown className="w-3 h-3" />}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#1a1815' }}>
                <button onClick={() => handleSort('type')} className="flex items-center gap-2 hover:opacity-70">
                  Type
                  {sortKey === 'type' && <ChevronDown className="w-3 h-3" />}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#1a1815' }}>
                <button onClick={() => handleSort('status')} className="flex items-center gap-2 hover:opacity-70">
                  Status
                  {sortKey === 'status' && <ChevronDown className="w-3 h-3" />}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#1a1815' }}>
                <button onClick={() => handleSort('date_created')} className="flex items-center gap-2 hover:opacity-70">
                  Date
                  {sortKey === 'date_created' && <ChevronDown className="w-3 h-3" />}
                </button>
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: '#1a1815' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item, idx) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.02 }}
                className="border-b hover:bg-opacity-50 cursor-pointer transition-colors"
                style={{ borderColor: '#d4cdb8' }}
                onClick={() => setSelectedEvidence(item)}
              >
                <td className="px-4 py-3 text-sm" style={{ color: '#1a1815' }}>
                  <span className="font-mono">{item.evidence_number}</span>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: '#1a1815' }}>
                  {item.title}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: '#6b6559' }}>
                  {item.type.replace(/_/g, ' ')}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: statusColors[item.status], color: '#ffffff' }}>
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: '#6b6559' }}>
                  {item.date_created ? new Date(item.date_created).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/verify/${item.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 hover:opacity-70"
                      title="Open split-screen verification"
                    >
                      <ArrowLeftRight className="w-4 h-4" style={{ color: '#1a1815' }} />
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(item.id);
                        setShowModal(true);
                      }}
                      className="p-1 hover:opacity-70"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" style={{ color: '#6b6559' }} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this evidence item?')) {
                          deleteMutation.mutate(item.id);
                        }
                      }}
                      className="p-1 hover:opacity-70"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" style={{ color: '#c97761' }} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <div className="p-8 text-center" style={{ color: '#6b6559' }}>
            No evidence items found.
          </div>
        )}
      </motion.div>

      {/* Selected Detail Panel */}
      {selectedEvidence && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mt-8 p-6 rounded"
          style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
        >
          <div className="flex justify-between items-start mb-4 gap-3">
            <h3 className="text-xl font-light" style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}>
              {selectedEvidence.title}
            </h3>
            <div className="flex items-center gap-2">
              <Link
                to={`/verify/${selectedEvidence.id}`}
                className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded"
                style={{ backgroundColor: '#1a1815', color: '#f4ede0' }}
              >
                <ArrowLeftRight className="w-3 h-3" /> Verify
              </Link>
              <button onClick={() => setSelectedEvidence(null)} className="text-lg" style={{ color: '#6b6559' }}>×</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs mb-1" style={{ color: '#6b6559' }}>Evidence Number</p>
              <p className="font-mono" style={{ color: '#1a1815' }}>{selectedEvidence.evidence_number}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: '#6b6559' }}>Source</p>
              <p style={{ color: '#1a1815' }}>{selectedEvidence.source || '—'}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: '#6b6559' }}>Date Created</p>
              <p style={{ color: '#1a1815' }}>{selectedEvidence.date_created ? new Date(selectedEvidence.date_created).toLocaleDateString() : '—'}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: '#6b6559' }}>Location</p>
              <p style={{ color: '#1a1815' }}>{selectedEvidence.location || '—'}</p>
            </div>
          </div>
          {selectedEvidence.description && (
            <div className="mt-6">
              <p className="text-xs mb-2" style={{ color: '#6b6559' }}>Description</p>
              <p style={{ color: '#1a1815', lineHeight: '1.6' }}>{selectedEvidence.description}</p>
            </div>
          )}
          {selectedEvidence.tags && selectedEvidence.tags.length > 0 && (
            <div className="mt-4">
              <p className="text-xs mb-2" style={{ color: '#6b6559' }}>Tags</p>
              <div className="flex flex-wrap gap-2">
                {selectedEvidence.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#e8e0d0', color: '#1a1815' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Modal */}
      <EvidenceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editingId={editingId}
      />
    </>
  );
}