import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import markdown from '@/content/te360/family_genealogy.md?raw';
import GenerationalDisplacementModel from '@/components/playbook/GenerationalDisplacementModel';

const MARKERS = '\n\n## Generational Displacement Model';

export default function FamilyGenealogy() {
  const splitIdx = markdown.indexOf(MARKERS);
  const before = splitIdx >= 0 ? markdown.slice(0, splitIdx) : markdown;
  const after = splitIdx >= 0 ? markdown.slice(splitIdx) : '';

  const mdComponents = {
    h1: (p) => (
      <h1
        className="text-3xl font-light mt-8 mb-4"
        style={{ fontFamily: 'Cormorant Garamond' }}
        {...p}
      />
    ),
    h2: (p) => (
      <h2
        className="text-xl uppercase tracking-wider mt-6 mb-2"
        style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em' }}
        {...p}
      />
    ),
    h3: (p) => <h3 className="text-lg mt-5 mb-2 font-medium" {...p} />,
    p: (p) => <p className="my-3 text-sm" style={{ lineHeight: 1.7 }} {...p} />,
    ul: (p) => <ul className="list-disc pl-6 my-3 text-sm space-y-1" {...p} />,
    ol: (p) => <ol className="list-decimal pl-6 my-3 text-sm space-y-1" {...p} />,
    blockquote: (p) => (
      <blockquote
        className="my-3 pl-4 italic text-sm"
        style={{ borderLeft: '3px solid #8a6e3c', color: '#6b6559' }}
        {...p}
      />
    ),
    table: (p) => (
      <table
        className="my-4 text-sm border-collapse w-full"
        style={{ border: '1px solid #d4cdb8' }}
        {...p}
      />
    ),
    th: (p) => (
      <th
        className="text-left px-2 py-1"
        style={{ backgroundColor: '#ebe1ce', border: '1px solid #d4cdb8' }}
        {...p}
      />
    ),
    td: (p) => (
      <td className="px-2 py-1" style={{ border: '1px solid #d4cdb8' }} {...p} />
    ),
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4ede0' }}>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b"
        style={{
          borderColor: '#d4cdb8',
          background: 'linear-gradient(180deg, #f4ede0 0%, #ebe1ce 100%)',
        }}
      >
        <div className="max-w-4xl mx-auto px-8 py-10">
          <Link
            to="/playbook"
            className="text-xs inline-flex items-center gap-2 mb-4 hover:opacity-70"
            style={{ color: '#6b6559' }}
          >
            <ArrowLeft className="w-3 h-3" /> Back to Playbook
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-5 h-5" style={{ color: '#1a1815' }} />
            <h1
              className="text-4xl font-light"
              style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}
            >
              Family Genealogy — Audit Disciplined
            </h1>
          </div>
          <p
            className="text-sm max-w-3xl"
            style={{ color: '#6b6559', lineHeight: 1.55 }}
          >
            Six generations, Terminel–Sagasta. Every person carries an evidentiary
            status. Displacement timeline runs alongside the lineage. Live TSU B412
            growth model renders inside the page.
          </p>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <article className="prose prose-slate max-w-none" style={{ color: '#1a1815' }}>
          <ReactMarkdown components={mdComponents}>{before}</ReactMarkdown>
        </article>
        <GenerationalDisplacementModel />
        <article className="prose prose-slate max-w-none" style={{ color: '#1a1815' }}>
          <ReactMarkdown components={mdComponents}>{after}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
