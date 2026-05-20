// INEGI + INE Mexican open-data fetcher.
// Returns JSON only — no DB writes (no MexicanDataSeries entity yet).
// INEGI needs API token in env: INEGI_TOKEN (https://www.inegi.org.mx/servicios/api_indicadores.html)
// INE: public-data CSV/JSON endpoints; no auth required.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ALLOWED_HOSTS = new Set([
  'www.inegi.org.mx',
  'inegi.org.mx',
  'gaia.inegi.org.mx',
  'www.ine.mx',
  'ine.mx',
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

async function fetchJson(url) {
  const u = assertHost(url);
  const r = await fetch(u.toString(), { headers: { Accept: 'application/json' } });
  if (!r.ok) {
    const t = await r.text().catch(() => '');
    throw new Error(`${u.hostname} → ${r.status} ${r.statusText} ${t}`.trim());
  }
  return r.json();
}

async function fetchInegiIndicator(indicator, geo = '0700002604') {
  // 0700002604 = Sonora estado. Override per request body if needed.
  const token = Deno.env.get('INEGI_TOKEN');
  if (!token) throw new Error('INEGI_TOKEN env var not set');
  const url = `https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR/${indicator}/es/${geo}/false/BISE/2.0/${token}?type=json`;
  return fetchJson(url);
}

async function fetchIneOpenData(endpoint) {
  // INE serves Open-Data via various endpoints; treat caller-supplied path as a known dataset slug.
  // The endpoint is constructed from a known dataset id; arbitrary strings are NOT allowed.
  // INE datasets may be served as JSON or CSV depending on the endpoint, so
  // parse by Content-Type / extension rather than forcing r.json() — otherwise
  // a valid CSV dataset surfaces as an "error" in the response.
  const u = assertHost(`https://www.ine.mx/datos-abiertos/${endpoint}`);
  const r = await fetch(u.toString(), { headers: { Accept: 'application/json, text/csv;q=0.9, */*;q=0.5' } });
  if (!r.ok) {
    const t = await r.text().catch(() => '');
    throw new Error(`${u.hostname} → ${r.status} ${r.statusText} ${t}`.trim());
  }
  const ct = (r.headers.get('content-type') || '').toLowerCase();
  const isCsv = ct.includes('csv') || /\.csv($|\?)/i.test(u.pathname);
  if (isCsv) {
    const text = await r.text();
    return { format: 'csv', content_type: ct || 'text/csv', csv: text };
  }
  if (ct.includes('json')) {
    return { format: 'json', content_type: ct, data: await r.json() };
  }
  // Unknown content type — return text body so the caller can inspect.
  const text = await r.text();
  return { format: 'text', content_type: ct || 'application/octet-stream', text };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    await requireCaller(req, base44);

    const body = await req.json().catch(() => ({}));
    const {
      // INEGI defaults — Sonora-state population indicator example.
      inegi = [{ indicator: '1002000001', geo: '0700002604' }],
      ine = [],
    } = body;

    const out = { inegi: [], ine: [], errors: [] };

    for (const cfg of inegi) {
      try {
        const data = await fetchInegiIndicator(cfg.indicator, cfg.geo);
        out.inegi.push({ indicator: cfg.indicator, geo: cfg.geo, data });
      } catch (e) {
        out.errors.push({ source: 'inegi', cfg, error: e.message });
      }
    }
    for (const slug of ine) {
      try {
        const data = await fetchIneOpenData(String(slug));
        out.ine.push({ slug, data });
      } catch (e) {
        out.errors.push({ source: 'ine', slug, error: e.message });
      }
    }

    return Response.json({ ok: true, fetched_at: new Date().toISOString(), ...out });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('fetchMexicanOpenData failed:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
