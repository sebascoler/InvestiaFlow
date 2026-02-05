import React, { useState, useEffect, memo } from 'react';
import { FileText, Settings, Trash2, Download, BarChart3, Eye, EyeOff } from 'lucide-react';
import { Document } from '../../types/document';
import { formatFileSize } from '../../utils/formatters';
import { formatDate } from '../../utils/formatters';
import { DocumentTracking } from './DocumentTracking';
import { DocumentPreview } from '../shared/DocumentPreview';
import { Modal } from '../shared/Modal';
import { useDocuments } from '../../contexts/DocumentsContext';

interface DocumentCardProps {
  document: Document;
  onConfigurePermissions: () => void;
  onDelete: () => void;
}

const categoryLabels: Record<string, string> = {
  pitch: 'Pitch',
  financials: 'Financials',
  legal: 'Legal',
  metrics: 'Metrics',
  other: 'Other',
};

const categoryColors: Record<string, string> = {
  pitch: 'bg-purple-100 text-purple-800',
  financials: 'bg-green-100 text-green-800',
  legal: 'bg-blue-100 text-blue-800',
  metrics: 'bg-orange-100 text-orange-800',
  other: 'bg-gray-100 text-gray-800',
};

const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('image')) return '🖼️';
  return '📎';
};

export const DocumentCard: React.FC<DocumentCardProps> = memo(({
  document,
  onConfigurePermissions,
  onDelete,
}) => {
  const [showTracking, setShowTracking] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const { getDocumentShares, getDocumentDownloadUrl } = useDocuments();
  const [stats, setStats] = useState({ total: 0, viewed: 0, downloaded: 0 });

  useEffect(() => {
    loadStats();
  }, [document.id]);

  const loadStats = async () => {
    try {
      const shares = await getDocumentShares(document.id);
      setStats({
        total: shares.length,
        viewed: shares.filter(s => s.viewedAt).length,
        downloaded: shares.filter(s => s.downloadedAt).length,
      });
    } catch (error) {
      console.error('Error loading document stats:', error);
    }
  };

  const handlePreview = async () => {
    try {
      setLoadingPreview(true);
      const url = await getDocumentDownloadUrl(document);
      setPreviewUrl(url);
      setShowPreview(true);
    } catch (error) {
      console.error('Error loading preview:', error);
    } finally {
      setLoadingPreview(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all duration-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="text-3xl">{getFileIcon(document.fileType)}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{document.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[document.category]}`}>
                  {categoryLabels[document.category]}
                </span>
                <span className="text-xs text-gray-500">{formatFileSize(document.fileSize)}</span>
              </div>
            </div>
          </div>
        </div>

        {document.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{document.description}</p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              Uploaded {formatDate(document.uploadedAt)}
            </span>
            {stats.total > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 text-gray-600">
                  <Eye size={12} />
                  <span>{stats.viewed}/{stats.total}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Download size={12} />
                  <span>{stats.downloaded}/{stats.total}</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreview}
              disabled={loadingPreview}
              className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Preview"
              aria-label="Preview"
            >
              {loadingPreview ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              ) : (
                <Eye size={16} />
              )}
            </button>
            <button
              onClick={() => setShowTracking(true)}
              className={`p-1.5 rounded transition-colors relative ${
                stats.total > 0
                  ? 'text-primary-600 hover:bg-primary-50'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
              }`}
              title={`View Tracking (${stats.viewed} viewed, ${stats.downloaded} downloaded)`}
              aria-label="View Tracking"
            >
              <BarChart3 size={16} />
              {stats.total > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {stats.total}
                </span>
              )}
            </button>
            <button
              onClick={onConfigurePermissions}
              className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
              title="Configure Permissions"
              aria-label="Configure Permissions"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={async () => {
                try {
                  const url = await getDocumentDownloadUrl(document);
                  window.open(url, '_blank');
                } catch (error) {
                  console.error('Error downloading:', error);
                }
              }}
              className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
              title="Download"
              aria-label="Download"
            >
              <Download size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete"
              aria-label="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showTracking}
        onClose={() => setShowTracking(false)}
        title={`Tracking - ${document.name}`}
        size="lg"
      >
        <DocumentTracking documentId={document.id} />
      </Modal>

      {previewUrl && (
        <DocumentPreview
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setPreviewUrl(null);
          }}
          documentUrl={previewUrl}
          documentName={document.name}
          documentType={document.fileType}
        />
      )}
    </>
  );
}, (prevProps, nextProps) => {
  return prevProps.document.id === nextProps.document.id;
});
