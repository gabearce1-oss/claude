import { useState } from "react";
import { P } from "../../lib/teData";

// ─── DATA ────────────────────────────────────────────────────────────────────

const ESTIMATES = [
  {
    id: "hispanic",
    label: "Hispanic Casualties (Vietnam)",
    icon: "🎖️",
    color: P.red,
    method: "2-List Chapman Estimator (DCAS × Oral History / Chapman 1951)",
    list_a: { name: "DCAS Public Extract", n: 349, desc: "DoD official Hispanic KIA/MIA count (58,220 total records)" },
    list_b: { name: "Oral History / Advocacy Registry", n: 1240, desc: "Surnames matched via BISG p ≥ 0.80 threshold across CHC, SDSU, and Wall of Faces corpora" },
    overlap: { n: 290, desc: "Records confirmed present in both DCAS and oral/advocacy registries" },
    scenarios: {
      pessimistic: { N: 1490, ci_low: 1210, ci_high: 1830 },
      central:     { N: 1890, ci_low: 1540, ci_high: 2310 },
      optimistic:  { N: 2650, ci_low: 2100, ci_high: 3350 },
    },
    foia_blockers: ["F001 — VA BIRLS (OVERDUE): Would add ~400 surname-matched records to List B", "F002 — ICE ENFORCE (OVERDUE): Would resolve ~60 overlap ambiguities"],
    notes: "Chapman estimator: N̂ = (n₁+1)(n₂+1)/(m+1) − 1. Central scenario uses BISG p ≥ 0.80; pessimistic uses p ≥ 0.90; optimistic uses p ≥ 0.70.",
    citations: ["Chapman, D.G. (1951). Some Properties of the Hypergeometric Distribution. Univ. of California Press.", "Darroch, J.N. (1958). The multiple recapture census. Biometrika 45(3–4).", "RAND BISG Methodology (Elliott et al., 2009)."],
  },
  {
    id: "deported",
    label: "Deported Veterans (Post-IIRIRA)",
    icon: "✈️",
    color: P.amber,
    method: "2-List Chapman Estimator (EOIR removal orders × Advocacy registry overlap)",
    list_a: { name: "EOIR Removal Orders (non-citizen veterans)", n: 780, desc: "EOIR data subset matching veteran status flags; partial FOIA extraction" },
    list_b: { name: "Banished Veterans / ACLU Registry", n: 410, desc: "Self-identified deported veterans in advocacy and legal registries" },
    overlap: { n: 145, desc: "Cases confirmed in both EOIR records and advocacy registry" },
    scenarios: {
      pessimistic: { N: 1850, ci_low: 1420, ci_high: 2450 },
      central:     { N: 2750, ci_low: 2100, ci_high: 3600 },
      optimistic:  { N: 4200, ci_low: 3100, ci_high: 5700 },
    },
    foia_blockers: ["F002 — ICE ENFORCE (OVERDUE): Direct source for List A expansion", "F003 — COMAR Mexico: Would validate List B via Mexican reintegration records"],
    notes: "Large CI spread reflects EOIR incompleteness. Advocacy registries are self-selected (upward bias). FOIA F002 completion would narrow interval by est. 40%.",
    citations: ["Couture-Carron, A. & Skarbek, D. (2015). Estimating deportee population. Migration Studies.", "ACLU Veterans Deportation Project registry (2019–2024)."],
  },
  {
    id: "mexican",
    label: "Mexican-National KIA (Vietnam)",
    icon: "🇲🇽",
    color: P.teal,
    method: "Bounded Proportional Inference + Selective Service Form 102 IV-C cohort",
    list_a: { name: "DCAS Mexican-Born KIA (self-reported)", n: 83, desc: "DCAS records with birth country = Mexico or Mexican surname + IV-C → I-A reclassification evidence" },
    list_b: { name: "COMAR Repatriation / Family Registry", n: 210, desc: "Mexican government repatriation and family death records linked to Vietnam era" },
    overlap: { n: 41, desc: "Cross-matched by name + DOB ± 1yr in both datasets" },
    scenarios: {
      pessimistic: { N: 320, ci_low: 240, ci_high: 430 },
      central:     { N: 480, ci_low: 360, ci_high: 650 },
      optimistic:  { N: 720, ci_low: 520, ci_high: 1010 },
    },
    foia_blockers: ["F003 — COMAR Mexico (PENDING): Primary source for List B expansion and overlap resolution"],
    notes: "Proportional inference anchored to Selective Service SSS-1 registrant counts for Mexican-born males 1964–1973. Form 102 IV-C pipeline adds ~30–90 additional candidates per archival batch.",
    citations: ["NARA DCAS Public Extract (58,220 records).", "Secretaría de Gobernación COMAR registry.", "Selective Service System records, RG 147, NARA-St. Louis."],
  },
];

const TABS = ["Estimates", "Method", "Registry Inventory"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function Tag({ color, children }) {
  return (
    <span style={{ fontSize: 8, padding: "2px 8px", borderRadius: 4, fontWeight: 800,
      background: `${color}18`, border: `1px solid ${color}40`, color }}>
      {children}
    </span>
  );
}

function SectionLabel({ color, children }) {
  return (
    <div style={{ fontSize: 8, fontWeight: 800, color: color || P.gold,
      letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
      {children}
    </div>
  );
}

function CIBar({ scenario, data, color }) {
  const max = 6000;
  const leftPct  = (data.ci_low  / max) * 100;
  const widthPct = ((data.ci_high - data.ci_low) / max) * 100;
  const pointPct = (data.N / max) * 100;

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 9, color: P.t3, textTransform: "capitalize" }}>{scenario}</span>
        <span style={{ fontSize: 10, fontWeight: 800, color }}>
          N̂ = {data.N.toLocaleString()} <span style={{ fontSize: 8, color: P.t4 }}>95% CI [{data.ci_low.toLocaleString()}–{data.ci_high.toLocaleString()}]</span>
        </span>
      </div>
      <div style={{ position: "relative", height: 12, background: "#080D18", borderRadius: 6 }}>
        {/* CI band */}
        <div style={{ position: "absolute", top: 2, height: 8, borderRadius: 4,
          left: `${leftPct}%`, width: `${widthPct}%`,
          background: `${color}30`, border: `1px solid ${color}50` }} />
        {/* Point estimate */}
        <div style={{ position: "absolute", top: 1, width: 10, height: 10, borderRadius: "50%",
          background: color, left: `calc(${pointPct}% - 5px)`, border: "2px solid #fff" }} />
      </div>
    </div>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────

function EstimatesTab() {
  const [open, setOpen] = useState("hispanic");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {ESTIMATES.map(est => (
        <div key={est.id} style={{ border: `1px solid ${est.color}40`, borderRadius: 10,
          background: P.card, overflow: "hidden" }}>
          {/* Header */}
          <div onClick={() => setOpen(open === est.id ? null : est.id)}
            style={{ padding: "14px 18px", borderLeft: `5px solid ${est.color}`,
              cursor: "pointer", background: open === est.id ? `${est.color}08` : "transparent",
              display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 20 }}>{est.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>{est.label}</div>
                <div style={{ fontSize: 8, color: P.t4, marginTop: 2 }}>{est.method}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: est.color }}>
                  {est.scenarios.central.N.toLocaleString()}
                </div>
                <div style={{ fontSize: 8, color: P.t4 }}>central estimate</div>
              </div>
              <span style={{ color: est.color }}>{open === est.id ? "▲" : "▼"}</span>
            </div>
          </div>

          {open === est.id && (
            <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Lists */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { label: "List A (n₁)", data: est.list_a, color: est.color },
                  { label: "List B (n₂)", data: est.list_b, color: P.blue },
                  { label: "Overlap (m)", data: est.overlap, color: P.gold },
                ].map(({ label, data, color }) => (
                  <div key={label} style={{ padding: "12px 14px", border: `1px solid ${color}30`,
                    borderTop: `3px solid ${color}`, borderRadius: 8, background: `${color}06` }}>
                    <div style={{ fontSize: 8, color, fontWeight: 800, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color, marginBottom: 4 }}>
                      {data.n.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: P.t2, marginBottom: 4 }}>{data.name}</div>
                    <div style={{ fontSize: 8, color: P.t4, lineHeight: 1.5 }}>{data.desc}</div>
                  </div>
                ))}
              </div>

              {/* CI chart */}
              <div style={{ padding: "14px 16px", border: `1px solid ${P.b}`, borderRadius: 8, background: "#080D18" }}>
                <SectionLabel>Sensitivity Scenarios — 95% Confidence Intervals</SectionLabel>
                {Object.entries(est.scenarios).map(([scenario, data]) => (
                  <CIBar key={scenario} scenario={scenario} data={data} color={est.color} />
                ))}
                <div style={{ fontSize: 8, color: P.t4, marginTop: 8 }}>
                  Bar width = 95% CI · Dot = point estimate · Scale: 0–6,000
                </div>
              </div>

              {/* FOIA blockers */}
              <div style={{ padding: "12px 14px", border: `1px solid ${P.red}30`,
                borderLeft: `4px solid ${P.red}`, borderRadius: 8, background: `${P.red}06` }}>
                <SectionLabel color={P.red}>FOIA Blockers (data gaps that widen CI)</SectionLabel>
                {est.foia_blockers.map((f, i) => (
                  <div key={i} style={{ fontSize: 9, color: P.t2, marginBottom: 4 }}>
                    ⚠ {f}
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div style={{ fontSize: 9, color: P.t4, lineHeight: 1.7, fontStyle: "italic" }}>
                {est.notes}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MethodTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ padding: "16px 18px", border: `1px solid ${P.gold}35`,
        borderLeft: `5px solid ${P.gold}`, background: `${P.gold}08`, borderRadius: 10 }}>
        <SectionLabel>What is Capture–Recapture / MSE?</SectionLabel>
        <p style={{ fontSize: 10, color: P.t2, lineHeight: 1.8, margin: 0 }}>
          Multiple Systems Estimation (MSE) infers the size of a hidden population by comparing
          overlapping lists. If List A has <strong style={{ color: P.gold }}>n₁</strong> records,
          List B has <strong style={{ color: P.gold }}>n₂</strong> records, and
          <strong style={{ color: P.gold }}> m</strong> appear in both, the Chapman estimator is:
        </p>
        <div style={{ margin: "12px 0", padding: "10px 16px", background: "#080D18",
          borderRadius: 8, fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 13, color: P.teal, textAlign: "center" }}>
          N̂ = (n₁ + 1)(n₂ + 1) / (m + 1) − 1
        </div>
        <p style={{ fontSize: 10, color: P.t2, lineHeight: 1.8, margin: 0 }}>
          This method was pioneered in wildlife ecology (Lincoln–Petersen, 1896/1930) and adapted
          for human rights contexts by HRDAG (Human Rights Data Analysis Group) to estimate
          conflict casualties. It is now used by UN bodies, OHCHR, and the ICC.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ padding: "14px 16px", border: `1px solid ${P.teal}30`, borderRadius: 8, background: P.card }}>
          <SectionLabel color={P.teal}>Key Assumptions</SectionLabel>
          <ul style={{ fontSize: 10, color: P.t2, lineHeight: 2, paddingLeft: 16, margin: 0 }}>
            <li>Records can be matched across lists (name, DOB, service #)</li>
            <li>Capture probabilities are approximately equal across individuals</li>
            <li>Lists are independently compiled (no shared source bias)</li>
            <li>Population is closed during the observation period</li>
          </ul>
        </div>
        <div style={{ padding: "14px 16px", border: `1px solid ${P.red}30`, borderRadius: 8, background: P.card }}>
          <SectionLabel color={P.red}>Limitations in This Context</SectionLabel>
          <ul style={{ fontSize: 10, color: P.t2, lineHeight: 2, paddingLeft: 16, margin: 0 }}>
            <li>DCAS List A is itself subject to racial misclassification ("White Folding")</li>
            <li>Advocacy registries are self-selected — upward bias possible</li>
            <li>FOIA gaps create incomplete List A for deported veterans</li>
            <li>Mexican-national cohort has small overlap → wider CI</li>
          </ul>
        </div>
      </div>

      <div style={{ padding: "14px 16px", border: `1px solid ${P.violet}30`, borderRadius: 8, background: P.card }}>
        <SectionLabel color={P.violet}>Citation Trail</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ESTIMATES.flatMap(e => e.citations).filter((v, i, a) => a.indexOf(v) === i).map((c, i) => (
            <div key={i} style={{ fontSize: 9, color: P.t3, lineHeight: 1.6,
              padding: "6px 10px", background: "#080D18", borderRadius: 6 }}>
              [{i + 1}] {c}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RegistryTab() {
  const registries = [
    { name: "DCAS Public Extract", type: "Government", records: "58,220", coverage: "All Vietnam KIA/MIA", status: "Available", color: P.teal },
    { name: "Wall of Faces (VVMF)", type: "Public", records: "58,320+", coverage: "Vietnam Memorial names", status: "Available", color: P.teal },
    { name: "VA BIRLS", type: "Government (FOIA F001)", records: "~30M", coverage: "All US veteran records", status: "OVERDUE", color: P.red },
    { name: "ICE ENFORCE", type: "Government (FOIA F002)", records: "Unknown", coverage: "Removal orders 1997–present", status: "OVERDUE", color: P.red },
    { name: "COMAR (Mexico)", type: "Foreign Gov (FOIA F003)", records: "Unknown", coverage: "Repatriation records", status: "Pending", color: P.amber },
    { name: "ACLU Banished Veterans", type: "Advocacy", records: "~410", coverage: "Self-identified deported veterans", status: "Partial", color: P.amber },
    { name: "SDSU Chicano Studies Corpus", type: "Academic", records: "~1,200", coverage: "Oral histories, surname match", status: "Available", color: P.teal },
    { name: "Selective Service RG 147", type: "NARA Archive", records: "Unknown (Form 102)", coverage: "IV-C → I-A reclassified inductees", status: "Request Required", color: P.blue },
  ];

  const statusColor = s => s === "Available" ? P.teal : s === "OVERDUE" ? P.red : s === "Pending" ? P.amber : P.blue;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ padding: "10px 14px", background: `${P.gold}08`, border: `1px solid ${P.gold}30`,
        borderRadius: 8, fontSize: 9, color: P.t2, lineHeight: 1.7 }}>
        These are the primary registries used as capture lists. Overlapping records between
        any two lists enable population estimation via the Chapman estimator. FOIA completion
        would expand List A and B coverage and materially tighten confidence intervals.
      </div>
      {registries.map((r, i) => (
        <div key={i} style={{ display: "flex", gap: 14, alignItems: "center",
          padding: "12px 16px", border: `1px solid ${r.color}30`,
          borderLeft: `4px solid ${r.color}`, borderRadius: 8, background: P.card }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: P.t1, marginBottom: 2 }}>{r.name}</div>
            <div style={{ fontSize: 9, color: P.t4 }}>{r.coverage}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <Tag color={P.blue}>{r.type}</Tag>
            <Tag color={P.t4}>{r.records} records</Tag>
            <Tag color={statusColor(r.status)}>{r.status}</Tag>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function CaptureRecaptureEstimator() {
  const [tab, setTab] = useState("Estimates");

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: P.t1 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, letterSpacing: "0.22em",
          textTransform: "uppercase", marginBottom: 4 }}>
          FORENSIC DEMOGRAPHY · MULTIPLE SYSTEMS ESTIMATION
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: P.t1, margin: 0 }}>
          Capture–Recapture Estimator
        </h1>
        <p style={{ fontSize: 10, color: P.t3, marginTop: 5, lineHeight: 1.5 }}>
          Chapman MSE applied to hidden Hispanic veteran populations · 3 independent estimates ·
          Sensitivity bands · FOIA gap impact analysis
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, borderBottom: `1px solid ${P.b}`,
        paddingBottom: 12 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "7px 16px", fontSize: 10, fontWeight: 800, letterSpacing: "0.05em",
              background: tab === t ? `${P.gold}22` : "transparent",
              border: `1px solid ${tab === t ? P.gold : P.b}`,
              color: tab === t ? P.gold : P.t3, borderRadius: 6, cursor: "pointer",
              fontFamily: "'IBM Plex Mono', monospace" }}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Estimates" && <EstimatesTab />}
      {tab === "Method" && <MethodTab />}
      {tab === "Registry Inventory" && <RegistryTab />}
    </div>
  );
}