import { useState } from "react";
import { P } from "../../lib/teData";

// ─── DATA ────────────────────────────────────────────────────────────────────

const BORDER_CITIES = [
  {
    city: "Tijuana", state: "Baja California", cross: "San Diego, CA",
    tier: "Primary Hub", color: P.teal, icon: "🏠",
    org: "Deported Veterans Support House (\"The Bunker\")",
    status: "Active – Veteran-Specific",
    risk: "Moderate",
    notes: "Most visible, longest-established hub. VA clinics accessible. Many veterans stabilize here, then relocate to Rosarito.",
    contacts: "bunker@deportedveterans.org",
    url: "https://deportedveteranssupport.org",
  },
  {
    city: "Ciudad Juárez", state: "Chihuahua", cross: "El Paso, TX",
    tier: "Primary Hub", color: P.teal, icon: "🏠",
    org: "Deported Veterans Support House Juárez (\"Juárez Bunker\")",
    status: "Active – Veteran-Specific",
    risk: "CRITICAL – Cartel targeting",
    notes: "Second-largest hub. Led by veterans incl. Ivan Ocon (recently repatriated). Cartels actively profile deportees with military bearing for forced recruitment. House acts as concealment shield.",
    contacts: "Contact via Tijuana Bunker network",
    url: "https://borderreport.org",
  },
  {
    city: "Rosarito", state: "Baja California", cross: "~30min south of Tijuana",
    tier: "Residential Satellite", color: P.blue, icon: "🏘️",
    org: "Informal veteran housing network",
    status: "Informal – No official shelter",
    risk: "Low",
    notes: "Post-stabilization relocation point. Cheaper rent, calmer environment. Veterans maintain access to Tijuana VA resources while avoiding border chaos.",
    contacts: "Via Tijuana Bunker referral",
    url: null,
  },
  {
    city: "Nogales", state: "Sonora", cross: "Nogales, AZ",
    tier: "Transit / Gap City", color: P.amber, icon: "⚠️",
    org: "Kino Border Initiative (KBI) – general migrant aid",
    status: "No veteran-specific shelter",
    risk: "Moderate",
    notes: "Major Arizona deportation repatriation point. KBI provides food, first aid, clothing near port of entry. No veteran long-term housing — most transit to Tijuana or Juárez rapidly.",
    contacts: "Kino Border Initiative: (520) 287-2370",
    url: "https://www.kinoborderinitiative.org",
  },
  {
    city: "Nuevo Laredo", state: "Tamaulipas", cross: "Laredo, TX",
    tier: "Danger Zone", color: P.red, icon: "🔴",
    org: "Mexican government tent shelters (Jan 2025 mass deportation infrastructure)",
    status: "No veteran safe house – security risk",
    risk: "CRITICAL – Cartel control",
    notes: "New mass deportation infrastructure built Jan 2025. No public veteran safe house exists due to extreme cartel activity. Veterans advised to leave city immediately, transit to Monterrey or CDMX.",
    contacts: null,
    url: null,
  },
  {
    city: "Reynosa", state: "Tamaulipas", cross: "McAllen, TX",
    tier: "Danger Zone", color: P.red, icon: "🔴",
    org: "General migrant shelters only",
    status: "No veteran safe house – zone of silence",
    risk: "CRITICAL – Cartel control",
    notes: "Operating a dedicated veteran house here is considered too dangerous. Veterans deported here advised to immediately move to Monterrey or inland.",
    contacts: null,
    url: null,
  },
];

const DATABASES = [
  {
    id: "trac",
    name: "TRAC Immigration",
    org: "Syracuse University",
    tier: "Immigration Trail",
    color: P.blue,
    icon: "📊",
    purpose: "Massive FOIA-derived immigration court records. Spot anomalies — LPRs with long US residence deported for aggravated felonies = potential veteran cases.",
    key_fields: ["Case demographics", "Court dates", "Charge type", "LPR status"],
    url: "https://trac.syr.edu/immigration/",
    foia_required: false,
    access: "Public",
  },
  {
    id: "ice_locator",
    name: "ICE Detainee Locator (ODLS)",
    org: "ICE / DHS",
    tier: "Immigration Trail",
    color: P.blue,
    icon: "🔍",
    purpose: "Find people currently in ICE custody. First 'ping' when a veteran goes missing. Only works for currently detained — not post-deportation.",
    key_fields: ["A-Number", "Full name", "Country of birth"],
    url: "https://locator.ice.gov/odls",
    foia_required: false,
    access: "Public (current detainees only)",
  },
  {
    id: "eoir",
    name: "EOIR Case Status / FOIA Library",
    org: "DOJ / Executive Office for Immigration Review",
    tier: "Immigration Trail",
    color: P.blue,
    icon: "⚖️",
    purpose: "Full immigration court case history. With A-Number, see exact deportation order date. FOIA Library has monthly case data dumps (Feb 2026 available).",
    key_fields: ["A-Number", "Case hearing dates", "Deportation order date"],
    url: "https://acis.eoir.justice.gov",
    foia_required: false,
    access: "Public + FOIA data downloads",
    foia_library: "https://www.justice.gov/eoir/foia-library",
  },
  {
    id: "ddp",
    name: "Deportation Data Project",
    org: "Independent FOIA litigation project",
    tier: "Immigration Trail",
    color: P.blue,
    icon: "📦",
    purpose: "Raw ICE/DHS/EOIR data obtained via litigation. More granular than official reports. Filter Encounter and Removal datasets by region/date to find case identifiers for targeted FOIA requests.",
    key_fields: ["Port of entry", "Removal date", "Demographics", "Encounter data"],
    url: "https://deportationdata.org",
    foia_required: false,
    access: "Public download",
  },
  {
    id: "birls",
    name: "BIRLS Death File",
    org: "VA / Reclaim The Records (FOIA litigation)",
    tier: "Military Trail",
    color: P.gold,
    icon: "📋",
    purpose: "VA list of deceased veterans. Confirm if a 'missing' deported veteran has died in exile. Won via federal court case (SDNY 2020). 1.5M+ records now public. Use birls.org search.",
    key_fields: ["Veteran name", "DOB", "Death date", "Service branch", "SSN (partial)"],
    url: "https://www.birls.org",
    foia_required: false,
    access: "Public search + bulk download",
    note: "VA suddenly stopped providing XC-Files via FOIA in July 2025 — Reclaim The Records pursuing legal action.",
  },
  {
    id: "aad_nara",
    name: "NARA AAD (Access to Archival Databases)",
    org: "National Archives",
    tier: "Military Trail",
    color: P.gold,
    icon: "🗄️",
    purpose: "Best for Vietnam-era and earlier. Contains Combat Area Casualties, POW data, and Enlistment Records. A 'hit' here is proof of military identity.",
    key_fields: ["Name", "Service era", "Unit", "Enlistment date"],
    url: "https://aad.archives.gov/aad/series-description.jsp?s=512&cat=WR28&bc=,sl",
    foia_required: false,
    access: "Public",
  },
  {
    id: "nprc",
    name: "NPRC / NARA DD-214 Request",
    org: "National Personnel Records Center",
    tier: "Military Trail",
    color: P.gold,
    icon: "📄",
    purpose: "Retrieve DD-214 (Report of Separation). Proves character of discharge — critical for VA benefits eligibility. OTH may still allow some benefits; Dishonorable disqualifies.",
    key_fields: ["Full name", "SSN or Service Number", "Date of birth", "Branch"],
    url: "https://www.archives.gov/veterans/military-service-records",
    foia_required: true,
    access: "Via online request system (eVetRecs)",
  },
  {
    id: "fold3",
    name: "Fold3 (by Ancestry)",
    org: "Ancestry.com",
    tier: "Military Trail",
    color: P.gold,
    icon: "📚",
    purpose: "Commercial military records database. Digitizes Unit Rosters and Muster Rolls not indexed by government. If veteran's unit is known, search unit records to find service number unlocking other federal searches.",
    key_fields: ["Name", "Unit", "Theater of operations"],
    url: "https://www.fold3.com",
    foia_required: false,
    access: "Paid subscription",
  },
  {
    id: "vrss",
    name: "VRSS (Veterans Reentry Search Service)",
    org: "VA / DOJ",
    tier: "Restricted",
    color: P.red,
    icon: "🔒",
    purpose: "Identifies veterans in prison or jail. Many deported veterans end up in US federal custody for 'illegal reentry' under a strictly 'alien' identity. Attorney access only.",
    key_fields: ["Name", "SSN", "Inmate roster"],
    url: "https://vrss.va.gov",
    foia_required: false,
    access: "Restricted — VSO/Attorney only",
  },
  {
    id: "censoc",
    name: "CenSoc WWII Army Enlistment Dataset",
    org: "UC Berkeley / NARA RG 147",
    tier: "Military Trail",
    color: P.gold,
    icon: "🎖️",
    purpose: "9M+ enlistment records for Army (incl. Air Corps, WAC, ERC). Used to cross-reference BIRLS for Army serial numbers. Key for Mexican-national veteran identification.",
    key_fields: ["Name", "Enlistment date", "Army serial number", "State of residence"],
    url: "https://censoc.berkeley.edu",
    foia_required: false,
    access: "Free public download",
  },
];

const FORENSIC_STEPS = [
  {
    step: 1, label: "Verify Service (Military Trail)",
    action: "Search AAD (NARA) or CenSoc for enlistment record. Request DD-214 from NPRC.",
    tool: "AAD / NPRC / Fold3",
    key_data: "Name + Service Era",
    color: P.gold,
  },
  {
    step: 2, label: "Locate Case ID (Immigration Trail)",
    action: "Use EOIR Case Info with A-Number or biographical details. Pull from old family documents or prior court filings.",
    tool: "EOIR Automated Case Info",
    key_data: "A-Number or Name + DOB + COB",
    color: P.blue,
  },
  {
    step: 3, label: "Pull Full A-File (FOIA Request)",
    action: "File FOIA with USCIS for A-File. Look for Form I-213 — officers sometimes note 'Subject claims US Army service' in narrative even without checking the veteran box.",
    tool: "USCIS FOIA",
    key_data: "A-Number",
    color: P.blue,
  },
  {
    step: 4, label: "Track Removal (Data Analysis)",
    action: "Cross-reference Deportation Data Project Encounter/Removal datasets filtered by date + port of entry to confirm deportation event.",
    tool: "Deportation Data Project",
    key_data: "Date of removal + Port of entry",
    color: P.blue,
  },
  {
    step: 5, label: "Locate Person (Open Source)",
    action: "Search Infobel (Mexico) for landline/address. Run 'Reverse Family Search' on US-based relatives via TruePeopleSearch — veterans in exile maintain digital links through family.",
    tool: "Infobel / TruePeopleSearch / Facebook",
    key_data: "Name + Last known city",
    color: P.teal,
  },
  {
    step: 6, label: "Check for Reentry Detention",
    action: "If veteran attempted illegal reentry, check VRSS (via attorney) — they may be in federal custody under 'alien' identity with no veteran flag.",
    tool: "VRSS (via VSO/Attorney)",
    key_data: "Name + SSN",
    color: P.red,
  },
  {
    step: 7, label: "Ground Truth Verification",
    action: "Cross-reference shelter rosters (Tijuana/Juárez Bunker physical sign-in sheets) against digital missing lists. Legal clinic parole/pardon applications also create trackable records.",
    tool: "Shelter network + Legal clinic filings",
    key_data: "Name + Physical shelter logs",
    color: P.teal,
  },
];

const TIER_TABS = ["Border Cities", "Databases", "Forensic Protocol"];
const TIER_COLORS = { "Immigration Trail": P.blue, "Military Trail": P.gold, "Restricted": P.red };

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function Tag({ color, children }) {
  return (
    <span style={{ fontSize: 7, padding: "2px 7px", borderRadius: 4, fontWeight: 700,
      background: `${color}18`, border: `1px solid ${color}35`, color }}>
      {children}
    </span>
  );
}

function SectionLabel({ color, children }) {
  return (
    <div style={{ fontSize: 8, fontWeight: 800, color: color || P.gold,
      letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>
      {children}
    </div>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────

function BorderCitiesTab() {
  const [sel, setSel] = useState(null);
  const tiers = ["Primary Hub", "Residential Satellite", "Transit / Gap City", "Danger Zone"];
  const tierColors = { "Primary Hub": P.teal, "Residential Satellite": P.blue, "Transit / Gap City": P.amber, "Danger Zone": P.red };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
        {tiers.map(t => {
          const cnt = BORDER_CITIES.filter(c => c.tier === t).length;
          const c = tierColors[t];
          return (
            <div key={t} style={{ padding: "10px 14px", border: `1px solid ${c}30`, borderTop: `3px solid ${c}`, borderRadius: 8, background: P.card }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: c }}>{t}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: c, marginTop: 4 }}>{cnt}</div>
              <div style={{ fontSize: 7, color: P.t4 }}>cities documented</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 10 }}>
        {BORDER_CITIES.map(city => {
          const isSel = sel === city.city;
          const tc = tierColors[city.tier];
          return (
            <div key={city.city}
              style={{ border: `1px solid ${tc}35`, borderLeft: `5px solid ${tc}`,
                background: isSel ? `${tc}08` : P.card, borderRadius: 9, padding: "12px 14px",
                cursor: "pointer", transition: "all .12s" }}
              onClick={() => setSel(isSel ? null : city.city)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: P.t1 }}>
                    {city.icon} {city.city}, {city.state}
                  </div>
                  <div style={{ fontSize: 8, color: P.t4, marginTop: 1 }}>↔ {city.cross}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                  <Tag color={tc}>{city.tier}</Tag>
                  <Tag color={city.risk.startsWith("CRITICAL") ? P.red : city.risk === "Moderate" ? P.amber : P.teal}>
                    Risk: {city.risk}
                  </Tag>
                </div>
              </div>

              <div style={{ fontSize: 9, fontWeight: 700, color: tc, marginBottom: 4 }}>{city.org}</div>
              <div style={{ fontSize: 8, color: P.t4, marginBottom: 4 }}>{city.status}</div>

              {isSel && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${P.b}30` }}>
                  <div style={{ fontSize: 9, color: P.t2, lineHeight: 1.7, marginBottom: 8 }}>{city.notes}</div>
                  {city.contacts && (
                    <div style={{ fontSize: 8, color: P.t3 }}>📞 {city.contacts}</div>
                  )}
                  {city.url && (
                    <a href={city.url} target="_blank" rel="noreferrer"
                      style={{ fontSize: 8, color: P.blue, textDecoration: "none", display: "block", marginTop: 4 }}>
                      🔗 {city.url.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DatabasesTab() {
  const [sel, setSel] = useState(null);
  const tiers = ["Immigration Trail", "Military Trail", "Restricted"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {tiers.map(tier => {
        const dbs = DATABASES.filter(d => d.tier === tier);
        const tc = TIER_COLORS[tier];
        return (
          <div key={tier}>
            <div style={{ padding: "6px 12px", background: `${tc}12`, borderLeft: `4px solid ${tc}`,
              borderRadius: 6, fontSize: 8, fontWeight: 800, color: tc, letterSpacing: "0.15em",
              textTransform: "uppercase", marginBottom: 10 }}>
              {tier} — {dbs.length} databases
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 8 }}>
              {dbs.map(db => {
                const isSel = sel === db.id;
                return (
                  <div key={db.id}
                    style={{ border: `1px solid ${db.color}30`, borderTop: `3px solid ${db.color}`,
                      background: isSel ? `${db.color}06` : P.card, borderRadius: 8, padding: "10px 12px",
                      cursor: "pointer", transition: "all .12s" }}
                    onClick={() => setSel(isSel ? null : db.id)}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: db.color }}>
                          {db.icon} {db.name}
                        </div>
                        <div style={{ fontSize: 7, color: P.t4, marginTop: 1 }}>{db.org}</div>
                      </div>
                      <Tag color={db.access.includes("Public") ? P.teal : db.access.includes("Restricted") ? P.red : P.amber}>
                        {db.foia_required ? "FOIA Req." : db.access.includes("Paid") ? "Paid" : db.access.includes("Restricted") ? "Restricted" : "Public"}
                      </Tag>
                    </div>

                    <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.6 }}>
                      {db.purpose.slice(0, isSel ? 9999 : 120)}{!isSel && db.purpose.length > 120 ? "..." : ""}
                    </div>

                    {isSel && (
                      <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${P.b}20` }}>
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 7, color: P.t4, marginBottom: 3, textTransform: "uppercase" }}>Key Fields Needed</div>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {db.key_fields.map(f => <Tag key={f} color={db.color}>{f}</Tag>)}
                          </div>
                        </div>
                        {db.note && (
                          <div style={{ padding: "6px 8px", background: `${P.amber}10`, border: `1px solid ${P.amber}25`,
                            borderRadius: 5, fontSize: 8, color: P.amber, lineHeight: 1.6, marginBottom: 8 }}>
                            ⚠ {db.note}
                          </div>
                        )}
                        {db.url && (
                          <a href={db.url} target="_blank" rel="noreferrer"
                            style={{ fontSize: 8, color: db.color, textDecoration: "none", display: "block" }}>
                            🔗 {db.url.replace(/^https?:\/\//, "")}
                          </a>
                        )}
                        {db.foia_library && (
                          <a href={db.foia_library} target="_blank" rel="noreferrer"
                            style={{ fontSize: 8, color: P.teal, textDecoration: "none", display: "block", marginTop: 2 }}>
                            📋 FOIA Library
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ForensicProtocolTab() {
  const [open, setOpen] = useState(null);

  return (
    <div>
      <div style={{ padding: "12px 16px", background: `${P.gold}08`, border: `1px solid ${P.gold}30`,
        borderRadius: 8, marginBottom: 16, fontSize: 9, color: P.t2, lineHeight: 1.7 }}>
        <strong style={{ color: P.gold }}>Core Principle:</strong> There is no single "master list" of deported veterans.
        ICE does not consistently track veteran status. Forensic methodology = treating the veteran's identity as a cold case,
        linking two disparate identities: the <strong style={{ color: P.gold }}>Service Member</strong> (military records) and
        the <strong style={{ color: P.blue }}>Alien</strong> (immigration records).
        <br /><br />
        <strong style={{ color: P.red }}>Privacy Warning:</strong> Centralized databases of deported veterans are controversial.
        VA-DHS data sharing has historically led to more deportations, not aid. Handle all data with strict privacy controls.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {FORENSIC_STEPS.map((s, idx) => {
          const isOpen = open === s.step;
          return (
            <div key={s.step} onClick={() => setOpen(isOpen ? null : s.step)}
              style={{ border: `1px solid ${s.color}30`, borderLeft: `5px solid ${s.color}`,
                background: isOpen ? `${s.color}06` : P.card, borderRadius: 8, padding: "12px 16px",
                cursor: "pointer", transition: "all .12s" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%",
                  background: `${s.color}20`, border: `1px solid ${s.color}50`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, color: s.color, flexShrink: 0 }}>
                  {s.step}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: P.t1 }}>{s.label}</div>
                  <div style={{ fontSize: 8, color: P.t4, marginTop: 1 }}>Tool: {s.tool}</div>
                </div>
                <Tag color={s.color}>{s.key_data}</Tag>
                <span style={{ color: P.t4, fontSize: 10 }}>{isOpen ? "▲" : "▼"}</span>
              </div>

              {isOpen && (
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${P.b}25`,
                  fontSize: 10, color: P.t2, lineHeight: 1.7 }}>
                  {s.action}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick reference table */}
      <div style={{ marginTop: 20, border: `1px solid ${P.b}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", background: P.card, borderBottom: `1px solid ${P.b}`,
          fontSize: 8, fontWeight: 800, color: P.gold, letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Quick Reference — Data Stack Summary
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9 }}>
          <thead>
            <tr style={{ background: "#080D18" }}>
              {["Step", "Goal", "Database / Tool", "Key Data Needed"].map(h => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 7,
                  fontWeight: 800, color: P.t4, borderBottom: `1px solid ${P.b}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FORENSIC_STEPS.map((s, i) => (
              <tr key={s.step} style={{ background: i % 2 === 0 ? P.card : "transparent",
                borderBottom: `1px solid ${P.b}30` }}>
                <td style={{ padding: "7px 12px" }}>
                  <span style={{ color: s.color, fontWeight: 800 }}>{s.step}</span>
                </td>
                <td style={{ padding: "7px 12px", color: P.t2, fontSize: 9 }}>{s.label.split(" (")[0]}</td>
                <td style={{ padding: "7px 12px", color: s.color, fontWeight: 700, fontSize: 9 }}>{s.tool}</td>
                <td style={{ padding: "7px 12px" }}><Tag color={s.color}>{s.key_data}</Tag></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function ForensicResearchHub() {
  const [tab, setTab] = useState("Border Cities");

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: P.t1, padding: "24px 28px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, letterSpacing: "0.22em",
          textTransform: "uppercase", marginBottom: 4 }}>
          FORENSIC INTELLIGENCE · CROSS-BORDER RESEARCH METHODOLOGY
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: P.t1, margin: 0 }}>
          Forensic Research Hub
        </h1>
        <p style={{ fontSize: 10, color: P.t3, marginTop: 5, lineHeight: 1.5 }}>
          Border city intelligence · Database forensics toolkit · 7-step cold-case protocol for locating deported veterans
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 22, borderBottom: `1px solid ${P.b}`, paddingBottom: 12 }}>
        {TIER_TABS.map(t => (
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

      {tab === "Border Cities" && <BorderCitiesTab />}
      {tab === "Databases" && <DatabasesTab />}
      {tab === "Forensic Protocol" && <ForensicProtocolTab />}
    </div>
  );
}