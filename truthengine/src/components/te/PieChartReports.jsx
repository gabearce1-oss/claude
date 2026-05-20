import { useState } from "react";
import { P, KEY_STATS } from "../../lib/teData";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from "recharts";

const COLORS = [P.red, P.gold, P.teal, P.violet, P.blue, P.amber, P.cyan, "#F97316", "#EC4899"];

const DATASETS = {
  deportation_breakdown: {
    label: "Deportations by Era (FY2022–2026)",
    type: "pie",
    data: [
      { name: "Biden Era (2022–2024)", value: 72235, pct: "35.6%" },
      { name: "Trump II (2025–2026)", value: 130656, pct: "64.4%" },
    ],
  },
  ptsd_crime_categories: {
    label: "PTSD-Correlated Crime Categories",
    type: "pie",
    data: [
      { name: "Self-Medication (Drug/DUI)", value: 38200, pct: "45.2%" },
      { name: "Hypervigilance/Assault", value: 19400, pct: "23.0%" },
      { name: "Freeze/Fight Response", value: 8900, pct: "10.5%" },
      { name: "Survival Crime (Theft)", value: 6200, pct: "7.4%" },
      { name: "No Crime – Immigration Only", value: 11800, pct: "14.0%" },
    ],
  },
  cohort_breakdown: {
    label: "Veteran-Era Cohorts in ICE Database",
    type: "pie",
    data: [
      { name: "Korean War (1930–1937)", value: 10, pct: "0.004%" },
      { name: "Vietnam Era (1938–1956)", value: 970, pct: "0.5%" },
      { name: "Gulf War (1957–1978)", value: 49439, pct: "23.3%" },
      { name: "Iraq/Afghanistan (1979–1998)", value: 161679, pct: "76.2%" },
    ],
  },
  dcas_comparison: {
    label: "DCAS Hispanic Casualty Estimates (5-Stream Convergence)",
    type: "bar",
    data: [
      { name: "DCAS Official", value: 349, color: P.red },
      { name: "BISG τ=0.40", value: 2309, color: P.violet },
      { name: "NARA Revised", value: 3070, color: P.blue },
      { name: "Guzmán 1969", value: 3500, color: P.teal },
      { name: "LAE Database", value: 3741, color: P.gold },
    ],
  },
  ptsd_by_year: {
    label: "PTSD-Probable Deportations by Year",
    type: "line",
    data: [
      { year: "2022", value: 3859 },
      { year: "2023", value: 22032 },
      { year: "2024", value: 23527 },
      { year: "2025", value: 42836 },
      { year: "2026 (Q1)", value: 8293 },
    ],
  },
  nero_scores: {
    label: "NERO Institutional Erasure Scores",
    type: "bar",
    data: [
      { name: "Notification (N)", value: 94, color: P.red },
      { name: "Erasure (E)", value: 97, color: P.red },
      { name: "Restriction (R)", value: 91, color: P.amber },
      { name: "Obscurity (O)", value: 96, color: P.red },
    ],
  },
  moh_breakdown: {
    label: "Pentagon Valor Review — MOH Upgrades (2014)",
    type: "pie",
    data: [
      { name: "Hispanic Service Members", value: 17, pct: "70.8%" },
      { name: "Other Recipients", value: 7, pct: "29.2%" },
    ],
  },
  ice_regions: {
    label: "ICE Enforcement by Region",
    type: "bar",
    data: [
      { name: "Rio Grande Valley", value: 2100, color: P.red },
      { name: "San Diego", value: 1850, color: P.amber },
      { name: "El Paso", value: 1650, color: P.gold },
    ],
  },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: P.card, border: `1px solid ${P.gold}40`, borderRadius: 8, padding: "10px 14px", fontFamily: "'IBM Plex Mono',monospace", fontSize: 8 }}>
        <div style={{ color: P.gold, fontWeight: 800, marginBottom: 4 }}>{label || payload[0].name}</div>
        <div style={{ color: P.t1 }}>Value: <strong>{payload[0].value?.toLocaleString()}</strong></div>
        {payload[0].payload?.pct && <div style={{ color: P.t4 }}>Share: {payload[0].payload.pct}</div>}
      </div>
    );
  }
  return null;
};

const CustomPieTip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: P.card, border: `1px solid ${P.gold}40`, borderRadius: 8, padding: "10px 14px", fontFamily: "'IBM Plex Mono',monospace", fontSize: 8 }}>
        <div style={{ color: P.gold, fontWeight: 800, marginBottom: 3 }}>{payload[0].name}</div>
        <div style={{ color: P.t1 }}>Count: <strong>{payload[0].value?.toLocaleString()}</strong></div>
        {payload[0].payload?.pct && <div style={{ color: P.t4 }}>Share: {payload[0].payload.pct}</div>}
      </div>
    );
  }
  return null;
};

function PieView({ dataset }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={dataset.data}
          cx="50%"
          cy="50%"
          outerRadius={120}
          innerRadius={50}
          dataKey="value"
          paddingAngle={3}
          label={({ name, pct }) => `${pct || ""}`}
          labelLine={false}
        >
          {dataset.data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomPieTip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: P.t3 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function BarView({ dataset }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={dataset.data} margin={{ top: 10, right: 20, left: -10, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
        <XAxis dataKey="name" tick={{ fontSize: 7, fill: P.t4 }} angle={-20} textAnchor="end" />
        <YAxis tick={{ fontSize: 7, fill: P.t4 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {dataset.data.map((d, i) => (
            <Cell key={i} fill={d.color || COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function LineView({ dataset }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={dataset.data} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
        <XAxis dataKey="year" tick={{ fontSize: 8, fill: P.t4 }} />
        <YAxis tick={{ fontSize: 8, fill: P.t4 }} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="value" stroke={P.red} strokeWidth={3} dot={{ fill: P.red, r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function PieChartReports() {
  const [active, setActive] = useState("ptsd_crime_categories");
  const ds = DATASETS[active];

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1, padding: "14px 20px", overflowY: "auto", height: "calc(100vh - 118px)" }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          📊 Interactive <span style={{ color: P.gold }}>Reporting Charts</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginTop: 2 }}>
          SELECT DATASET · PIE · BAR · LINE · FORENSIC DATA VISUALIZATIONS
        </div>
      </div>

      {/* Dataset Selector */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {Object.entries(DATASETS).map(([key, d]) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            style={{
              padding: "6px 10px",
              fontSize: 7,
              fontWeight: active === key ? 800 : 400,
              cursor: "pointer",
              background: active === key ? `${P.gold}20` : P.card,
              border: `1px solid ${active === key ? P.gold : P.b}`,
              color: active === key ? P.gold : P.t4,
              borderRadius: 6,
              whiteSpace: "nowrap",
            }}
          >
            {d.type === "pie" ? "🥧" : d.type === "bar" ? "📊" : "📈"} {d.label.split("–")[0].trim().slice(0, 28)}
          </button>
        ))}
      </div>

      {/* Main chart card */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 4 }}>{ds.label}</div>
          <div style={{ fontSize: 7, color: P.t4, marginBottom: 14 }}>
            {ds.type === "pie" ? "Donut pie chart" : ds.type === "bar" ? "Bar chart" : "Line chart"} · {ds.data.length} data points · AUMER Foundation
          </div>
          {ds.type === "pie" && <PieView dataset={ds} />}
          {ds.type === "bar" && <BarView dataset={ds} />}
          {ds.type === "line" && <LineView dataset={ds} />}
        </div>

        {/* Data table sidebar */}
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "16px 14px" }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 10 }}>Data Table</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ds.data.map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", background: "#080D18", borderLeft: `3px solid ${COLORS[i % COLORS.length]}`, borderRadius: 5 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 7, color: P.t3, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {row.name}
                  </div>
                  {row.pct && <div style={{ fontSize: 6, color: P.t4 }}>{row.pct}</div>}
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 800, color: COLORS[i % COLORS.length], marginLeft: 8, flexShrink: 0 }}>
                  {row.value?.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Stats summary */}
          <div style={{ marginTop: 12, padding: "8px 10px", background: "#080D18", borderRadius: 7 }}>
            <div style={{ fontSize: 6, color: P.t4, marginBottom: 6 }}>SUMMARY</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7 }}>
              <span style={{ color: P.t4 }}>Total</span>
              <span style={{ color: P.gold, fontWeight: 800 }}>
                {ds.data.reduce((a, b) => a + b.value, 0).toLocaleString()}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, marginTop: 3 }}>
              <span style={{ color: P.t4 }}>Max</span>
              <span style={{ color: P.teal, fontWeight: 800 }}>
                {Math.max(...ds.data.map(d => d.value)).toLocaleString()}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, marginTop: 3 }}>
              <span style={{ color: P.t4 }}>Series</span>
              <span style={{ color: P.blue, fontWeight: 800 }}>{ds.data.length} points</span>
            </div>
          </div>
        </div>
      </div>

      {/* All charts mini grid */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 10 }}>All Reports Overview</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
          {Object.entries(DATASETS).map(([key, d]) => (
            <div
              key={key}
              onClick={() => setActive(key)}
              style={{
                background: P.card,
                border: `1px solid ${active === key ? P.gold : P.b}30`,
                borderRadius: 8,
                padding: "10px 12px",
                cursor: "pointer",
                transition: "all .12s",
              }}
            >
              <div style={{ fontSize: 8, fontWeight: 700, color: active === key ? P.gold : P.t2, marginBottom: 4 }}>
                {d.type === "pie" ? "🥧" : d.type === "bar" ? "📊" : "📈"} {d.label.slice(0, 32)}
              </div>
              <div style={{ fontSize: 6, color: P.t4 }}>{d.data.length} series · {d.type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}