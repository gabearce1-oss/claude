import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { suggestPipes } from '@/lib/ml';

const PIPE_COLOR = {
  GEO: '#4a5d3a', MIN: '#4a5d3a', POL: '#1a1815', LAND: '#8a6e3c',
  IND: '#6b1f1f', GEN: '#4a5d3a', WF: '#1a1815', LEGAL: '#8a6e3c',
  TRADE: '#6b6559', AUDIT: '#1a1815',
};

export default function PipeTagSuggester({ text, existingClaims = [], onPick }) {
  const suggestions = useMemo(
    () => suggestPipes({ text, existingClaims, k: 3 }),
    [text, existingClaims]
  );

  if (!text || suggestions.length === 0) return null;

  return (
    <div
      className="p-3 rounded"
      style={{ backgroundColor: '#f9f5ed', border: '1px solid #d4cdb8' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-3 h-3" style={{ color: '#8a6e3c' }} />
        <span
          className="text-xs uppercase tracking-wider"
          style={{
            color: '#6b6559',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.15em',
          }}
        >
          Suggested pipes
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map(({ pipe, score }) => (
          <button
            key={pipe}
            onClick={() => onPick && onPick(pipe)}
            className="text-xs px-2 py-1 rounded hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: PIPE_COLOR[pipe] || '#1a1815',
              color: '#f4ede0',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.05em',
            }}
            title={`Confidence ${(score * 100).toFixed(0)}%`}
          >
            {pipe} · {(score * 100).toFixed(0)}%
          </button>
        ))}
      </div>
    </div>
  );
}
