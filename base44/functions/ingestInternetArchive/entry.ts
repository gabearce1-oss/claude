// Internet Archive items-search crawler.
// Writes hits to KnowledgeDocument (doc_type='internet_archive_item').
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ALLOWED_HOSTS = new Set(['archive.org']);

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
    throw new Error(`IA ${u.hostname} → ${r.status} ${r.statusText} ${t}`.trim());
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
        '"Terminel" Sonora',
        '"Verminel" senator',
        '"Wells Fargo Express" Mexico',
        'Calles Cárdenas desafuero 1935',
        '"Yaqui" Sonora deportation',
        'Porfirio Diaz Sonora mining',
      ],
      rows = 25,
      caseId = 'Terminel-Sagasta',
    } = body;

    const existing = await listAllKnowledgeDocs(base44);
    const existingIaIds = new Set(existing.map((d) => (d.tags || []).find((t) => /^ia:/.test(t))).filter(Boolean));

    const created = [];
    const skipped = [];
    const errors = [];

    for (const q of queries) {
      try {
        const url = new URL('https://archive.org/advancedsearch.php');
        url.searchParams.set('q', q);
        url.searchParams.set('fl[]', 'identifier');
        url.searchParams.append('fl[]', 'title');
        url.searchParams.append('fl[]', 'creator');
        url.searchParams.append('fl[]', 'date');
        url.searchParams.append('fl[]', 'mediatype');
        url.searchParams.append('fl[]', 'description');
        url.searchParams.append('fl[]', 'language');
        url.searchParams.set('rows', String(Math.min(rows, 50)));
        url.searchParams.set('output', 'json');
        const data = await fetchJson(url.toString());
        const docs = (data && data.response && data.response.docs) || [];

        for (const item of docs) {
          const ia = item.identifier;
          if (!ia) continue;
          const tag = `ia:${ia}`;
          if (existingIaIds.has(tag)) {
            skipped.push({ query: q, reason: 'duplicate ia id', identifier: ia });
            continue;
          }
          const title = Array.isArray(item.title) ? item.title[0] : (item.title || ia);
          const creator = Array.isArray(item.creator) ? item.creator.join('; ') : (item.creator || 'Internet Archive');
          const description = Array.isArray(item.description) ? item.description[0] : (item.description || '');

          const doc = await base44.asServiceRole.entities.KnowledgeDocument.create({
            case_id: caseId,
            title: String(title).slice(0, 300),
            doc_type: 'internet_archive_item',
            summary: String(description).slice(0, 1000),
            key_findings: [],
            trust_tier: 'secondary',
            file_url: `https://archive.org/details/${ia}`,
            file_type: 'other',
            language: Array.isArray(item.language) ? item.language[0] : (item.language || 'en'),
            author_source: creator,
            tags: ['internet-archive', tag, item.mediatype || null, q.slice(0, 60)].filter(Boolean),
            related_archives: ['Internet Archive'],
            ingested_at: new Date().toISOString(),
          });
          created.push({ id: doc.id, identifier: ia, title: doc.title });
          existingIaIds.add(tag);
        }
      } catch (e) {
        errors.push({ query: q, error: e.message });
      }
    }

    return Response.json({ ok: true, queries: queries.length, created_count: created.length, skipped_count: skipped.length, error_count: errors.length, created, skipped: skipped.slice(0, 25), errors });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('ingestInternetArchive failed:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
