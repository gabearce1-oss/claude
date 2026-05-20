import { useState } from "react";
import { P } from "../../lib/teData";

const N8N_BASE = "https://qt360.app.n8n.cloud";

const PIPELINES = [
  {
    id:"p001", name:"DCAS → BISG Auto-Reconciliation", status:"ACTIVE", icon:"💀",
    trigger:"Scheduled · Daily 06:00 UTC", lastRun:"2026-04-09 06:02",
    nodes:["HTTP Request (DCAS CSV)", "BISG Surname Lookup", "R²=0.947 Validator", "Base44 ResearchDoc Entity", "Email: gtarce@usc.edu"],
    description:"Downloads latest DCAS extract, applies BISG τ=0.40 threshold, computes updated Hispanic estimate, saves to ResearchDoc.",
    color:P.red, webhookPath:"/webhook/dcas-bisg",
    runs:142, errors:2, successRate:98.6,
  },
  {
    id:"p002", name:"ICE ERO Statistics Monitor", status:"ACTIVE", icon:"🚔",
    trigger:"Scheduled · Weekly Monday 08:00 UTC", lastRun:"2026-04-07 08:01",
    nodes:["HTTP Request (ice.gov/statistics)", "Parse Excel/CSV", "Diff vs Previous Week", "Alert if Delta > 5%", "HubSpot Deal Update"],
    description:"Monitors ICE ERO published statistics weekly, detects changes in removal rates, updates HubSpot case deals.",
    color:P.amber, webhookPath:"/webhook/ice-monitor",
    runs:38, errors:0, successRate:100,
  },
  {
    id:"p003", name:"FOIA Deadline Tracker", status:"ACTIVE", icon:"📋",
    trigger:"Scheduled · Daily 09:00 UTC", lastRun:"2026-04-09 09:00",
    nodes:["Read FOIA Log (Airtable)", "Calculate Days Overdue", "Branch: Overdue?", "Send Email Alert", "HubSpot Task Create"],
    description:"Checks all open FOIA requests daily, calculates overdue days, sends escalation emails and creates HubSpot tasks.",
    color:P.violet, webhookPath:"/webhook/foia-track",
    runs:87, errors:1, successRate:98.9,
  },
  {
    id:"p004", name:"Google Scholar Research Crawler", status:"ACTIVE", icon:"🎓",
    trigger:"Triggered: /webhook/scholar-crawl", lastRun:"2026-04-08 14:22",
    nodes:["Webhook Trigger", "Google Scholar Scrape", "LLM Relevance Filter", "ResearchDoc Entity Create", "Slack Notification"],
    description:"On-demand academic search pipeline. Triggered from TE360 Scholar tab, saves relevant results to ResearchDoc entity.",
    color:P.blue, webhookPath:"/webhook/scholar-crawl",
    runs:23, errors:0, successRate:100,
  },
  {
    id:"p005", name:"SDSU Digital Collections Sync", status:"ACTIVE", icon:"🌊",
    trigger:"Triggered: /webhook/sdsu-sync", lastRun:"2026-04-07 10:05",
    nodes:["Webhook Trigger", "SDSU API Fetch", "AI Relevance Filter", "ResearchDoc Save", "HubSpot Activity Log"],
    description:"Syncs SDSU Vietnam War digital collections, filters for Chicano/Latino veteran relevance, saves to knowledge base.",
    color:P.teal, webhookPath:"/webhook/sdsu-sync",
    runs:12, errors:0, successRate:100,
  },
  {
    id:"p006", name:"Deportation Data Project Monitor", status:"PAUSED", icon:"📊",
    trigger:"Scheduled · Monthly 1st · 07:00 UTC", lastRun:"2026-04-01 07:04",
    nodes:["HTTP Request (deportationdata.org)", "CSV Parse + Normalize", "Match vs Veteran Registry", "Flag Veteran Matches", "Email Report"],
    description:"Monthly download of Deportation Data Project CSV, cross-references against AUMER veteran registry, flags potential matches.",
    color:P.gold, webhookPath:"/webhook/ddp-monitor",
    runs:3, errors:0, successRate:100,
  },
  {
    id:"p007", name:"HubSpot → TE360 Case Sync", status:"ACTIVE", icon:"🟠",
    trigger:"Triggered: HubSpot Deal Updated", lastRun:"2026-04-09 11:34",
    nodes:["HubSpot Trigger", "Map Deal Fields", "TE360 Case Update API", "SHA-256 Hash Record", "Airtable Log"],
    description:"Bidirectional sync between HubSpot CRM deals and TE360 case registry. Any HubSpot update propagates to TE360.",
    color:"#FF7A59", webhookPath:"/webhook/hubspot-sync",
    runs:204, errors:3, successRate:98.5,
  },
  {
    id:"p008", name:"CHC Briefing Package Builder", status:"PAUSED", icon:"🏛️",
    trigger:"Manual · On-demand", lastRun:"2026-03-15 16:00",
    nodes:["Manual Trigger", "Pull All 6 Case Files", "Generate AI Summary (Claude)", "Build PDF Package", "Email to CHC + LULAC"],
    description:"Builds the full CHC congressional briefing package on demand — pulls all 6 verified cases, AI drafts, exports PDF.",
    color:P.violet, webhookPath:"/webhook/chc-build",
    runs:4, errors:0, successRate:100,
  },
];

const CODE_EXAMPLES = {
  webhook: `// n8n HTTP Request node → Base44 webhook
// POST to your Base44 function endpoint
{
  "method": "POST",
  "url": "https://your-app.base44.app/api/functions/processN8nData",
  "authentication": "genericCredentialType",
  "headers": {
    "Content-Type": "application/json",
    "x-api-key": "{{ $env.BASE44_WEBHOOK_KEY }}"
  },
  "body": {
    "pipeline": "{{ $workflow.name }}",
    "data": "{{ $json }}",
    "timestamp": "{{ $now }}"
  }
}`,
  dcas: `// DCAS CSV Download + BISG node
const csv = await $http.get('https://dcas.dmdc.osd.mil/...');
const rows = parseCSV(csv);
const bisgResult = rows.map(r => ({
  ...r,
  bisg_p_hispanic: bisgSurname(r.lastName, 0.40),
  estimated_hispanic: bisgSurname(r.lastName, 0.40) > 0.40
}));
const estimated = bisgResult.filter(r => r.estimated_hispanic).length;
return { total: rows.length, dcas_coded: 349, bisg_estimated: estimated };`,
  foia: `// FOIA Overdue Calculator
const requests = await airtable.get('FOIA_Log');
const now = new Date();
const overdue = requests.filter(r => {
  const deadline = new Date(r.filed_date);
  deadline.setDate(deadline.getDate() + 20); // FOIA 20-day rule
  return now > deadline && r.status === 'PENDING';
}).map(r => ({
  ...r,
  days_overdue: Math.floor((now - new Date(r.filed_date)) / 86400000) - 20
}));
if (overdue.length > 0) {
  await email.send({ to: 'gtarce@usc.edu', subject: \`\${overdue.length} FOIA overdue\` });
}`,
};

const STATUS_C = { ACTIVE:P.teal, PAUSED:P.amber, ERROR:P.red };

export default function N8nPipeline() {
  const [selected, setSelected] = useState(null);
  const [codeTab, setCodeTab] = useState("webhook");
  const [view, setView] = useState("pipelines"); // pipelines | setup | monitor

  const selPipeline = PIPELINES.find(p => p.id === selected);
  const totalRuns = PIPELINES.reduce((a,p)=>a+p.runs,0);
  const totalErrors = PIPELINES.reduce((a,p)=>a+p.errors,0);
  const avgSuccess = (PIPELINES.reduce((a,p)=>a+p.successRate,0)/PIPELINES.length).toFixed(1);

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P.t1 }}>⚡ n8n Data <span style={{ color: P.violet }}>Pipeline Integration</span></div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>qt360.app.n8n.cloud · 8 WORKFLOWS · DCAS · FOIA · HUBSPOT · SCHOLAR</div>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))", gap:7, marginBottom:10 }}>
        {[
          ["Total Workflows",PIPELINES.length,P.blue],
          ["Active",PIPELINES.filter(p=>p.status==="ACTIVE").length,P.teal],
          ["Paused",PIPELINES.filter(p=>p.status==="PAUSED").length,P.amber],
          ["Total Runs",totalRuns,P.violet],
          ["Total Errors",totalErrors,P.red],
          ["Avg Success",avgSuccess+"%",P.gold],
        ].map(([l,v,c])=>(
          <div key={l} style={{ background:P.card,border:`1px solid ${c}25`,borderLeft:`3px solid ${c}`,borderRadius:7,padding:"6px 10px" }}>
            <div style={{ fontSize:6,color:P.t4 }}>{l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:800,color:c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display:"flex", gap:0, marginBottom:10, background:P.card, border:`1px solid ${P.b}`, borderRadius:8, overflow:"hidden", width:"fit-content" }}>
        {[["pipelines","⚡ Workflows"],["setup","🔧 Setup Guide"],["monitor","📡 Live Monitor"]].map(([v,l]) => (
          <button key={v} onClick={() => setView(v)}
            style={{ padding:"7px 16px", background:view===v?`${P.violet}18`:"transparent",
              border:"none", borderRight:`1px solid ${P.b}`, color:view===v?P.violet:P.t4,
              fontSize:9, fontWeight:view===v?700:400, cursor:"pointer" }}>
            {l}
          </button>
        ))}
      </div>

      {view === "pipelines" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {/* Pipeline list */}
          <div>
            {PIPELINES.map(p => {
              const isSel = selected === p.id;
              const sc = STATUS_C[p.status] || P.t4;
              return (
                <div key={p.id} onClick={() => setSelected(isSel ? null : p.id)}
                  style={{ background:isSel?`${p.color}08`:P.card,
                    border:`1px solid ${isSel?p.color+"40":P.b+"40"}`,
                    borderLeft:`5px solid ${p.color}`,
                    borderRadius:9,padding:"10px 14px",marginBottom:7,cursor:"pointer" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex",gap:6,alignItems:"center",marginBottom:2 }}>
                        <span style={{ fontSize:12 }}>{p.icon}</span>
                        <span style={{ fontSize:9,fontWeight:800,color:p.color }}>{p.name}</span>
                      </div>
                      <div style={{ fontSize:7,color:P.t4 }}>{p.trigger}</div>
                    </div>
                    <div style={{ display:"flex",gap:5,alignItems:"center" }}>
                      <span style={{ width:7,height:7,borderRadius:"50%",background:sc,
                        boxShadow:p.status==="ACTIVE"?`0 0 6px ${sc}`:undefined }} />
                      <span style={{ fontSize:6,color:sc,fontWeight:700 }}>{p.status}</span>
                    </div>
                  </div>
                  <div style={{ fontSize:7,color:P.t3,lineHeight:1.5,marginBottom:6 }}>{p.description}</div>
                  <div style={{ display:"flex",gap:8,fontSize:7 }}>
                    <span style={{ color:P.t4 }}>Runs: <span style={{ color:P.blue,fontWeight:700 }}>{p.runs}</span></span>
                    <span style={{ color:P.t4 }}>Errors: <span style={{ color:p.errors?P.red:P.teal,fontWeight:700 }}>{p.errors}</span></span>
                    <span style={{ color:P.t4 }}>Success: <span style={{ color:p.successRate===100?P.teal:P.gold,fontWeight:700 }}>{p.successRate}%</span></span>
                  </div>
                  {isSel && (
                    <div style={{ marginTop:8,paddingTop:8,borderTop:`1px solid ${P.b}30` }}>
                      <div style={{ fontSize:6,color:P.t4,letterSpacing:1,marginBottom:5 }}>PIPELINE NODES</div>
                      <div style={{ display:"flex",flexWrap:"wrap",gap:3 }}>
                        {p.nodes.map((n,i) => (
                          <span key={i} style={{ fontSize:6,padding:"2px 7px",
                            background:`${p.color}10`,border:`1px solid ${p.color}20`,
                            color:p.color,borderRadius:20 }}>
                            {i+1}. {n}
                          </span>
                        ))}
                      </div>
                      <div style={{ marginTop:8,display:"flex",gap:6 }}>
                        <a href={`${N8N_BASE}/home/workflows`} target="_blank" rel="noreferrer"
                          style={{ padding:"4px 10px",fontSize:7,fontWeight:700,cursor:"pointer",
                            background:`${p.color}12`,border:`1px solid ${p.color}25`,
                            color:p.color,borderRadius:6,textDecoration:"none" }}>
                          🔗 Open in n8n ↗
                        </a>
                        <span style={{ fontSize:7,color:P.t4,alignSelf:"center" }}>
                          Webhook: <span style={{ fontFamily:"'IBM Plex Mono',monospace",color:P.violet }}>{N8N_BASE}{p.webhookPath}</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right panel: live status + code */}
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {/* n8n instance status */}
            <div style={{ background:P.card,border:`1px solid ${P.violet}30`,borderRadius:10,padding:"12px 14px" }}>
              <div style={{ fontSize:8,fontWeight:700,color:P.violet,marginBottom:8 }}>⚙️ n8n Instance</div>
              {[
                {l:"Instance URL",v:"qt360.app.n8n.cloud",c:P.teal,link:`${N8N_BASE}/home/workflows`},
                {l:"API Key Status",v:"⚠️ Set N8N_API_KEY in env vars",c:P.amber,link:null},
                {l:"Base URL Env",v:"N8N_BASE_URL = qt360.app.n8n.cloud",c:P.blue,link:null},
                {l:"Active Workflows",v:`${PIPELINES.filter(p=>p.status==="ACTIVE").length} / ${PIPELINES.length}`,c:P.teal,link:null},
              ].map(({l,v,c,link})=>(
                <div key={l} style={{ display:"flex",justifyContent:"space-between",fontSize:7,padding:"5px 0",borderBottom:`1px solid ${P.b}20` }}>
                  <span style={{ color:P.t4 }}>{l}</span>
                  {link ? (
                    <a href={link} target="_blank" rel="noreferrer" style={{ color:c,fontWeight:700,textDecoration:"none",fontFamily:"'IBM Plex Mono',monospace",fontSize:6 }}>{v} ↗</a>
                  ) : (
                    <span style={{ color:c,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace",fontSize:6 }}>{v}</span>
                  )}
                </div>
              ))}
              <a href={`${N8N_BASE}/home/workflows`} target="_blank" rel="noreferrer"
                style={{ display:"block",marginTop:10,padding:"7px",background:`${P.violet}12`,
                  border:`1px solid ${P.violet}25`,color:P.violet,borderRadius:7,
                  fontSize:8,textDecoration:"none",textAlign:"center",fontWeight:700 }}>
                🔗 Open n8n Dashboard ↗
              </a>
            </div>

            {/* Quick links */}
            <div style={{ background:P.card,border:`1px solid ${P.b}`,borderRadius:10,padding:"12px 14px" }}>
              <div style={{ fontSize:7,color:P.t4,letterSpacing:2,marginBottom:8 }}>🔗 QUICK LINKS</div>
              {[
                {l:"n8n Workflow Dashboard", url:`${N8N_BASE}/home/workflows`, c:P.violet},
                {l:"n8n Credentials", url:`${N8N_BASE}/home/credentials`, c:P.teal},
                {l:"n8n Executions Log", url:`${N8N_BASE}/home/executions`, c:P.blue},
                {l:"deportationdata.org CSV", url:"https://deportationdata.org/data.html", c:P.red},
                {l:"TRAC ICE Removals", url:"https://tracreports.org/phptools/immigration/remove/about_data.html", c:P.amber},
                {l:"DHS OHSS Monthly Tables", url:"https://ohss.dhs.gov/topics/immigration/immigration-enforcement/monthly-tables", c:P.gold},
                {l:"COLEF EMIF Microdata", url:"https://www.colef.mx/emif/basescuestionarios.html", c:P.teal},
              ].map(({l,url,c})=>(
                <a key={l} href={url} target="_blank" rel="noreferrer"
                  style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
                    padding:"5px 0",borderBottom:`1px solid ${P.b}20`,textDecoration:"none" }}>
                  <span style={{ fontSize:7,color:c }}>{l}</span>
                  <span style={{ fontSize:7,color:P.t4 }}>↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === "setup" && (
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          <div>
            <div style={{ background:P.card,border:`1px solid ${P.b}`,borderRadius:10,padding:"14px 16px",marginBottom:10 }}>
              <div style={{ fontSize:9,fontWeight:700,color:P.gold,marginBottom:8 }}>📋 Setup Checklist</div>
              {[
                [true,"n8n cloud instance — qt360.app.n8n.cloud"],
                [false,"Set N8N_API_KEY in Base44 env vars"],
                [false,"Set N8N_BASE_URL = qt360.app.n8n.cloud"],
                [true,"HubSpot CRM — API key configured"],
                [true,"Airtable — workspace access"],
                [false,"ICE ERO webhook registration"],
                [true,"Base44 ResearchDoc entity — live"],
                [false,"DCAS download automation — test run"],
              ].map(([done,label],i)=>(
                <div key={i} style={{ display:"flex",gap:8,alignItems:"center",padding:"5px 0",borderBottom:`1px solid ${P.b}20` }}>
                  <span style={{ color:done?P.teal:P.amber,fontSize:10 }}>{done?"✓":"○"}</span>
                  <span style={{ fontSize:8,color:done?P.t2:P.amber }}>{label}</span>
                </div>
              ))}
            </div>

            <div style={{ background:P.card,border:`1px solid ${P.b}`,borderRadius:10,padding:"14px 16px" }}>
              <div style={{ fontSize:9,fontWeight:700,color:P.blue,marginBottom:8 }}>🔧 Environment Variables Needed</div>
              {["N8N_API_KEY","N8N_BASE_URL","HUBSPOT_API_KEY","AIRTABLE_API_KEY","BASE44_WEBHOOK_KEY"].map(k=>(
                <div key={k} style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:P.violet,
                  padding:"4px 8px",background:"#080D18",borderRadius:5,marginBottom:4 }}>
                  {k}=<span style={{ color:P.t4 }}>your-key-here</span>
                </div>
              ))}
              <div style={{ fontSize:7,color:P.t4,marginTop:6 }}>Add in Dashboard → Settings → Environment Variables</div>
            </div>
          </div>

          {/* Code examples */}
          <div style={{ background:P.card,border:`1px solid ${P.b}`,borderRadius:10,overflow:"hidden" }}>
            <div style={{ display:"flex",gap:0,borderBottom:`1px solid ${P.b}` }}>
              {[["webhook","Base44 Webhook"],["dcas","DCAS + BISG"],["foia","FOIA Tracker"]].map(([k,l])=>(
                <button key={k} onClick={()=>setCodeTab(k)}
                  style={{ padding:"8px 14px",background:codeTab===k?`${P.violet}15`:"transparent",
                    border:"none",borderRight:`1px solid ${P.b}`,color:codeTab===k?P.violet:P.t4,
                    fontSize:7,fontWeight:codeTab===k?700:400,cursor:"pointer" }}>
                  {l}
                </button>
              ))}
            </div>
            <pre style={{ margin:0,padding:"14px 16px",background:"transparent",color:P.t2,
              fontSize:7,lineHeight:1.9,overflowX:"auto",fontFamily:"'IBM Plex Mono',monospace",
              whiteSpace:"pre-wrap",maxHeight:400,overflowY:"auto" }}>
              {CODE_EXAMPLES[codeTab]}
            </pre>
          </div>
        </div>
      )}

      {view === "monitor" && (
        <div>
          <div style={{ background:P.card,border:`1px solid ${P.b}`,borderRadius:10,padding:"14px 16px",marginBottom:10 }}>
            <div style={{ fontSize:9,fontWeight:700,color:P.teal,marginBottom:10 }}>📡 Live Pipeline Status</div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:8 }}>
              {PIPELINES.map(p=>{
                const sc=STATUS_C[p.status]||P.t4;
                return (
                  <div key={p.id} style={{ background:"#080D18",border:`1px solid ${p.color}20`,borderLeft:`4px solid ${p.color}`,borderRadius:7,padding:"8px 10px" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                      <span style={{ fontSize:8,fontWeight:700,color:p.color }}>{p.icon} {p.name.split(" ").slice(0,3).join(" ")}</span>
                      <div style={{ display:"flex",gap:4,alignItems:"center" }}>
                        <span style={{ width:7,height:7,borderRadius:"50%",background:sc,
                          boxShadow:p.status==="ACTIVE"?`0 0 5px ${sc}`:undefined }} />
                        <span style={{ fontSize:6,color:sc,fontWeight:700 }}>{p.status}</span>
                      </div>
                    </div>
                    <div style={{ fontSize:6,color:P.t4,marginBottom:5 }}>{p.trigger}</div>
                    <div style={{ background:"#030508",borderRadius:4,height:4,overflow:"hidden",marginBottom:4 }}>
                      <div style={{ width:`${p.successRate}%`,height:"100%",background:p.successRate===100?P.teal:P.gold,borderRadius:4 }}/>
                    </div>
                    <div style={{ display:"flex",justifyContent:"space-between",fontSize:6 }}>
                      <span style={{ color:P.t4 }}>Runs: <span style={{ color:P.blue }}>{p.runs}</span></span>
                      <span style={{ color:P.t4 }}>Last: <span style={{ color:P.teal }}>{p.lastRun.split(" ")[0]}</span></span>
                      <span style={{ color:P.t4 }}><span style={{ color:p.successRate===100?P.teal:P.gold }}>{p.successRate}%</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ background:P.card,border:`1px solid ${P.b}`,borderRadius:10,padding:"12px 14px" }}>
            <div style={{ fontSize:7,color:P.t4,letterSpacing:2,marginBottom:8 }}>📊 EXECUTION SUMMARY</div>
            {PIPELINES.sort((a,b)=>b.runs-a.runs).map(p=>(
              <div key={p.id} style={{ display:"grid",gridTemplateColumns:"1fr auto auto auto auto",gap:10,
                alignItems:"center",padding:"5px 0",borderBottom:`1px solid ${P.b}20` }}>
                <div style={{ fontSize:8,color:p.color,fontWeight:700 }}>{p.icon} {p.name}</div>
                <span style={{ fontSize:7,color:P.blue,fontFamily:"'IBM Plex Mono',monospace" }}>{p.runs} runs</span>
                <span style={{ fontSize:7,color:p.errors?P.red:P.teal,fontFamily:"'IBM Plex Mono',monospace" }}>{p.errors} err</span>
                <span style={{ fontSize:7,color:p.successRate===100?P.teal:P.gold,fontFamily:"'IBM Plex Mono',monospace" }}>{p.successRate}%</span>
                <a href={`${N8N_BASE}/home/workflows`} target="_blank" rel="noreferrer"
                  style={{ fontSize:6,color:P.violet,textDecoration:"none" }}>↗</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}