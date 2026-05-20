import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { generations } from '../components/familytree/auditTreeData';
import TreeLegend from '../components/familytree/TreeLegend';
import GenerationBlock from '../components/familytree/GenerationBlock';
import AuditFooter from '../components/familytree/AuditFooter';

export default function FamilyTreePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f4ede0',
        backgroundImage:
          'radial-gradient(ellipse at top left, rgba(180,160,120,0.08), transparent 50%), radial-gradient(ellipse at bottom right, rgba(180,160,120,0.06), transparent 50%)',
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        color: '#1a1815',
        padding: '0 20px 80px',
      }}
    >
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        {/* Classification strip */}
        <div
          style={{
            background: '#1a1815',
            color: '#f4ede0',
            padding: '8px 16px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.65rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: '0 -20px 32px',
            borderBottom: '3px double #d4c9b3',
          }}
          className="flex-wrap gap-2"
        >
          <span>
            Family Genealogy
            <span style={{ display: 'inline-block', width: 6, height: 6, background: '#c44536', borderRadius: '50%', margin: '0 8px' }} />
            Evidentiary Discipline Applied
            <span style={{ display: 'inline-block', width: 6, height: 6, background: '#c44536', borderRadius: '50%', margin: '0 8px' }} />
            Working Document
          </span>
          <span>v1 · 2026</span>
        </div>

        {/* Back link */}
        <Link
          to="/"
          className="text-xs inline-flex items-center gap-2 mb-6 hover:opacity-70"
          style={{ color: '#3a3530' }}
        >
          <ArrowLeft className="w-3 h-3" /> Back to Case File
        </Link>

        {/* Header */}
        <header
          style={{
            paddingBottom: 22,
            borderBottom: '1px solid #2a2520',
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#3a3530',
              marginBottom: 10,
            }}
          >
            Terminel–Sagasta Family · Six Generations · Sonora &amp; California
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontWeight: 600,
              fontSize: '2.6rem',
              lineHeight: 1.05,
              color: '#1a1815',
              marginBottom: 8,
              letterSpacing: '-0.01em',
            }}
          >
            The Family Tree, Audit-Disciplined
          </h1>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: '1.15rem',
              color: '#3a3530',
              maxWidth: '70ch',
              lineHeight: 1.4,
            }}
          >
            Every person carries an evidentiary status. The displacement timeline runs alongside the lineage, showing
            what each generation lived through — the dispossession campaigns, the Revolution, the political purges, and
            the migrations north. Generation 1 reflects what the archives currently support rather than the chieftain
            narrative that earlier AI-generated trees inserted.
          </div>
        </header>

        {/* Legend */}
        <TreeLegend />

        {/* Generations */}
        {generations.map((gen, i) => (
          <GenerationBlock key={i} gen={gen} isLast={i === generations.length - 1} />
        ))}

        {/* Audit footer */}
        <AuditFooter />
      </div>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 1100px) {
          .audit-generation { grid-template-columns: 130px 1fr !important; }
          .audit-generation > div:last-child {
            grid-column: 1 / -1 !important;
            border-left: none !important;
            border-top: 1px solid #b8ad97;
            padding-left: 0 !important;
            padding-top: 14px;
            margin-top: 4px;
          }
        }
        @media (max-width: 720px) {
          .audit-generation { grid-template-columns: 1fr !important; gap: 16px !important; }
          .audit-generation .gen-marker {
            text-align: left !important;
            border-right: none !important;
            border-bottom: 2px solid #1a1815;
            padding-right: 0 !important;
            padding-bottom: 10px;
          }
          .audit-obs { grid-template-columns: 1fr !important; gap: 6px !important; }
        }
      `}</style>
    </div>
  );
}