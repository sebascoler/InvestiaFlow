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

// Helper function to generate 6-digit verification code
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to generate session token
const generateSessionToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Helper function to get lead by email
const getLeadByEmail = async (email: string): Promise<any | null> => {
  const db = admin.firestore();
  const leadsSnapshot = await db.collection('leads')
    .where('email', '==', email.toLowerCase())
    .limit(1)
    .get();
  
  if (leadsSnapshot.empty) {
    return null;
  }
  
  return { id: leadsSnapshot.docs[0].id, ...leadsSnapshot.docs[0].data() };
};

// Helper function to check if lead has shared documents
const leadHasSharedDocuments = async (leadId: string): Promise<boolean> => {
  const db = admin.firestore();
  const sharedSnapshot = await db.collection('sharedDocuments')
    .where('leadId', '==', leadId)
    .limit(1)
    .get();
  
  return !sharedSnapshot.empty;
};

// Send verification code to investor email
export const sendInvestorVerificationCode = functions.https.onCall(async (data, context) => {
  const { email } = data;

  if (!email || typeof email !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email is required'
    );
  }

  try {
    // Find lead by email
    const lead = await getLeadByEmail(email);
    if (!lead) {
      throw new functions.https.HttpsError(
        'not-found',
        'No account found with this email address'
      );
    }

    // Check if lead has shared documents
    const hasDocuments = await leadHasSharedDocuments(lead.id);
    if (!hasDocuments) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'No documents have been shared with this email address yet'
      );
    }

    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes expiration

    // Delete any existing codes for this email
    const db = admin.firestore();
    const existingCodesSnapshot = await db.collection('investorVerificationCodes')
      .where('email', '==', email.toLowerCase())
      .get();
    
    const deletePromises = existingCodesSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    // Create new verification code
    const codeId = `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await db.collection('investorVerificationCodes').doc(codeId).set({
      email: email.toLowerCase(),
      code,
      leadId: lead.id,
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send email with verification code
    if (!resend) {
      console.warn('Resend not configured, verification code:', code);
      return { success: true, code: code }; // For development
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                     line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px;">
            <div style="border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px;">
              <h1 style="color: #0284c7; margin: 0; font-size: 28px;">InvestiaFlow</h1>
              <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Investor Data Room</p>
            </div>
            
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${lead.name},</h2>
            
            <p style="color: #374151; font-size: 16px; margin: 20px 0;">
              Your verification code to access the Data Room is:
            </p>
            
            <div style="background-color: #f3f4f6; border: 2px dashed #0284c7; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0284c7; font-family: monospace;">
                ${code}
              </div>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin: 20px 0;">
              This code will expire in 15 minutes. If you didn't request this code, please ignore this email.
            </p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; 
                        color: #6b7280; font-size: 14px;">
              <p style="margin: 0;">Best regards,<br><strong>InvestiaFlow Team</strong></p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'sebas@investia.capital',
      to: email,
      subject: 'Your InvestiaFlow Data Room Access Code',
      html: emailHtml,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error sending verification code:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to send verification code'
    );
  }
});

// Verify investor code and create session
export const verifyInvestorCode = functions.https.onCall(async (data, context) => {
  const { email, code } = data;

  if (!email || !code || typeof email !== 'string' || typeof code !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email and code are required'
    );
  }

  try {
    const db = admin.firestore();
    
    // Find verification code
    const codesSnapshot = await db.collection('investorVerificationCodes')
      .where('email', '==', email.toLowerCase())
      .where('code', '==', code)
      .limit(1)
      .get();

    if (codesSnapshot.empty) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid verification code'
      );
    }

    const codeDoc = codesSnapshot.docs[0];
    const codeData = codeDoc.data();

    // Check expiration
    const expiresAt = codeData.expiresAt.toDate();
    if (expiresAt < new Date()) {
      await codeDoc.ref.delete();
      throw new functions.https.HttpsError(
        'deadline-exceeded',
        'Verification code has expired'
      );
    }

    // Delete used code
    await codeDoc.ref.delete();

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAtSession = new Date();
    expiresAtSession.setDate(expiresAtSession.getDate() + 7); // 7 days expiration

    await db.collection('investorSessions').doc(sessionToken).set({
      leadId: codeData.leadId,
      email: email.toLowerCase(),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAtSession),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      sessionToken,
      leadId: codeData.leadId,
      email: email.toLowerCase(),
      expiresAt: expiresAtSession.toISOString(),
    };
  } catch (error: any) {
    console.error('Error verifying code:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to verify code'
    );
  }
});

// Helper function to validate session
const validateSession = async (sessionToken: string): Promise<any> => {
  const db = admin.firestore();
  const sessionDoc = await db.collection('investorSessions').doc(sessionToken).get();

  if (!sessionDoc.exists) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Invalid session'
    );
  }

  const sessionData = sessionDoc.data()!;
  const expiresAt = sessionData.expiresAt.toDate();

  if (expiresAt < new Date()) {
    await sessionDoc.ref.delete();
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Session expired'
    );
  }

  return sessionData;
};

// Get investor documents
export const getInvestorDocuments = functions.https.onCall(async (data, context) => {
  const { sessionToken } = data;

  if (!sessionToken) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Session token is required'
    );
  }

  try {
    const session = await validateSession(sessionToken);
    const db = admin.firestore();

    // Get shared documents for this lead
    const sharedDocsSnapshot = await db.collection('sharedDocuments')
      .where('leadId', '==', session.leadId)
      .get();

    if (sharedDocsSnapshot.empty) {
      return [];
    }

    // Get document details
    const documentPromises = sharedDocsSnapshot.docs.map(async (sharedDoc) => {
      const sharedData = sharedDoc.data();
      const docSnapshot = await db.collection('documents').doc(sharedData.documentId).get();
      
      if (!docSnapshot.exists) {
        return null;
      }

      const docData = docSnapshot.data()!;
      return {
        id: sharedDoc.id,
        documentId: sharedData.documentId,
        name: docData.name,
        category: docData.category,
        description: docData.description,
        fileSize: docData.fileSize,
        fileType: docData.fileType,
        uploadedAt: docData.uploadedAt?.toDate().toISOString(),
        sharedAt: sharedData.sharedAt?.toDate().toISOString(),
        viewedAt: sharedData.viewedAt?.toDate().toISOString() || null,
        downloadedAt: sharedData.downloadedAt?.toDate().toISOString() || null,
        downloadUrl: docData.downloadUrl || null,
      };
    });

    const documents = await Promise.all(documentPromises);
    return documents.filter(doc => doc !== null);
  } catch (error: any) {
    console.error('Error getting investor documents:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to get documents'
    );
  }
});

// Get document download URL
export const getInvestorDocumentDownloadUrl = functions.https.onCall(async (data, context) => {
  const { sessionToken, documentId } = data;

  if (!sessionToken || !documentId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Session token and document ID are required'
    );
  }

  try {
    const session = await validateSession(sessionToken);
    const db = admin.firestore();

    // Verify document is shared with this lead
    const sharedDocSnapshot = await db.collection('sharedDocuments')
      .where('leadId', '==', session.leadId)
      .where('documentId', '==', documentId)
      .limit(1)
      .get();

    if (sharedDocSnapshot.empty) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Document not shared with this lead'
      );
    }

    // Get document
    const docSnapshot = await db.collection('documents').doc(documentId).get();
    if (!docSnapshot.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Document not found'
      );
    }

    const docData = docSnapshot.data()!;
    
    // If downloadUrl exists, return it
    if (docData.downloadUrl) {
      return { downloadUrl: docData.downloadUrl };
    }

    // Otherwise, generate signed URL from storage path
    if (docData.storagePath) {
      const bucket = admin.storage().bucket();
      const file = bucket.file(docData.storagePath);
      
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 3600000, // 1 hour
      });

      return { downloadUrl: url };
    }

    throw new functions.https.HttpsError(
      'failed-precondition',
      'Document download URL not available'
    );
  } catch (error: any) {
    console.error('Error getting download URL:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to get download URL'
    );
  }
});

// Mark document as viewed
export const markInvestorDocumentViewed = functions.https.onCall(async (data, context) => {
  const { sessionToken, documentId } = data;

  if (!sessionToken || !documentId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Session token and document ID are required'
    );
  }

  try {
    const session = await validateSession(sessionToken);
    const db = admin.firestore();

    // Find shared document
    const sharedDocSnapshot = await db.collection('sharedDocuments')
      .where('leadId', '==', session.leadId)
      .where('documentId', '==', documentId)
      .limit(1)
      .get();

    if (sharedDocSnapshot.empty) {
      throw new functions.https.HttpsError(
        'not-found',
        'Document not shared with this lead'
      );
    }

    const sharedDoc = sharedDocSnapshot.docs[0];
    const sharedData = sharedDoc.data();

    // Update viewedAt if not already set
    if (!sharedData.viewedAt) {
      await sharedDoc.ref.update({
        viewedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Create notification for the document owner
      try {
        // Get lead and document info
        const leadDoc = await db.collection('leads').doc(session.leadId).get();
        const docDoc = await db.collection('documents').doc(documentId).get();
        
        if (leadDoc.exists && docDoc.exists) {
          const leadData = leadDoc.data()!;
          const docData = docDoc.data()!;
          
          // Create notification
          await db.collection('notifications').add({
            userId: docData.userId,
            type: 'investor_viewed',
            title: 'Document Viewed',
            message: `${leadData.name || leadData.email} viewed "${docData.name}"`,
            leadId: session.leadId,
            leadName: leadData.name || leadData.email,
            documentId: documentId,
            documentName: docData.name,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            actionUrl: `/crm?leadId=${session.leadId}`,
          });
        }
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
        // Don't fail the main operation if notification fails
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error marking document as viewed:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to mark document as viewed'
    );
  }
});

// Mark document as downloaded
export const markInvestorDocumentDownloaded = functions.https.onCall(async (data, context) => {
  const { sessionToken, documentId } = data;

  if (!sessionToken || !documentId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Session token and document ID are required'
    );
  }

  try {
    const session = await validateSession(sessionToken);
    const db = admin.firestore();

    // Find shared document
    const sharedDocSnapshot = await db.collection('sharedDocuments')
      .where('leadId', '==', session.leadId)
      .where('documentId', '==', documentId)
      .limit(1)
      .get();

    if (sharedDocSnapshot.empty) {
      throw new functions.https.HttpsError(
        'not-found',
        'Document not shared with this lead'
      );
    }

    const sharedDoc = sharedDocSnapshot.docs[0];
    const sharedData = sharedDoc.data();

    // Update downloadedAt and viewedAt if not set
    const updates: any = {
      downloadedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (!sharedData.viewedAt) {
      updates.viewedAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await sharedDoc.ref.update(updates);

    // Create notification for the document owner
    try {
      // Get lead and document info
      const leadDoc = await db.collection('leads').doc(session.leadId).get();
      const docDoc = await db.collection('documents').doc(documentId).get();
      
      if (leadDoc.exists && docDoc.exists) {
        const leadData = leadDoc.data()!;
        const docData = docDoc.data()!;
        
        // Create notification
        await db.collection('notifications').add({
          userId: docData.userId,
          type: 'investor_downloaded',
          title: 'Document Downloaded',
          message: `${leadData.name || leadData.email} downloaded "${docData.name}"`,
          leadId: session.leadId,
          leadName: leadData.name || leadData.email,
          documentId: documentId,
          documentName: docData.name,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          actionUrl: `/crm?leadId=${session.leadId}`,
        });
      }
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
      // Don't fail the main operation if notification fails
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error marking document as downloaded:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to mark document as downloaded'
    );
  }
});

// Send team invitation email
export const sendTeamInvitationEmail = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to send invitation emails'
    );
  }

  const { invitationId, teamName, inviterName } = data;

  if (!invitationId || !teamName || !inviterName) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required fields: invitationId, teamName, inviterName'
    );
  }

  if (!resend) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Resend API key not configured'
    );
  }

  try {
    const db = admin.firestore();
    const invitationDoc = await db.collection('teamInvitations').doc(invitationId).get();
    
    if (!invitationDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Invitation not found');
    }

    const invitation = invitationDoc.data()!;
    const appUrl = process.env.APP_URL || 'https://investiaflow.com';
    const inviteUrl = `${appUrl}/invite/${invitation.token}`;

    const emailHtml = `
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
              <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Team Invitation</p>
            </div>

            <!-- Greeting -->
            <h2 style="color: #1f2937; margin-top: 0;">You've been invited!</h2>

            <!-- Body -->
            <div style="color: #374151; font-size: 16px; margin: 20px 0;">
              <p>
                <strong>${inviterName}</strong> has invited you to join the team <strong>${teamName}</strong> on InvestiaFlow.
              </p>
              <p>
                Click the button below to accept the invitation and start collaborating:
              </p>
            </div>

            <!-- CTA Button -->
            <div style="margin: 30px 0; text-align: center;">
              <a href="${inviteUrl}" 
                 style="background-color: #0284c7; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; display: inline-block; 
                        font-weight: 600;">
                Accept Invitation
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              Or copy and paste this link into your browser:<br>
              <a href="${inviteUrl}" style="color: #0284c7; word-break: break-all;">${inviteUrl}</a>
            </p>

            <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
              This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
            </p>

            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; 
                        color: #6b7280; font-size: 14px;">
              <p style="margin: 0;">Best regards,<br><strong>InvestiaFlow Team</strong></p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'InvestiaFlow <noreply@investia.capital>',
      to: invitation.email,
      subject: `You've been invited to join ${teamName} on InvestiaFlow`,
      html: emailHtml,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error sending invitation email:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to send invitation email'
    );
  }
});
