import { useState, useRef } from "react";
import { P } from "../../lib/teData";
import { base44 } from "@/api/base44Client";

// ── Omega-Level Admissibility Framework ──────────────────────────────────────
// Implements the Claude Intensive Historical Research Protocol
// 5-Gate Admissibility Test · Claim Classification · Datation If-Then Logic
// Adversarial Verification · AI Contamination Firewall · Chain-of-Custody

const OMEGA_SYSTEM_PROMPT = `You are operating as an adversarial historical intelligence analyst under the Omega-Level Admissibility Framework. You are NOT a creative writer, advocate, or speculative assistant.

MISSION: authenticate evidence, identify contamination, isolate fabricated claims, establish provenance, preserve evidentiary integrity, construct findings that survive legal, academic, archival, or congressional scrutiny.

CORE RULE: Narrative coherence NEVER overrides documentary authenticity. Specificity is NOT authenticity.

FIVE-GATE ADMISSIBILITY TEST (apply to every claim):
Gate 1 — EXISTENCE: Does the source exist in an official repository or catalog?
Gate 2 — METADATA: Complete archival metadata present (repository, creator, accession, date)?
Gate 3 — PROVENANCE: Custodial history traceable without circular sourcing?
Gate 4 — AUTHENTICITY: Period-consistent formatting — no modern syntax, synthetic IDs, AI phrasing?
Gate 5 — CORROBORATION: Independently supported by at least one separate source?
Failure on ANY gate → HYPOTHESIS ONLY. Never elevate to narrative fact.

CLAIM CLASSIFICATION:
VERIFIED     — All 5 gates pass. Fully authenticated and corroborated. May enter formal findings.
PLAUSIBLE    — Historically consistent but incomplete. Context layer only.
WEAK         — Unsupported assertion. Hypothesis registry only.
CONTRADICTED — Conflicts with other evidence. Flag and isolate.
FABRICATED   — Synthetic, impossible, or AI-generated. Remove entirely.

DATATION IF-THEN ESCALATION (apply to every verified claim):
"IF this is true → WHAT MUST ALSO EXIST?"
"IF this is false → WHAT CONTRADICTIONS SHOULD APPEAR?"
For every confirmed entity, expand across: Identity Layer (aliases, name variants), Geographic Layer (adjacent areas, migration corridors), Institutional Layer (banks, courts, churches, newspapers), Temporal Layer (before/during/after records), Social Layer (family, witnesses, partners).

ADVERSARIAL VERIFICATION (mandatory): Actively attempt to DISPROVE every claim. Scrutinize: cinematic details, perfect chronological continuity, suspiciously precise numbers, modern formatting in historical documents, synthetic IDs, AI language cadence, circular citations.

SYNTHETIC DOCUMENT DETECTION: Quarantine immediately if found — modern alphanumeric codes in pre-digital docs, anachronistic terminology, untraceable employees, fabricated accession numbers, AI-generated legal phrasing, repeated linguistic cadence across "independent" reports.

AI CONTAMINATION FIREWALL: AI output → archive search target ONLY. AI may suggest leads. Only repositories create evidence. AI reports CANNOT corroborate AI reports.

EVIDENTIARY MOMENTUM THEORY: Authentic history creates paperwork, witnesses, transactions, delays, disputes, bureaucracy, inconsistencies, and unintended traces. Fabricated narratives often create smooth continuity, excessive specificity, cinematic coherence, unsupported precision, and isolated "perfect" documents.

MANDATORY REPORT SECTIONS:
1. VERIFIED FINDINGS — gate-tested, corroborated
2. PLAUSIBLE CONTEXT — historically consistent, incomplete
3. UNRESOLVED QUESTIONS — requires archive search
4. CONTRADICTORY EVIDENCE — conflicts requiring resolution
5. FABRICATED / CONTAMINATED CLAIMS — removed
6. ARCHIVE REQUEST PRIORITIES — specific repositories with query logic
7. IF-THEN ESCALATION PATHS — what else must exist
8. CONFIDENCE LEVELS — A (authenticated) / B (corroborated) / C (plausible) / D (weak) / F (fabricated)
9. SOURCE MATRIX — searched vs. not searched
10. LIMITATIONS — what cannot be determined

CONTEXT — TRUTHENGINE360 INVESTIGATION:
Primary investigation: DCAS Vietnam-era Hispanic casualty undercount.
VERIFIED BASELINE: DCAS official = 349 Hispanic (0.60% of 58,220). BIFSG median = 3,272. Gap = 83.6%.
6 CB-HSIVF cases SHA-256 certified. CHC briefing: May 18, 2026.
Never cite prior AI TE360 analysis as evidentiary corroboration — use as search-direction only.

The objective is survivable truth. A beautiful lie is operational failure. A narrow verified fact is operational success.`;

const SWEEP_MODES = [
  { id:"standard",       icon:"🔍", label:"Standard",       desc:"Comprehensive adversarial analysis — neutral start, attempt falsification before support" },
  { id:"falsification",  icon:"⚔️", label:"Falsification",  desc:"Primary goal is to DISPROVE the claim — contradiction, impossibility, anachronism hunt" },
  { id:"corroboration",  icon:"🔗", label:"Corroboration",  desc:"What INDEPENDENT corroboration exists? No source from this investigation" },
  { id:"temporal",       icon:"⏱️", label:"Temporal",       desc:"Every date, institution, technology consistent with the claimed period?" },
  { id:"geographic",     icon:"🗺️", label:"Geographic",     desc:"Every location, transit route, border crossing consistent with period?" },
  { id:"institutional",  icon:"🏛️", label:"Institutional",  desc:"Map full institutional ecosystem — what agencies, courts, banks would have records?" },
];

const VERDICT_CONFIG = {
  VERIFIED:     { color:"#22D3EE", bg:"#0891B220", icon:"✓", label:"VERIFIED" },
  PLAUSIBLE:    { color:"#FCD34D", bg:"#FCD34D15", icon:"~", label:"PLAUSIBLE" },
  WEAK:         { color:"#F97316", bg:"#F9731615", icon:"?", label:"WEAK" },
  CONTRADICTED: { color:"#EF4444", bg:"#EF444415", icon:"✗", label:"CONTRADICTED" },
  FABRICATED:   { color:"#DC2626", bg:"#DC262620", icon:"⊘", label:"FABRICATED" },
};

const CONFIDENCE_SCORES = {
  A: { label:"A — Authenticated primary evidence",           color:"#22D3EE" },
  B: { label:"B — Independently corroborated secondary",     color:"#6EE7B7" },
  C: { label:"C — Plausible but incomplete",                 color:"#FCD34D" },
  D: { label:"D — Weak or unsupported",                      color:"#F97316" },
  F: { label:"F — Fabricated / contaminated",                color:"#EF4444" },
};

const EXAMPLE_CLAIMS = [
  "DCAS Vietnam Conflict Extract recorded 349 Hispanic casualties out of 58,220 total records",
  "C004 Sae Joon Park self-deported to Seoul November/December 2025 under ICE pressure",
  "BISG τ=0.40 applied to DCAS yields 2,309 probable Hispanic veterans",
  "VA BIRLS FOIA request F001 is 83+ days overdue as of May 2026",
  "The 1975 DCAS reclassification protocol coded Hispanic servicemembers as 'W' (White)",
  "ICE ENFORCE database contains zero veteran-status flags across 713,464 removal records",
];

const GATES = [
  { id:"existence",      label:"Existence",      desc:"Source exists in official repository/catalog" },
  { id:"metadata",       label:"Metadata",       desc:"Complete archival metadata present" },
  { id:"provenance",     label:"Provenance",     desc:"Custodial history traceable without circular sourcing" },
  { id:"authenticity",   label:"Authenticity",   desc:"Period-consistent formatting, no synthetic IDs" },
  { id:"corroboration",  label:"Corroboration",  desc:"Independently supported by separate source" },
];

function VerdictBadge({ verdict }) {
  const cfg = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.WEAK;
  return (
    <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40`, borderRadius: 4, padding: "2px 8px", fontSize: 7, fontWeight: 800, letterSpacing: 1 }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function GateIndicator({ pass }) {
  return (
    <span style={{ fontSize: 9, color: pass === true ? "#22D3EE" : pass === false ? "#EF4444" : P.t4 }}>
      {pass === true ? "✓" : pass === false ? "✗" : "–"}
    </span>
  );
}

export default function OmegaResearchEngine() {
  const [claim, setClaim] = useState("");
  const [context, setContext] = useState("");
  const [sweepMode, setSweepMode] = useState("standard");
  const [sweepNum, setSweepNum] = useState(1);
  const [escalationMode, setEscalationMode] = useState(true);
  const [sourceObjects, setSourceObjects] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [gateOverride, setGateOverride] = useState({});
  const reportRef = useRef(null);

  const runSweep = async () => {
    if (!claim.trim()) return;
    setLoading(true);
    setReport(null);
    setError(null);

    const modeInstr = {
      standard: "Comprehensive adversarial analysis. Start neutral, attempt falsification before support.",
      falsification: "Adversarial falsification sweep. PRIMARY GOAL: DISPROVE the claim. Hunt contradictions, impossibilities, anachronisms.",
      corroboration: "Focus only on what INDEPENDENT corroboration exists. No sources from this investigation.",
      temporal: "Temporal pressure test. Verify every date, institution, technology is period-consistent.",
      geographic: "Geographic plausibility sweep. Verify every location, transit route, border crossing.",
      institutional: "Map full institutional ecosystem. What agencies, courts, banks, newspapers would have records?",
    };

    const sources = sourceObjects.trim()
      ? `\n\nPROVIDED SOURCE OBJECTS (apply 5-Gate test to each):\n${sourceObjects}`
      : "";

    const prompt = `OMEGA SWEEP ${sweepNum} — MODE: ${sweepMode.toUpperCase()}
${modeInstr[sweepMode]}

CLAIM UNDER INVESTIGATION:
${claim}

${context ? `INVESTIGATOR-PROVIDED CONTEXT:\n${context}` : ""}
${sources}

${escalationMode ? "DATATION ESCALATION MODE ACTIVE: For every verified finding, generate the full IF-THEN escalation matrix." : ""}

Apply the full Omega-Level protocol. Apply the 5-Gate Admissibility Test explicitly for every claim. Classify each finding with VERIFIED/PLAUSIBLE/WEAK/CONTRADICTED/FABRICATED. Run adversarial verification. Produce all 10 mandatory report sections with headers clearly labeled.`;

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        system_prompt: OMEGA_SYSTEM_PROMPT,
        add_context_from_previous_messages: false,
      });
      const text = typeof res === "string" ? res : res?.text || res?.content || JSON.stringify(res);
      const entry = { claim: claim.slice(0, 80), mode: sweepMode, sweep: sweepNum, text, ts: new Date().toLocaleTimeString() };
      setReport(entry);
      setHistory(h => [entry, ...h.slice(0, 7)]);
      setSweepNum(n => n + 1);
      setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setError(err?.message || "Omega Engine failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1, padding: "14px 20px", overflowY: "auto", height: "calc(100vh - 118px)" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0B0018, #1A0A2E)", border: "2px solid #7C3AED40", borderRadius: 12, padding: "14px 18px", marginBottom: 14 }}>
        <div style={{ fontSize: 7, color: "#A78BFA", letterSpacing: 3, fontWeight: 800, marginBottom: 4 }}>
          ⚔️ OMEGA-LEVEL ADMISSIBILITY FRAMEWORK · ADVERSARIAL HISTORICAL INTELLIGENCE PROTOCOL
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          Omega Research Engine
          <span style={{ marginLeft: 10, fontSize: 7, background: "#7C3AED20", color: "#A78BFA", border: "1px solid #7C3AED40", borderRadius: 4, padding: "2px 7px", fontWeight: 700 }}>
            CLAUDE AI · ADVERSARIAL MODE
          </span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, marginTop: 4, lineHeight: 1.7 }}>
          5-Gate Admissibility Test · Claim Classification · Datation If-Then Escalation · Adversarial Verification · AI Contamination Firewall
          <br/>
          <em style={{ color: "#A78BFA" }}>"A beautiful lie is operational failure. A narrow verified fact is operational success."</em>
        </div>

        {/* Gate legend */}
        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
          {GATES.map(g => (
            <div key={g.id} style={{ background: "#0B001820", border: "1px solid #7C3AED25", borderRadius: 5, padding: "4px 8px" }}>
              <div style={{ fontSize: 6, color: "#A78BFA", fontWeight: 800 }}>GATE: {g.label.toUpperCase()}</div>
              <div style={{ fontSize: 6, color: P.t4 }}>{g.desc}</div>
            </div>
          ))}
        </div>

        {/* Verdict legend */}
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          {Object.entries(VERDICT_CONFIG).map(([k, v]) => (
            <div key={k} style={{ background: v.bg, border: `1px solid ${v.color}30`, borderRadius: 4, padding: "3px 8px", fontSize: 6, fontWeight: 700, color: v.color }}>
              {v.icon} {v.label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 14 }}>
        {/* LEFT — Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Claim input */}
          <div style={{ background: "#080D18", border: "1px solid #7C3AED30", borderRadius: 9, padding: "12px" }}>
            <div style={{ fontSize: 7, color: "#A78BFA", fontWeight: 800, letterSpacing: 1, marginBottom: 6 }}>CLAIM UNDER INVESTIGATION</div>
            <textarea
              value={claim}
              onChange={e => setClaim(e.target.value)}
              placeholder="Enter the specific claim, document reference, or historical assertion to investigate..."
              style={{ width: "100%", minHeight: 80, fontFamily: "'IBM Plex Mono',monospace", fontSize: 7, background: "#030508", border: "1px solid #7C3AED20", borderRadius: 6, padding: "8px 10px", color: P.t1, outline: "none", resize: "vertical", boxSizing: "border-box" }}
            />
            <div style={{ fontSize: 6, color: P.t4, marginTop: 4 }}>Examples:</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 3 }}>
              {EXAMPLE_CLAIMS.map((ex, i) => (
                <div key={i} onClick={() => setClaim(ex)}
                  style={{ fontSize: 6, color: "#A78BFA", cursor: "pointer", padding: "2px 4px", borderRadius: 3, background: "#7C3AED08", lineHeight: 1.4 }}>
                  → {ex.slice(0, 72)}…
                </div>
              ))}
            </div>
          </div>

          {/* Context input */}
          <div style={{ background: "#080D18", border: "1px solid #7C3AED20", borderRadius: 9, padding: "12px" }}>
            <div style={{ fontSize: 7, color: "#A78BFA", fontWeight: 800, letterSpacing: 1, marginBottom: 6 }}>INVESTIGATOR CONTEXT (optional)</div>
            <textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="Additional context, prior findings, or investigative notes..."
              style={{ width: "100%", minHeight: 55, fontFamily: "'IBM Plex Mono',monospace", fontSize: 7, background: "#030508", border: "1px solid #7C3AED15", borderRadius: 6, padding: "7px 9px", color: P.t1, outline: "none", resize: "vertical", boxSizing: "border-box" }}
            />
          </div>

          {/* Source objects */}
          <div style={{ background: "#080D18", border: "1px solid #7C3AED20", borderRadius: 9, padding: "12px" }}>
            <div style={{ fontSize: 7, color: "#A78BFA", fontWeight: 800, letterSpacing: 1, marginBottom: 6 }}>SOURCE OBJECTS (apply 5-Gate test)</div>
            <textarea
              value={sourceObjects}
              onChange={e => setSourceObjects(e.target.value)}
              placeholder="List source objects: repository, accession, creator, date, URL..."
              style={{ width: "100%", minHeight: 55, fontFamily: "'IBM Plex Mono',monospace", fontSize: 7, background: "#030508", border: "1px solid #7C3AED15", borderRadius: 6, padding: "7px 9px", color: P.t1, outline: "none", resize: "vertical", boxSizing: "border-box" }}
            />
          </div>

          {/* Sweep mode */}
          <div style={{ background: "#080D18", border: "1px solid #7C3AED20", borderRadius: 9, padding: "12px" }}>
            <div style={{ fontSize: 7, color: "#A78BFA", fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>SWEEP MODE (Sweep #{sweepNum})</div>
            {SWEEP_MODES.map(m => (
              <button key={m.id} onClick={() => setSweepMode(m.id)}
                style={{ display: "flex", gap: 8, alignItems: "flex-start", width: "100%", padding: "7px 9px", marginBottom: 4,
                  background: sweepMode === m.id ? "#7C3AED18" : "transparent",
                  border: `1px solid ${sweepMode === m.id ? "#7C3AED" : "#7C3AED15"}`,
                  borderRadius: 6, cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontSize: 12 }}>{m.icon}</span>
                <div>
                  <div style={{ fontSize: 7, fontWeight: 800, color: sweepMode === m.id ? "#A78BFA" : P.t2 }}>{m.label}</div>
                  <div style={{ fontSize: 6, color: P.t4, lineHeight: 1.3, marginTop: 1 }}>{m.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Options */}
          <div style={{ background: "#080D18", border: "1px solid #7C3AED20", borderRadius: 9, padding: "12px" }}>
            <div style={{ fontSize: 7, color: "#A78BFA", fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>OPTIONS</div>
            <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer", marginBottom: 8 }}>
              <input type="checkbox" checked={escalationMode} onChange={e => setEscalationMode(e.target.checked)}
                style={{ accentColor: "#7C3AED" }} />
              <div>
                <div style={{ fontSize: 7, color: P.t1, fontWeight: 700 }}>Datation Escalation Mode</div>
                <div style={{ fontSize: 6, color: P.t4 }}>If-Then logic: what else must exist?</div>
              </div>
            </label>
            <div style={{ fontSize: 6, color: "#7C3AED", padding: "5px 7px", background: "#7C3AED08", borderRadius: 4, lineHeight: 1.5 }}>
              AI CONTAMINATION FIREWALL ACTIVE<br/>
              AI output → search target only<br/>
              AI cannot corroborate AI
            </div>
          </div>

          {/* Execute */}
          <button
            onClick={runSweep}
            disabled={!claim.trim() || loading}
            style={{ padding: "11px 0", fontSize: 9, fontWeight: 800, cursor: !claim.trim() || loading ? "not-allowed" : "pointer",
              background: loading ? "#7C3AED30" : "linear-gradient(135deg, #7C3AED, #5B21B6)",
              border: "1px solid #7C3AED", color: "#fff", borderRadius: 8, fontFamily: "inherit",
              opacity: !claim.trim() ? 0.4 : 1, letterSpacing: 1 }}>
            {loading ? "⟳ OMEGA SWEEP RUNNING…" : `⚔️ EXECUTE SWEEP ${sweepNum} — ${sweepMode.toUpperCase()}`}
          </button>

          {/* Confidence legend */}
          <div style={{ background: "#080D18", border: "1px solid #7C3AED20", borderRadius: 9, padding: "12px" }}>
            <div style={{ fontSize: 7, color: "#A78BFA", fontWeight: 800, letterSpacing: 1, marginBottom: 6 }}>CONFIDENCE SCORING</div>
            {Object.entries(CONFIDENCE_SCORES).map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 3 }}>
                <span style={{ fontWeight: 900, color: v.color, fontSize: 9, width: 14 }}>{k}</span>
                <span style={{ fontSize: 6, color: P.t4 }}>{v.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Output */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Loading */}
          {loading && (
            <div style={{ background: "#0B0018", border: "1px solid #7C3AED40", borderRadius: 10, padding: "32px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>⚔️</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#A78BFA" }}>Omega Sweep {sweepNum} — {sweepMode.toUpperCase()}</div>
              <div style={{ fontSize: 7, color: P.t4, marginTop: 6 }}>
                Applying 5-Gate Admissibility Test · Adversarial Verification Mode Active
                {escalationMode && " · Datation Escalation Logic Running"}
              </div>
              <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 5 }}>
                {GATES.map(g => (
                  <div key={g.id} style={{ fontSize: 6, color: "#A78BFA", background: "#7C3AED15", border: "1px solid #7C3AED30", borderRadius: 3, padding: "2px 5px" }}>
                    {g.label}…
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: "#1A0A0A", border: "1px solid #EF4444", borderRadius: 9, padding: "12px 14px", fontSize: 8, color: "#EF4444" }}>
              ⚠ Omega Engine Error: {error}
            </div>
          )}

          {/* Report */}
          {report && !loading && (
            <div ref={reportRef} style={{ background: "#080D18", border: "1px solid #7C3AED30", borderRadius: 10, padding: "16px" }}>
              {/* Report header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #7C3AED20" }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#A78BFA" }}>
                    ⚔️ OMEGA SWEEP {report.sweep} — {report.mode.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 7, color: P.t4, marginTop: 2 }}>{report.ts} · Adversarial Mode · AI Contamination Firewall Active</div>
                  <div style={{ fontSize: 7, color: P.t2, marginTop: 4, fontStyle: "italic" }}>"{report.claim}{report.claim.length >= 80 ? "…" : ""}"</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => navigator.clipboard.writeText(report.text)}
                    style={{ padding: "4px 10px", fontSize: 6, cursor: "pointer", background: "#7C3AED15", border: "1px solid #7C3AED30", color: "#A78BFA", borderRadius: 5, fontFamily: "inherit" }}>
                    📋 Copy
                  </button>
                  <button
                    onClick={() => setReport(null)}
                    style={{ padding: "4px 10px", fontSize: 6, cursor: "pointer", background: "transparent", border: "1px solid #7C3AED20", color: P.t4, borderRadius: 5, fontFamily: "inherit" }}>
                    ✕
                  </button>
                </div>
              </div>

              {/* Report body */}
              <div style={{ fontSize: 8, color: P.t2, lineHeight: 1.9, whiteSpace: "pre-wrap", maxHeight: 580, overflowY: "auto" }}>
                {report.text}
              </div>

              {/* Run next sweep */}
              <div style={{ marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {SWEEP_MODES.filter(m => m.id !== report.mode).slice(0, 3).map(m => (
                  <button key={m.id} onClick={() => { setSweepMode(m.id); runSweep(); }}
                    disabled={loading}
                    style={{ flex: 1, padding: "6px 10px", fontSize: 7, fontWeight: 700, cursor: "pointer",
                      background: "#7C3AED10", border: "1px solid #7C3AED25", color: "#A78BFA", borderRadius: 6, fontFamily: "inherit" }}>
                    {m.icon} Run {m.label} Sweep
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!report && !loading && !error && (
            <div style={{ background: "#080D18", border: "1px solid #7C3AED20", borderRadius: 10, padding: "32px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>⚔️</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: P.t1, marginBottom: 6 }}>Omega Research Engine</div>
              <div style={{ fontSize: 7, color: P.t4, lineHeight: 1.8, maxWidth: 480, margin: "0 auto" }}>
                Enter a claim and execute a sweep. The engine applies the full Omega-Level Admissibility Framework:
                adversarial verification, 5-Gate testing, Datation If-Then escalation, and claim classification.
              </div>

              {/* Protocol summary cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, marginTop: 16, textAlign: "left", maxWidth: 700, margin: "16px auto 0" }}>
                {[
                  { icon:"⚔️", t:"Adversarial Verification", d:"Actively attempts to DISPROVE every claim before supporting it" },
                  { icon:"🔬", t:"5-Gate Admissibility", d:"Existence · Metadata · Provenance · Authenticity · Corroboration" },
                  { icon:"📊", t:"Claim Classification", d:"VERIFIED / PLAUSIBLE / WEAK / CONTRADICTED / FABRICATED" },
                  { icon:"🧮", t:"Datation If-Then Logic", d:"Every verified fact triggers: what else MUST exist?" },
                  { icon:"🚫", t:"AI Contamination Firewall", d:"AI output cannot corroborate AI output — archives only" },
                  { icon:"🔄", t:"Multi-Sweep Protocol", d:"3+ independent sweeps with different modes and logic" },
                ].map(({ icon, t, d }) => (
                  <div key={t} style={{ background: "#0B0018", border: "1px solid #7C3AED15", borderRadius: 7, padding: "10px 12px" }}>
                    <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontSize: 8, fontWeight: 800, color: "#A78BFA", marginBottom: 3 }}>{t}</div>
                    <div style={{ fontSize: 6, color: P.t4, lineHeight: 1.5 }}>{d}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sweep history */}
          {history.length > 0 && (
            <div style={{ background: "#080D18", border: "1px solid #7C3AED20", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 7, color: "#A78BFA", fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>SWEEP HISTORY — {history.length} SWEEP{history.length > 1 ? "S" : ""}</div>
              {history.map((h, i) => (
                <div key={i}
                  onClick={() => setReport(h)}
                  style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 0", borderBottom: i < history.length - 1 ? "1px solid #7C3AED10" : "none", cursor: "pointer" }}>
                  <span style={{ fontSize: 6, color: "#A78BFA", background: "#7C3AED15", border: "1px solid #7C3AED30", borderRadius: 3, padding: "1px 5px", fontWeight: 800, whiteSpace: "nowrap" }}>
                    SWEEP {h.sweep}
                  </span>
                  <span style={{ fontSize: 6, color: P.t4, whiteSpace: "nowrap" }}>{h.mode}</span>
                  <span style={{ fontSize: 6, color: P.t2, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.claim}</span>
                  <span style={{ fontSize: 6, color: P.t4, whiteSpace: "nowrap" }}>{h.ts}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
