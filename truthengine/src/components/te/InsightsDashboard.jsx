import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell
} from "recharts";
import { P } from "../../lib/teData";

// --- Data from the report ---

const DEPORTATION_BY_YEAR = [
  { year: "FY2022", total: 5431, ptsd: 3859, admin: "Biden" },
  { year: "FY2023", total: 31395, ptsd: 22032, admin: "Biden" },
  { year: "FY2024", total: 35344, ptsd: 23527, admin: "Biden" },
  { year: "FY2025", total: 105573, ptsd: 42836, admin: "Trump II" },
  { year: "FY2026\n(Jan–Mar)", total: 25083, ptsd: 8293, admin: "Trump II" },
];

const FOIA_REQUESTS = [
  { id: "FOIA-2026-001", agency: "VA BIRLS", filed: "Jan 2026", expected: "Apr 2026", daysOverdue: 83, priority: "CRITICAL", status: "OVERDUE" },
  { id: "FOIA-2026-002", agency: "DHS/ICE ENFORCE", filed: "Feb 2026", expected: "Apr 2026", daysOverdue: 66, priority: "CRITICAL", status: "OVERDUE" },
  { id: "FOIA-2026-003", agency: "DOD/DMDC DCAS", filed: "Mar 2026", expected: "May 2026", daysOverdue: 0, priority: "CRITICAL", status: "PENDING" },
  { id: "FOIA-2026-004", agency: "INAI Mexico", filed: "Feb 2026", expected: "Mar 2026 (Imminent)", daysOverdue: 0, priority: "CRITICAL", status: "PENDING" },
  { id: "FOIA-2026-005", agency: "SSS / NARA", filed: "Mar 2026", expected: "Jun 2026", daysOverdue: 0, priority: "HIGH", status: "PENDING" },
];

const DCAS_CONVERGENCE = [
  { source: "DCAS Official\n(NARA 2008)", count: 349, pct: 0.60, type: "official" },
  { source: "BISG Forensic\n(AUMER 2026)", count: 2309, pct: 3.97, type: "forensic" },
  { source: "NARA Revised\n(Internal)", count: 3070, pct: 5.27, type: "forensic" },
  { source: "Guzmán (1970)\nNational Est.", count: 3200, pct: 5.49, type: "scholarly" },
  { source: "LAE Database\nCross-Ref", count: 3741, pct: 6.43, type: "scholarly" },
  { source: "Guzmán (1969)\nSW States", count: 3500, pct: 6.01, type: "scholarly" },
];

const PTSD_BY_ERA = [
  { era: "Korean War\n(1930–37)", total: 3, ptsd: 1, noCrime: 1, diedInICE: 0 },
  { era: "Vietnam\n(1938–56)", total: 769, ptsd: 370, noCrime: 120, diedInICE: 3 },
  { era: "Gulf War\n(1957–78)", total: 39010, ptsd: 17947, noCrime: 5767, diedInICE: 19 },
  { era: "Iraq/Afghan\n(1979–98)", total: 129735, ptsd: 51563, noCrime: 21734, diedInICE: 27 },
];

const CRIME_BREAKDOWN = [
  { name: "PTSD-High\n(Drug/Jail/Probation)", value: 95593, pct: 56.4, color: "#C0392B" },
  { name: "No Criminal Charge\n(Immigration Only)", value: 27622, pct: 16.3, color: "#1B6CA8" },
  { name: "Pending Charges\n(Not Convicted)", value: 34798, pct: 20.5, color: "#1A2E5C" },
  { name: "PTSD-Moderate\n(State Felony)", value: 4983, pct: 2.9, color: P.gold },
  { name: "Federal Prison\n(Serious Felony)", value: 6521, pct: 3.8, color: "#4A5568" },
];

const KIA_FORENSIC_ESTIMATE = [
  { stream: "DCAS Direct\n(Floor)", estimate: 4, type: "official", color: P.red },
  { stream: "BISG\n(Stream 2)", estimate: 407, type: "forensic", color: P.gold },
  { stream: "NARA Revised\n(Stream 3)", estimate: 540, type: "forensic", color: P.gold },
  { stream: "Guzman 1969\n(Stream 4)", estimate: 700, type: "scholarly", color: P.blue },
  { stream: "Demographic\nFunnel (Stream 5)", estimate: 525, type: "scholarly", color: P.blue },
];

const GEO_DATA = [
  { state: "Texas", deported: 62821, erasureRatio: "8.9x" },
  { state: "California", deported: 19289, erasureRatio: "6.8x" },
  { state: "Arizona", deported: 9702, erasureRatio: "High" },
  { state: "Florida", deported: 9392, erasureRatio: "Med" },
  { state: "Georgia", deported: 5657, erasureRatio: "Med" },
  { state: "Tennessee", deported: 4109, erasureRatio: "Low" },
  { state: "Oklahoma", deported: 3982, erasureRatio: "Low" },
  { state: "N. Carolina", deported: 3780, erasureRatio: "Low" },
];

const TABS = [
  { id: "deportations", label: "📊 Deportation Trends" },
  { id: "dcas", label: "🔬 DCAS Convergence" },
  { id: "foia", label: "📋 FOIA Timeline" },
  { id: "ptsd", label: "🧠 PTSD Analysis" },
  { id: "geo", label: "🗺️ Geographic" },
  { id: "kia", label: "⚰️ Vietnam KIA Forensic" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0D1B2A", border: `1px solid ${P.b}`, borderRadius: 8, padding: "8px 12px", fontFamily: "'IBM Plex Mono',monospace", fontSize: 8 }}>
      <div style={{ color: P.t1, fontWeight: 800, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <span style={{ fontWeight: 700 }}>{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function InsightsDashboard() {
  const [tab, setTab] = useState("deportations");

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1 }}>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P.t1 }}>
          📊 TruthEngine360 <span style={{ color: P.gold }}>Insights</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          DATA VISUALIZATIONS · SOURCE: AUMER FOUNDATION FORENSIC RESEARCH REPORT (ARCE, 2026) · CHC BRIEF MAY 18, 2026
        </div>
      </div>

      {/* Core Findings KPI Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Mexico Nationals Deported", value: "202,864", color: P.red },
          { label: "Veteran Flags in 713K Records", value: "ZERO", color: P.red },
          { label: "Vietnam-Era Cohort Deported", value: "769", color: P.gold },
          { label: "DCAS Failure Rate", value: "84.9%", color: P.red },
          { label: "Non-Citizen Vets at Risk", value: "94,000", color: P.amber },
          { label: "PTSD-Probable Deported", value: "69,881+", color: P.red },
          { label: "Died in ICE Custody", value: "49", color: P.red },
          { label: "FY2025 Surge vs 2022", value: "+499%", color: P.red },
        ].map((s, i) => (
          <div key={i} style={{ background: P.card, border: `1px solid ${s.color}25`, borderLeft: `3px solid ${s.color}`, borderRadius: 7, padding: "7px 10px" }}>
            <div style={{ fontSize: 6, color: P.t4, marginBottom: 3, lineHeight: 1.4 }}>{s.label}</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tab Nav */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: "7px 14px", fontSize: 8, fontWeight: tab === t.id ? 800 : 600,
              background: tab === t.id ? `${P.gold}20` : P.card,
              border: `1px solid ${tab === t.id ? P.gold : P.b}`,
              color: tab === t.id ? P.gold : P.t4, borderRadius: 20,
              cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Deportation Trends ── */}
      {tab === "deportations" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 4 }}>Mexican Nationals Deported by Year (FY2022–2026)</div>
            <div style={{ fontSize: 7, color: P.t4, marginBottom: 12 }}>Total deportations vs. PTSD-probable subset · Blue = Biden era · Red = Trump II · Source: TruthEngine360 ICE Parquet (Arce, 2026)</div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={DEPORTATION_BY_YEAR} barSize={38}>
                <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
                <XAxis dataKey="year" stroke={P.t4} style={{ fontSize: 8 }} />
                <YAxis stroke={P.t4} style={{ fontSize: 8 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 8 }} />
                <ReferenceLine x="FY2025" stroke={P.red} strokeDasharray="4 2" label={{ value: "Trump Inaug.", position: "top", fill: P.red, fontSize: 7 }} />
                <Bar dataKey="total" name="Total Deported" fill={P.blue}
                  cell={DEPORTATION_BY_YEAR.map((d, i) => <Cell key={i} fill={d.admin === "Trump II" ? P.red : P.blue} />)} />
                <Bar dataKey="ptsd" name="PTSD-Probable" fill={P.gold} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 4 }}>PTSD-Probable Deportation Surge (All Veteran-Era Cohorts)</div>
            <div style={{ fontSize: 7, color: P.t4, marginBottom: 12 }}>82% single-year increase 2024→2025 · April 2025: ICE rescinds "significant mitigating factor" policy</div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={DEPORTATION_BY_YEAR}>
                <defs>
                  <linearGradient id="ptsdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={P.red} stopOpacity={0.6} />
                    <stop offset="95%" stopColor={P.red} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
                <XAxis dataKey="year" stroke={P.t4} style={{ fontSize: 8 }} />
                <YAxis stroke={P.t4} style={{ fontSize: 8 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine x="FY2025" stroke={P.red} strokeDasharray="4 2"
                  label={{ value: "Apr 2025: Policy Reversed", position: "insideTopRight", fill: P.red, fontSize: 7 }} />
                <Area type="monotone" dataKey="ptsd" name="PTSD-Probable" stroke={P.red} strokeWidth={2.5} fill="url(#ptsdGrad)" dot={{ r: 5, fill: P.red }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── TAB: DCAS Convergence ── */}
      {tab === "dcas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: `${P.red}08`, border: `1px solid ${P.red}30`, borderRadius: 10, padding: "12px 16px", marginBottom: 4 }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: P.red, marginBottom: 4 }}>⚠ CORE FORENSIC FINDING</div>
            <div style={{ fontSize: 8, color: P.t2, lineHeight: 1.7 }}>
              Five independent methodologies converge between <strong style={{ color: P.gold }}>2,309–3,741</strong> Hispanic Vietnam casualties.
              DCAS official count: <strong style={{ color: P.red }}>349 (0.60%)</strong>.
              Classification failure rate: <strong style={{ color: P.red }}>84.9%</strong>.
            </div>
          </div>

          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 4 }}>Five-Stream Convergence — Hispanic Vietnam Casualties</div>
            <div style={{ fontSize: 7, color: P.t4, marginBottom: 12 }}>Red = official anomaly · Gold = AUMER forensic · Blue = independent scholarly · 84.9% classification failure rate</div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={DCAS_CONVERGENCE} layout="vertical" barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
                <XAxis type="number" stroke={P.t4} style={{ fontSize: 7 }} />
                <YAxis type="category" dataKey="source" stroke={P.t4} style={{ fontSize: 7 }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine x={349} stroke={P.red} strokeDasharray="3 3" label={{ value: "Official: 349", position: "insideTopRight", fill: P.red, fontSize: 7 }} />
                <Bar dataKey="count" name="Hispanic KIA Estimate" radius={[0, 4, 4, 0]}
                  cell={DCAS_CONVERGENCE.map((d, i) => (
                    <Cell key={i} fill={d.type === "official" ? P.red : d.type === "forensic" ? P.gold : P.blue} />
                  ))} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {[
              { label: "DCAS Official", value: "349", sub: "0.60% of 58,220", color: P.red },
              { label: "BISG Forensic (AUMER)", value: "2,309+", sub: "3.97% of 58,220", color: P.gold },
              { label: "Classification Failure", value: "84.9%", sub: "(2,309 - 349) / 2,309", color: P.red },
            ].map((s, i) => (
              <div key={i} style={{ background: P.card, border: `1px solid ${s.color}25`, borderTop: `3px solid ${s.color}`, borderRadius: 9, padding: "12px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 7, color: P.t4, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 6, color: P.t4, marginTop: 4 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: FOIA Timeline ── */}
      {tab === "foia" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: `${P.red}08`, border: `1px solid ${P.red}30`, borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: P.red, marginBottom: 4 }}>⚠ 2 FOIA REQUESTS OVERDUE — STATUTORY 20-DAY PERIOD EXCEEDED (5 U.S.C. §552)</div>
            <div style={{ fontSize: 7, color: P.t2 }}>VA BIRLS (83 days overdue) · DHS/ICE ENFORCE (66 days overdue) · These contain the veteran status fields absent in all 713,464 ICE records</div>
          </div>

          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 12 }}>FOIA Request Status — Days Overdue</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={FOIA_REQUESTS.filter(f => f.daysOverdue > 0)} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
                <XAxis type="number" stroke={P.t4} style={{ fontSize: 8 }} label={{ value: "Days Overdue", position: "insideBottom", fill: P.t4, fontSize: 7 }} />
                <YAxis type="category" dataKey="agency" stroke={P.t4} style={{ fontSize: 8 }} width={130} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="daysOverdue" name="Days Overdue" fill={P.red} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FOIA_REQUESTS.map((f, i) => (
              <div key={i} style={{
                background: f.status === "OVERDUE" ? `${P.red}10` : P.card,
                border: `1px solid ${f.status === "OVERDUE" ? P.red : P.b}`,
                borderLeft: `4px solid ${f.priority === "CRITICAL" ? P.red : P.gold}`,
                borderRadius: 9, padding: "10px 14px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 8, fontWeight: 800, color: P.t1, marginBottom: 2 }}>{f.id} — {f.agency}</div>
                    <div style={{ fontSize: 7, color: P.t4 }}>Filed: {f.filed} · Expected: {f.expected}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{
                      fontSize: 6, padding: "2px 8px", borderRadius: 20, fontWeight: 700,
                      background: f.status === "OVERDUE" ? `${P.red}20` : `${P.gold}15`,
                      color: f.status === "OVERDUE" ? P.red : P.gold,
                      border: `1px solid ${f.status === "OVERDUE" ? P.red : P.gold}30`,
                    }}>
                      {f.status === "OVERDUE" ? `⚠ ${f.daysOverdue}d OVERDUE` : "⏳ PENDING"}
                    </span>
                    <span style={{
                      fontSize: 6, padding: "2px 8px", borderRadius: 20, fontWeight: 700,
                      background: f.priority === "CRITICAL" ? `${P.red}15` : `${P.amber}15`,
                      color: f.priority === "CRITICAL" ? P.red : P.amber,
                      border: `1px solid ${f.priority === "CRITICAL" ? P.red : P.amber}30`,
                    }}>{f.priority}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: PTSD Analysis ── */}
      {tab === "ptsd" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 4 }}>PTSD Analysis by Military Era</div>
              <div style={{ fontSize: 7, color: P.t4, marginBottom: 12 }}>Total deported · PTSD-probable · No criminal charge · Died in ICE</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={PTSD_BY_ERA} layout="vertical" barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
                  <XAxis type="number" stroke={P.t4} style={{ fontSize: 7 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                  <YAxis type="category" dataKey="era" stroke={P.t4} style={{ fontSize: 7 }} width={85} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 7 }} />
                  <Bar dataKey="total" name="Total Deported" fill={P.blue} />
                  <Bar dataKey="ptsd" name="PTSD-Probable" fill={P.red} />
                  <Bar dataKey="noCrime" name="No Criminal Charge" fill={P.gold} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 4 }}>Crime Classification Breakdown</div>
              <div style={{ fontSize: 7, color: P.t4, marginBottom: 10 }}>169,517 veteran-era Mexican nationals deported</div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={CRIME_BREAKDOWN} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                    dataKey="value" nameKey="name" paddingAngle={2}>
                    {CRIME_BREAKDOWN.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => v.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
                {CRIME_BREAKDOWN.map((d, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 7, color: P.t3 }}>
                    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                      <span>{d.name.replace("\n", " ")}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: d.color }}>{d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: `${P.gold}08`, border: `1px solid ${P.gold}30`, borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: P.gold, marginBottom: 8 }}>⚡ CORE FINDING — PTSD as Deportation Mechanism</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {[
                { label: "PTSD-Probable Deported", value: "~69,881", color: P.red },
                { label: "No Criminal Charge", value: "27,622", color: P.blue },
                { label: "Died in ICE Custody", value: "49", color: P.red },
                { label: "Cases w/ 10+ yr PTSD Gap", value: "80%", color: P.amber },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 6, color: P.t4, marginBottom: 3 }}>{s.label}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Geographic ── */}
      {tab === "geo" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 4 }}>Top States — Mexican Nationals Deported FY2022–2026</div>
            <div style={{ fontSize: 7, color: P.t4, marginBottom: 12 }}>Texas & California = 40% of all deportations · Highest DCAS casualty undercounting ratios · Double erasure</div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={GEO_DATA} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
                <XAxis dataKey="state" stroke={P.t4} style={{ fontSize: 8 }} />
                <YAxis stroke={P.t4} style={{ fontSize: 8 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="deported" name="Deported"
                  cell={GEO_DATA.map((d, i) => (
                    <Cell key={i} fill={["Texas", "California"].includes(d.state) ? P.red : P.blue} />
                  ))} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            {GEO_DATA.map((d, i) => (
              <div key={i} style={{ background: P.card, border: `1px solid ${["Texas","California"].includes(d.state) ? P.red+"40" : P.b}`, borderTop: `3px solid ${["Texas","California"].includes(d.state) ? P.red : P.blue}`, borderRadius: 9, padding: "10px 14px" }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 2 }}>{d.state}</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 800, color: ["Texas","California"].includes(d.state) ? P.red : P.blue }}>
                  {d.deported.toLocaleString()}
                </div>
                <div style={{ fontSize: 6, color: P.t4, marginTop: 3 }}>DCAS Erasure Ratio: <span style={{ color: P.gold }}>{d.erasureRatio}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: Vietnam KIA Forensic ── */}
      {tab === "kia" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: `${P.red}08`, border: `1px solid ${P.red}30`, borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: P.red, marginBottom: 4 }}>FORENSIC FINDING — Mexican National Vietnam KIA</div>
            <div style={{ fontSize: 8, color: P.t2, lineHeight: 1.7 }}>
              Estimated <strong style={{ color: P.gold }}>346–741</strong> Mexican nationals killed in action in Vietnam.
              DCAS official count: <strong style={{ color: P.red }}>4 (FOREIGN home of record)</strong>.
              Erasure rate: <strong style={{ color: P.red }}>99.2%</strong>. Forensic median: ~500.
            </div>
          </div>

          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 4 }}>Five-Stream Forensic Estimate — Mexican National Vietnam KIA</div>
            <div style={{ fontSize: 7, color: P.t4, marginBottom: 12 }}>Red = official floor (4 records) · Gold = AUMER forensic streams · Blue = scholarly/demographic</div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={KIA_FORENSIC_ESTIMATE} barSize={38}>
                <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
                <XAxis dataKey="stream" stroke={P.t4} style={{ fontSize: 7 }} />
                <YAxis stroke={P.t4} style={{ fontSize: 8 }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={500} stroke={P.gold} strokeDasharray="4 2" label={{ value: "Median ~500", position: "right", fill: P.gold, fontSize: 7 }} />
                <ReferenceLine y={346} stroke={P.t4} strokeDasharray="2 2" label={{ value: "Floor 346", position: "right", fill: P.t4, fontSize: 7 }} />
                <Bar dataKey="estimate" name="Forensic Estimate"
                  cell={KIA_FORENSIC_ESTIMATE.map((d, i) => <Cell key={i} fill={d.color} />)} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {[
              { label: "DCAS Direct (Floor)", value: "4", sub: "FOREIGN home of record", color: P.red },
              { label: "Forensic Median", value: "~500", sub: "Five-stream convergence", color: P.gold },
              { label: "Erasure Rate", value: "99.2%", sub: "(500 - 4) / 500", color: P.red },
            ].map((s, i) => (
              <div key={i} style={{ background: P.card, border: `1px solid ${s.color}25`, borderTop: `3px solid ${s.color}`, borderRadius: 9, padding: "12px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 7, color: P.t4, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 6, color: P.t4, marginTop: 4 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source attribution */}
      <div style={{ marginTop: 16, padding: "10px 14px", background: P.card, border: `1px solid ${P.b}`, borderRadius: 8, fontSize: 6, color: P.t4, lineHeight: 1.8 }}>
        <strong style={{ color: P.t3 }}>Sources:</strong> TruthEngine360 ICE Arrest Database (N=713,464) · NARA DCAS Vietnam Extract (ARC 2240992, N=58,220) · GAO-19-416 (2019) · CRS Report R48163 (2024) · Pentagon Valor Review (2014) · Warren/DHS Data Release (March 2026) · Guzman (1969, 1970) · AUMER Foundation BISG Forensic Audit (Arce, 2026)
      </div>
    </div>
  );
}