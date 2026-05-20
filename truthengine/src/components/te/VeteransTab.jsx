import { useState } from "react";
import { P, CASES, KEY_STATS, SHELTERS } from "../../lib/teData";
import ShelterMap from "./ShelterMap";
import EvidenceLedger from "./EvidenceLedger";
import FOIAAnalytics from "./FOIAAnalytics";

const TIER_C = { Gold:P.gold, Silver:"#B8CCE8", Bronze:P.amber };

const SubTab = ({ id, label, active, onClick, badge }) => (
  <button onClick={onClick}
    style={{ padding:"6px 14px", background:"transparent", border:"none",
      borderBottom: active ? `2px solid ${P.gold}` : "2px solid transparent",
      color: active ? P.t1 : P.t4, fontSize:9, fontWeight: active ? 700 : 400,
      cursor:"pointer", whiteSpace:"nowrap", fontFamily:"'IBM Plex Mono',monospace",
      display:"flex", alignItems:"center", gap:5 }}>
    {label}
    {badge && (
      <span style={{ background:P.red, color:"#fff", borderRadius:20, padding:"0 5px",
        fontSize:7, fontWeight:800, lineHeight:"14px" }}>{badge}</span>
    )}
  </button>
);

// ── REGISTRY ────────────────────────────────────────────────
function RegistryPanel() {
  const [selCase, setSelCase] = useState(null);
  return (
    <div>
      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:8, marginBottom:14 }}>
        {[
          { l:"Master Registry (Vietnam)", v:"2,755", c:P.blue },
          { l:"Testimony Ready (85%+ conf.)", v:"1,527", c:P.teal },
          { l:"Deported Jan–Jun 2025", v:"10,000+", c:P.red },
          { l:"At-Risk Non-Citizen Vets", v:"115,000", c:P.amber },
          { l:"LULAC Tracking (6+ countries)", v:"400+", c:P.violet },
          { l:"CB-HSIVF Verified", v:"6", c:P.gold },
        ].map((s,i) => (
          <div key={i} style={{ background:P.card, border:`1px solid ${s.c}25`, borderLeft:`4px solid ${s.c}`, borderRadius:8, padding:"10px 12px" }}>
            <div style={{ fontSize:7, color:P.t4, letterSpacing:1, marginBottom:4 }}>{s.l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:17, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* 6 Verified Cases */}
      <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:12, overflow:"hidden" }}>
        <div style={{ background:`linear-gradient(90deg,${P.gold}12,transparent)`, borderBottom:`1px solid ${P.b}`,
          padding:"9px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:11, fontWeight:700, color:P.t1 }}>🎖️ CB-HSIVF Verified Cases — 6 Primary</span>
          <span style={{ fontSize:7, background:`${P.teal}18`, border:`1px solid ${P.teal}30`, color:P.teal, borderRadius:3, padding:"1px 6px" }}>SHA-256 CERTIFIED</span>
        </div>
        <div style={{ padding:"12px 16px" }}>
          {CASES.map((c, i) => {
            const isOpen = selCase === c.id;
            const tc = TIER_C[c.tier] || P.t4;
            const isCritical = c.id === "C004";
            return (
              <div key={c.id} onClick={() => setSelCase(isOpen ? null : c.id)}
                style={{ background: isOpen ? "#080D18" : "transparent",
                  border:`1px solid ${isOpen ? tc+"60" : P.b+"40"}`,
                  borderLeft:`5px solid ${isCritical ? P.red : tc}`,
                  borderRadius:9, padding:"10px 14px", marginBottom:8, cursor:"pointer", transition:"all .12s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:7, alignItems:"center", flexWrap:"wrap" }}>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:P.t4 }}>{c.id}</span>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:800, color:isCritical?P.red:P.t1 }}>{c.name}</span>
                      <span style={{ fontSize:8, color:P.t3 }}>{c.branch}</span>
                      {isCritical && <span style={{ fontSize:7, background:`${P.red}18`, border:`1px solid ${P.red}40`, color:P.red, borderRadius:3, padding:"1px 5px", fontWeight:700 }}>⚡ URGENT 2025</span>}
                    </div>
                    <div style={{ fontSize:8, color:P.t3, marginTop:2 }}>{c.status} · {c.location}</div>
                  </div>
                  <div style={{ display:"flex", gap:6, flexShrink:0, flexDirection:"column", alignItems:"flex-end" }}>
                    <span style={{ background:`${tc}18`, border:`1px solid ${tc}40`, color:tc, borderRadius:20, padding:"1px 7px", fontSize:7, fontWeight:700 }}>{c.tier}</span>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:800, color:tc }}>{c.confidence}%</span>
                  </div>
                </div>
                {isOpen && (
                  <div style={{ marginTop:10, paddingTop:8, borderTop:`1px solid ${P.b}30` }}>
                    <div style={{ fontSize:9, color:P.t2, lineHeight:1.8, marginBottom:7 }}>{c.notes}</div>
                    <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, color:P.t4 }}>SHA-256: {c.hash}</span>
                      {c.hubspot && <span style={{ fontSize:7, background:`${P.orange}18`, border:`1px solid ${P.orange}30`, color:P.orange, borderRadius:3, padding:"1px 5px" }}>HubSpot Linked</span>}
                      <span style={{ fontSize:7, background:"#080D18", border:`1px solid ${P.b}`, color:P.t4, borderRadius:3, padding:"1px 5px" }}>{c.country}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── MAIN ────────────────────────────────────────────────────
export default function VeteransTab() {
  const [sub, setSub] = useState("registry");
  const [, setMapCase] = useState(null);

  return (
    <div style={{ height:"calc(100vh - 118px)", display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* Sub-tab bar */}
      <div style={{ background:"#050810", borderBottom:`1px solid ${P.b}`, padding:"0 20px", display:"flex", flexShrink:0 }}>
        <SubTab id="registry" label="🎖️ Registry"       active={sub==="registry"} onClick={() => setSub("registry")} />
        <SubTab id="map"      label="🗺️ Border Map"     active={sub==="map"}      onClick={() => setSub("map")} />
        <SubTab id="ledger"   label="🔐 Evidence Ledger" active={sub==="ledger"}   onClick={() => setSub("ledger")} />
        <SubTab id="foia"     label="📋 FOIA Analytics"  active={sub==="foia"}     onClick={() => setSub("foia")} badge="3" />
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", padding:"14px 20px" }}>
        {sub === "registry" && <RegistryPanel />}
        {sub === "map"      && <ShelterMap onCaseSelect={id => { setMapCase(id); setSub("registry"); }} />}
        {sub === "ledger"   && <EvidenceLedger />}
        {sub === "foia"     && <FOIAAnalytics />}
      </div>
    </div>
  );
}