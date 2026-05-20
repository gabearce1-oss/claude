import React, { useState } from 'react';
import { X } from 'lucide-react';
import { SUPPORT_ROLES } from '../forensic/statusConfig';

export default function EvidenceLinkModal({ open, claim, allEvidence = [], existingLinks = [], onClose, onCreate, onDelete }) {
  const [evidenceId, setEvidenceId] = useState('');
  const [role, setRole] = useState('supports');
  const [excerpt, setExcerpt] = useState('');
  const [weight, setWeight] = useState(0.5);

  if (!open || !claim) return null;

  const linkedIds = new Set(existingLinks.map((l) => l.evidence_id));
  const linked = existingLinks.map((l) => ({
    link: l,
    evidence: allEvidence.find((e) => e.id === l.evidence_id),
  }));
  const unlinked = allEvidence.filter((e) => !linkedIds.has(e.id));

  const submit = () => {
    if (!evidenceId) return;
    onCreate({ claim_id: claim.id, evidence_id: evidenceId, support_role: role, excerpt_text: excerpt, weight });
    setEvidenceId(''); setExcerpt(''); setRole('supports'); setWeight(0.5);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(26,24,21,0.6)' }}>
      <div className="w-full max-w-2xl rounded p-6 max-h-[90vh] overflow-auto" style={{ backgroundColor: '#f9f5ed', border: '1px solid #1a1815' }}>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-light" style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}>Evidence Links</h2>
          <button onClick={onClose} style={{ color: '#6b6559' }}><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm mb-5" style={{ color: '#3a3530', fontStyle: 'italic' }}>{claim.claim_text}</p>

        {/* Existing links */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#6b6559' }}>
            Linked evidence ({linked.length})
          </p>
          {linked.length === 0 ? (
            <p className="text-xs" style={{ color: '#6b6559' }}>No evidence linked yet.</p>
          ) : (
            <ul className="space-y-2">
              {linked.map(({ link, evidence }) => {
                const sr = SUPPORT_ROLES[link.support_role] || SUPPORT_ROLES.supports;
                return (
                  <li key={link.id} className="p-2 rounded flex justify-between gap-3" style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}>
                    <div className="text-xs" style={{ color: '#1a1815' }}>
                      <span style={{ color: sr.color, fontFamily: 'JetBrains Mono, monospace' }}>
                        {sr.label.toUpperCase()}
                      </span>
                      {' · '}
                      <strong>{evidence?.evidence_number || '?'}</strong> {evidence?.title || '(missing evidence)'}
                      {' · weight '}{link.weight}
                      {link.excerpt_text && (
                        <p className="mt-1" style={{ color: '#3a3530', fontStyle: 'italic' }}>"{link.excerpt_text}"</p>
                      )}
                    </div>
                    <button
                      onClick={() => onDelete(link)}
                      className="text-xs"
                      style={{ color: '#6b1f1f' }}
                    >Remove</button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* New link */}
        <div className="p-4 rounded" style={{ backgroundColor: '#ffffff', border: '1px dashed #d4cdb8' }}>
          <p className="text-xs uppercase tracking-wider mb-3" style={{ color: '#6b6559' }}>Add a new link</p>

          <div className="space-y-3">
            <div>
              <label className="text-xs block mb-1" style={{ color: '#6b6559' }}>Evidence</label>
              <select
                value={evidenceId}
                onChange={(e) => setEvidenceId(e.target.value)}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
              >
                <option value="">Select…</option>
                {unlinked.map((e) => (
                  <option key={e.id} value={e.id}>{e.evidence_number} · {e.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs block mb-1" style={{ color: '#6b6559' }}>Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
                >
                  {Object.entries(SUPPORT_ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: '#6b6559' }}>Weight (0 - 1)</label>
                <input
                  type="number" step={0.1} min={0} max={1}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
                />
              </div>
            </div>

            <div>
              <label className="text-xs block mb-1" style={{ color: '#6b6559' }}>Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                placeholder="Quoted passage…"
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ borderColor: '#d4cdb8', backgroundColor: '#ffffff', color: '#1a1815' }}
              />
            </div>

            <button
              onClick={submit}
              disabled={!evidenceId}
              className="text-sm px-4 py-2 rounded disabled:opacity-50"
              style={{ backgroundColor: '#1a1815', color: '#f4ede0' }}
            >Create Link</button>
          </div>
        </div>
      </div>
    </div>
  );
}