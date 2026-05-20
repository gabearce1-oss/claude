import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus } from 'lucide-react';
import ArchiveRequestModal from '../components/archive/ArchiveRequestModal';
import ArchiveRequestTable from '../components/archive/ArchiveRequestTable';
import QueryPlaybookPanel from '../components/archive/QueryPlaybookPanel';
import { listAll } from '@/lib/base44/pagination';

export default function ArchiveRequestsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: requests = [] } = useQuery({
    queryKey: ['archiveRequests'],
    queryFn: () => listAll(base44.entities.ArchiveRequest, '-created_date'),
  });

  const create = useMutation({
    mutationFn: (d) => base44.entities.ArchiveRequest.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['archiveRequests'] }); setOpen(false); setEditing(null); },
  });
  const update = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ArchiveRequest.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['archiveRequests'] }); setOpen(false); setEditing(null); },
  });
  const remove = useMutation({
    mutationFn: (id) => base44.entities.ArchiveRequest.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['archiveRequests'] }),
  });

  const handleSubmit = (data) => {
    if (editing) update.mutate({ id: editing.id, data });
    else create.mutate(data);
  };

  const handleUseQuery = ({ source, query_used }) => {
    setEditing({ source, query_used, record_target: '', status: 'planned' });
    setOpen(true);
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
              <h1 className="text-4xl font-light" style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}>Archive Requests</h1>
              <p className="text-sm mt-1" style={{ color: '#6b6559' }}>
                Track every formal inquiry · AGN · HNDM · Bancroft · LoC · UNISON · COLSON · NARA · more
              </p>
            </div>
            <button
              onClick={() => { setEditing(null); setOpen(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm"
              style={{ backgroundColor: '#1a1815', color: '#f4ede0' }}
            >
              <Plus className="w-4 h-4" /> New Request
            </button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-8 py-8 grid gap-6 lg:grid-cols-[1fr_400px]">
        <ArchiveRequestTable
          requests={requests}
          onEdit={(r) => { setEditing(r); setOpen(true); }}
          onDelete={(r) => { if (window.confirm('Delete this request?')) remove.mutate(r.id); }}
        />
        <QueryPlaybookPanel onUseQuery={handleUseQuery} />
      </div>

      <ArchiveRequestModal
        open={open}
        initial={editing}
        onClose={() => { setOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}