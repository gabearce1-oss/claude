import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitBranch, TreePine, ShieldCheck, FileSearch, Inbox, Lock, BookOpen, ListChecks } from 'lucide-react';
import ExportReportButton from './ExportReportButton';

const ACTIONS = [
  { to: '/workflow',         label: 'Daily Workflow',    Icon: ListChecks,  primary: false },
  { to: '/playbook',         label: 'Research Playbook', Icon: BookOpen,    primary: false },
  { to: '/claims',           label: 'Claims',            Icon: FileSearch,  primary: false },
  { to: '/archive-requests', label: 'Archive Requests',  Icon: Inbox,       primary: false },
  { to: '/audit-checklist',  label: 'Audit Checklist',   Icon: ShieldCheck, primary: false },
  { to: '/family-tree',      label: 'Family Tree',       Icon: TreePine,    primary: false },
  { to: '/custody',          label: 'Chain of Custody',  Icon: Lock,        primary: false },
  { to: '/provenance',       label: 'Provenance Map',    Icon: GitBranch,   primary: true  },
];

export default function DashboardHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
      style={{
        borderBottom: '1px solid #d4cdb8',
        background:
          'linear-gradient(180deg, #f4ede0 0%, #ebe1ce 100%)',
      }}
    >
      {/* subtle pattern */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(rgba(26,24,21,0.06) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />
      <div className="max-w-7xl mx-auto px-8 py-10 relative">
        <div className="flex justify-between items-start gap-6 flex-wrap">
          <div>
            <div
              className="text-xs mb-3 inline-flex items-center gap-2"
              style={{
                color: '#3a3530',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ width: 6, height: 6, background: '#c44536', borderRadius: '50%' }} />
              Forensic Historical Intelligence
              <span style={{ width: 6, height: 6, background: '#c44536', borderRadius: '50%' }} />
            </div>
            <h1
              className="text-5xl font-light mb-2 leading-none"
              style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}
            >
              Terminel–Sagasta <em style={{ fontWeight: 500 }}>Case File</em>
            </h1>
            <p className="text-sm" style={{ color: '#6b6559' }}>
              Evidence Audit Dashboard · TruthEngine360
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <ExportReportButton />
            {ACTIONS.map(({ to, label, Icon, primary }) => (
              <Link
                key={to}
                to={to}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded text-sm transition-colors hover:opacity-90"
                style={{
                  backgroundColor: primary ? '#1a1815' : '#ffffff',
                  color: primary ? '#f4ede0' : '#1a1815',
                  border: '1px solid #1a1815',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.72rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}