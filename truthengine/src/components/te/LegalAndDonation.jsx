export default function LegalAndDonation() {
  return (
    <section id="terms" className="py-16">
      <div className="rounded-2xl border border-gray-800 bg-[#10141d] p-8 space-y-6">
        <h3 className="text-2xl font-bold text-white">Terms, Intellectual Property, and Donation Policy</h3>

        <p className="text-sm text-gray-300">
          This platform and its compiled research interface are intellectual property of the{" "}
          <strong className="text-white">AUMER / Alba Union for Migrant and Elder Rights</strong>{" "}
          (EIN 99-0495658). By proceeding to use this system, users agree to review and accept
          all platform terms before access and download operations.
        </p>

        <div className="rounded-xl border border-gray-700 bg-[#0B0E14] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-blue-300 font-semibold">Accommodation &amp; Donation Policy</p>
          <p className="mt-3 text-sm text-gray-300 leading-6">
            Platform access for research, civic advocacy, and public-interest inquiry is provided at no charge.
            For event exterior-use or licensed public-facing exhibitions of platform outputs, a suggested
            donation is appreciated to support ongoing infrastructure and archival work.
          </p>
          <p className="mt-3 text-sm text-gray-400 leading-6">
            Donations are voluntary, non-refundable, and do not confer data ownership, editorial control,
            expedited verification, or any claim over research outputs. Suggested contributions go directly
            toward archival maintenance, FOIA processing, and scholar support operations.
          </p>
          <p className="mt-4 text-xs text-gray-500">
            To support the mission:{" "}
            <a href="mailto:info@albavoice.org" className="text-blue-400 hover:text-blue-300">
              info@albavoice.org
            </a>
            {" "}·{" "}
            <a href="https://www.albavoice.org/" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300">
              albavoice.org
            </a>
          </p>
        </div>

        <div className="rounded-xl border border-gray-700 bg-[#0B0E14] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-blue-300 font-semibold">Governance &amp; Data Ethics</p>
          <p className="mt-3 text-sm text-gray-300 leading-6">
            This platform operates under a machine-readable governance framework including RBAC access
            controls, tiered data classification (T1 Public · T2 Internal · T3 Restricted Legal), mandatory
            audit logging with tamper-evident hashing, and a hard-fail production publish gate requiring
            approved agent versions, skill manifests, and provenance-complete outputs.
          </p>
          <p className="mt-3 text-sm text-gray-400 leading-6">
            Prohibited data practices include resident-level shelter tracking, private social media scraping,
            face recognition, mental-health inference, and any use that would convert research into a
            watchlist. Lawful scope is population-level, public-interest research using official records,
            archives, and scholarly sources.
          </p>
        </div>

        <p className="text-xs text-gray-500 pt-2">
          Platform terms, privacy policy, and full governance documentation are available at{" "}
          <a href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
          {" "}·{" "}
          <a href="/terms" className="text-blue-400 hover:text-blue-300">Terms of Use</a>
          {" "}·{" "}
          <a href="/support" className="text-blue-400 hover:text-blue-300">Support</a>
        </p>
      </div>
    </section>
  );
}