import React, { useState } from 'react';
import { FileText, Settings, Trash2, Download, BarChart3 } from 'lucide-react';
import { Document } from '../../types/document';
import { formatFileSize } from '../../utils/formatters';
import { formatDate } from '../../utils/formatters';
import { DocumentTracking } from './DocumentTracking';
import { Modal } from '../shared/Modal';

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

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onConfigurePermissions,
  onDelete,
}) => {
  const [showTracking, setShowTracking] = useState(false);

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
          <span className="text-xs text-gray-500">
            Uploaded {formatDate(document.uploadedAt)}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTracking(true)}
              className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
              title="View Tracking"
              aria-label="View Tracking"
            >
              <BarChart3 size={16} />
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
              onClick={() => {
                // TODO: Implement download in Fase 2 with Firebase Storage
                console.log('Download:', document.name);
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
    </>
  );
};
