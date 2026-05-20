import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url, case_id } = await req.json();
    
    if (!file_url || !case_id) {
      return Response.json({ error: 'Missing file_url or case_id' }, { status: 400 });
    }

    // Extract data from PDF using LLM
    const extractionResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract structured data from this PDF document. Return JSON with:
        - dates: array of dates found (format: YYYY-MM-DD)
        - names: array of person names
        - agencies: array of government/organization names
        - document_type: main document type (e.g., "Court Order", "FOIA Response", "ICE Notice")
        - document_title: extracted title or subject
        - key_findings: brief summary of important info
        
        Be precise and only extract what's explicitly stated.`,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          dates: { type: "array", items: { type: "string" } },
          names: { type: "array", items: { type: "string" } },
          agencies: { type: "array", items: { type: "string" } },
          document_type: { type: "string" },
          document_title: { type: "string" },
          key_findings: { type: "string" },
        },
      },
    });

    // Create evidence timeline entry
    const timelineEntry = await base44.entities.ResearchDoc.create({
      title: extractionResult.document_title || 'Extracted Evidence',
      summarized_abstract: extractionResult.key_findings,
      challenges: extractionResult.agencies.join(', '),
      applications: extractionResult.document_type,
      source_url: file_url,
      cluster_tags: [case_id, ...extractionResult.agencies].join(','),
    });

    // Link extracted names to case (update case with related persons)
    const caseRecord = await base44.entities.Case.get(case_id);
    if (caseRecord) {
      const relatedNames = [
        ...new Set([
          ...(caseRecord.related_persons || []),
          ...extractionResult.names,
        ]),
      ];

      await base44.entities.Case.update(case_id, {
        related_persons: relatedNames,
        last_evidence_date: extractionResult.dates.length > 0 
          ? extractionResult.dates[extractionResult.dates.length - 1]
          : caseRecord.last_evidence_date,
      });
    }

    return Response.json({
      success: true,
      extracted: {
        dates: extractionResult.dates,
        names: extractionResult.names,
        agencies: extractionResult.agencies,
        document_type: extractionResult.document_type,
      },
      timeline_entry_id: timelineEntry.id,
      case_id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});