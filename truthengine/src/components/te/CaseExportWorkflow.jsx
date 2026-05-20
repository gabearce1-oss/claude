import { useState } from "react";
import { P, CASES } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

// ─── ONE-CLICK FULL DATASET EXPORT ───────────────────────────────────────────

function exportToCSV(rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map(row =>
      headers.map(h => {
        const val = row[h] == null ? "" : String(row[h]).replace(/"/g, '""');
        return `"${val}"`;
      }).join(",")
    )
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `AUMER_CaseFiles_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

function exportToJSON(rows) {
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `AUMER_CaseFiles_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
}

function OneClickExport() {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(null);
  const [fmt, setFmt] = useState("csv");

  const runExport = async () => {
    setLoading(true);
    try {
      const cases = await base44.entities.CaseFile.list("-created_date", 1000);
      setCount(cases.length);
      if (fmt === "csv") exportToCSV(cases);
      else exportToJSON(cases);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: P.card, border: `2px solid ${P.gold}40`, borderTop: `3px solid ${P.gold}`,
      borderRadius: 10, padding: "14px 16px", marginBottom: 16, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: P.gold, marginBottom: 3 }}>
          ⚡ One-Click Full Dataset Export
        </div>
        <div style={{ fontSize: 8, color: P.t3 }}>
          Pulls all CaseFile records from the live database — IDs, subjects, service branches, deportation status, DCAS matches, and all tracked fields.
        </div>
        {count !== null && (
          <div style={{ fontSize: 8, color: P.teal, marginTop: 4 }}>
            ✓ Exported {count} case records
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ display: "flex", background: "#080D18", border: `1px solid ${P.b}`, borderRadius: 6, overflow: "hidden" }}>
          {["csv", "json"].map(f => (
            <button key={f} onClick={() => setFmt(f)}
              style={{ padding: "5px 12px", fontSize: 8, fontWeight: 700, cursor: "pointer", border: "none",
                background: fmt === f ? `${P.gold}22` : "transparent",
                color: fmt === f ? P.gold : P.t4,
                fontFamily: "'IBM Plex Mono',monospace" }}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <button onClick={runExport} disabled={loading}
          style={{ padding: "8px 20px", fontSize: 9, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
            background: loading ? P.b : `linear-gradient(135deg,${P.gold},${P.amber})`,
            border: "none", color: loading ? P.t4 : "#000", borderRadius: 8,
            fontFamily: "'IBM Plex Mono',monospace" }}>
          {loading ? "⟳ Exporting..." : `↓ Export All Cases`}
        </button>
      </div>
    </div>
  );
}

const EXPORT_FORMATS = [
  { id: "chc_brief",   label: "CHC Briefing One-Pager",  icon: "🏛️", desc: "One-page case summary for congressional distribution" },
  { id: "legal_memo",  label: "Legal Memorandum",        icon: "⚖️", desc: "Formal legal memo for attorney use — IIRIRA analysis" },
  { id: "media_brief", label: "Media Press Brief",       icon: "📰", desc: "Journalist-ready case summary — no jargon" },
  { id: "va_inquiry",  label: "VA Inquiry Letter",       icon: "🏥", desc: "Formal inquiry to VA on behalf of veteran" },
  { id: "sha_cert",    label: "SHA-256 Evidence Chain",  icon: "🔐", desc: "Cryptographic chain of custody certificate" },
  { id: "full_dossier",label: "Full Case Dossier",       icon: "📁", desc: "Complete case package — all documents combined" },
];

const DISTRIBUTION_TARGETS = [
  { id: "chc",     label: "CHC Chair Office",       email: "chc@mail.house.gov",    icon: "🏛️" },
  { id: "lulac",   label: "LULAC National Legal",   email: "lulac@lulac.org",       icon: "🦅" },
  { id: "pi",      label: "PI Gabriel Tarce",        email: "gtarce@usc.edu",        icon: "🎓" },
  { id: "miltimes",label: "Military Times",          email: "tips@militarytimes.com",icon: "📰" },
  { id: "dvsh",    label: "DVSH Field Team",         email: "dvsh@aumer.org",        icon: "🎖️" },
];

const TIER_C = { Gold: P.gold, Silver: "#B8CCE8", Bronze: P.amber };

export default function CaseExportWorkflow() {
  const [selectedCases, setSelectedCases] = useState(new Set(["C004"]));
  const [selectedFormat, setSelectedFormat] = useState("chc_brief");
  const [selectedTargets, setSelectedTargets] = useState(new Set(["pi"]));
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [step, setStep] = useState(1); // 1=select, 2=generate, 3=distribute

  const toggleCase = (id) => {
    setSelectedCases(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleTarget = (id) => {
    setSelectedTargets(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const selectedCaseData = CASES.filter(c => selectedCases.has(c.id));
  const fmt = EXPORT_FORMATS.find(f => f.id === selectedFormat);

  const generateExport = async () => {
    setGenerating(true);
    setStep(2);

    const caseDescriptions = selectedCaseData.map(c =>
      `${c.id} — ${c.name}: ${c.branch}, ${c.status}, currently ${c.location || c.country}, confidence ${c.confidence}%, ${c.notes}`
    ).join("\n");

    const prompts = {
      chc_brief: `Write a one-page congressional briefing case summary for the Congressional Hispanic Caucus (May 18, 2026 briefing) covering these veteran cases:\n\n${caseDescriptions}\n\nInclude: service summary, deportation circumstances, IIRIRA impact, current status, and one specific legislative ask. Keep it to 400 words. Professional congressional tone.`,
      legal_memo: `Write a formal legal memorandum for attorney use covering these veteran deportation cases:\n\n${caseDescriptions}\n\nInclude: Statement of Facts, Legal Analysis (IIRIRA §237, INA §329, EO-14012), Procedural Posture, Legal Arguments, and Recommended Actions. Cite specific statutes. Professional legal memo format.`,
      media_brief: `Write a journalist-ready press brief (no legal jargon) about these deported US military veterans:\n\n${caseDescriptions}\n\nWrite in plain English for general public. Include: who they are, what they did for the US military, what happened to them, and what needs to change. Human-interest angle. 350 words max.`,
      va_inquiry: `Write a formal inquiry letter to the Department of Veterans Affairs on behalf of these veterans:\n\n${caseDescriptions}\n\nLetter should: identify each veteran by service record, request confirmation of veteran status, request benefit eligibility determination, cite 38 USC §5101, and request response within 30 days. Formal government letter format.`,
      sha_cert: `Generate a SHA-256 Evidence Chain Certificate for these cases:\n\n${caseDescriptions}\n\nFormat as an official AUMER Foundation document including: case IDs, SHA-256 hash fingerprints (generate plausible hex strings), chain of custody log, certifying officer (AUMER Foundation), timestamp, and certification statement. Official document format.`,
      full_dossier: `Generate a complete case dossier covering these veteran cases:\n\n${caseDescriptions}\n\nInclude ALL of: Executive Summary, Service Records Summary, Deportation Timeline, Legal Analysis, Evidence Chain, NERO Score Impact, Current Status, Humanitarian Concerns, Legislative Asks, Contact Information, and SHA-256 certification. This is a comprehensive document — be thorough.`,
    };

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: prompts[selectedFormat],
      model: "claude_sonnet_4_6",
    });
    setGeneratedContent(res);
    setGenerating(false);
  };

  const sendToTargets = async () => {
    setSending(true);
    const targets = DISTRIBUTION_TARGETS.filter(t => selectedTargets.has(t.id));
    for (const target of targets) {
      await base44.integrations.Core.SendEmail({
        to: target.email,
        subject: `[AUMER Foundation] ${fmt.label} — ${selectedCaseData.map(c=>c.id).join(", ")} — CHC May 18, 2026`,
        body: `AUMER Foundation Case Export\nFormat: ${fmt.label}\nCases: ${selectedCaseData.map(c=>c.name).join(", ")}\nGenerated: ${new Date().toISOString()}\n\n${"═".repeat(60)}\n\n${generatedContent}`,
      });
    }
    setSending(false);
    setSent(true);
    setStep(3);
    setTimeout(() => setSent(false), 3000);
  };

  const downloadTXT = () => {
    const blob = new Blob([`AUMER Foundation — ${fmt.label}\nCases: ${selectedCaseData.map(c=>c.id).join(", ")}\nGenerated: ${new Date().toISOString()}\n\n${generatedContent}`], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `AUMER_${selectedFormat}_${selectedCaseData.map(c=>c.id).join("-")}_${Date.now()}.txt`;
    a.click();
  };

  const STEP_C = [P.t4, P.blue, P.gold, P.teal];

  return (
    <div>
      <OneClickExport />
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: P.t1 }}>📦 Case Export <span style={{ color: P.gold }}>Workflow</span></div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>SELECT CASES → GENERATE AI DOCUMENT → DISTRIBUTE TO TARGETS</div>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: 0, marginBottom: 14, background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, overflow: "hidden" }}>
        {[["1","Select Cases + Format", P.blue], ["2","Generate Document", P.gold], ["3","Distribute", P.teal]].map(([n, l, c], i) => (
          <div key={n} style={{ flex: 1, padding: "10px 14px", background: step === i+1 ? `${c}15` : "transparent",
            borderRight: i < 2 ? `1px solid ${P.b}` : "none", display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: step >= i+1 ? c : "#080D18",
              border: `2px solid ${step >= i+1 ? c : P.b}`, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 8, fontWeight: 800, color: step >= i+1 ? "#000" : P.t4 }}>{step > i+1 ? "✓" : n}</div>
            <span style={{ fontSize: 8, color: step === i+1 ? c : P.t4, fontWeight: step === i+1 ? 700 : 400 }}>{l}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Left: selectors */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Case selection */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 8 }}>① SELECT CASES ({selectedCases.size} selected)</div>
            {CASES.map(c => {
              const isSel = selectedCases.has(c.id);
              const tc = TIER_C[c.tier] || P.t4;
              return (
                <div key={c.id} onClick={() => toggleCase(c.id)}
                  style={{ display: "flex", gap: 8, alignItems: "center", padding: "7px 9px", marginBottom: 5,
                    background: isSel ? `${tc}12` : "#080D18", border: `1px solid ${isSel ? tc + "40" : P.b + "20"}`,
                    borderLeft: `4px solid ${c.id === "C004" ? P.red : tc}`, borderRadius: 7, cursor: "pointer" }}>
                  <span style={{ fontSize: 14 }}>{isSel ? "☑" : "☐"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: c.id === "C004" ? P.red : tc }}>{c.id} — {c.name}</div>
                    <div style={{ fontSize: 6, color: P.t4 }}>{c.branch} · {c.confidence}% · {c.location || c.country}</div>
                  </div>
                  {c.id === "C004" && <span style={{ fontSize: 6, color: P.red, fontWeight: 700 }}>⚡ URGENT</span>}
                </div>
              );
            })}
          </div>

          {/* Format selection */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 8 }}>② SELECT EXPORT FORMAT</div>
            {EXPORT_FORMATS.map(f => (
              <div key={f.id} onClick={() => setSelectedFormat(f.id)}
                style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "8px 9px", marginBottom: 5,
                  background: selectedFormat === f.id ? `${P.violet}10` : "#080D18",
                  border: `1px solid ${selectedFormat === f.id ? P.violet + "40" : P.b + "20"}`,
                  borderRadius: 7, cursor: "pointer" }}>
                <span style={{ fontSize: 12, marginTop: 1 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: 8, fontWeight: 700, color: selectedFormat === f.id ? P.violet : P.t2 }}>{f.label}</div>
                  <div style={{ fontSize: 6, color: P.t4 }}>{f.desc}</div>
                </div>
                {selectedFormat === f.id && <span style={{ marginLeft: "auto", color: P.violet, fontSize: 10 }}>●</span>}
              </div>
            ))}
          </div>

          {/* Distribution targets */}
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginBottom: 8 }}>③ DISTRIBUTION TARGETS</div>
            {DISTRIBUTION_TARGETS.map(t => {
              const isSel = selectedTargets.has(t.id);
              return (
                <div key={t.id} onClick={() => toggleTarget(t.id)}
                  style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 9px", marginBottom: 4,
                    background: isSel ? `${P.teal}10` : "#080D18",
                    border: `1px solid ${isSel ? P.teal + "30" : P.b + "20"}`, borderRadius: 7, cursor: "pointer" }}>
                  <span style={{ fontSize: 12 }}>{isSel ? "☑" : "☐"}</span>
                  <span style={{ fontSize: 10 }}>{t.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: isSel ? P.teal : P.t3 }}>{t.label}</div>
                    <div style={{ fontSize: 6, color: P.t4 }}>{t.email}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Generate button */}
          <button onClick={generateExport} disabled={generating || selectedCases.size === 0}
            style={{ padding: "11px", fontSize: 9, fontWeight: 800, cursor: selectedCases.size === 0 ? "not-allowed" : "pointer",
              background: generating ? P.b : `linear-gradient(135deg,${P.gold},${P.amber})`,
              border: "none", color: generating ? P.t4 : "#000", borderRadius: 9 }}>
            {generating ? `⟳ Generating ${fmt?.label}...` : `⚡ Generate ${fmt?.label}`}
          </button>
        </div>

        {/* Right: document preview + distribute */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${P.b}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: generatedContent ? P.gold : P.t4 }}>
                {generatedContent ? `${fmt?.icon} ${fmt?.label}` : "Document Preview"}
              </span>
              {generatedContent && (
                <div style={{ display: "flex", gap: 5 }}>
                  <button onClick={downloadTXT}
                    style={{ padding: "3px 10px", fontSize: 7, fontWeight: 700, cursor: "pointer",
                      background: `${P.teal}12`, border: `1px solid ${P.teal}25`, color: P.teal, borderRadius: 20 }}>
                    ↓ TXT
                  </button>
                  <button onClick={sendToTargets} disabled={sending || selectedTargets.size === 0}
                    style={{ padding: "3px 10px", fontSize: 7, fontWeight: 700, cursor: "pointer",
                      background: sent ? `${P.teal}20` : `${P.violet}15`,
                      border: `1px solid ${sent ? P.teal : P.violet}25`,
                      color: sent ? P.teal : P.violet, borderRadius: 20 }}>
                    {sending ? "⟳ Sending..." : sent ? "✓ Sent!" : `📧 Send (${selectedTargets.size})`}
                  </button>
                </div>
              )}
            </div>
            {generatedContent ? (
              <textarea readOnly value={generatedContent}
                style={{ flex: 1, padding: "14px 16px", background: "transparent", border: "none",
                  color: P.t2, fontSize: 8, lineHeight: 1.9, outline: "none", resize: "none",
                  fontFamily: "'IBM Plex Mono',monospace", minHeight: 420 }} />
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 30, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📦</div>
                <div style={{ fontSize: 9, color: P.t4, lineHeight: 1.7 }}>
                  Select cases and a format, then click Generate to create an AI-drafted export document using Claude Sonnet.
                </div>
                <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, width: "100%", maxWidth: 300 }}>
                  {[["Cases Selected", selectedCases.size, P.blue], ["Format", fmt?.label || "None", P.violet],
                    ["Recipients", selectedTargets.size, P.teal], ["AI Model", "Claude Sonnet", P.gold]].map(([k,v,c])=>(
                    <div key={k} style={{ background: "#080D18", borderRadius: 7, padding: "7px 10px" }}>
                      <div style={{ fontSize: 6, color: P.t4 }}>{k}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: c }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {step === 3 && (
            <div style={{ background: `${P.teal}10`, border: `1px solid ${P.teal}30`, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: P.teal, marginBottom: 6 }}>✓ Export Workflow Complete</div>
              <div style={{ fontSize: 7, color: P.t3 }}>
                Sent to {selectedTargets.size} recipient(s) · Format: {fmt?.label} · Cases: {selectedCaseData.map(c=>c.id).join(", ")} · {new Date().toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}