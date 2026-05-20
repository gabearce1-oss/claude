import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Page through Base44 list() until the server returns less than a full
// page. Base44's SDK signature is list(sort, limit, skip) where the
// third argument is a record-offset, NOT a page index. Advancing skip
// by `limit` each iteration produces non-overlapping batches; the
// previous "page++" loop was offsetting by one record per call and
// duplicating ~199 of every 200 rows.
async function listAll(entity) {
  const all = [];
  const limit = 200;
  let skip = 0;
  // Cap iterations to defend against runaway loops on bad SDK responses.
  for (let i = 0; i < 100; i++) {
    const batch = await entity.list(null, limit, skip);
    if (!batch || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < limit) break;
    skip += limit;
  }
  return all;
}

// Public endpoint: returns aggregate case stats only (no record content).
// Safe to expose to unauthenticated visitors of the marketing/home page.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const [evidence, claims, requests] = await Promise.all([
      listAll(base44.asServiceRole.entities.Evidence),
      listAll(base44.asServiceRole.entities.Claim),
      listAll(base44.asServiceRole.entities.ArchiveRequest),
    ]);

    const verifiedEvidence = evidence.filter((e) => e.status === 'verified').length;
    const verifiedClaims = claims.filter(
      (c) => c.status === 'verified' || c.status === 'corroborated'
    ).length;
    const quarantinedClaims = claims.filter(
      (c) => c.status === 'fabricated_risk' || c.status === 'rejected'
    ).length;
    const openRequests = requests.filter((r) =>
      ['planned', 'draft', 'submitted', 'running'].includes(r.status)
    ).length;

    return Response.json({
      evidence_total: evidence.length,
      evidence_verified: verifiedEvidence,
      claims_total: claims.length,
      claims_verified: verifiedClaims,
      claims_quarantined: quarantinedClaims,
      requests_total: requests.length,
      requests_open: openRequests,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});