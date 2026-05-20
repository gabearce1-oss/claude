// Generates a one-page daily summary PDF: today's verified claims + new evidence.
import { jsPDF } from 'jspdf';

const COLORS = {
  ink: [26, 24, 21],
  paper: [244, 237, 224],
  muted: [107, 101, 89],
  rule: [184, 173, 151],
  green: [107, 142, 111],
  amber: [184, 166, 133],
  red: [196, 69, 54],
};

const setFill = (doc, c) => doc.setFillColor(c[0], c[1], c[2]);
const setText = (doc, c) => doc.setTextColor(c[0], c[1], c[2]);
const setDraw = (doc, c) => doc.setDrawColor(c[0], c[1], c[2]);

// Use the operator's local day window (e.g. America/Los_Angeles) so "today" means today on their clock.
function isSameLocalDay(dateValue, isoDate) {
  if (!dateValue) return false;
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return false;
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  return local === isoDate;
}

function drawHeader(doc, pageWidth, isoDate) {
  setFill(doc, COLORS.ink);
  doc.rect(0, 0, pageWidth, 14, 'F');
  setText(doc, COLORS.paper);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('TRUTHENGINE360 · DAILY AUDIT SUMMARY · INTERNAL DISTRIBUTION', 14, 9);
  doc.text(isoDate, pageWidth - 14, 9, { align: 'right' });

  setText(doc, COLORS.ink);
  doc.setFont('times', 'italic');
  doc.setFontSize(24);
  doc.text("Today's Audit Progress", 14, 30);

  setText(doc, COLORS.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Terminel–Sagasta Case File · Verified claims & new evidence', 14, 36);

  setDraw(doc, COLORS.rule);
  doc.setLineWidth(0.3);
  doc.line(14, 40, pageWidth - 14, 40);
}

function sectionTitle(doc, text, y) {
  setText(doc, COLORS.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(text.toUpperCase(), 14, y);
  setDraw(doc, COLORS.ink);
  doc.setLineWidth(0.5);
  doc.line(14, y + 1.5, 50, y + 1.5);
  return y + 7;
}

function statPill(doc, x, y, label, value, color) {
  setFill(doc, color);
  doc.rect(x, y, 40, 16, 'F');
  setText(doc, [255, 255, 255]);
  doc.setFont('times', 'italic');
  doc.setFontSize(16);
  doc.text(String(value), x + 3, y + 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(label.toUpperCase(), x + 14, y + 11);
}

function ensureRoom(doc, pageWidth, pageHeight, y, needed, isoDate) {
  if (y + needed > pageHeight - 14) {
    doc.addPage();
    drawHeader(doc, pageWidth, isoDate);
    return 48;
  }
  return y;
}

function statusColor(status) {
  if (status === 'verified') return COLORS.green;
  if (status === 'corroborated') return [138, 166, 135];
  if (status === 'fabricated_risk' || status === 'disputed') return COLORS.red;
  return COLORS.amber;
}

export function exportDailySummary({ evidence = [], claims = [], operatorEmail = '' }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const today = new Date();
  const isoDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  // Filter to today's activity (verified today, or created today)
  // updated_date is preferred for "verified today"; fall back to created_date.
  const verifiedClaimsToday = claims.filter(
    (c) =>
      c.status === 'verified' &&
      isSameLocalDay(c.updated_date || c.created_date, isoDate),
  );
  const newEvidenceToday = evidence.filter((e) =>
    isSameLocalDay(e.created_date, isoDate),
  );
  const verifiedEvidenceToday = evidence.filter(
    (e) => e.status === 'verified' && isSameLocalDay(e.updated_date || e.created_date, isoDate),
  );

  drawHeader(doc, pageWidth, isoDate);

  // Summary pills
  statPill(doc, 14, 46, 'Verified claims', verifiedClaimsToday.length, COLORS.green);
  statPill(doc, 58, 46, 'New evidence', newEvidenceToday.length, COLORS.ink);
  statPill(doc, 102, 46, 'Verified evidence', verifiedEvidenceToday.length, [107, 142, 111]);

  setText(doc, COLORS.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  if (operatorEmail) {
    doc.text(`Prepared by ${operatorEmail}`, pageWidth - 14, 52, { align: 'right' });
  }
  doc.text(`Generated ${today.toLocaleString()}`, pageWidth - 14, 57, { align: 'right' });

  let y = 75;

  // === Verified claims ===
  y = sectionTitle(doc, `Verified claims today (${verifiedClaimsToday.length})`, y);
  if (verifiedClaimsToday.length === 0) {
    setText(doc, COLORS.muted);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text('No claims were verified today.', 14, y + 2);
    y += 10;
  } else {
    verifiedClaimsToday.forEach((c, i) => {
      y = ensureRoom(doc, pageWidth, pageHeight, y, 22, isoDate);
      // status chip
      setFill(doc, statusColor(c.status));
      doc.rect(14, y - 3.5, 2, 16, 'F');

      setText(doc, COLORS.ink);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`${String(i + 1).padStart(2, '0')}. ${c.claim_type || 'claim'}`, 19, y);

      setText(doc, COLORS.muted);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      const conf = c.confidence_score != null ? ` · confidence ${c.confidence_score}` : '';
      doc.text(`status: ${c.status}${conf}`, pageWidth - 14, y, { align: 'right' });

      setText(doc, COLORS.ink);
      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(c.claim_text || '(no text)', pageWidth - 36);
      doc.text(lines.slice(0, 3), 19, y + 5);

      y += 5 + Math.min(lines.length, 3) * 4 + 4;
      setDraw(doc, COLORS.rule);
      doc.setLineWidth(0.1);
      doc.line(19, y - 2, pageWidth - 14, y - 2);
    });
    y += 4;
  }

  // === New evidence ===
  y = ensureRoom(doc, pageWidth, pageHeight, y, 20, isoDate);
  y = sectionTitle(doc, `New evidence today (${newEvidenceToday.length})`, y + 4);

  if (newEvidenceToday.length === 0) {
    setText(doc, COLORS.muted);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text('No new evidence was ingested today.', 14, y + 2);
    y += 10;
  } else {
    newEvidenceToday.forEach((e, i) => {
      y = ensureRoom(doc, pageWidth, pageHeight, y, 18, isoDate);
      setFill(doc, statusColor(e.status));
      doc.rect(14, y - 3.5, 2, 14, 'F');

      setText(doc, COLORS.ink);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      const header = `${String(i + 1).padStart(2, '0')}. ${e.evidence_number || '—'} · ${e.title || 'Untitled'}`;
      const headerLines = doc.splitTextToSize(header, pageWidth - 60);
      doc.text(headerLines[0], 19, y);

      setText(doc, COLORS.muted);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(`${e.type || 'document'} · ${e.status || 'unreviewed'}`, pageWidth - 14, y, {
        align: 'right',
      });

      setText(doc, COLORS.ink);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const meta = [e.archive_name, e.source_system, e.language_code]
        .filter(Boolean)
        .join(' · ');
      if (meta) doc.text(meta, 19, y + 4);

      if (e.description) {
        setText(doc, COLORS.muted);
        doc.setFont('times', 'italic');
        doc.setFontSize(9);
        const desc = doc.splitTextToSize(e.description, pageWidth - 36);
        doc.text(desc.slice(0, 2), 19, y + 9);
        y += 9 + Math.min(desc.length, 2) * 4;
      } else {
        y += 9;
      }

      setDraw(doc, COLORS.rule);
      doc.setLineWidth(0.1);
      doc.line(19, y, pageWidth - 14, y);
      y += 3;
    });
  }

  // Footer
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    setDraw(doc, COLORS.rule);
    doc.setLineWidth(0.2);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);
    setText(doc, COLORS.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`TE360 · Daily summary · ${isoDate}`, 14, pageHeight - 8);
    doc.text(`Page ${i} / ${total}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
  }

  doc.save(`te360-daily-summary-${isoDate}.pdf`);

  return {
    verifiedClaims: verifiedClaimsToday.length,
    newEvidence: newEvidenceToday.length,
    verifiedEvidence: verifiedEvidenceToday.length,
  };
}