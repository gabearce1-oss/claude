import { useState, useRef } from "react";
import { P } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

const SCHEMAS = [
  {
    id:"dcas", label:"DCAS Casualty Record",
    desc:"Extract fields from DCAS PDF exports — surname, service branch, state, date",
    fields:["last_name","first_name","branch","state","date_of_death","race_code","service_number","component"],
    example:"DCAS_VN08_DOC.pdf"
  },
  {
    id:"veteran-case", label:"Veteran Case File",
    desc:"Extract case data from deportation documents, DD-214s, or court orders",
    fields:["name","branch","service_dates","discharge_type","case_id","deportation_date","country","confidence_score"],
    example:"MASTER_DEPORTED_MARINES_DATABASE.csv"
  },
  {
    id:"foia-response", label:"FOIA Response Document",
    desc:"Extract FOIA response metadata, granted/denied records, and exemptions cited",
    fields:["agency","request_id","date_received","date_response","records_found","exemptions","pages_released"],
    example:"VA_BIRLS_Response.pdf"
  },
  {
    id:"court-order", label:"Immigration Court Order",
    desc:"Extract removal order fields — alien number, judge, date, charges, disposition",
    fields:["alien_number","judge","court_date","charges","iirira_section","final_order","appeal_filed"],
    example:"EOIR_Order_of_Removal.pdf"
  },
  {
    id:"shelter", label:"Border Shelter Intake Form",
    desc:"Extract veteran intake data from shelter registration forms",
    fields:["name","date","shelter","age","gender","veteran_status","branch","origin_country","notes"],
    example:"Casa_del_Migrante_Intake.pdf"
  },
  {
    id:"custom", label:"Custom Schema",
    desc:"Define your own extraction fields",
    fields:[],
    example:"Any PDF or document"
  },
];

const SAMPLE_RESULTS = {
  dcas: [
    { last_name:"GARCIA", first_name:"JOSE M", branch:"ARMY", state:"TX", date_of_death:"1968-02-12", race_code:"W", service_number:"RA12345678", component:"RA", bisg_score:0.91 },
    { last_name:"RODRIGUEZ", first_name:"MIGUEL", branch:"USMC", state:"CA", date_of_death:"1969-05-04", race_code:"W", service_number:"2234567", component:"RA", bisg_score:0.88 },
    { last_name:"HERNANDEZ", first_name:"CARLOS A", branch:"ARMY", state:"NM", date_of_death:"1967-11-19", race_code:"W", service_number:"RA98765432", component:"RA", bisg_score:0.94 },
    { last_name:"LOPEZ", first_name:"ANTONIO", branch:"NAVY", state:"AZ", date_of_death:"1968-08-30", race_code:"W", service_number:"N4567890", component:"USN", bisg_score:0.86 },
  ],
  "veteran-case": [
    { name:"Manuel Valenzuela", branch:"USMC", service_dates:"1967-1971", discharge_type:"OTH", case_id:"C002", deportation_date:"1999-03-15", country:"Mexico", confidence_score:88 },
    { name:"Sae Joon Park", branch:"Army", service_dates:"1982-1986", discharge_type:"Honorable", case_id:"C004", deportation_date:"2025-11-01", country:"South Korea", confidence_score:91 },
  ],
};

export default function PDFExtraction() {
  const [schema, setSchema] = useState("dcas");
  const [customFields, setCustomFields] = useState("");
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("upload"); // upload | url | demo
  const fileRef = useRef();

  const selSchema = SCHEMAS.find(s => s.id === schema);
  const fields = schema === "custom"
    ? customFields.split(",").map(f=>f.trim()).filter(Boolean)
    : selSchema.fields;

  const jsonSchema = {
    type:"object",
    properties:{
      records:{
        type:"array",
        items:{
          type:"object",
          properties: Object.fromEntries(fields.map(f=>[f,{type:"string"}]))
        }
      },
      total_extracted:{type:"number"},
      bisg_flagged:{type:"number"},
      notes:{type:"string"}
    }
  };

  const runDemo = async () => {
    setLoading(true); setError(null); setResults(null);
    await new Promise(r=>setTimeout(r,1400));
    setResults({
      records: SAMPLE_RESULTS[schema] || SAMPLE_RESULTS.dcas,
      total_extracted: (SAMPLE_RESULTS[schema]||SAMPLE_RESULTS.dcas).length,
      bisg_flagged: (SAMPLE_RESULTS[schema]||SAMPLE_RESULTS.dcas).filter(r=>r.bisg_score>0.7||r.confidence_score>80).length,
      notes:"Demo extraction — replace with real document for live results."
    });
    setLoading(false);
  };

  const runExtraction = async () => {
    if (!file && !url && mode!=="demo") return;
    if (mode==="demo") { runDemo(); return; }
    setLoading(true); setError(null); setResults(null);
    try {
      let fileUrl = url;
      if (file) {
        const uploaded = await base44.integrations.Core.UploadFile({ file });
        fileUrl = uploaded.file_url;
      }
      const res = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: fileUrl,
        json_schema: jsonSchema
      });
      if (res.status === "success") {
        setResults(res.output);
      } else {
        setError(res.details || "Extraction failed.");
      }
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  const exportCSV = () => {
    if (!results?.records?.length) return;
    const headers = Object.keys(results.records[0]).join(",");
    const rows = results.records.map(r => Object.values(r).map(v=>`"${v}"`).join(",")).join("\n");
    const blob = new Blob([headers+"\n"+rows], {type:"text/csv"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `TE360_extract_${schema}_${Date.now()}.csv`; a.click();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:7, marginBottom:14 }}>
        {[
          {l:"Supported Formats", v:"PDF · CSV · XLSX · HTML · PNG · JPG", c:P.blue},
          {l:"Extraction Schemas", v:SCHEMAS.length, c:P.violet},
          {l:"Powered By", v:"AI Document Parser", c:P.teal},
          {l:"BISG Auto-Score", v:"On extract", c:P.gold},
        ].map((s,i) => (
          <div key={i} style={{ background:P.card, border:`1px solid ${s.c}25`, borderLeft:`3px solid ${s.c}`, borderRadius:7, padding:"8px 12px" }}>
            <div style={{ fontSize:7, color:P.t4, marginBottom:2 }}>{s.l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:s.v.toString().length > 6 ? 10 : 16, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"240px 1fr", gap:12 }}>

        {/* Schema selector */}
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <div style={{ fontSize:7, color:P.t4, letterSpacing:3, marginBottom:2 }}>EXTRACTION SCHEMA</div>
          {SCHEMAS.map(s => (
            <div key={s.id} onClick={() => setSchema(s.id)}
              style={{ background: schema===s.id ? `${P.violet}15` : P.card,
                border:`1px solid ${schema===s.id ? P.violet+"60" : P.b}`,
                borderLeft:`3px solid ${schema===s.id ? P.violet : P.b}`,
                borderRadius:8, padding:"8px 10px", cursor:"pointer", transition:"all .12s" }}>
              <div style={{ fontSize:9, fontWeight:700, color:schema===s.id ? P.violet : P.t1, marginBottom:2 }}>{s.label}</div>
              <div style={{ fontSize:7, color:P.t4, lineHeight:1.4 }}>{s.desc}</div>
              <div style={{ fontSize:6, color:P.t4, marginTop:3 }}>e.g. {s.example}</div>
            </div>
          ))}
        </div>

        {/* Main panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>

          {/* Fields preview */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"11px 14px" }}>
            <div style={{ fontSize:8, color:P.violet, fontWeight:700, letterSpacing:2, marginBottom:6 }}>
              EXTRACTION FIELDS — {selSchema.label}
            </div>
            {schema === "custom" ? (
              <input value={customFields} onChange={e=>setCustomFields(e.target.value)}
                placeholder="Enter comma-separated fields: name, date, branch, case_id..."
                style={{ width:"100%", padding:"7px 10px", background:"#080D18", border:`1px solid ${P.b}`,
                  borderRadius:7, color:P.t1, fontSize:9, fontFamily:"'IBM Plex Mono',monospace",
                  outline:"none", boxSizing:"border-box" }} />
            ) : (
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {fields.map(f => (
                  <span key={f} style={{ fontSize:8, background:`${P.violet}12`, border:`1px solid ${P.violet}20`,
                    color:P.violet, borderRadius:4, padding:"2px 8px", fontFamily:"'IBM Plex Mono',monospace" }}>
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Input mode */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, overflow:"hidden" }}>
            {/* Mode tabs */}
            <div style={{ display:"flex", borderBottom:`1px solid ${P.b}` }}>
              {[["upload","📤 Upload File"],["url","🔗 File URL"],["demo","🧪 Demo"]].map(([v,l]) => (
                <button key={v} onClick={() => setMode(v)}
                  style={{ flex:1, padding:"8px", background: mode===v ? `${P.blue}15` : "transparent",
                    border:"none", borderBottom: mode===v ? `2px solid ${P.blue}` : "2px solid transparent",
                    color: mode===v ? P.blue : P.t4, fontSize:9, fontWeight: mode===v ? 700 : 400,
                    cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace" }}>
                  {l}
                </button>
              ))}
            </div>
            <div style={{ padding:"12px 14px" }}>
              {mode === "upload" && (
                <div>
                  <div onClick={() => fileRef.current?.click()}
                    style={{ border:`2px dashed ${file ? P.teal : P.b}`, borderRadius:9, padding:"20px",
                      textAlign:"center", cursor:"pointer", background: file ? `${P.teal}05` : "transparent" }}>
                    <div style={{ fontSize:20, marginBottom:6 }}>📄</div>
                    <div style={{ fontSize:10, color: file ? P.teal : P.t3 }}>
                      {file ? file.name : "Click to upload PDF, CSV, XLSX, PNG, JPG"}
                    </div>
                    <div style={{ fontSize:8, color:P.t4, marginTop:3 }}>
                      {file ? `${(file.size/1024).toFixed(1)} KB` : "Supports DCAS exports, DD-214s, FOIA responses"}
                    </div>
                  </div>
                  <input ref={fileRef} type="file" accept=".pdf,.csv,.xlsx,.html,.png,.jpg,.jpeg"
                    onChange={e => setFile(e.target.files[0])} style={{ display:"none" }} />
                </div>
              )}
              {mode === "url" && (
                <input value={url} onChange={e=>setUrl(e.target.value)}
                  placeholder="https://docs.google.com/... or any public document URL"
                  style={{ width:"100%", padding:"9px 12px", background:"#080D18", border:`1px solid ${P.b}`,
                    borderRadius:8, color:P.t1, fontSize:10, fontFamily:"'IBM Plex Mono',monospace",
                    outline:"none", boxSizing:"border-box" }} />
              )}
              {mode === "demo" && (
                <div style={{ background:"#080D18", borderRadius:8, padding:"12px 14px" }}>
                  <div style={{ fontSize:9, color:P.teal, marginBottom:4 }}>🧪 Demo Mode — Sample {selSchema.label} Extraction</div>
                  <div style={{ fontSize:8, color:P.t3 }}>
                    Runs against pre-loaded sample data from AUMER project files. No upload needed.
                    Switch to Upload or URL to extract your own documents.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Run button */}
          <button onClick={runExtraction} disabled={loading || (mode==="upload"&&!file) || (mode==="url"&&!url)}
            style={{ padding:"11px 20px", background: loading ? P.b : `linear-gradient(135deg,${P.violet},${P.blue})`,
              color: loading ? P.t4 : "#fff", border:"none", borderRadius:9, fontSize:11,
              fontWeight:800, cursor: loading ? "not-allowed" : "pointer", fontFamily:"'IBM Plex Mono',monospace" }}>
            {loading ? "⟳ Extracting data..." : `▶ Extract ${selSchema.label}`}
          </button>

          {/* Error */}
          {error && (
            <div style={{ background:`${P.red}08`, border:`1px solid ${P.red}30`, borderRadius:8, padding:"10px 14px", fontSize:9, color:P.red }}>
              ⚠ {error}
            </div>
          )}

          {/* Results */}
          {results && (
            <div style={{ background:P.card, border:`1px solid ${P.teal}30`, borderRadius:10, overflow:"hidden" }}>
              <div style={{ background:`linear-gradient(90deg,${P.teal}12,transparent)`, borderBottom:`1px solid ${P.b}`,
                padding:"9px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <span style={{ fontSize:10, fontWeight:700, color:P.teal }}>✓ Extraction Complete</span>
                  <span style={{ fontSize:8, color:P.t4 }}>{results.total_extracted} records</span>
                  {results.bisg_flagged > 0 && (
                    <span style={{ fontSize:7, background:`${P.violet}18`, border:`1px solid ${P.violet}30`, color:P.violet, borderRadius:20, padding:"1px 7px" }}>
                      {results.bisg_flagged} BISG-flagged
                    </span>
                  )}
                </div>
                <button onClick={exportCSV}
                  style={{ padding:"4px 10px", background:`${P.teal}18`, border:`1px solid ${P.teal}30`,
                    color:P.teal, borderRadius:5, fontSize:8, fontWeight:700, cursor:"pointer" }}>
                  Export CSV ↓
                </button>
              </div>

              {/* Table */}
              <div style={{ overflowX:"auto", padding:"10px 14px" }}>
                {results.notes && <div style={{ fontSize:8, color:P.amber, marginBottom:8 }}>ℹ {results.notes}</div>}
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr>
                      {results.records?.[0] && Object.keys(results.records[0]).map(h => (
                        <th key={h} style={{ textAlign:"left", fontSize:7, color:P.t4, padding:"4px 8px",
                          borderBottom:`1px solid ${P.b}`, fontFamily:"'IBM Plex Mono',monospace", fontWeight:700,
                          textTransform:"uppercase", letterSpacing:1 }}>{h.replace(/_/g," ")}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.records?.map((row,i) => (
                      <tr key={i} style={{ borderBottom:`1px solid ${P.b}20` }}>
                        {Object.entries(row).map(([k,v]) => {
                          const isBisg = k === "bisg_score";
                          const bisgC = isBisg && v > 0.85 ? P.red : isBisg && v > 0.7 ? P.amber : P.teal;
                          return (
                            <td key={k} style={{ fontSize:8, padding:"5px 8px",
                              color: isBisg ? bisgC : P.t2,
                              fontFamily:"'IBM Plex Mono',monospace",
                              fontWeight: isBisg ? 800 : 400 }}>
                              {isBisg ? `p(H)=${v}` : v}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}