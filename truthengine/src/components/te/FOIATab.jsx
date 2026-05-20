import { useState, useEffect } from "react";
import { P, FOIA_REQUESTS } from "../../lib/teData";

export default function FOIATab() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const totalOverdue = FOIA_REQUESTS.filter(r => r.status.includes("OVERDUE")).length;
  const totalDays = FOIA_REQUESTS.reduce((a,r) => a + r.daysOverdue, 0);

  return (
    <div style={{ padding:"14px 20px", overflowY:"auto", height:"calc(100vh - 110px)" }}>

      {/* Alert banner */}
      <div style={{ background:"#FF5C5C08", border:"1px solid #FF5C5C30", borderLeft:"4px solid "+P.red,
        borderRadius:9, padding:"10px 14px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:10, fontWeight:800, color:P.red, marginBottom:2 }}>⚠ {totalOverdue} FOIA REQUESTS OVERDUE — IMMEDIATE ACTION REQUIRED</div>
          <div style={{ fontSize:8, color:P.t3 }}>Combined {totalDays} days past deadline. VA BIRLS and DHS/ENFORCE are Congressional-grade blockers.</div>
        </div>
        <div style={{ textAlign:"center", flexShrink:0 }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:22, fontWeight:800, color:P.red }}>{totalDays}</div>
          <div style={{ fontSize:7, color:P.t4 }}>Total Days Overdue</div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:14 }}>
        {[
          { l:"Total Requests", v:FOIA_REQUESTS.length, c:P.blue },
          { l:"Overdue", v:totalOverdue, c:P.red },
          { l:"Pending", v:FOIA_REQUESTS.filter(r=>r.status==="PENDING").length, c:P.amber },
          { l:"Days Overdue (Total)", v:totalDays, c:P.red },
        ].map((s,i) => (
          <div key={i} style={{ background:P.card, border:"1px solid "+s.c+"25", borderTop:"2px solid "+s.c, borderRadius:7, padding:"8px 12px", textAlign:"center" }}>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:800, color:s.c }}>{s.v}</div>
            <div style={{ fontSize:7, color:P.t4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* FOIA Requests */}
      {FOIA_REQUESTS.map((r, i) => {
        const isOverdue = r.status.includes("OVERDUE");
        const dueDate = new Date(r.due);
        const daysLeft = Math.ceil((dueDate - now) / 86400000);
        return (
          <div key={r.id} style={{ background:P.card, border:"1px solid "+(isOverdue?P.red+"40":P.amber+"30"),
            borderLeft:"5px solid "+r.color, borderRadius:10, padding:"14px 16px", marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, marginBottom:8 }}>
              <div>
                <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:3, flexWrap:"wrap" }}>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:P.t4 }}>{r.id}</span>
                  <span style={{ fontSize:12, fontWeight:800, color:P.t1 }}>{r.agency}</span>
                  <span style={{ fontSize:7, background:r.color+"18", border:"1px solid "+r.color+"40",
                    color:r.color, borderRadius:20, padding:"1px 8px", fontWeight:800 }}>{r.status}</span>
                </div>
                <div style={{ fontSize:9, color:P.t3, marginBottom:2 }}>{r.desc}</div>
              </div>
              <div style={{ textAlign:"center", flexShrink:0 }}>
                {isOverdue ? (
                  <>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:20, fontWeight:800, color:P.red }}>{r.daysOverdue}</div>
                    <div style={{ fontSize:7, color:P.t4 }}>days over</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:20, fontWeight:800, color:P.amber }}>{daysLeft}</div>
                    <div style={{ fontSize:7, color:P.t4 }}>days left</div>
                  </>
                )}
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, fontSize:8, marginBottom:10 }}>
              <div><span style={{ color:P.t4 }}>Filed: </span><span style={{ fontFamily:"'IBM Plex Mono',monospace", color:P.t2 }}>{r.filed}</span></div>
              <div><span style={{ color:P.t4 }}>Due: </span><span style={{ fontFamily:"'IBM Plex Mono',monospace", color:r.color }}>{r.due}</span></div>
              <div><span style={{ color:P.t4 }}>Status: </span><span style={{ color:r.color, fontWeight:700 }}>{r.status}</span></div>
            </div>

            {/* Action button */}
            <div style={{ background:"#080D18", border:"1px solid "+r.color+"20", borderRadius:6, padding:"8px 10px",
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <span style={{ fontSize:8, fontWeight:700, color:r.color }}>⚡ ACTION: </span>
                <span style={{ fontSize:8, color:P.t2 }}>{r.action}</span>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                {r.contact && (
                  <a href={`tel:${r.contact}`} style={{ fontSize:8, background:P.red+"18", border:"1px solid "+P.red+"30",
                    color:P.red, borderRadius:4, padding:"3px 8px", textDecoration:"none", fontFamily:"'IBM Plex Mono',monospace" }}>
                    📞 {r.contact}
                  </a>
                )}
                {r.email && (
                  <a href={`mailto:${r.email}`} style={{ fontSize:8, background:P.amber+"18", border:"1px solid "+P.amber+"30",
                    color:P.amber, borderRadius:4, padding:"3px 8px", textDecoration:"none", fontFamily:"'IBM Plex Mono',monospace" }}>
                    ✉ {r.email}
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* CHC Escalation */}
      <div style={{ background:"#9D7BFF08", border:"1px solid #9D7BFF30", borderRadius:10, padding:"12px 14px" }}>
        <div style={{ fontSize:10, fontWeight:700, color:P.violet, marginBottom:5 }}>💡 CHC INQUIRY OPTION — Escalation Path</div>
        <div style={{ fontSize:9, color:P.t2, lineHeight:1.8 }}>
          Congressional Hispanic Caucus inquiry can force DHS/ICE and VA responses within 30 days. File CHC inquiry for F001 (VA BIRLS) and F002 (DHS ENFORCE) before May 18 briefing.
          Contact CHC office through member representatives. Required evidence: all 6 CB-HSIVF certified cases + DCAS 349 anomaly brief.
        </div>
      </div>
    </div>
  );
}