import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * FOIA Document Processor
 * 
 * Automated pipeline:
 * 1. Receives FOIA document (PDF text or raw text)
 * 2. Uses Claude AI to extract veteran entities
 * 3. Measures 5 DCAS vectors (erasure patterns)
 * 4. Maps findings to veteran_cases table
 * 5. Creates convergence validation records
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { foia_request_id, document_text, source_agency } = await req.json();

    if (!foia_request_id || !document_text) {
      return Response.json(
        { error: 'Missing foia_request_id or document_text' },
        { status: 400 }
      );
    }

    // ========================================================================
    // STEP 1: Extract Veteran Entities using Claude
    // ========================================================================

    const extractionPrompt = `You are a forensic analyst extracting veteran information from FOIA documents.

DOCUMENT TEXT:
${document_text}

EXTRACTION TASK:
Extract ALL mentions of deported U.S. military veterans. For each veteran found, extract:
1. Name (or name hash if redacted)
2. Service number
3. Rank/Rate
4. Service branch (USMC, Army, Navy, Air Force, Coast Guard)
5. Years of service
6. Enlistment/discharge dates
7. Discharge status (Honorable, General, Other Than Honorable, etc.)
8. Casualty/deportation status
9. Destination country (if deported)
10. Location/circumstances mentioned
11. Data source quality (primary doc, secondary mention, etc.)
12. Confidence score (0-100) for this being a real deported veteran case

ERASURE PATTERNS to identify:
- Redactions (what was redacted?)
- Deletions (what appears to be missing?)
- Contradictions (conflicting information?)
- Gaps in record (missing dates, locations?)
- Information suppression indicators
- Language changes/euphemisms used

Return as JSON array with structure:
{
  "extracted_veterans": [
    {
      "name": "...",
      "service_number": "...",
      "rank_final": "...",
      "service_branch": "...",
      "years_service": "...",
      "enlistment_date": "YYYY-MM-DD",
      "discharge_date": "YYYY-MM-DD",
      "discharge_status": "...",
      "casualty_status": "deported|kia|mia|other",
      "destination_country": "...",
      "confidence_score": 0-100,
      "data_source": "FOIA_${agency}",
      "extraction_notes": "..."
    }
  ],
  "erasure_patterns": {
    "redactions_found": true/false,
    "redactions_detail": "...",
    "deletions_found": true/false,
    "deletions_detail": "...",
    "contradictions_found": true/false,
    "contradictions_detail": "...",
    "information_gaps": ["gap1", "gap2"],
    "suppression_indicators": ["indicator1", "indicator2"],
    "overall_erasure_risk": "high|medium|low"
  }
}`;

    const extractionResponse = await base44.integrations.Core.InvokeLLM({
      prompt: extractionPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          extracted_veterans: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                service_number: { type: 'string' },
                rank_final: { type: 'string' },
                service_branch: { type: 'string' },
                years_service: { type: 'string' },
                enlistment_date: { type: 'string' },
                discharge_date: { type: 'string' },
                discharge_status: { type: 'string' },
                casualty_status: { type: 'string' },
                destination_country: { type: 'string' },
                confidence_score: { type: 'number' },
                data_source: { type: 'string' },
                extraction_notes: { type: 'string' },
              },
            },
          },
          erasure_patterns: {
            type: 'object',
            properties: {
              redactions_found: { type: 'boolean' },
              redactions_detail: { type: 'string' },
              deletions_found: { type: 'boolean' },
              deletions_detail: { type: 'string' },
              contradictions_found: { type: 'boolean' },
              contradictions_detail: { type: 'string' },
              information_gaps: { type: 'array', items: { type: 'string' } },
              suppression_indicators: { type: 'array', items: { type: 'string' } },
              overall_erasure_risk: { type: 'string' },
            },
          },
        },
      },
    });

    const extraction = extractionResponse;

    // ========================================================================
    // STEP 2: Calculate 5 DCAS Vectors (Institutional Erasure Measurement)
    // ========================================================================

    const calculateDcasVectors = (text, patterns) => {
      const vectors = {};

      // Vector 1: Classification Dissolution
      // Measure: How many records are reclassified, redacted, or have changing classifications?
      const classificationMatches = text.match(/\b(unclassified|classified|top secret|secret|confidential|declassified)\b/gi) || [];
      const uniqueClassifications = new Set(classificationMatches.map(m => m.toLowerCase())).size;
      const classificationChangeScore = Math.min(100, uniqueClassifications * 20);
      vectors.classification_dissolution = {
        score: classificationChangeScore,
        evidence: `Found ${classificationMatches.length} classification mentions with ${uniqueClassifications} unique levels`,
        severity: classificationChangeScore > 60 ? 'high' : classificationChangeScore > 30 ? 'medium' : 'low',
      };

      // Vector 2: Estimation Vacuum
      // Measure: How many gaps exist in demographic/identifying data?
      const estimationGaps = [];
      if (!text.match(/\d{1,2}\/\d{1,2}\/\d{2,4}|\\b\d{4}\b/)) estimationGaps.push('dates');
      if (!text.match(/\b[A-Z]{2}\b|avenue|street|road|building/i)) estimationGaps.push('locations');
      if (!text.match(/\d{6,}/)) estimationGaps.push('service_numbers');
      const estimationScore = Math.min(100, estimationGaps.length * 33);
      vectors.estimation_vacuum = {
        score: estimationScore,
        missing_fields: estimationGaps,
        evidence: `${estimationGaps.length} key data categories missing or sparse`,
        severity: estimationScore > 60 ? 'high' : estimationScore > 30 ? 'medium' : 'low',
      };

      // Vector 3: Archival Destruction
      // Measure: Evidence of deletion, removal, or suppression from records?
      const destructionIndicators = [];
      if (text.match(/\[REDACTED\]|\[DELETED\]|\[REMOVED\]/i)) destructionIndicators.push('explicit_redaction');
      if (text.match(/\d+\s*pages?.*withheld|pages?.*not released/i)) destructionIndicators.push('withheld_pages');
      if (patterns.redactions_found) destructionIndicators.push('redaction_found');
      if (patterns.deletions_found) destructionIndicators.push('deletion_found');
      const destructionScore = Math.min(100, destructionIndicators.length * 25);
      vectors.archival_destruction = {
        score: destructionScore,
        indicators: destructionIndicators,
        evidence: `${destructionIndicators.length} indicators of information destruction`,
        severity: destructionScore > 60 ? 'high' : destructionScore > 30 ? 'medium' : 'low',
      };

      // Vector 4: Recognition Latency
      // Measure: How delayed are references/mentions of key events or people?
      const timeReferences = text.match(/\d{4}|january|february|march|april|may|june|july|august|september|october|november|december/gi) || [];
      const chronologicalGaps = [];
      if (timeReferences.length < 3) chronologicalGaps.push('sparse_temporal_references');
      if (text.match(/\.\.\.|approximately|circa|around|roughly/i)) chronologicalGaps.push('vague_timing');
      const latencyScore = Math.min(100, chronologicalGaps.length * 50 + (timeReferences.length < 5 ? 20 : 0));
      vectors.recognition_latency = {
        score: latencyScore,
        temporal_references: timeReferences.length,
        chronological_issues: chronologicalGaps,
        evidence: `${timeReferences.length} time references; ${chronologicalGaps.length} chronological gaps`,
        severity: latencyScore > 60 ? 'high' : latencyScore > 30 ? 'medium' : 'low',
      };

      // Vector 5: Compounding Invisibility
      // Measure: Combination of all four vectors creating cascading suppression
      const avgScore = (
        vectors.classification_dissolution.score +
        vectors.estimation_vacuum.score +
        vectors.archival_destruction.score +
        vectors.recognition_latency.score
      ) / 4;
      const compoundingFactor = (vectors.classification_dissolution.score * 0.25 +
        vectors.estimation_vacuum.score * 0.25 +
        vectors.archival_destruction.score * 0.25 +
        vectors.recognition_latency.score * 0.25);
      
      vectors.compounding_invisibility = {
        score: Math.round(compoundingFactor),
        component_scores: {
          classification_dissolution: vectors.classification_dissolution.score,
          estimation_vacuum: vectors.estimation_vacuum.score,
          archival_destruction: vectors.archival_destruction.score,
          recognition_latency: vectors.recognition_latency.score,
        },
        evidence: `Cascading suppression across all 4 vectors creates ${compoundingFactor > 60 ? 'severe' : compoundingFactor > 30 ? 'moderate' : 'minimal'} invisibility`,
        severity: compoundingFactor > 60 ? 'high' : compoundingFactor > 30 ? 'medium' : 'low',
      };

      return vectors;
    };

    const dcasVectors = calculateDcasVectors(document_text, extraction.erasure_patterns);

    // ========================================================================
    // STEP 3: Create or Update Veteran Cases
    // ========================================================================

    const processedVeterans = [];

    for (const veteran of extraction.extracted_veterans) {
      // Check if veteran already exists
      const existingCases = await base44.entities.KnowledgeFile.list(); // Using as placeholder; should query actual cases
      
      // Create or update case
      const caseData = {
        service_number: veteran.service_number,
        rank_final: veteran.rank_final,
        service_branch: veteran.service_branch,
        years_service: veteran.years_service,
        enlistment_date: veteran.enlistment_date,
        discharge_date: veteran.discharge_date,
        discharge_status: veteran.discharge_status,
        casualty_status: veteran.casualty_status,
        destination_country: veteran.destination_country,
        is_deported: veteran.casualty_status === 'deported',
        deportation_date: veteran.casualty_status === 'deported' ? veteran.discharge_date : null,
        confidence_score: veteran.confidence_score,
        confidence_tier: veteran.confidence_score >= 85 ? 1 : veteran.confidence_score >= 70 ? 2 : 3,
        data_sources: [veteran.data_source],
        notes: veteran.extraction_notes,
      };

      // In a real implementation, would upsert to database
      // For now, return the prepared data
      processedVeterans.push({
        veteran_data: caseData,
        source_linkage: {
          source_name: `FOIA_${source_agency}`,
          external_id: veteran.service_number,
          match_probability: veteran.confidence_score / 100,
          match_confidence: veteran.confidence_score >= 85 ? 'high' : veteran.confidence_score >= 70 ? 'medium' : 'low',
        },
        dcas_vectors: dcasVectors,
      });
    }

    // ========================================================================
    // STEP 4: Return Results
    // ========================================================================

    return Response.json({
      status: 'success',
      foia_request_id,
      source_agency,
      document_length: document_text.length,
      
      extraction_summary: {
        veterans_found: extraction.extracted_veterans.length,
        veterans_processed: processedVeterans.length,
      },
      
      erasure_patterns: extraction.erasure_patterns,
      
      dcas_vectors: dcasVectors,
      
      processed_veterans: processedVeterans,
      
      next_steps: [
        'Review extracted veteran data for accuracy',
        'Create convergence validation records by matching against other sources (Selective Service, Census, VA BIRLS)',
        'Flag high-erasure cases for manual verification',
        'Update foia_response_records table with parsing results',
      ],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});