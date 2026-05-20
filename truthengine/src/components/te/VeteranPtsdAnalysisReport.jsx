import { useState } from "react";
import { P } from "../../lib/teData";

export default function VeteranPtsdAnalysisReport() {
  const [tab, setTab] = useState("overview");
  const [n, setN] = useState(3000);
  const [alpha, setAlpha] = useState(0.05);
  const [power, setPower] = useState(0.80);
  const [effect, setEffect] = useState(0.20);
  const [prev, setPrev] = useState(0.27);
  const [attrition, setAttrition] = useState(0.10);
  const [waves, setWaves] = useState(4);

  const normCdf = (x) => {
    const a = Math.abs(x), b = 1 / (1 + 0.2316419 * a);
    const poly = b * (0.319381530 + b * (-0.356563782 + b * (1.781477937 + b * (-1.821255978 + b * 1.330274429))));
    const p = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * a * a) * poly;
    return x < 0 ? 1 - p : p;
  };

  const zFromAlpha = (a) => {
    const lut = { 0.10: 1.645, 0.05: 1.96, 0.025: 2.24, 0.02: 2.326, 0.01: 2.576 };
    const k = Math.round(a * 1000) / 1000;
    return lut[k] || (a <= 0.01 ? 2.576 : a <= 0.05 ? 1.96 : 1.645);
  };

  const waveNs = [];
  for (let i = 0; i < waves; i++) waveNs.push(Math.round(n * Math.pow(1 - attrition, i)));
  const finalN = waveNs[waveNs.length - 1];
  const cases = Math.round(finalN * prev);
  const za = zFromAlpha(alpha);
  const approxPow = Math.min(0.999, Math.max(0.05, normCdf(Math.sqrt(finalN) * effect - za)));
  const mde = ((za + 0.842) / Math.sqrt(finalN)).toFixed(3);

  const inp = {
    padding: "7px 10px", background: "#080D18", border: `1px solid ${P.b}`,
    borderRadius: 6, color: P.t1, fontSize: 9, fontFamily: "'IBM Plex Mono',monospace", outline: "none",
  };

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1, background: P.bg, minHeight: "100vh", paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,#050D15 0%,#0D1B2A 60%,#0A2030 100%)`, borderBottom: `1px solid ${P.b}30`, padding: "28px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: P.gold, margin: 0, lineHeight: 1 }}>
              Vietnam Veteran Cohort Analysis
            </h1>
            <p style={{ fontSize: 9, color: P.t3, marginTop: 6 }}>
              AUMER Foundation · TruthEngine360 · N = 3,000 · PTSD / Wounded / Hispanic Probability
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["N = 3,000", "6 Tests Run", "2 Sig. Predictors", "Simulated Cohort"].map(b => (
              <span key={b} style={{ fontSize: 7, padding: "5px 12px", borderRadius: 4, background: `${P.gold}15`, border: `1px solid ${P.gold}`, color: P.gold, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", gap: 0, background: P.card, borderBottom: `1px solid ${P.b}`, overflowX: "auto", padding: "0 20px" }}>
        {["overview", "power", "tests", "forest", "syntax", "missing", "dcas"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: "12px 18px", border: "none", background: "none", color: tab === t ? P.gold : P.t3, cursor: "pointer",
              borderBottom: tab === t ? `2px solid ${P.gold}` : "2px solid transparent", fontSize: 9, fontWeight: 700, transition: "all .2s",
            }}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "20px 40px", maxWidth: 1400, margin: "0 auto" }}>
        {/* OVERVIEW */}
        {tab === "overview" && (
          <div>
            <div style={{ marginBottom: 20, fontSize: 9, fontWeight: 800, color: P.gold, letterSpacing: "0.22em", textTransform: "uppercase" }}>
              POPULATION SUMMARY · N = 3,000
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 20 }}>
              {[
                { l: "Total Cohort", v: "3,000", c: P.gold },
                { l: "PTSD Rate", v: "27.0%", c: P.teal },
                { l: "Wounded Rate", v: "13.3%", c: P.amber },
                { l: "Mine Exposure", v: "20.7%", c: P.red },
                { l: "Post-Tet", v: "54.5%", c: P.gold },
                { l: "Hisp Prob ≥ 0.30", v: "15.7%", c: P.teal },
              ].map((s, i) => (
                <div key={i} style={{ background: P.card, border: `1px solid ${s.c}25`, borderLeft: `3px solid ${s.c}`, borderRadius: 7, padding: "12px 14px" }}>
                  <div style={{ fontSize: 7, color: P.t4, marginBottom: 3 }}>{s.l}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.c }}>{s.v}</div>
                </div>
              ))}
            </div>
            <div style={{ background: P.card2, border: `1px solid ${P.teal}30`, borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: P.teal, marginBottom: 8 }}>Key Findings</div>
              <ul style={{ fontSize: 8, color: P.t3, lineHeight: 1.7, margin: 0, paddingLeft: 16 }}>
                <li><strong style={{ color: P.teal2 }}>Post-Tet Effect:</strong> 28.8% PTSD vs 24.8% pre-Tet (OR=1.225, p=0.016)</li>
                <li><strong style={{ color: P.teal2 }}>I Corps Mine Exposure:</strong> 26.9% vs 17.2% other provinces (OR=1.775, p&lt;0.0001)</li>
                <li><strong style={{ color: P.teal2 }}>High-Risk MOS:</strong> 2.5× higher wounding odds for 11B/combat engineers</li>
                <li><strong style={{ color: P.teal2 }}>Hispanic Probability:</strong> Not significant in simulated cohort (null expected) — real DCAS test awaited</li>
              </ul>
            </div>
          </div>
        )}

        {/* POWER CALCULATOR */}
        {tab === "power" && (
          <div>
            <div style={{ marginBottom: 20, fontSize: 9, fontWeight: 800, color: P.gold, letterSpacing: "0.22em", textTransform: "uppercase" }}>
              LONGITUDINAL COHORT POWER CALCULATOR
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20, marginBottom: 20 }}>
              {/* Inputs */}
              <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 16 }}>
                <h3 style={{ fontSize: 10, fontWeight: 800, color: P.gold, marginBottom: 14 }}>Parameters</h3>
                {[
                  { label: "Starting N", value: n, setter: setN, min: 50, max: 50000 },
                  { label: "Alpha", value: alpha, setter: setAlpha, min: 0.001, max: 0.20, step: 0.001 },
                  { label: "Target Power", value: power, setter: setPower, min: 0.50, max: 0.99, step: 0.01 },
                  { label: "Effect Size (Cohen's d)", value: effect, setter: setEffect, min: 0.01, max: 1.0, step: 0.01 },
                  { label: "Outcome Prevalence", value: prev, setter: setPrev, min: 0.01, max: 0.90, step: 0.01 },
                  { label: "Attrition Per Wave", value: attrition, setter: setAttrition, min: 0, max: 0.80, step: 0.01 },
                  { label: "Number of Waves", value: waves, setter: setWaves, min: 2, max: 12, step: 1 },
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 7, color: P.t4, display: "block", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {f.label}
                    </label>
                    <input type="number" value={f.value} onChange={e => f.setter(+e.target.value)} min={f.min} max={f.max} step={f.step || 1}
                      style={inp} />
                  </div>
                ))}
              </div>

              {/* Results */}
              <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 16 }}>
                <h3 style={{ fontSize: 10, fontWeight: 800, color: P.gold, marginBottom: 14 }}>Results</h3>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 7, color: P.t4, marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                    <span>Approximate Power</span>
                    <span style={{ color: approxPow >= power ? P.teal : P.amber, fontWeight: 700 }}>
                      {(approxPow * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ height: 12, background: "#080D18", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: (approxPow * 100).toFixed(0) + "%",
                      background: approxPow >= power ? P.teal : approxPow >= 0.7 ? P.amber : P.red, transition: "width .3s"
                    }} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(60px,1fr))", gap: 6, marginBottom: 14 }}>
                  {waveNs.map((wn, i) => (
                    <div key={i} style={{ background: "#080D18", border: `1px solid ${P.b}`, borderRadius: 5, padding: "6px 8px", textAlign: "center" }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: P.gold }}>{wn}</div>
                      <div style={{ fontSize: 6, color: P.t4 }}>Wave {i + 1}</div>
                    </div>
                  ))}
                </div>
                <table style={{ width: "100%", fontSize: 8, borderCollapse: "collapse" }}>
                  <tbody>
                    <tr style={{ borderBottom: `1px solid ${P.b}` }}>
                      <td style={{ padding: "6px 0", color: P.t2 }}>Final-wave N</td>
                      <td style={{ textAlign: "right", color: P.t1 }}>{finalN.toLocaleString()}</td>
                    </tr>
                    <tr style={{ borderBottom: `1px solid ${P.b}` }}>
                      <td style={{ padding: "6px 0", color: P.t2 }}>Expected cases</td>
                      <td style={{ textAlign: "right", color: P.t1 }}>{cases.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: P.t2 }}>MDE</td>
                      <td style={{ textAlign: "right", color: P.gold, fontWeight: 700 }}>{mde}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TESTS SUMMARY */}
        {tab === "tests" && (
          <div>
            <div style={{ marginBottom: 20, fontSize: 9, fontWeight: 800, color: P.gold, letterSpacing: "0.22em", textTransform: "uppercase" }}>
              SIX STATISTICAL TESTS · PRE-SPECIFIED
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
              {[
                { t: "Test 1", h: "High-Risk MOS × Hispanic Prob", p: "0.712", sig: false, or: "1.045" },
                { t: "Test 2", h: "Wounded × Hispanic Prob", p: "0.273", sig: false, or: "0.835" },
                { t: "Test 3", h: "PTSD × Post-Tet Status", p: "0.016", sig: true, or: "1.225" },
                { t: "Test 4", h: "Mine Exposure × I Corps", p: "<0.0001", sig: true, or: "1.775" },
                { t: "Test 5", h: "PTSD Logistic Regression", p: "<0.001", sig: true, or: "2.898" },
                { t: "Test 6", h: "Wounded Logistic Regression", p: "<0.001", sig: true, or: "2.501" },
              ].map((test, i) => (
                <div key={i} style={{ background: P.card, border: `1px solid ${test.sig ? P.teal : P.t4}30`, borderRadius: 7, padding: 12 }}>
                  <div style={{ fontSize: 7, fontWeight: 800, color: test.sig ? P.teal : P.t4, textTransform: "uppercase", marginBottom: 4 }}>
                    {test.t} {test.sig && "✓"}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 6 }}>{test.h}</div>
                  <div style={{ fontSize: 8, color: P.t3 }}>
                    <div>p = <span style={{ color: test.sig ? P.teal2 : P.t3 }}>{test.p}</span></div>
                    <div>OR = <span style={{ color: P.gold }}>{test.or}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOREST PLOT */}
        {tab === "forest" && (
          <div>
            <div style={{ marginBottom: 20, fontSize: 9, fontWeight: 800, color: P.gold, letterSpacing: "0.22em", textTransform: "uppercase" }}>
              FOREST PLOT — PTSD LOGISTIC REGRESSION
            </div>
            <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 20 }}>
              <p style={{ fontSize: 8, color: P.t3, marginBottom: 14, lineHeight: 1.6 }}>
                Variables to the right of the vertical null line (OR=1.0) increase PTSD odds. All four significant predictors cluster right with narrow confidence intervals.
              </p>
              {[
                { label: "combat", or: 2.898, ci: "[2.431, 3.454]", sig: true },
                { label: "mine_exposure", or: 2.415, ci: "[1.972, 2.958]", sig: true },
                { label: "high_risk_mos", or: 1.847, ci: "[1.542, 2.213]", sig: true },
                { label: "wounded", or: 1.531, ci: "[1.206, 1.944]", sig: true },
                { label: "post_tet", or: 1.226, ci: "[1.029, 1.459]", sig: true },
              ].map((d, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${P.b}30` }}>
                  <div style={{ width: 140, fontSize: 8, color: d.sig ? P.t1 : P.t3, fontFamily: "'IBM Plex Mono',monospace" }}>{d.label}</div>
                  <div style={{ width: 120, height: 8, background: "#080D18", borderRadius: 4, position: "relative" }}>
                    <div style={{ position: "absolute", left: "40%", width: 1, height: 12, background: P.t4, top: -2, opacity: 0.3 }} />
                    <div style={{ width: "80%", height: 8, background: d.sig ? P.teal2 : P.t3, borderRadius: 4 }} />
                  </div>
                  <div style={{ width: 100, fontSize: 7, color: P.gold, fontWeight: 700 }}>OR={d.or}</div>
                  <div style={{ fontSize: 7, color: P.t3 }}>{d.ci}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SPSS SYNTAX */}
        {tab === "syntax" && (
          <div>
            <div style={{ marginBottom: 20, fontSize: 9, fontWeight: 800, color: P.gold, letterSpacing: "0.22em", textTransform: "uppercase" }}>
              SPSS SYNTAX — COPY-PASTE READY
            </div>
            <div style={{ background: "#05080D", border: `1px solid ${P.teal}30`, borderRadius: 7, padding: 16, overflowX: "auto", fontSize: 8, color: "#A8D8C8", fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1.6 }}>
              <pre>{`/* IMPORT AND LABELS */
GET DATA /TYPE=TXT /FILE='cohort.csv' /DELIMITERS="," /FIRSTCASE=2.
VARIABLE LABELS combat 'Combat exposure' mine_exposure 'Mine/booby trap'.
EXECUTE.

/* CHI-SQUARE TESTS */
CROSSTABS /TABLES=post_tet BY ptsd_outcome /STATISTICS=CHISQ RISK PHI.

/* LOGISTIC REGRESSION */
LOGISTIC REGRESSION VARIABLES ptsd_outcome
  /METHOD=ENTER combat high_risk_mos mine_exposure wounded post_tet
           hispanic_prob branch_marines branch_army
  /PRINT=GOODFIT CI(95)
  /CRITERIA=PIN(.05) ITERATE(20) CUT(.5).

/* SUBGROUP: POST-TET ONLY */
SELECT IF (post_tet = 1).
LOGISTIC REGRESSION VARIABLES ptsd_outcome
  /METHOD=ENTER combat high_risk_mos mine_exposure wounded branch_marines.
EXECUTE.`}</pre>
            </div>
          </div>
        )}

        {/* MISSING DATA */}
        {tab === "missing" && (
          <div>
            <div style={{ marginBottom: 20, fontSize: 9, fontWeight: 800, color: P.gold, letterSpacing: "0.22em", textTransform: "uppercase" }}>
              MISSING DATA HANDLING · HIPAA PROTOCOL
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
              {[
                { method: "Listwise Deletion", when: "Only if MCAR (<5%) — unacceptable for VA data with race/ethnicity non-response bias" },
                { method: "Multiple Imputation", when: "Best default when >5% missingness on substantive predictors. Run 20+ imputations; pool using Rubin's rules" },
                { method: "Mixed Models / GEE", when: "Best for longitudinal cohorts with wave-level attrition. Handles MAR without imputation" },
                { method: "Dummy Flag + Category", when: "Acceptable for administrative covariates only — NOT for primary predictors" },
              ].map((m, i) => (
                <div key={i} style={{ background: P.card2, border: `1px solid ${P.amber}20`, borderLeft: `3px solid ${P.amber}`, borderRadius: 7, padding: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: P.amber, marginBottom: 6 }}>{m.method}</div>
                  <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.5 }}>{m.when}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DCAS LINK */}
        {tab === "dcas" && (
          <div>
            <div style={{ marginBottom: 20, fontSize: 9, fontWeight: 800, color: P.gold, letterSpacing: "0.22em", textTransform: "uppercase" }}>
              NEXT: REAL DCAS DATA · PUBLIC DOWNLOAD
            </div>
            <div style={{ background: P.card, border: `1px solid ${P.gold}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <h3 style={{ fontSize: 11, fontWeight: 800, color: P.gold, marginBottom: 4 }}>NARA DCAS Vietnam Conflict Extract</h3>
                  <p style={{ fontSize: 8, color: P.t3, margin: 0 }}>58,220 records · 55 fields · Free public access · No registration required</p>
                  <p style={{ fontSize: 7, color: P.teal2, marginTop: 6, fontFamily: "'IBM Plex Mono',monospace" }}>
                    catalog.archives.gov/id/2240992
                  </p>
                </div>
                <a href="https://catalog.archives.gov/id/2240992" target="_blank" rel="noreferrer"
                  style={{
                    padding: "10px 18px", background: P.gold, color: "#000", fontSize: 9, fontWeight: 800, borderRadius: 7,
                    textDecoration: "none", whiteSpace: "nowrap", cursor: "pointer"
                  }}>
                  ↗ DOWNLOAD NOW
                </a>
              </div>
            </div>
            <div style={{ background: P.card2, border: `1px solid ${P.teal}30`, borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: P.teal, marginBottom: 10 }}>What Changes with Real Data</div>
              <ul style={{ fontSize: 8, color: P.t3, lineHeight: 1.8, margin: 0, paddingLeft: 16 }}>
                <li><strong style={{ color: P.teal2 }}>Hispanic classification:</strong> 349 coded vs. 2,309–3,372 BIFSG estimate — massive undercount</li>
                <li><strong style={{ color: P.teal2 }}>MOS routing:</strong> Testable correlation between surname probability and Tier 1 MOS assignment</li>
                <li><strong style={{ color: P.teal2 }}>Three-way interaction:</strong> I Corps + mine + Hispanic cross-tab available</li>
                <li><strong style={{ color: P.teal2 }}>1968 spike:</strong> 31.6% of suppressed cohort concentrated in Tet year</li>
                <li><strong style={{ color: P.teal2 }}>Cause-of-death codes:</strong> 23-value INCIDENT_CASUALTY_REASON_NAME for mine/booby trap precision</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}