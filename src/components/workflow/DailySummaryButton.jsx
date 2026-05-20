import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileDown, Loader2 } from 'lucide-react';
import { exportDailySummary } from './exportDailySummary';
import { listAll } from '@/lib/base44/pagination';

export default function DailySummaryButton() {
  const [generating, setGenerating] = useState(false);

  const { data: evidence = [] } = useQuery({
    queryKey: ['evidence'],
    queryFn: () => listAll(base44.entities.Evidence),
  });
  const { data: claims = [] } = useQuery({
    queryKey: ['claims'],
    queryFn: () => listAll(base44.entities.Claim),
  });
  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const handleExport = async () => {
    setGenerating(true);
    try {
      await new Promise((r) => setTimeout(r, 30));
      exportDailySummary({ evidence, claims, operatorEmail: me?.email || '' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={generating}
      className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs hover:opacity-90 disabled:opacity-60"
      style={{
        backgroundColor: '#c44536',
        color: '#f4ede0',
        border: '1px solid #1a1815',
        fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      {generating ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <FileDown className="w-3.5 h-3.5" />
      )}
      {generating ? 'Generating…' : 'Daily Summary PDF'}
    </button>
  );
}