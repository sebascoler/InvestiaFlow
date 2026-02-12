import React, { useState, useEffect } from 'react';
import { DocumentList } from '../components/dataroom/DocumentList';
import { UploadModal } from '../components/dataroom/UploadModal';
import { PermissionsConfig } from '../components/dataroom/PermissionsConfig';
import { ToastContainer, ToastType } from '../components/shared/Toast';
import { Tour } from '../components/onboarding/Tour';
import { getTourSteps } from '../utils/onboardingSteps';
import { useOnboarding } from '../hooks/useOnboarding';
import { useDocuments } from '../contexts/DocumentsContext';
import { Document, DocumentCategory } from '../types/document';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const DataRoomPage: React.FC = () => {
  const { documents, loading, uploadDocument, deleteDocument } = useDocuments();
  const { shouldShowTutorial, progress } = useOnboarding();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showTour, setShowTour] = useState(false);

  // Show tour if user should see DataRoom tutorial
  useEffect(() => {
    if (shouldShowTutorial('dataroom') && progress && !progress.completed) {
      const verifyElements = () => {
        const upload = document.querySelector('[data-tour="dataroom-upload"]');
        const docList = document.querySelector('[data-tour="dataroom-document-list"]');
        return upload !== null && docList !== null;
      };
      
      const timer = setTimeout(() => {
        if (verifyElements()) {
          setShowTour(true);
        }
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setShowTour(false);
    }
  }, [shouldShowTutorial, progress]);

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
    <>
      {showTour && (
        <Tour
          steps={getTourSteps('dataroom')}
          tourId="dataroom"
          onComplete={() => setShowTour(false)}
          onSkip={() => setShowTour(false)}
        />
      )}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Data Room</h1>
        </div>

        <div data-tour="dataroom-document-list">
          <DocumentList
            documents={documents}
            loading={loading}
            onUpload={() => setIsUploadModalOpen(true)}
            onConfigurePermissions={handleConfigurePermissions}
            onDelete={handleDelete}
          />
        </div>

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
    </>
  );
};

export default DataRoomPage;
