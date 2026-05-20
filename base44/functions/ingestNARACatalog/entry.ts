// NARA Catalog crawler. Targets RG 84 Hermosillo / Nogales + RG 59 by default.
// Writes hits to KnowledgeDocument (doc_type='nara_catalog_record').
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ALLOWED_HOSTS = new Set(['catalog.archives.gov', 'api.archives.gov']);

function assertHost(rawUrl) {
  let u;
  try { u = new URL(rawUrl); } catch { throw new Error('Invalid URL'); }
  if (u.protocol === 'http:') u.protocol = 'https:';
  if (u.protocol !== 'https:') throw new Error(`Disallowed protocol: ${u.protocol}`);
  if (!ALLOWED_HOSTS.has(u.hostname)) throw new Error(`Disallowed host: ${u.hostname}`);
  return u;
}

async function requireCaller(req, base44) {
  let user = null;
  try { user = await base44.auth.me(); } catch (_) {}
  if (user && user.role === 'admin') return;
  const expected = Deno.env.get('AUTOMATION_SECRET');
  const presented = req.headers.get('x-automation-secret') ||
    (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (expected && presented && presented === expected) return;
  throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
}

async function fetchJson(url) {
  const u = assertHost(url);
  const r = await fetch(u.toString(), { headers: { Accept: 'application/json' } });
  if (!r.ok) {
    const t = await r.text().catch(() => '');
    throw new Error(`NARA ${u.hostname} → ${r.status} ${r.statusText} ${t}`.trim());
  }
  return r.json();
}

async function listAllKnowledgeDocs(base44) {
  const all = [];
  const limit = 200;
  let skip = 0;
  for (let i = 0; i < 100; i++) {
    const batch = await base44.asServiceRole.entities.KnowledgeDocument.list(null, limit, skip);
    if (!batch || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < limit) break;
    skip += limit;
  }
  return all;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    await requireCaller(req, base44);

    const body = await req.json().catch(() => ({}));
    const {
      queries = [
        'Hermosillo consul',
        'Nogales consul Sonora',
        'Wells Fargo Express Mexico',
        'Yaqui Sonora 1908',
        'Terminel Mexico',
      ],
      caseId = 'Terminel-Sagasta',
      limit = 25,
    } = body;

    const existing = await listAllKnowledgeDocs(base44);
    const existingIds = new Set(existing.map((d) => (d.tags || []).find((t) => /^nara:/.test(t))).filter(Boolean));

    const created = [];
    const skipped = [];
    const errors = [];

    for (const q of queries) {
      try {
        const url = new URL('https://catalog.archives.gov/api/v2/records/search');
        url.searchParams.set('q', q);
        url.searchParams.set('limit', String(Math.min(limit, 50)));
        const data = await fetchJson(url.toString());
        const records = (data && data.body && data.body.hits && data.body.hits.hits) || [];

        for (const rec of records) {
          const src = rec._source || rec.fields || {};
          const naId = src.naId || src.id || rec._id;
          const tag = `nara:${naId}`;
          if (!naId) continue;
          if (existingIds.has(tag)) {
            skipped.push({ query: q, reason: 'duplicate naId', naId });
            continue;
          }

          const title = (Array.isArray(src.title) ? src.title[0] : src.title) || `NARA ${naId}`;
          const recordGroup = (Array.isArray(src.recordGroupNumber) ? src.recordGroupNumber[0] : src.recordGroupNumber) || '';
          const description = (Array.isArray(src.scopeAndContentNote) ? src.scopeAndContentNote[0] : src.scopeAndContentNote) || '';

          const doc = await base44.asServiceRole.entities.KnowledgeDocument.create({
            case_id: caseId,
            title: String(title).slice(0, 300),
            doc_type: 'nara_catalog_record',
            summary: String(description).slice(0, 1000),
            key_findings: [],
            trust_tier: 'primary',
            file_url: `https://catalog.archives.gov/id/${naId}`,
            file_type: 'other',
            language: 'en',
            author_source: recordGroup ? `NARA RG ${recordGroup}` : 'NARA Catalog',
            tags: ['nara', tag, recordGroup ? `RG-${recordGroup}` : null, q.slice(0, 60)].filter(Boolean),
            related_archives: ['NARA'],
            ingested_at: new Date().toISOString(),
          });
          created.push({ id: doc.id, naId, title: doc.title });
          existingIds.add(tag);
        }
      } catch (e) {
        errors.push({ query: q, error: e.message });
      }
    }

    return Response.json({ ok: true, queries: queries.length, created_count: created.length, skipped_count: skipped.length, error_count: errors.length, created, skipped: skipped.slice(0, 25), errors });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('ingestNARACatalog failed:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
