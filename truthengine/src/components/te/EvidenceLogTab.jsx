import { useState, useCallback, useEffect } from "react";
import { P } from "../../lib/teData";

const VERDICT_OPTIONS = ["pending", "verified", "reviewed", "disputed"];
const ACCESS_CLASS_OPTIONS = ["public-open", "licensed", "FOIA-derived", "restricted", "metadata-only"];
const DOC_TYPE_OPTIONS = ["Military Record", "Court Filing", "FOIA Response", "Academic Paper", "News Article", "NGO Report", "Government Publication", "Archival Document", "Photograph", "Sworn Statement", "Other"];

const VERDICT_COLORS = {
  pending:  "#F5B942",
  verified: "#2DD4BF",
  reviewed: "#4A9EFF",
  disputed: "#ff0055",
};

const EMPTY_FORM = {
  evidence_id: "",
  case_ids: "",
  doc_title: "",
  doc_type: "Military Record",
  source_name: "",
  source_url: "",
  source_jurisdiction: "U.S. Federal",
  access_class: "public-open",
  sha256: "",
  sha256_verified: false,
  excerpt: "",
  analyst_name: "",
  analyst_notes: "",
  verdict: "pending",
  linked_entities: "",
  retrieval_date: new Date().toISOString().split("T")[0],
};

function generateEvidenceId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `EV-${ts}-${rand}`;
}

function sha256Preview(val) {
  // Validate format only — 64 hex chars
  return /^[a-fA-F0-9]{64}$/.test(val);
}

export default function EvidenceLogTab({ onRecordsChange }) {
  const [records, setRecords] = useState([]);

  useEffect(() => { onRecordsChange?.(records); }, [records, onRecordsChange]);
  const [form, setForm] = useState({ ...EMPTY_FORM, evidence_id: generateEvidenceId() });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterVerdict, setFilterVerdict] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [sha256Input, setSha256Input] = useState("");
  const [copied, setCopied] = useState(null);

  const handleField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSha256Change = (val) => {
    setSha256Input(val);
    handleField("sha256", val);
    handleField("sha256_verified", sha256Preview(val));
  };

  const handleSubmit = () => {
    if (!form.doc_title || !form.analyst_name || !form.case_ids) return;
    const now = new Date().toISOString();
    if (editingId) {
      setRecords(r => r.map(rec => rec.evidence_id === editingId ? { ...form, updated_at: now } : rec));
      setEditingId(null);
    } else {
      setRecords(r => [{ ...form, created_at: now }, ...r]);
    }
    setForm({ ...EMPTY_FORM, evidence_id: generateEvidenceId() });
    setSha256Input("");
    setShowForm(false);
  };

  const handleEdit = (rec) => {
    setForm({ ...rec });
    setSha256Input(rec.sha256 || "");
    setEditingId(rec.evidence_id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setRecords(r => r.filter(rec => rec.evidence_id !== id));
    if (expanded === id) setExpanded(null);
  };

  const handleCopy = useCallback((text, key) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const handleExportCSV = () => {
    const headers = ["evidence_id","case_ids","doc_title","doc_type","source_name","analyst_name","verdict","sha256","sha256_verified","access_class","retrieval_date","created_at"];
    const rows = records.map(r => headers.map(h => `"${(r[h]||"").toString().replace(/"/g,'""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "evidence_log.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = records.filter(r => {
    if (filterVerdict !== "all" && r.verdict !== filterVerdict) return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      if (!r.doc_title?.toLowerCase().includes(q) &&
          !r.case_ids?.toLowerCase().includes(q) &&
          !r.analyst_name?.toLowerCase().includes(q) &&
          !r.linked_entities?.toLowerCase().includes(q) &&
          !r.sha256?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const stats = {
    total: records.length,
    verified: records.filter(r => r.verdict === "verified").length,
    pending: records.filter(r => r.verdict === "pending").length,
    disputed: records.filter(r => r.verdict === "disputed").length,
    sha_valid: records.filter(r => r.sha256_verified).length,
  };

  const inputStyle = {
    fontFamily:"'IBM Plex Mono',monospace", fontSize:8, background:"#080D18",
    border:`1px solid ${P.b}`, borderRadius:5, padding:"5px 9px", color:P.t1,
    outline:"none", width:"100%", boxSizing:"border-box",
  };
  const labelStyle = { fontSize:7, color:P.t4, marginBottom:3, display:"block", fontWeight:700, letterSpacing:1 };

  return (
    <div style={{ fontFamily:"'IBM Plex Mono',monospace", color:P.t1 }}>

      {/* Header KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8, marginBottom:12 }}>
        {[
          ["Total Records", stats.total, P.blue],
          ["Verified", stats.verified, P.teal],
          ["Pending Review", stats.pending, P.amber],
          ["Disputed", stats.disputed, P.red],
          ["SHA-256 Valid", stats.sha_valid, P.violet],
        ].map(([l,v,c]) => (
          <div key={l} style={{ background:P.card, border:`1px solid ${c}25`, borderTop:`3px solid ${c}`, borderRadius:8, padding:"8px 12px", textAlign:"center" }}>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:20, fontWeight:800, color:c }}>{v}</div>
            <div style={{ fontSize:6, color:P.t4, marginTop:2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap", alignItems:"center" }}>
        <input
          value={searchQ} onChange={e => setSearchQ(e.target.value)}
          placeholder="Search title, case ID, analyst, entity, SHA-256…"
          style={{ ...inputStyle, flex:1, minWidth:180 }}
        />
        <select value={filterVerdict} onChange={e => setFilterVerdict(e.target.value)}
          style={{ ...inputStyle, width:"auto" }}>
          <option value="all">All Verdicts</option>
          {VERDICT_OPTIONS.map(v => <option key={v}>{v}</option>)}
        </select>
        <button onClick={handleExportCSV} disabled={records.length===0}
          style={{ padding:"5px 12px", fontSize:8, fontWeight:700, cursor:"pointer",
            background:`${P.blue}15`, border:`1px solid ${P.blue}30`, color:P.blue, borderRadius:6, fontFamily:"inherit",
            opacity: records.length===0?0.4:1 }}>
          ⬇ Export CSV
        </button>
        <button onClick={() => { setEditingId(null); setForm({...EMPTY_FORM, evidence_id: generateEvidenceId()}); setSha256Input(""); setShowForm(s => !s); }}
          style={{ padding:"5px 14px", fontSize:8, fontWeight:800, cursor:"pointer",
            background: showForm?`${P.gold}25`:`${P.gold}18`, border:`1px solid ${P.gold}`, color:P.gold, borderRadius:6, fontFamily:"inherit" }}>
          {showForm && !editingId ? "✕ Cancel" : "+ New Evidence Entry"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background:P.card, border:`2px solid ${P.gold}40`, borderRadius:10, padding:"16px 18px", marginBottom:14 }}>
          <div style={{ fontSize:10, fontWeight:800, color:P.gold, marginBottom:12 }}>
            {editingId ? "✏️ Edit Evidence Record" : "📝 New Evidence Record"} — {form.evidence_id}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:10 }}>
            {/* Evidence ID (readonly) */}
            <div>
              <label style={labelStyle}>EVIDENCE ID (AUTO)</label>
              <div style={{ display:"flex", gap:4 }}>
                <input value={form.evidence_id} readOnly style={{ ...inputStyle, color:P.gold, flex:1 }} />
                <button onClick={() => handleCopy(form.evidence_id, "eid")}
                  style={{ padding:"4px 8px", fontSize:7, cursor:"pointer", background:`${P.gold}15`, border:`1px solid ${P.gold}30`, color:P.gold, borderRadius:5, fontFamily:"inherit", whiteSpace:"nowrap" }}>
                  {copied==="eid"?"✓":"Copy"}
                </button>
              </div>
            </div>

            {/* Case IDs */}
            <div>
              <label style={labelStyle}>CASE IDs * (comma-separated)</label>
              <input value={form.case_ids} onChange={e => handleField("case_ids", e.target.value)}
                placeholder="EPP-001, C004, FOIA-2026-003"
                style={{ ...inputStyle, borderColor: !form.case_ids?"#ff005540":P.b }} />
            </div>

            {/* Analyst */}
            <div>
              <label style={labelStyle}>ANALYST NAME *</label>
              <input value={form.analyst_name} onChange={e => handleField("analyst_name", e.target.value)}
                placeholder="e.g. G. Arce"
                style={{ ...inputStyle, borderColor: !form.analyst_name?"#ff005540":P.b }} />
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:10, marginBottom:10 }}>
            {/* Doc Title */}
            <div>
              <label style={labelStyle}>DOCUMENT TITLE *</label>
              <input value={form.doc_title} onChange={e => handleField("doc_title", e.target.value)}
                placeholder="e.g. DCAS Vietnam Extract — Home of Record FOREIGN"
                style={{ ...inputStyle, borderColor: !form.doc_title?"#ff005540":P.b }} />
            </div>
            <div>
              <label style={labelStyle}>DOCUMENT TYPE</label>
              <select value={form.doc_type} onChange={e => handleField("doc_type", e.target.value)}
                style={{ ...inputStyle }}>
                {DOC_TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>RETRIEVAL DATE</label>
              <input type="date" value={form.retrieval_date} onChange={e => handleField("retrieval_date", e.target.value)}
                style={inputStyle} />
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:10, marginBottom:10 }}>
            <div>
              <label style={labelStyle}>SOURCE NAME</label>
              <input value={form.source_name} onChange={e => handleField("source_name", e.target.value)}
                placeholder="e.g. NARA Catalog API — DCAS Vietnam Conflict Extract"
                style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>JURISDICTION</label>
              <select value={form.source_jurisdiction} onChange={e => handleField("source_jurisdiction", e.target.value)}
                style={inputStyle}>
                {["U.S. Federal","U.S. State","Mexico Federal","Mexico State","International","NGO/Private"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>ACCESS CLASS</label>
              <select value={form.access_class} onChange={e => handleField("access_class", e.target.value)}
                style={inputStyle}>
                {ACCESS_CLASS_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom:10 }}>
            <label style={labelStyle}>SOURCE URL</label>
            <input value={form.source_url} onChange={e => handleField("source_url", e.target.value)}
              placeholder="https://…"
              style={inputStyle} />
          </div>

          {/* SHA-256 */}
          <div style={{ marginBottom:10 }}>
            <label style={labelStyle}>SHA-256 HASH (64 hex chars)</label>
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              <input value={sha256Input} onChange={e => handleSha256Change(e.target.value)}
                placeholder="e.g. a3f2c1d4… (64 hex chars)"
                style={{ ...inputStyle, flex:1,
                  borderColor: sha256Input.length===0?P.b:form.sha256_verified?"#2DD4BF40":"#ff005540",
                  color: form.sha256_verified?P.teal:sha256Input.length>0?P.red:P.t2 }} />
              <div style={{ fontSize:7, fontWeight:800, minWidth:80, textAlign:"center",
                color: form.sha256_verified?P.teal:sha256Input.length>0?P.red:P.t4 }}>
                {sha256Input.length===0 ? "—" : form.sha256_verified ? "✓ VALID" : `✕ ${sha256Input.length}/64`}
              </div>
            </div>
            <div style={{ fontSize:6, color:P.t4, marginTop:3 }}>
              Paste the document's SHA-256 hash for provenance verification. Must be exactly 64 lowercase hex characters.
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div>
              <label style={labelStyle}>LINKED ENTITIES (comma-separated)</label>
              <input value={form.linked_entities} onChange={e => handleField("linked_entities", e.target.value)}
                placeholder="EPP-001: José Martínez, DCAS Record #4172"
                style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>ANALYST VERDICT</label>
              <select value={form.verdict} onChange={e => handleField("verdict", e.target.value)}
                style={{ ...inputStyle, color: VERDICT_COLORS[form.verdict] }}>
                {VERDICT_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom:10 }}>
            <label style={labelStyle}>CITATION EXCERPT (≤ 500 chars)</label>
            <textarea value={form.excerpt} onChange={e => handleField("excerpt", e.target.value.slice(0,500))}
              placeholder="Paste or type the key citation excerpt from the document…"
              rows={3}
              style={{ ...inputStyle, resize:"vertical", lineHeight:1.6 }} />
            <div style={{ fontSize:6, color: form.excerpt.length>450?P.amber:P.t4, marginTop:2, textAlign:"right" }}>
              {form.excerpt.length}/500
            </div>
          </div>

          <div style={{ marginBottom:14 }}>
            <label style={labelStyle}>ANALYST NOTES</label>
            <textarea value={form.analyst_notes} onChange={e => handleField("analyst_notes", e.target.value)}
              placeholder="Internal notes, cross-references, contradictions flagged, follow-up actions…"
              rows={2}
              style={{ ...inputStyle, resize:"vertical", lineHeight:1.6 }} />
          </div>

          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button onClick={() => { setShowForm(false); setEditingId(null); }}
              style={{ padding:"6px 16px", fontSize:8, fontWeight:700, cursor:"pointer",
                background:"transparent", border:`1px solid ${P.b}`, color:P.t4, borderRadius:6, fontFamily:"inherit" }}>
              Cancel
            </button>
            <button onClick={handleSubmit}
              disabled={!form.doc_title || !form.analyst_name || !form.case_ids}
              style={{ padding:"6px 18px", fontSize:8, fontWeight:800, cursor:"pointer",
                background:`${P.gold}20`, border:`1px solid ${P.gold}`, color:P.gold,
                borderRadius:6, fontFamily:"inherit",
                opacity:(!form.doc_title||!form.analyst_name||!form.case_ids)?0.4:1 }}>
              {editingId ? "💾 Update Record" : "✓ Submit to Evidence Log"}
            </button>
          </div>
        </div>
      )}

      {/* Records list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"40px 20px", color:P.t4, fontSize:9 }}>
          {records.length === 0
            ? "No evidence records yet. Click \"+ New Evidence Entry\" to create the first one."
            : "No records match the current filter."}
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {/* Table header */}
          <div style={{ display:"grid", gridTemplateColumns:"140px 1fr 120px 80px 80px 100px 80px", gap:8, padding:"5px 10px",
            background:"#080D18", borderRadius:6, fontSize:6, fontWeight:800, color:P.t4, letterSpacing:1 }}>
            <span>EVIDENCE ID</span><span>DOCUMENT</span><span>CASE IDs</span><span>ANALYST</span>
            <span>VERDICT</span><span>SHA-256</span><span>ACTIONS</span>
          </div>

          {filtered.map((rec) => (
            <div key={rec.evidence_id}>
              <div
                onClick={() => setExpanded(expanded===rec.evidence_id ? null : rec.evidence_id)}
                style={{ display:"grid", gridTemplateColumns:"140px 1fr 120px 80px 80px 100px 80px", gap:8,
                  padding:"8px 10px", background:P.card, border:`1px solid ${expanded===rec.evidence_id?P.gold:P.b}`,
                  borderRadius: expanded===rec.evidence_id?"8px 8px 0 0":"8px",
                  cursor:"pointer", transition:"all .12s", alignItems:"center" }}>

                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, color:P.gold, fontWeight:700 }}>{rec.evidence_id}</span>

                <div>
                  <div style={{ fontSize:8, fontWeight:700, color:P.t1, marginBottom:1 }}>{rec.doc_title}</div>
                  <div style={{ fontSize:6, color:P.t4 }}>{rec.doc_type} · {rec.source_jurisdiction}</div>
                </div>

                <div style={{ display:"flex", flexWrap:"wrap", gap:2 }}>
                  {rec.case_ids.split(",").map(id => id.trim()).filter(Boolean).map(id => (
                    <span key={id} style={{ fontSize:6, background:`${P.blue}15`, color:P.blue, borderRadius:3, padding:"1px 5px", fontWeight:700 }}>{id}</span>
                  ))}
                </div>

                <span style={{ fontSize:7, color:P.t3 }}>{rec.analyst_name}</span>

                <span style={{ fontSize:7, fontWeight:800, color:VERDICT_COLORS[rec.verdict]||P.t4,
                  background:`${VERDICT_COLORS[rec.verdict]||P.t4}15`, borderRadius:4, padding:"2px 6px", textAlign:"center" }}>
                  {rec.verdict}
                </span>

                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  {rec.sha256_verified
                    ? <span style={{ fontSize:6, fontWeight:800, color:P.teal }}>✓ VALID</span>
                    : rec.sha256
                    ? <span style={{ fontSize:6, fontWeight:800, color:P.red }}>✕ INVALID</span>
                    : <span style={{ fontSize:6, color:P.t4 }}>— none</span>}
                </div>

                <div style={{ display:"flex", gap:4 }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleEdit(rec)}
                    style={{ padding:"2px 7px", fontSize:6, cursor:"pointer", background:`${P.blue}15`,
                      border:`1px solid ${P.blue}30`, color:P.blue, borderRadius:4, fontFamily:"inherit" }}>Edit</button>
                  <button onClick={() => handleDelete(rec.evidence_id)}
                    style={{ padding:"2px 7px", fontSize:6, cursor:"pointer", background:`${P.red}10`,
                      border:`1px solid ${P.red}30`, color:P.red, borderRadius:4, fontFamily:"inherit" }}>Del</button>
                </div>
              </div>

              {/* Expanded detail */}
              {expanded === rec.evidence_id && (
                <div style={{ background:"#080D18", border:`1px solid ${P.gold}30`, borderTop:"none",
                  borderRadius:"0 0 8px 8px", padding:"12px 14px" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10 }}>
                    {[
                      ["Source Name", rec.source_name],
                      ["Source URL", rec.source_url],
                      ["Access Class", rec.access_class],
                      ["Retrieval Date", rec.retrieval_date],
                      ["Linked Entities", rec.linked_entities],
                      ["Created", rec.created_at ? new Date(rec.created_at).toLocaleString() : "—"],
                    ].map(([k,v]) => v ? (
                      <div key={k}>
                        <div style={{ fontSize:6, color:P.t4, fontWeight:800, letterSpacing:1, marginBottom:2 }}>{k.toUpperCase()}</div>
                        <div style={{ fontSize:7, color:P.t2, lineHeight:1.5, wordBreak:"break-all" }}>{v}</div>
                      </div>
                    ) : null)}
                  </div>
                  {rec.sha256 && (
                    <div style={{ marginTop:10 }}>
                      <div style={{ fontSize:6, color:P.t4, fontWeight:800, letterSpacing:1, marginBottom:3 }}>SHA-256 HASH</div>
                      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, color:rec.sha256_verified?P.teal:P.red, wordBreak:"break-all" }}>{rec.sha256}</span>
                        <button onClick={() => handleCopy(rec.sha256, rec.evidence_id+"sha")}
                          style={{ padding:"2px 7px", fontSize:6, cursor:"pointer", flexShrink:0,
                            background:`${P.teal}10`, border:`1px solid ${P.teal}25`, color:P.teal, borderRadius:4, fontFamily:"inherit" }}>
                          {copied===rec.evidence_id+"sha" ? "✓" : "Copy"}
                        </button>
                      </div>
                    </div>
                  )}
                  {rec.excerpt && (
                    <div style={{ marginTop:10 }}>
                      <div style={{ fontSize:6, color:P.t4, fontWeight:800, letterSpacing:1, marginBottom:3 }}>CITATION EXCERPT</div>
                      <div style={{ fontSize:7, color:P.t2, background:"#030508", borderRadius:5, padding:"7px 10px",
                        lineHeight:1.7, borderLeft:`3px solid ${P.violet}` }}>
                        "{rec.excerpt}"
                      </div>
                    </div>
                  )}
                  {rec.analyst_notes && (
                    <div style={{ marginTop:10 }}>
                      <div style={{ fontSize:6, color:P.t4, fontWeight:800, letterSpacing:1, marginBottom:3 }}>ANALYST NOTES</div>
                      <div style={{ fontSize:7, color:P.t3, lineHeight:1.6 }}>{rec.analyst_notes}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Audit trail footer */}
      {records.length > 0 && (
        <div style={{ marginTop:14, background:`${P.blue}08`, border:`1px solid ${P.blue}20`, borderRadius:8, padding:"8px 12px",
          display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:6 }}>
          <div style={{ fontSize:7, color:P.t4 }}>
            🔒 Audit trail: {records.length} record{records.length!==1?"s":""} · SHA-256 validated: {stats.sha_valid}/{records.length} · Session-only storage (export CSV to persist)
          </div>
          <button onClick={handleExportCSV}
            style={{ padding:"4px 12px", fontSize:7, fontWeight:700, cursor:"pointer",
              background:`${P.blue}18`, border:`1px solid ${P.blue}40`, color:P.blue, borderRadius:5, fontFamily:"inherit" }}>
            ⬇ Export Audit CSV
          </button>
        </div>
      )}
    </div>
  );
}