import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
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

    // Upload file to folder
    const metadata = {
      name: fileName,
      parents: [folderId],
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', new Blob([binaryData], { type: mimeType }));

    const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
      method: 'POST',
      headers,
      body: formData,
    });

    const uploadData = await uploadRes.json();

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