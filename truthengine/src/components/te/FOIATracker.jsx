import { useState, useEffect } from "react";
import { P } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

const TODAY = new Date("2026-04-09");

const FOIA_DB = [
  {
    id:"F001", agency:"VA — SAOF", subject:"VA BIRLS Veteran ID Records",
    filed:"2025-09-15", due:"2025-11-14", statutory:20,
    status:"CRITICAL_OVERDUE", daysOverdue:83, priority:"CRITICAL",
    contact:"1-877-750-3639", email:"vacofoiaservice@va.gov",
    address:"VA FOIA Service (005R1C), 810 Vermont Ave NW, Washington DC 20420",
    legalBasis:"5 USC §552 · 38 CFR §1.550", caseLink:["C001","C002","C003"],
    escalationLevel:3, lastAction:"2026-01-15 — CHC inquiry letter sent",
    nextAction:"CHC Secretary-level inquiry", chcBlocker:true,
    notes:"83 days overdue. BIRLS records critical for veteran ID confirmation across all 6 cases.",
    history:[
      {date:"2025-09-15",action:"FOIA filed via certified mail"},
      {date:"2025-10-01",action:"Acknowledgment received — tracking #VA-2025-09876"},
      {date:"2025-11-14",action:"Statutory deadline passed — NO RESPONSE"},
      {date:"2025-12-01",action:"First administrative appeal filed"},
      {date:"2026-01-15",action:"CHC inquiry letter sent — Rep. Barragán office"},
      {date:"2026-04-09",action:"83 days overdue — CRITICAL escalation"},
    ]
  },
  {
    id:"F002", agency:"DHS/ICE — FOIA Office", subject:"ENFORCE/IDENT Deportation Crosswalk",
    filed:"2025-10-15", due:"2025-12-14", statutory:20,
    status:"CRITICAL_OVERDUE", daysOverdue:66, priority:"CRITICAL",
    contact:"foia.ice@dhs.gov", email:"foia.ice@dhs.gov",
    address:"ICE FOIA Office, 500 12th St SW, Washington DC 20536",
    legalBasis:"5 USC §552 · DHS FOIA Regulations 6 CFR §5", caseLink:["C002","C003","C004"],
    escalationLevel:2, lastAction:"2026-02-01 — Second appeal filed",
    nextAction:"DHS Inspector General complaint", chcBlocker:true,
    notes:"66 days overdue. ENFORCE crosswalk needed to document veteran-deportation intersection for NERO-O vector.",
    history:[
      {date:"2025-10-15",action:"FOIA filed online via ICE portal"},
      {date:"2025-10-22",action:"Auto-acknowledgment received — ref #ICE-FOIA-2025-11234"},
      {date:"2025-12-14",action:"Statutory deadline passed — NO RESPONSE"},
      {date:"2026-01-10",action:"Administrative appeal filed"},
      {date:"2026-02-01",action:"Second appeal filed — DHS OIG notified"},
      {date:"2026-04-09",action:"66 days overdue — preparing IG complaint"},
    ]
  },
  {
    id:"F003", agency:"INAI — México", subject:"COMAR Deported Veteran Registry",
    filed:"2025-11-01", due:"2026-01-01", statutory:20,
    status:"PENDING", daysOverdue:0, priority:"HIGH",
    contact:"infomex@inai.org.mx", email:"infomex@inai.org.mx",
    address:"Instituto Nacional de Transparencia, Insurgentes Sur 3211, CDMX",
    legalBasis:"Ley Federal de Transparencia Art. 40", caseLink:["C002","C003","C005"],
    escalationLevel:1, lastAction:"2026-01-01 — Response deadline",
    nextAction:"Follow-up with COMAR via diplomatic channel", chcBlocker:false,
    notes:"Requesting COMAR data on repatriated veterans at border shelters. Diplomatic coordination required.",
    history:[
      {date:"2025-11-01",action:"FOIA equivalent filed via InfoMex portal"},
      {date:"2025-11-15",action:"Acknowledgment received"},
      {date:"2026-01-01",action:"Response deadline — partial response received"},
      {date:"2026-04-09",action:"Awaiting supplemental records"},
    ]
  },
  {
    id:"F004", agency:"NARA — National Archives", subject:"1960s Vietnam Era Surname File",
    filed:"2026-01-20", due:"2026-02-17", statutory:20,
    status:"PENDING", daysOverdue:0, priority:"HIGH",
    contact:"inquire@nara.gov", email:"inquire@nara.gov",
    address:"NARA Special Access FOIA, 8601 Adelphi Rd, College Park MD 20740",
    legalBasis:"5 USC §552 · NARA Special Access Program", caseLink:["C001"],
    escalationLevel:1, lastAction:"2026-02-17 — Deadline passed, extension granted",
    nextAction:"Await 30-day extension response", chcBlocker:false,
    notes:"NA-14021 form. Requesting full surname file for BISG calibration against τ=0.40 estimate. Extension granted.",
    history:[
      {date:"2026-01-20",action:"Special access FOIA filed — form NA-14021"},
      {date:"2026-02-01",action:"Acknowledgment — assigned to Special Access team"},
      {date:"2026-02-17",action:"30-day extension granted"},
      {date:"2026-04-09",action:"Awaiting response — BISG calibration blocked"},
    ]
  },
  {
    id:"F005", agency:"DoD — DMDC", subject:"Non-Citizen Veteran Service Records",
    filed:"2026-02-15", due:"2026-03-15", statutory:20,
    status:"OVERDUE", daysOverdue:25, priority:"HIGH",
    contact:"dmdc.foia@mail.mil", email:"dmdc.foia@mail.mil",
    address:"DMDC FOIA, 400 Gigling Rd, Seaside CA 93955",
    legalBasis:"5 USC §552 · DoD Directive 5400.7", caseLink:["C005","C006"],
    escalationLevel:2, lastAction:"2026-03-20 — Follow-up sent",
    nextAction:"Congressional referral via Rep. Ansari office", chcBlocker:false,
    notes:"Requesting non-citizen veteran service records for demographic crosswalk with ICE ENFORCE data.",
    history:[
      {date:"2026-02-15",action:"FOIA filed via DMDC portal"},
      {date:"2026-03-01",action:"Acknowledgment received"},
      {date:"2026-03-15",action:"Deadline passed — NO RESPONSE"},
      {date:"2026-03-20",action:"Follow-up email sent"},
      {date:"2026-04-09",action:"25 days overdue — escalating"},
    ]
  },
];

const STATUS_C = {
  CRITICAL_OVERDUE: P.red,
  OVERDUE: P.amber,
  PENDING: P.blue,
  RECEIVED: P.teal,
  COMPLETE: P.teal,
};

const ESCALATION_PATHS = [
  { level:1, label:"Administrative Appeal",    desc:"File appeal with same agency within 90 days of denial/non-response" },
  { level:2, label:"IG Complaint",             desc:"File complaint with agency Inspector General" },
  { level:3, label:"CHC Congressional Inquiry",desc:"Formal congressional letter from CHC member to agency head" },
  { level:4, label:"DOJ / Federal Litigation", desc:"File suit in federal district court under 5 USC §552(a)(4)(B)" },
];

const DRAFT_TEMPLATES = {
  appeal: (r) => `[DATE]\n\nVIA CERTIFIED MAIL AND EMAIL: ${r.email}\n\n${r.agency} FOIA Office\n${r.address}\n\nRE: ADMINISTRATIVE APPEAL — FOIA Request ${r.id}\n    Tracking Number: [INSERT]\n    Date Filed: ${r.filed}\n    Subject: ${r.subject}\n\nDear FOIA Officer:\n\nPursuant to ${r.legalBasis}, the AUMER Foundation hereby submits this administrative appeal of the failure to respond to our FOIA request within the statutory 20-business-day period.\n\nThe request, filed ${r.filed}, sought records related to: ${r.subject}\n\nAs of ${new Date().toLocaleDateString()}, your office is ${r.daysOverdue} business days past the statutory deadline with no substantive response. This delay is prejudicing ongoing congressional briefing preparation scheduled for May 18, 2026.\n\nWe request immediate production of responsive records or a written determination within 20 business days of this appeal.\n\nRespectfully submitted,\nAUMER Foundation Research Team\ngtarce@usc.edu`,

  chc: (r) => `[DATE]\n\n[AGENCY HEAD NAME]\n[AGENCY]\n[ADDRESS]\n\nRE: Congressional Inquiry — Overdue FOIA Request (${r.id})\n    Subject: ${r.subject}\n    Filed: ${r.filed} · Overdue: ${r.daysOverdue} days\n\nDear [Agency Head]:\n\nI write on behalf of a constituent, the AUMER Foundation, regarding a Freedom of Information Act request (${r.id}) that is now ${r.daysOverdue} days past the statutory 20-business-day response deadline.\n\nThe requested records — ${r.subject} — are critical to ongoing research on the treatment of non-citizen veterans that will be presented to the Congressional Hispanic Caucus on May 18, 2026.\n\nI request your personal attention to ensure production of responsive records or a substantive determination within 10 business days.\n\nSincerely,\n[CHC Member Name]\nMember of Congress`,
};

export default function FOIATracker() {
  const [selected, setSelected] = useState("F001");
  const [view, setView] = useState("tracker"); // tracker | escalation | draft
  const [draftType, setDraftType] = useState("appeal");
  const [draftContent, setDraftContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailAlert, setEmailAlert] = useState(false);
  const [filter, setFilter] = useState("all");

  const selRecord = FOIA_DB.find(r => r.id === selected);

  const totalOverdue = FOIA_DB.filter(r => r.daysOverdue > 0).reduce((a,r)=>a+r.daysOverdue,0);
  const critical = FOIA_DB.filter(r=>r.priority==="CRITICAL");
  const chcBlockers = FOIA_DB.filter(r=>r.chcBlocker);

  const generateDraft = (type) => {
    if (!selRecord) return;
    setDraftType(type);
    setDraftContent(type==="appeal" ? DRAFT_TEMPLATES.appeal(selRecord) : DRAFT_TEMPLATES.chc(selRecord));
    setView("draft");
  };

  const sendAlert = async () => {
    setSending(true);
    const overdue = FOIA_DB.filter(r=>r.daysOverdue>0);
    const body = overdue.map(r=>`${r.id} — ${r.agency}\n  Subject: ${r.subject}\n  Overdue: ${r.daysOverdue} days\n  Next Action: ${r.nextAction}\n  Contact: ${r.contact}`).join("\n\n");
    await base44.integrations.Core.SendEmail({
      to:"gtarce@usc.edu",
      subject:`[TE360 FOIA ALERT] ${overdue.length} Overdue Requests — CHC Brief ${Math.ceil((new Date("2026-05-18")-TODAY)/86400000)}d`,
      body:`TruthEngine360 FOIA Status Report\n${new Date().toISOString()}\n${"=".repeat(50)}\n\nOVERDUE FOIA REQUESTS (${overdue.length}):\n\n${body}\n\nCHC BRIEFING: May 18, 2026\nCHC BLOCKERS: F001 (83d) + F002 (66d)\nTotal overdue days: ${totalOverdue}`,
    });
    setSent(true); setSending(false);
    setTimeout(()=>setSent(false),3000);
  };

  const visible = FOIA_DB.filter(r=> filter==="all" || r.priority.toLowerCase()===filter || r.status.toLowerCase().includes(filter));

  return (
    <div>
      {/* Header stats */}
      <div style={{display:"flex",gap:8,justifyContent:"space-between",flexWrap:"wrap",marginBottom:10}}>
        <div>
          <div style={{fontSize:12,fontWeight:800,color:P.t1}}>📋 FOIA <span style={{color:P.amber}}>Tracker</span></div>
          <div style={{fontSize:7,color:P.t4,letterSpacing:2}}>AUTOMATED · {FOIA_DB.length} ACTIVE REQUESTS · {chcBlockers.length} CHC BLOCKERS</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={sendAlert} disabled={sending}
            style={{padding:"7px 14px",fontSize:8,fontWeight:800,cursor:"pointer",
              background:sent?`${P.teal}18`:`${P.amber}15`,border:`1px solid ${sent?P.teal:P.amber}30`,
              color:sent?P.teal:P.amber,borderRadius:8}}>
            {sending?"⟳ Sending...":sent?"✓ Sent":"📧 Email Status Report"}
          </button>
          {["tracker","escalation","draft"].map(v=>(
            <button key={v} onClick={()=>setView(v)}
              style={{padding:"7px 14px",fontSize:8,fontWeight:700,cursor:"pointer",
                background:view===v?`${P.gold}15`:"transparent",
                border:`1px solid ${view===v?P.gold:P.b}`,color:view===v?P.gold:P.t4,borderRadius:8}}>
              {v==="tracker"?"📋 Tracker":v==="escalation"?"⚖️ Escalation":"📝 Draft"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))",gap:7,marginBottom:10}}>
        {[
          ["Critical Overdue",critical.length,P.red],
          ["Total Overdue Days",totalOverdue,P.red],
          ["CHC Blockers",chcBlockers.length,P.amber],
          ["Active Requests",FOIA_DB.length,P.blue],
          ["Days to CHC",Math.ceil((new Date("2026-05-18")-TODAY)/86400000),P.gold],
          ["Escalation Level","Sec.",P.violet],
        ].map(([l,v,c])=>(
          <div key={l} style={{background:P.card,border:`1px solid ${c}25`,borderLeft:`3px solid ${c}`,borderRadius:7,padding:"6px 10px"}}>
            <div style={{fontSize:6,color:P.t4}}>{l}</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:800,color:c}}>{v}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
        {[["all","All"],["critical","Critical"],["high","High"],["overdue","Overdue"],["pending","Pending"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)}
            style={{padding:"3px 10px",fontSize:7,cursor:"pointer",
              background:filter===v?`${P.gold}15`:"transparent",
              border:`1px solid ${filter===v?P.gold:P.b}`,color:filter===v?P.gold:P.t4,borderRadius:20}}>
            {l}
          </button>
        ))}
      </div>

      {view==="tracker" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {/* Left: request list */}
          <div>
            {visible.map(r=>{
              const sc = STATUS_C[r.status]||P.t4;
              const isSel = selected===r.id;
              return (
                <div key={r.id} onClick={()=>setSelected(r.id)}
                  style={{background:isSel?`${sc}10`:P.card,
                    border:`1px solid ${isSel?sc+"50":P.b+"40"}`,
                    borderLeft:`5px solid ${r.chcBlocker?P.red:sc}`,
                    borderRadius:9,padding:"10px 14px",marginBottom:7,cursor:"pointer"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                    <div>
                      <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:P.t4}}>{r.id}</span>
                        <span style={{fontSize:9,fontWeight:800,color:r.daysOverdue>0?P.red:P.t1}}>{r.agency}</span>
                        {r.chcBlocker&&<span style={{fontSize:6,background:`${P.red}15`,border:`1px solid ${P.red}25`,color:P.red,borderRadius:20,padding:"1px 6px",fontWeight:700}}>CHC BLOCKER</span>}
                      </div>
                      <div style={{fontSize:8,color:P.t3,marginTop:2}}>{r.subject}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:r.daysOverdue>0?16:12,fontWeight:800,color:sc,lineHeight:1}}>
                        {r.daysOverdue>0?`+${r.daysOverdue}d`:r.status}
                      </div>
                      {r.daysOverdue>0&&<div style={{fontSize:6,color:sc}}>OVERDUE</div>}
                    </div>
                  </div>
                  {/* Progress bar — days used */}
                  <div style={{background:"#030508",borderRadius:3,height:4,overflow:"hidden",marginBottom:4}}>
                    <div style={{width:`${Math.min(100,(r.daysOverdue+r.statutory)/Math.max(r.daysOverdue+r.statutory,1)*100)}%`,
                      height:"100%",background:sc,borderRadius:3}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:6,color:P.t4}}>
                    <span>Filed: {r.filed}</span>
                    <span>Due: {r.due}</span>
                    <span>Escalation Lvl: {r.escalationLevel}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: detail */}
          {selRecord && (
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <div style={{background:P.card,border:`1px solid ${STATUS_C[selRecord.status]||P.b}30`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:7,color:STATUS_C[selRecord.status],letterSpacing:2,fontWeight:700,marginBottom:2}}>{selRecord.status.replace(/_/g," ")}</div>
                <div style={{fontSize:12,fontWeight:800,color:P.t1,marginBottom:4}}>{selRecord.agency}</div>
                <div style={{fontSize:9,color:P.t3,marginBottom:8}}>{selRecord.subject}</div>
                {[
                  ["Legal Basis",selRecord.legalBasis,P.blue],
                  ["Contact",selRecord.contact,P.teal],
                  ["Email",selRecord.email,P.teal],
                  ["Next Action",selRecord.nextAction,P.amber],
                  ["Last Action",selRecord.lastAction,P.t3],
                ].map(([k,v,c])=>(
                  <div key={k} style={{display:"flex",gap:8,fontSize:7,padding:"4px 0",borderBottom:`1px solid ${P.b}20`}}>
                    <span style={{color:P.t4,width:80,flexShrink:0}}>{k}</span>
                    <span style={{color:c,fontWeight:700,flex:1}}>{v}</span>
                  </div>
                ))}
                <div style={{marginTop:8,fontSize:7,color:P.t3,lineHeight:1.6,padding:"6px 8px",background:"#080D18",borderRadius:6}}>{selRecord.notes}</div>
              </div>

              {/* Action buttons */}
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <button onClick={()=>generateDraft("appeal")}
                  style={{flex:1,padding:"8px",fontSize:8,fontWeight:800,cursor:"pointer",
                    background:`${P.blue}15`,border:`1px solid ${P.blue}30`,color:P.blue,borderRadius:7}}>
                  📝 Draft Appeal
                </button>
                <button onClick={()=>generateDraft("chc")}
                  style={{flex:1,padding:"8px",fontSize:8,fontWeight:800,cursor:"pointer",
                    background:`${P.gold}12`,border:`1px solid ${P.gold}25`,color:P.gold,borderRadius:7}}>
                  🏛️ Draft CHC Letter
                </button>
                <a href={`mailto:${selRecord.email}?subject=FOIA Request ${selRecord.id} — Overdue ${selRecord.daysOverdue} Days&body=Dear FOIA Officer, This is a follow-up regarding FOIA Request ${selRecord.id} regarding ${selRecord.subject}, filed ${selRecord.filed}, now ${selRecord.daysOverdue} days past the statutory deadline.`}
                  target="_blank" rel="noopener noreferrer"
                  style={{flex:1,padding:"8px",fontSize:8,fontWeight:800,cursor:"pointer",textDecoration:"none",
                    background:`${P.amber}12`,border:`1px solid ${P.amber}25`,color:P.amber,borderRadius:7,textAlign:"center"}}>
                  📧 Email Agency
                </a>
              </div>

              {/* History */}
              <div style={{background:P.card,border:`1px solid ${P.b}`,borderRadius:9,padding:"10px 14px"}}>
                <div style={{fontSize:7,color:P.t4,letterSpacing:2,marginBottom:7}}>REQUEST HISTORY</div>
                {selRecord.history.map((h,i)=>(
                  <div key={i} style={{display:"flex",gap:8,fontSize:7,padding:"4px 0",borderBottom:`1px solid ${P.b}20`,alignItems:"flex-start"}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",color:P.t4,flexShrink:0,width:80}}>{h.date}</span>
                    <span style={{color:i===selRecord.history.length-1?P.gold:P.t3}}>{h.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {view==="escalation" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div>
            <div style={{fontSize:8,color:P.t4,letterSpacing:2,marginBottom:8}}>ESCALATION PATHWAYS</div>
            {ESCALATION_PATHS.map(ep=>(
              <div key={ep.level} style={{background:P.card,border:`1px solid ${ep.level>=3?P.red+"40":P.b}`,
                borderLeft:`5px solid ${ep.level===4?P.red:ep.level===3?P.amber:ep.level===2?P.blue:P.teal}`,
                borderRadius:9,padding:"10px 14px",marginBottom:7}}>
                <div style={{fontSize:9,fontWeight:800,color:ep.level>=3?P.red:P.t1,marginBottom:3}}>Level {ep.level}: {ep.label}</div>
                <div style={{fontSize:8,color:P.t3}}>{ep.desc}</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{fontSize:8,color:P.t4,letterSpacing:2,marginBottom:8}}>CURRENT ESCALATION STATUS</div>
            {FOIA_DB.filter(r=>r.daysOverdue>0).map(r=>{
              const nextEp = ESCALATION_PATHS.find(ep=>ep.level===r.escalationLevel+1);
              const sc = STATUS_C[r.status]||P.t4;
              return (
                <div key={r.id} style={{background:P.card,border:`1px solid ${sc}30`,borderRadius:9,padding:"10px 14px",marginBottom:7}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontSize:9,fontWeight:800,color:sc}}>{r.id} — {r.agency}</span>
                    <span style={{fontSize:7,background:`${sc}12`,border:`1px solid ${sc}20`,color:sc,borderRadius:20,padding:"1px 8px"}}>Lvl {r.escalationLevel}/{ESCALATION_PATHS.length}</span>
                  </div>
                  {/* Escalation progress */}
                  <div style={{display:"flex",gap:4,marginBottom:6}}>
                    {ESCALATION_PATHS.map(ep=>(
                      <div key={ep.level} style={{flex:1,height:6,borderRadius:3,
                        background:ep.level<=r.escalationLevel?sc:"#080D18"}}/>
                    ))}
                  </div>
                  <div style={{fontSize:7,color:P.t3}}>Current: {ESCALATION_PATHS.find(ep=>ep.level===r.escalationLevel)?.label}</div>
                  {nextEp&&<div style={{fontSize:7,color:P.amber,fontWeight:700,marginTop:2}}>→ Next: {nextEp.label}</div>}
                  <div style={{fontSize:7,color:P.gold,marginTop:3}}>{r.nextAction}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view==="draft" && (
        <div>
          <div style={{display:"flex",gap:6,marginBottom:8}}>
            {selRecord && (
              <>
                <button onClick={()=>generateDraft("appeal")}
                  style={{padding:"6px 14px",fontSize:8,fontWeight:700,cursor:"pointer",
                    background:draftType==="appeal"?`${P.blue}18`:"transparent",
                    border:`1px solid ${draftType==="appeal"?P.blue:P.b}`,color:draftType==="appeal"?P.blue:P.t4,borderRadius:7}}>
                  Administrative Appeal
                </button>
                <button onClick={()=>generateDraft("chc")}
                  style={{padding:"6px 14px",fontSize:8,fontWeight:700,cursor:"pointer",
                    background:draftType==="chc"?`${P.gold}18`:"transparent",
                    border:`1px solid ${draftType==="chc"?P.gold:P.b}`,color:draftType==="chc"?P.gold:P.t4,borderRadius:7}}>
                  CHC Congressional Letter
                </button>
                <button onClick={()=>{const b=new Blob([draftContent],{type:"text/plain"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=`FOIA_${selected}_${draftType}_${new Date().toISOString().slice(0,10)}.txt`;a.click();}}
                  style={{marginLeft:"auto",padding:"6px 14px",fontSize:8,fontWeight:700,cursor:"pointer",
                    background:`${P.teal}12`,border:`1px solid ${P.teal}25`,color:P.teal,borderRadius:7}}>
                  ↓ Download
                </button>
              </>
            )}
          </div>
          {draftContent ? (
            <textarea value={draftContent} onChange={e=>setDraftContent(e.target.value)}
              style={{width:"100%",minHeight:500,padding:"14px 16px",background:P.card,
                border:`1px solid ${P.gold}20`,borderRadius:10,color:P.t2,fontSize:9,
                lineHeight:1.9,outline:"none",resize:"vertical",fontFamily:"Georgia,serif",
                boxSizing:"border-box"}}/>
          ) : (
            <div style={{background:P.card,border:`1px solid ${P.b}`,borderRadius:10,padding:"30px",textAlign:"center",color:P.t4,fontSize:9}}>
              Select a FOIA request from the Tracker, then click "Draft Appeal" or "Draft CHC Letter"
            </div>
          )}
        </div>
      )}
    </div>
  );
}