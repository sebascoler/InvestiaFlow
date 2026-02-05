import { StageId } from './stage';

export type DocumentCategory = 'pitch' | 'financials' | 'legal' | 'metrics' | 'other';

export interface Document {
  id: string;
  userId: string; // Owner - kept for backward compatibility
  teamId?: string; // Team that owns this document (new field)
  name: string;
  category: DocumentCategory;
  storagePath: string; // Para Firebase Storage
  uploadedAt: Date;
  fileSize: number;
  fileType: string;
  description?: string;
  downloadUrl?: string; // URL de descarga desde Firebase Storage
}

export interface DocumentPermission {
  id: string;
  documentId: string;
  requiredStage: StageId;
  delayDays: number; // 0 = inmediato
  emailTemplate?: string;
}

export interface SharedDocument {
  id: string;
  leadId: string;
  documentId: string;
  sharedAt: Date;
  viewedAt: Date | null;
  downloadedAt: Date | null;
}
