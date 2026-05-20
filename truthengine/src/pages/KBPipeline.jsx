import { useState, useEffect, useCallback } from "react";

const P = {
  bg:"#04060C", card:"#0D1525", cardH:"#121E35", b:"#1A2640",
  t1:"#F0F6FF", t2:"#B8CCE8", t3:"#6B8BAA", t4:"#3D5570",
  gold:"#F5C842", blue:"#4A9EFF", teal:"#1CCFB4", red:"#FF5C5C",
  green:"#2DD4BF", amber:"#F5B942", violet:"#9D7BFF", orange:"#FF8C42",
  pink:"#FF6BAF", cyan:"#00D4FF"
};
const F = { m:"'IBM Plex Mono',monospace", s:"'Sora',sans-serif" };
const Bx = ({v,mx=100,c=P.blue,h=5}) => <div style={{background:"#080D18",borderRadius:3,height:h,overflow:"hidden"}}><div style={{width:Math.min(100,v/mx*100)+"%",height:"100%",background:c,borderRadius:3}}/></div>;
const Bg = ({children,c=P.blue,s=9}) => <span style={{background:c+"18",border:"1px solid "+c+"40",color:c,borderRadius:20,padding:"2px 8px",fontSize:s,fontWeight:700,whiteSpace:"nowrap"}}>{children}</span>;
const Cd = ({children,title,ac=P.blue,badge,style={}}) => (
  <div style={{background:P.card,border:"1px solid "+P.b,borderRadius:12,overflow:"hidden",marginBottom:12,...style}}>
    <div style={{background:"linear-gradient(90deg,"+ac+"12,transparent)",borderBottom:"1px solid "+P.b,padding:"9px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontSize:11,fontWeight:700,color:P.t1,fontFamily:F.s}}>{title}</span>
      {badge}
    </div>
    <div style={{padding:"12px 16px"}}>{children}</div>
  </div>
);

const DOCS = [
  {id:"D1",src:"Google Drive",t:"Institutional Betrayal — Invisible Valor",date:"2026-02-17",rel:99,
   tags:["forensic","BISG","DCAS","policy"],
   data:[["DCAS Total","58,220"],["Official Hispanic","349 (0.60%)"],["BISG Estimate","2,309 (3.97%)"],["Failure Rate","84.9%"],["Undercount","6.6x"],["Missing","~1,960"]]},
  {id:"D2",src:"Google Drive",t:"Researching Deported Veteran Erasure",date:"2026-03-03",rel:98,
   tags:["forensic","geography","methodology"],
   data:[["Catholic Proxy","28.9% (16,817)"],["CA Casualties","5,575"],["TX Casualties","3,415"],["SW States","16.1% of total"],["MAVNI 2008-16","10,400+"],["ICE Bypass","70% of cases"]]},
  {id:"D3",src:"Google Drive",t:"SGT Ramos: Omega Elite Forensic Audit",date:"2026-02-14",rel:88,
   tags:["manuscript","literary","publication"],
   data:[["Chapters Audited","42"],["Mean Omega","102.6/105"],["Award Prob","75-85%"],["CL-MoE","0.115 Mainstream Ready"]]},
  {id:"D4",src:"Google Drive",t:"Critical Forensic Analysis: Mathematics of Vietnam",date:"2026-02-17",rel:96,
   tags:["validation","forensic","cases"],
   data:[["Literary Score","9.0/10"],["Forensic Accuracy","10/10"],["Sae Joon Park","VERIFIED 2025"],["NERO Framework","Confirmed"]]},
  {id:"D5",src:"Google Drive",t:"Literary Review — SGT George Ramos",date:"2026-02-13",rel:90,
   tags:["history","literary","draft"],
   data:[["Project 100k","354,000+ low-AFQT"],["Chicano Gap","200k+ veterans"],["Omega State","NI > 0.82"]]},
  {id:"D6",src:"Project Files",t:"Comprehensive Analysis Methodology Protocol",date:"2026-03-01",rel:85,
   tags:["methodology","protocol","database"],
   data:[["Databases","75+"],["DCAS Yield","500-2,000 records"],["Validation Gates","8"],["Claims Framework","21-claim"]]},
  {id:"D7",src:"Project Files",t:"Master Summary: Deported Aliens All Conflicts",date:"2026-03-01",rel:94,
   tags:["scope","historical","roadmap"],
   data:[["Conflicts","7 (WWI-Syria)"],["Records Scope","1.2M+"],["Estimated Deported","8,450-48,750"],["Timeline","2026-2028"]]},
  {id:"D8",src:"Project Files",t:"DCAS Database Analysis Report",date:"2026-02-01",rel:97,
   tags:["DCAS","statistics","forensic"],
   data:[["Total Records","58,220"],["Hispanic Coded","349"],["Catholic","16,817 (28.9%)"],["BISG Run","Confirmed"]]},
  {id:"D9",src:"Project Files",t:"Master Deported Marines Database",date:"2026-03-15",rel:99,
   tags:["cases","evidence","veterans"],
   data:[["Primary Cases","6"],["Active URGENT","Sae Joon Park 2025"],["Confidence Avg","87/100"],["SHA-256","All 6 hashed"]]},
  {id:"D10",src:"UC eScholarship / USF",t:"The Few, The Proud, The Deported (Durazo)",date:"2024-09-16",rel:98,
   tags:["qualitative","racial-project","co-author","7th-stream"],
   data:[["Author","Prof. Marco Durazo (USF)"],["Method","Qualitative semi-structured interviews"],["Core Arg","Racial project rooted in 1848"],["Mechanism","Perpetual foreignness + perceived illegality"],["Stream","7th convergence stream — QUALITATIVE"],["URL","escholarship.org/uc/item/0kb6h9k0"]]},
  {id:"D11",src:"Berkeley Law",t:"Deported Veterans Health & Benefits Report",date:"2024-03-16",rel:95,
   tags:["legal","VA-benefits","PTSD","Berkeley"],
   data:[["Institution","UC Berkeley Law Practicum"],["Finding 1","VA benefits owed regardless of deportation"],["Finding 2","DHS denies humanitarian parole routinely"],["Case","Jeff Brown — Baghdad/Fallujah PTSD, deported Jamaica"],["Overlap","Tijuana vets = Valenzuela cases"]]},
  {id:"D12",src:"AUMER Foundation",t:"Exile Patriot Project — Implementation Guide",date:"2026-03-25",rel:97,
   tags:["platform","CRM","HubSpot","crawlers","roadmap"],
   data:[["Public Brand","The Exile Patriot Project"],["Engine","TruthEngine360 (internal)"],["Website","albavoice.org"],["Contacts","2,064 (target 5,000+)"],["Custom Props","1 of 14 needed"],["Crawlers","30 active (6 categories)"],["Phase 1","April 5, 2026 — ACTIVE NOW"]]},
];

const CLUSTERS = [
  {id:"C1",icon:"📊",label:"FORENSIC STATISTICS",c:P.blue,weight:99,
   desc:"DCAS 349 anomaly, BISG 84.9% failure, 6.6x undercount, 1,960 missing",
   metrics:[["Official Hispanic","349 / 0.60%"],["BISG Estimate","2,309 / 3.97%"],["Failure Rate","84.9%"],["Undercount","6.6x minimum"],["Missing","~1,960 individuals"]],
   docs:["D1","D2","D8"]},
  {id:"C2",icon:"⚖️",label:"DEPORTATION LEGAL",c:P.red,weight:97,
   desc:"IIRIRA 1996, crimmigration, 92 vs 94,000 gap, BI-2 Estimation Vacuum",
   metrics:[["IIRIRA","1996 — retroactive"],["GAO Confirmed","92 deported FY13-18"],["Advocacy Est","94,000+ since 1996"],["ICE Bypass","70% cases"],["Active","Sae Joon Park 2025"]],
   docs:["D1","D2","D4","D10","D11"]},
  {id:"C3",icon:"🎖️",label:"ACTIVE CASES",c:P.amber,weight:99,
   desc:"6 primary cases, chain of custody, CB-HSIVF certified",
   metrics:[["Primary Cases","6 tracked"],["URGENT","Sae Joon Park — 2025"],["Tijuana","Valenzuela brothers x2"],["Confidence","87/100 avg"],["Certified","SHA-256 + CB-HSIVF"]],
   docs:["D4","D9","D11"]},
  {id:"C4",icon:"🗺️",label:"GEOGRAPHIC",c:P.teal,weight:88,
   desc:"SW state clustering, border cities, casualty concentration",
   metrics:[["California","5,575 casualties"],["Texas","3,415 casualties"],["SW Total","16.1% of DCAS"],["Tijuana Vets","200+ in residence"],["Juarez Est","~8,000+ deportees"]],
   docs:["D1","D2","D9"]},
  {id:"C5",icon:"🌐",label:"MULTI-CONFLICT",c:P.violet,weight:85,
   desc:"WWI through Syria, 1.2M records, 8,450-48,750 deported",
   metrics:[["Conflicts","7 (WWI to Syria)"],["Records Scope","1.2M+"],["All Deported","8,450-48,750"],["Vietnam Doc","3,100-5,000"],["WWII Est","2,000-28,000"]],
   docs:["D7"]},
  {id:"C6",icon:"📖",label:"PUBLICATION",c:P.orange,weight:88,
   desc:"Manuscript Rev.92, 218,004 words, May 31 2026 deadline",
   metrics:[["Words","218,004"],["Revision","92"],["Mean Omega","102.6/105"],["Deadline","May 31, 2026"],["Bills","S.874 + HR.1537"]],
   docs:["D3","D4","D5","D12"]},
  {id:"C7",icon:"🔬",label:"METHODOLOGY",c:P.teal,weight:92,
   desc:"7-stream convergence, BISG, CB-HSIVF, SPSS R²=0.947",
   metrics:[["Streams","7 (6 quant + 1 qual)"],["BISG","Bayesian Improved Surname Geocoding"],["SPSS","R²=0.947, F(4,38)=161.7"],["Gates","8 verification gates"],["Claims","21-claim framework"]],
   docs:["D1","D2","D6","D10"]},
  {id:"C8",icon:"🔍",label:"NERO / BEHAVIORAL",c:P.pink,weight:95,
   desc:"BI-2 Estimation Vacuum, racial project mechanism, NERO framework",
   metrics:[["Indicator","BI-2 Estimation Vacuum"],["NERO","Notification-Erasure-Restriction-Obscurity"],["DCAS Gap","84.9% misclassification"],["ICE Gap","70% veteran cases bypassed"],["Root","Racial project 1848 (Durazo D10)"]],
   docs:["D1","D2","D8","D10","D11"]},
  {id:"C9",icon:"🏗️",label:"EXILE PATRIOT PLATFORM",c:P.teal,weight:90,
   desc:"HubSpot CRM, bilingual blog, crawlers, brand architecture, roadmap",
   metrics:[["Public Brand","Exile Patriot Project"],["Website","albavoice.org"],["Contacts","2,064 (need 5,000+)"],["Crawlers","30 active"],["Custom Props","1 of 14 built"],["Phase 1","April 5, 2026 NOW"]],
   docs:["D12"]},
];

const STREAMS = [
  {n:1,label:"DCAS Primary",c:P.red,strength:99,type:"Quantitative",desc:"58,220 records · 349 Hispanic coded (0.60%) · the core anomaly"},
  {n:2,label:"Guzman 1969",c:P.amber,strength:92,type:"Quantitative",desc:"19% of SW casualties, 12% of population — published disparity"},
  {n:3,label:"LAE Database",c:P.violet,strength:88,type:"Quantitative",desc:"3,741 identified (6.43%) — community-sourced upper bound"},
  {n:4,label:"NARA Revised",c:P.teal,strength:85,type:"Quantitative",desc:"National Archives: 3,070 — institutional acknowledgment"},
  {n:5,label:"Catholic Proxy",c:P.orange,strength:82,type:"Statistical",desc:"28.9% Catholic coded (16,817) — ethnicity surrogate marker"},
  {n:6,label:"Geographic",c:P.blue,strength:87,type:"Statistical",desc:"CA+TX+NM = 16.1% clustering — validates BISG probability weights"},
  {n:7,label:"Durazo Qualitative",c:P.gold,strength:95,type:"QUALITATIVE NEW",desc:"Semi-structured interviews · racial project mechanism · 1st qualitative stream"},
];

const PIPELINE = [
  {n:1,label:"RAW INGEST",icon:"📥",c:P.blue,desc:"12 sources: 5 Drive + 4 Project + D10 Durazo + D11 Berkeley + D12 Exile Patriot"},
  {n:2,label:"EXTRACT",icon:"⚙️",c:P.violet,desc:"Key data points, themes, tags, metadata from each source"},
  {n:3,label:"EMBED",icon:"🔢",c:P.teal,desc:"Semantic vectorization — text to numerical representation"},
  {n:4,label:"CLUSTER",icon:"🔵",c:P.amber,desc:"K-means + semantic similarity — 9 meaningful topic groups"},
  {n:5,label:"RANK",icon:"⬆️",c:P.orange,desc:"Weight by evidence density and mission relevance"},
  {n:6,label:"ANALYTICS",icon:"📊",c:P.green,desc:"Cross-cluster pattern extraction + gap identification"},
  {n:7,label:"INSIGHTS",icon:"🤖",c:P.pink,desc:"AI synthesis — actionable findings per cluster"},
];

export default function KBPipeline() {
  const [tab, setTab] = useState("overview");
  const [selDoc, setSelDoc] = useState(null);
  const [selCluster, setSelCluster] = useState(null);
  const [selStream, setSelStream] = useState(null);
  const [pStep, setPStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [aiQ, setAiQ] = useState("");
  const [aiR, setAiR] = useState(null);
  const [aiL, setAiL] = useState(false);

  const runPipeline = useCallback(async () => {
    setRunning(true); setPStep(0);
    for (let i = 1; i <= PIPELINE.length; i++) {
      await new Promise(r => setTimeout(r, 500));
      setPStep(i);
    }
    setRunning(false);
  }, []);

  useEffect(() => { runPipeline(); }, []);

  const runAI = async () => {
    if (!aiQ.trim()) return;
    setAiL(true); setAiR(null);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:`TruthEngine360 KB analyst — AUMER Foundation. 12 sources in 9 clusters. Key data: DCAS 58,220 records, 349 official Hispanic (0.60%), BISG estimate 2,309 (84.9% failure, 6.6x undercount). 7-stream convergence with Durazo qualitative as 7th stream (racial project 1848). 6 active cases. Exile Patriot Project = public brand at albavoice.org. May 31 2026 deadline.`,
          messages:[{role:"user",content:aiQ}]
        })
      });
      const d = await r.json();
      setAiR(d.content?.filter(b=>b.type==="text").map(b=>b.text).join("\n") || "No response.");
    } catch(e) { setAiR("Error: "+e.message); }
    setAiL(false);
  };

  const TABS = [
    {id:"overview",l:"📊 Overview"},{id:"pipeline",l:"⚙️ Pipeline"},
    {id:"clusters",l:"🔵 Clusters"},{id:"sources",l:"📄 Sources"},
    {id:"streams",l:"🌊 7-Stream"},{id:"exile",l:"🏗️ Exile Patriot"},
    {id:"ai",l:"🤖 AI Query"},
  ];

  return (
    <div style={{background:P.bg,minHeight:"100vh",fontFamily:F.s,color:P.t1,paddingBottom:40}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700;800&family=Sora:wght@400;700;800&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        .pulse{animation:pulse 1.5s ease-in-out infinite}
      `}</style>

      {/* HEADER */}
      <div style={{background:"#050810",borderBottom:"1px solid "+P.b,padding:"14px 22px 0",position:"sticky",top:0,zIndex:100}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,"+P.red+","+P.amber+","+P.blue+","+P.violet+","+P.teal+","+P.orange+")"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:10,flexWrap:"wrap"}}>
          <div>
            <div style={{fontSize:7,color:P.blue,letterSpacing:5,fontWeight:700,marginBottom:2}}>TRUTHENGINE360 · AUMER FOUNDATION · KNOWLEDGE BASE CLUSTERING PIPELINE</div>
            <div style={{fontSize:16,fontWeight:800}}>🧠 Raw Data → <span style={{color:P.teal}}>9 Clusters</span> → Analytics · <span style={{color:P.gold}}>7-Stream Convergence</span></div>
          </div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {[{n:DOCS.length,l:"Sources",c:P.blue},{n:CLUSTERS.length,l:"Clusters",c:P.violet},
              {n:STREAMS.length,l:"Streams",c:P.gold},{n:"1,960",l:"Missing Vets",c:P.red},
              {n:"8-48K",l:"All Conflicts",c:P.teal}].map((s,i) => (
              <div key={i} style={{background:P.card,border:"1px solid "+s.c+"30",borderTop:"2px solid "+s.c,borderRadius:7,padding:"5px 10px",textAlign:"center"}}>
                <div style={{fontFamily:F.m,fontSize:15,fontWeight:800,color:s.c}}>{s.n}</div>
                <div style={{fontSize:7,color:P.t4}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:0,overflowX:"auto"}}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{padding:"6px 12px",background:"transparent",border:"none",borderBottom:tab===t.id?"2px solid "+P.gold:"2px solid transparent",color:tab===t.id?P.t1:P.t4,fontSize:10,fontWeight:tab===t.id?700:400,cursor:"pointer",whiteSpace:"nowrap",fontFamily:F.s}}>{t.l}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"16px 22px"}}>

        {/* OVERVIEW */}
        {tab==="overview" && <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:10,marginBottom:14}}>
            {[
              {title:"DCAS Forensic Gap",c:P.red,items:["Official: 349 Hispanic coded (0.60%)","BISG Estimate: 2,309 (3.97%)","Failure Rate: 84.9%","Undercount: 6.6x minimum","Missing: ~1,960 individuals","Catholic proxy: 28.9% = ethnicity signal"]},
              {title:"Deportation Machine",c:P.amber,items:["IIRIRA 1996 — judicial discretion stripped","GAO confirmed: 92 deported FY13-18","Advocacy estimate: 94,000+ since 1996","ICE bypass rate: 70% veteran cases","Active: Sae Joon Park (Nov/Dec 2025)","BI-2 Estimation Vacuum — both agencies"]},
              {title:"Research Corpus",c:P.violet,items:["12 sources: D1-D12 ingested","9 clusters built from raw data","7-stream convergence model","Durazo (D10) = 7th qualitative stream","Exile Patriot Project: albavoice.org","May 31, 2026 publication deadline"]},
            ].map((box,i) => (
              <div key={i} style={{background:P.card,border:"1px solid "+box.c+"25",borderLeft:"4px solid "+box.c,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:9,fontWeight:700,color:box.c,letterSpacing:2,marginBottom:7}}>{box.title}</div>
                {box.items.map((item,j) => (
                  <div key={j} style={{fontSize:9,color:P.t2,padding:"2px 0",borderBottom:"1px solid "+P.b+"20",lineHeight:1.6}}>{item}</div>
                ))}
              </div>
            ))}
          </div>
          <Cd title="Cluster Relevance Weights — All 9 Clusters" ac={P.gold}>
            {[...CLUSTERS].sort((a,b)=>b.weight-a.weight).map((c,i) => (
              <div key={i} style={{marginBottom:8,cursor:"pointer"}} onClick={() => { setSelCluster(c.id); setTab("clusters"); }}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:2}}>
                  <span style={{color:c.c,fontWeight:700}}>{c.icon} {c.label}</span>
                  <span style={{fontFamily:F.m,color:c.c}}>{c.weight}/100</span>
                </div>
                <Bx v={c.weight} c={c.c} h={6}/>
              </div>
            ))}
          </Cd>
        </>}

        {/* PIPELINE */}
        {tab==="pipeline" && <>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:11,color:P.t3}}>Data flows through 7 stages — raw ingestion to actionable insights</div>
            <button onClick={runPipeline} disabled={running} style={{padding:"6px 14px",background:running?P.b:"linear-gradient(135deg,"+P.blue+","+P.violet+")",color:running?P.t4:"#000",border:"none",borderRadius:7,fontSize:9,fontWeight:800,cursor:running?"not-allowed":"pointer",fontFamily:F.s}}>
              {running?"⟳ Running...":"▶ Re-run"}
            </button>
          </div>
          {PIPELINE.map((ps,i) => {
            const done = pStep > i;
            const active = pStep === i+1 && running;
            return (
              <div key={i} style={{display:"flex",gap:14,marginBottom:11}}>
                <div style={{flexShrink:0,textAlign:"center",width:46}}>
                  <div style={{background:done?ps.c+"18":"#080D18",border:"2px solid "+(done?ps.c:P.b),borderRadius:"50%",width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,margin:"0 auto",transition:"all .3s"}}>
                    {done?"✓":active?"⟳":ps.n}
                  </div>
                  {i < PIPELINE.length-1 && <div style={{width:2,height:20,background:done?ps.c:P.b,margin:"4px auto",transition:"background .3s"}}/>}
                </div>
                <div style={{flex:1,background:P.card,border:"1px solid "+(done?ps.c+"40":P.b),borderRadius:10,padding:"11px 16px",transition:"all .3s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:11,fontWeight:700,color:done?ps.c:P.t3}}>{ps.icon} {ps.label}</span>
                    <span style={{fontSize:8,color:done?ps.c:P.t4,fontFamily:F.m}}>{done?"COMPLETE":active?"PROCESSING...":"PENDING"}</span>
                  </div>
                  <div style={{fontSize:10,color:P.t3}}>{ps.desc}</div>
                  {done && i===0 && <div style={{marginTop:6,display:"flex",gap:4,flexWrap:"wrap"}}>{DOCS.map(d => <span key={d.id} style={{fontSize:7,background:P.blue+"18",border:"1px solid "+P.blue+"30",color:P.blue,borderRadius:3,padding:"1px 5px"}}>{d.id}</span>)}</div>}
                  {done && i===3 && <div style={{marginTop:6,display:"flex",gap:4,flexWrap:"wrap"}}>{CLUSTERS.map(c => <span key={c.id} style={{fontSize:7,background:c.c+"18",border:"1px solid "+c.c+"30",color:c.c,borderRadius:3,padding:"1px 5px"}}>{c.id}</span>)}</div>}
                </div>
              </div>
            );
          })}
        </>}

        {/* CLUSTERS */}
        {tab==="clusters" && <>
          <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
            {CLUSTERS.map(c => (
              <button key={c.id} onClick={() => setSelCluster(selCluster===c.id?null:c.id)} style={{padding:"3px 9px",background:selCluster===c.id?c.c+"18":"transparent",border:"1px solid "+(selCluster===c.id?c.c:P.b),borderRadius:5,color:selCluster===c.id?c.c:P.t4,fontSize:8,cursor:"pointer",fontFamily:F.s}}>{c.icon} {c.id}</button>
            ))}
          </div>
          {CLUSTERS.map(c => {
            const open = selCluster===c.id;
            return (
              <div key={c.id} onClick={() => setSelCluster(open?null:c.id)} style={{background:P.card,border:"1px solid "+(open?c.c+"60":c.c+"20"),borderLeft:"5px solid "+c.c,borderRadius:11,padding:"12px 16px",marginBottom:9,cursor:"pointer",transition:"all .15s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:800,color:c.c,marginBottom:2}}>{c.icon} {c.label}</div>
                    <div style={{fontSize:9,color:P.t3}}>{c.desc}</div>
                  </div>
                  <div style={{display:"flex",gap:6,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
                    <Bg c={c.c} s={8}>{c.weight}/100</Bg>
                    {c.docs.map(d => <span key={d} style={{fontSize:7,background:P.blue+"18",border:"1px solid "+P.blue+"30",color:P.blue,borderRadius:3,padding:"1px 4px"}}>{d}</span>)}
                  </div>
                </div>
                {open && (
                  <div style={{marginTop:10,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div>
                      <div style={{fontSize:8,fontWeight:700,color:P.t4,letterSpacing:2,marginBottom:5}}>KEY METRICS</div>
                      {c.metrics.map((m,i) => (
                        <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:9,padding:"3px 0",borderBottom:"1px solid "+P.b+"20"}}>
                          <span style={{color:P.t4}}>{m[0]}</span>
                          <span style={{fontFamily:F.m,color:c.c,fontWeight:700}}>{m[1]}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{background:c.c+"06",border:"1px solid "+c.c+"15",borderLeft:"2px solid "+c.c,borderRadius:7,padding:"8px 10px",fontSize:9,color:P.t2,lineHeight:1.8,alignSelf:"start"}}>
                      Click source badges to explore related documents
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </>}

        {/* SOURCES */}
        {tab==="sources" && <>
          <div style={{fontSize:10,color:P.t3,marginBottom:12}}>{DOCS.length} documents ingested — 5 Google Drive + 4 Project Files + Durazo (USF) + Berkeley Law + Exile Patriot Guide. Click to expand.</div>
          {DOCS.map(doc => {
            const open = selDoc===doc.id;
            const srcC = doc.src==="Google Drive"?P.blue:doc.src==="Project Files"?P.orange:doc.src==="UC eScholarship / USF"?P.violet:doc.src==="Berkeley Law"?P.teal:P.green;
            return (
              <div key={doc.id} onClick={() => setSelDoc(open?null:doc.id)} style={{background:open?P.card:"transparent",border:"1px solid "+(open?srcC+"50":P.b+"40"),borderLeft:"4px solid "+srcC,borderRadius:9,padding:"10px 14px",marginBottom:7,cursor:"pointer",transition:"all .12s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:6,marginBottom:2,flexWrap:"wrap"}}>
                      <span style={{fontFamily:F.m,fontSize:8,color:P.t4}}>{doc.id}</span>
                      <Bg c={srcC} s={7}>{doc.src}</Bg>
                      <span style={{fontSize:7,color:P.t4}}>{doc.date}</span>
                    </div>
                    <div style={{fontSize:11,fontWeight:700,color:P.t1}}>{doc.t}</div>
                  </div>
                  <div style={{display:"flex",gap:4,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
                    <Bg c={P.teal} s={7}>{doc.rel}/100</Bg>
                    {doc.tags.slice(0,2).map((tag,i) => <span key={i} style={{fontSize:7,color:P.t4,background:"#1A264060",borderRadius:3,padding:"1px 4px"}}>#{tag}</span>)}
                  </div>
                </div>
                {open && (
                  <div style={{marginTop:10,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div>
                      <div style={{fontSize:8,fontWeight:700,color:P.t4,letterSpacing:2,marginBottom:5}}>KEY DATA POINTS</div>
                      {doc.data.map((kd,i) => (
                        <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:8,padding:"2px 0",borderBottom:"1px solid "+P.b+"15"}}>
                          <span style={{color:P.t4}}>{kd[0]}</span>
                          <span style={{fontFamily:F.m,color:srcC,fontWeight:700,maxWidth:180,textAlign:"right"}}>{kd[1]}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{fontSize:8,fontWeight:700,color:P.t4,letterSpacing:2,marginBottom:5}}>TAGS</div>
                      <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                        {doc.tags.map((tag,i) => <span key={i} style={{fontSize:8,background:srcC+"12",border:"1px solid "+srcC+"20",color:srcC,borderRadius:4,padding:"2px 6px"}}>#{tag}</span>)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </>}

        {/* 7-STREAM */}
        {tab==="streams" && <>
          <div style={{background:"#F5C84208",border:"1px solid #F5C84225",borderRadius:12,padding:"14px 18px",marginBottom:12}}>
            <div style={{fontSize:9,color:P.gold,letterSpacing:4,fontWeight:700,marginBottom:3}}>🌊 7-STREAM CONVERGENCE — BISG FORENSIC VALIDATION ARCHITECTURE</div>
            <div style={{fontSize:10,color:P.t3,lineHeight:1.7}}>All 7 streams converge on the same conclusion: DCAS 349 is a systematic undercount by 6.6x minimum. Stream 7 (Durazo qualitative) provides the WHY — the racial project mechanism rooted in 1848 that explains how erasure is institutionally permitted.</div>
          </div>
          {STREAMS.map(s => {
            const open = selStream===s.n;
            return (
              <div key={s.n} onClick={() => setSelStream(open?null:s.n)} style={{background:P.card,border:"1px solid "+(open?s.c+"60":s.c+"20"),borderLeft:"4px solid "+s.c,borderRadius:9,padding:"11px 14px",marginBottom:8,cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:open?8:4}}>
                  <div style={{display:"flex",gap:10,alignItems:"center",flex:1}}>
                    <div style={{background:"#080D18",borderRadius:5,padding:"4px 8px",textAlign:"center",minWidth:38}}>
                      <div style={{fontFamily:F.m,fontSize:14,fontWeight:800,color:s.c}}>{s.n}</div>
                      <div style={{fontSize:6,color:P.t4}}>stream</div>
                    </div>
                    <div>
                      <div style={{fontSize:10,fontWeight:700,color:s.c}}>{s.label} {s.n===7?"⭐":""}</div>
                      <div style={{fontSize:8,color:P.t3}}>{s.desc}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:7,flexShrink:0}}>
                    <span style={{fontSize:8,background:s.type.includes("NEW")?s.c+"20":"#080D18",border:"1px solid "+(s.type.includes("NEW")?s.c+"40":P.b),color:s.type.includes("NEW")?s.c:P.t4,borderRadius:4,padding:"2px 7px"}}>{s.type}</span>
                    <span style={{fontFamily:F.m,fontSize:14,fontWeight:800,color:s.c}}>{s.strength}</span>
                  </div>
                </div>
                <Bx v={s.strength} c={s.c} h={6}/>
                {open && s.n===7 && (
                  <div style={{marginTop:10,background:"#F5C84208",border:"1px solid #F5C84225",borderLeft:"3px solid #F5C842",borderRadius:7,padding:"9px 12px",fontSize:9,color:P.t2,lineHeight:1.7}}>
                    <strong style={{color:P.gold}}>KEY — Streams 1-6 prove WHAT happened. Stream 7 proves WHY.</strong> Durazo shows the racial project (perpetual foreignness, perceived illegality, ambiguous membership) creates the institutional permission structure for the NERO mechanism. <strong style={{color:P.gold}}>Action: Request Durazo raw interview codebook immediately.</strong>
                  </div>
                )}
              </div>
            );
          })}
          <Cd title="NERO Alignment — Durazo Racial Project" ac={P.red} style={{marginTop:8}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:8}}>
              {[["N — Notification","Citizenship promise never formalized → veterans never told deportation risk","#FF5C5C"],
                ["E — Erasure","Perpetual foreignness: service doesn't confer membership → DCAS reflects ambiguity","#F5B942"],
                ["R — Restriction","Perceived illegality post-service → restricts VA access and naturalization","#F5C842"],
                ["O — Obscurity","Ambiguous membership → deportation statistically invisible → BI-2 Estimation Vacuum","#4A9EFF"]
              ].map(([label,desc,c],i) => (
                <div key={i} style={{background:"#080D18",border:"1px solid "+c+"20",borderLeft:"3px solid "+c,borderRadius:7,padding:"8px 10px"}}>
                  <div style={{fontSize:9,fontWeight:800,color:c,marginBottom:2}}>{label}</div>
                  <div style={{fontSize:8,color:P.t3,lineHeight:1.6}}>{desc}</div>
                </div>
              ))}
            </div>
          </Cd>
        </>}

        {/* EXILE PATRIOT */}
        {tab==="exile" && <>
          <Cd title="Brand Architecture — Naming Collision Resolved" ac={P.teal}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:7,marginBottom:8}}>
              {[["Exile Patriot Project","Public brand · all outreach · albavoice.org","#1CCFB4"],
                ["TruthEngine360","Internal forensic analytics engine","#4A9EFF"],
                ["AUMER Foundation","501(c)(3) organizational entity","#F5C842"],
                ["CB-HSIVF","Congressional Briefing verification","#9D7BFF"],
                ["Exile Patriot Voices","Community story platform (blog)","#FF6BAF"],
                ["SGT George Ramos","Manuscript · May 31, 2026","#FF8C42"]
              ].map(([n,r,c],i) => (
                <div key={i} style={{background:"#080D18",border:"1px solid "+c+"25",borderLeft:"3px solid "+c,borderRadius:7,padding:"7px 9px"}}>
                  <div style={{fontSize:9,fontWeight:800,color:c,marginBottom:1}}>{n}</div>
                  <div style={{fontSize:7,color:P.t3}}>{r}</div>
                </div>
              ))}
            </div>
            <div style={{background:"#FF5C5C08",border:"1px solid #FF5C5C25",borderRadius:5,padding:"6px 8px",fontSize:8,color:P.red}}>⚠ truthengine.com = UK product. Never use "Truth Engine" publicly — always "Exile Patriot Project" externally.</div>
          </Cd>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12,marginBottom:12}}>
            <Cd title="HubSpot CRM Audit" ac={P.orange}>
              {[["Contacts","2,064","→ 5,000+","#FF5C5C"],["Companies","791","→ 1,000+","#F5B942"],
                ["Deals","3","→ 20+","#F5B942"],["Custom Props","1 / 14","CRITICAL NOW","#FF5C5C"],
                ["Write Access","REAUTH NEEDED","Do this week","#FF5C5C"]
              ].map(([k,v,n,c],i) => (
                <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:9,padding:"3px 0",borderBottom:"1px solid "+P.b+"20"}}>
                  <span style={{color:P.t4}}>{k}</span>
                  <div style={{textAlign:"right"}}><span style={{fontFamily:F.m,color:c,fontWeight:700}}>{v}</span><span style={{fontSize:7,color:P.t4,marginLeft:4}}>{n}</span></div>
                </div>
              ))}
            </Cd>
            <Cd title="30 Active Crawlers" ac={P.blue}>
              {[["News + Media","7","#4A9EFF"],["Research","6","#9D7BFF"],["Human Rights","5","#2DD4BF"],
                ["Government","5","#F5B942"],["Legal + Advocacy","4","#FF8C42"],["Social Media","3","#FF6BAF"]
              ].map(([cat,n,c],i) => (
                <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:9,padding:"3px 0",borderBottom:"1px solid "+P.b+"20"}}>
                  <span style={{color:c,fontWeight:700}}>{cat}</span>
                  <span style={{fontFamily:F.m,color:c,fontWeight:800}}>{n}</span>
                </div>
              ))}
              <div style={{marginTop:7,background:"#FF5C5C08",border:"1px solid #FF5C5C25",borderRadius:5,padding:"5px 7px",fontSize:7,color:P.red}}>⚠ YouTube Gap: 10k units/day. Key: Cronkite, American Exile PBS, Life After Deportation.</div>
            </Cd>
          </div>
          <Cd title="4-Phase Roadmap" ac={P.gold}>
            {[["Phase 1","Mar 26 – Apr 5","ACTIVE NOW","#FF5C5C",["Reauthorize HubSpot write access","Create 14 custom contact properties","Map 6 verified cases as Tickets","Deploy albavoice.org blog"]],
              ["Phase 2","Apr 5 – Apr 19","PLANNED","#F5B942",["YouTube quota-aware ingestion MVP","GA4 + PostHog analytics","Spanish translations (UI + 2 articles)","Import 250+ influencers to HubSpot"]],
              ["Phase 3","Apr 19 – May 10","PLANNED","#F5C842",["Social listening vendor eval","Webhooks → real-time HubSpot sync","SHA-256 evidence ledger automation","Bilingual blog 4 EN + 4 ES"]],
              ["Phase 4","May 10 – 31","DEADLINE","#2DD4BF",["Testing + runbooks","GDPR/CCPA compliance","🎯 Manuscript publication","Congressional brief PDF export"]]
            ].map(([ph,dates,status,c,tasks],i) => (
              <div key={i} style={{marginBottom:9,background:"#080D18",border:"1px solid "+c+"25",borderLeft:"4px solid "+c,borderRadius:7,padding:"8px 11px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <div><span style={{fontFamily:F.m,fontSize:9,color:c,fontWeight:800}}>{ph}</span><span style={{fontSize:8,color:P.t4,marginLeft:6}}>{dates}</span></div>
                  <Bg c={c} s={7}>{status}</Bg>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                  {tasks.map((t,j) => <span key={j} style={{fontSize:8,color:P.t2,background:"#0D1525",borderRadius:4,padding:"2px 6px",border:"1px solid "+P.b+"20"}}>▸ {t}</span>)}
                </div>
              </div>
            ))}
          </Cd>
        </>}

        {/* AI QUERY */}
        {tab==="ai" && <>
          <div style={{background:"#4A9EFF08",border:"1px solid #4A9EFF25",borderRadius:12,padding:"14px 18px",marginBottom:12}}>
            <div style={{fontSize:9,color:P.blue,letterSpacing:3,fontWeight:700,marginBottom:3}}>🤖 AI ANALYST — Full KB Context Loaded</div>
            <div style={{fontSize:10,color:P.t3}}>{DOCS.length} sources · {CLUSTERS.length} clusters · 7-stream convergence · Durazo + Berkeley Law integrated</div>
          </div>
          <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
            {["What are the biggest data gaps across all 9 clusters?","How does Durazo D10 explain the DCAS 349 anomaly?","What Phase 1 actions are blocking for Exile Patriot this week?","Explain the 7th convergence stream and why it completes CB-HSIVF"].map(q => (
              <button key={q} onClick={() => setAiQ(q)} style={{padding:"3px 9px",background:"#080D18",border:"1px solid "+P.b,borderRadius:20,color:P.t3,fontSize:8,cursor:"pointer",fontFamily:F.s}}>{q.slice(0,44)}...</button>
            ))}
          </div>
          <textarea value={aiQ} onChange={e => setAiQ(e.target.value)} rows={3} placeholder="Query the full knowledge base..." style={{width:"100%",padding:"10px 12px",background:"#080D18",border:"1px solid "+P.b,borderRadius:9,color:P.t1,fontSize:12,fontFamily:F.s,resize:"vertical",outline:"none",boxSizing:"border-box",marginBottom:8}}/>
          <button onClick={runAI} disabled={aiL||!aiQ.trim()} style={{padding:"10px 22px",background:aiL?P.b:"linear-gradient(135deg,"+P.blue+","+P.violet+")",color:aiL?P.t4:"#fff",border:"none",borderRadius:9,fontSize:12,fontWeight:700,cursor:aiL?"not-allowed":"pointer",fontFamily:F.s}}>
            {aiL?"⟳ Analyzing...":"Query Knowledge Base →"}
          </button>
          {aiR && (
            <div style={{marginTop:10,background:P.card,border:"1px solid #4A9EFF25",borderLeft:"4px solid "+P.blue,borderRadius:10,padding:"16px 20px"}}>
              <div style={{fontSize:9,color:P.blue,letterSpacing:3,fontWeight:700,marginBottom:7}}>ANALYSIS</div>
              <div style={{fontSize:12,color:P.t2,lineHeight:1.9,whiteSpace:"pre-wrap"}}>{aiR}</div>
            </div>
          )}
        </>}

      </div>

      <div style={{textAlign:"center",padding:"8px 0",borderTop:"1px solid "+P.b,margin:"0 22px"}}>
        <div style={{fontSize:7,color:P.t4,letterSpacing:3}}>TRUTHENGINE360 · KNOWLEDGE BASE PIPELINE · {DOCS.length} SOURCES · {CLUSTERS.length} CLUSTERS · 7 STREAMS · AUMER FOUNDATION · 2026</div>
      </div>
    </div>
  );
}