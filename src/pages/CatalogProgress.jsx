import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { CATALOGS, CATALOG_ITEMS } from '../components/catalogs/sahuaripaCatalogData';
import CatalogSection from '../components/catalogs/CatalogSection';

// Match evidence -> catalog item by film number + record type / keywords.
function matchEvidenceToItem(evidence, item) {
  const haystack = [
    evidence.title,
    evidence.notes,
    evidence.collection_name,
    evidence.call_number,
    evidence.source,
    (evidence.tags || []).join(' '),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const hasFilm = haystack.includes(item.film);
  if (!hasFilm) return false;

  // Require at least one record-type keyword (beyond the film number itself)
  const recordKw = item.match_keywords.filter((k) => k !== item.film);
  const hasRecordKw = recordKw.some((k) => haystack.includes(k.toLowerCase()));
  if (!hasRecordKw) return false;

  // Date filter (use record_date_start/end if available)
  if (evidence.record_date_start) {
    if (evidence.record_date_start > item.date_filter.end) return false;
    const endRef = evidence.record_date_end || evidence.record_date_start;
    if (endRef < item.date_filter.start) return false;
  }
  return true;
}

export default function CatalogProgressPage() {
  const { data: evidence = [] } = useQuery({
    queryKey: ['evidence'],
    queryFn: () => base44.entities.Evidence.list(),
  });
  const { data: links = [] } = useQuery({
    queryKey: ['evidenceClaimLinks'],
    queryFn: () => base44.entities.EvidenceClaimLink.list(),
  });

  const { evidenceByItem, linksByItem, totals } = useMemo(() => {
    const ebi = {};
    const lbi = {};
    CATALOG_ITEMS.forEach((it) => {
      const matched = evidence.filter((e) => matchEvidenceToItem(e, it));
      ebi[it.id] = matched;
      const matchedIds = new Set(matched.map((e) => e.id));
      lbi[it.id] = links.filter((l) => matchedIds.has(l.evidence_id));
    });

    const allLinkedEvidence = Object.values(ebi).flat();
    const t = {
      items: CATALOG_ITEMS.length,
      linked: new Set(allLinkedEvidence.map((e) => e.id)).size,
      verified: new Set(allLinkedEvidence.filter((e) => e.status === 'verified').map((e) => e.id))
        .size,
      pending: CATALOG_ITEMS.filter((it) => (ebi[it.id] || []).length === 0).length,
    };
    return { evidenceByItem: ebi, linksByItem: lbi, totals: t };
  }, [evidence, links]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4ede0' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b"
        style={{ borderColor: '#d4cdb8' }}
      >
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Link
            to="/"
            className="text-xs inline-flex items-center gap-2 mb-4 hover:opacity-70"
            style={{ color: '#6b6559' }}
          >
            <ArrowLeft className="w-3 h-3" /> Back to Case File
          </Link>
          <h1
            className="text-4xl font-light"
            style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}
          >
            Catalog Progress
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6b6559' }}>
            Sahuaripa Parish (704681) · Civil Registration (704679) · Corrected browse sequence
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <Tile label="Browse Targets" value={totals.items} />
            <Tile label="With Evidence" value={totals.items - totals.pending} />
            <Tile label="Verified" value={totals.verified} />
            <Tile label="Awaiting" value={totals.pending} />
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        {CATALOGS.map((cat) => (
          <CatalogSection
            key={cat.key}
            catalog={cat}
            items={CATALOG_ITEMS.filter((it) => it.catalog === cat.key).sort(
              (a, b) => a.priority - b.priority
            )}
            evidenceByItem={evidenceByItem}
            linksByItem={linksByItem}
          />
        ))}

        <p
          className="text-xs mt-6 p-4 rounded"
          style={{
            color: '#6b6559',
            backgroundColor: '#ebe1ce',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.05em',
          }}
        >
          METHOD RULE — Manual browse is the governing method for 1880–1920. Indexed search
          alone is not reliable evidence of absence: OCR/CAI mutates Terminel→Terminol and
          Sagasta→Sagesto. Tag evidence with film number (704681 / 704679) and record type
          (baptism, nacimiento, matrimonio, defuncion) to surface it here.
        </p>
      </div>
    </div>
  );
}

function Tile({ label, value }) {
  return (
    <div className="p-3 rounded" style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}>
      <p
        className="text-xs"
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.15em',
          color: '#6b6559',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </p>
      <p
        className="text-3xl font-light"
        style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}
      >
        {value}
      </p>
    </div>
  );
}