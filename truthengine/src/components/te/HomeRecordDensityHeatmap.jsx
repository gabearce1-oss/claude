import { useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Rectangle } from "react-leaflet";
import { P } from "../../lib/teData";

// Historical Home of Record data for Mexican-born Vietnam KIA
const HOME_OF_RECORD_CLUSTERS = [
  { state: "Texas", city: "San Antonio", lat: 29.4241, lng: -98.4936, kia: 287, density: "VERY HIGH", enlistment_rate: 0.089 },
  { state: "Texas", city: "El Paso", lat: 31.7683, lng: -106.4425, kia: 156, density: "HIGH", enlistment_rate: 0.067 },
  { state: "California", city: "Los Angeles", lat: 34.0522, lng: -118.2437, kia: 198, density: "HIGH", enlistment_rate: 0.061 },
  { state: "New Mexico", city: "Albuquerque", lat: 35.0844, lng: -106.6504, kia: 142, density: "HIGH", enlistment_rate: 0.112 },
  { state: "Arizona", city: "Phoenix", lat: 33.4484, lng: -112.0742, kia: 89, density: "MEDIUM", enlistment_rate: 0.051 },
  { state: "Colorado", city: "Denver", lat: 39.7392, lng: -104.9903, kia: 67, density: "MEDIUM", enlistment_rate: 0.043 },
  { state: "Illinois", city: "Chicago", lat: 41.8781, lng: -87.6298, kia: 112, density: "MEDIUM", enlistment_rate: 0.038 },
  { state: "New York", city: "New York City", lat: 40.7128, lng: -74.0060, kia: 89, density: "MEDIUM", enlistment_rate: 0.035 },
  { state: "Michigan", city: "Detroit", lat: 42.3314, lng: -83.0458, kia: 76, density: "MEDIUM", enlistment_rate: 0.041 },
  { state: "Pennsylvania", city: "Philadelphia", lat: 39.9526, lng: -75.1652, kia: 63, density: "LOW-MEDIUM", enlistment_rate: 0.032 },
];

// Current ICE detention centers (proximity analysis)
const ICE_DETENTION_CENTERS = [
  { name: "South Texas ICE", city: "Pearsall, TX", lat: 28.9181, lng: -99.0090, capacity: 2000, distance_to_nearest_hor: 125 },
  { name: "El Paso Processing Center", city: "El Paso, TX", lat: 31.8254, lng: -106.4826, capacity: 932, distance_to_nearest_hor: 8 },
  { name: "Yuma ICE", city: "Yuma, AZ", lat: 32.6964, lng: -114.6269, capacity: 640, distance_to_nearest_hor: 180 },
  { name: "Adelanto ICE", city: "Adelanto, CA", lat: 34.5789, lng: -117.4020, capacity: 1940, distance_to_nearest_hor: 250 },
  { name: "Denver ICE", city: "Denver, CO", lat: 39.7392, lng: -104.9903, capacity: 400, distance_to_nearest_hor: 0 },
];

// Heatmap intensity function based on KIA density
const getHeatmapColor = (kia) => {
  if (kia >= 250) return { color: P.red, opacity: 0.9, radius: 80 };
  if (kia >= 150) return { color: P.orange, opacity: 0.8, radius: 60 };
  if (kia >= 100) return { color: P.amber, opacity: 0.7, radius: 50 };
  if (kia >= 75) return { color: P.gold, opacity: 0.6, radius: 40 };
  return { color: P.violet, opacity: 0.5, radius: 30 };
};

export default function HomeRecordDensityHeatmap() {
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [showDetention, setShowDetention] = useState(true);
  const [showDensity, setShowDensity] = useState(true);
  const [analysisView, setAnalysisView] = useState("heatmap"); // heatmap | correlation | risk

  const totalKIA = useMemo(() => HOME_OF_RECORD_CLUSTERS.reduce((sum, c) => sum + c.kia, 0), []);
  const avgEnlistmentRate = useMemo(() => {
    const avg = HOME_OF_RECORD_CLUSTERS.reduce((sum, c) => sum + c.enlistment_rate, 0) / HOME_OF_RECORD_CLUSTERS.length;
    return (avg * 100).toFixed(2);
  }, []);

  // Proximity correlation analysis
  const proximityAnalysis = useMemo(() => {
    return HOME_OF_RECORD_CLUSTERS.map(hor => {
      const nearest = ICE_DETENTION_CENTERS.reduce((closest, ice) => {
        const dist = Math.sqrt(Math.pow(hor.lat - ice.lat, 2) + Math.pow(hor.lng - ice.lng, 2)) * 69; // miles
        return dist < (closest.dist || Infinity) ? { ...ice, dist } : closest;
      }, {});
      return { ...hor, nearest_detention: nearest };
    });
  }, []);

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1 }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${P.b}` }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: P.t1, marginBottom: 6 }}>
          🗺️ Home of Record Density Heatmap · Vietnam KIA
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 1 }}>
          MEXICAN-BORN ENLISTMENT DENSITY · ICE DETENTION PROXIMITY ANALYSIS · CORRELATION MAPPING
        </div>
      </div>

      {/* Controls */}
      <div style={{ padding: "10px 20px", borderBottom: `1px solid ${P.b}`, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {/* View Mode */}
        <div style={{ display: "flex", gap: 3, background: P.card, border: `1px solid ${P.b}`, borderRadius: 20, overflow: "hidden" }}>
          {[
            { id: "heatmap", label: "🔴 Heatmap" },
            { id: "correlation", label: "🔗 Correlation" },
            { id: "risk", label: "⚠️ Risk" },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setAnalysisView(m.id)}
              style={{
                padding: "5px 12px",
                background: analysisView === m.id ? `${P.gold}20` : "transparent",
                border: "none",
                color: analysisView === m.id ? P.gold : P.t4,
                fontSize: 7,
                fontWeight: analysisView === m.id ? 800 : 600,
                cursor: "pointer",
                fontFamily: "'IBM Plex Mono',monospace",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Toggles */}
        <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 7, color: P.t3, cursor: "pointer" }}>
          <input type="checkbox" checked={showDensity} onChange={(e) => setShowDensity(e.target.checked)} />
          Show Density
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 7, color: P.t3, cursor: "pointer" }}>
          <input type="checkbox" checked={showDetention} onChange={(e) => setShowDetention(e.target.checked)} />
          Show Detention Centers
        </label>
      </div>

      {/* Main Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 250px", gap: 0, height: "calc(100vh - 200px)" }}>
        {/* Map */}
        <div style={{ background: "#0F1419", borderRight: `1px solid ${P.b}` }}>
          {analysisView === "heatmap" && (
            <MapContainer center={[39, -98]} zoom={4} style={{ width: "100%", height: "100%" }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" />

              {/* Home of Record Heatmap Layer */}
              {showDensity &&
                HOME_OF_RECORD_CLUSTERS.map((cluster, i) => {
                  const style = getHeatmapColor(cluster.kia);
                  return (
                    <CircleMarker
                      key={`hor-${i}`}
                      center={[cluster.lat, cluster.lng]}
                      radius={style.radius}
                      fillColor={style.color}
                      color={style.color}
                      weight={1}
                      opacity={style.opacity}
                      fillOpacity={style.opacity * 0.6}
                      eventHandlers={{
                        click: () => setSelectedCluster(cluster),
                      }}
                    >
                      <Popup>
                        <div style={{ fontSize: 8, fontFamily: "'IBM Plex Mono',monospace" }}>
                          <strong>{cluster.city}, {cluster.state}</strong><br />
                          KIA: {cluster.kia} | Density: {cluster.density}
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}

              {/* ICE Detention Centers */}
              {showDetention &&
                ICE_DETENTION_CENTERS.map((ice, i) => (
                  <CircleMarker
                    key={`ice-${i}`}
                    center={[ice.lat, ice.lng]}
                    radius={12}
                    fillColor={P.cyan}
                    color={P.cyan}
                    weight={2}
                    opacity={0.8}
                    fillOpacity={0.4}
                  >
                    <Popup>
                      <div style={{ fontSize: 8, fontFamily: "'IBM Plex Mono',monospace" }}>
                        <strong>{ice.name}</strong><br />
                        Capacity: {ice.capacity} | Nearest HOR: {ice.distance_to_nearest_hor}mi
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
            </MapContainer>
          )}

          {analysisView === "correlation" && (
            <div style={{ padding: "20px", overflowY: "auto", height: "100%" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 12 }}>
                HOR-Detention Proximity Correlation
              </div>
              {proximityAnalysis.map((item, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: 10,
                    padding: "10px",
                    background: P.card,
                    borderLeft: `4px solid ${item.kia >= 150 ? P.red : P.amber}`,
                    borderRadius: 6,
                    fontSize: 7,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <strong>{item.city}, {item.state}</strong>
                    <span style={{ color: item.nearest_detention.dist < 100 ? P.red : P.gold }}>
                      {item.nearest_detention.dist?.toFixed(0)}mi
                    </span>
                  </div>
                  <div style={{ color: P.t4 }}>
                    {item.kia} KIA · Nearest: {item.nearest_detention.name || "N/A"}
                  </div>
                </div>
              ))}
            </div>
          )}

          {analysisView === "risk" && (
            <div style={{ padding: "20px", overflowY: "auto", height: "100%" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 12 }}>
                Detention Proximity Risk Score
              </div>
              {proximityAnalysis
                .sort((a, b) => (a.nearest_detention.dist || Infinity) - (b.nearest_detention.dist || Infinity))
                .map((item, i) => {
                  const risk = item.nearest_detention.dist < 100 ? "CRITICAL" : item.nearest_detention.dist < 300 ? "HIGH" : "MEDIUM";
                  const riskColor = risk === "CRITICAL" ? P.red : risk === "HIGH" ? P.amber : P.gold;
                  return (
                    <div
                      key={i}
                      style={{
                        marginBottom: 10,
                        padding: "10px",
                        background: `${riskColor}08`,
                        border: `1px solid ${riskColor}25`,
                        borderRadius: 6,
                        fontSize: 7,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                        <strong style={{ color: riskColor }}>{item.city}, {item.state}</strong>
                        <span style={{ color: riskColor, fontWeight: 800 }}>{risk}</span>
                      </div>
                      <div style={{ color: P.t4, marginBottom: 3 }}>
                        {item.kia} KIA ({(((item.kia / totalKIA) * 100).toFixed(1))}% of total)
                      </div>
                      <div style={{ color: riskColor, fontSize: 6 }}>
                        {item.nearest_detention.dist?.toFixed(0)}mi to {item.nearest_detention.name}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Stats Sidebar */}
        <div style={{ padding: "14px", background: P.card, borderLeft: `1px solid ${P.b}`, overflowY: "auto" }}>
          {/* KPI Cards */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 6, color: P.t4, letterSpacing: 1, marginBottom: 6 }}>AGGREGATE</div>
            {[
              { l: "Total KIA Identified", v: totalKIA, c: P.red },
              { l: "High-Density Cities", v: HOME_OF_RECORD_CLUSTERS.filter(c => c.density === "HIGH" || c.density === "VERY HIGH").length, c: P.amber },
              { l: "Avg Enlistment Rate", v: `${avgEnlistmentRate}%`, c: P.gold },
              { l: "Detention Centers", v: ICE_DETENTION_CENTERS.length, c: P.cyan },
            ].map((s, i) => (
              <div key={i} style={{ marginBottom: 8, padding: "6px 8px", background: "#080D18", borderRadius: 6 }}>
                <div style={{ fontSize: 6, color: P.t4 }}>{s.l}</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, fontWeight: 800, color: s.c }}>
                  {s.v}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ marginBottom: 12, padding: "10px 8px", background: "#080D18", borderRadius: 6 }}>
            <div style={{ fontSize: 6, color: P.t4, letterSpacing: 1, marginBottom: 8 }}>DENSITY LEGEND</div>
            {[
              { label: "Very High (250+)", color: P.red },
              { label: "High (150-249)", color: P.orange },
              { label: "Medium (75-149)", color: P.gold },
              { label: "Low (50-74)", color: P.violet },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: item.color, opacity: 0.7 }} />
                <span style={{ fontSize: 6, color: P.t3 }}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Selected Details */}
          {selectedCluster && (
            <div style={{ padding: "10px 8px", background: `${P.gold}08`, border: `1px solid ${P.gold}20`, borderRadius: 6 }}>
              <div style={{ fontSize: 8, fontWeight: 800, color: P.gold, marginBottom: 6 }}>
                {selectedCluster.city}, {selectedCluster.state}
              </div>
              {[
                { l: "KIA", v: selectedCluster.kia },
                { l: "Density", v: selectedCluster.density },
                { l: "Enlist Rate", v: `${(selectedCluster.enlistment_rate * 100).toFixed(1)}%` },
                { l: "% of Total", v: `${((selectedCluster.kia / totalKIA) * 100).toFixed(1)}%` },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 7, marginBottom: 3, color: P.t2 }}>
                  <span>{s.l}:</span>
                  <strong>{s.v}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}