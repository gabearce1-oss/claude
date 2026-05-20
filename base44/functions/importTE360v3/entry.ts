import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import * as XLSX from 'npm:xlsx@0.18.5';

const XLSX_URL = 'https://media.base44.com/files/public/6a0ca84fc17e790fce3ccf92/03087d9ea_TE360_Master_Matrix_v3_MERGED3.xlsx';

function mapClaimStatus(s) {
  const up = (s || '').toUpperCase();
  if (up.includes('VERIFIED')) return 'verified';
  if (up.includes('QUARANTINED') || up.includes('FABRICATED')) return 'fabricated_risk';
  if (up.includes('DISCONFIRMED') || up.includes('REJECTED')) return 'rejected';
  if (up.includes('CORROBORATED')) return 'corroborated';
  if (up.includes('PLAUSIBLE') || up.includes('ORANGE')) return 'plausible';
  if (up.includes('WEAK')) return 'weak_lead';
  return 'unverified';
}

function mapClaimType(claimId) {
  const prefix = (claimId || '').split('-')[0].toUpperCase();
  const m = {
    GEO: 'geographic', MIN: 'property', POL: 'legal', LAND: 'property',
    IND: 'identity', GEN: 'kinship', WF: 'financial', DNA: 'identity',
    ARCH: 'archival', INST: 'archival', LEGAL: 'legal', TRADE: 'financial',
    AUDIT: 'archival',
  };
  return m[prefix] || 'other';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const report = { newClaims: 0, updatedClaims: 0, quarantined: 0, updatedArchives: 0, knowledge: 0, skipped: [] };

    // 1. Fetch the XLSX
    const buf = new Uint8Array(await (await fetch(XLSX_URL)).arrayBuffer());
    const wb = XLSX.read(buf, { type: 'array' });

    // 2. Parse Master Matrix sheet
    const matrixSheet = wb.Sheets['Master Matrix (75 Claims)'];
    const matrixRows = XLSX.utils.sheet_to_json(matrixSheet, { header: 1, defval: null });
    // Columns: [0]=Claim ID, [1]=Pipe, [2]=Claim Text, [3]=Date Range, [4]=Status,
    // [5]=Conf., [6]=Link Type, [7]=Burden of Proof, [8]=Risk, [9]=Contam.,
    // [10]=Review Status, [11]=Archive Target, [12]=Source Ref
    const v3Claims = [];
    for (const row of matrixRows) {
      if (!row || !row[0]) continue;
      const id = String(row[0]).trim();
      if (!/^[A-Z]+-\d{3}$/.test(id)) continue; // only real claim IDs like GEO-001
      v3Claims.push({
        id,
        pipe: row[1] || '',
        text: row[2] || '',
        dateRange: row[3] || '',
        status: row[4] || '',
        confidence: row[5],
        burden: row[7] || '',
        risk: row[8],
        contam: row[9],
        archiveTarget: row[11] || '',
        sourceRef: row[12] || '',
      });
    }

    // 3. Parse Quarantine Register sheet
    const qSheet = wb.Sheets['Quarantine Register'];
    const qRows = XLSX.utils.sheet_to_json(qSheet, { header: 1, defval: null });
    const quarantined = {};
    for (const row of qRows) {
      if (!row || !row[0]) continue;
      const id = String(row[0]).trim();
      if (!/^[A-Z]+-\d{3}$/.test(id)) continue;
      quarantined[id] = {
        status: row[2] || '',
        text: row[3] || '',
        reason: row[4] || '',
        protocol: row[5] || '',
      };
    }

    // 4. Parse Archive Targets & Contacts
    const aSheet = wb.Sheets['Archive Targets & Contacts'];
    const aRows = XLSX.utils.sheet_to_json(aSheet, { header: 1, defval: null });
    const archiveContacts = []; // [{name, location, access, address, contact, claims, status, notes}]
    for (const row of aRows) {
      if (!row || !row[0]) continue;
      const name = String(row[0]).trim();
      if (name === 'Archive' || name.includes('Archive Targets')) continue;
      archiveContacts.push({
        name,
        location: row[1] || '',
        access: row[2] || '',
        address: row[3] || '',
        contact: row[4] || '',
        claims: row[5] || '',
        status: row[6] || '',
        notes: row[7] || '',
      });
    }

    // 5. Load existing claims keyed by subject (source ID)
    const existingClaims = await base44.asServiceRole.entities.Claim.list();
    const claimBySubject = {};
    for (const c of existingClaims) if (c.subject) claimBySubject[c.subject] = c;

    // 6. Upsert claims
    for (const v3 of v3Claims) {
      const q = quarantined[v3.id];
      const isQuarantined = !!q;
      const confidence = Math.round((parseFloat(v3.confidence) || 0) * 10);
      const risk = Math.round((parseFloat(v3.risk) || 0) * 10);
      const contam = Math.round((parseFloat(v3.contam) || 0) * 10);
      const status = isQuarantined ? mapClaimStatus(q.status) : mapClaimStatus(v3.status);

      const existing = claimBySubject[v3.id];
      if (existing) {
        // Only update fields that changed materially (status / quarantine reason / scores)
        const patch = {};
        if (existing.status !== status) patch.status = status;
        if (existing.confidence_score !== confidence) patch.confidence_score = confidence;
        if (existing.risk_score !== risk) patch.risk_score = risk;
        if (isQuarantined) {
          patch.contested = true;
          patch.private_notes = `QUARANTINED: ${q.reason}\nProtocol: ${q.protocol}`;
        }
        if (Object.keys(patch).length > 0) {
          await base44.asServiceRole.entities.Claim.update(existing.id, patch);
          report.updatedClaims++;
          if (isQuarantined) report.quarantined++;
        }
      } else {
        // New claim
        const payload = {
          case_id: 'Terminel-Sagasta',
          claim_text: v3.text,
          claim_type: mapClaimType(v3.id),
          status,
          confidence_score: confidence,
          risk_score: risk,
          burden_of_proof: v3.burden || 'TBD',
          subject: v3.id,
          predicate: v3.pipe,
          rationale: v3.sourceRef ? `Source ref: ${v3.sourceRef}` : '',
          needed_proof: v3.archiveTarget
            ? v3.archiveTarget.split(/[;,]/).map((s) => s.trim()).filter(Boolean)
            : [],
          contested: isQuarantined,
          private_notes: isQuarantined ? `QUARANTINED: ${q.reason}\nProtocol: ${q.protocol}` : '',
        };
        await base44.asServiceRole.entities.Claim.create(payload);
        report.newClaims++;
        if (isQuarantined) report.quarantined++;
      }
    }

    // 7. Update ArchiveRequest notes with v3 contact info (match by name substring)
    const existingArchives = await base44.asServiceRole.entities.ArchiveRequest.list();
    for (const ac of archiveContacts) {
      const nameLower = ac.name.toLowerCase();
      const match = existingArchives.find((a) => {
        const tgt = (a.record_target || '').toLowerCase();
        // Match on first significant word (AHES, AGES, FamilySearch, etc.)
        const acFirst = nameLower.split(/[—–\-:]/)[0].trim().split(/\s+/)[0];
        return acFirst && acFirst.length > 2 && tgt.includes(acFirst);
      });
      if (!match) { report.skipped.push(`no archive match for "${ac.name}"`); continue; }
      const newNotes = [
        ac.address && `Address: ${ac.address}`,
        ac.contact && `Contact: ${ac.contact}`,
        ac.access && `Access: ${ac.access}`,
        ac.claims && `Related claims: ${ac.claims}`,
        ac.notes && `Notes: ${ac.notes}`,
      ].filter(Boolean).join(' · ');
      if (newNotes && match.notes !== newNotes) {
        await base44.asServiceRole.entities.ArchiveRequest.update(match.id, { notes: newNotes });
        report.updatedArchives++;
      }
    }

    // 8. Add this v3 matrix itself as a KnowledgeDocument
    const existingDocs = await base44.asServiceRole.entities.KnowledgeDocument.list();
    const title = 'TE360 Master Evidence Matrix v3 — 75 Claims (May 20 2026)';
    if (!existingDocs.find((d) => d.title === title)) {
      await base44.asServiceRole.entities.KnowledgeDocument.create({
        case_id: 'Terminel-Sagasta',
        title,
        doc_type: 'dataset_audit',
        summary: '75 claims across 9 pipes (GEO+MIN, POL, LAND, IND, GEN+FAM, WF, LEGAL, ARCH, AUDIT+INST). Audit score 28/100 — primary archival research phase. 35 verified, 35 orange leads, 5 red/quarantined.',
        key_findings: [
          '35 VERIFIED · 35 ORANGE (leads) · 5 RED/QUARANTINED · Audit score 28/100',
          'Gap to 75/100 = one trip to Hermosillo + four formal letters',
          'WF-007, WF-008 fabrications permanently quarantined (NOG-1900-0117-001 etc., $639,187,500 restitution)',
          'POL-005 downgraded: Diario XXXVI Leg. names Francisco López, not Terminel',
          'ARCH-003 DISCONFIRMED by Grijalva Díaz 2024 (Banco Agrícola Sonorense founders)',
        ],
        trust_tier: 'mixed',
        file_url: XLSX_URL,
        file_type: 'other',
        language: 'en',
        author_source: 'TE360 Pass 3.1',
        tags: ['master matrix', 'nine pipes', 'audit score', 'quarantine'],
        related_archives: ['AHES', 'AGES', 'AGN', 'FAPECFT', 'Wells Fargo Historical Services', 'Huntington', 'NARA', 'FamilySearch'],
        ingested_at: new Date().toISOString(),
      });
      report.knowledge++;
    }

    return Response.json({ ok: true, report });
  } catch (error) {
    console.error('v3 import failed:', error.message, error.stack);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});