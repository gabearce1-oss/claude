// Lightweight named-entity extraction. Two passes:
//   1) Dictionary lookup against the canonical TE360 entities (high precision)
//   2) Regex capture of capitalized multi-word sequences (medium precision)

import { seedEntities, normalizeKey } from '@/components/playbook/seedEntities';

function normalize(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function buildDictionary() {
  const dict = [];
  for (const ent of seedEntities) {
    const names = [ent.name, ...(ent.aka || [])];
    for (const n of names) {
      if (!n) continue;
      const norm = normalize(n);
      if (norm.length < 3) continue;
      dict.push({ name: n, canonical: ent.name, type: ent.entity_type, norm });
    }
  }
  // Sort longest-first so multi-word matches win
  dict.sort((a, b) => b.norm.length - a.norm.length);
  return dict;
}

let DICT_CACHE = null;
function getDict() {
  if (!DICT_CACHE) DICT_CACHE = buildDictionary();
  return DICT_CACHE;
}

const CAP_RE = /\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+(?:de|del|la|el|von|van|y)\s+|\s+)?(?:[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)\b/g;

export function extractEntities(text, { limit = 25 } = {}) {
  if (!text) return [];
  const found = new Map();
  const dict = getDict();
  const norm = normalize(text);

  // Pass 1 — canonical dictionary
  for (const d of dict) {
    if (norm.includes(d.norm)) {
      if (!found.has(d.canonical)) {
        found.set(d.canonical, { name: d.canonical, type: d.type, source: 'canonical', hits: 0 });
      }
      found.get(d.canonical).hits++;
    }
  }

  // Pass 2 — capitalized multi-word sequences not already matched
  let m;
  CAP_RE.lastIndex = 0;
  while ((m = CAP_RE.exec(text)) !== null) {
    const candidate = m[1].trim();
    if (candidate.length < 4) continue;
    const cnorm = normalize(candidate);
    if (cnorm.split(/\s+/).length < 2) continue; // single capitalized words too noisy
    let already = false;
    for (const d of dict) if (d.norm === cnorm) { already = true; break; }
    if (already) continue;
    if (!found.has(candidate)) {
      found.set(candidate, { name: candidate, type: 'candidate', source: 'capitalized', hits: 0 });
    }
    found.get(candidate).hits++;
  }

  return Array.from(found.values())
    .sort((a, b) => {
      if (a.source !== b.source) return a.source === 'canonical' ? -1 : 1;
      return b.hits - a.hits;
    })
    .slice(0, limit);
}
