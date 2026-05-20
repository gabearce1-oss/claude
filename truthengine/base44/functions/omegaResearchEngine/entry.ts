import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Omega Research Engine — Adversarial Historical Intelligence Framework
 *
 * Implements the Claude Intensive Historical Research Protocol at Omega level.
 * Applies:
 *   - 5-Gate Admissibility Test (Existence, Metadata, Provenance, Authenticity, Corroboration)
 *   - Claim Classification (VERIFIED / PLAUSIBLE / WEAK / CONTRADICTED / FABRICATED)
 *   - Datation If-Then Escalation Logic
 *   - Adversarial Verification Mode (contradiction-first analytics)
 *   - AI Contamination Firewall (no AI-to-AI circular citation)
 *   - Multi-pass research sweep coordination
 *   - Chain-of-custody protocol
 *
 * Output: structured evidence report with full verdict classifications
 */

const OMEGA_SYSTEM_PROMPT = `You are operating as an adversarial historical intelligence analyst under the Omega-Level Admissibility Framework. You are NOT a creative writer, advocate, or speculative assistant.

MISSION:
- Authenticate evidence
- Identify contamination
- Isolate fabricated claims
- Establish provenance
- Preserve evidentiary integrity
- Construct findings that survive legal, academic, archival, or congressional scrutiny

CORE RULE: Narrative coherence NEVER overrides documentary authenticity. Specificity is NOT authenticity.

═══════════════════════════════════════════════════════════════
FIVE-GATE ADMISSIBILITY TEST (MANDATORY FOR EVERY CLAIM)
═══════════════════════════════════════════════════════════════
Gate 1 — EXISTENCE: Does the source exist in an official repository or catalog?
  Failure: broken links, untraceable identifiers, missing finding aid

Gate 2 — METADATA: Does it contain complete archival metadata?
  Failure: missing repository, creator, accession number, or date

Gate 3 — PROVENANCE: Is custodial history traceable?
  Failure: circular sourcing, undocumented origin, chain of custody broken

Gate 4 — AUTHENTICITY: Is formatting period-consistent with the claimed era?
  Failure: modern syntax, synthetic IDs, AI formatting, anachronistic terminology

Gate 5 — CORROBORATION: Is it independently supported by at least one separate source?
  Failure: single-source dependency

If ANY gate fails → claim is HYPOTHESIS ONLY. Never elevate hypotheses to narrative fact.

═══════════════════════════════════════════════════════════════
CLAIM CLASSIFICATION ENGINE (APPLY TO EVERY CLAIM)
═══════════════════════════════════════════════════════════════
VERIFIED     → Fully authenticated and corroborated. May enter formal findings.
PLAUSIBLE    → Historically consistent but incomplete. Context layer only.
WEAK         → Unsupported assertion. Hypothesis registry only.
CONTRADICTED → Conflicts with other evidence. Flag and isolate.
FABRICATED   → Synthetic, impossible, or AI-generated. Remove entirely.

Never mix verdict classes in the same prose paragraph. Maintain strict evidentiary separation.

═══════════════════════════════════════════════════════════════
DATATION IF-THEN ESCALATION LOGIC
═══════════════════════════════════════════════════════════════
Every verified object becomes a launch point. Apply:

"IF this is true → WHAT MUST ALSO EXIST?"
"IF this is false → WHAT CONTRADICTIONS SHOULD APPEAR?"

Example: IF a service record exists for a Vietnam-era foreign national THEN:
- Draft registration card in SSS RG 147 must exist
- Selective Service classification notice must exist
- DCAS entry should exist (if KIA) or NPRC OMPF if alive
- USCIS naturalization file should show §329 application or denial
- VA benefit record should exist (compensation, disability, pension)
- Tax records, census entries, immigration manifest should corroborate identity
- If none of these exist → investigate WHY → lower confidence, flag as WEAK

ELSE IF no supporting ecosystem exists → contradiction review mandatory.

For every confirmed entity, expand across:
- IDENTITY LAYER: aliases, spelling variations, patronymic shifts, immigration name changes
- GEOGRAPHIC LAYER: adjacent municipalities, migration corridors, border crossings
- INSTITUTIONAL LAYER: banks, courts, military offices, churches, newspapers
- TEMPORAL LAYER: before-event, during-event, after-event record generation
- SOCIAL LAYER: family networks, witnesses, godparents, business partners

═══════════════════════════════════════════════════════════════
ADVERSARIAL VERIFICATION MODE (MANDATORY)
═══════════════════════════════════════════════════════════════
Actively attempt to DISPROVE:
- Names, dates, land claims, family relationships
- Military service records, military casualty entries
- Migration records, oral histories, photographs, signatures

Especially scrutinize:
- Overly cinematic details / perfect chronological continuity
- Suspiciously precise financial numbers
- Modern-style document formatting inside historical documents
- Synthetic transaction IDs or accession numbers
- AI-like language cadence or repeated linguistic patterns across "independent" reports
- Circular citations (AI report citing earlier AI report as corroboration)

═══════════════════════════════════════════════════════════════
SYNTHETIC DOCUMENT DETECTION (IMMEDIATE QUARANTINE)
═══════════════════════════════════════════════════════════════
Quarantine any source containing:
- Modern alphanumeric archival codes in pre-digital era documents
- Corporate memo formatting inconsistent with the period
- Impossible bureaucratic terminology for the claimed date
- Post-1960 language inside early-century documents
- Untraceable employees or officers
- Fabricated accession numbers
- AI-generated legal phrasing
- Repeated linguistic cadence across supposedly independent reports

If detected: mark CONTAMINATED. Never cite contaminated material as evidence.

═══════════════════════════════════════════════════════════════
AI CONTAMINATION FIREWALL
═══════════════════════════════════════════════════════════════
PROHIBITED LOOP: AI report → cited by later AI report → treated as corroboration
This creates synthetic consensus. It is prohibited.

AI output → archive search target ONLY.
AI may suggest leads. Only repositories create evidence.
I am bound by this rule: I will flag when I am extrapolating beyond verified data.

═══════════════════════════════════════════════════════════════
REPORTING STRUCTURE (MANDATORY)
═══════════════════════════════════════════════════════════════
All outputs must contain these sections:
1. VERIFIED FINDINGS — gate-tested, corroborated, classification: VERIFIED
2. PLAUSIBLE CONTEXT — historically consistent, classification: PLAUSIBLE
3. UNRESOLVED QUESTIONS — investigative gaps requiring archive search
4. CONTRADICTORY EVIDENCE — conflicts requiring resolution
5. FABRICATED / CONTAMINATED CLAIMS — removed from evidentiary layer
6. ARCHIVE REQUEST PRIORITIES — specific repositories to query next
7. IF-THEN ESCALATION PATHS — what else must exist if verified claims are true
8. CONFIDENCE LEVELS (A/B/C/D/F per claim)
9. SOURCE MATRIX — what has been searched and what has not
10. LIMITATIONS — what this analysis cannot determine

INTELLIGENCE PRIORITY SCORING:
CRITICAL → Primary-source opportunity exists
HIGH     → Cross-repository corroboration possible
MEDIUM   → Historically plausible but incomplete
LOW      → Weak narrative support
QUARANTINED → Synthetic contamination risk

═══════════════════════════════════════════════════════════════
CONTEXT — TRUTHENGINE360 INVESTIGATION
═══════════════════════════════════════════════════════════════
Primary investigation: DCAS Vietnam-era Hispanic casualty undercount.
VERIFIED BASELINE: DCAS official = 349 Hispanic (0.60% of 58,220). BIFSG median = 3,272. Gap = 83.6%.
All six CB-HSIVF cases are SHA-256 certified and may be referenced but must independently survive gate testing for any new claims.
Congressional deadline: CHC briefing May 18, 2026.
Never cite prior AI TE360 analysis as evidentiary corroboration. Use it as a search-direction tool only.

The objective is survivable truth. A beautiful lie is operational failure. A narrow verified fact is operational success.`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let userId = 'analyst';
    try {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      userId = user.email || user.id || 'analyst';
    } catch {
      // service-role allowed
    }

    const {
      claim,
      context,
      sweep_number = 1,
      sweep_mode = 'standard',
      source_objects = [],
      prior_findings = null,
      repository_targets = [],
      escalation_mode = false,
      require_json = false,
    } = await req.json();

    if (!claim?.trim()) {
      return Response.json({ error: 'Missing claim to investigate' }, { status: 400 });
    }

    // ── Build investigative prompt ──────────────────────────────────────────
    const sweepInstructions: Record<string, string> = {
      standard: 'Conduct a comprehensive adversarial analysis. Start from a neutral position and attempt to falsify before supporting.',
      falsification: 'This is an adversarial falsification sweep. Your primary goal is to DISPROVE the claim. Look for contradictions, impossibilities, anachronisms, and gaps.',
      corroboration: 'Focus exclusively on what INDEPENDENT corroboration exists. Do not use any source that originates from or was generated by this investigation.',
      temporal: 'Conduct a temporal pressure test. Verify that every date, institution, technology, and communication method is consistent with the claimed period.',
      geographic: 'Conduct a geographic plausibility sweep. Verify that every location, transit route, border crossing, and institutional presence is consistent with the period.',
      institutional: 'Map the full institutional ecosystem. What agencies, courts, banks, newspapers, churches, and registries would have generated records if this claim is true?',
    };

    const priorContext = prior_findings
      ? `\n\nPRIOR SWEEP FINDINGS (for contradiction analysis — NOT as corroboration):\n${typeof prior_findings === 'string' ? prior_findings : JSON.stringify(prior_findings, null, 2)}`
      : '';

    const sourceContext = source_objects.length > 0
      ? `\n\nPROVIDED SOURCE OBJECTS (apply 5-Gate test to each):\n${source_objects.map((s: any, i: number) => `${i+1}. ${typeof s === 'string' ? s : JSON.stringify(s)}`).join('\n')}`
      : '';

    const repoContext = repository_targets.length > 0
      ? `\n\nPRIORITY REPOSITORIES TO SEARCH:\n${repository_targets.join('\n')}`
      : '';

    const escalationNote = escalation_mode
      ? '\n\nDATATION ESCALATION MODE ACTIVE: For every verified finding, generate an IF-THEN escalation matrix listing what MUST ALSO EXIST if the claim is true, and what CONTRADICTIONS SHOULD APPEAR if it is false.'
      : '';

    const formatNote = require_json
      ? '\n\nReturn output as structured JSON with keys: verified_findings, plausible_context, unresolved_questions, contradictory_evidence, contaminated_claims, archive_priorities, if_then_escalations, confidence_matrix, source_matrix, limitations.'
      : '';

    const fullPrompt = `SWEEP ${sweep_number} — MODE: ${sweep_mode.toUpperCase()}
${sweepInstructions[sweep_mode] || sweepInstructions.standard}

CLAIM UNDER INVESTIGATION:
${claim}

${context ? `INVESTIGATOR-PROVIDED CONTEXT:\n${context}` : ''}
${sourceContext}
${priorContext}
${repoContext}
${escalationNote}
${formatNote}

Apply the full Omega-Level protocol. Apply the 5-Gate Admissibility Test. Classify every claim. Run adversarial verification. If any claim fails a gate, classify as HYPOTHESIS ONLY. Populate all 10 mandatory report sections.`;

    // ── Invoke Claude under Omega Protocol ─────────────────────────────────
    const runId = `OMEGA-SWEEP${sweep_number}-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const aiResult = await base44.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      system_prompt: OMEGA_SYSTEM_PROMPT,
      add_context_from_previous_messages: false,
    });

    const reportText = typeof aiResult === 'string'
      ? aiResult
      : aiResult?.text || aiResult?.content || JSON.stringify(aiResult);

    // ── Extract structured sections from text (best-effort) ─────────────────
    const sections = {
      verified: extractSection(reportText, ['VERIFIED FINDINGS', 'VERIFIED:']),
      plausible: extractSection(reportText, ['PLAUSIBLE CONTEXT', 'PLAUSIBLE:']),
      unresolved: extractSection(reportText, ['UNRESOLVED QUESTIONS', 'UNRESOLVED:']),
      contradictory: extractSection(reportText, ['CONTRADICTORY EVIDENCE', 'CONTRADICTED:']),
      contaminated: extractSection(reportText, ['FABRICATED', 'CONTAMINATED', 'QUARANTINE:']),
      archive_priorities: extractSection(reportText, ['ARCHIVE REQUEST PRIORITIES', 'REPOSITORY PRIORITIES:']),
      if_then: extractSection(reportText, ['IF-THEN ESCALATION', 'DATATION ESCALATION:', 'ESCALATION PATHS:']),
      limitations: extractSection(reportText, ['LIMITATIONS', 'LIMITATIONS:']),
    };

    // ── Save to ResearchDoc as evidence node ────────────────────────────────
    let docId: string | null = null;
    try {
      const doc = await base44.entities.ResearchDoc.create({
        title: `[OMEGA-SWEEP${sweep_number}] ${claim.slice(0, 100)}`,
        summarized_abstract: sections.verified || reportText.slice(0, 600),
        applications: `Omega Research Engine · Sweep ${sweep_number} · Mode: ${sweep_mode} · ${timestamp.slice(0,10)}`,
        cluster_tags: `omega,adversarial,sweep-${sweep_number},${sweep_mode},evidence-grade`,
        source_url: '',
      });
      docId = doc?.id || null;
    } catch {
      // non-fatal
    }

    return Response.json({
      success: true,
      run_id: runId,
      sweep_number,
      sweep_mode,
      claim: claim.slice(0, 200),
      timestamp,
      analyst: userId,
      research_doc_id: docId,
      report: reportText,
      sections,
      protocol: 'Omega-Level Admissibility Framework v1.0',
      gates_applied: ['Existence', 'Metadata', 'Provenance', 'Authenticity', 'Corroboration'],
      contamination_firewall: 'ACTIVE — AI output not used as corroboration',
      metadata: {
        word_count: reportText.split(/\s+/).length,
        sweep_mode,
        escalation_mode,
        sources_submitted: source_objects.length,
        repository_targets: repository_targets.length,
      },
    });
  } catch (error) {
    console.error('[OMEGA RESEARCH ENGINE ERROR]', error.message);
    return Response.json({ error: error.message, status: 'FAILED' }, { status: 500 });
  }
});

function extractSection(text: string, headers: string[]): string {
  for (const header of headers) {
    const pattern = new RegExp(`${header}[:\\s]*([\\s\\S]*?)(?=\\n[A-Z][A-Z\\s]{5,}:|$)`, 'i');
    const match = text.match(pattern);
    if (match?.[1]?.trim()) return match[1].trim().slice(0, 1000);
  }
  return '';
}
