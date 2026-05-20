import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";

// ─────────────────────────── CONSTANTS ───────────────────────────
const STATUS_CFG = {
  "Pending":           { color: "#FBBF24", bg: "#451a03", label: "Pending" },
  "A-Number Obtained": { color: "#34D399", bg: "#064e3b", label: "A-No. Obtained" },
  "File Received":     { color: "#60A5FA", bg: "#1e3a5f", label: "File Received" },
  "No Record Found":   { color: "#EF4444", bg: "#450a0a", label: "No Record" },
  "FOIA Submitted":    { color: "#A78BFA", bg: "#2e1065", label: "FOIA Submitted" },
};

const PRIORITY_CFG = {
  "High":   { color: "#EF4444", label: "HIGH" },
  "Medium": { color: "#FBBF24", label: "MED" },
  "Low":    { color: "#6B7280", label: "LOW" },
};

const TIER4_SOURCES = [
  { name: "NARA RG 85 Subject Index (T-458)", type: "Microfilm/Digitized", coverage: "1906–1956", method: "Ancestry.com + NARA", refresh: "Static (historical)", status: "available" },
  { name: "USCIS Genealogy Index", type: "Database", coverage: "1892–present", method: "Email request (cishistory.library@dhs.gov)", refresh: "Manual (4–8 wks)", status: "manual" },
  { name: "NARA A-Files (ARC Database)", type: "Digital catalog", coverage: "1944–present (born >100 yrs)", method: "catalog.archives.gov", refresh: "Weekly", status: "available" },
  { name: "Oxford Research Encyclopedia", type: "Academic", coverage: "19th century–2019", method: "oxfordre.com/americanhistory", refresh: "Annual", status: "available" },
  { name: "Gutiérrez (2019) Citation Network", type: "Bibliography", coverage: "1970–2019", method: "Manual extraction (38 refs)", refresh: "Static", status: "manual" },
];

const ACLU_BREAKDOWN = [
  { priority: "High", count: "5–10", criteria: "Born <1926 (>100 yrs)", method: "USCIS Genealogy Index Search", timeline: "4–8 weeks", color: "#EF4444" },
  { priority: "Medium", count: "20–30", criteria: "Known death dates", method: "USCIS FOIA w/ proof of death", timeline: "6–12 months", color: "#FBBF24" },
  { priority: "Low", count: "20–30", criteria: "Living / unknown status", method: "FOIA + privacy waiver", timeline: "6–18 months", color: "#6B7280" },
];

const VALIDATION_STACK = [
  { num: 1, source: "RAND Corporation BISG Methodology", role: "Peer-reviewed primary method", status: "established", color: "#34D399" },
  { num: 2, source: "Guzmán (1970) Hand-counted Data", role: "3,070 estimate baseline", status: "established", color: "#34D399" },
  { num: 3, source: "LAE Database (3,741 names)", role: "Surname crosswalk validation", status: "established", color: "#34D399" },
  { num: 4, source: "NARA Revised Estimate (~3,070)", role: "Independent institutional confirmation", status: "established", color: "#34D399" },
  { num: 5, source: "Grebler, Moore & Guzmán (1970)", role: "Primary source for Guzmán data — academic pedigree", status: "tier4", color: "#60A5FA" },
  { num: 6, source: "Perlmann (2005) — 'Italians Then, Mexicans Now'", role: "Validates surname-based inference for 2nd-gen immigrants", status: "tier4", color: "#60A5FA" },
  { num: 7, source: "Gutiérrez / Oxford Research Encyclopedia (2019)", role: "Synthesizes 150 yrs of Mexican immigration scholarship", status: "tier4", color: "#60A5FA" },
];

// ─────────────────────────── SUB-COMPONENTS ───────────────────────────
function Badge({ color, bg, children }) {
  return (
    <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{ color, background: bg || `${color}18`, border: `1px solid ${color}44` }}>
      {children}
    </span>
  );
}

function SourceRow({ src }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#111827] p-4">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-white">{src.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{src.type} · {src.coverage}</p>
        </div>
        <Badge color={src.status === "available" ? "#34D399" : "#FBBF24"}>
          {src.status === "available" ? "Available" : "Manual Req."}
        </Badge>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
        <span>Access: <span className="text-gray-300">{src.method}</span></span>
        <span>Refresh: <span className="text-gray-300">{src.refresh}</span></span>
      </div>
    </div>
  );
}

function GenealogyTracker({ requests, onAdd, onRefresh }) {
  const [form, setForm] = useState({ subject_name: "", request_type: "Index Search", request_date: new Date().toISOString().split("T")[0], priority: "Medium", status: "Pending", notes: "" });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!form.subject_name.trim()) return;
    setSaving(true);
    await base44.entities.USCISGenealogyRequest.create(form);
    setSaving(false);
    setShowForm(false);
    setForm({ subject_name: "", request_type: "Index Search", request_date: new Date().toISOString().split("T")[0], priority: "Medium", status: "Pending", notes: "" });
    onRefresh();
  }

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter(r => r.status === "Pending").length,
    obtained: requests.filter(r => r.status === "A-Number Obtained").length,
    received: requests.filter(r => r.status === "File Received").length,
    folding: requests.filter(r => r.white_folding_confirmed).length,
  }), [requests]);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { v: stats.total, l: "Total Requests", c: "#60A5FA" },
          { v: stats.pending, l: "Pending", c: "#FBBF24" },
          { v: stats.obtained, l: "A-No. Obtained", c: "#34D399" },
          { v: stats.received, l: "Files Received", c: "#A78BFA" },
          { v: stats.folding, l: "Folding Confirmed", c: "#EF4444" },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-gray-800 bg-[#111827] p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: s.c }}>{s.v}</p>
            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Add button */}
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500 uppercase tracking-wider">USCIS Genealogy Requests — ACLU 59 Case Prioritization</p>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition">
          + Add Request
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={submit} className="rounded-xl border border-blue-700/40 bg-[#0f1726] p-4 space-y-3">
          <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">New Genealogy Request</p>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { label: "Subject Name", key: "subject_name", type: "text" },
              { label: "Request Date", key: "request_date", type: "date" },
              { label: "Birth Date", key: "birth_date", type: "date" },
              { label: "Death Date", key: "death_date", type: "date" },
              { label: "ACLU Case Ref", key: "aclu_case_ref", type: "text" },
              { label: "A-File Number", key: "a_file_number", type: "text" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-[10px] text-gray-500 uppercase mb-1">{f.label}</label>
                <input type={f.type} value={form[f.key] || ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full rounded bg-[#0B0E14] border border-gray-700 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500" />
              </div>
            ))}
            {[
              { label: "Request Type", key: "request_type", opts: ["Index Search", "A-File Request", "NARA ARC Search", "USCIS FOIA"] },
              { label: "Priority", key: "priority", opts: ["High", "Medium", "Low"] },
              { label: "Status", key: "status", opts: ["Pending", "A-Number Obtained", "File Received", "No Record Found", "FOIA Submitted"] },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-[10px] text-gray-500 uppercase mb-1">{f.label}</label>
                <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full rounded bg-[#0B0E14] border border-gray-700 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500">
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div className="md:col-span-2 flex gap-4">
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                <input type="checkbox" checked={form.dcas_match || false} onChange={e => setForm({ ...form, dcas_match: e.target.checked })}
                  className="accent-blue-500" />
                DCAS Match Found
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                <input type="checkbox" checked={form.white_folding_confirmed || false} onChange={e => setForm({ ...form, white_folding_confirmed: e.target.checked })}
                  className="accent-red-500" />
                White Folding Confirmed
              </label>
            </div>
          </div>
          <textarea placeholder="Research notes..." value={form.notes || ""} onChange={e => setForm({ ...form, notes: e.target.value })}
            className="w-full rounded bg-[#0B0E14] border border-gray-700 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 min-h-[80px]" />
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50">
              {saving ? "Saving..." : "Save Request"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-lg border border-gray-700 px-5 py-2 text-sm text-gray-400 hover:text-white">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Request list */}
      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
        {requests.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">No requests yet. Add the first USCIS Genealogy request above.</div>
        ) : requests.map(r => {
          const scfg = STATUS_CFG[r.status] || STATUS_CFG["Pending"];
          const pcfg = PRIORITY_CFG[r.priority] || PRIORITY_CFG["Medium"];
          return (
            <div key={r.id} className="rounded-xl border border-gray-800 bg-[#111827] p-4">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-white">{r.subject_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.request_type} · Submitted {r.request_date}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge color={pcfg.color}>{pcfg.label}</Badge>
                  <Badge color={scfg.color} bg={scfg.bg}>{scfg.label}</Badge>
                  {r.dcas_match && <Badge color="#60A5FA">DCAS Match</Badge>}
                  {r.white_folding_confirmed && <Badge color="#EF4444">Folding ✓</Badge>}
                </div>
              </div>
              {r.a_file_number && (
                <p className="text-xs text-green-300 mt-2">A-File: {r.a_file_number}</p>
              )}
              {r.aclu_case_ref && (
                <p className="text-xs text-gray-500 mt-1">ACLU ref: {r.aclu_case_ref}</p>
              )}
              {r.notes && <p className="text-xs text-gray-400 mt-2 italic">{r.notes}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CitationsLibrary({ citations, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({ citation_type: "Book", authors: "", title: "", publication: "", year: new Date().getFullYear(), doi: "", source_url: "", relevance_to_project: "", validation_role: "BISG Methodology", tier: "Secondary Source", tags: "" });
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.authors.trim()) return;
    setSaving(true);
    await base44.entities.AcademicCitation.create({ ...form, year: Number(form.year) });
    setSaving(false);
    setShowForm(false);
    onRefresh();
  }

  const roles = ["All", "BISG Methodology", "DCAS Anomaly Context", "Deportation Framework", "Policy Engagement", "Historical Context", "Oxford Network"];
  const filtered = citations.filter(c => filter === "All" || c.validation_role === filter);

  const ROLE_COLORS = {
    "BISG Methodology": "#34D399",
    "DCAS Anomaly Context": "#60A5FA",
    "Deportation Framework": "#EF4444",
    "Policy Engagement": "#A78BFA",
    "Historical Context": "#FBBF24",
    "Oxford Network": "#38BDF8",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {roles.map(r => (
            <button key={r} onClick={() => setFilter(r)}
              className="rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition"
              style={{
                borderColor: filter === r ? (ROLE_COLORS[r] || "#60A5FA") : "#374151",
                color: filter === r ? (ROLE_COLORS[r] || "#60A5FA") : "#6B7280",
                background: filter === r ? `${ROLE_COLORS[r] || "#60A5FA"}15` : "transparent",
              }}>
              {r}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition">
          + Add Citation
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="rounded-xl border border-blue-700/40 bg-[#0f1726] p-4 space-y-3">
          <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">New Academic Citation</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-[10px] text-gray-500 uppercase mb-1">Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full rounded bg-[#0B0E14] border border-gray-700 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase mb-1">Authors</label>
              <input value={form.authors} onChange={e => setForm({ ...form, authors: e.target.value })}
                className="w-full rounded bg-[#0B0E14] border border-gray-700 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase mb-1">Year</label>
              <input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}
                className="w-full rounded bg-[#0B0E14] border border-gray-700 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase mb-1">Publication</label>
              <input value={form.publication} onChange={e => setForm({ ...form, publication: e.target.value })}
                className="w-full rounded bg-[#0B0E14] border border-gray-700 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase mb-1">DOI</label>
              <input value={form.doi} onChange={e => setForm({ ...form, doi: e.target.value })}
                className="w-full rounded bg-[#0B0E14] border border-gray-700 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500" />
            </div>
            {[
              { label: "Citation Type", key: "citation_type", opts: ["Book", "Journal Article", "Report", "Encyclopedia", "Government Report", "Thesis"] },
              { label: "Validation Role", key: "validation_role", opts: ["BISG Methodology", "DCAS Anomaly Context", "Deportation Framework", "Policy Engagement", "Historical Context", "Oxford Network"] },
              { label: "Tier", key: "tier", opts: ["Primary Source", "Secondary Source", "Academic Context", "Government Record"] },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-[10px] text-gray-500 uppercase mb-1">{f.label}</label>
                <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full rounded bg-[#0B0E14] border border-gray-700 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500">
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-[10px] text-gray-500 uppercase mb-1">Relevance to Project</label>
              <textarea value={form.relevance_to_project} onChange={e => setForm({ ...form, relevance_to_project: e.target.value })}
                className="w-full rounded bg-[#0B0E14] border border-gray-700 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 min-h-[70px]" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50">
              {saving ? "Saving..." : "Save Citation"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-lg border border-gray-700 px-5 py-2 text-sm text-gray-400 hover:text-white">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">No citations for this filter. Add citations from the documents above.</div>
        ) : filtered.map(c => {
          const rc = ROLE_COLORS[c.validation_role] || "#6B7280";
          return (
            <div key={c.id} className="rounded-xl border border-gray-800 bg-[#111827] p-4">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white leading-5">{c.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.authors} · {c.year}{c.publication ? ` · ${c.publication}` : ""}</p>
                </div>
                <div className="flex gap-1.5 flex-wrap shrink-0">
                  {c.validation_role && <Badge color={rc}>{c.validation_role}</Badge>}
                  {c.tier && <Badge color="#6B7280">{c.tier}</Badge>}
                </div>
              </div>
              {c.relevance_to_project && (
                <p className="text-xs text-gray-400 mt-2 leading-5 italic">{c.relevance_to_project}</p>
              )}
              {c.doi && (
                <a href={`https://doi.org/${c.doi}`} target="_blank" rel="noreferrer"
                  className="text-[10px] text-blue-400 hover:text-blue-300 mt-1 block">
                  DOI: {c.doi}
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────── MAIN COMPONENT ───────────────────────────
export default function Tier4Archives() {
  const [tab, setTab] = useState("overview");
  const [requests, setRequests] = useState([]);
  const [citations, setCitations] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const [reqs, cites] = await Promise.all([
      base44.entities.USCISGenealogyRequest.list("-request_date", 200),
      base44.entities.AcademicCitation.list("-year", 200),
    ]);
    setRequests(reqs);
    setCitations(cites);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  const TABS = [
    { id: "overview", label: "Tier 4 Overview" },
    { id: "genealogy", label: `USCIS Requests (${requests.length})` },
    { id: "validation", label: "Validation Stack" },
    { id: "citations", label: `Academic Citations (${citations.length})` },
    { id: "workflow", label: "A-File Workflow" },
  ];

  return (
    <div className="min-h-screen bg-[#0B0E14] text-gray-200 p-6" style={{ fontFamily: "'Arial', 'Helvetica Neue', sans-serif" }}>
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-400 font-semibold">Strategic Integration Analysis · Feb 17, 2026</p>
        <h2 className="mt-1 text-2xl font-bold text-white">TIER 4: Historical Archives & Academic Validation</h2>
        <p className="mt-1 text-sm text-gray-400">
          NARA RG 85 · USCIS A-Files · Oxford Research Encyclopedia · Gutiérrez (2019) · ACLU 59 Case Validation Pathway
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5">
          <span className="text-green-400 text-sm font-bold">Platform 9.0/10 Maturity</span>
          <span className="text-gray-500 text-xs">+0.5 for TIER 4 integration · 23 total sources</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="rounded-lg border px-4 py-2 text-xs font-semibold transition"
            style={{
              borderColor: tab === t.id ? "#3B82F6" : "#374151",
              color: tab === t.id ? "#60A5FA" : "#6B7280",
              background: tab === t.id ? "#1e3a5f" : "transparent",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && tab !== "overview" && tab !== "validation" && tab !== "workflow" ? (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
          Loading archive data...
        </div>
      ) : (
        <>
          {/* OVERVIEW */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-800 bg-[#0f1420] p-5">
                  <p className="text-xs uppercase tracking-[0.14em] text-blue-300 font-semibold mb-3">TIER 4 Sources (5 New)</p>
                  <div className="space-y-3">
                    {TIER4_SOURCES.map(s => <SourceRow key={s.name} src={s} />)}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-gray-800 bg-[#0f1420] p-5">
                    <p className="text-xs uppercase tracking-[0.14em] text-blue-300 font-semibold mb-3">ACLU 59 Case Prioritization</p>
                    <div className="space-y-3">
                      {ACLU_BREAKDOWN.map(a => (
                        <div key={a.priority} className="rounded-lg border border-gray-800 bg-[#111827] p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold" style={{ color: a.color }}>{a.priority} Priority</span>
                            <span className="text-lg font-bold text-white">{a.count} cases</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{a.criteria}</p>
                          <p className="text-xs text-gray-500 mt-1">Method: {a.method} · {a.timeline}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-600 mt-3">Expected yield: 30–50% A-File success rate · Contact: cishistory.library@dhs.gov</p>
                  </div>

                  <div className="rounded-xl border border-amber-700/30 bg-amber-900/10 p-5">
                    <p className="text-xs uppercase tracking-[0.14em] text-amber-300 font-semibold mb-2">Immediate Actions</p>
                    <ul className="space-y-1.5 text-xs text-gray-300">
                      {[
                        "Add TIER 4 DB schema (uscis_genealogy_requests, nara_rg85_subject_index, academic_citations)",
                        "Obtain Ancestry.com subscription (World Explorer $25/mo) for Subject Index 1906–1956",
                        "Extract Oxford citation network (38 refs from Gutiérrez 2019)",
                        "Prioritize ACLU cases: filter service_years - 18 ≤ 1926",
                        "Submit USCIS Genealogy Index Search Batch 1 (5–10 high-priority cases)",
                        "Add NARA ARC weekly crawler (Monday 7 AM Airflow DAG)",
                      ].map((a, i) => (
                        <li key={i} className="flex gap-2"><span className="text-blue-400 shrink-0">→</span>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GENEALOGY TRACKER */}
          {tab === "genealogy" && (
            <GenealogyTracker requests={requests} onRefresh={loadData} />
          )}

          {/* VALIDATION STACK */}
          {tab === "validation" && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-gray-800 bg-[#0f1420] p-5">
                  <p className="text-xs uppercase tracking-[0.14em] text-blue-300 font-semibold mb-3">7-Source Academic Validation Network</p>
                  <div className="space-y-2">
                    {VALIDATION_STACK.map(v => (
                      <div key={v.num} className="rounded-lg border border-gray-800 bg-[#111827] p-3 flex gap-3 items-start">
                        <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: `${v.color}20`, color: v.color, border: `1px solid ${v.color}44` }}>
                          {v.num}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{v.source}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{v.role}</p>
                          {v.status === "tier4" && <Badge color="#60A5FA">TIER 4 NEW</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-lg border border-green-700/30 bg-green-900/10 p-3">
                    <p className="text-xs text-green-300 font-semibold">Before → After</p>
                    <p className="text-xs text-gray-400 mt-1">BISG + Guzmán + LAE = 3 sources</p>
                    <p className="text-xs text-green-300 mt-1">+ Grebler/Moore + Perlmann + Gutiérrez/Oxford = <strong>5-source network</strong></p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-gray-800 bg-[#0f1420] p-5">
                    <p className="text-xs uppercase tracking-[0.14em] text-red-300 font-semibold mb-3">OMB Classification Anomaly — 3 Phases</p>
                    {[
                      { phase: "Phase 1: Pre-1977", color: "#EF4444", text: "No 'Hispanic' category in DoD — all Latinos coded as 'White'. Binary White/Non-White or White/Negro/Other schemes used 1964–1973." },
                      { phase: "Phase 2: 1977–1997", color: "#FBBF24", text: "OMB SPD-15 establishes Hispanic origin as separate question. Vietnam-era records predate this system by 3–13 years." },
                      { phase: "Phase 3: 1997 Retroactive", color: "#60A5FA", text: "NARA applies retroactive algorithm → produces 349 'Hispanic One Race' count. Flaw: algorithm assumes Vietnam-era records had Hispanic identifier — they did not." },
                    ].map(p => (
                      <div key={p.phase} className="rounded-lg border border-gray-800 bg-[#111827] p-3 mb-2">
                        <p className="text-xs font-bold" style={{ color: p.color }}>{p.phase}</p>
                        <p className="text-xs text-gray-400 mt-1 leading-5">{p.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-gray-800 bg-[#0f1420] p-5">
                    <p className="text-xs uppercase tracking-[0.14em] text-purple-300 font-semibold mb-3">50-Year Undercounting Pattern</p>
                    <div className="space-y-2">
                      <div className="rounded-lg border border-gray-800 bg-[#111827] p-3">
                        <p className="text-xs font-semibold text-yellow-300">1964–1973 Vietnam Era</p>
                        <p className="text-xs text-gray-400 mt-1">DoD undercounts Latino casualties by 9–13x (349 vs. 3,070–3,800)</p>
                      </div>
                      <div className="rounded-lg border border-gray-800 bg-[#111827] p-3">
                        <p className="text-xs font-semibold text-red-300">2013–2025 Deportation Era</p>
                        <p className="text-xs text-gray-400 mt-1">DHS undercounts deported veterans by 4–20x (92 vs. 400–2,000 estimated)</p>
                      </div>
                      <div className="rounded-lg border border-blue-700/30 bg-blue-900/10 p-3">
                        <p className="text-xs font-semibold text-blue-300">Common Mechanism</p>
                        <p className="text-xs text-gray-400 mt-1">Both cases: inadequate classification systems failing to capture the target population.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CITATIONS */}
          {tab === "citations" && (
            <CitationsLibrary citations={citations} onRefresh={loadData} />
          )}

          {/* A-FILE WORKFLOW */}
          {tab === "workflow" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-800 bg-[#0f1420] p-5">
                  <p className="text-xs uppercase tracking-[0.14em] text-blue-300 font-semibold mb-3">A-File Access Decision Tree</p>
                  <div className="space-y-3 font-mono text-xs text-gray-300">
                    {[
                      { step: "Step 1: Obtain A-File Number", lines: ["Subject born >100 yrs → USCIS Genealogy Index Search", "Subject born <100 yrs + proof of death → USCIS FOIA", "Active since 1975 + born >100 yrs → NARA ARC Database"] },
                      { step: "Step 2: Request A-File", lines: ["A-No. <8M + docs ≤1951 → USCIS Genealogy Program (4–8 wks)", "A-No. >8M OR docs >1951 → USCIS FOIA (6–12 months)", "NARA holdings → Direct NARA request (immediate)"] },
                      { step: "Step 5: Validate Against DCAS", lines: ["Cross-ref A-File biographical data vs. DCAS 58,220 records", "If coded WHITE but A-File shows Mexican/Latino origin → confirms 'folding'", "Calculate validation rate (% confirming BISG estimates)"] },
                    ].map(s => (
                      <div key={s.step} className="rounded-lg border border-gray-800 bg-[#111827] p-3">
                        <p className="text-blue-300 font-bold mb-2">{s.step}</p>
                        {s.lines.map((l, i) => (
                          <p key={i} className="text-gray-400 leading-5">├─ {l}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-gray-800 bg-[#0f1420] p-5">
                    <p className="text-xs uppercase tracking-[0.14em] text-amber-300 font-semibold mb-3">A-File Type Access Tiers</p>
                    <div className="space-y-2">
                      {[
                        { type: "A-Files <8M + docs ≤May 1, 1951", avail: "USCIS Genealogy Program", method: "Index Search (born >100 yrs OR proof of death)", time: "4–8 wks" },
                        { type: "A-Files >8M OR docs >May 1, 1951", avail: "USCIS FOIA Program", method: "FOIA request", time: "6–12 mo" },
                        { type: "Born >100 yrs + active since 1975", avail: "NARA ARC Database", method: "Online catalog search by name/A-Number", time: "Immediate" },
                      ].map(a => (
                        <div key={a.type} className="rounded-lg border border-gray-800 bg-[#111827] p-3">
                          <p className="text-xs font-semibold text-white">{a.type}</p>
                          <p className="text-xs text-blue-300 mt-1">{a.avail}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{a.method} · <span className="text-green-400">{a.time}</span></p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-800 bg-[#0f1420] p-5">
                    <p className="text-xs uppercase tracking-[0.14em] text-red-300 font-semibold mb-3">Risk Assessment</p>
                    <div className="space-y-2">
                      {[
                        { risk: "USCIS Genealogy Request Delays", prob: "HIGH 70%", impact: "MEDIUM", color: "#EF4444" },
                        { risk: "Low A-File Success Rate", prob: "MEDIUM 50%", impact: "MEDIUM", color: "#FBBF24" },
                        { risk: "NARA RG 85 Record Destruction", prob: "HIGH 70%", impact: "LOW", color: "#FBBF24" },
                        { risk: "Policy Brief Rejection", prob: "MEDIUM 40%", impact: "HIGH", color: "#EF4444" },
                      ].map(r => (
                        <div key={r.risk} className="flex items-center justify-between rounded-lg border border-gray-800 bg-[#111827] px-3 py-2">
                          <p className="text-xs text-gray-300">{r.risk}</p>
                          <div className="flex gap-2 shrink-0">
                            <Badge color={r.color}>{r.prob}</Badge>
                            <Badge color="#6B7280">{r.impact}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-800 bg-[#0f1420] p-5">
                    <p className="text-xs uppercase tracking-[0.14em] text-green-300 font-semibold mb-2">Key Contacts</p>
                    <div className="space-y-1 text-xs text-gray-400">
                      <p>USCIS History Office: <span className="text-blue-300">cishistory.library@dhs.gov</span></p>
                      <p>GAO HS Team: <span className="text-blue-300">gamblerr@gao.gov</span></p>
                      <p>CRS Author: <span className="text-blue-300">hstraut-eppsteiner@crs.loc.gov</span></p>
                      <p>CHC: <span className="text-blue-300">congressional.hispanic.caucus@mail.house.gov</span></p>
                      <p>NARA ARC: <span className="text-blue-300">catalog.archives.gov</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}