// Sahuaripa & Civil Registration catalog browse targets.
// Each entry is a single FamilySearch film/segment in the corrected browse order.
// match_keywords are matched (case-insensitive) against Evidence.title,
// notes, collection_name, call_number, source, and tags to detect "linked" status.

export const CATALOGS = [
  {
    key: 'sahuaripa',
    label: 'Sahuaripa Parish (Film 704681)',
    description: 'Catholic parish records — baptisms, marriages, deaths',
    color: '#7a5c3a',
  },
  {
    key: 'civil',
    label: 'Civil Registration (Film 704679)',
    description: 'Registro Civil — nacimientos, matrimonios, defunciones',
    color: '#3a5c7a',
  },
];

export const CATALOG_ITEMS = [
  {
    id: '704681-bap-1880-1915',
    catalog: 'sahuaripa',
    priority: 1,
    film: '704681',
    record_type: 'Baptisms',
    date_range: '1880–1915',
    rationale: "Highest yield — Nela's linkage + indigenous (opata) notation",
    match_keywords: ['704681', 'baptism', 'bautismo', 'sahuaripa'],
    date_filter: { start: '1880-01-01', end: '1915-12-31' },
  },
  {
    id: '704679-nac-1900-1915',
    catalog: 'civil',
    priority: 2,
    film: '704679',
    record_type: 'Nacimientos',
    date_range: '1900–1915',
    rationale: 'Civil births overlapping Nela / sibling cohort',
    match_keywords: ['704679', 'nacimiento', 'birth', 'civil'],
    date_filter: { start: '1900-01-01', end: '1915-12-31' },
  },
  {
    id: '704679-mat-1895-1915',
    catalog: 'civil',
    priority: 3,
    film: '704679',
    record_type: 'Matrimonios',
    date_range: '1895–1915',
    rationale: 'Marriages bracketing the Terminel–Sagasta union',
    match_keywords: ['704679', 'matrimonio', 'marriage'],
    date_filter: { start: '1895-01-01', end: '1915-12-31' },
  },
  {
    id: '704681-bap-1860-1880',
    catalog: 'sahuaripa',
    priority: 4,
    film: '704681',
    record_type: 'Baptisms',
    date_range: '1860–1880',
    rationale: 'Parent generation — Opata / india opata flags',
    match_keywords: ['704681', 'baptism', 'bautismo', 'sahuaripa'],
    date_filter: { start: '1860-01-01', end: '1880-12-31' },
  },
  {
    id: '704679-def-1930-1945',
    catalog: 'civil',
    priority: 5,
    film: '704679',
    record_type: 'Defunciones',
    date_range: '1930–1945',
    rationale: 'Death records — closure dates for first-gen subjects',
    match_keywords: ['704679', 'defuncion', 'death'],
    date_filter: { start: '1930-01-01', end: '1945-12-31' },
  },
];