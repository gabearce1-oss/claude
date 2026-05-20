// Terminel-Sagasta Family Tree — structured from user-provided genealogy
// Trust: family oral history (TIER B per audit). Not independently verified.

export const familyTree = [
  {
    gen: 1,
    title: 'The Ancestors',
    era: '1830s–1850s',
    education: 'Traditional tribal knowledge',
    people: [
      { id: 'la-bacha', name: 'La Bacha', meta: 'Rio Pascal Tribo', partnerOf: 'chieftain-yaqui' },
      { id: 'chieftain-yaqui', name: 'Chieftain Yaqui', meta: 'Rio Pascal Tribo' },
    ],
  },
  {
    gen: 2,
    title: 'The Bridge Generation',
    era: '1860s–1900',
    education: 'No formal education',
    people: [
      { id: 'aviana-sagasta', name: 'Aviana Sagasta', meta: 'Half Yaqui · father unknown', partnerOf: 'francisco-terminel' },
      { id: 'francisco-terminel', name: 'Francisco Terminel', meta: 'Sonoran landowner / Senator (1934)' },
    ],
  },
  {
    gen: 3,
    title: 'Hermosillo Generation',
    era: '1880s–1920s',
    education: 'No formal education',
    people: [
      { id: 'lourdes', name: 'Lourdes Terminel Sagasta', meta: '' },
      { id: 'francisco-ii', name: 'Francisco Terminel II Sagasta', meta: '' },
      { id: 'rosa', name: 'Rosa Terminel Sagasta', meta: '' },
      { id: 'nela', name: 'María Manuela "Nela" Terminel Sagasta', meta: 'b. 1910 San Javier · d. 2012 Ontario, CA' },
    ],
  },
  {
    gen: 4,
    title: 'Border Crossing Generation',
    era: '1910s–1950s',
    education: 'Most limited to 3rd grade',
    groups: [
      {
        parent: 'Lourdes\' children',
        people: [
          { id: 'carmalita', name: 'Carmalita Miranda', meta: '2 sons' },
          { id: 'polo', name: 'Polo Targno Terminal', meta: '1 son' },
          { id: 'menu', name: 'Menu Miranda', meta: '5 children' },
        ],
      },
      {
        parent: 'Francisco II\'s child',
        people: [{ id: 'bertha', name: 'Bertha Carreon Terminel (La Cuata)', meta: '' }],
      },
      {
        parent: 'Rosa\'s children',
        people: [
          { id: 'ruben', name: 'Ruben Terminel', meta: '2 daughters · 3 grandchildren' },
          { id: 'teresa', name: 'Teresa Terminel', meta: '3 children · 6 grandchildren' },
          { id: 'peoples', name: 'Peoples Terminel', meta: '' },
        ],
      },
      {
        parent: 'María Manuela\'s children',
        people: [
          { id: 'delia', name: 'Delia Terminel', meta: 'American father · 8 children · 24 grandchildren · 6 great-grand.' },
          { id: 'amanda', name: 'Amanda Terminel', meta: 'Chinese father · 14 children · 33 grandchildren · 19 great-grand.' },
          { id: 'raquel', name: 'Raquel Terminel', meta: 'Father Leon · 8 children · 21 grandchildren · 11 great-grand.' },
          { id: 'alba', name: 'Alba Terminel', meta: 'Father Roberto' },
          { id: 'irma', name: 'Irma Herrera', meta: '' },
        ],
      },
    ],
  },
  {
    gen: 5,
    title: 'American Integration Generation',
    era: '1930s–1970s',
    education: 'Some doctoral degrees achieved',
    groups: [
      {
        parent: 'Bertha\'s children',
        people: [
          { id: 'isaac', name: 'Isaac Carreon', meta: '4 daughters' },
          { id: 'marcos', name: 'Marcos Carreon', meta: '2 daughters' },
          { id: 'frank', name: 'Frank Carreon', meta: '4 daughters' },
        ],
      },
      {
        parent: 'Alba\'s children',
        people: [
          {
            id: 'gabriel',
            name: 'Gabriel Arce Terminel',
            meta: 'Biological father: Juan Ortega Garcia · Adoptive father: Don Gabriel Arce · Doctorate',
            keeper: true,
          },
          { id: 'humberto', name: 'Humberto Arce Terminel', meta: '' },
          { id: 'aide', name: 'Aide Arce Terminel', meta: '' },
          { id: 'gilberto-duarte', name: 'Gilberto & Duarte Terminel', meta: 'Doctorate level' },
        ],
      },
    ],
  },
  {
    gen: 6,
    title: 'Modern Generation',
    era: '1960s–Present',
    education: 'College graduates · professional careers',
    people: [
      {
        id: 'joshua',
        name: 'Joshua Gabriel Arce Moreno',
        meta: 'Knowledge keeper — second of two family members aware of complete history and Yaqui origins',
        keeper: true,
      },
    ],
  },
];

export const headcount = [
  { gen: 'Generation 1', count: '2', education: 'Traditional tribal knowledge', notable: 'La Bacha, Chieftain Yaqui' },
  { gen: 'Generation 2', count: '2', education: 'No formal education', notable: 'Aviana Sagasta, Francisco Terminel' },
  { gen: 'Generation 3', count: '4', education: 'No formal education', notable: 'María Manuela "Nela" Terminel Sagasta' },
  { gen: 'Generation 4', count: '14', education: 'Most only 3rd grade', notable: 'Delia, Amanda, Raquel, Alba' },
  { gen: 'Generation 5', count: 'Est. 61', education: 'Some doctoral degrees', notable: 'Gabriel Arce Terminel, Gilberto & Duarte Terminel' },
  { gen: 'Generation 6', count: 'Est. 94+', education: 'Many college graduates', notable: 'Joshua Gabriel Arce' },
  { gen: 'TOTAL', count: 'Est. 177+', education: 'From none → higher education', notable: '—' },
];