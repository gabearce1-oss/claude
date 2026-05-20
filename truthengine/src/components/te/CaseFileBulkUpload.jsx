import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { P } from "../../lib/teData";

// ─── COLUMN MAP ──────────────────────────────────────────────────────────────
// Maps common spreadsheet header variations → CaseFile field names

const FIELD_MAP = {
  // case_id
  "case_id": "case_id", "case id": "case_id", "caseid": "case_id", "id": "case_id", "case #": "case_id", "case#": "case_id",
  // subject_name
  "subject_name": "subject_name", "subject name": "subject_name", "full name": "subject_name", "name": "subject_name", "veteran name": "subject_name",
  // subject_aliases
  "subject_aliases": "subject_aliases", "aliases": "subject_aliases", "known aliases": "subject_aliases", "aka": "subject_aliases",
  // dob
  "dob": "dob", "date of birth": "dob", "birth date": "dob", "birthdate": "dob", "born": "dob",
  // birth_country
  "birth_country": "birth_country", "birth country": "birth_country", "country of birth": "birth_country", "country": "birth_country",
  // service_branch
  "service_branch": "service_branch", "branch": "service_branch", "military branch": "service_branch", "branch of service": "service_branch",
  // service_years
  "service_years": "service_years", "service years": "service_years", "years of service": "service_years", "service period": "service_years",
  // status
  "status": "status", "case status": "status",
  // priority
  "priority": "priority",
  // summary
  "summary": "summary", "case summary": "summary", "notes": "summary", "description": "summary",
  // dcas_match
  "dcas_match": "dcas_match", "dcas match": "dcas_match", "dcas": "dcas_match",
  // uscis_afile
  "uscis_afile": "uscis_afile", "a-file": "uscis_afile", "afile": "uscis_afile", "a file": "uscis_afile", "uscis a-file": "uscis_afile",
  // deportation_confirmed
  "deportation_confirmed": "deportation_confirmed", "deportation confirmed": "deportation_confirmed", "deported": "deportation_confirmed",
  // linked_evidence_count
  "linked_evidence_count": "linked_evidence_count", "evidence count": "linked_evidence_count",
  // analyst_owner
  "analyst_owner": "analyst_owner", "analyst": "analyst_owner", "assigned analyst": "analyst_owner", "owner": "analyst_owner",
  // tags
  "tags": "tags", "keywords": "tags", "labels": "tags",
};

const VALID_BRANCHES = ["Army", "Navy", "Marine Corps", "Air Force", "Coast Guard", "National Guard", "Unknown"];
const VALID_STATUSES = ["Active", "Under Review", "Closed – Confirmed", "Closed – Unverified", "Archived"];
const VALID_PRIORITIES = ["Critical", "High", "Medium", "Low"];

const BOOL_TRUE = ["true", "yes", "1", "y", "x", "confirmed", "match"];

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, "").toLowerCase());
  const rows = lines.slice(1).map(line => {
    // Handle quoted fields
    const cells = [];
    let inQuote = false, cur = "";
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuote = !inQuote; }
      else if (ch === "," && !inQuote) { cells.push(cur.trim()); cur = ""; }
      else { cur += ch; }
    }
    cells.push(cur.trim());
    return cells;
  });
  return { headers, rows };
}

function mapRow(headers, cells) {
  const record = {};
  headers.forEach((h, i) => {
    const field = FIELD_MAP[h];
    if (!field) return;
    let val = (cells[i] || "").trim().replace(/^"|"$/g, "");
    if (!val) return;

    if (field === "dcas_match" || field === "deportation_confirmed") {
      record[field] = BOOL_TRUE.includes(val.toLowerCase());
    } else if (field === "linked_evidence_count") {
      const n = parseInt(val, 10);
      if (!isNaN(n)) record[field] = n;
    } else if (field === "service_branch") {
      const match = VALID_BRANCHES.find(b => b.toLowerCase() === val.toLowerCase());
      record[field] = match || "Unknown";
    } else if (field === "status") {
      const match = VALID_STATUSES.find(s => s.toLowerCase() === val.toLowerCase());
      record[field] = match || "Active";
    } else if (field === "priority") {
      const match = VALID_PRIORITIES.find(p => p.toLowerCase() === val.toLowerCase());
      record[field] = match || "Medium";
    } else {
      record[field] = val;
    }
  });
  if (!record.status) record.status = "Active";
  if (!record.priority) record.priority = "Medium";
  return record;
}

function validateRecord(rec, idx) {
  const errors = [];
  if (!rec.subject_name) errors.push("Missing subject_name");
  if (!rec.case_id) errors.push("Missing case_id");
  return errors;
}

const TEMPLATE_CSV = `case_id,subject_name,subject_aliases,dob,birth_country,service_branch,service_years,status,priority,summary,dcas_match,uscis_afile,deportation_confirmed,analyst_owner,tags
CF-001,Juan Martinez Reyes,Juan Reyes,1948-03-15,Mexico,Army,1967-1970,Active,High,"Vietnam veteran deported 2005 IIRIRA",true,A123456789,true,Admin,"vietnam,iirira,army"
CF-002,Pedro Gonzalez,,1952-07-22,Mexico,Marine Corps,1970-1974,Under Review,Medium,"Korean DMZ era service",false,,false,Admin,"marine,vietnam-era"`;

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function CaseFileBulkUpload() {
  const [stage, setStage] = useState("upload"); // upload | preview | importing | done
  const [parsed, setParsed] = useState([]);
  const [errors, setErrors] = useState({}); // idx -> [errors]
  const [fileName, setFileName] = useState("");
  const [importResults, setImportResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  function processFile(file) {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const { headers, rows } = parseCSV(text);
      const records = rows
        .filter(cells => cells.some(c => c.trim()))
        .map(cells => mapRow(headers, cells));

      const errs = {};
      records.forEach((rec, i) => {
        const e = validateRecord(rec, i);
        if (e.length) errs[i] = e;
      });

      setParsed(records);
      setErrors(errs);
      setStage("preview");
    };
    reader.readAsText(file);
  }

  function handleFile(e) { processFile(e.target.files[0]); }
  function handleDrop(e) {
    e.preventDefault(); setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  }

  async function runImport() {
    const valid = parsed.filter((_, i) => !errors[i]);
    if (!valid.length) return;
    setStage("importing");
    let success = 0, failed = 0, failedRows = [];
    for (const rec of valid) {
      try {
        await base44.entities.CaseFile.create(rec);
        success++;
      } catch (err) {
        failed++;
        failedRows.push({ rec, error: err.message });
      }
    }
    setImportResults({ success, failed, failedRows, total: valid.length });
    setStage("done");
  }

  function reset() {
    setParsed([]); setErrors({}); setFileName(""); setImportResults(null);
    setStage("upload"); setDragOver(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "casefile_bulk_upload_template.csv";
    a.click();
  }

  const validCount = parsed.filter((_, i) => !errors[i]).length;
  const errorCount = Object.keys(errors).length;

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: P.t1, padding: "24px 28px", maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 4 }}>
          DATA OPERATIONS · BULK IMPORT
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: P.t1, margin: 0 }}>Case File Bulk Upload</h1>
        <p style={{ fontSize: 10, color: P.t3, marginTop: 5 }}>
          Import multiple veteran case files from a CSV spreadsheet · Auto-maps common column headers · Validates required fields before import
        </p>
      </div>

      {/* ── UPLOAD STAGE ── */}
      {stage === "upload" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current.click()}
            style={{
              border: `2px dashed ${dragOver ? P.gold : P.b}`,
              borderRadius: 14, padding: "48px 32px", textAlign: "center",
              background: dragOver ? `${P.gold}08` : P.card,
              cursor: "pointer", transition: "all .15s"
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: P.t1, marginBottom: 6 }}>
              Drop your CSV file here, or click to browse
            </div>
            <div style={{ fontSize: 9, color: P.t4 }}>Supports .csv files · UTF-8 encoding recommended</div>
            <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={handleFile} />
          </div>

          {/* Template + field guide */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ background: P.card, border: `1px solid ${P.teal}30`, borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: P.teal, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>
                📋 Download Template
              </div>
              <p style={{ fontSize: 10, color: P.t3, lineHeight: 1.7, marginBottom: 12 }}>
                Use this pre-formatted CSV template with all supported fields and two example rows to get started.
              </p>
              <button onClick={downloadTemplate}
                style={{ padding: "8px 18px", background: `${P.teal}18`, border: `1px solid ${P.teal}40`,
                  color: P.teal, borderRadius: 8, fontSize: 10, fontWeight: 800, cursor: "pointer",
                  fontFamily: "'IBM Plex Mono', monospace" }}>
                ⬇ Download Template CSV
              </button>
            </div>

            <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>
                📌 Supported Columns
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {["case_id *", "subject_name *", "subject_aliases", "dob", "birth_country", "service_branch", "service_years", "status", "priority", "summary", "dcas_match", "uscis_afile", "deportation_confirmed", "analyst_owner", "tags"].map(f => (
                  <span key={f} style={{ fontSize: 8, padding: "2px 8px", borderRadius: 20,
                    background: f.includes("*") ? `${P.red}15` : `${P.gold}10`,
                    border: `1px solid ${f.includes("*") ? P.red : P.gold}30`,
                    color: f.includes("*") ? P.red : P.t3 }}>
                    {f}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 8, color: P.t4, marginTop: 8 }}>* Required fields · Common header aliases auto-detected</div>
            </div>
          </div>
        </div>
      )}

      {/* ── PREVIEW STAGE ── */}
      {stage === "preview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Summary bar */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: 9, color: P.t4 }}>📄 {fileName}</div>
            <div style={{ padding: "4px 12px", background: `${P.teal}15`, border: `1px solid ${P.teal}35`,
              borderRadius: 20, fontSize: 9, color: P.teal, fontWeight: 800 }}>
              ✓ {validCount} ready to import
            </div>
            {errorCount > 0 && (
              <div style={{ padding: "4px 12px", background: `${P.red}12`, border: `1px solid ${P.red}30`,
                borderRadius: 20, fontSize: 9, color: P.red, fontWeight: 800 }}>
                ✗ {errorCount} rows with errors (will be skipped)
              </div>
            )}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button onClick={reset}
                style={{ padding: "7px 16px", background: "transparent", border: `1px solid ${P.b}`,
                  color: P.t3, borderRadius: 8, fontSize: 9, cursor: "pointer",
                  fontFamily: "'IBM Plex Mono', monospace" }}>
                ← Back
              </button>
              <button onClick={runImport} disabled={validCount === 0}
                style={{ padding: "7px 20px",
                  background: validCount > 0 ? `linear-gradient(135deg, ${P.gold}, ${P.amber})` : P.b,
                  border: "none", color: validCount > 0 ? "#000" : P.t4, borderRadius: 8,
                  fontSize: 10, fontWeight: 800, cursor: validCount > 0 ? "pointer" : "not-allowed",
                  fontFamily: "'IBM Plex Mono', monospace" }}>
                🚀 Import {validCount} Records
              </button>
            </div>
          </div>

          {/* Table preview */}
          <div style={{ overflowX: "auto", border: `1px solid ${P.b}`, borderRadius: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9 }}>
              <thead>
                <tr style={{ background: "#080D18", borderBottom: `2px solid ${P.gold}40` }}>
                  {["#", "Status", "Case ID", "Subject Name", "Branch", "Service Years", "Priority", "Deported", "DCAS"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 8,
                      fontWeight: 800, color: P.gold, textTransform: "uppercase", letterSpacing: "0.1em",
                      whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsed.map((rec, i) => {
                  const rowErrors = errors[i];
                  return (
                    <tr key={i} style={{
                      borderBottom: `1px solid ${P.b}20`,
                      background: rowErrors ? `${P.red}08` : i % 2 === 0 ? P.card : "transparent"
                    }}>
                      <td style={{ padding: "8px 12px", color: P.t4, fontSize: 8 }}>{i + 1}</td>
                      <td style={{ padding: "8px 12px" }}>
                        {rowErrors ? (
                          <span title={rowErrors.join(", ")}
                            style={{ fontSize: 7, padding: "2px 7px", background: `${P.red}15`,
                              border: `1px solid ${P.red}30`, borderRadius: 20, color: P.red,
                              cursor: "help" }}>
                            ✗ Error
                          </span>
                        ) : (
                          <span style={{ fontSize: 7, padding: "2px 7px", background: `${P.teal}12`,
                            border: `1px solid ${P.teal}25`, borderRadius: 20, color: P.teal }}>✓ OK</span>
                        )}
                      </td>
                      <td style={{ padding: "8px 12px", color: P.gold, fontWeight: 700 }}>{rec.case_id || "—"}</td>
                      <td style={{ padding: "8px 12px", color: P.t1, fontWeight: 700 }}>{rec.subject_name || "—"}</td>
                      <td style={{ padding: "8px 12px", color: P.t3 }}>{rec.service_branch || "—"}</td>
                      <td style={{ padding: "8px 12px", color: P.t3 }}>{rec.service_years || "—"}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ fontSize: 7, padding: "2px 7px", borderRadius: 20,
                          background: rec.priority === "Critical" ? `${P.red}15` : rec.priority === "High" ? `${P.amber}15` : `${P.b}30`,
                          color: rec.priority === "Critical" ? P.red : rec.priority === "High" ? P.amber : P.t4 }}>
                          {rec.priority || "Medium"}
                        </span>
                      </td>
                      <td style={{ padding: "8px 12px", color: rec.deportation_confirmed ? P.red : P.t4 }}>
                        {rec.deportation_confirmed ? "✓" : "—"}
                      </td>
                      <td style={{ padding: "8px 12px", color: rec.dcas_match ? P.teal : P.t4 }}>
                        {rec.dcas_match ? "✓" : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Error detail */}
          {errorCount > 0 && (
            <div style={{ background: `${P.red}08`, border: `1px solid ${P.red}25`, borderRadius: 8, padding: "12px 16px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: P.red, marginBottom: 8 }}>⚠ Row Errors (these rows will be skipped)</div>
              {Object.entries(errors).map(([i, errs]) => (
                <div key={i} style={{ fontSize: 9, color: P.t3, marginBottom: 4 }}>
                  <span style={{ color: P.red, fontWeight: 700 }}>Row {Number(i) + 1}</span>
                  {parsed[i]?.subject_name && <span style={{ color: P.t4 }}> ({parsed[i].subject_name})</span>}
                  : {errs.join(", ")}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── IMPORTING STAGE ── */}
      {stage === "importing" && (
        <div style={{ background: P.card, border: `1px solid ${P.gold}30`, borderRadius: 14, padding: "48px 32px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>⟳</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: P.gold, marginBottom: 6 }}>Importing records…</div>
          <div style={{ fontSize: 9, color: P.t4 }}>Writing {validCount} case files to the database</div>
        </div>
      )}

      {/* ── DONE STAGE ── */}
      {stage === "done" && importResults && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: P.card, border: `1px solid ${importResults.failed === 0 ? P.teal : P.amber}40`,
            borderLeft: `6px solid ${importResults.failed === 0 ? P.teal : P.amber}`,
            borderRadius: 12, padding: "28px 32px" }}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>{importResults.failed === 0 ? "✅" : "⚠️"}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: importResults.failed === 0 ? P.teal : P.amber, marginBottom: 10 }}>
              Import Complete
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: P.teal }}>{importResults.success}</div>
                <div style={{ fontSize: 9, color: P.t4 }}>Successfully imported</div>
              </div>
              {importResults.failed > 0 && (
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: P.red }}>{importResults.failed}</div>
                  <div style={{ fontSize: 9, color: P.t4 }}>Failed</div>
                </div>
              )}
            </div>
          </div>

          {importResults.failedRows.length > 0 && (
            <div style={{ background: `${P.red}08`, border: `1px solid ${P.red}25`, borderRadius: 8, padding: "12px 16px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: P.red, marginBottom: 8 }}>Failed Rows</div>
              {importResults.failedRows.map((f, i) => (
                <div key={i} style={{ fontSize: 9, color: P.t3, marginBottom: 4 }}>
                  <span style={{ color: P.red }}>{f.rec.case_id || f.rec.subject_name}</span>: {f.error}
                </div>
              ))}
            </div>
          )}

          <button onClick={reset}
            style={{ padding: "10px 24px", background: `${P.gold}18`, border: `1px solid ${P.gold}40`,
              color: P.gold, borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: "pointer",
              fontFamily: "'IBM Plex Mono', monospace", alignSelf: "flex-start" }}>
            ← Upload Another File
          </button>
        </div>
      )}
    </div>
  );
}