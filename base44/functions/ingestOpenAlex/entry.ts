// OpenAlex literature crawler — replaces Google Scholar.
// Keyword-polled works search → KnowledgeDocument.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ALLOWED_HOSTS = new Set(['api.openalex.org']);

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
    throw new Error(`OpenAlex ${u.hostname} → ${r.status} ${r.statusText} ${t}`.trim());
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
        '"Yaqui" "dispossession"',
        '"Sonora" "mining" "Porfiriato"',
        '"Pima Bajo" OR "Névome"',
        '"Terminel" OR "Verminel"',
        '"Banco Agrícola Sonorense"',
        '"hacienda" "Mexico" "expropriation"',
      ],
      perPage = 25,
      caseId = 'Terminel-Sagasta',
      fromYear = 1850,
      toYear = 2026,
    } = body;

    const existing = await listAllKnowledgeDocs(base44);
    const existingTitles = new Set(existing.map((d) => (d.title || '').toLowerCase()));

    const created = [];
    const skipped = [];
    const errors = [];

    for (const q of queries) {
      try {
        const url = new URL('https://api.openalex.org/works');
        url.searchParams.set('search', q);
        url.searchParams.set('per-page', String(Math.min(Math.max(perPage, 1), 50)));
        url.searchParams.set('filter', `from_publication_date:${fromYear}-01-01,to_publication_date:${toYear}-12-31`);
        const data = await fetchJson(url.toString());

        for (const w of data.results || []) {
          const title = w.title || w.display_name || '';
          if (!title) continue;
          if (existingTitles.has(title.toLowerCase())) {
            skipped.push({ query: q, reason: 'duplicate title', title });
            continue;
          }

          const authors = (w.authorships || [])
            .map((a) => a.author && a.author.display_name)
            .filter(Boolean)
            .slice(0, 6);
          const venue = w.host_venue && (w.host_venue.display_name || w.host_venue.publisher);
          const concepts = (w.concepts || []).slice(0, 4).map((c) => c.display_name).filter(Boolean);

          const lang = (w.language || 'en').toLowerCase();
          const doc = await base44.asServiceRole.entities.KnowledgeDocument.create({
            case_id: caseId,
            title: title.slice(0, 300),
            // doc_type / trust_tier / language MUST come from the enums in
            // base44/entities/KnowledgeDocument.jsonc — any other value
            // fails schema validation and the create() throws.
            doc_type: 'archival_research',
            summary: (w.abstract_inverted_index ? '' : (w.cited_by_count ? `${w.cited_by_count} citations.` : ''))
              + (authors.length ? ` Authors: ${authors.join(', ')}.` : '')
              + (venue ? ` Venue: ${venue}.` : '')
              + (w.publication_year ? ` Year: ${w.publication_year}.` : ''),
            key_findings: [],
            trust_tier: 'plausible',
            file_url: w.doi ? `https://doi.org/${String(w.doi).replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')}` : (w.id || ''),
            file_type: 'other',
            language: lang === 'es' ? 'es' : lang === 'bilingual' ? 'bilingual' : 'en',
            author_source: authors.join('; ') || 'OpenAlex',
            tags: ['openalex', ...concepts, q.slice(0, 60)].filter(Boolean),
            related_archives: ['OpenAlex'],
            ingested_at: new Date().toISOString(),
          });
          created.push({ id: doc.id, title: doc.title, query: q });
          existingTitles.add(title.toLowerCase());
        }
      } catch (e) {
        errors.push({ query: q, error: e.message });
      }
    }

    return Response.json({ ok: true, queries: queries.length, created_count: created.length, skipped_count: skipped.length, error_count: errors.length, created, skipped: skipped.slice(0, 25), errors });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('ingestOpenAlex failed:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
