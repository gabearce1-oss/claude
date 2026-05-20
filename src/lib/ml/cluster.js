// k-means clustering over TF-IDF vectors. Pure JS.
import { buildIndex } from './embeddings.js';

function vecDot(a, b) {
  let s = 0;
  for (const [t, w] of a) {
    const bw = b.get(t);
    if (bw) s += w * bw;
  }
  return s;
}
function vecNorm(v) {
  let s = 0;
  for (const w of v.values()) s += w * w;
  return Math.sqrt(s) || 1;
}
function cosine(a, b) {
  return vecDot(a, b) / (vecNorm(a) * vecNorm(b));
}

function meanVector(vecs) {
  const mean = new Map();
  for (const v of vecs) {
    for (const [t, w] of v) mean.set(t, (mean.get(t) || 0) + w);
  }
  const n = vecs.length || 1;
  for (const [t, w] of mean) mean.set(t, w / n);
  return mean;
}

// Deterministic seed via simple LCG so results are stable across rerenders.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function cluster(documents, { k = 4, iters = 12, seed = 42 } = {}) {
  if (!documents || documents.length === 0) return [];
  const index = buildIndex(documents);
  const ids = Array.from(index.vectors.keys());
  if (ids.length <= k) {
    return ids.map((id) => ({ cluster: ids.indexOf(id), docId: id, score: 1 }));
  }

  const rand = rng(seed);
  // k-means++ light: pick first centroid randomly, then farthest each round
  const centroids = [index.vectors.get(ids[Math.floor(rand() * ids.length)])];
  while (centroids.length < k) {
    let maxDist = -1;
    let pick = null;
    for (const id of ids) {
      const v = index.vectors.get(id);
      let minSim = 1;
      for (const c of centroids) minSim = Math.min(minSim, cosine(v, c));
      const dist = 1 - minSim;
      if (dist > maxDist) {
        maxDist = dist;
        pick = v;
      }
    }
    centroids.push(pick);
  }

  let assignments = new Array(ids.length).fill(0);
  for (let it = 0; it < iters; it++) {
    // assign
    let changed = false;
    for (let i = 0; i < ids.length; i++) {
      const v = index.vectors.get(ids[i]);
      let best = 0;
      let bestSim = -1;
      for (let c = 0; c < centroids.length; c++) {
        const sim = cosine(v, centroids[c]);
        if (sim > bestSim) {
          bestSim = sim;
          best = c;
        }
      }
      if (assignments[i] !== best) {
        assignments[i] = best;
        changed = true;
      }
    }
    if (!changed) break;
    // update centroids
    for (let c = 0; c < centroids.length; c++) {
      const members = ids
        .filter((_, i) => assignments[i] === c)
        .map((id) => index.vectors.get(id));
      if (members.length > 0) centroids[c] = meanVector(members);
    }
  }

  // Build top-keyword label for each cluster
  const labels = centroids.map((c) => {
    return Array.from(c.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([t]) => t)
      .join(' · ');
  });

  return ids.map((id, i) => ({
    docId: id,
    cluster: assignments[i],
    label: labels[assignments[i]] || `cluster ${assignments[i]}`,
  }));
}
