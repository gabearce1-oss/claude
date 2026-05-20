import { useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from "recharts";
import { base44 } from "../../api/base44Client";
import { P } from "../../lib/teData";

// ── Pilot data: N=11 Vietnam-era Mexican-born only ────────────────────────────
// Cronbach's α = 0.938 | SPSS R² = 0.947 | F(4,38)=161.7, p<0.001
const VECTOR_PILOT = [
  { vector: 'Agency',      score: 68,  p_value: 0.09,  significant: false, label: 'Near-significant (p=.09)', notes: 'Self-reported agency and autonomy in military context' },
  { vector: 'Risk',        score: 82,  p_value: 0.03,  significant: true,  label: 'Significant (p=.03)',      notes: 'Risk tolerance and duty-assignment patterns' },
  { vector: 'Compassion',  score: 88,  p_value: 0.01,  significant: true,  label: 'Significant (p=.01)',      notes: 'Prosocial motivation; family/community orientation' },
  { vector: 'Alignment',   score: 71,  p_value: 0.07,  significant: false, label: 'Near-significant (p=.07)', notes: 'Institutional alignment and chain-of-command trust' },
  { vector: 'Code-Switch', score: 85,  p_value: 0.02,  significant: true,  label: 'Significant (p=.02)',      notes: 'Bilingual/bicultural identity navigation in service context' },
  { vector: 'Spiritual',   score: 41,  p_value: 0.44,  significant: false, label: 'Null result (p=.44)',      notes: 'Religious/spiritual identity; no significant group effect' },
];

// DCAS/BISG anchor (non-negotiable)
const ANCHOR = {
  dcas_official: 349, bisg_corrected: 2309, failure_pct: 84.9,
  pilot_n: 11, alpha: 0.938, r_sq: 0.947,
};

const sigColor = (v) => {
  if (v.significant) return P.gold;
  if (v.p_value < 0.10) return P.teal;
  return '#4b5563';
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{ background: '#0f172a', border: `1px solid ${P.gold}55`, borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
      <div style={{ color: P.gold, fontWeight: 700 }}>{d.vector}</div>
      <div style={{ color: P.t1 }}>Score: {d.score}</div>
      <div style={{ color: sigColor(d) }}>{d.label}</div>
      <div style={{ color: P.t2, maxWidth: 200, marginTop: 4 }}>{d.notes}</div>
    </div>
  );
};

export default function BehaviorVectorDashboard() {
  const [activeView, setActiveView] = useState('radar');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [analysisQuery, setAnalysisQuery] = useState('');

  const radarData = VECTOR_PILOT.map(v => ({ subject: v.vector, score: v.score, fullMark: 100 }));

  const runAnalysis = async (q) => {
    const prompt = q || analysisQuery || 'Interpret the 6-vector behavioral pilot results for the Vietnam-era Mexican-born cohort and their implications for the DCAS classification anomaly investigation.';
    setAiLoading(true);
    setAiResult('');
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Behavioral Vector Analysis Request:\n${prompt}\n\nPilot Data (N=${ANCHOR.pilot_n}, Vietnam-era Mexican-born only):\n${VECTOR_PILOT.map(v => `${v.vector}: score=${v.score}, p=${v.p_value}, significant=${v.significant}`).join('\n')}\n\nStatistics: Cronbach α=${ANCHOR.alpha}, R²=${ANCHOR.r_sq}, F(4,38)=161.7, p<0.001\nDCAS anchor: ${ANCHOR.dcas_official} official / ${ANCHOR.bisg_corrected} BISG / ${ANCHOR.failure_pct}% classification failure`,
        system_prompt: `You are a forensic behavioral analysis expert for the TruthEngine360 platform (AUMER Foundation). You are analyzing a pilot behavioral vector study (N=11, Vietnam-era Mexican-born veterans) as part of the DCAS Hispanic casualty classification audit. The 6 vectors (Agency, Risk, Compassion, Alignment, Code-Switch, Spiritual) measure behavioral and identity dimensions that may correlate with institutional erasure in military records. Cronbach's α=0.938, R²=0.947. CRITICAL: Never fabricate p-values or scores beyond the provided data. Label any extrapolation explicitly. The DCAS anchor (349/2309/84.9%) is forensically established and non-negotiable.`,
        add_context_from_previous_messages: false,
      });
      setAiResult(typeof res === 'string' ? res : res?.text || JSON.stringify(res));
    } catch (e) {
      setAiResult(`Error: ${e.message}`);
    }
    setAiLoading(false);
  };

  const S = {
    wrap: { background: P.bg, minHeight: '100%', padding: '16px 20px', fontFamily: "'IBM Plex Mono', monospace", color: P.t1 },
    header: { background: `${P.navy}cc`, border: `1px solid ${P.gold}44`, borderRadius: 8, padding: '14px 18px', marginBottom: 16 },
    card: { background: `${P.navy}88`, border: `1px solid ${P.b}`, borderRadius: 6, padding: '12px 16px' },
    badge: (col) => ({ display: 'inline-block', background: `${col}22`, border: `1px solid ${col}55`, borderRadius: 3, padding: '2px 7px', fontSize: 10, color: col }),
    tab: (active) => ({ background: active ? `${P.gold}22` : 'transparent', border: `1px solid ${active ? P.gold : P.b}`, borderRadius: 4, padding: '5px 12px', cursor: 'pointer', color: active ? P.gold : P.t2, fontSize: 11 }),
    aiBox: { background: '#070d1a', border: `1px solid ${P.teal}44`, borderRadius: 6, padding: 12, marginTop: 12, fontSize: 11, whiteSpace: 'pre-wrap', maxHeight: 360, overflowY: 'auto', color: '#e2e8f0', lineHeight: 1.6 },
  };

  return (
    <div style={S.wrap}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ color: P.gold, fontSize: 14, fontWeight: 700 }}>BEHAVIORAL VECTOR DASHBOARD</div>
            <div style={{ color: P.t2, fontSize: 10, marginTop: 2 }}>
              6-Vector Pilot Study · N={ANCHOR.pilot_n} · Vietnam-era Mexican-born · Cronbach α={ANCHOR.alpha} · R²={ANCHOR.r_sq}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={S.badge(P.gold)}>F(4,38)=161.7, p&lt;0.001</span>
            <span style={S.badge(P.teal)}>SPSS VALIDATED</span>
          </div>
        </div>
        {/* Stat strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 12 }}>
          {[
            { label: 'Pilot N', val: ANCHOR.pilot_n, col: P.teal },
            { label: 'Cronbach α', val: ANCHOR.alpha, col: P.gold },
            { label: 'SPSS R²', val: ANCHOR.r_sq, col: P.gold },
            { label: 'Sig. vectors', val: `${VECTOR_PILOT.filter(v => v.significant).length} / 6`, col: P.teal },
          ].map(m => (
            <div key={m.label} style={{ background: `${m.col}11`, border: `1px solid ${m.col}33`, borderRadius: 6, padding: '6px 10px', textAlign: 'center' }}>
              <div style={{ color: m.col, fontSize: 15, fontWeight: 700 }}>{m.val}</div>
              <div style={{ color: P.t3, fontSize: 9 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* View tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[['radar', 'Radar Chart'], ['bars', 'Vector Scores'], ['table', 'Data Table'], ['analysis', 'AI Analysis']].map(([id, lbl]) => (
          <button key={id} style={S.tab(activeView === id)} onClick={() => setActiveView(id)}>{lbl}</button>
        ))}
      </div>

      {/* ── Radar ──────────────────────────────────────────────────── */}
      {activeView === 'radar' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 14 }}>
          <div style={S.card}>
            <div style={{ color: P.gold, fontSize: 11, fontWeight: 700, marginBottom: 10 }}>6-VECTOR BEHAVIORAL RADAR · PILOT N=11</div>
            <ResponsiveContainer width="100%" height={340}>
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke={`${P.b}88`} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: P.t1, fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: P.t3, fontSize: 9 }} />
                <Radar name="Pilot (N=11)" dataKey="score" stroke={P.gold} fill={P.gold} fillOpacity={0.25} strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ color: P.t3, fontSize: 10, marginTop: 6, textAlign: 'center' }}>
              Gold = significant (p&lt;.05) · Teal = near-significant · Gray = null
            </div>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {VECTOR_PILOT.map(v => (
              <div key={v.vector} style={{ ...S.card, borderLeft: `3px solid ${sigColor(v)}`, padding: '8px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ color: P.t1, fontSize: 11, fontWeight: 600 }}>{v.vector}</span>
                  <span style={{ color: sigColor(v), fontSize: 12, fontWeight: 700 }}>{v.score}</span>
                </div>
                <div style={{ color: sigColor(v), fontSize: 10 }}>{v.label}</div>
                <div style={{ width: '100%', background: `${P.b}44`, height: 4, borderRadius: 2, marginTop: 5 }}>
                  <div style={{ width: `${v.score}%`, background: sigColor(v), height: 4, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bar chart ──────────────────────────────────────────────── */}
      {activeView === 'bars' && (
        <div style={S.card}>
          <div style={{ color: P.gold, fontSize: 11, fontWeight: 700, marginBottom: 10 }}>VECTOR SCORES BY SIGNIFICANCE</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={VECTOR_PILOT} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${P.b}44`} />
              <XAxis dataKey="vector" tick={{ fill: P.t2, fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: P.t3, fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: `1px solid ${P.gold}55`, fontSize: 11 }}
                labelStyle={{ color: P.gold }}
                formatter={(val, name, props) => [`${val} (p=${props.payload.p_value})`, 'Score']}
              />
              <Bar dataKey="score" radius={[3, 3, 0, 0]}>
                {VECTOR_PILOT.map((v) => (
                  <Cell key={v.vector} fill={sigColor(v)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 10, color: P.t3 }}>
            <span><span style={{ color: P.gold }}>■</span> Significant (p&lt;.05)</span>
            <span><span style={{ color: P.teal }}>■</span> Near-significant (p&lt;.10)</span>
            <span><span style={{ color: '#4b5563' }}>■</span> Null result</span>
          </div>
        </div>
      )}

      {/* ── Data table ─────────────────────────────────────────────── */}
      {activeView === 'table' && (
        <div style={S.card}>
          <div style={{ color: P.gold, fontSize: 11, fontWeight: 700, marginBottom: 10 }}>VECTOR DATA TABLE · N={ANCHOR.pilot_n}</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr>
                {['Vector', 'Score', 'p-value', 'Significance', 'Notes'].map(h => (
                  <th key={h} style={{ background: `${P.navy}dd`, color: P.gold, padding: '6px 8px', textAlign: 'left', borderBottom: `1px solid ${P.b}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VECTOR_PILOT.map(v => (
                <tr key={v.vector}>
                  <td style={{ padding: '6px 8px', borderBottom: `1px solid ${P.b}22`, fontWeight: 600, color: P.t1 }}>{v.vector}</td>
                  <td style={{ padding: '6px 8px', borderBottom: `1px solid ${P.b}22`, color: sigColor(v), fontWeight: 700 }}>{v.score}</td>
                  <td style={{ padding: '6px 8px', borderBottom: `1px solid ${P.b}22`, color: sigColor(v) }}>p={v.p_value}</td>
                  <td style={{ padding: '6px 8px', borderBottom: `1px solid ${P.b}22` }}>
                    <span style={{ display: 'inline-block', background: `${sigColor(v)}22`, border: `1px solid ${sigColor(v)}55`, borderRadius: 3, padding: '1px 6px', fontSize: 10, color: sigColor(v) }}>
                      {v.significant ? 'SIGNIFICANT' : v.p_value < 0.10 ? 'NEAR-SIG' : 'NULL'}
                    </span>
                  </td>
                  <td style={{ padding: '6px 8px', borderBottom: `1px solid ${P.b}22`, color: P.t2, fontSize: 10 }}>{v.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 14, padding: '8px 12px', background: `${P.gold}11`, border: `1px solid ${P.gold}33`, borderRadius: 6, fontSize: 10, color: P.t2 }}>
            <span style={{ color: P.gold }}>Statistical note: </span>
            Cronbach's α={ANCHOR.alpha} indicates high internal consistency across the 6 vectors.
            R²={ANCHOR.r_sq} from SPSS regression (F(4,38)=161.7, p&lt;0.001) confirms strong model fit.
            3 of 6 vectors significant at p&lt;.05; 2 near-significant at p&lt;.10; 1 null (Spiritual, p=.44).
            N={ANCHOR.pilot_n} — preliminary pilot; larger cohort required for generalization.
          </div>
        </div>
      )}

      {/* ── AI Analysis ────────────────────────────────────────────── */}
      {activeView === 'analysis' && (
        <div>
          <div style={S.card}>
            <div style={{ color: P.gold, fontSize: 11, fontWeight: 700, marginBottom: 10 }}>AI BEHAVIORAL ANALYST</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                style={{ flex: 1, background: `${P.navy}cc`, border: `1px solid ${P.b}`, borderRadius: 4, padding: '6px 10px', color: P.t1, fontSize: 11, outline: 'none' }}
                placeholder="Ask about the behavioral vectors, pilot results, or DCAS implications..."
                value={analysisQuery}
                onChange={e => setAnalysisQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runAnalysis()}
              />
              <button
                onClick={() => runAnalysis()}
                disabled={aiLoading}
                style={{ background: `${P.gold}22`, border: `1px solid ${P.gold}`, borderRadius: 4, padding: '6px 16px', color: P.gold, fontSize: 11, cursor: 'pointer' }}
              >
                {aiLoading ? '⟳ Analyzing…' : 'Analyze →'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                'Interpret the 3 significant vectors (Risk, Compassion, Code-Switch)',
                'What does Spiritual null result tell us about cohort profile?',
                'How do these vectors correlate with DCAS classification failure?',
                'What sample size would validate these findings?',
              ].map(q => (
                <button key={q} onClick={() => runAnalysis(q)}
                  style={{ background: `${P.blue}11`, border: `1px solid ${P.blue}44`, borderRadius: 3, padding: '3px 8px', color: P.teal, fontSize: 10, cursor: 'pointer' }}>
                  {q}
                </button>
              ))}
            </div>
            {aiResult && (
              <div style={S.aiBox}>
                <div style={{ color: P.teal, fontSize: 10, marginBottom: 6 }}>── BEHAVIORAL VECTOR ANALYSIS ──</div>
                {aiResult}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
