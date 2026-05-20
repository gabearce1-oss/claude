import { useState } from "react";
import { P } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

const DATABASES = [
  {
    id:"scra",
    name:"SCRA — Service Members Civil Relief Act",
    icon:"🛡️",
    url:"https://scra.dmdc.osd.mil/scra/#/home",
    agency:"DoD DMDC",
    color:P.blue,
    access:"Public — Name/SSN Certificate Lookup",
    description:"Verifies active duty status of service members. Generates PDF certificates with DoD seal. Used to confirm current military service and protect deportation candidates.",
    fields:["SSN (last 4)", "Last Name", "Date of Birth", "Branch of Service"],
    useCases:[
      "Confirm active duty status before ICE removal proceedings",
      "Generate official DoD certificate for CHC briefing",
      "Cross-reference DCAS casualties with active period dates",
    ],
    lookupFields:["ssn","lastName","dob"],
    apiNote:"DoD web form — certificate generation only. No bulk API.",
    caseRelevance:"HIGH",
  },
  {
    id:"nara",
    name:"NARA — National Archives Military Records",
    icon:"🏛️",
    url:"https://www.archives.gov/research/military",
    agency:"NARA",
    color:P.gold,
    access:"Public + FOIA — eVetRecs Portal",
    description:"Repository of all military personnel, medical, and historical records. Primary source for DD-214 discharge papers, Official Military Personnel Files (OMPF), and pre-SCRA service records.",
    fields:["Service Number", "Full Name", "Dates of Service", "Branch", "Discharge Status"],
    useCases:[
      "Obtain DD-214 for all 6 CB-HSIVF verified cases",
      "Request OMPF for Vietnam-era casualties classified as 'White'",
      "Access historical service records for BISG surname re-audit",
    ],
    lookupFields:["name","serviceNumber","datesOfService"],
    apiNote:"eVetRecs form required. SF-180 for deceased veterans.",
    caseRelevance:"CRITICAL",
  },
  {
    id:"fold3",
    name:"Fold3 — Military Records Archive",
    icon:"📜",
    url:"https://www.fold3.com/",
    agency:"Ancestry/Fold3",
    color:P.violet,
    access:"Subscription — Digitized Historical Records",
    description:"World's largest online collection of digitized military records. Includes WWII draft cards, Vietnam-era Selective Service records, courts martial, pension files, and immigration naturalization linked to military service.",
    fields:["Name", "War/Conflict", "Service Branch", "Draft Registration"],
    useCases:[
      "Locate Selective Service draft records for Hispanic surname cohorts",
      "Cross-reference WWI/WWII military naturalization records",
      "Find pension records linking service to citizenship claims",
    ],
    lookupFields:["name","conflict","state"],
    apiNote:"Subscription-based. Fold3 API available for institutional partners.",
    caseRelevance:"HIGH",
  },
  {
    id:"dwp",
    name:"DWP — Defense Manpower Data Center Status Finder",
    icon:"🔍",
    url:"https://dwp.dmdc.osd.mil/dwp/app/status-finder",
    agency:"DoD DMDC",
    color:P.teal,
    access:"Public — Active Duty & Veteran Status",
    description:"DMDC real-time status finder for DoD beneficiaries. Verifies current or historical military status, service dates, and reserve component affiliation. Critical for establishing veteran status in removal proceedings.",
    fields:["Last Name", "SSN or DoD ID", "Date of Birth"],
    useCases:[
      "Real-time veteran status verification for border shelter intakes",
      "Establish DoD record linkage for cases lacking DD-214",
      "Cross-validate ICE removal orders against active military status",
    ],
    lookupFields:["lastName","ssn","dob"],
    apiNote:"Public web form. Data returned as on-screen status only.",
    caseRelevance:"CRITICAL",
  },
];

const CASE_MATRIX = [
  { id:"C001", name:"Ramos",         scra:"✓ Discharged",  nara:"✓ OMPF Obtained", fold3:"✓ Draft found",  dwp:"✓ Veteran" },
  { id:"C002", name:"M. Valenzuela", scra:"— Civilian",    nara:"⏳ Requested",    fold3:"✓ USMC record",  dwp:"⚠ Not found" },
  { id:"C003", name:"V. Valenzuela", scra:"— Civilian",    nara:"⏳ Requested",    fold3:"✓ USMC record",  dwp:"⚠ Not found" },
  { id:"C004", name:"Sae Joon Park", scra:"— Discharged",  nara:"⏳ Pending",      fold3:"— N/A",           dwp:"✓ Veteran" },
  { id:"C005", name:"M. Segura",     scra:"— Civilian",    nara:"⏳ SF-180 Filed", fold3:"⏳ Searching",    dwp:"⚠ Partial" },
  { id:"C006", name:"J. Duran",      scra:"— Civilian",    nara:"❌ Not filed",     fold3:"⏳ Searching",    dwp:"❌ No record" },
];

const STATUS_C = (v) => v.startsWith("✓")?P.teal:v.startsWith("❌")?P.red:v.startsWith("⚠")?P.amber:v.startsWith("⏳")?P.blue:P.t4;

export default function MilitaryDBs() {
  const [active, setActive] = useState("scra");
  const [lookupData, setLookupData] = useState({});
  const [querying, setQuerying] = useState(null);
  const [queryResult, setQueryResult] = useState(null);
  const [view, setView] = useState("databases"); // databases | matrix | batch

  const db = DATABASES.find(d=>d.id===active);

  const simulateLookup = async () => {
    setQuerying(active);
    setQueryResult(null);
    await new Promise(r=>setTimeout(r, 1800));
    const results = await base44.integrations.Core.InvokeLLM({
      prompt: `You are simulating a ${db.name} database query for the AUMER Foundation's veteran deportation research. 
      
Query parameters: ${JSON.stringify(lookupData)}
Database: ${db.name} (${db.url})
Agency: ${db.agency}

Provide a realistic simulated response for what this database would return for a search related to a Hispanic veteran deportation case. Include:
- Status/Record found indicator
- Key fields returned (service dates, branch, discharge type, etc.)
- Any flags or notes relevant to immigration proceedings
- Record ID or reference number
- Confidence level

Keep it realistic and grounded in the actual database's data model. Format as a brief structured response.`,
      response_json_schema:{
        type:"object",
        properties:{
          status:{type:"string"},
          record_found:{type:"boolean"},
          fields:{type:"object",properties:{},additionalProperties:true},
          flags:{type:"array",items:{type:"string"}},
          reference_id:{type:"string"},
          confidence:{type:"string"},
          notes:{type:"string"},
        }
      }
    });
    setQueryResult(results);
    setQuerying(null);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:7, marginBottom:12 }}>
        {[
          {l:"Military DBs Integrated", v:DATABASES.length, c:P.blue},
          {l:"Critical Access", v:DATABASES.filter(d=>d.caseRelevance==="CRITICAL").length, c:P.red},
          {l:"Cases Cross-Referenced", v:CASE_MATRIX.length, c:P.gold},
          {l:"Full Record Coverage", v:"C001 only", c:P.amber},
        ].map((s,i)=>(
          <div key={i} style={{ background:P.card, border:`1px solid ${s.c}25`, borderLeft:`3px solid ${s.c}`, borderRadius:7, padding:"8px 12px" }}>
            <div style={{ fontSize:7, color:P.t4, marginBottom:2 }}>{s.l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:typeof s.v==="number"?20:11, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display:"flex", gap:0, marginBottom:10, background:P.card, border:`1px solid ${P.b}`, borderRadius:8, overflow:"hidden", width:"fit-content" }}>
        {[["databases","🗄️ Database Hub"],["matrix","📊 Case Matrix"],["batch","⚡ Batch Lookup"]].map(([v,l])=>(
          <button key={v} onClick={()=>setView(v)}
            style={{ padding:"7px 14px", background:view===v?`${P.gold}15`:"transparent",
              border:"none", borderRight:`1px solid ${P.b}`, color:view===v?P.gold:P.t4,
              fontSize:9, fontWeight:view===v?700:400, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace" }}>
            {l}
          </button>
        ))}
      </div>

      {view === "databases" && (
        <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:12 }}>
          {/* DB selector */}
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {DATABASES.map(d=>(
              <div key={d.id} onClick={()=>setActive(d.id)}
                style={{ background:active===d.id?`${d.color}12`:P.card,
                  border:`1px solid ${active===d.id?d.color+"50":P.b}`,
                  borderLeft:`4px solid ${active===d.id?d.color:P.b}`,
                  borderRadius:8, padding:"9px 12px", cursor:"pointer" }}>
                <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:2 }}>
                  <span style={{ fontSize:16 }}>{d.icon}</span>
                  <span style={{ fontSize:9, fontWeight:700, color:active===d.id?d.color:P.t1 }}>{d.agency}</span>
                </div>
                <div style={{ fontSize:7, color:P.t4 }}>{d.name.split("—")[1]?.trim()}</div>
                <div style={{ marginTop:4, fontSize:6, background:`${d.color}15`, border:`1px solid ${d.color}20`, color:d.color, borderRadius:20, padding:"1px 6px", display:"inline-block" }}>
                  {d.caseRelevance}
                </div>
              </div>
            ))}
          </div>

          {/* DB detail */}
          {db && (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ background:P.card, border:`1px solid ${db.color}30`, borderRadius:10, padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:20, marginBottom:2 }}>{db.icon}</div>
                    <div style={{ fontSize:14, fontWeight:800, color:db.color }}>{db.name}</div>
                    <div style={{ fontSize:8, color:P.t3, marginTop:2 }}>{db.access}</div>
                  </div>
                  <a href={db.url} target="_blank" rel="noreferrer"
                    style={{ padding:"7px 14px", background:`${db.color}18`, border:`1px solid ${db.color}30`,
                      color:db.color, borderRadius:7, fontSize:8, fontWeight:700, textDecoration:"none",
                      flexShrink:0, display:"flex", alignItems:"center", gap:5 }}>
                    🔗 Open Database
                  </a>
                </div>
                <div style={{ fontSize:9, color:P.t2, lineHeight:1.8, marginBottom:10 }}>{db.description}</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <div style={{ background:"#080D18", borderRadius:8, padding:"10px 12px" }}>
                    <div style={{ fontSize:7, color:P.t4, letterSpacing:1, marginBottom:6 }}>DATA FIELDS</div>
                    {db.fields.map((f,i)=><div key={i} style={{ fontSize:8, color:P.t2, padding:"2px 0", borderBottom:`1px solid ${P.b}20` }}>• {f}</div>)}
                  </div>
                  <div style={{ background:"#080D18", borderRadius:8, padding:"10px 12px" }}>
                    <div style={{ fontSize:7, color:P.t4, letterSpacing:1, marginBottom:6 }}>AUMER USE CASES</div>
                    {db.useCases.map((u,i)=><div key={i} style={{ fontSize:8, color:db.color, padding:"2px 0", borderBottom:`1px solid ${P.b}20`, lineHeight:1.4 }}>→ {u}</div>)}
                  </div>
                </div>
                <div style={{ marginTop:8, fontSize:7, color:P.t4, background:`${P.b}15`, borderRadius:6, padding:"5px 10px" }}>
                  ℹ {db.apiNote}
                </div>
              </div>

              {/* Query simulator */}
              <div style={{ background:P.card, border:`1px solid ${db.color}20`, borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:8, fontWeight:700, color:db.color, letterSpacing:2, marginBottom:8 }}>
                  🔬 AI QUERY SIMULATOR — {db.agency}
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:8 }}>
                  {db.lookupFields.map(f=>(
                    <input key={f} value={lookupData[f]||""} onChange={e=>setLookupData(p=>({...p,[f]:e.target.value}))}
                      placeholder={f.replace(/([A-Z])/g," $1").trim()}
                      style={{ flex:1, minWidth:100, padding:"6px 10px", background:"#080D18",
                        border:`1px solid ${P.b}`, borderRadius:7, color:P.t1,
                        fontSize:8, fontFamily:"'IBM Plex Mono',monospace", outline:"none" }} />
                  ))}
                  <button onClick={simulateLookup} disabled={querying===active}
                    style={{ padding:"7px 14px", background:querying===active?P.b:`linear-gradient(135deg,${db.color},${P.violet})`,
                      color:querying===active?P.t4:"#fff", border:"none", borderRadius:7, fontSize:9,
                      fontWeight:800, cursor:querying===active?"not-allowed":"pointer", fontFamily:"'IBM Plex Mono',monospace" }}>
                    {querying===active?"⟳ Querying...":"▶ Simulate Query"}
                  </button>
                </div>

                {queryResult && (
                  <div style={{ background:"#080D18", border:`1px solid ${queryResult.record_found?P.teal:P.amber}30`, borderRadius:8, padding:"10px 12px" }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6 }}>
                      <span style={{ fontSize:10 }}>{queryResult.record_found?"✓":"⚠"}</span>
                      <span style={{ fontSize:10, fontWeight:700, color:queryResult.record_found?P.teal:P.amber }}>
                        {queryResult.status}
                      </span>
                      <span style={{ fontSize:7, color:P.t4 }}>Ref: {queryResult.reference_id}</span>
                      <span style={{ fontSize:7, background:`${db.color}12`, border:`1px solid ${db.color}20`, color:db.color, borderRadius:20, padding:"1px 6px", marginLeft:"auto" }}>
                        Confidence: {queryResult.confidence}
                      </span>
                    </div>
                    {queryResult.fields && Object.entries(queryResult.fields).map(([k,v])=>(
                      <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:8, padding:"2px 0", borderBottom:`1px solid ${P.b}20` }}>
                        <span style={{ color:P.t4 }}>{k}</span>
                        <span style={{ color:P.t2, fontFamily:"'IBM Plex Mono',monospace" }}>{String(v)}</span>
                      </div>
                    ))}
                    {queryResult.flags?.length>0 && (
                      <div style={{ marginTop:6 }}>
                        {queryResult.flags.map((f,i)=>(
                          <span key={i} style={{ fontSize:7, background:`${P.red}12`, border:`1px solid ${P.red}20`, color:P.red, borderRadius:20, padding:"1px 8px", marginRight:5 }}>⚑ {f}</span>
                        ))}
                      </div>
                    )}
                    {queryResult.notes && <div style={{ fontSize:8, color:P.t3, marginTop:6, lineHeight:1.5 }}>{queryResult.notes}</div>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {view === "matrix" && (
        <div>
          <div style={{ fontSize:8, color:P.t3, marginBottom:10 }}>
            Record coverage matrix — 6 CB-HSIVF verified cases × 4 military databases. Click ⏳ entries to initiate lookup.
          </div>
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, overflow:"hidden" }}>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"#080D18" }}>
                    <th style={{ padding:"10px 14px", textAlign:"left", fontSize:8, color:P.t4, letterSpacing:1, borderBottom:`1px solid ${P.b}` }}>CASE</th>
                    {DATABASES.map(d=>(
                      <th key={d.id} style={{ padding:"10px 14px", textAlign:"center", fontSize:8, color:d.color, letterSpacing:1, borderBottom:`1px solid ${P.b}`, whiteSpace:"nowrap" }}>
                        {d.icon} {d.agency}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CASE_MATRIX.map((row,i)=>(
                    <tr key={i} style={{ borderBottom:`1px solid ${P.b}20` }}>
                      <td style={{ padding:"10px 14px" }}>
                        <div style={{ fontSize:8, fontWeight:700, color:P.t1 }}>{row.name}</div>
                        <div style={{ fontSize:7, color:P.t4 }}>{row.id}</div>
                      </td>
                      {[row.scra, row.nara, row.fold3, row.dwp].map((v,j)=>(
                        <td key={j} style={{ padding:"10px 14px", textAlign:"center" }}>
                          <span style={{ fontSize:8, color:STATUS_C(v), fontWeight:v.startsWith("✓")||v.startsWith("❌")?700:400 }}>{v}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:8, flexWrap:"wrap" }}>
            {[["✓ Obtained",P.teal],["⏳ Pending",P.blue],["⚠ Partial",P.amber],["❌ Missing",P.red],["— N/A",P.t4]].map(([l,c])=>(
              <div key={l} style={{ display:"flex", gap:5, alignItems:"center" }}>
                <span style={{ fontSize:9, color:c }}>{l.split(" ")[0]}</span>
                <span style={{ fontSize:7, color:P.t4 }}>{l.split(" ").slice(1).join(" ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "batch" && (
        <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"16px" }}>
          <div style={{ fontSize:9, fontWeight:700, color:P.gold, marginBottom:8 }}>⚡ BATCH CROSS-REFERENCE PROTOCOL</div>
          <div style={{ fontSize:8, color:P.t3, lineHeight:1.8, marginBottom:12 }}>
            Systematic protocol for cross-referencing all 6 CB-HSIVF cases against all 4 military databases. Recommended sequence:
          </div>
          {[
            {step:1, action:"DMDC Status Finder (DWP)", detail:"Run all 6 cases — establish DoD record baseline", db:"dwp", priority:"IMMEDIATE"},
            {step:2, action:"SCRA Certificate Pull", detail:"Generate DoD-sealed PDFs for active/recent cases", db:"scra", priority:"HIGH"},
            {step:3, action:"NARA eVetRecs — SF-180", detail:"Submit for all 6 OMPFs + DD-214s", db:"nara", priority:"HIGH"},
            {step:4, action:"Fold3 Draft Record Search", detail:"Locate Selective Service records for BISG validation", db:"fold3", priority:"MEDIUM"},
            {step:5, action:"Cross-validate with DCAS", detail:"Match obtained records against 349 coded records", db:null, priority:"HIGH"},
            {step:6, action:"SHA-256 certify new records", detail:"Add all obtained records to evidence ledger", db:null, priority:"HIGH"},
          ].map((s,i)=>(
            <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"10px 0", borderBottom:`1px solid ${P.b}20` }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:16, fontWeight:800,
                color:s.priority==="IMMEDIATE"?P.red:s.priority==="HIGH"?P.amber:P.gold, flexShrink:0, width:24, textAlign:"center" }}>
                {s.step}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, fontWeight:700, color:P.t1, marginBottom:2 }}>{s.action}</div>
                <div style={{ fontSize:8, color:P.t3 }}>{s.detail}</div>
              </div>
              <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
                <span style={{ fontSize:7, padding:"2px 7px", borderRadius:20,
                  background:s.priority==="IMMEDIATE"?`${P.red}18`:s.priority==="HIGH"?`${P.amber}18`:`${P.gold}18`,
                  border:`1px solid ${s.priority==="IMMEDIATE"?P.red:s.priority==="HIGH"?P.amber:P.gold}30`,
                  color:s.priority==="IMMEDIATE"?P.red:s.priority==="HIGH"?P.amber:P.gold }}>
                  {s.priority}
                </span>
                {s.db && (
                  <a href={DATABASES.find(d=>d.id===s.db)?.url} target="_blank" rel="noreferrer"
                    style={{ fontSize:7, padding:"2px 7px", borderRadius:20, background:`${P.blue}12`,
                      border:`1px solid ${P.blue}20`, color:P.blue, textDecoration:"none" }}>
                    Open ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}