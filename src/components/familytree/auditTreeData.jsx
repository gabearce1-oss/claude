// Audit-disciplined six-generation Terminel–Sagasta tree
// Derived from May 2026 Informe Forense + Dataset Audit Report
// Each person carries an evidentiary status; each generation has a displacement timeline.

export const STATUS_COLORS = {
  verified:   '#4a5d3a',
  memory:     '#8a6e3c',
  hypothesis: '#5a6b7a',
  fabricated: '#6b1f1f',
  living:     '#2a4a3a',
};

export const STATUS_LABELS = {
  verified:   'Verified',
  memory:     'Family Memory',
  hypothesis: 'Hypothesis',
  fabricated: 'Unsupported',
  living:     'Living',
};

export const STATUS_DESCRIPTIONS = [
  { key: 'verified',   text: 'Independently documented in primary or peer-reviewed source' },
  { key: 'memory',     text: 'Oral tradition; not yet verified in archive' },
  { key: 'hypothesis', text: 'Historically plausible; archival check pending' },
  { key: 'fabricated', text: 'Conflicts with evidence or shows fabrication signatures' },
  { key: 'living',     text: 'Present generation, directly verifiable' },
];

export const EVENT_COLORS = {
  displacement: '#6b1f1f',
  political:    '#4a5a6b',
  francisco:    '#5a4d3a',
  family:       '#7a5d3a',
  justice:      '#4a5d3a',
};

export const EVENT_LABELS = [
  { key: 'displacement', text: 'Indigenous dispossession — laws, campaigns, deportations, massacres' },
  { key: 'political',    text: 'Sonoran / federal political — Porfiriato, Revolution, Cárdenas era' },
  { key: 'francisco',    text: "Francisco-specific — verified events in Francisco's career and exile" },
  { key: 'family',       text: 'Family-specific — verified family births, migrations, deaths' },
  { key: 'justice',      text: 'Restitution — recent legal and political recognitions' },
];

export const generations = [
  {
    roman: 'I.',
    era: '~1830s–1850s',
    label: 'Pre-Bridge Generation',
    unknownPanel: {
      title: 'Pending Archival Discovery',
      body: 'The earlier family tree placed a "Chieftain Yaqui (Río Pascal Tribo)" ancestor here. Río Pascal is not a documented Sonoran river — the historical rivers are the Río Yaqui, Río Mayo, Río Sonora, Río Bavispe, Río Aros, and Río Moctezuma — and the chieftain narrative does not appear in any primary source. The May 2026 Informe Forense assesses Aviana\'s likely affiliation as Opata/Jova (50–65%) rather than Yaqui (20–35%) on geographic grounds. Generation 1 should be reconstructed from the FamilySearch tree branching back from María Guadalupe Terminel (b. 1845, Álamos) and from parish records of San Javier and Sahuaripa — both actionable archival paths, not yet completed.',
    },
    members: [],
    milestonesTitle: 'Era Context',
    milestones: [
      { year: '1845', cat: 'political',    label: 'Verified anchor',     desc: 'María Guadalupe Terminel born in Álamos, Sonora — daughter of José Santos Terminel Félix and Francisca Amarillas. FamilySearch genealogical record.' },
      { year: '1864', cat: 'francisco',    label: 'Mowry mining report', desc: 'Don José Santos Terminel documented as owner of "Los Cedros" estate in the Baroyeca-Tesopaco district. Sylvester Mowry U.S. mineral survey.' },
      { year: '1868', cat: 'displacement', label: 'Cócorit massacre',    desc: 'Mexican soldiers burn a church in Cócorit with ~150 Yaqui civilians inside. Spicer 1980; Hu-DeHart 1981.' },
    ],
  },
  {
    roman: 'II.',
    era: '~1860s–1900',
    label: 'Bridge Generation',
    members: [
      {
        name: 'Aviana (Avina) Sagasta',
        dates: 'c. 1878 — c. 1932',
        status: 'hypothesis',
        note: 'Probable Indigenous descent — **Opata/Jova more likely than Yaqui** per May 2026 forensic synthesis, on geographic grounds (San Javier in Sahuaripa is historical Jova territory). Marriage to Francisco not verified in civil registration. 23andMe data in Generation 5 descendants confirms Indigenous American maternal ancestry (B2 haplogroup) but is not tribe-specific.',
        verify: 'Registro Civil de San Javier (1868–); Archivo Histórico de la Mitra de Hermosillo (parish books).',
      },
      {
        name: 'Francisco L. Terminel',
        dates: 'c. 1870s — after 1940',
        status: 'verified',
        note: 'Hacendado, federal deputy (1932–34), senator (1934), co-founder of the Banco Agrícola Sonorense (April 1933). Stripped of senate seat in December 1935 as one of five Calles-aligned senators. Exiled in San Diego 1935–1940; correspondence preserved in FAPECFT. **Family memory of his "death" reflects political/economic destruction, not biological — he survived to at least 1940.**',
        verify: 'Memoria Política · INEHRM · Tesis UV México · FAPECFT.',
      },
    ],
    milestonesTitle: 'What Generation 2 Lived Through',
    milestones: [
      { year: '1876',      cat: 'political',    label: 'Porfiriato begins',         desc: 'Porfirio Díaz takes power; Sonora becomes a target for foreign investment and aggressive Indigenous-land privatization.' },
      { year: '1894',      cat: 'displacement', label: 'Ley de Terrenos Baldíos',   desc: '"Empty lands" law enables mass privatization of Yaqui and Mayo communal territories — declared baldías regardless of actual occupation.' },
      { year: '1885–1919', cat: 'francisco',    label: 'San Javier mining boom',    desc: "San Javier reaches peak prosperity. Francisco's adult career coincides exactly with this window — positioning him as broker between foreign capital and the Sonoran political system." },
    ],
  },
  {
    roman: 'III.',
    era: '~1880s–1920s',
    label: 'Hermosillo Generation',
    members: [
      { name: 'Lourdes Terminel Sagasta',          dates: '— · dates unverified',           status: 'memory',   note: 'Listed in family tree as eldest. Civil registration not yet retrieved.', verify: 'Registro Civil de San Javier or Sahuaripa.' },
      { name: 'Francisco Terminel II Sagasta',     dates: '— · dates unverified',           status: 'memory',   note: 'Father of Bertha Carreón Terminel ("La Cuata"). Civil registration not yet retrieved.', verify: 'Registro Civil; Hemeroteca de Sonora for any press mentions.' },
      { name: 'Rosa Terminel Sagasta',             dates: '— · dates unverified',           status: 'memory',   note: 'Mother of Ruben, Teresa, and Peoples Terminel per family tree.', verify: 'Registro Civil; ecclesiastical books.' },
      { name: 'María Manuela "Nela" Terminel Sagasta', dates: 'b. 7 Aug 1910 · d. 2012, age 101', status: 'verified', note: 'Born in San Javier, Sonora. Died in Ontario, California — 101 years old. The descent-chain anchor for all California-side generations. Birth certificate should be in the Registro Civil de San Javier (records from 1868).', verify: 'AncientFaces genealogical record; California death record.' },
    ],
    milestonesTitle: 'What Generation 3 Lived Through',
    milestones: [
      { year: '1902–08',   cat: 'displacement', label: 'Mass Yaqui deportations',     desc: '8,000–15,000 Yaqui deported to Yucatán and Oaxaca under Governor Izábal. Many Yaqui adopt mestizo identities to avoid forced removal — the era\'s documented identity-suppression pattern.' },
      { year: '7 Aug 1910',cat: 'family',       label: 'Nela born',                   desc: 'María Manuela Terminel Sagasta born in San Javier — the verified ancestor through whom the California descent chain runs.' },
      { year: '1910–17',   cat: 'political',    label: 'Mexican Revolution',          desc: 'Civil war. Hacendado properties listed for redistribution under the 1917 Constitution. Generation 2 navigates this period with assets variously protected, lost, or transferred.' },
      { year: '1919',      cat: 'francisco',    label: 'Manuel Terminel y Sucesores', desc: 'Family agricultural company formally constituted, with Francisco as partner. Tesis UV México.' },
    ],
  },
  {
    roman: 'IV.',
    era: '~1910s–1950s',
    label: 'Border Crossing Generation',
    members: [
      { name: 'Delia Terminel',                                  dates: '— · American father (per family memory)', status: 'memory', note: 'Eldest of Nela\'s children per family tree. ~8 children, 24 grandchildren.' },
      { name: 'Amanda Terminel',                                 dates: '— · Chinese father (per family memory)',  status: 'memory', note: '~14 children, 33 grandchildren.' },
      { name: 'Raquel Terminel',                                 dates: '— · father León (per family memory)',     status: 'memory', note: '~8 children, 21 grandchildren.' },
      { name: 'Alba Terminel de Arce',                           dates: '— · father Roberto (per family memory)',  status: 'memory', note: "Mother of Gabriel Arce Terminel. Migration history and Los Angeles residence documented in the case file's CHNA-adjacent materials.", verify: 'U.S. civil records likely available; pending retrieval.' },
      { name: 'Irma Herrera',                                    dates: '— · dates unverified',                    status: 'memory', note: 'Listed in family tree.' },
      { name: 'Bertha Carreón Terminel ("La Cuata")',            dates: '— · daughter of Francisco II',            status: 'memory', note: 'Mother of Isaac, Marcos, and Frank Carreón.' },
      { name: 'Carmalita Miranda, Polo Targno Terminal, Menu Miranda', dates: "— · Lourdes's children",            status: 'memory', note: 'Three siblings; total ~8 children across them.' },
      { name: 'Ruben, Teresa, Peoples Terminel',                 dates: "— · Rosa's children",                     status: 'memory', note: 'Three siblings; multiple grandchildren.' },
    ],
    milestonesTitle: 'What Generation 4 Lived Through',
    milestones: [
      { year: '1928',     cat: 'francisco',    label: 'Francisco at Agriculture',  desc: 'Francisco serves as Oficial Mayor of the Secretaría de Agricultura — placing him at the center of federal irrigation projects that directly benefited his haciendas.' },
      { year: '1932–34',  cat: 'francisco',    label: 'Federal Deputy',            desc: 'Francisco serves as Diputado Federal for Sonora.' },
      { year: 'Apr 1933', cat: 'francisco',    label: 'Banco Agrícola Sonorense',  desc: 'Francisco and Waldo Morali obtain federal concession for the bank, headquartered in Ciudad Obregón.' },
      { year: 'Dec 1935', cat: 'francisco',    label: 'Desafuero',                 desc: 'Francisco stripped of senate seat by the Cárdenas government as one of five Calles-supporting senators. Begins exile in San Diego.' },
      { year: '1935–40',  cat: 'francisco',    label: 'San Diego exile',           desc: 'Correspondence with Calles preserved in FAPECFT. Francisco active through at least 1940 — contradicting the family memory of his death in this period.' },
      { year: '1937–40',  cat: 'political',    label: 'Yaqui restitution begins',  desc: 'President Cárdenas delimits Yaqui territorial zone; tentative restitution begins after decades of dispossession.' },
      { year: '1952',     cat: 'family',       label: 'Nela arrives in Los Angeles', desc: 'María Manuela Terminel Sagasta documented arriving in Los Angeles per NARA passenger lists (citation requires independent verification). The descent chain crosses the border.' },
    ],
  },
  {
    roman: 'V.',
    era: '~1930s–1970s',
    label: 'American Integration Generation',
    members: [
      { name: 'Gabriel Arce Terminel', dates: 'Living · b. ~1950s–60s', status: 'living', keeper: true, note: 'Designated family knowledge keeper. **23andMe verified:** B2 mitochondrial haplogroup (Indigenous American maternal lineage, not tribe-specific); 30.4% Indigenous American + 52.7% Iberian + 2.0% Italian autosomal. Biological father reported as Juan Ortega García; adoptive father Don Gabriel Arce.', verify: '23andMe records · personal genealogical compilation.' },
      { name: 'Humberto Arce Terminel', dates: '— · sibling', status: 'memory', note: "Listed as Gabriel's sibling." },
      { name: 'Aide Arce Terminel',     dates: '— · sibling', status: 'memory', note: "Listed as Gabriel's sibling." },
      { name: 'Isaac, Marcos, Frank Carreón', dates: "— · Bertha's sons", status: 'memory', note: 'Each with daughters — extends the lineage through Francisco II\'s line.' },
      { name: 'Gilberto and Duarte Terminel', dates: '— · doctorate level', status: 'memory', note: 'Higher-education branch of Generation 5 per family tree.' },
    ],
    milestonesTitle: 'What Generation 5 Lives Through',
    milestones: [
      { year: '2012', cat: 'family',  label: 'Nela passes',         desc: 'María Manuela Terminel Sagasta dies in Ontario, California, age 101. The last person who personally knew Aviana Sagasta is gone.' },
      { year: '2021', cat: 'justice', label: 'AMLO Yaqui apology',  desc: 'Mexican President Andrés Manuel López Obrador issues formal apology to the Yaqui Nation; launches the Plan de Justicia Yaqui — territorial restitution and rights recognition.' },
      { year: '2023', cat: 'justice', label: 'Tribu Yaqui v. México', desc: 'Friendly settlement at the IACHR (Petition 13.001) — official recognition of historical atrocities, land restitution, and community support obligations.' },
    ],
  },
  {
    roman: 'VI.',
    era: '~1960s–Present',
    label: 'Modern Generation',
    members: [
      { name: 'Joshua Gabriel Arce Moreno', dates: 'Living · b. ~2010s', status: 'living', keeper: true, note: 'Sixth-generation descendant. Designated family knowledge keeper alongside Gabriel. The lineage from Aviana Sagasta in c. 1878 Sonora reaches him in present-day California — six generations across one of the most disrupted periods in Sonoran history.' },
      { name: 'Generation 6 cohort',        dates: '~94+ individuals per family tree', status: 'memory', note: 'Most in their early twenties; many college graduates. Specific names not enumerated here pending individual verification.' },
    ],
    milestonesTitle: 'Present',
    milestones: [
      { year: '2026', cat: 'justice', label: 'Working File', desc: 'The audit framework is in place. The Informe Forense exists. The dashboard tracks evidence by status. The next moves are the archival ones that move "family memory" toward "verified" — Registro Civil de San Javier, Archivo de la Mitra de Hermosillo, AHES, FamilySearch parish records.' },
    ],
  },
];

export const auditObservations = [
  { tag: '01 · Honesty about G1',        desc: 'The chieftain narrative in Generation 1 ("La Bacha, Chieftain Yaqui, Rio Pascal Tribo") is not supported by archival evidence. Río Pascal is not a documented Sonoran river. The audit-disciplined version of this tree shows Generation 1 as unknown, with named archival paths forward rather than filling the space with invented detail. The next move there is FamilySearch\'s parental records branching back from María Guadalupe Terminel (b. 1845, Álamos).' },
  { tag: '02 · Opata/Jova hypothesis',   desc: 'The Informe Forense (May 2026) assesses Opata/Jova affiliation at 50–65% probability versus Yaqui at 20–35%, on geographic grounds (San Javier in Sahuaripa sits in historical Jova territory ~150–200 km from the Yaqui river valley). The 23andMe B2 haplogroup confirms Indigenous American maternal ancestry but is shared across most Sonoran Indigenous groups. This tree shows Aviana as Hypothesis, not as confirmed Yaqui, until parish records resolve it.' },
  { tag: "03 · Francisco's \"death\"",   desc: 'Family memory says Francisco died in the 1930s and the family was exiled in poverty. The FAPECFT archive shows him alive and corresponding with Calles from San Diego through at least 1940. The "death" was political and economic, not biological. This reframing isn\'t a contradiction of the family story — it\'s a sharpening of what the story was actually describing.' },
  { tag: '04 · Generations 3–4 unverified', desc: 'Most individuals shown in Generations 3 and 4 (Lourdes, Francisco II, Rosa, their children, the various sons and daughters of Nela) carry the Family Memory badge. They are not disputed — they are not yet retrieved from the civil registration or parish records that would document them. The Registro Civil de San Javier holds records from 1868 forward; this is the highest-value next archival visit for the lineage itself.' },
  { tag: '05 · What this complements',   desc: 'This file is the lineage view of the case. The audit dashboard is the evidence view. The Informe Forense is the synthesis view. None of them substitutes for the others — they show the same case from three angles, and each angle catches what the other two miss.' },
];