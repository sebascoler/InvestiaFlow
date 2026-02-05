import React from 'react';
import { FileText, Download, Eye, CheckCircle2 } from 'lucide-react';
import { InvestorDocument } from '../../types/investorAuth';
import { formatFileSize } from '../../utils/formatters';
import { formatDate } from '../../utils/formatters';
import { Button } from '../shared/Button';

interface InvestorDocumentCardProps {
  document: InvestorDocument;
  onView: () => void;
  onDownload: () => void;
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

export const InvestorDocumentCard: React.FC<InvestorDocumentCardProps> = ({
  document,
  onView,
  onDownload,
}) => {
  const isViewed = !!document.viewedAt;
  const isDownloaded = !!document.downloadedAt;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start gap-4 mb-4">
        <div className="text-4xl">{getFileIcon(document.fileType)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-lg">{document.name}</h3>
            {isViewed && (
              <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" title="Viewed" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[document.category]}`}>
              {categoryLabels[document.category] || document.category}
            </span>
            <span className="text-xs text-gray-500">{formatFileSize(document.fileSize)}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">
              Shared {formatDate(document.sharedAt instanceof Date ? document.sharedAt : new Date(document.sharedAt))}
            </span>
          </div>
        </div>
      </div>

      {document.description && (
        <p className="text-sm text-gray-600 mb-4">{document.description}</p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {isViewed && (
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span>Viewed {formatDate(document.viewedAt instanceof Date ? document.viewedAt : new Date(document.viewedAt!))}</span>
            </div>
          )}
          {isDownloaded && (
            <div className="flex items-center gap-1">
              <Download size={14} />
              <span>Downloaded {formatDate(document.downloadedAt instanceof Date ? document.downloadedAt : new Date(document.downloadedAt!))}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onView}
            className="flex items-center gap-2"
          >
            <Eye size={16} />
            View
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onDownload}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};
