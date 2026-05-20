import { useState } from "react";
import { InvokeLLM } from "@base44/sdk/modules/ai.js";
import { P } from "../../lib/teData";

const CONTAMINATION_FORMULA = "0.25×identifier + 0.20×numeric + 0.20×language + 0.20×citation + 0.15×file_forensics";

const EVIDENCE = [
  {
    id: "EV-001", case: "MNV-01", tier: "T5_CB_HSIVF",
    type: "casualty_record", source: "DCAS/NARA VN08",
    desc: "DCAS entry — surname 'Duran' coded W (White Non-Hispanic) despite Spanish surname & TX birthplace",
    bisg_score: 0.91, bisg_flag: true,
    contamination: 0.12, components: { identifier: 0.05, numeric: 0.00, language: 0.25, citation: 0.10, file_forensics: 0.08 },
    gate: "CORROBORATED", admissibility: 5, sha256: "a3f9d2e1b4c7f0a8",
    date_added: "2025-01-12",
  },
  {
    id: "EV-002", case: "MNV-01", tier: "T5_CB_HSIVF",
    type: "oral_history", source: "Duran family archive — Laredo TX",
    desc: "Recorded oral testimony, Maria Duran (sister), Dec 2024. Confirms birth in Nuevo Laredo & enlistment.",
    bisg_score: null, bisg_flag: false,
    contamination: 0.03, components: { identifier: 0.02, numeric: 0.00, language: 0.05, citation: 0.02, file_forensics: 0.03 },
    gate: "CORROBORATED", admissibility: 5, sha256: "c2b1a0f9e8d7c6b5",
    date_added: "2025-01-15",
  },
  {
    id: "EV-003", case: "MNV-02", tier: "T5_CB_HSIVF",
    type: "deportation_record", source: "DHS ENFORCE extract — FOIA response partial",
    desc: "Removal order — Manuel Valenzuela, 1987. Service record present in file confirms Vietnam-era duty.",
    bisg_score: 0.84, bisg_flag: true,
    contamination: 0.18, components: { identifier: 0.10, numeric: 0.15, language: 0.20, citation: 0.30, file_forensics: 0.15 },
    gate: "CORROBORATED", admissibility: 5, sha256: "f7e6d5c4b3a2f1e0",
    date_added: "2025-02-03",
  },
  {
    id: "EV-004", case: "MNV-04", tier: "T5_CB_HSIVF",
    type: "casualty_record", source: "NARA RG 330 — casualty microfilm reel 14",
    desc: "Manuel Castano — coded 'Other' in ethnic field. Birth cert (Mexico) cross-referenced via INEGI query.",
    bisg_score: 0.92, bisg_flag: true,
    contamination: 0.09, components: { identifier: 0.05, numeric: 0.05, language: 0.10, citation: 0.12, file_forensics: 0.08 },
    gate: "CORROBORATED", admissibility: 5, sha256: "d4e3f2a1b0c9d8e7",
    date_added: "2025-02-18",
  },
  {
    id: "EV-005", case: "MNV-07", tier: "T3",
    type: "scholarly_citation", source: "Ralph Guzmán, 1970 — La Raza Cosmica study",
    desc: "Guzmán estimate: 3,500 Hispanic Vietnam casualties. Methodology: surname-list cross-reference of KIA records.",
    bisg_score: null, bisg_flag: false,
    contamination: 0.22, components: { identifier: 0.00, numeric: 0.30, language: 0.10, citation: 0.40, file_forensics: 0.10 },
    gate: "PLAUSIBLE", admissibility: 3, sha256: "b8a7f6e5d4c3b2a1",
    date_added: "2025-03-01",
  },
  {
    id: "EV-006", case: "MNV-08", tier: "T4",
    type: "bisg_reconstruction", source: "BISG τ=0.40 — client-side engine v1.2",
    desc: "Systematic BISG re-classification of DCAS VN08 roster (58,220 records). Result: 2,309 Hispanic (τ≥0.40).",
    bisg_score: null, bisg_flag: false,
    contamination: 0.06, components: { identifier: 0.05, numeric: 0.05, language: 0.05, citation: 0.08, file_forensics: 0.05 },
    gate: "CORROBORATED", admissibility: 4, sha256: "e0f1a2b3c4d5e6f7",
    date_added: "2025-03-10",
  },
  {
    id: "EV-007", case: "MNV-09", tier: "T2",
    type: "newspaper_archive", source: "Chronicling America — El Paso Herald, 1969",
    desc: "Obituary notice — 'Sgt. Carlos Reyes, hijo de inmigrantes' — coded W in DCAS. OCR confidence 88%.",
    bisg_score: 0.78, bisg_flag: true,
    contamination: 0.31, components: { identifier: 0.20, numeric: 0.10, language: 0.40, citation: 0.35, file_forensics: 0.38 },
    gate: "UNRESOLVED", admissibility: 2, sha256: "a9b8c7d6e5f4a3b2",
    date_added: "2025-03-22",
  },
  {
    id: "EV-008", case: "MNV-10", tier: "T1",
    type: "foia_response", source: "VA BIRLS — partial release, response #2024-0341",
    desc: "BIRLS death file shows 'NH' racial code. Military service summary card in same packet shows Spanish surname variant.",
    bisg_score: 0.67, bisg_flag: true,
    contamination: 0.14, components: { identifier: 0.10, numeric: 0.10, language: 0.15, citation: 0.20, file_forensics: 0.10 },
    gate: "PLAUSIBLE", admissibility: 1, sha256: "f3e2d1c0b9a8f7e6",
    date_added: "2025-04-05",
  },
  {
    id: "EV-009", case: "MNV-11", tier: "T3",
    type: "census_linkage", source: "1960 U.S. Census / IPUMS extract — TX state",
    desc: "Census household record cross-linked to DCAS record via SSN partial + name cluster. Spanish-language household.",
    bisg_score: 0.73, bisg_flag: true,
    contamination: 0.19, components: { identifier: 0.15, numeric: 0.20, language: 0.25, citation: 0.15, file_forensics: 0.20 },
    gate: "PLAUSIBLE", admissibility: 3, sha256: "c5d4e3f2a1b0c9d8",
    date_added: "2025-04-19",
  },
];

const TIER_COLORS = { T5_CB_HSIVF: P.gold, T4: "#22d3ee", T3: P.teal, T2: "#a78bfa", T1: P.blue };
const GATE_COLORS = { CORROBORATED: P.teal, PLAUSIBLE: P.gold, UNRESOLVED: P.t3, CONTRADICTORY: P.red, CONTAMINATED: "#ef4444" };
const TYPE_LABELS = {
  casualty_record: "Casualty Record", oral_history: "Oral History", deportation_record: "Deportation Record",
  scholarly_citation: "Scholarly Citation", bisg_reconstruction: "BISG Reconstruction",
  newspaper_archive: "Newspaper Archive", foia_response: "FOIA Response", census_linkage: "Census Linkage",
};

const Bar = ({ val, max = 1, color, width = 120 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <div style={{ width, height: 6, background: `${color}22`, borderRadius: 3, overflow: "hidden" }}>
      <div style={{ width: `${Math.round((val / max) * 100)}%`, height: "100%", background: color, borderRadius: 3 }} />
    </div>
    <span style={{ fontSize: 11, color: P.t2, minWidth: 32 }}>{(val * 100).toFixed(0)}%</span>
  </div>
);

export default function EvidenceVaultPanel() {
  const [filterTier, setFilterTier]   = useState("all");
  const [filterGate, setFilterGate]   = useState("all");
  const [filterType, setFilterType]   = useState("all");
  const [selected,   setSelected]     = useState(null);
  const [aiOut,      setAiOut]        = useState("");
  const [aiLoading,  setAiLoading]    = useState(false);
  const [showFormula, setShowFormula] = useState(false);

  const tiers  = ["all", ...new Set(EVIDENCE.map(e => e.tier))];
  const gates  = ["all", "CORROBORATED", "PLAUSIBLE", "UNRESOLVED"];
  const types  = ["all", ...new Set(EVIDENCE.map(e => e.type))];

  const filtered = EVIDENCE.filter(e =>
    (filterTier === "all" || e.tier === filterTier) &&
    (filterGate === "all" || e.gate === filterGate) &&
    (filterType === "all" || e.type === filterType)
  );

  const runAI = async () => {
    if (!selected) return;
    setAiLoading(true); setAiOut("");
    try {
      const res = await InvokeLLM({
        prompt: `Evidence record ${selected.id} (Case ${selected.case}): "${selected.desc}"
Source: ${selected.source}
Tier: ${selected.tier} | Gate: ${selected.gate} | Admissibility: ${selected.admissibility}/5
Contamination score: ${(selected.contamination * 100).toFixed(0)}%
BISG score: ${selected.bisg_score ?? "N/A"} | classification_anomaly_flag: ${selected.bisg_flag}

NOTE: classification_anomaly_flag=true is a FORENSIC SIGNAL — it means BISG ≥ τ=0.40 but DCAS coded non-Hispanic. This is the core finding, NOT contamination.

Analyze this evidence record for: (1) forensic value and admissibility under Omega Protocol 5-Gate test, (2) linkage gaps that require additional corroboration, (3) BISG anomaly interpretation if flagged, (4) next investigative steps.`,
        system_prompt: "You are a forensic evidence analyst for TruthEngine360. Apply the 5-Gate Admissibility Framework (Existence, Metadata, Provenance, Authenticity, Corroboration). CRITICAL: classification_anomaly_flag=true is a forensic signal — it means BISG surname score ≥ τ=0.40 while DCAS coded the soldier as non-Hispanic. This is the primary finding, not contamination. Be precise and brief (under 200 words).",
        add_context_from_previous_messages: false,
      });
      setAiOut(res);
    } catch (e) {
      setAiOut(`Analysis error: ${e.message}`);
    }
    setAiLoading(false);
  };

  const Chip = ({ label, active, onClick }) => (
    <button onClick={onClick} style={{
      padding: "3px 10px", borderRadius: 4, fontSize: 11, fontFamily: "'IBM Plex Mono',monospace",
      border: `1px solid ${active ? P.gold : P.b}`, background: active ? `${P.gold}22` : "transparent",
      color: active ? P.gold : P.t3, cursor: "pointer",
    }}>{label}</button>
  );

  return (
    <div style={{ background: P.bg, minHeight: "100%", padding: "18px 20px", color: P.t1 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: P.gold, letterSpacing: 1 }}>EVIDENCE VAULT</div>
          <div style={{ fontSize: 11, color: P.t3, marginTop: 2 }}>Omega Protocol · 5-Gate Admissibility · SHA-256 Certified</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowFormula(!showFormula)} style={{
            padding: "5px 12px", fontSize: 11, borderRadius: 4, border: `1px solid ${P.blue}`,
            background: showFormula ? `${P.blue}33` : "transparent", color: P.blue, cursor: "pointer",
            fontFamily: "'IBM Plex Mono',monospace",
          }}>
            {showFormula ? "Hide" : "Show"} Contamination Formula
          </button>
        </div>
      </div>

      {/* Contamination formula banner */}
      {showFormula && (
        <div style={{ background: `${P.navy}`, border: `1px solid ${P.b}`, borderRadius: 6, padding: "10px 16px", marginBottom: 14, fontSize: 12 }}>
          <div style={{ color: P.t3, marginBottom: 4 }}>CONTAMINATION SCORING FORMULA</div>
          <div style={{ color: P.gold, fontWeight: 600, letterSpacing: 0.5 }}>{CONTAMINATION_FORMULA}</div>
          <div style={{ marginTop: 8, color: P.t3, lineHeight: 1.6 }}>
            <span style={{ color: "#fca5a5", fontWeight: 700 }}>CRITICAL:</span>{" "}
            <span style={{ color: P.t2 }}>
              <code style={{ color: P.gold }}>classification_anomaly_flag = true</code> is a{" "}
              <span style={{ color: P.teal }}>FORENSIC SIGNAL</span> — it means BISG surname score ≥ τ=0.40
              while DCAS coded the soldier as non-Hispanic. This is the primary investigative finding and should
              fast-track records to analyst review. It is{" "}
              <span style={{ color: P.red }}>NOT contamination</span>.
            </span>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        {[
          { label: "Total Records",    val: EVIDENCE.length,                             color: P.t1 },
          { label: "Corroborated",     val: EVIDENCE.filter(e=>e.gate==="CORROBORATED").length, color: P.teal },
          { label: "BISG Anomaly",     val: EVIDENCE.filter(e=>e.bisg_flag).length,      color: P.gold },
          { label: "Tier-5 Verified",  val: EVIDENCE.filter(e=>e.tier==="T5_CB_HSIVF").length, color: "#fcd34d" },
          { label: "Avg Contamination",val: (EVIDENCE.reduce((s,e)=>s+e.contamination,0)/EVIDENCE.length*100).toFixed(0)+"%", color: P.blue },
        ].map(s => (
          <div key={s.label} style={{ background: P.navy, border: `1px solid ${P.b}`, borderRadius: 6, padding: "8px 14px", flex: "0 0 auto" }}>
            <div style={{ fontSize: 10, color: P.t3 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: P.t3 }}>TIER:</span>
          {tiers.map(t => <Chip key={t} label={t === "all" ? "ALL" : t} active={filterTier === t} onClick={() => setFilterTier(t)} />)}
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: P.t3 }}>GATE:</span>
          {gates.map(g => <Chip key={g} label={g === "all" ? "ALL" : g} active={filterGate === g} onClick={() => setFilterGate(g)} />)}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: P.navy, border: `1px solid ${P.b}`, borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: `${P.blue}22`, borderBottom: `1px solid ${P.b}` }}>
              {["ID", "Case", "Tier", "Type", "Source (excerpt)", "BISG", "Contam.", "Gate", "Admissibility"].map(h => (
                <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: P.t3, fontWeight: 600, fontSize: 10 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((ev, i) => (
              <tr key={ev.id} onClick={() => setSelected(selected?.id === ev.id ? null : ev)}
                style={{
                  borderBottom: `1px solid ${P.b}22`,
                  background: selected?.id === ev.id ? `${P.gold}11` : i % 2 === 0 ? "transparent" : `${P.blue}08`,
                  cursor: "pointer",
                }}>
                <td style={{ padding: "8px 10px", color: P.gold, fontWeight: 700 }}>{ev.id}</td>
                <td style={{ padding: "8px 10px", color: P.t2 }}>{ev.case}</td>
                <td style={{ padding: "8px 10px" }}>
                  <span style={{ background: `${TIER_COLORS[ev.tier]}22`, color: TIER_COLORS[ev.tier], border: `1px solid ${TIER_COLORS[ev.tier]}44`, borderRadius: 4, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>
                    {ev.tier}
                  </span>
                </td>
                <td style={{ padding: "8px 10px", color: P.t2, fontSize: 11 }}>{TYPE_LABELS[ev.type] ?? ev.type}</td>
                <td style={{ padding: "8px 10px", color: P.t3, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.source}</td>
                <td style={{ padding: "8px 10px" }}>
                  {ev.bisg_flag
                    ? <span style={{ color: P.gold, fontWeight: 700 }}>⚑ {ev.bisg_score?.toFixed(2)}</span>
                    : <span style={{ color: P.t3 }}>{ev.bisg_score?.toFixed(2) ?? "—"}</span>}
                </td>
                <td style={{ padding: "8px 10px" }}>
                  <span style={{ color: ev.contamination > 0.25 ? P.red : ev.contamination > 0.15 ? P.gold : P.teal }}>
                    {(ev.contamination * 100).toFixed(0)}%
                  </span>
                </td>
                <td style={{ padding: "8px 10px" }}>
                  <span style={{ color: GATE_COLORS[ev.gate] ?? P.t2, fontSize: 10, fontWeight: 700 }}>{ev.gate}</span>
                </td>
                <td style={{ padding: "8px 10px" }}>
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1,2,3,4,5].map(n => (
                      <div key={n} style={{ width: 8, height: 8, borderRadius: 2, background: n <= ev.admissibility ? P.teal : `${P.b}` }} />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selected && (
        <div style={{ background: P.navy, border: `1px solid ${P.gold}44`, borderRadius: 8, padding: 18, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: P.gold }}>{selected.id} — {selected.case}</div>
              <div style={{ fontSize: 11, color: P.t3 }}>{selected.source}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ fontSize: 10, color: P.t3 }}>SHA-256: </span>
              <span style={{ fontSize: 10, color: P.t2, fontFamily: "monospace" }}>{selected.sha256}…</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: P.t2, marginBottom: 14, lineHeight: 1.6 }}>{selected.desc}</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
            {/* Contamination breakdown */}
            <div>
              <div style={{ fontSize: 11, color: P.t3, marginBottom: 8 }}>CONTAMINATION BREAKDOWN</div>
              {Object.entries(selected.components).map(([k, v]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 120, fontSize: 10, color: P.t3 }}>{k.replace(/_/g, " ")}</div>
                  <Bar val={v} color={v > 0.25 ? P.red : v > 0.15 ? P.gold : P.teal} width={100} />
                </div>
              ))}
              <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: selected.contamination > 0.25 ? P.red : selected.contamination > 0.15 ? P.gold : P.teal }}>
                Composite: {(selected.contamination * 100).toFixed(0)}%
              </div>
            </div>

            {/* BISG & gate status */}
            <div>
              <div style={{ fontSize: 11, color: P.t3, marginBottom: 8 }}>FORENSIC STATUS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "Tier", val: selected.tier, color: TIER_COLORS[selected.tier] },
                  { label: "Gate", val: selected.gate, color: GATE_COLORS[selected.gate] },
                  { label: "Admissibility", val: `${selected.admissibility}/5`, color: P.t1 },
                  { label: "Date Added", val: selected.date_added, color: P.t2 },
                ].map(f => (
                  <div key={f.label} style={{ background: `${P.blue}22`, borderRadius: 4, padding: "6px 10px" }}>
                    <div style={{ fontSize: 9, color: P.t3 }}>{f.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: f.color }}>{f.val}</div>
                  </div>
                ))}
              </div>

              {selected.bisg_flag && (
                <div style={{ marginTop: 12, background: `${P.gold}11`, border: `1px solid ${P.gold}44`, borderRadius: 6, padding: "8px 12px" }}>
                  <div style={{ fontSize: 10, color: P.gold, fontWeight: 700 }}>⚑ BISG ANOMALY DETECTED</div>
                  <div style={{ fontSize: 11, color: P.t2, marginTop: 4 }}>
                    BISG score: <strong style={{ color: P.gold }}>{selected.bisg_score?.toFixed(2)}</strong> ≥ τ=0.40<br />
                    DCAS coded: non-Hispanic → <span style={{ color: P.teal }}>FORENSIC SIGNAL</span><br />
                    Action: fast-track to analyst review
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={runAI} disabled={aiLoading} style={{
              padding: "7px 16px", borderRadius: 5, fontSize: 12, fontFamily: "'IBM Plex Mono',monospace",
              border: `1px solid ${P.teal}`, background: aiLoading ? "transparent" : `${P.teal}22`,
              color: P.teal, cursor: aiLoading ? "not-allowed" : "pointer",
            }}>
              {aiLoading ? "Analyzing…" : "Run Omega Analysis"}
            </button>
            {aiOut && <button onClick={() => setAiOut("")} style={{ padding: "7px 12px", fontSize: 11, border: `1px solid ${P.b}`, background: "transparent", color: P.t3, borderRadius: 5, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace" }}>Clear</button>}
          </div>

          {aiOut && (
            <div style={{ marginTop: 14, background: `${P.blue}11`, border: `1px solid ${P.blue}44`, borderRadius: 6, padding: 14, fontSize: 12, color: P.t2, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {aiOut}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
