import { Lead } from '../types/lead';
import { Document } from '../types/document';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { ensureFirebase, isFirebaseReady } from '../firebase/config';

// Check if Firebase Functions is configured
const USE_CLOUD_FUNCTIONS = !!import.meta.env.VITE_FIREBASE_API_KEY;
const FROM_EMAIL = import.meta.env.VITE_RESEND_FROM_EMAIL || 'sebas@investia.capital';

// Cloud Function reference (lazy loaded)
let sendEmailFunction: any = null;

// Mock email service (for development/testing)
const emailServiceMock = {
  async sendDocumentEmail(
    to: string,
    subject: string,
    body: string,
    documentLinks: string[]
  ): Promise<void> {
    console.log('[Email Service] Mock email sent:', {
      to,
      subject,
      body,
      documentLinks,
    });
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
  },
};

// Cloud Functions email service
const emailServiceCloudFunctions = {
  async sendDocumentEmail(
    to: string,
    subject: string,
    body: string,
    documentLinks: string[],
    lead?: Lead,
    documents?: Document[],
    dataRoomUrl?: string,
    retries: number = 3
  ): Promise<void> {
    await ensureFirebase();
    
    if (!isFirebaseReady()) {
      throw new Error('Firebase not available');
    }

    if (!lead) {
      throw new Error('Lead information is required for email template');
    }

    // Load Cloud Functions
    if (!sendEmailFunction) {
      try {
        const functionsModule = await import('firebase/functions');
        const { getFirebaseApp } = await import('../firebase/config');
        const app = getFirebaseApp();
        
        if (!app) {
          throw new Error('Firebase app not initialized');
        }
        
        const functions = getFunctions(app);
        sendEmailFunction = httpsCallable(functions, 'sendDocumentEmail');
      } catch (error) {
        console.error('[Email Service] Failed to load Cloud Functions:', error);
        throw new Error('Cloud Functions not available');
      }
    }

    // Prepare documents data
    const documentsData = (documents || []).map(doc => ({
      name: doc.name,
      description: doc.description,
    }));

    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await sendEmailFunction({
          to,
          subject,
          body,
          leadName: lead.name,
          leadEmail: lead.email,
          leadFirm: lead.firm,
          documents: documentsData,
          dataRoomUrl,
          fromEmail: FROM_EMAIL,
          teamId: lead.teamId || null, // Pass teamId for branding
        });

        console.log('[Email Service] Email sent successfully via Cloud Functions:', result.data);
        return; // Success, exit retry loop
      } catch (error: any) {
        lastError = error;
        console.warn(`[Email Service] Attempt ${attempt}/${retries} failed:`, error.message);
        
        // Don't retry on certain errors (e.g., invalid email, authentication)
        if (
          error.message?.includes('Invalid') ||
          error.message?.includes('not found') ||
          error.code === 'unauthenticated' ||
          error.code === 'permission-denied'
        ) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Max 10 seconds
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    console.error('[Email Service] All retry attempts failed');
    throw lastError || new Error('Failed to send email after multiple attempts');
  },
};

// Export service that uses Cloud Functions if available, otherwise mock
export const emailService = {
  async sendDocumentEmail(
    to: string,
    subject: string,
    body: string,
    documentLinks: string[],
    lead?: Lead,
    documents?: Document[],
    dataRoomUrl?: string,
    retries?: number
  ): Promise<void> {
    // Try Cloud Functions first if Firebase is configured
    if (USE_CLOUD_FUNCTIONS) {
      try {
        return await emailServiceCloudFunctions.sendDocumentEmail(
          to,
          subject,
          body,
          documentLinks,
          lead,
          documents,
          dataRoomUrl,
          retries
        );
      } catch (error: any) {
        // If Cloud Functions fails, fall back to mock
        console.warn('[Email Service] Cloud Functions failed, using mock mode:', error.message);
        return emailServiceMock.sendDocumentEmail(to, subject, body, documentLinks);
      }
    }
    
    // Fallback to mock mode
    console.log('[Email Service] Using mock mode (Cloud Functions not configured)');
    return emailServiceMock.sendDocumentEmail(to, subject, body, documentLinks);
  },
};
