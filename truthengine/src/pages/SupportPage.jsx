export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-slate-100 flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-2xl w-full">
        <div className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-4 text-center">TruthEngine360 · Support</div>
        <h1 className="text-4xl font-semibold tracking-tight text-white mb-6 text-center">Contact & Support</h1>
        <div className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-8 space-y-6">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">Platform support</div>
            <p className="text-slate-300 text-sm leading-7">For access requests, technical issues, or questions about the TruthEngine360 platform:</p>
            <a href="mailto:info@qtruthengine360.org" className="block mt-2 text-sky-300 hover:text-sky-200 text-sm">info@qtruthengine360.org</a>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">Research & mission</div>
            <p className="text-slate-300 text-sm leading-7">For research partnerships, media inquiries, or AUMER mission questions:</p>
            <a href="mailto:info@albavoice.org" className="block mt-2 text-sky-300 hover:text-sky-200 text-sm">info@albavoice.org</a>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">Organization</div>
            <p className="text-slate-300 text-sm leading-7">AUMER / Alba Union for Migrant and Elder Rights · EIN 99-0495658</p>
            <a href="https://www.albavoice.org" target="_blank" rel="noreferrer" className="block mt-2 text-sky-300 hover:text-sky-200 text-sm">albavoice.org →</a>
          </div>
        </div>
        <div className="text-center mt-8">
          <a href="/" className="inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-800 transition">← Back to home</a>
        </div>
      </div>
    </div>
  );
}