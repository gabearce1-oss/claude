import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ProtocolPage({ title, subtitle, markdown }) {
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
              {title}
            </h1>
          </div>
          {subtitle ? (
            <p className="text-sm max-w-3xl" style={{ color: '#6b6559', lineHeight: 1.55 }}>
              {subtitle}
            </p>
          ) : null}
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <article
          className="prose prose-slate max-w-none"
          style={{ color: '#1a1815' }}
        >
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => (
                <h1
                  className="text-3xl font-light mt-8 mb-4"
                  style={{ fontFamily: 'Cormorant Garamond' }}
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  className="text-xl uppercase tracking-wider mt-6 mb-2"
                  style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em' }}
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-lg mt-5 mb-2 font-medium" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="my-3 text-sm" style={{ lineHeight: 1.7 }} {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-6 my-3 text-sm space-y-1" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-6 my-3 text-sm space-y-1" {...props} />
              ),
              code: ({ inline, children, ...props }) =>
                inline ? (
                  <code
                    className="px-1 py-0.5 rounded text-xs"
                    style={{ backgroundColor: '#ebe1ce', fontFamily: 'JetBrains Mono, monospace' }}
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <pre
                    className="my-3 p-3 rounded overflow-x-auto text-xs"
                    style={{
                      backgroundColor: '#1a1815',
                      color: '#f4ede0',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    <code {...props}>{children}</code>
                  </pre>
                ),
              table: ({ node, ...props }) => (
                <table
                  className="my-4 text-sm border-collapse w-full"
                  style={{ border: '1px solid #d4cdb8' }}
                  {...props}
                />
              ),
              th: ({ node, ...props }) => (
                <th
                  className="text-left px-2 py-1"
                  style={{ backgroundColor: '#ebe1ce', border: '1px solid #d4cdb8' }}
                  {...props}
                />
              ),
              td: ({ node, ...props }) => (
                <td className="px-2 py-1" style={{ border: '1px solid #d4cdb8' }} {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="my-3 pl-4 italic text-sm"
                  style={{ borderLeft: '3px solid #8a6e3c', color: '#6b6559' }}
                  {...props}
                />
              ),
            }}
          >
            {markdown}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
