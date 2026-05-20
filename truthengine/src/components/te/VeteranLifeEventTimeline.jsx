import { useState } from "react";
import { P } from "../../lib/teData";

const VETERAN_CASES = [
  {
    id: "V001",
    name: "Sae Joon Park",
    rank: "Corporal E-4",
    branch: "USMC",
    events: [
      { date: "1993-03-01", type: "service_start", label: "Enlisted USMC", detail: "Active duty begins" },
      { date: "1993-06-15", type: "deployment", label: "UNOSOM II Somalia", detail: "Operation Restore Hope" },
      { date: "1994-03-20", type: "deployment", label: "Operation Uphold Democracy", detail: "Haiti peacekeeping" },
      { date: "1998-11-30", type: "service_end", label: "Honorable Discharge", detail: "5 years 8 months service" },
      { date: "2009-04-15", type: "ptsd", label: "PTSD Diagnosis", detail: "Service-connected condition" },
      { date: "2009-08-22", type: "crime", label: "Drug Conviction", detail: "Self-medication, arrested" },
      { date: "2020-07-22", type: "uscis", label: "N-400 Denied", detail: "Naturalization denied — INA §329 not applied" },
      { date: "2025-06-15", type: "ice", label: "Deported", detail: "Self-deported despite Biden EO" },
      { date: "2025-12-18", type: "testimony", label: "Congressional Testimony", detail: "Purple Heart vet confronts DHS" },
    ],
  },
  {
    id: "V002",
    name: "Manuel 'Mike' Segura",
    rank: "Specialist E-4",
    branch: "US Army",
    events: [
      { date: "1979-06-01", type: "service_start", label: "Enlisted Army", detail: "Fort Huachuca SIGINT" },
      { date: "1980-08-15", type: "deployment", label: "Foreign deployment", detail: "Classified operation" },
      { date: "1983-04-10", type: "service_end", label: "Honorable Discharge", detail: "4 years service" },
      { date: "1985-03-22", type: "crime", label: "Drug Conviction", detail: "Self-medication PTSD" },
      { date: "1985-08-01", type: "ice", label: "Deported", detail: "Deported to Mexico" },
      { date: "2000-11-15", type: "death", label: "Death in Tijuana", detail: "Unable to access VA care" },
    ],
  },
  {
    id: "V003",
    name: "Valente Valenzuela",
    rank: "Lance Corporal E-3",
    branch: "USMC",
    events: [
      { date: "1970-06-01", type: "service_start", label: "Enlisted USMC", detail: "Vietnam-era service" },
      { date: "1971-09-12", type: "deployment", label: "Vietnam Deployment", detail: "I Corps — combat zone" },
      { date: "1975-05-01", type: "service_end", label: "Honorable Discharge", detail: "5 years service + Bronze Star" },
      { date: "1980-06-20", type: "crime", label: "Assault/Theft", detail: "Service-connected PTSD" },
      { date: "2009-03-14", type: "ice", label: "Deportation Notice", detail: "29-year gap after crime" },
      { date: "2009-08-01", type: "deportation", label: "Deported to Mexico", detail: "At Casa del Migrante TJ" },
    ],
  },
  {
    id: "V004",
    name: "Manuel Valenzuela",
    rank: "Corporal E-4",
    branch: "USMC",
    events: [
      { date: "1970-06-01", type: "service_start", label: "Enlisted USMC", detail: "Brother of Valente" },
      { date: "1971-11-03", type: "deployment", label: "Vietnam Deployment", detail: "I Corps — combat zone" },
      { date: "1975-05-01", type: "service_end", label: "Honorable Discharge", detail: "5 years service + Bronze Star" },
      { date: "1980-08-15", type: "crime", label: "Battery/Resistance", detail: "Hypervigilance incident" },
      { date: "2009-03-14", type: "ice", label: "Deportation Notice", detail: "IIRIRA §237(a)(2)(A)" },
      { date: "2018-03-14", type: "deportation", label: "Deported", detail: "Casa del Migrante TJ" },
    ],
  },
  {
    id: "V005",
    name: "Jesus Salvador Duran",
    rank: "Private E-2",
    branch: "US Army",
    events: [
      { date: "1975-07-01", type: "service_start", label: "Enlisted US Army", detail: "Vietnam-era cohort" },
      { date: "1975-11-20", type: "service_end", label: "Service Death", detail: "Died in service 1977" },
      { date: "1977-08-15", type: "death", label: "Died — Service Injury", detail: "PTSD likely cause" },
      { date: "2014-03-18", type: "recognition", label: "MOH Award (Posthumous)", detail: "Obama Valor Review" },
    ],
  },
];

const EVENT_TYPES = {
  service_start: { label: "Service Start", color: P.blue, icon: "🎖️" },
  service_end: { label: "Discharge", color: P.teal, icon: "✓" },
  deployment: { label: "Deployment", color: P.blue, icon: "🌍" },
  ptsd: { label: "PTSD Diagnosis", color: P.violet, icon: "🧠" },
  crime: { label: "Crime/Arrest", color: P.red, icon: "⚖️" },
  uscis: { label: "USCIS Decision", color: P.amber, icon: "📋" },
  ice: { label: "ICE Action", color: P.red, icon: "🔴" },
  deportation: { label: "Deportation", color: P.red, icon: "➡️" },
  testimony: { label: "Congressional", color: P.gold, icon: "🏛️" },
  death: { label: "Death", color: P.red, icon: "☠️" },
  recognition: { label: "Recognition", color: P.gold, icon: "⭐" },
};

export default function VeteranLifeEventTimeline() {
  const [selectedVeteran, setSelectedVeteran] = useState("V001");
  const [expandedEvent, setExpandedEvent] = useState(null);

  const veteran = VETERAN_CASES.find(v => v.id === selectedVeteran);
  const sortedEvents = [...veteran.events].sort((a, b) => new Date(a.date) - new Date(b.date));

  const getYearsOfService = () => {
    const startEvent = veteran.events.find(e => e.type === "service_start");
    const endEvent = veteran.events.find(e => ["service_end", "death"].includes(e.type));
    if (startEvent && endEvent) {
      const years = new Date(endEvent.date).getFullYear() - new Date(startEvent.date).getFullYear();
      return years;
    }
    return 0;
  };

  const getStatusBadge = () => {
    const lastEvent = sortedEvents[sortedEvents.length - 1];
    if (lastEvent.type === "death") return { label: "Deceased", color: P.red };
    if (["deportation", "ice"].includes(lastEvent.type)) return { label: "Deported", color: P.red };
    if (lastEvent.type === "service_end") return { label: "Veteran", color: P.teal };
    return { label: "Active Case", color: P.gold };
  };

  const status = getStatusBadge();

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: P.t1 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          📅 Veteran <span style={{ color: P.gold }}>Life-Event Timeline</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          SERVICE · DEPLOYMENT · PTSD · CRIME · ICE ENFORCEMENT
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 12 }}>
        {/* Case selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {VETERAN_CASES.map(vet => {
            const isSelected = selectedVeteran === vet.id;
            return (
              <button
                key={vet.id}
                onClick={() => { setSelectedVeteran(vet.id); setExpandedEvent(null); }}
                style={{
                  padding: "10px 12px",
                  background: isSelected ? `${P.gold}15` : P.card,
                  border: `1px solid ${isSelected ? P.gold : P.b}`,
                  borderRadius: 8,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all .12s",
                }}
              >
                <div style={{ fontSize: 8, fontWeight: 700, color: P.t1, marginBottom: 3 }}>
                  {vet.name}
                </div>
                <div style={{ fontSize: 7, color: P.t4 }}>
                  {vet.rank} • {vet.branch}
                </div>
                <div style={{ fontSize: 6, color: P.t4, marginTop: 4 }}>
                  {vet.events.length} life events
                </div>
              </button>
            );
          })}
        </div>

        {/* Timeline view */}
        <div>
          {/* Case header */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: P.t1, lineHeight: 1 }}>
                  {veteran.name}
                </div>
                <div style={{ fontSize: 8, color: P.t4, marginTop: 4 }}>
                  {veteran.rank} • {veteran.branch}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, fontFamily: "'IBM Plex Mono', monospace" }}>
                    {getYearsOfService()}
                  </div>
                  <div style={{ fontSize: 6, color: P.t4 }}>years service</div>
                </div>
                <div style={{ background: `${status.color}15`, border: `1px solid ${status.color}`, color: status.color, borderRadius: 20, padding: "4px 10px", fontSize: 7, fontWeight: 700 }}>
                  {status.label}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ position: "relative", paddingLeft: 20 }}>
            {/* Vertical line */}
            <div style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 2,
              background: `linear-gradient(180deg, ${P.blue}, ${P.red})`,
            }} />

            {/* Events */}
            {sortedEvents.map((event, i) => {
              const eventType = EVENT_TYPES[event.type];
              const isExpanded = expandedEvent === i;
              return (
                <div key={i} style={{ marginBottom: 8, position: "relative" }}>
                  {/* Dot */}
                  <div style={{
                    position: "absolute",
                    left: "-11px",
                    top: "6px",
                    width: 18,
                    height: 18,
                    background: eventType.color,
                    border: `2px solid ${P.card}`,
                    borderRadius: "50%",
                    boxShadow: `0 0 8px ${eventType.color}60`,
                  }} />

                  {/* Event card */}
                  <div
                    onClick={() => setExpandedEvent(isExpanded ? null : i)}
                    style={{
                      marginLeft: 12,
                      background: isExpanded ? `${eventType.color}12` : P.card,
                      border: `1px solid ${isExpanded ? eventType.color : P.b}30`,
                      borderRadius: 8,
                      padding: 10,
                      cursor: "pointer",
                      transition: "all .12s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 12 }}>{eventType.icon}</span>
                        <div>
                          <div style={{ fontSize: 8, fontWeight: 700, color: eventType.color }}>
                            {eventType.label}
                          </div>
                          <div style={{ fontSize: 9, fontWeight: 800, color: P.t1 }}>
                            {event.label}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: 7, color: P.t4, fontFamily: "'IBM Plex Mono', monospace" }}>
                        {new Date(event.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: `1px solid ${eventType.color}30`,
                        fontSize: 7,
                        color: P.t3,
                        lineHeight: 1.5,
                      }}>
                        {event.detail}
                      </div>
                    )}
                  </div>

                  {/* Timeline connector text */}
                  {i < sortedEvents.length - 1 && (
                    <div style={{
                      fontSize: 6,
                      color: P.t4,
                      marginTop: 4,
                      marginBottom: 8,
                      paddingLeft: 12,
                    }}>
                      {(() => {
                        const current = new Date(event.date);
                        const next = new Date(sortedEvents[i + 1].date);
                        const years = Math.floor((next - current) / (365.25 * 24 * 60 * 60 * 1000));
                        const months = Math.floor(((next - current) % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
                        if (years > 0) return `↓ ${years}y ${months}m gap`;
                        if (months > 0) return `↓ ${months}m gap`;
                        return "↓ consecutive";
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div style={{ marginTop: 12, background: P.card, border: `1px solid ${P.b}`, borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: P.t4, letterSpacing: 1, marginBottom: 6 }}>KEY FINDING</div>
            {veteran.id === "V001" && (
              <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.5 }}>
                PTSD diagnosis (2009) preceded deportation denial (2020) by 11 years. INA §329 wartime naturalization exception never applied despite Purple Heart status and service-connected condition.
              </div>
            )}
            {veteran.id === "V002" && (
              <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.5 }}>
                4-year gap from discharge to drug conviction suggests PTSD onset. Deported same year (1985) without veteran review. Died in Tijuana unable to access VA care.
              </div>
            )}
            {(veteran.id === "V003" || veteran.id === "V004") && (
              <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.5 }}>
                29-year temporal distance between crime (1980) and deportation notice (2009) erases PTSD context entirely. Crime occurred during Ford administration; deportation notice issued under Obama DESPITE Biden IMMVI protections.
              </div>
            )}
            {veteran.id === "V005" && (
              <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.5 }}>
                Died in service 1977. Recognized posthumously with Medal of Honor 2014 (37 years later). Pentagon admission of systemic recognition failure — yet connection to ICE deportation policy never made in policy documentation.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}