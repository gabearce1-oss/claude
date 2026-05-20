import React, { useState } from 'react';
import { Copy, ChevronDown, ChevronRight } from 'lucide-react';
import { queryPlaybook } from '../forensic/queryPlaybook';

export default function QueryPlaybookPanel({ onUseQuery }) {
  const [open, setOpen] = useState(null);

  const copy = (text) => {
    navigator.clipboard?.writeText(text);
  };

  return (
    <div className="rounded" style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}>
      <div className="p-4 border-b" style={{ borderColor: '#d4cdb8' }}>
        <p className="text-xs uppercase tracking-wider" style={{ color: '#6b6559' }}>Query Playbook</p>
        <p className="text-sm mt-1" style={{ color: '#3a3530' }}>
          Pre-built search strings per source. Click a query to copy it, or to drop it straight into a new request.
        </p>
      </div>

      <ul>
        {queryPlaybook.map((p, i) => {
          const isOpen = open === i;
          return (
            <li key={p.source} className="border-b" style={{ borderColor: '#ebe1ce' }}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full p-3 flex items-center justify-between text-left"
                style={{ color: '#1a1815' }}
              >
                <div className="flex items-center gap-2">
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>{p.source}</span>
                  <span className="text-xs" style={{ color: '#6b6559' }}>· {p.queries.length} queries</span>
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-4">
                  <p className="text-xs mb-3" style={{ color: '#6b6559', fontStyle: 'italic' }}>{p.note}</p>
                  <ul className="space-y-1.5">
                    {p.queries.map((q, idx) => (
                      <li
                        key={idx}
                        className="text-xs p-2 rounded flex items-center justify-between gap-2"
                        style={{ backgroundColor: '#f9f5ed', border: '1px solid #ebe1ce', fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        <span style={{ color: '#1a1815' }}>{q}</span>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => copy(q)}
                            className="text-xs px-2 py-0.5 rounded inline-flex items-center gap-1"
                            style={{ backgroundColor: '#ffffff', color: '#1a1815', border: '1px solid #d4cdb8' }}
                            title="Copy"
                          >
                            <Copy className="w-3 h-3" /> Copy
                          </button>
                          {onUseQuery && (
                            <button
                              onClick={() => onUseQuery({ source: p.source, query_used: q })}
                              className="text-xs px-2 py-0.5 rounded"
                              style={{ backgroundColor: '#1a1815', color: '#f4ede0' }}
                              title="Create request"
                            >
                              Use →
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}