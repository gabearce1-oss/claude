import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, CircleMarker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import { P, CASES, BORDER_SHELTERS } from "../../lib/teData";

const DETENTION_FACILITIES = [
  { name: "San Diego Central ICE", lat: 32.7157, lng: -117.1611, capacity: 750, occupancy: 0.92 },
  { name: "El Paso ICE Processing", lat: 31.7683, lng: -106.4425, capacity: 600, occupancy: 0.88 },
  { name: "Phoenix ICE Field Office", lat: 33.4484, lng: -112.0742, capacity: 450, occupancy: 0.85 },
  { name: "Tucson Detention Complex", lat: 32.2217, lng: -110.9261, capacity: 800, occupancy: 0.91 },
  { name: "Yuma County Jail ICE", lat: 32.7321, lng: -114.6272, capacity: 300, occupancy: 0.78 },
  { name: "Las Cruces Processing", lat: 32.6393, lng: -106.4633, capacity: 250, occupancy: 0.82 },
  { name: "Brownsville Border Patrol", lat: 25.9017, lng: -97.4975, capacity: 1200, occupancy: 0.96 },
  { name: "McAllen Detention Center", lat: 26.2034, lng: -97.9433, capacity: 700, occupancy: 0.89 },
];

const createIcon = (type, color) => {
  const html = `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;box-shadow:0 0 8px ${color}60">${type}</div>`;
  return L.divIcon({ html, className: "", iconSize: [32, 32], popupAnchor: [0, -16] });
};

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 3959; // miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function VeteranAdvocacyGIS() {
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [heatmapIntensity, setHeatmapIntensity] = useState(1);
  const [showClusters, setShowClusters] = useState(true);

  const mapCenter = [31.9686, -99.9018];

  // Calculate clusters: within 50 miles of a detention facility
  const clusters = useMemo(() => {
    const clusterMap = {};
    DETENTION_FACILITIES.forEach(facility => {
      const nearbyVets = CASES.filter(vet => calculateDistance(vet.lat || 0, vet.lng || 0, facility.lat, facility.lng) <= 50);
      if (nearbyVets.length > 0) {
        clusterMap[facility.name] = {
          facility,
          veterans: nearbyVets,
          distance: 50,
          advocacyScore: (nearbyVets.length * facility.occupancy * 100).toFixed(1),
        };
      }
    });
    return Object.values(clusterMap);
  }, []);

  const clusterStats = useMemo(() => {
    return {
      totalClusters: clusters.length,
      totalVetsInClusters: clusters.reduce((sum, c) => sum + c.veterans.length, 0),
      avgOccupancy: (clusters.reduce((sum, c) => sum + c.facility.occupancy, 0) / clusters.length * 100).toFixed(1),
      highestRiskFacility: clusters.length > 0 ? clusters.reduce((max, c) => parseFloat(c.advocacyScore) > parseFloat(max.advocacyScore) ? c : max) : null,
    };
  }, [clusters]);

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1 }}>
      {/* Controls */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: P.t1 }}>🗺️ Veteran Advocacy Impact GIS</div>
          <div style={{ display: "flex", gap: 8 }}>
            <label style={{ fontSize: 7, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <input type="checkbox" checked={showClusters} onChange={(e) => setShowClusters(e.target.checked)} />
              Show Clusters
            </label>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 7, color: P.t4 }}>Heatmap Intensity:</span>
          <input type="range" min="0.2" max="2" step="0.1" value={heatmapIntensity} onChange={(e) => setHeatmapIntensity(parseFloat(e.target.value))}
            style={{ width: 120, cursor: "pointer" }} />
          <span style={{ fontSize: 7, color: P.t4, fontFamily: "'IBM Plex Mono',monospace" }}>{heatmapIntensity.toFixed(1)}x</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 12 }}>
        {[
          { label: "Active Clusters", value: clusterStats.totalClusters, color: P.cyan },
          { label: "Veterans in Clusters", value: clusterStats.totalVetsInClusters, color: P.gold },
          { label: "Avg Facility Occupancy", value: `${clusterStats.avgOccupancy}%`, color: P.red },
          { label: "Highest Risk Facility", value: clusterStats.highestRiskFacility?.facility.name.split(" ")[0] || "—", color: P.amber },
        ].map((stat, i) => (
          <div key={i} style={{ background: P.card, border: `1px solid ${stat.color}25`, borderLeft: `3px solid ${stat.color}`, borderRadius: 7, padding: "8px 10px" }}>
            <div style={{ fontSize: 6, color: P.t4, marginBottom: 3 }}>{stat.label}</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 800, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, overflow: "hidden", height: "500px", marginBottom: 12 }}>
        <MapContainer center={mapCenter} zoom={6} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
          
          {/* Heatmap circles for detention facility density */}
          {DETENTION_FACILITIES.map(facility => (
            <CircleMarker
              key={facility.name}
              center={[facility.lat, facility.lng]}
              radius={15 * facility.occupancy * heatmapIntensity}
              color="transparent"
              fillColor={facility.occupancy > 0.9 ? P.red : facility.occupancy > 0.8 ? P.amber : P.blue}
              fillOpacity={0.3}
            >
              <Tooltip direction="top" offset={[0, -15]} permanent={false} sticky>
                <span style={{ fontSize: 8 }}>
                  <strong>{facility.name}</strong><br />
                  Occupancy: {(facility.occupancy * 100).toFixed(0)}%
                </span>
              </Tooltip>
            </CircleMarker>
          ))}

          {/* Detention facility markers */}
          {DETENTION_FACILITIES.map(facility => (
            <Marker
              key={`facility-${facility.name}`}
              position={[facility.lat, facility.lng]}
              icon={createIcon("🚨", P.red)}
            >
              <Popup>
                <div style={{ fontSize: 8, color: P.t1 }}>
                  <strong>{facility.name}</strong><br />
                  Capacity: {facility.capacity} | Occupancy: {(facility.occupancy * 100).toFixed(0)}%<br />
                  <span style={{ color: P.amber }}>Current: {Math.round(facility.capacity * facility.occupancy)} detainees</span>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Veteran case markers */}
          {CASES.map(vet => (
            <Marker
              key={vet.id}
              position={[vet.lat || 32.5, vet.lng || -117]}
              icon={createIcon("🎖️", P.gold)}
            >
              <Popup>
                <div style={{ fontSize: 8, color: P.t1 }}>
                  <strong>{vet.id} — {vet.name}</strong><br />
                  {vet.branch} · {vet.country}<br />
                  <span style={{ color: vet.confidence >= 90 ? P.gold : P.amber }}>Confidence: {vet.confidence}%</span>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Cluster overlay circles */}
          {showClusters && clusters.map(cluster => (
            <CircleMarker
              key={`cluster-${cluster.facility.name}`}
              center={[cluster.facility.lat, cluster.facility.lng]}
              radius={25}
              color={P.cyan}
              fillColor="transparent"
              weight={2}
              dashArray="5,5"
              interactive={true}
              eventHandlers={{
                click: () => setSelectedCluster(selectedCluster?.facility.name === cluster.facility.name ? null : cluster),
              }}
            >
              <Tooltip direction="top" offset={[0, -15]} permanent={false}>
                <span style={{ fontSize: 8, color: P.cyan }}>
                  Cluster: {cluster.veterans.length} vets within 50 mi
                </span>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Cluster Detail Panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Clusters list */}
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 10 }}>📍 All Clusters ({clusters.length})</div>
          <div style={{ maxHeight: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {clusters.map(cluster => (
              <div
                key={cluster.facility.name}
                onClick={() => setSelectedCluster(selectedCluster?.facility.name === cluster.facility.name ? null : cluster)}
                style={{
                  padding: "8px 10px",
                  background: selectedCluster?.facility.name === cluster.facility.name ? `${P.cyan}15` : "#080D18",
                  border: `1px solid ${selectedCluster?.facility.name === cluster.facility.name ? P.cyan : P.b}`,
                  borderLeft: `3px solid ${P.gold}`,
                  borderRadius: 7,
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 8, fontWeight: 700, color: P.t1 }}>{cluster.facility.name}</span>
                  <span style={{ fontSize: 7, background: `${P.gold}15`, border: `1px solid ${P.gold}25`, color: P.gold, borderRadius: 20, padding: "1px 6px" }}>
                    Score: {cluster.advocacyScore}
                  </span>
                </div>
                <div style={{ fontSize: 7, color: P.t4, display: "flex", gap: 8 }}>
                  <span>🎖️ {cluster.veterans.length} vets</span>
                  <span>🚨 {(cluster.facility.occupancy * 100).toFixed(0)}% full</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected cluster detail */}
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
          {selectedCluster ? (
            <>
              <div style={{ fontSize: 9, fontWeight: 800, color: P.cyan, marginBottom: 10 }}>
                📊 {selectedCluster.facility.name}
              </div>
              <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
                <div style={{ padding: "8px", background: "#080D18", borderRadius: 6 }}>
                  <div style={{ fontSize: 6, color: P.t4, marginBottom: 2 }}>ADVOCACY IMPACT SCORE</div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 800, color: P.gold }}>{selectedCluster.advocacyScore}</div>
                  <div style={{ fontSize: 7, color: P.t4, marginTop: 2 }}>Veterans × Occupancy × 100</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  <div style={{ padding: "6px", background: "#080D18", borderRadius: 6, textAlign: "center" }}>
                    <div style={{ fontSize: 6, color: P.t4 }}>VETERANS</div>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 800, color: P.gold }}>{selectedCluster.veterans.length}</div>
                  </div>
                  <div style={{ padding: "6px", background: "#080D18", borderRadius: 6, textAlign: "center" }}>
                    <div style={{ fontSize: 6, color: P.t4 }}>OCCUPANCY</div>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 800, color: P.red }}>{(selectedCluster.facility.occupancy * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 8, color: P.t2, marginBottom: 8 }}>
                <strong>Veterans in cluster:</strong>
              </div>
              <div style={{ maxHeight: "120px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                {selectedCluster.veterans.map(vet => (
                  <div key={vet.id} style={{ fontSize: 7, padding: "4px 6px", background: "#080D18", borderRadius: 4, borderLeft: `2px solid ${P.gold}` }}>
                    <span style={{ color: P.gold, fontWeight: 700 }}>{vet.id}</span> — {vet.name} ({vet.confidence}%)
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", color: P.t4, padding: "40px 10px", fontSize: 8 }}>
              Click a cluster pin or card to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}