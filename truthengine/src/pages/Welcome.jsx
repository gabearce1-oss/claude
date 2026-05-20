import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const LINKS = {
  blog: "/blog",
  research: "https://www.albavoice.org/research-and-publications/",
  policy: "https://www.albavoice.org/public-policy-and-lobbying-program-framework/",
  albavoice: "https://www.albavoice.org/",
};

const SITE = {
  name: "TruthEngine360",
  shortName: "TE360",
  eyebrow: "FOR OFFICIAL USE · RESTRICTED ANALYTICAL PLATFORM",
  missionTag: "Fair Case Vault · AUMER research extension",
  heroTitle: "Forensic civic intelligence infrastructure for cases that disappear in plain sight.",
  heroBody:
    "TruthEngine360 is the public briefing layer for the Fair Case Vault — an auth-gated environment built to organize records, surface discrepancies, and support research, data science, social reform, and policy advocacy.",
  heroNote:
    "Public visitors can review methodology, mission, and teaser metrics. Full evidence views, source logs, and case workspaces require approved access.",
  authorityName: "AUMER / Alba Union for Migrant and Elder Rights",
  authoritySubline:
    "TruthEngine360 operates as a research-facing extension of AUMER and AlbaVoice.org.",
  authorityEIN: "99-0495658",
  contactEmails: ["info@qtruthengine360.org", "info@albavoice.org"],
  founderName: "Gabriel T. Arce, Jr.",
  founderRole: "Founder and Board Director",
  founderExcerpt:
    "Built in honor of Alba's example of service, resilience, and care for people the record often fails to protect.",
  accessCopy:
    "Access is reviewed for researchers, legal advocates, journalists, policy partners, and authorized collaborators.",
  newsletterTitle: "Get research briefings and release notes",
  newsletterBody:
    "Monthly updates on evidence releases, case-method notes, policy briefs, and platform milestones.",
};

const METRICS = [
  { id: "ice_records", value: "713,464", label: "Records normalized", note: "Public teaser · replace with audited live output" },
  { id: "deportation_review", value: "202,864", label: "Crosswalk review candidates", note: "Public-facing estimate for briefing mode" },
  { id: "vietnam_intersections", value: "~500", label: "Historical case intersections", note: "Estimated count · publish methodology with final number" },
  { id: "variance_gap", value: "99.2%", label: "Discrepancy threshold", note: "Teaser KPI only · show method note beside final chart" },
];

const GRAPH_SERIES = [
  { label: "Jan", value: 24 }, { label: "Feb", value: 31 }, { label: "Mar", value: 43 },
  { label: "Apr", value: 40 }, { label: "May", value: 58 }, { label: "Jun", value: 73 },
  { label: "Jul", value: 81 },
];

const TABS = [
  {
    id: "analytics", name: "Case analytics",
    title: "Variance, clustering, and reconciliation",
    body: "Preview the public framing of the analytical system without exposing the underlying records.",
    cards: [
      { title: "Discrepancy model", body: "Cross-source variance flags, estimated case density, and entity overlap scoring.", route: "/platform?panel=analytics" },
      { title: "Timeline clustering", body: "Quarterly change signals, period gaps, and record-age distribution snapshots.", route: "/platform?panel=timeline" },
      { title: "Geographic intersection review", body: "Jurisdiction tags, border-state flows, and region-by-region anomaly mapping.", route: "/platform?panel=map" },
    ],
  },
  {
    id: "vault", name: "Evidence vault",
    title: "Controlled document and case storage",
    body: "The public page should hint at rigor without exposing the archive.",
    cards: [
      { title: "Chain-of-custody tags", body: "Record class, confidence flag, source lineage, and review status.", route: "/platform?panel=vault" },
      { title: "Case packets", body: "Working briefs, supporting exhibits, chronology notes, and evidence summaries.", route: "/platform?panel=packets" },
      { title: "Research memos", body: "Draft findings, source disputes, method updates, and review annotations.", route: "/platform?panel=memos" },
    ],
  },
  {
    id: "sources", name: "Data sources",
    title: "Source transparency without source exposure",
    body: "Show the categories of evidence, not the whole warehouse.",
    cards: [
      { title: "Government datasets", body: "Agency tables, public files, obtained records, and indexed metadata.", route: "/platform?panel=sources" },
      { title: "Narrative evidence", body: "Testimony, correspondence, memorial record, and contextual case notes.", route: "/platform?panel=narrative" },
      { title: "Research imports", body: "Structured extracts, reconciled spreadsheets, and versioned analysis inputs.", route: "/platform?panel=imports" },
    ],
  },
  {
    id: "legal", name: "Legal framework",
    title: "Policy, rights, and accountability framing",
    body: "Visitors should understand the why behind the system before requesting access.",
    cards: [
      { title: "Public policy watch", body: "Rules, reforms, oversight actions, and active legislative context.", route: "/platform?panel=policy" },
      { title: "Rights framework", body: "Civic, migrant, elder-rights, and due-process framing for case interpretation.", route: "/platform?panel=rights" },
      { title: "Publication queue", body: "Upcoming briefs, stakeholder memos, and public briefing releases.", route: "/platform?panel=publications" },
    ],
  },
];

const SOCIALS = [
  { label: "Facebook", href: "#", disabled: true },
  { label: "Instagram", href: "#", disabled: true },
  { label: "YouTube", href: "#", disabled: true },
  { label: "TikTok", href: "#", disabled: true },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/gabearce", disabled: false },
];

const btn1 = "inline-flex items-center justify-center rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400";
const btn2 = "inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400";
const inputCls = "w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20";

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function mailTo({ to, subject, lines }) {
  window.location.href = `mailto:${to.join(",")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}

function KpiCard({ value, label, note }) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/30 backdrop-blur-sm p-6 hover:border-sky-400/40 hover:bg-slate-800/50 transition-all duration-300">
      <div className="text-4xl font-bold tracking-tight text-sky-300" style={{ letterSpacing: '-0.01em' }}>{value}</div>
      <div className="mt-3 text-sm font-semibold text-slate-100">{label}</div>
      <div className="mt-2 text-xs leading-5 text-slate-500">{note}</div>
    </div>
  );
}

function LockedPanel({ title, body, onUnlock, children }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900/70 p-5">
      <div className="blur-sm opacity-60 pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/50 backdrop-blur-sm px-6 text-center">
        <div className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300">
          Restricted dataset
        </div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="max-w-md text-sm leading-6 text-slate-300">{body}</p>
        <button className={btn1} onClick={onUnlock}>Sign in to view full analysis</button>
      </div>
    </div>
  );
}

function GraphTeaser({ series }) {
  const w = 640, h = 240, pad = 28;
  const max = Math.max(...series.map(d => d.value), 1);
  const stepX = (w - pad * 2) / (series.length - 1);
  const pts = series.map((d, i) => ({ ...d, x: pad + i * stepX, y: h - pad - (d.value / max) * (h - pad * 2) }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${pts[pts.length - 1].x} ${h - pad} L ${pts[0].x} ${h - pad} Z`;

  return (
    <div className="rounded-[24px] border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Signal preview</div>
          <div className="mt-1 text-sm font-medium text-slate-100">Discrepancy pressure over time</div>
        </div>
        <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] font-medium text-amber-300">teaser only</div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-[220px] w-full">
        <defs>
          <linearGradient id="te360g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(79,163,255,0.55)" />
            <stop offset="100%" stopColor="rgba(79,163,255,0.02)" />
          </linearGradient>
        </defs>
        {[0,1,2,3].map(i => {
          const y = pad + i * ((h - pad * 2) / 3);
          return <line key={i} x1={pad} x2={w - pad} y1={y} y2={y} stroke="rgba(148,163,184,0.18)" strokeDasharray="4 6" />;
        })}
        <path d={area} fill="url(#te360g)" />
        <path d={line} fill="none" stroke="rgba(79,163,255,0.95)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map(p => (
          <g key={p.label}>
            <circle cx={p.x} cy={p.y} r="4" fill="rgba(79,163,255,1)" />
            <text x={p.x} y={h - 8} textAnchor="middle" fill="rgba(203,213,225,0.9)" fontSize="12">{p.label}</text>
          </g>
        ))}
      </svg>
      <p className="mt-2 text-xs leading-5 text-slate-400">Public charts are intentionally limited. Detailed analysis requires authenticated access.</p>
    </div>
  );
}

function NewsletterBlock() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function submit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    mailTo({ to: SITE.contactEmails, subject: `${SITE.name} newsletter signup`, lines: ["Hello team,", "", `Please add to the ${SITE.name} newsletter list:`, email.trim()] });
    setSent(true);
    setEmail("");
  }

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/30 backdrop-blur-sm p-8">
      <div className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold">Newsletter</div>
      <h3 className="mt-4 text-2xl font-bold tracking-tight text-white" style={{ letterSpacing: '-0.01em' }}>{SITE.newsletterTitle}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{SITE.newsletterBody}</p>
      <form className="mt-6 space-y-3" onSubmit={submit}>
        <input type="email" className={inputCls} placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} aria-label="Newsletter email" />
        <button type="submit" className={btn1}>Subscribe</button>
      </form>
      {sent && <p className="mt-3 text-sm text-emerald-300">Draft opened. If nothing appeared, use {SITE.contactEmails.join(", ")} manually.</p>}
    </div>
  );
}

export default function Welcome() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [form, setForm] = useState({ name: "", org: "", role: "", email: "", useCase: "" });
  const [reqSent, setReqSent] = useState(false);

  const preview = useMemo(() => TABS.find(t => t.id === activeTab) || TABS[0], [activeTab]);

  useEffect(() => {
    let alive = true;
    base44.auth.isAuthenticated().then(ok => { if (alive) { setAuthed(Boolean(ok)); setAuthReady(true); } }).catch(() => { if (alive) setAuthReady(true); });
    return () => { alive = false; };
  }, []);

  function goLogin() {
    try { base44.auth.redirectToLogin(window.location.href); } catch { navigate("/login"); }
  }

  function goAuth(route) {
    if (authed) navigate(route); else goLogin();
  }

  function submitRequest(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    mailTo({
      to: SITE.contactEmails,
      subject: `Request access to ${SITE.name} — ${form.name.trim()}`,
      lines: ["Hello TruthEngine360 team,", "", "I would like to request platform access.", "", `Name: ${form.name}`, `Organization: ${form.org || "Not provided"}`, `Role: ${form.role || "Not provided"}`, `Email: ${form.email}`, `Use case: ${form.useCase || "Not provided"}`],
    });
    setReqSent(true);
    setForm({ name: "", org: "", role: "", email: "", useCase: "" });
  }

  return (
    <div className="min-h-screen bg-[#0B0F14] text-slate-100" style={{ backgroundImage: "radial-gradient(circle at top right, rgba(79,163,255,0.12), transparent 35%), radial-gradient(circle at 18% 10%, rgba(245,185,66,0.06), transparent 22%), radial-gradient(circle at 80% 80%, rgba(16,185,129,0.04), transparent 40%)", fontFamily: "'Arial', 'Helvetica Neue', sans-serif" }}>
      {/* NAV */}
      <header className="sticky top-0 z-30 border-b border-slate-800/60 bg-[#0B0F14]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 lg:px-8">
          <div className="min-w-0">
            <div className="text-[9px] uppercase tracking-[0.3em] text-slate-500 font-semibold">{SITE.eyebrow}</div>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <div className="text-2xl font-bold tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>{SITE.name}</div>
              <div className="rounded-full border border-sky-400/25 bg-sky-400/8 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-sky-200">{SITE.missionTag}</div>
            </div>
          </div>
          <nav className="hidden items-center gap-6 lg:flex">
            {[["mission","Mission"],["methods","Methods"],["authority","Authority"]].map(([id,label]) => (
              <button key={id} className="text-sm font-medium text-slate-400 hover:text-sky-300 transition" onClick={() => scrollTo(id)}>{label}</button>
            ))}
            <a className="text-sm font-medium text-slate-400 hover:text-sky-300 transition" href={LINKS.blog}>Blog</a>
          </nav>
          <div className="flex items-center gap-2">
            <button className={btn2} onClick={() => scrollTo("access")}>Request access</button>
            <button className={btn1} onClick={authed ? () => navigate("/platform") : goLogin}>
              {authReady && authed ? "Open platform" : "Sign in"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        {/* HERO */}
        <section id="mission" className="grid gap-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-center py-8">
          <div>
            <div className="inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-xs font-semibold text-sky-200 uppercase tracking-wider">
              Research, evidence, and policy reform
            </div>
            <h1 className="mt-8 max-w-4xl text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl" style={{ letterSpacing: '-0.02em' }}>{SITE.heroTitle}</h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-200">{SITE.heroBody}</p>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">{SITE.heroNote}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <button className={btn1} onClick={authed ? () => navigate("/platform") : goLogin}>
                {authReady && authed ? "Open platform" : "Sign in to platform"}
              </button>
              <button className={btn2} onClick={() => scrollTo("access")}>Request access</button>
              <a className={btn2} href={LINKS.blog}>Blog</a>
              <a className={btn2} href={LINKS.albavoice} target="_blank" rel="noreferrer">AlbaVoice.org</a>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {METRICS.map(m => <KpiCard key={m.id} {...m} />)}
            </div>
            <p className="mt-6 text-xs leading-5 text-slate-500">Public teaser figures are intentionally limited. Detailed evidence sits behind authenticated pages only.</p>
          </div>
          <LockedPanel title="Locked analytical preview" body="Show the existence of signal, trend, and method — not the full dashboard." onUnlock={authed ? () => navigate("/platform") : goLogin}>
            <GraphTeaser series={GRAPH_SERIES} />
          </LockedPanel>
        </section>

        {/* TABS */}
        <section id="methods" className="mt-24">
          <div className="max-w-3xl mb-12">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold">Analytical framework</div>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>Explore methodology without exposing the vault.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">Each tab previews one analytical lane. Authenticated users access full case data and source logs.</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`rounded-lg border px-5 py-2.5 text-sm font-semibold transition ${activeTab === t.id ? "border-sky-400/50 bg-sky-400/15 text-sky-200 shadow-lg shadow-sky-400/10" : "border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-300 hover:bg-slate-900/40"}`}>
                {t.name}
              </button>
            ))}
          </div>
          <div className="mt-6">
            <LockedPanel title={preview.title} body={preview.body} onUnlock={authed ? () => navigate("/platform") : goLogin}>
              <div className="grid gap-4 md:grid-cols-3">
                {preview.cards.map(card => (
                  <button key={card.title} onClick={() => goAuth(card.route)}
                    className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-5 text-left transition hover:border-slate-600 hover:bg-slate-900">
                    <div className="inline-flex rounded-full bg-slate-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">Restricted</div>
                    <h3 className="mt-4 text-lg font-semibold text-white">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{card.body}</p>
                  </button>
                ))}
              </div>
            </LockedPanel>
          </div>
        </section>

        {/* AUTHORITY */}
        <section id="authority" className="mt-24 grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/30 backdrop-blur-sm p-8">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold">Authority</div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white" style={{ letterSpacing: '-0.01em' }}>{SITE.authorityName}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{SITE.authoritySubline}</p>
            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Credential</div>
                <div className="mt-2 text-base font-medium text-slate-100">EIN {SITE.authorityEIN}</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Research references</div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <a className="text-sm text-sky-300 hover:text-sky-200" href={LINKS.research} target="_blank" rel="noreferrer">Research & publications</a>
                  <a className="text-sm text-sky-300 hover:text-sky-200" href={LINKS.policy} target="_blank" rel="noreferrer">Public policy</a>
                  <a className="text-sm text-sky-300 hover:text-sky-200" href={LINKS.blog}>Blog</a>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Contact</div>
                <div className="mt-2 text-sm leading-7 text-slate-200">{SITE.contactEmails.map(e => <div key={e}>{e}</div>)}</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/30 backdrop-blur-sm p-8">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold">Founder letter</div>
            <h3 className="mt-4 text-2xl font-bold tracking-tight text-white" style={{ letterSpacing: '-0.01em' }}>Compact memorial. Full authority.</h3>
            <p className="mt-4 text-sm leading-7 text-slate-400">Built to honor a legacy of service and care.</p>
            <blockquote className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-400/5 p-5 text-base leading-8 text-slate-100">
              {SITE.founderExcerpt}
            </blockquote>
            <div className="mt-5 text-sm text-slate-400">{SITE.founderName} · {SITE.founderRole}</div>
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Full founder letter</div>
              <a className="mt-2 block text-sm text-sky-300 hover:text-sky-200" href={LINKS.blog}>Read on the blog →</a>
            </div>
          </div>
        </section>

        {/* ACCESS */}
        <section id="access" className="mt-24 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/30 backdrop-blur-sm p-8">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold">Request access</div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white" style={{ letterSpacing: '-0.01em' }}>Restricted access, clear pathway.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">{SITE.accessCopy}</p>
            <form className="mt-6 grid gap-3 md:grid-cols-2" onSubmit={submitRequest}>
              <input className={inputCls} placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className={inputCls} placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <input className={inputCls} placeholder="Organization" value={form.org} onChange={e => setForm({ ...form, org: e.target.value })} />
              <input className={inputCls} placeholder="Role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
              <textarea className={`${inputCls} md:col-span-2 min-h-[120px] resize-y`} placeholder="Describe your intended use, research need, or collaboration request." value={form.useCase} onChange={e => setForm({ ...form, useCase: e.target.value })} />
              <div className="md:col-span-2 flex flex-wrap gap-3">
                <button type="submit" className={btn1}>Email request</button>
                <button type="button" className={btn2} onClick={authed ? () => navigate("/platform") : goLogin}>
                  {authReady && authed ? "Open platform" : "Sign in instead"}
                </button>
              </div>
            </form>
            {reqSent && <p className="mt-3 text-sm text-emerald-300">Draft opened. If no mail client appeared, send manually to {SITE.contactEmails.join(", ")}.</p>}
          </div>
          <NewsletterBlock />
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/60 bg-slate-950/60 mt-24 pt-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-10 lg:grid-cols-[1.2fr,0.8fr] lg:px-8">
          <div>
            <div className="text-xl font-bold tracking-tight text-white">{SITE.name}</div>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">Public briefing layer for a restricted analytical environment under the AUMER / AlbaVoice research umbrella.</p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm">
              <a className="text-slate-300 hover:text-white" href={LINKS.blog}>Blog</a>
              <a className="text-slate-300 hover:text-white" href={LINKS.research} target="_blank" rel="noreferrer">Research</a>
              <a className="text-slate-300 hover:text-white" href={LINKS.policy} target="_blank" rel="noreferrer">Public policy</a>
              <a className="text-slate-300 hover:text-white" href={LINKS.albavoice} target="_blank" rel="noreferrer">AlbaVoice.org</a>
            </div>
            <div className="mt-6 text-sm leading-7 text-slate-400">
              <div>{SITE.authorityName}</div>
              <div>EIN {SITE.authorityEIN}</div>
              {SITE.contactEmails.map(e => <div key={e}>{e}</div>)}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Social and contact</div>
            <div className="mt-4 flex flex-wrap gap-3">
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href}
                  onClick={e => { if (s.disabled) e.preventDefault(); }}
                  target={s.disabled ? "_self" : "_blank"} rel="noreferrer"
                  className={`rounded-full border px-3 py-2 text-xs font-medium transition ${s.disabled ? "cursor-not-allowed border-slate-800 text-slate-500" : "border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-800"}`}>
                  {s.label}{s.disabled ? " · add URL" : ""}
                </a>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-500">
              <a href="/privacy" className="hover:text-slate-300">Privacy</a>
              <a href="/terms" className="hover:text-slate-300">Terms</a>
              <a href="/support" className="hover:text-slate-300">Support</a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-600 lg:px-8">
          © {new Date().getFullYear()} AUMER / Alba Union for Migrant and Elder Rights · EIN {SITE.authorityEIN} · All rights reserved.
        </div>
      </footer>
    </div>
  );
}