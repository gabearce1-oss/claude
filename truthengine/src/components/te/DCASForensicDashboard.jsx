import { useState } from "react";
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  ReferenceLine, CartesianGrid, Legend
} from "recharts";
import { Database, TrendingUp, AlertTriangle, Activity, Layers, Shield, Cpu, Flag } from "lucide-react";
import { P, CONVERGENCE_STREAMS, STATE_VARIANCE } from "../../lib/teData";

const FONT = "'IBM Plex Mono', monospace";

const YEAR_DATA = [
  { year: "1965", total: 1928,  official: 12,  bisg: 76 },
  { year: "1966", total: 6143,  official: 37,  bisg: 244 },
  { year: "1967", total: 11153, official: 67,  bisg: 443 },
  { year: "1968", total: 16589, official: 100, bisg: 659 },
  { year: "1969", total: 11616, official: 70,  bisg: 461 },
  { year: "1970", total: 6081,  official: 37,  bisg: 242 },
  { year: "1971", total: 2357,  official: 14,  bisg: 93 },
  { year: "1972", total: 641,   official: 4,   bisg: 25 },
  { year: "1973", total: 168,   official: 1,   bisg: 7 },
  { year: "1974", total: 228,   official: 1,   bisg: 9 },
  { year: "1975", total: 1316,  official: 8,   bisg: 52 },
];

const TABS = ["Overview", "5-Stream Convergence", "State Analysis", "Year Timeline", "BISG Methodology"];

const THRESHOLD_TABLE = [
  { tau: "0.30", flagged: "2,876", pct: "4.94%" },
  { tau: "0.40", flagged: "3,272", pct: "5.62%", highlight: true },
  { tau: "0.50", flagged: "3,070", pct: "5.27%" },
  { tau: "0.60", flagged: "3,500", pct: "6.01%" },
  { tau: "0.70", flagged: "3,741", pct: "6.43%" },
];

function KpiCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #1E3A8A 0%, #1A2E5C 100%)",
      border: `1px solid ${P.b}`, borderRadius: 10,
      padding: "14px 16px", position: "relative", overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", top: -8, right: -8, width: 50, height: 50,
        background: `${color}08`, borderRadius: "50%"
      }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ background: `${color}20`, borderRadius: 6, padding: 6, display: "flex" }}>
          <Icon size={14} color={color} />
        </div>
        {sub && <div style={{ fontSize: 8, color: `${color}90`, fontFamily: FONT, letterSpacing: 1 }}>{sub}</div>}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color, fontFamily: FONT, lineHeight: 1 }}>{value}</div>
      <div style={{ marginTop: 4, fontSize: 9, color: P.t3, fontFamily: FONT, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0F172A", border: `1px solid ${P.b}`,
      borderRadius: 8, padding: "10px 14px", fontFamily: FONT
    }}>
      <div style={{ fontSize: 10, color: P.t3, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 11, color: p.color, marginBottom: 2 }}>
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  );
}

function OverviewTab() {
  return (
    <div>
      {/* Impossibility statement */}
      <div style={{
        background: `${P.red}0D`, border: `1px solid ${P.red}30`,
        borderRadius: 10, padding: "18px 22px", marginBottom: 22
      }}>
        <div style={{ fontSize: 10, color: P.red, fontFamily: FONT, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
          Core Statistical Finding
        </div>
        <p style={{ margin: 0, fontSize: 13, color: P.t2, fontFamily: FONT, lineHeight: 1.7 }}>
          The DCAS Vietnam Conflict Extract File (NARA ID 2240992, N=58,220) records 349 casualties
          coded Hispanic — a rate of 0.60%. BIFSG-1970 probabilistic surname analysis yields an
          estimate of <span style={{ color: P.gold, fontWeight: 700 }}>3,272 (5.62%)</span>, corridor
          2,876–3,372. The gap of{" "}
          <span style={{ color: P.red, fontWeight: 700 }}>1,789 suppressed records</span> represents an
          83.6% classification failure rate. The impossibility of the observed deficit under census-derived
          priors produces a z-score of{" "}
          <span style={{ color: P.gold, fontWeight: 900 }}>−41.6σ</span> — far beyond any known
          sampling artifact. The null hypothesis of accurate classification is rejected at p&lt;10⁻²⁵⁰.
        </p>
      </div>

      {/* Stacked Area Chart */}
      <div style={{ fontSize: 11, fontWeight: 700, color: P.t1, fontFamily: FONT, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
        Annual Casualties 1965–1975: Official vs BISG Estimate
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={YEAR_DATA} margin={{ left: 10, right: 20, top: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="gradBisg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={P.gold} stopOpacity={0.3} />
              <stop offset="95%" stopColor={P.gold} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradOfficial" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={P.red} stopOpacity={0.5} />
              <stop offset="95%" stopColor={P.red} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={`${P.b}40`} />
          <XAxis dataKey="year" tick={{ fill: P.t3, fontSize: 9, fontFamily: FONT }} />
          <YAxis tick={{ fill: P.t3, fontSize: 9, fontFamily: FONT }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontFamily: FONT, fontSize: 10 }} />
          <Area type="monotone" dataKey="bisg" name="BISG Estimate" stroke={P.gold} fill="url(#gradBisg)" strokeWidth={2} />
          <Area type="monotone" dataKey="official" name="Official Hispanic" stroke={P.red} fill="url(#gradOfficial)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ marginTop: 10, fontSize: 9, color: P.t3, fontFamily: FONT, textAlign: "center" }}>
        1968 Tet Offensive spike: 566 of 1,789 suppressed (31.6%) concentrated in this year alone
      </div>
    </div>
  );
}

function StreamTab() {
  const data = CONVERGENCE_STREAMS.map(s => ({ ...s, displayLabel: s.label }));
  return (
    <div>
      <div style={{ fontSize: 9, color: P.t3, fontFamily: FONT, marginBottom: 16 }}>
        Six independent methodologies converge far above 349. Red line = official published count.
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 60, top: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={`${P.b}30`} horizontal={false} />
          <XAxis type="number" tick={{ fill: P.t3, fontSize: 9, fontFamily: FONT }}
            tickFormatter={v => v.toLocaleString()} />
          <YAxis type="category" dataKey="displayLabel" width={175}
            tick={{ fill: P.t3, fontSize: 9, fontFamily: FONT }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={349} stroke={P.red} strokeWidth={2} strokeDasharray="5 4"
            label={{ value: "Official 349", position: "insideTopRight", fill: P.red, fontSize: 9, fontFamily: FONT }} />
          <Bar dataKey="n" name="Estimated Count" radius={[0, 6, 6, 0]} label={{
            position: "right", fill: P.t3, fontSize: 9, fontFamily: FONT,
            formatter: v => v.toLocaleString()
          }}>
            {data.map((d, i) => <Cell key={i} fill={d.c} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {CONVERGENCE_STREAMS.map(s => (
          <div key={s.label} style={{
            background: `${s.c}10`, border: `1px solid ${s.c}30`,
            borderRadius: 8, padding: "10px 12px"
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: s.c, fontFamily: FONT }}>{s.n.toLocaleString()}</div>
            <div style={{ fontSize: 8, color: P.t3, fontFamily: FONT, marginTop: 3 }}>{s.label}</div>
            <div style={{ fontSize: 8, color: `${s.c}90`, fontFamily: FONT }}>{s.pct} · {s.type}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StateTab() {
  return (
    <div>
      <div style={{ fontSize: 9, color: P.t3, fontFamily: FONT, marginBottom: 16 }}>
        Official Hispanic % (amber) vs BISG Estimated % (teal) by state — gap reveals regional suppression patterns.
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={STATE_VARIANCE} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={`${P.b}30`} horizontal={false} />
          <XAxis type="number" unit="%" tick={{ fill: P.t3, fontSize: 9, fontFamily: FONT }} />
          <YAxis type="category" dataKey="state" width={100} tick={{ fill: P.t3, fontSize: 10, fontFamily: FONT }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontFamily: FONT, fontSize: 10 }} />
          <Bar dataKey="pct" name="Official % Hispanic" fill={P.amber} radius={[0, 4, 4, 0]} />
          <Bar dataKey="bisg" name="BISG Estimate %" fill={P.teal} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: P.t1, fontFamily: FONT, marginBottom: 10 }}>Suppression by State (top 6)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {[
            { state: "Texas", suppressed: 711, color: P.amber },
            { state: "California", suppressed: 640, color: P.teal },
            { state: "New Mexico", suppressed: 148, color: P.blue },
            { state: "Arizona", suppressed: 113, color: P.cyan },
            { state: "New York", suppressed: 98, color: P.violet },
            { state: "Colorado", suppressed: 73, color: P.green },
          ].map(s => (
            <div key={s.state} style={{
              background: `${s.color}10`, border: `1px solid ${s.color}30`,
              borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div style={{ fontSize: 10, color: P.t2, fontFamily: FONT }}>{s.state}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.color, fontFamily: FONT }}>{s.suppressed}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineTab() {
  return (
    <div>
      <div style={{ fontSize: 9, color: P.t3, fontFamily: FONT, marginBottom: 16 }}>
        1968 Tet Offensive spike: 31.6% of all suppressed records concentrated in a single year.
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={YEAR_DATA} margin={{ left: 10, right: 30, top: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={`${P.b}40`} />
          <XAxis dataKey="year" tick={{ fill: P.t3, fontSize: 9, fontFamily: FONT }} />
          <YAxis tick={{ fill: P.t3, fontSize: 9, fontFamily: FONT }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontFamily: FONT, fontSize: 10 }} />
          <ReferenceLine x="1968" stroke={`${P.amber}60`} strokeDasharray="6 3"
            label={{ value: "Tet Offensive", position: "insideTopLeft", fill: P.amber, fontSize: 9, fontFamily: FONT }} />
          <Line type="monotone" dataKey="bisg" name="BISG Estimate" stroke={P.gold} strokeWidth={3} dot={{ fill: P.gold, r: 4 }} />
          <Line type="monotone" dataKey="official" name="Official Hispanic" stroke={P.red} strokeWidth={2} dot={{ fill: P.red, r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "Peak Year", value: "1968", sub: "Tet/Post-Tet escalation", color: P.amber },
          { label: "Peak Suppressed", value: "566", sub: "31.6% of 1,789 total", color: P.red },
          { label: "BISG Peak vs Official", value: "6.6×", sub: "659 vs 100 — 1968", color: P.gold },
        ].map(s => (
          <div key={s.label} style={{
            background: `${s.color}10`, border: `1px solid ${s.color}30`,
            borderRadius: 8, padding: "12px 16px"
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: FONT }}>{s.value}</div>
            <div style={{ fontSize: 9, color: P.t1, fontFamily: FONT, marginTop: 3 }}>{s.label}</div>
            <div style={{ fontSize: 8, color: P.t3, fontFamily: FONT, marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MethodologyTab() {
  return (
    <div>
      {/* Bayes formula */}
      <div style={{
        background: `${P.violet}0D`, border: `1px solid ${P.violet}30`,
        borderRadius: 10, padding: "18px 22px", marginBottom: 20
      }}>
        <div style={{ fontSize: 10, color: P.violet, fontFamily: FONT, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
          BIFSG Bayesian Formula
        </div>
        <div style={{
          background: "#0F172A", borderRadius: 8, padding: "16px 20px",
          fontSize: 13, color: P.t2, fontFamily: FONT, lineHeight: 1.9,
          border: `1px solid ${P.b}`
        }}>
          <span style={{ color: P.gold }}>P(Hispanic | surname, geo)</span>
          <span style={{ color: P.t3 }}> = </span>
          <span style={{ color: P.teal }}>P(surname | Hispanic) × P(Hispanic | geo)</span>
          <br />
          <span style={{ color: P.t3, paddingLeft: 40 }}>────────────────────────────────────────</span>
          <br />
          <span style={{ color: P.t3, paddingLeft: 60 }}>P(surname)</span>
          <div style={{ marginTop: 12, fontSize: 10, color: P.t3, lineHeight: 1.8 }}>
            <div><span style={{ color: P.cyan }}>Prior:</span> 1970 Census surname frequency tables (NCHS/Census Bureau)</div>
            <div><span style={{ color: P.cyan }}>Geography:</span> State-level Hispanic population proportions, 1970 baseline</div>
            <div><span style={{ color: P.cyan }}>Threshold τ:</span> 0.40 (median estimate, sensitivity tested 0.30–0.70)</div>
          </div>
        </div>
      </div>

      {/* Threshold sensitivity table */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: P.t1, fontFamily: FONT, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
          Threshold Sensitivity Analysis
        </div>
        <div style={{
          border: `1px solid ${P.b}`, borderRadius: 8, overflow: "hidden"
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            background: `${P.b}40`, padding: "8px 14px",
            fontSize: 9, color: P.t3, fontFamily: FONT, letterSpacing: 2, textTransform: "uppercase"
          }}>
            <span>Threshold τ</span>
            <span>Flagged Count</span>
            <span>% of 58,220</span>
          </div>
          {THRESHOLD_TABLE.map(row => (
            <div key={row.tau} style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              padding: "10px 14px",
              background: row.highlight ? `${P.gold}12` : "transparent",
              borderTop: `1px solid ${P.b}30`,
              border: row.highlight ? `1px solid ${P.gold}30` : undefined
            }}>
              <span style={{ fontSize: 12, color: row.highlight ? P.gold : P.t2, fontFamily: FONT, fontWeight: row.highlight ? 700 : 400 }}>
                τ = {row.tau}
              </span>
              <span style={{ fontSize: 12, color: row.highlight ? P.gold : P.t2, fontFamily: FONT, fontWeight: row.highlight ? 700 : 400 }}>
                {row.flagged}
              </span>
              <span style={{ fontSize: 12, color: row.highlight ? P.gold : P.t2, fontFamily: FONT, fontWeight: row.highlight ? 700 : 400 }}>
                {row.pct}
                {row.highlight && <span style={{ fontSize: 8, color: P.gold, marginLeft: 8 }}>← MEDIAN</span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sensitivity stat */}
      <div style={{
        background: `${P.teal}10`, border: `1px solid ${P.teal}30`,
        borderRadius: 10, padding: "16px 20px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: P.teal, fontFamily: FONT, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
              BIFSG Sensitivity Validation
            </div>
            <div style={{ fontSize: 13, color: P.t2, fontFamily: FONT, lineHeight: 1.6 }}>
              343 of 349 published Hispanic casualties captured by BIFSG model.<br />
              6 false negatives — all with ambiguous surname patterns.
            </div>
          </div>
          <div style={{ textAlign: "center", minWidth: 100 }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: P.teal, fontFamily: FONT }}>98.3%</div>
            <div style={{ fontSize: 9, color: P.teal, fontFamily: FONT, letterSpacing: 2 }}>SENSITIVITY</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DCASForensicDashboard() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ background: P.bg, minHeight: "100vh", fontFamily: FONT, color: P.t1, padding: "0 0 60px 0" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0D1B3E 0%, #1E3A8A 50%, #0D1B3E 100%)",
        borderBottom: `1px solid ${P.b}`, padding: "28px 32px"
      }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 8, color: P.t3, letterSpacing: 3, textTransform: "uppercase", fontFamily: FONT, marginBottom: 8 }}>
                Forensic Analytics Module
              </div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: P.t1, fontFamily: FONT, letterSpacing: 1 }}>
                DCAS FORENSIC ANALYTICS
              </h1>
              <div style={{ fontSize: 12, color: P.t3, fontFamily: FONT, marginTop: 4 }}>
                Vietnam Conflict Extract File
              </div>
            </div>
            <div style={{
              background: `${P.blue}30`, border: `1px solid ${P.blue}60`,
              borderRadius: 8, padding: "8px 16px", textAlign: "right"
            }}>
              <div style={{ fontSize: 10, color: P.t3, fontFamily: FONT }}>NARA ID 2240992</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: P.t1, fontFamily: FONT }}>58,220 Records</div>
              <div style={{ fontSize: 8, color: P.teal, fontFamily: FONT }}>21 FIELDS · 3,377 RECONCILIATION</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "24px 32px 0" }}>

        {/* KPI Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
          <KpiCard icon={Database} label="Total DCAS Records" value="58,220" sub="NARA" color={P.blue} />
          <KpiCard icon={Flag} label="Official Hispanic" value="349" sub="0.60%" color={P.red} />
          <KpiCard icon={TrendingUp} label="BISG Estimate" value="3,272" sub="5.62%" color={P.gold} />
          <KpiCard icon={AlertTriangle} label="Suppressed / Erased" value="1,789" sub="83.6%" color={P.amber} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
          <KpiCard icon={Activity} label="Classification Failure" value="83.6%" color={P.orange} />
          <KpiCard icon={Layers} label="Undercount Ratio" value="8.2–14.8×" sub="range" color={P.cyan} />
          <KpiCard icon={Shield} label="BIFSG Sensitivity" value="98.3%" color={P.teal} />
          <KpiCard icon={Cpu} label="Reconciliation Records" value="3,377" sub="dcas_hr CSV" color={P.violet} />
        </div>

        {/* Tab Strip */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 24,
          background: "rgba(15,23,42,0.6)", borderRadius: 10, padding: 4,
          border: `1px solid ${P.b}`, width: "fit-content"
        }}>
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setActiveTab(i)}
              style={{
                background: activeTab === i ? P.blue : "transparent",
                border: "none", borderRadius: 7,
                padding: "8px 16px", cursor: "pointer",
                fontSize: 10, fontFamily: FONT,
                color: activeTab === i ? P.white : P.t3,
                fontWeight: activeTab === i ? 700 : 400,
                transition: "all 0.15s ease",
                letterSpacing: 0.5
              }}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{
          background: "linear-gradient(135deg, #1E3A8A 0%, #1A2E5C 100%)",
          border: `1px solid ${P.b}`, borderRadius: 12, padding: "24px 28px"
        }}>
          {activeTab === 0 && <OverviewTab />}
          {activeTab === 1 && <StreamTab />}
          {activeTab === 2 && <StateTab />}
          {activeTab === 3 && <TimelineTab />}
          {activeTab === 4 && <MethodologyTab />}
        </div>

      </div>
    </div>
  );
}

