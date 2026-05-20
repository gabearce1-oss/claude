import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { P } from "../../lib/teData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";

// ─── DATA ────────────────────────────────────────────────────────────────────

const US_DATABASES = [
  { id: "dcas", label: "DCAS Vietnam Conflict Extract (NARA NAID 2240992)", agency: "DoD / NARA", tier: 1, access: "Open" },
  { id: "bifsg", label: "BIFSG Reconciliation CSV (3,377 records, 21 fields)", agency: "AUMER / Phase III", tier: 1, access: "Internal" },
  { id: "vvmf", label: "VVMF Wall of Faces (58,281 names)", agency: "VVMF", tier: 1, access: "Open Web" },
  { id: "uscis329", label: "USCIS §328/§329 Country-of-Origin Naturalizations", agency: "USCIS HQ", tier: 2, access: "FOIA" },
  { id: "ompf", label: "OMPF Ethnic-Code Fields (NPRC St. Louis)", agency: "NPRC", tier: 1, access: "FOIA 2027–2037" },
  { id: "gao", label: "GAO-19-416 — ICE Veteran Tracking Absence", agency: "GAO", tier: 1, access: "Public" },
  { id: "ice", label: "ICE ENFORCE / ODLS Removal Records", agency: "DHS / ICE", tier: 2, access: "FOIA" },
  { id: "ss", label: "Selective Service LPR Registration Records 1960–73", agency: "SSS", tier: 2, access: "FOIA" },
  { id: "crs", label: "CRS R48163 — Foreign Nationals in U.S. Armed Forces", agency: "CRS", tier: 1, access: "Public" },
  { id: "census", label: "1970 Census PUMS — Mexico-Born Military Sub-cohort", agency: "Census Bureau", tier: 2, access: "FSRDC" },
];

const MX_DATABASES = [
  { id: "sre", label: "SRE Acervo Histórico Diplomático (1961–1978)", agency: "SRE México", tier: 1, access: "Formal Request" },
  { id: "sedena", label: "Regional SEDENA Zona Militar Files (CSMN Records)", agency: "SEDENA México", tier: 2, access: "Admin Auth." },
  { id: "unam", label: "Hemeroteca Nacional UNAM (Mexican Press 1965–78)", agency: "UNAM", tier: 2, access: "Direct Access" },
  { id: "benson", label: "Benson Latin American Collection (UT Austin)", agency: "UT Austin / LOC", tier: 2, access: "Direct Access" },
  { id: "inmm", label: "INM / RNPDNO — Removal Entry Records", agency: "SEGOB / INM", tier: 2, access: "FOIA (INAI)" },
  { id: "immvi", label: "IMMVI Program Returns (Jul 2021 – 2023, ~50 cases)", agency: "Gob. México", tier: 2, access: "Public" },
];

const REPORT_TYPES = [
  { id: "dcas_audit", label: "DCAS Casualty Undercount Audit", icon: "📊" },
  { id: "mexican_nationals", label: "Mexican Nationals in Vietnam", icon: "🇲🇽" },
  { id: "deported_veterans", label: "Deported Veterans Registry", icon: "🎖️" },
  { id: "foia_matrix", label: "FOIA Pathway Intelligence Report", icon: "📋" },
  { id: "binational", label: "Binational Category-Survivability Analysis", icon: "🌐" },
  { id: "bifsg_reconstruction", label: "BIFSG Statistical Reconstruction", icon: "🔬" },
];

const ERAS = ["All Eras", "Pre-IIRIRA (pre-1996)", "Post-IIRIRA (1996–2019)", "Current (2020–present)"];
const BRANCHES = ["All Branches", "Army", "Marine Corps", "Navy", "Air Force", "Coast Guard"];
const CONF_LEVELS = ["All", "Verified Evidence", "Strong Inference", "Speculation / Pending FOIA"];

// ─── CHART DATA ───────────────────────────────────────────────────────────────

const BIFSG_DATA = [
  { label: "DCAS Published", n: 349, fill: "#EF4444" },
  { label: "Romano-V 1969", n: 2035, fill: "#F59E0B" },
  { label: "BISG Floor", n: 2309, fill: "#3B82F6" },
  { label: "BIFSG Low", n: 2876, fill: "#1CCFB4" },
  { label: "BIFSG Median", n: 3272, fill: "#FCD34D" },
  { label: "P100K Central", n: 3851, fill: "#8B5CF6" },
  { label: "P100K Upper", n: 5156, fill: "#EC4899" },
];

const SUPPRESSED_BY_STATE = [
  { state: "TX", suppressed: 711, fill: "#EF4444" },
  { state: "CA", suppressed: 640, fill: "#F97316" },
  { state: "NM", suppressed: 148, fill: "#F59E0B" },
  { state: "AZ", suppressed: 113, fill: "#EAB308" },
  { state: "NY", suppressed: 98, fill: "#84CC16" },
  { state: "CO", suppressed: 73, fill: "#1CCFB4" },
  { state: "FL", suppressed: 6, fill: "#3B82F6" },
];

const YEAR_DIST = [
  { year: "1965", n: 50 }, { year: "1966", n: 180 }, { year: "1967", n: 358 },
  { year: "1968", n: 566 }, { year: "1969", n: 365 }, { year: "1970", n: 177 },
  { year: "1971", n: 74 }, { year: "1972", n: 12 },
];

const BRANCH_DIST = [
  { name: "Army", value: 1151, fill: "#3B82F6" },
  { name: "Marines", value: 572, fill: "#EF4444" },
  { name: "Navy", value: 39, fill: "#1CCFB4" },
  { name: "Air Force", value: 26, fill: "#FCD34D" },
  { name: "Coast Guard", value: 1, fill: "#8B5CF6" },
];

// ─── CITATIONS DATA ───────────────────────────────────────────────────────────

const ALL_CITATIONS = {
  US: [
    { id: "C-US-01", tier: 1, label: "DCAS Vietnam Conflict Extract", ref: "NARA NAID 2240992, RG 330, 23 MB, 55 fields, 58,220 records. Transferred DMDC → NARA April 29, 2008.", access: "Open", url: "https://aad.archives.gov" },
    { id: "C-US-02", tier: 1, label: "GAO-19-416", ref: "Government Accountability Office, June 2019. ICE 'does not know how many veterans have been placed in removal proceedings or removed.' 70% of veteran cases bypassed mandatory HQ review.", access: "Public" },
    { id: "C-US-03", tier: 1, label: "CRS R48163", ref: "Congressional Research Service, August 19, 2024. Foreign Nationals in the U.S. Armed Forces: Immigration Issues. Table 2: §328/§329/§329A hostility-period dates.", access: "Public" },
    { id: "C-US-04", tier: 1, label: "Tzioumis (2018)", ref: "Tzioumis, K. Demographic Aspects of First Names. Scientific Data. First-name probability data underlying BIFSG posterior.", access: "Open" },
    { id: "C-US-05", tier: 2, label: "OMB Statistical Policy Directive 15 (1977, rev. 1997)", ref: "Established 'Hispanic' as federal ethnicity standard — prospective only. Applied retroactively in DCAS retrofit ~2000–2008.", access: "Public" },
    { id: "C-US-06", tier: 1, label: "Pub. L. 94-311 (1976)", ref: "First federal requirement for 'Americans of Spanish Origin' data. Basis for FOIA referral on DCAS DAA/N1- transmittal.", access: "Statutory" },
    { id: "C-US-07", tier: 1, label: "IIRIRA — Pub. L. 104-208 (1996)", ref: "Reclassified ~35 categories as 'aggravated felonies' subject to mandatory deportation. Applies retroactively. Eliminated Judicial Recommendations Against Deportation.", access: "Statutory" },
    { id: "C-US-08", tier: 1, label: "Pub. L. 90-633 (Oct 24, 1968)", ref: "Added Vietnam as §329 hostility period, retroactive to Feb 28, 1961. Terminated Oct 15, 1978 by President Carter's EO 12081.", access: "Statutory" },
    { id: "C-US-09", tier: 2, label: "AR 340-18-2 (Army Functional Files System)", ref: "Punched cards: 1 yr retention (destroyed pre-1968). Morning reports: 1 yr. Casualty case files: 2 yr. OMPF derived ethnic code: permanent.", access: "Regulatory" },
    { id: "C-US-10", tier: 1, label: "VVMF Wall of Faces (Military.com, Nov 2020)", ref: "120 of 58,220 names list a foreign country as home of record (0.21% of total Vietnam KIA). Empirical anchor for VVMF 120 bracket.", access: "Open Web" },
    { id: "C-US-11", tier: 1, label: "BIFSG Validation (PMC 3922477)", ref: "Elliott et al. 2009 — Bayesian Improved First-name Surname Geocoding. Methodological precedent. 99.1% calibration sensitivity.", access: "Academic" },
    { id: "C-US-12", tier: 1, label: "Guzmán (1969)", ref: "Mexican American Casualties in Vietnam. UC Santa Cruz. The foundational casualty count.", access: "Academic" },
    { id: "C-US-13", tier: 1, label: "Romano-V et al. (1969)", ref: "Spanish Surname War Dead Vietnam. El Grito III:1. Original hand-count of 2,035 names from Congressional Record.", access: "Academic" },
    { id: "C-US-14", tier: 2, label: "Zhang & Lee (2023, APSR)", ref: "Military Service and Immigrants' Integration. Replication: doi:10.7910/DVN/O80SKQ. Confirms §329 LPR registration applied through 1970–72 lottery.", access: "Academic" },
    { id: "C-US-15", tier: 2, label: "ACLU — Discharged, Then Discarded (2016, 2026 update)", ref: "3,000+ deported veterans tracked by Texas Civil Rights Project. 34+ destination countries. Zero official federal tracking statistics.", access: "Public" },
  ],
  MX: [
    { id: "C-MX-01", tier: 1, label: "Lestage (2008)", ref: "Migraciones Internacionales 4(4), El Colegio de la Frontera Norte. SRE does not centrally aggregate consular urn transfers. Mexican-side category-survivability artifact confirmed.", access: "Academic" },
    { id: "C-MX-02", tier: 2, label: "Ley del Servicio Militar Nacional — Articles 1 & 11", ref: "Mandatory military service for all Mexicans ages 18–40, including those abroad. Cartilla del Servicio Militar Nacional (CSMN). Registration at municipal juntas or consular offices as SEDENA auxiliaries.", access: "Statutory" },
    { id: "C-MX-03", tier: 2, label: "Excélsior, June 26, 2021", ref: "'El viacrucis de mexicano que sirvió en Vietnam' — Andrés 'Andy' de León. Born Tamaulipas 12/31/1943; deported 2010; returned via IMMVI 2021.", access: "Press" },
    { id: "C-MX-04", tier: 2, label: "PBS American Exile (2021)", ref: "Manuel & Valente Valenzuela — Vietnam veteran brothers. Removal proceedings. San Quentin News Spanish edition (2022) confirmed battlefield-conduct detail.", access: "Media" },
    { id: "C-MX-05", tier: 1, label: "Berkeley Law Deported Veterans Report (Jan 2025 update)", ref: "~50 returned via IMMVI July 2021–2023. Zero official federal tracking statistics.", access: "Public" },
    { id: "C-MX-06", tier: 2, label: "SRE Acervo Histórico Diplomático", ref: "U.S.-consulate casualty correspondence 1961–1978. Target for formal Mexican-side research request. SP4 Yabes consulate notification procedural artifact.", access: "Formal Request" },
    { id: "C-MX-07", tier: 2, label: "Hemeroteca Nacional UNAM / Benson Collection UT Austin", ref: "Mexican press archives 1965–1978. Excélsior, El Universal, La Prensa, El Norte (Monterrey), El Imparcial (Hermosillo), El Mexicano (Tijuana).", access: "Direct Access" },
  ]
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function SectionHeader({ n, title, color = P.gold }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, paddingBottom: 8,
      borderBottom: `2px solid ${color}40` }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 800, color: "#000", flexShrink: 0 }}>{n}</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: P.t1, letterSpacing: "0.04em" }}>{title}</div>
    </div>
  );
}

function DBBadge({ country }) {
  const isUS = country === "US";
  return (
    <span style={{ fontSize: 7, padding: "2px 7px", borderRadius: 4, fontWeight: 800,
      background: isUS ? "#1e3a8a" : "#7f1d1d",
      color: isUS ? "#93c5fd" : "#fca5a5",
      border: `1px solid ${isUS ? "#3b82f6" : "#ef4444"}40`,
      letterSpacing: "0.08em" }}>
      {isUS ? "🇺🇸 U.S." : "🇲🇽 MEXICO"}
    </span>
  );
}

function TierBadge({ tier }) {
  const colors = { 1: P.gold, 2: P.blue, 3: P.t4 };
  return (
    <span style={{ fontSize: 7, padding: "1px 6px", borderRadius: 3, fontWeight: 700,
      background: `${colors[tier]}20`, color: colors[tier], border: `1px solid ${colors[tier]}40` }}>
      TIER {tier}
    </span>
  );
}

function CitationCard({ c, country }) {
  return (
    <div style={{ background: "#080D18", border: `1px solid ${P.b}30`, borderRadius: 7,
      padding: "10px 12px", marginBottom: 7 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5 }}>
        <span style={{ fontSize: 8, fontWeight: 800, color: P.t4, minWidth: 60 }}>{c.id}</span>
        <DBBadge country={country} />
        <TierBadge tier={c.tier} />
        <span style={{ fontSize: 7, color: P.t4, marginLeft: "auto",
          background: `${P.b}30`, padding: "1px 6px", borderRadius: 3 }}>{c.access}</span>
      </div>
      <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 4 }}>{c.label}</div>
      <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.6 }}>{c.ref}</div>
    </div>
  );
}

// ─── REPORT RENDERER ─────────────────────────────────────────────────────────

function ReportOutput({ report, config }) {
  if (!report) return null;

  const selectedUSCitations = ALL_CITATIONS.US.filter(c =>
    config.usDatabases.length === 0 || config.usDatabases.some(db => c.id.toLowerCase().includes(db))
  );
  const selectedMXCitations = ALL_CITATIONS.MX.filter(c =>
    config.mxDatabases.length === 0 || true
  );

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1 }}>
      {/* Report Header */}
      <div style={{ background: `linear-gradient(135deg, #0a1628, #1a2e5c)`,
        border: `2px solid ${P.gold}40`, borderRadius: 12, padding: "24px 28px", marginBottom: 20 }}>
        <div style={{ fontSize: 7, color: P.gold, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 8 }}>
          TRUTHENGINE360 · AUMER FOUNDATION · FORENSIC CIVIC INTELLIGENCE
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: P.t1, marginBottom: 6 }}>
          {report.title}
        </div>
        <div style={{ fontSize: 10, color: P.t3, marginBottom: 12 }}>{report.subtitle}</div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[
            ["Generated", new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })],
            ["Classification", config.reportType],
            ["Era Filter", config.era],
            ["Service Branch", config.branch],
            ["Confidence Floor", config.confidence],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 6, color: P.t4, textTransform: "uppercase", marginBottom: 2 }}>{k}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: P.gold }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Executive Summary */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "18px 20px", marginBottom: 16 }}>
        <SectionHeader n="I" title="Executive Summary" color={P.gold} />
        <div style={{ fontSize: 9, color: P.t2, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{report.executive_summary}</div>
      </div>

      {/* Key Findings */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "18px 20px", marginBottom: 16 }}>
        <SectionHeader n="II" title="Key Findings" color={P.blue} />
        {report.findings?.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, padding: "9px 12px",
            background: "#080D18", borderRadius: 7, borderLeft: `3px solid ${[P.gold, P.blue, P.teal, P.red, P.violet][i % 5]}` }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: [P.gold, P.blue, P.teal, P.red, P.violet][i % 5], minWidth: 20 }}>{i+1}.</div>
            <div style={{ fontSize: 9, color: P.t2, lineHeight: 1.7 }}>{f}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "18px 20px", marginBottom: 16 }}>
        <SectionHeader n="III" title="Statistical Evidence — Visualized" color={P.teal} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Convergence Chart */}
          <div style={{ background: "#080D18", borderRadius: 8, padding: "14px" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.gold, marginBottom: 12 }}>
              BIFSG Corridor vs. Published 349 — Convergence Evidence
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={BIFSG_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={`${P.b}40`} />
                <XAxis dataKey="label" tick={{ fill: P.t4, fontSize: 7 }} />
                <YAxis tick={{ fill: P.t4, fontSize: 7 }} />
                <Tooltip contentStyle={{ background: P.card, border: `1px solid ${P.b}`, color: P.t1, fontSize: 9 }} />
                <Bar dataKey="n" name="Estimated KIA">
                  {BIFSG_DATA.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 7, color: P.t4, marginTop: 6, textAlign: "center" }}>
              Under-count ratio: 8.2× to 14.8× (BIFSG vs. published 349)
            </div>
          </div>

          {/* Suppressed by State */}
          <div style={{ background: "#080D18", borderRadius: 8, padding: "14px" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.red, marginBottom: 12 }}>
              1,789 Suppressed Mainland KIA — Coded WHITE on DCAS
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={SUPPRESSED_BY_STATE} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={`${P.b}40`} />
                <XAxis dataKey="state" tick={{ fill: P.t4, fontSize: 8 }} />
                <YAxis tick={{ fill: P.t4, fontSize: 7 }} />
                <Tooltip contentStyle={{ background: P.card, border: `1px solid ${P.b}`, color: P.t1, fontSize: 9 }} />
                <Bar dataKey="suppressed" name="Suppressed KIA" fill={P.red}>
                  {SUPPRESSED_BY_STATE.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 7, color: P.t4, marginTop: 6, textAlign: "center" }}>
              Mean BIFSG-1970 posterior: P = 0.7002 (median 0.7135)
            </div>
          </div>

          {/* Year Distribution */}
          <div style={{ background: "#080D18", borderRadius: 8, padding: "14px" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.amber, marginBottom: 12 }}>
              Temporal Distribution — Tet/Post-Tet Escalation Signature (1968 spike = 31.6%)
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={YEAR_DIST} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={`${P.b}40`} />
                <XAxis dataKey="year" tick={{ fill: P.t4, fontSize: 8 }} />
                <YAxis tick={{ fill: P.t4, fontSize: 7 }} />
                <Tooltip contentStyle={{ background: P.card, border: `1px solid ${P.b}`, color: P.t1, fontSize: 9 }} />
                <Line type="monotone" dataKey="n" stroke={P.amber} strokeWidth={2} dot={{ fill: P.amber }} name="Suppressed KIA" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Branch Distribution */}
          <div style={{ background: "#080D18", borderRadius: 8, padding: "14px" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.blue, marginBottom: 12 }}>
              Service Branch Distribution — Suppressed 1,789 Mainland Records
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={BRANCH_DIST} cx="50%" cy="50%" outerRadius={70} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {BRANCH_DIST.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: P.card, border: `1px solid ${P.b}`, color: P.t1, fontSize: 9 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Methodology */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "18px 20px", marginBottom: 16 }}>
        <SectionHeader n="IV" title="Methodology & Statistical Validation" color={P.violet} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { t: "T1 Resource Allocation", s: "χ² = 28.64, perm p = 0.0095", r: "PASS", c: P.teal },
            { t: "T2 Signature Similarity", s: "d_cos = −0.72", r: "MIXED", c: P.amber },
            { t: "T3 Inter-Rater Reliability", s: "Krippendorff's α = 0.755", r: "ACCEPTABLE", c: P.blue },
            { t: "T4 Temporal Concentration", s: "binomial p = 0.0021", r: "PASS", c: P.teal },
            { t: "T5 P100K↔BIFSG Convergence", s: "100% overlap", r: "PASS", c: P.teal },
            { t: "Reproducibility Hash", s: "MD5 368b53d1...c97e72be", r: "CERTIFIED", c: P.gold },
          ].map((t, i) => (
            <div key={i} style={{ background: "#080D18", borderRadius: 7, padding: "10px 12px",
              borderTop: `3px solid ${t.c}` }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: P.t1, marginBottom: 5 }}>{t.t}</div>
              <div style={{ fontSize: 8, color: P.t3, marginBottom: 6 }}>{t.s}</div>
              <div style={{ fontSize: 8, fontWeight: 800, color: t.c }}>{t.r}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: "8px 12px", background: "#080D18", borderRadius: 6,
          border: `1px solid ${P.violet}30`, fontSize: 8, color: P.t3 }}>
          Python 3 / NumPy 1.26 / SciPy 1.13 · random seed = 42 · Three consecutive runs verified byte-for-byte identical
        </div>
      </div>

      {/* AI Narrative */}
      {report.narrative && (
        <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "18px 20px", marginBottom: 16 }}>
          <SectionHeader n="V" title="AI-Generated Narrative Analysis" color={P.amber} />
          <div style={{ fontSize: 9, color: P.t2, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{report.narrative}</div>
        </div>
      )}

      {/* Source Registry — U.S. Databases */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "18px 20px", marginBottom: 16 }}>
        <SectionHeader n="VI" title="Source Registry — United States Databases" color={P.blue} />
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14,
          padding: "8px 12px", background: "#0a1628", borderRadius: 7,
          border: `1px solid #3b82f620`, fontSize: 8, color: "#93c5fd" }}>
          🇺🇸 <strong>U.S. FEDERAL &amp; ACADEMIC SOURCES</strong> — NARA · DMDC · USCIS · GAO · CRS · Academic
        </div>
        {selectedUSCitations.map(c => <CitationCard key={c.id} c={c} country="US" />)}
      </div>

      {/* Source Registry — Mexico Databases */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "18px 20px", marginBottom: 16 }}>
        <SectionHeader n="VII" title="Source Registry — Mexico Databases" color={P.red} />
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14,
          padding: "8px 12px", background: "#1c0a0a", borderRadius: 7,
          border: `1px solid #ef444420`, fontSize: 8, color: "#fca5a5" }}>
          🇲🇽 <strong>MEXICO SOURCES</strong> — SRE · SEDENA · INM · UNAM Hemeroteca · Benson Collection · Mexican Press
        </div>
        {selectedMXCitations.map(c => <CitationCard key={c.id} c={c} country="MX" />)}
      </div>

      {/* FOIA Pathway */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "18px 20px", marginBottom: 16 }}>
        <SectionHeader n="VIII" title="FOIA Pathway — Next Operational Steps" color={P.gold} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { date: "June 2026", action: "File USCIS §328 FOIA (FY 1961–1980) + §329 FOIA (FY 1968–1980) — disaggregated", urgency: "high" },
            { date: "June 2026", action: "File DMDC FOIA citing SF-115 transmittal for DCAS.VN.EXT08.DAT", urgency: "high" },
            { date: "June 2026", action: "File DHS/ICE FOIA citing GAO-19-416 for veteran-status flag implementation", urgency: "high" },
            { date: "Q3 2026", action: "JVS submission with Prof. Durazo — N=50 expansion, pre-register analysis plan", urgency: "medium" },
            { date: "Q4 2026", action: "UCLA PhD application — Phase IV dissertation (OMPF 2027, FSRDC, SRE Acervo)", urgency: "medium" },
            { date: "2027 onward", action: "OMPF declassification window opens — 1965 KIA cohort (62-year rule, 5 USC §552a)", urgency: "future" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#080D18", borderRadius: 7, padding: "10px 12px",
              borderLeft: `4px solid ${s.urgency === "high" ? P.red : s.urgency === "medium" ? P.gold : P.teal}` }}>
              <div style={{ fontSize: 7, color: P.t4, marginBottom: 4 }}>{s.date}</div>
              <div style={{ fontSize: 8, color: P.t2, lineHeight: 1.6 }}>{s.action}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: "#080D18", border: `1px solid ${P.b}30`, borderRadius: 8,
        padding: "14px 18px", textAlign: "center" }}>
        <div style={{ fontSize: 7, color: P.t4, lineHeight: 1.8 }}>
          AUMER Foundation · 501(c)(3) · EIN 99-0495658<br />
          TruthEngine360 · Forensic Civic Intelligence Platform · Version 1.2 · May 18, 2026<br />
          Distribution: AUMER internal · USC Sol Price · Prof. Durazo (USF) · Prof. Barreto (UCLA) · Prof. González (UCSB) · CHC staff · Counsel of record
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function IntelReportGenerator() {
  const [config, setConfig] = useState({
    reportType: "dcas_audit",
    era: "All Eras",
    branch: "All Branches",
    confidence: "All",
    usDatabases: [],
    mxDatabases: [],
    includeCharts: true,
    includeCitations: true,
    includeFOIA: true,
    customQuery: "",
  });
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const [activeSection, setActiveSection] = useState("config");

  const set = (k, v) => setConfig(p => ({ ...p, [k]: v }));
  const toggleDB = (key, id) => {
    set(key, config[key].includes(id) ? config[key].filter(x => x !== id) : [...config[key], id]);
  };

  const generateReport = async () => {
    setGenerating(true);
    const rtype = REPORT_TYPES.find(r => r.id === config.reportType);

    const prompt = `You are a forensic civic intelligence analyst for the AUMER Foundation / TruthEngine360 platform.

Generate a professionally formatted intelligence report with the following parameters:
- Report Type: ${rtype?.label}
- Era Filter: ${config.era}
- Service Branch: ${config.branch}
- Confidence Level: ${config.confidence}
- Custom Query: ${config.customQuery || "(none)"}

Context: The 349 Rule Phase III Deep Dive v1.2 (AUMER Foundation, May 18, 2026).
Key data: DCAS published 349 Hispanic Vietnam KIA (345 PR + 4 VI + 0 mainland). BIFSG corridor: 2,876–3,372 (undercount 8.2×–14.8×). 1,789 suppressed mainland Spanish-surname KIA coded WHITE on DCAS. Five-stage retrofit pipeline 1965–2008. Binational category-survivability artifact (U.S. DCAS + Mexico SRE both fail to count the same population). Nine documented deported Vietnam-era Mexican-national veterans (v1.2 roster includes Manuel Segura pre-IIRIRA 1985 and Manuel de Jesus Castano 2012). Three MOH/DSC anchor cases: Durán (MOH 2014 posthumous), Rascón (MOH 2000, §328 naturalized 1967), Yabes (DSC posthumous 1967).

Produce output as a valid JSON object with these fields:
{
  "title": "string — professional report title",
  "subtitle": "string — subtitle with classification and date",
  "executive_summary": "string — 3-4 paragraph executive summary, formal tone",
  "findings": ["array of 5-7 precise, numbered findings with specific statistics"],
  "narrative": "string — 2-3 paragraph analytical narrative distinguishing verified evidence from inference"
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: "claude_sonnet_4_6",
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          subtitle: { type: "string" },
          executive_summary: { type: "string" },
          findings: { type: "array", items: { type: "string" } },
          narrative: { type: "string" },
        }
      }
    });

    setReport(result);
    setActiveSection("report");
    setGenerating(false);
  };

  const inp = { padding: "6px 10px", background: "#080D18", border: `1px solid ${P.b}`,
    borderRadius: 6, color: P.t1, fontSize: 9, fontFamily: "'IBM Plex Mono',monospace",
    outline: "none", width: "100%" };

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1 }}>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 4 }}>
          TRUTHENGINE360 · FORENSIC CIVIC INTELLIGENCE
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: P.t1, margin: 0 }}>
          Intelligence Report Generator
        </h1>
        <p style={{ fontSize: 9, color: P.t3, marginTop: 4 }}>
          Configure search criteria, select U.S. and Mexico databases, and generate a professionally formatted forensic intelligence report with charts and citations.
        </p>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16,
        background: P.card, padding: 4, borderRadius: 10, border: `1px solid ${P.b}` }}>
        {[["config", "⚙️ Configure Report"], ["report", "📄 View Report"]].map(([id, label]) => (
          <button key={id} onClick={() => setActiveSection(id)}
            disabled={id === "report" && !report}
            style={{ flex: 1, padding: "9px", fontSize: 9, fontWeight: 700, cursor: id === "report" && !report ? "not-allowed" : "pointer",
              border: "none", borderRadius: 8, fontFamily: "'IBM Plex Mono',monospace",
              background: activeSection === id ? `${P.gold}20` : "transparent",
              color: activeSection === id ? P.gold : (id === "report" && !report) ? P.t4 : P.t3 }}>
            {label}
          </button>
        ))}
      </div>

      {activeSection === "config" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {/* Left: Report options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Report Type */}
            <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "14px" }}>
              <div style={{ fontSize: 8, fontWeight: 800, color: P.gold, letterSpacing: "0.15em", marginBottom: 10 }}>REPORT TYPE</div>
              {REPORT_TYPES.map(rt => (
                <div key={rt.id} onClick={() => set("reportType", rt.id)}
                  style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 10px", marginBottom: 5,
                    background: config.reportType === rt.id ? `${P.gold}12` : "#080D18",
                    border: `1px solid ${config.reportType === rt.id ? P.gold + "50" : P.b + "20"}`,
                    borderRadius: 7, cursor: "pointer" }}>
                  <span style={{ fontSize: 14 }}>{rt.icon}</span>
                  <span style={{ fontSize: 9, color: config.reportType === rt.id ? P.gold : P.t2, fontWeight: config.reportType === rt.id ? 700 : 400 }}>{rt.label}</span>
                  {config.reportType === rt.id && <span style={{ marginLeft: "auto", color: P.gold, fontSize: 10 }}>●</span>}
                </div>
              ))}
            </div>

            {/* Filters */}
            <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "14px" }}>
              <div style={{ fontSize: 8, fontWeight: 800, color: P.blue, letterSpacing: "0.15em", marginBottom: 10 }}>FILTERS</div>
              {[["Era", "era", ERAS], ["Service Branch", "branch", BRANCHES], ["Confidence Level", "confidence", CONF_LEVELS]].map(([label, key, opts]) => (
                <div key={key} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 7, color: P.t4, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                  <select value={config[key]} onChange={e => set(key, e.target.value)} style={inp}>
                    {opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}

              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 7, color: P.t4, textTransform: "uppercase", marginBottom: 4 }}>Custom Query / Focus Area</div>
                <textarea value={config.customQuery} onChange={e => set("customQuery", e.target.value)}
                  placeholder="e.g. 'Focus on 1968 Tet escalation cohort' or 'Emphasize FOIA pathway priorities'..."
                  style={{ ...inp, height: 60, resize: "vertical" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[["includeCharts", "Include Statistical Charts"], ["includeCitations", "Include Full Citations"], ["includeFOIA", "Include FOIA Pathway"]].map(([key, label]) => (
                  <label key={key} style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                    <input type="checkbox" checked={config[key]} onChange={e => set(key, e.target.checked)}
                      style={{ accentColor: P.gold }} />
                    <span style={{ fontSize: 8, color: P.t2 }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Database selection */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* U.S. Databases */}
            <div style={{ background: P.card, border: `1px solid #3b82f630`, borderTop: `3px solid #3b82f6`, borderRadius: 10, padding: "14px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                <span>🇺🇸</span>
                <div style={{ fontSize: 8, fontWeight: 800, color: "#93c5fd", letterSpacing: "0.15em" }}>
                  U.S. DATABASES ({US_DATABASES.length})
                </div>
                <button onClick={() => set("usDatabases", config.usDatabases.length === US_DATABASES.length ? [] : US_DATABASES.map(d => d.id))}
                  style={{ marginLeft: "auto", fontSize: 7, padding: "2px 8px", cursor: "pointer",
                    background: "transparent", border: `1px solid ${P.b}`, color: P.t4, borderRadius: 4 }}>
                  {config.usDatabases.length === US_DATABASES.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              {US_DATABASES.map(db => (
                <div key={db.id} onClick={() => toggleDB("usDatabases", db.id)}
                  style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "7px 9px", marginBottom: 4,
                    background: config.usDatabases.includes(db.id) ? "#0a1628" : "#080D18",
                    border: `1px solid ${config.usDatabases.includes(db.id) ? "#3b82f640" : P.b + "15"}`,
                    borderRadius: 6, cursor: "pointer" }}>
                  <span style={{ fontSize: 10, flexShrink: 0, marginTop: 1 }}>{config.usDatabases.includes(db.id) ? "☑" : "☐"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 2 }}>
                      <TierBadge tier={db.tier} />
                      <span style={{ fontSize: 7, color: P.t4 }}>{db.access}</span>
                    </div>
                    <div style={{ fontSize: 8, color: config.usDatabases.includes(db.id) ? "#93c5fd" : P.t3, lineHeight: 1.4 }}>{db.label}</div>
                    <div style={{ fontSize: 7, color: P.t4 }}>{db.agency}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mexico Databases */}
            <div style={{ background: P.card, border: `1px solid #ef444430`, borderTop: `3px solid #ef4444`, borderRadius: 10, padding: "14px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                <span>🇲🇽</span>
                <div style={{ fontSize: 8, fontWeight: 800, color: "#fca5a5", letterSpacing: "0.15em" }}>
                  MEXICO DATABASES ({MX_DATABASES.length})
                </div>
                <button onClick={() => set("mxDatabases", config.mxDatabases.length === MX_DATABASES.length ? [] : MX_DATABASES.map(d => d.id))}
                  style={{ marginLeft: "auto", fontSize: 7, padding: "2px 8px", cursor: "pointer",
                    background: "transparent", border: `1px solid ${P.b}`, color: P.t4, borderRadius: 4 }}>
                  {config.mxDatabases.length === MX_DATABASES.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              {MX_DATABASES.map(db => (
                <div key={db.id} onClick={() => toggleDB("mxDatabases", db.id)}
                  style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "7px 9px", marginBottom: 4,
                    background: config.mxDatabases.includes(db.id) ? "#1c0a0a" : "#080D18",
                    border: `1px solid ${config.mxDatabases.includes(db.id) ? "#ef444440" : P.b + "15"}`,
                    borderRadius: 6, cursor: "pointer" }}>
                  <span style={{ fontSize: 10, flexShrink: 0, marginTop: 1 }}>{config.mxDatabases.includes(db.id) ? "☑" : "☐"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 2 }}>
                      <TierBadge tier={db.tier} />
                      <span style={{ fontSize: 7, color: P.t4 }}>{db.access}</span>
                    </div>
                    <div style={{ fontSize: 8, color: config.mxDatabases.includes(db.id) ? "#fca5a5" : P.t3, lineHeight: 1.4 }}>{db.label}</div>
                    <div style={{ fontSize: 7, color: P.t4 }}>{db.agency}</div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={generateReport} disabled={generating}
              style={{ padding: "13px", fontSize: 10, fontWeight: 800, cursor: generating ? "not-allowed" : "pointer",
                background: generating ? P.b : `linear-gradient(135deg, ${P.gold}, ${P.amber})`,
                border: "none", color: generating ? P.t4 : "#000", borderRadius: 9,
                fontFamily: "'IBM Plex Mono',monospace" }}>
              {generating ? "⟳ Generating Report with Claude Sonnet..." : "⚡ Generate Intelligence Report"}
            </button>
            {generating && (
              <div style={{ fontSize: 8, color: P.t4, textAlign: "center" }}>
                Using Claude Sonnet (uses more integration credits)
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === "report" && report && (
        <ReportOutput report={report} config={config} />
      )}
    </div>
  );
}