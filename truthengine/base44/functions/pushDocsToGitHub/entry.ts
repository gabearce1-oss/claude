import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CONNECTOR_ID = "69d717648324e6b2f72b024b"; // Truthengine360 GitHub connector
const REPO_OWNER = "truthengine360";
const REPO_NAME = "truthengine360";

async function getFileSha(accessToken, path) {
  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
    { headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" } }
  );
  if (res.status === 404) return null;
  const data = await res.json();
  return data.sha || null;
}

async function upsertFile(accessToken, path, content, message, existingSha) {
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch: "main",
  };
  if (existingSha) body.sha = existingSha;

  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  return { status: res.status, data: await res.json() };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);

    const FILES = [
      {
        path: "docs/truth-engine-platform-research-report.md",
        commitMsg: "docs: add platform assessment and migration proposal\n\n- Consolidated architecture audit, connector reconnaissance, 3-round plan\n- Links to forensic-audit companion documents\n- Fixes duplicate bare-path references in README",
      },
      {
        path: "docs/forensic-audit/tradecraft-reframe.md",
        commitMsg: "Add forensic audit research baseline\n\n- forensic-audit/tradecraft-reframe.md: Reframe 349 Rule as institutional\n  tradecraft; map seven research vectors as evidence; propose Conditional\n  Citizenship as signature #6.",
      },
      {
        path: "docs/forensic-audit/form-102-pipeline.md",
        commitMsg: "Add forensic audit research baseline\n\n- forensic-audit/form-102-pipeline.md: Operationalize Selective Service\n  Form 102 retrieval at NARA-St. Louis; integrate IV-C statutory\n  mechanism, parallel test case, and A-File Phase II expansion.",
      },
    ];

    const results = [];

    for (const file of FILES) {
      // Read the file content from the app's source
      const sha = await getFileSha(accessToken, file.path);
      
      // Fetch the local file content via the base44 service
      const fileContent = await base44.asServiceRole.functions.invoke("readLocalFile", { path: file.path })
        .catch(() => null);

      if (!fileContent?.content) {
        results.push({ path: file.path, status: "skipped", reason: "could not read local file" });
        continue;
      }

      const pushResult = await upsertFile(
        accessToken,
        file.path,
        fileContent.content,
        file.commitMsg,
        sha
      );

      results.push({
        path: file.path,
        githubStatus: pushResult.status,
        action: sha ? "updated" : "created",
        commitSha: pushResult.data?.commit?.sha || null,
      });
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});