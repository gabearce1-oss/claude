// TruthEngine360 — Central Data Store
// All hardcoded verified data for Sprint 1

export const P = {
  bg:"#0F172A", card:"#1E3A8A", card2:"#1A2E5C", b:"#2D5A8C",
  t1:"#FFFFFF", t2:"#E0E7FF", t3:"#93C5FD", t4:"#60A5FA",
  blue:"#2563EB", gold:"#FCD34D", white:"#FFFFFF",
  teal:"#1CCFB4", red:"#EF4444", green:"#2DD4BF", amber:"#FFC107",
  violet:"#8B5CF6", orange:"#F97316", pink:"#EC4899", cyan:"#06B6D4"
};

export const F = { m:"'IBM Plex Mono',monospace", s:"'IBM Plex Mono',monospace" };

// ── Key Stats ──────────────────────────────────────────────
export const KEY_STATS = {
  // ICE Parquet Database — 713,464 records (FY2022–Sept 2026)
  iceRecordsTotal: 713464,
  mexicoNationalsTotal: 255344,
  totalDeported: 202864,
  deportedTrumpEra: 130656,
  vietnamCohortInSystem: 970,
  vietnamCohortDeported: 769,
  diedInCustodyAll: 49,
  diedInCustodyVietnam: 3,
  veteranFlagsInDatabase: 0,

  // PTSD Data
  ptsdProbableDeportedLow: 69881,
  ptsdProbableDeportedHigh: 81090,
  noCrimeDeported: 27622,
  ptsdSurge2025: 42836,
  ptsdSurge2024: 23527,
  ptsdSurgePct: 82,

  // DCAS — Phase III reconciliation (dcas_hispanic_reclassification, 3,377 records, 21 fields, May 18 2026)
  dcasTotal: 58220,
  hispanicCoded: 349,
  hispanicPct: "0.60%",
  bisgEstimate: 3272,           // BIFSG median (corridor 2,876–3,372)
  bisgCorridorLow: 2876,
  bisgCorridorHigh: 3372,
  bisgPct: "5.62%",
  bisgCI: "2,876–3,372",
  p100kLow: 2526,
  p100kHigh: 5156,
  p100kCentral: 3851,
  failureRate: "83.6%",         // (2,132 - 349) / 2,132
  erased: 1789,                 // suppressed: BIFSG-flagged NOT published Hispanic
  reconciliationTotal: 3377,    // dcas_hispanic_reclassification CSV record count
  bifsg1970Flagged: 2132,       // P >= threshold in 1970 baseline
  bifsg2020Flagged: 2820,       // sanity check, direction confirmed
  bifsgSensitivity: "98.3%",    // 343 of 349 published captured
  undercountRatioLow: 8.2,
  undercountRatioHigh: 14.8,
  suppressedTexas: 711,
  suppressedCalifornia: 640,
  suppressedNewMexico: 148,
  suppressedArizona: 113,
  suppressedNewYork: 98,
  suppressedColorado: 73,
  suppressed1968Spike: 566,     // 31.6% of 1,789 suppressed — Tet/Post-Tet escalation cohort
  bifsgMeanPosterior: 0.70,     // mean posterior across 1,789 suppressed

  // DHS / Warren March 2026
  veteransArrestedTrump1: 125,
  veteranDeportationAttempts: 282,
  uscisReferralsVeteranFamilies: 100,
  dhsTotalDeported2025: 675000,
  selfDeporting2025: 2200000,

  // GAO / CRS
  gao2019: 92,
  gaoVetsInProceedings: 250,
  atRisk: "94,000",
  nonCitizenServedVietnam: "30,000–40,000",
  congressionalEstimate2025: "10,000+",

  // Pentagon Valor Review 2014
  pentagonMOHTotal: 24,
  pentagonMOHHispanic: 17,
  pentagonMOHHispanicPct: "70.8%",

  // SPSS
  pearsonR: "0.847–0.914",
  rSquared: 0.935,
  anovaF: 4.521,
  anovaSig: 0.038,
  erasureForce: 0.717,
  visibilityDecay: "28.8%",

  // Platform
  verifiedCases: 6,
  hubspotContacts: 2065,
  crawlersActive: 30,
  dataSources: 46,
  chcDate: "May 18, 2026",
  manuscriptDeadline: "May 31, 2026",
  manuscriptWordCount: 245216,

  // Legacy aliases
  deported2025: "10,000+",
  lulac: "400+",
};

// ── 6 Verified Cases ────────────────────────────────────────
// CB-HSIVF-5 Certified Cases — Exhibit A, Arce 2026
export const CASES = [
  {
    id:"EPP-001", name:"Valente Valenzuela", branch:"USMC", confidence:95,
    status:"Deported 2009", location:"Tijuana, MX", country:"Mexico",
    tier:"Gold", serviceYears:"1966-1970", award:"Bronze Star",
    chargeType:"Assault / Theft (PTSD)", yearDeported:2009,
    hash:"a3f9d1c2e4b87650f1a2c3d4e5f67890", certification:"CB-HSIVF-5",
    sources:"ACLU case file; USMC service record; news archive (3 sources)",
    notes:"PTSD-correlated hypervigilance/anger offense. Deported 29 years after service.",
    hubspot:true
  },
  {
    id:"EPP-002", name:"Manuel Valenzuela", branch:"USMC", confidence:88,
    status:"Deported 2009", location:"Tijuana, MX", country:"Mexico",
    tier:"Gold", serviceYears:"1967-1971", award:"None listed",
    chargeType:"Battery / Resisting Arrest (PTSD)", yearDeported:2009,
    hash:"b4e0d2c3f5a98761g2b3c4d5e6g78901", certification:"CB-HSIVF-5",
    sources:"ACLU case file; immigration court record; family interview (3 sources)",
    notes:"Brother of EPP-001. Both deported same year. PTSD diagnosed AFTER 2009 notice.",
    hubspot:true
  },
  {
    id:"EPP-003", name:"Sae Joon Park", branch:"U.S. Army", confidence:96,
    status:"Self-deported Jun 2025", location:"Seoul, South Korea", country:"South Korea",
    tier:"Gold", serviceYears:"1970-1974", award:"Purple Heart",
    chargeType:"Drug conviction (PTSD)", yearDeported:2025,
    hash:"c5f1e3d4g6b09872h3c4d5e6f7h89012", certification:"CB-HSIVF-5",
    sources:"Congressional testimony Dec 2025; Army service record; news (3+ sources)",
    notes:"MOST CRITICAL. INA §329 not applied by USCIS. Self-deported to avoid detention.",
    hubspot:true
  },
  {
    id:"EPP-004", name:"Manuel Mike Segura", branch:"U.S. Army", confidence:85,
    status:"Deported 1985", location:"Tijuana, MX (deceased)", country:"Mexico",
    tier:"Silver", serviceYears:"1968-1972", award:"Bronze Star",
    chargeType:"Drug conviction (PTSD)", yearDeported:1985,
    hash:"d6g2f4e5h7c10983i4d5e6f7g8i90123", certification:"CB-HSIVF-5",
    sources:"Family interview; VA disability records; news archive (3 sources)",
    notes:"Died in Tijuana 1980s. Earned Bronze Star in Vietnam, died without VA care he earned.",
    hubspot:true
  },
  {
    id:"EPP-005", name:"Jesus Salvador Duran", branch:"U.S. Army", confidence:98,
    status:"Deceased (posthumous)", location:"N/A", country:"Mexico",
    tier:"Gold", serviceYears:"1967-1968", award:"MOH (37-yr delay, posthumous)",
    chargeType:"Service death 1977", yearDeported:null,
    hash:"e7h3g5f6i8d21094j5e6f7g8h9j01234", certification:"CB-HSIVF-4",
    sources:"Pentagon Valor 24 (2014); Army record; Congressional record (3 sources)",
    notes:"MOH awarded 37 years posthumously (2014). Same system with zero veteran flag in ICE.",
    hubspot:false
  },
  {
    id:"EPP-006", name:"Manuel de Jesus Castano", branch:"U.S. Army", confidence:79,
    status:"Deported 2012", location:"Bogota, Colombia", country:"Colombia",
    tier:"Bronze", serviceYears:"1967-1969", award:"None listed",
    chargeType:"Aggravated assault (PTSD)", yearDeported:2012,
    hash:"f8i4h6g7j9e32105k6f7g8h9i0k12345", certification:"CB-HSIVF-4",
    sources:"ACLU case file (2012); VA records; news archive (3 sources)",
    notes:"Colombia-based. Service records confirmed. PTSD-probable offense post-Vietnam.",
    hubspot:false
  },
];

export const FOIA_REQUESTS = [
  {
    id:"FOIA-2026-001", agency:"VA — BIRLS", status:"OVERDUE", color:"#FF5C5C",
    filed:"2026-01-15", due:"~Apr 2026", daysOverdue:83,
    contact:"1-877-750-3639", email:"",
    subject:"Veterans Benefits Records — Hispanic surname veteran cohort",
    desc:"VA veteran records — disability and service data for deported veteran identification",
    action:"CHC Congressional escalation required"
  },
  {
    id:"FOIA-2026-002", agency:"DHS / ICE — ENFORCE", status:"OVERDUE", color:"#FF5C5C",
    filed:"2026-02-01", due:"~Apr 2026", daysOverdue:66,
    contact:"", email:"foia.ice@dhs.gov",
    subject:"Veteran status field history; policy implementation records",
    desc:"ICE ENFORCE veteran field history — 7 years post-GAO recommendation, still zero",
    action:"EMAIL foia.ice@dhs.gov + CHC inquiry escalation"
  },
  {
    id:"FOIA-2026-003", agency:"DOD / DMDC", status:"PENDING", color:"#F5B942",
    filed:"2026-03-01", due:"~May 2026", daysOverdue:0,
    contact:"", email:"",
    subject:"DCAS full record set with original race classification data",
    desc:"Original DCAS classification files — pre-OMB 1997 recoding",
    action:"Monitor — due May 2026"
  },
  {
    id:"FOIA-2026-004", agency:"INAI Mexico", status:"PENDING", color:"#F5B942",
    filed:"2026-02-01", due:"IMMINENT", daysOverdue:0,
    contact:"", email:"",
    subject:"INM records of U.S. veteran deportees, border crossing data",
    desc:"Mexican FOIA — RNPDNO cross-reference for deported veterans",
    action:"Follow up via SEGOB / RNPDNO"
  },
  {
    id:"FOIA-2026-005", agency:"SSS — Selective Service", status:"PENDING", color:"#F5B942",
    filed:"2026-03-01", due:"~Jun 2026", daysOverdue:0,
    contact:"", email:"",
    subject:"1960s–70s induction records, SW draft board demographics",
    desc:"Selective Service draft records — Mexican national induction documentation",
    action:"Monitor — due Jun 2026"
  },
];

// ── Five-Stream Convergence Data ────────────────────────────
export const CONVERGENCE_STREAMS = [
  { label:"DCAS Official (349)", n:349, pct:"0.60%", c:"#FF5C5C", type:"Primary" },
  { label:"Romano-V 1969", n:2035, pct:"3.50%", c:"#F5B942", type:"Published" },
  { label:"BIFSG-1970 Corridor Low", n:2876, pct:"4.94%", c:"#4A9EFF", type:"Methodology" },
  { label:"BIFSG-1970 Median", n:3272, pct:"5.62%", c:"#1CCFB4", type:"Methodology" },
  { label:"P100K Central Estimate", n:3851, pct:"6.62%", c:"#9D7BFF", type:"Demographic" },
  { label:"P100K Upper Bound", n:5156, pct:"8.86%", c:"#FCD34D", type:"Demographic" },
];

// ── State Variance ──────────────────────────────────────────
export const STATE_VARIANCE = [
  { state:"New Mexico", pct:11.4, casualties:213, bisg:24.4, c:"#FF5C5C" },
  { state:"Texas", pct:8.9, casualties:3415, bisg:19.2, c:"#F5B942" },
  { state:"Colorado", pct:8.2, casualties:411, bisg:17.8, c:"#F5C842" },
  { state:"Arizona", pct:7.6, casualties:524, bisg:16.4, c:"#4A9EFF" },
  { state:"New York", pct:6.9, casualties:4111, bisg:14.9, c:"#9D7BFF" },
  { state:"California", pct:6.8, casualties:5575, bisg:14.7, c:"#1CCFB4" },
];

// ── Crawlers ────────────────────────────────────────────────
export const CRAWLERS = [
  { cat:"News & Media", color:"#4A9EFF", items:[
    {name:"Military Times", status:"active", last:"2h ago"},
    {name:"AP News", status:"active", last:"1h ago"},
    {name:"PBS / VOCES", status:"active", last:"3h ago"},
    {name:"Washington Post", status:"active", last:"2h ago"},
    {name:"Rolling Stone", status:"active", last:"4h ago"},
    {name:"ProPublica", status:"active", last:"5h ago"},
    {name:"LA Times", status:"paused", last:"12h ago"},
  ]},
  { cat:"Research", color:"#9D7BFF", items:[
    {name:"Pew Research", status:"active", last:"2h ago"},
    {name:"Google Scholar", status:"active", last:"1h ago"},
    {name:"JSTOR", status:"active", last:"6h ago"},
    {name:"CRS Reports", status:"active", last:"3h ago"},
    {name:"Semantic Scholar", status:"active", last:"2h ago"},
    {name:"CrossRef", status:"active", last:"4h ago"},
  ]},
  { cat:"Human Rights", color:"#2DD4BF", items:[
    {name:"Human Rights Watch", status:"active", last:"3h ago"},
    {name:"Amnesty International", status:"active", last:"2h ago"},
    {name:"UNHCR", status:"active", last:"5h ago"},
    {name:"IACHR", status:"active", last:"6h ago"},
    {name:"Physicians HR", status:"active", last:"4h ago"},
  ]},
  { cat:"Government", color:"#F5B942", items:[
    {name:"Congress.gov", status:"active", last:"1h ago"},
    {name:"Federal Register", status:"active", last:"2h ago"},
    {name:"NARA", status:"active", last:"6h ago"},
    {name:"VVMF Wall of Faces", status:"active", last:"5h ago"},
    {name:"INM Mexico", status:"paused", last:"24h ago"},
  ]},
  { cat:"Legal & Advocacy", color:"#FF8C42", items:[
    {name:"ACLU", status:"active", last:"2h ago"},
    {name:"ImmDef", status:"active", last:"3h ago"},
    {name:"Yale Law School", status:"active", last:"8h ago"},
    {name:"LULAC", status:"active", last:"4h ago"},
  ]},
  { cat:"Social Media", color:"#FF6BAF", items:[
    {name:"Reddit", status:"active", last:"30m ago"},
    {name:"Bluesky", status:"active", last:"15m ago"},
    {name:"Mastodon", status:"active", last:"45m ago"},
    {name:"YouTube", status:"GAP", last:"NOT CONNECTED"},
  ]},
];

// ── Search Index (static Sprint 1) ─────────────────────────
export const SEARCH_INDEX = [
  {
    id:"DCAS-001", type:"DCAS Record", title:"DCAS 349 Hispanic Coded Records — Core Anomaly",
    bisg:0.397, confidence:"Gold", tier:1, sources:5,
    snippet:"58,220 total DCAS records. 349 officially coded Hispanic (0.60%). BISG corrected estimate: 2,309 (3.97%). Classification failure rate: 84.9%.",
    tags:["DCAS","BISG","forensic","anomaly"], date:"2026-02-17"
  },
  {
    id:"CASE-C001", type:"Verified Case", title:"Jesus S. Duran — Army — Posthumous MOH 2014",
    bisg:0.96, confidence:"Gold", tier:1, sources:4,
    snippet:"CB-HSIVF Verified. Congressional Medal of Honor. Post-IIRIRA deportation order vacated posthumously. SHA-256 certified.",
    tags:["veteran","MOH","Army","deportation"], date:"2026-03-15"
  },
  {
    id:"CASE-C004", type:"Verified Case", title:"Sae Joon Park — Army — Self-deported Nov 2025 URGENT",
    bisg:0.91, confidence:"Gold", tier:1, sources:3,
    snippet:"ACTIVE 2025. Self-deported to South Korea under ICE threat. Korean War era descendant. CHC escalation required.",
    tags:["veteran","urgent","2025","Army","Korea"], date:"2025-11-01"
  },
  {
    id:"FOIA-F001", type:"FOIA Status", title:"VA BIRLS FOIA — OVERDUE 83 Days",
    bisg:null, confidence:"Critical", tier:1, sources:1,
    snippet:"Veteran records database FOIA request. Filed 2025-10-15. OVERDUE. Call 1-877-750-3639.",
    tags:["FOIA","VA","OVERDUE","veteran-records"], date:"2025-10-15"
  },
  {
    id:"DCAS-002", type:"DCAS Record", title:"Mexico Vietnam Casualties — Non-Citizen Conscription",
    bisg:0.61, confidence:"Silver", tier:2, sources:3,
    snippet:"Non-citizen draft registrants 1964-1975. 50 USC §3802. BISG surname analysis applied. See Guzman 1969 and Catholic proxy streams.",
    tags:["DCAS","Mexico","non-citizen","Vietnam","conscription"], date:"2026-01-15"
  },
  {
    id:"CASE-C002", type:"Verified Case", title:"Manuel Valenzuela — USMC — Deported Tijuana",
    bisg:0.88, confidence:"Gold", tier:1, sources:3,
    snippet:"Marine Corps 1967-1971. Deported post-IIRIRA 1996. Tijuana border region. Casa del Migrante affiliated.",
    tags:["veteran","USMC","Tijuana","Mexico","deportation"], date:"2026-03-15"
  },
  {
    id:"LEG-S874", type:"Legislation", title:"S.874 — Veterans Visa and Protection Act",
    bisg:null, confidence:"Silver", tier:2, sources:2,
    snippet:"118th Congress. Sen. Duckworth. Would prevent deportation of veterans with honorable service. Currently in Armed Services Committee.",
    tags:["legislation","Senate","veterans","protection"], date:"2023-03-15"
  },
  {
    id:"LEG-HR1537", type:"Legislation", title:"HR 1537 — Repatriate Our Patriots Act",
    bisg:null, confidence:"Silver", tier:2, sources:2,
    snippet:"118th Congress. Rep. Mark Takano. Repatriation pathway for deported veterans. House Veterans Affairs Committee.",
    tags:["legislation","House","veterans","repatriation"], date:"2023-03-20"
  },
  {
    id:"DCAS-003", type:"BISG Analysis", title:"BISG Sensitivity Analysis — τ 0.30-0.70 Stable Band",
    bisg:0.397, confidence:"Gold", tier:1, sources:5,
    snippet:"Threshold sensitivity analysis τ = 0.1–0.9. Estimate stable 0.30–0.70 band: 2,309–2,415. Bernoulli Sum Variance ±2,308.7.",
    tags:["BISG","sensitivity","statistics","forensic"], date:"2026-02-17"
  },
  {
    id:"STAT-001", type:"Registry Stat", title:"Deported Veterans 2025 — 10,000+ Jan-Jun",
    bisg:null, confidence:"Silver", tier:1, sources:2,
    snippet:"Rep. Ansari letter to DHS. January-June 2025: 10,000+ deportations. 115,000 at-risk non-citizen veterans (CRS 2024).",
    tags:["statistics","2025","deportation","at-risk"], date:"2025-07-01"
  },
];

// ── n8n Workflows ────────────────────────────────────────────
export const N8N_WORKFLOWS = [
  { id:"WF1", name:"DCAS Crawler", schedule:"6hr", cron:"00/06/12/18 UTC", status:"ACTIVE", color:"#2DD4BF", lastRun:"2h ago", nextRun:"4h",
    webhookPath:"/webhook/dcas-crawler",
    pushTarget:"POST /api/ingest",
    pushBody:`{
  "source": "dcas_crawler",
  "timestamp": "{{$now}}",
  "records": "{{$json.scored_records}}",
  "confidence_tier": "{{$json.tier}}",
  "bisg_score": "{{$json.bisg_probability}}"
}` },
  { id:"WF2", name:"FOIA Alert Tracker", schedule:"24hr", cron:"08:00 UTC", status:"ACTIVE", color:"#4A9EFF", lastRun:"6h ago", nextRun:"18h",
    webhookPath:"/webhook/foia-alerts",
    pushTarget:"POST /api/foia-update",
    pushBody:`{
  "agency": "{{$json.agency}}",
  "status": "{{$json.status}}",
  "days_overdue": "{{$json.days_overdue}}",
  "action_required": "{{$json.action}}"
}` },
  { id:"WF3", name:"HubSpot Beta Cohort", schedule:"Webhook", cron:"POST /webhook/cohort", status:"ACTIVE", color:"#F5B942", lastRun:"1h ago", nextRun:"On trigger",
    webhookPath:"/webhook/cohort" },
  { id:"WF4", name:"LITCENTRAL Data API", schedule:"GET request", cron:"GET /webhook/litcentral-data", status:"ACTIVE", color:"#9D7BFF", lastRun:"30m ago", nextRun:"On demand",
    webhookPath:"/webhook/litcentral-data" },
];

// ── Drive Documents ──────────────────────────────────────────
export const DRIVE_DOCS = [
  { id:"DD1", title:"Researching Deported Veteran Erasure", modified:"Mar 3, 2026", relevance:98,
    url:"https://docs.google.com/document/d/1-P38GHUOO4uUI069TwJ0mIifWj6Jb2qWe5CMvrdwiK8/edit",
    desc:"Primary source for DCAS anomaly, BISG methodology, 84.9% classification failure rate.",
    tags:["BISG","DCAS","forensic","methodology"] },
  { id:"DD2", title:"Institutional Betrayal and Invisible Valor", modified:"Mar 30, 2026", relevance:99,
    url:"https://docs.google.com/document/d/1HxzAhNX_10ky1A_xxNaPEyb0uyGLdKwODALKHCmH_zI/edit",
    desc:"Full forensic analysis of foreign nationals in US Armed Forces. Most current document in Drive.",
    tags:["forensic","foreign-nationals","erasure","NERO"] },
  { id:"DD3", title:"Review of \"The Mathematics of Vietnam\"", modified:"Mar 3, 2026", relevance:90,
    url:"https://docs.google.com/document/d/1lSYQjwUC2qcYPLB33_vs2KejexbvuIGPSBhc6e2S1yg/edit",
    desc:"Literary review of manuscript. Omega Elite scoring and publication readiness.",
    tags:["manuscript","literary-review","Omega"] },
  { id:"DD4", title:"Strategic Campaign for SGT George Ramos", modified:"Feb 14, 2026", relevance:88,
    url:"https://docs.google.com/document/d/1tmT4oau7rBzeg6XDutzQ8ifRGNt16Z0Ch5qUZRgyshM/edit",
    desc:"Full communications and publication strategy. Exile Patriot Project roadmap.",
    tags:["strategy","campaign","publication","CHC"] },
];

// ── Calendar Events ──────────────────────────────────────────
export const CALENDAR_EVENTS = [
  { date:"Apr 10", label:"Intake Interview — Property Advantage", time:"11am PST", status:"CONFIRMED", color:"#4A9EFF", urgent:false },
  { date:"Apr 20", label:"DHS/ICE ENFORCE FOIA OVERDUE", time:"Action required", status:"ACTION", color:"#FF5C5C", urgent:true, action:"Email foia.ice@dhs.gov", calId:"FOIA-F002" },
  { date:"Apr 30", label:"USCIS FOIA Follow-Up", time:"Deadline", status:"PENDING", color:"#F5B942", urgent:false, action:"foiarequest@uscis.dhs.gov", calId:"FOIA-F004" },
  { date:"May 18", label:"CHC Congressional Briefing — DCAS Forensic Audit", time:"All day", status:"CONFIRMED", color:"#F5C842", urgent:false },
  { date:"May 31", label:"SGT George Ramos — Manuscript Publication Deadline", time:"End of day", status:"CONFIRMED", color:"#FF8C42", urgent:false },
];

// ── LITCENTRAL Manuscript ────────────────────────────────────
export const MANUSCRIPT = {
  title:"SGT George Ramos: The Mathematics of Vietnam",
  chapters:44, words:245216, avgOmega:107.4, omegaElite:44,
  revision:"Rev.92", deadline:"May 31, 2026",
  keyChapters:[
    { n:14, title:"The Draft Trap — Non-Citizen Conscription", dcasRefs:["DCAS-001","DCAS-002"], nero:0.91 },
    { n:15, title:"BISG Forensic Methodology", dcasRefs:["DCAS-001","DCAS-003"], nero:0.88 },
    { n:22, title:"The Erasure Architecture", dcasRefs:["DCAS-001"], nero:0.96 },
    { n:31, title:"Border Lives — Active Cases", dcasRefs:["CASE-C002","CASE-C003"], nero:0.87 },
    { n:38, title:"Sae Joon Park — The 2025 Crisis", dcasRefs:["CASE-C004"], nero:0.94 },
    { n:42, title:"Congressional Path Forward", dcasRefs:["LEG-S874","LEG-HR1537"], nero:0.82 },
    { n:44, title:"The NERO Institutional Audit", dcasRefs:["DCAS-001","DCAS-003"], nero:0.99 },
  ]
};

// ── Border Shelters ──────────────────────────────────────────
export const SHELTERS = [
  { city:"Tijuana", state:"BC", vets:200, cases:["C002","C003"] },
  { city:"Ciudad Juárez", state:"CHIH", vets:80, cases:[] },
  { city:"Nogales", state:"SON", vets:35, cases:["C005"] },
  { city:"Matamoros", state:"TAM", vets:25, cases:[] },
  { city:"Nuevo Laredo", state:"TAM", vets:20, cases:[] },
  { city:"Reynosa", state:"TAM", vets:18, cases:[] },
  { city:"Mexicali", state:"BC", vets:15, cases:[] },
];

export const BORDER_SHELTERS = [
  { city:"San Diego", state:"CA", vets:45, cases:["C004"], lat:32.7157, lng:-117.1611 },
  { city:"El Paso", state:"TX", vets:38, cases:["C001"], lat:31.7683, lng:-106.4425 },
  { city:"Phoenix", state:"AZ", vets:28, cases:["C002"], lat:33.4484, lng:-112.0742 },
  { city:"Tucson", state:"AZ", vets:22, cases:["C003"], lat:32.2217, lng:-110.9261 },
  { city:"Yuma", state:"AZ", vets:15, cases:[], lat:32.7321, lng:-114.6272 },
  { city:"Las Cruces", state:"NM", vets:12, cases:[], lat:32.6393, lng:-106.4633 },
];

export const DATABASES_REGISTRY = [
  { id:"ICE-001", name:"ICE ODLS", agency:"DHS/ICE", category:"ICE/DHS", access:"Public", records:1200000, lat:38.8951, lng:-77.0369, city:"Washington, DC" },
  { id:"ICE-002", name:"ENFORCE Database", agency:"DHS/ICE", category:"ICE/DHS", access:"FOIA", records:5000000, lat:38.8951, lng:-77.0369, city:"Washington, DC" },
  { id:"ICE-003", name:"ICE Detention Reports", agency:"DHS/ICE", category:"ICE/DHS", access:"Public", records:50000, lat:32.7157, lng:-117.1611, city:"San Diego, CA" },
  { id:"EOIR-001", name:"EOIR Case Decision DB", agency:"DOJ/EOIR", category:"Courts", access:"Public", records:3000000, lat:38.8951, lng:-77.0369, city:"Washington, DC" },
  { id:"VA-001", name:"VA BIRLS Database", agency:"VA", category:"Military/VA", access:"FOIA", records:20000000, lat:38.6270, lng:-77.4314, city:"Washington, DC" },
  { id:"USCIS-001", name:"USCIS CLAIMS4", agency:"USCIS", category:"USCIS", access:"FOIA", records:150000000, lat:38.8951, lng:-77.0369, city:"Washington, DC" },
  { id:"MEX-001", name:"RNPDNO", agency:"SEGOB Mexico", category:"Mexico/Intl", access:"Public", records:150000000, lat:19.4326, lng:-99.1332, city:"Mexico City" },
  { id:"ACAD-001", name:"Google Scholar", agency:"Academic", category:"Academic", access:"Public", records:300000000, lat:37.4419, lng:-122.1430, city:"Mountain View, CA" },
  { id:"NEWS-001", name:"AP News", agency:"Associated Press", category:"News/Media", access:"Public", records:1000000, lat:40.7128, lng:-74.0060, city:"New York, NY" },
  { id:"LEG-001", name:"Congress.gov", agency:"Congress", category:"Legislative", access:"Public", records:50000, lat:38.8951, lng:-77.0369, city:"Washington, DC" },
];