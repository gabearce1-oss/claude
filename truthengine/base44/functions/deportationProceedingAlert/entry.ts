import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data, old_data, changed_fields } = body;

    // Build a clear subject line based on what changed
    const subjectName = data?.subject_name || "Unknown Subject";
    const caseId = data?.case_file_id || "N/A";
    const newStatus = data?.review_state || "Unknown";
    const oldStatus = old_data?.review_state || "N/A";
    const newCharge = data?.charge_type || "Unknown";
    const oldCharge = old_data?.charge_type || "N/A";

    const changedItems = [];
    if (changed_fields?.includes("review_state") && oldStatus !== newStatus) {
      changedItems.push(`Review State: ${oldStatus} → ${newStatus}`);
    }
    if (changed_fields?.includes("charge_type") && oldCharge !== newCharge) {
      changedItems.push(`Charge Type: ${oldCharge} → ${newCharge}`);
    }
    if (changed_fields?.includes("deportation_date")) {
      changedItems.push(`Deportation Date updated: ${data?.deportation_date || "set"}`);
    }
    if (changed_fields?.includes("removal_order_date")) {
      changedItems.push(`Removal Order Date updated: ${data?.removal_order_date || "set"}`);
    }
    if (changed_fields?.includes("appeal_outcome")) {
      changedItems.push(`Appeal Outcome: ${old_data?.appeal_outcome || "—"} → ${data?.appeal_outcome || "—"}`);
    }
    if (changed_fields?.includes("ice_hq_review")) {
      changedItems.push(`ICE HQ Review: ${old_data?.ice_hq_review || "—"} → ${data?.ice_hq_review || "—"}`);
    }

    if (changedItems.length === 0) {
      // No tracked fields changed
      return Response.json({ skipped: true, reason: "No tracked fields changed" });
    }

    const subject = `[TE360 ALERT] Proceeding Update — ${subjectName} (${caseId})`;

    const urgencyFlag = newStatus === "Confirmed" ? "🔴 CONFIRMED" :
                        newStatus === "Disputed" ? "⚠️ DISPUTED" :
                        newStatus === "Under Review" ? "🔵 UNDER REVIEW" :
                        newStatus === "Archived" ? "🗄️ ARCHIVED" : "📋 UPDATED";

    const body_text = `
TRUTHENGINE 360 — DEPORTATION PROCEEDING ALERT
${urgencyFlag}
${"═".repeat(60)}

CASE FILE ID:    ${caseId}
SUBJECT:         ${subjectName}
EOIR CASE #:     ${data?.eoir_case_number || "N/A"}
CHARGE TYPE:     ${newCharge}
COURT LOCATION:  ${data?.court_location || "N/A"}

━━━ CHANGES DETECTED ━━━
${changedItems.map(c => `  • ${c}`).join("\n")}

━━━ CURRENT STATE ━━━
  Review State:          ${newStatus}
  Charge:                ${newCharge}
  Charge Statute:        ${data?.charge_statute || "N/A"}
  Retroactive IIRIRA:    ${data?.retroactive_iirira ? "YES" : "No"}
  Deportation Date:      ${data?.deportation_date || "Not yet set"}
  Removal Order Date:    ${data?.removal_order_date || "Not yet set"}
  Appeal Filed:          ${data?.appeal_filed ? "Yes" : "No"}
  Appeal Outcome:        ${data?.appeal_outcome || "N/A"}
  ICE HQ Review:         ${data?.ice_hq_review || "N/A"}
  Military Service Raised: ${data?.military_service_raised ? "YES" : "No"}
  INA §329 Claim:        ${data?.ina_329_claim ? "YES" : "No"}
  Confidence Score:      ${data?.confidence_score ?? "N/A"}%

━━━ ANALYST NOTES ━━━
${data?.analyst_notes || "(none)"}

${"═".repeat(60)}
Generated: ${new Date().toISOString()}
TruthEngine360 — AUMER Foundation Forensic Intelligence Platform
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: "gbearce1@gmail.com",
      subject,
      body: body_text,
      from_name: "TruthEngine360 Alerts",
    });

    return Response.json({
      success: true,
      case_id: caseId,
      subject_name: subjectName,
      changes: changedItems,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});