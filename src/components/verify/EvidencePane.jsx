import React from 'react';
import { FileText, ExternalLink, User } from 'lucide-react';

function Field({ label, value, mono = false }) {
  if (!value && value !== 0) return null;
  return (
    <div className="mb-3">
      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#6b6559' }}>{label}</p>
      <p style={{ color: '#1a1815', fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit', fontSize: mono ? '0.85rem' : '0.95rem', lineHeight: 1.45 }}>
        {value}
      </p>
    </div>
  );
}

function ScoreBar({ label, value, color }) {
  const v = Math.max(0, Math.min(100, value || 0));
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: '#6b6559' }}>{label}</span>
        <span style={{ color: '#1a1815', fontFamily: 'JetBrains Mono, monospace' }}>{v}</span>
      </div>
      <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: '#f9f5ed' }}>
        <div style={{ width: `${v}%`, height: '100%', backgroundColor: color, borderRadius: 9999 }} />
      </div>
    </div>
  );
}

export default function EvidencePane({ evidence }) {
  const statusColors = {
    unreviewed: '#d4cdb8', reviewed: '#b8a685', verified: '#6b8e6f',
    disputed: '#c97761', archived: '#8a7b6f',
  };

  const isImage = evidence.file_url && /\.(png|jpe?g|gif|webp)$/i.test(evidence.file_url);
  const isPdf = evidence.file_url && /\.pdf($|\?)/i.test(evidence.file_url);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b" style={{ borderColor: '#d4cdb8', backgroundColor: '#f9f5ed' }}>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4" style={{ color: '#1a1815' }} />
          <p className="text-xs uppercase tracking-wider" style={{ color: '#6b6559' }}>Original Record</p>
          <span
            className="ml-auto px-2 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: statusColors[evidence.status] || '#d4cdb8', color: '#ffffff' }}
          >
            {evidence.status}
          </span>
        </div>
        <h2 className="text-2xl font-light leading-tight" style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}>
          {evidence.title}
        </h2>
        <p className="text-xs mt-1" style={{ color: '#6b6559', fontFamily: 'JetBrains Mono, monospace' }}>
          {evidence.evidence_number} · {evidence.type?.replace(/_/g, ' ')}
        </p>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-auto p-5">
        {/* File preview */}
        {evidence.file_url ? (
          <div className="mb-5 rounded overflow-hidden" style={{ border: '1px solid #d4cdb8', backgroundColor: '#f9f5ed' }}>
            {isImage ? (
              <img src={evidence.file_url} alt={evidence.title} style={{ width: '100%', display: 'block' }} />
            ) : isPdf ? (
              <iframe src={evidence.file_url} title={evidence.title} style={{ width: '100%', height: 420, border: 'none' }} />
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm mb-3" style={{ color: '#6b6559' }}>Preview not available for this file type.</p>
                <a
                  href={evidence.file_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs"
                  style={{ backgroundColor: '#1a1815', color: '#f4ede0' }}
                >
                  <ExternalLink className="w-3 h-3" /> Open file
                </a>
              </div>
            )}
            <a
              href={evidence.file_url} target="_blank" rel="noopener noreferrer"
              className="block p-2 text-xs text-center hover:opacity-70"
              style={{ borderTop: '1px solid #d4cdb8', color: '#3a3530' }}
            >
              <ExternalLink className="w-3 h-3 inline mr-1" /> Open in new tab
            </a>
          </div>
        ) : (
          <div className="mb-5 p-6 rounded text-center" style={{ border: '1px dashed #d4cdb8', backgroundColor: '#f9f5ed' }}>
            <p className="text-sm" style={{ color: '#6b6559' }}>No file attached.</p>
          </div>
        )}

        {/* Description */}
        {evidence.description && (
          <div className="mb-5 p-4 rounded" style={{ backgroundColor: '#f9f5ed', border: '1px solid #ebe1ce' }}>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#6b6559' }}>Description</p>
            <p style={{ color: '#1a1815', lineHeight: 1.55, fontSize: '0.9rem' }}>{evidence.description}</p>
          </div>
        )}

        {/* Forensic scores */}
        {(evidence.provenance_score || evidence.authenticity_score || evidence.contamination_score) ? (
          <div className="mb-5 p-4 rounded" style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}>
            <p className="text-xs uppercase tracking-wider mb-3" style={{ color: '#6b6559' }}>Forensic Scoring</p>
            <ScoreBar label="Provenance"   value={evidence.provenance_score}   color="#4a5d3a" />
            <ScoreBar label="Authenticity" value={evidence.authenticity_score} color="#5a6b7a" />
            <ScoreBar label="Contamination risk" value={evidence.contamination_score} color="#6b1f1f" />
          </div>
        ) : null}

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="Date Created" value={evidence.date_created ? new Date(evidence.date_created).toLocaleDateString() : null} />
          <Field label="Date Acquired" value={evidence.date_acquired ? new Date(evidence.date_acquired).toLocaleDateString() : null} />
          <Field label="Source" value={evidence.source} />
          <Field label="Source System" value={evidence.source_system} mono />
          <Field label="Archive" value={evidence.archive_name} />
          <Field label="Collection" value={evidence.collection_name} />
          <Field label="Box" value={evidence.box_number} mono />
          <Field label="Folder" value={evidence.folder_number} mono />
          <Field label="Call #" value={evidence.call_number} mono />
          <Field label="Language" value={evidence.language_code} mono />
          <Field label="Location" value={evidence.location} />
          <Field label="Custody" value={evidence.chain_of_custody_status} />
        </div>

        {/* Related people */}
        {evidence.related_people?.length > 0 && (
          <div className="mt-3 mb-3">
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#6b6559' }}>Related People</p>
            <div className="flex flex-wrap gap-1.5">
              {evidence.related_people.map((p, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded inline-flex items-center gap-1" style={{ backgroundColor: '#ebe1ce', color: '#1a1815' }}>
                  <User className="w-3 h-3" /> {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {evidence.tags?.length > 0 && (
          <div className="mt-3 mb-3">
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#6b6559' }}>Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {evidence.tags.map((t, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#e8e0d0', color: '#1a1815' }}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {evidence.notes && (
          <div className="mt-4 p-4 rounded" style={{ backgroundColor: '#f9f5ed', border: '1px solid #ebe1ce' }}>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#6b6559' }}>Researcher Notes</p>
            <p style={{ color: '#1a1815', lineHeight: 1.55, fontSize: '0.85rem' }}>{evidence.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}