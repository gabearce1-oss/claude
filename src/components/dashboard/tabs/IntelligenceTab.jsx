import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitBranch, FileSearch, Inbox, ShieldCheck, ArrowRight } from 'lucide-react';
import ReadinessScore from '../../forensic/ReadinessScore';
import QuarantinePanel from '../../forensic/QuarantinePanel';

const QUICK_LINKS = [
  {
    to: '/claims',
    Icon: FileSearch,
    title: 'Claims Workbench',
    body: 'Manage assertions, weight evidence links, and track verification status.',
  },
  {
    to: '/archive-requests',
    Icon: Inbox,
    title: 'Archive Requests',
    body: 'Submit and track structured inquiries to AGN, HNDM, FamilySearch, and more.',
  },
  {
    to: '/audit-checklist',
    Icon: ShieldCheck,
    title: 'AI Contamination Audit',
    body: 'Score documents against known synthetic-content failure modes.',
  },
  {
    to: '/provenance',
    Icon: GitBranch,
    title: 'Provenance Map',
    body: 'Visualize how evidence flows from source documents to claims.',
  },
];

export default function IntelligenceTab({ allEvidence, allClaims }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <ReadinessScore evidence={allEvidence} claims={allClaims} />
        <QuarantinePanel evidence={allEvidence} claims={allClaims} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {QUICK_LINKS.map(({ to, Icon, title, body }) => (
          <Link
            key={to}
            to={to}
            className="group p-5 rounded transition-colors block"
            style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
          >
            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded flex-shrink-0"
                style={{ backgroundColor: '#f9f5ed' }}
              >
                <Icon className="w-4 h-4" style={{ color: '#1a1815' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="mb-1"
                  style={{
                    color: '#1a1815',
                    fontFamily: 'Cormorant Garamond',
                    fontSize: '1.15rem',
                  }}
                >
                  {title}
                </p>
                <p className="text-xs" style={{ color: '#6b6559', lineHeight: 1.5 }}>
                  {body}
                </p>
              </div>
              <ArrowRight
                className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-1"
                style={{ color: '#6b6559' }}
              />
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}