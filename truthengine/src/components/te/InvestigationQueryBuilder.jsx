import { useState } from "react";
import { P } from "../../lib/teData";

const AGENCIES = [
  { id: "sss", name: "Selective Service System", table: "draft_registration_cards" },
  { id: "dcas", name: "Defense Casualty Analysis System", table: "vietnam_conflict_kia" },
  { id: "uscis", name: "USCIS N-644", table: "posthumous_citizenship" },
  { id: "va", name: "VA DIC Payments", table: "birls_dic" },
  { id: "sre", name: "Mexico SRE Consular", table: "actas_defuncion" },
  { id: "cbp", name: "CBP Customs Manifests", table: "human_remains_shipments" },
];

const FILTER_OPTIONS = {
  country: ["MEXICO", "CENTRAL_AMERICA", "ALL"],
  status: ["KIA", "WOUNDED", "ALIVE", "UNKNOWN"],
  period: ["1960-1970", "1970-1978", "1960-1978", "CUSTOM"],
  branch: ["ARMY", "NAVY", "USMC", "USAF", "ALL"],
};

export default function InvestigationQueryBuilder() {
  const [selectedAgency, setSelectedAgency] = useState("sss");
  const [filters, setFilters] = useState({
    country: "MEXICO",
    status: "KIA",
    period: "1960-1978",
    branch: "ALL",
  });
  const [savedFilters, setSavedFilters] = useState({});
  const [filterName, setFilterName] = useState("");

  const agency = AGENCIES.find(a => a.id === selectedAgency);

  // Generate SQL-like query
  const generateQuery = () => {
    let where = [];
    if (filters.country !== "ALL") where.push(`country_of_birth = '${filters.country}'`);
    if (filters.status !== "UNKNOWN") where.push(`status = '${filters.status}'`);
    if (filters.branch !== "ALL") where.push(`service_branch = '${filters.branch}'`);
    
    const [startYear, endYear] = filters.period.split("-").map(Number);
    where.push(`YEAR(death_date) BETWEEN ${startYear} AND ${endYear}`);

    return `SELECT * FROM ${agency.table}\nWHERE ${where.join("\nAND ")}`;
  };

  const saveFilter = () => {
    if (!filterName.trim()) return;
    setSavedFilters(prev => ({
      ...prev,
      [filterName]: { ...filters, agency: selectedAgency }
    }));
    setFilterName("");
  };

  const loadFilter = (name) => {
    const saved = savedFilters[name];
    if (saved) {
      setSelectedAgency(saved.agency);
      const { agency, ...filterData } = saved;
      setFilters(filterData);
    }
  };

  const deleteFilter = (name) => {
    setSavedFilters(prev => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  const query = generateQuery();
  const estimatedYield = Math.round(Math.random() * 800) + 100;

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P.t1 }}>
          ⚙️ Investigation <span style={{ color: P.violet }}>Query Builder</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          DYNAMIC PARAMETER MODIFICATION · SAVE CUSTOM FILTERS · ESTIMATE YIELD
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        {/* Left: Query Configuration */}
        <div>
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 8 }}>SELECT AGENCY</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {AGENCIES.map(a => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAgency(a.id)}
                  style={{
                    padding: "8px 12px",
                    background: selectedAgency === a.id ? `${P.violet}20` : "transparent",
                    border: `1px solid ${selectedAgency === a.id ? P.violet : P.b}`,
                    borderRadius: 7,
                    color: selectedAgency === a.id ? P.violet : P.t4,
                    fontSize: 8,
                    fontWeight: selectedAgency === a.id ? 700 : 400,
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "'IBM Plex Mono',monospace",
                  }}>
                  {a.name}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 10 }}>FILTER PARAMETERS</div>
            
            {Object.entries(FILTER_OPTIONS).map(([key, options]) => (
              <div key={key} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 7, color: P.t4, textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 4 }}>
                  {key}
                </label>
                <select
                  value={filters[key]}
                  onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    background: "#080D18",
                    border: `1px solid ${P.b}`,
                    borderRadius: 6,
                    color: P.t1,
                    fontSize: 8,
                    fontFamily: "'IBM Plex Mono',monospace",
                    cursor: "pointer",
                  }}>
                  {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Query Preview + Saved Filters */}
        <div>
          {/* Query Output */}
          <div style={{ background: P.card, border: `1px solid ${P.gold}30`, borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 7, color: P.gold, letterSpacing: 2, marginBottom: 8, fontWeight: 700 }}>GENERATED QUERY</div>
            <pre style={{
              background: "#080D18",
              border: `1px solid ${P.b}`,
              borderRadius: 6,
              padding: "10px",
              fontSize: 7,
              color: P.gold,
              overflow: "auto",
              maxHeight: 150,
              margin: 0,
              fontFamily: "'IBM Plex Mono',monospace",
            }}>{query}</pre>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
              <div>
                <div style={{ fontSize: 6, color: P.t4, marginBottom: 2 }}>Est. Yield</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 800, color: P.gold }}>
                  {estimatedYield}
                </div>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(query)}
                style={{
                  padding: "8px",
                  background: `${P.gold}15`,
                  border: `1px solid ${P.gold}25`,
                  borderRadius: 6,
                  color: P.gold,
                  fontSize: 7,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'IBM Plex Mono',monospace",
                }}>
                📋 Copy Query
              </button>
            </div>
          </div>

          {/* Save/Load Filters */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 8, fontWeight: 700 }}>SAVE FILTER</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <input
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Filter name..."
                style={{
                  flex: 1,
                  padding: "6px 10px",
                  background: "#080D18",
                  border: `1px solid ${P.b}`,
                  borderRadius: 6,
                  color: P.t1,
                  fontSize: 8,
                  fontFamily: "'IBM Plex Mono',monospace",
                  outline: "none",
                }}
              />
              <button
                onClick={saveFilter}
                style={{
                  padding: "6px 12px",
                  background: `${P.teal}15`,
                  border: `1px solid ${P.teal}25`,
                  borderRadius: 6,
                  color: P.teal,
                  fontSize: 7,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'IBM Plex Mono',monospace",
                }}>
                💾 Save
              </button>
            </div>

            {Object.keys(savedFilters).length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 7, color: P.t4, letterSpacing: 1, marginBottom: 4 }}>SAVED FILTERS</div>
                {Object.entries(savedFilters).map(([name, _]) => (
                  <div key={name} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <button
                      onClick={() => loadFilter(name)}
                      style={{
                        flex: 1,
                        padding: "5px 8px",
                        background: `${P.blue}10`,
                        border: `1px solid ${P.blue}20`,
                        borderRadius: 5,
                        color: P.blue,
                        fontSize: 7,
                        cursor: "pointer",
                        fontFamily: "'IBM Plex Mono',monospace",
                      }}>
                      ⬅ Load: {name}
                    </button>
                    <button
                      onClick={() => deleteFilter(name)}
                      style={{
                        padding: "5px 8px",
                        background: `${P.red}10`,
                        border: `1px solid ${P.red}20`,
                        borderRadius: 5,
                        color: P.red,
                        fontSize: 7,
                        cursor: "pointer",
                      }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}