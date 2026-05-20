import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// SSRF guard — only allow ingest URLs on official LoC hosts.
const LOC_HOSTS = new Set([
  'www.loc.gov',
  'loc.gov',
  'chroniclingamerica.loc.gov',
]);

function assertLocHost(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('searchURL is not a valid URL');
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error(`Disallowed protocol: ${parsed.protocol}`);
  }
  if (!LOC_HOSTS.has(parsed.hostname)) {
    throw new Error(`Disallowed host: ${parsed.hostname}. Only LoC endpoints are permitted.`);
  }
  return parsed;
}

// Pull item IDs from a Chronicling America / loc.gov search URL.
async function getItemIds(url, maxItems = 25) {
  const items = [];
  // Force JSON + pagination params
  const u = assertLocHost(url);
  u.searchParams.set('fo', 'json');
  u.searchParams.set('c', '100');
  u.searchParams.set('at', 'results,pagination');
  let next = u.toString();

  while (next && items.length < maxItems) {
    assertLocHost(next); // re-validate pagination links from API responses
    const r = await fetch(next, { headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error(`LoC search failed: ${r.status}`);
    const data = await r.json();
    const results = data.results || [];
    for (const res of results) {
      const fmt = res.original_format || [];
      if (fmt.includes('collection') || fmt.includes('web page')) continue;
      const id = res.id;
      if (typeof id !== 'string') continue;
      if (/^https?:\/\/www\.loc\.gov\/(item|resource)/.test(id)) {
        items.push(id);
        if (items.length >= maxItems) break;
      }
    }
    next = data.pagination && data.pagination.next ? data.pagination.next : null;
  }
  return items;
}

async function sha256Hex(buf) {
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function urlWithJson(itemUrl) {
  const u = new URL(itemUrl);
  u.searchParams.set('fo', 'json');
  return u.toString();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const {
      searchURL,
      fileExtension = 'pdf',
      maxItems = 10,
      caseId = 'Terminel-Sagasta',
      uploadFiles = true,
      metadataOnly = false,
      linkedRequestId = null,
    } = body;

    if (!searchURL || typeof searchURL !== 'string') {
      return Response.json({ error: 'searchURL is required' }, { status: 400 });
    }

    const itemIds = await getItemIds(searchURL, Math.min(Number(maxItems) || 10, 50));

    const created = [];
    const skipped = [];
    const errors = [];

    // Snapshot existing Evidence (used for dedupe by source URL).
    // The CA-#### number itself is re-derived from a fresh server read
    // immediately before each create (see below) so concurrent ingest
    // runs are far less likely to collide. This is a tight mitigation,
    // not a true atomic allocation — backend-side counter or unique
    // constraint is the correct long-term fix.
    const existing = await base44.entities.Evidence.list();

    async function allocateEvidenceNumber() {
      const fresh = await base44.entities.Evidence.list();
      let max = 0;
      for (const e of fresh) {
        const m = /^CA-(\d+)$/.exec(e.evidence_number || '');
        if (m) max = Math.max(max, parseInt(m[1], 10));
      }
      return `CA-${String(max + 1).padStart(4, '0')}`;
    }

    for (const itemUrl of itemIds) {
      try {
        const r = await fetch(urlWithJson(itemUrl), { headers: { Accept: 'application/json' } });
        if (!r.ok) {
          errors.push({ itemUrl, error: `metadata ${r.status}` });
          continue;
        }
        const meta = await r.json();
        const pages = Array.isArray(meta.page) ? meta.page : [];
        const target = pages.find((p) => typeof p.url === 'string' && p.url.endsWith(fileExtension));
        if (!target) {
          skipped.push({ itemUrl, reason: `no .${fileExtension} page` });
          continue;
        }

        const pageUrl = target.url;

        // Dedupe by source URL
        const dupe = existing.find((e) => e.notes && e.notes.includes(pageUrl));
        if (dupe) {
          skipped.push({ itemUrl, reason: 'already ingested' });
          continue;
        }

        // Extract LoC metadata
        const item = meta.item || {};
        const newspaperTitle = (item.newspaper_title && item.newspaper_title[0]) || (item.title || 'Untitled');
        const issueDate = item.date || null;
        const city = (item.location_city && item.location_city[0]) || null;
        const state = (item.location_state && item.location_state[0]) || null;
        const lccn = (item.number_lccn && item.number_lccn[0]) || null;
        const batch = (item.batch && item.batch[0]) || null;
        const contributor = (item.contributor_names && item.contributor_names[0]) || null;
        const pageNum = (meta.pagination && meta.pagination.current) || null;

        // Fetch the page file, hash it, optionally upload to Base44 storage
        // Skip entirely in metadata-only mode (tertiary catalog hits).
        let sha256 = null;
        let fileUrl = null;
        if (!metadataOnly) {
          try {
            const pageRes = await fetch(pageUrl);
            if (pageRes.ok) {
              const arrBuf = await pageRes.arrayBuffer();
              sha256 = await sha256Hex(arrBuf);

              if (uploadFiles) {
                const filename = pageUrl.split('/').pop() || `page.${fileExtension}`;
                const fileBlob = new File([arrBuf], filename, {
                  type: fileExtension === 'pdf' ? 'application/pdf' : 'application/octet-stream',
                });
                const uploaded = await base44.integrations.Core.UploadFile({ file: fileBlob });
                fileUrl = uploaded && uploaded.file_url ? uploaded.file_url : null;
              }
            }
          } catch (e) {
            errors.push({ itemUrl, error: `download/hash: ${e.message}` });
          }
        }

        const evidenceNumber = await allocateEvidenceNumber();

        const evidence = await base44.entities.Evidence.create({
          case_id: caseId,
          evidence_number: evidenceNumber,
          title: `${newspaperTitle} — ${issueDate || 'n.d.'}${pageNum ? ` p. ${pageNum}` : ''}`,
          description: `Newspaper page ingested from Chronicling America via search query. ${
            contributor ? `Contributor: ${contributor}.` : ''
          }`,
          type: 'document',
          status: 'unreviewed',
          review_status: 'new',
          chain_of_custody_status: 'tracked',
          date_created: issueDate || undefined,
          record_date_start: issueDate || undefined,
          record_date_end: issueDate || undefined,
          source: 'Library of Congress · Chronicling America',
          source_system: 'loc_chronam',
          archive_name: 'Library of Congress',
          collection_name: 'Chronicling America',
          call_number: lccn || undefined,
          box_number: batch || undefined,
          location: [city, state].filter(Boolean).join(', ') || undefined,
          language_code: 'en',
          is_primary_source: true,
          is_original_scan: true,
          file_url: fileUrl || undefined,
          sha256: sha256 || undefined,
          tags: ['chronicling-america', 'newspaper', metadataOnly ? 'catalog-hit' : null, lccn].filter(Boolean),
          notes: `Source page: ${pageUrl}\nItem record: ${itemUrl}${metadataOnly ? '\n\nMETADATA-ONLY catalog hit. Page contains the query phrase per LoC OCR but relevance has not been verified by reading the page itself.' : ''}`,
          provenance_score: metadataOnly ? 40 : 80,
          authenticity_score: metadataOnly ? 40 : 75,
          contamination_score: 0,
          access_level: 'public',
        });

        if (linkedRequestId) {
          try {
            await base44.entities.ArchiveRequest.update(linkedRequestId, {
              status: 'responded',
              linked_evidence_id: evidence.id,
              result_summary: `Auto-ingested ${evidenceNumber} via LoC search.`,
            });
          } catch (_) { /* non-fatal */ }
        }

        created.push({ id: evidence.id, evidence_number: evidenceNumber, page_url: pageUrl });
      } catch (e) {
        errors.push({ itemUrl, error: e.message });
      }
    }

    return Response.json({
      ok: true,
      searched: itemIds.length,
      created_count: created.length,
      skipped_count: skipped.length,
      error_count: errors.length,
      created,
      skipped,
      errors,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});