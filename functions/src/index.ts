import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Resend } from 'resend';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Resend
// Try to get API key from Firebase config first, then from environment variable
let resendApiKey: string | undefined;
try {
  resendApiKey = functions.config().resend?.api_key;
} catch (error) {
  // Config not set, try environment variable
  resendApiKey = process.env.RESEND_API_KEY;
}

if (!resendApiKey) {
  console.warn('Resend API key not configured. Emails will fail.');
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

// HTML Email Template
const createEmailTemplate = (
  leadName: string,
  leadEmail: string,
  leadFirm: string,
  subject: string,
  body: string,
  documents: Array<{ name: string; description?: string }>,
  dataRoomUrl?: string
): string => {
  const documentList = documents.length > 0
    ? `
      <div style="margin: 20px 0;">
        <h3 style="color: #0369a1; margin-bottom: 10px;">📄 Shared Documents:</h3>
        <ul style="list-style: none; padding: 0;">
          ${documents.map(doc => `
            <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
              <strong>${doc.name}</strong>
              ${doc.description ? `<br><span style="color: #6b7280; font-size: 14px;">${doc.description}</span>` : ''}
            </li>
          `).join('')}
        </ul>
      </div>
    `
    : '';

  const dataRoomLink = dataRoomUrl
    ? `
      <div style="margin: 30px 0; text-align: center;">
        <a href="${dataRoomUrl}" 
           style="background-color: #0284c7; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block; 
                  font-weight: 600;">
          Access Data Room
        </a>
      </div>
    `
    : '';

  // Convert plain text body to HTML (preserve line breaks and replace variables)
  const htmlBody = body
    .replace(/\n/g, '<br>')
    .replace(/\{\{name\}\}/g, leadName)
    .replace(/\{\{firm\}\}/g, leadFirm)
    .replace(/\{\{email\}\}/g, leadEmail);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                   line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px;">
          <!-- Header -->
          <div style="border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #0284c7; margin: 0; font-size: 28px;">InvestiaFlow</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Fundraising CRM</p>
          </div>

          <!-- Greeting -->
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${leadName},</h2>

          <!-- Body -->
          <div style="color: #374151; font-size: 16px; margin: 20px 0;">
            ${htmlBody}
          </div>

          <!-- Documents List -->
          ${documentList}

          <!-- Data Room Link -->
          ${dataRoomLink}

          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; 
                      color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">Best regards,<br><strong>InvestiaFlow Team</strong></p>
            <p style="margin: 10px 0 0 0; font-size: 12px;">
              This email was sent to ${leadEmail} regarding ${leadFirm}
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// HTTP Callable Function to send document email
export const sendDocumentEmail = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to send emails'
    );
  }

  const {
    to,
    subject,
    body,
    leadName,
    leadEmail,
    leadFirm,
    documents,
    dataRoomUrl,
    fromEmail,
  } = data;

  // Validate required fields
  if (!to || !subject || !body || !leadName || !leadEmail) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required fields: to, subject, body, leadName, leadEmail'
    );
  }

  if (!resend) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Resend API key not configured. Please set resend.api_key in Firebase config.'
    );
  }

  try {
    // Create HTML email template
    const html = createEmailTemplate(
      leadName,
      leadEmail,
      leadFirm || '',
      subject,
      body,
      documents || [],
      dataRoomUrl
    );

    // Send email via Resend
    const result = await resend.emails.send({
      from: fromEmail || 'sebas@investia.capital',
      to,
      subject,
      html,
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      throw new functions.https.HttpsError(
        'internal',
        result.error.message || 'Failed to send email'
      );
    }

    console.log('Email sent successfully:', result.data);

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error: any) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to send email'
    );
  }
});
