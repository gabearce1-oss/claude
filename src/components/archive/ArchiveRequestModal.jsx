import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ARCHIVE_SOURCES, REQUEST_STATUS } from '../forensic/statusConfig';

const EMPTY = {
  case_id: 'Terminel-Sagasta',
  request_number: '',
  source: 'AGN',
  record_target: '',
  query_used: '',
  submitted_date: '',
  follow_up_due: '',
  status: 'planned',
  result_summary: '',
  notes: '',
};

export default function ArchiveRequestModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) setForm(initial ? { ...EMPTY, ...initial } : EMPTY);
  }, [open, initial]);

  if (!open) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(26,24,21,0.6)' }}>
      <div className="w-full max-w-xl rounded p-6 max-h-[90vh] overflow-auto" style={{ backgroundColor: '#f9f5ed', border: '1px solid #1a1815' }}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-light" style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}>
            {initial ? 'Edit Request' : 'New Archive Request'}
          </h2>
          <button onClick={onClose} style={{ color: '#6b6559' }}><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#6b6559' }}>Request #</label>
              <input
                type="text" value={form.request_number}
                onChange={(e) => set('request_number', e.target.value)}
                placeholder="AR-001"
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#6b6559' }}>Source *</label>
              <select
                value={form.source}
                onChange={(e) => set('source', e.target.value)}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
              >
                {ARCHIVE_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#6b6559' }}>Record target *</label>
            <input
              type="text" value={form.record_target}
              onChange={(e) => set('record_target', e.target.value)}
              placeholder="e.g., escritura / parish register"
              className="w-full px-3 py-2 rounded border text-sm"
              style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#6b6559' }}>Query used</label>
            <textarea
              value={form.query_used}
              onChange={(e) => set('query_used', e.target.value)}
              rows={2}
              placeholder='e.g., "San Javier" AND escritura AND Sagasta'
              className="w-full px-3 py-2 rounded border text-sm font-mono"
              style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#6b6559' }}>Submitted</label>
              <input
                type="date" value={form.submitted_date}
                onChange={(e) => set('submitted_date', e.target.value)}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#6b6559' }}>Follow-up</label>
              <input
                type="date" value={form.follow_up_due}
                onChange={(e) => set('follow_up_due', e.target.value)}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#6b6559' }}>Status</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
              >
                {Object.entries(REQUEST_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#6b6559' }}>Result summary</label>
            <textarea
              value={form.result_summary}
              onChange={(e) => set('result_summary', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded border text-sm"
              style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="text-sm px-4 py-2 rounded" style={{ backgroundColor: '#ffffff', color: '#1a1815', border: '1px solid #d4cdb8' }}>
            Cancel
          </button>
          <button
            onClick={() => onSubmit(form)}
            disabled={!form.source || !form.record_target}
            className="text-sm px-4 py-2 rounded disabled:opacity-50"
            style={{ backgroundColor: '#1a1815', color: '#f4ede0' }}
          >
            {initial ? 'Save Changes' : 'Create Request'}
          </button>
        </div>
      </div>
    </div>
  );
}