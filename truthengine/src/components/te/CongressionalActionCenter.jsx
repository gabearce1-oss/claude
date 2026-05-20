import { useState, useEffect } from "react";
import {
  Flag, Mail, Clock, AlertTriangle, CheckCircle, Copy, ExternalLink,
  Calendar, ChevronRight, AlertCircle, FileText, Users, Zap, Shield
} from "lucide-react";
import { P, FOIA_REQUESTS } from "../../lib/teData";

const FONT = "'IBM Plex Mono', monospace";

function useCountdownDays(targetDate) {
  const [days, setDays] = useState(0);
  useEffect(() => {
    function calc() {
      const diff = new Date(targetDate) - new Date();
      setDays(diff > 0 ? Math.ceil(diff / 86400000) : 0);
    }
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [targetDate]);
  return days;
}

const LEGISLATION = [
  {
    id: "S.874",
    title: "Veterans Visa and Protection Act",
    sponsor: "Sen. Tammy Duckworth (D-IL)",
    chamber: "Senate",
    committee: "Armed Services Committee",
    status: "In Committee",
    color: P.blue,
    summary: "Would prohibit deportation of veterans who served honorably. Extends INA §329 protections.",
    priority: "HIGH"
  },
  {
    id: "HR.1537",
    title: "Repatriate Our Patriots Act",
    sponsor: "Rep. Mark Takano (D-CA)",
    chamber: "House",
    committee: "House Veterans Affairs",
    status: "Referred",
    color: P.teal,
    summary: "Creates repatriation pathway for deported veterans. Retroactive to IIRIRA 1996 deportees.",
    priority: "HIGH"
  },
  {
    id: "HR.5537",
    title: "Veteran Service Recognition Act",
    sponsor: "Rep. Ruben Gallego (D-AZ)",
    chamber: "House",
    committee: "House Armed Services",
    status: "Draft",
    color: P.cyan,
    summary: "Recognition of non-citizen veteran service. DCAS reclassification mandate.",
    priority: "MEDIUM"
  },
  {
    id: "S.1298",
    title: "Military Service Naturalization Fairness Act",
    sponsor: "Sen. Alex Padilla (D-CA)",
    chamber: "Senate",
    committee: "Senate Judiciary",
    status: "Introduced",
    color: P.violet,
    summary: "Retroactive naturalization for honorably discharged veterans. INA §329 expansion.",
    priority: "MEDIUM"
  },
  {
    id: "HR.2802",
    title: "Deported Veterans Support Act",
    sponsor: "Rep. Nanette Barragán (D-CA)",
    chamber: "House",
    committee: "House Judiciary",
    status: "Introduced",
    color: P.amber,
    summary: "Direct support services and legal relief for deported veterans abroad.",
    priority: "MEDIUM"
  },
];

const CHC_DISTRIBUTION = [
  { name: "Rep. Joaquin Castro", title: "CHC Chair (TX-20)", email: "congressman.castro@mail.house.gov" },
  { name: "Rep. Nanette Barragán", title: "CHC Vice Chair (CA-44)", email: "barragán@mail.house.gov" },
  { name: "Rep. Raul Grijalva", title: "CHC Whip (AZ-07)", email: "grijalva@mail.house.gov" },
  { name: "Rep. Veronica Escobar", title: "CHC Member (TX-16)", email: "escobar@mail.house.gov" },
  { name: "Rep. Tony Cardenas", title: "CHC Member (CA-29)", email: "cardenas@mail.house.gov" },
  { name: "Rep. Gil Cisneros", title: "CHC / Veteran (CA-39)", email: "cisneros@mail.house.gov" },
  { name: "Rep. Ruben Gallego", title: "CHC / USMC Veteran (AZ-03)", email: "gallego@mail.house.gov" },
  { name: "Rep. Salud Carbajal", title: "CHC Member (CA-24)", email: "carbajal@mail.house.gov" },
];

const LEGISLATIVE_ASKS = [
  {
    priority: 1, color: P.red,
    ask: "Formal inquiry to DHS/ICE demanding veteran status field implementation (7 yrs post-GAO)",
    bill: "FOIA-2026-002 escalation"
  },
  {
    priority: 2, color: P.red,
    ask: "Emergency FOIA escalation letter — VA BIRLS (83 days overdue, FOIA-2026-001)",
    bill: "FOIA-2026-001 escalation"
  },
  {
    priority: 3, color: P.amber,
    ask: "Request DOD/DMDC DCAS full reclassification audit with original race codes",
    bill: "FOIA-2026-003 support"
  },
  {
    priority: 4, color: P.amber,
    ask: "Co-sponsorship of S.874 and HR.1537 by all CHC members",
    bill: "S.874 / HR.1537"
  },
  {
    priority: 5, color: P.gold,
    ask: "CHC public statement on DCAS −41.6σ impossibility finding",
    bill: "Research release May 31"
  },
  {
    priority: 6, color: P.gold,
    ask: "Schedule House Veterans Affairs hearing on deported Vietnam veteran erasure",
    bill: "Manuscript deadline May 31"
  },
];

const RAPID_RESPONSE = [
  {
    id: "talking-points",
    label: "CHC Talking Points",
    color: P.teal,
    icon: Users,
    text: `DCAS forensic analysis of 58,220 Vietnam casualty records reveals only 349 officially coded Hispanic — 0.60% — while BIFSG probabilistic surname analysis estimates 3,272 (5.62%). This 83.6% classification failure produces an impossibility z-score of −41.6σ. The null hypothesis of accurate classification is rejected at p<10⁻²⁵⁰. Six CB-HSIVF verified cases confirm the pattern, including EPP-003 Sae Joon Park who self-deported in June 2025 under ICE pressure despite a Purple Heart and Army service.`
  },
  {
    id: "press-release",
    label: "Press Release Lead",
    color: P.gold,
    icon: FileText,
    text: `WASHINGTON — New forensic analysis of Department of Defense casualty records reveals that Hispanic Vietnam veterans were misclassified at a rate of 83.6%, with only 349 officially recorded out of an estimated 3,272 — a statistical impossibility of −41.6 standard deviations. The findings, to be presented at the Congressional Hispanic Caucus on May 18, 2026, expose decades of institutional erasure affecting thousands of families still seeking recognition.`
  },
  {
    id: "social",
    label: "Tweet / X Thread Opener",
    color: P.violet,
    icon: Zap,
    text: `🧵 THREAD: The U.S. government has been hiding a statistical impossibility for 50 years.\n\nOf 58,220 Vietnam War casualties in official DOD records, only 349 are coded Hispanic.\n\nMath says there should be ~3,272.\n\nThat gap = −41.6 standard deviations.\n\nHere's what that means → (1/12)`
  },
];

const TIMELINE = [
  { date: "Apr 20, 2026", label: "DHS/ICE ENFORCE FOIA OVERDUE", action: "Email foia.ice@dhs.gov + CHC escalation", color: P.red, urgent: true },
  { date: "May 1, 2026",  label: "USCIS FOIA Follow-up", action: "foiarequest@uscis.dhs.gov", color: P.amber, urgent: false },
  { date: "May 18, 2026", label: "CHC Congressional Briefing", action: "DCAS Forensic Audit presentation", color: P.gold, urgent: false },
  { date: "May 31, 2026", label: "Manuscript Deadline", action: "SGT George Ramos — publication", color: P.orange, urgent: false },
  { date: "Jun 2026",     label: "SSS Selective Service FOIA", action: "Monitor — due Jun 2026", color: P.blue, urgent: false },
];

export default function CongressionalActionCenter({ setTab }) {
  const daysToChc = useCountdownDays("2026-05-18T09:00:00");
  const overdueRequests = FOIA_REQUESTS.filter(f => f.status === "OVERDUE");
  const [copied, setCopied] = useState(null);

  function copyText(id, text) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <div style={{ background: P.bg, minHeight: "100vh", fontFamily: FONT, color: P.t1, padding: "0 0 60px 0" }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #0D1B3E 0%, #1E3A8A 40%, #0D1B3E 100%)",
        borderBottom: `1px solid ${P.b}`, padding: "24px 32px"
      }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 8, color: P.t3, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>
                Engagement Module
              </div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: P.t1, fontFamily: FONT, letterSpacing: 1 }}>
                CONGRESSIONAL ACTION CENTER
              </h1>
              <div style={{ fontSize: 11, color: P.t3, fontFamily: FONT, marginTop: 4 }}>
                CHC Briefing Coordination — May 18, 2026
              </div>
            </div>
            <div style={{
              background: `${P.gold}20`, border: `2px solid ${P.gold}60`,
              borderRadius: 12, padding: "12px 20px", textAlign: "center"
            }}>
              <div style={{ fontSize: 9, color: P.gold, fontFamily: FONT, letterSpacing: 2, marginBottom: 4 }}>CHC BRIEFING IN</div>
              <div style={{ fontSize: 44, fontWeight: 900, color: P.gold, fontFamily: FONT, lineHeight: 1 }}>{daysToChc}</div>
              <div style={{ fontSize: 9, color: P.gold, fontFamily: FONT, letterSpacing: 2 }}>DAYS</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Hero Alert ─────────────────────────────────────────── */}
      <div style={{ maxWidth: 1300, margin: "24px auto 0", padding: "0 32px" }}>
        <div style={{
          background: `linear-gradient(135deg, ${P.red}15 0%, ${P.gold}08 100%)`,
          border: `1px solid ${P.red}50`, borderLeft: `4px solid ${P.red}`,
          borderRadius: 10, padding: "14px 20px",
          display: "flex", alignItems: "center", gap: 16, marginBottom: 24
        }}>
          <AlertTriangle size={24} color={P.red} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: P.t1, fontFamily: FONT }}>
              CHC Briefing in {daysToChc} days —{" "}
              <span style={{ color: P.red }}>3 FOIA requests require congressional escalation</span>
            </div>
            <div style={{ fontSize: 9, color: P.t3, fontFamily: FONT, marginTop: 4 }}>
              FOIA-2026-001 (VA BIRLS, 83 days overdue) · FOIA-2026-002 (DHS/ICE, 66 days overdue) · FOIA-2026-003 (DOD/DMDC, pending)
            </div>
          </div>
          <button
            onClick={() => setTab && setTab("foia")}
            style={{
              background: `${P.red}20`, border: `1px solid ${P.red}50`,
              borderRadius: 8, padding: "8px 16px", cursor: "pointer",
              fontSize: 10, color: P.red, fontFamily: FONT, fontWeight: 700
            }}>
            FOIA Manager →
          </button>
        </div>

        {/* ── Two-Column Layout ─────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* ══ LEFT COLUMN ══════════════════════════════════════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Legislative Tracker */}
            <div style={{
              background: "linear-gradient(135deg, #1E3A8A 0%, #1A2E5C 100%)",
              border: `1px solid ${P.b}`, borderRadius: 12, overflow: "hidden"
            }}>
              <div style={{
                background: `${P.blue}20`, borderBottom: `1px solid ${P.b}`,
                padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: P.t1, fontFamily: FONT, letterSpacing: 2, textTransform: "uppercase" }}>
                  Legislative Tracker
                </div>
                <div style={{
                  background: `${P.teal}20`, border: `1px solid ${P.teal}40`,
                  borderRadius: 20, padding: "2px 10px", fontSize: 8, color: P.teal, fontFamily: FONT
                }}>5 Bills</div>
              </div>
              <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                {LEGISLATION.map(leg => (
                  <div key={leg.id} style={{
                    background: `${leg.color}08`, border: `1px solid ${leg.color}25`,
                    borderLeft: `3px solid ${leg.color}`, borderRadius: 8, padding: "10px 14px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                          background: `${leg.color}25`, border: `1px solid ${leg.color}50`,
                          borderRadius: 5, padding: "2px 8px", fontSize: 9, color: leg.color,
                          fontFamily: FONT, fontWeight: 700
                        }}>{leg.id}</span>
                        <span style={{
                          fontSize: 7, color: leg.priority === "HIGH" ? P.red : P.amber,
                          background: leg.priority === "HIGH" ? `${P.red}15` : `${P.amber}15`,
                          border: `1px solid ${leg.priority === "HIGH" ? P.red : P.amber}30`,
                          borderRadius: 4, padding: "1px 6px", fontFamily: FONT
                        }}>{leg.priority}</span>
                      </div>
                      <span style={{
                        fontSize: 7, color: P.t3, background: `${P.b}60`,
                        borderRadius: 4, padding: "1px 7px", fontFamily: FONT
                      }}>{leg.committee}</span>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: P.t1, fontFamily: FONT, marginBottom: 3 }}>
                      {leg.title}
                    </div>
                    <div style={{ fontSize: 8, color: P.t3, fontFamily: FONT, marginBottom: 4 }}>
                      {leg.sponsor}
                    </div>
                    <div style={{ fontSize: 8, color: P.t3, fontFamily: FONT, lineHeight: 1.5 }}>
                      {leg.summary}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CHC Distribution List */}
            <div style={{
              background: "linear-gradient(135deg, #1E3A8A 0%, #1A2E5C 100%)",
              border: `1px solid ${P.b}`, borderRadius: 12, overflow: "hidden"
            }}>
              <div style={{
                background: `${P.gold}15`, borderBottom: `1px solid ${P.b}`,
                padding: "14px 18px"
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: P.t1, fontFamily: FONT, letterSpacing: 2, textTransform: "uppercase" }}>
                  CHC Distribution List
                </div>
              </div>
              <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                {CHC_DISTRIBUTION.map((m, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "7px 10px", background: "rgba(15,23,42,0.4)",
                    borderRadius: 7, border: `1px solid ${P.b}30`
                  }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: P.t1, fontFamily: FONT }}>{m.name}</div>
                      <div style={{ fontSize: 8, color: P.t3, fontFamily: FONT }}>{m.title}</div>
                    </div>
                    <a href={`mailto:${m.email}`} style={{ textDecoration: "none" }}>
                      <button style={{
                        background: `${P.blue}20`, border: `1px solid ${P.blue}40`,
                        borderRadius: 6, padding: "4px 10px", cursor: "pointer",
                        fontSize: 8, color: P.t3, fontFamily: FONT,
                        display: "flex", alignItems: "center", gap: 4
                      }}>
                        <Mail size={10} color={P.blue} />
                        Email
                      </button>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* 6 Legislative Asks */}
            <div style={{
              background: "linear-gradient(135deg, #1E3A8A 0%, #1A2E5C 100%)",
              border: `1px solid ${P.b}`, borderRadius: 12, overflow: "hidden"
            }}>
              <div style={{
                background: `${P.amber}15`, borderBottom: `1px solid ${P.b}`,
                padding: "14px 18px"
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: P.t1, fontFamily: FONT, letterSpacing: 2, textTransform: "uppercase" }}>
                  6 Legislative Asks
                </div>
              </div>
              <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                {LEGISLATIVE_ASKS.map((ask) => (
                  <div key={ask.priority} style={{
                    display: "flex", gap: 12, alignItems: "flex-start",
                    padding: "8px 10px", background: `${ask.color}08`,
                    border: `1px solid ${ask.color}25`, borderRadius: 8
                  }}>
                    <div style={{
                      minWidth: 24, height: 24, borderRadius: "50%",
                      background: `${ask.color}25`, border: `1px solid ${ask.color}50`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 900, color: ask.color, fontFamily: FONT
                    }}>{ask.priority}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: P.t1, fontFamily: FONT, lineHeight: 1.5 }}>{ask.ask}</div>
                      <div style={{ fontSize: 8, color: `${ask.color}90`, fontFamily: FONT, marginTop: 3 }}>{ask.bill}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══ RIGHT COLUMN ══════════════════════════════════════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* FOIA Escalation */}
            <div style={{
              background: "linear-gradient(135deg, #1E3A8A 0%, #1A2E5C 100%)",
              border: `1px solid ${P.red}40`, borderRadius: 12, overflow: "hidden"
            }}>
              <div style={{
                background: `${P.red}20`, borderBottom: `1px solid ${P.red}30`,
                padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: P.t1, fontFamily: FONT, letterSpacing: 2, textTransform: "uppercase" }}>
                  FOIA Escalation
                </div>
                <div style={{
                  background: P.red, borderRadius: 20, padding: "2px 10px",
                  fontSize: 8, color: "#fff", fontFamily: FONT, fontWeight: 700
                }}>2 OVERDUE</div>
              </div>
              <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                {overdueRequests.map(f => (
                  <div key={f.id} style={{
                    background: `${P.red}08`, border: `1px solid ${P.red}30`,
                    borderRadius: 10, padding: "14px 16px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 9, color: P.t3, fontFamily: FONT }}>{f.id}</span>
                      <span style={{
                        background: `${P.red}25`, border: `1px solid ${P.red}60`,
                        borderRadius: 5, padding: "2px 8px", fontSize: 8, color: P.red,
                        fontFamily: FONT, fontWeight: 700
                      }}>{f.daysOverdue} DAYS OVERDUE</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: P.t1, fontFamily: FONT, marginBottom: 4 }}>
                      {f.agency}
                    </div>
                    <div style={{ fontSize: 9, color: P.t3, fontFamily: FONT, marginBottom: 8, lineHeight: 1.5 }}>
                      {f.subject}
                    </div>
                    <div style={{ fontSize: 8, color: P.red, fontFamily: FONT, marginBottom: 12 }}>
                      Action: {f.action}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {f.email && (
                        <a href={`mailto:${f.email}`} style={{ textDecoration: "none" }}>
                          <button style={{
                            background: `${P.red}15`, border: `1px solid ${P.red}40`,
                            borderRadius: 7, padding: "7px 14px", cursor: "pointer",
                            fontSize: 9, color: P.red, fontFamily: FONT, fontWeight: 700,
                            display: "flex", alignItems: "center", gap: 6
                          }}>
                            <Mail size={12} color={P.red} />
                            Email {f.email}
                          </button>
                        </a>
                      )}
                      {f.contact && (
                        <button style={{
                          background: `${P.amber}15`, border: `1px solid ${P.amber}40`,
                          borderRadius: 7, padding: "7px 14px", cursor: "pointer",
                          fontSize: 9, color: P.amber, fontFamily: FONT, fontWeight: 700
                        }}>
                          Call {f.contact}
                        </button>
                      )}
                      <button
                        onClick={() => setTab && setTab("foia")}
                        style={{
                          background: `${P.blue}15`, border: `1px solid ${P.blue}40`,
                          borderRadius: 7, padding: "7px 14px", cursor: "pointer",
                          fontSize: 9, color: P.blue, fontFamily: FONT,
                          display: "flex", alignItems: "center", gap: 6
                        }}>
                        <ExternalLink size={12} color={P.blue} />
                        FOIA Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rapid Response Toolkit */}
            <div style={{
              background: "linear-gradient(135deg, #1E3A8A 0%, #1A2E5C 100%)",
              border: `1px solid ${P.b}`, borderRadius: 12, overflow: "hidden"
            }}>
              <div style={{
                background: `${P.violet}15`, borderBottom: `1px solid ${P.b}`,
                padding: "14px 18px"
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: P.t1, fontFamily: FONT, letterSpacing: 2, textTransform: "uppercase" }}>
                  Rapid Response Toolkit
                </div>
              </div>
              <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                {RAPID_RESPONSE.map(r => (
                  <div key={r.id} style={{
                    background: `${r.color}08`, border: `1px solid ${r.color}25`,
                    borderRadius: 10, padding: "12px 14px"
                  }}>
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <r.icon size={14} color={r.color} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: r.color, fontFamily: FONT }}>
                          {r.label}
                        </span>
                      </div>
                      <button
                        onClick={() => copyText(r.id, r.text)}
                        style={{
                          background: copied === r.id ? `${P.teal}20` : `${r.color}15`,
                          border: `1px solid ${copied === r.id ? P.teal : r.color}40`,
                          borderRadius: 6, padding: "4px 10px", cursor: "pointer",
                          fontSize: 8, color: copied === r.id ? P.teal : r.color,
                          fontFamily: FONT, display: "flex", alignItems: "center", gap: 4
                        }}>
                        {copied === r.id ? <CheckCircle size={10} color={P.teal} /> : <Copy size={10} color={r.color} />}
                        {copied === r.id ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div style={{
                      fontSize: 9, color: P.t2, fontFamily: FONT, lineHeight: 1.6,
                      background: "rgba(0,0,0,0.3)", borderRadius: 6, padding: "10px 12px",
                      maxHeight: 120, overflowY: "auto",
                      whiteSpace: "pre-line"
                    }}>
                      {r.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps Timeline */}
            <div style={{
              background: "linear-gradient(135deg, #1E3A8A 0%, #1A2E5C 100%)",
              border: `1px solid ${P.b}`, borderRadius: 12, overflow: "hidden"
            }}>
              <div style={{
                background: `${P.cyan}15`, borderBottom: `1px solid ${P.b}`,
                padding: "14px 18px"
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: P.t1, fontFamily: FONT, letterSpacing: 2, textTransform: "uppercase" }}>
                  Next Steps Timeline
                </div>
              </div>
              <div style={{ padding: "12px 16px" }}>
                {TIMELINE.map((ev, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, position: "relative", paddingBottom: i < TIMELINE.length - 1 ? 16 : 0 }}>
                    {/* Connector line */}
                    {i < TIMELINE.length - 1 && (
                      <div style={{
                        position: "absolute", left: 11, top: 26, bottom: 0,
                        width: 2, background: `${P.b}60`
                      }} />
                    )}
                    {/* Dot */}
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: ev.urgent ? P.red : `${ev.color}25`,
                      border: `2px solid ${ev.color}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, zIndex: 1
                    }}>
                      {ev.urgent
                        ? <AlertCircle size={12} color="#fff" />
                        : <Calendar size={10} color={ev.color} />
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                        <span style={{ fontSize: 9, color: ev.color, fontFamily: FONT, fontWeight: 700 }}>
                          {ev.date}
                        </span>
                        {ev.urgent && (
                          <span style={{
                            fontSize: 7, color: P.red, background: `${P.red}15`,
                            border: `1px solid ${P.red}30`, borderRadius: 4, padding: "1px 6px",
                            fontFamily: FONT
                          }}>ACTION REQUIRED</span>
                        )}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: P.t1, fontFamily: FONT, marginBottom: 2 }}>
                        {ev.label}
                      </div>
                      <div style={{ fontSize: 8, color: P.t3, fontFamily: FONT }}>{ev.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
