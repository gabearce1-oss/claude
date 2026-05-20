// Dual-LLM client: GPT-4o for structured/vision tasks, Claude for narrative/FOIA
// Uses Base44 edge functions for production; falls back to client-side for dev only.

const OPENAI_API = 'https://api.openai.com/v1';

function getOpenAIKey() {
  return import.meta.env.VITE_OPENAI_API_KEY;
}

async function openaiChat(model, messages, options = {}) {
  const key = getOpenAIKey();
  if (!key) throw new Error('VITE_OPENAI_API_KEY not configured');

  const res = await fetch(`${OPENAI_API}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, ...options }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error (${res.status}): ${err}`);
  }
  return res.json();
}

// ── Query Router ─────────────────────────────────────────────────────────────
// Returns the preferred LLM for a given user message.
export function routeQuery(userMessage) {
  const msg = userMessage.toLowerCase();
  if (msg.includes('extract') && (msg.includes('pdf') || msg.includes('image') || msg.includes('scan'))) {
    return 'openai-vision';
  }
  if (msg.includes('bisg') || msg.includes('surname probability') || msg.includes('classify surname')) {
    return 'openai-json';
  }
  if (msg.includes('triage') || msg.includes('classify record') || msg.includes('batch')) {
    return 'openai-mini';
  }
  // FOIA drafts, CHC briefings, narratives, congressional correspondence → Claude
  return 'claude';
}

// ── GPT-4o: DCAS Casualty Record Classification ──────────────────────────────
// Returns: { bisg_hispanic_probability, surname_origin, classification_confidence, anomaly_flags }
export async function classifyCasualtyRecord(record) {
  const response = await openaiChat(
    'gpt-4o',
    [
      {
        role: 'system',
        content:
          'You are a DCAS forensic analyst. DCAS official Hispanic count = 349 of 58,220 (0.60%). BISG τ=0.40 estimate = 2,309 (84.9% classification failure). Given a casualty record, return a JSON object with: bisg_hispanic_probability (0-1), surname_origin (string), classification_confidence ("high" | "medium" | "low"), anomaly_flags (array of strings describing any classification anomalies). Only output valid JSON.',
      },
      {
        role: 'user',
        content: JSON.stringify(record),
      },
    ],
    { response_format: { type: 'json_object' }, max_tokens: 512 }
  );
  return JSON.parse(response.choices[0].message.content);
}

// ── GPT-4o Vision: PDF/Image Entity Extraction ───────────────────────────────
// Returns extracted fields: name, service_number, dob, branch, casualty_date, home_of_record
export async function extractPDFEntities(base64Image, mimeType = 'image/jpeg') {
  const response = await openaiChat(
    'gpt-4o',
    [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${base64Image}`, detail: 'high' },
          },
          {
            type: 'text',
            text: 'Extract all of the following fields from this military document. Return a JSON object: full_name (string), service_number (string or null), date_of_birth (ISO date or null), service_branch (string or null), casualty_date (ISO date or null), home_of_record (string or null), race_ethnicity_coded (string or null — exact text from the document), form_type (string — e.g. DD-1300, Form 102, DD-214), additional_fields (object with any other key data). If a field is not present, use null. Only output valid JSON.',
          },
        ],
      },
    ],
    { max_tokens: 1024 }
  );
  try {
    return JSON.parse(response.choices[0].message.content);
  } catch {
    return { raw_text: response.choices[0].message.content };
  }
}

// ── GPT-4o mini: High-Volume Record Triage ───────────────────────────────────
// Fast, cheap classification for large batches
export async function triageRecord(recordText) {
  const response = await openaiChat(
    'gpt-4o-mini',
    [
      {
        role: 'system',
        content:
          'You are a triage classifier for Vietnam-era military records. Classify each record and return JSON: { priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW", record_type: string, contains_hispanic_surname: boolean, anomaly_suspected: boolean, notes: string }',
      },
      { role: 'user', content: recordText.slice(0, 2000) },
    ],
    { response_format: { type: 'json_object' }, max_tokens: 256 }
  );
  return JSON.parse(response.choices[0].message.content);
}

// ── GPT-4o: BISG Surname Scoring (Structured JSON) ───────────────────────────
export async function scoreSurnameBISG(surname, stateCode = null) {
  const geo = stateCode ? ` in state ${stateCode}` : '';
  const response = await openaiChat(
    'gpt-4o',
    [
      {
        role: 'system',
        content:
          'You are a Bayesian surname classifier implementing BISG (Bayesian Improved Surname Geocoding). The DCAS Vietnam-era Hispanic prior is ~4% of total casualties. The classification threshold τ=0.40. Return JSON only: { surname_origin: string, p_hispanic_given_surname: number (0-1), p_hispanic_given_geo_adj: number (0-1, same as surname if no geo), bisg_combined: number (0-1), exceeds_tau: boolean, confidence: "high"|"medium"|"low", common_surname_pool: boolean, notes: string }',
      },
      {
        role: 'user',
        content: `Compute BISG score for surname: "${surname}"${geo}`,
      },
    ],
    { response_format: { type: 'json_object' }, max_tokens: 512 }
  );
  return JSON.parse(response.choices[0].message.content);
}

// ── Anthropic via fetch: FOIA / Briefing / Narrative (prose quality required) ─
export async function draftFOIARequest(agencyName, subjectName, recordType, legalBasis) {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!key) throw new Error('VITE_ANTHROPIC_API_KEY not configured');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `Draft a formal FOIA request to ${agencyName} for records on ${subjectName}. Record type: ${recordType}. Legal basis: ${legalBasis}. Include 5 U.S.C. §552 citations and statutory deadline language. Professional letter format. Contact: gtarce@usc.edu, AUMER Foundation EIN 99-0495658.`,
        },
      ],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || data.error?.message || 'Error generating FOIA draft';
}

export async function generateCHCBriefing(topic, context, format = 'formal') {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!key) throw new Error('VITE_ANTHROPIC_API_KEY not configured');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-20250514',
      max_tokens: 4000,
      system:
        'You are a Congressional Hispanic Caucus legislative briefing writer for the AUMER Foundation. DCAS anchor data: 349 official Hispanic casualties / 58,220 total / 2,309 BISG estimate / 84.9% classification failure / 6 verified CB-HSIVF cases. Citation discipline is mandatory. Never fabricate data. Flag placeholders explicitly.',
      messages: [
        {
          role: 'user',
          content: `Write a ${format} CHC briefing on: ${topic}\n\nContext: ${context}`,
        },
      ],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || data.error?.message || 'Error generating briefing';
}
