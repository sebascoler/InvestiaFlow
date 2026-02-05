import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Eye, Loader as LoaderIcon } from 'lucide-react';
import { InvestorLayout } from '../components/investor/InvestorLayout';
import { InvestorDocumentCard } from '../components/investor/InvestorDocumentCard';
import { DocumentPreview } from '../components/shared/DocumentPreview';
import { Loader } from '../components/shared/Loader';
import { investorDocumentService } from '../services/investorDocumentService';
import { investorAuthService } from '../services/investorAuthService';
import { InvestorDocument } from '../types/investorAuth';

const InvestorDataRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<InvestorDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<{ doc: InvestorDocument; url: string } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!investorAuthService.hasActiveSession()) {
      navigate('/investor/login');
      return;
    }

    loadDocuments();
  }, [navigate]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await investorDocumentService.getInvestorDocuments();
      setDocuments(docs);
    } catch (err: any) {
      console.error('Error loading documents:', err);
      setError(err.message || 'Failed to load documents');
      // If session expired, redirect to login
      if (err.message?.includes('session') || err.message?.includes('authenticated')) {
        investorAuthService.clearInvestorSession();
        navigate('/investor/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (document: InvestorDocument) => {
    try {
      setViewingId(document.id);
      setLoadingPreview(true);
      
      // Get download URL if not available
      let downloadUrl = document.downloadUrl;
      if (!downloadUrl) {
        downloadUrl = await investorDocumentService.getDocumentDownloadUrl(document.documentId);
      }
      
      // Mark as viewed
      await investorDocumentService.markDocumentAsViewed(document.documentId);
      
      // Open preview
      setPreviewDocument({ doc: document, url: downloadUrl });
      
      // Reload documents to update viewed status
      await loadDocuments();
    } catch (err: any) {
      console.error('Error opening preview:', err);
      setError(err.message || 'Failed to open preview');
    } finally {
      setViewingId(null);
      setLoadingPreview(false);
    }
  };

  const handleDownload = async (doc: InvestorDocument) => {
    try {
      setDownloadingId(doc.id);
      
      // Get download URL if not available
      let downloadUrl = doc.downloadUrl;
      if (!downloadUrl) {
        downloadUrl = await investorDocumentService.getDocumentDownloadUrl(doc.documentId);
      }
      
      // Mark as downloaded
      await investorDocumentService.markDocumentAsDownloaded(doc.documentId);
      
      // Force download using fetch + blob (works with cross-origin URLs)
      try {
        const response = await fetch(downloadUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch file');
        }
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = blobUrl;
        link.download = doc.name;
        link.rel = 'noopener noreferrer';
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        // Cleanup blob URL after a delay
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
      } catch (fetchError) {
        // Fallback: open in new tab if fetch fails (CORS issue)
        console.warn('Fetch failed, opening in new tab:', fetchError);
        window.open(downloadUrl, '_blank');
      }
      
      // Reload documents to update downloaded status
      await loadDocuments();
    } catch (err: any) {
      console.error('Error downloading document:', err);
      setError(err.message || 'Failed to download document');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <InvestorLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader size="lg" />
        </div>
      </InvestorLayout>
    );
  }

  return (
    <InvestorLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Room</h1>
        <p className="text-gray-600">
          Documents shared with you
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents available</h3>
          <p className="text-gray-600">
            No documents have been shared with you yet. You will receive an email notification when documents are shared.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {documents.map((doc) => (
            <InvestorDocumentCard
              key={doc.id}
              document={doc}
              onView={() => handleView(doc)}
              onDownload={() => handleDownload(doc)}
            />
          ))}
        </div>
      )}

      {previewDocument && (
        <DocumentPreview
          isOpen={!!previewDocument}
          onClose={() => {
            setPreviewDocument(null);
          }}
          documentUrl={previewDocument.url}
          documentName={previewDocument.doc.name}
          documentType={previewDocument.doc.fileType}
          onViewed={() => {
            // Already marked as viewed in handleView
          }}
        />
      )}
    </InvestorLayout>
  );
};

export default InvestorDataRoomPage;
