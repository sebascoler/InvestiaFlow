// Firebase implementation of documentService
import { Document, DocumentPermission, SharedDocument, DocumentCategory } from '../types/document';
import { firestoreService, dateToTimestamp, timestampToDate } from '../firebase/firestore';
import { storageService } from '../firebase/storage';

const DOCUMENTS_COLLECTION = 'documents';
const PERMISSIONS_COLLECTION = 'documentPermissions';
const SHARED_COLLECTION = 'sharedDocuments';

// Helper to convert Firestore data to Document
const firestoreToDocument = (data: any): Document => {
  return {
    ...data,
    uploadedAt: timestampToDate(data.uploadedAt) || new Date(),
  } as Document;
};

// Helper to convert Document to Firestore data
const documentToFirestore = (doc: Partial<Document>): any => {
  const data: any = { ...doc };
  
  // Remove undefined fields (Firestore doesn't allow undefined)
  Object.keys(data).forEach(key => {
    if (data[key] === undefined) {
      delete data[key];
    }
  });
  
  // Convert dates to timestamps
  if (data.uploadedAt) data.uploadedAt = dateToTimestamp(data.uploadedAt);
  
  return data;
};

// Helper to convert Firestore data to DocumentPermission
const firestoreToPermission = (data: any): DocumentPermission => {
  return data as DocumentPermission;
};

// Helper to convert Firestore data to SharedDocument
const firestoreToShared = (data: any): SharedDocument => {
  return {
    ...data,
    sharedAt: timestampToDate(data.sharedAt) || new Date(),
    viewedAt: timestampToDate(data.viewedAt),
    downloadedAt: timestampToDate(data.downloadedAt),
  } as SharedDocument;
};

// Helper to convert SharedDocument to Firestore data
const sharedToFirestore = (shared: Partial<SharedDocument>): any => {
  const data: any = { ...shared };
  
  // Remove undefined fields (Firestore doesn't allow undefined)
  Object.keys(data).forEach(key => {
    if (data[key] === undefined) {
      delete data[key];
    }
  });
  
  // Convert dates to timestamps
  if (data.sharedAt) data.sharedAt = dateToTimestamp(data.sharedAt);
  if (data.viewedAt) data.viewedAt = dateToTimestamp(data.viewedAt);
  if (data.downloadedAt) data.downloadedAt = dateToTimestamp(data.downloadedAt);
  
  return data;
};

export const documentServiceFirebase = {
  // Obtener todos los documentos del usuario
  async getDocuments(userId: string): Promise<Document[]> {
    const firebaseFirestore = await import('firebase/firestore');
    const whereFunc = firebaseFirestore.where;
    
    if (!whereFunc) {
      throw new Error('where function not available');
    }
    
    const docs = await firestoreService.getDocs<Document>(
      DOCUMENTS_COLLECTION,
      [whereFunc('userId', '==', userId)]
    );
    return docs.map(firestoreToDocument);
  },

  // Subir documento (usa Firebase Storage)
  async uploadDocument(
    userId: string, 
    file: File, 
    category: DocumentCategory, 
    description?: string
  ): Promise<Document> {
    // Generar ID único
    const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Generar path en Storage: documents/{userId}/{docId}/{filename}
    const storagePath = `documents/${userId}/${docId}/${file.name}`;
    
    try {
      // Subir archivo a Firebase Storage
      const { url } = await storageService.uploadFile(storagePath, file);
      
      // Crear documento en Firestore
      const newDoc: Document = {
        id: docId,
        userId,
        name: file.name,
        category,
        storagePath,
        uploadedAt: new Date(),
        fileSize: file.size,
        fileType: file.type,
        description,
        downloadUrl: url, // Guardar URL de descarga
      };

      const firestoreData = documentToFirestore(newDoc);
      await firestoreService.setDoc(DOCUMENTS_COLLECTION, docId, firestoreData);
      
      return newDoc;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error('Failed to upload document');
    }
  },

  // Eliminar documento (también elimina de Storage)
  async deleteDocument(id: string): Promise<void> {
    try {
      // Obtener documento para obtener storagePath
      const doc = await firestoreService.getDoc<Document>(DOCUMENTS_COLLECTION, id);
      
      if (doc && doc.storagePath) {
        // Eliminar de Storage
        try {
          await storageService.deleteFile(doc.storagePath);
        } catch (storageError) {
          console.warn('Error deleting file from storage:', storageError);
          // Continuar aunque falle Storage, para eliminar de Firestore
        }
      }
      
      // Eliminar documento de Firestore
      await firestoreService.deleteDoc(DOCUMENTS_COLLECTION, id);
      
      // Eliminar permisos relacionados
      const firebaseFirestore = await import('firebase/firestore');
      const whereFunc = firebaseFirestore.where;
      
      if (!whereFunc) {
        throw new Error('where function not available');
      }
      
      const permissions = await firestoreService.getDocs<DocumentPermission>(
        PERMISSIONS_COLLECTION,
        [whereFunc('documentId', '==', id)]
      );
      for (const perm of permissions) {
        await firestoreService.deleteDoc(PERMISSIONS_COLLECTION, perm.id);
      }
      
      // Eliminar sharedDocuments relacionados
      const sharedDocs = await firestoreService.getDocs<SharedDocument>(
        SHARED_COLLECTION,
        [whereFunc('documentId', '==', id)]
      );
      for (const shared of sharedDocs) {
        await firestoreService.deleteDoc(SHARED_COLLECTION, shared.id);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  },

  // Permissions
  async getPermissions(documentId: string): Promise<DocumentPermission[]> {
    const firebaseFirestore = await import('firebase/firestore');
    const where = firebaseFirestore.where;
    const permissions = await firestoreService.getDocs<DocumentPermission>(
      PERMISSIONS_COLLECTION,
      [where('documentId', '==', documentId)]
    );
    return permissions.map(firestoreToPermission);
  },

  async setPermissions(
    documentId: string, 
    permissions: Omit<DocumentPermission, 'id'>[]
  ): Promise<void> {
    // Load where function directly from firebase/firestore
    const firebaseFirestore = await import('firebase/firestore');
    const where = firebaseFirestore.where;
    
    if (!where) {
      throw new Error('where function not available');
    }
    
    // Eliminar permisos anteriores
    const existingPermissions = await firestoreService.getDocs<DocumentPermission>(
      PERMISSIONS_COLLECTION,
      [where('documentId', '==', documentId)]
    );
    
    for (const perm of existingPermissions) {
      await firestoreService.deleteDoc(PERMISSIONS_COLLECTION, perm.id);
    }
    
    // Get document to get userId
    const doc = await firestoreService.getDoc<Document>(DOCUMENTS_COLLECTION, documentId);
    if (!doc) {
      throw new Error('Document not found');
    }

    // Agregar nuevos permisos
    for (const perm of permissions) {
      const permId = `perm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Remove undefined fields before saving
      const permissionData: any = {
        id: permId,
        documentId: perm.documentId,
        requiredStage: perm.requiredStage,
        delayDays: perm.delayDays,
      };
      
      // Only add emailTemplate if it exists
      if (perm.emailTemplate) {
        permissionData.emailTemplate = perm.emailTemplate;
      }
      
      await firestoreService.setDoc(PERMISSIONS_COLLECTION, permId, permissionData);
      
      // Share document with leads that are already in this stage or higher
      try {
        await this.shareDocumentWithLeadsInStage(doc.userId, documentId, perm.requiredStage);
      } catch (error) {
        console.error(`[DocumentService] Error sharing document with leads in stage ${perm.requiredStage}:`, error);
        // Don't throw - permissions are saved, sharing can be retried later
      }
    }
  },

  // Shared documents
  async getSharedDocuments(leadId: string): Promise<SharedDocument[]> {
    const firebaseFirestore = await import('firebase/firestore');
    const whereFunc = firebaseFirestore.where;
    
    if (!whereFunc) {
      throw new Error('where function not available');
    }
    
    const shared = await firestoreService.getDocs<SharedDocument>(
      SHARED_COLLECTION,
      [whereFunc('leadId', '==', leadId)]
    );
    return shared.map(firestoreToShared);
  },

  async getDocumentShares(documentId: string): Promise<SharedDocument[]> {
    const firebaseFirestore = await import('firebase/firestore');
    const whereFunc = firebaseFirestore.where;
    
    if (!whereFunc) {
      throw new Error('where function not available');
    }
    
    const shared = await firestoreService.getDocs<SharedDocument>(
      SHARED_COLLECTION,
      [whereFunc('documentId', '==', documentId)]
    );
    return shared.map(firestoreToShared);
  },

  async shareDocumentWithLead(leadId: string, documentId: string): Promise<SharedDocument> {
    const firebaseFirestore = await import('firebase/firestore');
    const whereFunc = firebaseFirestore.where;
    
    if (!whereFunc) {
      throw new Error('where function not available');
    }
    
    // Verificar si ya existe - buscar todos y filtrar en memoria (Firestore no soporta múltiples where con AND fácilmente)
    const allShared = await firestoreService.getDocs<SharedDocument>(
      SHARED_COLLECTION,
      [whereFunc('leadId', '==', leadId)]
    );
    
    const existing = allShared.find(s => s.documentId === documentId);

    if (existing) {
      return firestoreToShared(existing);
    }

    // Crear nuevo registro
    const sharedId = `shared-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newShared: SharedDocument = {
      id: sharedId,
      leadId,
      documentId,
      sharedAt: new Date(),
      viewedAt: null,
      downloadedAt: null,
    };

    const firestoreData = sharedToFirestore(newShared);
    await firestoreService.setDoc(SHARED_COLLECTION, sharedId, firestoreData);
    
    return newShared;
  },

  async markDocumentAsViewed(leadId: string, documentId: string): Promise<void> {
    const firebaseFirestore = await import('firebase/firestore');
    const whereFunc = firebaseFirestore.where;
    
    if (!whereFunc) {
      throw new Error('where function not available');
    }
    
    const allShared = await firestoreService.getDocs<SharedDocument>(
      SHARED_COLLECTION,
      [whereFunc('leadId', '==', leadId)]
    );
    
    const shared = allShared.find(s => s.documentId === documentId);

    if (shared && !shared.viewedAt) {
      const updated = {
        ...shared,
        viewedAt: new Date(),
      };
      const firestoreData = sharedToFirestore(updated);
      await firestoreService.updateDoc(SHARED_COLLECTION, shared.id, firestoreData);
    }
  },

  async markDocumentAsDownloaded(leadId: string, documentId: string): Promise<void> {
    const firebaseFirestore = await import('firebase/firestore');
    const whereFunc = firebaseFirestore.where;
    
    if (!whereFunc) {
      throw new Error('where function not available');
    }
    
    const allShared = await firestoreService.getDocs<SharedDocument>(
      SHARED_COLLECTION,
      [whereFunc('leadId', '==', leadId)]
    );
    
    const shared = allShared.find(s => s.documentId === documentId);

    if (shared) {
      const updated = {
        ...shared,
        downloadedAt: new Date(),
        // Si no estaba visto, marcarlo como visto también
        viewedAt: shared.viewedAt || new Date(),
      };
      const firestoreData = sharedToFirestore(updated);
      await firestoreService.updateDoc(SHARED_COLLECTION, shared.id, firestoreData);
    }
  },

  // Compartir documento con leads que están en un stage específico o superior
  async shareDocumentWithLeadsInStage(
    userId: string,
    documentId: string,
    requiredStage: StageId
  ): Promise<void> {
    const { leadService } = await import('./leadService');
    const { STAGES } = await import('../types/stage');
    
    // Get leads in this stage or higher
    const eligibleLeads = await leadService.getLeadsByStageOrHigher(userId, requiredStage);
    
    // Share document with each eligible lead
    for (const lead of eligibleLeads) {
      try {
        await this.shareDocumentWithLead(lead.id, documentId);
        console.log(`[DocumentService] Shared document ${documentId} with lead ${lead.name} (${lead.email})`);
      } catch (error) {
        console.error(`[DocumentService] Error sharing document with lead ${lead.id}:`, error);
      }
    }
  },

  // Obtener documentos que deben compartirse para un stage específico
  // (documentos con requiredStage <= currentStage)
  async getDocumentsForStage(userId: string, stageId: StageId): Promise<Document[]> {
    const { STAGES } = await import('../types/stage');
    
    const currentStageOrder = STAGES.find(s => s.id === stageId)?.order ?? -1;
    
    // Get all documents for this user
    const allDocuments = await this.getDocuments(userId);
    
    // Get permissions for each document
    const documentsWithPermissions = await Promise.all(
      allDocuments.map(async (doc) => {
        const permissions = await this.getPermissions(doc.id);
        return { doc, permissions };
      })
    );
    
    // Filter documents that should be shared for this stage
    const eligibleDocuments = documentsWithPermissions
      .filter(({ permissions }) => {
        // Document is eligible if it has at least one permission with requiredStage <= currentStage
        return permissions.some(perm => {
          const permStageOrder = STAGES.find(s => s.id === perm.requiredStage)?.order ?? -1;
          return permStageOrder <= currentStageOrder;
        });
      })
      .map(({ doc }) => doc);
    
    return eligibleDocuments;
  },
};
