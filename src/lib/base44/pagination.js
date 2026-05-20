// Page through Base44 list() until the server returns less than a full
// page. Base44's SDK signature is list(sort, limit, skip) where the
// third argument is a record-offset, NOT a page index — so we advance
// skip by `limit` each iteration.
//
// Use this everywhere `entity.list()` appears in the frontend. Calling
// list() raw is wrong as soon as any entity grows past the SDK's
// default page size (~50 rows), and the TE360 matrix imports 75
// claims, so most pages would silently undercount in normal operation.
export async function listAll(entity, sort = null, { limit = 200, maxIterations = 100 } = {}) {
  const all = [];
  let skip = 0;
  for (let i = 0; i < maxIterations; i++) {
    const batch = await entity.list(sort, limit, skip);
    if (!batch || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < limit) break;
    skip += limit;
  }
  return all;
}

// Filtered list paginator. Mirrors the same skip-offset convention.
// Base44 filter() returns the rows matching the where-clause; once
// the matched set exceeds the page size we need to paginate the same
// way as list().
export async function filterAll(entity, where = {}, sort = null, { limit = 200, maxIterations = 100 } = {}) {
  const all = [];
  let skip = 0;
  for (let i = 0; i < maxIterations; i++) {
    const batch = await entity.filter(where, sort, limit, skip);
    if (!batch || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < limit) break;
    skip += limit;
  }
  return all;
}
