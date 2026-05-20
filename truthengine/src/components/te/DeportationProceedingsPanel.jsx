import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { P } from "../../lib/teData";

const CHARGE_COLORS = {
  "Aggravated Felony – Drug": P.red,
  "Aggravated Felony – Violence": P.red,
  "Aggravated Felony – Other": P.red,
  "Controlled Substance": P.amber,
  "Crime Involving Moral Turpitude": P.amber,
  "Firearms": P.amber,
  "Document Fraud": P.gold,
  "Unlawful Presence": P.teal,
  "Public Charge": P.teal,
  "National Security": P.red,
  "Other": P.t4,
};

const REVIEW_COLORS = {
  "Draft": P.t4,
  "Under Review": P.amber,
  "Confirmed": P.teal,
  "Disputed": P.red,
  "Archived": P.t4,
};

function Badge({ color, children }) {
  return (
    <span style={{
      fontSize: 7, padding: "2px 8px", borderRadius: 4, fontWeight: 800,
      background: `${color}18`, border: `1px solid ${color}40`, color,
      whiteSpace: "nowrap"
    }}>
      {children}
    </span>
  );
}

function BoolCell({ val, trueLabel = "Yes", falseLabel = "No" }) {
  if (val === undefined || val === null) return <span style={{ color: P.t4 }}>—</span>;
  return (
    <span style={{ color: val ? P.teal : P.t4, fontWeight: val ? 700 : 400 }}>
      {val ? trueLabel : falseLabel}
    </span>
  );
}

function ProceedingForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    case_file_id: "", subject_name: "", charge_type: "Other",
    review_state: "Draft", confidence_score: 50,
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const CHARGES = [
    "Aggravated Felony – Drug","Aggravated Felony – Violence","Aggravated Felony – Other",
    "Controlled Substance","Crime Involving Moral Turpitude","Firearms",
    "Document Fraud","Unlawful Presence","Public Charge","National Security","Other"
  ];
  const APPEALS = ["Pending","Denied","Granted – Relief","Granted – Remand","Withdrawn","N/A"];
  const ICE_HQ = ["Bypassed (no review)","Reviewed – Deportation Ordered","Reviewed – Deferred","Reviewed – Terminated","Unknown"];
  const REVIEWS = ["Draft","Under Review","Confirmed","Disputed","Archived"];

  const inp = (style) => ({
    padding: "5px 8px", background: "#080D18", border: `1px solid ${P.b}`,
    borderRadius: 5, color: P.t1, fontSize: 9, fontFamily: "'IBM Plex Mono',monospace",
    outline: "none", ...style
  });

  return (
    <div style={{ background: P.card, border: `1px solid ${P.gold}35`, borderRadius: 10, padding: 18, marginBottom: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: P.gold, marginBottom: 14 }}>
        {initial?.id ? "Edit Proceeding" : "Log New Deportation Proceeding"}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
        {[
          ["Case File ID", "case_file_id"], ["Subject Name", "subject_name"],
          ["EOIR Case #", "eoir_case_number"], ["Charge Statute", "charge_statute"],
          ["Court Location", "court_location"], ["Attorney of Record", "attorney_of_record"],
          ["Destination Country", "destination_country"], ["Destination Region", "destination_state_region"],
          ["Source Documents", "source_documents"],
        ].map(([label, key]) => (
          <div key={key}>
            <div style={{ fontSize: 7, color: P.t4, marginBottom: 3, textTransform: "uppercase" }}>{label}</div>
            <input value={form[key] || ""} onChange={e => set(key, e.target.value)}
              style={{ ...inp(), width: "100%" }} placeholder={label} />
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
        {[["NTA Issued", "nta_issued_date"], ["Initial Hearing", "initial_hearing_date"],
          ["Removal Order", "removal_order_date"], ["Deportation Date", "deportation_date"]].map(([label, key]) => (
          <div key={key}>
            <div style={{ fontSize: 7, color: P.t4, marginBottom: 3, textTransform: "uppercase" }}>{label}</div>
            <input type="date" value={form[key] || ""} onChange={e => set(key, e.target.value)}
              style={{ ...inp(), width: "100%" }} />
          </div>
        ))}

        <div>
          <div style={{ fontSize: 7, color: P.t4, marginBottom: 3, textTransform: "uppercase" }}>Charge Type</div>
          <select value={form.charge_type || "Other"} onChange={e => set("charge_type", e.target.value)}
            style={{ ...inp(), width: "100%" }}>
            {CHARGES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <div style={{ fontSize: 7, color: P.t4, marginBottom: 3, textTransform: "uppercase" }}>Appeal Outcome</div>
          <select value={form.appeal_outcome || "N/A"} onChange={e => set("appeal_outcome", e.target.value)}
            style={{ ...inp(), width: "100%" }}>
            {APPEALS.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>

        <div>
          <div style={{ fontSize: 7, color: P.t4, marginBottom: 3, textTransform: "uppercase" }}>ICE HQ Review</div>
          <select value={form.ice_hq_review || "Unknown"} onChange={e => set("ice_hq_review", e.target.value)}
            style={{ ...inp(), width: "100%" }}>
            {ICE_HQ.map(x => <option key={x}>{x}</option>)}
          </select>
        </div>

        <div>
          <div style={{ fontSize: 7, color: P.t4, marginBottom: 3, textTransform: "uppercase" }}>Review State</div>
          <select value={form.review_state || "Draft"} onChange={e => set("review_state", e.target.value)}
            style={{ ...inp(), width: "100%" }}>
            {REVIEWS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <div style={{ fontSize: 7, color: P.t4, marginBottom: 3, textTransform: "uppercase" }}>Confidence (0–100)</div>
          <input type="number" min="0" max="100" value={form.confidence_score || 50}
            onChange={e => set("confidence_score", Number(e.target.value))}
            style={{ ...inp(), width: "100%" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
        {[
          ["Retroactive IIRIRA", "retroactive_iirira"],
          ["Judicial Discretion Available", "judicial_discretion_available"],
          ["Judicial Discretion Exercised", "judicial_discretion_exercised"],
          ["Appeal Filed", "appeal_filed"],
          ["PD Requested", "prosecutorial_discretion_requested"],
          ["PD Granted", "prosecutorial_discretion_granted"],
          ["Military Service Raised", "military_service_raised"],
          ["INA §329 Claim", "ina_329_claim"],
        ].map(([label, key]) => (
          <label key={key} style={{ display: "flex", gap: 6, alignItems: "center", cursor: "pointer" }}>
            <input type="checkbox" checked={!!form[key]}
              onChange={e => set(key, e.target.checked)}
              style={{ accentColor: P.gold }} />
            <span style={{ fontSize: 8, color: P.t2 }}>{label}</span>
          </label>
        ))}
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 7, color: P.t4, marginBottom: 3, textTransform: "uppercase" }}>Analyst Notes</div>
        <textarea value={form.analyst_notes || ""} onChange={e => set("analyst_notes", e.target.value)}
          style={{ ...inp(), width: "100%", height: 60, resize: "vertical" }}
          placeholder="Notes on this proceeding..." />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onSave(form)}
          style={{ padding: "7px 18px", background: `linear-gradient(135deg,${P.teal},${P.blue})`,
            color: "#fff", border: "none", borderRadius: 7, fontSize: 10, fontWeight: 800,
            cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace" }}>
          Save Proceeding
        </button>
        <button onClick={onCancel}
          style={{ padding: "7px 14px", background: "transparent", border: `1px solid ${P.b}`,
            color: P.t4, borderRadius: 7, fontSize: 10, cursor: "pointer",
            fontFamily: "'IBM Plex Mono',monospace" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function DeportationProceedingsPanel() {
  const [proceedings, setProceedings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCharge, setFilterCharge] = useState("All");
  const [filterReview, setFilterReview] = useState("All");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    base44.entities.DeportationProceeding.list("-created_date", 100)
      .then(setProceedings).finally(() => setLoading(false));
  }, []);

  const reload = () => base44.entities.DeportationProceeding.list("-created_date", 100).then(setProceedings);

  const handleSave = async (form) => {
    if (editItem?.id) {
      await base44.entities.DeportationProceeding.update(editItem.id, form);
    } else {
      await base44.entities.DeportationProceeding.create(form);
    }
    setShowForm(false);
    setEditItem(null);
    reload();
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this proceeding?")) {
      await base44.entities.DeportationProceeding.delete(id);
      reload();
    }
  };

  const CHARGES = ["All","Aggravated Felony – Drug","Aggravated Felony – Violence","Aggravated Felony – Other",
    "Controlled Substance","Crime Involving Moral Turpitude","Firearms","Document Fraud",
    "Unlawful Presence","Public Charge","National Security","Other"];
  const REVIEWS = ["All","Draft","Under Review","Confirmed","Disputed","Archived"];

  const filtered = proceedings.filter(p => {
    const matchSearch = !search || p.subject_name?.toLowerCase().includes(search.toLowerCase())
      || p.case_file_id?.toLowerCase().includes(search.toLowerCase())
      || p.eoir_case_number?.toLowerCase().includes(search.toLowerCase());
    const matchCharge = filterCharge === "All" || p.charge_type === filterCharge;
    const matchReview = filterReview === "All" || p.review_state === filterReview;
    return matchSearch && matchCharge && matchReview;
  });

  const retroCount = proceedings.filter(p => p.retroactive_iirira).length;
  const militaryCount = proceedings.filter(p => p.military_service_raised).length;
  const ina329Count = proceedings.filter(p => p.ina_329_claim).length;
  const bypassedCount = proceedings.filter(p => p.ice_hq_review === "Bypassed (no review)").length;

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1 }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 4 }}>
          FORENSIC CASE RECORDS · DEPORTATION PROCEEDINGS
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: P.t1, margin: 0 }}>
          Deportation Proceedings & Charges
        </h1>
        <p style={{ fontSize: 9, color: P.t3, marginTop: 5 }}>
          EOIR case records · Charge tracking · Removal order dates · INA §329 & IIRIRA retroactivity flags
        </p>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 7, marginBottom: 14 }}>
        {[
          { l: "Total Proceedings", v: proceedings.length, c: P.blue },
          { l: "Retroactive IIRIRA", v: retroCount, c: P.red },
          { l: "Military Service Raised", v: militaryCount, c: P.gold },
          { l: "INA §329 Claims", v: ina329Count, c: P.teal },
          { l: "ICE HQ Bypassed", v: bypassedCount, c: P.red },
          { l: "Confirmed Records", v: proceedings.filter(p => p.review_state === "Confirmed").length, c: P.teal },
        ].map((s, i) => (
          <div key={i} style={{ background: P.card, border: `1px solid ${s.c}25`, borderLeft: `3px solid ${s.c}`, borderRadius: 7, padding: "8px 12px" }}>
            <div style={{ fontSize: 6, color: P.t4, marginBottom: 2 }}>{s.l}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by subject, case ID, EOIR #..."
          style={{ padding: "6px 12px", background: "#080D18", border: `1px solid ${search ? P.gold : P.b}`,
            borderRadius: 20, color: P.t1, fontSize: 8, outline: "none", width: 220,
            fontFamily: "'IBM Plex Mono',monospace" }} />
        <select value={filterCharge} onChange={e => setFilterCharge(e.target.value)}
          style={{ padding: "6px 10px", background: "#080D18", border: `1px solid ${P.b}`,
            borderRadius: 6, color: P.t1, fontSize: 8, outline: "none",
            fontFamily: "'IBM Plex Mono',monospace" }}>
          {CHARGES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterReview} onChange={e => setFilterReview(e.target.value)}
          style={{ padding: "6px 10px", background: "#080D18", border: `1px solid ${P.b}`,
            borderRadius: 6, color: P.t1, fontSize: 8, outline: "none",
            fontFamily: "'IBM Plex Mono',monospace" }}>
          {REVIEWS.map(r => <option key={r}>{r}</option>)}
        </select>
        <span style={{ fontSize: 7, color: P.t4, marginLeft: "auto" }}>{filtered.length} records</span>
        <button onClick={() => { setShowForm(true); setEditItem(null); }}
          style={{ padding: "6px 16px", background: `${P.teal}20`, border: `1px solid ${P.teal}`,
            color: P.teal, borderRadius: 7, fontSize: 9, fontWeight: 800, cursor: "pointer",
            fontFamily: "'IBM Plex Mono',monospace" }}>
          + Log Proceeding
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <ProceedingForm
          initial={editItem}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditItem(null); }}
        />
      )}

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 30, color: P.t4 }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, border: `1px dashed ${P.b}`, borderRadius: 10, color: P.t4 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⚖️</div>
          <div style={{ fontSize: 11 }}>No proceedings logged yet. Click "+ Log Proceeding" to add one.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(p => {
            const chargeColor = CHARGE_COLORS[p.charge_type] || P.t4;
            const isExp = expanded === p.id;
            return (
              <div key={p.id}
                style={{ background: P.card, border: `1px solid ${chargeColor}30`,
                  borderLeft: `4px solid ${chargeColor}`, borderRadius: 9, padding: "12px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 5 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: P.gold }}>{p.case_file_id}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: P.t1 }}>{p.subject_name}</span>
                      <Badge color={chargeColor}>{p.charge_type}</Badge>
                      <Badge color={REVIEW_COLORS[p.review_state] || P.t4}>{p.review_state}</Badge>
                      {p.retroactive_iirira && <Badge color={P.red}>IIRIRA RETROACTIVE</Badge>}
                      {p.military_service_raised && <Badge color={P.gold}>MILITARY SVC RAISED</Badge>}
                      {p.ina_329_claim && <Badge color={P.teal}>INA §329</Badge>}
                      {p.ice_hq_review === "Bypassed (no review)" && <Badge color={P.red}>ICE HQ BYPASSED</Badge>}
                    </div>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 8, color: P.t3 }}>
                      {p.eoir_case_number && <span>EOIR: {p.eoir_case_number}</span>}
                      {p.deportation_date && <span>Deported: {p.deportation_date}</span>}
                      {p.removal_order_date && <span>Order: {p.removal_order_date}</span>}
                      {p.destination_country && <span>→ {p.destination_country}{p.destination_state_region ? `, ${p.destination_state_region}` : ""}</span>}
                      {p.confidence_score != null && (
                        <span style={{ color: p.confidence_score >= 70 ? P.teal : p.confidence_score >= 40 ? P.amber : P.red }}>
                          Confidence: {p.confidence_score}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 10 }}>
                    <button onClick={() => setExpanded(isExp ? null : p.id)}
                      style={{ padding: "3px 8px", background: "transparent", border: `1px solid ${P.b}`,
                        color: P.t4, borderRadius: 5, fontSize: 8, cursor: "pointer" }}>
                      {isExp ? "▲" : "▼"}
                    </button>
                    <button onClick={() => { setEditItem(p); setShowForm(true); }}
                      style={{ padding: "3px 8px", background: `${P.blue}15`, border: `1px solid ${P.blue}30`,
                        color: P.blue, borderRadius: 5, fontSize: 8, cursor: "pointer" }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p.id)}
                      style={{ padding: "3px 8px", background: `${P.red}10`, border: `1px solid ${P.red}25`,
                        color: P.red, borderRadius: 5, fontSize: 8, cursor: "pointer" }}>
                      Del
                    </button>
                  </div>
                </div>

                {isExp && (
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${P.b}30` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 10 }}>
                      {[
                        ["NTA Issued", p.nta_issued_date],
                        ["Initial Hearing", p.initial_hearing_date],
                        ["Removal Order", p.removal_order_date],
                        ["Deportation Date", p.deportation_date],
                        ["Court", p.court_location],
                        ["Charge Statute", p.charge_statute],
                        ["Attorney", p.attorney_of_record],
                        ["Appeal Outcome", p.appeal_outcome],
                        ["ICE HQ Review", p.ice_hq_review],
                      ].filter(([, v]) => v).map(([label, val]) => (
                        <div key={label} style={{ background: "#080D18", borderRadius: 5, padding: "6px 9px" }}>
                          <div style={{ fontSize: 6, color: P.t4, marginBottom: 2, textTransform: "uppercase" }}>{label}</div>
                          <div style={{ fontSize: 9, color: P.t1 }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                      {[
                        ["Retroactive IIRIRA", p.retroactive_iirira],
                        ["Judicial Discretion Avail.", p.judicial_discretion_available],
                        ["Judicial Discretion Used", p.judicial_discretion_exercised],
                        ["Appeal Filed", p.appeal_filed],
                        ["PD Requested", p.prosecutorial_discretion_requested],
                        ["PD Granted", p.prosecutorial_discretion_granted],
                        ["Military Svc Raised", p.military_service_raised],
                        ["INA §329 Claim", p.ina_329_claim],
                      ].map(([label, val]) => (
                        <div key={label} style={{ fontSize: 7, padding: "2px 8px", borderRadius: 4,
                          background: val ? `${P.teal}12` : `${P.t4}10`,
                          border: `1px solid ${val ? P.teal : P.b}30`,
                          color: val ? P.teal : P.t4 }}>
                          {label}: <strong>{val ? "YES" : "NO"}</strong>
                        </div>
                      ))}
                    </div>
                    {p.analyst_notes && (
                      <div style={{ fontSize: 8, color: P.t2, lineHeight: 1.7,
                        background: "#080D18", padding: "8px 10px", borderRadius: 6 }}>
                        <strong style={{ color: P.gold }}>Notes:</strong> {p.analyst_notes}
                      </div>
                    )}
                    {p.source_documents && (
                      <div style={{ fontSize: 8, color: P.t3, marginTop: 6 }}>
                        <strong>Sources:</strong> {p.source_documents}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}