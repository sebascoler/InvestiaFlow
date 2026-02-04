import { Document, DocumentPermission, SharedDocument, DocumentCategory } from '../types/document';

// Check if Firebase is configured
const USE_FIREBASE = !!import.meta.env.VITE_FIREBASE_API_KEY;

// Mock data
let documentsDB: Document[] = [
  {
    id: 'doc-1',
    userId: 'user-1',
    name: 'Pitch Deck Q1 2025.pdf',
    category: 'pitch',
    storagePath: '/mock/pitch-deck.pdf',
    uploadedAt: new Date('2025-01-10'),
    fileSize: 2458392,
    fileType: 'application/pdf',
    description: 'Pitch deck actualizado con métricas Q4 2024',
  },
  {
    id: 'doc-2',
    userId: 'user-1',
    name: 'Financial Model 2025.xlsx',
    category: 'financials',
    storagePath: '/mock/financial-model.xlsx',
    uploadedAt: new Date('2025-01-12'),
    fileSize: 1024000,
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    description: 'Modelo financiero proyectado para 2025-2027',
  },
  {
    id: 'doc-3',
    userId: 'user-1',
    name: 'Term Sheet Template.docx',
    category: 'legal',
    storagePath: '/mock/term-sheet.docx',
    uploadedAt: new Date('2025-01-15'),
    fileSize: 512000,
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    description: 'Plantilla de term sheet estándar',
  },
  {
    id: 'doc-4',
    userId: 'user-1',
    name: 'User Metrics Dashboard.pdf',
    category: 'metrics',
    storagePath: '/mock/metrics-dashboard.pdf',
    uploadedAt: new Date('2025-01-18'),
    fileSize: 1536000,
    fileType: 'application/pdf',
    description: 'Dashboard con métricas de usuarios y crecimiento',
  },
  {
    id: 'doc-5',
    userId: 'user-1',
    name: 'Cap Table.xlsx',
    category: 'financials',
    storagePath: '/mock/cap-table.xlsx',
    uploadedAt: new Date('2025-01-20'),
    fileSize: 768000,
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    description: 'Tabla de capitalización actualizada',
  },
  {
    id: 'doc-6',
    userId: 'user-1',
    name: 'Privacy Policy.pdf',
    category: 'legal',
    storagePath: '/mock/privacy-policy.pdf',
    uploadedAt: new Date('2025-01-22'),
    fileSize: 256000,
    fileType: 'application/pdf',
    description: 'Política de privacidad y términos de servicio',
  },
];

let permissionsDB: DocumentPermission[] = [
  {
    id: 'perm-1',
    documentId: 'doc-1',
    requiredStage: 'pitch_shared',
    delayDays: 0,
  },
  {
    id: 'perm-2',
    documentId: 'doc-2',
    requiredStage: 'due_diligence',
    delayDays: 0,
  },
  {
    id: 'perm-3',
    documentId: 'doc-3',
    requiredStage: 'term_sheet',
    delayDays: 0,
  },
  {
    id: 'perm-4',
    documentId: 'doc-4',
    requiredStage: 'pitch_shared',
    delayDays: 0,
  },
];

let sharedDB: SharedDocument[] = [];

const documentServiceMock = {
  async getDocuments(userId: string): Promise<Document[]> {
    return documentsDB.filter(doc => doc.userId === userId);
  },

  async uploadDocument(userId: string, file: File, category: DocumentCategory, description?: string): Promise<Document> {
    // Mock upload (en Firebase será Storage)
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      userId,
      name: file.name,
      category,
      storagePath: `/mock/${file.name}`,
      uploadedAt: new Date(),
      fileSize: file.size,
      fileType: file.type,
      description,
    };
    documentsDB.push(newDoc);
    return newDoc;
  },

  async deleteDocument(id: string): Promise<void> {
    documentsDB = documentsDB.filter(doc => doc.id !== id);
    permissionsDB = permissionsDB.filter(perm => perm.documentId !== id);
    sharedDB = sharedDB.filter(shared => shared.documentId !== id);
  },

  // Permissions
  async getPermissions(documentId: string): Promise<DocumentPermission[]> {
    return permissionsDB.filter(perm => perm.documentId === documentId);
  },

  async setPermissions(documentId: string, permissions: Omit<DocumentPermission, 'id'>[]): Promise<void> {
    // Eliminar permisos anteriores
    permissionsDB = permissionsDB.filter(perm => perm.documentId !== documentId);
    
    // Agregar nuevos
    permissionsDB.push(...permissions.map(perm => ({
      ...perm,
      id: `perm-${Date.now()}-${Math.random()}`,
    })));
  },

  // Shared documents (para analytics)
  async getSharedDocuments(leadId: string): Promise<SharedDocument[]> {
    return sharedDB.filter(shared => shared.leadId === leadId);
  },

  // Obtener todos los SharedDocuments de un documento específico (para ver quién lo abrió)
  async getDocumentShares(documentId: string): Promise<SharedDocument[]> {
    return sharedDB.filter(shared => shared.documentId === documentId);
  },

  // Crear registro cuando se comparte un documento con un lead
  async shareDocumentWithLead(leadId: string, documentId: string): Promise<SharedDocument> {
    // Verificar si ya existe un registro
    const existing = sharedDB.find(
      shared => shared.leadId === leadId && shared.documentId === documentId
    );

    if (existing) {
      return existing;
    }

    const newShared: SharedDocument = {
      id: `shared-${Date.now()}-${Math.random()}`,
      leadId,
      documentId,
      sharedAt: new Date(),
      viewedAt: null,
      downloadedAt: null,
    };

    sharedDB.push(newShared);
    return newShared;
  },

  // Marcar documento como visto
  async markDocumentAsViewed(leadId: string, documentId: string): Promise<void> {
    const shared = sharedDB.find(
      s => s.leadId === leadId && s.documentId === documentId
    );

    if (shared && !shared.viewedAt) {
      shared.viewedAt = new Date();
    }
  },

  // Marcar documento como descargado
  async markDocumentAsDownloaded(leadId: string, documentId: string): Promise<void> {
    const shared = sharedDB.find(
      s => s.leadId === leadId && s.documentId === documentId
    );

    if (shared) {
      shared.downloadedAt = new Date();
      // Si no estaba visto, marcarlo como visto también
      if (!shared.viewedAt) {
        shared.viewedAt = new Date();
      }
    }
  },
};

// Lazy load Firebase service
let firebaseService: any = null;
const getFirebaseService = async () => {
  if (!USE_FIREBASE) return null;
  if (firebaseService) return firebaseService;
  
  try {
    const module = await import('./documentService.firebase');
    firebaseService = module.documentServiceFirebase;
    return firebaseService;
  } catch (error) {
    console.warn('Firebase service not available, using mock:', error);
    return null;
  }
};

// Export service that uses Firebase if available, otherwise mock
export const documentService = {
  async getDocuments(userId: string): Promise<Document[]> {
    const service = await getFirebaseService();
    return service ? service.getDocuments(userId) : documentServiceMock.getDocuments(userId);
  },

  async uploadDocument(userId: string, file: File, category: DocumentCategory, description?: string): Promise<Document> {
    const service = await getFirebaseService();
    return service 
      ? service.uploadDocument(userId, file, category, description)
      : documentServiceMock.uploadDocument(userId, file, category, description);
  },

  async deleteDocument(id: string): Promise<void> {
    const service = await getFirebaseService();
    return service ? service.deleteDocument(id) : documentServiceMock.deleteDocument(id);
  },

  async getPermissions(documentId: string): Promise<DocumentPermission[]> {
    const service = await getFirebaseService();
    return service ? service.getPermissions(documentId) : documentServiceMock.getPermissions(documentId);
  },

  async setPermissions(documentId: string, permissions: Omit<DocumentPermission, 'id'>[]): Promise<void> {
    const service = await getFirebaseService();
    return service 
      ? service.setPermissions(documentId, permissions)
      : documentServiceMock.setPermissions(documentId, permissions);
  },

  async getSharedDocuments(leadId: string): Promise<SharedDocument[]> {
    const service = await getFirebaseService();
    return service 
      ? service.getSharedDocuments(leadId)
      : documentServiceMock.getSharedDocuments(leadId);
  },

  async getDocumentShares(documentId: string): Promise<SharedDocument[]> {
    const service = await getFirebaseService();
    return service 
      ? service.getDocumentShares(documentId)
      : documentServiceMock.getDocumentShares(documentId);
  },

  async shareDocumentWithLead(leadId: string, documentId: string): Promise<SharedDocument> {
    const service = await getFirebaseService();
    return service 
      ? service.shareDocumentWithLead(leadId, documentId)
      : documentServiceMock.shareDocumentWithLead(leadId, documentId);
  },

  async markDocumentAsViewed(leadId: string, documentId: string): Promise<void> {
    const service = await getFirebaseService();
    return service 
      ? service.markDocumentAsViewed(leadId, documentId)
      : documentServiceMock.markDocumentAsViewed(leadId, documentId);
  },

  async markDocumentAsDownloaded(leadId: string, documentId: string): Promise<void> {
    const service = await getFirebaseService();
    return service 
      ? service.markDocumentAsDownloaded(leadId, documentId)
      : documentServiceMock.markDocumentAsDownloaded(leadId, documentId);
  },
};
