// Helper functions for Firebase Storage operations
// Only available when Firebase is configured
import { storage, isFirebaseReady, ensureFirebase } from './config';

// Lazy load Storage functions
let ref: any = null;
let uploadBytes: any = null;
let getDownloadURL: any = null;
let deleteObject: any = null;

const loadStorage = async () => {
  if (!isFirebaseReady()) {
    await ensureFirebase();
  }
  
  if (isFirebaseReady() && !ref) {
    try {
      const storageModule = await import('firebase/storage');
      ref = storageModule.ref;
      uploadBytes = storageModule.uploadBytes;
      getDownloadURL = storageModule.getDownloadURL;
      deleteObject = storageModule.deleteObject;
    } catch (error) {
      console.warn('Storage not available');
    }
  }
};

export const storageService = {
  // Upload file
  async uploadFile(
    path: string, 
    file: File
  ): Promise<{ url: string; path: string }> {
    await loadStorage();
    const storageInstance = storage();
    
    if (!isFirebaseReady() || !storageInstance || !ref || !uploadBytes || !getDownloadURL) {
      throw new Error('Storage not available');
    }
    
    const storageRef = ref(storageInstance, path);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    
    return {
      url,
      path: snapshot.ref.fullPath,
    };
  },

  // Get download URL
  async getDownloadURL(path: string): Promise<string> {
    await loadStorage();
    const storageInstance = storage();
    
    if (!isFirebaseReady() || !storageInstance || !ref || !getDownloadURL) {
      throw new Error('Storage not available');
    }
    
    const storageRef = ref(storageInstance, path);
    return await getDownloadURL(storageRef);
  },

  // Delete file
  async deleteFile(path: string): Promise<void> {
    await loadStorage();
    const storageInstance = storage();
    
    if (!isFirebaseReady() || !storageInstance || !ref || !deleteObject) {
      throw new Error('Storage not available');
    }
    
    const storageRef = ref(storageInstance, path);
    await deleteObject(storageRef);
  },
};
