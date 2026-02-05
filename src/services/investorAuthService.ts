import { getFunctions, httpsCallable } from 'firebase/functions';
import { ensureFirebase, isFirebaseReady } from '../firebase/config';
import { InvestorSession } from '../types/investorAuth';

const SESSION_STORAGE_KEY = 'investor_session_token';

// Cloud Functions references (lazy loaded)
let sendVerificationCodeFunction: any = null;
let verifyCodeFunction: any = null;

const loadFunctions = async () => {
  await ensureFirebase();
  
  if (!isFirebaseReady()) {
    throw new Error('Firebase not available');
  }

  if (!sendVerificationCodeFunction || !verifyCodeFunction) {
    try {
      const functionsModule = await import('firebase/functions');
      const { getFirebaseApp } = await import('../firebase/config');
      const app = getFirebaseApp();
      
      if (!app) {
        throw new Error('Firebase app not initialized');
      }
      
      const functions = getFunctions(app);
      sendVerificationCodeFunction = httpsCallable(functions, 'sendInvestorVerificationCode');
      verifyCodeFunction = httpsCallable(functions, 'verifyInvestorCode');
    } catch (error) {
      console.error('[Investor Auth] Failed to load Cloud Functions:', error);
      throw new Error('Cloud Functions not available');
    }
  }
};

export const investorAuthService = {
  // Solicitar código de verificación
  async requestVerificationCode(email: string): Promise<void> {
    await loadFunctions();

    try {
      const result = await sendVerificationCodeFunction({ email });
      console.log('[Investor Auth] Verification code sent:', result.data);
    } catch (error: any) {
      console.error('[Investor Auth] Error sending verification code:', error);
      throw new Error(error.message || 'Failed to send verification code');
    }
  },

  // Verificar código y crear sesión
  async verifyCode(email: string, code: string): Promise<InvestorSession> {
    await loadFunctions();

    try {
      const result = await verifyCodeFunction({ email, code });
      const session: InvestorSession = result.data;
      
      // Guardar sesión en localStorage
      localStorage.setItem(SESSION_STORAGE_KEY, session.sessionToken);
      
      return session;
    } catch (error: any) {
      console.error('[Investor Auth] Error verifying code:', error);
      throw new Error(error.message || 'Invalid verification code');
    }
  },

  // Obtener sesión actual
  getInvestorSession(): InvestorSession | null {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!token) return null;

    // La sesión completa se obtiene del servidor cuando se necesita
    // Por ahora solo retornamos el token
    return {
      sessionToken: token,
      leadId: '', // Se obtiene del servidor
      email: '',
      expiresAt: new Date(),
      createdAt: new Date(),
    };
  },

  // Limpiar sesión
  clearInvestorSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  },

  // Verificar si hay sesión activa
  hasActiveSession(): boolean {
    return !!this.getInvestorSession();
  },
};
