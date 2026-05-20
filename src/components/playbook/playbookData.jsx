// TruthEngine360 Research Playbook — ready-to-paste queries per source.
// Each source has a search_url_builder that takes a query string and returns
// a direct link into that archive's search interface where available.

export const playbookSources = [
  {
    id: 'hndm',
    name: 'HNDM',
    full_name: 'Hemeroteca Nacional Digital de México',
    priority: 'P1',
    type: 'newspaper',
    language: 'es',
    auth: 'free / no key',
    description:
      'Highest-priority Spanish-language press source for Sonora. Free, supports phrase, boolean, and timeline queries.',
    search_url: (q) =>
      `https://www.hndm.unam.mx/index.php/es/consulta/publicaciones?term=${encodeURIComponent(q)}`,
    groups: [
      {
        label: 'Names and variants',
        queries: [
          '"Francisco Terminel"',
          'Terminel AND Sonora',
          '"F. L. Terminel"',
          '"Avina Sagasta"',
          '"Aviana Sagasta"',
          'Sagasta AND Sonora',
        ],
      },
      {
        label: 'Places + property / mining',
        queries: [
          '"San Javier" AND Sonora AND mina',
          '"San Javier" AND escritura',
          '"San Javier" AND propiedad',
          '"San Javier" AND notario',
          '"Sahuaripa" AND mina',
          '"Tesopaco" AND hacienda',
        ],
      },
      {
        label: 'Yaqui / Mayo and land',
        queries: [
          'Yaqui AND "San Javier"',
          'Yaqui AND Sonora AND hacienda',
          'Yaqui AND "despojo de tierras"',
          'Mayo AND Sonora AND hacienda',
        ],
      },
      {
        label: 'Banks and politics',
        queries: [
          '"Banco Agrícola Sonorense"',
          '"Banco Mercantil y Agrícola de Sonora"',
          'Terminel AND banco',
          'Terminel AND diputado',
          'Terminel AND senador',
        ],
      },
      {
        label: 'Legal notices / decrees',
        queries: [
          '"Francisco Terminel" AND edicto',
          '"Francisco Terminel" AND "Boletín Oficial"',
          '"San Javier" AND "Boletín Oficial"',
        ],
      },
    ],
  },
  {
    id: 'loc',
    name: 'Chronicling America',
    full_name: 'Library of Congress · Chronicling America',
    priority: 'P1',
    type: 'newspaper',
    language: 'en',
    auth: 'public API, no key',
    description: 'U.S. press coverage. OCR text + IIIF imagery, fully scriptable.',
    search_url: (q) =>
      `https://chroniclingamerica.loc.gov/search/pages/results/?proxtext=${encodeURIComponent(q)}`,
    groups: [
      {
        label: 'Names and case',
        queries: [
          '"Francisco Terminel"',
          'Terminel AND Mexico',
          '"San Javier" AND Sonora',
          'Yaqui AND Sonora',
          '"Banco Agrícola Sonorense"',
        ],
      },
    ],
  },
  {
    id: 'familysearch',
    name: 'FamilySearch',
    full_name: 'FamilySearch · civil + church records',
    priority: 'P1',
    type: 'genealogy',
    language: 'es/en',
    auth: 'free; API requires key',
    description:
      'Civil registry, parish, baptism, marriage, and death records. Sonora 1860–1940 is the primary window.',
    search_url: (q) =>
      `https://www.familysearch.org/search/record/results?q.givenName=&q.surname=&q.anyPlace=Sonora&q.anyName=${encodeURIComponent(q)}`,
    groups: [
      {
        label: 'Surnames & places',
        queries: [
          'Terminel Sonora',
          'Sagasta Sonora',
          'Avina Sagasta',
          'Aviana Sagasta',
          'Manuela Terminel',
          'Francisco L Terminel',
          'San Javier Sonora',
          'Sahuaripa Sonora',
          'Tesopaco Sonora',
        ],
      },
    ],
  },
  {
    id: 'unison',
    name: 'UNISON',
    full_name: 'Universidad de Sonora · Repositorio Institucional',
    priority: 'P2',
    type: 'academic',
    language: 'es',
    auth: 'open access',
    description: 'Sonora-focused theses and articles.',
    search_url: (q) =>
      `https://repositorioinstitucional.unison.mx/simple-search?query=${encodeURIComponent(q)}`,
    groups: [
      {
        label: 'Core terms',
        queries: [
          'Terminel',
          'Sagasta',
          'San Javier',
          'Yaqui',
          'Mayo',
          '"Banco Agrícola Sonorense"',
          'Sahuaripa',
        ],
      },
    ],
  },
  {
    id: 'colson',
    name: 'COLSON',
    full_name: 'El Colegio de Sonora · Repositorio',
    priority: 'P2',
    type: 'academic',
    language: 'es',
    auth: 'open access',
    description: 'Regional history and borderlands scholarship.',
    search_url: (q) =>
      `https://www.google.com/search?q=site%3Acolson.edu.mx+${encodeURIComponent(q)}`,
    groups: [
      {
        label: 'Core terms',
        queries: [
          'Terminel',
          'Sagasta',
          'San Javier',
          '"despojo yaqui"',
          '"Porfirio Díaz" Sonora',
          'frontera Sonora',
        ],
      },
    ],
  },
  {
    id: 'bancroft',
    name: 'Bancroft',
    full_name: 'UC Berkeley · Bancroft Library',
    priority: 'P2',
    type: 'archive',
    language: 'en/es',
    auth: 'finding aids open; reading via Aeon',
    description: 'Western & Latin Americana, Native collections, oral history.',
    search_url: (q) =>
      `https://oac.cdlib.org/search?query=${encodeURIComponent(q)}&style=oac4&institution=UC%20Berkeley%3A%3ABancroft%20Library`,
    groups: [
      {
        label: 'Finding-aid terms',
        queries: [
          'Terminel',
          '"San Javier" Sonora',
          'Yaqui mines',
          'Sonora mines',
          'Mexican borderlands property',
        ],
      },
    ],
  },
  {
    id: 'uaz',
    name: 'U Arizona Special Collections',
    full_name: 'University of Arizona · Special Collections',
    priority: 'P2',
    type: 'archive',
    language: 'en',
    auth: 'finding aids open',
    description: 'Borderlands, Yaqui history, oral histories.',
    search_url: (q) =>
      `https://www.google.com/search?q=site%3Aspeccoll.library.arizona.edu+${encodeURIComponent(q)}`,
    groups: [
      {
        label: 'Core terms',
        queries: [
          'Yaqui',
          '"Francisco Terminel"',
          '"San Javier"',
          '"Banco Agrícola"',
          'Nogales border',
        ],
      },
    ],
  },
  {
    id: 'nara',
    name: 'NARA',
    full_name: 'U.S. National Archives Catalog',
    priority: 'P2',
    type: 'archive',
    language: 'en',
    auth: 'free catalog',
    description: 'Consular, customs, military, and court traces from the U.S. side.',
    search_url: (q) =>
      `https://catalog.archives.gov/search?q=${encodeURIComponent(q)}`,
    groups: [
      {
        label: 'Consular / border',
        queries: [
          '"Terminel" AND "Sonora"',
          '"Sagasta" AND "Sonora"',
          '"San Xavier" OR "San Javier" AND "mine"',
          '"Yaqui" AND "Sonora" AND "consul"',
        ],
      },
    ],
  },
  {
    id: 'agn',
    name: 'AGN',
    full_name: 'Archivo General de la Nación (México)',
    priority: 'P3',
    type: 'archive',
    language: 'es',
    auth: 'manual / staff-mediated',
    description: 'Portal not API-friendly. Track inquiries as archive_requests.',
    search_url: (q) => `https://www.google.com/search?q=site%3Aagn.gob.mx+${encodeURIComponent(q)}`,
    groups: [
      {
        label: 'Mandatory manual targets',
        queries: [
          'Terminel',
          '"Francisco Terminel"',
          '"San Javier" escritura',
          '"San Javier" juicio',
          '"San Javier" propiedad',
          '"Tribu Yaqui" Sonora',
        ],
      },
    ],
  },
  {
    id: 'ahes',
    name: 'AHES',
    full_name: 'Archivo Histórico del Estado de Sonora',
    priority: 'P3',
    type: 'archive',
    language: 'es',
    auth: 'manual',
    description:
      'Registro Público de la Propiedad and Notarías for San Javier / Sahuaripa.',
    search_url: (q) => `https://www.google.com/search?q=site%3Aahes.gob.mx+${encodeURIComponent(q)}`,
    groups: [
      {
        label: 'Property & notary',
        queries: [
          '"Terminel" OR "Terminal"',
          '"Sagasta" AND Sonora',
          '"Avina Sagasta" OR "Abina Sagasta"',
          '"San Javier" AND escritura',
          '"San Javier" AND notario',
          '"San Javier" AND propiedad',
          '"Terminel" AND mina',
          '"Terminel" AND juicio',
          '"Yaqui" AND "San Javier"',
        ],
      },
    ],
  },
  {
    id: 'wellsfargo',
    name: 'Wells Fargo Archives',
    full_name: 'Wells Fargo Corporate Archives',
    priority: 'P3',
    type: 'corporate',
    language: 'en',
    auth: 'formal inquiry only',
    description: 'No open API. Submit formal corporate-inquiry request and track as archive_request.',
    search_url: (q) =>
      `https://www.google.com/search?q=%22Wells+Fargo%22+archives+${encodeURIComponent(q)}`,
    groups: [
      {
        label: 'Inquiry framings',
        queries: [
          'Wells Fargo Express Nogales Sonora',
          'Wells Fargo archives Sonora',
          'Wells Fargo transfer Mexico 1900–1940',
          'Wells Fargo corporate archives historical inquiry',
        ],
      },
    ],
  },

  // ─── HUNTINGTON LIBRARY (added May 20 2026) ───
  {
    id: 'huntington',
    name: 'Huntington Library',
    full_name: 'Huntington Library, San Marino CA — WF Box 34 "Investments in Mexico"',
    priority: 'P1',
    type: 'archive',
    language: 'en',
    auth: 'Free by appointment — (626) 405-2191 · reference@huntington.org',
    description:
      'PRIMARY Wells Fargo historical records (NOT WF Museum SF). 42 linear feet, 35 boxes, 1839–1911. Box 34 Series 2 = "Investments in Mexico" 1883–1906. Hosmer B. Parsons correspondence re: express operations including Southern Pacific routes through Sonora. Driving distance from Gabriel.',
    search_url: (_q) => 'https://catalog.huntington.org/',
    groups: [
      {
        label: 'Box 34 — Investments in Mexico',
        queries: [
          'Request: Box 34, Series 2 "Investments in Mexico" 1883–1906',
          'Hosmer B. Parsons correspondence — express operations Sonora',
          'Southern Pacific route express / bullion manifests Arizona–Sonora',
          'Search consignors: Terminel, Verminel, Porchas, Sagasta',
        ],
      },
      {
        label: 'Villa silver bars — April 1913',
        queries: [
          'Villa AND "silver bars" AND 1913',
          '"Wells Fargo" AND "Mexican subsidiary" AND 1913',
          '"Wells Fargo y Cia" AND Sonora',
        ],
      },
    ],
  },

];