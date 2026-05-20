import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const DRIVE_ROOT_FOLDER = 'TE360 Backups';
const DRIVE_SESSION_FOLDER = 'Daily Session Reports';

async function findOrCreateFolder(accessToken, name, parentId) {
  const parentClause = parentId ? ` and '${parentId}' in parents` : " and 'root' in parents";
  const q = encodeURIComponent(
    `name='${name.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false${parentClause}`
  );
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!searchRes.ok) {
    const body = await searchRes.text().catch(() => '');
    throw new Error(`Drive folder search failed: ${searchRes.status} ${searchRes.statusText} ${body}`);
  }
  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) return searchData.files[0].id;
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentId ? { parents: [parentId] } : {}),
    }),
  });
  if (!createRes.ok) {
    const body = await createRes.text().catch(() => '');
    throw new Error(`Drive folder create failed: ${createRes.status} ${createRes.statusText} ${body}`);
  }
  const created = await createRes.json();
  return created.id;
}

async function uploadJsonToDrive(accessToken, { name, parentId, json }) {
  const boundary = '-------te360' + Math.random().toString(36).slice(2);
  const metadata = { name, parents: [parentId], mimeType: 'application/json' };
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(metadata) +
    `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
    json +
    `\r\n--${boundary}--`;
  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Drive upload failed: ${res.status} ${res.statusText} ${body}`);
  }
  return res.json();
}

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
      // No user context — must be a real scheduler invocation, not an
      // anonymous HTTP caller. Require a shared scheduler secret before
      // proceeding with service-role reads/writes (Drive backup, etc.).
    }
    // Manual invocation gate: admin only.
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }
    // Scheduler invocation gate: shared secret required. Without this an
    // anonymous HTTP caller could repeatedly force SessionLog writes and
    // Drive backup activity. Accept either the legacy scheduler header
    // OR the documented X-Automation-Secret convention so headless n8n
    // callers can authenticate with the same secret pattern used by the
    // other crawler functions. Matching env vars: SCHEDULER_SECRET (legacy)
    // or AUTOMATION_SECRET.
    if (!user) {
      const schedulerExpected = Deno.env.get('SCHEDULER_SECRET');
      const automationExpected = Deno.env.get('AUTOMATION_SECRET');
      const bearer = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
      const schedulerHeader = req.headers.get('x-scheduler-secret') || '';
      const automationHeader = req.headers.get('x-automation-secret') || '';
      const matches =
        (schedulerExpected && schedulerHeader && schedulerHeader === schedulerExpected) ||
        (schedulerExpected && bearer && bearer === schedulerExpected) ||
        (automationExpected && automationHeader && automationHeader === automationExpected) ||
        (automationExpected && bearer && bearer === automationExpected);
      if (!matches) {
        return Response.json(
          { error: 'Unauthorized — scheduler or automation secret required' },
          { status: 401 }
        );
      }
    }

    const sessionDate = pacificDate();
    const generatedAt = new Date().toISOString();

    // Page through every Evidence and Claim row — Base44 list() defaults to
    // 50 records, so audit_score / evidenceEntries / claimEntries would be
    // computed from a truncated subset once either entity grows past 50.
    // Signature is list(sort, limit, skip) where skip is a record offset.
    async function listAll(entity) {
      const all = [];
      const limit = 200;
      let skip = 0;
      for (let i = 0; i < 100; i++) {
        const batch = await entity.list(null, limit, skip);
        if (!batch || batch.length === 0) break;
        all.push(...batch);
        if (batch.length < limit) break;
        skip += limit;
      }
      return all;
    }

    const [allEvidence, allClaims, existingLogs] = await Promise.all([
      listAll(base44.asServiceRole.entities.Evidence),
      listAll(base44.asServiceRole.entities.Claim),
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

    // Best-effort backup to Google Drive (non-blocking failure)
    let driveBackup = null;
    try {
      const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
      const rootId = await findOrCreateFolder(accessToken, DRIVE_ROOT_FOLDER, null);
      const subId = await findOrCreateFolder(accessToken, DRIVE_SESSION_FOLDER, rootId);
      driveBackup = await uploadJsonToDrive(accessToken, {
        name: `SessionLog_${sessionDate}.json`,
        parentId: subId,
        json: JSON.stringify(payload, null, 2),
      });
    } catch (driveErr) {
      console.error('Drive backup failed:', driveErr.message);
      driveBackup = { error: driveErr.message };
    }

    return Response.json({ ok: true, log: result, summary, driveBackup });
  } catch (error) {
    console.error('archiveDailySession failed:', error.message, error.stack);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});