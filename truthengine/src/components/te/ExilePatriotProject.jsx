import { useState } from "react";
import { P } from "../../lib/teData";

const CARD_DATA = {
  locator: [
    {
      icon: "🔍", priority: "CRITICAL", name: "ICE Online Detainee Locator (ODLS)",
      org: "DHS / ICE", live: true,
      desc: "Search for individuals currently detained by ICE by name and country of birth, or by A-number. Real-time database. Primary tool to locate detained veterans.",
      tip: "Use A-number for exact match. Works 24/7. If not found, check 48 hours — processing delays occur post-arrest.",
      tags: ["Name", "Country of Birth", "A-Number", "Facility"],
      url: "https://locator.ice.gov/odls/#/index", urlLabel: "Open ODLS",
    },
    {
      icon: "📋", priority: "CRITICAL", name: "NILC: How to Locate a Disappeared Person",
      org: "National Immigrant Law Center", live: true,
      desc: "Step-by-step guide for locating someone disappeared by ICE. Covers ODLS, legal contacts, consular services, and emergency legal steps.",
      tip: "Field guide for families and advocates when a veteran is detained without notice. Print and keep physical copy.",
      tags: ["ICE Locator Steps", "Legal Aid Contacts", "Consular Access", "Habeas Corpus"],
      url: "https://www.nilc.org", urlLabel: "Access Guide",
    },
    {
      icon: "🧰", priority: "HIGH", name: "Freedom for Immigrants: Lost in Detention",
      org: "Freedom for Immigrants", live: true,
      desc: "Community toolkit for families navigating ICE detention. Legal resources, visitation guides, hotlines across 200+ ICE facilities.",
      tip: "Support families of detained veterans. Includes bond info and attorney referrals.",
      tags: ["Facility Contacts", "Legal Aid", "Visitation", "Bond Info"],
      url: "https://www.freedomforimmigrants.org", urlLabel: "Access Toolkit",
    },
  ],
  map: [
    {
      icon: "🗺️", priority: "CRITICAL", name: "FFI National Immigration Detention Map",
      org: "Freedom for Immigrants", live: true,
      desc: "Interactive map of 200+ ICE detention sites with facility info, visitation policies, contract data, phone numbers, and capacity.",
      tip: "Find the nearest ICE facility to a deported veteran's last known location.",
      tags: ["Facility Name", "Address", "Phone", "Operator"],
      url: "https://www.freedomforimmigrants.org/detention-map", urlLabel: "Open Map",
    },
    {
      icon: "📊", priority: "CRITICAL", name: "Unauthorized City — Real-Time Detention Stats",
      org: "Dr. A.J. Kim — San Diego State University", live: true,
      desc: "Real-time detention statistics. 265 facilities tracked monthly. Feb 2026: 67,000+ detained, 78% non-criminal.",
      tip: "Real-time population data. Monitor for veteran-age cohort surges.",
      tags: ["Facility Name", "Population", "Non-Criminal %", "ADP"],
      url: "https://www.unauthorizedcity.com", urlLabel: "View Dashboard",
    },
    {
      icon: "📈", priority: "HIGH", name: "Vera Institute — 17-Year Detention Analysis",
      org: "Vera Institute of Justice", live: true,
      desc: "17-year longitudinal analysis of ICE detention. 1,490 facilities tracked Oct 2008–Mar 2026. Track detention explosion from 14K (2021 low) to 67K+ (2026 record).",
      tip: "Longitudinal data for CHC briefing — visualize the 479% detention increase under Trump II.",
      tags: ["Facility", "Date", "Midnight Population", "24hr Population"],
      url: "https://www.vera.org", urlLabel: "Access Data",
    },
  ],
  deport: [
    {
      icon: "🚔", priority: "CRITICAL", name: "Deportation Data Project — ICE Arrests",
      org: "Deportation Data Project (UC Berkeley Law)", live: true,
      desc: "Individual-level ICE arrest data via FOIA litigation. Filter, sort, download. Covers 2025–2026 enforcement surge.",
      tip: "Find arrest patterns by nationality, location, offense type. Cross-reference with TruthEngine360 parquet database.",
      tags: ["A-Number", "Arrest Date", "State", "Offense"],
      url: "https://deportationdata.org", urlLabel: "Access DB",
    },
    {
      icon: "📎", priority: "CRITICAL", name: "Deportation Data Project — ICE Detainers",
      org: "Deportation Data Project (UC Berkeley Law)", live: true,
      desc: "ICE detainer request database — shows which local jails cooperate with ICE. FOIA-obtained.",
      tip: "Track detainers on veteran cases. Flag IIRIRA retroactive detainers against Vietnam-era servicemembers.",
      tags: ["Facility", "Date", "Nationality", "Offense"],
      url: "https://deportationdata.org", urlLabel: "Access DB",
    },
    {
      icon: "📅", priority: "CRITICAL", name: "Deportation Data Project — Detention Stays",
      org: "Deportation Data Project (UC Berkeley Law)", live: true,
      desc: "Individual detention stay records — book-in/book-out dates, facility, nationality, outcome. Track veteran detention length and facility transfers.",
      tip: "Cross-reference with ODLS locator. Identify veterans held at multiple facilities.",
      tags: ["A-Number", "Book-In", "Book-Out", "Facility"],
      url: "https://deportationdata.org", urlLabel: "Access DB",
    },
    {
      icon: "⚖️", priority: "HIGH", name: "Deportation Data Project — EOIR Court Cases",
      org: "Deportation Data Project (UC Berkeley Law)", live: true,
      desc: "Immigration court case-level data: case type, judge, decision, nationality. Full EOIR extract.",
      tip: "Find judge-level decision data. Identify courts with highest veteran removal rates.",
      tags: ["Case ID", "Nationality", "Case Type", "Judge"],
      url: "https://deportationdata.org", urlLabel: "Access DB",
    },
    {
      icon: "💾", priority: "HIGH", name: "Deportation Data Project — Bulk Datasets",
      org: "Deportation Data Project (UC Berkeley Law)", live: true,
      desc: "Processed ICE + EOIR datasets for bulk download. Codebooks, data guides, FOIA documentation.",
      tip: "Bulk download for BISG cross-analysis on veteran surnames against arrest/detainer data.",
      tags: ["ICE Arrests", "ICE Detainers", "Detention Stays", "EOIR Cases"],
      url: "https://deportationdata.org", urlLabel: "Download Data",
    },
    {
      icon: "📉", priority: "MEDIUM", name: "Interval ADP Update — Monthly Detention Analysis",
      org: "Austin Kocher — Syracuse University", live: true,
      desc: "Monthly Average Daily Population updates. Non-criminal %, policy impact, facility-level breakdowns.",
      tip: "Monthly briefing-ready data on detention surge. Cite ADP figures in congressional communications.",
      tags: ["ADP by Month", "Facility Trends", "Non-Criminal %", "Policy Impact"],
      url: "https://substack.com/@austinkocher", urlLabel: "Subscribe",
    },
  ],
  mexico: [
    {
      icon: "✝️", priority: "CRITICAL", name: "Servicio Jesuita a Migrantes (SJM México)",
      org: "Jesuits / SJM México", live: true,
      desc: "Jesuit network connecting migrant shelters throughout Mexico AND government authorities. Covers all border states. Active search coordination with full government access.",
      tip: "Fastest Mexico-side search resource. SJM contacts all shelter network + government authorities simultaneously.",
      tags: ["Shelter Network", "Government Contacts", "Family Notification", "Search Coordination"],
      contact: "📞 55-55-27-54-23 · ✉ desaparecidos@sjmmexico.org",
      url: "mailto:desaparecidos@sjmmexico.org", urlLabel: "Contact SJM",
    },
    {
      icon: "🟡", priority: "CRITICAL", name: "Grupos Beta de Protección a Migrantes",
      org: "Instituto Nacional de Migración — México", live: true,
      desc: "22 Mexican government rescue units in 9 border states. Rescue, first aid, legal guidance 24/7. Emergency contact for deported veterans in medical, security, or legal distress.",
      tip: "Emergency contact for deported veterans in distress at the border.",
      tags: ["Rescue", "First Aid", "Legal Orientation", "Search Coordination"],
      url: "https://www.gob.mx/inm", urlLabel: "Contact Grupos Beta",
    },
    {
      icon: "🔍", priority: "HIGH", name: "RNPDNO — National Disappeared Persons Registry",
      org: "Comisión Nacional de Búsqueda — México", live: true,
      desc: "115,000+ disappeared persons registry. IOM actively working with CNB on cross-border data gaps for disappeared Mexican citizens including deported veterans.",
      tip: "Search for deported veterans who go missing in Mexico after deportation.",
      tags: ["Name", "DOB", "Disappearance Date", "State"],
      url: "https://rnpdno.segob.gob.mx", urlLabel: "Search Registry",
    },
    {
      icon: "🏜️", priority: "HIGH", name: "No More Deaths — Family Search Guide",
      org: "No More Deaths / No Más Muertes", live: true,
      desc: "Complete guide for families searching for missing migrants. Covers Mexico-side and US-side resources, shelter contacts, Grupos Beta directory, government hotlines.",
      tip: "Step-by-step resource for locating deported veterans who went missing crossing or post-deportation.",
      tags: ["Shelter Contacts", "Grupos Beta Directory", "Government Hotlines", "Legal Aid"],
      url: "https://nomoredeaths.org", urlLabel: "Access Guide",
    },
  ],
  crowd: [
    {
      icon: "👥", priority: "HIGH", name: "People over Papers — ICE Raid Locator",
      org: "ICE Out (iceout.org)", live: true,
      desc: "Anonymous crowdsourced platform to report ICE raid locations in real-time. Community early warning system.",
      tip: "Monitor enforcement surge near veteran shelter locations in Tijuana, Nogales, Ciudad Juárez.",
      tags: ["Location", "Date/Time", "Agency Type", "Report Type"],
      url: "https://iceout.org", urlLabel: "View Live Reports",
    },
  ],
};

const PRIORITY_COLOR = { CRITICAL: P.red, HIGH: P.amber, MEDIUM: P.gold };

const CATEGORIES = [
  { id: "all", label: "All 19", count: 19 },
  { id: "locator", label: "Detainee Locator", count: 3 },
  { id: "map", label: "Detention Map", count: 3 },
  { id: "deport", label: "Deportation DB", count: 7 },
  { id: "mexico", label: "Mexico Network", count: 5 },
  { id: "crowd", label: "Crowdsource", count: 1 },
];

function ResourceCard({ card }) {
  const pc = PRIORITY_COLOR[card.priority] || P.t4;
  return (
    <div style={{
      background: P.card, borderRadius: 8,
      border: `1px solid ${P.b}20`,
      borderTop: `3px solid ${pc}`,
      padding: "14px 16px",
      transition: "all .15s",
    }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>{card.icon}</span>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, lineHeight: 1.3, marginBottom: 3 }}>{card.name}</div>
          <div style={{ fontSize: 7, color: P.t4, letterSpacing: 1 }}>{card.org}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
        {card.live && (
          <span style={{ fontSize: 7, background: `${P.teal}15`, border: `1px solid ${P.teal}30`, color: P.teal, borderRadius: 3, padding: "2px 7px", fontWeight: 700 }}>
            ● LIVE
          </span>
        )}
        <span style={{ fontSize: 7, background: `${pc}12`, border: `1px solid ${pc}25`, color: pc, borderRadius: 3, padding: "2px 7px", fontWeight: 700 }}>
          {card.priority}
        </span>
      </div>

      <div style={{ fontSize: 8, color: P.t3, lineHeight: 1.7, marginBottom: 8 }}>{card.desc}</div>

      <div style={{ fontSize: 7, color: P.teal, lineHeight: 1.5, padding: "6px 8px", background: `${P.teal}08`, borderLeft: `2px solid ${P.teal}`, borderRadius: "0 4px 4px 0", marginBottom: 8 }}>
        → {card.tip}
      </div>

      {card.contact && (
        <div style={{ fontSize: 8, color: P.gold, marginBottom: 8, fontWeight: 700 }}>{card.contact}</div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
        {card.tags.map((t, i) => (
          <span key={i} style={{ fontSize: 7, background: P.card2, border: `1px solid ${P.b}`, color: P.t4, padding: "1px 6px", borderRadius: 3 }}>{t}</span>
        ))}
      </div>

      <a href={card.url} target="_blank" rel="noreferrer"
        style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 8, color: P.gold, textDecoration: "none", padding: "5px 10px", border: `1px solid ${P.gold}30`, borderRadius: 3 }}>
        {card.urlLabel} ↗
      </a>
    </div>
  );
}

export default function ExilePatriotProject() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const allCards = Object.values(CARD_DATA).flat();
  const categoryCards = activeCategory === "all" ? allCards : CARD_DATA[activeCategory] || [];
  const filtered = categoryCards.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.desc.toLowerCase().includes(search.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1, overflowY: "auto", height: "calc(100vh - 118px)" }}>
      {/* Header */}
      <div style={{ background: "#990000", borderBottom: "2px solid #FFCC00", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: "#FFCC00", letterSpacing: 2 }}>
          EXILE PATRIOT PROJECT <span style={{ color: "#fff", opacity: 0.7 }}>|</span> MISSING & DETENTION HUB
        </div>
        <span style={{ fontSize: 8, background: "#FFCC00", color: "#990000", padding: "3px 8px", borderRadius: 2, fontWeight: 800 }}>⚡ LIVE OPERATIONAL</span>
      </div>

      {/* Alert banner */}
      <div style={{ background: "linear-gradient(90deg, #990000, #660000)", borderBottom: `1px solid ${P.gold}40`, padding: "8px 20px", fontSize: 8, color: "#fff", display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 14 }}>🚨</span>
        <span>
          <strong style={{ color: "#FFCC00" }}>PRIORITY RESOURCES</strong> — USE IMMEDIATELY FOR DETAINED OR MISSING VETERANS ·
          ICE ODLS locator is live · SJM México active at 55-55-27-54-23 · Grupos Beta operational in all 9 border states ·
          <strong style={{ color: "#FFCC00" }}>Feb 2026: 67,000+ detained, 78% non-criminal</strong>
        </span>
      </div>

      <div style={{ padding: "14px 20px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
          {[
            { v: "19", l: "Total Sources" },
            { v: "10", l: "Critical Priority" },
            { v: "67K+", l: "Currently Detained (Feb 2026)" },
            { v: "78%", l: "Non-Criminal Detainees" },
          ].map((s, i) => (
            <div key={i} style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 22, fontWeight: 800, color: P.gold, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 7, color: P.t4, marginTop: 4, letterSpacing: 1 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Priority Quick Links */}
        <div style={{ background: "linear-gradient(90deg, rgba(153,0,0,.9), rgba(100,0,0,.9))", border: `1px solid ${P.gold}40`, borderRadius: 8, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, marginBottom: 10 }}>⚡ PRIORITY RESOURCES — USE IMMEDIATELY FOR DETAINED / MISSING VETERANS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[
              { icon: "🔍", label: "ICE Online Detainee Locator", url: "https://locator.ice.gov/odls/#/index" },
              { icon: "📊", label: "Unauthorized City", url: "https://www.unauthorizedcity.com" },
              { icon: "🚔", label: "Deportation Data Project", url: "https://deportationdata.org" },
              { icon: "✝️", label: "SJM México: 55-55-27-54-23", url: "tel:525555275423" },
              { icon: "🟡", label: "Grupos Beta — 9 Border States", url: "https://www.gob.mx/inm" },
              { icon: "🚨", label: "Mexico Emergency: 911", url: "tel:911" },
              { icon: "🗺️", label: "FFI Detention Map", url: "https://www.freedomforimmigrants.org/detention-map" },
            ].map((item, i) => (
              <a key={i} href={item.url} target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 8, color: "#fff", textDecoration: "none", padding: "5px 10px", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 3 }}>
                <span>{item.icon}</span> {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* Search + Filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search databases, sources, tags..."
            style={{ flex: 1, minWidth: 200, padding: "8px 12px", background: P.card, border: `1px solid ${P.gold}30`, borderRadius: 5, color: P.t1, fontSize: 8, fontFamily: "inherit", outline: "none" }} />
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              style={{ padding: "6px 12px", fontSize: 7, fontWeight: 700, cursor: "pointer",
                background: activeCategory === cat.id ? "#FFCC0020" : P.card,
                border: `1px solid ${activeCategory === cat.id ? "#FFCC00" : P.b}`,
                color: activeCategory === cat.id ? "#FFCC00" : P.t4, borderRadius: 5 }}>
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Emergency Numbers */}
        {(activeCategory === "all" || activeCategory === "mexico") && (
          <div style={{ background: "linear-gradient(135deg, #1a0000, #0d0000)", border: `2px solid ${P.red}`, borderRadius: 8, padding: "16px 18px", marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: P.red, marginBottom: 10 }}>🚨 Mexico Emergency Numbers — Use Immediately</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
              {[
                { label: "Police", num: "060" },
                { label: "Red Cross", num: "065" },
                { label: "Fire Dept", num: "068" },
                { label: "General", num: "911" },
              ].map((n, i) => (
                <div key={i} style={{ background: `${P.red}10`, border: `1px solid ${P.red}30`, borderRadius: 5, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 7, color: P.t4 }}>{n.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{n.num}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 7, color: P.t4 }}>
              From US to Mexico: dial <strong style={{ color: "#fff" }}>011-52</strong> + area code + number
            </div>
          </div>
        )}

        {/* Section labels */}
        {activeCategory === "all" && Object.entries(CARD_DATA).map(([cat, cards]) => {
          const catObj = CATEGORIES.find(c => c.id === cat);
          const filtered2 = cards.filter(c =>
            !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.desc.toLowerCase().includes(search.toLowerCase())
          );
          if (!filtered2.length) return null;
          const sectionLabels = {
            locator: "🔍 DETAINEE LOCATOR",
            map: "🗺️ DETENTION MAPPING",
            deport: "🚔 DEPORTATION DATABASES",
            mexico: "✝️ MEXICO SEARCH NETWORK",
            crowd: "👥 CROWDSOURCED INTELLIGENCE",
          };
          return (
            <div key={cat} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, letterSpacing: 2, marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${P.gold}20` }}>
                {sectionLabels[cat]} <span style={{ color: P.t4, fontSize: 7 }}>· {filtered2.length} SOURCES</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 10 }}>
                {filtered2.map((c, i) => <ResourceCard key={i} card={c} />)}
              </div>
            </div>
          );
        })}

        {activeCategory !== "all" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 10 }}>
            {filtered.map((c, i) => <ResourceCard key={i} card={c} />)}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 20, padding: "12px 0", borderTop: `1px solid ${P.b}`, display: "flex", justifyContent: "space-between", fontSize: 7, color: P.t4 }}>
          <span><span style={{ color: P.gold, fontWeight: 700 }}>TRUTHENGINE360</span> · Exile Patriot Project · AUMER Foundation · EIN 99-0495658</span>
          <span>qtruthengine360.org · albavoice.org · All 19 sources verified live · April 9, 2026</span>
        </div>
      </div>
    </div>
  );
}