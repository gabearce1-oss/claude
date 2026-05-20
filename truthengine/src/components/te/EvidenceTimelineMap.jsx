import { useEffect, useRef } from "react";
import L from "leaflet";
import { P } from "../../lib/teData";

const EVENT_LOCATIONS = {
  washington_dc: { lat: 38.9072, lng: -77.0369, name: "Washington, DC", country: "USA" },
  arlington_va: { lat: 38.8816, lng: -77.0910, name: "Arlington, VA", country: "USA" },
  south_korea: { lat: 37.5665, lng: 126.9780, name: "South Korea", country: "KOR" },
  mexico: { lat: 23.6345, lng: -102.5528, name: "Mexico", country: "MEX" },
  vietnam: { lat: 21.0285, lng: 105.8542, name: "Vietnam", country: "VNM" },
  colombia: { lat: 4.5709, lng: -74.2973, name: "Colombia", country: "COL" },
};

const EVENT_GEO_MAPPING = {
  e1: "arlington_va",   // Draft
  e2: "washington_dc",  // Guzmán Study
  e3: "vietnam",        // Vietnam War Ends
  e4: "washington_dc",  // IIRIRA
  e5: "washington_dc",  // INA §329
  e6: "washington_dc",  // GAO Report
  e7: "washington_dc",  // EO-14012
  e8: "washington_dc",  // BISG Audit
  e9: "arlington_va",   // C001 Ramos
  e10: "washington_dc", // NERO Framework
  e11: "washington_dc", // F001 FOIA
  e12: "washington_dc", // F002 FOIA
  e13: "washington_dc", // F001 Overdue
  e14: "south_korea",   // C004 Park
  e15: "washington_dc", // F002 Overdue
  e16: "washington_dc", // BISG Sweep
  e17: "washington_dc", // TODAY
  e18: "washington_dc", // CHC Briefing
};

const TYPE_COLORS = {
  historical: "#4A9EFF",
  legal: "#FF5C5C",
  research: "#9D7BFF",
  foia: "#F5C842",
  case: "#FF8C42",
  milestone: "#1CCFB4",
};

export default function EvidenceTimelineMap({ events, selectedEvent, onEventSelect, selectedLocation, onLocationSelect }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([20, 0], 2);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 18,
    }).addTo(map);

    // Group events by location
    const eventsByLocation = {};
    events.forEach(ev => {
      const locKey = EVENT_GEO_MAPPING[ev.id];
      if (locKey && EVENT_LOCATIONS[locKey]) {
        if (!eventsByLocation[locKey]) {
          eventsByLocation[locKey] = [];
        }
        eventsByLocation[locKey].push(ev);
      }
    });

    // Create markers for each location with event clusters
    Object.entries(EVENT_LOCATIONS).forEach(([key, loc]) => {
      const locEvents = eventsByLocation[key] || [];
      if (locEvents.length === 0) return;

      // Determine marker color based on most severe event
      const maxSeverity = { critical: 3, high: 2, med: 1, low: 0 };
      const mostSevere = locEvents.reduce((a, b) =>
        (maxSeverity[a.severity] || 0) > (maxSeverity[b.severity] || 0) ? a : b
      );
      const markerColor = {
        critical: "#FF5C5C",
        high: "#F5C842",
        med: "#4A9EFF",
        low: "#1CCFB4",
      }[mostSevere.severity] || "#8B8B8B";

      // Create marker
      const marker = L.circleMarker([loc.lat, loc.lng], {
        radius: 12 + locEvents.length * 2,
        fillColor: markerColor,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: selectedLocation === key ? 0.9 : 0.6,
      })
        .bindPopup(`
          <div style="font-size: 11px; font-family: 'IBM Plex Mono', monospace;">
            <strong>${loc.name}</strong><br/>
            ${locEvents.length} event${locEvents.length !== 1 ? "s" : ""}
          </div>
        `)
        .on("click", () => {
          onLocationSelect(key);
          map.setView([loc.lat, loc.lng], 5);
        })
        .addTo(map);

      markersRef.current[key] = marker;
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [events, selectedLocation, onLocationSelect]);

  // Highlight selected marker
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([key, marker]) => {
      if (key === selectedLocation) {
        marker.setStyle({ fillOpacity: 0.9, weight: 3 });
      } else {
        marker.setStyle({ fillOpacity: 0.6, weight: 2 });
      }
    });
  }, [selectedLocation]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 8 }}>
      <div
        ref={mapRef}
        style={{
          flex: 1,
          borderRadius: 10,
          border: `1px solid ${P.b}`,
          background: "#030508",
          minHeight: 300,
        }}
      />

      {/* Location legend */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 8, padding: "8px 12px", maxHeight: 120, overflowY: "auto" }}>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 1, marginBottom: 6 }}>LOCATIONS</div>
        {Object.entries(EVENT_LOCATIONS).map(([key, loc]) => {
          const isSelected = selectedLocation === key;
          return (
            <div
              key={key}
              onClick={() => onLocationSelect(isSelected ? null : key)}
              style={{
                display: "flex",
                gap: 6,
                alignItems: "center",
                padding: "3px 0",
                borderBottom: `1px solid ${P.b}20`,
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: isSelected ? P.gold : P.t4,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 7, color: isSelected ? P.t1 : P.t4, fontWeight: isSelected ? 700 : 400 }}>
                {loc.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}