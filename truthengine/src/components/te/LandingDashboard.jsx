const modules = ["Case Analytics", "Evidence Repository", "Source Registry"];

export default function Dashboard() {
  return (
    <section className="py-16">
      <h3 className="mb-2 text-2xl font-bold text-white">Research Dashboard</h3>
      <p className="mb-6 text-sm text-gray-400">
        Authenticated workspace enabled. Modules support evidence review, traceability checks, and comparative analysis.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        {modules.map((title) => (
          <Card key={title} title={title} />
        ))}
      </div>
    </section>
  );
}

function Card({ title }) {
  return (
    <article className="rounded-xl border border-gray-800 bg-[#131720] p-6">
      <h4 className="mb-2 font-semibold text-white">{title}</h4>
      <p className="text-sm text-gray-400">Restricted module. Full records and exports are available after verification.</p>
    </article>
  );
}