import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { P } from "../../../lib/teData";

const SOURCE_TYPES = ["USCIS", "DoD / DCAS", "NARA", "VA", "ICE", "DHS", "EOIR", "LOC", "Congress", "CBP", "Manual Entry"];
const LINK_TYPES = ["Identity Match", "Service Corroboration", "Deportation Confirmation", "Death / KIA Corroboration", "Legal Proceeding Link", "FOIA Response Match", "Contradiction", "Supporting Evidence"];

const FIELD = ({ label, children }) => (
  <div>
    <div style={{ fontSize: 8, color: P.t4, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>{label}</div>
    {children}
  </div>
);

const INPUT_STYLE = { width: "100%", background: "#0B0E14", border: `1px solid ${P.b}`, borderRadius: 6, padding: "7px 10px", color: P.t1, fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", outline: "none", boxSizing: "border-box" };
const SELECT_STYLE = { ...INPUT_STYLE, cursor: "pointer" };

export default function EvidenceLinkForm({ caseFileId, subjectName, subjectId, onSaved, onCancel }) {
  const [form, setForm] = useState({
    case_file_id: caseFileId || "",
    subject_name: subjectName || "",
    subject_id: subjectId || "",
    source_a_type: "USCIS",
    source_a_label: "",
    source_a_ref: "",
    source_a_excerpt: "",
    source_b_type: "DoD / DCAS",
    source_b_label: "",
    source_b_ref: "",
    source_b_excerpt: "",
    match_fields: "",
    match_confidence: 75,
    link_type: "Identity Match",
    analyst_note: "",
    review_state: "Draft",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await base44.entities.EvidenceLink.create({ ...form, match_confidence: Number(form.match_confidence) });
    setSaving(false);
    onSaved?.();
  }

  const confidenceColor = form.match_confidence >= 85 ? P.teal : form.match_confidence >= 65 ? P.amber : P.red;

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <FIELD label="Subject Name">
          <input style={INPUT_STYLE} value={form.subject_name} onChange={e => set("subject_name", e.target.value)} placeholder="Full name" />
        </FIELD>
        <FIELD label="Subject ID">
          <input style={INPUT_STYLE} value={form.subject_id} onChange={e => set("subject_id", e.target.value)} placeholder="CF-001, ACLU-ref..." />
        </FIELD>
        <FIELD label="Link Type">
          <select style={SELECT_STYLE} value={form.link_type} onChange={e => set("link_type", e.target.value)}>
            {LINK_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </FIELD>
      </div>

      {/* Two-source grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[
          { prefix: "source_a", label: "SOURCE A" },
          { prefix: "source_b", label: "SOURCE B" },
        ].map(({ prefix, label }) => (
          <div key={prefix} style={{ border: `1px solid ${P.b}`, borderRadius: 8, padding: "14px 16px", background: "#0B0E14", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, letterSpacing: "0.2em" }}>{label}</div>
            <FIELD label="Source Type">
              <select style={SELECT_STYLE} value={form[`${prefix}_type`]} onChange={e => set(`${prefix}_type`, e.target.value)}>
                {SOURCE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </FIELD>
            <FIELD label="Document / Record Label">
              <input style={INPUT_STYLE} value={form[`${prefix}_label`]} onChange={e => set(`${prefix}_label`, e.target.value)} placeholder="e.g. USCIS A-File 012345678" />
            </FIELD>
            <FIELD label="Reference ID / URL">
              <input style={INPUT_STYLE} value={form[`${prefix}_ref`]} onChange={e => set(`${prefix}_ref`, e.target.value)} placeholder="ID, URL, or catalog number" />
            </FIELD>
            <FIELD label="Excerpt (key text)">
              <textarea style={{ ...INPUT_STYLE, minHeight: 60, resize: "vertical" }}
                value={form[`${prefix}_excerpt`]} onChange={e => set(`${prefix}_excerpt`, e.target.value)}
                placeholder="Paste the relevant passage..." />
            </FIELD>
          </div>
        ))}
      </div>

      {/* Match metadata */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FIELD label="Matching Fields (what links them)">
          <input style={INPUT_STYLE} value={form.match_fields} onChange={e => set("match_fields", e.target.value)} placeholder="e.g. Full name, DOB, service branch, A-File number" />
        </FIELD>
        <FIELD label={`Match Confidence: ${form.match_confidence}%`}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="range" min={0} max={100} value={form.match_confidence}
              onChange={e => set("match_confidence", e.target.value)}
              style={{ flex: 1, accentColor: confidenceColor }} />
            <span style={{ fontSize: 14, fontWeight: 800, color: confidenceColor, minWidth: 40 }}>{form.match_confidence}</span>
          </div>
        </FIELD>
      </div>

      <FIELD label="Analyst Note">
        <textarea style={{ ...INPUT_STYLE, minHeight: 70, resize: "vertical" }}
          value={form.analyst_note} onChange={e => set("analyst_note", e.target.value)}
          placeholder="Observations, caveats, next steps..." />
      </FIELD>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FIELD label="Review State">
          <select style={SELECT_STYLE} value={form.review_state} onChange={e => set("review_state", e.target.value)}>
            {["Draft", "Under Review", "Confirmed", "Disputed", "Archived"].map(s => <option key={s}>{s}</option>)}
          </select>
        </FIELD>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        {onCancel && (
          <button type="button" onClick={onCancel}
            style={{ padding: "8px 20px", background: "transparent", border: `1px solid ${P.b}`, borderRadius: 6, color: P.t3, fontSize: 10, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>
            Cancel
          </button>
        )}
        <button type="submit" disabled={saving}
          style={{ padding: "8px 24px", background: `${P.teal}22`, border: `1px solid ${P.teal}`, borderRadius: 6, color: P.teal, fontSize: 10, fontWeight: 800, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving…" : "Save Evidence Link"}
        </button>
      </div>
    </form>
  );
}