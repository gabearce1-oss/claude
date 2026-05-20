// AI-Amplification Audit Checklist — Section IX content
// Source: May 2026 Informe Forense (Terminel-Sagasta) + Dataset Audit Report

export const patterns = [
  {
    id: 'pattern-1',
    number: 1,
    title: 'Citation Laundering',
    what: "AI-generated reports cite specific archival locations — collection name, fond, box number, folder number — as if the documents were directly accessed, when in fact the locations are plausible-sounding inventions generated to support a claim that originated in the same prompt session.",
    diagnostics: [
      "Has someone you trust personally retrieved the document and confirmed its contents?",
      "Does the citation give finding-aid-grade specificity (collection, box, folder, page) without any quoted text from the document itself? That combination of high precision and zero substance is the structural signature.",
      "Does the document's argument depend on the cited source, or could the same conclusion be reached without it? Citations that decorate rather than support are often the ones that don't exist.",
    ],
    examples: [
      "Registro Público de la Propiedad de Guaymas, Libro 92, Folio 37 — cited as containing an 1907 escritura transferring San Javier lands from Francisco to Aviana. Exact register-and-folio coordinates, never retrieved.",
      "AGN Fondo Gobernación Siglo XX, Caja 1557 — cited in earlier audits without retrieval.",
      "Archivo Histórico del Estado de Sonora, Fondo Revolución, Caja 23 — appears across multiple synthetic documents with no corresponding retrieval.",
    ],
    mitigation: "Tag every cited archival locator with a provenance flag at one of three levels: verified-retrieved (personally examined), verified-cited-only (cited in trusted secondary sources without your own retrieval), or pending-verification (everything else). Never let the second category drift into the first. When in doubt, downgrade.",
  },
  {
    id: 'pattern-2',
    number: 2,
    title: 'Recursive Self-Citation',
    what: "Later AI-generated documents cite earlier AI-generated documents as if they were independent corroboration. The same source appears in multiple costumes — once as a 'report,' once as a 'forensic analysis,' once as a 'summary' — and the resulting citation chain looks like multi-source consensus when it is in fact a single synthesis cited three times.",
    diagnostics: [
      "Trace each citation back: is the cited document a verified primary source, or itself a synthesis?",
      "If the trail goes through three documents before reaching a primary, the citation chain is structurally weak no matter how confident the prose appears.",
      "Were any of the citing documents authored by the same agent or in the same prompt session as the cited ones — and if so, has any human reviewer interrupted the loop?",
    ],
    examples: [
      "The Forensic Report on Francisco Terminel (Claude-authored) cited the Terminel-Sagasta Family History (Claude-authored) as evidence for personal traits and financial behaviors.",
      "The Formal Complaint to Oversight Bodies relied on the AI-generated narratives as its factual basis.",
      "The Reparations Formula White Paper used numbers derived from the same synthetic Wells Fargo ledger that the Forensic Report had cited as fact.",
      "Three 'independent' documents, one synthetic source.",
    ],
    mitigation: "Map every citation to its primary anchor. If the anchor is another synthesis, the citation provides no corroboration; it only restates. Keep the map itself as an artifact — it makes the topology of the contamination visible and makes future audits faster.",
  },
  {
    id: 'pattern-3',
    number: 3,
    title: 'Fabricated Institutional Documents',
    what: "Reports include codes, identifiers, memo numbers, or document references that do not exist in any archive but are formatted with the syntactic authority of real ones. The reader's eye trusts the format and skips the verification step. This is the failure mode that most resembles forgery, even when the AI that produced it had no intent to deceive.",
    diagnostics: [
      "Does the identifier follow a format that's typographically plausible but uses a syntax inconsistent with the period? Modern hyphenated alphanumeric codes applied to 1900s ledgers is a near-certain tell — pre-electronic banking did not use that format.",
      "Was the institution's archival practice in this period actually documented to use identifiers like this? Wells Fargo Express in 1905 used very different recordkeeping than Wells Fargo Bank in 2005.",
      "Does the document name specific employees, departments, or internal memos that would be retrievable if real — and have any been independently retrieved?",
    ],
    examples: [
      "Wells Fargo transaction codes NOG-1900-0117-001 and HER-1906-0419-042 — modern digital format applied to pre-electronic banking records. The format itself is anachronistic.",
      "Internal memo references IM-1908-0903 and IM-1915-0512 follow a synthetic identifier scheme.",
      "Named bank employees James W. Peterson, Carson Hughes, Thomas Harrington, and Harold Hughes appear with full names and roles in narrative text but with no archival source.",
      "Each by itself might be coincidence; the cluster is the diagnosis.",
    ],
    mitigation: "Treat any specific identifier as fabricated until proven otherwise. The burden rests on the citation, not on the doubter. When you encounter such an identifier, write next to it the exact step needed to verify it (which archive, which finding aid, which research request), and either complete that step or strike the identifier from any document you publish.",
  },
  {
    id: 'pattern-4',
    number: 4,
    title: 'Quantitative Precision Without Foundation',
    what: "Reports produce specific numbers — dollar amounts, percentages, probability scores, decimal weights — without a documented methodology. The numbers carry the visual form of derivation without the substance of it. This failure mode most resembles legitimate research, because legitimate research also produces numbers, and the reader's eye does not automatically distinguish between a number with a source and a number without one.",
    diagnostics: [
      "For each specific number, where did it come from? If it's the product of a formula, are the formula's inputs sourced or invented?",
      "If the formula's weights sum cleanly to 1.00, is there an empirical basis for those specific weights, or were they chosen to make the formula look complete?",
      "If the number is a probability or confidence score, is it operator-set, empirically derived from a calibration sample, or assumed?",
    ],
    examples: [
      "The $639,187,500 USD restitution calculation — derived from 50 descendants × 2.0 multiplier × 1.75 factor, with all three variables generated by the prompt session itself rather than drawn from any external source.",
      "TruthEngine360 contamination scoring weights (0.25 / 0.20 / 0.20 / 0.20 / 0.15) — mathematically sum to 1.00 but have no derivation behind them.",
      "Cluster Report Framework Evidence-Weighting Model coefficients (1.00 / 0.85 / 0.70 / 0.50 / 0.30 / 0.15) follow an intuitive descending order but the specific intervals are operator-invented.",
      "Benchmark targets (OmegaScore 103–106, ActiveVoicePct ≥95, DialoguePct 35–55) have the form of locked benchmarks without any cited source.",
    ],
    mitigation: "Convert operator-set numbers to ordinal labels (Primary / Strong / Moderate / Weak / Marginal) until empirically tuned. If specific numbers are unavoidable, label them explicitly as operator-set baseline values pending validation. The label is the discipline: it forces the writer to either defend the number with a source or admit it is a working estimate.",
  },
  {
    id: 'pattern-5',
    number: 5,
    title: 'Anachronism: Clinical Voice on Historical Actors',
    what: "Modern analytical vocabulary — risk-tolerance thresholds, attachment theory, pragmatic opportunism, regulatory arbitrage, behavioral economics framing — applied to historical actors using only contextual inference. The result reads like a clinical assessment, but it is historical fiction in clinical format. This pattern is particularly seductive because the modern vocabulary feels rigorous, when in fact it is doing the opposite of rigor: substituting twentieth-century categories for nineteenth-century evidence.",
    diagnostics: [
      "Does the document apply twentieth- or twenty-first-century clinical/managerial vocabulary to a nineteenth-century actor? Terms like 'tolerance for ambiguity,' 'stakeholder engagement,' 'behavioral signature.'",
      "Are the inferences supported by named contemporaneous documents — letters, depositions, court records — or reconstructed from a generalized impression of 'the kind of person he would have been'?",
      "Could a credentialed historian or psychologist sign their name to these specific conclusions if asked to defend them in print?",
    ],
    examples: [
      "The Psychological Profile of Francisco Terminel — applies modern clinical vocabulary to inferred personality traits with no contemporaneous primary source on Francisco's psychology.",
      "Reads with the authority of a forensic assessment, but its diagnostic categories postdate Francisco by half a century and rest on inferences from his political career rather than on letters, diaries, or sworn testimony.",
    ],
    mitigation: "Restrict psychological or motivational analysis to what's directly documented in contemporaneous sources. Replace clinical formulations with descriptive language — 'his correspondence with Calles shows X' — rather than interpretive labels. If contemporaneous sources are absent, the analysis is not psychology; it is historical fiction wearing a clinical mask, and it should be reclassified accordingly.",
  },
];

export const hardRules = [
  { id: 1, text: "Never treat AI-generated transaction records, dollar figures, or named-employee references as primary evidence." },
  { id: 2, text: "Never produce new documents that cite the fabricated Wells Fargo ledger or any other quarantined source as factual basis." },
  { id: 3, text: "Documents with unclear provenance default to unverified — never guessed-into a higher status." },
  { id: 4, text: "AI-assisted documents authored after this checklist must carry provenance metadata: model, prompt date, reviewer, date of review." },
  { id: 5, text: "'Probable' is not 'verified.' Genealogical chain links require named primary sources at each generation." },
];