import { useState, useEffect } from "react";
import { P, FOIA_REQUESTS } from "../../lib/teData";

const CHC_DATE = new Date("2026-05-18");
const TODAY = new Date();

const FOIA_TIMELINE = [
  { date:"Oct 15, 2025", event:"VA BIRLS Filed", case:"F001", c:P.amber },
  { date:"Nov 1, 2025", event:"DHS ENFORCE Filed", case:"F002", c:P.amber },
  { date:"Dec 15, 2025", event:"INAI Mexico Filed", case:"F003", c:P.amber },
  { date:"Jan 15, 2026", event:"VA BIRLS — 20-day acknowledgment due", case:"F001", c:P.amber },
  { date:"Jan 15, 2026", event:"USCIS Filed", case:"F004", c:P.blue },
  { date:"Feb 1, 2026", event:"DHS ENFORCE — 20-day due — NO RESPONSE", case:"F002", c:P.red },
  { date:"Feb 1, 2026", event:"DoD DMDC Filed", case:"F005", c:P.blue },
  { date:"Feb 22, 2026", event:"INAI Mexico — 45-day due — NO RESPONSE", case:"F003", c:P.red },
  { date:"Apr 8, 2026", event:"TODAY — DHS 66 days / VA 83 days overdue", case:"ALL", c:P.red },
  { date:"Apr 20, 2026", event:"Calendar: DHS FOIA action required", case:"F002", c:P.red },
  { date:"Apr 30, 2026", event:"USCIS Deadline", case:"F004", c:P.amber },
  { date:"May 18, 2026", event:"CHC Briefing — FOIA data needed", case:"ALL", c:P.gold },
  { date:"May 30, 2026", event:"DoD DMDC Deadline", case:"F005", c:P.amber },
];

const LEVERAGE_OPTIONS = [
  { label:"CHC Inquiry", agency:"DHS/ICE + VA", power:"HIGH", desc:"Congressional Hispanic Caucus inquiry forces 30-day response. File before May 1 to receive data before May 18 CHC briefing.", action:"Contact CHC office through member representative", c:P.gold },
  { label:"Judicial Watch Precedent", agency:"DHS/ICE", power:"MED", desc:"Multiple Judicial Watch FOIA wins against ICE for ENFORCE database. File motion citing JW v. DHS (D.D.C. 2019).", action:"File FOIA lawsuit — 30-day expedite possible", c:P.blue },
  { label:"Ombudsman Escalation", agency:"VA BIRLS", power:"HIGH", desc:"VA FOIA Public Liaison is required by 5 USC §552(l). Request escalation to Senior Agency Official for FOIA.", action:"Call 1-877-750-3639 — ask for SAOF escalation", c:P.teal },
  { label:"Media Pressure", agency:"All agencies", power:"MED", desc:"AP News / Military Times coverage of FOIA denials triggers political accountability. Coordinate with Tab 5 media crawlers.", action:"Brief AP News on FOIA status before CHC", c:P.violet },
  { label:"COMAR Diplomatic Channel", agency:"INAI Mexico", power:"HIGH", desc:"COMAR has bilateral channel with SEGOB. Re-file INAI request through COMAR — diplomatic pathway bypasses standard queue.", action:"Contact COMAR director — re-file via SEGOB channel", c:P.orange },
];

const Bar = ({ v, max, c, h=10 }) => (
  <div style={{ background:"#080D18", borderRadius:3, height:h, overflow:"hidden" }}>
    <div style={{ width:Math.min(100, v/max*100)+"%", height:"100%", background:c, borderRadius:3, transition:"width .5s ease" }}/>
  </div>
);

export default function FOIAAnalytics() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);

  const chcDays = Math.ceil((CHC_DATE - now) / 86400000);
  const totalOverdueDays = FOIA_REQUESTS.reduce((a,r) => a+r.daysOverdue, 0);
  const criticalCount = FOIA_REQUESTS.filter(r=>r.status.includes("OVERDUE")).length;

  return (
    <div>
      {/* Critical alert */}
      <div style={{ background:"#FF5C5C08", border:`2px solid ${P.red}30`, borderRadius:10, padding:"12px 16px", marginBottom:12,
        display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
        <div>
          <div style={{ fontSize:11, fontWeight:800, color:P.red, marginBottom:3 }}>🔴 {criticalCount} FOIA REQUESTS OVERDUE — CHC BRIEFING AT RISK</div>
          <div style={{ fontSize:9, color:P.t3 }}>
            {chcDays} days until CHC briefing. VA BIRLS and DHS ENFORCE are congressional-grade evidence blockers.
            Without these records, the 349 anomaly cannot be fully corroborated at the federal level.
          </div>
        </div>
        <div style={{ textAlign:"center", flexShrink:0 }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:28, fontWeight:800, color:P.red }}>{totalOverdueDays}</div>
          <div style={{ fontSize:7, color:P.t4 }}>total days overdue</div>
        </div>
      </div>

      {/* Analytics grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>

        {/* Request status tracker */}
        <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"12px 14px" }}>
          <div style={{ fontSize:8, color:P.t4, letterSpacing:2, fontWeight:700, marginBottom:9 }}>REQUEST STATUS TRACKER</div>
          {FOIA_REQUESTS.map((r,i) => {
            const dueDate = new Date(r.due);
            const daysLeft = Math.ceil((dueDate - now) / 86400000);
            const pct = r.daysOverdue > 0
              ? Math.min(100, (r.daysOverdue / 120) * 100)
              : Math.min(100, ((new Date(r.filed) - dueDate) / (now - dueDate)) * 100);
            return (
              <div key={i} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontSize:9, fontWeight:700, color:r.color }}>{r.agency}</span>
                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                    {r.daysOverdue > 0 ? (
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:P.red, fontWeight:800 }}>+{r.daysOverdue}d OVER</span>
                    ) : (
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:P.amber }}>{daysLeft}d left</span>
                    )}
                  </div>
                </div>
                <Bar v={r.daysOverdue > 0 ? r.daysOverdue : 120-daysLeft} max={120} c={r.color} h={7}/>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:7, color:P.t4, marginTop:2 }}>
                  <span>Filed: {r.filed}</span>
                  <span>Due: {r.due}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Risk matrix */}
        <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"12px 14px" }}>
          <div style={{ fontSize:8, color:P.t4, letterSpacing:2, fontWeight:700, marginBottom:9 }}>CHC BRIEFING RISK MATRIX</div>
          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
            {[
              {label:"VA BIRLS data missing", risk:"HIGH", impact:"Cannot verify veteran status in 6 cases", c:P.red},
              {label:"DHS ENFORCE missing", risk:"HIGH", impact:"Deportation record crosswalk impossible", c:P.red},
              {label:"INAI Mexico missing", risk:"MED", impact:"Cross-border identity gap for 3 cases", c:P.amber},
              {label:"USCIS pending", risk:"LOW", impact:"Naturalization records gap — fillable from NARA", c:P.blue},
              {label:"DoD DMDC pending", risk:"LOW", impact:"DD-214 crosswalk from NARA partial substitute", c:P.blue},
            ].map((item,i) => (
              <div key={i} style={{ background:"#080D18", border:`1px solid ${item.c}20`, borderRadius:7, padding:"7px 10px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                  <span style={{ fontSize:9, fontWeight:700, color:item.c }}>{item.label}</span>
                  <span style={{ fontSize:7, background:`${item.c}18`, border:`1px solid ${item.c}30`, color:item.c, borderRadius:20, padding:"1px 6px" }}>{item.risk} RISK</span>
                </div>
                <div style={{ fontSize:8, color:P.t3 }}>{item.impact}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"12px 14px", marginBottom:12 }}>
        <div style={{ fontSize:8, color:P.t4, letterSpacing:2, fontWeight:700, marginBottom:9 }}>FOIA TIMELINE — FILED TO CHC BRIEFING</div>
        <div style={{ display:"flex", overflowX:"auto", gap:0, paddingBottom:4 }}>
          {FOIA_TIMELINE.map((ev,i) => (
            <div key={i} style={{ flexShrink:0, width:120, paddingRight:8 }}>
              <div style={{ display:"flex", alignItems:"center", marginBottom:5 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:ev.c, flexShrink:0 }}/>
                {i < FOIA_TIMELINE.length-1 && <div style={{ flex:1, height:1, background:P.b }}/>}
              </div>
              <div style={{ fontSize:7, color:ev.c, fontWeight:700, marginBottom:1 }}>{ev.date}</div>
              <div style={{ fontSize:7, color:P.t3, lineHeight:1.4 }}>{ev.event}</div>
              <div style={{ fontSize:6, color:P.t4, marginTop:1 }}>{ev.case}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Leverage options */}
      <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"12px 14px" }}>
        <div style={{ fontSize:8, color:P.gold, letterSpacing:2, fontWeight:700, marginBottom:9 }}>⚡ LEVERAGE OPTIONS — Fastest Path to Data</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:8 }}>
          {LEVERAGE_OPTIONS.map((lev,i) => (
            <div key={i} style={{ background:"#080D18", border:`1px solid ${lev.c}25`, borderLeft:`3px solid ${lev.c}`, borderRadius:8, padding:"9px 11px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:10, fontWeight:800, color:lev.c }}>{lev.label}</span>
                <span style={{ fontSize:7, background:`${lev.c}15`, border:`1px solid ${lev.c}25`, color:lev.c, borderRadius:20, padding:"1px 6px" }}>{lev.power}</span>
              </div>
              <div style={{ fontSize:7, color:P.t4, marginBottom:4 }}>Agency: {lev.agency}</div>
              <div style={{ fontSize:8, color:P.t3, lineHeight:1.6, marginBottom:5 }}>{lev.desc}</div>
              <div style={{ fontSize:8, color:lev.c, fontWeight:700 }}>→ {lev.action}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}