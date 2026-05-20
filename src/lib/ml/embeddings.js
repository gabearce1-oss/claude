// TF-IDF + cosine similarity. Pure JS, no external embedding API.
// Good enough for sub-1000-row semantic search on this corpus.

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', 'at', 'to', 'for',
  'with', 'is', 'are', 'was', 'were', 'be', 'been', 'has', 'have',
  'had', 'this', 'that', 'these', 'those', 'it', 'its', 'as', 'by',
  'from', 'but', 'not', 'no', 'so', 'do', 'does', 'did', 'will',
  'would', 'can', 'could', 'should', 'may', 'might', 'i', 'you',
  'he', 'she', 'they', 'we', 'his', 'her', 'their', 'our', 'my',
  // Spanish stopwords — TE360 corpus is bilingual
  'el', 'la', 'los', 'las', 'de', 'del', 'en', 'y', 'o', 'un', 'una',
  'que', 'es', 'son', 'por', 'con', 'para', 'al', 'lo', 'le', 'su',
  'sus', 'se', 'ser', 'no', 'si', 'sí',
]);

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

// Build TF-IDF vectors for a corpus of documents.
// Returns { vectors: Map<docId, Map<term, weight>>, idf: Map<term, weight>, norms: Map<docId, number> }
export function buildIndex(documents) {
  const tf = new Map();
  const df = new Map();
  for (const doc of documents) {
    const tokens = tokenize(doc.text);
    const counts = new Map();
    for (const t of tokens) counts.set(t, (counts.get(t) || 0) + 1);
    tf.set(doc.id, counts);
    for (const t of counts.keys()) df.set(t, (df.get(t) || 0) + 1);
  }
  const N = documents.length || 1;
  const idf = new Map();
  for (const [t, c] of df) idf.set(t, Math.log(1 + N / (1 + c)));

  const vectors = new Map();
  const norms = new Map();
  for (const [id, counts] of tf) {
    const vec = new Map();
    let n2 = 0;
    for (const [t, c] of counts) {
      const w = c * (idf.get(t) || 0);
      vec.set(t, w);
      n2 += w * w;
    }
    vectors.set(id, vec);
    norms.set(id, Math.sqrt(n2) || 1);
  }
  return { vectors, idf, norms };
}

function queryVector(query, idf) {
  const tokens = tokenize(query);
  const counts = new Map();
  for (const t of tokens) counts.set(t, (counts.get(t) || 0) + 1);
  const vec = new Map();
  let n2 = 0;
  for (const [t, c] of counts) {
    const w = c * (idf.get(t) || 0);
    if (w > 0) {
      vec.set(t, w);
      n2 += w * w;
    }
  }
  return { vec, norm: Math.sqrt(n2) || 1 };
}

export function search(index, query, limit = 20) {
  const { vec: q, norm: qn } = queryVector(query, index.idf);
  if (q.size === 0) return [];
  const scores = [];
  for (const [id, dvec] of index.vectors) {
    let dot = 0;
    for (const [t, qw] of q) {
      const dw = dvec.get(t);
      if (dw) dot += qw * dw;
    }
    if (dot > 0) {
      const sim = dot / (qn * (index.norms.get(id) || 1));
      scores.push([id, sim]);
    }
  }
  scores.sort((a, b) => b[1] - a[1]);
  return scores.slice(0, limit).map(([id, score]) => ({ id, score }));
}

// Cosine similarity between two TF-IDF doc vectors (by id, both in same index)
export function similarity(index, idA, idB) {
  const a = index.vectors.get(idA);
  const b = index.vectors.get(idB);
  if (!a || !b) return 0;
  let dot = 0;
  for (const [t, aw] of a) {
    const bw = b.get(t);
    if (bw) dot += aw * bw;
  }
  return dot / ((index.norms.get(idA) || 1) * (index.norms.get(idB) || 1));
}
