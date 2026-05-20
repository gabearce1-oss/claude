import { useState } from "react";
import { P } from "../../lib/teData";

const CANTON_PROFILE = {
  name: "Paul 'Marc' Canton",
  dob: 1971,
  serviceYears: "Mar 29 1991 – 1998",
  rank: "E-3/E-4",
  branch: "U.S. Marine Corps",
  yearsOfService: 7,
  awards: ["National Defence Medal", "Letter of Appreciation", "Service Employment Ribbon", "Good Conduct Medal", "Rifle Marksman Badge"],
  origin: "New Zealand (Warkworth)",
  currentLocation: "Ocala FL (Marion County) — AWAITING REMOVAL",
  currentStatus: "PENDING DEPORTATION — Federal appeal denied Feb 2026",
  criminalRecord: "NONE — No criminal charges ever filed",
  key_fact: "STATELESS — Australia stripped citizenship upon USMC enlistment",
  personalQuote: "I feel like I've been shoved through a crack in the system where no one can find me.",
};

const CONGRESSIONAL_TEMPLATE = [
  {
    section: "Standing",
    content: "Paul Marc Canton is a 7-year U.S. Marine Corps veteran with honorable discharge, awards for meritorious service, and a documented promise of citizenship upon enlistment. He has maintained continuous residence in the United States since service (raised family in Central Florida), voted 8 times since 2004, and paid federal taxes. No criminal record. No security violations. No fraud or misrepresentation beyond the immigration documentation error at entry.",
  },
  {
    section: "The Core Problem",
    content: "Federal Judge's Feb 2026 ruling: Canton's enlistment (Mar 29 1991) is deemed to fall 2 WEEKS AFTER the designated hostility period for the Persian Gulf War ended. This 2-week gap disqualified him from automatic citizenship eligibility under 8 U.S.C. § 1440. He is now STATELESS: New Zealand stripped his citizenship upon USMC enlistment; Australia has refused him. No country will accept him.",
  },
  {
    section: "Why This Matters",
    content: "Canton's case is the cleanest possible argument against the 'bad hombres' narrative. No criminal record. No security issues. Just a technicality: a 2-week gap in military designation that transforms a decorated Marine into a stateless person scheduled for removal. This demonstrates institutional betrayal at its most structural.",
  },
  {
    section: "Available Remedies",
    content: [
      "Private Bill (Congressional): Granting citizenship to Canton directly via S.XXXX/H.XXXX",
      "USCIS Reopening: Reconsideration of citizenship application based on recruiter-promise documentation and service merit",
      "DHS Discretionary Stay: Temporary halt to removal pending legislative resolution",
      "VVPA Amendment: Extend Veterans' Visa Protection Act to include stateless service members",
    ],
  },
  {
    section: "Supporting Documentation",
    content: [
      "Military.com investigative report (Mar 12 2026)",
      "WFTV Channel 9 local news (Mar 11 2026)",
      "NZ Herald international coverage (Mar 16 2026)",
      "Federal court ruling (Feb 2026) — available for briefing exhibit",
      "Recruiter-promise documentation (in service record)",
      "DD-214 (honorable discharge certificate)",
      "Voter registration history (8 votes since 2004)",
      "Tax returns (continuous federal contribution)",
      "Family documentation (wife deceased; two adult sons)",
    ],
  },
  {
    section: "AUMER Foundation Offerings",
    content: [
      "Legal filing support: Template complaint + amicus letter coordination with other veteran advocacy orgs",
      "Media amplification: Press release, Congressional testimony preparation, news outlet briefing",
      "Congressional relationship management: Direct introductions to Duckworth, Moulton, CHC co-chairs, Randy Fine",
      "International coordination: Liaison with NZ/AU consulates on stateless status resolution",
    ],
  },
];

const TIMELINE = [
  { year: 1971, event: "Paul Marc Canton born (New Zealand)" },
  { year: 1991, event: "Mar 29: Enlists U.S. Marine Corps (2 weeks AFTER Persian Gulf hostility end date)" },
  { year: 1993, event: "Deploys Okinawa; near-Somalia deployment" },
  { year: 1998, event: "Honorably discharged from USMC" },
  { year: 2004, event: "Begins voting (8 times through 2024 — federal taxes, jury duty, community service)" },
  { year: 2020, event: "Canton begins immigration benefit application (citizenship promised at enlistment)" },
  { year: 2024, event: "USCIS denial triggers deportation proceedings" },
  { year: 2026, event: "Feb: Federal judge denies appeal (2-week gap ruling)" },
  { year: 2026, event: "Mar 11: WFTV, Military.com coverage begins" },
  { year: 2026, event: "Apr 21: This briefing — URGENT congressional action needed" },
];

const PRECEDENTS = [
  { case: "George Retes (2025)", detail: "U.S. citizen born abroad to military parents; wrongful detention; FTCA settlement established precedent", outcome: "Precedent for wrongful-detention liability; federal recognition of citizen status" },
  { case: "Jilmar Ramos-Gomez (2022)", detail: "U.S. citizen Marine wrongfully detained by ICE 3 days; FTCA suit settled $190K", outcome: "FTCA liability established; settlement framework available" },
];

export default function CantonCongressionalCase() {
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: P.t1, background: P.bg, minHeight: "100vh", padding: "20px" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(90deg,${P.red},#0D1525)`, border: `2px solid ${P.red}40`, borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ fontSize: 7, color: P.red, letterSpacing: 3, fontWeight: 800, marginBottom: 6 }}>🚨 CONGRESSIONAL PRIORITY CASE</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: P.t1, marginBottom: 12 }}>Paul "Marc" Canton — Stateless U.S. Marine</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          {[
            { label: "Service", value: "7 yrs USMC", color: P.gold },
            { label: "Criminal Record", value: "NONE", color: P.teal },
            { label: "Status", value: "STATELESS", color: P.red },
            { label: "Deportation", value: "PENDING", color: P.red },
            { label: "Awards", value: "5 medals", color: P.gold },
          ].map(item => (
            <div key={item.label} style={{ background: `${item.color}15`, border: `1px solid ${item.color}30`, borderRadius: 8, padding: "6px 12px" }}>
              <div style={{ fontSize: 7, color: P.t4, marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 8, color: P.t3, fontStyle: "italic", lineHeight: 1.8 }}>
          "{CANTON_PROFILE.personalQuote}"
        </div>
      </div>

      {/* Quick facts */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, marginBottom: 12 }}>⚡ Why Canton Matters for CHC Briefing</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          {[
            { icon: "✓", title: "No Criminal Overlay", desc: "Cleanest case possible — rebuts 'bad hombres' narrative entirely." },
            { icon: "⚖️", title: "Structural Betrayal Only", desc: "2-week Persian Gulf gap creates technicality with catastrophic outcome." },
            { icon: "🌍", title: "Stateless Status", desc: "NZ stripped citizenship on enlistment; Australia refuses him; no country accepts him." },
            { icon: "⏰", title: "Deportation IMMINENT", desc: "Federal ruling Feb 2026; removal PENDING April 2026; weeks remain." },
          ].map((item, i) => (
            <div key={i} style={{ background: "#080D18", borderRadius: 8, border: `1px solid ${P.b}`, padding: "12px", borderLeft: `3px solid ${P.gold}` }}>
              <div style={{ fontSize: 14, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 8, fontWeight: 800, color: P.gold, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 7, color: P.t3, lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Congressional template sections */}
      <div style={{ marginBottom: 20 }}>
        {CONGRESSIONAL_TEMPLATE.map((section, i) => (
          <div
            key={i}
            onClick={() => setExpandedSection(expandedSection === i ? null : i)}
            style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 12, padding: "14px 16px", marginBottom: 8, cursor: "pointer", transition: "all .2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: P.gold }}>{section.section}</div>
              <span style={{ fontSize: 12, color: P.t4 }}>{expandedSection === i ? "−" : "+"}</span>
            </div>
            {expandedSection === i && (
              <div style={{ marginTop: 12, fontSize: 8, color: P.t2, lineHeight: 1.8 }}>
                {Array.isArray(section.content) ? (
                  <ul style={{ marginLeft: 20 }}>
                    {section.content.map((item, j) => (
                      <li key={j} style={{ marginBottom: 6 }}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  section.content
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.teal, marginBottom: 12 }}>📅 Canton Service Timeline</div>
        <div style={{ position: "relative", paddingLeft: 32 }}>
          {TIMELINE.map((item, i) => (
            <div key={i} style={{ marginBottom: 12, position: "relative" }}>
              {i < TIMELINE.length - 1 && <div style={{ position: "absolute", left: 0, top: 20, bottom: -12, width: 2, background: `${P.gold}20` }} />}
              <div style={{ position: "absolute", left: -12, top: 2, width: 18, height: 18, borderRadius: "50%", background: item.event.includes("URGENT") || item.event.includes("PENDING") ? P.red : P.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#000" }}>
                {i + 1}
              </div>
              <div style={{ marginLeft: 20 }}>
                <div style={{ fontSize: 8, fontWeight: 800, color: P.gold, marginBottom: 2 }}>{item.year}</div>
                <div style={{ fontSize: 8, color: P.t2 }}>{item.event}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Precedents */}
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.blue, marginBottom: 12 }}>⚖️ Legal Precedents</div>
        {PRECEDENTS.map((p, i) => (
          <div key={i} style={{ background: "#080D18", borderRadius: 8, padding: "10px 12px", marginBottom: 8, borderLeft: `3px solid ${P.blue}` }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: P.blue, marginBottom: 3 }}>{p.case}</div>
            <div style={{ fontSize: 7, color: P.t3, marginBottom: 4 }}>{p.detail}</div>
            <div style={{ fontSize: 7, color: P.teal, fontWeight: 700 }}>→ {p.outcome}</div>
          </div>
        ))}
      </div>

      {/* Urgent action items */}
      <div style={{ background: `${P.red}10`, border: `2px solid ${P.red}30`, borderRadius: 12, padding: "16px 20px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.red, marginBottom: 12 }}>🚨 IMMEDIATE ACTIONS (April 2026)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          {[
            { action: "Congressional Private Bill", responsible: "CHC co-chairs + Duckworth + Moulton", timeline: "WEEK 1" },
            { action: "Amicus Letter Coalition", responsible: "AUMER + VFA + HDDD Coalition", timeline: "WEEK 1" },
            { action: "DHS Discretionary Stay", responsible: "DoJ + DHS coordination", timeline: "WEEK 1-2" },
            { action: "Media Campaign", responsible: "Military.com + news outlets", timeline: "WEEK 2" },
          ].map((item, i) => (
            <div key={i} style={{ background: "#0A0F1E", borderRadius: 8, padding: "10px 12px", border: `1px solid ${P.red}30` }}>
              <div style={{ fontSize: 7, fontWeight: 800, color: P.red, marginBottom: 4 }}>{item.action}</div>
              <div style={{ fontSize: 6, color: P.t4, marginBottom: 3 }}>Lead: {item.responsible}</div>
              <div style={{ fontSize: 7, fontWeight: 700, color: P.red }}>Timeline: {item.timeline}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20, padding: "16px 20px", background: `${P.gold}08`, border: `1px solid ${P.gold}25`, borderRadius: 12, fontSize: 8, color: P.t3, lineHeight: 1.8 }}>
        <strong style={{ color: P.gold }}>Status:</strong> Congressional template ready. Advocacy letter drafted (per user specifications). Field-deployment authorization pending. Coordinate with Rep. Randy Fine (R-FL), Duckworth, Moulton, CHC co-chairs, and Canton's counsel Elizabeth Ricci.
      </div>
    </div>
  );
}