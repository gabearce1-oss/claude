import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import { P, DATABASES_REGISTRY, BORDER_SHELTERS, CASES } from "../../lib/teData";

const LAYER_COLORS = {
  "ICE/DHS": P.red,
  Courts: P.blue,
  "Military/VA": P.gold,
  USCIS: P.violet,
  "Mexico/Intl": P.amber,
  Academic: P.teal,
  "News/Media": P.violet,
  Legislative: P.gold,
};

const createCustomIcon = (color, type) => {
  const html = `<div style="background:${color};width:30px;height:30px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700">${type.charAt(0)}</div>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: [36, 36],
    popupAnchor: [0, -18],
  });
};

export default function UnifiedDataMap() {
  const [selectedLayers, setSelectedLayers] = useState({
    databases: true,
    shelters: true,
    cases: true,
    deployments: true,
  });
  const [selectedMarker, setSelectedMarker] = useState(null);

  const mapCenter = [31.9686, -99.9018];

  const databaseMarkers = useMemo(() => {
    return DATABASES_REGISTRY.filter(db => selectedLayers.databases && db.lat && db.lng).map(db => ({
      id: db.id,
      lat: db.lat,
      lng: db.lng,
      type: "database",
      data: db,
      color: LAYER_COLORS[db.category] || P.blue,
    }));
  }, [selectedLayers.databases]);

  const shelterMarkers = useMemo(() => {
    return selectedLayers.shelters ? BORDER_SHELTERS.map(s => ({
      id: `shelter-${s.city}`,
      lat: s.lat,
      lng: s.lng,
      type: "shelter",
      data: s,
      color: P.teal,
    })) : [];
  }, [selectedLayers.shelters]);

  const caseMarkers = useMemo(() => {
    return selectedLayers.cases ? CASES.filter(c => c.location).map(c => ({
      id: c.id,
      lat: c.lat || 0,
      lng: c.lng || 0,
      type: "case",
      data: c,
      color: P.gold,
    })) : [];
  }, [selectedLayers.cases]);

  const allMarkers = [...databaseMarkers, ...shelterMarkers, ...caseMarkers];

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1 }}>
      {/* Controls */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 8 }}>🗺️ Data Visualization Layers</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { key: "databases", label: "Databases (77)", color: P.blue },
            { key: "shelters", label: "Border Shelters", color: P.teal },
            { key: "cases", label: "Cases", color: P.gold },
            { key: "deployments", label: "Deployment Zones", color: P.red },
          ].map(layer => (
            <button
              key={layer.key}
              onClick={() => setSelectedLayers(prev => ({ ...prev, [layer.key]: !prev[layer.key] }))}
              style={{
                padding: "6px 12px",
                background: selectedLayers[layer.key] ? `${layer.color}20` : "#080D18",
                border: `1px solid ${selectedLayers[layer.key] ? layer.color : P.b}`,
                color: selectedLayers[layer.key] ? layer.color : P.t4,
                fontSize: 7,
                fontWeight: 700,
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              {selectedLayers[layer.key] ? "✓" : "○"} {layer.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, overflow: "hidden", height: "500px", marginBottom: 12 }}>
        <MapContainer center={mapCenter} zoom={5} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {allMarkers.map(marker => (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={createCustomIcon(marker.color, marker.type)}
              onclick={() => setSelectedMarker(marker)}
            >
              <Popup>
                <div style={{ fontSize: 8, color: P.t1 }}>
                  <div style={{ fontWeight: 800, marginBottom: 4 }}>
                    {marker.type === "database" && marker.data.name}
                    {marker.type === "shelter" && `${marker.data.city} Shelter`}
                    {marker.type === "case" && marker.data.id}
                  </div>
                  <div style={{ color: P.t4, marginBottom: 6 }}>
                    {marker.type === "database" && `${marker.data.agency} · ${marker.data.records.toLocaleString()} records`}
                    {marker.type === "shelter" && `${marker.data.vets} veterans · ${marker.data.cases?.length || 0} cases`}
                    {marker.type === "case" && `${marker.data.branch} · ${marker.data.country}`}
                  </div>
                  {marker.type === "database" && <div style={{ fontSize: 7, color: P.gold }}>📋 {marker.data.access}</div>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
        {[
          { label: "Databases Mapped", value: databaseMarkers.length, color: P.blue },
          { label: "Border Shelters", value: shelterMarkers.length, color: P.teal },
          { label: "Cases Visualized", value: caseMarkers.length, color: P.gold },
          { label: "Total Records", value: "600M+", color: P.violet },
        ].map((stat, i) => (
          <div key={i} style={{ background: P.card, border: `1px solid ${stat.color}25`, borderLeft: `3px solid ${stat.color}`, borderRadius: 7, padding: "8px 12px" }}>
            <div style={{ fontSize: 6, color: P.t4, marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 800, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}