import React, { useState } from 'react';
import { Copy, ExternalLink, Check, Plus } from 'lucide-react';

export default function QueryRow({ query, searchUrl, onCreateRequest }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(query);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded group"
      style={{ backgroundColor: '#f9f5ed', border: '1px solid #ebe1ce' }}
    >
      <code
        className="flex-1 min-w-0 truncate text-xs"
        style={{ color: '#1a1815', fontFamily: 'JetBrains Mono, monospace' }}
        title={query}
      >
        {query}
      </code>
      <button
        onClick={copy}
        title="Copy query"
        className="p-1 hover:opacity-70"
        style={{ color: copied ? '#4a5d3a' : '#6b6559' }}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      {searchUrl && (
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in source"
          className="p-1 hover:opacity-70"
          style={{ color: '#3a3530' }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
      <button
        onClick={() => onCreateRequest(query)}
        title="Create archive request"
        className="p-1 hover:opacity-70"
        style={{ color: '#1a1815' }}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}