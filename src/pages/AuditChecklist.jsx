import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Info } from 'lucide-react';
import { patterns } from '../components/audit/auditChecklistData';
import PatternCard from '../components/audit/PatternCard';
import ScoreSummary from '../components/audit/ScoreSummary';
import HardRulesPanel from '../components/audit/HardRulesPanel';

export default function AuditChecklistPage() {
  const [docName, setDocName] = useState('');
  const [statuses, setStatuses] = useState({});

  const setStatus = (id, value) => setStatuses((prev) => ({ ...prev, [id]: value }));
  const reset = () => { setStatuses({}); setDocName(''); };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4ede0' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b"
        style={{ borderColor: '#d4cdb8' }}
      >
        <div className="max-w-5xl mx-auto px-8 py-8">
          <Link to="/" className="text-xs inline-flex items-center gap-2 mb-4 hover:opacity-70" style={{ color: '#6b6559' }}>
            <ArrowLeft className="w-3 h-3" /> Back to Case File
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-7 h-7" style={{ color: '#1a1815' }} />
            <h1 className="text-4xl font-light" style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}>
              AI-Amplification Audit Checklist
            </h1>
          </div>
          <p className="text-sm" style={{ color: '#6b6559' }}>
            Diagnostic for identifying AI-generated synthetic material · Section IX, May 2026 Informe Forense
          </p>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-8 py-8 space-y-8">
        {/* Intro */}
        <div className="p-5 rounded flex gap-3" style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}>
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#8a7b6f' }} />
          <p className="text-sm leading-relaxed" style={{ color: '#1a1815' }}>
            Use this checklist whenever a new document — internal, imported, or generated in conversation — needs to be
            classified. The five patterns below are the failure modes that recur across AI-authored material. They are not
            stylistic quirks; they are <em>structural tells</em>. A document that triggers two or more belongs in quarantine
            pending verification.
          </p>
        </div>

        {/* Document being audited */}
        <div className="p-5 rounded" style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}>
          <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: '#6b6559' }}>
            Document being audited
          </label>
          <input
            type="text"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            placeholder="e.g., Forensic Report on Francisco Terminel · ChatGPT · 2026-04-12"
            className="w-full px-3 py-2 rounded border text-sm"
            style={{ borderColor: '#d4cdb8', backgroundColor: '#f9f5ed', color: '#1a1815' }}
          />
        </div>

        {/* Score / verdict */}
        <ScoreSummary statuses={statuses} onReset={reset} />

        {/* Patterns */}
        <div className="space-y-4">
          {patterns.map((p) => (
            <PatternCard
              key={p.id}
              pattern={p}
              status={statuses[p.id] || 'unmarked'}
              onStatusChange={(s) => setStatus(p.id, s)}
            />
          ))}
        </div>

        {/* How to use */}
        <div className="p-6 rounded" style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}>
          <h3 className="text-xl font-light mb-3" style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}>
            How to use this checklist
          </h3>
          <div className="space-y-3 text-sm leading-relaxed" style={{ color: '#1a1815' }}>
            <p>
              Walk the five patterns in order. Mark each as <strong>clear</strong>, <strong>suspect</strong>, or{' '}
              <strong>triggered</strong>. A document with one suspect signal can stay in the active inventory with a flag.
              A document with two triggered signals goes to quarantine. A document with three or more triggered signals
              should not be retained even as an investigative lead — it actively contaminates the file.
            </p>
            <p>
              Record the classification in the document's <code className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: '#e8e0d0' }}>notes</code> field
              in the inventory, so subsequent reviewers see the audit trail rather than reconstructing it.
            </p>
            <p>
              Apply this checklist to any new AI-authored material — your own Claude or ChatGPT sessions, agent output, or
              imported documents like the May 2026 Informe Forense itself. The Informe Forense passes this checklist, but
              would still need its sources independently verified before claims are upgraded from{' '}
              <em>circumstantial</em> to <em>verified</em>. <strong>Passing is necessary but not sufficient.</strong>
            </p>
          </div>
        </div>

        {/* Hard rules */}
        <HardRulesPanel />

        <p className="text-center text-xs italic pt-4" style={{ color: '#6b6559' }}>
          Version 1.0 · Derived from May 2026 Informe Forense (Sec. IX) and Terminel-Sagasta Dataset Audit Report
        </p>
      </div>
    </div>
  );
}