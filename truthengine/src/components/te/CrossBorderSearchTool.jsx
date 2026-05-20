import { useState } from "react";
import { P } from "../../lib/teData";

export default function CrossBorderSearchTool() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("all");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);

  const LOCATIONS = [
    { id: "all", label: "All Border Regions", icon: "🗺️" },
    { id: "mexico", label: "Mexico (Tijuana, Juárez, Nogales)", icon: "🇲🇽" },
    { id: "guatemala", label: "Guatemala (Tapachula, Palenque)", icon: "🇬🇹" },
    { id: "honduras", label: "Honduras (San Pedro Sula)", icon: "🇭🇳" },
    { id: "elsalvador", label: "El Salvador", icon: "🇸🇻" },
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResults([
      { id: 1, name: "Casa del Migrante", location: "Tijuana, Mexico", type: "Shelter", capacity: 200, services: "Medical, Legal Aid, Food" },
      { id: 2, name: "El Refugio", location: "Ciudad Juárez, Mexico", type: "Shelter", capacity: 80, services: "Lodging, Basic Healthcare" },
      { id: 3, name: "Albergue Nacional", location: "Nogales, Mexico", type: "Shelter", capacity: 35, services: "Transit Housing, Meals" },
    ]);
    setSearching(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          🔍 Cross-Border <span style={{ color: P.teal }}>Search Tool</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          SHELTERS · LEGAL AID · DEPORTEE NETWORKS · MEXICO & CENTRAL AMERICA
        </div>
      </div>

      {/* Search Controls */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 10, marginBottom: 10 }}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search shelters, organizations, services..."
            style={{ padding: "8px 12px", background: "#080D18", border: `1px solid ${P.b}`, borderRadius: 6, color: P.t1, fontSize: 8, outline: "none" }} />
          <button onClick={handleSearch} disabled={searching}
            style={{ padding: "8px 12px", background: `${P.teal}15`, border: `1px solid ${P.teal}25`, color: P.teal, borderRadius: 6, fontWeight: 700, cursor: "pointer", fontSize: 8 }}>
            {searching ? "⟳ Searching..." : "🔍 Search"}
          </button>
        </div>

        <div style={{ fontSize: 7, color: P.t4, marginBottom: 8, letterSpacing: 1 }}>FILTER BY REGION</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 6 }}>
          {LOCATIONS.map(l => (
            <button key={l.id} onClick={() => setLocation(l.id)}
              style={{ padding: "8px", fontSize: 7, fontWeight: location === l.id ? 700 : 400,
                background: location === l.id ? `${P.teal}12` : "transparent",
                border: `1px solid ${location === l.id ? P.teal : P.b}`,
                color: location === l.id ? P.teal : P.t4, borderRadius: 6, cursor: "pointer" }}>
              {l.icon} {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {results.length > 0 ? (
          results.map(r => (
            <div key={r.id} style={{ background: P.card, border: `1px solid ${P.b}`, borderLeft: `4px solid ${P.teal}`, borderRadius: 9, padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: P.t1 }}>{r.name}</div>
                  <div style={{ fontSize: 7, color: P.t4, marginTop: 2 }}>{r.location}</div>
                </div>
                <span style={{ fontSize: 7, background: `${P.teal}12`, border: `1px solid ${P.teal}25`, color: P.teal, borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>{r.type}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 7, color: P.t3 }}>
                <span>Capacity: <strong style={{ color: P.teal }}>{r.capacity}</strong></span>
                <span>Services: <strong style={{ color: P.teal }}>{r.services}</strong></span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 8, color: P.t4, textAlign: "center", padding: 20 }}>
            Enter a search query and select a region to find shelters and support organizations.
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div style={{ marginTop: 12, background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 8 }}>RESOURCES</div>
        {[
          ["UNHCR Mexico Directory", "https://help.unhcr.org/mexico/en/where-to-seek-help/albergues/", P.blue],
          ["COMAR - Mexican Asylum Commission", "https://www.gob.mx/comar", P.violet],
          ["LULAC Deported Veterans Network", "https://lulac.org", P.gold],
        ].map(([name, url, color]) => (
          <a key={name} href={url} target="_blank" rel="noreferrer"
            style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${P.b}20`, textDecoration: "none" }}>
            <span style={{ fontSize: 7, color: color }}>{name}</span>
            <span style={{ fontSize: 7, color: P.t4 }}>↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}