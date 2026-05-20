import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { P } from "../../../lib/teData";

const INPUT_STYLE = { width: "100%", background: "#0B0E14", border: `1px solid #1e2d4a`, borderRadius: 6, padding: "7px 10px", color: "#F0F4FF", fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", outline: "none", boxSizing: "border-box" };
const SELECT_STYLE = { ...INPUT_STYLE, cursor: "pointer" };

const FIELD = ({ label, children }) => (
  <div>
    <div style={{ fontSize: 8, color: "#4B5A7A", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>{label}</div>
    {children}
  </div>
);

export default function CaseFileForm({ onSaved, onCancel }) {
  const today = new Date().toISOString().split("T")[0];
  const nextId = `CF-${String(Date.now()).slice(-4)}`;

  const [form, setForm] = useState({
    case_id: nextId,
    subject_name: "",
    subject_aliases: "",
    dob: "",
    birth_country: "",
    service_branch: "Unknown",
    service_years: "",
    status: "Active",
    priority: "Medium",
    summary: "",
    dcas_match: false,
    uscis_afile: "",
    deportation_confirmed: false,
    analyst_owner: "",
    tags: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await base44.entities.CaseFile.create(form);
    setSaving(false);
    onSaved?.();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <FIELD label="Case ID"><input style={INPUT_STYLE} value={form.case_id} onChange={e => set("case_id", e.target.value)} required /></FIELD>
        <FIELD label="Subject Full Name"><input style={INPUT_STYLE} value={form.subject_name} onChange={e => set("subject_name", e.target.value)} required /></FIELD>
        <FIELD label="Known Aliases"><input style={INPUT_STYLE} value={form.subject_aliases} onChange={e => set("subject_aliases", e.target.value)} placeholder="Optional" /></FIELD>
        <FIELD label="Date of Birth"><input type="date" style={INPUT_STYLE} value={form.dob} onChange={e => set("dob", e.target.value)} /></FIELD>
        <FIELD label="Birth Country"><input style={INPUT_STYLE} value={form.birth_country} onChange={e => set("birth_country", e.target.value)} /></FIELD>
        <FIELD label="USCIS A-File #"><input style={INPUT_STYLE} value={form.uscis_afile} onChange={e => set("uscis_afile", e.target.value)} /></FIELD>
        <FIELD label="Service Branch">
          <select style={SELECT_STYLE} value={form.service_branch} onChange={e => set("service_branch", e.target.value)}>
            {["Army","Navy","Marine Corps","Air Force","Coast Guard","National Guard","Unknown"].map(b => <option key={b}>{b}</option>)}
          </select>
        </FIELD>
        <FIELD label="Service Years"><input style={INPUT_STYLE} value={form.service_years} onChange={e => set("service_years", e.target.value)} placeholder="e.g. 1968–1972" /></FIELD>
        <FIELD label="Priority">
          <select style={SELECT_STYLE} value={form.priority} onChange={e => set("priority", e.target.value)}>
            {["Critical","High","Medium","Low"].map(p => <option key={p}>{p}</option>)}
          </select>
        </FIELD>
      </div>
      <FIELD label="Case Summary">
        <textarea style={{ ...INPUT_STYLE, minHeight: 70, resize: "vertical" }} value={form.summary} onChange={e => set("summary", e.target.value)} placeholder="Brief narrative of the case..." />
      </FIELD>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <FIELD label="Assigned Analyst"><input style={INPUT_STYLE} value={form.analyst_owner} onChange={e => set("analyst_owner", e.target.value)} /></FIELD>
        <FIELD label="Tags (comma-separated)"><input style={INPUT_STYLE} value={form.tags} onChange={e => set("tags", e.target.value)} /></FIELD>
        <FIELD label="Status">
          <select style={SELECT_STYLE} value={form.status} onChange={e => set("status", e.target.value)}>
            {["Active","Under Review","Closed – Confirmed","Closed – Unverified","Archived"].map(s => <option key={s}>{s}</option>)}
          </select>
        </FIELD>
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        {[["dcas_match","DCAS Match Found"],["deportation_confirmed","Deportation Confirmed"]].map(([k,l]) => (
          <label key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: P.t3, cursor: "pointer" }}>
            <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)} style={{ accentColor: P.teal }} />
            {l}
          </label>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        {onCancel && <button type="button" onClick={onCancel} style={{ padding: "8px 20px", background: "transparent", border: `1px solid ${P.b}`, borderRadius: 6, color: P.t3, fontSize: 10, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>Cancel</button>}
        <button type="submit" disabled={saving} style={{ padding: "8px 24px", background: `${P.gold}22`, border: `1px solid ${P.gold}`, borderRadius: 6, color: P.gold, fontSize: 10, fontWeight: 800, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving…" : "Create Case File"}
        </button>
      </div>
    </form>
  );
}