import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Download, Loader2 } from 'lucide-react';
import { exportAuditReport } from './exportAuditReport';
import { listAll } from '@/lib/base44/pagination';

export default function ExportReportButton() {
  const [generating, setGenerating] = useState(false);

  const { data: evidence = [] } = useQuery({
    queryKey: ['evidence'],
    queryFn: () => listAll(base44.entities.Evidence),
  });
  const { data: claims = [] } = useQuery({
    queryKey: ['claims'],
    queryFn: () => listAll(base44.entities.Claim),
  });
  const { data: archiveRequests = [] } = useQuery({
    queryKey: ['archiveRequests'],
    queryFn: () => listAll(base44.entities.ArchiveRequest),
  });

  const handleExport = async () => {
    setGenerating(true);
    try {
      // Small async yield so the spinner can render before jsPDF's sync work blocks the thread.
      await new Promise((r) => setTimeout(r, 30));
      exportAuditReport({ evidence, claims, archiveRequests });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={generating}
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded text-sm transition-colors hover:opacity-90 disabled:opacity-60"
      style={{
        backgroundColor: '#c44536',
        color: '#f4ede0',
        border: '1px solid #1a1815',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.72rem',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      {generating ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      {generating ? 'Generating…' : 'Export PDF'}
    </button>
  );
}