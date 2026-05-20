import { useState, useEffect } from "react";
import { P } from "../../lib/teData";
import { SHELTER_LOCATIONS, ICE_ENFORCEMENT_REGIONS, LEGAL_SUPPORT_RESOURCES } from "../../lib/shelterData";
import { MapContainer, TileLayer, Marker, Popup, Circle, LayerGroup, Tooltip } from "react-leaflet";
import L from "leaflet";

const shelterIcon = L.divIcon({
  html: `<div style="background:#1CCFB4;border:2px solid #0A0F1E;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px">🏠</div>`,
  iconSize: [28, 28],
  popupAnchor: [0, -10],
});

const legalIcon = L.divIcon({
  html: `<div style="background:#FCD34D;border:2px solid #0A0F1E;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px">⚖️</div>`,
  iconSize: [28, 28],
  popupAnchor: [0, -10],
});

export default function BorderShelterMap() {
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showLegal, setShowLegal] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(null);

  const center = [30.5, -110.0];

  const getDangerColor = (level) => {
    if (level >= 8) return P.red;
    if (level >= 6) return P.amber;
    return P.teal;
  };

  const getVeteranColor = (count) => {
    if (count >= 100) return P.violet;
    if (count >= 50) return P.blue;
    return P.cyan;
  };

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: P.t1, height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: P.card, borderBottom: `2px solid ${P.gold}`, padding: "12px 20px", zIndex: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P.t1, marginBottom: 8 }}>
          🗺️ Border Shelter Map <span style={{ color: P.gold }}>Live Intelligence</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <span>ICE Enforcement Heat</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={showLegal}
              onChange={(e) => setShowLegal(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <span>Legal Resources</span>
          </label>
          <div style={{ marginLeft: "auto", fontSize: 7, color: P.t4 }}>
            {SHELTER_LOCATIONS.length} shelters · {LEGAL_SUPPORT_RESOURCES.length} legal orgs
          </div>
        </div>
      </div>

      {/* Map container */}
      <div style={{ flex: 1, position: "relative" }}>
        <MapContainer
          center={center}
          zoom={6}
          style={{ width: "100%", height: "100%", background: "#030508" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors'
            crossOrigin="anonymous"
          />

          {/* ICE Enforcement Heatmap */}
          {showHeatmap &&
            ICE_ENFORCEMENT_REGIONS.map((region) => (
              <Circle
                key={region.id}
                center={[
                  SHELTER_LOCATIONS.filter((s) => region.sheltersCovered.includes(s.id))[0]?.lat || 31,
                  SHELTER_LOCATIONS.filter((s) => region.sheltersCovered.includes(s.id))[0]?.lng || -110,
                ]}
                radius={60000}
                fillColor={getDangerColor(region.dangerLevel)}
                fillOpacity={0.15}
                color={getDangerColor(region.dangerLevel)}
                weight={2}
                dashArray="5,5"
              >
                <Tooltip>
                  <div style={{ fontSize: "10px", color: P.t1 }}>
                    <strong>{region.name}</strong>
                    <br />
                    Danger: {region.dangerLevel}/10
                    <br />
                    Agents: {region.agents}
                    <br />
                    Arrests/mo: {region.arrestsPerMonth}
                  </div>
                </Tooltip>
              </Circle>
            ))}

          {/* Shelters */}
          {SHELTER_LOCATIONS.map((shelter) => (
            <Marker
              key={shelter.id}
              position={[shelter.lat, shelter.lng]}
              icon={shelterIcon}
              eventHandlers={{ click: () => setSelectedShelter(shelter.id) }}
            >
              <Popup closeButton={false} maxWidth={280} minWidth={250}>
                <div style={{ fontSize: 8, color: P.t1, fontFamily: "'IBM Plex Mono', monospace" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, marginBottom: 6, color: getVeteranColor(shelter.veterans) }}>
                    {shelter.city}, {shelter.state}
                  </div>

                  <div style={{ marginBottom: 8, padding: "6px 8px", background: "#080D18", borderRadius: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span>Veterans:</span>
                      <strong style={{ color: getVeteranColor(shelter.veterans) }}>{shelter.veterans}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span>Capacity:</span>
                      <strong>{shelter.capacity}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Vet %:</span>
                      <strong style={{ color: P.gold }}>{shelter.veteranPct}%</strong>
                    </div>
                  </div>

                  <div style={{ marginBottom: 8, padding: "6px 8px", background: getDangerColor(shelter.iceDangerLevel) + "15", border: `1px solid ${getDangerColor(shelter.iceDangerLevel)}30`, borderRadius: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, color: getDangerColor(shelter.iceDangerLevel) }}>
                      <strong>ICE Danger Level</strong>
                      <strong>{shelter.iceDangerLevel}/10</strong>
                    </div>
                    <div style={{ fontSize: 6, color: P.t4 }}>Raids: {shelter.iceRaidFreq}</div>
                  </div>

                  {shelter.nearestLegal && (
                    <div style={{ padding: "6px 8px", background: P.gold + "12", border: `1px solid ${P.gold}25`, borderRadius: 6 }}>
                      <div style={{ color: P.gold, fontWeight: 700, marginBottom: 3 }}>Nearest Legal Support</div>
                      <div style={{ color: P.t2, fontSize: 7, marginBottom: 2 }}>{shelter.nearestLegal.name}</div>
                      <div style={{ fontSize: 6, color: P.t4 }}>{shelter.nearestLegal.distance} km · {shelter.nearestLegal.hours}</div>
                    </div>
                  )}

                  {shelter.cases.length > 0 && (
                    <div style={{ marginTop: 6, padding: "4px 6px", background: P.red + "12", fontSize: 6, color: P.red, fontWeight: 700 }}>
                      ⚠️ {shelter.cases.length} VERIFIED CASE(S): {shelter.cases.join(", ")}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Legal Resources */}
          {showLegal &&
            LEGAL_SUPPORT_RESOURCES.map((org) => (
              <Marker
                key={org.id}
                position={[org.location.lat, org.location.lng]}
                icon={legalIcon}
                title={org.org}
              >
                <Popup closeButton={false} maxWidth={260} minWidth={240}>
                  <div style={{ fontSize: 7, color: P.t1, fontFamily: "'IBM Plex Mono', monospace" }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, marginBottom: 6 }}>⚖️ {org.org}</div>

                    <div style={{ marginBottom: 6, padding: "5px 7px", background: "#080D18", borderRadius: 5 }}>
                      <div style={{ marginBottom: 3 }}>
                        <strong style={{ color: P.teal }}>Type:</strong> {org.type}
                      </div>
                      <div style={{ marginBottom: 3 }}>
                        <strong style={{ color: P.teal }}>Phone:</strong> {org.phone}
                      </div>
                      <div style={{ marginBottom: 3 }}>
                        <strong style={{ color: P.teal }}>Hours:</strong> {org.hours}
                      </div>
                      {org.vetSpecialist && (
                        <div style={{ color: P.gold, fontWeight: 700 }}>🎖️ Veteran Specialist</div>
                      )}
                    </div>

                    <div style={{ fontSize: 6, color: P.t4 }}>
                      <strong>Coverage:</strong> {org.coverageArea.join(", ")}
                    </div>
                    <div style={{ fontSize: 6, color: P.t4, marginTop: 3 }}>
                      <strong>Services:</strong> {org.specialties.join(", ")}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div style={{ background: P.card, borderTop: `1px solid ${P.b}`, padding: "10px 20px", fontSize: 7, color: P.t4, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <div style={{ width: 16, height: 16, borderRadius: "50%", background: P.violet }}></div>
          <span>High veteran concentration (100+)</span>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <div style={{ width: 16, height: 16, borderRadius: "50%", background: getDangerColor(9) }}></div>
          <span>Critical ICE enforcement zone</span>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <div style={{ width: 16, height: 16, borderRadius: "50%", background: P.gold }}></div>
          <span>Legal support organization</span>
        </div>
      </div>
    </div>
  );
}