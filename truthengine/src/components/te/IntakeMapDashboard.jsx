import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, LayerGroup } from "react-leaflet";
import L from "leaflet";
import { P } from "../../lib/teData";

const INTAKE_CENTERS = [
  { id: 1, name: "Nogales Migrant Shelter", lat: 30.1408, lng: -97.4211, capacity: 350, type: "Migration", country: "Mexico", status: "active" },
  { id: 2, name: "El Paso Processing Center", lat: 31.7683, lng: -106.4230, capacity: 600, type: "ICE", country: "USA", status: "active" },
  { id: 3, name: "San Diego Family Residential Center", lat: 32.7157, lng: -117.1611, capacity: 500, type: "ICE", country: "USA", status: "active" },
  { id: 4, name: "Otay Mesa ICE Detention Facility", lat: 32.5729, lng: -117.0396, capacity: 750, type: "ICE", country: "USA", status: "critical" },
  { id: 5, name: "Rio Grande Valley Detention Center", lat: 26.1141, lng: -97.8172, capacity: 2400, type: "ICE", country: "USA", status: "overcrowded" },
  { id: 6, name: "Casa Madre Assunta Shelter", lat: 25.6733, lng: -100.3161, capacity: 180, type: "Migration", country: "Mexico", status: "active" },
  { id: 7, name: "Bangkok Shelter (Thai Refugee)", lat: 13.7563, lng: 100.5018, capacity: 120, type: "Refuge", country: "Thailand", status: "active" },
];

const DEPORTED_VETERANS = [
  { id: "C001", name: "Sgt. George Ramos", lat: 31.7683, lng: -106.4230, status: "Gold", country: "Mexico", city: "Ciudad Juárez", caseStatus: "verified" },
  { id: "C002", name: "M. Valenzuela", lat: 30.1408, lng: -97.4211, status: "Silver", country: "Mexico", city: "Nogales", caseStatus: "verified" },
  { id: "C003", name: "V. Valenzuela", lat: 30.1408, lng: -97.4211, status: "Silver", country: "Mexico", city: "Nogales", caseStatus: "verified" },
  { id: "C004", name: "Sae Joon Park", lat: 13.6561, lng: 100.5018, status: "Gold", country: "Thailand", city: "Bangkok", caseStatus: "urgent" },
  { id: "C005", name: "M. Segura", lat: 30.1408, lng: -97.4211, status: "Silver", country: "Mexico", city: "Nogales", caseStatus: "verified" },
  { id: "C006", name: "J. Duran", lat: 4.5709, lng: -74.2973, status: "Bronze", country: "Colombia", city: "Bogotá", caseStatus: "pending" },
];

const BORDER_CROSSINGS = [
  { lat: 31.7683, lng: -106.4230, value: 2450, name: "El Paso-Juárez" },
  { lat: 32.7157, lng: -117.1611, value: 3200, name: "San Diego-Tijuana" },
  { lat: 32.5729, lng: -117.0396, value: 1800, name: "Otay Mesa" },
  { lat: 26.1141, lng: -97.8172, value: 5600, name: "McAllen-Reynosa" },
  { lat: 26.9124, lng: -97.1489, value: 2100, name: "South Padre Island" },
  { lat: 30.2672, lng: -104.2008, value: 890, name: "Paso Lajitas" },
  { lat: 30.3869, lng: -104.5298, value: 620, name: "Terlingua" },
];

const STATUS_COLORS = { Gold: P.gold, Silver: P.teal, Bronze: P.amber };
const FACILITY_COLORS = { ICE: P.red, Migration: P.blue, Refuge: P.violet };
const CASE_STATUS_COLORS = { verified: P.teal, urgent: P.red, pending: P.amber };

export default function IntakeMapDashboard() {
  const [mapCenter] = useState([25, -100]);
  const [zoom] = useState(4);
  const [showIntakeCenters, setShowIntakeCenters] = useState(true);
  const [showBorderHeatmap, setShowBorderHeatmap] = useState(true);
  const [showDeportedVeterans, setShowDeportedVeterans] = useState(true);
  const [facilityTypeFilter, setFacilityTypeFilter] = useState("all");
  const [caseStatusFilter, setCaseStatusFilter] = useState("all");
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedVeteran, setSelectedVeteran] = useState(null);

  const filteredIntakeCenters = useMemo(() => {
    return facilityTypeFilter === "all"
      ? INTAKE_CENTERS
      : INTAKE_CENTERS.filter((c) => c.type === facilityTypeFilter);
  }, [facilityTypeFilter]);

  const filteredVeterans = useMemo(() => {
    return caseStatusFilter === "all"
      ? DEPORTED_VETERANS
      : DEPORTED_VETERANS.filter((v) => v.caseStatus === caseStatusFilter);
  }, [caseStatusFilter]);

  const maxCrossing = Math.max(...BORDER_CROSSINGS.map((d) => d.value));

  const getHeatmapColor = (value) => {
    const ratio = value / maxCrossing;
    if (ratio > 0.8) return P.red;
    if (ratio > 0.6) return P.amber;
    if (ratio > 0.4) return P.gold;
    return P.blue;
  };

  const getHeatmapRadius = (value) => {
    return 15 + (value / maxCrossing) * 35;
  };

  const facilityIcon = new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`<svg viewBox="0 0 24 24" fill="${P.red}"><rect x="4" y="4" width="16" height="16" fill="${P.red}"/><rect x="6" y="6" width="12" height="12" fill="white"/></svg>`)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

  const veteranIcon = new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`<svg viewBox="0 0 24 24" fill="${P.gold}"><circle cx="12" cy="12" r="10" fill="${P.gold}"/><circle cx="12" cy="12" r="8" fill="white"/><circle cx="12" cy="12" r="5" fill="${P.gold}"/></svg>`)}`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });

  const totalCrossings = BORDER_CROSSINGS.reduce((s, d) => s + d.value, 0);
  const avgCrossing = Math.round(totalCrossings / BORDER_CROSSINGS.length);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 118px)", gap: 12, background: P.bg }}>
      {/* Sidebar */}
      <div style={{ width: 280, overflowY: "auto", background: P.card, border: `2px solid ${P.blue}`, borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 10 }}>
          🗺️ Intake & Border <span style={{ color: P.gold }}>Map</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 1, marginBottom: 12 }}>
          FACILITIES · VETERAN LOCATIONS · HEATMAP
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
          {[
            ["Active Centers", filteredIntakeCenters.length, P.blue],
            ["Capacity", filteredIntakeCenters.reduce((s, c) => s + c.capacity, 0), P.gold],
            ["Veterans Mapped", filteredVeterans.length, P.red],
            ["Avg Weekly Crossings", avgCrossing.toLocaleString(), P.amber],
          ].map(([l, v, c]) => (
            <div key={l} style={{ background: `${c}08`, border: `1px solid ${c}25`, borderRadius: 6, padding: "6px 8px" }}>
              <div style={{ fontSize: 6, color: P.t4 }}>{l}</div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, fontWeight: 800, color: c }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Layer toggles */}
        <div style={{ background: P.bg, border: `1px solid ${P.b}`, borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 7, color: P.t4, letterSpacing: 1, marginBottom: 8 }}>MAP LAYERS</div>
          {[
            ["Intake Centers", showIntakeCenters, setShowIntakeCenters, P.red],
            ["Deported Veterans", showDeportedVeterans, setShowDeportedVeterans, P.gold],
            ["Border Heatmap", showBorderHeatmap, setShowBorderHeatmap, P.blue],
          ].map(([l, v, set, c]) => (
            <label key={l} style={{ display: "flex", gap: 6, alignItems: "center", padding: "5px 0", cursor: "pointer" }}>
              <input type="checkbox" checked={v} onChange={() => set(!v)} style={{ cursor: "pointer" }} />
              <span style={{ fontSize: 7, color: P.t3 }}>● {l}</span>
            </label>
          ))}
        </div>

        {/* Facility type filter */}
        <div style={{ background: P.bg, border: `1px solid ${P.b}`, borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 7, color: P.t4, letterSpacing: 1, marginBottom: 8 }}>FACILITY TYPE</div>
          <select
            value={facilityTypeFilter}
            onChange={(e) => setFacilityTypeFilter(e.target.value)}
            style={{
              width: "100%",
              padding: "6px 8px",
              background: P.bg,
              border: `1px solid ${P.blue}40`,
              color: P.t2,
              fontSize: 7,
              borderRadius: 6,
              outline: "none",
              fontFamily: "inherit",
              marginBottom: 8,
            }}
          >
            <option value="all">All Types ({INTAKE_CENTERS.length})</option>
            {["ICE", "Migration", "Refuge"].map((type) => {
              const count = INTAKE_CENTERS.filter((c) => c.type === type).length;
              return (
                <option key={type} value={type}>
                  {type} ({count})
                </option>
              );
            })}
          </select>
        </div>

        {/* Case status filter */}
        <div style={{ background: P.bg, border: `1px solid ${P.b}`, borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 7, color: P.t4, letterSpacing: 1, marginBottom: 8 }}>CASE STATUS</div>
          <select
            value={caseStatusFilter}
            onChange={(e) => setCaseStatusFilter(e.target.value)}
            style={{
              width: "100%",
              padding: "6px 8px",
              background: P.bg,
              border: `1px solid ${P.red}40`,
              color: P.t2,
              fontSize: 7,
              borderRadius: 6,
              outline: "none",
              fontFamily: "inherit",
            }}
          >
            <option value="all">All Cases ({DEPORTED_VETERANS.length})</option>
            {["verified", "urgent", "pending"].map((status) => {
              const count = DEPORTED_VETERANS.filter((v) => v.caseStatus === status).length;
              return (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                </option>
              );
            })}
          </select>
        </div>

        {/* Facility list */}
        <div style={{ background: P.bg, border: `1px solid ${P.b}`, borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 7, color: P.t4, letterSpacing: 1, marginBottom: 8 }}>FACILITIES ({filteredIntakeCenters.length})</div>
          <div style={{ maxHeight: 140, overflowY: "auto" }}>
            {filteredIntakeCenters.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCenter(c)}
                style={{
                  padding: "6px 8px",
                  marginBottom: 4,
                  background: selectedCenter?.id === c.id ? `${FACILITY_COLORS[c.type]}12` : "transparent",
                  border: `1px solid ${selectedCenter?.id === c.id ? FACILITY_COLORS[c.type] : P.b}25`,
                  borderLeft: `3px solid ${FACILITY_COLORS[c.type]}`,
                  borderRadius: 5,
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 7, fontWeight: 700, color: P.t2 }}>{c.name}</div>
                <div style={{ fontSize: 6, color: P.t4, marginTop: 1 }}>
                  {c.type} · {c.capacity} cap · {c.country}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Veteran list */}
        <div style={{ background: P.bg, border: `1px solid ${P.b}`, borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 7, color: P.t4, letterSpacing: 1, marginBottom: 8 }}>VETERANS ({filteredVeterans.length})</div>
          <div style={{ maxHeight: 120, overflowY: "auto" }}>
            {filteredVeterans.map((v) => (
              <div
                key={v.id}
                onClick={() => setSelectedVeteran(v)}
                style={{
                  padding: "6px 8px",
                  marginBottom: 4,
                  background: selectedVeteran?.id === v.id ? `${STATUS_COLORS[v.status]}12` : "transparent",
                  border: `1px solid ${selectedVeteran?.id === v.id ? STATUS_COLORS[v.status] : P.b}25`,
                  borderLeft: `3px solid ${STATUS_COLORS[v.status]}`,
                  borderRadius: 5,
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 7, fontWeight: 700, color: P.t2 }}>{v.name}</div>
                <div style={{ fontSize: 6, color: P.t4, marginTop: 1 }}>
                  {v.city}, {v.country} · {v.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, background: "#1a1a1a", borderRadius: 10, overflow: "hidden", position: "relative" }}>
        <MapContainer center={mapCenter} zoom={zoom} style={{ width: "100%", height: "100%" }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

          {/* Intake Centers */}
          {showIntakeCenters && (
            <LayerGroup>
              {filteredIntakeCenters.map((c) => (
                <Marker key={c.id} position={[c.lat, c.lng]} icon={facilityIcon}>
                  <Popup>
                    <div style={{ fontSize: 8 }}>
                      <strong>{c.name}</strong>
                      <br />
                      Type: {c.type} | Capacity: {c.capacity}
                      <br />
                      Country: {c.country} | Status: {c.status}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          )}

          {/* Deported Veterans */}
          {showDeportedVeterans && (
            <LayerGroup>
              {filteredVeterans.map((v) => (
                <Marker key={v.id} position={[v.lat, v.lng]} icon={veteranIcon}>
                  <Popup>
                    <div style={{ fontSize: 8 }}>
                      <strong>{v.name}</strong>
                      <br />
                      Case: {v.id} | Status: {v.status}
                      <br />
                      {v.city}, {v.country} | Case Status: {v.caseStatus}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          )}

          {/* Border Crossing Heatmap */}
          {showBorderHeatmap && (
            <LayerGroup>
              {BORDER_CROSSINGS.map((d) => (
                <CircleMarker
                  key={d.name}
                  center={[d.lat, d.lng]}
                  radius={getHeatmapRadius(d.value)}
                  pathOptions={{
                    color: getHeatmapColor(d.value),
                    weight: 2,
                    opacity: 0.7,
                    fillOpacity: 0.3,
                    fillColor: getHeatmapColor(d.value),
                  }}
                >
                  <Popup>
                    <div style={{ fontSize: 8 }}>
                      <strong>{d.name}</strong>
                      <br />
                      Weekly Crossings: {d.value.toLocaleString()}
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </LayerGroup>
          )}
        </MapContainer>

        {/* Legend */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            background: P.card,
            border: `2px solid ${P.blue}`,
            borderRadius: 8,
            padding: 12,
            maxWidth: 200,
            fontSize: 7,
            zIndex: 400,
          }}
        >
          <div style={{ fontWeight: 700, color: P.gold, marginBottom: 8 }}>MAP LEGEND</div>
          {[
            ["🏢", "Intake Facility", P.red],
            ["🎖️", "Deported Veteran", P.gold],
            ["🔵", "Border Crossing (low)", P.blue],
            ["🟨", "Border Crossing (med)", P.gold],
            ["🔴", "Border Crossing (high)", P.red],
          ].map(([icon, label, color]) => (
            <div key={label} style={{ display: "flex", gap: 6, alignItems: "center", padding: "3px 0", color: P.t3 }}>
              <span style={{ fontSize: 10, color }}>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
          <div style={{ fontSize: 6, color: P.t4, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${P.b}20` }}>
            Circle size = crossing volume<br />
            Opacity = activity level
          </div>
        </div>
      </div>
    </div>
  );
}