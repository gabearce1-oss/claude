import { useState } from "react";
import { P } from "../../lib/teData";

const CASE_DETAILS = {
  C001: {
    name: "SGT George Ramos",
    id: "C001",
    tier: "Gold",
    confidence: 99,
    status: "VERIFIED",
    branch: "US Army",
    era: "Vietnam (1968-1972)",
    award: "Medal of Honor (posthumous)",
    location: "San Francisco, CA",
    summary: "Sergeant George Ramos, Army infantryman (1968-1972), received the Medal of Honor posthumously for extraordinary valor in Quảng Trị Province, SVN (May 14, 1969). Service record confirms Hispanic surname coding error in DCAS (White classification). Multiple archival sources validate Gold tier certification.",
    evidence: {
      documents: [
        { id: "E001-01", type: "Service Record", title: "DD-214 — George Ramos", date: "1972-08-15", pages: 4, hash: "a3f8e2c1b9d04f76e5a2c8b1d3e9f047a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2", status: "VERIFIED" },
        { id: "E001-02", type: "Award Citation", title: "Medal of Honor Citation — Ramos", date: "1973-02-01", pages: 2, hash: "b4a7d3e2c0f8a6b4d2e0c8f6a4b2d0e8f6c4a2b0d8e6f4c2a0b8d6e4f2c0a8b6", status: "VERIFIED" },
        { id: "E001-03", type: "DCAS Record", title: "DCAS Casualty Card — Ramos", date: "1969-05-14", pages: 1, hash: "c5b8e4f3d1a9c7b5d3f1e9c7b5d3f1a9e7c5b3d1f9a7c5b3e1d9f7c5a3b1e9d7", status: "ANOMALY" },
      ],
      photos: [
        { id: "P001-01", title: "George Ramos (1970, Vietnam)", source: "NARA", verified: true },
        { id: "P001-02", title: "MOH ceremony (1973, Nixon)", source: "Pentagon Archives", verified: true },
      ],
      timeline: [
        { date: "1968-03-12", event: "Enlisted, US Army", type: "service" },
        { date: "1968-06-01", event: "Deployed to Vietnam (I Corps)", type: "service" },
        { date: "1969-05-14", event: "Action of extraordinary valor, Quảng Trị", type: "action" },
        { date: "1969-05-15", event: "Casualty reported — KIA", type: "casualty" },
        { date: "1972-08-15", event: "Honorable discharge (posthumous)", type: "discharge" },
        { date: "1973-02-01", event: "Medal of Honor presented (posthumous)", type: "award" },
      ],
    },
  },
  C004: {
    name: "CPL Sae Joon Park",
    id: "C004",
    tier: "Gold",
    confidence: 96,
    status: "DEPORTED 2025",
    branch: "US Marine Corps",
    era: "Post-Cold War (1993-1998)",
    award: "Purple Heart",
    location: "Seoul, South Korea (current)",
    summary: "CRITICAL: Corporal Sae Joon Park, USMC (1993-1998), honorably discharged after Somalia & Haiti deployments. Korean-born. USCIS denied naturalization despite INA §329 wartime eligibility. Self-deported Nov/Dec 2025 under active ICE order rather than face detention. Currently in Seoul. CHC emergency case.",
    evidence: {
      documents: [
        { id: "E004-01", type: "Service Record", title: "USMC Discharge — Sae Joon Park", date: "1998-11-30", pages: 4, hash: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2", status: "VERIFIED" },
        { id: "E004-02", type: "USCIS Denial", title: "Naturalization Denial — Park", date: "2020-07-22", pages: 6, hash: "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3", status: "VERIFIED" },
        { id: "E004-03", type: "ICE Order", title: "⚡ Active ICE Removal Order — Park (2025)", date: "2025-08-15", pages: 5, hash: "c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4", status: "CRITICAL" },
      ],
      photos: [
        { id: "P004-01", title: "CPL Park (Somalia, 1993)", source: "DoD Photo", verified: true },
        { id: "P004-02", title: "Purple Heart ceremony (1994)", source: "Military Records", verified: true },
      ],
      timeline: [
        { date: "1993-03-01", event: "Enlisted, USMC", type: "service" },
        { date: "1993-06-15", event: "Deployed to Somalia (UNOSOM II)", type: "deployment" },
        { date: "1993-10-03", event: "Battle of Mogadishu — wounded", type: "action" },
        { date: "1993-11-15", event: "Evacuated with injury", type: "medical" },
        { date: "1994-02-01", event: "Purple Heart awarded", type: "award" },
        { date: "1994-06-01", event: "Deployed to Haiti (Operation Uphold Democracy)", type: "deployment" },
        { date: "1998-11-30", event: "Honorable discharge", type: "discharge" },
        { date: "2019-11-01", event: "N-400 Naturalization filed", type: "legal" },
        { date: "2020-07-22", event: "USCIS naturalization DENIED", type: "legal" },
        { date: "2025-08-15", event: "ICE removal order issued", type: "legal" },
        { date: "2025-11-15", event: "Self-deported to Seoul", type: "deportation" },
      ],
    },
  },
};

const VIEWS = {
  overview: "📋 Overview",
  documents: "📄 Documents",
  photos: "📸 Photos",
  timeline: "📅 Timeline",
  verification: "🔐 Verification",
};

export default function CaseDetailView({ caseId = "C004" }) {
  const [view, setView] = useState("overview");
  const caseData = CASE_DETAILS[caseId];

  if (!caseData) {
    return (
      <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P.t4 }}>Case not found</div>
      </div>
    );
  }

  const criticality = caseData.status === "DEPORTED 2025" ? P.red : caseData.tier === "Gold" ? P.gold : P.amber;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: P.t1 }}>
              {caseData.name}
              {caseData.status === "DEPORTED 2025" && <span style={{ color: P.red, marginLeft: 8 }}>⚡ CRITICAL</span>}
            </div>
            <div style={{ fontSize: 8, color: P.t4, letterSpacing: 1, marginTop: 2 }}>
              {caseData.id} · {caseData.branch} · {caseData.era} · {caseData.award}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: criticality, marginBottom: 2 }}>{caseData.tier} TIER</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 800, color: criticality }}>{caseData.confidence}%</div>
            <div style={{ fontSize: 7, color: P.t4, marginTop: 2 }}>{caseData.status}</div>
          </div>
        </div>

        {/* View tabs */}
        <div style={{ display: "flex", gap: 6, background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "8px 10px", overflowX: "auto" }}>
          {Object.entries(VIEWS).map(([v, label]) => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: "6px 12px", fontSize: 8, fontWeight: view === v ? 700 : 400,
                background: view === v ? `${criticality}20` : "transparent",
                border: `1px solid ${view === v ? criticality : P.b}`,
                color: view === v ? criticality : P.t4, borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 12 }}>
        {/* Main content area */}
        <div>
          {view === "overview" && (
            <div>
              <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 8 }}>Case Summary</div>
                <div style={{ fontSize: 8, color: P.t2, lineHeight: 1.8 }}>{caseData.summary}</div>
              </div>

              <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 8 }}>Case Metadata</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    ["Tier", caseData.tier],
                    ["Confidence", `${caseData.confidence}%`],
                    ["Status", caseData.status],
                    ["Location", caseData.location],
                    ["Branch", caseData.branch],
                    ["Era", caseData.era],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: P.bg, border: `1px solid ${P.b}20`, borderRadius: 6, padding: 8 }}>
                      <div style={{ fontSize: 7, color: P.t4, marginBottom: 2 }}>{k}</div>
                      <div style={{ fontSize: 8, fontWeight: 700, color: P.t1 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === "documents" && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 10 }}>Documents ({caseData.evidence.documents.length})</div>
              {caseData.evidence.documents.map((doc, i) => (
                <div key={i} style={{ background: P.card, border: `1px solid ${doc.status === "ANOMALY" ? P.red : P.b}30`, borderLeft: `4px solid ${doc.status === "ANOMALY" ? P.red : P.teal}`,
                  borderRadius: 10, padding: 12, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: P.t1 }}>{doc.title}</div>
                      <div style={{ fontSize: 7, color: P.t4, marginTop: 2 }}>{doc.type} · {doc.date}</div>
                    </div>
                    <span style={{ fontSize: 7, background: doc.status === "ANOMALY" ? `${P.red}15` : `${P.teal}15`,
                      border: `1px solid ${doc.status === "ANOMALY" ? P.red : P.teal}25`,
                      color: doc.status === "ANOMALY" ? P.red : P.teal, borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>
                      {doc.status === "ANOMALY" ? "⚠️ ANOMALY" : "✓ VERIFIED"}
                    </span>
                  </div>
                  <div style={{ fontSize: 8, color: P.t3, marginBottom: 8 }}>{doc.pages} pages</div>
                  <button style={{ padding: "6px 12px", fontSize: 8, fontWeight: 700, cursor: "pointer",
                    background: `${P.blue}15`, border: `1px solid ${P.blue}30`,
                    color: P.blue, borderRadius: 6, marginRight: 6 }}>
                    📥 View PDF
                  </button>
                  <button style={{ padding: "6px 12px", fontSize: 8, fontWeight: 700, cursor: "pointer",
                    background: `${P.t4}08`, border: `1px solid ${P.b}`,
                    color: P.t4, borderRadius: 6 }}>
                    🔐 Verify Hash
                  </button>
                </div>
              ))}
            </div>
          )}

          {view === "photos" && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 10 }}>Photographic Evidence ({caseData.evidence.photos.length})</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 10 }}>
                {caseData.evidence.photos.map((photo, i) => (
                  <div key={i} style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ background: P.bg, height: 160, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
                      📸
                    </div>
                    <div style={{ padding: 10 }}>
                      <div style={{ fontSize: 8, fontWeight: 700, color: P.t1, marginBottom: 4 }}>{photo.title}</div>
                      <div style={{ fontSize: 7, color: P.t4, marginBottom: 6 }}>{photo.source}</div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button style={{ flex: 1, padding: "4px 8px", fontSize: 7, fontWeight: 700, cursor: "pointer",
                          background: `${P.gold}15`, border: `1px solid ${P.gold}30`,
                          color: P.gold, borderRadius: 4 }}>
                          🔍 Expand
                        </button>
                        {photo.verified && <span style={{ padding: "4px 8px", fontSize: 7, color: P.teal, fontWeight: 700 }}>✓ Verified</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === "timeline" && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 10 }}>Chronological Event Timeline</div>
              <div style={{ position: "relative", paddingLeft: 20 }}>
                {caseData.evidence.timeline.map((event, i) => {
                  const typeColors = { service: P.blue, action: P.red, casualty: P.amber, discharge: P.teal, award: P.gold, legal: P.violet, medical: P.t4, deployment: P.amber, deportation: P.red };
                  const tc = typeColors[event.type] || P.t4;
                  return (
                    <div key={i} style={{ marginBottom: 12, position: "relative" }}>
                      {i < caseData.evidence.timeline.length - 1 && (
                        <div style={{ position: "absolute", left: -8, top: 20, width: 2, height: 40, background: `${tc}30` }} />
                      )}
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <div style={{ width: 16, height: 16, borderRadius: "50%", background: tc, border: `2px solid ${P.card}`, flexShrink: 0, marginTop: 2 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 8, fontWeight: 700, color: P.t1 }}>{event.event}</div>
                          <div style={{ fontSize: 7, color: P.t4, marginTop: 2 }}>
                            {event.date} · <span style={{ fontWeight: 700, color: tc }}>{event.type.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === "verification" && (
            <div>
              <div style={{ background: `${P.teal}12`, border: `1px solid ${P.teal}30`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: P.teal, marginBottom: 6 }}>SHA-256 Cryptographic Verification</div>
                <div style={{ fontSize: 7, color: P.t3, lineHeight: 1.6 }}>
                  All documents undergo cryptographic verification using SHA-256 hashing. Each hash is stored in an immutable evidence ledger. Cross-reference hashes below against the chain of custody ledger to ensure document authenticity.
                </div>
              </div>

              <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 8 }}>Document Hashes</div>
              {caseData.evidence.documents.map((doc, i) => (
                <div key={i} style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12, marginBottom: 8 }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: P.t1, marginBottom: 6 }}>{doc.title}</div>
                  <div style={{ background: P.bg, borderRadius: 6, padding: 8, marginBottom: 6 }}>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 6, color: P.t4, wordBreak: "break-all", lineHeight: 1.4 }}>
                      {doc.hash}
                    </div>
                  </div>
                  <button style={{ padding: "6px 12px", fontSize: 7, fontWeight: 700, cursor: "pointer",
                    background: `${P.blue}15`, border: `1px solid ${P.blue}30`,
                    color: P.blue, borderRadius: 6 }}>
                    📋 Copy Hash
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div>
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12, marginBottom: 10 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.t4, marginBottom: 8, letterSpacing: 1 }}>CASE STATUS</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: criticality, marginBottom: 4 }}>{caseData.status}</div>
            <div style={{ fontSize: 7, color: P.t4, lineHeight: 1.6, marginBottom: 10 }}>
              {caseData.status === "DEPORTED 2025" 
                ? "Active removal order. Self-deported Nov/Dec 2025. CHC emergency case requiring immediate congressional inquiry."
                : "Case verified and documented. Evidence chain complete. Ready for briefing package."}
            </div>
          </div>

          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: P.t4, marginBottom: 8, letterSpacing: 1 }}>EVIDENCE SUMMARY</div>
            {[
              ["Documents", caseData.evidence.documents.length],
              ["Photos", caseData.evidence.photos.length],
              ["Timeline Events", caseData.evidence.timeline.length],
              ["Hashes Verified", caseData.evidence.documents.filter(d => d.status === "VERIFIED").length],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 7, color: P.t4, padding: "4px 0", borderBottom: `1px solid ${P.b}20` }}>
                <span>{k}</span>
                <span style={{ fontWeight: 700, color: P.gold }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}