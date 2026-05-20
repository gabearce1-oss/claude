import { useState, useEffect } from "react";
import { P } from "../../lib/teData";

const CHC_DAYS = Math.ceil((new Date("2026-05-18") - new Date()) / 86400000);

const MARQUEE_ITEMS = [
  { text: `⚠️ F001 VA BIRLS FOIA: 83+ DAYS OVERDUE — STATUTORY VIOLATION 5 U.S.C. §552`, type: "critical", color: "#ff0055" },
  { text: `🔐 C004 PARK: SELF-DEPORTATION NOV/DEC 2025 CONFIRMED — PURPLE HEART RECIPIENT`, type: "critical", color: "#ff0055" },
  { text: `⚰️ MX KIA FORENSIC ESTIMATE: 346–741 MEXICAN NATIONALS KILLED IN VIETNAM — OFFICIAL DCAS COUNT: 4 (FOREIGN) — ERASURE RATE: 99.2%`, type: "critical", color: "#ff0055" },
  { text: `📊 DCAS: 349 OFFICIAL vs 2,309 BISG ESTIMATE — 84.9% CLASSIFICATION FAILURE — 5-STREAM CONVERGENCE R²=0.947`, type: "warning", color: "#ffaa00" },
  { text: `🏛️ CHC BRIEFING COUNTDOWN: ${CHC_DAYS} DAYS TO MAY 18, 2026 — WASHINGTON D.C.`, type: "info", color: "#00ff00" },
  { text: `📋 F002 ICE ENFORCE/IDENT FOIA: 66+ DAYS OVERDUE — VETERAN STATUS FIELD HISTORY REQUESTED`, type: "critical", color: "#ff0055" },
  { text: `🇲🇽 202,864 MEXICAN NATIONALS DEPORTED FY2022–2026 — ZERO VETERAN SCREENING FLAGS IN 713,464 ICE RECORDS`, type: "critical", color: "#ff0055" },
  { text: `🧬 BISG FORENSIC AUDIT: 2,309 ± 54 CONFIDENCE INTERVAL 2,255–2,362 — p<0.001`, type: "success", color: "#00ff00" },
  { text: `⚡ NERO INDEX: N=94 · E=97 · R=91 · O=96 — COMBINED: CRITICAL THRESHOLD — ALL VECTORS >90`, type: "critical", color: "#ff0055" },
  { text: `📈 PTSD-PROBABLE DEPORTED: 69,881+ — 27,622 HAD NO CRIMINAL CHARGE — 52 DIED IN ICE CUSTODY`, type: "critical", color: "#ff0055" },
  { text: `🎖️ VERIFIED CASES: 6 CB-HSIVF TIER-5 CERTIFIED — EPP-001 THRU EPP-006 — BENAVIDEZ · RASCON · DURAN · SEGURA · PARK · CASTANO`, type: "warning", color: "#ffaa00" },
  { text: `📅 2025 SURGE: 105,573 MX NATIONALS DEPORTED — +499% vs FY2022 — APRIL 2025 POLICY REVERSAL CONFIRMED INFLECTION POINT`, type: "critical", color: "#ff0055" },
  { text: `🔬 SPSS: Pearson r=.847–.914 (p<.01) CROSS-INSTITUTIONAL — R²=.935 — PATTERN INCONSISTENT WITH RANDOM ERROR`, type: "warning", color: "#ffaa00" },
  { text: `⚖️ GAO-19-416 (2019): ICE HAS NO VETERAN TRACKING — 92 CONFIRMED DEPORTED — DHS AGREED TO FIX — ZERO IMPLEMENTED 7 YEARS LATER`, type: "critical", color: "#ff0055" },
  { text: `🏆 PENTAGON VALOR REVIEW 2014: 17/24 MOH UPGRADES WERE HISPANIC — 70.8% — SYSTEMIC BIAS FORMALLY ADMITTED`, type: "warning", color: "#ffaa00" },
  { text: `📖 MANUSCRIPT: SGT GEORGE RAMOS — THE MATHEMATICS OF VIETNAM — 245,216 WORDS — AUMER FOUNDATION`, type: "success", color: "#00ff00" },
  { text: `🌎 NON-CITIZEN VETERANS AT DEPORTATION RISK: 94,000 — CRS REPORT R48163 (2024) — MEXICAN NATIONALS LARGEST SHARE`, type: "warning", color: "#ffaa00" },
  { text: `💰 UNCLAIMED BENEFITS: VA DIC $1,699/MO × 61 YEARS = $1,243,682 PER SURVIVING SPOUSE — MX FAMILIES NEVER NOTIFIED`, type: "warning", color: "#ffaa00" },
  { text: `🔴 4 RECORDS CODED FOREIGN IN DCAS — ABSOLUTE FLOOR — 99.2% OF ESTIMATED 500 MX KIA ERASED FROM U.S. FEDERAL DATABASES`, type: "critical", color: "#ff0055" },
  { text: `📡 TRUTHENGINE360 LIVE · AUMER FOUNDATION · EIN 99-0495658 · qtruthengine360.org · albavoice.org`, type: "success", color: "#00ff00" },
];

function MarqueeSegment({ item }) {
  return (
    <span
      style={{
        display: "inline-flex",
        gap: 12,
        alignItems: "center",
        whiteSpace: "nowrap",
        marginRight: 24,
        padding: "4px 12px",
        borderRadius: 6,
        background: `${item.color}15`,
        border: `1px solid ${item.color}40`,
        boxShadow: `0 0 6px ${item.color}40`,
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: item.color,
          boxShadow: `0 0 6px ${item.color}, 0 0 12px ${item.color}80`,
          animation:
            item.type === "critical"
              ? "blink 0.5s ease-in-out infinite"
              : "pulse 2s ease-in-out infinite",
        }}
      />
      <span style={{ color: item.color, fontWeight: 700, letterSpacing: 0.5 }}>
        {item.text}
      </span>
    </span>
  );
}

export default function LiveMarquee() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(interval);
  }, []);

  const repeatedItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 48,
        background: `linear-gradient(180deg,
          rgba(0, 0, 0, 0.9) 0%,
          rgba(10, 46, 26, 0.95) 50%,
          rgba(0, 0, 0, 0.9) 100%)`,
        border: `3px solid #00ff00`,
        borderTop: `3px solid #00ff00`,
        boxShadow: `
          0 -8px 20px rgba(0, 255, 0, 0.3),
          0 0 20px rgba(0, 255, 0, 0.2),
          inset 0 1px 0 rgba(0, 255, 0, 0.4),
          inset 0 -1px 0 rgba(0, 255, 0, 0.2)
        `,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        fontFamily: "'Courier New', 'IBM Plex Mono', monospace",
        zIndex: 100,
      }}
    >
      {/* Scanlines effect */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `repeating-linear-gradient(
            0deg,
            rgba(0, 255, 0, 0.03) 0px,
            rgba(0, 255, 0, 0.03) 1px,
            transparent 1px,
            transparent 2px
          )`,
          pointerEvents: "none",
          opacity: 0.6,
        }}
      />

      {/* Status indicator */}
      <div
        style={{
          position: "absolute",
          left: 12,
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "#ff0055",
          boxShadow: "0 0 8px #ff0055, 0 0 16px #ff0055",
          animation: "blink 0.6s ease-in-out infinite",
          zIndex: 10,
        }}
      />

      {/* "LIVE" label */}
      <div
        style={{
          position: "absolute",
          left: 32,
          fontSize: 7,
          fontWeight: 900,
          color: "#00ff00",
          letterSpacing: 2,
          textShadow: "0 0 6px #00ff00, 0 0 12px #00ff00",
          zIndex: 10,
        }}
      >
        ● LIVE
      </div>

      {/* Left fade gradient */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 80,
          background: `linear-gradient(90deg,
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 0.8) 50%,
            transparent 100%)`,
          zIndex: 20,
          pointerEvents: "none",
        }}
      />

      {/* Scrolling content */}
      <div
        style={{
          display: "flex",
          whiteSpace: "nowrap",
          animation: "marquee 90s linear infinite",
          marginLeft: 100,
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {repeatedItems.map((item, i) => (
          <MarqueeSegment key={i} item={item} />
        ))}
      </div>

      {/* Right fade gradient */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 80,
          background: `linear-gradient(270deg,
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 0.8) 50%,
            transparent 100%)`,
          zIndex: 20,
          pointerEvents: "none",
        }}
      />

      {/* Right status area */}
      <div
        style={{
          position: "absolute",
          right: 12,
          display: "flex",
          gap: 10,
          alignItems: "center",
          fontSize: 9,
          color: "#00ff00",
          fontWeight: 700,
          letterSpacing: 1,
          textShadow: "0 0 6px #00ff00",
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: 6, color: "#ffaa00" }}>● CRITICAL</span>
        <span>|</span>
        <span style={{ fontSize: 6, color: "#ffaa00" }}>⚠ WARNING</span>
        <span>|</span>
        <span style={{ fontSize: 6, color: "#00ff00" }}>✓ ACTIVE</span>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 6px currentColor, 0 0 12px currentColor;
          }
          50% {
            opacity: 0.6;
            box-shadow: 0 0 3px currentColor, 0 0 6px currentColor;
          }
        }

        @keyframes flicker {
          0%, 100% { opacity: 1; }
          14% { opacity: 0.98; }
          15% { opacity: 1; }
          49% { opacity: 0.97; }
          50% { opacity: 0.98; }
        }
      `}</style>
    </div>
  );
}