import { useState } from "react";
import { P, CASES } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

const EVIDENCE_TYPES = {
  service_record:  { label:"Service Record",     icon:"🎖️", color:P.gold },
  legal_doc:       { label:"Legal Document",     icon:"⚖️", color:P.amber },
  foia_response:   { label:"FOIA Response",      icon:"📋", color:P.blue },
  photo:           { label:"Photo Evidence",     icon:"📸", color:P.violet },
  testimony:       { label:"Testimony",          icon:"🎤", color:P.teal },
  database_record: { label:"Database Record",    icon:"💾", color:P.red },
  academic:        { label:"Academic Source",    icon:"📚", color:P.orange||"#FF8C42" },
  field_report:    { label:"Field Report",       icon:"📝", color:P.t2 },
};

const INITIAL_DOCS = [
  { id:"EV001", caseId:"C001", type:"service_record", title:"DD-214 — George Ramos", source:"NARA", date:"2024-01", verified:true, confidence:99, hash:"a3f7b2...c41d", notes:"Honorable discharge confirmed. Silver Star citation included.", stream:"SHA-256 Certified" },
  { id:"EV002", caseId:"C001", type:"academic",       title:"Invisible Valor — BISG Chapter", source:"D1 Manuscript", date:"2025-08", verified:true, confidence:97, hash:"b9e1c4...f82a", notes:"DCAS 349 anomaly documented. BISG sweep methodology.", stream:"LitCentral" },
  { id:"EV003", caseId:"C002", type:"service_record", title:"USMC Record — M. Valenzuela", source:"Fold3", date:"2024-06", verified:true, confidence:88, hash:"d2c8a1...7e3f", notes:"USMC service 1967-1971 confirmed. Discharge status: OTH.", stream:"Fold3 Archive" },
  { id:"EV004", caseId:"C002", type:"legal_doc",      title:"IIRIRA Removal Order", source:"EOIR", date:"1999-03", verified:true, confidence:95, hash:"f1a9b3...2c7d", notes:"Retroactive application of IIRIRA §237. Pre-1996 offense.", stream:"Court Records" },
  { id:"EV005", caseId:"C003", type:"service_record", title:"USMC Record — V. Valenzuela", source:"Fold3", date:"2024-06", verified:true, confidence:84, hash:"c5d7e2...8b1a", notes:"Unit corroboration with C002. Same platoon 1968-1969.", stream:"Fold3 Archive" },
  { id:"EV006", caseId:"C004", type:"legal_doc",      title:"ICE Removal Order — Park", source:"ICE ENFORCE", date:"2025-09", verified:true, confidence:91, hash:"e8f3c1...4a2d", notes:"Self-deported Nov/Dec 2025. Voluntary departure under duress.", stream:"ENFORCE DB" },
  { id:"EV007", caseId:"C004", type:"service_record", title:"Army Service Record — Park", source:"DMDC DWP", date:"2024-11", verified:true, confidence:91, hash:"a1b4d6...9c3e", notes:"Army service 1982-1986. Honorable discharge confirmed.", stream:"DoD DMDC" },
  { id:"EV008", caseId:"DCAS", type:"database_record",title:"DCAS 58,220 Extract",source:"DoD", date:"2024-01", verified:true, confidence:100, hash:"f9e2a7...3b8c", notes:"Full Vietnam conflict file. 349 coded Hispanic. BISG re-analysis applied.", stream:"DCAS Official" },
  { id:"EV009", caseId:"DCAS", type:"academic",       title:"BISG Full Sweep τ=0.40", source:"AUMER Research", date:"2024-09", verified:true, confidence:97, hash:"b7c3f1...5d9a", notes:"2,309 BISG-inferred Hispanic. R²=0.947. SPSS validated.", stream:"BISG Method" },
  { id:"EV010", caseId:"FOIA", type:"foia_response",  title:"VA BIRLS FOIA — Non-Response", source:"VA SAOF", date:"2025-09", verified:true, confidence:100, hash:"c4a8b2...6e1f", notes:"F001: 83 days overdue. No response. Statutory deadline exceeded.", stream:"FOIA Tracker" },
  { id:"EV011", caseId:"FOIA", type:"foia_response",  title:"ICE ENFORCE FOIA — Non-Response", source:"DHS FOIA", date:"2025-10", verified:true, confidence:100, hash:"d9f1c3...7a4b", notes:"F002: 66 days overdue. No response. CHC briefing blocked.", stream:"FOIA Tracker" },
  { id:"EV012", caseId:"C005", type:"field_report",   title:"COMAR Shelter Report — M. Segura", source:"DVSH Field", date:"2025-11", verified:false, confidence:73, hash:"e2b6a4...8c1d", notes:"Nogales shelter. Veteran status unconfirmed. Awaiting SF-180.", stream:"Field Data" },
];

const CASE_OPTIONS = [
  {id:"ALL",  label:"All Cases"},
  {id:"C001", label:"C001 — Ramos"},
  {id:"C002", label:"C002 — M. Valenzuela"},
  {id:"C003", label:"C003 — V. Valenzuela"},
  {id:"C004", label:"C004 — Sae Joon Park"},
  {id:"C005", label:"C005 — M. Segura"},
  {id:"C006", label:"C006 — J. Duran"},
  {id:"DCAS", label:"DCAS Analysis"},
  {id:"FOIA", label:"FOIA Records"},
];

export default function EvidenceMapper() {
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [filterCase, setFilterCase] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newDoc, setNewDoc] = useState({ caseId:"C001", type:"service_record", title:"", source:"", date:"", notes:"", confidence:80 });
  const [mapView, setMapView] = useState("list"); // list | matrix | chain
  const [aiSummarizing, setAiSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);

  const filtered = docs.filter(d =>
    (filterCase==="ALL" || d.caseId===filterCase) &&
    (filterType==="ALL" || d.type===filterType) &&
    (!search || d.title.toLowerCase().includes(search.toLowerCase()) || d.notes?.toLowerCase().includes(search.toLowerCase()))
  );

  const addDoc = () => {
    const id = `EV${String(docs.length+1).padStart(3,"0")}`;
    const hash = Math.random().toString(36).slice(2,8)+"..."+Math.random().toString(36).slice(2,6);
    setDocs(prev=>[...prev, { ...newDoc, id, verified:false, hash, stream:"Manual Entry" }]);
    setShowAdd(false);
    setNewDoc({ caseId:"C001", type:"service_record", title:"", source:"", date:"", notes:"", confidence:80 });
  };

  const generateSummary = async () => {
    setAiSummarizing(true); setAiSummary(null);
    const targetDocs = filterCase==="ALL" ? docs : docs.filter(d=>d.caseId===filterCase);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt:`You are a forensic evidence analyst for the AUMER Foundation.

Analyze this evidence set for ${filterCase==="ALL"?"all cases":"case "+filterCase}:

${targetDocs.map(d=>`[${d.id}] ${d.title} (${d.type}) — Source: ${d.source} — Confidence: ${d.confidence}% — ${d.notes}`).join("\n")}

Provide:
1. Evidence strength assessment (overall confidence score 0-100)
2. Key gaps in the evidence chain
3. Which documents are strongest for CHC briefing
4. What additional evidence would upgrade weakest cases
5. Legal admissibility summary for immigration proceedings

Keep it under 200 words. Be specific and actionable.`,
    });
    setAiSummary(res);
    setAiSummarizing(false);
  };

  // Matrix: cases × evidence types
  const caseIds = ["C001","C002","C003","C004","C005","C006","DCAS","FOIA"];
  const typeKeys = Object.keys(EVIDENCE_TYPES);

  const exportEvidence = () => {
    const content = docs.map(d =>
      `[${d.id}] ${d.title}\n  Case: ${d.caseId} | Type: ${d.type} | Source: ${d.source} | Date: ${d.date}\n  Confidence: ${d.confidence}% | Verified: ${d.verified} | SHA-256: ${d.hash}\n  ${d.notes}`
    ).join("\n\n");
    const blob = new Blob([`AUMER EVIDENCE REGISTRY\nGenerated: ${new Date().toISOString()}\n\n${content}`], {type:"text/plain"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `AUMER_EvidenceRegistry_${new Date().toISOString().slice(0,10)}.txt`; a.click();
  };

  const selDoc = docs.find(d=>d.id===selected);

  return (
    <div>
      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:7, marginBottom:12 }}>
        {[
          {l:"Total Evidence Items", v:docs.length, c:P.blue},
          {l:"Verified / SHA-256",   v:docs.filter(d=>d.verified).length, c:P.teal},
          {l:"Unverified",           v:docs.filter(d=>!d.verified).length, c:P.amber},
          {l:"Avg Confidence",       v:`${Math.round(docs.reduce((a,d)=>a+d.confidence,0)/docs.length)}%`, c:P.gold},
          {l:"Cases Covered",        v:new Set(docs.map(d=>d.caseId)).size, c:P.violet},
        ].map((s,i)=>(
          <div key={i} style={{ background:P.card, border:`1px solid ${s.c}25`, borderLeft:`3px solid ${s.c}`, borderRadius:7, padding:"8px 12px" }}>
            <div style={{ fontSize:7, color:P.t4, marginBottom:2 }}>{s.l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:typeof s.v==="number"?20:14, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap", alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search evidence..."
          style={{ padding:"5px 10px", background:"#080D18", border:`1px solid ${search?P.gold:P.b}`,
            borderRadius:20, color:P.t1, fontSize:8, fontFamily:"'IBM Plex Mono',monospace", outline:"none", width:130 }} />
        <select value={filterCase} onChange={e=>setFilterCase(e.target.value)}
          style={{ padding:"5px 8px", background:"#080D18", border:`1px solid ${P.b}`, borderRadius:20, color:P.t1, fontSize:8, outline:"none" }}>
          {CASE_OPTIONS.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select value={filterType} onChange={e=>setFilterType(e.target.value)}
          style={{ padding:"5px 8px", background:"#080D18", border:`1px solid ${P.b}`, borderRadius:20, color:P.t1, fontSize:8, outline:"none" }}>
          <option value="ALL">All Types</option>
          {Object.entries(EVIDENCE_TYPES).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
        {[["list","≡ List"],["matrix","⊞ Matrix"],["chain","⛓ Chain"]].map(([v,l])=>(
          <button key={v} onClick={()=>setMapView(v)}
            style={{ padding:"5px 10px", fontSize:7, background:mapView===v?`${P.violet}18`:"transparent",
              border:`1px solid ${mapView===v?P.violet:P.b}`, borderRadius:20, color:mapView===v?P.violet:P.t4, cursor:"pointer" }}>
            {l}
          </button>
        ))}
        <button onClick={()=>setShowAdd(p=>!p)}
          style={{ padding:"5px 12px", background:`${P.teal}18`, border:`1px solid ${P.teal}30`,
            color:P.teal, borderRadius:20, fontSize:8, fontWeight:700, cursor:"pointer" }}>
          + Add Evidence
        </button>
        <button onClick={generateSummary} disabled={aiSummarizing}
          style={{ padding:"5px 12px", background:`${P.gold}18`, border:`1px solid ${P.gold}30`,
            color:P.gold, borderRadius:20, fontSize:8, fontWeight:700, cursor:aiSummarizing?"not-allowed":"pointer" }}>
          {aiSummarizing?"⟳":"✨"} AI Summary
        </button>
        <button onClick={exportEvidence}
          style={{ padding:"5px 12px", background:`${P.blue}12`, border:`1px solid ${P.blue}25`,
            color:P.blue, borderRadius:20, fontSize:8, fontWeight:700, cursor:"pointer", marginLeft:"auto" }}>
          ↓ Export Registry
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background:P.card, border:`1px solid ${P.teal}30`, borderRadius:10, padding:"12px 14px", marginBottom:10 }}>
          <div style={{ fontSize:8, fontWeight:700, color:P.teal, marginBottom:8 }}>+ ADD EVIDENCE ITEM</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            <input value={newDoc.title} onChange={e=>setNewDoc(p=>({...p,title:e.target.value}))} placeholder="Document title"
              style={{ padding:"7px 10px", background:"#080D18", border:`1px solid ${P.b}`, borderRadius:7, color:P.t1, fontSize:8, fontFamily:"'IBM Plex Mono',monospace", outline:"none" }} />
            <input value={newDoc.source} onChange={e=>setNewDoc(p=>({...p,source:e.target.value}))} placeholder="Source / Agency"
              style={{ padding:"7px 10px", background:"#080D18", border:`1px solid ${P.b}`, borderRadius:7, color:P.t1, fontSize:8, fontFamily:"'IBM Plex Mono',monospace", outline:"none" }} />
            <input value={newDoc.date} onChange={e=>setNewDoc(p=>({...p,date:e.target.value}))} placeholder="Date (YYYY-MM)"
              style={{ padding:"7px 10px", background:"#080D18", border:`1px solid ${P.b}`, borderRadius:7, color:P.t1, fontSize:8, fontFamily:"'IBM Plex Mono',monospace", outline:"none" }} />
            <select value={newDoc.caseId} onChange={e=>setNewDoc(p=>({...p,caseId:e.target.value}))}
              style={{ padding:"7px 10px", background:"#080D18", border:`1px solid ${P.b}`, borderRadius:7, color:P.t1, fontSize:8, outline:"none" }}>
              {CASE_OPTIONS.filter(c=>c.id!=="ALL").map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <select value={newDoc.type} onChange={e=>setNewDoc(p=>({...p,type:e.target.value}))}
              style={{ padding:"7px 10px", background:"#080D18", border:`1px solid ${P.b}`, borderRadius:7, color:P.t1, fontSize:8, outline:"none" }}>
              {Object.entries(EVIDENCE_TYPES).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              <span style={{ fontSize:7, color:P.t4 }}>Confidence:</span>
              <input type="number" min={0} max={100} value={newDoc.confidence} onChange={e=>setNewDoc(p=>({...p,confidence:Number(e.target.value)}))}
                style={{ width:50, padding:"7px 6px", background:"#080D18", border:`1px solid ${P.b}`, borderRadius:7, color:P.t1, fontSize:8, fontFamily:"'IBM Plex Mono',monospace", outline:"none", textAlign:"center" }} />
              <span style={{ fontSize:7, color:P.t4 }}>%</span>
            </div>
          </div>
          <textarea value={newDoc.notes} onChange={e=>setNewDoc(p=>({...p,notes:e.target.value}))} placeholder="Notes / description..."
            style={{ width:"100%", marginTop:8, padding:"7px 10px", background:"#080D18", border:`1px solid ${P.b}`, borderRadius:7,
              color:P.t1, fontSize:8, fontFamily:"'IBM Plex Mono',monospace", outline:"none", resize:"vertical", height:52, boxSizing:"border-box" }} />
          <div style={{ display:"flex", gap:8, marginTop:8 }}>
            <button onClick={addDoc} disabled={!newDoc.title}
              style={{ padding:"7px 16px", background:`linear-gradient(135deg,${P.teal},${P.blue})`, color:"#fff", border:"none", borderRadius:7, fontSize:9, fontWeight:800, cursor:newDoc.title?"pointer":"not-allowed" }}>
              Add to Registry
            </button>
            <button onClick={()=>setShowAdd(false)}
              style={{ padding:"7px 12px", background:"transparent", border:`1px solid ${P.b}`, borderRadius:7, color:P.t4, fontSize:8, cursor:"pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* AI Summary */}
      {aiSummary && (
        <div style={{ background:"#020609", border:`1px solid ${P.gold}20`, borderRadius:9, padding:"12px 14px", marginBottom:10,
          fontSize:8, color:P.t2, lineHeight:1.8, whiteSpace:"pre-wrap" }}>
          <div style={{ fontSize:7, color:P.gold, fontWeight:700, marginBottom:6 }}>✨ AI EVIDENCE SUMMARY</div>
          {aiSummary}
        </div>
      )}

      <div style={{ display:"flex", gap:10 }}>
        {/* Evidence list */}
        <div style={{ flex:1 }}>
          {mapView === "list" && filtered.map(doc=>{
            const et=EVIDENCE_TYPES[doc.type];
            const isSel=selected===doc.id;
            const cc=doc.confidence>=90?P.teal:doc.confidence>=70?P.gold:doc.confidence>=50?P.amber:P.red;
            return (
              <div key={doc.id} onClick={()=>setSelected(isSel?null:doc.id)}
                style={{ background:isSel?`${et.color}08`:P.card, border:`1px solid ${isSel?et.color+"40":P.b}`,
                  borderLeft:`5px solid ${et.color}`, borderRadius:9, padding:"10px 14px", marginBottom:7, cursor:"pointer" }}>
                <div style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:7, alignItems:"center", flexWrap:"wrap", marginBottom:3 }}>
                      <span style={{ fontSize:12 }}>{et.icon}</span>
                      <span style={{ fontSize:7, background:`${et.color}15`, border:`1px solid ${et.color}20`, color:et.color, borderRadius:20, padding:"1px 6px" }}>{et.label}</span>
                      <span style={{ fontSize:10, fontWeight:700, color:P.t1 }}>{doc.title}</span>
                      {doc.verified && <span style={{ fontSize:7, color:P.teal }}>✓ SHA-256</span>}
                    </div>
                    <div style={{ fontSize:8, color:P.t4 }}>
                      {doc.caseId} · {doc.source} · {doc.date} · Stream: {doc.stream}
                    </div>
                    {isSel && (
                      <div style={{ marginTop:8, padding:"8px 0", borderTop:`1px solid ${P.b}30` }}>
                        <div style={{ fontSize:8, color:P.t2, lineHeight:1.7, marginBottom:4 }}>{doc.notes}</div>
                        <div style={{ fontSize:7, color:P.t4, fontFamily:"'IBM Plex Mono',monospace" }}>SHA-256: {doc.hash}</div>
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:16, fontWeight:800, color:cc }}>{doc.confidence}%</div>
                    <div style={{ fontSize:6, color:cc }}>confidence</div>
                  </div>
                </div>
              </div>
            );
          })}

          {mapView === "matrix" && (
            <div style={{ overflowX:"auto" }}>
              <table style={{ borderCollapse:"collapse", minWidth:600 }}>
                <thead>
                  <tr style={{ background:"#080D18" }}>
                    <th style={{ padding:"8px 10px", fontSize:7, color:P.t4, textAlign:"left", borderBottom:`1px solid ${P.b}`, whiteSpace:"nowrap" }}>CASE</th>
                    {typeKeys.map(t=>(
                      <th key={t} style={{ padding:"8px 6px", fontSize:6, color:EVIDENCE_TYPES[t].color, textAlign:"center", borderBottom:`1px solid ${P.b}`, whiteSpace:"nowrap" }}>
                        {EVIDENCE_TYPES[t].icon}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {caseIds.map(cid=>(
                    <tr key={cid} style={{ borderBottom:`1px solid ${P.b}20` }}>
                      <td style={{ padding:"7px 10px", fontSize:8, color:P.t2, whiteSpace:"nowrap" }}>{cid}</td>
                      {typeKeys.map(t=>{
                        const match=docs.find(d=>d.caseId===cid&&d.type===t);
                        const ec=EVIDENCE_TYPES[t].color;
                        return (
                          <td key={t} style={{ padding:"7px 6px", textAlign:"center" }}>
                            {match ? (
                              <div title={match.title}
                                style={{ width:18, height:18, borderRadius:"50%", background:`${ec}30`,
                                  border:`2px solid ${match.verified?ec:P.amber}`, margin:"0 auto",
                                  fontSize:8, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}
                                onClick={()=>setSelected(match.id)}>
                                {match.verified?"✓":"?"}
                              </div>
                            ) : (
                              <div style={{ width:18, height:18, borderRadius:"50%", border:`1px dashed ${P.b}`, margin:"0 auto", opacity:0.3 }} />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize:7, color:P.t4, marginTop:6 }}>✓ = verified SHA-256 · ? = unverified · Empty = gap</div>
            </div>
          )}

          {mapView === "chain" && (
            <div>
              {caseIds.filter(cid=>docs.some(d=>d.caseId===cid)).map(cid=>{
                const caseDocs=docs.filter(d=>d.caseId===cid).sort((a,b)=>b.confidence-a.confidence);
                const avgConf=Math.round(caseDocs.reduce((a,d)=>a+d.confidence,0)/caseDocs.length);
                const cc=avgConf>=90?P.teal:avgConf>=70?P.gold:avgConf>=50?P.amber:P.red;
                return (
                  <div key={cid} style={{ marginBottom:12 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6 }}>
                      <span style={{ fontSize:9, fontWeight:700, color:cc }}>{cid}</span>
                      <span style={{ fontSize:7, color:P.t4 }}>{caseDocs.length} items · avg {avgConf}%</span>
                      <div style={{ flex:1, height:3, background:"#030508", borderRadius:2, overflow:"hidden" }}>
                        <div style={{ width:`${avgConf}%`, height:"100%", background:cc, borderRadius:2 }} />
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:0, overflowX:"auto" }}>
                      {caseDocs.map((doc,i)=>{
                        const et=EVIDENCE_TYPES[doc.type];
                        return (
                          <div key={doc.id} style={{ display:"flex", alignItems:"center" }}>
                            <div onClick={()=>setSelected(doc.id===selected?null:doc.id)}
                              style={{ background:P.card, border:`2px solid ${et.color}${doc.verified?"":"50"}`,
                                borderRadius:8, padding:"7px 9px", minWidth:90, cursor:"pointer" }}>
                              <div style={{ fontSize:10, textAlign:"center" }}>{et.icon}</div>
                              <div style={{ fontSize:7, color:et.color, textAlign:"center", fontWeight:700 }}>{doc.id}</div>
                              <div style={{ fontSize:6, color:P.t4, textAlign:"center" }}>{doc.confidence}%</div>
                            </div>
                            {i<caseDocs.length-1&&<div style={{ width:16, height:2, background:`${P.b}30`, flexShrink:0 }} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selDoc && (
          <div style={{ width:220, flexShrink:0, background:P.card,
            border:`1px solid ${EVIDENCE_TYPES[selDoc.type].color}40`, borderRadius:10, padding:"12px 14px", height:"fit-content" }}>
            <div style={{ fontSize:16, marginBottom:4 }}>{EVIDENCE_TYPES[selDoc.type].icon}</div>
            <div style={{ fontSize:9, fontWeight:800, color:EVIDENCE_TYPES[selDoc.type].color, marginBottom:2 }}>{selDoc.title}</div>
            <div style={{ fontSize:7, color:P.t4, marginBottom:8 }}>{selDoc.id} · {selDoc.caseId}</div>
            {[
              ["Source", selDoc.source, P.t2],
              ["Date", selDoc.date, P.t2],
              ["Stream", selDoc.stream, P.blue],
              ["Confidence", `${selDoc.confidence}%`, selDoc.confidence>=80?P.teal:P.amber],
              ["Verified", selDoc.verified?"✓ SHA-256":"⚠ Pending", selDoc.verified?P.teal:P.amber],
              ["Hash", selDoc.hash, P.t4],
            ].map(([k,v,c])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:7, padding:"3px 0", borderBottom:`1px solid ${P.b}20` }}>
                <span style={{ color:P.t4 }}>{k}</span>
                <span style={{ color:c, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700 }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop:8, fontSize:7, color:P.t2, lineHeight:1.7 }}>{selDoc.notes}</div>
          </div>
        )}
      </div>
    </div>
  );
}