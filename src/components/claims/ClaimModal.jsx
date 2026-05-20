import React, { useState, useEffect } from 'react';
import { CLAIM_STATUS, CLAIM_TYPES } from '../forensic/statusConfig';
import { X } from 'lucide-react';

const EMPTY = {
  case_id: 'Terminel-Sagasta',
  claim_text: '',
  claim_type: 'other',
  status: 'unverified',
  confidence_score: 0,
  risk_score: 0,
  burden_of_proof: '',
  needed_proof: [],
  rationale: '',
  subject: '',
  predicate: '',
  object: '',
  contested: false,
};

export default function ClaimModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(EMPTY);
  const [needText, setNeedText] = useState('');

  useEffect(() => {
    if (open) setForm(initial ? { ...EMPTY, ...initial, needed_proof: initial.needed_proof || [] } : EMPTY);
  }, [open, initial]);

  if (!open) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(26,24,21,0.6)' }}>
      <div className="w-full max-w-2xl rounded p-6 max-h-[90vh] overflow-auto" style={{ backgroundColor: '#f9f5ed', border: '1px solid #1a1815' }}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-light" style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}>
            {initial ? 'Edit Claim' : 'New Claim'}
          </h2>
          <button onClick={onClose} style={{ color: '#6b6559' }}><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#6b6559' }}>Claim text *</label>
            <textarea
              value={form.claim_text}
              onChange={(e) => set('claim_text', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded border text-sm"
              style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#6b6559' }}>Type</label>
              <select
                value={form.claim_type}
                onChange={(e) => set('claim_type', e.target.value)}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
              >
                {CLAIM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#6b6559' }}>Status</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
              >
                {Object.entries(CLAIM_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#6b6559' }}>Confidence (0-100)</label>
              <input
                type="number" min={0} max={100}
                value={form.confidence_score}
                onChange={(e) => set('confidence_score', Number(e.target.value))}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#6b6559' }}>Risk (0-100)</label>
              <input
                type="number" min={0} max={100}
                value={form.risk_score}
                onChange={(e) => set('risk_score', Number(e.target.value))}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#6b6559' }}>Burden of proof *</label>
            <input
              type="text"
              value={form.burden_of_proof}
              onChange={(e) => set('burden_of_proof', e.target.value)}
              placeholder="What document or record would settle this?"
              className="w-full px-3 py-2 rounded border text-sm"
              style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#6b6559' }}>Needed proof (one per add)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={needText}
                onChange={(e) => setNeedText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && needText.trim()) {
                    e.preventDefault();
                    set('needed_proof', [...form.needed_proof, needText.trim()]);
                    setNeedText('');
                  }
                }}
                placeholder="e.g., notarial registry entry"
                className="flex-1 px-3 py-2 rounded border text-sm"
                style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
              />
              <button
                type="button"
                onClick={() => {
                  if (needText.trim()) {
                    set('needed_proof', [...form.needed_proof, needText.trim()]);
                    setNeedText('');
                  }
                }}
                className="text-xs px-3 rounded"
                style={{ backgroundColor: '#1a1815', color: '#f4ede0' }}
              >Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.needed_proof.map((p, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded cursor-pointer"
                  style={{ backgroundColor: '#ebe1ce', color: '#3a3530' }}
                  onClick={() => set('needed_proof', form.needed_proof.filter((_, idx) => idx !== i))}
                  title="Click to remove"
                >
                  {p} ×
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#6b6559' }}>Rationale</label>
            <textarea
              value={form.rationale}
              onChange={(e) => set('rationale', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded border text-sm"
              style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
            />
          </div>

          <label className="text-xs inline-flex items-center gap-2" style={{ color: '#1a1815' }}>
            <input type="checkbox" checked={form.contested} onChange={(e) => set('contested', e.target.checked)} />
            Mark as contested
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="text-sm px-4 py-2 rounded" style={{ backgroundColor: '#ffffff', color: '#1a1815', border: '1px solid #d4cdb8' }}>
            Cancel
          </button>
          <button
            onClick={() => onSubmit(form)}
            disabled={!form.claim_text || !form.burden_of_proof}
            className="text-sm px-4 py-2 rounded disabled:opacity-50"
            style={{ backgroundColor: '#1a1815', color: '#f4ede0' }}
          >
            {initial ? 'Save Changes' : 'Create Claim'}
          </button>
        </div>
      </div>
    </div>
  );
}