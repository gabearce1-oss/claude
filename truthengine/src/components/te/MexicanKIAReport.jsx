import { useState } from "react";
import { P } from "../../lib/teData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  PieChart, Pie, Cell, ComposedChart, Area
} from "recharts";

// ── DATA ──────────────────────────────────────────────────────────
const FIVE_STREAM = [
  { name: "DCAS Official\n(NARA 2008)", value: 4, pct: "0.007%", color: "#FF5C5C", note: "ANOMALOUS FLOOR" },
  { name: "BISG Forensic\n(AUMER 2026)", value: 407, pct: "0.70%", color: "#9D7BFF", note: "BISG x 17.6% MX fraction" },
  { name: "NARA Revised\nEstimate", value: 540, pct: "0.93%", color: "#4A9EFF", note: "3,070 x 17.6%" },
  { name: "Demographic\nFunnel (Med.)", value: 500, pct: "0.86%", color: "#2DD4BF", note: "35k served x 2% KIA rate" },
  { name: "Guzman 1969\nMethod", value: 700, pct: "1.20%", color: "#F5B942", note: "3,500 SW x 20% MX frac." },
];

const DEPORTATION_BY_YEAR = [
  { year: "FY2022", total: 5431, ptsd: 3859, admin: "Biden" },
  { year: "FY2023", total: 31395, ptsd: 22032, admin: "Biden" },
  { year: "FY2024", total: 35344, ptsd: 23527, admin: "Biden" },
  { year: "FY2025", total: 105573, ptsd: 42836, admin: "Trump II" },
  { year: "FY2026\n(Jan–Mar)", total: 25083, ptsd: 8293, admin: "Trump II" },
];

const PTSD_BY_ERA = [
  { era: "Korean War\n(1930–37)", total: 3, ptsd: 1, noCrime: 1, diedICE: 0 },
  { era: "Vietnam\n(1938–56)", total: 769, ptsd: 370, noCrime: 120, diedICE: 3 },
  { era: "Gulf War\n(1957–78)", total: 39010, ptsd: 17947, noCrime: 5767, diedICE: 19 },
  { era: "Iraq/Afghan\n(1979–98)", total: 129735, ptsd: 51563, noCrime: 21734, diedICE: 27 },
];

const CRIME_BREAKDOWN = [
  { name: "PTSD-High\n(County Jail/Drug)", value: 95593, pct: 56.4, color: "#FF5C5C" },
  { name: "No Criminal\nCharge", value: 27622, pct: 16.3, color: "#2DD4BF" },
  { name: "Pending Charges\n(Not Convicted)", value: 34798, pct: 20.5, color: "#4A9EFF" },
  { name: "PTSD-Moderate\n(State Felony)", value: 4983, pct: 2.9, color: "#F5B942" },
  { name: "Federal Prison\n(Serious Felony)", value: 6521, pct: 3.8, color: "#9D7BFF" },
];

const GEO_DATA = [
  { state: "Texas", count: 62821, erasure: "8.9x", color: "#FF5C5C" },
  { state: "California", count: 19289, erasure: "6.8x", color: "#FF5C5C" },
  { state: "Arizona", count: 9702, erasure: "5.2x", color: "#4A9EFF" },
  { state: "Florida", count: 9392, erasure: "3.1x", color: "#4A9EFF" },
  { state: "Georgia", count: 5657, erasure: "2.8x", color: "#4A9EFF" },
  { state: "Tennessee", count: 4109, erasure: "2.4x", color: "#4A9EFF" },
  { state: "Oklahoma", count: 3982, erasure: "2.2x", color: "#4A9EFF" },
  { state: "N. Carolina", count: 3780, erasure: "2.1x", color: "#4A9EFF" },
];

const BI_SCORES = [
  { indicator: "BI-1\nClassification\nDissolution", Pentagon: 0.849, ICE: 0.700, SSS: 0.800 },
  { indicator: "BI-2\nEstimation\nVacuum", Pentagon: 0.900, ICE: 0.950, SSS: 0.850 },
  { indicator: "BI-3\nArchival\nDestruction", Pentagon: 0.600, ICE: 0.400, SSS: 0.900 },
  { indicator: "BI-4\nRecognition\nLatency", Pentagon: 0.800, ICE: 0.850, SSS: 0.700 },
  { indicator: "BI-5\nCompounding\nInvisibility", Pentagon: 0.950, ICE: 0.900, SSS: 0.850 },
];

const EIGHT_PHASES = [
  { phase: 1, agency: "SSS Form 1 Draft Reg.", status: "SURVIVES", color: "#2DD4BF", finding: "NARA RG 147 · St. Louis. Fields include alien A-number. Non-citizens coded 4-C. Mexico had no treaty exemption — 'Alienage exemption trap.'" },
  { phase: 2, agency: "OMPF Military Personnel File", status: "PARTIAL", color: "#F5B942", finding: "Race coded: WHITE. No citizenship field. 1973 NPRC fire destroyed 16–18M files." },
  { phase: 3, agency: "DoD Form 1300 — Casualty Report", status: "DCAS", color: "#4A9EFF", finding: "CRITICAL GAP: No citizenship or nationality field. Mexican national with El Paso induction address = indistinguishable from US citizen." },
  { phase: "4A", agency: "DoD → DMDC → DCAS", status: "LIVE", color: "#2DD4BF", finding: "1997 OMB race recoding produced 349 'HISPANIC ONE RACE' / 58,220. Only 4 records coded FOREIGN." },
  { phase: "4B", agency: "DoD → State Dept. → SRE Mexico", status: "SRE archives", color: "#9D7BFF", finding: "ONLY record using the word MEXICAN NATIONAL. Consulate issued acta de defunción mexicana. INAI FOIA pending." },
  { phase: "4C", agency: "DoD → Family in Mexico", status: "UNDOCUMENTED", color: "#FF5C5C", finding: "Families received terse letter in English. Casualty Assistance Officer NOT required to brief families on N-644, DIC, or death gratuity." },
  { phase: "5A", agency: "Death Gratuity $10,000", status: "BLOCKED", color: "#FF5C5C", finding: "Most Mexican families not named as beneficiaries. System never proactively ensured foreign next-of-kin received payment." },
  { phase: "5B", agency: "VA DIC · $1,699/mo (2026)", status: "FOIA BLOCKED 83d", color: "#FF5C5C", finding: "No citizenship requirement for beneficiary. Foreign addresses eligible. VA BIRLS death file tracks all DIC payments including foreign addresses." },
  { phase: "5C", agency: "N-644 Posthumous Citizenship", status: "NEAR-ZERO FILED", color: "#FF5C5C", finding: "Enacted 1990 — 15–25 years AFTER Vietnam deaths. Families had until 1992 to file retroactively. Mexican families never notified." },
  { phase: 8, agency: "CB-HSIVF Recovery Protocol", status: "6 FOIAs ACTIVE", color: "#2DD4BF", finding: "SSS Form 1 x DCAS name/DOB match. USCIS N-644. VA BIRLS DIC foreign addresses. SRE consular actas. CBP manifests. DCAS birthplace=Mexico." },
];

const KEY_STATS = [
  { label: "Mexican Nationals in ICE DB", value: "255,344", color: P.blue },
  { label: "Total Deported (Confirmed)", value: "202,864", color: P.red },
  { label: "Trump Era Deported", value: "130,656", color: P.red },
  { label: "Vietnam-Era in System", value: "970", color: P.amber },
  { label: "Vietnam-Era Confirmed Deported", value: "769", color: P.amber },
  { label: "Died in ICE Custody (MX)", value: "52", color: P.red },
  { label: "Veteran Flags in 713,464 Records", value: "ZERO", color: P.red },
  { label: "MX KIA Official DCAS Count", value: "4 (FOREIGN)", color: P.red },
  { label: "MX KIA Forensic Median Estimate", value: "~500", color: P.gold },
  { label: "MX KIA Range", value: "346–741", color: P.violet },
  { label: "Erasure Rate (MX KIA)", value: "99.2%", color: P.red },
  { label: "Hispanic DCAS Failure Rate", value: "84.9%", color: P.red },
  { label: "Non-citizen Vets at Risk", value: "94,000", color: P.amber },
  { label: "PTSD-Probable Deported (All)", value: "69,881+", color: P.violet },
  { label: "Deported w/ No Crime", value: "27,622", color: P.amber },
  { label: "DCAS Classification Failure", value: "349 vs 2,309", color: P.red },
];

// ── CUSTOM TOOLTIP ────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#080D18", border: `1px solid ${P.b}`, borderRadius: 8, padding: "10px 14px", fontSize: 9 }}>
      <div style={{ color: P.gold, fontWeight: 800, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {p.value?.toLocaleString()}</div>
      ))}
    </div>
  );
};

// ── TABS ──────────────────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "📊 Overview & KPIs" },
  { id: "kia", label: "⚰️ MX KIA Forensic" },
  { id: "deportations", label: "📈 Deportation Surge" },
  { id: "ptsd", label: "🧠 PTSD Analysis" },
  { id: "geo", label: "🗺️ Geographic" },
  { id: "bi", label: "🔬 Behavioral Indicators" },
  { id: "chain", label: "🔗 Chain of Custody" },
  { id: "foia", label: "📋 Priority FOIAs" },
];

export default function MexicanKIAReport() {
  const [tab, setTab] = useState("overview");

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1, paddingBottom: 40 }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .kia-pulse { animation: pulse 2s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${P.red}15,#030508)`, border: `2px solid ${P.red}40`, borderRadius: 12, padding: "16px 20px", marginBottom: 14 }}>
        <div style={{ fontSize: 7, color: P.red, letterSpacing: 4, fontWeight: 800, marginBottom: 4 }}>AUMER FOUNDATION · TRUTHENGINE360 · PART XIV FORENSIC DEEP DIVE</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: P.t1, marginBottom: 4 }}>🇲🇽 Mexican Nationals Killed in Vietnam — Forensic Investigation</div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 8 }}>
          {[
            ["Official DCAS Count", "4", P.red],
            ["Forensic Median Estimate", "~500", P.gold],
            ["Estimate Range", "346–741", P.violet],
            ["Erasure Rate", "99.2%", P.red],
            ["MX Nationals Deported (FY22-26)", "202,864", P.red],
            ["Veteran Flags in ICE DB", "ZERO", P.red],
          ].map(([l, v, c]) => (
            <div key={l} style={{ background: `${c}12`, border: `1px solid ${c}30`, borderRadius: 8, padding: "6px 14px", textAlign: "center" }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 800, color: c }}>{v}</div>
              <div style={{ fontSize: 6, color: P.t4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-tab bar */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14, borderBottom: `1px solid ${P.b}`, paddingBottom: 10 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: "6px 12px", background: tab === t.id ? `${P.red}18` : "transparent",
              border: tab === t.id ? `1px solid ${P.red}` : `1px solid ${P.b}`,
              color: tab === t.id ? P.red : P.t4, borderRadius: 6, fontSize: 9, fontWeight: tab === t.id ? 800 : 600,
              cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 8, marginBottom: 14 }}>
            {KEY_STATS.map((s, i) => (
              <div key={i} style={{ background: P.card, border: `1px solid ${s.color}20`, borderLeft: `3px solid ${s.color}`, borderRadius: 7, padding: "8px 12px" }}>
                <div style={{ fontSize: 7, color: P.t4, marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={{ background: `${P.red}08`, border: `1px solid ${P.red}30`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: P.red, marginBottom: 8 }}>CORE FORENSIC FINDING — Part XIV</div>
            <div style={{ fontSize: 9, color: P.t2, lineHeight: 1.8 }}>
              The U.S. government sent an estimated <span style={{ color: P.gold, fontWeight: 800 }}>346 to 741 Mexican citizens to die in Vietnam</span>. Official DCAS count: <span style={{ color: P.red, fontWeight: 800 }}>zero (4 records coded FOREIGN)</span>. Erasure rate: <span style={{ color: P.red, fontWeight: 800 }}>99.2%</span>. Between FY2022–2026, <span style={{ color: P.red, fontWeight: 800 }}>202,864 Mexican nationals were deported</span> — 970 of Vietnam-era birth cohort — with <span style={{ color: P.red, fontWeight: 800 }}>ZERO veteran screening flags</span> in all 713,464 ICE records. The data gap itself is the evidence. This is documented institutional non-compliance, not a data limitation (GAO-19-416, 2019; Arce, 2026).
            </div>
          </div>
        </div>
      )}

      {/* MX KIA FORENSIC */}
      {tab === "kia" && (
        <div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 8 }}>📊 Five-Stream Forensic Convergence — Mexican National Vietnam KIA</div>
            <div style={{ fontSize: 8, color: P.t4, marginBottom: 10 }}>All five independent methodologies converge between 346–741. DCAS official count (4) represents absolute floor due to architectural erasure.</div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={FIVE_STREAM} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={`${P.b}40`} />
                <XAxis dataKey="name" tick={{ fill: P.t4, fontSize: 7 }} />
                <YAxis tick={{ fill: P.t4, fontSize: 8 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {FIVE_STREAM.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Forensic Median Box */}
          <div style={{ background: `${P.gold}10`, border: `2px solid ${P.gold}40`, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, marginBottom: 6 }}>FORENSIC MEDIAN: ~500 Mexican nationals killed in action in Vietnam</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
              {FIVE_STREAM.map((s, i) => (
                <div key={i} style={{ background: "#080D18", borderRadius: 6, padding: "8px", textAlign: "center", border: `1px solid ${s.color}25` }}>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 6, color: P.t4, marginTop: 2 }}>{s.note}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stream methodologies */}
          {[
            ["Stream 1 (DCAS direct)", "4 records coded FOREIGN home of record. Absolute floor. Represents 0.8% of forensic estimate — proving near-total erasure.", P.red],
            ["Stream 2 (BISG forensic audit)", "2,309 Hispanic KIA (BISG) × 17.6% Mexican national fraction = ~407.", P.violet],
            ["Stream 3 (NARA revised estimate)", "3,070 Hispanic KIA revised estimate × 17.6% fraction = ~540.", P.blue],
            ["Stream 4 (Guzman 1969 method)", "3,500 Southwest surname analysis × 20% Mexican national fraction = ~700.", P.amber],
            ["Stream 5 (Demographic funnel)", "35,000 served × 2.0% infantry-adjusted KIA rate = ~700; × 1.5% conservative = ~525. Median: ~500.", P.teal],
          ].map(([title, desc, color]) => (
            <div key={title} style={{ background: P.card, border: `1px solid ${color}25`, borderLeft: `4px solid ${color}`, borderRadius: 8, padding: "10px 14px", marginBottom: 6 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color, marginBottom: 3 }}>{title}</div>
              <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* DEPORTATION SURGE */}
      {tab === "deportations" && (
        <div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 4 }}>📈 Mexican Nationals Deported by Year — FY2022 to Present</div>
            <div style={{ fontSize: 8, color: P.t4, marginBottom: 10 }}>Blue = Biden Administration · Red = Trump II Administration · Gold = PTSD-Probable Subset · 2025 figure (+499% vs 2022) directly correlated with April 2025 policy reversal.</div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={DEPORTATION_BY_YEAR} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={`${P.b}40`} />
                <XAxis dataKey="year" tick={{ fill: P.t4, fontSize: 8 }} />
                <YAxis tick={{ fill: P.t4, fontSize: 8 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 8, color: P.t3 }} />
                <Bar dataKey="total" name="Total Deported" fill={P.blue} radius={[3, 3, 0, 0]} />
                <Bar dataKey="ptsd" name="PTSD-Probable" fill={P.gold} radius={[3, 3, 0, 0]} />
                <ReferenceLine x="FY2025" stroke={P.red} strokeDasharray="4 4" label={{ value: "Trump II", fill: P.red, fontSize: 8 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 4 }}>📉 PTSD-Probable Deportations — April 2025 Inflection Point</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={DEPORTATION_BY_YEAR} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={`${P.b}40`} />
                <XAxis dataKey="year" tick={{ fill: P.t4, fontSize: 8 }} />
                <YAxis tick={{ fill: P.t4, fontSize: 8 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="ptsd" name="PTSD-Probable" stroke={P.red} fill={`${P.red}15`} strokeWidth={2} dot={{ fill: P.gold, r: 5 }} />
                <ReferenceLine x="FY2025" stroke={P.amber} strokeDasharray="4 4"
                  label={{ value: "Apr 2025: ICE rescinds 'mitigating factor'  +82%", fill: P.amber, fontSize: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 8 }}>
            {DEPORTATION_BY_YEAR.map(d => (
              <div key={d.year} style={{ background: d.admin === "Trump II" ? `${P.red}08` : `${P.blue}08`, border: `1px solid ${d.admin === "Trump II" ? P.red : P.blue}25`, borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 7, color: P.t4 }}>{d.year} · {d.admin}</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 20, fontWeight: 800, color: d.admin === "Trump II" ? P.red : P.blue }}>{d.total.toLocaleString()}</div>
                <div style={{ fontSize: 7, color: P.gold }}>PTSD-Probable: {d.ptsd.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PTSD ANALYSIS */}
      {tab === "ptsd" && (
        <div>
          <div style={{ background: `${P.red}08`, border: `1px solid ${P.red}30`, borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: P.red, marginBottom: 4 }}>CORE FINDING — Part VI</div>
            <div style={{ fontSize: 8, color: P.t2, lineHeight: 1.7 }}>Between <strong style={{ color: P.gold }}>69,881 and 81,090</strong> Mexican nationals of veteran-eligible age were deported for offenses clinically consistent with untreated combat PTSD. <strong style={{ color: P.amber }}>27,622 had committed no crime at all</strong>. <strong style={{ color: P.red }}>49 died in ICE custody</strong>. Not one record contains a military service flag.</div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 8 }}>PTSD Analysis by Military Service Era</div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={PTSD_BY_ERA} layout="vertical" margin={{ left: 80, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={`${P.b}40`} />
                <XAxis type="number" tick={{ fill: P.t4, fontSize: 8 }} />
                <YAxis dataKey="era" type="category" tick={{ fill: P.t3, fontSize: 7 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 8 }} />
                <Bar dataKey="total" name="Total Deported" fill={P.blue} />
                <Bar dataKey="ptsd" name="PTSD-Probable" fill={P.red} />
                <Bar dataKey="noCrime" name="No Criminal Charge" fill={P.teal} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 8 }}>Crime Classification Breakdown — 169,517 Veteran-Era Mexican Nationals</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              <ResponsiveContainer width={260} height={220}>
                <PieChart>
                  <Pie data={CRIME_BREAKDOWN} cx="50%" cy="50%" innerRadius={50} outerRadius={100} dataKey="value">
                    {CRIME_BREAKDOWN.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {CRIME_BREAKDOWN.map((c, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 8px", border: `1px solid ${c.color}20`, borderLeft: `4px solid ${c.color}`, borderRadius: 5, marginBottom: 4 }}>
                    <span style={{ fontSize: 8, color: P.t2 }}>{c.name.replace("\n", " ")}</span>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 800, color: c.color }}>{c.value.toLocaleString()}</span>
                      <span style={{ fontSize: 7, color: P.t4, marginLeft: 5 }}>{c.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GEOGRAPHIC */}
      {tab === "geo" && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 4 }}>Top States — Mexican Nationals Deported FY2022–2026</div>
          <div style={{ fontSize: 8, color: P.t4, marginBottom: 12 }}>Texas & California account for 40% of all deportations and have the highest DCAS casualty undercounting ratios. Double erasure: statistically invisible in Vietnam, systematically removed 2022–2026.</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={GEO_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${P.b}40`} />
              <XAxis dataKey="state" tick={{ fill: P.t4, fontSize: 8 }} />
              <YAxis tick={{ fill: P.t4, fontSize: 8 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Deportations" radius={[4, 4, 0, 0]}>
                {GEO_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 8 }}>
            {GEO_DATA.map(g => (
              <div key={g.state} style={{ background: P.card, border: `1px solid ${g.color}25`, borderLeft: `4px solid ${g.color}`, borderRadius: 7, padding: "8px 12px" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: g.color }}>{g.state}</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 800 }}>{g.count.toLocaleString()}</div>
                <div style={{ fontSize: 7, color: P.red }}>DCAS erasure ratio: {g.erasure}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BEHAVIORAL INDICATORS */}
      {tab === "bi" && (
        <div>
          <div style={{ background: `${P.violet}08`, border: `1px solid ${P.violet}30`, borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: P.violet, marginBottom: 4 }}>STATISTICAL CONCLUSION — Part IX · SPSS</div>
            <div style={{ fontSize: 8, color: P.t2, lineHeight: 1.7 }}>Pearson r = .847–.914 (p &lt; .01) across all three institutions. BI-2 (Estimation Vacuum) and BI-5 (Compounding Invisibility) explain <strong style={{ color: P.gold }}>93.5% of total erasure force variance</strong> (R² = .935). The pattern is statistically significant, structurally repeatable, and inconsistent with random administrative error.</div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 8 }}>Behavioral Indicator Scores by Institution</div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={BI_SCORES} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={`${P.b}40`} />
                <XAxis dataKey="indicator" tick={{ fill: P.t4, fontSize: 6 }} />
                <YAxis domain={[0, 1]} tick={{ fill: P.t4, fontSize: 8 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 8 }} />
                <Bar dataKey="Pentagon" fill={P.red} radius={[3, 3, 0, 0]} />
                <Bar dataKey="ICE" fill={P.blue} radius={[3, 3, 0, 0]} />
                <Bar dataKey="SSS" fill={P.teal} radius={[3, 3, 0, 0]} />
                <ReferenceLine y={0.70} stroke={P.amber} strokeDasharray="4 4" label={{ value: "Systematic Threshold 0.70", fill: P.amber, fontSize: 7 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[["Pentagon/DMDC", "F_e = 0.650", P.red], ["ICE/DHS", "F_e = 0.720", P.blue], ["Selective Service", "F_e = 0.780", P.teal]].map(([inst, fe, c]) => (
              <div key={inst} style={{ background: P.card, border: `2px solid ${c}30`, borderRadius: 10, padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: c }}>{inst}</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 22, fontWeight: 800, color: c, margin: "8px 0" }}>{fe}</div>
                <div style={{ fontSize: 7, color: P.t4 }}>Erasure Force Score</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHAIN OF CUSTODY */}
      {tab === "chain" && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 4 }}>Eight-Phase Institutional Chain of Custody — Mexican National Vietnam KIA (1965–1975)</div>
          <div style={{ fontSize: 8, color: P.t4, marginBottom: 10 }}>From SSS draft registration through death, notifications, benefits, record destruction, and forensic recovery. Green = surviving records · Red = erasure points · Teal = Mexico-side records.</div>
          {EIGHT_PHASES.map((p, i) => (
            <div key={i} style={{ background: P.card, border: `1px solid ${p.color}25`, borderLeft: `5px solid ${p.color}`, borderRadius: 8, padding: "10px 14px", marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 6 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 800, color: p.color, minWidth: 28 }}>Phase {p.phase}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: P.t1 }}>{p.agency}</span>
                </div>
                <span style={{ fontSize: 7, background: `${p.color}18`, border: `1px solid ${p.color}30`, color: p.color, borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>{p.status}</span>
              </div>
              <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.6 }}>{p.finding}</div>
            </div>
          ))}
        </div>
      )}

      {/* PRIORITY FOIAs */}
      {tab === "foia" && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 10 }}>Three Priority FOIA Actions — Mexican National Vietnam KIA Investigation</div>
          {[
            {
              id: "FOIA-MX-KIA-1", agency: "USCIS · N-644 Vietnam Mexico Archive", color: P.red, priority: "CRITICAL",
              request: "All Form N-644 records for decedents during Vietnam hostilities period (02/28/1961–10/15/1978) where birthplace = Mexico OR country of citizenship = Mexico OR alien A-number present.",
              address: "150 Space Center Loop, Lee's Summit, MO 64064",
              yield: "50–200 direct confirmed Mexican national Vietnam KIA",
              basis: "5 U.S.C. §552 · INA §329A · Pub. L. 101-249"
            },
            {
              id: "FOIA-MX-KIA-2", agency: "INAI / SRE Mexico — Consular Death Notifications 1964–1975", color: P.gold, priority: "CRITICAL",
              request: "Actas de defunción mexicanas expedidas por consulados mexicanos en Estados Unidos para ciudadanos mexicanos fallecidos en servicio militar activo del ejército de los Estados Unidos durante el periodo 1964–1975.",
              address: "plataformadetransparencia.org.mx (FREE FILING)",
              yield: "200–800 consular notifications — ONLY surviving record type using 'CIUDADANO MEXICANO' in Vietnam death context",
              basis: "Ley Federal de Transparencia y Acceso a la Información Pública"
            },
            {
              id: "FOIA-MX-KIA-3", agency: "CBP — Remains Transfer Manifests 1965–1975", color: P.blue, priority: "HIGH",
              request: "All cargo manifests, export documentation, or transfer records for shipment of human remains classified as U.S. military casualties from Dover AFB, Travis AFB, Norton AFB to Republic of Mexico during 1965–1975.",
              address: "90 K Street NE, Washington, DC 20229",
              yield: "One manifest per repatriated body — potentially most direct physical count available",
              basis: "5 U.S.C. §552 · DoD Casualty Affairs supplement"
            },
          ].map(f => (
            <div key={f.id} style={{ background: P.card, border: `2px solid ${f.color}30`, borderLeft: `6px solid ${f.color}`, borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: f.color, fontWeight: 800 }}>{f.id}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: P.t1 }}>{f.agency}</div>
                </div>
                <span style={{ fontSize: 7, background: `${f.color}18`, border: `1px solid ${f.color}30`, color: f.color, borderRadius: 20, padding: "3px 10px", fontWeight: 800 }}>{f.priority}</span>
              </div>
              <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.7, marginBottom: 6 }}><strong>Request:</strong> {f.request}</div>
              <div style={{ fontSize: 8, color: P.t3, marginBottom: 4 }}><strong>Agency Address:</strong> <span style={{ color: P.teal }}>{f.address}</span></div>
              <div style={{ fontSize: 8, color: P.gold, fontWeight: 700, marginBottom: 4 }}>Expected Yield: {f.yield}</div>
              <div style={{ fontSize: 7, color: P.t4 }}>Legal basis: {f.basis}</div>
            </div>
          ))}

          <div style={{ background: `${P.amber}08`, border: `1px solid ${P.amber}30`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: P.amber, marginBottom: 6 }}>SUPPLEMENTAL FOIA ACTION — Existing FOIA-2026-003</div>
            <div style={{ fontSize: 8, color: P.t2, lineHeight: 1.7 }}>Supplement the pending DMDC FOIA with: <span style={{ color: P.teal }}>"Count of records in the DCAS Vietnam Conflict Extract where HOME_OF_RECORD_COUNTRY = Mexico or MX or equivalent country code, with full record extract for all matching records."</span> This is the single most direct database pathway to a confirmed government count.</div>
          </div>

          <div style={{ marginTop: 14, background: `${P.red}08`, border: `1px solid ${P.red}25`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.red }}>FOIA COMPLIANCE NOTICE</div>
            <div style={{ fontSize: 7, color: P.t3, lineHeight: 1.7, marginTop: 4 }}>VA BIRLS (F001) — <span style={{ color: P.red }}>83 days overdue</span> · ENFORCE/IDENT (F002) — <span style={{ color: P.red }}>66 days overdue</span>. Both have exceeded the statutory 20-business-day response period under 5 U.S.C. §552(a)(6)(A)(i). AUMER Foundation reserves all rights to pursue administrative appeals and, if necessary, district court litigation under 5 U.S.C. §552(a)(4)(B).</div>
          </div>
        </div>
      )}
    </div>
  );
}