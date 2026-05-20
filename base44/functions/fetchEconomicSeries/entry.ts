// FRED + Banxico SIE economic-series fetcher.
// Returns time-series JSON only — no DB writes (no EconomicSeries entity yet).
// FRED needs an API key in env: FRED_API_KEY
// Banxico needs a token: BANXICO_TOKEN
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ALLOWED_HOSTS = new Set(['api.stlouisfed.org', 'www.banxico.org.mx']);

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
  const r = await fetch(u.toString(), opts);
  if (!r.ok) {
    const t = await r.text().catch(() => '');
    throw new Error(`${u.hostname} → ${r.status} ${r.statusText} ${t}`.trim());
  }
  return r.json();
}

async function fetchFREDSeries(seriesId, { observation_start, observation_end } = {}) {
  const key = Deno.env.get('FRED_API_KEY');
  if (!key) throw new Error('FRED_API_KEY env var not set');
  const url = new URL('https://api.stlouisfed.org/fred/series/observations');
  url.searchParams.set('series_id', seriesId);
  url.searchParams.set('api_key', key);
  url.searchParams.set('file_type', 'json');
  if (observation_start) url.searchParams.set('observation_start', observation_start);
  if (observation_end) url.searchParams.set('observation_end', observation_end);
  const data = await fetchJson(url.toString());
  return {
    series_id: seriesId,
    units: data.units || null,
    observations: (data.observations || []).map((o) => ({ date: o.date, value: o.value === '.' ? null : Number(o.value) })),
  };
}

async function fetchBanxicoSeries(seriesId, { startDate, endDate } = {}) {
  const token = Deno.env.get('BANXICO_TOKEN');
  if (!token) throw new Error('BANXICO_TOKEN env var not set');
  const range = (startDate && endDate) ? `/${startDate}/${endDate}` : '';
  const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/${seriesId}/datos${range}`;
  const data = await fetchJson(url, { headers: { 'Bmx-Token': token, Accept: 'application/json' } });
  const series = (data.bmx && data.bmx.series && data.bmx.series[0]) || {};
  return {
    series_id: seriesId,
    titulo: series.titulo || null,
    observations: (series.datos || []).map((d) => ({ date: d.fecha, value: d.dato === 'N/E' ? null : Number((d.dato || '').replace(/,/g, '')) })),
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    await requireCaller(req, base44);

    const body = await req.json().catch(() => ({}));
    const {
      // FRED defaults: silver-related series. Override via request body.
      fred = ['SLVPRUSDM'],
      // Banxico defaults: peso/USD historical FIX
      banxico = ['SF43718'],
      startDate, endDate,
    } = body;

    const out = { fred: [], banxico: [], errors: [] };
    for (const id of fred) {
      try { out.fred.push(await fetchFREDSeries(id, { observation_start: startDate, observation_end: endDate })); }
      catch (e) { out.errors.push({ source: 'fred', id, error: e.message }); }
    }
    for (const id of banxico) {
      try { out.banxico.push(await fetchBanxicoSeries(id, { startDate, endDate })); }
      catch (e) { out.errors.push({ source: 'banxico', id, error: e.message }); }
    }

    return Response.json({ ok: true, fetched_at: new Date().toISOString(), ...out });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('fetchEconomicSeries failed:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
