import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import { P, CASES, SHELTERS } from "../../lib/teData";
import L from "leaflet";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});

const CASE_COORDS = {
  "C001": { lat: 32.7157, lng: -117.1611, name: "San Diego, CA" },
  "C002": { lat: 32.5149, lng: -116.9689, name: "Tijuana, Mexico" },
  "C003": { lat: 32.5149, lng: -116.9689, name: "Tijuana, Mexico" },
  "C004": { lat: 32.2226, lng: -110.9145, name: "Tucson, AZ" },
  "C005": { lat: 31.7343, lng: -106.4888, name: "El Paso, TX / Juárez, Mexico" },
  "C006": { lat: 32.8753, lng: -117.2474, name: "San Diego Metro" }
};

const SHELTER_REGIONS = [
  { region: "Tijuana", lat: 32.5149, lng: -116.9689, count: 45, color: P.red },
  { region: "Nogales", lat: 31.3409, lng: -110.9855, count: 28, color: P.amber },
  { region: "Ciudad Juárez", lat: 31.7343, lng: -106.4888, count: 52, color: P.violet },
  { region: "CDMX", lat: 19.4326, lng: -99.1332, count: 38, color: P.blue },
  { region: "Tapachula", lat: 14.9075, lng: -92.2604, count: 22, color: P.teal }
];

export default function InteractiveVeteranMap() {
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [filterType, setFilterType] = useState("all"); // all | cases | shelters
  const [zoomLevel, setZoomLevel] = useState(3);

  const caseMarkers = useMemo(() => {
    if (filterType === "shelters") return [];
    return CASES.map(c => CASE_COORDS[c.id] ? { ...CASE_COORDS[c.id], ...c } : null).filter(Boolean);
  }, [filterType]);

  const shelterMarkers = useMemo(() => {
    if (filterType === "cases") return [];
    return SHELTER_REGIONS;
  }, [filterType]);

  const customCaseIcon = (tier) => {
    const tierColors = { Gold: P.gold, Silver: "#B8CCE8", Bronze: P.amber };
    return L.icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${tierColors[tier] || P.gold}" width="32" height="32">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
      `)}`,
      iconSize: [32, 32],
      popupAnchor: [0, -16]
    });
  };

  const shelterIcon = L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${P.teal}" width="28" height="28">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </svg>
    `)}`,
    iconSize: [28, 28],
    popupAnchor: [0, -14]
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 118px)" }}>
      {/* Controls */}
      <div style={{ padding: "10px 14px", background: "#050810", borderBottom: `1px solid ${P.b}`, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "cases", "shelters"].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              style={{ padding: "5px 12px", fontSize: 8, fontWeight: filterType === t ? 700 : 400,
                background: filterType === t ? `${P.teal}20` : "transparent",
                border: `1px solid ${filterType === t ? P.teal : P.b}`,
                color: filterType === t ? P.teal : P.t4, borderRadius: 20, cursor: "pointer" }}>
              {t === "all" ? "🗺️ All" : t === "cases" ? "🎖️ Veterans" : "🏕️ Shelters"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <span style={{ fontSize: 8, color: P.t4, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: P.gold }}></span>
            Gold Cases
          </span>
          <span style={{ fontSize: 8, color: P.t4, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: P.teal }}></span>
            Shelters
          </span>
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, display: "flex", gap: 10, padding: "10px 14px" }}>
        <MapContainer center={[27, -100]} zoom={zoomLevel} style={{ flex: 1, borderRadius: 10, overflow: "hidden", border: `1px solid ${P.b}` }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {/* Case markers */}
          {caseMarkers.map(c => (
            <Marker key={c.id} position={[c.lat, c.lng]} icon={customCaseIcon(c.tier)} onClick={() => setSelectedCase(c.id)}>
              <Popup>
                <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", width: 200 }}>
                  <div style={{ fontWeight: 800, color: P.gold }}>{c.id} — {c.name}</div>
                  <div style={{ fontSize: 8, color: P.t3, marginTop: 4 }}>{c.branch} · {c.status}</div>
                  <div style={{ fontSize: 8, color: P.t4, marginTop: 2 }}>{c.location}</div>
                  <div style={{ fontSize: 7, color: P.teal, marginTop: 6, fontWeight: 700 }}>Confidence: {c.confidence}%</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Shelter markers */}
          {shelterMarkers.map(s => (
            <Marker key={s.region} position={[s.lat, s.lng]} icon={shelterIcon} onClick={() => setSelectedRegion(s.region)}>
              <Popup>
                <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" }}>
                  <div style={{ fontWeight: 800, color: s.color }}>{s.region}</div>
                  <div style={{ fontSize: 8, color: P.t3, marginTop: 4 }}>~{s.count} shelters</div>
                  <div style={{ fontSize: 7, color: P.t4, marginTop: 6 }}>Click for details →</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Sidebar - Details */}
        <div style={{ width: 240, background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px", overflowY: "auto" }}>
          {selectedCase ? (
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: P.gold, marginBottom: 8 }}>{selectedCase}</div>
              {CASES.find(c => c.id === selectedCase) && (
                <>
                  <div style={{ fontSize: 9, color: P.t2, fontWeight: 700, marginBottom: 4 }}>
                    {CASES.find(c => c.id === selectedCase).name}
                  </div>
                  <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.6 }}>
                    {CASES.find(c => c.id === selectedCase).notes}
                  </div>
                  <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${P.b}20` }}>
                    <div style={{ fontSize: 7, color: P.t4, marginBottom: 6 }}>STATUS</div>
                    <div style={{ fontSize: 8, color: P.t2, fontWeight: 700 }}>{CASES.find(c => c.id === selectedCase).status}</div>
                    <div style={{ fontSize: 7, color: P.t4, marginTop: 6 }}>LOCATION</div>
                    <div style={{ fontSize: 8, color: P.t2 }}>{CASE_COORDS[selectedCase]?.name}</div>
                  </div>
                </>
              )}
            </div>
          ) : selectedRegion ? (
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: P.teal, marginBottom: 8 }}>🏕️ {selectedRegion}</div>
              <div style={{ fontSize: 9, color: P.t3, lineHeight: 1.6, marginBottom: 10 }}>
                Regional shelter hub with estimated <strong style={{ color: P.t2 }}>~{SHELTER_REGIONS.find(s => s.region === selectedRegion)?.count || 0}</strong> documented facilities.
              </div>
              <div style={{ fontSize: 7, color: P.t4, padding: "8px", background: "#080D18", borderRadius: 5 }}>
                📊 Integration point for BBVA georeferenced shelter database · UNHCR/COMAR/OIM coordination
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 8, color: P.t4 }}>Click a marker to view details.</div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{ padding: "10px 14px", borderTop: `1px solid ${P.b}`, fontSize: 7, color: P.t4, display: "flex", gap: 16, justifyContent: "center" }}>
        <span>🎖️ Verified veteran cases (CB-HSIVF certified)</span>
        <span>🏕️ Shelter hubs (BBVA georeferenced)</span>
        <span>📍 Click markers for full case details</span>
      </div>
    </div>
  );
}