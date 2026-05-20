const layers = [
  {
    title: "Source Acquisition",
    description: "Ingest and catalog documentary evidence from civil, defense, and archival repositories.",
  },
  {
    title: "Schema Harmonization",
    description: "Normalize entities, temporal fields, and provenance metadata across heterogeneous formats.",
  },
  {
    title: "Hybrid Inference",
    description: "Apply deterministic validation rules alongside probabilistic discrepancy detection models.",
  },
  {
    title: "Scholarly Prioritization",
    description: "Rank intersections by evidentiary strength, contextual significance, and review urgency.",
  },
];

export default function FrameworkDiagram() {
  return (
    <section id="methods" className="py-16">
      <h3 className="mb-2 text-xl font-bold text-white">Methodological Framework</h3>
      <p className="mb-8 text-sm text-gray-400">
        A transparent pipeline designed for reproducibility, interdisciplinary collaboration, and rigorous auditability.
      </p>

      <div className="grid gap-6 md:grid-cols-4">
        {layers.map((layer, i) => (
          <article
            key={layer.title}
            className="rounded-xl border border-gray-800 bg-[#131720] p-6 transition hover:border-blue-500"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Phase {i + 1}</p>
            <h4 className="mt-2 text-lg font-semibold text-white">{layer.title}</h4>
            <p className="mt-3 text-sm text-gray-400">{layer.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}