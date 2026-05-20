import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// One-off importer for the TE360 CSV set.
// Maps source IDs (GEO-001, EV-0001, ENT-0001, ARCH-001) -> Base44 record IDs
// and writes EvidenceClaimLink rows correctly.

const FILES = {
  claims:     'https://media.base44.com/files/public/6a0ca84fc17e790fce3ccf92/5c1d3d49a_TE360_claims.csv',
  evidence:   'https://media.base44.com/files/public/6a0ca84fc17e790fce3ccf92/cae90ef7c_TE360_evidence.csv',
  entities:   'https://media.base44.com/files/public/6a0ca84fc17e790fce3ccf92/e0d6116b1_TE360_entities.csv',
  evClaim:    'https://media.base44.com/files/public/6a0ca84fc17e790fce3ccf92/b0069483f_TE360_evidence_claim_link.csv',
  archives:   'https://media.base44.com/files/public/6a0ca84fc17e790fce3ccf92/1fd8de259_TE360_archive_targets.csv',
  expanded:   'https://media.base44.com/files/public/6a0ca84fc17e790fce3ccf92/873350b24_Terminel_Sagasta_Evidence_Matrix_EXPANDED.csv',
};

// minimal CSV parser — handles quoted fields with commas
function parseCSV(text) {
  const rows = [];
  let cur = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { cur.push(field); field = ''; }
      else if (c === '\n') { cur.push(field); rows.push(cur); cur = []; field = ''; }
      else if (c === '\r') { /* skip */ }
      else { field += c; }
    }
  }
  if (field.length > 0 || cur.length > 0) { cur.push(field); rows.push(cur); }
  const header = rows.shift().map(h => h.trim());
  return rows
    .filter(r => r.some(v => v && v.trim() !== ''))
    .map(r => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])));
}

async function fetchCSV(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return parseCSV(await res.text());
}

// Map CSV uppercase status -> Claim status enum
function mapClaimStatus(s) {
  const m = {
    'VERIFIED': 'verified',
    'CORROBORATED': 'corroborated',
    'PLAUSIBLE': 'plausible',
    'WEAK_LEAD': 'weak_lead',
    'FABRICATED': 'fabricated_risk',
    'FABRICATED_RISK': 'fabricated_risk',
    'REJECTED': 'rejected',
    'UNVERIFIED': 'unverified',
  };
  return m[(s || '').toUpperCase()] || 'unverified';
}

// Derive claim_type from CSV claim_id prefix (GEO/MIN/POL/LAND/IND/GEN/WF/DNA/ARCH/INST)
function mapClaimType(claimId) {
  const prefix = (claimId || '').split('-')[0].toUpperCase();
  const m = {
    GEO:  'geographic',
    MIN:  'property',
    POL:  'legal',
    LAND: 'property',
    IND:  'identity',
    GEN:  'kinship',
    WF:   'financial',
    DNA:  'identity',
    ARCH: 'archival',
    INST: 'archival',
    LEGAL:'legal',
  };
  return m[prefix] || 'other';
}

// Map CSV archive name -> ArchiveRequest source enum
function mapArchiveSource(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('familysearch')) return 'FamilySearch';
  if (n.includes('inegi')) return 'Other';
  if (n.includes('ahes')) return 'AHES';
  if (n.includes('sgm')) return 'Other';
  if (n.includes('unam') || n.includes('inehrm')) return 'Other';
  if (n.includes('fapecft')) return 'Other';
  if (n.includes('agn')) return 'AGN';
  // AGES = Archivo General Agrario (held by RAN — Registro Agrario Nacional).
  // It is NOT the AGN (federal national archive) and is not the AHES (Sonora
  // state archive). The ArchiveRequest enum has no RAN value, so route to
  // 'Other' instead of misclassifying as AGN.
  if (n.includes('ages')) return 'Other';
  if (n.includes('arizona')) return 'U Arizona Special Collections';
  if (n.includes('huntington')) return 'Other';
  if (n.includes('bancroft')) return 'Bancroft';
  if (n.includes('nara')) return 'NARA';
  if (n.includes('wells fargo')) return 'Wells Fargo Archives';
  if (n.includes('hndm')) return 'HNDM';
  if (n.includes('chronicling')) return 'Chronicling America';
  if (n.includes('library of congress')) return 'Library of Congress';
  if (n.includes('colson')) return 'COLSON';
  if (n.includes('unison')) return 'UNISON';
  return 'Other';
}

function mapRequestStatus(s) {
  const raw = (s || '').toLowerCase().trim();
  const m = {
    not_submitted: 'planned',
    planned: 'planned',
    letter_drafted: 'draft',
    drafted: 'draft',
    draft: 'draft',
    letter_sent: 'submitted',
    sent: 'submitted',
    submitted: 'submitted',
    in_progress: 'running',
    running: 'running',
    received: 'responded',
    responded: 'responded',
    closed: 'completed',
    completed: 'completed',
    blocked: 'blocked',
    no_result: 'no_result',
    null_result: 'no_result',
  };
  return m[raw] || 'planned';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const report = { claims: 0, evidence: 0, entities: 0, archives: 0, links: 0, knowledge: 0, skipped: [] };

    // 1. Fetch all CSVs in parallel
    const [claimsCSV, evidenceCSV, entitiesCSV, evClaimCSV, archivesCSV, expandedCSV] = await Promise.all([
      fetchCSV(FILES.claims),
      fetchCSV(FILES.evidence),
      fetchCSV(FILES.entities),
      fetchCSV(FILES.evClaim),
      fetchCSV(FILES.archives),
      fetchCSV(FILES.expanded),
    ]);

    // Build a lookup from the expanded matrix for richer claim metadata
    const expandedById = {};
    for (const r of expandedCSV) expandedById[r.Claim_ID] = r;

    // 2. Load existing records to avoid duplicates (subject field holds source ID).
    //    Must paginate — Base44 list() defaults to 50 rows and the v3 matrix
    //    alone has 75 claims, so a single list() call would only see the first
    //    page and re-create the rest on rerun. Signature is list(sort, limit,
    //    skip) where skip is a record offset.
    const existingClaims = [];
    {
      const limit = 200;
      let skip = 0;
      for (let i = 0; i < 100; i++) {
        const batch = await base44.asServiceRole.entities.Claim.list(null, limit, skip);
        if (!batch || batch.length === 0) break;
        existingClaims.push(...batch);
        if (batch.length < limit) break;
        skip += limit;
      }
    }
    const existingClaimBySubject = {};
    for (const c of existingClaims) if (c.subject) existingClaimBySubject[c.subject] = c;

    // 3. Insert Claims, build ID map
    const claimIdMap = {};   // 'GEO-001' -> base44 id
    for (const row of claimsCSV) {
      const srcId = row.claim_id;
      if (!srcId) continue;
      if (existingClaimBySubject[srcId]) { claimIdMap[srcId] = existingClaimBySubject[srcId].id; continue; }
      const expanded = expandedById[srcId] || {};
      const payload = {
        case_id: 'Terminel-Sagasta',
        claim_text: row.claim_text,
        claim_type: mapClaimType(srcId),
        status: mapClaimStatus(row.status),
        confidence_score: Math.round((parseFloat(row.confidence_score) || 0) * 10),
        risk_score: Math.round((parseFloat(row.risk_score) || 0) * 10),
        burden_of_proof: row.burden_of_proof || expanded.Burden_of_Proof || 'TBD',
        subject: srcId,
        rationale: expanded.Priority_Action || '',
        needed_proof: expanded.Archive_For_Verification
          ? expanded.Archive_For_Verification.split(/[;,]/).map(s => s.trim()).filter(Boolean)
          : [],
      };
      const created = await base44.asServiceRole.entities.Claim.create(payload);
      claimIdMap[srcId] = created.id;
      report.claims++;
    }

    // 4. Insert Entities. Paginate the dedupe lookup — Base44 list()
    //    defaults to ~50 rows, so without this reruns past page 1 would
    //    duplicate entities by normalized_key.
    const existingEntities = [];
    {
      const entPageSize = 200;
      let entSkip = 0;
      for (let i = 0; i < 100; i++) {
        const batch = await base44.asServiceRole.entities.Entity.list(null, entPageSize, entSkip);
        if (!batch || batch.length === 0) break;
        existingEntities.push(...batch);
        if (batch.length < entPageSize) break;
        entSkip += entPageSize;
      }
    }
    const existingEntityByKey = {};
    for (const e of existingEntities) if (e.normalized_key) existingEntityByKey[e.normalized_key] = e;
    const entityIdMap = {};
    const entityTypeMap = { person: 'person', location: 'place', group: 'tribe', organization: 'organization', unknown: 'person' };
    for (const row of entitiesCSV) {
      const srcId = row.entity_id;
      if (!srcId) continue;
      if (existingEntityByKey[srcId]) { entityIdMap[srcId] = existingEntityByKey[srcId].id; continue; }
      const created = await base44.asServiceRole.entities.Entity.create({
        case_id: 'Terminel-Sagasta',
        entity_type: entityTypeMap[row.entity_type] || 'person',
        name: row.entity_name,
        normalized_key: srcId,
      });
      entityIdMap[srcId] = created.id;
      report.entities++;
    }

    // 5. Insert Evidence.
    //    Paginate the dedupe lookup — Base44 list() defaults to ~50 rows,
    //    and the v3 import alone seeds 34 evidence rows on top of any
    //    existing newspaper-ingest output (CA-#### catalog can grow
    //    quickly). Without pagination, reruns past page 1 silently fail
    //    to recognize existing evidence_numbers and create duplicates.
    const existingEvidence = [];
    {
      const evPageSize = 200;
      let evSkip = 0;
      for (let i = 0; i < 100; i++) {
        const batch = await base44.asServiceRole.entities.Evidence.list(null, evPageSize, evSkip);
        if (!batch || batch.length === 0) break;
        existingEvidence.push(...batch);
        if (batch.length < evPageSize) break;
        evSkip += evPageSize;
      }
    }
    const existingEvBySubject = {};
    for (const e of existingEvidence) if (e.evidence_number) existingEvBySubject[e.evidence_number] = e;
    const evidenceIdMap = {};
    for (const row of evidenceCSV) {
      const srcId = row.evidence_id;
      if (!srcId) continue;
      if (existingEvBySubject[srcId]) { evidenceIdMap[srcId] = existingEvBySubject[srcId].id; continue; }
      const created = await base44.asServiceRole.entities.Evidence.create({
        case_id: 'Terminel-Sagasta',
        evidence_number: srcId,
        title: row.source_name || srcId,
        type: 'document',
        status: row.review_status === 'verified' ? 'verified' : 'reviewed',
        source: row.source_system || '',
        notes: row.storage_uri || '',
        provenance_score: Math.round((parseFloat(row.provenance_score) || 0) * 10),
        authenticity_score: Math.round((parseFloat(row.authenticity_score) || 0) * 10),
        contamination_score: Math.round((parseFloat(row.contamination_score) || 0) * 10),
        review_status: row.review_status === 'verified' ? 'accepted' : 'triaged',
        is_primary_source: true,
      });
      evidenceIdMap[srcId] = created.id;
      report.evidence++;
    }

    // 6. Insert Archive Requests. Paginate dedupe.
    const existingArchives = [];
    {
      const arPageSize = 200;
      let arSkip = 0;
      for (let i = 0; i < 100; i++) {
        const batch = await base44.asServiceRole.entities.ArchiveRequest.list(null, arPageSize, arSkip);
        if (!batch || batch.length === 0) break;
        existingArchives.push(...batch);
        if (batch.length < arPageSize) break;
        arSkip += arPageSize;
      }
    }
    const existingArchByNum = {};
    for (const a of existingArchives) if (a.request_number) existingArchByNum[a.request_number] = a;
    for (const row of archivesCSV) {
      const srcId = row.archive_id;
      if (!srcId) continue;
      if (existingArchByNum[srcId]) continue;
      await base44.asServiceRole.entities.ArchiveRequest.create({
        case_id: 'Terminel-Sagasta',
        request_number: srcId,
        source: mapArchiveSource(row.archive_name),
        record_target: row.archive_name,
        status: mapRequestStatus(row.request_status),
        notes: `Location: ${row.location || 'Unknown'} · Access: ${row.access_status || 'unknown'}`,
      });
      report.archives++;
    }

    // 7. Insert Evidence-Claim links.
    //    Must paginate — Base44 list() defaults to 50 rows. Without
    //    pagination the dedupe set covers only the first page and reruns
    //    duplicate every link beyond it, skewing downstream
    //    claim-evidence weighting. Signature is list(sort, limit, skip).
    const existingLinks = [];
    {
      const linkPageSize = 200;
      let linkSkip = 0;
      for (let i = 0; i < 100; i++) {
        const batch = await base44.asServiceRole.entities.EvidenceClaimLink.list(null, linkPageSize, linkSkip);
        if (!batch || batch.length === 0) break;
        existingLinks.push(...batch);
        if (batch.length < linkPageSize) break;
        linkSkip += linkPageSize;
      }
    }
    const existingLinkKeys = new Set(existingLinks.map(l => `${l.evidence_id}|${l.claim_id}`));
    for (const row of evClaimCSV) {
      const evId = evidenceIdMap[row.evidence_id];
      const clId = claimIdMap[row.claim_id];
      if (!evId || !clId) { report.skipped.push(`link ${row.evidence_id}->${row.claim_id}`); continue; }
      const key = `${evId}|${clId}`;
      if (existingLinkKeys.has(key)) continue;
      await base44.asServiceRole.entities.EvidenceClaimLink.create({
        evidence_id: evId,
        claim_id: clId,
        support_role: 'supports',
        weight: parseFloat(row.link_weight) || 0.5,
        excerpt_text: row.excerpt_text || '',
        page_ref: row.page_number || '',
      });
      existingLinkKeys.add(key);
      report.links++;
    }

    // 8. Knowledge documents (Deep Archival Search + Silver Trail timeline + WF letter).
    //    Paginate dedupe — same Base44 list() page-size trap.
    const existingDocs = [];
    {
      const docPageSize = 200;
      let docSkip = 0;
      for (let i = 0; i < 100; i++) {
        const batch = await base44.asServiceRole.entities.KnowledgeDocument.list(null, docPageSize, docSkip);
        if (!batch || batch.length === 0) break;
        existingDocs.push(...batch);
        if (batch.length < docPageSize) break;
        docSkip += docPageSize;
      }
    }
    const existingDocTitles = new Set(existingDocs.map(d => d.title));
    const docs = [
      {
        title: 'Terminel–Sagasta Investigation: Deep Archival Search (May 2026)',
        doc_type: 'archival_research',
        summary: 'Four-archive deep-dive: AHES, Bancroft/Huntington, NARA RG 84, Wells Fargo Historical Services. Includes Integrated Evidence Quality Matrix and prioritized action plan.',
        key_findings: [
          'Primary Wells Fargo records are at Huntington Library Box 34 (Investments in Mexico), NOT the SF museum',
          'AHES Garmendia 157 Sur, Hermosillo — protocolos notariales San Javier/Sahuaripa 1895–1920 are the highest-priority documents',
          'NARA RG 84 confirmed for Hermosillo (11 cu ft) and Nogales (42 cu ft) consular records',
          'WF Express operated Nogales–Sonora bullion routes 1888–1918, ending July 1, 1918',
          'TIER C fabrications (NOG-1900-0117-001 transaction codes, $639,187,500) remain banned from legal filings',
        ],
        trust_tier: 'methodology',
        file_url: 'https://media.base44.com/files/public/6a0ca84fc17e790fce3ccf92/6a72b88b8_TerminelSagastaInvestigationDeepArchivalSearchOfficialRecordsAcrossFourRecommendedArchiveTargets1.pdf',
        file_type: 'pdf',
        page_count: 10,
        language: 'en',
        author_source: 'Deep Research May 2026',
        tags: ['AHES', 'Huntington', 'Bancroft', 'NARA', 'Wells Fargo', 'action plan'],
        related_archives: ['AHES', 'Huntington Library', 'Bancroft', 'NARA', 'Wells Fargo Historical Services', 'FamilySearch', 'HNDM'],
        ingested_at: new Date().toISOString(),
      },
      {
        title: 'Wells Fargo Historical Services — Formal Research Inquiry Letter',
        doc_type: 'archival_research',
        summary: 'Formal letter template to Wells Fargo Historical Services (MAC# N9305-173) requesting archival assistance regarding WF Express / WF y Cía. Sonoran operations 1895–1935.',
        key_findings: [
          'Targets Hermosillo, Guaymas, Ures, Tecoripa, San Javier, Nogales offices',
          'Requests Wiltsee Collection search for Terminel/Verminel/Sagasta/Porchas',
          'Disclaims AI-fabricated transaction IDs and employees',
        ],
        trust_tier: 'methodology',
        file_url: 'https://media.base44.com/files/public/6a0ca84fc17e790fce3ccf92/e88068108_Wells_Fargo_Historical_Services_Letter_Terminel_Sagasta1.pdf',
        file_type: 'pdf',
        page_count: 5,
        language: 'en',
        tags: ['Wells Fargo', 'inquiry letter', 'Wiltsee Collection'],
        related_archives: ['Wells Fargo Historical Services'],
        ingested_at: new Date().toISOString(),
      },
      {
        title: 'Terminel–Sagasta: Follow the Silver — Timeline 1880–1965',
        doc_type: 'forensic_report',
        summary: 'Visual timeline of political events, mining law framework, F.L. Terminel operations, Wells Fargo corporate succession, silver trail (mine→market), and Aviana legal standing. Includes the two governing legal questions on silver movement and WF consent.',
        key_findings: [
          'Legal Q1: Francisco could move silver without Aviana\'s knowledge — 1884/1892 Mining Codes + landowner=concession-holder + zero community-property rights + power of attorney',
          'Legal Q2: WF Express was a common carrier — no consent required from third parties; no BSA/AML regime until 1970; no modern accountability under ESPM/UNDRIP/IACHR until recently',
        ],
        trust_tier: 'methodology',
        file_url: 'https://media.base44.com/images/public/6a0ca84fc17e790fce3ccf92/b7e12e80d_Terminel_Sagasta_Silver_Trail_Timeline1.png',
        file_type: 'other',
        language: 'en',
        tags: ['timeline', 'silver trail', 'legal framework', 'visual'],
        ingested_at: new Date().toISOString(),
      },
    ];
    for (const d of docs) {
      if (existingDocTitles.has(d.title)) continue;
      await base44.asServiceRole.entities.KnowledgeDocument.create(d);
      report.knowledge++;
    }

    return Response.json({ ok: true, report });
  } catch (error) {
    console.error('Import failed:', error.message, error.stack);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});