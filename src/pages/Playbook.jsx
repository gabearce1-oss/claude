import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Search, BookOpen } from 'lucide-react';

import { playbookSources } from '../components/playbook/playbookData';
import SourceCard from '../components/playbook/SourceCard';
import TE360Overview from '../components/playbook/TE360Overview';
import EntityRegistry from '../components/playbook/EntityRegistry';

const ARCHIVE_REQUEST_SOURCES = new Set([
  'AGN', 'AHES', 'HNDM', 'Chronicling America', 'Library of Congress',
  'FamilySearch', 'UNISON', 'COLSON', 'Bancroft',
  'U Arizona Special Collections', 'NARA', 'Wells Fargo Archives',
]);

export default function PlaybookPage() {
  const [filter, setFilter] = useState('');
  const [priority, setPriority] = useState('all');
  const navigate = useNavigate();
  const qc = useQueryClient();

  const createRequest = useMutation({
    mutationFn: (data) => base44.entities.ArchiveRequest.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['archiveRequests'] }),
  });

  const handleCreateRequest = async (source, query) => {
    const sourceName = ARCHIVE_REQUEST_SOURCES.has(source.name) ? source.name : 'Other';
    await createRequest.mutateAsync({
      case_id: 'Terminel-Sagasta',
      source: sourceName,
      record_target: source.full_name,
      query_used: query,
      status: 'planned',
      notes: `Auto-created from playbook. Source: ${source.full_name}.`,
    });
    navigate('/archive-requests');
  };

  const visibleSources = useMemo(() => {
    return playbookSources.filter((s) => priority === 'all' || s.priority === priority);
  }, [priority]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4ede0' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b"
        style={{
          borderColor: '#d4cdb8',
          background: 'linear-gradient(180deg, #f4ede0 0%, #ebe1ce 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-8 py-10">
          <Link to="/" className="text-xs inline-flex items-center gap-2 mb-4 hover:opacity-70" style={{ color: '#6b6559' }}>
            <ArrowLeft className="w-3 h-3" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-5 h-5" style={{ color: '#1a1815' }} />
            <h1 className="text-4xl font-light" style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}>
              Research Playbook
            </h1>
          </div>
          <p className="text-sm max-w-3xl" style={{ color: '#6b6559', lineHeight: 1.55 }}>
            TruthEngine360 source program for the Terminel–Sagasta case. Copy queries, jump directly into each
            archive's search interface, or turn any query into a tracked Archive Request in one click.
          </p>
        </div>
      </motion.div>

      {/* TE360 architecture overview */}
      <div className="max-w-7xl mx-auto px-8 pt-8">
        <h2
          className="mb-3"
          style={{
            color: '#1a1815',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.72rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          TE360 Integration Layers
        </h2>
        <TE360Overview />
      </div>

      {/* Entity registry */}
      <div className="max-w-7xl mx-auto px-8 pt-8">
        <EntityRegistry />
      </div>

      {/* Working Notebooks (external) */}
      <div className="max-w-7xl mx-auto px-8 pt-8">
        <h2
          className="mb-3"
          style={{
            color: '#1a1815',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.72rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          Working Notebooks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              href: 'https://www.perplexity.ai/spaces/aviana-nela-terminel-sagasta-y-UGfhxZVBT4OogGKpHxmAbg',
              tag: 'Perplexity Space · External',
              title: 'Aviana & Nela Terminel–Sagasta Workspace',
              desc: 'Deep Research threads behind the FINAL Intelligence Report, the master matrix, and the protocol iterations committed here. Auth-walled — opens in a new tab.',
            },
            {
              href: 'https://docs.google.com/spreadsheets/d/1O1j8oJKjIZY0ch6ZKPnsryXEHZkxIcFjT8MZBlQVN7o/edit?gid=1843674911#gid=1843674911',
              tag: 'Google Sheet · External',
              title: 'TE360 Live Spreadsheet',
              desc: 'Live Google Sheet companion to the in-repo CSV / XLSX snapshots. Source of truth for claim status edits before they are re-imported via importTE360v3. Opens in a new tab.',
            },
            {
              href: 'https://ww2.tnstate.edu/ganter/B412%20Extra%20PopGrowthModel.html',
              tag: 'Reference · External',
              title: 'Population Growth Model (TSU B412)',
              desc: 'Tennessee State University reference on population-growth modeling. Drives the live calculator embedded on the Family Genealogy subpage. Opens in a new tab.',
            },
            {
              href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5362358/',
              tag: 'Reference · Peer-Reviewed',
              title: 'PMC5362358 — NCBI / PubMed Central',
              desc: 'Peer-reviewed article (NCBI PMC). Use as a corroborating source for the demographic / genetic / displacement analysis. Verify relevance to the specific IND / GEN claim before citing. Opens in a new tab.',
            },
            {
              href: '/docs/Terminel_Sagasta_Silver_Trail_Timeline.png',
              tag: 'Diagram · Follow the Silver',
              title: 'Terminel–Sagasta · Silver Trail Timeline 1880–1965',
              desc: 'Visual timeline diagram joining six lanes — political events, mining-law framework, Francisco operations, WF corporate succession, the silver-trail (mine → market), and Aviana legal standing. Colored by evidence tier (A verified · B asserted · C unverified · RED fabricated/disconfirmed). Two anchor legal questions at the bottom: could Francisco move silver without Aviana\'s knowledge? Could WF accept it without her consent? Bundled in /public/docs/.',
            },
            {
              href: '/docs/IFDP-599_Robitaille_Banco_Central_Mexicano.pdf',
              tag: 'Reference · Fed IFDP',
              title: 'IFDP-599 · Banco Central Mexicano (Robitaille 1997)',
              desc: 'Federal Reserve Board International Finance Discussion Paper No. 599 (Dec 1997). Studies the Banco Central Mexicano note-redemption and clearing system 1899–1913 — the exact window of Aviana’s 1907 asserted deeds and Francisco’s mining operations. Anchors the WF / LEGAL pipes’ monetary-system context. Bundled in /public/docs/.',
            },
            {
              href: 'https://www.banxico.org.mx/getting-to-know-banco-de-mexico/history-hierarchical-history-.html',
              tag: 'Reference · Banxico',
              title: 'Banco de México — Hierarchical History',
              desc: 'Official Banxico timeline of Mexico’s central-banking institutions. Pre-Banxico era (pre-1925) covered here is the regime under which Banco Central Mexicano and Banco Nacional de México operated; useful for sourcing the LEGAL / WF pipe claims. Opens in a new tab.',
            },
            {
              href: 'https://www.minneapolisfed.org/about-us/our-history/history-of-central-banking',
              tag: 'Reference · MinFed',
              title: 'Minneapolis Fed — History of Central Banking',
              desc: 'Minneapolis Fed primer on central-banking history. Cross-reference for the comparative framing of the Robitaille / IFDP-599 analysis (Suffolk Bank of Boston, free-banking era, etc.). Opens in a new tab.',
            },
            {
              href: 'https://www.scielo.org.mx/scielo.php?script=sci_arttext&pid=S1405-22532015000100002',
              tag: 'Document Lane · Gerber & Passananti 2015',
              title: 'Economic Consequences of Financial Regimes — Mexico & Brazil 1890–1910',
              desc: 'Gerber, J. & Passananti, T. (2015). *América Latina en la historia económica* 22(1), 35–58. SDSU. Anchors the LEGAL / WF pipes for the 1890–1910 regulatory window (1897 Limantour law, Banamex monopoly, 1907 Panic). Classified as SECONDARY SCHOLARLY CONTEXT — partially harvested (article + PDF confirmed; XML structured-export tab pending). NOT case-specific financial evidence.',
            },
            {
              href: 'https://analytics.scielo.org/w/bibliometrics/journal/citation_data',
              tag: 'Metrics Lane · SciELO Analytics',
              title: 'SciELO Bibliometrics — Citation Data',
              desc: 'JOURNAL TELEMETRY endpoint, not narrative evidence. SciELO Analytics (Beta) — citation counts and bibliometric indicators at the journal level. Populates the metrics lane only: fetch timestamp + journal id + period + raw payload + normalized summary. Useful for reporting on the scholarly footprint of the sources cited in the LEGAL pipe; does not verify any case-specific claim. Opens in a new tab.',
            },
            {
              href: '/docs/Sarker_2021_Machine_Learning_Review.pdf',
              tag: 'Technical Ref · ML Methods',
              title: 'Sarker 2021 · Machine Learning Review (SN Computer Science)',
              desc: 'Sarker, I. H. (2021). "Machine Learning: Algorithms, Real-World Applications and Research Directions." SN Computer Science 2:160. DOI 10.1007/s42979-021-00592-x. Springer Nature. SYSTEM-DESIGN reference, NOT case evidence — covers supervised / unsupervised / semi-supervised / reinforcement learning, structured vs semi-structured vs unstructured data, and applications. Anchors the crawler / NER / semantic-search / auto-pipe-tag / drift-detection options discussed for TE360. Bundled in /public/docs/.',
            },
            {
              href: 'https://www.ibm.com/think/topics/machine-learning-algorithms',
              tag: 'Technical Ref · IBM Think',
              title: 'IBM Think · Machine Learning Algorithms',
              desc: 'IBM Think topic page on ML algorithms. SYSTEM-DESIGN reference, NOT case evidence — practitioner-oriented overview of supervised / unsupervised / reinforcement methods plus the standard families (regression, classification, clustering, decision trees, neural networks). Complements the Sarker 2021 review on the same Technical Reference lane. Opens in a new tab.',
            },
            {
              href: 'https://www.geeksforgeeks.org/artificial-intelligence/ai-algorithms/',
              tag: 'Technical Ref · GeeksforGeeks',
              title: 'GeeksforGeeks · AI Algorithms',
              desc: 'GeeksforGeeks reference on AI algorithms (search, optimization, classification, NLP, neural networks). SYSTEM-DESIGN reference, NOT case evidence — practitioner-style overview of the algorithm families useful for the TE360 infrastructure tier (NER on archive responses, semantic search, classifier-assisted pipe tagging). Same Technical Reference lane as Sarker 2021 and IBM Think. Opens in a new tab.',
            },
            {
              href: 'https://blogs.sas.com/content/subconsciousmusings/2020/12/09/machine-learning-algorithm-use/',
              tag: 'Technical Ref · SAS Blogs',
              title: 'SAS · Which ML Algorithm Should I Use?',
              desc: 'SAS Subconscious Musings (Dec 2020). Decision-flow guide for choosing ML algorithms by problem type (regression / classification / clustering / dimensionality reduction / anomaly detection). SYSTEM-DESIGN reference, NOT case evidence — useful for picking the right method per TE360 task (NER vs classifier vs clustering vs anomaly). Same Technical Reference lane as Sarker / IBM / GeeksforGeeks. Opens in a new tab.',
            },
          ].map((nb) => (
            <a
              key={nb.href}
              href={nb.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#ffffff', border: '1px solid #1a1815' }}
            >
              <div
                className="text-xs mb-2 inline-block px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: '#1a1815',
                  color: '#f4ede0',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.1em',
                  fontSize: '0.65rem',
                }}
              >
                {nb.tag}
              </div>
              <h3
                className="text-lg mb-1 font-light"
                style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}
              >
                {nb.title}
              </h3>
              <p className="text-xs" style={{ color: '#6b6559', lineHeight: 1.55 }}>
                {nb.desc}
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* Protocol Library */}
      <div className="max-w-7xl mx-auto px-8 pt-10">
        <h2
          className="mb-3"
          style={{
            color: '#1a1815',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.72rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          Protocol Library
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              to: '/playbook/sha256',
              tag: 'TSK-006 · URGENT',
              title: 'SHA-256 Chain-of-Custody Protocol',
              desc: 'Photograph, name, hash, register. Execute before any other action.',
              band: '#6b1f1f',
            },
            {
              to: '/playbook/living-sources',
              tag: 'ORAL · URGENT',
              title: 'Living Oral-History Sources',
              desc: 'Carmelita Terango: oldest niece, first-generation testimony. Consent script + log. Living sources expire.',
              band: '#6b1f1f',
            },
            {
              to: '/playbook/familysearch',
              tag: 'TSK-001 / TSK-002',
              title: 'FamilySearch Browse Protocol',
              desc: 'Catalogs 704679 (civil) & 704681 (parish). Indigenous-notation hunt for IND-001.',
              band: '#4a5d3a',
            },
            {
              to: '/playbook/wells-fargo',
              tag: 'TSK-004',
              title: 'Wells Fargo Historical Services Letter',
              desc: 'Print-ready inquiry. MAC A0101-017, 420 Montgomery St, San Francisco.',
              band: '#8a6e3c',
            },
            {
              to: '/playbook/pascua-yaqui',
              tag: 'ORAL · CONSULTATION',
              title: 'Pascua Yaqui Cultural Resources Letter',
              desc: 'Tribal-sovereign consultation request to ANARÓ — five questions, no-claim disclaimers, enclosures list. Print-ready.',
              band: '#8a6e3c',
            },
            {
              to: '/playbook/priority-actions',
              tag: 'Master Brief',
              title: 'Priority Action Execution Package',
              desc: 'TSK-001/002, TSK-004, TSK-005, TSK-006 + LAND-004/005. Model letters included.',
              band: '#1a1815',
            },
            {
              to: '/playbook/research-protocol',
              tag: 'DOCTRINE',
              title: 'Research Protocol — Omega Doctrine',
              desc: 'Five-gate admissibility · claim classification · adversarial verification · AI contamination firewall · reference-template integration.',
              band: '#1a1815',
            },
            {
              to: '/playbook/family-genealogy',
              tag: 'LINEAGE',
              title: 'Family Genealogy — Audit Disciplined',
              desc: 'Six generations Terminel–Sagasta with evidentiary status, displacement timeline, and a live TSU B412 generational displacement calculator.',
              band: '#4a5d3a',
            },
            {
              to: '/playbook/database-registry',
              tag: 'REGISTRY · 50+ Sources',
              title: 'Database Registry',
              desc: 'Comprehensive catalog of candidate archival sources across newspapers, regional, banking, immigration, Mexican national, mining/bullion, and US diplomatic. Access-classified (API / browse / scrape / auth / paid) with TE360 pipe relevance per row.',
              band: '#5a6b7a',
            },
            {
              to: '/playbook/foia-crawlers',
              tag: 'FOIA · Exile Patriot',
              title: 'FOIA Requests & n8n Crawlers',
              desc: '5 INAI requests + 3 US FOIA filings + 3 university outreach drafts + 4 n8n crawler configs (qt360.app.n8n.cloud, 30 active). Belongs to the Exile Patriot Project corpus; shares infrastructure with TE360 but keeps evidence separate. PDF bundled in /public/docs/.',
              band: '#6b1f1f',
            },
          ].map((p) => (
            <Link
              key={p.to}
              to={p.to}
              className="block p-4 rounded hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#ffffff', border: `1px solid ${p.band}` }}
            >
              <div
                className="text-xs mb-2 inline-block px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: p.band,
                  color: '#f4ede0',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.1em',
                  fontSize: '0.65rem',
                }}
              >
                {p.tag}
              </div>
              <h3
                className="text-lg mb-1 font-light"
                style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond' }}
              >
                {p.title}
              </h3>
              <p className="text-xs" style={{ color: '#6b6559', lineHeight: 1.55 }}>
                {p.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Source filter + search */}
      <div className="max-w-7xl mx-auto px-8 pt-10">
        <h2
          className="mb-3"
          style={{
            color: '#1a1815',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.72rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          Source Program & Query Playbook
        </h2>

        <div className="flex flex-wrap gap-2 items-center mb-4">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded flex-1 min-w-[240px]"
            style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
          >
            <Search className="w-4 h-4" style={{ color: '#6b6559' }} />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter queries… e.g. San Javier"
              className="flex-1 text-sm bg-transparent outline-none"
              style={{ color: '#1a1815' }}
            />
          </div>
          {['all', 'P0', 'P1', 'P2', 'P3'].map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className="text-xs px-3 py-1.5 rounded"
              style={{
                backgroundColor: priority === p ? '#1a1815' : '#ffffff',
                color: priority === p ? '#f4ede0' : '#1a1815',
                border: '1px solid #1a1815',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.05em',
              }}
            >
              {p === 'all' ? 'All Sources' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Source cards */}
      <div className="max-w-7xl mx-auto px-8 pb-16 space-y-3">
        {visibleSources.map((s) => (
          <SourceCard
            key={s.id}
            source={s}
            filter={filter}
            onCreateRequest={handleCreateRequest}
          />
        ))}
      </div>
    </div>
  );
}