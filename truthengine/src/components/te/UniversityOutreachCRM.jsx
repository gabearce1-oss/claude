import { useState } from "react";
import { P } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

const ORG_FROM = {
  name: "AUMER Foundation",
  ein: "99-0495658",
  contact: "Gabriel T. Arce Jr.",
  email: "gtarce@usc.edu",
  phone: "(760) 453-8421",
};

const UNIVERSITY_REQUESTS = [
  {
    id:"UNI-001",
    institution:"UNAM — Instituto de Investigaciones Jurídicas",
    program:"SUDIMER (Seminario Universitario de Derechos Humanos, Inclusión y Migraciones)",
    contact:"Dra. Luciana Gandini, Coordinadora",
    email:"sudimer@unam.mx",
    url:"https://www.juridicas.unam.mx/en/generador/detalle/109",
    type:"Data Access + Collaboration",
    priority:"HIGH", status:"DRAFT", week:"Week 1 (Apr 8–14)",
    color:P.gold,
    subject:"Research Collaboration Request — 33 Migration Databases × DCAS Forensic Audit | AUMER Foundation",
    body:`Dear Dr. Gandini,

I am writing on behalf of the AUMER Foundation (501(c)(3), EIN 99-0495658), a nonprofit conducting forensic research on deported U.S. military veterans under our Exile Patriot Project. We are preparing a briefing for the Congressional Hispanic Caucus (May 18, 2026).

SUDIMER has created 33 databases from Mexican and US institutional sources covering detentions, deportations, returns, and asylum requests (2000–2024). We would like to request:

1) Access to the 33-database compilation for cross-referencing with our DCAS forensic audit of Vietnam War casualty classification (349 Hispanic-coded of 58,220 total — 84.9% failure rate using BISG methodology, τ=0.40, R²=0.947).

2) Any datasets specific to veteran deportees or military-connected migrants.

3) Potential collaboration opportunity for the academic paper being co-authored with Prof. Marco Durazo (USF) using our forensic dataset, targeting submission to a peer-reviewed journal (target: Estudios Fronterizos or Journal of Ethnic and Migration Studies).

We would welcome a video call to discuss data sharing protocols and mutual research interests.

Sincerely,
${ORG_FROM.contact}
${ORG_FROM.name} | ${ORG_FROM.type}, EIN ${ORG_FROM.ein}
${ORG_FROM.email} | ${ORG_FROM.phone}`,
    dataAsked:["33-database compilation (2000–2024)","Veteran deportee sub-dataset","Military-connected migrant records"],
    potentialOutput:"DCAS ↔ SUDIMER forensic crosswalk. Strengthens Stream 2 BISG validation.",
  },
  {
    id:"UNI-002",
    institution:"El Colegio de la Frontera Norte (COLEF)",
    program:"EMIF Norte — Encuesta sobre Migración en la Frontera Norte",
    contact:"EMIF Research Team",
    email:"emif@colef.mx",
    url:"https://www.colef.mx/emif/",
    type:"Microdata Access",
    priority:"HIGH", status:"DRAFT", week:"Week 1 (Apr 8–14)",
    color:P.teal,
    subject:"EMIF Norte Microdata Access Request — Deported Veterans Research | AUMER Foundation CHC 2026",
    body:`Dear EMIF Norte Research Team,

I am writing on behalf of the AUMER Foundation (501(c)(3), EIN 99-0495658), conducting forensic research on deported U.S. military veterans.

We request access to EMIF Norte microdata for the 'Devueltos por autoridades migratorias de EE.UU.' flow, 2015–2023, specifically:

1) Variables related to length of US residence, family separation, and detention conditions.
2) Any military service variable or proxy indicator in the survey instrument.
3) Geographic data on deportation destination (Tijuana, Mexicali, Nogales, etc.).

Purpose: Cross-reference with 6 verified deported veteran cases documented by AUMER Foundation (CB-HSIVF certified), and to validate BISG demographic estimates of Hispanic Vietnam War casualties (DCAS forensic audit: 349 officially coded, 2,309 estimated via BISG τ=0.40).

We are preparing a Congressional Hispanic Caucus briefing for May 18, 2026, and academic publication with Prof. Marco Durazo (USF).

We are happy to sign a data sharing agreement and acknowledge COLEF in any publications.

Sincerely,
${ORG_FROM.contact}
${ORG_FROM.name} | ${ORG_FROM.type}, EIN ${ORG_FROM.ein}
${ORG_FROM.email} | ${ORG_FROM.phone}`,
    dataAsked:["EMIF Norte 'Devueltos' flow microdata 2015–2023","Military service variable / proxy","Deportation destination geo-data"],
    potentialOutput:"Deportee population model validation. Primary Mexican data source for NERO-O vector.",
  },
  {
    id:"UNI-003",
    institution:"Universidad Autónoma de Baja California (UABC)",
    program:"Estudios Fronterizos — Revista de Estudios Fronterizos",
    contact:"Editorial Board",
    email:"ref@uabc.mx",
    url:"https://ref.uabc.mx/ojs/index.php/ref/",
    type:"Journal Submission + Repository Access",
    priority:"LOW", status:"DRAFT", week:"Week 4 (Apr 29–May 5)",
    color:P.blue,
    subject:"Article Submission Proposal — DCAS Forensic Audit + Deported Veterans | AUMER Foundation",
    body:`Dear Estudios Fronterizos Editorial Board,

We propose submission of a research article to Estudios Fronterizos (UABC/COLEF) documenting:

1) DCAS forensic audit methodology and findings: 84.9% Hispanic classification failure rate in Vietnam War casualty records (349 officially coded of 58,220; BISG estimate: 2,309; R²=0.947; τ=0.40 stable threshold).

2) Cross-border veteran erasure: 6 verified deported veteran cases with CB-HSIVF evidence certification, SHA-256 chain of custody, from Mexico, Colombia, and South Korea.

3) TruthEngine360 forensic platform architecture for civic record analysis — open-source methodology available for replication.

We also request access to UABC Repositorio Institucional datasets on transnational deportee populations in the Tijuana–San Diego corridor, specifically theses and papers on non-criminal deportees and ICE/local police arrest patterns.

Co-authors: Gabriel T. Arce Jr. (AUMER Foundation) + Prof. Marco Durazo (University of San Francisco, PhD, USF).

Sincerely,
${ORG_FROM.contact}
${ORG_FROM.name} | ${ORG_FROM.type}, EIN ${ORG_FROM.ein}
${ORG_FROM.email} | ${ORG_FROM.phone}`,
    dataAsked:["UABC Repositorio: transnational deportee datasets","Tijuana–San Diego corridor deportation theses"],
    potentialOutput:"Peer-reviewed publication in Estudios Fronterizos. Academic citation for CHC briefing.",
  },
];

const ADDITIONAL_CONTACTS = [
  { id:"AC-001", name:"Prof. Marco Durazo", org:"University of San Francisco", email:"marco.durazo@usfca.edu", role:"Co-author — Stream 7 qualitative", status:"ACTIVE", priority:"HIGH", color:P.gold },
  { id:"AC-002", name:"Rep. Robert Garcia / CHC", org:"Congressional Hispanic Caucus", email:"chc@mail.house.gov", role:"Primary congressional target", status:"PENDING", priority:"CRITICAL", color:P.red },
  { id:"AC-003", name:"LULAC National Legal", org:"League of United Latin American Citizens", email:"lulac@lulac.org", role:"Legal advocacy partner", status:"ACTIVE", priority:"HIGH", color:P.amber },
  { id:"AC-004", name:"Al Otro Lado — Tijuana", org:"Al Otro Lado Legal Services", email:"info@alotrolado.org", role:"Field partner — C002/C003 coordination", status:"ACTIVE", priority:"HIGH", color:P.teal },
  { id:"AC-005", name:"Bernie Amador", org:"LULAC Deported Veterans Advocate", email:"bamador@lulac.org", role:"Field advocate — TJ shelter network", status:"ACTIVE", priority:"HIGH", color:P.violet },
];

const STATUS_C = { DRAFT:P.t4, SENT:P.blue, REPLIED:P.teal, PENDING:P.amber, REJECTED:P.red, ACTIVE:P.teal };
const PRIORITY_C = { CRITICAL:P.red, HIGH:P.amber, MEDIUM:P.blue, LOW:P.teal };

export default function UniversityOutreachCRM() {
  const [view, setView] = useState("universities"); // universities | contacts | activity
  const [selected, setSelected] = useState(null);
  const [statuses, setStatuses] = useState({});
  const [sending, setSending] = useState(null);
  const [sent, setSent] = useState(new Set());
  const [copied, setCopied] = useState(null);
  const [notes, setNotes] = useState({});
  const [noteInput, setNoteInput] = useState("");

  const selReq = UNIVERSITY_REQUESTS.find(r => r.id === selected);
  const getStatus = (id) => statuses[id] || "DRAFT";
  const setStatus = (id, s) => setStatuses(p => ({...p,[id]:s}));

  const sendEmail = async (req) => {
    setSending(req.id);
    await base44.integrations.Core.SendEmail({
      to: ORG_FROM.email,
      subject: `[TE360 OUTREACH DRAFT] ${req.id}: ${req.subject}`,
      body: `AUMER Foundation University Outreach — Draft Ready\n\nRequest: ${req.id}\nInstitution: ${req.institution}\nTo: ${req.contact} <${req.email}>\nType: ${req.type}\nPriority: ${req.priority}\nFiling Week: ${req.week}\n\n${"═".repeat(60)}\n\nSUBJECT: ${req.subject}\n\n${req.body}\n\n${"═".repeat(60)}\n\nPortal/URL: ${req.url}`,
    });
    setSent(p => new Set([...p,req.id]));
    setStatus(req.id, "SENT");
    setSending(null);
  };

  const copyBody = (req) => {
    navigator.clipboard.writeText(`Subject: ${req.subject}\n\n${req.body}`);
    setCopied(req.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const addNote = (id) => {
    if (!noteInput.trim()) return;
    setNotes(p => ({...p,[id]:[...(p[id]||[]),{text:noteInput,time:new Date().toLocaleString()}]}));
    setNoteInput("");
  };

  return (
    <div>
      <div style={{ marginBottom:10 }}>
        <div style={{ fontSize:12,fontWeight:800,color:P.t1 }}>🎓 University Outreach <span style={{ color:P.teal }}>CRM</span></div>
        <div style={{ fontSize:7,color:P.t4,letterSpacing:2 }}>3 UNIVERSITY REQUESTS · 5 KEY CONTACTS · EMAIL DRAFTS · COLLABORATION TRACKING</div>
      </div>

      {/* KPI strip */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:6,marginBottom:10 }}>
        {[
          ["Uni Requests",3,P.blue],["Key Contacts",ADDITIONAL_CONTACTS.length,P.gold],
          ["Sent",sent.size,P.teal],["Draft",3-sent.size,P.amber],
          ["Days to CHC",Math.ceil((new Date("2026-05-18")-new Date())/86400000),P.red],
        ].map(([l,v,c])=>(
          <div key={l} style={{ background:P.card,border:`1px solid ${c}25`,borderLeft:`3px solid ${c}`,borderRadius:7,padding:"5px 9px" }}>
            <div style={{ fontSize:6,color:P.t4 }}>{l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:800,color:c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display:"flex",gap:0,marginBottom:10,background:P.card,border:`1px solid ${P.b}`,borderRadius:8,overflow:"hidden",width:"fit-content" }}>
        {[["universities","🎓 University Requests"],["contacts","📇 Key Contacts"],["activity","📊 Activity Log"]].map(([v,l])=>(
          <button key={v} onClick={()=>{setView(v);setSelected(null);}}
            style={{ padding:"7px 16px",background:view===v?`${P.teal}18`:"transparent",
              border:"none",borderRight:`1px solid ${P.b}`,color:view===v?P.teal:P.t4,
              fontSize:9,fontWeight:view===v?700:400,cursor:"pointer" }}>
            {l}
          </button>
        ))}
      </div>

      {view === "universities" && (
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          <div>
            {UNIVERSITY_REQUESTS.map(r=>{
              const isSel=selected===r.id;
              const status=getStatus(r.id);
              const sc=STATUS_C[status]||P.t4;
              const pc=PRIORITY_C[r.priority]||P.t4;
              return (
                <div key={r.id} onClick={()=>setSelected(isSel?null:r.id)}
                  style={{ background:isSel?`${r.color}08`:P.card,
                    border:`1px solid ${isSel?r.color+"50":P.b+"40"}`,
                    borderLeft:`5px solid ${r.color}`,
                    borderRadius:9,padding:"10px 14px",marginBottom:7,cursor:"pointer" }}>
                  <div style={{ display:"flex",gap:5,alignItems:"center",flexWrap:"wrap",marginBottom:3 }}>
                    <span style={{ fontSize:7,color:P.t4 }}>{r.id}</span>
                    <span style={{ fontSize:9,fontWeight:800,color:r.color }}>{r.institution}</span>
                  </div>
                  <div style={{ fontSize:7,color:P.t3,marginBottom:3 }}>{r.program}</div>
                  <div style={{ fontSize:7,color:P.t4,marginBottom:5 }}>{r.contact} · {r.email}</div>
                  <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:5 }}>
                    <span style={{ fontSize:6,background:`${pc}12`,border:`1px solid ${pc}20`,color:pc,borderRadius:20,padding:"1px 6px",fontWeight:700 }}>{r.priority}</span>
                    <span style={{ fontSize:6,background:`${sc}12`,border:`1px solid ${sc}20`,color:sc,borderRadius:20,padding:"1px 6px",fontWeight:700 }}>{status}</span>
                    <span style={{ fontSize:6,color:P.t4 }}>{r.week}</span>
                    <span style={{ fontSize:6,background:`${r.color}10`,color:r.color,borderRadius:20,padding:"1px 6px",border:`1px solid ${r.color}20` }}>{r.type}</span>
                  </div>
                  <div style={{ fontSize:7,color:P.t3 }}>Data needed: {r.dataAsked.join(" · ")}</div>
                  <div style={{ marginTop:4,display:"flex",gap:5 }}>
                    <select value={status} onChange={e=>{e.stopPropagation();setStatus(r.id,e.target.value);}}
                      onClick={e=>e.stopPropagation()}
                      style={{ padding:"2px 6px",background:"#080D18",border:`1px solid ${P.b}`,borderRadius:4,color:sc,fontSize:6,outline:"none" }}>
                      {["DRAFT","SENT","PENDING","REPLIED","REJECTED"].map(s=>(
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          {selReq ? (
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              <div style={{ background:P.card,border:`1px solid ${selReq.color}30`,borderRadius:10,padding:"14px 16px" }}>
                <div style={{ fontSize:7,color:selReq.color,fontWeight:700,letterSpacing:2,marginBottom:3 }}>{selReq.id} · {selReq.type}</div>
                <div style={{ fontSize:10,fontWeight:800,color:P.t1,marginBottom:6 }}>{selReq.institution}</div>
                <div style={{ fontSize:8,color:P.teal,marginBottom:2 }}>To: {selReq.contact}</div>
                <div style={{ fontSize:7,color:P.blue,marginBottom:8 }}>
                  <a href={`mailto:${selReq.email}`} style={{ color:P.blue }}>{selReq.email}</a> · <a href={selReq.url} target="_blank" rel="noreferrer" style={{ color:P.blue }}>Website ↗</a>
                </div>

                <div style={{ marginBottom:6 }}>
                  <div style={{ fontSize:6,color:P.t4,letterSpacing:1,marginBottom:3 }}>POTENTIAL OUTPUT</div>
                  <div style={{ fontSize:8,color:P.gold,padding:"5px 8px",background:`${P.gold}08`,borderRadius:5 }}>{selReq.potentialOutput}</div>
                </div>

                <div style={{ marginBottom:6 }}>
                  <div style={{ fontSize:6,color:P.t4,letterSpacing:1,marginBottom:3 }}>EMAIL BODY</div>
                  <pre style={{ background:"#080D18",borderRadius:7,padding:"10px 12px",fontSize:7,color:P.t2,
                    lineHeight:1.8,whiteSpace:"pre-wrap",maxHeight:220,overflowY:"auto",
                    fontFamily:"'IBM Plex Mono',monospace",margin:0 }}>
                    {selReq.body}
                  </pre>
                </div>

                <div style={{ display:"flex",gap:6,marginBottom:8 }}>
                  <button onClick={()=>copyBody(selReq)}
                    style={{ flex:1,padding:"7px",fontSize:8,fontWeight:700,cursor:"pointer",
                      background:copied===selReq.id?`${P.teal}15`:`${P.blue}12`,
                      border:`1px solid ${copied===selReq.id?P.teal:P.blue}25`,
                      color:copied===selReq.id?P.teal:P.blue,borderRadius:7 }}>
                    {copied===selReq.id?"✓ Copied!":"⎘ Copy Email"}
                  </button>
                  <a href={selReq.url} target="_blank" rel="noreferrer"
                    style={{ flex:1,padding:"7px",fontSize:8,fontWeight:700,textDecoration:"none",
                      background:`${selReq.color}12`,border:`1px solid ${selReq.color}25`,
                      color:selReq.color,borderRadius:7,textAlign:"center" }}>
                    🔗 Institution ↗
                  </a>
                  <button onClick={()=>sendEmail(selReq)} disabled={sending===selReq.id||sent.has(selReq.id)}
                    style={{ flex:1,padding:"7px",fontSize:8,fontWeight:700,cursor:"pointer",
                      background:sent.has(selReq.id)?`${P.teal}15`:`${P.amber}12`,
                      border:`1px solid ${sent.has(selReq.id)?P.teal:P.amber}25`,
                      color:sent.has(selReq.id)?P.teal:P.amber,borderRadius:7 }}>
                    {sending===selReq.id?"⟳":sent.has(selReq.id)?"✓ Emailed":"📧 Send Draft"}
                  </button>
                </div>

                {/* Notes */}
                <div style={{ fontSize:6,color:P.t4,letterSpacing:1,marginBottom:5 }}>NOTES / LOG</div>
                <div style={{ display:"flex",gap:5,marginBottom:6 }}>
                  <input value={noteInput} onChange={e=>setNoteInput(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter")addNote(selReq.id);}}
                    placeholder="Add note... (Enter)"
                    style={{ flex:1,padding:"5px 8px",background:"#080D18",border:`1px solid ${P.b}`,
                      borderRadius:5,color:P.t1,fontSize:7,outline:"none",fontFamily:"'IBM Plex Mono',monospace" }} />
                  <button onClick={()=>addNote(selReq.id)}
                    style={{ padding:"5px 8px",fontSize:8,cursor:"pointer",
                      background:`${P.gold}12`,border:`1px solid ${P.gold}25`,color:P.gold,borderRadius:5 }}>+</button>
                </div>
                {(notes[selReq.id]||[]).map((n,i)=>(
                  <div key={i} style={{ fontSize:7,color:P.t3,padding:"3px 0",borderBottom:`1px solid ${P.b}20` }}>
                    <span style={{ color:P.t4,marginRight:6 }}>{n.time}</span>{n.text}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ background:P.card,border:`1px solid ${P.b}`,borderRadius:10,padding:"30px",textAlign:"center" }}>
              <div style={{ fontSize:24,marginBottom:8 }}>🎓</div>
              <div style={{ fontSize:9,color:P.t4 }}>Select a request to view the draft email and send.</div>
            </div>
          )}
        </div>
      )}

      {view === "contacts" && (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:8 }}>
          {ADDITIONAL_CONTACTS.map(c=>{
            const sc=STATUS_C[c.status]||P.t4;
            const pc=PRIORITY_C[c.priority]||P.t4;
            return (
              <div key={c.id} style={{ background:P.card,border:`1px solid ${c.color}25`,borderLeft:`5px solid ${c.color}`,borderRadius:9,padding:"12px 14px" }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                  <div style={{ fontSize:10,fontWeight:800,color:c.color }}>{c.name}</div>
                  <div style={{ display:"flex",gap:4,alignItems:"center" }}>
                    <span style={{ width:7,height:7,borderRadius:"50%",background:sc }} />
                    <span style={{ fontSize:6,color:sc,fontWeight:700 }}>{c.status}</span>
                  </div>
                </div>
                <div style={{ fontSize:7,color:P.t3,marginBottom:2 }}>{c.org}</div>
                <div style={{ fontSize:7,color:P.t4,marginBottom:6 }}>{c.role}</div>
                <div style={{ display:"flex",gap:5 }}>
                  <span style={{ fontSize:6,background:`${pc}12`,border:`1px solid ${pc}20`,color:pc,borderRadius:20,padding:"1px 6px",fontWeight:700 }}>{c.priority}</span>
                  <a href={`mailto:${c.email}`}
                    style={{ fontSize:7,color:P.blue,textDecoration:"none",padding:"1px 6px",
                      background:`${P.blue}10`,border:`1px solid ${P.blue}20`,borderRadius:20 }}>
                    📧 {c.email}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "activity" && (
        <div style={{ background:P.card,border:`1px solid ${P.b}`,borderRadius:10,padding:"14px 16px" }}>
          <div style={{ fontSize:9,fontWeight:700,color:P.teal,marginBottom:10 }}>📊 Outreach Activity</div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:8 }}>
            {UNIVERSITY_REQUESTS.map(r=>{
              const status=getStatus(r.id);
              const sc=STATUS_C[status]||P.t4;
              return (
                <div key={r.id} style={{ background:"#080D18",border:`1px solid ${r.color}20`,borderLeft:`4px solid ${r.color}`,borderRadius:7,padding:"10px 12px" }}>
                  <div style={{ fontSize:8,fontWeight:700,color:r.color,marginBottom:2 }}>{r.id} — {r.institution.split("—")[0].trim()}</div>
                  <div style={{ fontSize:7,color:P.t4,marginBottom:5 }}>{r.contact} · {r.email}</div>
                  <div style={{ display:"flex",gap:5,alignItems:"center" }}>
                    <span style={{ width:8,height:8,borderRadius:"50%",background:sc }} />
                    <span style={{ fontSize:7,color:sc,fontWeight:700 }}>{status}</span>
                    <span style={{ fontSize:6,color:P.t4,marginLeft:"auto" }}>{r.week}</span>
                  </div>
                  {(notes[r.id]||[]).length > 0 && (
                    <div style={{ marginTop:5,fontSize:6,color:P.t4 }}>
                      Last note: {notes[r.id][notes[r.id].length-1].text}
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