import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";
import { base44 } from "@/api/base44Client";
import { P } from "../../lib/teData";
import "leaflet/dist/leaflet.css";

// ─── FALLBACK COORDS ─────────────────────────────────────────────────────────
// City-level fallbacks for shelters without lat/lng in db
const CITY_COORDS = {
  "Tijuana":         [32.5149, -117.0382],
  "Mexicali":        [32.6245, -115.4523],
  "Ensenada":        [31.8676, -116.5960],
  "Nogales":         [31.3139, -110.9477],
  "Hermosillo":      [29.0729, -110.9559],
  "Ciudad Juárez":   [31.6904, -106.4245],
  "Monterrey":       [25.6866, -100.3161],
  "Nuevo Laredo":    [27.4769, -99.5154],
  "Matamoros":       [25.8690, -97.5026],
  "Reynosa":         [26.0922, -98.2773],
  "Piedras Negras":  [28.7044, -100.5237],
  "Saltillo":        [25.4232, -100.9963],
  "Chihuahua":       [28.6353, -106.0889],
};

const STATE_COORDS = {
  "Baja California": [32.2, -117.1],
  "Sonora":          [29.5, -110.9],
  "Chihuahua":       [28.6, -106.0],
  "Coahuila":        [27.3, -102.0],
  "Tamaulipas":      [24.3, -98.8],
  "Nuevo León":      [25.7, -99.5],
};

function getCoords(shelter) {
  if (shelter.latitude && shelter.longitude)
    return [shelter.latitude, shelter.longitude];
  if (CITY_COORDS[shelter.city])
    return CITY_COORDS[shelter.city];
  if (STATE_COORDS[shelter.state_region])
    return STATE_COORDS[shelter.state_region];
  return null;
}

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
  "Inactive / Closed": "#666",
};

function Badge({ color, children }) {
  return (
    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, fontWeight: 700,
      background: `${color}25`, border: `1px solid ${color}50`, color, display: "inline-block" }}>
      {children}
    </span>
  );
}

export default function ShelterMapView() {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filterType, setFilterType] = useState("All");
  const [filterState, setFilterState] = useState("All");
  const [filterVerify, setFilterVerify] = useState("All");
  const [filterVeteran, setFilterVeteran] = useState(false);

  useEffect(() => {
    base44.entities.MexicoShelterRegistry.list("-created_date", 200)
      .then(setShelters).finally(() => setLoading(false));
  }, []);

  const filtered = shelters.filter(s => {
    if (filterType !== "All" && s.provider_type !== filterType) return false;
    if (filterState !== "All" && s.state_region !== filterState) return false;
    if (filterVerify !== "All" && s.verification_status !== filterVerify) return false;
    if (filterVeteran && !s.veteran_specific) return false;
    return true;
  });

  const mappable = filtered.filter(s => getCoords(s));

  // Stats
  const byState = {};
  shelters.forEach(s => { byState[s.state_region] = (byState[s.state_region] || 0) + 1; });
  const topState = Object.entries(byState).sort((a, b) => b[1] - a[1])[0];

  const selShelter = selected ? shelters.find(s => s.id === selected) : null;

  const inp = {
    padding: "5px 10px", background: "#080D18", border: `1px solid ${P.b}`,
    borderRadius: 6, color: P.t1, fontSize: 9, fontFamily: "'IBM Plex Mono',monospace", outline: "none",
  };

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1, display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 4 }}>
          GEOSPATIAL INTELLIGENCE · MEXICO SHELTER NETWORK
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: P.t1, margin: 0 }}>
          Mexico Shelter Distribution Map
        </h1>
        <p style={{ fontSize: 9, color: P.t3, marginTop: 4 }}>
          Geographic distribution of veteran support nodes along the U.S.–Mexico border corridor
        </p>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 7 }}>
        {[
          { l: "Total Shelters", v: shelters.length, c: P.blue },
          { l: "Mapped", v: shelters.filter(s => getCoords(s)).length, c: P.teal },
          { l: "Veteran-Specific", v: shelters.filter(s => s.veteran_specific).length, c: P.gold },
          { l: "Risk Flagged", v: shelters.filter(s => s.risk_flag && s.risk_flag !== "None").length, c: P.red },
          { l: topState ? topState[0] : "—", v: topState ? topState[1] : 0, c: P.violet },
          { l: "On Filter", v: mappable.length, c: P.amber },
        ].map((s, i) => (
          <div key={i} style={{ background: P.card, border: `1px solid ${s.c}25`, borderLeft: `3px solid ${s.c}`, borderRadius: 7, padding: "7px 11px" }}>
            <div style={{ fontSize: 6, color: P.t4, marginBottom: 1 }}>{s.l}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <select value={filterState} onChange={e => setFilterState(e.target.value)} style={inp}>
          {["All","Baja California","Sonora","Chihuahua","Coahuila","Tamaulipas","Nuevo León","Other"]
            .map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={inp}>
          {["All", ...Object.keys(TYPE_ICONS)].map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={filterVerify} onChange={e => setFilterVerify(e.target.value)} style={inp}>
          {["All","Verified Public","Unverified – Needs Confirmation","Inactive / Closed"].map(v => <option key={v}>{v}</option>)}
        </select>
        <label style={{ display: "flex", gap: 6, alignItems: "center", cursor: "pointer", fontSize: 9, color: P.t2 }}>
          <input type="checkbox" checked={filterVeteran} onChange={e => setFilterVeteran(e.target.checked)}
            style={{ accentColor: P.gold }} />
          Veteran-specific only
        </label>
        <span style={{ marginLeft: "auto", fontSize: 8, color: P.t4 }}>{mappable.length} shelters plotted</span>
      </div>

      {/* Map + sidebar */}
      <div style={{ display: "flex", gap: 12, height: 520 }}>
        {/* Map */}
        <div style={{ flex: 1, borderRadius: 10, overflow: "hidden", border: `1px solid ${P.b}` }}>
          {loading ? (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              background: P.card, color: P.t4, fontSize: 11 }}>Loading shelters...</div>
          ) : (
            <MapContainer
              center={[29.5, -110.0]}
              zoom={5}
              style={{ height: "100%", width: "100%", background: "#0a1628" }}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
              />
              {mappable.map(shelter => {
                const coords = getCoords(shelter);
                const riskColor = RISK_COLORS[shelter.risk_flag] || P.teal;
                const verifyColor = VERIFY_COLORS[shelter.verification_status] || P.teal;
                const isSelected = selected === shelter.id;
                const markerColor = shelter.risk_flag && shelter.risk_flag !== "None" ? riskColor : verifyColor;

                return (
                  <CircleMarker
                    key={shelter.id}
                    center={coords}
                    radius={isSelected ? 14 : shelter.veteran_specific ? 10 : 7}
                    pathOptions={{
                      color: markerColor,
                      fillColor: markerColor,
                      fillOpacity: isSelected ? 0.9 : 0.6,
                      weight: isSelected ? 3 : 1.5,
                    }}
                    eventHandlers={{ click: () => setSelected(shelter.id === selected ? null : shelter.id) }}
                  >
                    <Tooltip permanent={false} sticky>
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>
                        <strong>{TYPE_ICONS[shelter.provider_type] || "📍"} {shelter.organization_name}</strong><br />
                        {shelter.city}, {shelter.state_region}
                        {shelter.veteran_specific && <><br /><span style={{ color: "#f59e0b" }}>★ Veteran-Specific</span></>}
                      </div>
                    </Tooltip>
                    <Popup>
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, maxWidth: 220 }}>
                        <div style={{ fontWeight: 800, marginBottom: 4 }}>
                          {TYPE_ICONS[shelter.provider_type] || "📍"} {shelter.organization_name}
                        </div>
                        <div style={{ color: "#888", marginBottom: 6 }}>{shelter.city}, {shelter.state_region}</div>
                        {shelter.services_offered && (
                          <div style={{ marginBottom: 6, lineHeight: 1.5 }}>{shelter.services_offered.slice(0, 100)}...</div>
                        )}
                        {shelter.url && (
                          <a href={shelter.url} target="_blank" rel="noreferrer" style={{ color: "#38bdf8" }}>
                            🔗 Visit site
                          </a>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          )}
        </div>

        {/* Sidebar — selected shelter or list */}
        <div style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}>
          {/* Legend */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 9, padding: "10px 12px" }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: P.t4, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Legend</div>
            {[
              { color: P.teal, label: "Verified Public" },
              { color: P.amber, label: "Unverified / Needs Confirmation" },
              { color: "#666", label: "Inactive / Closed" },
              { color: P.red, label: "Risk Flagged" },
              { color: P.gold, label: "Needs Follow-Up" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, border: `2px solid ${color}80`, flexShrink: 0 }} />
                <span style={{ fontSize: 8, color: P.t3 }}>{label}</span>
              </div>
            ))}
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${P.b}30`, fontSize: 7, color: P.t4 }}>
              Larger dots = veteran-specific nodes · Click a dot to inspect
            </div>
          </div>

          {/* Selected shelter detail */}
          {selShelter ? (
            <div style={{ background: P.card, border: `1px solid ${VERIFY_COLORS[selShelter.verification_status] || P.teal}40`,
              borderTop: `3px solid ${VERIFY_COLORS[selShelter.verification_status] || P.teal}`, borderRadius: 9, padding: "12px 14px", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: P.t1, lineHeight: 1.3 }}>
                  {TYPE_ICONS[selShelter.provider_type] || "📍"} {selShelter.organization_name}
                </div>
                <button onClick={() => setSelected(null)}
                  style={{ background: "transparent", border: "none", color: P.t4, fontSize: 14, cursor: "pointer" }}>✕</button>
              </div>
              <div style={{ fontSize: 8, color: P.t4, marginBottom: 10 }}>{selShelter.city}, {selShelter.state_region}</div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                <Badge color={VERIFY_COLORS[selShelter.verification_status] || P.t4}>{selShelter.verification_status}</Badge>
                {selShelter.veteran_specific && <Badge color={P.gold}>VETERAN</Badge>}
                {selShelter.legal_services && <Badge color={P.blue}>LEGAL</Badge>}
                {selShelter.housing_available && <Badge color={P.teal}>HOUSING</Badge>}
                {selShelter.mental_health_services && <Badge color={P.violet}>HEALTH</Badge>}
                {selShelter.repatriation_support && <Badge color={P.amber}>REPATRIATION</Badge>}
              </div>

              {selShelter.risk_flag && selShelter.risk_flag !== "None" && (
                <div style={{ background: `${P.red}10`, border: `1px solid ${P.red}25`, borderRadius: 5,
                  padding: "5px 8px", marginBottom: 8, fontSize: 8, color: P.red, fontWeight: 700 }}>
                  ⚠ {selShelter.risk_flag}
                </div>
              )}

              {selShelter.services_offered && (
                <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.6, marginBottom: 8 }}>
                  {selShelter.services_offered.slice(0, 160)}{selShelter.services_offered.length > 160 ? "..." : ""}
                </div>
              )}

              {[["Phone", selShelter.phone], ["Email", selShelter.email],
                ["Data Source", selShelter.data_source], ["Known AUMER Subjects", selShelter.known_subjects_served],
                ["COMAR", selShelter.comar_link], ["INM", selShelter.inm_link]
              ].filter(([, v]) => v).map(([label, val]) => (
                <div key={label} style={{ marginBottom: 5, background: "#080D18", borderRadius: 4, padding: "4px 7px" }}>
                  <div style={{ fontSize: 6, color: P.t4, textTransform: "uppercase" }}>{label}</div>
                  <div style={{ fontSize: 8, color: P.t1 }}>{val}</div>
                </div>
              ))}

              {selShelter.url && (
                <a href={selShelter.url} target="_blank" rel="noreferrer"
                  style={{ display: "block", marginTop: 8, fontSize: 8, color: P.blue, textDecoration: "none" }}>
                  🔗 {selShelter.url.replace(/^https?:\/\//, "").slice(0, 35)}
                </a>
              )}

              {selShelter.notes && (
                <div style={{ marginTop: 8, fontSize: 8, color: P.t3, lineHeight: 1.5, fontStyle: "italic" }}>
                  {selShelter.notes}
                </div>
              )}
            </div>
          ) : (
            /* Shelter list */
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5, overflowY: "auto" }}>
              <div style={{ fontSize: 7, color: P.t4, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>
                Click a marker or select below
              </div>
              {mappable.map(s => {
                const rColor = VERIFY_COLORS[s.verification_status] || P.teal;
                return (
                  <div key={s.id} onClick={() => setSelected(s.id)}
                    style={{ background: P.card, border: `1px solid ${rColor}25`, borderLeft: `3px solid ${rColor}`,
                      borderRadius: 7, padding: "7px 10px", cursor: "pointer", transition: "all .1s" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: P.t1 }}>
                      {TYPE_ICONS[s.provider_type] || "📍"} {s.organization_name}
                    </div>
                    <div style={{ fontSize: 7, color: P.t4, marginTop: 2 }}>{s.city}, {s.state_region}</div>
                    {s.veteran_specific && (
                      <span style={{ fontSize: 6, color: P.gold }}>★ Veteran-Specific</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}