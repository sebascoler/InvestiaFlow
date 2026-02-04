import React, { useState } from 'react';
import { DocumentList } from '../components/dataroom/DocumentList';
import { UploadModal } from '../components/dataroom/UploadModal';
import { PermissionsConfig } from '../components/dataroom/PermissionsConfig';
import { ToastContainer, ToastType } from '../components/shared/Toast';
import { useDocuments } from '../contexts/DocumentsContext';
import { Document, DocumentCategory } from '../types/document';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const DataRoomPage: React.FC = () => {
  const { documents, loading, uploadDocument, deleteDocument } = useDocuments();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleUpload = async (file: File, category: DocumentCategory, description?: string) => {
    try {
      await uploadDocument(file, category, description);
      addToast(`Document "${file.name}" uploaded successfully`, 'success');
    } catch (error) {
      addToast('Failed to upload document', 'error');
      throw error;
    }
  };

  const handleDelete = async (documentId: string) => {
    const document = documents.find((d) => d.id === documentId);
    if (!document) return;

    if (window.confirm(`Are you sure you want to delete "${document.name}"?`)) {
      try {
        await deleteDocument(documentId);
        addToast(`Document "${document.name}" deleted successfully`, 'success');
      } catch (error) {
        addToast('Failed to delete document', 'error');
      }
    }
  };

  const handleConfigurePermissions = (document: Document) => {
    setSelectedDocument(document);
    setIsPermissionsModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Data Room</h1>
      </div>

      <DocumentList
        documents={documents}
        loading={loading}
        onUpload={() => setIsUploadModalOpen(true)}
        onConfigurePermissions={handleConfigurePermissions}
        onDelete={handleDelete}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      <PermissionsConfig
        isOpen={isPermissionsModalOpen}
        onClose={() => {
          setIsPermissionsModalOpen(false);
          setSelectedDocument(null);
        }}
        document={selectedDocument}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default DataRoomPage;
