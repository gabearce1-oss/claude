import { useState } from "react";
import { P } from "../../lib/teData";

const PTSD_DATA = [
  { era: "KOREAN_WAR", deported: 3, tier1: 2, tier2: 0, noCrime: 1, pending: 0, psydConserv: 1, psydClinical: 1, died: 0 },
  { era: "VIETNAM", deported: 769, tier1: 488, tier2: 62, noCrime: 120, pending: 60, psydConserv: 370, psydClinical: 436, died: 3 },
  { era: "GULF_WAR", deported: 39010, tier1: 24345, tier2: 1513, noCrime: 5767, pending: 5373, psydConserv: 17947, psydClinical: 20886, died: 19 },
  { era: "IRAQ_AFGHANISTAN", deported: 129735, tier1: 70758, tier2: 3408, noCrime: 21734, pending: 29365, psydConserv: 51563, psydClinical: 59767, died: 27 },
];

const ERA_LABELS = {
  KOREAN_WAR: "Korean War (1950-53)",
  VIETNAM: "Vietnam (1965-73)",
  GULF_WAR: "Gulf War (1990-91)",
  IRAQ_AFGHANISTAN: "Iraq/Afghanistan (2001-21)",
};

const ERA_COLORS = {
  KOREAN_WAR: P.blue,
  VIETNAM: P.red,
  GULF_WAR: P.amber,
  IRAQ_AFGHANISTAN: P.violet,
};

export default function PTSDAnalysisPanel() {
  const [selectedEra, setSelectedEra] = useState("VIETNAM");

  const selData = PTSD_DATA.find(d => d.era === selectedEra);
  const selColor = ERA_COLORS[selectedEra];

  const totalDeported = PTSD_DATA.reduce((a, b) => a + b.deported, 0);
  const totalTier1 = PTSD_DATA.reduce((a, b) => a + b.tier1, 0);
  const totalDied = PTSD_DATA.reduce((a, b) => a + b.died, 0);

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          🧠 PTSD <span style={{ color: P.gold }}>Across Military Eras</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          KOREAN WAR · VIETNAM · GULF WAR · IRAQ/AFGHANISTAN · {totalDeported.toLocaleString()} TOTAL DEPORTED
        </div>
      </div>

      {/* Era selector */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
        {PTSD_DATA.map(d => {
          const isActive = d.era === selectedEra;
          const c = ERA_COLORS[d.era];
          return (
            <button key={d.era} onClick={() => setSelectedEra(d.era)}
              style={{ padding: "5px 12px", fontSize: 8, fontWeight: isActive ? 700 : 400,
                background: isActive ? `${c}20` : "transparent",
                border: `1px solid ${isActive ? c : P.b}`,
                color: isActive ? c : P.t4, borderRadius: 20, cursor: "pointer" }}>
              {ERA_LABELS[d.era].split(" ")[0]}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        {/* Main metrics for selected era */}
        <div style={{ background: P.card, border: `1px solid ${selColor}25`, borderLeft: `4px solid ${selColor}`,
          borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: selColor, marginBottom: 8 }}>
            {ERA_LABELS[selectedEra]}
          </div>

          {[
            { l: "Total Deported", v: selData.deported, c: selColor },
            { l: "Tier 1 (High PTSD)", v: selData.tier1, c: P.red, pct: (selData.tier1 / selData.deported * 100).toFixed(1) },
            { l: "Tier 2 (Mod PTSD)", v: selData.tier2, c: P.amber, pct: (selData.tier2 / selData.deported * 100).toFixed(1) },
            { l: "No Crime History", v: selData.noCrime, c: P.teal, pct: (selData.noCrime / selData.deported * 100).toFixed(1) },
            { l: "Died in Custody", v: selData.died, c: selData.died > 0 ? P.red : P.t4 },
          ].map((m, i) => (
            <div key={i} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${P.b}20` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <span style={{ fontSize: 8, color: P.t4 }}>{m.l}</span>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 800, color: m.c }}>
                  {m.v.toLocaleString()} {m.pct && `(${m.pct}%)`}
                </span>
              </div>
              {m.pct && (
                <div style={{ background: "#030508", borderRadius: 3, height: 5, overflow: "hidden" }}>
                  <div style={{ width: `${m.pct}%`, height: "100%", background: m.c, borderRadius: 3 }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* PTSD estimates */}
        <div style={{ background: P.card, border: `1px solid ${selColor}25`, borderLeft: `4px solid ${selColor}`,
          borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: selColor, marginBottom: 8 }}>
            PTSD Estimates
          </div>

          <div style={{ marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${P.b}20` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <span style={{ fontSize: 8, color: P.t4 }}>Conservative Est.</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 800, color: P.amber }}>
                {selData.psydConserv.toLocaleString()}
              </span>
            </div>
            <div style={{ background: "#030508", borderRadius: 3, height: 5, overflow: "hidden" }}>
              <div style={{ width: `${(selData.psydConserv / selData.deported * 100)}%`, height: "100%", background: P.amber, borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 6, color: P.t4, marginTop: 2 }}>
              {(selData.psydConserv / selData.deported * 100).toFixed(1)}% of deported
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <span style={{ fontSize: 8, color: P.t4 }}>Clinical Est.</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 800, color: P.violet }}>
                {selData.psydClinical.toLocaleString()}
              </span>
            </div>
            <div style={{ background: "#030508", borderRadius: 3, height: 5, overflow: "hidden" }}>
              <div style={{ width: `${(selData.psydClinical / selData.deported * 100)}%`, height: "100%", background: P.violet, borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 6, color: P.t4, marginTop: 2 }}>
              {(selData.psydClinical / selData.deported * 100).toFixed(1)}% of deported
            </div>
          </div>
        </div>
      </div>

      {/* Cross-era comparison */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 10 }}>
          Cross-Era Comparison
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8 }}>
          {PTSD_DATA.map(d => {
            const tier1Pct = (d.tier1 / d.deported * 100).toFixed(1);
            const clinicalPct = (d.clinical / d.deported * 100).toFixed(1);
            const c = ERA_COLORS[d.era];
            return (
              <div key={d.era} style={{ background: `${c}08`, border: `1px solid ${c}25`, borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 7, color: c, fontWeight: 700, marginBottom: 6 }}>
                  {ERA_LABELS[d.era].split("(")[0].trim()}
                </div>
                <div style={{ fontSize: 6, color: P.t3, marginBottom: 6, lineHeight: 1.5 }}>
                  <div>🔴 High PTSD: {d.tier1.toLocaleString()}</div>
                  <div>🟡 Mod PTSD: {d.tier2.toLocaleString()}</div>
                  <div>⚰️ Died: {d.died}</div>
                </div>
                <div style={{ fontSize: 7, color: P.violet, fontWeight: 700 }}>
                  {(d.psydClinical / d.deported * 100).toFixed(1)}% Clinical PTSD
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary stats */}
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${P.b}20`, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8 }}>
          {[
            { l: "Total Deported", v: totalDeported, c: P.blue },
            { l: "High PTSD Cases", v: totalTier1, c: P.red },
            { l: "Deaths ICE Custody", v: totalDied, c: P.amber },
            { l: "Eras Covered", v: PTSD_DATA.length, c: P.teal },
          ].map((s, i) => (
            <div key={i} style={{ background: "#080D18", borderRadius: 6, padding: 8, borderLeft: `3px solid ${s.c}` }}>
              <div style={{ fontSize: 6, color: P.t4, marginBottom: 2 }}>{s.l}</div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, fontWeight: 800, color: s.c }}>
                {s.v.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}