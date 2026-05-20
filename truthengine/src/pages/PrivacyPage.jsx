export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-slate-100 px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-4">TruthEngine360</div>
        <h1 className="text-4xl font-semibold tracking-tight text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-slate text-slate-300 leading-8 space-y-6 text-sm">
          <p>TruthEngine360 is operated by AUMER / Alba Union for Migrant and Elder Rights (EIN 99-0495658).</p>
          <p>This platform collects only the minimum information necessary to grant and manage access. Email addresses submitted through the request-access or newsletter forms are used solely to communicate about platform access and research updates. They are not sold, shared with third parties for commercial purposes, or used for any purpose unrelated to AUMER's research and advocacy mission.</p>
          <p>Authenticated platform users may have usage data logged for security, audit, and research-integrity purposes. This data is retained only as long as necessary to support those functions.</p>
          <p>For questions, data removal requests, or concerns, contact: <a href="mailto:info@qtruthengine360.org" className="text-sky-300">info@qtruthengine360.org</a></p>
          <p className="text-slate-500 text-xs">Last updated: April 2026. This policy will be expanded as the platform matures.</p>
        </div>
        <a href="/" className="mt-10 inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-800 transition">← Back to home</a>
      </div>
    </div>
  );
}