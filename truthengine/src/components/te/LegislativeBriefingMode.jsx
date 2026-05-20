import { useState } from "react";
import { P } from "../../lib/teData";

const CONGRESSIONAL_DISTRICTS = [
  { id: "CA-20", state: "California", number: 20, representative: "Jim Costa (D)", deported_veterans: 12, total_deported: 847, focus: "Central Valley agricultural region" },
  { id: "CA-13", state: "California", number: 13, representative: "John Duarte (R)", deported_veterans: 8, total_deported: 634, focus: "San Joaquin County dairy/agriculture" },
  { id: "TX-28", state: "Texas", number: 28, representative: "Henry Cuellar (D)", deported_veterans: 15, total_deported: 1203, focus: "Rio Grande Valley border region" },
  { id: "TX-15", state: "Texas", number: 15, representative: "Mónica De La Cruz (R)", deported_veterans: 11, total_deported: 956, focus: "McAllen-Pharr corridor" },
  { id: "AZ-01", state: "Arizona", number: 1, representative: "David Schweikert (R)", deported_veterans: 7, total_deported: 521, focus: "Phoenix metro area" },
  { id: "NM-03", state: "New Mexico", number: 3, representative: "Gabe Vasquez (D)", deported_veterans: 5, total_deported: 389, focus: "Southern border region" },
];

const BRIEFING_TEMPLATES = {
  constituent: "Constituent Outreach Letter — Highlighting local veteran deportations",
  staffing: "Congressional Staff Briefing — Data-driven policy analysis",
  town_hall: "Town Hall Briefing — Constituent-facing summary",
};

export default function LegislativeBriefingMode() {
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [briefingType, setBriefingType] = useState("constituent");
  const [customContent, setCustomContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);

  const toggleDistrict = (districtId) => {
    setSelectedDistricts(prev => 
      prev.includes(districtId) ? prev.filter(d => d !== districtId) : [...prev, districtId]
    );
  };

  const generateBriefing = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    
    const selected = CONGRESSIONAL_DISTRICTS.filter(d => selectedDistricts.includes(d.id));
    const totalVeterans = selected.reduce((sum, d) => sum + d.deported_veterans, 0);
    const totalDeported = selected.reduce((sum, d) => sum + d.total_deported, 0);

    const briefingContent = {
      districts: selected,
      briefingType,
      generated_date: new Date().toLocaleDateString(),
      summary: `This briefing documents ${totalVeterans} confirmed deported veterans across ${selected.length} Congressional district${selected.length !== 1 ? 's' : ''}, representing ${totalDeported} total deportations of Mexico nationals in your constituency.`,
      customContent,
    };

    setGenerated(briefingContent);
    setGenerating(false);
  };

  const exportPDF = () => {
    // Simulate PDF export
    alert(`PDF exported for ${selectedDistricts.length} district(s) — Ready for constituent outreach`);
  };

  const totalVeterans = CONGRESSIONAL_DISTRICTS
    .filter(d => selectedDistricts.includes(d.id))
    .reduce((sum, d) => sum + d.deported_veterans, 0);

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          🏛️ Legislative <span style={{ color: P.gold }}>Briefing Mode</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          CONGRESSIONAL DISTRICT TARGETING · CONSTITUENT OUTREACH · PDF GENERATION
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* District selection */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 10 }}>Select Congressional Districts</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            {CONGRESSIONAL_DISTRICTS.map(district => (
              <div
                key={district.id}
                onClick={() => toggleDistrict(district.id)}
                style={{
                  background: selectedDistricts.includes(district.id) ? `${P.gold}15` : P.card,
                  border: `1px solid ${selectedDistricts.includes(district.id) ? P.gold : P.b}`,
                  borderRadius: 10,
                  padding: 10,
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={selectedDistricts.includes(district.id)}
                      onChange={() => toggleDistrict(district.id)}
                      style={{ marginTop: 2, cursor: "pointer", width: 16, height: 16 }}
                    />
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: P.t1 }}>
                        {district.state} {district.number}
                      </div>
                      <div style={{ fontSize: 7, color: P.t4, marginTop: 2 }}>Rep. {district.representative}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 800, color: P.red }}>
                      {district.deported_veterans}
                    </div>
                    <div style={{ fontSize: 6, color: P.t4 }}>deported vets</div>
                  </div>
                </div>
                <div style={{ fontSize: 7, color: P.t3, marginBottom: 4 }}>{district.focus}</div>
                <div style={{ fontSize: 6, color: P.t4 }}>{district.total_deported} total deported</div>
              </div>
            ))}
          </div>

          {selectedDistricts.length > 0 && (
            <div style={{ background: P.bg, border: `1px solid ${P.gold}30`, borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 7, color: P.t4, marginBottom: 4 }}>SELECTION SUMMARY</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  ["Districts Selected", selectedDistricts.length],
                  ["Total Deported Vets", totalVeterans],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 6, color: P.t4 }}>{k}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: P.gold, fontFamily: "'IBM Plex Mono',monospace" }}>
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Briefing configuration */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 10 }}>Briefing Configuration</div>

          {/* Briefing type */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.t1, marginBottom: 8 }}>Briefing Type</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {Object.entries(BRIEFING_TEMPLATES).map(([key, label]) => (
                <label key={key} style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="briefingType"
                    value={key}
                    checked={briefingType === key}
                    onChange={e => setBriefingType(e.target.value)}
                    style={{ cursor: "pointer", width: 14, height: 14 }}
                  />
                  <span style={{ fontSize: 8, color: P.t2 }}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom content */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.t1, marginBottom: 8 }}>Custom Message (Optional)</div>
            <textarea
              value={customContent}
              onChange={e => setCustomContent(e.target.value)}
              placeholder="Add constituent-specific context or talking points..."
              style={{
                width: "100%",
                minHeight: 100,
                padding: "8px",
                background: P.bg,
                border: `1px solid ${P.b}`,
                borderRadius: 6,
                color: P.t1,
                fontSize: 8,
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
          </div>

          {/* Generation controls */}
          <div style={{ display: "flex", gap: 6, flexDirection: "column" }}>
            <button
              onClick={generateBriefing}
              disabled={selectedDistricts.length === 0 || generating}
              style={{
                width: "100%",
                padding: "10px",
                background: selectedDistricts.length === 0 ? `${P.gold}30` : `${P.gold}20`,
                border: `1px solid ${P.gold}`,
                color: P.gold,
                fontSize: 9,
                fontWeight: 700,
                borderRadius: 8,
                cursor: selectedDistricts.length === 0 || generating ? "not-allowed" : "pointer",
                opacity: selectedDistricts.length === 0 ? 0.5 : 1,
              }}
            >
              {generating ? "⟳ Generating Briefing..." : "🎯 Generate Briefing"}
            </button>
            
            {generated && (
              <button
                onClick={exportPDF}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: `${P.teal}20`,
                  border: `1px solid ${P.teal}`,
                  color: P.teal,
                  fontSize: 9,
                  fontWeight: 700,
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                📥 Export PDF for Outreach
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Generated briefing preview */}
      {generated && (
        <div style={{ marginTop: 14, background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 10 }}>📋 Briefing Preview</div>

          <div style={{ background: P.bg, borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <div style={{ fontSize: 7, color: P.t4, marginBottom: 6, fontWeight: 700 }}>BRIEFING SUMMARY</div>
            <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.8 }}>
              {generated.summary}
            </div>
          </div>

          {generated.districts.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: P.t1, marginBottom: 6 }}>DISTRICT BREAKDOWN</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 8 }}>
                {generated.districts.map(d => (
                  <div key={d.id} style={{ background: P.bg, borderRadius: 8, padding: 10 }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: P.gold, marginBottom: 4 }}>
                      {d.state}-{d.number}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, marginBottom: 3 }}>
                      <span style={{ color: P.t4 }}>Deported Veterans:</span>
                      <span style={{ fontWeight: 700, color: P.red }}>{d.deported_veterans}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7 }}>
                      <span style={{ color: P.t4 }}>Total Deported:</span>
                      <span style={{ fontWeight: 700, color: P.amber }}>{d.total_deported}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {generated.customContent && (
            <div style={{ background: P.bg, borderRadius: 8, padding: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: P.t1, marginBottom: 6 }}>CUSTOM MESSAGE</div>
              <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.8 }}>
                {generated.customContent}
              </div>
            </div>
          )}

          <div style={{ fontSize: 7, color: P.t4, padding: "10px", background: P.bg, borderRadius: 8, textAlign: "center" }}>
            ✓ Ready for PDF export · {generated.districts.length} district{generated.districts.length !== 1 ? "s" : ""} · {generated.briefingType}
          </div>
        </div>
      )}
    </div>
  );
}