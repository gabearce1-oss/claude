import { useState } from "react";
import { base44 } from "@/api/base44Client";

const keyFindings = [
  { stat: "349", label: "Official DCAS Hispanic coded", note: "0.60% of 58,220 Vietnam records" },
  { stat: "3,272", label: "BIFSG forensic median estimate", note: "83.6% DCAS classification failure rate" },
  { stat: "9×–14.8×", label: "Undercount factor range", note: "5-stream convergence confirmed" },
  { stat: "0", label: "Veteran flags in ICE database", note: "713,464 FY2022–2026 records — GAO-19-416 confirmed" },
];

const SCHOLAR_SYSTEM = `You are a forensic research scholar assistant for the AUMER Foundation's TruthEngine360 platform. You specialize in:

- The DCAS (Defense Casualty Analysis System) Vietnam-era Hispanic casualty undercount anomaly
- BISG/BIFSG (Bayesian Improved Surname Geocoding) forensic demographic methodology
- U.S. military veteran deportation law (IIRIRA §237, INA §329, SCRA)
- Academic research methodology for human rights and immigration forensics
- Literature review and citation for veteran deportation scholarship

KEY FACTS:
- DCAS official: 349 Hispanic casualties (0.60% of 58,220) — BIFSG median: 3,272 (5.62%)
- 5-stream convergence: DCAS, BISG, NARA, Guzmán 1969, LAE Database
- NERO institutional erasure composite: 94.5/100
- GAO-19-416 (2019): 92 confirmed deported veterans; advocacy estimate 94,000+
- 6 CB-HSIVF verified cases (SHA-256 certified)
- CHC briefing deadline: May 18, 2026
- Key legislation: IIRIRA 1996 §237(a)(2)(A)(iii), INA §329, S.874, HR.1537

Help with: literature review, variable interpretation, citation formatting, research design, statistical methodology, draft academic correspondence, and investigative strategy. Queries are logged for audit. Never assist with surveillance or person-resolution.`;

const QUICK_QUERIES = [
  "What is the best methodology for validating BISG surname classification?",
  "Suggest a research design for comparing DCAS vs. BIRLS veteran records",
  "What peer-reviewed literature supports the NERO erasure framework?",
  "How do I cite DCAS extract files in APA format?",
  "What statistical tests validate the 5-stream convergence finding?",
  "Explain IIRIRA §237 retroactivity for a congressional briefing audience",
];

export default function ScholarAssistant() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queryLog, setQueryLog] = useState([]);

  const runQuery = async (q = query) => {
    if (!q.trim()) return;
    setLoading(true);
    setResponse("");
    setError(null);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Scholar Research Query: ${q}\n\nProvide a research-oriented response citing specific sources, methodologies, and literature where applicable. Format clearly with sections if needed.`,
        system_prompt: SCHOLAR_SYSTEM,
        add_context_from_previous_messages: false,
      });
      const text = typeof result === "string" ? result : result?.text || result?.content || JSON.stringify(result);
      setResponse(text);
      setQueryLog((prev) => [{ q, ans: text, ts: new Date().toLocaleTimeString() }, ...prev.slice(0, 4)]);
    } catch (err) {
      setError(err?.message || "AI query failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="ai-assistant" className="py-8 space-y-6">
      {/* Key forensic findings strip */}
      <div className="rounded-xl border border-gray-800 bg-[#131720] p-6">
        <p className="text-xs uppercase tracking-[0.14em] text-blue-300 font-semibold mb-4">
          Forensic Evidence Summary · Vietnam Casualty Anomaly &amp; Veteran Deportation Data
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {keyFindings.map((f) => (
            <div key={f.label} className="rounded-lg border border-gray-700 bg-[#0B0E14] p-4">
              <p className="text-2xl font-bold text-blue-300">{f.stat}</p>
              <p className="mt-1 text-xs font-semibold text-white">{f.label}</p>
              <p className="mt-1 text-xs text-gray-500">{f.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500 leading-5">
          Sources: DCAS Vietnam Conflict Extract File · BIFSG Forensic Audit (Arce 2026) · Guzmán (1969) · GAO-19-416 ·
          "Institutional Betrayal and Invisible Valor" · Master Deported Marines Database (AUMER, 2026).
        </p>
      </div>

      {/* Scholar AI query desk + info */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* AI Research Copilot — LIVE */}
        <article className="rounded-xl border border-blue-800/50 bg-gradient-to-br from-blue-950/40 to-[#131720] p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs uppercase tracking-[0.14em] text-blue-300">AI Scholar Assistance</p>
            <span className="text-xs bg-blue-900/40 text-blue-300 border border-blue-700/30 rounded px-2 py-0.5 font-bold">CLAUDE AI · LIVE</span>
          </div>
          <h3 className="mt-1 text-xl font-bold text-white">Research Copilot Desk</h3>
          <p className="mt-2 text-sm text-gray-300 leading-6">
            Submit research queries, methodology questions, or citation requests. All queries are logged for audit and never used for person-resolution.
          </p>

          {/* Quick query chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_QUERIES.slice(0, 3).map((q) => (
              <button
                key={q}
                onClick={() => { setQuery(q); runQuery(q); }}
                className="text-xs bg-blue-950/60 border border-blue-800/40 text-blue-300 rounded-full px-3 py-1 hover:border-blue-500 transition-colors cursor-pointer"
              >
                {q.length > 48 ? q.slice(0, 46) + "…" : q}
              </button>
            ))}
          </div>

          {/* Query input */}
          <div className="mt-4 flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runQuery()}
              placeholder="Ask a research question…"
              className="flex-1 text-sm bg-[#0B0E14] border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 outline-none focus:border-blue-600"
            />
            <button
              onClick={() => runQuery()}
              disabled={!query.trim() || loading}
              className="px-4 py-2 text-xs font-bold bg-blue-700 hover:bg-blue-600 disabled:opacity-40 text-white rounded-lg transition-colors"
            >
              {loading ? "…" : "Ask"}
            </button>
          </div>

          {/* More quick queries */}
          <div className="mt-2 flex flex-wrap gap-1">
            {QUICK_QUERIES.slice(3).map((q) => (
              <button
                key={q}
                onClick={() => { setQuery(q); runQuery(q); }}
                className="text-xs text-gray-500 hover:text-blue-300 transition-colors cursor-pointer underline underline-offset-2"
              >
                {q.length > 50 ? q.slice(0, 48) + "…" : q}
              </button>
            ))}
          </div>

          {/* Response area */}
          {loading && (
            <div className="mt-4 flex items-center gap-2 text-blue-300 text-sm">
              <span className="animate-spin">⟳</span> Claude AI analyzing…
            </div>
          )}
          {error && (
            <div className="mt-4 text-sm text-red-400 bg-red-900/20 border border-red-800/30 rounded p-3">⚠ {error}</div>
          )}
          {response && !loading && (
            <div className="mt-4 flex-1">
              <div className="text-xs text-blue-300 font-semibold mb-2 uppercase tracking-wide">AI Response</div>
              <div className="text-sm text-gray-200 leading-6 whitespace-pre-wrap max-h-72 overflow-y-auto bg-[#0B0E14] rounded p-3 border border-gray-800">
                {response}
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(`Q: ${query}\n\n${response}`)}
                  className="text-xs text-gray-500 hover:text-white transition-colors"
                >
                  📋 Copy
                </button>
                <button
                  onClick={() => { setResponse(""); setQuery(""); }}
                  className="text-xs text-gray-500 hover:text-white transition-colors ml-2"
                >
                  ✕ Clear
                </button>
              </div>
            </div>
          )}

          <p className="mt-4 text-xs text-gray-500">
            Scholar support:{" "}
            <a href="mailto:scholar-support@truthengine360.org" className="font-semibold text-blue-300 hover:text-blue-200">
              scholar-support@truthengine360.org
            </a>
          </p>
        </article>

        {/* Platform info + query log */}
        <article className="rounded-xl border border-gray-800 bg-[#131720] p-6 flex flex-col gap-4">
          <div>
            <h4 className="text-lg font-semibold text-white">Active Research Corpus</h4>
            <div className="mt-3 rounded-lg border border-gray-700 bg-[#0B0E14] p-4">
              <p className="text-xs text-gray-400 leading-5">
                <strong className="text-gray-200">Documents indexed:</strong> 19 peer-reviewed papers · 6 deported Marine case files · 742 target source families · governance policy gate v3a8aab1
              </p>
              <p className="text-xs text-gray-400 leading-5 mt-2">
                <strong className="text-gray-200">Manuscript:</strong> 245,216 words Rev.92 · "SGT George Ramos: The Mathematics of Vietnam" · Deadline May 31, 2026
              </p>
              <p className="text-xs text-gray-400 leading-5 mt-2">
                <strong className="text-gray-200">CHC briefing:</strong> May 18, 2026 · Readiness 73% · 2 FOIA blockers (F001 VA, F002 ICE)
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-base font-semibold text-white">Platform Capabilities</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-300">
              <li>→ Bilingual metadata quality scoring (EN/ES) for cross-border records</li>
              <li>→ APA/Chicago citation export for scholarly publication workflows</li>
              <li>→ BISG τ-sweep sensitivity analysis with SPSS validation export</li>
              <li>→ AI-assisted FOIA appeal drafting via Base44 Claude integration</li>
              <li>→ Versioned provenance mappings with SHA-256 chain-of-custody</li>
            </ul>
          </div>

          {/* Session query log */}
          {queryLog.length > 0 && (
            <div>
              <h4 className="text-base font-semibold text-white">Session Query Log</h4>
              <div className="mt-2 space-y-2">
                {queryLog.map((entry, i) => (
                  <div key={i} className="text-xs bg-[#0B0E14] border border-gray-800 rounded p-2">
                    <div className="text-gray-500">{entry.ts}</div>
                    <div className="text-blue-300 mt-0.5 font-medium">{entry.q.length > 80 ? entry.q.slice(0, 78) + "…" : entry.q}</div>
                    <div
                      onClick={() => { setQuery(entry.q); setResponse(entry.ans); }}
                      className="text-gray-500 mt-0.5 cursor-pointer hover:text-gray-300 transition-colors"
                    >
                      {entry.ans.slice(0, 100)}… <span className="text-blue-400">view →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
