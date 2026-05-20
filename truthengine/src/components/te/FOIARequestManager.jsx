import { useState } from "react";
import { P } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

const ORG = {
  name: "AUMER Foundation",
  ein: "99-0495658",
  contact: "Gabriel T. Arce Jr.",
  email: "gtarce@usc.edu",
  phone: "(760) 453-8421",
  type: "501(c)(3)",
};

const MEXICO_REQUESTS = [
  {
    id:"M-001", title:"INM Repatriation Records — Deported Veterans",
    agency:"Instituto Nacional de Migración (INM), Secretaría de Gobernación",
    portal:"https://www.plataformadetransparencia.org.mx/",
    legalBasis:"Art. 6 LGTAIP; Art. 70 Fracción XLVIII",
    deadline:"20 business days from filing (Art. 132 LGTAIP)",
    week:"Week 1 (Apr 8–14)", priority:"CRITICAL", status:"DRAFT",
    language:"es",
    text:`Solicito información estadística agregada sobre ciudadanos deportados desde Estados Unidos que hayan sido identificados como veteranos militares de las Fuerzas Armadas de Estados Unidos, durante el periodo 2010-2026. Específicamente:

1) Número total de personas repatriadas con antecedentes de servicio militar estadounidense, desglosado por año.
2) Puerto de entrada en México (estado y municipio).
3) País de nacionalidad.
4) Estatus de canalización a albergues o programas de atención al migrante.
5) Información sobre cualquier protocolo o memorando existente para la identificación y atención de veteranos deportados.

Esta solicitud se refiere exclusivamente a datos estadísticos agregados, no a información personal identificable.`,
    color:P.red,
  },
  {
    id:"M-002", title:"COMAR Refugee Applications — Deported US Residents",
    agency:"Comisión Mexicana de Ayuda a Refugiados (COMAR)",
    portal:"https://www.plataformadetransparencia.org.mx/",
    legalBasis:"Ley General de Transparencia, LGTAIP",
    deadline:"20 business days from filing",
    week:"Week 1 (Apr 8–14)", priority:"CRITICAL", status:"DRAFT",
    language:"es",
    text:`Solicito estadísticas agregadas de solicitudes de refugio presentadas por personas deportadas de Estados Unidos ante COMAR, periodo 2018-2026:

1) Número de solicitudes por año y oficina de COMAR (Tapachula, CDMX, Tijuana, Monterrey, Palenque).
2) Nacionalidad del solicitante.
3) Motivo declarado de solicitud de refugio.
4) Estatus de resolución (aprobadas, denegadas, pendientes).
5) Existencia de protocolo específico para veteranos militares deportados.`,
    color:P.amber,
  },
  {
    id:"M-003", title:"CNB — Missing Deported Persons (RNPDNO)",
    agency:"Comisión Nacional de Búsqueda (CNB), Secretaría de Gobernación",
    portal:"https://www.plataformadetransparencia.org.mx/",
    legalBasis:"Ley General de Transparencia, LGTAIP",
    deadline:"20 business days from filing",
    week:"Week 2 (Apr 15–21)", priority:"HIGH", status:"DRAFT",
    language:"es",
    text:`Solicito información sobre el Registro Nacional de Personas Desaparecidas y No Localizadas (RNPDNO) en relación con personas deportadas de Estados Unidos, periodo 2015-2026:

1) Número de reportes de personas desaparecidas que fueron deportadas de EE.UU.
2) Desglose por entidad federativa de última ubicación conocida.
3) Estatus de búsqueda (activa, localizada con vida, localizada sin vida, archivada).
4) Coordinación con autoridades estadounidenses para identificación.
5) Protocolos de intercambio de datos con IOM/ACNUR sobre migrantes desaparecidos.`,
    color:P.violet,
  },
  {
    id:"M-004", title:"Secretaría de Salud — Healthcare for Deported Persons (CLUES)",
    agency:"Secretaría de Salud, Dirección General de Información en Salud (DGIS)",
    portal:"https://www.plataformadetransparencia.org.mx/",
    legalBasis:"Ley General de Transparencia, LGTAIP",
    deadline:"20 business days from filing",
    week:"Week 2 (Apr 15–21)", priority:"HIGH", status:"DRAFT",
    language:"es",
    text:`Solicito datos estadísticos del sistema CLUES sobre unidades de salud que atienden a población migrante deportada en los estados fronterizos (Baja California, Sonora, Chihuahua, Coahuila, Nuevo León, Tamaulipas), periodo 2020-2026:

1) Número de atenciones médicas a personas deportadas en hospitales públicos, por entidad.
2) Principales diagnósticos de esta población.
3) Programas de salud mental para población deportada.
4) Datos de SEMEFO sobre restos no identificados en zona fronteriza con posible vínculo a deportación.`,
    color:P.teal,
  },
  {
    id:"M-005", title:"SRE — Consular Assistance to Deported Veterans",
    agency:"Secretaría de Relaciones Exteriores (SRE)",
    portal:"https://www.plataformadetransparencia.org.mx/",
    legalBasis:"Ley General de Transparencia, LGTAIP",
    deadline:"20 business days from filing",
    week:"Week 2 (Apr 15–21)", priority:"HIGH", status:"DRAFT",
    language:"es",
    text:`Solicito información sobre asistencia consular proporcionada a veteranos militares estadounidenses deportados, periodo 2015-2026:

1) Número de casos atendidos por la red consular de México en EE.UU. relacionados con veteranos enfrentando procedimientos de deportación.
2) Acciones de la Dirección General de Protección a Mexicanos en el Exterior en favor de veteranos deportados.
3) Acuerdos bilaterales o memoranda de entendimiento con el Departamento de Asuntos de Veteranos (VA) de EE.UU.
4) Datos del programa UNAM Acción Migrante relacionados con veteranos.`,
    color:P.blue,
  },
];

const US_REQUESTS = [
  {
    id:"US-001", title:"ICE ENFORCE/EARM — Military Veteran Flag Records",
    agency:"DHS/ICE Enforcement and Removal Operations (FOIA supplement to F002)",
    portal:"https://www.ice.gov/foia",
    legalBasis:"5 U.S.C. § 552 (FOIA); 6 C.F.R. 5.5(e)(1)(ii) expedited processing",
    deadline:"20 business days (expedited request filed)",
    week:"Week 1 (Apr 8–14)", priority:"CRITICAL", status:"DRAFT",
    language:"en",
    text:`Pursuant to FOIA, 5 U.S.C. § 552, I request the following records from ICE Enforcement and Removal Operations:

1) All records in the ENFORCE/EARM database containing a flag, notation, or field indicating the subject served in any branch of the United States Armed Forces, for the period January 1, 1996 to present.
2) For each such record: alien number (A-number), country of removal, date of removal, criminal charge category (if any), and area of responsibility (AOR) of the arresting field office.
3) Any internal memoranda, policy guidance, or training materials regarding the identification of military veterans during removal proceedings.
4) Records from the ICE Detainer database (LESC) indicating detainer requests issued against individuals flagged as military veterans.

I request expedited processing under 6 C.F.R. 5.5(e)(1)(ii) as this information is urgently needed for a Congressional briefing scheduled for May 18, 2026, before the Congressional Hispanic Caucus.

Fee waiver requested under 5 U.S.C. § 552(a)(4)(A)(iii) — AUMER Foundation is a 501(c)(3) nonprofit research organization (EIN 99-0495658).`,
    color:P.red,
  },
  {
    id:"US-002", title:"FBI NCIC — Protection Order File / Deported Individuals",
    agency:"FBI Criminal Justice Information Services (CJIS) Division",
    portal:"https://www.fbi.gov/services/cjis/foia",
    legalBasis:"5 U.S.C. § 552 (FOIA)",
    deadline:"20 business days",
    week:"Week 3 (Apr 22–28)", priority:"MEDIUM", status:"DRAFT",
    language:"en",
    text:`Pursuant to FOIA, I request aggregate statistical data regarding the Protection Order File (POF) within the National Crime Information Center (NCIC):

1) Total number of active protection orders in the POF where the subject has a concurrent record in the Immigration Violator File or is flagged for removal proceedings, FY2020–present.
2) Number of protection order records where the subject was subsequently deported, by year and state of issuance.
3) Any policy guidance regarding the handling of protection orders when the protected person or the respondent is subject to immigration enforcement action.

This request seeks only aggregate data, not personally identifiable information.

Fee waiver requested under 5 U.S.C. § 552(a)(4)(A)(iii) — AUMER Foundation is a 501(c)(3) nonprofit (EIN 99-0495658).`,
    color:P.amber,
  },
  {
    id:"US-003", title:"DOJ SMART Office — NSOPW Deported Sex Offender Data",
    agency:"DOJ Office of Sex Offender Sentencing, Monitoring, Apprehending, Registering, and Tracking (SMART)",
    portal:"https://www.justice.gov/foia",
    legalBasis:"5 U.S.C. § 552 (FOIA)",
    deadline:"20 business days",
    week:"Week 3 (Apr 22–28)", priority:"MEDIUM", status:"DRAFT",
    language:"en",
    text:`Pursuant to FOIA, I request:

1) Aggregate statistics on registered sex offenders who have been deported from the United States, by year, state of registration, and tier classification (I, II, or III under SORNA), FY2010–present.
2) Any interagency agreements between the SMART Office and DHS/ICE regarding notification protocols when a registered sex offender is removed from the United States.
3) Data on whether deported sex offenders are tracked in NSOPW after removal, and what mechanism exists for notification to the receiving country.

Fee waiver requested — AUMER Foundation 501(c)(3), EIN 99-0495658.`,
    color:P.violet,
  },
];

const TIMELINE = [
  { week:"Week 1", dates:"Apr 8–14", items:["File M-001 (INM)","File M-002 (COMAR)","File US-001 (ICE ENFORCE supplement)","Send UNI-001 (SUDIMER)","Send UNI-002 (COLEF)"], priority:"CRITICAL" },
  { week:"Week 2", dates:"Apr 15–21", items:["File M-003 (CNB)","File M-004 (Salud)","File M-005 (SRE)","Deploy crawlers MX-GOV-01–05 on n8n"], priority:"HIGH" },
  { week:"Week 3", dates:"Apr 22–28", items:["File US-002 (FBI NCIC)","File US-003 (DOJ SMART/NSOPW)","Deploy crawlers US-REG-01, MX-REG-01, MX-SHELT-01/02"], priority:"MEDIUM" },
  { week:"Week 4", dates:"Apr 29–May 5", items:["Follow up on all INAI requests (20-day deadline approaching)","Send UNI-003 (UABC Estudios Fronterizos)"], priority:"CRITICAL" },
  { week:"Week 5–6", dates:"May 5–12", items:["Compile all responses into CHC briefing package"], priority:"CRITICAL" },
  { week:"Week 7", dates:"May 12–18", items:["Final integration of new data into TruthEngine360 dashboards"], priority:"CRITICAL" },
  { week:"CHC DEADLINE", dates:"May 18, 2026", items:["CONGRESSIONAL HISPANIC CAUCUS BRIEFING"], priority:"DEADLINE" },
];

const PRIORITY_C = { CRITICAL:P.red, HIGH:P.amber, MEDIUM:P.blue, LOW:P.teal, DEADLINE:P.gold };
const STATUS_C   = { DRAFT:P.t4, FILED:P.blue, PENDING:P.amber, RECEIVED:P.teal, OVERDUE:P.red };

export default function FOIARequestManager() {
  const [view, setView]       = useState("mexico"); // mexico | us | timeline
  const [selected, setSelected] = useState(null);
  const [statuses, setStatuses] = useState({});
  const [copied, setCopied]   = useState(null);
  const [sending, setSending] = useState(null);
  const [sent, setSent]       = useState(new Set());

  const allRequests = [...MEXICO_REQUESTS, ...US_REQUESTS];
  const selReq = allRequests.find(r => r.id === selected);

  const setStatus = (id, s) => setStatuses(p => ({...p, [id]: s}));
  const getStatus = (id) => statuses[id] || "DRAFT";

  const copyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const sendEmail = async (req) => {
    setSending(req.id);
    const subject = req.language === "es"
      ? `Solicitud de Información — ${req.title} | AUMER Foundation EIN 99-0495658`
      : `FOIA Request — ${req.title} | AUMER Foundation EIN 99-0495658`;
    await base44.integrations.Core.SendEmail({
      to: ORG.email,
      subject: `[TE360 FOIA DRAFT READY] ${req.id}: ${req.title}`,
      body: `AUMER Foundation FOIA/Transparency Request — Draft Ready for Filing\n\nRequest ID: ${req.id}\nAgency: ${req.agency}\nPortal: ${req.portal}\nLegal Basis: ${req.legalBasis}\nDeadline: ${req.deadline}\nFiling Week: ${req.week}\nPriority: ${req.priority}\n\n${"═".repeat(60)}\n\n${req.text}\n\n${"═".repeat(60)}\n\nOrganization: ${ORG.name} (${ORG.type}, EIN ${ORG.ein})\nContact: ${ORG.contact} | ${ORG.email} | ${ORG.phone}\n\nFiling Portal: ${req.portal}`,
    });
    setSent(p => new Set([...p, req.id]));
    setStatus(req.id, "FILED");
    setSending(null);
  };

  const requests = view === "mexico" ? MEXICO_REQUESTS : US_REQUESTS;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P.t1 }}>📋 FOIA & Transparency <span style={{ color: P.amber }}>Request Manager</span></div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>5 MEXICO (INAI) · 3 US (FOIA) · CHC MAY 18, 2026 · EIN 99-0495658</div>
      </div>

      {/* Org card */}
      <div style={{ background:`${P.gold}08`, border:`1px solid ${P.gold}25`, borderRadius:8, padding:"8px 14px", marginBottom:10, display:"flex", gap:14, flexWrap:"wrap", alignItems:"center" }}>
        <div>
          <span style={{ fontSize:8, fontWeight:800, color:P.gold }}>{ORG.name}</span>
          <span style={{ fontSize:7, color:P.t4, marginLeft:8 }}>{ORG.type} · EIN {ORG.ein}</span>
        </div>
        <div style={{ fontSize:7, color:P.t3 }}>{ORG.contact} · {ORG.email} · {ORG.phone}</div>
        <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
          {[
            ["M-001","FILED"],["M-002","FILED"],
            ["US-001","FILED"],["F001","OVERDUE"],["F002","OVERDUE"],
          ].map(([id,s])=>(
            <span key={id} style={{ fontSize:6, padding:"2px 7px",
              background:`${STATUS_C[s]||P.t4}12`, border:`1px solid ${STATUS_C[s]||P.t4}25`,
              color:STATUS_C[s]||P.t4, borderRadius:20, fontWeight:700 }}>{id}: {s}</span>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))", gap:6, marginBottom:10 }}>
        {[
          ["Mexico (INAI)",5,P.violet],["US (FOIA)",3,P.blue],["Total Requests",8,P.gold],
          ["Critical",3,P.red],["Days to CHC",Math.ceil((new Date("2026-05-18")-new Date())/86400000),P.amber],
          ["Filed",Object.values(statuses).filter(s=>s==="FILED").length,P.teal],
        ].map(([l,v,c])=>(
          <div key={l} style={{ background:P.card,border:`1px solid ${c}25`,borderLeft:`3px solid ${c}`,borderRadius:7,padding:"5px 9px" }}>
            <div style={{ fontSize:6,color:P.t4 }}>{l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:800,color:c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display:"flex", gap:0, marginBottom:10, background:P.card, border:`1px solid ${P.b}`, borderRadius:8, overflow:"hidden", width:"fit-content" }}>
        {[["mexico","🇲🇽 Mexico INAI (5)"],["us","🇺🇸 US FOIA (3)"],["timeline","📅 Filing Timeline"]].map(([v,l])=>(
          <button key={v} onClick={()=>{setView(v);setSelected(null);}}
            style={{ padding:"7px 16px",background:view===v?`${P.gold}18`:"transparent",
              border:"none",borderRight:`1px solid ${P.b}`,color:view===v?P.gold:P.t4,
              fontSize:9,fontWeight:view===v?700:400,cursor:"pointer" }}>
            {l}
          </button>
        ))}
      </div>

      {view === "timeline" && (
        <div>
          {TIMELINE.map((w,i)=>{
            const c = PRIORITY_C[w.priority]||P.t4;
            const isDeadline = w.priority === "DEADLINE";
            return (
              <div key={i} style={{ display:"flex", gap:12, marginBottom:8 }}>
                <div style={{ width:120, flexShrink:0, textAlign:"right" }}>
                  <div style={{ fontSize:9,fontWeight:800,color:c }}>{w.week}</div>
                  <div style={{ fontSize:7,color:P.t4 }}>{w.dates}</div>
                  <span style={{ fontSize:6,background:`${c}15`,border:`1px solid ${c}25`,color:c,borderRadius:20,padding:"1px 7px",fontWeight:700 }}>{w.priority}</span>
                </div>
                <div style={{ display:"flex",gap:0,flexDirection:"column",alignItems:"center",width:20 }}>
                  <div style={{ width:2,flex:1,background:i===0?"transparent":P.b,marginBottom:0 }}/>
                  <div style={{ width:isDeadline?16:12,height:isDeadline?16:12,borderRadius:"50%",background:c,
                    boxShadow:isDeadline?`0 0 12px ${c}`:undefined,flexShrink:0 }}/>
                  <div style={{ width:2,flex:1,background:i===TIMELINE.length-1?"transparent":P.b }}/>
                </div>
                <div style={{ background:isDeadline?`${c}12`:P.card,border:`1px solid ${isDeadline?c+"40":P.b}`,
                  borderRadius:9,padding:"10px 14px",flex:1 }}>
                  {w.items.map((item,j)=>(
                    <div key={j} style={{ fontSize:8,color:isDeadline?c:P.t2,padding:"3px 0",
                      borderBottom:j<w.items.length-1?`1px solid ${P.b}20`:"none",
                      fontWeight:isDeadline?800:400 }}>
                      {isDeadline?"🏛️ ":""}{item}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(view === "mexico" || view === "us") && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {/* Request list */}
          <div>
            {requests.map(r=>{
              const isSel = selected === r.id;
              const status = getStatus(r.id);
              const pc = PRIORITY_C[r.priority]||P.t4;
              const sc = STATUS_C[status]||P.t4;
              return (
                <div key={r.id} onClick={()=>setSelected(isSel?null:r.id)}
                  style={{ background:isSel?`${r.color}08`:P.card,
                    border:`1px solid ${isSel?r.color+"50":P.b+"40"}`,
                    borderLeft:`5px solid ${r.color}`,
                    borderRadius:9,padding:"10px 14px",marginBottom:7,cursor:"pointer" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex",gap:5,alignItems:"center",flexWrap:"wrap",marginBottom:2 }}>
                        <span style={{ fontSize:7,color:P.t4,fontFamily:"'IBM Plex Mono',monospace" }}>{r.id}</span>
                        <span style={{ fontSize:9,fontWeight:800,color:r.color }}>{r.title}</span>
                      </div>
                      <div style={{ fontSize:7,color:P.t4,marginBottom:3 }}>{r.agency}</div>
                      <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                        <span style={{ fontSize:6,background:`${pc}12`,border:`1px solid ${pc}20`,color:pc,borderRadius:20,padding:"1px 6px",fontWeight:700 }}>{r.priority}</span>
                        <span style={{ fontSize:6,background:`${sc}12`,border:`1px solid ${sc}20`,color:sc,borderRadius:20,padding:"1px 6px",fontWeight:700 }}>{status}</span>
                        <span style={{ fontSize:6,color:P.t4 }}>{r.week}</span>
                      </div>
                    </div>
                    <div style={{ display:"flex",flexDirection:"column",gap:4,flexShrink:0 }}>
                      <select value={status} onChange={e=>{e.stopPropagation();setStatus(r.id,e.target.value);}}
                        onClick={e=>e.stopPropagation()}
                        style={{ padding:"2px 6px",background:"#080D18",border:`1px solid ${P.b}`,borderRadius:4,color:sc,fontSize:6,outline:"none" }}>
                        {["DRAFT","FILED","PENDING","RECEIVED","OVERDUE"].map(s=>(
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ fontSize:7,color:P.t3,lineHeight:1.5 }}>
                    Legal: {r.legalBasis} · Deadline: {r.deadline}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail panel */}
          {selReq ? (
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              <div style={{ background:P.card,border:`1px solid ${selReq.color}30`,borderRadius:10,padding:"14px 16px" }}>
                <div style={{ fontSize:7,color:selReq.color,fontWeight:700,letterSpacing:2,marginBottom:3 }}>{selReq.id} · {selReq.agency}</div>
                <div style={{ fontSize:10,fontWeight:800,color:P.t1,lineHeight:1.3,marginBottom:8 }}>{selReq.title}</div>

                {[
                  {l:"PORTAL",v:selReq.portal,link:true},
                  {l:"LEGAL BASIS",v:selReq.legalBasis},
                  {l:"DEADLINE",v:selReq.deadline},
                  {l:"FILING WEEK",v:selReq.week},
                ].map(({l,v,link})=>(
                  <div key={l} style={{ marginBottom:6 }}>
                    <div style={{ fontSize:6,color:P.t4,letterSpacing:1,marginBottom:1 }}>{l}</div>
                    {link ? (
                      <a href={v} target="_blank" rel="noreferrer" style={{ fontSize:7,color:P.blue,textDecoration:"none" }}>{v} ↗</a>
                    ) : (
                      <div style={{ fontSize:8,color:P.t2 }}>{v}</div>
                    )}
                  </div>
                ))}

                <div style={{ marginBottom:6 }}>
                  <div style={{ fontSize:6,color:P.t4,letterSpacing:1,marginBottom:4 }}>REQUEST TEXT ({selReq.language === "es" ? "SPANISH" : "ENGLISH"})</div>
                  <pre style={{ background:"#080D18",borderRadius:7,padding:"10px 12px",fontSize:7,color:P.t2,
                    lineHeight:1.8,whiteSpace:"pre-wrap",maxHeight:220,overflowY:"auto",
                    fontFamily:"'IBM Plex Mono',monospace",margin:0 }}>
                    {selReq.text}
                  </pre>
                </div>

                <div style={{ display:"flex",gap:6,marginTop:8 }}>
                  <button onClick={()=>copyText(selReq.id, selReq.text)}
                    style={{ flex:1,padding:"7px",fontSize:8,fontWeight:700,cursor:"pointer",
                      background:copied===selReq.id?`${P.teal}15`:`${P.blue}12`,
                      border:`1px solid ${copied===selReq.id?P.teal:P.blue}25`,
                      color:copied===selReq.id?P.teal:P.blue,borderRadius:7 }}>
                    {copied===selReq.id?"✓ Copied!":"⎘ Copy Request Text"}
                  </button>
                  <a href={selReq.portal} target="_blank" rel="noreferrer"
                    style={{ flex:1,padding:"7px",fontSize:8,fontWeight:700,cursor:"pointer",
                      background:`${selReq.color}12`,border:`1px solid ${selReq.color}25`,
                      color:selReq.color,borderRadius:7,textDecoration:"none",textAlign:"center" }}>
                    🔗 Open Portal ↗
                  </a>
                  <button onClick={()=>sendEmail(selReq)} disabled={sending===selReq.id||sent.has(selReq.id)}
                    style={{ flex:1,padding:"7px",fontSize:8,fontWeight:700,cursor:"pointer",
                      background:sent.has(selReq.id)?`${P.teal}15`:`${P.amber}12`,
                      border:`1px solid ${sent.has(selReq.id)?P.teal:P.amber}25`,
                      color:sent.has(selReq.id)?P.teal:P.amber,borderRadius:7 }}>
                    {sending===selReq.id?"⟳":sent.has(selReq.id)?"✓ Emailed":"📧 Email Draft"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background:P.card,border:`1px solid ${P.b}`,borderRadius:10,padding:"30px",textAlign:"center" }}>
              <div style={{ fontSize:24,marginBottom:8 }}>📋</div>
              <div style={{ fontSize:9,color:P.t4,lineHeight:1.7 }}>Select a request to view full text, copy to clipboard, open the filing portal, or email the draft to {ORG.email}.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}