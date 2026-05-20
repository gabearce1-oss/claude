import { useState } from "react";
import { base44 } from "../../api/base44Client";
import { P } from "../../lib/teData";

const FOIA_REGISTRY = [
  {
    id: 'AR-001',
    agency: 'Department of Veterans Affairs',
    agency_short: 'VA',
    record_target: 'VA BIRLS (Beneficiary Identification Records Locator System)',
    record_desc: 'Vietnam-era Hispanic veteran benefit records, service records, and death records',
    tracking_number: 'VA-BIRLS-2026-001',
    filed_date: '2026-02-01',
    statutory_deadline: '2026-02-28',
    status: 'OVERDUE',
    days_overdue: 81,
    escalation_path: 'CHC → HVAC (House Veterans Affairs Committee)',
    committee: 'House Veterans Affairs Committee',
    committee_chair: 'HVAC Chairman',
    legal_basis: '5 U.S.C. §552; 38 C.F.R. Part 1',
    research_purpose: 'Vietnam-era Hispanic veteran casualty classification forensics — DCAS anomaly investigation',
    contact_name: 'Gabriel T. Arce Jr.',
    contact_email: 'gtarce@usc.edu',
    organization: 'AUMER Foundation',
    ein: '99-0495658',
    institution: 'USC Sol Price School of Public Policy',
  },
  {
    id: 'AR-002',
    agency: 'Department of Homeland Security / ICE',
    agency_short: 'DHS/ICE',
    record_target: 'DHS ENFORCE / ICE ERO Database',
    record_desc: 'Non-citizen veteran removal records 1996–present, ICE ERO enforcement data',
    tracking_number: 'DHS-ENFORCE-2026-001',
    filed_date: '2026-02-01',
    statutory_deadline: '2026-02-28',
    status: 'OVERDUE',
    days_overdue: 81,
    escalation_path: 'CHC → House Judiciary Committee',
    committee: 'House Judiciary Committee — Subcommittee on Immigration',
    committee_chair: 'Judiciary Subcommittee Chair',
    legal_basis: '5 U.S.C. §552; 8 U.S.C. §1229a',
    research_purpose: 'Documenting removal of U.S. military veterans — accountability for Noem Sept/Dec 2025 contradiction',
    contact_name: 'Gabriel T. Arce Jr.',
    contact_email: 'gtarce@usc.edu',
    organization: 'AUMER Foundation',
    ein: '99-0495658',
    institution: 'USC Sol Price School of Public Policy',
  },
  {
    id: 'AR-003',
    agency: 'INAI (Instituto Nacional de Transparencia, Acceso a la Información)',
    agency_short: 'INAI',
    record_target: 'Mexican government veteran recognition records / SRE bilateral',
    record_desc: 'SRE records on Mexican national veterans of U.S. military service, SEDENA files',
    tracking_number: 'INAI-2026-001',
    filed_date: '2026-03-01',
    statutory_deadline: '2026-03-28',
    status: 'OVERDUE',
    days_overdue: 53,
    escalation_path: 'SRE bilateral diplomatic channel',
    committee: 'Secretaría de Relaciones Exteriores (SRE) — Dirección de Asuntos Migratorios',
    committee_chair: 'SRE Director de Asuntos Migratorios',
    legal_basis: 'Ley General de Transparencia y Acceso a la Información Pública (México); LFAIP Art. 40',
    research_purpose: 'Cross-border identification of Mexican-national Vietnam-era veterans — DCAS classification audit',
    contact_name: 'Gabriel T. Arce Jr.',
    contact_email: 'gtarce@usc.edu',
    organization: 'AUMER Foundation',
    ein: '99-0495658',
    institution: 'USC Sol Price School of Public Policy',
  },
  {
    id: 'AR-004',
    agency: 'National Archives (NARA-St. Louis)',
    agency_short: 'NARA',
    record_target: 'SSS Form 102 — Non-citizen draftee registration',
    record_desc: 'Selective Service Form 102 (alien registration) for Vietnam-era non-citizen draftees, RG 147',
    tracking_number: 'NARA-SSS-2026-001',
    filed_date: '2026-04-01',
    statutory_deadline: '2026-05-01',
    status: 'PENDING',
    days_overdue: null,
    escalation_path: 'None yet — within statutory period',
    committee: null,
    legal_basis: '5 U.S.C. §552; 44 U.S.C. §2108',
    research_purpose: 'Non-citizen draftee identification — key to Vietnam-era Mexican-national casualty reconstruction',
    contact_name: 'Gabriel T. Arce Jr.',
    contact_email: 'gtarce@usc.edu',
    organization: 'AUMER Foundation',
    ein: '99-0495658',
    institution: 'USC Sol Price School of Public Policy',
  },
  {
    id: 'AR-005',
    agency: 'FSRDC / Census Bureau',
    agency_short: 'FSRDC',
    record_target: 'APSR microdata — Cambridge replication doi:10.7910/DVN/O80SKQ',
    record_desc: 'APSR replication archive microdata for capture-recapture overlap estimation',
    tracking_number: 'FSRDC-2026-001',
    filed_date: '2026-04-15',
    statutory_deadline: '2026-06-01',
    status: 'PENDING',
    days_overdue: null,
    escalation_path: 'None yet — within statutory period',
    committee: null,
    legal_basis: '5 U.S.C. §552; Census Confidentiality Act 13 U.S.C. §9',
    research_purpose: 'Chapman estimator m2 overlap — true Mexican-national KIA population estimation',
    contact_name: 'Gabriel T. Arce Jr.',
    contact_email: 'gtarce@usc.edu',
    organization: 'AUMER Foundation',
    ein: '99-0495658',
    institution: 'USC Sol Price School of Public Policy',
  },
];

const STATUS_COLOR = { OVERDUE: P.red, PENDING: P.gold, FULFILLED: P.teal, DENIED: P.red, ESCALATED: '#f97316' };

export default function FOIAEscalationLetters() {
  const [selectedFOIA, setSelectedFOIA] = useState(null);
  const [letterType, setLetterType] = useState('escalation');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [loading, setLoading] = useState(false);

  const generateLetter = async (foia) => {
    setSelectedFOIA(foia);
    setGeneratedLetter('');
    setLoading(true);

    const isOverdue = foia.status === 'OVERDUE';
    const letterPrompts = {
      escalation: isOverdue
        ? `Write a formal congressional escalation letter to ${foia.committee} regarding a severely overdue FOIA request to ${foia.agency}. The request was filed ${foia.filed_date}, the statutory deadline of ${foia.statutory_deadline} has passed, and the request is now ${foia.days_overdue} days overdue. Research purpose: ${foia.research_purpose}. Legal basis: ${foia.legal_basis}. Request immediate intervention and production of responsive records. Cite 5 U.S.C. §552(a)(6)(A)(i). Use professional congressional correspondence format. Contact: ${foia.contact_name}, ${foia.contact_email}, ${foia.organization} EIN ${foia.ein}, ${foia.institution}.`
        : `Write a formal status inquiry letter to ${foia.agency} regarding FOIA request ${foia.tracking_number} filed ${foia.filed_date}. Request a status update and estimated completion date. Legal basis: ${foia.legal_basis}. Contact: ${foia.contact_name}, ${foia.contact_email}, ${foia.organization}.`,
      reminder: `Write a professional follow-up reminder to ${foia.agency} regarding FOIA request ${foia.tracking_number}. Status: ${foia.status}. Statutory deadline: ${foia.statutory_deadline}. Research purpose: ${foia.research_purpose}. Polite but firm. Include statutory rights under ${foia.legal_basis}.`,
      appeal: `Write a formal FOIA appeal letter to ${foia.agency} on behalf of ${foia.organization} (EIN: ${foia.ein}) for FOIA request ${foia.tracking_number}. The request seeks: ${foia.record_desc}. Research purpose: ${foia.research_purpose}. Assert public interest fee waiver and news media/research entity status. Cite 5 U.S.C. §552(a)(4)(B) and applicable agency regulations.`,
      gao_referral: `Write a formal GAO referral letter regarding the overdue FOIA request ${foia.tracking_number} to ${foia.agency}. The request is ${foia.days_overdue || 0} days past statutory deadline. Request GAO investigation under 5 U.S.C. §552(e). Contact: ${foia.contact_name}, ${foia.organization}.`,
    };

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: letterPrompts[letterType] || letterPrompts.escalation,
        system_prompt: `You are a legal correspondence specialist for the AUMER Foundation at USC Sol Price School of Public Policy. You draft congressional escalation letters, FOIA appeals, and agency correspondence for a forensic investigation into the DCAS Vietnam-era Hispanic casualty classification anomaly (349 official / 2,309 BISG estimate / 84.9% classification failure). All correspondence must: cite specific statutory authority, use professional congressional format, include full contact information, be factually accurate (no invented dates or case numbers), clearly state the research purpose and public interest basis. For overdue FOIAs, emphasize the statutory violation and request immediate remediation. For bilateral Mexico channels (INAI/SRE), note the international research collaboration context.`,
        add_context_from_previous_messages: false,
      });
      setGeneratedLetter(typeof result === 'string' ? result : result?.text || JSON.stringify(result));
    } catch (e) {
      setGeneratedLetter(`Error generating letter: ${e.message}`);
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter).catch(() => {});
  };

  const S = {
    wrap: { background: P.bg, minHeight: '100%', padding: '16px 20px', fontFamily: "'IBM Plex Mono', monospace", color: P.t1 },
    header: { background: `${P.navy}cc`, border: `1px solid ${P.gold}44`, borderRadius: 8, padding: '14px 18px', marginBottom: 16 },
    card: (borderCol) => ({ background: `${P.navy}88`, border: `1px solid ${borderCol || P.b}`, borderRadius: 6, padding: '12px 16px', marginBottom: 8 }),
    badge: (col) => ({ display: 'inline-block', background: `${col}22`, border: `1px solid ${col}55`, borderRadius: 3, padding: '2px 7px', fontSize: 10, color: col }),
    btn: (col, filled) => ({ background: filled ? `${col}33` : 'transparent', border: `1px solid ${col}`, borderRadius: 4, padding: '5px 12px', color: col, fontSize: 11, cursor: 'pointer' }),
    letterBox: { background: '#050d1a', border: `1px solid ${P.teal}44`, borderRadius: 6, padding: 16, fontSize: 11, whiteSpace: 'pre-wrap', maxHeight: 480, overflowY: 'auto', color: '#e2e8f0', lineHeight: 1.7, fontFamily: 'Georgia, serif' },
    select: { background: `${P.navy}cc`, border: `1px solid ${P.b}`, borderRadius: 4, padding: '5px 8px', color: P.t1, fontSize: 11 },
  };

  return (
    <div style={S.wrap}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ color: P.gold, fontSize: 14, fontWeight: 700 }}>FOIA ESCALATION LETTERS</div>
            <div style={{ color: P.t2, fontSize: 10, marginTop: 2 }}>Congressional escalation, appeals, and agency correspondence — AI-drafted</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={S.badge(P.red)}>3 OVERDUE</span>
            <span style={S.badge(P.gold)}>2 PENDING</span>
          </div>
        </div>
        {/* Overdue alert */}
        <div style={{ background: `${P.red}11`, border: `1px solid ${P.red}44`, borderRadius: 6, padding: '8px 12px', marginTop: 12, fontSize: 11, color: P.t1 }}>
          <span style={{ color: P.red, fontWeight: 700 }}>⚠ STATUTORY DEADLINE VIOLATIONS: </span>
          AR-001 (VA BIRLS) and AR-002 (DHS ENFORCE) are 81+ days overdue. AR-003 (INAI Mexico) is 53+ days overdue.
          Congressional escalation is recommended immediately per 5 U.S.C. §552(a)(6)(C).
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Left: FOIA Registry */}
        <div>
          <div style={{ color: P.gold, fontSize: 11, fontWeight: 700, marginBottom: 10 }}>FOIA REGISTRY</div>
          {FOIA_REGISTRY.map(f => (
            <div key={f.id} style={{ ...S.card(`${STATUS_COLOR[f.status]}44`), borderLeft: `3px solid ${STATUS_COLOR[f.status]}`, cursor: 'pointer' }}
              onClick={() => setSelectedFOIA(f === selectedFOIA ? null : f)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: P.t3, fontSize: 10 }}>{f.id}</span>
                <span style={S.badge(STATUS_COLOR[f.status])}>
                  {f.status}{f.days_overdue ? ` +${f.days_overdue}d` : ''}
                </span>
              </div>
              <div style={{ color: P.t1, fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{f.agency_short} — {f.record_target.slice(0, 40)}{f.record_target.length > 40 ? '…' : ''}</div>
              <div style={{ color: P.t2, fontSize: 10, marginBottom: 4 }}>{f.record_desc.slice(0, 90)}…</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ color: P.t3, fontSize: 10 }}>Filed: {f.filed_date}</span>
                <span style={{ color: P.t3, fontSize: 10 }}>Deadline: {f.statutory_deadline}</span>
              </div>
              {f.escalation_path && f.status === 'OVERDUE' && (
                <div style={{ marginTop: 5, color: P.red, fontSize: 10 }}>
                  Escalation: {f.escalation_path}
                </div>
              )}

              {/* Generate buttons when selected */}
              {selectedFOIA === f && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${P.b}` }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <select style={S.select} value={letterType} onChange={e => setLetterType(e.target.value)}>
                      <option value="escalation">{f.status === 'OVERDUE' ? 'Congressional Escalation' : 'Status Inquiry'}</option>
                      <option value="reminder">Agency Reminder</option>
                      <option value="appeal">FOIA Appeal</option>
                      {f.status === 'OVERDUE' && <option value="gao_referral">GAO Referral</option>}
                    </select>
                    <button
                      onClick={(e) => { e.stopPropagation(); generateLetter(f); }}
                      disabled={loading}
                      style={S.btn(P.gold, true)}
                    >
                      {loading && selectedFOIA?.id === f.id ? '⟳ Drafting…' : '⚡ Generate Letter'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right: Letter display */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ color: P.gold, fontSize: 11, fontWeight: 700 }}>
              {generatedLetter ? `GENERATED: ${letterType.toUpperCase().replace(/_/g, ' ')}` : 'LETTER DRAFT'}
            </div>
            {generatedLetter && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={copyToClipboard} style={S.btn(P.teal, false)}>Copy</button>
                <button
                  onClick={() => {
                    const blob = new Blob([generatedLetter], { type: 'text/plain' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `${selectedFOIA?.id}_${letterType}_${new Date().toISOString().slice(0,10)}.txt`;
                    a.click();
                  }}
                  style={S.btn(P.gold, false)}
                >
                  Download
                </button>
              </div>
            )}
          </div>

          {!generatedLetter && !loading && (
            <div style={{ ...S.card(P.b), textAlign: 'center', padding: '40px 20px', color: P.t3 }}>
              Select a FOIA request from the registry and click Generate Letter to draft congressional escalation correspondence using Claude AI.
            </div>
          )}

          {loading && (
            <div style={{ ...S.card(P.gold), textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ color: P.gold, fontSize: 13 }}>⟳ Claude AI drafting correspondence…</div>
              <div style={{ color: P.t2, fontSize: 11, marginTop: 8 }}>
                Applying 5 U.S.C. §552 statutory framework · {selectedFOIA?.agency_short}
              </div>
            </div>
          )}

          {generatedLetter && !loading && (
            <>
              {/* Letter metadata strip */}
              <div style={{ background: `${P.navy}cc`, border: `1px solid ${P.b}`, borderRadius: 6, padding: '8px 12px', marginBottom: 8, display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 10, color: P.t3 }}>
                <span><span style={{ color: P.gold }}>FOIA: </span>{selectedFOIA?.id}</span>
                <span><span style={{ color: P.gold }}>Agency: </span>{selectedFOIA?.agency_short}</span>
                <span><span style={{ color: P.gold }}>Type: </span>{letterType}</span>
                <span><span style={{ color: STATUS_COLOR[selectedFOIA?.status] }}>Status: </span>{selectedFOIA?.status}</span>
              </div>
              <div style={S.letterBox}>{generatedLetter}</div>
            </>
          )}

          {/* Legal framework reference */}
          <div style={{ marginTop: 12, ...S.card(P.b), padding: '8px 12px' }}>
            <div style={{ color: P.gold, fontSize: 10, fontWeight: 700, marginBottom: 6 }}>LEGAL FRAMEWORK</div>
            {[
              ['5 U.S.C. §552(a)(6)(A)', 'Agencies must respond within 20 business days'],
              ['5 U.S.C. §552(a)(6)(C)', 'Constructive exhaustion — overdue = deemed denied'],
              ['5 U.S.C. §552(a)(4)(B)', 'District court jurisdiction; fee waivers for news/research'],
              ['LFAIP Art. 40 (México)', 'Mexican transparency law — INAI response deadline'],
            ].map(([cite, desc]) => (
              <div key={cite} style={{ display: 'flex', gap: 8, marginBottom: 3, fontSize: 10 }}>
                <span style={{ color: P.teal, minWidth: 200 }}>{cite}</span>
                <span style={{ color: P.t3 }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
