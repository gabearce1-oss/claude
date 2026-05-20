import { useState } from "react";
import { P, CASES } from "../../lib/teData";

// Evidence factors that may link PTSD → criminal record → deportation
const PTSD_RISK_FACTORS = [
  { factor: "Hospital Records", icon: "🏥", weight: 25, color: P.teal },
  { factor: "Social Media (Trauma Indicators)", icon: "📱", weight: 15, color: P.violet },
  { factor: "DUI / Substance Abuse", icon: "🚗", weight: 20, color: P.amber },
  { factor: "Domestic/Restraining Order", icon: "⚖️", weight: 20, color: P.red },
  { factor: "ICE Detainer / Criminal Charge", icon: "🚔", weight: 20, color: P.red },
];

// Synthetic evidence mapping for demo cases
const CASE_EVIDENCE = {
  C001: {
    hospital: { status: "Found", records: ["VA Psychiatric 1973", "PTSD diagnosis confirmed"], color: P.teal },
    social_media: { status: "N/A", records: ["Pre-internet era"], color: P.t4 },
    dui: { status: "Not found", records: [], color: P.t4 },
    restraining: { status: "Not found", records: [], color: P.t4 },
    ice: { status: "Found", records: ["Deportation order 2023 (retroactive IIRIRA)"], color: P.red },
    overall_ptsd_link: 65,
  },
  C002: {
    hospital: { status: "Found", records: ["VAMC San Diego 2005–2020", "PTSD (F43.10)", "TBI evaluations"], color: P.teal },
    social_media: { status: "Indicators Present", records: ["Facebook posts 2015–2018 re: trauma, nightmares, isolation"], color: P.violet },
    dui: { status: "Found", records: ["2014 San Diego County DUI (dismissed)", "BAC 0.09"], color: P.amber },
    restraining: { status: "Found", records: ["2012 domestic dispute (wife)", "mutual RO", "charges dropped"], color: P.red },
    ice: { status: "Found", records: ["Removal order 2024 (DUI retroactively applied under IIRIRA §237(a)(2)(B))"], color: P.red },
    overall_ptsd_link: 82,
  },
  C003: {
    hospital: { status: "Found", records: ["VA TBI clinic 2008", "PTSD (F43.12)", "psychotropic meds"], color: P.teal },
    social_media: { status: "Indicators Present", records: ["Twitter 2016–2019", "hypervigilance posts", "suicide ideation statements"], color: P.violet },
    dui: { status: "Not found", records: [], color: P.t4 },
    restraining: { status: "Not found", records: [], color: P.t4 },
    ice: { status: "Found", records: ["Removal order 2025 (assault conviction 2017 — service-related?)", "IIRIRA retroactive"], color: P.red },
    overall_ptsd_link: 72,
  },
  C004: {
    hospital: { status: "N/A", records: ["South Korea (post-service)"], color: P.t4 },
    social_media: { status: "Not found", records: [], color: P.t4 },
    dui: { status: "Found", records: ["Seoul 2015 DUI (ROK law)"], color: P.amber },
    restraining: { status: "Not found", records: [], color: P.t4 },
    ice: { status: "Found", records: ["ICE removal order 2025 (N-400 denial, IIRIRA retroactive)"], color: P.red },
    overall_ptsd_link: 35,
  },
  C005: {
    hospital: { status: "Found", records: ["VA psychiatry 2012–2024", "PTSD (F43.11)", "opioid-dependent"], color: P.teal },
    social_media: { status: "Indicators Present", records: ["Instagram 2019–2021", "combat trauma recount", "substance use posts"], color: P.violet },
    dui: { status: "Found", records: ["2019 Mexico (DUI equivalent)", "opioid paraphernalia charge"], color: P.amber },
    restraining: { status: "Found", records: ["2020 Mexico (family violence)", "girlfriend complaint"], color: P.red },
    ice: { status: "Found", records: ["Removal order 2025 (opioid charge retroactively deems deportable)"], color: P.red },
    overall_ptsd_link: 88,
  },
  C006: {
    hospital: { status: "Found", records: ["VA Colombia 2008–2024", "PTSD (F43.10)", "antidepressants"], color: P.teal },
    social_media: { status: "Not found", records: ["Limited presence"], color: P.t4 },
    dui: { status: "Not found", records: [], color: P.t4 },
    restraining: { status: "Not found", records: [], color: P.t4 },
    ice: { status: "Found", records: ["Removal threat (pending Colombian repatriation agreement)"], color: P.red },
    overall_ptsd_link: 58,
  },
};

export default function PTSDDeportationAnalyzer() {
  const [selectedCase, setSelectedCase] = useState(null);

  // Filter for Marine cases
  const marineCases = CASES.filter(c => c.branch === "USMC");

  const handleCaseSelect = (caseId) => {
    setSelectedCase(selectedCase === caseId ? null : caseId);
  };

  const evidence = selectedCase ? CASE_EVIDENCE[selectedCase] : null;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          🧠 PTSD → Deportation <span style={{ color: P.red }}>Analyzer</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          COMBAT TRAUMA EVIDENCE TRAIL · SOCIAL MEDIA · HOSPITAL · ICE · LEGAL FACTORS
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 12 }}>
        {/* Case selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.t2, letterSpacing: 1, marginBottom: 10 }}>
              🎖️ MARINE CASES — {marineCases.length}
            </div>
            {marineCases.map(c => {
              const isSelected = selectedCase === c.id;
              const evd = CASE_EVIDENCE[c.id];
              const ptsdScore = evd?.overall_ptsd_link || 0;
              return (
                <div
                  key={c.id}
                  onClick={() => handleCaseSelect(c.id)}
                  style={{
                    background: isSelected ? `${P.red}15` : "#080D18",
                    border: `1px solid ${isSelected ? P.red : P.b}`,
                    borderLeft: `4px solid ${ptsdScore >= 70 ? P.red : ptsdScore >= 50 ? P.amber : P.t4}`,
                    borderRadius: 8,
                    padding: "9px 11px",
                    marginBottom: 7,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, fontWeight: 800, color: P.t1 }}>
                      {c.id}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 800, color: ptsdScore >= 70 ? P.red : ptsdScore >= 50 ? P.amber : P.t4
                    }}>
                      {ptsdScore}%
                    </span>
                  </div>
                  <div style={{ fontSize: 8, color: P.t2, fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: 7, color: P.t4, marginTop: 2 }}>{c.status}</div>
                </div>
              );
            })}
          </div>

          {/* Risk score legend */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 7, color: P.t4, letterSpacing: 1, marginBottom: 8 }}>PTSD-DEPORTATION LINK</div>
            {[
              ["≥70%", "Strong Link", P.red],
              ["50–69%", "Moderate Link", P.amber],
              ["<50%", "Weak Link", P.t4],
            ].map(([range, label, color]) => (
              <div key={range} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 7, color, fontWeight: 700 }}>{range}</span>
                  <span style={{ fontSize: 7, color: P.t4, marginLeft: 6 }}>→ {label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence analysis */}
        <div>
          {!selectedCase ? (
            <div style={{
              background: P.card, border: `1px solid ${P.b}`, borderRadius: 10,
              padding: 30, textAlign: "center", height: 400, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center"
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🧠</div>
              <div style={{ fontSize: 9, color: P.t4, lineHeight: 1.7 }}>
                Select a Marine case<br />to view PTSD-linked<br />evidence trail
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Score summary */}
              <div style={{
                background: evidence.overall_ptsd_link >= 70 ? `${P.red}12` : `${P.amber}12`,
                border: `1px solid ${evidence.overall_ptsd_link >= 70 ? P.red : P.amber}30`,
                borderRadius: 10, padding: "12px 16px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: P.t2, marginBottom: 3 }}>
                      PTSD-DEPORTATION EVIDENCE SCORE
                    </div>
                    <div style={{ fontSize: 7, color: P.t4, lineHeight: 1.5 }}>
                      {evidence.overall_ptsd_link >= 70
                        ? "Strong evidence that combat trauma contributed to criminal record used for deportation."
                        : evidence.overall_ptsd_link >= 50
                        ? "Moderate evidence linking service-connected trauma to legal issues."
                        : "Limited evidence of PTSD-deportation nexus."}
                    </div>
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 28, fontWeight: 800,
                    color: evidence.overall_ptsd_link >= 70 ? P.red : P.amber }}>
                    {evidence.overall_ptsd_link}%
                  </div>
                </div>
              </div>

              {/* Evidence breakdown */}
              {[
                { key: "hospital", label: "🏥 Hospital / VA Records", icon: "🏥" },
                { key: "social_media", label: "📱 Social Media Indicators", icon: "📱" },
                { key: "dui", label: "🚗 DUI / Substance Abuse", icon: "🚗" },
                { key: "restraining", label: "⚖️ Restraining / Domestic Orders", icon: "⚖️" },
                { key: "ice", label: "🚔 ICE / Criminal Record", icon: "🚔" },
              ].map(({ key, label }) => {
                const evd = evidence[key];
                const isFound = evd.status === "Found" || evd.status === "Indicators Present";
                return (
                  <div key={key} style={{
                    background: P.card, border: `1px solid ${evd.color}25`,
                    borderLeft: `4px solid ${evd.color}`, borderRadius: 8, padding: "10px 14px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: evd.color }}>{label}</span>
                      <span style={{
                        fontSize: 7, fontWeight: 700, color: evd.color,
                        background: `${evd.color}15`, border: `1px solid ${evd.color}30`,
                        borderRadius: 20, padding: "1px 8px"
                      }}>
                        {evd.status}
                      </span>
                    </div>
                    {evd.records.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {evd.records.map((record, idx) => (
                          <div key={idx} style={{ fontSize: 7, color: P.t3, lineHeight: 1.4 }}>
                            • {record}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* IIRIRA link */}
              <div style={{
                background: `${P.red}08`, border: `1px solid ${P.red}30`, borderRadius: 8,
                padding: "10px 12px"
              }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: P.red, marginBottom: 4 }}>
                  ⚠️ ROOT CAUSE: IIRIRA §237 RETROACTIVE APPLICATION
                </div>
                <div style={{ fontSize: 7, color: P.t3, lineHeight: 1.6 }}>
                  Service-connected PTSD likely contributed to criminal behavior (DUI, domestic disputes, substance abuse).
                  However, IIRIRA retroactively criminalizes pre-1996 offenses NOT originally deportable, making deportation
                  possible without judicial discretion. No notification to VA required. No INA §329 protection invoked.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}