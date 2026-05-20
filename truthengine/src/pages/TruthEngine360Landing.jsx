import { useMemo, useState } from "react";
import FrameworkDiagram from "../components/te/LandingFrameworkDiagram";
import AccessGate from "../components/te/LandingAccessGate";
import Dashboard from "../components/te/LandingDashboard";
import DataCoverage from "../components/te/DataCoverage";
import PlatformServices from "../components/te/PlatformServices";
import ScholarAssistant from "../components/te/ScholarAssistant";
import LegalAndDonation from "../components/te/LegalAndDonation";

const KPIS = [
  ["713,464", "Records Harmonized"],
  ["202,864", "Entity Crosswalk Candidates"],
  ["US + MX", "Public Agency Coverage"],
  ["99.2%", "Discrepancy Alert Precision"],
];

export default function TruthEngine360Landing() {
  const [isAuth, setIsAuth] = useState(false);

  const ctaLabel = useMemo(() => (isAuth ? "Open Dashboard" : "Request Access"), [isAuth]);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-gray-200" style={{ fontFamily: "'Arial', 'Helvetica Neue', sans-serif" }}>
      <div className="border-b border-gray-800 p-3 text-center text-xs tracking-[0.2em] text-gray-400">
        ACADEMIC FORENSIC RESEARCH PLATFORM · PUBLIC ABSTRACT LAYER
      </div>

      <nav className="sticky top-0 z-10 border-b border-gray-800/90 bg-[#0B0E14]/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold text-white">TruthEngine360</h1>
          <div className="hidden items-center gap-6 text-sm text-gray-300 md:flex">
            <a href="#mission" className="hover:text-white transition">Research Aim</a>
            <a href="#methods" className="hover:text-white transition">Methodology</a>
            <a href="#coverage" className="hover:text-white transition">Coverage</a>
            <a href="#support" className="hover:text-white transition">Help Desk</a>
            <a href="#ai-assistant" className="hover:text-white transition">AI Scholar</a>
          </div>
          <button
            onClick={() => setIsAuth((state) => !state)}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
          >
            {ctaLabel}
          </button>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl px-6">
        <section id="mission" className="py-20 text-center">
          <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-blue-300">INSTITUTE FOR COMPUTATIONAL FORENSICS</p>
          <h2 className="mb-5 text-4xl font-bold text-white md:text-5xl">Forensic Data. Reconstructed Historical Truth.</h2>
          <p className="mx-auto max-w-3xl text-gray-400">
            TruthEngine360 supports evidence-led scholarly inquiry into systemic inconsistencies across military,
            immigration, and archival registries through transparent data engineering and reproducible analysis.
          </p>
        </section>

        <section id="authority" className="grid grid-cols-2 gap-4 py-10 md:grid-cols-4 md:gap-6">
          {KPIS.map(([value, label]) => (
            <article key={label} className="rounded-xl border border-gray-800 bg-[#131720] p-6">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="mt-2 text-sm text-gray-400">{label}</p>
            </article>
          ))}
        </section>

        <FrameworkDiagram />
        <DataCoverage />

        <section id="updates" className="my-6 rounded-xl border border-blue-700/40 bg-gradient-to-r from-blue-950/30 to-transparent p-6">
          <p className="text-xs tracking-[0.14em] text-blue-300">CURRENT RESEARCH BRIEF</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Confidence lineage scoring has been incorporated into the discrepancy triage pipeline.</h3>
          <p className="mt-2 text-sm text-gray-300">Researchers can now inspect evidentiary provenance across merged records prior to case promotion and peer review.</p>
        </section>

        {!isAuth ? <AccessGate /> : <Dashboard />}

        <PlatformServices />
        <ScholarAssistant />
        <LegalAndDonation />
      </main>
    </div>
  );
}