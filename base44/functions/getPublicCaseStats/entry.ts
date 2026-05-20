import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Public endpoint: returns aggregate case stats only (no record content).
// Safe to expose to unauthenticated visitors of the marketing/home page.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const [evidence, claims, requests] = await Promise.all([
      base44.asServiceRole.entities.Evidence.list(),
      base44.asServiceRole.entities.Claim.list(),
      base44.asServiceRole.entities.ArchiveRequest.list(),
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