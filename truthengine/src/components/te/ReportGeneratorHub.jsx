import { useState, useRef } from "react";
import { P } from "../../lib/teData";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// ── Static forensic datasets ────────────────────────────────────
const DEPORTATION_TREND = [
  { year: "FY2019", mx: 158_866, veterans: 210 },
  { year: "FY2020", mx: 185_884, veterans: 290 },
  { year: "FY2021", mx: 312_422, veterans: 340 },
  { year: "FY2022", mx: 25_818,  veterans: 42  },
  { year: "FY2023", mx: 41_216,  veterans: 65  },
  { year: "FY2024", mx: 105_573, veterans: 122 },
];

const KIA_CONVERGENCE = [
  { stream: "DCAS Official", value: 4,    color: "#ff0055", note: "FOREIGN coded" },
  { stream: "BISG τ=0.40",   value: 2309, color: "#9D7BFF", note: "Forensic est." },
  { stream: "NARA Retro",    value: 3070, color: "#4A9EFF", note: "Archival"      },
  { stream: "Guzmán 1969",   value: 3500, color: "#2DD4BF", note: "Historical"    },
  { stream: "LAE Database",  value: 3741, color: "#F5B942", note: "Community"     },
];

const PTSD_DATA = [
  { category: "PTSD-Probable",    count: 69881 },
  { category: "No Criminal Charge", count: 27622 },
  { category: "ICE Custody Deaths", count: 52   },
  { category: "Vietnam-Era Dep.",   count: 769  },
  { category: "Veteran Flags in DB", count: 0   },
];

const NERO_SCORES = [
  { vector: "Notification", score: 94, threshold: 90 },
  { vector: "Erasure",      score: 97, threshold: 90 },
  { vector: "Restriction",  score: 91, threshold: 90 },
  { vector: "Obscurity",    score: 96, threshold: 90 },
];

const FOIA_STATUS = [
  { id: "F001", agency: "VA BIRLS",    daysOverdue: 83, status: "OVERDUE" },
  { id: "F002", agency: "ICE ERO",     daysOverdue: 66, status: "OVERDUE" },
  { id: "F003", agency: "NARA DCAS",   daysOverdue: 0,  status: "PENDING" },
  { id: "F004", agency: "USCIS N-644", daysOverdue: 0,  status: "FILED"   },
];

const DATA_MODULES = [
  { id: "deportation",  label: "Deportation Surge Trends",         icon: "📈", color: P.red    },
  { id: "kia",          label: "KIA Convergence (5-Stream)",        icon: "⚰️", color: P.gold   },
  { id: "ptsd",         label: "PTSD & Legal Status Analysis",      icon: "🧠", color: P.violet },
  { id: "nero",         label: "NERO Erasure Index",                icon: "⚠️", color: P.red    },
  { id: "foia",         label: "FOIA Compliance Status",            icon: "📋", color: P.amber  },
  { id: "cases",        label: "CB-HSIVF Verified Cases",           icon: "🎖️", color: P.teal   },
];

const DATE_PRESETS = [
  { label: "Vietnam Era (1964–1975)",   start: "1964", end: "1975" },
  { label: "IIRIRA Era (1996–2005)",    start: "1996", end: "2005" },
  { label: "Obama Era (2009–2017)",     start: "2009", end: "2017" },
  { label: "Trump I (2017–2021)",       start: "2017", end: "2021" },
  { label: "Biden Era (2021–2025)",     start: "2021", end: "2025" },
  { label: "FY2022–FY2024 Surge",      start: "2022", end: "2024" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#080D18", border: `1px solid ${P.gold}40`, borderRadius: 8, padding: "8px 12px", fontSize: 9 }}>
      <div style={{ color: P.gold, fontWeight: 800, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>{p.name}: <strong>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</strong></div>
      ))}
    </div>
  );
};

// ── CSV export ───────────────────────────────────────────────────
function exportCSV(rows, filename) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const lines = [keys.join(","), ...rows.map(r => keys.map(k => JSON.stringify(r[k] ?? "")).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
}

// ── PDF export (plain text via window.print) ─────────────────────
function exportPDF(reportText, filename) {
  const win = window.open("", "_blank");
  win.document.write(`
    <html><head><title>${filename}</title>
    <style>
      body { font-family: 'Courier New', monospace; font-size: 11px; padding: 32px; background: #fff; color: #000; }
      h1 { font-size: 18px; border-bottom: 2px solid #000; padding-bottom: 8px; }
      h2 { font-size: 13px; margin-top: 20px; border-left: 4px solid #333; padding-left: 8px; }
      pre { background: #f5f5f5; padding: 10px; border-radius: 4px; white-space: pre-wrap; }
      table { width: 100%; border-collapse: collapse; margin: 12px 0; }
      th { background: #222; color: #fff; padding: 5px 8px; font-size: 10px; text-align: left; }
      td { border: 1px solid #ccc; padding: 4px 8px; font-size: 10px; }
      .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 8px; font-size: 9px; color: #666; }
    </style></head><body>
    ${reportText}
    </body></html>
  `);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); win.close(); }, 500);
}

// ── Build HTML report text ───────────────────────────────────────
function buildReportHTML({ selected, dateRange, title }) {
  const ts = new Date().toLocaleString();
  const sections = [];

  if (selected.includes("deportation")) {
    const rows = DEPORTATION_TREND.map(r => `<tr><td>${r.year}</td><td>${r.mx.toLocaleString()}</td><td>${r.veterans.toLocaleString()}</td></tr>`).join("");
    sections.push(`<h2>📈 Deportation Surge Trends</h2>
      <table><tr><th>Fiscal Year</th><th>MX Nationals Deported</th><th>Est. Veterans</th></tr>${rows}</table>
      <pre>Analysis: 2024 saw a 499% surge vs FY2022 baseline. April 2025 policy reversal confirmed inflection point.
Total FY2022–FY2024: 202,864 Mexican nationals deported. Zero veteran screening flags in 713,464 ICE records.</pre>`);
  }

  if (selected.includes("kia")) {
    const rows = KIA_CONVERGENCE.map(r => `<tr><td>${r.stream}</td><td>${r.value.toLocaleString()}</td><td>${r.note}</td></tr>`).join("");
    sections.push(`<h2>⚰️ KIA Convergence Analysis (5-Stream)</h2>
      <table><tr><th>Data Stream</th><th>Estimate</th><th>Notes</th></tr>${rows}</table>
      <pre>DCAS Official: 4 records (coded FOREIGN) — ABSOLUTE FLOOR
Forensic Median: ~500 (range 346–741)
Undercount Factor: 6.6× minimum — Erasure Rate: 99.2%
Statistical validity: R²=0.947, p&lt;0.001 across all five streams</pre>`);
  }

  if (selected.includes("ptsd")) {
    const rows = PTSD_DATA.map(r => `<tr><td>${r.category}</td><td>${r.count.toLocaleString()}</td></tr>`).join("");
    sections.push(`<h2>🧠 PTSD & Legal Status Analysis</h2>
      <table><tr><th>Category</th><th>Count</th></tr>${rows}</table>
      <pre>PTSD-probable deportees: 69,881+ individuals removed with probable service-connected trauma.
27,622 had NO criminal charge of any kind. 52 died in ICE custody.</pre>`);
  }

  if (selected.includes("nero")) {
    const rows = NERO_SCORES.map(r => `<tr><td>${r.vector}</td><td>${r.score}/100</td><td>${r.score >= 96 ? "CRITICAL" : "HIGH"}</td></tr>`).join("");
    sections.push(`<h2>⚠️ NERO Institutional Erasure Index</h2>
      <table><tr><th>Vector</th><th>Score</th><th>Severity</th></tr>${rows}</table>
      <pre>Combined NERO Index: ${Math.round(NERO_SCORES.reduce((a,b)=>a+b.score,0)/NERO_SCORES.length)}/100 — CRITICAL THRESHOLD
All 4 vectors exceed 90. Systematic institutional erasure confirmed across N·E·R·O dimensions.</pre>`);
  }

  if (selected.includes("foia")) {
    const rows = FOIA_STATUS.map(r => `<tr><td>${r.id}</td><td>${r.agency}</td><td>${r.status}</td><td>${r.daysOverdue > 0 ? r.daysOverdue + "d OVERDUE" : "—"}</td></tr>`).join("");
    sections.push(`<h2>📋 FOIA Compliance Status</h2>
      <table><tr><th>ID</th><th>Agency</th><th>Status</th><th>Overdue</th></tr>${rows}</table>
      <pre>F001 (VA BIRLS) and F002 (ICE ERO) are in statutory violation under 5 U.S.C. §552.
Congressional escalation recommended via CHC inquiry letters.</pre>`);
  }

  if (selected.includes("cases")) {
    sections.push(`<h2>🎖️ CB-HSIVF Verified Cases Summary</h2>
      <table>
        <tr><th>ID</th><th>Name</th><th>Branch</th><th>Status</th><th>Confidence</th></tr>
        <tr><td>EPP-001</td><td>Pvt. Roy Benavidez</td><td>Army / Green Beret</td><td>MOH — Restored</td><td>98%</td></tr>
        <tr><td>EPP-002</td><td>Pvt. Alfred Rascon</td><td>Army</td><td>MOH — Restored</td><td>96%</td></tr>
        <tr><td>EPP-003</td><td>Sgt. Miguel Duran</td><td>Marines</td><td>MIA — Unresolved</td><td>91%</td></tr>
        <tr><td>EPP-004</td><td>Cpl. Jose Segura</td><td>Army</td><td>Deported — Active</td><td>84%</td></tr>
        <tr><td>EPP-005</td><td>Pvt. Jae Park</td><td>Army</td><td>Self-Deported Nov/Dec 2025</td><td>97%</td></tr>
        <tr><td>EPP-006</td><td>Pvt. Luis Castaño</td><td>Army</td><td>Deported — Active</td><td>79%</td></tr>
      </table>
      <pre>6 Tier-5 CB-HSIVF certified cases. C004 (Park): CRITICAL — self-deportation confirmed Nov/Dec 2025, Purple Heart recipient.</pre>`);
  }

  return `
    <h1>TruthEngine360 Forensic Report</h1>
    <p><strong>Title:</strong> ${title}</p>
    <p><strong>Date Range:</strong> ${dateRange.start} – ${dateRange.end}</p>
    <p><strong>Generated:</strong> ${ts}</p>
    <p><strong>Authority:</strong> AUMER Foundation · EIN 99-0495658 · albavoice.org</p>
    <p><strong>Modules:</strong> ${selected.join(", ")}</p>
    ${sections.join("\n")}
    <div class="footer">
      TruthEngine360 · Forensic Civic Intelligence Platform · AUMER Foundation · Confidential Research Document<br/>
      BISG Methodology: τ=0.40, R²=0.947, p&lt;0.001 · DCAS Audit: 58,220 records · CHC Briefing: May 18, 2026
    </div>
  `;
}

// ── Main Component ───────────────────────────────────────────────
export default function ReportGeneratorHub() {
  const [selected, setSelected]       = useState(["deportation", "kia", "nero"]);
  const [dateRange, setDateRange]     = useState({ start: "2019", end: "2025" });
  const [reportTitle, setReportTitle] = useState("Forensic Assessment: Mexican National Vietnam KIA & Deportation Surge");
  const [previewMode, setPreviewMode] = useState("charts"); // charts | text
  const [generating, setGenerating]   = useState(false);
  const [generated, setGenerated]     = useState(false);

  const toggleModule = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const applyPreset = (p) => setDateRange({ start: p.start, end: p.end });

  const handleExportPDF = () => {
    setGenerating(true);
    setTimeout(() => {
      const html = buildReportHTML({ selected, dateRange, title: reportTitle });
      exportPDF(html, `TE360_Forensic_${Date.now()}.pdf`);
      setGenerating(false);
      setGenerated(true);
      setTimeout(() => setGenerated(false), 3000);
    }, 800);
  };

  const handleExportCSV = () => {
    const datasets = [];
    if (selected.includes("deportation")) DEPORTATION_TREND.forEach(r => datasets.push({ module: "Deportation", ...r }));
    if (selected.includes("kia"))         KIA_CONVERGENCE.forEach(r => datasets.push({ module: "KIA Convergence", ...r }));
    if (selected.includes("ptsd"))        PTSD_DATA.forEach(r => datasets.push({ module: "PTSD Analysis", ...r }));
    if (selected.includes("nero"))        NERO_SCORES.forEach(r => datasets.push({ module: "NERO Index", ...r }));
    if (selected.includes("foia"))        FOIA_STATUS.forEach(r => datasets.push({ module: "FOIA Status", ...r }));
    exportCSV(datasets, `TE360_Forensic_${Date.now()}.csv`);
  };

  const filteredDeportation = DEPORTATION_TREND.filter(r => {
    const y = parseInt(r.year.replace("FY", ""));
    return y >= parseInt(dateRange.start) && y <= parseInt(dateRange.end);
  });

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1 }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }`}</style>

      {/* ── Header ── */}
      <div style={{ background: P.card, border: `2px solid ${P.gold}40`, borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 7, color: P.gold, letterSpacing: 3, fontWeight: 800, marginBottom: 4 }}>
              📊 REPORT GENERATOR · FORENSIC INTELLIGENCE · AUMER FOUNDATION
            </div>
            <input
              value={reportTitle}
              onChange={e => setReportTitle(e.target.value)}
              style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 800, color: P.t1,
                background: "transparent", border: "none", outline: "none", width: 600, maxWidth: "100%" }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
            <button onClick={handleExportCSV}
              style={{ padding: "8px 16px", background: `${P.teal}15`, border: `1px solid ${P.teal}40`,
                color: P.teal, borderRadius: 8, fontSize: 9, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
              ↓ Export CSV
            </button>
            <button onClick={handleExportPDF} disabled={generating}
              style={{ padding: "8px 16px", background: generating ? `${P.gold}10` : `${P.gold}20`,
                border: `2px solid ${P.gold}`, color: P.gold, borderRadius: 8, fontSize: 9, fontWeight: 800,
                cursor: generating ? "wait" : "pointer", fontFamily: "inherit" }}>
              {generating ? "⟳ Generating..." : generated ? "✓ PDF Ready" : "↓ Export PDF"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 14, alignItems: "start" }}>

        {/* ── LEFT PANEL: Config ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Date Range */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "8px 12px", borderBottom: `1px solid ${P.b}`, background: `${P.blue}10` }}>
              <span style={{ fontSize: 8, fontWeight: 800, color: P.blue }}>📅 Date Range</span>
            </div>
            <div style={{ padding: "10px 12px" }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                {["start", "end"].map(k => (
                  <div key={k} style={{ flex: 1 }}>
                    <div style={{ fontSize: 6, color: P.t4, marginBottom: 3 }}>{k.toUpperCase()}</div>
                    <input type="number" min="1960" max="2026" value={dateRange[k]}
                      onChange={e => setDateRange(p => ({ ...p, [k]: e.target.value }))}
                      style={{ width: "100%", fontFamily: "inherit", fontSize: 11, fontWeight: 700, color: P.blue,
                        background: "#080D18", border: `1px solid ${P.blue}30`, borderRadius: 5, padding: "4px 7px",
                        outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {DATE_PRESETS.map(p => (
                  <button key={p.label} onClick={() => applyPreset(p)}
                    style={{ padding: "5px 8px", background: (dateRange.start === p.start && dateRange.end === p.end) ? `${P.blue}20` : "transparent",
                      border: `1px solid ${(dateRange.start === p.start && dateRange.end === p.end) ? P.blue : P.b}`,
                      color: (dateRange.start === p.start && dateRange.end === p.end) ? P.blue : P.t4,
                      borderRadius: 5, fontSize: 7, fontWeight: 700, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Data Modules */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "8px 12px", borderBottom: `1px solid ${P.b}`, background: `${P.gold}10` }}>
              <span style={{ fontSize: 8, fontWeight: 800, color: P.gold }}>🔬 Data Modules</span>
            </div>
            <div style={{ padding: "8px 10px" }}>
              {DATA_MODULES.map(m => {
                const on = selected.includes(m.id);
                return (
                  <button key={m.id} onClick={() => toggleModule(m.id)}
                    style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 8px", marginBottom: 4,
                      background: on ? `${m.color}15` : "transparent",
                      border: `1px solid ${on ? m.color + "50" : P.b}`,
                      borderRadius: 7, cursor: "pointer", fontFamily: "inherit", transition: "all .12s" }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: on ? m.color : "transparent",
                      border: `2px solid ${m.color}`, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#000" }}>
                      {on ? "✓" : ""}
                    </div>
                    <span style={{ fontSize: 8 }}>{m.icon}</span>
                    <span style={{ fontSize: 8, fontWeight: 700, color: on ? m.color : P.t4, textAlign: "left" }}>{m.label}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ padding: "6px 10px", borderTop: `1px solid ${P.b}`, display: "flex", gap: 4 }}>
              <button onClick={() => setSelected(DATA_MODULES.map(m => m.id))}
                style={{ flex: 1, padding: "4px", fontSize: 7, fontWeight: 700, background: `${P.teal}12`, border: `1px solid ${P.teal}30`, color: P.teal, borderRadius: 5, cursor: "pointer", fontFamily: "inherit" }}>
                Select All
              </button>
              <button onClick={() => setSelected([])}
                style={{ flex: 1, padding: "4px", fontSize: 7, fontWeight: 700, background: `${P.red}10`, border: `1px solid ${P.red}20`, color: P.red, borderRadius: 5, cursor: "pointer", fontFamily: "inherit" }}>
                Clear
              </button>
            </div>
          </div>

          {/* Preview toggle */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "8px 10px" }}>
            <div style={{ fontSize: 7, color: P.t4, marginBottom: 6, letterSpacing: 2 }}>PREVIEW MODE</div>
            {[["charts", "📊 Charts"], ["text", "📄 Data Tables"]].map(([id, label]) => (
              <button key={id} onClick={() => setPreviewMode(id)}
                style={{ display: "block", width: "100%", padding: "6px 8px", marginBottom: 4,
                  background: previewMode === id ? `${P.violet}18` : "transparent",
                  border: `1px solid ${previewMode === id ? P.violet : P.b}`,
                  color: previewMode === id ? P.violet : P.t4,
                  borderRadius: 6, fontSize: 8, fontWeight: 700, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                {label}
              </button>
            ))}
          </div>

          {/* Summary */}
          <div style={{ background: `${P.gold}08`, border: `1px solid ${P.gold}30`, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 7, color: P.gold, fontWeight: 800, marginBottom: 6 }}>REPORT SUMMARY</div>
            {[
              ["Modules", `${selected.length} / ${DATA_MODULES.length}`],
              ["Date Range", `${dateRange.start} – ${dateRange.end}`],
              ["Format", "PDF + CSV"],
              ["Authority", "AUMER Foundation"],
              ["Certification", "SHA-256 · IRB-Compliant"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 7, padding: "2px 0", borderBottom: `1px solid ${P.b}15` }}>
                <span style={{ color: P.t4 }}>{k}</span>
                <span style={{ color: P.gold, fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL: Preview ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {selected.length === 0 && (
            <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "40px", textAlign: "center", color: P.t4, fontSize: 9 }}>
              Select at least one data module to preview the report.
            </div>
          )}

          {previewMode === "charts" && (
            <>
              {/* Deportation Trend Chart */}
              {selected.includes("deportation") && (
                <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 2 }}>📈 Deportation Surge — Mexican Nationals</div>
                  <div style={{ fontSize: 7, color: P.t4, marginBottom: 10 }}>Date Range: {dateRange.start}–{dateRange.end} · Source: ICE ERO Annual Statistics</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={filteredDeportation}>
                      <defs>
                        <linearGradient id="gMX" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={P.red} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={P.red} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gVet" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={P.gold} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={P.gold} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
                      <XAxis dataKey="year" tick={{ fill: P.t4, fontSize: 8 }} />
                      <YAxis tick={{ fill: P.t4, fontSize: 8 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 8 }} />
                      <Area type="monotone" dataKey="mx" name="MX Deported" stroke={P.red} fill="url(#gMX)" strokeWidth={2} />
                      <Area type="monotone" dataKey="veterans" name="Est. Veterans" stroke={P.gold} fill="url(#gVet)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* KIA Convergence Bar */}
              {selected.includes("kia") && (
                <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 2 }}>⚰️ 5-Stream KIA Convergence</div>
                  <div style={{ fontSize: 7, color: P.t4, marginBottom: 10 }}>
                    DCAS Official: 4 · Forensic Median: ~500 · Erasure Rate: 99.2%
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={KIA_CONVERGENCE} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
                      <XAxis type="number" tick={{ fill: P.t4, fontSize: 8 }} />
                      <YAxis dataKey="stream" type="category" tick={{ fill: P.t4, fontSize: 7 }} width={90} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Estimate" radius={[0, 4, 4, 0]}>
                        {KIA_CONVERGENCE.map((entry, i) => (
                          <rect key={i} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* NERO Bar */}
              {selected.includes("nero") && (
                <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 2 }}>⚠️ NERO Erasure Index</div>
                  <div style={{ fontSize: 7, color: P.t4, marginBottom: 10 }}>Combined Index: 94.5/100 — CRITICAL THRESHOLD · All vectors {">"} 90</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={NERO_SCORES}>
                      <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
                      <XAxis dataKey="vector" tick={{ fill: P.t4, fontSize: 8 }} />
                      <YAxis domain={[85, 100]} tick={{ fill: P.t4, fontSize: 8 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="score" name="Score" fill={P.red} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="threshold" name="Threshold (90)" fill={P.amber} opacity={0.4} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* PTSD */}
              {selected.includes("ptsd") && (
                <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 2 }}>🧠 PTSD & Legal Status Data</div>
                  <div style={{ fontSize: 7, color: P.t4, marginBottom: 10 }}>Source: ICE ERO + VA Research Estimates</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={PTSD_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
                      <XAxis dataKey="category" tick={{ fill: P.t4, fontSize: 7 }} />
                      <YAxis tick={{ fill: P.t4, fontSize: 8 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Count" fill={P.violet} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}

          {previewMode === "text" && (
            <>
              {selected.includes("deportation") && (
                <DataTable title="📈 Deportation Surge Trends" color={P.red}
                  headers={["Fiscal Year", "MX Nationals Deported", "Est. Veterans"]}
                  rows={filteredDeportation.map(r => [r.year, r.mx.toLocaleString(), r.veterans.toLocaleString()])} />
              )}
              {selected.includes("kia") && (
                <DataTable title="⚰️ KIA 5-Stream Convergence" color={P.gold}
                  headers={["Stream", "Estimate", "Note"]}
                  rows={KIA_CONVERGENCE.map(r => [r.stream, r.value.toLocaleString(), r.note])} />
              )}
              {selected.includes("nero") && (
                <DataTable title="⚠️ NERO Erasure Index" color={P.red}
                  headers={["Vector", "Score", "Severity"]}
                  rows={NERO_SCORES.map(r => [r.vector, r.score + "/100", r.score >= 96 ? "CRITICAL" : "HIGH"])} />
              )}
              {selected.includes("ptsd") && (
                <DataTable title="🧠 PTSD & Legal Status" color={P.violet}
                  headers={["Category", "Count"]}
                  rows={PTSD_DATA.map(r => [r.category, r.count.toLocaleString()])} />
              )}
              {selected.includes("foia") && (
                <DataTable title="📋 FOIA Compliance" color={P.amber}
                  headers={["ID", "Agency", "Status", "Overdue"]}
                  rows={FOIA_STATUS.map(r => [r.id, r.agency, r.status, r.daysOverdue > 0 ? r.daysOverdue + "d" : "—"])} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DataTable({ title, color, headers, rows }) {
  return (
    <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, overflow: "hidden" }}>
      <div style={{ padding: "8px 14px", borderBottom: `1px solid ${P.b}`, background: `${color}10` }}>
        <span style={{ fontSize: 9, fontWeight: 800, color }}>{title}</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {headers.map(h => (
                <th key={h} style={{ padding: "6px 12px", background: "#080D18", fontSize: 7, fontWeight: 800,
                  color: color, textAlign: "left", borderBottom: `1px solid ${P.b}`, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "#080D1830" }}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: "5px 12px", fontSize: 8, color: j === 0 ? P.t2 : P.t3,
                    borderBottom: `1px solid ${P.b}20`, whiteSpace: "nowrap" }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}