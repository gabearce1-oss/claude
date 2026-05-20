export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-slate-100 flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-2xl text-center">
        <div className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-4">TruthEngine360 · Blog</div>
        <h1 className="text-4xl font-semibold tracking-tight text-white mb-6">Research briefings and publication notes</h1>
        <p className="text-slate-300 text-lg leading-8 mb-8">
          This section will host research briefings, method notes, policy memos, and platform release updates.
          In the meantime, visit <a href="https://www.albavoice.org/research-and-publications/" target="_blank" rel="noreferrer" className="text-sky-300 hover:text-sky-200">AlbaVoice.org research &amp; publications</a> for current outputs.
        </p>
        <a href="/" className="inline-flex items-center justify-center rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">← Back to home</a>
      </div>
    </div>
  );
}