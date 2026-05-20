import { useState } from "react";
import { P } from "../../lib/teData";

const DATABASES = [
  // ── DETAINEE LOCATORS ──────────────────────────────────────
  {
    id: "ice_odls", category: "Detainee Locator", priority: "CRITICAL", icon: "🔍",
    name: "ICE Online Detainee Locator (ODLS)",
    org: "DHS / ICE",
    url: "https://locator.ice.gov/odls/#/search",
    status: "LIVE",
    color: P.red,
    description: "Search for individuals currently detained by ICE by name and country of birth, or by A-number. Real-time database.",
    use_case: "Primary tool to locate detained veterans. Use A-number for exact match.",
    data_fields: ["Name", "Country of Birth", "A-Number", "Facility", "Booking Date", "Status"],
    source: "No More Deaths / Freedom for Immigrants",
  },
  {
    id: "nilc_guide", category: "Detainee Locator", priority: "CRITICAL", icon: "📋",
    name: "NILC: How to Locate a Disappeared Person",
    org: "National Immigrant Law Center",
    url: "https://www.nilc.org/wp-content/uploads/2025/04/How-to-Locate-a-ICE-Disappearance.pdf",
    status: "LIVE",
    color: P.red,
    description: "Step-by-step PDF guide for locating someone who has been disappeared by ICE. Covers ODLS, legal contacts, consular services.",
    use_case: "Field guide for families and advocates when a veteran is detained without notice.",
    data_fields: ["ICE Locator Steps", "Legal Aid Contacts", "Consular Access", "Habeas Corpus"],
    source: "Unauthorized City / FFI",
  },
  {
    id: "ffi_toolkit", category: "Detainee Locator", priority: "HIGH", icon: "🧰",
    name: "Freedom for Immigrants: Lost in Detention Toolkit",
    org: "Freedom for Immigrants",
    url: "https://www.freedomforimmigrants.org/toolkit-lost-in-detention",
    status: "LIVE",
    color: P.amber,
    description: "Community toolkit for families navigating ICE detention. Includes legal resources, visitation guides, hotlines.",
    use_case: "Support families of detained veterans across 200+ ICE facilities.",
    data_fields: ["Facility Contacts", "Legal Aid", "Visitation Policies", "Bond Info"],
    source: "Freedom for Immigrants",
  },

  // ── DETENTION MAPPING ──────────────────────────────────────
  {
    id: "ffi_map", category: "Detention Mapping", priority: "CRITICAL", icon: "🗺️",
    name: "FFI National Immigration Detention Map",
    org: "Freedom for Immigrants",
    url: "https://map.freedomforimmigrants.org/map",
    status: "LIVE",
    color: P.blue,
    description: "Interactive map of 200+ ICE detention sites with facility info, visitation policies, contract data, phone numbers, and community resources by location.",
    use_case: "Locate any ICE detention facility, find local legal aid, track facility contract history.",
    data_fields: ["Facility Name", "Address", "Phone", "Operator", "Contract", "Visitation Policy", "Resources"],
    source: "Freedom for Immigrants",
    notes: "5 layers: Directory, Resources, Organizing, Storytelling, Detention by Numbers",
  },
  {
    id: "unauthorized_city", category: "Detention Mapping", priority: "CRITICAL", icon: "📊",
    name: "Unauthorized City — Detention Tracker (Dr. A.J. Kim / SDSU)",
    org: "Dr. A.J. Kim — San Diego State University",
    url: "https://www.unauthorizedcity.com/facilities",
    status: "LIVE",
    color: P.teal,
    description: "Real-time detention statistics. 265 facilities tracked monthly. Total detained, avg length of stay, non-criminal %, gender. Updated monthly from DHS data.",
    use_case: "Real-time detention population data. Feb 2026: 67,000+ detained, 78% non-criminal.",
    data_fields: ["Facility Name", "Address", "Phone", "Type", "Total Detained", "Avg Stay (Days)", "Gender", "Non-Criminal %", "ICE Warehouse Purchases"],
    source: "Freedom for Immigrants / SDSU",
    notes: "Feb 2026: 67,000+ detained. 265 facilities. 78% non-criminal record. Heatmapped by detainment.",
    dhs_sheet: "https://docs.google.com/spreadsheets/d/1nSUbWttXvFRtigzs_AOnzhbgu6IsVwYZ/edit",
  },
  {
    id: "vera_detention", category: "Detention Mapping", priority: "HIGH", icon: "📈",
    name: "Vera Institute — ICE Detention Trends Dashboard",
    org: "Vera Institute of Justice",
    url: "https://www.vera.org/ice-detention-trends",
    status: "LIVE",
    color: P.violet,
    description: "17-year longitudinal analysis of ICE detention. 1,490 facilities tracked Oct 2008–Mar 2026. Daily midnight + 24hr populations. Downloadable data via GitHub.",
    use_case: "Track how detention population exploded from 14K (2021 low) to 67K+ (2026 record high).",
    data_fields: ["Facility", "Date", "Midnight Population", "24hr Population", "Facility Type", "Operator", "Active/Inactive"],
    source: "Unauthorized City / FFI",
    notes: "GitHub download: github.com/vera-institute/ice-detention-trends",
    github: "https://github.com/vera-institute/ice-detention-trends",
  },

  // ── DEPORTATION DATA ──────────────────────────────────────
  {
    id: "ddp_arrests", category: "Deportation Databases", priority: "CRITICAL", icon: "🚔",
    name: "Deportation Data Project — ICE Arrests",
    org: "Deportation Data Project (UC Berkeley Law)",
    url: "https://ice-arrests.apps.deportationdata.org/",
    status: "LIVE",
    color: P.red,
    description: "Individual-level ICE arrest data obtained through FOIA litigation. Filter, sort, download. Covers 2025–2026 enforcement surge.",
    use_case: "Find arrest patterns by nationality, location, offense type — cross-reference veteran A-numbers.",
    data_fields: ["A-Number", "Arrest Date", "State", "Offense", "Nationality", "Case Type"],
    source: "Deportation Data Project",
  },
  {
    id: "ddp_detainers", category: "Deportation Databases", priority: "CRITICAL", icon: "📎",
    name: "Deportation Data Project — ICE Detainer Requests",
    org: "Deportation Data Project (UC Berkeley Law)",
    url: "https://ice-detainers.apps.deportationdata.org/",
    status: "LIVE",
    color: P.amber,
    description: "ICE detainer request database — shows which local jails are cooperating with ICE and placing detainers on individuals after local charge.",
    use_case: "Track detainers on veteran cases — flag IIRIRA retroactive detainers.",
    data_fields: ["Facility", "Date", "Nationality", "Offense", "Detainer Outcome", "State"],
    source: "Deportation Data Project",
  },
  {
    id: "ddp_stays", category: "Deportation Databases", priority: "CRITICAL", icon: "📅",
    name: "Deportation Data Project — ICE Detention Stays",
    org: "Deportation Data Project (UC Berkeley Law)",
    url: "https://ice-detention-stays.apps.deportationdata.org/",
    status: "LIVE",
    color: P.blue,
    description: "Individual detention stay records — book-in/book-out dates, facility, nationality, outcome. FOIA-obtained.",
    use_case: "Track veteran detention length and facility transfers. Cross-reference with ODLS locator.",
    data_fields: ["A-Number", "Book-In Date", "Book-Out Date", "Facility", "Length (Days)", "Outcome", "Nationality"],
    source: "Deportation Data Project",
  },
  {
    id: "ddp_facilities", category: "Deportation Databases", priority: "HIGH", icon: "🏢",
    name: "Deportation Data Project — ICE Facility Daily Populations",
    org: "Deportation Data Project (UC Berkeley Law)",
    url: "https://ice-facility-daily-population.apps.deportationdata.org/",
    status: "LIVE",
    color: P.violet,
    description: "Daily headcount at each ICE facility. Allows trend analysis at the facility level.",
    use_case: "Monitor populations at facilities near border shelters where veterans are held.",
    data_fields: ["Facility", "Date", "Daily Population", "Capacity", "Operator", "State"],
    source: "Deportation Data Project",
  },
  {
    id: "ddp_eoir", category: "Deportation Databases", priority: "HIGH", icon: "⚖️",
    name: "Deportation Data Project — EOIR Immigration Court Cases",
    org: "Deportation Data Project (UC Berkeley Law)",
    url: "https://eoir-removal-cases.apps.deportationdata.org/",
    status: "LIVE",
    color: P.gold,
    description: "Immigration court case-level data: case type, judge, decision, nationality. Full EOIR extract.",
    use_case: "Research removal order patterns for veteran cases. Find judge-level decision data.",
    data_fields: ["Case ID", "Nationality", "Case Type", "Judge", "Decision", "Court", "Date"],
    source: "Deportation Data Project",
  },
  {
    id: "ddp_download", category: "Deportation Databases", priority: "HIGH", icon: "💾",
    name: "Deportation Data Project — Bulk Downloads",
    org: "Deportation Data Project (UC Berkeley Law)",
    url: "https://deportationdata.org/data/processed/ice.html",
    status: "LIVE",
    color: P.teal,
    description: "Processed ICE + EOIR datasets for bulk download. Codebooks, data guides, FOIA documentation. Subscribe for updates.",
    use_case: "Bulk download for BISG cross-analysis on veteran surnames against arrest/detainer data.",
    data_fields: ["ICE Arrests (processed)", "ICE Detainers", "Detention Stays", "EOIR Cases"],
    source: "Deportation Data Project",
    subscribe: "https://groups.google.com/a/law.berkeley.edu/g/deportation_data_updates/about",
  },
  {
    id: "kocher_adp", category: "Deportation Databases", priority: "MEDIUM", icon: "📉",
    name: "Interval ADP Update (Austin Kocher Substack)",
    org: "Austin Kocher — Syracuse University",
    url: "https://austinkocher.substack.com",
    status: "LIVE",
    color: P.amber,
    description: "Monthly Average Daily Population updates with detailed analysis of detention trends. Free newsletter from immigration data expert.",
    use_case: "Monthly briefing-ready data on detention surge for CHC talking points.",
    data_fields: ["ADP by Month", "Facility Trends", "Non-Criminal %", "Policy Impact"],
    source: "Unauthorized City",
  },

  // ── MISSING PERSONS (MEXICO) ──────────────────────────────
  {
    id: "sjm_mx", category: "Missing Persons (Mexico)", priority: "CRITICAL", icon: "✝️",
    name: "Servicio Jesuita a Migrantes (SJM México)",
    org: "Jesuits / SJM México",
    url: "http://www.sjmmexico.org.mx/",
    status: "LIVE",
    color: P.gold,
    description: "Jesuit network connecting with migrant shelters throughout Mexico AND government authorities to search for missing migrants. Phone: 55-55-27-54-23.",
    use_case: "Search for deported veteran lost in Mexican territory. SJM contacts all shelter network + authorities.",
    data_fields: ["Shelter Network", "Government Contacts", "Family Notification", "Search Coordination"],
    source: "No More Deaths",
    phone: "55-55-27-54-23",
    email: "desaparecidos@sjmmexico.org",
  },
  {
    id: "grupos_beta", category: "Missing Persons (Mexico)", priority: "CRITICAL", icon: "🟡",
    name: "Grupos Beta de Protección a Migrantes (INM)",
    org: "Instituto Nacional de Migración — México",
    url: "https://www.gob.mx/inm/acciones-y-programas/grupos-beta-de-proteccion-a-migrantes",
    status: "LIVE",
    color: P.amber,
    description: "22 Mexican government rescue units in 9 states. Rescue, first aid, legal guidance for migrants. Active in all border crossing zones.",
    use_case: "Emergency contact for deported veterans in distress at the border. Active in all 9 border states.",
    data_fields: ["Rescue", "First Aid", "Legal Orientation", "Search Coordination", "GPS Location"],
    source: "No More Deaths",
    phone_directory: {
      "Tijuana, BC": "664-682-3171",
      "Mexicali, BC": "685-554-2624",
      "Sonoyta, Sonora": "651-512-1520",
      "Nogales, Sonora": "631-312-6180",
      "Agua Prieta, Sonora": "663-338-1618",
      "Pto. Palomas, Chih.": "656-666-0889",
      "Cd. Juárez, Chih.": "656-612-7618",
      "Cd. Acuña, Coah.": "877-772-7524",
      "Piedras Negras, Coah.": "878-782-8846",
      "Matamoros, Tamps.": "868-812-3468",
      "Tenosique, Tabasco": "934-342-0110",
      "Tapachula, Chiapas": "962-625-7986",
      "Tuxtla Gtź., Chiapas": "961-602-6111",
      "Arriaga, Chiapas": "966-662-2017",
      "Ixtepec, Oaxaca": "971-713-3047",
    },
  },
  {
    id: "rnpdno_cnb", category: "Missing Persons (Mexico)", priority: "HIGH", icon: "🔍",
    name: "RNPDNO — Registro Nacional de Personas Desaparecidas",
    org: "Comisión Nacional de Búsqueda — México",
    url: "https://www.gob.mx/cnb",
    status: "LIVE",
    color: P.red,
    description: "115,000+ disappeared persons registry. IOM actively working with CNB on cross-border data gaps for disappeared Mexican citizens abroad.",
    use_case: "Search for deported veterans who go missing post-deportation in Mexico.",
    data_fields: ["Name", "DOB", "Disappearance Date", "State", "Nationality", "Status"],
    source: "AUMER Research",
  },
  {
    id: "nmd_guide", category: "Missing Persons (Mexico)", priority: "HIGH", icon: "🏜️",
    name: "No More Deaths — Missing at the Border",
    org: "No More Deaths / No Más Muertes",
    url: "https://nomoredeaths.org/searching-for-someone-missing-at-the-border/",
    status: "LIVE",
    color: P.teal,
    description: "Complete guide for families searching for missing migrants at the US-Mexico border. Covers Mexico-side and US-side resources.",
    use_case: "Step-by-step resource for locating deported veterans who went missing crossing or post-deportation.",
    data_fields: ["Shelter Contacts", "Grupos Beta Directory", "Government Hotlines", "Legal Aid"],
    source: "No More Deaths",
  },
  {
    id: "mx_emergency", category: "Missing Persons (Mexico)", priority: "CRITICAL", icon: "🚨",
    name: "Mexico Emergency Numbers",
    org: "Mexican Government",
    url: "https://www.gob.mx",
    status: "LIVE",
    color: P.red,
    description: "Emergency services in Mexico: 060 (police), 065 (Red Cross), 068 (fire), 911 (general emergency). From US: dial 01152 first.",
    use_case: "Emergency contact for deported veteran in medical, legal, or security distress in Mexico.",
    data_fields: ["060 Police", "065 Red Cross", "068 Fire", "911 General"],
    source: "No More Deaths",
    phone_directory: {
      "Emergency (General)": "911",
      "Police": "060",
      "Red Cross / Medical": "065",
      "Fire": "068",
      "From US → Mexico": "01152 + number",
      "Within Mexico": "01 + number",
    },
  },

  // ── CROWDSOURCED ─────────────────────────────────────────
  {
    id: "people_over_papers", category: "Crowdsourced Intelligence", priority: "HIGH", icon: "👥",
    name: "People over Papers — Crowdsourced Raid Reports",
    org: "ICE Out (iceout.org)",
    url: "https://iceout.org/es/",
    status: "LIVE",
    color: P.violet,
    description: "Anonymous crowdsourced platform to report ICE raid locations in real-time. Community early warning system.",
    use_case: "Monitor enforcement surge near veteran shelter locations. Flag pre-dawn sweep patterns.",
    data_fields: ["Location", "Date/Time", "Agency Type", "Report Type", "Verified Status"],
    source: "FFI / Unauthorized City",
  },
];

const CATEGORIES = ["All", "Detainee Locator", "Detention Mapping", "Deportation Databases", "Missing Persons (Mexico)", "Crowdsourced Intelligence"];
const STATUS_C = { LIVE: P.teal, PARTIAL: P.amber, BLOCKED: P.red };
const PRIORITY_C = { CRITICAL: P.red, HIGH: P.amber, MEDIUM: P.teal };

export default function MissingDetentionHub() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = DATABASES.filter(d =>
    (category === "All" || d.category === category) &&
    (!search || d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase()) ||
      d.org.toLowerCase().includes(search.toLowerCase()))
  );

  const criticalCount = DATABASES.filter(d => d.priority === "CRITICAL").length;
  const selDB = DATABASES.find(d => d.id === selected);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>🔍 Missing & Detention <span style={{ color: P.red }}>Hub</span></div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          {DATABASES.length} DATABASES · DETAINEE LOCATORS · DETENTION MAPS · DEPORTATION DATA · MEXICO SEARCH NETWORK
        </div>
      </div>

      {/* Critical alert */}
      <div style={{ background: `${P.red}08`, border: `1px solid ${P.red}30`, borderRadius: 10, padding: "10px 16px", marginBottom: 12 }}>
        <div style={{ fontSize: 8, fontWeight: 800, color: P.red, marginBottom: 6 }}>⚡ PRIORITY RESOURCES — USE IMMEDIATELY FOR DETAINED/MISSING VETERANS</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {DATABASES.filter(d => d.priority === "CRITICAL").map(d => (
            <a key={d.id} href={d.url} target="_blank" rel="noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px",
                background: `${d.color}12`, border: `1px solid ${d.color}30`, borderRadius: 7, textDecoration: "none" }}>
              <span style={{ fontSize: 14 }}>{d.icon}</span>
              <div>
                <div style={{ fontSize: 7, color: d.color, fontWeight: 700 }}>{d.name.split(" — ")[0].slice(0, 30)}</div>
                {d.phone && <div style={{ fontSize: 6, color: P.t4 }}>📞 {d.phone}</div>}
                {d.email && <div style={{ fontSize: 6, color: P.t4 }}>✉ {d.email}</div>}
              </div>
              <span style={{ fontSize: 7, color: d.color }}>↗</span>
            </a>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 7, marginBottom: 12 }}>
        {[
          ["Total Sources", DATABASES.length, P.blue],
          ["Critical", criticalCount, P.red],
          ["Live / Active", DATABASES.filter(d => d.status === "LIVE").length, P.teal],
          ["Deportation DBs", DATABASES.filter(d => d.category === "Deportation Databases").length, P.violet],
          ["MX Search Network", DATABASES.filter(d => d.category === "Missing Persons (Mexico)").length, P.gold],
        ].map(([l, v, c]) => (
          <div key={l} style={{ background: P.card, border: `1px solid ${c}25`, borderLeft: `3px solid ${c}`, borderRadius: 7, padding: "7px 10px" }}>
            <div style={{ fontSize: 6, color: P.t4 }}>{l}</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search databases..."
          style={{ padding: "6px 12px", background: "#080D18", border: `1px solid ${search ? P.gold : P.b}`,
            borderRadius: 20, color: P.t1, fontSize: 8, fontFamily: "'IBM Plex Mono',monospace", outline: "none", width: 200 }} />
        <div style={{ display: "flex", gap: 0, background: P.card, border: `1px solid ${P.b}`, borderRadius: 20, overflow: "hidden" }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              style={{ padding: "5px 11px", background: category === c ? `${P.violet}20` : "transparent",
                border: "none", borderRight: `1px solid ${P.b}`,
                color: category === c ? P.violet : P.t4,
                fontSize: 7, fontWeight: category === c ? 700 : 400, cursor: "pointer",
                fontFamily: "'IBM Plex Mono',monospace", whiteSpace: "nowrap" }}>
              {c}{c !== "All" ? ` (${DATABASES.filter(d => d.category === c).length})` : ""}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 7, color: P.t4 }}>{filtered.length} sources</span>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {/* Main grid */}
        <div style={{ flex: 1 }}>
          {CATEGORIES.filter(c => c !== "All" && (category === "All" || category === c)).map(cat => {
            const catItems = filtered.filter(d => d.category === cat);
            if (!catItems.length) return null;
            return (
              <div key={cat} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: P.t2, letterSpacing: 2, marginBottom: 8,
                  paddingBottom: 4, borderBottom: `1px solid ${P.b}` }}>
                  {cat.toUpperCase()} ({catItems.length})
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 8 }}>
                  {catItems.map(db => {
                    const cc = db.color;
                    const pc = PRIORITY_C[db.priority] || P.t4;
                    const isSel = selected === db.id;
                    return (
                      <div key={db.id} onClick={() => setSelected(isSel ? null : db.id)}
                        style={{ background: isSel ? `${cc}08` : P.card,
                          border: `2px solid ${isSel ? cc + "60" : P.b + "30"}`,
                          borderTop: `3px solid ${cc}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <span style={{ fontSize: 18 }}>{db.icon}</span>
                            <div>
                              <div style={{ fontSize: 9, fontWeight: 800, color: cc, lineHeight: 1.3 }}>
                                {db.name.split(" — ")[0].slice(0, 40)}
                              </div>
                              <div style={{ fontSize: 6, color: P.t4 }}>{db.org}</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
                            <span style={{ fontSize: 6, color: P.teal, background: `${P.teal}12`, border: `1px solid ${P.teal}25`, borderRadius: 20, padding: "1px 6px" }}>● LIVE</span>
                            <span style={{ fontSize: 6, color: pc, background: `${pc}10`, border: `1px solid ${pc}20`, borderRadius: 20, padding: "1px 6px", fontWeight: 700 }}>{db.priority}</span>
                          </div>
                        </div>

                        <div style={{ fontSize: 7, color: P.t3, lineHeight: 1.5, marginBottom: 6 }}>{db.description.slice(0, 120)}{db.description.length > 120 ? "…" : ""}</div>

                        <div style={{ fontSize: 7, color: P.gold, marginBottom: 6 }}>→ {db.use_case.slice(0, 100)}</div>

                        {db.phone && (
                          <div style={{ fontSize: 7, color: P.red, fontWeight: 700 }}>📞 {db.phone}</div>
                        )}
                        {db.email && (
                          <div style={{ fontSize: 7, color: P.blue }}>✉ {db.email}</div>
                        )}

                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 5 }}>
                          {db.data_fields.slice(0, 4).map(f => (
                            <span key={f} style={{ fontSize: 6, background: `${cc}10`, border: `1px solid ${cc}20`,
                              color: cc, borderRadius: 20, padding: "1px 6px" }}>{f}</span>
                          ))}
                          {db.data_fields.length > 4 && <span style={{ fontSize: 6, color: P.t4 }}>+{db.data_fields.length - 4} more</span>}
                        </div>

                        {isSel && (
                          <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${P.b}30` }}>
                            {db.notes && <div style={{ fontSize: 7, color: P.amber, marginBottom: 6 }}>ℹ {db.notes}</div>}
                            {/* Grupos Beta / Emergency phone directory */}
                            {db.phone_directory && (
                              <div style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: 6, color: P.t4, letterSpacing: 1, marginBottom: 4 }}>📞 PHONE DIRECTORY</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                                  {Object.entries(db.phone_directory).map(([loc, num]) => (
                                    <div key={loc} style={{ fontSize: 7, padding: "3px 6px", background: "#080D18", borderRadius: 5, display: "flex", justifyContent: "space-between" }}>
                                      <span style={{ color: P.t4 }}>{loc}</span>
                                      <span style={{ color: P.gold, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700 }}>{num}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {db.subscribe && (
                              <a href={db.subscribe} target="_blank" rel="noreferrer"
                                style={{ display: "inline-block", fontSize: 7, color: P.teal, padding: "3px 8px",
                                  background: `${P.teal}10`, border: `1px solid ${P.teal}20`, borderRadius: 5, textDecoration: "none", marginBottom: 6 }}>
                                📧 Subscribe for data updates ↗
                              </a>
                            )}
                            {db.github && (
                              <a href={db.github} target="_blank" rel="noreferrer"
                                style={{ display: "inline-block", fontSize: 7, color: P.t3, padding: "3px 8px",
                                  background: "#080D18", border: `1px solid ${P.b}`, borderRadius: 5, textDecoration: "none", marginBottom: 6, marginLeft: 4 }}>
                                🐙 GitHub Download ↗
                              </a>
                            )}
                            {db.dhs_sheet && (
                              <a href={db.dhs_sheet} target="_blank" rel="noreferrer"
                                style={{ display: "inline-block", fontSize: 7, color: P.green || P.teal, padding: "3px 8px",
                                  background: `${P.teal}08`, border: `1px solid ${P.teal}20`, borderRadius: 5, textDecoration: "none", marginBottom: 6, marginLeft: 4 }}>
                                📊 DHS Raw Data Sheet ↗
                              </a>
                            )}
                            <a href={db.url} target="_blank" rel="noreferrer"
                              style={{ display: "block", textAlign: "center", padding: "7px", background: `${cc}12`,
                                border: `1px solid ${cc}25`, color: cc, borderRadius: 7, fontSize: 8, textDecoration: "none", fontWeight: 700 }}>
                              🔗 Open {db.name.split(" — ")[0].split(" ").slice(0, 4).join(" ")} ↗
                            </a>
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

        {/* Sidebar: Quick reference */}
        <div style={{ width: 200, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Locator sequence */}
          <div style={{ background: P.card, border: `1px solid ${P.red}30`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 7, color: P.red, fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>🆘 LOCATE A DETAINED VETERAN</div>
            {[
              ["1", "Search ODLS by A-number", "https://locator.ice.gov/odls/#/search", P.red],
              ["2", "Download NILC Guide", "https://www.nilc.org/wp-content/uploads/2025/04/How-to-Locate-a-ICE-Disappearance.pdf", P.amber],
              ["3", "Check FFI Detention Map", "https://map.freedomforimmigrants.org/map", P.blue],
              ["4", "Search DDP Detention Stays", "https://ice-detention-stays.apps.deportationdata.org/", P.violet],
              ["5", "Contact FFI Toolkit", "https://www.freedomforimmigrants.org/toolkit-lost-in-detention", P.teal],
            ].map(([n, label, url, c]) => (
              <a key={n} href={url} target="_blank" rel="noreferrer"
                style={{ display: "flex", gap: 6, alignItems: "center", padding: "5px 0",
                  borderBottom: `1px solid ${P.b}20`, textDecoration: "none" }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: `${c}20`, border: `1px solid ${c}40`,
                  fontSize: 7, color: c, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</span>
                <span style={{ fontSize: 7, color: c, lineHeight: 1.3 }}>{label}</span>
              </a>
            ))}
          </div>

          {/* Mexico missing sequence */}
          <div style={{ background: P.card, border: `1px solid ${P.gold}30`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 7, color: P.gold, fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>🇲🇽 MISSING IN MEXICO</div>
            {[
              ["SJM México", "55-55-27-54-23", "tel:+525555275423"],
              ["TJ Grupos Beta", "664-682-3171", "tel:+526646823171"],
              ["Nogales Beta", "631-312-6180", "tel:+526313126180"],
              ["Juárez Beta", "656-612-7618", "tel:+526566127618"],
              ["MX Emergency", "911", "tel:911"],
            ].map(([name, num, tel]) => (
              <div key={name} style={{ padding: "5px 0", borderBottom: `1px solid ${P.b}20` }}>
                <div style={{ fontSize: 6, color: P.t4 }}>{name}</div>
                <a href={tel} style={{ fontSize: 9, color: P.gold, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, textDecoration: "none" }}>{num}</a>
              </div>
            ))}
          </div>

          {/* Source attribution */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 8 }}>📍 SOURCES</div>
            {[
              ["No More Deaths", "https://nomoredeaths.org/searching-for-someone-missing-at-the-border/lost-or-missing-in-mexico/"],
              ["Freedom for Immigrants Map", "https://www.freedomforimmigrants.org/map"],
              ["Unauthorized City", "https://www.unauthorizedcity.com/facilities"],
              ["Deportation Data Project", "https://deportationdata.org"],
              ["Vera ICE Detention", "https://www.vera.org/ice-detention-trends"],
              ["INM Grupos Beta", "https://www.gob.mx/inm/acciones-y-programas/grupos-beta-de-proteccion-a-migrantes"],
            ].map(([name, url]) => (
              <a key={name} href={url} target="_blank" rel="noreferrer"
                style={{ display: "block", fontSize: 7, color: P.blue, padding: "3px 0",
                  borderBottom: `1px solid ${P.b}20`, textDecoration: "none" }}>
                ↗ {name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}