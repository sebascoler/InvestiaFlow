import { getFunctions, httpsCallable } from 'firebase/functions';
import { ensureFirebase, isFirebaseReady } from '../firebase/config';
import { InvestorDocument } from '../types/investorAuth';
import { investorAuthService } from './investorAuthService';

// Cloud Functions references (lazy loaded)
let getInvestorDocumentsFunction: any = null;
let getDocumentDownloadUrlFunction: any = null;
let markDocumentViewedFunction: any = null;
let markDocumentDownloadedFunction: any = null;

const loadFunctions = async () => {
  await ensureFirebase();
  
  if (!isFirebaseReady()) {
    throw new Error('Firebase not available');
  }

  if (!getInvestorDocumentsFunction) {
    try {
      const functionsModule = await import('firebase/functions');
      const { getFirebaseApp } = await import('../firebase/config');
      const app = getFirebaseApp();
      
      if (!app) {
        throw new Error('Firebase app not initialized');
      }
      
      const functions = getFunctions(app);
      getInvestorDocumentsFunction = httpsCallable(functions, 'getInvestorDocuments');
      getDocumentDownloadUrlFunction = httpsCallable(functions, 'getInvestorDocumentDownloadUrl');
      markDocumentViewedFunction = httpsCallable(functions, 'markInvestorDocumentViewed');
      markDocumentDownloadedFunction = httpsCallable(functions, 'markInvestorDocumentDownloaded');
    } catch (error) {
      console.error('[Investor Documents] Failed to load Cloud Functions:', error);
      throw new Error('Cloud Functions not available');
    }
  }
};

export const investorDocumentService = {
  // Obtener documentos compartidos con el lead
  async getInvestorDocuments(): Promise<InvestorDocument[]> {
    await loadFunctions();

    const session = investorAuthService.getInvestorSession();
    if (!session) {
      throw new Error('No active session');
    }

    try {
      const result = await getInvestorDocumentsFunction({
        sessionToken: session.sessionToken,
      });
      return result.data as InvestorDocument[];
    } catch (error: any) {
      console.error('[Investor Documents] Error getting documents:', error);
      throw new Error(error.message || 'Failed to get documents');
    }
  },

  // Obtener URL de descarga de un documento
  async getDocumentDownloadUrl(documentId: string): Promise<string> {
    await loadFunctions();

    const session = investorAuthService.getInvestorSession();
    if (!session) {
      throw new Error('No active session');
    }

    try {
      const result = await getDocumentDownloadUrlFunction({
        sessionToken: session.sessionToken,
        documentId,
      });
      return result.data.downloadUrl as string;
    } catch (error: any) {
      console.error('[Investor Documents] Error getting download URL:', error);
      throw new Error(error.message || 'Failed to get download URL');
    }
  },

  // Marcar documento como visto
  async markDocumentAsViewed(documentId: string): Promise<void> {
    await loadFunctions();

    const session = investorAuthService.getInvestorSession();
    if (!session) {
      throw new Error('No active session');
    }

    try {
      await markDocumentViewedFunction({
        sessionToken: session.sessionToken,
        documentId,
      });
    } catch (error: any) {
      console.error('[Investor Documents] Error marking as viewed:', error);
      // No lanzar error, solo loguear
    }
  },

  // Marcar documento como descargado
  async markDocumentAsDownloaded(documentId: string): Promise<void> {
    await loadFunctions();

    const session = investorAuthService.getInvestorSession();
    if (!session) {
      throw new Error('No active session');
    }

    try {
      await markDocumentDownloadedFunction({
        sessionToken: session.sessionToken,
        documentId,
      });
    } catch (error: any) {
      console.error('[Investor Documents] Error marking as downloaded:', error);
      // No lanzar error, solo loguear
    }
  },
};
