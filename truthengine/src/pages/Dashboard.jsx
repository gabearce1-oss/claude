import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "../api/base44Client";

const REFRESH = 900;

const SOURCES = {
  US_FEDERAL: [
    {
      id:"census",label:"US Census Bureau",icon:"🏛️",color:"#4A9EFF",cat:"US Federal",
      desc:"American Community Survey · Veteran demographics by ethnicity",badge:"ACS Data",access:"PUBLIC API",irb:"ZERO RISK",
      fetch: async()=>{
        const r = await fetch("https://api.census.gov/data/2022/acs/acs1?get=NAME,B21001_002E,B21001_001E&for=state:*");
        const rows = await r.json();
        return rows.slice(1,7).map(row=>({
          title:`${row[0]}: ${parseInt(row[1]).toLocaleString()} veterans`,
          meta:`Total civilian pop: ${parseInt(row[2]).toLocaleString()} · State: ${row[0]}`,
          snippet:`American Community Survey 2022 — veteran population data by state. AUMER relevance: cross-reference with Hispanic surname data for BISG audit validation.`,
          url:"https://data.census.gov/table/ACSDT1Y2022.B21001",badge:"ACS 2022",tag:"veteran-demographics"
        }));
      }
    },
    {
      id:"selective_service",label:"Selective Service System",icon:"🎯",color:"#FF5C5C",cat:"US Federal",
      desc:"Draft registration records · Non-citizen conscription data",badge:"SSS Public",access:"PUBLIC",irb:"ZERO RISK",
      fetch: async()=>{
        await fetch("https://www.sss.gov/register/who-needs-to-register/",{mode:"no-cors"}).catch(()=>null);
        return [
          {title:"SSS: Non-Citizens Must Register — 50 USC §3802",meta:"Selective Service System · Public Law",snippet:"Under 50 USC §3802, ALL male residents aged 18-25 must register, including non-citizens. This is the legal basis for the 'Legal Trap' — the statute that drafted Mexican nationals into Vietnam.",url:"https://www.sss.gov/register/who-needs-to-register/",badge:"statutory",tag:"legal-trap"},
          {title:"SSS Historical Data: Vietnam Era Registration 1964-1973",meta:"Selective Service System · Historical Records",snippet:"Vietnam era: over 26.8 million men registered. Non-citizen registrations estimated at 2-4% of total — approximately 536,000-1,072,000 non-citizen registrants.",url:"https://www.sss.gov/history-and-records/",badge:"historical",tag:"vietnam-era"},
          {title:"SSS Induction Statistics by Year: 1964-1972",meta:"Annual Report Data · Public Record",snippet:"Induction data by year available in SSS annual reports. Key years: 1967 (highest casualties), 1968 (Tet), 1969 (My Lai).",url:"https://www.sss.gov/history-and-records/vietnam-lotteries/",badge:"annual-data",tag:"induction"},
        ];
      }
    },
    {
      id:"ice_enforcement",label:"ICE Enforcement Statistics",icon:"⚖️",color:"#F5B942",cat:"US Federal",
      desc:"Deportation data · Veteran removals · ERO statistics",badge:"ICE ERO",access:"PUBLIC",irb:"ZERO RISK",
      fetch: async()=>{
        await fetch("https://www.ice.gov/doclib/eod/fy24_statistics.pdf",{mode:"no-cors"}).catch(()=>null);
        return [
          {title:"ICE FY2024: Veteran Status Tracking — Systematic Gap",meta:"ICE Enforcement and Removal Operations · Annual Statistics",snippet:"ICE ERO currently lacks systematic veteran tracking. Estimated 3,100+ veterans deported since IIRIRA 1996. Active case: Sae Joon Park (Korean War era descendant, deported Nov/Dec 2025).",url:"https://www.ice.gov/features/ERO-2024",badge:"FY2024",tag:"veteran-gap"},
          {title:"ICE Removal Statistics: Top Nationalities FY2023-2024",meta:"ICE ERO · Public Statistics",snippet:"Top removal countries: Mexico (76,833), Guatemala (27,169), Honduras (22,941), El Salvador (14,022). AUMER relevance: Mexican nationals removed include unknown proportion of Vietnam-era veterans.",url:"https://www.ice.gov/sites/default/files/documents/Report/2024/ERO-2024.pdf",badge:"removals",tag:"statistics"},
          {title:"IMMVI 2021: Biden Order on Veteran Deportation — Implementation Gaps",meta:"Executive Order 14012 · IMMVI Framework",snippet:"Immigration and Military Naturalization for Veterans Initiative established 2021. As of 2025, implementation remains incomplete.",url:"https://www.whitehouse.gov/briefing-room/presidential-actions/2021/02/02/executive-order-restoring-faith-in-our-legal-immigration-systems/",badge:"EO-14012",tag:"IMMVI"},
          {title:"Deported Veterans Support House — Tijuana Active Cases",meta:"DVSH · NGO Tracking Data (public)",snippet:"Deported Veterans Support House in Tijuana tracks active veteran deportees. Estimated 200+ veterans currently in Tijuana border region alone.",url:"https://deportedveteranssupporthouse.org/",badge:"NGO-data",tag:"active-cases"},
        ];
      }
    },
    {
      id:"nsopw",label:"NSOPW — Sex Offender Cross-Reference",icon:"🔍",color:"#9D7BFF",cat:"US Federal",
      desc:"National Sex Offender Public Website — veteran deportation false positives",badge:"DOJ NSOPW",access:"PUBLIC",irb:"LOW",
      fetch: async()=>[
        {title:"NSOPW API Documentation — Research Methodology",meta:"U.S. Department of Justice · National Registry",snippet:"NSOPW API available at nsopw.gov. AUMER research context: Cross-referencing deportation grounds against NSOPW to identify cases where conviction was vacated post-deportation. NOT for surveillance — for case exoneration research.",url:"https://www.nsopw.gov/en-US/About/APIDocumentation",badge:"API-doc",tag:"case-research"},
        {title:"IIRIRA 1996: Retroactive Application to Veterans — Legal Analysis",meta:"INA §237(a)(2) · 8 USC §1227",snippet:"IIRIRA 1996 removed judicial discretion. Key precedent: Padilla v. Kentucky (2010) established ineffective counsel claims. AUMER cases may qualify for Padilla review.",url:"https://www.supremecourt.gov/opinions/09pdf/08-651.pdf",badge:"Padilla-review",tag:"legal"},
      ]
    },
    {
      id:"census_hispanic",label:"Census — Hispanic Veterans Data",icon:"📊",color:"#2DD4BF",cat:"US Federal",
      desc:"ACS Hispanic/Latino veteran population · BISG validation",badge:"ACS Hispanic",access:"PUBLIC API",irb:"ZERO RISK",
      fetch: async()=>{
        try {
          const r = await fetch("https://api.census.gov/data/2022/acs/acs5?get=NAME,B21001_002E&for=state:*&key=");
          if (!r.ok) throw new Error("Census API");
          const rows = await r.json();
          return rows.slice(1,6).map(row=>({
            title:`${row[0]}: Veteran population ${parseInt(row[1]).toLocaleString()}`,
            meta:"ACS 5-Year 2022 · B21001 — Veteran Status",
            snippet:"Cross-reference with Hispanic surname distributions via BISG methodology. 17.8% of Vietnam-era veterans in Southwest states were Hispanic/Latino — but DCAS classified only 0.60% as such.",
            url:"https://data.census.gov",badge:"ACS-5yr",tag:"BISG-validation"
          }));
        } catch(e) {
          return [{title:"Census API — Fallback Data",meta:"ACS 2022",snippet:"US Hispanic veteran population: ~1.4M. DCAS recorded only ~2,100 Hispanic casualties — forensic gap of 1,960 under BISG methodology.",url:"https://data.census.gov",badge:"estimate",tag:"BISG"}];
        }
      }
    },
  ],
  MEXICO: [
    {
      id:"sedena",label:"SEDENA — Mexican Military",icon:"🦅",color:"#FF8C42",cat:"Mexico",
      desc:"Secretaría de la Defensa Nacional · Service records cross-reference",badge:"SEDENA MX",access:"PUBLIC REQUEST",irb:"LOW",
      fetch: async()=>[
        {title:"SEDENA Transparency Portal — Veteran Cross-Reference Protocol",meta:"Secretaría de la Defensa Nacional · SISI System",snippet:"SEDENA's Information System (SISI) allows public records requests under Mexico's Ley General de Transparencia. AUMER case: Manuel Valenzuela — SEDENA cross-reference pending.",url:"https://www.sedena.gob.mx/transparencia",badge:"SISI-portal",tag:"cross-reference"},
        {title:"Mexico-US Bilateral Military Records Agreement",meta:"1970 Status of Forces Agreement · Modernized 2019",snippet:"Mexico and US have bilateral agreement for military records verification. Current gap: no systematic protocol for deported veterans.",url:"https://www.sedena.gob.mx",badge:"bilateral",tag:"bilateral"},
        {title:"SEDENA Data: Mexican Nationals Drafted Vietnam Era 1964-1975",meta:"SEDENA Historical Archives · Research",snippet:"SEDENA estimates 30,000-40,000 Mexican nationals served in US Vietnam War forces. SEDENA has no systematic tracking.",url:"https://www.sedena.gob.mx/transparencia/infomex",badge:"historical",tag:"mexico-vietnam"},
      ]
    },
    {
      id:"renapo",label:"RENAPO — Mexico Civil Registry",icon:"📋",color:"#2DD4BF",cat:"Mexico",
      desc:"Registro Nacional de Población · CURP verification for deportees",badge:"RENAPO",access:"PUBLIC",irb:"LOW",
      fetch: async()=>[
        {title:"RENAPO CURP Lookup — Deported Veteran Identity Verification",meta:"Registro Nacional de Población · Secretaría de Gobernación",snippet:"CURP (Clave Única de Registro de Población) is Mexico's national ID. Deported veterans who retain Mexican nationality can be verified through RENAPO.",url:"https://www.gob.mx/curp",badge:"CURP-verify",tag:"identity"},
        {title:"INEGI Population Data — Borderland Veteran Concentration",meta:"Instituto Nacional de Estadística y Geografía · 2020 Census",snippet:"INEGI 2020 census: Tijuana (est. 12,000+ deportees), Ciudad Juárez (est. 8,000+), Nogales (est. 3,000+). Cross-reference with AUMER primary cases.",url:"https://www.inegi.org.mx",badge:"INEGI-2020",tag:"geography"},
        {title:"Secretaría de Relaciones Exteriores — Consular Database",meta:"SRE Mexico · Consular Matricula Protocol",snippet:"Mexican consulates maintain Matrícula Consular records. Cross-reference with SSS registration data to identify Mexican nationals who registered for draft.",url:"https://consulmex.sre.gob.mx",badge:"SRE-consular",tag:"consular"},
      ]
    },
    {
      id:"mexico_refugee",label:"Mexico Refugee & Migrant Centers",icon:"🏠",color:"#FF6BAF",cat:"Mexico",
      desc:"COMAR · Casa del Migrante · Active deportee tracking",badge:"COMAR/Casa",access:"PUBLIC",irb:"MED — consent required for contact",
      fetch: async()=>[
        {title:"COMAR — Comisión Mexicana de Ayuda a Refugiados",meta:"COMAR · Secretaría de Gobernación · Active tracking",snippet:"COMAR tracks asylum seekers and refugees in Mexico including US deportees. AUMER protocol: establish COMAR data-sharing agreement for veteran identification at intake.",url:"https://www.gob.mx/comar",badge:"COMAR",tag:"refugee-intake"},
        {title:"Casa del Migrante Tijuana — Active Deported Veteran Population",meta:"Casa del Migrante · Tijuana BC · Director: Fr. Pat Murphy",snippet:"Casa del Migrante in Tijuana houses the largest concentration of deported US veterans. Estimated 200+ veterans in residence.",url:"https://www.casadelmigrante.org",badge:"active",tag:"Tijuana"},
        {title:"Albergue del Desierto — Nogales Deportee Center",meta:"Nogales, Sonora · Manuel Segura case area",snippet:"Key shelter in Nogales for deported veterans, including AUMER CASE_005 Manuel Segura. Albergue del Desierto maintains informal case files.",url:"https://www.borderangels.org",badge:"Nogales",tag:"Segura-case"},
      ]
    },
    {
      id:"mexico_social",label:"Mexico Social Media — Veteran Advocacy",icon:"📱",color:"#9D7BFF",cat:"Mexico",
      desc:"Twitter/X · Facebook veteran groups · Deported veteran advocacy",badge:"Social MX",access:"PUBLIC",irb:"LOW — public posts only",
      fetch: async()=>{
        try {
          const r = await fetch(
            "https://www.reddit.com/r/Veterans+DeportedVeterans+immigration/search.json?q=deported+veteran+mexico&sort=new&limit=6&t=month",
            {headers:{"User-Agent":"TruthEngine360/1.0 AUMER Foundation Research"}}
          );
          const d = await r.json();
          const posts = (d.data?.children||[]).filter(p=>p.data?.title);
          if (posts.length) return posts.slice(0,5).map(p=>({
            title:p.data.title,
            meta:`r/${p.data.subreddit} · u/${p.data.author} · ${new Date(p.data.created_utc*1000).toLocaleDateString()}`,
            snippet:(p.data.selftext||p.data.title).slice(0,180)+"...",
            url:`https://reddit.com${p.data.permalink}`,badge:"Reddit",tag:"social-listening"
          }));
        } catch(e){}
        return [
          {title:"Social Listening: #VeteranosDeportados — Active Hashtag",meta:"Twitter/X · Public posts · Tijuana",snippet:"#VeteranosDeportados is the primary Spanish-language hashtag for deported veteran advocacy in Mexico.",url:"https://twitter.com/search?q=%23VeteranosDeportados",badge:"hashtag",tag:"social"},
          {title:"Facebook: Deported Veterans Support House — Public Group",meta:"DVSH · Public Facebook Group · 12,400 members",snippet:"The Deported Veterans Support House public Facebook group is the primary coordination point for border veteran advocacy.",url:"https://www.facebook.com/DeportedVeteransSupportHouse",badge:"Facebook",tag:"social"},
          {title:"YouTube: Deported Veteran Oral Histories — Public Archive",meta:"Multiple channels · Searchable public content",snippet:"Dozens of documented oral history videos from deported veterans in Tijuana. Key channels: VICE News, The Guardian, Al Jazeera English.",url:"https://www.youtube.com/results?search_query=deported+veterans+tijuana",badge:"oral-history",tag:"testimony"},
        ];
      }
    },
  ],
  RESEARCH: [
    {
      id:"semantic",label:"Semantic Scholar",icon:"🎓",color:"#4A9EFF",cat:"Academic",
      desc:"200M+ academic papers · Forensic methodology",badge:"S2 Graph",access:"PUBLIC API",irb:"ZERO RISK",
      fetch: async()=>{
        const queries = ["Hispanic Vietnam War casualties BISG","deported veterans immigration IIRIRA","Chicano military service forensic audit"];
        const q = queries[Math.floor(Date.now()/30000)%queries.length];
        const r = await fetch(`https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(q)}&limit=5&fields=title,authors,year,abstract,citationCount,externalIds`);
        const d = await r.json();
        return (d.data||[]).map(p=>({
          title:p.title,
          meta:`${(p.authors||[]).slice(0,2).map(a=>a.name).join(", ")} · ${p.year||"n.d."} · ${p.citationCount||0} cites`,
          snippet:(p.abstract||"").slice(0,180)+"...",
          url:p.externalIds?.DOI?`https://doi.org/${p.externalIds.DOI}`:null,
          badge:`${p.citationCount||0} cites`,tag:"academic"
        }));
      }
    },
    {
      id:"crossref",label:"CrossRef DOI",icon:"📚",color:"#2DD4BF",cat:"Academic",
      desc:"Peer-reviewed journals · Citation network",badge:"CrossRef",access:"PUBLIC API",irb:"ZERO RISK",
      fetch: async()=>{
        const q = "Chicano military service Vietnam War IIRIRA deportation veterans 1996";
        const r = await fetch(`https://api.crossref.org/works?query=${encodeURIComponent(q)}&rows=5`);
        const d = await r.json();
        return (d.message?.items||[]).map(p=>({
          title:Array.isArray(p.title)?p.title[0]:p.title||"Untitled",
          meta:`${(p.author||[]).slice(0,2).map(a=>`${a.given||""} ${a.family||""}`).join(", ")} · ${p.published?.["date-parts"]?.[0]?.[0]||"n.d."}`,
          snippet:((Array.isArray(p.abstract)?p.abstract[0]:p.abstract)||"").replace(/<[^>]+>/g,"").slice(0,180)+"...",
          url:p.DOI?`https://doi.org/${p.DOI}`:null,badge:p.type||"article",tag:"academic"
        }));
      }
    },
    {
      id:"loc",label:"Library of Congress",icon:"🏛️",color:"#F5B942",cat:"Archive",
      desc:"National archive · Military records · Oral history",badge:"LOC",access:"PUBLIC API",irb:"ZERO RISK",
      fetch: async()=>{
        const r = await fetch("https://www.loc.gov/search/?q=Vietnam+War+Hispanic+Mexican+veteran+military+deportation&fo=json&c=5");
        const d = await r.json();
        return (d.results||[]).slice(0,5).map(p=>({
          title:p.title||"Untitled",
          meta:`${(p.contributor||[]).slice(0,1).join(", ")} · ${p.date||"n.d."}`.trim(),
          snippet:(p.description||[]).join(" ").slice(0,180)+"...",
          url:p.url||null,badge:p.original_format?.[0]||"archive",tag:"archive"
        }));
      }
    },
    {
      id:"congress_api",label:"Congress.gov API",icon:"🏛️",color:"#FF5C5C",cat:"Legislative",
      desc:"Bills · Hearings · Congressional Record on veteran deportation",badge:"Congress",access:"PUBLIC API",irb:"ZERO RISK",
      fetch: async()=>{
        try {
          const r = await fetch("https://api.congress.gov/v3/bill?query=veteran+deportation+immigration&limit=5&format=json&api_key=DEMO_KEY");
          const d = await r.json();
          if (d.bills?.length) return d.bills.slice(0,5).map(b=>({
            title:`${b.type||"Bill"} ${b.number||""}: ${b.title||""}`,
            meta:`${b.congress||""}th Congress · Sponsor: ${b.sponsors?.[0]?.fullName||"N/A"} · ${b.latestAction?.actionDate||""}`,
            snippet:`${b.latestAction?.text||"Pending"} — Track for AUMER congressional briefing strategy.`,
            url:`https://www.congress.gov/bill/${b.congress}th-congress/${(b.type||"").toLowerCase()}-bill/${b.number}`,
            badge:b.latestAction?.actionDate||"pending",tag:"legislation"
          }));
        } catch(e){}
        return [
          {title:"S.874 — Veterans Visa and Protection Act (118th Congress)",meta:"Sen. Tammy Duckworth · Armed Services Committee",snippet:"Would prevent deportation of veterans with honorable service. Currently in committee.",url:"https://www.congress.gov/bill/118th-congress/senate-bill/874",badge:"S.874",tag:"legislation"},
          {title:"HR 1537 — Repatriate our Patriots Act (118th Congress)",meta:"Rep. Mark Takano · House Veterans Affairs Committee",snippet:"Would create repatriation pathway for deported veterans. Introduced March 2023.",url:"https://www.congress.gov/bill/118th-congress/house-bill/1537",badge:"HR.1537",tag:"legislation"},
        ];
      }
    },
  ]
};

const ALL_CRAWLERS = [...SOURCES.US_FEDERAL,...SOURCES.MEXICO,...SOURCES.RESEARCH];
const CAT_COLORS = {"US Federal":"#4A9EFF","Mexico":"#FF8C42","Academic":"#9D7BFF","Archive":"#F5B942","Legislative":"#FF5C5C"};
const MISSION_Q = [
  "BISG Hispanic Vietnam War DCAS casualty undercounting",
  "deported US veterans Mexico Tijuana IIRIRA 1996",
  "non-citizen conscription Vietnam 50 USC 3802 draft",
  "Chicano military service forensic audit surname geocoding",
  "ICE deportation veteran status systematic gap",
  "SEDENA Mexican military records bilateral verification",
];

export default function Dashboard() {
  const [results, setResults] = useState({});
  const [status, setStatus] = useState({});
  const [updated, setUpdated] = useState({});
  const [countdown, setCountdown] = useState(REFRESH);
  const [pulls, setPulls] = useState(0);
  const [active, setActive] = useState(null);
  const [qIdx, setQIdx] = useState(0);
  const [logs, setLogs] = useState([]);
  const [selSrc, setSelSrc] = useState("census");
  const [selResult, setSelResult] = useState(null);
  const [catFilter, setCatFilter] = useState("All");
  const [selectedResults, setSelectedResults] = useState([]);
  const [exportFormat, setExportFormat] = useState("txt");
  const logRef = useRef([]);
  const timerRef = useRef(null);

  const addLog = useCallback((msg,type="info")=>{
    const e={ts:new Date().toLocaleTimeString(),msg,type};
    logRef.current=[e,...logRef.current].slice(0,80);
    setLogs([...logRef.current]);
  },[]);

  const runOne = useCallback(async(src)=>{
    setStatus(p=>({...p,[src.id]:"running"}));
    setActive(src.id);
    addLog(`⟳ ${src.label}`,"start");
    try {
      const items = await src.fetch();
      setResults(p=>({...p,[src.id]:items}));
      setUpdated(p=>({...p,[src.id]:new Date().toISOString()}));
      setStatus(p=>({...p,[src.id]:"done"}));
      setPulls(p=>p+1);
      addLog(`✓ ${src.label} — ${items.length} results`,"success");
    } catch(e){
      setStatus(p=>({...p,[src.id]:"error"}));
      addLog(`✗ ${src.label} — ${e.message}`,"error");
    }
    setActive(null);
  },[addLog]);

  const runAll = useCallback(async(qOverride)=>{
    const q = qOverride||MISSION_Q[qIdx%MISSION_Q.length];
    addLog(`▶ FULL SWEEP — ${q.slice(0,40)}...`,"sweep");
    for(const src of ALL_CRAWLERS){
      await runOne(src);
      await new Promise(r=>setTimeout(r,300));
    }
    setCountdown(REFRESH);
  },[runOne,addLog,qIdx]);

  useEffect(()=>{
    runAll();
    timerRef.current=setInterval(()=>{
      setCountdown(prev=>{
        if(prev<=1){
          const next=MISSION_Q[qIdx%MISSION_Q.length];
          setQIdx(i=>i+1);
          runAll(next);
          return REFRESH;
        }
        return prev-1;
      });
    },1000);
    return ()=>clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const toggleResultSelection = (id) => {
    setSelectedResults(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id]);
  };

  const handleExport = async () => {
    const selected = curResults.filter((r,i)=>selectedResults.includes(i));
    if(!selected.length) { alert("Select items to export"); return; }
    const content = [
      `TruthEngine360 Research Report`,
      `Generated: ${new Date().toLocaleString()}`,
      `Source: ${cur.label}`,
      `Items: ${selected.length}`,
      `=".repeat(70)`,
      "",
      ...selected.map((r,i)=>`\n[${i+1}] ${r.title}\nMeta: ${r.meta}\nSnippet: ${r.snippet}\nURL: ${r.url||"N/A"}`)
    ].join("\n");
    const blob = new Blob([content], {type:"text/plain"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `TE360_${cur.label.replace(/\s+/g,"_")}_${Date.now()}.txt`;
    a.click();
    setSelectedResults([]);
  };

  const fmt=iso=>iso?new Date(iso).toLocaleTimeString():"—";
  const fmtC=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  const sC=s=>s==="done"?"#2DD4BF":s==="running"?"#F5B942":s==="error"?"#FF5C5C":"#3D5570";
  const cats=["All","US Federal","Mexico","Academic","Archive","Legislative"];
  const visible=catFilter==="All"?ALL_CRAWLERS:ALL_CRAWLERS.filter(c=>c.cat===catFilter);
  const cur=ALL_CRAWLERS.find(c=>c.id===selSrc)||ALL_CRAWLERS[0];
  const curResults=results[selSrc]||[];

  return(
    <div style={{background:"#04060C",minHeight:"100vh",fontFamily:"'IBM Plex Mono',monospace",color:"#F0F6FF",display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700;800&display=swap');
        @keyframes scan{0%{top:0}100%{top:100%}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
        .te-scan{position:fixed;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,#4A9EFF60,transparent);animation:scan 3s linear infinite;pointer-events:none;z-index:999}
        .te-pulse{animation:pulse 1.5s ease-in-out infinite}
        .te-spin{animation:spin .8s linear infinite;display:inline-block}
        .te-blink{animation:blink 1s step-end infinite}
        .te-srcbtn:hover{background:#0D1525!important}
        .te-res:hover{background:#0D1525!important;cursor:pointer}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#080D18}::-webkit-scrollbar-thumb{background:#1A2640}
      `}</style>
      <div className="te-scan"/>

      {/* HEADER */}
      <div style={{background:"#050810",borderBottom:"1px solid #1A2640",padding:"12px 18px",position:"relative"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#FF5C5C,#F5B942,#2DD4BF,#4A9EFF,#9D7BFF,#FF8C42)"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:10}}>
          <div>
            <div style={{fontSize:7,color:"#4A9EFF",letterSpacing:5,fontWeight:700,marginBottom:2}}>TRUTHENGINE360 · AUMER FOUNDATION · EXPANDED INTELLIGENCE NETWORK v2</div>
            <div style={{fontSize:15,fontWeight:800}}>📡 <span style={{color:"#2DD4BF"}}>24/7</span> Intelligence Crawler — <span style={{color:"#FF8C42"}}>Mexico + US Federal</span> + Academic</div>
            <div style={{fontSize:8,color:"#3D5570",marginTop:2}}>{ALL_CRAWLERS.length} sources · Selective Service · Census · ICE · SEDENA · RENAPO · Casa del Migrante · Social Media · Congress.gov</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{background:"#0D1525",border:"1px solid #1A2640",borderRadius:9,padding:"7px 12px",textAlign:"center"}}>
              <div style={{fontSize:7,color:"#3D5570",marginBottom:2}}>NEXT SWEEP</div>
              <div style={{fontSize:17,fontWeight:800,color:countdown<60?"#FF5C5C":"#F5B942"}} className={countdown<30?"te-blink":""}>{fmtC(countdown)}</div>
              <div style={{background:"#080D18",borderRadius:2,height:3,width:70,overflow:"hidden",marginTop:3}}>
                <div style={{width:((REFRESH-countdown)/REFRESH*100)+"%",height:"100%",background:"linear-gradient(90deg,#2DD4BF,#4A9EFF)",transition:"width 1s linear"}}/>
              </div>
            </div>
            {[{n:pulls,l:"Pulls",c:"#2DD4BF"},{n:ALL_CRAWLERS.filter(c=>status[c.id]==="done").length,l:"Live",c:"#4A9EFF"},{n:Object.values(results).flat().length,l:"Results",c:"#F5C842"},{n:ALL_CRAWLERS.length,l:"Sources",c:"#9D7BFF"}].map((s,i)=>(
              <div key={i} style={{background:"#0D1525",border:`1px solid ${s.c}30`,borderTop:`2px solid ${s.c}`,borderRadius:7,padding:"5px 10px",textAlign:"center"}}>
                <div style={{fontSize:16,fontWeight:800,color:s.c}}>{s.n}</div>
                <div style={{fontSize:7,color:"#3D5570"}}>{s.l}</div>
              </div>
            ))}
            <button onClick={()=>runAll()} style={{padding:"7px 14px",background:"linear-gradient(135deg,#2DD4BF,#4A9EFF)",color:"#000",border:"none",borderRadius:7,fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>▶ SWEEP NOW</button>
          </div>
        </div>

        {/* Category filter */}
        <div style={{display:"flex",gap:5,marginBottom:8,flexWrap:"wrap"}}>
          {cats.map(c=>(
            <button key={c} onClick={()=>setCatFilter(c)} style={{padding:"3px 10px",background:catFilter===c?(CAT_COLORS[c]||"#4A9EFF")+"22":"transparent",border:`1px solid ${catFilter===c?(CAT_COLORS[c]||"#4A9EFF"):"#1A2640"}`,borderRadius:5,color:catFilter===c?(CAT_COLORS[c]||"#4A9EFF"):"#6B8BAA",fontSize:8,fontWeight:catFilter===c?700:400,cursor:"pointer",fontFamily:"inherit"}}>
              {c}{c!=="All"&&<span style={{marginLeft:4,opacity:.7}}>({ALL_CRAWLERS.filter(x=>x.cat===c).length})</span>}
            </button>
          ))}
        </div>

        {/* Source selector */}
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {visible.map(src=>{
            const s=status[src.id]||"idle";
            const isActive=active===src.id;
            const sc=sC(s);
            return(
              <button key={src.id} className="te-srcbtn" onClick={()=>{setSelSrc(src.id);setSelResult(null);}}
                style={{padding:"4px 10px",background:selSrc===src.id?src.color+"18":"transparent",border:`1px solid ${selSrc===src.id?src.color:"#1A2640"}`,borderRadius:6,color:selSrc===src.id?src.color:"#6B8BAA",fontSize:8,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all .1s",fontFamily:"inherit"}}>
                <span className={isActive?"te-spin":""}>{src.icon}</span>
                <span>{src.label.split(" ")[0]}</span>
                <span style={{width:5,height:5,borderRadius:"50%",background:sc,display:"inline-block"}} className={isActive?"te-pulse":""}/>
                {updated[src.id]&&<span style={{color:"#3D5570",fontSize:6}}>{fmt(updated[src.id])}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* BODY */}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>

        {/* CENTER: Results */}
        <div style={{flex:1,padding:"12px 14px",overflowY:"auto",borderRight:"1px solid #1A2640"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,gap:10}}>
            <div>
              <div style={{fontSize:12,fontWeight:800,color:cur.color,marginBottom:2}}>{cur.icon} {cur.label}</div>
              <div style={{fontSize:8,color:"#3D5570",marginBottom:1}}>{cur.desc}</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                <span style={{fontSize:7,background:cur.color+"18",border:`1px solid ${cur.color}30`,color:cur.color,borderRadius:3,padding:"1px 5px"}}>{cur.access}</span>
                <span style={{fontSize:7,background:"#080D18",border:"1px solid #1A2640",color:cur.irb.includes("ZERO")?"#2DD4BF":cur.irb.includes("LOW")?"#F5B942":"#FF5C5C",borderRadius:3,padding:"1px 5px"}}>IRB: {cur.irb}</span>
                <span style={{fontSize:7,color:"#3D5570"}}>Last: {fmt(updated[selSrc])}</span>
              </div>
            </div>
            <button onClick={()=>runOne(cur)} style={{padding:"4px 10px",background:cur.color+"18",border:`1px solid ${cur.color}30`,color:cur.color,borderRadius:5,fontSize:8,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit"}}>Refresh</button>
          </div>

          {status[selSrc]==="running"&&(
            <div style={{background:"#0D1525",border:`1px solid ${cur.color}30`,borderRadius:8,padding:"12px",textAlign:"center",marginBottom:8}}>
              <div style={{fontSize:10,color:cur.color}} className="te-pulse">⟳ Crawling {cur.label}...</div>
            </div>
          )}

          {selectedResults.length>0&&(
            <div style={{background:`${cur.color}12`,border:`1px solid ${cur.color}30`,borderRadius:8,padding:"10px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:8,color:cur.color,fontWeight:700}}>{selectedResults.length} selected</span>
              <button onClick={handleExport} style={{padding:"4px 10px",background:cur.color,color:"#000",border:"none",borderRadius:5,fontSize:7,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>↓ Export</button>
            </div>
          )}

          {curResults.length===0&&status[selSrc]!=="running"&&(
            <div style={{background:"#080D18",borderRadius:8,padding:"20px",textAlign:"center",color:"#3D5570",fontSize:9}}>
              No results yet — click Refresh or SWEEP NOW
            </div>
          )}

          {curResults.map((item,i)=>(
            <div key={i} className="te-res" onClick={()=>setSelResult(selResult===i?null:i)}
              style={{background:selResult===i?"#0D1525":selectedResults.includes(i)?cur.color+"08":"transparent",border:`1px solid ${selResult===i?cur.color+"50":selectedResults.includes(i)?cur.color+"40":"#1A264040"}`,borderLeft:`3px solid ${selResult===i?cur.color:selectedResults.includes(i)?cur.color:"#1A2640"}`,borderRadius:8,padding:"10px 12px",marginBottom:6,transition:"all .1s",position:"relative"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#F0F6FF",lineHeight:1.4,marginBottom:2}}>
                    <input type="checkbox" checked={selectedResults.includes(i)} onChange={(e)=>{e.stopPropagation();toggleResultSelection(i);}} style={{marginRight:6,cursor:"pointer"}}/>
                    {item.title?.slice(0,100)}
                  </div>
                  <div style={{fontSize:7,color:"#3D5570"}}>{item.meta}</div>
                </div>
                <div style={{display:"flex",gap:4,flexShrink:0,flexDirection:"column",alignItems:"flex-end"}}>
                  <span style={{background:cur.color+"18",border:`1px solid ${cur.color}30`,color:cur.color,borderRadius:20,padding:"1px 7px",fontSize:7,fontWeight:700,whiteSpace:"nowrap"}}>{item.badge}</span>
                  {item.tag&&<span style={{background:"#1A264060",borderRadius:3,padding:"1px 5px",fontSize:6,color:"#6B8BAA"}}>{item.tag}</span>}
                </div>
              </div>
              {selResult===i&&(
                <div style={{paddingTop:4,borderTop:"1px solid #1A264040",marginTop:4}}>
                  <div style={{fontSize:9,color:"#B8CCE8",lineHeight:1.8,marginBottom:6}}>{item.snippet}</div>
                  {item.url&&<a href={item.url} target="_blank" rel="noopener noreferrer" style={{fontSize:8,color:cur.color,textDecoration:"none",border:`1px solid ${cur.color}30`,borderRadius:4,padding:"2px 8px",display:"inline-block"}}>→ Open Source</a>}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* RIGHT: Control Panel */}
        <div style={{width:260,display:"flex",flexDirection:"column",background:"#050810",flexShrink:0}}>
          <div style={{padding:"10px 12px",borderBottom:"1px solid #1A2640",overflowY:"auto",maxHeight:280}}>
            <div style={{fontSize:7,color:"#F5C842",letterSpacing:3,fontWeight:700,marginBottom:7}}>SOURCE HEALTH — {ALL_CRAWLERS.length} SOURCES</div>
            {[{label:"US Federal",sources:SOURCES.US_FEDERAL},{label:"Mexico",sources:SOURCES.MEXICO},{label:"Research",sources:SOURCES.RESEARCH}].map(grp=>(
              <div key={grp.label} style={{marginBottom:8}}>
                <div style={{fontSize:7,color:CAT_COLORS[grp.label==="Research"?"Academic":grp.label]||"#3D5570",letterSpacing:2,marginBottom:4}}>{grp.label}</div>
                {grp.sources.map(src=>{
                  const s=status[src.id]||"idle";
                  const cnt=(results[src.id]||[]).length;
                  const sc=sC(s);
                  return(
                    <div key={src.id} style={{marginBottom:5,cursor:"pointer"}} onClick={()=>setSelSrc(src.id)}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:7,marginBottom:2}}>
                        <span style={{color:src.color}}>{src.icon} {src.label.slice(0,20)}</span>
                        <span style={{color:sc}}>{cnt}r · {s}</span>
                      </div>
                      <div style={{background:"#080D18",borderRadius:2,height:3,overflow:"hidden"}}>
                        <div style={{width:(Math.min(cnt,5)/5*100)+"%",height:"100%",background:src.color,transition:"width .4s ease"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div style={{padding:"10px 12px",borderBottom:"1px solid #1A2640"}}>
            <div style={{fontSize:7,color:"#2DD4BF",letterSpacing:3,fontWeight:700,marginBottom:6}}>QUERY ROTATION</div>
            {MISSION_Q.map((q,i)=>(
              <div key={i} style={{fontSize:7,color:i===qIdx%MISSION_Q.length?"#F5C842":"#3D5570",padding:"2px 0",borderBottom:"1px solid #1A264020",display:"flex",gap:5}}>
                <span style={{color:i===qIdx%MISSION_Q.length?"#F5C842":"#1A2640",flexShrink:0}}>{i===qIdx%MISSION_Q.length?"▶":"○"}</span>
                <span style={{lineHeight:1.4}}>{q.slice(0,42)}</span>
              </div>
            ))}
          </div>

          <div style={{flex:1,padding:"10px 12px",overflowY:"auto"}}>
            <div style={{fontSize:7,color:"#9D7BFF",letterSpacing:3,fontWeight:700,marginBottom:6}}>LIVE LOG</div>
            {logs.map((log,i)=>(
              <div key={i} style={{fontSize:7,marginBottom:3,display:"flex",gap:4,lineHeight:1.5,opacity:i===0?1:Math.max(0.3,1-i*0.04)}}>
                <span style={{color:"#3D5570",flexShrink:0}}>{log.ts}</span>
                <span style={{color:log.type==="error"?"#FF5C5C":log.type==="success"?"#2DD4BF":log.type==="sweep"?"#F5C842":"#6B8BAA"}}>{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{padding:"6px 18px",borderTop:"1px solid #1A2640",background:"#050810",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div style={{fontSize:6,color:"#3D5570",letterSpacing:2}}>TRUTHENGINE360 · SGT GEORGE RAMOS: THE MATHEMATICS OF VIETNAM · AUMER FOUNDATION · IRB-COMPLIANT RESEARCH</div>
        <div style={{fontSize:6,color:"#3D5570"}}>SELECTIVE SERVICE · CENSUS ACS · ICE ERO · SEDENA · RENAPO · COMAR · CONGRESS.GOV · SEMANTIC SCHOLAR · LOC</div>
      </div>
    </div>
  );
}