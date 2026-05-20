import { useState } from "react";
import { P, CASES } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

const CONTACTS = [
  { id:"CT001", name:"CHC Chair Office",          org:"Congressional Hispanic Caucus", role:"Primary Congressional Target", email:"chc@mail.house.gov", phone:"202-225-2410", status:"ACTIVE", priority:"CRITICAL", lastContact:"2026-03-15", nextAction:"CHC Briefing May 18", caseRef:"ALL", tags:["Congressional","Primary"] },
  { id:"CT002", name:"Rep. Nanette Barragán",     org:"US House of Representatives",  role:"CHC Member — Key Ally",        email:"ca44@mail.house.gov", phone:"202-225-8220", status:"ACTIVE", priority:"CRITICAL", lastContact:"2026-02-28", nextAction:"Confirm May 18 attendance", caseRef:"ALL", tags:["Congressional","CHC"] },
  { id:"CT003", name:"Rep. Adriano Espaillat",    org:"US House of Representatives",  role:"CHC Member — IIRIRA Expert",   email:"ny13@mail.house.gov", phone:"202-225-4365", status:"ACTIVE", priority:"HIGH",     lastContact:"2026-01-20", nextAction:"Send DCAS analysis", caseRef:"DCAS", tags:["Congressional","CHC","IIRIRA"] },
  { id:"CT004", name:"Sen. Tammy Duckworth",      org:"US Senate",                    role:"S.874 Author — Veteran Ally",  email:"duckworth.senate.gov", phone:"202-224-2854", status:"ACTIVE", priority:"HIGH",     lastContact:"2025-12-10", nextAction:"S.874 status update", caseRef:"ALL", tags:["Senate","S874","Veteran"] },
  { id:"CT005", name:"LULAC Legal Team",          org:"League of United Latin American Citizens", role:"Legal Advocacy Partner", email:"lulac@lulac.org", phone:"202-833-6130", status:"ACTIVE", priority:"HIGH",     lastContact:"2026-03-01", nextAction:"C004 Park case coordination", caseRef:"C004", tags:["Advocacy","Legal","LULAC"] },
  { id:"CT006", name:"DVSH Field Team",           org:"Deported Veterans Support House", role:"Field Operations — TJ Shelters", email:"info@dvsh.org", phone:"619-555-0142", status:"ACTIVE", priority:"HIGH",     lastContact:"2026-03-20", nextAction:"C005 M. Segura intake update", caseRef:"C005", tags:["Field","Shelter","DVSH"] },
  { id:"CT007", name:"VA SAOF — FOIA Officer",   org:"Dept. of Veterans Affairs",    role:"FOIA Response — F001 Overdue",  email:"vacoforeipa@va.gov", phone:"877-750-3639", status:"OVERDUE", priority:"CRITICAL", lastContact:"2025-09-15", nextAction:"Call — 83d overdue", caseRef:"FOIA", tags:["Federal","FOIA","VA"] },
  { id:"CT008", name:"ICE FOIA Office",           org:"DHS / ICE",                    role:"FOIA Response — F002 Overdue",  email:"foia.ice@dhs.gov", phone:"866-347-2423", status:"OVERDUE", priority:"CRITICAL", lastContact:"2025-10-15", nextAction:"Email + formal appeal", caseRef:"FOIA", tags:["Federal","FOIA","ICE"] },
  { id:"CT009", name:"NARA eVetRecs",             org:"National Archives",             role:"Service Record Requests",       email:"vetrecords@nara.gov", phone:"314-801-0800", status:"PENDING", priority:"HIGH",     lastContact:"2026-02-10", nextAction:"SF-180 status for C002/C003", caseRef:"C002", tags:["Federal","NARA","Records"] },
  { id:"CT010", name:"Casa del Migrante",         org:"Border Shelter — Tijuana",      role:"Veteran Shelter Partner",       email:"info@cdmtijuana.org", phone:"+52-664-685-6888", status:"ACTIVE", priority:"MEDIUM",   lastContact:"2026-03-25", nextAction:"Monthly intake report", caseRef:"C002", tags:["Shelter","Mexico","TJ"] },
  { id:"CT011", name:"AP News — Military Beat",  org:"Associated Press",              role:"Media Outreach — DCAS Story",   email:"info@ap.org", phone:"212-621-1500", status:"PENDING", priority:"MEDIUM",   lastContact:"2026-01-05", nextAction:"BISG findings pitch", caseRef:"DCAS", tags:["Media","AP","Press"] },
  { id:"CT012", name:"Military Times Editorial", org:"Military Times",                role:"Media Partner — Veteran Story",  email:"editor@militarytimes.com", phone:"703-750-8699", status:"PENDING", priority:"MEDIUM",   lastContact:"2025-11-20", nextAction:"C004 Park human interest pitch", caseRef:"C004", tags:["Media","Veterans","Press"] },
];

const OUTREACH_TEMPLATES = [
  { id:"chc-invite",   label:"CHC Briefing Invite",   icon:"🏛️", audience:"Congressional offices", subject:"CHC Briefing — Deported Veterans Crisis: May 18, 2026" },
  { id:"foia-follow",  label:"FOIA Follow-Up",         icon:"📋", audience:"Federal agencies",      subject:"URGENT: FOIA Request [ID] — Statutory Deadline Exceeded" },
  { id:"media-pitch",  label:"Media Pitch",            icon:"📰", audience:"Journalists",           subject:"Forensic Audit Reveals 1,960 Missing Vietnam Veterans — BISG Analysis" },
  { id:"case-update",  label:"Case Status Update",     icon:"🎖️", audience:"Advocates/Partners",    subject:"AUMER Foundation — Case Registry Update [MONTH] 2026" },
  { id:"legal-alert",  label:"Legal Alert",            icon:"⚖️", audience:"Pro bono attorneys",    subject:"Urgent Veteran Case Referral — Deportation/Removal Proceedings" },
];

const STATUS_C = { ACTIVE:P.teal, OVERDUE:P.red, PENDING:P.amber, INACTIVE:P.t4 };
const PRIORITY_C = { CRITICAL:P.red, HIGH:P.amber, MEDIUM:P.gold, LOW:P.teal };

export default function OutreachDashboard() {
  const [contacts, setContacts] = useState(CONTACTS);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [template, setTemplate] = useState("chc-invite");
  const [composing, setComposing] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(null);
  const [sent, setSent] = useState(new Set());
  const [view, setView] = useState("contacts"); // contacts | compose | tracker | analytics

  const filtered = contacts.filter(c=>
    (filterStatus==="ALL" || c.status===filterStatus) &&
    (filterPriority==="ALL" || c.priority===filterPriority) &&
    (!search || c.name.toLowerCase().includes(search.toLowerCase()) || c.org.toLowerCase().includes(search.toLowerCase()) || c.tags.some(t=>t.toLowerCase().includes(search.toLowerCase())))
  );

  const selContact = contacts.find(c=>c.id===selected);
  const tmpl = OUTREACH_TEMPLATES.find(t=>t.id===template);

  const generateDraft = async () => {
    setDraftLoading(true); setDraft("");
    const ctx = selContact ? `Recipient: ${selContact.name}, ${selContact.role} at ${selContact.org}. Case reference: ${selContact.caseRef}. Last contact: ${selContact.lastContact}. Next action: ${selContact.nextAction}.` : `Template: ${tmpl.label} for ${tmpl.audience}.`;
    const res = await base44.integrations.Core.InvokeLLM({
      prompt:`You are a senior communications director for the AUMER Foundation.

Draft a professional ${tmpl.label} email for the following context:
Subject: ${tmpl.subject}
${ctx}

AUMER Context:
- DCAS: 349 official Hispanic Vietnam casualties vs 2,309+ BISG estimate (84.9% gap)
- 6 CB-HSIVF verified cases; C004 (Sae Joon Park) self-deported Nov/Dec 2025
- 3 overdue FOIA requests (VA: 83d, ICE: 66d, INAI: pending)
- CHC Briefing: May 18, 2026 (39 days)
- 115,000 non-citizen veterans at risk

Write a compelling, professional, specific email. Include:
- Powerful opening with specific data point
- Core ask or information (2 paragraphs)
- Specific action requested with deadline
- Professional closing

Keep under 250 words. Do NOT use generic language. Be specific, urgent, and data-driven.`,
    });
    setDraft(res);
    setDraftLoading(false);
  };

  const sendEmail = async (contactId) => {
    const contact = contacts.find(c=>c.id===contactId);
    if (!contact || !draft) return;
    setSending(contactId);
    await base44.integrations.Core.SendEmail({
      to: contact.email,
      subject: tmpl.subject,
      body: draft,
      from_name: "AUMER Foundation — TruthEngine360",
    });
    setSent(p=>new Set([...p, contactId]));
    setContacts(prev=>prev.map(c=>c.id===contactId ? {...c, lastContact:new Date().toISOString().slice(0,10), status:c.status==="OVERDUE"?"PENDING":c.status} : c));
    setSending(null);
  };

  // Analytics
  const OVERDUE = contacts.filter(c=>c.status==="OVERDUE").length;
  const ACTIVE_C = contacts.filter(c=>c.status==="ACTIVE").length;
  const CRITICAL_C = contacts.filter(c=>c.priority==="CRITICAL").length;
  const CHC_DAYS = Math.ceil((new Date("2026-05-18")-new Date())/86400000);

  return (
    <div>
      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:7, marginBottom:12 }}>
        {[
          {l:"Total Contacts",  v:contacts.length, c:P.blue},
          {l:"Active",          v:ACTIVE_C,         c:P.teal},
          {l:"Overdue Actions", v:OVERDUE,           c:P.red},
          {l:"Critical",        v:CRITICAL_C,        c:P.red},
          {l:"CHC in Days",     v:CHC_DAYS,          c:CHC_DAYS<=30?P.red:P.amber},
          {l:"Sent This Session",v:sent.size,        c:P.violet},
        ].map((s,i)=>(
          <div key={i} style={{ background:P.card, border:`1px solid ${s.c}25`, borderLeft:`3px solid ${s.c}`, borderRadius:7, padding:"8px 12px" }}>
            <div style={{ fontSize:7, color:P.t4, marginBottom:2 }}>{s.l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:20, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display:"flex", gap:0, marginBottom:10, background:P.card, border:`1px solid ${P.b}`, borderRadius:8, overflow:"hidden", width:"fit-content" }}>
        {[["contacts","📇 Contacts"],["compose","✉️ Compose"],["tracker","📊 Action Tracker"]].map(([v,l])=>(
          <button key={v} onClick={()=>setView(v)}
            style={{ padding:"7px 14px", background:view===v?`${P.teal}15`:"transparent",
              border:"none", borderRight:`1px solid ${P.b}`, color:view===v?P.teal:P.t4,
              fontSize:9, fontWeight:view===v?700:400, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace" }}>
            {l}
          </button>
        ))}
      </div>

      {view === "contacts" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 220px", gap:10 }}>
          <div>
            {/* Filters */}
            <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap", alignItems:"center" }}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contacts..."
                style={{ padding:"5px 10px", background:"#080D18", border:`1px solid ${search?P.gold:P.b}`,
                  borderRadius:20, color:P.t1, fontSize:8, fontFamily:"'IBM Plex Mono',monospace", outline:"none", width:130 }} />
              {["ALL","ACTIVE","OVERDUE","PENDING"].map(s=>(
                <button key={s} onClick={()=>setFilterStatus(s)}
                  style={{ padding:"3px 9px", fontSize:7, background:filterStatus===s?`${STATUS_C[s]||P.violet}18`:"transparent",
                    border:`1px solid ${filterStatus===s?(STATUS_C[s]||P.violet):P.b}`, borderRadius:20,
                    color:filterStatus===s?(STATUS_C[s]||P.violet):P.t4, cursor:"pointer" }}>
                  {s}
                </button>
              ))}
              {["ALL","CRITICAL","HIGH","MEDIUM"].map(p=>(
                <button key={p} onClick={()=>setFilterPriority(p)}
                  style={{ padding:"3px 9px", fontSize:7, background:filterPriority===p?`${PRIORITY_C[p]||P.violet}18`:"transparent",
                    border:`1px solid ${filterPriority===p?(PRIORITY_C[p]||P.violet):P.b}`, borderRadius:20,
                    color:filterPriority===p?(PRIORITY_C[p]||P.violet):P.t4, cursor:"pointer" }}>
                  {p}
                </button>
              ))}
            </div>

            {filtered.map(c=>{
              const sc=STATUS_C[c.status]||P.t4;
              const pc=PRIORITY_C[c.priority]||P.t4;
              const isSel=selected===c.id;
              const isSent=sent.has(c.id);
              return (
                <div key={c.id} onClick={()=>setSelected(isSel?null:c.id)}
                  style={{ background:isSel?`${pc}08`:P.card, border:`1px solid ${isSel?pc+"40":P.b}`,
                    borderLeft:`5px solid ${sc}`, borderRadius:9, padding:"10px 14px", marginBottom:6, cursor:"pointer" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", gap:7, alignItems:"center", flexWrap:"wrap", marginBottom:3 }}>
                        <span style={{ fontSize:10, fontWeight:800, color:isSel?pc:P.t1 }}>{c.name}</span>
                        <span style={{ fontSize:7, background:`${sc}15`, border:`1px solid ${sc}20`, color:sc, borderRadius:20, padding:"1px 6px", fontWeight:700 }}>{c.status}</span>
                        <span style={{ fontSize:7, background:`${pc}15`, border:`1px solid ${pc}20`, color:pc, borderRadius:20, padding:"1px 6px" }}>{c.priority}</span>
                        {isSent && <span style={{ fontSize:7, color:P.teal }}>✓ Sent</span>}
                      </div>
                      <div style={{ fontSize:8, color:P.t3, marginBottom:2 }}>{c.role} · {c.org}</div>
                      <div style={{ fontSize:7, color:P.amber }}>→ {c.nextAction}</div>
                    </div>
                    <div style={{ flexShrink:0, textAlign:"right" }}>
                      <div style={{ fontSize:7, color:P.t4 }}>{c.caseRef}</div>
                      <div style={{ fontSize:6, color:P.t4, marginTop:2 }}>Last: {c.lastContact}</div>
                      <div style={{ display:"flex", gap:4, marginTop:5, justifyContent:"flex-end", flexWrap:"wrap" }}>
                        {c.phone && <a href={`tel:${c.phone}`} onClick={e=>e.stopPropagation()}
                          style={{ fontSize:7, padding:"2px 6px", background:`${P.teal}10`, border:`1px solid ${P.teal}20`, color:P.teal, borderRadius:4, textDecoration:"none" }}>📞</a>}
                        {c.email && <a href={`mailto:${c.email}`} onClick={e=>e.stopPropagation()}
                          style={{ fontSize:7, padding:"2px 6px", background:`${P.blue}10`, border:`1px solid ${P.blue}20`, color:P.blue, borderRadius:4, textDecoration:"none" }}>✉️</a>}
                      </div>
                    </div>
                  </div>
                  {isSel && (
                    <div style={{ marginTop:8, paddingTop:6, borderTop:`1px solid ${P.b}30` }}>
                      <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:5 }}>
                        {c.tags.map(t=><span key={t} style={{ fontSize:6, background:`${pc}10`, border:`1px solid ${pc}20`, color:pc, borderRadius:20, padding:"1px 6px" }}>{t}</span>)}
                      </div>
                      <div style={{ fontSize:8, color:P.t4 }}>{c.email} · {c.phone}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick actions sidebar */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <div style={{ background:P.card, border:`1px solid ${P.red}30`, borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontSize:7, color:P.red, fontWeight:700, letterSpacing:2, marginBottom:8 }}>🚨 OVERDUE ACTIONS</div>
              {contacts.filter(c=>c.status==="OVERDUE").map(c=>(
                <div key={c.id} style={{ marginBottom:8, padding:"7px 10px", background:`${P.red}08`, border:`1px solid ${P.red}20`, borderRadius:7 }}>
                  <div style={{ fontSize:8, fontWeight:700, color:P.red }}>{c.name}</div>
                  <div style={{ fontSize:7, color:P.t4, marginTop:2 }}>{c.nextAction}</div>
                  <a href={`tel:${c.phone}`} style={{ fontSize:7, color:P.red, textDecoration:"none", marginTop:3, display:"block" }}>📞 {c.phone}</a>
                </div>
              ))}
            </div>
            <div style={{ background:P.card, border:`1px solid ${P.amber}20`, borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontSize:7, color:P.amber, fontWeight:700, letterSpacing:2, marginBottom:8 }}>📅 NEXT ACTIONS</div>
              {contacts.filter(c=>c.priority==="CRITICAL"&&c.status!=="OVERDUE").slice(0,4).map(c=>(
                <div key={c.id} style={{ fontSize:8, color:P.t3, padding:"4px 0", borderBottom:`1px solid ${P.b}20` }}>
                  <span style={{ color:P.amber, fontWeight:700 }}>{c.name.split(" ")[0]}:</span> {c.nextAction}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === "compose" && (
        <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:12 }}>
          {/* Template selector */}
          <div>
            <div style={{ fontSize:7, color:P.t4, letterSpacing:3, marginBottom:6 }}>TEMPLATE</div>
            {OUTREACH_TEMPLATES.map(t=>(
              <div key={t.id} onClick={()=>setTemplate(t.id)}
                style={{ background:template===t.id?`${P.teal}10`:P.card,
                  border:`1px solid ${template===t.id?P.teal+"50":P.b}`,
                  borderLeft:`3px solid ${template===t.id?P.teal:P.b}`,
                  borderRadius:8, padding:"8px 10px", marginBottom:6, cursor:"pointer" }}>
                <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                  <span style={{ fontSize:12 }}>{t.icon}</span>
                  <span style={{ fontSize:9, fontWeight:700, color:template===t.id?P.teal:P.t1 }}>{t.label}</span>
                </div>
                <div style={{ fontSize:6, color:P.t4, marginTop:2 }}>For: {t.audience}</div>
              </div>
            ))}

            {/* Contact selector */}
            <div style={{ fontSize:7, color:P.t4, letterSpacing:3, marginTop:10, marginBottom:6 }}>SEND TO</div>
            <select value={selected||""} onChange={e=>setSelected(e.target.value||null)}
              style={{ width:"100%", padding:"7px 8px", background:"#080D18", border:`1px solid ${P.b}`, borderRadius:7, color:P.t1, fontSize:7, outline:"none" }}>
              <option value="">Select contact...</option>
              {contacts.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Compose panel */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontSize:8, color:P.t4, marginBottom:4 }}>SUBJECT</div>
              <div style={{ fontSize:10, color:P.t1, fontWeight:700 }}>{tmpl?.subject}</div>
              {selContact && <div style={{ fontSize:8, color:P.teal, marginTop:3 }}>To: {selContact.name} — {selContact.email}</div>}
            </div>

            <button onClick={generateDraft} disabled={draftLoading}
              style={{ padding:"9px", background:draftLoading?P.b:`linear-gradient(135deg,${P.teal},${P.blue})`,
                color:draftLoading?P.t4:"#fff", border:"none", borderRadius:8, fontSize:10,
                fontWeight:800, cursor:draftLoading?"not-allowed":"pointer", fontFamily:"'IBM Plex Mono',monospace" }}>
              {draftLoading?"⟳ Drafting...":"✨ AI Draft Email"}
            </button>

            {draft && (
              <div>
                <textarea value={draft} onChange={e=>setDraft(e.target.value)}
                  style={{ width:"100%", height:240, padding:"12px 14px", background:"#080D18",
                    border:`1px solid ${P.teal}30`, borderRadius:8, color:P.t2,
                    fontSize:9, fontFamily:"'IBM Plex Mono',monospace", outline:"none",
                    resize:"vertical", lineHeight:1.7, boxSizing:"border-box" }} />
                <div style={{ display:"flex", gap:8, marginTop:6 }}>
                  {selContact && (
                    <button onClick={()=>sendEmail(selContact.id)} disabled={!!sending||sent.has(selContact.id)}
                      style={{ flex:1, padding:"9px", background:sent.has(selContact.id)?`${P.teal}18`:sending?P.b:`linear-gradient(135deg,${P.gold},${P.amber})`,
                        color:sent.has(selContact.id)?P.teal:sending?P.t4:"#000", border:`1px solid ${sent.has(selContact.id)?P.teal:"transparent"}`,
                        borderRadius:8, fontSize:10, fontWeight:800, cursor:sending||sent.has(selContact.id)?"not-allowed":"pointer",
                        fontFamily:"'IBM Plex Mono',monospace" }}>
                      {sending===selContact.id?"⟳ Sending...":sent.has(selContact.id)?"✓ Sent":"📧 Send Email"}
                    </button>
                  )}
                  <button onClick={()=>{
                    const blob=new Blob([draft],{type:"text/plain"});
                    const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
                    a.download=`AUMER_${template}_${Date.now()}.txt`; a.click();
                  }} style={{ padding:"9px 12px", background:`${P.blue}18`, border:`1px solid ${P.blue}30`,
                    color:P.blue, borderRadius:8, fontSize:9, fontWeight:700, cursor:"pointer" }}>
                    ↓ Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {view === "tracker" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10, marginBottom:12 }}>
            {[
              {
                status:"OVERDUE", label:"Overdue Actions", color:P.red,
                items:contacts.filter(c=>c.status==="OVERDUE")
              },
              {
                status:"PENDING", label:"Awaiting Response", color:P.amber,
                items:contacts.filter(c=>c.status==="PENDING")
              },
              {
                status:"ACTIVE", label:"Active Engagement", color:P.teal,
                items:contacts.filter(c=>c.status==="ACTIVE")
              },
            ].map(col=>(
              <div key={col.status} style={{ background:P.card, border:`1px solid ${col.color}20`, borderRadius:10, overflow:"hidden" }}>
                <div style={{ background:`${col.color}12`, borderBottom:`1px solid ${col.color}20`,
                  padding:"8px 12px", display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontSize:9, fontWeight:700, color:col.color }}>{col.label}</span>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:800, color:col.color }}>{col.items.length}</span>
                </div>
                <div style={{ padding:"8px" }}>
                  {col.items.map(c=>(
                    <div key={c.id} style={{ background:"#080D18", borderRadius:7, padding:"7px 9px", marginBottom:6 }}>
                      <div style={{ fontSize:8, fontWeight:700, color:col.color }}>{c.name}</div>
                      <div style={{ fontSize:7, color:P.t4, marginTop:1 }}>{c.nextAction}</div>
                      <div style={{ fontSize:6, color:P.t4, marginTop:1 }}>Last: {c.lastContact} · {c.caseRef}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CHC countdown */}
          <div style={{ background:P.card, border:`1px solid ${P.gold}30`, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:9, fontWeight:700, color:P.gold, letterSpacing:2, marginBottom:10 }}>🏛️ CHC OUTREACH CHECKLIST — MAY 18, 2026 ({CHC_DAYS}d)</div>
            {[
              {task:"CHC Chair office — briefing confirmation",done:false, contact:"CT001"},
              {task:"Rep. Barragán — DCAS one-pager delivered",done:false, contact:"CT002"},
              {task:"Rep. Espaillat — IIRIRA legal memo",done:false, contact:"CT003"},
              {task:"Sen. Duckworth office — S.874 status",done:true,  contact:"CT004"},
              {task:"LULAC Legal — C004 Park coordination",done:false, contact:"CT005"},
              {task:"VA SAOF FOIA call — 83d overdue",done:false, contact:"CT007"},
              {task:"ICE FOIA email + formal appeal",done:false, contact:"CT008"},
              {task:"AP News pitch — BISG findings",done:false, contact:"CT011"},
            ].map((item,i)=>{
              const relContact=contacts.find(c=>c.id===item.contact);
              return (
                <div key={i} style={{ display:"flex", gap:10, alignItems:"center", padding:"6px 0", borderBottom:`1px solid ${P.b}20` }}>
                  <div style={{ width:14, height:14, borderRadius:3,
                    background:item.done?`${P.teal}18`:"transparent",
                    border:`2px solid ${item.done?P.teal:P.b}`,
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {item.done&&<span style={{ fontSize:8, color:P.teal }}>✓</span>}
                  </div>
                  <span style={{ flex:1, fontSize:8, color:item.done?P.t4:P.t2, textDecoration:item.done?"line-through":"none" }}>{item.task}</span>
                  {relContact && (
                    <div style={{ display:"flex", gap:4 }}>
                      <a href={`tel:${relContact.phone}`} style={{ fontSize:7, padding:"1px 6px", background:`${P.teal}10`, border:`1px solid ${P.teal}20`, color:P.teal, borderRadius:4, textDecoration:"none" }}>📞</a>
                      <a href={`mailto:${relContact.email}`} style={{ fontSize:7, padding:"1px 6px", background:`${P.blue}10`, border:`1px solid ${P.blue}20`, color:P.blue, borderRadius:4, textDecoration:"none" }}>✉️</a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}