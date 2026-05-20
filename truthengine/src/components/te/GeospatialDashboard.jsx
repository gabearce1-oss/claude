import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, LayerGroup } from "react-leaflet";
import L from "leaflet";
import { P } from "../../lib/teData";

// Geographic data for deported veterans and intake centers
const DEPORTED_VETERANS = [
  { id: "C001", name: "Sgt. George Ramos", lat: 31.7683, lng: -106.4230, status: "Gold", country: "Mexico", city: "Ciudad Juárez" },
  { id: "C002", name: "M. Valenzuela", lat: 30.1408, lng: -97.4211, status: "Silver", country: "Mexico", city: "Nogales" },
  { id: "C003", name: "V. Valenzuela", lat: 30.1408, lng: -97.4211, status: "Silver", country: "Mexico", city: "Nogales" },
  { id: "C004", name: "Sae Joon Park", lat: 13.6561, lng: 100.5018, status: "Gold", country: "Thailand", city: "Bangkok" },
  { id: "C005", name: "M. Segura", lat: 30.1408, lng: -97.4211, status: "Silver", country: "Mexico", city: "Nogales" },
  { id: "C006", name: "J. Duran", lat: 4.5709, lng: -74.2973, status: "Bronze", country: "Colombia", city: "Bogotá" },
];

const INTAKE_CENTERS = [
  { name: "Nogales Migrant Shelter", lat: 30.1408, lng: -97.4211, capacity: 350, type: "Migration", country: "Mexico" },
  { name: "El Paso Processing Center", lat: 31.7683, lng: -106.4230, capacity: 600, type: "ICE", country: "USA" },
  { name: "San Diego Family Residential Center", lat: 32.7157, lng: -117.1611, capacity: 500, type: "ICE", country: "USA" },
  { name: "Otay Mesa ICE Detention Facility", lat: 32.5729, lng: -117.0396, capacity: 750, type: "ICE", country: "USA" },
  { name: "Rio Grande Valley Detention Center", lat: 26.1141, lng: -97.8172, capacity: 2400, type: "ICE", country: "USA" },
  { name: "Casa Madre Assunta Shelter", lat: 25.6733, lng: -100.3161, capacity: 180, type: "Migration", country: "Mexico" },
  { name: "Bangkok Shelter (Thai Refugee)", lat: 13.7563, lng: 100.5018, capacity: 120, type: "Refuge", country: "Thailand" },
];

const BORDER_CROSSING_DATA = [
  { lat: 31.7683, lng: -106.4230, value: 2450, name: "El Paso-Juárez" }, // crossings per week
  { lat: 32.7157, lng: -117.1611, value: 3200, name: "San Diego-Tijuana" },
  { lat: 32.5729, lng: -117.0396, value: 1800, name: "Otay Mesa" },
  { lat: 26.1141, lng: -97.8172, value: 5600, name: "McAllen-Reynosa" },
  { lat: 26.9124, lng: -97.1489, value: 2100, name: "South Padre Island" },
  { lat: 30.2672, lng: -104.2008, value: 890, name: "Paso Lajitas" },
  { lat: 30.3869, lng: -104.5298, value: 620, name: "Terlingua" },
];

const STATUS_COLORS = {
  Gold: P.gold,
  Silver: P.teal,
  Bronze: P.amber,
};

export default function GeospatialDashboard() {
  const [mapCenter] = useState([25, -100]);
  const [zoom] = useState(4);
  const [showVeterans, setShowVeterans] = useState(true);
  const [showIntakeCenters, setShowIntakeCenters] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [selectedVeteran, setSelectedVeteran] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [filterCountry, setFilterCountry] = useState("all");

  const veteransByCountry = useMemo(() => {
    const grouped = {};
    DEPORTED_VETERANS.forEach(v => {
      if (!grouped[v.country]) grouped[v.country] = [];
      grouped[v.country].push(v);
    });
    return grouped;
  }, []);

  const filteredVeterans = useMemo(() => {
    return filterCountry === "all" 
      ? DEPORTED_VETERANS 
      : DEPORTED_VETERANS.filter(v => v.country === filterCountry);
  }, [filterCountry]);

  const totalByCountry = useMemo(() => {
    const counts = {};
    DEPORTED_VETERANS.forEach(v => {
      counts[v.country] = (counts[v.country] || 0) + 1;
    });
    return counts;
  }, []);

  const totalCrossings = BORDER_CROSSING_DATA.reduce((s, d) => s + d.value, 0);
  const avgCrossings = Math.round(totalCrossings / BORDER_CROSSING_DATA.length);
  const maxCrossing = Math.max(...BORDER_CROSSING_DATA.map(d => d.value));

  const veteranIcon = new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`<svg viewBox="0 0 24 24" fill="${STATUS_COLORS.Gold}"><circle cx="12" cy="12" r="10" fill="${STATUS_COLORS.Gold}"/><circle cx="12" cy="12" r="8" fill="white"/><circle cx="12" cy="12" r="5" fill="${STATUS_COLORS.Gold}"/></svg>`)}`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });

  const centerIcon = new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`<svg viewBox="0 0 24 24" fill="${P.red}"><rect x="4" y="4" width="16" height="16" fill="${P.red}"/><rect x="6" y="6" width="12" height="12" fill="white"/></svg>`)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

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

  return (
    <div style={{ display: "flex", height: "calc(100vh - 118px)", gap: 12, background: P.bg }}>
      {/* Sidebar */}
      <div style={{ width: 280, overflowY: "auto", background: P.card, border: `2px solid ${P.blue}`, borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.white, marginBottom: 10 }}>
          🗺️ Geospatial <span style={{ color: P.gold }}>Dashboard</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 1, marginBottom: 12 }}>
          DEPORTED VETERANS · INTAKE CENTERS · BORDER HEATMAP
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
          {[
            ["Veterans Mapped", filteredVeterans.length, P.blue],
            ["Intake Centers", INTAKE_CENTERS.length, P.gold],
            ["Avg Crossings/wk", avgCrossings.toLocaleString(), P.blue],
            ["Total Crossings/wk", totalCrossings.toLocaleString(), P.gold],
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
            ["Veterans", showVeterans, setShowVeterans, P.blue],
            ["Intake Centers", showIntakeCenters, setShowIntakeCenters, P.gold],
            ["Border Heatmap", showHeatmap, setShowHeatmap, P.blue],
          ].map(([l, v, set, c]) => (
            <label key={l} style={{ display: "flex", gap: 6, alignItems: "center", padding: "5px 0", cursor: "pointer" }}>
              <input type="checkbox" checked={v} onChange={() => set(!v)} style={{ cursor: "pointer" }} />
              <span style={{ fontSize: 7, color: P.t3 }}>● {l}</span>
              <span style={{ fontSize: 6, color: c, fontWeight: 700, marginLeft: "auto" }}>visible</span>
            </label>
          ))}
        </div>

        {/* Country filter */}
        <div style={{ background: P.bg, border: `1px solid ${P.b}`, borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 7, color: P.t4, letterSpacing: 1, marginBottom: 8 }}>FILTER BY COUNTRY</div>
          <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
            style={{ width: "100%", padding: "6px 8px", background: P.bg, border: `1px solid ${P.blue}40`, color: P.t2, fontSize: 7, borderRadius: 6, outline: "none", marginBottom: 8, fontFamily: "inherit" }}>
            <option value="all">All Countries ({DEPORTED_VETERANS.length})</option>
            {Object.entries(totalByCountry).map(([country, count]) => (
              <option key={country} value={country}>{country} ({count})</option>
            ))}
          </select>
        </div>

        {/* Veteran list */}
        <div style={{ background: P.bg, border: `1px solid ${P.b}`, borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 7, color: P.t4, letterSpacing: 1, marginBottom: 8 }}>VETERANS ({filteredVeterans.length})</div>
          <div style={{ maxHeight: 180, overflowY: "auto" }}>
            {filteredVeterans.map(v => (
              <div
                key={v.id}
                onClick={() => setSelectedVeteran(v)}
                style={{
                  padding: "6px 8px", marginBottom: 4, background: selectedVeteran?.id === v.id ? `${STATUS_COLORS[v.status]}12` : "transparent",
                  border: `1px solid ${selectedVeteran?.id === v.id ? STATUS_COLORS[v.status] : P.b}25`,
                  borderLeft: `3px solid ${STATUS_COLORS[v.status]}`, borderRadius: 5, cursor: "pointer",
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

        {/* Stats */}
        <div style={{ background: P.bg, border: `1px solid ${P.b}`, borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 7, color: P.t4, letterSpacing: 1, marginBottom: 8 }}>BORDER STATISTICS</div>
          {BORDER_CROSSING_DATA.sort((a, b) => b.value - a.value).slice(0, 3).map((d, i) => (
            <div key={d.name} style={{ padding: "5px 0", borderBottom: i < 2 ? `1px solid ${P.b}20` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                <span style={{ fontSize: 7, color: P.t3 }}>{d.name}</span>
                <span style={{ fontSize: 7, fontFamily: "'IBM Plex Mono',monospace", color: getHeatmapColor(d.value) === P.red ? P.gold : P.blue, fontWeight: 700 }}>
                  {d.value.toLocaleString()}
                </span>
              </div>
              <div style={{ background: P.bg, borderRadius: 3, height: 6, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%", width: `${(d.value / maxCrossing) * 100}%`,
                    background: getHeatmapColor(d.value), borderRadius: 3,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, background: "#1a1a1a", borderRadius: 10, overflow: "hidden", position: "relative" }}>
        <MapContainer center={mapCenter} zoom={zoom} style={{ width: "100%", height: "100%" }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

          {/* Deported Veterans Markers */}
          {showVeterans && (
            <LayerGroup>
              {filteredVeterans.map(v => (
                <Marker key={v.id} position={[v.lat, v.lng]} icon={veteranIcon}>
                  <Popup>
                    <div style={{ fontSize: 8 }}>
                      <strong>{v.name}</strong><br/>
                      Case: {v.id} | {v.status}<br/>
                      {v.city}, {v.country}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          )}

          {/* Intake Centers */}
          {showIntakeCenters && (
            <LayerGroup>
              {INTAKE_CENTERS.map(c => (
                <Marker key={c.name} position={[c.lat, c.lng]} icon={centerIcon}>
                  <Popup>
                    <div style={{ fontSize: 8 }}>
                      <strong>{c.name}</strong><br/>
                      Type: {c.type}<br/>
                      Capacity: {c.capacity} · {c.country}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          )}

          {/* Border Crossing Heatmap */}
          {showHeatmap && (
            <LayerGroup>
              {BORDER_CROSSING_DATA.map(d => (
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
                      <strong>{d.name}</strong><br/>
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
            position: "absolute", bottom: 20, left: 20, background: P.card, border: `2px solid ${P.blue}`,
            borderRadius: 8, padding: 12, maxWidth: 200, fontSize: 7, zIndex: 400,
          }}
        >
          <div style={{ fontWeight: 700, color: P.gold, marginBottom: 8 }}>MAP LEGEND</div>
          {[
            ["🔵", "Deported Veteran", P.blue],
            ["🟨", "Intake Center", P.gold],
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
            Heatmap: Circle size = crossing volume<br/>Opacity: Weekly average
          </div>
        </div>
      </div>
    </div>
  );
}