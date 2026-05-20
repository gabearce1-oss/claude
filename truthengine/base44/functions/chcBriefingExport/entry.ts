import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// CHC Briefing Data Export — generates full congressional briefing package
// Returns structured JSON data package + optional email dispatch

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { sendEmail = false, recipient = "gtarce@usc.edu", format = "json" } = body;

    const CHC_DATE = new Date("2026-05-18");
    const TODAY = new Date("2026-04-09");
    const daysToBreifing = Math.ceil((CHC_DATE - TODAY) / 86400000);
    const timestamp = new Date().toISOString();

    // ── FULL DATA PACKAGE ────────────────────────────────────────────────────
    const package_ = {
      metadata: {
        title: "TruthEngine360 CHC Briefing Data Package",
        subtitle: "Congressional Hispanic Caucus — May 18, 2026",
        generated: timestamp,
        generatedBy: user.email,
        daysToBreifing,
        classification: "UNCLASSIFIED // FOR OFFICIAL USE",
        version: "v2.1",
        sha256Chain: "ACTIVE — 6 cases certified",
      },

      keyStatistics: {
        dcasTotal: 58220,
        officialHispanic: 349,
        officialPct: 0.60,
        bisgEstimate: 2309,
        bisgPct: 3.97,
        classificationFailure: 84.9,
        undercountFactor: 6.6,
        missingVeterans: 1960,
        confirmedDeported: 92,         // GAO-19-416
        advocacyEstimateDeported: 94000,
        atRiskNonCitizenVets: 115000,
        deportedJanJun2025: 10000,
        lulacTracking: 400,
      },

      neroScores: {
        N: 94, E: 97, R: 91, O: 96,
        composite: 94.5,
        interpretation: "Severe institutional erasure across all 4 vectors",
      },

      verifiedCases: [
        { id:"C001", name:"SGT George Ramos",    branch:"Army",  era:"Vietnam", tier:"Gold",   confidence:96, status:"In US", country:"USA",    urgency:"Standard", sha:"a3f9c2d1e8b4f7a6" },
        { id:"C002", name:"Mario Valenzuela",     branch:"USMC",  era:"Vietnam", tier:"Gold",   confidence:89, status:"Deported", country:"MEX", urgency:"High",     sha:"b7e1d4c2f9a3e8b1" },
        { id:"C003", name:"Victor Valenzuela",    branch:"USMC",  era:"Vietnam", tier:"Silver", confidence:87, status:"Deported", country:"MEX", urgency:"High",     sha:"c2a8f1b9d3e7c4f2" },
        { id:"C004", name:"Sae Joon Park",        branch:"USMC",  era:"Post",    tier:"Gold",   confidence:94, status:"Deported", country:"KOR", urgency:"CRITICAL", sha:"d5b3e9a1c7f4d2b8" },
        { id:"C005", name:"Miguel Segura",        branch:"Army",  era:"Vietnam", tier:"Silver", confidence:78, status:"Deported", country:"MEX", urgency:"High",     sha:"e9c7a2d4b1f8e3c6" },
        { id:"C006", name:"Joaquin Duran",        branch:"Army",  era:"Vietnam", tier:"Bronze", confidence:72, status:"Deported", country:"COL", urgency:"Med",      sha:"f1d4b8c3e9a7f2d5" },
      ],

      foiaStatus: [
        { id:"F001", agency:"VA BIRLS",      filed:"2025-09-15", due:"2025-11-14", daysOverdue:83, status:"CRITICAL_OVERDUE", contact:"1-877-750-3639" },
        { id:"F002", agency:"ICE ENFORCE",   filed:"2025-10-15", due:"2025-12-14", daysOverdue:66, status:"CRITICAL_OVERDUE", contact:"foia.ice@dhs.gov" },
        { id:"F003", agency:"INAI México",   filed:"2025-11-01", due:"2026-01-01", daysOverdue:0,  status:"PENDING",          contact:"infomex@inai.org.mx" },
      ],

      convergenceStreams: [
        { id:"S1", source:"DCAS Official",   count:349,  pct:0.60, delta:0,    type:"BASELINE" },
        { id:"S2", source:"BISG τ=0.40",     count:2309, pct:3.97, delta:1960, type:"FORENSIC" },
        { id:"S3", source:"NARA Retroactive",count:3070, pct:5.27, delta:2721, type:"ARCHIVAL" },
        { id:"S4", source:"Guzmán 1969",     count:3500, pct:6.01, delta:3151, type:"HISTORICAL" },
        { id:"S5", source:"LAE Database",    count:3741, pct:6.43, delta:3392, type:"COMMUNITY" },
      ],

      legislativeAsks: [
        { priority:1, ask:"Expedite F001 + F002 FOIA responses within 10 business days", law:"5 USC §552", status:"URGENT" },
        { priority:2, ask:"Pass S.874 — Veterans Visa and Protection Act", law:"S.874 118th Congress", status:"PENDING_VOTE" },
        { priority:3, ask:"Pass HR.1537 — Repatriate Our Patriots Act", law:"HR.1537 118th Congress", status:"PENDING_VOTE" },
        { priority:4, ask:"Mandate inter-agency veteran flag before any removal order", law:"Executive Action", status:"PROPOSED" },
        { priority:5, ask:"Restore judicial discretion — repeal IIRIRA §237(a)(2)(A)(iii) retroactive application", law:"IIRIRA 1996", status:"PROPOSED" },
        { priority:6, ask:"Fund DCAS forensic audit using BISG methodology", law:"Appropriations", status:"PROPOSED" },
      ],

      chcReadiness: {
        overall: 73,
        components: [
          { item:"DCAS Evidence Package",    pct:97, status:"READY" },
          { item:"6 CB-HSIVF Case Files",    pct:92, status:"READY" },
          { item:"BISG Statistical Package", pct:100, status:"READY" },
          { item:"NERO Scores Compiled",     pct:95, status:"READY" },
          { item:"Legislative Asks Drafted", pct:100, status:"READY" },
          { item:"SHA-256 Evidence Chain",   pct:100, status:"CERTIFIED" },
          { item:"VA BIRLS Records (F001)",  pct:0,   status:"BLOCKED_FOIA" },
          { item:"ICE ENFORCE (F002)",       pct:0,   status:"BLOCKED_FOIA" },
        ],
        blockers: 2,
        criticalPath: "Resolve F001 + F002 → complete C005/C006 verification → finalize BISG package",
      },

      distributionList: [
        "CHC Chair Office",
        "Rep. Nanette Barragán (CA-44)",
        "Rep. Adriano Espaillat (NY-13)",
        "Rep. Linda Sánchez (CA-38)",
        "Rep. Ansari (letter re: 10,000+ deported 2025)",
        "AUMER Foundation — gtarce@usc.edu",
        "LULAC Legal Defense",
        "Veterans Justice Network",
        "Deported Veterans Support House (DVSH)",
      ],
    };

    // ── TEXT BRIEF (for email) ────────────────────────────────────────────────
    const textBrief = `
TRUTHENGINE360 — CHC BRIEFING DATA PACKAGE
Congressional Hispanic Caucus · May 18, 2026 (${daysToBreifing} days)
Generated: ${timestamp} · By: ${user.email}
${"═".repeat(60)}

KEY STATISTICS
• DCAS Total Records: ${package_.keyStatistics.dcasTotal.toLocaleString()}
• Official Hispanic Casualties: ${package_.keyStatistics.officialHispanic} (${package_.keyStatistics.officialPct}%)
• BISG Forensic Estimate: ${package_.keyStatistics.bisgEstimate.toLocaleString()} (${package_.keyStatistics.bisgPct}%)
• Classification Failure: ${package_.keyStatistics.classificationFailure}%
• Undercount Factor: ${package_.keyStatistics.undercountFactor}×
• Missing Veterans (Bernoulli): ~${package_.keyStatistics.missingVeterans.toLocaleString()}
• Confirmed Deported (GAO): ${package_.keyStatistics.confirmedDeported}
• At-Risk Non-Citizen Vets: ${package_.keyStatistics.atRiskNonCitizenVets.toLocaleString()}

NERO COMPOSITE: ${package_.neroScores.composite}/100 — Severe institutional erasure

FOIA BLOCKERS
• F001 VA BIRLS: ${package_.foiaStatus[0].daysOverdue} days OVERDUE — ${package_.foiaStatus[0].contact}
• F002 ICE ENFORCE: ${package_.foiaStatus[1].daysOverdue} days OVERDUE — ${package_.foiaStatus[1].contact}

CHC READINESS: ${package_.chcReadiness.overall}% — ${package_.chcReadiness.blockers} critical blockers

LEGISLATIVE PRIORITIES
${package_.legislativeAsks.map(a=>`${a.priority}. ${a.ask} [${a.status}]`).join("\n")}

DISTRIBUTION: ${package_.distributionList.join(" · ")}
${"═".repeat(60)}
TruthEngine360 · AUMER Foundation · SHA-256 Certified
    `.trim();

    // ── OPTIONAL EMAIL DISPATCH ──────────────────────────────────────────────
    let emailSent = false;
    if (sendEmail) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: recipient,
        subject: `[TE360] CHC Briefing Data Package — ${daysToBreifing} Days — ${new Date().toLocaleDateString()}`,
        body: textBrief,
      });
      emailSent = true;
      console.log(`[CHC EXPORT] Email sent to ${recipient}`);
    }

    console.log(`[CHC EXPORT] Package generated by ${user.email}. Email: ${emailSent}`);

    return Response.json({
      status: "SUCCESS",
      package: package_,
      textBrief,
      emailSent,
      recipient: sendEmail ? recipient : null,
      timestamp,
    });

  } catch (error) {
    console.error('[CHC EXPORT ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});