import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Document, DocumentPermission, DocumentCategory, SharedDocument } from '../types/document';
import { documentService } from '../services/documentService';

interface DocumentsContextType {
  documents: Document[];
  loading: boolean;
  error: string | null;
  refreshDocuments: () => Promise<void>;
  uploadDocument: (file: File, category: DocumentCategory, description?: string) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  getPermissions: (documentId: string) => Promise<DocumentPermission[]>;
  setPermissions: (documentId: string, permissions: Omit<DocumentPermission, 'id'>[]) => Promise<void>;
  getSharedDocuments: (leadId: string) => Promise<SharedDocument[]>;
  getDocumentShares: (documentId: string) => Promise<SharedDocument[]>;
  markDocumentAsViewed: (leadId: string, documentId: string) => Promise<void>;
  markDocumentAsDownloaded: (leadId: string, documentId: string) => Promise<void>;
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

export const useDocuments = () => {
  const context = useContext(DocumentsContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentsProvider');
  }
  return context;
};

interface DocumentsProviderProps {
  children: ReactNode;
  userId: string;
}

export const DocumentsProvider: React.FC<DocumentsProviderProps> = ({ children, userId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedDocuments = await documentService.getDocuments(userId);
      setDocuments(fetchedDocuments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDocuments();
  }, [userId]);

  const uploadDocument = async (
    file: File,
    category: DocumentCategory,
    description?: string
  ): Promise<Document> => {
    try {
      setError(null);
      const newDocument = await documentService.uploadDocument(userId, file, category, description);
      await refreshDocuments();
      return newDocument;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteDocument = async (id: string): Promise<void> => {
    try {
      setError(null);
      await documentService.deleteDocument(id);
      await refreshDocuments();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
      setError(errorMessage);
      throw err;
    }
  };

  const getPermissions = async (documentId: string): Promise<DocumentPermission[]> => {
    try {
      return await documentService.getPermissions(documentId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get permissions';
      setError(errorMessage);
      throw err;
    }
  };

  const setPermissions = async (
    documentId: string,
    permissions: Omit<DocumentPermission, 'id'>[]
  ): Promise<void> => {
    try {
      setError(null);
      await documentService.setPermissions(documentId, permissions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set permissions';
      setError(errorMessage);
      throw err;
    }
  };

  const getSharedDocuments = async (leadId: string): Promise<SharedDocument[]> => {
    try {
      return await documentService.getSharedDocuments(leadId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get shared documents';
      setError(errorMessage);
      throw err;
    }
  };

  const getDocumentShares = async (documentId: string): Promise<SharedDocument[]> => {
    try {
      return await documentService.getDocumentShares(documentId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get document shares';
      setError(errorMessage);
      throw err;
    }
  };

  const markDocumentAsViewed = async (leadId: string, documentId: string): Promise<void> => {
    try {
      await documentService.markDocumentAsViewed(leadId, documentId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark as viewed';
      setError(errorMessage);
      throw err;
    }
  };

  const markDocumentAsDownloaded = async (leadId: string, documentId: string): Promise<void> => {
    try {
      await documentService.markDocumentAsDownloaded(leadId, documentId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark as downloaded';
      setError(errorMessage);
      throw err;
    }
  };

  return (
    <DocumentsContext.Provider
      value={{
        documents,
        loading,
        error,
        refreshDocuments,
        uploadDocument,
        deleteDocument,
        getPermissions,
        setPermissions,
        getSharedDocuments,
        getDocumentShares,
        markDocumentAsViewed,
        markDocumentAsDownloaded,
      }}
    >
      {children}
    </DocumentsContext.Provider>
  );
};
