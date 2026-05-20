import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Auth gate: this endpoint uses the service-role Drive connector to write
    // files into the shared Drive, so it must reject unauthenticated callers
    // and non-admins. Without this gate any anonymous POST could consume the
    // connected Drive's storage / quota.
    let user;
    try {
      user = await base44.auth.me();
    } catch (_) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const body = await req.json();

    const { fileName, fileData, mimeType = 'application/pdf' } = body;

    if (!fileName || !fileData) {
      return Response.json({ error: 'fileName and fileData required' }, { status: 400 });
    }

    // Get Google Drive access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
    const headers = { Authorization: `Bearer ${accessToken}` };

    // Find or create TE360 backup folder
    let folderId = null;
    const searchUrl = 'https://www.googleapis.com/drive/v3/files?q=name=%27TE360_Backup%27%20and%20mimeType=%27application/vnd.google-apps.folder%27%20and%20trashed=false&fields=files(id)&spaces=drive';
    const searchRes = await fetch(searchUrl, { headers });
    const searchData = await searchRes.json();

    if (searchData.files && searchData.files.length > 0) {
      folderId = searchData.files[0].id;
    } else {
      // Create folder
      const createFolderRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'TE360_Backup',
          mimeType: 'application/vnd.google-apps.folder',
        }),
      });
      const folderData = await createFolderRes.json();
      folderId = folderData.id;
    }

    // Convert base64 to bytes
    const binaryData = Uint8Array.from(atob(fileData), (c) => c.charCodeAt(0));

    // Drive caps uploadType=multipart at ~5 MiB. Switch to resumable for
    // anything larger so PDF/scan backups above that threshold don't fail
    // with 413/400. Threshold matches Drive API guidance.
    const MULTIPART_LIMIT = 5 * 1024 * 1024;
    const useResumable = binaryData.length > MULTIPART_LIMIT;

    let uploadData;
    if (useResumable) {
      const initRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id',
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json; charset=UTF-8',
            'X-Upload-Content-Type': mimeType,
            'X-Upload-Content-Length': String(binaryData.length),
          },
          body: JSON.stringify({ name: fileName, parents: [folderId] }),
        }
      );
      if (!initRes.ok) {
        const errText = await initRes.text().catch(() => '');
        return Response.json(
          {
            success: false,
            error: `Drive resumable init failed: ${initRes.status} ${initRes.statusText} ${errText}`.trim(),
          },
          { status: 502 }
        );
      }
      const sessionUrl = initRes.headers.get('location');
      if (!sessionUrl) {
        return Response.json(
          { success: false, error: 'Drive resumable init: missing Location header' },
          { status: 502 }
        );
      }
      const putRes = await fetch(sessionUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': mimeType,
          'Content-Length': String(binaryData.length),
        },
        body: binaryData,
      });
      if (!putRes.ok) {
        const errText = await putRes.text().catch(() => '');
        return Response.json(
          {
            success: false,
            error: `Drive resumable upload failed: ${putRes.status} ${putRes.statusText} ${errText}`.trim(),
          },
          { status: 502 }
        );
      }
      uploadData = await putRes.json();
    } else {
      const metadata = { name: fileName, parents: [folderId] };
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', new Blob([binaryData], { type: mimeType }));

      const uploadRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
        { method: 'POST', headers, body: formData }
      );
      if (!uploadRes.ok) {
        const errText = await uploadRes.text().catch(() => '');
        return Response.json(
          {
            success: false,
            error: `Drive upload failed: ${uploadRes.status} ${uploadRes.statusText} ${errText}`.trim(),
          },
          { status: 502 }
        );
      }
      uploadData = await uploadRes.json();
    }

    return Response.json({
      success: true,
      fileId: uploadData.id,
      fileName,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});