import { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { P } from "../../lib/teData";

const AGENCIES = {
  dhs: { name: "DHS / ICE", color: P.red, icon: "🔴", category: "Immigration", role: "Enforcement", focus: "Removal Operations" },
  uscis: { name: "USCIS", color: P.blue, icon: "📋", category: "Immigration", role: "Adjudication", focus: "N-400 Processing" },
  va: { name: "VA", color: P.gold, icon: "🎖️", category: "Veterans", role: "Benefits", focus: "BIRLS Records" },
  dod: { name: "DoD", color: P.violet, icon: "🛡️", category: "Veterans", role: "Military", focus: "DMDC / SCRA" },
  gao: { name: "GAO", color: P.teal, icon: "🔍", category: "Oversight", role: "Audit", focus: "Investigation" },
  chc: { name: "Congressional Hispanic Caucus", color: P.amber, icon: "🏛️", category: "Oversight", role: "Legislative", focus: "CHC Inquiry" },
};

const FLOWS = [
  { from: "uscis", to: "dhs", label: "N-400 Approval → Removal Order", type: "critical", flow: "Naturalization approval can be followed by deportation via IIRIRA retroactive clause" },
  { from: "va", to: "dhs", label: "BIRLS Data (blocked)", type: "blocked", flow: "VA refuses to notify ICE of veteran status — F001 FOIA overdue 83d" },
  { from: "dod", to: "dhs", label: "DMDC / SCRA Query (missing)", type: "missing", flow: "No mandatory military service lookup before removal — CHC Ask #5" },
  { from: "uscis", to: "va", label: "Military Service Flag (no linkage)", type: "missing", flow: "USCIS CLAIMS4 has no field linking N-400 to DD-214 or BIRLS" },
  { from: "dhs", to: "gao", label: "ENFORCE Data (blocked)", type: "blocked", flow: "ICE ENFORCE database sealed — F002 FOIA overdue 66d" },
  { from: "gao", to: "chc", label: "Congressional Reports (published)", type: "active", flow: "GAO-19-416: 92 confirmed vs 94,000+ estimated deported veterans" },
  { from: "chc", to: "dod", label: "Legislative Inquiry", type: "active", flow: "CHC asks DoD for retroactive SCRA applications" },
  { from: "chc", to: "va", label: "Legislative Inquiry", type: "active", flow: "CHC asks VA for BIRLS release to ICE linkage audit" },
];

const METRICS = [
  { agency: "uscis", metric: "N-400 FY24", value: 16290, baseline: 12150, yoy: "+34%", color: P.blue },
  { agency: "dhs", metric: "Deportations FY24", value: 271562, baseline: 175000, yoy: "+55%", color: P.red },
  { agency: "va", metric: "BIRLS Query Blocks", value: 12, baseline: 0, yoy: "NEW", color: P.gold },
  { agency: "dod", metric: "SCRA Queries", value: 289000, baseline: 280000, yoy: "+3%", color: P.violet },
  { agency: "gao", metric: "Vet Deports Confirmed", value: 92, baseline: 0, yoy: "FIRST", color: P.teal },
  { agency: "chc", metric: "Days to Briefing", value: 39, baseline: 0, yoy: "CRITICAL", color: P.amber },
];

export default function TradecraftAgencyMap() {
  const [hoveredFlow, setHoveredFlow] = useState(null);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [view, setView] = useState("flows");

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          🛠️ Systematic <span style={{ color: P.gold }}>Tradecraft</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          AGENCY INTERDEPENDENCIES · DATA FLOWS · INSTITUTIONAL BLOCKADES
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "8px 10px", width: "fit-content" }}>
        {[["flows", "🔗 Data Flows"], ["metrics", "📊 Metrics"], ["timeline", "📅 Timeline"]].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: "6px 12px",
              background: view === v ? `${P.gold}20` : "transparent",
              border: `1px solid ${view === v ? P.gold : P.b}`,
              color: view === v ? P.gold : P.t4,
              fontSize: 8,
              fontWeight: view === v ? 700 : 400,
              cursor: "pointer",
              borderRadius: 6,
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {view === "flows" && (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 12, marginBottom: 12 }}>
          {/* Agency grid */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12, height: "fit-content" }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: P.t2, letterSpacing: 1, marginBottom: 8 }}>AGENCIES</div>
            {Object.entries(AGENCIES).map(([k, a]) => (
              <div
                key={k}
                onClick={() => setSelectedAgency(selectedAgency === k ? null : k)}
                style={{
                  padding: "8px 10px",
                  marginBottom: 6,
                  background: selectedAgency === k ? `${a.color}15` : "transparent",
                  border: `1px solid ${selectedAgency === k ? a.color + "40" : P.b + "20"}`,
                  borderLeft: `3px solid ${a.color}`,
                  borderRadius: 6,
                  cursor: "pointer",
                  transition: "all .12s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 12 }}>{a.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: a.color }}>{a.name}</div>
                    <div style={{ fontSize: 6, color: P.t4 }}>{a.category}</div>
                  </div>
                </div>
                <div style={{ fontSize: 6, color: P.t4, marginLeft: 18 }}>
                  {a.role} • {a.focus}
                </div>
              </div>
            ))}
          </div>

          {/* Data flows */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 10 }}>Data Flow Network</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {FLOWS.map((f, i) => {
                const fromAgency = AGENCIES[f.from];
                const toAgency = AGENCIES[f.to];
                const isHovered = hoveredFlow === i;
                const typeColor = f.type === "critical" ? P.red : f.type === "blocked" ? P.amber : f.type === "missing" ? P.violet : P.teal;

                return (
                  <div
                    key={i}
                    onMouseEnter={() => setHoveredFlow(i)}
                    onMouseLeave={() => setHoveredFlow(null)}
                    style={{
                      padding: "10px 12px",
                      background: isHovered ? `${typeColor}12` : "#080D18",
                      border: `1px solid ${isHovered ? typeColor + "40" : P.b + "20"}`,
                      borderLeft: `4px solid ${typeColor}`,
                      borderRadius: 7,
                      cursor: "default",
                      transition: "all .12s",
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 12 }}>{fromAgency.icon}</span>
                      <div style={{ fontSize: 8, fontWeight: 700, color: P.t2 }}>{fromAgency.name}</div>
                      <span style={{ fontSize: 14, color: P.t4 }}>→</span>
                      <span style={{ fontSize: 12 }}>{toAgency.icon}</span>
                      <div style={{ fontSize: 8, fontWeight: 700, color: P.t2 }}>{toAgency.name}</div>
                    </div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: typeColor, marginBottom: 4 }}>
                      {f.label}
                    </div>
                    <div style={{ fontSize: 7, color: P.t3, lineHeight: 1.5 }}>{f.flow}</div>
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 6,
                        padding: "4px 8px",
                        background: `${typeColor}08`,
                        border: `1px solid ${typeColor}20`,
                        borderRadius: 4,
                        color: typeColor,
                        fontWeight: 700,
                        display: "inline-block",
                      }}
                    >
                      {f.type === "critical"
                        ? "⚡ CRITICAL"
                        : f.type === "blocked"
                        ? "🚫 BLOCKED (FOIA)"
                        : f.type === "missing"
                        ? "⚠️ MISSING"
                        : "✓ ACTIVE"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {view === "metrics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Key metrics grid */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 12 }}>Agency Activity Metrics</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
              {METRICS.map((m, i) => {
                const agent = AGENCIES[m.agency];
                const change = m.yoy.includes("%") ? parseFloat(m.yoy) : 0;
                return (
                  <div
                    key={i}
                    style={{
                      background: "#080D18",
                      border: `1px solid ${m.color}25`,
                      borderTop: `3px solid ${m.color}`,
                      borderRadius: 8,
                      padding: "12px 14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <span style={{ fontSize: 14 }}>{agent.icon}</span>
                      <div>
                        <div style={{ fontSize: 8, fontWeight: 700, color: m.color }}>{agent.name}</div>
                        <div style={{ fontSize: 6, color: P.t4 }}>{m.metric}</div>
                      </div>
                    </div>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 800, color: m.color, marginBottom: 4 }}>
                      {m.value.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 7, color: P.t4, marginBottom: 6 }}>Baseline: {m.baseline.toLocaleString()}</div>
                    <div
                      style={{
                        background: P.bg,
                        borderRadius: 4,
                        padding: "4px 8px",
                        fontSize: 7,
                        fontWeight: 700,
                        color: change > 0 ? P.red : P.teal,
                        textAlign: "center",
                      }}
                    >
                      {m.yoy}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data flow volume chart */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 12 }}>📊 Data Flow Volumes Between Agencies (FY24)</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: "USCIS→DHS", value: 16290, blocked: 0, status: "critical" },
                { name: "VA→DHS", value: 0, blocked: 58220, status: "blocked" },
                { name: "DoD→DHS", value: 289000, blocked: 0, status: "missing" },
                { name: "DHS→GAO", value: 0, blocked: 1000, status: "blocked" },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
                <XAxis dataKey="name" stroke={P.t4} tick={{ fontSize: 12 }} />
                <YAxis stroke={P.t4} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: P.card,
                    border: `1px solid ${P.b}`,
                    borderRadius: 6,
                    color: P.t1,
                  }}
                />
                <Legend />
                <Bar dataKey="value" fill={P.gold} name="Active Flow" radius={4} />
                <Bar dataKey="blocked" fill={P.red} name="Blocked/Missing" radius={4} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 10, padding: "8px 12px", background: P.bg, borderRadius: 6, fontSize: 7, color: P.t4 }}>
              <strong style={{ color: P.red }}>Critical Issue:</strong> VA→DHS has 0 active flow (58,220 potential records blocked by F001 FOIA overdue). DoD→DHS missing mandatory SCRA query.
            </div>
          </div>

          {/* Classification bottleneck trend */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 12 }}>📈 Classification Failure Rate Trend (DCAS vs BISG)</div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[
                { year: "1975", dcasOfficial: 349, bisgEstimate: 349, gap: 0, errorRate: 0 },
                { year: "1995", dcasOfficial: 349, bisgEstimate: 800, gap: 451, errorRate: 56 },
                { year: "2020", dcasOfficial: 349, bisgEstimate: 2100, gap: 1751, errorRate: 83 },
                { year: "2024", dcasOfficial: 349, bisgEstimate: 2309, gap: 1960, errorRate: 85 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
                <XAxis dataKey="year" stroke={P.t4} tick={{ fontSize: 12 }} />
                <YAxis stroke={P.t4} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: P.card,
                    border: `1px solid ${P.b}`,
                    borderRadius: 6,
                    color: P.t1,
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="dcasOfficial" stroke={P.red} strokeWidth={2} name="DCAS Official" />
                <Line type="monotone" dataKey="bisgEstimate" stroke={P.violet} strokeWidth={2} name="BISG Forensic" />
                <Line type="monotone" dataKey="errorRate" stroke={P.amber} strokeWidth={2} name="Error Rate %" />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 10, padding: "8px 12px", background: P.bg, borderRadius: 6, fontSize: 7, color: P.t4 }}>
              <strong style={{ color: P.amber }}>Systemic Erasure:</strong> 84.9% classification failure rate persists since 1975 Vietnam-era misclassification. BISG forensic estimate: 2,309 Hispanic veterans vs 349 official DCAS count.
            </div>
          </div>

          {/* Deportation velocity vs naturalization */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 12 }}>⚖️ Naturalization vs Deportation Pipeline (FY20–24)</div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={[
                { fy: "FY20", naturalizations: 4570, deportations: 185000, ratio: 24.7 },
                { fy: "FY21", naturalizations: 8800, deportations: 195000, ratio: 22.2 },
                { fy: "FY22", naturalizations: 10690, deportations: 220000, ratio: 20.6 },
                { fy: "FY23", naturalizations: 12150, deportations: 245000, ratio: 20.2 },
                { fy: "FY24", naturalizations: 16290, deportations: 271562, ratio: 16.7 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
                <XAxis dataKey="fy" stroke={P.t4} tick={{ fontSize: 12 }} />
                <YAxis stroke={P.t4} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: P.card,
                    border: `1px solid ${P.b}`,
                    borderRadius: 6,
                    color: P.t1,
                  }}
                />
                <Legend />
                <Bar dataKey="naturalizations" fill={P.gold} name="Military Naturalizations" radius={4} />
                <Bar dataKey="deportations" fill={P.red} name="Total Deportations" radius={4} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 10, padding: "8px 12px", background: P.bg, borderRadius: 6, fontSize: 7, color: P.t4 }}>
              <strong style={{ color: P.red }}>Asymmetric Pipeline:</strong> Deportations increasing 55% (FY20→24) while naturalizations only +34%. Veterans face accelerating removal velocity against slower citizenship pathway.
            </div>
          </div>
        </div>
      )}

      {view === "timeline" && (
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 12 }}>Critical Institutional Timeline</div>
          {[
            { date: "1996-09-30", event: "IIRIRA enacted — retroactive deportation", agency: "dhs", severity: "critical" },
            { date: "2003-01-01", event: "INA §329 — military naturalization clarified", agency: "uscis", severity: "high" },
            { date: "2019-07-01", event: "GAO-19-416 — 92 confirmed deported veterans", agency: "gao", severity: "high" },
            { date: "2025-09-15", event: "F001 FOIA filed — VA BIRLS", agency: "va", severity: "critical" },
            { date: "2025-10-15", event: "F002 FOIA filed — ICE ENFORCE", agency: "dhs", severity: "critical" },
            { date: "2025-11-14", event: "F001 overdue (83 days) — CHC escalation", agency: "chc", severity: "critical" },
            { date: "2025-12-14", event: "F002 overdue (66 days) — DHS Secretary inquiry", agency: "chc", severity: "critical" },
            { date: "2026-05-18", event: "CHC Briefing — Congressional hearing", agency: "chc", severity: "critical" },
          ].map((t, i) => {
            const agent = AGENCIES[t.agency];
            const sevColor = t.severity === "critical" ? P.red : P.amber;
            return (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${P.b}20` }}>
                <div style={{ minWidth: 100, fontSize: 7, color: P.t4, fontFamily: "'IBM Plex Mono',monospace" }}>
                  {t.date}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 2 }}>
                    <span style={{ fontSize: 10 }}>{agent.icon}</span>
                    <span style={{ fontSize: 8, fontWeight: 700, color: agent.color }}>{agent.name}</span>
                    <span
                      style={{
                        fontSize: 6,
                        background: `${sevColor}15`,
                        border: `1px solid ${sevColor}30`,
                        color: sevColor,
                        padding: "1px 6px",
                        borderRadius: 20,
                        fontWeight: 700,
                      }}
                    >
                      {t.severity === "critical" ? "⚡ CRITICAL" : "⚠️ HIGH"}
                    </span>
                  </div>
                  <div style={{ fontSize: 8, color: P.t2 }}>{t.event}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}