export default function AccessGate() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border border-gray-800 bg-[#10141d] p-8">
        <h3 className="text-center text-2xl font-bold text-white">Research Access Request</h3>
        <p className="mx-auto mt-3 max-w-xl text-center text-gray-400">
          Access to full-resolution records requires institutional verification and a documented scholarly use case.
        </p>

        <form className="mt-8 grid gap-4" onSubmit={(event) => event.preventDefault()}>
          <input className="w-full rounded border border-gray-700 bg-[#0B0E14] p-3" placeholder="Principal Investigator / Full Name" />
          <input className="w-full rounded border border-gray-700 bg-[#0B0E14] p-3" placeholder="Institutional Email Address" />
          <input className="w-full rounded border border-gray-700 bg-[#0B0E14] p-3" placeholder="Affiliated Institution" />
          <textarea
            className="min-h-28 w-full rounded border border-gray-700 bg-[#0B0E14] p-3"
            placeholder="Research Objective and Intended Method of Use"
          />

          <button className="mt-2 w-full rounded bg-blue-700 p-3 font-medium text-white transition hover:bg-blue-600">
            Submit for Review
          </button>
        </form>
      </div>
    </section>
  );
}