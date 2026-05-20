import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function ProvenanceDetailPanel({ node, onClose }) {
  if (!node) return null;
  const d = node.raw || {};

  const Row = ({ label, value }) => (
    <div className="mb-3">
      <p className="text-xs mb-1" style={{ color: '#6b6559' }}>{label}</p>
      <p className="text-sm" style={{ color: '#1a1815', lineHeight: 1.5 }}>{value || '—'}</p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 rounded h-fit sticky top-6"
      style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#6b6559' }}>
            {node.type}
          </p>
          <h3 className="text-xl font-light" style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}>
            {node.label}
          </h3>
        </div>
        <button onClick={onClose} className="p-1 hover:opacity-70">
          <X className="w-4 h-4" style={{ color: '#6b6559' }} />
        </button>
      </div>

      {node.type === 'evidence' && (
        <>
          <Row label="Evidence Number" value={d.evidence_number} />
          <Row label="Type" value={d.type} />
          <Row label="Status" value={d.status} />
          <Row label="Source" value={d.source} />
          <Row label="Location" value={d.location} />
          <Row label="Date Created" value={d.date_created ? new Date(d.date_created).toLocaleDateString() : null} />
          {d.tags?.length > 0 && (
            <div className="mb-2">
              <p className="text-xs mb-2" style={{ color: '#6b6559' }}>Tags</p>
              <div className="flex flex-wrap gap-1">
                {d.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: '#e8e0d0', color: '#1a1815' }}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {node.type === 'document' && (
        <>
          <Row label="Doc Type" value={d.doc_type} />
          <Row label="Trust Tier" value={d.trust_tier} />
          <Row label="Author / Source" value={d.author_source} />
          <Row label="Language" value={d.language} />
          <Row label="Summary" value={d.summary} />
          {d.key_findings?.length > 0 && (
            <div className="mb-3">
              <p className="text-xs mb-2" style={{ color: '#6b6559' }}>Key Findings</p>
              <ul className="text-sm space-y-1 list-disc list-inside" style={{ color: '#1a1815' }}>
                {d.key_findings.slice(0, 6).map((k, i) => (
                  <li key={i} style={{ lineHeight: 1.4 }}>{k}</li>
                ))}
              </ul>
            </div>
          )}
          {d.related_archives?.length > 0 && (
            <div className="mb-2">
              <p className="text-xs mb-2" style={{ color: '#6b6559' }}>Related Archives</p>
              <div className="flex flex-wrap gap-1">
                {d.related_archives.map((a) => (
                  <span key={a} className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: '#e8e0d0', color: '#1a1815' }}>{a}</span>
                ))}
              </div>
            </div>
          )}
          {d.file_url && (
            <a href={d.file_url} target="_blank" rel="noreferrer" className="text-xs underline" style={{ color: '#6b5b4f' }}>
              Open source file →
            </a>
          )}
        </>
      )}

      {node.type === 'source' && (
        <>
          <Row label="Source name" value={d.label} />
          <Row label="Referenced by" value={`${(d.refs || []).length} evidence item(s)`} />
          <p className="text-xs mt-4" style={{ color: '#6b6559' }}>
            Click connected evidence nodes to inspect each item that cites this source.
          </p>
        </>
      )}
    </motion.div>
  );
}