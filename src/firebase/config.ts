// Firebase configuration - lazy initialization to avoid errors when not configured

let app: any = null;
let authInstance: any = null;
let dbInstance: any = null;
let storageInstance: any = null;
let initializationPromise: Promise<void> | null = null;

// Check if Firebase is configured
const isFirebaseConfigured = () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  
  return !!(apiKey && authDomain && projectId && 
           apiKey.trim() !== '' && 
           authDomain.trim() !== '' && 
           projectId.trim() !== '');
};

// Initialize Firebase lazily
export const ensureFirebase = async (): Promise<void> => {
  // If already initialized or initializing, return
  if (app || initializationPromise) {
    return initializationPromise || Promise.resolve();
  }

  if (!isFirebaseConfigured()) {
    console.log('ℹ️ Firebase not configured, using mock mode');
    return Promise.resolve();
  }

  // Start initialization
  initializationPromise = (async () => {
    try {
      const { initializeApp, getApps } = await import('firebase/app');
      const { getAuth } = await import('firebase/auth');
      const { getFirestore } = await import('firebase/firestore');
      const { getStorage } = await import('firebase/storage');

      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };

      // Initialize Firebase
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }

      // Initialize services
      authInstance = getAuth(app);
      dbInstance = getFirestore(app);
      storageInstance = getStorage(app);
      
      console.log('✅ Firebase initialized successfully');
    } catch (error) {
      console.warn('⚠️ Firebase initialization failed, using mock mode:', error);
      app = null;
      authInstance = null;
      dbInstance = null;
      storageInstance = null;
      initializationPromise = null;
    }
  })();

  return initializationPromise;
};

export const auth = () => authInstance;
export const db = () => dbInstance;
export const storage = () => storageInstance;
export const isFirebaseReady = () => !!(app && authInstance && dbInstance);
export const getFirebaseApp = () => app;

export default app;
