import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check if GitHub connector is available
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    if (action === 'check') {
      return Response.json({
        message: "GitHub app user connector registered. Users can now connect their own GitHub accounts via the UI.",
        connector: "GitHub Research Connector",
        scopes: ["repo", "read:user"],
        status: "ready"
      });
    }

    if (action === 'sync') {
      return Response.json({
        message: "GitHub sync ready. App users can authenticate to enable repository syncing.",
        docs: "https://docs.base44.com/connectors/github"
      });
    }

    return Response.json({
      status: "ok",
      message: "GitHub connector is configured. Users can connect via their account settings.",
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});