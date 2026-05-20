import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Get today's date in America/Los_Angeles as YYYY-MM-DD
function pacificDate(d = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(d);
  const y = parts.find((p) => p.type === 'year').value;
  const m = parts.find((p) => p.type === 'month').value;
  const day = parts.find((p) => p.type === 'day').value;
  return `${y}-${m}-${day}`;
}

function isSameDay(iso, ymd) {
  if (!iso) return false;
  return pacificDate(new Date(iso)) === ymd;
}

function computeAuditScore(claims) {
  const v = claims.filter((c) => c.status === 'verified' || c.status === 'corroborated').length;
  const o = claims.filter((c) => ['plausible', 'weak_lead', 'unverified'].includes(c.status)).length;
  const r = claims.filter((c) => ['fabricated_risk', 'rejected'].includes(c.status)).length;
  const total = claims.length;
  if (total === 0) return 0;
  return Math.max(0, Math.round(((v * 1.0 + o * 0.4 - r * 1.0) / total) * 100));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let trigger = 'scheduled';
    let user = null;
    try {
      user = await base44.auth.me();
      if (user) trigger = 'manual';
    } catch (_) {
      // Scheduled invocation — no user context
    }
    // If invoked manually by a non-admin, reject
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const sessionDate = pacificDate();
    const generatedAt = new Date().toISOString();

    // Load today's verified/updated records via service role
    const [allEvidence, allClaims, existingLogs] = await Promise.all([
      base44.asServiceRole.entities.Evidence.list(),
      base44.asServiceRole.entities.Claim.list(),
      base44.asServiceRole.entities.SessionLog.filter({ session_date: sessionDate }),
    ]);

    // Today's verified evidence (status=verified, touched today)
    const evidenceEntries = allEvidence
      .filter((e) => e.status === 'verified' && isSameDay(e.updated_date, sessionDate))
      .map((e) => ({
        id: e.id,
        evidence_number: e.evidence_number || '',
        title: e.title || '',
        verified_at: e.updated_date,
      }));

    // Today's claim activity (verified, corroborated, or quarantined and touched today)
    const trackedClaimStatuses = ['verified', 'corroborated', 'fabricated_risk', 'rejected'];
    const claimEntries = allClaims
      .filter((c) => trackedClaimStatuses.includes(c.status) && isSameDay(c.updated_date, sessionDate))
      .map((c) => ({
        id: c.id,
        subject: c.subject || '',
        claim_text: (c.claim_text || '').slice(0, 240),
        status: c.status,
        reviewed_at: c.updated_date,
      }));

    const claims_verified_count = claimEntries.filter((c) => c.status === 'verified').length;
    const claims_corroborated_count = claimEntries.filter((c) => c.status === 'corroborated').length;
    const claims_quarantined_count = claimEntries.filter(
      (c) => c.status === 'fabricated_risk' || c.status === 'rejected'
    ).length;

    const audit_score = computeAuditScore(allClaims);

    const summary =
      `Session ${sessionDate}: ${evidenceEntries.length} evidence verified · ` +
      `${claims_verified_count + claims_corroborated_count} claims verified/corroborated · ` +
      `${claims_quarantined_count} quarantined · Audit ${audit_score}/100`;

    const payload = {
      case_id: 'Terminel-Sagasta',
      session_date: sessionDate,
      generated_at: generatedAt,
      evidence_verified_count: evidenceEntries.length,
      claims_verified_count,
      claims_corroborated_count,
      claims_quarantined_count,
      audit_score,
      evidence_entries: evidenceEntries,
      claim_entries: claimEntries,
      summary,
      trigger,
    };

    // Upsert: one log per date
    let result;
    if (existingLogs && existingLogs.length > 0) {
      result = await base44.asServiceRole.entities.SessionLog.update(existingLogs[0].id, payload);
    } else {
      result = await base44.asServiceRole.entities.SessionLog.create(payload);
    }

    return Response.json({ ok: true, log: result, summary });
  } catch (error) {
    console.error('archiveDailySession failed:', error.message, error.stack);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});