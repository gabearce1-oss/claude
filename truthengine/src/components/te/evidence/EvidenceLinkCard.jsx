import { P } from "../../../lib/teData";
import { base44 } from "@/api/base44Client";

const LINK_COLORS = {
  "Identity Match": P.teal,
  "Service Corroboration": P.blue,
  "Deportation Confirmation": P.red,
  "Death / KIA Corroboration": "#DC2626",
  "Legal Proceeding Link": P.violet,
  "FOIA Response Match": P.amber,
  "Contradiction": P.red,
  "Supporting Evidence": P.gold,
};

const STATE_COLORS = {
  "Draft": P.t4,
  "Under Review": P.amber,
  "Confirmed": P.teal,
  "Disputed": P.red,
  "Archived": P.t4,
};

function SourceBlock({ type, label, ref_, excerpt, color }) {
  return (
    <div style={{ flex: 1, padding: "10px 12px", background: "#0B0E14", borderRadius: 7, border: `1px solid ${color}30` }}>
      <div style={{ fontSize: 8, fontWeight: 800, color, letterSpacing: "0.15em", marginBottom: 4 }}>{type}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: P.t1, marginBottom: 3 }}>{label}</div>
      {ref_ && <div style={{ fontSize: 8, color: P.blue, marginBottom: 4 }}>{ref_}</div>}
      {excerpt && <div style={{ fontSize: 9, color: P.t3, fontStyle: "italic", lineHeight: 1.5 }}>"{excerpt}"</div>}
    </div>
  );
}

export default function EvidenceLinkCard({ link, onDelete, onStatusChange }) {
  const linkColor = LINK_COLORS[link.link_type] || P.t3;
  const stateColor = STATE_COLORS[link.review_state] || P.t4;
  const confColor = link.match_confidence >= 85 ? P.teal : link.match_confidence >= 65 ? P.amber : P.red;

  async function handleDelete() {
    if (!confirm("Remove this evidence link?")) return;
    await base44.entities.EvidenceLink.delete(link.id);
    onDelete?.(link.id);
  }

  async function promote() {
    const next = { "Draft": "Under Review", "Under Review": "Confirmed", "Confirmed": "Confirmed", "Disputed": "Under Review" }[link.review_state] || "Under Review";
    await base44.entities.EvidenceLink.update(link.id, { review_state: next });
    onStatusChange?.(link.id, next);
  }

  return (
    <div style={{ border: `1px solid ${linkColor}35`, borderLeft: `4px solid ${linkColor}`, background: P.card, borderRadius: 10, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", background: `${linkColor}20`, border: `1px solid ${linkColor}50`, borderRadius: 5, color: linkColor }}>
            {link.link_type}
          </span>
          <span style={{ fontSize: 9, padding: "3px 8px", background: `${stateColor}15`, border: `1px solid ${stateColor}40`, borderRadius: 5, color: stateColor }}>
            {link.review_state}
          </span>
          <span style={{ fontSize: 9, padding: "3px 8px", background: `${confColor}15`, border: `1px solid ${confColor}40`, borderRadius: 5, color: confColor }}>
            {link.match_confidence}% confidence
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {link.review_state !== "Confirmed" && (
            <button onClick={promote}
              style={{ fontSize: 8, padding: "3px 10px", background: `${P.teal}15`, border: `1px solid ${P.teal}40`, borderRadius: 5, color: P.teal, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700 }}>
              ▲ Promote
            </button>
          )}
          <button onClick={handleDelete}
            style={{ fontSize: 8, padding: "3px 10px", background: `${P.red}10`, border: `1px solid ${P.red}30`, borderRadius: 5, color: P.red, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>
            ✕
          </button>
        </div>
      </div>

      {/* Subject */}
      {link.subject_name && (
        <div style={{ fontSize: 10, color: P.gold, fontWeight: 700 }}>Subject: {link.subject_name}{link.subject_id ? ` · ${link.subject_id}` : ""}</div>
      )}

      {/* Two source blocks */}
      <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
        <SourceBlock type={link.source_a_type} label={link.source_a_label} ref_={link.source_a_ref} excerpt={link.source_a_excerpt} color={P.blue} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, flexShrink: 0, padding: "0 6px" }}>
          <div style={{ fontSize: 16, color: linkColor }}>⟷</div>
          <div style={{ fontSize: 7, color: P.t4, textAlign: "center", maxWidth: 60, lineHeight: 1.3 }}>
            {link.match_fields || "linked"}
          </div>
        </div>
        <SourceBlock type={link.source_b_type} label={link.source_b_label} ref_={link.source_b_ref} excerpt={link.source_b_excerpt} color={P.violet} />
      </div>

      {/* Analyst note */}
      {link.analyst_note && (
        <div style={{ padding: "8px 12px", background: `${P.gold}08`, border: `1px solid ${P.gold}20`, borderRadius: 6, fontSize: 9, color: P.t3, lineHeight: 1.6 }}>
          <span style={{ color: P.gold, fontWeight: 800 }}>Note: </span>{link.analyst_note}
        </div>
      )}

      <div style={{ fontSize: 8, color: P.t4 }}>
        Linked {new Date(link.created_date).toLocaleDateString()} · Case: {link.case_file_id}
      </div>
    </div>
  );
}