import React from 'react';
import { CLAIM_STATUS } from '../forensic/statusConfig';
import { Link2, Pencil, Trash2, Pin, PinOff } from 'lucide-react';

export default function ClaimRow({ claim, linkCount, onEdit, onDelete, onLink, onTogglePin }) {
  const s = CLAIM_STATUS[claim.status] || CLAIM_STATUS.unverified;
  const pinned = !!claim.is_foundational;
  return (
    <div
      className="p-4 rounded grid gap-3"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #d4cdb8',
        borderLeft: `4px solid ${s.color}`,
        gridTemplateColumns: '1fr auto',
      }}
    >
      <div>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{ backgroundColor: s.bg, color: s.color, fontFamily: 'JetBrains Mono, monospace' }}
          >
            {s.label}
          </span>
          <span className="text-xs" style={{ color: '#6b6559', fontFamily: 'JetBrains Mono, monospace' }}>
            {claim.claim_type}
          </span>
          <span className="text-xs" style={{ color: '#6b6559' }}>
            confidence {claim.confidence_score || 0}
          </span>
          {claim.contested && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#f3dede', color: '#6b1f1f' }}>
              contested
            </span>
          )}
          {pinned && (
            <span
              className="text-xs px-1.5 py-0.5 rounded inline-flex items-center gap-1"
              style={{ backgroundColor: '#1a1815', color: '#f4ede0' }}
            >
              <Pin className="w-2.5 h-2.5" /> pinned
            </span>
          )}
        </div>
        <p style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond', fontSize: '1.1rem', lineHeight: 1.35 }}>
          {claim.claim_text}
        </p>
        {claim.burden_of_proof && (
          <p className="text-xs mt-2" style={{ color: '#6b6559', fontStyle: 'italic' }}>
            Burden of proof: <span style={{ color: '#1a1815' }}>{claim.burden_of_proof}</span>
          </p>
        )}
        {claim.needed_proof && claim.needed_proof.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {claim.needed_proof.map((p, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded"
                style={{ backgroundColor: '#f9f5ed', border: '1px solid #ebe1ce', color: '#3a3530' }}
              >
                need · {p}
              </span>
            ))}
          </div>
        )}
        {claim.rationale && (
          <p className="text-xs mt-2" style={{ color: '#3a3530', lineHeight: 1.5 }}>
            {claim.rationale}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5 items-end">
        <button
          onClick={() => onLink(claim)}
          className="text-xs px-2.5 py-1 rounded inline-flex items-center gap-1.5"
          style={{ backgroundColor: '#1a1815', color: '#f4ede0' }}
        >
          <Link2 className="w-3 h-3" /> Link · {linkCount}
        </button>
        {onTogglePin && (
          <button
            onClick={() => onTogglePin(claim)}
            className="text-xs px-2.5 py-1 rounded inline-flex items-center gap-1.5"
            style={{
              backgroundColor: pinned ? '#c44536' : '#ffffff',
              color: pinned ? '#f4ede0' : '#1a1815',
              border: '1px solid #d4cdb8',
            }}
            title={pinned ? 'Unpin from Key Documents' : 'Pin to Key Documents'}
          >
            {pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
            {pinned ? 'Unpin' : 'Pin'}
          </button>
        )}
        <button
          onClick={() => onEdit(claim)}
          className="text-xs px-2.5 py-1 rounded inline-flex items-center gap-1.5"
          style={{ backgroundColor: '#ffffff', color: '#1a1815', border: '1px solid #d4cdb8' }}
        >
          <Pencil className="w-3 h-3" /> Edit
        </button>
        <button
          onClick={() => onDelete(claim)}
          className="text-xs px-2.5 py-1 rounded inline-flex items-center gap-1.5"
          style={{ backgroundColor: '#ffffff', color: '#6b1f1f', border: '1px solid #f3dede' }}
        >
          <Trash2 className="w-3 h-3" /> Delete
        </button>
      </div>
    </div>
  );
}