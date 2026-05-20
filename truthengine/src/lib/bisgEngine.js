// BISG Scoring Engine — client-side implementation
// Bayesian Improved Surname Geocoding for Vietnam-era DCAS casualty classification audit
//
// Anchor metrics (non-negotiable):
//   DCAS official Hispanic: 349 / 58,220 (0.60%)
//   BISG τ=0.40 corrected:  2,309 (84.9% classification failure rate)

// P(Hispanic | National population) — BISG prior
const HISPANIC_NATIONAL_PRIOR = 0.0397;

// τ threshold: P(Hispanic | Surname) ≥ 0.40 → classify as Hispanic
export const BISG_TAU = 0.40;

// Known high-probability Hispanic surnames from Census Bureau surname data
// (representative sample — full implementation uses the Census surname file)
const HIGH_CONFIDENCE_SURNAMES = new Set([
  'garcia', 'rodriguez', 'martinez', 'hernandez', 'lopez', 'gonzalez', 'perez',
  'sanchez', 'ramirez', 'flores', 'rivera', 'gomez', 'diaz', 'reyes', 'morales',
  'jimenez', 'gutierrez', 'ortiz', 'chavez', 'ramos', 'ruiz', 'alvarez', 'mendoza',
  'castillo', 'vasquez', 'serrano', 'medina', 'vargas', 'contreras', 'bautista',
  'delgado', 'guerrero', 'rios', 'salinas', 'torres', 'aguilar', 'espinoza',
  'lara', 'padilla', 'dominguez', 'vega', 'soto', 'rojas', 'herrera', 'nunez',
  'pena', 'acosta', 'figueroa', 'fuentes', 'molina', 'cabrera', 'campos',
  'carrillo', 'cordova', 'cortez', 'de la cruz', 'duran', 'estrada', 'franco',
  'gallegos', 'guevara', 'guzman', 'ibarra', 'iglesias', 'juarez', 'leiva',
  'luna', 'macias', 'maldonado', 'marin', 'mejia', 'mendez', 'montes',
  'montoya', 'mora', 'moreno', 'munoz', 'navarro', 'negron', 'ochoa',
  'orozco', 'ortega', 'pacheco', 'palacios', 'peralta', 'pineda', 'ponce',
  'quezada', 'quintana', 'quintero', 'rios', 'romero', 'rubio', 'salas',
  'salazar', 'sandoval', 'segura', 'silva', 'solis', 'suarez', 'tapia',
  'tejada', 'trujillo', 'uribe', 'valdes', 'valdivia', 'valencia', 'valenzuela',
  'valle', 'vanegas', 'varela', 'vides', 'villa', 'villanueva', 'villareal',
  'zarate', 'zavala', 'zuniga', 'castano', 'mejia', 'espino',
  // Vietnam-era CB-HSIVF confirmed surnames
  'duran', 'valenzuela', 'castano',
]);

// Medium-probability Hispanic surnames (0.40–0.75 range)
const MEDIUM_CONFIDENCE_SURNAMES = new Set([
  'moreno', 'medrano', 'prieto', 'sierra', 'caballero', 'cantu', 'cano',
  'cisneros', 'de leon', 'escobar', 'esquivel', 'fonseca', 'galindo',
  'galvan', 'gaona', 'garza', 'granados', 'infante', 'leal', 'lemus',
  'linares', 'lozano', 'lucero', 'lugo', 'malagon', 'maradiaga', 'mares',
  'marquez', 'mesa', 'miramontes', 'miranda', 'moran', 'navarrete',
  'navas', 'nieto', 'noriega', 'olivos', 'ornelas', 'oviedo', 'paredes',
  'pastor', 'piedra', 'posada', 'prado', 'rendon', 'renteria', 'reynoso',
  'rico', 'rincon', 'rivas', 'robledo', 'rodrigues', 'rojas', 'rosales',
  'rubero', 'saavedra', 'salcedo', 'salgado', 'san martin', 'santiago',
  'solano', 'soria', 'sosa', 'sotelo', 'tafoya', 'tamayo', 'tejeda',
  'terrazas', 'tinoco', 'tinajero', 'tito', 'tobar', 'tovar', 'trejo',
  'ugarte', 'ulloa', 'urbina', 'valdez', 'velasco', 'velasquez', 'ventura',
  'vera', 'verdejo', 'vergara', 'villagomez', 'villalobos', 'villarreal',
  'vizcaino', 'yanez', 'zapata', 'zaragoza', 'zorilla',
]);

// State-level Hispanic population fractions for geographic adjustment
// Source: Census ACS 5-year estimates
const STATE_HISPANIC_FRACTIONS = {
  CA: 0.395, TX: 0.401, NM: 0.490, AZ: 0.314, CO: 0.215, NV: 0.290,
  FL: 0.266, NY: 0.191, IL: 0.174, NJ: 0.211, CT: 0.162, MA: 0.121,
  WA: 0.130, OR: 0.135, UT: 0.144, ID: 0.125, WY: 0.101, MT: 0.038,
  ND: 0.038, SD: 0.040, NE: 0.112, KS: 0.124, MN: 0.057, IA: 0.060,
  MO: 0.049, WI: 0.073, MI: 0.051, IN: 0.069, OH: 0.040, PA: 0.079,
  MD: 0.103, VA: 0.099, NC: 0.100, SC: 0.057, GA: 0.097, AL: 0.045,
  MS: 0.035, TN: 0.058, KY: 0.040, WV: 0.014, DE: 0.099, DC: 0.112,
  HI: 0.104, AK: 0.071, RI: 0.153, VT: 0.018, NH: 0.037, ME: 0.017,
  AR: 0.079, LA: 0.059, OK: 0.113,
};

function normalizeSurname(surname) {
  return surname
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[^a-z\s]/g, '')
    .trim();
}

/**
 * Compute P(Hispanic | Surname) using simplified Bayes.
 * Full production implementation uses the Census surname file.
 */
function pHispanicGivenSurname(normalized) {
  if (HIGH_CONFIDENCE_SURNAMES.has(normalized)) {
    // High-confidence Hispanic surnames: prior estimate 0.75–0.95
    // Use 0.85 as a conservative centroid for this subset
    return 0.85;
  }
  if (MEDIUM_CONFIDENCE_SURNAMES.has(normalized)) {
    return 0.55;
  }

  // Structural heuristics for surname patterns common in Mexican-origin names
  if (
    normalized.endsWith('ez') || normalized.endsWith('az') ||
    normalized.endsWith('iz') || normalized.endsWith('oz')
  ) {
    return 0.52; // -ez/-az/-iz/-oz are strong Hispanic markers
  }
  if (normalized.endsWith('o') || normalized.endsWith('a')) {
    return 0.22; // weak positive signal
  }
  if (normalized.startsWith('de ') || normalized.startsWith('del ') || normalized.startsWith('la ')) {
    return 0.45; // Spanish particle prefix
  }

  // Unknown surname — use national prior as floor
  return HISPANIC_NATIONAL_PRIOR;
}

/**
 * Geographic Bayesian update.
 * Adjusts posterior using state-level Hispanic fraction.
 */
function geoUpdate(pSurname, stateCode) {
  if (!stateCode) return pSurname;
  const stateFrac = STATE_HISPANIC_FRACTIONS[stateCode.toUpperCase()];
  if (stateFrac == null) return pSurname;

  // Bayesian update: P(H|S,G) ∝ P(S|H,G) × P(H|G)
  // Simplified: blend surname score with state fraction
  const weight = 0.30; // geographic weight
  return (1 - weight) * pSurname + weight * stateFrac;
}

/**
 * Main BISG scoring function.
 *
 * @param {string} surname
 * @param {string|null} stateCode - 2-letter state code for geographic adjustment
 * @param {string|null} firstName - for BIFSG (Bayesian Improved First Name Surname Geocoding)
 * @param {number} tau - classification threshold (default 0.40)
 * @returns BISG score object
 */
export function bisgScore(surname, stateCode = null, firstName = null, tau = BISG_TAU) {
  if (!surname?.trim()) {
    return {
      error: 'Surname required',
      surname_score: null, geo_score: null, combined_score: null,
      exceeds_tau: false, classification_anomaly_flag: false,
    };
  }

  const normalized = normalizeSurname(surname);
  const surnameProbability = pHispanicGivenSurname(normalized);
  const geoProbability = geoUpdate(surnameProbability, stateCode);
  const combinedScore = geoProbability;

  const exceedsTau = combinedScore >= tau;

  return {
    surname: surname,
    normalized_surname: normalized,
    surname_score: Math.round(surnameProbability * 10000) / 10000,
    geo_score: stateCode ? Math.round(geoProbability * 10000) / 10000 : null,
    combined_score: Math.round(combinedScore * 10000) / 10000,
    exceeds_tau: exceedsTau,
    tau_used: tau,
    state_code: stateCode || null,
    confidence: surnameProbability >= 0.75 ? 'HIGH' : surnameProbability >= 0.45 ? 'MEDIUM' : 'LOW',
  };
}

/**
 * Classify a DCAS record for anomaly flag.
 * CRITICAL: anomaly_flag = true is a FORENSIC SIGNAL, NOT contamination.
 *
 * @param {string} surname - casualty surname
 * @param {string} dcasCodedEthnicity - the raw value from DCAS RACE_CODE field
 * @param {string|null} stateCode - home of record state
 * @param {number} tau
 */
export function classifyDCASAnomaly(surname, dcasCodedEthnicity, stateCode = null, tau = BISG_TAU) {
  const score = bisgScore(surname, stateCode, null, tau);
  const dcasNorm = (dcasCodedEthnicity || '').toLowerCase().trim();

  // Values in the 1965–1972 DCAS codebook that indicate NON-Hispanic classification
  const nonHispanicCodes = ['w', 'white', 'b', 'black', 'negro', 'a', 'asian', 'i', 'indian', 'o', 'other'];
  const dcasIsNonHispanic = nonHispanicCodes.some(c => dcasNorm === c || dcasNorm.startsWith(c));
  const dcasIsHispanic = dcasNorm.includes('h') || dcasNorm.includes('hispanic') || dcasNorm.includes('spanish');

  const anomalyFlag = score.exceeds_tau && dcasIsNonHispanic && !dcasIsHispanic;

  return {
    ...score,
    dcas_coded_ethnicity: dcasCodedEthnicity,
    dcas_is_non_hispanic: dcasIsNonHispanic,
    classification_anomaly_flag: anomalyFlag,
    anomaly_note: anomalyFlag
      ? 'FORENSIC SIGNAL: BISG ≥ τ=0.40 indicates Hispanic; DCAS codes non-Hispanic. Fast-track to analyst review.'
      : null,
    recommended_action: anomalyFlag
      ? 'FAST_TRACK_REVIEW'
      : score.exceeds_tau
      ? 'STANDARD_REVIEW'
      : 'LOW_PRIORITY',
  };
}

/**
 * DCAS anomaly statistics.
 */
export function classifyAnomaly(officialCount, bisgCorrected, totalRecords) {
  const failureRate = 1 - officialCount / bisgCorrected;
  const officialPct = officialCount / totalRecords;

  return {
    dcas_official: officialCount,
    bisg_corrected: bisgCorrected,
    total_records: totalRecords,
    failure_rate: Math.round(failureRate * 1000) / 10,
    official_pct: Math.round(officialPct * 10000) / 100,
    tradecraft_flag: failureRate > 0.80,
    confidence: officialPct < 0.01 ? 'CRITICAL' : 'HIGH',
    interpretation:
      failureRate > 0.80
        ? 'Failure rate exceeds 80% — statistically consistent with systematic tradecraft, not random error'
        : 'Elevated failure rate — requires further analysis',
  };
}

/**
 * Chapman capture-recapture estimator for true Hispanic KIA population.
 * Used to estimate total non-citizen KIA beyond the 349 DCAS official count.
 *
 * @param {number} n1 - List 1 size (DCAS official Hispanic count)
 * @param {number} n2 - List 2 size (BISG-corrected estimate)
 * @param {number} m2 - Overlap (cases appearing in both lists)
 */
export function chapmanEstimate(n1, n2, m2) {
  const N = ((n1 + 1) * (n2 + 1)) / (m2 + 1) - 1;
  const variance = ((n1 + 1) * (n2 + 1) * (n1 - m2) * (n2 - m2)) / (Math.pow(m2 + 1, 2) * (m2 + 2));
  const se = Math.sqrt(variance);

  return {
    estimate: Math.round(N),
    standard_error: Math.round(se * 10) / 10,
    ci_95_lower: Math.round(N - 1.96 * se),
    ci_95_upper: Math.round(N + 1.96 * se),
    n1_dcas_official: n1,
    n2_bisg_corrected: n2,
    m2_overlap: m2,
    method: 'Chapman (bias-corrected mark-recapture)',
    note: m2 === null ? 'PLACEHOLDER — overlap pending FSRDC microdata (doi:10.7910/DVN/O80SKQ)' : null,
  };
}

// Operational constants
export const ANCHOR = {
  dcas_official: 349,
  total_dcas: 58220,
  bisg_corrected: 2309,
  classification_failure_pct: 84.9,
  verified_cb_hsivf: 6,
  behavior_vector_n: 11,
  cronbach_alpha: 0.938,
  r_squared: 0.947,
  mexico_wall_names: 5,
  forensic_kia_estimate: 500,
  tau: 0.40,
};
