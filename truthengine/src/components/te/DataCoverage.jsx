export default function DataCoverage() {
  const coverageAreas = [
    { region: "United States", records: "500K+", agencies: "DoD, VA, ICE, SSA" },
    { region: "Mexico", records: "200K+", agencies: "SEGOB, SRE, National Archives" },
    { region: "Archival", records: "100K+", agencies: "NARA, Congressional Records, FOIA" },
  ];

  return (
    <section id="coverage" className="py-16">
      <h3 className="mb-2 text-xl font-bold text-white">Data Coverage & Sources</h3>
      <p className="mb-8 text-sm text-gray-400">
        Multi-jurisdictional records harmonization across US federal, state, and Mexican national registries.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        {coverageAreas.map((area) => (
          <article key={area.region} className="rounded-xl border border-gray-800 bg-[#131720] p-6">
            <h4 className="text-lg font-semibold text-white">{area.region}</h4>
            <p className="mt-3 text-sm text-gray-300">
              <span className="block text-2xl font-bold text-blue-300">{area.records}</span>
              <span className="text-xs text-gray-400 mt-2 block">{area.agencies}</span>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}