import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import { buildIndex, search } from '@/lib/ml';

// Generic semantic search over a homogeneous list of rows.
// `rows` = [{ id, text, ...metadata }]
// `renderResult` = ({ row, score }) => ReactNode
export default function SemanticSearchBox({
  rows,
  renderResult,
  placeholder = 'Search by meaning… e.g. "indigenous land title under Porfiriato"',
  limit = 12,
  emptyHint = 'TF-IDF + cosine similarity, all client-side. Try a phrase, not just a keyword.',
}) {
  const [query, setQuery] = useState('');

  const index = useMemo(() => {
    if (!rows || rows.length === 0) return null;
    return buildIndex(rows.filter((r) => r.id && r.text));
  }, [rows]);

  const results = useMemo(() => {
    if (!index || !query.trim()) return [];
    return search(index, query, limit).map((hit) => {
      const row = rows.find((r) => r.id === hit.id);
      return row ? { row, score: hit.score } : null;
    }).filter(Boolean);
  }, [index, query, rows, limit]);

  return (
    <div className="space-y-3">
      <div
        className="flex items-center gap-2 px-3 py-2 rounded"
        style={{ backgroundColor: '#ffffff', border: '1px solid #1a1815' }}
      >
        <Sparkles className="w-4 h-4" style={{ color: '#8a6e3c' }} />
        <Search className="w-4 h-4" style={{ color: '#6b6559' }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 text-sm bg-transparent outline-none"
          style={{ color: '#1a1815' }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="text-xs"
            style={{ color: '#6b6559', fontFamily: 'JetBrains Mono, monospace' }}
          >
            clear
          </button>
        )}
      </div>

      {!query && (
        <p className="text-xs italic" style={{ color: '#6b6559' }}>
          {emptyHint}
        </p>
      )}

      <AnimatePresence>
        {query && results.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs italic"
            style={{ color: '#6b6559' }}
          >
            No matches. Try a different phrasing — the index is small and TF-IDF
            requires shared vocabulary.
          </motion.p>
        )}
      </AnimatePresence>

      {query && results.length > 0 && (
        <p
          className="text-xs uppercase tracking-wider"
          style={{
            color: '#6b6559',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.15em',
          }}
        >
          {results.length} match{results.length === 1 ? '' : 'es'} · sorted by similarity
        </p>
      )}

      <div className="space-y-2">
        {results.map(({ row, score }, i) => (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
          >
            {renderResult({ row, score })}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
