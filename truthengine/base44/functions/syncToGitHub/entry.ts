import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GITHUB_OWNER = 'gabearce1-oss';
const GITHUB_REPO = 'TruthEngine360';
const GITHUB_API = 'https://api.github.com';

async function githubRequest(
  method: string,
  path: string,
  token: string,
  body?: unknown
): Promise<Response> {
  return fetch(`${GITHUB_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function upsertFile(
  token: string,
  path: string,
  content: string,
  message: string
): Promise<{ sha: string | null }> {
  let existingSha: string | null = null;
  const getRes = await githubRequest('GET', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`, token);
  if (getRes.ok) {
    const existing = await getRes.json() as { sha: string };
    existingSha = existing.sha;
  }

  const putBody: Record<string, unknown> = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
  };
  if (existingSha) putBody.sha = existingSha;

  const putRes = await githubRequest('PUT', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`, token, putBody);
  if (!putRes.ok) {
    const err = await putRes.text();
    throw new Error(`GitHub PUT failed (${putRes.status}): ${err}`);
  }
  const data = await putRes.json() as { content: { sha: string } };
  return { sha: data.content?.sha };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let userId = 'system';
    try {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      userId = user.email || user.id || 'system';
    } catch {
      // service-role passthrough
    }

    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const { action = 'check' } = body as { action?: string };

    const githubToken = Deno.env.get('GITHUB_TOKEN');
    if (!githubToken && action !== 'check') {
      return Response.json({ error: 'GITHUB_TOKEN not configured in environment' }, { status: 500 });
    }

    // ── CHECK ────────────────────────────────────────────────────────────────
    if (action === 'check') {
      return Response.json({
        status: githubToken ? 'ready' : 'token_missing',
        repo: `${GITHUB_OWNER}/${GITHUB_REPO}`,
        token_configured: !!githubToken,
        capabilities: ['sync_cases', 'sync_evidence', 'sync_docs', 'push_report'],
        anchor_metrics: {
          dcas_official: 349,
          bisg_corrected: 2309,
          classification_failure_pct: 84.9,
          verified_cb_hsivf: 6,
        },
      });
    }

    // ── SYNC CASES + EVIDENCE + DOCS ─────────────────────────────────────────
    if (action === 'sync' || action === 'sync_cases') {
      const timestamp = new Date().toISOString();

      const [cases, evidence, docs] = await Promise.allSettled([
        base44.entities.CaseFile.list({ limit: 500 }),
        base44.entities.EvidenceLink.list({ limit: 500 }),
        base44.entities.ResearchDoc.list({ limit: 200 }),
      ]);

      const caseData = cases.status === 'fulfilled' ? cases.value : [];
      const evidenceData = evidence.status === 'fulfilled' ? evidence.value : [];
      const docData = docs.status === 'fulfilled' ? docs.value : [];

      const commitMessage = `Auto-sync: ${timestamp} | user: ${userId}`;

      const caseResult = await upsertFile(
        githubToken!,
        'data/exports/case_registry_latest.json',
        JSON.stringify({ generated_at: timestamp, count: caseData.length, cases: caseData }, null, 2),
        commitMessage
      );

      const evidenceResult = await upsertFile(
        githubToken!,
        'data/exports/evidence_index_latest.json',
        JSON.stringify({ generated_at: timestamp, count: evidenceData.length, evidence: evidenceData }, null, 2),
        commitMessage
      );

      const docResult = await upsertFile(
        githubToken!,
        'data/exports/research_docs_latest.json',
        JSON.stringify({ generated_at: timestamp, count: docData.length, docs: docData }, null, 2),
        commitMessage
      );

      await upsertFile(
        githubToken!,
        'data/exports/_sync_manifest.json',
        JSON.stringify({
          last_sync: timestamp,
          synced_by: userId,
          repo: `${GITHUB_OWNER}/${GITHUB_REPO}`,
          counts: { cases: caseData.length, evidence: evidenceData.length, docs: docData.length },
          shas: { cases: caseResult.sha, evidence: evidenceResult.sha, docs: docResult.sha },
          platform: 'TruthEngine360',
          anchor_metrics: {
            dcas_official: 349,
            bisg_corrected: 2309,
            classification_failure_pct: 84.9,
            total_dcas: 58220,
            verified_cb_hsivf: 6,
          },
        }, null, 2),
        commitMessage
      );

      return Response.json({
        success: true,
        action: 'sync',
        synced: { cases: caseData.length, evidence: evidenceData.length, docs: docData.length },
        repo: `${GITHUB_OWNER}/${GITHUB_REPO}`,
        timestamp,
        synced_by: userId,
      });
    }

    // ── PUSH REPORT ──────────────────────────────────────────────────────────
    if (action === 'push_report') {
      const { report_text, report_name, report_type = 'intel' } = body as {
        report_text?: string;
        report_name?: string;
        report_type?: string;
      };
      if (!report_text?.trim()) {
        return Response.json({ error: 'report_text required' }, { status: 400 });
      }
      const timestamp = new Date().toISOString();
      const slug = (report_name || report_type).replace(/\s+/g, '_').toLowerCase();
      const path = `data/reports/${report_type}/${slug}_${timestamp.slice(0, 10)}.md`;

      const result = await upsertFile(
        githubToken!,
        path,
        `# ${report_name || report_type}\n\nGenerated: ${timestamp}\nAuthor: ${userId}\n\n---\n\n${report_text}`,
        `Report push: ${slug} — ${timestamp.slice(0, 10)}`
      );

      return Response.json({ success: true, path, sha: result.sha, timestamp });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('[SYNC-TO-GITHUB ERROR]', error.message);
    return Response.json({ error: error.message, status: 'FAILED' }, { status: 500 });
  }
});
