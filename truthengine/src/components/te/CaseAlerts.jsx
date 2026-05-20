import { useState, useEffect, useRef } from "react";
import { P, CASES, FOIA_REQUESTS } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

const CHC_DATE = new Date("2026-05-18");
const MS_DATE  = new Date("2026-05-31");

// Alert rule engine
const generateAlerts = () => {
  const now = new Date();
  const alerts = [];

  // FOIA overdue alerts
  FOIA_REQUESTS.forEach(r => {
    if (r.daysOverdue > 0) {
      alerts.push({
        id: `foia-${r.id}`,
        type: "FOIA_OVERDUE",
        severity: r.daysOverdue > 60 ? "CRITICAL" : "HIGH",
        title: `FOIA Overdue — ${r.agency}`,
        body: `${r.agency} FOIA is ${r.daysOverdue} days past statutory deadline. CHC briefing blocked.`,
        action: `Call ${r.id === "F001" ? "1-877-750-3639 (VA SAOF)" : r.id === "F002" ? "foia.ice@dhs.gov" : "COMAR diplomatic channel"}`,
        timestamp: now,
        caseRef: r.id,
        autoFix: true,
      });
    }
  });

  // CHC deadline alert
  const chcDays = Math.ceil((CHC_DATE - now) / 86400000);
  if (chcDays <= 60) {
    alerts.push({
      id: "chc-deadline",
      type: "DEADLINE",
      severity: chcDays <= 20 ? "CRITICAL" : "HIGH",
      title: `CHC Briefing in ${chcDays} Days`,
      body: `Congressional Hispanic Caucus briefing May 18, 2026. 2 FOIA blockers unresolved. Report readiness: 73%.`,
      action: "Escalate FOIA requests + finalize CB-HSIVF package",
      timestamp: now,
      caseRef: "CHC",
      autoFix: false,
    });
  }

  // Case confidence alerts
  CASES.forEach(c => {
    if (c.confidence < 80) {
      alerts.push({
        id: `case-conf-${c.id}`,
        type: "CASE_CONFIDENCE",
        severity: "MED",
        title: `${c.id} — Low Confidence: ${c.confidence}%`,
        body: `${c.name} confidence below 80%. Missing: service record verification. FOIA data would add ~+9%.`,
        action: `Request ${c.id} service record from NARA — form SF-180`,
        timestamp: new Date(now - Math.random()*3600000*5),
        caseRef: c.id,
        autoFix: false,
      });
    }
  });

  // BISG gap alert
  alerts.push({
    id: "bisg-gap",
    type: "DATA_GAP",
    severity: "HIGH",
    title: "BISG BI-2 Estimation Vacuum Active",
    body: "84.9% classification failure persists in DCAS. ~1,960 missing veterans unaccounted. NARA full surname file not yet acquired.",
    action: "Submit NARA special access request for 1960s surname file (form NA-14021)",
    timestamp: new Date(now - 7200000),
    caseRef: "DCAS",
    autoFix: false,
  });

  // New intake alert (simulated)
  alerts.push({
    id: "shelter-intake-1",
    type: "SHELTER_INTAKE",
    severity: "MED",
    title: "New Veteran Intake — Casa del Migrante TJ",
    body: "Unverified intake: male, est. age 56-62, claims Vietnam-era Army service. BISG surname probability: p(H)=0.91.",
    action: "Dispatch DVSH field intake team — request DD-214 verification",
    timestamp: new Date(now - 840000),
    caseRef: "S01",
    autoFix: false,
  });

  alerts.push({
    id: "shelter-intake-2",
    type: "SHELTER_INTAKE",
    severity: "LOW",
    title: "3 New Arrivals — El Refugio Juárez",
    body: "3 new deportees arrived. Veteran status unconfirmed. Intake interviews scheduled.",
    action: "Coordinate with COMAR for intake screening protocol",
    timestamp: new Date(now - 7200000),
    caseRef: "S03",
    autoFix: false,
  });

  // Manuscript deadline
  const msDays = Math.ceil((MS_DATE - now) / 86400000);
  alerts.push({
    id: "manuscript",
    type: "DEADLINE",
    severity: msDays <= 30 ? "HIGH" : "MED",
    title: `Manuscript Deadline: ${msDays} Days`,
    body: `SGT George Ramos manuscript due May 31, 2026. Rev.92 — 218,004 words. Missing: 2 FOIA data inserts.`,
    action: "Complete FOIA Chapters 18 & 31 placeholders once data received",
    timestamp: now,
    caseRef: "MS",
    autoFix: false,
  });

  // NERO escalation
  alerts.push({
    id: "nero-o",
    type: "NERO_ALERT",
    severity: "HIGH",
    title: "NERO-O Score Rising — Obscurity Vector at 96",
    body: "Obscurity indicator increased +1 since last cycle. ICE ENFORCE FOIA non-response driving systemic data vacuum.",
    action: "File CHC inquiry letter — DHS Secretary escalation",
    timestamp: new Date(now - 1800000),
    caseRef: "NERO",
    autoFix: true,
  });

  return alerts.sort((a,b) => {
    const sv = {CRITICAL:0,HIGH:1,MED:2,LOW:3};
    return sv[a.severity] - sv[b.severity];
  });
};

const SEV_C = { CRITICAL:P.red, HIGH:P.amber, MED:P.blue, LOW:P.teal };
const TYPE_IC = {
  FOIA_OVERDUE:"📋", DEADLINE:"⏰", CASE_CONFIDENCE:"🎖️",
  DATA_GAP:"🔍", SHELTER_INTAKE:"🏠", NERO_ALERT:"⚠️"
};

const RULES = [
  { id:"r1", name:"FOIA Overdue > 20 days", trigger:"FOIA deadline exceeded", action:"Auto-generate CHC inquiry draft", active:true },
  { id:"r2", name:"Case Confidence < 80%", trigger:"Confidence score drop", action:"Flag for NARA SF-180 request", active:true },
  { id:"r3", name:"New Shelter Intake", trigger:"Webhook: DVSH/COMAR intake API", action:"Dispatch field verification team", active:false },
  { id:"r4", name:"NERO Score Increase", trigger:"Any NERO vector +1", action:"Auto-escalate to CHC inquiry queue", active:true },
  { id:"r5", name:"CHC < 30 days", trigger:"Countdown threshold", action:"Freeze non-critical tasks, priority mode", active:true },
  { id:"r6", name:"BISG τ drift detected", trigger:"Threshold sensitivity shift >5%", action:"Re-run full BISG sweep", active:false },
];

export default function CaseAlerts() {
  const [alerts, setAlerts] = useState(generateAlerts);
  const [dismissed, setDismissed] = useState(new Set());
  const [filter, setFilter] = useState("ALL");
  const [rules, setRules] = useState(RULES);
  const [view, setView] = useState("alerts"); // alerts | rules | live
  const [ticker, setTicker] = useState(0);
  const [sendingAlert, setSendingAlert] = useState(null);
  const [sentAlerts, setSentAlerts] = useState(new Set());

  // Live refresh every 60s
  useEffect(() => {
    const t = setInterval(() => { setAlerts(generateAlerts()); setTicker(p=>p+1); }, 60000);
    return () => clearInterval(t);
  }, []);

  const chcLive = Math.ceil((new Date("2026-05-18") - new Date()) / 86400000);
  const msLive  = Math.ceil((new Date("2026-05-31") - new Date()) / 86400000);

  const sendToCHC = async (alert) => {
    setSendingAlert(alert.id);
    try {
      await base44.integrations.Core.SendEmail({
        to: "gtarce@usc.edu",
        subject: `[TE360 ALERT] ${alert.severity}: ${alert.title}`,
        body: `TruthEngine360 Automated Alert\n\nSeverity: ${alert.severity}\nType: ${alert.type}\nCase Ref: ${alert.caseRef}\n\n${alert.body}\n\nRequired Action: ${alert.action}\n\nGenerated: ${new Date().toISOString()}\nCHC Briefing: ${chcLive} days`
      });
      setSentAlerts(p => new Set([...p, alert.id]));
    } catch(e) { console.error(e); }
    setSendingAlert(null);
  };

  const toggleRule = (id) => setRules(r => r.map(rule => rule.id===id ? {...rule,active:!rule.active} : rule));

  const visible = alerts.filter(a => !dismissed.has(a.id) && (filter==="ALL" || a.severity===filter || a.type===filter));

  const counts = {
    CRITICAL: alerts.filter(a=>a.severity==="CRITICAL"&&!dismissed.has(a.id)).length,
    HIGH: alerts.filter(a=>a.severity==="HIGH"&&!dismissed.has(a.id)).length,
    MED: alerts.filter(a=>a.severity==="MED"&&!dismissed.has(a.id)).length,
    LOW: alerts.filter(a=>a.severity==="LOW"&&!dismissed.has(a.id)).length,
  };

  return (
    <div>
      {/* Header stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:7, marginBottom:12 }}>
        {[
          {l:"Critical", v:counts.CRITICAL, c:P.red},
          {l:"High Priority", v:counts.HIGH, c:P.amber},
          {l:"Medium", v:counts.MED, c:P.blue},
          {l:"Low", v:counts.LOW, c:P.teal},
          {l:"Auto-Fix Available", v:alerts.filter(a=>a.autoFix&&!dismissed.has(a.id)).length, c:P.violet},
          {l:"Active Rules", v:rules.filter(r=>r.active).length, c:P.gold},
        ].map((s,i) => (
          <div key={i} style={{ background:P.card, border:`1px solid ${s.c}25`, borderLeft:`3px solid ${s.c}`, borderRadius:7, padding:"7px 10px" }}>
            <div style={{ fontSize:6, color:P.t4, marginBottom:2 }}>{s.l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:17, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Live countdown strip */}
      <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap" }}>
        {[
          {l:"CHC BRIEF", v:`${chcLive}d`, sub:"May 18 2026", c:chcLive<=30?P.red:P.amber},
          {l:"MANUSCRIPT", v:`${msLive}d`, sub:"May 31 2026", c:msLive<=30?P.amber:P.gold},
          {l:"FOIA OVERDUE", v:`${FOIA_REQUESTS.reduce((a,r)=>a+(r.daysOverdue||0),0)}d total`, sub:"F001+F002+F003", c:P.red},
          {l:"LAST REFRESH", v:new Date().toLocaleTimeString(), sub:`Cycle #${ticker+1}`, c:P.teal},
        ].map((s,i)=>(
          <div key={i} style={{ background:P.card, border:`1px solid ${s.c}25`, borderTop:`2px solid ${s.c}`, borderRadius:7, padding:"5px 12px", minWidth:90 }}>
            <div style={{ fontSize:6, color:P.t4, marginBottom:1 }}>{s.l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:800, color:s.c }}>{s.v}</div>
            <div style={{ fontSize:6, color:P.t4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display:"flex", gap:0, marginBottom:10, background:P.card, border:`1px solid ${P.b}`, borderRadius:8, overflow:"hidden", width:"fit-content" }}>
        {[["alerts","🔔 Live Alerts"],["rules","⚙️ Alert Rules"],["live","📡 CHC Status"]].map(([v,l]) => (
          <button key={v} onClick={() => setView(v)}
            style={{ padding:"7px 16px", background: view===v ? `${P.gold}18` : "transparent",
              border:"none", borderRight:`1px solid ${P.b}`, color: view===v ? P.gold : P.t4,
              fontSize:9, fontWeight: view===v ? 700 : 400, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace" }}>
            {l}
          </button>
        ))}
      </div>

      {view === "alerts" && <>
        {/* Filters */}
        <div style={{ display:"flex", gap:5, marginBottom:10, flexWrap:"wrap" }}>
          {["ALL","CRITICAL","HIGH","MED","LOW","FOIA_OVERDUE","DEADLINE","SHELTER_INTAKE","NERO_ALERT"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:"3px 9px", fontSize:8, background: filter===f ? `${SEV_C[f]||P.violet}20` : "transparent",
                border:`1px solid ${filter===f ? (SEV_C[f]||P.violet) : P.b}`, borderRadius:20,
                color: filter===f ? (SEV_C[f]||P.violet) : P.t4, cursor:"pointer" }}>
              {f.replace(/_/g," ")}
            </button>
          ))}
          <button onClick={() => setDismissed(new Set())}
            style={{ marginLeft:"auto", padding:"3px 9px", fontSize:8, background:"transparent",
              border:`1px solid ${P.b}`, borderRadius:20, color:P.t4, cursor:"pointer" }}>
            Reset All
          </button>
        </div>

        {/* Alert list */}
        {visible.map((alert) => {
          const sc = SEV_C[alert.severity] || P.t4;
          return (
            <div key={alert.id} style={{ background:P.card, border:`1px solid ${sc}30`,
              borderLeft:`5px solid ${sc}`, borderRadius:9, padding:"10px 14px", marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", gap:7, alignItems:"center", marginBottom:4, flexWrap:"wrap" }}>
                    <span style={{ fontSize:12 }}>{TYPE_IC[alert.type]}</span>
                    <span style={{ fontSize:10, fontWeight:800, color:sc }}>{alert.title}</span>
                    <span style={{ fontSize:7, background:`${sc}15`, border:`1px solid ${sc}25`, color:sc,
                      borderRadius:20, padding:"1px 7px", fontWeight:700 }}>{alert.severity}</span>
                    {alert.autoFix && (
                      <span style={{ fontSize:7, background:`${P.teal}15`, border:`1px solid ${P.teal}25`, color:P.teal,
                        borderRadius:20, padding:"1px 7px" }}>⚡ AUTO-FIX</span>
                    )}
                    <span style={{ fontSize:7, color:P.t4 }}>{alert.caseRef}</span>
                  </div>
                  <div style={{ fontSize:9, color:P.t2, lineHeight:1.6, marginBottom:5 }}>{alert.body}</div>
                  <div style={{ fontSize:8, color:sc, fontWeight:700 }}>→ Action: {alert.action}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:5, flexShrink:0, alignItems:"flex-end" }}>
                  <span style={{ fontSize:7, color:P.t4 }}>{alert.timestamp.toLocaleTimeString()}</span>
                  <button onClick={() => sendToCHC(alert)} disabled={sendingAlert===alert.id||sentAlerts.has(alert.id)}
                    style={{ padding:"3px 8px", background: sentAlerts.has(alert.id)?`${P.teal}15`:`${P.amber}12`,
                      border:`1px solid ${sentAlerts.has(alert.id)?P.teal:P.amber}30`,
                      borderRadius:4, color: sentAlerts.has(alert.id)?P.teal:P.amber, fontSize:7, cursor:"pointer", marginBottom:3 }}>
                    {sendingAlert===alert.id?"⟳":sentAlerts.has(alert.id)?"✓ Sent":"📧 Alert"}
                  </button>
                  <button onClick={() => setDismissed(d => new Set([...d, alert.id]))}
                    style={{ padding:"3px 8px", background:"transparent", border:`1px solid ${P.b}`,
                      borderRadius:4, color:P.t4, fontSize:7, cursor:"pointer" }}>
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {visible.length === 0 && (
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:9, padding:"20px",
            textAlign:"center", color:P.t4, fontSize:9 }}>
            ✓ No active alerts for selected filter
          </div>
        )}
      </>}

      {view === "live" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ background:P.card, border:`1px solid ${P.red}30`, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:9, fontWeight:700, color:P.gold, letterSpacing:2, marginBottom:10 }}>🏛️ CHC BRIEFING STATUS — MAY 18, 2026</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:8 }}>
              {[
                {l:"DCAS Evidence Package", pct:97, c:P.teal, status:"READY"},
                {l:"6 CB-HSIVF Case Files", pct:92, c:P.gold, status:"READY"},
                {l:"NERO Scores Compiled", pct:95, c:P.violet, status:"READY"},
                {l:"VA BIRLS Records", pct:0, c:P.red, status:"BLOCKED — 83d OVERDUE"},
                {l:"DHS ENFORCE Crosswalk", pct:0, c:P.red, status:"BLOCKED — 66d OVERDUE"},
                {l:"BISG Statistical Package", pct:100, c:P.teal, status:"READY"},
                {l:"Legislative Asks Drafted", pct:100, c:P.teal, status:"READY"},
                {l:"SHA-256 Evidence Chain", pct:100, c:P.teal, status:"CERTIFIED"},
              ].map((r,i)=>(
                <div key={i} style={{ background:"#080D18", border:`1px solid ${r.c}20`, borderRadius:7, padding:"8px 10px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:8, color:r.pct===0?P.red:P.t2 }}>{r.l}</span>
                    <span style={{ fontSize:6, background:`${r.c}15`, border:`1px solid ${r.c}25`, color:r.c, borderRadius:20, padding:"1px 6px", fontWeight:700 }}>{r.status}</span>
                  </div>
                  <div style={{ background:"#030508", borderRadius:3, height:5, overflow:"hidden" }}>
                    <div style={{ width:`${r.pct}%`, height:"100%", background:r.c, borderRadius:3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:P.card, border:`1px solid ${P.amber}30`, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:9, fontWeight:700, color:P.amber, letterSpacing:2, marginBottom:8 }}>⚡ IMMEDIATE ACTIONS REQUIRED</div>
            {[
              {action:"Call VA SAOF:",detail:"1-877-750-3639 — F001 is 83 days overdue",c:P.red},
              {action:"Email ICE FOIA:",detail:"foia.ice@dhs.gov — F002 is 66 days overdue",c:P.red},
              {action:"File CHC Inquiry Letter:",detail:"Request DHS/VA Secretary response within 10 days",c:P.amber},
              {action:"Finalize BISG Package:",detail:"Export τ=0.40 sweep results for congressional distribution",c:P.gold},
            ].map((a,i)=>(
              <div key={i} style={{ fontSize:9, color:P.t2, padding:"6px 0", borderBottom:`1px solid ${P.b}20` }}>
                <span style={{ color:a.c, fontWeight:700, marginRight:6 }}>{a.action}</span>{a.detail}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "rules" && (
        <div>
          <div style={{ fontSize:9, color:P.t3, marginBottom:10 }}>
            Alert rules automatically monitor system state and trigger notifications. Toggle rules on/off below.
          </div>
          {rules.map(rule => (
            <div key={rule.id} style={{ background:P.card, border:`1px solid ${rule.active?P.teal+"40":P.b}`,
              borderLeft:`4px solid ${rule.active?P.teal:P.b}`, borderRadius:9, padding:"10px 14px", marginBottom:7,
              display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, fontWeight:700, color:rule.active?P.teal:P.t3, marginBottom:3 }}>{rule.name}</div>
                <div style={{ fontSize:8, color:P.t4, marginBottom:2 }}>Trigger: {rule.trigger}</div>
                <div style={{ fontSize:8, color:rule.active?P.gold:P.t4 }}>→ {rule.action}</div>
              </div>
              <button onClick={() => toggleRule(rule.id)}
                style={{ padding:"5px 12px", background: rule.active ? `${P.teal}18` : "transparent",
                  border:`1px solid ${rule.active?P.teal:P.b}`, borderRadius:6,
                  color: rule.active ? P.teal : P.t4, fontSize:8, fontWeight:700, cursor:"pointer" }}>
                {rule.active ? "● ON" : "○ OFF"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}