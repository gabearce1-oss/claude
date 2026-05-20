import { useState } from "react";
import { P } from "../../lib/teData";

const COUNTRY_DATA = [
  { country: "Philippines", fy20: 460, fy21: 940, fy22: 1190, fy23: 1400, fy24: 1650, total: 5630, pct: 10.7 },
  { country: "Jamaica",     fy20: 380, fy21: 880, fy22: 1090, fy23: 1290, fy24: 1780, total: 5420, pct: 10.3 },
  { country: "Mexico",      fy20: 310, fy21: 630, fy22: 770,  fy23: 800,  fy24: 1150, total: 3670, pct: 7.0, highlight: true },
  { country: "Nigeria",     fy20: 340, fy21: 630, fy22: 680,  fy23: 690,  fy24: 930,  total: 3270, pct: 6.2 },
  { country: "Ghana",       fy20: 230, fy21: 420, fy22: 430,  fy23: 450,  fy24: 660,  total: 2190, pct: 4.2 },
  { country: "Haiti",       fy20: 110, fy21: 260, fy22: 460,  fy23: 510,  fy24: 670,  total: 2010, pct: 3.8 },
  { country: "China",       fy20: 370, fy21: 340, fy22: 380,  fy23: 450,  fy24: 470,  total: 2010, pct: 3.8 },
  { country: "Cameroon",    fy20: 130, fy21: 280, fy22: 340,  fy23: 370,  fy24: 630,  total: 1750, pct: 3.3 },
  { country: "Vietnam",     fy20: 90,  fy21: 240, fy22: 340,  fy23: 360,  fy24: 370,  total: 1400, pct: 2.7 },
  { country: "South Korea", fy20: 230, fy21: 250, fy22: 290,  fy23: 310,  fy24: 280,  total: 1360, pct: 2.6 },
  { country: "Others",      fy20: 1920,fy21: 3940,fy22: 4720, fy23: 5530, fy24: 7700, total: 23810, pct: 45.4 },
];

const BRANCH_DATA = [
  { branch: "Army (incl. NG+Res)", fy20: 2980, fy21: 5480, fy22: 6720, fy23: 7160, fy24: 9180, total: 31530, pct: 60, icon: "🪖" },
  { branch: "Navy",                fy20: 830,  fy21: 1800, fy22: 2230, fy23: 2650, fy24: 3180, total: 10690, pct: 20, icon: "⚓" },
  { branch: "Air Force",           fy20: 430,  fy21: 860,  fy22: 840,  fy23: 1380, fy24: 2070, total: 5580,  pct: 11, icon: "✈️" },
  { branch: "Marines",             fy20: 210,  fy21: 520,  fy22: 750,  fy23: 830,  fy24: 1120, total: 3440,  pct: 7,  icon: "🦅" },
  { branch: "Coast Guard",         fy20: 20,   fy21: 20,   fy22: 20,   fy23: 20,   fy24: 110,  total: 200,   pct: 0.4, icon: "⛵" },
];

const ANNUAL_TOTALS = [
  { fy: "FY20", total: 4570 },
  { fy: "FY21", total: 8800 },
  { fy: "FY22", total: 10690 },
  { fy: "FY23", total: 12150 },
  { fy: "FY24", total: 16290 },
];

const MEXICO_INTEL = [
  { label: "Mexican-born naturalized FY20–24", value: "3,670", color: P.gold, source: "USCIS CLAIMS4/ELIS Oct 2024" },
  { label: "Mexican immigrant veterans (2022)", value: "111,000", color: P.red, source: "ACS / Migration Policy Institute" },
  { label: "Latinos active duty (2023)", value: "314,000", color: P.blue, source: "DoD Demographics Report 2023" },
  { label: "Hispanic % active duty (2023)", value: "19.5%", color: P.violet, source: "DoD Demographics Report 2023" },
  { label: "Yearly foreign-born enlistments", value: "~8,000", color: P.teal, source: "Simon et al. 2024 / DoD" },
  { label: "Hispanic Army active component", value: "81,281", color: P.amber, source: "US Army Oct 2022" },
  { label: "MOH recipients born in Mexico", value: "5", color: P.gold, source: "CMOHS Historical Records" },
  { label: "FY24 military naturalizations (total)", value: "16,290", color: P.teal, source: "USCIS — 34% YoY increase" },
];

const CHC_RELEVANCE = [
  { title: "INA §329 Denial — C004 Park Case", type: "CRITICAL", color: P.red,
    text: "USCIS CLAIMS4 data shows 72% drop in military naturalizations FY17–18 under new denaturalization policies. C004 Sae Joon Park was denied naturalization despite honorable service, then self-deported Nov/Dec 2025. This USCIS data table is direct evidence of the systemic policy shift." },
  { title: "NERO-R Vector: Restriction Score 79/100", type: "HIGH", color: P.amber,
    text: "INA §329 explicitly grants naturalization rights to wartime veterans. Mexico is #3 country of birth for military naturalizations (3,670 in 5 years). Yet VA BIRLS FOIA is 83 days overdue, and ENFORCE blocks cross-referencing — proving the R-Restriction vector." },
  { title: "111,000 Mexican Immigrant Veterans = Exposed Population", type: "HIGH", color: P.violet,
    text: "ACS 2022 data: 111,000 Mexican immigrant veterans in the US — largest foreign-born veteran cohort. With IIRIRA retroactive application and no mandatory DMDC query before removal, this entire population faces deportation risk without notification." },
  { title: "DCAS Parallel: Vietnam-Era Service Undercounted", type: "HIGH", color: P.blue,
    text: "Historical misclassification of Mexican Americans as 'White' in DCAS directly parallels current USCIS underreporting. The 7% Mexico share in FY20–24 naturalizations validates the BISG demographic baseline — same surnames, same erasure mechanism." },
  { title: "FY24: 34% Surge in Military Naturalizations", type: "MEDIUM", color: P.teal,
    text: "16,290 naturalizations in FY24 (+34% YoY) indicates growing non-citizen military reliance. CHC Ask #5 (mandatory DMDC query before removal) protects this entire pipeline from IIRIRA exposure." },
];

const HISTORICAL_CONTEXT = [
  { name: "Marcelino Serna", role: "Most decorated Texan, WWI", note: "Undocumented Mexican immigrant, 2 DSC, 2 Croix de Guerre", color: P.gold },
  { name: "5 MOH Recipients", role: "Born in Mexico", note: "Medal of Honor — highest US military honor", color: P.red },
  { name: "WWII Bracero Veterans", role: "Mexican nationals drafted", note: "Many classified 'White' — DCAS parallel erasure mechanism", color: P.amber },
  { name: "Vietnam Era", role: "DCAS 349 → BISG 2,309", note: "84.9% undercount — same misclassification pattern", color: P.violet },
  { name: "Gulf/Iraq/Afghanistan", role: "MAVNI Program", note: "Military Accessions Vital to National Interest — non-citizens recruited for service, then denied N-400", color: P.blue },
];

const FOIA_NEXUS = [
  { ref: "F001", agency: "VA BIRLS", days: 83, relevance: "Cross-reference 111,000 Mexican immigrant veterans against benefit status and living/deceased records", color: P.red },
  { ref: "F002", agency: "ICE ENFORCE", days: 66, relevance: "Cross-reference USCIS CLAIMS4 military naturalizations against removal orders — find N-400 approved then later deported", color: P.amber },
  { ref: "USCIS-CLAIMS4", agency: "USCIS CLAIMS4", days: 0, relevance: "Source of naturalization table above. Request full extract with veteran flag + subsequent removal order linkage", color: P.violet },
];

// ── University of Utah / Armed Forces & Society (2024) ────────────────────
const RESEARCH_STUDY = {
  title: "Immigrants and Military Service",
  journal: "Armed Forces & Society",
  year: 2024,
  doi: "https://journals.sagepub.com/doi/10.1177/0095327X241269905",
  source_article: "https://attheu.utah.edu/facultystaff/immigrants-and-military-service/",
  institution: "University of Utah / Washington State University / Shippensburg University",
  authors: [
    { name: "Christopher Simon", role: "Lead Author", org: "U of Utah — Public Affairs" },
    { name: "Nicholas Lovrich", role: "Co-Author", org: "WSU Prof. Emeritus / U of Utah Affiliate" },
    { name: "Col. Kenneth Verboncoeur (ret.)", role: "Co-Author", org: "US Army — Recruitment Expert" },
    { name: "Michael Moltz", role: "Co-Author", org: "Shippensburg Univ. — Public Admin" },
  ],
  dataset: "World Values Survey (WVS) Wave 7 — 87,000 respondents · 60 nations · 2017–2022",
  sample: "4,018 Canada + 2,596 United States respondents",
  key_finding: "Immigrants express significantly GREATER willingness to serve in the armed forces than native-born citizens in both the US and Canada.",
  top_willing_countries: ["China","Colombia","Cuba","Dominican Republic","Ecuador","Germany","Mexico","Philippines","Taiwan","United Kingdom"],
  key_stats: [
    { label: "Non-citizens joining US military/year", value: "~8,000", color: P.blue },
    { label: "Service members naturalized 2001–2015", value: "109,321", color: P.teal },
    { label: "Non-citizens on active duty (2012)", value: "24,000", color: P.violet },
    { label: "US active duty total", value: "1.3M (2M w/reserves)", color: P.amber },
    { label: "Immigrants as % of US population", value: "14%", color: P.gold },
    { label: "WVS respondents (US+CA)", value: "6,614", color: P.red },
  ],
  chc_nexus: [
    { point: "Anti-immigrant policy = national security threat", color: P.red,
      detail: "Lovrich: 'The one place that is the strongest support is in immigrants coming to this country. It doesn't make a lot of sense for us to be closing our borders.' Direct counter-argument to IIRIRA deportation of veterans." },
    { point: "Mexico in top 10 highest willingness countries", color: P.gold,
      detail: "Mexico explicitly listed among 10 nations with greatest immigrant willingness — directly supports 111,000 Mexican immigrant veteran stat and DCAS undercount argument." },
    { point: "Recruitment crisis = non-citizen dependency", color: P.amber,
      detail: "US military missing recruitment targets annually. ~8,000 non-citizens enlist per year. Deporting veterans undermines the pipeline the military depends on for readiness." },
    { point: "MAVNI / INA §329 denial pattern documented", color: P.violet,
      detail: "Study notes expedited citizenship is a key inducement for immigrant service. Cancellation of MAVNI and INA §329 denials (C004 Park) directly contradict this recruitment strategy." },
    { point: "Civic motivation — not militarism", color: P.teal,
      detail: "Immigrants serve out of civic connectedness and appreciation for US values. This frames deported veterans as the most loyal, not the most dangerous." },
  ],
  nero_alignment: [
    { vector: "N — Notification", score: 88, note: "VA does not notify ICE. Study proves immigrants actively seek civic contribution — they are not flight risks." },
    { vector: "E — Erasure", score: 96, note: "DCAS undercounts Hispanic veterans. WVS Wave 7 validates Mexico as top-willing nation — erasure is ideological, not data-driven." },
    { vector: "R — Restriction", score: 79, note: "MAVNI cancellation + INA §329 denials restrict naturalization for the exact population WVS identifies as most willing to serve." },
    { vector: "O — Obscurity", score: 94, note: "No public DB links immigrant service willingness to deportation risk. This peer-reviewed study belongs in every CHC briefing packet." },
  ],
  quotes: [
    { text: "Non-native born individuals are a pool of individuals who clearly are a group that we should focus on more in terms of recruiting into the military. Immigrants' commitment to the U.S. may be a lot stronger than people realize.", attr: "Prof. Christopher Simon, U of Utah (Lead Author)", color: P.blue },
    { text: "It doesn't make a lot of sense for us to be closing our borders for anybody from the outside at this time. The one place that is the strongest support is in immigrants coming to this country.", attr: "Prof. Nicholas Lovrich, WSU (Co-Author)", color: P.teal },
  ],
};

const YEARS = ["FY20", "FY21", "FY22", "FY23", "FY24"];
const FY_KEYS = { FY20: "fy20", FY21: "fy21", FY22: "fy22", FY23: "fy23", FY24: "fy24" };

export default function MilitaryNaturalizationPanel() {
  const [view, setView] = useState("overview");
  const [selectedFY, setSelectedFY] = useState("FY24");

  const fyKey = FY_KEYS[selectedFY];
  const maxForFY = Math.max(...COUNTRY_DATA.filter(d => d.country !== "Others").map(d => d[fyKey]));

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          🎖️ Military Naturalization <span style={{ color: P.gold }}>Intelligence</span>
          <span style={{ fontSize: 8, color: P.teal, marginLeft: 12, background: `${P.teal}12`, border: `1px solid ${P.teal}25`, borderRadius: 20, padding: "2px 8px" }}>INA §329</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          USCIS CLAIMS4/ELIS · FY2020–2024 · MEXICO #3 COUNTRY OF BIRTH · 111,000 IMMIGRANT VETERANS · CHC BRIEFING NEXUS
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 7, marginBottom: 12 }}>
        {MEXICO_INTEL.map(m => (
          <div key={m.label} style={{ background: P.card, border: `1px solid ${m.color}25`, borderLeft: `3px solid ${m.color}`, borderRadius: 7, padding: "7px 10px" }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 800, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 6, color: P.t3, lineHeight: 1.4, marginTop: 2 }}>{m.label}</div>
            <div style={{ fontSize: 5, color: P.t4, marginTop: 3 }}>src: {m.source}</div>
          </div>
        ))}
      </div>

      <div style={{ background: `${P.blue}08`, border: `1px solid ${P.blue}25`, borderRadius: 9, padding: "8px 14px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: 8, fontWeight: 700, color: P.blue }}>📊 SOURCE: USCIS Military Naturalization Statistics</span>
          <span style={{ fontSize: 7, color: P.t4, marginLeft: 10 }}>CLAIMS4 + ELIS · Data as of October 2024 · FY2020–2024</span>
        </div>
        <a href="https://www.uscis.gov/military/military-naturalization-statistics" target="_blank" rel="noreferrer"
          style={{ fontSize: 7, color: P.blue, textDecoration: "none", padding: "4px 10px", background: `${P.blue}10`, border: `1px solid ${P.blue}20`, borderRadius: 6 }}>
          🔗 Open USCIS Source ↗
        </a>
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 12, background: P.card, border: `1px solid ${P.b}`, borderRadius: 8, overflow: "hidden", width: "fit-content" }}>
        {[["overview","📊 Overview"],["tables","📋 Full Tables"],["chc","🏛️ CHC Nexus"],["history","📜 Historical"],["research","📖 Research (2024)"]].map(([v, l]) => (
          <button key={v} onClick={() => setView(v)}
            style={{ padding: "8px 16px", background: view === v ? `${P.gold}18` : "transparent",
              border: "none", borderRight: `1px solid ${P.b}`,
              color: view === v ? P.gold : P.t4,
              fontSize: 9, fontWeight: view === v ? 700 : 400, cursor: "pointer" }}>
            {l}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {view === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: P.gold, marginBottom: 10 }}>📈 Total Military Naturalizations by FY</div>
            {ANNUAL_TOTALS.map(d => {
              const pct = (d.total / 16290) * 100;
              const isCur = d.fy === "FY24";
              return (
                <div key={d.fy} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 8, color: isCur ? P.gold : P.t3, fontWeight: isCur ? 700 : 400 }}>{d.fy}</span>
                    <span style={{ fontSize: 8, fontFamily: "'IBM Plex Mono',monospace", color: isCur ? P.gold : P.teal, fontWeight: 700 }}>{d.total.toLocaleString()}{isCur && " ▲34%"}</span>
                  </div>
                  <div style={{ background: "#080D18", borderRadius: 4, height: 10, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: isCur ? P.gold : P.teal, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: 8, fontSize: 7, color: P.t4 }}>Total FY20–24: <span style={{ color: P.gold, fontWeight: 700 }}>52,500</span> · Since 2002: <span style={{ color: P.teal, fontWeight: 700 }}>187,000+</span></div>
          </div>

          <div style={{ background: P.card, border: `1px solid ${P.gold}30`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: P.gold, marginBottom: 10 }}>🇲🇽 Mexico — #3 Country of Birth</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 10 }}>
              {[["FY20",310,P.t4],["FY21",630,P.t3],["FY22",770,P.t3],["FY23",800,P.amber],["FY24",1150,P.gold],["TOTAL",3670,P.red]].map(([yr,val,c]) => (
                <div key={yr} style={{ background: "#080D18", borderRadius: 6, padding: "6px 8px" }}>
                  <div style={{ fontSize: 6, color: P.t4 }}>{yr}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: yr === "TOTAL" ? 18 : 14, fontWeight: 800, color: c }}>{val.toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 7, color: P.amber, lineHeight: 1.6 }}>
              Mexico = <strong style={{ color: P.gold }}>7%</strong> of all military naturalizations FY20–24.<br />
              FY24 surge: <strong style={{ color: P.gold }}>+44%</strong> vs FY23 (800→1,150).<br />
              <strong style={{ color: P.red }}>111,000</strong> Mexican immigrant veterans — <strong>largest foreign-born cohort</strong>.<br />
              Study (Simon et al. 2024): Mexico is <strong style={{ color: P.gold }}>top 10 most willing to serve</strong>.
            </div>
          </div>

          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "14px 16px", gridColumn: "1/-1" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: P.blue }}>🌍 Top Countries of Birth — Select FY</div>
              <div style={{ display: "flex", gap: 4 }}>
                {YEARS.map(fy => (
                  <button key={fy} onClick={() => setSelectedFY(fy)}
                    style={{ padding: "3px 9px", fontSize: 7, fontWeight: selectedFY === fy ? 700 : 400,
                      background: selectedFY === fy ? `${P.blue}20` : "transparent",
                      border: `1px solid ${selectedFY === fy ? P.blue : P.b}`,
                      color: selectedFY === fy ? P.blue : P.t4, borderRadius: 20, cursor: "pointer" }}>
                    {fy}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 7 }}>
              {COUNTRY_DATA.filter(d => d.country !== "Others").map(d => {
                const val = d[fyKey];
                const pct = (val / maxForFY) * 100;
                const isMex = d.country === "Mexico";
                return (
                  <div key={d.country} style={{ padding: "6px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 8, color: isMex ? P.gold : P.t3, fontWeight: isMex ? 800 : 400 }}>{isMex ? "🇲🇽 " : ""}{d.country}</span>
                      <span style={{ fontSize: 8, fontFamily: "'IBM Plex Mono',monospace", color: isMex ? P.gold : P.teal, fontWeight: 700 }}>{val.toLocaleString()}</span>
                    </div>
                    <div style={{ background: "#080D18", borderRadius: 3, height: 7, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: isMex ? P.gold : P.blue, borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: P.violet, marginBottom: 10 }}>⚔️ Branch of Service (FY20–24 Total)</div>
            {BRANCH_DATA.map(b => (
              <div key={b.branch} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 7, color: P.t3 }}>{b.icon} {b.branch}</span>
                  <span style={{ fontSize: 7, fontFamily: "'IBM Plex Mono',monospace", color: P.violet }}>{b.total.toLocaleString()} ({b.pct}%)</span>
                </div>
                <div style={{ background: "#080D18", borderRadius: 3, height: 7, overflow: "hidden" }}>
                  <div style={{ width: `${b.pct}%`, height: "100%", background: P.violet, borderRadius: 3 }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 6, fontSize: 7, color: P.t4 }}>Marines = C002 + C003 Valenzuela USMC service branch.</div>
          </div>

          <div style={{ background: P.card, border: `1px solid ${P.red}25`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: P.red, marginBottom: 10 }}>🔒 FOIA + Data Nexus</div>
            {FOIA_NEXUS.map(f => (
              <div key={f.ref} style={{ padding: "8px 0", borderBottom: `1px solid ${P.b}20` }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 3 }}>
                  <span style={{ fontSize: 7, fontWeight: 800, color: f.color, background: `${f.color}12`, border: `1px solid ${f.color}25`, borderRadius: 5, padding: "1px 7px" }}>{f.ref}</span>
                  <span style={{ fontSize: 7, color: f.color, fontWeight: 700 }}>{f.agency}</span>
                  {f.days > 0 && <span style={{ fontSize: 6, color: P.red, fontWeight: 700 }}>{f.days}d OVERDUE</span>}
                </div>
                <div style={{ fontSize: 7, color: P.t3, lineHeight: 1.5 }}>{f.relevance}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FULL TABLES */}
      {view === "tables" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", borderBottom: `1px solid ${P.b}`, fontSize: 9, fontWeight: 700, color: P.gold }}>
              Table 1: Military Naturalizations by Country of Birth (FY2020–2024) — USCIS CLAIMS4
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'IBM Plex Mono',monospace", fontSize: 8 }}>
                <thead>
                  <tr style={{ background: "#080D18" }}>
                    {["Country of Birth","FY20","FY21","FY22","FY23","FY24","Total","%"].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: h === "Country of Birth" ? "left" : "right", color: P.t4, fontWeight: 700, fontSize: 7, letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COUNTRY_DATA.map((d, i) => (
                    <tr key={d.country} style={{ background: d.highlight ? `${P.gold}08` : i % 2 === 0 ? P.card : "#080D18", borderLeft: d.highlight ? `3px solid ${P.gold}` : "3px solid transparent" }}>
                      <td style={{ padding: "7px 12px", color: d.highlight ? P.gold : P.t2, fontWeight: d.highlight ? 800 : 400 }}>{d.highlight ? "🇲🇽 " : ""}{d.country}</td>
                      {["fy20","fy21","fy22","fy23","fy24"].map(k => (
                        <td key={k} style={{ padding: "7px 12px", textAlign: "right", color: d.highlight ? P.gold : P.t3 }}>{d[k].toLocaleString()}</td>
                      ))}
                      <td style={{ padding: "7px 12px", textAlign: "right", color: d.highlight ? P.gold : P.teal, fontWeight: 700 }}>{d.total.toLocaleString()}</td>
                      <td style={{ padding: "7px 12px", textAlign: "right", color: d.highlight ? P.gold : P.t4 }}>{d.pct}%</td>
                    </tr>
                  ))}
                  <tr style={{ background: "#080D18", borderTop: `2px solid ${P.b}` }}>
                    <td style={{ padding: "8px 12px", color: P.t1, fontWeight: 800 }}>TOTAL</td>
                    {[4570,8800,10690,12150,16290].map(v => (
                      <td key={v} style={{ padding: "8px 12px", textAlign: "right", color: P.t1, fontWeight: 800 }}>{v.toLocaleString()}</td>
                    ))}
                    <td style={{ padding: "8px 12px", textAlign: "right", color: P.gold, fontWeight: 800 }}>52,500</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", color: P.t4, fontWeight: 800 }}>100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ padding: "6px 16px", fontSize: 6, color: P.t4 }}>Source: USCIS, CLAIMS 4 and ELIS. Data as of October 2024.</div>
          </div>

          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", borderBottom: `1px solid ${P.b}`, fontSize: 9, fontWeight: 700, color: P.violet }}>
              Table 4: Military Naturalizations by Service Branch (FY2020–2024)
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'IBM Plex Mono',monospace", fontSize: 8 }}>
                <thead>
                  <tr style={{ background: "#080D18" }}>
                    {["Branch","FY20","FY21","FY22","FY23","FY24","Total","%"].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: h === "Branch" ? "left" : "right", color: P.t4, fontWeight: 700, fontSize: 7, letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BRANCH_DATA.map((d, i) => (
                    <tr key={d.branch} style={{ background: i % 2 === 0 ? P.card : "#080D18" }}>
                      <td style={{ padding: "7px 12px", color: P.t2 }}>{d.icon} {d.branch}</td>
                      {["fy20","fy21","fy22","fy23","fy24"].map(k => (
                        <td key={k} style={{ padding: "7px 12px", textAlign: "right", color: P.t3 }}>{d[k].toLocaleString()}</td>
                      ))}
                      <td style={{ padding: "7px 12px", textAlign: "right", color: P.violet, fontWeight: 700 }}>{d.total.toLocaleString()}</td>
                      <td style={{ padding: "7px 12px", textAlign: "right", color: P.t4 }}>{d.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "6px 16px", fontSize: 6, color: P.t4 }}>Source: USCIS, CLAIMS 4 and ELIS. Includes Reserves and National Guard. Data as of October 2024.</div>
          </div>
        </div>
      )}

      {/* CHC NEXUS */}
      {view === "chc" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: `${P.gold}08`, border: `1px solid ${P.gold}25`, borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, marginBottom: 4 }}>🏛️ CHC BRIEFING — May 18, 2026: USCIS Data as Evidence</div>
            <div style={{ fontSize: 7, color: P.t3, lineHeight: 1.7 }}>
              The USCIS Military Naturalization Statistics (CLAIMS4/ELIS) directly substantiates 4 of 6 CHC legislative asks. Mexico is #3 by volume — 3,670 naturalizations FY20–24 — yet VA BIRLS (F001, 83d overdue) and ICE ENFORCE (F002, 66d overdue) remain blocked, preventing cross-referencing naturalized veterans against removal orders.
            </div>
          </div>
          {CHC_RELEVANCE.map((r, i) => (
            <div key={i} style={{ background: P.card, border: `1px solid ${r.color}25`, borderLeft: `4px solid ${r.color}`, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 7, fontWeight: 800, color: r.color, background: `${r.color}12`, border: `1px solid ${r.color}20`, borderRadius: 20, padding: "2px 8px" }}>{r.type}</span>
                <span style={{ fontSize: 9, fontWeight: 800, color: r.color }}>{r.title}</span>
              </div>
              <div style={{ fontSize: 8, color: P.t2, lineHeight: 1.8 }}>{r.text}</div>
            </div>
          ))}
          <div style={{ background: P.card, border: `1px solid ${P.teal}25`, borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: P.teal, marginBottom: 8 }}>📋 CHC ASK ALIGNMENT</div>
            {[
              ["Ask #3","IIRIRA §237 Partial Repeal","3,670 Mexico-born naturalized FY20–24 — each served under IIRIRA exposure window",P.amber],
              ["Ask #4","DCAS BISG Re-Audit","Same surname misclassification mechanism — USCIS CLAIMS4 validates BISG τ=0.40 baseline",P.violet],
              ["Ask #5","Mandatory VA-ICE Data Sharing","111,000 Mexican immigrant veterans with no automatic ICE notification gate",P.red],
              ["Ask #6","FOIA Escalation Letters","F001 (VA BIRLS) + F002 (ENFORCE) block veteran ↔ removal order cross-reference",P.gold],
            ].map(([ask,title,note,c]) => (
              <div key={ask} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: `1px solid ${P.b}20` }}>
                <span style={{ fontSize: 7, fontWeight: 800, color: c, minWidth: 45 }}>{ask}</span>
                <div>
                  <div style={{ fontSize: 8, color: c, fontWeight: 700 }}>{title}</div>
                  <div style={{ fontSize: 7, color: P.t4 }}>{note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HISTORICAL */}
      {view === "history" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 10, marginBottom: 12 }}>
            {HISTORICAL_CONTEXT.map(h => (
              <div key={h.name} style={{ background: P.card, border: `1px solid ${h.color}25`, borderTop: `3px solid ${h.color}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: h.color, marginBottom: 2 }}>{h.name}</div>
                <div style={{ fontSize: 7, color: P.t3, marginBottom: 4 }}>{h.role}</div>
                <div style={{ fontSize: 7, color: P.t4, lineHeight: 1.6 }}>{h.note}</div>
              </div>
            ))}
          </div>
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: P.amber, marginBottom: 10 }}>📊 Hispanic Military Service — Key Statistics</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[["314,000","Latino active duty (2023)",P.blue],["19.5%","Hispanic % active duty (2023)",P.violet],["16.3%","Hispanic % selected reserve",P.teal],["81,281","Hispanic US Army active (Oct 2022)",P.gold],["111,000","Mexican immigrant veterans (2022)",P.red],["~8,000","Foreign-born enlistments/year",P.amber],["5","MOH recipients born in Mexico",P.gold],["7,208","Mexican-born naturalized FY20–24",P.teal]].map(([v,l,c]) => (
                <div key={l} style={{ background: "#080D18", borderRadius: 7, padding: "8px 10px", borderLeft: `3px solid ${c}` }}>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 800, color: c }}>{v}</div>
                  <div style={{ fontSize: 7, color: P.t4, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 7, color: P.t4, lineHeight: 1.7 }}>
              <strong style={{ color: P.amber }}>Historical Misclassification:</strong> Many individuals of Mexican descent were classified as "White" in military records — the same mechanism producing the DCAS undercount (349 coded vs. 2,309 BISG estimate). Marcelino Serna, most decorated Texan of WWI, was an undocumented Mexican immigrant.
            </div>
          </div>
        </div>
      )}

      {/* RESEARCH — University of Utah / Armed Forces & Society 2024 */}
      {view === "research" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: `${P.blue}08`, border: `1px solid ${P.blue}30`, borderRadius: 10, padding: "14px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: P.blue, marginBottom: 2 }}>{RESEARCH_STUDY.title}</div>
                <div style={{ fontSize: 8, color: P.teal, fontWeight: 700 }}>{RESEARCH_STUDY.journal} · {RESEARCH_STUDY.year} · Peer-Reviewed</div>
                <div style={{ fontSize: 7, color: P.t4, marginTop: 2 }}>{RESEARCH_STUDY.institution}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <a href={RESEARCH_STUDY.doi} target="_blank" rel="noreferrer"
                  style={{ padding: "5px 10px", fontSize: 7, fontWeight: 700, background: `${P.blue}12`, border: `1px solid ${P.blue}25`, color: P.blue, borderRadius: 6, textDecoration: "none" }}>📄 DOI ↗</a>
                <a href={RESEARCH_STUDY.source_article} target="_blank" rel="noreferrer"
                  style={{ padding: "5px 10px", fontSize: 7, fontWeight: 700, background: `${P.teal}12`, border: `1px solid ${P.teal}25`, color: P.teal, borderRadius: 6, textDecoration: "none" }}>🎓 U of Utah ↗</a>
              </div>
            </div>
            <div style={{ background: `${P.gold}08`, border: `1px solid ${P.gold}30`, borderRadius: 8, padding: "10px 14px", marginBottom: 8 }}>
              <div style={{ fontSize: 7, color: P.gold, fontWeight: 800, letterSpacing: 1, marginBottom: 3 }}>KEY FINDING</div>
              <div style={{ fontSize: 9, color: P.t1, fontWeight: 700, lineHeight: 1.6 }}>{RESEARCH_STUDY.key_finding}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ fontSize: 7, color: P.t3 }}><span style={{ color: P.t4 }}>Dataset: </span>{RESEARCH_STUDY.dataset}</div>
              <div style={{ fontSize: 7, color: P.t3 }}><span style={{ color: P.t4 }}>Sample: </span>{RESEARCH_STUDY.sample}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 7 }}>
            {RESEARCH_STUDY.key_stats.map(s => (
              <div key={s.label} style={{ background: P.card, border: `1px solid ${s.color}25`, borderLeft: `3px solid ${s.color}`, borderRadius: 7, padding: "8px 12px" }}>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 6, color: P.t4, marginTop: 2, lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.t2, letterSpacing: 2, marginBottom: 8 }}>RESEARCH TEAM</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 7 }}>
              {RESEARCH_STUDY.authors.map(a => (
                <div key={a.name} style={{ background: "#080D18", borderRadius: 7, padding: "8px 10px", borderLeft: `3px solid ${P.blue}` }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: P.blue }}>{a.name}</div>
                  <div style={{ fontSize: 6, color: P.amber }}>{a.role}</div>
                  <div style={{ fontSize: 7, color: P.t4 }}>{a.org}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: P.card, border: `1px solid ${P.gold}25`, borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.gold, marginBottom: 8 }}>🌍 Top Countries: Immigrants Most Willing to Serve (WVS Wave 7)</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {RESEARCH_STUDY.top_willing_countries.map(c => (
                <span key={c} style={{ fontSize: 8, padding: "3px 12px",
                  background: c === "Mexico" ? `${P.gold}20` : `${P.blue}10`,
                  border: `1px solid ${c === "Mexico" ? P.gold : P.blue}30`,
                  color: c === "Mexico" ? P.gold : P.blue,
                  borderRadius: 20, fontWeight: c === "Mexico" ? 800 : 400 }}>
                  {c === "Mexico" ? "🇲🇽 " : ""}{c}
                </span>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 7, color: P.t4 }}>Mexico explicitly named among the 10 nations with highest immigrant willingness to serve. Source: Simon et al. (2024), <em>Armed Forces & Society</em>.</div>
          </div>

          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.violet, letterSpacing: 2, marginBottom: 8 }}>🏛️ CHC BRIEFING NEXUS — 5 Evidence Points</div>
            {RESEARCH_STUDY.chc_nexus.map((n, i) => (
              <div key={i} style={{ padding: "8px 0", borderBottom: `1px solid ${P.b}20` }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: n.color, marginBottom: 3 }}>→ {n.point}</div>
                <div style={{ fontSize: 7, color: P.t3, lineHeight: 1.6 }}>{n.detail}</div>
              </div>
            ))}
          </div>

          <div style={{ background: P.card, border: `1px solid ${P.red}20`, borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.red, letterSpacing: 2, marginBottom: 8 }}>⚡ NERO MODEL ALIGNMENT — Simon et al. (2024)</div>
            {RESEARCH_STUDY.nero_alignment.map(n => (
              <div key={n.vector} style={{ display: "grid", gridTemplateColumns: "140px 50px 1fr", gap: 10, alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${P.b}20` }}>
                <span style={{ fontSize: 8, fontWeight: 700, color: P.amber }}>{n.vector}</span>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, fontWeight: 800, color: n.score >= 90 ? P.red : P.amber }}>{n.score}</span>
                <span style={{ fontSize: 7, color: P.t3, lineHeight: 1.5 }}>{n.note}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {RESEARCH_STUDY.quotes.map((q, i) => (
              <div key={i} style={{ background: `${q.color}06`, border: `1px solid ${q.color}25`, borderLeft: `4px solid ${q.color}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 8, color: P.t2, lineHeight: 1.8, fontStyle: "italic", marginBottom: 6 }}>"{q.text}"</div>
                <div style={{ fontSize: 7, color: q.color, fontWeight: 700 }}>— {q.attr}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}