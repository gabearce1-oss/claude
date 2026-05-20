import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { P } from "../../lib/teData";

const RISK_COLORS = {
  "None": P.teal,
  "No Veteran Contact Logged": P.amber,
  "Subject Missing – Last Known Location": P.red,
  "Needs Follow-Up": P.gold,
};

const TYPE_ICONS = {
  "Veteran Resource Center": "🎖️",
  "General Migrant Shelter": "🏠",
  "Faith-Based Shelter": "⛪",
  "Government Reception Center": "🏛️",
  "Legal Aid Organization": "⚖️",
  "Health / Mental Health Clinic": "🏥",
  "NGO / Advocacy": "📣",
  "University / Research": "🎓",
  "Other": "📍",
};

const VERIFY_COLORS = {
  "Verified Public": P.teal,
  "Unverified – Needs Confirmation": P.amber,
  "Inactive / Closed": P.t4,
};

function Badge({ color, children }) {
  return (
    <span style={{ fontSize: 7, padding: "2px 7px", borderRadius: 4, fontWeight: 700,
      background: `${color}15`, border: `1px solid ${color}30`, color }}>
      {children}
    </span>
  );
}

function ShelterForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    city: "", state_region: "Baja California", country: "Mexico",
    provider_type: "General Migrant Shelter",
    verification_status: "Unverified – Needs Confirmation",
    risk_flag: "None",
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const inp = () => ({
    padding: "5px 8px", background: "#080D18", border: `1px solid ${P.b}`,
    borderRadius: 5, color: P.t1, fontSize: 9, fontFamily: "'IBM Plex Mono',monospace",
    outline: "none", width: "100%"
  });

  return (
    <div style={{ background: P.card, border: `1px solid ${P.teal}35`, borderRadius: 10, padding: 18, marginBottom: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: P.teal, marginBottom: 14 }}>
        {initial?.id ? "Edit Shelter Record" : "Register Mexico Shelter"}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
        {[
          ["Shelter ID", "shelter_id"], ["Organization Name", "organization_name"],
          ["City", "city"], ["Address", "address"],
          ["URL", "url"], ["Phone", "phone"],
          ["Email", "email"], ["Known AUMER Subject IDs", "known_subjects_served"],
        ].map(([label, key]) => (
          <div key={key}>
            <div style={{ fontSize: 7, color: P.t4, marginBottom: 3, textTransform: "uppercase" }}>{label}</div>
            <input value={form[key] || ""} onChange={e => set(key, e.target.value)}
              style={inp()} placeholder={label} />
          </div>
        ))}

        <div>
          <div style={{ fontSize: 7, color: P.t4, marginBottom: 3, textTransform: "uppercase" }}>State / Region</div>
          <select value={form.state_region || "Baja California"} onChange={e => set("state_region", e.target.value)}
            style={inp()}>
            {["Baja California","Sonora","Chihuahua","Coahuila","Tamaulipas","Nuevo León","Other"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <div style={{ fontSize: 7, color: P.t4, marginBottom: 3, textTransform: "uppercase" }}>Provider Type</div>
          <select value={form.provider_type} onChange={e => set("provider_type", e.target.value)}
            style={inp()}>
            {Object.keys(TYPE_ICONS).map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <div style={{ fontSize: 7, color: P.t4, marginBottom: 3, textTransform: "uppercase" }}>Verification Status</div>
          <select value={form.verification_status} onChange={e => set("verification_status", e.target.value)}
            style={inp()}>
            {["Verified Public","Unverified – Needs Confirmation","Inactive / Closed"].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>

        <div>
          <div style={{ fontSize: 7, color: P.t4, marginBottom: 3, textTransform: "uppercase" }}>Risk Flag</div>
          <select value={form.risk_flag || "None"} onChange={e => set("risk_flag", e.target.value)}
            style={inp()}>
            {Object.keys(RISK_COLORS).map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <div style={{ fontSize: 7, color: P.t4, marginBottom: 3, textTransform: "uppercase" }}>Data Source</div>
          <select value={form.data_source || "Other"} onChange={e => set("data_source", e.target.value)}
            style={inp()}>
            {["Cross-Border Blueprint (verified)","COMAR Portal","OMI Shelter Directory","CNDH Report","Municipal Portal","Field Report","Self-Reported","Other"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        {[
          ["IMSS / Seguro Social Notes", "imss_seguro_social_link"],
          ["INE / IFE Notes", "ife_ine_link"],
          ["COMAR Notes", "comar_link"],
          ["INM Notes", "inm_link"],
        ].map(([label, key]) => (
          <div key={key}>
            <div style={{ fontSize: 7, color: P.t4, marginBottom: 3, textTransform: "uppercase" }}>{label}</div>
            <input value={form[key] || ""} onChange={e => set(key, e.target.value)}
              style={inp()} placeholder={label} />
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 14 }}>
        {[
          ["Veteran Specific", "veteran_specific"],
          ["Housing Available", "housing_available"],
          ["Legal Services", "legal_services"],
          ["Mental Health / Medical", "mental_health_services"],
          ["Repatriation Support", "repatriation_support"],
        ].map(([label, key]) => (
          <label key={key} style={{ display: "flex", gap: 6, alignItems: "center", cursor: "pointer" }}>
            <input type="checkbox" checked={!!form[key]} onChange={e => set(key, e.target.checked)}
              style={{ accentColor: P.teal }} />
            <span style={{ fontSize: 8, color: P.t2 }}>{label}</span>
          </label>
        ))}
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 7, color: P.t4, marginBottom: 3, textTransform: "uppercase" }}>Services Offered</div>
        <textarea value={form.services_offered || ""} onChange={e => set("services_offered", e.target.value)}
          style={{ ...inp(), height: 50, resize: "vertical" }} placeholder="Describe services..." />
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 7, color: P.t4, marginBottom: 3, textTransform: "uppercase" }}>Research Notes</div>
        <textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)}
          style={{ ...inp(), height: 50, resize: "vertical" }} />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onSave(form)}
          style={{ padding: "7px 18px", background: `linear-gradient(135deg,${P.teal},${P.blue})`,
            color: "#fff", border: "none", borderRadius: 7, fontSize: 10, fontWeight: 800,
            cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace" }}>
          Save Shelter
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

export default function MexicoShelterPanel() {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterVerify, setFilterVerify] = useState("All");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    base44.entities.MexicoShelterRegistry.list("-created_date", 200)
      .then(setShelters).finally(() => setLoading(false));
  }, []);

  const reload = () => base44.entities.MexicoShelterRegistry.list("-created_date", 200).then(setShelters);

  const handleSave = async (form) => {
    if (editItem?.id) {
      await base44.entities.MexicoShelterRegistry.update(editItem.id, form);
    } else {
      await base44.entities.MexicoShelterRegistry.create(form);
    }
    setShowForm(false);
    setEditItem(null);
    reload();
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this shelter record?")) {
      await base44.entities.MexicoShelterRegistry.delete(id);
      reload();
    }
  };

  const STATES = ["All","Baja California","Sonora","Chihuahua","Coahuila","Tamaulipas","Nuevo León","Other"];
  const TYPES = ["All", ...Object.keys(TYPE_ICONS)];
  const VERIFIES = ["All","Verified Public","Unverified – Needs Confirmation","Inactive / Closed"];

  const filtered = shelters.filter(s => {
    const matchSearch = !search || s.organization_name?.toLowerCase().includes(search.toLowerCase())
      || s.city?.toLowerCase().includes(search.toLowerCase());
    const matchState = filterState === "All" || s.state_region === filterState;
    const matchType = filterType === "All" || s.provider_type === filterType;
    const matchVerify = filterVerify === "All" || s.verification_status === filterVerify;
    return matchSearch && matchState && matchType && matchVerify;
  });

  const flaggedCount = shelters.filter(s => s.risk_flag && s.risk_flag !== "None").length;
  const veteranCount = shelters.filter(s => s.veteran_specific).length;
  const verifiedCount = shelters.filter(s => s.verification_status === "Verified Public").length;

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 4 }}>
          AUMER DATABASE · MEXICO SHELTER REGISTRY
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: P.t1, margin: 0 }}>
          Mexico Shelter & Service Registry
        </h1>
        <p style={{ fontSize: 9, color: P.t3, marginTop: 5 }}>
          Verified public providers · IMSS/INE/COMAR coordination · Veteran-specific nodes · Case risk flags
        </p>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 7, marginBottom: 14 }}>
        {[
          { l: "Total Shelters", v: shelters.length, c: P.blue },
          { l: "Verified Public", v: verifiedCount, c: P.teal },
          { l: "Veteran-Specific", v: veteranCount, c: P.gold },
          { l: "Risk Flagged", v: flaggedCount, c: P.red },
          { l: "Baja California", v: shelters.filter(s => s.state_region === "Baja California").length, c: P.violet },
          { l: "Sonora", v: shelters.filter(s => s.state_region === "Sonora").length, c: P.amber },
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
          placeholder="Search shelter name, city..."
          style={{ padding: "6px 12px", background: "#080D18", border: `1px solid ${search ? P.gold : P.b}`,
            borderRadius: 20, color: P.t1, fontSize: 8, outline: "none", width: 200,
            fontFamily: "'IBM Plex Mono',monospace" }} />
        {[["State", STATES, filterState, setFilterState], ["Type", TYPES, filterType, setFilterType],
          ["Verify", VERIFIES, filterVerify, setFilterVerify]].map(([label, opts, val, setVal]) => (
          <select key={label} value={val} onChange={e => setVal(e.target.value)}
            style={{ padding: "6px 10px", background: "#080D18", border: `1px solid ${P.b}`,
              borderRadius: 6, color: P.t1, fontSize: 8, outline: "none",
              fontFamily: "'IBM Plex Mono',monospace" }}>
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
        <span style={{ fontSize: 7, color: P.t4, marginLeft: "auto" }}>{filtered.length} shelters</span>
        <button onClick={() => { setShowForm(true); setEditItem(null); }}
          style={{ padding: "6px 16px", background: `${P.teal}20`, border: `1px solid ${P.teal}`,
            color: P.teal, borderRadius: 7, fontSize: 9, fontWeight: 800, cursor: "pointer",
            fontFamily: "'IBM Plex Mono',monospace" }}>
          + Register Shelter
        </button>
      </div>

      {showForm && (
        <ShelterForm
          initial={editItem}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditItem(null); }}
        />
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 30, color: P.t4 }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, border: `1px dashed ${P.b}`, borderRadius: 10, color: P.t4 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🏠</div>
          <div>No shelters registered yet. Click "+ Register Shelter" to add.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 10 }}>
          {filtered.map(s => {
            const riskColor = RISK_COLORS[s.risk_flag] || P.t4;
            const verifyColor = VERIFY_COLORS[s.verification_status] || P.t4;
            const isExp = expanded === s.id;

            return (
              <div key={s.id}
                style={{ background: P.card, border: `1px solid ${verifyColor}30`,
                  borderTop: `3px solid ${verifyColor}`, borderRadius: 9, padding: "12px 14px" }}>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 20 }}>{TYPE_ICONS[s.provider_type] || "📍"}</span>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, lineHeight: 1.3 }}>{s.organization_name}</div>
                      <div style={{ fontSize: 8, color: P.t4 }}>{s.city}, {s.state_region}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => setExpanded(isExp ? null : s.id)}
                      style={{ padding: "2px 7px", background: "transparent", border: `1px solid ${P.b}`,
                        color: P.t4, borderRadius: 4, fontSize: 8, cursor: "pointer" }}>
                      {isExp ? "▲" : "▼"}
                    </button>
                    <button onClick={() => { setEditItem(s); setShowForm(true); }}
                      style={{ padding: "2px 7px", background: `${P.blue}15`, border: `1px solid ${P.blue}30`,
                        color: P.blue, borderRadius: 4, fontSize: 8, cursor: "pointer" }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(s.id)}
                      style={{ padding: "2px 7px", background: `${P.red}10`, border: `1px solid ${P.red}25`,
                        color: P.red, borderRadius: 4, fontSize: 8, cursor: "pointer" }}>
                      Del
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                  <Badge color={verifyColor}>{s.verification_status}</Badge>
                  {s.veteran_specific && <Badge color={P.gold}>VETERAN-SPECIFIC</Badge>}
                  {s.risk_flag && s.risk_flag !== "None" && <Badge color={riskColor}>{s.risk_flag}</Badge>}
                  {s.legal_services && <Badge color={P.blue}>LEGAL</Badge>}
                  {s.housing_available && <Badge color={P.teal}>HOUSING</Badge>}
                  {s.mental_health_services && <Badge color={P.violet}>HEALTH</Badge>}
                </div>

                {s.services_offered && (
                  <div style={{ fontSize: 8, color: P.t3, marginBottom: 6, lineHeight: 1.5 }}>
                    {s.services_offered.slice(0, 120)}{s.services_offered.length > 120 ? "..." : ""}
                  </div>
                )}

                {s.url && (
                  <a href={s.url} target="_blank" rel="noreferrer"
                    style={{ fontSize: 7, color: P.blue, textDecoration: "none" }}>
                    🔗 {s.url.replace(/^https?:\/\//, "").slice(0, 40)}
                  </a>
                )}

                {isExp && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${P.b}30` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                      {[
                        ["Phone", s.phone], ["Email", s.email],
                        ["IMSS / Seguro Social", s.imss_seguro_social_link],
                        ["INE / IFE", s.ife_ine_link],
                        ["COMAR", s.comar_link], ["INM", s.inm_link],
                        ["Data Source", s.data_source],
                        ["Known AUMER Subjects", s.known_subjects_served],
                      ].filter(([, v]) => v).map(([label, val]) => (
                        <div key={label} style={{ background: "#080D18", borderRadius: 5, padding: "5px 8px" }}>
                          <div style={{ fontSize: 6, color: P.t4, textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                          <div style={{ fontSize: 8, color: P.t1 }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    {s.notes && (
                      <div style={{ fontSize: 8, color: P.t2, lineHeight: 1.6,
                        background: "#080D18", padding: "7px 9px", borderRadius: 5 }}>
                        {s.notes}
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