import { useState } from "react";
import { P, CASES } from "../../lib/teData";

// Sample DCAS records (from teData)
const DCAS_SAMPLE = [
  { id: "D001", name: "Valente Valenzuela", dob: "1947-05-14", branch: "USMC", kia_date: "1967-03-22", home_state: "TX" },
  { id: "D002", name: "Manuel Valenzuela", dob: "1950-03-22", branch: "USMC", kia_date: "1968-11-15", home_state: "TX" },
  { id: "D003", name: "Sae Joon Park", dob: "1952-09-15", branch: "Army", kia_date: "1970-08-03", home_state: "CA" },
  { id: "D004", name: "Manuel Mike Segura", dob: "1960-01-15", branch: "Army", kia_date: "1969-05-20", home_state: "AZ" },
  { id: "D005", name: "Jesus Salvador Duran", dob: "1966-04-07", branch: "Army", kia_date: "1977-03-10", home_state: "TX" },
];

// Sample SSS records (Selective Service)
const SSS_SAMPLE = [
  { id: "S001", name: "Valente Valenzuela", dob: "1947-05-14", country_birth: "Mexico", draft_board: "El Paso, TX", a_number: "A12345678" },
  { id: "S002", name: "Manuel Valenzuela", dob: "1950-03-22", country_birth: "Mexico", draft_board: "El Paso, TX", a_number: "A23456789" },
  { id: "S003", name: "Manuel Miguel Segura", dob: "1960-01-15", country_birth: "Mexico", draft_board: "Phoenix, AZ", a_number: "A34567890" },
  { id: "S004", name: "Victor Hugo Lopez", dob: "1948-07-11", country_birth: "Mexico", draft_board: "San Diego, CA", a_number: "A45678901" },
];

const MATCH_ALGORITHM = {
  exact_name_dob: { weight: 100, label: "Exact name + DOB match" },
  name_dob_fuzzy: { weight: 85, label: "Fuzzy name + DOB match" },
  name_only: { weight: 60, label: "Name match only" },
  dob_match: { weight: 40, label: "DOB match only" },
  no_match: { weight: 0, label: "No match found" },
};

// Fuzzy string matching (Levenshtein distance)
function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[b.length][a.length];
}

function isFuzzyNameMatch(name1, name2, threshold = 3) {
  const dist = levenshteinDistance(name1.toLowerCase(), name2.toLowerCase());
  return dist <= threshold;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${m}/${d}/${y}`;
}

export default function InternationalRecordsMatcher() {
  const [view, setView] = useState("upload"); // upload | results
  const [sreData, setSreData] = useState([]);
  const [matches, setMatches] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [filterScore, setFilterScore] = useState(60);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      // Mock parsing SRE CSV/JSON
      const mockSRE = [
        { id: "SRE-001", name: "Valente Valenzuela", dob: "1947-05-14", death_date: "1967-03-22", consulate: "El Paso", repatriated: true },
        { id: "SRE-002", name: "Manuel Valenzuela", dob: "1950-03-22", death_date: "1968-11-15", consulate: "Phoenix", repatriated: true },
        { id: "SRE-003", name: "Miguel Angel Segura", dob: "1960-01-15", death_date: "1969-05-20", consulate: "San Diego", repatriated: false },
        { id: "SRE-004", name: "Victor Lopez", dob: "1948-07-11", death_date: "1972-02-14", consulate: "San Diego", repatriated: true },
        { id: "SRE-005", name: "Jorge Ramirez", dob: "1946-03-28", death_date: "1970-06-09", consulate: "El Paso", repatriated: true },
      ];
      setSreData(mockSRE);
      performMatching(mockSRE);
      setUploading(false);
      setView("results");
    }, 1000);
  };

  function performMatching(sre) {
    const results = [];
    sre.forEach(sreRecord => {
      let bestMatch = null;
      let highestScore = 0;

      // Try matching against DCAS
      DCAS_SAMPLE.forEach(dcasRecord => {
        let score = 0;
        const nameExactMatch = sreRecord.name.toLowerCase() === dcasRecord.name.toLowerCase();
        const nameFuzzyMatch = isFuzzyNameMatch(sreRecord.name, dcasRecord.name);
        const dobMatch = sreRecord.dob === dcasRecord.dob;

        if (nameExactMatch && dobMatch) {
          score = MATCH_ALGORITHM.exact_name_dob.weight;
        } else if (nameFuzzyMatch && dobMatch) {
          score = MATCH_ALGORITHM.name_dob_fuzzy.weight;
        } else if (nameExactMatch) {
          score = MATCH_ALGORITHM.name_only.weight;
        } else if (dobMatch) {
          score = MATCH_ALGORITHM.dob_match.weight;
        }

        if (score > highestScore) {
          highestScore = score;
          bestMatch = { type: "DCAS", record: dcasRecord, score };
        }
      });

      // Try matching against SSS
      SSS_SAMPLE.forEach(sssRecord => {
        let score = 0;
        const nameExactMatch = sreRecord.name.toLowerCase() === sssRecord.name.toLowerCase();
        const nameFuzzyMatch = isFuzzyNameMatch(sreRecord.name, sssRecord.name);
        const dobMatch = sreRecord.dob === sssRecord.dob;

        if (nameExactMatch && dobMatch) {
          score = MATCH_ALGORITHM.exact_name_dob.weight;
        } else if (nameFuzzyMatch && dobMatch) {
          score = MATCH_ALGORITHM.name_dob_fuzzy.weight;
        } else if (nameExactMatch) {
          score = MATCH_ALGORITHM.name_only.weight;
        } else if (dobMatch) {
          score = MATCH_ALGORITHM.dob_match.weight;
        }

        if (score > highestScore) {
          highestScore = score;
          bestMatch = { type: "SSS", record: sssRecord, score };
        }
      });

      results.push({
        sre: sreRecord,
        match: bestMatch,
        confidence: highestScore,
        status: highestScore >= 85 ? "VERIFIED" : highestScore >= 60 ? "LIKELY" : "NO_MATCH",
      });
    });

    setMatches(results);
  }

  const filtered = matches.filter(m => m.confidence >= filterScore);
  const verifiedCount = matches.filter(m => m.status === "VERIFIED").length;
  const likelyCount = matches.filter(m => m.status === "LIKELY").length;

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: P.t1, padding: "14px 20px", overflowY: "auto", height: "calc(100vh - 118px)" }}>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P.t1, marginBottom: 4 }}>
          🇲🇽 International Records Matcher
        </div>
        <div style={{ fontSize: 8, color: P.t4, letterSpacing: 2 }}>
          SRE CONSULAR DEATH CERTIFICATES · CROSS-REFERENCE DCAS & SSS · FUZZY NAME MATCHING
        </div>
      </div>

      {/* View Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, background: P.card, border: `1px solid ${P.b}`, borderRadius: 20, padding: "3px", width: "fit-content" }}>
        {[
          { id: "upload", label: "📤 Upload SRE Data", icon: "📤" },
          { id: "results", label: "📊 Matching Results", icon: "📊" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            style={{
              padding: "6px 14px",
              background: view === tab.id ? `${P.gold}18` : "transparent",
              border: "none",
              borderRadius: 18,
              color: view === tab.id ? P.gold : P.t4,
              fontSize: 8,
              fontWeight: view === tab.id ? 800 : 600,
              cursor: "pointer",
              fontFamily: "'IBM Plex Mono',monospace",
              transition: "all .12s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Upload View */}
      {view === "upload" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {/* File Upload */}
          <div style={{ background: P.card, border: `2px dashed ${P.gold}30`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 4 }}>Upload SRE Data</div>
            <div style={{ fontSize: 7, color: P.t4, marginBottom: 10 }}>CSV or JSON format</div>
            <label style={{ cursor: "pointer" }}>
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                disabled={uploading}
                style={{ display: "none" }}
              />
              <div style={{
                padding: "10px 16px",
                background: uploading ? `${P.amber}18` : `${P.gold}18`,
                border: `1px solid ${uploading ? P.amber : P.gold}30`,
                color: uploading ? P.amber : P.gold,
                borderRadius: 8,
                fontSize: 7,
                fontWeight: 700,
                cursor: uploading ? "not-allowed" : "pointer",
              }}>
                {uploading ? "⟳ Processing..." : "⬆ Choose File"}
              </div>
            </label>
            <div style={{ fontSize: 6, color: P.t4, marginTop: 10, lineHeight: 1.6 }}>
              Expected fields: name, dob, death_date, consulate, repatriated
            </div>
          </div>

          {/* Schema Info */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: P.t1, marginBottom: 10 }}>Expected SRE Data Format</div>
            <div style={{ fontSize: 6, color: P.t2, fontFamily: "'IBM Plex Mono',monospace", background: "#080D18", padding: "8px", borderRadius: 6, marginBottom: 8, lineHeight: 1.8, maxHeight: 180, overflowY: "auto" }}>
              {`{
  "id": "SRE-XXX",
  "name": "Full Name",
  "dob": "YYYY-MM-DD",
  "death_date": "YYYY-MM-DD",
  "consulate": "City, State",
  "repatriated": true/false
}`}
            </div>
            <div style={{ fontSize: 6, color: P.t4, lineHeight: 1.6 }}>
              <strong>Matching Logic:</strong><br/>
              • Exact name + DOB = 100 pts<br/>
              • Fuzzy name + DOB = 85 pts<br/>
              • Name only = 60 pts<br/>
              • DOB only = 40 pts
            </div>
          </div>
        </div>
      )}

      {/* Results View */}
      {view === "results" && sreData.length > 0 && (
        <div>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 12 }}>
            {[
              { label: "RECORDS UPLOADED", value: sreData.length, color: P.gold },
              { label: "VERIFIED MATCHES (≥85%)", value: verifiedCount, color: P.teal },
              { label: "LIKELY MATCHES (60-84%)", value: likelyCount, color: P.amber },
              { label: "MATCH RATE", value: `${Math.round((matches.filter(m => m.status !== "NO_MATCH").length / matches.length) * 100)}%`, color: P.violet },
            ].map((stat, i) => (
              <div key={i} style={{ background: P.card, border: `1px solid ${stat.color}25`, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 6, color: P.t4, letterSpacing: 1, marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 800, color: stat.color }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Filter Score Slider */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 8, fontWeight: 700, color: P.t1 }}>Minimum Confidence Score</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 800, color: P.gold }}>
                {filterScore}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={filterScore}
              onChange={e => setFilterScore(Number(e.target.value))}
              style={{ width: "100%", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 6, color: P.t4, marginTop: 6 }}>
              <span>0% — No Match</span>
              <span>60% — Likely</span>
              <span>85% — Verified</span>
              <span>100% — Exact</span>
            </div>
          </div>

          {/* Results Table */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: P.t1, marginBottom: 4 }}>
              Matching Results ({filtered.length} of {matches.length})
            </div>
            {filtered.map((result, i) => {
              const statusColor = result.status === "VERIFIED" ? P.teal : result.status === "LIKELY" ? P.amber : P.t4;
              const isExpanded = selectedMatch === i;

              return (
                <div
                  key={i}
                  onClick={() => setSelectedMatch(isExpanded ? null : i)}
                  style={{
                    background: isExpanded ? `${statusColor}08` : P.card,
                    border: `1px solid ${isExpanded ? statusColor : P.b}`,
                    borderLeft: `4px solid ${statusColor}`,
                    borderRadius: 9,
                    padding: "10px 12px",
                    cursor: "pointer",
                    transition: "all .15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: isExpanded ? 8 : 0 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 9, fontWeight: 800, color: P.t1 }}>{result.sre.name}</span>
                        <span style={{ fontSize: 6, background: `${statusColor}18`, color: statusColor, borderRadius: 20, padding: "1px 6px", fontWeight: 700 }}>
                          {result.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 7, color: P.t4 }}>
                        DOB: {formatDate(result.sre.dob)} • Consulate: {result.sre.consulate}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 800, color: statusColor }}>
                        {result.confidence}%
                      </div>
                      <div style={{ fontSize: 6, color: P.t4 }}>Confidence</div>
                    </div>
                  </div>

                  {isExpanded && result.match && (
                    <div style={{ paddingTop: 8, borderTop: `1px solid ${P.b}` }}>
                      <div style={{ fontSize: 7, color: P.t2, marginBottom: 6 }}>
                        <strong>Matched Against {result.match.type}:</strong> {result.match.record.name}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div style={{ background: "#080D18", borderRadius: 6, padding: "6px", fontSize: 6, color: P.t3 }}>
                          <strong>SRE Record:</strong><br/>
                          {`Name: ${result.sre.name}\nDOB: ${formatDate(result.sre.dob)}\nDeath: ${formatDate(result.sre.death_date)}\nRepatriated: ${result.sre.repatriated ? "Yes" : "No"}`}
                        </div>
                        <div style={{ background: "#080D18", borderRadius: 6, padding: "6px", fontSize: 6, color: P.t3 }}>
                          <strong>{result.match.type} Record:</strong><br/>
                          {result.match.type === "DCAS"
                            ? `Name: ${result.match.record.name}\nBranch: ${result.match.record.branch}\nKIA: ${formatDate(result.match.record.kia_date)}\nState: ${result.match.record.home_state}`
                            : `Name: ${result.match.record.name}\nDraft Board: ${result.match.record.draft_board}\nA-Number: ${result.match.record.a_number}`}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {view === "results" && sreData.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: P.t4 }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>📤</div>
          <div style={{ fontSize: 9, color: P.t4 }}>No SRE data uploaded yet</div>
          <div style={{ fontSize: 7, marginTop: 6 }}>Upload a file to begin matching records</div>
        </div>
      )}
    </div>
  );
}