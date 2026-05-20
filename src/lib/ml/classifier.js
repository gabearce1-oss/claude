// Pipe tagger: k-NN against existing labeled claims using TF-IDF cosine.
// Falls back to a keyword table when the corpus is too small.

import { buildIndex, search } from './embeddings.js';

const PIPE_KEYWORDS = {
  GEO:   ['san javier', 'sahuaripa', 'sonora', 'watershed', 'geography', 'municipio', 'inegi', 'frontera'],
  MIN:   ['mine', 'mining', 'silver', 'gold', 'concession', 'sgm', 'porchas', 'bullion', 'mineria', 'plata'],
  POL:   ['senator', 'desafuero', 'calles', 'cardenas', 'porfirio', 'congress', 'diputado', 'senado', 'inehrm'],
  LAND:  ['land', 'deed', 'escritura', 'libro', 'folio', 'expediente', 'bacobampo', 'ejido', 'expropriation', 'predio'],
  IND:   ['indigenous', 'india', 'indigena', 'pima', 'opata', 'yaqui', 'mayo', 'nevome', 'tribe', 'caste'],
  GEN:   ['born', 'baptism', 'marriage', 'nela', 'sagasta', 'terminel', 'family', 'genealog', 'nacimiento', 'matrimonio'],
  WF:    ['wells fargo', 'express', 'money order', 'waybill', 'wiltsee', 'huntington', 'box 34', 'parsons', 'bullion'],
  LEGAL: ['law', 'code', 'article', 'civil', 'commercial', 'power of attorney', 'concubina', 'limantour', 'banco'],
  TRADE: ['proxy', 'tradecraft', 'compartment', 'broker', 'agent', 'consignor', 'fraudulent', 'nominee'],
  AUDIT: ['archive', 'archivo', 'ages', 'ahes', 'agn', 'fapecft', 'nara', 'familysearch', 'bancroft', 'audit'],
};

function keywordScore(text, pipe) {
  if (!text) return 0;
  const t = text.toLowerCase();
  const kws = PIPE_KEYWORDS[pipe] || [];
  let hits = 0;
  for (const kw of kws) if (t.includes(kw)) hits++;
  return hits / Math.max(kws.length, 1);
}

function pipeFromSubject(subject) {
  if (!subject) return null;
  const m = String(subject).toUpperCase().match(/^([A-Z]+)-\d{3}/);
  return m ? m[1] : null;
}

// Suggest pipe codes for a new claim / evidence given existing labeled claims.
// Returns top-k suggestions with combined keyword + k-NN scores.
export function suggestPipes({ text, existingClaims = [], k = 3 }) {
  if (!text || !text.trim()) return [];

  // Pure keyword pass — works even without any labeled claims
  const keywordScores = {};
  for (const pipe of Object.keys(PIPE_KEYWORDS)) {
    keywordScores[pipe] = keywordScore(text, pipe);
  }

  // k-NN over existing labeled claims (if any)
  const labeled = existingClaims
    .filter((c) => c.subject && c.claim_text)
    .map((c) => ({ id: c.id, text: `${c.claim_text} ${c.subject}`, pipe: pipeFromSubject(c.subject) }))
    .filter((d) => d.pipe);

  let knnScores = {};
  if (labeled.length >= 5) {
    const index = buildIndex(labeled);
    const hits = search(index, text, 10);
    const byPipe = {};
    for (const h of hits) {
      const doc = labeled.find((d) => d.id === h.id);
      if (!doc) continue;
      byPipe[doc.pipe] = (byPipe[doc.pipe] || 0) + h.score;
    }
    const max = Math.max(...Object.values(byPipe), 1);
    for (const [pipe, v] of Object.entries(byPipe)) knnScores[pipe] = v / max;
  }

  // Combine: 60% k-NN (if available) + 40% keyword, else 100% keyword
  const combined = {};
  const haveKnn = Object.keys(knnScores).length > 0;
  for (const pipe of Object.keys(PIPE_KEYWORDS)) {
    combined[pipe] = haveKnn
      ? 0.6 * (knnScores[pipe] || 0) + 0.4 * keywordScores[pipe]
      : keywordScores[pipe];
  }

  return Object.entries(combined)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([pipe, score]) => ({ pipe, score }));
}
