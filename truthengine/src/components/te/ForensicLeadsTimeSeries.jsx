import { useState, useMemo } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";
import jsPDF from "jspdf";
import { P } from "../../lib/teData";

// Time-series data: records by date, document type, and status
const TIME_SERIES_DATA = [
  { date: "2023-01", dcas: 12, va: 8, military: 5, dod: 3, court: 2, active: 15, veteran: 8, deceased: 7 },
  { date: "2023-02", dcas: 14, va: 9, military: 6, dod: 4, court: 3, active: 16, veteran: 11, deceased: 8 },
  { date: "2023-03", dcas: 18, va: 12, military: 8, dod: 5, court: 4, active: 20, veteran: 15, deceased: 12 },
  { date: "2023-04", dcas: 22, va: 15, military: 11, dod: 7, court: 6, active: 28, veteran: 19, deceased: 14 },
  { date: "2023-05", dcas: 28, va: 19, military: 14, dod: 9, court: 8, active: 35, veteran: 25, deceased: 18 },
  { date: "2023-06", dcas: 31, va: 22, military: 17, dod: 11, court: 10, active: 42, veteran: 32, deceased: 17 },
  { date: "2023-07", dcas: 35, va: 25, military: 20, dod: 13, court: 12, active: 48, veteran: 38, deceased: 19 },
  { date: "2023-08", dcas: 32, va: 24, military: 18, dod: 12, court: 11, active: 44, veteran: 35, deceased: 18 },
  { date: "2023-09", dcas: 29, va: 21, military: 16, dod: 10, court: 9, active: 38, veteran: 30, deceased: 16 },
  { date: "2023-10", dcas: 45, va: 32, military: 28, dod: 18, court: 15, active: 65, veteran: 52, deceased: 21 },
  { date: "2023-11", dcas: 38, va: 27, military: 23, dod: 15, court: 12, active: 55, veteran: 42, deceased: 18 },
  { date: "2023-12", dcas: 42, va: 30, military: 26, dod: 17, court: 14, active: 60, veteran: 48, deceased: 21 },
  { date: "2024-01", dcas: 48, va: 35, military: 30, dod: 20, court: 18, active: 70, veteran: 58, deceased: 23 },
  { date: "2024-02", dcas: 52, va: 38, military: 33, dod: 22, court: 20, active: 78, veteran: 65, deceased: 22 },
];

// Document types and statuses
const DOC_TYPES = [
  { id: "dcas", label: "DCAS Records", color: P.red },
  { id: "va", label: "VA Documents", color: P.blue },
  { id: "military", label: "Military Records", color: P.gold },
  { id: "dod", label: "DoD Casualty", color: P.violet },
  { id: "court", label: "Court Orders", color: P.teal },
];

const STATUSES = [
  { id: "active", label: "Active Service", color: P.gold },
  { id: "veteran", label: "Veteran", color: P.teal },
  { id: "deceased", label: "Deceased", color: P.red },
];

// Detect spikes: records significantly above rolling average
function detectSpikes(data, field, threshold = 1.5) {
  const spikes = [];
  for (let i = 0; i < data.length; i++) {
    const windowStart = Math.max(0, i - 2);
    const windowEnd = Math.min(data.length - 1, i + 2);
    const windowData = data.slice(windowStart, windowEnd + 1);
    const avg = windowData.reduce((sum, d) => sum + (d[field] || 0), 0) / windowData.length;
    if ((data[i][field] || 0) > avg * threshold) {
      spikes.push(data[i].date);
    }
  }
  return spikes;
}

export default function ForensicLeadsTimeSeries() {
  const [viewMode, setViewMode] = useState("area"); // area, line, bar, composed
  const [selectedDocTypes, setSelectedDocTypes] = useState(["dcas", "va", "military"]);
  const [selectedStatuses, setSelectedStatuses] = useState(["active", "veteran"]);
  const [showSpikes, setShowSpikes] = useState(true);

  // Process data based on selections
  const processedData = useMemo(() => {
    return TIME_SERIES_DATA.map(entry => {
      const newEntry = { date: entry.date };
      selectedDocTypes.forEach(type => {
        newEntry[type] = entry[type];
      });
      selectedStatuses.forEach(status => {
        newEntry[status] = entry[status];
      });
      return newEntry;
    });
  }, [selectedDocTypes, selectedStatuses]);

  // Detect spikes for total records
  const spikes = useMemo(() => {
    const totals = processedData.map(d => ({
      date: d.date,
      total: Object.keys(d).filter(k => k !== "date").reduce((sum, key) => sum + (d[key] || 0), 0),
    }));
    return detectSpikes(totals, "total");
  }, [processedData]);

  const toggleDocType = (id) => {
    setSelectedDocTypes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const toggleStatus = (id) => {
    setSelectedStatuses(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Date", ...selectedDocTypes.map(t => DOC_TYPES.find(d => d.id === t)?.label || t), ...selectedStatuses.map(s => STATUSES.find(st => st.id === s)?.label || s)];
    const rows = processedData.map(entry => [
      entry.date,
      ...selectedDocTypes.map(t => entry[t] || 0),
      ...selectedStatuses.map(s => entry[s] || 0),
    ]);

    const metadata = [
      ["Forensic Leads Time Series Export"],
      ["Generated", new Date().toISOString()],
      ["Total Records", totalRecords],
      ["Average Records/Month", avgRecords],
      ["Spikes Detected", spikes.length],
      ["Source Links"],
      ["DCAS Audit", "https://aad.archives.gov/aad/"],
      ["VA Records", "https://www.va.gov/records/"],
      ["Military Records", "https://www.archives.gov/veterans/military-service-records"],
      ["DoD Casualty", "https://www.archives.gov/research/military/dcas"],
      [],
    ];

    const csvContent = [
      ...metadata.map(row => row.map(cell => `"${cell}"`).join(",")),
      headers.map(h => `"${h}"`).join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forensic-leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 15;

    // Title
    doc.setFontSize(16);
    doc.setTextColor(245, 200, 66);
    doc.text("Forensic Leads Time Series Report", 15, yPos);

    // Metadata
    yPos += 10;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toISOString()}`, 15, yPos);
    yPos += 6;
    doc.text(`Total Records: ${totalRecords} | Avg/Month: ${avgRecords} | Spikes: ${spikes.length}`, 15, yPos);
    yPos += 6;
    doc.text(`Doc Types: ${selectedDocTypes.length} | Statuses: ${selectedStatuses.length}`, 15, yPos);

    // Source Links
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text("Source Links:", 15, yPos);
    yPos += 5;
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 255);
    const sources = [
      ["DCAS Audit", "https://aad.archives.gov/aad/"],
      ["VA Records", "https://www.va.gov/records/"],
      ["Military Records", "https://www.archives.gov/veterans/military-service-records"],
      ["DoD Casualty", "https://www.archives.gov/research/military/dcas"],
    ];
    sources.forEach(([label, url]) => {
      doc.textWithLink(`${label}: ${url}`, 15, yPos, { pageNumber: 1 });
      yPos += 4;
    });

    // Data Table
    yPos += 6;
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text("Data Summary:", 15, yPos);
    yPos += 6;

    // Create table with headers
    const tableData = [
      ["Date", ...selectedDocTypes.map(t => DOC_TYPES.find(d => d.id === t)?.label || t), ...selectedStatuses.map(s => STATUSES.find(st => st.id === s)?.label || s)],
      ...processedData.map(entry => [
        entry.date,
        ...selectedDocTypes.map(t => entry[t] || 0),
        ...selectedStatuses.map(s => entry[s] || 0),
      ]),
    ];

    doc.autoTable({
      head: [tableData[0]],
      body: tableData.slice(1),
      startY: yPos,
      margin: 15,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [50, 50, 50], textColor: [245, 200, 66] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`forensic-leads-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const totalRecords = processedData.reduce((sum, d) => {
    return sum + Object.keys(d).filter(k => k !== "date").reduce((s, key) => s + (d[key] || 0), 0);
  }, 0);

  const avgRecords = Math.round(totalRecords / processedData.length);

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P.t1 }}>
          📈 Forensic Leads <span style={{ color: P.gold }}>Time Series</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          RECORDS OVER TIME · DOCUMENT TYPE + STATUS FILTERS · SPIKE DETECTION
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8, marginBottom: 12 }}>
        {[
          { label: "Total Records", value: totalRecords, color: P.blue },
          { label: "Avg per Month", value: avgRecords, color: P.gold },
          { label: "Spikes Detected", value: spikes.length, color: spikes.length > 0 ? P.red : P.teal },
          { label: "Date Range", value: `${processedData[0].date} to ${processedData[processedData.length - 1].date}`, color: P.violet, big: true },
        ].map((stat, i) => (
          <div key={i} style={{
            background: P.card,
            border: `1px solid ${stat.color}25`,
            borderLeft: `4px solid ${stat.color}`,
            borderRadius: 8,
            padding: "8px 12px",
          }}>
            <div style={{ fontSize: 6, color: P.t4, marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: stat.big ? 9 : 16, fontWeight: 800, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
        {/* View Mode */}
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 8 }}>VIEW MODE</div>
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { id: "area", label: "Area", icon: "📊" },
              { id: "line", label: "Line", icon: "📈" },
              { id: "bar", label: "Bar", icon: "📑" },
              { id: "composed", label: "Combo", icon: "🔀" },
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  background: viewMode === mode.id ? `${P.gold}20` : "transparent",
                  border: `1px solid ${viewMode === mode.id ? P.gold : P.b}`,
                  color: viewMode === mode.id ? P.gold : P.t4,
                  fontSize: 7,
                  fontWeight: viewMode === mode.id ? 700 : 400,
                  cursor: "pointer",
                  borderRadius: 6,
                }}
              >
                {mode.icon} {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Spike Detection Toggle */}
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 8 }}>OPTIONS</div>
          <button
            onClick={() => setShowSpikes(!showSpikes)}
            style={{
              width: "100%",
              padding: "8px",
              background: showSpikes ? `${P.red}20` : `${P.t4}05`,
              border: `1px solid ${showSpikes ? P.red : P.b}`,
              color: showSpikes ? P.red : P.t4,
              fontSize: 7,
              fontWeight: 700,
              cursor: "pointer",
              borderRadius: 6,
            }}
          >
            {showSpikes ? "⚡ Spike Detection ON" : "○ Spike Detection OFF"}
          </button>
        </div>

        {/* Export Options */}
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 8 }}>EXPORT</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button onClick={exportToCSV} style={{ padding: "6px", background: `${P.blue}15`, border: `1px solid ${P.blue}25`, color: P.blue, fontSize: 7, fontWeight: 700, borderRadius: 6, cursor: "pointer" }}>📊 Export CSV</button>
            <button onClick={exportToPDF} style={{ padding: "6px", background: `${P.red}15`, border: `1px solid ${P.red}25`, color: P.red, fontSize: 7, fontWeight: 700, borderRadius: 6, cursor: "pointer" }}>📄 Export PDF</button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        {/* Document Types */}
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 8 }}>DOCUMENT TYPES</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {DOC_TYPES.map(docType => (
              <button
                key={docType.id}
                onClick={() => toggleDocType(docType.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  background: selectedDocTypes.includes(docType.id) ? `${docType.color}15` : "transparent",
                  border: `1px solid ${selectedDocTypes.includes(docType.id) ? docType.color : P.b}`,
                  color: selectedDocTypes.includes(docType.id) ? docType.color : P.t4,
                  fontSize: 7,
                  fontWeight: selectedDocTypes.includes(docType.id) ? 700 : 400,
                  cursor: "pointer",
                  borderRadius: 6,
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 8, width: 12, textAlign: "center" }}>
                  {selectedDocTypes.includes(docType.id) ? "✓" : "○"}
                </span>
                {docType.label}
              </button>
            ))}
          </div>
        </div>

        {/* Service Member Status */}
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 8 }}>SERVICE MEMBER STATUS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {STATUSES.map(status => (
              <button
                key={status.id}
                onClick={() => toggleStatus(status.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  background: selectedStatuses.includes(status.id) ? `${status.color}15` : "transparent",
                  border: `1px solid ${selectedStatuses.includes(status.id) ? status.color : P.b}`,
                  color: selectedStatuses.includes(status.id) ? status.color : P.t4,
                  fontSize: 7,
                  fontWeight: selectedStatuses.includes(status.id) ? 700 : 400,
                  cursor: "pointer",
                  borderRadius: 6,
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 8, width: 12, textAlign: "center" }}>
                  {selectedStatuses.includes(status.id) ? "✓" : "○"}
                </span>
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14, marginBottom: 14 }}>
        <ResponsiveContainer width="100%" height={320}>
          {viewMode === "area" && (
            <AreaChart data={processedData}>
              <defs>
                {[...DOC_TYPES, ...STATUSES].map(item => (
                  <linearGradient key={item.id} id={`color-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={item.color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={item.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
              <XAxis dataKey="date" stroke={P.t4} style={{ fontSize: 11 }} />
              <YAxis stroke={P.t4} style={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 6 }}
                labelStyle={{ color: P.t1 }}
              />
              <Legend />
              {selectedDocTypes.map(type => {
                const doc = DOC_TYPES.find(d => d.id === type);
                return (
                  <Area
                    key={type}
                    type="monotone"
                    dataKey={type}
                    name={doc.label}
                    stroke={doc.color}
                    fillOpacity={1}
                    fill={`url(#color-${type})`}
                  />
                );
              })}
              {selectedStatuses.map(status => {
                const stat = STATUSES.find(s => s.id === status);
                return (
                  <Area
                    key={status}
                    type="monotone"
                    dataKey={status}
                    name={stat.label}
                    stroke={stat.color}
                    fillOpacity={0.3}
                    fill={`url(#color-${status})`}
                  />
                );
              })}
            </AreaChart>
          )}
          {viewMode === "line" && (
            <LineChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
              <XAxis dataKey="date" stroke={P.t4} style={{ fontSize: 11 }} />
              <YAxis stroke={P.t4} style={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 6 }}
                labelStyle={{ color: P.t1 }}
              />
              <Legend />
              {selectedDocTypes.map(type => {
                const doc = DOC_TYPES.find(d => d.id === type);
                return (
                  <Line
                    key={type}
                    type="monotone"
                    dataKey={type}
                    name={doc.label}
                    stroke={doc.color}
                    strokeWidth={2}
                    dot={false}
                  />
                );
              })}
              {selectedStatuses.map(status => {
                const stat = STATUSES.find(s => s.id === status);
                return (
                  <Line
                    key={status}
                    type="monotone"
                    dataKey={status}
                    name={stat.label}
                    stroke={stat.color}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                );
              })}
            </LineChart>
          )}
          {viewMode === "bar" && (
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
              <XAxis dataKey="date" stroke={P.t4} style={{ fontSize: 11 }} />
              <YAxis stroke={P.t4} style={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 6 }}
                labelStyle={{ color: P.t1 }}
              />
              <Legend />
              {selectedDocTypes.map(type => {
                const doc = DOC_TYPES.find(d => d.id === type);
                return <Bar key={type} dataKey={type} name={doc.label} fill={doc.color} />;
              })}
            </BarChart>
          )}
          {viewMode === "composed" && (
            <ComposedChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
              <XAxis dataKey="date" stroke={P.t4} style={{ fontSize: 11 }} />
              <YAxis stroke={P.t4} style={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 6 }}
                labelStyle={{ color: P.t1 }}
              />
              <Legend />
              {selectedDocTypes.slice(0, 2).map(type => {
                const doc = DOC_TYPES.find(d => d.id === type);
                return <Bar key={type} dataKey={type} name={doc.label} fill={doc.color} />;
              })}
              {selectedStatuses.slice(0, 1).map(status => {
                const stat = STATUSES.find(s => s.id === status);
                return (
                  <Line
                    key={status}
                    type="monotone"
                    dataKey={status}
                    name={stat.label}
                    stroke={stat.color}
                    strokeWidth={2}
                    yAxisId="right"
                  />
                );
              })}
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Spikes Alert */}
      {showSpikes && spikes.length > 0 && (
        <div style={{ background: `${P.red}10`, border: `1px solid ${P.red}30`, borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
          <div style={{ fontSize: 8, fontWeight: 800, color: P.red, marginBottom: 8 }}>⚡ DETECTED SPIKES</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {spikes.map((date, i) => (
              <div key={i} style={{ fontSize: 7, background: `${P.red}15`, border: `1px solid ${P.red}25`, color: P.red, borderRadius: 6, padding: "4px 10px", fontWeight: 700 }}>
                {date}
              </div>
            ))}
          </div>
          </div>
          )}

          {/* Source References */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 8 }}>📌 SOURCE REFERENCES</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {[
           { label: "DCAS Audit", url: "https://aad.archives.gov/aad/" },
           { label: "VA Records", url: "https://www.va.gov/records/" },
           { label: "Military Records", url: "https://www.archives.gov/veterans/military-service-records" },
           { label: "DoD Casualty", url: "https://www.archives.gov/research/military/dcas" },
          ].map((source, i) => (
           <a key={i} href={source.url} target="_blank" rel="noreferrer" style={{ fontSize: 7, color: P.blue, textDecoration: "none", padding: "6px 10px", background: `${P.blue}10`, border: `1px solid ${P.blue}20`, borderRadius: 6, textAlign: "center", fontWeight: 700 }}>
             🔗 {source.label}
           </a>
          ))}
          </div>
          </div>
          </div>
          );
          }