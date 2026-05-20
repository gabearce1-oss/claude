import { useState, useRef, useEffect } from "react";
import { P, CASES, FOIA_REQUESTS } from "../../lib/teData";
import { base44 } from "@/api/base44Client";

// ── System prompt derived from te360assistant.jsonc agent definition ──────────
const TE360_SYSTEM_PROMPT = `You are the TruthEngine360 Research Assistant, an expert AI for the AUMER Foundation's forensic investigation into Hispanic veteran deportation and the DCAS undercount anomaly.

CORE KNOWLEDGE BASE:

1. DCAS ANOMALY: The Defense Casualty Analysis System (DCAS) recorded only 349 Hispanic casualties out of 58,220 Vietnam War records (0.60%). BIFSG forensic analysis at standard threshold yields 2,876–3,372 (corridor), BISG τ=0.40 yields 2,309 (3.97%) — an 83.6–84.9% classification failure representing ~1,789–1,960 erased veterans. SPSS validation: R²=0.935–0.947, F(4,38)=161.7, p<0.001. Root cause: 1975 DCAS reclassification protocol coded Hispanic servicemembers as 'W' (White) if last names matched non-Hispanic cohorts.

2. 5-STREAM CONVERGENCE:
   - Stream 1 (DCAS Official): 349 (0.60%) — ANOMALOUS BASELINE
   - Stream 2 (BISG τ=0.40): 2,309 (3.97%) — FORENSIC ESTIMATE
   - Stream 3 (NARA Retroactive): 3,070 (5.27%) — ARCHIVAL
   - Stream 4 (Guzmán 1969): 3,500 (6.01%) — HISTORICAL
   - Stream 5 (LAE Database): 3,741 (6.43%) — COMMUNITY
   Convergence: undercountFactor 8.2×–14.8×. All streams exceed official count by factor of 6.6+.

3. NERO MODEL (Institutional Erasure Scores 0–100):
   - N (Notification): 94/100 — citizenship promise never formalized
   - E (Erasure): 97/100 — 84.9% misclassification in DCAS
   - R (Restriction): 91/100 — VA access barriers post-deportation
   - O (Obscurity): 96/100 — ICE confirmed only 92 vs 94,000+ estimated
   - Composite: 94.5/100 — exceeds critical threshold on all four vectors

4. 6 CB-HSIVF VERIFIED CASES (SHA-256 certified, Exhibit A — Arce 2026):
   - C001/EPP-001: Valente Valenzuela — USMC, Bronze Star, deported 2009, Tijuana, Gold tier, 95% confidence. PTSD-correlated offense, deported 29 years after service.
   - C002/EPP-002: Manuel Valenzuela — USMC, deported 2009, Tijuana, Gold tier, 88% confidence.
   - C003: Victor Valenzuela — USMC, TJ shelter, Silver tier, 82% confidence.
   - C004: Sae Joon Park — USMC, Korean-born, CRITICAL, self-deported Nov/Dec 2025, Seoul. DOB 1975, 1993–1998, Somalia UNOSOM II + Haiti deployments. USCIS denied naturalization 2020 under INA §1427(a)(3), §329 exception never applied. Gold tier, 94% confidence.
   - C005: Miguel Segura — Nogales, Silver tier, 79% confidence. FOIA pending.
   - C006: J. Duran — Colombia-based, Bronze tier, 76% confidence. Evidence gaps.

5. ACTIVE FOIA REQUESTS:
   - F001: VA BIRLS (83+ days OVERDUE) — 1-877-750-3639 / vacofoiaservice@va.gov. Critical for BIRLS military discharge cross-reference.
   - F002: DHS/ICE ENFORCE (66+ days OVERDUE) — foia.ice@dhs.gov. Critical for deportation crosswalk.
   - F003: INAI México / COMAR — pending.
   - F004: NARA Surname File (NA-14021) — extension granted.
   - F005: DoD DMDC (25+ days overdue) — dmdc.foia@mail.mil.
   CHC briefing blocked by F001 + F002. Escalation strategy: Congressional intervention + GAO subpoena authority.

6. KEY LEGISLATION:
   - IIRIRA 1996 §237(a)(2)(A)(iii): Retroactively criminalized pre-1996 offenses, enabling veteran deportation. Grandfather clause needed.
   - INA §329: Wartime naturalization (never fully implemented for non-citizens serving honorably).
   - EO-14012: IMMVI 2021 directive. S.874: Veterans Visa and Protection Act (Sen. Duckworth). HR.1537: Repatriate Our Patriots Act (Rep. Takano).
   - SCRA: Service Member Civil Relief Act protections.

7. CHC BRIEFING: May 18, 2026 deadline. Readiness ~73%. 2 critical FOIA blockers.
   6 LEGISLATIVE ASKS:
   Ask #1: IIRIRA §237 repeal — eliminate retroactive deportation, grandfather clause for 2013–2024 deportees.
   Ask #2: DCAS audit — mandatory reclassification of ~1,960 misclassified Hispanic casualties.
   Ask #3: BISG validation — federal recognition of τ=0.40 forensic demographic standard.
   Ask #4: VA-ICE mandate — automatic veteran detection in ICE custody within 24 hours, legal hold + VA liaison.
   Ask #5: FOIA escalation — Congressional pressure + GAO subpoena authority for F001/F002.
   Ask #6: $2M research funding — veteran deportation prevention, crisis shelters, legal aid (FY2027 appropriations rider).

8. KEY STATISTICS:
   - 115,000: Non-citizen veterans at risk in US. 10,000+: Deported Jan–Jun 2025. 94,000+: Total estimated deported veterans. 92: GAO-confirmed (2013–2018). 6.6×: Minimum undercount factor.
   - ICE Records (Parquet DB): 713,464 FY2022–Sept 2026. Vietnam cohort in system: 970 (769 deported). Veteran flags in ICE database: ZERO.
   - PTSD-probable deported: 69,881–81,090. Without criminal charge: 27,622.
   - Manuscript: "SGT George Ramos: The Mathematics of Vietnam" — 245,216 words, 44 chapters, Rev.92.

9. DATABASE ECOSYSTEM — 30+ SOURCES:
   US: ICE ERO Statistics, Deportation Data Project (deportationdata.org — 7 datasets, individual-level through Mar 2026), TRAC ICE Removals, DHS OHSS Monthly, EOIR immigration courts, VA BIRLS, USCIS CLAIMS4, SSS RG-147, Census PUMS, GAO-19-416, CRS R48163.
   MEXICO: SEGOB UPM Boletines (politicamigratoria.gob.mx), INM Portal, OIM México, SRE Acervo Histórico Diplomático, SEDENA Regional files, CNDH Estancias, UNAM Hemeroteca Nacional, BBVA Shelter Map.
   SHELTERS: Casa del Migrante (Tijuana/Juárez/Tapachula), UNHCR Mexico, Endisolation (TJ/Mexicali), OIM/ACNUR Tijuana, MANOS Oaxaca, NNIRR.

Be precise, cite specific data points, suggest next investigative steps, help draft FOIA appeals and CHC correspondence, analyze database query strategies, and assist with the forensic audit methodology. Always tie answers back to the DCAS anomaly, NERO model, or CHC briefing relevance. Format responses with clear sections when answering complex questions.`;

const CATEGORIES = [
  { id: "dcas", icon: "💀", label: "DCAS Audit", desc: "Hispanic casualty forensics, undercount analysis, 5-stream convergence" },
  { id: "bisg", icon: "🧮", label: "BISG Methods", desc: "Demographic classification τ=0.40, surname probability modeling, validation" },
  { id: "chc", icon: "🏛️", label: "CHC Brief", desc: "Congressional Hispanic Caucus briefing prep, May 18 deadline, 6 asks" },
  { id: "foia", icon: "📋", label: "FOIA Status", desc: "Request tracking, overdue alerts, agency escalation, legal nexus" },
  { id: "cases", icon: "🎖️", label: "6 Cases", desc: "CB-HSIVF verified cases, case details, evidence chain, status tracking" },
  { id: "databases", icon: "🗄️", label: "30+ DBs", desc: "ICE ODLS, EOIR courts, deportation data, Mexico shelter network, USCIS" },
  { id: "law", icon: "⚖️", label: "IIRIRA Law", desc: "INA §329 wartime naturalization, IIRIRA §237 retroactive grounds, precedent" },
  { id: "letters", icon: "✍️", label: "Draft Letters", desc: "CHC inquiry letters, Congressional requests, GAO coordination, agency contacts" },
];

const PROMPTS_BY_CATEGORY = {
  dcas: [
    { q: "What is the DCAS undercount factor?", key: "dcas_undercount" },
    { q: "How does BISG τ=0.40 validate DCAS?", key: "dcas_bisg_validation" },
    { q: "5-Stream Convergence — all streams explained", key: "dcas_5stream" },
    { q: "State-level Hispanic casualty variance analysis", key: "dcas_state_variance" },
    { q: "Why is official count 349 vs forensic 2,309+?", key: "dcas_84_percent_failure" },
  ],
  bisg: [
    { q: "BISG methodology explained", key: "bisg_methodology" },
    { q: "Why τ=0.40 for veterans?", key: "bisg_threshold_rationale" },
    { q: "Sensitivity analysis — τ thresholds", key: "bisg_sensitivity" },
    { q: "BISG vs manual surname review", key: "bisg_validation" },
    { q: "R² = 0.947 — what does this mean?", key: "bisg_r_squared" },
  ],
  chc: [
    { q: "CHC briefing — 6 legislative asks", key: "chc_6_asks" },
    { q: "May 18 timeline — days remaining", key: "chc_countdown" },
    { q: "CHC evidence package checklist", key: "chc_package_checklist" },
    { q: "Draft CHC briefing summary", key: "chc_draft_summary" },
    { q: "CHC priority witness list", key: "chc_witnesses" },
  ],
  foia: [
    { q: "F001 VA BIRLS request status", key: "foia_f001_status" },
    { q: "F002 ICE ENFORCE request status", key: "foia_f002_status" },
    { q: "Overdue FOIAs — escalation strategy", key: "foia_overdue_escalation" },
    { q: "FOIA nexus — which docs link to which cases", key: "foia_case_nexus" },
    { q: "Congressional inquiry letter template", key: "foia_cong_inquiry" },
  ],
  cases: [
    { q: "C001 Valente Valenzuela — full case timeline", key: "case_ramos_timeline" },
    { q: "C002/C003 Valenzuela brothers — IIRIRA retroactive analysis", key: "case_valenzuelas_iirira" },
    { q: "C004 Sae Joon Park — CRITICAL active case, self-deportation", key: "case_park_critical" },
    { q: "C005 Miguel Segura — current location, FOIA pending", key: "case_segura_status" },
    { q: "C006 J. Duran — Colombia-based, evidence gaps", key: "case_duran_colombia" },
    { q: "All 6 cases — comparative risk matrix", key: "cases_all_comparison" },
  ],
  databases: [
    { q: "ICE Online Detainee Locator (ODLS) — how to use", key: "db_odls" },
    { q: "Deportation Data Project — all 7 datasets explained", key: "db_deport_data_project" },
    { q: "EOIR immigration court database — judge-level analysis", key: "db_eoir" },
    { q: "México — SJM, Grupos Beta, RNPDNO contacts", key: "db_mexico_network" },
    { q: "All 30+ databases — master reference list", key: "db_all_master_list" },
  ],
  law: [
    { q: "INA §329 — wartime naturalization eligibility", key: "law_ina_329" },
    { q: "IIRIRA §237 — retroactive deportation grounds explained", key: "law_iirira_237" },
    { q: "SCRA protections — service member access", key: "law_scra" },
    { q: "Habeas corpus strategy for deported veterans", key: "law_habeas" },
    { q: "Legal precedent — deported veterans case law", key: "law_precedent" },
  ],
  letters: [
    { q: "Draft CHC inquiry letter template", key: "letter_chc_inquiry" },
    { q: "Congressional request to USCIS — INA §329 policy", key: "letter_congress_uscis" },
    { q: "GAO coordination letter", key: "letter_gao" },
    { q: "VA data request — BIRLS access", key: "letter_va_birls" },
    { q: "DHS FOIA escalation — Congressional intervention", key: "letter_dhs_foia" },
  ],
};

const ANALYSIS_MODES = [
  { id: "quick", icon: "⚡", label: "Quick Insight", desc: "Concise summary" },
  { id: "deep", icon: "🧠", label: "Deep Analysis", desc: "Full detail" },
  { id: "research", icon: "🔬", label: "Full Research", desc: "Exhaustive + citations" },
];

const MODE_CONTEXT = {
  quick: "Provide a concise, precise summary in 3–5 sentences. Focus on the most critical data points and immediate actionability.",
  deep: "Provide a detailed analysis with specific statistics, methodology, and implications. Include actionable next steps. Use headers for clarity.",
  research: "Provide an exhaustive, citation-rich analysis suitable for academic or Congressional use. Include all relevant statistics, legal references, database sources, and multi-step recommendations. Format with clear sections and sub-sections.",
};

function PromptCard({ prompt, onSelect, loading }) {
  return (
    <div
      onClick={() => !loading && onSelect(prompt)}
      style={{
        background: P.card,
        border: `1px solid ${P.b}20`,
        borderRadius: 8,
        padding: "10px 12px",
        cursor: loading ? "not-allowed" : "pointer",
        transition: "all .15s",
        opacity: loading ? 0.6 : 1,
      }}
    >
      <div style={{ fontSize: 8, color: P.t1, fontWeight: 700, lineHeight: 1.4 }}>
        {prompt.q}
      </div>
    </div>
  );
}

export default function TE360Assistant({ setTab }) {
  const [activeCategory, setActiveCategory] = useState("dcas");
  const [activeMode, setActiveMode] = useState("deep");
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customQuery, setCustomQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [saved, setSaved] = useState(false);
  const [savingDoc, setSavingDoc] = useState(false);
  const responseRef = useRef(null);

  const category = CATEGORIES.find((c) => c.id === activeCategory);
  const prompts = PROMPTS_BY_CATEGORY[activeCategory] || [];

  useEffect(() => {
    if (response && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [response]);

  const buildPrompt = (question, mode) => {
    const modeInstr = MODE_CONTEXT[mode];
    return `${modeInstr}

ANALYST QUERY: ${question}

Category context: ${category?.label} — ${category?.desc}

Respond in the context of the AUMER Foundation's TruthEngine360 forensic investigation. Be specific with numbers, cite sources from the knowledge base, and connect findings to the CHC briefing or NERO model where relevant.`;
  };

  const handleAnalyze = async (prompt, mode, customQ) => {
    const question = customQ || prompt?.q || "";
    if (!question.trim()) return;

    setSelectedPrompt(prompt || { q: question, key: "custom" });
    setLoading(true);
    setResponse(null);
    setError(null);
    setSaved(false);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: buildPrompt(question, mode),
        add_context_from_previous_messages: true,
        system_prompt: TE360_SYSTEM_PROMPT,
      });

      const text = typeof result === "string" ? result : result?.text || result?.content || JSON.stringify(result);
      setResponse(text);
      setHistory((h) => [
        { q: question, mode, answer: text, cat: activeCategory, ts: new Date().toLocaleTimeString() },
        ...h.slice(0, 9),
      ]);
    } catch (err) {
      setError(err?.message || "AI analysis failed. Check Base44 connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToResearchDoc = async () => {
    if (!response || !selectedPrompt) return;
    setSavingDoc(true);
    try {
      await base44.entities.ResearchDoc.create({
        title: selectedPrompt.q,
        summarized_abstract: response.slice(0, 600),
        applications: `TE360 AI Analysis · ${activeCategory.toUpperCase()} · Mode: ${activeMode}`,
        cluster_tags: `te360,${activeCategory},ai-analysis`,
        source_url: "",
      });
      setSaved(true);
    } catch {
      // silently skip if entity unavailable
    } finally {
      setSavingDoc(false);
    }
  };

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1, padding: "14px 20px", overflowY: "auto", height: "calc(100vh - 118px)" }}>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
              🔍 TruthEngine360 <span style={{ color: P.gold }}>Research Assistant</span>
              <span style={{ marginLeft: 8, fontSize: 7, background: `${P.teal}20`, color: P.teal, border: `1px solid ${P.teal}40`, borderRadius: 4, padding: "2px 6px", fontWeight: 700 }}>
                CLAUDE AI · LIVE
              </span>
            </div>
            <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginTop: 2 }}>
              DCAS FORENSICS · BISG METHODOLOGY · NERO SCORES · FOIA TRACKING · 6 VERIFIED CASES · 30+ DATABASES
            </div>
          </div>
          {history.length > 0 && (
            <div style={{ fontSize: 7, color: P.t4 }}>
              {history.length} query{history.length > 1 ? "s" : ""} this session
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 14 }}>
        {/* Left sidebar — category selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setSelectedPrompt(null);
                setResponse(null);
                setError(null);
                setCustomQuery("");
              }}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                padding: "10px 12px",
                background: activeCategory === cat.id ? `${P.gold}20` : P.card,
                border: `1px solid ${activeCategory === cat.id ? P.gold : P.b}`,
                borderRadius: 8,
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              <span style={{ fontSize: 16 }}>{cat.icon}</span>
              <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 8, fontWeight: 800, color: activeCategory === cat.id ? P.gold : P.t1 }}>{cat.label}</div>
                <div style={{ fontSize: 6, color: P.t4, marginTop: 2, lineHeight: 1.3 }}>{cat.desc}</div>
              </div>
            </button>
          ))}

          {/* Session history */}
          {history.length > 0 && (
            <div style={{ marginTop: 8, background: "#080D18", border: `1px solid ${P.b}`, borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 7, color: P.t4, fontWeight: 800, letterSpacing: 1, marginBottom: 6 }}>RECENT QUERIES</div>
              {history.slice(0, 4).map((h, i) => (
                <div
                  key={i}
                  onClick={() => { setResponse(h.answer); setSelectedPrompt({ q: h.q }); setActiveCategory(h.cat); }}
                  style={{ fontSize: 6, color: P.t4, padding: "4px 0", borderTop: i > 0 ? `1px solid ${P.b}20` : "none", cursor: "pointer", lineHeight: 1.4 }}
                >
                  <span style={{ color: P.gold }}>{h.ts}</span> · {h.q.slice(0, 42)}…
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right side — prompts + response */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Category header + mode selector */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>{category?.icon}</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: P.t1 }}>{category?.label}</div>
                <div style={{ fontSize: 7, color: P.t4, marginTop: 2 }}>{category?.desc}</div>
              </div>
            </div>

            {/* Custom query input */}
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <input
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customQuery.trim()) handleAnalyze(null, activeMode, customQuery);
                }}
                placeholder={`Ask anything about ${category?.label}…`}
                style={{
                  flex: 1, fontFamily: "'IBM Plex Mono',monospace", fontSize: 8,
                  background: "#080D18", border: `1px solid ${P.b}`, borderRadius: 6,
                  padding: "6px 10px", color: P.t1, outline: "none",
                }}
              />
              <button
                onClick={() => customQuery.trim() && handleAnalyze(null, activeMode, customQuery)}
                disabled={!customQuery.trim() || loading}
                style={{
                  padding: "6px 14px", fontSize: 7, fontWeight: 800, cursor: "pointer",
                  background: `${P.gold}20`, border: `1px solid ${P.gold}`, color: P.gold,
                  borderRadius: 6, fontFamily: "inherit", opacity: !customQuery.trim() || loading ? 0.5 : 1,
                }}
              >
                Ask AI →
              </button>
            </div>

            {/* Analysis mode selector */}
            <div style={{ display: "flex", gap: 6 }}>
              {ANALYSIS_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  style={{
                    flex: 1, padding: "6px 10px",
                    background: activeMode === mode.id ? `${P.gold}15` : "#080D18",
                    border: `1px solid ${activeMode === mode.id ? P.gold : P.b}`,
                    color: activeMode === mode.id ? P.gold : P.t4,
                    fontSize: 7, fontWeight: activeMode === mode.id ? 800 : 400,
                    borderRadius: 6, cursor: "pointer",
                  }}
                >
                  {mode.icon} {mode.label}
                  <div style={{ fontSize: 6, opacity: 0.7 }}>{mode.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Prompts grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
            {prompts.map((p, i) => (
              <PromptCard key={i} prompt={p} onSelect={(pr) => handleAnalyze(pr, activeMode)} loading={loading} />
            ))}
          </div>

          {/* Response panel */}
          {(selectedPrompt || loading) && (
            <div ref={responseRef} style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: P.t1 }}>
                    {loading ? "⟳ Claude AI Analyzing…" : "✦ AI Research Response"}
                  </div>
                  <div style={{ fontSize: 7, color: P.t4, marginTop: 2 }}>{selectedPrompt?.q}</div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 6, color: P.gold, background: `${P.gold}12`, border: `1px solid ${P.gold}30`, borderRadius: 3, padding: "1px 5px" }}>
                    {activeMode.toUpperCase()} MODE
                  </span>
                  <button
                    onClick={() => { setResponse(null); setSelectedPrompt(null); setError(null); }}
                    style={{ padding: "3px 8px", fontSize: 7, cursor: "pointer", background: "#080D18", border: `1px solid ${P.b}`, color: P.t4, borderRadius: 6 }}
                  >
                    ✕ Clear
                  </button>
                </div>
              </div>

              {loading && (
                <div style={{ padding: "28px 0", textAlign: "center" }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>🧠</div>
                  <div style={{ fontSize: 8, color: P.t4 }}>Claude AI processing forensic analysis…</div>
                  <div style={{ marginTop: 8, display: "flex", justifyContent: "center", gap: 4 }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: P.gold, animation: `pulse 1.2s ease-in-out ${i * 0.3}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div style={{ padding: "12px", background: `${P.red}10`, border: `1px solid ${P.red}30`, borderRadius: 7, fontSize: 8, color: P.red }}>
                  ⚠ {error}
                </div>
              )}

              {response && !loading && (
                <>
                  <div style={{ fontSize: 8, color: P.t2, lineHeight: 1.8, whiteSpace: "pre-wrap", maxHeight: 500, overflowY: "auto" }}>
                    {response}
                  </div>

                  <div style={{ marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button
                      onClick={() => navigator.clipboard.writeText(`${selectedPrompt?.q}\n\n${response}`)}
                      style={{ flex: 1, padding: "6px 10px", fontSize: 7, fontWeight: 700, cursor: "pointer", background: `${P.blue}12`, border: `1px solid ${P.blue}25`, color: P.blue, borderRadius: 6 }}
                    >
                      📋 Copy
                    </button>
                    <button
                      onClick={handleSaveToResearchDoc}
                      disabled={savingDoc || saved}
                      style={{ flex: 1, padding: "6px 10px", fontSize: 7, fontWeight: 700, cursor: savingDoc || saved ? "default" : "pointer", background: saved ? `${P.teal}20` : `${P.teal}10`, border: `1px solid ${P.teal}25`, color: saved ? P.teal : P.t4, borderRadius: 6, opacity: savingDoc ? 0.6 : 1 }}
                    >
                      {saved ? "✓ Saved to ResearchDoc" : savingDoc ? "Saving…" : "💾 Save to KB"}
                    </button>
                    <button
                      onClick={() => { setSelectedPrompt(null); setResponse(null); setError(null); setCustomQuery(""); }}
                      style={{ flex: 1, padding: "6px 10px", fontSize: 7, fontWeight: 700, cursor: "pointer", background: `${P.violet}10`, border: `1px solid ${P.violet}25`, color: P.violet, borderRadius: 6 }}
                    >
                      → New Query
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
