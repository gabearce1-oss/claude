import { useState } from "react";
import { P, FOIA_REQUESTS } from "../../lib/teData";

const TEMPLATES = [
  {
    id:"VA-BIRLS",
    agency:"Department of Veterans Affairs — BIRLS",
    address:"VA FOIA Service (005R1C)\n810 Vermont Avenue NW\nWashington, DC 20420",
    email:"vavbwas.vbfoia@va.gov",
    phone:"1-877-750-3639",
    cfr:"5 U.S.C. § 552",
    expedite:"Compelling need — imminent congressional briefing May 18, 2026",
    subject:"EXPEDITED FOIA REQUEST — Veteran Records BIRLS — Congressional Briefing",
    basis:"Congressional Briefing, 5 U.S.C. § 552(a)(6)(E)",
    foiaId:"F001",
    daysOverdue:83,
    body:`This is an expedited FOIA request pursuant to 5 U.S.C. § 552 and 38 C.F.R. Part 1.

REQUEST: All records in the Beneficiary Identification Records Locator System (BIRLS) responsive to the following criteria:
  (1) Veterans with service during the period January 1, 1964 – April 30, 1975 (Vietnam era)
  (2) Records indicating non-citizen status at time of service or separation
  (3) Records indicating subsequent removal, deportation, or voluntary departure
  (4) Any veteran records flagged with Hispanic/Latino surname classification

EXPEDITED PROCESSING IS REQUESTED because this information is urgently needed by an individual primarily engaged in disseminating information and there is a compelling need to inform the public concerning actual or alleged federal government activity — specifically, the classification failure rate of Hispanic veterans in the Defense Casualty Analysis System (DCAS) database.

BASIS FOR EXPEDITE: Congressional briefing scheduled May 18, 2026 — Congressional Hispanic Caucus. This request is 83 DAYS OVERDUE from the original filing of October 15, 2025.

Fee waiver is requested per 5 U.S.C. § 552(a)(4)(A)(iii) as this request is in the public interest.

If any records are withheld, please provide a Vaughn index identifying each withheld document, the exemption claimed, and a non-exempt segregable portion.`
  },
  {
    id:"DHS-ENFORCE",
    agency:"Department of Homeland Security — ICE FOIA",
    address:"ICE FOIA Office\n500 12th Street SW, Stop 5009\nWashington, DC 20536-5009",
    email:"foia.ice@dhs.gov",
    phone:"(866) 633-1182",
    cfr:"6 C.F.R. Part 5",
    expedite:"Imminent congressional testimony — CHC May 18, 2026",
    subject:"EXPEDITED FOIA — ICE ENFORCE Database Veteran Records — OVERDUE",
    basis:"Congressional Briefing + Media Urgency, 6 C.F.R. § 5.5(e)",
    foiaId:"F002",
    daysOverdue:66,
    body:`This is an expedited FOIA request pursuant to 5 U.S.C. § 552 and 6 C.F.R. Part 5.

REQUEST: All records from the ICE Enforcement Integrated Database (ENFORCE) including:
  (1) All removal/deportation records for individuals with prior U.S. military service
  (2) Records indicating veteran status at time of removal order issuance
  (3) Records where military service was considered in prosecutorial discretion determinations
  (4) Any ENFORCE records tagged with DD-214 or military service documentation
  (5) Aggregate statistics: total removals where veteran status was identified, FY2010–FY2025

EXPEDITED PROCESSING IS REQUESTED. This request is 66 DAYS OVERDUE. Original filed: November 1, 2025.

The Department's failure to respond within the statutory 20-business-day period constitutes constructive denial. AUMER Foundation reserves the right to file suit pursuant to 5 U.S.C. § 552(a)(4)(B) if records are not produced within 10 business days.

CHC INQUIRY NOTE: This request is the subject of a pending Congressional Hispanic Caucus inquiry. Failure to respond may result in CHC escalation to DHS Secretary.

Fee waiver requested — public interest research. All records requested in electronic format (CSV/XLSX preferred for database records).`
  },
  {
    id:"INAI-MEXICO",
    agency:"Instituto Nacional de Transparencia, Acceso a la Información (INAI)",
    address:"Insurgentes Sur 3211\nCol. Insurgentes Cuicuilco\nAlcaldía Coyoacán, CDMX 04530",
    email:"oriaweb@inai.org.mx",
    phone:"+52 55 3003-3900",
    cfr:"Ley General de Transparencia y Acceso a la Información Pública",
    expedite:"Investigación académica — coordinación bilateral",
    subject:"Solicitud de Acceso a la Información / RE-FILING — Veteranos Deportados",
    basis:"Artículo 125, Ley General de Transparencia",
    foiaId:"F003",
    daysOverdue:45,
    body:`SOLICITUD DE ACCESO A LA INFORMACIÓN — RE-FILING (45 DÍAS VENCIDA)

Con fundamento en los artículos 1, 2 y 125 de la Ley General de Transparencia y Acceso a la Información Pública, y demás disposiciones aplicables, la Fundación AUMER solicita:

1. Registros del Instituto Nacional de Migración (INM) referentes a:
   a) Personas deportadas desde los Estados Unidos que acreditaron haber prestado servicio militar en las Fuerzas Armadas de los EE.UU.
   b) Estadísticas de ingreso de deportados en puntos fronterizos 2010–2025
   c) Convenios bilaterales México-EE.UU. relativos a veteranos deportados

2. Datos de la Comisión Mexicana de Ayuda a Refugiados (COMAR) sobre:
   a) Solicitudes de protección internacional de veteranos estadounidenses deportados
   b) Casos activos en las ciudades de Tijuana, Ciudad Juárez, Nogales, Matamoros y Reynosa

CANAL DIPLOMÁTICO: Esta solicitud se presenta simultáneamente por el canal bilateral a través de la Secretaría de Relaciones Exteriores (SRE) en coordinación con COMAR.

The AUMER Foundation is a U.S.-based 501(c)(3) research organization. This request supports testimony before the U.S. Congressional Hispanic Caucus on May 18, 2026.`
  },
  {
    id:"CHC-INQUIRY",
    agency:"Congressional Hispanic Caucus",
    address:"Office of the CHC Chair\nU.S. House of Representatives\nWashington, DC 20515",
    email:"",
    phone:"(202) 225-2410",
    cfr:"Congressional inquiry authority",
    expedite:"N/A — Congressional escalation",
    subject:"CHC INQUIRY REQUEST — VA BIRLS + DHS ENFORCE FOIA — AUMER Foundation Research",
    basis:"Congressional oversight authority",
    foiaId:"CHC",
    daysOverdue:0,
    body:`Dear CHC Chair / Staff Director,

The AUMER Foundation respectfully requests that the Congressional Hispanic Caucus initiate a formal agency inquiry to the Department of Veterans Affairs and the Department of Homeland Security/ICE regarding two critically overdue FOIA requests.

BACKGROUND: The AUMER Foundation is conducting forensic research demonstrating that the Defense Casualty Analysis System (DCAS) classified only 349 of 58,220 Vietnam War casualties as Hispanic (0.60%), while BISG surname probability methodology estimates the true figure at 2,309+ (3.97%) — an 84.9% classification failure rate representing approximately 1,960 erased veterans.

OVERDUE FOIA REQUESTS:
1. VA BIRLS (F001) — Filed October 15, 2025 — 83 DAYS OVERDUE — 1-877-750-3639
2. DHS/ICE ENFORCE (F002) — Filed November 1, 2025 — 66 DAYS OVERDUE — foia.ice@dhs.gov

REQUESTED ACTION: A formal CHC letter to the VA Secretary and DHS Secretary requesting response within 10 business days. This research will be presented at the CHC briefing on May 18, 2026.

The data from these FOIA requests is essential to complete the 6-case CB-HSIVF dossier (SHA-256 certified) for congressional distribution.

Attached: DCAS 349 Anomaly Brief · 6 Verified Case Summaries · NERO Institutional Scores`
  },
];

const STATUS_C = { connected:P.teal, sent:P.blue, draft:P.amber, overdue:P.red };

export default function FOIAAutomation() {
  const [sel, setSel] = useState("VA-BIRLS");
  const [copied, setCopied] = useState(null);
  const [statuses, setStatuses] = useState({ "VA-BIRLS":"overdue","DHS-ENFORCE":"overdue","INAI-MEXICO":"overdue","CHC-INQUIRY":"draft" });

  const template = TEMPLATES.find(t => t.id === sel);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const markSent = (id) => setStatuses(p => ({...p, [id]: "sent"}));

  const CopyBtn = ({ text, k, label="Copy" }) => (
    <button onClick={() => copy(text, k)}
      style={{ padding:"3px 8px", background:`${P.blue}15`, border:`1px solid ${P.blue}30`,
        color: copied===k ? P.teal : P.blue, borderRadius:4, fontSize:7, cursor:"pointer" }}>
      {copied===k ? "✓ Copied" : label}
    </button>
  );

  return (
    <div style={{ display:"flex", gap:12, height:"calc(100vh - 170px)" }}>

      {/* Left: Request selector */}
      <div style={{ width:200, flexShrink:0, display:"flex", flexDirection:"column", gap:6 }}>
        <div style={{ fontSize:7, color:P.t4, letterSpacing:3, marginBottom:4 }}>SELECT REQUEST</div>
        {TEMPLATES.map(t => {
          const isSel = sel === t.id;
          const sc = STATUS_C[statuses[t.id]] || P.t4;
          const req = FOIA_REQUESTS.find(r=>r.id===t.foiaId);
          return (
            <div key={t.id} onClick={() => setSel(t.id)}
              style={{ background: isSel ? `${sc}15` : P.card, border:`1px solid ${isSel ? sc+"60" : P.b}`,
                borderLeft:`4px solid ${sc}`, borderRadius:8, padding:"9px 11px", cursor:"pointer", transition:"all .12s" }}>
              <div style={{ fontSize:8, fontWeight:700, color:sc, marginBottom:2 }}>{t.foiaId}</div>
              <div style={{ fontSize:8, color:P.t1, lineHeight:1.3, marginBottom:3 }}>
                {t.agency.split("—")[0].trim().slice(0,25)}
              </div>
              {t.daysOverdue > 0 && (
                <div style={{ fontSize:7, color:P.red, fontWeight:700 }}>{t.daysOverdue}d OVERDUE</div>
              )}
              <div style={{ fontSize:6, color:sc, marginTop:2, textTransform:"uppercase" }}>{statuses[t.id]}</div>
            </div>
          );
        })}

        {/* Summary */}
        <div style={{ marginTop:8, background:P.card, border:`1px solid ${P.b}`, borderRadius:8, padding:"10px 12px" }}>
          <div style={{ fontSize:7, color:P.t4, marginBottom:6 }}>ACTION SUMMARY</div>
          {[
            ["Call VA", "1-877-750-3639", P.red],
            ["Email ICE", "foia.ice@dhs.gov", P.red],
            ["Email INAI", "oriaweb@inai.org.mx", P.amber],
            ["CHC Office", "(202) 225-2410", P.gold],
          ].map(([l,v,c]) => (
            <div key={l} style={{ marginBottom:5 }}>
              <div style={{ fontSize:7, color:P.t4 }}>{l}</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, color:c, fontWeight:700 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Template viewer */}
      {template && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8, overflowY:"auto" }}>
          {/* Header */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, marginBottom:8 }}>
              <div>
                <div style={{ fontSize:7, color:P.t4, marginBottom:2 }}>{template.foiaId} · {template.cfr}</div>
                <div style={{ fontSize:13, fontWeight:800, color:P.t1, lineHeight:1.3 }}>{template.subject}</div>
                {template.daysOverdue > 0 && (
                  <div style={{ marginTop:4, fontSize:9, color:P.red, fontWeight:700 }}>⚠ {template.daysOverdue} DAYS OVERDUE — IMMEDIATE ACTION</div>
                )}
              </div>
              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                <button onClick={() => markSent(sel)}
                  style={{ padding:"6px 12px", background:`${P.teal}18`, border:`1px solid ${P.teal}30`,
                    color:P.teal, borderRadius:6, fontSize:8, fontWeight:700, cursor:"pointer" }}>
                  ✓ Mark Sent
                </button>
              </div>
            </div>

            {/* To/From/Contact grid */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              <div style={{ background:"#080D18", borderRadius:7, padding:"8px 10px" }}>
                <div style={{ fontSize:7, color:P.t4, marginBottom:3 }}>SEND TO (Agency)</div>
                <div style={{ fontSize:8, color:P.t2, lineHeight:1.6, whiteSpace:"pre-line" }}>{template.address}</div>
              </div>
              <div style={{ background:"#080D18", borderRadius:7, padding:"8px 10px" }}>
                <div style={{ fontSize:7, color:P.t4, marginBottom:3 }}>EMAIL / PHONE</div>
                {template.email && (
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, color:P.blue }}>{template.email}</span>
                    <CopyBtn text={template.email} k={`email-${sel}`} />
                  </div>
                )}
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:P.teal, fontWeight:700 }}>{template.phone}</div>
              </div>
              <div style={{ background:"#080D18", borderRadius:7, padding:"8px 10px" }}>
                <div style={{ fontSize:7, color:P.t4, marginBottom:3 }}>EXPEDITE BASIS</div>
                <div style={{ fontSize:8, color:P.amber, lineHeight:1.5 }}>{template.basis}</div>
              </div>
            </div>
          </div>

          {/* Letter body */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, overflow:"hidden", flex:1 }}>
            <div style={{ background:`linear-gradient(90deg,${P.blue}12,transparent)`, borderBottom:`1px solid ${P.b}`,
              padding:"8px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:9, fontWeight:700, color:P.t1 }}>📄 FOIA LETTER — Ready to Send</span>
              <div style={{ display:"flex", gap:6 }}>
                <CopyBtn text={`Subject: ${template.subject}\n\n${template.body}`} k={`body-${sel}`} label="Copy Full Letter" />
                <CopyBtn text={template.subject} k={`subj-${sel}`} label="Copy Subject" />
              </div>
            </div>
            <div style={{ padding:"14px 16px", overflowY:"auto", maxHeight:400 }}>
              <div style={{ marginBottom:8, paddingBottom:8, borderBottom:`1px solid ${P.b}20` }}>
                <div style={{ fontSize:8, color:P.t4 }}>SUBJECT:</div>
                <div style={{ fontSize:10, fontWeight:700, color:P.gold }}>{template.subject}</div>
              </div>
              <pre style={{ fontSize:9, color:P.t2, lineHeight:1.9, whiteSpace:"pre-wrap", fontFamily:"'IBM Plex Mono',monospace", margin:0 }}>
                {template.body}
              </pre>
              <div style={{ marginTop:14, paddingTop:8, borderTop:`1px solid ${P.b}20`, fontSize:9, color:P.t3 }}>
                <div>Respectfully submitted,</div>
                <div style={{ color:P.t1, fontWeight:700, marginTop:4 }}>AUMER Foundation Research Team</div>
                <div>gtarce@usc.edu</div>
                <div style={{ marginTop:8, color:P.t4 }}>
                  Attachments: DCAS 349 Anomaly Brief · CB-HSIVF Case Summaries · SHA-256 Evidence Chain
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}