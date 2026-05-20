import { useState } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { P } from "../../lib/teData";

const ANCHOR = {
  dcas_official: 349, total: 58220, bisg_corrected: 2309,
  failure_pct: 84.9, verified: 6, wall: 5, estimate: 500,
  nero: { N: 94, E: 97, R: 91, O: 96, composite: 94.5 },
};

const CONVERGENCE = [
  { stream: "DCAS Official", val: 349, pct: "0.60%", source: "DCAS/NARA VN08" },
  { stream: "BISG τ=0.40", val: 2309, pct: "3.97%", source: "BISG reconstruction" },
  { stream: "NARA Estimate", val: 3070, pct: "5.27%", source: "NARA archival cross-ref" },
  { stream: "Guzmán Study", val: 3500, pct: "6.01%", source: "Ralph Guzmán, 1970" },
  { stream: "LAE Model", val: 3741, pct: "6.43%", source: "Latin American Estimate" },
];

const CASES = [
  { id: "MNV-01", name: "Jesus S. Duran",    tier: "T5_CB_HSIVF", nero: 91, conf: 88, type: "casualty_misclassification", status: "corroborated", reviewer: "analyst-01", protected: false },
  { id: "MNV-02", name: "Manuel Valenzuela", tier: "T5_CB_HSIVF", nero: 84, conf: 82, type: "deportation_event",          status: "corroborated", reviewer: "analyst-01", protected: false },
  { id: "MNV-03", name: "Valente Valenzuela",tier: "T5_CB_HSIVF", nero: 87, conf: 85, type: "casualty_misclassification", status: "corroborated", reviewer: "analyst-01", protected: false },
  { id: "MNV-04", name: "Manuel Castano",    tier: "T5_CB_HSIVF", nero: 92, conf: 90, type: "casualty_misclassification", status: "corroborated", reviewer: "analyst-01", protected: false },
  { id: "MNV-05", name: "[PROTECTED]",        tier: "T5_CB_HSIVF", nero: 88, conf: 86, type: "deportation_event",          status: "corroborated", reviewer: "analyst-02", protected: true },
  { id: "MNV-06", name: "[PROTECTED]",        tier: "T5_CB_HSIVF", nero: 85, conf: 83, type: "casualty_misclassification", status: "corroborated", reviewer: "analyst-02", protected: true },
  ...Array.from({ length: 9 }, (_, i) => ({
    id: `MNV-0${i + 7}`, name: "PENDING INTAKE", tier: "T3", nero: null, conf: null,
    type: "—", status: "pending", reviewer: "unassigned", protected: false,
  })),
];

const FOIAS = [
  { id: "AR-001", agency: "VA", target: "VA BIRLS",                 filed: "2026-02-01", deadline: "2026-02-28", status: "OVERDUE", days: 81, escalation: "CHC → HVAC" },
  { id: "AR-002", agency: "DHS/ICE", target: "ENFORCE database",    filed: "2026-02-01", deadline: "2026-02-28", status: "OVERDUE", days: 81, escalation: "CHC → Judiciary" },
  { id: "AR-003", agency: "INAI MX", target: "INAI open records",   filed: "2026-03-01", deadline: "2026-03-28", status: "OVERDUE", days: 53, escalation: "SRE bilateral" },
  { id: "AR-004", agency: "NARA",    target: "SSS Form 102",        filed: "2026-04-01", deadline: "2026-05-01", status: "PENDING", days: null, escalation: "None yet" },
  { id: "AR-005", agency: "FSRDC",   target: "APSR microdata",      filed: "2026-04-15", deadline: "2026-06-01", status: "PENDING", days: null, escalation: "None yet" },
];

const TIERS = [
  { tier: "T5_CB_HSIVF", label: "T5 CB-HSIVF", count: 6,  col: P.red,  desc: "Forensically verified — SHA-256 certified" },
  { tier: "T1",          label: "T1 CRITICAL",  count: 4,  col: P.gold, desc: "Primary source — verified, admitted" },
  { tier: "T2",          label: "T2 CORROBORATED", count: 2, col: P.blue, desc: "Multi-source corroboration" },
  { tier: "T3",          label: "T3 PLAUSIBLE",  count: 3,  col: P.teal, desc: "Historically consistent, incomplete" },
  { tier: "T4",          label: "T4 WEAK LEAD",  count: 1,  col: '#6b7280', desc: "Single source, unverified" },
];

const VECTORS = [
  { subject: "Agency",      score: 68 },
  { subject: "Risk",        score: 82 },
  { subject: "Compassion",  score: 88 },
  { subject: "Alignment",   score: 71 },
  { subject: "Code-Switch", score: 85 },
  { subject: "Spiritual",   score: 41 },
];

const STATUS_COL = { corroborated: P.teal, verified: '#00ffcc', plausible: P.gold, pending: '#4b5563', OVERDUE: P.red, PENDING: P.gold };
const TIER_COL = { T5_CB_HSIVF: P.red, T1: P.gold, T2: P.blue, T3: P.teal, T4: '#6b7280' };

const Badge = ({ label, col }) => (
  <span style={{ display: 'inline-block', background: `${col}22`, border: `1px solid ${col}55`, borderRadius: 3, padding: '1px 6px', fontSize: 10, color: col }}>
    {label}
  </span>
);

const ScoreBar = ({ val, col, max = 100 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
    <div style={{ flex: 1, background: `${P.b}44`, height: 5, borderRadius: 2 }}>
      <div style={{ width: `${(val / max) * 100}%`, background: col, height: 5, borderRadius: 2 }} />
    </div>
    <span style={{ color: col, fontSize: 10, minWidth: 24 }}>{val}</span>
  </div>
);

const TABS = ['COMMAND', 'CASES', 'FOIA', 'TIERS', 'VECTORS'];

export default function ForensicCommandCenter() {
  const [tab, setTab] = useState('COMMAND');

  const S = {
    wrap: { background: P.bg, minHeight: '100%', padding: '14px 18px', fontFamily: "'IBM Plex Mono',monospace", color: P.t1 },
    card: (border) => ({ background: `${P.navy}99`, border: `1px solid ${border || P.b}`, borderRadius: 6, padding: '12px 14px' }),
    th: { background: `${P.navy}ee`, color: P.gold, padding: '6px 8px', textAlign: 'left', borderBottom: `1px solid ${P.b}`, fontSize: 10, position: 'sticky', top: 0 },
    td: { padding: '5px 8px', borderBottom: `1px solid ${P.b}22`, fontSize: 11, verticalAlign: 'middle' },
    tabBtn: (active) => ({ background: active ? `${P.gold}22` : 'transparent', border: `1px solid ${active ? P.gold : P.b}`, borderRadius: '4px 4px 0 0', padding: '5px 14px', cursor: 'pointer', color: active ? P.gold : P.t2, fontSize: 11 }),
  };

  return (
    <div style={S.wrap}>
      {/* Platform header */}
      <div style={{ ...S.card(`${P.gold}55`), marginBottom: 14, background: `${P.navy}cc` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ color: P.gold, fontSize: 15, fontWeight: 800, letterSpacing: 2 }}>TRUTHENGINE360 // FORENSIC COMMAND CENTER</div>
            <div style={{ color: P.t2, fontSize: 10, marginTop: 2 }}>DCAS Casualty Classification Audit · AUMER Foundation · USC Sol Price School · EIN 99-0495658</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Badge label="CLASSIFIED: INTERNAL" col={P.red} />
            <Badge label="CHC BRIEFING MAY 2026" col={P.gold} />
          </div>
        </div>
        {/* 5-metric strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginTop: 12 }}>
          {[
            { v: '349',     l: 'DCAS Official',     col: P.red },
            { v: '2,309',   l: 'BISG τ=0.40',       col: P.gold },
            { v: '84.9%',   l: 'Failure Rate',      col: P.gold },
            { v: '6',       l: 'Verified T5',       col: P.teal },
            { v: '5',       l: 'Wall Names',        col: P.blue },
          ].map(m => (
            <div key={m.l} style={{ background: `${m.col}11`, border: `1px solid ${m.col}33`, borderRadius: 6, padding: '8px', textAlign: 'center' }}>
              <div style={{ color: m.col, fontSize: 20, fontWeight: 800 }}>{m.v}</div>
              <div style={{ color: P.t3, fontSize: 9 }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${P.b}`, paddingBottom: 4, marginBottom: 14 }}>
        {TABS.map(t => <button key={t} style={S.tabBtn(tab === t)} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      {/* ── COMMAND ─────────────────────────────────────────────── */}
      {tab === 'COMMAND' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* DCAS Anomaly scorecard */}
          <div style={S.card(`${P.gold}44`)}>
            <div style={{ color: P.gold, fontSize: 11, fontWeight: 700, marginBottom: 10 }}>DCAS ANOMALY SCORECARD</div>
            <div style={{ color: P.red, fontSize: 28, fontWeight: 800 }}>349</div>
            <div style={{ color: P.t2, fontSize: 10 }}>DCAS official Hispanic casualties / 58,220 total (0.60%)</div>
            <div style={{ color: P.gold, fontSize: 22, fontWeight: 700, marginTop: 8 }}>2,309</div>
            <div style={{ color: P.t2, fontSize: 10 }}>BISG τ=0.40 corrected estimate</div>
            <div style={{ color: P.red, fontSize: 18, fontWeight: 700, marginTop: 8 }}>84.9% CLASSIFICATION FAILURE</div>
            <div style={{ color: P.t3, fontSize: 9, marginTop: 2 }}>(2309−349)/2309 · 55+ year maintained tradecraft posture</div>
            <div style={{ marginTop: 12 }}>
              <div style={{ color: P.teal, fontSize: 10, fontWeight: 700, marginBottom: 6 }}>5-STREAM CONVERGENCE</div>
              {CONVERGENCE.map((c, i) => (
                <div key={c.stream} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ color: P.t3, fontSize: 10, minWidth: 20 }}>{i + 1}.</span>
                  <span style={{ color: P.t1, fontSize: 11, minWidth: 110 }}>{c.stream}</span>
                  <div style={{ flex: 1, background: `${P.b}44`, height: 6, borderRadius: 3 }}>
                    <div style={{ width: `${(c.val / 3741) * 100}%`, background: i === 0 ? P.red : P.gold, height: 6, borderRadius: 3 }} />
                  </div>
                  <span style={{ color: i === 0 ? P.red : P.gold, fontSize: 11, fontWeight: 700, minWidth: 40 }}>{c.val.toLocaleString()}</span>
                  <span style={{ color: P.t3, fontSize: 9, minWidth: 38 }}>{c.pct}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* NERO Model */}
            <div style={S.card()}>
              <div style={{ color: P.gold, fontSize: 11, fontWeight: 700, marginBottom: 10 }}>NERO INSTITUTIONAL ERASURE MODEL</div>
              {[
                { k: 'N', label: 'Nomenclature', val: ANCHOR.nero.N },
                { k: 'E', label: 'Ethnic Miscoding', val: ANCHOR.nero.E },
                { k: 'R', label: 'Record Suppression', val: ANCHOR.nero.R },
                { k: 'O', label: 'Oral History Absence', val: ANCHOR.nero.O },
              ].map(n => (
                <div key={n.k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ color: P.gold, fontWeight: 700, minWidth: 14, fontSize: 12 }}>{n.k}</span>
                  <span style={{ color: P.t2, fontSize: 10, minWidth: 130 }}>{n.label}</span>
                  <div style={{ flex: 1 }}><ScoreBar val={n.val} col={n.val >= 95 ? P.red : P.gold} /></div>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${P.b}`, paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: P.t2, fontSize: 10 }}>COMPOSITE SCORE</span>
                <span style={{ color: P.red, fontSize: 14, fontWeight: 800 }}>94.5 / 100</span>
              </div>
            </div>

            {/* Noem Contradiction */}
            <div style={S.card()}>
              <div style={{ color: P.gold, fontSize: 11, fontWeight: 700, marginBottom: 8 }}>NOEM CONTRADICTION — PRIMARY ACCOUNTABILITY ANCHOR</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ background: `${P.red}11`, border: `1px solid ${P.red}55`, borderRadius: 5, padding: '10px 12px' }}>
                  <div style={{ color: P.t3, fontSize: 9 }}>SEPT 2025 — Written Congressional Submission</div>
                  <div style={{ color: P.red, fontSize: 13, fontWeight: 700, marginTop: 6 }}>8 VETERAN REMOVALS</div>
                  <div style={{ color: P.red, fontSize: 11 }}>ADMITTED</div>
                </div>
                <div style={{ background: `${P.gold}11`, border: `1px solid ${P.gold}55`, borderRadius: 5, padding: '10px 12px' }}>
                  <div style={{ color: P.t3, fontSize: 9 }}>DEC 2025 — Congressional Testimony</div>
                  <div style={{ color: P.gold, fontSize: 13, fontWeight: 700, marginTop: 6 }}>0 VETERAN REMOVALS</div>
                  <div style={{ color: P.gold, fontSize: 11 }}>DENIED</div>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: 8, color: P.teal, fontSize: 10, fontWeight: 700 }}>
                Δ = 8 REMOVALS · CHC BRIEFING EXHIBIT A · CONFIDENCE: 97/100
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CASES ────────────────────────────────────────────────── */}
      {tab === 'CASES' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ color: P.gold, fontSize: 11, fontWeight: 700 }}>CASE REGISTRY — MNV-01 THROUGH MNV-15</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Badge label={`${CASES.filter(c => c.tier === 'T5_CB_HSIVF').length} VERIFIED T5`} col={P.red} />
              <Badge label={`${CASES.filter(c => c.status === 'pending').length} PENDING INTAKE`} col="#4b5563" />
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Case ID', 'Subject', 'Tier', 'NERO', 'Conf', 'Claim Type', 'Status', 'Reviewer'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CASES.map(c => (
                  <tr key={c.id} style={{ opacity: c.status === 'pending' ? 0.5 : 1 }}>
                    <td style={S.td}><span style={{ color: P.teal, fontWeight: 700 }}>{c.id}</span></td>
                    <td style={S.td}><span style={{ color: c.protected ? P.t3 : P.t1, fontStyle: c.protected ? 'italic' : 'normal' }}>{c.name}</span></td>
                    <td style={S.td}><Badge label={c.tier} col={TIER_COL[c.tier] || '#4b5563'} /></td>
                    <td style={S.td}>{c.nero ? <ScoreBar val={c.nero} col={c.nero >= 90 ? P.red : P.gold} /> : <span style={{ color: '#4b5563' }}>—</span>}</td>
                    <td style={S.td}>{c.conf ? <ScoreBar val={c.conf} col={P.teal} /> : <span style={{ color: '#4b5563' }}>—</span>}</td>
                    <td style={S.td}><span style={{ color: P.t2, fontSize: 10 }}>{c.type}</span></td>
                    <td style={S.td}><Badge label={c.status.toUpperCase()} col={STATUS_COL[c.status] || '#4b5563'} /></td>
                    <td style={S.td}><span style={{ color: P.t3, fontSize: 10 }}>{c.reviewer}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── FOIA ─────────────────────────────────────────────────── */}
      {tab === 'FOIA' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ color: P.gold, fontSize: 11, fontWeight: 700 }}>FOIA OVERDUE TRACKER</div>
            <Badge label={`${FOIAS.filter(f => f.status === 'OVERDUE').length} STATUTORY VIOLATIONS`} col={P.red} />
          </div>
          <div style={{ background: `${P.red}11`, border: `1px solid ${P.red}44`, borderRadius: 6, padding: '8px 12px', marginBottom: 12, fontSize: 10, color: P.t1 }}>
            <span style={{ color: P.red, fontWeight: 700 }}>⚠ STATUTORY DEADLINE VIOLATIONS — </span>
            5 U.S.C. §552(a)(6)(A)(i) requires agency response within 20 business days.
            Constructive exhaustion (§552(a)(6)(C)) applies — agencies are deemed to have denied. Congressional escalation warranted.
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Request ID', 'Agency', 'Record Target', 'Filed', 'Deadline', 'Status', 'Overdue', 'Escalation'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FOIAS.map(f => (
                  <tr key={f.id} style={{ borderLeft: f.status === 'OVERDUE' ? `3px solid ${P.red}` : `3px solid transparent` }}>
                    <td style={S.td}><span style={{ color: P.teal }}>{f.id}</span></td>
                    <td style={S.td}><strong style={{ color: P.t1 }}>{f.agency}</strong></td>
                    <td style={S.td}><span style={{ color: P.t2, fontSize: 10 }}>{f.target}</span></td>
                    <td style={S.td}><span style={{ color: P.t3, fontSize: 10 }}>{f.filed}</span></td>
                    <td style={S.td}><span style={{ color: P.t3, fontSize: 10 }}>{f.deadline}</span></td>
                    <td style={S.td}><Badge label={f.status} col={STATUS_COL[f.status]} /></td>
                    <td style={S.td}>
                      {f.days ? <span style={{ color: P.red, fontWeight: 700 }}>+{f.days}d</span> : <span style={{ color: '#4b5563' }}>—</span>}
                    </td>
                    <td style={S.td}><span style={{ color: f.status === 'OVERDUE' ? P.red : P.t3, fontSize: 10 }}>{f.escalation}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TIERS ────────────────────────────────────────────────── */}
      {tab === 'TIERS' && (
        <div>
          <div style={{ color: P.gold, fontSize: 11, fontWeight: 700, marginBottom: 12 }}>TIER DISTRIBUTION MATRIX</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TIERS.map(t => (
              <div key={t.tier} style={{ ...S.card(`${t.col}44`), borderLeft: `4px solid ${t.col}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ minWidth: 140 }}>
                    <Badge label={t.label} col={t.col} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ width: `${(t.count / 6) * 100}%`, minWidth: 20, background: t.col, height: 16, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6 }}>
                      <span style={{ color: '#000', fontSize: 10, fontWeight: 700 }}>{t.count}</span>
                    </div>
                  </div>
                  <span style={{ color: t.col, fontSize: 16, fontWeight: 800, minWidth: 24 }}>{t.count}</span>
                  <span style={{ color: P.t2, fontSize: 10, flex: 2 }}>{t.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, ...S.card(), padding: '10px 14px', background: `${P.gold}08` }}>
            <div style={{ color: P.gold, fontSize: 10, fontWeight: 700, marginBottom: 4 }}>DATA INTEGRITY RULE</div>
            <div style={{ color: P.t2, fontSize: 11 }}>
              No claim may be elevated to T4+ without a traceable primary source. T5_CB_HSIVF requires SHA-256 certified chain of custody.
              CLM-0005 (~500 KIA estimate) remains T3 (placeholder) pending FSRDC microdata (doi:10.7910/DVN/O80SKQ).
            </div>
          </div>
        </div>
      )}

      {/* ── VECTORS ──────────────────────────────────────────────── */}
      {tab === 'VECTORS' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 14 }}>
          <div style={S.card()}>
            <div style={{ color: P.gold, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>BEHAVIORAL VECTOR RADAR — PILOT N=11</div>
            <div style={{ color: P.t3, fontSize: 9, marginBottom: 10 }}>Vietnam-era Mexican-born · Cronbach α=0.938 · R²=0.947 · F(4,38)=161.7, p&lt;0.001</div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={VECTORS}>
                <PolarGrid stroke={`${P.b}88`} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: P.t1, fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: P.t3, fontSize: 8 }} />
                <Radar name="Pilot" dataKey="score" stroke={P.gold} fill={P.gold} fillOpacity={0.25} strokeWidth={2} />
                <Tooltip contentStyle={{ background: '#0f172a', border: `1px solid ${P.gold}55`, fontSize: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: P.gold, fontSize: 10, fontWeight: 700, marginBottom: 2 }}>SIGNIFICANCE</div>
            {[
              { v: 'Agency',      s: 68, p: 0.09, sig: false },
              { v: 'Risk',        s: 82, p: 0.03, sig: true },
              { v: 'Compassion',  s: 88, p: 0.01, sig: true },
              { v: 'Alignment',   s: 71, p: 0.07, sig: false },
              { v: 'Code-Switch', s: 85, p: 0.02, sig: true },
              { v: 'Spiritual',   s: 41, p: 0.44, sig: false },
            ].map(v => {
              const col = v.sig ? P.gold : v.p < 0.10 ? P.teal : '#4b5563';
              return (
                <div key={v.v} style={{ ...S.card(), borderLeft: `3px solid ${col}`, padding: '7px 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: P.t1, fontSize: 11 }}>{v.v}</span>
                    <span style={{ color: col, fontWeight: 700, fontSize: 12 }}>{v.s}</span>
                  </div>
                  <div style={{ color: col, fontSize: 9, marginTop: 2 }}>p={v.p} {v.sig ? '★ sig' : v.p < 0.10 ? '~ near' : '○ null'}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
