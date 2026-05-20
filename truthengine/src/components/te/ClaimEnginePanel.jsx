import { useState } from "react";
import { InvokeLLM } from "@base44/sdk/modules/ai.js";
import { P } from "../../lib/teData";

const CLAIMS = [
  {
    id: "CLM-0001", case: "MNV-01",
    text: "Jesus S. Duran KIA coded non-Hispanic — BISG surname score 0.91 ≥ τ=0.40. DCAS field 'RACE_CODE' = W (White Non-Hispanic).",
    type: "casualty_misclassification",
    status: "corroborated", confidence: 88, nero: 91, tier: "T5_CB_HSIVF",
    predicate: "miscoded_as",
    burden: "DCAS VN08 original + home-of-record census cross-reference + oral history corroboration",
    needed_proof: ["DCAS_VN08_original_microfilm", "home_of_record_census_1960", "Duran_family_oral_history"],
    best_evidence: ["EV-001", "EV-002"],
    bisg_score: 0.91, bisg_flag: true,
    reviewer: "analyst-01", reviewer_agreed: true,
    public_summary: "Vietnam KIA record shows surname classification inconsistency with BISG analysis.",
    private_notes: "Laredo TX birth, Nuevo Laredo family, DCAS sequence 00349. Oral history Dec 2024 confirms.",
  },
  {
    id: "CLM-0002", case: "MNV-02",
    text: "Manuel Valenzuela faced deportation proceedings post-Vietnam service; not deported. DHS has no record of service-connected flag in ENFORCE extract.",
    type: "deportation_event",
    status: "corroborated", confidence: 82, nero: 84, tier: "T5_CB_HSIVF",
    predicate: "deported_by",
    burden: "Court records, FOIA DHS ENFORCE response, Casa de Apoyo registry cross-reference",
    needed_proof: ["DHS_ENFORCE_FOIA_complete", "immigration_court_records", "CDA_registry_entry"],
    best_evidence: ["EV-003"],
    bisg_score: 0.84, bisg_flag: true,
    reviewer: "analyst-01", reviewer_agreed: true,
    public_summary: "Vietnam veteran faced deportation proceeding without service-record evaluation.",
    private_notes: "FOIA DHS response partial. ENFORCE extract confirms removal order 1987. Service record in file.",
  },
  {
    id: "CLM-0003", case: "MNV-03",
    text: "Valente Valenzuela KIA misclassified — BISG surname score 0.87. DCAS coded 'Other Non-Hispanic'. Casualty date 1969-11-12.",
    type: "casualty_misclassification",
    status: "corroborated", confidence: 85, nero: 87, tier: "T5_CB_HSIVF",
    predicate: "miscoded_as",
    burden: "DCAS VN08 microfilm + BISG model confirmation + surname cluster analysis",
    needed_proof: ["DCAS_VN08_microfilm_Valenzuela", "NARA_DD1300_rg319", "surname_cluster_analysis"],
    best_evidence: ["EV-006"],
    bisg_score: 0.87, bisg_flag: true,
    reviewer: "analyst-01", reviewer_agreed: true,
    public_summary: "KIA record ethnicity coding inconsistent with BISG surname analysis.",
    private_notes: "Valenzuela surname cluster: 6 DCAS records, 5 coded non-Hispanic, BISG ≥0.80 on all 5.",
  },
  {
    id: "CLM-0004", case: "META",
    text: "DHS Secretary Noem admitted 8 veteran removals in written submission (Sept 2025) then denied any veteran removals under direct congressional testimony (Dec 2025). Delta = 8 admissions.",
    type: "agency_contradiction",
    status: "verified", confidence: 97, nero: 98, tier: "T1",
    predicate: "contradicted_by",
    burden: "Congressional submission transcript (Sept 2025) + testimony transcript (Dec 2025) — both in CHC Exhibit A",
    needed_proof: [],
    best_evidence: [],
    bisg_score: null, bisg_flag: false,
    reviewer: "analyst-02", reviewer_agreed: true,
    public_summary: "DHS written statement contradicts Secretary's subsequent congressional testimony on veteran removals.",
    private_notes: "CHC Exhibit A. Confidence 97/100. Primary accountability anchor for congressional oversight.",
  },
  {
    id: "CLM-0005", case: "POPULATION",
    text: "Approximately 500 Mexican-national KIA are not on the Vietnam Veterans Wall. Forensic estimate based on BISG τ=0.40 reconstruction and FSRDC microdata (pending).",
    type: "bisg_anomaly",
    status: "plausible", confidence: 52, nero: 48, tier: "T3",
    predicate: "confirmed_kia",
    burden: "FSRDC microdata access + NARA Form 102 (non-citizen draftee registration) + Harvard Dataverse doi:10.7910/DVN/O80SKQ",
    needed_proof: ["FSRDC_microdata_access", "NARA_Form_102_noncitizen", "Harvard_Dataverse_APSR_replication"],
    best_evidence: ["EV-005", "EV-006"],
    bisg_score: null, bisg_flag: false,
    reviewer: "unassigned", reviewer_agreed: false,
    public_summary: "Research estimate suggests significant number of Mexican-national KIA absent from official memorial.",
    private_notes: "Operational placeholder — FSRDC pending. Only 5 Wall names confirmed. ~500 = working estimate.",
  },
  {
    id: "CLM-0006", case: "STRUCTURE",
    text: "December 1969 Vietnam draft lottery preserved structural demographic bias — non-citizen Mexican draftees disproportionately assigned to high-casualty MOS.",
    type: "behavioral_vector",
    status: "corroborated", confidence: 74, nero: 74, tier: "T2",
    predicate: "confirmed_kia",
    burden: "Selective Service records (lottery sequence + MOS assignment) + draft lottery analysis + DCAS unit cross-reference",
    needed_proof: ["SSS_lottery_sequence_records", "MOS_assignment_cross_ref", "DCAS_unit_casualty_rates"],
    best_evidence: ["EV-007"],
    bisg_score: null, bisg_flag: false,
    reviewer: "analyst-02", reviewer_agreed: true,
    public_summary: "Evidence suggests draft lottery outcomes disproportionately affected non-citizen Hispanic draftees.",
    private_notes: "Dec 1969 lottery. Pre-lottery induction rates analyzed by Ralph Guzmán 1970. MOS assignment needed.",
  },
];

const TYPES = {
  casualty_misclassification: "Casualty Misclassification",
  deportation_event: "Deportation Event",
  agency_contradiction: "Agency Contradiction",
  bisg_anomaly: "BISG Anomaly",
  behavioral_vector: "Behavioral Vector",
  naturalization_denial: "Naturalization Denial",
  foia_violation: "FOIA Violation",
  congressional_record: "Congressional Record",
  oral_testimony: "Oral Testimony",
};

const STATUS_COLORS = {
  verified: P.teal, corroborated: "#22c55e", plausible: P.gold,
  weak_lead: P.t3, fabricated_risk: P.red, rejected: "#ef4444", unverified: P.t3,
};

const TIER_COLORS = { T5_CB_HSIVF: P.gold, T1: P.teal, T2: "#a78bfa", T3: P.blue, T4: "#22d3ee" };

const NeroBar = ({ label, val, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
    <div style={{ width: 80, fontSize: 10, color: P.t3 }}>{label}</div>
    <div style={{ flex: 1, height: 8, background: `${color}22`, borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: `${val ?? 0}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.5s" }} />
    </div>
    <div style={{ width: 36, fontSize: 11, color, fontWeight: 700, textAlign: "right" }}>{val ?? "—"}</div>
  </div>
);

export default function ClaimEnginePanel() {
  const [selected, setSelected]   = useState(CLAIMS[0]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType]   = useState("all");
  const [aiOut, setAiOut]         = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [view, setView]           = useState("list"); // list | matrix

  const filtered = CLAIMS.filter(c =>
    (filterStatus === "all" || c.status === filterStatus) &&
    (filterType   === "all" || c.type   === filterType)
  );

  const runAI = async () => {
    if (!selected) return;
    setAiLoading(true); setAiOut("");
    try {
      const res = await InvokeLLM({
        prompt: `Forensic claim analysis request for TruthEngine360:

Claim ID: ${selected.id}
Case: ${selected.case}
Type: ${selected.type}
Status: ${selected.status}
NERO Score: ${selected.nero}/100
Confidence: ${selected.confidence}/100
Tier: ${selected.tier}

Claim text: "${selected.text}"

Burden of proof: "${selected.burden}"

Needed proof items: ${selected.needed_proof.join(", ") || "None — claim fully supported"}

BISG score: ${selected.bisg_score ?? "N/A"} | Anomaly flag: ${selected.bisg_flag}

${selected.private_notes ? `Private notes: ${selected.private_notes}` : ""}

Analyze this claim for: (1) forensic strength under the Omega Protocol 5-Gate test, (2) confidence score justification, (3) specific next steps to close the needed-proof gap, (4) congressional or legal utility. Keep under 200 words.`,
        system_prompt: `You are a forensic intelligence analyst for TruthEngine360.
Anchor metrics — IMMUTABLE:
- DCAS official Hispanic count: 349 (0.60% of 58,220)
- BISG τ=0.40 estimate: 2,309 Hispanic
- Classification failure rate: 84.9%
- 6 verified T5_CB_HSIVF cases (MNV-01 through MNV-06)
- Noem contradiction: Sept 2025 admitted 8 removals; Dec 2025 denied all

CRITICAL: classification_anomaly_flag=true is a forensic signal — BISG ≥ τ=0.40 while DCAS coded non-Hispanic. It is NOT contamination. Fast-track to review.
Fabricated scores = platform failure. Be precise, cite specific proof needed.`,
        add_context_from_previous_messages: false,
      });
      setAiOut(res);
    } catch (e) {
      setAiOut(`Analysis error: ${e.message}`);
    }
    setAiLoading(false);
  };

  const Chip = ({ label, active, onClick, color }) => (
    <button onClick={onClick} style={{
      padding: "3px 10px", borderRadius: 4, fontSize: 11, fontFamily: "'IBM Plex Mono',monospace",
      border: `1px solid ${active ? (color ?? P.gold) : P.b}`, background: active ? `${color ?? P.gold}22` : "transparent",
      color: active ? (color ?? P.gold) : P.t3, cursor: "pointer",
    }}>{label}</button>
  );

  return (
    <div style={{ background: P.bg, minHeight: "100%", color: P.t1, display: "flex", gap: 0 }}>
      {/* Left panel — claim list */}
      <div style={{ width: 340, borderRight: `1px solid ${P.b}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Header */}
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${P.b}` }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: P.gold, letterSpacing: 1 }}>CLAIM ENGINE</div>
          <div style={{ fontSize: 10, color: P.t3, marginTop: 2 }}>Omega Protocol · NERO Scoring · 5-Gate Review</div>
        </div>

        {/* Stats */}
        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${P.b}22`, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { label: "Total",      val: CLAIMS.length,                               color: P.t1 },
            { label: "Verified",   val: CLAIMS.filter(c=>c.status==="verified").length,  color: P.teal },
            { label: "Corroborated", val: CLAIMS.filter(c=>c.status==="corroborated").length, color: "#22c55e" },
            { label: "Plausible",  val: CLAIMS.filter(c=>c.status==="plausible").length, color: P.gold },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 9, color: P.t3 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ padding: "8px 14px", borderBottom: `1px solid ${P.b}22`, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {["all", "verified", "corroborated", "plausible"].map(s => (
              <Chip key={s} label={s.toUpperCase()} active={filterStatus === s}
                color={STATUS_COLORS[s] ?? P.gold} onClick={() => setFilterStatus(s)} />
            ))}
          </div>
        </div>

        {/* Claim list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filtered.map(c => (
            <div key={c.id} onClick={() => { setSelected(c); setAiOut(""); }}
              style={{
                padding: "12px 16px", borderBottom: `1px solid ${P.b}22`, cursor: "pointer",
                background: selected?.id === c.id ? `${P.gold}11` : "transparent",
                borderLeft: selected?.id === c.id ? `3px solid ${P.gold}` : "3px solid transparent",
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: P.gold }}>{c.id}</span>
                  <span style={{ fontSize: 9, color: TIER_COLORS[c.tier] ?? P.t3, background: `${TIER_COLORS[c.tier] ?? P.t3}22`, padding: "1px 5px", borderRadius: 3, fontWeight: 700 }}>{c.tier}</span>
                </div>
                <span style={{ fontSize: 10, color: STATUS_COLORS[c.status] ?? P.t3, fontWeight: 700 }}>{c.status.toUpperCase()}</span>
              </div>
              <div style={{ fontSize: 11, color: P.t2, lineHeight: 1.5, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {c.text}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 9, color: P.t3 }}>NERO</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: c.nero >= 85 ? P.teal : c.nero >= 70 ? P.gold : P.t2 }}>{c.nero ?? "—"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: P.t3 }}>CONFIDENCE</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: c.confidence >= 85 ? P.teal : c.confidence >= 65 ? P.gold : P.t2 }}>{c.confidence}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: P.t3 }}>CASE</div>
                  <div style={{ fontSize: 12, color: P.t2 }}>{c.case}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — claim detail */}
      {selected && (
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>
          {/* Claim header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: P.gold }}>{selected.id}</span>
                <span style={{ fontSize: 11, background: `${TIER_COLORS[selected.tier] ?? P.t3}22`, color: TIER_COLORS[selected.tier] ?? P.t3, border: `1px solid ${TIER_COLORS[selected.tier] ?? P.t3}44`, borderRadius: 4, padding: "2px 8px", fontWeight: 700 }}>
                  {selected.tier}
                </span>
                <span style={{ fontSize: 11, background: `${STATUS_COLORS[selected.status] ?? P.t3}22`, color: STATUS_COLORS[selected.status] ?? P.t3, border: `1px solid ${STATUS_COLORS[selected.status] ?? P.t3}44`, borderRadius: 4, padding: "2px 8px", fontWeight: 700 }}>
                  {selected.status.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: 11, color: P.t3 }}>{TYPES[selected.type] ?? selected.type} · Case: {selected.case}</div>
            </div>
            <div style={{ fontSize: 11, color: P.t3 }}>Reviewer: {selected.reviewer}</div>
          </div>

          {/* Claim text */}
          <div style={{ background: P.navy, border: `1px solid ${P.b}`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: P.t3, marginBottom: 6 }}>CLAIM TEXT</div>
            <div style={{ fontSize: 13, color: P.t1, lineHeight: 1.7 }}>{selected.text}</div>
          </div>

          {/* Scores + BISG */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            {/* NERO + Confidence */}
            <div style={{ background: P.navy, border: `1px solid ${P.b}`, borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 11, color: P.t3, marginBottom: 10 }}>NERO · CONFIDENCE</div>
              <NeroBar label="NERO" val={selected.nero} color={selected.nero >= 85 ? P.teal : P.gold} />
              <NeroBar label="Confidence" val={selected.confidence} color={selected.confidence >= 85 ? "#22c55e" : selected.confidence >= 65 ? P.gold : P.t3} />
              {selected.bisg_score != null && (
                <NeroBar label="BISG" val={Math.round(selected.bisg_score * 100)} color={selected.bisg_flag ? P.gold : P.t3} />
              )}
            </div>

            {/* Status badges */}
            <div style={{ background: P.navy, border: `1px solid ${P.b}`, borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 11, color: P.t3, marginBottom: 10 }}>FORENSIC STATUS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "Predicate",  val: selected.predicate ?? "—",          color: P.t2 },
                  { label: "Reviewer",   val: selected.reviewer,                   color: P.t2 },
                  { label: "Agreed",     val: selected.reviewer_agreed ? "Yes" : "No", color: selected.reviewer_agreed ? P.teal : P.gold },
                  { label: "Evidence",   val: selected.best_evidence.join(", ") || "Pending", color: P.blue },
                ].map(f => (
                  <div key={f.label} style={{ background: `${P.blue}11`, borderRadius: 4, padding: "6px 10px" }}>
                    <div style={{ fontSize: 9, color: P.t3 }}>{f.label}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: f.color }}>{f.val}</div>
                  </div>
                ))}
              </div>

              {selected.bisg_flag && (
                <div style={{ marginTop: 10, background: `${P.gold}11`, border: `1px solid ${P.gold}44`, borderRadius: 6, padding: "8px 12px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: P.gold }}>⚑ BISG ANOMALY — FORENSIC SIGNAL</div>
                  <div style={{ fontSize: 11, color: P.t2, marginTop: 3 }}>
                    BISG {selected.bisg_score?.toFixed(2)} ≥ τ=0.40 · DCAS: non-Hispanic<br />
                    <span style={{ color: P.teal }}>Fast-track to analyst review. NOT contamination.</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Burden of proof */}
          <div style={{ background: P.navy, border: `1px solid ${P.b}`, borderRadius: 8, padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: P.t3, marginBottom: 8 }}>BURDEN OF PROOF</div>
            <div style={{ fontSize: 12, color: P.t2, lineHeight: 1.6 }}>{selected.burden}</div>
          </div>

          {/* Needed proof */}
          {selected.needed_proof.length > 0 && (
            <div style={{ background: P.navy, border: `1px solid ${P.red}33`, borderRadius: 8, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: P.red, marginBottom: 8 }}>NEEDED PROOF — GAPS REMAINING</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {selected.needed_proof.map(p => (
                  <div key={p} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: P.t2 }}>
                    <span style={{ color: P.red, fontSize: 14 }}>◻</span>
                    <span>{p.replace(/_/g, " ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selected.needed_proof.length === 0 && (
            <div style={{ background: `${P.teal}11`, border: `1px solid ${P.teal}44`, borderRadius: 8, padding: 14, marginBottom: 14, fontSize: 12, color: P.teal }}>
              ✓ All proof elements satisfied — no pending gaps
            </div>
          )}

          {/* Public summary */}
          <div style={{ background: `${P.blue}11`, border: `1px solid ${P.blue}22`, borderRadius: 8, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: P.t3, marginBottom: 4 }}>CHC-SAFE SUMMARY</div>
            <div style={{ fontSize: 12, color: P.t2, lineHeight: 1.6 }}>{selected.public_summary}</div>
          </div>

          {/* AI Analysis */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <button onClick={runAI} disabled={aiLoading} style={{
              padding: "7px 18px", borderRadius: 5, fontSize: 12, fontFamily: "'IBM Plex Mono',monospace",
              border: `1px solid ${P.teal}`, background: aiLoading ? "transparent" : `${P.teal}22`,
              color: P.teal, cursor: aiLoading ? "not-allowed" : "pointer",
            }}>
              {aiLoading ? "Analyzing claim…" : "Run Omega Claim Analysis"}
            </button>
            {aiOut && (
              <button onClick={() => setAiOut("")} style={{ padding: "7px 12px", fontSize: 11, border: `1px solid ${P.b}`, background: "transparent", color: P.t3, borderRadius: 5, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace" }}>
                Clear
              </button>
            )}
          </div>

          {aiOut && (
            <div style={{ background: `${P.blue}11`, border: `1px solid ${P.blue}44`, borderRadius: 8, padding: 16, fontSize: 12, color: P.t2, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {aiOut}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
