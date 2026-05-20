import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FOIA_REQUESTS = [
  { ref: "F001", agency: "VA BIRLS", filed: "2025-09-15", status: "OVERDUE" },
  { ref: "F002", agency: "ICE ENFORCE", filed: "2025-10-15", status: "OVERDUE" },
  { ref: "F003", agency: "COMAR (Mexico)", filed: "2025-11-01", status: "PENDING" },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Calculate overdue days and statuses
    const now = new Date();
    const tracking = FOIA_REQUESTS.map(f => {
      const filedDate = new Date(f.filed);
      const days = Math.floor((now - filedDate) / 86400000);

      return {
        ...f,
        totalDaysElapsed: days,
        currentDaysOverdue: days > 20 ? days - 20 : 0,
        daysRemaining: Math.max(0, 20 - days),
        isOverdue: days > 20,
        escalationLevel: days > 30 ? "CRITICAL" : days > 20 ? "HIGH" : "NORMAL",
      };
    });

    const critical = tracking.filter(t => t.escalationLevel === "CRITICAL");

    // Log critical alerts as KnowledgeFile records (works in scheduled context)
    if (critical.length > 0) {
      const alertNote = critical
        .map(c => `${c.ref} (${c.agency}): ${c.currentDaysOverdue} days overdue`)
        .join(" | ");

      await base44.asServiceRole.entities.KnowledgeFile.create({
        title: `[FOIA ALERT] ${critical.length} Critical FOIA Request(s) — ${new Date().toISOString().slice(0, 10)}`,
        category: "FOIA",
        description: `Automated FOIA Nexus Tracker alert. ${critical.length} request(s) critically overdue.`,
        notes: `Critical items: ${alertNote}\n\nFull tracking snapshot:\n${JSON.stringify(tracking, null, 2)}`,
        tags: "foia,alert,critical,automated",
      });
    }

    return Response.json({
      timestamp: now.toISOString(),
      foiaRequests: tracking,
      criticalCount: critical.length,
      escalationRecommended: critical.length > 0,
      alertLogged: critical.length > 0,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});