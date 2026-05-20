import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { P } from "../../lib/teData";
import CaseFileCard from "./evidence/CaseFileCard";
import CaseFileForm from "./evidence/CaseFileForm";
import EvidenceLinkCard from "./evidence/EvidenceLinkCard";
import EvidenceLinkForm from "./evidence/EvidenceLinkForm";

const TABS = ["Case Files", "Evidence Links", "Unified View"];

const STAT_COLORS = [P.gold, P.teal, P.blue, P.amber, P.red];

export default function EvidenceLinker() {
  const [tab, setTab] = useState("Case Files");
  const [cases, setCases] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterLinkType, setFilterLinkType] = useState("ALL");

  async function load() {
    setLoading(true);
    const [c, l] = await Promise.all([
      base44.entities.CaseFile.list("-created_date", 200),
      base44.entities.EvidenceLink.list("-created_date", 500),
    ]);
    setCases(c);
    setLinks(l);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Per-case link counts
  const linkCountMap = useMemo(() => {
    const m = {};
    links.forEach(l => { m[l.case_file_id] = (m[l.case_file_id] || 0) + 1; });
    return m;
  }, [links]);

  // Links for selected case
  const caseLinks = useMemo(() =>
    selectedCase ? links.filter(l => l.case_file_id === selectedCase.case_id) : links,
    [links, selectedCase]
  );

  const filteredCases = useMemo(() => cases.filter(c => {
    const qOk = !searchQ || c.subject_name.toLowerCase().includes(searchQ.toLowerCase()) || c.case_id.toLowerCase().includes(searchQ.toLowerCase());
    const sOk = filterStatus === "ALL" || c.status === filterStatus;
    return qOk && sOk;
  }), [cases, searchQ, filterStatus]);

  const filteredLinks = useMemo(() => {
    let base = selectedCase ? caseLinks : links;
    if (filterLinkType !== "ALL") base = base.filter(l => l.link_type === filterLinkType);
    if (searchQ) base = base.filter(l => l.subject_name?.toLowerCase().includes(searchQ.toLowerCase()) || l.source_a_label?.toLowerCase().includes(searchQ.toLowerCase()) || l.source_b_label?.toLowerCase().includes(searchQ.toLowerCase()));
    return base;
  }, [links, caseLinks, selectedCase, filterLinkType, searchQ]);

  const stats = useMemo(() => [
    { v: cases.length, l: "Case Files", c: P.gold },
    { v: links.length, l: "Evidence Links", c: P.teal },
    { v: links.filter(l => l.review_state === "Confirmed").length, l: "Confirmed Links", c: P.blue },
    { v: links.filter(l => l.link_type === "Contradiction").length, l: "Contradictions", c: P.red },
    { v: cases.filter(c => c.dcas_match && c.deportation_confirmed).length, l: "Full Matches", c: P.amber },
  ], [cases, links]);

  const LINK_TYPES = ["ALL", "Identity Match", "Service Corroboration", "Deportation Confirmation", "Death / KIA Corroboration", "FOIA Response Match", "Contradiction", "Supporting Evidence"];

  function handleLinkStatusChange(id, newState) {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, review_state: newState } : l));
  }

  function handleLinkDelete(id) {
    setLinks(prev => prev.filter(l => l.id !== id));
  }

  const S = { fontFamily: "'IBM Plex Mono', monospace", color: P.t1 };
  const INPUT = { padding: "6px 12px", background: P.card, border: `1px solid ${P.b}`, borderRadius: 6, color: P.t1, fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", outline: "none" };

  return (
    <div style={{ ...S, padding: "24px 28px", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 4 }}>
          EVIDENCE MODULE · FORENSIC LINK ANALYSIS
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: P.t1, margin: 0 }}>Evidence Linker & Case File Builder</h1>
        <p style={{ fontSize: 10, color: P.t3, marginTop: 5, lineHeight: 1.5 }}>
          Match disparate records across USCIS, DoD, NARA, VA, ICE and other sources — build unified, evidence-backed case files for analyst review.
        </p>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 20 }}>
        {stats.map(s => (
          <div key={s.l} style={{ border: `1px solid ${s.c}40`, borderTop: `3px solid ${s.c}`, background: `${s.c}0A`, borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 8, color: P.t4, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18, borderBottom: `1px solid ${P.b}`, paddingBottom: 12 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "7px 18px", fontSize: 10, fontWeight: 800, background: tab === t ? `${P.gold}22` : "transparent",
              border: `1px solid ${tab === t ? P.gold : P.b}`, color: tab === t ? P.gold : P.t3, borderRadius: 6, cursor: "pointer",
              fontFamily: "'IBM Plex Mono', monospace" }}>
            {t}
          </button>
        ))}
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search subject, source, ID..."
          style={{ ...INPUT, marginLeft: "auto", width: 240 }} />
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: 60, color: P.t4 }}>
          <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin inline-block" />
          <div style={{ marginTop: 10, fontSize: 10 }}>Loading case data…</div>
        </div>
      )}

      {/* CASE FILES TAB */}
      {!loading && tab === "Case Files" && (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
            {["ALL", "Active", "Under Review", "Closed – Confirmed", "Archived"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                style={{ padding: "4px 12px", fontSize: 9, fontWeight: 700, background: filterStatus === s ? `${P.teal}22` : "transparent",
                  border: `1px solid ${filterStatus === s ? P.teal : P.b}`, color: filterStatus === s ? P.teal : P.t4, borderRadius: 5, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>
                {s}
              </button>
            ))}
            <button onClick={() => setShowCaseForm(!showCaseForm)}
              style={{ marginLeft: "auto", padding: "6px 18px", fontSize: 10, fontWeight: 800, background: `${P.gold}22`, border: `1px solid ${P.gold}`, color: P.gold, borderRadius: 6, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>
              + New Case File
            </button>
          </div>

          {showCaseForm && (
            <div style={{ marginBottom: 20, padding: "18px 20px", border: `1px solid ${P.gold}40`, borderTop: `3px solid ${P.gold}`, background: P.card, borderRadius: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: P.gold, marginBottom: 14 }}>NEW CASE FILE</div>
              <CaseFileForm onSaved={() => { setShowCaseForm(false); load(); }} onCancel={() => setShowCaseForm(false)} />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
            {filteredCases.map(cf => (
              <CaseFileCard key={cf.id} cf={cf} linkCount={linkCountMap[cf.case_id] || 0}
                isSelected={selectedCase?.id === cf.id}
                onClick={() => { setSelectedCase(selectedCase?.id === cf.id ? null : cf); setTab("Evidence Links"); }} />
            ))}
            {filteredCases.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: P.t4, fontSize: 11 }}>
                No case files yet. Click "New Case File" to create one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* EVIDENCE LINKS TAB */}
      {!loading && tab === "Evidence Links" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
            {selectedCase && (
              <div style={{ padding: "4px 12px", background: `${P.gold}15`, border: `1px solid ${P.gold}40`, borderRadius: 6, fontSize: 9, color: P.gold, fontWeight: 700 }}>
                Filter: {selectedCase.subject_name} ({selectedCase.case_id})
                <button onClick={() => setSelectedCase(null)} style={{ marginLeft: 8, background: "none", border: "none", color: P.gold, cursor: "pointer", fontSize: 10 }}>✕</button>
              </div>
            )}
            <select value={filterLinkType} onChange={e => setFilterLinkType(e.target.value)}
              style={{ ...INPUT, cursor: "pointer" }}>
              {LINK_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <button onClick={() => setShowLinkForm(!showLinkForm)}
              style={{ marginLeft: "auto", padding: "6px 18px", fontSize: 10, fontWeight: 800, background: `${P.teal}22`, border: `1px solid ${P.teal}`, color: P.teal, borderRadius: 6, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>
              + New Evidence Link
            </button>
          </div>

          {showLinkForm && (
            <div style={{ marginBottom: 20, padding: "18px 20px", border: `1px solid ${P.teal}40`, borderTop: `3px solid ${P.teal}`, background: P.card, borderRadius: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: P.teal, marginBottom: 14 }}>NEW EVIDENCE LINK</div>
              <EvidenceLinkForm
                caseFileId={selectedCase?.case_id || ""}
                subjectName={selectedCase?.subject_name || ""}
                subjectId={selectedCase?.case_id || ""}
                onSaved={() => { setShowLinkForm(false); load(); }}
                onCancel={() => setShowLinkForm(false)} />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredLinks.map(l => (
              <EvidenceLinkCard key={l.id} link={l}
                onDelete={handleLinkDelete}
                onStatusChange={handleLinkStatusChange} />
            ))}
            {filteredLinks.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: P.t4, fontSize: 11 }}>
                No evidence links yet. Click "+ New Evidence Link" to connect two records.
              </div>
            )}
          </div>
        </div>
      )}

      {/* UNIFIED VIEW TAB */}
      {!loading && tab === "Unified View" && (
        <div>
          {!selectedCase ? (
            <div style={{ padding: "20px 0" }}>
              <div style={{ fontSize: 11, color: P.t3, marginBottom: 14 }}>Select a case file to view its unified evidence summary:</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {cases.map(cf => (
                  <CaseFileCard key={cf.id} cf={cf} linkCount={linkCountMap[cf.case_id] || 0}
                    isSelected={false}
                    onClick={() => setSelectedCase(cf)} />
                ))}
              </div>
            </div>
          ) : (
            <UnifiedCaseView cf={selectedCase} links={caseLinks} onBack={() => setSelectedCase(null)} />
          )}
        </div>
      )}
    </div>
  );
}

function UnifiedCaseView({ cf, links, onBack }) {
  const confirmed = links.filter(l => l.review_state === "Confirmed");
  const contradictions = links.filter(l => l.link_type === "Contradiction");
  const byType = {};
  links.forEach(l => { if (!byType[l.link_type]) byType[l.link_type] = []; byType[l.link_type].push(l); });

  const PRIORITY_COLORS = { Critical: P.red, High: P.amber, Medium: P.blue, Low: P.t4 };
  const pc = PRIORITY_COLORS[cf.priority] || P.t4;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button onClick={onBack} style={{ background: "none", border: `1px solid ${P.b}`, color: P.t3, padding: "5px 14px", borderRadius: 6, cursor: "pointer", fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", alignSelf: "flex-start" }}>
        ← Back to Case List
      </button>

      {/* Case header */}
      <div style={{ border: `1px solid ${pc}40`, borderTop: `4px solid ${pc}`, background: P.card, borderRadius: 12, padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 9, color: P.gold, fontWeight: 800, letterSpacing: "0.2em", marginBottom: 4 }}>UNIFIED CASE FILE · {cf.case_id}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: P.t1 }}>{cf.subject_name}</div>
            {cf.subject_aliases && <div style={{ fontSize: 10, color: P.t4, marginTop: 2 }}>aka: {cf.subject_aliases}</div>}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 9, padding: "4px 10px", background: `${pc}18`, border: `1px solid ${pc}40`, borderRadius: 6, color: pc, fontWeight: 800 }}>{cf.priority}</span>
            <span style={{ fontSize: 9, padding: "4px 10px", background: `${P.teal}15`, border: `1px solid ${P.teal}35`, borderRadius: 6, color: P.teal }}>{cf.status}</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 18 }}>
          {[
            { l: "Service Branch", v: cf.service_branch || "—" },
            { l: "Service Years", v: cf.service_years || "—" },
            { l: "Birth Country", v: cf.birth_country || "—" },
            { l: "USCIS A-File", v: cf.uscis_afile || "Not obtained" },
          ].map(f => (
            <div key={f.l} style={{ padding: "8px 10px", background: "#0B0E14", borderRadius: 6 }}>
              <div style={{ fontSize: 8, color: P.t4, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>{f.l}</div>
              <div style={{ fontSize: 10, color: P.t1, fontWeight: 700 }}>{f.v}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          {cf.dcas_match && <span style={{ fontSize: 9, padding: "3px 10px", background: `${P.blue}15`, border: `1px solid ${P.blue}35`, borderRadius: 5, color: P.blue, fontWeight: 700 }}>✓ DCAS Match</span>}
          {cf.deportation_confirmed && <span style={{ fontSize: 9, padding: "3px 10px", background: `${P.red}15`, border: `1px solid ${P.red}35`, borderRadius: 5, color: P.red, fontWeight: 700 }}>✓ Deportation Confirmed</span>}
        </div>

        {cf.summary && <div style={{ marginTop: 14, fontSize: 10, color: P.t2, lineHeight: 1.7, borderTop: `1px solid ${P.b}`, paddingTop: 12 }}>{cf.summary}</div>}
      </div>

      {/* Evidence summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { v: links.length, l: "Total Links", c: P.gold },
          { v: confirmed.length, l: "Confirmed", c: P.teal },
          { v: contradictions.length, l: "Contradictions", c: P.red },
          { v: Object.keys(byType).length, l: "Link Types", c: P.blue },
        ].map(s => (
          <div key={s.l} style={{ border: `1px solid ${s.c}35`, borderTop: `3px solid ${s.c}`, background: `${s.c}08`, borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 8, color: P.t4, marginTop: 2, textTransform: "uppercase" }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Links grouped by type */}
      {Object.entries(byType).map(([type, typeLinks]) => (
        <div key={type}>
          <div style={{ fontSize: 10, fontWeight: 800, color: P.t3, marginBottom: 10, padding: "6px 12px", background: P.card, borderRadius: 6, display: "inline-block", border: `1px solid ${P.b}` }}>
            {type} ({typeLinks.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {typeLinks.map(l => (
              <EvidenceLinkCard key={l.id} link={l} />
            ))}
          </div>
        </div>
      ))}

      {links.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: P.t4, border: `1px dashed ${P.b}`, borderRadius: 10 }}>
          No evidence links attached to this case yet.
        </div>
      )}

      {cf.analyst_owner && (
        <div style={{ fontSize: 9, color: P.t4, textAlign: "right" }}>Analyst owner: {cf.analyst_owner}</div>
      )}
    </div>
  );
}