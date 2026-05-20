import { useState } from "react";
import { P, CASES } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

const EVIDENCE_SOURCES = [
  {
    category: "Cases",
    icon: "🎖️",
    color: P.gold,
    items: CASES.map(c => ({
      id: `case_${c.id}`,
      title: `${c.id}: ${c.name}`,
      source: c.branch,
      status: c.status,
      checked: false,
      notes: "",
    })),
  },
  {
    category: "FOIA Requests",
    icon: "📋",
    color: P.red,
    items: [
      { id: "foia_1", title: "F001 — VA BIRLS Records", source: "Department of Veterans Affairs", status: "OVERDUE (83d)", checked: false, notes: "" },
      { id: "foia_2", title: "F002 — ICE ENFORCE Database", source: "DHS/ICE", status: "OVERDUE (66d)", checked: false, notes: "" },
      { id: "foia_3", title: "F003 — COMAR/Deportee Data", source: "Mexico SEGOB", status: "Pending", checked: false, notes: "" },
    ],
  },
  {
    category: "Research Documents",
    icon: "📚",
    color: P.violet,
    items: [
      { id: "research_1", title: "Invisible Valor Manuscript", source: "AUMER Foundation", status: "99/100 relevance", checked: false, notes: "" },
      { id: "research_2", title: "Armed Forces & Society (2024)", source: "Simon et al., U of Utah", status: "Published", checked: false, notes: "" },
      { id: "research_3", title: "DCAS Forensic Audit Report", source: "AUMER Foundation", status: "R²=0.947", checked: false, notes: "" },
    ],
  },
  {
    category: "Institutional Data",
    icon: "📊",
    color: P.teal,
    items: [
      { id: "data_1", title: "DCAS Vietnam Extract (58,220 records)", source: "Defense Casualty Analysis System", status: "Forensic audit", checked: false, notes: "" },
      { id: "data_2", title: "NERO Institutional Scores", source: "AUMER Framework", status: "4 vectors", checked: false, notes: "" },
      { id: "data_3", title: "BISG Hispanic Estimation (τ=0.40)", source: "Demographic Analysis", status: "2,309 estimates", checked: false, notes: "" },
    ],
  },
  {
    category: "Legal Documents",
    icon: "⚖️",
    color: P.amber,
    items: [
      { id: "legal_1", title: "IIRIRA §237 Analysis", source: "Immigration & Nationality Act", status: "Retroactive application", checked: false, notes: "" },
      { id: "legal_2", title: "INA §329 Military Naturalization", source: "Immigration Law", status: "Wartime provision", checked: false, notes: "" },
      { id: "legal_3", title: "CHC Briefing Requirements", source: "Congressional Materials", status: "May 18 deadline", checked: false, notes: "" },
    ],
  },
];

export default function ExportHub() {
  const [sources, setSources] = useState(EVIDENCE_SOURCES);
  const [customTitle, setCustomTitle] = useState("TruthEngine360 Evidence Report");
  const [customNotes, setCustomNotes] = useState("");
  const [exporting, setExporting] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const selectedCount = sources.reduce((sum, cat) => sum + cat.items.filter(i => i.checked).length, 0);
  const allItemsCount = sources.reduce((sum, cat) => sum + cat.items.length, 0);

  const handleToggleItem = (categoryIdx, itemIdx) => {
    const newSources = [...sources];
    newSources[categoryIdx].items[itemIdx].checked = !newSources[categoryIdx].items[itemIdx].checked;
    setSources(newSources);
  };

  const handleUpdateNotes = (categoryIdx, itemIdx, noteText) => {
    const newSources = [...sources];
    newSources[categoryIdx].items[itemIdx].notes = noteText;
    setSources(newSources);
  };

  const handleSelectAll = (categoryIdx) => {
    const newSources = [...sources];
    const allChecked = newSources[categoryIdx].items.every(i => i.checked);
    newSources[categoryIdx].items.forEach(item => {
      item.checked = !allChecked;
    });
    setSources(newSources);
  };

  const buildPDFContent = () => {
    let content = `${customTitle}\n`;
    content += `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}\n`;
    content += `Organization: AUMER Foundation (EIN 99-0495658)\n`;
    content += "=".repeat(70) + "\n\n";

    if (customNotes) {
      content += "CUSTOM NOTES\n";
      content += "-".repeat(70) + "\n";
      content += customNotes + "\n\n";
    }

    sources.forEach(category => {
      const selectedItems = category.items.filter(i => i.checked);
      if (selectedItems.length > 0) {
        content += `\n${category.category.toUpperCase()}\n`;
        content += "=".repeat(70) + "\n";
        selectedItems.forEach(item => {
          content += `\n• ${item.title}\n`;
          content += `  Source: ${item.source}\n`;
          content += `  Status: ${item.status}\n`;
          if (item.notes) {
            content += `  Notes: ${item.notes}\n`;
          }
        });
      }
    });

    return content;
  };

  const handleExportPDF = async () => {
    if (selectedCount === 0) {
      alert("Please select at least one evidence item to export.");
      return;
    }
    setExporting(true);
    const content = buildPDFContent();
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ExportHub_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    setExporting(false);
  };

  const handleEmailExport = async () => {
    if (selectedCount === 0) {
      alert("Please select at least one evidence item to export.");
      return;
    }
    setExporting(true);
    const content = buildPDFContent();
    await base44.integrations.Core.SendEmail({
      to: "gtarce@usc.edu",
      subject: `[AUMER] ${customTitle} — ${new Date().toLocaleDateString()}`,
      body: content,
    });
    setExporting(false);
    alert("Report sent to gtarce@usc.edu");
  };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          📤 Export <span style={{ color: P.gold }}>Hub</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          CURATE EVIDENCE · ADD NOTES · COMPILE REPORTS
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(100px,1fr))", gap: 7, marginBottom: 10 }}>
        {[
          ["Total Evidence", allItemsCount, P.blue],
          ["Selected", selectedCount, P.gold],
          ["Coverage", selectedCount > 0 ? `${((selectedCount / allItemsCount) * 100).toFixed(0)}%` : "0%", P.teal],
          ["Categories", sources.length, P.violet],
        ].map(([label, value, color]) => (
          <div key={label} style={{ background: P.card, border: `1px solid ${color}25`, borderLeft: `3px solid ${color}`, borderRadius: 7, padding: "6px 10px" }}>
            <div style={{ fontSize: 6, color: P.t4 }}>{label}</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 12 }}>
        {/* Evidence selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sources.map((category, catIdx) => {
            const isExpanded = expandedCategory === catIdx;
            const categorySelected = category.items.filter(i => i.checked).length;
            return (
              <div key={catIdx} style={{ background: P.card, border: `1px solid ${category.color}30`, borderRadius: 10, overflow: "hidden" }}>
                {/* Category header */}
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : catIdx)}
                  style={{
                    width: "100%", padding: "12px 14px", background: "transparent", border: "none",
                    borderBottom: isExpanded ? `1px solid ${category.color}20` : "none",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flex: 1 }}>
                    <span style={{ fontSize: 12 }}>{category.icon}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: category.color }}>{category.category}</span>
                    <span style={{ fontSize: 7, color: P.t4 }}>({categorySelected}/{category.items.length})</span>
                  </div>
                  <span style={{ fontSize: 10, color: category.color }}>{isExpanded ? "▼" : "▶"}</span>
                </button>

                {/* Category items */}
                {isExpanded && (
                  <div style={{ padding: "8px 14px" }}>
                    <button
                      onClick={() => handleSelectAll(catIdx)}
                      style={{
                        fontSize: 7, padding: "3px 8px", marginBottom: 6,
                        background: `${category.color}12`, border: `1px solid ${category.color}25`,
                        color: category.color, borderRadius: 20, cursor: "pointer", fontWeight: 700,
                      }}
                    >
                      {category.items.every(i => i.checked) ? "Deselect All" : "Select All"}
                    </button>
                    {category.items.map((item, itemIdx) => (
                      <div key={itemIdx} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${P.b}20` }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 4 }}>
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => handleToggleItem(catIdx, itemIdx)}
                            style={{ marginTop: 3, cursor: "pointer" }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 8, fontWeight: 700, color: item.checked ? category.color : P.t2 }}>
                              {item.title}
                            </div>
                            <div style={{ fontSize: 7, color: P.t4 }}>{item.source}</div>
                            <div style={{ fontSize: 6, color: P.t4 }}>{item.status}</div>
                          </div>
                        </div>
                        {item.checked && (
                          <textarea
                            value={item.notes}
                            onChange={(e) => handleUpdateNotes(catIdx, itemIdx, e.target.value)}
                            placeholder="Add custom notes about this item..."
                            style={{
                              width: "100%", padding: "6px 8px", fontSize: 7, color: P.t1,
                              background: "#080D18", border: `1px solid ${category.color}20`,
                              borderRadius: 5, outline: "none", fontFamily: "'IBM Plex Mono',monospace",
                              minHeight: 40, boxSizing: "border-box",
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Export panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Title */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.t2, marginBottom: 6, letterSpacing: 1 }}>REPORT TITLE</div>
            <input
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              style={{
                width: "100%", padding: "6px 8px", fontSize: 8, color: P.t1,
                background: "#080D18", border: `1px solid ${P.b}`,
                borderRadius: 5, outline: "none", fontFamily: "'IBM Plex Mono',monospace",
              }}
            />
          </div>

          {/* Custom notes */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.t2, marginBottom: 6, letterSpacing: 1 }}>CUSTOM NOTES</div>
            <textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Add global notes for the entire report..."
              style={{
                width: "100%", padding: "8px", fontSize: 7, color: P.t1,
                background: "#080D18", border: `1px solid ${P.b}`,
                borderRadius: 5, outline: "none", fontFamily: "'IBM Plex Mono',monospace",
                minHeight: 60, boxSizing: "border-box",
              }}
            />
          </div>

          {/* Export buttons */}
          <button
            onClick={handleExportPDF}
            disabled={exporting || selectedCount === 0}
            style={{
              padding: "10px", fontSize: 8, fontWeight: 700, cursor: exporting || selectedCount === 0 ? "not-allowed" : "pointer",
              background: selectedCount === 0 ? `${P.t4}20` : `${P.gold}12`,
              border: `1px solid ${selectedCount === 0 ? P.t4 : P.gold}25`,
              color: selectedCount === 0 ? P.t4 : P.gold,
              borderRadius: 8, opacity: exporting ? 0.6 : 1,
            }}
          >
            {exporting ? "⟳ Exporting..." : "↓ Export TXT"}
          </button>

          <button
            onClick={handleEmailExport}
            disabled={exporting || selectedCount === 0}
            style={{
              padding: "10px", fontSize: 8, fontWeight: 700, cursor: exporting || selectedCount === 0 ? "not-allowed" : "pointer",
              background: selectedCount === 0 ? `${P.t4}20` : `${P.teal}12`,
              border: `1px solid ${selectedCount === 0 ? P.t4 : P.teal}25`,
              color: selectedCount === 0 ? P.t4 : P.teal,
              borderRadius: 8, opacity: exporting ? 0.6 : 1,
            }}
          >
            {exporting ? "⟳ Sending..." : "📧 Email Report"}
          </button>

          {/* Summary */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 7, color: P.t4, lineHeight: 1.7 }}>
              <strong style={{ color: P.gold }}>{selectedCount}</strong> items selected<br />
              Ready to export{selectedCount === 0 ? " — select items to continue" : " ✓"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}