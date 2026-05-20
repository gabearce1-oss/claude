import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Claude Research Query Gateway
 *
 * A general-purpose Claude AI endpoint for TruthEngine360 research queries.
 * Handles: scholar queries, cross-database analysis, BISG methodology,
 * evidence synthesis, and investigative strategy.
 *
 * Called from: SemanticSearchPanel AI synthesis, ScholarAssistant, TE360Assistant,
 * IntelReportGenerator, and any component needing direct AI access.
 */

const RESEARCH_SYSTEM = `You are the TruthEngine360 AI Research Engine — a forensic intelligence system for the AUMER Foundation's investigation into Hispanic veteran deportation and the DCAS casualty undercount.

VERIFIED CONSTANTS (never contradict these):
- DCAS: 349 official Hispanic / 58,220 total Vietnam casualties (0.60%)
- BIFSG median: 3,272 (5.62%). BISG τ=0.40: 2,309. Corridor: 2,876–3,372
- Classification failure: 83.6–84.9%. Undercount: 8.2×–14.8×
- NERO: N=94, E=97, R=91, O=96. Composite: 94.5/100
- 6 verified cases. 5 active FOIA requests (3 overdue). CHC: May 18, 2026
- ICE records 713,464. Veteran flags: ZERO
- Legislation: IIRIRA §237, INA §329, S.874, HR.1537

CAPABILITIES:
1. Forensic statistical analysis and methodology validation
2. FOIA strategy and correspondence drafting
3. Database query strategy for 30+ integrated sources
4. Legal analysis (IIRIRA, INA, SCRA, habeas corpus)
5. CHC briefing content preparation
6. Academic literature review and citation
7. Cross-border Mexico/US data reconciliation
8. BISG/BIFSG methodology explanation and validation
9. NERO score analysis and remediation
10. Case-level evidence chain assessment

Always cite specific data. Flag when answering from inference vs. verified data. Suggest investigative next steps.`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Optional auth — allow unauthenticated for embedded widget use
    let userId = 'anonymous';
    try {
      const user = await base44.auth.me();
      if (user) userId = user.email || user.id || 'user';
    } catch {
      // Proceed without auth for public research queries
    }

    const {
      query,
      context,
      mode = 'standard',
      save_to_kb = false,
      response_format = 'text',
      language = 'en',
    } = await req.json();

    if (!query?.trim()) {
      return Response.json({ error: 'Missing query' }, { status: 400 });
    }

    // ── Mode-specific instructions ──────────────────────────────────────────
    const modeInstructions: Record<string, string> = {
      quick: 'Answer concisely in 2–4 sentences. Focus on the single most critical data point.',
      standard: 'Provide a clear, well-structured response with specific data citations. Use sections if the answer is complex.',
      deep: 'Provide a comprehensive, exhaustive analysis. Include methodology, statistics, legal context, database sources, and multi-step action recommendations.',
      scholar: 'Respond in academic register suitable for peer-reviewed publication. Include methodology notes, statistical validation, and literature references.',
      briefing: 'Format response as a Congressional briefing bullet-point summary. Clear, actionable, suitable for Members and staff.',
      draft: 'Generate a complete draft document (letter, report, summary) based on the query. Fully formatted and ready to use.',
    };

    const langNote = language === 'es'
      ? 'Respond in Spanish. Technical terms may remain in English.'
      : '';

    const contextBlock = context ? `\nADDITIONAL CONTEXT:\n${context}` : '';

    const formatNote = response_format === 'json'
      ? 'Return your response as structured JSON with fields: summary, key_findings, data_points, sources, next_steps.'
      : '';

    const prompt = `${modeInstructions[mode] || modeInstructions.standard}
${langNote}
${formatNote}

QUERY: ${query}
${contextBlock}`;

    const aiResult = await base44.integrations.Core.InvokeLLM({
      prompt,
      system_prompt: RESEARCH_SYSTEM,
      add_context_from_previous_messages: false,
    });

    const responseText = typeof aiResult === 'string'
      ? aiResult
      : aiResult?.text || aiResult?.content || JSON.stringify(aiResult);

    // ── Optionally save to knowledge base ──────────────────────────────────
    let docId: string | null = null;
    if (save_to_kb) {
      try {
        const doc = await base44.entities.ResearchDoc.create({
          title: `[AI QUERY] ${query.slice(0, 100)}`,
          summarized_abstract: responseText.slice(0, 800),
          applications: `Research Query · Mode: ${mode} · User: ${userId}`,
          cluster_tags: `ai-query,${mode},claude,research`,
          source_url: '',
        });
        docId = doc?.id || null;
      } catch {
        // Non-fatal
      }
    }

    return Response.json({
      success: true,
      query,
      mode,
      language,
      response: responseText,
      research_doc_id: docId,
      metadata: {
        user: userId,
        timestamp: new Date().toISOString(),
        word_count: responseText.split(/\s+/).length,
        saved_to_kb: !!docId,
      },
    });
  } catch (error) {
    console.error('[CLAUDE RESEARCH QUERY ERROR]', error.message);
    return Response.json({ error: error.message, status: 'FAILED' }, { status: 500 });
  }
});
