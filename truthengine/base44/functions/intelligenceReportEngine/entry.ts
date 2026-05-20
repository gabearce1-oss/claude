import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Intelligence Report Engine
 *
 * Generates comprehensive forensic intelligence reports using Claude AI.
 * Supports: DCAS audit reports, case dossiers, FOIA pathway analysis,
 * CHC briefing packages, NERO score summaries, and cross-database findings.
 *
 * Triggered by: manual analyst request, scheduled weekly digest, CHC deadline alert
 */

const REPORT_SYSTEM_PROMPT = `You are a senior forensic intelligence analyst for the AUMER Foundation TruthEngine360 platform. You produce structured, evidence-grounded intelligence reports for Congressional briefings, FOIA escalations, and academic publication.

VERIFIED DATA CONSTANTS (always use these exact figures):
- DCAS total: 58,220 Vietnam records. Official Hispanic: 349 (0.60%)
- BIFSG median estimate: 3,272 (5.62%). Corridor: 2,876–3,372
- BISG τ=0.40 estimate: 2,309 (3.97%). Classification failure: 83.6–84.9%
- NERO composite: 94.5/100 (N=94, E=97, R=91, O=96)
- ICE records (FY2022–2026): 713,464. Veteran flags: ZERO
- 5-stream convergence: DCAS 349 → BISG 2,309 → NARA 3,070 → Guzmán 3,500 → LAE 3,741
- Undercount factor: 8.2×–14.8×
- Active FOIA overdue: F001 VA BIRLS (83+ days), F002 ICE ENFORCE (66+ days), F005 DoD DMDC (25+ days)
- CHC briefing: May 18, 2026. Readiness: ~73%
- Verified cases: 6 (CB-HSIVF certified, Exhibit A — Arce 2026)

Format reports with: CLASSIFICATION header, EXECUTIVE SUMMARY, KEY FINDINGS (numbered), EVIDENCE BASE, ANALYTICAL GAPS, RECOMMENDED ACTIONS, and APPENDIX NOTES.`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let userId = 'service';
    try {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      userId = user.id || user.email || 'user';
    } catch {
      // Allow service-role calls from automation
    }

    const {
      report_type,
      subject,
      case_ids,
      foia_ids,
      include_nero,
      include_bisg,
      include_streams,
      custom_context,
      classification_level = 'SENSITIVE BUT UNCLASSIFIED',
      output_format = 'markdown',
    } = await req.json();

    if (!report_type) {
      return Response.json({ error: 'Missing report_type' }, { status: 400 });
    }

    // ── Build context block ─────────────────────────────────────────────────
    const contextParts: string[] = [];

    if (include_nero) {
      contextParts.push(`NERO INSTITUTIONAL ERASURE INDEX:
  N (Notification): 94/100 — citizenship promise never formalized
  E (Erasure): 97/100 — 84.9% DCAS misclassification
  R (Restriction): 91/100 — VA access barriers post-deportation
  O (Obscurity): 96/100 — ICE confirmed only 92 vs 94,000+ estimated
  Composite: 94.5/100 — all four vectors exceed critical threshold (90)`);
    }

    if (include_bisg) {
      contextParts.push(`BISG/BIFSG FORENSIC METHODOLOGY:
  Algorithm: Bayesian Improved Surname Geocoding at τ=0.40
  Sensitivity: 98.3% (343 of 349 published Hispanic captured)
  BIFSG flagged at threshold: 2,132 (1970 baseline), 2,820 (2020 sanity check)
  R²=0.935–0.947, ANOVA F=4.521, p=0.038
  Suppressed: 1,789 (BIFSG-flagged NOT published Hispanic)
  State leaders: TX=711, CA=640, NM=148, AZ=113`);
    }

    if (include_streams) {
      contextParts.push(`5-STREAM CONVERGENCE:
  S1 DCAS Official: 349 (0.60%) — ANOMALOUS BASELINE
  S2 BISG τ=0.40: 2,309 (3.97%) — FORENSIC
  S3 NARA Retroactive: 3,070 (5.27%) — ARCHIVAL
  S4 Guzmán 1969: 3,500 (6.01%) — HISTORICAL
  S5 LAE Database: 3,741 (6.43%) — COMMUNITY
  Convergence range: 2,309–3,741. Undercount: 8.2×–14.8×`);
    }

    if (case_ids?.length) {
      contextParts.push(`RELEVANT CASES: ${case_ids.join(', ')} — Pull from verified CB-HSIVF case registry.`);
    }

    if (foia_ids?.length) {
      contextParts.push(`RELEVANT FOIA REQUESTS: ${foia_ids.join(', ')} — Reference tracking system for status.`);
    }

    if (custom_context) {
      contextParts.push(`ADDITIONAL ANALYST CONTEXT:\n${custom_context}`);
    }

    const contextBlock = contextParts.length > 0
      ? `\n\nCONTEXT DATA:\n${contextParts.join('\n\n')}`
      : '';

    // ── Report type instructions ────────────────────────────────────────────
    const reportInstructions: Record<string, string> = {
      dcas_audit: `Generate a DCAS Casualty Undercount Audit Intelligence Report. Cover: (1) statistical anomaly analysis, (2) 5-stream convergence methodology and findings, (3) root cause analysis of 1975 reclassification, (4) state-level suppression breakdown, (5) implications for CHC legislative asks #2 and #3, (6) recommended audit steps.`,
      chc_briefing: `Generate a Congressional Hispanic Caucus Briefing Package. Cover: (1) 2-page executive summary suitable for Members, (2) all 6 legislative asks with specific bill numbers, (3) supporting evidence chain, (4) verified case summaries, (5) urgency factors (FOIA blockers, deadline), (6) witness recommendations.`,
      case_dossier: `Generate a Verified Case Dossier intelligence report. Cover: (1) case summary per CB-HSIVF certification standard, (2) evidence chain with SHA-256 references, (3) legal analysis (INA §329, IIRIRA §237 applicability), (4) FOIA linkage, (5) confidence assessment, (6) priority action items.`,
      foia_pathway: `Generate a FOIA Pathway Intelligence Report. Cover: (1) all active FOIA requests with overdue analysis, (2) agency-specific escalation strategies, (3) Congressional intervention options, (4) legal basis for each request, (5) timeline impact on CHC briefing, (6) appeal templates outline.`,
      nero_analysis: `Generate a NERO Institutional Erasure Analysis Report. Cover: (1) all four NERO vectors in depth, (2) scoring methodology, (3) historical causation chain, (4) comparison to similar historical patterns, (5) remediation requirements for each vector, (6) monitoring recommendations.`,
      database_landscape: `Generate a Database Ecosystem Intelligence Report. Cover: (1) all 30+ US databases with priority tiers, (2) Mexico database network, (3) access strategy for each, (4) data gaps and FOIA requirements, (5) integration architecture recommendations, (6) cross-reference potential.`,
      weekly_digest: `Generate a Weekly Operations Digest. Cover: (1) FOIA status changes this week, (2) case developments, (3) NERO score changes, (4) CHC readiness update, (5) database access updates, (6) priority action items for the next 7 days.`,
      custom: `Generate an intelligence report on the following subject: ${subject || 'General forensic status'}.`,
    };

    const instruction = reportInstructions[report_type] || reportInstructions.custom;

    // ── Invoke Claude AI ────────────────────────────────────────────────────
    const timestamp = new Date().toISOString();
    const reportId = `RPT-${report_type.toUpperCase()}-${Date.now()}`;

    const aiResult = await base44.integrations.Core.InvokeLLM({
      prompt: `${instruction}

Classification level: ${classification_level}
Report ID: ${reportId}
Generated: ${timestamp}
Analyst: ${userId}
${contextBlock}

Produce the complete report now. Use the exact verified statistics from the system prompt. Format in ${output_format}.`,
      system_prompt: REPORT_SYSTEM_PROMPT,
    });

    const reportText = typeof aiResult === 'string'
      ? aiResult
      : aiResult?.text || aiResult?.content || JSON.stringify(aiResult);

    // ── Save to ResearchDoc ─────────────────────────────────────────────────
    let docId: string | null = null;
    try {
      const doc = await base44.entities.ResearchDoc.create({
        title: `[${report_type.toUpperCase()}] ${subject || 'Intelligence Report'} — ${timestamp.slice(0, 10)}`,
        summarized_abstract: reportText.slice(0, 800),
        applications: `Intelligence Report · ${report_type} · ${classification_level}`,
        cluster_tags: `intelligence-report,${report_type},ai-generated,claude`,
        source_url: '',
      });
      docId = doc?.id || null;
    } catch {
      // Non-fatal — continue even if entity save fails
    }

    return Response.json({
      success: true,
      report_id: reportId,
      report_type,
      classification: classification_level,
      generated_at: timestamp,
      analyst: userId,
      research_doc_id: docId,
      report: reportText,
      metadata: {
        includes_nero: !!include_nero,
        includes_bisg: !!include_bisg,
        includes_streams: !!include_streams,
        case_count: case_ids?.length || 0,
        foia_count: foia_ids?.length || 0,
        word_count: reportText.split(/\s+/).length,
      },
    });
  } catch (error) {
    console.error('[INTEL REPORT ENGINE ERROR]', error.message);
    return Response.json({ error: error.message, status: 'FAILED' }, { status: 500 });
  }
});
