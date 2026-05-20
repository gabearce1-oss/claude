// Claim-testing checklist for a single piece of evidence.
// Six checks derived from the TruthEngine360 + Informe Forense methodology.

export const checklistItems = [
  {
    id: 'provenance',
    question: 'Is the provenance documented end-to-end?',
    guidance: 'Original source, custodian, and acquisition path should all be traceable. No "found in family files" gaps.',
  },
  {
    id: 'primary_source',
    question: 'Is this a primary source (or a derivative)?',
    guidance: 'Pass = original document or certified copy. Concern = transcription or secondary citation. Fail = unsourced summary.',
  },
  {
    id: 'archive_locator',
    question: 'Does it carry a specific archive locator?',
    guidance: 'Archive name, collection, box/folder, or call number. Generic "Mexican archives" is a fail.',
  },
  {
    id: 'date_consistency',
    question: 'Is the date internally consistent?',
    guidance: 'Record date, language, materials, and persons mentioned should all fit the stated era. Anachronisms = fail.',
  },
  {
    id: 'corroboration',
    question: 'Is the central claim corroborated by another independent source?',
    guidance: 'Two sources from the same author or AI session do not count. Independent = different archive, different witness.',
  },
  {
    id: 'ai_signatures',
    question: 'Free of AI-generated synthesis signatures?',
    guidance: 'Watch for: too-perfect round numbers, fabricated archive codes, circular citations, modern bureaucratic phrasing in old records.',
  },
];