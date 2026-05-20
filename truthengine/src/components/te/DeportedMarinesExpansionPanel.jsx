import { useState } from "react";
import { InvokeLLM } from "@base44/sdk/modules/ai.js";
import { P } from "../../lib/teData";

const RECORDS = [
  {
    id: 7, name: "Roman Sabal", dob: "1961 (est)", dod: null,
    rank: "Sergeant (E-5)", branch: "U.S. Marine Corps + Army Reserve",
    service: "6 yrs USMC + several yrs USAR (1980s–1990s)",
    discharge: "Honorable", origin: "Belize", state: "California",
    casualty: "Survived", charge: "Deportation order (in absentia 2008)",
    chargeType: "Immigration/Procedural", yearDeported: 2008,
    dest: "Belize", destState: "N/A",
    alive: true, located: "Returned U.S. 2020 (now U.S. citizen)",
    family: "Two U.S. citizen children; fiancée U.S. citizen",
    interview: true, confidence: 95, tier: 2,
    notes: "Enlisted USMC on fake ID 1980s (tourist visa) — told 'you're a Marine now' at boot camp. Applied citizenship 1995. Returned Belize 2008 for diabetes treatment — triggered in-absentia deportation order. Denied parole at San Ysidro July 2019 despite scheduled naturalization interview. Filed federal lawsuit; WON Oct 27 2020. Now U.S. citizen. Duckworth-named inspiration for Strengthening Citizenship Services for Veterans Act (Feb 2020). Legal template case for all deported-vet parole denials.",
    sources: "Marine Corps Times (2019/2020), Military Times (Oct 27 2020), San Diego Union-Tribune (2019), KPBS (2019)",
    vector: "Service(3),Rank(3),Casualty(0),Discharge(3),Origin(2),Deportation_Year(2008),Family_Impact(3)",
    landmark: "WON federal lawsuit — legal template for parole denials",
  },
  {
    id: 8, name: "Marco Antonio Chavez", dob: "1972 (est)", dod: null,
    rank: "E-3 (est)", branch: "U.S. Marine Corps",
    service: "4 years (1990s)", discharge: "Honorable",
    origin: "Mexico", state: "California",
    casualty: "Survived", charge: "Animal cruelty (1998)",
    chargeType: "Violence (minor/non-human)", yearDeported: 2002,
    dest: "Mexico", destState: "Tijuana",
    alive: true, located: "Returned U.S. Dec 21 2017",
    family: "Three sons in Iowa; ex-wife U.S. citizen",
    interview: true, confidence: 95, tier: 2,
    notes: "Served Camp Pendleton. Brought to California as INFANT. Deported 2002; 15 years in Tijuana. Pardoned Easter 2017 by CA Gov. Jerry Brown. FIRST deported veteran to regain LPR status after governor's pardon (Dec 2017) — historic precedent case. ACLU cites this case for all subsequent gubernatorial-pardon pathway cases.",
    sources: "ACLU of SoCal (Dec 18 2017), CBS News KFMB, NBC 7 San Diego, Marine Corps Times (Dec 19 2017)",
    vector: "Service(3),Rank(2),Casualty(0),Discharge(3),Origin(1),Deportation_Year(2002),Family_Impact(4)",
    landmark: "FIRST deported vet to regain LPR via gubernatorial pardon",
  },
  {
    id: 9, name: "Erasmo Apodaca Mendizabal", dob: "UNKNOWN", dod: "Unknown (pre-pardon)",
    rank: "UNKNOWN", branch: "U.S. Marine Corps",
    service: "Operation Desert Storm era", discharge: "Honorable",
    origin: "Mexico", state: "California",
    casualty: "Deceased (pre-pardon)", charge: "Theft ($500 from ex-girlfriend, 1996)",
    chargeType: "Property", yearDeported: "Circa 1996–2002",
    dest: "Mexico", destState: "Unknown",
    alive: false, located: "Deceased before case review",
    family: "Sister Norma Apodaca documented his case",
    interview: false, confidence: 85, tier: 3,
    notes: "Desert Storm combat veteran. Deported after honorable discharge for $500 theft. Pardoned April 2017 by CA Gov. Jerry Brown alongside Chavez and Barajas. DIED before deportation case could be reviewed (American Homefront 2021 via sister Norma). Exemplifies 'posthumous pardon' injustice — system recognition arrived too late.",
    sources: "San Diego Union-Tribune (April 2017), Army Times (April 17 2017), American Homefront Project/WUNC (June 14 2021)",
    vector: "Service(3),Rank(2),Casualty(1),Discharge(3),Origin(1),Deportation_Year(1996-2002),Deceased(1)",
    landmark: "Posthumous pardon — died before case reviewed",
  },
  {
    id: 10, name: "Cesar Lopez", dob: "1975 (est)", dod: null,
    rank: "E-4 (est)", branch: "U.S. Marine Corps",
    service: "From 1993", discharge: "Honorable (implied)",
    origin: "Mexico (Ciudad Juárez)", state: "Los Angeles CA",
    casualty: "Survived", charge: "2000 conviction (drug/DUI presumed)",
    chargeType: "Drug/DUI", yearDeported: "Circa 2012",
    dest: "Mexico", destState: "Nuevo Laredo/Border",
    alive: true, located: "Las Vegas NV (via NM gubernatorial pardon June 2020)",
    family: "Mother naturalized via Reagan 1986 IRCA; siblings U.S. citizens",
    interview: true, confidence: 90, tier: 2,
    notes: "Enlisted USMC 1993 as LPR. Mother's amnesty citizenship did not transfer. Mexican official at border crossing recognized USMC tattoos and service. NM Gov. Lujan Grisham pardon June 26 2020 (first batch of 19 names). Re-entered U.S. illegally — acknowledges federal re-entry violation but 'at peace.' Active advocate for other deported vets. Netflix documentary subject.",
    sources: "Marine Corps Times (Aug 2020), Las Vegas Sun/AP (Aug 12 2020), Netflix deported-veterans documentary, NM Gov. Lujan Grisham pardon list",
    vector: "Service(3),Rank(2),Casualty(0),Discharge(3),Origin(1),Deportation_Year(2012),Activism_Level(4)",
    landmark: "NM pardon pathway — first batch 19 names June 26 2020",
  },
  {
    id: 11, name: "U.S. Marine (El Salvador — Withheld)", dob: "ca. 1982", dod: null,
    rank: "E-3/E-4 (est)", branch: "U.S. Marine Corps",
    service: "5 years (2 Iraq tours)", discharge: "Honorable (prior to convictions)",
    origin: "El Salvador", state: "California (Long Beach)",
    casualty: "Survived", charge: "DUI, assault with deadly weapon, false imprisonment, narcotics, corporal injury to spouse (2010, 8-yr sentence)",
    chargeType: "PTSD-linked composite", yearDeported: "October 2019",
    dest: "El Salvador", destState: "Unknown (in hiding)",
    alive: true, located: "In hiding — cartel kidnapping risk",
    family: "Mother and family U.S. citizens",
    interview: "Limited", confidence: 95, tier: 2,
    notes: "LPR. Brought to U.S. age 3. TBI + PTSD from Iraq; VA FAILED TO DIAGNOSE for 8 YEARS. Self-medicated → cascading convictions. Requested CA Gov. Newsom pardon — no response. ICE deported secretly ('They woke him up and put him on a plane' — attorney Roy Petty). Jailed by Salvadoran authorities 5 days on arrival. Now hiding from cartels who target deported vets for kidnap/ransom. LULAC Congressional hearing witness Nov 2019.",
    sources: "ABC News/Good Morning America (Oct 18 2019), 12 News Arizona (2019), Fox 5 (2019), LULAC Congressional hearing (Nov 2019)",
    vector: "Service(3),Rank(2),Casualty(0),Discharge(3),Origin(3),Crime_Type(3),TBI_PTSD(3),Cartel_Threat(1)",
    landmark: "LULAC Congressional hearing witness; cartel threat on arrival",
  },
  {
    id: 12, name: "Paul 'Marc' Canton", dob: "1971", dod: null,
    rank: "E-3/E-4", branch: "U.S. Marine Corps",
    service: "7 years (Mar 29 1991–1998)", discharge: "Honorable",
    origin: "New Zealand (via Australia)", state: "Florida",
    casualty: "Survived", charge: "NONE (no criminal record)",
    chargeType: "N/A — structural betrayal only", yearDeported: "PENDING (Feb 2026 ruling)",
    dest: "Likely New Zealand (stateless)", destState: "N/A",
    alive: true, located: "Ocala FL (Marion County) — awaiting removal",
    family: "Widowed; two sons (oldest selling home to fund legal fight)",
    interview: true, confidence: 95, tier: 2,
    notes: "Awards: National Defence Medal, Letter of Appreciation, Good Conduct Medal, Rifle Marksman Badge. Year in Okinawa; near-deployed Somalia 1993. Promised citizenship on honorable discharge. Voted 8 times since 2004 on military service record. Federal judge denied appeal Feb 2026: enlistment was 2 WEEKS after Persian Gulf hostility period ended. STATELESS — Australia stripped citizenship on USMC enlistment. No criminal record. HIGH CHC BRIEFING PRIORITY — clean case demonstrates structural betrayal alone.",
    sources: "Federal court filings (Feb 2026), Marine Corps Times, Attorney Elizabeth Ricci",
    vector: "Service(3),Rank(2),Casualty(0),Discharge(3),Origin(2),Crime_Type(0),Structural_Betrayal(4)",
    landmark: "Zero criminal record — pure structural betrayal; stateless",
  },
  {
    id: 13, name: "Richard Avila", dob: "1954 (est — Vietnam-era)", dod: null,
    rank: "E-3 (est)", branch: "U.S. Marine Corps",
    service: "Vietnam era", discharge: "Honorable (implied)",
    origin: "Mexico", state: "California (presumed — brought as child)",
    casualty: "Survived", charge: "Felony immigration charge (undisclosed)",
    chargeType: "Immigration", yearDeported: 2011,
    dest: "Mexico", destState: "Tijuana",
    alive: true, located: "Tijuana (10+ yrs); naturalization pathway pending",
    family: "Unknown",
    interview: true, confidence: 85, tier: 3,
    notes: "Child immigrant to U.S. VOLUNTEERED for USMC at tail end of Vietnam era. Deported 2011 on felony immigration charge (specific charge undisclosed). 10+ years in Tijuana as of 2021 reporting. Refuses to 'get comfortable' — apartment intentionally minimal. Speaks Spanish with thick American accent; subject to 'pocho' derogation. Hector Barajas DVSH Bunker regular.",
    sources: "American Homefront Project (2021), Hector Barajas DVSH-Tijuana network",
    vector: "Service(3),Rank(2),Casualty(0),Discharge(3),Origin(1),Deportation_Year(2011),Vietnam_Era(1)",
    landmark: "Vietnam-era volunteer; 10+ years Tijuana",
  },
  {
    id: 14, name: "Cuauhtemoc 'Temo' Juarez", dob: "UNKNOWN", dod: null,
    rank: "Sergeant", branch: "U.S. Marine Corps + Army National Guard",
    service: "1995–1999 USMC + Orlando ARNG post-1999", discharge: "Honorable",
    origin: "Mexico", state: "Florida (Orlando)",
    casualty: "Survived", charge: "None — SPOUSE deported 2018",
    chargeType: "N/A — family separation vector", yearDeported: "N/A (Alejandra: 2018)",
    dest: "N/A", destState: "Florida (Temo remained)",
    alive: true, located: "Orlando FL",
    family: "Wife Alejandra deported to Mexico Aug–Sep 2018 with 8-yr-old daughter Estela; 16-yr-old Pamela remained U.S. with Temo",
    interview: true, confidence: 85, tier: 3,
    notes: "USMC infantry 1995–1999 — deployed Africa and South America. Joined Orlando Army National Guard post-Marines. Wife Alejandra crossed border illegally 1998; married Temo 2000. Deported Aug–Sep 2018 despite Marine's service. FAMILY SEPARATION as punishment-by-proxy. Illustrates: Marine service earns no protection for spouse under 1996 IIRIRA framework.",
    sources: "Honorably Discharged Dishonorably Deported Coalition (Fletcher), Orlando Sentinel",
    vector: "Service(3),Rank(3),Casualty(0),Discharge(3),Origin(1),Family_Impact(4),Separation_Vector(1)",
    landmark: "Family separation — spouse deported despite Marine service",
  },
  {
    id: 15, name: "Marine Veteran Ocegueda", dob: "1968 (est — age 53 in 2021)", dod: null,
    rank: "E-3/E-4 (est)", branch: "U.S. Marine Corps",
    service: "1987–1991 active + 4 yrs reserves", discharge: "Honorable",
    origin: "Mexico", state: "California (Artesia)",
    casualty: "Survived", charge: "DUI (drug problem)",
    chargeType: "Drug", yearDeported: "Circa 2012",
    dest: "Mexico", destState: "Unknown",
    alive: true, located: "Southern California (naturalized July 9 2021)",
    family: "Mother and sister at swearing-in; two daughters",
    interview: true, confidence: 85, tier: 3,
    notes: "USMC 1987–1991 active (Camp Pendleton + Japan). 4 yrs reserves. Green card via U.S.-citizen wife; two daughters. Drug problem → DUI → deportation to Mexico. 9 YEARS in Mexico. Became U.S. citizen July 9 2021 via Judge Mark C. Scarsi federal LA courtroom. Wore mask with images of father and late brothers at ceremony. Judge: 'As one American citizen to a soon-to-be American citizen, I just wanted to thank you very much for that.'",
    sources: "American Homefront Project, Judge Mark C. Scarsi courtroom (July 9 2021)",
    vector: "Service(3),Rank(2),Casualty(0),Discharge(3),Origin(1),Deportation_Year(2012),Resolution(3)",
    landmark: "Naturalized July 9 2021 — 9 years after deportation",
  },
  {
    id: 16, name: "Jose Francisco Lopez", dob: "1944 (est — Vietnam veteran)", dod: null,
    rank: "E-3/E-4 (est)", branch: "U.S. Army",
    service: "Vietnam War era", discharge: "Honorable (implied)",
    origin: "Mexico (Torreón)", state: "Unknown",
    casualty: "Survived", charge: "Drug-related crime",
    chargeType: "Drug/PTSD", yearDeported: 2003,
    dest: "Mexico", destState: "Ciudad Juárez",
    alive: true, located: "Ciudad Juárez (Director DVSH-Juárez since 2017)",
    family: "Extended Mexican family",
    interview: true, confidence: 90, tier: 2,
    notes: "NOT USMC — CRITICAL INFRASTRUCTURE NODE. Army Vietnam veteran. Torreón-born. PTSD + addiction post-service → drug conviction → deported 2003. Thought he was only deported vet in Mexico until met Hector Barajas. FOUNDED DVSH-Juárez April 22 2017 as sister chapter to DVSH-Tijuana. Direct access to deported-vet network in Juárez (140 documented / 42 current residents per AUMER Mar 2026). PRIMARY INTERVIEW CONTACT for TruthEngine360 Phase 2 field outreach.",
    sources: "AUMER Foundation (Mar 2026 field report), DVSH-Juárez network, American Homefront Project",
    vector: "Service(3),Rank(2),Casualty(0),Discharge(3),Origin(1),Vietnam_Era(1),Infrastructure(4)",
    landmark: "Founded DVSH-Juárez; gateway to 140-vet Juárez network",
  },
];

const NEW_SOURCES = [
  {
    id: "SS-NEW-001", name: "Selective Service System Records",
    category: "Government & Legal Data", tier: "TIER 1",
    url: "https://www.sss.gov", access: "FOIA",
    use: "Draft registration records and historical military service verification",
    notes: "Critical for Vietnam-era service verification; cross-references DCAS draft lottery data",
  },
  {
    id: "SS-NEW-002", name: "ICE FOIA Library",
    category: "Government & Legal Data", tier: "TIER 1",
    url: "https://www.ice.gov/foia/library", access: "FOIA/Open",
    use: "Critical deportation records and immigration enforcement data",
    notes: "Key source for ENFORCE database records; overdue +81d as of May 2026",
  },
  {
    id: "SS-NEW-003", name: "SRE Acervo Histórico Diplomático",
    category: "Historical Archives", tier: "TIER 1",
    url: "https://acervohistoricodiplomatico.sre.gob.mx", access: "PARTIAL OPEN",
    use: "Consular casualty correspondence and international diplomacy records",
    notes: "Mexico SRE consular records; may contain Vietnam-era death notifications to Mexican families",
  },
  {
    id: "SS-NEW-004", name: "SEDENA Archivo Histórico",
    category: "Historical Archives", tier: "TIER 1",
    url: "https://www.gob.mx/sedena", access: "FOIA/Manual",
    use: "Mexican military records including Cartilla del Servicio Militar Nacional",
    notes: "Cross-reference for dual-national service; links Mexican draft records to DCAS casualties",
  },
];

const TIER_COLOR = { 2: P.gold, 3: P.teal, 1: P.red };
const ACCESS_COLOR = { "FOIA": P.red, "FOIA/Open": P.gold, "PARTIAL OPEN": P.gold, "FOIA/Manual": P.red };

const ConfBar = ({ value, label, color }) => (
  <div style={{ marginBottom: 4 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: P.t3, marginBottom: 2 }}>
      <span>{label}</span><span style={{ color }}>{value}</span>
    </div>
    <div style={{ background: P.b, borderRadius: 2, height: 4 }}>
      <div style={{ background: color, width: `${value}%`, height: 4, borderRadius: 2, transition: "width 0.4s" }} />
    </div>
  </div>
);

export default function DeportedMarinesExpansionPanel() {
  const [tab, setTab] = useState("registry");
  const [selected, setSelected] = useState(RECORDS[0]);
  const [chargeFilter, setChargeFilter] = useState("ALL");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTarget, setAiTarget] = useState(null);

  const CHARGE_TYPES = ["ALL", "Drug/DUI", "Immigration", "PTSD-linked composite", "Violence (minor/non-human)", "Property", "N/A — structural betrayal only", "N/A — family separation vector", "Drug/PTSD", "Drug"];

  const filtered = RECORDS.filter(r => {
    if (chargeFilter !== "ALL" && r.chargeType !== chargeFilter) return false;
    if (tierFilter !== "ALL" && String(r.tier) !== tierFilter) return false;
    return true;
  });

  const runAnalysis = async (record) => {
    setAiLoading(true);
    setAiTarget(record.id);
    setAiAnalysis(null);
    try {
      const res = await InvokeLLM({
        prompt: `Analyze deported veteran case: ${record.name} (Record ${record.id}). Branch: ${record.branch}. Service: ${record.service}. Charge: ${record.charge} (${record.chargeType}). Deported: ${record.yearDeported} to ${record.dest}. Confidence: ${record.confidence}%. Landmark: ${record.landmark}. Notes: ${record.notes}. Provide: (1) IIRIRA/AEDPA legal mechanism likely applied, (2) VA failure assessment if PTSD-related, (3) CHC briefing priority (HIGH/MEDIUM/LOW with rationale), (4) recommended Phase 2 action for AUMER Foundation.`,
        system_prompt: "You are TruthEngine360 case analyst for AUMER Foundation. Analyze deported veteran cases for forensic value, CHC briefing weight, and IIRIRA structural failure patterns. Be concise and actionable. Never fabricate facts. Flag gaps in documentation.",
        response_type: "text",
      });
      setAiAnalysis(res);
    } catch (e) {
      setAiAnalysis("Analysis unavailable.");
    }
    setAiLoading(false);
  };

  const TABS = [
    { key: "registry", label: "CASE REGISTRY" },
    { key: "sources", label: "NEW TIER-1 SOURCES" },
    { key: "summary", label: "EXPANSION SUMMARY" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: P.bg, color: P.t1, fontFamily: "monospace" }}>
      {/* Header */}
      <div style={{ background: P.navy, borderBottom: `1px solid ${P.blue}33`, padding: "10px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: P.gold, letterSpacing: 1 }}>DEPORTED MARINES</span>
          <span style={{ fontSize: 11, color: P.teal }}>EXPANSION REGISTRY · April 2026</span>
          <span style={{ marginLeft: "auto", fontSize: 10, color: P.t3 }}>AUMER Foundation | TruthEngine360</span>
        </div>
        {/* Stats bar */}
        <div style={{ display: "flex", gap: 20, marginBottom: 8, fontSize: 11 }}>
          {[
            { label: "CASES", val: RECORDS.length, color: P.gold },
            { label: "USMC", val: RECORDS.filter(r => r.branch.includes("Marine")).length, color: P.blue },
            { label: "ALIVE", val: RECORDS.filter(r => r.alive === true).length, color: P.teal },
            { label: "DECEASED", val: RECORDS.filter(r => r.alive === false).length, color: P.red },
            { label: "INTERVIEWED", val: RECORDS.filter(r => r.interview === true).length, color: P.teal },
            { label: "AVG CONFIDENCE", val: Math.round(RECORDS.reduce((a, r) => a + r.confidence, 0) / RECORDS.length) + "%", color: P.gold },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ color: P.t3, fontSize: 10 }}>{s.label}</span>
              <span style={{ color: s.color, fontWeight: 700 }}>{s.val}</span>
            </div>
          ))}
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 2 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              background: tab === t.key ? P.blue + "22" : "transparent",
              border: "none", borderBottom: tab === t.key ? `2px solid ${P.gold}` : "2px solid transparent",
              color: tab === t.key ? P.gold : P.t3, fontSize: 11, fontFamily: "monospace",
              padding: "6px 14px", cursor: "pointer", letterSpacing: 0.5,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>

        {/* REGISTRY TAB */}
        {tab === "registry" && (
          <>
            {/* Left list */}
            <div style={{ width: 280, borderRight: `1px solid ${P.blue}33`, overflowY: "auto", flexShrink: 0 }}>
              {/* Filters */}
              <div style={{ padding: "8px 10px", borderBottom: `1px solid ${P.blue}22`, display: "flex", flexDirection: "column", gap: 6 }}>
                <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} style={{
                  background: P.navy, color: P.t2, border: `1px solid ${P.blue}44`, borderRadius: 3,
                  fontSize: 10, padding: "3px 6px", fontFamily: "monospace",
                }}>
                  <option value="ALL">ALL TIERS</option>
                  <option value="2">TIER 2</option>
                  <option value="3">TIER 3</option>
                </select>
                <select value={chargeFilter} onChange={e => setChargeFilter(e.target.value)} style={{
                  background: P.navy, color: P.t2, border: `1px solid ${P.blue}44`, borderRadius: 3,
                  fontSize: 10, padding: "3px 6px", fontFamily: "monospace",
                }}>
                  {CHARGE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {filtered.map(r => (
                <div key={r.id} onClick={() => setSelected(r)} style={{
                  padding: "10px 12px", borderBottom: `1px solid ${P.blue}22`,
                  background: selected?.id === r.id ? P.blue + "18" : "transparent",
                  cursor: "pointer",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: selected?.id === r.id ? P.gold : P.t1 }}>
                      {r.name}
                    </span>
                    <span style={{ fontSize: 10, color: TIER_COLOR[r.tier] || P.t3 }}>T{r.tier}</span>
                  </div>
                  <div style={{ fontSize: 10, color: P.t3, marginTop: 2 }}>{r.branch}</div>
                  <div style={{ fontSize: 10, color: r.alive === false ? P.red : r.alive === true ? P.teal : P.gold, marginTop: 1 }}>
                    {r.alive === false ? "DECEASED" : r.alive === true ? "ALIVE" : r.alive}
                  </div>
                  <div style={{ fontSize: 9, color: P.t3, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {r.chargeType}
                  </div>
                </div>
              ))}
            </div>

            {/* Right detail */}
            {selected && (
              <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px" }}>
                {/* Name + badge row */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: P.gold }}>{selected.name}</div>
                    <div style={{ fontSize: 11, color: P.t2, marginTop: 2 }}>{selected.branch} · {selected.rank}</div>
                    <div style={{ fontSize: 10, color: P.t3, marginTop: 1 }}>Record {selected.id} · {selected.service}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                    <span style={{ background: (TIER_COLOR[selected.tier] || P.t3) + "22", border: `1px solid ${TIER_COLOR[selected.tier] || P.t3}`, color: TIER_COLOR[selected.tier] || P.t3, fontSize: 10, padding: "2px 8px", borderRadius: 3 }}>
                      TIER {selected.tier}
                    </span>
                    <span style={{
                      background: selected.alive === false ? P.red + "22" : P.teal + "22",
                      border: `1px solid ${selected.alive === false ? P.red : P.teal}`,
                      color: selected.alive === false ? P.red : P.teal,
                      fontSize: 10, padding: "2px 8px", borderRadius: 3,
                    }}>
                      {selected.alive === false ? "DECEASED" : "ALIVE"}
                    </span>
                    <span style={{ background: P.blue + "22", border: `1px solid ${P.blue}44`, color: P.blue, fontSize: 10, padding: "2px 8px", borderRadius: 3 }}>
                      {selected.discharge}
                    </span>
                  </div>
                </div>

                {/* Landmark */}
                <div style={{ background: P.gold + "11", border: `1px solid ${P.gold}33`, borderRadius: 4, padding: "8px 12px", marginBottom: 12 }}>
                  <span style={{ fontSize: 10, color: P.gold, fontWeight: 700 }}>LANDMARK: </span>
                  <span style={{ fontSize: 11, color: P.t1 }}>{selected.landmark}</span>
                </div>

                {/* Metrics */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {[
                    { label: "Origin", val: selected.origin },
                    { label: "State (pre-service)", val: selected.state },
                    { label: "Deported", val: String(selected.yearDeported) },
                    { label: "Destination", val: `${selected.dest}${selected.destState && selected.destState !== "N/A" ? ` / ${selected.destState}` : ""}` },
                    { label: "Currently Located", val: selected.located },
                    { label: "Interview Available", val: String(selected.interview) },
                  ].map(m => (
                    <div key={m.label} style={{ background: P.navy, border: `1px solid ${P.blue}22`, borderRadius: 4, padding: "6px 10px" }}>
                      <div style={{ fontSize: 9, color: P.t3 }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: P.t1, marginTop: 1 }}>{m.val}</div>
                    </div>
                  ))}
                </div>

                {/* Confidence bar */}
                <div style={{ background: P.navy, border: `1px solid ${P.blue}22`, borderRadius: 4, padding: "10px 12px", marginBottom: 12 }}>
                  <ConfBar value={selected.confidence} label="Case Confidence" color={selected.confidence >= 90 ? P.teal : P.gold} />
                </div>

                {/* Charge */}
                <div style={{ background: P.navy, border: `1px solid ${P.blue}22`, borderRadius: 4, padding: "10px 12px", marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: P.t3, marginBottom: 4 }}>CRIMINAL CHARGE / DEPORTATION BASIS</div>
                  <div style={{ fontSize: 11, color: selected.chargeType.includes("N/A") ? P.teal : P.red }}>{selected.charge}</div>
                  <div style={{ fontSize: 10, color: P.t3, marginTop: 4 }}>Type: <span style={{ color: P.t2 }}>{selected.chargeType}</span></div>
                </div>

                {/* Family */}
                <div style={{ background: P.navy, border: `1px solid ${P.blue}22`, borderRadius: 4, padding: "10px 12px", marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: P.t3, marginBottom: 4 }}>FAMILY STATUS</div>
                  <div style={{ fontSize: 11, color: P.t1 }}>{selected.family}</div>
                </div>

                {/* Notes */}
                <div style={{ background: P.navy, border: `1px solid ${P.blue}22`, borderRadius: 4, padding: "10px 12px", marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: P.t3, marginBottom: 4 }}>CASE NOTES</div>
                  <div style={{ fontSize: 11, color: P.t2, lineHeight: 1.6 }}>{selected.notes}</div>
                </div>

                {/* Sources */}
                <div style={{ background: P.navy, border: `1px solid ${P.blue}22`, borderRadius: 4, padding: "10px 12px", marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: P.t3, marginBottom: 4 }}>DATA SOURCES</div>
                  <div style={{ fontSize: 11, color: P.t2 }}>{selected.sources}</div>
                </div>

                {/* Vector Profile */}
                <div style={{ background: P.navy, border: `1px solid ${P.blue}22`, borderRadius: 4, padding: "10px 12px", marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: P.t3, marginBottom: 4 }}>BEHAVIOR VECTOR PROFILE</div>
                  <div style={{ fontSize: 10, color: P.blue, fontFamily: "monospace" }}>{selected.vector}</div>
                </div>

                {/* AI Analysis */}
                <div style={{ background: P.navy, border: `1px solid ${P.blue}33`, borderRadius: 4, padding: "10px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 10, color: P.t3 }}>AI CASE ANALYSIS</span>
                    <button onClick={() => runAnalysis(selected)} disabled={aiLoading && aiTarget === selected.id} style={{
                      background: P.blue + "22", border: `1px solid ${P.blue}55`, color: P.blue,
                      fontSize: 10, padding: "3px 10px", borderRadius: 3, cursor: "pointer", fontFamily: "monospace",
                    }}>
                      {aiLoading && aiTarget === selected.id ? "ANALYZING..." : "RUN ANALYSIS"}
                    </button>
                  </div>
                  {aiAnalysis && aiTarget === selected.id && (
                    <div style={{ fontSize: 11, color: P.t2, lineHeight: 1.6 }}>{aiAnalysis}</div>
                  )}
                  {!aiAnalysis && !(aiLoading && aiTarget === selected.id) && (
                    <div style={{ fontSize: 10, color: P.t3, fontStyle: "italic" }}>Click RUN ANALYSIS to generate IIRIRA assessment, VA failure score, and CHC briefing priority.</div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* SOURCES TAB */}
        {tab === "sources" && (
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            <div style={{ background: P.gold + "11", border: `1px solid ${P.gold}33`, borderRadius: 4, padding: "10px 14px", marginBottom: 16, fontSize: 11 }}>
              <span style={{ color: P.gold, fontWeight: 700 }}>April 2026 Expansion — 4 New TIER 1 Sources</span>
              <span style={{ color: P.t2, marginLeft: 8 }}>Added to support deported veteran investigation expansion</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {NEW_SOURCES.map(s => (
                <div key={s.id} style={{ background: P.navy, border: `1px solid ${P.red}44`, borderRadius: 6, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: P.gold }}>{s.name}</span>
                    <span style={{ background: P.red + "22", border: `1px solid ${P.red}55`, color: P.red, fontSize: 10, padding: "2px 7px", borderRadius: 3 }}>{s.tier}</span>
                  </div>
                  <div style={{ fontSize: 10, color: P.t3, marginBottom: 6 }}>{s.category}</div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <span style={{ background: (ACCESS_COLOR[s.access] || P.t3) + "22", border: `1px solid ${(ACCESS_COLOR[s.access] || P.t3)}55`, color: ACCESS_COLOR[s.access] || P.t3, fontSize: 10, padding: "2px 8px", borderRadius: 3 }}>{s.access}</span>
                  </div>
                  <div style={{ fontSize: 11, color: P.t2, marginBottom: 6 }}>{s.use}</div>
                  <div style={{ fontSize: 10, color: P.t3, borderTop: `1px solid ${P.blue}22`, paddingTop: 6 }}>{s.notes}</div>
                  <div style={{ fontSize: 10, color: P.blue, marginTop: 6, fontFamily: "monospace" }}>{s.url}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUMMARY TAB */}
        {tab === "summary" && (
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { label: "Total Records", val: RECORDS.length, color: P.gold },
                { label: "USMC Records", val: RECORDS.filter(r => r.branch.includes("Marine")).length, color: P.blue },
                { label: "Army Records", val: RECORDS.filter(r => r.branch.includes("Army") && !r.branch.includes("Marine")).length, color: P.teal },
                { label: "Tier 2 (High Priority)", val: RECORDS.filter(r => r.tier === 2).length, color: P.gold },
                { label: "Tier 3 (Standard)", val: RECORDS.filter(r => r.tier === 3).length, color: P.teal },
                { label: "Alive", val: RECORDS.filter(r => r.alive === true).length, color: P.teal },
                { label: "Deceased", val: RECORDS.filter(r => r.alive === false).length, color: P.red },
                { label: "Interview Available", val: RECORDS.filter(r => r.interview === true).length, color: P.teal },
                { label: "New TIER 1 Sources", val: NEW_SOURCES.length, color: P.red },
              ].map(s => (
                <div key={s.label} style={{ background: P.navy, border: `1px solid ${P.blue}22`, borderRadius: 4, padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: P.t3, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Discharge breakdown */}
            <div style={{ background: P.navy, border: `1px solid ${P.blue}22`, borderRadius: 6, padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: P.gold, fontWeight: 700, marginBottom: 10 }}>DISCHARGE STATUS</div>
              {["Honorable", "Honorable (implied)", "Honorable (prior to convictions)"].map(d => {
                const count = RECORDS.filter(r => r.discharge === d).length;
                return (
                  <div key={d} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: P.t2, width: 220 }}>{d}</span>
                    <div style={{ flex: 1, background: P.b, borderRadius: 2, height: 6 }}>
                      <div style={{ width: `${(count / RECORDS.length) * 100}%`, background: P.teal, height: 6, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 11, color: P.teal, width: 20, textAlign: "right" }}>{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Origin breakdown */}
            <div style={{ background: P.navy, border: `1px solid ${P.blue}22`, borderRadius: 6, padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: P.gold, fontWeight: 700, marginBottom: 10 }}>COUNTRY OF ORIGIN</div>
              {["Mexico", "El Salvador", "Belize", "New Zealand"].map(c => {
                const count = RECORDS.filter(r => r.origin.includes(c)).length;
                if (!count) return null;
                return (
                  <div key={c} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: P.t2, width: 140 }}>{c}</span>
                    <div style={{ flex: 1, background: P.b, borderRadius: 2, height: 6 }}>
                      <div style={{ width: `${(count / RECORDS.length) * 100}%`, background: P.blue, height: 6, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 11, color: P.blue, width: 20, textAlign: "right" }}>{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Charge type breakdown */}
            <div style={{ background: P.navy, border: `1px solid ${P.blue}22`, borderRadius: 6, padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: P.gold, fontWeight: 700, marginBottom: 10 }}>DEPORTATION BASIS</div>
              {Array.from(new Set(RECORDS.map(r => r.chargeType))).map(ct => {
                const count = RECORDS.filter(r => r.chargeType === ct).length;
                return (
                  <div key={ct} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: P.t2, width: 240 }}>{ct}</span>
                    <div style={{ flex: 1, background: P.b, borderRadius: 2, height: 6 }}>
                      <div style={{ width: `${(count / RECORDS.length) * 100}%`, background: ct.includes("N/A") ? P.teal : P.red, height: 6, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 11, color: ct.includes("N/A") ? P.teal : P.red, width: 20, textAlign: "right" }}>{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Landmark cases */}
            <div style={{ background: P.navy, border: `1px solid ${P.blue}22`, borderRadius: 6, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: P.gold, fontWeight: 700, marginBottom: 10 }}>LANDMARK PRECEDENTS</div>
              {RECORDS.filter(r => !r.landmark.includes("years") || r.id <= 10).map(r => (
                <div key={r.id} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: `1px solid ${P.blue}18` }}>
                  <span style={{ fontSize: 10, color: P.t3, width: 36 }}>#{r.id}</span>
                  <span style={{ fontSize: 10, color: P.gold, width: 160, flexShrink: 0 }}>{r.name.split(" ").slice(0, 3).join(" ")}</span>
                  <span style={{ fontSize: 10, color: P.t2 }}>{r.landmark}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
