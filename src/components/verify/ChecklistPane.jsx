import React, { useMemo, useState, useEffect } from 'react';
import { ShieldCheck, Save, Plus, Link2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { checklistItems } from './checklistItems';
import ChecklistItem from './ChecklistItem';

const STORAGE_PREFIX = 'te360.verify.checklist.';

function loadChecklist(evidenceId) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + evidenceId);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveChecklist(evidenceId, data) {
  try { localStorage.setItem(STORAGE_PREFIX + evidenceId, JSON.stringify(data)); } catch {}
}

export default function ChecklistPane({ evidence, linkedClaims = [], onUpdateStatus, onUpdateScores }) {
  const [checklist, setChecklist] = useState({});
  const [savedAt, setSavedAt] = useState(null);

  // Load per-evidence checklist from localStorage
  useEffect(() => {
    if (!evidence?.id) return;
    setChecklist(loadChecklist(evidence.id));
  }, [evidence?.id]);

  // Persist on every change
  useEffect(() => {
    if (!evidence?.id) return;
    saveChecklist(evidence.id, checklist);
    setSavedAt(new Date());
  }, [checklist, evidence?.id]);

  const setState = (itemId, value) => setChecklist((c) => ({ ...c, [itemId]: { ...(c[itemId] || {}), state: value } }));
  const setNote  = (itemId, value) => setChecklist((c) => ({ ...c, [itemId]: { ...(c[itemId] || {}), note: value } }));

  const summary = useMemo(() => {
    const counts = { pass: 0, concern: 0, fail: 0, unmarked: 0 };
    checklistItems.forEach((it) => {
      const s = checklist[it.id]?.state || 'unmarked';
      counts[s] = (counts[s] || 0) + 1;
    });
    const total = checklistItems.length;
    const score = Math.round(((counts.pass + counts.concern * 0.4) / total) * 100);
    const verdict =
      counts.fail >= 2 ? { label: 'Quarantine', color: '#6b1f1f' } :
      counts.fail === 1 || counts.concern >= 3 ? { label: 'Needs more proof', color: '#8a6e3c' } :
      counts.pass === total ? { label: 'Verified-ready', color: '#4a5d3a' } :
      counts.pass >= total - 1 ? { label: 'Corroborated-ready', color: '#5d7a3a' } :
      { label: 'In review', color: '#6b6559' };
    return { counts, total, score, verdict };
  }, [checklist]);

  // Quick action buttons → push verdict into evidence record
  const applyVerdict = async (newStatus) => {
    if (!onUpdateStatus) return;
    await onUpdateStatus(newStatus);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b" style={{ borderColor: '#d4cdb8', backgroundColor: '#f9f5ed' }}>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4" style={{ color: '#1a1815' }} />
          <p className="text-xs uppercase tracking-wider" style={{ color: '#6b6559' }}>Claim-Testing Checklist</p>
          {savedAt && (
            <span className="ml-auto text-xs inline-flex items-center gap-1" style={{ color: '#6b6559' }}>
              <Save className="w-3 h-3" /> Auto-saved
            </span>
          )}
        </div>

        {/* Verdict + score */}
        <div className="flex items-baseline gap-3">
          <p className="text-4xl font-light" style={{ color: summary.verdict.color, fontFamily: 'Cormorant Garamond', lineHeight: 1 }}>
            {summary.score}
          </p>
          <p className="text-sm" style={{ color: summary.verdict.color, fontWeight: 500 }}>{summary.verdict.label}</p>
          <p className="text-xs ml-auto" style={{ color: '#6b6559' }}>
            {summary.counts.pass} pass · {summary.counts.concern} concern · {summary.counts.fail} fail
          </p>
        </div>

        {/* Quick verdict actions */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          <button
            onClick={() => applyVerdict('verified')}
            className="text-xs px-2.5 py-1 rounded"
            style={{ backgroundColor: '#4a5d3a', color: '#ffffff' }}
          >Mark Verified</button>
          <button
            onClick={() => applyVerdict('reviewed')}
            className="text-xs px-2.5 py-1 rounded"
            style={{ backgroundColor: '#b8a685', color: '#ffffff' }}
          >Mark Reviewed</button>
          <button
            onClick={() => applyVerdict('disputed')}
            className="text-xs px-2.5 py-1 rounded"
            style={{ backgroundColor: '#c97761', color: '#ffffff' }}
          >Mark Disputed</button>
        </div>
      </div>

      {/* Scrollable checklist */}
      <div className="flex-1 overflow-auto p-5 space-y-3">
        {checklistItems.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            state={checklist[item.id]?.state}
            note={checklist[item.id]?.note}
            onState={(v) => setState(item.id, v)}
            onNote={(v) => setNote(item.id, v)}
          />
        ))}

        {/* Linked claims */}
        <div className="mt-6 p-4 rounded" style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4" style={{ color: '#1a1815' }} />
              <p className="text-xs uppercase tracking-wider" style={{ color: '#6b6559' }}>
                Linked Claims ({linkedClaims.length})
              </p>
            </div>
            <Link
              to="/claims"
              className="text-xs px-2 py-1 rounded inline-flex items-center gap-1"
              style={{ backgroundColor: '#1a1815', color: '#f4ede0' }}
            >
              <Plus className="w-3 h-3" /> Manage
            </Link>
          </div>
          {linkedClaims.length === 0 ? (
            <p className="text-xs" style={{ color: '#6b6559' }}>
              No claims linked to this evidence yet. Open the Claims page to attach this record to one or more claims.
            </p>
          ) : (
            <ul className="space-y-2">
              {linkedClaims.map(({ link, claim }) => (
                <li key={link.id} className="p-2 rounded text-xs" style={{ backgroundColor: '#f9f5ed', border: '1px solid #ebe1ce' }}>
                  <div className="flex justify-between gap-2 mb-1">
                    <span style={{ color: '#3a3530', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {link.support_role} · weight {link.weight}
                    </span>
                    <span style={{ color: '#6b6559' }}>{claim?.status || '—'}</span>
                  </div>
                  <p style={{ color: '#1a1815', lineHeight: 1.4 }}>
                    {claim?.claim_text || '(claim deleted)'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}