import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { P, CASES } from "../../lib/teData";

const RISK_FACTORS = [
  { id: "iirira", label: "IIRIRA Conviction (aggravated felony)", weight: 35, category: "Legal" },
  { id: "noncitizen", label: "Non-Citizen at Time of Service", weight: 25, category: "Status" },
  { id: "no_nat", label: "Naturalization Never Completed", weight: 20, category: "Status" },
  { id: "order_removal", label: "Final Order of Removal on File", weight: 30, category: "Legal" },
  { id: "detainer", label: "ICE Detainer Issued", weight: 28, category: "Enforcement" },
  { id: "no_legal", label: "No Active Legal Representation", weight: 15, category: "Support" },
  { id: "no_va", label: "VA Benefits Denied/Discontinued", weight: 12, category: "Support" },
  { id: "country_conflict", label: "Country of Birth in Active Conflict Zone", weight: 8, category: "Context" },
  { id: "family_sep", label: "US Citizen Dependents (family separation)", weight: -10, category: "Mitigation" },
  { id: "awards", label: "Combat Awards / Commendations on Record", weight: -12, category: "Mitigation" },
  { id: "gold_star", label: "Gold Star Family / MOH Connection", weight: -20, category: "Mitigation" },
  { id: "congress_supp", label: "Congressional Sponsor / Letter of Support", weight: -15, category: "Mitigation" },
  { id: "lulac", label: "LULAC / Advocacy Org. Active on Case", weight: -8, category: "Mitigation" },
  { id: "appeal_pending", label: "Active Appeal / Stay of Removal", weight: -25, category: "Legal" },
  { id: "ptsd", label: "Combat PTSD / Service-Connected Disability", weight: -5, category: "Mitigation" },
];

const CAT_C = {
  Legal: P.red, Status: P.amber, Enforcement: P.red, Support: P.violet,
  Context: P.blue, Mitigation: P.teal,
};

const RISK_BANDS = [
  { min: 80, label: "CRITICAL", color: P.red, desc: "Imminent deportation risk. Emergency legal intervention required." },
  { min: 60, label: "HIGH", color: P.amber, desc: "Elevated risk. Priority case for legal review and congressional inquiry." },
  { min: 40, label: "MODERATE", color: P.gold, desc: "Moderate risk. Active monitoring and documentation recommended." },
  { min: 20, label: "LOW", label2: "ELEVATED", color: "#4A9EFF", desc: "Below average risk. Maintain file, periodic check-ins." },
  { min: 0, label: "MINIMAL", color: P.teal, desc: "Minimal deportation risk at this time. Continue documentation." },
];

function getRiskBand(score) {
  return RISK_BANDS.find(b => score >= b.min) || RISK_BANDS[RISK_BANDS.length - 1];
}

function calcScore(checked) {
  const raw = RISK_FACTORS.filter(f => checked.has(f.id)).reduce((a, f) => a + f.weight, 0);
  return Math.max(0, Math.min(100, raw));
}

function GaugeArc({ score, color }) {
  const r = 70, cx = 90, cy = 90;
  const angleRange = Math.PI; // 180 deg arc
  const angle = (score / 100) * angleRange;
  const startX = cx - r, startY = cy;
  const endX = cx + Math.cos(Math.PI - angle) * r;
  const endY = cy - Math.sin(angle) * r;
  const needleX = cx + Math.cos(Math.PI - angle) * (r - 12);
  const needleY = cy - Math.sin(angle) * (r - 12);

  const bgPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const fgPath = score > 0
    ? `M ${cx - r} ${cy} A ${r} ${r} 0 ${angle > Math.PI / 2 ? 1 : 0} 1 ${endX} ${endY}`
    : "";

  return (
    <svg width={180} height={100} style={{ overflow: "visible" }}>
      <path d={bgPath} fill="none" stroke="#1A2640" strokeWidth={14} strokeLinecap="round" />
      {fgPath && <path d={fgPath} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" opacity={0.85} />}
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={5} fill={color} />
      <text x={cx} y={cy + 18} textAnchor="middle" fill={color} fontSize={22} fontWeight={800} fontFamily="IBM Plex Mono">{score}</text>
      <text x={cx - r + 2} y={cy + 14} fill={P.t4} fontSize={7} fontFamily="IBM Plex Mono">0</text>
      <text x={cx + r - 8} y={cy + 14} fill={P.t4} fontSize={7} fontFamily="IBM Plex Mono">100</text>
    </svg>
  );
}

export default function InteractiveRiskEngine() {
  const [checked, setChecked] = useState(new Set());
  const [score, setScore] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [caseName, setCaseName] = useState("");
  const [history, setHistory] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [catFilter, setCatFilter] = useState("All");

  useEffect(() => { setScore(calcScore(checked)); }, [checked]);

  const toggle = (id) => {
    setChecked(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const loadCase = (c) => {
    setActiveCase(c.id);
    setCaseName(c.name);
    // Pre-load likely factors based on case
    const pre = new Set(["noncitizen"]);
    if (c.id === "C004") pre.add("no_nat").add("order_removal").add("iirira");
    if (c.id === "C001") pre.add("gold_star").add("awards").add("congress_supp");
    if (c.id === "C002" || c.id === "C003") pre.add("order_removal").add("no_legal");
    setChecked(pre);
  };

  const runAiAnalysis = async () => {
    const activeFactors = RISK_FACTORS.filter(f => checked.has(f.id));
    const band = getRiskBand(score);
    setAnalyzing(true);
    setAiAnalysis(null);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a forensic immigration attorney specializing in deported US military veteran cases. Analyze this case risk profile:
      
Case Name: ${caseName || "Anonymous Veteran"}
Deportation Risk Score: ${score}/100 (${band.label})
Active Risk Factors: ${activeFactors.map(f => f.label).join("; ")}

Provide a professional legal risk assessment including:
1. Primary legal vulnerabilities
2. Strongest mitigation arguments
3. Recommended immediate actions (prioritized)
4. Congressional inquiry potential
5. Estimated timeline to address
6. Similar precedent cases

Be specific, actionable, and focus on the CB-HSIVF framework (Congressional Briefing - Hispanic Service-member Immigration Veteran Framework).`,
      response_json_schema: {
        type: "object",
        properties: {
          risk_summary: { type: "string" },
          vulnerabilities: { type: "array", items: { type: "string" } },
          mitigations: { type: "array", items: { type: "string" } },
          immediate_actions: { type: "array", items: { type: "string" } },
          congressional_angle: { type: "string" },
          timeline: { type: "string" },
          precedents: { type: "array", items: { type: "string" } }
        }
      }
    });
    const entry = { caseName: caseName || "Case", score, band: band.label, result, ts: new Date().toISOString() };
    setHistory(prev => [entry, ...prev.slice(0, 9)]);
    setAiAnalysis(result);
    setAnalyzing(false);
  };

  const band = getRiskBand(score);
  const cats = ["All", ...new Set(RISK_FACTORS.map(f => f.category))];
  const filtered = catFilter === "All" ? RISK_FACTORS : RISK_FACTORS.filter(f => f.category === catFilter);
  const positiveScore = RISK_FACTORS.filter(f => checked.has(f.id) && f.weight > 0).reduce((a, f) => a + f.weight, 0);
  const mitigationScore = Math.abs(RISK_FACTORS.filter(f => checked.has(f.id) && f.weight < 0).reduce((a, f) => a + f.weight, 0));

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>⚡ Interactive <span style={{ color: P.amber }}>Risk Engine</span></div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>DEPORTATION RISK ASSESSMENT · CB-HSIVF FRAMEWORK · AI-POWERED LEGAL ANALYSIS</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 12 }}>
        {/* Left: Factor checklist */}
        <div>
          {/* Quick load cases */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "10px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 6 }}>⚡ QUICK LOAD CASE</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {CASES.map(c => (
                <button key={c.id} onClick={() => loadCase(c)}
                  style={{ padding: "4px 10px", fontSize: 7, background: activeCase === c.id ? `${P.gold}18` : "transparent",
                    border: `1px solid ${activeCase === c.id ? P.gold : P.b}`,
                    color: activeCase === c.id ? P.gold : P.t4, borderRadius: 20, cursor: "pointer" }}>
                  {c.id} {c.name.split(" ")[0]}
                </button>
              ))}
              <button onClick={() => { setChecked(new Set()); setCaseName(""); setActiveCase(null); }}
                style={{ padding: "4px 10px", fontSize: 7, background: "transparent", border: `1px solid ${P.b}`, color: P.t4, borderRadius: 20, cursor: "pointer" }}>
                ✕ Clear
              </button>
            </div>
          </div>

          {/* Case name */}
          <div style={{ marginBottom: 8 }}>
            <input value={caseName} onChange={e => setCaseName(e.target.value)} placeholder="Case name / identifier..."
              style={{ width: "100%", padding: "8px 12px", background: "#080D18", border: `1px solid ${P.b}`,
                borderRadius: 8, color: P.t1, fontSize: 8, fontFamily: "'IBM Plex Mono',monospace", outline: "none", boxSizing: "border-box" }} />
          </div>

          {/* Category filter */}
          <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
            {cats.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                style={{ padding: "3px 9px", fontSize: 7, background: catFilter === c ? `${CAT_C[c] || P.violet}18` : "transparent",
                  border: `1px solid ${catFilter === c ? CAT_C[c] || P.violet : P.b}`,
                  color: catFilter === c ? CAT_C[c] || P.violet : P.t4, borderRadius: 20, cursor: "pointer" }}>
                {c}
              </button>
            ))}
          </div>

          {/* Factor list */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "10px 14px" }}>
            {filtered.map(f => {
              const isChecked = checked.has(f.id);
              const cc = CAT_C[f.category] || P.t4;
              const isNeg = f.weight < 0;
              return (
                <div key={f.id} onClick={() => toggle(f.id)}
                  style={{ display: "flex", gap: 8, alignItems: "center", padding: "7px 8px", borderRadius: 7,
                    background: isChecked ? (isNeg ? `${P.teal}08` : `${P.red}06`) : "transparent",
                    border: `1px solid ${isChecked ? (isNeg ? P.teal : P.red) + "25" : "transparent"}`,
                    cursor: "pointer", marginBottom: 4 }}>
                  <span style={{ fontSize: 9, color: isChecked ? (isNeg ? P.teal : P.red) : P.t4 }}>{isChecked ? "☑" : "☐"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 8, color: isChecked ? P.t1 : P.t3 }}>{f.label}</div>
                    <div style={{ fontSize: 6, color: cc }}>{f.category}</div>
                  </div>
                  <span style={{ fontSize: 8, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 800,
                    color: isNeg ? P.teal : P.red }}>
                    {isNeg ? "" : "+"}{f.weight}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Score panel + AI */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Gauge */}
          <div style={{ background: P.card, border: `2px solid ${band.color}30`, borderRadius: 12, padding: "16px", textAlign: "center" }}>
            <GaugeArc score={score} color={band.color} />
            <div style={{ fontSize: 16, fontWeight: 800, color: band.color, marginTop: 4 }}>{band.label}</div>
            <div style={{ fontSize: 8, color: P.t3, marginTop: 4, lineHeight: 1.5 }}>{band.desc}</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 12 }}>
              <div style={{ background: `${P.red}10`, border: `1px solid ${P.red}20`, borderRadius: 7, padding: "6px" }}>
                <div style={{ fontSize: 6, color: P.t4 }}>Risk Factors</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: P.red, fontFamily: "'IBM Plex Mono',monospace" }}>+{positiveScore}</div>
              </div>
              <div style={{ background: `${P.teal}10`, border: `1px solid ${P.teal}20`, borderRadius: 7, padding: "6px" }}>
                <div style={{ fontSize: 6, color: P.t4 }}>Mitigation</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: P.teal, fontFamily: "'IBM Plex Mono',monospace" }}>-{mitigationScore}</div>
              </div>
            </div>

            {/* Factor breakdown bars */}
            <div style={{ marginTop: 10, textAlign: "left" }}>
              {["Legal", "Status", "Enforcement", "Support", "Mitigation"].map(cat => {
                const catScore = Math.abs(RISK_FACTORS.filter(f => f.category === cat && checked.has(f.id)).reduce((a, f) => a + f.weight, 0));
                const maxCat = RISK_FACTORS.filter(f => f.category === cat).reduce((a, f) => a + Math.abs(f.weight), 0);
                if (!maxCat) return null;
                return (
                  <div key={cat} style={{ marginBottom: 5 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 6, color: CAT_C[cat] || P.t4 }}>{cat}</span>
                      <span style={{ fontSize: 6, color: P.t4, fontFamily: "'IBM Plex Mono',monospace" }}>{catScore}/{maxCat}</span>
                    </div>
                    <div style={{ background: "#080D18", borderRadius: 3, height: 4 }}>
                      <div style={{ width: `${(catScore / maxCat) * 100}%`, height: "100%", borderRadius: 3, background: CAT_C[cat] || P.t4 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Analysis */}
          <div style={{ background: P.card, border: `1px solid ${P.violet}30`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.violet, marginBottom: 8 }}>🤖 AI Legal Analysis</div>
            <button onClick={runAiAnalysis} disabled={analyzing || checked.size === 0}
              style={{ width: "100%", padding: "9px", background: analyzing ? `${P.amber}12` : `${P.violet}18`,
                border: `1px solid ${analyzing ? P.amber : P.violet}40`,
                color: analyzing ? P.amber : P.violet, borderRadius: 8, fontSize: 8, cursor: analyzing || checked.size === 0 ? "default" : "pointer",
                fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace", marginBottom: 8 }}>
              {analyzing ? "⟳ Analyzing…" : checked.size === 0 ? "Select factors above" : "▶ Run AI Risk Analysis"}
            </button>
            {aiAnalysis && (
              <div style={{ fontSize: 7, maxHeight: 320, overflowY: "auto" }}>
                <div style={{ color: P.t2, lineHeight: 1.6, marginBottom: 8 }}>{aiAnalysis.risk_summary}</div>
                {[
                  ["⚠ Vulnerabilities", aiAnalysis.vulnerabilities, P.red],
                  ["✓ Mitigations", aiAnalysis.mitigations, P.teal],
                  ["🎯 Immediate Actions", aiAnalysis.immediate_actions, P.gold],
                ].map(([title, items, c]) => items?.length ? (
                  <div key={title} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 6, color: c, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>{title}</div>
                    {items.map((item, i) => (
                      <div key={i} style={{ color: P.t3, paddingLeft: 8, marginBottom: 2 }}>→ {item}</div>
                    ))}
                  </div>
                ) : null)}
                {aiAnalysis.congressional_angle && (
                  <div style={{ background: `${P.blue}08`, border: `1px solid ${P.blue}20`, borderRadius: 7, padding: "6px 8px", marginBottom: 6 }}>
                    <div style={{ fontSize: 6, color: P.blue, fontWeight: 700, marginBottom: 2 }}>🏛️ CONGRESSIONAL</div>
                    <div style={{ color: P.t3 }}>{aiAnalysis.congressional_angle}</div>
                  </div>
                )}
                {aiAnalysis.timeline && (
                  <div style={{ fontSize: 6, color: P.amber }}>⏱ {aiAnalysis.timeline}</div>
                )}
              </div>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "10px 14px" }}>
              <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 6 }}>🕐 ANALYSIS HISTORY</div>
              {history.slice(0, 5).map((h, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${P.b}20` }}>
                  <span style={{ fontSize: 7, color: P.t2 }}>{h.caseName}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ fontSize: 7, fontFamily: "'IBM Plex Mono',monospace", color: getRiskBand(h.score).color }}>{h.score}/100</span>
                    <span style={{ fontSize: 6, color: P.t4 }}>{new Date(h.ts).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}