// Generates a professional forensic audit PDF report from current dashboard data.
import { jsPDF } from 'jspdf';

const COLORS = {
  ink: [26, 24, 21],
  paper: [244, 237, 224],
  muted: [107, 101, 89],
  rule: [184, 173, 151],
  green: [107, 142, 111],
  amber: [184, 166, 133],
  red: [196, 69, 54],
  accent: [196, 69, 54],
};

const setFill = (doc, c) => doc.setFillColor(c[0], c[1], c[2]);
const setText = (doc, c) => doc.setTextColor(c[0], c[1], c[2]);
const setDraw = (doc, c) => doc.setDrawColor(c[0], c[1], c[2]);

function pct(n, d) {
  return d > 0 ? Math.round((n / d) * 100) : 0;
}

function countBy(arr, getKey) {
  const out = {};
  arr.forEach((item) => {
    const k = getKey(item);
    if (k == null) return;
    out[k] = (out[k] || 0) + 1;
  });
  return out;
}

function drawHeader(doc, pageWidth) {
  // Classification bar
  setFill(doc, COLORS.ink);
  doc.rect(0, 0, pageWidth, 14, 'F');
  setText(doc, COLORS.paper);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('TRUTHENGINE360 · FORENSIC AUDIT REPORT · WORKING DOCUMENT', 14, 9);
  doc.text(new Date().toISOString().slice(0, 10), pageWidth - 14, 9, { align: 'right' });

  // Title
  setText(doc, COLORS.ink);
  doc.setFont('times', 'italic');
  doc.setFontSize(26);
  doc.text('Terminel–Sagasta Case File', 14, 32);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setText(doc, COLORS.muted);
  doc.text('Evidence Audit Dashboard · Verification Progress Snapshot', 14, 39);

  // Divider
  setDraw(doc, COLORS.rule);
  doc.setLineWidth(0.3);
  doc.line(14, 44, pageWidth - 14, 44);
}

function drawFooter(doc, pageNum, totalPages, pageWidth, pageHeight) {
  setDraw(doc, COLORS.rule);
  doc.setLineWidth(0.2);
  doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);
  setText(doc, COLORS.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('TE360 · Generated ' + new Date().toLocaleString(), 14, pageHeight - 8);
  doc.text(`Page ${pageNum} / ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
}

function sectionTitle(doc, text, y) {
  setText(doc, COLORS.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(text.toUpperCase(), 14, y);
  setDraw(doc, COLORS.ink);
  doc.setLineWidth(0.5);
  doc.line(14, y + 1.5, 50, y + 1.5);
  return y + 8;
}

function statBlock(doc, x, y, w, label, value, sub) {
  setDraw(doc, COLORS.rule);
  setFill(doc, [255, 255, 255]);
  doc.setLineWidth(0.3);
  doc.rect(x, y, w, 24, 'FD');

  setText(doc, COLORS.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(label.toUpperCase(), x + 3, y + 5);

  setText(doc, COLORS.ink);
  doc.setFont('times', 'normal');
  doc.setFontSize(20);
  doc.text(String(value), x + 3, y + 16);

  if (sub) {
    setText(doc, COLORS.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(sub, x + 3, y + 21);
  }
}

function progressBar(doc, x, y, w, segments, total) {
  const h = 4;
  // bg
  setFill(doc, [249, 245, 237]);
  doc.rect(x, y, w, h, 'F');
  if (total === 0) return;
  let cursor = x;
  segments.forEach((s) => {
    const segW = (s.count / total) * w;
    if (segW <= 0) return;
    setFill(doc, s.color);
    doc.rect(cursor, y, segW, h, 'F');
    cursor += segW;
  });
}

function legendRow(doc, x, y, color, label, count) {
  setFill(doc, color);
  doc.rect(x, y - 2, 2.5, 2.5, 'F');
  setText(doc, COLORS.ink);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${label} · ${count}`, x + 4, y);
}

export function exportAuditReport({ evidence = [], claims = [], archiveRequests = [] }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  drawHeader(doc, pageWidth);

  // === Snapshot stats ===
  const evTotal = evidence.length;
  const evStatus = countBy(evidence, (e) => e.status);
  const evReview = countBy(evidence, (e) => e.review_status);
  const evVerified = evStatus.verified || 0;
  const evReviewed = evStatus.reviewed || 0;
  const evDisputed = evStatus.disputed || 0;
  const evUnreviewed = evStatus.unreviewed || 0;

  const clTotal = claims.length;
  const clStatus = countBy(claims, (c) => c.status);
  const clVerified = clStatus.verified || 0;

  const combinedTotal = evTotal + clTotal;
  const combinedVerified = evVerified + clVerified;
  const overallPct = pct(combinedVerified, combinedTotal);

  // Overall summary band
  setFill(doc, COLORS.ink);
  doc.rect(14, 50, pageWidth - 28, 26, 'F');
  setText(doc, COLORS.paper);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('OVERALL VERIFICATION', 18, 57);
  doc.setFont('times', 'italic');
  doc.setFontSize(36);
  doc.text(`${overallPct}%`, 18, 72);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(
    `${combinedVerified} of ${combinedTotal} records verified across Evidence + Claims`,
    60,
    66,
  );
  doc.setFontSize(7);
  setText(doc, [196, 184, 150]);
  doc.text(`Evidence verified: ${evVerified}/${evTotal} (${pct(evVerified, evTotal)}%)`, 60, 71);
  doc.text(`Claims verified: ${clVerified}/${clTotal} (${pct(clVerified, clTotal)}%)`, 60, 75);

  // === Evidence breakdown ===
  let y = sectionTitle(doc, 'Evidence breakdown', 88);

  statBlock(doc, 14, y, 42, 'Total', evTotal, 'records');
  statBlock(doc, 60, y, 42, 'Verified', evVerified, `${pct(evVerified, evTotal)}% of total`);
  statBlock(doc, 106, y, 42, 'Reviewed', evReviewed, 'awaiting verification');
  statBlock(doc, 152, y, 42, 'Disputed', evDisputed, 'flagged for review');
  y += 30;

  // Evidence progress bar
  setText(doc, COLORS.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Status distribution', 14, y);
  y += 3;
  progressBar(
    doc,
    14,
    y,
    pageWidth - 28,
    [
      { count: evVerified, color: COLORS.green },
      { count: evReviewed, color: COLORS.amber },
      { count: evDisputed, color: COLORS.red },
      { count: evUnreviewed, color: COLORS.rule },
    ],
    evTotal,
  );
  y += 8;
  legendRow(doc, 14, y, COLORS.green, 'Verified', evVerified);
  legendRow(doc, 50, y, COLORS.amber, 'Reviewed', evReviewed);
  legendRow(doc, 86, y, COLORS.red, 'Disputed', evDisputed);
  legendRow(doc, 122, y, COLORS.rule, 'Unreviewed', evUnreviewed);
  y += 10;

  // === Claims breakdown ===
  y = sectionTitle(doc, 'Claims breakdown', y + 4);

  const clLabels = [
    { key: 'verified', label: 'Verified', color: COLORS.green },
    { key: 'corroborated', label: 'Corroborated', color: [138, 166, 135] },
    { key: 'plausible', label: 'Plausible', color: COLORS.amber },
    { key: 'weak_lead', label: 'Weak lead', color: COLORS.rule },
    { key: 'fabricated_risk', label: 'Fabrication risk', color: COLORS.red },
    { key: 'rejected', label: 'Rejected', color: [107, 101, 89] },
    { key: 'unverified', label: 'Unverified', color: [232, 224, 205] },
  ];

  statBlock(doc, 14, y, 42, 'Total claims', clTotal, 'assertions tracked');
  statBlock(doc, 60, y, 42, 'Verified', clVerified, `${pct(clVerified, clTotal)}% of total`);
  statBlock(
    doc,
    106,
    y,
    42,
    'Corroborated',
    clStatus.corroborated || 0,
    'two+ sources',
  );
  statBlock(
    doc,
    152,
    y,
    42,
    'Fabrication risk',
    clStatus.fabricated_risk || 0,
    'quarantine track',
  );
  y += 30;

  setText(doc, COLORS.muted);
  doc.setFontSize(8);
  doc.text('Claim status ladder', 14, y);
  y += 3;
  progressBar(
    doc,
    14,
    y,
    pageWidth - 28,
    clLabels.map((l) => ({ count: clStatus[l.key] || 0, color: l.color })),
    clTotal,
  );
  y += 8;

  // 2-column legend
  clLabels.forEach((l, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    legendRow(doc, 14 + col * 95, y + row * 5, l.color, l.label, clStatus[l.key] || 0);
  });
  y += Math.ceil(clLabels.length / 2) * 5 + 6;

  // === Nine Pipes (Pass 3.1) ===
  if (y > pageHeight - 80) {
    drawFooter(doc, 1, 2, pageWidth, pageHeight);
    doc.addPage();
    drawHeader(doc, pageWidth);
    y = 54;
  }
  y = sectionTitle(doc, 'Nine Pipes · Pass 3.1', y);
  const PIPES = [
    ['GEO',   'GEO+MIN'],   ['POL',   'POL'],      ['LAND',  'LAND'],
    ['IND',   'IND'],       ['GEN',   'GEN+FAM'],  ['WF',    'WF'],
    ['LEGAL', 'LEGAL'],     ['ARCH',  'ARCH'],     ['AUDIT', 'AUDIT+INST'],
  ];
  const pipeRows = PIPES.map(([code, label]) => {
    const c = claims.filter((cl) => (cl.subject || '').toUpperCase().startsWith(code + '-'));
    const v = c.filter((cl) => cl.status === 'verified' || cl.status === 'corroborated').length;
    const o = c.filter((cl) => cl.status === 'plausible' || cl.status === 'weak_lead' || cl.status === 'unverified').length;
    const r = c.filter((cl) => cl.status === 'fabricated_risk' || cl.status === 'rejected').length;
    return { label, total: c.length, v, o, r };
  });
  // Audit score
  const totV = pipeRows.reduce((s, p) => s + p.v, 0);
  const totO = pipeRows.reduce((s, p) => s + p.o, 0);
  const totR = pipeRows.reduce((s, p) => s + p.r, 0);
  const totT = pipeRows.reduce((s, p) => s + p.total, 0);
  const auditScore = totT > 0
    ? Math.max(0, Math.round(((totV * 1.0 + totO * 0.4 - totR * 1.0) / totT) * 100))
    : 0;

  statBlock(doc, 14, y, 42, 'Audit score', `${auditScore}/100`, totT < 40 ? 'archival phase' : totT < 70 ? 'corroboration' : 'litigation-ready');
  statBlock(doc, 60, y, 42, 'Verified', totV, 'green claims');
  statBlock(doc, 106, y, 42, 'Leads', totO, 'orange claims');
  statBlock(doc, 152, y, 42, 'Quarantined', totR, 'red claims');
  y += 30;

  // Pipe grid (3 columns)
  setText(doc, COLORS.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  const colW = (pageWidth - 28) / 3;
  pipeRows.forEach((p, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const rx = 14 + col * colW;
    const ry = y + row * 12;
    setDraw(doc, COLORS.rule);
    setFill(doc, [249, 245, 237]);
    doc.setLineWidth(0.2);
    doc.rect(rx, ry, colW - 2, 10, 'FD');
    setText(doc, COLORS.ink);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(p.label, rx + 2, ry + 4);
    setText(doc, COLORS.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`${p.total} claims`, rx + colW - 4, ry + 4, { align: 'right' });
    setText(doc, COLORS.green);
    doc.text(`✓${p.v}`, rx + 2, ry + 8);
    setText(doc, COLORS.amber);
    doc.text(`○${p.o}`, rx + 14, ry + 8);
    setText(doc, COLORS.red);
    doc.text(`✕${p.r}`, rx + 26, ry + 8);
  });
  y += Math.ceil(pipeRows.length / 3) * 12 + 6;

  // === Custody pipeline ===
  if (y > pageHeight - 70) {
    drawFooter(doc, 1, 2, pageWidth, pageHeight);
    doc.addPage();
    drawHeader(doc, pageWidth);
    y = 54;
  }
  y = sectionTitle(doc, 'Chain of custody', y);
  const custody = countBy(evidence, (e) => e.chain_of_custody_status);
  statBlock(doc, 14, y, 42, 'Draft', custody.draft || 0, 'unsealed');
  statBlock(doc, 60, y, 42, 'Tracked', custody.tracked || 0, 'logged');
  statBlock(doc, 106, y, 42, 'Sealed', custody.sealed || 0, 'tamper-evident');
  statBlock(doc, 152, y, 42, 'Quarantined', custody.quarantined || 0, 'fabrication risk');
  y += 32;

  // === Archive requests ===
  y = sectionTitle(doc, 'Archive requests', y);
  const arStatus = countBy(archiveRequests, (r) => r.status);
  const arOpen = (arStatus.submitted || 0) + (arStatus.running || 0) + (arStatus.draft || 0);
  const arDone = (arStatus.completed || 0) + (arStatus.responded || 0);
  statBlock(doc, 14, y, 42, 'Total', archiveRequests.length, 'submitted overall');
  statBlock(doc, 60, y, 42, 'Open', arOpen, 'awaiting response');
  statBlock(doc, 106, y, 42, 'Completed', arDone, 'records received');
  statBlock(doc, 152, y, 42, 'No result', arStatus.no_result || 0, 'closed empty');
  y += 30;

  // === Methodology note ===
  if (y > pageHeight - 50) {
    drawFooter(doc, 1, 2, pageWidth, pageHeight);
    doc.addPage();
    drawHeader(doc, pageWidth);
    y = 54;
  }
  y = sectionTitle(doc, 'Methodology', y);
  setText(doc, COLORS.ink);
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  const note =
    'This report reflects the current state of the TruthEngine360 case file at the moment of export. Verification percentages are computed against all tracked Evidence and Claim records. Items flagged as fabrication risk or quarantined are excluded from verified counts and tracked separately under the custody pipeline. All status transitions are audit-logged and bound to a primary source.';
  const lines = doc.splitTextToSize(note, pageWidth - 28);
  doc.text(lines, 14, y);

  // Finalize footers
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    drawFooter(doc, i, total, pageWidth, pageHeight);
  }

  const filename = `te360-audit-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}