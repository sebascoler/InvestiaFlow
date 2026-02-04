// Helper functions for Firestore operations
// Only available when Firebase is configured
import { db, isFirebaseReady, ensureFirebase } from './config';

// Re-export types if Firebase is available
let Timestamp: any = null;
let collection: any = null;
let doc: any = null;
let query: any = null;
let where: any = null;
let orderBy: any = null;
let getDoc: any = null;
let getDocs: any = null;
let setDoc: any = null;
let updateDoc: any = null;
let deleteDoc: any = null;

// Lazy load Firestore functions
const loadFirestore = async () => {
  if (!isFirebaseReady()) {
    await ensureFirebase();
  }
  
  if (isFirebaseReady() && !collection) {
    try {
      const firestoreModule = await import('firebase/firestore');
      Timestamp = firestoreModule.Timestamp;
      collection = firestoreModule.collection;
      doc = firestoreModule.doc;
      query = firestoreModule.query;
      where = firestoreModule.where;
      orderBy = firestoreModule.orderBy;
      getDoc = firestoreModule.getDoc;
      getDocs = firestoreModule.getDocs;
      setDoc = firestoreModule.setDoc;
      updateDoc = firestoreModule.updateDoc;
      deleteDoc = firestoreModule.deleteDoc;
    } catch (error) {
      console.warn('Firestore not available');
    }
  }
};

// Convert Firestore Timestamp to Date
export const timestampToDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  if (Timestamp && timestamp instanceof Timestamp) return timestamp.toDate();
  return null;
};

// Convert Date to Firestore Timestamp
export const dateToTimestamp = (date: Date | null | undefined): any => {
  if (!date || !Timestamp) return null;
  return Timestamp.fromDate(date instanceof Date ? date : new Date(date));
};

// Helper to convert Firestore document to typed object
export const docToData = <T>(docSnap: any, idField: string = 'id'): T => {
  const data = docSnap.data();
  return {
    ...data,
    [idField]: docSnap.id,
  } as T;
};

// Generic CRUD operations
export const firestoreService = {
  // Get single document
  async getDoc<T>(collectionName: string, docId: string): Promise<T | null> {
    await loadFirestore();
    const dbInstance = db();
    if (!isFirebaseReady() || !dbInstance || !doc || !getDoc) {
      throw new Error('Firestore not available');
    }
    
    const docRef = doc(dbInstance, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return docToData<T>(docSnap);
  },

  // Get multiple documents with optional query
  async getDocs<T>(
    collectionName: string, 
    constraints: any[] = []
  ): Promise<T[]> {
    await loadFirestore();
    const dbInstance = db();
    if (!isFirebaseReady() || !dbInstance || !collection || !query || !getDocs) {
      throw new Error('Firestore not available');
    }
    
    const collectionRef = collection(dbInstance, collectionName);
    const q = constraints.length > 0 
      ? query(collectionRef, ...constraints)
      : query(collectionRef);
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc: any) => docToData<T>(doc));
  },

  // Create or update document
  async setDoc(collectionName: string, docId: string, data: any): Promise<void> {
    await loadFirestore();
    const dbInstance = db();
    if (!isFirebaseReady() || !dbInstance || !doc || !setDoc) {
      throw new Error('Firestore not available');
    }
    
    const docRef = doc(dbInstance, collectionName, docId);
    await setDoc(docRef, data, { merge: true });
  },

  // Update document
  async updateDoc(collectionName: string, docId: string, data: Partial<any>): Promise<void> {
    await loadFirestore();
    const dbInstance = db();
    if (!isFirebaseReady() || !dbInstance || !doc || !updateDoc) {
      throw new Error('Firestore not available');
    }
    
    const docRef = doc(dbInstance, collectionName, docId);
    await updateDoc(docRef, data);
  },

  // Delete document
  async deleteDoc(collectionName: string, docId: string): Promise<void> {
    await loadFirestore();
    const dbInstance = db();
    if (!isFirebaseReady() || !dbInstance || !doc || !deleteDoc) {
      throw new Error('Firestore not available');
    }
    
    const docRef = doc(dbInstance, collectionName, docId);
    await deleteDoc(docRef);
  },
};

// Export Firestore utilities (may be null if Firebase not configured)
export { collection, doc, query, where, orderBy, Timestamp };
