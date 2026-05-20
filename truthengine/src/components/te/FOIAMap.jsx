import { useState } from "react";
import { P } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

const FOIA_AGENCIES = [
  {
    id:"F001", agency:"VA — Veterans Affairs SAOF",
    city:"Washington DC", state:"DC", lat:38.9, lng:-77.0,
    filed:"2025-09-15", due:"2025-11-14", daysOverdue:83,
    status:"OVERDUE", priority:"CRITICAL",
    contact:"1-877-750-3639", email:"vacofoiaservice@va.gov",
    requestSummary:"BIRLS veteran identification database — Hispanic surname crosswalk",
    blockedData:"VA veteran status flags for 58,220 DCAS records",
    chcImpact:"Blocks veteran verification for all 6 CB-HSIVF cases",
    escalationPath:["VA SAOF direct call","VA Secretary letter","CHC formal inquiry","Senate Veterans Affairs Committee"],
    color:P.red,
  },
  {
    id:"F002", agency:"DHS/ICE — FOIA Office",
    city:"Washington DC", state:"DC", lat:38.89, lng:-77.05,
    filed:"2025-10-15", due:"2025-12-14", daysOverdue:66,
    status:"OVERDUE", priority:"CRITICAL",
    contact:"foia.ice@dhs.gov", email:"foia.ice@dhs.gov",
    requestSummary:"ENFORCE/IDENT deportation database — veteran flag crosswalk 1996–2025",
    blockedData:"ICE deportation records cross-referenced with DoD service records",
    chcImpact:"Blocks NERO-O score validation; DHS data gap persists",
    escalationPath:["Email foia.ice@dhs.gov","DHS Privacy Office","CHC inquiry letter","House Homeland Security subpoena"],
    color:P.red,
  },
  {
    id:"F003", agency:"INAI — Mexico Transparency",
    city:"Mexico City", state:"MEX", lat:19.43, lng:-99.13,
    filed:"2025-11-01", due:"2026-01-01", daysOverdue:0,
    status:"PENDING", priority:"HIGH",
    contact:"infomex@inai.org.mx", email:"infomex@inai.org.mx",
    requestSummary:"COMAR / SEDENA shelter data — veteran identification at Mexican border shelters",
    blockedData:"Mexican government veteran identification at TJ, Juárez, Nogales shelters",
    chcImpact:"Blocks international case count verification",
    escalationPath:["INAI online portal","SEDENA direct request","US Embassy diplomatic channel","LULAC Mexico liaison"],
    color:P.amber,
  },
  {
    id:"F004", agency:"NARA — National Archives",
    city:"College Park", state:"MD", lat:38.99, lng:-76.95,
    filed:"PLANNED", due:"2026-05-01", daysOverdue:0,
    status:"PLANNED", priority:"HIGH",
    contact:"inquire@nara.gov", email:"inquire@nara.gov",
    requestSummary:"1960s surname file NA-14021 — BISG validation dataset",
    blockedData:"Full Hispanic surname prevalence data for BISG calibration",
    chcImpact:"Would strengthen BISG estimate confidence to ±1,400 (vs ±2,309 current)",
    escalationPath:["Form NA-14021 submission","NARA special access request","Congressional research request"],
    color:P.blue,
  },
  {
    id:"F005", agency:"DoD DMDC — Defense Manpower",
    city:"Seaside", state:"CA", lat:36.61, lng:-121.83,
    filed:"PLANNED", due:"2026-06-01", daysOverdue:0,
    status:"PLANNED", priority:"MED",
    contact:"dmdc.osd.mil", email:"dmdc.foia@mail.mil",
    requestSummary:"Active duty non-citizen veteran records 1964–1975 — service/citizenship crosswalk",
    blockedData:"DoD service records cross-referenced with naturalization records",
    chcImpact:"Validates INA §329 wartime naturalization compliance rate",
    escalationPath:["DMDC FOIA online portal","DoD IG referral if non-responsive"],
    color:P.violet,
  },
];

const STATUS_C = { OVERDUE:"#FF3B3B", PENDING:P.amber, PLANNED:P.blue };
const PRIORITY_C = { CRITICAL:P.red, HIGH:P.amber, MED:P.blue };

// Simple SVG map of USA + Mexico region
function USMexMap({ agencies, selected, onSelect }) {
  const toSvg = (lat, lng) => ({
    x: ((lng + 130) / 75) * 700,
    y: ((55 - lat) / 40) * 340,
  });

  return (
    <svg viewBox="0 0 700 340" style={{ width:"100%", height:340, background:"#020609", borderRadius:10 }}>
      {/* Grid lines */}
      {[...Array(7)].map((_,i)=>(
        <line key={`v${i}`} x1={i*100} y1={0} x2={i*100} y2={340} stroke={P.b} strokeWidth={0.5} opacity={0.3} />
      ))}
      {[...Array(4)].map((_,i)=>(
        <line key={`h${i}`} x1={0} y1={i*85} x2={700} y2={i*85} stroke={P.b} strokeWidth={0.5} opacity={0.3} />
      ))}

      {/* US outline (simplified polygon) */}
      <polygon
        points="80,60 680,60 680,60 650,120 640,160 580,180 520,190 480,210 440,240 400,250 350,260 300,255 250,250 200,240 160,220 120,200 90,180 70,140 65,100"
        fill={`${P.blue}06`} stroke={P.blue} strokeWidth={0.8} opacity={0.5} />

      {/* Mexico outline (simplified) */}
      <polygon
        points="120,200 200,240 300,255 350,260 400,250 440,240 480,210 460,280 440,320 380,330 320,335 260,330 200,310 150,290 120,260 100,230"
        fill={`${P.teal}04`} stroke={P.teal} strokeWidth={0.6} opacity={0.4} />

      {/* Border line */}
      <line x1={120} y1={200} x2={480} y2={210} stroke={P.red} strokeWidth={1.5} strokeDasharray="5,4" opacity={0.5} />
      <text x={290} y={206} fill={P.red} fontSize={6} textAnchor="middle" opacity={0.7}>US/Mexico Border</text>

      {/* Labels */}
      <text x={350} y={130} fill={P.t4} fontSize={9} textAnchor="middle" opacity={0.4}>UNITED STATES</text>
      <text x={300} y={305} fill={P.t4} fontSize={8} textAnchor="middle" opacity={0.3}>MEXICO</text>

      {/* Agency pins */}
      {agencies.map(a => {
        const pos = toSvg(a.lat, a.lng);
        const isSel = selected?.id === a.id;
        const sc = STATUS_C[a.status];
        return (
          <g key={a.id} onClick={() => onSelect(isSel ? null : a)} style={{ cursor:"pointer" }}>
            {/* Pulse ring */}
            {a.status === "OVERDUE" && (
              <circle cx={pos.x} cy={pos.y} r={isSel?22:16} fill={sc} opacity={0.08} />
            )}
            {/* Pin body */}
            <circle cx={pos.x} cy={pos.y} r={isSel?9:7} fill={sc} opacity={0.85}
              stroke={isSel?"#fff":sc} strokeWidth={isSel?2:1} />
            {/* ID label */}
            <text x={pos.x} y={pos.y+0.5} textAnchor="middle" dominantBaseline="middle"
              fill="#fff" fontSize={5} fontWeight="bold">{a.id}</text>
            {/* Agency name */}
            {isSel && (
              <text x={pos.x} y={pos.y+16} textAnchor="middle" fill={sc} fontSize={6} fontWeight="bold">
                {a.agency.split("—")[0].trim()}
              </text>
            )}
            {/* Overdue badge */}
            {a.daysOverdue > 0 && (
              <g>
                <circle cx={pos.x+8} cy={pos.y-8} r={6} fill={P.red} />
                <text x={pos.x+8} y={pos.y-7.5} textAnchor="middle" dominantBaseline="middle"
                  fill="#fff" fontSize={4} fontWeight="bold">{a.daysOverdue}d</text>
              </g>
            )}
          </g>
        );
      })}

      {/* Legend */}
      <g transform="translate(10,10)">
        {[["OVERDUE",P.red],["PENDING",P.amber],["PLANNED",P.blue]].map(([s,c],i)=>(
          <g key={s} transform={`translate(0,${i*16})`}>
            <circle cx={6} cy={6} r={5} fill={c} opacity={0.85} />
            <text x={15} y={10} fill={P.t3} fontSize={8}>{s}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

export default function FOIAMap() {
  const [selected, setSelected] = useState(FOIA_AGENCIES[0]);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draft, setDraft] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const overdue = FOIA_AGENCIES.filter(a => a.daysOverdue > 0);
  const totalOverdueDays = FOIA_AGENCIES.reduce((a,f)=>a+f.daysOverdue,0);

  const generateEscalation = async () => {
    if (!selected) return;
    setDraftLoading(true);
    setDraft(null);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Draft a formal FOIA escalation letter for the AUMER Foundation to ${selected.agency}.

Context:
- FOIA ID: ${selected.id}
- Request Summary: ${selected.requestSummary}
- Filed: ${selected.filed}
- Statutory Due: ${selected.due}
- Days Overdue: ${selected.daysOverdue > 0 ? selected.daysOverdue + " DAYS OVERDUE" : "Not yet overdue — proactive letter"}
- Blocked Data: ${selected.blockedData}
- CHC Impact: ${selected.chcImpact}
- CHC Briefing: May 18, 2026 (39 days away)
- Contact: ${selected.email}

Write a 3-paragraph formal escalation letter:
1. Reference the original request, statutory deadline, and current overdue status
2. Explain the urgency — CHC congressional briefing, veteran deportation evidence, humanitarian stakes
3. Demand specific response within 10 business days, reference 5 USC §552(a)(6)(B)

Tone: formal, urgent, legally precise. Under 250 words. Include subject line.`,
      model: "claude_sonnet_4_6",
    });
    setDraft(res);
    setDraftLoading(false);
  };

  const sendAlert = async () => {
    if (!draft || !selected) return;
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to:"gtarce@usc.edu",
      subject:`[TE360 FOIA ESCALATION] ${selected.id} — ${selected.agency}`,
      body:`FOIA Escalation Draft — ${selected.agency}\nStatus: ${selected.status} (${selected.daysOverdue}d overdue)\n\n${draft}`,
    });
    setSent(true);
    setSending(false);
  };

  return (
    <div>
      {/* Header stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:7, marginBottom:10 }}>
        {[
          { l:"Total Requests",  v:FOIA_AGENCIES.length, c:P.blue },
          { l:"Overdue",         v:overdue.length,        c:P.red },
          { l:"Total Overdue",   v:`${totalOverdueDays}d`,c:P.red },
          { l:"Pending",         v:FOIA_AGENCIES.filter(a=>a.status==="PENDING").length, c:P.amber },
          { l:"Planned",         v:FOIA_AGENCIES.filter(a=>a.status==="PLANNED").length, c:P.blue },
          { l:"CHC Blocking",    v:overdue.length,        c:P.gold },
        ].map((s,i)=>(
          <div key={i} style={{ background:P.card, border:`1px solid ${s.c}25`, borderLeft:`3px solid ${s.c}`, borderRadius:7, padding:"7px 10px" }}>
            <div style={{ fontSize:6, color:P.t4, marginBottom:1 }}>{s.l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:10 }}>
        {/* Left: Map + Agency list */}
        <div>
          <USMexMap agencies={FOIA_AGENCIES} selected={selected} onSelect={setSelected} />

          {/* Agency list */}
          <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:6 }}>
            {FOIA_AGENCIES.map(a => {
              const isSel = selected?.id === a.id;
              return (
                <div key={a.id} onClick={()=>setSelected(isSel?null:a)}
                  style={{ background:isSel?`${a.color}10`:P.card,
                    border:`1px solid ${isSel?a.color+"50":P.b+"40"}`,
                    borderLeft:`5px solid ${STATUS_C[a.status]}`,
                    borderRadius:8, padding:"8px 12px", cursor:"pointer" }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, fontWeight:800,
                        color:STATUS_C[a.status], background:`${STATUS_C[a.status]}18`, borderRadius:4,
                        padding:"1px 7px", border:`1px solid ${STATUS_C[a.status]}30` }}>{a.id}</span>
                      <div>
                        <div style={{ fontSize:9, fontWeight:700, color:P.t1 }}>{a.agency}</div>
                        <div style={{ fontSize:7, color:P.t3 }}>{a.city}, {a.state} · Filed: {a.filed}</div>
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:6, background:`${STATUS_C[a.status]}15`, border:`1px solid ${STATUS_C[a.status]}20`,
                        color:STATUS_C[a.status], borderRadius:20, padding:"1px 8px", fontWeight:700, marginBottom:2 }}>
                        {a.status}
                      </div>
                      {a.daysOverdue > 0 && (
                        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14, fontWeight:800, color:P.red }}>
                          {a.daysOverdue}d
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detail panel */}
        {selected && (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {/* Agency detail */}
            <div style={{ background:P.card, border:`1px solid ${STATUS_C[selected.status]}30`,
              borderTop:`3px solid ${STATUS_C[selected.status]}`, borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontSize:7, color:STATUS_C[selected.status], fontWeight:700, letterSpacing:2, marginBottom:6 }}>
                {selected.id} — {selected.status}
              </div>
              <div style={{ fontSize:12, fontWeight:800, color:P.t1, marginBottom:4 }}>{selected.agency}</div>
              <div style={{ fontSize:8, color:P.t3, marginBottom:10 }}>{selected.requestSummary}</div>

              {[
                ["Filed", selected.filed, P.t3],
                ["Due", selected.due, P.t3],
                ["Overdue", selected.daysOverdue > 0 ? `${selected.daysOverdue} DAYS` : "Not overdue", selected.daysOverdue>0?P.red:P.teal],
                ["Priority", selected.priority, PRIORITY_C[selected.priority]],
                ["Contact", selected.email, P.blue],
              ].map(([k,v,c])=>(
                <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:7,
                  padding:"4px 0", borderBottom:`1px solid ${P.b}20` }}>
                  <span style={{ color:P.t4 }}>{k}</span>
                  <span style={{ color:c, fontWeight:700, maxWidth:160, textAlign:"right", wordBreak:"break-all" }}>{v}</span>
                </div>
              ))}

              <div style={{ marginTop:8, padding:"6px 10px", background:`${P.red}10`, border:`1px solid ${P.red}15`, borderRadius:6 }}>
                <div style={{ fontSize:6, color:P.red, fontWeight:700, marginBottom:2 }}>CHC IMPACT</div>
                <div style={{ fontSize:7, color:P.t2 }}>{selected.chcImpact}</div>
              </div>
            </div>

            {/* Escalation path */}
            <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"10px 12px" }}>
              <div style={{ fontSize:7, color:P.t4, letterSpacing:2, marginBottom:6 }}>ESCALATION PATH</div>
              {selected.escalationPath.map((step,i)=>(
                <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:5 }}>
                  <div style={{ width:16, height:16, borderRadius:"50%", background:`${P.amber}20`,
                    border:`1px solid ${P.amber}30`, color:P.amber, fontSize:7, fontWeight:800,
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i+1}</div>
                  <span style={{ fontSize:7, color:P.t2, lineHeight:1.5 }}>{step}</span>
                </div>
              ))}
            </div>

            {/* AI escalation draft */}
            <div style={{ background:P.card, border:`1px solid ${P.violet}20`, borderRadius:10, padding:"10px 12px" }}>
              <div style={{ fontSize:7, color:P.violet, fontWeight:700, letterSpacing:2, marginBottom:6 }}>AI ESCALATION LETTER</div>
              {draft ? (
                <div>
                  <pre style={{ fontSize:7, color:P.t2, lineHeight:1.8, whiteSpace:"pre-wrap",
                    fontFamily:"'IBM Plex Mono',monospace", maxHeight:220, overflowY:"auto", margin:0 }}>
                    {draft}
                  </pre>
                  <div style={{ display:"flex", gap:6, marginTop:8 }}>
                    <button onClick={sendAlert} disabled={sending||sent}
                      style={{ flex:1, padding:"6px", background:sent?`${P.teal}15`:`${P.amber}15`,
                        border:`1px solid ${sent?P.teal:P.amber}30`, color:sent?P.teal:P.amber,
                        borderRadius:6, fontSize:8, fontWeight:700, cursor:"pointer" }}>
                      {sending?"⟳ Sending...":sent?"✓ Sent to USC":"📧 Send to Research Lead"}
                    </button>
                    <button onClick={()=>setDraft(null)}
                      style={{ padding:"6px 10px", background:"transparent", border:`1px solid ${P.b}`,
                        color:P.t4, borderRadius:6, fontSize:7, cursor:"pointer" }}>✕</button>
                  </div>
                </div>
              ) : (
                <button onClick={generateEscalation} disabled={draftLoading}
                  style={{ width:"100%", padding:"8px", background:draftLoading?P.b:`linear-gradient(135deg,${P.violet},${P.blue})`,
                    color:draftLoading?P.t4:"#fff", border:"none", borderRadius:7, fontSize:9, fontWeight:800,
                    cursor:draftLoading?"not-allowed":"pointer" }}>
                  {draftLoading?"⟳ Drafting...":"✨ Draft AI Escalation Letter"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}