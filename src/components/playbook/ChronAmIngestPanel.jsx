import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

// Terminel-Sagasta case queries (mirrors the Python batch script).
const CASE_QUERIES = [
  'Terminel',
  'Sagasta',
  'Aviana Sagasta',
  'Francisco Terminel',
  'San Javier Sonora',
  'Sahuaripa',
  'Wells Fargo Nogales',
  'Banco Agricola Sonorense',
  'Yaqui Sonora deportation',
];

const START_DATE = '1880-01-01';
const END_DATE = '1940-12-31';

function buildSearchUrl(query) {
  const params = new URLSearchParams({
    dl: 'page',
    ops: 'PHRASE',
    qs: query,
    searchType: 'advanced',
    start_date: START_DATE,
    end_date: END_DATE,
    fo: 'json',
  });
  return `https://www.loc.gov/collections/chronicling-america/?${params.toString()}`;
}

export default function ChronAmIngestPanel() {
  const [searchURL, setSearchURL] = useState(buildSearchUrl('Terminel'));
  const [activePreset, setActivePreset] = useState('Terminel');
  const [maxItems, setMaxItems] = useState(10);
  const [metadataOnly, setMetadataOnly] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const qc = useQueryClient();

  const handlePreset = (q) => {
    setActivePreset(q);
    setSearchURL(buildSearchUrl(q));
    setResult(null);
    setError(null);
  };

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke('ingestChroniclingAmerica', {
        searchURL,
        fileExtension: 'pdf',
        maxItems: Number(maxItems) || 5,
        uploadFiles: !metadataOnly,
        metadataOnly,
      });
      setResult(res.data);
      qc.invalidateQueries({ queryKey: ['evidence'] });
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Ingest failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="rounded p-4 mt-3" style={{ backgroundColor: '#f9f5ed', border: '1px dashed #b8ad97' }}>
      <p
        className="mb-2"
        style={{
          color: '#1a1815',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.68rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}
      >
        Auto-Ingest from Chronicling America
      </p>
      <p className="text-xs mb-3" style={{ color: '#6b6559', lineHeight: 1.5 }}>
        Pick a Terminel–Sagasta case query (or paste your own URL) and ingest matching newspaper pages as Evidence.
      </p>

      {/* Case-query presets */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {CASE_QUERIES.map((q) => {
          const isActive = activePreset === q;
          return (
            <button
              key={q}
              onClick={() => handlePreset(q)}
              className="text-xs px-2.5 py-1 rounded transition-opacity hover:opacity-80"
              style={{
                backgroundColor: isActive ? '#1a1815' : '#ffffff',
                color: isActive ? '#f4ede0' : '#1a1815',
                border: '1px solid #1a1815',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                letterSpacing: '0.05em',
              }}
            >
              {q}
            </button>
          );
        })}
      </div>

      <input
        type="text"
        value={searchURL}
        onChange={(e) => {
          setSearchURL(e.target.value);
          setActivePreset(null);
        }}
        placeholder="https://www.loc.gov/collections/chronicling-america/?..."
        className="w-full text-xs px-3 py-2 rounded mb-2"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #d4cdb8',
          color: '#1a1815',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      />

      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-xs flex items-center gap-2" style={{ color: '#3a3530' }}>
          Max items:
          <input
            type="number"
            min="1"
            max="50"
            value={maxItems}
            onChange={(e) => setMaxItems(e.target.value)}
            className="w-16 px-2 py-1 rounded text-xs"
            style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8', color: '#1a1815' }}
          />
        </label>

        <label className="text-xs flex items-center gap-1.5 cursor-pointer" style={{ color: '#3a3530' }}>
          <input
            type="checkbox"
            checked={metadataOnly}
            onChange={(e) => setMetadataOnly(e.target.checked)}
          />
          Metadata-only (catalog hits, no file download)
        </label>

        <button
          onClick={handleRun}
          disabled={running || !searchURL.trim()}
          className="text-xs px-3 py-1.5 rounded inline-flex items-center gap-1.5 disabled:opacity-50 ml-auto"
          style={{ backgroundColor: '#1a1815', color: '#f4ede0' }}
        >
          {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
          {running ? 'Ingesting…' : 'Run Ingest'}
        </button>
      </div>

      {error && (
        <div
          className="mt-3 p-2 rounded text-xs flex items-start gap-2"
          style={{ backgroundColor: '#fbeae5', color: '#6b1f1f' }}
        >
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div
          className="mt-3 p-3 rounded text-xs"
          style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8', color: '#1a1815' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#4a5d3a' }} />
            <strong>
              Ingest complete · searched {result.searched} · created {result.created_count} · skipped{' '}
              {result.skipped_count} · errors {result.error_count}
            </strong>
          </div>
          {result.created?.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {result.created.map((c) => (
                <li key={c.id} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {c.evidence_number} — {c.page_url}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}