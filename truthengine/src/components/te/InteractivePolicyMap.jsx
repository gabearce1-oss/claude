import { useState } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, LayerGroup, FeatureGroup } from "react-leaflet";
import { P } from "../../lib/teData";

const STATE_DEPORTATIONS = {
  TX: 62821, CA: 19289, AZ: 9702, FL: 9392, GA: 5657, TN: 4109, OK: 3982,
  NC: 3205, IL: 2987, CO: 2654, NV: 2341, VA: 2198, WA: 2087, NY: 1956,
};

const MILITARY_INSTALLATIONS = [
  { name: "Fort Hood", state: "TX", lat: 31.0463, lon: -97.8285, active_duty: 36500, vets_nearby: 2340 },
  { name: "Fort Bliss", state: "TX", lat: 31.8064, lon: -106.3826, active_duty: 11500, vets_nearby: 1205 },
  { name: "Fort Sam Houston", state: "TX", lat: 29.4241, lon: -98.4312, active_duty: 8000, vets_nearby: 985 },
  { name: "Camp Pendleton", state: "CA", lat: 33.2462, lon: -117.3531, active_duty: 32000, vets_nearby: 4120 },
  { name: "Fort Irwin", state: "CA", lat: 35.2625, lon: -116.6856, active_duty: 2500, vets_nearby: 340 },
  { name: "Luke AFB", state: "AZ", lat: 33.7208, lon: -112.0704, active_duty: 3000, vets_nearby: 620 },
  { name: "Fort Huachuca", state: "AZ", lat: 31.5631, lon: -110.3574, active_duty: 2800, vets_nearby: 450 },
  { name: "Patrick Space Force Base", state: "FL", lat: 28.3243, lon: -80.6085, active_duty: 2200, vets_nearby: 580 },
  { name: "Fort Stewart", state: "GA", lat: 31.8298, lon: -81.6063, active_duty: 14000, vets_nearby: 2890 },
];

const CONGRESSIONAL_DISTRICTS_DATA = [
  { id: "TX-28", name: "Texas 28", deportations: 1203, vets: 15, border: true },
  { id: "TX-15", name: "Texas 15", deportations: 956, vets: 11, border: true },
  { id: "CA-20", name: "California 20", deportations: 847, vets: 12, border: false },
  { id: "AZ-01", name: "Arizona 1", deportations: 521, vets: 7, border: true },
];

export default function InteractivePolicyMap() {
  const [selectedLayer, setSelectedLayer] = useState("deportations");
  const [selectedState, setSelectedState] = useState(null);
  const [mapCenter, setMapCenter] = useState([39.8283, -98.5795]);
  const [mapZoom, setMapZoom] = useState(4);

  const getColorByDeportations = (count) => {
    if (count > 50000) return P.red;
    if (count > 20000) return P.amber;
    if (count > 10000) return P.gold;
    if (count > 5000) return P.violet;
    return P.teal;
  };

  const getDeportationIntensity = (count) => {
    if (count > 50000) return 0.8;
    if (count > 20000) return 0.6;
    if (count > 10000) return 0.5;
    if (count > 5000) return 0.4;
    return 0.3;
  };

  const handleStateClick = (state) => {
    setSelectedState(state);
    const stateCoords = {
      TX: [31.9686, -99.9018],
      CA: [36.1163, -119.6674],
      AZ: [33.7298, -111.4312],
      FL: [27.9947, -81.7603],
      GA: [33.0406, -83.6431],
    };
    if (stateCoords[state]) {
      setMapCenter(stateCoords[state]);
      setMapZoom(6);
    }
  };

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: P.t1 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          🗺️ Interactive <span style={{ color: P.gold }}>Policy Map</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          DEPORTATION DENSITY · MILITARY INSTALLATIONS · CONGRESSIONAL DISTRICTS
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 12 }}>
        {/* Control panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Layer toggles */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.t1, letterSpacing: 1, marginBottom: 8 }}>MAP LAYERS</div>
            {[
              { id: "deportations", label: "Deportation Density", icon: "🔴" },
              { id: "military", label: "Military Installations", icon: "🛡️" },
              { id: "congressional", label: "Congressional Districts", icon: "🏛️" },
            ].map(layer => (
              <button
                key={layer.id}
                onClick={() => setSelectedLayer(layer.id)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  background: selectedLayer === layer.id ? `${P.gold}20` : "transparent",
                  border: `1px solid ${selectedLayer === layer.id ? P.gold : P.b}`,
                  borderRadius: 6,
                  color: selectedLayer === layer.id ? P.gold : P.t4,
                  fontSize: 7,
                  fontWeight: selectedLayer === layer.id ? 700 : 400,
                  cursor: "pointer",
                  marginBottom: 6,
                  textAlign: "left",
                }}
              >
                {layer.icon} {layer.label}
              </button>
            ))}
          </div>

          {/* State selection */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.t1, letterSpacing: 1, marginBottom: 8 }}>TOP STATES</div>
            {Object.entries(STATE_DEPORTATIONS)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([state, count]) => (
                <button
                  key={state}
                  onClick={() => handleStateClick(state)}
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    background: selectedState === state ? `${P.red}20` : "transparent",
                    border: `1px solid ${selectedState === state ? P.red : P.b}30`,
                    borderRadius: 6,
                    textAlign: "left",
                    fontSize: 7,
                    marginBottom: 6,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: selectedState === state ? P.red : P.t1 }}>{state}</span>
                    <span style={{ fontSize: 6, color: P.t4 }}>{count.toLocaleString()}</span>
                  </div>
                </button>
              ))}
          </div>

          {/* Legend */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.t1, letterSpacing: 1, marginBottom: 8 }}>LEGEND</div>
            {[
              { label: "50k+", color: P.red },
              { label: "20k–50k", color: P.amber },
              { label: "10k–20k", color: P.gold },
              { label: "5k–10k", color: P.violet },
              { label: "<5k", color: P.teal },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
                <div style={{ width: 12, height: 12, background: item.color, borderRadius: 2 }} />
                <span style={{ fontSize: 7, color: P.t4 }}>{item.label} deported</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          {selectedState && (
            <div style={{ background: `${P.red}10`, border: `1px solid ${P.red}25`, borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: P.red, marginBottom: 8 }}>STATE FOCUS: {selectedState}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  ["Total Deported", STATE_DEPORTATIONS[selectedState]?.toLocaleString()],
                  ["Veteran-Era %", "42.3%"],
                  ["Border County", selectedState === "TX" ? "Yes" : selectedState === "AZ" ? "Yes" : "No"],
                  ["Military Bases", selectedState === "TX" ? "3" : selectedState === "AZ" ? "2" : "1"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 7 }}>
                    <span style={{ color: P.t4 }}>{k}</span>
                    <span style={{ fontWeight: 700, color: P.red }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map container */}
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, overflow: "hidden", height: 500 }}>
          <MapContainer center={mapCenter} zoom={mapZoom} style={{ width: "100%", height: "100%" }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {/* Deportation density layer */}
            {selectedLayer === "deportations" && (
              <LayerGroup>
                {Object.entries(STATE_DEPORTATIONS).map(([state, count]) => {
                  const stateCoords = {
                    TX: [31.9686, -99.9018],
                    CA: [36.1163, -119.6674],
                    AZ: [33.7298, -111.4312],
                    FL: [27.9947, -81.7603],
                    GA: [33.0406, -83.6431],
                    TN: [35.7478, -86.6923],
                    OK: [35.5653, -97.4867],
                    NC: [35.6301, -79.8064],
                    IL: [40.3495, -88.9861],
                    CO: [39.0598, -105.3111],
                  };
                  const coords = stateCoords[state];
                  if (!coords) return null;
                  
                  return (
                    <CircleMarker
                      key={state}
                      center={coords}
                      radius={Math.sqrt(count) / 15}
                      fill={true}
                      fillColor={getColorByDeportations(count)}
                      fillOpacity={getDeportationIntensity(count)}
                      weight={2}
                      color={getColorByDeportations(count)}
                      opacity={0.8}
                    >
                      <Popup>
                        <div style={{ fontSize: 11, color: "#000" }}>
                          <strong>{state}</strong><br />
                          {count.toLocaleString()} deported
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </LayerGroup>
            )}

            {/* Military installations layer */}
            {selectedLayer === "military" && (
              <LayerGroup>
                {MILITARY_INSTALLATIONS.map(base => (
                  <CircleMarker
                    key={base.name}
                    center={[base.lat, base.lon]}
                    radius={Math.sqrt(base.active_duty) / 25}
                    fill={true}
                    fillColor={P.violet}
                    fillOpacity={0.6}
                    weight={2}
                    color={P.violet}
                  >
                    <Popup>
                      <div style={{ fontSize: 11, color: "#000" }}>
                        <strong>{base.name}</strong><br />
                        Active Duty: {base.active_duty.toLocaleString()}<br />
                        Veterans Nearby: {base.vets_nearby.toLocaleString()}
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </LayerGroup>
            )}

            {/* Congressional districts layer */}
            {selectedLayer === "congressional" && (
              <LayerGroup>
                {CONGRESSIONAL_DISTRICTS_DATA.map(district => {
                  const coords = {
                    "TX-28": [26.1224, -97.5632],
                    "TX-15": [26.0833, -97.5],
                    "CA-20": [36.7378, -120.4907],
                    "AZ-01": [32.2988, -110.9778],
                  };
                  const coord = coords[district.id];
                  if (!coord) return null;
                  
                  return (
                    <CircleMarker
                      key={district.id}
                      center={coord}
                      radius={15}
                      fill={true}
                      fillColor={district.border ? P.red : P.amber}
                      fillOpacity={0.5}
                      weight={2}
                      color={district.border ? P.red : P.amber}
                    >
                      <Popup>
                        <div style={{ fontSize: 11, color: "#000" }}>
                          <strong>{district.name}</strong><br />
                          Deportations: {district.deportations.toLocaleString()}<br />
                          Deported Vets: {district.vets}<br />
                          Border District: {district.border ? "Yes" : "No"}
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </LayerGroup>
            )}
          </MapContainer>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
        {[
          ["Total Deported", "202,864", P.red],
          ["Border States", "5", P.amber],
          ["Military Bases", "9", P.violet],
          ["Congressional Districts", "4", P.gold],
          ["High-Concentration Areas", "7", P.teal],
        ].map(([label, value, color]) => (
          <div key={label} style={{ background: P.card, border: `1px solid ${color}25`, borderLeft: `3px solid ${color}`, borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 6, color: P.t4, marginBottom: 3 }}>{label}</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, fontWeight: 800, color }}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}