import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Star, AlertTriangle, ChevronRight, MapPin, Hash,
  Users, Award, CheckCircle, ExternalLink, Zap
} from "lucide-react";
import { P, CASES } from "../../lib/teData";

const FONT = "'IBM Plex Mono', monospace";

const TIER_COLOR = {
  Gold: P.gold,
  Silver: "#CBD5E1",
  Bronze: "#CD7F32",
};

const COUNTRY_FLAG = {
  Mexico: "🇲🇽",
  "South Korea": "🇰🇷",
  Colombia: "🇨🇴",
  "N/A": "🇺🇸",
};

const BRANCH_SHORT = {
  "USMC": "USMC",
  "U.S. Army": "USA",
};

function StatusDot({ status }) {
  const color =
    status.includes("Deported") ? P.red :
    status.includes("Self-deported") ? P.amber :
    status.includes("Deceased") ? "#94A3B8" :
    P.teal;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: color,
        boxShadow: `0 0 6px ${color}`,
        display: "inline-block", flexShrink: 0
      }} />
      <span style={{ fontSize: 9, color, fontFamily: FONT }}>{status}</span>
    </span>
  );
}

function ConfidenceBar({ value, color }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 8, color: P.t3, fontFamily: FONT }}>Confidence</span>
        <span style={{ fontSize: 9, fontWeight: 700, color, fontFamily: FONT }}>{value}%</span>
      </div>
      <div style={{ height: 5, background: `${P.b}60`, borderRadius: 3, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ height: "100%", background: color, borderRadius: 3 }}
        />
      </div>
    </div>
  );
}

const FILTERS = [
  { id: "all",        label: "All",          match: () => true },
  { id: "gold",       label: "Gold",         match: c => c.tier === "Gold" },
  { id: "silver",     label: "Silver",       match: c => c.tier === "Silver" },
  { id: "bronze",     label: "Bronze",       match: c => c.tier === "Bronze" },
  { id: "deported",   label: "Deported",     match: c => c.status.toLowerCase().includes("deport") },
  { id: "deceased",   label: "Deceased",     match: c => c.status.toLowerCase().includes("deceas") },
  { id: "active2025", label: "Active 2025",  match: c => c.yearDeported === 2025 || c.status.includes("2025") },
];

function CaseCard({ c, setTab }) {
  const [hov, setHov] = useState(false);
  const tc = TIER_COLOR[c.tier] || P.b;
  const isUrgent = c.id === "EPP-003";
  const flag = COUNTRY_FLAG[c.country] || "";
  const truncNotes = c.notes.length > 90 ? c.notes.slice(0, 90) + "…" : c.notes;
  const truncHash = c.hash.slice(0, 16) + "…";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov
          ? `linear-gradient(135deg, ${tc}12 0%, #1A2E5C 100%)`
          : "linear-gradient(135deg, #1E3A8A 0%, #1A2E5C 100%)",
        border: `1px solid ${isUrgent ? P.red + "60" : tc + "40"}`,
        borderTop: `4px solid ${isUrgent ? P.red : tc}`,
        borderRadius: 12, overflow: "hidden",
        boxShadow: isUrgent
          ? `0 0 24px ${P.red}20, 0 2px 16px rgba(0,0,0,0.4)`
          : hov
          ? `0 4px 24px ${tc}15, 0 2px 12px rgba(0,0,0,0.3)`
          : "0 2px 8px rgba(0,0,0,0.2)",
        transition: "all 0.2s ease",
        position: "relative"
      }}>

      {/* Urgent badge */}
      {isUrgent && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: P.red, borderRadius: 5,
          padding: "3px 8px", fontSize: 8, color: "#fff",
          fontFamily: FONT, fontWeight: 900, letterSpacing: 2,
          display: "flex", alignItems: "center", gap: 4
        }}>
          <Zap size={10} color="#fff" />
          URGENT 2025
        </div>
      )}

      <div style={{ padding: "14px 16px" }}>

        {/* Top row: case ID + tier badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontFamily: FONT, fontSize: 9, color: P.t3,
              background: `${P.b}60`, borderRadius: 5, padding: "2px 8px"
            }}>{c.id}</span>
            <span style={{
              fontSize: 8, fontWeight: 700, color: tc,
              background: `${tc}15`, border: `1px solid ${tc}40`,
              borderRadius: 4, padding: "1px 7px", fontFamily: FONT
            }}>{c.tier.toUpperCase()}</span>
          </div>
          <span style={{
            fontSize: 8, color: P.t3, fontFamily: FONT,
            background: `${P.b}40`, borderRadius: 4, padding: "1px 7px"
          }}>{BRANCH_SHORT[c.branch] || c.branch}</span>
        </div>

        {/* Name */}
        <div style={{
          fontSize: 15, fontWeight: 900, color: isUrgent ? P.red : P.t1,
          fontFamily: FONT, lineHeight: 1.2, marginBottom: 4
        }}>
          {c.name}
        </div>

        {/* Service years */}
        <div style={{ fontSize: 9, color: P.t3, fontFamily: FONT, marginBottom: 8 }}>
          {c.serviceYears} · {c.chargeType}
        </div>

        {/* Status */}
        <div style={{ marginBottom: 10 }}>
          <StatusDot status={c.status} />
        </div>

        {/* Location */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <MapPin size={11} color={P.t3} />
          <span style={{ fontSize: 9, color: P.t3, fontFamily: FONT }}>
            {flag} {c.location}
          </span>
        </div>

        {/* Award badge */}
        {c.award && c.award !== "None listed" && (
          <div style={{ marginBottom: 10 }}>
            <span style={{
              background: `${P.gold}18`, border: `1px solid ${P.gold}40`,
              borderRadius: 6, padding: "3px 10px",
              fontSize: 9, color: P.gold, fontFamily: FONT,
              display: "inline-flex", alignItems: "center", gap: 6
            }}>
              <Award size={11} color={P.gold} />
              {c.award}
            </span>
          </div>
        )}

        {/* Confidence bar */}
        <div style={{ marginBottom: 10 }}>
          <ConfidenceBar value={c.confidence} color={tc} />
        </div>

        {/* Certification + Hash */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 8, gap: 8
        }}>
          <span style={{
            fontSize: 8, color: P.teal, background: `${P.teal}12`,
            border: `1px solid ${P.teal}30`, borderRadius: 4,
            padding: "2px 8px", fontFamily: FONT, display: "flex", alignItems: "center", gap: 4
          }}>
            <CheckCircle size={9} color={P.teal} />
            {c.certification}
          </span>
          <span style={{
            fontSize: 7, color: P.t3, fontFamily: FONT,
            display: "flex", alignItems: "center", gap: 4
          }}>
            <Hash size={9} color={P.t3} />
            {truncHash}
          </span>
        </div>

        {/* Sources */}
        <div style={{
          fontSize: 8, color: P.t3, fontFamily: FONT, marginBottom: 8,
          padding: "4px 8px", background: "rgba(15,23,42,0.5)", borderRadius: 5
        }}>
          {c.sources}
        </div>

        {/* Notes */}
        <div style={{
          fontSize: 9, color: P.t2, fontFamily: FONT, lineHeight: 1.5,
          marginBottom: 12, fontStyle: "italic"
        }}>
          {truncNotes}
        </div>

        {/* View Case button */}
        <button
          onClick={() => setTab && setTab("casedetail")}
          style={{
            width: "100%", background: hov ? `${tc}25` : `${tc}12`,
            border: `1px solid ${tc}40`, borderRadius: 8,
            padding: "8px 14px", cursor: "pointer",
            fontSize: 10, color: tc, fontFamily: FONT, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            transition: "all 0.15s ease"
          }}>
          <ExternalLink size={12} color={tc} />
          View Case
        </button>
      </div>
    </motion.div>
  );
}

export default function VeteranCaseBoard({ setTab }) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = CASES.filter(FILTERS.find(f => f.id === activeFilter)?.match || (() => true));

  const goldCount = CASES.filter(c => c.tier === "Gold").length;
  const silverCount = CASES.filter(c => c.tier === "Silver").length;
  const bronzeCount = CASES.filter(c => c.tier === "Bronze").length;
  const avgConf = Math.round(CASES.reduce((s, c) => s + c.confidence, 0) / CASES.length);
  const ptsdCount = CASES.filter(c => c.chargeType.toLowerCase().includes("ptsd")).length;
  const active2025 = CASES.filter(c => c.yearDeported === 2025 || c.status.includes("2025")).length;

  return (
    <div style={{ background: P.bg, minHeight: "100vh", fontFamily: FONT, color: P.t1, padding: "0 0 60px 0" }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #0D1B3E 0%, #1E3A8A 40%, #0D1B3E 100%)",
        borderBottom: `1px solid ${P.b}`, padding: "24px 32px"
      }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 8, color: P.t3, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>
                Case Management
              </div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: P.t1, fontFamily: FONT, letterSpacing: 1 }}>
                VERIFIED CASE BOARD
              </h1>
              <div style={{ fontSize: 11, color: P.t3, fontFamily: FONT, marginTop: 4 }}>
                CB-HSIVF Certified — Exhibit A, Arce 2026
              </div>
            </div>
            <div style={{
              background: `${P.teal}15`, border: `1px solid ${P.teal}40`,
              borderRadius: 10, padding: "10px 18px", textAlign: "right"
            }}>
              <div style={{ fontSize: 9, color: P.t3, fontFamily: FONT, marginBottom: 4 }}>Certification Status</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: P.t1, fontFamily: FONT }}>
                6 Cases · {goldCount} Gold · {silverCount} Silver · {bronzeCount} Bronze
              </div>
              <div style={{ fontSize: 8, color: P.teal, fontFamily: FONT, marginTop: 3 }}>
                EPP-001 through EPP-006 · SHA-256 Certified
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "24px 32px 0" }}>

        {/* ── Filter Bar ─────────────────────────────────────────── */}
        <div style={{
          display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", alignItems: "center"
        }}>
          <span style={{ fontSize: 9, color: P.t3, fontFamily: FONT, marginRight: 4 }}>FILTER:</span>
          {FILTERS.map(f => {
            const isActive = activeFilter === f.id;
            const count = CASES.filter(f.match).length;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                style={{
                  background: isActive ? P.blue : "rgba(15,23,42,0.6)",
                  border: `1px solid ${isActive ? P.blue : P.b}`,
                  borderRadius: 20, padding: "6px 14px",
                  cursor: "pointer", fontSize: 9, fontFamily: FONT,
                  color: isActive ? P.white : P.t3,
                  fontWeight: isActive ? 700 : 400,
                  transition: "all 0.15s ease",
                  display: "flex", alignItems: "center", gap: 6
                }}>
                {f.label}
                <span style={{
                  background: isActive ? "rgba(255,255,255,0.2)" : `${P.b}60`,
                  borderRadius: 10, padding: "1px 6px",
                  fontSize: 8, color: isActive ? P.white : P.t4
                }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* ── Case Cards Grid ──────────────────────────────────────── */}
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
              gap: 18, marginBottom: 28
            }}>
            {filtered.map(c => (
              <CaseCard key={c.id} c={c} setTab={setTab} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* ── Summary Stats Bar ──────────────────────────────────── */}
        <div style={{
          background: "linear-gradient(90deg, #0D1B3E 0%, #1E3A8A 50%, #0D1B3E 100%)",
          border: `1px solid ${P.b}`, borderRadius: 12, padding: "16px 24px",
          display: "flex", gap: 0, alignItems: "stretch"
        }}>
          {[
            { label: "Total Cases", value: CASES.length.toString(), color: P.blue, sub: "CB-HSIVF" },
            { label: "Gold Tier", value: goldCount.toString(), color: P.gold, sub: "Highest confidence" },
            { label: "Avg Confidence", value: `${avgConf}%`, color: P.teal, sub: "Weighted" },
            { label: "PTSD-Linked", value: `${ptsdCount} of 6`, color: P.amber, sub: "Offense pattern" },
            { label: "Active 2025", value: active2025.toString(), color: P.red, sub: "EPP-003 urgent" },
          ].map((s, i) => (
            <div key={s.label} style={{
              flex: 1, textAlign: "center", padding: "0 20px",
              borderRight: i < 4 ? `1px solid ${P.b}60` : "none"
            }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.color, fontFamily: FONT, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: P.t1, fontFamily: FONT, marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 8, color: P.t3, fontFamily: FONT, marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
