// Triggered by entity automation when an Evidence record is created or updated.
// Backs up verified evidence (metadata JSON + file if present) to Google Drive.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ROOT_FOLDER_NAME = 'TE360 Backups';
const SUB_FOLDER_NAME = 'Verified Evidence';

async function findOrCreateFolder(accessToken, name, parentId) {
  const parentClause = parentId ? ` and '${parentId}' in parents` : " and 'root' in parents";
  const q = encodeURIComponent(
    `name='${name.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false${parentClause}`
  );
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) return searchData.files[0].id;

  const createBody = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentId ? { parents: [parentId] } : {}),
  };
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(createBody),
  });
  const created = await createRes.json();
  return created.id;
}

async function uploadFile(accessToken, { name, mimeType, parentId, body }) {
  const boundary = '-------te360' + Math.random().toString(36).slice(2);
  const metadata = { name, parents: [parentId], mimeType };
  const isBinary = body instanceof Uint8Array;
  const head =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(metadata) +
    `\r\n--${boundary}\r\n` +
    `Content-Type: ${mimeType}\r\n` +
    (isBinary ? `Content-Transfer-Encoding: base64\r\n\r\n` : `\r\n`);
  const tail = `\r\n--${boundary}--`;

  let payload;
  if (isBinary) {
    const b64 = btoa(String.fromCharCode(...body));
    payload = head + b64 + tail;
  } else {
    payload = head + body + tail;
  }

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: payload,
    }
  );
  return res.json();
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const evidence = body?.data;
    const oldData = body?.old_data;
    const eventType = body?.event?.type;

    if (!evidence || evidence.status !== 'verified') {
      return Response.json({ skipped: 'not_verified' });
    }
    // Only back up on the transition to verified (or on create if already verified)
    if (eventType === 'update' && oldData?.status === 'verified') {
      return Response.json({ skipped: 'already_verified' });
    }

    const base44 = createClientFromRequest(req);
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');

    const rootId = await findOrCreateFolder(accessToken, ROOT_FOLDER_NAME, null);
    const subId = await findOrCreateFolder(accessToken, SUB_FOLDER_NAME, rootId);

    const safeNum = (evidence.evidence_number || evidence.id || 'unknown').replace(/[^\w-]/g, '_');
    const safeTitle = (evidence.title || 'evidence').replace(/[^\w\s-]/g, '').slice(0, 60).trim().replace(/\s+/g, '_');
    const baseName = `${safeNum}_${safeTitle}`;

    const uploaded = [];

    // 1) Always upload metadata JSON
    const metaJson = JSON.stringify(evidence, null, 2);
    const metaRes = await uploadFile(accessToken, {
      name: `${baseName}.json`,
      mimeType: 'application/json',
      parentId: subId,
      body: metaJson,
    });
    uploaded.push(metaRes);

    // 2) If the evidence has a file_url, download and upload the original
    if (evidence.file_url) {
      const fileRes = await fetch(evidence.file_url);
      if (fileRes.ok) {
        const buf = new Uint8Array(await fileRes.arrayBuffer());
        const ct = fileRes.headers.get('content-type') || 'application/octet-stream';
        const ext = (evidence.file_url.split('.').pop() || '').split('?')[0].slice(0, 6) || 'bin';
        const fileUp = await uploadFile(accessToken, {
          name: `${baseName}.${ext}`,
          mimeType: ct,
          parentId: subId,
          body: buf,
        });
        uploaded.push(fileUp);
      }
    }

    return Response.json({ ok: true, evidence_id: evidence.id, uploaded });
  } catch (error) {
    console.error('backupEvidenceToDrive failed:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});