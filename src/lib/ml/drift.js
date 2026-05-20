// Audit-score drift detection — rolling-mean z-score on SessionLog series.

export function detectDrift(sessionLogs, { windowSize = 7, threshold = 2 } = {}) {
  const series = (sessionLogs || [])
    .filter((s) => s.session_date && typeof s.audit_score === 'number')
    .sort((a, b) => a.session_date.localeCompare(b.session_date));

  if (series.length < windowSize + 1) {
    return { hasDrift: false, latest: series[series.length - 1] || null, points: series };
  }

  const latest = series[series.length - 1];
  const baseline = series.slice(-windowSize - 1, -1);
  const mean = baseline.reduce((a, s) => a + s.audit_score, 0) / baseline.length;
  const variance =
    baseline.reduce((a, s) => a + (s.audit_score - mean) ** 2, 0) / baseline.length;
  const sd = Math.sqrt(variance) || 1;
  const z = (latest.audit_score - mean) / sd;

  return {
    hasDrift: Math.abs(z) >= threshold,
    direction: z > 0 ? 'up' : 'down',
    z: Number(z.toFixed(2)),
    mean: Number(mean.toFixed(1)),
    sd: Number(sd.toFixed(2)),
    latest,
    baselineCount: baseline.length,
    points: series,
  };
}
