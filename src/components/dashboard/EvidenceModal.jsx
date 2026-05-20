import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function EvidenceModal({ isOpen, onClose, editingId }) {
  const [formData, setFormData] = useState({
    case_id: 'Terminel-Sagasta',
    evidence_number: '',
    title: '',
    description: '',
    type: 'document',
    status: 'unreviewed',
    date_acquired: new Date().toISOString().split('T')[0],
    date_created: '',
    source: '',
    location: '',
    tags: '',
    related_people: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  const { data: editingEvidence } = useQuery({
    queryKey: ['evidence', editingId],
    queryFn: () => editingId ? base44.entities.Evidence.get(editingId) : null,
    enabled: !!editingId
  });

  useEffect(() => {
    if (editingEvidence) {
      setFormData({
        ...editingEvidence,
        tags: editingEvidence.tags?.join(', ') || '',
        related_people: editingEvidence.related_people?.join(', ') || ''
      });
    }
  }, [editingEvidence]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Evidence.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidence'] });
      onClose();
      setFormData({
        case_id: 'Terminel-Sagasta',
        evidence_number: '',
        title: '',
        description: '',
        type: 'document',
        status: 'unreviewed',
        date_acquired: new Date().toISOString().split('T')[0],
        date_created: '',
        source: '',
        location: '',
        tags: '',
        related_people: '',
        notes: ''
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Evidence.update(editingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidence'] });
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
      related_people: formData.related_people ? formData.related_people.split(',').map(p => p.trim()).filter(p => p) : []
    };

    if (editingId) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded w-full max-w-2xl max-h-96 overflow-y-auto"
        style={{ backgroundColor: '#f4ede0' }}
      >
        <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: '#d4cdb8' }}>
          <h2 className="text-2xl font-light" style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}>
            {editingId ? 'Edit Evidence' : 'Add Evidence'}
          </h2>
          <button onClick={onClose} className="p-1">
            <X className="w-5 h-5" style={{ color: '#6b6559' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs block mb-1" style={{ color: '#6b6559' }}>Evidence Number *</label>
              <input
                type="text"
                required
                value={formData.evidence_number}
                onChange={(e) => setFormData({ ...formData, evidence_number: e.target.value })}
                className="w-full px-3 py-2 rounded border"
                style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
              />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: '#6b6559' }}>Type *</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 rounded border"
                style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
              >
                <option value="document">Document</option>
                <option value="photograph">Photograph</option>
                <option value="artifact">Artifact</option>
                <option value="testimony">Testimony</option>
                <option value="correspondence">Correspondence</option>
                <option value="report">Report</option>
                <option value="physical_item">Physical Item</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: '#6b6559' }}>Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded border"
                style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
              />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: '#6b6559' }}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded border"
                style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
              >
                <option value="unreviewed">Unreviewed</option>
                <option value="reviewed">Reviewed</option>
                <option value="verified">Verified</option>
                <option value="disputed">Disputed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: '#6b6559' }}>Date Created</label>
              <input
                type="date"
                value={formData.date_created}
                onChange={(e) => setFormData({ ...formData, date_created: e.target.value })}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
              />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: '#6b6559' }}>Date Acquired</label>
              <input
                type="date"
                value={formData.date_acquired}
                onChange={(e) => setFormData({ ...formData, date_acquired: e.target.value })}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs block mb-1" style={{ color: '#6b6559' }}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-3 py-2 rounded border"
              style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs block mb-1" style={{ color: '#6b6559' }}>Source</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 rounded border"
                style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
              />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: '#6b6559' }}>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 rounded border"
                style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs block mb-1" style={{ color: '#6b6559' }}>Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., witness, location, date"
              className="w-full px-3 py-2 rounded border"
              style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
            />
          </div>

          <div>
            <label className="text-xs block mb-1" style={{ color: '#6b6559' }}>Related People (comma-separated)</label>
            <input
              type="text"
              value={formData.related_people}
              onChange={(e) => setFormData({ ...formData, related_people: e.target.value })}
              placeholder="e.g., John Smith, Jane Doe"
              className="w-full px-3 py-2 rounded border"
              style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
            />
          </div>

          <div>
            <label className="text-xs block mb-1" style={{ color: '#6b6559' }}>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="2"
              className="w-full px-3 py-2 rounded border"
              style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border"
              style={{ borderColor: '#d4cdb8', color: '#1a1815' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded font-medium"
              style={{ backgroundColor: '#1a1815', color: '#f4ede0' }}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingId ? 'Update' : 'Add'} Evidence
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}