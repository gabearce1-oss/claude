import { useState, useEffect } from "react";
import { P, CASES } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

export default function VeteranDataDashboard() {
  const [veterans, setVeterans] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedVeteran, setSelectedVeteran] = useState(null);

  useEffect(() => {
    const fetchVeterans = async () => {
      try {
        setLoading(true);
        const data = await base44.entities.ResearchDoc.filter({ cluster_tags: "veteran" }, "-updated_date", 50);
        setVeterans(data || []);
      } catch (err) {
        console.error("Failed to load veteran data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVeterans();
  }, []);

  const filteredVeterans = veterans.filter(v => {
    if (filter === "deported") return v.findings?.includes("deportation");
    if (filter === "at-risk") return v.findings?.includes("risk");
    if (filter === "naturalization") return v.findings?.includes("naturalization");
    return true;
  });

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          🎖️ Veteran Data <span style={{ color: P.gold }}>Dashboard</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          111,000 MEXICAN IMMIGRANT VETERANS · LIVE TRACKING · DEPORTATION STATUS
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 7, marginBottom: 12 }}>
        {[
          { l: "Total Veterans Tracked", v: veterans.length, c: P.blue },
          { l: "Deported Cases", v: veterans.filter(v => v.findings?.includes("deportation")).length, c: P.red },
          { l: "At-Risk Population", v: "~115,000", c: P.amber },
          { l: "Verified CB-HSIVF", v: CASES.length, c: P.gold },
        ].map(s => (
          <div key={s.l} style={{ background: P.card, border: `1px solid ${s.c}25`, borderLeft: `3px solid ${s.c}`, borderRadius: 7, padding: "8px 12px" }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 6, color: P.t4, marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[["all", "All Veterans"], ["deported", "Deported"], ["at-risk", "At-Risk"], ["naturalization", "Naturalization Issues"]].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)}
            style={{ padding: "6px 12px", fontSize: 8, fontWeight: filter === id ? 700 : 400,
              background: filter === id ? `${P.teal}15` : "transparent",
              border: `1px solid ${filter === id ? P.teal : P.b}`,
              color: filter === id ? P.teal : P.t4, borderRadius: 20, cursor: "pointer" }}>
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {loading ? (
          <div style={{ fontSize: 8, color: P.t4, textAlign: "center", padding: 20 }}>⟳ Loading veteran data...</div>
        ) : filteredVeterans.length > 0 ? (
          filteredVeterans.map(v => (
            <div key={v.id} onClick={() => setSelectedVeteran(selectedVeteran?.id === v.id ? null : v)}
              style={{ background: P.card, border: `1px solid ${P.b}`, borderLeft: `4px solid ${P.amber}`,
                borderRadius: 9, padding: "12px 14px", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: P.t1 }}>{v.title}</div>
                  <div style={{ fontSize: 7, color: P.t4, marginTop: 2 }}>{v.summarized_abstract?.substring(0, 100)}...</div>
                </div>
                {v.findings?.includes("deportation") && <span style={{ fontSize: 7, color: P.red, fontWeight: 700, background: `${P.red}15`, padding: "2px 8px", borderRadius: 20 }}>DEPORTED</span>}
              </div>
              {selectedVeteran?.id === v.id && (
                <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${P.b}20`, fontSize: 7, color: P.t3, lineHeight: 1.6 }}>
                  {v.findings || "No additional details available."}
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ fontSize: 8, color: P.t4, textAlign: "center", padding: 20 }}>No veteran records found for this filter.</div>
        )}
      </div>
    </div>
  );
}