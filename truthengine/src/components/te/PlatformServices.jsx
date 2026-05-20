export default function PlatformServices() {
  const services = [
    {
      title: "Case Analytics Engine",
      description: "Discrepancy detection, entity resolution, and cross-reference scoring across merged datasets.",
    },
    {
      title: "Evidence Repository",
      description: "Searchable archive with chain-of-custody metadata, provenance tracking, and version control.",
    },
    {
      title: "Source Registry",
      description: "Transparent catalog of all ingest sources, transformation rules, and data governance policies.",
    },
  ];

  return (
    <section id="support" className="py-16">
      <h3 className="mb-2 text-xl font-bold text-white">Platform Services & Modules</h3>
      <p className="mb-8 text-sm text-gray-400">
        Core research infrastructure components designed for scholarly rigor and evidentiary transparency.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        {services.map((service) => (
          <article key={service.title} className="rounded-xl border border-gray-800 bg-[#131720] p-6">
            <h4 className="text-lg font-semibold text-white">{service.title}</h4>
            <p className="mt-3 text-sm text-gray-400">{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}