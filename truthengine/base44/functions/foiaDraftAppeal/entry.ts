import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * FOIA Draft Appeal Generator
 *
 * Uses Claude AI to draft legally grounded FOIA appeal letters,
 * Congressional inquiry letters, and agency escalation correspondence.
 *
 * Supports: VA BIRLS (F001), ICE ENFORCE (F002), NARA (F004), DoD DMDC (F005),
 * INAI México (F003), and custom agency targets.
 */

const LEGAL_SYSTEM_PROMPT = `You are a senior FOIA attorney and Congressional liaison for the AUMER Foundation. You draft legally precise, compelling FOIA appeals, administrative appeals, and Congressional inquiry letters for the TruthEngine360 veteran deportation investigation.

LEGAL BASIS:
- 5 U.S.C. §552 (FOIA): 20-business-day statutory deadline. Exceptional circumstances must be documented.
- 5 U.S.C. §552(a)(6)(E): Expedited processing for imminent life/death, media urgency, or significant government operations.
- 28 C.F.R. §16.6: DOJ appeals procedure. Agency-specific CFR sections apply.
- Congressional right to access: Members and authorized staff can request records under 5 U.S.C. §552(f) with enhanced standing.
- INA §329 / 8 U.S.C. §1440: Wartime naturalization — records directly relevant to congressional oversight.
- GAO-19-416: Establishes government accountability precedent for veteran tracking failures.

ACTIVE REQUESTS:
- F001: VA BIRLS — vacofoiaservice@va.gov — 1-877-750-3639 — 83+ days OVERDUE
- F002: ICE ENFORCE — foia.ice@dhs.gov — 66+ days OVERDUE
- F003: INAI México / COMAR — pending
- F004: NARA Surname File NA-14021 — extension granted
- F005: DoD DMDC — dmdc.foia@mail.mil — 25+ days overdue

CHC BRIEFING: May 18, 2026 — imminent deadline creates expedited processing basis.

Draft letters that are: (1) legally precise, (2) respectful but firm, (3) specific about statutory violations, (4) include exact data needed and why, (5) state consequences of non-response, (6) formatted for immediate sending.`;

const AGENCY_CONTACTS: Record<string, Record<string, string>> = {
  va_birls: {
    name: 'Department of Veterans Affairs',
    office: 'VA FOIA Service',
    email: 'vacofoiaservice@va.gov',
    phone: '1-877-750-3639',
    address: '810 Vermont Ave NW, Washington DC 20420',
    request_id: 'F001',
    days_overdue: '83',
    data_needed: 'VA BIRLS (Benefits Identification and Records Locator Subsystem) military discharge cross-reference for Vietnam-era veterans with foreign-national status',
  },
  ice_enforce: {
    name: 'U.S. Immigration and Customs Enforcement',
    office: 'ICE FOIA Office',
    email: 'foia.ice@dhs.gov',
    phone: '866-633-1182',
    address: '500 12th St SW, Washington DC 20536',
    request_id: 'F002',
    days_overdue: '66',
    data_needed: 'ICE ENFORCE/IDENT removal records crosswalk for veterans, including veteran-status field analysis for FY2022–2026',
  },
  dod_dmdc: {
    name: 'Department of Defense — Defense Manpower Data Center',
    office: 'DMDC FOIA Office',
    email: 'dmdc.foia@mail.mil',
    phone: '831-655-8000',
    address: '4800 Mark Center Drive, Alexandria VA 22350',
    request_id: 'F005',
    days_overdue: '25',
    data_needed: 'DMDC service records cross-reference for foreign-national Vietnam-era veterans, specifically naturalization status at time of discharge',
  },
  nara: {
    name: 'National Archives and Records Administration',
    office: 'NARA FOIA Office',
    email: 'inquire@nara.gov',
    phone: '866-272-6272',
    address: '8601 Adelphi Rd, College Park MD 20740',
    request_id: 'F004',
    days_overdue: '0 (extension granted)',
    data_needed: 'NARA Surname File NA-14021 from Selective Service System RG 147 — Vietnam-era draft registrant records with country-of-birth field',
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let userId = 'analyst';
    try {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      userId = user.email || user.id || 'analyst';
    } catch {
      // Allow service-role
    }

    const {
      letter_type,
      agency_key,
      foia_request_id,
      custom_agency,
      sender_name = 'AUMER Foundation Research Team',
      sender_title = 'Director of Forensic Research',
      sender_org = 'AUMER Foundation / TruthEngine360 Project',
      congressional_member,
      escalation_reason,
      additional_context,
    } = await req.json();

    if (!letter_type) {
      return Response.json({ error: 'Missing letter_type' }, { status: 400 });
    }

    const agency = agency_key ? AGENCY_CONTACTS[agency_key] : null;

    // ── Build letter prompt ─────────────────────────────────────────────────
    const letterInstructions: Record<string, string> = {
      foia_appeal: `Draft a formal FOIA administrative appeal letter. This is the first administrative appeal under 5 U.S.C. §552(a)(6)(A)(i)(I). Include: (1) statutory violation specifics, (2) original request details, (3) days overdue vs. 20-business-day limit, (4) urgent need tied to May 18, 2026 CHC briefing, (5) expedited processing request under §552(a)(6)(E)(i)(I) (threat to life/safety of deported veterans), (6) specific documents requested, (7) request for index of withheld documents under Vaughn v. Rosen, (8) deadline for response, (9) statement of intent to escalate to FOIA litigation.`,
      congressional_inquiry: `Draft a Congressional inquiry letter from ${congressional_member || 'a Member of the Congressional Hispanic Caucus'} to the agency head. Include: (1) Member's oversight authority, (2) specific request for records, (3) connection to legislative activity (bills S.874 and HR.1537), (4) GAO-19-416 accountability reference, (5) 15-day response deadline, (6) request for agency head meeting, (7) CC to Inspector General.`,
      escalation_notice: `Draft a final escalation notice before FOIA litigation. Include: (1) full statutory violation history, (2) notice of intent to file in U.S. District Court under 5 U.S.C. §552(a)(4)(B), (3) attorney's fees and costs notice under §552(a)(4)(E), (4) 10-business-day final opportunity to comply, (5) evidence of bad faith or exceptional delay, (6) impact statement on CHC briefing and veteran welfare.`,
      gao_referral: `Draft a letter requesting GAO investigation and subpoena authority over the agency's FOIA non-compliance. Reference GAO-19-416 and request an updated audit.`,
      friendly_reminder: `Draft a polite but firm status inquiry letter. Professional tone. Request status update, tracking number confirmation, and estimated completion date. Include CHC briefing context as urgency.`,
      mexico_inai: `Draft a FOIA-equivalent transparency request to INAI México (Instituto Nacional de Transparencia) under Ley General de Transparencia y Acceso a la Información Pública. In both English and Spanish. Requesting COMAR records on border deportations of individuals with documented U.S. military service.`,
    };

    const instruction = letterInstructions[letter_type] || letterInstructions.friendly_reminder;

    const agencyBlock = agency
      ? `TARGET AGENCY:
  Name: ${agency.name}
  Office: ${agency.office}
  Email: ${agency.email}
  Phone: ${agency.phone}
  Address: ${agency.address}
  FOIA Request ID: ${agency.request_id}
  Days Overdue: ${agency.days_overdue}
  Data Needed: ${agency.data_needed}`
      : custom_agency
      ? `TARGET AGENCY: ${custom_agency}`
      : `TARGET AGENCY: [Specify agency]`;

    const escalationBlock = escalation_reason
      ? `ESCALATION REASON: ${escalation_reason}`
      : '';

    const additionalBlock = additional_context
      ? `ADDITIONAL CONTEXT: ${additional_context}`
      : '';

    const todayDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const aiResult = await base44.integrations.Core.InvokeLLM({
      prompt: `${instruction}

DATE: ${todayDate}
SENDER: ${sender_name}, ${sender_title}, ${sender_org}
FOIA REQUEST REFERENCE: ${foia_request_id || agency?.request_id || 'See attached'}

${agencyBlock}
${escalationBlock}
${additionalBlock}

Generate the complete, ready-to-send letter now. Use proper formal letter format with date, addresses, salutation, body, closing, signature block, and CC line. Be specific, legally grounded, and professionally firm.`,
      system_prompt: LEGAL_SYSTEM_PROMPT,
    });

    const letterText = typeof aiResult === 'string'
      ? aiResult
      : aiResult?.text || aiResult?.content || JSON.stringify(aiResult);

    // ── Save draft to ResearchDoc ───────────────────────────────────────────
    const letterId = `LETTER-${letter_type.toUpperCase()}-${Date.now()}`;
    let docId: string | null = null;
    try {
      const doc = await base44.entities.ResearchDoc.create({
        title: `[${letter_type.toUpperCase()}] ${agency?.name || custom_agency || 'FOIA Letter'} — ${todayDate}`,
        summarized_abstract: letterText.slice(0, 600),
        applications: `FOIA Correspondence · ${letter_type} · ${agency?.request_id || foia_request_id || 'N/A'}`,
        cluster_tags: `foia,correspondence,${letter_type},ai-drafted`,
        source_url: '',
      });
      docId = doc?.id || null;
    } catch {
      // Non-fatal
    }

    return Response.json({
      success: true,
      letter_id: letterId,
      letter_type,
      agency: agency?.name || custom_agency,
      foia_request_id: foia_request_id || agency?.request_id,
      generated_at: new Date().toISOString(),
      sender: sender_name,
      research_doc_id: docId,
      letter: letterText,
      send_to: agency?.email,
      metadata: {
        word_count: letterText.split(/\s+/).length,
        legal_basis: ['5 U.S.C. §552', 'GAO-19-416', 'INA §329'],
        chc_briefing_date: 'May 18, 2026',
      },
    });
  } catch (error) {
    console.error('[FOIA DRAFT APPEAL ERROR]', error.message);
    return Response.json({ error: error.message, status: 'FAILED' }, { status: 500 });
  }
});
