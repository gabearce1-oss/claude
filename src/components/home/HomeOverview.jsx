import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, GitBranch, ShieldCheck, FileSearch } from 'lucide-react';

const PILLARS = [
  {
    Icon: ShieldCheck,
    title: 'Audit-Disciplined',
    body: 'Every claim carries an evidentiary status, a burden of proof, and a confidence score. Fabricated AI residue is flagged, not buried.',
  },
  {
    Icon: GitBranch,
    title: 'Provenance-Mapped',
    body: 'Each source is hashed, classified by archive, and linked through chain of custody from the original scan to the published claim.',
  },
  {
    Icon: BookOpen,
    title: 'Archive-Native',
    body: 'Direct ingest from Library of Congress, AGN, AHES, NARA, FamilySearch, and 7 more archival repositories.',
  },
  {
    Icon: FileSearch,
    title: 'Six-Generation Scope',
    body: 'Sonora and California, 1850s to today — dispossession, Revolution, exile, and the migrations north.',
  },
];

export default function HomeOverview() {
  return (
    <div id="about" className="max-w-6xl mx-auto px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p
          className="text-xs mb-4"
          style={{
            color: '#3a3530',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
          }}
        >
          Methodology
        </p>
        <h2
          className="text-4xl font-light mb-4"
          style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}
        >
          A forensic standard <em style={{ fontWeight: 500 }}>for historical claims</em>
        </h2>
        <p
          className="text-lg max-w-3xl mb-12"
          style={{ color: '#3a3530', fontFamily: 'Cormorant Garamond', fontStyle: 'italic', lineHeight: 1.6 }}
        >
          TruthEngine360 was built after earlier AI-generated genealogies inserted a chieftain narrative that
          the archives don't support. This case file treats every assertion as a hypothesis until the documents
          settle it.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4">
        {PILLARS.map(({ Icon, title, body }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="p-6 rounded"
            style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
          >
            <Icon className="w-5 h-5 mb-3" style={{ color: '#1a1815' }} />
            <h3
              className="text-xl mb-2"
              style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond', fontWeight: 500 }}
            >
              {title}
            </h3>
            <p className="text-sm" style={{ color: '#6b6559', lineHeight: 1.6 }}>
              {body}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}