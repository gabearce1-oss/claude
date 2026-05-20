import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * FOIA Status Notifier
 * 
 * Sends automated email updates to veterans when FOIA request status changes
 * Triggered on FOIA request updates (filed → in_progress → received → denied)
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      foia_request_id,
      old_status,
      new_status,
      agency_name,
      request_title,
      deadline_date,
      veteran_email,
      veteran_name
    } = await req.json();

    if (!foia_request_id || !new_status || !veteran_email) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // ========================================================================
    // Build Email Content Based on Status Change
    // ========================================================================

    const statusMessages = {
      filed: {
        subject: 'FOIA Request Filed',
        title: '📋 Your FOIA Request Has Been Filed',
        message: `Your Freedom of Information Act (FOIA) request to ${agency_name} has been officially filed.`,
        details: [
          `Request: ${request_title}`,
          `Status: Submitted`,
          `Deadline: ${new Date(deadline_date).toLocaleDateString()}`,
          `Next steps: Agency will review and provide status updates within the statutory timeframe (typically 20 business days).`
        ]
      },
      in_progress: {
        subject: 'FOIA Request In Progress',
        title: '⏳ Your FOIA Request Is Being Processed',
        message: `${agency_name} is actively reviewing your FOIA request.`,
        details: [
          `Request: ${request_title}`,
          `Status: In Progress`,
          `Expected completion: ${new Date(deadline_date).toLocaleDateString()}`,
          `The agency is gathering responsive documents and may contact you for clarification if needed.`
        ]
      },
      received: {
        subject: '✓ FOIA Records Received',
        title: '✓ Your FOIA Records Have Been Received',
        message: `The requested records from ${agency_name} have been delivered.`,
        details: [
          `Request: ${request_title}`,
          `Status: Completed`,
          `Records are available for download and review`,
          `Next steps: Review the documents. If you have questions about redactions or missing information, you can file an appeal.`
        ]
      },
      denied: {
        subject: '⚠️ FOIA Request Denied',
        title: '⚠️ Your FOIA Request Has Been Denied',
        message: `${agency_name} has denied your FOIA request.`,
        details: [
          `Request: ${request_title}`,
          `Status: Denied`,
          `Reason: Check the agency response for specific legal exemptions cited`,
          `Your rights: You have the right to appeal this denial within 90 days. Contact us for appeal assistance.`
        ]
      },
      pending: {
        subject: 'FOIA Request Pending',
        title: '⏳ FOIA Request Status: Pending',
        message: `Your FOIA request to ${agency_name} is pending further action.`,
        details: [
          `Request: ${request_title}`,
          `Status: Awaiting action from agency`,
          `Deadline: ${new Date(deadline_date).toLocaleDateString()}`,
          `We'll update you as soon as we receive new information.`
        ]
      }
    };

    const statusInfo = statusMessages[new_status] || statusMessages.pending;

    const emailBody = `
Dear ${veteran_name},

${statusInfo.message}

REQUEST DETAILS:
${statusInfo.details.map(detail => `• ${detail}`).join('\n')}

WHAT TO DO NEXT:
${
  new_status === 'received'
    ? '1. Download and review the provided documents\n2. Contact us if you need help interpreting the records\n3. Consider filing a follow-up request for any missing information'
    : new_status === 'denied'
    ? '1. Review the denial reason carefully\n2. Contact us to discuss appeal options\n3. We can help file an administrative appeal'
    : new_status === 'filed'
    ? '1. Save this confirmation for your records\n2. Expect updates via email as the status changes\n3. Contact us if the agency needs clarification'
    : '1. Check back regularly for updates\n2. Contact us if you have questions\n3. We are tracking this request and will notify you of any changes'
}

QUESTIONS?
Contact AUMER Foundation:
- Email: research@albavoice.org
- Phone: [phone number]
- Website: https://albavoice.org

Reference ID: ${foia_request_id}

---
This is an automated notification from TruthEngine360 FOIA Tracking System.
Change your notification preferences at: [dashboard link]
`;

    // ========================================================================
    // Send Email via Base44 Core Integration
    // ========================================================================

    const emailResponse = await base44.integrations.Core.SendEmail({
      to: veteran_email,
      subject: statusInfo.subject,
      body: emailBody,
      from_name: 'AUMER Foundation FOIA Team'
    });

    // ========================================================================
    // Log Email Activity
    // ========================================================================

    return Response.json({
      status: 'success',
      foia_request_id,
      email_sent: true,
      recipient: veteran_email,
      status_change: `${old_status} → ${new_status}`,
      subject: statusInfo.subject,
      timestamp: new Date().toISOString(),
      response: emailResponse
    });

  } catch (error) {
    console.error('Email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});