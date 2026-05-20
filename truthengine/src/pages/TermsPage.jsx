export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-slate-100 px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-4">TruthEngine360</div>
        <h1 className="text-4xl font-semibold tracking-tight text-white mb-8">Terms of Use</h1>
        <div className="text-slate-300 leading-8 space-y-6 text-sm">
          <p>TruthEngine360 is a restricted analytical platform operated by AUMER / Alba Union for Migrant and Elder Rights (EIN 99-0495658). Access is granted at the sole discretion of the platform team.</p>
          <p><strong className="text-slate-100">Authorized use.</strong> Approved users may access the platform for research, advocacy, journalism, policy analysis, and related purposes consistent with AUMER's mission. Unauthorized use, extraction, redistribution, or commercial exploitation of platform data is prohibited.</p>
          <p><strong className="text-slate-100">Evidentiary content.</strong> Some platform materials are prepared in anticipation of legal proceedings. Users must not disclose, share, or reproduce protected or privileged content without explicit authorization.</p>
          <p><strong className="text-slate-100">Public pages.</strong> The public briefing surface (homepage, blog, privacy, support) may be accessed and shared freely. Public teaser metrics are provided for informational purposes only and should not be cited as audited findings without reviewing the associated methodology notes.</p>
          <p><strong className="text-slate-100">Termination.</strong> Access may be revoked at any time for misuse, breach of these terms, or at the discretion of the platform team.</p>
          <p className="text-slate-500 text-xs">Last updated: April 2026. Full terms will be expanded prior to general access launch.</p>
        </div>
        <a href="/" className="mt-10 inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-800 transition">← Back to home</a>
      </div>
    </div>
  );
}