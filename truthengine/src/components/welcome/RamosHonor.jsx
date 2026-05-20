const GOLD  = "#F5C842";
const NAVY  = "#0B1A2E";
const STEEL = "#2A4A6B";
const WHITE = "#F0F4FF";
const MUTED = "#8BA8C8";
const RED   = "#C0392B";

export default function RamosHonor() {
  return (
    <section style={{ padding: "70px 48px", background: `linear-gradient(180deg, #050e1f, #0a1628, #050e1f)` }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 9, color: GOLD, letterSpacing: 4, fontWeight: 700, marginBottom: 10 }}>IN MEMORIAM · CASE EPP-001</div>
          <div style={{ width: 48, height: 3, background: `linear-gradient(90deg,${GOLD},#e8a800)`, margin: "0 auto 20px", borderRadius: 2 }} />
        </div>

        {/* Card */}
        <div style={{
          background: `linear-gradient(135deg, #0d1f3c, #0a1525)`,
          border: `2px solid ${GOLD}50`,
          borderRadius: 20,
          padding: "40px 44px",
          position: "relative",
          overflow: "hidden",
          boxShadow: `0 0 60px ${GOLD}12, 0 20px 60px rgba(0,0,0,0.6)`,
        }}>
          {/* Gold top accent */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,transparent,${GOLD},#e8a800,${GOLD},transparent)` }} />
          
          {/* Medal decoration */}
          <div style={{ position: "absolute", top: 20, right: 24, opacity: 0.08, fontSize: 120, lineHeight: 1, pointerEvents: "none" }}>🎖️</div>

          <div style={{ display: "flex", gap: 36, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Left: Medal + rank */}
            <div style={{ textAlign: "center", minWidth: 120 }}>
              <div style={{
                width: 90, height: 90, borderRadius: "50%",
                background: `radial-gradient(circle, ${GOLD}30, ${GOLD}10)`,
                border: `3px solid ${GOLD}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 42, margin: "0 auto 12px",
                boxShadow: `0 0 24px ${GOLD}40`,
              }}>🎖️</div>
              <div style={{ fontSize: 8, fontWeight: 800, color: GOLD, letterSpacing: 2 }}>SGT · U.S. ARMY</div>
              <div style={{ fontSize: 7, color: MUTED, marginTop: 3, letterSpacing: 1 }}>VIETNAM ERA</div>
              <div style={{ marginTop: 10, padding: "4px 10px", background: `${RED}18`, border: `1px solid ${RED}30`, borderRadius: 20, fontSize: 7, color: "#ff8888", fontWeight: 700 }}>
                OFFICIALLY ERASED
              </div>
            </div>

            {/* Right: Bio */}
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 9, color: MUTED, letterSpacing: 3, marginBottom: 6 }}>THE MATHEMATICS OF VIETNAM</div>
              <div style={{ fontSize: "clamp(20px, 3vw, 30px)", fontWeight: 800, color: GOLD, lineHeight: 1.1, marginBottom: 4 }}>
                SGT. George Ramos
              </div>
              <div style={{ fontSize: 11, color: WHITE, fontWeight: 600, marginBottom: 14, opacity: 0.8 }}>
                Mexican National · U.S. Military Service · Vietnam War
              </div>

              <blockquote style={{
                borderLeft: `3px solid ${GOLD}`,
                paddingLeft: 16,
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 13, fontStyle: "italic",
                color: WHITE, lineHeight: 1.8, fontWeight: 300,
                marginBottom: 18,
              }}>
                "His sacrifice was real. His name was erased. The mathematics of Vietnam prove he was never alone — an estimated 346–741 Mexican nationals gave their lives while the official record shows only 4."
              </blockquote>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[
                  { v: "P1",      l: "Priority Case",       c: GOLD },
                  { v: "Gold",    l: "Evidence Tier",        c: GOLD },
                  { v: "97%",     l: "Confidence Score",     c: "#4ADE80" },
                  { v: "C001",    l: "Case ID",              c: MUTED },
                ].map(s => (
                  <div key={s.l} style={{ textAlign: "center", background: "#080D18", borderRadius: 8, padding: "8px 14px", border: `1px solid ${s.c}25` }}>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, fontWeight: 800, color: s.c }}>{s.v}</div>
                    <div style={{ fontSize: 7, color: MUTED, marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${GOLD}20`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 9, color: MUTED, fontFamily: "'IBM Plex Sans', sans-serif" }}>
              Part of <strong style={{ color: GOLD }}>6 verified CB-HSIVF cases</strong> documented by the EXILE Patriot Project
            </div>
            <a href="#signin" style={{
              padding: "9px 22px", background: `${GOLD}15`, border: `1px solid ${GOLD}40`,
              borderRadius: 8, color: GOLD, fontSize: 9, fontWeight: 700, textDecoration: "none",
              letterSpacing: 1,
            }}>
              VIEW FULL CASE FILE →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}