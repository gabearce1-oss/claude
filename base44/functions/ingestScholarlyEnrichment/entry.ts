// Crossref + Semantic Scholar enrichment. Given a list of DOIs (or
// titles) returns canonical metadata + citation graph for each.
// Writes summary to KnowledgeDocument when a new DOI is found.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ALLOWED_HOSTS = new Set([
  'api.crossref.org',
  'api.semanticscholar.org',
]);

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

async function fetchJson(url, opts = {}) {
  const u = assertHost(url);
  const r = await fetch(u.toString(), { headers: { Accept: 'application/json', ...(opts.headers || {}) } });
  if (!r.ok) {
    const t = await r.text().catch(() => '');
    throw new Error(`${u.hostname} → ${r.status} ${r.statusText} ${t}`.trim());
  }
  return r.json();
}

async function crossrefByDOI(doi) {
  const data = await fetchJson(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
  const msg = data.message || {};
  return {
    doi,
    title: (msg.title || [])[0] || null,
    authors: (msg.author || []).map((a) => [a.given, a.family].filter(Boolean).join(' ')).filter(Boolean),
    venue: (msg['container-title'] || [])[0] || null,
    year: msg.issued && msg.issued['date-parts'] && msg.issued['date-parts'][0] && msg.issued['date-parts'][0][0],
    citation_count: msg['is-referenced-by-count'] || 0,
    references: (msg.reference || []).slice(0, 50).map((r) => r.DOI || r.unstructured || null).filter(Boolean),
  };
}

async function semanticScholarByDOI(doi) {
  const key = Deno.env.get('SEMANTIC_SCHOLAR_API_KEY');
  const url = `https://api.semanticscholar.org/graph/v1/paper/DOI:${encodeURIComponent(doi)}?fields=title,authors,year,abstract,citationCount,referenceCount,influentialCitationCount,venue`;
  const data = await fetchJson(url, key ? { headers: { 'x-api-key': key } } : {});
  return {
    doi,
    title: data.title,
    authors: (data.authors || []).map((a) => a.name),
    year: data.year,
    venue: data.venue,
    abstract: data.abstract,
    citation_count: data.citationCount,
    influential_citations: data.influentialCitationCount,
    reference_count: data.referenceCount,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    await requireCaller(req, base44);

    const body = await req.json().catch(() => ({}));
    const { dois = [], caseId = 'Terminel-Sagasta', writeToKnowledge = false } = body;
    if (!Array.isArray(dois) || dois.length === 0) {
      return Response.json({ error: 'Provide { dois: [...] } in body' }, { status: 400 });
    }

    const results = [];
    const errors = [];
    for (const doi of dois) {
      try {
        const [cr, ss] = await Promise.allSettled([crossrefByDOI(doi), semanticScholarByDOI(doi)]);
        const merged = {
          doi,
          crossref: cr.status === 'fulfilled' ? cr.value : { error: cr.reason && cr.reason.message },
          semantic_scholar: ss.status === 'fulfilled' ? ss.value : { error: ss.reason && ss.reason.message },
        };
        results.push(merged);

        if (writeToKnowledge && cr.status === 'fulfilled') {
          await base44.asServiceRole.entities.KnowledgeDocument.create({
            case_id: caseId,
            title: (cr.value.title || `DOI ${doi}`).slice(0, 300),
            doc_type: 'scholarly_literature',
            summary:
              (ss.status === 'fulfilled' && ss.value.abstract ? ss.value.abstract.slice(0, 800) : '') +
              ` Citations: Crossref ${cr.value.citation_count}, Semantic Scholar ${ss.status === 'fulfilled' ? ss.value.citation_count : 'n/a'}.`,
            trust_tier: 'secondary',
            file_url: `https://doi.org/${doi}`,
            file_type: 'other',
            language: 'en',
            author_source: cr.value.authors.join('; ') || 'Crossref',
            tags: ['crossref', 'semantic-scholar', `doi:${doi}`],
            related_archives: ['Crossref', 'Semantic Scholar'],
            ingested_at: new Date().toISOString(),
          });
        }
      } catch (e) {
        errors.push({ doi, error: e.message });
      }
    }

    return Response.json({ ok: true, dois: dois.length, results, errors });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('ingestScholarlyEnrichment failed:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
