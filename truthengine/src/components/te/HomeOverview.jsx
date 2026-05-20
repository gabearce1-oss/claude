import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { P, CASES, FOIA_REQUESTS, CONVERGENCE_STREAMS } from "../../lib/teData";

const CARD = "#0D1525";
const CARD2 = "#081020";

function useCountdown(target) {
  const [t, setT] = useState({});
  useEffect(() => {
    const calc = () => {
      const d = new Date(target) - new Date();
      if (d <= 0) { setT({ d:0, h:0, m:0, s:0 }); return; }
      setT({ d:Math.floor(d/86400000), h:Math.floor((d%86400000)/3600000),
             m:Math.floor((d%3600000)/60000), s:Math.floor((d%60000)/1000) });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

function CountdownBox({ target, label, color }) {
  const t = useCountdown(target);
  return (
    <div style={{ background: CARD, border: `1px solid ${color}40`, borderRadius: 12, padding: "14px 18px", flex: 1, minWidth: 220 }}>
      <div style={{ fontSize: 7, color, letterSpacing: 3, fontWeight: 700, marginBottom: 10, textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", gap: 6 }}>
        {[["d","DAYS"],["h","HRS"],["m","MIN"],["s","SEC"]].map(([k,u]) => (
          <div key={k} style={{ background: CARD2, border: `1px solid ${color}25`, borderRadius: 7, padding: "8px 10px", minWidth: 44, textAlign: "center" }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>
              {String(t[k] ?? 0).padStart(2, "0")}
            </div>
            <div style={{ fontSize: 7, color: P.t4, marginTop: 4, letterSpacing: 1 }}>{u}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? `${color}10` : CARD,
        border: `1px solid ${hov ? color + "60" : color + "25"}`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 10, padding: "11px 13px",
        cursor: onClick ? "pointer" : "default",
        transition: "all .15s",
        boxShadow: hov ? `0 0 16px ${color}20` : "none",
      }}>
      <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 5, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 8, color: P.t3, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function NEROGauge({ letter, score, label, desc, color }) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const fill = circ * (score / 100);
  return (
    <div style={{ background: CARD, border: `1px solid ${color}25`, borderRadius: 10, padding: "12px 8px", textAlign: "center" }}>
      <svg width={70} height={70} style={{ margin: "0 auto", display: "block" }}>
        <circle cx={35} cy={35} r={r} fill="none" stroke={`${color}18`} strokeWidth={5} />
        <circle cx={35} cy={35} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 35 35)" />
        <text x={35} y={35} textAnchor="middle" dominantBaseline="central"
          style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 900, fill: color }}>
          {letter}
        </text>
      </svg>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 900, color, lineHeight: 1, marginTop: 5 }}>{score}</div>
      <div style={{ fontSize: 8, color: P.t2, fontWeight: 700, marginTop: 3 }}>{label}</div>
      <div style={{ fontSize: 7, color: P.t4, marginTop: 2 }}>{desc}</div>
    </div>
  );
}

const QUICK_ACTIONS = [
  { label:"AI Research",        tab:"assistant",      color:P.teal,   icon:"🔍" },
  { label:"DCAS Analytics",     tab:"dcas-analytics", color:P.red,    icon:"🧮" },
  { label:"Congressional Hub",  tab:"congressional",  color:P.gold,   icon:"🏛️" },
  { label:"Case Board",         tab:"caseboard",      color:P.green,  icon:"🃏" },
  { label:"Evidence Viewer",    tab:"evidence",       color:P.blue,   icon:"🔗" },
  { label:"FOIA Manager",       tab:"foiamanager",    color:P.amber,  icon:"📋" },
  { label:"Forensic Hub",       tab:"forensichub",    color:P.cyan,   icon:"🔬" },
  { label:"CHC Report",         tab:"chcreport",      color:P.pink,   icon:"📊" },
  { label:"Report Builder",     tab:"report",         color:P.violet, icon:"📄" },
  { label:"Intel Report",       tab:"intelreport",    color:P.orange, icon:"🧠" },
];

const BAR_DATA = CONVERGENCE_STREAMS.map(s => ({
  name: s.label.replace(/\s*\(\d[^)]*\)/, "").trim().slice(0, 18),
  value: s.n,
  c: s.c,
}));

export default function HomeOverview({ onSearch, setTab }) {
  const overdueCount = FOIA_REQUESTS.filter(r => r.status.includes("OVERDUE")).length;
  const [pulse, setPulse] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setPulse(p => !p), 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ padding: "16px 0", fontFamily: "'IBM Plex Mono',monospace" }}>

      {/* ── HERO ── */}
      <div style={{
        background: "linear-gradient(135deg,#030810 0%,#0D1B2A 50%,#0A0F20 100%)",
        border: `1px solid ${P.gold}30`,
        borderRadius: 14, padding: "20px 24px", marginBottom: 14,
        boxShadow: `0 0 40px ${P.red}08`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ fontSize: 7, color: P.gold, letterSpacing: 5, fontWeight: 700, marginBottom: 6 }}>
              MISSION · SGT GEORGE RAMOS RESEARCH PLATFORM
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: P.t1, lineHeight: 1.65, marginBottom: 12 }}>
              Forensic evidence of systematic erasure of Hispanic Vietnam veterans.{" "}
              <span style={{ color: P.gold }}>349 official. 3,272 estimated.</span>{" "}
              <span style={{ color: P.red }}>83.6% misclassification.</span>
            </div>

            {/* Impossibility sigma */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 14,
              background: `${P.red}10`, border: `1px solid ${P.red}35`, borderRadius: 12,
              padding: "10px 18px",
              boxShadow: pulse ? `0 0 22px ${P.red}28` : "none",
              transition: "box-shadow .7s",
            }}>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 42, fontWeight: 900, color: P.red, lineHeight: 1 }}>−41.6σ</span>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: P.red, marginBottom: 2 }}>IMPOSSIBILITY SCORE</div>
                <div style={{ fontSize: 7, color: P.t3 }}>p &lt; 10⁻³⁷⁸</div>
                <div style={{ fontSize: 7, color: P.t4 }}>8.3× beyond Higgs threshold</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {["DCAS 58,220 Records", "6 CB-HSIVF Cases", "46 Data Sources", "30 Active Crawlers"].map(t => (
                <span key={t} style={{ fontSize: 7, background: `${P.b}40`, border: `1px solid ${P.b}`,
                  color: P.t3, borderRadius: 20, padding: "3px 10px" }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Countdowns */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <CountdownBox target="2026-05-18T00:00:00" label="CHC Briefing — May 18" color={P.gold} />
            <CountdownBox target="2026-05-31T00:00:00" label="Manuscript — May 31" color={P.orange} />
          </div>
        </div>
      </div>

      {/* ── STATS GRID ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8, marginBottom: 14 }}>
        <StatCard label="DCAS Total Records" value="58,220" sub="Vietnam 1956–1975 · NARA" color={P.blue} />
        <StatCard label="Official Hispanic" value="349" sub="0.60% · ANOMALOUS" color={P.red}
          onClick={() => onSearch && onSearch("DCAS 349 hispanic")} />
        <StatCard label="BISG Estimate" value="3,272" sub="5.62% · Corridor 2,876–3,372" color={P.gold}
          onClick={() => onSearch && onSearch("BISG methodology")} />
        <StatCard label="Erased Veterans" value="1,789" sub="Suppressed cohort" color={P.amber} />
        <StatCard label="Failure Rate" value="83.6%" sub="Classification miscount" color={P.orange} />
        <StatCard label="ICE Database" value="713K" sub="FY2022–Sept 2026 records" color={P.violet}
          onClick={() => setTab("detentionhub")} />
        <StatCard label="Verified Cases" value="6" sub="CB-HSIVF Certified" color={P.teal}
          onClick={() => setTab("caseboard")} />
        <StatCard label="FOIA Overdue" value={String(overdueCount)} sub="Congressional escalation" color={P.red}
          onClick={() => setTab("foiamanager")} />
      </div>

      {/* ── CHART + FOIA/NERO ROW ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>

        {/* Convergence chart */}
        <div style={{ background: CARD, border: `1px solid ${P.b}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ background: `linear-gradient(90deg,${P.red}18,transparent)`,
            borderBottom: `1px solid ${P.b}`, padding: "9px 14px" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: P.t1 }}>📊 5-Stream Convergence</span>
            <span style={{ fontSize: 7, color: P.t4, marginLeft: 8 }}>DCAS official vs BISG estimates</span>
          </div>
          <div style={{ padding: "10px 4px 8px" }}>
            <ResponsiveContainer width="100%" height={185}>
              <BarChart data={BAR_DATA} layout="vertical" margin={{ left: 4, right: 36, top: 0, bottom: 0 }}>
                <XAxis type="number"
                  tick={{ fontSize: 7, fill: P.t4, fontFamily: "'IBM Plex Mono',monospace" }}
                  tickFormatter={v => v >= 1000 ? (v/1000).toFixed(1)+"K" : v} />
                <YAxis type="category" dataKey="name" width={115}
                  tick={{ fontSize: 7, fill: P.t3, fontFamily: "'IBM Plex Mono',monospace" }} />
                <Tooltip
                  contentStyle={{ background: "#0D1525", border: `1px solid ${P.b}`, borderRadius: 6,
                    fontSize: 8, fontFamily: "'IBM Plex Mono',monospace" }}
                  formatter={v => [v.toLocaleString() + " casualties"]}
                  labelStyle={{ color: P.t4 }} />
                <Bar dataKey="value" radius={[0,4,4,0]} label={{ position:"right", fontSize:7, fill:P.t4, fontFamily:"'IBM Plex Mono',monospace", formatter:v=>v.toLocaleString() }}>
                  {BAR_DATA.map((d, i) => <Cell key={i} fill={d.c} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ padding: "0 14px 10px" }}>
            <button onClick={() => setTab("dcas-analytics")}
              style={{ width: "100%", padding: "6px", background: `${P.blue}18`,
                border: `1px solid ${P.blue}30`, borderRadius: 6, color: P.blue,
                fontSize: 8, fontWeight: 700, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace" }}>
              Full DCAS Analytics →
            </button>
          </div>
        </div>

        {/* FOIA + NERO */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* FOIA */}
          <div style={{ background: CARD, border: `1px solid ${P.b}`, borderRadius: 12, overflow: "hidden", flex: 1 }}>
            <div style={{ background: `linear-gradient(90deg,${P.red}15,transparent)`,
              borderBottom: `1px solid ${P.b}`, padding: "9px 14px",
              display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: P.t1 }}>📋 FOIA Tracker</span>
              <button onClick={() => setTab("foiamanager")}
                style={{ fontSize: 7, color: P.red, background: "transparent",
                  border: `1px solid ${P.red}30`, borderRadius: 4, padding: "2px 7px",
                  cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace" }}>
                {overdueCount} OVERDUE →
              </button>
            </div>
            <div style={{ padding: "8px 14px" }}>
              {FOIA_REQUESTS.slice(0, 5).map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "5px 0", borderBottom: `1px solid ${P.b}20` }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: r.color, display: "inline-block", flexShrink: 0 }} />
                    <span style={{ fontSize: 8, color: P.t2 }}>{r.agency}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: r.color, fontWeight: 700 }}>{r.status}</span>
                    {r.daysOverdue > 0 && <span style={{ fontSize: 7, color: P.t4 }}>{r.daysOverdue}d</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NERO */}
          <div style={{ background: CARD, border: `1px solid ${P.b}`, borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ fontSize: 7, color: P.t4, letterSpacing: 3, marginBottom: 8 }}>NERO INSTITUTIONAL ERASURE SCORES</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
              <NEROGauge letter="N" score={94} label="Nomenclature" desc="Citizenship void" color={P.red} />
              <NEROGauge letter="E" score={97} label="Ethnic Code" desc="83.6% wrong" color={P.amber} />
              <NEROGauge letter="R" score={91} label="Record" desc="VA lockout" color={P.orange} />
              <NEROGauge letter="O" score={96} label="Obscurity" desc="92 vs 94K+" color={P.violet} />
            </div>
          </div>
        </div>
      </div>

      {/* ── VERIFIED CASES STRIP ── */}
      <div style={{ background: CARD, border: `1px solid ${P.b}`, borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ background: `linear-gradient(90deg,${P.gold}12,transparent)`,
          borderBottom: `1px solid ${P.b}`, padding: "9px 14px",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: P.t1 }}>🎖️ Verified Cases — CB-HSIVF Certified</span>
          <button onClick={() => setTab("caseboard")}
            style={{ fontSize: 7, color: P.gold, background: "transparent", border: `1px solid ${P.gold}30`,
              borderRadius: 4, padding: "2px 7px", cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace" }}>
            Full Board →
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, padding: "10px 14px", overflowX: "auto" }}>
          {CASES.map((c, i) => {
            const tc = c.tier === "Gold" ? P.gold : c.tier === "Silver" ? P.t3 : P.amber;
            const isUrgent = c.id === "EPP-003";
            return (
              <div key={i} onClick={() => setTab("caseboard")}
                style={{ background: CARD2,
                  border: `1px solid ${isUrgent ? P.red+"60" : tc+"30"}`,
                  borderTop: `3px solid ${isUrgent ? P.red : tc}`,
                  borderRadius: 9, padding: "9px 12px", minWidth: 165, flexShrink: 0,
                  cursor: "pointer", transition: "all .15s",
                  boxShadow: isUrgent ? `0 0 14px ${P.red}20` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 7, color: P.t4 }}>{c.id}</span>
                  {isUrgent && <span style={{ fontSize: 6, color: P.red, background: `${P.red}15`, borderRadius: 3, padding: "1px 5px", fontWeight: 700 }}>⚡ ACTIVE</span>}
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, color: isUrgent ? P.red : P.t1, marginBottom: 3, lineHeight: 1.3 }}>{c.name}</div>
                <div style={{ fontSize: 7, color: P.t4, marginBottom: 6 }}>{c.branch} · {c.award !== "None listed" ? c.award : "Service"}</div>
                <div style={{ height: 4, background: `${P.b}50`, borderRadius: 2, marginBottom: 3 }}>
                  <div style={{ width: `${c.confidence}%`, height: "100%", background: tc, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 7, color: tc, fontWeight: 700 }}>{c.confidence}% confidence · {c.tier}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── QUICK NAVIGATION ── */}
      <div style={{ background: CARD, border: `1px solid ${P.b}`, borderRadius: 12, padding: "12px 14px" }}>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 3, marginBottom: 8 }}>⚡ QUICK NAVIGATION</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 7 }}>
          {QUICK_ACTIONS.map(({ label, tab, color, icon }) => (
            <button key={tab} onClick={() => setTab(tab)}
              style={{ background: CARD2, border: `1px solid ${color}25`, borderRadius: 8,
                padding: "9px 12px", textAlign: "left", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                fontFamily: "'IBM Plex Mono',monospace", transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = `${color}12`; e.currentTarget.style.borderColor = `${color}60`; }}
              onMouseLeave={e => { e.currentTarget.style.background = CARD2; e.currentTarget.style.borderColor = `${color}25`; }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
              <span style={{ fontSize: 8, fontWeight: 700, color: P.t1 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
