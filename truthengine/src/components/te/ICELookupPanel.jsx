import { useState } from "react";
import { P, CASES } from "../../lib/teData";

// ICE Detainee Locator uses a JS-rendered form (no GET params).
// Strategy: open the locator, show a pre-filled data card the user can copy-paste instantly.
const ICE_LOCATOR_URL = "https://locator.ice.gov/odls/#/index";

const CASE_DOB = {
  C001: { dob: "1947-05-14", country: "Mexico",       firstName: "George",  lastName: "Ramos" },
  C002: { dob: "1950-03-22", country: "Mexico",       firstName: "Manuel",  lastName: "Valenzuela" },
  C003: { dob: "1952-09-15", country: "Mexico",       firstName: "Victor",  lastName: "Valenzuela" },
  C004: { dob: "1971-08-03", country: "South Korea",  firstName: "Sae Joon",lastName: "Park" },
  C005: { dob: "1960-01-15", country: "Mexico",       firstName: "Miguel",  lastName: "Segura" },
  C006: { dob: "1966-04-07", country: "Colombia",     firstName: "Jose",    lastName: "Duran" },
};

const TIER_C = { Gold: P.gold, Silver: "#B8CCE8", Bronze: P.amber };

export default function ICELookupPanel() {
  const [activeCase, setActiveCase] = useState(null);
  const [copied, setCopied] = useState({});
  const [searchLog, setSearchLog] = useState([]);

  const launchLookup = (c) => {
    const meta = CASE_DOB[c.id];
    // Open ICE locator in new tab
    window.open(ICE_LOCATOR_URL, "_blank", "noopener,noreferrer");
    // Log the search
    setSearchLog(prev => [{
      caseId: c.id,
      name: c.name,
      timestamp: new Date().toLocaleTimeString(),
      firstName: meta.firstName,
      lastName: meta.lastName,
      dob: meta.dob,
      country: meta.country,
    }, ...prev.slice(0, 9)]);
    setActiveCase(c.id);
  };

  const copyField = (key, value) => {
    navigator.clipboard.writeText(value);
    setCopied(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 1500);
  };

  const copyAll = (meta) => {
    const text = `First Name: ${meta.firstName}\nLast Name: ${meta.lastName}\nDOB: ${meta.dob}\nCountry of Birth: ${meta.country}`;
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, all: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, all: false })), 1500);
  };

  const selMeta = activeCase ? CASE_DOB[activeCase] : null;
  const selCase = CASES.find(c => c.id === activeCase);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P.t1 }}>
          🚨 ICE Detainee <span style={{ color: P.red }}>Locator Search</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          AUTO-LAUNCH · locator.ice.gov · PRE-FILLED COPY CARDS · SEARCH LOG
        </div>
      </div>

      {/* Alert banner */}
      <div style={{ background: `${P.amber}10`, border: `1px solid ${P.amber}30`, borderRadius: 8, padding: "8px 14px", marginBottom: 12, fontSize: 8, color: P.amber }}>
        <strong>ℹ️ How it works:</strong> ICE Locator (locator.ice.gov) uses a JavaScript-rendered form — URL parameters cannot pre-fill it automatically.
        Click <strong>LAUNCH + COPY</strong> to open the locator in a new tab, then paste each field from the card below in under 5 seconds.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Case selector */}
        <div>
          <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 8 }}>SELECT CASE TO SEARCH</div>
          {CASES.map(c => {
           const meta = CASE_DOB[c.id];
           if (!meta) return null;
           const isActive = activeCase === c.id;
            const isCritical = c.id === "C004";
            const tc = TIER_C[c.tier] || P.t4;
            return (
              <div key={c.id} style={{
                background: isActive ? `${tc}10` : P.card,
                border: `1px solid ${isActive ? tc + "60" : P.b + "40"}`,
                borderLeft: `5px solid ${isCritical ? P.red : tc}`,
                borderRadius: 9, padding: "10px 14px", marginBottom: 8,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 2 }}>
                      <span style={{ fontSize: 7, color: P.t4 }}>{c.id}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, color: isCritical ? P.red : tc }}>{c.name}</span>
                      {isCritical && <span style={{ fontSize: 6, background: `${P.red}18`, border: `1px solid ${P.red}30`, color: P.red, borderRadius: 20, padding: "1px 6px", fontWeight: 700 }}>⚡ URGENT</span>}
                    </div>
                    <div style={{ fontSize: 7, color: P.t4 }}>{c.branch} · DOB: {meta.dob} · {meta.country}</div>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: tc }}>{c.confidence}%</span>
                </div>
                <button
                  onClick={() => launchLookup(c)}
                  style={{
                    width: "100%", padding: "7px", fontSize: 8, fontWeight: 800, cursor: "pointer",
                    background: isCritical ? `${P.red}20` : `${tc}15`,
                    border: `1px solid ${isCritical ? P.red : tc}40`,
                    color: isCritical ? P.red : tc, borderRadius: 7,
                  }}>
                  🔍 LAUNCH ICE LOCATOR + COPY FIELDS
                </button>
              </div>
            );
          })}
        </div>

        {/* Right: pre-fill card + log */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Pre-fill card */}
          {selMeta && selCase ? (
            <div style={{ background: P.card, border: `2px solid ${P.red}40`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: P.red }}>📋 ICE LOCATOR FIELDS — {selCase.name}</div>
                <button onClick={() => copyAll(selMeta)}
                  style={{ padding: "4px 12px", fontSize: 8, fontWeight: 800, cursor: "pointer",
                    background: copied.all ? `${P.teal}20` : `${P.gold}15`,
                    border: `1px solid ${copied.all ? P.teal : P.gold}30`,
                    color: copied.all ? P.teal : P.gold, borderRadius: 20 }}>
                  {copied.all ? "✓ Copied All!" : "⎘ Copy All Fields"}
                </button>
              </div>

              <div style={{ fontSize: 7, color: P.amber, marginBottom: 10, padding: "5px 10px", background: `${P.amber}10`, borderRadius: 6, border: `1px solid ${P.amber}20` }}>
                ① Open ICE Locator tab → ② Paste each field below → ③ Click Search
              </div>

              {[
                { label: "FIRST NAME", value: selMeta.firstName, key: "fn", field: "firstName" },
                { label: "LAST NAME",  value: selMeta.lastName,  key: "ln", field: "lastName" },
                { label: "DATE OF BIRTH (MM/DD/YYYY)", value: new Date(selMeta.dob + "T00:00:00").toLocaleDateString("en-US"), key: "dob", field: "dob" },
                { label: "COUNTRY OF BIRTH", value: selMeta.country, key: "cob", field: "country" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 6, color: P.t4, letterSpacing: 1, marginBottom: 3 }}>{f.label}</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <div style={{ flex: 1, background: "#080D18", border: `1px solid ${P.b}`, borderRadius: 6,
                      padding: "8px 12px", fontFamily: "'IBM Plex Mono',monospace", fontSize: 11,
                      fontWeight: 800, color: P.t1 }}>{f.value}</div>
                    <button onClick={() => copyField(f.key, f.value)}
                      style={{ padding: "8px 12px", fontSize: 8, cursor: "pointer", fontWeight: 700,
                        background: copied[f.key] ? `${P.teal}20` : `${P.blue}12`,
                        border: `1px solid ${copied[f.key] ? P.teal : P.blue}25`,
                        color: copied[f.key] ? P.teal : P.blue, borderRadius: 6, whiteSpace: "nowrap" }}>
                      {copied[f.key] ? "✓" : "⎘ Copy"}
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 10, padding: "8px 10px", background: "#080D18", borderRadius: 7 }}>
                <div style={{ fontSize: 7, color: P.t4, marginBottom: 4 }}>DIRECT LINK</div>
                <a href={ICE_LOCATOR_URL} target="_blank" rel="noreferrer"
                  style={{ fontSize: 8, color: P.blue, textDecoration: "none", fontFamily: "'IBM Plex Mono',monospace" }}>
                  {ICE_LOCATOR_URL} ↗
                </a>
              </div>
            </div>
          ) : (
            <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "30px", textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
              <div style={{ fontSize: 9, color: P.t4 }}>Select a case to launch ICE Locator with pre-filled search fields</div>
            </div>
          )}

          {/* Search log */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 8 }}>📡 SEARCH LOG (SESSION)</div>
            {searchLog.length === 0 ? (
              <div style={{ fontSize: 8, color: P.t4, textAlign: "center", padding: "10px" }}>No searches yet this session</div>
            ) : searchLog.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "5px 0",
                borderBottom: `1px solid ${P.b}20`, fontSize: 7 }}>
                <span style={{ color: P.t4, fontFamily: "'IBM Plex Mono',monospace" }}>{s.timestamp}</span>
                <span style={{ color: P.gold, fontWeight: 700 }}>{s.caseId}</span>
                <span style={{ color: P.t2, flex: 1 }}>{s.firstName} {s.lastName}</span>
                <span style={{ color: P.t4 }}>{s.country}</span>
                <span style={{ color: P.teal, fontSize: 6 }}>● LAUNCHED</span>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 8 }}>⚠️ LOCATOR NOTES</div>
            {[
              ["Detention Only", "ICE Locator only shows currently detained individuals — not deported"],
              ["C004 Park", "Sae Joon Park self-deported Nov/Dec 2025 — likely NOT in system"],
              ["FOIA F002", "Full ENFORCE database requires F002 FOIA (66d overdue at ICE)"],
              ["Name Variants", "Try both legal name and common name variants if no result"],
              ["A-Number", "If A-Number known, use that field instead for higher accuracy"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 8, fontSize: 7, padding: "3px 0", borderBottom: `1px solid ${P.b}20` }}>
                <span style={{ color: P.amber, fontWeight: 700, flexShrink: 0 }}>{k}:</span>
                <span style={{ color: P.t3 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}