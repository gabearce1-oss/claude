// Query playbook from the TruthEngine360 MVP plan — exact strings the user can paste into each source.

export const queryPlaybook = [
  {
    source: 'AGN',
    note: 'Website search or staff-mediated requests. Portal sometimes returns 403 — treat as manual.',
    queries: [
      '"Terminel" OR "Terminal"',
      '"Sagasta" AND Sonora',
      '"Avina Sagasta" OR "Abina Sagasta"',
      '"San Javier" AND escritura',
      '"San Javier" AND notario',
      '"San Javier" AND propiedad',
      '"Francisco Terminel" AND mina',
      '"Terminel" AND juicio',
      '"Yaqui" AND "San Javier"',
      '"Mayo" AND Sonora AND familia',
    ],
  },
  {
    source: 'HNDM',
    note: 'Hemeroteca Nacional Digital de México · free, supports basic + advanced + timeline.',
    queries: [
      'Terminel',
      'Sagasta',
      '"Avina Sagasta"',
      '"San Javier" AND Sonora',
      '"Francisco Terminel"',
      'escritura AND "San Javier"',
      'demanda AND Terminel',
      '"Yaqui" AND "San Javier"',
      'Wells Fargo AND Nogales',
    ],
  },
  {
    source: 'Chronicling America',
    note: 'LoC · public API, no key required. OCR text + IIIF imagery.',
    queries: [
      'Terminel',
      'Sagasta',
      '"San Javier" Sonora',
      '"Wells Fargo" Nogales',
      '"Yaqui" Sonora',
      '"mining claim" Sonora',
      '"property title" Sonora',
    ],
  },
  {
    source: 'FamilySearch',
    note: 'Free API with approved keys; website usable immediately.',
    queries: [
      'Terminel Sonora Mexico',
      'Sagasta Sonora Mexico',
      'Avina Sagasta Sonora',
      'San Javier Sonora deed',
      'San Javier Sonora notary',
      'Francisco Terminel Sonora',
      'Yaqui Sonora historical records',
      'Mayo Sonora family records',
    ],
  },
  {
    source: 'UNISON',
    note: 'Open-access institutional repository — Sonora-focused theses and publications.',
    queries: [
      'Terminel', 'Sagasta', 'San Javier', 'Yaqui Sonora',
      'Mayo Sonora', 'Sahuaripa', 'propiedad Sonora', 'notariado Sonora',
    ],
  },
  {
    source: 'COLSON',
    note: 'Regional history / frontera expertise · open-access theses & tesinas.',
    queries: [
      'Terminel', 'Sagasta', 'San Javier', 'Yaqui',
      'frontera Sonora', 'historia regional Sonora',
      'tesina Sonora propiedad', 'testamentos Sonora',
    ],
  },
  {
    source: 'Bancroft',
    note: 'Western Americana, Latin Americana, oral history. OAC + Aeon requests.',
    queries: [
      'Terminel', 'Sagasta', 'San Javier', 'Sonora mining',
      'Nogales borderlands', 'Yaqui oral history',
      'Mexican borderlands property',
    ],
  },
  {
    source: 'U Arizona Special Collections',
    note: 'Borderlands, Arizona/Southwest, oral history. ArchivesSpace finding aids.',
    queries: [
      'Terminel', 'Sagasta', 'San Javier', 'Sonora borderlands',
      'Yaqui', 'Nogales', 'Arizona and Southwest', 'oral history Sonora',
    ],
  },
  {
    source: 'Wells Fargo Archives',
    note: 'No open API. Formal corporate-inquiry workflow.',
    queries: [
      'Wells Fargo Express Nogales Sonora',
      'Wells Fargo archives Sonora',
      'Wells Fargo San Javier',
      'Wells Fargo transfer Mexico',
      'Wells Fargo corporate archives historical inquiry',
    ],
  },
];