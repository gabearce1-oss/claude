import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// SSRF guard — only allow ingest URLs on official LoC hosts, and only
// over HTTPS. Plaintext HTTP transport would let an on-path attacker
// tamper with search results or linked page URLs before the SHA-256
// hashing step, breaking provenance integrity on forensic evidence.
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
  if (parsed.protocol === 'http:') {
    // Upgrade legacy http://loc.gov/... to https before fetching.
    parsed.protocol = 'https:';
  }
  if (parsed.protocol !== 'https:') {
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
    // Re-validate pagination links from API responses AND use the
    // normalized HTTPS URL for the fetch — otherwise an http://
    // pagination.next would still be fetched over plaintext transport.
    next = assertLocHost(next).toString();
    const r = await fetch(next, { headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error(`LoC search failed: ${r.status}`);
    const data = await r.json();
    const results = data.results || [];
    for (const res of results) {
      const fmt = res.original_format || [];
      if (fmt.includes('collection') || fmt.includes('web page')) continue;
      const id = res.id;
      if (typeof id !== 'string') continue;
      // Accept both www.loc.gov and bare loc.gov over https. Legacy
      // identifiers returned as http:// are normalized to https below.
      const m = id.match(/^https?:\/\/(?:www\.)?loc\.gov\/(item|resource)/);
      if (m) {
        const httpsId = id.replace(/^http:\/\//, 'https://');
        items.push(httpsId);
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

    // Snapshot existing Evidence for dedupe by source URL. Must paginate —
    // Base44 list() defaults to 50 rows, so once Evidence grows past one
    // page the dedupe set misses older ingested URLs and the loop
    // re-creates duplicates of already-ingested Chronicling America
    // pages. Signature is list(sort, limit, skip) with skip = record
    // offset.
    const existing = [];
    {
      const pageSize = 200;
      let skip = 0;
      for (let i = 0; i < 100; i++) {
        const batch = await base44.entities.Evidence.list(null, pageSize, skip);
        if (!batch || batch.length === 0) break;
        existing.push(...batch);
        if (batch.length < pageSize) break;
        skip += pageSize;
      }
    }

    // Seed the running dedupe Set from the initial Evidence snapshot.
    // Canonicalize each seeded URL through assertLocHost() so the Set
    // is uniformly normalized — older rows may have been saved with
    // http:// URLs before the host-validation fix, and the dedupe
    // check downstream compares against validatedPageUrl (always
    // https). Drop any URL that no longer passes the host allowlist.
    const ingestedPageUrls = new Set();
    for (const e of existing) {
      if (e.notes) {
        const m = String(e.notes).match(/Source page:\s*(\S+)/);
        if (m) {
          try {
            ingestedPageUrls.add(assertLocHost(m[1]).toString());
          } catch (_) {
            // legacy seed with disallowed host — skip silently
          }
        }
      }
    }

    async function allocateEvidenceNumber() {
      // Page through every Evidence row before scanning for the max
      // CA-#### number. Base44 list() defaults to ~50 rows; without
      // pagination this would re-use existing catalog numbers once
      // Evidence grows past one page, breaking idempotency and
      // producing duplicate/ambiguous CA-#### identifiers downstream.
      let max = 0;
      const pageSize = 200;
      let skipN = 0;
      for (let i = 0; i < 100; i++) {
        const fresh = await base44.entities.Evidence.list(null, pageSize, skipN);
        if (!fresh || fresh.length === 0) break;
        for (const e of fresh) {
          const m = /^CA-(\d+)$/.exec(e.evidence_number || '');
          if (m) max = Math.max(max, parseInt(m[1], 10));
        }
        if (fresh.length < pageSize) break;
        skipN += pageSize;
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

        // Canonicalize pageUrl BEFORE the dedupe check. The Set is
        // populated with normalized HTTPS URLs (validatedPageUrl), so
        // checking the raw pageUrl would miss when LoC returns a
        // legacy http:// page URL for an item already stored as
        // https://. Validate first; on disallowed host, push error
        // and skip. Then use validatedPageUrl for both the dedupe
        // check AND the running-set insert.
        let validatedPageUrl = null;
        try {
          validatedPageUrl = assertLocHost(pageUrl).toString();
        } catch (e) {
          errors.push({ itemUrl, error: `disallowed pageUrl: ${e.message}` });
          continue;
        }

        // Dedupe by canonical source URL. Set is populated with
        // validatedPageUrl after each successful create — guarantees
        // the second occurrence of the same item within a single run
        // (getItemIds can return repeats across paginated LoC results)
        // is caught even if its raw URL differs in protocol or host.
        if (ingestedPageUrls.has(validatedPageUrl)) {
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

        // Fetch the page file, hash it, optionally upload to Base44 storage.
        let sha256 = null;
        let fileUrl = null;
        }
        if (!metadataOnly) {
          try {
            const pageRes = await fetch(validatedPageUrl);
            if (pageRes.ok) {
              const arrBuf = await pageRes.arrayBuffer();
              sha256 = await sha256Hex(arrBuf);

              if (uploadFiles) {
                const filename = validatedPageUrl.split('/').pop() || `page.${fileExtension}`;
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

        // Atomic CA-#### allocation via retry-on-conflict. Pure read-max-
        // then-write is racy under concurrency — two callers can compute
        // the same max and create duplicate evidence_numbers. We can't
        // add a backend counter from here, so we wrap the create() in a
        // bounded retry: on a uniqueness conflict, re-allocate from a
        // fresh server read and try again. Up to 5 retries before
        // surfacing the error.
        let evidence = null;
        let lastErr = null;
        for (let attempt = 0; attempt < 5; attempt++) {
          const evidenceNumber = await allocateEvidenceNumber();
          try {
            evidence = await base44.entities.Evidence.create({
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
              notes: `Source page: ${validatedPageUrl}\nItem record: ${itemUrl}${metadataOnly ? '\n\nMETADATA-ONLY catalog hit. Page contains the query phrase per LoC OCR but relevance has not been verified by reading the page itself.' : ''}`,
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

            created.push({ id: evidence.id, evidence_number: evidenceNumber, page_url: validatedPageUrl });
            ingestedPageUrls.add(validatedPageUrl);
            break; // success — exit the retry loop
          } catch (e) {
            // Treat any create() failure as a potential conflict and retry
            // with a freshly allocated number. The allocator re-reads from
            // the server, so concurrent racers naturally diverge.
            lastErr = e;
            if (attempt === 4) {
              errors.push({ itemUrl, error: `create after 5 retries: ${e && e.message}` });
            }
          }
        }
        if (!evidence) continue;
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